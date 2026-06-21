"use client"

import { useState } from "react"
import type { FacilityDlaSummary, QuestionStat } from "@/lib/types-public"
import { DlaTable } from "@/components/public/dla-table"
import { DlaQuestionsCard } from "@/components/public/dla-questions-chart"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type DlaView = "by-facility" | "by-question"

interface DlaTableRow extends FacilityDlaSummary {
  facility_name: string
  county: string
  district: string | null
}

interface DlaResultsProps {
  rows: DlaTableRow[]
  questionStats: QuestionStat[]
}

const VIEWS: { value: DlaView; label: string }[] = [
  { value: "by-facility", label: "By facility" },
  { value: "by-question", label: "By question" },
]

export function DlaResults({ rows, questionStats }: DlaResultsProps) {
  const [view, setView] = useState<DlaView>("by-facility")

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="DLA view">
        {VIEWS.map((option) => {
          const isActive = view === option.value
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setView(option.value)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {view === "by-facility" ? (
        <Card className="shadow-none">
          <CardContent className="pt-6">
            <DlaTable rows={rows} />
          </CardContent>
        </Card>
      ) : questionStats.length > 0 ? (
        <DlaQuestionsCard questions={questionStats} />
      ) : (
        <Card className="shadow-none">
          <CardContent className="py-12 text-center text-muted-foreground">
            Question data not available yet
          </CardContent>
        </Card>
      )}
    </div>
  )
}
