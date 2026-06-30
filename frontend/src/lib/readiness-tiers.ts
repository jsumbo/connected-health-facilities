/**
 * TRIBE master workbook (sheet 7) stores Tier 1 | Tier 2 | Tier 3 plus Wave.
 * Wave refines labels: Wave 1 → HOS-Ready, Wave 2 → Deployment-Eligible,
 * Wave 3 → Structured Remediation (when present), Tier 3 → Not Deployment-Ready.
 */

export interface TierFilterOption {
  value: string
  label: string
}

/** Three tier filters aligned with the master workbook Tier column. */
export const TIER_FILTER_OPTIONS: readonly TierFilterOption[] = [
  { value: "", label: "All tiers" },
  { value: "Tier 1 — HOS-Ready", label: "Tier 1 · HOS-Ready" },
  { value: "tier-2", label: "Tier 2" },
  { value: "Tier 3 — Not Deployment-Ready", label: "Tier 3 · Not Deployment-Ready" },
]

export function facilityMatchesTierFilter(facilityTier: string, filterValue: string): boolean {
  if (!filterValue) return true
  if (filterValue === "tier-2") return facilityTier.startsWith("Tier 2")
  return facilityTier === filterValue
}

export function tierFilterLabel(filterValue: string): string {
  const match = TIER_FILTER_OPTIONS.find((option) => option.value === filterValue)
  return match?.label ?? filterValue.replace(" — ", " · ")
}

export function formatTierLabel(tier: string): string {
  return tier.replace(" — ", " · ")
}
