// Connection settings for the Executive Layer storage backend (backend/server.js).
//
// Note what is NOT here: the ADT Solution API key. It used to ship in client-side JS because
// the browser called ADT directly; the backend now holds that credential and proxies the poll,
// so this file contains nothing secret and is safe to commit.
window.EXEC_CONFIG = {
  baseUrl: 'http://localhost:4000',
  // How often the "Live ADT Solution Sync" panel asks the backend to poll ADT Solution.
  pollIntervalMs: 4000,
  // Set only if the backend was started with EXEC_API_TOKEN. Leave empty for local demos.
  apiToken: '',
  // Where the "Open the ADT Solution form" link on the sync panel points. Change to the real
  // ADT Solution website once the integration moves off backend/mock-adt-server.js.
  adtFormUrl: 'http://localhost:4100'
};
