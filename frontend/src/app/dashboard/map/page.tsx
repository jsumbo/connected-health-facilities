import { Suspense } from "react"
import { getPublicFacilities } from "@/lib/public-api"
import { GeoMap } from "@/components/public/geo-map"

export const metadata = {
  title: "Map | Dashboard",
}

async function MapContent() {
  const facilities = await getPublicFacilities()
  return <GeoMap facilities={facilities.items || []} />
}

export default function MapPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Facility Map</h1>
        <p className="text-muted-foreground">Geographic distribution of facilities by readiness tier</p>
      </div>

      <Suspense fallback={<div className="h-96 bg-muted rounded-lg animate-pulse" />}>
        <MapContent />
      </Suspense>
    </div>
  )
}
