"""
Merge facility master registry with scored cache for programme-wide views.
"""

from collections import defaultdict
from typing import Any, Dict, List, Optional

from cache import cache
from completeness import assess_completeness, assess_completeness_from_scored
from data_quality_flags import assess_instrument_flags, instrument_confidence_summary
from facility_master import (
    PROGRAMME_FACILITY_TARGET,
    all_programme_facilities,
    cluster_sort_key,
    county_display,
)
from drf import DRF_DOMAINS, DRF_DOMAIN_KEYS, BLOCKER_REMEDIATION
from master_cache import master_cache
from scoring import DOMAIN_LABELS
from sentiment_cache import sentiment_cache
from dla_cache import dla_cache


def _index_scored_by_slug() -> Dict[str, Dict[str, Any]]:
    by_slug: Dict[str, Dict[str, Any]] = {}
    for s in cache.get():
        slug = s.get("facility_slug")
        if not slug:
            for reg in all_programme_facilities():
                if reg["name"].lower() == (s.get("facility_name") or "").lower():
                    slug = reg["slug"]
                    break
        if slug:
            by_slug[str(slug)] = s
    return by_slug


def _apply_master_readiness(row: Dict[str, Any], master: Dict[str, Any]) -> None:
    """Override readiness fields with TRIBE master workbook scores."""
    row["assessment_status"] = "complete"
    row["overall_score"] = round(float(master["composite"]), 1)
    row["tier_raw"] = master["tier"]
    row["tier"] = master["tier_label"]
    row["wave"] = master.get("wave")
    row["deployment_blocked"] = master["deployment_blocked"]
    row["blocker_codes"] = master.get("blocker_codes") or []
    row["blockers"] = master.get("blockers") or []
    row["blocker_remediation"] = master.get("blocker_remediation")
    row["domain_scores"] = master.get("domain_scores") or {}
    row["scoring_source"] = master.get("scoring_source", "tribe_master_workbook")
    row["master_rank"] = master.get("rank")
    if master.get("dla_pct") is not None:
        row["master_dla_pct"] = master["dla_pct"]
    if master.get("dla_n") is not None:
        row["master_dla_n"] = master["dla_n"]
    if master.get("sentiment_n") is not None:
        row["master_sentiment_n"] = master["sentiment_n"]


