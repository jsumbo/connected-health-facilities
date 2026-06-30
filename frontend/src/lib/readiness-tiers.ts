import type { ReadinessTier } from "@/lib/types-public"

/** Canonical filter values — unchanged for API/query compatibility. */
export const DEPLOYMENT_CATEGORY_VALUES = [
  "Tier 1 — HOS-Ready",
  "Tier 2 — Deployment-Eligible",
  "Tier 2 — Structured Remediation",
  "Tier 3 — Not Deployment-Ready",
] as const satisfies readonly ReadinessTier[]

export type DeploymentCategory = (typeof DEPLOYMENT_CATEGORY_VALUES)[number]

export interface DeploymentCategoryOption {
  value: DeploymentCategory | ""
  label: string
  /** Short label for KPI cards and legends */
  shortLabel: string
  /** Parent tier in the TRIBE 3-tier model (1, 2, or 3) */
  parentTier: 1 | 2 | 3
}

export const DEPLOYMENT_CATEGORY_OPTIONS: readonly DeploymentCategoryOption[] = [
  {
    value: "Tier 1 — HOS-Ready",
    label: "Tier 1 · HOS-Ready",
    shortLabel: "HOS-Ready",
    parentTier: 1,
  },
  {
    value: "Tier 2 — Deployment-Eligible",
    label: "Tier 2 · Deployment-Eligible",
    shortLabel: "Deployment-Eligible",
    parentTier: 2,
  },
  {
    value: "Tier 2 — Structured Remediation",
    label: "Tier 2 · Structured Remediation",
    shortLabel: "Structured Remediation",
    parentTier: 2,
  },
  {
    value: "Tier 3 — Not Deployment-Ready",
    label: "Tier 3 · Not Deployment-Ready",
    shortLabel: "Not Deployment-Ready",
    parentTier: 3,
  },
]

export const DEPLOYMENT_CATEGORY_FILTER_OPTIONS: readonly DeploymentCategoryOption[] = [
  { value: "", label: "All categories", shortLabel: "All", parentTier: 1 },
  ...DEPLOYMENT_CATEGORY_OPTIONS,
]

/** Shown under tier/category filters — explains 4 UI categories vs 3-tier rubric. */
export const DEPLOYMENT_CATEGORY_HELP =
  "Four deployment categories: Tier 1 (HOS-ready), two Tier 2 pathways (deployment-eligible and structured remediation), and Tier 3 (blockers)."

export function formatDeploymentCategoryLabel(tier: string): string {
  return tier.replace(" — ", " · ")
}

export function deploymentCategoryShortLabel(tier: string): string {
  const match = DEPLOYMENT_CATEGORY_OPTIONS.find((option) => option.value === tier)
  return match?.shortLabel ?? formatDeploymentCategoryLabel(tier)
}
