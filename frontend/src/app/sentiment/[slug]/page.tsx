import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { pageMetadata } from "@/lib/site-metadata"
import { MessageSquare, Scale, Sparkles, Users } from "lucide-react"
import { ErrorBanner } from "@/components/public/error-banner"
import { KpiMetric } from "@/components/public/kpi-metric"
import { PageIntro } from "@/components/public/page-intro"
import { PublicShell } from "@/components/public/PublicShell"
import { SentimentDistribution } from "@/components/public/sentiment-distribution"
import { formatFacilityChoice } from "@/lib/format-facility-value"
import { getPublicSentimentFacility } from "@/lib/public-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const path = `/sentiment/${slug}`

  try {
    const detail = await getPublicSentimentFacility(slug)
    if (!detail) {
      return pageMetadata({ title: "Staff sentiment", path })
    }
    const avg =
      detail.avg_enthusiasm != null
        ? `${detail.avg_enthusiasm.toFixed(1)}/10 average`
        : "No responses"
    return pageMetadata({
      title: `${detail.facility_name} — Staff sentiment`,
      description: `${detail.facility_name} staff sentiment survey: ${avg}, ${detail.response_count} responses.`,
      path,
    })
  } catch {
    return pageMetadata({ title: "Staff sentiment", path })
  }
}

export default async function SentimentFacilityPage({ params }: PageProps) {
  const { slug } = await params
  let detail = null
  let error: string | null = null

  try {
    detail = await getPublicSentimentFacility(slug)
  } catch (e) {
    const message = e instanceof Error ? e.message : ""
    if (/not found|No sentiment/i.test(message)) {
      notFound()
    }
    error = message || "Failed to load sentiment details"
  }

  const location = [detail?.county, detail?.district, detail?.region].filter(Boolean).join(" · ")

  return (
    <PublicShell title={detail?.facility_name ?? "Facility"} description="Staff sentiment">
      <Link
        href="/sentiment"
        className="text-xs text-muted-foreground hover:text-primary hover:underline underline-offset-2"
      >
        ← Sentiment
      </Link>

      {error && <ErrorBanner message={error} />}

      {detail && (
        <>
          <PageIntro
            title={detail.facility_name}
            description={
              location
                ? `${location} · ${detail.response_count} staff response${detail.response_count === 1 ? "" : "s"}`
                : `${detail.response_count} staff responses`
            }
          />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiMetric icon={Users} label="Responses" value={detail.response_count} />
            <KpiMetric
              icon={Sparkles}
              label="Avg enthusiasm"
              value={detail.avg_enthusiasm != null ? `${detail.avg_enthusiasm}/10` : "—"}
              description={
                detail.enthusiasm_min != null && detail.enthusiasm_max != null
                  ? `Range ${detail.enthusiasm_min}–${detail.enthusiasm_max}`
                  : undefined
              }
            />
            <KpiMetric
              icon={Users}
              label="Management"
              value={formatFacilityChoice(detail.management_engagement_mode)}
            />
            <KpiMetric
              icon={Scale}
              label="Burden view"
              value={formatFacilityChoice(detail.burden_perception_mode)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Enthusiasm scores</CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentDistribution distribution={detail.enthusiasm_distribution ?? {}} />
              </CardContent>
            </Card>

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
                <CardTitle className="text-base">Management engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentDistribution distribution={detail.management_distribution ?? {}} />
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Digitisation burden</CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentDistribution distribution={detail.burden_distribution ?? {}} />
              </CardContent>
            </Card>
          </div>

          {Object.keys(detail.data_in_meetings_distribution ?? {}).length > 0 && (
            <Card className="shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Data use in meetings</CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentDistribution
                  distribution={detail.data_in_meetings_distribution ?? {}}
                />
              </CardContent>
            </Card>
          )}

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
