interface PageInsightBannerProps {
  insight: string
}

/** One-line page summary — shown above filters on overview only. */
export function PageInsightBanner({ insight }: PageInsightBannerProps) {
  const text = insight.trim()
  if (!text) return null

  return (
    <div
      className="mb-6 rounded-lg border border-border bg-muted/30 px-4 py-3"
      role="note"
      aria-label="Summary"
    >
      <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  )
}
