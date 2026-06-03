"""
Normalize KoboToolbox API payloads for scoring.

Kobo v2 JSON exports nest answers under group paths (e.g. group_xxx/Facility_name).
The scoring engine expects flat XLSForm field names. This module flattens groups
and maps renamed fields from the current form version.
"""

from typing import Any, Dict, List, Optional

# Current form device counts (truncated names in Kobo export)
_DEVICE_COUNT_FIELDS: List[str] = [
    "Total_number_of_func_ed_and_used_by_staff",
    "Total_number_of_func_ed_and_used_by_staff_001",
    "Total_number_of_func_ed_and_used_by_staff_002",
    "Total_number_of_func_ed_and_used_by_staff_003",
    "Total_number_of_func_ed_and_used_by_staff_004",
    "Total_number_of_func_ed_and_used_by_staff_005",
]

# Legacy names still referenced in scoring.py / docs
_LEGACY_DEVICE_FIELDS: List[str] = [
    "Total_number_of_functional_laptops",
    "Total_number_of_functional_desktops",
    "Total_number_of_functional_tablets",
    "Total_number_of_functional_phones",
]


def flatten_kobo_submission(submission: Dict[str, Any]) -> Dict[str, Any]:
    """Merge group-prefixed keys into a flat dict (group_x/Field → Field)."""
    flat: Dict[str, Any] = dict(submission)
    for key, value in submission.items():
        if "/" not in key:
            continue
        short = key.rsplit("/", 1)[-1]
        if short not in flat or flat[short] in (None, "", []):
            flat[short] = value
    return flat


def _first_int(submission: Dict[str, Any], *fields: str) -> Optional[int]:
    for field in fields:
        raw = submission.get(field)
        if raw is None or raw == "":
            continue
        try:
            return int(float(raw))
        except (TypeError, ValueError):
            continue
    return None


def apply_field_aliases(submission: Dict[str, Any]) -> Dict[str, Any]:
    """Copy current-form field names onto legacy names the scorer expects."""
    out = dict(submission)

    if out.get("Heath_District") in (None, "") and out.get("Health_District"):
        out["Heath_District"] = out["Health_District"]

    # Form v2 connectivity group (group_vp7dd35) renamed uptime field
    if out.get("Estimated_connectivi_verage_daily_uptime_") in (None, ""):
        uptime = out.get("Estimated_connectivity_average")
        if uptime not in (None, ""):
            out["Estimated_connectivi_verage_daily_uptime_"] = uptime

    for legacy, current in zip(_LEGACY_DEVICE_FIELDS, _DEVICE_COUNT_FIELDS):
        if out.get(legacy) in (None, ""):
            count = _first_int(out, current)
            if count is not None:
                out[legacy] = count

    return out


def normalize_kobo_submission(submission: Dict[str, Any]) -> Dict[str, Any]:
    return apply_field_aliases(flatten_kobo_submission(submission))


def total_functional_devices(submission: Dict[str, Any]) -> int:
    """Sum device counts using legacy or current field names."""
    legacy_total = sum(_first_int(submission, f) or 0 for f in _LEGACY_DEVICE_FIELDS)
    if legacy_total > 0:
        return legacy_total
    return sum(_first_int(submission, f) or 0 for f in _DEVICE_COUNT_FIELDS)


FACILITY_PHOTO_FIELD = "Take_upload_full_picture_of_the_facility"


def attachment_uid_for_basename(
    submission: Dict[str, Any],
    basename: Optional[str],
) -> Optional[str]:
    """Match a Kobo attachment uid from _attachments by media_file_basename."""
    if not basename or not isinstance(basename, str):
        return None
    attachments = submission.get("_attachments")
    if not isinstance(attachments, list):
        return None
    for att in attachments:
        if not isinstance(att, dict):
            continue
        if att.get("media_file_basename") == basename:
            return att.get("uid")
        filename = att.get("filename") or ""
        if basename in filename:
            return att.get("uid")
    return None


def display_label(value: Optional[str]) -> Optional[str]:
    """Turn Kobo choice slugs (gw_harley_hospital) into readable labels."""
    if not value or not isinstance(value, str):
        return value
    if " " in value:
        return value
    return value.replace("_", " ").title()
