import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { pageMetadata } from "@/lib/site-metadata"
import { Building2, GraduationCap, Users } from "lucide-react"
import { CountyFilter } from "@/components/public/county-filter"
import { ErrorBanner } from "@/components/public/error-banner"
import { DlaTable } from "@/components/public/dla-table"
import { KpiMetric } from "@/components/public/kpi-metric"
import { PublicShell } from "@/components/public/PublicShell"
import { Card, CardContent } from "@/components/ui/card"
import { getPublicDla, getPublicFacilities, getPublicOverview } from "@/lib/public-api"

export const metadata: Metadata = pageMetadata({
  title: "Digital literacy",
  description:
    "Digital Literacy Assessment (DLA) scores and response counts by facility and county.",
  path: "/dla",
})

interface DlaPageProps {
  searchParams: Promise<{ county?: string }>
}

export default async function DlaPage({ searchParams }: DlaPageProps) {
  const sp = await searchParams
  const countyFilter = sp.county?.trim() || undefined

  let dla = null
  let error: string | null = null

  try {
    dla = await getPublicDla()
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load digital literacy assessment"
  }

  let metaBySlug: Record<
    string,
    { name: string; county: string; district: string | null }
  > = {}
  let counties: string[] = []

  try {
    const [facilitiesPage, overview] = await Promise.all([
      getPublicFacilities(),
      getPublicOverview().catch(() => null),
    ])
    metaBySlug = Object.fromEntries(
      facilitiesPage.items.map((f) => [
        f.slug,
        { name: f.name, county: f.county, district: f.district },
      ])
    )
    counties = overview
      ? [...new Set(overview.by_county.map((c) => c.county))].sort((a, b) =>
          a.localeCompare(b)
        )
      : [...new Set(facilitiesPage.items.map((f) => f.county))].sort((a, b) =>
          a.localeCompare(b)
        )
  } catch {
    // table falls back to slug only
  }

  const coverage = dla?.coverage
  const confidence = dla?.confidence_summary
  let rows =
    dla?.facilities.map((s) => {
      const meta = metaBySlug[s.facility_slug]
      return {
        ...s,
        facility_name:
          meta?.name ?? s.facility_slug.replace(/_/g, " "),
        county: meta?.county ?? "—",
        district: meta?.district ?? null,
      }
    }) ?? []

  if (countyFilter) {
    rows = rows.filter((r) => r.county === countyFilter)
  }

  const scoreVals = rows.map((r) => r.avg_score).filter((v): v is number => v != null)
  const nationalAvg =
    scoreVals.length > 0
      ? `${(scoreVals.reduce((a, b) => a + b, 0) / scoreVals.length).toFixed(1)}/100`
      : "—"

  const description = countyFilter
    ? `${rows.length} facilit${rows.length === 1 ? "y" : "ies"} in ${countyFilter}`
    : "By facility"

  return (
    <PublicShell
      lastRefreshed={dla?.last_refreshed}
      title="Digital literacy"
      description={description}
    >
      {error && <ErrorBanner message={error} />}

      {dla && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiMetric
              icon={GraduationCap}
              label="Avg score"
              value={nationalAvg}
              description={[
                coverage
                  ? `${coverage.facilities_with_responses} / ${coverage.registry_count}`
                  : null,
                coverage?.total_responses != null
                  ? `${coverage.total_responses} responses`
                  : null,
              ].filter((line): line is string => line != null)}
            />
            <KpiMetric
              icon={Users}
              label="Responses"
              value={coverage?.total_responses ?? dla.raw_submission_count}
            />
            <KpiMetric
              icon={Building2}
              label="With responses"
              value={`${coverage?.facilities_with_responses ?? 0} / ${coverage?.registry_count ?? 37}`}
            />
            <KpiMetric
              icon={GraduationCap}
              label="Full confidence"
              value={
                confidence
                  ? `${confidence.sufficient_count} / ${(confidence.sufficient_count ?? 0) + (confidence.indicative_count ?? 0)}`
                  : "—"
              }
              description={confidence ? `n≥${confidence.min_n} per facility` : undefined}
            />
          </div>

          {coverage && coverage.missing_from_survey.length > 0 && (
            <Card className="border-amber-200/80 bg-amber-50/60 shadow-none">
              <CardContent className="pt-4 text-sm text-amber-950">
                {coverage.missing_from_survey.length} facilities with no responses yet.
              </CardContent>
            </Card>
          )}

          <Suspense fallback={null}>
            <CountyFilter
              counties={counties}
              currentCounty={countyFilter ?? ""}
            />
          </Suspense>

          <Card className="shadow-none">
            <CardContent className="pt-6">
              <DlaTable rows={rows} />
            </CardContent>
          </Card>
        </>
      )}
    </PublicShell>
  )
}
