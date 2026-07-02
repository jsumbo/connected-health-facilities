# Feedback Fixes Summary

## Status: 2 of 4 Issues Fixed

---

## ✅ Fixed Issues (Frontend)

### Issue #3: Remove "Low completeness" section
**Status**: FIXED

The confusing "Low completeness" section that showed a duplicate table has been removed from `/data-quality`. The page now shows:
1. KPI metrics (including "Low completeness" count) — kept for context
2. "DLA indicative only" section (if applicable)
3. "All facilities" table — single source of truth for facility data

**Files changed:**
- `frontend/src/app/data-quality/page.tsx` (removed lines 146-155)

**Before**: Two similar tables showing facility lists (confusing)  
**After**: One comprehensive "All facilities" table

---

### Issue #4: Map tier colors don't match rest of project
**Status**: FIXED

Updated facility map markers and legend to use the new sRGB hex color system instead of hardcoded web colors.

**Color mapping (now consistent everywhere):**
| Tier | Old Color | New Color | Status |
|------|-----------|-----------|--------|
| Tier 1 — HOS-Ready | #059669 | #f54343 | ✅ Updated |
| Tier 2 — Deployment-Eligible | #0284c7 | #0f0f0f | ✅ Updated |
| Tier 2 — Structured Remediation | #d97706 | #b67700 | ✅ Updated |
| Tier 3/4 — Not Ready | #e11d48 | #c64e31 | ✅ Updated |
| Not Assessed | #64748b | #8b8b8b | ✅ Updated |

**Files changed:**
- `frontend/src/components/public/facility-map-icon.ts` (tierMarkerColor function)
- `frontend/src/components/public/facility-map-legend.tsx` (LEGEND_ITEMS)

**Impact**: Map now matches tier colors in all other visualizations (charts, badges, cards)

---

## ⚠️ Pending Issues (Backend Required)

### Issue #1: Domain scores showing as percentages, should be 0–3
**Status**: REQUIRES BACKEND CHANGE

**Current behavior:**
- Domain averages calculated as percentages (0–100%)
- Example: "Adoption Sentiment" shows as ~3–5% on the chart

**Current backend code** (`backend/scoring.py`, line 540):
```python
return round((earned / max_possible) * 100, 1)  # Returns percentage
```

**Required action (choose one):**

**Option A: Change scoring to 0–3 scale** (if that's the intended behavior)
```python
# Change from percentage to 0-3 scale
max_score = 3  # or dynamically calculate based on questions
return round((earned / max_possible) * max_score, 2)
```
Then set `domain_scale_max = 3` in the overview API response.

**Option B: Fix frontend description** (if 0–100 is correct)
```tsx
// In frontend/src/app/page.tsx line 147
description="0–100 readiness domain scale"  // Change from "0–3"
```

**To verify which is correct**: Check the Google Sheets link provided to see what domain score scale is expected.

**Affected components:**
- National overview page (Domains chart)
- Cluster pages (Domains chart)
- Facility detail pages (Domains chart)

---

### Issue #2: Damballa Health Center missing from DLA table
**Status**: REQUIRES BACKEND DATA SYNC

**Current behavior:**
- DLA table shows 36 facilities with responses
- Damballa is not listed, despite being in the facility registry (37 facilities)

**Root cause:** Either:
1. Damballa hasn't submitted DLA responses yet, OR
2. There's a slug/name mismatch between facility registry and DLA data, OR
3. DLA data is stale and hasn't been synced with latest submissions

**Required action:**
1. Check if Damballa has DLA responses in KoboToolbox
2. Verify facility slug is consistent (`damballa_health_center`)
3. Regenerate DLA cache/overview to include any new submissions

**Files to check:**
- `backend/routes/public.py` (getPublicDla endpoint)
- DLA cache generation logic
- KoboToolbox submission sync

**Impact on DLA page:**
- Current: Shows 36 facilities with responses
- Expected: Shows 37 facilities (including Damballa)

---

## Verification Checklist

### Frontend Fixes
- [x] Data quality page no longer shows duplicate "Low completeness" table
- [x] Map colors updated to match new sRGB hex palette
- [x] Map legend shows correct colors
- [x] All tier badges consistent across project

### Pending Backend Work
- [ ] Domain scores clarified (0–3 or 0–100?)
- [ ] Domain scale applied consistently
- [ ] DLA data includes Damballa (or documented reason why not)
- [ ] Google Sheets updated scores incorporated (if applicable)

---

## Notes

1. **Color consistency achieved**: All tier colors now use sRGB hex (#RRGGBB) format for universal rendering across browsers/platforms. See `docs/COLOR_SYSTEM.md` for details.

2. **Data source reference**: User mentioned a Google Sheets with updated scores at: https://docs.google.com/spreadsheets/d/1s8HBUfpAWspPD66c7CmtbGfi6Q-62cT_VKF2wfrzVSk/edit?usp=sharing
   - Should this sheet be imported into the system?
   - Is this replacing the Kobo-based scoring?

3. **Tier name mismatch**: Noticed in code that Tier 3 is labeled "Structured Remediation" in backend but "Not Deployment-Ready" in some places. This should be clarified in CLAUDE.md.
