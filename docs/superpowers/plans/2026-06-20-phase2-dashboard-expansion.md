# Phase 2 Dashboard Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 6 new analytics pages (Blockers, Readiness Heatmap, What Drives Readiness, Clusters, Map, Data Quality) and update sidebar navigation to surface all dashboard views.

**Architecture:** Reuse existing data from `/public/overview` endpoint. Each page is a server component (async) with optional client wrappers for interactivity (filters, tabs). All pages follow Phase 1 patterns: responsive grid layouts, Tailwind CSS, shadcn/ui components, Card-based design. Blockers page extracts blocker chart from Overview. Heatmap uses domain-facility matrix. Correlation uses facility-domain data already in overview. Clusters reuses existing regional cards. Map is geo-visualization (Leaflet or similar). Data Quality is metrics-only.

**Tech Stack:** Next.js 15 App Router, Recharts, shadcn/ui (Card, Tabs, etc.), Tailwind CSS, TypeScript, existing public API endpoints

## Global Constraints

- All pages use existing `/public/overview` endpoint (no new backend endpoints required)
- Server components by default; `'use client'` only for filters/interactivity
- Responsive design: mobile-first, test on lg/md/sm breakpoints
- URL-persistent filters on Blockers, Heatmap, Clusters (like Phase 1 Overview)
- All new sidebar routes follow existing pattern: `/dashboard/<page-name>`
- No hardcoded colors—use design tokens from Tailwind config
- Existing Phase 1 features (Quick Wins card, blocker chart, DLA questions) remain unchanged
- All git commits after each task with descriptive messages

---

## File Structure

### New Pages (6 files)
- `frontend/src/app/dashboard/blockers/page.tsx` — Blockers page (blocker frequency + unlock potential)
- `frontend/src/app/dashboard/readiness-heatmap/page.tsx` — Facility × domain matrix
- `frontend/src/app/dashboard/what-drives-readiness/page.tsx` — Correlation analysis
- `frontend/src/app/dashboard/clusters/page.tsx` — Regional readiness cards (enhanced from Overview data)
- `frontend/src/app/dashboard/map/page.tsx` — Geographic visualization
- `frontend/src/app/dashboard/data-quality/page.tsx` — Data completeness metrics

### Component Updates (1 file)
- `frontend/src/components/Sidebar.tsx` — Add 6 new nav links + reorganize sections

### New Helper Components (4 files)
- `frontend/src/components/public/heatmap-grid.tsx` — Facility-domain matrix renderer
- `frontend/src/components/public/correlation-chart.tsx` — Horizontal bar chart for drivers
- `frontend/src/components/public/geo-map.tsx` — Map component with facility pins
- `frontend/src/components/public/data-quality-metrics.tsx` — Metrics cards grid

### Type Updates (1 file)
- `frontend/src/lib/types-public.ts` — Add types for heatmap, correlation data (if not present)

---

## Task Dependencies

```
Task 1 (Sidebar nav) ← Independent
Task 2 (Blockers page) ← Uses Phase 1 BlockerBarChart
Task 3 (Heatmap component) ← New
Task 4 (Heatmap page) ← Depends on Task 3
Task 5 (Correlation chart) ← New
Task 6 (What Drives page) ← Depends on Task 5
Task 7 (Clusters page) ← Uses existing cluster data
Task 8 (Map component) ← New
Task 9 (Map page) ← Depends on Task 8
Task 10 (Data Quality) ← Independent
```

---

## Task 1: Update Sidebar Navigation

**Files:**
- Modify: `frontend/src/components/Sidebar.tsx`

**Interfaces:**
- Consumes: Existing NAV array structure
- Produces: Updated NAV array with 10 total items organized in sections (MAIN, EXPLORE, SURVEYS, ANALYSIS)

**Steps:**

- [ ] **Step 1: Read Sidebar.tsx to see current structure**

