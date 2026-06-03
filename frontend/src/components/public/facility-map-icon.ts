import L from "leaflet"

/** Lucide `hospital` paths (24×24 viewBox). */
const HOSPITAL_PATHS =
  '<path d="M12 7v4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M14 9h-4"/><path d="M18 11h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 21V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16"/>'

export function tierMarkerColor(tier: string): string {
  if (tier.startsWith("Tier 1")) return "#059669"
  if (tier.startsWith("Tier 2")) return "#0284c7"
  if (tier.startsWith("Tier 3")) return "#d97706"
  if (tier.startsWith("Tier 4")) return "#e11d48"
  if (tier === "Not Assessed") return "#64748b"
  return "#475569"
}

function hospitalSvg(stroke: string, sizePx: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${HOSPITAL_PATHS}</svg>`
}

const MARKER_SIZE = 36
const ICON_SIZE = 20

/** Leaflet div icon: white badge + tier-colored hospital glyph. */
export function createFacilityHospitalIcon(tier: string): L.DivIcon {
  const color = tierMarkerColor(tier)

  const html = `
    <div style="display:flex;align-items:center;justify-content:center;width:${MARKER_SIZE}px;height:${MARKER_SIZE}px;">
      <div style="display:flex;align-items:center;justify-content:center;background:#fff;border:2px solid ${color};border-radius:8px;padding:4px;box-shadow:0 1px 4px rgba(15,23,42,0.18);">
        ${hospitalSvg(color, ICON_SIZE)}
      </div>
    </div>
  `

  return L.divIcon({
    className: "facility-map-marker",
    html,
    iconSize: [MARKER_SIZE, MARKER_SIZE],
    iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE],
    popupAnchor: [0, -MARKER_SIZE],
  })
}
