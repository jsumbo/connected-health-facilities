"""
In-memory cache for TRIBE master readiness scores (workbook → optional Supabase sync).
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from config import settings
from master_readiness import MasterReadinessBundle, load_master_readiness

logger = logging.getLogger(__name__)


class MasterReadinessCache:
    def __init__(self) -> None:
        self._bundle: Optional[MasterReadinessBundle] = None
        self.last_refreshed: Optional[datetime] = None
        self.last_error: Optional[str] = None
        self.is_populated: bool = False

    def get_by_slug(self) -> Dict[str, Dict[str, Any]]:
        if not self._bundle:
            return {}
        return dict(self._bundle["scorecards"])

    def get_scorecard(self, slug: str) -> Optional[Dict[str, Any]]:
        return self.get_by_slug().get(slug)

    def blocker_register(self) -> List[Dict[str, Any]]:
        if not self._bundle:
            return []
        return list(self._bundle["blocker_register"])

    def county_summaries(self) -> List[Dict[str, Any]]:
        if not self._bundle:
            return []
        return list(self._bundle["county_summaries"])

    def cluster_summaries(self) -> List[Dict[str, Any]]:
        if not self._bundle:
            return []
        return list(self._bundle["cluster_summaries"])

    def source_path(self) -> Optional[str]:
        return self._bundle["source_path"] if self._bundle else None

    async def refresh(self) -> None:
        path = settings.master_scores_xlsx_path.strip() or None
        workbook_path = Path(path) if path else None
        try:
            bundle = await asyncio.to_thread(load_master_readiness, workbook_path)
            self._bundle = bundle
            self.is_populated = True
            self.last_error = None
            self.last_refreshed = datetime.now(timezone.utc)
            logger.info(
                "Loaded master readiness for %s facilities from %s",
                bundle["facility_count"],
                bundle["source_path"],
            )
            if settings.supabase_url and settings.supabase_service_key:
                from db import upsert_facility_readiness

                await upsert_facility_readiness(bundle)
        except Exception as exc:
            self.last_error = str(exc)
            logger.error("Master readiness load failed: %s", exc, exc_info=True)
            if not self.is_populated:
                self._bundle = None


master_cache = MasterReadinessCache()
