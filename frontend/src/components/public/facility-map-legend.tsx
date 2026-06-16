import { Hospital } from "lucide-react"
import { cn } from "@/lib/utils"

const LEGEND_ITEMS = [
  { label: "Tier 1 · HOS-Ready", color: "#3e8343" }, /* chart-2 green */
  { label: "Tier 2 · Deployment-Eligible", color: "#355781" }, /* chart-1 blue */
  { label: "Tier 2 · Structured Remediation", color: "#b67700" }, /* chart-3 amber */
  { label: "Tier 3 · Not Deployment-Ready", color: "#c64e31" }, /* chart-4 orange-red */
  { label: "Not assessed", color: "#8b8b8b" }, /* neutral gray */
] as const

interface FacilityMapLegendProps {
  mappedCount: number
  totalCount: number
  compact?: boolean
}

export function FacilityMapLegend({ mappedCount, totalCount, compact }: FacilityMapLegendProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-card text-xs",
        compact ? "shrink-0 px-3 py-2" : "px-4 py-3"
      )}
    >
      <span className="font-medium text-foreground">
        {mappedCount} / {totalCount} on map
      </span>
      <span className="hidden text-muted-foreground sm:inline" aria-hidden>
        |
      </span>
      {LEGEND_ITEMS.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span
            className="inline-flex size-5 shrink-0 items-center justify-center rounded border border-white bg-white shadow-sm"
            style={{ borderColor: item.color }}
          >
            <Hospital className="size-3" strokeWidth={2} style={{ color: item.color }} aria-hidden />
          </span>
          {item.label}
        </span>
      ))}
    </div>
  )
}
