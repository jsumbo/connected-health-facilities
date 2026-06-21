import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site-metadata"
import { ErrorBanner } from "@/components/public/error-banner"
import { HeatmapGridClient } from "@/components/public/heatmap-grid-client"
import { PublicShell } from "@/components/public/PublicShell"
import { getPublicFacilities, getPublicOverview } from "@/lib/public-api"

export const metadata: Metadata = pageMetadata({
  title: "Readiness Heatmap",
  description: "Facility × DRF domain readiness matrix sorted by composite score.",
  path: "/readiness-heatmap",
})

export default async function ReadinessHeatmapPage() {
  let facilities: Awaited<ReturnType<typeof getPublicFacilities>>["items"] = []
  let counties: string[] = []
  let assessedCount = 0
  let targetCount = 37
  let error: string | null = null

  try {
    const [facilitiesData, overview] = await Promise.all([
      getPublicFacilities(),
      getPublicOverview().catch(() => null),
    ])
    facilities = facilitiesData.items
    assessedCount = overview?.assessed_count ?? facilities.length
    targetCount = overview?.programme_target ?? facilitiesData.total
    counties = overview
      ? [...new Set(overview.by_county.map((c) => c.county))].sort((a, b) => a.localeCompare(b))
      : [...new Set(facilities.map((f) => f.county))].sort((a, b) => a.localeCompare(b))
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to load heatmap data"
  }

  return (
    <PublicShell
      title="Readiness Heatmap"
      assessed={assessedCount}
      target={targetCount}
    >
      {error ? <ErrorBanner message={error} /> : null}
      {!error ? <HeatmapGridClient initialFacilities={facilities} counties={counties} /> : null}
    </PublicShell>
  )
}
