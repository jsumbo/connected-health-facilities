"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { ReadinessTier } from "@/lib/types-public"
import { cn } from "@/lib/utils"

const selectClassName = cn(
  "h-9 min-w-[11rem] rounded-lg border border-input bg-card px-3 text-sm text-foreground",
  "shadow-sm outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

export const FACILITY_TIER_FILTER_OPTIONS: ReadonlyArray<{
  value: ReadinessTier | ""
  label: string
}> = [
  { value: "", label: "All tiers" },
  { value: "Tier 1 — HOS-Ready", label: "Tier 1 · HOS-Ready" },
  { value: "Tier 2 — Deployment-Eligible", label: "Tier 2 · Deployment-Eligible" },
  { value: "Tier 2 — Structured Remediation", label: "Tier 2 · Structured Remediation" },
  { value: "Tier 3 — Not Deployment-Ready", label: "Tier 3 · Not Deployment-Ready" },
]

interface FacilityFiltersProps {
  counties: readonly string[]
  currentCounty?: string
  currentTier?: string
}

export function FacilityFilters({
  counties,
  currentCounty = "",
  currentTier = "",
}: FacilityFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: "county" | "tier", value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  const hasFilters = Boolean(currentCounty || currentTier)

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="facility-filter-county" className="text-xs font-medium text-muted-foreground">
          County
        </label>
        <select
          id="facility-filter-county"
          value={currentCounty}
          onChange={(e) => handleFilterChange("county", e.target.value)}
          className={selectClassName}
        >
          <option value="">All counties</option>
          {counties.map((county) => (
            <option key={county} value={county}>
              {county}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="facility-filter-tier" className="text-xs font-medium text-muted-foreground">
          Tier
        </label>
        <select
          id="facility-filter-tier"
          value={currentTier}
          onChange={(e) => handleFilterChange("tier", e.target.value)}
          className={selectClassName}
        >
          {FACILITY_TIER_FILTER_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="mb-0.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
