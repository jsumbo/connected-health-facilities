"use client"

import { tierMarkerColor } from "@/components/public/facility-map-icon"

interface CountyAvg {
  county: string
  avg_score: number | null
}

interface MapCountyReadinessLegendProps {
  counties: CountyAvg[]
}

function readinessColor(avg: number | null): string {
  if (avg == null) return "#94a3b8"
  if (avg >= 75) return tierMarkerColor("Tier 1 — HOS-Ready")
  if (avg >= 55) return tierMarkerColor("Tier 2 — Deployment-Eligible")
  return tierMarkerColor("Tier 3 — Not Deployment-Ready")
}

/** County average readiness legend (choropleth substitute without county GeoJSON). */
export function MapCountyReadinessLegend({ counties }: MapCountyReadinessLegendProps) {
  const sorted = [...counties].sort((a, b) => (b.avg_score ?? 0) - (a.avg_score ?? 0))

  return (
    <div
      className="absolute bottom-2 right-2 z-[1001] max-h-48 w-44 overflow-auto rounded-md border border-border bg-card/95 p-2 shadow-md backdrop-blur-sm"
      aria-label="County average readiness"
    >
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        County avg readiness
      </p>
      <ul className="space-y-1">
        {sorted.map((c) => (
          <li key={c.county} className="flex items-center justify-between gap-2 text-[10px]">
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                className="inline-block size-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: readinessColor(c.avg_score) }}
                aria-hidden
              />
              <span className="truncate text-foreground">{c.county.replace(/_/g, " ")}</span>
            </span>
            <span className="tabular-nums text-muted-foreground">
              {c.avg_score != null ? `${Math.round(c.avg_score)}%` : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
