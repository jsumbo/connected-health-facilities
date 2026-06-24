"use client"

import { useMemo, useState } from "react"
import type { FacilitySentimentSummary, ProgrammeFacility } from "@/lib/types-public"
import { EnthusiasmHistogram } from "@/components/public/enthusiasm-histogram"
import { ChartNote } from "@/components/public/chart-note"
import {
  buildSentimentEnthusiasmNote,
  buildSentimentManagementNote,
} from "@/lib/dashboard-notes"
import { ManagementEngagementChart } from "@/components/public/management-engagement-chart"
import { SentimentTable } from "@/components/public/sentiment-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface SentimentRow extends FacilitySentimentSummary {
  facility_name: string
  county?: string
  tier?: string
}

interface SentimentExplorerProps {
  rows: SentimentRow[]
  facilities: ProgrammeFacility[]
}

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function SentimentExplorer({ rows, facilities }: SentimentExplorerProps) {
  const [county, setCounty] = useState<string>("all")
  const [tier, setTier] = useState<string>("all")
  const [search, setSearch] = useState("")

  const metaBySlug = useMemo(
    () =>
      Object.fromEntries(
        facilities.map((f) => [f.slug, { county: f.county, tier: f.tier }])
      ),
    [facilities]
  )

  const enriched = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        county: metaBySlug[r.facility_slug]?.county ?? "—",
        tier: metaBySlug[r.facility_slug]?.tier ?? "—",
      })),
    [rows, metaBySlug]
  )

  const counties = useMemo(
    () => [...new Set(enriched.map((r) => r.county).filter((c) => c !== "—"))].sort(),
    [enriched]
  )

  const tiers = useMemo(
    () => [...new Set(enriched.map((r) => r.tier).filter((t) => t !== "—"))].sort(),
    [enriched]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return enriched.filter((r) => {
      if (county !== "all" && r.county !== county) return false
      if (tier !== "all" && r.tier !== tier) return false
      if (q && !r.facility_name.toLowerCase().includes(q)) return false
      return true
    })
  }, [enriched, county, tier, search])

  const enthusiasmDistribution: Record<string, number> = {}
  const managementDistribution: Record<string, number> = {}
  for (const row of filtered) {
    for (const [score, count] of Object.entries(row.enthusiasm_distribution ?? {})) {
      enthusiasmDistribution[score] = (enthusiasmDistribution[score] ?? 0) + count
    }
    for (const [mode, count] of Object.entries(row.management_distribution ?? {})) {
      managementDistribution[mode] = (managementDistribution[mode] ?? 0) + count
    }
  }

  const enthusiasmNote = buildSentimentEnthusiasmNote(
    enthusiasmDistribution,
    filtered.length
  )
  const managementNote = buildSentimentManagementNote(managementDistribution)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <select
          className={selectClass}
          value={county}
          onChange={(e) => setCounty(e.target.value)}
          aria-label="Filter by county"
        >
          <option value="all">All counties</option>
          {counties.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          aria-label="Filter by tier"
        >
          <option value="all">All tiers</option>
          {tiers.map((t) => (
            <option key={t} value={t}>
              {t.replace(" — ", " · ")}
            </option>
          ))}
        </select>
        <Input
          className="max-w-xs"
          placeholder="Search facility…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Staff enthusiasm</CardTitle>
          </CardHeader>
          <CardContent>
            <EnthusiasmHistogram distribution={enthusiasmDistribution} />
            <ChartNote>{enthusiasmNote}</ChartNote>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Management engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <ManagementEngagementChart distribution={managementDistribution} />
            <ChartNote>{managementNote}</ChartNote>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardContent className="pt-6">
          <SentimentTable rows={filtered} />
        </CardContent>
      </Card>
    </div>
  )
}
