import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site-metadata"
import { ErrorBanner } from "@/components/public/error-banner"
import { PublicShell } from "@/components/public/PublicShell"
import { QuickWinsClient } from "@/components/public/quick-wins-client"
import { getPublicFacilities, getPublicOverview } from "@/lib/public-api"

export const metadata: Metadata = pageMetadata({
  title: "Quick Wins",
  description: "Tier 3 facilities with a single deployment blocker.",
  path: "/quick-wins",
})

export default async function QuickWinsPage() {
  let facilities: Awaited<ReturnType<typeof getPublicFacilities>>["items"] = []
  let assessedCount = 0
  let targetCount = 37
  let error: string | null = null

  try {
    const [result, overview] = await Promise.all([
      getPublicFacilities(),
      getPublicOverview().catch(() => null),
    ])
    facilities = result.items
    assessedCount =
      overview?.assessed_count ??
      facilities.filter((f) => f.assessment_status === "complete").length
    targetCount = overview?.programme_target ?? result.total ?? 37
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to load facility data"
  }

  return (
    <PublicShell title="Quick Wins" assessed={assessedCount} target={targetCount}>
      {error ? <ErrorBanner message={error} /> : null}
      {!error ? <QuickWinsClient facilities={facilities} /> : null}
    </PublicShell>
  )
}
