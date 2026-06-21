"use client"

import { useMemo } from "react"
import type { ProgrammeFacility } from "@/lib/types-public"

interface HeatmapGridProps {
  facilities: ProgrammeFacility[]
}

const DOMAIN_LABELS = {
  B: "GOV",
  C: "WF",
  D: "INF",
  E: "HI",
  F: "ICT",
  G: "SD",
  H: "SC",
  I: "FIN",
  J: "OPS",
}

const DOMAIN_LONG_LABELS = {
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
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-border bg-slate-100 p-3 text-left text-xs font-semibold sticky left-0 z-10 min-w-48">
              Facility × domain readiness
            </th>
            {DOMAIN_KEYS.map((domain) => (
              <th
                key={domain}
                className="border border-border bg-slate-100 p-2 text-center text-xs font-semibold w-10"
                title={DOMAIN_LONG_LABELS[domain]}
              >
                {domain}
              </th>
            ))}
            <th className="border border-border bg-slate-100 p-2 text-center text-xs font-semibold w-14">
              Tier
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((facility) => (
            <tr key={facility.slug} className="hover:bg-slate-50">
              <td className="border border-border p-3 font-medium text-sm sticky left-0 z-10 bg-white">
                {facility.name}
              </td>
              {DOMAIN_KEYS.map((domain) => {
                const domainScore =
                  (facility.domain_scores as Record<string, any> | undefined)?.[domain]?.score ?? null;
                return (
                  <td
                    key={domain}
                    className={`border border-border p-2 text-center text-xs font-semibold h-10 ${getColorClass(
                      domainScore
                    )}`}
                  >
                    {domainScore !== null ? domainScore : "—"}
                  </td>
                );
              })}
              <td className="border border-border p-2 text-center text-xs font-medium">
                <span className={`inline-block px-2 py-1 rounded text-white ${
                  facility.tier === "Tier 1 — HOS-Ready"
                    ? "bg-emerald-600"
                    : facility.tier?.includes("Deployment-Eligible") || facility.tier?.includes("Structured Remediation")
                    ? "bg-blue-600"
                    : facility.tier?.includes("Not Deployment-Ready")
                    ? "bg-red-600"
                    : "bg-slate-600"
                }`}>
                  {facility.tier?.replace("Tier ", "T")?.replace(" — ", " ") || "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-6 flex gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-border" />
          <span>0 blocker/none</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-200 border border-border" />
          <span>1 weak</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-border" />
          <span>2 adequate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-100 border border-border" />
          <span>3 strong</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Every facility, every domain (0–3) in one view · sorted by composite · number shown for non-colour reading
      </p>
    </div>
  );
}
