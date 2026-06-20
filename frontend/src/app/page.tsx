import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { pageMetadata } from "@/lib/site-metadata"

export const metadata: Metadata = pageMetadata({
  title: "National overview",
  description:
    "National deployment readiness: tier mix, domain averages, blockers, and facility rollups for Liberia HOS rollout.",
  path: "/",
})
import { ErrorBanner } from "@/components/public/error-banner"
import { FacilityDataTable } from "@/components/public/facility-data-table"
import { PublicShell } from "@/components/public/PublicShell"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { InteractiveOverview } from "@/components/public/interactive-overview"
import { getPublicFacilities, getPublicOverview } from "@/lib/public-api"

export default async function HomePage() {
  let overview = null
  let topFacilities: Awaited<ReturnType<typeof getPublicFacilities>>["items"] = []
  let allFacilities: Awaited<ReturnType<typeof getPublicFacilities>>["items"] = []
  let counties: string[] = []
  let error: string | null = null

  try {
    overview = await getPublicOverview()
    const page = await getPublicFacilities()
    allFacilities = page.items
    topFacilities = [...page.items]
      .filter((f) => f.overall_score != null)
      .sort((a, b) => (b.overall_score ?? 0) - (a.overall_score ?? 0))
      .slice(0, 8)
    counties = [...new Set(overview.by_county.map((c) => c.county))].sort((a, b) =>
      a.localeCompare(b)
    )
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load dashboard"
  }

  return (
    <PublicShell lastRefreshed={overview?.last_refreshed} title="Overview">
      {error && <ErrorBanner message={error} />}

      {overview && (
        <>
          <Suspense fallback={null}>
            <InteractiveOverview overview={overview} counties={counties} facilities={allFacilities} />
          </Suspense>

          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <div className="text-base font-semibold">Top scores</div>
              </div>
              <Link
                href="/facilities"
                className="text-xs font-medium text-primary hover:underline underline-offset-2"
              >
                All facilities →
              </Link>
            </CardHeader>
            <CardContent>
              <FacilityDataTable facilities={topFacilities} compact />
            </CardContent>
          </Card>

          {overview.not_assessed_count > 0 && (
            <Card className="border-amber-200/80 bg-amber-50/80 shadow-none">
              <CardContent className="pt-4 text-sm text-amber-950">
                <strong>{overview.not_assessed_count}</strong>{" "}
                {overview.not_assessed_count === 1 ? "facility" : "facilities"} not assessed yet.{" "}
                <Link href="/data-quality" className="font-medium underline underline-offset-2">
                  Data quality
                </Link>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </PublicShell>
  )
}
