import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface FacilityMetricCardProps {
  label: string
  value: string | number
  icon: LucideIcon
}

export function FacilityMetricCard({ label, value, icon: Icon }: FacilityMetricCardProps) {
  return (
    <Card className="shadow-none">
      <CardContent className="pt-4">
        <div className="mb-2 flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" strokeWidth={2} aria-hidden />
        </div>
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium capitalize leading-snug">{String(value)}</p>
      </CardContent>
    </Card>
  )
}
