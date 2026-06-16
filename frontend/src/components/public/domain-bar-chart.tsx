"use client"

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface DomainBarChartProps {
  domainAverages: Record<string, number | null>
  title?: string
  description?: string
  maxScore?: number
}

function scoreColor(score: number, maxScore: number): string {
  if (maxScore <= 3) {
    if (score >= 2.5) return "var(--chart-2)"
    if (score >= 1.5) return "var(--chart-1)"
    if (score >= 0.5) return "var(--chart-3)"
    return "var(--chart-4)"
  }
  if (score >= 75) return "var(--chart-1)"
  if (score >= 55) return "var(--chart-2)"
  if (score >= 35) return "var(--chart-3)"
  return "var(--chart-4)"
}

export function DomainBarChart({
  domainAverages,
  title = "Domains",
  description,
  maxScore = 100,
}: DomainBarChartProps) {
  const data = Object.entries(domainAverages)
    .filter(([, v]) => v != null)
    .map(([name, score]) => ({
      name: name.length > 22 ? `${name.slice(0, 20)}…` : name,
      score: score as number,
      fill: scoreColor(score as number, maxScore),
    }))
    .sort((a, b) => b.score - a.score)

  const scoreLabel = maxScore <= 3 ? "Score (0–3)" : "Score %"
  const chartConfig = {
    score: { label: scoreLabel, color: "var(--chart-2)" },
  } satisfies ChartConfig

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No domain data</p>
  }

  return (
    <ChartContainer config={chartConfig} className="h-[320px] w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, maxScore]} tickLine={false} axisLine={false} fontSize={11} />
        <YAxis
          type="category"
          dataKey="name"
          width={128}
          tickLine={false}
          axisLine={false}
          fontSize={10}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="score" radius={[0, 3, 3, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export function DomainBarCard(props: DomainBarChartProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{props.title ?? "Domains"}</CardTitle>
        {props.description ? <CardDescription>{props.description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <DomainBarChart {...props} />
      </CardContent>
    </Card>
  )
}
