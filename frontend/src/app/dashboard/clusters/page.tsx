import { getPublicClusters, getPublicFacilities } from "@/lib/public-api"
import { parseDashboardScope } from "@/lib/dashboard-scope"
import { ClustersClient } from "@/components/public/clusters-client"
import { PageHeader } from "@/components/public/page-header"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Clusters | Dashboard",
}

export default async function ClustersPage({
  searchParams,
}: {
  searchParams: Promise<{ facility_type?: string }>
}) {
  const sp = await searchParams
  const { facilityTypeQuery, facilityTypeLabel } = parseDashboardScope(sp)

  try {
    const [clusterData, facilitiesData] = await Promise.all([
      getPublicClusters(),
      getPublicFacilities(facilityTypeQuery),
    ])

    const assessedCount = facilitiesData.items.filter(
      (f) => f.assessment_status === "complete"
    ).length

    return (
      <>
        <PageHeader
          title="Clusters"
          assessed={assessedCount}
          target={facilitiesData.total}
        />
        {facilityTypeLabel ? (
          <p className="mb-4 text-sm text-muted-foreground">
            Facility counts reflect {facilityTypeLabel} only. Cluster rollups below remain programme-wide.
          </p>
        ) : null}
        <ClustersClient clusters={clusterData.clusters} />
      </>
    )
  } catch {
    return <div className="py-12 text-center text-red-600">Error loading clusters data</div>
  }
}