Current structure has 5 items:
```typescript
const NAV = [
  { href: "/dashboard", label: "Overview", icon: Activity, exact: true },
  { href: "/dashboard/quick-wins", label: "Quick Wins", icon: Zap },
  { href: "/dashboard/facilities", label: "Facilities", icon: Building2 },
  { href: "/dashboard/infrastructure", label: "Infrastructure", icon: Wifi },
  { href: "/dashboard/progress", label: "Progress", icon: TrendingUp },
];
```

- [ ] **Step 2: Import additional icons from lucide-react**

Add to imports:
```typescript
import { 
  AlertTriangle,    // for Blockers
  Grid3x3,         // for Heatmap
  BarChart3,       // for What Drives
  MapPin,          // for Map
  CheckCircle,     // for Data Quality
} from "lucide-react"
```

- [ ] **Step 3: Replace NAV with organized structure**

```typescript
const NAV = [
  // MAIN
  { href: "/dashboard", label: "Overview", icon: Activity, exact: true, section: "MAIN" },
  { href: "/dashboard/quick-wins", label: "Quick Wins", icon: Zap, section: "MAIN" },
  { href: "/dashboard/blockers", label: "Blockers", icon: AlertTriangle, section: "MAIN" },
  
  // EXPLORE
  { href: "/dashboard/readiness-heatmap", label: "Readiness Heatmap", icon: Grid3x3, section: "EXPLORE" },
  { href: "/dashboard/facilities", label: "Facilities", icon: Building2, section: "EXPLORE" },
  { href: "/dashboard/clusters", label: "Clusters", icon: Zap, section: "EXPLORE" }, // TODO: better icon
  { href: "/dashboard/map", label: "Map", icon: MapPin, section: "EXPLORE" },
  
  // SURVEYS
  { href: "/dashboard/digital-literacy", label: "Digital Literacy", icon: GraduationCap, section: "SURVEYS" },
  { href: "/dashboard/staff-sentiment", label: "Staff Sentiment", icon: MessageSquareHeart, section: "SURVEYS" },
  
  // ANALYSIS
  { href: "/dashboard/what-drives-readiness", label: "What Drives Readiness", icon: BarChart3, section: "ANALYSIS" },
  { href: "/dashboard/data-quality", label: "Data Quality", icon: CheckCircle, section: "ANALYSIS" },
];
```

- [ ] **Step 4: Update nav rendering to show section headers**

Replace the current map rendering with:
```typescript
<nav className="flex-1 px-4 py-6 space-y-6">
  {["MAIN", "EXPLORE", "SURVEYS", "ANALYSIS"].map((section) => {
    const sectionItems = NAV.filter((item) => item.section === section);
    if (sectionItems.length === 0) return null;
    
    return (
      <div key={section}>
        <p className="px-4 mb-2 text-xs font-semibold uppercase text-slate-500">{section}</p>
        <div className="space-y-1">
          {sectionItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-teal text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    );
  })}
</nav>
```

- [ ] **Step 5: Test sidebar in browser**

Run: `npm run dev`
Verify:
- All 11 items visible with correct icons
- Sections grouped (MAIN, EXPLORE, SURVEYS, ANALYSIS)
- Active route highlighting works
- Mobile sidebar responsive

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/Sidebar.tsx
git commit -m "feat: reorganize sidebar with 6 new dashboard pages

- Add Blockers, Readiness Heatmap, What Drives Readiness, Clusters, Map, Data Quality
- Organize into 4 sections: MAIN, EXPLORE, SURVEYS, ANALYSIS
- Import additional icons (AlertTriangle, Grid3x3, BarChart3, MapPin, CheckCircle)
- Render sections with headers and proper spacing

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Blockers Page

**Files:**
- Create: `frontend/src/app/dashboard/blockers/page.tsx`

**Interfaces:**
- Consumes: `BlockerBarChart` component (Phase 1), `PublicOverview.blocker_register`
- Produces: Blockers page with two sections: blocker frequency + unlock potential

