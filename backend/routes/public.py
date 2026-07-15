"""
Public dashboard API.
"""

from typing import List, Optional

import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel

from cache import cache
from config import settings
from kobo_normalize import attachment_uid_for_basename
from facility_master import registry_by_slug, county_display
from programme import (
    build_blocker_register,
    build_cluster_overview,
    build_data_quality_report,
    build_dla_overview,
    build_facility_rows,
    build_gap_matrix,
    build_ict_gap,
    build_overview,
    build_roadmap,
    build_sentiment_overview,
    get_facility_by_slug,
)
from master_cache import master_cache
from sentiment_cache import sentiment_cache
from dla_cache import dla_cache
from dla import load_csv_rows
from facility_filters import matches_facility_type

router = APIRouter()

_NOT_READY = HTTPException(
    status_code=503,
    detail="Assessment data is loading — please retry in a few seconds.",
)


def _require_cache() -> None:
    if cache.is_populated or master_cache.is_populated:
        return
    raise _NOT_READY


@router.get("/overview")
def public_overview():
    """National programme KPIs, tiers, counties, clusters, domain averages."""
    _require_cache()
    return build_overview()


@router.get("/facilities")
def public_facilities(
    county: Optional[str] = Query(None),
    tier: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    status: Optional[str] = Query(None, description="complete | not_assessed"),
    facility_type: Optional[str] = Query(None, description="hospital | health_centre | clinic"),
):
    """All programme facilities including those awaiting assessment."""
    _require_cache()
    rows = build_facility_rows()

    if facility_type:
        rows = [r for r in rows if matches_facility_type(r.get("facility_type"), facility_type)]
    if county:
        rows = [r for r in rows if r["county"].lower() == county.lower() or r["county_slug"] == county.lower()]
    if tier:
        rows = [r for r in rows if r["tier"] == tier]
    if region:
        rows = [r for r in rows if r["region"].lower() == region.lower()]
    if status == "complete":
        rows = [r for r in rows if r["assessment_status"] == "complete"]
    elif status == "not_assessed":
        rows = [r for r in rows if r["assessment_status"] != "complete"]

    return {"total": len(rows), "items": rows}


@router.get("/facilities/{slug}")
def public_facility_detail(slug: str):
    _require_cache()
    row = get_facility_by_slug(slug)
    if not row:
        raise HTTPException(status_code=404, detail="Facility not found")
    return row


def _scored_for_slug(slug: str):
    for scored in cache.get():
        if scored.get("facility_slug") == slug:
            return scored
    return None


@router.get("/facilities/{slug}/photo")
async def public_facility_photo(slug: str):
    """Proxy Kobo facility photo (auth stays server-side)."""
    _require_cache()
    row = get_facility_by_slug(slug)
    if not row:
        raise HTTPException(status_code=404, detail="Facility not found")

    scored = _scored_for_slug(slug)
    attachment_uid = scored.get("photo_facility_attachment_uid") if scored else None
    submission_id = row.get("submission_id")
    photo_basename = scored.get("photo_facility") if scored else None

    if not attachment_uid and submission_id is not None and photo_basename:
        attachment_uid = await _fetch_attachment_uid(submission_id, photo_basename)

    if not attachment_uid or submission_id is None:
        raise HTTPException(status_code=404, detail="No facility photo")

    if not settings.kobo_api_token or not settings.kobo_asset_uid:
        raise HTTPException(status_code=503, detail="Photo service unavailable")

    kobo_url = (
        f"{settings.kobo_base_url}/api/v2/assets/{settings.kobo_asset_uid}"
        f"/data/{submission_id}/attachments/{attachment_uid}/medium/"
    )
    headers = {"Authorization": f"Token {settings.kobo_api_token}"}

    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            upstream = await client.get(kobo_url, headers=headers)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Failed to fetch photo") from exc

    if upstream.status_code == 404:
        kobo_url = kobo_url.replace("/medium/", "/")
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            upstream = await client.get(kobo_url, headers=headers)

    if upstream.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to fetch photo")

    content_type = upstream.headers.get("content-type", "image/jpeg")
    return Response(content=upstream.content, media_type=content_type)


