import { cn } from "@/lib/utils"

interface ChartNoteProps {
  children: string
  className?: string
}

/** Short interpretive line under a chart — plain language, data-led. */
export function ChartNote({ children, className }: ChartNoteProps) {
  const text = children.trim()
  if (!text) return null

  return (
    <p
      className={cn(
        "mt-3 border-t border-border/50 pt-3 text-sm leading-relaxed text-muted-foreground",
        className
      )}
    >
      {text}
    </p>
  )
}
