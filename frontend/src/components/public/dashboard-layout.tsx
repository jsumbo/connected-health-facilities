"use client"

import type { ReactNode } from "react"
import { AppSidebar } from "@/components/public/app-sidebar"
import { GlobalSearchLoader } from "@/components/public/global-search-loader"
import type { ProgrammeFacility } from "@/lib/types-public"

interface DashboardLayoutProps {
  children: ReactNode
  lastRefreshed?: string | null
  title?: string
  /** Short context line only (e.g. county · cluster). Not a page intro. */
  description?: string
  assessed?: number
  target?: number
  facilities?: ProgrammeFacility[]
}

export function DashboardLayout({
  children,
  lastRefreshed,
  title,
  description,
  assessed,
  target,
  facilities = [],
}: DashboardLayoutProps) {
  return (
    <div className="min-h-svh bg-background">
      <AppSidebar />
      <div className="flex min-h-svh min-w-0 flex-col pl-64">
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur-sm md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            {title ? (
              <h1 className="truncate text-sm font-semibold text-foreground">{title}</h1>
            ) : null}
            {description ? (
              <span className="hidden truncate text-xs text-muted-foreground sm:inline">
                {description}
              </span>
            ) : null}
          </div>
          {assessed != null && target != null ? (
            <p className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
              <span className="inline-block size-1.5 rounded-full bg-emerald-500" aria-hidden />
              {assessed} / {target}
            </p>
          ) : null}
          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
            <GlobalSearchLoader facilities={facilities.length > 0 ? facilities : undefined} />
            {lastRefreshed ? (
              <p className="hidden text-[10px] text-muted-foreground tabular-nums lg:block">
                Synced{" "}
                {new Date(lastRefreshed).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "UTC",
                })}
              </p>
            ) : null}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
      </div>
    </div>
  )
}