def build_facility_rows() -> List[Dict[str, Any]]:
    scored_by_slug = _index_scored_by_slug()
    master_by_slug = master_cache.get_by_slug()
    rows: List[Dict[str, Any]] = []

    sentiment_by_slug = sentiment_cache.get_by_slug()
    dla_by_slug = dla_cache.get_by_slug()

    for reg in all_programme_facilities():
        scored = scored_by_slug.get(reg["slug"])
        master = master_by_slug.get(reg["slug"])
        sentiment = sentiment_by_slug.get(reg["slug"])
        dla = dla_by_slug.get(reg["slug"])

        completeness = (
            assess_completeness_from_scored(scored) if scored else assess_completeness(None)
        )

        lat, lng = None, None
        if scored and scored.get("latitude") is not None:
            lat, lng = scored.get("latitude"), scored.get("longitude")

        assessment_status = "complete" if (scored or master) else "not_assessed"

        row: Dict[str, Any] = {
            "slug": reg["slug"],
            "name": reg["name"],
            "county": county_display(reg["county"]),
            "county_slug": reg["county"],
            "district": reg["district"].replace("_", " ").title() if reg["district"] else None,
            "facility_type": reg["facility_type"].replace("_", " ").title(),
            "region": reg["region"],
            "cluster": reg["cluster"],
            "assessment_status": assessment_status,
            "submission_id": scored.get("submission_id") if scored else None,
            "submitted_at": scored.get("submitted_at") if scored else None,
            "overall_score": scored.get("overall_score") if scored else None,
            "tier_raw": scored.get("tier") if scored else None,
            "tier": scored.get("tier") if scored else "Not Assessed",
            "wave": None,
            "deployment_blocked": scored.get("deployment_blocked", False) if scored else False,
            "blocker_codes": [],
            "blockers": scored.get("blockers") or [] if scored else [],
            "blocker_remediation": None,
            "domain_scores": scored.get("domain_scores") or {} if scored else {},
            "scoring_source": "kobo" if scored else None,
            "completeness_pct": completeness["completeness_pct"],
            "data_confidence": completeness["confidence"],
            "missing_fields": completeness["missing_fields"],
            "has_gps": completeness["has_gps"],
            "latitude": lat,
            "longitude": lng,
            "download_mbps": scored.get("download_mbps") if scored else None,
            "upload_mbps": scored.get("upload_mbps") if scored else None,
            "internet_uptime": scored.get("internet_uptime") if scored else None,
            "internet_type": scored.get("internet_type") if scored else None,
            "mobile_signal": scored.get("mobile_signal") if scored else None,
            "network_latency": scored.get("network_latency") if scored else None,
            "primary_power": scored.get("primary_power") if scored else None,
            "backup_power": scored.get("backup_power") if scored else None,
            "laptops": scored.get("laptops") if scored else None,
            "desktops": scored.get("desktops") if scored else None,
            "tablets": scored.get("tablets") if scored else None,
            "phones": scored.get("phones") if scored else None,
            "has_facility_photo": bool(
                scored.get("photo_facility_attachment_uid") or scored.get("photo_facility")
            )
            if scored
            else False,
            "sentiment_status": (
                "complete" if sentiment and sentiment.get("response_count", 0) > 0 else "not_collected"
            ),
            "sentiment_response_count": sentiment.get("response_count") if sentiment else 0,
            "sentiment_avg_enthusiasm": sentiment.get("avg_enthusiasm") if sentiment else None,
            "sentiment_management_mode": sentiment.get("management_engagement_mode") if sentiment else None,
            "sentiment_burden_mode": sentiment.get("burden_perception_mode") if sentiment else None,
            "dla_status": (
                "complete" if dla and dla.get("response_count", 0) > 0 else "not_collected"
            ),
            "dla_response_count": dla.get("response_count") if dla else 0,
            "dla_avg_score": dla.get("avg_score") if dla else None,
            "dla_confidence": dla.get("confidence") if dla else None,
        }

        if master:
            _apply_master_readiness(row, master)

        row["quality_flags"] = assess_instrument_flags(row)

        rows.append(row)

    return rows


