import Link from "next/link"
import type { FacilitySentimentSummary } from "@/lib/types-public"
import { formatFacilityChoice } from "@/lib/format-facility-value"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface SentimentTableRow extends FacilitySentimentSummary {
  facility_name: string
}

interface SentimentTableProps {
  rows: SentimentTableRow[]
}

export function SentimentTable({ rows }: SentimentTableProps) {
  const sorted = [...rows].sort((a, b) => a.facility_name.localeCompare(b.facility_name))

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs uppercase tracking-wide">Facility</TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide">Responses</TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide">Avg enthusiasm</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Management</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Burden view</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={row.facility_slug}>
              <TableCell className="font-medium">
                <Link
                  href={`/sentiment/${row.facility_slug}`}
                  className="hover:text-primary hover:underline underline-offset-2"
                >
                  {row.facility_name}
                </Link>
              </TableCell>
              <TableCell className="text-right tabular-nums">{row.response_count}</TableCell>
              <TableCell className="text-right tabular-nums">
                {row.avg_enthusiasm != null ? `${row.avg_enthusiasm}/10` : "—"}
              </TableCell>
              <TableCell className="text-sm capitalize text-muted-foreground">
                {formatFacilityChoice(row.management_engagement_mode)}
              </TableCell>
              <TableCell className="text-sm capitalize text-muted-foreground">
                {formatFacilityChoice(row.burden_perception_mode)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
