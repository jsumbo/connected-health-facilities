

from typing import Any, Dict, List, TypedDict


class DrfDomainSpec(TypedDict):
    key: str
    code: str
    label: str
    weight_pct: int


DRF_DOMAINS: List[DrfDomainSpec] = [
    {"key": "D_POW", "code": "D-POW", "label": "Power & Energy", "weight_pct": 22},
    {"key": "D_CON", "code": "D-CON", "label": "Internet & Connectivity", "weight_pct": 18},
    {"key": "D_ICT", "code": "D-ICT", "label": "ICT Hardware & Devices", "weight_pct": 13},
    {"key": "D_DIG", "code": "D-DIG", "label": "Digital Literacy & Workforce", "weight_pct": 22},
    {"key": "D_SEN", "code": "D-SEN", "label": "Adoption, Sentiment & Governance", "weight_pct": 15},
    {"key": "D_DAT", "code": "D-DAT", "label": "Data Maturity & Health Information", "weight_pct": 10},
]

DRF_DOMAIN_KEYS = [d["key"] for d in DRF_DOMAINS]

BLOCKER_LABELS: Dict[str, str] = {
    "BLK-01": "No primary power",
    "BLK-02": "No connectivity / <2 Mbps",
    "BLK-03": "Zero computers or tablets",
    "BLK-04": "Not reporting to DHIS2",
    "BLK-05": "No IT support",
    "BLK-06": "Not operational",
}

BLOCKER_REMEDIATION: Dict[str, str] = {
    "BLK-01": "Solar/grid + UPS at critical workstations (procurement)",
    "BLK-02": "Fixed connectivity or offline-first tooling; bandwidth upgrade (procurement)",
    "BLK-03": "Device procurement per service point (registration, consultation, pharmacy)",
    "BLK-04": "Re-establish DHIS2/national HIS reporting; data-clerk support (in-scope)",
    "BLK-05": "Assign or share IT support across ≤5 facilities (in-scope or procurement)",
    "BLK-06": "Facility not operational — MoH follow-up; exclude from deployment planning",
}


def blocker_display_label(code: str) -> str:
    label = BLOCKER_LABELS.get(code, "Unknown blocker")
    return f"{code}: {label}"


def normalize_facility_name(name: str) -> str:
    return " ".join(str(name or "").split()).strip()


def parse_blocker_codes(raw: str) -> List[str]:
    if not raw or not str(raw).strip() or str(raw).strip() in ("—", "-"):
        return []
    import re

    return sorted(set(re.findall(r"BLK-\d{2}", str(raw).upper())))


def tier_display_label(tier: str, wave: str | None = None) -> str:
    tier = (tier or "").strip()
    wave = (wave or "").strip()

    if tier == "Tier 1":
        return "Tier 1 — HOS-Ready"
    if tier == "Tier 2" and wave == "Wave 3":
        return "Tier 2 — Structured Remediation"
    if tier == "Tier 2":
        return "Tier 2 — Deployment-Eligible"
    if tier == "Tier 3":
        return "Tier 3 — Not Deployment-Ready"
    return tier or "Not Assessed"


def build_drf_domain_scores(raw: Dict[str, int | None]) -> Dict[str, Dict[str, Any]]:
    scores: Dict[str, Dict[str, Any]] = {}
    for spec in DRF_DOMAINS:
        score = raw.get(spec["key"])
        tier_label = tier_display_label(
            "Tier 3" if score == 0 else "Tier 2" if score == 1 else "Tier 1" if score == 3 else "Tier 2"
        )
        scores[spec["key"]] = {
            "code": spec["code"],
            "label": spec["label"],
            "weight_pct": spec["weight_pct"],
            "score": score,
            "max_score": 3,
            "tier": tier_label if score is not None else "Not Assessed",
        }
    return scores


def enrich_blockers(codes: List[str], remediation_text: str | None = None) -> List[Dict[str, str]]:
    items: List[Dict[str, str]] = []
    for code in codes:
        items.append({
            "code": code,
            "remediation": BLOCKER_REMEDIATION.get(code, remediation_text or "See gap matrix"),
        })
    return items


def normalize_composite_percent(score: float | None) -> float | None:
    """Map composite readiness to 0–100 (handles Excel fractions and 0–10 scales)."""
    if score is None:
        return None
    try:
        value = float(score)
    except (TypeError, ValueError):
        return None
    if not (value == value):  # NaN
        return None
    if 0 < value <= 1:
        return round(value * 100, 1)
    if 1 < value <= 10:
        return round(value * 10, 1)
    return round(value, 1)
