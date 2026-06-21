import type { Metadata } from "next"
import { pageMetadata } from "@/lib/site-metadata"
import { BlockerBarCard } from "@/components/public/blocker-bar-chart"
import { BlockerClusterHeatmap } from "@/components/public/blocker-cluster-heatmap"
import { ErrorBanner } from "@/components/public/error-banner"
import { PublicShell } from "@/components/public/PublicShell"
import { unlockCountForBlocker } from "@/lib/blockers"
import { getPublicOverview, getPublicFacilities } from "@/lib/public-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = pageMetadata({
  title: "Blockers",
  description: "Deployment blockers holding facilities in Tier 3.",
  path: "/blockers",
})

export default async function BlockersPage() {
  let overview: Awaited<ReturnType<typeof getPublicOverview>> | null = null
  let facilities: Awaited<ReturnType<typeof getPublicFacilities>>["items"] = []
  let error: string | null = null

  try {
    const [overviewData, facilitiesData] = await Promise.all([
      getPublicOverview(),
      getPublicFacilities(),
    ])
    overview = overviewData
    facilities = facilitiesData.items
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to load blocker data"
  }

  const register = overview?.blocker_register ?? []

  return (
    <PublicShell
      title="Blockers"
      assessed={overview?.assessed_count}
      target={overview?.programme_target}
    >
      {error ? <ErrorBanner message={error} /> : null}

      {!error && overview ? (
        <div className="space-y-8">
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
      ) : null}
    </PublicShell>
  )
}
