// Client for the Executive Layer storage backend (backend/server.js).
//
// Replaces the previous js/adtApi.js, which called NewForce Solutions straight from the browser.
// That arrangement put the ADT API key in client-side JS and gave every browser tab its own
// sync cursor and its own Client ID counter — so two operators watching at once both minted the
// same client code for different clients. All three concerns now live server-side; this file
// just talks to our own backend.
//
// Every call resolves to {ok:true, data} or {ok:false, error} rather than throwing, because
// each caller here is a UI handler that has to render the failure rather than propagate it.

const EXEC_API_TIMEOUT_MS = 8000;
let execApiOfflineWarned = false;

function execApiBase(){
  return (window.EXEC_CONFIG && EXEC_CONFIG.baseUrl) || 'http://localhost:4000';
}

function execApiHeaders(){
  const h = {'Accept':'application/json','Content-Type':'application/json'};
  if(window.EXEC_CONFIG && EXEC_CONFIG.apiToken) h['Authorization'] = 'Bearer ' + EXEC_CONFIG.apiToken;
  return h;
}

async function execApiRequest(method, path, body){
  const controller = new AbortController();
  const timer = setTimeout(function(){controller.abort();}, EXEC_API_TIMEOUT_MS);
  let res;
  try{
    res = await fetch(execApiBase() + path, {
      method: method,
      headers: execApiHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });
  }catch(networkErr){
    // The backend not running is the single most likely failure in a demo, so say so plainly
    // once rather than repeating the same console noise on every poll tick.
    if(!execApiOfflineWarned){
      console.warn('[execApi] Cannot reach the Executive Layer backend at ' + execApiBase()
        + '. Start it with:  node backend/server.js');
      execApiOfflineWarned = true;
    }
    return {ok:false, error:'Backend unreachable', offline:true};
  }finally{
    clearTimeout(timer);
  }
  execApiOfflineWarned = false;
  if(res.status === 204) return {ok:true, data:null};
  let payload = null;
  try{ payload = await res.json(); }catch(e){ payload = null; }
  if(!res.ok){
    return {ok:false, error:(payload && payload.error) || (res.status + ' ' + res.statusText), status:res.status};
  }
  return {ok:true, data:payload};
}

/* ------------------------------------------------------------------ ADT sync -- */

// Asks the backend to poll NewForce Solutions once. Returns:
//   status 'idle'      — nothing new since the backend's cursor
//   status 'ingested'  — a new submission became a client record (Pending)
//   status 'duplicate' — the submission had already been ingested; no new row
function execApiPollAdt(){
  return execApiRequest('POST', '/adt/poll');
}

function execApiAdtStatus(){
  return execApiRequest('GET', '/adt/status');
}

/* ----------------------------------------------------------------- employees -- */

function execApiListEmployees(params){
  const q = new URLSearchParams();
  if(params && params.status) q.set('status', params.status);
  if(params && params.q) q.set('q', params.q);
  if(params && params.page) q.set('page', params.page);
  if(params && params.pageSize) q.set('pageSize', params.pageSize);
  const qs = q.toString();
  return execApiRequest('GET', '/employees' + (qs ? ('?' + qs) : ''));
}

function execApiGetEmployee(employeeCode){
  return execApiRequest('GET', '/employees/' + encodeURIComponent(employeeCode));
}

// Status change from the Logs tab. The backend updates the row and writes the audit entry in
// one transaction, so the timeline and the badge can never disagree.
function execApiChangeStatus(employeeCode, status, comment, user){
  return execApiRequest('PATCH', '/employees/' + encodeURIComponent(employeeCode) + '/status',
    {status:status, comment:comment, user:user});
}

// HR completing the fields the ADT intake form does not capture.
function execApiUpdateEmployee(employeeCode, fields){
  return execApiRequest('PATCH', '/employees/' + encodeURIComponent(employeeCode), fields);
}

/* --------------------------------------------------------------- normalizing -- */

// Backend row -> the shape directEmpData rows use in this app. Keeping the translation in one
// function means the UI never has to know the column names.
function execApiToDirectEmpRow(row, localId){
  return {
    id: localId,
    backendId: row.id,
    name: row.name,
    // The two ids a client has, and the reason they never match: empId is the one WE minted for
    // it, sourceRecordId is the one the SOURCE system minted for the same client in its own
    // store. Nothing derives one from the other.
    empId: row.employee_code,
    sourceRecordId: row.source_record_id,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Not captured by the ADT intake form — HR fills these in, which is why the record is Pending.
    dept: row.department || '--',
    branch: row.branch || '--',
    jobTitle: row.job_title || '--',
    joinDate: row.join_date || '--',
    desc: row.description || '--',
    // Straight from the form.
    contact: row.contact ? ((row.phone_country_code ? row.phone_country_code + ' ' : '') + row.contact) : '--',
    email: row.email || '--',
    companyName: row.company_name || '--',
    country: row.country || '--',
    lookingFor: row.looking_for || '--',
    heardAboutUs: row.heard_about_us || '--',
    formFields: row.raw_source_payload || null,
    status: row.status
  };
}

// Backend log rows carry one UTC instant; the timeline renders separate date and time, so the
// split happens here at the edge rather than being baked into storage.
function execApiToLogRows(logs){
  return (logs || []).map(function(l){
    const d = new Date(l.occurred_at);
    return {
      date: d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),
      time: d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}),
      user: l.actor_user,
      status: l.status_label,
      action: l.action_note
    };
  });
}

// Workflow entries — the process view (which lifecycle stage the record reached) as opposed to
// the Logs tab's field-level audit trail. Rendered oldest-first, since a process reads forwards.
function execApiToWorkflowRows(workflow){
  return (workflow || []).slice().reverse().map(function(w){
    const d = new Date(w.occurred_at);
    return {
      title: w.title,
      user: w.actor_user,
      date: d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),
      time: d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}),
      description: w.description
    };
  });
}
