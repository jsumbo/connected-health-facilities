import { PageHeader } from "@/components/public/page-header"
import { WhatDrivesClient } from "@/components/public/what-drives-client"
import { getPublicFacilities, getPublicOverview } from "@/lib/public-api"
import { parseDashboardScope } from "@/lib/dashboard-scope"

export const metadata = {
  title: "What Drives Readiness | Dashboard",
}

export default async function WhatDrivesPage({
  searchParams,
}: {
  searchParams: Promise<{ facility_type?: string }>
}) {
  const sp = await searchParams
  const { facilityTypeQuery } = parseDashboardScope(sp)

  const [facilitiesData, overview] = await Promise.all([
    getPublicFacilities(facilityTypeQuery),
    getPublicOverview().catch(() => null),
  ])

  const facilities = facilitiesData.items
  const assessedCount = overview?.assessed_count ?? facilities.length
  const targetCount = overview?.programme_target ?? facilitiesData.total

  return (
    <div className="space-y-6">
      <PageHeader
        title="What Drives Readiness"
        assessed={assessedCount}
        target={targetCount}
      />
      <WhatDrivesClient facilities={facilities} />
    </div>
  )
}
