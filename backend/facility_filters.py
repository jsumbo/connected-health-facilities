"""Shared facility-type normalization for API filters."""

import re
from typing import Optional


def normalize_facility_type(value: Optional[str]) -> str:
    if not value:
        return ""
    normalized = value.strip().lower().replace("-", "_").replace(" ", "_")
    normalized = re.sub(r"_+", "_", normalized)
    return normalized.replace("health_center", "health_centre")


def matches_facility_type(
    facility_type: Optional[str],
    filter_value: Optional[str],
) -> bool:
    if not filter_value:
        return True
    return normalize_facility_type(facility_type) == normalize_facility_type(filter_value)
