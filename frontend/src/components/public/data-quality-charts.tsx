"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { ProgrammeFacility } from "@/lib/types-public"
import { ChartNote } from "@/components/public/chart-note"
import {
  buildDataQualityCompletenessNote,
  buildDataQualityMissingNote,
} from "@/lib/dashboard-notes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatAxisIntegerTick } from "@/lib/format-number"

interface DataQualityChartsProps {
  facilities: ProgrammeFacility[]
}

const DOMAIN_FIELD_HINTS: Record<string, string> = {
  B: "Governance",
  C: "Workforce",
  D: "Infrastructure",
  E: "Health Information",
  F: "Digital Technologies",
  G: "Clinical Service",
  H: "Supply Chain",
  I: "Financing",
  J: "Operational Support",
}

function inferDomainFromField(field: string): string {
  const upper = field.toUpperCase()
  for (const [code, label] of Object.entries(DOMAIN_FIELD_HINTS)) {
    if (upper.startsWith(code + "_") || upper.includes(`_${code}_`)) return label
  }
  if (/power|connect|internet|device|laptop|desktop|tablet|phone|uptime|mbps/i.test(field)) {
    return "Infrastructure"
  }
  if (/staff|workforce|train|literacy|role/i.test(field)) return "Workforce"
  if (/dhis|record|data|report|duplicate/i.test(field)) return "Health Information"
  if (/digital|ict|tool|system/i.test(field)) return "Digital Technologies"
  return "Other"
}

export function DataQualityCharts({
  facilities,
  programmeTarget = 37,
}: DataQualityChartsProps & { programmeTarget?: number }) {
  const assessed = facilities.filter((f) => f.assessment_status === "complete")
  const completenessNote = buildDataQualityCompletenessNote(facilities, programmeTarget)
  const missingNote = buildDataQualityMissingNote(facilities)

  const completenessBuckets = [
    { range: "<70%", count: 0 },
    { range: "70–84%", count: 0 },
    { range: "85–94%", count: 0 },
    { range: "≥95%", count: 0 },
  ]

  for (const f of assessed) {
    const p = f.completeness_pct
    if (p < 70) completenessBuckets[0].count += 1
    else if (p < 85) completenessBuckets[1].count += 1
    else if (p < 95) completenessBuckets[2].count += 1
    else completenessBuckets[3].count += 1
  }

  const missingByDomain: Record<string, number> = {}
  for (const f of assessed) {
    for (const field of f.missing_fields ?? []) {
      const domain = inferDomainFromField(field)
      missingByDomain[domain] = (missingByDomain[domain] ?? 0) + 1
    }
  }

  const domainData = Object.entries(missingByDomain)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Completeness distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={completenessBuckets} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" fontSize={11} tickLine={false} />
              <YAxis allowDecimals={false} fontSize={11} tickLine={false} width={28} tickFormatter={formatAxisIntegerTick} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--chart-3)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <ChartNote>{completenessNote}</ChartNote>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Missing fields by domain</CardTitle>
          <p className="text-xs text-muted-foreground">Where to focus re-collection efforts</p>
        </CardHeader>
        <CardContent>
          {domainData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No missing field data</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={domainData} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} fontSize={11} tickFormatter={formatAxisIntegerTick} />
                <YAxis type="category" dataKey="domain" width={100} fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--chart-4)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <ChartNote>{missingNote}</ChartNote>
        </CardContent>
      </Card>
    </div>
  )
}
