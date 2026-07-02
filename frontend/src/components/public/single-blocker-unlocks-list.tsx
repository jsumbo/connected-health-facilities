"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import type { BlockerSummary, ProgrammeFacility } from "@/lib/types-public"
import {
  blockerDisplayLabel,
  facilitiesWithBlocker,
  singleBlockerUnlockFacilities,
  unlockCountForBlocker,
} from "@/lib/blockers"
import { formatPercentLabel } from "@/lib/format-number"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SingleBlockerUnlocksListProps {
  register: BlockerSummary[]
  facilities: ProgrammeFacility[]
}

export function SingleBlockerUnlocksList({
  register,
  facilities,
}: SingleBlockerUnlocksListProps) {
  const [expandedCode, setExpandedCode] = useState<string | null>(null)

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1))
    if (!hash || !register.some((blocker) => blocker.code === hash)) return
    setExpandedCode(hash)
  }, [register])

  const handleToggle = (code: string) => {
    setExpandedCode((current) => (current === code ? null : code))
  }

  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold">Single-blocker unlocks</h2>
      <p className="text-sm text-muted-foreground">
        Tier 3 facilities with exactly one blocker — clearing that item moves them out of the
        blocked set. Click a row to see affected facilities.
      </p>
      {register.map((blocker) => {
        const unlockCount = unlockCountForBlocker(facilities, blocker.code)
        const affected = facilitiesWithBlocker(facilities, blocker.code)
        const unlockSlugs = new Set(
          singleBlockerUnlockFacilities(facilities, blocker.code).map((facility) => facility.slug)
        )
        const isExpanded = expandedCode === blocker.code
        const label = blockerDisplayLabel(blocker.code, blocker.description)

        return (
          <Card
            key={blocker.code}
            id={blocker.code}
            className={cn("scroll-mt-24 shadow-none", isExpanded && "ring-1 ring-primary/20")}
          >
            <button
              type="button"
              onClick={() => handleToggle(blocker.code)}
              aria-expanded={isExpanded}
              aria-controls={`blocker-facilities-${blocker.code}`}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left outline-none transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            >
              <div className="min-w-0">
                <p className="font-semibold">{label}</p>
                <p className="text-sm text-muted-foreground">
                  {blocker.count} {blocker.count === 1 ? "facility" : "facilities"} ·{" "}
                  {unlockCount} single-blocker unlock{unlockCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <p className="text-2xl font-bold tabular-nums text-emerald-600">{unlockCount}</p>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    isExpanded && "rotate-180"
                  )}
                  aria-hidden
                />
              </div>
            </button>
            {isExpanded ? (
              <CardContent
                id={`blocker-facilities-${blocker.code}`}
                className="border-t border-border pt-0 pb-4"
              >
                {affected.length === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground">No facilities with this blocker.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {affected.map((facility) => {
                      const isSingleUnlock = unlockSlugs.has(facility.slug)
                      return (
                        <li
                          key={facility.slug}
                          className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-3"
                        >
                          <div className="min-w-0">
                            <Link
                              href={`/facility/${facility.slug}`}
                              className="font-medium text-foreground hover:text-primary hover:underline underline-offset-2"
                            >
                              {facility.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {facility.county}
                              {facility.overall_score != null
                                ? ` · ${formatPercentLabel(facility.overall_score, 0)} composite`
                                : ""}
                            </p>
                          </div>
                          {isSingleUnlock ? (
                            <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                              Single fix
                            </span>
                          ) : (
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {facility.blockers.length} blocker
                              {facility.blockers.length === 1 ? "" : "s"}
                            </span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}