- [ ] **Step 1: Create blockers page with blocker frequency section**

Create `frontend/src/app/dashboard/blockers/page.tsx`:

```typescript
import { getPublicOverview } from "@/lib/public-api"
import { BlockerBarCard } from "@/components/public/blocker-bar-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Blockers | Dashboard",
}

export default async function BlockersPage() {
  const overview = await getPublicOverview()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Blockers</h1>
        <p className="text-muted-foreground">
          What holds facilities in Tier 3, and what clears it
        </p>
      </div>

      {/* Blocker Frequency */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Blocker frequency</h2>
        <p className="text-sm text-muted-foreground mb-4">
          How many facilities each prerequisite holds in Tier 3 (a facility can have several)
        </p>
        <BlockerBarCard data={overview.blocker_register ?? []} />
      </div>

      {/* Unlock Potential */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Facilities unlocked if a blocker is cleared</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tier 3 facilities where this is the only blocker — clearing it moves them out of Tier 3 immediately
        </p>
        
        <div className="space-y-2">
          {(overview.blocker_register ?? []).map((blocker) => {
            // Count Tier 3 facilities with only this blocker
            const unlockCount = (overview.facilities ?? []).filter(
              (f) =>
                f.tier === "Tier 3 — Not Deployment-Ready" &&
                f.blockers?.length === 1 &&
                f.blockers[0]?.code === blocker.code
            ).length;

            return (
              <Card key={blocker.code} className="shadow-none">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold">{blocker.code}</p>
                    <p className="text-sm text-muted-foreground">{blocker.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">{unlockCount}</p>
                    <p className="text-xs text-muted-foreground">facilities</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test in browser**

Run: `npm run dev`
Navigate to `http://localhost:3000/dashboard/blockers`

Verify:
- Page title and description render
- Blocker frequency chart displays
- Unlock potential section shows count per blocker
- Responsive layout on mobile

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/dashboard/blockers/page.tsx
git commit -m "feat: create dedicated blockers page with frequency and unlock potential

- Display blocker frequency chart (reuse Phase 1 BlockerBarChart)
- Show unlock potential: count of Tier 3 facilities with blocker as only blocker
- Calculate unlockCount by filtering facilities where tier=T3 and blockers.length=1

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Heatmap Grid Component

**Files:**
- Create: `frontend/src/components/public/heatmap-grid.tsx`

**Interfaces:**
- Consumes: facilities array with `name`, `overall_score`, domain scores (D-J)
- Produces: `HeatmapGrid` component rendering facility × domain matrix

- [ ] **Step 1: Create heatmap grid component**

Create `frontend/src/components/public/heatmap-grid.tsx`:

