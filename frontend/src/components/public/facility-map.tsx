"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Layers, Satellite } from "lucide-react"
import L from "leaflet"
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from "react-leaflet"
import type { GeoJsonObject } from "geojson"
import type { LatLngBoundsExpression, LatLngTuple, PathOptions } from "leaflet"
import { createFacilityHospitalIcon } from "@/components/public/facility-map-icon"
import { cn } from "@/lib/utils"
import { TierBadge } from "@/components/public/tier-badge"
import liberiaBoundary from "@/data/liberia-boundary.json"
import "leaflet/dist/leaflet.css"

type BasemapId = "light" | "satellite"

const BASEMAPS: Record<
  BasemapId,
  { url: string; attribution: string; outline: PathOptions; labelsUrl?: string }
> = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    outline: {
      color: "#1e3a5f",
      weight: 3,
      opacity: 0.95,
      fillColor: "#e8e4dc",
      fillOpacity: 0.15,
    },
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "",
    labelsUrl:
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    outline: {
      color: "#f8fafc",
      weight: 3,
      opacity: 0.95,
      fillColor: "transparent",
      fillOpacity: 0,
    },
  },
}

export interface MapFacility {
  slug: string
  name: string
  county: string
  tier: string
  overall_score: number | null
  latitude: number
  longitude: number
  assessment_status: "complete" | "not_assessed"
  has_facility_photo?: boolean
  photo_url?: string | null
}

/** Keep pan/zoom within Liberia (+ small margin). */
const LIBERIA_MAX_BOUNDS: LatLngBoundsExpression = [
  [4.2, -11.65],
  [8.65, -7.25],
]

function FitFacilityBounds({ positions }: { positions: LatLngTuple[] }) {
  const map = useMap()

  useEffect(() => {
    if (positions.length === 0) return

    const bounds =
      positions.length === 1
        ? L.latLngBounds(positions[0], positions[0]).pad(0.35)
        : L.latLngBounds(positions).pad(0.12)

    map.fitBounds(bounds, {
      padding: [36, 36],
      maxZoom: 9,
      animate: false,
    })
  }, [map, positions])

  return null
}

/** Leaflet must recalculate size after layout / fullscreen changes. */
function MapInvalidateSize() {
  const map = useMap()

  useEffect(() => {
    const invalidate = () => {
      map.invalidateSize()
    }
    const t = window.setTimeout(invalidate, 100)
    window.addEventListener("resize", invalidate)
    document.addEventListener("fullscreenchange", invalidate)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener("resize", invalidate)
      document.removeEventListener("fullscreenchange", invalidate)
    }
  }, [map])

  return null
}

interface FacilityMapProps {
  facilities: MapFacility[]
  containerClassName?: string
}

export function FacilityMap({ facilities, containerClassName }: FacilityMapProps) {
  const [basemap, setBasemap] = useState<BasemapId>("satellite")
  const activeBasemap = BASEMAPS[basemap]

  const mapped = facilities.filter(
    (f) => f.latitude != null && f.longitude != null && !Number.isNaN(f.latitude)
  )

  if (mapped.length === 0) {
    return (
      <div className="flex h-[min(70vh,640px)] items-center justify-center rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        No facilities with GPS coordinates to display.
      </div>
    )
  }

  const positions: LatLngTuple[] = mapped.map((f) => [f.latitude, f.longitude])
  const initialBounds: LatLngBoundsExpression =
    positions.length === 1
      ? L.latLngBounds(positions[0], positions[0]).pad(0.35)
      : L.latLngBounds(positions).pad(0.12)

  return (
    <div
      className={cn(
        "relative h-[min(70vh,640px)] w-full overflow-hidden rounded-lg border border-border [&_.facility-map-marker]:!border-0 [&_.facility-map-marker]:!bg-transparent [&_.leaflet-container]:z-0",
        containerClassName
      )}
    >
      <div
        className="absolute left-2 top-2 z-[1001] flex rounded-md border border-border bg-card p-0.5 shadow-md"
        role="group"
        aria-label="Map style"
      >
        <button
          type="button"
          onClick={() => setBasemap("light")}
          className={cn(
            "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors",
            basemap === "light"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
          aria-pressed={basemap === "light"}
        >
          <Layers className="size-3.5" aria-hidden />
          Map
        </button>
        <button
          type="button"
          onClick={() => setBasemap("satellite")}
          className={cn(
            "inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors",
            basemap === "satellite"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
          aria-pressed={basemap === "satellite"}
        >
          <Satellite className="size-3.5" aria-hidden />
          Satellite
        </button>
      </div>

      <MapContainer
        bounds={initialBounds}
        maxBounds={LIBERIA_MAX_BOUNDS}
        maxBoundsViscosity={1}
        minZoom={7}
        maxZoom={12}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          key={basemap}
          attribution={activeBasemap.attribution}
          url={activeBasemap.url}
        />
        {activeBasemap.labelsUrl ? (
          <TileLayer url={activeBasemap.labelsUrl} attribution="" opacity={0.75} />
        ) : null}
        <GeoJSON
          key={`outline-${basemap}`}
          data={liberiaBoundary as GeoJsonObject}
          style={activeBasemap.outline}
          interactive={false}
        />
        <FitFacilityBounds positions={positions} />
        <MapInvalidateSize />
        {mapped.map((facility) => (
          <Marker
            key={facility.slug}
            position={[facility.latitude, facility.longitude]}
            icon={createFacilityHospitalIcon(facility.tier)}
          >
            <Popup>
              <div className="min-w-[11rem] max-w-[14rem] space-y-1.5 text-sm">
                {facility.photo_url ? (
                  <img
                    src={facility.photo_url}
                    alt={`${facility.name} facility`}
                    className="h-28 w-full rounded-md border border-border object-cover"
                    loading="lazy"
                  />
                ) : null}
                <p className="font-semibold leading-tight">{facility.name}</p>
                <p className="text-xs text-muted-foreground">{facility.county}</p>
                {facility.assessment_status === "complete" ? (
                  <>
                    <p className="text-xs tabular-nums">
                      Readiness:{" "}
                      <span className="font-medium">
                        {facility.overall_score != null ? `${facility.overall_score}%` : "—"}
                      </span>
                    </p>
                    <TierBadge tier={facility.tier} compact />
                    <Link
                      href={`/facility/${facility.slug}`}
                      className="inline-block text-xs font-medium text-primary hover:underline"
                    >
                      Open facility →
                    </Link>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Not yet assessed</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
