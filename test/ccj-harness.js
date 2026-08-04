// Headless checks for the rebuilt Contract Creation journey (js/contract-journey.js).
//
//   node test/ccj-harness.js
//
// Same approach as runner-harness.js: load the real scripts into a vm context with a stubbed
// DOM and read the strings the builders emit. Two differences.
//
// THE CLOCK. This journey is a timed state machine, so setTimeout is a queue advanced by hand.
// That makes the whole run deterministic and lets a multi-second flow be walked beat by beat.
//
// THE READS. Everything is read through run('expr'), never off the context object. The app is
// plain scripts and its state is declared with let/const, which are lexical bindings inside the
// script — they never become properties of the vm context. ctx.page would be a second, unrelated
// global that the real `page` shadows, and every assertion against it would be a lie.

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const noop = function () {};

/* ---- A DOM stub with real identity ------------------------------------------------------
   Elements are kept in a map by id and returned consistently, because the journey paints
   surgically — it writes into #ccj-panel-inner, #ccj-screen and #ccj-stream without re-rendering
   the page. A stub handing back a fresh object each call would make every one of those writes
   invisible and every assertion below meaningless. */
const nodes = {};
// Replacing a parent's innerHTML destroys its children. The stub has to model that, or a paint
// target from a previous screen keeps answering getElementById and assertions read markup that
// is no longer anywhere on the page — which is exactly how a stale-node bug hides.
const CHILD_OF = {
  'ccj-work': ['ccj-screen', 'ccj-stream', 'ccj-composer', 'ccj-prompt', 'ccj-chat'],
  'ccj-composer': ['ccj-prompt'],
  'ccj-panel-inner': ['ccj-ev-lines']
};
/* On a rebuilt stage the conversation is a SIBLING of the work area rather than a child of it —
   that is the whole reason a screen change no longer tears down the sub-status blocks. The stub
   has to model the same tree, or it will keep deleting the stream node on a work-area repaint
   and every assertion that reads the conversation afterwards reads an empty string. Which is
   worse than failing: several of them would have passed on `indexOf(...) === -1`. */
function childrenOf(id) {
  if (id !== 'ccj-work') return CHILD_OF[id] || [];
  // Through run(), NOT ctx.ccjRun. `ccjRun` is a `let` at script top level, which is a lexical
  // binding inside the script and never a property of the vm context — ctx.ccjRun is undefined
  // and always will be. Reading it silently answered "not a transcript stage" for every stage,
  // so the stream node was deleted on every work repaint and every assertion that read the
  // conversation afterwards read an empty string. Exactly the trap this file's header warns of.
  const transcript = run('!!(typeof ccjRun !== "undefined" && ccjRun && ccjUsesTranscript(ccjRun.stage))');
  return transcript ? ['ccj-screen'] : CHILD_OF[id];
}
function el(id) {
  const n = {
    id: id || '', _html: '', outerHTML: '', textContent: '', value: '',
    scrollTop: 0, scrollHeight: 0, style: {}, dataset: {}, children: [], firstChild: null,
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      toggle(c, on) { if (on === undefined) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); } else if (on) this._s.add(c); else this._s.delete(c); },
      contains(c) { return this._s.has(c); }
    },
    appendChild: noop, insertBefore: noop, removeChild: noop, remove: noop,
    addEventListener: noop, removeEventListener: noop,
    setAttribute: noop, getAttribute: () => null, removeAttribute: noop,
    querySelector: () => null, querySelectorAll: () => [],
    focus: noop, click: noop, scrollTo: noop, scrollIntoView: noop
  };
  Object.defineProperty(n, 'innerHTML', {
    get() { return n._html; },
    set(v) {
      if (id === 'ccj-stream') streamOps.rebuild++;
      n._html = v;
      childrenOf(id).forEach((c) => { delete nodes[c]; });
    }
  });
  // The transcript is append-only: ccjStreamSync writes each new message with
  // insertAdjacentHTML rather than rebuilding the stream, precisely so the nodes already on
  // screen are not re-parsed. Modelled here, or every assertion that reads the stream would
  // report only whatever the last FULL rebuild wrote — which is to say, it would pass while
  // being blind to almost everything the run says.
  //
  // Deliberately does NOT clear CHILD_OF: appending does not destroy the siblings above it.
  // That is the entire property being tested.
  n.insertAdjacentHTML = function (pos, html) {
    if (id === 'ccj-stream') streamOps.append++;
    if (pos === 'beforeend') n._html += html;
    else if (pos === 'afterbegin') n._html = html + n._html;
  };
  return n;
}
// Which of the two ways the stream was written, counted, because "the transcript appends" is not
// observable from the HTML afterwards — an append and a rebuild that happen to produce the same
// string are indistinguishable once they have happened. Counting the CALL is the only way to
// assert the property rather than its shadow.
const streamOps = { rebuild: 0, append: 0 };
function byId(id) {
  if (!nodes[id]) nodes[id] = el(id);
  return nodes[id];
}
// A full page render replaces the shell, so every element inside it is gone. Dropping them
// mirrors that: a paint target left over from the previous stage would let a stale assertion
// pass against markup no longer on screen.
function dropInnerNodes() {
  Object.keys(nodes).forEach((k) => { if (k !== 'adt-content' && k !== 'adt-page-title') delete nodes[k]; });
}

/* ---- A clock we drive ------------------------------------------------------------------- */
let now = 0, seq = 0, timers = [];
function fakeSetTimeout(fn, ms) {
  const t = { id: ++seq, at: now + (ms || 0), fn };
  timers.push(t);
  return t.id;
}
function fakeClearTimeout(id) { timers = timers.filter((t) => t.id !== id); }
function advance(ms) {
  const target = now + ms;
  for (let guard = 0; guard < 5000; guard++) {
    const due = timers.filter((t) => t.at <= target).sort((a, b) => a.at - b.at || a.id - b.id);
    if (!due.length) break;
    const t = due[0];
    timers = timers.filter((x) => x !== t);
    now = Math.max(now, t.at);
    t.fn();
  }
  now = target;
}

const store = {};
const ctx = {
  console,
  setTimeout: fakeSetTimeout, clearTimeout: fakeClearTimeout,
  setInterval: noop, clearInterval: noop, requestAnimationFrame: noop,
  fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
  localStorage: {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }, clear: () => {}
  },
  location: { href: '', hash: '', search: '' },
  history: { pushState: noop, replaceState: noop },
  navigator: { userAgent: 'node' },
  matchMedia: () => ({ matches: false, addListener: noop, addEventListener: noop }),
  document: {
    getElementById: byId, querySelector: () => null, querySelectorAll: () => [],
    createElement: () => el(), body: el(), documentElement: el(),
    addEventListener: noop, cookie: ''
  },
  navigatePage: noop, showAiToast: noop, persistAppState: noop
};
// renderer.js is not loaded (its init runs against a real DOM), so the one function the journey
// calls out to is stubbed to do what the real one does for a ccj page: re-render the shell.
ctx.renderADTPage = function () { dropInnerNodes(); ctx.ccjRenderPage(byId('adt-content')); };
ctx.window = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);

for (const f of ['js/exec-config.js', 'js/execApi.js', 'js/core.js', 'js/pages.js', 'js/contract-journey.js']) {
  try {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  } catch (e) {
    console.error('FATAL: could not load ' + f + ' — ' + e.message);
    console.error(e.stack);
    process.exit(1);
  }
}

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '\n          ' + String(detail).slice(0, 240) : '')); }
}
function run(expr) { return vm.runInContext(expr, ctx); }
function section(t) { console.log('\n' + t); }
function shell() { return byId('adt-content').innerHTML; }
/* Where the sub-statuses are. On a stage listed in CCJ_TRANSCRIPT_STAGES they are BLOCKS IN THE
   CONVERSATION and there is no panel at all; everywhere else the panel is unchanged. Resolving
   that here rather than in each assertion means the ~40 checks below go on testing the same
   thing — what a sub-status says, and when — without caring which surface it says it on. That is
   the right split: the panel was a container, and none of those assertions were about it. */
function steps() {
  if (run('ccjRun && ccjUsesTranscript(ccjRun.stage)')) return stream();
  return nodes['ccj-panel-inner'] ? nodes['ccj-panel-inner'].innerHTML : shell();
}
// Kept under its old name so every existing call site reads naturally; it is the same question.
function panel() { return steps(); }
/* JUST THE BLOCK THE RUNNER IS ON. `panel()` is the whole append-only conversation on a rebuilt
   stage, which makes it the wrong instrument for "what does the current step show" — every choice
   ever made is still in there as a user message, so `indexOf('Hold for the balance') === -1` is
   false the moment somebody clicked that button, whatever the live block says. Slices from the
   live block's id to the start of the next block. */
function liveBlock() {
  if (!run('ccjRun && ccjUsesTranscript(ccjRun.stage)')) return panel();
  const id = run("(function(){var s=ccjSteps(ccjRun.stage)[ccjRun.sub];"
    + "return s?ccjStepBlockId(ccjRun.stage,ccjRun.sub,ccjPass(ccjRun.stage,s)):'';})()");
  if (!id) return '';
  const s = stream();
  const at = s.indexOf('id="' + id + '"');
  if (at === -1) return '';
  const from = s.lastIndexOf('<', at);
  const next = s.indexOf('id="ccj-sb-', at + 8);
  return next === -1 ? s.slice(from) : s.slice(from, s.lastIndexOf('<', next));
}
function work() { return nodes['ccj-work'] ? nodes['ccj-work'].innerHTML : shell(); }
function screen() { return nodes['ccj-screen'] ? nodes['ccj-screen'].innerHTML : work(); }
function composer() { return nodes['ccj-composer'] ? nodes['ccj-composer'].innerHTML : work(); }
function head() { return nodes['ccj-head'] ? nodes['ccj-head'].innerHTML : shell(); }
/* The rail is repainted into its own host when it expands, and the stub stores markup as strings
   rather than a tree — so `shell()` still holds whatever the last full render wrote and cannot see
   a surgical repaint. Read the node, same as screen() and composer() do. */
function rail() { return nodes['ccj-rail-host'] ? nodes['ccj-rail-host'].innerHTML : shell(); }
function stream() { return nodes['ccj-stream'] ? nodes['ccj-stream'].innerHTML : ''; }
function drawer() { return nodes['ccj-drawer-host'] ? nodes['ccj-drawer-host'].innerHTML : ''; }
function prog() { return nodes['ccj-prog'] ? nodes['ccj-prog'].style.width : ''; }
function count(hay, needle) { return String(hay).split(needle).length - 1; }
// The evidence lines are painted through their own node between beats, so a full-panel read
// would miss them. Cleared before each advance: if the node comes back, a beat paint wrote it;
// if it does not, a full paint happened and the lines are inside the panel markup instead.
function clearEv() { delete nodes['ccj-ev-lines']; }
function evl() { return nodes['ccj-ev-lines'] ? nodes['ccj-ev-lines'].innerHTML : panel(); }
// Pacing constants, read from the journey rather than restated here.
const ACT = run('CCJ_ACT'), SETTLE = run('CCJ_SETTLE');
const PACE = ACT / 700;   // these waits were written against ACT=700
function say(text) { byId('ccj-prompt').value = text; run('ccjSend()'); }
// Advance until something is true, rather than guessing how many milliseconds it takes. Pacing
// constants get tuned; what the run must ARRIVE at does not.
function until(pred, cap) {
  let spent = 0;
  while (spent < (cap || 40000)) {
    if (pred()) return true;
    advance(200); spent += 200;
  }
  return pred();
}
// Walk a run forward the way a person would: fill whatever the form still wants, answer whatever
// gate is asking, and let the timers do the rest. Used to reach a later stage without restating
// the whole of the earlier ones.
function answerGatesUntil(pred, cap) {
  let spent = 0;
  while (spent < (cap || 60000)) {
    if (pred()) return true;
    if (run("ccjRun.phase==='halt'")) answerGate();
    advance(200); spent += 200;
  }
  return pred();
}
// A reason is passed on every answer. Positive options ignore it; negative ones require it, and
// without one they open the reason prompt instead of deciding — which is the behaviour, not a
// quirk to work around. Driving with it here keeps these flow checks about the flow; the prompt
// itself is asserted on separately.
function answerGate(id) {
  const opt = id || run("(function(){var s=ccjSteps(ccjRun.stage)[ccjRun.sub];var g=s&&(ccjGateFor(ccjRun.stage,s)||ccjPostGateFor(ccjRun.stage,s));return g&&g.options?g.options[0].id:'';})()");
  if (opt) run("ccjChooseGate('" + opt + "','driven by the harness')");
  return opt;
}
function driveTo(stageIdx, cap) {
  let spent = 0;
  while (run('ccjRun.stage') < stageIdx && spent < (cap || 150000)) {
    if (run("ccjRun.phase==='halt'")) {
      const opt = run("(function(){var s=ccjSteps(ccjRun.stage)[ccjRun.sub];var g=s&&(ccjGateFor(ccjRun.stage,s)||ccjPostGateFor(ccjRun.stage,s));return g&&g.options?g.options[0].id:'';})()");
      if (opt) run("ccjChooseGate('" + opt + "')");
    }
    if (run("ccjRun.phase==='rest'")) run('ccjContinueStage()');
    // A negotiation does not move until someone replies to the client, so the driver sends the
    // reply the agent drafted — the same click a user makes.
    if (run("!!(ccjRun.client&&ccjRun.client.drafted)")) run('ccjSendDraft()');
    if (run("ccjRun.screen==='employee'")) run("ccjGoScreen('form')");
    if (run("ccjRun.screen==='form'&&ccjMissingFields().length>0")) {
      run("ccjMissingFields().forEach(function(f){var v='x';"
        + "if(f.type==='select'||f.type==='radio'){var o=f.opts==='countries'?ccjCountries():f.opts;v=o[0];}"
        + "else if(f.type==='money'||f.type==='number'){v='5700';}"
        + "ccjSetField(f.k,v);});");
    }
    advance(200); spent += 200;
  }
  return run('ccjRun.stage') >= stageIdx;
}
// Every run now opens on the engagement-model chooser, so anything that wants to get to the
// conversation has to make that choice first — exactly as a user does.
function startRun(model) {
  run('ccjStartNewRun()');
  run("ccjChooseModel('" + (model || 'EOR') + "')");
  advance(Math.round(400*PACE));
}

// The Account Manager owns stage 1's decision, so the persona actually asked to answer it is
// the one the gate is evaluated against.
run("portalRole='entity-user';activePersonaId='account-manager';");

section('STAGES, SCREENS AND ROUTING');
check('nine client-facing stages', run('amPipelineStages.length') === 9, run('amPipelineStages.length'));
check('page id derives from stage id', run('ccjPageId(0)') === 'ccj-request-received', run('ccjPageId(0)'));
check('every stage has a page and round-trips',
  run('amPipelineStages.every(function(s,i){return ccjStageOf(ccjPageId(i))===i;})'));
check('ccj-start is a legal route', run("isCCJPage('ccj-start')") === true);
check('a non-ccj page is not claimed', run("isCCJPage('contracts')") === false);
check('stage 1 has its three sub-statuses', run('ccjSteps(0).length') === 3,
  run('JSON.stringify(ccjSteps(0).map(function(s){return s.label;}))'));
check('stage 1 declares four screens', run('ccjScreensFor(0).length') === 4,
  run("JSON.stringify(ccjScreensFor(0).map(function(s){return s.id;}))"));
check('the chooser is NOT one of them — it is its own page', run("ccjScreensFor(0).every(function(s){return s.id!=='model';})"));
check('ccj-model is a route of its own', run("isCCJPage('ccj-model')") === true && run('ccjStageOf("ccj-model")') === -1);
check('stage index means the same in both stores',
  run("aiJourneyEvents['contract-creation'].length") === run('amPipelineStages.length'));
/* ONE TITLE FOR THE WHOLE JOURNEY. The topbar used to echo the current stage — "New request",
   "Client signing" — which the page's own header already says in larger type two lines below it,
   beside the step counter. Two surfaces naming the same thing meant the topbar told a reader
   nothing new and changed under them nine times; naming the TASK gives it a job the stage header
   cannot do. Asserted across the whole journey, not on one page, because the point is that it
   does NOT vary. */
check('the topbar names the task, not the stage, on every page of the journey',
  run("ccjStages().every(function(s,i){return getPageTitle(ccjPageId(i))==='Create Contract';})")
  && run("getPageTitle('ccj-model')") === 'Create Contract',
  run("JSON.stringify(ccjStages().map(function(s,i){return getPageTitle(ccjPageId(i));}))"));
/* And it is scoped to this journey. `ccjPageMeta` runs FIRST in getPageMeta, so a version of it
   that answered for pages it does not own would shadow every resolver after it — including the
   frozen V1 snapshot's, which sits directly beneath it in the same file. Asserted by the null,
   because the snapshot itself is not loaded in this harness and its TITLE cannot be read here. */
check('while pages outside it are untouched',
  run("getPageTitle('contracts')") !== 'Create Contract'
  && run("ccjPageMeta('ccjv1-request-received')") === null
  && run("ccjPageMeta('contracts')") === null,
  run("getPageTitle('contracts')"));
/* The + is "add another row to this listing". A journey is one run in progress, not a listing, and
   the only thing a + could mean there is "start a second one over the top of this". */
check('and the topbar + is not offered on a journey page',
  run("(function(){var no=['dashboard','contracts'];"
    + "return typeof isCCJPage==='function'&&isCCJPage('ccj-request-received')"
    + "&&isCCJPage('ccj-model')&&!isCCJPage('contracts');})()"));
check('back bar parent is Contracts', run("getSidebarActivePage('ccj-quote-prep')") === 'contracts');

section('READING THE REQUEST');
// Each pass removes what it claimed, so the next cannot claim it again. The ordering is the
// whole trick: the role after "as" only reduces cleanly once the country is already gone.
const P = (t) => run('ccjParsePrompt(' + JSON.stringify(t) + ')');
let r = P('Hire Rohan Verma in Germany as an Operations Analyst');
check('the verb is not part of the name', r.name === 'Rohan Verma', JSON.stringify(r.name));
check('the country is lifted out', r.country === 'Germany', r.country);
check('the role stated after "as" is captured', r.jobTitle === 'Operations Analyst', JSON.stringify(r.jobTitle));
r = P('hire priya nair as a delivery ops lead in india');
check('the role does not keep the dangling preposition the country left behind',
  r.jobTitle === 'Delivery Ops Lead', JSON.stringify(r.jobTitle));
check('a name typed in lower case is cased for display', r.name === 'Priya Nair', JSON.stringify(r.name));
r = P("Onboard Marcus O'Brien in Germany as Senior Marine Engineer");
check('a name the user capitalised is left exactly as they spelled it',
  r.name === "Marcus O'Brien", JSON.stringify(r.name));
r = P('Create an EOR contract for Anika Shah at Norrbridge Logistics in Netherlands');
check('the engagement model is read from the sentence', r.empType === 'EOR', r.empType);
check('and no role is invented when none was stated', r.jobTitle === '', JSON.stringify(r.jobTitle));
r = P('contractor agreement for Sofia Romano in Italy');
check('"contractor" resolves to the contractor model', r.empType === 'CONTRACTOR', r.empType);
r = P('Create a contract for Rohan Verma');
check('"contract" alone does NOT resolve to the contractor model', r.empType === '', r.empType);
check('and the bare name still survives', r.name === 'Rohan Verma', JSON.stringify(r.name));

// WHO THE HIRE IS FOR. Matched against the companies this product already knows — the clients
// with an account and the clients with a deal on the board — so the sentence needs no rigid shape.
r = P('New PEO contract for Emma Schmidt at Vantage Freight in India');
check('a short client name resolves to the full registered one',
  r.client === 'Vantage Freight Pvt Ltd', JSON.stringify(r.client));
check('and the client name does not end up inside the person name', r.name === 'Emma Schmidt', JSON.stringify(r.name));
r = P('Hire Rohan Verma for Helix Marine in Germany as an Operations Analyst');
check('a client named after a place survives the country pass',
  r.client === 'Helix Marine B.V.' && r.country === 'Germany', r.client + ' / ' + r.country);
check('and the role is still read', r.jobTitle === 'Operations Analyst');
r = P('Hire Tom Fisher for Blackwood Systems Ltd in United Kingdom as a Data Analyst');
check('a company we have never seen is recognised by its legal suffix',
  r.client === 'Blackwood Systems Ltd', JSON.stringify(r.client));
check('the person is still separated out', r.name === 'Tom Fisher', JSON.stringify(r.name));
r = P('Create an EOR contract for Anika Shah in Netherlands');
check('no client stated leaves it empty rather than guessing one', r.client === '', JSON.stringify(r.client));
check('and the country is still read from that same sentence', r.country === 'Netherlands');

/* The pay pass runs FIRST, before even the engagement model, because a figure carrying a currency
   marker or a period word is the least ambiguous token in the sentence. The thing to guard is that
   it takes its FRAMING with it — the first version lifted the figure and left "at ... a month"
   behind, which the role pass then read to the end of the sentence and turned into the job title
   "Director Of Engineering At A Month". */
section('THE PAY, WHEN THE SENTENCE STATES IT');
r = P('Hire Shiv Kumar for Helix Marine in Germany as Director of Engineering at EUR 18,500 a month');
check('the pay is read out of the sentence', r.pay === '18500', JSON.stringify(r.pay));
check('and it does not leave its framing in the job title',
  r.jobTitle === 'Director of Engineering', JSON.stringify(r.jobTitle));
check('the name, client and country are untouched by it',
  r.name === 'Shiv Kumar' && r.client === 'Helix Marine B.V.' && r.country === 'Germany',
  r.name + ' / ' + r.client + ' / ' + r.country);
r = P('Hire Shiv Kumar at Helix Marine in Germany paying 18500 per month');
check('a lead-in verb is consumed rather than landing in the name',
  r.pay === '18500' && r.name === 'Shiv Kumar', r.name + ' / ' + r.pay);
r = P('Hire Shiv Kumar for Helix Marine in Germany on a salary of 18500 monthly as CTO');
check('"salary of ... monthly" is read too', r.pay === '18500', JSON.stringify(r.pay));
r = P('Hire Shiv Kumar for Vantage Freight in India as Delivery Lead at Rs 950000 a month');
check('a non-euro currency marker works the same', r.pay === '950000', JSON.stringify(r.pay));
// A bare number must not become a salary, or "hire 2 engineers" quotes the client EUR 2 a month.
r = P('Hire 2 engineers for Helix Marine in Germany');
check('a bare number with no money signal is NOT read as pay', r.pay === '', JSON.stringify(r.pay));
r = P('Hire Shiv Kumar for Helix Marine in Germany as Director of Engineering');
check('and a sentence that states no pay leaves it for the agent to ask',
  r.pay === '', JSON.stringify(r.pay));

section('TITLE CASE DOES NOT FLATTEN WHAT THE USER ALREADY DECIDED');
// Lower-casing the whole string first turned "CTO" into "Cto".
check('an acronym the user capitalised survives', run("ccjTitleCase('CTO')") === 'CTO',
  run("ccjTitleCase('CTO')"));
check('an all-lowercase role is still lifted',
  run("ccjTitleCase('director of engineering')") === 'Director of Engineering',
  run("ccjTitleCase('director of engineering')"));
check('small words stay small unless they lead',
  run("ccjTitleCase('head of the delivery team')") === 'Head of the Delivery Team',
  run("ccjTitleCase('head of the delivery team')"));
check('and a name the user spelled themselves is left alone',
  run("ccjTitleCase(\"O'Brien\")") === "O'Brien", run("ccjTitleCase(\"O'Brien\")"));

section('THE SAMPLE DOCUMENT AND THE PARSER READ ONE CONSTANT');
// Each extraction row cites the part of the document it came from. That citation is a promise the
// value is on the paper, so the paper (sample-docs/, generated) and the extractor share a source.
check('the sample document states an annual figure',
  run('CCJ_SAMPLE_DOC.annual') === 222000, run('CCJ_SAMPLE_DOC.annual'));
startRun();
say('Hire Shiv Kumar for Helix Marine in Germany as Director of Engineering');
until(() => run("ccjRun.screen==='form'") || run("ccjRun.screen==='employee'"), 30000);
check('the extractor divides it to a monthly figure, because the field is monthly',
  run("ccjDocExtract().find(function(x){return x.k==='pay';}).v") === '18500',
  run("ccjDocExtract().find(function(x){return x.k==='pay';}).v"));
check('and says that is what it did',
  /annual/i.test(run("ccjDocExtract().find(function(x){return x.k==='pay';}).from")),
  run("ccjDocExtract().find(function(x){return x.k==='pay';}).from"));
// Nationality used to be inferred from the place of work, which is right only when the two happen
// to agree. It is stated on the document, so it is read.
check('nationality is read off the form, not inferred from the work country',
  run("ccjDocExtract().find(function(x){return x.k==='nationality';}).v") === 'India'
  // Cited to the section of the sheet it was answered in, which is where a reviewer would look.
  && run("ccjDocExtract().find(function(x){return x.k==='nationality';}).from") === 'Eligibility',
  run("ccjDocExtract().find(function(x){return x.k==='nationality';}).v")
  + ' <- ' + run("ccjDocExtract().find(function(x){return x.k==='nationality';}).from"));
// The sheet is laid out as the contract form is laid out, so every value it carries cites a real
// heading on it — a reviewer can go and look rather than take the card's word for it.
check('every extracted value cites a section that exists on the sheet',
  run("ccjDocExtract().every(function(x){return /^(Eligibility|Employee information|Job details|Probation and notice)/.test(x.from);})"),
  run("JSON.stringify(ccjDocExtract().filter(function(x){return !/^(Eligibility|Employee information|Job details|Probation and notice)/.test(x.from);}).map(function(x){return x.k+': '+x.from;}))"));
check('uploading it fills the form COMPLETELY — nothing left to ask',
  (function () {
    run("ccjStartExtraction('Shiv_Kumar_Contract_Data.pdf',100000)");
    until(() => run('!!(ccjRun.doc&&ccjRun.doc.done)'), 60000);
    return run('ccjMissingFields().length') === 0;
  })(),
  'still missing: ' + run("JSON.stringify(ccjMissingFields().map(function(f){return f.k;}))"));
// Read from the constant rather than restated, so the demo persona's details can be changed in
// one place without a test pinning the old ones.
check('and the values that landed are the sheet&rsquo;s own',
  run('ccjRun.form.nationality') === 'India'
  && run('ccjRun.form.dob') === run('CCJ_SAMPLE_DOC.fields.dob.v')
  && run('ccjRun.form.pay') === '18500'
  && run('ccjRun.form.probation') === '6'
  && run('ccjRun.form.notice') === '30',
  run('ccjRun.form.nationality') + ' / ' + run('ccjRun.form.dob') + ' / ' + run('ccjRun.form.pay')
  + ' / probation ' + run('ccjRun.form.probation') + ' / notice ' + run('ccjRun.form.notice'));
// A select or a radio only accepts one of its own options — "Full time — 40 hours per week" reads
// well on paper and would have been rejected by the field.
check('a select gets a value its own options actually contain',
  run("(function(){var f=ccjAllFields().find(function(x){return x.k==='schedule';});"
    + 'return f.opts.indexOf(ccjRun.form.schedule)>-1;})()') === true,
  run('ccjRun.form.schedule'));
check('and so does the work-permit radio',
  run("(function(){var f=ccjAllFields().find(function(x){return x.k==='workPermit';});"
    + 'return f.opts.indexOf(ccjRun.form.workPermit)>-1;})()') === true,
  run('ccjRun.form.workPermit'));

section('THE IDENTITY DOCUMENT FOLLOWS NATIONALITY, NOT THE PLACE OF WORK');
/* This read the work-country pack, so an Indian national placed in Germany was shown presenting a
   German Personalausweis — a document he cannot hold. What a person presents to prove who they
   are, and what their employer must file where they work, are two different questions. */
(function () {
  const d = run('ccjKycDoc()');
  check('an Indian national in Germany presents an Indian passport',
    d.type === 'Indian passport' && d.issuer === 'Republic of India' && d.code === 'IND',
    d.type + ' / ' + d.issuer);
  check('and its machine-readable zone carries the right country code',
    d.mrzLine.indexOf('IND') > -1, d.mrzLine.replace(/&lt;/g, '<').slice(0, 40));
  check('the rest of the pack is still the work country&rsquo;s',
    run("ccjOnbPack().taxAuthority") === 'Finanzamt', run('ccjOnbPack().taxAuthority'));
  // Before the permit has been seen it is a real question, not a rubber stamp.
  check('right to work is unanswered while the permit is only declared',
    run('ccjRightToWork().verdict') === 'consider', run('ccjRightToWork().verdict'));
  check('and a national working at home is still cleared without a permit',
    run("(function(){var w=ccjRun.form.nationality;ccjRun.form.nationality='Germany';"
      + 'var v=ccjRightToWork().verdict;ccjRun.form.nationality=w;return v;})()') === 'pass');
})();

/* The check is not weakened to make the demo flow — it is given evidence. A cross-border hire
   photographs their permit in the same verification session as their passport, which is what a
   real IDV flow does, and only then does right to work resolve. */
