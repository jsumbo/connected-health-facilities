"""
In-memory cache for Staff Sentiment Survey submissions (second Kobo asset).
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from config import settings
from kobo import fetch_asset_submissions, fetch_asset_metadata
from sentiment import aggregate_by_facility, build_coverage_report
from facility_master import FACILITY_REGISTRY

logger = logging.getLogger(__name__)


class _SentimentCache:
    def __init__(self) -> None:
        self._by_slug: Dict[str, Dict[str, Any]] = {}
        self._raw_count: int = 0
        self._form_name: Optional[str] = None
        self._last_refreshed: Optional[datetime] = None
        self._last_error: Optional[str] = None
        self._lock = asyncio.Lock()

    @property
    def is_configured(self) -> bool:
        return bool(settings.kobo_sentiment_asset_uid.strip())

    @property
    def is_populated(self) -> bool:
        return self._last_refreshed is not None and self._last_error is None

    @property
    def last_refreshed(self) -> Optional[datetime]:
        return self._last_refreshed

    @property
    def last_error(self) -> Optional[str]:
        return self._last_error

    @property
    def form_name(self) -> Optional[str]:
        return self._form_name

    @property
    def raw_submission_count(self) -> int:
        return self._raw_count

    def get_by_slug(self) -> Dict[str, Dict[str, Any]]:
        return dict(self._by_slug)

    def get(self, slug: str) -> Optional[Dict[str, Any]]:
        return self._by_slug.get(slug)

    def coverage(self) -> Dict[str, Any]:
        slugs = [f["slug"] for f in FACILITY_REGISTRY]
        return build_coverage_report(self._by_slug, slugs)

    async def refresh(self) -> None:
        if not self.is_configured:
            self._last_error = "KOBO_SENTIMENT_ASSET_UID not set"
            logger.warning("Sentiment cache skipped: %s", self._last_error)
            return

        async with self._lock:
            try:
                meta = await fetch_asset_metadata(settings.kobo_sentiment_asset_uid)
                self._form_name = meta.get("name")
                raw = await fetch_asset_submissions(settings.kobo_sentiment_asset_uid)
                self._raw_count = len(raw)
                aggregated = aggregate_by_facility(raw)
                self._by_slug = {k: dict(v) for k, v in aggregated.items()}
                self._last_refreshed = datetime.now(timezone.utc)
                self._last_error = None
                cov = self.coverage()
                logger.info(
                    "Sentiment cache loaded — %s responses, %s/%s facilities",
                    self._raw_count,
                    cov["facilities_with_responses"],
                    cov["registry_count"],
                )
            except Exception as exc:
                self._last_error = str(exc)
                logger.error("Sentiment cache refresh failed: %s", exc)


sentiment_cache = _SentimentCache()
