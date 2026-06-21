import { CorrelationChart } from "@/components/public/correlation-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "What Drives Readiness | Dashboard",
}

export default async function WhatDrivesPage() {
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">What Drives Readiness</h1>
        <p className="text-muted-foreground">The factors that actually predict deployment readiness</p>
      </div>

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
  )
}
