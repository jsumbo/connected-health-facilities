/** Format Kobo choice slugs for display (e.g. `low___stable__80ms` → readable). */
export function formatFacilityChoice(value: string | null | undefined): string {
  if (value == null || value === "") return "—"
  return value.replace(/_/g, " ")
}

export function formatMbps(value: number | null | undefined): string {
  if (value == null) return "—"
  return `${value} Mbps`
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "—"
  return `${value}%`
}
