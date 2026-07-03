import type { ProgrammeFacility } from "@/lib/types-public"
import { DRF_DOMAIN_CODES, DRF_DOMAIN_KEYS, type DrfDomainKey } from "@/lib/drf-domains"
import { formatCorrelation, normalizeCompositePercent, roundToDecimals } from "@/lib/format-number"
import {
  classifyScatterPoint,
  SCATTER_TIER_COLORS,
  type ScatterTierCategory,
} from "@/lib/scatter-tier"

function tierCategoryKey(category: ScatterTierCategory): string {
  if (category === "tier1") return "T1"
  if (category === "tier2") return "T2"
  return "T3"
}

export interface DriverCorrelation {
  factor: string
  key: string
  correlation: number
  sampleSize: number
}

export interface DlaScatterPoint {
  slug: string
  name: string
  county: string
  tier: string
  tierCategory: ScatterTierCategory
  tierKey: string
  dla: number
  composite: number
  color: string
}

function assessedWithComposite(facilities: ProgrammeFacility[]): ProgrammeFacility[] {
  return facilities.filter(
    (f) => f.assessment_status === "complete" && f.overall_score != null
  )
}

export function pearsonCorrelation(xs: number[], ys: number[]): number | null {
  if (xs.length !== ys.length || xs.length < 3) return null

  const n = xs.length
  const meanX = xs.reduce((sum, v) => sum + v, 0) / n
  const meanY = ys.reduce((sum, v) => sum + v, 0) / n

  let numerator = 0
  let denomX = 0
  let denomY = 0

  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX
    const dy = ys[i] - meanY
    numerator += dx * dy
    denomX += dx * dx
    denomY += dy * dy
  }

  const denominator = Math.sqrt(denomX * denomY)
  if (denominator === 0) return null
  return numerator / denominator
}

const DOMAIN_FACTOR_LABELS: Record<DrfDomainKey, string> = {
  D_POW: "Power",
  D_CON: "Connectivity",
  D_ICT: "ICT hardware",
  D_DIG: "Digital literacy",
  D_SEN: "Staff sentiment",
  D_DAT: "Data maturity",
}

function correlateFactor(
  facilities: ProgrammeFacility[],
  pairs: Array<{ x: number; y: number }>,
  factor: string,
  key: string
): DriverCorrelation | null {
  if (pairs.length < 3) return null
  const r = pearsonCorrelation(
    pairs.map((p) => p.x),
    pairs.map((p) => p.y)
  )
  if (r == null) return null
  return {
    factor,
    key,
    correlation: roundToDecimals(r, 2),
    sampleSize: pairs.length,
  }
}

export function computeDriverCorrelations(
  facilities: ProgrammeFacility[]
): DriverCorrelation[] {
  const assessed = assessedWithComposite(facilities)
  const results: DriverCorrelation[] = []

  for (const domainKey of DRF_DOMAIN_KEYS) {
    const pairs = assessed
      .map((f) => {
        const domain =
          f.domain_scores[domainKey]?.score ??
          f.domain_scores[DRF_DOMAIN_CODES[domainKey]]?.score
        if (domain == null) return null
        return { x: domain, y: f.overall_score as number }
      })
      .filter((p): p is { x: number; y: number } => p != null)

    const entry = correlateFactor(
      assessed,
      pairs,
      DOMAIN_FACTOR_LABELS[domainKey],
      domainKey
    )
    if (entry) results.push(entry)
  }

  const devicePairs = assessed
    .map((f) => {
      const devices =
        (f.laptops ?? 0) + (f.desktops ?? 0) + (f.tablets ?? 0)
      return { x: devices, y: f.overall_score as number }
    })
    .filter((p) => p.x > 0)

  const deviceEntry = correlateFactor(assessed, devicePairs, "Device count", "devices")
  if (deviceEntry) results.push(deviceEntry)

  const dlaPairs = assessed
    .filter((f) => f.dla_avg_score != null)
    .map((f) => ({ x: f.dla_avg_score as number, y: f.overall_score as number }))

  const dlaEntry = correlateFactor(assessed, dlaPairs, "DLA score", "dla")
  if (dlaEntry) results.push(dlaEntry)

  const enthusiasmPairs = assessed
    .filter((f) => f.sentiment_avg_enthusiasm != null)
    .map((f) => ({
      x: f.sentiment_avg_enthusiasm as number,
      y: f.overall_score as number,
    }))

  const enthusiasmEntry = correlateFactor(
    assessed,
    enthusiasmPairs,
    "Staff enthusiasm",
    "enthusiasm"
  )
  if (enthusiasmEntry) results.push(enthusiasmEntry)

  return results.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
}

export function buildDlaScatterPoints(facilities: ProgrammeFacility[]): DlaScatterPoint[] {
  const eligible = facilities.filter(
    (f) =>
      f.assessment_status === "complete" &&
      f.overall_score != null &&
      f.dla_avg_score != null
  )

  return eligible.map((f) => {
    const tierCategory = classifyScatterPoint(f) ?? "tier3"
    const composite = normalizeCompositePercent(f.overall_score)
    return {
      slug: f.slug,
      name: f.name,
      county: f.county,
      tier: f.tier ?? "",
      tierCategory,
      tierKey: tierCategoryKey(tierCategory),
      dla: f.dla_avg_score as number,
      composite: composite ?? 0,
      color: SCATTER_TIER_COLORS[tierCategory],
    }
  })
}

export function linearRegression(
  points: Array<{ x: number; y: number }>
): { slope: number; intercept: number } | null {
  if (points.length < 2) return null

  const n = points.length
  const sumX = points.reduce((sum, p) => sum + p.x, 0)
  const sumY = points.reduce((sum, p) => sum + p.y, 0)
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)
  const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0)

  const denominator = n * sumXX - sumX * sumX
  if (denominator === 0) return null

  const slope = (n * sumXY - sumX * sumY) / denominator
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

export function correlationStrengthLabel(r: number): string {
  const abs = Math.abs(r)
  if (abs >= 0.6) return "Strong"
  if (abs >= 0.35) return "Moderate"
  if (abs >= 0.15) return "Weak"
  return "Minimal"
}

/** Plain-language correlation for dashboard labels (0–1, higher = moves with readiness). */
export function formatCorrelationScore(r: number): string {
  return formatCorrelation(r)
}

export function formatCorrelationSummary(r: number): string {
  return `${formatCorrelationScore(r)} · ${correlationStrengthLabel(r)} link`
}

export function correlationBarColor(r: number): string {
  const abs = Math.abs(r)
  if (abs >= 0.6) return "#1e4d7b"
  if (abs >= 0.35) return "#0d9488"
  if (abs >= 0.15) return "#d97706"
  return "#94a3b8"
}
