-- Care Journey OS — Seed Data
-- Run AFTER schema.sql. Creates one complete sample case for development.
-- Safe to run multiple times (uses DO blocks to avoid duplicates).

do $$
declare
  v_case_id uuid := 'a1b2c3d4-0000-0000-0000-000000000001';
  v_clinic_id uuid;
  v_lender_id uuid;
  v_pharmacy_id uuid;
begin

  -- ── Sample Case ──────────────────────────────────────────────────────────
  insert into cases (
    id, client_name, journey_type, current_stage, current_status,
    owner_name, urgency, next_step, blocker_note, created_at, updated_at
  ) values (
    v_case_id,
    'Sarah Chen',
    'egg_freezing',
    'financing',
    'blocked',
    'Dr. Maya Rivera',
    'high',
    'Confirm Future Family loan approval and schedule baseline bloodwork at Pacific Fertility.',
    'Loan application stalled — Future Family requires updated income verification from client. Blocking clinic scheduling.',
    now() - interval '12 days',
    now() - interval '2 hours'
  )
  on conflict (id) do nothing;

  -- ── Stage History ─────────────────────────────────────────────────────────
  insert into case_stage_history (case_id, stage_name, entered_at, exited_at, notes) values
    (v_case_id, 'intake',                 now() - interval '12 days', now() - interval '10 days', 'Initial consult completed. Client is 34, healthy, no prior fertility treatments.'),
    (v_case_id, 'insurance_verification', now() - interval '10 days', now() - interval '7 days',  'Insurance confirmed: does not cover egg freezing. Proceeding with financing.'),
    (v_case_id, 'financing',              now() - interval '7 days',  null,                        'Applied to Future Family and Prosper. Future Family preferred — lower APR.')
  on conflict do nothing;

  -- ── Tasks ─────────────────────────────────────────────────────────────────
  insert into tasks (case_id, title, status, priority, owner_name, due_at) values
    (v_case_id, 'Follow up with client on income verification docs', 'in_progress', 'urgent', 'Dr. Maya Rivera', now() + interval '1 day'),
    (v_case_id, 'Confirm Future Family loan status', 'todo', 'high', 'Dr. Maya Rivera', now() + interval '3 days'),
    (v_case_id, 'Schedule baseline bloodwork at Pacific Fertility', 'todo', 'high', 'Dr. Maya Rivera', now() + interval '5 days'),
    (v_case_id, 'Send medication protocol overview to client', 'todo', 'medium', 'Dr. Maya Rivera', now() + interval '7 days'),
    (v_case_id, 'Verify MDR Pharmacy is in-network for meds', 'todo', 'medium', null, now() + interval '4 days')
  on conflict do nothing;

  -- ── Notes ─────────────────────────────────────────────────────────────────
  insert into notes (case_id, author_name, body, note_type, created_at) values
    (v_case_id, 'Dr. Maya Rivera', 'Client called — anxious about the loan delay. Reassured her we are following up with Future Family directly. She will send updated W2 and bank statements by EOD tomorrow.', 'client_communication', now() - interval '2 hours'),
    (v_case_id, 'Dr. Maya Rivera', 'Spoke with Future Family underwriter. They need: 2024 W2, last 2 pay stubs, and 3 months bank statements. Sent checklist to client via email.', 'financial', now() - interval '1 day'),
    (v_case_id, 'Intake Team', 'Baseline AMH: 2.4 ng/mL (good reserve). AFC: 14 follicles. Client is a strong candidate for egg freezing. No contraindications noted.', 'clinical', now() - interval '10 days')
  on conflict do nothing;

  -- ── Vendors ───────────────────────────────────────────────────────────────
  select id into v_clinic_id   from vendors where name = 'Pacific Fertility Center' limit 1;
  select id into v_lender_id   from vendors where name = 'Future Family' limit 1;
  select id into v_pharmacy_id from vendors where name = 'MDR Pharmacy' limit 1;

  if v_clinic_id is not null then
    insert into case_vendors (case_id, vendor_id, status, notes) values
      (v_case_id, v_clinic_id, 'pending', 'Scheduling on hold until financing confirmed.')
    on conflict (case_id, vendor_id) do nothing;
  end if;

  if v_lender_id is not null then
    insert into case_vendors (case_id, vendor_id, status, notes) values
      (v_case_id, v_lender_id, 'active', 'Application submitted 7 days ago. Awaiting final approval.')
    on conflict (case_id, vendor_id) do nothing;
  end if;

  if v_pharmacy_id is not null then
    insert into case_vendors (case_id, vendor_id, status, notes) values
      (v_case_id, v_pharmacy_id, 'pending', 'Will activate once protocol is finalized by clinic.')
    on conflict (case_id, vendor_id) do nothing;
  end if;