def build_overview() -> Dict[str, Any]:
    rows = build_facility_rows()
    assessed = [r for r in rows if r["assessment_status"] == "complete"]
    not_assessed = [r for r in rows if r["assessment_status"] != "complete"]
    low_quality = [r for r in assessed if r["completeness_pct"] < 70 and r.get("scoring_source") == "kobo"]

    tier_counts: Dict[str, int] = defaultdict(int)
    for r in rows:
        tier_counts[r["tier"]] += 1

    master_counties = master_cache.county_summaries()
    master_clusters = master_cache.cluster_summaries()

    if master_counties:
        by_county = [
            {
                "county": c["county"],
                "total": c.get("facility_count") or 0,
                "assessed": c.get("facility_count") or 0,
                "tiers": {
                    "Tier 1 — HOS-Ready": c.get("tier_1_count") or 0,
                    "Tier 2 — Deployment-Eligible": c.get("tier_2_count") or 0,
                    "Tier 3 — Not Deployment-Ready": c.get("tier_3_count") or 0,
                },
            }
            for c in master_counties
        ]
    else:
        by_county_map: Dict[str, Dict[str, Any]] = {}
        for r in rows:
            c = r["county"]
            if c not in by_county_map:
                by_county_map[c] = {"county": c, "total": 0, "assessed": 0, "tiers": defaultdict(int)}
            by_county_map[c]["total"] += 1
            if r["assessment_status"] == "complete":
                by_county_map[c]["assessed"] += 1
            by_county_map[c]["tiers"][r["tier"]] += 1
        by_county = [
            {**v, "tiers": dict(v["tiers"])} for v in sorted(by_county_map.values(), key=lambda x: x["county"])
        ]

    if master_clusters:
        cluster_summaries = [
            {
                "cluster": c["cluster"],
                "region": None,
                "facility_count": c.get("facility_count") or 0,
                "avg_score": c.get("avg_composite"),
            }
            for c in sorted(master_clusters, key=lambda item: cluster_sort_key(item["cluster"]))
        ]
    else:
        by_cluster: Dict[str, Dict[str, Any]] = {}
        for r in assessed:
            cl = r["cluster"]
            if cl not in by_cluster:
                by_cluster[cl] = {"cluster": cl, "region": r["region"], "count": 0, "scores": []}
            by_cluster[cl]["count"] += 1
            if r["overall_score"] is not None:
                by_cluster[cl]["scores"].append(r["overall_score"])

        cluster_summaries = []
        for cl, data in sorted(by_cluster.items(), key=lambda item: cluster_sort_key(item[0])):
            scores = data["scores"]
            cluster_summaries.append({
                "cluster": cl,
                "region": data["region"],
                "facility_count": data["count"],
                "avg_score": round(sum(scores) / len(scores), 1) if scores else None,
            })

    domain_avgs: Dict[str, Optional[float]] = {}
    if master_counties:
        domain_key_to_avg = {
            "D-POW": "avg_pow",
            "D-CON": "avg_con",
            "D-ICT": "avg_ict",
            "D-DIG": "avg_dig",
            "D-SEN": "avg_sen",
            "D-DAT": "avg_dat",
        }
        for spec in DRF_DOMAINS:
            field = domain_key_to_avg[spec["code"]]
            vals = [c[field] for c in master_counties if c.get(field) is not None]
            domain_avgs[spec["label"]] = round(sum(vals) / len(vals), 2) if vals else None
    else:
        for dk, label in DOMAIN_LABELS.items():
            vals = []
            for r in assessed:
                ds = (r.get("domain_scores") or {}).get(dk, {})
                if isinstance(ds, dict) and ds.get("score") is not None:
                    vals.append(ds["score"])
            domain_avgs[label] = round(sum(vals) / len(vals), 1) if vals else None

    scores = [r["overall_score"] for r in assessed if r["overall_score"] is not None]
    blocked = sum(1 for r in assessed if r["deployment_blocked"])

    sentiment_facilities = sum(1 for r in rows if r.get("sentiment_status") == "complete")
    enthusiasm_vals = [
        r["sentiment_avg_enthusiasm"]
        for r in rows
        if r.get("sentiment_avg_enthusiasm") is not None
    ]

    dla_facilities = sum(1 for r in rows if r.get("dla_status") == "complete")
    dla_score_vals = [
        r["dla_avg_score"]
        for r in rows
        if r.get("dla_avg_score") is not None
    ]

    # Aggregate blockers by code
    blocker_counts: Dict[str, int] = defaultdict(int)
    for item in master_cache.blocker_register():
        for code in item.get("blocker_codes", []):
            blocker_counts[code] += 1

    blocker_register = [
        {
            "code": code,
            "description": BLOCKER_REMEDIATION.get(code, "Unknown blocker"),
            "count": count,
        }
        for code, count in sorted(blocker_counts.items())
    ]

    return {
        "programme_target": PROGRAMME_FACILITY_TARGET,
        "total_in_registry": len(rows),
        "assessed_count": len(assessed),
        "not_assessed_count": len(not_assessed),
        "completion_pct": round(100 * len(assessed) / PROGRAMME_FACILITY_TARGET, 1),
        "avg_score": round(sum(scores) / len(scores), 1) if scores else None,
        "tier_counts": dict(tier_counts),
        "blocked_count": blocked,
        "low_data_quality_count": len(low_quality),
        "by_county": by_county,
        "by_cluster": cluster_summaries,
        "domain_averages": domain_avgs,
        "domain_scale_max": 3,  # Domain scores are on 0–3 scale (per TRIBE DRF rubric)
        "last_refreshed": cache.last_refreshed.isoformat() if cache.last_refreshed else None,
        "cache_populated": cache.is_populated or master_cache.is_populated,
        "master_populated": master_cache.is_populated,
        "master_last_refreshed": (
            master_cache.last_refreshed.isoformat() if master_cache.last_refreshed else None
        ),
        "master_source_path": master_cache.source_path(),
        "master_facility_count": len(master_cache.get_by_slug()),
        "blocker_register_count": len(master_cache.blocker_register()),
        "blocker_register": blocker_register,
        "sentiment_facilities_count": sentiment_facilities,
        "sentiment_completion_pct": round(
            100 * sentiment_facilities / PROGRAMME_FACILITY_TARGET, 1
        ),
        "sentiment_avg_enthusiasm_national": (
            round(sum(enthusiasm_vals) / len(enthusiasm_vals), 2) if enthusiasm_vals else None
        ),
        "sentiment_total_responses": sentiment_cache.raw_submission_count,
        "sentiment_last_refreshed": (
            sentiment_cache.last_refreshed.isoformat() if sentiment_cache.last_refreshed else None
        ),
        "dla_facilities_count": dla_facilities,
        "dla_completion_pct": round(
            100 * dla_facilities / PROGRAMME_FACILITY_TARGET, 1
        ),
        "dla_avg_score_national": (
            round(sum(dla_score_vals) / len(dla_score_vals), 1) if dla_score_vals else None
        ),
        "dla_total_responses": dla_cache.raw_submission_count,
        "dla_last_refreshed": (
            dla_cache.last_refreshed.isoformat() if dla_cache.last_refreshed else None
        ),
    }