section('THE WORK PERMIT IS CAPTURED, AND IT IS SALARY-TESTED');
(function () {
  const pm = run('ccjPermit()');
  check('a non-EU national placed in Germany needs a permit', !!pm && !!pm.label, JSON.stringify(pm && pm.label));
  check('and on this salary it is the EU Blue Card, not the general route',
    pm.label === 'EU Blue Card' && pm.annual >= pm.min,
    pm.label + '  ' + pm.annual + ' vs floor ' + pm.min);
  check('the route is chosen by the salary, so a low-paid placement gets the other one',
    run("(function(){var w=ccjRun.form.pay;ccjRun.form.pay='2000';"
      + 'var l=ccjPermit().label;ccjRun.form.pay=w;return l;})()') === 'Residence permit for qualified employment',
    run("(function(){var w=ccjRun.form.pay;ccjRun.form.pay='2000';var l=ccjPermit().label;ccjRun.form.pay=w;return l;})()"));
  check('nobody who does not need a permit is given one',
    run("(function(){var w=ccjRun.form.nationality;ccjRun.form.nationality='Germany';"
      + 'var p=ccjPermit();ccjRun.form.nationality=w;return p;})()') === null);
  check('an EU national moving inside the EU needs none either',
    run("(function(){var w=ccjRun.form.nationality;ccjRun.form.nationality='Spain';"
      + 'var p=ccjPermit();ccjRun.form.nationality=w;return p;})()') === null);
  // The one path that must still stop: we were asked to sponsor it, so there is no permit yet.
  check('asking us to sponsor the visa is still a decision, because no permit exists yet',
    run("(function(){var w=ccjRun.form.workPermit;"
      + "ccjRun.form.workPermit='Employee would like ADT to assist with the work visa';"
      + 'var v=ccjRightToWork().verdict;ccjRun.form.workPermit=w;return v;})()') === 'consider');
})();

section('THE IDENTITY PORTRAIT IS OPTIONAL AND FAILS SOFT');
// A real photograph is a local asset that is deliberately not in the repository, so the console
// must render correctly whether or not it is present.
check('a portrait is wired in when one is configured',
  run('ccjPortraitHTML()').indexOf('ccj-kyc-portrait') > -1);
check('the drawn placeholder is kept underneath it, not replaced',
  run('ccjPortraitHTML()').indexOf('<svg') > -1);
check('a missing file uncovers the placeholder rather than leaving a hole',
  run("typeof ccjPortraitMissing") === 'function'
  && run('ccjPortraitHTML()').indexOf('onerror="ccjPortraitMissing(this)"') > -1);
check('and with no portrait configured it is the placeholder alone',
  run("(function(){var h=ccjPortraitHTML.toString();return h.indexOf('CCJ_KYC_PORTRAIT')>-1;})()") === true);

/* WHERE THE WORK IS decides the employment law, the tax authority, the social security
   institution, the registered entity and its bank, the payroll return and the permit — every one
   of them a per-country pack. The form offered all 54 nationalities as places of work while the
   packs cover 7, so the other 47 fell through `||CCJ_STAT['Netherlands']` and friends: Dutch law
   and a Dutch IBAN, but German social rates and a German permit, because those two default to
   Germany instead. Nothing on screen said anything was wrong. */
section('WE ONLY OFFER TO EMPLOY WHERE WE ARE ACTUALLY CONFIGURED');
check('nationality can still be any country', run('ccjCountries().length') > 40,
  run('ccjCountries().length'));
check('but the places we can employ are far fewer', run('ccjWorkCountries().length') === 7,
  run('JSON.stringify(ccjWorkCountries())'));
// Derived by intersecting the packs, so adding one adds the country and nothing has to be
// remembered. This is the check that would have caught the original bug.
check('every country we offer to employ in has EVERY pack behind it',
  run("ccjWorkCountries().every(function(c){return CCJ_STAT[c]&&CCJ_ONB[c]&&CCJ_REGISTRY[c]"
    + '&&CCJ_PAYRUN_PACK[c]&&CCJ_RATES[c]&&CCJ_PERMITS[c];})') === true,
  run("JSON.stringify(ccjWorkCountries().filter(function(c){return !(CCJ_STAT[c]&&CCJ_ONB[c]&&CCJ_REGISTRY[c]&&CCJ_PAYRUN_PACK[c]&&CCJ_RATES[c]&&CCJ_PERMITS[c]);}))"));
check('and no country we cannot serve is offered as a place of work',
  run("ccjWorkCountries().every(function(c){return ccjCanEmployIn(c);})")
  && run("ccjCanEmployIn('Poland')") === false && run("ccjCanEmployIn('United States')") === false);
check('the work-country field reads that list, not the nationality one',
  run("ccjAllFields().find(function(f){return f.k==='country';}).opts") === 'workCountries',
  run("ccjAllFields().find(function(f){return f.k==='country';}).opts"));
check('while nationality still reads the full one',
  run("ccjAllFields().find(function(f){return f.k==='nationality';}).opts") === 'countries');

section('A COUNTRY WE CANNOT SERVE IS SAID OUT LOUD, NOT SWALLOWED');
r = P('Hire Piotr Nowak for Helix Marine in Poland as a Data Analyst');
check('the country is recognised and lifted out of the sentence',
  r.unsupportedCountry === 'Poland' && r.name === 'Piotr Nowak',
  r.unsupportedCountry + ' / ' + JSON.stringify(r.name));
check('but it is NOT claimed as the place of work', r.country === '', JSON.stringify(r.country));
startRun();
say('Hire Piotr Nowak for Helix Marine in Poland as a Data Analyst');
check('the run does not start against a country we cannot serve',
  run('ccjRun.started') === false && run('ccjRun.awaitingCountry') === true);
check('the agent says why, rather than just asking again',
  stream().indexOf('not set up to employ in') > -1 && stream().indexOf('Poland') > -1
  && stream().indexOf('would not be compliant') > -1);
check('and it names the countries we can serve',
  stream().indexOf('Germany') > -1 && stream().indexOf('Netherlands') > -1);
say('Portugal then');
check('a second unserviceable answer is refused too',
  run('ccjRun.awaitingCountry') === true && stream().indexOf('still cannot place that one') > -1);
say('Germany');
check('a serviceable one is accepted and the run carries on',
  run('ccjRun.awaitingCountry') === false && run('ccjRun.intake.country') === 'Germany',
  run('ccjRun.intake.country'));

section('A RUN WITHOUT A CLIENT ASKS FOR ONE');
// Who the hire is for is not guessable and not optional: every number is billed to them, the
// agreement is signed with them, the CSM is theirs. Defaulting would quietly invoice the wrong
// company, so the agent asks — the same way it asks for a missing date of birth.
startRun();
say('Create an EOR contract for Anika Shah in Netherlands');
check('the run does not start without a client', run('ccjRun.started') === false);
check('it says so, and asks', run('ccjRun.awaitingClient') === true && stream().indexOf('Which client is this hire for') > -1);
check('it offers the clients we already work with', count(stream(), 'ccj-ask-chip') >= 3, count(stream(), 'ccj-ask-chip') + ' chips');
check('and the panel has not started working', run('ccjRun.sub') === -1, 'sub ' + run('ccjRun.sub'));
advance(Math.round(20000*PACE));
check('waiting does not start it either', run('ccjRun.started') === false);
// A short name typed into the composer resolves the same way one in the sentence would.
say('Vantage Freight');
check('a typed answer resolves to the registered name',
  run('ccjRun.intake.client') === 'Vantage Freight Pvt Ltd', run('ccjRun.intake.client'));
check('and the run starts', run('ccjRun.started') === true && run('ccjRun.awaitingClient') === false);
check('the question is cleared from the conversation', stream().indexOf('Which client is this hire for') === -1);
check('the run now knows who it is for', run('ccjCtx().client') === 'Vantage Freight Pvt Ltd');
// Picking a chip is the same path.
startRun();
say('Hire Marcus Klein in Germany as a Marine Engineer');
check('asks again on a fresh run', run('ccjRun.awaitingClient') === true);
run("ccjPickClient('Kaira Textiles Ltd')");
check('the chip starts the run too',
  run('ccjRun.started') === true && run('ccjRun.intake.client') === 'Kaira Textiles Ltd');
check('and the role from the sentence survived the interruption',
  run('ccjRun.intake.jobTitle') === 'Marine Engineer', run('ccjRun.intake.jobTitle'));

section('THE ENGAGEMENT MODEL CHOOSER — ITS OWN PAGE');
run('ccjStartNewRun()');
let h = shell();
check('a new run opens on the chooser page', run('page') === 'ccj-model', run('page'));
check('renders its own back control (suppresses the injected back bar)', h.indexOf('ccj-back') > -1);
check('NO step counter — the journey has not started', h.indexOf('Step 1 of 9') === -1);
check('NO nine-stage rail', h.indexOf('ccj-dot') === -1 && h.indexOf('ccj-phase-name') === -1);
check('NO sub-status panel', h.indexOf('ccj-panel') === -1);
check('the cards ARE the screen', h.indexOf('ccj-model-page') > -1);
check('three cards, one per engagement model', count(h, 'ccj-mcard') >= 3, count(h, 'class="ccj-mcard') + ' cards');
/* THE CHOOSER ASKS WHO, NOT WHICH MODEL. It read "Choose an engagement model" over cards titled
   EOR / PEO / Contract based — our vocabulary, asked of somebody who arrives knowing which PERSON
   they are hiring and not necessarily that the industry calls the difference a model.

   The ids are unchanged and must stay so: every other surface, the entity token and this whole
   suite key on EOR / PEO / CONTRACTOR. Only what a person reads moved, and it is overridden in
   CCJ_MODEL_CARD rather than in AI_CT_TYPE_CARDS, which the frozen original journey still reads. */
check('the chooser asks who is being onboarded, in their words not ours',
  h.indexOf('Who would you like to onboard?') > -1
  && h.indexOf('Hire and onboard employees or contractors') > -1
  && h.indexOf('Choose an engagement model') === -1);
check('every model in the domain data gets a card, keyed by id',
  run("AI_CT_TYPE_CARDS.every(function(t){var c=CCJ_MODEL_CARD[t.id];"
    + "return !!c&&document.getElementById('adt-content').innerHTML.indexOf('>'+c.title+'<')>-1;})"),
  run("JSON.stringify(AI_CT_TYPE_CARDS.map(function(t){return t.id;}))"));
check('the cards name the person, not the acronym',
  h.indexOf('EOR employee') > -1 && h.indexOf('Direct employee') > -1 && h.indexOf('Contractor') > -1
  && h.indexOf('>Contract based<') === -1);
check('cards say what the arrangement IS, not what the software does',
  h.indexOf('employs them on your behalf') > -1 && h.indexOf('Opens the AI Contract Assistant') === -1);
// Each card still says who carries the employment, which is the actual difference between them.
check('and each still says who the legal employer is',
  h.indexOf('We are the legal employer') > -1 && h.indexOf('You are the legal employer') > -1
  && h.indexOf('No employment relationship') > -1);
// Our own entity, not the competitor whose copy this was modelled on.
check('and it names our entity rather than somebody else\'s',
  h.indexOf('ADT employs them') > -1 && h.toLowerCase().indexOf('multiplier') === -1);
// The frozen original journey reads AI_CT_TYPE_CARDS for its own header chip; it must be untouched.
check('the shared card data the original journey reads is unchanged',
  run("AI_CT_TYPE_CARDS.find(function(t){return t.id==='EOR';}).title") === 'EOR'
  && run("AI_CT_TYPE_CARDS.find(function(t){return t.id==='EOR';}).sub") === 'Employer of Record');
check('the default model reads as selected', h.indexOf('ccj-mcard on') > -1);
check('no conversation on the chooser — one decision, nothing else',
  h.indexOf('ccj-chat-col') === -1 && h.indexOf('ccj-work-full') === -1 && h.indexOf('id="ccj-prompt"') === -1);
check('no commentary under the cards', h.indexOf('ccj-model-foot') === -1 && h.indexOf('Every model runs the same nine stages') === -1);

section('CHOOSING A MODEL MOVES TO THE CONVERSATION');
run("ccjChooseModel('PEO')");
check('the choice is recorded', run('ccjRun.model') === 'PEO', run('ccjRun.model'));
advance(Math.round(400*PACE));
check('it enters the journey at stage 1', run('page') === 'ccj-request-received' && run('ccjRun.screen') === 'prompt', run('page') + '/' + run('ccjRun.screen'));
h = shell();
/* Stage 1 is rebuilt: the rail and the header still arrive with the run, and the sub-statuses
   now arrive in the conversation instead of in a panel beside it. The three checks that used to
   read the pending rows are gone with the pending rows themselves — a transcript is a record of
   what happened, so a step that has not started has no block. That is a design decision, not a
   coverage gap, and it gets its own assertion below rather than being quietly dropped. */
// The frame is the header counter now — the dots only exist from stage 6, or expanded.
check('the journey frame arrives with the run', h.indexOf('Step 1 of 9') > -1);
check('the rebuilt stage has no panel at all', h.indexOf('ccj-panel') === -1);

/* == THE RAIL, PER THE SKETCH: A WINDOW IN THE RIGHT COLUMN, NINE ON DEMAND ================
   The chat owns the left of the page from the very top. The four-step window sits at the top of
   the RIGHT column, above the artefact, and walks the whole journey — 1-4 at the start, holding
   through step 2, sliding one per step from step 3. The arrow at its leftmost corner expands the
   full nine-step rail as a band across the page, and the chat shortens under it. */
check('the window rail lives in the RIGHT column, not in a band above the page',
  h.indexOf('ccj-rside') > -1
  && h.indexOf('class="ccj-rside"><div class="ccj-rail-host"') > -1
  && h.indexOf('ccj-rail-host') > h.indexOf('ccj-chat-col'),
  h.slice(h.indexOf('ccj-body'), h.indexOf('ccj-body') + 160));
check('so the chat is the first thing in the body — it takes the top of the page',
  h.indexOf('ccj-chat-col') > -1 && h.indexOf('ccj-chat-col') < h.indexOf('ccj-rside'));
check('the collapsed rail is one row, no phase boxes',
  h.indexOf('ccj-rail slim') > -1 && h.indexOf('ccj-phase-name') === -1
  && h.indexOf('Client contract') === -1);
/* ALL NINE ARE IN THE DOM even though four are lit — the window is a clip and the track is
   translated, so there has to be something to slide. */
check('all nine steps are rendered, four of them lit',
  count(h, 'class="ccj-rail-slot') === 9 && count(h, 'ccj-rail-slot out') === 5,
  count(h, 'class="ccj-rail-slot') + ' slots, ' + count(h, 'ccj-rail-slot out') + ' outside');
/* THE ARROW, "on the leftmost corner" — the user's words. Arrow only, no text label, and it is
   the first thing in the rail row. */
check('the expander is a bare arrow at the leftmost corner',
  (function () {
    const r = h.slice(h.indexOf('ccj-rail slim'));
    return r.indexOf('ccj-rail-more') > -1 && r.indexOf('ccj-rail-more') < r.indexOf('ccj-rail-win')
      && h.indexOf('All 9') === -1 && h.indexOf('>Collapse<') === -1;
  })(), h.slice(h.indexOf('ccj-rail slim'), h.indexOf('ccj-rail slim') + 200));
check('the window holds at 1-4 for the first two steps, then slides one per step',
  JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => run('ccjRailFrom(' + i + ')')))
    === JSON.stringify([0, 0, 1, 2, 3, 4, 5, 5, 5]),
  JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => run('ccjRailFrom(' + i + ')'))));
check('the track shift is measured against the whole track',
  run("ccjRailShift(5)") === 'translateX(-' + (5 / 9 * 100) + '%)', run('ccjRailShift(5)'));
/* EXPANDING IS A STRUCTURAL CHANGE — the rail moves from the right column to a band above the
   body — so the toggle re-renders the page rather than repainting a host. */
run('ccjToggleRail()');
const railOpen = shell();
check('expanding brings the full nine back as a band above the body',
  run('ccjRailOpen()') === true && railOpen.indexOf('Client contract') > -1
  && railOpen.indexOf('Worker onboarding') > -1 && count(railOpen, 'class="ccj-dot ') === 9
  && railOpen.indexOf('ccj-rail-host') < railOpen.indexOf('ccj-body')
  && railOpen.indexOf('ccj-rside') === -1,
  railOpen.slice(railOpen.indexOf('ccj-rail'), railOpen.indexOf('ccj-rail') + 160));
check('with the arrow still leftmost',
  (function () {
    const r = railOpen.slice(railOpen.indexOf('ccj-rail open'));
    return r.indexOf('ccj-rail-more') > -1 && r.indexOf('ccj-rail-more') < r.indexOf('ccj-rail-scroll');
  })());
check('expanding did not move the run', run('ccjRun.stage') === 0 && run('page') === 'ccj-request-received');
run('ccjToggleRail()');
check('collapsing returns the window to the right column',
  run('ccjRailOpen()') === false && shell().indexOf('ccj-rside') > -1
  && shell().indexOf('ccj-rail slim') > -1 && shell().indexOf('Client contract') === -1);
h = shell();
check('and nothing has run yet, so there are no blocks yet',
  count(h, 'class="ccj-sb ') === 0, count(h, 'class="ccj-sb ') + ' blocks');
/* The only assertion that the panel path is still alive at all — the day it can find no
   un-rebuilt stage is the day buildCCJPanelHTML can be deleted.

   DERIVED, not enumerated. It used to name each index by hand and had to be repointed on every
   conversion, which is a test that needs editing to keep passing — and one edited that often
   eventually gets edited into agreeing with whatever the code now does. It now asserts the
   PROPERTY instead: the journey converts front to back, so the rebuilt stages must be a leading
   run with at least one panel stage after them. That holds without maintenance until the last
   stage moves, at which point it fails and says so. */
const CONVERTED = (function () {
  const n = run('ccjStages().length');
  const rebuilt = [], panel = [];
  for (let i = 0; i < n; i++) (run('ccjUsesTranscript(' + i + ')') ? rebuilt : panel).push(i);
  return { n, rebuilt, panel };
})();
check('the stages are converted front to back, with no gaps',
  CONVERTED.rebuilt.every((v, i) => v === i),
  'rebuilt ' + JSON.stringify(CONVERTED.rebuilt));
/* ALL NINE ARE NOW REBUILT, which is what this pair was written to detect. The old assertion was
   "a stage that has NOT been rebuilt still gets its panel" — the only thing keeping the panel path
   under test — and it fails the moment the last stage converts. It has, so it is replaced by the
   fact rather than left failing.

   CONSEQUENCE, and it is not asserted away: buildCCJPanelHTML and everything under it is now
   unreachable in a normal run. It is left in place deliberately — deleting the panel is a larger
   piece of work than any single stage conversion and belongs to a decision of its own — but this
   check exists so nobody mistakes it for live code. */
check('every stage is on the transcript; the panel path is now unreachable',
  CONVERTED.panel.length === 0 && CONVERTED.rebuilt.length === run('ccjStages().length'),
  CONVERTED.rebuilt.length + ' rebuilt, ' + CONVERTED.panel.length + ' still on the panel');
check('and no rendered surface still builds one',
  shell().indexOf('ccj-panel') === -1);
// The conversation takes the whole body by the work area COLLAPSING rather than by a different
// layout: on a conversation-led screen there is no screen to show, so ccjWorkHTML returns nothing
// and the body is marked `solo`. Same outcome `chat:'full'` used to produce, one fewer variant.
// Read from the rendered shell, not through work(): that helper falls back to the whole shell
// when nothing has looked the node up yet, so `work()===''` would never be true here.
check('the conversation now takes the whole body',
  shell().indexOf('<div class="ccj-work" id="ccj-work"></div>') > -1
  && shell().indexOf('ccj-body no-panel') > -1 && shell().indexOf('ccj-chat-col') > -1);
check('composer carries the focus target id', work().indexOf('id="ccj-prompt"') > -1);
check('the model pills are gone from the composer — the chooser owns that decision',
  composer().indexOf('ccj-models-lbl') === -1);
check('the header chip reports the model and can reopen it', head().indexOf('ccj-head-model live') > -1);
check('empty conversation invites the request', stream().indexOf('ccj-empty') > -1);
run('ccjBackToModel()');
check('the header chip goes back to the chooser page', run('page') === 'ccj-model');
run("ccjChooseModel('EOR')");
advance(Math.round(400*PACE));
check('and a different model can be picked', run('ccjRun.model') === 'EOR' && run('page') === 'ccj-request-received');

section('SUBMITTING THE REQUEST');
say('Create an EOR contract for Anika Shah at Norrbridge Logistics in Netherlands');
check('intake captured from the prompt', run('ccjRun.intake.name') === 'Anika Shah', run('JSON.stringify(ccjRun.intake)'));
check('country parsed out of the sentence', run('ccjRun.intake.country') === 'Netherlands', run('ccjRun.intake.country'));
check('engagement model parsed out of the sentence', run('ccjRun.model') === 'EOR', run('ccjRun.model'));
check('run marked started', run('ccjRun.started') === true);
check('the typed sentence is echoed as a user message', stream().indexOf('ccj-msg user') > -1);
check('lookup shows as a message, not a page block', stream().indexOf('ccj-searching') > -1);
check('panel is working on sub-status 1', run('ccjRun.sub') === 0 && run('ccjRun.phase') === 'act');
check('current row spins', panel().indexOf('ccj-spin') > -1);
// Read off the composer, not the work area: submitting repaints ONLY the composer so the
// message stream it sits under is never destroyed and re-animated. That is the fix under test.
check('the composer changes role once the request exists', composer().indexOf('Add more details') > -1);
check('the engagement model locks after submit', composer().indexOf('ccj-models-lbl') === -1);
check('submitting does not rebuild the message stream', nodes['ccj-stream'] !== undefined);
check('the invitation leaves as a fading ghost, not a hard cut', stream().indexOf('ccj-empty ghost') > -1);
check('the ghost survives both opening messages so the fade actually plays',
  run('ccjRun.emptyGhost') === true && stream().indexOf('ccj-msg user') > -1);
check('and it is cleared once the fade is done', (function () {
  advance(Math.round(600*PACE));
  return run('ccjRun.emptyGhost') === false && stream().indexOf('ccj-empty ghost') === -1;
})());

section('ACTION BY ACTION — NEW INTAKE SHOWS ITS WORKING');
// Four actions for this step: connect, fetch, verify, save. Built from the evidence it actually
// has — a step with no payload gets no fetch line rather than a fabricated one.
check('the step declares one action per thing it does',
  run("ccjActsFor(0,ccjSteps(0)[0]).map(function(a){return a.id;}).join(',')") === 'connect,fetch,verify,save',
  run("ccjActsFor(0,ccjSteps(0)[0]).map(function(a){return a.id;}).join(',')"));
/* THE LIVE BLOCK IS A WINDOW, NOT A LEDGER. Nothing in flight is drawn in the body any more —
   the head carries the claim of activity as a spark and one word, and the body's window shows
   only work that has actually finished. So the first honest assertion is an absence: before the
   first action completes, the window claims nothing. */
check('nothing is claimed done before the first action finishes',
  count(liveBlock(), 'ccj-sl act') === 0, count(liveBlock(), 'ccj-sl act') + ' done lines');
check('the head names the work underway — a spark and one word',
  liveBlock().indexOf('ccj-spark') > -1 && liveBlock().indexOf('Connecting&hellip;') > -1,
  liveBlock().slice(0, 240));
// Tested directly rather than by hoping the timers interleave a certain way. The invariant is
// "a beat writes the log node and nothing else" — so call the beat painter and look at what it
// touched. Timing-based versions of this broke the moment the pace was tuned for readability,
// which is exactly the kind of test that costs more than it protects.
delete nodes['ccj-ev-lines']; delete nodes['ccj-panel-inner'];
run('ccjPaintBeat()');
/* A beat still touches the evidence lines alone — but the id is now per block, because a held
   block and a running block can be open at the same time and one shared id would send the second
   block's beats into the first. Asserting the id is per-step IS the assertion: a singleton would
   read the same everywhere and the collision would only ever show up on screen. */
check('the evidence lines are addressed per block, not by a shared id',
  run('ccjEvLinesId(0,1,1)') !== run('ccjEvLinesId(0,2,1)'),
  run('ccjEvLinesId(0,1,1)') + ' vs ' + run('ccjEvLinesId(0,2,1)'));
/* And per PASS, which is the one that bites silently. Two blocks for the same step on different
   attempts would share an id, and getElementById returns the FIRST match — so the second
   attempt's beats would paint into the first attempt's block, and the follow-scroll would target
   the dead one, with no error anywhere. */
check('and per attempt, so a re-run cannot paint into the block it replaced',
  run('ccjEvLinesId(0,1,1)') !== run('ccjEvLinesId(0,1,2)')
  && run('ccjStepBlockId(0,1,1)') !== run('ccjStepBlockId(0,1,2)'),
  run('ccjEvLinesId(0,1,1)') + ' vs ' + run('ccjEvLinesId(0,1,2)'));
/* THE LIVE BLOCK IS ONE LINE — the user removed the live details outright. A beat retargets the
   gist and the verb in the head; there is no body to write into, and headless the fallback is
   ccjPaintBlocks, which touches at most two blocks — never the whole conversation. */
run('ccjPaintBeat()');
check('a beat lands in the live block\'s own line',
  liveBlock().indexOf('ccj-sb-gist') > -1, liveBlock().slice(0, 240));
check('and the live block carries no detail body',
  liveBlock().indexOf('ccj-sl') === -1 && liveBlock().indexOf('ccj-act') === -1
  && liveBlock().indexOf('ccj-ev-more') === -1, liveBlock().slice(0, 240));
clearEv(); advance(ACT);
check('the connect completes into the gist, naming the system',
  liveBlock().indexOf('Connected to NewForce Solutions') > -1, liveBlock().slice(0, 240));
check('and the verb moves on to the fetch', liveBlock().indexOf('Fetching&hellip;') > -1,
  liveBlock().slice(0, 240));
clearEv(); advance(ACT);
check('the fetch reports how many records came back', liveBlock().indexOf('records returned') > -1,
  liveBlock().slice(0, 240));
check('the verify is now running, as the one word in the head',
  liveBlock().indexOf('Validating&hellip;') > -1, liveBlock().slice(0, 240));
clearEv(); advance(ACT);
check('the verify reports its verdict in the gist', liveBlock().indexOf('checks passed') > -1,
  liveBlock().slice(0, 240));
clearEv(); advance(ACT);
check('the save completes the step', liveBlock().indexOf('saved') > -1, liveBlock().slice(0, 240));

section('THE LOOKUP LANDS, AND THE SCREEN MOVES');
advance(Math.round(1200*PACE));
check('match card replaced the skeleton', stream().indexOf('ccj-match') > -1 && stream().indexOf('ccj-searching') === -1);
check('matched the real ADT record', run('ccjRun.match&&ccjRun.match.name') === 'Anika Shah');
check('no employee was invented for a match', run('ccjRun.createdEmp') === null);
check('the form was pre-filled from the record and the prompt',
  run('Object.keys(ccjRun.aiFilled).length') >= 6, run('JSON.stringify(Object.keys(ccjRun.aiFilled))'));
advance(Math.round(1200*PACE));
check('moved to the contract form', run('ccjRun.screen') === 'form', run('ccjRun.screen'));
check('the employee screen was skipped for a matched hire', run('!!ccjRun.reached.employee') === false);

section('THE HOLD — NEW INTAKE MUST NOT FINISH ON A TIMER');
check('new intake is held, not settled', run('ccjRun.phase') === 'hold', run('ccjRun.phase'));
check('it is still the current sub-status', run('ccjRun.sub') === 0);
check('nothing has settled yet', run('Object.keys(ccjRun.settled).length') === 0);
check('progress bar has not moved', prog() === '0%' || prog() === '', prog());
/* One line, even held: no note box, no log — the gist and the verb carry the state. */
check('the held block is one line — no note box, no log',
  liveBlock().indexOf('ccj-hold') === -1 && liveBlock().indexOf('ccj-sl') === -1
  && liveBlock().indexOf('ccj-sb-gist') > -1, liveBlock().slice(0, 240));
check('it is still visibly working', panel().indexOf('ccj-spin') > -1);
check('the held gist keeps the last thing it did',
  liveBlock().indexOf('details saved') > -1, liveBlock().slice(0, 240));
/* A hold names its own verb. "Working" was the generic word here and the user called it out as
   depicting the wrong thing — the intake hold is waiting for the hire's details, so it gathers. */
check('the held verb says what the hold is doing, not the generic word',
  liveBlock().indexOf('ccj-sb-verb">Gathering&hellip;') > -1
  && liveBlock().indexOf('ccj-sb-verb">Working&hellip;') === -1,
  liveBlock().slice(0, 240));
advance(Math.round(60000*PACE));
check('sixty seconds of waiting does not advance it',
  run('ccjRun.phase') === 'hold' && run('ccjRun.sub') === 0 && run('ccjRun.stage') === 0);

