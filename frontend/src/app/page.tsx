import type { Metadata } from "next"
import Link from "next/link"
import { pageMetadata } from "@/lib/site-metadata"
import {
  Ban,
  ClipboardCheck,
  Gauge,
  GraduationCap,
  MessageSquareHeart,
  ShieldCheck,
} from "lucide-react"

export const metadata: Metadata = pageMetadata({
  title: "National overview",
  description:
    "National deployment readiness: tier mix, domain averages, blockers, and facility rollups for Liberia HOS rollout.",
  path: "/",
})
import { CountyBarCard } from "@/components/public/county-bar-chart"
import { DomainBarCard } from "@/components/public/domain-bar-chart"
import { ErrorBanner } from "@/components/public/error-banner"
import { FacilityDataTable } from "@/components/public/facility-data-table"
import { KpiMetric } from "@/components/public/kpi-metric"
import { PublicShell } from "@/components/public/PublicShell"
import { TierDonutCard } from "@/components/public/tier-donut-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPublicFacilities, getPublicOverview } from "@/lib/public-api"

export default async function HomePage() {
  let overview = null
  let topFacilities: Awaited<ReturnType<typeof getPublicFacilities>>["items"] = []
  let error: string | null = null

  try {
    overview = await getPublicOverview()
    const page = await getPublicFacilities()
    topFacilities = [...page.items]
      .filter((f) => f.overall_score != null)
      .sort((a, b) => (b.overall_score ?? 0) - (a.overall_score ?? 0))
      .slice(0, 8)
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load dashboard"
  }

  return (
    <PublicShell lastRefreshed={overview?.last_refreshed} title="Overview">
      {error && <ErrorBanner message={error} />}

      {overview && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <KpiMetric
              icon={ClipboardCheck}
              label="Assessed"
              value={`${overview.assessed_count} / ${overview.programme_target}`}
              description={`${overview.completion_pct}%`}
            />
            <KpiMetric
              icon={Gauge}
              label="Avg readiness"
              value={overview.avg_score != null ? `${overview.avg_score}%` : "—"}
            />
            <KpiMetric
              icon={ShieldCheck}
              label="Tier 1"
              value={overview.tier_counts["Tier 1 — HOS-Ready"] ?? 0}
              description="HOS-ready"
            />
            <KpiMetric
              icon={Ban}
              label="Blocked"
              value={overview.blocked_count}
            />
            <KpiMetric
              icon={MessageSquareHeart}
              label="Staff sentiment"
              value={
                overview.sentiment_avg_enthusiasm_national != null
                  ? `${overview.sentiment_avg_enthusiasm_national}/10`
                  : "—"
              }
              description={
                overview.sentiment_total_responses != null
                  ? `${overview.sentiment_total_responses} responses`
                  : undefined
              }
            />
            <KpiMetric
              icon={GraduationCap}
              label="Digital literacy"
              value={
                overview.dla_avg_score_national != null
                  ? `${overview.dla_avg_score_national}/100`
                  : "—"
              }
              description={
                overview.dla_total_responses != null
                  ? `${overview.dla_total_responses} responses`
                  : undefined
              }
            />
          </div>

          {(overview.sentiment_facilities_count != null || overview.dla_facilities_count != null) && (
            <p className="text-xs text-muted-foreground">
              {overview.sentiment_facilities_count != null && (
                <>
                  <Link href="/sentiment" className="text-primary hover:underline underline-offset-2">
                    Sentiment
                  </Link>
                  {overview.sentiment_avg_enthusiasm_national != null &&
                    ` · avg ${overview.sentiment_avg_enthusiasm_national}/10`}
                </>
              )}
              {overview.sentiment_facilities_count != null &&
                overview.dla_facilities_count != null &&
                " · "}
              {overview.dla_facilities_count != null && (
                <>
                  <Link href="/dla" className="text-primary hover:underline underline-offset-2">
                    Digital literacy
                  </Link>
                  {overview.dla_avg_score_national != null &&
                    ` · avg ${overview.dla_avg_score_national}/100`}
                </>
              )}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <TierDonutCard tierCounts={overview.tier_counts} />
            </div>
            <div className="lg:col-span-2">
              <CountyBarCard counties={overview.by_county} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DomainBarCard
              domainAverages={overview.domain_averages}
              title="Domains (national avg)"
            />
            <Card className="shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">By cluster</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {overview.by_cluster.map((c) => (
                  <div
                    key={c.cluster}
                    className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{c.cluster}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.region} · {c.facility_count} facilities
                      </p>
                    </div>
                    <p className="text-lg font-semibold tabular-nums">
                      {c.avg_score != null ? `${c.avg_score}%` : "—"}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Top scores</CardTitle>
              <Link
                href="/facilities"
                className="text-xs font-medium text-primary hover:underline underline-offset-2"
              >
                All facilities →
              </Link>
            </CardHeader>
            <CardContent>
              <FacilityDataTable facilities={topFacilities} compact />
            </CardContent>
          </Card>

          {overview.not_assessed_count > 0 && (
            <Card className="border-amber-200/80 bg-amber-50/80 shadow-none">
              <CardContent className="pt-4 text-sm text-amber-950">
                <strong>{overview.not_assessed_count}</strong>{" "}
                {overview.not_assessed_count === 1 ? "facility" : "facilities"} not assessed yet.{" "}
                <Link href="/data-quality" className="font-medium underline underline-offset-2">
                  Data quality
                </Link>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </PublicShell>
  )
}
