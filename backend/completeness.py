"""
Data quality/completeness checks per facility.
"""

from typing import Any, Dict, List, Optional

from kobo_normalize import normalize_kobo_submission, total_functional_devices

# Critical fields for public dashboard & deployment decisions
CRITICAL_FIELDS: List[Dict[str, str]] = [
    {"key": "Facility_name", "label": "Facility identity"},
    {"key": "County", "label": "County"},
    {"key": "Health_District", "label": "Health district"},
    {"key": "Facility_type", "label": "Facility type"},
    {"key": "Is_this_facility_currently_operational", "label": "Operational status"},
    {"key": "What_is_the_primary_power_sour", "label": "Primary power"},
    {"key": "What_backup_power_systems_are_", "label": "Backup power"},
    {"key": "Estimated_connectivi_verage_daily_uptime_", "label": "Internet uptime %"},
    {"key": "Download_speed_in_Mb_n_speed_test_on_site", "label": "Download speed"},
    {"key": "Upload_speed_in_Mbps_n_speed_test_on_site", "label": "Upload speed"},
    {"key": "What_percentage_of_s_in_the_last_12_month", "label": "Staff digital training %"},
    {"key": "Do_clinicians_docume_ctly_in_digital_tool", "label": "Clinician direct documentation"},
    {"key": "Is_there_a_dedicated_ble_at_this_facility", "label": "Dedicated IT support"},
    {"key": "_geolocation", "label": "GPS coordinates"},
]

HIGH_PRIORITY_SCORE_FIELDS = [
    "What_is_the_primary_power_sour",
    "What_backup_power_systems_are_",
    "How_would_you_descri_digital_health_tools",
    "How_is_the_facility_perational_stability",
    "What_percentage_of_s_in_the_last_12_month",
    "Do_clinicians_docume_ctly_in_digital_tool",
    "Is_there_a_dedicated_ble_at_this_facility",
]


def _filled(submission: Dict[str, Any], key: str) -> bool:
    if key == "_geolocation":
        geo = submission.get("_geolocation") or submission.get("GPS_coordinates_Enumerator")
        return geo is not None and geo != "" and geo != []
    val = submission.get(key)
    if key == "Health_District" and not val:
        val = submission.get("Heath_District")
    if key == "Estimated_connectivi_verage_daily_uptime_" and not val:
        val = submission.get("Estimated_connectivity_average")
    if val is None or val == "" or val == []:
        return False
    return True


def assess_completeness(
    raw_submission: Optional[Dict[str, Any]],
    scored: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    if not raw_submission:
        return {
            "status": "not_assessed",
            "completeness_pct": 0.0,
            "missing_fields": [f["label"] for f in CRITICAL_FIELDS],
            "missing_count": len(CRITICAL_FIELDS),
            "has_gps": False,
            "has_devices": False,
            "high_priority_gaps": [],
            "confidence": "none",
        }

    sub = normalize_kobo_submission(raw_submission)
    missing = [f["label"] for f in CRITICAL_FIELDS if not _filled(sub, f["key"])]
    filled_count = len(CRITICAL_FIELDS) - len(missing)
    pct = round(100 * filled_count / len(CRITICAL_FIELDS), 1)

    high_gaps = [f for f in HIGH_PRIORITY_SCORE_FIELDS if not _filled(sub, f)]

    has_devices = total_functional_devices(sub) > 0
    has_gps = _filled(sub, "_geolocation")

    if pct >= 90 and not high_gaps:
        confidence = "high"
    elif pct >= 70:
        confidence = "medium"
    else:
        confidence = "low"

    return {
        "status": "assessed",
        "completeness_pct": pct,
        "missing_fields": missing,
        "missing_count": len(missing),
        "has_gps": has_gps,
        "has_devices": has_devices,
        "high_priority_gaps": high_gaps,
        "confidence": confidence,
    }


def assess_completeness_from_scored(scored: Dict[str, Any]) -> Dict[str, Any]:
    """Completeness when only scored cache row is available."""
    checks = [
        ("Facility identity", scored.get("facility_name")),
        ("County", scored.get("county")),
        ("Primary power", scored.get("primary_power")),
        ("Backup power", scored.get("backup_power")),
        ("Internet uptime %", scored.get("internet_uptime")),
        ("Internet availability", scored.get("internet_type")),
        ("Download speed", scored.get("download_mbps")),
        ("Upload speed", scored.get("upload_mbps")),
        ("GPS coordinates", scored.get("latitude")),
        ("Device inventory", (scored.get("laptops") or 0) + (scored.get("desktops") or 0) + (scored.get("tablets") or 0) + (scored.get("phones") or 0)),
    ]
    missing = [label for label, val in checks if val in (None, "", 0)]
    filled = len(checks) - len(missing)
    pct = round(100 * filled / len(checks), 1)
    if pct >= 85:
        confidence = "high"
    elif pct >= 65:
        confidence = "medium"
    else:
        confidence = "low"
    return {
        "status": "assessed",
        "completeness_pct": pct,
        "missing_fields": missing,
        "missing_count": len(missing),
        "has_gps": scored.get("latitude") is not None,
        "has_devices": ((scored.get("laptops") or 0) + (scored.get("desktops") or 0) + (scored.get("tablets") or 0) + (scored.get("phones") or 0)) > 0,
        "high_priority_gaps": [],
        "confidence": confidence,
    }
