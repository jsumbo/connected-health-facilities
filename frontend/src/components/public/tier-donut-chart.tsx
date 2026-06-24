"use client"

import { Cell, Label, Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { ChartNote } from "@/components/public/chart-note"
import { TIER_CHART_COLORS } from "./readiness-tier-styles"

interface TierDonutChartProps {
  tierCounts: Record<string, number>
  onTierClick?: (tier: string) => void
  selectedTier?: string
}

export function TierDonutChart({ tierCounts, onTierClick, selectedTier }: TierDonutChartProps) {
  const data = Object.entries(tierCounts)
    .filter(([, count]) => count > 0)
    .map(([tier, count]) => ({
      tier,
      tierDisplay: tier.replace(" — ", " · "),
      count,
      fill: TIER_CHART_COLORS[tier] ?? "var(--chart-5)",
    }))

  const chartConfig = data.reduce<ChartConfig>((acc, row, i) => {
    acc[`tier${i}`] = { label: row.tierDisplay, color: row.fill }
    return acc
  }, { count: { label: "Facilities" } })

  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">No tier data</p>
    )
  }

  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px]">
      <PieChart
        onClick={(state) => {
          if (typeof state.activeTooltipIndex === "number" && onTierClick) {
            const tier = data[state.activeTooltipIndex]?.tier
            if (tier) onTierClick(tier)
          }
        }}
      >
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={data}
          dataKey="count"
          nameKey="tierDisplay"
          innerRadius={58}
          outerRadius={88}
          strokeWidth={2}
          stroke="var(--card)"
          style={{ cursor: onTierClick ? "pointer" : "default" }}
        >
          {data.map((entry) => (
            <Cell key={entry.tier} fill={entry.fill} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-2xl font-semibold font-sans"
                    >
                      {total}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 18}
                      className="fill-muted-foreground text-xs"
                    >
                      facilities
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

export function TierDonutCard({
  tierCounts,
  onTierClick,
  selectedTier,
  note,
}: TierDonutChartProps & { note?: string }) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Tiers</CardTitle>
        {selectedTier && onTierClick && (
          <button
            onClick={() => onTierClick("")}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </CardHeader>
      <CardContent>
        {selectedTier && (
          <p className="text-xs text-muted-foreground mb-2">
            Filtered by: <span className="font-semibold text-foreground">{selectedTier.replace(" — ", " · ")}</span>
          </p>
        )}
        <TierDonutChart
          tierCounts={tierCounts}
          onTierClick={onTierClick}
          selectedTier={selectedTier}
        />
        {onTierClick ? (
          <p className="text-xs text-muted-foreground mt-2">Click a tier segment to filter this page.</p>
        ) : null}
        {note ? <ChartNote>{note}</ChartNote> : null}
      </CardContent>
    </Card>
  )
}
