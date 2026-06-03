#!/usr/bin/env python3
"""
Inspect Staff Sentiment Survey Kobo asset — coverage vs facility registry.

Usage (from backend/):
  python scripts/inspect_sentiment.py
  python scripts/inspect_sentiment.py --format markdown --out ../docs/sentiment-inspection.md
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

_BACKEND = Path(__file__).resolve().parents[1]
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

from config import settings  # noqa: E402
from facility_master import FACILITY_REGISTRY  # noqa: E402
from kobo import fetch_asset_metadata, fetch_asset_submissions  # noqa: E402
from sentiment import aggregate_by_facility, build_coverage_report  # noqa: E402


async def run_inspection() -> dict:
    uid = settings.kobo_sentiment_asset_uid.strip()
    if not uid:
        raise SystemExit("KOBO_SENTIMENT_ASSET_UID is not set in backend/.env")

    meta = await fetch_asset_metadata(uid)
    raw = await fetch_asset_submissions(uid)
    summaries = aggregate_by_facility(raw)
    registry_slugs = [f["slug"] for f in FACILITY_REGISTRY]

    return {
        "asset_uid": uid,
        "form_name": meta.get("name"),
        "submission_count": len(raw),
        "unique_facilities": len(summaries),
        "coverage": build_coverage_report(summaries, registry_slugs),
        "responses_per_facility": {
            slug: summaries[slug]["response_count"]
            for slug in sorted(summaries, key=lambda s: summaries[s]["response_count"], reverse=True)
        },
        "national_avg_enthusiasm": round(
            sum(s["avg_enthusiasm"] or 0 for s in summaries.values() if s["avg_enthusiasm"])
            / max(1, sum(1 for s in summaries.values() if s["avg_enthusiasm"])),
            2,
        ),
    }


def _to_markdown(report: dict) -> str:
    cov = report["coverage"]
    lines = [
        "# Staff Sentiment Survey — Data Inspection",
        "",
        f"**Form:** {report['form_name']}",
        f"**Asset UID:** `{report['asset_uid']}`",
        f"**Submissions:** {report['submission_count']}",
        f"**Facilities with responses:** {cov['facilities_with_responses']} / {cov['registry_count']}",
        f"**National avg enthusiasm (facility means):** {report['national_avg_enthusiasm']}",
        "",
    ]
    if cov["missing_from_survey"]:
        lines.append(f"**Missing:** {', '.join(cov['missing_from_survey'])}")
    else:
        lines.append("**Missing:** none")
    lines.append("")
    lines.append("## Responses per facility")
    lines.append("")
    lines.append("| Facility slug | Responses |")
    lines.append("|---|---:|")
    for slug, count in report["responses_per_facility"].items():
        lines.append(f"| {slug} | {count} |")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--format", choices=["json", "markdown"], default="json")
    parser.add_argument("--out", type=Path, default=None)
    args = parser.parse_args()

    report = asyncio.run(run_inspection())

    if args.format == "markdown":
        text = _to_markdown(report)
    else:
        text = json.dumps(report, indent=2)

    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(text, encoding="utf-8")
        print(f"Wrote {args.out}")
    else:
        print(text)


if __name__ == "__main__":
    main()
