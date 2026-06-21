"use client"

import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet.markercluster"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import type { MapFacility } from "@/components/public/facility-map"
import { createFacilityHospitalIcon } from "@/components/public/facility-map-icon"

interface ClusteredFacilityMarkersProps {
  facilities: MapFacility[]
  renderPopupHtml: (facility: MapFacility) => string
}

export function ClusteredFacilityMarkers({
  facilities,
  renderPopupHtml,
}: ClusteredFacilityMarkersProps) {
  const map = useMap()

  useEffect(() => {
    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 50,
      disableClusteringAtZoom: 11,
    })

    for (const facility of facilities) {
      const marker = L.marker([facility.latitude, facility.longitude], {
        icon: createFacilityHospitalIcon(facility.tier, facility.overall_score),
      })
      marker.bindPopup(renderPopupHtml(facility))
      group.addLayer(marker)
    }

    map.addLayer(group)
    return () => {
      map.removeLayer(group)
      group.clearLayers()
    }
  }, [facilities, map, renderPopupHtml])

  return null
}
