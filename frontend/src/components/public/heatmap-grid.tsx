"use client"

import { useMemo } from "react"
import type { ProgrammeFacility } from "@/lib/types-public"

interface HeatmapGridProps {
  facilities: ProgrammeFacility[]
}

const DOMAIN_LABELS = {
  B: "Governance",
  C: "Workforce",
  D: "Infrastructure",
  E: "Health Info",
  F: "Digital Tech",
  G: "Service Delivery",
  H: "Supply Chain",
  I: "Financing",
  J: "Operations",
}

const DOMAIN_KEYS = ["B", "C", "D", "E", "F", "G", "H", "I", "J"] as const

function getColorClass(score: number | null | undefined): string {
  if (score === null || score === undefined) return "bg-slate-100"
  if (score === 0) return "bg-red-100"
  if (score === 1) return "bg-orange-200"
  if (score === 2) return "bg-yellow-100"
  if (score === 3) return "bg-emerald-100"
  return "bg-slate-100"
}

export function HeatmapGrid({ facilities }: HeatmapGridProps) {
  const sorted = useMemo(
    () => [...facilities].sort((a, b) => (b.overall_score ?? 0) - (a.overall_score ?? 0)),
    [facilities]
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-border bg-muted p-2 text-left text-xs font-semibold sticky left-0 z-10 min-w-48">
              Facility
            </th>
            {DOMAIN_KEYS.map((domain) => (
              <th
                key={domain}
                className="border border-border bg-muted p-2 text-center text-xs font-semibold w-12"
                title={DOMAIN_LABELS[domain]}
              >
                {domain}
              </th>
            ))}
            <th className="border border-border bg-muted p-2 text-center text-xs font-semibold w-16">
              Composite
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((facility) => (
            <tr key={facility.slug} className="hover:bg-muted/30">
              <td className="border border-border p-2 font-medium text-sm sticky left-0 z-10 bg-white">
                {facility.name}
              </td>
              {DOMAIN_KEYS.map((domain) => {
                const domainScore =
                  (facility.domain_scores as Record<string, any> | undefined)?.[domain]?.score ?? null;
                return (
                  <td
                    key={domain}
                    className={`border border-border p-2 text-center text-xs font-medium h-10 ${getColorClass(
                      domainScore
                    )}`}
                  >
                    {domainScore !== null ? domainScore : "—"}
                  </td>
                );
              })}
              <td className="border border-border p-2 text-center text-xs font-semibold">
                {facility.overall_score != null ? Math.round(facility.overall_score) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-6 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-100 border border-border" />
          <span>0 - No progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-200 border border-border" />
          <span>1 - Weak</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-100 border border-border" />
          <span>2 - Adequate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-emerald-100 border border-border" />
          <span>3 - Strong</span>
        </div>
      </div>
    </div>
  );
}
