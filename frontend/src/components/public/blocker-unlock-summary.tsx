import Link from "next/link"
import type { BlockerSummary, ProgrammeFacility } from "@/lib/types-public"
import { getBlockerCode } from "@/lib/quick-wins"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BlockerUnlockSummaryProps {
  blockers: BlockerSummary[]
  facilities: ProgrammeFacility[]
}

function unlockCountForBlocker(
  facilities: ProgrammeFacility[],
  code: string
): number {
  return facilities.filter(
    (f) =>
      f.tier === "Tier 3 — Not Deployment-Ready" &&
      f.blockers.length === 1 &&
      getBlockerCode(f.blockers[0]) === code
  ).length
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
            <strong className="text-foreground">{top.code}</strong> affects the most facilities (
            {top.count}) — {top.description.toLowerCase()}. Clearing a single blocker unlocks
            facilities listed below.
          </p>
        ) : null}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.slice(0, 6).map((blocker) => {
            const unlock = unlockCountForBlocker(facilities, blocker.code)
            return (
              <div
                key={blocker.code}
                className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-semibold text-foreground">{blocker.code}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{blocker.count} facilities</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold tabular-nums text-emerald-600">{unlock}</p>
                  <p className="text-[10px] text-muted-foreground">if cleared alone</p>
                </div>
              </div>
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
