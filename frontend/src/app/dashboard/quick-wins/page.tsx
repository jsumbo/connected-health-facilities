import { getPublicFacilities, getPublicOverview } from "@/lib/public-api"
import { QuickWinsClient } from "@/components/public/quick-wins-client"
import { PageHeader } from "@/components/public/page-header"

export const metadata = {
  title: "Quick Wins | Dashboard",
}

export default async function QuickWinsPage() {
  let facilities: Awaited<ReturnType<typeof getPublicFacilities>>["items"] = []
  let error: string | null = null
  let assessedCount = 0
  let targetCount = 37

  try {
    const [result, overview] = await Promise.all([
      getPublicFacilities(),
      getPublicOverview().catch(() => null),
    ])
    facilities = result.items
    assessedCount = overview?.assessed_count ?? facilities.length
    targetCount = overview?.programme_target ?? result.total
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to load facility data"
  }

  return (
    <div>
      <PageHeader title="Quick Wins" assessed={assessedCount} target={targetCount} />

      {error ? (
        <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Error loading data:</strong> {error}
        </div>
      ) : (
        <QuickWinsClient facilities={facilities} />
      )}
    </div>
  )
}
