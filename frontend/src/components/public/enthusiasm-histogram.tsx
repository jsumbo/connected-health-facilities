"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatAxisIntegerTick } from "@/lib/format-number"

interface EnthusiasmHistogramProps {
  distribution: Record<string, number>
  title?: string
}

export function EnthusiasmHistogram({
  distribution,
  title = "Enthusiasm distribution (all responses)",
}: EnthusiasmHistogramProps) {
  const data = Object.entries(distribution)
    .map(([score, count]) => ({
      score: `${score}/10`,
      count,
      sortKey: Number.parseFloat(score),
    }))
    .sort((a, b) => a.sortKey - b.sortKey)

  if (data.length === 0) return null

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">
          Facility means cluster high — this shows spread across individual responses
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="score" fontSize={11} tickLine={false} />
            <YAxis allowDecimals={false} fontSize={11} tickLine={false} width={28} tickFormatter={formatAxisIntegerTick} />
            <Tooltip />
            <Bar dataKey="count" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
