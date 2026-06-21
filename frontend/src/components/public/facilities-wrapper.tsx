"use client"

import { useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { ProgrammeFacility } from "@/lib/types-public"
import { FacilitiesTableClient } from "@/components/public/facilities-table-client"
import { ActiveFilterChips } from "@/components/public/active-filter-chips"
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

    return filtered
  }, [facilities, county, tier, cluster])

  const handleClearAll = () => router.push(pathname)

  return (
    <Card className="shadow-none">
      <CardContent className="pt-6">
        <ActiveFilterChips
          county={county || undefined}
          tier={tier || undefined}
          cluster={cluster || undefined}
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
          onClearAll={handleClearAll}
        />
        <FacilitiesTableClient facilities={filteredFacilities} />
      </CardContent>
    </Card>
  )
}
