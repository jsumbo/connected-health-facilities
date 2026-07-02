"use client"

import { useMemo, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import type { PublicOverview, ProgrammeFacility, QuestionStat } from "@/lib/types-public"
import { FACILITY_TYPE_FILTER_OPTIONS, normalizeFacilityType } from "@/lib/facility-types"
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
  Zap,
} from "lucide-react"
import { TIER_FILTER_OPTIONS, facilityMatchesTierFilter } from "@/lib/readiness-tiers"
import { clusterSortIndex, CLUSTER_DEFINITION } from "@/lib/clusters"
import {
  buildBlockerChartNote,
  buildCountyChartNote,
  buildDomainChartNote,
  buildOverviewHeadlineNote,
  buildTierChartNote,
} from "@/lib/dashboard-notes"
import { computeScopedOverviewMetrics } from "@/lib/overview-stats"
import { PageInsightBanner } from "@/components/public/page-insight-banner"
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
  const [selectedFacilityType, setSelectedFacilityType] = useState<string>("")

  useEffect(() => {
    const county = searchParams.get("county") || ""
    const tier = searchParams.get("tier") || ""
    const facilityType = searchParams.get("facility_type") || ""
    setSelectedCounty(county)
    setSelectedTier(tier)
    setSelectedFacilityType(facilityType)
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

  const handleFacilityTypeChange = (facilityType: string) => {
    setSelectedFacilityType(facilityType)
    const params = new URLSearchParams()
    if (selectedCounty) params.set("county", selectedCounty)
    if (selectedTier) params.set("tier", selectedTier)
    if (facilityType) params.set("facility_type", facilityType)
    router.push(`?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSelectedCounty("")
    setSelectedTier("")
    setSelectedFacilityType("")
    router.push("?")
  }

  const metrics = useMemo(
    () =>
      computeScopedOverviewMetrics(facilities, overview, {
        county: selectedCounty || undefined,
        tier: selectedTier || undefined,
        facilityType: selectedFacilityType || undefined,
      }),
    [facilities, overview, selectedCounty, selectedTier, selectedFacilityType]
  )

  const filtered = useMemo(() => {
    let result = { ...overview, tier_counts: metrics.tier_counts }

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
          Object.entries(metrics.tier_counts).filter(([tier]) =>
            facilityMatchesTierFilter(tier, selectedTier)
          )
        ),
      }
    }

    return result
  }, [overview, selectedCounty, selectedTier, metrics.tier_counts])

  const weakestDla = [...dlaQuestions].sort((a, b) => a.correctRate - b.correctRate)[0]

  const headlineNote = buildOverviewHeadlineNote(
    overview,
    metrics.quickWinsExpanded,
    metrics.tier1Count,
    metrics.blocked_count
  )
  const tierNote = buildTierChartNote(filtered.tier_counts)
  const countyNote = buildCountyChartNote(filtered.by_county)
  const domainNote = buildDomainChartNote(metrics.domain_averages, metrics.isScoped)
  const blockerNote = buildBlockerChartNote(metrics.blocker_register, metrics.scopedFacilities)

  const tiers = TIER_FILTER_OPTIONS

  const selectClassName =
    "h-9 min-w-[12rem] rounded-lg border border-input bg-card px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

  const facilitiesHref = (tier?: string) => {
    const params = new URLSearchParams()
    if (selectedCounty) params.set("county", selectedCounty)
    if (tier) params.set("tier", tier)
    const query = params.toString()
    return query ? `/facilities?${query}` : "/facilities"
  }

  return (
    <>
      {!metrics.isScoped ? <PageInsightBanner insight={headlineNote} /> : null}

      <ActiveFilterChips
        county={selectedCounty || undefined}
        tier={selectedTier || undefined}
        facilityType={selectedFacilityType || undefined}
        onClearCounty={() => handleCountyChange("")}
        onClearTier={() => handleTierChange("")}
        onClearFacilityType={() => handleFacilityTypeChange("")}
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
            className={`${selectClassName} min-w-[20rem]`}
          >
            {tiers.map((tier) => (
              <option key={tier.label} value={tier.value}>
                {tier.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="facility-type-filter" className="text-xs font-medium text-muted-foreground">
            Facility type
          </label>
          <select
            id="facility-type-filter"
            value={selectedFacilityType}
            onChange={(e) => handleFacilityTypeChange(e.target.value)}
            className={selectClassName}
          >
            {FACILITY_TYPE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {(selectedCounty || selectedTier || selectedFacilityType) && (
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
      <div className="mb-4 grid grid-cols-2 items-stretch gap-3 md:grid-cols-3 lg:grid-cols-5">
        <KpiMetric
          icon={ShieldCheck}
          label="Tier 1"
          value={metrics.tier1Count}
          description="HOS-Ready"
          href={facilitiesHref("Tier 1 — HOS-Ready")}
          linkLabel="View Tier 1 facilities"
        />
        <KpiMetric
          icon={Zap}
          label="Quick wins"
          value={metrics.quickWinsExpanded}
          description={`1 blocker · ≥65%${metrics.quickWinsClassic !== metrics.quickWinsExpanded ? ` (${metrics.quickWinsClassic} total)` : ""}`}
          href="/quick-wins"
          linkLabel="View quick wins"
        />
        <KpiMetric
          icon={Target}
          label="Tier 2"
          value={metrics.deploymentEligible + metrics.structuredRemediation}
          description="Deployment-eligible · no blockers"
          href={facilitiesHref("tier-2")}
          linkLabel="View Tier 2 facilities"
        />
        <KpiMetric
          icon={Ban}
          label="Tier 3 blocked"
          value={metrics.blocked_count}
          description="Tier 3 · blockers"
          href="/blockers"
          linkLabel="View deployment blockers"
        />
        <KpiMetric
          icon={Gauge}
          label="Weakest domain"
          value={metrics.weakestDomain ? metrics.weakestDomain.label.split(" ")[0] : "—"}
          description={
            metrics.weakestDomain
              ? `${formatAxisTick(metrics.weakestDomain.value, 2)}/3 avg`
              : undefined
          }
          href="#drf-domains"
          linkLabel="Jump to domain scores"
        />
      </div>

      {/* Secondary KPIs — preserved from original overview */}
      <div className="mb-8 grid grid-cols-2 items-stretch gap-3 sm:grid-cols-4">
        <KpiMetric
          icon={ClipboardCheck}
          label="Assessed"
          value={metrics.assessedDisplay}
          description={metrics.assessedDescription ?? "Facilities complete"}
          href={facilitiesHref()}
          linkLabel="View all facilities"
        />
        <KpiMetric
          icon={Gauge}
          label="Avg readiness"
          value={metrics.avg_score != null ? formatPercentLabel(metrics.avg_score, 0) : "—"}
          description="National composite"
          href={facilitiesHref()}
          linkLabel="View facilities by readiness"
        />
        <KpiMetric
          icon={MessageSquareHeart}
          label="Staff sentiment"
          value={
            metrics.sentiment_avg != null
              ? `${formatAxisTick(metrics.sentiment_avg, 2)}/10`
              : "—"
          }
          description={
            metrics.sentiment_responses != null
              ? `${metrics.sentiment_responses} responses`
              : "Survey average"
          }
          href="/sentiment"
          linkLabel="View staff sentiment"
        />
        <KpiMetric
          icon={GraduationCap}
          label="Digital literacy"
          value={
            metrics.dla_avg != null ? `${formatAxisTick(metrics.dla_avg, 1)}/100` : "—"
          }
          description={[
            metrics.dla_responses != null ? `${metrics.dla_responses} responses` : "Assessment average",
            !metrics.isScoped && weakestDla
              ? `Weakest · Q${weakestDla.questionNumber} ${Math.round(weakestDla.correctRate)}%`
              : null,
          ].filter((line): line is string => line != null)}
          href="/dla"
          linkLabel="View digital literacy assessment"
        />
      </div>

      <BlockerUnlockSummary
        blockers={metrics.blocker_register}
        facilities={metrics.scopedFacilities}
      />

      {metrics.quickWinsClassic > 0 && (
        <div className="mb-8">
          <QuickWinsCard count={metrics.quickWinsClassic} />
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
            note={tierNote}
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
            note={countyNote}
          />
        </div>
      </div>

      <div id="drf-domains" className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-8 scroll-mt-24">
        <DomainBarCard
          domainAverages={metrics.domain_averages}
          title={
            metrics.isScoped
              ? `DRF domains (${selectedCounty || selectedTier || "filtered"})`
              : "DRF domains (national avg)"
          }
          description="0–3 scale · % of max shown in tooltip"
          maxScore={overview.domain_scale_max ?? 3}
          note={domainNote}
        />
        <BlockerBarCard
          data={metrics.blocker_register}
          facilities={metrics.scopedFacilities}
          note={blockerNote}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-1 mb-8">
        <Card className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Digital readiness by cluster</CardTitle>
            <p className="text-xs text-muted-foreground">{CLUSTER_DEFINITION}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...overview.by_cluster]
              .sort((a, b) => clusterSortIndex(a.cluster) - clusterSortIndex(b.cluster))
              .map((c) => (
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