def build_sentiment_overview() -> Dict[str, Any]:
    rows = build_facility_rows()
    confidence = instrument_confidence_summary(rows)
    return {
        "form_name": sentiment_cache.form_name,
        "configured": sentiment_cache.is_configured,
        "populated": sentiment_cache.is_populated,
        "last_error": sentiment_cache.last_error,
        "raw_submission_count": sentiment_cache.raw_submission_count,
        "coverage": sentiment_cache.coverage(),
        "facilities": list(sentiment_cache.get_by_slug().values()),
        "confidence_summary": {
            "min_n": confidence["min_n"],
            "sufficient_count": confidence["sentiment_sufficient_count"],
            "indicative_count": confidence["sentiment_indicative_count"],
            "master_live_mismatch_count": confidence["sentiment_master_live_mismatch_count"],
            "master_live_mismatches": confidence["sentiment_master_live_mismatches"],
        },
        "last_refreshed": (
            sentiment_cache.last_refreshed.isoformat() if sentiment_cache.last_refreshed else None
        ),
    }


def build_dla_overview() -> Dict[str, Any]:
    rows = build_facility_rows()
    confidence = instrument_confidence_summary(rows)
    return {
        "form_name": "Digital Literacy Assessment",
        "configured": dla_cache.is_configured,
        "populated": dla_cache.is_populated,
        "last_error": dla_cache.last_error,
        "raw_submission_count": dla_cache.raw_submission_count,
        "coverage": dla_cache.coverage(),
        "facilities": list(dla_cache.get_by_slug().values()),
        "confidence_summary": {
            "min_n": confidence["min_n"],
            "sufficient_count": confidence["dla_sufficient_count"],
            "indicative_count": confidence["dla_indicative_count"],
            "master_live_mismatch_count": confidence["dla_master_live_mismatch_count"],
            "master_live_mismatches": confidence["dla_master_live_mismatches"],
        },
        "last_refreshed": (
            dla_cache.last_refreshed.isoformat() if dla_cache.last_refreshed else None
        ),
    }


def build_blocker_register() -> Dict[str, Any]:
    return {
        "total": len(master_cache.blocker_register()),
        "items": master_cache.blocker_register(),
        "master_populated": master_cache.is_populated,
        "last_refreshed": (
            master_cache.last_refreshed.isoformat() if master_cache.last_refreshed else None
        ),
        "source_path": master_cache.source_path(),
    }


def get_facility_by_slug(slug: str) -> Optional[Dict[str, Any]]:
    for row in build_facility_rows():
        if row["slug"] == slug:
            return row
    return None


def _rows_with_flag(rows: List[Dict[str, Any]], code: str) -> List[Dict[str, Any]]:
    return [r for r in rows if any(f.get("code") == code for f in r.get("quality_flags") or [])]


def build_data_quality_report() -> Dict[str, Any]:
    rows = build_facility_rows()
    return {
        "programme_target": PROGRAMME_FACILITY_TARGET,
        "not_assessed": [r for r in rows if r["assessment_status"] != "complete"],
        "low_completeness": [
            r for r in rows
            if r["assessment_status"] == "complete" and r["completeness_pct"] < 85
        ],
        "missing_gps": [r for r in rows if r["assessment_status"] == "complete" and not r["has_gps"]],
        "sentiment_insufficient": _rows_with_flag(rows, "sentiment_insufficient"),
        "dla_insufficient": _rows_with_flag(rows, "dla_insufficient"),
        "adoption_risk": _rows_with_flag(rows, "adoption_risk"),
        "instrument_confidence": instrument_confidence_summary(rows),
        "facilities": rows,
    }