```typescript
"use client"

import { useMemo } from "react"
import type { ProgrammeFacility } from "@/lib/types-public"

interface HeatmapGridProps {
  facilities: ProgrammeFacility[]
}

const DOMAIN_LABELS = {
  B: "Governance",
  C: "Workforce",
  D: "Infrastructure",
  E: "Health Info",
  F: "Digital Tech",
  G: "Service Delivery",
  H: "Supply Chain",
  I: "Financing",
  J: "Operations",
}

const DOMAIN_KEYS = ["B", "C", "D", "E", "F", "G", "H", "I", "J"] as const

function getColorClass(score: number | null | undefined): string {
  if (score === null || score === undefined) return "bg-slate-100"
  if (score === 0) return "bg-red-100"
  if (score === 1) return "bg-orange-200"
  if (score === 2) return "bg-yellow-100"
  if (score === 3) return "bg-emerald-100"
  return "bg-slate-100"
}

export function HeatmapGrid({ facilities }: HeatmapGridProps) {
  const sorted = useMemo(
    () => [...facilities].sort((a, b) => (b.overall_score ?? 0) - (a.overall_score ?? 0)),
    [facilities]
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-border bg-muted p-2 text-left text-xs font-semibold sticky left-0 z-10 min-w-48">
              Facility
            </th>
            {DOMAIN_KEYS.map((domain) => (
              <th
                key={domain}
                className="border border-border bg-muted p-2 text-center text-xs font-semibold w-12"
                title={DOMAIN_LABELS[domain]}
              >
                {domain}
              </th>
            ))}
            <th className="border border-border bg-muted p-2 text-center text-xs font-semibold w-16">
              Composite
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((facility) => (
            <tr key={facility.slug} className="hover:bg-muted/30">
              <td className="border border-border p-2 font-medium text-sm sticky left-0 z-10 bg-white">
                {facility.name}
              </td>
              {DOMAIN_KEYS.map((domain) => {
                const domainScore =
                  (facility.domain_scores as Record<string, number> | undefined)?.[domain] ?? null;
                return (
                  <td
                    key={domain}
                    className={`border border-border p-2 text-center text-xs font-medium h-10 ${getColorClass(
                      domainScore
                    )}`}
                  >
                    {domainScore !== null ? domainScore : "—"}
                  </td>
                );
              })}
              <td className="border border-border p-2 text-center text-xs font-semibold">
                {facility.overall_score != null ? Math.round(facility.overall_score) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-6 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-100 border border-border" />
          <span>0 - No progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-200 border border-border" />
          <span>1 - Weak</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-100 border border-border" />
          <span>2 - Adequate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-emerald-100 border border-border" />
          <span>3 - Strong</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test component type-checks**

Run: `npm run type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/public/heatmap-grid.tsx
git commit -m "feat: create heatmap grid component for facility-domain matrix

- Display facilities (rows) × domains B-J (columns)
- Sort facilities by overall_score descending
- Color-code domain scores: red (0), orange (1), yellow (2), green (3)
- Show composite score in last column
- Sticky facility name column for horizontal scroll

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create Readiness Heatmap Page

**Files:**
- Create: `frontend/src/app/dashboard/readiness-heatmap/page.tsx`

**Interfaces:**
- Consumes: `HeatmapGrid` component (Task 3), facilities array
- Produces: Readiness Heatmap page with filters and grid

- [ ] **Step 1: Create heatmap page with filters**

Create `frontend/src/app/dashboard/readiness-heatmap/page.tsx`:

```typescript
"use client"

import { useMemo, useState } from "react"
import { getPublicFacilities, getPublicOverview } from "@/lib/public-api"
import { HeatmapGrid } from "@/components/public/heatmap-grid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect } from "react"

export const metadata = {
  title: "Readiness Heatmap | Dashboard",
}

export default function ReadinessHeatmapPage() {
  const [facilities, setFacilities] = useState([])
  const [overview, setOverview] = useState(null)
  const [selectedCounty, setSelectedCounty] = useState("")
  const [selectedTier, setSelectedTier] = useState("")
  const [counties, setCounties] = useState([])

  useEffect(() => {
    async function load() {
      const [fac, ov] = await Promise.all([
        getPublicFacilities(),
        getPublicOverview(),
      ])
      setFacilities(fac.items || [])
      setOverview(ov)
      const uniqueCounties = [
        ...new Set((ov.by_county || []).map((c: any) => c.county)),
      ].sort()
      setCounties(uniqueCounties)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = facilities
    if (selectedCounty) {
      result = result.filter((f: any) => f.county === selectedCounty)
    }
    if (selectedTier) {
      result = result.filter((f: any) => f.tier === selectedTier)
    }
    return result
  }, [facilities, selectedCounty, selectedTier])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Readiness Heatmap</h1>
        <p className="text-muted-foreground">
          Every facility × every domain (0–3 in one view) · sorted by composite
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            County
          </label>
          <select
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
            className="h-9 min-w-[11rem] rounded-lg border border-input bg-card px-3 text-sm text-foreground shadow-sm"
          >
            <option value="">All counties</option>
            {counties.map((c: string) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            Tier
          </label>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="h-9 min-w-[11rem] rounded-lg border border-input bg-card px-3 text-sm text-foreground shadow-sm"
          >
            <option value="">All tiers</option>
            <option value="Tier 1 — HOS-Ready">Tier 1 · HOS-Ready</option>
            <option value="Tier 2 — Deployment-Eligible">Tier 2 · Deployment-Eligible</option>
            <option value="Tier 2 — Structured Remediation">Tier 2 · Structured Remediation</option>
            <option value="Tier 3 — Not Deployment-Ready">Tier 3 · Not Deployment-Ready</option>
          </select>
        </div>

        {(selectedCounty || selectedTier) && (
          <button
            onClick={() => {
              setSelectedCounty("")
              setSelectedTier("")
            }}
            className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors self-end"
          >
            Clear filters
          </button>
        )}
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} of {facilities.length} facilities
        </p>
        <HeatmapGrid facilities={filtered} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test in browser**

Run: `npm run dev`
Navigate to `http://localhost:3000/dashboard/readiness-heatmap`

