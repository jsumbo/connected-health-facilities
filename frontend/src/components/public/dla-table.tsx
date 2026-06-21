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

function trainingIntensity(
  administration: Record<string, number> | undefined
): { label: string; className: string } {
  if (!administration || Object.keys(administration).length === 0) {
    return { label: "—", className: "text-muted-foreground" }
  }
  const top = Object.entries(administration).sort((a, b) => b[1] - a[1])[0]
  const label = formatFacilityChoice(top[0])
  const lower = label.toLowerCase()
  if (lower.includes("structured")) {
    return {
      label,
      className: "rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800",
    }
  }
  if (lower.includes("targeted")) {
    return {
      label,
      className: "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900",
    }
  }
  return {
    label,
    className: "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700",
  }
}

function confidencePill(confidence: string): string {
  const lower = confidence.toLowerCase()
  if (lower.includes("sufficient") || lower.includes("high")) {
    return "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
  }
  if (lower.includes("indicative") || lower.includes("low")) {
    return "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900"
  }
  return "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
}

export function DlaTable({ rows }: DlaTableProps) {
  const sorted = [...rows].sort((a, b) => {
    const scoreA = a.avg_score ?? -1
    const scoreB = b.avg_score ?? -1
    if (scoreB !== scoreA) return scoreB - scoreA
    return a.facility_name.localeCompare(b.facility_name)
  })

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs uppercase tracking-wide">Facility</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">County</TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide">Avg score</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Training intensity</TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide">Responses</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Confidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => {
            const training = trainingIntensity(row.administration_breakdown)
            return (
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
                <TableCell className="text-right font-semibold tabular-nums">
                  {row.avg_score != null ? `${row.avg_score}%` : "—"}
                </TableCell>
                <TableCell>
                  <span className={training.className}>{training.label}</span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{row.response_count}</TableCell>
                <TableCell>
                  <span className={confidencePill(row.confidence)}>
                    {formatFacilityChoice(row.confidence)}
                  </span>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