end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- CASE 2: Emma Rodriguez — IVF, Active Cycle (critical urgency, active)
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  v_case_id    uuid := 'b2c3d4e5-0000-0000-0000-000000000002';
  v_clinic_id  uuid;
  v_pharmacy_id uuid;
  v_lender_id  uuid;
begin

  insert into cases (
    id, client_name, journey_type, current_stage, current_status,
    owner_name, urgency, next_step, blocker_note, created_at, updated_at
  ) values (
    v_case_id,
    'Emma Rodriguez',
    'ivf',
    'active_cycle',
    'active',
    'Dr. Priya Nair',
    'critical',
    'Monitor follicle growth at Day 7 scan — trigger shot decision pending. Estradiol trending well.',
    null,
    now() - interval '45 days',
    now() - interval '3 hours'
  )
  on conflict (id) do nothing;

  insert into case_stage_history (case_id, stage_name, entered_at, exited_at, notes) values
    (v_case_id, 'intake',                 now() - interval '45 days', now() - interval '42 days', 'AMH 1.8 ng/mL. AFC 10. Discussed IVF protocol options. Client is 37, strong candidate.'),
    (v_case_id, 'insurance_verification', now() - interval '42 days', now() - interval '38 days', 'Aetna covers 3 IVF cycles per lifetime. Deductible $2,500 met. Pre-auth obtained.'),
    (v_case_id, 'financing',              now() - interval '38 days', now() - interval '32 days', 'Insurance covers 60%. Client using Prosper for remaining balance. Approved $8,400.'),
    (v_case_id, 'clinic_coordination',    now() - interval '32 days', now() - interval '20 days', 'Assigned to Dr. Chen at Pacific Fertility. Protocol: antagonist. Baseline scan clear.'),
    (v_case_id, 'medication_protocol',    now() - interval '20 days', now() - interval '8 days',  'Gonal-F 225IU + Menopur 75IU. MDR Pharmacy confirmed same-day delivery.'),
    (v_case_id, 'active_cycle',           now() - interval '8 days',  null,                       'Stimulation started Day 1. Day 5 scan: 9 follicles responding well. E2 = 820 pg/mL.')
  on conflict do nothing;

  insert into tasks (case_id, title, status, priority, owner_name, due_at) values
    (v_case_id, 'Day 7 monitoring scan — confirm at Pacific Fertility 7am', 'in_progress', 'urgent',  'Dr. Priya Nair',  now() + interval '18 hours'),
    (v_case_id, 'Review E2 + LH labs and decide trigger timing',            'todo',        'urgent',  'Dr. Priya Nair',  now() + interval '20 hours'),
    (v_case_id, 'Confirm anesthesia consent form signed before retrieval',   'todo',        'high',    'Dr. Priya Nair',  now() + interval '2 days'),
    (v_case_id, 'Coordinate embryology lab handoff instructions',            'todo',        'high',    'Dr. Priya Nair',  now() + interval '3 days'),
    (v_case_id, 'Send post-retrieval care instructions to client',           'todo',        'medium',  null,              now() + interval '4 days')
  on conflict do nothing;

  insert into notes (case_id, author_name, body, note_type, created_at) values
    (v_case_id, 'Dr. Priya Nair',
     'Day 5 scan results: lead follicles 13mm, 12mm, 11mm, 11mm (R), 12mm, 10mm, 10mm (L). Total 9 follicles. E2 = 820 pg/mL. Continuing Gonal-F 225IU, adding Cetrotide 0.25mg to prevent premature LH surge. Next scan Day 7.',
     'clinical', now() - interval '3 hours'),
    (v_case_id, 'Dr. Priya Nair',
     'Client called anxious about work schedule conflicting with retrieval window. Confirmed retrieval likely Day 10-11. She will arrange remote work. Partner confirmed available for day-of support.',
     'client_communication', now() - interval '1 day'),
    (v_case_id, 'Intake Team',
     'Prosper loan funded to Pacific Fertility. Anesthesia consent form sent DocuSign — pending signature. Insurance pre-auth confirmed valid through end of cycle.',
     'financial', now() - interval '5 days')
  on conflict do nothing;

  select id into v_clinic_id   from vendors where name = 'Pacific Fertility Center' limit 1;
  select id into v_pharmacy_id from vendors where name = 'MDR Pharmacy' limit 1;
  select id into v_lender_id   from vendors where name = 'Prosper Healthcare Lending' limit 1;

  if v_clinic_id is not null then
    insert into case_vendors (case_id, vendor_id, status, notes) values
      (v_case_id, v_clinic_id, 'active', 'Dr. Chen assigned. Day 7 scan booked. Retrieval room held for Day 10.')
    on conflict (case_id, vendor_id) do nothing;
  end if;
  if v_pharmacy_id is not null then
    insert into case_vendors (case_id, vendor_id, status, notes) values
      (v_case_id, v_pharmacy_id, 'active', 'Gonal-F, Menopur, Cetrotide dispensed. Trigger shot on standby.')
    on conflict (case_id, vendor_id) do nothing;
  end if;
  if v_lender_id is not null then
    insert into case_vendors (case_id, vendor_id, status, notes) values
      (v_case_id, v_lender_id, 'active', '$8,400 approved and disbursed to clinic. No further action needed.')
    on conflict (case_id, vendor_id) do nothing;
  end if;

