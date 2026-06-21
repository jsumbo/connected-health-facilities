import { formatPercentLabel, formatPercentValue } from "@/lib/format-number"

const CHOICE_LABELS: Record<string, string> = {
  none: "None",
  grid: "Grid",
  solar: "Solar",
  generator: "Generator",
  "3g": "3G",
  "4g": "4G",
  starlink: "Starlink",
  wi_fi: "Wi‑Fi",
  wifi: "Wi‑Fi",
  ethernet: "Ethernet",
  multiple_backup_systems_specified: "Multiple backup systems",
}

function titleCaseWord(word: string): string {
  if (word.length <= 2) return word.toUpperCase()
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

function formatSingleChoiceToken(token: string): string {
  const key = token.trim().toLowerCase()
  if (CHOICE_LABELS[key]) return CHOICE_LABELS[key]
  return key.split(/\s+/).map(titleCaseWord).join(" ")
}

/** Format Kobo choice slugs for display (supports space-separated multi-select). */
export function formatFacilityChoice(value: string | null | undefined): string {
  if (value == null || value === "") return "—"
  const normalized = value.replace(/_/g, " ").trim()
  if (normalized.length > 48 && !normalized.includes(" ")) {
    return `${normalized.slice(0, 45)}…`
  }
  const parts = normalized.split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return formatSingleChoiceToken(normalized)
  return parts.map(formatSingleChoiceToken).join(" · ")
}

export function formatMbps(value: number | null | undefined): string {
  if (value == null) return "—"
  return `${value} Mbps`
}

export function formatPercent(value: number | null | undefined, decimals = 0): string {
  return formatPercentLabel(value, decimals)
}

export function formatPercentPlain(value: number | null | undefined, decimals = 0): string {
  if (value == null) return "—"
  return formatPercentValue(value, decimals)
}
