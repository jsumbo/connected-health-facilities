/** Canonical deployment clusters — keep in sync with backend `PROGRAMME_CLUSTERS`. */
export const PROGRAMME_CLUSTERS = [
  "Montserrado",
  "Margibi",
  "Grand Cape Mount",
  "Lofa",
  "Nimba",
  "Southeast Region",
] as const

export type ProgrammeCluster = (typeof PROGRAMME_CLUSTERS)[number]

export function clusterSortIndex(cluster: string): number {
  const index = PROGRAMME_CLUSTERS.indexOf(cluster as ProgrammeCluster)
  return index === -1 ? PROGRAMME_CLUSTERS.length : index
}
