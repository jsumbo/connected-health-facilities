import Link from "next/link"
import { Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuickWinsCardProps {
  count: number
}

export function QuickWinsCard({ count }: QuickWinsCardProps) {
  if (count === 0) {
    return null
  }

  return (
    <Link href="/dashboard/quick-wins" className="block">
      <Card className="hover:ring-amber-200/40 transition-all bg-amber-50/60 border-amber-200/80 shadow-none cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base text-amber-900">Quick Wins</CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-amber-100/60 text-amber-600">
              <Zap className="size-4" strokeWidth={2} aria-hidden />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-2xl font-semibold text-amber-900">{count}</p>
          <p className="text-sm text-amber-700">Tier 3 with 1 blocker (fixable)</p>
          <p className="text-xs font-medium text-amber-600 hover:text-amber-700">View →</p>
        </CardContent>
      </Card>
    </Link>
  )
}