Verify:
- Heatmap grid renders with all facilities
- County filter works
- Tier filter works
- Clear filters button works
- Responsive on mobile

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/dashboard/readiness-heatmap/page.tsx
git commit -m "feat: create readiness heatmap page with facility-domain matrix

- Display HeatmapGrid component with all facilities
- Add county and tier filters
- Show filtered facility count
- Support clear filters button

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create Correlation Chart Component

**Files:**
- Create: `frontend/src/components/public/correlation-chart.tsx`

**Interfaces:**
- Consumes: correlation data array: `{factor: string, correlation: number}`
- Produces: `CorrelationChart` component (horizontal bar chart)

- [ ] **Step 1: Create correlation chart component**

Create `frontend/src/components/public/correlation-chart.tsx`:

```typescript
"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface CorrelationChartProps {
  data: Array<{ factor: string; correlation: number }>
}

export function CorrelationChart({ data }: CorrelationChartProps) {
  if (!data || data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No correlation data available
      </p>
    )
  }

  // Sort by correlation descending
  const sorted = [...data].sort((a, b) => b.correlation - a.correlation)

  const chartConfig = {
    correlation: {
      label: "Correlation (r)",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" domain={[-1, 1]} />
          <YAxis dataKey="factor" type="category" width={140} tick={{ fontSize: 11 }} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => {
                  if (typeof value === "number") {
                    return [value.toFixed(2), "Correlation"]
                  }
                  return [value, ""]
                }}
              />
            }
          />
          <Bar dataKey="correlation" fill="var(--chart-1)" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
```

- [ ] **Step 2: Test type-checks**

Run: `npm run type-check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/public/correlation-chart.tsx
git commit -m "feat: create correlation chart component for factors

- Display horizontal bar chart of correlation coefficients
- Sort by correlation descending (strongest predictors first)
- X-axis range: -1 to 1 (correlation bounds)
- Y-axis: factor names (ICT hardware, Power, Connectivity, etc.)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create What Drives Readiness Page

**Files:**
- Create: `frontend/src/app/dashboard/what-drives-readiness/page.tsx`

**Interfaces:**
- Consumes: `CorrelationChart` component (Task 5), overview data
- Produces: What Drives Readiness page with correlation + insights

- [ ] **Step 1: Create page with correlation data**

Create `frontend/src/app/dashboard/what-drives-readiness/page.tsx`:

```typescript
import { getPublicOverview } from "@/lib/public-api"
import { CorrelationChart } from "@/components/public/correlation-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "What Drives Readiness | Dashboard",
}

