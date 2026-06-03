export function tierStyle(tier: string): { bg: string; text: string; border: string } {
  if (tier.startsWith("Tier 1")) {
    return { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" }
  }
  if (tier.startsWith("Tier 2")) {
    return { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200" }
  }
  if (tier.startsWith("Tier 3")) {
    return { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-200" }
  }
  if (tier.startsWith("Tier 4")) {
    return { bg: "bg-rose-50", text: "text-rose-900", border: "border-rose-200" }
  }
  if (tier === "Critical Gaps") {
    return { bg: "bg-orange-50", text: "text-orange-900", border: "border-orange-200" }
  }
  if (tier === "Not Assessed") {
    return { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" }
  }
  return { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" }
}

export const TIER_CHART_COLORS: Record<string, string> = {
  "Tier 1 — HOS-Ready": "var(--chart-2)",
  "Tier 2 — Deployment-Eligible": "var(--chart-1)",
  "Tier 3 — Structured Remediation": "var(--chart-3)",
  "Tier 4 — Not Deployment-Ready": "var(--chart-4)",
  "Critical Gaps": "var(--chart-5)",
  "Not Assessed": "oklch(0.65 0.02 255)",
  Incomplete: "oklch(0.75 0.01 85)",
}
