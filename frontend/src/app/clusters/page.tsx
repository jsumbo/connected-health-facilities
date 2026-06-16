import type { Metadata } from "next"
import { Building2, Gauge, MapPin } from "lucide-react"
import { DomainBarCard } from "@/components/public/domain-bar-chart"
import { ErrorBanner } from "@/components/public/error-banner"
import { KpiMetric } from "@/components/public/kpi-metric"
import { PageIntro } from "@/components/public/page-intro"
import { PublicShell } from "@/components/public/PublicShell"
import { TierBadge } from "@/components/public/tier-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getPublicClusters } from "@/lib/public-api"
import { pageMetadata } from "@/lib/site-metadata"
import type { ClusterSummary } from "@/lib/types-public"

export const metadata: Metadata = pageMetadata({
  title: "Clusters",
  description:
    "Regional cluster readiness: composite scores, tier mix, and DRF domain averages across Liberia facility clusters.",
  path: "/clusters",
})

function tierSummary(tierCounts: Record<string, number> | undefined): string {
  const counts = tierCounts ?? {}
  const tier1 = counts["Tier 1 — HOS-Ready"] ?? 0
  const tier2 =
    (counts["Tier 2 — Deployment-Eligible"] ?? 0) +
    (counts["Tier 2 — Structured Remediation"] ?? 0)
  const tier3 = counts["Tier 3 — Not Deployment-Ready"] ?? 0
  return `T1 ${tier1} · T2 ${tier2} · T3 ${tier3}`
}

function ClusterCard({ cluster }: { cluster: ClusterSummary }) {
  const domainEntries = Object.entries(cluster.domain_averages ?? {}).filter(
    ([, v]) => v != null
  )

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-start justify-between gap-2 text-base">
          <span>{cluster.cluster}</span>
          {cluster.avg_composite != null ? (
            <span className="shrink-0 font-sans text-lg tabular-nums text-primary">
              {cluster.avg_composite}%
            </span>
          ) : null}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {cluster.region ?? "—"} · {cluster.facility_count} facilities
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {Object.entries(cluster.tier_counts ?? {})
            .filter(([, count]) => count > 0)
            .map(([tier, count]) => (
              <div key={tier} className="flex items-center gap-1">
                <TierBadge tier={tier} compact />
                <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
              </div>
            ))}
        </div>
        {domainEntries.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {domainEntries.map(([label, score]) => (
              <div key={label} className="flex justify-between gap-2 rounded-md bg-muted/50 px-2 py-1">
                <span className="truncate text-muted-foreground">{label}</span>
                <span className="shrink-0 tabular-nums font-medium">{score}/3</span>
              </div>
            ))}
          </div>
        ) : null}
        {(cluster.avg_dla_score != null || cluster.avg_sentiment_enthusiasm != null) && (
          <p className="text-xs text-muted-foreground">
            {cluster.avg_dla_score != null && `DLA ${cluster.avg_dla_score}%`}
            {cluster.avg_dla_score != null && cluster.avg_sentiment_enthusiasm != null && " · "}
            {cluster.avg_sentiment_enthusiasm != null &&
              `Enthusiasm ${cluster.avg_sentiment_enthusiasm}/10`}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default async function ClustersPage() {
  let overview = null
  let error: string | null = null

  try {
    overview = await getPublicClusters()
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load cluster overview"
  }

  const clusters = overview?.clusters ?? []
  const nationalDomainAvgs = overview?.national_domain_averages ?? {}
  const hasDomainData = Object.values(nationalDomainAvgs).some((value) => value != null)

  const avgComposite =
    clusters.length > 0
      ? (() => {
          const vals = clusters
            .map((c) => c.avg_composite)
            .filter((v): v is number => v != null)
          if (vals.length === 0) return null
          return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
        })()
      : null

  return (
    <PublicShell
      lastRefreshed={overview?.last_refreshed}
      title="Clusters"
      description="Regional readiness"
    >
      {error && <ErrorBanner message={error} />}

      {overview && (
        <>
          <PageIntro
            title="Cluster & regional view"
            description={`${overview.total_clusters} geographic clusters with composite readiness scores and DRF domain averages (0–3 scale).`}
          />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <KpiMetric
              icon={MapPin}
              label="Clusters"
              value={overview.total_clusters}
            />
            <KpiMetric
              icon={Building2}
              label="Facilities"
              value={clusters.reduce((sum, c) => sum + c.facility_count, 0)}
            />
            <KpiMetric
              icon={Gauge}
              label="Avg composite"
              value={avgComposite != null ? `${avgComposite}%` : "—"}
            />
          </div>

          {hasDomainData && (
            <DomainBarCard
              title="National domain averages"
              description="DRF domains averaged across clusters (0–3)"
              domainAverages={nationalDomainAvgs}
              maxScore={3}
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {clusters.map((cluster) => (
              <ClusterCard key={cluster.cluster} cluster={cluster} />
            ))}
          </div>

          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Cluster comparison</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border-t border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs uppercase tracking-wide">Cluster</TableHead>
                      <TableHead className="text-xs uppercase tracking-wide">Region</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide">
                        Facilities
                      </TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide">
                        Composite
                      </TableHead>
                      <TableHead className="text-xs uppercase tracking-wide">Tiers</TableHead>
                      <TableHead className="text-xs uppercase tracking-wide">Domains (0–3)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clusters.map((cluster) => {
                      const domainText = Object.entries(cluster.domain_averages ?? {})
                        .filter(([, v]) => v != null)
                        .map(([label, score]) => `${label.split(" ")[0]} ${score}`)
                        .join(" · ")

                      return (
                        <TableRow key={cluster.cluster}>
                          <TableCell className="font-medium">{cluster.cluster}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {cluster.region ?? "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {cluster.facility_count}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {cluster.avg_composite != null ? `${cluster.avg_composite}%` : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {tierSummary(cluster.tier_counts)}
                          </TableCell>
                          <TableCell className="max-w-xs text-xs text-muted-foreground">
                            {domainText || "—"}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </PublicShell>
  )
}
