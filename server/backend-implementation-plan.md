# Backend Pipeline for Executivelayer Mockup

## Context

`Executivelayer_mockup` is currently a pure static vanilla-JS SPA (`index.html` + `js/core.js` + `js/pages.js` + `js/renderer.js`) with **zero persistence** — every module (AI Executive journeys/runs, Contracts, Employees, Teams, Leaves, Payments, Compliance, Support, Settings, Timesheet, Cost Calculator) is backed by hardcoded `const`/`let` arrays that live only in browser memory and reset on reload. The `groovy-watching-iverson.md` plan describes the AI Executive module's UI, but the module (and the rest of the app) has no real backend.

The user wants a **complete, real backend pipeline**: live Postgres tables, linked by real foreign keys, that the frontend reads and writes through an API — covering the **full application**, not just AI Executive. Decisions already confirmed with the user:
- Database: **Supabase** (hosted Postgres, free tier) — chosen for free hosting + built-in tooling; no Supabase Auth for now.
- API layer: **Node.js + Express (TypeScript)** sitting in front of Supabase Postgres.
- AI logic (contract assistant chat, journey automation): **rule-based/scripted**, not an LLM — port the existing client-side heuristics (`parseAIContractPrompt`, `agentReply`, `aiAdvanceRunPastAutoSteps`, etc.) to the server.
- **No authentication** for now — open API, single shared dataset (matches current mockup's single hardcoded user/company).
- Scope: **the whole application's data**, not just AI Executive.

Full exploration of `core.js` (1107 lines), `pages.js` (4185 lines), and `renderer.js` (286 lines) was completed to catalog every hardcoded data structure and every mutating function, so this plan is grounded in the actual current behavior, not a guess. Key findings that shape the design:
- The same "twin log/workflow" pattern (`{module}LogsData` + `{module}WorkflowData`, both keyed by parent record id) repeats across leave-policies, direct-employee, global-employee, teams, contracts, payments → collapse into one polymorphic `activity_log` table.
- Two incompatible employee-id schemes coexist (`EMP001` style vs `CLOCLO11755` style vs bare numeric) → unify into one `employees` table with a canonical id.
- The AI Executive run engine is genuinely simple: a run is a journey-step-template pointer (`currentStepIdx`) + coarse status, advanced by one algorithm (`aiAdvanceRunPastAutoSteps`): walk forward through steps, auto-completing any non-human-gated step, stopping at the next `Human Required`/`Approval Required` step (or completing the run if none remain). This is the core "automation engine" to replicate server-side.
- The AI Contract Assistant and AI Executive run engine are **not currently linked** (submitting a contract via the assistant never creates/advances an `aiAutomationRuns` entry) — this plan closes that gap so the pipeline is genuinely end-to-end.
- Many buttons across the app (leave approval, payment status change, ticket reply/reassign, salary save, settings edit, etc.) have **no client logic at all** — they need endpoints designed fresh, not ported.

Given the size (18 distinct modules), this plan delivers the **full DB schema** now (so relationships are right from day one) but implements the **API + frontend wiring in two ordered phases**: Phase 1 makes the AI Executive + Contracts/Proposals pipeline (the flagship, fully stateful part) genuinely live end-to-end; Phase 2 extends the same pattern to the remaining modules. This avoids a single unreviewable mega-diff and lets the pattern be validated on the hardest module first.

## Architecture

```
Executivelayer_mockup/
  index.html, js/, css/            ← existing frontend (edited in Phase 1/2 to fetch from API)
  server/                          ← NEW backend
    prisma/
      schema.prisma                ← full data model (all modules)
      seed.ts                      ← transcribes current mock data into the DB
    src/
      db.ts                        ← Prisma client singleton
      app.ts                       ← Express app, route mounting, error handler
      index.ts                     ← server bootstrap
      routes/
        journeys.ts  runs.ts  contracts.ts  proposals.ts  employees.ts
        teams.ts  leavePolicies.ts  leaveRequests.ts  payments.ts
        compliance.ts  tickets.ts  chats.ts  notifications.ts
        settings.ts  timesheet.ts  entities.ts
      services/
        runEngine.ts               ← aiAdvanceRunPastAutoSteps port + run/step status derivation
        contractAssistant.ts       ← parseAIContractPrompt / findExistingEmployee / agentReply rule tree
        commercialCalculator.ts    ← replaces aiGenCommercial with country-rate-driven calc
        activityLog.ts             ← shared helper for polymorphic log/workflow inserts
      lib/
        validation.ts              ← zod schemas per route
    .env.example                   ← DATABASE_URL (Supabase connection string), PORT
    package.json, tsconfig.json
```

**Why Prisma over raw `pg`/supabase-js for the DB layer:** Supabase is used purely as a hosted Postgres instance (via its Postgres connection string); Prisma gives schema-as-code migrations, type-safe queries matching the TS backend, and a seed pipeline — all of which this catalog-heavy, many-table schema benefits from. Supabase Auth/Realtime/Storage are not used in this phase (no auth per the user's decision; realtime/live-updating panels can be added later via Supabase Realtime or simple polling — the existing UI already fakes async delay with `setTimeout`, which becomes a real `await fetch()` naturally).

**API style:** REST + JSON, one router per domain, a services layer holding the ported business logic (state machines, rule-based NLU, calculators) so routes stay thin. `zod` validates request bodies.

## Data model (Prisma schema, all modules)

Grouped by domain — this is the full schema written in Phase 1 setup, even though not every table gets API+frontend wiring until Phase 2:

**Shared/cross-cutting**
- `entities` (tenants): id, name, entity_code, type, country, plan, employee_count, active
- `employees`: id, employee_code, name, kind (direct/global), department, branch, country, job_title, worker_type, join_date, description, contact, email, status — unifies `directEmpData`/`globalEmpData`/`empPool`
- `users`: id, name, role, initials — lightweight actor table for `createdBy`/`assignedTo`/log `user` fields (no auth, just identity records)
- `activity_log`: id, entity_type, entity_id, kind (`log`|`workflow`), title, description, status, user_id, occurred_at — replaces every `{module}LogsData`/`{module}WorkflowData` pair
- `notifications`: id, title, related_type, related_id, created_at, pending
- `lookup_values`: category, value, sort_order — replaces `filterOptionMap`/`filterData`

**AI Executive** (flagship — Phase 1)
- `journeys`: id (text PK, e.g. `contract-to-payroll`), name, description, coverage_pct, human_steps, ai_steps, status, risk_level, connected_modules (text[]), updated_at
- `journey_steps`: id, journey_id FK, seq, name, chips (text[]), source, description, validation, human_intervention, failure_handling, fields_fetched (text[])
- `automation_configs`: id, journey_id FK, name, entity, country, employment_type, effective_from, trigger, status, created_at
- `automation_scope`: config_id FK, step_id FK, ai_automate, human_approval, auto_move_next, exception_handling
- `automation_runs`: run_id (PK), journey_id FK, client, country, contract_type, current_step_index, status, last_activity, exception_note, contract_id FK nullable
- `run_steps`: run_id FK, step_id FK, status (pending/current/done/exception), started_at, completed_at — explicit per-step history (mockup only has a pointer; this plan adds real audit trail)
- `run_activity_log`: run_id FK, occurred_at, message, level — backend "Fetching/Validating/Completed/Failed" panel

**Contracts + AI Contract Assistant** (Phase 1)
- `contracts`: id, contract_code, employee_name, designation, country, type, created_at, status, nationality, country_of_operation, work_permit, gender, email, contact, dob, job_title, skill, employment_start, employment_end, employment_type, work_schedule, pay_amount, currency, job_description, pay_frequency
- `contract_commercials` (1:1 with contracts): adt_fee, annual_gross, base_gross, holiday_bonus, month13, monthly_gross_net, monthly_invoice, monthly_salary_12, monthly_salary_13_92, net_pay, social_prem_amt, social_prem_pct, total_monthly_gross — all numeric, not string
- `contract_compliance_items`: contract_id FK, item, note, status, document_id
- `proposals`: id, proposal_code, contract_id FK, employee_name, country, job_title, type, status, deal_manager_id FK users, created_at, sent_at, approved_at

**Core HR (Phase 2)**
- `teams`, `team_members` (team_id, employee_id, role, designation)
- `leave_policies`, `leave_policy_assignments` (policy_id, employee_id)
- `leave_requests`: id, employee_id, leave_policy_id, leave_from, leave_to, leave_hours, description, applied_date, created_by, status, sub_status

**Finance & Compliance (Phase 2)**
- `payroll_cycles`: cycle_name, country, employee_count, gross_pay, status
- `payment_orders` (+ `payment_order_employee`, `payment_attachments`)
- `compliance_rates`: country, rule_name, category, applicable_to, value_rate, status
- `country_rate_rules`: country_code, label, kind (social/benefit), rate or flat_amount, min/max/default salary — powers both compliance listing and a real (rate-driven) cost calculator, replacing hardcoded `ccPageData`

**Support & Ops (Phase 2)**
- `tickets`, `ticket_messages`
- `chats`, `chat_tickets` (many-to-many)
- `settings_audit_log` (or fold into `activity_log` with entity_type='settings')
- `timesheet_attendance`: employee_id, date, check_in, check_out, location, hours, source, status

## Phase 1 — Foundation + AI Executive pipeline (build first)

1. **Scaffold `server/`**: `package.json` (express, @prisma/client, prisma, zod, cors, dotenv, tsx/ts-node), `tsconfig.json`, `.env.example`.
2. **Supabase project**: user creates a free Supabase project; grab the Postgres connection string for `DATABASE_URL`.
3. **`prisma/schema.prisma`**: full model above (all tables from every domain, so foreign keys are correct from day one — cheap to write now, expensive to retrofit later).
4. **`prisma migrate dev`** to create all tables in Supabase Postgres.
5. **`prisma/seed.ts`**: transcribe the *actual current values* from `aiJourneys`, `aiJourneyEvents`, `aiAutomationRuns`, `contractsData`, `ctLogsData`/`ctWorkflowData`, `directEmpData`, `globalEmpData`, `teamsData`, plus a couple of `users` rows (e.g. "Shaun Test1", "Karan Mehta") and `entities` rows — so the running app shows the same demo data it does today, just from Postgres.
6. **Services**:
   - `runEngine.ts`: `deriveStepStatus(run, step)` (ports `aiRunStepStatus`) and `advancePastAutoSteps(runId)` (ports `aiAdvanceRunPastAutoSteps`, but journey-generic — fixes the mockup's `contract-to-payroll`-hardcoded bug) — writes real `run_steps` rows instead of only moving a pointer.
   - `contractAssistant.ts`: ports `parseAIContractPrompt`, `findExistingEmployee`, `isCreateContractRequest`/`isNetherlandsContractRequest`, and the `agentReply` rule tree, as pure functions operating against the DB (`employees` table) instead of in-memory arrays.
   - `commercialCalculator.ts`: computes contract commercial terms from `country_rate_rules` instead of the fixed-ratio `aiGenCommercial` fake math (falls back to the same ratios if no rate row exists yet, so behavior doesn't regress).
7. **Routes** (all under `/api`):
   - `GET/POST /journeys`, `GET /journeys/:id`, `GET /journeys/:id/steps`
   - `POST /journeys/:id/automations` (save draft/active config — splits the mockup's conflated `saveAIAutomation`), `PATCH /journeys/:id` (status)
   - `GET /journeys/:id/runs`, `POST /journeys/:id/runs` (create run — currently missing entirely in the mockup), `GET /runs/:id`
   - `POST /runs/:id/approve`, `POST /runs/:id/reject`, `POST /runs/:id/resolve-exception` — call `runEngine.advancePastAutoSteps`
   - `POST /contracts` (create, mirrors `aiSubmitAssistedContract`, also writes `activity_log`), `GET /contracts/:id`, `GET /contracts`
   - `POST /contract-assistant/parse`, `GET /contract-assistant/lookup?name=`
   - `POST /proposals` (from a contract), `POST /proposals/:id/submit-for-approval`, `POST /proposals/:id/approve` — approval now also calls `runEngine` to spawn/advance the linked `contract-to-payroll` run, closing the gap the exploration found
   - `GET/POST /notifications`, `POST /notifications/mark-all-read`
8. **Frontend wiring (AI Executive + Contract Assistant only, in this phase)**: replace direct reads of `aiJourneys`/`aiJourneyEvents`/`aiAutomationRuns`/`aiAutomationConfigs`/`contractsData` (for the assistant path)/`notifData` with `fetch('/api/...')` calls at the same call sites already cataloged (`buildAIExecutiveDashboardHTML`, `buildAIJourneyDetailHTML`, `saveAIAutomation`, `aiApproveRunStep`/`aiRejectRunStep`/`aiResolveException`, `aiSubmitAssistedContract`, `aiSendProposalForApproval`, `aiSimulateApproval`). Keep the existing `contract-loader` spinner UX — the `setTimeout` delays become real network latency, so most can be removed or shortened to a minimum-perceived-delay.
9. **CORS + local dev**: Express serves `/api/*`, static frontend still served by opening `index.html` directly (or a tiny `express.static` fallback) with `fetch` pointed at `http://localhost:<port>/api`.

## Phase 2 — Remaining modules (follow-up work, not built in first pass)

Same pattern repeated per module: table(s) already exist in the Phase 1 schema → write routes + service logic (porting the "real, portable" functions already cataloged: `submitAddTeam`, `submitAddLeavePolicy`/`saveLPSidebarEdit`/`lpSaveLog`, `submitAddLeave`, `ccRender`'s rate math) → wire the corresponding frontend call sites → **and** design + wire the currently-stub actions that have zero client logic today (leave approve/reject, payment status change, ticket reply/reassign, salary save, settings edit/add, timesheet clock-in/out persistence, notification mark-as-read). Recommended order: (a) Employees/Teams, (b) Leave Policies/Requests, (c) Payments/Compliance/Cost Calculator, (d) Support/Settings/Timesheet — each is independent enough to ship and verify separately.

## Verification

- Phase 1: `npx prisma studio` to visually confirm seeded rows and FKs; hit each new endpoint directly (curl/REST client); then run the app in a browser and click through Dashboard → AI Executive → View Journey → timeline → Automate Journey → save → Active Automation → open a run → **Approve and Continue** → confirm the step advances and persists (reload the page and confirm state survived, proving it's now server-backed instead of in-memory) → repeat for the AI Contract Assistant flow (prompt → employee match/manual entry → wizard → Create Proposal → Send for Approval → Simulate Approval) and confirm a real `contracts`/`proposals` row exists in Supabase afterward.
- Confirm no regression in modules not yet migrated (Phase 2 pages should still work exactly as before, off the untouched hardcoded arrays).
