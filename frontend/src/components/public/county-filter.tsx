"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

const selectClassName = cn(
  "h-9 min-w-[11rem] rounded-lg border border-input bg-card px-3 text-sm text-foreground",
  "shadow-sm outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

interface CountyFilterProps {
  counties: readonly string[]
  currentCounty?: string
  paramKey?: string
}

export function CountyFilter({
  counties,
  currentCounty = "",
  paramKey = "county",
}: CountyFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(paramKey, value)
    } else {
      params.delete(paramKey)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="county-filter" className="text-xs font-medium text-muted-foreground">
          County
        </label>
        <select
          id="county-filter"
          value={currentCounty}
          onChange={(e) => handleChange(e.target.value)}
          className={selectClassName}
        >
          <option value="">All counties</option>
          {counties.map((county) => (
            <option key={county} value={county}>
              {county}
            </option>
          ))}
        </select>
      </div>

      {currentCounty ? (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="mb-0.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Clear filter
        </button>
      ) : null}
    </div>
  )
}
