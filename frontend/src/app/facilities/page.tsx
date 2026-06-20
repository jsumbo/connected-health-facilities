import type { Metadata } from "next"
import { Suspense } from "react"
import { pageMetadata } from "@/lib/site-metadata"
import { ErrorBanner } from "@/components/public/error-banner"
import { FacilityFilters } from "@/components/public/facility-filters"
import { FacilitiesWrapper } from "@/components/public/facilities-wrapper"
import { PublicShell } from "@/components/public/PublicShell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPublicFacilities, getPublicOverview } from "@/lib/public-api"
import { CheckCircle2, AlertCircle, Zap } from "lucide-react"

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

  let allFacilities: Awaited<ReturnType<typeof getPublicFacilities>>["items"] = []
  let overview = null
  let error: string | null = null

  try {
    const [page, ov] = await Promise.all([
      getPublicFacilities(),
      getPublicOverview(),
    ])
    allFacilities = page.items.sort((a, b) => a.name.localeCompare(b.name))
    overview = ov
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load facilities"
  }

  const counties = overview
    ? [...new Set(overview.by_county.map((c) => c.county))].sort((a, b) => a.localeCompare(b))
    : [...new Set(allFacilities.map((f) => f.county))].sort((a, b) => a.localeCompare(b))

  return (
    <PublicShell
      lastRefreshed={overview?.last_refreshed}
      title="Facilities"
      description={overview?.assessed_count ? `${overview.assessed_count} of ${overview.programme_target} assessed` : ""}
    >

      {error && <ErrorBanner message={error} />}

      {overview && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-emerald-700">
                <CheckCircle2 className="size-4" aria-hidden />
                HOS-Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-600">
                {overview.tier_counts["Tier 1 — HOS-Ready"] ?? 0}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-sky-700">
                <Zap className="size-4" aria-hidden />
                Deployment-Eligible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-sky-600">
                {overview.tier_counts["Tier 2 — Deployment-Eligible"] ?? 0}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-amber-700">
                <AlertCircle className="size-4" aria-hidden />
                Structured Remediation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">
                {overview.tier_counts["Tier 2 — Structured Remediation"] ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Suspense fallback={null}>
        <FacilityFilters
          counties={counties}
          currentCounty={sp.county?.trim() ?? ""}
          currentTier={sp.tier?.trim() ?? ""}
        />
      </Suspense>

      <FacilitiesWrapper facilities={allFacilities} />
    </PublicShell>
  )
}
