-- SQLite-dialect schema for the Direct Employee storage backend (backend/server.js).
-- MySQL-dialect twin: sql/schema_direct_employees.sql (repo root). Same design, different
-- DDL syntax — keep both in sync when the design changes.
--
-- Column set mirrors the REAL NewForce Solutions intake form, which captures a lead/enquiry:
-- Full name, Work email, Phone (country code + number), Company name, Country hiring in,
-- What are you looking for, How did you hear about us. Note what that form does NOT ask
-- for: job title, department, branch, join date. Those are completed by HR after ingest,
-- which is exactly why an ADT-sourced record lands in 'Pending' rather than 'Active'.
--
-- Foreign keys are off by default per-connection in SQLite — server.js turns them on with
-- `PRAGMA foreign_keys = ON` right after opening the database.

-- Every system a client can arrive from, as data. This replaced a
-- `CHECK (source IN ('manual','adt_solution'))` on direct_employees: that constraint had to be
-- rewritten, and the table rebuilt, for every new connector — which made "connect another
-- system" a schema migration rather than a configuration change. Adding SAP is now one INSERT.
CREATE TABLE IF NOT EXISTS source_systems (
  id           TEXT PRIMARY KEY,       -- 'adt_solution'
  label        TEXT NOT NULL,          -- 'NewForce Solutions' — what the UI prints
  console_url  TEXT,                   -- deep link out; null for systems with no console
  is_active    INTEGER NOT NULL DEFAULT 1
);
-- 'manual' is a source_systems row like any other so the FK holds for hand-created clients.
-- It has no console_url because there is no external system to open.
INSERT OR IGNORE INTO source_systems (id, label, console_url) VALUES
  ('manual',       'Manual',             NULL),
  ('adt_solution', 'NewForce Solutions', 'https://admin.newforceltd.com/login/authentication');

