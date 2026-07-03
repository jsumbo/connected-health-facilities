"use client"

import type { ReactNode } from "react"
import { YAxis } from "recharts"
import { COMPOSITE_PERCENT_AXIS_TICKS } from "@/lib/format-number"

const MARGIN_TOP = 16
const MARGIN_BOTTOM = 32

/** Plot area margins — Y tick labels render outside the SVG in HTML. */
export const COMPOSITE_SCATTER_CHART_MARGIN = {
  top: MARGIN_TOP,
  right: 28,
  bottom: MARGIN_BOTTOM,
  left: 8,
} as const

const Y_AXIS_LABELS = [...COMPOSITE_PERCENT_AXIS_TICKS].reverse()

interface CompositeScatterChartFrameProps {
  height?: number
  children: ReactNode
}

/** HTML Y-axis labels avoid Recharts/SVG clipping (100% was rendering as 1%). */
export function CompositeScatterChartFrame({
  height = 360,
  children,
}: CompositeScatterChartFrameProps) {
  return (
    <div className="flex gap-2">
      <div
        className="flex w-12 shrink-0 flex-col items-end justify-between text-[11px] leading-none tabular-nums text-muted-foreground"
        style={{
          height,
          paddingTop: MARGIN_TOP,
          paddingBottom: MARGIN_BOTTOM,
        }}
        aria-hidden
      >
        {Y_AXIS_LABELS.map((tick) => (
          <span key={tick}>{tick}%</span>
        ))}
      </div>
      <div className="relative min-w-0 flex-1" style={{ height }}>
        <p
          className="pointer-events-none absolute top-1/2 -left-7 z-10 origin-center -translate-y-1/2 -rotate-90 whitespace-nowrap text-[11px] text-muted-foreground"
          aria-hidden
        >
          Composite readiness (%)
        </p>
        {children}
      </div>
    </div>
  )
}

/** Hidden scale axis — visible labels are rendered by CompositeScatterChartFrame. */
export function CompositeScatterYAxis({ dataKey = "score" }: { dataKey?: string }) {
  return (
    <YAxis
      type="number"
      dataKey={dataKey}
      domain={[0, 100]}
      scale="linear"
      allowDataOverflow
      hide
    />
  )
}
