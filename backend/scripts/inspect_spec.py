"""
Reference spec for data inspection. Used by scripts/inspect_data.py for gap analysis and dashboard design notes.
"""

from typing import Dict, List, TypedDict

# ── Instruments (source of truth) ──

INSTRUMENTS = {
    "general": {
        "name": "General Facility Assessment (Field Version)",
        "platform": "KoboToolbox",
        "status_in_repo": "integrated",
        "env_keys": ["KOBO_API_TOKEN", "KOBO_ASSET_UID", "KOBO_BASE_URL"],
    },
    "sentiment": {
        "name": "Staff Sentiment Survey",
        "platform": "KoboToolbox",
        "status_in_repo": "integrated",
        "env_keys": ["KOBO_SENTIMENT_ASSET_UID", "KOBO_API_TOKEN", "KOBO_BASE_URL"],
    },
    "dla": {
        "name": "Digital Literacy Assessment",
        "platform": "Google Forms",
        "status_in_repo": "not_integrated",
        "env_keys": ["DLA data source (not defined)"],
    },
}

# ── Kobo form domains ──────────────

KOBO_DOMAINS: Dict[str, Dict[str, str]] = {
    "A": {"code": "A", "label": "Facility Metadata", "scored": False},
    "B": {"code": "B_Governance", "label": "Governance", "scored": True},
    "C": {"code": "C_Workforce", "label": "Health Workforce", "scored": True},
    "D": {"code": "D_Infrastructure", "label": "Physical Infrastructure", "scored": True},
    "E": {"code": "E_HealthInformation", "label": "Health Information", "scored": True},
    "F": {"code": "F_DigitalTech", "label": "Digital Technologies", "scored": True},
    "G": {"code": "G_Clinical", "label": "Clinical Service Delivery", "scored": True},
    "H": {"code": "H_SupplyChain", "label": "Inventory & Supply Chain", "scored": True},
    "I": {"code": "I_Financing", "label": "Financing", "scored": True},
    "J": {"code": "J_OperationalSupport", "label": "Operational Support", "scored": True},
}

RUBRIC_DOMAINS: List[Dict[str, object]] = [
    {"code": "D-POW", "label": "Power & Energy", "weight_pct": 25, "kobo_domains": ["D_Infrastructure"]},
    {"code": "D-CON", "label": "Internet & Connectivity", "weight_pct": 20, "kobo_domains": ["D_Infrastructure", "F_DigitalTech"]},
    {"code": "D-ICT", "label": "ICT Hardware & Devices", "weight_pct": 15, "kobo_domains": ["D_Infrastructure"]},
    {"code": "D-DIG", "label": "Digital Literacy & Workforce", "weight_pct": 25, "kobo_domains": ["C_Workforce"], "instruments": ["dla", "general"]},
    {"code": "D-SEN", "label": "Adoption, Sentiment & Governance", "weight_pct": 15, "kobo_domains": ["B_Governance", "F_DigitalTech"], "instruments": ["sentiment", "general"]},
]

# ── Readiness tiers ───────

class TierSpec(TypedDict):
    rubric_name: str
    score_range: str
    current_dashboard_tier: str | None


READINESS_TIERS: List[TierSpec] = [
    {"rubric_name": "Tier 1 — HOS-Ready", "score_range": "≥75%, no blockers", "current_dashboard_tier": "Deployment Ready (≥80%)"},
    {"rubric_name": "Tier 2 — Deployment-Eligible", "score_range": "55–74%, no blockers", "current_dashboard_tier": "Foundational (60–79%)"},
    {"rubric_name": "Tier 3 — Structured Remediation", "score_range": "35–54%, no hard blockers", "current_dashboard_tier": "Not Ready (<60%) — partial overlap"},
    {"rubric_name": "Tier 4 — Not Deployment-Ready", "score_range": "Any blocker", "current_dashboard_tier": "Blocked"},
]

# ── Blockers: BLK codes vs scoring.py ────────

BLOCKER_SPEC = [
    {"code": "BLK-01", "condition": "POW1 = None (no primary power)", "field": "What_is_the_primary_power_sour", "value": "none"},
    {"code": "BLK-02", "condition": "No internet / uptime <50% / download thresholds", "fields": ["Estimated_connectivi_verage_daily_uptime_", "Download_speed_in_Mb_n_speed_test_on_site"]},
    {"code": "BLK-03", "condition": "Zero functional computers + tablets", "fields": ["device_counts"]},
    {"code": "BLK-04", "condition": "DLA <30% + WF6 No + WF7 No", "status_in_repo": "not_implemented"},
    {"code": "BLK-05", "condition": "Management resisting adoption", "status_in_repo": "not_implemented"},
    {"code": "BLK-06", "condition": "Facility not operational", "field": "Is_this_facility_currently_operational"},
]

# ── Identity & geo fields ──────────────

IDENTITY_FIELDS = [
    "Facility_name",
    "County",
    "Heath_District",
    "Health_District",
    "Facility_type",
    "Is_this_facility_currently_operational",
]

GEO_FIELD_PATTERNS = ["_geolocation", "latitude", "longitude", "gps", "meta/instanceID"]

# ── Dashboard views ─────────

DASHBOARD_VIEWS = [
    {
        "id": "national_overview",
        "deliverable": "National Facility Readiness Dashboard",
        "kpis": ["tier distribution", "avg composite", "blocker counts", "completion 37/37"],
        "charts": ["tier donut", "county bar", "domain radar (national avg)"],
        "data_ready": "partial",
    },
    {
        "id": "cluster_regional",
        "deliverable": "Cluster & National Aggregate Analysis",
        "kpis": ["avg score by region/cluster", "DLA avg", "sentiment enthusiasm"],
        "charts": ["cluster comparison", "domain heatmap by cluster"],
        "data_ready": "needs_cluster_mapping",
    },
    {
        "id": "facility_scorecard",
        "deliverable": "Facility Site Assessment Reports",
        "kpis": ["composite", "tier", "blockers", "domain breakdown", "DLA", "sentiment"],
        "data_ready": "partial",
    },
    {
        "id": "ict_gap",
        "deliverable": "ICT Infrastructure Gap Analysis",
        "kpis": ["D-POW/D-CON/D-ICT level distribution", "remediation counts"],
        "charts": ["power/connectivity/device stacked bars"],
        "data_ready": "needs_rubric_domains",
    },
    {
        "id": "dla_training",
        "deliverable": "Digital Literacy & Training Needs",
        "kpis": ["DLA % by facility", "training intensity class", "WF3/WF4"],
        "data_ready": "needs_dla",
    },
    {
        "id": "sentiment_adoption",
        "deliverable": "Staff Adoption & Sentiment",
        "kpis": ["enthusiasm 0-10", "burden modal", "challenge league table"],
        "data_ready": "partial",
    },
    {
        "id": "roadmap",
        "deliverable": "Strategic Roadmap / deployment waves",
        "kpis": ["wave assignment", "blocker resolution pathway"],
        "data_ready": "needs_tier_alignment",
    },
]

EXPECTED_FACILITY_COUNT = 37  # programme facilities in FACILITY_REGISTRY
