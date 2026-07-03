import type { ProgrammeFacility } from "@/lib/types-public"

export const QUICK_WIN_TIER = "Tier 3 — Not Deployment-Ready" as const
export const QUICK_WIN_MIN_COMPOSITE = 65
/** Plain-language threshold (avoid ≥ glyph — renders as "265%" in some fonts). */
export const QUICK_WIN_COMPOSITE_LABEL = "65%+ composite"
export const QUICK_WIN_DEFINITION =
  "Tier 3 facility with exactly one deployment blocker and 65%+ composite readiness"

export function getBlockerCode(blocker: ProgrammeFacility["blockers"][number]): string | null {
  if (typeof blocker === "string") return blocker
  if (blocker && typeof blocker === "object" && "code" in blocker) return blocker.code
  return null
}

/** Tier 3 with exactly one deployment blocker (original definition). */
export function isQuickWinClassic(facility: ProgrammeFacility): boolean {
  return (
    facility.tier === QUICK_WIN_TIER &&
    facility.blockers.length === 1
  )
}

/** Tier 3, one blocker, composite ≥ threshold — rollout expansion lens. */
export function isQuickWinExpanded(facility: ProgrammeFacility): boolean {
  if (!isQuickWinClassic(facility)) return false
  const score = facility.overall_score
  return score != null && score >= QUICK_WIN_MIN_COMPOSITE
}

export function countQuickWins(
  facilities: ProgrammeFacility[],
  mode: "classic" | "expanded" = "classic"
): number {
  const fn = mode === "expanded" ? isQuickWinExpanded : isQuickWinClassic
  return facilities.filter(fn).length
}

export function filterQuickWins(
  facilities: ProgrammeFacility[],
  mode: "classic" | "expanded" = "classic"
): ProgrammeFacility[] {
  const fn = mode === "expanded" ? isQuickWinExpanded : isQuickWinClassic
  return facilities.filter(fn)
}
