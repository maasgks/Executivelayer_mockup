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
  employee_code       TEXT    NOT NULL UNIQUE,   -- 'CLI-0010' (client) | 'EMP001' (manual)
  source_record_id    TEXT    UNIQUE,
  -- Which system the client came from. Rendered as the "Source System" column.
  source              TEXT    NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','adt_solution')),

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

-- Server-side id minting. Kept in the database (not a process variable) so restarting the
-- backend never re-issues an id that is already on a record.
CREATE TABLE IF NOT EXISTS id_sequences (
  name        TEXT    PRIMARY KEY,
  next_value  INTEGER NOT NULL
);
INSERT OR IGNORE INTO id_sequences (name, next_value) VALUES ('adt_employee', 1);
INSERT OR IGNORE INTO id_sequences (name, next_value) VALUES ('manual_employee', 1);

-- The ADT polling cursor. Previously this lived in each browser's localStorage, so every
-- operator kept a private idea of "what have we already seen" and the same submission could
-- be ingested once per browser. One row here makes it a property of the system.
CREATE TABLE IF NOT EXISTS sync_state (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