end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- CASE 3: Jennifer Kim — IUI, Clinic Coordination (active, medium urgency)
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  v_case_id   uuid := 'c3d4e5f6-0000-0000-0000-000000000003';
  v_clinic_id uuid;
begin

  insert into cases (
    id, client_name, journey_type, current_stage, current_status,
    owner_name, urgency, next_step, blocker_note, created_at, updated_at
  ) values (
    v_case_id,
    'Jennifer Kim',
    'iui',
    'clinic_coordination',
    'active',
    'Dr. Maya Rivera',
    'medium',
    'Confirm cycle day 2 baseline scan appointment at UCSF Fertility. Letrozole Rx to be called in.',
    null,
    now() - interval '8 days',
    now() - interval '6 hours'
  )
  on conflict (id) do nothing;

  insert into case_stage_history (case_id, stage_name, entered_at, exited_at, notes) values
    (v_case_id, 'intake',                 now() - interval '8 days', now() - interval '6 days', 'Client 31, regular cycles, partner SA normal. Unexplained infertility x12 months. IUI recommended as first-line.'),
    (v_case_id, 'insurance_verification', now() - interval '6 days', now() - interval '3 days', 'Blue Shield covers 3 IUI attempts at 80% after deductible. Deductible not yet met — out-of-pocket est. $600/cycle.'),
    (v_case_id, 'clinic_coordination',    now() - interval '3 days', null,                       'Referred to UCSF Fertility. Dr. Liang assigned. Awaiting cycle day 2 for baseline scan.')
  on conflict do nothing;

  insert into tasks (case_id, title, status, priority, owner_name, due_at) values
    (v_case_id, 'Schedule Day 2 baseline scan at UCSF Fertility',              'in_progress', 'high',   'Dr. Maya Rivera', now() + interval '2 days'),
    (v_case_id, 'Call in Letrozole 2.5mg prescription to client pharmacy',     'todo',        'high',   'Dr. Maya Rivera', now() + interval '3 days'),
    (v_case_id, 'Send cycle monitoring calendar to client',                    'todo',        'medium', null,              now() + interval '4 days'),
    (v_case_id, 'Confirm partner availability for IUI procedure day',          'todo',        'medium', null,              now() + interval '7 days')
  on conflict do nothing;

  insert into notes (case_id, author_name, body, note_type, created_at) values
    (v_case_id, 'Dr. Maya Rivera',
     'Spoke with Dr. Liang''s office at UCSF. They have availability for baseline scan on Day 2 or 3 of next cycle, which client expects in ~2 days. Will confirm once she texts with cycle start.',
     'vendor', now() - interval '6 hours'),
    (v_case_id, 'Intake Team',
     'SA results: count 48M/mL, motility 62%, morphology 6% (WHO normal). Good prognosis for IUI. Blue Shield auth submitted — response expected within 48 hours.',
     'clinical', now() - interval '5 days')
  on conflict do nothing;

  select id into v_clinic_id from vendors where name = 'UCSF Fertility' limit 1;

  if v_clinic_id is not null then
    insert into case_vendors (case_id, vendor_id, status, notes) values
      (v_case_id, v_clinic_id, 'pending', 'Dr. Liang assigned. Awaiting Day 2 to book baseline scan.')
    on conflict (case_id, vendor_id) do nothing;
  end if;

end $$;
