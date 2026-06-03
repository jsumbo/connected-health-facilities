import type { Metadata } from "next"
import { AlertTriangle, CircleDashed, MapPinOff } from "lucide-react"
import { pageMetadata } from "@/lib/site-metadata"
import { ErrorBanner } from "@/components/public/error-banner"
import { FacilityDataTable } from "@/components/public/facility-data-table"
import { KpiMetric } from "@/components/public/kpi-metric"
import { PublicShell } from "@/components/public/PublicShell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDataQuality, getPublicOverview } from "@/lib/public-api"

export const metadata: Metadata = pageMetadata({
  title: "Data quality",
  description:
    "Assessment completeness, missing fields, GPS coverage, and facilities not yet assessed.",
  path: "/data-quality",
})

export default async function DataQualityPage() {
  let report = null
  let overview = null
  let error: string | null = null

  try {
    const [dq, ov] = await Promise.all([getDataQuality(), getPublicOverview()])
    report = dq
    overview = ov
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load data quality report"
  }

  return (
    <PublicShell
      lastRefreshed={overview?.last_refreshed}
      title="Data quality"
      description="Coverage and gaps"
    >

      {error && <ErrorBanner message={error} />}

      {report && (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <KpiMetric
              icon={CircleDashed}
              label="Not assessed"
              value={report.not_assessed.length}
              description={`of ${report.programme_target}`}
            />
            <KpiMetric
              icon={AlertTriangle}
              label="Low completeness"
              value={report.low_completeness.length}
              description="Below 85%"
            />
            <KpiMetric
              icon={MapPinOff}
              label="Missing GPS"
              value={report.missing_gps.length}
            />
          </div>

          {report.not_assessed.length > 0 && (
            <Card className="border-amber-200/80 bg-amber-50/60 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-amber-950">Not assessed</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.not_assessed.map((f) => (
                    <li key={f.slug} className="flex justify-between text-sm">
                      <span>{f.name}</span>
                      <span className="text-xs text-muted-foreground">Pending</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {report.low_completeness.length > 0 && (
            <Card className="shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Low completeness</CardTitle>
              </CardHeader>
              <CardContent>
                <FacilityDataTable facilities={report.low_completeness} />
              </CardContent>
            </Card>
          )}

          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">All facilities</CardTitle>
            </CardHeader>
            <CardContent>
              <FacilityDataTable facilities={report.facilities} />
            </CardContent>
          </Card>
        </>
      )}

    </PublicShell>
  )
}
