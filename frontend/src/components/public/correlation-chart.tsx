"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import type { DriverCorrelation } from "@/lib/readiness-drivers"
import { correlationBarColor, correlationStrengthLabel } from "@/lib/readiness-drivers"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface CorrelationChartProps {
  data: DriverCorrelation[]
}

function formatSignedR(value: unknown): string {
  if (typeof value !== "number") return String(value ?? "")
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}`
}

export function CorrelationChart({ data }: CorrelationChartProps) {
  const chartData = useMemo(
    () =>
      [...data]
        .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
        .map((row, index) => ({
          ...row,
          rank: index + 1,
          absR: Math.abs(row.correlation),
          fill: correlationBarColor(row.correlation),
          strength: correlationStrengthLabel(row.correlation),
          label: formatSignedR(row.correlation),
        })),
    [data]
  )

  if (chartData.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Not enough assessed facilities to compute correlations.
      </p>
    )
  }

  const chartConfig = {
    absR: { label: "|r|", color: "var(--chart-1)" },
  } satisfies ChartConfig

  const maxR = Math.max(...chartData.map((d) => d.absR), 0.75)
  const xMax = Math.min(1, Math.ceil(maxR * 10) / 10 + 0.05)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-[#1e4d7b]" />
            Strong (≥0.6)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-[#0d9488]" />
            Moderate (≥0.35)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-[#d97706]" />
            Weak (≥0.15)
          </span>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">
          n = {chartData[0]?.sampleSize ?? "—"} facilities
        </p>
      </div>

      <ChartContainer config={chartConfig} className="h-[380px] w-full">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 56, left: 4, bottom: 8 }}
          barCategoryGap="16%"
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/60" />
          <ReferenceArea x1={0} x2={0.15} fill="#f1f5f9" fillOpacity={0.5} />
          <ReferenceArea x1={0.15} x2={0.35} fill="#fef3c7" fillOpacity={0.35} />
          <ReferenceArea x1={0.35} x2={0.6} fill="#ccfbf1" fillOpacity={0.35} />
          <ReferenceArea x1={0.6} x2={xMax} fill="#dbeafe" fillOpacity={0.4} />
          <XAxis
            type="number"
            domain={[0, xMax]}
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tickFormatter={(v) => `${v}`}
          />
          <YAxis
            dataKey="factor"
            type="category"
            width={112}
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tick={{ fill: "var(--foreground)" }}
          />
          <ReferenceLine
            x={0.35}
            stroke="#64748b"
            strokeDasharray="4 4"
            label={{ value: "Moderate", position: "top", fontSize: 10, fill: "#64748b" }}
          />
          <ReferenceLine
            x={0.6}
            stroke="#1e4d7b"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
            label={{ value: "Strong", position: "top", fontSize: 10, fill: "#1e4d7b" }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, _name, item) => {
                  const row = item.payload as (typeof chartData)[0]
                  return [
                    `${formatSignedR(row.correlation)} (${row.strength}) · n=${row.sampleSize}`,
                    row.factor,
                  ]
                }}
              />
            }
          />
          <Bar dataKey="absR" radius={[0, 5, 5, 0]} maxBarSize={32}>
            {chartData.map((entry) => (
              <Cell key={entry.key} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="label"
              position="right"
              className="fill-foreground text-[11px] font-semibold tabular-nums"
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  )
}
