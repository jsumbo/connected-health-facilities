"""
In-memory cache for Digital Literacy Assessment CSV responses.
"""

import asyncio
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from config import settings
from dla import aggregate_by_facility, build_coverage_report, load_csv_rows
from facility_master import FACILITY_REGISTRY

logger = logging.getLogger(__name__)

_DEFAULT_CSV = Path(__file__).resolve().parent / "data" / "Digital Literacy Assessment - Form Responses.csv"


class _DlaCache:
    def __init__(self) -> None:
        self._by_slug: Dict[str, Dict[str, Any]] = {}
        self._raw_count: int = 0
        self._last_refreshed: Optional[datetime] = None
        self._last_error: Optional[str] = None
        self._lock = asyncio.Lock()

    @property
    def csv_path(self) -> Path:
        configured = settings.dla_csv_path.strip()
        return Path(configured) if configured else _DEFAULT_CSV

    @property
    def is_configured(self) -> bool:
        return self.csv_path.is_file()

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
        async with self._lock:
            path = self.csv_path
            if not path.is_file():
                self._last_error = f"DLA CSV not found: {path}"
                logger.warning("DLA cache skipped: %s", self._last_error)
                return

            try:
                raw = load_csv_rows(path)
                self._raw_count = len(raw)
                aggregated = aggregate_by_facility(raw)
                self._by_slug = {k: dict(v) for k, v in aggregated.items()}
                self._last_refreshed = datetime.now(timezone.utc)
                self._last_error = None
                cov = self.coverage()
                logger.info(
                    "DLA cache loaded — %s responses, %s/%s facilities",
                    self._raw_count,
                    cov["facilities_with_responses"],
                    cov["registry_count"],
                )
            except Exception as exc:
                self._last_error = str(exc)
                logger.error("DLA cache refresh failed: %s", exc)


dla_cache = _DlaCache()
