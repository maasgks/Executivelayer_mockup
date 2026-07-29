-- Reference schema for the real production backend (CodeIgniter 3 / MySQL, per the actual
-- product's stack). MySQL-dialect twin of backend/schema.sql, which the standalone Node demo
-- backend runs against. Same design — kept as two files because the engines need different
-- DDL, not because the design differs. Keep both in sync.
--
-- Column set mirrors the REAL ADT Solution intake form, which captures a lead/enquiry:
-- Full name, Work email, Phone (country code + number), Company name, Country hiring in,
-- What are you looking for, How did you hear about us. That form does NOT ask for job title,
-- department, branch, or join date — HR completes those after ingest, which is why an
-- ADT-sourced record lands in 'Pending' rather than 'Active'.

CREATE TABLE direct_employees (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  -- Identity. Both minted server-side inside the insert transaction so they are unique across
  -- every operator and browser session.
  employee_code       VARCHAR(30)  NOT NULL UNIQUE,  -- 'ADTEMP-0001' (ADT-sourced) | 'EMP001' (manual)
  reference_id        VARCHAR(40)  NULL UNIQUE,      -- 'ADT-REF-0001'; NULL for manual rows with no external origin

  -- Provenance. source_record_id is ADT's OWN id for the submission — the idempotency key that
  -- makes replaying a submission resolve to the same row. Distinct from reference_id, which is
  -- an id we mint for display.
  source_record_id    VARCHAR(64)  NULL UNIQUE,
  source              VARCHAR(30)  NOT NULL DEFAULT 'manual',  -- 'manual' | 'adt_solution'

  -- ---- Fields the ADT Solution intake form actually submits ----
  name                VARCHAR(150) NOT NULL,        -- "Full name"
  email               VARCHAR(150) NULL,            -- "Work email"
  phone_country_code  VARCHAR(10)  NULL,            -- "Phone number" — the country dropdown
  contact             VARCHAR(30)  NULL,            -- "Phone number" — the number itself
  company_name        VARCHAR(150) NULL,            -- "Company name"
  country             VARCHAR(100) NULL,            -- "Country hiring in"
  looking_for         VARCHAR(150) NULL,            -- "What are you looking for?"
  heard_about_us      VARCHAR(150) NULL,            -- "How did you hear about us?"

  -- ---- Not on the form; filled in by HR before the record can go Active ----
  department          VARCHAR(100) NULL,
  branch              VARCHAR(100) NULL,
  job_title           VARCHAR(150) NULL,
  join_date           DATE         NULL,
  description         VARCHAR(255) NULL,

  status              ENUM('Pending','Active','Inactive') NOT NULL DEFAULT 'Pending',

  -- The submission exactly as received, so the UI's "Form Details" tab can show every field
  -- the form sent — including any the columns above do not model yet.
  raw_source_payload  JSON         NULL,

  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_de_status (status),
  INDEX idx_de_source_record (source_record_id)
);

-- Backs the drawer's Logs tab. occurred_at is one UTC instant rather than the separate
-- date/time columns this table used to carry — the Node backend was writing locale display
-- strings ('28 Jul 2026' / '04:24:17 PM') into what this file declared as DATE/TIME, which
-- MySQL would have rejected. Formatting is the UI's job.
CREATE TABLE direct_employee_logs (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id  INT UNSIGNED NOT NULL,
  occurred_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actor_user   VARCHAR(100) NOT NULL,   -- 'Admin', 'ADT Solution Sync'
  status_label VARCHAR(50)  NOT NULL,   -- 'Created' | 'Pending' | 'Active' | 'Inactive' | 'Updated'
  action_note  VARCHAR(255) NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES direct_employees(id) ON DELETE CASCADE,
  INDEX idx_de_logs_employee (employee_id, id DESC)
);

CREATE TABLE direct_employee_workflow (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id  INT UNSIGNED NOT NULL,
  occurred_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title        VARCHAR(150) NOT NULL,
  actor_user   VARCHAR(100) NOT NULL,
  description  VARCHAR(500) NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES direct_employees(id) ON DELETE CASCADE,
  INDEX idx_de_workflow_employee (employee_id, id DESC)
);

-- Server-side id minting, held in the database rather than in process memory so a restart
-- never re-issues an id that is already on a record.
CREATE TABLE id_sequences (
  name        VARCHAR(50)  PRIMARY KEY,
  next_value  INT UNSIGNED NOT NULL
);
INSERT IGNORE INTO id_sequences (name, next_value) VALUES ('adt_employee', 1), ('manual_employee', 1);

-- The ADT polling cursor. Previously per-browser localStorage, so each operator kept a private
-- idea of "what have we already seen" and one submission could be ingested once per browser.
CREATE TABLE sync_state (
  `key`      VARCHAR(50) PRIMARY KEY,
  value      TEXT,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
