"use client"

import type { ReactNode } from "react"
import { AppSidebar } from "@/components/public/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

interface DashboardLayoutProps {
  children: ReactNode
  lastRefreshed?: string | null
  title?: string
  description?: string
}

export function DashboardLayout({
  children,
  lastRefreshed,
  title,
  description,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="min-h-svh min-w-0">
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card/90 px-4 backdrop-blur-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            {title && (
              <p className="truncate text-sm font-medium text-foreground">{title}</p>
            )}
            {description && (
              <p className="truncate text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {lastRefreshed && (
            <p className="hidden text-[10px] text-muted-foreground sm:block tabular-nums">
              Synced{" "}
              {new Date(lastRefreshed).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "UTC",
              })}
            </p>
          )}
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
