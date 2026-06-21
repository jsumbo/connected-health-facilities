import type { ProgrammeFacility } from "@/lib/types-public"

const DOMAIN_ORDER = ["B", "C", "D", "E", "F", "G", "H", "I", "J"]

function domainBarColor(score: number, max: number): string {
  const pct = max > 0 ? score / max : 0
  if (pct >= 0.83) return "bg-emerald-500"
  if (pct >= 0.6) return "bg-sky-500"
  if (pct >= 0.4) return "bg-amber-500"
  return "bg-rose-500"
}

interface DomainMiniBarsProps {
  facility: ProgrammeFacility
  compact?: boolean
}

export function DomainMiniBars({ facility, compact }: DomainMiniBarsProps) {
  const entries = DOMAIN_ORDER.map((code) => {
    const d = facility.domain_scores[code]
    if (!d || d.score == null) return null
    const max = d.max_score ?? 3
    return { code, score: d.score, max }
  }).filter((e): e is { code: string; score: number; max: number } => e != null)

  if (entries.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  const shown = compact ? entries.slice(0, 6) : entries

  return (
    <div
      className="flex items-end gap-0.5"
      title={shown.map((e) => `${e.code}: ${e.score}/${e.max}`).join(", ")}
      aria-label="Domain score mini chart"
    >
      {shown.map((e) => {
        const heightPct = Math.max(8, (e.score / e.max) * 100)
        return (
          <div
            key={e.code}
            className={`w-1.5 rounded-sm ${domainBarColor(e.score, e.max)}`}
            style={{ height: `${heightPct * 0.24 + 4}px` }}
          />
        )
      })}
    </div>
  )
}
