import { DomainScore } from "@/lib/types";
import ReadinessBadge from "./ReadinessBadge";

interface Props {
  domain: DomainScore;
}

const TIER_BAR: Record<string, string> = {
  "Deployment Ready": "bg-ready",
  Foundational: "bg-foundational",
  "Not Ready": "bg-notready",
  Blocked: "bg-blocked",
};

export default function DomainScoreCard({ domain }: Props) {
  const pct = domain.score ?? 0;
  const barColor = TIER_BAR[domain.tier] || "bg-slate-300";

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800 text-sm">{domain.label}</h3>
        <ReadinessBadge tier={domain.tier} size="sm" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-slate-100 rounded-full h-2">
          <div
            className={`${barColor} h-2 rounded-full transition-all`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm font-bold text-slate-700 w-10 text-right">
          {domain.score !== null ? `${domain.score}%` : "—"}
        </span>
      </div>
    </div>
  );
}
