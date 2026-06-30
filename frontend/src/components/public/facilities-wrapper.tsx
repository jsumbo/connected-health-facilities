"use client"

import { useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { ProgrammeFacility } from "@/lib/types-public"
import { normalizeFacilityType } from "@/lib/facility-types"
import { FacilitiesTableClient } from "@/components/public/facilities-table-client"
import { ActiveFilterChips } from "@/components/public/active-filter-chips"
import { ChartNote } from "@/components/public/chart-note"
import { buildFacilitiesTableNote } from "@/lib/dashboard-notes"
import { Card, CardContent } from "@/components/ui/card"

interface FacilitiesWrapperProps {
  facilities: ProgrammeFacility[]
}

export function FacilitiesWrapper({ facilities }: FacilitiesWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const county = searchParams.get("county") || ""
  const tier = searchParams.get("tier") || ""
  const cluster = searchParams.get("cluster") || ""
  const facilityType = searchParams.get("facility_type") || ""

  const filteredFacilities = useMemo(() => {
    let filtered = facilities

    if (county) {
      filtered = filtered.filter((f) => f.county === county)
    }

    if (tier) {
      filtered = filtered.filter((f) => f.tier === tier)
    }

    if (cluster) {
      filtered = filtered.filter((f) => f.cluster === cluster)
    }

    if (facilityType) {
      filtered = filtered.filter((f) => normalizeFacilityType(f.facility_type) === normalizeFacilityType(facilityType))
    }

    return filtered
  }, [facilities, county, tier, cluster, facilityType])

  const handleClearAll = () => router.push(pathname)

  return (
    <Card className="shadow-none">
      <CardContent className="pt-6">
        <ActiveFilterChips
          county={county || undefined}
          tier={tier || undefined}
          cluster={cluster || undefined}
          facilityType={facilityType || undefined}
          onClearCounty={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.delete("county")
            const q = params.toString()
            router.push(q ? `${pathname}?${q}` : pathname)
          }}
          onClearTier={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.delete("tier")
            const q = params.toString()
            router.push(q ? `${pathname}?${q}` : pathname)
          }}
          onClearCluster={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.delete("cluster")
            const q = params.toString()
            router.push(q ? `${pathname}?${q}` : pathname)
          }}
          onClearFacilityType={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.delete("facility_type")
            const q = params.toString()
            router.push(q ? `${pathname}?${q}` : pathname)
          }}
          onClearAll={handleClearAll}
        />
        <FacilitiesTableClient facilities={filteredFacilities} />
        <ChartNote>
          {buildFacilitiesTableNote(
            filteredFacilities.length,
            Boolean(county || tier || cluster || facilityType)
          )}
        </ChartNote>
      </CardContent>
    </Card>
  )
}
