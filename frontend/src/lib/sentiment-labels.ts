export type BurdenCategory = "Useful" | "Neutral" | "Tolerable" | "Burdensome" | "Unknown"

const BURDEN_PATTERNS: ReadonlyArray<{ category: BurdenCategory; patterns: RegExp[] }> = [
  {
    category: "Useful",
    patterns: [
      /useful/i,
      /helps us deliver/i,
      /valuable/i,
      /benefit/i,
      /improve/i,
      /support.*care/i,
    ],
  },
  {
    category: "Burdensome",
    patterns: [
      /burden/i,
      /overwhelm/i,
      /too much/i,
      /difficult/i,
      /hard to use/i,
      /slow.*down/i,
      /waste/i,
    ],
  },
  {
    category: "Tolerable",
    patterns: [/tolerable/i, /manageable/i, /acceptable/i, /okay/i, /ok\b/i],
  },
  {
    category: "Neutral",
    patterns: [/neutral/i, /neither/i, /no strong/i, /mixed/i],
  },
]

export function mapBurdenCategory(raw: string | null | undefined): BurdenCategory {
  if (raw == null || raw.trim() === "") return "Unknown"
  const normalized = raw.replace(/_/g, " ").trim()
  for (const { category, patterns } of BURDEN_PATTERNS) {
    if (patterns.some((p) => p.test(normalized))) return category
  }
  return "Unknown"
}

export function formatBurdenLabel(raw: string | null | undefined): string {
  const category = mapBurdenCategory(raw)
  if (category !== "Unknown") return category
  if (raw == null || raw === "") return "—"
  return raw.replace(/_/g, " ")
}

export function formatManagementLabel(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "—"
  const normalized = raw.replace(/_/g, " ").trim()
  if (/champion/i.test(normalized)) return "Champion"
  if (/supportive/i.test(normalized)) return "Supportive"
  if (/neutral/i.test(normalized)) return "Neutral"
  if (/resist/i.test(normalized)) return "Resistant"
  return normalized
}