CREATE TABLE IF NOT EXISTS direct_employees (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,

  -- A client carries exactly two ids, and they are two because they are minted by two different
  -- systems. Anything beyond these would be an id nobody outside this table can resolve.
  --
  --   employee_code    OUR id for the client. Minted server-side inside the insert transaction
  --                    so it is unique across every browser and operator, not per-session.
  --                    Surfaced in the UI as "Client ID".
  --   source_record_id THEIR id — the id the source system gave this same client in its own
  --                    store ('ADT-SUB-0001' from NewForce Solutions). Surfaced as "Source
  --                    Record ID". Also what makes ingest idempotent: replaying a submission
  --                    resolves to the row it already created instead of duplicating it.
  --
  -- The two never match, and are not meant to: they are two systems' names for one client.
  -- (A third id, reference_id, used to sit here — 'ADT-REF-0001', minted by US but displayed as
  -- though it were the source system's. It was the same id as employee_code wearing a different
  -- prefix, so it is gone. Databases created before this still carry the column; it is nullable,
  -- nothing writes it, and nothing reads it.)
  -- 'CLI-000010', for every client, however it arrived. One prefix and one sequence: the id is
  -- OUR name for the record, so letting it vary by origin ('ADTEMP-' for NewForce, 'EMP001' for
  -- manual, as it once did) put provenance in the one field that must not carry it. Where a
  -- client came from is the `source` column's job, and it can change; this id never does.
  employee_code       TEXT    NOT NULL UNIQUE,
  -- THEIR id, null until the source system has confirmed it. Null is a real, visible state, not
  -- an absence: we mint our id first and mirror the record out second, so between those two
  -- steps the row legitimately has no source record id (see mirror_state).
  source_record_id    TEXT,
  -- Which system the client came from; FK into source_systems rather than a CHECK list, so
  -- connecting SAP is an INSERT and not a schema migration.
  source              TEXT    NOT NULL DEFAULT 'manual' REFERENCES source_systems(id),

  -- Where the outbound mirror got to. 'not_required' for manually created clients that were
  -- never meant to leave; 'pending'/'failed' are retryable and surfaced in the UI so a failed
  -- push can never sit silently; 'mirrored' means source_record_id is populated and agreed.
  mirror_state        TEXT    NOT NULL DEFAULT 'not_required'
                        CHECK (mirror_state IN ('not_required','pending','failed','mirrored')),
  mirror_error        TEXT,
  mirror_attempts     INTEGER NOT NULL DEFAULT 0,
  mirror_last_try_at  TEXT,

  -- ---- Fields the NewForce Solutions intake form actually submits ----
  name                TEXT    NOT NULL,          -- "Full name"
  email               TEXT,                      -- "Work email"
  phone_country_code  TEXT,                      -- "Phone number" — the country dropdown
  contact             TEXT,                      -- "Phone number" — the number itself
  company_name        TEXT,                      -- "Company name"
  country             TEXT,                      -- "Country hiring in"
  looking_for         TEXT,                      -- "What are you looking for?"
  heard_about_us      TEXT,                      -- "How did you hear about us?"

  -- ---- Not on the form; filled in by HR before the record can go Active ----
  department          TEXT,
  branch              TEXT,
  job_title           TEXT,
  join_date           TEXT,
  description         TEXT,

  status              TEXT    NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Active','Inactive')),

  -- The submission exactly as received, so the UI's "Form Details" tab can show every field
  -- the form sent — including any the columns above do not model yet.
  raw_source_payload  TEXT,

  created_at          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

-- Backs the drawer's Logs tab. occurred_at is a single ISO-8601 UTC instant rather than the
-- separate display-formatted date/time columns this table used to carry: those were locale
-- strings ('28 Jul 2026' / '04:24:17 PM') that could not be inserted into the MySQL twin's
-- DATE/TIME columns and disagreed with created_at's timezone. Formatting is the UI's job.
CREATE TABLE IF NOT EXISTS direct_employee_logs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id  INTEGER NOT NULL,
  occurred_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  actor_user   TEXT    NOT NULL,   -- 'Admin', 'NewForce Solutions Sync'
  status_label TEXT    NOT NULL,   -- 'Created' | 'Pending' | 'Active' | 'Inactive' | 'Updated'
  action_note  TEXT    NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES direct_employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS direct_employee_workflow (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id  INTEGER NOT NULL,
  occurred_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  title        TEXT    NOT NULL,
  actor_user   TEXT    NOT NULL,
  description  TEXT    NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES direct_employees(id) ON DELETE CASCADE
);

-- SQLite does not create indexes for foreign keys (InnoDB does), and every drawer open runs
-- "logs for this employee, newest first".
CREATE INDEX IF NOT EXISTS idx_de_logs_employee     ON direct_employee_logs (employee_id, id DESC);
CREATE INDEX IF NOT EXISTS idx_de_workflow_employee ON direct_employee_workflow (employee_id, id DESC);
CREATE INDEX IF NOT EXISTS idx_de_status            ON direct_employees (status);
CREATE INDEX IF NOT EXISTS idx_de_source_record     ON direct_employees (source_record_id);
-- Scoped per source, not global. Two systems can legitimately both mint '12345' for different
-- clients; a global UNIQUE on source_record_id made the second connector's first collision an
-- insert failure. NULLs compare distinct in SQLite, so any number of rows may sit mirror-pending
-- with no source record id at all.
CREATE UNIQUE INDEX IF NOT EXISTS uq_de_source_record
  ON direct_employees (source, source_record_id);
-- "What still needs mirroring out" — the retry sweep's query.
CREATE INDEX IF NOT EXISTS idx_de_mirror_state      ON direct_employees (mirror_state);

-- Server-side id minting. Kept in the database (not a process variable) so restarting the
-- backend never re-issues an id that is already on a record.
CREATE TABLE IF NOT EXISTS id_sequences (
  name        TEXT    PRIMARY KEY,
  next_value  INTEGER NOT NULL
);
-- One sequence for every client, whatever system it came from. There were two ('adt_employee',
-- 'manual_employee'), which is what forced two prefixes to keep the ids apart — and the prefix
-- was then telling you the origin. One counter means one prefix can serve everything.
INSERT OR IGNORE INTO id_sequences (name, next_value) VALUES ('client', 1);

-- The ADT polling cursor. Previously this lived in each browser's localStorage, so every
-- operator kept a private idea of "what have we already seen" and the same submission could
-- be ingested once per browser. One row here makes it a property of the system.
CREATE TABLE IF NOT EXISTS sync_state (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
