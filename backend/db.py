import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List

from supabase import create_client, Client
from config import settings

logger = logging.getLogger(__name__)

_client: Client | None = None


def _get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_service_key)
    return _client


# ── Sync helpers (run in thread pool via asyncio.to_thread) ──

def _sync_get_max_kobo_id() -> int:
    """Return the highest submission_id stored, so we only fetch newer ones from Kobo."""
    try:
        result = (
            _get_client()
            .table("facilities")
            .select("submission_id")
            .order("submission_id", desc=True)
            .limit(1)
            .execute()
        )
        if result.data:
            return result.data[0]["submission_id"]
        return 0
    except Exception as e:
        logger.warning(f"Could not get max submission_id: {e}. Starting fresh fetch.")
        return 0


def _sync_upsert(rows: List[Dict[str, Any]]) -> None:
    if not rows:
        return
    try:
        (
            _get_client()
            .table("facilities")
            .upsert(rows, on_conflict="submission_id")
            .execute()
        )
        logger.info(f"Upserted {len(rows)} rows into facilities")
    except Exception as e:
        logger.error(f"Upsert failed: {e}")
        raise


def _sync_load_all() -> List[Dict[str, Any]]:
    """Load facilities data from Supabase. Handle schema variations."""
    try:
        logger.info("Loading all facilities from Supabase...")
        result = (
            _get_client()
            .table("facilities")
            .select("*")
            .order("id")
            .execute()
        )

        logger.info(f"Supabase query returned {len(result.data) if result.data else 0} rows")

        # If data exists, return it as-is (whether scored_data or raw)
        if result.data:
            # Try to extract scored_data if it exists, otherwise return the whole row
            facilities = [
                row.get("scored_data") if "scored_data" in row else row
                for row in result.data
            ]
            logger.info(f"Returning {len(facilities)} facilities")
            return facilities
        logger.info("No facilities found in Supabase")
        return []
    except Exception as e:
        logger.error(f"Failed to load facilities: {e}", exc_info=True)
        return []


# ── Async public API ─────────────────────────────────────────

async def get_max_kobo_id() -> int:
    """Return the highest Kobo submission _id already stored, or 0 if table is empty."""
    return await asyncio.to_thread(_sync_get_max_kobo_id)


async def upsert_submissions(scored: List[Dict[str, Any]]) -> None:
    """Insert or update scored facility records keyed by submission_id."""
    now = datetime.now(timezone.utc).isoformat()
    rows = [
        {
            "submission_id": s["submission_id"],
            "submitted_at": s.get("submitted_at"),
            "facility_name": s.get("facility_name"),
            "county": s.get("county"),
            "scored_data": s,
            "synced_at": now,
        }
        for s in scored
        if s.get("submission_id") is not None
    ]
    await asyncio.to_thread(_sync_upsert, rows)


async def load_all_scored() -> List[Dict[str, Any]]:
    """Load the full set of scored facilities from Supabase into memory."""
    return await asyncio.to_thread(_sync_load_all)


def _sync_upsert_readiness(rows: List[Dict[str, Any]]) -> None:
    if not rows:
        return
    try:
        (
            _get_client()
            .table("facility_readiness")
            .upsert(rows, on_conflict="facility_slug")
            .execute()
        )
        logger.info("Upserted %s rows into facility_readiness", len(rows))
    except Exception as e:
        logger.error("facility_readiness upsert failed: %s", e)
        raise


async def upsert_facility_readiness(bundle: Dict[str, Any]) -> None:
    """Mirror TRIBE master scorecards into Supabase when configured."""
    if not settings.supabase_url or not settings.supabase_service_key:
        return

    now = datetime.now(timezone.utc).isoformat()
    source_path = bundle.get("source_path")
    rows = [
        {
            "facility_slug": slug,
            "facility_name": card.get("facility_name"),
            "county": card.get("county"),
            "readiness_data": card,
            "source_path": source_path,
            "synced_at": now,
        }
        for slug, card in (bundle.get("scorecards") or {}).items()
    ]
    await asyncio.to_thread(_sync_upsert_readiness, rows)
