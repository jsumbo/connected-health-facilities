import type {
  BlockerSummary,
  ClusterSummary,
  CountyRollup,
  ProgrammeFacility,
  PublicOverview,
  QuestionStat,
} from "@/lib/types-public"
import { unlockCountForBlocker } from "@/lib/blockers"
import { filterQuickWins } from "@/lib/quick-wins"
import { getTopBlocker, getWeakestDomain } from "@/lib/overview-insights"
import type { DriverCorrelation } from "@/lib/readiness-drivers"
import { formatCorrelationScore } from "@/lib/readiness-drivers"

export function buildOverviewHeadlineNote(
  overview: PublicOverview,
  quickWinsCount: number,
  tier1Count: number,
  blockedCount: number
): string {
  const topBlocker = getTopBlocker(overview.blocker_register)
  const weakest = getWeakestDomain(overview.domain_averages)
  const parts: string[] = []

  parts.push(
    tier1Count > 0
      ? `${tier1Count} ${tier1Count === 1 ? "facility is" : "facilities are"} HOS-ready now`
      : "No facility is HOS-ready yet"
  )

  if (quickWinsCount > 0) {
    parts.push(
      `${quickWinsCount} ${quickWinsCount === 1 ? "facility has" : "facilities have"} one blocker at ≥65% readiness`
    )
  }

  if (blockedCount > 0) {
    parts.push(`${blockedCount} ${blockedCount === 1 ? "facility is" : "facilities are"} Tier 3 with blockers`)
  }

  if (topBlocker) {
    parts.push(`${topBlocker.code} is the most common blocker (${topBlocker.count} facilities)`)
  }

  if (weakest) {
    parts.push(
      `${weakest.label} is the lowest domain nationally (${weakest.value.toFixed(2)} of 3)`
    )
  }

  return `${parts.join(". ")}.`
}

export function buildTierChartNote(tierCounts: Record<string, number>): string {
  const tier3 = tierCounts["Tier 3 — Not Deployment-Ready"] ?? 0
  const tier1 = tierCounts["Tier 1 — HOS-Ready"] ?? 0
  const tier2Eligible = tierCounts["Tier 2 — Deployment-Eligible"] ?? 0
  const tier2Remed = tierCounts["Tier 2 — Structured Remediation"] ?? 0
  const tier2 = tier2Eligible + tier2Remed
  const total = tier1 + tier2 + tier3

  if (tier3 > tier1 + tier2) {
    return `${tier3} of ${total} assessed facilities are Tier 3. Most are held back by blockers rather than uniformly low scores.`
  }

  return `${tier1} Tier 1 · ${tier2} Tier 2 · ${tier3} Tier 3 (${total} facilities). Click a segment to filter.`
}

export function buildCountyChartNote(counties: CountyRollup[]): string {
  if (!counties.length) return "County breakdown appears once assessments are complete."

  const sorted = [...counties].sort((a, b) => b.assessed - a.assessed)
  const top = sorted[0]
  const sparse = counties.filter((c) => c.assessed < c.total)

  let note = `${top.county} has the most assessed facilities (${top.assessed}).`
  if (sparse.length > 0) {
    note += ` ${sparse.length} ${sparse.length === 1 ? "county has" : "counties have"} facilities still pending assessment.`
  }
  return note
}

export function buildDomainChartNote(
  domainAverages: Record<string, number | null>,
  isScoped: boolean
): string {
  const weakest = getWeakestDomain(domainAverages)
  if (!weakest) return "Domain scores use the 0–3 DRF scale (shown as % of max in tooltips)."

  const scope = isScoped ? "in the current filter" : "nationally"
  return `Infrastructure domains (power, connectivity, ICT) track readiness more closely than literacy or sentiment. ${weakest.label} is weakest ${scope} at ${weakest.value.toFixed(2)} of 3.`
}

export function buildBlockerChartNote(
  blockers: BlockerSummary[],
  facilities: ProgrammeFacility[]
): string {
  if (!blockers.length) {
    return "No deployment blockers are recorded for the current selection."
  }

  const sorted = [...blockers].sort((a, b) => b.count - a.count)
  const top = sorted[0]
  const second = sorted[1]
  const unlock = top ? unlockCountForBlocker(facilities, top.code) : 0

  let note = `Facilities are Tier 3 because of named blockers, not composite score alone. ${top.code} affects ${top.count} facilities`
  if (second) {
    note += `; ${second.code} affects ${second.count}`
  }
  note += `.`
  if (unlock > 0 && top) {
    note += ` Resolving ${top.code} alone would move ${unlock} ${unlock === 1 ? "facility" : "facilities"} that have only that blocker.`
  }
  return note
}

