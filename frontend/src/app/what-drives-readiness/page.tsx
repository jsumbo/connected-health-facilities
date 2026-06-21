import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site-metadata"
import { CorrelationChart } from "@/components/public/correlation-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PublicShell } from "@/components/public/PublicShell"

export const dynamic = "force-dynamic"

export const metadata: Metadata = pageMetadata({
  title: "What Drives Readiness",
  description: "The factors that actually predict deployment readiness.",
  path: "/what-drives-readiness",
})

export default function WhatDrivesPage() {
  const correlations = [
    { factor: "ICT hardware", correlation: 0.67 },
    { factor: "Power", correlation: 0.49 },
    { factor: "Connectivity", correlation: 0.47 },
    { factor: "Device count", correlation: 0.37 },
    { factor: "Data maturity", correlation: 0.28 },
    { factor: "Digital literacy", correlation: 0.2 },
    { factor: "Staff enthusiasm", correlation: 0.16 },
  ]

  return (
    <PublicShell title="What Drives Readiness" description="The factors that actually predict deployment readiness">
      <div className="space-y-8">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">What actually predicts readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">Correlation (|r|) of each factor with composite score — longer bars matter more</p>
            <CorrelationChart data={correlations} />
          </CardContent>
        </Card>

        <Card className="shadow-none border-l-4 border-l-emerald-500 bg-emerald-50/30">
          <CardHeader>
            <CardTitle className="text-base">Key insight</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Readiness is <strong>infrastructure-driven, not people-driven</strong>. ICT hardware, power and connectivity correlate strongly with composite; digital literacy and staff enthusiasm barely move it — capable staff are stuck in under-resourced facilities.</p>
          </CardContent>
        </Card>
      </div>
    </PublicShell>
  )
}