def _roadmap_facility_entry(row: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "slug": row["slug"],
        "name": row["name"],
        "county": row["county"],
        "composite": row.get("overall_score"),
        "tier": row.get("tier"),
        "blocker_codes": row.get("blocker_codes") or [],
        "blocker_remediation": row.get("blocker_remediation"),
    }


def _assign_deployment_wave(row: Dict[str, Any]) -> Optional[str]:
    """Map programme row to Wave 1/2/3 or blocked bucket."""
    if row["assessment_status"] != "complete":
        return None
    if row.get("deployment_blocked"):
        return "blocked"

    tier_raw = (row.get("tier_raw") or "").strip()
    wave = (row.get("wave") or "").strip()
    tier_label = row.get("tier") or ""

    if tier_raw == "Tier 1":
        return "Wave 1"
    if tier_raw == "Tier 2":
        if wave == "Wave 3" or "Structured Remediation" in tier_label:
            return "Wave 3"
        return "Wave 2"
    return None


def build_roadmap() -> Dict[str, Any]:
    rows = build_facility_rows()
    waves: Dict[str, List[Dict[str, Any]]] = {
        "Wave 1": [],
        "Wave 2": [],
        "Wave 3": [],
        "blocked": [],
    }
    county_map: Dict[str, Dict[str, Any]] = {}

    for row in rows:
        bucket = _assign_deployment_wave(row)
        if bucket is None:
            continue

        entry = _roadmap_facility_entry(row)
        waves[bucket].append(entry)

        county = row["county"]
        if county not in county_map:
            county_map[county] = {
                "county": county,
                "tier_1_count": 0,
                "wave_2_count": 0,
                "wave_3_count": 0,
                "blocked_count": 0,
                "facility_count": 0,
                "_composites": [],
            }
        rollup = county_map[county]
        rollup["facility_count"] += 1
        if row.get("overall_score") is not None:
            rollup["_composites"].append(float(row["overall_score"]))

        if bucket == "Wave 1":
            rollup["tier_1_count"] += 1
        elif bucket == "Wave 2":
            rollup["wave_2_count"] += 1
        elif bucket == "Wave 3":
            rollup["wave_3_count"] += 1
        elif bucket == "blocked":
            rollup["blocked_count"] += 1

    for bucket in waves:
        waves[bucket].sort(
            key=lambda item: (-(item["composite"] or 0.0), item["name"].lower()),
        )

    by_county: List[Dict[str, Any]] = []
    for rollup in county_map.values():
        composites = rollup.pop("_composites")
        by_county.append({
            **rollup,
            "avg_composite": round(sum(composites) / len(composites), 1) if composites else None,
        })

    by_county.sort(
        key=lambda c: (
            -c["tier_1_count"],
            -c["wave_2_count"],
            -(c["avg_composite"] or 0.0),
            c["county"].lower(),
        ),
    )

    return {
        "waves": waves,
        "by_county": by_county,
        "summary": {
            "wave_1_count": len(waves["Wave 1"]),
            "wave_2_count": len(waves["Wave 2"]),
            "wave_3_count": len(waves["Wave 3"]),
            "blocked_count": len(waves["blocked"]),
            "total_assessed": sum(len(items) for items in waves.values()),
        },
        "master_populated": master_cache.is_populated,
        "last_refreshed": (
            master_cache.last_refreshed.isoformat()
            if master_cache.last_refreshed
            else (cache.last_refreshed.isoformat() if cache.last_refreshed else None)
        ),
    }


ICT_DOMAIN_KEYS = ("D_POW", "D_CON", "D_ICT")
ICT_BLOCKER_CODES = ("BLK-01", "BLK-02", "BLK-03")

_MASTER_CLUSTER_DOMAIN_FIELDS = {
    "D_POW": "avg_pow",
    "D_CON": "avg_con",
    "D_ICT": "avg_ict",
    "D_DIG": "avg_dig",
    "D_SEN": "avg_sen",
    "D_DAT": "avg_dat",
}

