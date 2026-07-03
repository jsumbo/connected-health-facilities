"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CountySummary } from "@/lib/types";

interface Props {
  data: CountySummary[];
}

export default function CountyChart({ data }: Props) {
  const chartData = data.map((c) => ({
    county: c.county?.replace(/_/g, " ") || "Unknown",
    Ready: c.tiers["Deployment Ready"] ?? 0,
    Foundational: c.tiers["Foundational"] ?? 0,
    "Not Ready": c.tiers["Not Ready"] ?? 0,
    Blocked: c.tiers["Blocked"] ?? 0,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h2 className="font-semibold text-navy mb-4">Submissions by County</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 28, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="county"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
          <Legend verticalAlign="top" align="left" wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} />
          <Bar dataKey="Ready" fill="#f54343" radius={[2, 2, 0, 0]} stackId="a" />
          <Bar dataKey="Foundational" fill="#F59E0B" radius={[0, 0, 0, 0]} stackId="a" />
          <Bar dataKey="Not Ready" fill="#DC2626" radius={[0, 0, 0, 0]} stackId="a" />
          <Bar dataKey="Blocked" fill="#7f1d1d" radius={[2, 2, 0, 0]} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
