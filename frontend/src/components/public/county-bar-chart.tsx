"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
import type { CountyRollup } from "@/lib/types-public"

const chartConfig = {
  assessed: { label: "Assessed", color: "var(--chart-2)" },
} satisfies ChartConfig

interface CountyBarChartProps {
  counties: CountyRollup[]
}

export function CountyBarChart({ counties }: CountyBarChartProps) {
  const data = counties.map((c) => ({
    name: c.county.length > 14 ? `${c.county.slice(0, 12)}…` : c.county,
    assessed: c.assessed,
    total: c.total,
  }))

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          angle={-32}
          textAnchor="end"
          height={64}
          fontSize={10}
        />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="assessed" fill="var(--color-assessed)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

export function CountyBarCard({ counties }: CountyBarChartProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">By county</CardTitle>
      </CardHeader>
      <CardContent>
        <CountyBarChart counties={counties} />
      </CardContent>
    </Card>
  )
}
