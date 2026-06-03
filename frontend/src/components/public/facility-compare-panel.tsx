import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, Ban, Gauge, MapPin } from "lucide-react"
import type { ProgrammeFacility } from "@/lib/types-public"
import { TierBadge } from "@/components/public/tier-badge"
import { tierStyle } from "@/components/public/readiness-tier-styles"
import {
  formatFacilityChoice,
  formatMbps,
  formatPercent,
} from "@/lib/format-facility-value"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function scoreBarColor(score: number): string {
  if (score >= 75) return "bg-emerald-500"
  if (score >= 55) return "bg-sky-500"
  if (score >= 35) return "bg-amber-500"
  return "bg-rose-500"
}

function CompareScoreBar({ score, align }: { score: number; align: "left" | "right" }) {
  return (
    <div
      className={cn(
        "flex h-2 overflow-hidden rounded-full bg-muted",
        align === "right" && "flex-row-reverse"
      )}
    >
      <div
        className={cn("h-full rounded-full transition-all", scoreBarColor(score))}
        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
      />
    </div>
  )
}

function truncateName(name: string, maxLength = 32): string {
  if (name.length <= maxLength) return name
  return `${name.slice(0, maxLength - 1)}…`
}

function CompareFacilityHero({
  facility,
  column,
}: {
  facility: ProgrammeFacility
  column: "a" | "b"
}) {
  const tier = tierStyle(facility.tier)
  const location = [facility.county, facility.district, facility.facility_type]
    .filter(Boolean)
    .join(" · ")

  return (
    <Card
      className={cn(
        "shadow-none overflow-hidden",
        column === "a" ? "border-primary/25 bg-primary/[0.03]" : "border-border"
      )}
    >
      <CardContent className="pt-5">
        <Link
          href={`/facility/${facility.slug}`}
          className="block font-serif text-lg font-semibold leading-snug text-foreground hover:text-primary"
        >
          {facility.name}
        </Link>
        <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{location}</span>
        </p>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Readiness
            </p>
            <p className="mt-0.5 text-4xl font-semibold tabular-nums tracking-tight">
              {facility.overall_score != null ? `${facility.overall_score}%` : "—"}
            </p>
          </div>
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-lg border",
              tier.bg,
              tier.border,
              tier.text
            )}
          >
            <Gauge className="size-5" strokeWidth={2} aria-hidden />
          </div>
        </div>
        <div className="mt-3">
          <TierBadge tier={facility.tier} />
        </div>
      </CardContent>
    </Card>
  )
}

function CompareRow({
  label,
  nameA,
  nameB,
  valueA,
  valueB,
  highlightDiff = true,
}: {
  label: string
  nameA: string
  nameB: string
  valueA: string
  valueB: string
  highlightDiff?: boolean
}) {
  const differs = highlightDiff && valueA !== valueB && valueA !== "—" && valueB !== "—"

  return (
    <div className="grid grid-cols-1 border-b border-border/80 last:border-0 sm:grid-cols-[minmax(7rem,11rem)_1fr_1fr]">
      <div className="bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground sm:py-3.5">
        {label}
      </div>
      <div
        className={cn(
          "border-t border-border/60 px-4 py-3 text-sm sm:border-t-0 sm:border-l sm:py-3.5",
          differs && "bg-primary/[0.04]"
        )}
      >
        <span
          className="mb-0.5 block truncate text-xs font-medium text-muted-foreground sm:hidden"
          title={nameA}
        >
          {truncateName(nameA, 40)}
        </span>
        <span className="font-medium leading-snug">{valueA}</span>
      </div>
      <div
        className={cn(
          "border-t border-border/60 px-4 py-3 text-sm sm:border-l sm:py-3.5",
          differs && "bg-primary/[0.04]"
        )}
      >
        <span
          className="mb-0.5 block truncate text-xs font-medium text-muted-foreground sm:hidden"
          title={nameB}
        >
          {truncateName(nameB, 40)}
        </span>
        <span className="font-medium leading-snug">{valueB}</span>
      </div>
    </div>
  )
}

function CompareSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Card className="shadow-none overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/20 py-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  )
}

