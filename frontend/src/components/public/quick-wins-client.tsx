"use client"

import { useState } from "react"
import type { ProgrammeFacility } from "@/lib/types-public"
import { filterQuickWins, countQuickWins } from "@/lib/quick-wins"
import { QuickWinsScatter } from "@/components/public/quick-wins-scatter"
import { QuickWinsQueueTable } from "@/components/public/quick-wins-queue-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type QuickWinMode = "expanded" | "classic"

interface QuickWinsClientProps {
  facilities: ProgrammeFacility[]
}

const VIEW_OPTIONS: { value: QuickWinMode; label: string }[] = [
  { value: "expanded", label: "Rollout priority · ≥65%" },
  { value: "classic", label: "All 1-blocker" },
]

export function QuickWinsClient({ facilities }: QuickWinsClientProps) {
  const [mode, setMode] = useState<QuickWinMode>("expanded")
  const activeCount = countQuickWins(facilities, mode)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Quick win view">
        {VIEW_OPTIONS.map((option) => {
          const count = countQuickWins(facilities, option.value)
          const isActive = mode === option.value
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setMode(option.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              {option.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <QuickWinsScatter facilities={facilities} />

      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Ranked queue
            <span className="ml-2 font-normal text-muted-foreground">({activeCount})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuickWinsQueueTable facilities={facilities} mode={mode} />
        </CardContent>
      </Card>
    </div>
  )
}