_GAP_MATRIX_ROWS: List[Dict[str, str]] = [
    {
        "id": "blk-01",
        "gap": "Power below threshold (BLK-01)",
        "significance": "Priority 1: blocker",
        "intervention": BLOCKER_REMEDIATION["BLK-01"],
        "provision": "Procurement",
        "match": "blocker:BLK-01",
    },
    {
        "id": "blk-02",
        "gap": "Connectivity below threshold (BLK-02)",
        "significance": "Priority 1: blocker",
        "intervention": BLOCKER_REMEDIATION["BLK-02"],
        "provision": "Procurement",
        "match": "blocker:BLK-02",
    },
    {
        "id": "blk-03",
        "gap": "No device at a service point (BLK-03)",
        "significance": "Priority 1: blocker",
        "intervention": BLOCKER_REMEDIATION["BLK-03"],
        "provision": "Procurement",
        "match": "blocker:BLK-03",
    },
    {
        "id": "blk-04",
        "gap": "Not reporting to DHIS2 (BLK-04)",
        "significance": "Priority 1: blocker",
        "intervention": BLOCKER_REMEDIATION["BLK-04"],
        "provision": "In-scope",
        "match": "blocker:BLK-04",
    },
    {
        "id": "blk-05",
        "gap": "No IT support (BLK-05)",
        "significance": "Priority 1: blocker",
        "intervention": BLOCKER_REMEDIATION["BLK-05"],
        "provision": "In-scope or procurement",
        "match": "blocker:BLK-05",
    },
    {
        "id": "dla-low",
        "gap": "DLA under 50%, no blocker",
        "significance": "Priority 2: quality of use",
        "intervention": "Intensive or structured pre-deployment training",
        "provision": "In-scope",
        "match": "dla_low",
    },
    {
        "id": "sentiment-risk",
        "gap": "Low enthusiasm or burdensome documentation",
        "significance": "Priority 2: quality of use",
        "intervention": "Workflow redesign and change-management engagement",
        "provision": "In-scope",
        "match": "sentiment_risk",
    },
    {
        "id": "management-disengaged",
        "gap": "Management not engaged",
        "significance": "Priority 3: sustainability",
        "intervention": "Leadership engagement before go-live",
        "provision": "In-scope",
        "match": "management_disengaged",
    },
]


