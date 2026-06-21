import { getPublicClusters, getPublicFacilities } from "@/lib/public-api"
import { ClustersClient } from "@/components/public/clusters-client"
import { PageHeader } from "@/components/public/page-header"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Clusters | Dashboard",
}

export default async function ClustersPage() {
  try {
    const [clusterData, facilitiesData] = await Promise.all([
      getPublicClusters(),
      getPublicFacilities(),
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
        <ClustersClient clusters={clusterData.clusters} />
      </>
    )
  } catch {
    return <div className="py-12 text-center text-red-600">Error loading clusters data</div>
  }
}
