"use client"

import { Suspense } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FACILITY_TYPE_FILTER_OPTIONS } from "@/lib/facility-types"

const selectClassName =
  "px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal min-w-[11rem]"

function DashboardScopeBarInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentType = searchParams.get("facility_type") ?? ""

  const handleFacilityTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("facility_type", value)
    } else {
      params.delete("facility_type")
    }
    params.delete("page")
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="dashboard-facility-type" className="text-xs font-medium text-slate-500">
          Facility type
        </label>
        <select
          id="dashboard-facility-type"
          value={currentType}
          onChange={(e) => handleFacilityTypeChange(e.target.value)}
          className={selectClassName}
        >
          {FACILITY_TYPE_FILTER_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {currentType ? (
        <button
          type="button"
          onClick={() => handleFacilityTypeChange("")}
          className="mb-0.5 text-sm text-slate-500 hover:text-slate-800 underline-offset-4 hover:underline"
        >
          Clear filter
        </button>
      ) : null}
    </div>
  )
}

export function DashboardScopeBar() {
  return (
    <Suspense fallback={null}>
      <DashboardScopeBarInner />
    </Suspense>
  )
}
