#!/usr/bin/env python3
"""
Sync DLA responses from Google Sheets to Supabase.

Usage:
  python3 sync_dla_from_sheets.py

Environment:
  GOOGLE_SHEETS_ID: Google Sheet ID (from URL)
  SUPABASE_URL: Supabase project URL
  SUPABASE_SERVICE_KEY: Supabase service role key
"""

import os
import sys
import csv
import asyncio
from io import StringIO
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
from supabase import create_client
from config import settings
from dla import load_csv_rows, aggregate_by_facility

GOOGLE_SHEETS_ID = "1s8HBUfpAWspPD66c7CmtbGfi6Q-62cT_VKF2wfrzVSk"
SHEET_NAME = "Form Responses"


def fetch_google_sheet_csv(sheet_id: str, sheet_name: str) -> str:
    """Fetch Google Sheet as CSV via export URL."""
    # Google Sheets export URL format
    url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq?tqx=out:csv&sheet={sheet_name}"

    print(f"Fetching Google Sheet: {sheet_id}")
    response = requests.get(url, timeout=30)
    response.raise_for_status()

    return response.text


def parse_csv_string(csv_string: str) -> list:
    """Parse CSV string into list of dicts."""
    reader = csv.DictReader(StringIO(csv_string))
    return list(reader)


def sync_to_supabase(summaries: dict) -> None:
    """Insert DLA facility summaries into Supabase."""
    if not settings.supabase_url or not settings.supabase_service_key:
        print("⚠️  Supabase not configured. Skipping sync.")
        return

    client = create_client(settings.supabase_url, settings.supabase_service_key)

    rows = []
    for facility_slug, summary in summaries.items():
        rows.append({
            "facility_slug": facility_slug,
            "response_count": summary["response_count"],
            "avg_score": summary["avg_score"],
            "score_min": summary["score_min"],
            "score_max": summary["score_max"],
            "role_breakdown": summary["role_breakdown"],
            "administration_breakdown": summary["administration_breakdown"],
            "latest_submitted_at": summary["latest_submitted_at"],
            "confidence": summary["confidence"],
            "synced_at": datetime.utcnow().isoformat(),
        })

    if not rows:
        print("❌ No DLA data to sync.")
        return

    try:
        print(f"📤 Upserting {len(rows)} DLA facility summaries to Supabase...")
        result = (
            client.table("dla_responses")
            .upsert(rows, on_conflict="facility_slug")
            .execute()
        )
        print(f"✅ Synced {len(rows)} facilities to Supabase")
    except Exception as e:
        print(f"❌ Supabase sync failed: {e}")
        raise


def main():
    """Main sync function."""
    print("=" * 60)
    print("DLA Google Sheets → Supabase Sync")
    print("=" * 60)

    try:
        # Fetch Google Sheet
        csv_string = fetch_google_sheet_csv(GOOGLE_SHEETS_ID, SHEET_NAME)
        rows = parse_csv_string(csv_string)
        print(f"✅ Fetched {len(rows)} rows from Google Sheet")

        # Aggregate by facility
        summaries = aggregate_by_facility(rows)
        print(f"✅ Aggregated into {len(summaries)} facilities")

        # Show summary
        for slug, summary in sorted(summaries.items()):
            print(
                f"  {slug}: {summary['response_count']} responses, "
                f"avg={summary['avg_score']}, confidence={summary['confidence']}"
            )

        # Sync to Supabase
        sync_to_supabase(summaries)

        print("=" * 60)
        print("✅ Sync complete!")
        print("=" * 60)

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
