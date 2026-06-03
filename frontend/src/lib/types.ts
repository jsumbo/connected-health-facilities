export type Tier =
  | "Deployment Ready"
  | "Foundational"
  | "Not Ready"
  | "Blocked"
  | "Incomplete";

export interface DomainScore {
  label: string;
  score: number | null;
  tier: Tier;
}

export interface FacilitySummary {
  submission_id: number | null;
  submitted_at: string | null;
  facility_name: string | null;
  county: string | null;
  district: string | null;
  facility_type: string | null;
  operational: string | null;
  enumerator: string | null;
  overall_score: number | null;
  tier: Tier;
  deployment_blocked: boolean;
  blockers: string[];
  domain_scores: Record<string, DomainScore>;
  download_mbps: number | null;
  upload_mbps: number | null;
  internet_uptime: number | null;
  primary_power: string | null;
  backup_power: string | null;
  total_staff: number | null;
  daily_patients: number | null;
  laptops: number | null;
  desktops: number | null;
  tablets: number | null;
  phones: number | null;
  routers: number | null;
  access_points: number | null;
  photo_facility: string | null;
  photo_power: string | null;
  internet_type: string | null;
  isp_provider: string | null;
  ups_coverage: string | null;
  recording_method: string | null;
  digital_literacy_avg: number | null;
  staff_without_supervision_pct: number | null;
  supply_chain_in_scope: boolean | null;
}

export interface CountySummary {
  county: string;
  total: number;
  tiers: Record<string, number>;
}

export interface PaginatedFacilities {
  total: number;
  limit: number;
  offset: number;
  items: FacilitySummary[];
}

export interface DistributionItem {
  label: string;
  count: number;
}

export interface ConnectivityStats {
  internet_type_distribution: DistributionItem[];
  uptime_distribution: DistributionItem[];
  avg_download_mbps: number | null;
  avg_upload_mbps: number | null;
  facilities_with_data: number;
}

export interface PowerStats {
  primary_power_distribution: DistributionItem[];
  backup_power_distribution: DistributionItem[];
  ups_coverage_distribution: DistributionItem[];
}

export interface DeviceStats {
  totals: Record<string, number>;
  facilities_with_devices: number;
  avg_per_facility: Record<string, number>;
}

export interface CountyProgress {
  county: string;
  submitted: number;
}

export interface NearThresholdFacility {
  facility_name: string | null;
  county: string | null;
  overall_score: number;
  tier: string;
  points_to_next: number;
  next_tier: string;
  submission_id: number | null;
}

export interface ProgressStats {
  county_submissions: CountyProgress[];
  near_threshold: NearThresholdFacility[];
  recording_methods: DistributionItem[];
  total_submissions: number;
  total_facilities: number;
}

export interface AnalyticsSummary {
  connectivity: ConnectivityStats;
  power: PowerStats;
  devices: DeviceStats;
  progress: ProgressStats;
}

export interface DashboardSummary {
  total_submissions: number;
  total_facilities: number;
  completion_pct: number;
  avg_score: number | null;
  tier_counts: Record<string, number>;
  blocked_count: number;
  by_county: CountySummary[];
}
