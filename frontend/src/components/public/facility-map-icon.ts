import L from "leaflet"

/** Lucide `hospital` paths (24×24 viewBox). */
const HOSPITAL_PATHS =
  '<path d="M12 7v4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M14 9h-4"/><path d="M18 11h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 21V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16"/>'

export function tierMarkerColor(tier: string): string {
  if (tier.startsWith("Tier 1")) return "#3e8343"
  if (tier.startsWith("Tier 2") && tier.includes("Structured Remediation")) return "#b67700"
  if (tier.startsWith("Tier 2")) return "#355781"
  if (tier.startsWith("Tier 3") || tier.startsWith("Tier 4")) return "#c64e31"
  if (tier === "Not Assessed") return "#8b8b8b"
  return "#8b8b8b"
}

/** Short tier label — secondary encoding for colorblind users. */
export function tierMarkerLabel(tier: string): string {
  if (tier.startsWith("Tier 1")) return "T1"
  if (tier.startsWith("Tier 2") && tier.includes("Structured Remediation")) return "T2R"
  if (tier.startsWith("Tier 2")) return "T2"
  if (tier.startsWith("Tier 3") || tier.startsWith("Tier 4")) return "T3"
  return "—"
}

function hospitalSvg(stroke: string, sizePx: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${HOSPITAL_PATHS}</svg>`
}

function markerScaleFromScore(score: number | null | undefined): number {
  if (score == null) return 1
  return 0.85 + (score / 100) * 0.35
}

/** Leaflet div icon: tier color + label badge + size by composite. */
export function createFacilityHospitalIcon(
  tier: string,
  overallScore?: number | null
): L.DivIcon {
  const color = tierMarkerColor(tier)
  const label = tierMarkerLabel(tier)
  const scale = markerScaleFromScore(overallScore)
  const markerSize = Math.round(36 * scale)
  const iconSize = Math.round(18 * scale)

  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;width:${markerSize}px;">
      <div style="display:flex;align-items:center;justify-content:center;background:#fff;border:2px solid ${color};border-radius:8px;padding:3px;box-shadow:0 1px 4px rgba(15,23,42,0.18);">
        ${hospitalSvg(color, iconSize)}
      </div>
      <span style="margin-top:1px;font-size:9px;font-weight:700;color:${color};background:#fff;padding:0 3px;border-radius:3px;border:1px solid ${color};line-height:1.2;">${label}</span>
    </div>
  `

  return L.divIcon({
    className: "facility-map-marker",
    html,
    iconSize: [markerSize, markerSize + 12],
    iconAnchor: [markerSize / 2, markerSize + 6],
    popupAnchor: [0, -(markerSize + 6)],
  })
}
