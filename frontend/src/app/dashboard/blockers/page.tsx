import { getPublicOverview, getPublicFacilities } from "@/lib/public-api"
import { BlockerBarCard } from "@/components/public/blocker-bar-chart"
import { BlockerClusterHeatmap } from "@/components/public/blocker-cluster-heatmap"
import { PageHeader } from "@/components/public/page-header"
import { unlockCountForBlocker } from "@/lib/blockers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Blockers | Dashboard",
}

export default async function BlockersPage() {
  const [overview, facilitiesData] = await Promise.all([
    getPublicOverview(),
    getPublicFacilities(),
  ])

  const facilities = facilitiesData.items || []
  const register = overview.blocker_register ?? []

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
          <CardTitle className="text-base">By cluster</CardTitle>
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
                  <p className="font-semibold">{blocker.code}</p>
                  <p className="text-sm text-muted-foreground">{blocker.description}</p>
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
