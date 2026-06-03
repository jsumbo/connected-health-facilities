import { cookies } from "next/headers";
import { getFacility } from "@/lib/api";
import ReadinessBadge from "@/components/ReadinessBadge";
import DomainScoreCard from "@/components/DomainScoreCard";
import Link from "next/link";

function fmt(raw: string | null | undefined): string {
  if (!raw) return "—";
  return raw
    .replace(/___/g, "/")
    .replace(/__/g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Emr", "EMR")
    .replace("Ups", "UPS")
    .replace("Isp", "ISP")
    .replace("4G Lte", "4G LTE");
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Detail({ label, value, warn }: { label: string; value?: string | null; warn?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`font-semibold text-sm ${warn ? "text-red-600" : "text-slate-800"}`}>
        {value || "—"}
      </p>
    </div>
  );
}

export default async function FacilityDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")!.value;
  const { name } = await params;

  let facility = null;
  let error = null;

  try {
    facility = await getFacility(token, name);
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to load";
  }

  if (error || !facility) {
    return (
      <div className="py-12 text-center">
        <Link href="/dashboard/facilities" className="text-teal text-sm hover:underline">
          ← Back to facilities
        </Link>
        <p className="text-red-600 mt-6">{error || "Facility not found"}</p>
      </div>
    );
  }

  const totalDevices =
    (facility.laptops ?? 0) +
    (facility.desktops ?? 0) +
    (facility.tablets ?? 0) +
    (facility.phones ?? 0);

  const domainList = Object.entries(facility.domain_scores);
  const coreList = domainList.filter(([, d]) => d.label !== "Inventory & Supply Chain");
  const supplyChain = domainList.find(([, d]) => d.label === "Inventory & Supply Chain");

  return (
    <div className="max-w-5xl">
      {/* Back */}
      <Link href="/dashboard/facilities" className="text-teal text-sm hover:underline inline-block mb-6">
        ← Back to facilities
      </Link>

      {/* Hero header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy mb-1">
              {facility.facility_name || "Unknown Facility"}
            </h1>
            <p className="text-slate-500 text-sm">
              {[facility.county, facility.district, facility.facility_type]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="text-slate-400 text-xs mt-2">
              {facility.operational === "yes" ? "✓ Operational" : facility.operational === "no" ? "✗ Not operational" : ""}
              {facility.enumerator ? `  ·  Assessed by ${facility.enumerator}` : ""}
              {facility.submitted_at ? `  ·  ${facility.submitted_at.split("T")[0]}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <p className="text-4xl font-bold text-navy">
                {facility.overall_score !== null ? `${facility.overall_score}%` : "—"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Overall score</p>
            </div>
            <ReadinessBadge tier={facility.tier} size="lg" />
          </div>
        </div>
      </div>

      {/* Deployment blockers */}
      {facility.blockers.length > 0 && (
        <div className="mb-6 p-5 bg-red-50 border border-red-200 rounded-2xl">
          <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              {facility.blockers.length}
            </span>
            Deployment Blocker{facility.blockers.length > 1 ? "s" : ""}
          </h3>
          <ul className="space-y-1.5">
            {facility.blockers.map((b, i) => (
              <li key={i} className="text-red-700 text-sm flex items-start gap-2">
                <span className="mt-0.5 text-red-400">•</span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Connectivity */}
      <Section title="Connectivity">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Detail label="Internet Type" value={fmt(facility.internet_type)} />
          <Detail label="ISP Provider" value={facility.isp_provider} />
          <Detail
            label="Download Speed"
            value={facility.download_mbps != null ? `${facility.download_mbps} Mbps` : null}
            warn={facility.download_mbps != null && facility.download_mbps < 5}
          />
          <Detail
            label="Upload Speed"
            value={facility.upload_mbps != null ? `${facility.upload_mbps} Mbps` : null}
            warn={facility.upload_mbps != null && facility.upload_mbps < 2}
          />
          <Detail
            label="Internet Uptime"
            value={facility.internet_uptime != null ? `${facility.internet_uptime}%` : null}
            warn={facility.internet_uptime != null && facility.internet_uptime < 50}
          />
          <Detail label="UPS Coverage" value={fmt(facility.ups_coverage)} />
        </div>
      </Section>

      {/* Power */}
      <Section title="Power Infrastructure">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Detail
            label="Primary Power Source"
            value={fmt(facility.primary_power)}
            warn={facility.primary_power === "none"}
          />
          <Detail
            label="Backup Power"
            value={fmt(facility.backup_power)}
            warn={facility.backup_power === "none"}
          />
          <Detail label="UPS at Workstations" value={fmt(facility.ups_coverage)} />
        </div>
      </Section>

      {/* Devices */}
      <Section title="Devices">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {(
            [
              ["Laptops", facility.laptops],
              ["Desktops", facility.desktops],
              ["Tablets", facility.tablets],
              ["Phones", facility.phones],
              ["Routers", facility.routers],
              ["Access Points", facility.access_points],
            ] as [string, number | null][]
          ).map(([label, val]) => (
            <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-navy">{val ?? "—"}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
        {totalDevices === 0 && (
          <p className="text-red-600 text-xs mt-2">⚠ No functional devices recorded — deployment blocker</p>
        )}
      </Section>

      {/* Workforce */}
      <Section title="Workforce & Capacity">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Detail label="Total Staff" value={facility.total_staff?.toString()} />
          <Detail label="Daily Patients" value={facility.daily_patients?.toString()} />
          <Detail
            label="Avg Digital Literacy"
            value={facility.digital_literacy_avg != null ? `${facility.digital_literacy_avg}%` : null}
          />
          <Detail
            label="Staff Without Supervision"
            value={
              facility.staff_without_supervision_pct != null
                ? `${facility.staff_without_supervision_pct}%`
                : null
            }
          />
        </div>
      </Section>

      {/* Health Information */}
      <Section title="Health Information">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Detail label="Recording Method" value={fmt(facility.recording_method)} />
          <Detail
            label="Supply Chain in Scope"
            value={
              facility.supply_chain_in_scope === true
                ? "Yes"
                : facility.supply_chain_in_scope === false
                ? "No"
                : null
            }
          />
        </div>
      </Section>

      {/* Domain scores */}
      <Section title="Domain Scores">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {coreList.map(([key, domain]) => (
            <DomainScoreCard key={key} domain={domain} />
          ))}
        </div>
        {supplyChain && (
          <div className="mt-3">
            <p className="text-xs text-slate-400 mb-2">Supplementary (not included in overall score)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DomainScoreCard domain={supplyChain[1]} />
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
