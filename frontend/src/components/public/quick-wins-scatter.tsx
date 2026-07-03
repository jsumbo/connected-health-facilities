"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"
import type { ProgrammeFacility } from "@/lib/types-public"
import {
  buildScatterPoints,
  SCATTER_TIER_COLORS,
  SCATTER_TIER_LABELS,
  type ScatterTierCategory,
} from "@/lib/scatter-tier"
import { QUICK_WINS_CHART_INTRO } from "@/lib/quick-wins"
import { formatAxisIntegerTick, formatAxisPercentTick, formatPercentLabel, roundToDecimals } from "@/lib/format-number"
import { ChartNote } from "@/components/public/chart-note"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface QuickWinsScatterProps {
  facilities: ProgrammeFacility[]
  note?: string
}

const CATEGORIES: ScatterTierCategory[] = ["tier1", "tier2", "tier3"]

function jitterFromSlug(slug: string): number {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 1000
  }
  return (hash / 1000 - 0.5) * 0.28
}

export function QuickWinsScatter({ facilities, note }: QuickWinsScatterProps) {
  const [hiddenCategories, setHiddenCategories] = useState<Set<ScatterTierCategory>>(new Set())

  const points = useMemo(() => {
    return buildScatterPoints(facilities).map((p) => ({
      ...p,
      displayBlockers: p.blockers + jitterFromSlug(p.slug),
    }))
  }, [facilities])

  const visiblePoints = useMemo(
    () => points.filter((p) => !hiddenCategories.has(p.category)),
    [points, hiddenCategories]
  )

  const handleToggleCategory = (category: ScatterTierCategory) => {
    setHiddenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  if (points.length === 0) return null

  const maxBlockers = Math.max(...points.map((p) => p.blockers), 3)
  const scoreMin = Math.min(...points.map((p) => p.score))
  const scoreMax = Math.max(...points.map((p) => p.score))
  const yDomainMin = Math.max(0, Math.floor(Math.min(scoreMin, 30) / 10) * 10)
  const yDomainMax = Math.min(100, Math.ceil(Math.max(scoreMax, 90) / 10) * 10)
  const yTicks = Array.from(
    { length: Math.floor((yDomainMax - yDomainMin) / 10) + 1 },
    (_, i) => yDomainMin + i * 10
  )

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Composite vs blockers</CardTitle>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{QUICK_WINS_CHART_INTRO}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-b border-border pb-4 text-xs">
          {CATEGORIES.map((category) => {
            const isHidden = hiddenCategories.has(category)
            const count = points.filter((p) => p.category === category).length
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleToggleCategory(category)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors",
                  isHidden ? "opacity-40 line-through" : "hover:bg-muted/60"
                )}
                aria-pressed={!isHidden}
              >
                <span
                  className="inline-block size-2.5 rounded-full ring-1 ring-white"
                  style={{ backgroundColor: SCATTER_TIER_COLORS[category] }}
                />
                {SCATTER_TIER_LABELS[category]}
                <span className="tabular-nums text-muted-foreground">({count})</span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-muted-foreground">
          Weighted DRF composite (0–100%) vs deployment blockers · hover a point for facility details
        </p>
        <ResponsiveContainer width="100%" height={360}>
          <ScatterChart margin={{ top: 16, right: 28, bottom: 32, left: 20 }}>
            <ReferenceArea y1={75} y2={90} fill="#f54343" fillOpacity={0.06} />
            <ReferenceArea y1={30} y2={75} fill="#0f0f0f" fillOpacity={0.06} />
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              type="number"
              dataKey="displayBlockers"
              name="Blockers"
              allowDecimals={false}
              domain={[-0.2, maxBlockers + 0.5]}
              tickLine={false}
              axisLine={false}
              tickCount={maxBlockers + 2}
              tickFormatter={(v) =>
                Number.isInteger(roundToDecimals(v, 0)) ? formatAxisIntegerTick(v) : ""
              }
              label={{
                value: "Deployment blockers",
                position: "insideBottom",
                offset: -16,
                fontSize: 11,
                fill: "var(--muted-foreground)",
              }}
              fontSize={11}
            />
            <YAxis
              type="number"
              dataKey="score"
              name="Composite"
              domain={[yDomainMin, yDomainMax]}
              allowDataOverflow
              tickLine={false}
              axisLine={false}
              ticks={yTicks}
              tickFormatter={(v) => formatAxisPercentTick(v, 0)}
              label={{
                value: "Composite readiness (%)",
                angle: -90,
                position: "insideLeft",
                offset: 4,
                fontSize: 11,
                fill: "var(--muted-foreground)",
              }}
              fontSize={11}
              width={44}
            />
            <ZAxis range={[72, 72]} />
            <ReferenceLine
              y={75}
              stroke="#f54343"
              strokeDasharray="4 4"
              strokeOpacity={0.75}
              label={{ value: "T1 · 75%", position: "insideTopRight", fontSize: 10, fill: "#f54343" }}
            />
            <ReferenceLine
              y={55}
              stroke="#0f0f0f"
              strokeDasharray="4 4"
              strokeOpacity={0.75}
              label={{ value: "T2 · 55%", position: "insideTopRight", fontSize: 10, fill: "#0f0f0f" }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null
                const d = payload[0].payload as (typeof points)[0]
                return (
                  <div className="rounded-lg border border-border bg-card p-3 text-xs shadow-lg">
                    <p className="font-semibold text-foreground">{d.name}</p>
                    <p className="text-muted-foreground">{d.county}</p>
                    <p className="mt-1 tabular-nums">
                      {formatPercentLabel(d.score, 0)} composite · {d.blockers} blocker{d.blockers === 1 ? "" : "s"}
                    </p>
                    <p className="mt-0.5 text-muted-foreground">{SCATTER_TIER_LABELS[d.category]}</p>
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
            {CATEGORIES.filter((c) => !hiddenCategories.has(c)).map((category) => (
              <Scatter
                key={category}
                name={SCATTER_TIER_LABELS[category]}
                legendType="none"
                data={visiblePoints.filter((p) => p.category === category)}
                fill={SCATTER_TIER_COLORS[category]}
                fillOpacity={0.9}
                stroke="#fff"
                strokeWidth={1}
                style={{ cursor: "pointer" }}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>

        {note ? <ChartNote>{note}</ChartNote> : null}
      </CardContent>
    </Card>
  )
}