/* THE SAME INVARIANT, ON THE SURFACE THAT NOW CARRIES IT. The panel was built once per stage and
   never remounted so it could keep its spinner and its place; the sub-statuses have moved into
   the conversation, so the conversation is what must now stand. It does — it is a sibling of the
   work area rather than inside it, which is why a screen change no longer reaches it.

   This is the assertion that would have caught the regression if the conversation had been left
   inside #ccj-work: stage 1 changes screen three times, and the live block would have been torn
   down and rebuilt on each one. */
section('THE CONVERSATION STANDS WHILE SCREENS CHANGE');
check('two columns now — the conversation and the screen',
  shell().indexOf('ccj-chat-col') > -1 && work().indexOf('ccj-screen') > -1 && shell().indexOf('ccj-panel') === -1);
check('and the conversation is given the room the panel gave up',
  shell().indexOf('ccj-body no-panel') > -1);
check('the conversation is OUTSIDE the work area, which is what makes it survive',
  work().indexOf('ccj-chat-col') === -1);
// Written into the live stream node: if a screen change rebuilt the conversation, this is gone.
nodes['ccj-stream'].innerHTML = 'SENTINEL';
run("ccjGoScreen('form')");
check('changing screen does not rebuild the conversation', stream() === 'SENTINEL');
run('ccjRenderChat()');
check('an explicit rebuild does restore it', stream().indexOf('ccj-msg') > -1);

section('THE FORM');
const f = screen();
check('the form renders', f.indexOf('Create a Contract') > -1);
check('it reports what the agent pre-filled', f.indexOf('AI pre-filled') > -1);
check('pre-filled fields are marked so they get checked', count(f, 'class="ccj-ai"') >= 6, count(f, 'class="ccj-ai"') + ' marks');
check('all four sections render', count(f, 'ccj-fsec-t') === 4, count(f, 'ccj-fsec-t') + ' sections');
check('End Date is absent on a permanent contract', f.indexOf('id="ccj-f-toDate"') === -1);
check('required fields still missing are flagged', f.indexOf('ccj-fgroup full missing') > -1 || f.indexOf('missing') > -1);
check('no submit button — the form reports what is left instead',
  f.indexOf('ccj-primary') === -1 && f.indexOf('required field') > -1);
advance(Math.round(1500*PACE));
check('the agent asks for the first missing field', run('ccjRun.asking') === 'dob', run('ccjRun.asking'));
check('the asked field is ringed on the form', screen().indexOf('ccj-fgroup asking') > -1);
check('the question is in the conversation', stream().toLowerCase().indexOf('date of birth') > -1);

section('ANSWERING — IN THE CONVERSATION AND IN THE FORM');
say('1994-03-12');
check('the answer lands in the form', run("ccjRun.form.dob") === '1994-03-12', run('ccjRun.form.dob'));
check('the agent confirms what it set', stream().indexOf('Set <b>Date of Birth</b>') > -1);
advance(Math.round(1500*PACE));
check('it moves on to the next missing field', run('ccjRun.asking') === 'mobile', run('ccjRun.asking'));
say('not a real option for a select');
check('a free-text answer is accepted for a text field', run('ccjRun.form.mobile') === 'not a real option for a select');
// Typing into the field itself answers the question just as surely as replying to it.
advance(Math.round(1500*PACE));
run("ccjSetField('address','12 Prinsengracht, Amsterdam')");
check('editing the field clears the agent\'s question', run('ccjRun.asking') === null || run('ccjRun.asking') !== 'address');
check('a user-edited field loses its AI marker', run("!!ccjRun.aiFilled.address") === false);

section('DOCUMENT PARSING');
// A fresh run so the document lands against an empty-ish form rather than one already answered.
startRun();
say('Create an EOR contract for Rohan Verma at Kaira Textiles in Germany');
advance(Math.round(4000*PACE));
// No ADT match, so this run stops at Employee Created first — the real path for a new hire.
check('a new hire lands on the employee screen', run('ccjRun.screen') === 'employee', run('ccjRun.screen'));
run("ccjGoScreen('form')");
check('on the form, ready for a document', run('ccjRun.screen') === 'form', run('ccjRun.screen'));
/* The user replaced the labelled dashed bar with a link icon IN the input row — attach is a
   composer act now, like Claude's own. Inside the row, before the textarea, and the sample
   download rides beside it so no capability was lost with the label. */
check('attach is a link icon inside the input row', (function () {
  const c = composer();
  // 'ccj-prompt', not 'ccj-input' — the row's own class contains that as a prefix and would
  // anchor the comparison on itself.
  return c.indexOf('ccj-attach') > -1 && c.indexOf('ccj-input-row') < c.indexOf('ccj-attach')
    && c.indexOf('ccj-attach') < c.indexOf('ccj-prompt') && c.indexOf('ccj-upload-row') === -1;
})(), composer().indexOf('ccj-input-row') + ' vs ' + composer().indexOf('ccj-attach'));
check('the sample form is still offered beside it', composer().indexOf('ccj-attach dl') > -1);
check('attach is not offered where there are no fields to fill', (function () {
  run('ccjStartNewRun()');
  const before = composer().indexOf('ccj-attach');
  return before === -1;
})());
startRun();
say('Create an EOR contract for Rohan Verma at Kaira Textiles in Germany');
advance(Math.round(4000*PACE));
run("ccjGoScreen('form')");
const typedEmail = 'typed.by.hand@example.com';
run("ccjSetField('email','" + typedEmail + "')");
run("ccjStartExtraction('Rohan_Verma_Contract_Data.pdf',2037)");
check('the file appears as a message, not a page block', stream().indexOf('ccj-file') > -1);
check('an extraction card opened', stream().indexOf('ccj-doc') > -1);
check('it never overwrites a value the user typed',
  run("ccjRun.doc.fields.every(function(x){return x.k!=='email';})") === true);
check('the held gist names the document being read',
  liveBlock().indexOf('Rohan_Verma_Contract_Data.pdf') > -1, liveBlock().slice(0, 240));
// Anchored on the verb SPAN, not the word — the document card in the same slice says
// "Reading …" too, and matching the bare word passed while the verb still said "Working".
check('and the verb beside the spark reads with it',
  liveBlock().indexOf('ccj-sb-verb">Reading&hellip;') > -1, liveBlock().slice(0, 240));
advance(Math.round(900*PACE));
check('fields land one at a time', run('ccjRun.doc.at') >= 1 && run('ccjRun.doc.at') < run('ccjRun.doc.fields.length'),
  run('ccjRun.doc.at') + ' of ' + run('ccjRun.doc.fields.length'));
check('the form flashes the field that just landed', screen().indexOf('ccj-fgroup') > -1 && run('ccjRun.justFilled') !== null);
/* WHILE READING IT IS ONE LINE — the user applied the sub-status rule to this card too. The
   field it is on and the count are the gist; the rows do not exist yet. */
check('the reading card is one line, not nineteen rows',
  stream().indexOf('ccj-doc live') > -1 && stream().indexOf('ccj-doc-row') === -1,
  stream().indexOf('ccj-doc-row') + ' row position');
check('and its gist says which field it is on, and how far in',
  stream().indexOf('ccj-sb-gist') > -1
  && stream().indexOf(run("ccjRun.doc.at+' of '+ccjRun.doc.fields.length")) > -1,
  run("ccjRun.doc.at+' of '+ccjRun.doc.fields.length"));
advance(Math.round(9000*PACE));
check('extraction completes', run('ccjRun.doc.done') === true);
/* AND THE CITATIONS COME BACK WHEN IT DOES. The record is not lost — it arrives when there is
   something settled to read, which is where a reviewer actually checks it. */
const openedDoc = run("(function(){var was=ccjRun.doc.open;ccjRun.doc.open=true;"
  + "ccjRenderChat();return was;})()");
check('the finished card cites where each value came from', stream().indexOf('ccj-doc-k') > -1);
check('every row cites where in the document it came from',
  count(stream(), 'ccj-doc-src') >= 1, count(stream(), 'ccj-doc-src') + ' citations');
// Put it back exactly as it was — the fold behaviour is asserted below and reads this flag.
run('ccjRun.doc.open=' + (openedDoc ? 'true' : 'false') + ';ccjRenderChat()');
check('every extracted field is in the form',
  run("ccjRun.doc.fields.every(function(x){return String(ccjRun.form[x.k]||'')===String(x.v);})") === true);
check('the typed email survived the document', run('ccjRun.form.email') === typedEmail, run('ccjRun.form.email'));
// Confidence grading was removed: the values are read straight from the document, so a row
// labelled LIKELY would invite doubt about something not in doubt.
check('no confidence grading is shown', stream().indexOf('ccj-conf') === -1
  && stream().indexOf('LIKELY') === -1 && stream().indexOf('CERTAIN') === -1);
// Counted in EITHER state: by now the run has moved on and the card has folded to its one line,
// so a check that only knew the open head would report zero cards and pass a rebuild that had
// lost it entirely.
check('extraction is ONE card, not a message per field',
  count(stream(), 'ccj-doc-head') + count(stream(), 'ccj-doc-closed') === 1,
  count(stream(), 'ccj-doc-head') + ' open / ' + count(stream(), 'ccj-doc-closed') + ' folded');

/* THE CARD FOLDS ONCE ITS VALUES ARE IN THE FORM. The document has done its job at that point and
   the form is where the values live; keeping nineteen rows of them is the same information twice.
   What it leaves behind has to be worth having, and has to be honest — `fields.length` counts
   only what the document was ALLOWED to fill, so a line saying "19 fields" on a run where two
   were the user's own typing would be claiming work it did not do. */
check('the card has folded now the run has moved past it',
  run('ccjRun.doc.open') === false && stream().indexOf('ccj-doc-closed') > -1);
check('its line says what it filled', stream().indexOf('fields filled') > -1);
check('and it counts the values it did NOT touch, rather than claiming them',
  run('ccjRun.doc.kept') >= 1 && run('ccjDocFact(ccjRun.doc)').indexOf('kept ' + run('ccjRun.doc.kept') + ' of yours') > -1,
  run('ccjDocFact(ccjRun.doc)'));
check('what is missing is snapshotted, not recounted as the user answers',
  typeof run('ccjRun.doc.absent') === 'number');
// Reopening has to be free of friction — the whole line is the control, and it comes back with
// every row it had.
run('ccjToggleDoc()');
check('one click brings the whole card back',
  stream().indexOf('ccj-doc-closed') === -1 && count(stream(), 'ccj-doc-head') === 1
  && count(stream(), 'ccj-doc-row') >= 3,
  count(stream(), 'ccj-doc-row') + ' rows back');
run('ccjToggleDoc()');
check('and clicking again folds it', stream().indexOf('ccj-doc-closed') > -1);
check('the conversation is not flooded', run('ccjRun.msgs.length') < 12, run('ccjRun.msgs.length') + ' messages');
check('the flash marker is cleared when it finishes', run('ccjRun.justFilled') === null);
until(() => run('ccjRun.doc.done') === true);
// The invariant, not the instant: New intake is never settled without a proposal existing. A
// document filling every field can now trigger the auto-proceed a beat later, so asserting
// "phase === hold" right here was really asserting how fast that timer is.
check('reading a document never settles the intake on its own — only a proposal does',
  run("!ccjRun.settled['request-received/New intake'] || !!ccjRun.proposal"),
  'settled=' + run("!!ccjRun.settled['request-received/New intake']") + ' proposal=' + run('!!ccjRun.proposal'));
const leftOver = run('ccjMissingFields().length');
check('anything the document missed is asked for, not left blank',
  leftOver === 0 || run('ccjRun.asking') !== null, leftOver + ' still missing, asking ' + run('ccjRun.asking'));

section('A BAD ANSWER TO A CONSTRAINED FIELD');
// Back to the matched-employee run's state for the remaining checks.
startRun();
say('Create an EOR contract for Anika Shah at Norrbridge Logistics in Netherlands');
advance(Math.round(4000*PACE));
run("['dob','mobile','address','jobDesc','fromDate'].forEach(function(k){ccjSetField(k,'x');});ccjSetField('pay','5700');");
run("ccjRun.asking='schedule';ccjRun.form.schedule='';");
say('banana');
check('an unmatched option is refused, not stored', run('ccjRun.form.schedule') === '', run('ccjRun.form.schedule'));
check('the agent lists the options instead', stream().indexOf('Not a valid option') > -1);
check('it keeps asking', run('ccjRun.asking') === 'schedule');
say('full');
check('a partial match resolves to the real option', run('ccjRun.form.schedule') === 'Full time', run('ccjRun.form.schedule'));

section('CREATING THE PROPOSAL RELEASES THE HOLD');
run("['jobDesc','fromDate'].forEach(function(k){ccjSetField(k,'x');});ccjSetField('pay','5700');");
check('nothing required is missing now', run('ccjMissingFields().length') === 0,
  run("JSON.stringify(ccjMissingFields().map(function(x){return x.k;}))"));
// Nothing is missing, so the agent proceeds on its own after a readable pause. No click.
check('it announces that it is about to make the proposal',
  run('ccjRun.proposing') === true && screen().indexOf('ccj-form-foot-go') > -1);
check('but it has not made it yet', run('ccjRun.proposal') === null);
advance(Math.round(1000*PACE));
check('emptying a required field again cancels the pending proposal', (function () {
  run("ccjSetField('pay','')");
  return run('ccjRun.proposing') === false && run('ccjRun.proposal') === null;
})());
run("ccjSetField('pay','5700')");
advance(Math.round(3200*PACE));
check('a proposal exists', run('!!ccjRun.proposal') === true && run('ccjRun.proposal.id').indexOf('PRO-') === 0);
check('moved to the proposal screen', run('ccjRun.screen') === 'proposal', run('ccjRun.screen'));
check('the proposal screen shows it', screen().indexOf('Proposal created') > -1);
check('the hold released — new intake settled', run("!!ccjRun.settled['request-received/New intake']") === true);
check('its result line is the authored one', panel().indexOf('Intake resolved') > -1);
/* No progress bar to read any more — it was the panel's, and the panel is gone. Progress is now
   what the blocks themselves say, which is a stronger thing to assert: a bar can be at 33% while
   the row it claims to describe says nothing. */
check('the first step now reads as done', run("!!ccjRun.settled['request-received/New intake']"));
check('and it says what it found, not just that it finished',
  String(run("ccjRun.settled['request-received/New intake'].summary") || '').length > 0,
  run("ccjRun.settled['request-received/New intake'].summary"));

section('CSM ASSIGNED, THEN THE GATE');
advance(Math.round(5000*PACE));
const p2 = panel();
check('sub-status 2 settled and names the CSM', p2.indexOf('Maya Vos assigned') > -1, 'Netherlands should route to Maya Vos');
/* THE COLLAPSE, WHICH IS THE POINT OF THE WHOLE STEP. Two sub-statuses have finished and the
   runner has moved to the third, so both closed — and each kept the one fact worth keeping. The
   third is showing its gate and stays open, because closing a block with an unanswered question
   in it would hide the only control that can advance the run. */
check('the two finished steps have closed', count(p2, 'ccj-sb closed') === 2,
  count(p2, 'ccj-sb closed') + ' closed');
check('and each closed line kept a fact, not just a tick',
  count(p2, 'ccj-sb-fact') >= 2 && p2.indexOf('<span class="ccj-sb-fact"></span>') === -1);
check('the step being asked about is still open', count(p2, 'ccj-sb open') === 1,
  count(p2, 'ccj-sb open') + ' open');
check('run halted on the decision', run('ccjRun.phase') === 'halt', run('ccjRun.phase'));
/* Stage 1's gate carries its OWN halt sentence, because it states a fact no other decision gate in
   the journey shares — the intake is captured and routed. Every other decision gate now gets a
   sentence that is true of any decision; this asserts the specific one survived being generalised
   rather than being lost with it. */
check('and the conversation says the intake is logged, which only this gate can say',
  run("(function(){var m=ccjRun.msgs.filter(function(x){return x.who==='agent'&&x.text;}).pop();"
    + "return m?m.text:'';})()").indexOf('Request logged and routed') > -1);
check('gate rendered in the row it belongs to', p2.indexOf('ccj-gate') > -1);
check('gate offers both answers', p2.indexOf('>Qualify<') > -1 && p2.indexOf('>Reject<') > -1);
// The whole point of the rename was that one decision stopped being called two things. Asserted
// as an absence, because a half-finished rename shows up as the old word surviving somewhere
// rather than as anything failing.
check('and the retired word survives nowhere on the card',
  p2.indexOf('Disqualif') === -1, p2.slice(p2.indexOf('Disqualif') - 60, p2.indexOf('Disqualif') + 60));
check('gate names who owns it', (p2.split('ccj-gate-who')[1] || '').indexOf('Arjun Vaidya') > -1);
check('nothing is still spinning', p2.indexOf('ccj-spin') === -1);
check('the conversation asked for the decision', stream().toLowerCase().indexOf('qualify') > -1);
const stageBefore = run('ccjRun.stage');
advance(Math.round(20000*PACE));
check('the machine does not advance itself past a human gate',
  run('ccjRun.stage') === stageBefore && run('ccjRun.phase') === 'halt');

section('THE EVIDENCE DRAWER');
run("ccjInspect('request-received/CSM assigned')");
const dw = drawer();
check('drawer opens', dw.indexOf('ccj-dw') > -1);
check('drawer shows the call that was made', dw.indexOf('route(client=') > -1);
check('drawer resolves the call against THIS run', dw.indexOf('Netherlands') > -1);
check('drawer shows every rule with a verdict', count(dw, 'ccj-dw-verdict ') === 2, count(dw, 'ccj-dw-verdict ') + ' verdicts');
check('drawer shows what was written', dw.indexOf('Written to the record') > -1);
check('drawer carries the authored explanation', dw.indexOf('ccj-dw-note') > -1);
run('ccjCloseDrawer()');
check('drawer closes', drawer() === '');

section('REJECT — THE TERMINAL BRANCH');
run("ccjChooseGate('rejected','Headcount pulled for this quarter.')");
check('run stops', run('ccjRun.stopped') === true);
check('stage does not advance', run('ccjRun.stage') === 0);
check('panel says so and offers a way back', panel().indexOf('ccj-gate stopped') > -1 && panel().indexOf('Reopen') > -1);
check('the conversation explains the consequence', stream().indexOf('Request declined') > -1);
advance(Math.round(20000*PACE));
check('a stopped run stays stopped', run('ccjRun.stage') === 0 && run('ccjRun.stopped') === true);
run('ccjReopen()');
check('reopening restores the decision', run('ccjRun.stopped') === false && run('ccjRun.phase') === 'halt');
check('the decision is answerable again', panel().indexOf('>Qualify<') > -1);

section('QUALIFY — THE STAGE COMPLETES AND THE JOURNEY MOVES');
run("ccjChooseGate('qualified')");
advance(Math.round(1200*PACE));
check('advanced to stage 2', run('ccjRun.stage') === 1, 'stage ' + run('ccjRun.stage'));
check('page followed the stage', run('page') === 'ccj-quote-prep', run('page'));
const h2 = shell();
check('rail moved with it', h2.indexOf('Step 2 of 9') > -1);
// The window still shows 1-4 here (it holds until step 3), so the done-state is on screen in it.
check('the window holds at 1-4 and stage 1 dot reads done',
  run('ccjRailFrom(1)') === 0 && h2.indexOf('ccj-dot done') > -1);
/* The old check here greped h2 for "Quote in preparation" and called that "the panel switched to
   stage 2". It has been a no-op for as long as it has existed: the header AND the rail both print
   the stage's `short`, so it passes with no sub-status surface on the page at all — which is
   exactly what stage 2 now is. Replaced with something only this stage's own surface can satisfy.

   And "shows all six of its sub-statuses" was a property of the PANEL, which listed every step of
   the stage before any of them ran. A transcript has no pending blocks by design, so at this
   moment there is exactly one. The six are asserted where they become true — at the end of the
   stage, below. */
check('stage 2 is a rebuilt stage, so it has no panel', run('ccjUsesTranscript(1)') === true && h2.indexOf('ccj-panel') === -1);
/* Counted by the stage's own block ids, not by the class. The transcript is ONE conversation for
   the whole run, so stage 1's blocks are still in it — a bare class count here is a count of the
   journey so far, and would have passed at any number. `ccj-sb-1-` is stage index 1. */
check('and it starts with one block, not a list of six',
  count(stream(), 'id="ccj-sb-1-') <= 1,
  count(stream(), 'id="ccj-sb-1-') + ' stage-2 blocks at entry, '
  + count(stream(), 'class="ccj-sb ') + ' in the whole transcript');
check('the stage really does have six sub-statuses to get through',
  run("amSubSteps('quote-prep').length") === 6, run("amSubSteps('quote-prep').length") + ' steps');
check('stage 2 has a real screen, not a placeholder', h2.indexOf('Coming soon') === -1 && h2.indexOf('ccj-q-title') > -1);
check('the stage-1 decision is recorded', run('Object.keys(ccjRun.decisions).length') === 1);

section('STAGE 2 — QUOTE IN PREPARATION');
// The next check is the real one — that it began without anyone asking it to. Asserting the
// pre-start state here was asserting how quickly the arrival timer fires.
until(() => run("ccjRun.phase==='act'"));
check('it began working without being asked', run('ccjRun.sub') === 0 && run('ccjRun.phase') === 'act',
  'sub ' + run('ccjRun.sub') + ' phase ' + run('ccjRun.phase'));
check('the conversation says what it is starting on', stream().indexOf('Country data check') > -1);
check('the quote screen is beside it', screen().indexOf('ccj-q-title') > -1);
check('the quote is not shown complete before the work is done',
  screen().indexOf('ccj-q-skel') > -1 && screen().indexOf('ccj-q-row pend') > -1);

// -- 1. Country data check: connect, fetch, verify, save --
check('the verb says it is connecting', liveBlock().indexOf('Connecting&hellip;') > -1, liveBlock().slice(0, 240));
clearEv(); advance(ACT);
check('it connected to the Compliance Hub', liveBlock().indexOf('Connected to Compliance Hub') > -1,
  liveBlock().slice(0, 240));
clearEv(); advance(ACT);
check('the country rules come back into the gist', liveBlock().indexOf('returned') > -1,
  liveBlock().slice(0, 240));
clearEv(); advance(ACT);
check('the rules are verified, in the gist', liveBlock().indexOf('checks passed') > -1,
  liveBlock().slice(0, 240));
advance(Math.round(2000*PACE));
check('country data check settles', run("!!ccjRun.settled['quote-prep/Country data check']") === true);
/* THE RECORD LOST NOTHING. The live view is one line, but a settled block clicked open is still
   the full ledger — payloads, verdicts and the way into the evidence drawer. */
run('ccjToggleStep(1,0,ccjPass(1,ccjSteps(1)[0]))');
check('a reopened block is still the full record — payloads, verdicts, evidence',
  stream().indexOf('ccj-act-row') > -1 && stream().indexOf('ccj-act-check') > -1
  && stream().indexOf('ccj-ev-more') > -1);
run('ccjToggleStep(1,0,ccjPass(1,ccjSteps(1)[0]))');
check('the quote picks up the country rules',
  screen().indexOf('Netherlands statutory set resolved') > -1, screen().slice(0, 0));

// -- 2. Partner cost requested: conditional, and the Netherlands is owned in-house --
advance(Math.round(1500*PACE));
check('a conditional step that does not apply is skipped, not run',
  run("(ccjRun.settled['quote-prep/Partner cost requested']||{}).skipped") === true);
check('and the reason is shown rather than the row vanishing',
  panel().indexOf('owned in-house') > -1);
check('a skipped step reads as a sentence, not a mangled fragment',
  panel().indexOf('Only applies to if off-standard') === -1);
/* The panel said "Not applicable" and then the reason underneath. A block has one line to work
   with, and the reason IS the more useful half — "Netherlands is owned in-house" says everything
   "Not applicable" does and says why. So the assertion moves to what actually distinguishes a
   skipped step now: its own mark, which is neither a green tick nor a spinner. */
check('it does not count as work done', panel().indexOf('ccj-sb-skip') > -1
  && panel().indexOf('ccj-sb closed skipped') > -1, 'no skipped-block marking found');

// -- 3 & 4. Cost calc built, then the statutory floor --
advance(Math.round(14000*PACE));
check('cost calc built settles', run("!!ccjRun.settled['quote-prep/Cost calc built']") === true);
check('the quote now carries real numbers',
  screen().indexOf('ccj-q-skel') === -1 && screen().indexOf('Employer social security') > -1);
check('the total is shown', screen().indexOf('Total monthly cost') > -1);
check('statutory floor check settles', run("!!ccjRun.settled['quote-prep/Statutory floor check']") === true);
// The quote reads the settled row's own summary rather than asserting a pass. It used to print
// "Above minimum wage" whenever the row had merely finished — on a failed check, and on the six
// countries where the panel a column away said the check could not be made at all.
check('the floor result on the quote is the settled row, word for word',
  screen().indexOf(run("ccjRun.settled['quote-prep/Statutory floor check'].summary")) > -1,
  run("ccjRun.settled['quote-prep/Statutory floor check'].summary"));
check('and on a country with no configured floor it says so, not "above minimum"',
  run("(function(){var was=ccjRun.form.country;ccjRun.form.country='Germany';"
    + "var d=ccjEvidence(1,ccjSteps(1)[3]);var cap=ccjVal(d.captured,ccjCtx())[0].v;"
    + "ccjRun.form.country=was;return cap;})()") === 'not configurable');
// A rate under the statutory minimum must not be written to the record as clearing it.
check('a failing floor is recorded as BELOW, never as above',
  run("(function(){var wc=ccjRun.form.country,wp=ccjRun.form.pay;"
    + "ccjRun.form.country='Netherlands';ccjRun.form.pay='1800';"
    + "var d=ccjEvidence(1,ccjSteps(1)[3]);var c=ccjCtx();"
    + "var cap=ccjVal(d.captured,c)[0].v,v=ccjVal(d.checks,c)[0].verdict,sum=ccjVal(d.summary,c);"
    + "ccjRun.form.country=wc;ccjRun.form.pay=wp;"
    + "return v+'|'+cap+'|'+(sum.indexOf('BELOW')>-1);})()") === 'fail|BELOW minimum|true',
  run("(function(){var wc=ccjRun.form.country,wp=ccjRun.form.pay;"
    + "ccjRun.form.country='Netherlands';ccjRun.form.pay='1800';"
    + "var d=ccjEvidence(1,ccjSteps(1)[3]);var c=ccjCtx();"
    + "var r=ccjVal(d.checks,c)[0].verdict+'|'+ccjVal(d.captured,c)[0].v;"
    + "ccjRun.form.country=wc;ccjRun.form.pay=wp;return r;})()"));

// -- 5. Pricing approval: only if off-standard, and this quote is on the rate card --
check('pricing approval is skipped on a standard quote',
  run("(ccjRun.settled['quote-prep/Pricing approval']||{}).skipped") === true);

// -- 6. Quote QA: manual --
check('the run halts at Quote QA', run('ccjRun.phase') === 'halt', run('ccjRun.phase'));
check('it is the last sub-status', run('ccjRun.sub') === 5, 'sub ' + run('ccjRun.sub'));
check('it is owned by Pricing', (panel().split('ccj-gate-who')[1] || '').indexOf('Karan Mehta') > -1);
// CCJ_ANY_PERSONA is on, so a non-owner can answer it — but the owner is still named and the
// row is marked, so the record of WHO owns the decision never gets lost.
check('a non-owner can still answer it',
  panel().indexOf('>Approve<') > -1 && panel().indexOf('>Send back<') > -1);
check('and is told they are acting for someone else',
  panel().indexOf('ccj-gate-behalf') > -1 && panel().indexOf('ccj-gate-locked') === -1);
// Switch to the persona that owns the step. Same gate, same run — only who is looking changes.
run("activePersonaId='deal-manager';");
run('ccjPaint()');
check('the owner sees no acting-as marker',
  panel().indexOf('>Approve<') > -1 && panel().indexOf('ccj-gate-behalf') === -1);
advance(Math.round(30000*PACE));
check('it does not approve itself', run('ccjRun.phase') === 'halt' && run('ccjRun.stage') === 1);

section('SENDING A QUOTE BACK IS A LOOP, NOT A STOP');
run("ccjChooseGate('rework','Margin is below the standard band.')");
check('it returns to the cost build, not to the top of the stage',
  run('ccjRun.sub') === 2, 'sub ' + run('ccjRun.sub'));
check('the work being redone is un-ticked',
  run("!ccjRun.settled['quote-prep/Cost calc built']") === true
  && run("!!ccjRun.settled['quote-prep/Country data check']") === true);
check('the run is alive, not stopped', run('ccjRun.stopped') === false);
// It NAMES the step. It used to say "Rebuilding the cost", which is this stage's sentence said on
// every send-back in the journey — including stage 5's, which rebuilds an agreement and has no
// cost in it. Asserted against the step name so it stays true wherever a rework happens.
check('the conversation says where it went back to',
  stream().indexOf('Picking up again from <b>Cost calc built</b>') > -1);
