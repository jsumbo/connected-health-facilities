import { getPublicOverview, getPublicFacilities } from "@/lib/public-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Data Quality | Dashboard",
}

export default async function DataQualityPage() {
  const [overview, facilitiesData] = await Promise.all([
    getPublicOverview(),
    getPublicFacilities(),
  ])

  const facilities = facilitiesData.items || []

  const qualityMetrics = [
    {
      name: "Facilities assessed",
      value: facilities.length,
      total: 43,
      description: "Facilities with full assessment data",
    },
    {
      name: "With GPS coordinates",
      value: facilities.filter((f) => f.has_gps).length,
      total: facilities.length,
      description: "Facilities mapped geographically",
    },
    {
      name: "With DLA scores",
      value: facilities.filter((f) => f.dla_avg_score !== null && f.dla_avg_score !== undefined).length,
      total: facilities.length,
      description: "Digital literacy data collected",
    },
    {
      name: "With staff sentiment",
      value: facilities.filter((f) => f.sentiment_avg_enthusiasm !== null && f.sentiment_avg_enthusiasm !== undefined).length,
      total: facilities.length,
      description: "Staff feedback recorded",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Data Quality</h1>
        <p className="text-muted-foreground">
          Completeness and coverage of assessment data across all facilities
        </p>
      </div>

      <div className="grid gap-4">
        {qualityMetrics.map((metric) => {
          const percentage = metric.total > 0 ? Math.round((metric.value / metric.total) * 100) : 0
          return (
            <Card key={metric.name} className="shadow-none">
              <CardHeader>
                <CardTitle className="text-base">{metric.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">
                      of {metric.total} ({percentage}%)
                    </p>
                  </div>
                  <div className="w-32 h-8 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="shadow-none border border-border bg-muted/20">
        <CardHeader>
          <CardTitle className="text-base">Assessment Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• All {facilities.length} facilities have completed baseline assessments</li>
            <li>• GPS coordinates enable geographic analysis and field deployment planning</li>
            <li>• DLA scores capture digital literacy readiness — critical for HOS adoption</li>
            <li>• Staff sentiment tracks change readiness and training needs</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
