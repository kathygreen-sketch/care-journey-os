-- Care Journey OS v0.1 — Supabase Schema
-- Run this in the Supabase SQL editor to set up the database.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────

create type journey_type as enum (
  'egg_freezing', 'ivf', 'iui', 'surrogacy', 'donor_egg', 'other'
);

create type case_stage as enum (
  'intake', 'insurance_verification', 'financing', 'clinic_coordination',
  'medication_protocol', 'active_cycle', 'retrieval', 'transfer',
  'post_procedure', 'completed', 'on_hold'
);

create type case_status as enum (
  'active', 'blocked', 'on_hold', 'completed', 'cancelled'
);

create type urgency_level as enum (
  'low', 'medium', 'high', 'critical'
);

create type task_status as enum (
  'todo', 'in_progress', 'done', 'cancelled'
);

create type task_priority as enum (
  'low', 'medium', 'high', 'urgent'
);

create type note_type as enum (
  'general', 'clinical', 'financial', 'vendor', 'client_communication'
);

create type vendor_type as enum (
  'clinic', 'lender', 'pharmacy', 'lab', 'insurance', 'other'
);

create type vendor_status as enum (
  'active', 'pending', 'inactive'
);

create type ai_summary_type as enum (
  'case_summary', 'next_step_plan', 'notes_summary'
);

-- ─────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────

-- Cases
create table cases (
  id            uuid primary key default uuid_generate_v4(),
  client_name   text not null,
  journey_type  journey_type not null,
  current_stage case_stage not null default 'intake',
  current_status case_status not null default 'active',
  owner_name    text not null,
  urgency       urgency_level not null default 'medium',
  next_step     text,
  blocker_note  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Stage history (one row per stage entered)
create table case_stage_history (
  id          uuid primary key default uuid_generate_v4(),
  case_id     uuid not null references cases(id) on delete cascade,
  stage_name  case_stage not null,
  entered_at  timestamptz not null default now(),
  exited_at   timestamptz,
  notes       text
);

-- Tasks
create table tasks (
  id           uuid primary key default uuid_generate_v4(),
  case_id      uuid not null references cases(id) on delete cascade,
  title        text not null,
  description  text,
  status       task_status not null default 'todo',
  priority     task_priority not null default 'medium',
  owner_name   text,
  due_at       timestamptz,
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);

-- Notes
create table notes (
  id          uuid primary key default uuid_generate_v4(),
  case_id     uuid not null references cases(id) on delete cascade,
  author_name text not null,
  body        text not null,
  note_type   note_type not null default 'general',
  created_at  timestamptz not null default now()
);

-- Documents
create table documents (
  id            uuid primary key default uuid_generate_v4(),
  case_id       uuid not null references cases(id) on delete cascade,
  document_type text not null,
  file_url      text not null,
  uploaded_by   text not null,
  created_at    timestamptz not null default now()
);

-- Vendors (reusable across cases)
create table vendors (
  id          uuid primary key default uuid_generate_v4(),
  vendor_type vendor_type not null,
  name        text not null,
  notes       text
);

-- Case <-> Vendor join
create table case_vendors (
  id        uuid primary key default uuid_generate_v4(),
  case_id   uuid not null references cases(id) on delete cascade,
  vendor_id uuid not null references vendors(id) on delete cascade,
  status    vendor_status not null default 'active',
  notes     text,
  unique(case_id, vendor_id)
);

-- AI-generated summaries (append-only log)
create table ai_summaries (
  id           uuid primary key default uuid_generate_v4(),
  case_id      uuid not null references cases(id) on delete cascade,
  summary_type ai_summary_type not null,
  content      text not null,
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────

create index idx_cases_status on cases(current_status);
create index idx_cases_stage on cases(current_stage);
create index idx_cases_updated on cases(updated_at desc);
create index idx_tasks_case on tasks(case_id);
create index idx_tasks_due on tasks(due_at) where status not in ('done', 'cancelled');
create index idx_notes_case on notes(case_id);
create index idx_documents_case on documents(case_id);
create index idx_case_vendors_case on case_vendors(case_id);
create index idx_ai_summaries_case on ai_summaries(case_id, summary_type, created_at desc);
create index idx_stage_history_case on case_stage_history(case_id);

-- ─────────────────────────────────────────
-- AUTO-UPDATE updated_at
-- ─────────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cases_updated_at
  before update on cases
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- For MVP: disable RLS (internal tool only).
-- Enable and add policies before any public exposure.
-- ─────────────────────────────────────────

alter table cases disable row level security;
alter table case_stage_history disable row level security;
alter table tasks disable row level security;
alter table notes disable row level security;
alter table documents disable row level security;
alter table vendors disable row level security;
alter table case_vendors disable row level security;
alter table ai_summaries disable row level security;

-- ─────────────────────────────────────────
-- STORAGE BUCKET
-- Run this separately or via Supabase dashboard:
-- Create a bucket named "documents" and set it to public
-- ─────────────────────────────────────────

-- insert into storage.buckets (id, name, public)
-- values ('documents', 'documents', true)
-- on conflict do nothing;

-- ─────────────────────────────────────────
-- SEED DATA (optional — remove in production)
-- ─────────────────────────────────────────

insert into vendors (vendor_type, name, notes) values
  ('clinic',   'Pacific Fertility Center',  'Primary IVF clinic partner'),
  ('clinic',   'UCSF Fertility',            'Specialist referral clinic'),
  ('lender',   'Future Family',             'Fertility financing partner'),
  ('lender',   'Prosper Healthcare Lending', 'Secondary financing option'),
  ('pharmacy', 'MDR Pharmacy',              'Specialty fertility medications');