function getDomainEntries(facility: ProgrammeFacility): { label: string; score: number }[] {
  return Object.values(facility.domain_scores)
    .filter(
      (d): d is { label: string; score: number | null } =>
        Boolean(d && typeof d === "object" && "label" in d && d.label)
    )
    .filter((d) => d.score != null)
    .map((d) => ({ label: d.label, score: d.score as number }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

interface FacilityComparePanelProps {
  facilityA: ProgrammeFacility
  facilityB: ProgrammeFacility
}

export function FacilityComparePanel({ facilityA, facilityB }: FacilityComparePanelProps) {
  const nameA = facilityA.name
  const nameB = facilityB.name

  const domainLabels = new Set<string>()
  for (const f of [facilityA, facilityB]) {
    for (const d of getDomainEntries(f)) {
      domainLabels.add(d.label)
    }
  }
  const sortedDomains = [...domainLabels].sort()

  const scoreA = facilityA.overall_score
  const scoreB = facilityB.overall_score
  const scoreLead =
    scoreA != null && scoreB != null && scoreA !== scoreB
      ? scoreA > scoreB
        ? facilityA.name
        : facilityB.name
      : null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CompareFacilityHero facility={facilityA} column="a" />
        <CompareFacilityHero facility={facilityB} column="b" />
      </div>

      {scoreLead && scoreA != null && scoreB != null ? (
        <p className="text-center text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{scoreLead}</span> leads on readiness by{" "}
          <span className="tabular-nums font-medium text-foreground">
            {Math.abs(scoreA - scoreB).toFixed(1)} pts
          </span>
        </p>
      ) : null}

      {(facilityA.blockers.length > 0 || facilityB.blockers.length > 0) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[facilityA, facilityB].map((facility) => (
            <Card
              key={facility.slug}
              className={cn(
                "shadow-none",
                facility.blockers.length > 0
                  ? "border-destructive/30 bg-destructive/[0.03]"
                  : "border-border bg-muted/10"
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Ban
                    className={cn(
                      "size-4",
                      facility.blockers.length > 0 ? "text-destructive" : "text-muted-foreground"
                    )}
                    aria-hidden
                  />
                  Blockers · {facility.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {facility.blockers.length > 0 ? (
                  <ul className="space-y-1.5 text-sm text-destructive/90">
                    {facility.blockers.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="text-destructive/50">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No deployment blockers</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CompareSection title="Domain scores">
        <div className="hidden border-b border-border bg-muted/30 px-4 py-2 sm:grid sm:grid-cols-[minmax(7rem,11rem)_1fr_1fr]">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Domain
          </span>
          <span
            className="truncate text-xs font-medium text-foreground sm:border-l sm:border-border/60 sm:pl-4"
            title={nameA}
          >
            {truncateName(nameA, 36)}
          </span>
          <span
            className="truncate text-xs font-medium text-foreground sm:border-l sm:border-border/60 sm:pl-4"
            title={nameB}
          >
            {truncateName(nameB, 36)}
          </span>
        </div>
        {sortedDomains.map((label) => {
          const scoreAVal =
            getDomainEntries(facilityA).find((d) => d.label === label)?.score ?? null
          const scoreBVal =
            getDomainEntries(facilityB).find((d) => d.label === label)?.score ?? null

          return (
            <div
              key={label}
              className="grid grid-cols-1 gap-3 border-b border-border/80 px-4 py-4 last:border-0 sm:grid-cols-[minmax(7rem,11rem)_1fr_1fr] sm:items-center sm:gap-4"
            >
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <div className="space-y-1.5 sm:border-l sm:border-border/60 sm:pl-4">
                <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
                  <span className="truncate text-muted-foreground sm:hidden" title={nameA}>
                    {truncateName(nameA, 28)}
                  </span>
                  <span className="font-semibold">
                    {scoreAVal != null ? `${scoreAVal}%` : "—"}
                  </span>
                </div>
                {scoreAVal != null ? (
                  <CompareScoreBar score={scoreAVal} align="left" />
                ) : (
                  <div className="h-2 rounded-full bg-muted" />
                )}
              </div>
              <div className="space-y-1.5 sm:border-l sm:border-border/60 sm:pl-4">
                <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
                  <span className="truncate text-muted-foreground sm:hidden" title={nameB}>
                    {truncateName(nameB, 28)}
                  </span>
                  <span className="font-semibold">
                    {scoreBVal != null ? `${scoreBVal}%` : "—"}
                  </span>
                </div>
                {scoreBVal != null ? (
                  <CompareScoreBar score={scoreBVal} align="right" />
                ) : (
                  <div className="h-2 rounded-full bg-muted" />
                )}
              </div>
            </div>
          )
        })}
      </CompareSection>

      <CompareSection title="Infrastructure & connectivity">
        <CompareRow
          nameA={nameA}
          nameB={nameB}
          label="Internet"
          valueA={formatFacilityChoice(facilityA.internet_type)}
          valueB={formatFacilityChoice(facilityB.internet_type)}
        />
        <CompareRow
          nameA={nameA}
          nameB={nameB}
          label="Uptime"
          valueA={formatPercent(facilityA.internet_uptime)}
          valueB={formatPercent(facilityB.internet_uptime)}
        />
        <CompareRow
          nameA={nameA}
          nameB={nameB}
          label="Download"
          valueA={formatMbps(facilityA.download_mbps)}
          valueB={formatMbps(facilityB.download_mbps)}
        />
        <CompareRow
          nameA={nameA}
          nameB={nameB}
          label="Upload"
          valueA={formatMbps(facilityA.upload_mbps)}
          valueB={formatMbps(facilityB.upload_mbps)}
        />
        <CompareRow
          nameA={nameA}
          nameB={nameB}
          label="Primary power"
          valueA={formatFacilityChoice(facilityA.primary_power)}
          valueB={formatFacilityChoice(facilityB.primary_power)}
        />
        <CompareRow
          nameA={nameA}
          nameB={nameB}
          label="Backup power"
          valueA={formatFacilityChoice(facilityA.backup_power)}
          valueB={formatFacilityChoice(facilityB.backup_power)}
        />
        <CompareRow
          nameA={nameA}
          nameB={nameB}
          label="Devices"
          valueA={`${facilityA.laptops ?? 0} laptops · ${facilityA.desktops ?? 0} desktops · ${facilityA.tablets ?? 0} tablets · ${facilityA.phones ?? 0} phones`}
          valueB={`${facilityB.laptops ?? 0} laptops · ${facilityB.desktops ?? 0} desktops · ${facilityB.tablets ?? 0} tablets · ${facilityB.phones ?? 0} phones`}
        />
        <CompareRow
          nameA={nameA}
          nameB={nameB}
          label="Data completeness"
          valueA={`${facilityA.completeness_pct}%`}
          valueB={`${facilityB.completeness_pct}%`}
        />
      </CompareSection>

      <CompareSection title="Staff surveys">
        <CompareRow
          nameA={nameA}
          nameB={nameB}
          label="Staff enthusiasm"
          valueA={
            facilityA.sentiment_avg_enthusiasm != null
              ? `${facilityA.sentiment_avg_enthusiasm}/10`
              : "—"
          }
          valueB={
            facilityB.sentiment_avg_enthusiasm != null
              ? `${facilityB.sentiment_avg_enthusiasm}/10`
              : "—"
          }
        />
        <CompareRow
          nameA={nameA}
          nameB={nameB}
          label="Sentiment responses"
          valueA={
            facilityA.sentiment_response_count != null
              ? String(facilityA.sentiment_response_count)
              : "—"
          }
          valueB={
            facilityB.sentiment_response_count != null
              ? String(facilityB.sentiment_response_count)
              : "—"
          }
        />
        <CompareRow
          nameA={nameA}
          nameB={nameB}
          label="DLA avg score"
          valueA={facilityA.dla_avg_score != null ? `${facilityA.dla_avg_score}/100` : "—"}
          valueB={facilityB.dla_avg_score != null ? `${facilityB.dla_avg_score}/100` : "—"}
        />
        <CompareRow
          nameA={nameA}
          nameB={nameB}
          label="DLA responses"
          valueA={
            facilityA.dla_response_count != null ? String(facilityA.dla_response_count) : "—"
          }
          valueB={
            facilityB.dla_response_count != null ? String(facilityB.dla_response_count) : "—"
          }
        />
      </CompareSection>

      <div className="flex flex-wrap justify-center gap-4 pt-2">
        <Link
          href={`/facility/${facilityA.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-2"
        >
          View {facilityA.name}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
        <Link
          href={`/facility/${facilityB.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-2"
        >
          View {facilityB.name}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  )
}
