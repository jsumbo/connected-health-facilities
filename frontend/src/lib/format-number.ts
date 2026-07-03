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

/** Y-axis ticks for composite readiness scatter charts (0–100% scale). */
export const COMPOSITE_PERCENT_AXIS_TICKS = [30, 40, 50, 60, 70, 80, 90, 100] as const

/**
 * Ensure composite readiness is on the 0–100 scale used across the dashboard.
 * Handles fractional (0.667), 0–10 (6.67), and 0–100 (66.7) source values.
 */
export function normalizeCompositePercent(
  score: number | null | undefined,
  batchMax?: number
): number | null {
  if (score == null || !Number.isFinite(score)) return null
  const maxInBatch = batchMax ?? score

  if (maxInBatch > 0 && maxInBatch <= 1) {
    return roundToDecimals(score * 100, 1)
  }
  if (maxInBatch > 1 && maxInBatch <= 15) {
    return roundToDecimals(score * 10, 1)
  }
  return roundToDecimals(score, 1)
}

export function roundAxisMax(value: number, decimals = 2): number {
  return roundToDecimals(value, decimals)
}

export function roundAxisMaxCeil(value: number): number {
  return Math.ceil(roundToDecimals(value, 4))
}

const COUNT_WORDS_UNDER_TWENTY = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
] as const

const COUNT_TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
] as const

/** Spell out small counts for narrative UI copy (e.g. "Four facilities"). */
export function spellOutCount(value: number): string {
  const count = Math.max(0, Math.round(value))
  if (count < COUNT_WORDS_UNDER_TWENTY.length) return COUNT_WORDS_UNDER_TWENTY[count] ?? String(count)
  if (count < 100) {
    const tens = Math.floor(count / 10)
    const ones = count % 10
    if (ones === 0) return COUNT_TENS[tens] ?? String(count)
    const onesWord = COUNT_WORDS_UNDER_TWENTY[ones]?.toLowerCase() ?? String(ones)
    return `${COUNT_TENS[tens]}-${onesWord}`
  }
  return String(count)
}
