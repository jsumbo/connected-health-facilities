"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"
import type { ProgrammeFacility } from "@/lib/types-public"
import {
  buildDlaScatterPoints,
  linearRegression,
  pearsonCorrelation,
} from "@/lib/readiness-drivers"
import { SCATTER_TIER_LABELS } from "@/lib/scatter-tier"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DlaReadinessScatterProps {
  facilities: ProgrammeFacility[]
}

const TIER_LEGEND: Array<{ key: string; label: string; color: string }> = [
  { key: "T1", label: SCATTER_TIER_LABELS.tier1, color: "#3e8343" },
  { key: "T2", label: SCATTER_TIER_LABELS.tier2, color: "#355781" },
  { key: "T2R", label: SCATTER_TIER_LABELS.remediation, color: "#b67700" },
  { key: "T3", label: SCATTER_TIER_LABELS.tier3, color: "#c64e31" },
]

export function DlaReadinessScatter({ facilities }: DlaReadinessScatterProps) {
  const points = useMemo(() => buildDlaScatterPoints(facilities), [facilities])

  const correlation = useMemo(() => {
    if (points.length < 3) return null
    return pearsonCorrelation(
      points.map((p) => p.dla),
      points.map((p) => p.composite)
    )
  }, [points])

  const trendLine = useMemo(() => {
    if (points.length < 2) return null
    const fit = linearRegression(points.map((p) => ({ x: p.dla, y: p.composite })))
    if (!fit) return null
    const xMin = Math.min(...points.map((p) => p.dla))
    const xMax = Math.max(...points.map((p) => p.dla))
    return [
      { dla: xMin, composite: fit.slope * xMin + fit.intercept },
      { dla: xMax, composite: fit.slope * xMax + fit.intercept },
    ]
  }, [points])

  const tierGroups = useMemo(() => {
    const groups = new Map<string, typeof points>()
    for (const point of points) {
      const key = point.tierKey
      const list = groups.get(key) ?? []
      list.push(point)
      groups.set(key, list)
    }
    return [...groups.entries()].sort(
      (a, b) =>
        TIER_LEGEND.findIndex((t) => t.key === a[0]) -
        TIER_LEGEND.findIndex((t) => t.key === b[0])
    )
  }, [points])

  if (points.length === 0) return null

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">DLA vs composite</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Each point is a facility — higher DLA and composite = upper-right
            </p>
          </div>
          {correlation != null ? (
            <div className="rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs tabular-nums">
              <span className="text-muted-foreground">Correlation</span>{" "}
              <span className="font-semibold text-foreground">{correlation.toFixed(2)}</span>
              <span className="ml-2 text-muted-foreground">· {points.length} facilities</span>
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart margin={{ top: 16, right: 28, bottom: 32, left: 16 }}>
            <ReferenceArea y1={75} y2={95} fill="#3e8343" fillOpacity={0.06} />
            <ReferenceArea y1={55} y2={75} fill="#355781" fillOpacity={0.06} />
            <ReferenceArea y1={25} y2={55} fill="#b67700" fillOpacity={0.05} />
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              type="number"
              dataKey="dla"
              name="DLA"
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickCount={6}
              label={{
                value: "DLA avg score (%)",
                position: "insideBottom",
                offset: -16,
                fontSize: 11,
                fill: "var(--muted-foreground)",
              }}
            />
            <YAxis
              type="number"
              dataKey="composite"
              name="Composite"
              domain={[25, 95]}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickCount={8}
              label={{
                value: "Composite readiness (%)",
                angle: -90,
                position: "insideLeft",
                offset: 4,
                fontSize: 11,
                fill: "var(--muted-foreground)",
              }}
            />
            <ZAxis range={[64, 64]} />
            <ReferenceLine
              y={75}
              stroke="#3e8343"
              strokeDasharray="5 5"
              strokeOpacity={0.75}
              label={{ value: "T1 · 75%", position: "insideTopRight", fontSize: 10, fill: "#3e8343" }}
            />
            <ReferenceLine
              y={55}
              stroke="#355781"
              strokeDasharray="5 5"
              strokeOpacity={0.75}
              label={{ value: "T2 · 55%", position: "insideTopRight", fontSize: 10, fill: "#355781" }}
            />
            {trendLine ? (
              <Line
                data={trendLine}
                dataKey="composite"
                stroke="#475569"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                isAnimationActive={false}
                legendType="none"
              />
            ) : null}
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null
                const d = payload[0].payload as (typeof points)[0]
                const tierLabel =
                  TIER_LEGEND.find((t) => t.key === d.tierKey)?.label ??
                  SCATTER_TIER_LABELS[d.tierCategory]
                return (
                  <div className="rounded-lg border border-border bg-card p-3 text-xs shadow-lg">
                    <p className="font-semibold text-foreground">{d.name}</p>
                    <p className="text-muted-foreground">{d.county}</p>
                    <p className="mt-1 tabular-nums">
                      DLA <span className="font-medium text-foreground">{d.dla}%</span>
                      {" · "}
                      Composite{" "}
                      <span className="font-medium text-foreground">{d.composite}%</span>
                    </p>
                    <p className="mt-0.5 text-muted-foreground">{tierLabel}</p>
                    <Link
                      href={`/facility/${d.slug}`}
                      className="mt-2 inline-block font-medium text-primary hover:underline"
                    >
                      Open facility →
                    </Link>
                  </div>
                )
              }}
            />
            {tierGroups.map(([label, group]) => (
              <Scatter
                key={label}
                name={label}
                data={group}
                fill={group[0]?.color ?? "#94a3b8"}
                fillOpacity={0.9}
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {TIER_LEGEND.filter((t) => tierGroups.some(([k]) => k === t.key)).map((tier) => (
            <span key={tier.key} className="flex items-center gap-1.5">
              <span
                className="inline-block size-2.5 rounded-full ring-1 ring-white"
                style={{ backgroundColor: tier.color }}
              />
              {tier.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-slate-500" />
            Trend line
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
