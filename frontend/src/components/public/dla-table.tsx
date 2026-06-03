import Link from "next/link"
import type { FacilityDlaSummary } from "@/lib/types-public"
import { formatFacilityChoice } from "@/lib/format-facility-value"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DlaTableRow extends FacilityDlaSummary {
  facility_name: string
  county: string
  district: string | null
}

interface DlaTableProps {
  rows: DlaTableRow[]
}

export function DlaTable({ rows }: DlaTableProps) {
  const sorted = [...rows].sort((a, b) => {
    const countyCmp = a.county.localeCompare(b.county)
    if (countyCmp !== 0) return countyCmp
    return a.facility_name.localeCompare(b.facility_name)
  })

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs uppercase tracking-wide">Facility</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">County</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">District</TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide">Responses</TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide">Avg score</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Confidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={row.facility_slug}>
              <TableCell className="font-medium">
                <Link
                  href={`/dla/${row.facility_slug}`}
                  className="hover:text-primary hover:underline underline-offset-2"
                >
                  {row.facility_name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{row.county}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {row.district ?? "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums">{row.response_count}</TableCell>
              <TableCell className="text-right tabular-nums">
                {row.avg_score != null ? `${row.avg_score}/100` : "—"}
              </TableCell>
              <TableCell className="text-sm capitalize text-muted-foreground">
                {formatFacilityChoice(row.confidence)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
