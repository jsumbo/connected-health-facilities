import Link from "next/link";
import { getPublicFacilities } from "@/lib/public-api";
import type { BlockerItem, ProgrammeFacility } from "@/lib/types-public";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const QUICK_WIN_TIER = "Tier 3 — Not Deployment-Ready";

function getBlockerLabel(blocker: BlockerItem | string): string {
  if (typeof blocker === "string") return blocker;
  return blocker.remediation || blocker.code;
}

function isQuickWin(facility: ProgrammeFacility): boolean {
  return facility.tier === QUICK_WIN_TIER && facility.blockers.length === 1;
}

export default async function QuickWinsPage() {
  let facilities: ProgrammeFacility[] = [];
  let error: string | null = null;

  try {
    const result = await getPublicFacilities();
    facilities = result.items;
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to load facility data";
  }

  const quickWins = facilities.filter(isQuickWin);

  return (
    <div>
      {/* Page header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-navy mb-3">Quick Wins</h1>
        <p className="text-slate-600 text-base max-w-3xl leading-relaxed">
          Facilities in Tier 3 — Not Deployment-Ready with exactly one deployment blocker. Resolving a single issue would move each of these facilities closer to deployment eligibility.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <strong>Error loading data:</strong> {error}
        </div>
      )}

      {/* Count badge */}
      {!error && (
        <div className="mb-10">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-amber-100 border-2 border-amber-400">
            <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-lg font-bold">
              {quickWins.length}
            </span>
            <span className="text-amber-900 text-base font-semibold">
              {quickWins.length === 1
                ? "quick win identified"
                : "quick wins identified"}
            </span>
          </div>
        </div>
      )}

      {/* Facility cards */}
      {quickWins.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickWins.map((facility) => {
            const blocker = facility.blockers[0];
            const blockerLabel = blocker ? getBlockerLabel(blocker) : "Unknown blocker";
            const score =
              facility.overall_score !== null
                ? Math.round(facility.overall_score)
                : null;

            return (
              <Link
                key={facility.slug}
                href={`/facility/${facility.slug}`}
                className="group block"
              >
                <Card className="h-full border-2 transition-all hover:border-amber-400 hover:shadow-lg cursor-pointer bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg leading-tight group-hover:text-amber-600 transition-colors">
                      {facility.name}
                    </CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                      {facility.county}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-3 px-3 bg-slate-50 rounded-lg">
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Score
                      </span>
                      <span className="text-2xl font-bold text-slate-700">
                        {score !== null ? `${score}%` : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                        Blocking Issue
                      </span>
                      <p className="text-sm text-red-700 leading-snug font-medium bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
                        {blockerLabel}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        !error && (
          <div className="py-16 text-center">
            <p className="text-slate-500 text-base">
              No quick wins found. Either all Tier 3 facilities have multiple
              blockers, or no Tier 3 facilities have been assessed.
            </p>
          </div>
        )
      )}
    </div>
  );
}
