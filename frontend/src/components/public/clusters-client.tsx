"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { ClusterData } from "@/app/dashboard/clusters/page"

interface ClustersClientProps {
  clusters: ClusterData[]
  total: number
}

export function ClustersClient({ clusters, total }: ClustersClientProps) {
  const domainLabels: Record<string, string> = {
    B: "Governance",
    C: "Workforce",
    D: "Infrastructure",
    E: "Health Info",
    F: "Digital Tech",
    G: "Service",
    H: "Supply",
    I: "Finance",
    J: "Ops",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Clusters</h1>
        <p className="text-muted-foreground">Regional readiness and domain profile</p>
        <p className="text-sm text-slate-500 mt-3">
          ● {total} / {total} assessed
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clusters.map((cluster) => (
          <Card key={cluster.name} className="shadow-none border border-slate-200">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{cluster.name}</h3>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="text-slate-600">{cluster.facilities} facilities</span>
                    <div className="flex gap-2">
                      <span className="text-teal-600 font-medium">T1 {cluster.tier1}</span>
                      <span className="text-blue-600 font-medium">T2 {cluster.tier2}</span>
                      <span className="text-red-600 font-medium">T3 {cluster.tier3}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-slate-900">{cluster.compositeScore}%</p>
                </div>
              </div>

              {/* Domain bars */}
              <div className="space-y-2 mb-6">
                {Object.entries(cluster.domains)
                  .slice(0, 6)
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-600 w-20">{domainLabels[key]}</span>
                      <div className="flex-1 h-5 bg-slate-100 rounded">
                        <div
                          className="h-full bg-teal-600 rounded transition-all"
                          style={{ width: `${(value / 3) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-700 w-8 text-right">{value.toFixed(2)}</span>
                    </div>
                  ))}
              </div>

              {/* Footer metrics */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div>
                  <p className="text-sm text-slate-600">
                    DLA <span className="font-semibold text-slate-900">{cluster.dla.toFixed(1)}%</span>
                  </p>
                  <p className="text-sm text-slate-600">
                    Enthusiasm <span className="font-semibold text-slate-900">{cluster.enthusiasm.toFixed(1)}/10</span>
                  </p>
                </div>
                <a href="#" className="text-teal-600 text-sm font-medium hover:underline">
                  View facilities →
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