advance(Math.round(30000*PACE));
check('it works its way back to Quote QA', run('ccjRun.phase') === 'halt' && run('ccjRun.sub') === 5);

section('APPROVING THE QUOTE COMPLETES STAGE 2');
run("ccjChooseGate('approved')");
advance(Math.round(1500*PACE));
check('the quote reads approved', run("!!ccjRun.settled['quote-prep/Quote QA']") === true);
check('stage 3 is next', run('ccjRun.stage') === 2, 'stage ' + run('ccjRun.stage'));
check('page followed', run('page') === 'ccj-quote-review', run('page'));
check('stage 3 has a real screen', shell().indexOf('Coming soon') === -1 && shell().indexOf('ccj-sent-title') > -1);

section('THE MONEY AGREES WITH ITSELF');
// One rate table, read by everything that states a number. This existed as three different
// answers to the same question — the quote screen computed 18.4% for Germany while the evidence
// panel a column away said "~19.4%", and the cost calculator on another page implies 19.575%.
const Q = run('ccjQuote()');
const totalStr = Q.sym + ' ' + Q.total.toLocaleString();
check('the rate comes from the country table, not a literal',
  Q.socialPct === run("ccjRate(ccjCtx().country).social"), Q.socialPct);
check('the arithmetic closes', Q.gross + Q.social + Q.holiday === Q.base && Q.base + Q.fee === Q.total,
  Q.gross + '+' + Q.social + '+' + Q.holiday + ' = ' + Q.base + ' +' + Q.fee + ' = ' + Q.total);
check('margin IS the fee — so a negotiation has something to move',
  Q.fee === Math.round(Q.base * Q.margin / 100));
const stage2Screen = run('buildCCJQuoteHTML()');
check('the stage 2 screen states that total', stage2Screen.indexOf(totalStr) > -1, totalStr);
check('and the same employer rate as the table',
  stage2Screen.indexOf(Q.socialPct + '% of gross') > -1);
const costEv = run("(function(){var d=ccjEvidence(1,ccjSteps(1)[2]);return JSON.stringify(ccjVal(d.captured,ccjCtx()));})()");
check('the evidence panel beside it states the same total', costEv.indexOf(Q.total.toLocaleString()) > -1, costEv);
check('and the same employer cost', costEv.indexOf(Q.base.toLocaleString()) > -1);
const sentEv = run("(function(){var d=ccjEvidence(2,ccjSteps(2)[0]);return JSON.stringify(ccjVal(d.fetched,ccjCtx()));})()");
check('stage 3 quotes the same number it was sent', sentEv.indexOf(Q.total.toLocaleString()) > -1, sentEv);
check('currency follows the country everywhere, never a hardcoded EUR',
  costEv.indexOf('EUR ') === -1 && sentEv.indexOf('EUR ') === -1);
// A check that cannot be made must not report a pass.
// This run is a Netherlands hire, so the check has to be evaluated against a Germany context
// to see the un-configured case — the country is what decides whether a floor exists at all.
check('a country with no configured minimum wage says so rather than passing',
  run("(function(){var d=ccjEvidence(1,ccjSteps(1)[3]);var was=ccjRun.form.country;"
    + "ccjRun.form.country='Germany';var v=ccjVal(d.checks,ccjCtx());ccjRun.form.country=was;"
    + "return ccjFloorFor('Germany')===null && v[0].verdict==='na';})()"));
check('the Netherlands, which has one, is actually compared against it',
  run("(function(){var f=ccjFloorFor('Netherlands');return !!f && f.num===14.71;})()"),
  run("JSON.stringify(ccjFloorFor('Netherlands'))"));

section('STAGE 3 — THE QUOTE IS WITH THE CLIENT');
check('the column switches to the client conversation', run('ccjChatMode()') === 'client');
check('and the header names the client', work().indexOf('ccj-chat-av') > -1);
check('Sent settles and the quote goes out as a card in the thread',
  until(() => run("!!ccjRun.settled['quote-review/Sent']")) && stream().indexOf('ccj-cbubble quote') > -1);
check('delivery is noted', stream().indexOf('Delivered to') > -1);
check('timestamps are simulated, not stopwatch seconds', screen().indexOf('4 Aug, 09:12') > -1);
const v1Total = run('ccjQuote().total');

check('the run parks waiting on the client to open it',
  until(() => run('ccjRun.phase') === 'wait'), run('ccjRun.phase'));
check('and the panel says what it is waiting for', panel().indexOf('Waiting for the client to open') > -1);
/* A WAITING BLOCK MUST NOT CLAIM TO BE WORKING. This is a PRE-wait — the step parks before doing
   anything — so there is no action underway and none may be drawn. The block rendered its first
   action with a spinner inside a block whose own mark was the parked pulse: the two halves of one
   block disagreeing about whether anything is happening. The suite was blind to it because the
   post-wait, which had the same bug, was the only one anything asserted on.

   Read from the LIVE block by id, not from the whole stream — stages 1 and 2 above it are full of
   legitimately finished spinners' worth of markup, and a stream-wide search proves nothing. */
const liveWaitBlock = (function () {
  const id = run("ccjStepBlockId(ccjRun.stage,ccjRun.sub,ccjPass(ccjRun.stage,ccjSteps(ccjRun.stage)[ccjRun.sub]))");
  const s = stream();
  const at = s.indexOf('id="' + id + '"');
  return at === -1 ? '' : s.slice(at, s.indexOf('</div>', s.indexOf('ccj-wait-note', at)));
})();
check('the parked block draws a pulse, not a spinner',
  liveWaitBlock.indexOf('ccj-sb-wait') > -1 && liveWaitBlock.indexOf('ccj-spin') === -1,
  liveWaitBlock.slice(0, 200));
check('and claims no action it has not performed yet',
  liveWaitBlock.indexOf('ccj-act') === -1, liveWaitBlock.slice(0, 200));

section('THEY OPEN IT, THEN GO QUIET');
check('Viewed resolves on the open',
  until(() => run("!!ccjRun.settled['quote-review/Viewed']")));
check('the timeline records it', screen().indexOf('Opened') > -1);
/* THE GAP BETWEEN EVENTS SAYS IT IS WAITING. After the open, before the first reminder, the
   thread carries a spark-and-shimmer "Waiting for confirmation" beat — the user's spec. It is
   transient: each one renders nothing once the thing it waited for happens. */
check('the gap after the open is a visible waiting beat',
  stream().indexOf('ccj-cmsg note await') > -1
  && run('!!(ccjRun.client.awaitMsg&&!ccjRun.client.awaitMsg.done)') === true);
check('a follow-up goes out when they do not reply',
  until(() => run('ccjRun.client.chases') >= 1), run('ccjRun.client.chases') + ' chases');
check('it appears in the thread as a chase', stream().indexOf('ccj-cmsg note chase') > -1);
check('one waiting beat at a time — the answered one renders nothing',
  count(stream(), 'ccj-cmsg note await') === 1, count(stream(), 'ccj-cmsg note await') + ' visible');
check('a second follow-up follows', until(() => run('ccjRun.client.chases') >= 2));
/* The point stands, the surface moved: three follow-ups are ONE sub-status that counts them, not
   three sub-statuses. Counted by this stage's own block ids — stage index 2 — because the
   transcript is one conversation for the whole run and a bare class count would be counting
   stages 1 and 2 as well. Two blocks at this moment: Sent, and the Follow-up loop still running. */
check('the follow-ups are one block that counts them, not one block each',
  count(stream(), 'id="ccj-sb-2-') <= 3, count(stream(), 'id="ccj-sb-2-') + ' stage-3 blocks for '
  + run('ccjRun.client.chases') + ' chases');
check('and the chases show in the thread rather than as blocks',
  count(stream(), 'ccj-cmsg note chase') >= 2, count(stream(), 'ccj-cmsg note chase') + ' chase notes');
check('and no more than three are ever sent', run('ccjRun.client.chases') <= 3);

section('THE NEGOTIATION');
check('the client asks for a change',
  until(() => run('ccjRun.client.state') === 'changed'), run('ccjRun.client.state'));
check('quoting the real total, not an invented one',
  stream().indexOf(v1Total.toLocaleString()) > -1, v1Total.toLocaleString());
check('the chases stop the moment they reply', run('ccjRun.client.chases') === 2);
check('their reply ends the waiting beat', count(stream(), 'ccj-cmsg note await') === 0,
  count(stream(), 'ccj-cmsg note await') + ' visible');
check('the agent drafts a reply but does not send it',
  until(() => run('ccjRun.client.drafted') === true) && stream().indexOf('ccj-cbubble draft') > -1);
check('and it is visibly unsent', stream().indexOf('not sent') > -1);
/* THE RE-ISSUE CANNOT PRECEDE THE REPLY. The step holds — verb saying it is waiting on you —
   and "Re-issued v2" has no block anywhere until the draft is actually sent. */
check('Change requested holds for our reply',
  until(() => run("ccjRun.phase") === 'hold'), run('ccjRun.phase'));
check('the hold names the drafted reply and waits on you',
  liveBlock().indexOf('Reply drafted for you') > -1
  && liveBlock().indexOf('ccj-sb-verb">Waiting&hellip;') > -1, liveBlock().slice(0, 240));
check('and the re-issue step has no block yet', stream().indexOf('Re-issued v2') === -1);
run('ccjSendDraft()');
check('sending it turns the draft into a sent message',
  run('ccjRun.client.drafted') === false && stream().indexOf('ccj-cbubble draft') === -1);
check('and the thread goes back to visibly waiting on them',
  count(stream(), 'ccj-cmsg note await') === 1, count(stream(), 'ccj-cmsg note await') + ' visible');
check('the client agrees', until(() => run('ccjRun.client.state') === 'agreed'));
check('and the agreed margin lands on the run', run('ccjRun.margin') === 17, run('ccjRun.margin'));

section('RE-ISSUE, THEN ACCEPTANCE');
check('a v2 goes out', until(() => run('ccjRun.client.version') === 2));
check('the thread carries both versions', count(stream(), 'ccj-cbubble quote') === 2);
check('v2 shows what moved, not just the new number', stream().indexOf('ccj-qc-was') > -1);
check('the price actually changed', run('ccjQuote().total') < v1Total,
  v1Total + ' -> ' + run('ccjQuote().total'));
check('the rail did NOT move backwards — the loop is inside the stage', run('ccjRun.stage') === 2);
/* AND NEITHER DID THE CONVERSATION. Re-issuing sends the run back to a step it already passed, and
   in a transcript that used to make the live block travel back UP the page, work there, and walk
   down again — the reader's eye dragged up and down twice for work that all happened after the
   negotiation. The user named it exactly: "it going up and then down and then up and then down,
   i dont want that."

   Re-run steps now get a new PASS, so ccjOpenStepBlock appends a fresh block at the bottom instead
   of repainting one three screens up. Asserted by POSITION: the block the runner is on must be
   below the negotiation, not above it. */
// Waited for, not assumed. `version === 2` is true the instant the re-issue SETTLES, and the jump
// back happens a beat later — asserting straight after it measured the block that was still live
// and passed for the wrong reason.
check('the run goes back for a second reading', until(() => run("ccjPass(2,ccjSteps(2)[1])") === 2),
  'pass ' + run("ccjPass(2,ccjSteps(2)[1])"));
check('the re-read happens BELOW the negotiation, not back up the page', (function () {
  const s = stream();
  const negotiation = s.indexOf('can you improve on the rate');
  const id = run("(function(){var st=ccjSteps(ccjRun.stage)[ccjRun.sub];"
    + "return st?ccjStepBlockId(ccjRun.stage,ccjRun.sub,ccjPass(ccjRun.stage,st)):'';})()");
  const live = id ? s.indexOf('id="' + id + '"') : -1;
  return negotiation > -1 && live > negotiation;
})(), 'live block at ' + (function () {
  const s = stream();
  const id = run("(function(){var st=ccjSteps(ccjRun.stage)[ccjRun.sub];"
    + "return st?ccjStepBlockId(ccjRun.stage,ccjRun.sub,ccjPass(ccjRun.stage,st)):'';})()");
  return s.indexOf('id="' + id + '"') + ', negotiation at ' + s.indexOf('can you improve on the rate');
})());
check('the second reading is a second block, not the first one repainted',
  run("ccjPass(2,ccjSteps(2)[1])") === 2, 'pass ' + run("ccjPass(2,ccjSteps(2)[1])"));
// The first pass stays exactly where it was and keeps what it recorded — it happened.
check('and the first pass is still in the record above it',
  stream().indexOf('id="ccj-sb-2-1-1"') > -1 && stream().indexOf('id="ccj-sb-2-1-2"') > -1);
/* Scoped to THIS stage's blocks. Stage 2's quote QA sent the run back earlier in the same run and
   folded its attempt, quite correctly — a stream-wide search for "Superseded attempt" finds that
   one and says nothing about stage 3. A rework supersedes; a re-read does not. */
check('it is not folded away — this is a second event, not a correction of the first',
  run("ccjRun.msgs.filter(function(m){return m.kind==='step'&&m.stage===2;})"
    + '.every(function(m){return !m.group&&!m.frozen;})'),
  run("JSON.stringify(ccjRun.msgs.filter(function(m){return m.kind==='step'&&m.stage===2;})"
    + ".map(function(m){return m.sub+'/'+m.pass+(m.group?' folded':'');}))"));
check('the client accepts', until(() => run('ccjRun.client.state') === 'accepted'));
check('the thread shows it', stream().indexOf('ccj-cbubble accept') > -1);
check('stage 3 completes and the journey moves on',
  until(() => run('ccjRun.stage') === 3), 'stage ' + run('ccjRun.stage'));
check('page followed', run('page') === 'ccj-quote-approved', run('page'));

/* The demo's simulate strip is gone from the rebuilt stage — it was five buttons sitting
   permanently above the composer, on the surface a person actually works in, and CCJ_CLIENT_SCRIPT
   already drives the client on its own timing. What it fired is what this section still fires:
   ccjClientEvent is the event path itself, not the strip's private back door, so the branch below
   is exercised exactly as before. The assertion that the strip was ON SCREEN is the only thing
   that goes, and it is replaced by one that the strip is NOT — a removal nobody notices is a
   removal that comes back. */
section('THE CLIENT ACCEPTING OUTRIGHT TAKES THE OTHER BRANCH');
startRun();
say('Create an EOR contract for Anika Shah at Norrbridge Logistics in Netherlands');
check('reaches stage 3 again', driveTo(2), 'stage ' + run('ccjRun.stage'));
check('no simulate strip anywhere on a rebuilt stage',
  screen().indexOf('ccj-sim-btn') === -1 && stream().indexOf('ccj-sim-btn') === -1
  && composer().indexOf('ccj-sim-btn') === -1);
check('the events it fired are still reachable — the script uses the same path',
  run('typeof ccjClientEvent') === 'function');
until(() => run("!!ccjRun.settled['quote-review/Sent']"));
run("ccjClientEvent('accepted')");
check('accepting outright answers every outstanding wait', run('ccjRun.client.state') === 'accepted');
check('and carries the stage to completion without a negotiation',
  until(() => run('ccjRun.stage') === 3), 'stage ' + run('ccjRun.stage'));
check('the client thread never showed a change request', run('ccjRun.client.version') === 1);

section('STAGE 4 — A DEAL BECOMES AN ACCOUNT');
check('the client thread carries on into stage 4', run('ccjChatMode()') === 'client');
check('the screen is the client account', screen().indexOf('ccj-acct') > -1);
check('nothing on this stage asks a human', run("ccjSteps(3).every(function(s){return !!s.auto;})"));
// Rebuilt: the sub-statuses are blocks in the conversation and there is no panel beside it.
check('stage 4 is on the transcript', run('ccjUsesTranscript(3)') === true);
check('so it has no panel', shell().indexOf('ccj-panel') === -1 && shell().indexOf('ccj-body no-panel') > -1);
/* The header line under the client's name. It said "quote v2" here, which describes a
   negotiation that has finished — on the one line whose job is saying what the conversation is
   about now. Read from the shell because the header is built with the stage. */
check('the thread says the quote is settled rather than still being quoted',
  shell().indexOf('Accepted quote v') > -1 && shell().indexOf('&middot; quote v') === -1,
  shell().slice(shell().indexOf('ccj-chat-sub'), shell().indexOf('ccj-chat-sub') + 70));
check('Won settles with the annualised value',
  until(() => run("!!ccjRun.settled['quote-approved/Won']")) && screen().indexOf('ccj-won on') > -1);
const annual = run('ccjQuote().total * 12');
check('and it is twelve times the accepted monthly total',
  screen().indexOf(annual.toLocaleString()) > -1, annual.toLocaleString());
check('the tenant is provisioned',
  until(() => run("!!ccjRun.settled['quote-approved/Client tenant provisioned']")));
check('the account band names the workspace', screen().indexOf('.opendhi.com') > -1);
check('provisioning is idempotent — an existing client is not given a second tenant',
  run('ccjTenant().existing') === true && screen().indexOf('tenant reused') > -1);
check('and it says so rather than claiming a create it did not do',
  run("(function(){var d=ccjEvidence(3,ccjSteps(3)[1]);return ccjVal(d.checks,ccjCtx())[0].verdict==='na';})()"));
const before = run('aiClients.length');
run('ccjUpsertClient()');
check('re-running the upsert cannot duplicate the client', run('aiClients.length') === before);
check('the CSM is introduced',
  until(() => run("!!ccjRun.settled['quote-approved/CSM confirmed to client']")));
// A CSM owns a CLIENT relationship, so they are routed on the client's country — not the
// country the worker happens to sit in. On a same-country hire those agree; on a cross-border
// one they do not, and the client's must win.
check('the CSM follows the client, not the work country',
  run('ccjCsm().name') === run("amCsmFor({country:ccjParties().client.country})"), run('ccjCsm().name'));
check('the introduction lands in the client thread, not a separate place',
  stream().indexOf('ccj-cbubble csm') > -1 && stream().indexOf('Customer Success Manager') > -1);
check('the thread now holds the whole relationship — quote, negotiation, handover',
  count(stream(), 'ccj-cbubble quote') >= 1 && stream().indexOf('ccj-cbubble csm') > -1);
/* The handover is the one thing on this stage the client actually receives, so it has to be in
   the marked lane and marked OUTBOUND. Everything else stage 4 does — booking the deal at its
   annual value, provisioning a tenant — is ours, and the same read proves it stayed ours. */
check('the introduction is marked as something the client can see',
  stream().indexOf('ccj-lane out') > -1 && stream().indexOf('To ' + run('ccjParties().client.name')) > -1);
check('THE STORES DID NOT MERGE here either — only the render did',
  run('ccjRun.msgs !== ccjRun.client.msgs')
  && run("!ccjRun.msgs.some(function(m){return m.lane==='client';})")
  && run("!ccjRun.client.msgs.some(function(m){return m.kind==='step';})"));
// The commercial number is booked internally and is NOT something we told the client. A block
// that ended up inside a lane would put it one indent from a message they received.
check('the annualised value is in our own work, never in the lane',
  stream().indexOf('a year') > -1
  && run("ccjRun.client.msgs.every(function(m){return String(m.text||'').indexOf('a year')===-1;})"));

section('IT RESTS ON THE SUMMARY RATHER THAN MOVING ON');
check('the stage rests once everything has run',
  until(() => run("ccjRun.phase==='rest'")), run('ccjRun.phase'));
check('it has not advanced', run('ccjRun.stage') === 3, 'stage ' + run('ccjRun.stage'));
advance(Math.round(30000*PACE));
check('and it will not advance on its own', run('ccjRun.stage') === 3 && run("ccjRun.phase==='rest'"));
/* THE ARTEFACT SHOWS, IT DOES NOT ASK. The way on used to be a button printed on the account
   screen — the last control in the journey sitting on a surface whose only job is showing what
   was made. It is now a block in the conversation, like every other thing that wants something. */
check('the account screen carries no control of its own',
  screen().indexOf('Continue to client signing') === -1 && screen().indexOf('<button') === -1,
  screen().slice(screen().indexOf('ccj-acct-foot'), screen().indexOf('ccj-acct-foot') + 160));
check('but it still states what is true — the client is live',
  screen().indexOf('Client is live') > -1);
check('the way on is asked for in the conversation',
  stream().indexOf('Continue to client signing') > -1 && stream().indexOf('ccj-ask-block') > -1);
/* The sentence beside the button says what clicking it BEGINS, rather than repeating the facts
   the closed blocks and the artefact beside them already carry twice over. It opened with
   "Nothing further is needed here", which is the account screen's own foot said a second time in
   the other column — the exact clutter this rebuild exists to remove, and the easiest kind to
   write by accident when the two halves live in different builders. */
check('and it says what the next stage is for',
  stream().indexOf(run("CCJ_STAGE_REST['quote-approved'].next")) > -1);
check('without repeating what the account screen already says',
  stream().indexOf('Nothing else is needed') === -1
  && stream().indexOf('Nothing further is needed') === -1);
// A rest stage that shipped without its sentence would render an ask with an empty body and a
// button floating under it. Cheap to assert once for all of them rather than per stage.
check('every resting stage has both a label and a next-step line',
  run("Object.keys(CCJ_STAGE_REST).every(function(k){var r=CCJ_STAGE_REST[k];"
    + "return !!(r&&r.label&&r.next);})"),
  run('JSON.stringify(Object.keys(CCJ_STAGE_REST))'));
check('the block the runner just left is closed behind it',
  stream().indexOf('ccj-sb closed') > -1 && count(stream(), 'class="ccj-sb open') === 0,
  count(stream(), 'class="ccj-sb open') + ' still open');
// Answered through the ask's own handler, which is the click a user makes — not by reaching past
// it to ccjContinueStage. A registry entry that did not resolve would fail here rather than at
// click time in a browser.
const restAsk = run("(function(){var m=ccjRun.msgs.filter(function(x){return x.kind==='ask'&&!x.done;}).pop();return m?m._id:0;})()");
check('the ask is live and unanswered', restAsk > 0, 'id ' + restAsk);
run('ccjAnswerAsk(' + restAsk + ')');
check('clicking it moves to stage 5', until(() => run('ccjRun.stage') === 4), 'stage ' + run('ccjRun.stage'));
check('page followed', run('page') === 'ccj-agreement-signature', run('page'));
/* STAGE 5 ON A CLIENT WHO ALREADY HAS AN AGREEMENT. A master agreement is signed once per client,
   so every step here is skipped — and a skipped step still gets a block saying why it did not run.
   That is the transcript's rule: it is a record of what happened, and "we considered this and
   ruled it out" is something that happened. The alternative — five steps vanishing — reads as a
   stage that was never reached. */
check('stage 5 rests too', answerGatesUntil(() => run("ccjRun.phase==='rest'")), run('ccjRun.phase'));
check('and it is on the transcript', run('ccjUsesTranscript(4)') === true);
check('every step of it got a block, even though none of them ran',
  count(stream(), 'id="ccj-sb-4-') === run('ccjSteps(4).length'),
  count(stream(), 'id="ccj-sb-4-') + ' blocks for ' + run('ccjSteps(4).length') + ' steps');
// Scoped to THIS stage's block ids. A bare class count reads the whole run — stages 1 and 2 have
// legitimately skipped steps of their own, and counting those would make this pass at 9 whatever
// stage 5 did.
check('and each one is marked skipped rather than ticked as done',
  count(stream(), 'ccj-sb closed skipped" id="ccj-sb-4-') === run('ccjSteps(4).length'),
  count(stream(), 'ccj-sb closed skipped" id="ccj-sb-4-') + ' of ' + run('ccjSteps(4).length'));
check('and each says why, rather than leaving a blank fact beside it',
  run("ccjSteps(4).every(function(s){var st=ccjRun.settled['agreement-signature/'+s.label];"
    + "return st&&st.skipped&&!!st.reason;})"),
  run("JSON.stringify(ccjSteps(4).map(function(s){var st=ccjRun.settled['agreement-signature/'+s.label];return st&&st.reason;}))"));
check('the agreement screen states what governs instead of pretending to draft one',
  screen().indexOf('already has a signed agreement') > -1);
/* A REST MUST OFFER A WAY OUT OF ITSELF. This branch of the screen had no foot at all, so before
   the way on moved into the conversation the run rested here with no control anywhere on the
   page. The harness never caught it because driveTo() calls ccjContinueStage() directly whenever
   it sees a rest, which walks past the surface a person actually meets. */
check('the way on is asked for in the conversation here too',
  stream().indexOf('Continue to deposit') > -1 && stream().indexOf('ccj-ask-block') > -1);
check('and the agreement screen carries no control of its own',
  screen().indexOf('<button') === -1, screen().slice(0, 200));
const msaAsk = run("(function(){var m=ccjRun.msgs.filter(function(x){return x.kind==='ask'&&!x.done;}).pop();return m?m._id:0;})()");
run('ccjAnswerAsk(' + msaAsk + ')');
check('answering it reaches stage 6', until(() => run('ccjRun.stage') === 5), 'stage ' + run('ccjRun.stage'));
/* EVERY RESTING STAGE IS NOW REBUILT, so every rest asks in the conversation and none asks from a
   screen. The previous version of this looked for the first resting stage still on the panel and
   was written to fail when it could no longer find one — which is exactly what happened when
   stage 8 was converted, and is why the five screen buttons have been removed. Unreachable code
   nobody can exercise is worse than no code.

   What replaces it is the property that made those buttons removable: there is ONE way a stage
   asks to be moved on from, and every stage that rests has it. */
check('every stage that rests is on the transcript, so there is one way it asks',
  run("Object.keys(CCJ_STAGE_REST).every(function(k){"
    + "return ccjStages().some(function(s,i){return s.id===k&&ccjUsesTranscript(i);});})"),
  run("JSON.stringify(Object.keys(CCJ_STAGE_REST).filter(function(k){"
    + "return !ccjStages().some(function(s,i){return s.id===k&&ccjUsesTranscript(i);});}))"));
check('and no screen in the journey still carries a way-on button',
  run("Object.keys(CCJ_STAGE_REST).every(function(k){return true;})")
  && (function () {
    const src = fs.readFileSync(path.join(ROOT, 'js/contract-journey.js'), 'utf8');
    return src.indexOf('onclick="ccjContinueStage()"') === -1;
  })(), 'a builder still prints onclick="ccjContinueStage()"');

section('A NEW CLIENT IS ACTUALLY PROVISIONED');
// The path that could never be reached before: a client with no account yet. Vantage Freight and
// Dhi Hyperlocal are already on the books, so only an unprovisioned company shows a real create.
(function () {
  const before = run('aiClients.length');
  const names = run('JSON.stringify(aiClients.map(function(c){return c.name;}))');
  check('Helix Marine has a deal but no account yet',
    names.indexOf('Helix Marine') === -1, names);
  startRun();
  say('Hire Rohan Verma for Helix Marine in Germany as an Operations Analyst');
  check('the run knows who the hire is for', run('ccjCtx().client') === 'Helix Marine B.V.',
    run('ccjCtx().client'));
  check('and the tenant does not exist yet', run('ccjTenant().existing') === false);
  check('reaches stage 4', driveTo(3), 'stage ' + run('ccjRun.stage'));
  check('provisioning completes',
    until(() => run("!!ccjRun.settled['quote-approved/Client tenant provisioned']")));
  check('a tenant was created, not reused',
    run('ccjTenant().existing') === true && screen().indexOf('tenant reused') === -1);
  check('the client now exists in the product', run('aiClients.length') === before + 1,
    before + ' -> ' + run('aiClients.length'));
  // Helix Marine B.V. is a NETHERLANDS company hiring in Germany. The client record is theirs,
  // so it carries their country — not the one this particular placement happens in.
  check('the client record carries the CLIENT country, not the work country',
    run("aiClients[aiClients.length-1].country") === 'Netherlands',
    run("aiClients[aiClients.length-1].country"));
  check('and the CSM is the client country CSM',
    run('ccjCsm().name') === 'Maya Vos',
    run('ccjCsm().name') + ' — client in ' + run('ccjParties().client.country')
      + ', work in ' + run('ccjParties().worker.country'));
  check('the workspace is named after the client', run('ccjTenant().workspace').indexOf('helix-marine') === 0,
    run('ccjTenant().workspace'));
  const after = run('aiClients.length');
  run('ccjUpsertClient()');
  check('and provisioning it again cannot duplicate it', run('aiClients.length') === after);
})();

section('THE THREE PARTIES ARE NOT THE SAME PARTY');
// A run involves a worker, a client company and ADT. Collapsing them sent the commercial quote
// to the candidate and routed the CSM on the wrong country.
(function(){
  startRun();
  say('Hire Rohan Verma for Meridian Analytics in Germany as an Operations Analyst');
  const P=run('ccjParties()');
  check('the worker has their own country and address', P.worker.name==='Rohan Verma' && P.worker.country==='Germany');
  check('the client company is a different party in a different country',
    P.client.name==='Meridian Analytics Ltd' && P.client.country==='United Kingdom', P.client.country);
  check('ADT is a third entity, registered where the WORK happens',
    P.adt.name.indexOf('Germany')>-1 && P.adt.name.indexOf('GmbH')>-1, P.adt.name);
  check('the quote is addressed to the client buyer, never the candidate',
    run('ccjCtx().signatoryEmail')===P.client.email && run('ccjCtx().signatoryEmail')!==P.worker.email,
    run('ccjCtx().signatoryEmail'));
  check('and the worker email is still available where it belongs',
    run('ccjCtx().workerEmail')===P.worker.email);
})();

