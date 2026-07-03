"use client"

import { YAxis } from "recharts"
import { COMPOSITE_PERCENT_AXIS_TICKS, formatAxisPercentTick } from "@/lib/format-number"

const TICK_FILL = "var(--muted-foreground)"

interface CompositePercentTickProps {
  x?: number
  y?: number
  payload?: { value?: number }
}

function CompositePercentTick({ x = 0, y = 0, payload }: CompositePercentTickProps) {
  if (payload?.value == null) return null
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill={TICK_FILL} fontSize={11}>
      {formatAxisPercentTick(payload.value, 0)}
    </text>
  )
}

/** Left margin wide enough for three-digit percent ticks (e.g. 100%). */
export const COMPOSITE_SCATTER_CHART_MARGIN = {
  top: 16,
  right: 28,
  bottom: 32,
  left: 64,
} as const

interface CompositeScatterYAxisProps {
  dataKey?: string
}

export function CompositeScatterYAxis({ dataKey = "score" }: CompositeScatterYAxisProps) {
  return (
    <YAxis
      type="number"
      dataKey={dataKey}
      name="Composite"
      domain={[0, 100]}
      scale="linear"
      allowDataOverflow
      tickLine={false}
      axisLine={false}
      ticks={[...COMPOSITE_PERCENT_AXIS_TICKS]}
      tick={<CompositePercentTick />}
      width={80}
      label={{
        value: "Composite readiness (%)",
        angle: -90,
        position: "left",
        offset: 12,
        fontSize: 11,
        fill: TICK_FILL,
      }}
    />
  )
}
