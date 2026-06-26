export const FACILITY_TYPE_FILTER_OPTIONS = [
  { value: "", label: "All facility types" },
  { value: "hospital", label: "Hospital" },
  { value: "health_centre", label: "Health Centre" },
] as const

export type FacilityTypeFilter = (typeof FACILITY_TYPE_FILTER_OPTIONS)[number]["value"]

export function normalizeFacilityType(value: string | null | undefined): string {
  if (!value) return ""
  return value
    .trim()
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace("health_center", "health_centre")
}

export function matchesFacilityType(
  facilityType: string | null | undefined,
  filter: string | undefined
): boolean {
  if (!filter) return true
  return normalizeFacilityType(facilityType) === normalizeFacilityType(filter)
}

export function facilityTypeLabel(value: string): string {
  const match = FACILITY_TYPE_FILTER_OPTIONS.find(
    (opt) => opt.value && normalizeFacilityType(opt.value) === normalizeFacilityType(value)
  )
  return match?.label ?? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}