export function buildClusterListNote(byCluster: PublicOverview["by_cluster"]): string {
  if (!byCluster.length) return "Cluster rollups combine counties into six deployment groups."

  const sorted = [...byCluster].sort(
    (a, b) => (b.avg_score ?? 0) - (a.avg_score ?? 0)
  )
  const highest = sorted[0]
  const lowest = sorted[sorted.length - 1]

  if (!highest || !lowest) {
    return "Click a cluster to open the facilities list with that filter applied."
  }

  return `${highest.cluster} leads on average digital readiness (${highest.avg_score != null ? `${Math.round(highest.avg_score)}%` : "—"}); ${lowest.cluster} is lowest (${lowest.avg_score != null ? `${Math.round(lowest.avg_score)}%` : "—"}). Each row links to facilities in that cluster.`
}

export function buildQuickWinsScatterNote(facilities: ProgrammeFacility[]): string {
  const wins = filterQuickWins(facilities, "expanded")
  if (!wins.length) {
    return "No assessed facility meets ≥65% readiness with exactly one blocker in this dataset."
  }

  const examples = [...wins]
    .sort((a, b) => (b.overall_score ?? 0) - (a.overall_score ?? 0))
    .slice(0, 4)
    .map((f) => f.name)

  return `${wins.length} ${wins.length === 1 ? "facility scores" : "facilities score"} ≥65% with a single blocker — the shortest path to add Wave 1 sites. Upper-right on the chart: ${examples.join(", ")}.`
}

export function buildQuickWinsQueueNote(
  facilities: ProgrammeFacility[],
  mode: "expanded" | "classic"
): string {
  const wins = filterQuickWins(facilities, mode)
  if (!wins.length) return "The ranked queue lists fixable sites once they meet the view criteria."

  return mode === "expanded"
    ? "Sorted by composite score. Each row shows the one blocker to clear and the remediation path from the TRIBE register."
    : "All Tier 3 facilities with exactly one blocker, regardless of composite score."
}

export function buildBlockerHeatmapNote(): string {
  return "Rows are deployment clusters; columns are blocker types. Counts are Tier 3 facilities only — use this to see where the same fix applies across geography."
}

export function buildClusterCardNote(cluster: ClusterSummary): string {
  const tier3 = cluster.tier_counts["Tier 3 — Not Deployment-Ready"] ?? 0
  const tier1 = cluster.tier_counts["Tier 1 — HOS-Ready"] ?? 0
  const avg = cluster.avg_composite

  if (tier3 > 0 && tier1 === 0) {
    return `${tier3} Tier 3 ${tier3 === 1 ? "facility" : "facilities"} in this cluster; domain bars show where infrastructure gaps concentrate.`
  }

  if (avg != null && avg >= 65) {
    return `Average composite ${avg.toFixed(1)}%. Compare domain bars across clusters to spot relative strengths and gaps.`
  }

  return `${cluster.facility_count} facilities. Domain bars use the same 0–3 scale as the national dashboard.`
}

export function buildClustersPageNote(clusters: ClusterSummary[]): string {
  if (!clusters.length) return "Six programme clusters group counties for phased rollout."

  const total = clusters.reduce((sum, c) => sum + c.facility_count, 0)
  return `${total} facilities across ${clusters.length} clusters. Each card links to a filtered facility list; compare domain bars to see infrastructure vs workforce gaps by region.`
}

export function buildDlaQuestionsNote(questions: QuestionStat[]): string | null {
  if (!questions.length) return null
  const sorted = [...questions].sort((a, b) => a.correctRate - b.correctRate)
  const weakest = sorted[0]
  if (!weakest) return null

  const label = weakest.questionText.toLowerCase().includes("phish")
    ? "Phishing and password security"
    : `Question ${weakest.questionNumber}`

  return `${label} scores lowest at ${Math.round(weakest.correctRate)}% correct nationally. That gap appears across cadres and should be covered before facilities connect to the national platform.`
}

export function buildDlaFacilityTableNote(rowCount: number, responseTotal?: number): string {
  const responses = responseTotal != null ? `${responseTotal} staff responses` : "staff responses"
  return `Facility means from ${responses}. Rows marked indicative have fewer than three DLA responses; domain weight for D-DIG is reduced for those sites. Showing ${rowCount} facilities.`
}

