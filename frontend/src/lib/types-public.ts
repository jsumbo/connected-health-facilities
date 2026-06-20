export type ReadinessTier =
  | "Tier 1 — HOS-Ready"
  | "Tier 2 — Deployment-Eligible"
  | "Tier 2 — Structured Remediation"
  | "Tier 3 — Not Deployment-Ready"
  | "Critical Gaps"
  | "Incomplete"
  | "Not Assessed"

export interface BlockerItem {
  code: string
  remediation: string
}

export interface QualityFlag {
  code: string
  label: string
  detail: string
  severity: "warning" | "critical"
}

export interface DomainScore {
  code?: string
  label: string
  score: number | null
  max_score?: number
  weight_pct?: number
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
  tier_raw?: string | null
  wave?: string | null
  deployment_blocked: boolean
  blocker_codes?: string[]
  blockers: Array<BlockerItem | string>
  blocker_remediation?: string | null
  domain_scores: Record<string, DomainScore>
  scoring_source?: string | null
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
  master_sentiment_n?: number | null
  master_dla_n?: number | null
  quality_flags?: QualityFlag[]
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

export interface InstrumentConfidenceSummary {
  min_n: number
  sufficient_count: number
  indicative_count: number
  master_live_mismatch_count: number
  master_live_mismatches: Array<{
    slug: string
    name: string
    master_n: number
    live_n: number
  }>
}

export interface SentimentOverview {
  form_name: string | null
  configured: boolean
  populated: boolean
  last_error: string | null
  raw_submission_count: number
  coverage: SentimentCoverage
  facilities: FacilitySentimentSummary[]
  confidence_summary?: InstrumentConfidenceSummary
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
  confidence_summary?: InstrumentConfidenceSummary
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

export interface BlockerRegisterEntry {
  facility_name: string
  facility_slug: string | null
  county: string | null
  composite: number | null
  tier: string | null
  blocker_codes: string[]
  remediation_pathway: string | null
}

export interface BlockerRegister {
  total: number
  items: BlockerRegisterEntry[]
  master_populated: boolean
  last_refreshed: string | null
  source_path: string | null
}

export interface BlockerSummary {
  code: string
  description: string
  count: number
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
  domain_scale_max?: number
  last_refreshed: string | null
  cache_populated: boolean
  master_populated?: boolean
  master_last_refreshed?: string | null
  master_source_path?: string | null
  master_facility_count?: number
  blocker_register_count?: number
  blocker_register?: BlockerSummary[]
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
  sentiment_insufficient: ProgrammeFacility[]
  dla_insufficient: ProgrammeFacility[]
  adoption_risk: ProgrammeFacility[]
  instrument_confidence?: {
    min_n: number
    sentiment_sufficient_count: number
    sentiment_indicative_count: number
    dla_sufficient_count: number
    dla_indicative_count: number
    sentiment_master_live_mismatch_count: number
    dla_master_live_mismatch_count: number
  }
  facilities: ProgrammeFacility[]
}

export interface RoadmapFacility {
  slug: string
  name: string
  county: string
  composite: number | null
  tier: string | null
  blocker_codes: string[]
  blocker_remediation: string | null
}

export interface RoadmapWaves {
  "Wave 1": RoadmapFacility[]
  "Wave 2": RoadmapFacility[]
  "Wave 3": RoadmapFacility[]
  blocked: RoadmapFacility[]
}

export interface RoadmapCountyRollup {
  county: string
  tier_1_count: number
  wave_2_count: number
  wave_3_count: number
  blocked_count: number
  facility_count: number
  avg_composite: number | null
}

export interface RoadmapSummary {
  wave_1_count: number
  wave_2_count: number
  wave_3_count: number
  blocked_count: number
  total_assessed: number
}

export interface PublicRoadmap {
  waves: RoadmapWaves
  by_county: RoadmapCountyRollup[]
  summary: RoadmapSummary
  master_populated: boolean
  last_refreshed: string | null
}

export interface ClusterSummary {
  cluster: string
  region: string | null
  facility_count: number
  avg_composite: number | null
  tier_counts: Record<string, number>
  domain_averages: Record<string, number | null>
  avg_dla_score: number | null
  avg_sentiment_enthusiasm: number | null
}

export interface ClusterOverview {
  clusters: ClusterSummary[]
  total_clusters: number
  national_domain_averages: Record<string, number | null>
  last_refreshed: string | null
  master_populated: boolean
}

export interface IctScoreLevel {
  level: number
  count: number
  pct: number
}

export interface IctDomainDistribution {
  key: string
  code: string
  label: string
  levels: IctScoreLevel[]
}

export interface IctGapFacility {
  facility_name: string
  facility_slug: string | null
  county: string | null
  cluster: string | null
  blocker_codes: string[]
  d_pow: number | null
  d_con: number | null
  d_ict: number | null
}

export interface IctZeroFacility {
  facility_name: string
  facility_slug: string | null
  county: string | null
  cluster: string | null
  domain_key: string
  domain_code: string
  score: number
}

export interface IctGapReport {
  assessed_count: number
  distributions: IctDomainDistribution[]
  zero_score_facilities: IctZeroFacility[]
  ict_blocker_facilities: IctGapFacility[]
  last_refreshed: string | null
  master_populated: boolean
}

export interface GapMatrixRow {
  gap: string
  significance: string
  intervention: string
  provision: string
  facility_count: number
}

export interface GapMatrix {
  items: GapMatrixRow[]
  total_facilities: number
  last_refreshed: string | null
  master_populated: boolean
}

export interface QuestionStat {
  questionNumber: number
  questionText: string
  correctCount: number
  totalResponses: number
  correctRate: number
}
