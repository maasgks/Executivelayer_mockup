// Storage backend for Direct Employee master data in the Executive Layer.
//
// Owns three things the browser used to own, and could not own correctly:
//   1. Identity  — employee_code / reference_id are minted here, inside the insert
//                  transaction, so they are unique across every operator rather than per
//                  browser (two tabs previously both minted ADTEMP-0001).
//   2. The ADT credential — the API key lives in this process, not in client-side JS.
//   3. The sync cursor — "what have we already ingested" is one row in sync_state, not a
//                  private localStorage value per browser.
//
// Run: node backend/server.js   (or `npm start` from inside backend/)
// Config: PORT (4000), ADT_BASE_URL, ADT_API_KEY, EXEC_API_TOKEN, ALLOWED_ORIGINS.
// Data persists in backend/data/employees.db.

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'employees.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Points at backend/mock-adt-server.js by default. Repoint at the real ADT staging host once
// that contract is confirmed — the field mapping lives in one place (mapAdtSubmission below).
const ADT_BASE_URL = process.env.ADT_BASE_URL || 'http://localhost:4100';
const ADT_API_KEY = process.env.ADT_API_KEY || 'demo-adt-staging-key';
const ADT_LATEST_PATH = process.env.ADT_LATEST_PATH || '/api/employee-intake/latest';
const ADT_TIMEOUT_MS = 6000;

// Optional shared secret. Unset by default so the demo runs with no setup; set it for anything
// reachable beyond localhost, because these records hold names, emails and phone numbers.
const API_TOKEN = process.env.EXEC_API_TOKEN || '';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*').split(',').map((s) => s.trim());

// Used only when ADT's /schema endpoint is unreachable — the Executive Layer's intake page has
// to render something. Mirrors the real form's fields.
const FALLBACK_INTAKE_FIELDS = [
  { name: 'full_name', label: 'Full name', type: 'text', required: true },
  { name: 'work_email', label: 'Work email', type: 'email', required: true },
  { name: 'phone_country_code', label: 'Phone number', type: 'select', options: ['+91', '+31', '+49', '+34', '+44', '+1', '+65'], placeholder: 'Select' },
  { name: 'phone_number', label: '', type: 'text' },
  { name: 'company_name', label: 'Company name', type: 'text' },
  { name: 'country_hiring_in', label: 'Country hiring in', type: 'select', options: ['India', 'Netherlands', 'Germany', 'Spain', 'United Kingdom', 'United States', 'Singapore'] },
  { name: 'looking_for', label: 'What are you looking for?', type: 'select', options: ['Employer of Record (EOR)', 'Contractor Management', 'Payroll Outsourcing', 'Entity Setup', 'PEO Services'] },
  { name: 'heard_about_us', label: 'How did you hear about us?', type: 'select', options: ['Google Search', 'LinkedIn', 'Referral', 'Conference / Event', 'Existing Customer', 'Other'] }
];

const VALID_STATUSES = ['Pending', 'Active', 'Inactive'];
const VALID_SOURCES = ['manual', 'adt_solution'];
// Columns a caller may edit through PATCH /employees/:code. Deliberately excludes identity and
// provenance (employee_code, reference_id, source_record_id, source) — those are set once, by
// this server, and an edit endpoint that could rewrite them would defeat the point of minting
// them here. Also excludes status, which has its own endpoint so the audit log cannot be skipped.
const EDITABLE_FIELDS = [
  'name', 'email', 'phone_country_code', 'contact', 'company_name', 'country',
  'looking_for', 'heard_about_us', 'department', 'branch', 'job_title', 'join_date', 'description'
];

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');
db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));

// `CREATE TABLE IF NOT EXISTS` silently does nothing against a database created by an older
// schema, so a stale data/employees.db would otherwise fail later with a confusing
// "no such column" at query time. Fail loudly at startup with the fix instead.
(function assertSchemaCurrent() {
  const cols = db.prepare('PRAGMA table_info(direct_employees)').all().map((c) => c.name);
  const required = ['source_record_id', 'company_name', 'looking_for', 'heard_about_us', 'phone_country_code'];
  const missing = required.filter((c) => !cols.includes(c));
  if (missing.length) {
    console.error('Database at ' + DB_PATH + ' predates the current schema (missing: ' + missing.join(', ') + ').');
    console.error('It holds demo data only — delete it and restart:  rm -rf backend/data');
    process.exit(1);
  }
})();

