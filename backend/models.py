from pydantic import BaseModel
from typing import Optional, Dict, Any, List


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class DomainScore(BaseModel):
    label: str
    score: Optional[float]
    tier: str


class FacilitySummary(BaseModel):
    submission_id: Optional[Any]
    submitted_at: Optional[str]
    facility_name: Optional[str]
    county: Optional[str]
    district: Optional[str]
    facility_type: Optional[str]
    operational: Optional[str]
    enumerator: Optional[str]
    overall_score: Optional[float]
    tier: str
    deployment_blocked: bool
    blockers: List[str]
    domain_scores: Dict[str, DomainScore]
    download_mbps: Optional[float]
    upload_mbps: Optional[float]
    internet_uptime: Optional[float]
    primary_power: Optional[str]
    backup_power: Optional[str]
    total_staff: Optional[int]
    daily_patients: Optional[int]
    laptops: Optional[int]
    desktops: Optional[int]
    tablets: Optional[int]
    phones: Optional[int]
    routers: Optional[int]
    access_points: Optional[int]
    photo_facility: Optional[str]
    photo_power: Optional[str]
    internet_type: Optional[str]
    isp_provider: Optional[str]
    ups_coverage: Optional[str]
    recording_method: Optional[str]
    digital_literacy_avg: Optional[float]
    staff_without_supervision_pct: Optional[float]
    supply_chain_in_scope: Optional[bool]


class CountySummary(BaseModel):
    county: str
    total: int
    tiers: Dict[str, int]


class DashboardSummary(BaseModel):
    total_submissions: int
    total_facilities: int
    completion_pct: float
    avg_score: Optional[float]
    tier_counts: Dict[str, int]
    blocked_count: int
    by_county: List[CountySummary]


class PaginatedFacilities(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[FacilitySummary]


class DistributionItem(BaseModel):
    label: str
    count: int


class ConnectivityStats(BaseModel):
    internet_type_distribution: List[DistributionItem]
    uptime_distribution: List[DistributionItem]
    avg_download_mbps: Optional[float]
    avg_upload_mbps: Optional[float]
    facilities_with_data: int


class PowerStats(BaseModel):
    primary_power_distribution: List[DistributionItem]
    backup_power_distribution: List[DistributionItem]
    ups_coverage_distribution: List[DistributionItem]


class DeviceStats(BaseModel):
    totals: Dict[str, int]
    facilities_with_devices: int
    avg_per_facility: Dict[str, float]


class CountyProgress(BaseModel):
    county: str
    submitted: int


class NearThresholdFacility(BaseModel):
    facility_name: Optional[str]
    county: Optional[str]
    overall_score: float
    tier: str
    points_to_next: float
    next_tier: str
    submission_id: Optional[Any]


class ProgressStats(BaseModel):
    county_submissions: List[CountyProgress]
    near_threshold: List[NearThresholdFacility]
    recording_methods: List[DistributionItem]
    total_submissions: int
    total_facilities: int


class AnalyticsSummary(BaseModel):
    connectivity: ConnectivityStats
    power: PowerStats
    devices: DeviceStats
    progress: ProgressStats
