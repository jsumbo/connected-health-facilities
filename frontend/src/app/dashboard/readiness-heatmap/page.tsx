import { Suspense } from "react"
import { getPublicFacilities, getPublicOverview } from "@/lib/public-api"
import { parseDashboardScope } from "@/lib/dashboard-scope"
import { HeatmapGridClient } from "@/components/public/heatmap-grid-client"
import { PageHeader } from "@/components/public/page-header"

export const metadata = {
  title: "Readiness Heatmap | Dashboard",
}

async function HeatmapContent({
  searchParams,
}: {
  searchParams: Promise<{ facility_type?: string }>
}) {
  const sp = await searchParams
  const { facilityTypeQuery } = parseDashboardScope(sp)

  const [facilities, overview] = await Promise.all([
    getPublicFacilities(facilityTypeQuery),
    getPublicOverview(),
  ])

  const counties = [...new Set((overview.by_county || []).map((c) => c.county))].sort()

  return (
    <>
      <PageHeader
        title="Readiness Heatmap"
        assessed={overview.assessed_count}
        target={overview.programme_target}
      />
      <HeatmapGridClient initialFacilities={facilities.items || []} counties={counties} />
    </>
  )
}

export default function ReadinessHeatmapPage({
  searchParams,
}: {
  searchParams: Promise<{ facility_type?: string }>
}) {
  return (
    <Suspense
      fallback={<div className="h-96 animate-pulse rounded-lg bg-muted" />}
    >
      <HeatmapContent searchParams={searchParams} />
    </Suspense>
  )
}
