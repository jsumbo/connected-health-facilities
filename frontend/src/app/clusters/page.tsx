import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site-metadata"
import { ClustersClient } from "@/components/public/clusters-client"
import { PageInsightBanner } from "@/components/public/page-insight-banner"
import { buildClustersPageNote } from "@/lib/dashboard-notes"
import { ErrorBanner } from "@/components/public/error-banner"
import { PublicShell } from "@/components/public/PublicShell"
import { getPublicClusters } from "@/lib/public-api"
import { CLUSTER_DEFINITION, PROGRAMME_CLUSTERS } from "@/lib/clusters"

export const dynamic = "force-dynamic"

export const metadata: Metadata = pageMetadata({
  title: "Clusters",
  description: "Deployment cluster readiness and domain profiles.",
  path: "/clusters",
})

export default async function ClustersPage() {
  let error: string | null = null
  let clusters: Awaited<ReturnType<typeof getPublicClusters>>["clusters"] = []
  let clusterCount = PROGRAMME_CLUSTERS.length

  try {
    const clusterData = await getPublicClusters()
    clusters = clusterData.clusters
    clusterCount = clusterData.clusters.length
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to load clusters data"
  }

  return (
    <PublicShell title="Clusters" assessed={clusterCount} target={PROGRAMME_CLUSTERS.length}>
      {error ? <ErrorBanner message={error} /> : null}
      {!error ? (
        <>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{CLUSTER_DEFINITION}</p>
          <PageInsightBanner insight={buildClustersPageNote(clusters)} />
          <ClustersClient clusters={clusters} />
        </>
      ) : null}
    </PublicShell>
  )
}
