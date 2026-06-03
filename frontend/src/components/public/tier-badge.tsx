import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { tierStyle } from "./readiness-tier-styles"

interface TierBadgeProps {
  tier: string
  compact?: boolean
}

export function TierBadge({ tier, compact }: TierBadgeProps) {
  const s = tierStyle(tier)
  const short = tier.replace(" — ", " · ")

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border",
        s.bg,
        s.text,
        s.border,
        compact ? "text-[10px] px-1.5 py-0" : "text-xs"
      )}
    >
      {short}
    </Badge>
  )
}
