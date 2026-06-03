import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { pageMetadata } from "@/lib/site-metadata"
import { GraduationCap, TrendingDown, TrendingUp, Users } from "lucide-react"
import { ErrorBanner } from "@/components/public/error-banner"
import { KpiMetric } from "@/components/public/kpi-metric"
import { PageIntro } from "@/components/public/page-intro"
import { PublicShell } from "@/components/public/PublicShell"
import { SentimentDistribution } from "@/components/public/sentiment-distribution"
import { formatFacilityChoice } from "@/lib/format-facility-value"
import { getPublicDlaFacility } from "@/lib/public-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const path = `/dla/${slug}`

  try {
    const detail = await getPublicDlaFacility(slug)
    if (!detail) {
      return pageMetadata({ title: "Digital literacy", path })
    }
    const avg =
      detail.avg_score != null ? `${Math.round(detail.avg_score)}/100 average` : "No responses"
    return pageMetadata({
      title: `${detail.facility_name} — Digital literacy`,
      description: `${detail.facility_name} DLA results: ${avg}, ${detail.response_count} responses.`,
      path,
    })
  } catch {
    return pageMetadata({ title: "Digital literacy", path })
  }
}

export default async function DlaFacilityPage({ params }: PageProps) {
  const { slug } = await params
  let detail = null
  let error: string | null = null

  try {
    detail = await getPublicDlaFacility(slug)
  } catch (e) {
    const message = e instanceof Error ? e.message : ""
    if (/not found|No DLA/i.test(message)) {
      notFound()
    }
    error = message || "Failed to load digital literacy details"
  }

  const location = [detail?.county, detail?.district, detail?.region].filter(Boolean).join(" · ")

  return (
    <PublicShell title={detail?.facility_name ?? "Facility"} description="Digital literacy">
      <Link
        href="/dla"
        className="text-xs text-muted-foreground hover:text-primary hover:underline underline-offset-2"
      >
        ← Digital literacy
      </Link>

      {error && <ErrorBanner message={error} />}

      {detail && (
        <>
          <PageIntro
            title={detail.facility_name}
            description={
              location
                ? `${location} · ${detail.response_count} assessment${detail.response_count === 1 ? "" : "s"}`
                : `${detail.response_count} assessments`
            }
          />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiMetric icon={Users} label="Responses" value={detail.response_count} />
            <KpiMetric
              icon={GraduationCap}
              label="Avg score"
              value={detail.avg_score != null ? `${detail.avg_score}/100` : "—"}
              description={
                detail.score_min != null && detail.score_max != null
                  ? `Range ${detail.score_min}–${detail.score_max}`
                  : undefined
              }
            />
            <KpiMetric
              icon={TrendingUp}
              label="Best score"
              value={detail.score_max != null ? `${detail.score_max}/100` : "—"}
            />
            <KpiMetric
              icon={TrendingDown}
              label="Lowest score"
              value={detail.score_min != null ? `${detail.score_min}/100` : "—"}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Confidence: {formatFacilityChoice(detail.confidence)}
            {detail.confidence === "indicative" && " (fewer than 3 responses)"}
          </p>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Respondent roles</CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentDistribution distribution={detail.role_breakdown ?? {}} />
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Administration method</CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentDistribution distribution={detail.administration_breakdown ?? {}} />
              </CardContent>
            </Card>
          </div>

          <p className="text-xs text-muted-foreground">
            Aggregated only — no individual responses.
            {detail.latest_submitted_at && (
              <>
                {" "}
                Last updated{" "}
                {new Date(detail.latest_submitted_at).toLocaleDateString("en-US", {
                  dateStyle: "medium",
                })}
                .
              </>
            )}{" "}
            <Link
              href={`/facility/${slug}`}
              className="text-primary hover:underline underline-offset-2"
            >
              Baseline assessment →
            </Link>
          </p>
        </>
      )}
    </PublicShell>
  )
}
