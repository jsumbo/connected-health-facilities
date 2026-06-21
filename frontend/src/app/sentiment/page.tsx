import type { Metadata } from "next"
import { Building2, MessageSquare, Sparkles } from "lucide-react"
import { pageMetadata } from "@/lib/site-metadata"
import { ErrorBanner } from "@/components/public/error-banner"
import { KpiMetric } from "@/components/public/kpi-metric"
import { PublicShell } from "@/components/public/PublicShell"
import { SentimentExplorer } from "@/components/public/sentiment-explorer"
import { Card, CardContent } from "@/components/ui/card"
import { getPublicFacilities, getPublicOverview, getPublicSentiment } from "@/lib/public-api"

export const metadata: Metadata = pageMetadata({
  title: "Staff sentiment",
  description: "Staff sentiment survey results by facility.",
  path: "/sentiment",
})

export default async function SentimentPage() {
  let sentiment = null
  let error: string | null = null

  try {
    sentiment = await getPublicSentiment()
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load sentiment survey"
  }

  let facilities: Awaited<ReturnType<typeof getPublicFacilities>>["items"] = []
  let assessedCount = 0
  let targetCount = 37
  let nameBySlug: Record<string, string> = {}

  try {
    const [facilitiesData, overview] = await Promise.all([
      getPublicFacilities(),
      getPublicOverview().catch(() => null),
    ])
    facilities = facilitiesData.items
    nameBySlug = Object.fromEntries(facilities.map((f) => [f.slug, f.name]))
    assessedCount = overview?.assessed_count ?? facilities.length
    targetCount = overview?.programme_target ?? facilitiesData.total
  } catch {
    // table falls back to slug
  }

  const coverage = sentiment?.coverage
  const rows =
    sentiment?.facilities.map((s) => ({
      ...s,
      facility_name: nameBySlug[s.facility_slug] ?? s.facility_slug.replace(/_/g, " "),
    })) ?? []

  return (
    <PublicShell
      lastRefreshed={sentiment?.last_refreshed}
      title="Staff Sentiment"
      assessed={assessedCount}
      target={targetCount}
    >
      {error && <ErrorBanner message={error} />}

      {sentiment && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiMetric
              icon={Building2}
              label="With responses"
              value={`${coverage?.facilities_with_responses ?? 0} / ${coverage?.registry_count ?? 37}`}
            />
            <KpiMetric
              icon={MessageSquare}
              label="Responses"
              value={coverage?.total_responses ?? sentiment.raw_submission_count}
            />
            <KpiMetric
              icon={Sparkles}
              label="Avg enthusiasm"
              value={
                rows.length > 0
                  ? (() => {
                      const vals = rows
                        .map((r) => r.avg_enthusiasm)
                        .filter((v): v is number => v != null)
                      if (vals.length === 0) return "—"
                      const avg = vals.reduce((a, b) => a + b, 0) / vals.length
                      return `${avg.toFixed(1)}/10`
                    })()
                  : "—"
              }
            />
          </div>

          {coverage && coverage.missing_from_survey.length > 0 && (
            <Card className="border-amber-200/80 bg-amber-50/60 shadow-none">
              <CardContent className="pt-4 text-sm text-amber-950">
                {coverage.missing_from_survey.length} facilities with no responses yet.
              </CardContent>
            </Card>
          )}

          <SentimentExplorer rows={rows} facilities={facilities} />
        </>
      )}
    </PublicShell>
  )
}