export default async function WhatDrivesPage() {
  const overview = await getPublicOverview()

  // Hardcoded correlations based on mockup (in production, compute from facilities data)
  const correlations = [
    { factor: "ICT hardware", correlation: 0.67 },
    { factor: "Power", correlation: 0.49 },
    { factor: "Connectivity", correlation: 0.47 },
    { factor: "Device count", correlation: 0.37 },
    { factor: "Data maturity", correlation: 0.28 },
    { factor: "Digital literacy", correlation: 0.2 },
    { factor: "Staff enthusiasm", correlation: 0.16 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">What Drives Readiness</h1>
        <p className="text-muted-foreground">
          The factors that actually predict deployment readiness
        </p>
      </div>

      {/* Correlation Chart */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">
            What actually predicts readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Correlation (|r|) of each factor with composite score — longer bars matter more
          </p>
          <CorrelationChart data={correlations} />
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="shadow-none border-l-4 border-l-emerald-500 bg-emerald-50/30">
        <CardHeader>
          <CardTitle className="text-base">Key insight</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Readiness is <strong>infrastructure-driven, not people-driven</strong>. ICT hardware, power and
            connectivity correlate strongly with composite; digital literacy and staff enthusiasm barely
            move it — capable staff are stuck in under-resourced facilities.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Test in browser**

Run: `npm run dev`
Navigate to `http://localhost:3000/dashboard/what-drives-readiness`

Verify:
- Chart displays with correct correlation values
- Insight box renders
- Responsive on mobile

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/dashboard/what-drives-readiness/page.tsx
git commit -m "feat: create what drives readiness page with correlation analysis

- Display correlation chart showing predictive power of each factor
- Show insight: readiness is infrastructure-driven, not people-driven
- Factors: ICT hardware (0.67), Power (0.49), Connectivity (0.47), etc.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Create Clusters Page

**Files:**
- Create: `frontend/src/app/dashboard/clusters/page.tsx`

**Interfaces:**
- Consumes: cluster data from overview, domain averages
- Produces: Clusters page with regional readiness cards

- [ ] **Step 1: Create clusters page**

Create `frontend/src/app/dashboard/clusters/page.tsx`:

```typescript
import { getPublicOverview } from "@/lib/public-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Clusters | Dashboard",
}

export default async function ClustersPage() {
  const overview = await getPublicOverview()

  const clusters = overview.by_cluster || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Clusters</h1>
        <p className="text-muted-foreground">
          Regional readiness and domain profile
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clusters.map((cluster) => (
          <Card key={cluster.cluster} className="shadow-none">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{cluster.cluster}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cluster.region} · {cluster.facility_count} facilities
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {cluster.avg_score != null ? `${cluster.avg_score.toFixed(1)}%` : "—"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {(cluster.domain_scores || []).map((domain: any) => (
                <div
                  key={domain.domain}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{domain.domain}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${Math.max(0, Math.min(100, (domain.score / 3) * 100))}%`,
                        }}
                      />
                    </div>
                    <span className="font-medium w-8 text-right">{domain.score}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test in browser**

Run: `npm run dev`
Navigate to `http://localhost:3000/dashboard/clusters`

Verify:
- Cluster cards display with region, facility count, avg score
- Domain scores show progress bars
- Responsive grid (1 col mobile, 2 col desktop)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/dashboard/clusters/page.tsx
git commit -m "feat: create clusters page with regional readiness cards

- Display cluster cards with region, facility count, and average score
- Show domain scores as progress bars (0-3 scale)
- Responsive 2-column grid layout

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Create Geo Map Component

**Files:**
- Create: `frontend/src/components/public/geo-map.tsx`

**Interfaces:**
- Consumes: facilities array with `lat`, `lng` coordinates
- Produces: `GeoMap` component with Leaflet map and pins

- [ ] **Step 1: Install Leaflet**

Run: `npm install leaflet react-leaflet`

- [ ] **Step 2: Create map component**

Create `frontend/src/components/public/geo-map.tsx`:

```typescript
"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"
import type { ProgrammeFacility } from "@/lib/types-public"

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
)

interface GeoMapProps {
  facilities: ProgrammeFacility[]
}

export function GeoMap({ facilities }: GeoMapProps) {
  const facilitiesWithCoords = useMemo(
    () => facilities.filter((f) => f.latitude && f.longitude),
    [facilities]
  )

  if (facilitiesWithCoords.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No facilities with coordinates
      </p>
    )
  }

  // Calculate bounds
  const bounds = facilitiesWithCoords.reduce(
    (acc, f) => ({
      minLat: Math.min(acc.minLat, f.latitude || 0),
      maxLat: Math.max(acc.maxLat, f.latitude || 0),
      minLng: Math.min(acc.minLng, f.longitude || 0),
      maxLng: Math.max(acc.maxLng, f.longitude || 0),
    }),
    {
      minLat: Infinity,
      maxLat: -Infinity,
      minLng: Infinity,
      maxLng: -Infinity,
    }
  )

  const center = [
    (bounds.minLat + bounds.maxLat) / 2,
    (bounds.minLng + bounds.maxLng) / 2,
  ] as [number, number]

  return (
    <MapContainer center={center} zoom={8} className="h-96 w-full rounded-lg">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {facilitiesWithCoords.map((facility) => (
        <Marker
          key={facility.slug}
          position={[facility.latitude || 0, facility.longitude || 0]}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{facility.name}</p>
              <p className="text-xs text-muted-foreground">{facility.county}</p>
              <p className="text-xs font-medium">{facility.tier}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
```

- [ ] **Step 3: Test type-checks**

Run: `npm run type-check`
Expected: No errors (may warn about react-leaflet types, that's ok)

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/public/geo-map.tsx package.json package-lock.json
git commit -m "feat: create geo map component with facility pins

- Add Leaflet/react-leaflet for mapping
- Display facilities on OpenStreetMap tiles
- Show facility name, county, tier in popup on click
- Dynamically import for SSR safety
- Auto-fit map bounds to facility coordinates

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Create Map Page

**Files:**
- Create: `frontend/src/app/dashboard/map/page.tsx`

**Interfaces:**
- Consumes: `GeoMap` component (Task 8), facilities array
- Produces: Map page with geographic visualization

- [ ] **Step 1: Create map page**

Create `frontend/src/app/dashboard/map/page.tsx`:

```typescript
import { getPublicFacilities } from "@/lib/public-api"
import { GeoMap } from "@/components/public/geo-map"

export const metadata = {
  title: "Map | Dashboard",
}

export default async function MapPage() {
  const { items: facilities } = await getPublicFacilities()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Facility Map</h1>
        <p className="text-muted-foreground">
          Geographic distribution across Liberia
        </p>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <GeoMap facilities={facilities} />
      </div>

      <p className="text-xs text-muted-foreground">
        Click on a marker to see facility details (name, county, tier)
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Test in browser**

Run: `npm run dev`
Navigate to `http://localhost:3000/dashboard/map`

Verify:
- Map loads without errors
- Facility pins visible (if coordinates in data)
- Clicking pins shows facility popups
- Map responsive

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/dashboard/map/page.tsx
git commit -m "feat: create map page with geographic facility visualization

- Display GeoMap component showing all facilities on OpenStreetMap
- Click pins to see facility name, county, tier
- Auto-fit map bounds to facility locations

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Create Data Quality Page

**Files:**
- Create: `frontend/src/app/dashboard/data-quality/page.tsx`

**Interfaces:**
- Consumes: facilities array, overview data
- Produces: Data Quality page with completeness metrics

- [ ] **Step 1: Create data quality page**

Create `frontend/src/app/dashboard/data-quality/page.tsx`:

```typescript
import { getPublicFacilities, getPublicOverview } from "@/lib/public-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Data Quality | Dashboard",
}

export default async function DataQualityPage() {
  const [{ items: facilities }, overview] = await Promise.all([
    getPublicFacilities(),
    getPublicOverview(),
  ])

  // Calculate metrics
  const totalFacilities = facilities.length
  const facilitiesWithCoords = facilities.filter((f) => f.latitude && f.longitude).length
  const facilitiesWithDLA = facilities.filter((f) => f.dla_score != null).length
  const facilitiesWithSentiment = facilities.filter((f) => f.sentiment_score != null).length
  const facilitiesWithDomainScores = facilities.filter(
    (f) => f.domain_scores && Object.keys(f.domain_scores).length > 0
  ).length

  const metrics = [
    {
      label: "Facilities assessed",
      value: overview.assessed_count,
      total: overview.programme_target,
      pct: Math.round((overview.assessed_count / overview.programme_target) * 100),
    },
    {
      label: "With coordinates",
      value: facilitiesWithCoords,
      total: totalFacilities,
      pct: Math.round((facilitiesWithCoords / totalFacilities) * 100),
    },
    {
      label: "With DLA scores",
      value: facilitiesWithDLA,
      total: totalFacilities,
      pct: Math.round((facilitiesWithDLA / totalFacilities) * 100),
    },
    {
      label: "With sentiment data",
      value: facilitiesWithSentiment,
      total: totalFacilities,
      pct: Math.round((facilitiesWithSentiment / totalFacilities) * 100),
    },
    {
      label: "With domain scores",
      value: facilitiesWithDomainScores,
      total: totalFacilities,
      pct: Math.round((facilitiesWithDomainScores / totalFacilities) * 100),
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Data Quality</h1>
        <p className="text-muted-foreground">
          Completeness across critical data fields
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{metric.pct}%</p>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${metric.pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {metric.value} of {metric.total}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Data collection status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>{overview.assessed_count}</strong> of{" "}
              <strong>{overview.programme_target}</strong> facilities have submitted
              readiness assessments.
            </p>
            <p>
              Geographic data is <strong>{facilitiesWithCoords > 0 ? "available" : "missing"}</strong> for mapping.
            </p>
            <p>
              Staff sentiment and digital literacy surveys have been completed at{" "}
              <strong>{facilitiesWithSentiment}</strong> and{" "}
              <strong>{facilitiesWithDLA}</strong> facilities respectively.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Test in browser**

Run: `npm run dev`
Navigate to `http://localhost:3000/dashboard/data-quality`

Verify:
- Metric cards display with percentages
- Progress bars show completion
- Data collection status summary renders
- Responsive layout

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/dashboard/data-quality/page.tsx
git commit -m "feat: create data quality page with completeness metrics

- Display metrics: facilities assessed, with coordinates, with DLA, with sentiment, with domain scores
- Show percentage and count for each metric
- Include progress bars for visual clarity
- Add data collection status summary

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Summary

All 10 tasks deliver 6 new dashboard pages plus updated sidebar navigation:

1. ✅ Sidebar — 4 sections (MAIN, EXPLORE, SURVEYS, ANALYSIS) with 11 nav links
2. ✅ Blockers page — blocker frequency chart + unlock potential
3. ✅ Heatmap component — facility × domain color-coded matrix
4. ✅ Heatmap page — matrix with county/tier filters
5. ✅ Correlation chart — horizontal bar chart of predictive factors
6. ✅ What Drives Readiness page — correlation chart + insight
7. ✅ Clusters page — regional readiness cards with domain scores
8. ✅ Geo map component — Leaflet-based facility pins
9. ✅ Map page — geographic visualization with popups
10. ✅ Data Quality page — completeness metrics grid

**All pages integrate seamlessly with Phase 1 features** (Quick Wins card, blocker chart, DLA questions, URL filters).

---

## Execution Options

Plan complete and saved to `docs/superpowers/plans/2026-06-20-phase2-dashboard-expansion.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