async def _fetch_attachment_uid(submission_id: int, basename: str) -> str | None:
    """Resolve attachment uid from a single Kobo submission (legacy cache rows)."""
    if not settings.kobo_api_token or not settings.kobo_asset_uid:
        return None
    url = (
        f"{settings.kobo_base_url}/api/v2/assets/{settings.kobo_asset_uid}"
        f"/data/{submission_id}/"
    )
    headers = {"Authorization": f"Token {settings.kobo_api_token}", "Accept": "application/json"}
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(url, headers=headers)
        if response.status_code != 200:
            return None
        return attachment_uid_for_basename(response.json(), basename)
    except httpx.HTTPError:
        return None


@router.get("/roadmap")
def public_roadmap():
    """Deployment waves, county sequencing, and blocker linkage from master scorecards."""
    _require_cache()
    return build_roadmap()


@router.get("/blockers")
def public_blocker_register():
    """TRIBE deployment blocker register from master workbook."""
    if not master_cache.is_populated:
        if master_cache.last_error:
            raise HTTPException(status_code=503, detail=master_cache.last_error)
        raise _NOT_READY
    return build_blocker_register()


@router.get("/clusters")
def public_clusters():
    """Cluster and regional readiness rollups with DRF domain averages."""
    _require_cache()
    return build_cluster_overview()


@router.get("/infrastructure")
def public_infrastructure():
    """ICT infrastructure gap analysis (D-POW, D-CON, D-ICT) from master scores."""
    _require_cache()
    return build_ict_gap()


@router.get("/gap-matrix")
def public_gap_matrix():
    """B6 gap matrix with facility counts per intervention row."""
    _require_cache()
    return build_gap_matrix()


@router.get("/data-quality")
def public_data_quality():
    """Facilities missing assessments or critical fields."""
    _require_cache()
    return build_data_quality_report()


@router.get("/sentiment")
def public_sentiment_overview():
    """Staff Sentiment Survey aggregates and facility coverage."""
    if not sentiment_cache.is_configured:
        raise HTTPException(
            status_code=503,
            detail="Staff Sentiment Survey not configured (KOBO_SENTIMENT_ASSET_UID).",
        )
    if sentiment_cache.last_error and not sentiment_cache.is_populated:
        raise HTTPException(status_code=503, detail=sentiment_cache.last_error)
    return build_sentiment_overview()


@router.get("/sentiment/{slug}")
def public_sentiment_facility(slug: str):
    if not sentiment_cache.is_populated:
        raise HTTPException(status_code=503, detail="Sentiment data is loading.")
    row = sentiment_cache.get(slug)
    if not row:
        raise HTTPException(status_code=404, detail="No sentiment responses for this facility.")
    reg = registry_by_slug().get(slug)
    if not reg:
        return {
            **row,
            "facility_name": slug.replace("_", " ").title(),
            "county": None,
            "district": None,
            "region": None,
        }
    return {
        **row,
        "facility_name": reg["name"],
        "county": county_display(reg["county"]),
        "district": reg["district"].replace("_", " ").title() if reg["district"] else None,
        "region": reg["region"],
    }


@router.get("/dla")
def public_dla_overview():
    """Digital Literacy Assessment aggregates and facility coverage."""
    if not dla_cache.is_configured:
        raise HTTPException(
            status_code=503,
            detail="Digital Literacy Assessment CSV not found (DLA_CSV_PATH).",
        )
    if dla_cache.last_error and not dla_cache.is_populated:
        raise HTTPException(status_code=503, detail=dla_cache.last_error)
    return build_dla_overview()
_DLA_QUESTION_ANSWERS: List[tuple[str, str]] = [
    ("1. Which of the following devices is a tablet?", "A"),
    ("2. Which of the following is an example of an email address? ", "healthworker@moh.gov.lr"),
    ("3. Which of the following devices is a computer?", "B"),
    ("4. Which of the following shows the button used to turn on the computer?", "C"),
    ("5. You can send a file or photo as an attachment in an email.", "TRUE"),
    (
        "6. Which of the following is the BEST practice when entering data into a health form?",
        "Enter data as soon as possible after the patient visit, while information is fresh",
    ),
    (
        "7. Why is it important to enter patient data accurately into a digital health system?",
        "To ensure correct treatment decisions and reliable health reports",
    ),
    (
        "8. You receive an email asking you to click a link and enter your password urgently. What should you do?",
        "Ignore it and delete it - it is likely a phishing attempt",
    ),
    ("9. Turning a device off and on again (restarting) can fix many common software problems.", "TRUE"),
    ("10. What is a web browser?", "A tool used to access and view websites on the internet"),
]