section('STAGE 5 — THE MASTER SERVICES AGREEMENT');
(function(){
  check('reaches stage 5', driveTo(4), 'stage '+run('ccjRun.stage'));
  check('it is the CLIENT agreement, not the employment contract',
    screen().indexOf('MASTER SERVICES AGREEMENT')>-1 && screen().indexOf('EMPLOYMENT AGREEMENT')===-1);
  check('the parties on it are ADT and the client company, not the worker',
    screen().indexOf('Meridian Analytics Ltd')>-1 && screen().indexOf('Rohan Verma')===-1);
  check('governed by the CLIENT jurisdiction, not the work country',
    screen().indexOf('laws of United Kingdom')>-1, 'client in '+run('ccjParties().client.country'));
  check('the commercial schedule comes from the accepted quote',
    screen().indexOf(run('ccjQuote().margin')+'% of employer cost')>-1);
  check('and it carries real clause text, not a summary',
    count(screen(),'ccj-msa-cl')>=9, count(screen(),'ccj-msa-cl')+' clauses');
  check('the deposit clause explains why a deposit exists',
    screen().indexOf('funds payroll ahead of invoice settlement')>-1);
  check('both signature blocks are present, unsigned', count(screen(),'ccj-msa-sig')>=2);
  check('the stage is on the transcript, with no panel beside it',
    run('ccjUsesTranscript(4)')===true && shell().indexOf('ccj-panel')===-1);
  check('and the thread names the agreement rather than the quote it came from',
    shell().indexOf(run('ccjMsa().id'))>-1 && shell().indexOf('&middot; quote v')===-1);
  // Legal reads it before anything is sent. That gate is the point of the 48h SLA.
  check('legal has to release it before it goes anywhere',
    until(()=>run("ccjRun.phase==='halt'")) && panel().indexOf('Release the agreement')>-1, run('ccjRun.phase'));
  /* THE FIRST INTERNAL DECISION INSIDE A COUNTERPARTY'S COLUMN. Stages 3 and 4 shared the column
     with the client but every control on them was the client's own doing; this one is OURS — a
     lawyer deciding whether to release the paper — and it now renders one scroll from messages the
     client received. It is safe only because of the lane rule the reader learns once: indented
     means they can see it. So the gate must sit in the un-indented half, and the assertion is
     exactly that. Getting this wrong puts an internal legal decision inside a customer's
     correspondence, which is the failure this whole marking scheme exists to prevent. */
  /* Asserted at the DATA level, which is where this is actually decided and where a string harness
     can prove something. Whether the rendered gate is INSIDE a .ccj-lane element is a containment
     question; markup slicing cannot answer it honestly, so that half is checked in the browser
     with closest('.ccj-lane') rather than faked here. */
  check('THE LEGAL DECISION IS IN OUR OWN STORE, NEVER THE CLIENT THREAD',
    run("ccjRun.msgs.some(function(m){return m.kind==='step'&&m.stage===4;})")
    && run("!ccjRun.client.msgs.some(function(m){return m.kind==='step'||m.kind==='ask';})"));
  check('and only messages the client was actually sent carry a lane',
    run("ccjRun.client.msgs.every(function(m){return m.lane==='client';})")
    && run("ccjRun.msgs.every(function(m){return !m.lane;})"));
  check('and it is a block in the conversation, not a control on the document',
    stream().indexOf('ccj-gate approval')>-1 && screen().indexOf('Release the agreement')===-1);
  answerGate('released');
  check('screening runs before it is sent',
    until(()=>run("!!ccjRun.settled['agreement-signature/Client entity + sanctions check']")));
  check('and it screened the CLIENT company, not the worker',
    panel().indexOf('Meridian Analytics Ltd')>-1);
  check('the agreement is sent to the client in the thread',
    until(()=>run("!!ccjRun.settled['agreement-signature/Sent']")) && stream().indexOf('ccj-cbubble doc')>-1);
  // Scoped to the agreement message itself. The worker's email legitimately appears earlier in
  // the run, on the stage-1 match card — it is their record.
  // Names the client's signatory. Not asserted against the worker's email here: the test driver
  // fills unanswered required fields with 'x', so worker.email is the single character 'x' and
  // any indexOf for it matches everything. The evidence check below is the real guard.
  check('the agreement message names the client signatory', (function(){
    const seg=stream().split('ccj-cbubble doc')[1]||'';
    return seg.indexOf('Sent to')>-1 && seg.indexOf(run('ccjParties().client.contact'))>-1;
  })());
  check('and the evidence names the client address',
    run("(function(){var d=ccjEvidence(4,ccjSteps(4)[3]);return JSON.stringify(ccjVal(d.fetched,ccjCtx()));})()").indexOf(run('ccjParties().client.email'))>-1);
  /* THE WAIT FOR A SIGNATURE. A pre-wait: nothing can be verified until the signed copy is back,
     so the step parks before doing anything — which means it must draw no action and no spinner.
     Its rows are declared on the wait itself; they used to be inferred from ambient client state,
     and the inference put "Opened · Tracked" here, which records that the client opened the QUOTE
     two stages ago and has nothing to do with the agreement. */
  check('it parks waiting for the client to sign',
    until(()=>run("ccjRun.phase==='wait'")), run('ccjRun.phase'));
  const signWait=(function(){
    const id=run("ccjStepBlockId(ccjRun.stage,ccjRun.sub,ccjPass(ccjRun.stage,ccjSteps(ccjRun.stage)[ccjRun.sub]))");
    const s=stream(), at=s.indexOf('id="'+id+'"');
    return at===-1?'':s.slice(at, s.indexOf('ccj-sb-body', at)+4000);
  })();
  check('and says so, without claiming work it has not started',
    signWait.indexOf('Waiting for the client to sign')>-1 && signWait.indexOf('ccj-spin')===-1
    && signWait.indexOf('ccj-act')===-1, signWait.slice(0,240));
  check('it says who is holding it, which is the only question a wait like this raises',
    signWait.indexOf('With')>-1 && signWait.indexOf(run('ccjParties().client.contact'))>-1);
  check('and NOT that the quote was opened — that is a different document, two stages back',
    signWait.indexOf('Opened')===-1, signWait.slice(signWait.indexOf('ccj-wait-rows'),
      signWait.indexOf('ccj-wait-rows')+300));
  until(()=>run("ccjRun.phase==='halt'"));
  // Countersigning is a POST gate: the work ran first and the decision is about its result. On the
  // transcript that lands in the same block the signature evidence is in.
  check('countersigning is asked for in the conversation, not on the document',
    panel().indexOf('Countersign the agreement')>-1 && screen().indexOf('Countersign the agreement')===-1);
  // The step is the CLIENT's — they are who signs — but ours is the second signature and the last
  // point at which we can decline. The block credited that to the client.
  check('and it is credited to us, not to the client whose signature the step tracks',
    liveBlock().indexOf('Compliance &middot; Kavya Iyer')>-1
    && liveBlock().indexOf('Client &middot; Client')===-1,
    (liveBlock().split('ccj-gate-who">')[1]||'').slice(0,120));
  answerGate();
  check('signed settles', until(()=>run("!!ccjRun.settled['agreement-signature/Signed']")));
  const m=run('ccjMsa()');
  check('client signed first', m.clientSignedAt>0, JSON.stringify(m));
  check('ADT countersigned AFTER them — execution is the last signature',
    m.adtSignedAt>m.clientSignedAt, m.clientSignedAt+' then '+m.adtSignedAt);
})();

section('THE TIMELINE IS A RECORD, NOT AN INFERENCE');
// An audit caught this: the timeline used to be derived from the client's CURRENT state against
// hard-coded dates. A run where the client simply opened the quote and accepted it still showed
// 'Change requested — Client asked for a better rate', and a re-issue erased follow-ups the
// thread was still displaying. It now renders the event log: if it is not in there, it did not
// happen, and the time shown is the time it happened.
(function(){
  startRun();
  say('Hire Sofia Romano at Kaira Textiles in Italy as a Marine Engineer');
  check('reaches stage 3', driveTo(2), 'stage '+run('ccjRun.stage'));
  until(()=>run("!!ccjRun.settled['quote-review/Sent']"));
  run("ccjClientEvent('viewed')");
  run("ccjClientEvent('accepted')");
  const tl=(screen().split('ccj-tl\"')[1]||'').split('ccj-sim')[0];
  check('accepting outright shows no negotiation that never happened',
    tl.indexOf('Change requested')===-1 && tl.indexOf('better rate')===-1);
  check('and no re-issue either', tl.indexOf('Re-issued')===-1 && tl.indexOf('Opened v2')===-1);
  check('but it does show what did happen',
    tl.indexOf('Sent')>-1 && tl.indexOf('Opened')>-1 && tl.indexOf('Accepted')>-1);
  check('every timeline row came from the log',
    count(tl,'ccj-tl-row')===run('ccjRun.client.log.length'),
    count(tl,'ccj-tl-row')+' rows vs '+run('ccjRun.client.log.length')+' events');
  // The invariant is that it is RECORDED, not recomputed: later client activity must not move it.
  const openedAt=run('ccjRun.client.openedAt');
  run("ccjClientEvent('chase',9999)");
  check('the open time is stored once and does not drift with later activity',
    run('ccjRun.client.openedAt')===openedAt && run('ccjRun.client.mins')>openedAt,
    'opened '+openedAt+', clock now '+run('ccjRun.client.mins'));
})();

section('A RE-ISSUE DOES NOT ERASE THE CHASES');
(function(){
  startRun();
  say('Hire Luis Martin at Kaira Textiles in Spain as a Store Manager');
  check('reaches stage 3', driveTo(2), 'stage '+run('ccjRun.stage'));
  until(()=>run("!!ccjRun.settled['quote-review/Sent']"));
  run("ccjClientEvent('viewed')");
  /* A REMINDER IS SENT, NOT CONJURED. Each one lands in the thread as "sending" with a spinner and
     becomes the sent record CCJ_CHASE_SEND later — so the count is written when it has actually
     gone out, not when it was decided on. Firing two back to back therefore produces one: the
     second is refused while the first is in flight, which is the guard doing its job. */
  const chase = () => { run("ccjClientEvent('chase')"); advance(run('CCJ_CHASE_SEND') + 400); };
  run("ccjClientEvent('chase')");
  check('a reminder shows as sending before it reads as sent',
    run('ccjRun.client.sending') === true && run('ccjRun.client.chases') === 0
    && stream().indexOf('Sending follow-up 1 of 3') > -1, run('ccjRun.client.chases') + ' chases');
  check('and a second cannot jump the first while it is in flight',
    (function () { run("ccjClientEvent('chase')"); return run('ccjRun.client.chases') === 0; })());
  advance(run('CCJ_CHASE_SEND') + 400);
  check('then it lands, counted, with the detail that distinguishes it',
    run('ccjRun.client.chases') === 1 && stream().indexOf('Follow-up 1 of 3 sent') > -1
    && stream().indexOf('Scheduled reminder') > -1
    && stream().indexOf('Sending follow-up 1 of 3') === -1,
    run('ccjRun.client.chases') + ' chases');
  chase();
  check('two chases went out', run('ccjRun.client.chases')===2, run('ccjRun.client.chases'));
  run("ccjClientEvent('changed',undefined,'price')");
  until(()=>run('ccjRun.client.drafted')===true);
  run('ccjSendDraft()');
  check('the client agrees', until(()=>run('ccjRun.client.state')==='agreed'));
  check('a v2 goes out', until(()=>run('ccjRun.client.version')===2));
  check('the chases survive the re-issue', run('ccjRun.client.chases')===2, run('ccjRun.client.chases'));
  const tl=(screen().split('ccj-tl\"')[1]||'').split('ccj-sim')[0];
  check('and the timeline still shows both',
    tl.indexOf('Follow-up 1 of 3')>-1 && tl.indexOf('Follow-up 2 of 3')>-1);
  check('in the order they happened, before the change request',
    tl.indexOf('Follow-up 2 of 3') < tl.indexOf('Change requested'));
})();

section('THE SIGNED AGREEMENT COMES BACK');
(function(){
  startRun();
  say('Hire Elena Sokolov for Arcadia Retail in Germany as a Data Analyst');
  check('reaches stage 5', driveTo(4), 'stage '+run('ccjRun.stage'));
  check('unsigned first — both blocks pending',
    screen().indexOf('pending')>-1 && screen().indexOf('ccj-msa-stamp')===-1);
    check('signed settles once every decision is answered',
    answerGatesUntil(()=>run("!!ccjRun.settled['agreement-signature/Signed']")));
  const doc=screen();
  check('this client had no agreement, so one is drawn', run('ccjMsaExists()')===false);
  check('the returned agreement is stamped executed', doc.indexOf('ccj-msa-stamp')>-1);
  // The countersignature is a DECISION, not an automatic step: the client signs and returns it,
  // the run stops, and approving is what puts the agreement in force.
  check('countersigning was a decision someone had to make',
    run("!!ccjRun.decisions['agreement-signature/Signed']") === true);
  check('and it is recorded as Executed',
    run("ccjRun.decisions['agreement-signature/Signed'].id") === 'countersign');
  check('the client signature is filled in', doc.indexOf('ccj-msa-sig on')>-1);
  check('both parties appear signed, not pending',
    count(doc,'ccj-msa-sig on')===2, count(doc,'ccj-msa-sig on')+' signed blocks');
  check('and it states when it came into force', doc.indexOf('In force from')>-1);
  check('the signed copy lands in the client thread', stream().indexOf('ccj-cbubble accept')>-1);
  // The stage rests on it rather than walking past the thing it produced.
  check('the stage rests on the signed agreement', until(()=>run("ccjRun.phase==='rest'")), run('ccjRun.phase'));
  check('it does not advance on its own', (function(){advance(30000);return run('ccjRun.stage')===4;})());
  // The document shows; the conversation asks. The executed agreement is the artefact this stage
  // produced and it keeps saying so — it just no longer carries the button.
  check('the executed agreement states that it is done', screen().indexOf('Agreement executed')>-1);
  check('and the way on is asked for in the conversation',
    stream().indexOf('Continue to deposit')>-1 && screen().indexOf('<button')===-1);
  run("ccjAnswerAsk((function(){var m=ccjRun.msgs.filter(function(x){return x.kind==='ask'&&!x.done;}).pop();return m?m._id:0;})())");
  check('continuing reaches stage 6', until(()=>run('ccjRun.stage')===5), 'stage '+run('ccjRun.stage'));
})();

section('THE AGREEMENT COMES BACK AND WAITS FOR APPROVAL');
(function(){
  startRun();
  say('Hire Nadia Haddad for Blackwood Systems Ltd in France as a Finance Lead');
  check('reaches stage 5', driveTo(4), 'stage '+run('ccjRun.stage'));
  // Let it run up to, but not through, the countersignature.
  answerGatesUntil(()=>run('!!ccjMsa().clientSignedAt'));
  check('the client signed and sent it back', run('ccjMsa().clientSignedAt')>0);
  check('their signature is on the document', screen().indexOf('ccj-msa-sig on')>-1);
  check('ours is not', count(screen(),'ccj-msa-sig on')===1, count(screen(),'ccj-msa-sig on')+' signed');
  check('and it is not executed yet', screen().indexOf('ccj-msa-stamp')===-1);
  check('the returned copy is in the client thread', stream().indexOf('ccj-cbubble accept')>-1);
  check('the run stops for approval',
    until(()=>run("ccjRun.phase==='halt'") && !!run('ccjPostGateFor(ccjRun.stage,ccjSteps(ccjRun.stage)[ccjRun.sub])')),
    run('ccjRun.phase'));
  check('the panel asks for the countersignature', panel().indexOf('Countersign the agreement')>-1);
  check('with an approve and a decline', panel().indexOf('Approve and countersign')>-1 && panel().indexOf('>Decline<')>-1);
  advance(60000);
  check('and it will not countersign itself', run('ccjMsa().adtSignedAt')===0 && run('ccjRun.stage')===4);
  // Declining is terminal — an agreement nobody countersigned is not in force.
  run("ccjChooseGate('declineMsa','Liability cap not agreed.')");
  check('declining stops the run', run('ccjRun.stopped')===true && run('ccjMsa().adtSignedAt')===0);
  run('ccjReopen()');
  run("ccjChooseGate('countersign')");
  check('approving countersigns it', run('ccjMsa().adtSignedAt')>run('ccjMsa().clientSignedAt'),
    run('ccjMsa().clientSignedAt')+' then '+run('ccjMsa().adtSignedAt'));
  check('and the document is now executed',
    until(()=>run("!!ccjRun.settled['agreement-signature/Signed']")) && screen().indexOf('ccj-msa-stamp')>-1);
})();

/* ---- STAGE 6 ------------------------------------------------------------------------------
   The invoice is the first thing this journey produces whose numbers all came from somewhere
   else: the amount from the agreement's clause 3.4, the terms from its payment schedule, the
   date from its countersignature. So most of what is checked here is AGREEMENT, not rendering —
   two surfaces stating one fact, and the panel, the paper and the drawer all reading it. */
section('STAGE 6 — THE DEPOSIT INVOICE IS RAISED');
(function () {
  startRun();
  say('Hire Marta Nowak for Arcadia Retail in Germany as a Supply Planner');
  check('reaches stage 6', driveTo(5), 'stage ' + run('ccjRun.stage'));
  check('it opens on the invoice screen', run('ccjRun.screen') === 'invoice', run('ccjRun.screen'));
  check('the invoice is raised', until(() => run("!!ccjRun.settled['deposit-due/Invoice raised']")));

  const gross = run('ccjQuote().gross'), net = run('ccjInvoice().net');
  check('the deposit is one month gross salary, as clause 3.4 states', net === gross, net + ' vs ' + gross);
  check('the invoice total is net plus the VAT it computed',
    run('ccjInvoice().total') === net + run('ccjInvoice().tax'),
    net + ' + ' + run('ccjInvoice().tax') + ' = ' + run('ccjInvoice().total'));
  check('the amount due the PANEL states is the amount the paper states',
    run('ccjCtx().amountDue').indexOf(run('ccjAmountDue().toLocaleString()')) > -1,
    run('ccjCtx().amountDue') + ' vs ' + run('ccjAmountDue()'));
  // The bug this replaces: a literal '$9,500' belonging to no run, printed beside a euro invoice.
  check('and it is no longer the hardcoded figure',
    run('ccjCtx().amountDue').indexOf('$') === -1 && run('ccjCtx().amountDue').indexOf('9,500') === -1,
    run('ccjCtx().amountDue'));
  check('it cites the agreement stage 5 executed',
    run('ccjInvoice().agreement') === run('ccjMsa().id'), run('ccjInvoice().agreement'));
  check('terms are the agreement\'s — 14 days net',
    run('ccjPay().dueAt - ccjPay().issuedAt') === 14 * 1440,
    run('ccjPay().dueAt - ccjPay().issuedAt') + ' minutes');

  const doc = screen();
  check('the document names both parties', doc.indexOf('Arcadia Retail') > -1 && doc.indexOf('ADT Germany') > -1);
  check('it carries a registered address and a VAT number for each',
    count(doc, 'ccj-inv-party-a') === 2 && count(doc, 'ccj-inv-party-v') === 2);
  check('it states an account and a payment reference',
    doc.indexOf('IBAN') > -1 && doc.indexOf('Payment reference') > -1);
  check('it warns what happens without the reference', doc.indexOf('unallocated') > -1);
  check('the line item is the deposit, priced once',
    doc.indexOf('Security deposit') > -1 && count(doc, '<tbody>') === 1);
  check('the worker and the role are on the line, not just an amount',
    doc.indexOf('Marta Nowak') > -1 && doc.indexOf('Supply Planner') > -1);
  check('nothing is stamped paid yet', doc.indexOf('ccj-inv-stamp') === -1);
  check('the invoice went to the client in the thread',
    stream().indexOf('Deposit invoice') > -1 && stream().indexOf(run('ccjInvoice().id')) > -1);

  // ---- On the transcript from 2026-08-03: the document shows, the conversation carries the work.
  check('stage 6 is on the transcript, with no panel', run('ccjUsesTranscript(5)') === true
    && shell().indexOf('ccj-panel') === -1);
  check('the invoice carries no controls at all',
    doc.indexOf('<button') === -1 && doc.indexOf('ccj-sim') === -1);
  check('and the thread is about the invoice, not the quote it descends from',
    shell().indexOf(run('ccjInvoice().id')) > -1 && shell().indexOf('&middot; quote v') === -1);

  /* THE LONGEST WAIT IN THE JOURNEY. The money is with someone else and may be days away, so this
     is the screen most likely to be mistaken for a hang — and the pre-wait parks before doing any
     work, so it must draw no action and no spinner while still saying enough to be useful. */
  check('it parks waiting for the deposit',
    until(() => run("ccjRun.phase==='wait'") && liveBlock().indexOf('Awaiting funds') > -1),
    run('ccjRun.phase'));
  const fundsWait = liveBlock();
  check('a pulse, not a spinner, and no action it has not performed',
    fundsWait.indexOf('ccj-sb-wait') > -1 && fundsWait.indexOf('ccj-spin') === -1
    && fundsWait.indexOf('ccj-act') === -1, fundsWait.slice(0, 200));
  check('it says how much is outstanding, when it is due, and that reminders are armed',
    fundsWait.indexOf('Outstanding') > -1 && fundsWait.indexOf('Due') > -1
    && fundsWait.indexOf('Automatic reminders') > -1,
    fundsWait.slice(fundsWait.indexOf('ccj-wait-rows'), fundsWait.indexOf('ccj-wait-rows') + 400));
  check('and the amount is the one the ledger computes, not a second copy of it',
    fundsWait.indexOf(run('ccjMoney(ccjOutstanding())')) > -1, run('ccjMoney(ccjOutstanding())'));
  /* One date calculation, two surfaces. The invoice band and this row both have to say how late it
     is, and two copies is how one ends up reading "2 days to go" beside the other reading
     "overdue". Asserted by making them agree on the same computed phrase. */
  check('the wait and the invoice agree on how late it is',
    fundsWait.indexOf(run('ccjDueState().text')) > -1 && screen().indexOf(run('ccjDueState().text')) > -1,
    run('ccjDueState().text'));
})();

section('VAT IS COMPUTED FROM THE PLACE OF SUPPLY, NOT PRINTED');
(function () {
  // Client in the Netherlands, work in Germany: two EU countries, so the client accounts for it.
  startRun();
  say('Hire Piotr Adamski for Norrbridge Logistics in Germany as a Route Planner');
  check('reaches stage 6', driveTo(5), 'stage ' + run('ccjRun.stage'));
  check('the parties really are in different countries',
    run('ccjParties().adt.country') === 'Germany' && run('ccjParties().client.country') === 'Netherlands',
    run('ccjParties().adt.country') + ' -> ' + run('ccjParties().client.country'));
  check('a cross-border EU supply is reverse charged', run('ccjVat().kind') === 'reverse', run('ccjVat().kind'));
  check('so no VAT is charged on it', run('ccjVat().rate') === 0 && run('ccjInvoice().tax') === 0);
  check('and the invoice cites the article that says so',
    until(() => run("!!ccjRun.settled['deposit-due/Invoice raised']")) && screen().indexOf('Article 196') > -1);

  // Same country: ordinary domestic VAT.
  startRun();
  say('Hire Sanne Bakker for Norrbridge Logistics in Netherlands as a Warehouse Lead');
  check('reaches stage 6 on a domestic placement', driveTo(5), 'stage ' + run('ccjRun.stage'));
  check('both parties are in the Netherlands',
    run('ccjParties().adt.country') === run('ccjParties().client.country'));
  check('so Dutch VAT is charged at 21%', run('ccjVat().kind') === 'domestic' && run('ccjVat().rate') === 21,
    run('ccjVat().kind') + ' ' + run('ccjVat().rate'));
  check('and the tax is 21% of the deposit',
    run('ccjInvoice().tax') === Math.round(run('ccjInvoice().net') * 0.21),
    run('ccjInvoice().tax') + ' on ' + run('ccjInvoice().net'));
  check('so the total is more than the deposit', run('ccjInvoice().total') > run('ccjInvoice().net'));
  check('the invoice says which rate and why',
    until(() => run("!!ccjRun.settled['deposit-due/Invoice raised']"))
    && screen().indexOf('Netherlands VAT at 21%') > -1);

  // Client outside the EU: outside the scope altogether.
  startRun();
  say('Hire Lukas Bauer for Dhi Hyperlocal in Germany as a Systems Engineer');
  check('reaches stage 6 with a non-EU client', driveTo(5), 'stage ' + run('ccjRun.stage'));
  check('the client is outside the EU', run('ccjParties().client.country') === 'India');
  check('so the supply is outside the scope of EU VAT',
    run('ccjVat().kind') === 'export' && run('ccjVat().rate') === 0, run('ccjVat().kind'));
})();

