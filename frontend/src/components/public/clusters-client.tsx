"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import type { ClusterSummary } from "@/lib/types-public"
import {
  DRF_DOMAIN_KEYS,
  DRF_DOMAIN_LABELS,
  getClusterDomainAverage,
} from "@/lib/drf-domains"
import { formatAxisTick, formatPercentLabel } from "@/lib/format-number"

interface ClustersClientProps {
  clusters: ClusterSummary[]
}

const WEAK_THRESHOLD = 1.5

export function ClustersClient({ clusters }: ClustersClientProps) {
  const sorted = [...clusters].sort(
    (a, b) => (b.avg_composite ?? 0) - (a.avg_composite ?? 0)
  )

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {sorted.map((cluster) => {
          const tier1 = cluster.tier_counts["Tier 1 — HOS-Ready"] ?? 0
          const tier2 =
            (cluster.tier_counts["Tier 2 — Deployment-Eligible"] ?? 0) +
            (cluster.tier_counts["Tier 2 — Structured Remediation"] ?? 0)
          const tier3 = cluster.tier_counts["Tier 3 — Not Deployment-Ready"] ?? 0
          const composite = cluster.avg_composite ?? 0

          return (
            <Link
              key={cluster.cluster}
              href={`/facilities?cluster=${encodeURIComponent(cluster.cluster)}`}
              className="block"
            >
              <Card className="h-full border border-slate-200 shadow-none transition-colors hover:border-primary/30 hover:shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{cluster.cluster}</h3>
                      {cluster.region ? (
                        <p className="text-xs text-muted-foreground">{cluster.region}</p>
                      ) : null}
                      <div className="mt-2 flex gap-3 text-xs">
                        <span className="text-slate-600">{cluster.facility_count} facilities</span>
                        <span className="font-medium text-emerald-600">T1 {tier1}</span>
                        <span className="font-medium text-blue-600">T2 {tier2}</span>
                        <span className="font-medium text-red-600">T3 {tier3}</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold tabular-nums text-slate-900">
                      {composite > 0 ? formatPercentLabel(composite, 1) : "—"}
                    </p>
                  </div>

                  <div className="mb-6 space-y-2">
                    {DRF_DOMAIN_KEYS.map((key) => {
                      const value = getClusterDomainAverage(cluster.domain_averages, key)
                      const numeric = value ?? 0
                      const isWeak = numeric > 0 && numeric < WEAK_THRESHOLD
                      const pct = (numeric / 3) * 100
                      return (
                        <div key={key} className="flex items-center gap-3">
                          <span className="w-24 text-xs font-medium text-slate-600">
                            {DRF_DOMAIN_LABELS[key]}
                          </span>
                          <div className="h-5 flex-1 rounded bg-slate-100">
                            <div
                              className={`h-full rounded transition-all ${isWeak ? "bg-red-500" : "bg-teal-600"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-xs font-medium tabular-nums text-slate-700">
                            {value != null ? formatAxisTick(value, 1) : "—"}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>
                        DLA{" "}
                        <span className="font-semibold text-slate-900">
                          {cluster.avg_dla_score != null
                            ? formatPercentLabel(cluster.avg_dla_score, 1)
                            : "—"}
                        </span>
                      </p>
                      <p>
                        Enthusiasm{" "}
                        <span className="font-semibold text-slate-900">
                          {cluster.avg_sentiment_enthusiasm != null
                            ? `${formatAxisTick(cluster.avg_sentiment_enthusiasm, 1)}/10`
                            : "—"}
                        </span>
                      </p>
                    </div>
                    <span className="text-sm font-medium text-teal-600">View facilities →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
    </div>
  )
}
