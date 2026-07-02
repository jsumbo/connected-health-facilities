"use client"

import { useEffect, useRef } from "react"
import type { ProgrammeFacility } from "@/lib/types-public"

interface GeoMapProps {
  facilities: ProgrammeFacility[]
}

export function GeoMap({ facilities }: GeoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const initMap = async () => {
      const L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css")

      if (!mapContainer.current) return

      map.current = L.map(mapContainer.current).setView([6.3, -9.5], 7)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 18,
      }).addTo(map.current)

      facilities.forEach((facility) => {
        if (facility.latitude === null || facility.longitude === null) return

        const lat = facility.latitude
        const lon = facility.longitude
        const tierColor =
          facility.tier === "Tier 1 — HOS-Ready"
            ? "#f54343"
            : facility.tier === "Tier 2 — Deployment-Eligible" ||
                facility.tier === "Tier 2 — Structured Remediation"
              ? "#f59e0b"
              : "#ef4444"

        L.circleMarker([lat, lon], {
          radius: 6,
          fillColor: tierColor,
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        })
          .bindPopup(`<strong>${facility.name}</strong><br/>${facility.tier}`)
          .addTo(map.current)
      })
    }

    initMap()
  }, [facilities])

  return (
    <div
      ref={mapContainer}
      className="w-full h-96 border border-border rounded-lg"
      style={{ minHeight: "400px" }}
    />
  )
}
