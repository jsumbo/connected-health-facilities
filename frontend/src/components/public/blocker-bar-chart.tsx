"use client"

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis, ResponsiveContainer } from "recharts"
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

interface BlockerData {
  code: string
  description: string
  count: number
}

interface BlockerBarChartProps {
  data: BlockerData[]
}

// Color cycle for blockers using chart color variables
const COLOR_CYCLE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const

function getBlockerColor(index: number): string {
  return COLOR_CYCLE[index % COLOR_CYCLE.length]
}

export function BlockerBarChart({ data }: BlockerBarChartProps) {
  if (!data || data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No blockers recorded</p>
  }

  // Sort by count descending
  const sortedData = [...data].sort((a, b) => b.count - a.count)

  const chartData = sortedData.map((item, index) => ({
    label: item.code,
    count: item.count,
    description: item.description,
    fill: getBlockerColor(index),
  }))

  const chartConfig = {
    count: { label: "Facilities", color: "var(--chart-2)" },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <BarChart data={chartData} layout="vertical" margin={{ left: 150, right: 16, top: 8, bottom: 8 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} fontSize={11} />
        <YAxis
          type="category"
          dataKey="label"
          width={140}
          tickLine={false}
          axisLine={false}
          fontSize={11}
        />
        <ChartTooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length > 0) {
              const data = payload[0].payload as (typeof chartData)[0]
              return (
                <div className="rounded-lg bg-background border border-border p-3 shadow-md max-w-xs">
                  <p className="font-semibold text-sm text-foreground">{data.label}</p>
                  <p className="text-xs text-muted-foreground mb-1">{data.description}</p>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{data.count}</span> facilities
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="count" radius={[0, 3, 3, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.label} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export function BlockerBarCard({ data }: BlockerBarChartProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Blockers (facility count)</CardTitle>
      </CardHeader>
      <CardContent>
        <BlockerBarChart data={data} />
      </CardContent>
    </Card>
  )
}
