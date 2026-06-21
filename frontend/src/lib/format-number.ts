/** Round away JavaScript float noise for display and chart axes. */
export function roundToDecimals(value: number, decimals = 2): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/** Chart axis tick — trims float noise, drops trailing zeros. */
export function formatAxisTick(value: number, decimals = 2): string {
  const rounded = roundToDecimals(value, decimals)
  if (rounded === 0) return "0"
  return rounded.toFixed(decimals).replace(/0+$/, "").replace(/\.$/, "")
}

export function formatAxisPercentTick(value: number, decimals = 0): string {
  return `${formatAxisTick(value, decimals)}%`
}

export function formatAxisIntegerTick(value: number): string {
  return String(Math.round(value))
}

/** Correlation / ratio on 0–1 scale. */
export function formatCorrelation(value: number): string {
  return roundToDecimals(value, 2).toFixed(2)
}

export function formatSignedCorrelation(value: number): string {
  const rounded = roundToDecimals(value, 2)
  const sign = rounded > 0 ? "+" : ""
  return `${sign}${rounded.toFixed(2)}`
}

export function formatPercentValue(value: number, decimals = 0): string {
  const rounded = roundToDecimals(value, decimals)
  if (decimals === 0) return String(Math.round(rounded))
  return rounded.toFixed(decimals).replace(/\.?0+$/, "")
}

export function formatPercentLabel(value: number | null | undefined, decimals = 0): string {
  if (value == null) return "—"
  return `${formatPercentValue(value, decimals)}%`
}

export function roundAxisMax(value: number, decimals = 2): number {
  return roundToDecimals(value, decimals)
}

export function roundAxisMaxCeil(value: number): number {
  return Math.ceil(roundToDecimals(value, 4))
}
