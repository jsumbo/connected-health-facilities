import type { Metadata } from "next"
import { Suspense } from "react"
import { pageMetadata } from "@/lib/site-metadata"
import { ErrorBanner } from "@/components/public/error-banner"
import { FacilityDataTable } from "@/components/public/facility-data-table"
import { FacilityFilters } from "@/components/public/facility-filters"
import { PublicShell } from "@/components/public/PublicShell"
import { Card, CardContent } from "@/components/ui/card"
import { getPublicFacilities, getPublicOverview } from "@/lib/public-api"

export const metadata: Metadata = pageMetadata({
  title: "Facilities",
  description:
    "Browse all assessed health facilities with readiness scores, deployment tiers, counties, and filters.",
  path: "/facilities",
})

interface FacilitiesPageProps {
  searchParams: Promise<{ county?: string; tier?: string }>
}

export default async function FacilitiesPage({ searchParams }: FacilitiesPageProps) {
  const sp = await searchParams
  const county = sp.county?.trim() || undefined
  const tier = sp.tier?.trim() || undefined

  let facilities: Awaited<ReturnType<typeof getPublicFacilities>>["items"] = []
  let total = 0
  let overview = null
  let error: string | null = null

  try {
    const [page, ov] = await Promise.all([
      getPublicFacilities({ county, tier }),
      getPublicOverview(),
    ])
    facilities = page.items.sort((a, b) => a.name.localeCompare(b.name))
    total = page.total
    overview = ov
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load facilities"
  }

  const counties = overview
    ? [...new Set(overview.by_county.map((c) => c.county))].sort((a, b) => a.localeCompare(b))
    : [...new Set(facilities.map((f) => f.county))].sort((a, b) => a.localeCompare(b))

  const filterSummary =
    county || tier
      ? `${total} shown`
      : `${overview?.assessed_count ?? "—"} of ${overview?.programme_target ?? "—"} assessed`

  return (
    <PublicShell
      lastRefreshed={overview?.last_refreshed}
      title="Facilities"
      description={filterSummary}
    >

      {error && <ErrorBanner message={error} />}

      <Suspense fallback={null}>
        <FacilityFilters
          counties={counties}
          currentCounty={county ?? ""}
          currentTier={tier ?? ""}
        />
      </Suspense>

      <Card className="shadow-none">
        <CardContent className="pt-6">
          <FacilityDataTable facilities={facilities} />
        </CardContent>
      </Card>
    </PublicShell>
  )
}
