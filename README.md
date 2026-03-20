# Care Journey OS v0.1

Internal operations platform for fertility care coordinators. Manage client cases end-to-end — from intake through post-procedure — with AI-powered summaries, task tracking, vendor coordination, and a lightweight client portal.

---

## Features

- **Case management** — stage tracking, status, urgency, owner, blocker notes, stage history
- **Task engine** — create, assign, prioritize, cycle through statuses, overdue highlighting with tab filtering
- **Notes** — typed notes log (clinical, financial, vendor, client communication) with delete
- **Document upload** — Supabase Storage with per-case file management and delete
- **Vendor tracking** — link clinics, lenders, pharmacies to cases; update status inline
- **AI workflows** — case summary, next-step plan, notes digest via GPT-4o-mini; stored and timestamped
- **Client portal** — clean public view at `/client/[id]` with relevance-ordered sections per stage
- **Dashboard** — clickable stat cards, recent cases, blocked cases, overdue tasks
- **Auth** — Supabase email/password with protected routes via middleware

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, Server Actions) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + custom shadcn/ui primitives |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth with `@supabase/ssr` |
| Storage | Supabase Storage |
| AI | OpenAI API (`gpt-4o-mini`) |
| Deployment | Vercel |

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- An [OpenAI](https://platform.openai.com) API key

---

## Local Development

### 1. Clone and install

```bash
git clone <repo-url>
cd care-journey-os
npm install
```

### 2. Set up Supabase

#### Create a project
1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a region and set a strong database password
3. Wait for provisioning to complete (~60 seconds)

#### Run the schema
1. In your Supabase project, open **SQL Editor**
2. Paste the full contents of `supabase/schema.sql`
3. Click **Run**

This creates 9 enums, 8 tables, indexes, an `updated_at` trigger, and disables RLS for MVP.

#### Seed sample data (optional but recommended)
1. In **SQL Editor**, paste the full contents of `supabase/seed.sql`
2. Click **Run**

This creates 3 realistic sample cases:

| Client | Journey | Stage | Status | Urgency |
|---|---|---|---|---|
| Sarah Chen | Egg Freezing | Financing | Blocked | High |
| Emma Rodriguez | IVF | Active Cycle | Active | Critical |
| Jennifer Kim | IUI | Clinic Coordination | Active | Medium |

Each includes stage history, tasks, notes, and linked vendors.

#### Create the Storage bucket
1. In Supabase sidebar → **Storage**
2. Click **New bucket**
3. Name: `documents` — enable **Public bucket** — click **Create**

#### Create an auth user
1. Go to **Authentication → Users**
2. Click **Add user → Create new user**
3. Enter your email and a password — you'll use these to log in locally

#### Get your API keys
1. Go to **Settings → API**
2. Copy your **Project URL** and **anon/public key**

### 3. Configure environment variables

Create `.env.local` in the project root:

```bash
# Supabase — from Settings > API in your Supabase project
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI — from platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-...
```

> The `NEXT_PUBLIC_` prefix is required on Supabase variables — they are used in both server and browser contexts for SSR authentication.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/auth/login`. Sign in with the user you created in Supabase.

---

## Environment Variables

| Variable | Required | Where to find it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase → Settings → API → anon/public key |
| `OPENAI_API_KEY` | Yes | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add -A
git commit -m "Initial commit: Care Journey OS v0.1"
git remote add origin https://github.com/your-org/care-journey-os.git
git push -u origin main
```

> Do not commit `.env.local` — it is in `.gitignore`.

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Import your GitHub repository
3. Vercel auto-detects Next.js — no framework config changes needed

### 3. Add environment variables

In the Vercel project → **Settings → Environment Variables**, add:

```
NEXT_PUBLIC_SUPABASE_URL       https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  eyJhbGc...
OPENAI_API_KEY                 sk-proj-...
```

Set all three for **Production**, **Preview**, and **Development** environments.

### 4. Deploy

Click **Deploy**. Build typically completes in ~60 seconds.

Your production URL will be `https://your-project.vercel.app`.

> **Client portal links** — Share `/client/[case-id]` with clients. The case UUID is visible in the browser URL on any case detail page. `/client/*` routes are public (no auth required).

---

## Pages

| Route | Auth | Description |
|---|---|---|
| `/dashboard` | Required | Stats, recent cases, blocked cases, overdue tasks |
| `/cases` | Required | Filterable cases table; supports `?status=` and `?stage=` URL params |
| `/cases/[id]` | Required | Full case detail — stage, tasks, AI insights, notes, docs, vendors |
| `/client/[id]` | Public | Client portal — stage progress, next steps, journey update, documents |
| `/auth/login` | Public | Email/password sign-in |

---

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard page
│   │   └── loading.tsx         # Skeleton loading state
│   ├── cases/
│   │   ├── page.tsx            # Cases list (reads ?status= URL param)
│   │   ├── loading.tsx         # Skeleton loading state
│   │   ├── error.tsx           # Error boundary
│   │   └── [id]/
│   │       ├── page.tsx        # Case detail
│   │       └── loading.tsx     # Skeleton loading state
│   ├── client/[id]/page.tsx    # Public client portal
│   ├── auth/login/page.tsx     # Login form
│   ├── error.tsx               # Global error boundary
│   └── globals.css
├── actions/                    # Server Actions (all DB mutations live here)
│   ├── ai.ts                   # OpenAI: generateCaseSummary, generateNextStepPlan, generateNotesSummary
│   ├── cases.ts                # getCases, getCaseById, createCase, updateCase, dashboard queries
│   ├── documents.ts            # uploadDocument, deleteDocument (Storage + DB)
│   ├── notes.ts                # createNote, deleteNote
│   ├── tasks.ts                # createTask, updateTask, updateTaskStatus
│   └── vendors.ts              # getVendors, createVendor, addVendorToCase, updateCaseVendorStatus, removeVendorFromCase
├── components/
│   ├── cases/                  # StageTracker, StageAdvanceButton, CaseEditDialog,
│   │                           # TaskList, NotesList, DocumentsList, VendorsList, AISummarySection
│   ├── dashboard/              # StatsCards, RecentCases, BlockedCases, OverdueTasks
│   ├── layout/                 # Sidebar, TopNav, AppLayout
│   └── ui/                     # Badge, Button, Card, Dialog, Input, Select, Separator,
│                               # Skeleton, Textarea (all custom, no CLI dependency)
├── lib/
│   ├── openai.ts               # Singleton OpenAI client
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server Supabase client (cookie-based SSR)
│   └── utils.ts                # cn(), formatDate, isOverdue, label maps, STAGE_ORDER
├── middleware.ts               # Protects all routes except /auth/* and /client/*
└── types/index.ts              # All TypeScript domain types + OverdueCaseTask
supabase/
├── schema.sql                  # Full schema: enums, tables, indexes, trigger, RLS off
└── seed.sql                    # 3 realistic sample cases for development
```

---

## Data Model

```
cases
├── case_stage_history     audit log of every stage transition
├── tasks                  task engine (priority, status, owner, due date)
├── notes                  typed activity log
├── documents              file references (stored in Supabase Storage bucket "documents")
├── case_vendors ──── vendors    M:M join with status + notes per link
└── ai_summaries           append-only AI output log (case_summary, next_step_plan, notes_summary)
```

RLS is **disabled** for MVP. This app is an internal tool behind Supabase Auth. Before any broader exposure, enable RLS and add per-user policies.

---

## AI Workflows

Available on each case detail page under **AI Insights**:

| Workflow | What it analyzes | Output format |
|---|---|---|
| Case Summary | Stage, status, blockers, vendors, open tasks | 3–5 sentence operational brief |
| Next-Step Plan | Same context + prioritization logic | Numbered list, 3–6 steps with owner + reason |
| Notes Summary | Up to 20 most recent notes | Bulleted key points: decisions, issues, clinical/financial highlights |

Results are stored in `ai_summaries` and displayed with generation timestamps. **Regenerate** appends a new entry — old summaries are preserved.

---

## Known Constraints

- `next.config.js` uses CommonJS (`module.exports`) — Next.js 14 does not support TypeScript config files
- Folder names with `#` break Next.js webpack path resolution — keep the project directory name clean
- RLS is disabled — do not expose Supabase credentials or the internal dashboard publicly
- The `OPENAI_API_KEY` is server-only (no `NEXT_PUBLIC_` prefix) — it is never sent to the browser
