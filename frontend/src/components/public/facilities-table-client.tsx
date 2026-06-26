"use client"

import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { Download, Search } from "lucide-react"
import type { ProgrammeFacility } from "@/lib/types-public"
import { buildCsv, downloadCsv } from "@/lib/export-csv"
import { getBlockerCode } from "@/lib/quick-wins"
import { TierBadge } from "@/components/public/tier-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type SortKey = "name" | "county" | "score" | "tier" | "blockers"
type SortDir = "asc" | "desc"

interface FacilitiesTableClientProps {
  facilities: ProgrammeFacility[]
  compact?: boolean
}

export function FacilitiesTableClient({ facilities, compact }: FacilitiesTableClientProps) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = facilities
    if (q) {
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.county.toLowerCase().includes(q) ||
          f.cluster.toLowerCase().includes(q)
      )
    }
    const sorted = [...list].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name)
          break
        case "county":
          cmp = a.county.localeCompare(b.county)
          break
        case "score":
          cmp = (a.overall_score ?? -1) - (b.overall_score ?? -1)
          break
        case "tier":
          cmp = a.tier.localeCompare(b.tier)
          break
        case "blockers":
          cmp = a.blockers.length - b.blockers.length
          break
      }
      return sortDir === "asc" ? cmp : -cmp
    })
    return sorted
  }, [facilities, search, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "score" || key === "blockers" ? "desc" : "asc")
    }
  }

  const handleExport = () => {
    const headers = [
      "Facility",
      "County",
      "Cluster",
      "Score",
      "Tier",
      "Blockers",
    ]
    const rows = filtered.map((f) => [
      f.name,
      f.county,
      f.cluster,
      f.overall_score ?? "",
      f.tier,
      formatBlockerCell(f),
    ])
    downloadCsv("facilities-readiness.csv", buildCsv(headers, rows))
  }

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return ""
    return sortDir === "asc" ? " ↑" : " ↓"
  }

  return (
    <div className="space-y-3">
      {!compact ? (
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[12rem] flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              placeholder="Search name, county, cluster…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 text-sm"
              aria-label="Search facilities"
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="size-3.5" aria-hidden />
            Export CSV
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {filtered.length} of {facilities.length}
          </span>
        </div>
      ) : null}

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>
                <SortButton label="Facility" active={sortKey === "name"} onClick={() => handleSort("name")}>
                  Facility{sortIndicator("name")}
                </SortButton>
              </TableHead>
              <TableHead>
                <SortButton label="County" active={sortKey === "county"} onClick={() => handleSort("county")}>
                  County{sortIndicator("county")}
                </SortButton>
              </TableHead>
              {!compact ? (
                <TableHead className="text-xs uppercase tracking-wide">Cluster</TableHead>
              ) : null}
              <TableHead className="text-right">
                <SortButton label="Score" active={sortKey === "score"} onClick={() => handleSort("score")} className="ml-auto">
                  Score{sortIndicator("score")}
                </SortButton>
              </TableHead>
              <TableHead>
                <SortButton label="Tier" active={sortKey === "tier"} onClick={() => handleSort("tier")}>
                  Tier{sortIndicator("tier")}
                </SortButton>
              </TableHead>
              {!compact ? (
                <TableHead className="text-right">
                  <SortButton label="Blockers" active={sortKey === "blockers"} onClick={() => handleSort("blockers")} className="ml-auto">
                    Blockers{sortIndicator("blockers")}
                  </SortButton>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((f) => (
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
                {!compact ? (
                  <TableCell className="text-xs text-muted-foreground">{f.cluster}</TableCell>
                ) : null}
                <TableCell className="text-right tabular-nums font-medium">
                  {f.overall_score != null ? `${f.overall_score}%` : "—"}
                </TableCell>
                <TableCell>
                  <TierBadge tier={f.tier} compact />
                </TableCell>
                {!compact ? (
                  <TableCell className="text-right text-xs">
                    {f.blockers.length > 0 ? (
                      <span className="font-medium text-destructive">{formatBlockerCell(f)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function formatBlockerCell(facility: ProgrammeFacility): string {
  if (facility.blockers.length === 0) return "—"
  if (facility.blocker_codes?.length) {
    return facility.blocker_codes.join(", ")
  }
  const codes = facility.blockers
    .map((blocker) => getBlockerCode(blocker))
    .filter((code): code is string => Boolean(code))
  if (codes.length > 0) return codes.join(", ")
  return `${facility.blockers.length} blocker${facility.blockers.length > 1 ? "s" : ""}`
}

function SortButton({
  label,
  active,
  onClick,
  className,
  children,
}: {
  label: string
  active: boolean
  onClick: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs uppercase tracking-wide font-medium hover:text-foreground ${active ? "text-foreground" : "text-muted-foreground"} ${className ?? ""}`}
      aria-label={`Sort by ${label}`}
    >
      {children}
    </button>
  )
}
