import { cookies } from "next/headers";
import { getAnalytics } from "@/lib/api";
import { parseDashboardScope } from "@/lib/dashboard-scope";
import { AnalyticsSummary } from "@/lib/types";
import DonutChart from "@/components/charts/DonutChart";
import ReadinessBadge from "@/components/ReadinessBadge";
import Link from "next/link";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ facility_type?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")!.value;
  const sp = await searchParams;
  const { facilityTypeQuery, facilityTypeLabel } = parseDashboardScope(sp);

  let data: AnalyticsSummary | null = null;
  let error: string | null = null;

  try {
    data = await getAnalytics(token, facilityTypeQuery);
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to load";
  }

  const progress = data?.progress;
  const totalFacilities = progress?.total_facilities ?? 37;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Deployment Progress</h1>
        <p className="text-slate-500 text-sm mt-1">
          Assessment completion by county, facilities near tier thresholds, and recording readiness
          {facilityTypeLabel ? ` · ${facilityTypeLabel} only` : ""}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* County completion */}
          <h2 className="text-base font-semibold text-navy mb-4">Submissions by County</h2>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-8">
            <div className="space-y-3">
              {(progress?.county_submissions ?? []).map(({ county, submitted }) => {
                const pct = Math.round((submitted / totalFacilities) * 100);
                return (
                  <div key={county}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{county}</span>
                      <span className="text-slate-500">{submitted} submitted</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-teal h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-4">
              {progress?.total_submissions ?? 0} of {totalFacilities} total facilities assessed
            </p>
          </div>

          {/* Near threshold + recording methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Near threshold */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-navy text-sm">Near Tier Threshold</h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Facilities within 5 points of upgrading to a higher tier
                </p>
              </div>
              {(progress?.near_threshold ?? []).length === 0 ? (
                <p className="px-6 py-8 text-slate-400 text-sm text-center">
                  No facilities near a threshold right now
                </p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {(progress?.near_threshold ?? []).map((f, i) => (
                    <div key={i} className="px-6 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">
                          {f.facility_name || "Unknown"}
                        </p>
                        <p className="text-slate-400 text-xs mt-0.5">{f.county}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-700">
                            {f.overall_score}%
                          </p>
                          <p className="text-xs text-slate-400">
                            +{f.points_to_next}pts → {f.next_tier}
                          </p>
                        </div>
                        <ReadinessBadge tier={f.tier as import("@/lib/types").Tier} />
                        {f.submission_id && (
                          <Link
                            href={`/dashboard/facility/${f.submission_id}`}
                            className="text-teal text-xs font-medium hover:underline"
                          >
                            View →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recording methods donut */}
            <DonutChart
              title="Health Records Method"
              data={progress?.recording_methods ?? []}
            />
          </div>
        </>
      )}

      {!data && !error && (
        <div className="text-center py-24 text-slate-400">No data available.</div>
      )}
    </div>
  );
}