# Pre-compute (raw_col, stripped_col, correct_answer) triples used at request time.
_DLA_QUESTION_ANSWERS_NORMALIZED: List[tuple[str, str, str]] = [
    (col, col.strip(), correct)
    for col, correct in _DLA_QUESTION_ANSWERS
]


class DlaQuestionStat(BaseModel):
    questionNumber: int
    questionText: str
    correctCount: int
    totalResponses: int
    correctRate: float


class DlaQuestionsResponse(BaseModel):
    questions: List[DlaQuestionStat]


@router.get("/dla/questions", response_model=DlaQuestionsResponse)
def public_dla_questions() -> DlaQuestionsResponse:
    """Per-question correct-answer rates across all DLA respondents."""
    if not dla_cache.is_configured:
        raise HTTPException(
            status_code=503,
            detail="Digital Literacy Assessment CSV not found (DLA_CSV_PATH).",
        )

    rows = load_csv_rows(dla_cache.csv_path)
    if not rows:
        return DlaQuestionsResponse(questions=[])

    # Build a normalised header → original-header lookup from the actual CSV so
    # trailing-whitespace variants in the file are handled transparently.
    sample_headers = list(rows[0].keys())
    stripped_to_actual: dict[str, str] = {h.strip(): h for h in sample_headers}

    stats: List[DlaQuestionStat] = []
    for idx, (col_raw, col_stripped, correct_answer) in enumerate(
        _DLA_QUESTION_ANSWERS_NORMALIZED, start=1
    ):
        # Resolve the actual CSV column name (handles trailing-space variants).
        actual_col = stripped_to_actual.get(col_stripped, col_raw)

        correct_count = 0
        total = 0
        for row in rows:
            answer = row.get(actual_col)
            if answer is None or answer == "":
                continue
            total += 1
            if answer.strip() == correct_answer.strip():
                correct_count += 1

        correct_rate = round(correct_count / total * 100, 1) if total > 0 else 0.0
        stats.append(
            DlaQuestionStat(
                questionNumber=idx,
                questionText=col_stripped,
                correctCount=correct_count,
                totalResponses=total,
                correctRate=correct_rate,
            )
        )

    return DlaQuestionsResponse(questions=stats)


@router.get("/dla/{slug}")
def public_dla_facility(slug: str):
    if not dla_cache.is_populated:
        raise HTTPException(status_code=503, detail="DLA data is loading.")
    row = dla_cache.get(slug)
    if not row:
        raise HTTPException(status_code=404, detail="No DLA responses for this facility.")
    reg = registry_by_slug().get(slug)
    if not reg:
        return {
            **row,
            "facility_name": slug.replace("_", " ").title(),
            "county": None,
            "district": None,
            "region": None,
        }
    return {
        **row,
        "facility_name": reg["name"],
        "county": county_display(reg["county"]),
        "district": reg["district"].replace("_", " ").title() if reg["district"] else None,
        "region": reg["region"],
    }


@router.get("/meta")
def public_meta():
    sentiment_status = "disabled"
    if sentiment_cache.is_configured:
        sentiment_status = "live" if sentiment_cache.is_populated else "loading"

    dla_status = "disabled"
    if dla_cache.is_configured:
        dla_status = "live" if dla_cache.is_populated else "loading"

    return {
        "title": "Connected Facilities — Readiness Dashboard",
        "programme": "Connected Facilities Baseline Assessment",
        "instruments": [
            {"id": "general", "name": "General Facility Assessment", "status": "live"},
            {
                "id": "sentiment",
                "name": sentiment_cache.form_name or "Staff Sentiment Survey",
                "status": sentiment_status,
            },
            {"id": "dla", "name": "Digital Literacy Assessment", "status": dla_status},
        ],
        "cache_populated": cache.is_populated or master_cache.is_populated,
        "last_refreshed": cache.last_refreshed.isoformat() if cache.last_refreshed else None,
        "master_cache_populated": master_cache.is_populated,
        "master_last_refreshed": (
            master_cache.last_refreshed.isoformat() if master_cache.last_refreshed else None
        ),
        "master_source_path": master_cache.source_path(),
        "sentiment_cache_populated": sentiment_cache.is_populated,
        "sentiment_last_refreshed": (
            sentiment_cache.last_refreshed.isoformat() if sentiment_cache.last_refreshed else None
        ),
        "dla_cache_populated": dla_cache.is_populated,
        "dla_last_refreshed": (
            dla_cache.last_refreshed.isoformat() if dla_cache.last_refreshed else None
        ),
    }
