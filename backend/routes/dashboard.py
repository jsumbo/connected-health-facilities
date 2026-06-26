from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from auth import get_current_user
from scoring import aggregate_summary, aggregate_analytics
from models import FacilitySummary, DashboardSummary, PaginatedFacilities, AnalyticsSummary
from cache import cache
from facility_filters import matches_facility_type

router = APIRouter()

_NOT_READY = HTTPException(status_code=503, detail="Data not yet loaded — try again in a few seconds.")


def _require_cache() -> List[dict]:
    if not cache.is_populated:
        raise _NOT_READY
    return cache.get()


def _filter_scored(scored: List[dict], facility_type: Optional[str]) -> List[dict]:
    if not facility_type:
        return scored
    return [s for s in scored if matches_facility_type(s.get("facility_type"), facility_type)]


@router.get("/summary", response_model=DashboardSummary)
async def get_summary(
    facility_type: Optional[str] = Query(None, description="Filter by facility type: hospital | health_centre | clinic"),
    current_user: dict = Depends(get_current_user),
):
    """Programme-level summary: counts, tiers, completion, county breakdown."""
    return aggregate_summary(_filter_scored(_require_cache(), facility_type))


@router.get("/facilities", response_model=PaginatedFacilities)
async def get_facilities(
    county: Optional[str] = Query(None, description="Filter by county name"),
    tier: Optional[str] = Query(None, description="Filter by tier: Deployment Ready | Foundational | Not Ready | Blocked"),
    blocked: Optional[bool] = Query(None, description="Filter to only blocked (true) or unblocked (false) facilities"),
    facility_type: Optional[str] = Query(None, description="Filter by facility type: hospital | health_centre | clinic"),
    limit: int = Query(50, ge=1, le=200, description="Results per page"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    current_user: dict = Depends(get_current_user),
):
    """All facilities with scores. Filterable by county, tier, blocked status, and facility type. Paginated."""
    scored = _filter_scored(_require_cache(), facility_type)

    if county:
        scored = [s for s in scored if (s.get("county") or "").lower() == county.lower()]
    if tier:
        scored = [s for s in scored if s.get("tier") == tier]
    if blocked is not None:
        scored = [s for s in scored if s.get("deployment_blocked") == blocked]

    total = len(scored)
    page = scored[offset: offset + limit]

    return PaginatedFacilities(total=total, limit=limit, offset=offset, items=page)


@router.get("/facilities/{submission_id}", response_model=FacilitySummary)
async def get_facility(
    submission_id: int,
    current_user: dict = Depends(get_current_user),
):
    """Single facility detail by KoboToolbox submission ID."""
    scored = _require_cache()
    match = next((s for s in scored if str(s.get("submission_id")) == str(submission_id)), None)
    if not match:
        raise HTTPException(status_code=404, detail="Facility submission not found")
    return match


@router.get("/cache/status", tags=["cache"])
async def cache_status(current_user: dict = Depends(get_current_user)):
    """When was the cache last refreshed and how many facilities are loaded."""
    return {
        "populated": cache.is_populated,
        "last_refreshed": cache.last_refreshed.isoformat() if cache.last_refreshed else None,
        "total_facilities_cached": len(cache.get()),
        "new_on_last_sync": cache.new_on_last_sync,
        "last_error": cache.last_error,
    }


@router.get("/analytics", response_model=AnalyticsSummary)
async def get_analytics(
    facility_type: Optional[str] = Query(None, description="Filter by facility type: hospital | health_centre | clinic"),
    current_user: dict = Depends(get_current_user),
):
    """Infrastructure, power, device, and deployment-progress analytics."""
    return aggregate_analytics(_filter_scored(_require_cache(), facility_type))


@router.post("/cache/sync", tags=["cache"])
async def trigger_sync(current_user: dict = Depends(get_current_user)):
    """Manually trigger an immediate Kobo → Supabase diff sync."""
    await cache.refresh()
    return {
        "message": "Sync complete",
        "last_refreshed": cache.last_refreshed.isoformat() if cache.last_refreshed else None,
        "total_facilities_cached": len(cache.get()),
        "new_on_last_sync": cache.new_on_last_sync,
        "error": cache.last_error,
    }
