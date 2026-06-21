import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site-metadata"
import { ErrorBanner } from "@/components/public/error-banner"
import { PublicShell } from "@/components/public/PublicShell"
import { WhatDrivesClient } from "@/components/public/what-drives-client"
import { getPublicFacilities, getPublicOverview } from "@/lib/public-api"

export const metadata: Metadata = pageMetadata({
  title: "What Drives Readiness",
  description: "Factors that predict deployment readiness.",
  path: "/what-drives-readiness",
})

export default async function WhatDrivesReadinessPage() {
  let facilities: Awaited<ReturnType<typeof getPublicFacilities>>["items"] = []
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
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to load data"
  }

  return (
    <PublicShell
      title="What Drives Readiness"
      assessed={assessedCount}
      target={targetCount}
    >
      {error ? <ErrorBanner message={error} /> : null}
      {!error ? <WhatDrivesClient facilities={facilities} /> : null}
    </PublicShell>
  )
}
