"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Maximize2, Minimize2 } from "lucide-react"
import type { MapFacility } from "@/components/public/facility-map"
import { FacilityMapLegend } from "@/components/public/facility-map-legend"
import { ChartNote } from "@/components/public/chart-note"
import { buildMapNote } from "@/lib/dashboard-notes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const FacilityMap = dynamic(
  () => import("@/components/public/facility-map").then((mod) => mod.FacilityMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[min(70vh,640px)] animate-pulse rounded-lg border border-border bg-muted/40" />
    ),
  }
)

interface FacilityMapViewProps {
  facilities: MapFacility[]
  totalCount: number
}

export function FacilityMapView({ facilities, totalCount }: FacilityMapViewProps) {
  const fullscreenRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const syncFullscreenState = useCallback(() => {
    setIsFullscreen(document.fullscreenElement === fullscreenRef.current)
  }, [])

  useEffect(() => {
    document.addEventListener("fullscreenchange", syncFullscreenState)
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState)
  }, [syncFullscreenState])

  const handleToggleFullscreen = async () => {
    const el = fullscreenRef.current
    if (!el) return

    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen()
      } else {
        await el.requestFullscreen()
      }
    } catch {
      // Browser blocked fullscreen (permissions / unsupported)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {!isFullscreen ? (
        <FacilityMapLegend mappedCount={facilities.length} totalCount={totalCount} />
      ) : null}

      <div
        ref={fullscreenRef}
        className={cn(
          "relative flex flex-col gap-2",
          "fullscreen:flex fullscreen:h-screen fullscreen:w-screen fullscreen:flex-col fullscreen:bg-background fullscreen:p-3"
        )}
      >
        {isFullscreen ? (
          <FacilityMapLegend
            mappedCount={facilities.length}
            totalCount={totalCount}
            compact
          />
        ) : null}

        <div className={cn("relative", isFullscreen && "min-h-0 flex-1")}>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute right-2 top-2 z-[1001] size-8 shadow-md"
            onClick={handleToggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            aria-pressed={isFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="size-4" aria-hidden />
            ) : (
              <Maximize2 className="size-4" aria-hidden />
            )}
          </Button>

          <FacilityMap
            facilities={facilities}
            containerClassName={isFullscreen ? "!h-full min-h-0 flex-1 border-0" : undefined}
          />
        </div>
      </div>

      {!isFullscreen ? (
        <ChartNote>{buildMapNote(facilities.length, totalCount)}</ChartNote>
      ) : null}
    </div>
  )
}
