"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"
import type { ProgrammeFacility } from "@/lib/types-public"
import { blockerShortLabel } from "@/lib/blockers"
import { getBlockerCode } from "@/lib/quick-wins"
import { formatAxisIntegerTick, roundAxisMaxCeil } from "@/lib/format-number"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import { ChartNote } from "@/components/public/chart-note"
import { cn } from "@/lib/utils"

interface BlockerData {
  code: string
  description: string
  count: number
}

interface BlockerBarChartProps {
  data: BlockerData[]
  facilities?: ProgrammeFacility[]
  selectedCode?: string
  onSelectCode?: (code: string) => void
}

const COLOR_CYCLE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const

function getBlockerColor(index: number, isSelected: boolean, isDimmed: boolean): string {
  const base = COLOR_CYCLE[index % COLOR_CYCLE.length]
  if (isSelected) return base
  if (isDimmed) return "var(--muted)"
  return base
}

export function BlockerBarChart({
  data,
  facilities = [],
  selectedCode,
  onSelectCode,
}: BlockerBarChartProps) {
  const [internalSelected, setInternalSelected] = useState<string>("")
  const activeCode = selectedCode ?? internalSelected

  const handleSelect = (code: string) => {
    const next = activeCode === code ? "" : code
    if (onSelectCode) onSelectCode(next)
    else setInternalSelected(next)
  }

  const sortedData = useMemo(
    () => [...data].sort((a, b) => b.count - a.count),
    [data]
  )

  const chartData = useMemo(
    () =>
      sortedData.map((item, index) => ({
        code: item.code,
        label: blockerShortLabel(item.code, item.description),
        count: item.count,
        description: item.description,
        fill: getBlockerColor(
          index,
          activeCode === item.code,
          Boolean(activeCode && activeCode !== item.code)
        ),
        index,
      })),
    [sortedData, activeCode]
  )

  const affectedFacilities = useMemo(() => {
    if (!activeCode) return []
    return facilities.filter((f) =>
      f.blockers.some((b) => getBlockerCode(b) === activeCode)
    )
  }, [facilities, activeCode])

  if (!data || data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No blockers recorded</p>
  }

  const chartConfig = {
    count: { label: "Facilities", color: "var(--chart-2)" },
  } satisfies ChartConfig

  const maxCount = Math.max(...chartData.map((d) => d.count), 1)

  return (
    <div className="space-y-4">
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 8, right: 40, top: 8, bottom: 8 }}
          barCategoryGap="14%"
          onClick={(state) => {
            const payload = state?.activePayload?.[0]?.payload as (typeof chartData)[0] | undefined
            if (payload?.code) handleSelect(payload.code)
          }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border/60" />
          <XAxis
            type="number"
            domain={[0, roundAxisMaxCeil(maxCount * 1.15)]}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            fontSize={11}
            tickFormatter={formatAxisIntegerTick}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={140}
            tickLine={false}
            axisLine={false}
            fontSize={10}
            tick={{ fill: "var(--foreground)" }}
          />
          <ChartTooltip
            cursor={{ fill: "var(--muted)", fillOpacity: 0.35 }}
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null
              const row = payload[0].payload as (typeof chartData)[0]
              return (
                <div className="rounded-lg border border-border bg-card p-3 shadow-lg max-w-xs">
                  <p className="font-semibold text-sm text-foreground">{row.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{row.code}</p>
                  <p className="text-sm text-foreground mt-2 tabular-nums">
                    <span className="font-semibold">{row.count}</span>{" "}
                    {row.count === 1 ? "facility" : "facilities"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">Click bar to list facilities</p>
                </div>
              )
            }}
          />
          <Bar
            dataKey="count"
            radius={[0, 5, 5, 0]}
            maxBarSize={32}
            style={{ cursor: "pointer" }}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.code}
                fill={entry.fill}
                className={cn(
                  "transition-opacity duration-150",
                  activeCode && activeCode !== entry.code && "opacity-40"
                )}
              />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              className="fill-foreground text-[11px] font-semibold tabular-nums"
            />
          </Bar>
        </BarChart>
      </ChartContainer>

      {activeCode ? (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {blockerShortLabel(
                activeCode,
                sortedData.find((d) => d.code === activeCode)?.description
              )}
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">({activeCode})</span>
            </p>
            <button
              type="button"
              onClick={() => handleSelect(activeCode)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
          {affectedFacilities.length > 0 ? (
            <ul className="max-h-40 space-y-1 overflow-y-auto text-sm">
              {affectedFacilities.map((f) => (
                <li key={f.slug}>
                  <Link
                    href={`/facility/${f.slug}`}
                    className="text-primary hover:underline underline-offset-2"
                  >
                    {f.name}
                  </Link>
                  <span className="ml-2 text-xs text-muted-foreground">{f.county}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No facility list available for this blocker.</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Click a bar to see affected facilities.</p>
      )}
    </div>
  )
}

export function BlockerBarCard({
  data,
  facilities,
  note,
}: BlockerBarChartProps & { note?: string }) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Blockers (facility count)</CardTitle>
        <p className="text-xs text-muted-foreground">Click a bar to drill into facilities</p>
      </CardHeader>
      <CardContent>
        <BlockerBarChart data={data} facilities={facilities} />
        {note ? <ChartNote>{note}</ChartNote> : null}
      </CardContent>
    </Card>
  )
}