const nowIso = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

/* ---------------------------------------------------------------- data access -- */

function hydrateEmployee(row) {
  if (!row) return row;
  // Stored as text; returned as an object so the client is not left double-parsing a JSON
  // string nested inside a JSON response.
  let payload = null;
  if (row.raw_source_payload) {
    try { payload = JSON.parse(row.raw_source_payload); } catch { payload = null; }
  }
  return Object.assign({}, row, { raw_source_payload: payload });
}

const findByCode = (code) => db.prepare('SELECT * FROM direct_employees WHERE employee_code = ?').get(code);
const findBySourceRecord = (id) => db.prepare('SELECT * FROM direct_employees WHERE source_record_id = ?').get(id);
const getLogs = (empId) => db.prepare('SELECT * FROM direct_employee_logs WHERE employee_id = ? ORDER BY id DESC').all(empId);
const getWorkflow = (empId) => db.prepare('SELECT * FROM direct_employee_workflow WHERE employee_id = ? ORDER BY id DESC').all(empId);

// The Workflow tab is the process view of the record — which stage of the intake-to-active
// lifecycle it has reached — as opposed to the Logs tab's field-level audit trail. Both are
// written from the same places, so the two tabs can never tell different stories.
function insertWorkflow(employeeId, title, description, actorUser) {
  const info = db.prepare(
    'INSERT INTO direct_employee_workflow (employee_id, occurred_at, title, actor_user, description) VALUES (?, ?, ?, ?, ?)'
  ).run(employeeId, nowIso(), title, actorUser || 'System', description);
  return db.prepare('SELECT * FROM direct_employee_workflow WHERE id = ?').get(info.lastInsertRowid);
}

function insertLog(employeeId, statusLabel, actionNote, actorUser) {
  const info = db.prepare(
    'INSERT INTO direct_employee_logs (employee_id, occurred_at, actor_user, status_label, action_note) VALUES (?, ?, ?, ?, ?)'
  ).run(employeeId, nowIso(), actorUser || 'System', statusLabel, actionNote);
  return db.prepare('SELECT * FROM direct_employee_logs WHERE id = ?').get(info.lastInsertRowid);
}

// Claims the next value of a named sequence. Callers must already be inside a transaction, so
// the claim and the INSERT that consumes it commit together — otherwise a crash between the
// two would burn an id, or two concurrent ingests could read the same next_value.
function nextSequenceValue(name) {
  const row = db.prepare('SELECT next_value FROM id_sequences WHERE name = ?').get(name);
  if (!row) throw new Error('Unknown id sequence: ' + name);
  db.prepare('UPDATE id_sequences SET next_value = next_value + 1 WHERE name = ?').run(name);
  return row.next_value;
}

function getSyncState(key) {
  const row = db.prepare('SELECT value FROM sync_state WHERE key = ?').get(key);
  return row ? row.value : null;
}

function setSyncState(key, value) {
  db.prepare(
    'INSERT INTO sync_state (key, value, updated_at) VALUES (?, ?, ?) ' +
    'ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at'
  ).run(key, value, nowIso());
}

function transaction(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

/* ------------------------------------------------------------------ http utils -- */

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes('*')
    ? '*'
    : (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] || '');
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age': '86400'
  };
}

function sendJson(res, status, body, origin) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, corsHeaders(origin));
  if (status === 204) { res.writeHead(204, corsHeaders(origin)); res.end(); return; }
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    let settled = false;
    const fail = (err) => { if (!settled) { settled = true; reject(err); } };
    req.on('data', (chunk) => {
      raw += chunk;
      // Reject explicitly rather than destroying the socket: a bare req.destroy() left the
      // caller with a connection reset and this promise pending forever.
      if (raw.length > 1e6) fail(new HttpError(413, 'Request body too large'));
    });
    req.on('end', () => {
      if (settled) return;
      settled = true;
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch { reject(new HttpError(400, 'Invalid JSON body')); }
    });
    req.on('error', fail);
  });
}

