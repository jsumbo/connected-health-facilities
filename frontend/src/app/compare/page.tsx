import type { Metadata } from "next"
import { Suspense } from "react"
import { pageMetadata } from "@/lib/site-metadata"
import { ErrorBanner } from "@/components/public/error-banner"
import { FacilityComparePanel } from "@/components/public/facility-compare-panel"
import { FacilityComparePicker } from "@/components/public/facility-compare-picker"
import { PublicShell } from "@/components/public/PublicShell"
import { getPublicFacilities, getPublicFacility } from "@/lib/public-api"
import { computeCompareBenchmarks } from "@/lib/compare-benchmarks"
import { ChartNote } from "@/components/public/chart-note"
import { buildComparePanelNote } from "@/lib/dashboard-notes"

export const metadata: Metadata = pageMetadata({
  title: "Compare facilities",
  description:
    "Side-by-side comparison of domain scores, blockers, and readiness metrics for two facilities.",
  path: "/compare",
})

interface ComparePageProps {
  searchParams: Promise<{ a?: string; b?: string }>
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const sp = await searchParams
  const slugA = sp.a?.trim() || ""
  const slugB = sp.b?.trim() || ""

  let facilities: Awaited<ReturnType<typeof getPublicFacilities>>["items"] = []
  let facilityA = null
  let facilityB = null
  let error: string | null = null

  try {
    const page = await getPublicFacilities()
    facilities = page.items

    if (slugA && slugB && slugA !== slugB) {
      const [a, b] = await Promise.all([
        getPublicFacility(slugA).catch(() => null),
        getPublicFacility(slugB).catch(() => null),
      ])
      facilityA = a
      facilityB = b
      if (!facilityA || !facilityB) {
        error = "One or both facilities could not be loaded."
      } else if (
        facilityA.assessment_status !== "complete" ||
        facilityB.assessment_status !== "complete"
      ) {
        error = "Both facilities must have a completed baseline assessment."
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load facilities"
  }

  const canCompare = Boolean(facilityA && facilityB && !error)

  const pickerLabelA =
    facilityA?.name ?? facilities.find((f) => f.slug === slugA)?.name
  const pickerLabelB =
    facilityB?.name ?? facilities.find((f) => f.slug === slugB)?.name

  return (
    <PublicShell title="Compare">
      <div className="space-y-6">
        {error && <ErrorBanner message={error} />}

        <Suspense fallback={null}>
          <FacilityComparePicker
            facilities={facilities}
            currentA={slugA}
            currentB={slugB}
            labelA={pickerLabelA}
            labelB={pickerLabelB}
          />
        </Suspense>

        {slugA && slugB && slugA === slugB && (
          <p className="rounded-lg border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-sm text-amber-950">
            Choose two different facilities to compare.
          </p>
        )}

        {!slugA || !slugB ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">Select two facilities</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Compare readiness scores, domain breakdowns, infrastructure, blockers, and survey
              results in one view.
            </p>
          </div>
        ) : null}

        {canCompare && facilityA && facilityB && (
          <>
            <FacilityComparePanel
              facilityA={facilityA}
              facilityB={facilityB}
              benchmarksA={computeCompareBenchmarks(facilityA, facilities)}
              benchmarksB={computeCompareBenchmarks(facilityB, facilities)}
            />
            <ChartNote>{buildComparePanelNote()}</ChartNote>
          </>
        )}
      </div>
    </PublicShell>
  )
}
