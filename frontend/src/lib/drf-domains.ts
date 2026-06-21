export const DRF_DOMAIN_KEYS = [
  "D_POW",
  "D_CON",
  "D_ICT",
  "D_DIG",
  "D_SEN",
  "D_DAT",
] as const

export type DrfDomainKey = (typeof DRF_DOMAIN_KEYS)[number]

export const DRF_DOMAIN_HEADERS: Record<DrfDomainKey, string> = {
  D_POW: "POW",
  D_CON: "CON",
  D_ICT: "ICT",
  D_DIG: "DIG",
  D_SEN: "SEN",
  D_DAT: "DAT",
}

export const DRF_DOMAIN_LABELS: Record<DrfDomainKey, string> = {
  D_POW: "Power",
  D_CON: "Connectivity",
  D_ICT: "ICT hardware",
  D_DIG: "Digital literacy",
  D_SEN: "Sentiment",
  D_DAT: "Data maturity",
}

/** API cluster rollup keys use hyphenated codes (D-POW), not underscore keys (D_POW). */
export const DRF_DOMAIN_CODES: Record<DrfDomainKey, string> = {
  D_POW: "D-POW",
  D_CON: "D-CON",
  D_ICT: "D-ICT",
  D_DIG: "D-DIG",
  D_SEN: "D-SEN",
  D_DAT: "D-DAT",
}

export function getClusterDomainAverage(
  domainAverages: Record<string, number | null | undefined>,
  key: DrfDomainKey
): number | null {
  const value =
    domainAverages[DRF_DOMAIN_CODES[key]] ??
    domainAverages[key] ??
    null
  return value ?? null
}

export function getDrfDomainScore(
  domainScores: Record<string, { score?: number | null } | undefined>,
  key: DrfDomainKey
): number | null {
  const entry = domainScores[key]
  if (!entry || entry.score == null) return null
  return entry.score
}
