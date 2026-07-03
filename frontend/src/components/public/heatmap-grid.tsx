"use client"

import { useMemo } from "react"
import Link from "next/link"
import type { ProgrammeFacility } from "@/lib/types-public"
import {
  DRF_DOMAIN_HEADERS,
  DRF_DOMAIN_KEYS,
  getDrfDomainScore,
} from "@/lib/drf-domains"

interface HeatmapGridProps {
  facilities: ProgrammeFacility[]
}

function getColorClass(score: number | null | undefined): string {
  if (score === null || score === undefined) return "bg-slate-100"
  if (score === 0) return "bg-red-100"
  if (score === 1) return "bg-orange-200"
  if (score === 2) return "bg-yellow-100"
  if (score >= 3) return "bg-red-100"
  return "bg-slate-100"
}

function tierBadgeClass(tier: string | null | undefined): string {
  if (tier === "Tier 1 — HOS-Ready") return "bg-[#f54343]"
  if (tier?.includes("Deployment-Eligible") || tier?.includes("Structured Remediation")) {
    return "bg-[#0f0f0f]"
  }
  if (tier?.includes("Not Deployment-Ready")) return "bg-red-600"
  return "bg-slate-600"
}

function tierShort(tier: string | null | undefined): string {
  if (!tier) return "—"
  if (tier.includes("HOS-Ready")) return "T1"
  if (tier.includes("Deployment-Eligible")) return "T2"
  if (tier.includes("Structured Remediation")) return "T2R"
  if (tier.includes("Not Deployment-Ready")) return "T3"
  return tier.replace("Tier ", "T").slice(0, 3)
}

export function HeatmapLegend() {
  return (
    <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 border border-border bg-red-100" />
        <span>0 — blocker/none</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 border border-border bg-orange-200" />
        <span>1 — weak</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 border border-border bg-yellow-100" />
        <span>2 — adequate</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 border border-border bg-red-100" />
        <span>3 — strong</span>
      </div>
    </div>
  )
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
            <th className="sticky left-0 z-10 min-w-48 border border-border bg-slate-100 p-3 text-left text-xs font-semibold">
              Facility
            </th>
            {DRF_DOMAIN_KEYS.map((key) => (
              <th
                key={key}
                className="w-10 border border-border bg-slate-100 p-2 text-center text-xs font-semibold"
                title={key}
              >
                {DRF_DOMAIN_HEADERS[key]}
              </th>
            ))}
            <th className="w-14 border border-border bg-slate-100 p-2 text-center text-xs font-semibold">
              Comp
            </th>
            <th className="w-12 border border-border bg-slate-100 p-2 text-center text-xs font-semibold">
              Tier
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((facility) => (
            <tr key={facility.slug} className="hover:bg-slate-50">
              <td className="sticky left-0 z-10 border border-border bg-white p-3 text-sm font-medium">
                <Link
                  href={`/facility/${facility.slug}`}
                  className="hover:text-primary hover:underline underline-offset-2"
                >
                  {facility.name}
                </Link>
              </td>
              {DRF_DOMAIN_KEYS.map((key) => {
                const domainScore = getDrfDomainScore(facility.domain_scores, key)
                return (
                  <td
                    key={key}
                    className={`h-10 border border-border p-2 text-center text-xs font-semibold ${getColorClass(domainScore)}`}
                  >
                    {domainScore !== null ? domainScore : "—"}
                  </td>
                )
              })}
              <td className="border border-border p-2 text-center text-xs font-semibold tabular-nums">
                {facility.overall_score != null ? `${facility.overall_score}%` : "—"}
              </td>
              <td className="border border-border p-2 text-center text-xs font-medium">
                <span
                  className={`inline-block rounded px-2 py-1 text-white ${tierBadgeClass(facility.tier)}`}
                >
                  {tierShort(facility.tier)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
