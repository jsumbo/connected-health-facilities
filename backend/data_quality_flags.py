"""
Per-facility data quality gates.
"""

from typing import Any, Dict, List, Optional

from drf import BLOCKER_REMEDIATION, blocker_display_label

MIN_INSTRUMENT_N = 3
ADOPTION_RISK_ENTHUSIASM_MAX = 5.0


def effective_sentiment_n(facility_row: Dict[str, Any]) -> int:
    master_n = facility_row.get("master_sentiment_n")
    if master_n is not None:
        return int(master_n)
    return int(facility_row.get("sentiment_response_count") or 0)


def effective_dla_n(facility_row: Dict[str, Any]) -> int:
    master_n = facility_row.get("master_dla_n")
    if master_n is not None:
        return int(master_n)
    return int(facility_row.get("dla_response_count") or 0)


def _flag(
    code: str,
    *,
    label: str,
    detail: str,
    severity: str = "warning",
) -> Dict[str, str]:
    return {
        "code": code,
        "label": label,
        "detail": detail,
        "severity": severity,
    }


def _is_burdensome(burden_mode: Optional[str]) -> bool:
    if not burden_mode:
        return False
    normalized = str(burden_mode).lower().replace("_", " ")
    return "burdensome" in normalized


def assess_instrument_flags(facility_row: Dict[str, Any]) -> List[Dict[str, str]]:
    """Return A2 instrument confidence and adoption risk flags for one facility row."""
    flags: List[Dict[str, str]] = []

    sentiment_n = effective_sentiment_n(facility_row)
    has_sentiment = (
        facility_row.get("sentiment_status") == "complete"
        or sentiment_n > 0
        or facility_row.get("master_sentiment_n") is not None
    )
    if has_sentiment and sentiment_n < MIN_INSTRUMENT_N:
        flags.append(
            _flag(
                "sentiment_insufficient",
                label="Sentiment indicative only",
                detail=f"n={sentiment_n} (minimum {MIN_INSTRUMENT_N} for full confidence)",
            )
        )

    dla_n = effective_dla_n(facility_row)
    has_dla = (
        facility_row.get("dla_status") == "complete"
        or dla_n > 0
        or facility_row.get("master_dla_n") is not None
    )
    if has_dla and dla_n < MIN_INSTRUMENT_N:
        flags.append(
            _flag(
                "dla_insufficient",
                label="DLA sample too small",
                detail=f"n={dla_n} (minimum {MIN_INSTRUMENT_N} for full D-DIG weight)",
            )
        )
        if dla_n > 0:
            flags.append(
                _flag(
                    "dla_indicative_only",
                    label="DLA indicative only",
                    detail=f"n={dla_n} — D-DIG scored at reduced confidence",
                )
            )

    enthusiasm = facility_row.get("sentiment_avg_enthusiasm")
    burden_mode = facility_row.get("sentiment_burden_mode")
    if (
        has_sentiment
        and enthusiasm is not None
        and float(enthusiasm) < ADOPTION_RISK_ENTHUSIASM_MAX
        and _is_burdensome(burden_mode)
    ):
        flags.append(
            _flag(
                "adoption_risk",
                label="Adoption risk",
                detail=(
                    f"Enthusiasm {float(enthusiasm):.1f}/10 with burdensome documentation burden"
                ),
                severity="warning",
            )
        )

    blocker_codes = facility_row.get("blocker_codes") or []
    if "BLK-06" in blocker_codes:
        flags.append(
            _flag(
                "operational_blocker",
                label=blocker_display_label("BLK-06"),
                detail=BLOCKER_REMEDIATION.get(
                    "BLK-06",
                    "Facility not operational — exclude from deployment planning",
                ),
                severity="critical",
            )
        )

    return flags


def instrument_confidence_summary(rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    """National rollup for sentiment/DLA instrument confidence."""
    sentiment_sufficient = 0
    sentiment_indicative = 0
    dla_sufficient = 0
    dla_indicative = 0
    sentiment_mismatches: List[Dict[str, Any]] = []
    dla_mismatches: List[Dict[str, Any]] = []

    for row in rows:
        master_s = row.get("master_sentiment_n")
        live_s = int(row.get("sentiment_response_count") or 0)
        effective_s = effective_sentiment_n(row)
        if master_s is not None and live_s > 0 and int(master_s) != live_s:
            sentiment_mismatches.append(
                {
                    "slug": row["slug"],
                    "name": row["name"],
                    "master_n": int(master_s),
                    "live_n": live_s,
                }
            )
        if effective_s >= MIN_INSTRUMENT_N:
            sentiment_sufficient += 1
        elif effective_s > 0 or row.get("sentiment_status") == "complete":
            sentiment_indicative += 1

        master_d = row.get("master_dla_n")
        live_d = int(row.get("dla_response_count") or 0)
        effective_d = effective_dla_n(row)
        if master_d is not None and live_d > 0 and int(master_d) != live_d:
            dla_mismatches.append(
                {
                    "slug": row["slug"],
                    "name": row["name"],
                    "master_n": int(master_d),
                    "live_n": live_d,
                }
            )
        if effective_d >= MIN_INSTRUMENT_N:
            dla_sufficient += 1
        elif effective_d > 0 or row.get("dla_status") == "complete":
            dla_indicative += 1

    return {
        "min_n": MIN_INSTRUMENT_N,
        "sentiment_sufficient_count": sentiment_sufficient,
        "sentiment_indicative_count": sentiment_indicative,
        "dla_sufficient_count": dla_sufficient,
        "dla_indicative_count": dla_indicative,
        "sentiment_master_live_mismatch_count": len(sentiment_mismatches),
        "dla_master_live_mismatch_count": len(dla_mismatches),
        "sentiment_master_live_mismatches": sentiment_mismatches,
        "dla_master_live_mismatches": dla_mismatches,
    }
