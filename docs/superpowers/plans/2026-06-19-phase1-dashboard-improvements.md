# Phase 1 Dashboard Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add blocker frequency visualization, quick wins detection, question-level DLA analytics, and URL-persistent filters to improve facility readiness dashboard usability.

**Architecture:** Build new React components (bar charts, cards, tabs) that consume existing backend data. Add URL-aware filtering to overview and facilities pages. Create new backend endpoint for question-level DLA statistics. All data already available in backend or CSV — no new data collection needed.

**Tech Stack:** Next.js 15 (App Router), Recharts (charting), shadcn/ui (Tabs), Tailwind CSS, Typescript, Python FastAPI (backend), CSV data

## Global Constraints

- Use existing Recharts setup (BarChart, Pie, Tooltip, etc.) for consistency
- Responsive design: mobile-first, test on lg/md/sm breakpoints
- All new components must be "use client" if using client-side hooks (state, router)
- URL params: county and tier on overview/facilities (searchParams and useRouter for persistence)
- Quick Wins definition: Tier 3 facilities with exactly 1 blocker (score ≥ 65% doesn't block, just 1 blocker)
- Blocker bar chart: vertical bars, sorted by facility count descending, no "unlock count" callout
- DLA questions chart: all 10 questions, sorted by correct-rate descending, show weakest area highlight
- All API calls use existing public API endpoints (blocker_register in overview, DLA CSV for questions)
- Git commits after each task with descriptive messages
- Tests run and pass before commit (build, lint, type checking)

---

## Task 1: Create Blocker Bar Chart Component

**Files:**
- Create: `frontend/src/components/public/blocker-bar-chart.tsx`
- Test: Visual verification in browser (no unit tests required)

**Interfaces:**
- Consumes: `blockers` array from `PublicOverview.blocker_register` with shape `Array<{code: string, description: string, count: number}>`
- Produces: `BlockerBarChart` (chart component) and `BlockerBarCard` (card wrapper) exported as named exports

**Context:**
The backend already provides blocker frequency data in the `/public/overview` endpoint as `blocker_register` field. You're building a vertical bar chart that displays this data. Use Recharts BarChart with `layout="vertical"`, X-axis for count, Y-axis for blocker codes (e.g., "POWER_NONE", "BACKUP_NONE"). No custom click handlers needed for this task.

- [ ] **Step 1: Create component file with imports**

Create `frontend/src/components/public/blocker-bar-chart.tsx`:

```typescript
"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface BlockerBarChartProps {
  blockers: Array<{ code: string; description: string; count: number }>
}

interface BlockerBarCardProps {
  blockers: Array<{ code: string; description: string; count: number }>
}

export function BlockerBarChart({ blockers }: BlockerBarChartProps) {
  // Implementation goes here
}

export function BlockerBarCard({ blockers }: BlockerBarCardProps) {
  // Implementation goes here
}
```

- [ ] **Step 2: Implement BlockerBarChart component**

Replace the `BlockerBarChart` function:

```typescript
export function BlockerBarChart({ blockers }: BlockerBarChartProps) {
  // Sort by count descending
  const sortedData = [...blockers]
    .sort((a, b) => b.count - a.count)
    .map((blocker) => ({
      ...blocker,
      // Short code for Y-axis label (e.g., "POWER_NONE" → "POWER_NONE")
      label: blocker.code,
    }))

  const chartConfig: ChartConfig = {
    count: {
      label: "Facilities",
      color: "hsl(var(--chart-1))",
    },
  }

  if (sortedData.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No blockers found
      </p>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="label" type="category" width={140} tick={{ fontSize: 12 }} />
          <ChartTooltip
            cursor={{ fill: "rgba(0,0,0,0.1)" }}
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => {
                  if (name === "count") {
                    return [
                      `${value} facilities`,
                      props.payload?.description || "Unknown blocker",
                    ]
                  }
                  return [value, name]
                }}
              />
            }
          />
          <Bar dataKey="count" fill="hsl(var(--chart-1))" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
```

- [ ] **Step 3: Implement BlockerBarCard wrapper**

Replace the `BlockerBarCard` function:

```typescript
export function BlockerBarCard({ blockers }: BlockerBarCardProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Blockers (facility count)</CardTitle>
      </CardHeader>
      <CardContent>
        <BlockerBarChart blockers={blockers} />
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Test in browser**

Run dev server: `npm run dev` (from frontend directory)

Navigate to http://localhost:3000 → overview page. Verify:
- Chart displays with vertical bars
- Bars are sorted by count (highest on top)
- Hovering shows blocker code and description
- No errors in console

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/public/blocker-bar-chart.tsx
git commit -m "feat: add blocker frequency bar chart component"
```

---

## Task 2: Add Blocker Bar Chart to Overview Page

**Files:**
- Modify: `frontend/src/app/page.tsx` (import and place chart in grid)
- Modify: `frontend/src/lib/types-public.ts` (add blocker_register field if missing)

**Interfaces:**
- Consumes: `BlockerBarCard` from Task 1, `PublicOverview` type with `blocker_register` field
- Produces: Updated overview page layout with chart positioned in grid

**Context:**
The overview page fetches `PublicOverview` data which includes `blocker_register` array. You need to import the `BlockerBarCard` and place it in the charts grid alongside the domain bar chart. The blocker chart should be about the same width as other single-column charts.

- [ ] **Step 1: Verify blocker_register field in types**

Read `frontend/src/lib/types-public.ts` and check for `blocker_register` field. If it's missing, add it to the `PublicOverview` interface:

```typescript
blocker_register?: Array<{
  code: string
  description: string
  count: number
}>
```

- [ ] **Step 2: Update overview page imports**

In `frontend/src/app/page.tsx`, add import:

```typescript
import { BlockerBarCard } from "@/components/public/blocker-bar-chart"
```

- [ ] **Step 3: Render chart in grid**

In the charts section of the overview page (where DomainBarCard and other charts are), add:

```typescript
<BlockerBarCard blockers={overview.blocker_register ?? []} />
```

Place it in the same grid layout as the domain bar chart (e.g., `lg:col-span-1`).

- [ ] **Step 4: Test in browser**

Run dev server and navigate to http://localhost:3000

Verify:
- Blocker chart appears on overview page
- Chart renders with data from overview
- Page layout is responsive (no layout shift)
- No TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/page.tsx frontend/src/lib/types-public.ts
git commit -m "feat: add blocker bar chart to overview page"
```

---

## Task 3: Create Quick Wins Card Component

**Files:**
- Create: `frontend/src/components/public/quick-wins-card.tsx`

**Interfaces:**
- Consumes: `count: number` (number of quick wins facilities)
- Produces: `QuickWinsCard` component (returns null if count === 0)

**Context:**
Quick Wins are facilities that are Tier 3 (Not Deployment-Ready) AND have exactly 1 blocker. The card should display the count with a Zap icon (or similar), styled with amber/warning colors to indicate "fixable" opportunities. The card links to `/dashboard/quick-wins` page.

- [ ] **Step 1: Create Quick Wins card component**

Create `frontend/src/components/public/quick-wins-card.tsx`:

```typescript
"use client"

import Link from "next/link"
import { Zap } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface QuickWinsCardProps {
  count: number
}

export function QuickWinsCard({ count }: QuickWinsCardProps) {
  if (count === 0) {
    return null
  }

  return (
    <Card className="shadow-none border-amber-200/80 bg-amber-50/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-600" />
          Quick Wins
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-3xl font-bold text-amber-900">{count}</p>
        <p className="text-xs text-amber-800 mb-4">
          Tier 3 with 1 blocker (fixable)
        </p>
        <Link
          href="/dashboard/quick-wins"
          className="inline-block text-sm font-medium text-amber-700 hover:text-amber-900 underline-offset-2 hover:underline"
        >
          View → 
        </Link>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Test component exports**

Verify the file has no syntax errors:

```bash
cd frontend && npm run type-check
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/public/quick-wins-card.tsx
git commit -m "feat: add quick wins card component"
```

---

## Task 4: Create Quick Wins Page with Layout

**Files:**
- Create: `frontend/src/app/dashboard/quick-wins/page.tsx`
- Create: `frontend/src/app/dashboard/quick-wins/layout.tsx`

**Interfaces:**
- Consumes: Facilities array with `tier` and `blockers` fields (from server component)
- Produces: Server-rendered page with quick wins list, layout with auth guard

**Context:**
Quick Wins page shows facilities that are Tier 3 (Not Deployment-Ready) AND have exactly 1 blocker. The layout should enforce admin-only access by checking the auth token and is_admin status. Each facility card shows name, county, score, and the blocking blocker description.

- [ ] **Step 1: Create layout with auth guard**

Create `frontend/src/app/dashboard/quick-wins/layout.tsx`:

```typescript
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { verifyAdminAuth } from "@/lib/auth"

export const metadata = {
  title: "Quick Wins | Dashboard",
}

export default async function QuickWinsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = await verifyAdminAuth()
  if (!isAdmin) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-4">{children}</div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Create quick wins page**

Create `frontend/src/app/dashboard/quick-wins/page.tsx`:

```typescript
import Link from "next/link"
import { getPublicOverview } from "@/lib/public-api"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = {
  title: "Quick Wins | Dashboard",
}

export default async function QuickWinsPage() {
  const overview = await getPublicOverview()

  // Filter: Tier 3 + exactly 1 blocker
  const quickWins = overview.facilities
    ? overview.facilities.filter(
        (f) =>
          f.tier === "Tier 3 — Not Deployment-Ready" &&
          f.blockers &&
          f.blockers.length === 1
      )
    : []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quick Wins</h1>
        <p className="text-muted-foreground">
          Tier 3 facilities with exactly 1 blocker that can be fixed to unlock deployment readiness.
        </p>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        {quickWins.length} facilit{quickWins.length === 1 ? "y" : "ies"} found
      </div>

      {quickWins.length === 0 ? (
        <Card className="shadow-none">
          <CardContent className="py-12 text-center text-muted-foreground">
            No quick wins available right now.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quickWins.map((facility) => (
            <Link
              key={facility.slug}
              href={`/dashboard/facility/${facility.slug}`}
              className="block"
            >
              <Card className="shadow-none hover:border-foreground/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{facility.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">County:</span>
                      <span className="font-medium">{facility.county}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Score:</span>
                      <span className="font-medium">
                        {facility.score != null ? `${facility.score}%` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Blocker:</span>
                      <span className="font-medium text-amber-700">
                        {facility.blockers?.[0]?.description ||
                          facility.blockers?.[0]?.code ||
                          "Unknown"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Test in browser**

Run dev server and navigate to http://localhost:3000/dashboard/quick-wins

Verify:
- Page loads (auth guard passes for admin)
- Shows count and list of quick wins facilities
- Each card shows name, county, score, and blocking blocker
- Cards are clickable and link to facility detail page
- Empty state shows if no quick wins

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/dashboard/quick-wins/page.tsx frontend/src/app/dashboard/quick-wins/layout.tsx
git commit -m "feat: add quick wins page with auth layout"
```

---

## Task 5: Add Quick Wins Card to Overview Page

**Files:**
- Modify: `frontend/src/components/public/interactive-overview.tsx` (calculate quickWinsCount)
- Modify: `frontend/src/app/page.tsx` (import and place QuickWinsCard)

**Interfaces:**
- Consumes: `QuickWinsCard` from Task 3, facilities array from overview
- Produces: Updated overview page with quick wins card above or adjacent to charts

**Context:**
Calculate the number of quick wins (Tier 3 + 1 blocker) from the facilities array, then pass to `QuickWinsCard`. If count is 0, the card returns null and won't display. Place it prominently near the KPI metrics.

- [ ] **Step 1: Update interactive-overview to calculate quick wins**

In `frontend/src/components/public/interactive-overview.tsx`, add at the top of the component:

```typescript
const quickWinsCount = overview.facilities
  ? overview.facilities.filter(
      (f) =>
        f.tier === "Tier 3 — Not Deployment-Ready" &&
        f.blockers &&
        f.blockers.length === 1
    ).length
  : 0
```

- [ ] **Step 2: Update page.tsx imports**

In `frontend/src/app/page.tsx`, add import:

```typescript
import { QuickWinsCard } from "@/components/public/quick-wins-card"
```

- [ ] **Step 3: Render QuickWinsCard in overview**

In the KPI metrics section of `interactive-overview.tsx`, add the card render after the standard KPIs (or in the grid alongside them):

```typescript
{quickWinsCount > 0 && <QuickWinsCard count={quickWinsCount} />}
```

Or add it to the KPI grid with appropriate span:

```typescript
<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 mb-8">
  {/* Existing KPI metrics */}
  {quickWinsCount > 0 && (
    <div className="lg:col-span-1">
      <QuickWinsCard count={quickWinsCount} />
    </div>
  )}
</div>
```

- [ ] **Step 4: Test in browser**

Navigate to http://localhost:3000

Verify:
- Overview page displays
- Quick wins card appears if quickWinsCount > 0
- Card shows correct count
- Card is clickable and links to /dashboard/quick-wins
- Card disappears if no quick wins exist

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/public/interactive-overview.tsx frontend/src/app/page.tsx
git commit -m "feat: add quick wins card to overview page"
```

---

## Task 6: Add Question-Level DLA Data Helper to public-api.ts

**Files:**
- Modify: `frontend/src/lib/public-api.ts` (add function and interface)
- Modify: `frontend/src/lib/types-public.ts` (add QuestionStat interface)

**Interfaces:**
- Consumes: Backend `/public/dla/questions` endpoint (will be created in Task 11)
- Produces: `getPublicDlaQuestionStats()` async function returning `Array<QuestionStat>`, where QuestionStat has: questionNumber, questionText, correctCount, totalResponses, correctRate

**Context:**
This is the frontend API call helper that will fetch DLA question-level statistics. The backend endpoint returns aggregated data for all 10 DLA questions showing how many respondents got each question correct. The correctRate is a percentage (0-100).

- [ ] **Step 1: Add QuestionStat interface to types-public.ts**

In `frontend/src/lib/types-public.ts`, add:

```typescript
export interface QuestionStat {
  questionNumber: number
  questionText: string
  correctCount: number
  totalResponses: number
  correctRate: number
}
```

- [ ] **Step 2: Add getPublicDlaQuestionStats function**

In `frontend/src/lib/public-api.ts`, add:

```typescript
export async function getPublicDlaQuestionStats(): Promise<QuestionStat[]> {
  try {
    const url = `${API_BASE_URL}/public/dla/questions`
    const response = await fetch(url, { cache: "no-store" })

    if (!response.ok) {
      throw new Error(`Failed to fetch DLA question stats: ${response.statusText}`)
    }

    const data = await response.json()
    return data.questions || []
  } catch (error) {
    console.error("Error fetching DLA question stats:", error)
    return []
  }
}
```

- [ ] **Step 3: Test type checking**

```bash
cd frontend && npm run type-check
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/public-api.ts frontend/src/lib/types-public.ts
git commit -m "feat: add question-level DLA stats API helper"
```

---

## Task 7: Create DLA Questions Chart Component

**Files:**
- Create: `frontend/src/components/public/dla-questions-chart.tsx`

**Interfaces:**
- Consumes: `QuestionStat[]` array from Task 6 API function
- Produces: `DlaQuestionsChart` (chart) and `DlaQuestionsCard` (card wrapper) components

**Context:**
Horizontal bar chart showing all 10 DLA questions sorted by correctRate (descending). Y-axis shows question labels (Q1, Q2, etc.), X-axis shows correctRate (0-100%). Add a "Weakest area" callout highlighting the question with the lowest correct rate.

- [ ] **Step 1: Create DLA questions chart component**

Create `frontend/src/components/public/dla-questions-chart.tsx`:

```typescript
"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { QuestionStat } from "@/lib/types-public"

interface DlaQuestionsChartProps {
  questions: QuestionStat[]
}

interface DlaQuestionsCardProps {
  questions: QuestionStat[]
}

export function DlaQuestionsChart({ questions }: DlaQuestionsChartProps) {
  // Sort by correctRate descending
  const sortedQuestions = [...questions].sort((a, b) => b.correctRate - a.correctRate)

  const chartData = sortedQuestions.map((q) => ({
    ...q,
    label: `Q${q.questionNumber}`,
  }))

  const chartConfig: ChartConfig = {
    correctRate: {
      label: "Correct Rate (%)",
      color: "hsl(var(--chart-1))",
    },
  }

  if (chartData.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No question data available
      </p>
    )
  }

  const weakestArea = sortedQuestions[sortedQuestions.length - 1]

  return (
    <div className="space-y-4">
      {weakestArea && (
        <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 p-3">
          <p className="text-xs font-medium text-amber-900 mb-1">Weakest area</p>
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Q{weakestArea.questionNumber}</span> ({weakestArea.correctRate.toFixed(1)}% correct)
          </p>
        </div>
      )}

      <ChartContainer config={chartConfig} className="aspect-auto w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="label" type="category" width={70} tick={{ fontSize: 12 }} />
            <ChartTooltip
              cursor={{ fill: "rgba(0,0,0,0.1)" }}
              content={
                <ChartTooltipContent
                  formatter={(value) => {
                    if (typeof value === "number") {
                      return [`${value.toFixed(1)}%`, "Correct Rate"]
                    }
                    return [value, ""]
                  }}
                />
              }
            />
            <Bar dataKey="correctRate" fill="hsl(var(--chart-1))" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

export function DlaQuestionsCard({ questions }: DlaQuestionsCardProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Questions (by correct rate)</CardTitle>
      </CardHeader>
      <CardContent>
        <DlaQuestionsChart questions={questions} />
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Test type checking**

```bash
cd frontend && npm run type-check
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/public/dla-questions-chart.tsx
git commit -m "feat: add DLA questions chart component"
```

---

## Task 8: Add Questions Tab to DLA Page

**Files:**
- Modify: `frontend/src/app/dla/page.tsx` (add Tabs and Questions tab)

**Interfaces:**
- Consumes: `DlaQuestionsCard` from Task 7, `getPublicDlaQuestionStats()` from Task 6
- Produces: Updated DLA page with tabs (By Facility, By Question)

**Context:**
The DLA page currently shows facility-level DLA data in a table. Add shadcn/ui Tabs at the top with two tabs: "By Facility" (existing table) and "By Question" (new chart from Task 7). Fetch question stats server-side and pass to chart. Handle missing data gracefully.

- [ ] **Step 1: Update DLA page with Tabs**

Modify `frontend/src/app/dla/page.tsx`:

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DlaQuestionsCard } from "@/components/public/dla-questions-chart"
import { getPublicDlaQuestionStats } from "@/lib/public-api"
// Keep existing imports...

export default async function DlaPage() {
  // Keep existing facility stats fetch
  const facilities = await getPublicDlaFacilities() // existing function

  // Fetch question stats
  const questionStats = await getPublicDlaQuestionStats()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Digital Literacy Assessment</h1>
        <p className="text-muted-foreground">
          Staff digital literacy scores across facilities and questions.
        </p>
      </div>

      <Tabs defaultValue="by-facility" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="by-facility">By Facility</TabsTrigger>
          <TabsTrigger value="by-question">By Question</TabsTrigger>
        </TabsList>

        <TabsContent value="by-facility" className="space-y-4">
          {/* Existing facility table or component */}
          {/* e.g., <DlaTable facilities={facilities} /> */}
        </TabsContent>

        <TabsContent value="by-question" className="space-y-4">
          {questionStats && questionStats.length > 0 ? (
            <DlaQuestionsCard questions={questionStats} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Question data not available yet
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: Test in browser**

Navigate to http://localhost:3000/dla

Verify:
- Page loads with Tabs
- "By Facility" tab shows existing data (table or whatever was there)
- "By Question" tab shows question chart
- Clicking between tabs switches content
- No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/dla/page.tsx
git commit -m "feat: add question-level tab to DLA page"
```

---

## Task 9: Implement URL-Persistent Filters on Overview Page

**Files:**
- Modify: `frontend/src/components/public/interactive-overview.tsx` (add useSearchParams/useRouter)

**Interfaces:**
- Consumes: `searchParams` from Next.js URL
- Produces: Filter state synchronized with URL query params (`?county=X&tier=Y`)

**Context:**
Update the interactive-overview component to read initial filter state from URL params and sync changes back to URL. This makes filtered views shareable. When user selects a county or tier, the URL updates. When page loads, URL params are restored to filter state.

- [ ] **Step 1: Add URL-aware filter logic**

In `frontend/src/components/public/interactive-overview.tsx`, import:

```typescript
"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useMemo, useEffect, useState } from "react"
```

- [ ] **Step 2: Initialize filter state from URL**

In the component function, add:

```typescript
export function InteractiveOverview({ overview, counties }: InteractiveOverviewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedCounty, setSelectedCounty] = useState<string>(
    searchParams.get("county") || ""
  )
  const [selectedTier, setSelectedTier] = useState<string>(
    searchParams.get("tier") || ""
  )

  // ... rest of component
}
```

- [ ] **Step 3: Add URL sync handlers**

Replace the county/tier select onChange handlers:

```typescript
const handleCountyChange = (county: string) => {
  setSelectedCounty(county)
  const params = new URLSearchParams(searchParams.toString())
  if (county) {
    params.set("county", county)
    params.delete("tier") // Clear tier when county changes
  } else {
    params.delete("county")
  }
  router.push(`?${params.toString()}`)
}

const handleTierChange = (tier: string) => {
  setSelectedTier(tier)
  const params = new URLSearchParams(searchParams.toString())
  if (tier) {
    params.set("tier", tier)
    params.delete("county") // Clear county when tier changes
  } else {
    params.delete("tier")
  }
  router.push(`?${params.toString()}`)
}
```

Update selects:

```typescript
<select
  id="county-filter"
  value={selectedCounty}
  onChange={(e) => handleCountyChange(e.target.value)}
  className={selectClassName}
>
  {/* options */}
</select>

<select
  id="tier-filter"
  value={selectedTier}
  onChange={(e) => handleTierChange(e.target.value)}
  className={selectClassName}
>
  {/* options */}
</select>
```

- [ ] **Step 4: Update clear filters button**

```typescript
<button
  onClick={() => {
    setSelectedCounty("")
    setSelectedTier("")
    router.push("") // Clear URL
  }}
  className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
>
  Clear filters
</button>
```

- [ ] **Step 5: Test in browser**

Navigate to http://localhost:3000

Verify:
- Selecting county updates URL to `?county=X`
- Selecting tier updates URL to `?tier=Y`
- Navigating directly with URL params pre-selects filters
- Filters can be shared via URL
- Clear filters button clears URL
- Charts update with filters

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/public/interactive-overview.tsx
git commit -m "feat: add URL-persistent filters to overview page"
```

---

## Task 10: Implement URL-Persistent Filters on Facilities Page

**Files:**
- Modify: `frontend/src/app/facilities/page.tsx` (create client wrapper with filter logic)

**Interfaces:**
- Consumes: `searchParams` from Next.js URL, `FacilityFilters` component
- Produces: Filtered facilities list synchronized with URL query params

**Context:**
The facilities page should support `?county=X` and `?tier=Y` URL params. Create a client component wrapper that reads searchParams, filters the facilities array, and passes both the filters component and filtered list to render.

- [ ] **Step 1: Create facilities filter wrapper**

Create a client component at the top of the page or in a separate file. In `frontend/src/app/facilities/page.tsx`, wrap the main content:

```typescript
"use client"

import { useSearchParams } from "next/navigation"
import { useMemo } from "react"
import type { ReadinessTier } from "@/lib/types-public"
import { FacilityFilters } from "@/components/public/facility-filters"

interface FacilitiesWrapperProps {
  allFacilities: Array<{ slug: string; name: string; county: string; tier: ReadinessTier }>
  counties: string[]
  // ... other props
}

export function FacilitiesWrapper({ allFacilities, counties, ...props }: FacilitiesWrapperProps) {
  const searchParams = useSearchParams()
  const selectedCounty = searchParams.get("county") || ""
  const selectedTier = searchParams.get("tier") || ""

  const filtered = useMemo(() => {
    let result = allFacilities

    if (selectedCounty) {
      result = result.filter((f) => f.county === selectedCounty)
    }

    if (selectedTier) {
      result = result.filter((f) => f.tier === selectedTier)
    }

    return result
  }, [allFacilities, selectedCounty, selectedTier])

  return (
    <div>
      <FacilityFilters
        counties={counties}
        currentCounty={selectedCounty}
        currentTier={selectedTier}
      />
      {/* Render filtered facilities list */}
      {/* e.g., <FacilitiesList facilities={filtered} /> */}
    </div>
  )
}
```

- [ ] **Step 2: Update facilities page to use wrapper**

In `frontend/src/app/facilities/page.tsx`, fetch facilities/counties server-side, then pass to wrapper:

```typescript
export default async function FacilitiesPage() {
  const overview = await getPublicOverview()
  const facilities = overview.facilities || []
  const counties = overview.counties || [] // or compute from facilities

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Facilities</h1>
      <FacilitiesWrapper
        allFacilities={facilities}
        counties={counties}
        // ... pass other props as needed
      />
    </div>
  )
}
```

- [ ] **Step 3: Test in browser**

Navigate to http://localhost:3000/facilities

Verify:
- Selecting county filters list and updates URL
- Selecting tier filters list and updates URL
- Navigating with URL params pre-filters
- Clear filters button clears both filters and URL
- Page is responsive

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/facilities/page.tsx
git commit -m "feat: add URL-persistent filters to facilities page"
```

---

## Task 11: Add Backend DLA Questions Endpoint

**Files:**
- Create/Modify: `backend/app/routes/public.py` (add `/public/dla/questions` endpoint)

**Interfaces:**
- Consumes: DLA CSV file (loaded via `load_csv_rows()`)
- Produces: JSON response with array of question stats: `{questions: [{questionNumber, questionText, correctCount, totalResponses, correctRate}, ...]}`

**Context:**
The backend needs a new endpoint that reads the DLA CSV, iterates through all 10 questions, counts how many respondents answered each correctly, and returns the aggregated stats. The CSV structure is already understood by the `dla.py` module. Load it, aggregate by question, and return as JSON.

- [ ] **Step 1: Add endpoint to backend/app/routes/public.py**

```python
from fastapi import APIRouter
from config import settings
from dla import load_csv_rows

router = APIRouter()

# ... existing endpoints ...

@router.get("/public/dla/questions")
async def get_dla_questions():
    """
    Get DLA question-level statistics (correct count and rate for each question).
    """
    try:
        rows = load_csv_rows(settings.dla_csv_path)
    except Exception as e:
        logger.error(f"Error loading DLA CSV: {e}")
        return {"questions": []}

    if not rows:
        return {"questions": []}

    # Define all 10 DLA questions (from CSV headers or hardcoded)
    # These should match the exact questions in the CSV
    question_columns = [
        "Q1_question_text",  # Update to match actual CSV column names
        "Q2_question_text",
        # ... all 10 questions
    ]

    questions_stats = []

    for i, col in enumerate(question_columns, 1):
        correct_count = 0
        total_responses = len(rows)

        for row in rows:
            answer = row.get(col, "")
            # Check if answer matches expected correct answer
            # (This depends on your CSV structure — adapt as needed)
            if is_correct_answer(col, answer):
                correct_count += 1

        correct_rate = (correct_count / total_responses * 100) if total_responses > 0 else 0

        questions_stats.append({
            "questionNumber": i,
            "questionText": get_question_text(i),  # Or extract from row
            "correctCount": correct_count,
            "totalResponses": total_responses,
            "correctRate": correct_rate,
        })

    return {"questions": questions_stats}
```

- [ ] **Step 2: Define helper functions**

Add to the same file:

```python
def is_correct_answer(question_col: str, answer: str) -> bool:
    """Check if answer is correct based on expected answer mapping."""
    # Map questions to expected correct answers
    correct_answers = {
        "Q1_question_text": "answer1",
        "Q2_question_text": "answer2",
        # ... map all 10
    }
    return answer == correct_answers.get(question_col, "")

def get_question_text(question_num: int) -> str:
    """Get the full text of a DLA question by number."""
    questions = {
        1: "Question 1 text here",
        2: "Question 2 text here",
        # ... all 10
    }
    return questions.get(question_num, "")
```

- [ ] **Step 3: Test endpoint locally**

```bash
cd backend
source .venv/bin/activate
python3 -m pytest tests/ -v -k "dla_questions"
```

Or manually:

```bash
curl http://localhost:8000/public/dla/questions
```

Expected output:

```json
{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "...",
      "correctCount": 50,
      "totalResponses": 100,
      "correctRate": 50.0
    },
    ...
  ]
}
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/routes/public.py
git commit -m "feat: add DLA question-level statistics endpoint"
```

---

## Testing Checklist

- [ ] Run frontend build: `cd frontend && npm run build`
- [ ] Run backend tests: `cd backend && pytest`
- [ ] Manual browser tests on all new features (blocker chart, quick wins, DLA questions tab, URL filters)
- [ ] Test on mobile (lg, md, sm breakpoints)
- [ ] No console errors or warnings

---

## Deployment Notes

After all tasks are merged:

1. Deploy backend changes (new endpoint)
2. Deploy frontend changes (new components, updated pages)
3. Monitor for any data loading issues on the question endpoint
4. Verify CSV data is loaded correctly for DLA questions aggregation
