
drop table if exists facilities cascade;


create table facilities (
    id            bigserial primary key,
    submission_id bigint unique not null,   -- KoboToolbox _id
    submitted_at  timestamptz,
    facility_name text,
    county        text,
    scored_data   jsonb not null,           -- full scored dict from scoring.py
    synced_at     timestamptz default now()
);

create index idx_facilities_submission_id
    on facilities (submission_id desc);

create index idx_facilities_county
    on facilities (county);

create index idx_facilities_tier
    on facilities ((scored_data->>'tier'));

create table if not exists facility_readiness (
    id              bigserial primary key,
    facility_slug   text unique not null,
    facility_name   text,
    county          text,
    readiness_data  jsonb not null,
    source_path     text,
    synced_at       timestamptz default now()
);

create index if not exists idx_facility_readiness_county
    on facility_readiness (county);

create index if not exists idx_facility_readiness_tier
    on facility_readiness ((readiness_data->>'tier'));

alter table facilities enable row level security;

alter table facility_readiness enable row level security;

