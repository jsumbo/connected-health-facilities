"""
Digital Literacy Assessment — parse CSV responses and aggregate per facility.
"""

from __future__ import annotations

import csv
import re
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from statistics import mean
from typing import Any, Dict, List, Optional, TypedDict

from facility_master import FACILITY_REGISTRY, registry_by_slug

FACILITY_NAME_FIELD = "Name of Facility"
SCORE_FIELD = "Score"
TIMESTAMP_FIELD = "Timestamp"
ROLE_FIELD = "Role of respondent"
ADMIN_FIELD = "How was this assessment administered?"

# CSV display name → registry slug (slugify alone is insufficient).
FACILITY_NAME_ALIASES: Dict[str, str] = {
    "dr agnes varis health center": "dr__agnes_varis_health_center",
    "foya  health center": "foya_health_center",
    "waho  health center": "waho_health_center",
}


class FacilityDlaSummary(TypedDict):
    facility_slug: str
    response_count: int
    avg_score: Optional[float]
    score_min: Optional[float]
    score_max: Optional[float]
    role_breakdown: Dict[str, int]
    administration_breakdown: Dict[str, int]
    latest_submitted_at: Optional[str]
    confidence: str


def _normalize_name(name: str) -> str:
    return re.sub(r"\s+", " ", name.strip().lower())


def slugify_facility_name(name: str) -> str:
    """Convert a human facility label to a Kobo-style slug."""
    s = name.strip().lower()
    s = s.replace(".", "")
    s = re.sub(r"['']", "", s)
    s = re.sub(r"\s+", "_", s)
    s = re.sub(r"[^a-z0-9_]", "", s)
    return s


def _build_name_lookup() -> Dict[str, str]:
    lookup: Dict[str, str] = {}
    for reg in FACILITY_REGISTRY:
        lookup[_normalize_name(reg["name"])] = reg["slug"]
    lookup.update(FACILITY_NAME_ALIASES)
    return lookup


_NAME_TO_SLUG = _build_name_lookup()
_REGISTRY_SLUGS = set(registry_by_slug().keys())


def resolve_facility_slug(facility_name: str) -> Optional[str]:
    """Map CSV facility name to programme registry slug."""
    if not facility_name or not facility_name.strip():
        return None

    normalized = _normalize_name(facility_name)
    if normalized in _NAME_TO_SLUG:
        return _NAME_TO_SLUG[normalized]

    slug = slugify_facility_name(facility_name)
    if slug in _REGISTRY_SLUGS:
        return slug

    return None


def parse_score(raw: Any) -> Optional[float]:
    """Parse score values like ``80 / 100`` or plain numbers."""
    if raw is None or raw == "":
        return None

    text = str(raw).strip()
    match = re.match(r"^(\d+(?:\.\d+)?)\s*/\s*100$", text)
    if match:
        val = float(match.group(1))
        return val if 0 <= val <= 100 else None

    try:
        val = float(text)
    except (TypeError, ValueError):
        return None

    return val if 0 <= val <= 100 else None


def _parse_timestamp(raw: Any) -> Optional[str]:
    if raw is None or raw == "":
        return None
    text = str(raw).strip()
    for fmt in ("%m/%d/%Y %H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(text, fmt).isoformat()
        except ValueError:
            continue
    return text


def load_csv_rows(path: Path) -> List[Dict[str, str]]:
    if not path.is_file():
        return []
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def aggregate_by_facility(rows: List[Dict[str, Any]]) -> Dict[str, FacilityDlaSummary]:
    """One summary per facility slug (aggregates all responses)."""
    buckets: Dict[str, List[Dict[str, Any]]] = defaultdict(list)

    for row in rows:
        slug = resolve_facility_slug(str(row.get(FACILITY_NAME_FIELD) or ""))
        if not slug:
            continue
        buckets[slug].append(row)

    summaries: Dict[str, FacilityDlaSummary] = {}
    for slug, facility_rows in buckets.items():
        score_vals: List[float] = []
        role_counter: Counter[str] = Counter()
        admin_counter: Counter[str] = Counter()
        latest: Optional[str] = None

        for row in facility_rows:
            score = parse_score(row.get(SCORE_FIELD))
            if score is not None:
                score_vals.append(score)

            role = row.get(ROLE_FIELD)
            if role:
                role_counter[str(role).strip()] += 1

            admin = row.get(ADMIN_FIELD)
            if admin:
                admin_counter[str(admin).strip()] += 1

            submitted = _parse_timestamp(row.get(TIMESTAMP_FIELD))
            if submitted and (latest is None or submitted > latest):
                latest = submitted

        n = len(facility_rows)
        summaries[slug] = FacilityDlaSummary(
            facility_slug=slug,
            response_count=n,
            avg_score=round(mean(score_vals), 1) if score_vals else None,
            score_min=min(score_vals) if score_vals else None,
            score_max=max(score_vals) if score_vals else None,
            role_breakdown=dict(role_counter),
            administration_breakdown=dict(admin_counter),
            latest_submitted_at=latest,
            confidence="full" if n >= 3 else "indicative",
        )

    return summaries


def build_coverage_report(
    summaries: Dict[str, FacilityDlaSummary],
    registry_slugs: List[str],
) -> Dict[str, Any]:
    reg_set = set(registry_slugs)
    covered = set(summaries.keys())
    return {
        "registry_count": len(reg_set),
        "facilities_with_responses": len(covered & reg_set),
        "missing_from_survey": sorted(reg_set - covered),
        "extras_not_in_registry": sorted(covered - reg_set),
        "total_responses": sum(s["response_count"] for s in summaries.values()),
    }
