"use client"

import { useEffect, useState } from "react"
import { GlobalSearch } from "@/components/public/global-search"
import { getPublicFacilities } from "@/lib/public-api"
import type { ProgrammeFacility } from "@/lib/types-public"

interface GlobalSearchLoaderProps {
  facilities?: ProgrammeFacility[]
}

export function GlobalSearchLoader({ facilities: initial }: GlobalSearchLoaderProps) {
  const [facilities, setFacilities] = useState<ProgrammeFacility[]>(initial ?? [])

  useEffect(() => {
    if (initial && initial.length > 0) return
    getPublicFacilities()
      .then((page) => setFacilities(page.items))
      .catch(() => {
        /* search unavailable offline */
      })
  }, [initial])

  if (facilities.length === 0) return null
  return <GlobalSearch facilities={facilities} />
}
