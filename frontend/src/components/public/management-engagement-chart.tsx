"use client"

interface ManagementEngagementChartProps {
  distribution: Record<string, number>
}

const ORDER = [
  "Very engaged",
  "Engaged",
  "Somewhat engaged",
  "Not engaged",
  "Unknown",
]

export function ManagementEngagementChart({
  distribution,
}: ManagementEngagementChartProps) {
  const entries = ORDER.filter((k) => (distribution[k] ?? 0) > 0).map((k) => ({
    label: k,
    count: distribution[k] ?? 0,
  }))

  if (entries.length === 0) {
    entries.push(
      ...Object.entries(distribution).map(([label, count]) => ({ label, count }))
    )
  }

  const max = Math.max(...entries.map((e) => e.count), 1)

  return (
    <div className="space-y-3">
      {entries.map(({ label, count }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs text-muted-foreground">{label}</span>
          <div className="h-6 flex-1 rounded bg-muted/50">
            <div
              className="flex h-full items-center rounded bg-blue-600/80 pl-2 text-[10px] font-medium text-white"
              style={{ width: `${(count / max) * 100}%`, minWidth: count > 0 ? "2rem" : 0 }}
            >
              {count > 0 ? count : ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
