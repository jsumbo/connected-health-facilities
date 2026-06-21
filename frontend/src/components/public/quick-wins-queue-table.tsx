"use client"

import Link from "next/link"
import type { ProgrammeFacility } from "@/lib/types-public"
import { filterQuickWins } from "@/lib/quick-wins"
import { formatBlockerLine } from "@/lib/blockers"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface QuickWinsQueueTableProps {
  facilities: ProgrammeFacility[]
  mode?: "classic" | "expanded"
}

export function QuickWinsQueueTable({
  facilities,
  mode = "expanded",
}: QuickWinsQueueTableProps) {
  const queue = filterQuickWins(facilities, mode).sort(
    (a, b) => (b.overall_score ?? 0) - (a.overall_score ?? 0)
  )

  if (queue.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No single-blocker facilities in this view.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10 text-xs uppercase">#</TableHead>
            <TableHead className="text-xs uppercase">Facility</TableHead>
            <TableHead className="text-xs uppercase">County</TableHead>
            <TableHead className="text-right text-xs uppercase">Composite</TableHead>
            <TableHead className="text-xs uppercase">Blocker</TableHead>
            <TableHead className="text-xs uppercase">Insight</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queue.map((facility, index) => {
            const blocker = facility.blockers[0]
            const { code, label } = blocker ? formatBlockerLine(blocker) : { code: "—", label: "—" }
            const score = facility.overall_score
            const insight =
              score != null && score >= 70
                ? "High composite — clear blocker to unlock"
                : score != null && score >= 55
                  ? "Near Tier 2 after fix"
                  : "Single fix removes Tier 3 status"

            return (
              <TableRow key={facility.slug}>
                <TableCell className="tabular-nums text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium">
                  <Link
                    href={`/facility/${facility.slug}`}
                    className="hover:text-primary hover:underline underline-offset-2"
                  >
                    {facility.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{facility.county}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {score != null ? `${score}%` : "—"}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                      {code}
                    </span>
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{insight}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
