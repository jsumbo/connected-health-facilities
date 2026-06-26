import { cookies } from "next/headers";
import { getAnalytics } from "@/lib/api";
import { parseDashboardScope } from "@/lib/dashboard-scope";
import { AnalyticsSummary } from "@/lib/types";
import StatCard from "@/components/StatCard";
import DonutChart from "@/components/charts/DonutChart";

export default async function InfrastructurePage({
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

  const conn = data?.connectivity;
  const power = data?.power;
  const devices = data?.devices;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Infrastructure Overview</h1>
        <p className="text-slate-500 text-sm mt-1">
          Connectivity, power, and device readiness across all facilities
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
          {/* Connectivity */}
          <h2 className="text-base font-semibold text-navy mb-4">Connectivity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              label="Avg Download Speed"
              value={conn?.avg_download_mbps != null ? `${conn.avg_download_mbps} Mbps` : "—"}
              sub="Across facilities with speed data"
              color="teal"
            />
            <StatCard
              label="Avg Upload Speed"
              value={conn?.avg_upload_mbps != null ? `${conn.avg_upload_mbps} Mbps` : "—"}
              sub="Across facilities with speed data"
              color="navy"
            />
            <StatCard
              label="Facilities with Speed Data"
              value={conn?.facilities_with_data ?? 0}
              sub="Speed tests recorded"
              color="green"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <DonutChart
              title="Internet Type Distribution"
              data={conn?.internet_type_distribution ?? []}
            />
            <DonutChart
              title="Internet Uptime Distribution"
              data={conn?.uptime_distribution ?? []}
            />
          </div>

          {/* Power */}
          <h2 className="text-base font-semibold text-navy mb-4">Power Infrastructure</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <DonutChart
              title="Primary Power Source"
              data={power?.primary_power_distribution ?? []}
            />
            <DonutChart
              title="Backup Power Systems"
              data={power?.backup_power_distribution ?? []}
            />
            <DonutChart
              title="UPS Coverage"
              data={power?.ups_coverage_distribution ?? []}
            />
          </div>

          {/* Devices */}
          <h2 className="text-base font-semibold text-navy mb-4">Device Inventory</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {(["laptops", "desktops", "tablets", "phones"] as const).map((type) => (
              <StatCard
                key={type}
                label={type.charAt(0).toUpperCase() + type.slice(1)}
                value={devices?.totals[type] ?? 0}
                sub={`Avg ${devices?.avg_per_facility[type] ?? 0} per facility`}
                color="navy"
              />
            ))}
          </div>
          <p className="text-slate-400 text-xs mb-10">
            {devices?.facilities_with_devices ?? 0} of {data.progress.total_submissions} submitted facilities reported functional devices.
          </p>
        </>
      )}

      {!data && !error && (
        <div className="text-center py-24 text-slate-400">No data available.</div>
      )}
    </div>
  );
}
