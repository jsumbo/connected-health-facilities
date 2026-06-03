import Link from "next/link"
import type { ProgrammeFacility } from "@/lib/types-public"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TierBadge } from "./tier-badge"

interface FacilityDataTableProps {
  facilities: ProgrammeFacility[]
  compact?: boolean
}

export function FacilityDataTable({ facilities, compact }: FacilityDataTableProps) {
  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs uppercase tracking-wide">Facility</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">County</TableHead>
            {!compact && (
              <TableHead className="text-xs uppercase tracking-wide">Cluster</TableHead>
            )}
            <TableHead className="text-right text-xs uppercase tracking-wide">Score</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Tier</TableHead>
            {!compact && (
              <TableHead className="text-right text-xs uppercase tracking-wide">Data</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {facilities.map((f) => (
            <TableRow key={f.slug}>
              <TableCell className="font-medium">
                {f.assessment_status === "complete" ? (
                  <Link
                    href={`/facility/${f.slug}`}
                    className="text-foreground hover:text-primary hover:underline underline-offset-2"
                  >
                    {f.name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground italic">{f.name}</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{f.county}</TableCell>
              {!compact && (
                <TableCell className="text-xs text-muted-foreground">{f.cluster}</TableCell>
              )}
              <TableCell className="text-right tabular-nums font-medium">
                {f.overall_score != null ? `${f.overall_score}%` : "—"}
              </TableCell>
              <TableCell>
                <TierBadge tier={f.tier} compact />
              </TableCell>
              {!compact && (
                <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                  {f.assessment_status === "complete" ? `${f.completeness_pct}%` : "—"}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
