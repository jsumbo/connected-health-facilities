interface ReadinessGaugeRingProps {
  score: number
  tier1Threshold?: number
  waveThreshold?: number
  size?: number
}

export function ReadinessGaugeRing({
  score,
  tier1Threshold = 75,
  waveThreshold = 55,
  size = 120,
}: ReadinessGaugeRingProps) {
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(100, Math.max(0, score))
  const dash = (pct / 100) * circumference

  const tier1Angle = (tier1Threshold / 100) * 360 - 90
  const waveAngle = (waveThreshold / 100) * 360 - 90

  function markerPoint(angleDeg: number, r: number): { x: number; y: number } {
    const rad = (angleDeg * Math.PI) / 180
    const cx = size / 2
    const cy = size / 2
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  const tier1Pt = markerPoint(tier1Angle, radius)
  const wavePt = markerPoint(waveAngle, radius)

  return (
    <div className="relative inline-flex flex-col items-center" role="img" aria-label={`Readiness ${score}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          className="text-primary"
        />
        <circle cx={tier1Pt.x} cy={tier1Pt.y} r={3} className="fill-[#f54343]" />
        <circle cx={wavePt.x} cy={wavePt.y} r={3} className="fill-[#0f0f0f]" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
        <span className="text-3xl font-semibold tabular-nums">{Math.round(score)}%</span>
      </div>
      <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-[#f54343]" aria-hidden />
          T1 {tier1Threshold}%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-[#0f0f0f]" aria-hidden />
          Wave {waveThreshold}%
        </span>
      </div>
    </div>
  )
}
