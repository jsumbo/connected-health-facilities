import { Tier } from "@/lib/types";
import clsx from "clsx";

const TIER_STYLES: Record<string, string> = {
  "Deployment Ready": "bg-ready/10 text-ready border-ready/30",
  Foundational: "bg-foundational/10 text-foundational border-foundational/30",
  "Not Ready": "bg-notready/10 text-notready border-notready/30",
  Blocked: "bg-blocked/10 text-blocked border-blocked/30",
  Incomplete: "bg-slate-100 text-slate-500 border-slate-200",
};

interface Props {
  tier: Tier | string;
  size?: "sm" | "md" | "lg";
}

export default function ReadinessBadge({ tier, size = "md" }: Props) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border font-medium whitespace-nowrap",
        TIER_STYLES[tier] || TIER_STYLES["Incomplete"],
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-xs",
        size === "lg" && "px-4 py-1.5 text-sm"
      )}
    >
      {tier}
    </span>
  );
}
