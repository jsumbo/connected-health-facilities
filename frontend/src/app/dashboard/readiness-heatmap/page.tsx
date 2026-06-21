import { Suspense } from "react"
import { getPublicFacilities, getPublicOverview } from "@/lib/public-api"
import { HeatmapGridClient } from "@/components/public/heatmap-grid-client"

export const metadata = {
  title: "Readiness Heatmap | Dashboard",
}

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
    <Suspense fallback={<div className="space-y-8"><div className="h-96 bg-muted rounded-lg animate-pulse" /></div>}>
      <HeatmapContent />
    </Suspense>
  )
}
