import { cookies } from "next/headers";
import { getFacilities } from "@/lib/api";
import { PaginatedFacilities } from "@/lib/types";
import ReadinessBadge from "@/components/ReadinessBadge";
import Link from "next/link";

const PAGE_SIZE = 50;

export default async function FacilitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ county?: string; tier?: string; blocked?: string; page?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")!.value;
  const sp = await searchParams;

  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  let result: PaginatedFacilities = { total: 0, limit: PAGE_SIZE, offset: 0, items: [] };
  let error = null;

  try {
    result = await getFacilities(token, {
      county: sp.county,
      tier: sp.tier,
      blocked: sp.blocked === "true" ? true : sp.blocked === "false" ? false : undefined,
      limit: PAGE_SIZE,
      offset,
    });
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to load";
  }

  const { items: facilities, total } = result;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const COUNTIES = [
    "Grand Cape Mount", "Grand Gedeh", "Lofa", "Margibi",
    "Maryland", "Montserrado", "Nimba", "River Cess", "River Gee",
  ];

  const TIERS = ["Deployment Ready", "Foundational", "Not Ready", "Blocked"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">All Facilities</h1>
        <p className="text-slate-500 text-sm mt-1">
          {total} submitted · 37 facilities
        </p>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3 mb-6">
        <select
          name="county"
          defaultValue={sp.county || ""}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal"
        >
          <option value="">All Counties</option>
          {COUNTIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          name="tier"
          defaultValue={sp.tier || ""}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal"
        >
          <option value="">All Tiers</option>
          {TIERS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          name="blocked"
          defaultValue={sp.blocked || ""}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal"
        >
          <option value="">All Status</option>
          <option value="true">Blocked only</option>
          <option value="false">Not blocked</option>
        </select>
        <button
          type="submit"
          className="px-5 py-2 bg-teal text-white rounded-lg text-sm font-medium hover:bg-teal-dark transition-colors"
        >
          Filter
        </button>
        <a href="/dashboard/facilities" className="px-5 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          Clear
        </a>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-6 py-3 font-semibold text-slate-600">Facility</th>
              <th className="px-4 py-3 font-semibold text-slate-600">County</th>
              <th className="px-4 py-3 font-semibold text-slate-600">District</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Score</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Tier</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Blockers</th>
              <th className="px-4 py-3 font-semibold text-slate-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {facilities.length === 0 && !error && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  No submissions found
                </td>
              </tr>
            )}
            {facilities.map((f, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">
                  {f.facility_name || "—"}
                </td>
                <td className="px-4 py-4 text-slate-600">{f.county || "—"}</td>
                <td className="px-4 py-4 text-slate-500 text-xs">{f.district || "—"}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">
                  {f.overall_score !== null ? `${f.overall_score}%` : "—"}
                </td>
                <td className="px-4 py-4">
                  <ReadinessBadge tier={f.tier} />
                </td>
                <td className="px-4 py-4">
                  {f.blockers.length > 0 ? (
                    <span className="text-notready text-xs font-medium">
                      {f.blockers.length} blocker{f.blockers.length > 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  {f.submission_id && (
                    <Link
                      href={`/dashboard/facility/${f.submission_id}`}
                      className="text-teal text-xs font-medium hover:underline"
                    >
                      View →
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
          <span>
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={{ query: { ...sp, page: page - 1 } }}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                ← Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={{ query: { ...sp, page: page + 1 } }}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
