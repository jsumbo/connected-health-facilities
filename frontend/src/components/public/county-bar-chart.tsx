"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { CountyRollup } from "@/lib/types-public"
import { formatAxisIntegerTick } from "@/lib/format-number"

const chartConfig = {
  assessed: { label: "Assessed", color: "var(--chart-2)" },
} satisfies ChartConfig

interface CountyBarChartProps {
  counties: CountyRollup[]
  onCountyClick?: (county: string) => void
  selectedCounty?: string
}

export function CountyBarChart({ counties, onCountyClick, selectedCounty }: CountyBarChartProps) {
  const data = counties.map((c) => ({
    county: c.county,
    name: c.county.length > 14 ? `${c.county.slice(0, 12)}…` : c.county,
    assessed: c.assessed,
    total: c.total,
  }))

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        onClick={(state) => {
          if (state.activeLabel && onCountyClick) {
            const county = data.find((d) => d.name === state.activeLabel)?.county
            if (county) onCountyClick(county)
          }
        }}
      >
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
          style={{ cursor: onCountyClick ? "pointer" : "default" }}
        />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} fontSize={11} tickFormatter={formatAxisIntegerTick} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="assessed"
          fill="var(--color-assessed)"
          radius={[3, 3, 0, 0]}
          style={{ cursor: onCountyClick ? "pointer" : "default" }}
        />
      </BarChart>
    </ChartContainer>
  )
}

export function CountyBarCard({
  counties,
  onCountyClick,
  selectedCounty,
}: CountyBarChartProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base">By county</CardTitle>
        {selectedCounty && onCountyClick && (
          <button
            onClick={() => onCountyClick("")}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear selection
          </button>
        )}
      </CardHeader>
      <CardContent>
        {selectedCounty && (
          <p className="text-xs text-muted-foreground mb-2">
            Filtered by: <span className="font-semibold text-foreground">{selectedCounty}</span>
          </p>
        )}
        <CountyBarChart counties={counties} onCountyClick={onCountyClick} selectedCounty={selectedCounty} />
        {onCountyClick && (
          <p className="text-xs text-muted-foreground mt-2">💡 Click a county to filter</p>
        )}
      </CardContent>
    </Card>
  )
}