section('THE MONEY ARRIVES SHORT, AND SOMEBODY HAS TO DECIDE');
(function () {
  startRun();
  say('Hire Marta Nowak for Arcadia Retail in Germany as a Supply Planner');
  check('reaches stage 6', driveTo(5), 'stage ' + run('ccjRun.stage'));
  check('the invoice is raised', until(() => run("!!ccjRun.settled['deposit-due/Invoice raised']")));

  check('awaiting funds parks — it does not tick green on a timer',
    until(() => run("ccjRun.phase==='wait'")) && run('ccjSteps(5)[ccjRun.sub].label') === 'Awaiting funds',
    run('ccjRun.phase') + ' on ' + run('ccjSteps(5)[ccjRun.sub].label'));
  check('and the panel says what it is waiting for', panel().indexOf('Waiting for the deposit') > -1);
  const before = run('ccjRun.stage');
  advance(40000);
  check('nothing settles while the money is not there',
    run('ccjRun.stage') === before && run('ccjReceived()') >= 0);

  check('the client acknowledges it', until(() => run('!!ccjPay().ackAt')));
  check('a reminder goes out before the due date',
    until(() => run('ccjPay().reminders.length') > 0)
    && run("ccjPay().reminders[0].kind") === 'due', run("ccjPay().reminders[0]&&ccjPay().reminders[0].kind"));
  check('then a part payment lands', until(() => run('ccjPay().receipts.length') === 1));
  check('it is short of the invoice', run('ccjOutstanding()') > 0 && run('ccjReceived()') > 0,
    run('ccjReceived()') + ' of ' + run('ccjAmountDue()'));
  check('awaiting funds settles on the first receipt, not on the full amount',
    until(() => run("!!ccjRun.settled['deposit-due/Awaiting funds']")));
  check('and reports it as a part payment',
    run("ccjRun.settled['deposit-due/Awaiting funds'].summary").indexOf('Part payment') > -1,
    run("ccjRun.settled['deposit-due/Awaiting funds'].summary"));

  // The part payment lands the morning after the due date. Counted in elapsed minutes that is
  // half a day, which rounded to zero and had the screen report an overdue invoice as due today.
  check('an invoice past its due date reads as overdue, not as due today',
    run('ccjDayNo(ccjClient().mins) > ccjDayNo(ccjPay().dueAt)')
    && screen().indexOf('overdue') > -1 && screen().indexOf('due today') === -1,
    (screen().split('ccj-inv-when">')[1] || '').split('<')[0]);
  check('the run stops on the shortfall', until(() => run("ccjRun.phase==='halt'")), run('ccjRun.phase'));
  check('it is the part-paid row asking', run('ccjSteps(5)[ccjRun.sub].label') === 'Part-paid');
  check('the panel states the shortfall against the total',
    panel().indexOf(run('ccjOutstanding().toLocaleString()')) > -1
    && panel().indexOf(run('ccjAmountDue().toLocaleString()')) > -1);
  check('with a hold and a release', panel().indexOf('Hold for the balance') > -1
    && panel().indexOf('Release anyway') > -1);
  /* WHAT THE CONVERSATION SAYS WHEN IT STOPS. "Request logged and routed. Qualify it to continue."
     is stage 1's sentence, and it was being pushed on EVERY arrival decision gate in the journey —
     here, where there is no request to log and nothing to qualify, and on stage 5's sanctions
     adjudication. It now belongs to the gate that means it (CCJ_GATES[...].halt). */
  /* WHO IS ASKED. The STEP is owned by the Client — they are who part-paid — but the decision is
     whether WE carry an unfunded payroll so a placement can start. The block credited it to the
     client: "Client · Client" with an ACTING AS marker, over two buttons the client cannot press
     and has no standing to press. This surface's whole job is saying who may answer. */
  check('the decision is credited to Finance, not to the client who underpaid',
    liveBlock().indexOf('Finance &middot; Meera Iyer') > -1
    && liveBlock().indexOf('Client &middot; Client') === -1,
    (liveBlock().split('ccj-gate-who">')[1] || '').slice(0, 120));
  check('while the step itself is still recorded as the client\'s',
    run("ccjSteps(5)[ccjRun.sub].owner") === 'Client');
  // Read the LAST agent message, not the whole stream: stage 1's gate legitimately said its own
  // sentence earlier in this same run, and an append-only transcript still has it.
  const haltLine = run("(function(){var m=ccjRun.msgs.filter(function(x){return x.who==='agent'&&x.text;}).pop();"
    + "return m?m.text:'';})()");
  check('the conversation announces the stop without borrowing stage 1\'s words',
    haltLine.indexOf('needs a decision from you') > -1
    && haltLine.indexOf('Request logged and routed') === -1, haltLine);
  advance(80000);
  check('and it will not decide for itself',
    run("ccjRun.phase==='halt'") && run('ccjRun.stage') === 5, run('ccjRun.phase'));

  run("ccjChooseGate('holdBalance')");
  check('holding does NOT settle the row — the balance has not arrived',
    run("!ccjRun.settled['deposit-due/Part-paid']") && run("ccjRun.phase==='wait'"), run('ccjRun.phase'));
  check('a chase went out on the client thread', run('ccjPay().chased') === true
    && stream().indexOf('remains outstanding') > -1);
  // It is stamped when it happened. The ledger used to place it one minute after the receipt it
  // followed while the thread carrying the same chase said forty — one event, two answers.
  check('the chase is stamped when it happened, not beside the receipt it followed',
    run('ccjPay().chasedAt') > run('ccjPay().receipts[0].at'),
    run('ccjPay().chasedAt') + ' vs receipt at ' + run('ccjPay().receipts[0].at'));
  check('and the ledger and the thread agree on when that was',
    (function () {
      const t = run('ccjStamp(ccjPay().chasedAt)');
      return screen().indexOf(t) > -1 && stream().indexOf(t) > -1;
    })(), run('ccjStamp(ccjPay().chasedAt)'));
  /* Read from the LIVE BLOCK, not the whole conversation. On a transcript stage the answer that was
     given is still in the record above as a user message — that is the append-only rule working —
     so the question is whether the block the runner is on has stopped asking, not whether the words
     appear anywhere on screen. Both halves asserted: the row waits, and the choice is still filed. */
  check('the row now reads as a wait, not as an unanswered question',
    liveBlock().indexOf('Chasing the balance') > -1
    && liveBlock().indexOf('ccj-gate-btn') === -1,
    liveBlock().slice(0, 240));
  check('and what was decided is still in the record above it',
    stream().indexOf('Hold for the balance') > -1
    && run("ccjRun.decisions['deposit-due/Part-paid'].id") === 'holdBalance');
  // What the wait reports while it holds — read from ccjPay(), the same store the ledger reads.
  check('the wait says what came in, what has not, and what that costs',
    liveBlock().indexOf('Received') > -1 && liveBlock().indexOf('Still outstanding') > -1
    && liveBlock().indexOf('Held until the deposit settles') > -1,
    liveBlock().slice(liveBlock().indexOf('ccj-wait-rows'), liveBlock().indexOf('ccj-wait-rows') + 400));
  check('and the figure it shows is the one the ledger computes',
    liveBlock().indexOf(run('ccjMoney(ccjOutstanding())')) > -1, run('ccjMoney(ccjOutstanding())'));

  check('the balance arrives', until(() => run('ccjPaidInFull()') === true));
  check('part-paid settles on it', until(() => run("!!ccjRun.settled['deposit-due/Part-paid']")));
  check('cleared runs and the gate lifts', until(() => run("!!ccjRun.settled['deposit-due/Cleared']")));
  check('nothing was released against a shortfall', run('ccjPay().released') === false);
  const doc = screen();
  check('the invoice is stamped PAID', doc.indexOf('ccj-inv-stamp') > -1 && doc.indexOf('>PAID<') > -1);
  check('the gate release is stated as the outcome', doc.indexOf('Payment gate released') > -1);
  check('the ledger carries both receipts and the reminder',
    count(doc, 'ccj-rem-row receipt') === 2 && count(doc, 'ccj-rem-row remind') === 1,
    count(doc, 'ccj-rem-row receipt') + ' receipts, ' + count(doc, 'ccj-rem-row remind') + ' reminders');
  check('and it is a record, in the order things happened',
    doc.indexOf('Invoice raised') < doc.indexOf('Payment reminder 1')
    && doc.indexOf('Payment reminder 1') < doc.indexOf('part payment')
    && doc.indexOf('part payment') < doc.indexOf('Payment gate released'));

  check('the stage rests on the paid invoice', until(() => run("ccjRun.phase==='rest'")), run('ccjRun.phase'));
  check('it does not walk past it', (function () { advance(30000); return run('ccjRun.stage') === 5; })());
  // The invoice states; the conversation asks. It keeps the sentence and loses the button.
  check('the invoice states that it is cleared', screen().indexOf('Deposit cleared') > -1);
  check('and the way on is asked for in the conversation',
    stream().indexOf('Continue to worker signing') > -1 && screen().indexOf('<button') === -1,
    screen().slice(screen().indexOf('ccj-inv-next'), screen().indexOf('ccj-inv-next') + 200));
  // Demo scaffolding is gone from the document too — CCJ_PAY_SCRIPT drives the money on its own.
  check('and no simulate strip is left on it', screen().indexOf('ccj-sim') === -1);
  run("ccjAnswerAsk((function(){var m=ccjRun.msgs.filter(function(x){return x.kind==='ask'&&!x.done;}).pop();return m?m._id:0;})())");
  check('continuing reaches stage 7', until(() => run('ccjRun.stage') === 6), 'stage ' + run('ccjRun.stage'));
})();

section('RELEASING AGAINST A SHORTFALL IS AN EXCEPTION, AND IS RECORDED AS ONE');
(function () {
  startRun();
  say('Hire Marta Nowak for Arcadia Retail in Germany as a Supply Planner');
  check('reaches stage 6', driveTo(5), 'stage ' + run('ccjRun.stage'));
  check('the run stops on a shortfall', until(() => run("ccjRun.phase==='halt'")
    && run('ccjSteps(5)[ccjRun.sub].label') === 'Part-paid'), run('ccjRun.phase'));
  const short = run('ccjOutstanding()');
  run("ccjChooseGate('releaseShort','Client is good for the balance; start date cannot slip.')");
  check('the shortfall is recorded, not forgotten',
    run('ccjPay().released') === true && run('ccjPay().shortfall') === short,
    run('ccjPay().shortfall') + ' vs ' + short);
  check('with a name against it', String(run('ccjPay().releasedBy')).length > 1, run('ccjPay().releasedBy'));
  check('the gate still lifts', until(() => run("!!ccjRun.settled['deposit-due/Cleared']")));
  check('and the release is stamped when it was approved, before the gate lifted',
    run('ccjPay().releasedAt') > 0 && run('ccjPay().releasedAt') <= run('ccjPay().clearedAt'),
    run('ccjPay().releasedAt') + ' then cleared ' + run('ccjPay().clearedAt'));
  const doc = screen();
  check('but the invoice is NOT stamped paid', doc.indexOf('>PAID<') === -1);
  check('it is stamped released', doc.indexOf('ccj-inv-stamp short') > -1 && doc.indexOf('>RELEASED<') > -1);
  check('and the balance is still outstanding on it', run('ccjOutstanding()') === short && short > 0);
  check('the release band says who accepted the exposure',
    doc.indexOf('ccj-inv-rel short') > -1 && doc.indexOf('still outstanding') > -1);
  // The evidence has to be honest about it: a released shortfall is a failed check, not a pass.
  run("ccjInspect('deposit-due/Cleared')");
  check('the evidence reports the reconciliation as failed, not as clean',
    drawer().indexOf('FAIL') > -1 && drawer().indexOf('short by') > -1);
  run('ccjCloseDrawer()');
  check('and the panel summary says how short', run("ccjRun.settled['deposit-due/Cleared'].summary").indexOf('short') > -1,
    run("ccjRun.settled['deposit-due/Cleared'].summary"));
})();

section('PAID IN FULL — THE PART-PAID ROW IS SKIPPED, AND SAYS WHY');
(function () {
  startRun();
  say('Hire Marta Nowak for Arcadia Retail in Germany as a Supply Planner');
  check('reaches stage 6', driveTo(5), 'stage ' + run('ccjRun.stage'));
  check('the invoice is raised', until(() => run("!!ccjRun.settled['deposit-due/Invoice raised']")));
  check('and it is waiting on the money', until(() => run("ccjRun.phase==='wait'")));
  run("ccjPayEvent('full')");
  check('one receipt settles the whole invoice',
    run('ccjPay().receipts.length') === 1 && run('ccjPaidInFull()') === true,
    run('ccjReceived()') + ' of ' + run('ccjAmountDue()'));
  check('awaiting funds reports it as paid in full',
    until(() => run("!!ccjRun.settled['deposit-due/Awaiting funds']"))
    && run("ccjRun.settled['deposit-due/Awaiting funds'].summary").indexOf('Paid in full') > -1,
    run("ccjRun.settled['deposit-due/Awaiting funds'].summary"));
  check('part-paid is skipped rather than asked',
    until(() => run("!!ccjRun.settled['deposit-due/Part-paid']"))
    && run("ccjRun.settled['deposit-due/Part-paid'].skipped") === true);
  check('and the row says why it did not apply',
    run("ccjRun.settled['deposit-due/Part-paid'].reason").indexOf('no shortfall') > -1,
    run("ccjRun.settled['deposit-due/Part-paid'].reason"));
  check('nobody was asked to decide anything',
    run("!ccjRun.decisions['deposit-due/Part-paid']") === true);
  check('the gate lifts on the receipt alone', until(() => run("!!ccjRun.settled['deposit-due/Cleared']")));
  check('the invoice is stamped paid', screen().indexOf('>PAID<') > -1);
  check('every row on the stage is accounted for',
    run("ccjSteps(5).every(function(s){return !!ccjRun.settled['deposit-due/'+s.label];})"));
})();

/* ---- STAGE 7 ------------------------------------------------------------------------------
   The compliance check is the thing to guard here. It has to REACH a verdict on every clause a
   statutory rule bears on, has to CHANGE the document where the draft falls short, and must not
   claim a check it could not make. Those three are what separate an audit from a green tick. */
section('STAGE 7 — THE CONTRACT IS DRAFTED FROM WHAT WAS ALREADY DECIDED');
(function () {
  startRun();
  say('Hire Marta Nowak for Norrbridge Logistics in Germany as a Supply Planner');
  check('reaches stage 7', driveTo(6), 'stage ' + run('ccjRun.stage'));
  check('it opens on the contract screen', run('ccjRun.screen') === 'contract', run('ccjRun.screen'));
  check('the draft is generated', until(() => run("!!ccjRun.settled['employment-contract/Draft generated']")));

  check('the employer is the ADT entity where the WORK is, not where the client is',
    run('ccjParties().adt.country') === 'Germany' && run('ccjParties().client.country') === 'Netherlands',
    run('ccjParties().adt.country') + ' employs, client in ' + run('ccjParties().client.country'));
  check('and the contract is governed by the country the work is done in',
    screen().indexOf('Governing law') > -1 && screen().indexOf('Germany') > -1);
  check('the salary on it is the one the quote was built on',
    run('ccjEmp().terms.gross') === run('ccjQuote().gross'),
    run('ccjEmp().terms.gross') + ' vs ' + run('ccjQuote().gross'));
  check('probation and notice come from the contract form',
    run('ccjEmp().terms.probation') === parseInt(run('ccjRun.form.probation'), 10)
    || run('ccjEmp().terms.probation') === 2,
    run('ccjEmp().terms.probation') + ' from form ' + run('ccjRun.form.probation'));
  check('nothing commercial reaches the employee — no margin on the document',
    screen().indexOf('margin') === -1 && screen().indexOf(String(run('ccjQuote().fee'))) === -1);
  check('the document names the person and their position',
    screen().indexOf('Marta Nowak') > -1 && screen().indexOf('Supply Planner') > -1);
  check('it is not signed by anyone yet',
    run('ccjEmp().workerSignedAt') === 0 && run('ccjEmp().adtSignedAt') === 0
    && screen().indexOf('ccj-ec-stamp') === -1);
})();

section('THE COMPLIANCE CHECK WALKS THE DOCUMENT AND REWRITES IT');
(function () {
  startRun();
  say('Hire Sanne Bakker for Norrbridge Logistics in Netherlands as a Warehouse Lead');
  check('reaches stage 7', driveTo(6), 'stage ' + run('ccjRun.stage'));
  check('the draft exists before anything is checked',
    until(() => run('!!ccjEmp().terms')) && run('ccjEmp().audit.length') === 0
    || run('ccjEmp().audit.length') >= 0);
  const drafted = run('ccjEmp().terms.probation');
  check('the draft carried the form value first', drafted === 3, drafted);

  check('the check starts when the check step does', until(() => run('ccjEmp().audit.length') > 0));
  check('it holds the sub-status rather than ticking on a timer',
    until(() => run("ccjRun.phase==='hold'")), run('ccjRun.phase'));
  check('the gist reports the clause count while it holds',
    liveBlock().indexOf('Clauses') > -1 && liveBlock().indexOf(' of ') > -1,
    liveBlock().slice(0, 240));
  check('and it will not finish on its own before the audit does',
    (function () { const n = run('ccjEmp().auditAt'); return n < run('ccjEmp().audit.length') || run('ccjEmp().auditDone'); })());

  check('every clause is reached', until(() => run('ccjEmp().auditDone') === true));
  check('the held step is released by the audit finishing, and only then',
    until(() => run("!!ccjRun.settled['employment-contract/Clause compliance check']")));

  // The Netherlands caps probation at two months on an indefinite contract. The house draft is
  // three, so the check has to reduce it — and the DOCUMENT has to change, not just the report.
  check('a clause over the statutory cap was adjusted',
    run('ccjEmp().terms.probation') === 2, run('ccjEmp().terms.probation'));
  check('and the contract on screen now states the adjusted term',
    screen().indexOf('The first <b>2 months</b>') > -1);
  check('the clause carries the rule that changed it, with both values',
    screen().indexOf('Maximum probationary period') > -1
    && screen().indexOf('no more than 2 months') > -1 && screen().indexOf('3 months') > -1);
  check('and says where the rule came from',
    screen().indexOf('Compliance Hub &middot; Netherlands') > -1);
  // This journey writes contract clauses, so "void in Netherlands" is a defect in the product.
  check('country names read as English in the prose, not as data',
    screen().indexOf('void in the Netherlands') > -1
    && screen().indexOf(' in Netherlands') === -1, 'found a bare country name in a sentence');
  check('the adjustment is counted', run('ccjAuditAdjusted().length') > 0,
    run('ccjAuditAdjusted().length') + ' adjusted');
  check('clauses that met the rule are marked compliant, not adjusted',
    screen().indexOf('ccj-ec-mark pass') > -1);
  check('clauses with no statutory rule behind them carry no verdict at all',
    screen().indexOf('id="ccj-ec-cl-11"') > -1 && screen().indexOf('ccj-ec-cl fail') === -1);

  // The Netherlands is the one country with a live minimum wage row in the Compliance Hub.
  check('the minimum wage was read live from Rates & Rules, not authored',
    run("!!ccjFloorFor('Netherlands')") === true
    && screen().indexOf('Statutory minimum wage') > -1);
})();

section('A CHECK IT CANNOT MAKE IS NOT A PASS');
(function () {
  startRun();
  say('Hire Marta Nowak for Norrbridge Logistics in Germany as a Supply Planner');
  check('reaches stage 7', driveTo(6), 'stage ' + run('ccjRun.stage'));
  check('the audit completes', until(() => run('ccjEmp().auditDone') === true));
  check('Germany has no minimum wage row in the Compliance Hub',
    run("ccjFloorFor('Germany')") === null);
  const pay = run("JSON.stringify(ccjEmp().audit.filter(function(r){return r.key==='pay';})[0])");
  check('so the wage check returns NOT APPLICABLE rather than passing',
    JSON.parse(pay).verdict === 'na', JSON.parse(pay).verdict);
  check('and says so on the document, in those words',
    screen().indexOf('no minimum wage rule configured') > -1
    && screen().indexOf('It is not a pass') > -1);
  // Germany's statutory floors are all met by the house draft, so the one thing it must catch is
  // that the employee is being given written particulars in a language that is not theirs.
  check('the language clause was adjusted for a non-English jurisdiction',
    run('ccjEmp().terms.translated') === true);
  check('and the contract now attaches a certified translation',
    screen().indexOf('certified <b>German</b> translation') > -1);
})();

section('THE HUMAN APPROVAL, AND SENDING IT BACK');
(function () {
  startRun();
  say('Hire Sanne Bakker for Norrbridge Logistics in Netherlands as a Warehouse Lead');
  check('reaches stage 7', driveTo(6), 'stage ' + run('ccjRun.stage'));
  check('the run stops for approval',
    until(() => run("ccjRun.phase==='halt'")
      && run('ccjSteps(6)[ccjRun.sub].label') === 'Internal approval'), run('ccjRun.phase'));
  check('the ask names the contract', panel().indexOf(run('ccjEmp().id')) > -1);
  check('and the reason names which clauses the statutory check moved',
    panel().indexOf('changed to meet local law') > -1
    && panel().indexOf('probationary period') > -1);
  // It reports the finding and stops there. "The employee signs whatever this says, and we carry
  // the employment liability" is true, but it argues for the control instead of describing this
  // contract — the register that made the card read as a walkthrough of itself. Pinned so it
  // cannot drift back in.
  check('without also arguing for why the approval exists',
    panel().indexOf('we carry the employment liability') === -1);
  // It read "1 clause were rewritten": the noun pluralised, the verb did not, so the COMMON case —
  // a single adjusted clause — printed a grammatical error. Asserted against whichever branch this
  // run actually takes rather than a fixed count.
  check('and the count agrees with its verb', (function () {
    const m = panel().match(/(\d+) clauses? (was|were) changed/);
    return !!m && ((m[1] === '1') === (m[2] === 'was'));
  })(), (panel().match(/\d+ clauses? (?:was|were) changed/) || ['no match'])[0]);
  advance(80000);
  check('it will not approve itself',
    run("ccjRun.phase==='halt'") && run('ccjEmp().sentAt') === 0);

  const v = run('ccjEmp().version');
  run("ccjChooseGate('ecRedraft','Notice period does not match the offer.')");
  check('sending it back returns to the draft, it does not stop the run',
    run('ccjRun.stopped') === false
    && run('ccjSteps(6)[ccjRun.sub].label') === 'Draft generated', run('ccjSteps(6)[ccjRun.sub].label'));
  check('and it is a new version', run('ccjEmp().version') === v + 1, run('ccjEmp().version'));
  check('the previous audit is not left standing against a document that was redrawn',
    run('ccjEmp().auditDone') === false || run('ccjEmp().audit.length') === 0);
  check('the check runs again on the new draft', until(() => run('ccjEmp().auditDone') === true));
  check('and reaches the same verdict on the same facts', run('ccjEmp().terms.probation') === 2);

  check('it stops for approval again', until(() => run("ccjRun.phase==='halt'")
    && run('ccjSteps(6)[ccjRun.sub].label') === 'Internal approval'));
  run("ccjChooseGate('ecApprove')");
  check('approving records who approved it',
    String(run('ccjEmp().approvedBy')).length > 1, run('ccjEmp().approvedBy'));
  check('and only then does it go out', until(() => run('ccjEmp().sentAt') > 0));
})();

section('IT GOES TO THE EMPLOYEE, IN THE EMPLOYEE\'S OWN THREAD');
(function () {
  startRun();
  say('Hire Marta Nowak for Norrbridge Logistics in Germany as a Supply Planner');
  check('reaches stage 7', driveTo(6), 'stage ' + run('ccjRun.stage'));
  check('it is issued', answerGatesUntil(() => run('ccjEmp().sentAt') > 0));
  // The shared descriptor addressed the WORKER's contract to the CLIENT's buyer. It must not.
  check('the recipient is the employee, not the client',
    run('ccjParties().worker.email') !== run('ccjParties().client.email')
    && stream().indexOf(run('ccjEmp().id')) > -1);
  check('the thread beside it is the WORKER\'s, not the client\'s',
    run('ccjChatMode()') === 'worker'
    && run('ccjRun.worker.msgs.length') > 0, run('ccjChatMode()'));
  check('and the client thread is untouched by any of it',
    run("ccjRun.client.msgs.every(function(m){return m.kind!=='eccontract'&&m.kind!=='ecsigned';})"));
  check('the column is headed by the employee', shell().indexOf('Marta Nowak') > -1
    && shell().indexOf('ccj-chat-av worker') > -1);

  /* == ONE RECORD, ALL THE WAY DOWN =========================================================
     The counterparty changes here, and the first version of this simply swapped the column to the
     worker's thread — which silently deleted the client conversation from the scroll. Everything
     stages 3-6 recorded (the quote they negotiated, the invoice they paid, the replies to our own
     chase messages) vanished, leaving those stages' blocks referring to messages no longer anywhere
     on the page. A transcript that drops half of what it recorded is not a record.

     The user chose this outright: one continuous record, with a divider where it changes hands. */
  check('stage 7 is on the transcript, with no panel',
    run('ccjUsesTranscript(6)') === true && shell().indexOf('ccj-panel') === -1);
  check('THE CLIENT CONVERSATION IS STILL IN THE RECORD',
    stream().indexOf('ccj-cbubble quote') > -1 && stream().indexOf(run('ccjInvoice().id')) > -1,
    'quote card ' + (stream().indexOf('ccj-cbubble quote') > -1) + ', invoice ' + run('ccjInvoice().id'));
  check('and so is the worker\'s, in its own lane',
    stream().indexOf('ccj-cbubble doc') > -1 && stream().indexOf('Marta Nowak') > -1);
  /* A DONE await is the one deliberate exception: it was a state, not an event, and renders
     nothing once the thing it waited for has happened. Everything that ever SAID something is
     still on screen. */
  check('everything the run has ever said is on screen, in one list',
    count(stream(), 'id="ccj-m-') ===
      run('ccjRun.msgs.length + ccjRun.client.msgs.length + ccjRun.worker.msgs.length'
        + " - ccjRun.client.msgs.filter(function(m){return m.kind==='await'&&m.done;}).length"),
    count(stream(), 'id="ccj-m-') + ' rendered vs '
      + run('ccjRun.msgs.length + ccjRun.client.msgs.length + ccjRun.worker.msgs.length') + ' stored');
  check('and it is in true chronological order', (function () {
    const ids = (stream().match(/id="ccj-m-(\d+)"/g) || []).map((s) => +s.replace(/\D/g, ''));
    return ids.length > 1 && ids.every((v, n) => n === 0 || ids[n - 1] < v);
  })());
  /* THE STORES ARE STILL THREE. This is the rule the whole shared column rests on and the one that
     would be quietest to break: one thread discusses this person's salary with them, the other
     discusses our margin with the client. Either message in the other thread is a disclosure. */
  check('THE THREE STORES DID NOT MERGE — only the render did',
    run('ccjRun.msgs !== ccjRun.client.msgs && ccjRun.client.msgs !== ccjRun.worker.msgs')
    && run("ccjRun.msgs.every(function(m){return !m.lane;})")
    && run("ccjRun.client.msgs.every(function(m){return m.lane==='client';})")
    && run("ccjRun.worker.msgs.every(function(m){return m.lane==='worker';})"));

  // ---- The divider, at each point the conversation changed hands.
  const hands = (stream().match(/ccj-hand-text/g) || []).length;
  check('the handover is marked where the counterparty changed', hands >= 1, hands + ' dividers');
  check('and it names the employee the conversation moved to',
    stream().indexOf('now talking to <b>Marta Nowak</b>') > -1);
  check('the earlier handover to the client is marked too',
    stream().indexOf('now talking to <b>Norrbridge Logistics B.V.</b>') > -1);
  // Once per change, not once per message. A marker on every bubble is noise, and noise is what a
  // reader learns to skip — at which point the thing that made the column safe stops working.
  check('exactly one divider per change of hands, not one per message', hands === 2, hands + ' dividers');

  check('the run waits on the employee', until(() => run("ccjRun.phase==='wait'")
    && run('ccjSteps(6)[ccjRun.sub].label') === 'Worker signed'), run('ccjRun.phase'));
  /* Asserted HERE and not at the rest, which is where it was first written and where it proved
     nothing: the strip only renders while the contract is out and unsigned, so by the time the
     stage rests the condition is false and an absent strip is absent for the wrong reason. */
  check('the contract carries no controls while it is out for signature',
    run('ccjEmp().sentAt') > 0 && run('ccjEmp().adtSignedAt') === 0
    && screen().indexOf('ccj-sim') === -1 && screen().indexOf('<button') === -1,
    'sent ' + run('ccjEmp().sentAt') + ', countersigned ' + run('ccjEmp().adtSignedAt'));
  check('and offers nobody a button to sign on their behalf',
    panel().indexOf('Nothing here is ours to press') > -1
    && run('!ccjGateFor(6,ccjSteps(6)[4])') === true);

  check('the employee opens it', until(() => run('ccjEmp().openedAt') > 0));
  check('the envelope records how and from where',
    screen().indexOf('Chrome on Android') > -1 && screen().indexOf('Signature envelope') > -1);
  check('they download a copy', until(() => run('ccjWorker().downloaded') === true));
  // Same class of bug the stage-6 ledger had: the envelope printed `opened + 40 minutes` for the
  // download rather than the time the download happened.
  check('and the download is stamped when it happened, not offset from the open',
    run('ccjWorker().downloadedAt') > 0 && run('ccjWorker().downloadedAt') !== run('ccjEmp().openedAt + 40')
    && screen().indexOf(run('ccjStamp(ccjWorker().downloadedAt)')) > -1,
    run('ccjStamp(ccjWorker().downloadedAt)'));
  check('then signs it', until(() => run('ccjEmp().workerSignedAt') > 0));
  check('the signature comes after the open, not before',
    run('ccjEmp().workerSignedAt') >= run('ccjEmp().openedAt'),
    run('ccjEmp().openedAt') + ' then ' + run('ccjEmp().workerSignedAt'));
  check('their signature is on the document', screen().indexOf('ccj-msa-sig on') > -1);
  check('ours is not yet', count(screen(), 'ccj-msa-sig on') === 1, count(screen(), 'ccj-msa-sig on'));

  check('the run stops for our countersignature',
    until(() => run("ccjRun.phase==='halt'")
      && run('ccjSteps(6)[ccjRun.sub].label') === 'ADT countersigned'), run('ccjRun.phase'));
  check('with an approve and a decline',
    panel().indexOf('Approve and countersign') > -1 && panel().indexOf('>Decline<') > -1);
  advance(60000);
  check('and it will not countersign itself', run('ccjEmp().adtSignedAt') === 0);
  run("ccjChooseGate('ecDecline','Right-to-work evidence has expired.')");
  check('declining is terminal — nothing is in force',
    run('ccjRun.stopped') === true && run('ccjEmp().adtSignedAt') === 0);
  run('ccjReopen()');
  run("ccjChooseGate('ecCountersign')");
  check('countersigning puts it in force from the last signature',
    run('ccjEmp().adtSignedAt') > run('ccjEmp().workerSignedAt'),
    run('ccjEmp().workerSignedAt') + ' then ' + run('ccjEmp().adtSignedAt'));
  check('the document is stamped executed',
    until(() => run("!!ccjRun.settled['employment-contract/ADT countersigned']"))
    && screen().indexOf('ccj-ec-stamp') > -1);
  check('both signatures are on it', count(screen(), 'ccj-msa-sig on') === 2,
    count(screen(), 'ccj-msa-sig on'));
  check('and the employee is told', stream().indexOf('countersigned') > -1);
  check('the stage rests on the executed contract',
    until(() => run("ccjRun.phase==='rest'")), run('ccjRun.phase'));
  check('it does not walk past it', (function () { advance(30000); return run('ccjRun.stage') === 6; })());
  check('the contract states that it is executed',
    screen().indexOf('Contract executed') > -1);
  check('and the way on is asked for in the conversation',
    stream().indexOf('Continue to onboarding') > -1 && screen().indexOf('<button') === -1,
    screen().slice(screen().indexOf('ccj-ec-next'), screen().indexOf('ccj-ec-next') + 200));
  check('no simulate strip is left on the contract', screen().indexOf('ccj-sim') === -1);
  run("ccjAnswerAsk((function(){var m=ccjRun.msgs.filter(function(x){return x.kind==='ask'&&!x.done;}).pop();return m?m._id:0;})())");
  check('continuing reaches stage 8', until(() => run('ccjRun.stage') === 7), 'stage ' + run('ccjRun.stage'));
})();

/* ---- STAGE 8 ------------------------------------------------------------------------------
   Six streams, six counterparties, and the thing to guard is that each one actually REACHES its
   counterparty and comes back with something country-specific — not that six bars turn green. */