export function buildSentimentEnthusiasmNote(
  distribution: Record<string, number>,
  facilityCount: number
): string {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0)
  if (total === 0) {
    return "Enthusiasm distribution will populate as survey responses are linked to facilities."
  }

  const high = (distribution["9"] ?? 0) + (distribution["10"] ?? 0)
  const highPct = Math.round((high / total) * 100)

  return `${total} responses across ${facilityCount} facilities. ${highPct}% score 9–10, so facility means look high — read the histogram for spread and low-scoring sites.`
}

export function buildSentimentManagementNote(distribution: Record<string, number>): string {
  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1])
  if (!entries.length) {
    return "Management engagement categories come from the staff sentiment survey."
  }

  const [topLabel, topCount] = entries[0]
  const messy = entries.filter(([label]) => label.length > 40)

  let note = `Most common management engagement response: "${topLabel}" (${topCount} responses).`
  if (messy.length > 0) {
    note +=
      " Some burden-view values are raw survey text — treat as indicative until mapped to Useful / Neutral / Burdensome."
  }
  return note
}

export function buildDataQualityCompletenessNote(
  facilities: ProgrammeFacility[],
  programmeTarget: number
): string {
  const assessed = facilities.filter((f) => f.assessment_status === "complete")
  const below85 = assessed.filter((f) => f.completeness_pct < 85).length

  if (below85 === 0) {
    return "All assessed facilities meet the 85% completeness threshold."
  }

  const pct = Math.round((below85 / programmeTarget) * 100)
  return `${below85} of ${programmeTarget} facilities (${pct}%) are below 85% completeness — most of the sample. Use the missing-fields chart to target re-collection.`
}

export function buildDataQualityMissingNote(facilities: ProgrammeFacility[]): string {
  const assessed = facilities.filter((f) => f.assessment_status === "complete")
  const withMissing = assessed.filter((f) => (f.missing_fields?.length ?? 0) > 0).length

  if (withMissing === 0) {
    return "No missing scored fields are flagged in the current extract."
  }

  return `${withMissing} assessed ${withMissing === 1 ? "facility has" : "facilities have"} missing fields. Infrastructure and workforce items dominate gaps in the register.`
}

export function buildWhatDrivesCorrelationNote(correlations: DriverCorrelation[]): string {
  const top = correlations[0]
  const infra = correlations.filter((c) =>
    ["D_ICT", "D_POW", "D_CON", "devices"].includes(c.key)
  )[0]

  if (!top) {
    return "Correlations use assessed facilities with complete domain scores."
  }

  let note = `${top.factor} has the strongest link to composite readiness (${formatCorrelationScore(top.correlation)}).`
  if (infra && infra.key !== top.key) {
    note += ` Among infrastructure signals, ${infra.factor} tracks closest (${formatCorrelationScore(infra.correlation)}).`
  }
  note += " Literacy and enthusiasm move less than power, connectivity, and devices."
  return note
}

export function buildWhatDrivesDlaScatterNote(
  pointCount: number,
  correlation: number | null
): string {
  if (pointCount < 3) {
    return "DLA vs readiness needs at least three facilities with both scores."
  }

  if (correlation == null) {
    return `${pointCount} facilities plotted. Each point is one facility's DLA mean against composite readiness.`
  }

  return `${pointCount} facilities plotted. DLA and readiness correlation is ${formatCorrelationScore(correlation)} — facility literacy helps, but infrastructure domains explain more of the spread.`
}

export function buildMapNote(mappedCount: number, totalCount: number): string {
  const montserrado = mappedCount > 0 ? " Montserrado markers overlap in Monrovia — zoom in or use cluster view." : ""
  const missing = totalCount - mappedCount

  let note = `Marker colour is deployment tier; size reflects composite score.${montserrado}`
  if (missing > 0) {
    note += ` ${missing} ${missing === 1 ? "facility lacks" : "facilities lack"} GPS in the register.`
  }
  return note
}

export function buildFacilitiesTableNote(
  count: number,
  hasFilters: boolean
): string {
  if (hasFilters) {
    return `${count} facilities match the current filters. Sort columns, search by name or cluster, or export CSV for offline review.`
  }
  return `${count} programme facilities. Sort columns, search by name or cluster, or export CSV. Blocker codes show deployment constraints at a glance.`
}

export function buildComparePanelNote(): string {
  return "Benchmark columns show cluster and national averages for the selected facility — useful when comparing one site to its peers rather than only to a second facility."
}
