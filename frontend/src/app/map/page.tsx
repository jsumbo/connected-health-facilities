import type { Metadata } from "next"
import { ErrorBanner } from "@/components/public/error-banner"
import { pageMetadata } from "@/lib/site-metadata"
import type { MapFacility } from "@/components/public/facility-map"

export const metadata: Metadata = pageMetadata({
  title: "Facility map",
  description:
    "Geographic view of health facility readiness, tiers, and locations across Liberia.",
  path: "/map",
})

export const dynamic = "force-dynamic"
import { FacilityMapView } from "@/components/public/facility-map-view"
import { PublicShell } from "@/components/public/PublicShell"
import { getFacilityPhotoUrl, getPublicFacilities, getPublicOverview } from "@/lib/public-api"

export default async function MapPage() {
  let mapFacilities: MapFacility[] = []
  let overview = null
  let error: string | null = null

  try {
    const [page, ov] = await Promise.all([getPublicFacilities(), getPublicOverview()])
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
    <PublicShell
      lastRefreshed={overview?.last_refreshed}
      title="Map"
    >
      {error && <ErrorBanner message={error} />}

      {!error && <FacilityMapView facilities={mapFacilities} totalCount={total} />}
    </PublicShell>
  )
}