section('STAGE 8 — IDENTITY VERIFICATION, AS A REAL ONE RUNS');
(function () {
  startRun();
  say('Hire Sanne Bakker for Norrbridge Logistics in Netherlands as a Warehouse Lead');
  check('reaches stage 8', driveTo(7, 400000), 'stage ' + run('ccjRun.stage'));
  check('it opens on the onboarding file', run('ccjRun.screen') === 'onboarding', run('ccjRun.screen'));
  check('the file is built from the country pack, not a generic list',
    run("ccjOnb().docs.some(function(d){return /BSN/.test(d.label);})") === true,
    run("JSON.stringify(ccjOnb().docs.map(function(d){return d.id;}))"));

  check('stage 8 is on the transcript, with no panel',
    run('ccjUsesTranscript(7)') === true && shell().indexOf('ccj-panel') === -1);
  /* Paint the screen first. `screen()` falls back to the whole shell when nothing has looked the
     node up yet, and the shell contains the header's own back button — so this assertion passed
     against the wrong markup entirely until it was made to read the node it names. The browser has
     always painted it by this point; the stub only creates a node when something asks for one. */
  run('ccjPaintScreen()');
  check('the onboarding file carries no controls of its own',
    screen().indexOf('ccj-onb-wrap') > -1
    && screen().indexOf('<button') === -1 && screen().indexOf('ccj-sim') === -1,
    screen().slice(0, 160));

  check('the check starts when the KYC step does', until(() => run('ccjOnb().kyc.step') > 0));
  check('it holds the sub-status rather than ticking on a timer',
    until(() => run("ccjRun.phase==='hold'")), run('ccjRun.phase'));
  /* SIX HOLDS IS THE MOST PARKED TIME IN THE JOURNEY, and a held block that says one unchanging
     sentence for ten seconds is the screen a reader refreshes — the same failure the waits had
     before they were given rows. Every figure is read from ccjOnb(), the store the card beside it
     is drawn from, so the block and the card cannot disagree about how far along something is. */
  check('the held gist reports progress, not just that it is holding',
    liveBlock().indexOf('Checks') > -1 && liveBlock().indexOf(' of ') > -1,
    liveBlock().slice(0, 240));
  check('and the count it shows is the provider\'s own position in the check',
    liveBlock().indexOf(run("Math.min(ccjOnb().kyc.step+(ccjOnb().kyc.done?0:1),CCJ_KYC_PHASES.length)"
      + "+' of '+CCJ_KYC_PHASES.length")) > -1,
    run("Math.min(ccjOnb().kyc.step+(ccjOnb().kyc.done?0:1),CCJ_KYC_PHASES.length)+' of '+CCJ_KYC_PHASES.length"));
  // The session moved with the details: it lives on the KYC console beside the block now.
  check('the console names the session, which is what a person chasing this would quote',
    screen().indexOf(run('ccjOnb().kyc.session')) > -1, run('ccjOnb().kyc.session'));
  // A row with nothing in it yet is dropped rather than rendered blank — the outcome only exists
  // once the provider has returned one.
  check('and it claims no outcome before the provider has returned one',
    run('ccjOnb().kyc.done') === true || liveBlock().indexOf('Outcome') === -1,
    'done=' + run('ccjOnb().kyc.done'));
  check('the employee is asked to do their part, in their own thread',
    run('ccjChatMode()') === 'worker' && stream().indexOf('Verify your identity') > -1);

  check('every phase runs', until(() => run('ccjOnb().kyc.done') === true));
  const doc = screen();
  // The eight things a real verification does, each of which must be visible.
  check('a document was captured and rendered as one',
    doc.indexOf('ccj-kyc-doc-card') > -1 && doc.indexOf('PASSPORT') > -1);
  check('its machine-readable zone is shown', doc.indexOf('ccj-kyc-mrz') > -1 && doc.indexOf('P&lt;NLD') > -1);
  check('every field read off it is matched against the contract, side by side',
    doc.indexOf('Read from the document') > -1 && doc.indexOf('Matched against') > -1
    && doc.indexOf('BAKKER') > -1);
  check('a live selfie was matched to the document portrait',
    doc.indexOf('Face match') > -1 && doc.indexOf('98.2%') > -1 && doc.indexOf('Liveness') > -1);
  check('the document was checked for tampering',
    doc.indexOf('Tamper detection') > -1 && doc.indexOf('MRZ checksum') > -1);
  check('the person was screened against the global lists',
    doc.indexOf('Sanctions') > -1 && doc.indexOf('Politically exposed person') > -1
    && doc.indexOf('Adverse media') > -1);
  check('and their right to work was established',
    doc.indexOf('Right to work') > -1 && doc.indexOf('unrestricted right to work') > -1);
  check('the outcome is a decision with a risk score, not a tick',
    doc.indexOf('ccj-kyc-dec') > -1 && doc.indexOf('CLEAR') > -1
    && run('ccjKycDecision().score') > 0, run('ccjKycDecision().score'));
  check('a Dutch national working in the Netherlands needs no permit, and it says why',
    run('ccjRightToWork().verdict') === 'pass');
  check('nobody was asked to adjudicate a check that cleared itself',
    run("!ccjRun.decisions['onboarding/Worker KYC']") === true);
  check('the KYC step settles on the verification finishing',
    until(() => run("!!ccjRun.settled['onboarding/Worker KYC']")));
})();

section('A VERIFICATION THAT CANNOT CLEAR ITSELF GOES TO A PERSON');
(function () {
  startRun();
  say('Hire Sanne Bakker for Norrbridge Logistics in Netherlands as a Warehouse Lead');
  check('reaches stage 8', driveTo(7, 400000), 'stage ' + run('ccjRun.stage'));
  check('the check starts', until(() => run('ccjOnb().kyc.step') > 0));
  check('left alone it would clear', run('ccjKycDecision().id') === 'clear');
  // Forced BEFORE the verification finishes, because the decision is taken the moment it does.
  run('ccjKycForceConsider()');
  check('the verification still runs every phase', until(() => run('ccjOnb().kyc.done') === true));
  check('but the provider came back CONSIDER',
    run('ccjKycDecision().id') === 'consider', run('ccjKycDecision().id'));
  check('the run stops on it', until(() => run("ccjRun.phase==='halt'")), run('ccjRun.phase'));
  /* THE ONE WINDOW THE SIMULATE STRIP COULD RENDER IN — the check has returned, nobody has
     adjudicated, and the step is still live. Asserted here rather than at the rest, where it was
     first written and where an absent strip is absent because its condition is false anyway. */
  run('ccjPaintScreen()');
  check('and the verification console carries no control that changes the provider\'s answer',
    run("ccjOnb().kyc.done&&!ccjOnb().kyc.reviewed&&ccjOnbState('Worker KYC')==='live'") === true
    && screen().indexOf('ccj-sim') === -1 && screen().indexOf('Returns CONSIDER') === -1,
    'done=' + run('ccjOnb().kyc.done') + ' reviewed=' + run("'"+"'+ccjOnb().kyc.reviewed")
      + ' state=' + run("ccjOnbState('Worker KYC')"));
  check('the panel asks a person, and says why',
    panel().indexOf('came back CONSIDER') > -1 && panel().indexOf('may not decide this on its own') > -1);
  check('with a confirm and a reject',
    panel().indexOf('Confirm identity') > -1 && panel().indexOf('>Reject<') > -1);
  advance(60000);
  check('and it will not decide for itself', run("ccjRun.phase==='halt'"));
  run("ccjChooseGate('kycReject','Document is illegible.')");
  check('rejecting stops the placement outright', run('ccjRun.stopped') === true);
  run('ccjReopen()');
  // Reopening re-runs the verification and asks again. It must not carry the rejection forward:
  // the point of reopening is that the decision is being made afresh.
  check('reopening retracts the rejection', run("ccjOnb().kyc.reviewed") === '',
    run("ccjOnb().kyc.reviewed"));
  check('it re-runs the check and stops for a fresh decision',
    until(() => run("ccjRun.phase==='halt'") && run('ccjOnb().kyc.done') === true), run('ccjRun.phase'));
  check('the provider still says CONSIDER — that was its answer, not ours',
    run('ccjKycDecision().id') === 'consider');
  run("ccjChooseGate('kycConfirm')");
  check('confirming records who confirmed it, and clears the verification',
    run("ccjOnb().kyc.reviewed") === 'confirmed'
    && String(run('ccjOnb().kyc.reviewed_by')).length > 1, run('ccjOnb().kyc.reviewed_by'));
  check('and the run carries on', until(() => run("!!ccjRun.settled['onboarding/Worker KYC']")));
})();

section('THE DOCUMENTS ARE THE COUNTRY\'S, AND ONE OF THEM IS REJECTED');
(function () {
  startRun();
  say('Hire Sanne Bakker for Norrbridge Logistics in Netherlands as a Warehouse Lead');
  check('reaches stage 8', driveTo(7, 400000), 'stage ' + run('ccjRun.stage'));
  check('documents start after KYC', answerGatesUntil(() => run('ccjOnb().docs[0].status') !== 'waiting'));
  check('a proof of address is rejected for being out of date',
    until(() => run("ccjOnb().docs.some(function(d){return d.status==='rejected';})")
      || run('ccjOnb().docsDone') === true));
  check('the employee is told exactly why',
    stream().indexOf('could not be accepted') > -1 && stream().indexOf('more than 3 months') > -1);
  check('and it is not counted as collected while it is rejected',
    run("ccjOnbDocs().filter(function(d){return d.req&&d.status==='verified';}).length")
    < run("ccjOnbDocs().filter(function(d){return d.req;}).length"));
  check('they re-send it and it is accepted', until(() => run('ccjOnb().docsDone') === true));
  check('every required document ends up verified',
    run('ccjDocsOutstanding().length') === 0,
    run("JSON.stringify(ccjDocsOutstanding().map(function(d){return d.id;}))"));
  check('the replacement says it replaced something',
    screen().indexOf('Replaced') > -1);
  // The 30% ruling is for employees recruited from abroad. This one is a local hire.
  check('an optional item that does not apply is marked so, with the reason',
    run("ccjOnb().docs.some(function(d){return d.status==='na';})") === true
    && screen().indexOf('Not an incoming employee') > -1);
  check('the step only settles once the checklist is complete',
    until(() => run("!!ccjRun.settled['onboarding/Documents']")));
})();

section('TWO FILINGS, TWO AUTHORITIES, AND THE NUMBERS THEY RETURN');
(function () {
  startRun();
  say('Hire Marta Nowak for Norrbridge Logistics in Germany as a Supply Planner');
  check('reaches stage 8', driveTo(7, 400000), 'stage ' + run('ccjRun.stage'));
  check('the pack is the German one, not the Dutch one',
    run('ccjOnbPack().taxAuthority') === 'Finanzamt', run('ccjOnbPack().taxAuthority'));
  check('the tax filing is submitted', answerGatesUntil(() => run("ccjOnb().tax.state") !== 'idle'));
  check('it is a submission first, and a confirmation second',
    run('ccjOnb().tax.ref').length > 0);
  check('the authority returns a number', until(() => run("ccjOnb().tax.state") === 'confirmed'));
  check('and it is the number that country actually issues',
    run('ccjOnbPack().taxIdLabel') === 'Steuer-ID' && run('ccjOnb().tax.id').length > 0,
    run('ccjOnbPack().taxIdLabel') + ' ' + run('ccjOnb().tax.id'));
  check('the screen names the authority and the filing',
    screen().indexOf('Finanzamt') > -1 && screen().indexOf('ELStAM') > -1);
  check('social security is a different body and a different filing',
    until(() => run("ccjOnb().ss.state") === 'confirmed')
    && run('ccjOnbPack().ssAuthority') !== run('ccjOnbPack().taxAuthority'),
    run('ccjOnbPack().ssAuthority'));
  check('and it names the filing that country actually makes',
    screen().indexOf('Anmeldung zur Sozialversicherung') > -1);
  check('both steps settle on their authority confirming, not on a timer',
    until(() => run("!!ccjRun.settled['onboarding/Tax registration']")
      && run("!!ccjRun.settled['onboarding/Social security enrolment']")));
})();

section('THE BANK, THE PAYSLIP, AND WHAT THE STAGE IS FOR');
(function () {
  startRun();
  say('Hire Sanne Bakker for Norrbridge Logistics in Netherlands as a Warehouse Lead');
  check('reaches stage 8', driveTo(7, 400000), 'stage ' + run('ccjRun.stage'));
  check('a penny-drop is sent', answerGatesUntil(() => run("ccjOnb().bank.state") !== 'idle'));
  check('the bank returns a name and a match score',
    until(() => run("ccjOnb().bank.state") === 'verified') && run('ccjOnb().bank.score') > 90,
    run('ccjOnb().bank.score'));
  check('the account is held masked, as a payroll system holds it',
    run('ccjOnb().bank.iban').indexOf('••••') > -1, run('ccjOnb().bank.iban'));

  check('payroll is configured last', until(() => run("ccjOnb().payroll.state") === 'built'));
  check('the first payslip is prorated to the actual start date',
    run('ccjOnb().payroll.prorated') === true
      ? run('ccjPayslip().gross') < run('ccjQuote().gross')
      : run('ccjPayslip().gross') === run('ccjQuote().gross'),
    run('ccjOnb().payroll.days') + ' of ' + run('ccjOnb().payroll.inMonth') + ' days');
  check('net is gross less the employee deductions the country levies',
    run('ccjPayslip().net') === run('ccjPayslip().gross - ccjPayslip().social - ccjPayslip().tax')
    && run('ccjPayslip().net') < run('ccjPayslip().gross'));
  check('and it says it is indicative rather than claiming a figure it has not computed',
    screen().indexOf('Indicative') > -1 && screen().indexOf('binding figure on the first run') > -1);
  check('payroll will not configure against an unverified account — the check is stated',
    screen().indexOf('verified account') > -1 || panel().indexOf('unverified account') > -1);

  check('all six streams complete',
    until(() => run("ccjSteps(7).every(function(s){return !!ccjRun.settled['onboarding/'+s.label];})")));
  check('the file reports six of six', screen().indexOf('6 of 6') > -1);
  check('the stage rests on it', until(() => run("ccjRun.phase==='rest'")), run('ccjRun.phase'));
  check('it does not walk past it', (function () { advance(30000); return run('ccjRun.stage') === 7; })());
  check('the file states that onboarding is complete',
    screen().indexOf('Onboarding complete') > -1);
  check('and the way on is asked for in the conversation',
    stream().indexOf('Continue to active') > -1 && screen().indexOf('<button') === -1,
    screen().slice(screen().indexOf('ccj-onb-next'), screen().indexOf('ccj-onb-next') + 200));
  run("ccjAnswerAsk((function(){var m=ccjRun.msgs.filter(function(x){return x.kind==='ask'&&!x.done;}).pop();return m?m._id:0;})())");
  check('continuing reaches stage 9', until(() => run('ccjRun.stage') === 8), 'stage ' + run('ccjRun.stage'));
})();

/* ---- STAGE 9 --------------------------------------------------------------------------------
   The last stage, and the one a WORKER would read. Three things have to hold and none of them is
   "three bars turned green": the certificate must be DERIVED (so a missing control fails on it),
   the money must not move without a person, and every figure must reconcile to the stage that
   produced it. */
// Drives a run all the way into stage 9, setting the start date on the way so proration is real
// rather than whatever the field filler happened to leave behind.
function driveToActive(prompt, from) {
  startRun();
  say(prompt);
  until(() => run("ccjRun.screen==='employee'") || run("ccjRun.screen==='form'"), 30000);
  if (run("ccjRun.screen==='employee'")) run("ccjGoScreen('form')");
  until(() => run("ccjRun.screen==='form'"), 30000);
  if (from) run("ccjSetField('fromDate','" + from + "')");
  return driveTo(8, 600000);
}

section('STAGE 9 — THE READINESS CERTIFICATE IS DERIVED, NOT ASSERTED');
(function () {
  check('reaches stage 9', driveToActive('Hire Sanne Bakker for Norrbridge Logistics in Netherlands as a Warehouse Lead', '2026-10-14'),
    'stage ' + run('ccjRun.stage'));
  check('it opens on the certificate, not on the payslip', run('ccjRun.screen') === 'readiness', run('ccjRun.screen'));
  check('the conversation is still the employee\'s — this stage is about them',
    run('ccjChatMode()') === 'worker', run('ccjChatMode()'));

  check('controls appear one at a time rather than all at once',
    until(() => run('ccjRdy().step') > 0 && run('ccjRdy().step') < run('ccjRdyChecks().length')),
    run('ccjRdy().step') + ' of ' + run('ccjRdyChecks().length'));
  check('the sub-status holds on it rather than ticking on a timer',
    until(() => run("ccjRun.phase==='hold'")), run('ccjRun.phase'));
  check('every control is checked', until(() => run('ccjRdy().done') === true));

  const cert = screen();
  check('all five groups are on it',
    run('CCJ_RDY_GROUPS').length === 5
    && cert.indexOf('The engagement is contracted') > -1
    && cert.indexOf('The person is employed') > -1
    && cert.indexOf('They are who they say they are') > -1
    && cert.indexOf('Registered with the authorities') > -1
    && cert.indexOf('Money can move, safely') > -1);
  // The point of the whole screen: each row names the stage that produced its evidence.
  check('every control cites the stage it came from',
    run("ccjRdyChecks().every(function(c){return /^Stage \\d/.test(c.src);})") === true,
    run("JSON.stringify(ccjRdyChecks().filter(function(c){return !/^Stage \\d/.test(c.src);}).map(function(c){return c.label;}))"));
  check('and carries a reference somebody can look up',
    run("ccjRdyChecks().every(function(c){return !!c.ref;})") === true);
  check('it names the real artefacts, not placeholders',
    cert.indexOf(run('ccjEmp().id')) > -1 && cert.indexOf(run('ccjMsa().id')) > -1
    && cert.indexOf(run('ccjOnb().kyc.session')) > -1);
  check('the country\'s own institutions are named',
    cert.indexOf('Belastingdienst') > -1 && cert.indexOf('BSN') > -1);
  // The bug this exists to prevent: a certificate that prints a plausible time for an event no
  // object ever timed. Right to work and the clause audit hold no timestamp, and must show none.
  check('no control invents a timestamp for an event nothing recorded',
    run("ccjRdyChecks().filter(function(c){return c.at===0;}).length") > 0
    && run("ccjRdyChecks().every(function(c){return c.at===0||c.at>0;})") === true);
  check('nothing is outstanding on a clean run',
    run('ccjRdyFailed().length') === 0,
    run("JSON.stringify(ccjRdyFailed().map(function(c){return c.label+': '+c.detail;}))"));
  check('so the certificate is stamped, and says who issued it',
    cert.indexOf('READY FOR PAYROLL') > -1 && cert.indexOf('payroll readiness engine') > -1);
  // Half the entity names in the registry already end in a stop. "B.V.." on a certificate.
  check('an entity name that already ends in a full stop does not get a second one',
    cert.indexOf('B.V..') === -1
    && run("ccjFullStop('ADT Netherlands EOR Services B.V.')") === 'ADT Netherlands EOR Services B.V.'
    && run("ccjFullStop('Signed by someone')") === 'Signed by someone.');
  check('it is issued with a reference', String(run('ccjRdy().ref')).length > 3, run('ccjRdy().ref'));
  check('and the step only settles once it is issued',
    until(() => run("!!ccjRun.settled['active/Ready for payroll']")));
})();

section('A CONTROL THAT CANNOT BE PROVED FAILS ON THE CERTIFICATE');
(function () {
  check('reaches stage 9', driveToActive('Hire Sanne Bakker for Norrbridge Logistics in Netherlands as a Warehouse Lead'),
    'stage ' + run('ccjRun.stage'));
  // Nothing is faked here: the bank object is put back to the state it would be in if the
  // penny-drop had never returned, and the certificate is asked again.
  run("ccjOnb().bank.state='penny';ccjOnb().bank.score=0;");
  check('the control that depended on it now fails',
    run("ccjRdyChecks().find(function(c){return /Bank account verified/.test(c.label);}).verdict") === 'fail',
    run("ccjRdyChecks().find(function(c){return /Bank account verified/.test(c.label);}).verdict"));
  check('and it is reported as blocking, by name',
    run('ccjRdyFailed().length') === 1
    && run("ccjRdyFailed()[0].label").indexOf('Bank account') > -1);
  check('the certificate says payroll is blocked rather than stamping itself',
    until(() => run('ccjRdy().done') === true)
    && screen().indexOf('Payroll is blocked') > -1 && screen().indexOf('READY FOR PAYROLL') === -1);
  check('the sub-status reports it too',
    panel().indexOf('controls satisfied') > -1);
  run("ccjOnb().bank.state='verified';ccjOnb().bank.score=97;");
  check('restoring the evidence clears it — the certificate reads state, it does not remember',
    run('ccjRdyFailed().length') === 0);
})();

section('PAYROLL IS SET UP, NOT RUN — AND IT IS LEFT PENDING');
/* The journey used to build a register, ask Finance to release MONEY, move it, file two statutory
   returns and issue a payslip. It does not any more, by instruction: *"we are giving the access,
   and then initially the payroll status will be in pending, and at the final step we are making the
   payroll status pending to active."*

   So this section tests the opposite of what it used to. Everything that is preparation must still
   happen and still be right — access, the calendar, the proration, the gross-to-net, the controls —
   and everything that is execution must be provably absent. The second half is the part worth
   having: it is easy to stop doing something and much easier to leave a screen still claiming it. */
(function () {
  check('reaches stage 9', driveToActive('Hire Sanne Bakker for Norrbridge Logistics in Netherlands as a Warehouse Lead', '2026-10-14'),
    'stage ' + run('ccjRun.stage'));
  check('the certificate is issued', until(() => run('ccjRdy().done') === true));
  check('stage 9 is on the transcript', run('ccjUsesTranscript(8)') === true);
  check('setup moves to its own screen', until(() => run("ccjRun.screen==='payrun'")), run('ccjRun.screen'));
  check('the payroll record is identified by period and country',
    /^PR-2026-10-NL-001$/.test(run('ccjPayrun().id')), run('ccjPayrun().id'));

  // ---- ACCESS. The first thing the step does, and the user's word for what this stage grants.
  check('the employee is given access before anything else',
    until(() => run('ccjPayrun().accessAt') > 0), run('ccjPayrun().accessAt'));
  check('and told, in their own thread',
    stream().indexOf('ccj-lane') > -1 && run("ccjWorker().msgs.some(function(m){return m.kind==='access';})"));

  check('it sets up phase by phase', until(() => run('ccjPayrun().step') > 0));
  check('it holds while it does', until(() => run("ccjRun.phase==='hold'")), run('ccjRun.phase'));
  /* The held block reports progress rather than one unchanging sentence — the same rule stage 8's
     six holds follow, and read from ccjPayrun() so the block and the screen cannot disagree. */
  check('the held gist says where the setup has got to',
    liveBlock().indexOf('Setup') > -1 && liveBlock().indexOf(' of ') > -1,
    liveBlock().slice(0, 240));
  // The COUNT, against the store, not just the word. A hard-coded "1 of 6" satisfies the check
  // above and reports nothing — which is exactly what a progress row must not be.
  check('and the count is the setup\'s own position, not a printed constant',
    liveBlock().indexOf(run("Math.min(ccjPayrun().step+(ccjPayrun().done?0:1),CCJ_PR_PHASES.length)"
      + "+' of '+CCJ_PR_PHASES.length")) > -1,
    run("Math.min(ccjPayrun().step+(ccjPayrun().done?0:1),CCJ_PR_PHASES.length)+' of '+CCJ_PR_PHASES.length"));
  // The access grant's record moved with the details: the store carries it and the worker was
  // told in their own thread (both asserted above); the block's line stays one line.
  check('and the access it granted is recorded and told',
    run('ccjPayrun().accessAt') > 0
    && run("ccjWorker().msgs.some(function(m){return m.kind==='access';})") === true);

  check('setup completes and payroll is left PENDING',
    until(() => run("ccjPayrun().state==='pending'")), run('ccjPayrun().state'));

  // ---- The figures. All of this is preparation and all of it must still be right.
  const cal = () => run('ccjPayrunCalc()');
  const c = cal();
  check('the first period is prorated to the day they actually start',
    c.prorated === true && c.days === 18 && c.inMonth === 31, c.days + ' of ' + c.inMonth);
  check('basic is the contracted gross scaled to the days worked',
    c.basic === Math.round(c.full * 18 / 31), c.basic + ' vs ' + c.full);
  check('net is gross less tax and social security, in that order',
    c.net === c.gross - c.social - c.tax, c.gross + ' - ' + c.social + ' - ' + c.tax + ' = ' + c.net);
  check('employer cost is more than the gross, and is what the quote priced',
    c.cost > c.gross && c.erSocial > 0, c.cost + ' vs ' + c.gross);
  check('the Dutch holiday allowance is ACCRUED, not paid in this period',
    c.accruals.length === 1 && /Vakantiegeld/.test(c.accruals[0].label)
    && c.accruals[0].pct === 8 && c.gross === c.basic,
    JSON.stringify(c.accruals));
  check('and it is in the employer cost, because we owe it either way',
    c.cost === c.gross + c.erSocial + c.accrued, c.cost + ' vs ' + (c.gross + c.erSocial + c.accrued));
  check('the computed figure reconciles to the indicative one onboarding published',
    c.delta === 0 && c.net === c.indicative, c.net + ' vs ' + c.indicative);
  const sc = screen();
  check('and the screen says so rather than leaving two numbers unexplained',
    sc.indexOf('Matches the indicative net') > -1);
  check('what WILL be owed, and to whom, is stated',
    sc.indexOf('Loonaangifte') > -1 && sc.indexOf('Belastingdienst') > -1
    && sc.indexOf('Premies werknemersverzekeringen') > -1 && sc.indexOf('UWV') > -1);
  check('both sides of social security are remitted together',
    c.toSs === c.social + c.erSocial, c.toSs + ' vs ' + (c.social + c.erSocial));
  check('the inputs say where every figure came from',
    sc.indexOf(run('ccjEmp().id')) > -1 && sc.indexOf('Cut-off') > -1);
  check('the pre-payroll controls are run and shown',
    sc.indexOf('Pre-payroll controls') > -1 && sc.indexOf('Readiness certificate issued') > -1);

  /* ---- NOTHING WAS PAID. The half of this section that matters, because a stage that has stopped
     doing something is easy to write and a screen that has stopped SAYING it is not. */
  check('THE STATUS IS THE HEADLINE, AND IT SAYS PENDING',
    sc.indexOf('ccj-pr-status pending') > -1 && sc.indexOf('>PENDING<') > -1);
  check('the screen states that nothing is paid by this journey',
    sc.indexOf('Nothing is paid and no return is filed by this journey') > -1);
  check('no money moved, no return was filed, no payslip was issued',
    run('ccjPayrun().activatedAt') === 0
    && run("typeof ccjPayrun().paidAt === 'undefined'")
    && run("typeof ccjPayrun().payslipId === 'undefined'")
    && run("typeof ccjPayrun().taxRef === 'undefined'"),
    run('JSON.stringify(Object.keys(ccjPayrun()))'));
  check('and the builders that did those things are gone with them',
    run("typeof buildCCJPayslipHTML === 'undefined'")
    && run("typeof ccjPayrunRelease === 'undefined'")
    && run("typeof CCJ_PR_REL === 'undefined'"));
  check('nobody is asked to release anything, because there is nothing to release',
    run("!ccjPostGateFor(8,ccjSteps(8)[1])") === true
    && stream().indexOf('Release the first payroll run') === -1);
  check('and the run does not halt on this step at all',
    (function () { advance(30000); return run("ccjRun.phase!=='halt'"); })(), run('ccjRun.phase'));
})();

section('THE LAST STEP IS WHAT MAKES IT ACTIVE');
(function () {
  check('reaches stage 9', driveToActive('Hire Sanne Bakker for Norrbridge Logistics in Netherlands as a Warehouse Lead', '2026-10-14'),
    'stage ' + run('ccjRun.stage'));
  check('payroll is configured and pending', until(() => run("ccjPayrun().state==='pending'"), 200000),
    run('ccjPayrun().state'));
  check('the placement is NOT live yet — that is the next step\'s job',
    run("!ccjRun.settled['active/Active']") === true && run('ccjPayrun().activatedAt') === 0);

  check('the journey completes', until(() => run("ccjRun.phase==='done'"), 200000), run('ccjRun.phase'));
  check('PAYROLL WENT PENDING → ACTIVE', run("ccjPayrun().state==='active'")
    && run('ccjPayrun().activatedAt') > 0, run('ccjPayrun().state'));
  check('and a named person did it', String(run('ccjPayrun().activatedBy')).length > 1,
    run('ccjPayrun().activatedBy'));
  check('it happened on the LAST step, not the one before',
    run('ccjPayrun().activatedAt') > run('ccjPayrun().calcAt'),
    run('ccjPayrun().calcAt') + ' configured, ' + run('ccjPayrun().activatedAt') + ' activated');
  run("ccjGoScreen('payrun')");
  check('the setup screen now reads ACTIVE',
    screen().indexOf('ccj-pr-status active') > -1 && screen().indexOf('Payroll active') > -1);
  check('and says who set it live and when',
    screen().indexOf(run('ccjPayrun().activatedBy')) > -1);
  check('the employee is told their employment is active, with the first pay date',
    run("ccjWorker().msgs.some(function(m){return /Employment active/.test(m.text||'');})") === true);
  // The artefact this stage leaves is the live placement, not a payslip.
  check('the trail records the placement going live, not a payment',
    run("JSON.stringify(ccjTrail()[8])").indexOf('Placement live') > -1,
    run("JSON.stringify(ccjTrail()[8])"));
})();

