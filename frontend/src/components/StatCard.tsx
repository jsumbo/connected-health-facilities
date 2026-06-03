import clsx from "clsx";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color: "teal" | "navy" | "green" | "red";
}

const COLOR_MAP = {
  teal: "border-teal/20 bg-teal/5",
  navy: "border-navy/20 bg-navy/5",
  green: "border-ready/20 bg-ready/5",
  red: "border-notready/20 bg-notready/5",
};

const VALUE_COLOR = {
  teal: "text-teal",
  navy: "text-navy",
  green: "text-ready",
  red: "text-notready",
};

export default function StatCard({ label, value, sub, color }: Props) {
  return (
    <div className={clsx("rounded-2xl border p-6 bg-white shadow-sm", COLOR_MAP[color])}>
      <p className="text-slate-500 text-sm mb-1">{label}</p>
      <p className={clsx("text-3xl font-bold", VALUE_COLOR[color])}>{value}</p>
      {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
    </div>
  );
}
