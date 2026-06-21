import type { Metadata } from "next"
import { AlertTriangle, CircleDashed, MapPinOff, MessageSquare, Sparkles, Users } from "lucide-react"
import { pageMetadata } from "@/lib/site-metadata"
import { ErrorBanner } from "@/components/public/error-banner"
import { FacilityDataTable } from "@/components/public/facility-data-table"
import { KpiMetric } from "@/components/public/kpi-metric"
import { PublicShell } from "@/components/public/PublicShell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDataQuality, getPublicOverview } from "@/lib/public-api"

export const dynamic = "force-dynamic"

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

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <KpiMetric
              icon={MessageSquare}
              label="Sentiment n<3"
              value={report.sentiment_insufficient.length}
              description={
                report.instrument_confidence
                  ? `${report.instrument_confidence.sentiment_sufficient_count} at full confidence`
                  : "Indicative only"
              }
            />
            <KpiMetric
              icon={Users}
              label="DLA n<3"
              value={report.dla_insufficient.length}
              description={
                report.instrument_confidence
                  ? `${report.instrument_confidence.dla_sufficient_count} at full confidence`
                  : "Reduced D-DIG weight"
              }
            />
            <KpiMetric
              icon={Sparkles}
              label="Adoption risk"
              value={report.adoption_risk.length}
              description="Low enthusiasm + burdensome"
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

          {report.adoption_risk.length > 0 && (
            <Card className="shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Adoption risk</CardTitle>
              </CardHeader>
              <CardContent>
                <FacilityDataTable facilities={report.adoption_risk} />
              </CardContent>
            </Card>
          )}

          {report.sentiment_insufficient.length > 0 && (
            <Card className="border-amber-200/80 bg-amber-50/60 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-amber-950">
                  Sentiment indicative only (n{"<"}3)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FacilityDataTable facilities={report.sentiment_insufficient} />
              </CardContent>
            </Card>
          )}

          {report.dla_insufficient.length > 0 && (
            <Card className="border-amber-200/80 bg-amber-50/60 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-amber-950">
                  DLA indicative only (n{"<"}3)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FacilityDataTable facilities={report.dla_insufficient} />
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
