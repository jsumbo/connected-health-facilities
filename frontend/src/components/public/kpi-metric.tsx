import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KpiMetricProps {
  label: string
  value: string | number
  description?: string | readonly string[]
  icon?: LucideIcon
  className?: string
}

export function KpiMetric({ label, value, description, icon: Icon, className }: KpiMetricProps) {
  const descriptionLines =
    description == null
      ? []
      : typeof description === "string"
        ? [description]
        : [...description]
  return (
    <Card className={cn("shadow-none", className)}>
      <CardHeader className="space-y-0 pb-2">
        {Icon ? (
          <div className="mb-2 flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-4" strokeWidth={2} aria-hidden />
          </div>
        ) : null}
        <CardDescription className="text-[11px] font-medium uppercase tracking-wide">
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="font-sans text-2xl font-semibold tabular-nums tracking-tight text-foreground">
          {value}
        </p>
        {descriptionLines.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {descriptionLines.map((line) => (
              <p key={line} className="text-xs text-muted-foreground">
                {line}
              </p>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
