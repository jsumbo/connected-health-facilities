import { Suspense } from "react"
import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site-metadata"
import { getPublicFacilities, getPublicOverview } from "@/lib/public-api"
import { HeatmapGridClient } from "@/components/public/heatmap-grid-client"
import { PublicShell } from "@/components/public/PublicShell"

export const dynamic = "force-dynamic"

export const metadata: Metadata = pageMetadata({
  title: "Readiness Heatmap",
  description: "Every facility × every domain in one view. Sorted by composite readiness score.",
  path: "/readiness-heatmap",
})

async function HeatmapContent() {
  const [facilities, overview] = await Promise.all([
    getPublicFacilities(),
    getPublicOverview(),
  ])

  const counties = [
    ...new Set((overview.by_county || []).map((c: any) => c.county)),
  ].sort()

  return <HeatmapGridClient initialFacilities={facilities.items || []} counties={counties} />
}

export default function ReadinessHeatmapPage() {
  return (
    <PublicShell title="Readiness Heatmap" description="Every facility × every domain (0–3) in one view">
      <Suspense fallback={<div className="h-96 bg-slate-100 rounded-lg animate-pulse" />}>
        <HeatmapContent />
      </Suspense>
    </PublicShell>
  )
}
