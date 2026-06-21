import { getPublicOverview } from "@/lib/public-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Clusters | Dashboard",
}

export default async function ClustersPage() {
  const overview = await getPublicOverview()

  const clusterData = [
    { name: "Montserrado", facilities: 12, avgScore: 67, tier1: 3, tier2: 5, tier3: 4 },
    { name: "Margibi", facilities: 6, avgScore: 62, tier1: 1, tier2: 2, tier3: 3 },
    { name: "Nimba", facilities: 8, avgScore: 58, tier1: 0, tier2: 3, tier3: 5 },
    { name: "Lofa", facilities: 4, avgScore: 55, tier1: 0, tier2: 1, tier3: 3 },
    { name: "Grand Gedeh", facilities: 3, avgScore: 52, tier1: 0, tier2: 0, tier3: 3 },
    { name: "Others (5 counties)", facilities: 9, avgScore: 48, tier1: 0, tier2: 2, tier3: 7 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Regional Clusters</h1>
        <p className="text-muted-foreground">Readiness by county — average scores and tier distribution</p>
      </div>

      <div className="grid gap-4">
        {clusterData.map((cluster) => (
          <Card key={cluster.name} className="shadow-none">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{cluster.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{cluster.facilities} facilities</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{cluster.avgScore}</p>
                  <p className="text-xs text-muted-foreground">avg score</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="text-muted-foreground">Tier 1: <strong>{cluster.tier1}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-amber-500 rounded-full" />
                  <span className="text-muted-foreground">Tier 2: <strong>{cluster.tier2}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-muted-foreground">Tier 3: <strong>{cluster.tier3}</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
