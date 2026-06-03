export type ReadinessTier =
  | "Tier 1 — HOS-Ready"
  | "Tier 2 — Deployment-Eligible"
  | "Tier 3 — Structured Remediation"
  | "Tier 4 — Not Deployment-Ready"
  | "Critical Gaps"
  | "Incomplete"
  | "Not Assessed"

export interface DomainScore {
  label: string
  score: number | null
  tier: string
}

export interface ProgrammeFacility {
  slug: string
  name: string
  county: string
  county_slug: string
  district: string | null
  facility_type: string
  region: string
  cluster: string
  assessment_status: "complete" | "not_assessed"
  submission_id: number | null
  submitted_at: string | null
  overall_score: number | null
  tier: string
  deployment_blocked: boolean
  blockers: string[]
  domain_scores: Record<string, DomainScore>
  completeness_pct: number
  data_confidence: string
  missing_fields: string[]
  has_gps: boolean
  latitude: number | null
  longitude: number | null
  download_mbps: number | null
  upload_mbps: number | null
  internet_uptime: number | null
  internet_type: string | null
  mobile_signal: string | null
  network_latency: string | null
  primary_power: string | null
  backup_power: string | null
  laptops: number | null
  desktops: number | null
  tablets: number | null
  phones: number | null
  has_facility_photo?: boolean
  sentiment_status?: "complete" | "not_collected"
  sentiment_response_count?: number
  sentiment_avg_enthusiasm?: number | null
  sentiment_management_mode?: string | null
  sentiment_burden_mode?: string | null
  dla_status?: "complete" | "not_collected"
  dla_response_count?: number
  dla_avg_score?: number | null
  dla_confidence?: string | null
}

export interface FacilitySentimentSummary {
  facility_slug: string
  response_count: number
  avg_enthusiasm: number | null
  enthusiasm_min: number | null
  enthusiasm_max: number | null
  management_engagement_mode: string | null
  burden_perception_mode: string | null
  role_breakdown: Record<string, number>
  enthusiasm_distribution: Record<string, number>
  management_distribution: Record<string, number>
  burden_distribution: Record<string, number>
  data_in_meetings_distribution: Record<string, number>
  latest_submitted_at: string | null
}

export interface FacilitySentimentDetail extends FacilitySentimentSummary {
  facility_name: string
  county: string | null
  district: string | null
  region: string | null
}

export interface SentimentCoverage {
  registry_count: number
  facilities_with_responses: number
  missing_from_survey: string[]
  extras_not_in_registry: string[]
  total_responses: number
}

export interface SentimentOverview {
  form_name: string | null
  configured: boolean
  populated: boolean
  last_error: string | null
  raw_submission_count: number
  coverage: SentimentCoverage
  facilities: FacilitySentimentSummary[]
  last_refreshed: string | null
}

export interface FacilityDlaSummary {
  facility_slug: string
  response_count: number
  avg_score: number | null
  score_min: number | null
  score_max: number | null
  role_breakdown: Record<string, number>
  administration_breakdown: Record<string, number>
  latest_submitted_at: string | null
  confidence: string
}

export interface FacilityDlaDetail extends FacilityDlaSummary {
  facility_name: string
  county: string | null
  district: string | null
  region: string | null
}

export interface DlaCoverage {
  registry_count: number
  facilities_with_responses: number
  missing_from_survey: string[]
  extras_not_in_registry: string[]
  total_responses: number
}

export interface DlaOverview {
  form_name: string | null
  configured: boolean
  populated: boolean
  last_error: string | null
  raw_submission_count: number
  coverage: DlaCoverage
  facilities: FacilityDlaSummary[]
  last_refreshed: string | null
}

export interface CountyRollup {
  county: string
  total: number
  assessed: number
  tiers: Record<string, number>
}

export interface ClusterRollup {
  cluster: string
  region: string
  facility_count: number
  avg_score: number | null
}

export interface PublicOverview {
  programme_target: number
  total_in_registry: number
  assessed_count: number
  not_assessed_count: number
  completion_pct: number
  avg_score: number | null
  tier_counts: Record<string, number>
  blocked_count: number
  low_data_quality_count: number
  by_county: CountyRollup[]
  by_cluster: ClusterRollup[]
  domain_averages: Record<string, number | null>
  last_refreshed: string | null
  cache_populated: boolean
  sentiment_facilities_count?: number
  sentiment_completion_pct?: number
  sentiment_avg_enthusiasm_national?: number | null
  sentiment_total_responses?: number
  sentiment_last_refreshed?: string | null
  dla_facilities_count?: number
  dla_completion_pct?: number
  dla_avg_score_national?: number | null
  dla_total_responses?: number
  dla_last_refreshed?: string | null
}

export interface DataQualityReport {
  programme_target: number
  not_assessed: ProgrammeFacility[]
  low_completeness: ProgrammeFacility[]
  missing_gps: ProgrammeFacility[]
  facilities: ProgrammeFacility[]
}