def _assessed_rows(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [r for r in rows if r["assessment_status"] == "complete"]


def _facility_brief(row: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "slug": row["slug"],
        "name": row["name"],
        "county": row["county"],
        "cluster": row["cluster"],
        "region": row["region"],
        "tier": row["tier"],
        "overall_score": row["overall_score"],
    }


def _drf_domain_score(row: Dict[str, Any], domain_key: str) -> Optional[int]:
    ds = (row.get("domain_scores") or {}).get(domain_key)
    if not isinstance(ds, dict):
        return None
    score = ds.get("score")
    return int(score) if score is not None else None


def _dla_pct(row: Dict[str, Any]) -> Optional[float]:
    if row.get("master_dla_pct") is not None:
        return float(row["master_dla_pct"])
    if row.get("dla_avg_score") is not None:
        return float(row["dla_avg_score"])
    return None


def _tier_counts(rows: List[Dict[str, Any]]) -> Dict[str, int]:
    counts: Dict[str, int] = defaultdict(int)
    for row in rows:
        counts[row["tier"]] += 1
    return dict(counts)


def _cluster_region(rows: List[Dict[str, Any]]) -> Optional[str]:
    for row in rows:
        if row.get("region"):
            return row["region"]
    return None


def _avg_optional(values: List[float]) -> Optional[float]:
    return round(sum(values) / len(values), 2) if values else None


def _domain_averages_from_rows(rows: List[Dict[str, Any]]) -> Dict[str, Optional[float]]:
    avgs: Dict[str, Optional[float]] = {}
    for spec in DRF_DOMAINS:
        vals = [
            float(score)
            for row in rows
            if (score := _drf_domain_score(row, spec["key"])) is not None
        ]
        avgs[spec["code"]] = _avg_optional(vals)
    return avgs


def _master_cluster_domain_averages(summary: Dict[str, Any]) -> Dict[str, Optional[float]]:
    avgs: Dict[str, Optional[float]] = {}
    for spec in DRF_DOMAINS:
        field = _MASTER_CLUSTER_DOMAIN_FIELDS[spec["key"]]
        value = summary.get(field)
        avgs[spec["code"]] = round(float(value), 2) if value is not None else None
    return avgs


def _matches_gap_row(row: Dict[str, Any], match: str) -> bool:
    if match.startswith("blocker:"):
        code = match.split(":", 1)[1]
        return code in (row.get("blocker_codes") or [])

    if match == "dla_low":
        if row.get("blocker_codes"):
            return False
        dla = _dla_pct(row)
        return dla is not None and dla < 50

    if match == "sentiment_risk":
        enthusiasm = row.get("sentiment_avg_enthusiasm")
        burden = (row.get("sentiment_burden_mode") or "").lower()
        low_enthusiasm = enthusiasm is not None and float(enthusiasm) < 5
        burdensome = "burdensome" in burden
        return low_enthusiasm or burdensome

    if match == "management_disengaged":
        mode = (row.get("sentiment_management_mode") or "").lower()
        return "not engaged" in mode

    return False


def _national_domain_averages(clusters: List[Dict[str, Any]]) -> Dict[str, Optional[float]]:
    keys: set[str] = set()
    for cluster in clusters:
        keys.update((cluster.get("domain_averages") or {}).keys())

    avgs: Dict[str, Optional[float]] = {}
    for key in sorted(keys):
        total_weight = 0
        weighted_sum = 0.0
        for cluster in clusters:
            value = (cluster.get("domain_averages") or {}).get(key)
            if value is None:
                continue
            weight = cluster.get("facility_count") or 0
            if weight <= 0:
                weight = 1
            weighted_sum += float(value) * weight
            total_weight += weight
        avgs[key] = round(weighted_sum / total_weight, 2) if total_weight else None
    return avgs


def build_cluster_overview() -> Dict[str, Any]:
    rows = build_facility_rows()
    assessed = _assessed_rows(rows)
    by_cluster: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for row in assessed:
        by_cluster[row["cluster"]].append(row)

    master_by_cluster = {
        c["cluster"]: c for c in master_cache.cluster_summaries()
    }

    if master_cache.is_populated and master_by_cluster:
        cluster_names = sorted(master_by_cluster.keys(), key=cluster_sort_key)
    else:
        cluster_names = sorted(set(by_cluster) | set(master_by_cluster), key=cluster_sort_key)

    clusters: List[Dict[str, Any]] = []
    for cluster in cluster_names:
        cluster_rows = by_cluster.get(cluster, [])
        master = master_by_cluster.get(cluster)

        dla_vals = [v for row in cluster_rows if (v := _dla_pct(row)) is not None]
        enthusiasm_vals = [
            float(row["sentiment_avg_enthusiasm"])
            for row in cluster_rows
            if row.get("sentiment_avg_enthusiasm") is not None
        ]

        if cluster_rows:
            tiers = _tier_counts(cluster_rows)
        elif master:
            tiers = {
                "Tier 1 — HOS-Ready": master.get("tier_1_count") or 0,
                "Tier 2 — Deployment-Eligible": master.get("tier_2_count") or 0,
                "Tier 3 — Not Deployment-Ready": master.get("tier_3_count") or 0,
            }
        else:
            tiers = {}

        score_vals = [
            float(r["overall_score"])
            for r in cluster_rows
            if r.get("overall_score") is not None
        ]
        avg_composite = None
        if master and master.get("avg_composite") is not None:
            avg_composite = round(float(master["avg_composite"]), 1)
        elif score_vals:
            avg_composite = round(sum(score_vals) / len(score_vals), 1)

        entry: Dict[str, Any] = {
            "cluster": cluster,
            "region": _cluster_region(cluster_rows),
            "facility_count": master.get("facility_count") if master else len(cluster_rows),
            "avg_composite": avg_composite,
            "tier_counts": tiers,
            "avg_dla_score": _avg_optional(dla_vals),
            "avg_sentiment_enthusiasm": _avg_optional(enthusiasm_vals),
            "domain_averages": (
                _master_cluster_domain_averages(master)
                if master
                else _domain_averages_from_rows(cluster_rows)
            ),
        }
        clusters.append(entry)

    national_domain_averages = _national_domain_averages(clusters)

    return {
        "clusters": clusters,
        "total_clusters": len(clusters),
        "national_domain_averages": national_domain_averages,
        "domain_scale_max": 3,
        "master_populated": master_cache.is_populated,
        "last_refreshed": (
            master_cache.last_refreshed.isoformat() if master_cache.last_refreshed else None
        ),
    }


def _ict_distribution_levels(
    distribution: Dict[str, int],
    assessed_count: int,
) -> List[Dict[str, Any]]:
    levels: List[Dict[str, Any]] = []
    for level in (0, 1, 2, 3):
        count = distribution.get(str(level), 0)
        pct = round(count / assessed_count * 100, 1) if assessed_count else 0.0
        levels.append({"level": level, "count": count, "pct": pct})
    return levels


def _ict_blocker_facility(row: Dict[str, Any]) -> Dict[str, Any]:
    codes = [
        code
        for code in (row.get("blocker_codes") or [])
        if code in ICT_BLOCKER_CODES
    ]
    return {
        "facility_name": row["name"],
        "facility_slug": row.get("slug"),
        "county": row.get("county"),
        "cluster": row.get("cluster"),
        "blocker_codes": codes,
        "d_pow": _drf_domain_score(row, "D_POW"),
        "d_con": _drf_domain_score(row, "D_CON"),
        "d_ict": _drf_domain_score(row, "D_ICT"),
    }


def build_ict_gap() -> Dict[str, Any]:
    rows = _assessed_rows(build_facility_rows())
    assessed_count = len(rows)
    domains: List[Dict[str, Any]] = []
    zero_score_facilities: List[Dict[str, Any]] = []

    for spec in DRF_DOMAINS:
        if spec["key"] not in ICT_DOMAIN_KEYS:
            continue

        distribution: Dict[str, int] = {"0": 0, "1": 0, "2": 0, "3": 0, "missing": 0}

        for row in rows:
            score = _drf_domain_score(row, spec["key"])
            if score is None:
                distribution["missing"] += 1
                continue
            distribution[str(score)] += 1
            if score == 0:
                zero_score_facilities.append({
                    "facility_name": row["name"],
                    "facility_slug": row.get("slug"),
                    "county": row.get("county"),
                    "cluster": row.get("cluster"),
                    "domain_key": spec["key"],
                    "domain_code": spec["code"],
                    "score": 0,
                })

        domains.append({
            "key": spec["key"],
            "code": spec["code"],
            "label": spec["label"],
            "weight_pct": spec["weight_pct"],
            "distribution": distribution,
        })

    ict_blocker_facilities: List[Dict[str, Any]] = []
    seen_slugs: set[str] = set()
    for row in rows:
        entry = _ict_blocker_facility(row)
        if not entry["blocker_codes"]:
            continue
        slug = entry["facility_slug"] or entry["facility_name"]
        if slug in seen_slugs:
            continue
        seen_slugs.add(slug)
        ict_blocker_facilities.append(entry)

    distributions = [
        {
            "key": domain["key"],
            "code": domain["code"],
            "label": domain["label"],
            "levels": _ict_distribution_levels(domain["distribution"], assessed_count),
        }
        for domain in domains
    ]

    return {
        "assessed_count": assessed_count,
        "distributions": distributions,
        "ict_blocker_facilities": ict_blocker_facilities,
        "zero_score_facilities": zero_score_facilities,
        "domain_scale_max": 3,
        "master_populated": master_cache.is_populated,
        "last_refreshed": (
            master_cache.last_refreshed.isoformat() if master_cache.last_refreshed else None
        ),
    }


def build_gap_matrix() -> Dict[str, Any]:
    rows = _assessed_rows(build_facility_rows())
    matrix_rows: List[Dict[str, Any]] = []

    for spec in _GAP_MATRIX_ROWS:
        matched = [row for row in rows if _matches_gap_row(row, spec["match"])]
        matrix_rows.append({
            "id": spec["id"],
            "gap": spec["gap"],
            "significance": spec["significance"],
            "intervention": spec["intervention"],
            "provision": spec["provision"],
            "facility_count": len(matched),
            "facilities": [_facility_brief(row) for row in matched],
        })

    return {
        "assessed_count": len(rows),
        "items": matrix_rows,
        "total_facilities": len(rows),
        "master_populated": master_cache.is_populated,
        "last_refreshed": (
            master_cache.last_refreshed.isoformat() if master_cache.last_refreshed else None
        ),
    }
