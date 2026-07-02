"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DistributionItem } from "@/lib/types";

const COLORS = [
  "#0d9488", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#f54343", "#f97316", "#6366f1",
];

interface Props {
  title: string;
  data: DistributionItem[];
  formatLabel?: (raw: string) => string;
}

function defaultFormat(raw: string): string {
  return raw
    .replace(/___/g, "/")
    .replace(/__/g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("4G Lte", "4G LTE")
    .replace("Emr", "EMR")
    .replace("Ups", "UPS");
}

export default function DonutChart({ title, data, formatLabel }: Props) {
  const fmt = formatLabel ?? defaultFormat;
  const chartData = data
    .filter((d) => d.count > 0)
    .map((d) => ({ name: fmt(d.label), value: d.count }));

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-semibold text-navy mb-4 text-sm">{title}</h3>
        <p className="text-slate-400 text-sm text-center py-8">No data</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="font-semibold text-navy mb-2 text-sm">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
            formatter={(value) => [value ?? 0, "facilities"]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
