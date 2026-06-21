import { Suspense } from "react"
import { getPublicFacilities, getPublicOverview } from "@/lib/public-api"
import { HeatmapGridClient } from "@/components/public/heatmap-grid-client"
import { PageHeader } from "@/components/public/page-header"

export const metadata = {
  title: "Readiness Heatmap | Dashboard",
}

async function HeatmapContent() {
  const [facilities, overview] = await Promise.all([
    getPublicFacilities(),
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

export default function ReadinessHeatmapPage() {
  return (
    <Suspense
      fallback={<div className="h-96 animate-pulse rounded-lg bg-muted" />}
    >
      <HeatmapContent />
    </Suspense>
  )
}
