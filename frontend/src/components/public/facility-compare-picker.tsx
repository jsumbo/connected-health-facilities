"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { ProgrammeFacility } from "@/lib/types-public"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const selectClassName = cn(
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground",
  "shadow-sm outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

interface FacilityComparePickerProps {
  facilities: readonly ProgrammeFacility[]
  currentA?: string
  currentB?: string
  labelA?: string
  labelB?: string
}

export function FacilityComparePicker({
  facilities,
  currentA = "",
  currentB = "",
  labelA,
  labelB,
}: FacilityComparePickerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (key: "a" | "b", value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  const assessed = [...facilities]
    .filter((f) => f.assessment_status === "complete")
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Card className="shadow-none">
      <CardContent className="pt-5">
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="compare-facility-a"
              className="truncate text-xs font-medium text-muted-foreground"
              title={labelA}
            >
              {labelA ?? "Select first facility"}
            </label>
            <select
              id="compare-facility-a"
              value={currentA}
              onChange={(e) => handleChange("a", e.target.value)}
              className={selectClassName}
            >
              <option value="">Select facility…</option>
              {assessed.map((f) => (
                <option key={f.slug} value={f.slug} disabled={f.slug === currentB}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div
            className="hidden items-center justify-center md:flex md:h-10 md:w-10"
            aria-hidden
          >
            <span className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              vs
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="compare-facility-b"
              className="truncate text-xs font-medium text-muted-foreground"
              title={labelB}
            >
              {labelB ?? "Select second facility"}
            </label>
            <select
              id="compare-facility-b"
              value={currentB}
              onChange={(e) => handleChange("b", e.target.value)}
              className={selectClassName}
            >
              <option value="">Select facility…</option>
              {assessed.map((f) => (
                <option key={f.slug} value={f.slug} disabled={f.slug === currentA}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
