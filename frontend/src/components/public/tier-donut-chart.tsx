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
import { TIER_CHART_COLORS } from "./readiness-tier-styles"

interface TierDonutChartProps {
  tierCounts: Record<string, number>
}

export function TierDonutChart({ tierCounts }: TierDonutChartProps) {
  const data = Object.entries(tierCounts)
    .filter(([, count]) => count > 0)
    .map(([tier, count]) => ({
      tier: tier.replace(" — ", " · "),
      count,
      fill: TIER_CHART_COLORS[tier] ?? "var(--chart-5)",
    }))

  const chartConfig = data.reduce<ChartConfig>((acc, row, i) => {
    acc[`tier${i}`] = { label: row.tier, color: row.fill }
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
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={data}
          dataKey="count"
          nameKey="tier"
          innerRadius={58}
          outerRadius={88}
          strokeWidth={2}
          stroke="var(--card)"
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

export function TierDonutCard({ tierCounts }: TierDonutChartProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Tiers</CardTitle>
      </CardHeader>
      <CardContent>
        <TierDonutChart tierCounts={tierCounts} />
      </CardContent>
    </Card>
  )
}
