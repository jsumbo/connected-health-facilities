import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KpiMetricProps {
  label: string
  value: string | number
  description?: string | readonly string[]
  icon?: LucideIcon
  className?: string
  href?: string
  linkLabel?: string
  /** Keep subtitle directly under the value instead of pinning to card bottom. */
  stackDescription?: boolean
}

export function KpiMetric({
  label,
  value,
  description,
  icon: Icon,
  className,
  href,
  linkLabel,
  stackDescription = false,
}: KpiMetricProps) {
  const descriptionLines =
    description == null
      ? []
      : typeof description === "string"
        ? [description]
        : [...description]

  const card = (
    <Card
      className={cn(
        "flex h-full flex-col shadow-none",
        href && "transition-colors group-hover/card:bg-muted/30 group-hover/card:ring-primary/25",
        className
      )}
    >
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
      <CardContent className="flex flex-1 flex-col gap-1">
        <p className="font-sans text-2xl font-semibold tabular-nums tracking-tight text-foreground">
          {value}
        </p>
        <div className={cn("pt-1", stackDescription ? "min-h-0" : "mt-auto min-h-10")}>
          {descriptionLines.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {descriptionLines.map((line) => (
                <p key={line} className="text-xs leading-snug text-muted-foreground line-clamp-2">
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs leading-snug text-transparent select-none" aria-hidden>
              &nbsp;
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (!href) return card

  return (
    <Link
      href={href}
      aria-label={linkLabel ?? `View ${label}`}
      className="group/card block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {card}
    </Link>
  )
}
