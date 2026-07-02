# Backend Build — Progress Status

Companion to [`backend-implementation-plan.md`](./backend-implementation-plan.md) (the full architecture/plan doc). This file is a snapshot of **what's actually been built vs. what's left**, so work can resume cleanly.

## Done so far

All of it lives under the new `server/` directory (Node + TypeScript + Express + Prisma, targeting Supabase Postgres). Nothing has been installed or run yet — this is all source code, written but not yet executed.

### Project scaffold
- `server/package.json` — deps: express, @prisma/client, zod, cors, dotenv; devDeps: prisma, tsx, typescript, @types/*
- `server/tsconfig.json`
- `server/.env.example` — documents `DATABASE_URL` / `DIRECT_URL` (Supabase pooled + direct connection strings) / `PORT` / `CORS_ORIGIN`
- `server/.gitignore`

### Database schema — `server/prisma/schema.prisma`
Full schema covering **every module** cataloged from the frontend (not just AI Executive), so relationships are correct from day one:
- Shared: `Entity`, `User`, `Employee`, `ActivityLog` (polymorphic, replaces every module's `{x}LogsData`/`{x}WorkflowData` pair), `Notification`, `LookupValue`
- AI Executive (fully modeled — this is the flagship module): `Journey`, `JourneyStep`, `AutomationConfig`, `AutomationScope`, `AutomationRun`, `RunStep`, `RunActivityLog`
- Contracts + AI Contract Assistant: `Contract`, `ContractCommercial`, `ContractComplianceItem`, `Proposal`
- Core HR (schema only, no routes yet): `Team`, `TeamMember`, `LeavePolicy`, `LeavePolicyAssignment`, `LeaveRequest`
- Finance & Compliance (schema only): `PayrollCycle`, `PaymentOrder`, `PaymentOrderEmployee`, `PaymentAttachment`, `ComplianceRate`, `CountryRateRule`
- Support & Ops (schema only): `Ticket`, `TicketMessage`, `Chat`, `ChatTicket`, `TimesheetAttendance`

**Not yet run** — no `prisma migrate dev` has been executed, so none of these tables exist in a real database yet (no Supabase project has been created/connected either).

### Business logic — `server/src/services/`
Ported from the exact algorithms found in `js/core.js`/`js/pages.js`:
- `runEngine.ts` — `createRun()`, `advancePastAutoSteps()` (ports `aiAdvanceRunPastAutoSteps`, now journey-generic instead of hardcoded to `contract-to-payroll`, and writes real per-step history via `RunStep` rows instead of only moving a pointer), `rejectRun()`, `markException()`, `runCounts()` (ports `aiRunCounts`)
- `contractAssistant.ts` — `parsePrompt()` (ports `parseAIContractPrompt`, rule-based, no LLM), `findExistingEmployee()` (ports the exact/substring name-match logic)
- `commercialCalculator.ts` — `computeCommercial()` (ports `aiGenCommercial`'s fixed-ratio math; falls back to a country-rate-driven calc if `CountryRateRule` rows exist for that country)
- `activityLog.ts` — shared insert helper for the polymorphic log table

### API routes — `server/src/routes/` (mounted in `app.ts` under `/api`)
- `journeys.ts` — list/get journeys, get steps, save automation config (`POST /:id/automations`, splits the mockup's conflated `saveAIAutomation`), list/create runs
- `runs.ts` — get run detail (with derived per-step status + recent activity), `POST /:runCode/approve`, `/reject`, `/resolve-exception`, `/exception`, `/counts`
- `contracts.ts` — list/get/create (ports `aiSubmitAssistedContract`, writes commercial terms + compliance item + activity log)
- `proposals.ts` — create from a contract, `submit-for-approval` (notifies + moves contract status), `approve` (ports `aiSimulateApproval` **and closes the gap** found during exploration: approving a proposal now creates/advances the linked `contract-to-payroll` automation run, which the original mockup never did)
- `notifications.ts` — list, mark-all-read, mark one read
- `employees.ts` — list/search (backs the contract assistant's employee lookup)
- `contractAssistant.ts` — `POST /parse`, `GET /lookup?name=`

## Not done yet — what's left

In the order it should happen:

1. **`server/prisma/seed.ts`** — was mid-write when this pass was cut off (rejected before the file was saved, so it does not exist yet). It needs to transcribe the current hardcoded mock data (`aiJourneys`, all 6 journeys' `aiJourneyEvents`, `aiAutomationRuns`, `directEmpData`, `globalEmpData`, `teamsData`, `contractsData`, `entitiesData`, `notifData`, plus a handful of `User` rows) into the DB so the app shows the same demo content it does today, just served from Postgres.
2. **Create the Supabase project** and drop the real connection strings into `server/.env` (copy from `.env.example`). This is a step only the user can do (needs a Supabase account).
3. **`npm install`** in `server/`, then `npx prisma migrate dev` to create all tables, then `npm run seed`.
4. **Fix whatever surfaces** once the code actually compiles/runs against a real database and Prisma-generated types — none of the TypeScript in `services/`/`routes/` has been type-checked or executed yet.
5. **Frontend wiring (AI Executive + Contract Assistant only, per the plan's Phase 1 scope)** — replace the hardcoded reads in `js/core.js`/`js/pages.js` (`aiJourneys`, `aiJourneyEvents`, `aiAutomationRuns`, `aiAutomationConfigs`, the contract-assistant path of `contractsData`, `notifData`) with `fetch('/api/...')` calls at the specific call sites already cataloged in the plan doc (`buildAIExecutiveDashboardHTML`, `buildAIJourneyDetailHTML`, `saveAIAutomation`, `aiApproveRunStep`/`aiRejectRunStep`/`aiResolveException`, `aiSubmitAssistedContract`, `aiSendProposalForApproval`, `aiSimulateApproval`). **None of this has started** — the frontend is completely untouched so far.
6. **End-to-end verification** — Prisma Studio to confirm seeded rows, hit each endpoint directly, then click through the app in a browser (Dashboard → AI Executive → journey → automate → run → Approve and Continue → confirm it persists across a reload) and the AI Contract Assistant flow (prompt → match/manual entry → wizard → proposal → send → approve → confirm a real DB row exists).

Phase 2 (Employees/Teams/Leave/Payments/Compliance/Support/Settings/Timesheet routes + frontend wiring, plus wiring the many currently-stub buttons that have zero client logic today) is documented in `backend-implementation-plan.md` and hasn't been started — the schema for those modules exists but there are no routes for them yet.

## Resuming

Pick up at item 1 above (the seed script) — everything through item 4 can be done without touching the frontend at all, and gives a fully working, independently-testable API before any frontend rewiring begins.
