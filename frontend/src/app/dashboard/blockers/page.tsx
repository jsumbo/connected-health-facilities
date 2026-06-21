import { getPublicOverview, getPublicFacilities } from "@/lib/public-api"
import { BlockerBarCard } from "@/components/public/blocker-bar-chart"
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Blockers</h1>
        <p className="text-muted-foreground">
          What holds facilities in Tier 3, and what clears it
        </p>
      </div>

      {/* Blocker Frequency */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Blocker frequency</h2>
        <p className="text-sm text-muted-foreground mb-4">
          How many facilities each prerequisite holds in Tier 3 (a facility can have several)
        </p>
        <BlockerBarCard data={overview.blocker_register ?? []} />
      </div>

      {/* Unlock Potential */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Facilities unlocked if a blocker is cleared</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tier 3 facilities where this is the only blocker — clearing it moves them out of Tier 3 immediately
        </p>

        <div className="space-y-2">
          {(overview.blocker_register ?? []).map((blocker) => {
            const unlockCount = facilities.filter(
              (f) =>
                f.tier === "Tier 3 — Not Deployment-Ready" &&
                f.blockers?.length === 1 &&
                (typeof f.blockers[0] === "string"
                  ? f.blockers[0] === blocker.code
                  : (f.blockers[0] as any)?.code === blocker.code)
            ).length

            return (
              <Card key={blocker.code} className="shadow-none">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold">{blocker.code}</p>
                    <p className="text-sm text-muted-foreground">{blocker.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">{unlockCount}</p>
                    <p className="text-xs text-muted-foreground">facilities</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
