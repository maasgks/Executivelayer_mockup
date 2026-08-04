// Which system a client is pushed to, and how.
//
// A client's `source` column decides its connector, not a global setting — so a record created
// against the mock still retries against the mock after the backend has been repointed at the
// real middleware. CLIENT_SOURCE only chooses where NEW clients go.
//
// Config: CLIENT_SOURCE (adt_solution | newforce_mw), NF_MW_URL, NF_MW_OUTH_KEY,
//         NF_MW_JWT_SECRET, NF_MW_TIMEOUT_MS.

const adtSolution = require('./adt-solution');
const newforceMw = require('./newforce-mw');
const bhaiyaa = require('./bhaiyaa');

const CONNECTORS = {
  adt_solution: adtSolution,
  newforce_mw: newforceMw,
  bhaiyaa: bhaiyaa
};

// Credentials come from the environment and nowhere else. The mock's key has a default because it
// is a fixture; these do not, because a default here would be a live CRM credential in git.
function configFor(sourceId) {
  if (sourceId === 'bhaiyaa') {
    return {
      baseUrl: (process.env.BHAIYAA_MW_URL || '').replace(/\/+$/, ''),
      // Seller_MW's OuthValue defaults to the same shared string. Sent because the auth layer
      // reads it on some paths; the device token is what actually gets us in.
      outhKey: process.env.BHAIYAA_OUTH_KEY || '',
      timeoutMs: Number(process.env.BHAIYAA_TIMEOUT_MS || 15000),
      // How far back a single poll looks. The list is id-descending, so this is also the most
      // stores that can arrive between two polls without one being missed.
      pageSize: Number(process.env.BHAIYAA_PAGE_SIZE || 25)
    };
  }
  if (sourceId === 'newforce_mw') {
    return {
      baseUrl: (process.env.NF_MW_URL || '').replace(/\/+$/, ''),
      outhKey: process.env.NF_MW_OUTH_KEY || '',
      jwtSecret: process.env.NF_MW_JWT_SECRET || '',
      // 30s to match the PHP client: a successful lead takes ~1.4s because the middleware sends
      // its notification email before answering, and a slow SES call must not look like a failure.
      timeoutMs: Number(process.env.NF_MW_TIMEOUT_MS || 30000),
      createBy: process.env.NF_MW_CREATE_BY || '1',
      allowDuplicate: process.env.NF_MW_ALLOW_DUPLICATE || '0'
    };
  }
  return {
    baseUrl: process.env.ADT_BASE_URL || 'http://localhost:4100',
    apiKey: process.env.ADT_API_KEY || 'demo-adt-staging-key',
    timeoutMs: 6000
  };
}

// Missing credentials are a configuration mistake, and the useful moment to say so is at startup
// rather than when the first Account Manager presses Submit and gets a network error.
function describeMisconfiguration(sourceId) {
  if (sourceId === 'bhaiyaa') {
    return process.env.BHAIYAA_MW_URL ? null : 'Store sync is on but BHAIYAA_MW_URL is not set';
  }
  if (sourceId !== 'newforce_mw') return null;
  const cfg = configFor(sourceId);
  const missing = ['NF_MW_URL', 'NF_MW_OUTH_KEY', 'NF_MW_JWT_SECRET']
    .filter((name) => !process.env[name]);
  if (missing.length) return 'CLIENT_SOURCE=newforce_mw but ' + missing.join(', ') + ' not set';
  if (!/^https?:\/\//.test(cfg.baseUrl)) return 'NF_MW_URL is not an absolute URL: ' + cfg.baseUrl;
  return null;
}

const activeSourceId = () => (process.env.CLIENT_SOURCE || 'adt_solution');

function connectorFor(sourceId) {
  const connector = CONNECTORS[sourceId];
  if (!connector) throw new Error('No connector for source "' + sourceId + '"');
  return connector;
}

// One call site for the push, whichever system it goes to. Returns
// {ok:true, sourceRecordId, submission?} or {ok:false, error, field?}.
function submitTo(sourceId, intake, extra) {
  const cfg = Object.assign(configFor(sourceId), extra || {});
  return connectorFor(sourceId).submit(intake, cfg);
}

// Optional per-connector "would this be refused outright?" check, run before anything is written
// here. Connectors that cannot answer the question simply do not implement it.
function precheckAt(sourceId, intake, extra) {
  const connector = connectorFor(sourceId);
  if (typeof connector.precheck !== 'function') return Promise.resolve({ ok: true });
  return connector.precheck(intake, Object.assign(configFor(sourceId), extra || {}));
}

// Inbound counterpart to submitTo: ask a source system what it has that we do not. Only the
// platforms we ingest FROM implement it.
function pollStoresSince(sourceId, cursor, extra) {
  const connector = connectorFor(sourceId);
  if (typeof connector.pollSince !== 'function') {
    return Promise.resolve({ ok: false, error: sourceId + ' cannot be polled for stores' });
  }
  return connector.pollSince(cursor, Object.assign(configFor(sourceId), extra || {}));
}

// Push a status change onward. Optional in the same way: the mock has no notion of a client's
// status, so it does not implement this and a status change against it is simply local.
// `supported:false` is distinct from a failure — nothing went wrong, there is just nowhere to send it.
function pushStatusTo(sourceId, sourceRecordId, status, extra) {
  const connector = connectorFor(sourceId);
  if (typeof connector.pushStatus !== 'function') return Promise.resolve({ ok: true, supported: false });
  return connector.pushStatus(sourceRecordId, status, Object.assign(configFor(sourceId), extra || {}));
}

module.exports = { CONNECTORS, connectorFor, configFor, submitTo, precheckAt, pushStatusTo, pollStoresSince, activeSourceId, describeMisconfiguration };
