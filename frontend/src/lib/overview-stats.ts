import type { BlockerSummary, ProgrammeFacility, PublicOverview } from "@/lib/types-public"
import { blockerShortLabel } from "@/lib/blockers"
import { DRF_DOMAIN_KEYS, DRF_DOMAIN_LABELS, getDrfDomainScore } from "@/lib/drf-domains"
import { roundToDecimals } from "@/lib/format-number"
import { getWeakestDomain } from "@/lib/overview-insights"
import { countQuickWins, getBlockerCode } from "@/lib/quick-wins"

const TIER_1 = "Tier 1 — HOS-Ready"
const TIER_2_DEPLOY = "Tier 2 — Deployment-Eligible"
const TIER_2_REMED = "Tier 2 — Structured Remediation"

export interface OverviewScopeFilter {
  county?: string
  tier?: string
}

export interface ScopedOverviewMetrics {
  tier_counts: Record<string, number>
  tier1Count: number
  deploymentEligible: number
  structuredRemediation: number
  blocked_count: number
  quickWinsClassic: number
  quickWinsExpanded: number
  assessedDisplay: string
  assessedDescription: string | undefined
  avg_score: number | null
  domain_averages: Record<string, number | null>
  weakestDomain: ReturnType<typeof getWeakestDomain>
  sentiment_avg: number | null
  sentiment_responses: number | null
  dla_avg: number | null
  dla_responses: number | null
  blocker_register: BlockerSummary[]
  scopedFacilities: ProgrammeFacility[]
  isScoped: boolean
}

export function filterFacilitiesByScope(
  facilities: ProgrammeFacility[],
  filter: OverviewScopeFilter
): ProgrammeFacility[] {
  return facilities.filter((f) => {
    if (filter.county && f.county !== filter.county) return false
    if (filter.tier && f.tier !== filter.tier) return false
    return true
  })
}

function computeDrfDomainAverages(
  assessed: ProgrammeFacility[]
): Record<string, number | null> {
  const result: Record<string, number | null> = {}
  for (const key of DRF_DOMAIN_KEYS) {
    const values = assessed
      .map((f) => getDrfDomainScore(f.domain_scores, key))
      .filter((v): v is number => v != null)
    result[DRF_DOMAIN_LABELS[key]] =
      values.length > 0
        ? roundToDecimals(values.reduce((sum, v) => sum + v, 0) / values.length, 2)
        : null
  }
  return result
}

function buildBlockerRegister(
  assessed: ProgrammeFacility[],
  descriptionByCode: Map<string, string>
): BlockerSummary[] {
  const counts = new Map<string, number>()
  for (const facility of assessed) {
    for (const blocker of facility.blockers) {
      const code = getBlockerCode(blocker)
      if (!code) continue
      counts.set(code, (counts.get(code) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([code, count]) => ({
      code,
      description: descriptionByCode.get(code) ?? blockerShortLabel(code),
      count,
    }))
    .sort((a, b) => b.count - a.count)
}

function nationalMetrics(
  overview: PublicOverview,
  facilities: ProgrammeFacility[]
): ScopedOverviewMetrics {
  return {
    tier_counts: overview.tier_counts,
    tier1Count: overview.tier_counts[TIER_1] ?? 0,
    deploymentEligible: overview.tier_counts[TIER_2_DEPLOY] ?? 0,
    structuredRemediation: overview.tier_counts[TIER_2_REMED] ?? 0,
    blocked_count: overview.blocked_count,
    quickWinsClassic: countQuickWins(facilities, "classic"),
    quickWinsExpanded: countQuickWins(facilities, "expanded"),
    assessedDisplay: `${overview.assessed_count} / ${overview.programme_target}`,
    assessedDescription: `${overview.completion_pct}%`,
    avg_score: overview.avg_score,
    domain_averages: overview.domain_averages,
    weakestDomain: getWeakestDomain(overview.domain_averages),
    sentiment_avg: overview.sentiment_avg_enthusiasm_national ?? null,
    sentiment_responses: overview.sentiment_total_responses ?? null,
    dla_avg: overview.dla_avg_score_national ?? null,
    dla_responses: overview.dla_total_responses ?? null,
    blocker_register: overview.blocker_register ?? [],
    scopedFacilities: facilities,
    isScoped: false,
  }
}

export function computeScopedOverviewMetrics(
  facilities: ProgrammeFacility[],
  overview: PublicOverview,
  filter: OverviewScopeFilter
): ScopedOverviewMetrics {
  const isScoped = Boolean(filter.county || filter.tier)
  if (!isScoped) {
    return nationalMetrics(overview, facilities)
  }

  const scoped = filterFacilitiesByScope(facilities, filter)
  const assessed = scoped.filter((f) => f.assessment_status === "complete")

  const tier_counts: Record<string, number> = {}
  for (const facility of assessed) {
    tier_counts[facility.tier] = (tier_counts[facility.tier] ?? 0) + 1
  }

  const scores = assessed
    .map((f) => f.overall_score)
    .filter((v): v is number => v != null)
  const avg_score =
    scores.length > 0
      ? roundToDecimals(scores.reduce((sum, v) => sum + v, 0) / scores.length, 1)
      : null

  const enthusiasm = assessed
    .map((f) => f.sentiment_avg_enthusiasm)
    .filter((v): v is number => v != null)
  const sentiment_avg =
    enthusiasm.length > 0
      ? roundToDecimals(
          enthusiasm.reduce((sum, v) => sum + v, 0) / enthusiasm.length,
          2
        )
      : null
  const sentiment_responses = assessed.reduce(
    (sum, f) => sum + (f.sentiment_response_count ?? 0),
    0
  )

  const dlaScores = assessed
    .map((f) => f.dla_avg_score)
    .filter((v): v is number => v != null)
  const dla_avg =
    dlaScores.length > 0
      ? roundToDecimals(dlaScores.reduce((sum, v) => sum + v, 0) / dlaScores.length, 1)
      : null
  const dla_responses = assessed.reduce((sum, f) => sum + (f.dla_response_count ?? 0), 0)

  const domain_averages = computeDrfDomainAverages(assessed)
  const descriptionByCode = new Map(
    (overview.blocker_register ?? []).map((b) => [b.code, b.description])
  )

  let assessedDisplay: string
  let assessedDescription: string | undefined
  if (filter.county) {
    assessedDisplay = `${assessed.length} / ${scoped.length}`
    assessedDescription =
      scoped.length > 0
        ? `${roundToDecimals((100 * assessed.length) / scoped.length, 0)}%`
        : undefined
  } else {
    assessedDisplay = String(assessed.length)
    assessedDescription = filter.tier?.replace(/^Tier \d+ — /, "") ?? undefined
  }

  return {
    tier_counts,
    tier1Count: tier_counts[TIER_1] ?? 0,
    deploymentEligible: tier_counts[TIER_2_DEPLOY] ?? 0,
    structuredRemediation: tier_counts[TIER_2_REMED] ?? 0,
    blocked_count: assessed.filter((f) => f.deployment_blocked).length,
    quickWinsClassic: countQuickWins(scoped, "classic"),
    quickWinsExpanded: countQuickWins(scoped, "expanded"),
    assessedDisplay,
    assessedDescription,
    avg_score,
    domain_averages,
    weakestDomain: getWeakestDomain(domain_averages),
    sentiment_avg,
    sentiment_responses: sentiment_responses > 0 ? sentiment_responses : null,
    dla_avg,
    dla_responses: dla_responses > 0 ? dla_responses : null,
    blocker_register: buildBlockerRegister(assessed, descriptionByCode),
    scopedFacilities: scoped,
    isScoped: true,
  }
}
