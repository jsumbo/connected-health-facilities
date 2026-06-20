"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { QuestionStat } from "@/lib/types-public"

const chartConfig = {
  correctRate: { label: "Correct Rate (%)", color: "var(--chart-1)" },
} satisfies ChartConfig

interface DlaQuestionsChartProps {
  questions?: QuestionStat[]
}

export function DlaQuestionsChart({ questions = [] }: DlaQuestionsChartProps) {
  // Sort by correctRate descending (highest at top for horizontal bar)
  const sortedData = useMemo(() => {
    return [...questions]
      .sort((a, b) => (b.correctRate ?? 0) - (a.correctRate ?? 0))
      .map((q) => ({
        id: `Q${q.questionNumber}`,
        label: `Q${q.questionNumber}`,
        correctRate: Math.round(q.correctRate ?? 0),
        question: q.questionText,
      }))
  }, [questions])

  if (!sortedData || sortedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No question data available
      </div>
    )
  }

  // Find the weakest area (lowest correct rate)
  const weakestQuestion = useMemo(() => {
    if (sortedData.length === 0) return null
    return sortedData[sortedData.length - 1] // Last item (lowest rate)
  }, [sortedData])

  return (
    <div className="w-full space-y-4">
      {weakestQuestion && (
        <div className="rounded-lg border border-amber-200/50 bg-amber-50/40 p-3">
          <div className="text-xs font-medium text-amber-900 mb-1">Weakest area</div>
          <div className="text-sm font-semibold text-amber-950">
            {weakestQuestion.label}: {weakestQuestion.correctRate}% correct
          </div>
          <div className="text-xs text-amber-900 mt-1">{weakestQuestion.question}</div>
        </div>
      )}

      <ChartContainer config={chartConfig} className="h-[400px] w-full">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 80, bottom: 8 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis
            dataKey="label"
            type="category"
            width={75}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => `${value}% correct`}
                labelFormatter={() => ""}
              />
            }
          />
          <Bar
            dataKey="correctRate"
            fill="var(--color-correctRate)"
            radius={[0, 3, 3, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  )
}

export function DlaQuestionsCard({ questions = [] }: DlaQuestionsChartProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Questions (by correct rate)</CardTitle>
      </CardHeader>
      <CardContent>
        <DlaQuestionsChart questions={questions} />
      </CardContent>
    </Card>
  )
}
