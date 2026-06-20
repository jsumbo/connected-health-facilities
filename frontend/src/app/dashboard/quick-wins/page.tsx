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
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Quick Wins</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          Facilities in Tier 3 — Not Deployment-Ready with exactly one deployment
          blocker. Resolving a single issue would move each of these facilities
          closer to deployment eligibility.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <strong>Error loading data:</strong> {error}
        </div>
      )}

      {/* Count badge */}
      {!error && (
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
              {quickWins.length}
            </span>
            {quickWins.length === 1
              ? "quick win identified"
              : "quick wins identified"}
          </span>
        </div>
      )}

      {/* Facility cards */}
      {quickWins.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickWins.map((facility) => {
            const blocker = facility.blockers[0];
            const blockerLabel = blocker ? getBlockerLabel(blocker) : "Unknown blocker";
            const score =
              facility.overall_score !== null
                ? `${facility.overall_score}%`
                : "—";

            return (
              <Link
                key={facility.slug}
                href={`/facility/${facility.slug}`}
                className="group block"
              >
                <Card className="h-full transition-colors hover:border-foreground/50 cursor-pointer">
                  <CardHeader className="border-b">
                    <CardTitle className="text-base leading-tight">
                      {facility.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {facility.county}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                        Score
                      </span>
                      <span className="text-sm font-semibold text-slate-700">
                        {score}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wide font-medium block mb-1">
                        Blocking issue
                      </span>
                      <p className="text-sm text-red-600 leading-snug">
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
          <div className="py-24 text-center">
            <p className="text-slate-400 text-sm">
              No quick wins found. Either all Tier 3 facilities have multiple
              blockers, or no Tier 3 facilities have been assessed.
            </p>
          </div>
        )
      )}
    </div>
  );
}
