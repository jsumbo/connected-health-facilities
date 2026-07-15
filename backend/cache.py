import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class _SubmissionCache:
    def __init__(self):
        self._data: List[Dict[str, Any]] = []
        self._last_refreshed: Optional[datetime] = None
        self._last_error: Optional[str] = None
        self._new_on_last_sync: int = 0
        self._lock = asyncio.Lock()

    @property
    def is_populated(self) -> bool:
        return self._last_refreshed is not None

    @property
    def last_refreshed(self) -> Optional[datetime]:
        return self._last_refreshed

    @property
    def last_error(self) -> Optional[str]:
        return self._last_error

    @property
    def new_on_last_sync(self) -> int:
        return self._new_on_last_sync

    def get(self) -> List[Dict[str, Any]]:
        return list(self._data)

    async def refresh(self) -> None:
        """
        Diff sync:
          1. Get the highest kobo_id already in Supabase.
          2. Try to fetch only Kobo submissions newer than that id (skip if API fails).
          3. If new submissions found, score and upsert them.
          4. Load the full dataset from Supabase into memory.

        On failure, stale data is kept so the dashboard stays up.
        """
        from db import upsert_submissions, load_all_scored
        from kobo import fetch_new_submissions
        from scoring import score_all

        async with self._lock:
            try:

                raw_submissions: list = []
                try:
                    raw_submissions = await fetch_new_submissions(0)
                except Exception as kobo_err:
                    logger.warning(f"KoboToolbox sync skipped: {kobo_err}. Loading existing data.")

                if raw_submissions:
                    scored = score_all(raw_submissions)
                    await upsert_submissions(scored)
                    self._new_on_last_sync = len(scored)
                    logger.info(f"Synced {len(scored)} submissions from KoboToolbox")
                else:
                    self._new_on_last_sync = 0
                    logger.info("No submissions returned from KoboToolbox")

                # Always load existing data from Supabase, even if KoboToolbox failed
                self._data = await load_all_scored()
                self._last_refreshed = datetime.now(timezone.utc)
                self._last_error = None
                logger.info(f"Cache loaded — {len(self._data)} total facilities in memory")

            except Exception as exc:
                self._last_error = str(exc)
                logger.error(f"Cache refresh failed (stale data served): {exc}")


cache = _SubmissionCache()
