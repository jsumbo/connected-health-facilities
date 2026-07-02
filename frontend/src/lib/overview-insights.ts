import type { BlockerSummary, PublicOverview, QuestionStat } from "@/lib/types-public"
import { blockerDisplayLabel } from "@/lib/blockers"

const DOMAIN_LABELS: Record<string, string> = {
  B: "Governance",
  C: "Workforce",
  D: "Infrastructure",
  E: "Health Information",
  F: "Digital Technologies",
  G: "Clinical Service",
  H: "Supply Chain",
  I: "Financing",
  J: "Operational Support",
  D_POW: "Power",
  D_CON: "Connectivity",
  D_ICT: "ICT hardware",
}

export function getWeakestDomain(
  domainAverages: Record<string, number | null>
): { key: string; label: string; value: number } | null {
  let weakest: { key: string; label: string; value: number } | null = null
  for (const [key, value] of Object.entries(domainAverages)) {
    if (value == null) continue
    if (!weakest || value < weakest.value) {
      weakest = {
        key,
        label: DOMAIN_LABELS[key] ?? key.replace(/_/g, " "),
        value,
      }
    }
  }
  return weakest
}

export function getTopBlocker(blockers: BlockerSummary[] | undefined): BlockerSummary | null {
  if (!blockers?.length) return null
  return [...blockers].sort((a, b) => b.count - a.count)[0] ?? null
}

export function buildOverviewInsight(
  overview: PublicOverview,
  quickWinsCount: number
): string {
  const topBlocker = getTopBlocker(overview.blocker_register)
  const weakest = getWeakestDomain(overview.domain_averages)
  const tier1 = overview.tier_counts["Tier 1 — HOS-Ready"] ?? 0
  const parts: string[] = []

  if (tier1 > 0) {
    parts.push(`${tier1} ${tier1 === 1 ? "facility is" : "facilities are"} HOS-ready now`)
  } else {
    parts.push("No facilities are HOS-ready yet")
  }

  if (quickWinsCount > 0) {
    parts.push(`${quickWinsCount} quick win${quickWinsCount === 1 ? "" : "s"} (1 blocker each)`)
  }

  if (topBlocker) {
    parts.push(
      `${blockerDisplayLabel(topBlocker.code, topBlocker.description)} is the top blocker (${topBlocker.count} facilities)`
    )
  }

  if (weakest) {
    parts.push(
      `${weakest.label} is the weakest domain nationally (${weakest.value.toFixed(2)}/3 avg)`
    )
  }

  return parts.join(". ") + "."
}

export function buildDlaInsight(questions: QuestionStat[]): string | null {
  if (!questions.length) return null
  const sorted = [...questions].sort((a, b) => a.correctRate - b.correctRate)
  const weakest = sorted[0]
  if (!weakest) return null
  return `Question ${weakest.questionNumber} (${weakest.questionText.slice(0, 48)}${weakest.questionText.length > 48 ? "…" : ""}) scores lowest at ${Math.round(weakest.correctRate)}% correct nationally — mainly phishing and password items.`
}

export function buildSentimentInsight(avgEnthusiasm: number | null | undefined): string {
  if (avgEnthusiasm == null) {
    return "Staff sentiment data is still being collected — review burden categories for adoption risk."
  }
  if (avgEnthusiasm >= 8) {
    return `Staff enthusiasm averages ${avgEnthusiasm.toFixed(1)}/10 nationally, but means cluster high — check the distribution for facilities with low response counts or mixed burden views.`
  }
  return `Staff enthusiasm averages ${avgEnthusiasm.toFixed(1)}/10 — pair rollout with change management where burden views are not "Useful".`
}

export function buildDataQualityInsight(lowCompleteness: number, programmeTarget: number): string {
  if (lowCompleteness === 0) return "All assessed facilities meet the 85% completeness threshold."
  const pct = Math.round((lowCompleteness / programmeTarget) * 100)
  return `${lowCompleteness} of ${programmeTarget} facilities (${pct}%) are below 85% completeness — re-collection should target missing infrastructure and workforce fields first.`
}