function requireAuth(req) {
  if (!API_TOKEN) return;
  const auth = req.headers.authorization || '';
  if (auth !== 'Bearer ' + API_TOKEN) throw new HttpError(401, 'Unauthorized');
}

/* ------------------------------------------------------------------ validation -- */

// Validating here, before the INSERT, is what turns a bad status into a 400 the caller can act
// on. Relying on the table's CHECK constraint produced a generic 500, since only UNIQUE
// violations were being recognised.
function validateEmployeeInput(body, { partial } = {}) {
  const errors = [];
  if (!partial) {
    if (!body.name || !String(body.name).trim()) errors.push('name is required');
  } else if ('name' in body && !String(body.name || '').trim()) {
    errors.push('name cannot be blank');
  }
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('email is not a valid address');
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    errors.push('status must be one of: ' + VALID_STATUSES.join(', '));
  }
  if (body.source && !VALID_SOURCES.includes(body.source)) {
    errors.push('source must be one of: ' + VALID_SOURCES.join(', '));
  }
  if (errors.length) throw new HttpError(400, errors.join('; '));
}

/* --------------------------------------------------------------- ADT ingestion -- */

// The one place the ADT form's field names are mapped onto our columns. The names on the right
// come from the real intake form (Full name / Work email / Phone / Company name / Country
// hiring in / What are you looking for / How did you hear about us). Fallbacks are kept so a
// slightly different casing from the real API does not silently produce blank records.
function mapAdtSubmission(raw) {
  return {
    source_record_id: String(raw.id || raw.recordId || raw.reference || ''),
    name: raw.full_name || raw.fullName || raw.name || '',
    email: raw.work_email || raw.workEmail || raw.email || '',
    phone_country_code: raw.phone_country_code || raw.phoneCountryCode || '',
    contact: raw.phone_number || raw.phoneNumber || raw.contact || '',
    company_name: raw.company_name || raw.companyName || '',
    country: raw.country_hiring_in || raw.countryHiringIn || raw.country || '',
    looking_for: raw.looking_for || raw.lookingFor || '',
    heard_about_us: raw.heard_about_us || raw.heardAboutUs || ''
  };
}

async function fetchLatestAdtSubmission(sinceId) {
  const url = ADT_BASE_URL + ADT_LATEST_PATH + (sinceId ? '?since=' + encodeURIComponent(sinceId) : '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ADT_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, {
      headers: { Accept: 'application/json', Authorization: 'Bearer ' + ADT_API_KEY },
      signal: controller.signal
    });
  } catch (e) {
    throw new HttpError(502, 'Could not reach ADT Solution: ' + e.message);
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 204) return null;          // nothing newer than the cursor
  if (res.status === 401) throw new HttpError(502, 'ADT Solution rejected our credentials');
  if (!res.ok) throw new HttpError(502, 'ADT Solution returned ' + res.status + ' ' + res.statusText);
  let body;
  try { body = await res.json(); }
  catch { throw new HttpError(502, 'ADT Solution response was not valid JSON'); }
  return body && body.data ? body.data : body;
}

