/** Canonical deployment clusters — keep in sync with backend `PROGRAMME_CLUSTERS`. */
export const PROGRAMME_CLUSTERS = [
  "Montserrado",
  "Margibi",
  "Grand Cape Mount",
  "Lofa",
  "Nimba",
  "Southeast Region",
] as const

/** Shared copy for cluster explainer text across dashboard views. */
export const CLUSTER_DEFINITION =
  "Cluster — a grouping of neighbouring counties used for field assessment and rollout sequencing"

export type ProgrammeCluster = (typeof PROGRAMME_CLUSTERS)[number]

export function clusterSortIndex(cluster: string): number {
  const index = PROGRAMME_CLUSTERS.indexOf(cluster as ProgrammeCluster)
  return index === -1 ? PROGRAMME_CLUSTERS.length : index
}
