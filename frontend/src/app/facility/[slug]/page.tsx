import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { pageMetadata } from "@/lib/site-metadata"
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Ban,
  Battery,
  Gauge,
  Globe,
  GraduationCap,
  MessageSquareHeart,
  Scale,
  Sparkles,
  Users,
  Laptop,
  Monitor,
  Signal,
  Smartphone,
  Tablet,
  Timer,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { DomainBarCard } from "@/components/public/domain-bar-chart"
import { FacilityMetricCard } from "@/components/public/facility-metric-card"
import { PageIntro } from "@/components/public/page-intro"
import { PublicShell } from "@/components/public/PublicShell"
import { TierBadge } from "@/components/public/tier-badge"
import { ReadinessGaugeRing } from "@/components/public/readiness-gauge-ring"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFacilityPhotoUrl, getPublicFacility } from "@/lib/public-api"
import { blockerKey, formatBlocker } from "@/lib/format-blocker"
import { blockerDisplayLabel } from "@/lib/blockers"
import {
  formatFacilityChoice,
  formatMbps,
  formatPercent,
} from "@/lib/format-facility-value"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const path = `/facility/${slug}`

  try {
    const facility = await getPublicFacility(slug)
    if (!facility) {
      return pageMetadata({ title: "Facility not found", path })
    }

    const scoreText =
      facility.overall_score != null
        ? `${Math.round(facility.overall_score)}% readiness`
        : facility.assessment_status === "complete"
          ? "Assessment complete"
          : "Not yet assessed"

    const blockerText = facility.deployment_blocked
      ? "Deployment blocked."
      : "No deployment blockers."

    return pageMetadata({
      title: facility.name,
      description: `${facility.county} · ${scoreText} · ${facility.tier}. ${blockerText} Domain scores and infrastructure detail.`,
      path,
    })
  } catch {
    return pageMetadata({ title: "Facility", path })
  }
}

