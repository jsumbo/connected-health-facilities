"use client"

import { useMemo } from "react"
import { Activity, Cpu, TrendingUp, Users } from "lucide-react"
import type { ProgrammeFacility } from "@/lib/types-public"
import { CorrelationChart } from "@/components/public/correlation-chart"
import { DlaReadinessScatter } from "@/components/public/dla-readiness-scatter"
import { KpiMetric } from "@/components/public/kpi-metric"
import {
  computeDriverCorrelations,
  correlationStrengthLabel,
  formatCorrelationScore,
  formatCorrelationSummary,
  pearsonCorrelation,
  buildDlaScatterPoints,
} from "@/lib/readiness-drivers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WhatDrivesClientProps {
  facilities: ProgrammeFacility[]
}

export function WhatDrivesClient({ facilities }: WhatDrivesClientProps) {
  const correlations = useMemo(
    () => computeDriverCorrelations(facilities),
    [facilities]
  )

  const topDriver = correlations[0]
  const infrastructure = correlations.filter((c) =>
    ["D_ICT", "D_POW", "D_CON", "devices"].includes(c.key)
  )
  const topInfra = infrastructure[0]

  const people = correlations.filter((c) =>
    ["dla", "enthusiasm", "D_DIG", "D_SEN"].includes(c.key)
  )
  const weakestPeople = [...people].sort(
    (a, b) => Math.abs(a.correlation) - Math.abs(b.correlation)
  )[0]

  const dlaPoints = useMemo(() => buildDlaScatterPoints(facilities), [facilities])
  const dlaR = useMemo(() => {
    if (dlaPoints.length < 3) return null
    return pearsonCorrelation(
      dlaPoints.map((p) => p.dla),
      dlaPoints.map((p) => p.composite)
    )
  }, [dlaPoints])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiMetric
          icon={TrendingUp}
          label="Strongest driver"
          value={topDriver ? topDriver.factor : "—"}
          description={
            topDriver
              ? `${formatCorrelationSummary(topDriver.correlation)} to readiness`
              : undefined
          }
        />
        <KpiMetric
          icon={Cpu}
          label="Top infrastructure"
          value={topInfra ? topInfra.factor : "—"}
          description={
            topInfra ? `${formatCorrelationScore(topInfra.correlation)} correlation` : undefined
          }
        />
        <KpiMetric
          icon={Users}
          label="Weakest people signal"
          value={weakestPeople ? weakestPeople.factor : "—"}
          description={
            weakestPeople
              ? `${formatCorrelationScore(weakestPeople.correlation)} correlation`
              : undefined
          }
        />
        <KpiMetric
          icon={Activity}
          label="DLA vs readiness"
          value={dlaR != null ? formatCorrelationScore(dlaR) : "—"}
          description={
            dlaR != null
              ? `${correlationStrengthLabel(dlaR)} link · ${dlaPoints.length} facilities`
              : dlaPoints.length > 0
                ? `${dlaPoints.length} facilities plotted`
                : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Correlation with composite</CardTitle>
            <p className="text-xs text-muted-foreground">
              How closely each factor tracks readiness — higher bars mean a stronger link
            </p>
          </CardHeader>
          <CardContent>
            <CorrelationChart data={correlations} />
          </CardContent>
        </Card>

        <DlaReadinessScatter facilities={facilities} />
      </div>
    </div>
  )
}
