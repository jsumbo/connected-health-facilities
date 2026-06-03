-- DatFlow Dashboard — Supabase schema
-- Run this once in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/<your-project>/sql

-- ── Drop and recreate (safe for fresh setup) ─────────────────
-- CASCADE drops any dependent indexes/policies automatically.
drop table if exists facilities cascade;

-- ── Main table ───────────────────────────────────────────────
create table facilities (
    id            bigserial primary key,
    submission_id bigint unique not null,   -- KoboToolbox _id
    submitted_at  timestamptz,
    facility_name text,
    county        text,
    scored_data   jsonb not null,           -- full scored dict from scoring.py
    synced_at     timestamptz default now()
);

-- ── Indexes ──────────────────────────────────────────────────
-- Used by get_max_kobo_id to find the highest stored submission ID
create index idx_facilities_submission_id
    on facilities (submission_id desc);

-- Used by GET /dashboard/facilities?county=...
create index idx_facilities_county
    on facilities (county);

-- Used by GET /dashboard/facilities?tier=...
create index idx_facilities_tier
    on facilities ((scored_data->>'tier'));

-- ── Row Level Security ───────────────────────────────────────
-- Service role key (used by the backend) bypasses RLS automatically.
-- Enable RLS so direct anon/public access is blocked.
alter table facilities enable row level security;

-- No public read policy — only the service role can read/write.
-- Uncomment if you want authenticated Supabase users to read:
-- create policy "authenticated_read" on facilities
--     for select to authenticated using (true);