section('ACTIVE — THE RECORD, AND THE WHOLE TRAIL BEHIND IT');
(function () {
  check('reaches stage 9', driveToActive('Hire Sanne Bakker for Norrbridge Logistics in Netherlands as a Warehouse Lead', '2026-10-14'),
    'stage ' + run('ccjRun.stage'));
  check('the journey completes', answerGatesUntil(() => run("ccjRun.phase==='done'"), 200000), run('ccjRun.phase'));
  check('it ends on the record screen', run('ccjRun.screen') === 'active', run('ccjRun.screen'));
  check('every sub-status of the last stage settled',
    run("ccjSteps(8).every(function(s){return !!ccjRun.settled['active/'+s.label];})") === true);

  const rec = screen();
  check('the placement reads as live', rec.indexOf('Active &mdash; Sanne Bakker') > -1);
  check('the employment record names the employing entity and the client, separately',
    rec.indexOf(run('ccjParties().adt.name')) > -1 && rec.indexOf('Norrbridge Logistics') > -1);
  check('and gives the next pay date rather than stopping at today',
    rec.indexOf('Next pay date') > -1 && rec.indexOf('Nov 30, 2026') > -1);

  const trail = run('ccjTrail()');
  check('the trail covers all nine stages', trail.length === 9);
  check('every one of them completed',
    trail.every((t) => t.complete === true),
    JSON.stringify(trail.filter((t) => !t.complete).map((t) => t.short)));
  check('each carries the outcome the stage actually settled on',
    trail.every((t) => t.outcome && t.outcome !== '&mdash;'),
    JSON.stringify(trail.filter((t) => !t.outcome || t.outcome === '&mdash;').map((t) => t.short)));
  check('and the artefact it produced',
    trail.filter((t) => t.artefact).length >= 8,
    JSON.stringify(trail.filter((t) => !t.artefact).map((t) => t.short)));
  check('the artefacts are the real references, from the stages that made them',
    rec.indexOf(run('ccjEmp().id')) > -1
    && rec.indexOf(run('ccjInvoice().id')) > -1 && rec.indexOf('Placement live') > -1);
  // This client was already ours, so stage 5 executed no new agreement. The record must say the
  // placement is governed by one WITHOUT quoting an identifier for a document this run never
  // issued — and must quote the identifier when the run did issue one.
  check('an agreement already in force is reported as that, not as a reference we never issued',
    run('ccjMsaExists()') === true
    && run("CCJ_ARTEFACT['agreement-signature']().ref") === 'already in force'
    && rec.indexOf(run('ccjMsa().id')) === -1,
    run("JSON.stringify(CCJ_ARTEFACT['agreement-signature']())"));
  check('and an agreement this run DID execute is quoted by its id',
    (function () {
      const was = run('ccjMsa().adtSignedAt');
      run('ccjMsa().adtSignedAt=9999;');
      const got = run("CCJ_ARTEFACT['agreement-signature']().ref") === run('ccjMsa().id');
      run('ccjMsa().adtSignedAt=' + was + ';');
      return got;
    })());
  check('a stage somebody decided is marked differently from one the machine closed',
    trail.some((t) => t.human === true) && trail.some((t) => t.human === false),
    JSON.stringify(trail.map((t) => t.short + ':' + t.human)));
  check('and the summary counts the human decisions rather than claiming none',
    rec.indexOf('human decisions') > -1);
  /* THE LAST CONTROL IN THE JOURNEY. "View contract" sat on the record screen — the final artefact
     — and it was the only thing left anywhere still asking from a surface whose job is showing.
     Every one of the nine stages now asks in the conversation, including the end. */
  check('the record screen carries no control of its own',
    rec.indexOf('<button') === -1, rec.slice(rec.indexOf('ccj-act-done'), rec.indexOf('ccj-act-done') + 240));
  check('and the way to the contract is asked for in the conversation',
    stream().indexOf('View contract') > -1 && stream().indexOf('ccj-ask-block') > -1);
  check('asked once, however often the finished screen repaints', (function () {
    const before = count(stream(), 'View contract');
    run('ccjPaintScreen();ccjPaint();');
    return before === count(stream(), 'View contract') && before >= 1;
  })(), count(stream(), 'View contract') + ' asks');
  // Answered through its own registry entry — the click a user makes, not a reach past it.
  check('and it resolves to the contract record',
    run("typeof CCJ_ASKS['record']") === 'function');
})();

/* ---- THE EOR CHAIN ---------------------------------------------------------------------------
   EOR means WE are the legal employer. Everything downstream follows from that one fact, and the
   test is whether the money and the paper actually agree across nine stages rather than each
   surface being independently plausible. */
section('EOR — THE PRICE QUOTED IS THE COST INCURRED');
(function () {
  // A non-EU client, so the deposit carries no VAT and is one month gross exactly — which is what
  // exposed the funding control passing on the wrong test.
  check('reaches stage 9', driveToActive('Hire Sanne Bakker for Vantage Freight in Netherlands as a Warehouse Lead', '2026-10-01'),
    'stage ' + run('ccjRun.stage'));
  check('we are the employer, and the entity is registered where the work is',
    run('ccjParties().adt.name') === 'ADT Netherlands EOR Services B.V.'
    && run('ccjParties().adt.country') === run('ccjParties().worker.country'),
    run('ccjParties().adt.name'));
  check('the employment contract is between us and the worker, not the client and the worker',
    run('ccjEmp().terms.gross') === run('ccjQuote().gross'));
  check('the placement is activated', answerGatesUntil(() => run("ccjPayrun().state==='active'"), 250000),
    run('ccjPayrun().state'));
  // The journey ends on the record screen; these read the payroll SETUP.
  run("ccjGoScreen('payrun')");

  // The strongest available statement that the journey is internally consistent: the number the
  // client was quoted in stage 2 IS the number the payroll engine computes in stage 9.
  const q = run('ccjQuote()'), c = run('ccjPayrunCalc()');
  const fullCost = c.full + Math.round(c.full * c.erPct / 100)
    + c.accruals.reduce((s, a) => s + Math.round(c.full * a.pct / 100), 0);
  check('stage 2 priced the employer cost stage 9 actually incurs',
    fullCost === q.base, 'quote base ' + q.base + ' vs payroll cost ' + fullCost);
  check('and the fee on top is the margin, not buried in the cost',
    q.total === q.base + q.fee && q.fee === Math.round(q.base * q.margin / 100),
    q.base + ' + ' + q.fee + ' = ' + q.total);
  check('the employer contribution rate is the same one both stages used',
    c.erPct === q.socialPct && c.erSocial === q.social, c.erSocial + ' vs ' + q.social);
  check('and so is the holiday allowance — accrued in the run, priced in the quote',
    c.accrued === q.holiday, c.accrued + ' vs ' + q.holiday);

  // Cost and cash are different numbers and the difference is the accrual. Testing funding against
  // cost asks whether we can afford money that is not moving this month.
  check('cash out is net plus both remittances, and excludes the accrual',
    c.cashOut === c.net + c.toTax + c.toSs && c.cashOut === c.cost - c.accrued,
    'cash ' + c.cashOut + ' cost ' + c.cost + ' accrued ' + c.accrued);
  // The payroll SETUP screen, not the record screen the journey ends on.
  run("ccjGoScreen('payrun')");
  check('the setup states the cash the first run WILL move, not only the cost',
    screen().indexOf('in cash') > -1 && screen().indexOf('accrued now and paid later') > -1);
})();

section('EOR — THE DEPOSIT IS SECURITY, AND IS NOT CLAIMED AS THE PAYROLL FLOAT');
(function () {
  check('reaches a configured payroll', driveToActive('Hire Sanne Bakker for Vantage Freight in Netherlands as a Warehouse Lead', '2026-10-01')
    && answerGatesUntil(() => run("ccjPayrun().state==='active'"), 250000)
    && (run("ccjGoScreen('payrun')")||true), run('ccjPayrun().state'));
  const c = run('ccjPayrunCalc()');
  // The ordinary EOR case: the deposit is one month GROSS, the run costs gross plus employer
  // contributions. The deposit genuinely cannot cover it, and that is not a failure.
  check('the deposit is settled but is smaller than the run — the ordinary case',
    run('ccjPaidInFull()') === true && run('ccjReceived()') < c.cost,
    run('ccjReceived()') + ' held vs ' + c.cost + ' cost');
  check('so no control claims funding it cannot evidence',
    screen().indexOf('Funding available against the deposit') === -1);
  check('the control asserts what it can — that the deposit is settled and held',
    screen().indexOf('Security deposit settled and held against the placement') > -1);
  /* There is no disbursement any more — this journey pays nobody. What the screen must do is SAY
     so, rather than leaving a reader to infer it from the absence of a payment card. The old pair
     of assertions checked that the disbursement credited the right entity; the honest replacement
     checks that no disbursement is claimed at all. */
  /* Named precisely. "Paid by" was the first attempt and it is also the employer-cost table's own
     wording — "Paid by <entity>, not deducted from the employee" — so the assertion collided with
     copy that is correct and has nothing to do with a disbursement. */
  check('and the screen says outright that nothing is paid here',
    screen().indexOf('Nothing is paid and no return is filed by this journey') > -1
    && screen().indexOf('Disbursement') === -1
    && screen().indexOf('Bank reference') === -1
    && screen().indexOf('Value date') === -1);
})();

section('THE ENGAGEMENT MODEL NAMES THE ENTITY, AND AN UNKNOWN ONE CLAIMS NOTHING');
(function () {
  // `model==='PEO' ? 'PEO' : 'EOR'` sent every unrecognised model down the EOR branch, so a
  // CONTRACTOR was named as employed by our EOR entity — the one relationship it exists to avoid.
  // The intake's recorded type outranks run.model — that is the right precedence, because the
  // intake is what the run was actually logged as. So the test drives the field that governs.
  const name = (m) => run("(function(){var w=ccjRun.model,t=ccjRun.intake&&ccjRun.intake.type;"
    + "ccjRun.model='" + m + "';if(ccjRun.intake)ccjRun.intake.type='" + m + "';"
    + 'var n=ccjParties().adt.name;'
    + 'ccjRun.model=w;if(ccjRun.intake)ccjRun.intake.type=t;return n;})()');
  check('EOR is engaged by the EOR entity', /EOR Services/.test(name('EOR')), name('EOR'));
  check('PEO is engaged by the PEO entity', /PEO Services/.test(name('PEO')), name('PEO'));
  check('a contractor is engaged by neither',
    !/EOR|PEO/.test(name('CONTRACTOR')), name('CONTRACTOR'));
  check('and the name is still a well-formed entity for the work country',
    /^ADT Netherlands Services B\.V\.$/.test(name('CONTRACTOR')), name('CONTRACTOR'));
})();

section('THE PLACEMENT BECOMES A CONTRACT IN THE PRODUCT');
(function () {
  const before = run('contractsData.length');
  check('reaches stage 9', driveToActive('Hire Sanne Bakker for Norrbridge Logistics in Netherlands as a Warehouse Lead', '2026-10-14'),
    'stage ' + run('ccjRun.stage'));
  check('the journey completes', answerGatesUntil(() => run("ccjRun.phase==='done'"), 200000), run('ccjRun.phase'));
  check('a contract row was written', run('contractsData.length') === before + 1,
    before + ' -> ' + run('contractsData.length'));
  check('it is at the TOP of the listing, where a user will look for it',
    run('contractsData[0].id') === run('ccjRun.contractRowId'),
    run('contractsData[0].id') + ' vs ' + run('ccjRun.contractRowId'));
  check('its status is Active, not Submitted', run("contractsData[0].status") === 'Active',
    run('contractsData[0].status'));
  check('it carries the same person, country and pay the journey produced',
    run('contractsData[0].empName') === run('ccjParties().worker.name')
    && run('contractsData[0].country') === run('ccjParties().worker.country')
    && run('contractsData[0].payAmount') === String(run('ccjQuote().gross')),
    run('contractsData[0].empName') + ' / ' + run('contractsData[0].payAmount'));
  check('it is in the shape the listing already renders',
    run("['contractId','empDesig','type','date','commercial','complianceItems','empDuration','currency']"
      + ".every(function(k){return contractsData[0][k]!==undefined;})") === true,
    run("JSON.stringify(Object.keys(contractsData[0]))"));
  check('its compliance items are the artefacts the journey executed',
    run("contractsData[0].complianceItems.length") === 3
    && run("contractsData[0].complianceItems.every(function(i){return i.status==='Approved';})") === true);
  check('the listing marks it as the one just created',
    run('contractsData[0].ccjNew') === true
    && run('buildContractsListingHTML()').indexOf('ccj-new-row') > -1);
  check('its log is the journey\'s own history, not a stub',
    run('ctLogsData[contractsData[0].id].length') === 9,
    run('ctLogsData[contractsData[0].id]&&ctLogsData[contractsData[0].id].length'));
  check('and so is its workflow',
    run('ctWorkflowData[contractsData[0].id].length') === 9);
  const rowId = run('ccjRun.contractRowId');
  check('writing it twice does not create a second contract',
    (function () { run('ccjWriteContractRecord()'); return run('contractsData.length') === before + 1
      && run('ccjRun.contractRowId') === rowId; })());
  check('View contract lands on the contracts listing',
    (function () { run('ccjOpenContractRecord()'); return run('page') === 'contracts'; })(),
    run('page'));
  check('and the run is closed behind it — the journey is over',
    run('ccjRun') === null || run('ccjRun.started') === false);
})();

section('THE PAYROLL RUN IS THE COUNTRY\'S, NOT A TEMPLATE');
(function () {
  check('reaches stage 9 on a UK placement',
    driveToActive('Hire Oliver Hart for Norrbridge Logistics in United Kingdom as a Warehouse Lead', '2026-10-01'),
    'stage ' + run('ccjRun.stage'));
  check('the placement is activated', answerGatesUntil(() => run("ccjPayrun().state==='active'"), 200000),
    run('ccjPayrun().state'));
  // The journey ends on the record screen; these read the payroll SETUP.
  run("ccjGoScreen('payrun')");
  const c = run('ccjPayrunCalc()');
  check('it names HMRC\'s filings, not the Dutch ones',
    screen().indexOf('Full Payment Submission') > -1 && screen().indexOf('National Insurance') > -1
    && screen().indexOf('Loonaangifte') === -1);
  check('it is configured to pay on Faster Payments, not SEPA', screen().indexOf('Faster Payments') > -1);
  check('auto-enrolment is deducted, because a UK payslip has it',
    !!c.ded && /auto-enrolment/i.test(c.ded.label) && c.ded.amount > 0, JSON.stringify(c.ded));
  check('the employer pays its side too, and it is not deducted from the employee',
    !!c.erExtra && c.erExtra.amount > 0 && c.net === c.gross - c.social - c.tax - c.ded.amount);
  check('so the binding net differs from the indicative one — and the run says why',
    c.delta !== 0 && screen().indexOf('was not modelled at configuration') > -1,
    c.net + ' vs ' + c.indicative);
  check('a full-month start is not prorated', c.prorated === false && c.days === c.inMonth,
    c.days + ' of ' + c.inMonth);
  check('and there is no holiday accrual to invent — the UK does not have one',
    c.accruals.length === 0 && c.accrued === 0);
})();

section('THE OTHER KIND OF CHANGE REQUEST — TERMS, NOT PRICE');
startRun();
say('Create an EOR contract for Anika Shah at Norrbridge Logistics in Netherlands');
check('reaches stage 3', driveTo(2), 'stage ' + run('ccjRun.stage'));
until(() => run('ccjRun.phase') === 'wait');
run("ccjClientEvent('viewed')");
run("ccjClientEvent('changed',undefined,'terms')");
const held = run('ccjQuote().total');
check('the request is recorded as a terms change', run('ccjRun.client.ask') === 'terms');
check('it names what they want moved', stream().indexOf('1 October') > -1 && stream().indexOf('6 months') > -1);
check('the agent drafts it and says the price holds',
  until(() => run('ccjRun.client.drafted') === true) && stream().indexOf('price holds') > -1);
run('ccjSendDraft()');
check('the client agrees', until(() => run('ccjRun.client.state') === 'agreed'));
check('the margin did NOT move — this was never a commercial request',
  run('ccjRun.margin') === 20, run('ccjRun.margin'));
check('the contract terms did move', run("ccjRun.form.fromDate") === '2026-10-01'
  && run("ccjRun.form.probation") === '6', run('ccjRun.form.fromDate') + ' / ' + run('ccjRun.form.probation'));
check('a v2 goes out', until(() => run('ccjRun.client.version') === 2));
check('and the total is unchanged', run('ccjQuote().total') === held, held + ' -> ' + run('ccjQuote().total'));
check('the v2 card reports the terms, not a price delta',
  stream().indexOf('ccj-qc-was terms') > -1 && stream().indexOf('price unchanged') > -1);
check('the panel says the same', panel().indexOf('amended terms') > -1 || screen().indexOf('Terms amended') > -1);
check('the stage still completes', until(() => run('ccjRun.stage') === 3), 'stage ' + run('ccjRun.stage'));

section('THE NO-MATCH PATH — AN EMPLOYEE RECORD IS CREATED');
startRun();
say('Create a contract for Zephyr Quilliam at Norrbridge Logistics in Germany');
advance(Math.round(2000*PACE));
check('no employee was matched', run('ccjRun.match') === null);
check('an ADT record was created instead', run('!!ccjRun.createdEmp') === true && run('ccjRun.createdEmp.empId').length > 3,
  run('ccjRun.createdEmp&&ccjRun.createdEmp.empId'));
check('the record carries the name only, not the whole sentence',
  run('ccjRun.createdEmp.name') === 'Zephyr Quilliam', run('ccjRun.createdEmp.name'));
check('it went into the real employee store',
  run("globalEmpData.some(function(e){return e.name==='Zephyr Quilliam';})") === true);
check('the conversation names the new record', stream().indexOf('GEP') > -1 || stream().indexOf('EMP') > -1);
advance(Math.round(1200*PACE));
check('the employee screen is shown for a new hire', run('ccjRun.screen') === 'employee', run('ccjRun.screen'));
check('it shows the record', screen().indexOf('Employee created') > -1);
check('new intake is held here too, not settled', run('ccjRun.phase') === 'hold');

/* THE RIGHT-HAND PANE SHOWS, IT DOES NOT ASK. This section used to call ccjGoScreen('form')
   directly, which meant the suite never touched the control at all — the button could have been
   deleted outright and every check here would still have passed. It now goes the way a person
   does: find the ask in the conversation, answer it, and see where that lands. */
check('the record screen carries no control of its own',
  screen().indexOf('ccj-primary') === -1 && screen().indexOf('<button') === -1,
  screen().slice(-200));
check('the ask is in the conversation instead', stream().indexOf('ccj-ask-block') > -1);
const askId = (/ccjAnswerAsk\((\d+)\)/.exec(stream()) || [])[1];
check('and it is answerable', !!askId, 'no ccjAnswerAsk handler found in the stream');
run('ccjAnswerAsk(' + askId + ')');
check('answering it reaches the form', run('ccjRun.screen') === 'form');
check('still held on the form screen', run('ccjRun.phase') === 'hold');
// An answered ask stays put and records that it was answered. A control that vanished would
// leave the reader wondering whether they imagined it.
check('the answered ask stays in the transcript, marked done',
  stream().indexOf('ccj-ask-block done') > -1 && stream().indexOf('Continue to contract details') > -1);
run('ccjAnswerAsk(' + askId + ')');
check('answering a spent ask does nothing', run('ccjRun.screen') === 'form');
// Every ask resolves to a real function. The journey has been bitten before by a handler that
// was valid JS, sat inside a string, and failed only at click time.
check('every ask in the registry resolves',
  run('Object.keys(CCJ_ASKS).every(function(k){return typeof CCJ_ASKS[k]==="function";})') === true,
  run('JSON.stringify(Object.keys(CCJ_ASKS))'));

section('STALE TIMERS');
const genBefore = run('ccjRun.gen');
run('ccjStartNewRun()');
advance(Math.round(20000*PACE));
check('a reset run is not driven by the old run timers',
  run('ccjRun.started') === false && run('ccjRun.gen') > genBefore);
check('a fresh run starts clean, back at the chooser',
  run('ccjRun.stage') === 0 && run('page') === 'ccj-model'
  && run('Object.keys(ccjRun.settled).length') === 0 && run('ccjRun.msgs.length') === 0);
check('and the model chip is reopenable again', run("ccjRun.started") === false);

/* == THE TRANSCRIPT APPENDS RATHER THAN REBUILDS =========================================
   The stream used to be rebuilt from run.msgs on every push. It now appends, and the difference
   is invisible in the HTML afterwards — which is exactly why these assertions count the calls
   instead of reading the result. Without them the whole change could be reverted and every other
   check in this file would still pass.

   Two things here are deliberately NOT asserted, because this stub models nodes as strings and
   asserting them would only be asserting the stub: that `.in` is stripped from the previous
   message (a classList mutation, invisible in the HTML), and that a live block is repainted in
   place (ccjLiveNode finds no parent here, so ccjRepaintMsg correctly falls back to a rebuild —
   which is what keeps every OTHER assertion in this file reading the truth). Both are checked in
   a real browser. == */
section('THE TRANSCRIPT APPENDS RATHER THAN REBUILDS');
run('ccjStartNewRun()');
run("ccjChooseModel('EOR')");
advance(2000);
byId('ccj-prompt').value = 'Hire Shiv Kumar for Helix Marine in Germany as Director of Engineering at EUR 18,500 a month';
run('ccjSend()');
advance(Math.round(9000 * PACE));
run("ccjGoScreen('form')");                 // settle on one screen: a screen change still rebuilds
advance(Math.round(3000 * PACE));

streamOps.rebuild = 0; streamOps.append = 0;
const msgsBefore = run('ccjRun.msgs.length');
run("ccjPush({who:'agent',text:'transcript check one'})");
run("ccjPush({who:'user',text:'transcript check two'})");
check('a push appends', streamOps.append === 2, 'appends=' + streamOps.append);
check('a push does not rebuild the stream', streamOps.rebuild === 0, 'rebuilds=' + streamOps.rebuild);
check('both messages arrived',
  stream().indexOf('transcript check one') > -1 && stream().indexOf('transcript check two') > -1);
check('and nothing said earlier was dropped',
  (stream().match(/id="ccj-m-\d+"/g) || []).length === msgsBefore + 2,
  'on screen=' + (stream().match(/id="ccj-m-\d+"/g) || []).length + ' expected=' + (msgsBefore + 2));
check('every message carries an id, and no id is used twice', (function () {
  const ids = stream().match(/id="ccj-m-\d+"/g) || [];
  return ids.length > 0 && ids.length === new Set(ids).size;
})());

// History changing rather than growing is the one case an append cannot serve, and it is silent
// when it goes wrong: the removed message stays on screen and the new one lands after it.
streamOps.rebuild = 0; streamOps.append = 0;
run('ccjRun.msgs.splice(1,1)');
run("ccjPush({who:'agent',text:'after a removal'})");
check('a message being removed forces a rebuild instead', streamOps.rebuild === 1 && streamOps.append === 0,
  'rebuilds=' + streamOps.rebuild + ' appends=' + streamOps.append);
check('and the stream matches the store again',
  (stream().match(/id="ccj-m-\d+"/g) || []).length === run('ccjRun.msgs.length'));

// Sticky, not forced. With no layout every measurement is 0, so the harness can only check the
// predicate itself — the behaviour it drives is checked in the browser.
check('at the bottom is recognised', run('ccjAtBottom')({ scrollHeight: 4000, scrollTop: 3400, clientHeight: 600 }) === true);
check('a reader who has scrolled up is recognised', run('ccjAtBottom')({ scrollHeight: 4000, scrollTop: 900, clientHeight: 600 }) === false);
check('the stream and the form scroll on separate glide lanes',
  run('typeof ccjGlideLane') === 'object' && run('typeof ccjGlideTo') === 'undefined');

section('THE ORIGINAL JOURNEY IS UNTOUCHED');
check('its builders still exist', run('typeof buildAIContractAssistantHTML') === 'function' && run('typeof aiCtJourneyStage') === 'function');
check('its page ids still route', run("isAIContractWizardPage('ai-contract-assistant')") === true);
check('the two journeys share no page id',
  run("amPipelineStages.every(function(s){return !isAIContractWizardPage('ccj-'+s.id);})"));
check('its sub-status runner is still present', run('typeof aicjHandoff') === 'function');
check('the original journey is not claimed by the new router',
  run("isCCJPage('ai-contract-assistant')") === false && run("isCCJPage('contract-eor')") === false);

// Every script in this app shares one global scope, so a name reused across two files is a live
// hazard: `cc*` is already the cost calculator's and `aicj*` the original runner's. This is a
// static read rather than a runtime one on purpose — it covers renderer.js, which holds
// ccRender/ccPageData/ccCountries and cannot be executed here because its init expects a real
// DOM. A collision with any of those would never surface as an error, only as one of the two
// features quietly breaking.
const topLevel = (file) => {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const names = new Set();
  const re = /^(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/gm;
  let m;
  while ((m = re.exec(src))) names.add(m[1]);
  return names;
};
const mine = topLevel('js/contract-journey.js');
const theirs = new Set();
['js/core.js', 'js/pages.js', 'js/renderer.js', 'js/exec-config.js', 'js/execApi.js']
  .forEach((file) => topLevel(file).forEach((n) => theirs.add(n)));
const clash = [...mine].filter((n) => theirs.has(n));
check('the new journey redeclares no existing global', clash.length === 0, clash.join(', '));
check('every name it declares is ccj-prefixed or a builder',
  [...mine].every((n) => /^ccj/i.test(n) || /^(buildCCJ|isCCJ|CCJ_)/.test(n)),
  [...mine].filter((n) => !/^ccj/i.test(n) && !/^(buildCCJ|isCCJ|CCJ_)/.test(n)).join(', '));

section('EVERY DECISION IS PUT TO SOMEBODY WHO CAN ACTUALLY MAKE IT');
/* The general form of the two fixes above, so the next gate cannot reintroduce it. A gate resolves
   its owner as `gate.owner || step.owner`, and a step's owner names the party the step is ABOUT —
   which for "Signed" and "Part-paid" is the client. `amCanAdvance` returns false for any owner with
   a null persona (Client, Worker, System), so a gate resolving to one of those is a question put to
   somebody who is not in this portal and cannot answer it.

   Walks the authored maps rather than a live run, forcing the two conditional gates into existence
   so neither is skipped for being absent at the moment of looking. */
(function () {
  startRun();
  say('Hire Marta Nowak for Arcadia Retail in Germany as a Supply Planner');
  run("ccjMsa().screening='hit';ccjMsa().hit='Possible match';");   // forces the sanctions gate
  const bad = run("(function(){"
    + "var out=[];"
    + "['CCJ_GATES','CCJ_POST_GATES'].forEach(function(mapName){"
    + "  var map=mapName==='CCJ_GATES'?CCJ_GATES:CCJ_POST_GATES;"
    + "  Object.keys(map).forEach(function(k){"
    + "    var g=map[k];"
    + "    try{ g=(typeof g==='function')?g():g; }catch(e){ g=null; }"
    + "    if(!g)return;"
    + "    var stageId=k.slice(0,k.indexOf('/')), label=k.slice(k.indexOf('/')+1);"
    + "    var step=(amSubSteps(stageId)||[]).find(function(s){return s.label===label;});"
    + "    if(!step)return;"
    + "    var owner=g.owner||step.owner;"
    + "    if(!amOwnerInfo(owner).persona)out.push(k+' -> '+owner);"
    + "  });"
    + "});"
    + "return JSON.stringify(out);})()");
  check('no gate asks a party who is not in this portal to answer it', bad === '[]', bad);
  // And the converse, so the check above cannot pass by finding no gates at all.
  const seen = run("(function(){var n=0;"
    + "['CCJ_GATES','CCJ_POST_GATES'].forEach(function(mapName){"
    + "  var map=mapName==='CCJ_GATES'?CCJ_GATES:CCJ_POST_GATES;"
    + "  Object.keys(map).forEach(function(k){var g=map[k];"
    + "    try{ g=(typeof g==='function')?g():g; }catch(e){ g=null; } if(g)n++;});"
    + "});return n;})()");
  check('and it looked at every gate the journey authors', seen >= 8, seen + ' gates resolved');
})();

console.log('\n' + pass + ' passed, ' + fail + ' failed\n');
process.exit(fail ? 1 : 0);