// Writes one ADT submission into master data. Everything the form does not ask for
// (department, job title, branch, join date) is left null, and the record lands in 'Pending'
// precisely because it is incomplete — HR fills the gaps and then activates it from the Logs tab.
function ingestAdtSubmission(raw) {
  const mapped = mapAdtSubmission(raw);
  if (!mapped.source_record_id) throw new HttpError(502, 'ADT submission has no id to deduplicate on');
  if (!mapped.name) throw new HttpError(502, 'ADT submission has no full name');

  // Idempotency: the same submission replayed (poll retry, backend restart, cursor reset)
  // resolves to the row it already created rather than a duplicate.
  const existing = findBySourceRecord(mapped.source_record_id);
  if (existing) return { employee: hydrateEmployee(existing), created: false };

  const employee = transaction(() => {
    const seq = nextSequenceValue('adt_employee');
    const employeeCode = 'ADTEMP-' + String(seq).padStart(4, '0');
    const referenceId = 'ADT-REF-' + String(seq).padStart(4, '0');
    const ts = nowIso();
    const info = db.prepare(
      `INSERT INTO direct_employees
         (employee_code, reference_id, source_record_id, source, name, email, phone_country_code,
          contact, company_name, country, looking_for, heard_about_us, status, raw_source_payload,
          created_at, updated_at)
       VALUES (?, ?, ?, 'adt_solution', ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?)`
    ).run(
      employeeCode, referenceId, mapped.source_record_id, mapped.name, mapped.email,
      mapped.phone_country_code, mapped.contact, mapped.company_name, mapped.country,
      mapped.looking_for, mapped.heard_about_us, JSON.stringify(raw), ts, ts
    );
    const row = db.prepare('SELECT * FROM direct_employees WHERE id = ?').get(info.lastInsertRowid);
    insertLog(row.id, 'Created',
      'Record received from ADT Solution intake form — Reference ' + referenceId + '.', 'ADT Solution Sync');
    insertLog(row.id, 'Pending',
      'Awaiting HR review: department, job title, branch and joining date are not captured by the ADT form.',
      'ADT Solution Sync');
    insertWorkflow(row.id, 'Intake Form Submitted',
      'USER intake form submitted on ADT Solution. Submission ' + referenceId
      + (mapped.company_name ? (' from ' + mapped.company_name) : '') + '.', 'ADT Solution');
    insertWorkflow(row.id, 'Record Ingested',
      'Executive Layer retrieved the submission and minted Employee ID ' + employeeCode
      + ' and Reference ID ' + referenceId + '.', 'ADT Solution Sync');
    insertWorkflow(row.id, 'Pending HR Review',
      'Record held as Pending. HR must supply department, job title, branch and joining date before activation.',
      'Executive Layer');
    return row;
  });

  return { employee: hydrateEmployee(employee), created: true };
}

/* ---------------------------------------------------------------------- routes -- */

