"use client"

import { useMemo } from "react"
import type { ProgrammeFacility } from "@/lib/types-public"
import { getBlockerCode } from "@/lib/quick-wins"
import { blockerDisplayLabel, blockerShortLabel } from "@/lib/blockers"
import { clusterSortIndex } from "@/lib/clusters"
import type { BlockerSummary } from "@/lib/types-public"

interface BlockerClusterHeatmapProps {
  facilities: ProgrammeFacility[]
  blockerRegister: BlockerSummary[]
}

export function BlockerClusterHeatmap({
  facilities,
  blockerRegister,
}: BlockerClusterHeatmapProps) {
  const { clusters, codes, matrix } = useMemo(() => {
    const assessed = facilities.filter((f) => f.assessment_status === "complete")
    const clusterSet = new Set(assessed.map((f) => f.cluster).filter(Boolean))
    const clusters = [...clusterSet].sort(
      (a, b) => clusterSortIndex(a) - clusterSortIndex(b) || a.localeCompare(b)
    )

    const codes = [...blockerRegister]
      .sort((a, b) => b.count - a.count)
      .map((b) => b.code)

    const matrix: Record<string, Record<string, number>> = {}
    for (const cluster of clusters) {
      matrix[cluster] = {}
      for (const code of codes) {
        matrix[cluster][code] = 0
      }
    }

    for (const facility of assessed) {
      if (facility.tier !== "Tier 3 — Not Deployment-Ready") continue
      const cluster = facility.cluster
      if (!cluster || !matrix[cluster]) continue
      for (const blocker of facility.blockers) {
        const code = getBlockerCode(blocker)
        if (code && matrix[cluster][code] != null) {
          matrix[cluster][code] += 1
        }
      }
    }

    return { clusters, codes, matrix }
  }, [facilities, blockerRegister])

  if (clusters.length === 0 || codes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No cluster blocker data available.
      </p>
    )
  }

  const maxCount = Math.max(
    ...clusters.flatMap((c) => codes.map((code) => matrix[c][code] ?? 0)),
    1
  )

  function cellIntensity(count: number): string {
    if (count === 0) return "bg-slate-50 text-muted-foreground"
    const ratio = count / maxCount
    if (ratio >= 0.75) return "bg-red-600 text-white"
    if (ratio >= 0.5) return "bg-red-400 text-white"
    if (ratio >= 0.25) return "bg-orange-200 text-orange-950"
    return "bg-amber-100 text-amber-950"
  }

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border border-border bg-slate-50" />
          <span>None</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border border-border bg-amber-100" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border border-border bg-orange-200" />
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border border-border bg-red-400" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border border-border bg-red-600" />
          <span>Very high</span>
        </div>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 min-w-40 border border-border bg-slate-100 p-3 text-left text-xs font-semibold">
              Cluster
            </th>
            {codes.map((code) => (
              <th
                key={code}
                className="min-w-[7rem] border border-border bg-slate-100 p-2 text-center text-[10px] font-semibold leading-tight"
                title={blockerDisplayLabel(code)}
              >
                {blockerShortLabel(code)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clusters.map((cluster) => (
            <tr key={cluster}>
              <td className="sticky left-0 z-10 border border-border bg-white p-3 text-xs font-medium">
                {cluster}
              </td>
              {codes.map((code) => {
                const count = matrix[cluster][code] ?? 0
                return (
                  <td
                    key={code}
                    className={`border border-border p-2 text-center text-xs font-semibold tabular-nums ${cellIntensity(count)}`}
                  >
                    {count > 0 ? count : "—"}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
