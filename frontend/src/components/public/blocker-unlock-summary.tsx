import Link from "next/link"
import type { BlockerSummary, ProgrammeFacility } from "@/lib/types-public"
import { blockerDisplayLabel, unlockCountForBlocker } from "@/lib/blockers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BlockerUnlockSummaryProps {
  blockers: BlockerSummary[]
  facilities: ProgrammeFacility[]
}

export function BlockerUnlockSummary({ blockers, facilities }: BlockerUnlockSummaryProps) {
  if (!blockers.length) return null

  const sorted = [...blockers].sort((a, b) => b.count - a.count)
  const top = sorted[0]

  return (
    <Card className="mb-8 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Blockers drive Tier 3 — not low scores alone</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {top ? (
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">
              {blockerDisplayLabel(top.code, top.description)}
            </strong>{" "}
            affects the most facilities ({top.count}). Clearing a single blocker unlocks
            facilities listed below.
          </p>
        ) : null}
        <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.slice(0, 6).map((blocker) => {
            const unlock = unlockCountForBlocker(facilities, blocker.code)
            const label = blockerDisplayLabel(blocker.code, blocker.description)
            return (
              <Link
                key={blocker.code}
                href={`/blockers#${encodeURIComponent(blocker.code)}`}
                aria-label={`View ${label} blocker details`}
                className={cn(
                  "flex h-full items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2",
                  "transition-colors hover:border-primary/30 hover:bg-muted/40",
                  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {blocker.count} facilities
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-bold tabular-nums text-emerald-600">{unlock}</p>
                  <p className="text-[10px] text-muted-foreground">if cleared alone</p>
                </div>
              </Link>
            )
          })}
        </div>
        <Link
          href="/blockers"
          className="inline-block text-xs font-medium text-primary hover:underline underline-offset-2"
        >
          Full blocker analysis →
        </Link>
      </CardContent>
    </Card>
  )
}
