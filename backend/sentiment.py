"""
Staff Sentiment Survey — parse Kobo submissions and aggregate per facility.

Form: Facility Staff Sentiment Surve
Links to general assessment via Facility_name (Kobo choice slug).
"""

from __future__ import annotations

from collections import Counter, defaultdict
from statistics import mean
from typing import Any, Dict, List, Optional, TypedDict

from kobo_normalize import normalize_kobo_submission

ENTHUSIASM_FIELD = "Rate_your_enthusiasm_ion_at_this_facility"
MANAGEMENT_FIELD = "How_would_your_descr_ols_at_this_facility"
BURDEN_FIELD = "How_would_you_descri_ing_at_this_facility"
FACILITY_FIELD = "Facility_name"


class FacilitySentimentSummary(TypedDict):
    facility_slug: str
    response_count: int
    avg_enthusiasm: Optional[float]
    enthusiasm_min: Optional[float]
    enthusiasm_max: Optional[float]
    management_engagement_mode: Optional[str]
    burden_perception_mode: Optional[str]
    role_breakdown: Dict[str, int]
    enthusiasm_distribution: Dict[str, int]
    management_distribution: Dict[str, int]
    burden_distribution: Dict[str, int]
    data_in_meetings_distribution: Dict[str, int]
    latest_submitted_at: Optional[str]


DATA_IN_MEETINGS_FIELD = "How_often_is_data_di_and_used_in_meeting"


def _parse_enthusiasm(raw: Any) -> Optional[float]:
    if raw is None or raw == "":
        return None
    try:
        val = float(raw)
    except (TypeError, ValueError):
        return None
    if 0 <= val <= 10:
        return val
    return None


def _mode(counter: Counter[str]) -> Optional[str]:
    if not counter:
        return None
    return counter.most_common(1)[0][0]


def aggregate_by_facility(
    raw_submissions: List[Dict[str, Any]],
) -> Dict[str, FacilitySentimentSummary]:
    """One summary per facility slug (latest-wins not needed; aggregates all responses)."""
    buckets: Dict[str, List[Dict[str, Any]]] = defaultdict(list)

    for row in raw_submissions:
        norm = normalize_kobo_submission(row)
        slug = (norm.get(FACILITY_FIELD) or "").strip()
        if not slug:
            continue
        buckets[slug].append(norm)

    summaries: Dict[str, FacilitySentimentSummary] = {}
    for slug, rows in buckets.items():
        enthusiasm_vals: List[float] = []
        enthusiasm_counter: Counter[str] = Counter()
        mgmt_counter: Counter[str] = Counter()
        burden_counter: Counter[str] = Counter()
        role_counter: Counter[str] = Counter()
        meetings_counter: Counter[str] = Counter()
        latest: Optional[str] = None

        for row in rows:
            ent = _parse_enthusiasm(row.get(ENTHUSIASM_FIELD))
            if ent is not None:
                enthusiasm_vals.append(ent)
                enthusiasm_counter[str(int(ent))] += 1

            mgmt = row.get(MANAGEMENT_FIELD)
            if mgmt:
                mgmt_counter[str(mgmt)] += 1

            burden = row.get(BURDEN_FIELD)
            if burden:
                burden_counter[str(burden)] += 1

            role = row.get("Role_of_respondent")
            if role:
                role_counter[str(role)] += 1

            meetings = row.get(DATA_IN_MEETINGS_FIELD)
            if meetings:
                meetings_counter[str(meetings)] += 1

            submitted = row.get("_submission_time") or row.get("end")
            if submitted and (latest is None or str(submitted) > latest):
                latest = str(submitted)

        summaries[slug] = FacilitySentimentSummary(
            facility_slug=slug,
            response_count=len(rows),
            avg_enthusiasm=round(mean(enthusiasm_vals), 2) if enthusiasm_vals else None,
            enthusiasm_min=min(enthusiasm_vals) if enthusiasm_vals else None,
            enthusiasm_max=max(enthusiasm_vals) if enthusiasm_vals else None,
            management_engagement_mode=_mode(mgmt_counter),
            burden_perception_mode=_mode(burden_counter),
            role_breakdown=dict(role_counter),
            enthusiasm_distribution=dict(enthusiasm_counter),
            management_distribution=dict(mgmt_counter),
            burden_distribution=dict(burden_counter),
            data_in_meetings_distribution=dict(meetings_counter),
            latest_submitted_at=latest,
        )

    return summaries


def build_coverage_report(
    summaries: Dict[str, FacilitySentimentSummary],
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
