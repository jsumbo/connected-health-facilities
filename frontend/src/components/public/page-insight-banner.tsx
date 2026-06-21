import { Lightbulb } from "lucide-react"

interface PageInsightBannerProps {
  insight: string
}

export function PageInsightBanner({ insight }: PageInsightBannerProps) {
  return (
    <div
      className="mb-6 flex gap-3 rounded-lg border border-primary/20 bg-primary/[0.04] px-4 py-3"
      role="note"
      aria-label="Key insight"
    >
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <p className="text-sm leading-relaxed text-foreground">
        <span className="font-medium">So what: </span>
        {insight}
      </p>
    </div>
  )
}
