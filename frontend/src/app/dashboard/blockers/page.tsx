import { getPublicOverview, getPublicFacilities } from "@/lib/public-api"
import { parseDashboardScope } from "@/lib/dashboard-scope"
import { buildBlockerRegister } from "@/lib/overview-stats"
import { BlockerBarCard } from "@/components/public/blocker-bar-chart"
import { BlockerClusterHeatmap } from "@/components/public/blocker-cluster-heatmap"
import { SingleBlockerUnlocksList } from "@/components/public/single-blocker-unlocks-list"
import { PageHeader } from "@/components/public/page-header"
import { CLUSTER_DEFINITION } from "@/lib/clusters"
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
            {CLUSTER_DEFINITION}. Tier 3 blocker counts by cluster.
          </p>
        </CardHeader>
        <CardContent>
          <BlockerClusterHeatmap facilities={facilities} blockerRegister={register} />
        </CardContent>
      </Card>

      <SingleBlockerUnlocksList register={register} facilities={facilities} />
    </div>
  )
}
