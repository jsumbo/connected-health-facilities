import { cookies } from "next/headers";
import { getSummary, getFacilities } from "@/lib/api";
import { parseDashboardScope } from "@/lib/dashboard-scope";
import StatCard from "@/components/StatCard";
import ReadinessBadge from "@/components/ReadinessBadge";
import CountyChart from "@/components/charts/CountyChart";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ facility_type?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")!.value;
  const sp = await searchParams;
  const { facilityTypeQuery, facilityTypeLabel } = parseDashboardScope(sp);

  let summary = null;
  let recentItems: import("@/lib/types").FacilitySummary[] = [];
  let recentTotal = 0;
  let error = null;

  try {
    const [summaryData, recentPage] = await Promise.all([
      getSummary(token, facilityTypeQuery),
      getFacilities(token, { limit: 8, ...facilityTypeQuery }),
    ]);
    summary = summaryData;
    recentItems = recentPage.items;
    recentTotal = recentPage.total;
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to load data";
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Programme Overview</h1>
        <p className="text-slate-500 text-sm mt-1">
          Connected Facilities Baseline Assessment
          {facilityTypeLabel ? ` · ${facilityTypeLabel} only` : ""}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <strong>Error loading data:</strong> {error}. Check backend logs and <code>backend/.env</code> (Kobo + Supabase).
        </div>
      )}

      {summary && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Assessments Completed"
              value={`${summary.total_submissions} / ${summary.total_facilities}`}
              sub={`${summary.completion_pct}% complete`}
              color="teal"
            />
            <StatCard
              label="Average Readiness Score"
              value={summary.avg_score !== null ? `${summary.avg_score}%` : "—"}
              sub="Across all scored facilities"
              color="navy"
            />
            <StatCard
              label="Deployment Ready"
              value={summary.tier_counts["Deployment Ready"] ?? 0}
              sub="Facilities ≥ 80% score"
              color="green"
            />
            <StatCard
              label="Deployment Blocked"
              value={summary.blocked_count}
              sub="Critical infrastructure gaps"
              color="red"
            />
          </div>

          {/* Tier breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="font-semibold text-navy mb-4">Readiness Tier Breakdown</h2>
              <div className="space-y-3">
                {Object.entries(summary.tier_counts || {}).length > 0 ? (
                  Object.entries(summary.tier_counts).map(([tier, count]) => {
                    const colorMap: Record<string, string> = {
                      "Deployment Ready": "bg-ready",
                      "Foundational": "bg-foundational",
                      "Not Ready": "bg-notready",
                      "Blocked": "bg-blocked",
                      "Incomplete": "bg-slate-300",
                    };
                    const color = colorMap[tier] || "bg-slate-300";
                    const pct = summary.total_submissions > 0
                      ? Math.round((count / summary.total_submissions) * 100)
                      : 0;
                    return (
                      <div key={tier}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">{tier}</span>
                          <span className="text-slate-500">{count} facilities ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={`${color} h-2 rounded-full transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-400 text-sm py-4">No tier data available yet.</p>
                )}
              </div>
            </div>

            <CountyChart data={summary.by_county} />
          </div>

          {/* Recent submissions */}
          {recentItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-navy">Recent Assessments</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {recentItems.map((f, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">
                        {f.facility_name || "Unknown facility"}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {f.county} · {f.district}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-600">
                        {f.overall_score !== null ? `${f.overall_score}%` : "—"}
                      </span>
                      <ReadinessBadge tier={f.tier} />
                    </div>
                  </div>
                ))}
              </div>
              {recentTotal > 8 && (
                <div className="px-6 py-3 border-t border-slate-100">
                  <a href="/dashboard/facilities" className="text-teal text-sm font-medium hover:underline">
                    View all {recentTotal} facilities →
                  </a>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!summary && !error && (
        <div className="text-center py-24 text-slate-400">
          No data available. Ensure KoboToolbox credentials are configured and submissions exist.
        </div>
      )}
    </div>
  );
}
