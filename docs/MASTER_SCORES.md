# Master readiness scores

The TRIBE analysis workbook ships in the repo as the **source of truth** for deployment tiers, DRF domain scores, waves, and blockers:

```
backend/data/master/Master Facility Readiness Scores.xlsx
```

> **Current version: V3.0** (adopted 2026-07-10). All 37 facilities are Tier 3 with a universal
> BLK-05 "No IT support" blocker; BLK-04 (DHIS2) is cleared for all facilities and no wave
> assignments exist yet. V3.0 also notes that D-ICT device counts measure ownership, not
> availability for HOS.

## Why the workbook is in git

- **Render free tier** has no persistent disk — a bundled `.xlsx` loads on every deploy without manual uploads.
- **Reproducible scoring** — the dashboard matches the signed-off TRIBE master, not live Kobo recalculation alone.
- **Reviewable changes** — workbook updates go through git like any other artefact.

## Database ingestion (optional mirror)

When `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set, the API **upserts** master scorecards into `facility_readiness` on startup (`backend/db.py`). Run the new table DDL from `backend/schema.sql` in Supabase once.

| Store | Role |
|-------|------|
| `backend/data/master/*.xlsx` | Authoritative source; loaded into memory at startup |
| `facility_readiness` (Supabase) | Optional mirror for SQL queries, admin tools, backups |
| `facilities` (Supabase) | Kobo submission cache (raw assessment JSON) |

Kobo data and master readiness serve different purposes: Kobo supplies **field-level infrastructure detail**; the master workbook supplies **official readiness tiers and blockers**.

## Configuration

| Variable | Default |
|----------|---------|
| `MASTER_SCORES_XLSX_PATH` | Bundled path under `backend/data/master/` |

## API

- `GET /public/overview` — tier counts, DRF domain averages (0–3), county/cluster rollups from master when loaded
- `GET /public/blockers` — sheet 10 blocker register
- `GET /health` — `master_cache_populated`, `master_source_path`

After updating the workbook, redeploy the API (or restart locally) to reload scores and sync Supabase.

## Implementation phases (dashboard)

| Phase | Scope | Routes |
|-------|--------|--------|
| 1 | Master workbook → DRF tiers, domains, blockers | `/`, `/blockers`, `/facility/*` |
| 2 | Cluster rollups, ICT gap, B6 gap matrix | `/clusters`, `/infrastructure`, `/gaps` |
| 3 | A2 data quality flags, instrument confidence | `/data-quality`, `/sentiment`, `/dla` |
| 4 | Deployment waves & county sequencing | `/roadmap` |
