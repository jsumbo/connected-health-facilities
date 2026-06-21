import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site-metadata"
import { ClustersClient } from "@/components/public/clusters-client"
import { ErrorBanner } from "@/components/public/error-banner"
import { PublicShell } from "@/components/public/PublicShell"
import { getPublicClusters, getPublicFacilities } from "@/lib/public-api"

export const dynamic = "force-dynamic"

export const metadata: Metadata = pageMetadata({
  title: "Clusters",
  description: "Deployment cluster readiness and domain profiles.",
  path: "/clusters",
})

export default async function ClustersPage() {
  let error: string | null = null
  let clusters: Awaited<ReturnType<typeof getPublicClusters>>["clusters"] = []
  let assessedCount = 0
  let targetCount = 37

  try {
    const [clusterData, facilitiesData] = await Promise.all([
      getPublicClusters(),
      getPublicFacilities(),
    ])
    clusters = clusterData.clusters
    targetCount = facilitiesData.total
    assessedCount = facilitiesData.items.filter((f) => f.assessment_status === "complete").length
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to load clusters data"
  }

  return (
    <PublicShell title="Clusters" assessed={assessedCount} target={targetCount}>
      {error ? <ErrorBanner message={error} /> : null}
      {!error ? <ClustersClient clusters={clusters} /> : null}
    </PublicShell>
  )
}
