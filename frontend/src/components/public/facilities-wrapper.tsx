"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import type { ProgrammeFacility } from "@/lib/types-public"
import { FacilityDataTable } from "./facility-data-table"
import { Card, CardContent } from "@/components/ui/card"

interface FacilitiesWrapperProps {
  facilities: ProgrammeFacility[]
}

export function FacilitiesWrapper({ facilities }: FacilitiesWrapperProps) {
  const searchParams = useSearchParams()
  const county = searchParams.get("county") || ""
  const tier = searchParams.get("tier") || ""

  const filteredFacilities = useMemo(() => {
    let filtered = facilities

    if (county) {
      filtered = filtered.filter((f) => f.county === county)
    }

    if (tier) {
      filtered = filtered.filter((f) => f.tier === tier)
    }

    return filtered
  }, [facilities, county, tier])

  return (
    <Card className="shadow-none">
      <CardContent className="pt-6">
        <FacilityDataTable facilities={filteredFacilities} />
      </CardContent>
    </Card>
  )
}
