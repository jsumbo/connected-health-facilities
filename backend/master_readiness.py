"""
Load TRIBE master facility readiness scores from the workbook in repo.
Sheets used: 7 Facility Scorecards, 8 County Summary, 9 Cluster Summary, 10 Blocker Register.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, TypedDict

from openpyxl import load_workbook

from drf import (
    DRF_DOMAIN_KEYS,
    build_drf_domain_scores,
    enrich_blockers,
    normalize_facility_name,
    parse_blocker_codes,
    tier_display_label,
)
from facility_master import all_programme_facilities, registry_by_slug

logger = logging.getLogger(__name__)

SHEET_SCORECARDS = "7. Facility Scorecards"
SHEET_COUNTY = "8. County Summary"
SHEET_CLUSTER = "9. Cluster Summary"
SHEET_BLOCKERS = "10. Blocker Register"

DOMAIN_COLS = {
    "D_POW": 5,
    "D_CON": 6,
    "D_ICT": 7,
    "D_DIG": 8,
    "D_SEN": 9,
    "D_DAT": 10,
}

COMPOSITE_COL = 11
TIER_COL = 12
WAVE_COL = 13
BLOCKERS_COL = 14
DLA_PCT_COL = 15
DLA_N_COL = 16
SENTIMENT_N_COL = 17


class MasterScorecard(TypedDict):
    slug: str
    facility_name: str
    county: str
    cluster: str
    facility_type: str
    rank: int | None
    composite: float
    tier: str
    tier_label: str
    wave: str | None
    deployment_wave: str | None
    blocker_codes: List[str]
    blockers: List[Dict[str, str]]
    blocker_remediation: str | None
    deployment_blocked: bool
    domain_scores: Dict[str, Dict[str, Any]]
    dla_pct: float | None
    dla_n: int | None
    sentiment_n: int | None
    scoring_source: str


class MasterReadinessBundle(TypedDict):
    scorecards: Dict[str, MasterScorecard]
    blocker_register: List[Dict[str, Any]]
    county_summaries: List[Dict[str, Any]]
    cluster_summaries: List[Dict[str, Any]]
    source_path: str
    facility_count: int


def _default_workbook_path() -> Path:
    return Path(__file__).resolve().parent / "data" / "master" / "Master Facility Readiness Scores.xlsx"


def _build_name_to_slug() -> Dict[str, str]:
    mapping: Dict[str, str] = {}
    for reg in all_programme_facilities():
        mapping[normalize_facility_name(reg["name"]).lower()] = reg["slug"]
    return mapping


def _safe_float(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _safe_int(value: Any) -> int | None:
    if value is None or value == "":
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def _row_has_value(cells: List[Any], index: int) -> bool:
    return index < len(cells) and cells[index] not in (None, "")


def _cell_str(cells: List[Any], index: int) -> str:
    if not _row_has_value(cells, index):
        return ""
    return str(cells[index]).strip()


def _row_cells(row: tuple) -> List[Any]:
    return list(row)


def _is_blank_summary_row(cells: List[Any]) -> bool:
    if not cells:
        return True
    first = cells[0]
    return first is None or str(first).strip() == ""


def _resolve_slug(facility_name: str, name_to_slug: Dict[str, str]) -> str | None:
    key = normalize_facility_name(facility_name).lower()
    return name_to_slug.get(key)


def load_master_readiness(path: Path | None = None) -> MasterReadinessBundle:
    workbook_path = path or _default_workbook_path()
    if not workbook_path.is_file():
        raise FileNotFoundError(f"Master readiness workbook not found: {workbook_path}")

    name_to_slug = _build_name_to_slug()
    wb = load_workbook(workbook_path, read_only=True, data_only=True)

    remediation_by_name: Dict[str, str] = {}
    blocker_register: List[Dict[str, Any]] = []

    if SHEET_BLOCKERS in wb.sheetnames:
        for row in wb[SHEET_BLOCKERS].iter_rows(min_row=2, values_only=True):
            cells = _row_cells(row)
            if len(cells) < 6 or not cells[0]:
                continue
            facility_name = str(cells[0]).strip()
            slug = _resolve_slug(facility_name, name_to_slug)
            codes = parse_blocker_codes(str(cells[4] or ""))
            remediation = str(cells[5]).strip() if cells[5] else None
            remediation_by_name[normalize_facility_name(facility_name).lower()] = remediation or ""
            blocker_register.append({
                "facility_name": facility_name,
                "facility_slug": slug,
                "county": str(cells[1]).strip() if cells[1] else None,
                "composite": _safe_float(cells[2]),
                "tier": str(cells[3]).strip() if cells[3] else None,
                "blocker_codes": codes,
                "remediation_pathway": remediation,
            })

    scorecards: Dict[str, MasterScorecard] = {}
    if SHEET_SCORECARDS in wb.sheetnames:
        for row in wb[SHEET_SCORECARDS].iter_rows(min_row=2, values_only=True):
            cells = _row_cells(row)
            if len(cells) <= COMPOSITE_COL or not _row_has_value(cells, 1):
                continue

            facility_name = _cell_str(cells, 1)
            slug = _resolve_slug(facility_name, name_to_slug)
            if not slug:
                logger.warning("Master scorecard facility not in registry: %s", facility_name)
                continue

            domain_raw = {
                key: _safe_int(cells[col]) if col < len(cells) else None
                for key, col in DOMAIN_COLS.items()
            }
            wave_raw = _cell_str(cells, WAVE_COL)
            wave = None if wave_raw in ("", "—", "-") else wave_raw
            tier = _cell_str(cells, TIER_COL) or "Not Assessed"
            blocker_codes = parse_blocker_codes(_cell_str(cells, BLOCKERS_COL))
            remediation = remediation_by_name.get(normalize_facility_name(facility_name).lower())
            if not remediation and blocker_codes:
                remediation = "; ".join(
                    enrich_blockers(blocker_codes)[i]["remediation"]
                    for i in range(len(blocker_codes))
                )

            scorecards[slug] = {
                "slug": slug,
                "facility_name": registry_by_slug()[slug]["name"],
                "county": _cell_str(cells, 2),
                "cluster": _cell_str(cells, 3),
                "facility_type": _cell_str(cells, 4),
                "rank": _safe_int(cells[0]),
                "composite": _safe_float(cells[COMPOSITE_COL]) or 0.0,
                "tier": tier,
                "tier_label": tier_display_label(tier, wave),
                "wave": wave,
                "deployment_wave": wave,
                "blocker_codes": blocker_codes,
                "blockers": enrich_blockers(blocker_codes, remediation),
                "blocker_remediation": remediation,
                "deployment_blocked": tier == "Tier 3" or bool(blocker_codes),
                "domain_scores": build_drf_domain_scores(domain_raw),
                "dla_pct": _safe_float(cells[DLA_PCT_COL]) if len(cells) > DLA_PCT_COL else None,
                "dla_n": _safe_int(cells[DLA_N_COL]) if len(cells) > DLA_N_COL else None,
                "sentiment_n": (
                    _safe_int(cells[SENTIMENT_N_COL]) if len(cells) > SENTIMENT_N_COL else None
                ),
                "scoring_source": "tribe_master_workbook",
            }

    county_summaries: List[Dict[str, Any]] = []
    if SHEET_COUNTY in wb.sheetnames:
        for row in wb[SHEET_COUNTY].iter_rows(min_row=2, values_only=True):
            cells = _row_cells(row)
            if _is_blank_summary_row(cells):
                continue
            county_name = _cell_str(cells, 0)
            if county_name.upper() == "NATIONAL":
                continue
            county_summaries.append({
                "county": county_name,
                "facility_count": _safe_int(cells[1]),
                "avg_composite": _safe_float(cells[2]),
                "tier_1_count": _safe_int(cells[3]),
                "tier_2_count": _safe_int(cells[4]),
                "tier_3_count": _safe_int(cells[5]),
                "avg_pow": _safe_float(cells[6]),
                "avg_con": _safe_float(cells[7]),
                "avg_ict": _safe_float(cells[8]),
                "avg_dig": _safe_float(cells[9]),
                "avg_sen": _safe_float(cells[10]),
                "avg_dat": _safe_float(cells[11]),
            })

    cluster_summaries: List[Dict[str, Any]] = []
    if SHEET_CLUSTER in wb.sheetnames:
        for row in wb[SHEET_CLUSTER].iter_rows(min_row=2, values_only=True):
            cells = _row_cells(row)
            if _is_blank_summary_row(cells):
                continue
            cluster_summaries.append({
                "cluster": _cell_str(cells, 0),
                "facility_count": _safe_int(cells[1]),
                "avg_composite": _safe_float(cells[2]),
                "tier_1_count": _safe_int(cells[3]),
                "tier_2_count": _safe_int(cells[4]),
                "tier_3_count": _safe_int(cells[5]),
                "avg_pow": _safe_float(cells[6]),
                "avg_con": _safe_float(cells[7]),
                "avg_ict": _safe_float(cells[8]),
                "avg_dig": _safe_float(cells[9]),
                "avg_sen": _safe_float(cells[10]),
                "avg_dat": _safe_float(cells[11]),
            })

    wb.close()

    return {
        "scorecards": scorecards,
        "blocker_register": blocker_register,
        "county_summaries": county_summaries,
        "cluster_summaries": cluster_summaries,
        "source_path": str(workbook_path),
        "facility_count": len(scorecards),
    }
