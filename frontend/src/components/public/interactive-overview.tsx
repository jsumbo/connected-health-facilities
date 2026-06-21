"use client"

import { useMemo, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import type { PublicOverview, ProgrammeFacility, QuestionStat } from "@/lib/types-public"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TierDonutCard } from "./tier-donut-chart"
import { CountyBarCard } from "./county-bar-chart"
import { DomainBarCard } from "./domain-bar-chart"
import { BlockerBarCard } from "./blocker-bar-chart"
import { KpiMetric } from "./kpi-metric"
import { QuickWinsCard } from "./quick-wins-card"
import { ActiveFilterChips } from "./active-filter-chips"
import { BlockerUnlockSummary } from "./blocker-unlock-summary"
import {
  Ban,
  ClipboardCheck,
  Gauge,
  GraduationCap,
  MessageSquareHeart,
  ShieldCheck,
  Target,
  Wrench,
  Zap,
} from "lucide-react"
import { countQuickWins } from "@/lib/quick-wins"
import { buildDlaInsight, getWeakestDomain } from "@/lib/overview-insights"
import { formatAxisTick, formatPercentLabel } from "@/lib/format-number"

interface InteractiveOverviewProps {
  overview: PublicOverview
  counties: string[]
  facilities?: ProgrammeFacility[]
  dlaQuestions?: QuestionStat[]
}

