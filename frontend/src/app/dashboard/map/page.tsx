import type { Metadata } from "next"
import { ErrorBanner } from "@/components/public/error-banner"
import type { MapFacility } from "@/components/public/facility-map"
import { FacilityMapView } from "@/components/public/facility-map-view"
import { getPublicFacilities, getPublicOverview, getFacilityPhotoUrl } from "@/lib/public-api"
import { parseDashboardScope } from "@/lib/dashboard-scope"

export const metadata: Metadata = {
  title: "Map | Dashboard",
}

export const dynamic = "force-dynamic"

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ facility_type?: string }>
}) {
  const sp = await searchParams
  const { facilityTypeQuery } = parseDashboardScope(sp)

  let mapFacilities: MapFacility[] = []
  let overview = null
  let error: string | null = null

  try {
    const [page, ov] = await Promise.all([
      getPublicFacilities(facilityTypeQuery),
      getPublicOverview(),
    ])
    overview = ov
    mapFacilities = page.items
      .filter((f) => f.latitude != null && f.longitude != null)
      .map((f) => ({
        slug: f.slug,
        name: f.name,
        county: f.county,
        tier: f.tier,
        overall_score: f.overall_score,
        latitude: f.latitude as number,
        longitude: f.longitude as number,
        assessment_status: f.assessment_status,
        has_facility_photo: f.has_facility_photo,
        photo_url: f.has_facility_photo ? getFacilityPhotoUrl(f.slug) : null,
      }))
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load map data"
  }

  const total = overview?.programme_target ?? mapFacilities.length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Facility Map</h1>
        <p className="text-muted-foreground">Geographic distribution of facilities by readiness tier</p>
      </div>

      {error && <ErrorBanner message={error} />}

      {!error && <FacilityMapView facilities={mapFacilities} totalCount={total} />}
    </div>
  )
}
