import { formatFacilityChoice } from "@/lib/format-facility-value"

interface SentimentDistributionProps {
  title?: string
  distribution: Record<string, number>
}

export function SentimentDistribution({ title, distribution }: SentimentDistributionProps) {
  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1])
  const total = entries.reduce((sum, [, count]) => sum + count, 0)

  if (total === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {title ? (
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      ) : null}
      <ul className="space-y-1.5">
        {entries.map(([label, count]) => {
          const pct = Math.round((100 * count) / total)
          return (
            <li key={label}>
              <div className="mb-0.5 flex justify-between gap-2 text-xs">
                <span className="capitalize text-foreground">{formatFacilityChoice(label)}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {count} ({pct}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-teal"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
