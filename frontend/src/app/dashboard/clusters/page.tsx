import { getPublicClusters } from "@/lib/public-api"
import { parseDashboardScope } from "@/lib/dashboard-scope"
import { ClustersClient } from "@/components/public/clusters-client"
import { PageHeader } from "@/components/public/page-header"
import { CLUSTER_DEFINITION, PROGRAMME_CLUSTERS } from "@/lib/clusters"

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
  const { facilityTypeLabel } = parseDashboardScope(sp)

  try {
    const clusterData = await getPublicClusters()

    return (
      <>
        <PageHeader
          title="Clusters"
          assessed={clusterData.clusters.length}
          target={PROGRAMME_CLUSTERS.length}
        />
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{CLUSTER_DEFINITION}</p>
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
