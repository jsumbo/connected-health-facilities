"use client"

import { useMemo, useState } from "react"
import { HeatmapGrid } from "@/components/public/heatmap-grid"
import type { ProgrammeFacility } from "@/lib/types-public"

interface HeatmapGridClientProps {
  initialFacilities: ProgrammeFacility[]
  counties: string[]
}

export function HeatmapGridClient({ initialFacilities, counties }: HeatmapGridClientProps) {
  const [selectedCounty, setSelectedCounty] = useState("")
  const [selectedTier, setSelectedTier] = useState("")

  const filtered = useMemo(() => {
    let result = initialFacilities
    if (selectedCounty) {
      result = result.filter((f) => f.county === selectedCounty)
    }
    if (selectedTier) {
      result = result.filter((f) => f.tier === selectedTier)
    }
    return result
  }, [initialFacilities, selectedCounty, selectedTier])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">County</label>
          <select
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
            className="h-9 min-w-[11rem] rounded-lg border border-input bg-card px-3 text-sm text-foreground shadow-sm"
          >
            <option value="">All counties</option>
            {counties.map((c: string) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Tier</label>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="h-9 min-w-[11rem] rounded-lg border border-input bg-card px-3 text-sm text-foreground shadow-sm"
          >
            <option value="">All tiers</option>
            <option value="Tier 1 — HOS-Ready">Tier 1 · HOS-Ready</option>
            <option value="Tier 2 — Deployment-Eligible">Tier 2 · Deployment-Eligible</option>
            <option value="Tier 2 — Structured Remediation">Tier 2 · Structured Remediation</option>
            <option value="Tier 3 — Not Deployment-Ready">Tier 3 · Not Deployment-Ready</option>
          </select>
        </div>

        {(selectedCounty || selectedTier) && (
          <button
            onClick={() => {
              setSelectedCounty("")
              setSelectedTier("")
            }}
            className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors self-end"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} of {initialFacilities.length} facilities
      </p>
      <HeatmapGrid facilities={filtered} />
    </div>
  )
}
