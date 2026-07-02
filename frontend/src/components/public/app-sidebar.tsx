"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BrandLogo } from "@/components/public/brand-logo"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle,
  GraduationCap,
  Grid3x3,
  MapPin,
  MessageSquareHeart,
  Zap,
} from "lucide-react"
import clsx from "clsx"

const NAV = [
  { href: "/", label: "Overview", icon: Activity, exact: true, section: "MAIN" },
  { href: "/quick-wins", label: "Quick Wins", icon: Zap, section: "MAIN" },
  { href: "/blockers", label: "Blockers", icon: AlertTriangle, section: "MAIN" },
  { href: "/readiness-heatmap", label: "Readiness Heatmap", icon: Grid3x3, section: "EXPLORE" },
  { href: "/facilities", label: "Facilities", icon: Building2, section: "EXPLORE" },
  { href: "/clusters", label: "Clusters", icon: Zap, section: "EXPLORE" },
  { href: "/map", label: "Map", icon: MapPin, section: "EXPLORE" },
  { href: "/dla", label: "Digital Literacy", icon: GraduationCap, section: "SURVEYS" },
  { href: "/sentiment", label: "Staff Sentiment", icon: MessageSquareHeart, section: "SURVEYS" },
  {
    href: "/what-drives-readiness",
    label: "What Drives Readiness",
    icon: BarChart3,
    section: "ANALYSIS",
  },
  { href: "/data-quality", label: "Data Quality", icon: CheckCircle, section: "ANALYSIS" },
] as const

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-full w-64 flex-col bg-navy">
      <div className="border-b border-white/10 px-6 py-6">
        <BrandLogo href="/" priority />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
        {(["MAIN", "EXPLORE", "SURVEYS", "ANALYSIS"] as const).map((section) => {
          const sectionItems = NAV.filter((item) => item.section === section)
          if (sectionItems.length === 0) return null

          return (
            <div key={section}>
              <p className="mb-2 px-4 text-xs font-semibold uppercase text-slate-500">{section}</p>
              <div className="space-y-1">
                {sectionItems.map((item) => {
                  const { href, label, icon: Icon } = item
                  const exact = "exact" in item && item.exact
                  const active = exact ? pathname === href : pathname.startsWith(href)
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={clsx(
                        "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-teal text-white"
                          : "text-slate-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="border-t border-white/10 px-4 pb-6 pt-4">
        <p className="px-4 text-xs text-slate-500">
          Ministry of Health · NHIC
          <br />
          Sand Technologies
        </p>
      </div>
    </aside>
  )
}
