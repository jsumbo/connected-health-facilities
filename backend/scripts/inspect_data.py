#!/usr/bin/env python3
"""
Inspect Connected Facilities assessment data for format, coverage, and dashboard design.

Usage (from backend/):
  python scripts/inspect_data.py
  python scripts/inspect_data.py --format markdown --out ../docs/data-inspection-report.md
  python scripts/inspect_data.py --format json --out /tmp/inspection.json
  python scripts/inspect_data.py --source supabase

Outputs:
  - Kobo payload structure (flat vs group paths)
  - Field inventory with fill rates
  - Scoring engine coverage vs live form
  - Gap analysis vs TRIBE rubric (5 domains, 3 instruments, tiers)
  - Suggested dashboard pages and data prerequisites
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

# Allow running as: python scripts/inspect_data.py from backend/
_BACKEND = Path(__file__).resolve().parents[1]
_SCRIPTS = Path(__file__).resolve().parent
for p in (_BACKEND, _SCRIPTS):
    if str(p) not in sys.path:
        sys.path.insert(0, str(p))

from config import settings  # noqa: E402
from kobo import fetch_form_metadata, fetch_new_submissions  # noqa: E402
from kobo_normalize import flatten_kobo_submission, normalize_kobo_submission  # noqa: E402
from scoring import DOMAIN_QUESTIONS, SCORE_MAP, score_submission, aggregate_summary  # noqa: E402
from inspect_spec import (  # noqa: E402
    BLOCKER_SPEC,
    DASHBOARD_VIEWS,
    EXPECTED_FACILITY_COUNT,
    INSTRUMENTS,
    KOBO_DOMAINS,
    READINESS_TIERS,
    RUBRIC_DOMAINS,
    IDENTITY_FIELDS,
    GEO_FIELD_PATTERNS,
)


def _is_filled(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, (list, dict)) and len(value) == 0:
        return False
    if isinstance(value, str) and value.strip() == "":
        return False
    return True


def _field_inventory(submissions: List[Dict[str, Any]]) -> Dict[str, Any]:
    n = len(submissions) or 1
    flat_keys: Set[str] = set()
    grouped_keys: Set[str] = set()
    fill_counts: Counter[str] = Counter()

    for sub in submissions:
        for key, val in sub.items():
            if key.startswith("_"):
                continue
            if "/" in key:
                grouped_keys.add(key)
                short = key.rsplit("/", 1)[-1]
                flat_keys.add(short)
                if _is_filled(val):
                    fill_counts[short] += 1
            else:
                flat_keys.add(key)
                if _is_filled(val):
                    fill_counts[key] += 1

    return {
        "submission_count": len(submissions),
        "unique_flat_field_names": len(flat_keys),
        "unique_grouped_paths": len(grouped_keys),
        "top_level_only_fields": sorted(k for k in flat_keys if not any("/" in x and x.endswith(k) for x in grouped_keys))[:30],
        "fill_rates": {
            k: {"filled": c, "pct": round(100 * c / n, 1)}
            for k, c in fill_counts.most_common(80)
        },
    }


def _scoring_coverage(submissions: List[Dict[str, Any]]) -> Dict[str, Any]:
    normalized = [normalize_kobo_submission(s) for s in submissions]
    n = len(normalized) or 1

    score_map_coverage: Dict[str, Dict[str, Any]] = {}
    for field in SCORE_MAP:
        filled = sum(1 for s in normalized if _is_filled(s.get(field)))
        in_map = sum(
            1
            for s in normalized
            if _is_filled(s.get(field)) and str(s.get(field)) in SCORE_MAP[field]
        )
        score_map_coverage[field] = {
            "filled_pct": round(100 * filled / n, 1),
            "mapped_choice_pct": round(100 * in_map / max(filled, 1), 1),
        }

    domain_coverage: Dict[str, Dict[str, Any]] = {}
    for domain_key, fields in DOMAIN_QUESTIONS.items():
        per_field = {}
        for field in fields:
            filled = sum(1 for s in normalized if _is_filled(s.get(field)))
            per_field[field] = round(100 * filled / n, 1)
        domain_label = next(
            (d["label"] for d in KOBO_DOMAINS.values() if d.get("code") == domain_key),
            domain_key,
        )
        domain_coverage[domain_key] = {
            "label": domain_label,
            "fields": per_field,
            "avg_fill_pct": round(
                sum(per_field.values()) / len(per_field), 1
            ) if per_field else 0,
        }

    unmapped_filled: List[str] = []
    all_scored_fields = set(SCORE_MAP) | {f for fs in DOMAIN_QUESTIONS.values() for f in fs}
    for s in normalized:
        for key, val in s.items():
            if not _is_filled(val) or key in all_scored_fields or key.startswith("_"):
                continue
            if key not in unmapped_filled and len(unmapped_filled) < 40:
                unmapped_filled.append(key)

    return {
        "score_map_fields": len(SCORE_MAP),
        "domain_question_fields": sum(len(v) for v in DOMAIN_QUESTIONS.values()),
        "score_map_coverage": score_map_coverage,
        "domain_coverage": domain_coverage,
        "sample_unmapped_nonempty_fields": unmapped_filled[:25],
    }


def _identity_and_geo(submissions: List[Dict[str, Any]]) -> Dict[str, Any]:
    normalized = [normalize_kobo_submission(s) for s in submissions]
    n = len(normalized) or 1

    identity = {}
    for field in IDENTITY_FIELDS:
        identity[field] = round(
            100 * sum(1 for s in normalized if _is_filled(s.get(field))) / n, 1
        )

    geo_keys = sorted(
        {
            k
            for s in submissions
            for k in s
            if any(p in k.lower() for p in GEO_FIELD_PATTERNS)
        }
    )

    counties = Counter(
        (s.get("County") or "").strip()
        for s in normalized
        if _is_filled(s.get("County"))
    )
    facilities = Counter(
        (s.get("Facility_name") or "").strip()
        for s in normalized
        if _is_filled(s.get("Facility_name"))
    )

    return {
        "identity_fill_pct": identity,
        "geo_related_keys": geo_keys,
        "unique_counties": len(counties),
        "county_distribution": dict(counties.most_common(15)),
        "unique_facility_names": len(facilities),
        "duplicate_facility_names": [n for n, c in facilities.items() if c > 1],
    }


def _readiness_snapshot(submissions: List[Dict[str, Any]]) -> Dict[str, Any]:
    scored = [score_submission(s) for s in submissions]
    summary = aggregate_summary(scored)

    blocker_breakdown: Counter[str] = Counter()
    for s in scored:
        for b in s.get("blockers") or []:
            blocker_breakdown[b.split("(")[0].strip()] += 1

    domain_avgs: Dict[str, Optional[float]] = {}
    for domain_key in DOMAIN_QUESTIONS:
        vals = []
        for s in scored:
            ds = (s.get("domain_scores") or {}).get(domain_key, {})
            if ds.get("score") is not None:
                vals.append(ds["score"])
        domain_avgs[domain_key] = round(sum(vals) / len(vals), 1) if vals else None

    return {
        "aggregate_summary": summary,
        "blocker_breakdown": dict(blocker_breakdown.most_common(15)),
        "mean_domain_scores_pct": domain_avgs,
        "sample_facilities": [
            {
                "submission_id": s.get("submission_id"),
                "facility_name": s.get("facility_name"),
                "county": s.get("county"),
                "tier": s.get("tier"),
                "overall_score": s.get("overall_score"),
                "blockers": s.get("blockers"),
            }
            for s in sorted(
                scored,
                key=lambda x: (x.get("overall_score") is None, -(x.get("overall_score") or 0)),
            )[:5]
        ],
    }


def _framework_gaps() -> Dict[str, Any]:
    return {
        "instruments": INSTRUMENTS,
        "kobo_domains_10": KOBO_DOMAINS,
        "rubric_domains_5": RUBRIC_DOMAINS,
        "tier_alignment": READINESS_TIERS,
        "blocker_spec": BLOCKER_SPEC,
        "implementation_gaps": [
            "Dashboard uses 8-domain mean % (B–J excl. H optional); rubric uses 5 weighted domains scored 0–3.",
            "Tier thresholds differ: rubric Tier 1 ≥75%; dashboard 'Deployment Ready' ≥80%.",
            "Sentiment survey and DLA not ingested — Domain 4/5 composite cannot match rubric.",
            "Cluster/region aggregates need facility→cluster mapping (not in current schema).",
            "BLK-04, BLK-05, BLK-06 not implemented in scoring.py.",
            "Facility names from Kobo are choice slugs; need MoH canonical list for 37/38 facilities.",
        ],
        "suggested_dashboard_views": DASHBOARD_VIEWS,
    }


async def _load_supabase_rows() -> List[Dict[str, Any]]:
    from db import load_all_scored

    return await load_all_scored()


async def build_report(source: str) -> Dict[str, Any]:
    report: Dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": source,
        "config": {
            "kobo_base_url": settings.kobo_base_url,
            "kobo_asset_configured": bool(settings.kobo_asset_uid and settings.kobo_api_token),
            "supabase_configured": bool(settings.supabase_url and settings.supabase_service_key),
            "expected_facilities": EXPECTED_FACILITY_COUNT,
        },
    }

    raw_submissions: List[Dict[str, Any]] = []
    form_meta: Dict[str, Any] = {}

    if source in ("kobo", "both"):
        try:
            form_meta = await fetch_form_metadata()
            raw_submissions = await fetch_new_submissions(0)
        except Exception as exc:
            report["kobo_error"] = str(exc)

    if source in ("supabase", "both"):
        try:
            report["supabase_cached"] = {
                "row_count": len(await _load_supabase_rows()),
            }
        except Exception as exc:
            report["supabase_error"] = str(exc)

    if not raw_submissions and source == "supabase":
        rows = await _load_supabase_rows()
        report["note"] = "Supabase stores scored JSON only — re-run with --source kobo for raw field inspection."

    if raw_submissions:
        report["form"] = {
            "name": form_meta.get("name"),
            "deployment_active": form_meta.get("deployment__active"),
            "submissions_count_api": form_meta.get("deployment__submission_count"),
        }
        report["structure"] = _field_inventory(raw_submissions)
        report["structure"]["example_group_paths"] = sorted(
            [k for k in raw_submissions[0] if "/" in k]
        )[:12]
        report["identity_geo"] = _identity_and_geo(raw_submissions)
        report["scoring_coverage"] = _scoring_coverage(raw_submissions)
        report["readiness_snapshot"] = _readiness_snapshot(raw_submissions)

    report["framework"] = _framework_gaps()
    return report


def _render_markdown(report: Dict[str, Any]) -> str:
    lines: List[str] = [
        "# Connected Facilities — Data Inspection Report",
        "",
        f"Generated: {report.get('generated_at')}",
        f"Source: {report.get('source')}",
        "",
        "## Configuration",
        "",
        "```json",
        json.dumps(report.get("config", {}), indent=2),
        "```",
        "",
    ]

    if report.get("kobo_error"):
        lines.extend([f"**Kobo error:** {report['kobo_error']}", ""])

    form = report.get("form") or {}
    if form:
        lines.extend([
            "## Kobo form",
            "",
            f"- **Name:** {form.get('name')}",
            f"- **Submissions (API):** {form.get('submissions_count_api')}",
            "",
        ])

    struct = report.get("structure") or {}
    if struct:
        lines.extend([
            "## Payload structure",
            "",
            f"- Submissions: **{struct.get('submission_count')}**",
            f"- Unique field names (after flattening): **{struct.get('unique_flat_field_names')}**",
            f"- Group-prefixed paths in raw export: **{struct.get('unique_grouped_paths')}**",
            "",
            "> Kobo exports answers as `group_xxx/Field_name`. The backend must flatten before scoring.",
            "",
        ])

    ident = report.get("identity_geo") or {}
    if ident:
        lines.extend([
            "## Identity & geography",
            "",
            f"- Unique counties: **{ident.get('unique_counties')}**",
            f"- Unique facility names: **{ident.get('unique_facility_names')}**",
            f"- Geo-related keys: `{ident.get('geo_related_keys')}`",
            "",
            "### Identity field fill rates (%)",
            "",
            "| Field | Fill % |",
            "|-------|--------|",
        ])
        for field, pct in (ident.get("identity_fill_pct") or {}).items():
            lines.append(f"| `{field}` | {pct} |")
        lines.append("")

    cov = report.get("scoring_coverage") or {}
    if cov.get("domain_coverage"):
        lines.extend([
            "## Scoring coverage by Kobo domain",
            "",
            "| Domain | Avg fill % |",
            "|--------|------------|",
        ])
        for dk, info in cov["domain_coverage"].items():
            lines.append(f"| {info.get('label', dk)} (`{dk}`) | {info.get('avg_fill_pct')} |")
        lines.append("")

    snap = report.get("readiness_snapshot") or {}
    if snap.get("aggregate_summary"):
        lines.extend([
            "## Current dashboard readiness snapshot",
            "",
            "```json",
            json.dumps(snap["aggregate_summary"], indent=2),
            "```",
            "",
            "### Blockers",
            "",
        ])
        for reason, count in (snap.get("blocker_breakdown") or {}).items():
            lines.append(f"- {count}× {reason}")
        lines.append("")

    fw = report.get("framework") or {}
    lines.extend([
        "## TRIBE rubric vs this codebase",
        "",
        "### Instruments",
        "",
        "| Instrument | Platform | In repo |",
        "|------------|----------|---------|",
    ])
    for key, spec in (fw.get("instruments") or {}).items():
        lines.append(
            f"| {spec['name']} | {spec['platform']} | {spec['status_in_repo']} |"
        )
    lines.extend(["", "### Implementation gaps", ""])
    for gap in fw.get("implementation_gaps") or []:
        lines.append(f"- {gap}")
    lines.extend(["", "## Suggested dashboard views", ""])
    for view in fw.get("suggested_dashboard_views") or []:
        lines.append(f"### {view['id']}")
        lines.append(f"- **Deliverable:** {view.get('deliverable', '—')}")
        lines.append(f"- **Data ready:** {view.get('data_ready', '—')}")
        lines.append(f"- **KPIs:** {', '.join(view.get('kpis', []))}")
        charts = view.get("charts")
        if charts:
            lines.append(f"- **Charts:** {', '.join(charts)}")
        lines.append("")

    lines.extend([
        "## Recommended next steps",
        "",
        "1. **Align scoring** to Part B (5 domains, 0–3 scores, weighted composite) or document deviation.",
        "2. **Ingest Sentiment + DLA** with facility keys; enforce n≥3 validation flags.",
        "3. **Add cluster/region dimension** to facility master list for aggregate views.",
        "4. **Map MoH facility names** and GPS (fallback to MoH list when field GPS missing).",
        "5. **Re-sync Supabase** after any scoring change: `POST /dashboard/cache/sync`.",
        "",
    ])
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Inspect assessment data for dashboard design")
    parser.add_argument(
        "--source",
        choices=["kobo", "supabase", "both"],
        default="kobo",
        help="Where to load data from (default: kobo raw submissions)",
    )
    parser.add_argument(
        "--format",
        choices=["text", "json", "markdown"],
        default="text",
        help="Output format",
    )
    parser.add_argument(
        "--out",
        type=Path,
        help="Write report to file instead of stdout",
    )
    args = parser.parse_args()

    report = asyncio.run(build_report(args.source))

    if args.format == "json":
        output = json.dumps(report, indent=2, default=str)
    elif args.format == "markdown":
        output = _render_markdown(report)
    else:
        output = _render_markdown(report)

    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(output, encoding="utf-8")
        print(f"Wrote {args.out}")
    else:
        print(output)


if __name__ == "__main__":
    main()