export default async function FacilityPage({ params }: PageProps) {
  const { slug } = await params
  let facility = null

  try {
    facility = await getPublicFacility(slug)
  } catch {
    notFound()
  }

  if (!facility || facility.assessment_status !== "complete") {
    return (
      <PublicShell title={facility?.name ?? "Facility"} description="Not assessed">
        <Link href="/facilities" className="text-sm text-primary hover:underline underline-offset-2">
          ← All facilities
        </Link>
      </PublicShell>
    )
  }

  const domainChart: Record<string, number | null> = {}
  for (const [, d] of Object.entries(facility.domain_scores)) {
    if (d && typeof d === "object" && "label" in d && "score" in d) {
      domainChart[d.label] = d.score
    }
  }

  const metrics: { label: string; value: string | number; icon: LucideIcon }[] = [
    { label: "Internet", icon: Globe, value: formatFacilityChoice(facility.internet_type) },
    { label: "Mobile signal", icon: Signal, value: formatFacilityChoice(facility.mobile_signal) },
    { label: "Uptime", icon: Activity, value: formatPercent(facility.internet_uptime) },
    { label: "Download", icon: ArrowDownToLine, value: formatMbps(facility.download_mbps) },
    { label: "Upload", icon: ArrowUpFromLine, value: formatMbps(facility.upload_mbps) },
    { label: "Latency", icon: Timer, value: facility.network_latency ?? "—" },
    { label: "Primary power", icon: Zap, value: formatFacilityChoice(facility.primary_power) },
    { label: "Backup power", icon: Battery, value: formatFacilityChoice(facility.backup_power) },
    { label: "Laptops", icon: Laptop, value: facility.laptops ?? "—" },
    { label: "Desktops", icon: Monitor, value: facility.desktops ?? "—" },
    { label: "Tablets", icon: Tablet, value: facility.tablets ?? "—" },
    { label: "Phones", icon: Smartphone, value: facility.phones ?? "—" },
  ]

  return (
    <PublicShell title={facility.name} description={`${facility.county} · ${facility.cluster}`}>
      <Link
        href="/facilities"
        className="text-xs text-muted-foreground hover:text-primary hover:underline underline-offset-2"
      >
        ← All facilities
      </Link>

      <div className="space-y-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {facility.has_facility_photo ? (
            <figure className="w-full shrink-0 overflow-hidden rounded-lg border border-border sm:max-w-xs md:max-w-sm">
              <img
                src={getFacilityPhotoUrl(slug)}
                alt={`${facility.name} facility`}
                className="aspect-[4/3] max-h-48 w-full object-cover sm:max-h-52"
                loading="eager"
              />
            </figure>
          ) : null}
          <Card className="w-full shrink-0 self-start shadow-none sm:w-auto">
            <CardContent className="px-5 py-5 text-center">
              {facility.overall_score != null ? (
                <ReadinessGaugeRing score={facility.overall_score} />
              ) : (
                <>
                  <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Gauge className="size-5" strokeWidth={2} aria-hidden />
                  </div>
                  <p className="text-4xl font-semibold tabular-nums">—</p>
                </>
              )}
              <div className="mt-3 flex flex-col items-center gap-1">
                <TierBadge tier={facility.tier} />
                {facility.wave ? (
                  <p className="text-xs text-muted-foreground">{facility.wave}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
        <PageIntro
          title={facility.name}
          description={[facility.county, facility.district, facility.facility_type]
            .filter(Boolean)
            .join(" · ")}
        />
      </div>

      {facility.quality_flags && facility.quality_flags.length > 0 && (
        <Card className="border-amber-200/80 bg-amber-50/60 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-amber-950">Data quality flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {facility.quality_flags.map((flag) => (
                <Badge
                  key={flag.code}
                  variant="secondary"
                  className={
                    flag.severity === "critical"
                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : "border-amber-300/80 bg-amber-100/80 text-amber-950"
                  }
                  title={flag.detail}
                >
                  {flag.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {facility.deployment_blocked && facility.blockers.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <Ban className="size-4" aria-hidden />
              Blockers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2 text-sm text-destructive/90">
              {facility.blockers.map((b, i) => (
                <li key={blockerKey(b, i)}>{formatBlocker(b)}</li>
              ))}
            </ul>
            {facility.blocker_codes && facility.blocker_codes.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1">
                {facility.blocker_codes.map((code) => (
                  <Badge key={code} variant="outline" className="text-[10px]">
                    {blockerDisplayLabel(code)}
                  </Badge>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {metrics.map((item) => (
          <FacilityMetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </div>

      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquareHeart className="size-4 text-primary" aria-hidden />
            Staff sentiment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {facility.sentiment_status === "complete" ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <FacilityMetricCard
                icon={Users}
                label="Responses"
                value={facility.sentiment_response_count ?? 0}
              />
              <FacilityMetricCard
                icon={Sparkles}
                label="Avg enthusiasm"
                value={
                  facility.sentiment_avg_enthusiasm != null
                    ? `${facility.sentiment_avg_enthusiasm}/10`
                    : "—"
                }
              />
              <FacilityMetricCard
                icon={Users}
                label="Management"
                value={formatFacilityChoice(facility.sentiment_management_mode)}
              />
              <FacilityMetricCard
                icon={Scale}
                label="Burden view"
                value={formatFacilityChoice(facility.sentiment_burden_mode)}
              />
            </div>
          ) : (
            <p className="text-muted-foreground">No responses yet.</p>
          )}
          <Link
            href={`/sentiment/${slug}`}
            className="text-xs text-primary hover:underline underline-offset-2"
          >
            Sentiment detail →
          </Link>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="size-4 text-primary" aria-hidden />
            Digital literacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {facility.dla_status === "complete" ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <FacilityMetricCard
                icon={Users}
                label="Responses"
                value={facility.dla_response_count ?? 0}
              />
              <FacilityMetricCard
                icon={GraduationCap}
                label="Avg score"
                value={
                  facility.dla_avg_score != null ? `${facility.dla_avg_score}/100` : "—"
                }
              />
              <FacilityMetricCard
                icon={Gauge}
                label="Confidence"
                value={formatFacilityChoice(facility.dla_confidence)}
              />
            </div>
          ) : (
            <p className="text-muted-foreground">No assessments yet.</p>
          )}
          <Link
            href={`/dla/${slug}`}
            className="text-xs text-primary hover:underline underline-offset-2"
          >
            Digital literacy detail →
          </Link>
        </CardContent>
      </Card>

      <DomainBarCard
        domainAverages={domainChart}
        title="DRF domains"
        description="0–3 scale"
        maxScore={3}
      />

      {facility.missing_fields.length > 0 && (
        <Card className="border-amber-200/80 bg-amber-50/60 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-amber-950">Missing fields</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-amber-900">
              {facility.completeness_pct}% complete · {facility.data_confidence} confidence
            </p>
            <div className="flex flex-wrap gap-2">
              {facility.missing_fields.map((f) => (
                <Badge key={f} variant="secondary" className="bg-amber-100/80 text-amber-950">
                  {f}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {facility.has_gps && facility.latitude != null && (
        <p className="text-xs text-muted-foreground">
          GPS: {facility.latitude.toFixed(5)}, {facility.longitude?.toFixed(5)}
        </p>
      )}
    </PublicShell>
  )
}
