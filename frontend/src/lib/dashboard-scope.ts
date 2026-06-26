import { facilityTypeLabel } from "@/lib/facility-types"

export interface DashboardScopeParams {
  facility_type?: string
}

export function parseDashboardScope(params: DashboardScopeParams) {
  const facilityType = params.facility_type?.trim() || undefined
  return {
    facilityType,
    facilityTypeQuery: facilityType ? { facility_type: facilityType } : {},
    facilityTypeLabel: facilityType ? facilityTypeLabel(facilityType) : null,
  }
}
