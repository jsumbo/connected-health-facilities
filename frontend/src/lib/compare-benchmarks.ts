import type { ProgrammeFacility } from "@/lib/types-public"

export interface CompareBenchmarks {
  nationalAvgScore: number | null
  clusterAvgScore: number | null
  clusterName: string | null
  nationalDomainAvgs: Record<string, number | null>
  clusterDomainAvgs: Record<string, number | null>
}

export function computeCompareBenchmarks(
  facility: ProgrammeFacility,
  allFacilities: ProgrammeFacility[]
): CompareBenchmarks {
  const assessed = allFacilities.filter(
    (f) => f.assessment_status === "complete" && f.overall_score != null
  )

  const nationalScores = assessed.map((f) => f.overall_score as number)
  const nationalAvgScore =
    nationalScores.length > 0
      ? nationalScores.reduce((a, b) => a + b, 0) / nationalScores.length
      : null

  const clusterPeers = assessed.filter((f) => f.cluster === facility.cluster)
  const clusterScores = clusterPeers.map((f) => f.overall_score as number)
  const clusterAvgScore =
    clusterScores.length > 0
      ? clusterScores.reduce((a, b) => a + b, 0) / clusterScores.length
      : null

  const domainCodes = new Set<string>()
  for (const f of assessed) {
    Object.keys(f.domain_scores).forEach((k) => domainCodes.add(k))
  }

  const nationalDomainAvgs: Record<string, number | null> = {}
  const clusterDomainAvgs: Record<string, number | null> = {}

  for (const code of domainCodes) {
    const nationalVals = assessed
      .map((f) => f.domain_scores[code]?.score)
      .filter((v): v is number => v != null)
    nationalDomainAvgs[code] =
      nationalVals.length > 0
        ? nationalVals.reduce((a, b) => a + b, 0) / nationalVals.length
        : null

    const clusterVals = clusterPeers
      .map((f) => f.domain_scores[code]?.score)
      .filter((v): v is number => v != null)
    clusterDomainAvgs[code] =
      clusterVals.length > 0
        ? clusterVals.reduce((a, b) => a + b, 0) / clusterVals.length
        : null
  }

  return {
    nationalAvgScore,
    clusterAvgScore,
    clusterName: facility.cluster || null,
    nationalDomainAvgs,
    clusterDomainAvgs,
  }
}
