import { getPublicOverview, getPublicFacilities } from "@/lib/public-api"
import { ClustersClient } from "@/components/public/clusters-client"
import type { ProgrammeFacility } from "@/lib/types-public"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Clusters | Dashboard",
}

export interface ClusterData {
  name: string
  facilities: number
  compositeScore: number
  tier1: number
  tier2: number
  tier3: number
  domains: Record<string, number>
  dla: number
  enthusiasm: number
}

export default async function ClustersPage() {
  try {
    const [facilitiesData] = await Promise.all([
      getPublicFacilities(),
      getPublicOverview(),
    ])

    const facilities = facilitiesData.items || []
    const grouped = new Map<string, ProgrammeFacility[]>()

    facilities.forEach((f) => {
      const key = f.county || "Unknown"
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(f)
    })

    const clusters: ClusterData[] = Array.from(grouped.entries()).map(([county, items]) => {
      const scores = items.map((f) => f.overall_score).filter((s): s is number => s !== null)
      const composite = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0

      const domains: Record<string, number> = {}
      const domainKeys = ["B", "C", "D", "E", "F", "G", "H", "I", "J"]
      domainKeys.forEach((key) => {
        const scores = items
          .map((f) => (f.domain_scores as Record<string, any>)?.[key]?.score)
          .filter((s): s is number => s !== null)
        domains[key] = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : 0
      })

      const dla = items
        .map((f) => f.dla_avg_score)
        .filter((s): s is number => s !== null)
        .reduce((a, b, _, arr) => a + b / arr.length, 0)

      const enthusiasm = items
        .map((f) => f.sentiment_avg_enthusiasm)
        .filter((s): s is number => s !== null)
        .reduce((a, b, _, arr) => a + b / arr.length, 0)

      return {
        name: county,
        facilities: items.length,
        compositeScore: composite,
        tier1: items.filter((f) => f.tier === "Tier 1 — HOS-Ready").length,
        tier2: items.filter((f) => f.tier?.includes("Tier 2")).length,
        tier3: items.filter((f) => f.tier === "Tier 3 — Not Deployment-Ready").length,
        domains,
        dla: Math.round(dla * 10) / 10,
        enthusiasm: Math.round(enthusiasm * 10) / 10,
      }
    })

    return <ClustersClient clusters={clusters.sort((a, b) => b.compositeScore - a.compositeScore)} total={facilities.length} />
  } catch (e) {
    return <div className="text-center py-12 text-red-600">Error loading clusters data</div>
  }
}
