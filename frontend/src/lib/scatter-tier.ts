import type { ProgrammeFacility } from "@/lib/types-public"

export type ScatterTierCategory = "tier1" | "tier2" | "tier3"

export interface ScatterPoint {
  slug: string
  name: string
  score: number
  blockers: number
  category: ScatterTierCategory
  county: string
}

export const SCATTER_TIER_COLORS: Record<ScatterTierCategory, string> = {
  tier1: "#3e8343",
  tier2: "#355781",
  tier3: "#c64e31",
}

export const SCATTER_TIER_LABELS: Record<ScatterTierCategory, string> = {
  tier1: "Tier 1",
  tier2: "Tier 2",
  tier3: "T3 blocked",
}

export function classifyScatterPoint(facility: ProgrammeFacility): ScatterTierCategory | null {
  if (facility.assessment_status !== "complete" || facility.overall_score == null) return null

  const tier = facility.tier ?? ""
  const blockers = facility.blockers?.length ?? 0

  if (tier.startsWith("Tier 3") || tier.startsWith("Tier 4") || blockers >= 1) return "tier3"
  if (tier.startsWith("Tier 1")) return "tier1"
  if (tier.startsWith("Tier 2")) return "tier2"

  const score = facility.overall_score
  if (blockers >= 1) return "tier3"
  if (score >= 75) return "tier1"
  return "tier2"
}

export function buildScatterPoints(facilities: ProgrammeFacility[]): ScatterPoint[] {
  return facilities
    .filter((f) => f.assessment_status === "complete" && f.overall_score != null)
    .map((f) => {
      const category = classifyScatterPoint(f)
      if (!category) return null
      return {
        slug: f.slug,
        name: f.name,
        score: f.overall_score as number,
        blockers: f.blockers?.length ?? 0,
        category,
        county: f.county,
      }
    })
    .filter((p): p is ScatterPoint => p != null)
}