async function handle(req, res, url, segments) {
  const origin = req.headers.origin;

  // GET /health — unauthenticated on purpose, so it is usable as a liveness probe.
  if (req.method === 'GET' && segments[0] === 'health' && segments.length === 1) {
    sendJson(res, 200, {
      status: 'ok',
      adtBaseUrl: ADT_BASE_URL,
      authRequired: Boolean(API_TOKEN),
      employees: db.prepare('SELECT COUNT(*) AS n FROM direct_employees').get().n
    }, origin);
    return;
  }

  requireAuth(req);

  // GET /employees?status=&q=&page=&pageSize=
  if (req.method === 'GET' && segments[0] === 'employees' && segments.length === 1) {
    const status = url.searchParams.get('status');
    const q = (url.searchParams.get('q') || '').trim();
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
    const pageSize = Math.min(200, Math.max(1, parseInt(url.searchParams.get('pageSize') || '50', 10) || 50));

    if (status && !VALID_STATUSES.includes(status)) throw new HttpError(400, 'Unknown status filter: ' + status);

    const where = [];
    const params = [];
    if (status) { where.push('status = ?'); params.push(status); }
    if (q) {
      where.push('(name LIKE ? OR employee_code LIKE ? OR reference_id LIKE ? OR email LIKE ? OR company_name LIKE ?)');
      const like = '%' + q + '%';
      params.push(like, like, like, like, like);
    }
    const clause = where.length ? ' WHERE ' + where.join(' AND ') : '';
    const total = db.prepare('SELECT COUNT(*) AS n FROM direct_employees' + clause).get(...params).n;
    const rows = db.prepare(
      'SELECT * FROM direct_employees' + clause + ' ORDER BY id DESC LIMIT ? OFFSET ?'
    ).all(...params, pageSize, (page - 1) * pageSize);

    sendJson(res, 200, {
      employees: rows.map(hydrateEmployee),
      page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize))
    }, origin);
    return;
  }

  // GET /employees/:code — everything the drawer renders, in one round trip.
  if (req.method === 'GET' && segments[0] === 'employees' && segments.length === 2) {
    const employee = findByCode(decodeURIComponent(segments[1]));
    if (!employee) throw new HttpError(404, 'Employee not found');
    sendJson(res, 200, {
      employee: hydrateEmployee(employee),
      logs: getLogs(employee.id),
      workflow: getWorkflow(employee.id)
    }, origin);
    return;
  }

  // POST /employees — manual creation. ADT-sourced records come in through /adt/poll instead.
  if (req.method === 'POST' && segments[0] === 'employees' && segments.length === 1) {
    const body = await readJsonBody(req);
    validateEmployeeInput(body);
    const employee = transaction(() => {
      const code = body.employee_code || ('EMP' + String(nextSequenceValue('manual_employee')).padStart(3, '0'));
      const ts = nowIso();
      const info = db.prepare(
        `INSERT INTO direct_employees
           (employee_code, reference_id, source_record_id, source, name, email, phone_country_code,
            contact, company_name, country, looking_for, heard_about_us, department, branch,
            job_title, join_date, description, status, raw_source_payload, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        code, body.reference_id || null, body.source_record_id || null, body.source || 'manual',
        body.name, body.email || null, body.phone_country_code || null, body.contact || null,
        body.company_name || null, body.country || null, body.looking_for || null,
        body.heard_about_us || null, body.department || null, body.branch || null,
        body.job_title || null, body.join_date || null, body.description || null,
        body.status || 'Pending',
        body.raw_source_payload ? JSON.stringify(body.raw_source_payload) : null, ts, ts
      );
      const row = db.prepare('SELECT * FROM direct_employees WHERE id = ?').get(info.lastInsertRowid);
      insertLog(row.id, 'Created', body.creation_note || 'Employee record created', body.actor_user || 'System');
      return row;
    });
    sendJson(res, 201, { employee: hydrateEmployee(employee), logs: getLogs(employee.id) }, origin);
    return;
  }

  // PATCH /employees/:code — HR completing the details the ADT form does not capture.
  if (req.method === 'PATCH' && segments[0] === 'employees' && segments.length === 2) {
    const employee = findByCode(decodeURIComponent(segments[1]));
    if (!employee) throw new HttpError(404, 'Employee not found');
    const body = await readJsonBody(req);
    validateEmployeeInput(body, { partial: true });

    const updates = EDITABLE_FIELDS.filter((f) => f in body);
    if (!updates.length) throw new HttpError(400, 'No editable fields supplied');

    const changed = updates.filter((f) => (body[f] || null) !== (employee[f] || null));
    const updated = transaction(() => {
      db.prepare(
        'UPDATE direct_employees SET ' + updates.map((f) => f + ' = ?').join(', ') +
        ', updated_at = ? WHERE id = ?'
      ).run(...updates.map((f) => (body[f] === '' ? null : body[f])), nowIso(), employee.id);
      if (changed.length) {
        insertLog(employee.id, 'Updated',
          body.comment || ('Updated ' + changed.join(', ') + '.'), body.user || 'Admin');
        insertWorkflow(employee.id, 'Details Completed',
          'HR supplied ' + changed.join(', ') + '.', body.user || 'Admin');
      }
      return db.prepare('SELECT * FROM direct_employees WHERE id = ?').get(employee.id);
    });
    sendJson(res, 200, {
      employee: hydrateEmployee(updated), logs: getLogs(employee.id), workflow: getWorkflow(employee.id)
    }, origin);
    return;
  }

  // PATCH /employees/:code/status — the Logs tab's status form.
  // The row update and its log entry are one transaction: previously status could only be
  // changed by POSTing a log, which left the log saying "Inactive" while the row still said
  // "Active". Here they cannot diverge.
  if (req.method === 'PATCH' && segments[0] === 'employees' && segments[2] === 'status' && segments.length === 3) {
    const employee = findByCode(decodeURIComponent(segments[1]));
    if (!employee) throw new HttpError(404, 'Employee not found');
    const body = await readJsonBody(req);

    if (!body.status) throw new HttpError(400, 'status is required');
    if (!VALID_STATUSES.includes(body.status)) {
      throw new HttpError(400, 'status must be one of: ' + VALID_STATUSES.join(', '));
    }
    // The UI marks Comment required; enforce it here too, so the audit trail cannot be
    // sidestepped by calling the API directly.
    if (!body.comment || !String(body.comment).trim()) throw new HttpError(400, 'comment is required');
    if (body.status === employee.status) {
      throw new HttpError(409, 'Employee is already ' + employee.status);
    }

    const result = transaction(() => {
      db.prepare('UPDATE direct_employees SET status = ?, updated_at = ? WHERE id = ?')
        .run(body.status, nowIso(), employee.id);
      const log = insertLog(employee.id, body.status, String(body.comment).trim(), body.user || 'Admin');
      insertWorkflow(employee.id, 'Status changed to ' + body.status,
        employee.status + ' → ' + body.status + '. ' + String(body.comment).trim(), body.user || 'Admin');
      return { row: db.prepare('SELECT * FROM direct_employees WHERE id = ?').get(employee.id), log };
    });
    sendJson(res, 200, {
      employee: hydrateEmployee(result.row), log: result.log,
      logs: getLogs(employee.id), workflow: getWorkflow(employee.id)
    }, origin);
    return;
  }

  // POST /employees/:code/logs — free-standing comment, no status change.
  if (req.method === 'POST' && segments[0] === 'employees' && segments[2] === 'logs' && segments.length === 3) {
    const employee = findByCode(decodeURIComponent(segments[1]));
    if (!employee) throw new HttpError(404, 'Employee not found');
    const body = await readJsonBody(req);
    if (!body.status || !body.action) throw new HttpError(400, 'status and action are required');
    sendJson(res, 201, { log: insertLog(employee.id, body.status, body.action, body.user) }, origin);
    return;
  }

  // POST /employees/:code/workflow — the drawer's Workflow tab.
  if (req.method === 'POST' && segments[0] === 'employees' && segments[2] === 'workflow' && segments.length === 3) {
    const employee = findByCode(decodeURIComponent(segments[1]));
    if (!employee) throw new HttpError(404, 'Employee not found');
    const body = await readJsonBody(req);
    if (!body.title || !body.description) throw new HttpError(400, 'title and description are required');
    const info = db.prepare(
      'INSERT INTO direct_employee_workflow (employee_id, occurred_at, title, actor_user, description) VALUES (?, ?, ?, ?, ?)'
    ).run(employee.id, nowIso(), body.title, body.user || 'System', body.description);
    sendJson(res, 201, {
      entry: db.prepare('SELECT * FROM direct_employee_workflow WHERE id = ?').get(info.lastInsertRowid)
    }, origin);
    return;
  }

  // GET /adt/status — what the "Live ADT Solution Sync" panel shows before anything arrives.
  if (req.method === 'GET' && segments[0] === 'adt' && segments[1] === 'status' && segments.length === 2) {
    sendJson(res, 200, {
      baseUrl: ADT_BASE_URL,
      lastSeenSourceId: getSyncState('adt_last_seen_source_id'),
      lastPolledAt: getSyncState('adt_last_polled_at'),
      ingestedCount: db.prepare("SELECT COUNT(*) AS n FROM direct_employees WHERE source = 'adt_solution'").get().n
    }, origin);
    return;
  }

  // POST /adt/poll — one poll of ADT Solution. The frontend calls this on an interval; the
  // credential and the cursor both stay on this side of the wire.
  if (req.method === 'POST' && segments[0] === 'adt' && segments[1] === 'poll' && segments.length === 2) {
    const since = getSyncState('adt_last_seen_source_id');
    const raw = await fetchLatestAdtSubmission(since);
    setSyncState('adt_last_polled_at', nowIso());
    if (!raw) { sendJson(res, 200, { status: 'idle' }, origin); return; }

    const { employee, created } = ingestAdtSubmission(raw);
    setSyncState('adt_last_seen_source_id', employee.source_record_id);
    sendJson(res, 200, {
      status: created ? 'ingested' : 'duplicate',
      employee,
      logs: getLogs(employee.id),
      workflow: getWorkflow(employee.id),
      submission: raw
    }, origin);
    return;
  }

  // GET /adt/form-schema — ADT's own definition of its intake form, proxied so the Executive
  // Layer renders the real field list instead of a hardcoded copy that drifts when ADT changes
  // the form. Falls back to the known field set if ADT is unreachable, since the page has to
  // render something.
  if (req.method === 'GET' && segments[0] === 'adt' && segments[1] === 'form-schema' && segments.length === 2) {
    let schema = null;
    try {
      const r = await fetch(ADT_BASE_URL + '/api/employee-intake/schema', { headers: { Accept: 'application/json' } });
      if (r.ok) schema = await r.json();
    } catch { /* fall through to the built-in default below */ }
    sendJson(res, 200, schema || { fields: FALLBACK_INTAKE_FIELDS, fallback: true }, origin);
    return;
  }

  // POST /adt/submit — fill in ADT Solution's intake form from inside the Executive Layer.
  // Deliberately routed THROUGH ADT rather than written straight to our own tables: the record
  // must originate in the source system, get its ADT submission id there, and come back to us
  // through the same ingest path a form filled on ADT's website would take. Anything else would
  // demo a shortcut that does not exist in production.
  if (req.method === 'POST' && segments[0] === 'adt' && segments[1] === 'submit' && segments.length === 2) {
    const body = await readJsonBody(req);
    if (!body.full_name || !String(body.full_name).trim()) throw new HttpError(400, 'Full name is required');
    if (body.work_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.work_email)) {
      throw new HttpError(400, 'Work email is not a valid address');
    }

    let submitted;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ADT_TIMEOUT_MS);
    try {
      const r = await fetch(ADT_BASE_URL + '/api/employee-intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + ADT_API_KEY },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      if (!r.ok) throw new HttpError(502, 'ADT Solution rejected the submission (' + r.status + ')');
      const payload = await r.json();
      submitted = payload && payload.data ? payload.data : payload;
    } catch (e) {
      if (e instanceof HttpError) throw e;
      throw new HttpError(502, 'Could not reach ADT Solution: ' + e.message);
    } finally {
      clearTimeout(timer);
    }

    const { employee, created } = ingestAdtSubmission(submitted);
    // Move the cursor past this submission so the background poller does not re-offer it.
    setSyncState('adt_last_seen_source_id', employee.source_record_id);
    sendJson(res, 201, {
      status: created ? 'ingested' : 'duplicate',
      employee,
      logs: getLogs(employee.id),
      workflow: getWorkflow(employee.id),
      submission: submitted
    }, origin);
    return;
  }

  throw new HttpError(404, 'Not found');
}

/* ---------------------------------------------------------------------- server -- */

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const segments = url.pathname.split('/').filter(Boolean);
  const origin = req.headers.origin;

  if (req.method === 'OPTIONS') { sendJson(res, 204, null, origin); return; }

  try {
    await handle(req, res, url, segments);
  } catch (e) {
    if (e instanceof HttpError) { sendJson(res, e.status, { error: e.message }, origin); return; }
    console.error('[error] ' + req.method + ' ' + url.pathname, e);
    sendJson(res, 500, { error: 'Internal error' }, origin);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') console.error('Port ' + PORT + ' is already in use. Set PORT to something else.');
  else console.error('Server error: ' + err.message);
  process.exit(1);
});

// Close the database on the way out so SQLite is never left with a hot journal file.
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('\n' + signal + ' received — shutting down.');
  server.close(() => {
    try { db.close(); } catch {}
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

server.listen(PORT, () => {
  console.log('Executive Layer storage backend listening on http://localhost:' + PORT);
  console.log('  Data file:     ' + DB_PATH);
  console.log('  ADT Solution:  ' + ADT_BASE_URL + ADT_LATEST_PATH);
  if (!API_TOKEN) console.log('  Auth:          DISABLED (set EXEC_API_TOKEN before exposing this beyond localhost)');
  if (ALLOWED_ORIGINS.includes('*')) console.log('  CORS:          open to all origins (set ALLOWED_ORIGINS to restrict)');
});
