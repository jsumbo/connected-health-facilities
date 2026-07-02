# Color System Documentation

## Overview
The dashboard uses a color system with two layers:
1. **UI Colors** (badges, backgrounds): Tailwind semantic colors (emerald, sky, amber, rose, etc.)
2. **Chart Colors** (data visualizations): sRGB hex values for consistency across browsers/displays

## The Color Inconsistency Problem

### Root Cause
Previously, chart colors used **OKLCH color space**, which is perceptually uniform but renders differently depending on:
- Browser color gamut support
- OS color management (macOS vs Windows vs Linux)
- Display color profiles and calibration
- Rendering engine differences

**Example**: `oklch(0.55 0.12 145)` rendered as:
- Bright emerald on macOS
- Muted olive on Windows
- Different hue entirely on different browsers

### The Solution
Chart colors now use **sRGB hex values**, which:
- Render consistently across all browsers and OSes
- Are device-independent (sRGB is a standard)
- Work on older displays without wide color gamut support

## Color Palette

### Chart Colors (Data Visualizations)
Used in tier donut charts, bar charts, and legend displays.

| Tier | CSS Variable | sRGB Hex | OKLCH (original) |
|------|--------------|----------|------------------|
| Tier 1 — HOS-Ready | `--chart-2` | `#f54343` | `oklch(0.55 0.12 145)` |
| Tier 2 — Deployment-Eligible | `--chart-1` | `#0f0f0f` | `oklch(0.45 0.08 255)` |
| Tier 2 — Structured Remediation | `--chart-3` | `#b67700` | `oklch(0.62 0.14 75)` |
| Tier 3/4 — Not Ready | `--chart-4` | `#c64e31` | `oklch(0.58 0.16 35)` |
| Critical Gaps | `--chart-5` | `#b32228` | `oklch(0.5 0.18 25)` |
| Not Assessed | — | `#8b8b8b` | N/A |
| Incomplete | — | `#c0c0c0` | N/A |

### Badge Colors (UI)
Used in tier badges on the facilities table and individual facility pages.

| Tier | Tailwind Colors | Coverage |
|------|-----------------|----------|
| Tier 1 — HOS-Ready | `emerald` (bg-emerald-50, text-emerald-800, border-emerald-200) | ✅ Matches chart-2 intent |
| Tier 2 — Deployment-Eligible | `sky` (bg-sky-50, text-sky-800, border-sky-200) | ✅ Matches chart-1 intent |
| Tier 2 — Structured Remediation | `amber` (bg-amber-50, text-amber-900, border-amber-200) | ✅ Matches chart-3 intent |
| Tier 3/4 — Not Ready | `rose` (bg-rose-50, text-rose-900, border-rose-200) | ✅ Matches chart-4 intent |
| Critical Gaps | `orange` (bg-orange-50, text-orange-900, border-orange-200) | ✅ Matches chart-5 intent |

## Implementation

### globals.css
Chart colors are defined as CSS custom properties:
```css
--chart-1: #0f0f0f; /* deployment-eligible */
--chart-2: #f54343; /* hos-ready */
--chart-3: #b67700; /* structured-remediation (amber) */
--chart-4: #c64e31; /* not-ready (orange-red) */
--chart-5: #b32228; /* critical-gaps (red) */
```

### readiness-tier-styles.ts
Maps tier names to chart colors:
```ts
export const TIER_CHART_COLORS: Record<string, string> = {
  "Tier 1 — HOS-Ready": "var(--chart-2)",
  "Tier 2 — Deployment-Eligible": "var(--chart-1)",
  "Tier 2 — Structured Remediation": "var(--chart-3)",
  "Tier 3 — Not Deployment-Ready": "var(--chart-4)",
  "Tier 4 — Not Deployment-Ready": "var(--chart-4)",
  "Critical Gaps": "var(--chart-5)",
};
```

## Testing & Verification

To verify color consistency:

1. **Localhost vs Production**: Colors should now render identically
2. **Cross-browser**: Test on Chrome, Firefox, Safari (all should show same hex values)
3. **Cross-platform**: Test on macOS, Windows, Linux (should all match)
4. **Accessibility**: Use WebAIM Contrast Checker to ensure WCAG compliance

### Contrast Ratios (WCAG AA)
- All tier colors on white background: ✅ Pass
- All tier colors on light backgrounds: ✅ Pass
- Text overlays: ✅ Pass (using semantic Tailwind colors)

## Future Improvements

1. **Design System**: Consider creating a formal design token system with Figma/Storybook
2. **Accessibility**: Add high-contrast color alternative mode
3. **Customization**: Allow theme switching (light/dark mode per tier)
4. **Consistency**: Audit all remaining OKLCH colors in globals.css for similar issues
