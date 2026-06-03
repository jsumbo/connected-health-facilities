"""
Merge facility master registry with scored cache for programme-wide views.
"""

from collections import defaultdict
from typing import Any, Dict, List, Optional

from cache import cache
from completeness import assess_completeness, assess_completeness_from_scored
from facility_master import (
    PROGRAMME_FACILITY_TARGET,
    all_programme_facilities,
    county_display,
)
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


def build_facility_rows() -> List[Dict[str, Any]]:
    scored_by_slug = _index_scored_by_slug()
    rows: List[Dict[str, Any]] = []

    sentiment_by_slug = sentiment_cache.get_by_slug()
    dla_by_slug = dla_cache.get_by_slug()

    for reg in all_programme_facilities():
        scored = scored_by_slug.get(reg["slug"])
        sentiment = sentiment_by_slug.get(reg["slug"])
        dla = dla_by_slug.get(reg["slug"])

        completeness = (
            assess_completeness_from_scored(scored) if scored else assess_completeness(None)
        )

        lat, lng = None, None
        if scored and scored.get("latitude") is not None:
            lat, lng = scored.get("latitude"), scored.get("longitude")

        rows.append({
            "slug": reg["slug"],
            "name": reg["name"],
            "county": county_display(reg["county"]),
            "county_slug": reg["county"],
            "district": reg["district"].replace("_", " ").title() if reg["district"] else None,
            "facility_type": reg["facility_type"].replace("_", " ").title(),
            "region": reg["region"],
            "cluster": reg["cluster"],
            "assessment_status": "not_assessed" if not scored else "complete",
            "submission_id": scored.get("submission_id") if scored else None,
            "submitted_at": scored.get("submitted_at") if scored else None,
            "overall_score": scored.get("overall_score") if scored else None,
            "tier": scored.get("tier") if scored else "Not Assessed",
            "deployment_blocked": scored.get("deployment_blocked", False) if scored else False,
            "blockers": scored.get("blockers") or [] if scored else [],
            "domain_scores": scored.get("domain_scores") or {} if scored else {},
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
        })

    return rows


def build_overview() -> Dict[str, Any]:
    rows = build_facility_rows()
    assessed = [r for r in rows if r["assessment_status"] == "complete"]
    not_assessed = [r for r in rows if r["assessment_status"] != "complete"]
    low_quality = [r for r in assessed if r["completeness_pct"] < 70]

    tier_counts: Dict[str, int] = defaultdict(int)
    for r in rows:
        tier_counts[r["tier"]] += 1

    by_county: Dict[str, Dict[str, Any]] = {}
    for r in rows:
        c = r["county"]
        if c not in by_county:
            by_county[c] = {"county": c, "total": 0, "assessed": 0, "tiers": defaultdict(int)}
        by_county[c]["total"] += 1
        if r["assessment_status"] == "complete":
            by_county[c]["assessed"] += 1
        by_county[c]["tiers"][r["tier"]] += 1

    by_cluster: Dict[str, Dict[str, Any]] = {}
    for r in assessed:
        cl = r["cluster"]
        if cl not in by_cluster:
            by_cluster[cl] = {"cluster": cl, "region": r["region"], "count": 0, "scores": []}
        by_cluster[cl]["count"] += 1
        if r["overall_score"] is not None:
            by_cluster[cl]["scores"].append(r["overall_score"])

    cluster_summaries = []
    for cl, data in sorted(by_cluster.items()):
        scores = data["scores"]
        cluster_summaries.append({
            "cluster": cl,
            "region": data["region"],
            "facility_count": data["count"],
            "avg_score": round(sum(scores) / len(scores), 1) if scores else None,
        })

    domain_avgs: Dict[str, Optional[float]] = {}
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
        "by_county": [
            {**v, "tiers": dict(v["tiers"])} for v in sorted(by_county.values(), key=lambda x: x["county"])
        ],
        "by_cluster": cluster_summaries,
        "domain_averages": domain_avgs,
        "last_refreshed": cache.last_refreshed.isoformat() if cache.last_refreshed else None,
        "cache_populated": cache.is_populated,
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
    return {
        "form_name": sentiment_cache.form_name,
        "configured": sentiment_cache.is_configured,
        "populated": sentiment_cache.is_populated,
        "last_error": sentiment_cache.last_error,
        "raw_submission_count": sentiment_cache.raw_submission_count,
        "coverage": sentiment_cache.coverage(),
        "facilities": list(sentiment_cache.get_by_slug().values()),
        "last_refreshed": (
            sentiment_cache.last_refreshed.isoformat() if sentiment_cache.last_refreshed else None
        ),
    }


def build_dla_overview() -> Dict[str, Any]:
    return {
        "form_name": "Digital Literacy Assessment",
        "configured": dla_cache.is_configured,
        "populated": dla_cache.is_populated,
        "last_error": dla_cache.last_error,
        "raw_submission_count": dla_cache.raw_submission_count,
        "coverage": dla_cache.coverage(),
        "facilities": list(dla_cache.get_by_slug().values()),
        "last_refreshed": (
            dla_cache.last_refreshed.isoformat() if dla_cache.last_refreshed else None
        ),
    }


def get_facility_by_slug(slug: str) -> Optional[Dict[str, Any]]:
    for row in build_facility_rows():
        if row["slug"] == slug:
            return row
    return None


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
        "facilities": rows,
    }
