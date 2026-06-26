"use client"

import { BLOCKER_SHORT_LABELS } from "@/lib/blockers"

export function BlockerKeyLegend() {
  const codes = Object.entries(BLOCKER_SHORT_LABELS).sort((a, b) => a[0].localeCompare(b[0]))

  return (
    <div className="rounded-md border border-border bg-muted/30 p-4 mb-4">
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Blocker Reference</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-3 lg:grid-cols-4">
        {codes.map(([code, label]) => (
          <div key={code} className="text-sm">
            <span className="font-medium text-foreground">{code}:</span>{" "}
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
