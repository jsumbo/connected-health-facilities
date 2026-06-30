import { getPublicOverview, getPublicFacilities } from "@/lib/public-api"
import { parseDashboardScope } from "@/lib/dashboard-scope"
import { buildBlockerRegister } from "@/lib/overview-stats"
import { BlockerBarCard } from "@/components/public/blocker-bar-chart"
import { BlockerClusterHeatmap } from "@/components/public/blocker-cluster-heatmap"
import { PageHeader } from "@/components/public/page-header"
import { unlockCountForBlocker, blockerShortLabel } from "@/lib/blockers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Blockers | Dashboard",
}

export default async function BlockersPage({
  searchParams,
}: {
  searchParams: Promise<{ facility_type?: string }>
}) {
  const sp = await searchParams
  const { facilityTypeQuery } = parseDashboardScope(sp)

  const [overview, facilitiesData] = await Promise.all([
    getPublicOverview(),
    getPublicFacilities(facilityTypeQuery),
  ])

  const facilities = facilitiesData.items || []
  const descriptionByCode = new Map(
    (overview.blocker_register ?? []).map((b) => [b.code, b.description])
  )
  const register = buildBlockerRegister(
    facilities.filter((f) => f.assessment_status === "complete"),
    descriptionByCode
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Blockers"
        assessed={overview.assessed_count}
        target={overview.programme_target}
      />

      <BlockerBarCard data={register} facilities={facilities} />

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Digital readiness by cluster</CardTitle>
          <p className="text-xs text-muted-foreground">
            Cluster = programme deployment region. Tier 3 blocker counts by cluster.
          </p>
        </CardHeader>
        <CardContent>
          <BlockerClusterHeatmap facilities={facilities} blockerRegister={register} />
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-base font-semibold">Single-blocker unlocks</h2>
        {register.map((blocker) => {
          const unlockCount = unlockCountForBlocker(facilities, blocker.code)
          return (
            <Card key={blocker.code} className="shadow-none">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold">
                    {blockerShortLabel(blocker.code, blocker.description)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {blocker.description}
                    <span className="ml-1 text-xs">({blocker.code})</span>
                  </p>
                </div>
                <p className="text-2xl font-bold tabular-nums text-emerald-600">{unlockCount}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
