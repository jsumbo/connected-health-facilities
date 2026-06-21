"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

interface CorrelationChartProps {
  data: Array<{ factor: string; correlation: number }>
}

export function CorrelationChart({ data }: CorrelationChartProps) {
  if (!data || data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No correlation data available</p>
  }

  const sorted = [...data].sort((a, b) => b.correlation - a.correlation)
  const chartConfig = { correlation: { label: "Correlation (r)", color: "var(--chart-1)" } } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" domain={[-1, 1]} />
          <YAxis dataKey="factor" type="category" width={140} tick={{ fontSize: 11 }} />
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => typeof value === "number" ? [value.toFixed(2), "Correlation"] : [value, ""]} />} />
          <Bar dataKey="correlation" fill="var(--chart-1)" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
