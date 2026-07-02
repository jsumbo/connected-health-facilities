import type { BlockerSummary, ProgrammeFacility } from "@/lib/types-public"
import { getBlockerCode } from "@/lib/quick-wins"

/** Canonical short labels — aligned with TRIBE master workbook blocker register. */
export const BLOCKER_SHORT_LABELS: Record<string, string> = {
  "BLK-01": "No primary power",
  "BLK-02": "No connectivity / <2 Mbps",
  "BLK-03": "Zero computers or tablets",
  "BLK-04": "Not reporting to DHIS2",
  "BLK-05": "No IT support",
  "BLK-06": "Not operational",
}

export function blockerShortLabel(code: string, fallback?: string): string {
  return BLOCKER_SHORT_LABELS[code] ?? fallback ?? code
}

/** Display form: BLK-01: No primary power */
export function blockerDisplayLabel(code: string, fallback?: string): string {
  const label = blockerShortLabel(code, fallback)
  if (label === code) return code
  return `${code}: ${label}`
}

export function formatBlockerCodes(codes: string[], separator = "; "): string {
  if (codes.length === 0) return "—"
  return codes.map((code) => blockerDisplayLabel(code)).join(separator)
}

export function formatFacilityBlockers(
  facility: Pick<ProgrammeFacility, "blockers" | "blocker_codes">,
  separator = "; "
): string {
  if (facility.blocker_codes?.length) {
    return formatBlockerCodes(facility.blocker_codes, separator)
  }
  const codes = facility.blockers
    .map((blocker) => getBlockerCode(blocker))
    .filter((code): code is string => Boolean(code))
  if (codes.length > 0) return formatBlockerCodes(codes, separator)
  if (facility.blockers.length === 0) return "—"
  return `${facility.blockers.length} blocker${facility.blockers.length > 1 ? "s" : ""}`
}

export function formatBlockerLine(
  blocker: ProgrammeFacility["blockers"][number]
): { code: string; label: string } {
  const code = getBlockerCode(blocker) ?? "BLK-?"
  const remediation =
    typeof blocker === "object" && blocker && "remediation" in blocker
      ? blocker.remediation
      : undefined
  return { code, label: blockerShortLabel(code, remediation) }
}

export function facilityHasBlocker(
  facility: Pick<ProgrammeFacility, "blockers" | "blocker_codes">,
  code: string
): boolean {
  if (facility.blocker_codes?.includes(code)) return true
  return facility.blockers.some((blocker) => getBlockerCode(blocker) === code)
}

export function facilitiesWithBlocker(
  facilities: ProgrammeFacility[],
  code: string
): ProgrammeFacility[] {
  return facilities
    .filter((facility) => facilityHasBlocker(facility, code))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function singleBlockerUnlockFacilities(
  facilities: ProgrammeFacility[],
  code: string
): ProgrammeFacility[] {
  return facilities.filter(
    (facility) =>
      facility.tier === "Tier 3 — Not Deployment-Ready" &&
      facility.blockers.length === 1 &&
      getBlockerCode(facility.blockers[0]) === code
  )
}

export function unlockCountForBlocker(
  facilities: ProgrammeFacility[],
  code: string
): number {
  return singleBlockerUnlockFacilities(facilities, code).length
}

export function buildBlockerInsight(
  register: BlockerSummary[],
  facilities: ProgrammeFacility[]
): string {
  const sorted = [...register].sort((a, b) => b.count - a.count)
  const unlocks = sorted
    .map((b) => ({
      code: b.code,
      label: blockerShortLabel(b.code, b.description),
      unlock: unlockCountForBlocker(facilities, b.code),
    }))
    .filter((b) => b.unlock > 0)
    .sort((a, b) => b.unlock - a.unlock)

  if (unlocks.length === 0) {
    return "No single-blocker Tier 3 facilities — remediation will require addressing multiple prerequisites per site."
  }

  const parts = unlocks.slice(0, 3).map((u) => `${blockerDisplayLabel(u.code)} graduates ${u.unlock}`)

  const totalSingle = facilities.filter(
    (f) => f.tier === "Tier 3 — Not Deployment-Ready" && f.blockers.length === 1
  ).length

  return `Clearing ${parts.join("; ")}. That's ${totalSingle} facilities reachable by single fixes.`
}