export function InteractiveOverview({
  overview,
  counties,
  facilities = [],
  dlaQuestions = [],
}: InteractiveOverviewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedCounty, setSelectedCounty] = useState<string>("")
  const [selectedTier, setSelectedTier] = useState<string>("")

  useEffect(() => {
    const county = searchParams.get("county") || ""
    const tier = searchParams.get("tier") || ""
    setSelectedCounty(county)
    setSelectedTier(tier)
  }, [searchParams])

  const handleCountyChange = (county: string) => {
    setSelectedCounty(county)
    setSelectedTier("")
    const params = new URLSearchParams()
    if (county) params.set("county", county)
    router.push(`?${params.toString()}`)
  }

  const handleTierChange = (tier: string) => {
    setSelectedTier(tier)
    setSelectedCounty("")
    const params = new URLSearchParams()
    if (tier) params.set("tier", tier)
    router.push(`?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSelectedCounty("")
    setSelectedTier("")
    router.push("?")
  }

  const quickWinsClassic = useMemo(
    () => countQuickWins(facilities, "classic"),
    [facilities]
  )
  const quickWinsExpanded = useMemo(
    () => countQuickWins(facilities, "expanded"),
    [facilities]
  )

  const filtered = useMemo(() => {
    let result = { ...overview }

    if (selectedCounty) {
      result = {
        ...result,
        by_county: overview.by_county.filter((c) => c.county === selectedCounty),
      }
    }

    if (selectedTier) {
      result = {
        ...result,
        tier_counts: Object.fromEntries(
          Object.entries(overview.tier_counts).filter(([tier]) => tier === selectedTier)
        ),
      }
    }

    if (selectedCounty) {
      const countyData = overview.by_county.find((c) => c.county === selectedCounty)
      if (countyData) {
        result.tier_counts = countyData.tiers || result.tier_counts
      }
    }

    return result
  }, [overview, selectedCounty, selectedTier])

  const weakestDomain = getWeakestDomain(overview.domain_averages)
  const structuredRemediation =
    overview.tier_counts["Tier 2 — Structured Remediation"] ?? 0
  const deploymentEligible =
    overview.tier_counts["Tier 2 — Deployment-Eligible"] ?? 0
  const tier1Count = overview.tier_counts["Tier 1 — HOS-Ready"] ?? 0

  const dlaInsight = buildDlaInsight(dlaQuestions)
  const weakestDla = [...dlaQuestions].sort((a, b) => a.correctRate - b.correctRate)[0]

  const tiers = [
    { value: "", label: "All tiers" },
    { value: "Tier 1 — HOS-Ready", label: "Tier 1 · HOS-Ready" },
    { value: "Tier 2 — Deployment-Eligible", label: "Tier 2 · Deployment-Eligible" },
    { value: "Tier 2 — Structured Remediation", label: "Tier 2 · Structured Remediation" },
    { value: "Tier 3 — Not Deployment-Ready", label: "Tier 3 · Not Deployment-Ready" },
  ]

  const selectClassName =
    "h-9 min-w-[12rem] rounded-lg border border-input bg-card px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

  return (
    <>
      <ActiveFilterChips
        county={selectedCounty || undefined}
        tier={selectedTier || undefined}
        onClearCounty={() => handleCountyChange("")}
        onClearTier={() => handleTierChange("")}
        onClearAll={handleClearFilters}
      />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="county-filter" className="text-xs font-medium text-muted-foreground">
            County
          </label>
          <select
            id="county-filter"
            value={selectedCounty}
            onChange={(e) => handleCountyChange(e.target.value)}
            className={selectClassName}
          >
            <option value="">All counties</option>
            {counties.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="tier-filter" className="text-xs font-medium text-muted-foreground">
            Tier
          </label>
          <select
            id="tier-filter"
            value={selectedTier}
            onChange={(e) => handleTierChange(e.target.value)}
            className={selectClassName}
          >
            {tiers.map((tier) => (
              <option key={tier.value} value={tier.value}>
                {tier.label}
              </option>
            ))}
          </select>
        </div>

        {(selectedCounty || selectedTier) && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Decision-first KPIs (existing metrics retained below) */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 mb-4">
        <KpiMetric
          icon={ShieldCheck}
          label="HOS-ready now"
          value={tier1Count}
          description="Tier 1"
        />
        <KpiMetric
          icon={Zap}
          label="Quick wins"
          value={quickWinsExpanded}
          description={`1 blocker · ≥65%${quickWinsClassic !== quickWinsExpanded ? ` (${quickWinsClassic} total)` : ""}`}
        />
        <KpiMetric
          icon={Target}
          label="Deploy-eligible"
          value={deploymentEligible}
          description="Tier 2"
        />
        <KpiMetric
          icon={Wrench}
          label="Structured remediation"
          value={structuredRemediation}
          description="Tier 2"
        />
        <KpiMetric
          icon={Ban}
          label="Tier 3 blocked"
          value={overview.blocked_count}
          description="Any BLK"
        />
        <KpiMetric
          icon={Gauge}
          label="Weakest domain"
          value={weakestDomain ? weakestDomain.label.split(" ")[0] : "—"}
          description={
            weakestDomain ? `${formatAxisTick(weakestDomain.value, 2)}/3 avg` : undefined
          }
        />
      </div>

      {/* Secondary KPIs — preserved from original overview */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 mb-8">
        <KpiMetric
          icon={ClipboardCheck}
          label="Assessed"
          value={`${overview.assessed_count} / ${overview.programme_target}`}
          description={formatPercentLabel(overview.completion_pct, 0)}
        />
        <KpiMetric
          icon={Gauge}
          label="Avg readiness"
          value={overview.avg_score != null ? formatPercentLabel(overview.avg_score, 0) : "—"}
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
          description={[
            overview.dla_total_responses != null
              ? `${overview.dla_total_responses} responses`
              : null,
            weakestDla ? `Weakest: Q${weakestDla.questionNumber} ${Math.round(weakestDla.correctRate)}%` : null,
          ]
            .filter((line): line is string => line != null)
            .join(" · ")}
        />
      </div>

      {dlaInsight ? (
        <Card className="mb-8 border-amber-200/60 bg-amber-50/40 shadow-none">
          <CardContent className="py-3 text-sm text-amber-950">
            <strong>Training priority:</strong> {dlaInsight}
          </CardContent>
        </Card>
      ) : null}

      <BlockerUnlockSummary
        blockers={overview.blocker_register ?? []}
        facilities={facilities}
      />

      {quickWinsClassic > 0 && (
        <div className="mb-8">
          <QuickWinsCard count={quickWinsClassic} />
        </div>
      )}

      {/* Charts — unchanged */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-1">
          <TierDonutCard
            tierCounts={filtered.tier_counts}
            onTierClick={(tier) => {
              const newTier = tier === selectedTier ? "" : tier
              handleTierChange(newTier)
            }}
            selectedTier={selectedTier}
          />
        </div>
        <div className="lg:col-span-2">
          <CountyBarCard
            counties={filtered.by_county}
            onCountyClick={(county) => {
              const newCounty = county === selectedCounty ? "" : county
              handleCountyChange(newCounty)
            }}
            selectedCounty={selectedCounty}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-8">
        <DomainBarCard
          domainAverages={overview.domain_averages}
          title="DRF domains (national avg)"
          description="0–3 scale · % of max shown in tooltip"
          maxScore={overview.domain_scale_max ?? 3}
        />
        <BlockerBarCard data={overview.blocker_register ?? []} facilities={facilities} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-1 mb-8">
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By cluster</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overview.by_cluster.map((c) => (
              <a
                key={c.cluster}
                href={`/facilities?cluster=${encodeURIComponent(c.cluster)}`}
                className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="text-sm font-medium">{c.cluster}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.region} · {c.facility_count} facilities
                  </p>
                </div>
                <p className="text-lg font-semibold tabular-nums">
                  {c.avg_score != null ? formatPercentLabel(c.avg_score, 0) : "—"}
                </p>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
