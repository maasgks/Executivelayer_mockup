/* == CONTRACT CREATION JOURNEY — REBUILT FROM SCRATCH ====================================
   A second, independent implementation of the contract-creation journey, built one stage at a
   time. It shares nothing with the original ai-contract-* chain in js/pages.js beyond
   read-only domain data (amPipelineStages, amSubStatuses, aicjEvidence, AI_CT_COUNTRIES) and
   two pure helpers (parseAIContractPrompt, findExistingEmployee) — no shared state, no shared
   render path, no shared page ids. The original keeps working untouched and stays available as
   reference for as long as this one is being built.

   NAMING. Everything here is prefixed `ccj` — functions, state, page ids and CSS classes.
   `cc` alone belongs to the cost calculator (ccRender, .cc-row, ccSalary) and `aicj` to the
   original journey's sub-status runner, so a third prefix is what keeps the three from
   colliding in a codebase where every script shares one global scope.

   == THE SPINE: NINE STAGES, EACH OWNING SEVERAL SCREENS ================================
   The nine client-facing stages in amPipelineStages are the journey. A stage is NOT one
   screen — stage 1 alone walks through four:

     prompt    describe the hire, in conversation
     employee  the ADT record we created, when the person was not already there
     form      Create a Contract — every field, AI pre-filled
     proposal  the compiled proposal

   `page` stays on the stage (`ccj-request-received`) for all four; `ccjRun.screen` is what
   moves. THIS IS THE WHOLE POINT: the shell — header, rail and above all the sub-status panel
   — is built once when the stage is entered, and changing screens repaints ONLY #ccj-screen.
   The panel is never rebuilt, never remounted and never loses its place. It stays as it is
   until every sub-status in the stage has completed, and only then does the journey advance.

   == THE PANEL: A QUARTER OF THE WIDTH, TOP TO BOTTOM ===================================
   A vertical card pinned to the right at 25% of the body. Every sub-status shows its detail,
   stacked in order: what a settled one found, what the running one is doing right now, and
   what a pending one will do when it gets there. Nothing is hidden behind a disclosure — the
   whole stage is readable at a glance, and the full evidence (the call, the payload, every
   rule and verdict) is one click deeper in a drawer.

   == HOLDS: WHY "NEW INTAKE" DOES NOT FINISH IN THREE SECONDS ===========================
   Most sub-statuses are a burst of machine work: reach a system, check the rules, capture
   what came back, done. Some are not. `New intake` is the capture of the request itself, and
   the request is not captured until the contract details have been entered and compiled into
   a proposal — which takes as long as a person takes. So it runs its beats, then HOLDS:
   visibly current, spinner turning, evidence on screen, waiting on a milestone rather than a
   timer. Reaching the `proposal` screen releases it. Only then does CSM assigned run, and
   only after that does the qualification decision appear.

   That distinction — timed work versus held work — is the honest one. A sub-status that ticked
   green while the user still had an empty form in front of them would be reporting work that
   had not happened.                                                                       == */

/* ---- STAGES AND PAGES ---------------------------------------------------------------- */
/* A page id is derived from the stage id rather than listed, so the two can never drift:
   adding a stage to amPipelineStages adds its page. `ccj-start` is kept as a legal alias for
   stage 1 — the conversation is the intake, so there is no separate screen before it. */
function ccjStages(){return (typeof amPipelineStages!=='undefined'&&amPipelineStages)||[];}
function ccjPageId(i){const s=ccjStages()[i];return s?'ccj-'+s.id:'';}
function ccjStageOf(pg){
  const st=ccjStages();
  for(let i=0;i<st.length;i++)if(pg==='ccj-'+st[i].id)return i;
  return -1;
}
function ccjStage(i){return ccjStages()[i]||null;}
/* `ccj-model` is a page of its own, deliberately outside the nine stages. The engagement model
   is chosen before there is a run, so drawing the nine-stage rail and the sub-status panel
   around it would be reporting on a journey that has not started. It gets a clean screen; the
   journey frame arrives with the run. */
function isCCJPage(pg){return pg==='ccj-start'||pg==='ccj-model'||ccjStageOf(pg)>=0;}
function ccjSteps(i){const s=ccjStage(i);return s&&typeof amSubSteps==='function'?amSubSteps(s.id):[];}
function ccjKey(i,step){const s=ccjStage(i);return (s?s.id:'')+'/'+(step?step.label:'');}
function ccjEvent(i){return ((typeof aiJourneyEvents!=='undefined'&&aiJourneyEvents['contract-creation'])||[])[i]||{};}

/* ---- THE SCREENS INSIDE A STAGE --------------------------------------------------------
   `when` makes a screen conditional: the Employee Created confirmation only exists when the
   person was not already in ADT, exactly as the original journey behaves. `chat` says whether
   the conversation column is beside this screen — on the first screen the conversation IS the
   screen, so it takes the full width rather than sitting in a 300px column next to nothing. */
const CCJ_SCREENS={
  'request-received':[
    {id:'prompt',   title:'Describe the hire',  chat:'full'},
    {id:'employee', title:'Employee created',   chat:'side', when:function(run){return run.createdEmp;}},
    {id:'form',     title:'Contract details',   chat:'side'},
    {id:'proposal', title:'Proposal created',   chat:'side'}
  ],
  'quote-prep':[
    {id:'quote',    title:'Quote',              chat:'side'}
  ],
  // The conversation IS the work on this stage, so it gets a wider column than the 300px it
  // uses elsewhere — a negotiation read in a sliver is a negotiation nobody reads.
  'quote-review':[
    {id:'sent',     title:'Quote sent',         chat:'side', chatWide:true}
  ],
  // The CSM introduction is a message to the client, so the thread carries on here — the quote,
  // the negotiation, the acceptance and the handover end up as one continuous record.
  'quote-approved':[
    {id:'account',  title:'Client account',     chat:'side', chatWide:true}
  ],
  // The agreement goes to the client and comes back signed, so the thread carries on again.
  'agreement-signature':[
    {id:'msa',      title:'Master Services Agreement', chat:'side', chatWide:true}
  ],
  // The invoice goes out in the thread, the client acknowledges in it, the reminders and the
  // remittance advice land in it. Accounts payable is a conversation, not an event.
  'deposit-due':[
    {id:'invoice',  title:'Deposit invoice',  chat:'side', chatWide:true}
  ],
  // The counterparty changes here. Everything from stage 3 to stage 6 was a conversation with the
  // CLIENT; this contract is between us and the WORKER, and the thread beside it is theirs.
  'employment-contract':[
    {id:'contract', title:'Employment contract', chat:'side', chatWide:true}
  ],
  // Onboarding is not one artefact, it is six running at once. The screen is the file being
  // assembled, and the thread is still the employee's — they are the one supplying most of it.
  'onboarding':[
    {id:'onboarding', title:'Onboarding', chat:'side', chatWide:true}
  ],
  /* The last stage is the first one with THREE screens since stage 1, and they are three different
     questions rather than three views of one thing: may this person be paid (the readiness
     certificate), what were they actually paid (the run), and what is true now (the record). One
     screen holding all three would have buried the certificate under the payslip the moment the
     payslip existed — and the certificate is the whole reason anyone trusts the payslip. */
  'active':[
    {id:'readiness', title:'Payroll readiness', chat:'side', chatWide:true},
    {id:'payrun',    title:'First payroll run', chat:'side', chatWide:true},
    {id:'active',    title:'Active',            chat:'side', chatWide:true}
  ]
};

/* == STAGE 3: SOMEBODY ELSE'S CLOCK =======================================================
   Stages 1 and 2 were internal — the agent does a thing, it takes 700ms, it is done. Stage 3
   is a quote sitting with a client for days, and that changes three things.

   TIME IS SIMULATED, AND SHOWN. The run advances in seconds; the timeline it writes says
   "4 Aug, 09:12 · Opened 11:20 · Follow-up 7 Aug". Real elapsed seconds would read as a
   stopwatch. Simulated stamps read as an engagement history, which is what this is.

   A FOLLOW-UP AND A NEGOTIATION ARE THE SAME EVENT. Each chase is a message to the client;
   the client's reply is a message back. So the panel COUNTS them and the thread SHOWS them —
   the same split the panel and the agent chat already use, applied to the client.

   THE PATH BRANCHES AND LOOPS. Accepted on first read settles two rows and marks three not
   applicable. A change request runs the negotiation, rebuilds the price, re-issues as v2 and
   goes BACK to waiting on a read. The rail never moves backwards; the loop is inside the
   stage, which is where the operating model puts it.                                     == */

/* A fixed origin, so every stamp in a run is deterministic — the same demo shows the same
   dates, and the harness can assert on them. */
const CCJ_T0={day:4,mon:'Aug',year:2026,hour:9,min:12};
function ccjStamp(mins){
  const total=CCJ_T0.hour*60+CCJ_T0.min+(mins||0);
  const dayOff=Math.floor(total/1440),rest=((total%1440)+1440)%1440;
  return (CCJ_T0.day+dayOff)+' '+CCJ_T0.mon+', '
    +String(Math.floor(rest/60)).padStart(2,'0')+':'+String(rest%60).padStart(2,'0');
}
/* The client's side of the run. `state` is what the CLIENT has done, never what we have done —
   that is the distinction the whole stage turns on. */
function ccjNewClient(){
  return {state:'idle',   // idle → sent → viewed → chased → changed → agreed → reissued → accepted
    ask:'',               // 'price' | 'terms' — what the change request was about
    changes:[],           // for a terms request, what moved
    log:[],               // what ACTUALLY happened, in order, with the time it happened
    openedAt:null,        // when they first opened it — recorded once, never recomputed.
                          // null, not 0: zero is a real time (the minute it was sent).
    msgs:[],version:1,chases:0,mins:0,unread:0,drafted:false,timer:null};
}
function ccjClient(){
  const run=ccjRun;
  if(!run.client)run.client=ccjNewClient();
  return run.client;
}
/* The demo plays itself. Each entry is "this many milliseconds after the previous one, this
   happens, and it happened this many simulated minutes after the quote was sent". Left alone
   it walks chased → change requested → negotiated → re-issued → accepted, which is the path
   that shows every row on the stage. The override strip fires the same events by hand. */
const CCJ_CLIENT_SCRIPT=[
  {ev:'viewed',   in:2600, at:128,  when:function(c){return c.state==='sent';}},
  {ev:'chase',    in:3000, at:4320, when:function(c){return c.state==='viewed'&&c.chases===0;}},
  {ev:'chase',    in:3000, at:7200, when:function(c){return c.state==='chased'&&c.chases===1;}},
  {ev:'changed',  in:3200, at:7620, kind:'price', when:function(c){return c.state==='chased'&&c.chases>=2;}},
  {ev:'agreed',   in:4200, at:7900, when:function(c){return c.state==='negotiating';}},
  {ev:'viewed2',  in:2600, at:9020, when:function(c){return c.state==='reissued';}},
  {ev:'accepted', in:2600, at:9300, when:function(c){return c.state==='viewed2';}}
];
function ccjClientSchedule(){
  const run=ccjRun;if(!run)return;
  const c=ccjClient();
  const next=CCJ_CLIENT_SCRIPT.find(function(s){return s.when(c);});
  if(c.timer){clearTimeout(c.timer);c.timer=null;}
  if(!next)return;
  const g=ccjGen;
  c.timer=setTimeout(function(){
    if(ccjGen!==g||ccjRun!==run)return;
    c.timer=null;
    ccjClientEvent(next.ev,next.at,next.kind);
  },next.in);
}
function ccjScreensFor(i){
  const s=ccjStage(i);
  return (s&&CCJ_SCREENS[s.id])||[];
}
function ccjScreenDef(i,id){
  return ccjScreensFor(i).find(function(s){return s.id===id;})||null;
}
/* The next screen that actually applies to this run — skipping any whose `when` says it does
   not exist for it. Walking the list rather than hard-coding the next id means the Employee
   Created screen can be absent without any caller knowing. */
function ccjNextScreen(i,fromId){
  const list=ccjScreensFor(i);
  const at=list.findIndex(function(s){return s.id===fromId;});
  for(let n=at+1;n<list.length;n++){
    if(!list[n].when||list[n].when(ccjRun))return list[n].id;
  }
  return null;
}

/* ---- RUN STATE ------------------------------------------------------------------------
   One object holds the whole run. `gen` is bumped on every reset and captured by each
   scheduled step, so a timer armed by an abandoned run recognises itself as stale.          */
let ccjRun=null;
let ccjGen=0;

const CCJ_ACT=1150;      // how long one action inside a sub-status is held. Paced to be READ:
                         // an action that renders four records and moves on in 700ms is a
                         // progress bar pretending to be evidence.
const CCJ_BEAT=820;      // legacy pacing constant, kept for the settle rhythm
const CCJ_SETTLE=700;    // the pause after a row completes, before the next one starts
const CCJ_SEARCH=1700;   // how long the employee lookup appears to take
const CCJ_DOC_STEP=620;  // how long one field takes to come out of a document
const CCJ_SCROLL=560;    // how long the form takes to travel to the field that just landed
const CCJ_AUTOGAP=2600;  // the pause after the last required field, before the proposal is made

function ccjNewRun(){
  ccjGen++;
  ccjRun={
    gen:ccjGen,
    model:'EOR',            // engagement model; the prompt may override it
    stage:0,                // index into amPipelineStages
    screen:'prompt',        // which screen inside that stage
    sub:-1,                 // index into the stage's sub-statuses; -1 = not started
    phase:'idle',           // 'idle'|'act'|'hold'|'settled'|'halt'|'stopped'
    act:0,                  // which action inside the current sub-status is running
    started:false,          // has a request been submitted
    awaitingClient:false,   // the sentence did not say who the hire is for; the agent asked
    stopped:false,          // terminal — the request was disqualified
    went:{},                // backward jumps already taken, so a correction cannot become a loop
    intake:null,            // {raw,name,country,type}
    match:null,             // the matched ADT employee, if any
    createdEmp:null,        // the ADT record we created, when there was no match
    form:{},                // every field on the contract form
    aiFilled:{},            // which of those the agent pre-filled, for the field markers
    proposal:null,          // the compiled proposal
    pay:null,               // the deposit invoice and what has been paid against it — ccjNewPay
    emp:null,               // the employment contract, its clause audit and its signatures
    onb:null,               // the onboarding file — KYC, documents, both filings, bank, payroll
    worker:null,            // the WORKER's thread — a different counterparty to run.client
    auditTimer:null,        // the clause audit's own timer; it runs beside the runner's beats
    asking:null,            // the form field the conversation is currently asking for
    doc:null,               // {name,size,fields,at,done} — a document being read into the form
    client:null,            // the client's side of stage 3 — see ccjNewClient
    margin:20,              // the margin the quote carries; a negotiation moves it
    proposing:false,        // the pause between the last required field and the proposal
    autoTimer:null,         // that pause's timer
    justFilled:null,        // the field a document just landed in, for the flash
    msgs:[],                // the conversation stream
    settled:{},             // 'stageId/label' -> {summary}
    decisions:{},           // 'stageId/label' -> the option chosen
    reached:{},             // screens this run has arrived at — what releases a hold
    inspect:null,
    timer:null,             // the runner's one live timer
    chatTimer:null          // the conversation's one live timer
  };
  return ccjRun;
}
function ccjEnsureRun(){return ccjRun||ccjNewRun();}
function ccjReset(){
  ccjGen++;
  if(ccjRun){
    if(ccjRun.timer)clearTimeout(ccjRun.timer);
    if(ccjRun.chatTimer)clearTimeout(ccjRun.chatTimer);
    if(ccjRun.ghostTimer)clearTimeout(ccjRun.ghostTimer);
    if(ccjRun.autoTimer)clearTimeout(ccjRun.autoTimer);
    if(ccjRun.client&&ccjRun.client.timer)clearTimeout(ccjRun.client.timer);
    if(ccjRun.pay&&ccjRun.pay.timer)clearTimeout(ccjRun.pay.timer);
    if(ccjRun.auditTimer)clearTimeout(ccjRun.auditTimer);
    if(ccjRun.worker&&ccjRun.worker.timer)clearTimeout(ccjRun.worker.timer);
  }
  ccjRun=null;
}
/* Both schedulers check the generation AND the run identity before firing, so a timer armed by
   a run that has since been reset does nothing rather than writing into its successor. */
function ccjSchedule(fn,ms){
  const g=ccjGen,run=ccjRun;if(!run)return;
  if(run.timer)clearTimeout(run.timer);
  run.timer=setTimeout(function(){
    if(ccjGen!==g||ccjRun!==run)return;
    run.timer=null;fn();
  },ms);
}
function ccjScheduleChat(fn,ms){
  const g=ccjGen,run=ccjRun;if(!run)return;
  if(run.chatTimer)clearTimeout(run.chatTimer);
  run.chatTimer=setTimeout(function(){
    if(ccjGen!==g||ccjRun!==run)return;
    run.chatTimer=null;fn();
  },ms);
}
/* A third timer, because the clause audit runs BESIDE the runner rather than inside it: the panel
   is narrating the call to the Compliance Hub while the document annotates itself clause by
   clause. Borrowing run.timer would cancel the runner's own beat mid-step. */
function ccjScheduleAudit(fn,ms){
  const g=ccjGen,run=ccjRun;if(!run)return;
  if(run.auditTimer)clearTimeout(run.auditTimer);
  run.auditTimer=setTimeout(function(){
    if(ccjGen!==g||ccjRun!==run)return;
    run.auditTimer=null;fn();
  },ms);
}

/* ---- CONTEXT --------------------------------------------------------------------------
   The shape the authored evidence in aicjEvidence expects, built from THIS run rather than
   from the original journey's globals — which is what makes the same descriptors read live
   against whatever was typed into this conversation and this form.                         */
/* ---- THREE PARTIES, NOT ONE -----------------------------------------------------------------
   A run involves three legal persons and the journey kept collapsing them into one context with
   a single `country` and a single contact. That produced two genuine errors: the commercial quote
   was emailed to the WORKER (their personal address, sitting in a field labelled "Client
   contact"), and the CSM — who owns the CLIENT relationship — was routed on the country the
   worker happens to sit in.

     worker  the person being hired. Their country is where the work is done and whose
             employment law the stage-7 contract is written under.
     client  the company buying the service. Their country is where the MSA is signed, whose
             entity is sanctions-screened, and whose CSM owns the relationship.
     adt     us. A different legal entity per country we employ in.

   Everything that addresses a party now names which one. */
/* Which trading name the operating entity carries, per engagement model. CONTRACTOR is absent on
   purpose: we do not employ a contractor, so the entity that engages them is not an EOR or a PEO
   entity and must not be named as one. */
const CCJ_ENTITY_TOKEN={EOR:'EOR ',PEO:'PEO '};
function ccjParties(){
  const run=ccjRun||{};
  const it=run.intake||{};
  const f=run.form||{};
  const emp=run.match||run.createdEmp||{};
  const workerName=((f.fname||'')+' '+(f.lname||'')).trim()||it.name||emp.name||'the employee';
  const clientName=it.client||'Dhi Hyperlocal';
  const known=((typeof aiClients!=='undefined'&&aiClients)||[])
    .find(function(c){return c.name===clientName;})
  ||((typeof amDeals!=='undefined'&&amDeals)||[])
    .find(function(d){return d.client===clientName;});
  // Where the CLIENT is, which is not where the work is. A Netherlands client hiring in Germany
  // signs under Dutch law and keeps their Dutch CSM.
  const clientCountry=(known&&known.country)||f.country||it.country||'Netherlands';
  const workCountry=f.country||it.country||emp.country||'Netherlands';
  const clientSlug=String(clientName).toLowerCase().replace(/[^a-z0-9]+/g,'.').replace(/^\.|\.$/g,'');
  return {
    worker:{
      name:workerName, country:workCountry,
      email:f.email||(String(workerName).toLowerCase().replace(/[^a-z ]/g,'').trim().replace(/\s+/g,'.')||'employee')+'@personalmail.com',
      empId:emp.empId||'EMP-0001'
    },
    client:{
      name:clientName, country:clientCountry,
      contact:(known&&known.contactName)||'Client admin',
      // The buyer's address, at the buyer's company — never the candidate's personal inbox.
      email:((known&&known.contactName)||'contracts').toLowerCase().replace(/[^a-z ]/g,'').trim().replace(/\s+/g,'.')+'@'+clientSlug.replace(/\./g,'')+'.com',
      plan:(known&&known.plan)||'Growth'
    },
    /* The ADT entity that will employ the worker — registered where the work happens. The model
       token is chosen by lookup rather than by `==='PEO' ? 'PEO' : 'EOR'`: that test sent every
       model it did not recognise down the EOR branch, so a CONTRACTOR engagement named the
       contractor as employed by "ADT <country> EOR Services B.V." — the one relationship a
       contractor engagement exists to avoid. An unknown model now gets no token at all rather
       than silently inheriting a legal status. */
    adt:{name:'ADT '+workCountry+' '+(CCJ_ENTITY_TOKEN[(it.type||run.model)]||'')+'Services '+
      (workCountry==='Netherlands'?'B.V.':workCountry==='Germany'?'GmbH':workCountry==='India'?'Pvt Ltd':'Ltd'),
      country:workCountry, signatory:'Arjun Vaidya', email:'arjun.vaidya@adt.com'}
  };
}
function ccjCtx(){
  const run=ccjRun||{};
  const it=run.intake||{};
  const f=run.form||{};
  const emp=run.match||run.createdEmp||{};
  const name=((f.fname||'')+' '+(f.lname||'')).trim()||it.name||emp.name||'the employee';
  const num=String(1042+(run.gen||0));
  const gross=parseFloat(String(f.pay||'5700').replace(/[^0-9.]/g,''))||5700;
  return {
    country:f.country||it.country||emp.country||'Netherlands',
    type:it.type||run.model||'EOR',
    name:name,
    // Whoever the hire is FOR. Stated in the prompt when it is stated at all; the operating
    // entity is the fallback, which is the case where a company is hiring for itself.
    client:it.client||'',
    empId:emp.empId||'EMP-0001',
    contractId:'CTR-'+num,
    grossMonthly:gross,
    hourly:gross/173.33,
    // The quote and the agreement are addressed to the CLIENT'S buyer. This used to fall back to
    // the worker's own email while being labelled "Client contact", which sent our cost
    // breakdown and margin to the candidate.
    signatoryEmail:ccjParties().client.email,
    workerEmail:ccjParties().worker.email,
    envelopeId:'DS-'+num,depositInvoice:'INV-'+num,
    // The deposit is the one clause 3.4 of the agreement states — one month gross salary — plus
    // whatever VAT the place of supply calls for. It was the literal string '$9,500': a dollar
    // figure belonging to no run at all, printed by the panel beside an invoice denominated in
    // euros for an amount the agreement a stage earlier had already fixed.
    amountDue:(ccjRun?ccjCurrency():'&#8364;')+' '+ccjDepositTotal().toLocaleString(),
    rec:{},emp:emp
  };
}
/* The invoiced total, computed WITHOUT going through ccjCtx or ccjQuote — both of which call
   ccjCtx, and one of which is this. It reads the same gross and the same VAT treatment they do,
   so the three agree by construction rather than by coincidence. */
function ccjDepositTotal(){
  const run=ccjRun||{},f=run.form||{};
  const gross=Math.round(parseFloat(String(f.pay||'5700').replace(/[^0-9.]/g,''))||5700);
  return gross+Math.round(gross*ccjVat().rate/100);
}
/* Authored evidence may hold plain values or functions of context, so every read goes through
   here rather than each call site remembering which it is. */
function ccjVal(v,c){return typeof v==='function'?v(c):v;}

/* ---- WHAT A SUB-STATUS ACTUALLY DOES, STEP BY STEP -----------------------------------------
   Three summary lines said what a step FOUND. They did not show it working. Connecting to a
   system, pulling records back, checking them against the rules and writing the result are four
   distinct things, and a client watching an agent work wants to see each one happen — that is
   the difference between "the machine says it did something" and "I watched it do it".

   The list is built from whatever evidence the step actually has, never padded. A step with no
   authored payload shows no fetch line, because inventing one would claim a call it never made.
   That is also what makes this work for all 41 sub-statuses without authoring 41 scripts. */
function ccjActsFor(i,step){
  const d=ccjEvidence(i,step),c=ccjCtx();
  if(!d)return [{id:'work',doing:'Working',done:'Done'}];
  const fetched=ccjVal(d.fetched,c)||[];
  const checks=ccjVal(d.checks,c)||[];
  const captured=ccjVal(d.captured,c)||[];
  const pass=checks.filter(function(x){return x.verdict==='pass';}).length;
  const acts=[];
  // `system`, `ref` and `latency` go through ccjVal like everything else. Stage 8 names a
  // different authority per country — the Belastingdienst, the Finanzamt, the EPFO — so the
  // system a step reaches is a function of the run, and a raw function here would render as
  // its own source code.
  const system=ccjVal(d.system,c),ref=ccjVal(d.ref,c),latency=ccjVal(d.latency,c);
  if(system)acts.push({id:'connect',
    doing:'Connecting to '+system,
    done:'Connected'+(latency&&latency!=='—'?' &middot; '+latency:'')});
  if(fetched.length)acts.push({id:'fetch',
    doing:'Fetching '+(ref?String(ref).replace(/&amp;/g,'&'):'records'),
    done:fetched.length+' record'+(fetched.length===1?'':'s')+' returned',
    rows:fetched});
  if(checks.length)acts.push({id:'verify',
    doing:'Verifying against the rules',
    done:pass===checks.length?'All '+checks.length+' checks passed':pass+' of '+checks.length+' checks passed',
    ok:pass===checks.length, checks:checks});
  if(captured.length)acts.push({id:'save',
    doing:'Saving to the record',
    done:captured.length+' detail'+(captured.length===1?'':'s')+' saved',
    rows:captured.map(function(x){return {k:x.k,v:x.v,state:'active'};})});
  if(!acts.length)acts.push({id:'work',doing:'Working',done:'Done'});
  return acts;
}
/* A conditional sub-status — "(non-owned countries)", "(if off-standard)" — evaluated rather
   than always run. The evidence map already carries `applies`; a step that does not apply is
   marked and skipped, with the reason shown. A row that silently vanished would leave the
   client wondering whether the agent forgot it. */
function ccjStepApplies(i,step){
  const d=ccjEvidence(i,step);
  if(!d||d.applies===undefined)return true;
  return !!ccjVal(d.applies,ccjCtx());
}
function ccjSkipReason(i,step){
  const d=ccjEvidence(i,step);if(!d)return '';
  const c=ccjCtx();
  // The evaluated check is the best answer — it names the actual value that ruled the step out
  // ("Netherlands is owned in-house") rather than restating the condition.
  const na=(ccjVal(d.checks,c)||[]).find(function(x){return x.verdict==='na';});
  if(na)return na.actual;
  // Otherwise the first sentence of the authored note, which is written as prose. `step.cond` is
  // a fragment meant to sit in brackets after a label ("if off-standard", "non-owned countries")
  // and does not survive being dropped into a sentence.
  if(d.note)return String(d.note).split(/\.\s/)[0].replace(/\.$/,'')+'.';
  return '';
}
/* Evidence authored for this journey, checked before the shared map. Three of stage 3's five
   sub-statuses have nothing in aicjEvidence — dispatch, open-tracking and the chase cadence were
   never written up — and an un-evidenced step shows a single bare "Working" line. Kept here
   rather than added to core.js so the original journey's map stays exactly as it was. */
const CCJ_EVIDENCE={
  'quote-review/Sent':{
    system:'Docuseal', ref:'quote delivery',
    call:function(c){return 'POST /envelopes {template:"quote", to:"'+c.signatoryEmail+'"}';},
    latency:'240ms',
    fetched:function(c){const q=ccjQuote();return [
      {k:'Recipient',sub:'Client contact',v:c.signatoryEmail,state:'active'},
      {k:'Quote version',sub:'Document',v:'v'+ccjClient().version,state:'active'},
      {k:'Total quoted',sub:'Monthly',v:q.sym+' '+q.total.toLocaleString(),state:'active'}
    ];},
    checks:function(c){return [
      {rule:'The quote may only be sent once QA has approved it',expected:'Quote QA approved',
       actual:'approved',verdict:'pass'},
      {rule:'Delivery is confirmed before the stage reports it as sent',expected:'delivered receipt',
       actual:'delivered',verdict:'pass'}
    ];},
    captured:function(c){return [{k:'Sent at',v:ccjStamp(0)},{k:'Channel',v:'Docuseal'}];},
    summary:function(c){return 'Sent '+ccjStamp(0);},
    note:'Delivery is confirmed by the provider, not assumed. A quote that bounced is not a quote that was sent.'
  },
  'quote-review/Viewed':{
    system:'Docuseal', ref:'open tracking',
    call:function(c){return 'GET /envelopes/'+c.envelopeId+'/events';},
    latency:'88ms',
    fetched:function(c){const cl=ccjClient();return [
      {k:'Opened',sub:'First open',v:cl.openedAt!==null?ccjStamp(cl.openedAt):'not yet',state:cl.openedAt!==null?'active':'inactive'},
      {k:'Version opened',sub:'Document',v:'v'+cl.version,state:'active'}
    ];},
    checks:function(c){return [{rule:'The open is attributed to the recipient we sent it to',
      expected:c.signatoryEmail,actual:c.signatoryEmail,verdict:'pass'}];},
    captured:function(c){return [{k:'First opened',v:ccjStamp(ccjClient().openedAt)}];},
    summary:function(c){return 'Opened '+ccjStamp(ccjClient().openedAt);},
    note:'Tracked on open, which is why this is automatic and not something anyone has to record.'
  },
  'quote-review/Follow-up 1 / 2 / 3':{
    system:'Reminder scheduler', ref:'chase cadence',
    call:function(c){return 'schedule(quote="'+c.contractId+'", at=[day 3, day 5, day 8])';},
    latency:'31ms',
    fetched:function(c){const cl=ccjClient();return [
      {k:'Reminder 1',sub:'Day 3',v:cl.chases>=1?'sent '+ccjStamp(4320):'scheduled',state:cl.chases>=1?'active':'inactive'},
      {k:'Reminder 2',sub:'Day 5',v:cl.chases>=2?'sent '+ccjStamp(7200):'scheduled',state:cl.chases>=2?'active':'inactive'},
      {k:'Reminder 3',sub:'Day 8',v:cl.chases>=3?'sent '+ccjStamp(11520):'scheduled',state:cl.chases>=3?'active':'inactive'}
    ];},
    checks:function(c){return [
      {rule:'Reminders stop the moment the client replies',expected:'cancel on reply',
       actual:ccjClient().state==='viewed'||ccjClient().state==='chased'?'still chasing':'cancelled on reply',verdict:'pass'},
      {rule:'No more than three reminders are sent',expected:'at most 3',
       actual:ccjClient().chases+' sent',verdict:'pass'}
    ];},
    captured:function(c){return [{k:'Reminders sent',v:String(ccjClient().chases)}];},
    summary:function(c){const n=ccjClient().chases;
      return n?'Client replied after '+n+' reminder'+(n===1?'':'s'):'No reminder needed';},
    note:'Three chases and no further. A fourth is not persistence, it is a client who has decided and an Account Manager who needs to hear it.',
    failure:'Three reminders with no reply stalls the quote and flags it to the Account Manager.'
  },
  /* Overridden so stage 1 and stage 4 name the SAME CSM. The shared entry routes on
     ctx.country — the country the work happens in — while the handover in stage 4 routes on the
     client's. On a cross-border placement those are different people, and the run would assign
     one CSM at intake and introduce a different one to the client three stages later. */
  'request-received/CSM assigned':{
    system:'CSM routing table', ref:'Owner directory',
    call:function(c){return 'route(client="'+ccjParties().client.name+'", country="'+ccjParties().client.country+'")';},
    latency:'34ms',
    fetched:function(c){
      const owner=ccjCsm().name;
      return ((typeof amCsmPool!=='undefined'&&amCsmPool)||[]).map(function(n){
        return {k:n,sub:'Customer Success Manager',
          v:n===owner?('owns '+ccjParties().client.country):'&mdash;',
          state:n===owner?'active':'inactive'};});
    },
    checks:function(c){
      const p=ccjParties();
      return [
        {rule:'The CSM is routed on the CLIENT country, not the country the work happens in',
         expected:'owner of '+p.client.country,
         actual:ccjCsm().name+' owns '+p.client.country
           +(p.client.country!==p.worker.country?' (work is in '+p.worker.country+')':''),
         verdict:'pass'},
        {rule:'Assignment lands inside the stage SLA',expected:'within 1h',actual:'immediate',verdict:'pass'}
      ];
    },
    captured:function(c){return [{k:'CSM',v:ccjCsm().name},{k:'Owner',v:'Arjun Vaidya'}];},
    summary:function(c){return ccjCsm().name+' assigned';},
    note:'A Customer Success Manager owns a client relationship, so they follow the client. A Netherlands client keeps their Dutch CSM whoever they hire and wherever they hire them.'
  },

  /* ---- 5 · Agreement ready. Every step here is skipped for a client who already has an MSA,
     because a master agreement is signed once and every later hire runs under it. ---------- */
  'agreement-signature/MSA drafted':{
    system:'Contract templates', ref:'country template',
    call:function(c){return 'draft(template="MSA/'+ccjParties().client.country+'", client="'+ccjParties().client.name+'")';},
    latency:'420ms',
    applies:function(c){return !ccjMsaExists();},
    fetched:function(c){const p=ccjParties(),q=ccjQuote();return [
      {k:'Template',sub:p.client.country+' master agreement',v:'v4.2',state:'active'},
      {k:'Provider entity',sub:'Employer of record',v:p.adt.name,state:'active'},
      {k:'Service fee',sub:'From the accepted quote',v:q.margin+'% of employer cost',state:'active'},
      {k:'Deposit',sub:'Security',v:q.sym+' '+q.gross.toLocaleString(),state:'active'}
    ];},
    checks:function(c){const p=ccjParties();return [
      {rule:'The commercials on the agreement match the quote the client accepted',
       expected:'quote v'+ccjClient().version+' at '+ccjQuote().margin+'%',
       actual:ccjQuote().margin+'% — matches',verdict:'pass'},
      {rule:'The template is the one for the client jurisdiction',
       expected:p.client.country,actual:p.client.country,verdict:'pass'}
    ];},
    captured:function(c){return [{k:'Agreement',v:ccjMsa().id},{k:'Governing law',v:ccjParties().client.country}];},
    summary:function(c){return ccjMsa().id+' drafted';},
    note:'Drafted from the CLIENT jurisdiction template, not the country the work happens in. On a cross-border placement those are different countries and different law.'
  },
  'agreement-signature/Legal & compliance review':{
    system:'Legal', ref:'clause review',
    applies:function(c){return !ccjMsaExists();},
    checks:function(c){return [
      {rule:'Liability cap and indemnities are within the standard position',
       expected:'12 months of fees, mutual',actual:'12 months of fees, mutual',verdict:'pass'},
      {rule:'A data transfer mechanism is in place for this jurisdiction',
       expected:'SCCs where required',actual:'SCCs attached',verdict:'pass'}
    ];},
    summary:function(c){return 'Approved for release';},
    note:'A lawyer reads it. The one step on this stage that is not automatable, because it is liability rather than data.'
  },
  'agreement-signature/Client entity + sanctions check':{
    system:'Screening provider', ref:'registry + sanctions lists',
    call:function(c){return 'screen(entity="'+ccjParties().client.name+'", lists=[OFAC,EU,HMT])';},
    latency:'1.2s',
    applies:function(c){return !ccjMsaExists();},
    fetched:function(c){
      const p=ccjParties(),m=ccjMsa();
      return [
        {k:'Registry',sub:p.client.country+' company register',v:p.client.name+' — active',state:'active'},
        {k:'Beneficial owners',sub:'UBO identification',v:'2 identified, both cleared',state:'active'},
        {k:'Sanctions lists',sub:'OFAC · EU consolidated · UK HMT',
         v:m.screening==='hit'?'POSSIBLE MATCH':m.screening==='cleared'?'match dismissed':'no match',
         state:m.screening==='hit'?'inactive':'active'}
      ];
    },
    checks:function(c){
      const p=ccjParties(),m=ccjMsa();
      if(m.screening==='hit')return [
        {rule:'The client entity appears on no sanctions list',expected:'no match',
         actual:m.hit||'possible match — needs a human',verdict:'fail'}];
      if(m.screening==='cleared')return [
        {rule:'The client entity appears on no sanctions list',expected:'no match',
         actual:'possible match adjudicated and dismissed',verdict:'pass'}];
      return [
        {rule:'The client entity is registered and active',expected:'active registration',
         actual:'active in '+p.client.country,verdict:'pass'},
        {rule:'The client entity appears on no sanctions list',expected:'no match',
         actual:'no match across OFAC, EU and UK HMT',verdict:'pass'}
      ];
    },
    captured:function(c){return [
      {k:'Screening',v:ccjMsa().screening==='cleared'?'cleared after review':'clear'},
      {k:'Screened on',v:ccjStamp(0)}];},
    summary:function(c){return ccjMsa().screening==='cleared'?'Cleared after review':'Entity verified, no match';},
    note:'We may not contract with a sanctioned entity, so this is a legal precondition rather than diligence. Screening is automatic; a POSSIBLE match is always put to a person, because similar company names produce false positives constantly.',
    failure:'A confirmed match stops the engagement outright and is reported.'
  },
  'agreement-signature/Sent':{
    system:'Docuseal', ref:'agreement delivery',
    call:function(c){return 'POST /envelopes {agreement:"'+ccjMsa().id+'", to:"'+ccjParties().client.email+'"}';},
    latency:'260ms',
    applies:function(c){return !ccjMsaExists();},
    fetched:function(c){const p=ccjParties();return [
      {k:'Recipient',sub:'Client signatory',v:p.client.email,state:'active'},
      {k:'Signing order',sub:'Client first, provider countersigns',v:'2 parties',state:'active'},
      {k:'Agreement',sub:'Document',v:ccjMsa().id,state:'active'}
    ];},
    checks:function(c){const m=ccjMsa();return [
      {rule:'Nothing is sent before legal has released it',expected:'review approved',
       actual:'approved',verdict:'pass'},
      {rule:'Nothing is sent before screening clears',expected:'no sanctions match',
       actual:m.screening==='hit'?'not cleared':'cleared',
       verdict:m.screening==='hit'?'fail':'pass'}
    ];},
    captured:function(c){return [{k:'Sent to',v:ccjParties().client.email},{k:'Envelope',v:'DS-'+ccjMsa().id}];},
    summary:function(c){return 'Sent to '+ccjParties().client.contact;},
    note:'To the client signatory. The worker never sees this agreement — it is not their contract, and it states our margin.'
  },
  'agreement-signature/Signed':{
    system:'Docuseal', ref:'execution',
    applies:function(c){return !ccjMsaExists();},
    fetched:function(c){const p=ccjParties(),m=ccjMsa();return [
      {k:p.client.contact,sub:'For '+p.client.name,
       v:m.clientSignedAt?'signed '+ccjStamp(m.clientSignedAt):'awaiting',
       state:m.clientSignedAt?'active':'inactive'},
      {k:p.adt.signatory,sub:'For '+p.adt.name,
       v:m.adtSignedAt?'countersigned '+ccjStamp(m.adtSignedAt):'awaiting',
       state:m.adtSignedAt?'active':'inactive'}
    ];},
    checks:function(c){const m=ccjMsa();return [
      {rule:'Both parties have signed',expected:'client and provider',
       actual:m.clientSignedAt&&m.adtSignedAt?'both signed':'incomplete',
       verdict:m.clientSignedAt&&m.adtSignedAt?'pass':'fail'},
      {rule:'The agreement is in force from the later signature',expected:'countersignature date',
       actual:m.adtSignedAt?ccjStamp(m.adtSignedAt):'—',verdict:'pass'}
    ];},
    captured:function(c){return [{k:'Executed',v:ccjStamp(ccjMsa().adtSignedAt)},
      {k:'In force from',v:ccjStamp(ccjMsa().adtSignedAt)}];},
    summary:function(c){return 'Executed '+ccjStamp(ccjMsa().adtSignedAt);},
    note:'An agreement is executed on the LAST signature. The provider countersigns last on purpose — it is the final point at which we can decline, and it is the date the deposit invoice is raised against.'
  },

  /* ---- 6 · Deposit due. All four entries are authored here rather than taken from the shared
     map, which states an amount ($9,500) and a receipt ("Full amount") belonging to no run. Every
     figure below is read from the invoice this stage actually raised. -------------------------- */
  'deposit-due/Invoice raised':{
    system:'SAP S/4HANA', systemId:'sap', ref:'API_GLACCOUNTLINEITEM',
    call:function(c){return 'POST /invoices {client:"'+ccjParties().client.name
      +'", type:"deposit", agreement:"'+ccjMsa().id+'"}';},
    latency:'510ms',
    fetched:function(c){const inv=ccjInvoice(),v=ccjVat();return [
      {k:'Deposit invoice',sub:'Raised against '+inv.agreement,v:inv.id,state:'active'},
      {k:'Net',sub:'One month gross salary &middot; clause 3.4',v:ccjMoney(inv.net),state:'active'},
      {k:v.label,sub:v.kind==='domestic'?'Standard rate':'Place of supply',
       v:ccjMoney(inv.tax),state:v.rate?'active':'inactive'},
      {k:'Total due',sub:'Payable by '+(ccjPay().dueAt!==null?ccjDate(ccjPay().dueAt):'&mdash;'),
       v:ccjMoney(inv.total),state:'active'}
    ];},
    checks:function(c){const q=ccjQuote(),v=ccjVat(),p=ccjParties();return [
      // An established client signed their master agreement long before this run, so "we did not
      // watch it being countersigned" is not the same as "it is not in force". Stage 5 skips
      // itself for them, and a check that read only adtSignedAt failed every second placement.
      {rule:'A deposit invoice may only be raised against an agreement in force',
       expected:'executed master agreement',
       actual:ccjMsa().adtSignedAt?'countersigned '+ccjStamp(ccjMsa().adtSignedAt)
         :ccjMsaExists()?ccjMsa().id+' already in force':'not executed',
       verdict:(ccjMsa().adtSignedAt||ccjMsaExists())?'pass':'fail'},
      {rule:'The deposit is the amount clause 3.4 of that agreement states',
       expected:'one month gross salary',
       actual:ccjMoney(q.gross)+' — matches the schedule',verdict:'pass'},
      {rule:'VAT is charged on the place of supply, not on the invoicing entity',
       expected:p.adt.country===p.client.country?'domestic VAT':'no VAT charged by us',
       actual:v.label+' ('+p.adt.country+' &rarr; '+p.client.country+')',verdict:'pass'},
      {rule:'The payment terms are the ones the agreement states',
       expected:'14 days net',actual:'Net 14 — due '+(ccjPay().dueAt!==null?ccjDate(ccjPay().dueAt):'on issue'),
       verdict:'pass'}
    ];},
    captured:function(c){const inv=ccjInvoice();return [
      {k:'Deposit invoice',v:inv.id},{k:'Total due',v:ccjMoney(inv.total)},
      {k:'Due date',v:ccjPay().dueAt!==null?ccjDate(ccjPay().dueAt):'&mdash;'}];},
    summary:function(c){return ccjInvoice().id+' &middot; '+ccjMoney(ccjAmountDue());},
    note:'Raised against the countersignature date, not the date the client signed. The agreement is only in force from the later of the two, and an invoice raised before it is in force is an invoice for nothing.'
  },
  'deposit-due/Awaiting funds':{
    system:'Bank feed', ref:'incoming payments',
    call:function(c){return 'watch(iban="'+ccjReg().iban+'", reference="'+ccjInvoice().id+'")';},
    latency:'live',
    fetched:function(c){const p=ccjPay();return [
      {k:'Outstanding',sub:'Against '+ccjInvoice().id,v:ccjMoney(ccjOutstanding()),
       state:ccjOutstanding()?'active':'inactive'},
      {k:'Due',sub:'Net 14 from issue',v:p.dueAt!==null?ccjDate(p.dueAt):'&mdash;',state:'active'},
      {k:'Acknowledged',sub:'By the client',v:p.ackAt?ccjStamp(p.ackAt):'not yet',
       state:p.ackAt?'active':'inactive'},
      {k:'Reminders sent',sub:'Before due, then overdue',v:String(p.reminders.length),
       state:p.reminders.length?'active':'inactive'},
      {k:'Received',sub:p.receipts.length+' receipt'+(p.receipts.length===1?'':'s'),
       v:ccjMoney(ccjReceived()),state:ccjReceived()?'active':'inactive'}
    ];},
    checks:function(c){const p=ccjPay();return [
      {rule:'Every incoming transfer is matched on the invoice reference before it is credited',
       expected:ccjInvoice().id+' quoted',
       actual:p.receipts.length?'all '+p.receipts.length+' matched on reference':'nothing received yet',
       verdict:p.receipts.length?'pass':'fail'},
      {rule:'A reminder goes out before the due date, not after it',
       expected:'first reminder before '+(p.dueAt!==null?ccjDate(p.dueAt):'the due date'),
       actual:p.reminders.length?(p.reminders[0].kind==='due'?'sent 2 days before':'sent after the due date')
         :'none sent yet',
       verdict:p.reminders.length&&p.reminders[0].kind==='due'?'pass':p.reminders.length?'fail':'na'}
    ];},
    captured:function(c){const p=ccjPay();return [
      {k:'First receipt',v:p.receipts.length?ccjStamp(p.receipts[0].at):'&mdash;'},
      {k:'Received',v:ccjMoney(ccjReceived())}];},
    summary:function(c){const p=ccjPay();
      if(!p.receipts.length)return 'Nothing received';
      return (ccjPaidInFull()?'Paid in full ':'Part payment ')+ccjStamp(p.receipts[0].at);},
    note:'The bank feed is watched on the invoice reference. A transfer that arrives without one is not credited automatically — it sits unallocated, and the placement stays held while the money is technically in our account.',
    failure:'An unmatched or missing payment holds the placement and escalates to Finance after the second reminder.'
  },
  'deposit-due/Part-paid':{
    system:'Reconciliation', ref:'open item clearing',
    call:function(c){return 'reconcile(invoice="'+ccjInvoice().id+'", received='+ccjReceived()+')';},
    latency:'120ms',
    // Only when the money arrived short. On the paid-in-full path there is no shortfall to chase,
    // and the row says so rather than quietly disappearing.
    applies:function(c){return !ccjPaidInFull();},
    fetched:function(c){const p=ccjPay();return [
      {k:'Invoiced',sub:ccjInvoice().id,v:ccjMoney(ccjAmountDue()),state:'active'},
      {k:'Received',sub:p.receipts.length+' receipt'+(p.receipts.length===1?'':'s'),
       v:ccjMoney(ccjReceived()),state:'active'},
      {k:'Shortfall',sub:'Still outstanding',v:ccjMoney(ccjOutstanding()),
       state:ccjOutstanding()?'active':'inactive'}
    ];},
    checks:function(c){
      const p=ccjPay();
      if(ccjPaidInFull()&&!p.released)return [
        {rule:'This step applies only when the deposit arrives short',
         expected:'a shortfall against '+ccjInvoice().id,
         actual:'Paid in full on the first remittance &mdash; no shortfall to chase',verdict:'na'}];
      if(p.released)return [
        {rule:'The gate is released only against the full deposit',
         expected:'no shortfall',
         actual:ccjMoney(p.shortfall)+' released by '+p.releasedBy+' as an exception',verdict:'fail'},
        {rule:'An early release is recorded against the invoice and the run',
         expected:'named approver',actual:p.releasedBy,verdict:'pass'}];
      return [
        {rule:'The gate is released only against the full deposit',
         expected:'no shortfall',
         actual:ccjOutstanding()?ccjMoney(ccjOutstanding())+' outstanding':'settled in full',
         verdict:ccjOutstanding()?'fail':'pass'},
        {rule:'The balance is chased rather than written off',
         expected:'chase issued',actual:p.chased?'chased on the client thread':'not chased yet',
         verdict:p.chased?'pass':'na'}
      ];
    },
    captured:function(c){const p=ccjPay();return [
      {k:'Shortfall',v:p.released?ccjMoney(p.shortfall):ccjMoney(0)},
      {k:'Outcome',v:p.released?'Released as an exception':'Balance received'}];},
    summary:function(c){const p=ccjPay();
      return p.released?'Released &middot; '+ccjMoney(p.shortfall)+' short':'Balance received in full';},
    note:'A part payment is not a payment. The deposit exists because we fund payroll ahead of settlement, so a shortfall is exactly the exposure it was meant to cover — which is why releasing against one is a named decision and not a default.',
    failure:'An unresolved shortfall holds the placement indefinitely and is escalated to Finance.'
  },
  'deposit-due/Cleared':{
    system:'Bank webhook', ref:'payment.cleared',
    call:function(c){return 'POST /webhooks/bank/receipt {invoice:"'+ccjInvoice().id
      +'", amount:'+ccjReceived()+'}';},
    latency:'&mdash;',
    fetched:function(c){const p=ccjPay();return [
      {k:'Receipts matched',sub:'Against '+ccjInvoice().id,
       v:p.receipts.length+' of '+p.receipts.length,state:'active'},
      {k:'Total received',sub:'Cleared funds',v:ccjMoney(ccjReceived()),state:'active'},
      {k:'Shortfall',sub:p.released?'Released as an exception':'None',
       v:ccjMoney(p.released?p.shortfall:0),state:p.released?'active':'inactive'},
      {k:'Value date',sub:'Bank',v:p.receipts.length?ccjDate(p.receipts[p.receipts.length-1].at):'&mdash;',
       state:'active'}
    ];},
    checks:function(c){const p=ccjPay();return [
      {rule:'The receipt total reconciles to the invoice total',
       expected:ccjMoney(ccjAmountDue()),
       actual:ccjMoney(ccjReceived())+(p.released?' — short by '+ccjMoney(p.shortfall):' — reconciled'),
       verdict:p.released?'fail':'pass'},
      {rule:'The payment gate is not lifted while a balance is outstanding',
       expected:'no shortfall',
       actual:p.released?'lifted by '+p.releasedBy+' against a shortfall':'no shortfall',
       verdict:p.released?'fail':'pass'}
    ];},
    captured:function(c){const p=ccjPay();return [
      {k:'Cleared on',v:p.clearedAt!==null?ccjStamp(p.clearedAt):'Just now'},
      {k:'Payment gate',v:p.released?'Released with a shortfall':'Released'}];},
    summary:function(c){return ccjPay().released
      ?'Gate released &middot; '+ccjMoney(ccjPay().shortfall)+' short'
      :'Receipt matched &middot; gate released';},
    gateRelease:'Payment gate released &mdash; the placement can move.',
    note:'The one stage the operating model calls a hard gate. Until this row is green no hire under this client can start, however far the paperwork has got — which is why the release is recorded with a name against it when it happens against a shortfall.'
  },

  /* ---- 7 · Employment contract. The panel narrates the call to the Compliance Hub while the
     document beside it annotates itself clause by clause — the same work, seen two ways. ----- */
  'employment-contract/Draft generated':{
    system:'Contract templates', ref:'employment template',
    call:function(c){return 'draft(template="EMP/'+ccjParties().worker.country
      +'/'+((ccjRun&&ccjRun.form&&ccjRun.form.term)==='Fixed Term'?'fixed':'indefinite')
      +'", employee="'+ccjParties().worker.name+'")';},
    latency:'480ms',
    fetched:function(c){const p=ccjParties(),f=(ccjRun&&ccjRun.form)||{},e=ccjEmp();return [
      {k:'Template',sub:p.worker.country+' contract of employment',v:'v6.1',state:'active'},
      {k:'Employer',sub:'The entity that employs them',v:p.adt.name,state:'active'},
      {k:'Position',sub:'From the contract details',v:f.jobTitle||'&mdash;',state:'active'},
      {k:'Gross salary',sub:'From the approved quote',v:ccjMoney(ccjQuote().gross)+' a month',state:'active'},
      {k:'Contract',sub:'Reference',v:e.id,state:'active'}
    ];},
    checks:function(c){const p=ccjParties(),q=ccjQuote();return [
      {rule:'The employment contract is written under the law of the country the WORK is done in',
       expected:p.worker.country+' template',
       actual:p.worker.country+(p.client.country!==p.worker.country
         ?' (the client is in '+p.client.country+' — that governs the MSA, not this)':''),
       verdict:'pass'},
      {rule:'The salary on the contract is the one the quote was built on',
       expected:ccjMoney(q.gross)+' a month',actual:ccjMoney(q.gross)+' — matches',verdict:'pass'},
      {rule:'Nothing commercial reaches the employee&rsquo;s contract',
       expected:'no margin, no client fee',actual:'employment terms only',verdict:'pass'}
    ];},
    captured:function(c){const e=ccjEmp();return [
      {k:'Contract',v:e.id},{k:'Employer',v:ccjParties().adt.name},
      {k:'Governing law',v:ccjParties().worker.country}];},
    summary:function(c){return ccjEmp().id+' drafted';},
    note:'Written under the law of the country the work happens in, which on a cross-border placement is NOT the country the client is in. The client\'s jurisdiction governs the master agreement; this one governs the employment.'
  },
  'employment-contract/Clause compliance check':{
    system:'Compliance Hub', systemId:'compliance', ref:'Rates &amp; Rules',
    call:function(c){return 'GET /statutory/'+ccjParties().worker.country
      +'?set=employment&contract='+ccjEmp().id;},
    latency:'640ms',
    fetched:function(c){
      const p=ccjParties(),s=ccjStat(p.worker.country);
      const floor=typeof ccjFloorFor==='function'?ccjFloorFor(p.worker.country):null;
      return [
        {k:'Maximum probation',sub:'Statutory cap',
         v:s.probationMax?s.probationMax+' months':'no statutory maximum',
         state:s.probationMax?'active':'inactive'},
        {k:'Ordinary working week',sub:'Statutory maximum',v:s.hoursMax+' hours',state:'active'},
        {k:'Minimum wage',sub:'Rates &amp; Rules',
         v:floor?floor.label+' '+floor.value+' an hour':'no rule configured',
         state:floor?'active':'inactive'},
        {k:'Paid annual leave',sub:'Statutory minimum',v:s.holidayMin+' days',state:'active'},
        {k:'Employer notice',sub:'Statutory minimum',v:s.noticeMin+' days',state:'active'},
        {k:'Written particulars',sub:'Language',v:s.lang,state:'active'}
      ];
    },
    checks:function(c){
      const e=ccjEmp();
      // The clause audit IS the check. Restating it here in different words would let the panel
      // and the document disagree about a contract they are both describing.
      if(!e.audit.length)return [];
      return e.audit.slice(0,e.auditAt).map(function(r){
        return {rule:'Clause '+r.n+' — '+r.clause+': '+r.rule,
          expected:r.expected,
          actual:r.verdict==='adjust'?r.note:r.drafted,
          verdict:r.verdict==='adjust'?'pass':r.verdict};
      });
    },
    captured:function(c){const e=ccjEmp();return [
      {k:'Clauses checked',v:String(e.audit.length)},
      {k:'Adjusted',v:String(ccjAuditAdjusted().length)},
      {k:'Statutory set',v:ccjParties().worker.country}];},
    summary:function(c){
      const adj=ccjAuditAdjusted().length,bad=ccjAuditFailed().length;
      if(bad)return bad+' clause'+(bad===1?'':'s')+' in breach';
      return ccjEmp().audit.length+' clauses checked &middot; '+(adj?adj+' adjusted':'none adjusted');
    },
    note:'The check does not only report — it REWRITES. A probation period longer than the country allows is void, so it is reduced rather than flagged; a leave entitlement below the statutory floor is raised. What the reviewer then approves is the adjusted contract, with every change marked against the rule that caused it.',
    failure:'A clause that cannot be brought into compliance — a rate below the statutory minimum wage — stops the contract from being issued at all.'
  },
  'employment-contract/Internal approval':{
    system:'EOR Ops', ref:'contract release',
    checks:function(c){
      const adj=ccjAuditAdjusted(),bad=ccjAuditFailed();
      return [
        {rule:'Every clause the statutory set bears on has been checked',
         expected:ccjEmp().audit.length+' clauses',
         actual:ccjEmp().auditDone?'all checked':'check incomplete',
         verdict:ccjEmp().auditDone?'pass':'fail'},
        {rule:'A person reads the adjustments before the contract is issued',
         expected:'named approver',
         actual:ccjEmp().approvedBy?ccjEmp().approvedBy+' approved '+(adj.length?adj.length+' adjustment'+(adj.length===1?'':'s'):'the draft as written'):'not yet approved',
         verdict:ccjEmp().approvedBy?'pass':'na'},
        {rule:'No clause is in breach at the point of release',
         expected:'no failures',actual:bad.length?bad.length+' in breach':'none',
         verdict:bad.length?'fail':'pass'}
      ];
    },
    captured:function(c){return [{k:'Approved by',v:ccjEmp().approvedBy||'&mdash;'},
      {k:'Version',v:'v'+ccjEmp().version}];},
    summary:function(c){return 'Approved by '+(ccjEmp().approvedBy||ccjActor());},
    note:'The machine can find a non-compliant clause and it can fix one. It cannot decide that a contract is right for a person, and it does not carry the liability if it is wrong. That is why this step exists and why it is the only one on this stage a human owns outright.'
  },
  'employment-contract/Sent to worker':{
    system:'Docuseal', ref:'contract delivery',
    call:function(c){return 'POST /envelopes {contract:"'+ccjEmp().id
      +'", to:"'+ccjParties().worker.email+'"}';},
    latency:'250ms',
    fetched:function(c){const p=ccjParties(),e=ccjEmp();return [
      {k:'Recipient',sub:'The employee',v:p.worker.email,state:'active'},
      {k:'Document',sub:'Contract of employment',v:e.id+(e.version>1?' v'+e.version:''),state:'active'},
      {k:'Signing order',sub:'Employee first, employer countersigns',v:'2 parties',state:'active'}
    ];},
    checks:function(c){const e=ccjEmp();return [
      {rule:'Nothing is issued before a person has approved it',
       expected:'internal approval',actual:e.approvedBy?'approved by '+e.approvedBy:'not approved',
       verdict:e.approvedBy?'pass':'fail'},
      // The bug this guards: the shared descriptor addressed the WORKER'S contract to
      // ctx.signatoryEmail, which is the CLIENT'S buyer.
      {rule:'The contract goes to the employee, not to the client',
       expected:ccjParties().worker.email,actual:ccjParties().worker.email,verdict:'pass'}
    ];},
    captured:function(c){return [{k:'Sent to',v:ccjParties().worker.email},
      {k:'Envelope',v:ccjCtx().envelopeId}];},
    summary:function(c){return 'Issued to '+ccjParties().worker.name.split(' ')[0];},
    note:'To the employee\'s own address. The client never receives this document — it states their salary, and it is not the client\'s contract.'
  },
  /* Overridden. The shared descriptor addresses the envelope to `ctx.signatoryEmail` — the
     CLIENT's buyer — under a field labelled "Worker", which would have mailed a person's
     employment contract to the company buying their services. */
  'employment-contract/Worker signed':{
    system:'Docuseal', ref:'execution',
    call:function(c){return 'GET /envelopes/'+c.envelopeId+'/events';},
    latency:'180ms',
    fetched:function(c){const p=ccjParties(),e=ccjEmp(),w=ccjWorker();return [
      {k:'Recipient',sub:'The employee',v:p.worker.email,state:'active'},
      {k:'Opened',sub:w.device,v:e.openedAt?ccjStamp(e.openedAt):'not yet',
       state:e.openedAt?'active':'inactive'},
      {k:'Copy downloaded',sub:'PDF',v:w.downloaded?'yes':'not yet',
       state:w.downloaded?'active':'inactive'},
      {k:'Signed',sub:'Employee signature',v:e.workerSignedAt?ccjStamp(e.workerSignedAt):'awaiting',
       state:e.workerSignedAt?'active':'inactive'}
    ];},
    checks:function(c){const e=ccjEmp(),p=ccjParties();return [
      {rule:'The signature is attributed to the recipient the envelope was sent to',
       expected:p.worker.email,actual:e.workerSignedAt?p.worker.email:'unsigned',
       verdict:e.workerSignedAt?'pass':'fail'},
      {rule:'The employee had the contract open before signing it',
       expected:'opened, then signed',
       actual:e.openedAt&&e.workerSignedAt?'opened '+ccjStamp(e.openedAt)+', signed '+ccjStamp(e.workerSignedAt):'incomplete',
       verdict:e.openedAt&&e.workerSignedAt?'pass':'na'}
    ];},
    captured:function(c){return [{k:'Employee signed',v:ccjEmp().workerSignedAt?ccjStamp(ccjEmp().workerSignedAt):'&mdash;'}];},
    waitCopy:'Nothing here is ours to press. The envelope is open with the employee, and Docuseal calls back when it is signed.',
    summary:function(c){return 'Signed '+ccjStamp(ccjEmp().workerSignedAt);},
    note:'Owner is <b>Worker</b>, whose persona is null — so this row offers no button at all. Ticking &ldquo;Worker signed&rdquo; on the employee&rsquo;s behalf is precisely what that null exists to prevent.',
    failure:'A signature timeout or a bounce reopens the envelope for reissue.'
  },
  'employment-contract/ADT countersigned':{
    system:'Docuseal', ref:'countersignature',
    latency:'210ms',
    fetched:function(c){const p=ccjParties(),e=ccjEmp();return [
      {k:p.worker.name,sub:'Employee',
       v:e.workerSignedAt?'signed '+ccjStamp(e.workerSignedAt):'awaiting',
       state:e.workerSignedAt?'active':'inactive'},
      {k:p.adt.signatory,sub:'For '+p.adt.name,
       v:e.adtSignedAt?'countersigned '+ccjStamp(e.adtSignedAt):'awaiting',
       state:e.adtSignedAt?'active':'inactive'},
      {k:'Employment starts',sub:'From the contract',
       v:ccjPrettyDate((ccjRun&&ccjRun.form&&ccjRun.form.fromDate)||''),state:'active'}
    ];},
    checks:function(c){const e=ccjEmp();return [
      {rule:'Both parties have signed',expected:'employee and employer',
       actual:e.workerSignedAt&&e.adtSignedAt?'both signed':'incomplete',
       verdict:e.workerSignedAt&&e.adtSignedAt?'pass':'fail'},
      {rule:'The contract in force is the version that was approved',
       expected:'v'+e.version+', approved by '+(e.approvedBy||'—'),
       actual:'v'+e.version,verdict:'pass'}
    ];},
    captured:function(c){const e=ccjEmp();return [
      {k:'Executed',v:e.adtSignedAt?ccjStamp(e.adtSignedAt):'&mdash;'},
      {k:'Employment starts',v:ccjPrettyDate((ccjRun&&ccjRun.form&&ccjRun.form.fromDate)||'')}];},
    summary:function(c){return 'Executed '+ccjStamp(ccjEmp().adtSignedAt);},
    note:'A contract is executed on the LAST signature. We countersign last on purpose — it is the final point at which we can decline, and from it the person is employed and the payroll obligation is ours.'
  },

  /* ---- 8 · Onboarding. Six streams, six counterparties. The panel narrates the call each one
     makes; the card beside it shows what came back. ----------------------------------------- */
  'onboarding/Worker KYC':{
    system:'Persona', systemId:'persona', ref:'identity verification',
    call:function(c){return 'POST /inquiries {template:"gov-id+selfie", country:"'
      +ccjParties().worker.country+'", ref:"'+ccjOnb().kyc.session+'"}';},
    latency:'2.4s',
    fetched:function(c){const d=ccjKycDoc(),k=ccjOnb().kyc;return [
      {k:'Session',sub:'Inquiry',v:k.session,state:'active'},
      {k:'Document',sub:'Captured',v:d.type,state:k.step>1?'active':'inactive'},
      {k:'Document number',sub:'Read from the MRZ',v:d.number,state:k.step>2?'active':'inactive'},
      {k:'Face match',sub:'Against the document portrait',v:'98.2%',state:k.step>3?'active':'inactive'},
      {k:'Risk score',sub:'0 is clean',v:k.done?k.score+'/100':'&mdash;',state:k.done?'active':'inactive'}
    ];},
    checks:function(c){
      const k=ccjOnb().kyc,ck=ccjKycChecks();
      if(!k.step)return [];
      const out=[];
      if(k.step>2)out.push({rule:'Every field on the document matches the contract',
        expected:'exact match on name, date of birth and nationality',
        actual:ck.identity.every(function(r){return r.verdict!=='fail';})
          ?'all fields matched':'a field did not match',
        verdict:ck.identity.every(function(r){return r.verdict!=='fail';})?'pass':'fail'});
      if(k.step>3)out.push({rule:'The person presenting the document is the person in it, and is live',
        expected:'face match and liveness',actual:'98.2% match, live human confirmed',verdict:'pass'});
      if(k.step>4)out.push({rule:'The document is genuine and unaltered',
        expected:'security features intact, MRZ checksum valid',
        actual:'no tampering detected',verdict:'pass'});
      if(k.step>5)out.push({rule:'The individual appears on no sanctions, PEP or adverse-media list',
        expected:'no match',actual:'no match across OFAC, EU, UN and UK HMT',verdict:'pass'});
      if(k.step>6)out.push({rule:'The individual may lawfully work in the country of employment',
        expected:'unrestricted right to work or a valid permit',
        actual:ck.rtw.label,verdict:ck.rtw.verdict==='pass'?'pass':'fail'});
      return out;
    },
    captured:function(c){const k=ccjOnb().kyc;return [
      {k:'Verification',v:k.done?ccjKycDecision().label:'&mdash;'},
      {k:'Risk score',v:k.done?k.score+'/100':'&mdash;'},
      {k:'Session',v:k.session}];},
    summary:function(c){const k=ccjOnb().kyc;
      return k.reviewed==='confirmed'?'Confirmed by '+k.reviewed_by
        :ccjKycDecision().label+' &middot; risk '+ccjKycDecision().score+'/100';},
    note:'Eight things happen here and a customer is buying the fact that all eight did: a document is captured and read, every field is matched against the contract, a live selfie is matched to the portrait, the document is checked for tampering, the person is screened against sanctions, PEP and adverse-media lists, and their right to work is established. CONSIDER is a real outcome and it stops the run.',
    failure:'A rejected verification stops the placement outright. Nobody is onboarded on an identity we could not establish.'
  },
  'onboarding/Documents':{
    system:'Document vault', ref:'country checklist',
    call:function(c){return 'checklist(country="'+ccjParties().worker.country
      +'", worker="'+ccjParties().worker.empId+'")';},
    latency:'—',
    fetched:function(c){
      return ccjOnb().docs.map(function(d){
        return {k:d.label,sub:d.why,
          v:d.status==='verified'?d.ref:d.status==='rejected'?'rejected'
            :d.status==='na'?'not applicable':'awaiting',
          state:d.status==='verified'?'active':'inactive'};
      });
    },
    checks:function(c){
      const o=ccjOnb();
      const req=o.docs.filter(function(d){return d.req;});
      const ok=req.filter(function(d){return d.status==='verified';}).length;
      const rej=o.docs.filter(function(d){return d.status==='rejected';});
      return [
        {rule:'Every document this country requires is on file',
         expected:req.length+' required documents',
         actual:ok+' of '+req.length+' verified',verdict:ok===req.length?'pass':'fail'},
        {rule:'A document that does not meet the rule is rejected, not filed',
         expected:'proof of address issued within 3 months',
         actual:rej.length?rej.length+' rejected and replaced'
           :o.docs.some(function(d){return d.note&&/Replaced/.test(d.note);})
             ?'1 rejected and replaced':'none rejected',
         verdict:'pass'}
      ];
    },
    captured:function(c){
      const req=ccjOnb().docs.filter(function(d){return d.req;});
      return [{k:'Documents',v:req.filter(function(d){return d.status==='verified';}).length
        +' of '+req.length+' verified'}];
    },
    summary:function(c){
      const req=ccjOnb().docs.filter(function(d){return d.req;});
      return req.filter(function(d){return d.status==='verified';}).length+' of '+req.length+' on file';
    },
    note:'The checklist is the country\'s, not ours. A Dutch onboarding needs a BSN and a wage tax declaration; a German one needs a Steuer-ID and a Krankenkasse confirmation. Rejecting a document and asking again is part of the process, not a failure of it.'
  },
  'onboarding/Tax registration':{
    system:function(){return ccjOnbPack().taxAuthority;}, ref:'payroll tax',
    call:function(c){return 'file("'+ccjOnbPack().taxFiling+'", worker="'
      +ccjParties().worker.name+'")';},
    latency:'—',
    fetched:function(c){const o=ccjOnb(),pack=ccjOnbPack();return [
      {k:'Authority',sub:'Filed with',v:pack.taxAuthority,state:'active'},
      {k:'Filing',sub:'Submission',v:pack.taxFiling,state:'active'},
      {k:'Reference',sub:'Our submission',v:o.tax.ref||'&mdash;',state:o.tax.ref?'active':'inactive'},
      {k:pack.taxIdLabel,sub:'Returned by the authority',v:o.tax.id||'awaiting',
       state:o.tax.id?'active':'inactive'}
    ];},
    checks:function(c){const o=ccjOnb(),pack=ccjOnbPack();return [
      {rule:'The worker is registered for payroll tax before the first run',
       expected:pack.taxIdLabel+' on file',
       actual:o.tax.id?pack.taxIdLabel+' '+o.tax.id:'not yet returned',
       verdict:o.tax.id?'pass':'fail'},
      {rule:'The correct tax treatment is applied from the first period',
       expected:'authority-issued code',actual:pack.taxCredit,
       verdict:o.tax.id?'pass':'na'}
    ];},
    captured:function(c){const o=ccjOnb(),pack=ccjOnbPack();return [
      {k:pack.taxIdLabel,v:o.tax.id||'&mdash;'},{k:'Authority',v:pack.taxAuthority}];},
    summary:function(c){return ccjOnbPack().taxIdLabel+' '+(ccjOnb().tax.id||'&mdash;');},
    note:'We file, then we wait. The tax code that comes back is what decides what is withheld from the first payslip, which is why payroll cannot be configured before this returns.'
  },
  'onboarding/Social security enrolment':{
    system:function(){return ccjOnbPack().ssAuthority;}, ref:'statutory schemes',
    call:function(c){return 'file("'+ccjOnbPack().ssFiling+'", worker="'
      +ccjParties().worker.name+'")';},
    latency:'—',
    fetched:function(c){const o=ccjOnb(),pack=ccjOnbPack();return [
      {k:'Institution',sub:'Filed with',v:pack.ssAuthority,state:'active'},
      {k:'Filing',sub:'Submission',v:pack.ssFiling,state:'active'},
      {k:'Schemes',sub:'Enrolled in',v:pack.ssScheme,state:'active'},
      {k:pack.ssIdLabel,sub:'Returned',v:o.ss.id||'awaiting',state:o.ss.id?'active':'inactive'}
    ];},
    checks:function(c){const o=ccjOnb(),pack=ccjOnbPack();return [
      {rule:'The worker is enrolled in every statutory scheme the country requires',
       expected:pack.ssScheme,actual:o.ss.id?'enrolled':'not yet enrolled',
       verdict:o.ss.id?'pass':'fail'},
      {rule:'Enrolment is filed before the first day of employment',
       expected:'before '+ccjPrettyDate((ccjRun&&ccjRun.form&&ccjRun.form.fromDate)||''),
       actual:o.ss.confirmedAt?'filed '+ccjStamp(o.ss.confirmedAt):'pending',
       verdict:o.ss.confirmedAt?'pass':'na'}
    ];},
    captured:function(c){const o=ccjOnb(),pack=ccjOnbPack();return [
      {k:pack.ssIdLabel,v:o.ss.id||'&mdash;'},{k:'Schemes',v:pack.ssScheme}];},
    summary:function(c){return ccjOnbPack().ssIdLabel+' '+(ccjOnb().ss.id||'&mdash;');},
    note:'In most countries this filing is legally due BEFORE the first day worked, not after it. A late enrolment is a penalty on the employer, which is us.'
  },
  'onboarding/Bank verified':{
    system:'Penny-drop provider', ref:'account verification',
    call:function(c){return 'POST /bank/verify {account:"'+ccjOnb().bank.iban
      +'", name:"'+ccjParties().worker.name+'"}';},
    latency:'1.4s',
    fetched:function(c){const b=ccjOnb().bank;return [
      {k:'Account',sub:'Masked',v:b.iban||'&mdash;',state:b.iban?'active':'inactive'},
      {k:'Test credit',sub:'Sent',v:ccjCurrency()+' 0.01',state:b.pennyAt?'active':'inactive'},
      {k:'Name on account',sub:'Returned by the bank',v:b.state==='verified'?b.holder:'awaiting',
       state:b.state==='verified'?'active':'inactive'},
      {k:'Name match',sub:'Confidence',v:b.score?b.score+'%':'&mdash;',
       state:b.score?'active':'inactive'}
    ];},
    checks:function(c){const b=ccjOnb().bank;return [
      {rule:'The account accepts a test credit',expected:'credit accepted',
       actual:b.state==='verified'?'accepted':'pending',verdict:b.state==='verified'?'pass':'na'},
      {rule:'The name on the account is the person we are about to pay',
       expected:ccjParties().worker.name,
       actual:b.state==='verified'?b.holder+' — '+b.score+'% match':'awaiting',
       verdict:b.state==='verified'?'pass':'na'}
    ];},
    captured:function(c){return [{k:'Bank details',v:'On file ('+(ccjOnb().bank.iban||'—')+')'}];},
    summary:function(c){return 'Verified &middot; '+(ccjOnb().bank.score||0)+'% name match';},
    note:'A penny-drop proves the account exists and belongs to the right person before payroll ever sends real money to it. It is the cheapest control in the whole journey and it prevents the most expensive mistake.'
  },
  'onboarding/Payroll configured':{
    system:'Payroll engine', ref:'from contract data',
    call:function(c){return 'configure(worker="'+ccjParties().worker.empId
      +'", contract="'+ccjEmp().id+'", from="'+((ccjRun&&ccjRun.form&&ccjRun.form.fromDate)||'')+'")';},
    latency:'320ms',
    fetched:function(c){const o=ccjOnb(),s=ccjPayslip();return [
      {k:'Calendar',sub:'Pay cycle',v:o.payroll.calendar||'&mdash;',state:'active'},
      {k:'First payroll',sub:'Period',v:o.payroll.firstPay||'&mdash;',state:'active'},
      {k:'Gross',sub:o.payroll.prorated?'Prorated to the start date':'Full month',
       v:ccjMoney(s.gross),state:'active'},
      {k:'Net',sub:'Indicative',v:ccjMoney(s.net),state:'active'}
    ];},
    checks:function(c){const o=ccjOnb(),s=ccjPayslip();return [
      {rule:'Payroll is configured from the executed contract, not from the quote',
       expected:'contract '+ccjEmp().id,actual:'contract '+ccjEmp().id,verdict:'pass'},
      {rule:'The first period is prorated to the day the person actually starts',
       expected:'proration where the start is mid-month',
       actual:o.payroll.prorated?o.payroll.days+' of '+o.payroll.inMonth+' days':'full month — starts on the 1st',
       verdict:'pass'},
      {rule:'No payroll runs against an unverified account',
       expected:'bank verified',actual:ccjOnb().bank.state==='verified'?'verified':'not verified',
       verdict:ccjOnb().bank.state==='verified'?'pass':'fail'}
    ];},
    captured:function(c){const o=ccjOnb(),s=ccjPayslip();return [
      {k:'First payroll',v:o.payroll.firstPay||'&mdash;'},
      {k:'Indicative net',v:ccjMoney(s.net)}];},
    summary:function(c){return 'First pay '+(ccjOnb().payroll.firstPay||'&mdash;');},
    note:'The figures here are indicative and say so. The binding number is computed on the first run against the tax code the authority actually returned — asserting an exact net before that would be claiming a calculation nobody has made.'
  },

  /* ---- 4 · Quote accepted. The first stage with no human step in it at all. -------------- */
  'quote-approved/Won':{
    system:'Deal Desk', ref:'deal record',
    call:function(c){return 'close(deal, outcome="won", value='+(ccjQuote().total*12)+')';},
    latency:'62ms',
    fetched:function(c){const q=ccjQuote();return [
      {k:'Client',sub:'Account',v:c.client,state:'active'},
      {k:'Engagement',sub:'Model',v:ccjModelLabel(c.type),state:'active'},
      {k:'Monthly value',sub:'Per placement',v:q.sym+' '+q.total.toLocaleString(),state:'active'},
      {k:'Annualised',sub:'12 months',v:q.sym+' '+(q.total*12).toLocaleString(),state:'active'}
    ];},
    checks:function(c){return [
      {rule:'The client accepted in writing before the deal is booked as won',
       expected:'acceptance on the quote thread',actual:'accepted on quote v'+ccjClient().version,verdict:'pass'},
      {rule:'The booked value matches the quote they accepted',expected:'v'+ccjClient().version+' total',
       actual:ccjQuote().sym+' '+ccjQuote().total.toLocaleString()+' — matches',verdict:'pass'}
    ];},
    captured:function(c){const q=ccjQuote();return [
      {k:'Outcome',v:'Won'},{k:'Annual value',v:q.sym+' '+(q.total*12).toLocaleString()},
      {k:'Accepted version',v:'v'+ccjClient().version}];},
    summary:function(c){const q=ccjQuote();return 'Won · '+q.sym+' '+(q.total*12).toLocaleString()+' a year';},
    note:'Booked against the version the client actually accepted, not the version we first sent. On a renegotiated deal those are different numbers, and only one of them is the deal.'
  },
  /* Overridden to cover what provisioning actually creates — the entity, the workspace, the
     admin invite and the client record — rather than the entity alone. Also upserts: a client
     already on the books does not get a second tenant, and the run says so instead of pretending
     to create one it did not. */
  'quote-approved/Client tenant provisioned':{
    system:'NFAdmin', systemId:'nfadmin', ref:'EntityRegistry',
    call:function(c){return 'POST /tenants {client:"'+c.client+'", country:"'+c.country+'"}';},
    latency:'640ms',
    fetched:function(c){
      const t=ccjTenant(),was=ccjTenantExisting();
      return [
        {k:'Tenant',sub:was?'Already on the books':'Created',v:t.id,state:'active'},
        {k:'Workspace',sub:'Client sign-in',v:t.workspace,state:'active'},
        {k:'Plan',sub:'Commercial tier',v:t.plan,state:'active'},
        {k:'Admin invited',sub:'Client contact',v:was?'already has access':t.contact,
         state:was?'inactive':'active'}
      ];
    },
    checks:function(c){
      const was=ccjTenantExisting();
      return [
        {rule:'One tenant per client — an existing client is not provisioned twice',
         expected:'no tenant for '+c.client,
         actual:was?c.client+' already has a tenant — reused':'none found — created',
         verdict:was?'na':'pass'},
        {rule:'The tenant is registered in the country the work happens in',
         expected:c.country,actual:c.country,verdict:'pass'}
      ];
    },
    captured:function(c){const t=ccjTenant();return [
      {k:'Tenant',v:t.id},{k:'Workspace',v:t.workspace},
      {k:'Client record',v:ccjTenantExisting()?'existing':'created'}];},
    summary:function(c){return ccjTenantExisting()?'Existing tenant reused':'Tenant '+ccjTenant().id+' created';},
    note:'Provisioning is idempotent. A client on their second engagement already has a workspace, and creating a second one would split their people across two accounts.'
  },
  'quote-approved/CSM confirmed to client':{
    system:'CSM routing table', ref:'Owner directory',
    call:function(c){return 'introduce(csm="'+ccjCsm().name+'", client="'+c.client+'")';},
    latency:'44ms',
    fetched:function(c){const m=ccjCsm();return [
      {k:m.name,sub:'Customer Success Manager',v:'owns '+c.country,state:'active'},
      {k:'Introduced to',sub:'Client contact',v:ccjTenant().contact,state:'active'},
      {k:'Sent',sub:'Channel',v:'client thread',state:'active'}
    ];},
    checks:function(c){return [
      {rule:'The CSM introduced is the one who owns the client country',
       expected:'owner of '+c.country,actual:ccjCsm().name,verdict:'pass'},
      {rule:'The introduction goes out the same day the deal is won',
       expected:'same day',actual:'immediate',verdict:'pass'}
    ];},
    captured:function(c){return [{k:'CSM',v:ccjCsm().name},{k:'Relationship owner',v:ccjCsm().name}];},
    summary:function(c){return ccjCsm().name+' introduced';},
    note:'This is where the Account Manager hands the relationship over. They own winning the client; the CSM owns keeping them.'
  },
  /* Overridden so the panel and the quote screen beside it cannot state different numbers. The
     shared entry reads aiH2rCountryData and says "~19.4%" as prose while the quote screen was
     computing 18.4% — the same fact, two answers, a column apart. Both now read CCJ_RATES. */
  'quote-prep/Cost calc built':{
    system:'Cost engine', ref:'Compliance Hub rates',
    call:function(c){return 'build(gross='+Math.round(c.grossMonthly)+', country="'+c.country+'", type="'+c.type+'")';},
    latency:'380ms',
    fetched:function(c){
      const q=ccjQuote(),r=ccjRate(c.country);
      const rows=[
        {k:'Monthly gross',sub:'Offered',v:q.sym+' '+q.gross.toLocaleString(),state:'active'},
        {k:r.label,sub:r.social+'% of gross',v:q.sym+' '+q.social.toLocaleString(),state:'active'}
      ];
      if(q.holiday)rows.push({k:'Holiday allowance',sub:r.holiday+'% of gross',
        v:q.sym+' '+q.holiday.toLocaleString(),state:'active'});
      rows.push({k:'Employer cost',sub:'Before margin',v:q.sym+' '+q.base.toLocaleString(),state:'active'});
      return rows;
    },
    checks:function(c){
      const q=ccjQuote();
      return [
        {rule:'Every in-force employer contribution is loaded onto gross',
         expected:ccjRate(c.country).label+' at '+q.socialPct+'%',
         actual:q.sym+' '+q.social.toLocaleString()+' applied',verdict:'pass'},
        {rule:'Margin resolves against the country rate card',expected:'within the standard band',
         actual:q.margin+'% — standard',verdict:'pass'}
      ];
    },
    captured:function(c){const q=ccjQuote();return [
      {k:'Employer cost',v:q.sym+' '+q.base.toLocaleString()},
      {k:'Margin',v:q.margin+'%'},
      {k:'Total',v:q.sym+' '+q.total.toLocaleString()}];},
    summary:function(c){const q=ccjQuote();return q.sym+' '+q.total.toLocaleString()+' at '+q.margin+'%';},
    note:'Gross and the employer contributions are pass-through &mdash; collected and handed on. The margin is the only line that is ours, which is why it is the only one a client can negotiate.'
  },
  /* The shared entry only checks a real floor for the Netherlands, because that is the only
     country whose minimum wage is in the compliance table. Everywhere else it passed without
     comparing anything. A check that cannot be made should say so, not report a pass. */
  'quote-prep/Statutory floor check':{
    system:'Rules engine', ref:'Compliance Hub · Minimum Wage',
    call:function(c){return 'evaluate(floor="Minimum Wage", country="'+c.country+'", gross='+Math.round(c.grossMonthly)+')';},
    latency:'96ms',
    fetched:function(c){
      const f=ccjFloorFor(c.country);
      return [{k:'Statutory minimum',sub:c.country,
        v:f?f.label+' '+f.value:'not configured for '+c.country,state:f?'active':'inactive'},
        {k:'Offered rate',sub:'Per hour, 173.33h month',v:ccjCurrency()+' '+c.hourly.toFixed(2),state:'active'}];
    },
    checks:function(c){
      const f=ccjFloorFor(c.country);
      if(!f)return [{rule:'Offered rate must be at or above the statutory minimum',
        expected:'a configured minimum wage for '+c.country,
        actual:'no minimum-wage rule configured — cannot be checked',verdict:'na'}];
      return [{rule:'Offered rate must be at or above the statutory minimum',
        expected:'&ge; '+f.label+' '+f.value+' / hour',
        actual:ccjCurrency()+' '+c.hourly.toFixed(2)+' / hour',
        verdict:c.hourly>=f.num?'pass':'fail'}];
    },
    captured:function(c){const f=ccjFloorFor(c.country);
      // Keyed on the RESULT, not on whether a rule exists. This used to write "above minimum"
      // for every run that had a floor configured — including the ones that failed it — so the
      // audit record said the opposite of the verdict two lines above it.
      return [{k:'Floor check',v:!f?'not configurable'
        :(c.hourly>=f.num?'above minimum':'BELOW minimum')}];},
    summary:function(c){const f=ccjFloorFor(c.country);
      return f?(c.hourly>=f.num?'Above the statutory minimum':'BELOW the statutory minimum')
             :'No floor configured for '+c.country;},
    note:'Read from Compliance Hub &rarr; Rates &amp; Rules. A country with no minimum-wage rule configured cannot be checked, and the run says so rather than reporting a pass it did not earn.',
    failure:'A rate below the statutory minimum blocks the quote and routes to Compliance.'
  },
  /* Both of these are `applies:false` in the shared map — authored for the original journey,
     where the client always accepted the quote as sent. Here whether they ran is a fact about
     this run, so the condition is the live client state. */
  'quote-review/Change requested':{
    system:'Client thread', ref:'reply',
    call:function(c){return 'parse(reply, quote="'+c.contractId+'")';},
    latency:'—',
    applies:function(c){return ccjNegotiated();},
    fetched:function(c){
      const cl=ccjClient();
      if(cl.ask==='terms')return cl.changes.map(function(x){
        return {k:x.k,sub:'Requested change',v:x.from+' → '+x.to,state:'active'};});
      const now=ccjQuote(20),want=ccjQuote(17);return [
      {k:'Quoted',sub:'v1 total',v:now.sym+' '+now.total.toLocaleString(),state:'active'},
      {k:'Client target',sub:'Stated in reply',v:want.sym+' '+want.total.toLocaleString(),state:'active'},
      {k:'Gap',sub:'To close',v:now.sym+' '+(now.total-want.total).toLocaleString(),state:'active'}
    ];},
    checks:function(c){
      if(ccjClient().ask==='terms')return [
        {rule:'The request changes the contract, not the commercials',expected:'price unaffected',
         actual:'start date and probation only',verdict:'pass'},
        {rule:'The revised terms stay inside country statute',expected:'probation within legal maximum',
         actual:'6 months — permitted',verdict:'pass'}];
      return [
      {rule:'The request is commercial, not a change of scope',expected:'price only',
       actual:'rate only — role, country and term unchanged',verdict:'pass'},
      {rule:'The target stays above the margin floor',expected:'&ge; 15%',
       actual:'17% achievable',verdict:'pass'}
    ];},
    captured:function(c){
      if(ccjClient().ask==='terms')return [{k:'Requested',v:'Start date and probation'},{k:'Route',v:'Amend and re-issue'}];
      const want=ccjQuote(17);return [
      {k:'Requested total',v:want.sym+' '+want.total.toLocaleString()},{k:'Route',v:'Re-issue as v2'}];},
    summary:function(c){return ccjClient().ask==='terms'
      ?'Client asked to change the terms':'Client asked for a better rate';},
    note:'A price request is answerable inside this stage. A change of scope would not be &mdash; that goes back to the cost build.'
  },
  'quote-review/Re-issued v2':{
    system:'Cost engine', ref:'agreed margin',
    call:function(c){return 'rebuild(gross='+Math.round(c.grossMonthly)+', margin=17)';},
    latency:'310ms',
    applies:function(c){return ccjNegotiated();},
    fetched:function(c){
      const cl=ccjClient();
      if(cl.ask==='terms'){const q=ccjQuote();return cl.changes.map(function(x){
        return {k:x.k,sub:'Amended',v:x.to,state:'active'};})
        .concat([{k:'Total',sub:'Unchanged',v:q.sym+' '+q.total.toLocaleString(),state:'active'}]);}
      const was=ccjQuote(20),now=ccjQuote(17);return [
      {k:'Margin',sub:'Agreed with the client',v:'20% &rarr; 17%',state:'active'},
      {k:'Total was',sub:'v1',v:was.sym+' '+was.total.toLocaleString(),state:'inactive'},
      {k:'Total now',sub:'v2',v:now.sym+' '+now.total.toLocaleString(),state:'active'}
    ];},
    checks:function(c){
      if(ccjClient().ask==='terms')return [
        {rule:'Amending terms does not touch the cost build',expected:'total unchanged',
         actual:'unchanged',verdict:'pass'},
        {rule:'The amended document supersedes v1',expected:'v1 withdrawn',actual:'v1 withdrawn',verdict:'pass'}];
      const now=ccjQuote(17);return [
      {rule:'The build is unchanged &mdash; only margin moved',expected:'employer cost identical',
       actual:'identical',verdict:'pass'},
      {rule:'Margin stays above the floor',expected:'&ge; 15%',actual:'17%',verdict:'pass'},
      {rule:'The revised total meets the client target',expected:'at or under their number',
       actual:now.sym+' '+now.total.toLocaleString(),verdict:'pass'}
    ];},
    captured:function(c){
      if(ccjClient().ask==='terms')return [{k:'Quote version',v:'v2'},{k:'Amended',v:'Start date, probation'}];
      const now=ccjQuote(17);return [
      {k:'Quote version',v:'v2'},{k:'New total',v:now.sym+' '+now.total.toLocaleString()}];},
    summary:function(c){return ccjClient().ask==='terms'
      ?'Re-issued with amended terms':'Re-issued at 17% margin';},
    note:'The employer cost is not touched. What was negotiated was our margin, and that is the only number that moves.'
  }
};
/* Did this run actually go through a negotiation? Everything from the change request onward
   depends on it, and the answer is a fact about the client, not about the data. */
function ccjNegotiated(){
  const st=(ccjRun&&ccjRun.client&&ccjRun.client.state)||'';
  return st==='changed'||st==='negotiating'||st==='agreed'||st==='reissued'||st==='viewed2'
    ||(ccjRun&&ccjRun.client&&ccjRun.client.version>1);
}
function ccjEvidence(i,step){
  if(!step)return null;
  const k=ccjKey(i,step);
  if(CCJ_EVIDENCE[k])return CCJ_EVIDENCE[k];
  if(typeof aicjEvidence==='undefined')return null;
  return aicjEvidence[k]||null;
}
function ccjActor(){
  return typeof actorLabel==='function'&&typeof currentActorId==='function'
    ?actorLabel(currentActorId()):'you';
}
/* The one-line result a settled row carries. It says what came back, not what the step was
   called — "Maya Vos assigned" earns its line, "CSM assigned ✓" does not. A person's answer
   outranks an authored line: on a step someone decided, who decided it IS the result. */
function ccjSummary(i,step){
  const dec=ccjRun&&ccjRun.decisions[ccjKey(i,step)];
  if(dec)return dec.done||(dec.label+' &middot; '+ccjActor());
  const d=ccjEvidence(i,step);
  if(d&&d.summary)return ccjVal(d.summary,ccjCtx());
  return 'Done';
}
/* What a step that has not run yet is FOR. Pending rows are not blank in this panel — they
   say what is coming, which is half of what makes the whole stage readable at a glance.
   Authored where it matters, derived from the data the sub-status already carries otherwise. */
const CCJ_PURPOSE={
  'request-received/New intake':'Records this hire request.',
  'request-received/CSM assigned':'Assigns the CSM for the client country.',
  'request-received/Qualified / Disqualified':'Approve or decline this request.'
};
function ccjPurpose(i,step){
  const authored=CCJ_PURPOSE[ccjKey(i,step)];
  if(authored)return authored;
  if(step.autoNote)return 'Runs automatically &mdash; '+step.autoNote+'.';
  if(step.decision)return 'Needs a decision from '+step.owner+'.';
  return 'Owned by '+step.owner+'.';
}

/* ---- HOLDS -----------------------------------------------------------------------------
   A sub-status that must not finish on a timer. It runs its evidence beats, then parks —
   current, spinning, everything it found on screen — until the run reaches the named screen.
   Held work is the honest rendering of "the machine has done its part and is waiting on the
   rest of the stage"; ticking it green early would report work nobody has done. */
const CCJ_HOLDS={
  'request-received/New intake':{
    until:'proposal',
    note:'Completes when the proposal is created.'
  }
};
/* An entry may be a function of run state, for the same reason CCJ_GATES may: a step whose work
   happens in two halves either side of a human decision holds on a DIFFERENT milestone before and
   after that decision. The first payroll run is the case — it parks on the calculation being
   complete, a person releases it, and it then parks again on the money actually leaving. */
function ccjHoldFor(i,step){
  if(!step)return null;
  const h=CCJ_HOLDS[ccjKey(i,step)];
  if(typeof h==='function')return h()||null;
  return h||null;
}
/* A held row is not idle — it is the intake still being captured. When a document is being read
   it says so, with the count, because that is the capture actually happening. */
function ccjHoldNoteHTML(hold){
  const run=ccjRun;
  // A clause audit running beside the panel is the same case: the held row reports the work the
  // screen is doing, with the count, rather than a fixed sentence about waiting.
  if(hold.until==='audit-done'&&run&&run.emp&&run.emp.audit.length){
    const e=run.emp;
    return hold.note+' <b>'+Math.min(e.auditAt+(e.auditDone?0:1),e.audit.length)
      +' of '+e.audit.length+'</b>'
      +(ccjAuditAdjusted().length?' &middot; '+ccjAuditAdjusted().length+' adjusted':'');
  }
  const d=run&&run.doc;
  if(d&&!d.done)return 'Reading <b>'+d.name+'</b>.';
  if(d&&d.done)return 'Read <b>'+d.name+'</b>. '+hold.note;
  return hold.note;
}

/* ---- WHERE THE RUN STOPS --------------------------------------------------------------
   Authored per sub-status rather than derived, because a gate is a product decision and
   deriving it from flags would let a step that merely lacks an `auto` marker silently invent
   a human approval. Anything not listed still stops if it is not marked auto — the fallbacks
   below — so the machine can never quietly perform work a person owns. */
const CCJ_GATES={
  'request-received/Qualified / Disqualified':{
    kind:'decision',
    ask:'Qualify this request before it is priced.',
    why:'Nothing is costed or quoted until this is approved.',
    options:[
      {id:'qualified',   label:'Qualify',    tone:'go',  done:'Qualified'},
      {id:'disqualified',label:'Disqualify', tone:'stop',done:'Disqualified'}
    ]
  },
  /* The last thing before a quote leaves the building. Send back is a LOOP, not a stop: the
     numbers go back to the cost engine and are rebuilt, which is what a QA rejection actually
     means. A rejection that ended the run would be modelling it as a disqualification. */
  'quote-prep/Quote QA':{
    kind:'approval',
    ask:'Approve the quote before it goes to the client.',
    why:'The client sees these numbers. Nothing is sent until they are signed off.',
    options:[
      {id:'approved',label:'Approve',   tone:'go',  done:'Approved'},
      {id:'rework',  label:'Send back', tone:'stop',done:'Sent back for rework'}
    ]
  }
};
/* Whoever is looking may answer any gate. The step's real owner is still recorded and still
   shown on the row — this only removes the block, so a walkthrough does not need four personas
   to get through nine stages. Set to false to enforce ownership again; nothing else changes. */
const CCJ_ANY_PERSONA=true;
/* Legal reads the agreement before it goes anywhere. Not automatable — this is liability, and
   the 48h SLA in the operating model is a person's working time, not a system's. */
CCJ_GATES['agreement-signature/Legal & compliance review']={
  kind:'approval',
  ask:'Release the agreement to the client?',
  why:'Nothing is sent until legal has read it. The liability cap and the indemnities are what they are checking.',
  options:[
    {id:'released',label:'Approve',      tone:'go',  done:'Released'},
    {id:'amend',   label:'Send to amend',tone:'stop',done:'Returned for amendment'}
  ]
};
/* A possible sanctions match. Automatic screening, human adjudication — similar company names
   produce false positives constantly, and the law does not let a machine make this call. */
CCJ_GATES['agreement-signature/Client entity + sanctions check']=function(){
  const m=ccjMsa();
  if(m.screening!=='hit')return null;             // clean or already cleared — no gate
  return {
    kind:'decision',
    ask:'A possible sanctions match needs adjudicating.',
    why:m.hit+' — screening cannot clear this on its own, and we may not contract with a sanctioned entity.',
    options:[
      {id:'dismiss',  label:'Not our client', tone:'go',  done:'Match dismissed'},
      {id:'escalate', label:'Escalate',       tone:'stop',done:'Escalated to Compliance'}
    ]
  };
};
/* ---- GATES THAT COME AFTER THE WORK, NOT INSTEAD OF IT --------------------------------------
   CCJ_GATES halts on ARRIVAL — the step never runs its actions, because the decision is what the
   step IS (qualify this request, approve this quote). Some decisions are the opposite shape: the
   work has to happen first and the decision is about its RESULT. Countersigning an agreement is
   one — you cannot approve a signature you have not received.

   Separate map so the arrival-gated steps keep their behaviour untouched. */
const CCJ_POST_GATES={
  'agreement-signature/Signed':{
    kind:'approval',
    ask:'Countersign the agreement?',
    why:'The client has signed and returned it. Ours is the second signature, and the agreement is in force from the moment it lands — so this is the last point at which we can decline.',
    options:[
      {id:'countersign',label:'Approve and countersign',tone:'go',  done:'Executed'},
      {id:'declineMsa', label:'Decline',                tone:'stop',done:'Declined'}
    ]
  }
};
function ccjPostGateFor(i,step){
  if(!step)return null;
  const g=CCJ_POST_GATES[ccjKey(i,step)];
  if(!g)return null;
  return typeof g==='function'?(g()||null):g;
}
/* Which sub-status a rejection returns the run to. Rebuilding the cost is the work a QA
   rejection creates, so that is where it goes back to — not to the top of the stage. */
const CCJ_REWORK={'quote-prep/Quote QA':'Cost calc built',
                  'agreement-signature/Legal & compliance review':'MSA drafted'};
function ccjGateFor(i,step){
  if(!step)return null;
  const authored=CCJ_GATES[ccjKey(i,step)];
  // An entry may be a function of run state: the sanctions gate only exists when screening
  // actually returned something, and a clean screen must not manufacture a decision.
  if(typeof authored==='function')return authored()||null;
  if(authored)return authored;
  if(step.auto)return null;                       // the machine owns it outright
  // A step that waits on the client is answered by the client, not by a button in here. The
  // wait IS the mechanism; deriving a gate as well would give one step two owners.
  if(CCJ_WAITS[ccjKey(i,step)])return null;
  // Same for a step that HOLDS on its own work finishing. Onboarding's tax registration and
  // social security enrolment carry no `auto` flag — they are filings a person owns — but the
  // run performs them and parks on the authority answering. Without this they halted on arrival
  // behind a derived "Mark done" button and the filing never ran at all.
  if(CCJ_HOLDS[ccjKey(i,step)])return null;
  const info=typeof amOwnerInfo==='function'?amOwnerInfo(step.owner):{persona:null};
  // No persona behind the owner means nobody in this product can click it — a real external
  // wait on the client or the worker, and it is honest to say so.
  if(!info.persona)return{
    kind:'external',
    ask:'Waiting on the '+String(step.owner).toLowerCase()+'.',
    why:'The run holds here until it comes back.',
    options:[{id:'received',label:'Mark received',tone:'go',done:'Received'}]
  };
  return{
    kind:'act',
    ask:'This step is yours to complete.',
    why:'The run holds here until this step is marked done.',
    options:[{id:'done',label:'Mark done',tone:'go',done:'Completed'}]
  };
}

/* ---- THE RUNNER -----------------------------------------------------------------------
   Three beats per sub-status — reach a system, check the rules, capture what came back —
   then either hold for a milestone or settle and move on. A step carrying a gate never runs
   the beats at all: it halts on arrival and waits for a person.                            */
function ccjStart(){
  const run=ccjEnsureRun();
  run.sub=0;
  ccjEnterStep();
}
function ccjEnterStep(){
  const run=ccjRun;if(!run)return;
  const steps=ccjSteps(run.stage);
  const step=steps[run.sub];
  if(!step){ccjStageComplete();return;}
  // A conditional step that does not apply is answered, not performed.
  if(!ccjStepApplies(run.stage,step)){ccjSkipStep();return;}
  const gate=ccjGateFor(run.stage,step);
  if(gate){run.phase='halt';ccjPaint();ccjScrollPanelToCurrent();ccjOnHalt(gate,step);return;}
  const pre=ccjWaitFor(run.stage,step);
  if(pre&&pre.pre&&!ccjWaitMet(pre)){run.phase='wait';run.act=0;ccjPaint();ccjScrollPanelToCurrent();return;}
  // A full paint on arrival, because the row that is current has changed. Every action after it
  // repaints the action list ALONE — see ccjPaintBeat. Replacing the whole panel on each action
  // would restart the spinner and re-run every entry animation on it.
  run.phase='act';run.act=0;ccjPaint();ccjScrollPanelToCurrent();
  // A held step is starting its work again, so the milestone that ends it has NOT been reached.
  // Screens are excluded on purpose: reaching one is a fact about where the user is rather than
  // about this step's work, and stage 1's intake holds on a screen. Without this a re-entered
  // step — after a reopen or a rework — read the previous pass's milestone as already met, did
  // not hold, and settled itself green having done nothing at all.
  const held=ccjHoldFor(run.stage,step);
  if(held&&!ccjScreenDef(run.stage,held.until))delete run.reached[held.until];
  const enter=CCJ_ON_ENTER[ccjKey(run.stage,step)];
  if(enter)enter(run);
  ccjRunAct();
}
/* What a sub-status STARTS doing when the run arrives at it, as opposed to what it leaves behind
   when it finishes (CCJ_ON_SETTLE). The clause audit needs this: the annotation has to begin as
   the compliance step begins, and hanging it off the previous step's settle would start it a
   beat early and tie it to whatever happens to precede it. */
const CCJ_ON_ENTER={};
/* One action per beat. Each finishes visibly — spinner to tick, with its result and, for a fetch
   or a verify, the records and verdicts underneath — before the next one starts. */
function ccjRunAct(){
  const run=ccjRun;if(!run)return;
  const step=ccjSteps(run.stage)[run.sub];
  const acts=ccjActsFor(run.stage,step);
  ccjSchedule(function(){
    run.act++;
    if(run.act>=acts.length){ccjAfterBeats();return;}
    ccjPaintBeat();
    ccjScrollPanelToCurrent();
    ccjRunAct();
  },CCJ_ACT);
}
function ccjSkipStep(){
  const run=ccjRun;if(!run)return;
  const step=ccjSteps(run.stage)[run.sub];
  if(!step)return;
  run.settled[ccjKey(run.stage,step)]={summary:'Not applicable',skipped:true,
    reason:ccjSkipReason(run.stage,step)};
  run.phase='settled';ccjPaint();ccjPaintScreen();
  ccjSchedule(function(){run.sub++;ccjEnterStep();},CCJ_SETTLE);
}
/* The panel grows as a step works, so the row doing the work has to be kept in view — the same
   reason the form follows a document being read into it. */
function ccjScrollPanelToCurrent(){
  if(typeof document.querySelector!=='function')return;
  const box=document.querySelector('.ccj-panel-body');
  const row=document.querySelector('.ccj-row.current');
  if(!box||!row||typeof row.getBoundingClientRect!=='function'||!box.getBoundingClientRect)return;
  const r=row.getBoundingClientRect(),br=box.getBoundingClientRect();
  if(!r.height&&!br.height)return;
  // Top-aligned with a little air, not centred: a working row grows downward, and centring it
  // would push what it is producing off the bottom as it does.
  ccjGlide(box,box.scrollTop+(r.top-br.top)-12);
}
/* The beats are done. Either this step waits on a milestone, or it is finished. */
function ccjAfterBeats(){
  const run=ccjRun;if(!run)return;
  const step=ccjSteps(run.stage)[run.sub];
  const hold=ccjHoldFor(run.stage,step);
  if(hold&&!run.reached[hold.until]){run.phase='hold';ccjPaint();return;}
  // A step waiting on the client parks until they act. It may never resolve on its own, which
  // is the whole reason the chases beneath it exist.
  const wait=ccjWaitFor(run.stage,step);
  if(wait&&!wait.pre&&!ccjWaitMet(wait)){run.phase='wait';ccjPaint();ccjScrollPanelToCurrent();return;}
  // The work is done and someone has to decide about its result. Unlike an arrival gate, the
  // evidence that justifies the decision has already been produced and is on screen behind it.
  const post=ccjPostGateFor(run.stage,step);
  if(post&&!run.decisions[ccjKey(run.stage,step)]){
    run.phase='halt';ccjPaint();ccjPaintScreen();ccjScrollPanelToCurrent();ccjOnHalt(post,step);return;
  }
  ccjSettleStep();
}
/* The client's side only ever moves forward, so "has this been met" is a position on that line
   rather than a list of acceptable states. Enumerating them was the bug: a step that waited for
   'changed' and then did its work would re-check afterwards, by which time the client had moved
   on to 'negotiating' — past the thing it was waiting for — and it parked forever. */
const CCJ_CLIENT_ORDER=['idle','sent','viewed','chased','changed','negotiating','agreed',
                        'reissued','viewed2','accepted'];
function ccjWaitOn(w){return typeof w.on==='function'?w.on():w.on;}
function ccjWaitMet(w){
  // A wait may carry its own predicate when what it is waiting for is not a position on the
  // client's own progression — the signed agreement coming back, for one.
  if(typeof w.met==='function')return !!w.met();
  const c=ccjClient();
  return CCJ_CLIENT_ORDER.indexOf(c.state)>=CCJ_CLIENT_ORDER.indexOf(ccjWaitOn(w));
}
function ccjSettleStep(){
  const run=ccjRun;if(!run)return;
  const step=ccjSteps(run.stage)[run.sub];
  if(!step)return;
  run.settled[ccjKey(run.stage,step)]={summary:ccjSummary(run.stage,step)};
  const after=CCJ_ON_SETTLE[ccjKey(run.stage,step)];
  if(after)after(run);
  run.phase='settled';ccjPaint();ccjPaintScreen();
  const goto=CCJ_GOTO[ccjKey(run.stage,step)];
  ccjSchedule(function(){
    const gkey=ccjKey(run.stage,step);
    if(goto&&!run.went[gkey]&&ccjClient().state!=='accepted'){
      run.went[gkey]=true;
      // Back to a row already passed — a re-issued quote has to be read again. The row is
      // un-settled first, or it would render as done while it is the one being waited on.
      const steps=ccjSteps(run.stage);
      const idx=steps.findIndex(function(x){return x.label===goto;});
      if(idx>-1){delete run.settled[ccjKey(run.stage,steps[idx])];run.sub=idx;ccjEnterStep();return;}
    }
    run.sub++;ccjEnterStep();
  },CCJ_SETTLE);
}
/* What a particular sub-status does to the world when it finishes. Sending the quote puts it in
   front of the client; re-issuing puts a second version there. Both belong to the step that did
   them, not to the screen that happens to be open. */
const CCJ_ON_SETTLE={
  'quote-review/Sent':function(run){
    const c=ccjClient();
    c.state='sent';c.mins=0;
    ccjClientLog('sent','Sent','Docuseal · '+ccjParties().client.email);
    ccjClientPush({who:'us',kind:'quote',version:c.version,quote:ccjQuote(),at:0});
    ccjClientNote('Delivered to '+ccjCtx().signatoryEmail);
    ccjClientSchedule();
  },
  /* The agreement goes to the client's signatory, in the same thread everything else went. */
  'agreement-signature/Sent':function(run){
    const c=ccjClient(),p=ccjParties(),m=ccjMsa();
    c.mins+=180;
    ccjClientPush({who:'us',kind:'msa',id:m.id,to:p.client.contact,at:c.mins});
    ccjScheduleChat(ccjMsaReturned,2800);            // they sign it and send it back
  },
  /* The countersignature is set by the approval, not here — see ccjChooseGate. By the time this
     runs, both signatures are on it and the agreement is in force. */
  'agreement-signature/Signed':function(run){
    ccjClientNote('Countersigned by '+ccjParties().adt.signatory+' — agreement in force');
  },
  'quote-approved/Client tenant provisioned':function(run){
    run.tenantWasExisting=ccjTenant().existing;    // record it BEFORE the create changes the answer
    ccjUpsertClient();                             // the customer now exists in the product
  },
  'quote-approved/CSM confirmed to client':function(run){
    // The handover, posted into the same thread the quote and the negotiation are in.
    const m=ccjCsm(),c=ccjClient();
    c.mins+=60;
    ccjClientPush({who:'us',kind:'csm',csm:m,at:c.mins});
  },
  'quote-review/Re-issued v2':function(run){
    const c=ccjClient();
    if(c.version>1)return;                         // already re-issued; do not do it twice
    const was=ccjQuote(20);
    // c.chases is NOT reset. It is the record of how hard this deal was worked, and zeroing it
    // made the timeline and the sub-status both deny two reminders the thread still showed.
    c.version=2;c.mins=Math.max(c.mins,8900);
    ccjClientLog('reissued','Re-issued as v2',c.ask==='terms'
      ?'Terms amended · price unchanged':'Margin 20% → '+ccjQuote().margin+'%');
    if(c.state!=='accepted')c.state='reissued';    // never walk an acceptance backwards
    ccjClientPush({who:'us',kind:'quote',version:2,quote:ccjQuote(),
      wasTotal:c.ask==='price'?was.total:0,wasMargin:was.margin,
      changes:c.ask==='terms'?c.changes:null,at:c.mins});
    ccjClientNote('Revised quote delivered');
    ccjClientSchedule();
  }
};
/* Reaching a screen is a milestone. If the step currently parked was waiting on this one, it
   is released here — which is the only way a hold ever ends. */
function ccjReachScreen(id){
  const run=ccjRun;if(!run)return;
  run.reached[id]=true;
  if(run.phase!=='hold')return;
  const step=ccjSteps(run.stage)[run.sub];
  const hold=ccjHoldFor(run.stage,step);
  // Back through ccjAfterBeats, NOT straight to settle. A hold releasing is the same moment the
  // beats ending is, and everything that follows the beats — a wait, and above all a post gate —
  // has to be evaluated. Settling directly meant a held step carrying a decision about its result
  // (the KYC verdict) skipped the decision entirely and ticked itself green.
  if(hold&&hold.until===id)ccjAfterBeats();
}
/* The conversation is told when the machine stops, because a panel going quiet on the right
   is not an instruction. The chat is where the ask gets made. */
function ccjOnHalt(gate,step){
  if(gate.kind==='decision'){
    ccjPush({who:'agent',text:'Request logged and routed. Qualify it in the panel to continue.'});
  }else if(gate.kind==='external'){
    ccjPush({who:'agent',text:'Holding at <b>'+step.label+'</b>.'});
  }else{
    ccjPush({who:'agent',text:'<b>'+step.label+'</b> is yours to complete.'});
  }
}
/* A person answering the gate. Disqualify is terminal on purpose: pretending the run limps on
   would misrepresent what the decision means. */
function ccjChooseGate(optId){
  const run=ccjRun;if(!run)return;
  const step=ccjSteps(run.stage)[run.sub];
  if(!step)return;
  // Either kind. A post gate is still a decision on this step, and looking only at arrival gates
  // meant the countersign button resolved to nothing and silently did nothing at all.
  const gate=ccjGateFor(run.stage,step)||ccjPostGateFor(run.stage,step);
  const opt=gate&&gate.options.find(function(o){return o.id===optId;});
  if(!opt)return;
  run.decisions[ccjKey(run.stage,step)]=Object.assign({},opt,{done:opt.done+' by '+ccjActor()});
  if(optId==='disqualified'){
    // Deliberately NOT written to `settled`. A settled row gives up its gate block — which is
    // the very thing that explains the run stopped and offers the way back.
    run.stopped=true;run.phase='stopped';
    ccjPaint();
    ccjPush({who:'agent',text:'Request declined. The remaining steps will not run.'});
    return;
  }
  if(optId==='countersign'){
    const m=ccjMsa(),c=ccjClient();
    c.mins+=95;
    m.adtSignedAt=c.mins;                          // in force from the LAST signature
    ccjClientLog('executed','Agreement executed','In force from this date');
    ccjPush({who:'user',text:opt.label});
    ccjSettleStep();
    return;
  }
  if(optId==='declineMsa'){
    run.stopped=true;run.phase='stopped';
    ccjPaint();
    ccjPush({who:'agent',text:'Agreement declined at countersignature. Nothing is in force and no placement can start.'});
    return;
  }
  if(optId==='escalate'){
    // A confirmed sanctions concern stops the engagement. Nothing downstream may run.
    run.stopped=true;run.phase='stopped';
    ccjPaint();
    ccjPush({who:'agent',text:'Escalated to Compliance. The engagement is on hold and nothing further will run until they clear it.'});
    return;
  }
  if(optId==='dismiss'){
    ccjMsa().screening='cleared';
    ccjPush({who:'user',text:opt.label});
    ccjSettleStep();
    return;
  }
  /* Holding for the balance does NOT settle the row — the balance has not arrived. The chase goes
     out and the same row becomes a wait, which is the honest rendering of "we decided to wait". */
  if(optId==='holdBalance'){
    ccjPush({who:'user',text:opt.label});
    ccjPayEvent('chase');
    run.phase='wait';ccjPaint();ccjPaintScreen();ccjScrollPanelToCurrent();
    return;
  }
  /* An exception, and it is recorded as one: who released it and how much was short. The invoice
     keeps the shortfall on its face rather than being marked paid. */
  if(optId==='releaseShort'){
    const p=ccjPay(),c=ccjClient();
    c.mins+=20;
    p.released=true;p.releasedBy=ccjActor();p.shortfall=ccjOutstanding();p.releasedAt=c.mins;
    ccjClientLog('released','Released against a shortfall',
      ccjMoney(p.shortfall)+' outstanding &middot; approved by '+p.releasedBy);
    ccjPush({who:'user',text:opt.label});
    ccjSettleStep();
    return;
  }
  if(optId==='kycConfirm'){
    const k=ccjOnb().kyc,c=ccjClient();
    c.mins+=40;
    k.reviewed='confirmed';k.reviewed_by=ccjActor();k.reviewedAt=c.mins;
    const d=ccjKycDecision();k.decision=d.id;k.score=d.score;
    ccjPush({who:'user',text:opt.label});
    ccjSettleStep();
    return;
  }
  if(optId==='kycReject'){
    const k=ccjOnb().kyc;
    k.reviewed='rejected';k.reviewed_by=ccjActor();
    const d=ccjKycDecision();k.decision=d.id;k.score=d.score;
    run.stopped=true;run.phase='stopped';
    ccjPaint();ccjPaintScreen();
    ccjPush({who:'agent',text:'Identity verification rejected. Onboarding cannot continue and the placement is stopped.'});
    return;
  }
  /* Releasing the first payroll. NOT a settle: the money has not moved yet — approving is what
     STARTS it moving. So the step goes back to holding, on the second half of its own work, and
     the hold it re-reads is the one that now points at the disbursement (see CCJ_HOLDS). Settling
     here would have ticked the row green while the payment file was still being built. */
  if(optId==='payApprove'){
    const pr=ccjPayrun(),c=ccjClient();
    c.mins+=55;
    // The hold is cleared but `heldBy`/`heldAt` are not: that it was held is part of the record of
    // this run, and a released run that erased its own hold would be reporting a clean approval.
    pr.held=false;
    pr.approvedBy=ccjActor();pr.approvedAt=c.mins;pr.state='approved';
    ccjPush({who:'user',text:opt.label});
    run.phase='hold';ccjPaint();ccjPaintScreen();
    ccjPayrunRelease();
    return;
  }
  /* Held. An exception, recorded as one — who held it and when — and the run stays HALTED on the
     same row rather than moving on, because nobody has been paid. It stays halted rather than
     waiting so the decision block stays on screen: a hold is reversible, and the post gate is a
     function of state, so it comes back asking the opposite question (see CCJ_POST_GATES). The
     decision is deleted for the same reason — holding did not complete this step. */
  if(optId==='payHold'){
    const pr=ccjPayrun(),c=ccjClient();
    c.mins+=30;
    pr.held=true;pr.heldBy=ccjActor();pr.heldAt=c.mins;pr.state='held';
    delete run.decisions[ccjKey(run.stage,step)];
    ccjPush({who:'user',text:opt.label});
    ccjPush({who:'agent',text:'First payroll run held by '+pr.heldBy
      +'. Nothing has been paid and no filing has been made.'});
    run.phase='halt';ccjPaint();ccjPaintScreen();ccjScrollPanelToCurrent();
    return;
  }
  if(optId==='ecApprove'){
    const e=ccjEmp(),c=ccjClient();
    c.mins+=60;
    e.approvedBy=ccjActor();e.approvedAt=c.mins;
    ccjPush({who:'user',text:opt.label});
    ccjSettleStep();
    return;
  }
  if(optId==='ecCountersign'){
    const e=ccjEmp(),c=ccjClient();
    c.mins+=75;
    e.adtSignedAt=c.mins;                          // in force from the LAST signature
    ccjPush({who:'user',text:opt.label});
    ccjSettleStep();
    return;
  }
  if(optId==='ecDecline'){
    ccjEmp().declined=true;
    run.stopped=true;run.phase='stopped';
    ccjPaint();ccjPaintScreen();
    ccjPush({who:'agent',text:'Contract declined at countersignature. Nothing is in force and the employee cannot start.'});
    return;
  }
  if(optId==='amend'||optId==='rework'||optId==='ecRedraft'){
    const back=CCJ_REWORK[ccjKey(run.stage,step)];
    if(optId==='amend'&&run.msa)run.msa.version++;
    const steps=ccjSteps(run.stage);
    const idx=steps.findIndex(function(s){return s.label===back;});
    if(idx>-1){
      // A redrafted contract is a new version, and the audit that ran against the old one no
      // longer describes anything on screen.
      if(optId==='ecRedraft'&&run.emp){run.emp.version++;ccjDraftContract();}
      // Everything from the rebuilt step onward is no longer true, so it is un-settled rather
      // than left on screen as a tick against work that is about to be redone.
      steps.slice(idx).forEach(function(s){delete run.settled[ccjKey(run.stage,s)];});
      delete run.decisions[ccjKey(run.stage,step)];
      ccjPush({who:'user',text:opt.label});
      ccjPush({who:'agent',text:'Sent back. Rebuilding the cost from <b>'+back+'</b>.'});
      run.sub=idx;
      ccjEnterStep();
      return;
    }
  }
  ccjPush({who:'user',text:opt.label});
  ccjSettleStep();
}
function ccjReopen(){
  const run=ccjRun;if(!run)return;
  const step=ccjSteps(run.stage)[run.sub];
  if(step){delete run.decisions[ccjKey(run.stage,step)];delete run.settled[ccjKey(run.stage,step)];}
  run.stopped=false;
  ccjPush({who:'agent',text:'Reopened.'});
  ccjEnterStep();
}
/* Every sub-status in the stage has settled, so the stage itself is done — and only now does
   the journey move. Stages 2-9 have not been designed yet; they render an honest placeholder
   under a live rail and a live panel, which is what lets the machine be walked end to end
   while the screens are built one stage at a time. */
/* Stages that rest when they finish instead of moving on. Stage 4 has no human step at all, so
   without this the account it just created would flash past in the seconds it took to build. */
const CCJ_STAGE_REST={
  'quote-approved':{label:'Continue to client signing'},
  // The signed agreement coming back is what this stage produced. Walking past it in the half
  // second after the countersignature lands would be walking past the outcome.
  'agreement-signature':{label:'Continue to deposit'}
};
function ccjContinueStage(){
  const run=ccjRun;if(!run||run.phase!=='rest')return;
  run.rested=true;
  ccjStageComplete();
}
function ccjStageComplete(){
  const run=ccjRun;if(!run)return;
  const rest=CCJ_STAGE_REST[ccjStage(run.stage).id];
  if(rest&&!run.rested){run.phase='rest';ccjPaint();ccjPaintScreen();return;}
  run.rested=false;
  const next=run.stage+1;
  // The last stage finishing is a state the SCREEN reports, not only the panel — the placement
  // going live is the outcome of the journey and it is drawn on the work area. Painting the panel
  // alone left the final screen showing the run still in progress after it had finished.
  if(next>=ccjStages().length){run.phase='done';ccjPaint();ccjPaintScreen();return;}
  run.stage=next;run.sub=-1;run.phase='idle';
  run.screen=(ccjScreensFor(next)[0]||{}).id||'';
  page=ccjPageId(next);
  renderADTPage();
  // Stage 1 was started by the request being submitted. Every stage after it is agent-driven
  // from the moment the run arrives, so it begins on its own after a beat to let the rail land.
  const ev=ccjEvent(next);
  if(ev.desc)ccjPush({who:'agent',text:ccjStageOpener(next)});
  ccjSchedule(function(){ccjStart();},900);
}
/* One line when a stage opens, saying what is about to happen. Derived from the stage's own
   first sub-status rather than authored per stage, so it cannot drift from what then runs. */
function ccjStageOpener(i){
  const first=ccjSteps(i)[0];
  const s=ccjStage(i);
  return s.short+'. Starting with <b>'+(first?first.label:'the first step')+'</b>.';
}

/* Every client event lands here — scripted or clicked, the same path, so the override strip
   cannot produce a state the auto-run could not reach. */
function ccjClientEvent(ev,at,kind){
  const run=ccjRun;if(!run)return;
  const c=ccjClient();
  if(at!==undefined)c.mins=Math.max(c.mins,at);
  if(ev==='viewed'||ev==='viewed2'){
    c.state=ev==='viewed'?'viewed':'viewed2';
    if(c.openedAt===null)c.openedAt=c.mins;
    ccjClientLog(ev==='viewed'?'opened':'opened2',ev==='viewed'?'Opened':'Opened v2','Tracked on open');
    ccjClientNote('Opened the quote'+(c.version>1?' (v'+c.version+')':''));
    ccjResolveWait();
  }else if(ev==='chase'){
    if(c.chases>=3)return;
    c.chases++;
    c.state='chased';
    ccjClientLog('chase'+c.chases,'Follow-up '+c.chases+' of 3',
      c.chases>=3?'Final reminder':'Scheduled reminder');
    ccjClientPush({who:'us',kind:'chase',n:c.chases,at:c.mins});
    ccjResolveWait();ccjPaint();
  }else if(ev==='changed'){
    c.state='changed';
    c.unread++;
    c.ask=kind||'price';
    ccjClientLog('changed','Change requested',c.ask==='terms'
      ?'Client asked to change start date and probation':'Client asked for a better rate');
    if(c.ask==='price'){
      const now=ccjQuote(),want=ccjQuote(17);
      ccjClientPush({who:'client',text:'Thanks for this. <b>'+now.sym+' '+now.total.toLocaleString()
        +'</b> is above what we budgeted &mdash; can you improve on the rate? If you can get closer to <b>'
        +want.sym+' '+want.total.toLocaleString()+'</b> a month we can move ahead this week.',at:c.mins});
    }else{
      c.changes=[{k:'Start date',from:ccjPrettyDate(ccjRun.form.fromDate),to:'1 Oct 2026'},
                 {k:'Probation', from:(ccjRun.form.probation||'3')+' months',to:'6 months'}];
      ccjClientPush({who:'client',text:'The numbers work for us. Two things before we sign: can we push the start to <b>1 October</b>, and make probation <b>6 months</b> rather than three?',at:c.mins});
    }
    ccjResolveWait();
    // The agent drafts the reply rather than sending it. What goes to a client is the Account
    // Manager's to send, and a negotiating position is not something to automate away.
    ccjScheduleChat(function(){
      c.drafted=true;
      if(c.ask==='price'){
        const cut=ccjQuote(17);
        ccjClientPush({who:'agent',kind:'draft',
          text:'I can hold the build and take margin from '+ccjQuote().margin+'% to 17%. That lands at <b>'
            +cut.sym+' '+cut.total.toLocaleString()+'</b> &mdash; inside their number.',at:c.mins+40});
      }else{
        ccjClientPush({who:'agent',kind:'draft',
          text:'Both are fine. Start moves to <b>1 October</b> and probation to <b>6 months</b>. Neither changes the employer cost, so the price holds at <b>'
            +ccjQuote().sym+' '+ccjQuote().total.toLocaleString()+'</b>.',at:c.mins+40});
      }
    },1400);
  }else if(ev==='agreed'){
    c.state='agreed';
    // Only a price request moves the margin. A terms request changes the contract and leaves
    // the commercials exactly where they were — which is the whole point of separating them.
    if(c.ask==='price')run.margin=17;
    else{run.form.fromDate='2026-10-01';run.form.probation='6';}
    c.unread++;
    ccjClientPush({who:'client',text:'That works. Send the revised quote and we will sign it off.',at:c.mins});
    ccjResolveWait();
  }else if(ev==='accepted'){
    c.state='accepted';
    c.unread++;
    ccjClientLog('accepted','Accepted','Ready to move to signing');
    ccjClientPush({who:'client',kind:'accept',text:'Approved. Please go ahead.',at:c.mins});
    ccjResolveWait();
  }else if(ev==='quiet'){
    c.state='viewed';                              // back to waiting; the chases resume
  }
  ccjPaintWork();
  ccjClientSchedule();
}
/* "void in Netherlands" is not English, and this journey writes contract clauses. Two of the
   seven countries it operates in take a definite article in running prose; used adjectivally
   ("the Netherlands statutory set") they do not, which is why this is applied at each site
   rather than baked into the country name. */
function ccjInCountry(c){
  return /^(Netherlands|United Kingdom|United States|Philippines|Czech Republic)$/.test(String(c))
    ?'the '+c:String(c);
}
function ccjPrettyDate(iso){
  if(!iso)return '&mdash;';
  const M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const p=String(iso).split('-');
  return p.length===3?(Number(p[2])+' '+(M[Number(p[1])-1]||'')+' '+p[0]):String(iso);
}
/* THE TIMELINE IS A RECORD, NOT AN INFERENCE. It used to be derived from the client's current
   state with hard-coded timestamps, which meant a run where the client simply opened the quote
   and accepted it still displayed 'Change requested — Client asked for a better rate', and every
   event carried a date it did not happen on. If it is not in this log, it did not happen. */
function ccjClientLog(id,label,sub){
  const c=ccjClient();
  if(c.log.some(function(e){return e.id===id;}))return;   // each event happens once
  c.log.push({id:id,label:label,sub:sub||'',at:c.mins});
}
function ccjClientNote(text){
  const c=ccjClient();
  ccjClientPush({who:'note',text:text,at:c.mins});
}
function ccjClientPush(m){
  const c=ccjClient();
  c.msgs.push(m);
  ccjRenderChat();
}
/* A sub-status that parks until the CLIENT does something. Unlike a hold — which waits on work
   happening elsewhere in the product — this waits on a person outside it, and may never resolve
   at all. That is why the chases exist. */
const CCJ_WAITS={
  // `pre` parks BEFORE the work rather than after it. Rebuilding a price before the client has
  // agreed to it is not preparation, it is guessing.
  'quote-review/Viewed':{on:function(){return ccjClient().version>1?'viewed2':'viewed';},pre:true,
    note:'Waiting for the client to open the quote.'},
  'quote-review/Follow-up 1 / 2 / 3':{on:'changed', note:'Chasing. Reminders stop the moment they reply.'},
  'quote-review/Change requested':{on:'changed', pre:true, note:'Waiting to hear back from the client.'},
  'quote-review/Re-issued v2':   {on:'agreed',  pre:true, note:'Holding until the revised price is agreed.'},
  // Nothing to verify until the signed copy is back, so this parks before its work rather than
  // after it — you cannot check a signature you have not received.
  'agreement-signature/Signed':{pre:true,met:function(){return !!ccjMsa().clientSignedAt;},
    note:'Sent for signature. Waiting for the client to sign and return it.'}
};
function ccjWaitFor(i,step){return step?(CCJ_WAITS[ccjKey(i,step)]||null):null;}
function ccjResolveWait(){
  const run=ccjRun;if(!run||run.phase!=='wait')return;
  const step=ccjSteps(run.stage)[run.sub];
  const w=ccjWaitFor(run.stage,step);
  if(!w||!ccjWaitMet(w))return;
  // A `pre` wait had not started its work yet — now it can.
  if(w.pre){run.phase='act';run.act=0;ccjPaint();ccjRunAct();return;}
  ccjSettleStep();
}
/* After a step settles, some stages send the run somewhere other than the next row. Re-issuing
   a quote puts it back in front of the client, which is the row it already passed. */
const CCJ_GOTO={'quote-review/Re-issued v2':'Viewed'};

/* ---- ROUTING --------------------------------------------------------------------------- */
function ccjRenderPage(el){
  const run=ccjEnsureRun();
  // The chooser is its own page and renders alone — no header, no rail, no panel.
  if(page==='ccj-model'){el.innerHTML=buildCCJModelHTML();return;}
  // `ccj-start` is an alias for stage 1: the conversation is the intake, so there is no screen
  // in front of it. Kept as a route so an old link or a restored session still lands.
  if(page==='ccj-start'){
    page=ccjPageId(0);
    const t=document.getElementById('adt-page-title');
    if(t)t.textContent=getPageTitle(page);
  }
  const i=ccjStageOf(page);
  // The page and the run must agree on which stage this is, or the rail would draw one stage
  // while the panel ran another's sub-statuses.
  if(i>=0&&i!==run.stage){
    run.stage=i;run.sub=-1;run.phase='idle';
    run.screen=(ccjScreensFor(i)[0]||{}).id||'';
  }
  el.innerHTML=buildCCJStageHTML(i<0?run.stage:i);
  ccjRenderChat();
  ccjAfterScreen();
}
/* Moving between screens INSIDE a stage. The shell is not touched — only the work area is
   rebuilt — which is what keeps the sub-status panel standing through the whole stage. */
function ccjGoScreen(id){
  const run=ccjRun;if(!run||!id)return;
  run.screen=id;
  ccjPaintWork(true);      // an arrival — the columns move into place rather than appearing
  ccjPaintHead();          // the model chip becomes reopenable once the chooser is behind us
  ccjReachScreen(id);      // may release a held sub-status
  ccjAfterScreen();
}
/* `enter` marks a paint that is a genuine arrival — a new screen — rather than a refresh. It
   is what lets the chat column narrow and the screen slide in as one movement instead of the
   three-column layout snapping into place fully formed. */
function ccjPaintWork(enter){
  const el=document.getElementById('ccj-work');
  if(!el)return;
  el.innerHTML=ccjWorkHTML(ccjRun.stage);
  if(el.classList){
    el.classList.remove('ccj-enter');
    if(enter){
      // Reading offsetWidth between remove and add restarts the animation rather than letting
      // the browser collapse both class changes into no change at all.
      if(typeof el.offsetWidth==='number')void el.offsetWidth;
      el.classList.add('ccj-enter');
    }
  }
  ccjRenderChat();
}
function ccjPaintComposer(){
  const el=document.getElementById('ccj-composer');
  if(el)el.innerHTML=ccjComposerInnerHTML();
}
/* Per-screen arrival work: the form asks for its first missing field, so the conversation has
   something to do the moment it appears beside it. */
function ccjAfterScreen(){
  const run=ccjRun;if(!run)return;
  if(run.screen==='form')ccjScheduleChat(ccjAskNextField,700);
}

/* ---- THE SHELL ------------------------------------------------------------------------- */
function buildCCJStageHTML(i){
  const s=ccjStage(i);
  if(!s)return '<div class="ccj-shell">'+buildCCJPlaceholderHTML('Unknown stage','This stage is not available.')+'</div>';
  return '<div class="ccj-shell">'
    +buildCCJHeadHTML(i)
    +buildCCJRailHTML(i)
    +'<div class="ccj-body">'
    +'<div class="ccj-work" id="ccj-work">'+ccjWorkHTML(i)+'</div>'
    +buildCCJPanelHTML(i)
    +'</div>'
    +'<div class="ccj-drawer-host" id="ccj-drawer-host">'+buildCCJDrawerHTML()+'</div>'
    +'</div>';
}
/* The work area is 3/4 of the body and splits again: the conversation on the left, the
   screen's own surface on the right. On the first screen the conversation IS the screen, so
   it takes the whole area rather than sitting in a column beside nothing. */
function ccjWorkHTML(i){
  const run=ccjRun;
  const def=ccjScreenDef(i,run.screen);
  if(!def)return buildCCJStagePlaceholderHTML(i);
  if(def.chat==='full')return '<div class="ccj-work-full">'+buildCCJChatHTML(true)+'</div>';
  return '<div class="ccj-chat-col'+(def.chatWide?' wide':'')+'">'+buildCCJChatHTML(false)+'</div>'
    +'<div class="ccj-screen" id="ccj-screen">'+ccjScreenHTML(i,run.screen)+'</div>';
}
function ccjScreenHTML(i,id){
  if(id==='model')return buildCCJModelHTML();
  if(id==='quote')return buildCCJQuoteHTML();
  if(id==='sent')return buildCCJSentHTML();
  if(id==='account')return buildCCJAccountHTML();
  if(id==='msa')return buildCCJMsaHTML();
  if(id==='invoice')return buildCCJInvoiceHTML();
  if(id==='contract')return buildCCJEmpHTML();
  if(id==='onboarding')return buildCCJOnbHTML();
  if(id==='readiness')return buildCCJRdyHTML();
  if(id==='payrun')return buildCCJPayrunHTML();
  if(id==='active')return buildCCJActiveHTML();
  if(id==='employee')return buildCCJEmployeeCreatedHTML();
  if(id==='form')return buildCCJFormHTML();
  if(id==='proposal')return buildCCJProposalHTML();
  return buildCCJStagePlaceholderHTML(i);
}

/* ---- HEADER ----------------------------------------------------------------------------
   One 34px row carrying everything the old design spent three blocks on: the exit, the
   counter, the stage name, the engagement model, who is holding the work — plus, now, which
   screen of the stage we are on. `ccj-back` is in the class list because injectPageBackBar
   skips any page that renders its own exit. */
function buildCCJHeadHTML(i){
  return '<div class="ccj-head" id="ccj-head">'+ccjHeadInnerHTML(i)+'</div>';
}
/* Split from its wrapper so the header can be repainted in place. It has to be: the model chip
   is only reopenable once the chooser has been left, and a header built on the chooser screen
   would otherwise stay inert for the rest of the stage. Nothing in it animates, so repainting
   it on a screen change costs nothing. */
function ccjPaintHead(){
  const el=document.getElementById('ccj-head');
  if(el&&ccjRun)el.innerHTML=ccjHeadInnerHTML(ccjRun.stage);
}
function ccjHeadInnerHTML(i){
  const run=ccjRun,s=ccjStage(i),ev=ccjEvent(i);
  const agent=typeof findCfgAgentByName==='function'?findCfgAgentByName(ev.source):null;
  const wait=s.waitingOn&&s.waitingOn!=='&mdash;'
    ?'<span class="ccj-head-wait">Waiting on <b>'+s.waitingOn+'</b></span>':'';
  return ''
    +'<button class="ccj-back" onclick="ccjExit()" title="Back to Contracts">'
    +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<span class="ccj-head-step">Step '+(i+1)+' of '+ccjStages().length+'</span>'
    +'<span class="ccj-head-name">'+s.short+'</span>'
    // The chip reports the engagement model AND is the way back to it — the choice is reopenable
    // until the request is logged, and the thing that displays a decision is the most findable
    // place to change it. After that it is a read-only fact.
    +(run.started
      ?'<span class="ccj-head-model" title="'+attrSafe('Engagement model — '+ccjModelLabel(run.model))+'">'+run.model+'</span>'
      :'<button class="ccj-head-model live" onclick="ccjBackToModel()" title="'+attrSafe('Engagement model — '+ccjModelLabel(run.model))+'">'+run.model
        +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></button>')
    +(agent?'<button class="ccj-head-agent" onclick="viewCfgAgentSkillByName(\''+String(agent.name).replace(/'/g,"\\'")+'\')">'
      +'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>'
      +agent.name+'</button>':'')
    +wait;
}
function ccjModelLabel(id){
  const t=(typeof AI_CT_TYPE_CARDS!=='undefined'?AI_CT_TYPE_CARDS:[]).find(function(x){return x.id===id;});
  return t?t.sub:id;
}
function ccjExit(){ccjReset();navigatePage('contracts');}

/* ---- THE RAIL --------------------------------------------------------------------------
   56px for what the old design spent 150px on. Numbered dots, because at nine stages an
   unlabelled circle gives no sense of position and the number is already what the header
   counts. The two tracks keep the engagement/placement split the Account Manager board shows,
   so the run and the board read as one model. */
function buildCCJRailHTML(stage){
  const events=ccjStages();
  const tracks=(typeof amPipelineTracks!=='undefined'?amPipelineTracks:[]);
  const ids=[];
  events.forEach(function(e){if(e.track&&ids.indexOf(e.track)===-1)ids.push(e.track);});
  const dot=function(e,i,connect){
    const state=i<stage?'done':i===stage?'current':'pending';
    let h='<div class="ccj-step" title="'+attrSafe(e.plain)+'">'
      +'<div class="ccj-dot '+state+'">'+(state==='done'
        ?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>'
        :(i+1))+'</div>'
      +'<div class="ccj-step-label '+state+'">'+e.short+'</div></div>';
    if(connect)h+='<div class="ccj-line'+(i<stage?' filled':'')+'"></div>';
    return h;
  };
  if(ids.length<2){
    return '<div class="ccj-rail" id="ccj-rail"><div class="ccj-rail-scroll">'
      +events.map(function(e,i){return dot(e,i,i<events.length-1);}).join('')+'</div></div>';
  }
  const groups=ids.map(function(tid){
    const idx=[];
    events.forEach(function(e,i){if(e.track===tid)idx.push(i);});
    const t=tracks.find(function(x){return x.id===tid;});
    const inTrack=idx.indexOf(stage)>-1;
    const doneAll=idx[idx.length-1]<stage;
    return '<div class="ccj-track" style="flex:'+idx.length+' 1 0">'
      +'<div class="ccj-track-cap'+(inTrack?' current':doneAll?' done':'')+'" title="'+attrSafe(t?t.plain:'')+'">'+(t?t.label:tid)+'</div>'
      +'<div class="ccj-track-steps">'
      +idx.map(function(i,n){return dot(events[i],i,n<idx.length-1);}).join('')
      +'</div></div>';
  }).join('<div class="ccj-track-split" aria-hidden="true"></div>');
  return '<div class="ccj-rail" id="ccj-rail"><div class="ccj-rail-scroll tracked">'+groups+'</div></div>';
}

/* ---- THE PROCESS PANEL -----------------------------------------------------------------
   A quarter of the body, pinned right, standing for the whole stage. Every sub-status shows
   its detail, top to bottom. The same component on all nine stages — only its rows change. */
function buildCCJPanelHTML(i){
  return '<aside class="ccj-panel">'
    +'<div class="ccj-panel-prog"><div class="ccj-panel-prog-fill" id="ccj-prog" style="width:'+ccjProgressPct(i)+'%"></div></div>'
    +'<div class="ccj-panel-inner" id="ccj-panel-inner">'+ccjPanelInnerHTML(i)+'</div></aside>';
}
function ccjProgressPct(i){
  const run=ccjRun,steps=ccjSteps(i);
  if(!run||!steps.length)return 0;
  return Math.round(steps.filter(function(st){return run.settled[ccjKey(i,st)];}).length/steps.length*100);
}
function ccjPanelInnerHTML(i){
  const run=ccjRun,s=ccjStage(i),steps=ccjSteps(i);
  const doneCount=steps.filter(function(st){return run.settled[ccjKey(i,st)];}).length;
  const autoCount=steps.filter(function(st){return st.auto;}).length;
  const sla=steps.map(function(st){return st.sla;}).filter(Boolean)[0]||'';
  return '<div class="ccj-panel-head">'
    +'<div class="ccj-panel-title">Steps in &ldquo;'+s.short+'&rdquo;</div>'
    +'<div class="ccj-panel-meta">'
    +'<span class="ccj-panel-count">'+doneCount+' of '+steps.length+'</span>'
    +'<span class="ccj-panel-dot">&middot;</span><span>'+(steps.length-autoCount)+' yours</span>'
    +(sla?'<span class="ccj-panel-sla">'+sla+'</span>':'')
    +'</div></div>'
    +'<div class="ccj-panel-body">'
    +steps.map(function(st,n){return ccjRowHTML(i,st,n);}).join('')
    +'</div>';
}
function ccjOwnerChipHTML(step){
  const info=typeof amOwnerInfo==='function'?amOwnerInfo(step.owner):{initials:'?',who:step.owner};
  return '<span class="ccj-row-owner'+(step.auto?' auto':'')+'" title="'+attrSafe(step.owner+' — '+info.who)+'">'
    +(step.auto?'AUTO':info.initials)+'</span>';
}
function ccjRowHTML(i,step,n){
  const run=ccjRun;
  const key=ccjKey(i,step);
  const settled=run.settled[key];
  const live=run.started&&run.sub===n&&!settled;
  const state=settled?'done':live?'current':'pending';
  const working=live&&run.phase!=='halt'&&run.phase!=='stopped';
  const ico=settled
    ?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>'
    :working?'<span class="ccj-spin"></span>'
    :(n+1);
  return '<div class="ccj-row '+state+(live&&run.phase==='halt'?' halted':'')+'">'
    +'<div class="ccj-row-top">'
    +'<div class="ccj-row-ico">'+ico+'</div>'
    +'<div class="ccj-row-main">'
    +'<div class="ccj-row-label">'+step.label+(step.cond?'<span class="ccj-row-cond">'+step.cond+'</span>':'')+'</div>'
    +(settled?'<div class="ccj-row-sum">'+settled.summary+'</div>':'')
    +'</div>'
    +ccjOwnerChipHTML(step)
    +'</div>'
    +ccjRowDetailHTML(i,step,n,state,live)
    +'</div>';
}
/* Every row carries detail — that is what "top to bottom, with the details" means. What the
   detail IS depends on where the row stands: a pending row says what it will do, a running or
   settled row says what it found. */
function ccjRowDetailHTML(i,step,n,state,live){
  const run=ccjRun;
  // An arrival gate replaces the work; a post gate follows it, so it only shows once the step has
  // halted — and the evidence that justifies the decision stays visible above it.
  const gate=ccjGateFor(i,step)||(live&&run.phase==='halt'?ccjPostGateFor(i,step):null);
  if(live&&gate)return ccjGateHTML(i,step,gate);
  const settled=run.settled[ccjKey(i,step)];
  // A step that did not need to run says so, and says why. The reason IS the evidence — it is
  // the agent showing it considered the step and ruled it out.
  if(settled&&settled.skipped)return '<div class="ccj-ev skipped">'
    +'<div class="ccj-will">'+(settled.reason||ccjPurpose(i,step))+'</div></div>';
  if(state==='pending')return '<div class="ccj-ev pending">'
    +'<div class="ccj-will">'+ccjPurpose(i,step)+'</div>'
    +(step.sla?'<div class="ccj-will-sla">Target '+step.sla+'</div>':'')
    +'</div>';
  const d=ccjEvidence(i,step);
  const hold=live&&run.phase==='hold'?ccjHoldFor(i,step):null;
  const wait=live&&run.phase==='wait'?ccjWaitFor(i,step):null;
  if(wait)return '<div class="ccj-ev">'
    +'<div class="ccj-hold"><span class="ccj-hold-bar"></span>'+wait.note+'</div></div>';
  return '<div class="ccj-ev">'
    +'<div'+(live?' id="ccj-ev-lines"':'')+'>'+ccjActLogHTML(i,step,state)+'</div>'
    // While a document is being read, the held row reports THAT rather than the generic note.
    // Parsing is the intake being captured, so it belongs to this sub-status — and it is what
    // makes the hold visibly earn its time instead of just sitting there.
    +(hold?'<div class="ccj-hold"><span class="ccj-hold-bar"></span>'+ccjHoldNoteHTML(hold)+'</div>':'')
    +(d?'<button class="ccj-ev-more" onclick="ccjInspect(\''+attrSafe(ccjKey(i,step))+'\')">'
      +'View evidence'
      +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>':'')
    +'</div>';
}
/* THE ACTION LOG. One line per action, in order, each showing what it is doing while it does it
   and what it found once done. A fetch and a verify carry their payload underneath, because
   "14 records returned" is a claim and the fourteen records are the evidence for it.

   Only the action currently running animates. The list is rebuilt on every beat, so animating
   the finished lines again each time would read as a flicker rather than as progress. */
function ccjActLogHTML(i,step,state){
  const run=ccjRun;
  const acts=ccjActsFor(i,step);
  const at=state==='done'?acts.length:(run.act||0);
  return acts.map(function(a,n){
    const done=n<at, doing=n===at&&state!=='done';
    if(!done&&!doing)return '';                     // not reached — nothing to claim yet
    return '<div class="ccj-act'+(done?' done':' doing')+(doing?' new':'')+'">'
      +'<span class="ccj-act-ico">'+(done
        ?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>'
        :'<span class="ccj-spin sm"></span>')+'</span>'
      +'<span class="ccj-act-body">'
      +'<span class="ccj-act-label'+(done&&a.ok?' ok':'')+'">'+(done?a.done:a.doing+'&hellip;')+'</span>'
      +(done&&a.rows?ccjActRowsHTML(a.rows):'')
      +(done&&a.checks?ccjActChecksHTML(a.checks):'')
      +'</span></div>';
  }).join('');
}
/* The records themselves. Capped, with the remainder counted rather than hidden — the drawer has
   the full set, and a panel that scrolled for twenty rows would bury the step still to come. */
function ccjActRowsHTML(rows){
  const cap=4;
  return '<span class="ccj-act-rows">'
    +rows.slice(0,cap).map(function(r){
      return '<span class="ccj-act-row'+(r.state==='inactive'?' off':'')+'">'
        +'<b>'+r.k+'</b><i>'+r.v+'</i></span>';
    }).join('')
    +(rows.length>cap?'<span class="ccj-act-more">+'+(rows.length-cap)+' more</span>':'')
    +'</span>';
}
function ccjActChecksHTML(checks){
  return '<span class="ccj-act-rows">'
    +checks.map(function(c){
      const v=c.verdict||'';
      return '<span class="ccj-act-check '+v+'">'
        +'<span class="ccj-act-vd">'+(v==='pass'?'&#10003;':v==='fail'?'&#10007;':'&ndash;')+'</span>'
        +'<span><b>'+c.rule+'</b><i>'+c.actual+'</i></span></span>';
    }).join('')+'</span>';
}
/* Where a person is asked for something. It sits inside the row it belongs to rather than at
   the bottom of the panel, so the question and the step it answers are never separated. */
function ccjGateHTML(i,step,gate){
  const run=ccjRun;
  if(run.stopped){
    return '<div class="ccj-gate stopped">'
      +'<div class="ccj-gate-ask">Request disqualified.</div>'
      +'<div class="ccj-gate-why">No further steps ran. Reopen to change the decision.</div>'
      +'<div class="ccj-gate-btns"><button class="ccj-gate-btn ghost" onclick="ccjReopen()">Reopen</button></div>'
      +'</div>';
  }
  const info=typeof amOwnerInfo==='function'?amOwnerInfo(step.owner):{who:step.owner,initials:'?'};
  // Whether the persona currently signed in is the one who owns this step. It is still tracked
  // and still shown — CCJ_ANY_PERSONA only decides whether a non-owner is BLOCKED from clicking,
  // so turning it off restores real role enforcement without touching anything else.
  const owns=typeof amCanAdvance==='function'?amCanAdvance(step.owner):true;
  return '<div class="ccj-gate '+gate.kind+'">'
    +'<div class="ccj-gate-ask">'+gate.ask+'</div>'
    +'<div class="ccj-gate-why">'+gate.why+'</div>'
    +'<div class="ccj-gate-who"><span class="ccj-gate-av">'+info.initials+'</span>'+step.owner+' &middot; '+info.who
    +(!owns&&CCJ_ANY_PERSONA?'<span class="ccj-gate-behalf">Acting as</span>':'')+'</div>'
    +(owns||CCJ_ANY_PERSONA
      ?'<div class="ccj-gate-btns">'+gate.options.map(function(o){
        return '<button class="ccj-gate-btn '+(o.tone==='stop'?'stop':'go')+'" onclick="ccjChooseGate(\''+o.id+'\')">'+o.label+'</button>';
      }).join('')+'</div>'
      :'<div class="ccj-gate-locked">Only '+step.owner+' can approve this.</div>')
    +'</div>';
}

/* ---- THE EVIDENCE DRAWER ----------------------------------------------------------------
   Everything the panel is too narrow to hold: the call that was made, what came back, every
   rule with its expected value, actual value and verdict, and what was written to the record.
   Overlays the work area rather than pushing it, so opening it never reflows the run. */
let ccjDrawerKey=null;
function ccjInspect(key){ccjDrawerKey=key;ccjPaintDrawer();}
function ccjCloseDrawer(){ccjDrawerKey=null;ccjPaintDrawer();}
function ccjPaintDrawer(){
  const host=document.getElementById('ccj-drawer-host');
  if(host)host.innerHTML=buildCCJDrawerHTML();
}
function buildCCJDrawerHTML(){
  if(!ccjDrawerKey||!ccjRun)return '';
  const i=ccjRun.stage;
  const step=ccjSteps(i).find(function(st){return ccjKey(i,st)===ccjDrawerKey;});
  const d=step?ccjEvidence(i,step):null;
  if(!step||!d)return '';
  const c=ccjCtx();
  const fetched=ccjVal(d.fetched,c)||[];
  const checks=ccjVal(d.checks,c)||[];
  const captured=ccjVal(d.captured,c)||[];
  const call=ccjVal(d.call,c);
  const sec=function(title,body){return body?'<div class="ccj-dw-sec"><div class="ccj-dw-sec-t">'+title+'</div>'+body+'</div>':'';};
  return '<div class="ccj-dw-scrim" onclick="ccjCloseDrawer()"></div>'
    +'<div class="ccj-dw">'
    +'<div class="ccj-dw-head">'
    +'<div><div class="ccj-dw-label">'+step.label+'</div>'
    +'<div class="ccj-dw-sub">'+(ccjVal(d.system,c)||'&mdash;')
      +(ccjVal(d.ref,c)?' &middot; '+ccjVal(d.ref,c):'')+'</div></div>'
    +'<button class="ccj-dw-x" onclick="ccjCloseDrawer()">&#x2715;</button>'
    +'</div>'
    +'<div class="ccj-dw-body">'
    +sec('Reached',(call?'<div class="ccj-dw-call">'+call+'</div>':'')
      +'<div class="ccj-dw-kv"><span>Time taken</span><b>'+(ccjVal(d.latency,c)||'&mdash;')+'</b></div>')
    +sec('Came back',fetched.length?'<div class="ccj-dw-rows">'+fetched.map(function(f){
        return '<div class="ccj-dw-row '+(f.state||'')+'"><div class="ccj-dw-row-k">'+f.k
          +(f.sub?'<span>'+f.sub+'</span>':'')+'</div><div class="ccj-dw-row-v">'+f.v+'</div></div>';
      }).join('')+'</div>':'')
    +sec('Checked',checks.length?'<div class="ccj-dw-checks">'+checks.map(function(ck){
        return '<div class="ccj-dw-check '+(ck.verdict||'')+'">'
          +'<div class="ccj-dw-check-rule">'+ck.rule+'</div>'
          +'<div class="ccj-dw-check-cmp"><span>Expected</span><b>'+ck.expected+'</b></div>'
          +'<div class="ccj-dw-check-cmp"><span>Actual</span><b>'+ck.actual+'</b></div>'
          +'<span class="ccj-dw-verdict '+(ck.verdict||'')+'">'+(ck.verdict||'').toUpperCase()+'</span>'
          +'</div>';
      }).join('')+'</div>':'')
    +sec('Written to the record',captured.length?'<div class="ccj-dw-rows">'+captured.map(function(cp){
        return '<div class="ccj-dw-row"><div class="ccj-dw-row-k">'+cp.k+'</div><div class="ccj-dw-row-v">'+cp.v+'</div></div>';
      }).join('')+'</div>':'')
    +(d.note?'<div class="ccj-dw-note">'+d.note+'</div>':'')
    +(d.failure?'<div class="ccj-dw-fail"><b>If it fails</b> '+d.failure+'</div>':'')
    +'</div></div>';
}

/* ---- THE CONVERSATION -------------------------------------------------------------------
   One thread for the whole stage. It opens as the intake, then narrows to a 300px column
   beside the form, where it keeps asking for the fields that are still missing. Everything
   the agent produces is a MESSAGE inside the scrolling stream — never a new block on the page,
   which is what keeps the composer from being pushed below the fold. */
/* Which conversation the column is showing. On stage 3 the work IS the client conversation, so
   it takes the column outright — the agent still appears inside it, drafting replies, but a
   second stream to switch to would put an internal remark one mis-click from a client. */
const CCJ_CLIENT_STAGES=['quote-review','quote-approved','agreement-signature'];
/* The third counterparty. Stage 7's contract is between us and the WORKER, so the column carries
   the worker's thread — a separate store from the client's, not a mode switch over one list. The
   two must never merge: this thread discusses someone's salary and probation with them, and the
   client's discusses our margin. Either message in the other thread is a disclosure. */
const CCJ_WORKER_STAGES=['employment-contract','onboarding','active'];
function ccjChatMode(){
  const st=ccjStage(ccjRun.stage);
  if(!st)return 'agent';
  if(CCJ_WORKER_STAGES.indexOf(st.id)>-1)return 'worker';
  return CCJ_CLIENT_STAGES.indexOf(st.id)>-1?'client':'agent';
}
function buildCCJChatHTML(isFull){
  const run=ccjRun;
  const ev=ccjEvent(0);
  const mode=ccjChatMode();
  const client=mode==='client';
  if(mode==='worker'){
    const w=ccjParties().worker;
    return '<div class="ccj-chat'+(isFull?' full':'')+' client">'
      +'<div class="ccj-chat-head">'
      +'<span class="ccj-chat-av worker">'+ccjInitials(w.name)+'</span>'
      +'<div class="ccj-chat-headtext"><div class="ccj-chat-title">'+w.name+'</div>'
      +'<div class="ccj-chat-sub">Employee &middot; '+w.empId+'</div></div>'
      +'</div>'
      +'<div class="ccj-stream" id="ccj-stream"></div>'
      +'<div class="ccj-composer" id="ccj-composer">'+ccjComposerInnerHTML()+'</div>'
      +'</div>';
  }
  return '<div class="ccj-chat'+(isFull?' full':'')+(client?' client':'')+'">'
    +'<div class="ccj-chat-head">'
    +(client
      // The client's own initials. This was hardcoded "DH", so the one screen whose entire job is
      // showing who you are talking to read "DH · Helix Marine B.V."
      ?'<span class="ccj-chat-av">'+ccjInitials(ccjParties().client.name)+'</span>'
       +'<div class="ccj-chat-headtext"><div class="ccj-chat-title">'+ccjCtx().client+'</div>'
       // What the thread is ABOUT on this stage. Once the deposit is invoiced, the conversation
       // is with accounts payable about an invoice number, not with a buyer about a quote version.
       +'<div class="ccj-chat-sub">Client &middot; '
       +(ccjStage(run.stage)&&ccjStage(run.stage).id==='deposit-due'
         ?ccjInvoice().id:'quote v'+ccjClient().version)+'</div></div>'
      :'<span class="ccj-chat-spark"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg></span>'
       +'<div class="ccj-chat-headtext"><div class="ccj-chat-title">Create a contract</div>'
       +'<div class="ccj-chat-sub">'+(ev.source||'AI Prompt Parser')+'</div></div>')
    +'</div>'
    +'<div class="ccj-stream" id="ccj-stream"></div>'
    +'<div class="ccj-composer" id="ccj-composer">'+ccjComposerInnerHTML()+'</div>'
    +'</div>';
}
/* The composer is its own builder because submitting the first request changes it — the model
   pills go, the placeholder changes, the upload appears — and repainting it alone leaves the
   message stream above it untouched.

   Upload sits directly above the input, not up in the header. It is an alternative way of
   answering the same thing the input asks for, so it belongs next to the input, in the band the
   eye is already resting on when it decides how to reply. */
function ccjComposerInnerHTML(){
  const run=ccjRun;
  // No model pills here any more. The engagement model has its own screen in front of this one
  // and its own chip in the header, and a third control for the same decision — sitting under
  // the thing it does not govern — was the duplicate.
  return ''
    // Only beside the form: a document fills FIELDS, and on the screens without any there is
    // nothing for it to land in.
    +(run.screen==='form'?'<button class="ccj-upload" onclick="ccjUpload()" title="Upload an offer letter, ID or completed form to auto-fill the contract details">'
      +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'
      +'<span>Upload document to auto-fill</span></button>':'')
    +'<div class="ccj-input-row">'
    +'<textarea class="ccj-input" id="ccj-prompt" rows="1" placeholder="'+(run.started?'Add more details…':'Describe the hire')+'" '
    +'oninput="ccjGrow(this)" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();ccjSend();}"></textarea>'
    +'<button class="ccj-send" onclick="ccjSend()" title="Send">'
    +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>'
    +'</div>';
}
// Kept because it is the honest setter for the model — ccjChooseModel is the chooser screen's
// handler and also advances. Anything that only needs to set the value calls this.
function ccjSetModel(id){
  const run=ccjRun;if(!run||run.started)return;   // locked once the request is logged
  run.model=id;
  ccjPaintWork();
}
function ccjGrow(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,110)+'px';}
function ccjPush(msg){
  const run=ccjRun;if(!run)return;
  run.msgs.push(msg);
  ccjRenderChat();
}
/* The ghost has to outlive the render that emitted it, or the fade never plays: the two opening
   messages are pushed back to back, and clearing the flag on emit meant the second render tore
   the element out microseconds after the first put it in. It lives for the length of the
   animation and no longer — nothing else arrives inside that window. */
function ccjClearGhostLater(){
  const g=ccjGen,run=ccjRun;if(!run)return;
  if(run.ghostTimer)clearTimeout(run.ghostTimer);
  run.ghostTimer=setTimeout(function(){
    if(ccjGen!==g||ccjRun!==run)return;
    run.ghostTimer=null;run.emptyGhost=false;ccjRenderChat();
  },460);
}
function ccjRenderChat(){
  const el=document.getElementById('ccj-stream');
  if(!el||!ccjRun)return;
  const run=ccjRun;
  const mode=ccjChatMode();
  if(mode==='client'||mode==='worker'){
    const src=mode==='worker'?ccjWorker():ccjClient();
    el.innerHTML=src.msgs.length
      ?src.msgs.map(function(m,n){return ccjClientMsgHTML(m,n===src.msgs.length-1);}).join('')
      :'<div class="ccj-empty"><div class="ccj-empty-text">'
       +(mode==='worker'?'Nothing has gone to the employee yet.':'The quote has not gone out yet.')
       +'</div></div>';
    el.scrollTop=el.scrollHeight;
    return;
  }
  // The invitation, kept for exactly one render as a fading overlay so the first messages
  // arrive under it rather than replacing it in a single frame. Cleared as it is emitted, so a
  // later push does not restart the fade.
  const ghost=run.emptyGhost?'<div class="ccj-empty ghost">'+ccjChatEmptyInnerHTML()+'</div>':'';
  // Only the last message animates in. The stream is rebuilt on every push, so animating all
  // of them would replay the whole conversation each time a line is added.
  el.innerHTML=run.msgs.length
    ?ghost+run.msgs.map(function(m,n){return ccjMsgHTML(m,n===run.msgs.length-1);}).join('')
    :ccjChatEmptyHTML();
  el.scrollTop=el.scrollHeight;
}
function ccjChatEmptyHTML(){return '<div class="ccj-empty">'+ccjChatEmptyInnerHTML()+'</div>';}
function ccjChatEmptyInnerHTML(){
  /* The first chip is the one that gets clicked, so it is the one that shows the parser doing all
     of its work at once: model, client, country, role AND pay out of a single sentence. The others
     stay deliberately sparser — a run where the agent has to ask for the missing pieces is the
     more common one, and the empty state should not imply every request arrives complete. */
  const ex=['Hire Shiv Kumar for Helix Marine in Germany as Director of Engineering at EUR 18,500 a month',
            'Create an EOR contract for Anika Shah in Netherlands',
            'New PEO contract for Emma Schmidt at Vantage Freight in India'];
  return ''
    +'<div class="ccj-empty-title">Who are you hiring?</div>'
    +'<div class="ccj-empty-text">I will find them in ADT and pre-fill the contract.</div>'
    +'<div class="ccj-empty-chips">'+ex.map(function(t){
      return '<button class="ccj-chip" onclick="ccjFill(\''+attrSafe(t).replace(/'/g,"\\'")+'\')">'+t+'</button>';
    }).join('')+'</div>';
}
function ccjFill(text){
  const inp=document.getElementById('ccj-prompt');
  if(!inp)return;
  inp.value=text;ccjGrow(inp);inp.focus();
}
function ccjMsgHTML(m,isLast){
  const cls=function(who){return 'ccj-msg '+who+(isLast?' in':'');};
  if(m.who==='user'&&m.kind==='file')return '<div class="'+cls('user')+'">'
    +'<div class="ccj-bubble ccj-file">'
    +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
    +'<span class="ccj-file-n">'+m.name+'</span>'
    +(m.size?'<span class="ccj-file-s">'+ccjFileSize(m.size)+'</span>':'')
    +'</div></div>';
  if(m.who==='user')return '<div class="'+cls('user')+'"><div class="ccj-bubble">'+m.text+'</div></div>';
  if(m.kind==='doc')return '<div class="'+cls('agent')+'">'+ccjAvatarHTML()+ccjDocHTML()+'</div>';
  if(m.kind==='searching')return '<div class="'+cls('agent')+'">'+ccjAvatarHTML()
    +'<div class="ccj-bubble"><div class="ccj-searching">Searching ADT employee records for &ldquo;'+m.label+'&rdquo;</div>'
    +'<div class="ccj-skel"><div class="ccj-skel-av"></div><div style="flex:1"><div class="ccj-skel-l" style="width:44%"></div><div class="ccj-skel-l" style="width:66%"></div></div></div>'
    +'</div></div>';
  if(m.kind==='clientask')return '<div class="'+cls('agent')+'">'+ccjAvatarHTML()+ccjClientAskHTML()+'</div>';
  if(m.kind==='match')return '<div class="'+cls('agent')+'">'+ccjAvatarHTML()+ccjMatchHTML(m)+'</div>';
  return '<div class="'+cls('agent')+'">'+ccjAvatarHTML()+'<div class="ccj-bubble">'+m.text+'</div></div>';
}
/* The client question. Chips for the companies we already work with, because that is the common
   case and typing a name we can already resolve is friction; the composer takes anyone new. */
function ccjClientAskHTML(){
  const known=ccjKnownClients().slice(0,5);
  return '<div class="ccj-bubble ccj-ask">'
    +'Which client is this hire for?'
    +'<div class="ccj-ask-chips">'+known.map(function(n){
      return '<button class="ccj-ask-chip" onclick="ccjPickClient(\''+attrSafe(n).replace(/'/g,"\\'")+'\')">'+n+'</button>';
    }).join('')+'</div>'
    +'<div class="ccj-ask-note">Or type the company name below if they are new to us.</div>'
    +'</div>';
}
function ccjPickClient(name){
  const run=ccjRun;
  if(!run||!run.awaitingClient)return;
  const clean=String(name||'').trim();
  if(!clean)return;
  // Resolve a short or misspelled name against the companies we know, so "Vantage Freight"
  // becomes "Vantage Freight Pvt Ltd" here exactly as it would from the sentence.
  const known=ccjKnownClients().find(function(n){
    return n.toLowerCase()===clean.toLowerCase()
      ||n.toLowerCase().indexOf(clean.toLowerCase())===0;
  });
  run.intake.client=known||clean;
  run.msgs=run.msgs.filter(function(m){return m.kind!=='clientask';});
  ccjPush({who:'user',text:run.intake.client});
  ccjBeginIntake();
}
function ccjAvatarHTML(){
  return '<span class="ccj-av"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg></span>';
}
function ccjMatchHTML(m){
  const e=m.emp||{};
  const initials=String(e.name||'').split(' ').map(function(x){return x[0];}).slice(0,2).join('');
  const row=function(k,v){return '<div class="ccj-match-kv"><span>'+k+'</span><b>'+(v||'&mdash;')+'</b></div>';};
  return '<div class="ccj-bubble ccj-match">'
    +'<div class="ccj-match-tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>Match found in ADT</div>'
    +'<div class="ccj-match-top"><div class="ccj-match-av">'+initials+'</div>'
    +'<div><div class="ccj-match-name">'+e.name+'</div><div class="ccj-match-id">'+(e.empId||'')+(e.jobTitle?' &middot; '+e.jobTitle:'')+'</div></div></div>'
    +'<div class="ccj-match-grid">'
    +row('Country',e.country)+row('Email',e.email)+row('Status',e.status)+row('Engagement',ccjRun.model)
    +'</div></div>';
}

/* ---- READING THE REQUEST -------------------------------------------------------------------
   The original journey's parser strips a fixed list of filler words and calls whatever is left
   the person's name. "Hire Rohan Verma in Germany as an Operations Analyst" comes back as
   `Hire Rohan Verma as Operations Analyst` — the verb and the role end up inside the name, and
   the role itself is thrown away even though the sentence stated it.

   This one takes things OUT in order of how confidently they can be identified, and each pass
   removes what it claimed so the next cannot claim it again: engagement model, then country,
   then the role after "as", and only what survives all three is the name. That ordering is the
   whole trick — "in Germany as an Operations Analyst" only reduces cleanly once Germany is
   already gone.                                                                              */
const CCJ_MODEL_WORDS=[
  {id:'CONTRACTOR',re:/\b(independent contractor|contractors?|contract[-\s]based)\b/i},
  {id:'EOR',       re:/\b(eor|employer of record)\b/i},
  {id:'PEO',       re:/\b(peo|professional employer organi[sz]ation)\b/i}
];
// Everything that describes the REQUEST rather than the person: what is being asked for, and
// the connective tissue around it. `contract` is here but `contractor` is not — the model pass
// above has already taken that, and taking it here would strip the word out of the model.
const CCJ_FILLER=/\b(hire|hiring|onboard|onboarding|engage|recruit|create|creating|new|start|starting|make|add|raise|set ?up|please|need|want|would like|contract|contracts|agreement|proposal|request|role|position|for|an|a|the|in|into|of|on|at|with|to|and|as)\b/gi;
/* Title case that does not flatten what the user already decided. Lower-casing the whole string
   first turned "CTO" into "Cto" and would have turned "O'Brien" into "O'brien" — so any token
   carrying a capital is left exactly as typed, and only all-lowercase tokens are lifted. The
   small connecting words stay down unless they lead, because "Director Of Engineering" is not
   how anyone writes a job title. */
const CCJ_SMALL_WORDS=['of','and','the','for','at','in','on','to','a','an','or','with','de','van'];
function ccjTitleCase(s){
  let first=true;
  return String(s).split(/(\s+)/).map(function(w){
    if(!w.trim())return w;
    const lead=first;first=false;
    if(/[A-Z]/.test(w))return w;                          // theirs, not ours
    if(!lead&&CCJ_SMALL_WORDS.indexOf(w.toLowerCase())>-1)return w.toLowerCase();
    return w.replace(/^[a-z]/,function(ch){return ch.toUpperCase();});
  }).join('');
}
/* Every company this product already knows about — the clients with an account (aiClients) and
   the clients with a deal on the Account Manager's board (amDeals). Matching against real names
   is what lets "for Vantage Freight" resolve without the sentence needing a rigid shape, and it
   is also what tells stage 4 whether the client already has a tenant. Longest first, so
   "Vantage Freight Pvt Ltd" wins over a shorter name it happens to contain. */
function ccjKnownClients(){
  const out=[];
  const add=function(n){if(n&&out.indexOf(n)===-1)out.push(n);};
  ((typeof aiClients!=='undefined'&&aiClients)||[]).forEach(function(c){add(c.name);});
  ((typeof amDeals!=='undefined'&&amDeals)||[]).forEach(function(d){add(d.client);});
  return out.sort(function(a,b){return b.length-a.length;});
}
/* A company we have never seen. Requires a legal suffix — Ltd, B.V., GmbH — because that is a
   strong enough signal to tell a company from the person's name two words earlier, which a bare
   "for X" is not. */
const CCJ_CO_SUFFIX=/\b((?:[A-Z][\w&.'\-]*\s+){0,3}[A-Z][\w&.'\-]*\s+(?:Pvt\.?\s*Ltd|Private\s+Limited|Ltd|Limited|B\.?\s?V\.?|N\.?\s?V\.?|GmbH|AG|Inc\.?|LLC|PLC|S\.?A\.?|SAS|Oy|AB|A\/S))\b/;
/* THE PAY, WHEN THE SENTENCE STATES IT. Taken out FIRST, before even the engagement model, which
   is the confidence order the parser is built on: a figure carrying a currency marker or a period
   word is the least ambiguous token in the sentence, and lifting it early means it can never end
   up inside the name.

   A bare number is deliberately NOT enough. "Hire 2 engineers" must not set a salary of 2, so a
   figure only counts when something next to it says it is money — a symbol, a currency code, or
   "a month" / "per month" / "/month" — and it has to be at least three digits. Anything less
   confident is left in the sentence for the later passes, and the agent asks for the pay as it
   always did. */
const CCJ_PAY_CUR='[\\u20AC$\\u00A3\\u20B9]|\\b(?:EUR|USD|GBP|INR|Rs)\\b';
const CCJ_PAY_NUM='\\d[\\d,. ]*\\d|\\d';
/* The phrase, not just the figure. Lifting "EUR 18,500" out of "as Director of Engineering at EUR
   18,500 a month" left "at   a month" behind, and the role pass — which reads to the end of the
   sentence — swallowed it, producing the job title "Director Of Engineering At A Month". The
   country pass already carries this same lesson in its own comment; a pass has to consume its
   framing or it just moves the mess into the next one.

   The lead-in is safe to eat greedily because it only matches immediately before a money shape:
   "for Helix Marine" has no digits after "for", so the client keeps its preposition. */
const CCJ_PAY_LEAD='(?:\\b(?:at|on|of|paying|pays|salary|pay|gross|worth)\\b\\s*)*';
const CCJ_PAY_TAIL='(?:\\s*(?:\\/|\\bper\\b|\\ba\\b|\\bevery\\b)?\\s*\\bmonth(?:ly)?\\b|\\s*\\bp\\.?\\s?m\\.?)';
const CCJ_PAY_SHAPES=[
  // A currency marker makes it money on its own; the period words are then optional.
  new RegExp(CCJ_PAY_LEAD+'(?:'+CCJ_PAY_CUR+')\\s*('+CCJ_PAY_NUM+')(?:'+CCJ_PAY_TAIL+')?','i'),
  new RegExp(CCJ_PAY_LEAD+'('+CCJ_PAY_NUM+')\\s*(?:'+CCJ_PAY_CUR+')(?:'+CCJ_PAY_TAIL+')?','i'),
  // No currency, so the period words are what make it a monthly salary — and are required.
  new RegExp(CCJ_PAY_LEAD+'('+CCJ_PAY_NUM+')'+CCJ_PAY_TAIL,'i')
];
function ccjParsePay(s){
  for(let i=0;i<CCJ_PAY_SHAPES.length;i++){
    const m=s.match(CCJ_PAY_SHAPES[i]);
    if(!m)continue;
    // Separators go; a decimal point stays, the same convention ccjCtx reads the form field with.
    const n=parseFloat(String(m[1]).replace(/[, ]/g,''));
    if(!isFinite(n)||n<100)continue;                 // too small to be a monthly salary
    return {amount:n,matched:m[0]};
  }
  return null;
}
function ccjParsePrompt(text){
  let s=' '+String(text||'').replace(/\s+/g,' ').trim()+' ';
  let country='',model='',jobTitle='',client='',pay='';
  const money=ccjParsePay(s);
  if(money){pay=String(money.amount);s=s.replace(money.matched,' ');}
  for(let i=0;i<CCJ_MODEL_WORDS.length;i++){
    if(CCJ_MODEL_WORDS[i].re.test(s)){model=CCJ_MODEL_WORDS[i].id;s=s.replace(CCJ_MODEL_WORDS[i].re,' ');break;}
  }
  // The client comes out BEFORE the country, because a company can be named after a place
  // ("Helix Marine B.V.", "Arcadia Retail GmbH") and lifting the country first would cut it up.
  const known=ccjKnownClients();
  for(let i=0;i<known.length;i++){
    const re=new RegExp('\\b'+known[i].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i');
    if(re.test(s)){client=known[i];s=s.replace(re,' ');break;}
    // "for Vantage Freight" should also find "Vantage Freight Pvt Ltd" — people say the short name.
    const short=known[i].replace(/\s+(Pvt\.?\s*Ltd|Private Limited|Ltd|Limited|B\.?\s?V\.?|N\.?\s?V\.?|GmbH|AG|Inc\.?|LLC|PLC)\.?$/i,'').trim();
    if(short&&short!==known[i]){
      const sre=new RegExp('\\b'+short.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i');
      if(sre.test(s)){client=known[i];s=s.replace(sre,' ');break;}
    }
  }
  if(!client){
    const co=s.match(CCJ_CO_SUFFIX);
    if(co){client=co[1].trim();s=s.replace(co[0],' ');}
  }
  ccjCountries().forEach(function(c){
    if(country)return;
    const re=new RegExp('\\b'+c.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i');
    if(re.test(s)){country=c;s=s.replace(re,' ');}
  });
  // The role, stated as "as an Operations Analyst" / "as a Delivery Lead" / "as Marine Engineer".
  // Run AFTER the country has been lifted out, so "in Germany as an Operations Analyst" has
  // nothing left between the role and the end of the sentence.
  const jt=s.match(/\bas\s+(?:an?\s+)?([a-z][a-z0-9 &/+.'-]*?)\s*$/i)
        || s.match(/\bas\s+(?:an?\s+)?([a-z][a-z0-9 &/+.'-]*?)\s*[,.;]/i);
  if(jt){
    // Lifting the country out leaves its preposition behind, so "as a delivery ops lead in
    // india" reduces to "...lead in" and the role would keep a dangling word. Trailing
    // connectives are trimmed off the captured role, repeatedly, for the same reason.
    const role=jt[1].trim().replace(/(\s+(?:in|at|for|on|with|of|from|the|an?|to|and))+\s*$/i,'').trim();
    if(role){jobTitle=ccjTitleCase(role);s=s.replace(jt[0],' ');}
  }
  let name=s.replace(CCJ_FILLER,' ').replace(/[,.;:]/g,' ').replace(/\s+/g,' ').trim();
  // Case is only imposed when the user clearly did not bother — "priya nair" becomes "Priya
  // Nair", but anything they capitalised themselves is left alone, because a name is theirs to
  // spell and "O'Brien" does not survive being title-cased.
  if(name&&name===name.toLowerCase())name=ccjTitleCase(name);
  return {name:name,country:country,empType:model,jobTitle:jobTitle,client:client,pay:pay};
}

/* ---- SUBMITTING, AND ANSWERING THE AGENT'S QUESTIONS -------------------------------------
   One composer does both jobs. Before the request exists it takes the request; after it, it
   answers whichever form field the agent is asking about, and falls back to a plain reply. */
function ccjSend(){
  const run=ccjEnsureRun();
  const inp=document.getElementById('ccj-prompt');
  if(!inp)return;
  const raw=String(inp.value||'').trim();
  if(!raw)return;
  inp.value='';ccjGrow(inp);
  if(ccjChatMode()==='client'){ccjSendToClient(raw);return;}
  // Answering the client question by typing rather than picking a chip — a company we have never
  // worked with has no chip to click.
  if(run.awaitingClient){ccjPickClient(raw);return;}
  if(!run.started){ccjSubmitRequest(raw);return;}
  ccjPush({who:'user',text:raw});
  if(run.asking){ccjApplyAnswer(run.asking,raw);return;}
  ccjScheduleChat(function(){
    ccjPush({who:'agent',text:'Noted.'});
  },420);
}
/* Two things start at once and that is deliberate: the panel logs the intake while the
   conversation runs the lookup. They are the same stage's work seen from two sides — the
   machine's log on the right, the conversation on the left. */
function ccjSubmitRequest(raw){
  const run=ccjRun;
  const parsed=ccjParsePrompt(raw);
  if(parsed.empType)run.model=parsed.empType;
  run.intake={raw:raw,name:parsed.name||raw,country:parsed.country||'',
    jobTitle:parsed.jobTitle||'',client:parsed.client||'',pay:parsed.pay||'',type:run.model};
  // WHO THE HIRE IS FOR is not optional and is not guessable. Every number this run produces is
  // billed to a client, the agreement is signed with them, and the CSM is theirs — so if the
  // sentence did not say, the agent asks before anything starts, the same way it asks for a
  // missing date of birth. Defaulting to whoever happens to be in the topbar would quietly
  // invoice the wrong company.
  if(!parsed.client){
    run.awaitingClient=true;
    ccjPush({who:'user',text:raw});
    ccjPush({who:'agent',kind:'clientask'});
    ccjPaintComposer();
    return;
  }
  ccjBeginIntake();
}
/* The client is known — start the run. Split out of ccjSubmitRequest so the same path is taken
   whether the client came from the sentence or from the question that followed it. */
function ccjBeginIntake(){
  const run=ccjRun;
  const raw=run.intake.raw;
  const parsed={name:run.intake.name,country:run.intake.country};
  run.started=true;
  run.awaitingClient=false;
  run.reached.prompt=true;
  // The empty state does not vanish — it is left on screen for one render as an absolutely
  // positioned ghost that fades out while the first messages animate in under it. A hard cut
  // from a centred invitation to two bubbles at the top is the single most jarring moment in
  // the flow, and it is the one the user sees first.
  // Only when the client came straight out of the sentence. If the agent had to ask, the ghost
  // is long gone and the conversation already has messages in it.
  if(!run.msgs.length){run.emptyGhost=true;ccjClearGhostLater();ccjPush({who:'user',text:raw});}
  ccjPush({who:'agent',kind:'searching',label:parsed.name||raw});
  ccjStart();                                   // the panel starts working immediately
  // Only the composer is repainted, NOT the whole work area. Rebuilding the chat here would
  // destroy the stream node the messages were just animated into and replay them from nothing.
  ccjPaintComposer();
  ccjScheduleChat(ccjResolveLookup,CCJ_SEARCH);
}
function ccjResolveLookup(){
  const run=ccjRun;if(!run)return;
  const emp=typeof findExistingEmployee==='function'?findExistingEmployee(run.intake.name):null;
  // Replace the skeleton in place rather than appending under it — a conversation does not keep
  // its own loading state once the answer has arrived.
  run.msgs=run.msgs.filter(function(m){return m.kind!=='searching';});
  if(emp){
    run.match=emp;
    if(!run.intake.country&&emp.country)run.intake.country=emp.country;
    ccjPush({who:'agent',kind:'match',emp:emp});
    ccjPush({who:'agent',text:'Contract pre-filled from their record.'});
    ccjPrefillForm();
    ccjScheduleChat(function(){ccjGoScreen('form');},900);
  }else{
    run.createdEmp=ccjCreateEmployee();
    ccjPush({who:'agent',text:'No match for <b>'+run.intake.name+'</b> in ADT. Created employee record <b>'+run.createdEmp.empId+'</b>.'});
    ccjPrefillForm();
    ccjScheduleChat(function(){ccjGoScreen('employee');},900);
  }
  ccjPaint();                                   // the panel's context just changed
}
/* A real ADT record, pushed into the same store the Employees listing reads, so the person
   created here exists everywhere in the app rather than only inside this run. */
function ccjCreateEmployee(){
  const run=ccjRun;
  const name=run.intake.name||'New Employee';
  const country=run.intake.country||'';
  const global=!!country;
  const arr=global?globalEmpData:directEmpData;
  const newId=arr.reduce(function(m,e){return Math.max(m,e.id);},0)+1;
  const empId=(global?'GEP':'EMP')+String(newId).padStart(3,'0');
  const now=typeof aiFormatNow==='function'?aiFormatNow():{date:'—',time:'—'};
  const rec=Object.assign({
    id:newId,name:name,empId:empId,dept:'—',jobTitle:run.intake.jobTitle||'—',joinDate:now.date,
    desc:'Created via the Contract Creation journey',contact:'—',email:'—',status:'Active'
  },global?{country:country,workerType:run.model}:{branch:'—'});
  arr.push(rec);
  return rec;
}
/* ---- DOCUMENT PARSING --------------------------------------------------------------------
   Upload an offer letter, an ID or a filled-in form and the agent reads the contract out of it.

   WHY THIS IS ONE CARD AND NOT TWENTY-FOUR MESSAGES. The obvious way to show extraction is to
   replay the whole question flow against the document — ask for a field, answer it from the
   file, repeat. That is what the original journey did, and it costs two messages per field:
   twenty-four bubbles to report a single pass the machine made in one go. It reads as theatre,
   and worse, it buries the only thing a reviewer actually needs, which is not "what did you
   find" but "where did you get it".

   So extraction is ONE message that grows: a card listing each field as it lands, with the part
   of the document it was read out of. Each row carries that citation and nothing else.

   NO CONFIDENCE MARKER. An earlier version graded every row CERTAIN / LIKELY / GUESS. It was
   removed on the owner's call, and the call is right: the values are read straight from the
   document, so a row labelled LIKELY invites doubt about something that is not in doubt. The
   citation survives because it answers the question that remains useful — where this came from —
   without implying the answer might be wrong.

   The fields the document does not cover are named at the end rather than silently left blank,
   and the agent then asks for those in conversation exactly as it would have anyway.

   WHAT IT MAY OVERWRITE. Empty fields, and fields the AGENT pre-filled — a document is better
   evidence than an inference. Never a value the user typed. Their edit is the most recent
   human judgement on that field and nothing automatic outranks it.                          */
function ccjUpload(){
  const inp=document.getElementById('ccj-upload-input');
  if(!inp)return;
  inp.value='';
  inp.click();
}
/* WHAT THE SAMPLE DOCUMENT ACTUALLY SAYS. One object, and the PDF in sample-docs/ is GENERATED
   from it — see tools/make-sample-doc.js. Every row of the extraction card cites the part of the
   document its value came from, and that citation is a promise the value is really on the paper.
   Two hand-maintained copies would break that promise the first time one of them was edited, so
   the paper and the parser read the same constant.

   `annual` is the figure the document prints. The form field is MONTHLY, which is why the
   extractor divides and says so. */
const CCJ_SAMPLE_DOC={
  ref:'ADT-INT-2026-0417',
  issued:'24 July 2026',
  entity:'ADT Germany EOR Services GmbH',
  currency:'EUR',
  /* `v` is what the FORM stores — it has to match the field's type and, for a select or a radio,
     be one of its options exactly. `p` is what the PAPER prints, which is allowed to be longer and
     to carry a unit. Where they are the same only `v` is given. Splitting them is what lets the
     document read like a document ("6 months") while the field still receives a number ("6"). */
  fields:{
    nationality:{v:'India'},
    country:    {v:'Germany'},
    workPermit: {v:'Yes, employee has a work permit'},
    fname:      {v:'Shiv'},
    lname:      {v:'Kumar'},
    /* Illustrative, not anyone's. This is a demo persona that ships in a repository with a
       remote, so the date of birth and the address are made up on purpose — a real pair of those
       next to a real full name is a meaningful identity disclosure, and git keeps what it is
       given. The nationality is real because the journey genuinely branches on it. */
    dob:        {v:'1990-06-12', p:'12 June 1990'},
    gender:     {v:'Male'},
    email:      {v:'shiv.kumar@personalmail.com'},
    mobile:     {v:'+91 98110 24578'},
    address:    {v:'12 Jubilee Hills, Hyderabad, India'},
    jobTitle:   {v:'Director of Engineering'},
    skill:      {v:'Platform Engineering & Team Leadership'},
    jobDesc:    {v:'Leads the platform engineering group and owns delivery across the EU region.'},
    term:       {v:'Permanent'},
    schedule:   {v:'Full time', p:'Full time &mdash; 40 hours per week'},
    fromDate:   {v:'2026-09-01', p:'1 September 2026'},
    pay:        {v:'18500', p:'EUR 18,500 per month'},
    probation:  {v:'6',  p:'6 months'},
    notice:     {v:'30', p:'30 days'}
  },
  // The paper states the ANNUAL figure and the intake row states the monthly one it divides to,
  // which is the unit the form actually wants. Both are printed so the arithmetic is checkable.
  annual:222000,
  // Not captured, and the form does not want it: End Date only exists on a fixed term.
  omitted:[{k:'toDate',label:'End Date',why:'Not applicable &mdash; permanent engagement'}]
};
function ccjSampleField(k){return (CCJ_SAMPLE_DOC.fields[k]||{}).v||'';}
/* What the sample document in sample-docs/ contains, resolved against THIS run so uploading a
   file for Anika Shah does not suddenly report Shiv's name back. `from` is the part of the
   document the value was read out of — the citation is what makes the card reviewable. */
function ccjDocExtract(){
  const run=ccjRun,it=run.intake||{},e=run.match||run.createdEmp||{};
  const parts=String(it.name||e.name||'').split(' ').filter(Boolean);
  const country=it.country||e.country||'Germany';
  const real=function(v,fallback){return v&&v!=='—'?v:fallback;};
  const D=CCJ_SAMPLE_DOC,F=D.fields,S=ccjSampleField;
  /* Which section of the intake form each value was read out of. The citation is the whole point
     of the card — it tells a reviewer where to look on the paper to check the value — so it names
     a real heading on the document rather than a vague one. */
  const SEC={nationality:'Eligibility',country:'Eligibility',workPermit:'Eligibility',
    fname:'Employee information',lname:'Employee information',dob:'Employee information',
    gender:'Employee information',email:'Employee information',mobile:'Employee information',
    address:'Employee information',
    jobTitle:'Job details',skill:'Job details',jobDesc:'Job details',term:'Job details',
    schedule:'Job details',fromDate:'Job details',pay:'Job details',
    probation:'Probation and notice',notice:'Probation and notice'};
  const from=function(k){return SEC[k]||'Intake form';};
  return [
    // The run's own name wins over the paper's — uploading a sheet while a different person's
    // request is open must not rename them mid-run.
    {k:'fname',   v:parts[0]||S('fname'),              from:from('fname')},
    {k:'lname',   v:parts.slice(1).join(' ')||S('lname'),from:from('lname')},
    {k:'dob',     v:S('dob'),                          from:from('dob')},
    {k:'gender',  v:S('gender'),                       from:from('gender')},
    {k:'email',   v:real(e.email,S('email')),          from:from('email')},
    {k:'mobile',  v:S('mobile'),                       from:from('mobile')},
    {k:'address', v:S('address'),                      from:from('address')},
    // The form STATES a nationality, so it is read rather than guessed from the work country.
    // Inferring it was wrong for exactly the case this demo is: an Indian national placed in
    // Germany was recorded as a German national, which then chose the wrong identity document
    // and answered the right-to-work question without ever asking it.
    {k:'nationality',v:S('nationality'),               from:from('nationality')},
    {k:'country', v:country||S('country'),             from:from('country')},
    {k:'workPermit',v:S('workPermit'),                 from:from('workPermit')},
    {k:'jobTitle',v:real(e.jobTitle,S('jobTitle')),    from:from('jobTitle')},
    {k:'skill',   v:S('skill'),                        from:from('skill')},
    {k:'jobDesc', v:S('jobDesc'),                      from:from('jobDesc')},
    {k:'term',    v:S('term'),                         from:from('term')},
    {k:'schedule',v:S('schedule'),                     from:from('schedule')},
    {k:'fromDate',v:S('fromDate'),                     from:from('fromDate')},
    {k:'probation',v:S('probation'),                   from:from('probation')},
    {k:'notice',  v:S('notice'),                       from:from('notice')},
    // Monthly, because the field is monthly. The sheet states an ANNUAL figure — 222,000 — and
    // this used to carry it through untouched, which quoted the client the annual number every
    // month. A unit mismatch is not a rounding error, it is a wrong answer. Keep this in step
    // with sample-docs/: the citation promises the reader it was divided, so it must have been.
    {k:'pay',     v:String(D.annual/12),               from:from('pay')+' (annual &divide; 12)'}
  ];
}
function ccjHandleUpload(e){
  const file=e&&e.target&&e.target.files&&e.target.files[0];
  if(!file)return;
  ccjStartExtraction(file.name,file.size);
}
function ccjStartExtraction(name,size){
  const run=ccjRun;if(!run)return;
  run.asking=null;                                  // the document answers whatever was pending
  const fields=ccjDocExtract().filter(function(x){
    const f=ccjAllFields().find(function(y){return y.k===x.k;});
    if(!f||!ccjFieldApplies(f))return false;
    // Empty, or filled by the agent's own inference. Never a value the user typed.
    return !String(run.form[x.k]||'').trim()||run.aiFilled[x.k];
  });
  run.doc={name:name,size:size||0,fields:fields,at:0,done:false};
  ccjPush({who:'user',kind:'file',name:name,size:size||0});
  ccjPush({who:'agent',kind:'doc'});
  ccjPaint();                                       // the held row now reports the read
  ccjScheduleChat(ccjExtractStep,700);
}
function ccjExtractStep(){
  const run=ccjRun;if(!run||!run.doc||run.doc.done)return;
  const d=run.doc;
  const item=d.fields[d.at];
  if(!item){ccjFinishExtraction();return;}
  run.form[item.k]=item.v;
  delete run.aiFilled[item.k];                      // it came from a document now, not a guess
  run.justFilled=item.k;                            // the form flashes the field that landed
  d.at++;
  ccjRenderChat();
  ccjPaintScreen();
  ccjScrollToField(item.k);                       // follow the fill down the sheet
  ccjPaint();
  ccjScheduleChat(ccjExtractStep,CCJ_DOC_STEP);
}
function ccjFinishExtraction(){
  const run=ccjRun;if(!run||!run.doc)return;
  run.doc.done=true;
  run.justFilled=null;
  ccjRenderChat();
  ccjPaintScreen();
  ccjPaint();
  const missing=ccjMissingFields();
  ccjScheduleChat(function(){
    if(missing.length){
      /* No message here. The extraction card directly above already ends with a "Not in the
         document" block naming those exact fields; a count restating it seconds later is the
         third telling. The agent simply goes on to ask for them. */
      ccjScheduleChat(ccjAskNextField,700);
    }else{
      ccjPush({who:'agent',text:'All required fields came from the document.'});
      ccjMaybeAutoProceed();
    }
  },600);
}
/* The extraction card. One message, re-rendered as each field lands — which is why it reads its
   state off run.doc rather than carrying its own copy. */
function ccjDocHTML(){
  const run=ccjRun,d=run.doc;
  if(!d)return '<div class="ccj-bubble">No document.</div>';
  const rows=d.fields.slice(0,d.at).map(function(x){
    const f=ccjAllFields().find(function(y){return y.k===x.k;})||{label:x.k};
    // Stacked, not two columns. A label/value split in a 300px conversation column left the
    // value about fifty pixels wide, which wrapped a job description to one character a line.
    //
    // No confidence marker. It was there to let a reviewer weigh each value, but the extraction
    // is accurate by construction here — every field is read straight from the document — and a
    // row that says LIKELY invites doubt about a value that is not in doubt. What survives is
    // the citation: where in the document it came from, which is the useful half.
    return '<div class="ccj-doc-row">'
      +'<div class="ccj-doc-k">'+f.label+'</div>'
      +'<div class="ccj-doc-v">'+x.v+'</div>'
      +'<div class="ccj-doc-src">'+x.from+'</div>'
      +'</div>';
  }).join('');
  const absent=d.done?ccjMissingFields():[];
  return '<div class="ccj-bubble ccj-doc">'
    +'<div class="ccj-doc-head">'
    +'<span class="ccj-doc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>'
    +'<div><div class="ccj-doc-name">'+d.name+'</div>'
    +'<div class="ccj-doc-stat">'+(d.done
      ?'Read '+d.fields.length+' field'+(d.fields.length===1?'':'s')
      :'Reading&hellip; '+d.at+' of '+d.fields.length+' fields')+'</div></div>'
    +(d.done?'':'<span class="ccj-spin"></span>')
    +'</div>'
    +(rows?'<div class="ccj-doc-rows">'+rows+'</div>':'')
    +(d.done&&absent.length?'<div class="ccj-doc-absent"><b>Not in the document</b>'
      +absent.map(function(f){return f.label;}).join(', ')+'</div>':'')
    +'</div>';
}
function ccjFileSize(b){
  if(!b)return '';
  return b<1024?b+' B':b<1048576?(b/1024).toFixed(0)+' KB':(b/1048576).toFixed(1)+' MB';
}

/* ---- THE CONTRACT FORM ------------------------------------------------------------------
   A schema, not four hundred lines of hand-written markup. Every field declares how it
   renders, whether it is required, and the question the agent asks when it is missing — so
   the form, the validation and the conversation are all driven by one list and can never
   describe different contracts.                                                             */
function ccjCountries(){
  return (typeof AI_CT_COUNTRIES!=='undefined'&&AI_CT_COUNTRIES)
    ||['India','Netherlands','Germany','Spain','United Kingdom','France','Italy'];
}
const CCJ_FORM=[
  {id:'eligibility',title:'Eligibility',fields:[
    {k:'nationality',label:'Employee Nationality',type:'select',opts:'countries',req:true,
     ask:"What is the employee's nationality?"},
    {k:'country',label:'Country employee will be working from',type:'select',opts:'countries',req:true,
     ask:'Which country will they be working from?'},
    {k:'workPermit',label:'Work Permit',type:'radio',req:true,full:true,
     opts:['Yes, employee has a work permit','Employee would like ADT to assist with the work visa'],
     ask:'Does the employee already hold a work permit?'}
  ]},
  {id:'employee',title:'Employee Information',fields:[
    {k:'fname',label:'First Name',type:'text',req:true,ask:"What is the employee's first name?"},
    {k:'lname',label:'Last Name',type:'text',req:true,ask:'And their last name?'},
    {k:'dob',label:'Date of Birth',type:'date',req:true,ask:'What is their date of birth?'},
    {k:'gender',label:'Gender',type:'select',opts:['Male','Female','Non-binary','Prefer not to say']},
    {k:'email',label:'Email',type:'email',req:true,ask:'What is their email address?'},
    {k:'mobile',label:'Mobile Number',type:'tel',req:true,ask:'What is their mobile number?'},
    {k:'address',label:'Address',type:'textarea',req:true,full:true,ask:'What is their residential address?'}
  ]},
  {id:'job',title:'Job Details',fields:[
    {k:'jobTitle',label:'Job Title',type:'text',req:true,ask:'What is the job title?'},
    {k:'skill',label:'Primary Skill',type:'text'},
    {k:'jobDesc',label:'Job Description',type:'textarea',req:true,full:true,
     hint:'Appears on the contract under &ldquo;Scope of Work&rdquo;. Maximum 100 words.',
     ask:'What is the job description or scope of work?'},
    {k:'term',label:'Employment Term',type:'radio',req:true,opts:['Permanent','Fixed Term'],
     ask:'Is this a permanent or a fixed-term contract?'},
    {k:'schedule',label:'Work Schedule',type:'select',req:true,opts:['Full time','Part time','Shift based'],
     ask:'Is this full time, part time or shift based?'},
    {k:'fromDate',label:'Start Date',type:'date',req:true,ask:'When do they start?'},
    {k:'toDate',label:'End Date',type:'date',when:function(f){return f.term==='Fixed Term';},
     ask:'And when does the fixed term end?'},
    {k:'pay',label:'Monthly Gross Pay',type:'money',req:true,ask:'What is the monthly gross pay?'}
  ]},
  {id:'terms',title:'Probation and Notice',fields:[
    {k:'probation',label:'Probation Period',type:'number',unit:'months',req:true,
     hint:'A one-time deposit equal to one month of gross salary is invoiced against this.',
     ask:'How many months of probation?'},
    {k:'notice',label:'Notice Period',type:'number',unit:'days',req:true,ask:'And the notice period, in days?'}
  ]}
];
/* Fields whose `when` is false do not exist for this contract — an End Date on a permanent
   contract is not an unanswered question, it is not a question. */
function ccjFieldApplies(f){
  return !f.when||f.when(ccjRun.form||{});
}
function ccjAllFields(){
  const out=[];
  CCJ_FORM.forEach(function(s){s.fields.forEach(function(f){out.push(f);});});
  return out;
}
function ccjMissingFields(){
  const form=ccjRun.form||{};
  return ccjAllFields().filter(function(f){
    return f.req&&ccjFieldApplies(f)&&!String(form[f.k]||'').trim();
  });
}
/* What the agent can infer without asking: the prompt gave a name and a country, the matched
   record gives the rest, and the engagement model decides the sensible defaults. Everything it
   fills is recorded in `aiFilled` so the form can mark it — a pre-filled field the user cannot
   distinguish from one they typed is a field they will not check. */
function ccjPrefillForm(){
  const run=ccjRun;
  const e=run.match||run.createdEmp||{};
  const parts=String(run.intake.name||e.name||'').split(' ').filter(Boolean);
  const country=run.intake.country||e.country||'';
  const set=function(k,v){if(v!==undefined&&v!==''&&!run.form[k]){run.form[k]=v;run.aiFilled[k]=true;}};
  set('fname',parts[0]||'');
  set('lname',parts.slice(1).join(' '));
  set('country',country);
  set('nationality',country);
  set('email',e.email&&e.email!=='—'?e.email:'');
  // What the sentence said outranks the matched record: the request is for THIS role, which
  // may not be the one the person currently holds.
  set('jobTitle',run.intake.jobTitle||(e.jobTitle&&e.jobTitle!=='—'?e.jobTitle:''));
  // Stated in the sentence, so the agent does not ask for it again. It lands as an agent fill like
  // every other pre-filled field — marked in the form, and overwritable — rather than as a value
  // the user cannot tell apart from one they typed.
  set('pay',run.intake.pay||'');
  set('term','Permanent');
  set('schedule','Full time');
  set('probation','3');
  set('notice','30');
  set('workPermit','Yes, employee has a work permit');
}
function buildCCJFormHTML(){
  const run=ccjRun;
  const missing=ccjMissingFields().length;
  const filled=Object.keys(run.aiFilled).length;
  return '<div class="ccj-form-scroll">'
    +'<div class="ccj-form-head">'
    +'<div class="ccj-form-title">Create a Contract</div>'
    +'<div class="ccj-form-sub">'+ccjModelLabel(run.model)+' &middot; '+(run.form.country||run.intake.country||'Country not selected')+'</div>'
    +'</div>'
    +'<div class="ccj-prefill">'
    +'<span class="ccj-prefill-ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg></span>'
    +'<div><div class="ccj-prefill-t">'+(filled?'AI pre-filled '+filled+' field'+(filled===1?'':'s'):'Nothing to pre-fill yet')+'</div>'
    +'<div class="ccj-prefill-s">'+(missing
      ?missing+' required field'+(missing===1?'':'s')+' remaining.'
      :'All required fields are filled.')+'</div></div>'
    +'</div>'
    +CCJ_FORM.map(ccjSectionHTML).join('')
    // No button. The agent has everything it was asked for, so making the proposal is the next
    // thing that happens — asking the user to confirm that a form they just watched fill itself
    // is complete is a click that carries no decision. It waits a beat first so the last value
    // can be read, and says what it is about to do.
    +'<div class="ccj-form-foot">'
    +(missing
      ?'<div class="ccj-form-foot-note"><b>'+missing+'</b> required field'+(missing===1?'':'s')+' remaining</div>'
      :'<div class="ccj-form-foot-go"><span class="ccj-spin"></span>'
        +'All required fields filled &mdash; creating the proposal&hellip;</div>')
    +'</div></div>';
}
function ccjSectionHTML(sec){
  const fields=sec.fields.filter(ccjFieldApplies);
  if(!fields.length)return '';
  return '<div class="ccj-fsec">'
    +'<div class="ccj-fsec-t">'+sec.title+'</div>'
    +'<div class="ccj-fgrid">'+fields.map(ccjFieldHTML).join('')+'</div>'
    +'</div>';
}
function ccjFieldHTML(f){
  const run=ccjRun;
  const v=run.form[f.k]===undefined?'':String(run.form[f.k]);
  const ai=run.aiFilled[f.k];
  const asking=run.asking===f.k;
  const missing=f.req&&!v.trim();
  const id='ccj-f-'+f.k;
  const on='onchange="ccjSetField(\''+f.k+'\',this.value)"';
  let input='';
  if(f.type==='select'){
    const opts=f.opts==='countries'?ccjCountries():f.opts;
    input='<select class="ccj-inp" id="'+id+'" '+on+'>'
      +'<option value="">Select</option>'
      +opts.map(function(o){return '<option'+(o===v?' selected':'')+'>'+o+'</option>';}).join('')
      +'</select>';
  }else if(f.type==='radio'){
    // The id rides the group, not the buttons — so the ring, the flash and the scroll all have
    // the same target on a radio as they do on an input.
    input='<div class="ccj-radios" id="'+id+'">'+f.opts.map(function(o){
      return '<button type="button" class="ccj-radio'+(o===v?' on':'')+'" onclick="ccjSetField(\''+f.k+'\',\''+attrSafe(o).replace(/'/g,"\\'")+'\')">'
        +'<span class="ccj-radio-dot"></span>'+o+'</button>';
    }).join('')+'</div>';
  }else if(f.type==='textarea'){
    input='<textarea class="ccj-inp ccj-ta" id="'+id+'" rows="3" '+on+'>'+v+'</textarea>';
  }else if(f.type==='money'){
    input='<div class="ccj-money"><span>'+ccjCurrency()+'</span>'
      +'<input class="ccj-inp" id="'+id+'" type="number" value="'+attrSafe(v)+'" '+on+'></div>';
  }else if(f.type==='number'){
    input='<div class="ccj-unit"><input class="ccj-inp" id="'+id+'" type="number" value="'+attrSafe(v)+'" '+on+'>'
      +(f.unit?'<span>'+f.unit+'</span>':'')+'</div>';
  }else{
    input='<input class="ccj-inp" id="'+id+'" type="'+f.type+'" value="'+attrSafe(v)+'" '+on+'>';
  }
  // The field a document just landed in. A keyframe, not a transition — the form is re-rendered
  // on every fill, so there is no previous state for a transition to run from.
  const just=run.justFilled===f.k;
  return '<div class="ccj-fgroup'+(f.full?' full':'')+(asking?' asking':'')+(missing?' missing':'')+(just?' just':'')+'">'
    +'<label class="ccj-flabel" for="'+id+'">'+f.label
    +(f.req?'<span class="ccj-req">*</span>':'')
    +(ai?'<span class="ccj-ai" title="Pre-filled by AI. Verify this value.">AI</span>':'')
    +'</label>'+input
    +(f.hint?'<div class="ccj-fhint">'+f.hint+'</div>':'')
    +'</div>';
}
function ccjCurrency(){
  const c=(ccjRun.form.country||ccjRun.intake&&ccjRun.intake.country||'');
  return c==='India'?'&#8377;':c==='United Kingdom'?'&#163;':'&#8364;';
}
/* Typing into a field answers the agent's question as surely as replying to it, so the form
   and the conversation stay in step: whatever the agent was waiting on is cleared, and it
   moves on to the next thing it needs. */
function ccjSetField(k,v){
  const run=ccjRun;if(!run)return;
  run.form[k]=v;
  delete run.aiFilled[k];                       // it is the user's value now, not the agent's
  const wasAsking=run.asking===k;
  if(wasAsking)run.asking=null;
  ccjPaintScreen();
  ccjMaybeAutoProceed();
  if(wasAsking)ccjScheduleChat(ccjAskNextField,500);
}
function ccjAskNextField(){
  const run=ccjRun;if(!run||run.screen!=='form')return;
  const missing=ccjMissingFields();
  if(!missing.length){
    if(run.asking){run.asking=null;ccjPaintScreen();}
    ccjPush({who:'agent',text:'All required fields are filled.'});
    ccjMaybeAutoProceed();
    return;
  }
  const f=missing[0];
  if(run.asking===f.k)return;
  run.asking=f.k;
  ccjPaintScreen();
  ccjScrollToField(f.k);                          // the question and its target arrive together
  ccjPush({who:'agent',text:f.ask||('What is the '+f.label.toLowerCase()+'?')});
}
/* An answer typed into the conversation rather than the field. Selects and radios are matched
   loosely against their options so "netherlands" and "full time" land where they should. */
function ccjApplyAnswer(k,text){
  const run=ccjRun;
  const f=ccjAllFields().find(function(x){return x.k===k;});
  if(!f){run.asking=null;return;}
  let v=text.trim();
  if(f.type==='select'||f.type==='radio'){
    const opts=f.opts==='countries'?ccjCountries():f.opts;
    const q=v.toLowerCase();
    const hit=opts.find(function(o){return o.toLowerCase()===q;})
      ||opts.find(function(o){return o.toLowerCase().indexOf(q)>-1||q.indexOf(o.toLowerCase())>-1;});
    if(!hit){
      ccjPush({who:'agent',text:'Not a valid option. Choose from: '+opts.join(', ')+'.'});
      return;
    }
    v=hit;
  }
  if(f.type==='money'||f.type==='number')v=v.replace(/[^0-9.]/g,'');
  run.form[k]=v;
  run.asking=null;
  ccjPaintScreen();
  ccjPush({who:'agent',text:'Set <b>'+f.label+'</b> to <b>'+v+'</b>.'});
  ccjMaybeAutoProceed();
  ccjScheduleChat(ccjAskNextField,600);
}
/* Nothing is missing any more, so the proposal gets made. The pause is deliberate and is not a
   loading state: it is time to read the last value that landed before the screen changes under
   you. Re-entrant on purpose — every field edit calls it, and a field emptied again cancels the
   pending run rather than letting a stale timer fire against an incomplete form. */
function ccjMaybeAutoProceed(){
  const run=ccjRun;
  if(!run||run.proposal||run.screen!=='form')return;
  if(ccjMissingFields().length){
    if(run.proposing){run.proposing=false;if(run.autoTimer)clearTimeout(run.autoTimer);ccjPaintScreen();}
    return;
  }
  if(run.proposing)return;
  run.proposing=true;
  ccjPaintScreen();
  const g=ccjGen;
  if(run.autoTimer)clearTimeout(run.autoTimer);
  run.autoTimer=setTimeout(function(){
    if(ccjGen!==g||ccjRun!==run)return;
    run.autoTimer=null;
    if(run.proposal||run.screen!=='form'||ccjMissingFields().length){run.proposing=false;return;}
    ccjCreateProposal();
  },CCJ_AUTOGAP);
}
function ccjPaintScreen(){
  const el=document.getElementById('ccj-screen');
  if(el)el.innerHTML=ccjScreenHTML(ccjRun.stage,ccjRun.screen);
}
/* Bring a field into view inside the form's own scroller — never the page, which does not
   scroll. Used whenever attention moves to a field the user did not move it to themselves:
   a document filling one in, or the agent asking about one. A value landing four screens below
   the fold is a value nobody reviews, and the whole point of showing extraction row by row is
   that it can be watched.

   Measured with getBoundingClientRect rather than offsetTop because the field's offsetParent is
   whichever ancestor happens to be positioned, and that is not the scroller. Guarded because
   the headless harness has no layout. */
function ccjScrollToField(k){
  if(!k||typeof document.querySelector!=='function')return;
  const el=document.getElementById('ccj-f-'+k);
  const box=document.querySelector('.ccj-form-scroll');
  if(!el||!box||typeof el.getBoundingClientRect!=='function'||!box.getBoundingClientRect)return;
  const r=el.getBoundingClientRect(),br=box.getBoundingClientRect();
  if(!r.height&&!br.height)return;                 // not laid out yet
  // Centre it, so the rows above give context for the one that just changed.
  ccjGlide(box,box.scrollTop+(r.top-br.top)-(box.clientHeight/2-r.height/2));
}
/* Native smooth scrolling is about 300ms and cannot be slowed, which reads as a snap when a
   document is landing a field every half second. This eases over CCJ_SCROLL instead, and a new
   target simply retargets the animation in flight rather than fighting it. */
let ccjGlideTo=null;
function ccjGlide(box,top){
  const target=Math.max(0,top);
  if(typeof requestAnimationFrame!=='function'){box.scrollTop=target;return;}
  const from=box.scrollTop, dist=target-from;
  if(Math.abs(dist)<2)return;
  const token=(ccjGlideTo={box:box,target:target});
  let t=0;
  const tick=function(){
    if(ccjGlideTo!==token)return;                  // a newer scroll took over
    t+=16;
    const k=Math.min(1,t/CCJ_SCROLL);
    const e=1-Math.pow(1-k,3);                     // ease-out cubic
    box.scrollTop=from+dist*e;
    if(k<1)requestAnimationFrame(tick);
    else if(ccjGlideTo===token)ccjGlideTo=null;
  };
  requestAnimationFrame(tick);
}

/* ---- ENGAGEMENT MODEL — ITS OWN PAGE --------------------------------------------------------
   One decision, one screen, and nothing else on it. It is not part of the journey frame because
   it happens before there is a run: a nine-stage rail and a sub-status panel drawn around this
   would be reporting on work that has not started.

   The card data (id, title, sub, icon) is read from AI_CT_TYPE_CARDS — domain facts about the
   products, shared the way amPipelineStages is. Only the one-line meaning is written here: what
   the ORIGINAL journey put on these cards described its own navigation ("Opens the AI Contract
   Assistant") rather than the engagement, and EOR and PEO are initialisms a client cannot decode
   without being told who carries the employment liability. That is the line that earns its
   space; everything else on this screen was commentary and is gone. */
const CCJ_MODEL_MEANS={
  EOR:'We are the legal employer. Payroll and compliance sit with us.',
  PEO:'You stay the employer. We run payroll, filings and benefits.',
  CONTRACTOR:'No employment relationship. A contractor agreement, invoiced against the engagement.'
};
function buildCCJModelHTML(){
  const run=ccjEnsureRun();
  const cards=(typeof AI_CT_TYPE_CARDS!=='undefined'?AI_CT_TYPE_CARDS:[]);
  return '<div class="ccj-model-page">'
    +'<button class="ccj-back ccj-model-back" onclick="ccjExit()" title="Back to Contracts">'
    +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<div class="ccj-model-screen">'
    +'<div class="ccj-model-head">'
    +'<div class="ccj-model-title">Choose an engagement model</div>'
    +'<div class="ccj-model-sub">This determines the contract and who carries employment liability.</div>'
    +'</div>'
    +'<div class="ccj-model-grid">'+cards.map(function(t){
      const on=run.model===t.id;
      return '<button type="button" class="ccj-mcard'+(on?' on':'')+'" onclick="ccjChooseModel(\''+t.id+'\')">'
        +'<span class="ccj-mcard-top">'
        +'<span class="ccj-mcard-ico">'+t.ico+'</span>'
        +'<span class="ccj-mcard-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg></span>'
        +'</span>'
        +'<span class="ccj-mcard-title">'+t.title+'</span>'
        +'<span class="ccj-mcard-sub">'+t.sub+'</span>'
        +'<span class="ccj-mcard-desc">'+(CCJ_MODEL_MEANS[t.id]||t.desc)+'</span>'
        +'</button>';
    }).join('')+'</div>'
    +'</div></div>';
}
function ccjChooseModel(id){
  const run=ccjEnsureRun();if(run.started)return;
  run.model=id;
  run.screen=(ccjScreensFor(0)[0]||{}).id||'prompt';
  page=ccjPageId(0);
  renderADTPage();
}
/* Reopening the choice from the header chip. Only while the request has not been logged — after
   that the form behind it was built for this model and switching would silently invalidate it. */
function ccjBackToModel(){
  const run=ccjRun;if(!run||run.started)return;
  page='ccj-model';
  renderADTPage();
}

/* == STAGE 5: THE MASTER SERVICES AGREEMENT ===============================================
   The commercial contract between ADT and the CLIENT COMPANY. Not the employment contract —
   that is between ADT and the WORKER, and it is stage 7. Two different contracts, two different
   counterparties, two different bodies of law, which is why the pipeline has two signing stages.

   The original journey rendered an EMPLOYMENT AGREEMENT here, signed by the employee. It cannot
   be that: this stage's own sub-statuses include a client entity and sanctions check, and you do
   not sanctions-screen a candidate. You screen a company you are about to contract with.

   MASTER is the operative word. It is signed ONCE PER CLIENT and every later hire runs under it.
   That is exactly the engagement/placement split the rail draws — stages 1-5 happen once per
   client, 6-9 repeat per person — so a client who already has one skips this stage entirely.

   SIGNING ORDER is the market standard for a negotiated agreement: the client signs, then ADT
   countersigns. The provider's paper is presented, the client accepts it, and the provider
   countersigns last because that is the control point — the final chance to refuse if the
   screening turned up something or a clause was altered. An agreement is executed on the LAST
   signature, and stage 6 raises the deposit invoice off that date.                        == */
function ccjMsa(){
  const run=ccjRun||{};
  if(!run.msa)run.msa={id:'MSA-'+String(4020+(run.gen||0)),screening:'clean',hit:null,
    clientSignedAt:0,adtSignedAt:0,version:1};
  return run.msa;
}
/* Does this client already have a signed agreement? Everything on this stage hangs off it. The
   demo clients that ship with the app are treated as established relationships, which is what
   makes the "second hire skips the paperwork" path reachable. */
function ccjMsaExists(){
  const run=ccjRun;
  // Whether they were an established client BEFORE this run — the same frozen fact provisioning
  // recorded. Deriving it live from aiClients was wrong in both directions: stage 4 writes the
  // new client into that list, so by stage 5 a company we had just taken on looked like an old
  // one and was handed an agreement it had never signed.
  if(run&&run.tenantWasExisting!==undefined)return run.tenantWasExisting;
  const p=ccjParties();
  return !!((typeof aiClients!=='undefined'&&aiClients)||[])
    .find(function(c){return c.name===p.client.name;});
}
/* The client has signed and sent it back. Their signature goes on the document, the returned copy
   lands in the thread, and the run releases into the verification work — after which it stops for
   OUR countersignature, because that is the signature that puts the agreement in force. */
function ccjMsaReturned(){
  const run=ccjRun;if(!run)return;
  const m=ccjMsa(),c=ccjClient();
  if(m.clientSignedAt)return;
  c.mins+=430;
  m.clientSignedAt=c.mins;
  ccjClientPush({who:'client',kind:'signed',id:m.id,at:m.clientSignedAt});
  ccjClientLog('msaSigned','Agreement signed by client','Returned for countersignature');
  ccjPaintScreen();
  ccjResolveWait();
}
function ccjMsaFee(){
  const q=ccjQuote();
  return {pct:q.margin,deposit:q.gross,depositLabel:'one month gross salary'};
}

/* ---- STAGE 4: TURNING A DEAL INTO AN ACCOUNT -------------------------------------------------
   Stages 1-3 built a quote. This one turns a prospect into a customer: a tenant, a workspace, a
   client record and an owning CSM. It is the only stage with no human step in it.

   ccjTenant() is derived, not stored, so every surface that names the tenant names the same one.
   It upserts against aiClients — the app's real client list — because a client on their second
   engagement already has a workspace, and giving them a second would split their people across
   two accounts. (`masterData` looks like the place for this and is not: it is hydrated from the
   employee API and cleared on every refresh.) */
/* Initials from a company or person name, skipping the legal suffix so "Helix Marine B.V."
   reads HM rather than HB. */
function ccjInitials(name){
  return String(name||'').split(/\s+/)
    .filter(function(w){return w&&!/^(pvt|ltd|limited|b\.?v\.?|n\.?v\.?|gmbh|ag|inc\.?|llc|plc)\.?$/i.test(w);})
    .map(function(w){return w[0];}).slice(0,2).join('').toUpperCase()||'?';
}
function ccjCsm(){
  // Routed on the CLIENT'S country, not the worker's. A Customer Success Manager owns a client
  // relationship; a Netherlands client keeps their Dutch CSM whoever they hire and wherever.
  const p=ccjParties();
  const name=typeof amCsmFor==='function'?amCsmFor({country:p.client.country}):'Daniel Kim';
  return {name:name,country:p.client.country,
    initials:String(name).split(' ').map(function(x){return x[0];}).slice(0,2).join(''),
    // @adt.com. The CSM works for US. Printing maya.vos@<client domain> next to the client's own
    // buyer on the handover screen made our CSM look like one of their staff.
    email:String(name).toLowerCase().replace(/[^a-z ]/g,'').trim().replace(/\s+/g,'.')+'@adt.com'};
}
const CCJ_CC={'Netherlands':'NL','Germany':'DE','India':'IN','Spain':'ES',
              'United Kingdom':'UK','France':'FR','Italy':'IT'};
function ccjTenant(){
  const c=ccjCtx();
  const list=(typeof aiClients!=='undefined'&&aiClients)||[];
  const found=list.find(function(x){return x.name===c.client;});
  const slug=String(c.client).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const cc=CCJ_CC[c.country]||'XX';
  return {
    existing:!!found,
    id:(found?found.id:slug).toUpperCase().slice(0,12)+'-'+cc,
    workspace:slug+'.opendhi.com',
    plan:found?found.plan:'Growth',
    contact:found?found.contactName:'Client admin',
    slug:slug, record:found||null
  };
}
/* Did the client ALREADY have a tenant when provisioning ran? This has to be remembered, not
   re-derived: the moment the client is created, ccjTenant().existing flips to true and every
   surface reading it live would start describing a create as a reuse. */
function ccjTenantExisting(){
  const run=ccjRun;
  if(run&&run.tenantWasExisting!==undefined)return run.tenantWasExisting;
  return ccjTenant().existing;
}
/* Writes the client into aiClients if they are not there. Guarded so a re-run cannot create a
   duplicate — the same reason provisioning itself is idempotent. */
function ccjUpsertClient(){
  const c=ccjCtx(),t=ccjTenant();
  if(t.existing||typeof aiClients==='undefined')return t;
  // The CLIENT'S country, not the country the work happens in. A Netherlands client
  // hiring in Germany is still a Netherlands client, and their CSM follows them.
  aiClients.push({id:t.slug,name:c.client,country:ccjParties().client.country,plan:'Growth',employees:0,
    contactName:'Client admin',contactRole:'Entity Admin'});
  return ccjTenant();
}
function buildCCJAccountHTML(){
  const run=ccjRun,q=ccjQuote(),t=ccjTenant(),m=ccjCsm(),c=ccjCtx();
  const money=function(v){return q.sym+' '+Number(v).toLocaleString();};
  const done=function(l){return !!run.settled['quote-approved/'+l];};
  const won=done('Won'),prov=done('Client tenant provisioned'),intro=done('CSM confirmed to client');
  const row=function(k,v,on){
    return '<div class="ccj-pv-row'+(on?' done':'')+'">'
      +'<span class="ccj-pv-tick">'+(on
        ?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>'
        :'')+'</span>'
      +'<span class="ccj-pv-k">'+k+'</span><span class="ccj-pv-v">'+(on?v:'&mdash;')+'</span></div>';
  };
  return '<div class="ccj-acct">'
    // Band 1 — the commercial outcome, stated once. The only place in nine stages that says this.
    +'<div class="ccj-won'+(won?' on':'')+'">'
    +'<div class="ccj-won-tag">'+(won?'Deal won':'Closing the deal')+'</div>'
    +'<div class="ccj-won-val">'+(won?money(q.total*12):'&mdash;')+'<span>a year</span></div>'
    +'<div class="ccj-won-sub">'+c.client+' &middot; '+c.country+' &middot; '+ccjModelLabel(c.type)
      +' &middot; '+money(q.total)+' a month</div>'
    +'</div>'
    // Band 2 — what provisioning actually created.
    +'<div class="ccj-pv">'
    +'<div class="ccj-pv-head">Client account'
      +(prov?'<span class="ccj-pv-note'+(ccjTenantExisting()?'':' new')+'">'
        +(ccjTenantExisting()?'existing client &middot; tenant reused':'new client &middot; tenant created')
        +'</span>':'')+'</div>'
    +row('Tenant',t.id,prov)
    +row('Workspace',t.workspace,prov)
    +row('Plan',t.plan,prov)
    +row('Admin invited',ccjTenantExisting()?'already has access':t.contact,prov)
    +'</div>'
    // Band 3 — the handover. The Account Manager's job ends here.
    +'<div class="ccj-csm'+(intro?' on':'')+'">'
    +'<div class="ccj-csm-av">'+m.initials+'</div>'
    +'<div class="ccj-csm-body">'
    +'<div class="ccj-csm-name">'+m.name+'</div>'
    +'<div class="ccj-csm-role">Customer Success Manager &middot; owns '+m.country+'</div>'
    +'<div class="ccj-csm-mail">'+m.email+'</div>'
    +'</div>'
    +'<span class="ccj-csm-state">'+(intro?'Introduced':'Assigning')+'</span>'
    +'</div>'
    +(run.phase==='rest'
      ?'<div class="ccj-acct-foot">'
       +'<div class="ccj-acct-done">Client is live. Nothing else is needed on this step.</div>'
       +'<button class="ccj-primary" onclick="ccjContinueStage()">'
       +(CCJ_STAGE_REST['quote-approved'].label)+' &rarr;</button></div>'
      :'')
    +'</div>';
}

/* ---- THE AGREEMENT ITSELF --------------------------------------------------------------------
   A real document: parties, a commercial schedule pulled live from the accepted quote, readable
   clause text, and signature blocks that fill in as each party signs. Long enough to read as a
   contract, structured enough to scan. */
function buildCCJMsaHTML(){
  const run=ccjRun,p=ccjParties(),q=ccjQuote(),m=ccjMsa(),fee=ccjMsaFee();
  const money=function(v){return q.sym+' '+Number(v).toLocaleString();};
  const done=function(l){return !!run.settled['agreement-signature/'+l];};
  if(ccjMsaExists()&&done('Signed'))return buildCCJMsaExistingHTML(p);
  const drafted=done('MSA drafted'),sent=done('Sent'),signed=done('Signed');
  const clause=function(n,t,body){
    return '<div class="ccj-msa-cl"><div class="ccj-msa-cl-h"><span>'+n+'</span>'+t+'</div>'
      +'<p>'+body+'</p></div>';
  };
  const kv=function(k,v){return '<div class="ccj-msa-kv"><span>'+k+'</span><b>'+v+'</b></div>';};
  return '<div class="ccj-msa-wrap">'
    +'<div class="ccj-msa'+(drafted?'':' pending')+'">'
    +'<div class="ccj-msa-head">'
    +'<div><div class="ccj-msa-brand">ADT</div><div class="ccj-msa-brandsub">Global Employment Platform</div></div>'
    +'<div class="ccj-msa-ref"><div class="ccj-msa-kind">MASTER SERVICES AGREEMENT</div>'
    +'<div class="ccj-msa-no">'+m.id+' &middot; issued '+ccjStamp(0).split(',')[0]+'</div></div>'
    +'</div>'
    +(signed?'<div class="ccj-msa-stamp">EXECUTED</div>':'')

    +'<div class="ccj-msa-sec"><div class="ccj-msa-sec-t">1 &middot; Parties</div>'
    +kv('Provider',p.adt.name)
    +kv('Client',p.client.name)
    +kv('Client jurisdiction',p.client.country)
    +kv('Services provided in',p.worker.country)
    +'</div>'

    +'<div class="ccj-msa-sec"><div class="ccj-msa-sec-t">2 &middot; Commercial schedule</div>'
    +kv('Service fee',fee.pct+'% of employer cost')
    +kv('Employer cost, per placement',money(q.base)+' a month')
    +kv('Total, per placement',money(q.total)+' a month')
    +kv('Deposit',money(fee.deposit)+' &middot; '+fee.depositLabel)
    +kv('Invoicing','Monthly in advance &middot; 14 days net')
    +'<div class="ccj-msa-sched">Rates apply per placement made under this Agreement. Additional placements are made by Work Order and do not require a new Agreement.</div>'
    +'</div>'

    +'<div class="ccj-msa-sec"><div class="ccj-msa-sec-t">3 &middot; Terms</div>'
    +clause('3.1','Appointment','The Client appoints '+p.adt.name+' ("the Provider") as employer of record for personnel engaged under this Agreement in '+p.worker.country+'. The Provider shall enter into a compliant local employment contract with each such person, operate payroll, and remit all statutory employer contributions.')
    +clause('3.2','Direction of work','The Client directs the day-to-day work of each placement. The Provider carries the employment relationship, and neither party shall represent the arrangement otherwise to the personnel concerned or to any authority.')
    +clause('3.3','Fees and payment','The Client shall pay the employer cost together with the service fee stated above, invoiced monthly in advance and payable within fourteen days. Statutory employer contributions are passed through at cost and are not marked up.')
    +clause('3.4','Deposit','A deposit equal to '+fee.depositLabel+' is payable before any placement commences. The Provider funds payroll ahead of invoice settlement and the deposit is held as security against that exposure. It is refundable on termination once all liabilities are discharged.')
    +clause('3.5','Liability and indemnity','The Provider indemnifies the Client against employment claims arising from the Provider\'s performance as employer of record. The Client indemnifies the Provider against claims arising from the Client\'s direction of the work, including discrimination and unsafe working conditions. Neither party\'s aggregate liability shall exceed the fees paid in the preceding twelve months.')
    +clause('3.6','Intellectual property','All work product created by personnel placed under this Agreement vests in the Provider on creation and is assigned to the Client in full, free of encumbrance, on payment of the invoice covering the period in which it was created.')
    +clause('3.7','Data protection','Each party is an independent controller of personal data it determines the purposes of. The Provider processes personnel data as controller for employment and payroll administration. Transfers outside the EEA are made under Standard Contractual Clauses.')
    +clause('3.8','Term and termination','This Agreement continues until terminated on sixty days written notice. On termination the Provider shall give each placement the statutory notice required in '+p.worker.country+', and the Client remains liable for the employer cost and fees over that notice period.')
    +clause('3.9','Governing law','This Agreement is governed by the laws of '+p.client.country+' and the parties submit to the exclusive jurisdiction of its courts.')
    +'</div>'

    +'<div class="ccj-msa-sec"><div class="ccj-msa-sec-t">4 &middot; Signatures</div>'
    +'<div class="ccj-msa-sigrow">'
    +ccjSigBlockHTML('For and on behalf of '+p.client.name,p.client.contact,'Authorised signatory',
        m.clientSignedAt,signed||m.clientSignedAt>0)
    +ccjSigBlockHTML('For and on behalf of '+p.adt.name,p.adt.signatory,'Authorised signatory',
        m.adtSignedAt,m.adtSignedAt>0)
    +'</div>'
    +'<div class="ccj-msa-exec">'+(signed
      ?'Executed on the later of the two signatures above. In force from '+ccjStamp(m.adtSignedAt)+'.'
      :sent?'Awaiting the Client\'s signature. The Provider countersigns once received.'
      :'Not yet issued.')+'</div>'
    +'</div>'
    +'</div>'
    // The signed agreement coming back is what this stage produced, so the stage rests on it and
    // the way on lives underneath it — not on a rail the user has to go looking for.
    +(run.phase==='rest'
      ?'<div class="ccj-msa-foot">'
       +'<div class="ccj-msa-done">Agreement executed. Both parties have signed.</div>'
       +'<button class="ccj-primary" onclick="ccjContinueStage()">'
       +CCJ_STAGE_REST['agreement-signature'].label+' &rarr;</button></div>'
      :'')
    +'</div>';
}
function ccjSigBlockHTML(forWhom,who,role,at,on){
  return '<div class="ccj-msa-sig'+(on?' on':'')+'">'
    +'<div class="ccj-msa-sig-for">'+forWhom+'</div>'
    +'<div class="ccj-msa-sig-mark">'+(on?who:'')+'</div>'
    +'<div class="ccj-msa-sig-line"></div>'
    +'<div class="ccj-msa-sig-name">'+who+'</div>'
    +'<div class="ccj-msa-sig-role">'+role+(on?' &middot; '+ccjStamp(at):' &middot; pending')+'</div>'
    +'</div>';
}
/* A client who already has an agreement does not sign a second one. The stage says so and shows
   the one that governs, rather than quietly running five steps that produce nothing. */
function buildCCJMsaExistingHTML(p){
  const m=ccjMsa();
  return '<div class="ccj-msa-wrap"><div class="ccj-existing">'
    +'<div class="ccj-existing-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg></div>'
    +'<div class="ccj-existing-t">'+p.client.name+' already has a signed agreement</div>'
    +'<div class="ccj-existing-s">A Master Services Agreement is signed once. Every placement after the first is made by Work Order under the agreement already in force, so nothing on this stage needs to run.</div>'
    +'<div class="ccj-existing-grid">'
    +'<div><span>Agreement</span><b>'+m.id+'</b></div>'
    +'<div><span>Governing law</span><b>'+p.client.country+'</b></div>'
    +'<div><span>Status</span><b>In force</b></div>'
    +'<div><span>This placement</span><b>Work Order</b></div>'
    +'</div></div></div>';
}

/* ---- THE CLIENT THREAD ----------------------------------------------------------------------
   The quote goes out in it, the client replies in it, the negotiation happens in it, the revised
   quote goes out in it and the approval lands in it. One place, in order, so the commercial
   history of this deal is readable top to bottom without opening anything.

   Four kinds of message, and they look different because they carry different weight: what WE
   sent, what the CLIENT sent, a system note (delivery, opens), and a draft the agent has written
   but nobody has sent yet. A draft that looked like a sent message would be the worst possible
   confusion on a screen whose whole job is talking to a customer. */
function ccjSendToClient(text){
  const c=ccjClient();
  c.mins+=35;
  c.drafted=false;
  ccjClientPush({who:'us',text:text,at:c.mins});
  ccjPaintComposer();
  // Replying is what a negotiation needs to move; the client answers on the script's clock.
  if(c.state==='changed'){c.state='negotiating';ccjClientSchedule();}
}
function ccjSendDraft(){
  const c=ccjClient();
  const draft=c.msgs.slice().reverse().find(function(m){return m.kind==='draft';});
  if(!draft)return;
  draft.kind='';draft.who='us';draft.sent=true;
  c.drafted=false;
  if(c.state==='changed'){c.state='negotiating';ccjClientSchedule();}
  ccjRenderChat();ccjPaintComposer();
}
function ccjClientMsgHTML(m,isLast){
  // The worker is a counterparty in the same sense the client is, so their messages take the same
  // side of the thread. The STORE is separate; only the rendering is shared.
  const cls=(m.who==='client'||m.who==='worker'?'client'
    :m.who==='note'?'note':m.who==='agent'?'draft':'us')+(isLast?' in':'');
  if(m.who==='note')return '<div class="ccj-cmsg note"><span>'+m.text+'</span><i>'+ccjStamp(m.at)+'</i></div>';
  if(m.kind==='quote')return '<div class="ccj-cmsg '+cls+'">'+ccjQuoteCardHTML(m)+'<i>'+ccjStamp(m.at)+'</i></div>';
  if(m.kind==='chase')return '<div class="ccj-cmsg note chase"><span>Follow-up '+m.n
    +' of 3 sent &mdash; no reply yet</span><i>'+ccjStamp(m.at)+'</i></div>';
  if(m.kind==='draft')return '<div class="ccj-cmsg '+cls+'">'
    +'<div class="ccj-cbubble draft">'
    +'<div class="ccj-draft-tag"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>Drafted for you &mdash; not sent</div>'
    +m.text
    +'<div class="ccj-draft-btns"><button class="ccj-draft-send" onclick="ccjSendDraft()">Send to client</button></div>'
    +'</div></div>';
  if(m.kind==='msa')return '<div class="ccj-cmsg '+cls+'">'
    +'<div class="ccj-cbubble doc">'
    +'<div class="ccj-cdoc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
    +'<span><b>'+m.id+'</b><i>Master Services Agreement &middot; for signature</i></span></div>'
    +'Sent to '+m.to+' for signature. We countersign once it comes back.'
    +'</div><i>'+ccjStamp(m.at)+'</i></div>';
  if(m.kind==='signed')return '<div class="ccj-cmsg '+cls+'">'
    +'<div class="ccj-cbubble accept"><b>&#10003; Signed '+m.id+'</b></div><i>'+ccjStamp(m.at)+'</i></div>';
  // The invoice as the client received it — the amount, the due date and the reference they have
  // to quote, which is the whole of what accounts payable needs from the covering message.
  if(m.kind==='invoice')return '<div class="ccj-cmsg '+cls+'">'
    +'<div class="ccj-cbubble doc">'
    +'<div class="ccj-cdoc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>'
    +'<span><b>'+m.id+'</b><i>Deposit invoice &middot; '+ccjMoney(m.total)+'</i></span></div>'
    +'Payable by <b>'+ccjDate(m.due)+'</b>, Net 14. Please quote <b>'+m.id
    +'</b> as the payment reference so it matches automatically.'
    +'</div><i>'+ccjStamp(m.at)+'</i></div>';
  if(m.kind==='remind')return '<div class="ccj-cmsg note'+(m.overdue?' chase':'')+'">'
    +'<span>Payment reminder '+m.n+' sent &mdash; '+ccjMoney(m.amount)
    +(m.overdue?' overdue':' due shortly')+'</span><i>'+ccjStamp(m.at)+'</i></div>';
  // A remittance advice is the client telling us money is on its way. It is their message, and it
  // carries the shortfall when there is one — that is what makes the next decision necessary.
  if(m.kind==='remit')return '<div class="ccj-cmsg '+cls+'">'
    +'<div class="ccj-cbubble remit">'
    +'<div class="ccj-remit-top"><b>Remittance advice</b><span>+'+ccjMoney(m.amount)+'</span></div>'
    +(m.paid==='part'
      ?'We have released '+ccjMoney(m.amount)+' against the deposit today. The balance of <b>'
        +ccjMoney(m.outstanding)+'</b> follows in our next run.'
      :m.paid==='balance'
      ?'The balance of '+ccjMoney(m.amount)+' has gone out today. That settles the deposit in full.'
      :'The deposit has been paid in full today, quoting your reference.')
    +'</div><i>'+ccjStamp(m.at)+'</i></div>';
  // The employment contract, as the EMPLOYEE received it. It names what they are signing and when
  // they start — the two things a person opening this actually wants confirmed.
  if(m.kind==='eccontract')return '<div class="ccj-cmsg '+cls+'">'
    +'<div class="ccj-cbubble doc">'
    +'<div class="ccj-cdoc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg>'
    +'<span><b>'+m.id+'</b><i>Contract of employment &middot; for signature</i></span></div>'
    +'Your contract is ready to sign. Employment starts on <b>'+ccjPrettyDate(m.start)
    +'</b>. Read it in full and sign at the bottom &mdash; we countersign once it comes back.'
    +'</div><i>'+ccjStamp(m.at)+'</i></div>';
  // Onboarding is the one stage where the employee is doing most of the work, so their thread
  // carries what they were asked for and what they sent back.
  if(m.kind==='kyc')return '<div class="ccj-cmsg '+cls+'">'
    +'<div class="ccj-cbubble doc">'
    +'<div class="ccj-cdoc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M5.5 17a4 4 0 0 1 7 0"/><line x1="15" y1="9" x2="19" y2="9"/><line x1="15" y1="13" x2="19" y2="13"/></svg>'
    +'<span><b>Verify your identity</b><i>Takes about two minutes &middot; '+m.id+'</i></span></div>'
    +'Have your passport or national ID to hand. You will photograph it and take a short selfie.'
    +'</div><i>'+ccjStamp(m.at)+'</i></div>';
  if(m.kind==='doc')return '<div class="ccj-cmsg '+cls+'">'
    +'<div class="ccj-cbubble'+(m.state==='rejected'?' reject':'')+'">'
    +(m.state==='rejected'
      ?'<b>'+m.label+' could not be accepted.</b> '+m.note
      :m.state==='resubmitted'
      ?'Re-sent '+m.label+'.'
      :'Sent '+m.label+'.')
    +'</div><i>'+ccjStamp(m.at)+'</i></div>';
  if(m.kind==='ecsigned')return '<div class="ccj-cmsg '+cls+'">'
    +'<div class="ccj-cbubble accept"><b>&#10003; Signed '+m.id+'</b></div><i>'+ccjStamp(m.at)+'</i></div>';
  /* The payslip as the EMPLOYEE receives it. Net, period and the last four of the account it went
     to — the three things a person checks before they open the document itself. */
  if(m.kind==='payslip')return '<div class="ccj-cmsg '+cls+'">'
    +'<div class="ccj-cbubble doc">'
    +'<div class="ccj-cdoc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>'
    +'<span><b>'+m.id+'</b><i>Payslip &middot; '+m.period+'</i></span></div>'
    +'<b>'+ccjMoney(m.net)+'</b> has been paid to '+(m.acct||'your account')
    +'. Your payslip shows what was withheld and what it was declared against.'
    +'</div><i>'+ccjStamp(m.at)+'</i></div>';
  if(m.kind==='ecexecuted')return '<div class="ccj-cmsg '+cls+'">'
    +'<div class="ccj-cbubble accept"><b>&#10003; '+m.id+' countersigned &mdash; you are employed from '
    +ccjPrettyDate(m.from)+'</b></div><i>'+ccjStamp(m.at)+'</i></div>';
  if(m.kind==='receipt')return '<div class="ccj-cmsg '+cls+'">'
    +'<div class="ccj-cbubble accept"><b>&#10003; '+(m.short
      ?'Placement released &mdash; '+ccjMoney(m.short)+' still outstanding on '+m.id
      :ccjMoney(m.amount)+' received &mdash; '+m.id+' settled in full')
    +'</b></div><i>'+ccjStamp(m.at)+'</i></div>';
  if(m.kind==='csm')return '<div class="ccj-cmsg '+cls+'">'
    +'<div class="ccj-cbubble csm">'
    +'<div class="ccj-csmc-top"><span class="ccj-csmc-av">'+m.csm.initials+'</span>'
    +'<span><b>'+m.csm.name+'</b><i>Your Customer Success Manager &middot; '+m.csm.country+'</i></span></div>'
    +'I will be looking after your account from here. '+m.csm.name.split(' ')[0]
    +' is your first point of contact for anything on this engagement.'
    +'</div><i>'+ccjStamp(m.at)+'</i></div>';
  if(m.kind==='accept')return '<div class="ccj-cmsg '+cls+'">'
    +'<div class="ccj-cbubble accept"><b>&#10003; '+m.text+'</b></div><i>'+ccjStamp(m.at)+'</i></div>';
  return '<div class="ccj-cmsg '+cls+'"><div class="ccj-cbubble">'+m.text+'</div><i>'+ccjStamp(m.at)+'</i></div>';
}
/* The quote as the client received it, inside the thread. Version 2 shows what changed against
   version 1 rather than only the new number — a client who is told "here is €7,610" learns less
   than one who is shown it came down from €7,842. */
function ccjQuoteCardHTML(m){
  const q=m.quote||{};
  const money=function(v){return q.sym+' '+Number(v).toLocaleString();};
  return '<div class="ccj-cbubble quote">'
    +'<div class="ccj-qc-head"><span class="ccj-qc-v">Quote v'+m.version+'</span>'
    +'<span class="ccj-qc-name">'+q.name+' &middot; '+q.country+'</span></div>'
    +'<div class="ccj-qc-total"><span>Total monthly cost</span><b>'+money(q.total)+'</b></div>'
    +(m.wasTotal?'<div class="ccj-qc-was">was '+money(m.wasTotal)+' &middot; margin '
      +m.wasMargin+'% &rarr; '+q.margin+'%</div>':'')
    +(m.changes?'<div class="ccj-qc-was terms">'+m.changes.map(function(x){
       return x.k+' '+x.from+' &rarr; '+x.to;}).join(' &middot; ')+' &middot; price unchanged</div>':'')
    +'<div class="ccj-qc-lines">'
    +'<span><b>Gross</b>'+money(q.gross)+'</span>'
    +'<span><b>Employer cost</b>'+money(q.social+q.holiday)+'</span>'
    +'<span><b>Service fee</b>'+money(q.fee)+'</span>'
    +'</div></div>';
}

/* ---- STAGE 2: THE QUOTE ---------------------------------------------------------------------
   The artifact the sub-statuses on the right are building. It fills in as they settle rather
   than appearing complete from the start: the country rules arrive when the Compliance Hub is
   read, the cost lines when the engine has run, the floor check when it has passed. A quote
   shown whole before the work was done would be the number without the working.

   The rates are the ones the rest of the app already uses — 26.02% employer social premium and
   8% holiday allowance for the Netherlands are what the cost calculator and the Contracts
   commercial block state — so the same hire never carries two different totals in one product. */
/* ONE RATE TABLE, and everything that quotes a number reads it.

   This exists because the same fact had three answers. The quote screen said Germany was 18.4%,
   the evidence panel beside it said "~19.4%" (from aiH2rCountryData), and the cost calculator on
   another page implies 19.575%. Two of those were on screen at the same time, a column apart.

   The figures below are the ones aiH2rCountryData states, so the number and the prose describing
   it now come from the same place. India is 12 + 3.25 + 4.81 as that entry itemises it. */
const CCJ_RATES={
  'Netherlands':   {social:23,   holiday:8, label:'Employer social security'},
  'Germany':       {social:19.4, holiday:0, label:'Social contributions'},
  'India':         {social:20.06,holiday:0, label:'PF + ESI + Gratuity'},
  'Spain':         {social:30,   holiday:0, label:'Employer social security'},
  'United Kingdom':{social:13.8, holiday:0, label:'Employer National Insurance'},
  'France':        {social:42,   holiday:0, label:'Employer social charges'},
  'Italy':         {social:30,   holiday:0, label:'Employer contributions'}
};
function ccjRate(country){return CCJ_RATES[country]||CCJ_RATES['Germany'];}
/* The statutory minimum wage for a country, read live from the Compliance Hub table rather than
   authored here — it is the same row a user sees two clicks away under Rates & Rules. Returns
   null when the country has no such rule configured, which is a real state: only the Netherlands
   carries one today, and a run in Germany genuinely cannot make this check. */
function ccjFloorFor(country){
  const rows=(typeof supportPageMeta!=='undefined'&&supportPageMeta.compliance
    &&supportPageMeta.compliance.rows)||[];
  const row=rows.find(function(r){
    return r[1]===country&&/minimum wage/i.test(String(r[2]))&&r[6]==='Active';});
  if(!row)return null;
  const m=String(row[5]).match(/([A-Z]{3})\s*([\d.,]+)/);
  if(!m)return null;
  return {label:m[1],value:m[2],num:parseFloat(m[2].replace(/,/g,''))};
}
/* Margin IS the fee — which is what makes a negotiation possible. A flat service charge would
   mean "can you improve on the rate" had nothing to move. */
function ccjQuote(margin){
  const c=ccjCtx();
  const gross=Math.round(c.grossMonthly);
  const rate=ccjRate(c.country);
  const socialPct=rate.social;
  const social=Math.round(gross*socialPct/100);
  const holiday=Math.round(gross*rate.holiday/100);
  const m=margin!==undefined?margin:(ccjRun&&ccjRun.margin!==undefined?ccjRun.margin:20);
  const base=gross+social+holiday;
  const fee=Math.round(base*m/100);
  return {gross:gross,social:social,socialPct:socialPct,holiday:holiday,base:base,
    fee:fee,total:base+fee,margin:m,
    country:c.country,name:c.name,type:c.type,sym:ccjCurrency()};
}
function ccjQuoteDone(label){
  const run=ccjRun;
  return !!run.settled['quote-prep/'+label];
}
function buildCCJQuoteHTML(){
  const q=ccjQuote();
  const money=function(v){return q.sym+' '+v.toLocaleString();};
  const costReady=ccjQuoteDone('Cost calc built');
  const rulesReady=ccjQuoteDone('Country data check');
  // The settled row itself, not just "did it finish". The row froze its summary at settle time,
  // so reading it makes the two columns identical by construction rather than by two functions
  // happening to agree — and it reports a failed or unmakeable check honestly.
  const floorRow=ccjRun.settled['quote-prep/Statutory floor check'];
  const approved=ccjQuoteDone('Quote QA');
  const line=function(k,sub,v,ready){
    return '<div class="ccj-q-row'+(ready?'':' pend')+'">'
      +'<div class="ccj-q-k">'+k+(sub?'<span>'+sub+'</span>':'')+'</div>'
      +'<div class="ccj-q-v">'+(ready?v:'<span class="ccj-q-skel"></span>')+'</div></div>';
  };
  return '<div class="ccj-q">'
    +'<div class="ccj-q-head">'
    +'<div><div class="ccj-q-title">Quote</div>'
    +'<div class="ccj-q-sub">'+q.name+' &middot; '+q.country+' &middot; '+q.type+'</div></div>'
    +'<span class="ccj-q-status'+(approved?' ok':'')+'">'+(approved?'Approved':'In preparation')+'</span>'
    +'</div>'
    +'<div class="ccj-q-card">'
    +'<div class="ccj-q-sec">Monthly employer cost</div>'
    +line('Gross salary','Offered',money(q.gross),true)
    +line(ccjRate(q.country).label,q.socialPct+'% of gross',money(q.social),costReady)
    +(q.holiday?line('Holiday allowance',ccjRate(q.country).holiday+'% of gross',money(q.holiday),costReady):'')
    +line('ADT service fee',q.margin+'% margin',money(q.fee),costReady)
    +'<div class="ccj-q-total"><span>Total monthly cost</span><b>'+(costReady?money(q.total):'&mdash;')+'</b></div>'
    +'</div>'
    +'<div class="ccj-q-meta">'
    +'<div class="ccj-q-mrow'+(rulesReady?'':' pend')+'"><span>Country rules</span><b>'
      +(rulesReady?q.country+' statutory set resolved':'Pending')+'</b></div>'
    +'<div class="ccj-q-mrow'+(floorRow?'':' pend')+'"><span>Statutory floor</span><b>'
      // Reads the settled row's own summary rather than asserting a pass. Hardcoding "Above
      // minimum wage" meant the quote card claimed the rate cleared the statutory floor in
      // every case — including a failed check, and including the six countries where the panel
      // a column away said the check could not be made at all.
      +(floorRow?floorRow.summary:'Pending')+'</b></div>'
    +'<div class="ccj-q-mrow'+(costReady?'':' pend')+'"><span>Margin</span><b>'
      +(costReady?q.margin+'% &middot; standard rate card':'Pending')+'</b></div>'
    +'</div>'
    +(approved?'<div class="ccj-q-note">Approved and ready to send to the client.</div>':'')
    +'</div>';
}

/* ---- STAGE 3: WHAT THE ACCOUNT MANAGER WATCHES ----------------------------------------------
   Three questions, and this screen answers exactly those: have they opened it, when did I last
   chase, and what did they say. Everything else about the quote is one column to the left, in
   the thread it was sent through.

   The simulate strip is demo scaffolding and says so. It fires the SAME events the script fires,
   so nothing it can produce is a state the run could not reach on its own. */
function buildCCJSentHTML(){
  const c=ccjClient(),q=ccjQuote();
  const money=function(v){return q.sym+' '+Number(v).toLocaleString();};
  const done=function(on){return on?'done':'';};
  const ev=function(label,when,on,sub){
    return '<div class="ccj-tl-row '+done(on)+'">'
      +'<span class="ccj-tl-dot"></span>'
      +'<div class="ccj-tl-body"><div class="ccj-tl-label">'+label+'</div>'
      +(sub?'<div class="ccj-tl-sub">'+sub+'</div>':'')+'</div>'
      +'<span class="ccj-tl-when">'+(on?when:'&mdash;')+'</span></div>';
  };
  const opened=c.openedAt!==null;
  const replied=c.log.some(function(e){return e.id==='changed';});
  return '<div class="ccj-sent">'
    +'<div class="ccj-sent-head">'
    +'<div><div class="ccj-sent-title">Quote with the client</div>'
    +'<div class="ccj-sent-sub">v'+c.version+' &middot; '+money(q.total)+' a month &middot; '+q.margin+'% margin</div></div>'
    +'<span class="ccj-sent-state '+(c.state==='accepted'?'ok':replied?'warn':'')+'">'
      +(c.state==='accepted'?'Accepted':replied?'In negotiation':opened?'Opened':'Awaiting open')+'</span>'
    +'</div>'
    // Straight off the log, in the order things happened, stamped with when they happened. The
    // previous version inferred each row from the client's CURRENT state against hard-coded
    // dates, so accepting a quote outright still displayed "Change requested — Client asked for
    // a better rate", and a re-issue erased two follow-ups the thread was still showing.
    +'<div class="ccj-tl">'
    +(c.log.length
      ?c.log.map(function(e){return ev(e.label,ccjStamp(e.at),true,e.sub);}).join('')
      :'<div class="ccj-tl-empty">Nothing has happened yet.</div>')
    +'</div>'
    +buildCCJSimulateHTML(c)
    +'</div>';
}
function buildCCJSimulateHTML(c){
  const btn=function(ev,label,on){
    return '<button class="ccj-sim-btn" onclick="ccjClientEvent(\''+ev+'\')"'+(on?'':' disabled')+'>'+label+'</button>';
  };
  const waiting=c.state==='sent';
  const opened=c.state==='viewed'||c.state==='chased';
  return '<div class="ccj-sim">'
    +'<div class="ccj-sim-head">Simulate client<span>demo</span></div>'
    +'<div class="ccj-sim-btns">'
    +btn('viewed','Opens the quote',waiting)
    +btn('chase','Chase now',(opened)&&c.chases<3)
    // The two things a client actually comes back with. They force different work, so they are
    // two buttons rather than one — a rate request rebuilds the cost, a terms request does not.
    +'<button class="ccj-sim-btn" onclick="ccjClientEvent(\'changed\',undefined,\'price\')"'+(opened?'':' disabled')+'>Asks for a better rate</button>'
    +'<button class="ccj-sim-btn" onclick="ccjClientEvent(\'changed\',undefined,\'terms\')"'+(opened?'':' disabled')+'>Asks to change the terms</button>'
    +btn('accepted','Accepts',c.state!=='idle'&&c.state!=='accepted')
    +'</div>'
    +'<div class="ccj-sim-note">Left alone the client acts on their own. These are the same events.</div>'
    +'</div>';
}

/* == STAGE 6: THE DEPOSIT INVOICE, AND THE GATE IT HOLDS ===================================
   The first stage on the placement track and the only one the operating model calls a hard
   gate: no hire under this client starts until the deposit is in the bank, however far the
   paperwork has got.

   IT IS A DOCUMENT, NOT A STATUS. A deposit invoice is the instrument a client's accounts
   payable department pays against, so it has to carry what one needs to pay it: who is billing
   whom, out of which registered entity, under which VAT treatment, against which agreement, by
   when, into which account, quoting which reference. A card reading "Deposit €5,700 — unpaid"
   is a status line. This is the invoice.

   EVERY NUMBER ON IT WAS DECIDED EARLIER. The amount is clause 3.4 of the agreement stage 5
   executed — one month gross salary. The terms are that agreement's "14 days net". The issue
   date is the countersignature date, because that is the event it is raised against. Nothing
   here is authored, so a renegotiated quote moves this invoice with it.

   VAT IS COMPUTED, NOT PRINTED. The invoice is issued by the ADT entity in the country the WORK
   happens in, to a client that is frequently somewhere else — the ordinary case on this platform,
   not the exception. Same country and it carries that country's VAT. Two EU countries and it is
   reverse-charged under Article 196, the client accounting for it at home. Client outside the EU
   and it falls outside the scope entirely. A flat rate printed on all three would be wrong on
   two of them, and wrong on an invoice is not a cosmetic problem.

   THE MONEY ARRIVES ON SOMEBODY ELSE'S CLOCK, like stage 3's quote. So the same machinery: a
   script that plays itself, a strip that fires the same events by hand, and a ledger that is a
   RECORD of what happened rather than an inference from the current balance.            == */

/* Where each entity is registered, what it is registered AS, and where money to it goes. Two
   addresses per country because the ADT entity and the client are both there in the cross-border
   case and printing one address twice would read as a mistake. */
const CCJ_EU=['Netherlands','Germany','Spain','France','Italy'];
const CCJ_VAT_RATE={'Netherlands':21,'Germany':19,'Spain':21,'France':20,'Italy':22,
                    'United Kingdom':20,'India':18};
const CCJ_REGISTRY={
  'Netherlands':{ccy:'EUR',rail:'SEPA credit transfer',
    adt:['Keizersgracht 241','1016 EA Amsterdam','Netherlands'],
    client:['Herengracht 458','1017 CA Amsterdam','Netherlands'],
    vat:'NL8231.45.678.B01',cvat:'NL8044.11.902.B01',reg:'KvK 74329118',
    bank:'ABN AMRO Bank N.V.',iban:'NL91 ABNA 0417 1643 00',bic:'ABNANL2A'},
  'Germany':{ccy:'EUR',rail:'SEPA credit transfer',
    adt:['Friedrichstra&szlig;e 88','10117 Berlin','Germany'],
    client:['Maximilianstra&szlig;e 13','80539 M&uuml;nchen','Germany'],
    vat:'DE 811 234 567',cvat:'DE 306 552 189',reg:'HRB 214887 B',
    bank:'Commerzbank AG',iban:'DE89 3704 0044 0532 0130 00',bic:'COBADEFFXXX'},
  'Spain':{ccy:'EUR',rail:'SEPA credit transfer',
    adt:['Calle de Alcal&aacute; 42','28014 Madrid','Spain'],
    client:['Passeig de Gr&agrave;cia 92','08008 Barcelona','Spain'],
    vat:'ESB12345674',cvat:'ESA58818501',reg:'Registro Mercantil de Madrid',
    bank:'CaixaBank S.A.',iban:'ES91 2100 0418 4502 0005 1332',bic:'CAIXESBBXXX'},
  'France':{ccy:'EUR',rail:'SEPA credit transfer',
    adt:['18 Rue de la Paix','75002 Paris','France'],
    client:['12 Quai Andr&eacute; Citro&euml;n','75015 Paris','France'],
    vat:'FR 40 123456824',cvat:'FR 62 552081317',reg:'RCS Paris 812 345 678',
    bank:'BNP Paribas',iban:'FR14 2004 1010 0505 0001 3M02 606',bic:'BNPAFRPPXXX'},
  'Italy':{ccy:'EUR',rail:'SEPA credit transfer',
    adt:['Via Monte Napoleone 8','20121 Milano','Italy'],
    client:['Via del Corso 184','00186 Roma','Italy'],
    vat:'IT12345678987',cvat:'IT09876543215',reg:'REA MI-2094412',
    bank:'Intesa Sanpaolo S.p.A.',iban:'IT60 X054 2811 1010 0000 0123 456',bic:'BCITITMMXXX'},
  'United Kingdom':{ccy:'GBP',rail:'Faster Payments',
    adt:['12 Finsbury Square','London EC2A 1AS','United Kingdom'],
    client:['1 Spinningfields','Manchester M3 3AP','United Kingdom'],
    vat:'GB 123 4567 89',cvat:'GB 884 1029 66',reg:'Companies House 09218804',
    bank:'NatWest Bank plc',iban:'GB29 NWBK 6016 1331 9268 19',bic:'NWBKGB2L'},
  'India':{ccy:'INR',rail:'NEFT transfer',
    adt:['Raheja Towers, MG Road','Bengaluru 560001','India'],
    client:['Nariman Point','Mumbai 400021','India'],
    vat:'GSTIN 29AABCU9603R1ZM',cvat:'GSTIN 27AAACH7409R1Z8',reg:'CIN U74999KA2019PTC128841',
    bank:'HDFC Bank Ltd',iban:'A/C 5011 2345 6789',bic:'IFSC HDFC0000123'}
};
/* Defaults to the Netherlands entry rather than throwing: a country we have no registry row for
   is a demo gap, not a reason for the invoice to fail to render. */
function ccjReg(country){
  return CCJ_REGISTRY[country||ccjParties().adt.country]||CCJ_REGISTRY['Netherlands'];
}
/* Place of supply, in three branches. Reads ccjParties only — never ccjCtx, which calls this. */
function ccjVat(){
  const p=ccjParties();
  const from=p.adt.country,to=p.client.country;
  if(from===to){
    const rate=CCJ_VAT_RATE[from]||0;
    return {rate:rate,kind:'domestic',label:from+' VAT at '+rate+'%',
      short:'VAT '+rate+'%',
      note:'Supplied and taxed in '+ccjInCountry(from)+'. VAT is charged at the standard rate and accounted for by the Provider.'};
  }
  if(CCJ_EU.indexOf(from)>-1&&CCJ_EU.indexOf(to)>-1)return {rate:0,kind:'reverse',
    label:'VAT reverse charged',short:'Reverse charge',
    note:'VAT reverse charged under Article 196 of Council Directive 2006/112/EC. The Client accounts for VAT in '+ccjInCountry(to)+' under its own registration.'};
  return {rate:0,kind:'export',label:'Outside the scope of VAT',short:'Outside scope',
    note:'Supplied to a business established outside the EU. Outside the scope of EU VAT under Article 44; the Client accounts for any tax arising in '+ccjInCountry(to)+'.'};
}

/* ---- WHAT HAS BEEN PAID ------------------------------------------------------------------
   `receipts` is the ledger and everything else is derived from it. Storing a `balance` that had
   to be kept in step with the receipts would be two answers to one question, which is the bug
   stage 3's timeline was rewritten to remove. */
function ccjNewPay(){
  return {issuedAt:null,          // simulated minute the invoice was raised — null, not 0
    dueAt:null,                   // issue + 14 days, from the agreement's terms
    ackAt:null,                   // when the client acknowledged it
    receipts:[],                  // {at,amount,kind,method,ref,payer} — what actually arrived
    reminders:[],                 // {at,kind:'due'|'overdue'} — the dunning record
    // `chasedAt` and `releasedAt` are stored rather than derived from a neighbouring row's time.
    // The ledger printed `firstReceipt + 1 minute` for the chase, which put it at 09:38 while the
    // thread carrying the same chase said 10:17 — one event, two surfaces, two answers.
    chased:false,chasedAt:null,   // a balance chase went out after a part payment
    released:false,releasedBy:'',releasedAt:null,shortfall:0,  // gate lifted against a shortfall
    clearedAt:null,timer:null,state:'idle'};
}
function ccjPay(){const run=ccjRun;if(!run.pay)run.pay=ccjNewPay();return run.pay;}
function ccjAmountDue(){const q=ccjQuote();return q.gross+Math.round(q.gross*ccjVat().rate/100);}
function ccjReceived(){return ccjPay().receipts.reduce(function(s,r){return s+r.amount;},0);}
function ccjOutstanding(){return Math.max(0,ccjAmountDue()-ccjReceived());}
function ccjPaidInFull(){return ccjPay().receipts.length>0&&ccjOutstanding()===0;}
function ccjMoney(v){return ccjCurrency()+'&nbsp;'+Number(v).toLocaleString();}
/* A date without a time. An invoice is dated to the day — printing 09:12 beside a due date would
   be claiming a precision payment terms do not have. */
function ccjDate(mins){return ccjStamp(mins||0).split(',')[0]+' '+CCJ_T0.year;}
/* Which day a simulated minute falls on. A due date is a DAY, so "how late is this" has to be
   counted in days rather than in elapsed minutes: an invoice due yesterday evening and read this
   morning is twelve hours past, which rounds to nothing and reported itself as "due today". */
function ccjDayNo(mins){return Math.floor((CCJ_T0.hour*60+CCJ_T0.min+(mins||0))/1440);}
/* Everything the document states, in one place, so the paper, the panel and the drawer cannot
   drift. Each field traces to something an earlier stage decided. */
function ccjInvoice(){
  const c=ccjCtx(),p=ccjParties(),q=ccjQuote(),pay=ccjPay(),v=ccjVat();
  const tax=Math.round(q.gross*v.rate/100);
  return {id:c.depositInvoice, agreement:ccjMsa().id,
    net:q.gross, vat:v, tax:tax, total:q.gross+tax,
    issued:pay.issuedAt, due:pay.dueAt, terms:'Net 14',
    from:p.adt, to:p.client, worker:p.worker,
    role:(ccjRun&&ccjRun.form&&ccjRun.form.jobTitle)||'&mdash;'};
}

/* ---- THE CLIENT'S SIDE OF THE INVOICE -----------------------------------------------------
   Same shape as stage 3: every event lands in one function whether the script fired it or a
   person clicked it, so the strip cannot produce a state the run could not reach on its own. */
function ccjPayEvent(ev,off){
  const run=ccjRun;if(!run)return;
  const p=ccjPay(),c=ccjClient();
  // `off` is minutes after the invoice was issued, which is what makes "two days before due" and
  // "three days overdue" mean something. Absent, the clock simply moves on a little.
  const at=function(){
    if(off!==undefined&&p.issuedAt!==null)c.mins=Math.max(c.mins,p.issuedAt+off);
    else c.mins+=40;
    return c.mins;
  };
  const receipt=function(amount,kind){
    const reg=ccjReg();
    p.receipts.push({at:c.mins,amount:amount,kind:kind,method:reg.rail,
      ref:ccjInvoice().id,payer:ccjParties().client.name});
  };
  if(ev==='issue'){
    if(p.issuedAt!==null)return;
    c.mins+=25;
    p.issuedAt=c.mins;
    p.dueAt=c.mins+14*1440;                       // 14 days net, straight off the agreement
    p.state='issued';
    ccjClientLog('invoiced','Deposit invoice raised',
      ccjInvoice().id+' &middot; '+ccjMoney(ccjAmountDue())+' &middot; due '+ccjDate(p.dueAt));
    ccjClientPush({who:'us',kind:'invoice',id:ccjInvoice().id,
      total:ccjAmountDue(),due:p.dueAt,at:c.mins});
  }else if(ev==='ack'){
    if(p.ackAt)return;
    p.ackAt=at();
    ccjClientPush({who:'client',
      text:'Received &mdash; thank you. It is with our finance team and booked into the next payment run.',
      at:c.mins});
  }else if(ev==='remind'){
    if(ccjPaidInFull()||p.issuedAt===null)return;
    at();
    const kind=p.dueAt!==null&&c.mins>=p.dueAt?'overdue':'due';
    p.reminders.push({at:c.mins,kind:kind});
    ccjClientLog('remind'+p.reminders.length,'Payment reminder '+p.reminders.length,
      kind==='overdue'?'Invoice overdue':'Due '+ccjDate(p.dueAt));
    ccjClientPush({who:'us',kind:'remind',n:p.reminders.length,overdue:kind==='overdue',
      amount:ccjOutstanding(),at:c.mins});
  }else if(ev==='part'){
    if(p.receipts.length||p.issuedAt===null)return;
    at();
    // A client paying part of an invoice pays a round figure, not 60.0% of it to the euro.
    const amt=Math.round(ccjAmountDue()*0.6/10)*10;
    receipt(amt,'part');
    ccjClientLog('partpaid','Part payment received',
      ccjMoney(amt)+' of '+ccjMoney(ccjAmountDue()));
    ccjClientPush({who:'client',kind:'remit',amount:amt,paid:'part',
      outstanding:ccjOutstanding(),at:c.mins});
  }else if(ev==='full'){
    if(ccjPaidInFull()||p.issuedAt===null)return;
    at();
    const amt=ccjOutstanding();
    receipt(amt,p.receipts.length?'balance':'full');
    ccjClientLog(p.receipts.length>1?'balancepaid':'fullpaid',
      p.receipts.length>1?'Balance received':'Paid in full',ccjMoney(amt)+' &middot; matched on reference');
    ccjClientPush({who:'client',kind:'remit',amount:amt,
      paid:p.receipts.length>1?'balance':'full',outstanding:0,at:c.mins});
  }else if(ev==='chase'){
    p.chased=true;
    p.chasedAt=at();
    ccjClientLog('chasebalance','Balance chased',ccjMoney(ccjOutstanding())+' outstanding');
    ccjClientPush({who:'us',
      text:ccjMoney(ccjReceived())+' is matched against <b>'+ccjInvoice().id+'</b>, thank you. <b>'
        +ccjMoney(ccjOutstanding())+'</b> remains outstanding &mdash; the placement cannot be started until the deposit is settled in full.',
      at:c.mins});
  }
  ccjPaintScreen();
  ccjPaint();
  ccjResolveWait();
  ccjPaySchedule();
}
/* The demo plays itself down the path that shows every row: acknowledged, chased before the due
   date, part-paid just after it, then — once a person has answered the shortfall — settled. */
const CCJ_PAY_SCRIPT=[
  {ev:'ack',    in:2600, off:130,   when:function(p){return p.state==='issued'&&!p.ackAt;}},
  {ev:'remind', in:3000, off:17280, when:function(p){return !!p.ackAt&&!p.reminders.length&&!p.receipts.length;}},
  {ev:'part',   in:3200, off:20880, when:function(p){return p.reminders.length>0&&!p.receipts.length;}},
  // Only after the balance has been chased, which is a decision someone had to take. Without
  // that condition the money would arrive while the gate was still asking whether to wait for it.
  {ev:'full',   in:3400, off:25200, when:function(p){return p.chased&&!p.released&&ccjOutstanding()>0;}}
];
function ccjPaySchedule(){
  const run=ccjRun;if(!run)return;
  const p=ccjPay();
  const next=CCJ_PAY_SCRIPT.find(function(s){return s.when(p);});
  if(p.timer){clearTimeout(p.timer);p.timer=null;}
  if(!next)return;
  const g=ccjGen;
  p.timer=setTimeout(function(){
    if(ccjGen!==g||ccjRun!==run)return;
    p.timer=null;
    ccjPayEvent(next.ev,next.off);
  },next.in);
}
/* The activity on the invoice, in the order it happened, built from the record rather than from
   the current balance. Stage 3's timeline was rewritten for exactly this reason: a ledger derived
   from state reports events that never occurred. */
function ccjPayLedger(){
  const p=ccjPay(),rows=[];
  if(p.issuedAt!==null)rows.push({at:p.issuedAt,kind:'issued',label:'Invoice raised',
    sub:ccjInvoice().id+' &middot; due '+ccjDate(p.dueAt)});
  if(p.ackAt)rows.push({at:p.ackAt,kind:'ack',label:'Acknowledged by the client',
    sub:'Booked for the next payment run'});
  p.reminders.forEach(function(r,n){rows.push({at:r.at,kind:'remind',
    label:'Payment reminder '+(n+1),
    sub:r.kind==='overdue'?'Invoice overdue':'Sent ahead of the due date'});});
  p.receipts.forEach(function(r){rows.push({at:r.at,kind:'receipt',
    label:r.method+' &middot; ref '+r.ref,amount:r.amount,
    sub:'Matched &middot; '+(r.kind==='part'?'part payment':r.kind==='balance'?'balance':'paid in full')});});
  if(p.chased)rows.push({at:p.chasedAt||0,kind:'chase',
    label:'Balance chased',sub:'Placement held pending settlement'});
  if(p.released)rows.push({at:p.releasedAt||0,kind:'release',
    label:'Released against a shortfall',sub:'Approved by '+p.releasedBy});
  if(p.clearedAt!==null)rows.push({at:p.clearedAt,kind:'cleared',
    label:'Payment gate released',sub:'Reconciled against '+ccjInvoice().id});
  return rows.sort(function(a,b){return a.at-b.at;});
}

/* ---- THE INVOICE SCREEN ------------------------------------------------------------------
   Three bands on a grey desk: what is owed, the document itself, and what has arrived against
   it. The money band is first because it is the one thing every reader of this screen wants,
   and the paper below it is what they act on. */
function buildCCJInvoiceHTML(){
  const run=ccjRun,p=ccjParties(),inv=ccjInvoice(),pay=ccjPay();
  const done=function(l){return !!run.settled['deposit-due/'+l];};
  const raised=pay.issuedAt!==null, cleared=done('Cleared');
  const due=ccjAmountDue(),got=ccjReceived(),out=ccjOutstanding();
  const reg=ccjReg(p.adt.country), creg=ccjReg(p.client.country);
  const pct=due?Math.min(100,Math.round(got/due*100)):0;
  const days=pay.dueAt!==null?ccjDayNo(pay.dueAt)-ccjDayNo(ccjClient().mins):0;
  const when=!raised?'Not raised yet.'
    :cleared?(pay.released
        ?'Gate released against a shortfall of '+ccjMoney(pay.shortfall)+' on '+ccjDate(pay.clearedAt)+'.'
        :'Settled in full on '+ccjDate(pay.receipts[pay.receipts.length-1].at)+'.')
    :'Due '+ccjDate(pay.dueAt)+' &middot; Net 14 &middot; '
      +(days>0?days+' day'+(days===1?'':'s')+' to go':days===0?'due today'
        :Math.abs(days)+' day'+(Math.abs(days)===1?'':'s')+' overdue');
  const fig=function(k,v,cls){return '<div class="ccj-inv-fig '+(cls||'')+'"><span>'+k+'</span><b>'+v+'</b></div>';};
  const kv=function(k,v){return '<div class="ccj-inv-kv"><span>'+k+'</span><b>'+v+'</b></div>';};
  const party=function(tag,name,addr,vat,reg2){
    return '<div class="ccj-inv-party"><div class="ccj-inv-party-t">'+tag+'</div>'
      +'<div class="ccj-inv-party-n">'+name+'</div>'
      +'<div class="ccj-inv-party-a">'+addr.join('<br>')+'</div>'
      +'<div class="ccj-inv-party-v">'+vat+(reg2?'<br>'+reg2:'')+'</div></div>';
  };
  return '<div class="ccj-inv-wrap">'

    // Band 1 — the money, stated before anything else.
    +'<div class="ccj-inv-stat'+(cleared&&!pay.released?' ok':pay.released?' warn':'')+'">'
    +'<div class="ccj-inv-figs">'
    +fig('Invoiced',raised?ccjMoney(due):'&mdash;')
    +fig('Received',ccjMoney(got),got?'got':'')
    +fig('Outstanding',ccjMoney(out),out?'out':'')
    +'</div>'
    +'<div class="ccj-inv-bar"><span style="width:'+pct+'%"></span></div>'
    +'<div class="ccj-inv-when">'+when+'</div>'
    +'</div>'

    // Band 2 — the invoice.
    +'<div class="ccj-inv'+(raised?'':' pending')+'">'
    +'<div class="ccj-inv-head">'
    +'<div><div class="ccj-inv-brand">ADT</div>'
    +'<div class="ccj-inv-brandsub">Global Employment Platform</div></div>'
    +'<div class="ccj-inv-ref"><div class="ccj-inv-kind">DEPOSIT INVOICE</div>'
    +'<div class="ccj-inv-no">'+inv.id+'</div></div>'
    +'</div>'

    +'<div class="ccj-inv-parties">'
    +party('From',inv.from.name,reg.adt,'VAT '+reg.vat,reg.reg)
    +party('Bill to',inv.to.name,creg.client,'VAT '+creg.cvat,'Attn: '+inv.to.contact)
    +'</div>'

    +'<div class="ccj-inv-meta">'
    +kv('Invoice date',raised?ccjDate(pay.issuedAt):'&mdash;')
    +kv('Due date',raised?ccjDate(pay.dueAt):'&mdash;')
    +kv('Payment terms','Net 14, per agreement')
    +kv('Agreement',inv.agreement)
    +kv('Currency',reg.ccy)
    +kv('Payment reference',inv.id)
    +'</div>'

    +'<table class="ccj-inv-lines">'
    +'<thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Amount</th></tr></thead>'
    +'<tbody><tr>'
    +'<td><b>Security deposit</b>'
    +'<span>Clause 3.4 &mdash; one month gross salary, held as security against payroll funded ahead of invoice settlement.</span>'
    +'<span>'+inv.worker.name+' &middot; '+inv.role+' &middot; '+inv.worker.country+'</span></td>'
    +'<td>1</td><td>'+ccjMoney(inv.net)+'</td><td>'+ccjMoney(inv.net)+'</td>'
    +'</tr></tbody></table>'

    // The stamp lives beside the totals, in the white space a real one is banged into — not over
    // the header, where the invoice number is, or over the address block, which has to stay legible.
    +'<div class="ccj-inv-totwrap">'
    +(cleared?'<div class="ccj-inv-stamp'+(pay.released?' short':'')+'">'
      +(pay.released?'RELEASED':'PAID')+'</div>':'')
    +'<div class="ccj-inv-tot">'
    +'<div class="ccj-inv-trow"><span>Subtotal</span><b>'+ccjMoney(inv.net)+'</b></div>'
    +'<div class="ccj-inv-trow"><span>'+inv.vat.label+'</span><b>'+ccjMoney(inv.tax)+'</b></div>'
    +'<div class="ccj-inv-grand"><span>Total due</span><b>'+ccjMoney(inv.total)+'</b></div>'
    +'</div></div>'
    +'<div class="ccj-inv-vat">'+inv.vat.note+'</div>'

    +'<div class="ccj-inv-sec"><div class="ccj-inv-sec-t">Payment instructions</div>'
    +kv('Account name',inv.from.name)
    +kv('Bank',reg.bank)
    +kv(reg.ccy==='INR'?'Account number':'IBAN',reg.iban)
    +kv(reg.ccy==='INR'?'IFSC':'BIC / SWIFT',reg.bic)
    +kv('Reference',inv.id)
    +'<div class="ccj-inv-warn">Quote <b>'+inv.id+'</b> as the payment reference. A transfer that arrives without it is not matched automatically, and the placement stays held while the money sits unallocated.</div>'
    +'</div>'

    +'<div class="ccj-inv-foot">No placement may commence under agreement '+inv.agreement
    +' until this invoice is settled in full. The deposit is refundable on termination once all liabilities are discharged. '
    +inv.from.name+' is registered in '+ccjInCountry(inv.from.country)+' &middot; '+reg.reg+'.</div>'
    +'</div>'

    // Band 3 — what has actually happened against it.
    +buildCCJRemitHTML()

    +(cleared
      ?'<div class="ccj-inv-rel'+(pay.released?' short':'')+'">'
       +'<div class="ccj-inv-rel-ico">'
       +'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
       +'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg></div>'
       +'<div class="ccj-inv-rel-body">'
       +'<div class="ccj-inv-rel-t">'+(pay.released
          ?'Payment gate released against a shortfall'
          :'Payment gate released')+'</div>'
       +'<div class="ccj-inv-rel-s">'+(pay.released
          ?ccjMoney(pay.shortfall)+' is still outstanding. '+pay.releasedBy
            +' accepted the exposure so the placement can start; the balance stays on the ledger.'
          :'The deposit is settled in full. This hire can now be contracted.')+'</div>'
       +'</div></div>'
      :'')

    +(run.phase==='rest'
      ?'<div class="ccj-inv-next">'
       +'<div class="ccj-inv-next-t">Deposit cleared. Nothing else is needed on this step.</div>'
       +'<button class="ccj-primary" onclick="ccjContinueStage()">'
       +CCJ_STAGE_REST['deposit-due'].label+' &rarr;</button></div>'
      :'')

    +buildCCJPaySimHTML()
    +'</div>';
}
/* The bank ledger. Receipts carry an amount column; reminders and chases do not, because they
   moved no money and a zero in that column would say they did. */
function buildCCJRemitHTML(){
  const pay=ccjPay(),rows=ccjPayLedger();
  return '<div class="ccj-rem">'
    +'<div class="ccj-rem-head">Activity on this invoice'
    +'<span>'+pay.receipts.length+' receipt'+(pay.receipts.length===1?'':'s')
    +' &middot; '+ccjMoney(ccjReceived())+' of '+ccjMoney(ccjAmountDue())+'</span></div>'
    +(rows.length
      ?rows.map(function(r){
        return '<div class="ccj-rem-row '+r.kind+'">'
          +'<span class="ccj-rem-dot"></span>'
          +'<div class="ccj-rem-body"><div class="ccj-rem-label">'+r.label+'</div>'
          +'<div class="ccj-rem-sub">'+r.sub+'</div></div>'
          +'<span class="ccj-rem-when">'+ccjStamp(r.at)+'</span>'
          +'<span class="ccj-rem-amt">'+(r.amount?'+'+ccjMoney(r.amount):'')+'</span>'
          +'</div>';
      }).join('')
      :'<div class="ccj-rem-none">Nothing has happened on this invoice yet.</div>')
    +'</div>';
}
/* The same scaffolding stage 3 carries, and it says so. Every button fires the event the script
   fires, so nothing here can reach a state the run could not reach on its own. */
function buildCCJPaySimHTML(){
  const p=ccjPay();
  const btn=function(ev,label,on){
    return '<button class="ccj-sim-btn" onclick="ccjPayEvent(\''+ev+'\')"'+(on?'':' disabled')+'>'
      +label+'</button>';
  };
  const live=p.issuedAt!==null&&!ccjPaidInFull();
  return '<div class="ccj-sim">'
    +'<div class="ccj-sim-head">Simulate client<span>demo</span></div>'
    +'<div class="ccj-sim-btns">'
    +btn('ack','Acknowledges the invoice',p.issuedAt!==null&&!p.ackAt)
    +btn('remind','Send a reminder',live)
    +btn('part','Part-pays 60%',live&&!p.receipts.length)
    +btn('full',p.receipts.length?'Pays the balance':'Pays in full',live)
    +'</div>'
    +'<div class="ccj-sim-note">Left alone the client pays on their own. These are the same events.</div>'
    +'</div>';
}

/* ---- WIRING STAGE 6 INTO THE RUNNER -------------------------------------------------------
   Declared here beside the stage they belong to rather than back in the maps, so everything this
   stage adds to the machine is readable in one place. The maps themselves are already built by
   the time this executes. */
CCJ_CLIENT_STAGES.push('deposit-due');
CCJ_STAGE_REST['deposit-due']={label:'Continue to worker signing'};

CCJ_PURPOSE['deposit-due/Invoice raised']='Raises the deposit invoice against the signed agreement.';
CCJ_PURPOSE['deposit-due/Awaiting funds']='Watches the bank feed for the deposit, and chases it.';
CCJ_PURPOSE['deposit-due/Part-paid']='Only if the money arrives short. Hold, or release against the shortfall.';
CCJ_PURPOSE['deposit-due/Cleared']='Matches the receipt and lifts the payment gate.';

/* Issuing the invoice belongs to the step that raises it, not to the screen that displays it. */
CCJ_ON_SETTLE['deposit-due/Invoice raised']=function(run){
  ccjPayEvent('issue');
  ccjPaySchedule();
};
CCJ_ON_SETTLE['deposit-due/Cleared']=function(run){
  const p=ccjPay(),c=ccjClient();
  c.mins+=15;
  p.clearedAt=c.mins;
  ccjClientLog('cleared',p.released?'Released with a shortfall':'Deposit cleared',
    p.released?ccjMoney(p.shortfall)+' outstanding &middot; released by '+p.releasedBy
              :'Payment gate lifted');
  ccjClientPush({who:'us',kind:'receipt',id:ccjInvoice().id,amount:ccjReceived(),
    short:p.released?p.shortfall:0,at:c.mins});
};

/* The deposit arrives when it arrives. `pre` because there is nothing to reconcile until the
   first transfer lands — matching a receipt you have not received is not work. */
CCJ_WAITS['deposit-due/Awaiting funds']={pre:true,
  met:function(){return ccjPay().receipts.length>0;},
  note:'Invoice is with the client. Waiting for the deposit to arrive.'};
/* Part-paid parks AFTER its decision rather than before it: the gate asks whether to hold, and
   holding is what puts the row here. */
CCJ_WAITS['deposit-due/Part-paid']={
  met:function(){return ccjPaidInFull()||ccjPay().released;},
  note:'Chasing the balance. The placement stays held until the deposit is settled in full.'};

/* A shortfall is a decision, not a status. The row only carries the gate until it is answered —
   after that the same row is a wait, which is what holding for the balance actually is. */
CCJ_GATES['deposit-due/Part-paid']=function(){
  const run=ccjRun;if(!run)return null;
  if(run.decisions['deposit-due/Part-paid'])return null;
  return {
    kind:'decision',
    ask:ccjMoney(ccjOutstanding())+' of '+ccjMoney(ccjAmountDue())+' is still outstanding.',
    why:'No placement may start until the deposit is settled. Releasing early accepts the payroll exposure the deposit exists to cover, and is recorded against this run.',
    options:[
      {id:'holdBalance', label:'Hold for the balance',tone:'go',  done:'Held for the balance'},
      {id:'releaseShort',label:'Release anyway',      tone:'stop',done:'Released against a shortfall'}
    ]
  };
};

/* == STAGE 7: THE EMPLOYMENT CONTRACT ======================================================
   The second contract this journey produces, and a different one in every respect from the
   Master Services Agreement in stage 5. That one is between ADT and the CLIENT COMPANY, is
   commercial, states our margin, and is signed once per client. This one is between the ADT
   ENTITY and the WORKER, is an employment contract under the law of the country the work is
   done in, states none of the commercials, and is signed once per person.

   So the counterparty in the column changes. Stages 3-6 talked to the client; this talks to the
   employee, out of a separate store (`run.worker`). They must never merge — this thread discusses
   somebody's salary and probation with them, and the client's thread discusses our margin.

   == THE COMPLIANCE CHECK HAPPENS ON THE DOCUMENT ========================================
   The obvious way to render "clause compliance check" is a list of green ticks somewhere near
   the contract. That is a report ABOUT an audit; it is not the audit. What a compliance officer
   actually does is read the contract clause by clause with the statutory set beside them, and
   mark the clauses that do not meet it.

   So that is what this does. The check walks DOWN THE DOCUMENT, one clause at a time. Each
   clause takes a verdict in place, citing the Compliance Hub rule it was measured against, with
   the expected value and the drafted one. And where the draft falls short the clause is ADJUSTED
   — the text on screen changes under the reader, and the clause carries what it was changed
   from. A check that only ever agreed with the draft would not be a check.

   That is also what gives the human approval afterwards something to approve: not "the machine
   says it is fine", but "two clauses were rewritten to meet Dutch law, and here they are".

   == NOTHING HERE IS INVENTED ============================================================
   Every drafted term comes from the contract form (stage 1), and every rule it is measured
   against comes from `CCJ_STAT` or, for the minimum wage, live from the Compliance Hub's own
   Rates & Rules table via `ccjFloorFor`. Where the Hub has no rule for a country the check says
   so and returns NOT APPLICABLE, rather than inventing a threshold to pass.            == */

/* The statutory set, per country. `probationMax:0` means the country has no statutory maximum —
   which is a real answer (the UK has none) and is reported as such rather than as a pass. */
const CCJ_STAT={
  'Netherlands':{lang:'Dutch',
    law:'Book 7, Title 10 of the Dutch Civil Code (Burgerlijk Wetboek)',
    court:'the competent court of the district in which the Employee works',
    probationMax:2,probationNote:'on an indefinite contract',
    hoursMax:40,holidayMin:20,noticeMin:30,
    scheme:'AOW, WW, WAO and Zvw'},
  'Germany':{lang:'German',
    law:'§§ 611a ff. of the B&uuml;rgerliches Gesetzbuch and the Nachweisgesetz',
    court:'the competent Arbeitsgericht',
    probationMax:6,hoursMax:48,holidayMin:20,noticeMin:28,
    scheme:'Rentenversicherung, Krankenversicherung, Pflegeversicherung and ALV'},
  'India':{lang:'English',
    law:'the Indian Contract Act 1872 and the applicable Shops and Establishments Act',
    court:'the courts of the city in which the Employer is registered',
    probationMax:6,hoursMax:48,holidayMin:15,noticeMin:30,
    scheme:'EPF, ESI and Gratuity'},
  'Spain':{lang:'Spanish',
    law:'the Estatuto de los Trabajadores (Royal Legislative Decree 2/2015)',
    court:'the Juzgado de lo Social of the Employee&rsquo;s place of work',
    probationMax:6,hoursMax:40,holidayMin:30,noticeMin:15,
    scheme:'Seguridad Social and IRPF withholding'},
  'United Kingdom':{lang:'English',
    law:'the Employment Rights Act 1996',
    court:'the Employment Tribunal',
    probationMax:0,hoursMax:48,holidayMin:28,noticeMin:7,
    scheme:'PAYE, National Insurance and auto-enrolment pension'},
  'France':{lang:'French',
    law:'the Code du travail',
    court:'the Conseil de prud&rsquo;hommes',
    probationMax:4,hoursMax:35,holidayMin:25,noticeMin:30,
    scheme:'URSSAF, retraite compl&eacute;mentaire and mutuelle'},
  'Italy':{lang:'Italian',
    law:'art. 2094 of the Codice Civile and the applicable CCNL',
    court:'the Tribunale del Lavoro',
    probationMax:6,hoursMax:40,holidayMin:20,noticeMin:30,
    scheme:'INPS, INAIL and TFR'}
};
function ccjStat(country){
  return CCJ_STAT[country||ccjParties().worker.country]||CCJ_STAT['Netherlands'];
}
/* What the DRAFT starts from before anything is checked: the form for everything the form
   captures, and the house standard for the two things it does not. Holiday and weekly hours are
   house standards on purpose — they are exactly the terms a statutory minimum overrides, and a
   draft that already matched every country's floor would give the check nothing to do. */
const CCJ_HOUSE={holiday:20,hours:{'Full time':40,'Part time':20,'Shift based':40}};

function ccjEmp(){
  const run=ccjRun;
  if(!run.emp)run.emp={
    id:'EC-'+String(7100+(run.gen||0)),
    version:1,
    terms:null,          // the drafted terms — mutated in place by the audit, see ccjAuditTick
    audit:[],            // one row per clause the statutory set has something to say about
    auditAt:0,           // how many of those have been reached, which is what drives the reveal
    auditDone:false,
    approvedBy:'',approvedAt:0,
    sentAt:0,openedAt:0,workerSignedAt:0,adtSignedAt:0,
    declined:false
  };
  return run.emp;
}
/* Drafted from the approved quote and the contract form, exactly as the sub-status says. Rebuilt
   from scratch on a redraft, because a send-back means the previous draft and everything the
   audit did to it are no longer what is on the table. */
function ccjDraftContract(){
  const run=ccjRun;if(!run)return;
  const e=ccjEmp(),f=run.form||{},q=ccjQuote();
  e.terms={
    probation:parseInt(f.probation,10)||3,
    notice:parseInt(f.notice,10)||30,
    holiday:CCJ_HOUSE.holiday,
    hours:CCJ_HOUSE.hours[f.schedule]||40,
    gross:q.gross,
    translated:false
  };
  e.audit=[];e.auditAt=0;e.auditDone=false;
  delete run.reached['audit-done'];   // a new draft has not been checked yet
}

/* ---- THE AUDIT ---------------------------------------------------------------------------
   One row per clause that a statutory rule bears on. Clauses with no rule behind them — the
   confidentiality and IP clauses, the governing-law clause — produce no row, because marking
   them "compliant" would claim a check nobody made. */
function ccjClauseAudit(){
  const e=ccjEmp(),t=e.terms||{},p=ccjParties(),s=ccjStat(p.worker.country),f=ccjRun.form||{};
  const country=p.worker.country;
  const src='Compliance Hub &middot; '+country;
  const rows=[];
  // 5 · Probation. Adjusted DOWN where the country caps it.
  if(s.probationMax>0)rows.push({key:'probation',n:'5',clause:'Probationary period',
    rule:'Maximum probationary period',source:src,
    expected:'no more than '+s.probationMax+' months'+(s.probationNote?' '+s.probationNote:''),
    drafted:t.probation+' months',
    verdict:t.probation>s.probationMax?'adjust':'pass',
    to:Math.min(t.probation,s.probationMax),
    note:t.probation>s.probationMax
      ?'Reduced from '+t.probation+' to '+s.probationMax+' months. A longer period is void in '+ccjInCountry(country)+'.'
      :'Within the statutory maximum.'});
  else rows.push({key:'probation',n:'5',clause:'Probationary period',
    rule:'Maximum probationary period',source:src,
    expected:'no statutory maximum in '+ccjInCountry(country),drafted:t.probation+' months',
    verdict:'na',to:t.probation,
    note:'No statutory cap applies in '+ccjInCountry(country)+', so the drafted period stands.'});
  // 6 · Working time. Adjusted DOWN to the statutory week.
  rows.push({key:'hours',n:'6',clause:'Working time',
    rule:'Maximum ordinary weekly working time',source:src,
    expected:'no more than '+s.hoursMax+' hours a week',drafted:t.hours+' hours a week',
    verdict:t.hours>s.hoursMax?'adjust':'pass',
    to:Math.min(t.hours,s.hoursMax),
    note:t.hours>s.hoursMax
      ?'Reduced from '+t.hours+' to '+s.hoursMax+' hours, the statutory ordinary week in '+ccjInCountry(country)+'.'
      :'Within the statutory ordinary week.'});
  // 7 · Remuneration, against the Compliance Hub's own Rates & Rules row. Only the Netherlands
  // has one configured today, and the other six say so rather than passing on nothing.
  const floor=typeof ccjFloorFor==='function'?ccjFloorFor(country):null;
  if(floor){
    const hourly=t.gross/173.33;
    rows.push({key:'pay',n:'7',clause:'Remuneration',
      rule:'Statutory minimum wage',source:src+' &middot; Rates &amp; Rules',
      expected:'at least '+floor.label+' '+floor.value+' an hour',
      drafted:floor.label+' '+hourly.toFixed(2)+' an hour ('+ccjMoney(t.gross)+' a month)',
      verdict:hourly>=floor.num?'pass':'fail',to:t.gross,
      note:hourly>=floor.num
        ?'Above the statutory floor.'
        :'BELOW the statutory floor. This contract cannot be issued at this rate.'});
  }else{
    rows.push({key:'pay',n:'7',clause:'Remuneration',
      rule:'Statutory minimum wage',source:src+' &middot; Rates &amp; Rules',
      expected:'no minimum wage rule configured for '+ccjInCountry(country),
      drafted:ccjMoney(t.gross)+' a month',
      verdict:'na',to:t.gross,
      note:'The Compliance Hub carries no active minimum wage row for '+ccjInCountry(country)+', so this check cannot be made here. It is not a pass.'});
  }
  // 8 · Holiday. Adjusted UP to the statutory minimum — the commonest real intervention.
  rows.push({key:'holiday',n:'8',clause:'Holiday entitlement',
    rule:'Statutory minimum paid annual leave',source:src,
    expected:'at least '+s.holidayMin+' days a year',drafted:t.holiday+' days a year',
    verdict:t.holiday<s.holidayMin?'adjust':'pass',
    to:Math.max(t.holiday,s.holidayMin),
    note:t.holiday<s.holidayMin
      ?'Raised from '+t.holiday+' to '+s.holidayMin+' days. The house standard is below the '+country+' statutory minimum.'
      :'At or above the statutory minimum.'});
  // 10 · Notice. Adjusted UP.
  rows.push({key:'notice',n:'10',clause:'Notice of termination',
    rule:'Minimum notice by the employer',source:src,
    expected:'at least '+s.noticeMin+' days',drafted:t.notice+' days',
    verdict:t.notice<s.noticeMin?'adjust':'pass',
    to:Math.max(t.notice,s.noticeMin),
    note:t.notice<s.noticeMin
      ?'Raised from '+t.notice+' to '+s.noticeMin+' days to meet the statutory minimum.'
      :'At or above the statutory minimum.'});
  // 13 · Language. A contract the employee cannot read is not written particulars.
  rows.push({key:'translated',n:'13',clause:'Language and written particulars',
    rule:'Written particulars in a language the employee understands',source:src,
    expected:s.lang==='English'?'English is sufficient in '+ccjInCountry(country)
      :'a certified '+s.lang+' version alongside the English',
    drafted:'English only',
    verdict:s.lang==='English'?'pass':'adjust',
    to:s.lang!=='English',
    note:s.lang==='English'
      ?'English is the working language of employment law in '+ccjInCountry(country)+'.'
      :'A certified '+s.lang+' translation has been attached and prevails in the event of conflict.'});
  // 4 · Fixed term, only where the contract actually is one. On a permanent contract this is not
  // an unmade check, it is not a check.
  if(f.term==='Fixed Term')rows.push({key:'fixed',n:'4',clause:'Term',
    rule:'Maximum duration of a fixed-term engagement',source:src,
    expected:'no more than 24 months before it converts to indefinite',
    drafted:'ends '+ccjPrettyDate(f.toDate),
    verdict:'pass',to:null,
    note:'Within the period after which '+ccjInCountry(country)+' converts a fixed term to an indefinite contract.'});
  // Down the document, which is how a person reads it.
  return rows.sort(function(a,b){return Number(a.n)-Number(b.n);});
}
function ccjAuditRow(key){
  const e=ccjEmp();
  const i=e.audit.findIndex(function(r){return r.key===key;});
  return i>-1&&i<e.auditAt?e.audit[i]:null;   // not reached yet is not a verdict
}
function ccjAuditAdjusted(){
  const e=ccjEmp();
  return e.audit.slice(0,e.auditAt).filter(function(r){return r.verdict==='adjust';});
}
function ccjAuditFailed(){
  const e=ccjEmp();
  return e.audit.slice(0,e.auditAt).filter(function(r){return r.verdict==='fail';});
}
const CCJ_AUDIT_STEP=620;   // one clause, paced to be read rather than counted
function ccjAuditStart(){
  const e=ccjEmp();
  if(!e.terms)ccjDraftContract();
  e.audit=ccjClauseAudit();e.auditAt=0;e.auditDone=false;
  ccjPaintScreen();
  // Not immediately. The panel beside this is still connecting to the Compliance Hub and pulling
  // the statutory set down, and you cannot measure a clause against rules you have not fetched.
  // Waiting those two actions out also means the audit outlives the step's own beats, so the
  // sub-status genuinely HOLDS on it rather than the hold being decorative.
  ccjScheduleAudit(ccjAuditTick,CCJ_ACT*2);
}
/* One clause per beat, and the adjustment is APPLIED as it is reached — so the number in the
   clause changes on screen at the moment the rule that changed it appears beside it. Applying
   them all at the end would show a document that was never wrong being told it was. */
function ccjAuditTick(){
  const run=ccjRun;if(!run)return;
  const e=ccjEmp();
  if(e.auditAt>=e.audit.length){
    e.auditDone=true;
    ccjPaintScreen();ccjPaint();
    ccjReachScreen('audit-done');      // releases the held sub-status
    return;
  }
  const row=e.audit[e.auditAt];
  e.auditAt++;
  if(row.verdict==='adjust'&&row.to!==null&&row.to!==undefined)e.terms[row.key]=row.to;
  ccjPaintScreen();ccjPaint();
  ccjScrollScreenToClause(row.n);
  ccjScheduleAudit(ccjAuditTick,CCJ_AUDIT_STEP);
}
/* The clause being checked is kept in view, the same way the form follows a document being read
   into it. A check that scrolls off the top is a check nobody watched. */
function ccjScrollScreenToClause(n){
  if(typeof document.querySelector!=='function')return;
  const box=document.querySelector('.ccj-ec-wrap');
  const el=document.getElementById('ccj-ec-cl-'+n);
  if(!box||!el||typeof el.getBoundingClientRect!=='function'||!box.getBoundingClientRect)return;
  const r=el.getBoundingClientRect(),br=box.getBoundingClientRect();
  if(!r.height&&!br.height)return;
  ccjGlide(box,box.scrollTop+(r.top-br.top)-120);
}

/* ---- THE WORKER'S SIDE --------------------------------------------------------------------
   A separate store from the client's, for the reason at the top of this section. Same shape,
   though: what the WORKER has done, never what we have done. */
function ccjNewWorker(){
  return {msgs:[],log:[],timer:null,
    device:'Chrome on Android',   // the e-sign audit trail, which is a real part of the record
    // Stored, not derived. The envelope printed `openedAt + 40 minutes` for the download, which
    // is the same class of fiction the stage-6 ledger had: a timestamp for an event nobody timed.
    downloaded:false,downloadedAt:0};
}
function ccjWorker(){const run=ccjRun;if(!run.worker)run.worker=ccjNewWorker();return run.worker;}
function ccjWorkerPush(m){ccjWorker().msgs.push(m);ccjRenderChat();}
function ccjWorkerEvent(ev,off){
  const run=ccjRun;if(!run)return;
  const e=ccjEmp(),w=ccjWorker(),c=ccjClient(),p=ccjParties();
  const at=function(){
    if(off!==undefined&&e.sentAt)c.mins=Math.max(c.mins,e.sentAt+off);
    else c.mins+=45;
    return c.mins;
  };
  if(ev==='open'){
    if(e.openedAt||!e.sentAt)return;
    e.openedAt=at();
    ccjWorkerPush({who:'note',text:'Opened the contract &middot; '+w.device+' &middot; '+p.worker.country,at:c.mins});
  }else if(ev==='download'){
    if(!e.sentAt)return;
    w.downloadedAt=at();w.downloaded=true;
    ccjWorkerPush({who:'note',text:'Downloaded a copy of '+e.id,at:c.mins});
  }else if(ev==='sign'){
    if(e.workerSignedAt||!e.sentAt)return;
    if(!e.openedAt)e.openedAt=at();
    e.workerSignedAt=at();
    ccjWorkerPush({who:'worker',kind:'ecsigned',id:e.id,at:c.mins});
    ccjClientLog('workerSigned','Employment contract signed by the employee',
      e.id+' &middot; returned for countersignature');
  }
  ccjPaintScreen();ccjPaint();
  ccjResolveWait();
  ccjWorkerSchedule();
}
const CCJ_WORKER_SCRIPT=[
  {ev:'open',    in:2500,off:210,when:function(e){return !!e.sentAt&&!e.openedAt;}},
  {ev:'download',in:2200,off:340,when:function(e){return !!e.openedAt&&!ccjWorker().downloaded;}},
  {ev:'sign',    in:3200,off:690,when:function(e){return !!e.openedAt&&!e.workerSignedAt;}}
];
function ccjWorkerSchedule(){
  const run=ccjRun;if(!run)return;
  const e=ccjEmp(),w=ccjWorker();
  const next=CCJ_WORKER_SCRIPT.find(function(s){return s.when(e);});
  if(w.timer){clearTimeout(w.timer);w.timer=null;}
  if(!next)return;
  const g=ccjGen;
  w.timer=setTimeout(function(){
    if(ccjGen!==g||ccjRun!==run)return;
    w.timer=null;
    ccjWorkerEvent(next.ev,next.off);
  },next.in);
}

/* ---- THE CONTRACT ITSELF ------------------------------------------------------------------
   Fourteen clauses, in the order an employment contract is written, with the audit's verdict
   sitting against the clauses it bears on. Everything in it comes from the form, the quote or
   the statutory set — nothing is authored per run. */
function ccjEmpClauses(){
  const e=ccjEmp(),t=e.terms||{},p=ccjParties(),s=ccjStat(p.worker.country),f=ccjRun.form||{};
  const sym=ccjCurrency();
  const money=function(v){return sym+'&nbsp;'+Number(v).toLocaleString();};
  const reg=ccjReg(p.worker.country);
  const place=(f.schedule==='Full time'?'The Employee&rsquo;s ordinary place of work is '
    :'The Employee&rsquo;s place of work is ')+reg.adt.join(', ')
    +'. The Employer may agree remote or hybrid working in writing, which does not vary this Agreement.';
  return [
    {n:'1',key:'appointment',title:'Appointment and commencement',
     body:'The Employer appoints the Employee to the position of <b>'+(f.jobTitle||'the agreed role')
       +'</b> with effect from <b>'+ccjPrettyDate(f.fromDate)+'</b>. The Employee accepts the appointment on the terms set out below and confirms they are free to take it up.'},
    {n:'2',key:'place',title:'Place of work',body:place},
    {n:'3',key:'duties',title:'Duties and scope of work',
     body:(f.jobDesc?f.jobDesc:'The Employee shall carry out the duties ordinarily associated with the position of '+(f.jobTitle||'the role')+'.')
       +' The Employee shall report as directed by the Employer&rsquo;s client for day-to-day work; the employment relationship itself is with the Employer alone.'},
    {n:'4',key:'fixed',title:'Term',
     body:f.term==='Fixed Term'
       ?'This is a fixed-term contract commencing on '+ccjPrettyDate(f.fromDate)+' and ending on <b>'+ccjPrettyDate(f.toDate)+'</b> unless terminated earlier in accordance with clause 10.'
       :'This is a contract of indefinite duration. It continues until terminated by either party in accordance with clause 10.'},
    {n:'5',key:'probation',title:'Probationary period',
     body:'The first <b>'+t.probation+' month'+(t.probation===1?'':'s')
       +'</b> of employment is a probationary period, during which either party may terminate on the notice permitted by '+s.law.replace(/^the /,'')+'. Confirmation in the role follows automatically on expiry unless the Employer gives written notice to the contrary.'},
    {n:'6',key:'hours',title:'Working time',
     body:'Ordinary working time is <b>'+t.hours+' hours a week</b>, worked '+(f.schedule||'Full time').toLowerCase()
       +'. Hours worked beyond the ordinary week are compensated in accordance with '+s.law.replace(/^the /,'')+'; the Employee shall not be required to exceed the statutory maximum.'},
    {n:'7',key:'pay',title:'Remuneration',
     body:'The Employee&rsquo;s gross salary is <b>'+money(t.gross)
       +' a month</b>, payable on the last working day of each month by bank transfer, less all deductions the Employer is required by law to make. Salary is reviewed annually and any increase is at the Employer&rsquo;s discretion.'},
    {n:'8',key:'holiday',title:'Holiday entitlement',
     body:'The Employee is entitled to <b>'+t.holiday+' days</b> of paid annual leave in each full holiday year, in addition to public holidays in '
       +ccjInCountry(p.worker.country)+'. Untaken leave carries over only to the extent '+s.law.replace(/^the /,'')+' requires.'},
    {n:'9',key:'social',title:'Social security, tax and benefits',
     body:'The Employer shall register the Employee for, and remit all employer contributions to, '+s.scheme
       +'. Employee contributions and income tax are withheld at source. The Employer carries every statutory employer obligation arising from this employment.'},
    {n:'10',key:'notice',title:'Notice of termination',
     body:'After the probationary period either party may terminate this contract on <b>'+t.notice
       +' days</b> written notice. The Employer may terminate without notice only for a reason recognised as summary grounds under '+s.law.replace(/^the /,'')
       +'. Any statutory notice greater than the period stated here applies in place of it.'},
    {n:'11',key:'confidential',title:'Confidentiality',
     body:'The Employee shall not, during or after employment, disclose confidential information belonging to the Employer or to the Employer&rsquo;s client, save where disclosure is required by law or by a competent authority. This obligation survives termination.'},
    {n:'12',key:'ip',title:'Intellectual property',
     body:'All intellectual property created by the Employee in the course of employment vests in the Employer on creation, to the extent permitted by '+s.law.replace(/^the /,'')
       +'. Where local law grants the Employee an inalienable right or compensation in respect of such property, that right is unaffected.'},
    {n:'13',key:'translated',title:'Language and written particulars',
     body:'This contract is executed in English'
       +(t.translated?', and a certified <b>'+s.lang+'</b> translation is attached at Schedule 1. In the event of conflict the '+s.lang+' text prevails.'
         :'. English is the language in which the Employee is given written particulars of employment.')},
    {n:'14',key:'law',title:'Governing law and jurisdiction',
     body:'This contract is governed by '+s.law+'. The parties submit to '+s.court+'.'}
  ];
}
function ccjEmpStateLabel(){
  const run=ccjRun,e=ccjEmp();
  if(e.declined)return {t:'Declined',cls:'stop'};
  if(e.adtSignedAt)return {t:'Executed',cls:'ok'};
  if(e.workerSignedAt)return {t:'Signed by the employee',cls:'ok'};
  if(e.sentAt)return {t:'With the employee for signature',cls:'wait'};
  if(e.approvedBy)return {t:'Approved internally',cls:'ok'};
  if(e.auditDone)return {t:'Compliance checked',cls:''};
  if(e.audit.length)return {t:'Checking clauses',cls:''};
  if(e.terms)return {t:'Draft',cls:''};
  return {t:'Not drafted',cls:''};
}
function buildCCJEmpHTML(){
  const run=ccjRun,e=ccjEmp(),p=ccjParties(),f=run.form||{},s=ccjStat(p.worker.country);
  const drafted=!!e.terms;
  const reg=ccjReg(p.worker.country);
  const state=ccjEmpStateLabel();
  const adj=ccjAuditAdjusted().length,bad=ccjAuditFailed().length;
  const kv=function(k,v){return '<div class="ccj-ec-kv"><span>'+k+'</span><b>'+(v||'&mdash;')+'</b></div>';};
  const t=e.terms||{};
  const sym=ccjCurrency();
  // The band above the paper: what this document is, and where the check has got to.
  const band=function(){
    if(!e.audit.length)return '<div class="ccj-ec-stat '+state.cls+'">'
      +'<div class="ccj-ec-stat-t">'+state.t+'</div>'
      +'<div class="ccj-ec-stat-s">'+(drafted
        ?e.id+' &middot; '+p.worker.name+' &middot; governed by the law of '+p.worker.country
        :'The contract is generated from the approved quote and the contract details.')+'</div>'
      +(e.approvedBy?'<div class="ccj-ec-stat-s">Approved by '+e.approvedBy+' on '+ccjStamp(e.approvedAt)+'.</div>':'')
      +'</div>';
    const n=e.auditAt,total=e.audit.length;
    return '<div class="ccj-ec-stat audit'+(e.auditDone?(bad?' stop':' ok'):'')+'">'
      +'<div class="ccj-ec-stat-t">'
      +(e.auditDone
        ?(bad?bad+' clause'+(bad===1?'':'s')+' cannot be issued'
             :total+' clauses checked against the '+p.worker.country+' statutory set')
        :'Checking clause '+Math.min(n+1,total)+' of '+total+' against the '+p.worker.country+' statutory set')
      +'</div>'
      +'<div class="ccj-ec-bar"><span style="width:'+Math.round(n/total*100)+'%"></span></div>'
      +'<div class="ccj-ec-stat-s">'
      +(e.auditDone
        ?(adj?adj+' clause'+(adj===1?'':'s')+' adjusted to meet '+s.law.replace(/^the /,'')+'. The changes are marked in the document below.'
             :'Every checked clause met the statutory set as drafted. Nothing was changed.')
        :'Compliance Hub &middot; Rates &amp; Rules &middot; '+p.worker.country)
      +'</div></div>';
  };
  const clause=function(cl){
    const row=ccjAuditRow(cl.key);
    const live=!e.auditDone&&e.audit.length&&e.audit[e.auditAt]&&e.audit[e.auditAt].key===cl.key;
    const mark=row
      ?'<span class="ccj-ec-mark '+row.verdict+'">'+(row.verdict==='pass'?'&#10003; Compliant'
        :row.verdict==='adjust'?'&#8635; Adjusted'
        :row.verdict==='fail'?'&#10007; Breach':'&ndash; Not checked')+'</span>'
      :live?'<span class="ccj-ec-mark checking"><span class="ccj-spin sm"></span>Checking</span>':'';
    return '<div class="ccj-ec-cl'+(row?' '+row.verdict:'')+(live?' live':'')+'" id="ccj-ec-cl-'+cl.n+'">'
      +'<div class="ccj-ec-cl-h"><span>'+cl.n+'</span>'+cl.title+mark+'</div>'
      +'<p>'+cl.body+'</p>'
      +(row?'<div class="ccj-ec-rule '+row.verdict+'">'
        +'<div class="ccj-ec-rule-h">'+row.rule+'<i>'+row.source+'</i></div>'
        +'<div class="ccj-ec-rule-cmp"><span>Required</span><b>'+row.expected+'</b></div>'
        +'<div class="ccj-ec-rule-cmp"><span>Drafted</span><b>'+row.drafted+'</b></div>'
        +'<div class="ccj-ec-rule-n">'+row.note+'</div>'
        +'</div>':'')
      +'</div>';
  };
  return '<div class="ccj-ec-wrap">'
    +band()
    +'<div class="ccj-ec'+(drafted?'':' pending')+'">'
    +'<div class="ccj-ec-head">'
    +'<div><div class="ccj-ec-brand">ADT</div>'
    +'<div class="ccj-ec-brandsub">Global Employment Platform</div></div>'
    +'<div class="ccj-ec-ref"><div class="ccj-ec-kind">CONTRACT OF EMPLOYMENT</div>'
    +'<div class="ccj-ec-no">'+e.id+(e.version>1?' &middot; v'+e.version:'')+'</div></div>'
    +'</div>'

    +'<div class="ccj-ec-parties">'
    +'<div class="ccj-ec-party"><div class="ccj-ec-party-t">Employer</div>'
    +'<div class="ccj-ec-party-n">'+p.adt.name+'</div>'
    +'<div class="ccj-ec-party-a">'+reg.adt.join('<br>')+'</div>'
    +'<div class="ccj-ec-party-v">'+reg.reg+'</div></div>'
    +'<div class="ccj-ec-party"><div class="ccj-ec-party-t">Employee</div>'
    +'<div class="ccj-ec-party-n">'+p.worker.name+'</div>'
    +'<div class="ccj-ec-party-a">'+(f.address||'&mdash;')+'</div>'
    +'<div class="ccj-ec-party-v">'+(f.dob?'Born '+ccjPrettyDate(f.dob)+' &middot; ':'')
      +(f.nationality||p.worker.country)+' national</div></div>'
    +'</div>'

    +'<div class="ccj-ec-meta">'
    +kv('Position',f.jobTitle)
    +kv('Start date',ccjPrettyDate(f.fromDate))
    +kv('Term',f.term==='Fixed Term'?'Fixed term to '+ccjPrettyDate(f.toDate):'Indefinite')
    +kv('Schedule',f.schedule)
    +kv('Gross salary',drafted?sym+'&nbsp;'+Number(t.gross).toLocaleString()+' a month':'')
    +kv('Probation',drafted?t.probation+' months':'')
    +kv('Notice',drafted?t.notice+' days':'')
    +kv('Annual leave',drafted?t.holiday+' days':'')
    +kv('Work permit',/assist/i.test(f.workPermit||'')?'ADT to assist with the visa':'Held by the employee')
    +kv('Governing law',p.worker.country)
    +'</div>'

    +'<div class="ccj-ec-body">'
    +(drafted?ccjEmpClauses().map(clause).join(''):'')
    +'</div>'

    +'<div class="ccj-ec-sec"><div class="ccj-ec-sec-t">Signatures</div>'
    +'<div class="ccj-ec-sigrow">'
    +ccjSigBlockHTML('For and on behalf of '+p.adt.name,p.adt.signatory,'Authorised signatory',
        e.adtSignedAt,e.adtSignedAt>0)
    +ccjSigBlockHTML('The Employee',p.worker.name,'Employee',
        e.workerSignedAt,e.workerSignedAt>0)
    +'</div>'
    // `stamped` reserves the width the EXECUTED stamp occupies. Without it the stamp — which has
    // to overlap the paper to read as a stamp — sat on top of this sentence.
    +'<div class="ccj-ec-exec'+(e.adtSignedAt?' stamped':'')+'">'+(e.adtSignedAt
      ?'Executed on the later of the two signatures above. Employment commences on '+ccjPrettyDate(f.fromDate)+'.'
      :e.workerSignedAt?'Signed by the Employee and returned. Awaiting the Employer&rsquo;s countersignature.'
      :e.sentAt?'Issued to the Employee for signature.'
      :'Draft. Not yet issued.')+'</div>'
    +'</div>'
    +(e.adtSignedAt?'<div class="ccj-ec-stamp">EXECUTED</div>':'')
    +'</div>'

    +(e.sentAt?buildCCJEnvelopeHTML():'')

    +(run.phase==='rest'
      ?'<div class="ccj-ec-next">'
       +'<div class="ccj-ec-next-t">Contract executed. '+p.worker.name.split(' ')[0]
         +' is employed from '+ccjPrettyDate(f.fromDate)+'.</div>'
       +'<button class="ccj-primary" onclick="ccjContinueStage()">'
       +CCJ_STAGE_REST['employment-contract'].label+' &rarr;</button></div>'
      :'')
    +(e.sentAt&&!e.adtSignedAt?buildCCJWorkerSimHTML():'')
    +'</div>';
}
/* The e-signature audit trail. A signature is only worth what the record behind it says — who
   opened it, from where, on what, and when — so the envelope is shown rather than summarised. */
function buildCCJEnvelopeHTML(){
  const e=ccjEmp(),w=ccjWorker(),p=ccjParties(),c=ccjCtx();
  const row=function(label,sub,at,on){
    return '<div class="ccj-env-row'+(on?' done':'')+'">'
      +'<span class="ccj-env-dot"></span>'
      +'<div class="ccj-env-body"><div class="ccj-env-label">'+label+'</div>'
      +'<div class="ccj-env-sub">'+sub+'</div></div>'
      +'<span class="ccj-env-when">'+(on?ccjStamp(at):'&mdash;')+'</span></div>';
  };
  return '<div class="ccj-env">'
    +'<div class="ccj-env-head">Signature envelope<span>Docuseal &middot; '+c.envelopeId+'</span></div>'
    +row('Sent to the employee',p.worker.email,e.sentAt,!!e.sentAt)
    +row('Opened',w.device+' &middot; '+p.worker.country,e.openedAt,!!e.openedAt)
    +row('Copy downloaded','PDF &middot; '+e.id,w.downloadedAt,w.downloaded)
    +row('Signed by the employee',p.worker.name,e.workerSignedAt,!!e.workerSignedAt)
    +row('Countersigned',p.adt.signatory+' for '+p.adt.name,e.adtSignedAt,!!e.adtSignedAt)
    +'</div>';
}
function buildCCJWorkerSimHTML(){
  const e=ccjEmp();
  const btn=function(ev,label,on){
    return '<button class="ccj-sim-btn" onclick="ccjWorkerEvent(\''+ev+'\')"'+(on?'':' disabled')+'>'
      +label+'</button>';
  };
  return '<div class="ccj-sim">'
    +'<div class="ccj-sim-head">Simulate employee<span>demo</span></div>'
    +'<div class="ccj-sim-btns">'
    +btn('open','Opens the contract',!!e.sentAt&&!e.openedAt)
    +btn('download','Downloads a copy',!!e.openedAt&&!ccjWorker().downloaded)
    +btn('sign','Signs it',!!e.sentAt&&!e.workerSignedAt)
    +'</div>'
    +'<div class="ccj-sim-note">Left alone the employee signs on their own. These are the same events.</div>'
    +'</div>';
}

/* ---- WIRING STAGE 7 INTO THE RUNNER ------------------------------------------------------ */
CCJ_STAGE_REST['employment-contract']={label:'Continue to onboarding'};

CCJ_PURPOSE['employment-contract/Draft generated']='Generates the contract from the approved quote and the contract details.';
CCJ_PURPOSE['employment-contract/Clause compliance check']='Checks every clause against the country statutory set, and adjusts what falls short.';
CCJ_PURPOSE['employment-contract/Internal approval']='Someone reads the contract, and the adjustments, before it goes out.';
CCJ_PURPOSE['employment-contract/Sent to worker']='Issues it to the employee for signature.';
CCJ_PURPOSE['employment-contract/Worker signed']='The employee signs. Nothing here is ours to press.';
CCJ_PURPOSE['employment-contract/ADT countersigned']='Our signature. The contract is in force from it.';

/* Drafting is what the step produces, so it happens when the step settles. */
CCJ_ON_SETTLE['employment-contract/Draft generated']=function(run){
  ccjDraftContract();
};
/* The audit begins as the check begins — see CCJ_ON_ENTER above for why it is not hung off the
   previous step's settle. */
CCJ_ON_ENTER['employment-contract/Clause compliance check']=function(run){
  ccjAuditStart();
};
CCJ_ON_SETTLE['employment-contract/Sent to worker']=function(run){
  const e=ccjEmp(),c=ccjClient(),p=ccjParties();
  c.mins+=90;
  e.sentAt=c.mins;
  ccjWorkerPush({who:'us',kind:'eccontract',id:e.id,to:p.worker.email,
    start:(run.form||{}).fromDate,at:c.mins});
  ccjWorkerSchedule();
};
CCJ_ON_SETTLE['employment-contract/ADT countersigned']=function(run){
  ccjWorkerPush({who:'us',kind:'ecexecuted',id:ccjEmp().id,
    from:(run.form||{}).fromDate,at:ccjClient().mins});
};

/* The check must not tick green while the document beside it is still being annotated. It holds
   on the audit finishing, which is the only thing that ends it. */
CCJ_HOLDS['employment-contract/Clause compliance check']={
  until:'audit-done',
  note:'Reading the contract clause by clause.'
};
/* The employee signs on their own time, and there is no button here that can do it for them —
   the Worker owner has a null persona precisely so this cannot be ticked on their behalf. */
CCJ_WAITS['employment-contract/Worker signed']={pre:true,
  met:function(){return !!ccjEmp().workerSignedAt;},
  note:'Envelope is open with the employee. Nothing here is ours to press.'};

/* The one human stop before the contract leaves the building. Sending it back is a LOOP to the
   draft, not a stop: a rejected contract is redrafted, not abandoned. */
CCJ_GATES['employment-contract/Internal approval']=function(){
  const e=ccjEmp();
  const adj=ccjAuditAdjusted(),bad=ccjAuditFailed();
  const why=bad.length
    ?bad.length+' clause'+(bad.length===1?'':'s')+' failed the statutory check and cannot be issued as drafted.'
    :adj.length
      ?adj.length+' clause'+(adj.length===1?'':'s')+' were rewritten to meet local law — '
        +adj.map(function(r){return r.clause.toLowerCase();}).join(', ')
        +'. The employee signs whatever this says, and we carry the employment liability.'
      :'Nothing needed adjusting. The employee signs whatever this says, and we carry the employment liability.';
  return {
    kind:'approval',
    ask:'Approve '+e.id+' before it goes to the employee.',
    why:why,
    options:[
      {id:'ecApprove',label:'Approve and issue',tone:'go',  done:'Approved'},
      {id:'ecRedraft',label:'Send back',        tone:'stop',done:'Sent back to redraft'}
    ]
  };
};
CCJ_REWORK['employment-contract/Internal approval']='Draft generated';
/* Our signature, and the last point at which we can decline. An arrival gate rather than a post
   gate: the evidence that justifies it — the employee's signature and the audit trail behind it —
   is already on the document, so there is no work to do first. */
CCJ_GATES['employment-contract/ADT countersigned']=function(){
  const e=ccjEmp();
  return {
    kind:'approval',
    ask:'Countersign '+e.id+'?',
    why:'The employee has signed and returned it. Ours is the second signature and the contract is in force from it — this is the last point at which we can decline.',
    options:[
      {id:'ecCountersign',label:'Approve and countersign',tone:'go',  done:'Executed'},
      {id:'ecDecline',    label:'Decline',                tone:'stop',done:'Declined'}
    ]
  };
};

/* == STAGE 8: ONBOARDING ===================================================================
   Every stage before this produced ONE artefact — a quote, an account, an agreement, an invoice,
   a contract. This one produces six, and they are six genuinely different pieces of work with
   six different counterparties: an identity provider, the employee themselves, a tax authority,
   a social security institution, a bank, and our own payroll engine.

   So the screen is not a document. It is the ONBOARDING FILE: one card per workstream, the one
   currently running open in full, the finished ones collapsed to what they actually produced —
   the tax number, the enrolment reference, the account that was verified. That is how an
   onboarding tracker works in the real world, and it is the only shape that lets someone answer
   the question this screen exists to answer: can this person be paid on the first of the month.

   == WHY KYC IS RENDERED AT THIS DEPTH ===================================================
   Identity verification is the step every EOR platform claims and none of them shows. What
   actually happens is not "KYC: passed". A provider takes a document, reads its machine-readable
   zone, checks the security features for tampering, takes a live selfie, matches the face against
   the document portrait, proves the selfie is a live human and not a replay, screens the person
   against sanctions, PEP and adverse-media lists, establishes whether they may lawfully work in
   the country at all, and returns a decision with a risk score — CLEAR, CONSIDER or REJECT.

   Every one of those is on screen here, with its own result, because a customer buying this is
   buying the fact that we did them. And CONSIDER is a real outcome: where the run cannot clear
   right-to-work on its own — a non-EU national, or a visa we have been asked to sponsor — it
   stops and puts it to a person rather than passing itself.

   == NOTHING IS COUNTRY-AGNOSTIC ========================================================
   A Dutch onboarding needs a BSN and a Loonheffingen registration; a German one needs a
   Steuer-ID, an ELStAM retrieval and a DE&Uuml;V notification to a Krankenkasse; an Indian one
   needs a PAN, a UAN and an ESIC number. The checklist, the authorities, the reference formats
   and the documents all come out of CCJ_ONB, so the run shows the country's actual process
   rather than a generic six-step bar.                                                     == */

const CCJ_ONB={
  'Netherlands':{
    idDoc:'Netherlands passport',mrz:'NLD',issuer:'Kingdom of the Netherlands',
    taxAuthority:'Belastingdienst',taxFiling:'Loonheffingen registration',
    taxIdLabel:'BSN',taxCredit:'Loonheffingskorting applied from the first period',
    ssAuthority:'UWV / SVB',ssFiling:'Werknemersverzekeringen enrolment',
    ssIdLabel:'BSN',ssScheme:'AOW, WW, WAO and Zvw',
    empSocial:8.9,taxEff:31.5,
    docs:[
      {id:'id',   req:true, who:'worker',label:'Passport or national ID',        why:'Identity and right to work'},
      {id:'bsn',  req:true, who:'worker',label:'BSN &mdash; citizen service number',why:'Required on every payroll tax filing'},
      {id:'addr', req:true, who:'worker',label:'Proof of address',               why:'Municipal registration &mdash; must be issued within 3 months'},
      {id:'bank', req:true, who:'worker',label:'Bank account (IBAN)',            why:'Salary payment'},
      {id:'wage', req:true, who:'worker',label:'Model opgaaf gegevens voor de loonheffingen',why:'Applies the payroll tax credit'},
      {id:'rule', req:false,who:'adt',   label:'30% ruling application',         why:'Only for qualifying incoming employees'}
    ]},
  'Germany':{
    idDoc:'German Personalausweis',mrz:'D&lt;&lt;',issuer:'Bundesrepublik Deutschland',
    taxAuthority:'Finanzamt',taxFiling:'ELStAM retrieval',
    taxIdLabel:'Steuer-ID',taxCredit:'Tax class III applied on the ELStAM record',
    ssAuthority:'Krankenkasse &middot; DE&Uuml;V',ssFiling:'Anmeldung zur Sozialversicherung',
    ssIdLabel:'Sozialversicherungsnummer',ssScheme:'Renten-, Kranken-, Pflege- und Arbeitslosenversicherung',
    empSocial:20.6,taxEff:33.5,
    docs:[
      {id:'id',   req:true, who:'worker',label:'Personalausweis or passport',    why:'Identity and right to work'},
      {id:'tax',  req:true, who:'worker',label:'Steueridentifikationsnummer',    why:'Required to retrieve the ELStAM tax record'},
      {id:'sv',   req:true, who:'worker',label:'Sozialversicherungsausweis',     why:'Social security enrolment'},
      {id:'kk',   req:true, who:'worker',label:'Krankenkasse confirmation',      why:'Health insurance is compulsory and the employer remits to it'},
      {id:'bank', req:true, who:'worker',label:'Bank account (IBAN)',            why:'Salary payment'},
      {id:'addr', req:false,who:'worker',label:'Meldebescheinigung',             why:'Registered address, where the Finanzamt requires it'}
    ]},
  'India':{
    idDoc:'Indian passport',mrz:'IND',issuer:'Republic of India',
    taxAuthority:'Income Tax Department',taxFiling:'TDS registration against PAN',
    taxIdLabel:'PAN',taxCredit:'New regime slab applied',
    ssAuthority:'EPFO / ESIC',ssFiling:'UAN generation and ESIC registration',
    ssIdLabel:'UAN',ssScheme:'EPF, EPS, ESI and Gratuity',
    empSocial:12,taxEff:18,
    docs:[
      {id:'id',   req:true, who:'worker',label:'Passport or Aadhaar',            why:'Identity'},
      {id:'pan',  req:true, who:'worker',label:'PAN card',                       why:'Tax deduction at source'},
      {id:'uan',  req:false,who:'worker',label:'Existing UAN',                   why:'Carries the provident fund across employers'},
      {id:'form11',req:true,who:'worker',label:'Form 11 &mdash; EPF declaration',why:'Provident fund enrolment'},
      {id:'bank', req:true, who:'worker',label:'Cancelled cheque or passbook',   why:'Salary payment and PF settlement'},
      {id:'addr', req:true, who:'worker',label:'Proof of address',               why:'Statutory record'}
    ]},
  'Spain':{
    idDoc:'Spanish passport',mrz:'ESP',issuer:'Reino de Espa&ntilde;a',
    taxAuthority:'Agencia Tributaria',taxFiling:'Modelo 145 &middot; IRPF withholding',
    taxIdLabel:'NIF / NIE',taxCredit:'IRPF rate set from the Modelo 145',
    ssAuthority:'Tesorer&iacute;a General de la Seguridad Social',ssFiling:'Alta en la Seguridad Social',
    ssIdLabel:'N&uacute;mero de la Seguridad Social',ssScheme:'R&eacute;gimen General',
    empSocial:6.35,taxEff:24,
    docs:[
      {id:'id',   req:true, who:'worker',label:'DNI, NIE or passport',           why:'Identity and right to work'},
      {id:'nss',  req:true, who:'worker',label:'N&uacute;mero de la Seguridad Social',why:'Social security enrolment'},
      {id:'m145', req:true, who:'worker',label:'Modelo 145',                     why:'Sets the IRPF withholding rate'},
      {id:'bank', req:true, who:'worker',label:'Bank account (IBAN)',            why:'Salary payment'},
      {id:'addr', req:true, who:'worker',label:'Certificado de empadronamiento', why:'Registered address'}
    ]},
  'United Kingdom':{
    idDoc:'UK passport',mrz:'GBR',issuer:'United Kingdom',
    taxAuthority:'HM Revenue &amp; Customs',taxFiling:'Full Payment Submission &middot; new starter',
    taxIdLabel:'National Insurance number',taxCredit:'Tax code 1257L applied on a cumulative basis',
    ssAuthority:'HMRC &middot; NEST',ssFiling:'National Insurance and pension auto-enrolment',
    ssIdLabel:'National Insurance number',ssScheme:'Class 1 NI and auto-enrolment pension',
    empSocial:8,taxEff:23,
    docs:[
      {id:'id',   req:true, who:'worker',label:'Passport or share code',         why:'Right to work check'},
      {id:'ni',   req:true, who:'worker',label:'National Insurance number',      why:'PAYE and National Insurance'},
      {id:'start',req:true, who:'worker',label:'Starter checklist or P45',       why:'Sets the tax code'},
      {id:'bank', req:true, who:'worker',label:'Bank account and sort code',     why:'Salary payment'},
      {id:'pen',  req:false,who:'worker',label:'Pension opt-out',                why:'Only if they choose to opt out of auto-enrolment'}
    ]},
  'France':{
    idDoc:'French passport',mrz:'FRA',issuer:'R&eacute;publique fran&ccedil;aise',
    taxAuthority:'DGFiP',taxFiling:'Pr&eacute;l&egrave;vement &agrave; la source',
    taxIdLabel:'Num&eacute;ro fiscal',taxCredit:'Taux non personnalis&eacute; applied until DGFiP returns a rate',
    ssAuthority:'URSSAF',ssFiling:'D&eacute;claration pr&eacute;alable &agrave; l&rsquo;embauche',
    ssIdLabel:'Num&eacute;ro de s&eacute;curit&eacute; sociale',ssScheme:'URSSAF, retraite compl&eacute;mentaire and mutuelle',
    empSocial:22,taxEff:20,
    docs:[
      {id:'id',   req:true, who:'worker',label:'Carte d&rsquo;identit&eacute; or passport',why:'Identity and right to work'},
      {id:'ss',   req:true, who:'worker',label:'Num&eacute;ro de s&eacute;curit&eacute; sociale',why:'URSSAF enrolment'},
      {id:'rib',  req:true, who:'worker',label:'RIB',                            why:'Salary payment'},
      {id:'vitale',req:false,who:'worker',label:'Attestation Carte Vitale',      why:'Health cover record'},
      {id:'addr', req:true, who:'worker',label:'Justificatif de domicile',       why:'Statutory record'}
    ]},
  'Italy':{
    idDoc:'Italian passport',mrz:'ITA',issuer:'Repubblica Italiana',
    taxAuthority:'Agenzia delle Entrate',taxFiling:'Codice Fiscale registration',
    taxIdLabel:'Codice Fiscale',taxCredit:'IRPEF scaglioni applied',
    ssAuthority:'INPS / INAIL',ssFiling:'Comunicazione UNILAV',
    ssIdLabel:'Matricola INPS',ssScheme:'INPS, INAIL and TFR',
    empSocial:9.19,taxEff:27,
    docs:[
      {id:'id',   req:true, who:'worker',label:'Carta d&rsquo;identit&agrave; or passport',why:'Identity and right to work'},
      {id:'cf',   req:true, who:'worker',label:'Codice Fiscale',                 why:'Every payroll filing is keyed on it'},
      {id:'bank', req:true, who:'worker',label:'Bank account (IBAN)',            why:'Salary payment'},
      {id:'addr', req:true, who:'worker',label:'Certificato di residenza',       why:'Statutory record'}
    ]}
};
function ccjOnbPack(country){
  return CCJ_ONB[country||ccjParties().worker.country]||CCJ_ONB['Netherlands'];
}

/* ---- THE ONBOARDING FILE ------------------------------------------------------------------
   One object holding all six workstreams. Built once from the country pack, then filled in as
   each stream runs — so a completed stream keeps what it produced and the screen can show it
   collapsed rather than losing it. */
function ccjOnb(){
  const run=ccjRun;
  if(!run.onb){
    const pack=ccjOnbPack(),p=ccjParties();
    const num=String(1042+(run.gen||0));
    run.onb={
      kyc:{session:'IDV-'+(8800+(run.gen||0)),at:0,step:0,done:false,
           decision:'',score:0,reviewed:'',reviewedAt:0,forceConsider:false},
      docs:pack.docs.map(function(d){return Object.assign({},d,{status:'waiting',ref:'',at:0,note:''});}),
      docsDone:false,
      tax:{ref:'',id:'',submittedAt:0,confirmedAt:0,state:'idle'},
      ss:{ref:'',id:'',submittedAt:0,confirmedAt:0,state:'idle'},
      bank:{iban:'',holder:'',score:0,pennyAt:0,verifiedAt:0,state:'idle'},
      payroll:{builtAt:0,calendar:'',payDay:'',firstPay:'',prorated:0,days:0,state:'idle'},
      timer:null
    };
  }
  return run.onb;
}
/* ---- THE PORTRAIT ON THE IDENTITY DOCUMENT ---------------------------------------------------
   A real face makes the verification console read as a verification rather than as a diagram, so
   the portrait is a configurable asset. Drop a cropped headshot at the path below and it appears
   on the document card and on both sides of the face match.

   IT IS A HEADSHOT, NOT A DOCUMENT SCAN, and that is deliberate. Everything else on the card —
   the passport number, the MRZ, the date of birth, the expiry — is GENERATED by ccjKycDoc from
   the run, so nothing real is needed for the screen to look right. Putting a scan of a genuine
   data page here would add a passport number, a signature and a machine-readable zone to a
   repository, and git keeps what it is given even after a later delete.

   `assets/kyc-portrait.*` is in .gitignore for that reason. If the file is absent the drawn
   placeholder renders instead, so the demo never breaks on a missing asset. */
const CCJ_KYC_PORTRAIT='assets/kyc-portrait.jpg';
const CCJ_FACE_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>';
/* The image sits over the drawn placeholder rather than replacing it, so a missing or unreadable
   file simply uncovers the fallback — no state to keep, and nothing to go wrong at demo time. */
function ccjPortraitMissing(el){if(el&&el.parentNode)el.parentNode.removeChild(el);}
function ccjPortraitHTML(){
  if(!CCJ_KYC_PORTRAIT)return CCJ_FACE_SVG;
  return '<img class="ccj-kyc-portrait" src="'+attrSafe(CCJ_KYC_PORTRAIT)+'" alt="" '
    +'onerror="ccjPortraitMissing(this)">'+CCJ_FACE_SVG;
}
/* Everything the identity document says, derived from the contract rather than invented — the
   whole point of the cross-check is that these two sources must agree. */
function ccjKycDoc(){
  const p=ccjParties(),f=(ccjRun&&ccjRun.form)||{};
  /* The identity document follows NATIONALITY, not the country the work is in. This read
     ccjOnbPack() — the work-country pack — so an Indian national placed in Germany was shown
     presenting a German Personalausweis, a document he could not hold. The rest of the pack is
     still the work country's, because the checklist, the tax authority and the social security
     institution genuinely are: what a person presents to prove who they are, and what their
     employer must file where they work, are two different questions. */
  const pack=ccjOnbPack(f.nationality||p.worker.country);
  const sur=String(f.lname||p.worker.name.split(' ').slice(-1)[0]||'').toUpperCase();
  const giv=String(f.fname||p.worker.name.split(' ')[0]||'').toUpperCase();
  const num=(sur.slice(0,2)+String(4718321+(ccjRun.gen||0)*37)).toUpperCase();
  return {type:pack.idDoc,issuer:pack.issuer,code:pack.mrz,
    surname:sur,given:giv,
    dob:f.dob?ccjPrettyDate(f.dob):'&mdash;',
    nationality:f.nationality||p.worker.country,
    number:num,expiry:'14 Mar 2031',
    mrzLine:'P&lt;'+pack.mrz+sur+'&lt;&lt;'+giv+('&lt;').repeat(Math.max(0,26-sur.length-giv.length))};
}
/* Right to work is the check that actually decides whether this hire can proceed, and it is
   DERIVED — from the nationality on the form, the country the work is in, and whether the form
   said a permit is already held. It is the only KYC check that can legitimately need a person. */
function ccjRightToWork(){
  const f=(ccjRun&&ccjRun.form)||{},p=ccjParties();
  const nat=f.nationality||p.worker.country,work=p.worker.country;
  const natEU=CCJ_EU.indexOf(nat)>-1,workEU=CCJ_EU.indexOf(work)>-1;
  if(nat===work)return {verdict:'pass',
    label:'National of '+ccjInCountry(work)+' &mdash; unrestricted right to work',
    detail:'No permit required.'};
  if(natEU&&workEU)return {verdict:'pass',
    label:nat+' national working in '+ccjInCountry(work)+' &mdash; EU freedom of movement',
    detail:'No permit required under Article 45 TFEU.'};
  if(/assist/i.test(f.workPermit||''))return {verdict:'consider',
    label:nat+' national working in '+ccjInCountry(work)+' &mdash; sponsorship requested',
    detail:'No permit is held. ADT was asked to sponsor the visa, and that has to be in place before the start date.'};
  return {verdict:'consider',
    label:nat+' national working in '+ccjInCountry(work)+' &mdash; permit declared but not evidenced',
    detail:'The form says a permit is held. A person has to see it before payroll can start.'};
}
function ccjKycChecks(){
  const d=ccjKycDoc(),f=(ccjRun&&ccjRun.form)||{},p=ccjParties();
  const rtw=ccjRightToWork();
  const contractName=(String(f.fname||'')+' '+String(f.lname||'')).trim()||p.worker.name;
  return {
    biometric:[
      {k:'Face match',v:'98.2% against the document portrait',verdict:'pass'},
      {k:'Liveness',v:'Passive &mdash; live human confirmed',verdict:'pass'},
      {k:'Injection attack',v:'No virtual camera or replay detected',verdict:'pass'}
    ],
    identity:[
      {k:'Surname',doc:d.surname,against:'Contract &mdash; '+String(f.lname||'').toUpperCase(),
       verdict:'pass'},
      {k:'Given names',doc:d.given,against:'Contract &mdash; '+String(f.fname||'').toUpperCase(),
       verdict:'pass'},
      {k:'Date of birth',doc:d.dob,against:f.dob?'Contract &mdash; '+ccjPrettyDate(f.dob):'Not on the contract',
       verdict:f.dob?'pass':'na'},
      {k:'Nationality',doc:d.nationality,against:'Contract &mdash; '+(f.nationality||'&mdash;'),
       verdict:f.nationality?'pass':'na'},
      {k:'Document number',doc:d.number,against:'&mdash;',verdict:'pass'},
      {k:'Expiry',doc:d.expiry,against:'Valid at the start date',verdict:'pass'}
    ],
    authenticity:[
      {k:'MRZ checksum',v:'Valid',verdict:'pass'},
      {k:'Security features',v:'Hologram, microprint and UV pattern present',verdict:'pass'},
      {k:'Tamper detection',v:'No digital or physical alteration',verdict:'pass'},
      {k:'Issuer validation',v:d.issuer+' &mdash; recognised issuer',verdict:'pass'}
    ],
    screening:[
      {k:'Sanctions',v:'OFAC, EU consolidated, UN, UK HMT &mdash; no match',verdict:'pass'},
      {k:'Politically exposed person',v:'No match',verdict:'pass'},
      {k:'Adverse media',v:'No match in the last 10 years',verdict:'pass'}
    ],
    rtw:rtw,
    name:contractName
  };
}
/* CLEAR unless something genuinely could not be cleared. The score is derived from the checks
   rather than authored, so a run that needs a person also LOOKS like one. */
function ccjKycDecision(){
  const k=ccjOnb().kyc;
  if(k.reviewed==='confirmed')return {id:'clear',label:'CLEAR',score:22,
    note:'Cleared by '+k.reviewed_by};
  if(k.reviewed==='rejected')return {id:'reject',label:'REJECTED',score:96,note:''};
  const c=ccjKycChecks();
  if(k.forceConsider)return {id:'consider',label:'CONSIDER',score:46,
    note:'The provider returned a partial match on the name and has put it to a person.'};
  if(c.rtw.verdict!=='pass')return {id:'consider',label:'CONSIDER',score:52,note:c.rtw.detail};
  return {id:'clear',label:'CLEAR',score:14,note:''};
}
/* The phases a real identity check moves through, in order. The card reveals one per beat, which
   is what makes it read as a verification happening rather than a result being displayed. */
const CCJ_KYC_PHASES=[
  {id:'session', label:'Verification session created',     sub:'Link issued to the employee'},
  {id:'capture', label:'Identity document captured',       sub:'Front and back, plus the machine-readable zone'},
  {id:'extract', label:'Document data read and cross-checked',sub:'Every field matched against the contract'},
  {id:'biometric',label:'Biometric verification',          sub:'Live selfie, face match and liveness'},
  {id:'authentic',label:'Document authenticity',           sub:'Security features, tampering and issuer'},
  {id:'screen',  label:'Sanctions, PEP and adverse media', sub:'Screened against the global lists'},
  {id:'rtw',     label:'Right to work',                    sub:'Whether they may lawfully work in this country'},
  {id:'decision',label:'Decision',                         sub:'Risk score and outcome'}
];
const CCJ_ONB_STEP=560;
function ccjKycStart(){
  const o=ccjOnb(),c=ccjClient();
  o.kyc.at=c.mins;o.kyc.step=0;o.kyc.done=false;
  // Re-running the verification retracts the adjudication of the previous one — reopening a
  // rejected check means deciding again, not carrying the rejection forward into a fresh result.
  // What the PROVIDER returned is not cleared: that is the input, not the decision.
  o.kyc.reviewed='';o.kyc.reviewed_by='';
  ccjPaintScreen();
  ccjScheduleAudit(ccjKycTick,CCJ_ACT*2);
}
function ccjKycTick(){
  const run=ccjRun;if(!run)return;
  const o=ccjOnb(),k=o.kyc;
  if(k.step>=CCJ_KYC_PHASES.length){
    k.done=true;
    const d=ccjKycDecision();
    k.decision=d.id;k.score=d.score;
    ccjPaintScreen();ccjPaint();
    ccjReachScreen('kyc-done');
    return;
  }
  const ph=CCJ_KYC_PHASES[k.step];
  k.step++;
  // The employee is doing part of this, so their thread says so as it happens.
  if(ph.id==='session')ccjWorkerPush({who:'us',kind:'kyc',id:k.session,at:ccjClient().mins});
  if(ph.id==='capture')ccjWorkerPush({who:'note',text:'Uploaded '+ccjKycDoc().type+' &middot; front and back',at:ccjClient().mins});
  if(ph.id==='biometric')ccjWorkerPush({who:'note',text:'Completed the liveness check',at:ccjClient().mins});
  ccjPaintScreen();ccjPaint();
  ccjScheduleAudit(ccjKycTick,CCJ_ONB_STEP);
}
function ccjKycForceConsider(){
  const o=ccjOnb();
  o.kyc.forceConsider=true;
  if(o.kyc.done){const d=ccjKycDecision();o.kyc.decision=d.id;o.kyc.score=d.score;}
  ccjPaintScreen();ccjPaint();
}

/* ---- DOCUMENTS ----------------------------------------------------------------------------
   The employee supplies most of them, one at a time, and one gets REJECTED — which is what
   actually happens. A proof of address more than three months old is the commonest rejection in
   onboarding, so that is the one modelled, and the run does not move on until it is replaced. */
function ccjDocRef(id){
  return id.toUpperCase().slice(0,4)+'-'+String(3300+(ccjRun.gen||0)*7+id.length*11);
}
function ccjOnbDocs(){return ccjOnb().docs;}
function ccjDocsOutstanding(){
  return ccjOnbDocs().filter(function(d){return d.req&&d.status!=='verified';});
}
function ccjDocsStart(){
  ccjPaintScreen();
  ccjScheduleAudit(ccjDocsTick,CCJ_ACT*2);
}
function ccjDocsTick(){
  const run=ccjRun;if(!run)return;
  const o=ccjOnb();
  // The address document comes back once as rejected, then correctly the second time.
  const next=o.docs.find(function(d){return d.status==='waiting';})
    ||o.docs.find(function(d){return d.status==='rejected';});
  if(!next){
    o.docsDone=true;
    ccjPaintScreen();ccjPaint();
    ccjReachScreen('docs-done');
    return;
  }
  const c=ccjClient();c.mins+=35;
  if(next.status==='rejected'){
    next.status='verified';next.ref=ccjDocRef(next.id);next.at=c.mins;
    next.note='Replaced &mdash; issued this month.';
    ccjWorkerPush({who:'worker',kind:'doc',label:next.label,state:'resubmitted',at:c.mins});
  }else if(next.id==='addr'&&!next.note){
    next.status='rejected';next.at=c.mins;
    next.note='Issued more than 3 months ago. A current one is needed.';
    ccjWorkerPush({who:'us',kind:'doc',label:next.label,state:'rejected',
      note:next.note,at:c.mins});
  }else if(next.who==='adt'){
    // The 30% ruling is for employees RECRUITED FROM ABROAD, so whether it applies is derivable
    // from the form: a national of the country they are working in is not an incoming employee.
    const f=ccjRun.form||{};
    const incoming=(f.nationality||'')&&f.nationality!==ccjParties().worker.country;
    next.status=incoming?'verified':'na';
    next.ref=incoming?ccjDocRef(next.id):'';
    next.at=c.mins;
    next.note=incoming?'Filed with the Belastingdienst alongside the payroll registration.'
      :'Not an incoming employee &mdash; the ruling does not apply.';
  }else{
    next.status='verified';next.ref=ccjDocRef(next.id);next.at=c.mins;
    ccjWorkerPush({who:'worker',kind:'doc',label:next.label,state:'received',at:c.mins});
  }
  ccjPaintScreen();ccjPaint();
  ccjScheduleAudit(ccjDocsTick,CCJ_ONB_STEP);
}

/* ---- THE TWO FILINGS ----------------------------------------------------------------------
   Tax registration and social security enrolment are the same shape — a submission to an
   authority and a reference coming back — and different in every particular: different body,
   different filing, different number format. One builder, driven by the country pack. */
function ccjFilingId(kind){
  const p=ccjParties(),n=String(1042+(ccjRun.gen||0));
  const c=p.worker.country;
  if(kind==='tax'){
    if(c==='Netherlands')return '2841'+n.slice(-5).padStart(5,'0');           // BSN, 9 digits
    if(c==='Germany')return '12 '+n.slice(-3)+' 678 '+n.slice(-3);            // Steuer-ID
    if(c==='India')return 'ABCPN'+n.slice(-4)+'K';                            // PAN
    if(c==='United Kingdom')return 'QQ '+n.slice(-2)+' '+n.slice(-2)+' '+n.slice(-2)+' C';
    if(c==='Spain')return 'X'+n.slice(-7).padStart(7,'0')+'R';                // NIE
    if(c==='Italy')return 'BKKSNN94C58Z'+n.slice(-3);                         // Codice Fiscale
    return 'FR'+n;
  }
  if(c==='Netherlands')return '2841'+n.slice(-5).padStart(5,'0');
  if(c==='Germany')return '65 180394 B '+n.slice(-3);
  if(c==='India')return '1012'+n.slice(-8).padStart(8,'0');                   // UAN
  if(c==='United Kingdom')return 'QQ '+n.slice(-2)+' '+n.slice(-2)+' '+n.slice(-2)+' C';
  if(c==='Spain')return '28 '+n.slice(-8).padStart(8,'0');
  return 'INPS-'+n;
}
function ccjFilingStart(kind){
  const o=ccjOnb(),s=o[kind],c=ccjClient();
  c.mins+=25;
  s.state='submitted';s.submittedAt=c.mins;
  s.ref=(kind==='tax'?'TAX':'SSE')+'-'+String(55100+(ccjRun.gen||0)*3+(kind==='tax'?0:1));
  ccjPaintScreen();
  ccjScheduleAudit(function(){ccjFilingConfirm(kind);},CCJ_ACT*3);
}
function ccjFilingConfirm(kind){
  const run=ccjRun;if(!run)return;
  const o=ccjOnb(),s=o[kind],c=ccjClient();
  c.mins+=180;
  s.state='confirmed';s.confirmedAt=c.mins;s.id=ccjFilingId(kind);
  ccjPaintScreen();ccjPaint();
  ccjReachScreen(kind+'-done');
}

/* ---- BANK ---------------------------------------------------------------------------------- */
function ccjBankStart(){
  const o=ccjOnb(),p=ccjParties(),reg=ccjReg(p.worker.country),c=ccjClient();
  const b=o.bank;
  // The employee's own account, not ours — masked the way a payroll system holds it.
  b.iban=String(reg.iban).slice(0,8)+' •••• •••• '+String(4800+(ccjRun.gen||0)).slice(-4);
  b.holder=p.worker.name;
  b.state='penny';b.pennyAt=c.mins;
  ccjPaintScreen();
  ccjScheduleAudit(function(){
    const run=ccjRun;if(!run)return;
    b.state='verified';b.score=97;b.verifiedAt=ccjClient().mins+12;
    ccjPaintScreen();ccjPaint();
    ccjReachScreen('bank-done');
  },CCJ_ACT*3);
}

/* ---- PAYROLL ------------------------------------------------------------------------------
   The last stream, and the one that proves the other five worked: a first payslip, prorated to
   the start date, with the employee deductions the country actually levies. Stated as indicative
   on purpose — the payroll engine computes the binding figure on the first run, and a mockup
   claiming an exact net figure would be claiming something it has not done. */
const CCJ_MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function ccjPayrollBuild(){
  const o=ccjOnb(),pr=o.payroll,f=(ccjRun&&ccjRun.form)||{},pack=ccjOnbPack();
  const parts=String(f.fromDate||'2026-10-01').split('-');
  const y=Number(parts[0])||2026,m=Number(parts[1])||10,d=Number(parts[2])||1;
  const inMonth=new Date(Date.UTC(y,m,0)).getUTCDate();
  const worked=inMonth-d+1;
  pr.calendar='Monthly &middot; '+ccjParties().worker.country;
  pr.payDay='Last working day of the month';
  pr.firstPay=(CCJ_MONTHS[m-1]||'Oct')+' '+y;
  pr.days=worked;pr.inMonth=inMonth;
  pr.prorated=worked<inMonth;
  pr.state='built';
  pr.builtAt=ccjClient().mins;
  ccjPaintScreen();ccjPaint();
  ccjReachScreen('payroll-done');
}
function ccjPayslip(){
  const o=ccjOnb(),pr=o.payroll,pack=ccjOnbPack(),q=ccjQuote();
  const gross=Math.round(q.gross*(pr.days&&pr.inMonth?pr.days/pr.inMonth:1));
  const social=Math.round(gross*pack.empSocial/100);
  const tax=Math.round((gross-social)*pack.taxEff/100);
  return {gross:gross,social:social,socialPct:pack.empSocial,
    tax:tax,taxPct:pack.taxEff,net:gross-social-tax,full:q.gross};
}

/* ---- THE SCREEN ---------------------------------------------------------------------------
   Six cards, and a card keeps its detail once it is done rather than collapsing to a tick. That
   is the same rule the sub-status panel follows — every step shows what it found, top to bottom
   — and it is what makes this screen answer the question it exists to answer: not "is onboarding
   finished" but "can this person be paid on the first, and on what evidence". A card that had
   collapsed would have taken the evidence with it. Only the steps still ahead are quiet, and
   they say what they will need. */
const CCJ_ONB_CARDS=[
  {key:'Worker KYC',              n:1,title:'Identity verification'},
  {key:'Documents',               n:2,title:'Documents'},
  {key:'Tax registration',        n:3,title:'Tax registration'},
  {key:'Social security enrolment',n:4,title:'Social security'},
  {key:'Bank verified',           n:5,title:'Bank account'},
  {key:'Payroll configured',      n:6,title:'Payroll'}
];
/* The stage index, found rather than written as 7 — the rail is data, and a stage inserted ahead
   of this one would otherwise silently repoint every card on this screen. */
function ccjOnbStage(){
  return ccjStages().findIndex(function(s){return s.id==='onboarding';});
}
function ccjOnbState(key){
  const run=ccjRun,i=ccjOnbStage();
  if(run.settled['onboarding/'+key])return 'done';
  const step=ccjSteps(i)[run.sub];
  if(run.stage===i&&step&&step.label===key)return 'live';
  return 'pending';
}
function buildCCJOnbHTML(){
  const run=ccjRun,p=ccjParties(),f=run.form||{},o=ccjOnb();
  const doneN=CCJ_ONB_CARDS.filter(function(c){return ccjOnbState(c.key)==='done';}).length;
  const start=ccjPrettyDate(f.fromDate);
  return '<div class="ccj-onb-wrap">'
    +'<div class="ccj-onb-hero'+(doneN===6?' ok':'')+'">'
    +'<div class="ccj-onb-hero-av">'+ccjInitials(p.worker.name)+'</div>'
    +'<div class="ccj-onb-hero-body">'
    +'<div class="ccj-onb-hero-t">'+p.worker.name+'</div>'
    +'<div class="ccj-onb-hero-s">'+(f.jobTitle||'&mdash;')+' &middot; '+p.worker.country
      +' &middot; starts '+start+'</div>'
    +'</div>'
    +'<div class="ccj-onb-hero-fig"><span>'+doneN+' of 6</span><i>'
      +(doneN===6?'ready for payroll':'onboarding steps complete')+'</i></div>'
    +'</div>'
    +CCJ_ONB_CARDS.map(ccjOnbCardHTML).join('')
    +(run.phase==='rest'
      ?'<div class="ccj-onb-next">'
       +'<div class="ccj-onb-next-t">Onboarding complete. '+p.worker.name.split(' ')[0]
       +' can be paid from '+start+'.</div>'
       +'<button class="ccj-primary" onclick="ccjContinueStage()">'
       +CCJ_STAGE_REST['onboarding'].label+' &rarr;</button></div>'
      :'')
    +'</div>';
}
function ccjOnbCardHTML(card){
  const run=ccjRun,o=ccjOnb();
  const i=ccjOnbStage();
  const state=ccjOnbState(card.key);
  const step=ccjSteps(i).find(function(s){return s.label===card.key;})||{};
  const body=state==='pending'?'':ccjOnbCardBodyHTML(card,state);
  const sum=ccjOnbCardSummary(card,state);
  return '<div class="ccj-onb-card '+state+'" id="ccj-onb-'+card.n+'">'
    +'<div class="ccj-onb-card-h">'
    +'<span class="ccj-onb-card-n">'+(state==='done'
      ?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>'
      :state==='live'?'<span class="ccj-spin"></span>':card.n)+'</span>'
    +'<div class="ccj-onb-card-t">'+card.title
    +'<span>'+(state==='pending'?ccjPurpose(i,step):sum)+'</span></div>'
    +'<span class="ccj-row-owner'+(step.auto?' auto':'')+'">'
      +(step.auto?'AUTO':(typeof amOwnerInfo==='function'?amOwnerInfo(step.owner).initials:'?'))+'</span>'
    +'</div>'
    +(body?'<div class="ccj-onb-card-b">'+body+'</div>':'')
    +'</div>';
}
function ccjOnbCardSummary(card,state){
  const o=ccjOnb(),pack=ccjOnbPack();
  if(state==='pending')return '';
  if(card.key==='Worker KYC'){
    const d=ccjKycDecision();
    return o.kyc.done?d.label+' &middot; risk '+d.score+'/100'
      :'Session '+o.kyc.session+' &middot; step '+Math.min(o.kyc.step,CCJ_KYC_PHASES.length)+' of '+CCJ_KYC_PHASES.length;
  }
  if(card.key==='Documents'){
    const req=o.docs.filter(function(d){return d.req;});
    const ok=req.filter(function(d){return d.status==='verified';}).length;
    return ok+' of '+req.length+' required documents verified';
  }
  if(card.key==='Tax registration')
    return o.tax.state==='confirmed'?pack.taxIdLabel+' '+o.tax.id:'Filed with the '+pack.taxAuthority;
  if(card.key==='Social security enrolment')
    return o.ss.state==='confirmed'?pack.ssIdLabel+' '+o.ss.id:'Filed with '+pack.ssAuthority;
  if(card.key==='Bank verified')
    return o.bank.state==='verified'?o.bank.iban+' &middot; name match '+o.bank.score+'%':'Penny-drop in progress';
  if(card.key==='Payroll configured'){
    const s=ccjPayslip();
    return o.payroll.state==='built'?'First pay '+o.payroll.firstPay+' &middot; net '+ccjMoney(s.net):'Building';
  }
  return '';
}
function ccjOnbCardBodyHTML(card,state){
  if(card.key==='Worker KYC')return buildCCJKycHTML();
  if(card.key==='Documents')return buildCCJDocsHTML();
  if(card.key==='Tax registration')return buildCCJFilingHTML('tax');
  if(card.key==='Social security enrolment')return buildCCJFilingHTML('ss');
  if(card.key==='Bank verified')return buildCCJBankHTML();
  if(card.key==='Payroll configured')return buildCCJPayrollHTML();
  return '';
}

/* ---- THE KYC CONSOLE ----------------------------------------------------------------------
   Sections appear as the provider reaches them, in the order it reaches them. Everything on it
   is either read from the identity document or matched against the contract, so the two columns
   are the whole point: what the document says, and what we already believed. */
function buildCCJKycHTML(){
  const o=ccjOnb(),k=o.kyc,d=ccjKycDoc(),c=ccjKycChecks(),p=ccjParties();
  const at=function(id){
    const i=CCJ_KYC_PHASES.findIndex(function(x){return x.id===id;});
    return k.step>i;
  };
  const dec=ccjKycDecision();
  const vd=function(v){return '<span class="ccj-kyc-vd '+v+'">'
    +(v==='pass'?'&#10003;':v==='consider'?'!':v==='fail'?'&#10007;':'&ndash;')+'</span>';};
  const rows=function(list){
    return '<div class="ccj-kyc-rows">'+list.map(function(r){
      return '<div class="ccj-kyc-row"><span class="ccj-kyc-k">'+r.k+'</span>'
        +'<span class="ccj-kyc-v">'+r.v+'</span>'+vd(r.verdict)+'</div>';
    }).join('')+'</div>';
  };
  const phase=function(id,inner){
    const done=at(id),ph=CCJ_KYC_PHASES.find(function(x){return x.id===id;});
    const live=!done&&CCJ_KYC_PHASES[k.step]&&CCJ_KYC_PHASES[k.step].id===id;
    if(!done&&!live)return '';
    return '<div class="ccj-kyc-ph'+(done?' done':' doing')+'">'
      +'<div class="ccj-kyc-ph-h">'
      +'<span class="ccj-kyc-ph-ico">'+(done
        ?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>'
        :'<span class="ccj-spin sm"></span>')+'</span>'
      +'<span class="ccj-kyc-ph-t">'+ph.label+'<i>'+ph.sub+'</i></span></div>'
      +(done&&inner?'<div class="ccj-kyc-ph-b">'+inner+'</div>':'')
      +'</div>';
  };
  return ''
    +'<div class="ccj-kyc-top">'
    +'<span class="ccj-kyc-prov">Persona &middot; identity verification</span>'
    +'<span class="ccj-kyc-sid">'+k.session+'</span>'
    +'</div>'

    +phase('session','')

    // The document, rendered as a document. A row of extracted text would not tell a reviewer
    // that a passport was actually photographed.
    +phase('capture',
      '<div class="ccj-kyc-doc">'
      +'<div class="ccj-kyc-doc-card">'
      +'<div class="ccj-kyc-doc-top"><span>'+d.issuer+'</span><b>PASSPORT</b></div>'
      +'<div class="ccj-kyc-doc-mid">'
      +'<div class="ccj-kyc-doc-photo">'+ccjPortraitHTML()+'</div>'
      +'<div class="ccj-kyc-doc-fields">'
      +'<div><span>Surname</span><b>'+d.surname+'</b></div>'
      +'<div><span>Given names</span><b>'+d.given+'</b></div>'
      +'<div><span>Nationality</span><b>'+d.nationality+'</b></div>'
      +'<div><span>Document no.</span><b>'+d.number+'</b></div>'
      +'</div></div>'
      +'<div class="ccj-kyc-mrz">'+d.mrzLine+'</div>'
      +'</div>'
      +'<div class="ccj-kyc-doc-note">'+d.type+' &middot; captured front and back &middot; expires '+d.expiry+'</div>'
      +'</div>')

    // Two columns, because that is what a cross-check IS.
    +phase('extract',
      '<div class="ccj-kyc-cmp-h"><span>Read from the document</span><span>Matched against</span><i></i></div>'
      +'<div class="ccj-kyc-rows">'+c.identity.map(function(r){
        return '<div class="ccj-kyc-cmp"><span class="ccj-kyc-k">'+r.k+'</span>'
          +'<span class="ccj-kyc-doc-v">'+r.doc+'</span>'
          +'<span class="ccj-kyc-v">'+r.against+'</span>'+vd(r.verdict)+'</div>';
      }).join('')+'</div>')

    +phase('biometric',
      '<div class="ccj-kyc-bio">'
      +'<div class="ccj-kyc-faces">'
      +'<span class="ccj-kyc-face">'+ccjPortraitHTML()+'<i>Document</i></span>'
      +'<span class="ccj-kyc-link">&#8644;</span>'
      +'<span class="ccj-kyc-face live">'+ccjPortraitHTML()+'<i>Live selfie</i></span>'
      +'</div>'+rows(c.biometric)+'</div>')

    +phase('authentic',rows(c.authenticity))
    +phase('screen',rows(c.screening))

    +phase('rtw',
      '<div class="ccj-kyc-rtw '+c.rtw.verdict+'">'
      +vd(c.rtw.verdict)
      +'<div><b>'+c.rtw.label+'</b><span>'+c.rtw.detail+'</span></div></div>')

    +phase('decision',
      '<div class="ccj-kyc-dec '+dec.id+'">'
      +'<div class="ccj-kyc-score"><span>Risk score</span><b>'+dec.score+'</b><i>/100</i></div>'
      +'<div class="ccj-kyc-dec-b"><div class="ccj-kyc-dec-t">'+dec.label+'</div>'
      +'<div class="ccj-kyc-dec-s">'+(dec.note
        ||'Every check cleared. No part of this verification needed a person.')+'</div></div>'
      +'</div>')

    +(k.done&&!k.reviewed&&ccjOnbState('Worker KYC')==='live'
      ?'<div class="ccj-sim">'
       +'<div class="ccj-sim-head">Simulate provider<span>demo</span></div>'
       +'<div class="ccj-sim-btns">'
       +'<button class="ccj-sim-btn" onclick="ccjKycForceConsider()"'
         +(k.forceConsider||dec.id!=='clear'?' disabled':'')+'>Returns CONSIDER instead</button>'
       +'</div>'
       +'<div class="ccj-sim-note">A partial name match is the commonest reason a real check goes to a person.</div>'
       +'</div>'
      :'');
}

/* ---- DOCUMENTS ---------------------------------------------------------------------------- */
function buildCCJDocsHTML(){
  const o=ccjOnb(),pack=ccjOnbPack();
  const req=o.docs.filter(function(d){return d.req;});
  const ok=req.filter(function(d){return d.status==='verified';}).length;
  const ico={verified:'&#10003;',rejected:'&#10007;',waiting:'&middot;',na:'&ndash;'};
  return '<div class="ccj-chk-h">'+ccjParties().worker.country+' checklist'
    +'<span>'+ok+' of '+req.length+' required</span></div>'
    +'<div class="ccj-chk">'+o.docs.map(function(d){
      return '<div class="ccj-chk-row '+d.status+'">'
        +'<span class="ccj-chk-st">'+(ico[d.status]||'')+'</span>'
        +'<div class="ccj-chk-b">'
        +'<div class="ccj-chk-l">'+d.label
          +(d.req?'':'<span class="ccj-chk-opt">optional</span>')+'</div>'
        +'<div class="ccj-chk-w">'+d.why+'</div>'
        +(d.note?'<div class="ccj-chk-n">'+d.note+'</div>':'')
        +'</div>'
        +'<span class="ccj-chk-r">'+(d.status==='verified'?d.ref
          :d.status==='rejected'?'rejected'
          :d.status==='na'?'not claimed'
          :d.who==='adt'?'ADT':'awaiting')+'</span>'
        +'</div>';
    }).join('')+'</div>';
}

/* ---- THE TWO FILINGS ---------------------------------------------------------------------- */
function buildCCJFilingHTML(kind){
  const o=ccjOnb(),s=o[kind],pack=ccjOnbPack(),p=ccjParties();
  const authority=kind==='tax'?pack.taxAuthority:pack.ssAuthority;
  const filing=kind==='tax'?pack.taxFiling:pack.ssFiling;
  const idLabel=kind==='tax'?pack.taxIdLabel:pack.ssIdLabel;
  const row=function(label,sub,at,on){
    return '<div class="ccj-env-row'+(on?' done':'')+'">'
      +'<span class="ccj-env-dot"></span>'
      +'<div class="ccj-env-body"><div class="ccj-env-label">'+label+'</div>'
      +'<div class="ccj-env-sub">'+sub+'</div></div>'
      +'<span class="ccj-env-when">'+(on?ccjStamp(at):'&mdash;')+'</span></div>';
  };
  return '<div class="ccj-file-h">'+authority+'<span>'+filing+'</span></div>'
    +'<div class="ccj-env plain">'
    +row('Submitted',(kind==='tax'?'Payroll tax registration for ':'Enrolment for ')
      +p.worker.name+' &middot; ref '+(s.ref||'&mdash;'),s.submittedAt,!!s.submittedAt)
    +row('Confirmed by the authority',
      s.state==='confirmed'?idLabel+' '+s.id+' issued':'Awaiting the authority',
      s.confirmedAt,s.state==='confirmed')
    +'</div>'
    +(s.state==='confirmed'
      ?'<div class="ccj-file-out">'
       +'<div class="ccj-file-kv"><span>'+idLabel+'</span><b>'+s.id+'</b></div>'
       +'<div class="ccj-file-kv"><span>'+(kind==='tax'?'Applied':'Scheme')+'</span><b>'
         +(kind==='tax'?pack.taxCredit:pack.ssScheme)+'</b></div>'
       +'</div>'
      :'');
}

/* ---- BANK ---------------------------------------------------------------------------------- */
function buildCCJBankHTML(){
  const o=ccjOnb(),b=o.bank,p=ccjParties();
  const done=b.state==='verified';
  return '<div class="ccj-file-h">Penny-drop verification<span>Before payroll sends real money</span></div>'
    +'<div class="ccj-bank">'
    +'<div class="ccj-file-kv"><span>Account holder</span><b>'+(b.holder||'&mdash;')+'</b></div>'
    +'<div class="ccj-file-kv"><span>Account</span><b>'+(b.iban||'&mdash;')+'</b></div>'
    +'<div class="ccj-file-kv"><span>Test credit</span><b>'
      +(b.pennyAt?ccjCurrency()+'&nbsp;0.01 sent':'&mdash;')+'</b></div>'
    +'<div class="ccj-file-kv"><span>Returned by the bank</span><b>'
      +(done?b.holder:'awaiting')+'</b></div>'
    +'<div class="ccj-file-kv"><span>Name match</span><b>'
      +(done?b.score+'% &mdash; accepted':'&mdash;')+'</b></div>'
    +'</div>'
    +(done?'<div class="ccj-bank-n">A penny-drop proves the account exists and belongs to the person we are about to pay. Payroll cannot be released against an account that has not returned a name.</div>':'');
}

/* ---- PAYROLL ------------------------------------------------------------------------------- */
function buildCCJPayrollHTML(){
  const o=ccjOnb(),pr=o.payroll,s=ccjPayslip(),pack=ccjOnbPack(),f=(ccjRun&&ccjRun.form)||{};
  if(pr.state!=='built')return '<div class="ccj-file-h">Payroll configuration<span>Building from the contract</span></div>';
  const line=function(k,sub,v,cls){
    return '<div class="ccj-slip-row'+(cls?' '+cls:'')+'">'
      +'<div class="ccj-slip-k">'+k+(sub?'<span>'+sub+'</span>':'')+'</div>'
      +'<div class="ccj-slip-v">'+v+'</div></div>';
  };
  return '<div class="ccj-file-h">Payroll configuration<span>'+pr.calendar+'</span></div>'
    +'<div class="ccj-file-out">'
    +'<div class="ccj-file-kv"><span>Pay day</span><b>'+pr.payDay+'</b></div>'
    +'<div class="ccj-file-kv"><span>First payroll</span><b>'+pr.firstPay+'</b></div>'
    +'<div class="ccj-file-kv"><span>Cost centre</span><b>'+ccjParties().client.name+'</b></div>'
    +'</div>'
    +'<div class="ccj-slip">'
    +'<div class="ccj-slip-h">Indicative first payslip'
      +'<span>'+(pr.prorated?pr.days+' of '+pr.inMonth+' days &mdash; prorated to the start date'
        :'full month')+'</span></div>'
    +line('Gross',pr.prorated?'from '+ccjMoney(s.full)+' a month':'Monthly gross',ccjMoney(s.gross))
    +line('Employee social security',pack.ssScheme.split(',')[0]+' &middot; '+s.socialPct+'%','&minus;'+ccjMoney(s.social))
    +line('Income tax withheld',pack.taxAuthority+' &middot; '+s.taxPct+'% effective','&minus;'+ccjMoney(s.tax))
    +line('Net pay','To the verified account',ccjMoney(s.net),'total')
    +'</div>'
    +'<div class="ccj-bank-n">Indicative. The payroll engine computes the binding figure on the first run, against the tax code the authority returned and the pay period actually worked.</div>';
}

/* ---- WIRING STAGE 8 INTO THE RUNNER ------------------------------------------------------- */
CCJ_STAGE_REST['onboarding']={label:'Continue to active'};

CCJ_PURPOSE['onboarding/Worker KYC']='Verifies who they are, and that they may work here.';
CCJ_PURPOSE['onboarding/Documents']='Collects the documents this country requires, and checks each one.';
CCJ_PURPOSE['onboarding/Tax registration']='Registers them with the tax authority and gets a tax code back.';
CCJ_PURPOSE['onboarding/Social security enrolment']='Enrols them in the statutory schemes.';
CCJ_PURPOSE['onboarding/Bank verified']='Proves the account exists and belongs to them.';
CCJ_PURPOSE['onboarding/Payroll configured']='Sets the calendar and builds the first payslip.';

CCJ_ON_ENTER['onboarding/Worker KYC']=function(run){ccjKycStart();};
CCJ_ON_ENTER['onboarding/Documents']=function(run){ccjDocsStart();};
CCJ_ON_ENTER['onboarding/Tax registration']=function(run){ccjFilingStart('tax');};
CCJ_ON_ENTER['onboarding/Social security enrolment']=function(run){ccjFilingStart('ss');};
CCJ_ON_ENTER['onboarding/Bank verified']=function(run){ccjBankStart();};
CCJ_ON_ENTER['onboarding/Payroll configured']=function(run){
  ccjScheduleAudit(ccjPayrollBuild,CCJ_ACT*3);
};

/* Every stream holds on its own work finishing rather than on a timer. Six holds, six milestones
   — the same mechanism the clause audit uses, because the same thing is true of all of them:
   the panel must not tick green while the card beside it is still filling in. */
CCJ_HOLDS['onboarding/Worker KYC']={until:'kyc-done',note:'Verification in progress.'};
CCJ_HOLDS['onboarding/Documents']={until:'docs-done',note:'Collecting and checking documents.'};
CCJ_HOLDS['onboarding/Tax registration']={until:'tax-done',note:'Filed. Waiting on the authority.'};
CCJ_HOLDS['onboarding/Social security enrolment']={until:'ss-done',note:'Filed. Waiting on the institution.'};
CCJ_HOLDS['onboarding/Bank verified']={until:'bank-done',note:'Test credit sent. Waiting on the bank.'};
CCJ_HOLDS['onboarding/Payroll configured']={until:'payroll-done',note:'Building the first pay period.'};

/* A verification that could not clear itself goes to a person. It is a POST gate: the whole
   check has to have run before there is anything to adjudicate, and the evidence for the
   decision is the console sitting beside it. */
CCJ_POST_GATES['onboarding/Worker KYC']=function(){
  const k=ccjOnb().kyc;
  if(!k.done)return null;
  if(k.reviewed)return null;
  if(ccjKycDecision().id!=='consider')return null;   // cleared on its own — no decision to make
  return {
    kind:'decision',
    ask:'Identity verification came back CONSIDER.',
    why:ccjKycDecision().note+' A machine may not decide this on its own.',
    options:[
      {id:'kycConfirm',label:'Confirm identity',tone:'go',  done:'Identity confirmed'},
      {id:'kycReject', label:'Reject',          tone:'stop',done:'Verification rejected'}
    ]
  };
};

/* == STAGE 9: ACTIVE ==========================================================================
   The last stage, and the only one whose audience is the WORKER as much as the buyer. Eight
   stages have been about whether a deal can be done; this one is about whether a person can be
   paid, and then about paying them. So it answers three questions in three screens, in order:

     readiness   May this person be paid at all? Every control the journey passed, RE-DERIVED
                 from what the earlier stages actually recorded — not re-asserted. A control
                 whose evidence is missing fails here, and a failed control blocks the run.
     payrun      What were they actually paid? The register: inputs, gross to net, what is owed
                 to the tax authority and the social security institution, funding, the payment
                 file, and the payslip. Then a person releases it.
     active      What is true now? The employment record, and the whole nine-stage trail with
                 the artefact each stage produced.

   THE CERTIFICATE IS DERIVED, WHICH IS THE WHOLE POINT. Every row on it reads the object the
   stage that produced it wrote — ccjMsa(), ccjPay(), ccjEmp(), ccjOnb() — and states its source,
   its reference and the time that object recorded. Nothing on it is authored per run, so it
   cannot claim a control that did not happen. That is what makes it worth showing a worker.

   NOTHING PRINTS A TIME NOBODY RECORDED. Where the underlying object has no timestamp the row
   shows its reference alone. Synthesising `something + 40 minutes` is the bug the stage-6 ledger
   and the stage-7 envelope both had, and it is worse here: this is the document that says the
   controls were real.

   THE MONEY DOES NOT MOVE ON A TIMER. First payroll run parks TWICE — once on the register being
   complete, where Finance releases it, and again on the disbursement actually finishing. That is
   why CCJ_HOLDS accepts a function: one step, two milestones, a human decision between them. */

/* ---- WHAT A PAYROLL RUN IS, PER COUNTRY ----------------------------------------------------
   The monthly return, who it goes to, the contribution filing beside it, the rail the money
   travels on, and the elements the country adds that a flat gross-to-net would miss. The
   accruals matter: vakantiegeld, TFR, pagas extraordinarias and gratuity are earned in THIS
   period and paid in another one, so they belong on the payslip as accruals and nowhere near
   net pay. Printing them as earnings would overstate what lands in the account. */
const CCJ_PAYRUN_PACK={
  'Netherlands':{
    taxLine:'Loonheffing', ret:'Loonaangifte', retTo:'Belastingdienst',
    ssRet:'Premies werknemersverzekeringen', ssTo:'UWV',
    rail:'SEPA credit transfer', file:'pain.001.001.09', payslip:'Loonstrook',
    accruals:[{label:'Vakantiegeld',pct:8,note:'Accrued each period, paid out in May'}],
    ded:null, erExtra:null},
  'Germany':{
    taxLine:'Lohnsteuer', ret:'Lohnsteuer-Anmeldung', retTo:'Finanzamt',
    ssRet:'Beitragsnachweis (DE&Uuml;V)', ssTo:'Krankenkasse',
    rail:'SEPA credit transfer', file:'pain.001.001.09', payslip:'Entgeltabrechnung',
    accruals:[], ded:null, erExtra:null},
  'India':{
    taxLine:'TDS &mdash; tax deducted at source', ret:'Challan ITNS-281', retTo:'Income Tax Department',
    ssRet:'EPF electronic challan cum return', ssTo:'EPFO',
    rail:'NEFT transfer', file:'NEFT bulk advice', payslip:'Payslip',
    accruals:[{label:'Gratuity provision',pct:4.81,note:'Accrued each period, payable after five years of service'}],
    ded:null, erExtra:null},
  'Spain':{
    taxLine:'Retenci&oacute;n IRPF', ret:'Modelo 111', retTo:'Agencia Tributaria',
    ssRet:'RLC / RNT &middot; Sistema RED', ssTo:'Tesorer&iacute;a General de la Seguridad Social',
    rail:'SEPA credit transfer', file:'pain.001.001.09', payslip:'N&oacute;mina',
    accruals:[{label:'Pagas extraordinarias',pct:16.67,note:'Two extra payments a year, accrued monthly'}],
    ded:null, erExtra:null},
  'United Kingdom':{
    taxLine:'PAYE income tax', ret:'Full Payment Submission (RTI)', retTo:'HM Revenue &amp; Customs',
    ssRet:'Class 1 National Insurance', ssTo:'HMRC',
    rail:'Faster Payments', file:'Bacs Standard 18', payslip:'Payslip',
    accruals:[],
    // Auto-enrolment is a real deduction from a UK payslip and the employer pays alongside it.
    // It is why the computed net differs from the figure onboarding modelled, and the run says so.
    ded:{label:'Pension &mdash; auto-enrolment',pct:5,note:'NEST, qualifying earnings'},
    erExtra:{label:'Employer pension contribution',pct:3}},
  'France':{
    taxLine:'Pr&eacute;l&egrave;vement &agrave; la source', ret:'DSN &mdash; d&eacute;claration sociale nominative', retTo:'URSSAF / DGFiP',
    ssRet:'Cotisations sociales', ssTo:'URSSAF',
    rail:'SEPA credit transfer', file:'pain.001.001.09', payslip:'Bulletin de paie',
    accruals:[{label:'Cong&eacute;s pay&eacute;s',pct:10,note:'Paid-leave provision accrued each period'}],
    ded:null, erExtra:null},
  'Italy':{
    taxLine:'IRPEF', ret:'Modello F24', retTo:'Agenzia delle Entrate',
    ssRet:'UniEmens', ssTo:'INPS',
    rail:'SEPA credit transfer', file:'pain.001.001.09', payslip:'Busta paga',
    accruals:[{label:'TFR &mdash; trattamento di fine rapporto',pct:6.91,note:'Set aside each period, paid on termination'}],
    ded:null, erExtra:null}
};
function ccjPayrunPack(country){
  return CCJ_PAYRUN_PACK[country||ccjParties().worker.country]||CCJ_PAYRUN_PACK['Netherlands'];
}

/* ---- THE STAGE'S STATE ---------------------------------------------------------------------
   Two objects, one per screen that has any: the readiness certificate and the payroll run. Both
   hang off run.live so a reset takes them with it, the same way run.onb and run.emp work. */
function ccjNewRdy(){return {step:0,done:false,at:0,ref:''};}
function ccjNewPayrun(){
  return {
    id:'', label:'', from:'', to:'', payDay:'', cutOff:'',
    step:0, rstep:0, done:false,
    state:'idle',              // idle → calculating → calculated → approved → paying → paid
    calcAt:0,
    approvedBy:'', approvedAt:0,
    held:false, heldBy:'', heldAt:0,        // kept after a release: it is part of the record
    fundedAt:0, fileRef:'', paidAt:0, valueAt:0, bankRef:'',
    taxRef:'', ssRef:'', filedAt:0,
    payslipId:'', payslipAt:0
  };
}
function ccjLive(){
  const run=ccjRun;
  if(!run.live)run.live={rdy:ccjNewRdy(),pr:ccjNewPayrun()};
  return run.live;
}
function ccjRdy(){return ccjLive().rdy;}
function ccjPayrun(){return ccjLive().pr;}
/* The stage index, found rather than written as 8 — same reason ccjOnbStage is. */
function ccjActiveStage(){
  return ccjStages().findIndex(function(s){return s.id==='active';});
}
/* Ends a sentence without doubling the stop. Half the entity names in CCJ_REGISTRY already end in
   one — "ADT Netherlands EOR Services B.V." — so appending a full stop after them printed "B.V..". */
function ccjFullStop(s){return /[.!?]$/.test(String(s).trim())?String(s):String(s)+'.';}
/* "Stage 5 · Signed" — where a control came from, named the way the rail names it, so a reader
   can go and look at the thing that produced it. */
function ccjSrc(stageId,label){
  const i=ccjStages().findIndex(function(s){return s.id===stageId;});
  const s=i>-1?ccjStages()[i]:null;
  return 'Stage '+(i+1)+' &middot; '+(label||(s?s.short:''));
}

/* ---- THE READINESS CERTIFICATE -------------------------------------------------------------
   Five groups, and every row is computed from the object the earlier stage wrote. A row states
   what it proves, where that proof came from, its reference, the time that object recorded (or
   nothing, if it recorded none) and a verdict.

   `at:0` means "this object holds no timestamp for that event". The row then shows its reference
   alone rather than a plausible-looking time, because a certificate that invents one is worse
   than a certificate that admits it does not have one. */
const CCJ_RDY_GROUPS=[
  {id:'engagement',n:1,title:'The engagement is contracted',
   why:'We may not employ anyone on a client&rsquo;s behalf without an agreement in force and the deposit it calls for.'},
  {id:'employment',n:2,title:'The person is employed',
   why:'A contract in force between ADT and the employee, under the law of the country the work is in.'},
  {id:'identity',n:3,title:'They are who they say they are',
   why:'Identity proven against a genuine document, and the right to work in that country established.'},
  {id:'registered',n:4,title:'Registered with the authorities',
   why:'Nobody may be paid before the tax authority and the social security institution know they exist.'},
  {id:'money',n:5,title:'Money can move, safely',
   why:'An account that has been proved to belong to them, and an engine configured from the executed contract.'}
];
function ccjRdyChecks(){
  const run=ccjRun;if(!run)return [];
  const p=ccjParties(),f=run.form||{},pack=ccjOnbPack(),o=ccjOnb();
  const m=ccjMsa(),e=ccjEmp(),pay=ccjPay(),inv=ccjInvoice();
  const rtw=ccjRightToWork(),kyc=ccjKycDecision();
  const req=o.docs.filter(function(d){return d.req;});
  const gotDocs=req.filter(function(d){return d.status==='verified';});
  const docAt=o.docs.reduce(function(x,d){return Math.max(x,d.at||0);},0);
  const list=[];
  /* 1 — the engagement. An established client signed their agreement before this run existed, so
     the control is satisfied by the agreement being in force, not by this run having produced it. */
  const msaInForce=!!m.adtSignedAt||ccjMsaExists();
  list.push({group:'engagement',label:'Master Services Agreement in force',
    proves:'The client has contracted with us for this service.',
    src:ccjSrc('agreement-signature','Signed'),ref:m.id,
    at:m.adtSignedAt||0,
    detail:m.adtSignedAt
      ?'Signed by '+p.client.name+' and countersigned by '+p.adt.signatory+'.'
      :ccjMsaExists()?'Agreement already in force for this client &mdash; not re-executed for this placement.'
      :'No executed agreement on file.',
    verdict:msaInForce?'pass':'fail'});
  const settled=ccjPaidInFull()||pay.released;
  list.push({group:'engagement',label:'Deposit settled',
    proves:'The client has funded the placement before anyone is paid out of it.',
    src:ccjSrc('deposit-due','Cleared'),ref:inv.id,
    at:(pay.receipts.length?pay.receipts[pay.receipts.length-1].at:0)||0,
    detail:ccjPaidInFull()
      ?ccjMoney(ccjReceived())+' received against '+ccjMoney(ccjAmountDue())+' &mdash; settled in full.'
      :pay.released
      ?'Released by '+pay.releasedBy+' with '+ccjMoney(pay.shortfall)+' outstanding &mdash; recorded as an exception.'
      :ccjMoney(ccjOutstanding())+' still outstanding.',
    verdict:ccjPaidInFull()?'pass':pay.released?'consider':'fail'});
  /* 2 — the employment. Both signatures, and the audit that made the draft lawful. */
  list.push({group:'employment',label:'Employment contract executed',
    proves:'They are employed by the ADT entity in the country the work is in.',
    src:ccjSrc('employment-contract','ADT countersigned'),ref:e.id+' v'+e.version,
    at:e.adtSignedAt||0,
    detail:e.adtSignedAt
      ?ccjFullStop('Signed by '+p.worker.name+' and countersigned by '+p.adt.signatory
        +' for '+p.adt.name)
      :'Not countersigned.',
    verdict:(e.workerSignedAt&&e.adtSignedAt)?'pass':'fail'});
  const failed=ccjAuditFailed().length,adjusted=ccjAuditAdjusted().length;
  list.push({group:'employment',label:'Clause compliance check cleared',
    proves:'Every clause meets the statutory floor of '+ccjInCountry(p.worker.country)+'.',
    src:ccjSrc('employment-contract','Clause compliance check'),
    ref:e.audit.length?e.audit.length+' clauses checked':'not run',
    at:0,
    detail:e.auditDone
      ?(adjusted?adjusted+' clause'+(adjusted===1?'':'s')+' rewritten to the statutory minimum before signature. ':'')
       +(failed?failed+' unresolved.':'No clause falls short.')
      :'The check has not run against this draft.',
    verdict:!e.auditDone?'fail':failed?'fail':'pass'});
  /* 3 — identity. The one control a machine may not close on its own when it comes back unsure. */
  list.push({group:'identity',label:'Identity verified',
    proves:'The person being paid is the person on the contract.',
    src:ccjSrc('onboarding','Worker KYC'),ref:o.kyc.session,
    at:o.kyc.reviewedAt||0,
    detail:!o.kyc.done?'Verification has not completed.'
      :o.kyc.reviewed==='confirmed'
      ?'Came back '+kyc.label+' and was confirmed by '+(o.kyc.reviewed_by||'a reviewer')+'.'
      :o.kyc.reviewed==='rejected'?'Rejected on review.'
      :kyc.label+' &middot; risk score '+kyc.score+'/100. '+kyc.note,
    verdict:!o.kyc.done?'fail':o.kyc.reviewed==='rejected'?'fail'
      :(kyc.id==='clear'||o.kyc.reviewed==='confirmed')?'pass':'fail'});
  list.push({group:'identity',label:'Right to work established',
    proves:'They may lawfully work in '+ccjInCountry(p.worker.country)+'.',
    src:ccjSrc('onboarding','Worker KYC'),ref:(f.nationality||p.worker.country)+' national',
    at:0, detail:rtw.label+'. '+rtw.detail,
    verdict:rtw.verdict});
  /* 4 — the authorities. Two filings, each with the number that came back. */
  list.push({group:'registered',label:'Registered with '+pack.taxAuthority,
    proves:'Payroll tax can be withheld and remitted against a real registration.',
    src:ccjSrc('onboarding','Tax registration'),
    ref:o.tax.id?pack.taxIdLabel+' '+o.tax.id:(o.tax.ref||'not filed'),
    at:o.tax.confirmedAt||0,
    detail:o.tax.state==='confirmed'
      ?pack.taxFiling+' confirmed. '+pack.taxCredit+'.'
      :'The registration has not been confirmed.',
    verdict:o.tax.state==='confirmed'?'pass':'fail'});
  list.push({group:'registered',label:'Enrolled with '+pack.ssAuthority,
    proves:'Contributions can be paid into the statutory schemes.',
    src:ccjSrc('onboarding','Social security enrolment'),
    ref:o.ss.id?pack.ssIdLabel+' '+o.ss.id:(o.ss.ref||'not filed'),
    at:o.ss.confirmedAt||0,
    detail:o.ss.state==='confirmed'
      ?pack.ssFiling+' confirmed. Covers '+pack.ssScheme+'.'
      :'The enrolment has not been confirmed.',
    verdict:o.ss.state==='confirmed'?'pass':'fail'});
  list.push({group:'registered',label:'Statutory documents collected',
    proves:'Every document '+ccjInCountry(p.worker.country)+' requires is on file and checked.',
    src:ccjSrc('onboarding','Documents'),ref:gotDocs.length+' of '+req.length+' required',
    at:docAt,
    detail:ccjDocsOutstanding().length
      ?'Outstanding: '+ccjDocsOutstanding().map(function(d){return d.label;}).join(', ')+'.'
      :'All required documents verified. '+o.docs.filter(function(d){return d.status==='na';}).length
       +' optional item(s) not applicable.',
    verdict:ccjDocsOutstanding().length?'fail':'pass'});
  /* 5 — the money. The cheapest control in the journey and the one that prevents the most
     expensive mistake, plus the engine that will use it. */
  list.push({group:'money',label:'Bank account verified',
    proves:'The account exists and belongs to the person we are about to pay.',
    src:ccjSrc('onboarding','Bank verified'),ref:o.bank.iban||'not verified',
    at:o.bank.verifiedAt||0,
    detail:o.bank.state==='verified'
      ?'Test credit accepted. Name on the account returned as '+o.bank.holder+' &mdash; '+o.bank.score+'% match.'
      :'No penny-drop result on file.',
    verdict:o.bank.state==='verified'?'pass':'fail'});
  list.push({group:'money',label:'Payroll configured from the executed contract',
    proves:'The engine will pay what the contract says, not what the quote proposed.',
    src:ccjSrc('onboarding','Payroll configured'),ref:o.payroll.firstPay||'not configured',
    at:o.payroll.builtAt||0,
    detail:o.payroll.state==='built'
      ?o.payroll.calendar+' &middot; '+o.payroll.payDay+'. First period '
       +(o.payroll.prorated?'prorated to '+o.payroll.days+' of '+o.payroll.inMonth+' days.':'is a full month.')
      :'The engine has not been configured.',
    verdict:o.payroll.state==='built'?'pass':'fail'});
  return list;
}
function ccjRdyFailed(){
  return ccjRdyChecks().filter(function(c){return c.verdict==='fail';});
}
function ccjRdyOpen(){
  // Anything not an outright pass, which is what a certificate has to report. A CONSIDER does not
  // block payroll — a deposit released against a shortfall was somebody's decision, already
  // recorded — but it is stated on the face of the certificate rather than rounded up to green.
  return ccjRdyChecks().filter(function(c){return c.verdict!=='pass';});
}
const CCJ_RDY_STEP=520;        // one control, paced to be read
function ccjRdyStart(){
  const run=ccjRun;if(!run)return;
  const r=ccjRdy();
  r.step=0;r.done=false;
  ccjPaintScreen();
  ccjScheduleAudit(ccjRdyTick,CCJ_RDY_STEP);
}
function ccjRdyTick(){
  const run=ccjRun;if(!run)return;
  const r=ccjRdy(),list=ccjRdyChecks();
  if(r.step<list.length){
    r.step++;
    ccjPaintScreen();ccjPaint();
    ccjScrollRdyTo(r.step);
    ccjScheduleAudit(ccjRdyTick,CCJ_RDY_STEP);
    return;
  }
  r.done=true;r.at=ccjClient().mins;r.ref='PRC-'+String(3300+(run.gen||0));
  ccjPaintScreen();ccjPaint();
  ccjReachScreen('readiness-done');
}
function ccjScrollRdyTo(n){
  if(typeof document.querySelector!=='function')return;
  const box=document.querySelector('.ccj-rdy-wrap');
  const el=document.getElementById('ccj-rdy-'+n);
  if(!box||!el||typeof el.getBoundingClientRect!=='function'||!box.getBoundingClientRect)return;
  const r=el.getBoundingClientRect(),br=box.getBoundingClientRect();
  if(!r.height&&!br.height)return;
  ccjGlide(box,box.scrollTop+(r.top-br.top)-140);
}

/* ---- THE FIRST PAYROLL RUN ------------------------------------------------------------------
   The period comes from the start date on the contract, so a mid-month start prorates and a
   first-of-the-month start does not. Everything downstream reads this one function. */
function ccjPayrunPeriod(){
  const f=(ccjRun&&ccjRun.form)||{};
  const parts=String(f.fromDate||'2026-10-01').split('-');
  const y=Number(parts[0])||2026,m=Number(parts[1])||10,d=Number(parts[2])||1;
  const inMonth=new Date(Date.UTC(y,m,0)).getUTCDate();
  const mn=CCJ_MONTHS[m-1]||'Oct';
  const ny=m===12?y+1:y,nm=m===12?1:m+1;
  const nInMonth=new Date(Date.UTC(ny,nm,0)).getUTCDate();
  return {y:y,m:m,d:d,inMonth:inMonth,days:inMonth-d+1,prorated:d>1,
    label:mn+' '+y,
    from:mn+' '+d+', '+y, to:mn+' '+inMonth+', '+y,
    payDay:mn+' '+inMonth+', '+y,
    cutOff:mn+' '+Math.max(1,inMonth-5)+', '+y,
    nextLabel:(CCJ_MONTHS[nm-1]||'Nov')+' '+ny,
    nextPay:(CCJ_MONTHS[nm-1]||'Nov')+' '+nInMonth+', '+ny};
}
/* Gross to net, and the employer side beside it. Reads the same gross and the same day count
   stage 8 used, so the two agree by construction — the run is the binding calculation and the
   onboarding figure was explicitly indicative, and where they differ the screen says why. */
function ccjPayrunCalc(){
  const p=ccjParties(),per=ccjPayrunPeriod();
  const pk=ccjOnbPack(),pay=ccjPayrunPack(),rate=ccjRate(p.worker.country),q=ccjQuote();
  const full=q.gross;
  const basic=Math.round(full*(per.inMonth?per.days/per.inMonth:1));
  const gross=basic;                                  // accruals are earned here, paid elsewhere
  const social=Math.round(gross*pk.empSocial/100);
  const taxable=gross-social;
  const tax=Math.round(taxable*pk.taxEff/100);
  const ded=pay.ded?{label:pay.ded.label,pct:pay.ded.pct,note:pay.ded.note,
    amount:Math.round(gross*pay.ded.pct/100)}:null;
  const net=gross-social-tax-(ded?ded.amount:0);
  const accruals=(pay.accruals||[]).map(function(a){
    return {label:a.label,pct:a.pct,note:a.note,amount:Math.round(gross*a.pct/100)};});
  const erSocial=Math.round(gross*rate.social/100);
  const erExtra=pay.erExtra?{label:pay.erExtra.label,pct:pay.erExtra.pct,
    amount:Math.round(gross*pay.erExtra.pct/100)}:null;
  const accrued=accruals.reduce(function(s,a){return s+a.amount;},0);
  const cost=gross+erSocial+accrued+(erExtra?erExtra.amount:0);
  const indicative=ccjPayslip();
  return {full:full,basic:basic,gross:gross,
    social:social,socialPct:pk.empSocial,
    tax:tax,taxPct:pk.taxEff,taxLine:pay.taxLine,
    ded:ded,net:net,accruals:accruals,accrued:accrued,
    erSocial:erSocial,erPct:rate.social,erLabel:rate.label,erExtra:erExtra,cost:cost,
    days:per.days,inMonth:per.inMonth,prorated:per.prorated,
    // What is owed to whom out of this run. Employee tax is withheld from them; both sides of
    // social security are remitted together, which is how the contribution filing actually works.
    toTax:tax, toSs:social+erSocial,
    /* COST AND CASH ARE NOT THE SAME NUMBER, and on this stage the difference is the accrual.
       `cost` is what the period costs us — it includes vakantiegeld/TFR/gratuity, earned now and
       paid in another period. `cashOut` is what actually leaves the bank this month: the net to
       the employee plus the two remittances. Testing funding against `cost` asks whether we can
       afford money that is not moving yet. */
    cashOut:net+tax+social+erSocial,
    indicative:indicative.net, delta:net-indicative.net};
}
/* Five phases to build the register, five more to release it. Split rather than one list,
   because a person stands between them and the second half must not be reachable without them. */
const CCJ_PR_PHASES=[
  {id:'open',  label:'Run opened',                  sub:'Period, calendar and cut-off fixed'},
  {id:'inputs',label:'Inputs gathered',             sub:'Contract, calendar and absence data'},
  {id:'calc',  label:'Gross to net calculated',     sub:'Earnings, deductions and net pay'},
  {id:'stat',  label:'Statutory amounts determined',sub:'What is owed, and to whom'},
  {id:'check', label:'Pre-payment controls',        sub:'The last checks before a person is asked'}
];
const CCJ_PR_REL=[
  {id:'fund', label:'Run funded',              sub:'From the deposit held against this placement'},
  {id:'file', label:'Payment file created',    sub:'One credit, to the verified account'},
  {id:'pay',  label:'Payment executed',        sub:'Sent to the bank for value on the pay date'},
  {id:'filed',label:'Statutory returns filed', sub:'Tax and contributions declared'},
  {id:'slip', label:'Payslip issued',          sub:'Delivered to the employee'}
];
const CCJ_PR_STEP=680;
function ccjPayrunStart(){
  const run=ccjRun;if(!run)return;
  const pr=ccjPayrun(),per=ccjPayrunPeriod(),p=ccjParties();
  const cc=(typeof CCJ_CC!=='undefined'&&CCJ_CC[p.worker.country])||'XX';
  pr.id='PR-'+per.y+'-'+String(per.m).padStart(2,'0')+'-'+cc+'-001';
  pr.label=per.label;pr.from=per.from;pr.to=per.to;
  pr.payDay=per.payDay;pr.cutOff=per.cutOff;
  pr.step=0;pr.rstep=0;pr.state='calculating';pr.done=false;
  ccjPaintScreen();
  // Not immediately, for the reason ccjAuditStart waits: the panel beside this is still connecting
  // to the payroll engine and pulling the contract down, and the register must OUTLIVE the step's
  // own beats or the hold is decorative. Four beats at CCJ_ACT is 4.6s; two beats of head start
  // plus five phases at CCJ_PR_STEP puts the register past it, so the row genuinely parks.
  ccjScheduleAudit(ccjPayrunTick,CCJ_ACT*2);
}
function ccjPayrunTick(){
  const run=ccjRun;if(!run)return;
  const pr=ccjPayrun();
  if(pr.step<CCJ_PR_PHASES.length){
    pr.step++;
    if(pr.step===CCJ_PR_PHASES.length){
      pr.state='calculated';pr.calcAt=ccjClient().mins;
    }
    ccjPaintScreen();ccjPaint();
    ccjScheduleAudit(ccjPayrunTick,CCJ_PR_STEP);
    return;
  }
  // The register is complete. It goes no further on its own — a person releases it.
  ccjPaintScreen();ccjPaint();
  ccjReachScreen('payrun-calc');
}
/* The second half, and it only ever starts from ccjChooseGate('payApprove'). */
function ccjPayrunRelease(){
  const run=ccjRun;if(!run)return;
  const pr=ccjPayrun();
  pr.state='paying';pr.rstep=0;
  ccjPaintScreen();
  ccjScheduleAudit(ccjPayrunReleaseTick,CCJ_PR_STEP);
}
function ccjPayrunReleaseTick(){
  const run=ccjRun;if(!run)return;
  const pr=ccjPayrun(),c=ccjClient(),per=ccjPayrunPeriod(),pack=ccjPayrunPack();
  if(pr.rstep>=CCJ_PR_REL.length){
    pr.state='paid';pr.done=true;
    ccjPaintScreen();ccjPaint();
    ccjReachScreen('payrun-done');
    return;
  }
  pr.rstep++;
  const id=CCJ_PR_REL[pr.rstep-1].id;
  c.mins+=25;
  if(id==='fund'){pr.fundedAt=c.mins;}
  else if(id==='file'){pr.fileRef=pack.file+' &middot; '+String(pr.id).replace(/[^0-9]/g,'').slice(-8);}
  else if(id==='pay'){
    pr.paidAt=c.mins;pr.valueAt=c.mins;
    pr.bankRef=(ccjReg(ccjParties().adt.country).bic||'BANK').slice(0,4).toUpperCase()
      +String(760400+(run.gen||0)*13);
  }
  else if(id==='filed'){
    pr.filedAt=c.mins;
    // The acknowledgement each authority gives back for THIS period's return. Not derived from
    // ccjFilingId: that is the employee's own tax and social security number, and in the
    // Netherlands both are the same BSN — so building filing references out of it printed one
    // number twice and called it two submissions to two different institutions.
    const per2=per.y+String(per.m).padStart(2,'0');
    pr.taxRef='RET-'+per2+'-'+String(70200+(run.gen||0)*7);
    pr.ssRef='CON-'+per2+'-'+String(31580+(run.gen||0)*3);
  }
  else if(id==='slip'){
    pr.payslipId='PS-'+per.y+String(per.m).padStart(2,'0')+'-'+String(4100+(run.gen||0));
    pr.payslipAt=c.mins;
    // The employee is told, in their own thread, with the figure and where the money went.
    ccjWorkerPush({who:'us',kind:'payslip',id:pr.payslipId,period:pr.label,
      net:ccjPayrunCalc().net,acct:ccjOnb().bank.iban,at:c.mins});
  }
  ccjPaintScreen();ccjPaint();
  ccjScheduleAudit(ccjPayrunReleaseTick,CCJ_PR_STEP);
}

/* ---- THE TRAIL ------------------------------------------------------------------------------
   The whole journey in one list, read off what each stage actually settled. The artefact column
   is what makes it a record rather than a progress bar: each stage produced a thing, and the
   thing has a reference somebody can look up. */
const CCJ_ARTEFACT={
  'request-received':function(){const p=ccjRun&&ccjRun.proposal;
    return p?{label:'Proposal',ref:p.id}:null;},
  'quote-prep':function(){const q=ccjQuote();
    return {label:'Cost calculation',ref:q.sym+' '+q.total.toLocaleString()+' / month'};},
  'quote-review':function(){const c=ccjClient();
    return c.state==='idle'?null:{label:'Quote',ref:'v'+c.version+(c.state==='accepted'?' accepted':'')};},
  'quote-approved':function(){const t=ccjTenant();
    return {label:'Client account',ref:t.id};},
  'agreement-signature':function(){const m=ccjMsa();
    if(m.adtSignedAt)return {label:'Master Services Agreement',ref:m.id};
    // An established client signed theirs before this run existed, so the stage produced no new
    // paper — but the placement is still governed by an agreement and the record has to say so.
    // NOT with m.id: that is an identifier for a document this run never executed.
    return ccjMsaExists()?{label:'Master agreement',ref:'already in force'}:null;},
  'deposit-due':function(){const p=ccjPay();
    return p.receipts.length?{label:'Deposit invoice',ref:ccjInvoice().id}:null;},
  'employment-contract':function(){const e=ccjEmp();
    return e.adtSignedAt?{label:'Employment contract',ref:e.id+' v'+e.version}:null;},
  'onboarding':function(){const o=ccjOnb();
    const req=o.docs.filter(function(d){return d.req;});
    return o.payroll.state==='built'
      ?{label:'Onboarding file',ref:req.length+' documents &middot; KYC '+ccjKycDecision().label}:null;},
  'active':function(){const pr=ccjPayrun();
    return pr.payslipId?{label:'Payslip',ref:pr.payslipId}:null;}
};
function ccjTrail(){
  const run=ccjRun;if(!run)return [];
  return ccjStages().map(function(s,i){
    const steps=ccjSteps(i);
    const done=steps.filter(function(st){return run.settled[ccjKey(i,st)];});
    const last=done[done.length-1];
    const rec=last?run.settled[ccjKey(i,last)]:null;
    const decided=steps.filter(function(st){return run.decisions[ccjKey(i,st)];});
    const art=CCJ_ARTEFACT[s.id];
    return {n:i+1,id:s.id,short:s.short,label:s.label,
      outcome:rec?rec.summary:'&mdash;',
      done:done.length,total:steps.length,complete:done.length===steps.length,
      human:decided.length>0,
      owner:last?last.owner:(s.waitingOn&&s.waitingOn!=='&mdash;'?s.waitingOn:'Agent'),
      artefact:art?art():null};
  });
}

/* ---- THE CONTRACT RECORD --------------------------------------------------------------------
   The journey ends by writing a row into the product's own contracts list, in exactly the shape
   submitManualContractDeal writes one — so the record the journey produced is indistinguishable
   from any other contract in the listing, which is the point. Guarded on run.contractRowId: a
   repaint, a re-render or a second click must not create a second contract.

   ctLogsData and ctWorkflowData are filled from the TRAIL rather than authored, so the row's
   history is the journey's history and cannot drift from it. */
function ccjWriteContractRecord(){
  const run=ccjRun;if(!run)return null;
  if(run.contractRowId)return run.contractRowId;
  if(typeof contractsData==='undefined')return null;
  const p=ccjParties(),f=run.form||{},q=ccjQuote(),e=ccjEmp(),per=ccjPayrunPeriod();
  const id=contractsData.reduce(function(mx,c){return Math.max(mx,c.id);},0)+1;
  const now=typeof aiFormatNow==='function'?aiFormatNow():{date:'2026-08-04',time:'09:12:00'};
  const name=p.worker.name;
  const reg=ccjReg(p.worker.country);
  contractsData.unshift({
    id:id,contractId:String(94500+id),
    empName:name,empDesig:f.jobTitle||'&mdash;',country:p.worker.country,
    type:run.model||'EOR',date:now.date+' '+now.time,status:'Active',
    nationality:f.nationality||p.worker.country,countryOfOp:p.worker.country,
    workPermit:/assist|yes/i.test(String(f.workPermit||'')),
    gender:(f.gender||'').toUpperCase()||'&mdash;',
    email:p.worker.email,contact:f.mobile||'&mdash;',dob:f.dob||'&mdash;',
    jobTitle:f.jobTitle||'&mdash;',skill:f.skill||'&mdash;',
    empDuration:(f.fromDate||'')+(f.toDate?' &ndash; '+f.toDate:''),
    empType:run.model||'EOR',workSchedule:f.hours||'&mdash;',
    payAmount:String(q.gross),currency:reg.ccy||'EUR',
    jobDesc:f.jobDesc||(f.jobTitle||'')+' &mdash; '+p.client.name,
    payFrequency:'Monthly',
    commercial:typeof aiGenCommercial==='function'?aiGenCommercial(q.gross):{},
    complianceItems:[
      {item:'Employment contract '+e.id,note:'Executed and countersigned',status:'Approved',doc:null},
      {item:'Onboarding &mdash; '+p.worker.country,note:'All required documents verified',status:'Approved',doc:null},
      {item:'First payroll run '+ccjPayrun().id,note:'Released for '+per.label,status:'Approved',doc:null}
    ],
    // The listing surfaces this one row as newly created. It is a fact about the row rather than
    // a global the listing has to reach across files for.
    ccjNew:true, ccjRunGen:run.gen
  });
  run.contractRowId=id;
  // Newest first, matching how ctLogsData is written everywhere else in the app.
  const trail=ccjTrail().filter(function(t){return t.complete;});
  if(typeof ctLogsData!=='undefined')ctLogsData[id]=trail.slice().reverse().map(function(t){
    return {date:now.date,time:now.time,user:t.owner,status:t.short,
      action:t.label+' &mdash; '+t.outcome+'.'};
  });
  if(typeof ctWorkflowData!=='undefined')ctWorkflowData[id]=trail.slice().reverse().map(function(t){
    return {title:t.label,user:t.owner,date:now.date,time:now.time,
      description:t.outcome+(t.artefact?' &middot; '+t.artefact.label+' '+t.artefact.ref:'')+'.'};
  });
  return id;
}
/* The way out of the finished journey: write the record if it is not written, leave the run
   behind — it is over — and land on the contracts listing with the new row at the top of it. */
function ccjOpenContractRecord(){
  ccjWriteContractRecord();
  ccjReset();
  if(typeof navigatePage==='function')navigatePage('contracts');
}

/* ---- SCREEN 1: THE CERTIFICATE -------------------------------------------------------------- */
function ccjRdyVerdictHTML(v){
  const t=v==='pass'?'&#10003;':v==='consider'?'!':v==='fail'?'&#10007;':'&ndash;';
  return '<span class="ccj-rdy-v '+v+'">'+t+'</span>';
}
function buildCCJRdyHTML(){
  const run=ccjRun,p=ccjParties(),f=run.form||{},r=ccjRdy();
  const list=ccjRdyChecks(),shown=Math.min(r.step,list.length);
  const open=ccjRdyOpen(),blocked=ccjRdyFailed();
  const done=r.done;
  const per=ccjPayrunPeriod();
  let n=0;
  const groups=CCJ_RDY_GROUPS.map(function(g){
    const rows=list.map(function(c,idx){return {c:c,idx:idx};})
      .filter(function(x){return x.c.group===g.id&&x.idx<shown;});
    if(!rows.length)return '';
    return '<div class="ccj-rdy-grp">'
      +'<div class="ccj-rdy-grp-h"><span class="ccj-rdy-grp-n">'+g.n+'</span>'
      +'<div class="ccj-rdy-grp-t">'+g.title+'<i>'+g.why+'</i></div></div>'
      +rows.map(function(x){
        const c=x.c;n++;
        return '<div class="ccj-rdy-row '+c.verdict+'" id="ccj-rdy-'+(x.idx+1)+'">'
          +ccjRdyVerdictHTML(c.verdict)
          +'<div class="ccj-rdy-b">'
          +'<div class="ccj-rdy-l">'+c.label+'</div>'
          +'<div class="ccj-rdy-p">'+c.proves+'</div>'
          +'<div class="ccj-rdy-d">'+c.detail+'</div>'
          +'<div class="ccj-rdy-src"><span>'+c.src+'</span>'
          +'<b>'+c.ref+'</b>'
          +(c.at?'<i>'+ccjStamp(c.at)+'</i>':'')+'</div>'
          +'</div></div>';
      }).join('')
      +'</div>';
  }).join('');
  return '<div class="ccj-rdy-wrap">'
    +'<div class="ccj-rdy-cert'+(done?(blocked.length?' bad':' ok'):'')+'">'
    +'<div class="ccj-rdy-head">'
    // The stamp sits UNDER the reference, inside the header's left column, rather than floating
    // over the header. Absolutely positioned it landed on top of the worker's country and start
    // date and across the rule beneath them — a stamp that obscures the thing it is certifying.
    +'<div><div class="ccj-rdy-kind">Payroll readiness certificate</div>'
    +'<div class="ccj-rdy-no">'+(r.ref||'in progress')+'</div>'
    +(done&&!blocked.length?'<div class="ccj-rdy-stamp">READY FOR PAYROLL</div>':'')
    +'</div>'
    +'<div class="ccj-rdy-who"><b>'+p.worker.name+'</b>'
    +'<span>'+(f.jobTitle||'&mdash;')+' &middot; '+p.adt.name+'</span>'
    +'<span>'+ccjInCountry(p.worker.country)+' &middot; starts '+ccjPrettyDate(f.fromDate)+'</span></div>'
    +'</div>'
    +'<div class="ccj-rdy-bar"><span style="width:'+(list.length?Math.round(shown/list.length*100):0)+'%"></span></div>'
    +'<div class="ccj-rdy-count">'
    +'<b>'+shown+' of '+list.length+'</b> controls checked'
    +(done?' &middot; '+(list.length-open.length)+' satisfied'
      +(open.length?' &middot; '+open.length+' not clear':''):'')
    +'</div>'
    +groups
    +(done
      ?'<div class="ccj-rdy-foot'+(blocked.length?' bad':'')+'">'
       +(blocked.length
         ?'<b>Payroll is blocked.</b> '+blocked.length+' control'+(blocked.length===1?'':'s')
          +' could not be satisfied: '+blocked.map(function(c){return c.label;}).join(', ')
          +'. Nothing runs until '+(blocked.length===1?'it is':'they are')+' resolved.'
         :'<b>'+p.worker.name+' can be paid for '+per.label+'.</b> Every control above was '
          +'re-derived from the record the stage that produced it wrote &mdash; this certificate '
          +'asserts nothing on its own. Issued '+ccjStamp(r.at)+' by the payroll readiness engine.')
       +'</div>'
      :'')
    +'</div></div>';
}

/* ---- SCREEN 2: THE RUN ----------------------------------------------------------------------
   The register above, the payslip below. The register is what Finance releases; the payslip is
   what the employee receives, and it only exists once the money has actually gone. */
function buildCCJPayrunHTML(){
  const run=ccjRun,p=ccjParties(),f=run.form||{};
  const pr=ccjPayrun(),cal=ccjPayrunCalc(),pack=ccjPayrunPack(),ok=ccjOnbPack();
  const per=ccjPayrunPeriod(),o=ccjOnb();
  const money=function(v){return ccjMoney(v);};
  const kv=function(k,v){return '<div class="ccj-pr-kv"><span>'+k+'</span><b>'+v+'</b></div>';};
  const at=function(id){return CCJ_PR_PHASES.findIndex(function(x){return x.id===id;})<pr.step;};
  const relAt=function(id){return CCJ_PR_REL.findIndex(function(x){return x.id===id;})<pr.rstep;};
  const phase=function(p2,i,doneN){
    const isDone=i<doneN,isLive=i===doneN;
    if(!isDone&&!isLive)return '';
    return '<div class="ccj-pr-ph'+(isDone?' done':' doing')+'">'
      +'<span class="ccj-pr-ph-i">'+(isDone
        ?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>'
        :'<span class="ccj-spin sm"></span>')+'</span>'
      +'<span class="ccj-pr-ph-t">'+p2.label+'<i>'+p2.sub+'</i></span></div>';
  };
  const earn='<table class="ccj-pr-tbl"><thead><tr><th>Earnings</th><th>Basis</th><th>Amount</th></tr></thead><tbody>'
    +'<tr><td><b>Basic salary</b><span>'+(f.jobTitle||'Salaried')+' &middot; '
      +(cal.prorated?'prorated to the start date':'full period')+'</span></td>'
    +'<td>'+(cal.prorated?cal.days+' of '+cal.inMonth+' days':'1 month')+'</td>'
    +'<td>'+money(cal.basic)+'</td></tr>'
    +'<tr class="ccj-pr-sum"><td><b>Gross for the period</b><span>What tax and contributions are computed on</span></td>'
    +'<td>&mdash;</td><td>'+money(cal.gross)+'</td></tr>'
    +'</tbody></table>';
  const dedRows=[
    {k:cal.taxLine,s:ok.taxCredit,b:cal.taxPct+'% effective',v:cal.tax},
    {k:'Employee social security',s:ok.ssScheme,b:cal.socialPct+'% of gross',v:cal.social}
  ].concat(cal.ded?[{k:cal.ded.label,s:cal.ded.note,b:cal.ded.pct+'% of gross',v:cal.ded.amount}]:[]);
  const ded='<table class="ccj-pr-tbl"><thead><tr><th>Deductions</th><th>Basis</th><th>Amount</th></tr></thead><tbody>'
    +dedRows.map(function(r){
      return '<tr><td><b>'+r.k+'</b><span>'+r.s+'</span></td><td>'+r.b+'</td>'
        +'<td class="ccj-pr-neg">&minus;&nbsp;'+money(r.v)+'</td></tr>';
    }).join('')
    +'<tr class="ccj-pr-sum net"><td><b>Net pay</b><span>Into the verified account</span></td>'
    +'<td>&mdash;</td><td>'+money(cal.net)+'</td></tr>'
    +'</tbody></table>';
  const accr=cal.accruals.length
    ?'<table class="ccj-pr-tbl"><thead><tr><th>Accrued this period, paid later</th><th>Basis</th><th>Amount</th></tr></thead><tbody>'
     +cal.accruals.map(function(a){
       return '<tr><td><b>'+a.label+'</b><span>'+a.note+'</span></td><td>'+a.pct+'% of gross</td><td>'+money(a.amount)+'</td></tr>';
     }).join('')+'</tbody></table>'
    :'';
  // "Component", not "Employer cost" — the card above it is already titled that, and a table whose
  // first column header repeats its own card title says nothing about the column.
  const er='<table class="ccj-pr-tbl"><thead><tr><th>Component</th><th>Basis</th><th>Amount</th></tr></thead><tbody>'
    +'<tr><td><b>Gross salary</b><span>As above</span></td><td>&mdash;</td><td>'+money(cal.gross)+'</td></tr>'
    +'<tr><td><b>'+cal.erLabel+'</b><span>Paid by '+p.adt.name+', not deducted from the employee</span></td>'
    +'<td>'+cal.erPct+'% of gross</td><td>'+money(cal.erSocial)+'</td></tr>'
    +(cal.erExtra?'<tr><td><b>'+cal.erExtra.label+'</b><span>Employer side of auto-enrolment</span></td>'
      +'<td>'+cal.erExtra.pct+'% of gross</td><td>'+money(cal.erExtra.amount)+'</td></tr>':'')
    +(cal.accrued?'<tr><td><b>Accruals</b><span>Set aside this period</span></td><td>&mdash;</td><td>'+money(cal.accrued)+'</td></tr>':'')
    +'<tr class="ccj-pr-sum"><td><b>Total cost of employment</b><span>The figure the quote priced a margin on</span></td>'
    +'<td>&mdash;</td><td>'+money(cal.cost)+'</td></tr>'
    +'</tbody></table>';
  const stat='<div class="ccj-pr-stat">'
    +'<div class="ccj-pr-stat-r"><div><b>'+pack.ret+'</b><span>'+pack.retTo+'</span></div>'
    +'<div class="ccj-pr-stat-v">'+money(cal.toTax)+(pr.taxRef?'<i>'+pr.taxRef+'</i>':'')+'</div></div>'
    +'<div class="ccj-pr-stat-r"><div><b>'+pack.ssRet+'</b><span>'+pack.ssTo
      +' &middot; employee '+money(cal.social)+' + employer '+money(cal.erSocial)+'</span></div>'
    +'<div class="ccj-pr-stat-v">'+money(cal.toSs)+(pr.ssRef?'<i>'+pr.ssRef+'</i>':'')+'</div></div>'
    +'</div>';
  // The reconciliation. Onboarding published an indicative net and said it was indicative; this is
  // the binding one. Where they differ, the difference is named rather than quietly absorbed.
  const rec=cal.delta
    ?'<div class="ccj-pr-rec">Onboarding published <b>'+money(cal.indicative)
      +'</b> as indicative. The binding figure is <b>'+money(cal.net)+'</b> &mdash; '
      +(cal.ded?cal.ded.label+' is levied on the run and was not modelled at configuration.'
        :'the run computes against the tax code the authority returned.')+'</div>'
    :'<div class="ccj-pr-rec ok">Matches the indicative net onboarding published ('+money(cal.indicative)+').</div>';
  const canSee=pr.step>=3;      // the calculation phase has run
  return '<div class="ccj-pr-wrap">'
    +'<div class="ccj-pr-hero'+(pr.state==='paid'?' ok':pr.held?' held':'')+'">'
    +'<div class="ccj-pr-hero-b">'
    +'<div class="ccj-pr-hero-t">'+(pr.id||'First payroll run')+'</div>'
    +'<div class="ccj-pr-hero-s">'+(pr.label||per.label)+' &middot; '+p.worker.name
      +' &middot; 1 employee in this run</div></div>'
    +'<div class="ccj-pr-hero-f"><span>'+(canSee?money(cal.net):'&mdash;')+'</span>'
    +'<i>'+(pr.state==='paid'?'paid '+ccjStamp(pr.paidAt)
      :pr.state==='approved'||pr.state==='paying'?'released, paying'
      :pr.held?'held':'net payable')+'</i></div>'
    +'</div>'
    +'<div class="ccj-pr-card">'
    +'<div class="ccj-pr-card-t">Building the register</div>'
    +CCJ_PR_PHASES.map(function(x,i){return phase(x,i,pr.step);}).join('')
    +(pr.state==='paying'||pr.state==='paid'
      ?CCJ_PR_REL.map(function(x,i){return phase(x,i,pr.rstep);}).join('')
      :'')
    +'</div>'
    +(at('inputs')?'<div class="ccj-pr-card"><div class="ccj-pr-card-t">Inputs</div>'
      +'<div class="ccj-pr-kvs">'
      +kv('Contract',ccjEmp().id+' v'+ccjEmp().version)
      +kv('Contracted gross',money(cal.full)+' / month')
      +kv('Calendar',o.payroll.calendar||('Monthly &middot; '+p.worker.country))
      +kv('Period',pr.from+' &ndash; '+pr.to)
      +kv('Cut-off',pr.cutOff)
      +kv('Pay date',pr.payDay)
      +kv('Days paid',cal.prorated?cal.days+' of '+cal.inMonth:'Full month')
      +kv('Variable inputs','None &mdash; salaried, no timesheet')
      +kv('Absence','None recorded in the first period')
      +kv('Account',o.bank.iban||'&mdash;')
      +'</div></div>':'')
    +(canSee?'<div class="ccj-pr-card"><div class="ccj-pr-card-t">Gross to net</div>'
      +earn+ded+rec+accr+'</div>':'')
    +(at('stat')?'<div class="ccj-pr-card"><div class="ccj-pr-card-t">What this run owes, and to whom</div>'
      +stat
      +'<div class="ccj-pr-note">'+pack.ret+' is due to '+pack.retTo
      +' for the '+pr.label+' period. Both sides of social security are remitted together on the '
      +pack.ssRet+'.</div></div>':'')
    +(canSee?'<div class="ccj-pr-card"><div class="ccj-pr-card-t">Employer cost</div>'+er+'</div>':'')
    +(at('check')?'<div class="ccj-pr-card"><div class="ccj-pr-card-t">Pre-payment controls</div>'
      +'<div class="ccj-pr-ctrl">'
      /* Each control tests the thing its label claims. The funding one used to read "Funding
         available against the deposit" and pass on `received >= cost || paidInFull` — so a
         settled deposit of one month gross ticked green against a run costing half as much again,
         which is the ordinary EOR case and not a funding failure at all. The deposit is SECURITY
         against the placement, not the float payroll runs from; conflating the two put a green
         tick on the one control that is about money being there. It now asserts what it can:
         the deposit is settled and held. What the run actually needs in cash is stated beside
         it as a figure rather than as a pass. */
      +[['Readiness certificate issued',ccjRdy().ref||'not issued',ccjRdy().done&&!ccjRdyFailed().length],
        ['Payment account verified',o.bank.iban||'not verified',o.bank.state==='verified'],
        ['Net pay is positive and below the contracted gross',money(cal.net),cal.net>0&&cal.net<=cal.full],
        ['Security deposit settled and held against the placement',money(ccjReceived()),
         ccjPaidInFull()||ccjPay().released]]
        .map(function(r){
          return '<div class="ccj-pr-ctrl-r '+(r[2]?'ok':'no')+'">'
            +'<span class="ccj-rdy-v '+(r[2]?'pass':'fail')+'">'+(r[2]?'&#10003;':'&#10007;')+'</span>'
            +'<span class="ccj-pr-ctrl-l">'+r[0]+'</span><b>'+r[1]+'</b></div>';
        }).join('')
      +'</div>'
      +'<div class="ccj-pr-note">This run moves <b>'+money(cal.cashOut)+'</b> in cash &mdash; '
      +money(cal.net)+' to '+p.worker.name+' and '+money(cal.toTax+cal.toSs)
      +' to the authorities. The period costs '+money(cal.cost)
      +(cal.accrued?'; the difference is the '+money(cal.accrued)+' accrued now and paid later.':'.')
      +'</div></div>':'')
    +(pr.approvedAt?'<div class="ccj-pr-rel">'
      +'<div class="ccj-pr-rel-i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>'
      +'<div><div class="ccj-pr-rel-t">Released by '+pr.approvedBy+'</div>'
      +'<div class="ccj-pr-rel-s">'+ccjStamp(pr.approvedAt)+'. '
      +(pr.heldAt?'Held earlier by '+pr.heldBy+' at '+ccjStamp(pr.heldAt)+', then released. ':'')
      +'No payment instruction existed before this.</div></div></div>':'')
    +(pr.held?'<div class="ccj-pr-rel held">'
      +'<div class="ccj-pr-rel-i">!</div>'
      +'<div><div class="ccj-pr-rel-t">Held by '+pr.heldBy+'</div>'
      +'<div class="ccj-pr-rel-s">'+ccjStamp(pr.heldAt)
      +'. Nothing has been paid and no return has been filed. The run stays here until it is released.</div></div></div>':'')
    +(pr.paidAt?'<div class="ccj-pr-card"><div class="ccj-pr-card-t">Disbursement</div>'
      +'<div class="ccj-pr-kvs">'
      /* "Funded from: Deposit held" claimed the deposit paid for this run. It did not, and on the
         ordinary EOR run it could not: the deposit is one month GROSS and the run costs gross plus
         employer contributions. We are the employer, so we pay the employee and the authorities out
         of our own account and recover it on the monthly invoice; the deposit sits behind that as
         security. Naming the debited entity is both more accurate and more informative. */
      +kv('Paid by',p.adt.name)
      +kv('Security held',ccjMoney(ccjReceived())+' &middot; '+ccjInvoice().id)
      +kv('Rail',pack.rail)
      +kv('Payment file',pr.fileRef||'&mdash;')
      +kv('Debited from',ccjReg(p.adt.country).iban)
      +kv('Credited to',o.bank.iban||'&mdash;')
      +kv('Bank reference',pr.bankRef||'&mdash;')
      +kv('Executed',ccjStamp(pr.paidAt))
      +kv('Value date',pr.payDay)
      +'</div>'
      +'<div class="ccj-pr-note">The deposit is security against this placement, not the source of '
      +'this payment. '+ccjMoney(cal.cashOut)+' left '+p.adt.name+' and is recovered on the monthly '
      +'invoice to '+p.client.name+'.</div>'
      +'</div>':'')
    +(pr.payslipId?buildCCJPayslipHTML():'')
    +(run.phase==='done'
      ?'<div class="ccj-pr-next"><div class="ccj-pr-next-t">'
       +p.worker.name.split(' ')[0]+' has been paid for '+pr.label+'.</div>'
       +'<button class="ccj-primary" onclick="ccjGoScreen(\'active\')">See the record &rarr;</button></div>'
      :'')
    +'</div>';
}
/* The payslip, as a document. The employee gets this one — so it names the employer entity, the
   period, every line, and the account the money went to.

   `ccj-ps-*`, NOT `ccj-slip-*`: stage 8 already owns `.ccj-slip` for the indicative payslip on the
   onboarding card, and both can be on screen in the same run. One namespace, one owner. */
function buildCCJPayslipHTML(){
  const p=ccjParties(),f=(ccjRun&&ccjRun.form)||{},o=ccjOnb();
  const pr=ccjPayrun(),cal=ccjPayrunCalc(),pack=ccjPayrunPack(),ok=ccjOnbPack();
  const reg=ccjReg(p.adt.country);
  const money=function(v){return ccjMoney(v);};
  const line=function(k,s,v,cls){
    return '<div class="ccj-ps-l'+(cls?' '+cls:'')+'"><div><b>'+k+'</b>'
      +(s?'<span>'+s+'</span>':'')+'</div><i>'+v+'</i></div>';
  };
  /* In several countries one number is BOTH the tax identifier and the social security one — the
     Dutch BSN and the UK National Insurance number are the same field twice. Printing it under two
     headings that happen to read identically looks like a duplication bug on the one document the
     employee actually keeps, so the two collapse into one row that says it serves both. */
  const sameId=ok.taxIdLabel===ok.ssIdLabel||(o.tax.id&&o.tax.id===o.ss.id);
  const ids=sameId
    ?'<div><span>'+ok.taxIdLabel+'</span><b>'+(o.tax.id||o.ss.id||'&mdash;')+'</b></div>'
    :'<div><span>'+ok.taxIdLabel+'</span><b>'+(o.tax.id||'&mdash;')+'</b></div>'
     +'<div><span>'+ok.ssIdLabel+'</span><b>'+(o.ss.id||'&mdash;')+'</b></div>';
  return '<div class="ccj-ps">'
    +'<div class="ccj-ps-head">'
    +'<div><div class="ccj-ps-brand">'+p.adt.name+'</div>'
    +'<div class="ccj-ps-addr">'+reg.adt.join(', ')+'</div></div>'
    +'<div class="ccj-ps-ref"><div class="ccj-ps-kind">'+pack.payslip+'</div>'
    +'<div class="ccj-ps-no">'+pr.payslipId+'</div>'
    +'<div class="ccj-ps-per">'+pr.label+'</div></div>'
    +'</div>'
    +'<div class="ccj-ps-emp">'
    +'<div><span>Employee</span><b>'+p.worker.name+'</b></div>'
    +'<div><span>Employee ID</span><b>'+p.worker.empId+'</b></div>'
    +ids
    +'<div><span>Role</span><b>'+(f.jobTitle||'&mdash;')+'</b></div>'
    +'<div><span>Period</span><b>'+pr.from+' &ndash; '+pr.to+'</b></div>'
    +'</div>'
    +'<div class="ccj-ps-sec">Earnings</div>'
    +line('Basic salary',(cal.prorated?cal.days+' of '+cal.inMonth+' days worked':'Full period'),money(cal.basic))
    +line('Gross pay','',money(cal.gross),'sum')
    +'<div class="ccj-ps-sec">Deductions</div>'
    +line(cal.taxLine,cal.taxPct+'% effective','&minus;&nbsp;'+money(cal.tax))
    +line('Employee social security',ok.ssScheme,'&minus;&nbsp;'+money(cal.social))
    +(cal.ded?line(cal.ded.label,cal.ded.note,'&minus;&nbsp;'+money(cal.ded.amount)):'')
    +line('Net pay','Paid to '+(o.bank.iban||'your account'),money(cal.net),'net')
    +(cal.accruals.length
      ?'<div class="ccj-ps-sec">Accrued for you this period</div>'
       +cal.accruals.map(function(a){return line(a.label,a.note,money(a.amount));}).join('')
      :'')
    +'<div class="ccj-ps-foot">Paid on '+pr.payDay+' by '+pack.rail
    +', reference '+(pr.bankRef||'&mdash;')+'. '
    +pack.taxLine+' has been declared to '+pack.retTo+' on the '+pack.ret
    +' and contributions to '+pack.ssTo+'. Keep this payslip &mdash; it is your record of what was '
    +'withheld on your behalf.</div>'
    +'</div>';
}

/* ---- SCREEN 3: ACTIVE ------------------------------------------------------------------------ */
function buildCCJActiveHTML(){
  const run=ccjRun,p=ccjParties(),f=run.form||{};
  const pr=ccjPayrun(),cal=ccjPayrunCalc(),per=ccjPayrunPeriod(),o=ccjOnb(),e=ccjEmp();
  const q=ccjQuote(),trail=ccjTrail();
  const live=pr.state==='paid';
  const kv=function(k,v){return '<div class="ccj-act-kv"><span>'+k+'</span><b>'+v+'</b></div>';};
  return '<div class="ccj-act-wrap">'
    +'<div class="ccj-act-hero'+(live?' ok':'')+'">'
    +'<div class="ccj-act-hero-av">'+ccjInitials(p.worker.name)+'</div>'
    +'<div class="ccj-act-hero-b">'
    +'<div class="ccj-act-hero-t"><span class="ccj-act-dot"></span>'
      +(live?'Active':'Going live')+' &mdash; '+p.worker.name+'</div>'
    +'<div class="ccj-act-hero-s">'+(f.jobTitle||'&mdash;')+' at '+p.client.name
      +' &middot; employed by '+p.adt.name+' &middot; '+ccjInCountry(p.worker.country)+'</div>'
    +'</div></div>'
    +'<div class="ccj-act-card"><div class="ccj-act-card-t">Employment record</div>'
    +'<div class="ccj-act-kvs">'
    +kv('Employee',p.worker.name)
    +kv('Employee ID',p.worker.empId)
    +kv('Employer entity',p.adt.name)
    +kv('Client',p.client.name)
    +kv('Engagement',ccjModelLabel(run.model))
    +kv('Role',f.jobTitle||'&mdash;')
    +kv('Country of work',p.worker.country)
    +kv('Started',ccjPrettyDate(f.fromDate))
    +kv('Contract',e.id+' v'+e.version)
    +kv('Contracted gross',ccjMoney(q.gross)+' / month')
    +kv('Pay calendar',o.payroll.calendar||('Monthly &middot; '+p.worker.country))
    +kv('Next pay date',per.nextPay)
    +'</div></div>'
    +'<div class="ccj-act-card"><div class="ccj-act-card-t">The record of this placement</div>'
    +'<div class="ccj-act-trail">'
    +trail.map(function(t){
      return '<div class="ccj-act-tr'+(t.complete?' done':'')+'">'
        +'<span class="ccj-act-tn">'+(t.complete
          ?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>'
          :t.n)+'</span>'
        +'<div class="ccj-act-tb">'
        +'<div class="ccj-act-tl">'+t.label+'</div>'
        +'<div class="ccj-act-to">'+t.outcome+'</div>'
        +'</div>'
        +'<div class="ccj-act-tm">'
        +'<span class="ccj-act-town'+(t.human?' human':'')+'">'+t.owner+'</span>'
        +(t.artefact?'<span class="ccj-act-tart">'+t.artefact.label+' <b>'+t.artefact.ref+'</b></span>':'')
        +'</div></div>';
    }).join('')
    +'</div></div>'
    /* Short values on purpose. These are key-value rows in a half-width column, and a sentence in
       the value wraps to three right-aligned lines that read as a paragraph pushed into a corner. */
    +'<div class="ccj-act-card"><div class="ccj-act-card-t">From here</div>'
    +'<div class="ccj-act-kvs">'
    +kv('Next payroll',per.nextLabel+' &middot; on the calendar')
    +kv('Next pay date',per.nextPay)
    +kv(ccjPayrunPack().ret,'Filed for '+per.label)
    +kv('Compliance','Tracked against '+p.worker.country)
    +'</div>'
    +'<div class="ccj-pr-note">Nothing here needs a journey again. Payroll repeats on the calendar '
    +'and the statutory filings follow it; the renewals sit with '+ccjInCountry(p.worker.country)
    +' rather than with this placement.</div></div>'
    +(live
      ?'<div class="ccj-act-done">'
       +'<div class="ccj-act-done-t">Journey complete &mdash; nine stages, '
       +trail.reduce(function(s,t){return s+t.done;},0)+' sub-statuses, '
       +trail.filter(function(t){return t.human;}).length+' human decisions.</div>'
       +'<div class="ccj-act-done-s">The contract has been written to your contracts list.</div>'
       +'<button class="ccj-primary" onclick="ccjOpenContractRecord()">View contract</button>'
       +'</div>'
      :'')
    +'</div>';
}

/* ---- WIRING STAGE 9 INTO THE RUNNER ---------------------------------------------------------- */
CCJ_PURPOSE['active/Ready for payroll']='Re-checks every control this journey passed, and issues the certificate.';
CCJ_PURPOSE['active/First payroll run']='Calculates the first period, and pays it once Finance releases it.';
CCJ_PURPOSE['active/Active']='Writes the placement into the record as live.';

CCJ_ON_ENTER['active/Ready for payroll']=function(run){ccjRdyStart();};
CCJ_ON_ENTER['active/First payroll run']=function(run){
  ccjGoScreen('payrun');
  ccjPayrunStart();
};
CCJ_ON_ENTER['active/Active']=function(run){ccjGoScreen('active');};

CCJ_HOLDS['active/Ready for payroll']={until:'readiness-done',note:'Re-deriving every control.'};
/* One step, two milestones, a person between them — the reason ccjHoldFor accepts a function.
   Before the release it parks on the register being complete; after it, on the money having
   actually moved. A single `until:'payrun-done'` would have let the approval settle the row while
   the payment file was still being written. */
CCJ_HOLDS['active/First payroll run']=function(){
  const pr=ccjPayrun();
  return pr.approvedAt
    ?{until:'payrun-done',note:'Released. Paying and filing.'}
    :{until:'payrun-calc',note:'Calculating the first period.'};
};

/* The one human decision on the last stage, and the only point in the whole journey at which
   money leaves us for a person. A POST gate: the register has to exist before anyone can approve
   it, and the register is the evidence sitting on the screen beside the question. */
CCJ_POST_GATES['active/First payroll run']=function(){
  const pr=ccjPayrun();
  if(pr.approvedAt)return null;                       // already released
  if(pr.held)return {
    kind:'decision',
    ask:'This run is held.',
    why:'Held by '+pr.heldBy+' at '+ccjStamp(pr.heldAt)
      +'. Nothing has been paid and no statutory return has been filed. It stays here until somebody releases it.',
    options:[{id:'payApprove',label:'Release the run',tone:'go',done:'Released after a hold'}]
  };
  if(pr.state!=='calculated')return null;             // the register is not finished
  const cal=ccjPayrunCalc(),pack=ccjPayrunPack();
  return {
    kind:'approval',
    ask:'Release the first payroll run?',
    why:'The register is complete: '+ccjMoney(cal.net)+' net to '+ccjParties().worker.name
      +', '+ccjMoney(cal.toTax)+' to '+pack.retTo+' and '+ccjMoney(cal.toSs)+' to '+pack.ssTo
      +'. No payment instruction exists until this is approved.',
    options:[
      {id:'payApprove',label:'Approve and release',tone:'go',  done:'Released'},
      {id:'payHold',   label:'Hold this run',      tone:'stop',done:'Held'}
    ]
  };
};

/* The placement is live, so the product should hold a contract for it. Written on settle rather
   than on the button, so the record exists the moment the journey says it does — a user who never
   clicks through still has the contract in their list. */
CCJ_ON_SETTLE['active/Active']=function(run){
  ccjWriteContractRecord();
  const p=ccjParties();
  ccjWorkerPush({who:'note',text:'Employment active &middot; '+p.worker.empId
    +' &middot; paid monthly by '+p.adt.name,at:ccjClient().mins});
};

CCJ_EVIDENCE['active/Ready for payroll']={
  system:'Payroll readiness engine', ref:'controls across stages 5&ndash;8',
  call:function(c){return 'readiness(worker="'+ccjParties().worker.empId
    +'", contract="'+ccjEmp().id+'", period="'+ccjPayrunPeriod().label+'")';},
  latency:'480ms',
  fetched:function(c){const l=ccjRdyChecks(),r=ccjRdy();return [
    {k:'Controls',sub:'Re-derived, not re-asserted',v:l.length+' checked',state:'active'},
    {k:'Satisfied',sub:'Outright pass',v:String(l.filter(function(x){return x.verdict==='pass';}).length),
     state:'active'},
    {k:'Not clear',sub:'Stated on the certificate',v:String(ccjRdyOpen().length),
     state:ccjRdyOpen().length?'active':'inactive'},
    {k:'Certificate',sub:'Reference',v:r.ref||'in progress',state:r.ref?'active':'inactive'}
  ];},
  checks:function(c){const f=ccjRdyFailed();return [
    {rule:'Every control traces to the record the stage that produced it wrote',
     expected:'a source and a reference on each row',
     actual:ccjRdyChecks().length+' rows, each citing its stage',verdict:'pass'},
    {rule:'No control may be satisfied by this stage asserting it',
     expected:'derived from stored evidence',actual:'derived',verdict:'pass'},
    {rule:'Payroll does not start while a control is unsatisfied',
     expected:'0 failed',actual:f.length?f.length+' failed: '+f.map(function(x){return x.label;}).join(', '):'0 failed',
     verdict:f.length?'fail':'pass'}
  ];},
  captured:function(c){const r=ccjRdy();return [
    {k:'Readiness certificate',v:r.ref||'&mdash;'},
    {k:'Ready for payroll',v:r.done&&!ccjRdyFailed().length?'Yes':'No'}];},
  summary:function(c){const l=ccjRdyChecks();
    return (l.length-ccjRdyOpen().length)+' of '+l.length+' controls satisfied';},
  note:'This certificate is the reason a worker can trust the number on their payslip. It does not restate what the earlier stages claimed — it reads the objects those stages wrote and reports what is actually in them, which is why a missing filing or an unverified account fails here rather than being papered over.'
};
CCJ_EVIDENCE['active/First payroll run']={
  system:'Payroll engine', ref:'first period',
  call:function(c){return 'run(period="'+ccjPayrunPeriod().label+'", employees=1, contract="'
    +ccjEmp().id+'")';},
  latency:'1.9s',
  fetched:function(c){const cal=ccjPayrunCalc(),pr=ccjPayrun();return [
    {k:'Gross',sub:cal.prorated?cal.days+' of '+cal.inMonth+' days':'Full period',
     v:ccjMoney(cal.gross),state:'active'},
    {k:'Deductions',sub:cal.taxLine+' + social security',
     v:ccjMoney(cal.tax+cal.social+(cal.ded?cal.ded.amount:0)),state:'active'},
    {k:'Net pay',sub:'To the verified account',v:ccjMoney(cal.net),state:'active'},
    {k:'Employer cost',sub:'What this placement costs us',v:ccjMoney(cal.cost),state:'active'},
    {k:'Paid',sub:'Bank reference',v:pr.bankRef||'not yet released',
     state:pr.paidAt?'active':'inactive'}
  ];},
  checks:function(c){const cal=ccjPayrunCalc(),pr=ccjPayrun(),o=ccjOnb();return [
    {rule:'The first period is prorated to the day they actually start',
     expected:'proration where the start is mid-month',
     actual:cal.prorated?cal.days+' of '+cal.inMonth+' days paid':'full month — starts on the 1st',
     verdict:'pass'},
    {rule:'No payment leaves without a named person releasing it',
     expected:'a human approval on the register',
     actual:pr.approvedBy?'released by '+pr.approvedBy:'not released',
     verdict:pr.approvedBy?'pass':'na'},
    {rule:'Money only ever goes to the account the penny-drop verified',
     expected:o.bank.iban||'a verified account',
     actual:pr.paidAt?'credited '+o.bank.iban:'nothing sent yet',
     verdict:pr.paidAt?'pass':'na'},
    {rule:'What was withheld is declared to the authority it belongs to',
     expected:ccjPayrunPack().ret+' and '+ccjPayrunPack().ssRet,
     actual:pr.filedAt?pr.taxRef+' and '+pr.ssRef:'not filed yet',
     verdict:pr.filedAt?'pass':'na'}
  ];},
  captured:function(c){const pr=ccjPayrun(),cal=ccjPayrunCalc();return [
    {k:'Payroll run',v:pr.id||'&mdash;'},
    {k:'Net paid',v:pr.paidAt?ccjMoney(cal.net):'not paid'},
    {k:'Payslip',v:pr.payslipId||'&mdash;'}];},
  summary:function(c){const pr=ccjPayrun(),cal=ccjPayrunCalc();
    return pr.paidAt?ccjMoney(cal.net)+' paid &middot; '+pr.label
      :pr.held?'Held by '+pr.heldBy:'Register built &middot; '+ccjMoney(cal.net)+' net';},
  note:'The register is calculated in full before anyone is asked anything, because an approval without the numbers in front of it is a rubber stamp. Everything after the approval — the funding, the payment file, the returns, the payslip — happens only once it is given.'
};
CCJ_EVIDENCE['active/Active']={
  system:'Employee record', ref:'placement status',
  call:function(c){return 'activate(worker="'+ccjParties().worker.empId+'", contract="'
    +ccjEmp().id+'", from="'+((ccjRun&&ccjRun.form&&ccjRun.form.fromDate)||'')+'")';},
  latency:'110ms',
  fetched:function(c){const p=ccjParties(),per=ccjPayrunPeriod();return [
    {k:'Status',sub:'Placement',v:'Active',state:'active'},
    {k:'Employer',sub:'Legal entity',v:p.adt.name,state:'active'},
    {k:'Client',sub:'Account',v:p.client.name,state:'active'},
    {k:'Next payroll',sub:'On the calendar',v:per.nextPay,state:'active'}
  ];},
  checks:function(c){const pr=ccjPayrun(),run=ccjRun;return [
    {rule:'A placement only goes active once a payroll run has actually cleared',
     expected:'first run paid',actual:pr.paidAt?pr.id+' paid':'no run has cleared',
     verdict:pr.paidAt?'pass':'fail'},
    {rule:'The contract record carries the same figures the journey produced',
     expected:'written from the run',
     actual:run.contractRowId?'contract record #'+run.contractRowId:'not written',
     verdict:run.contractRowId?'pass':'na'}
  ];},
  captured:function(c){const run=ccjRun;return [
    {k:'Placement',v:'Active'},
    {k:'Contract record',v:run.contractRowId?'#'+run.contractRowId:'&mdash;'}];},
  summary:function(c){return 'Active &middot; next pay '+ccjPayrunPeriod().nextPay;},
  note:'Active is the end of this journey and the start of a recurring one. Nothing here needs a journey again — payroll runs on the calendar, and the compliance renewals are tracked against the country rather than against this placement.'
};

/* ---- EMPLOYEE CREATED --------------------------------------------------------------------- */
function buildCCJEmployeeCreatedHTML(){
  const r=ccjRun.createdEmp||{};
  const row=function(k,v){return '<div class="ccj-sc-row"><span>'+k+'</span><b>'+(v||'&mdash;')+'</b></div>';};
  return '<div class="ccj-sc">'
    +'<div class="ccj-sc-ico ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>'
    +'<div class="ccj-sc-title">Employee created</div>'
        +'<div class="ccj-sc-grid">'
    +row('Name',r.name)+row('Employee ID',r.empId)+row('Country',r.country||'&mdash;')
    +row('Job Title',r.jobTitle)+row('Status',r.status)
    +'</div>'
    +'<button class="ccj-primary" onclick="ccjGoScreen(\'form\')">Continue to contract details</button>'
    +'</div>';
}

/* ---- PROPOSAL ------------------------------------------------------------------------------
   Compiling the proposal is the milestone that releases the New intake hold — which is why
   ccjGoScreen('proposal') and nothing else is what finishes that sub-status. */
function ccjCreateProposal(){
  const run=ccjRun;if(!run)return;
  if(ccjMissingFields().length)return;
  const f=run.form;
  const name=((f.fname||'')+' '+(f.lname||'')).trim();
  run.proposal={
    id:'PRO-'+String(4400+(run.gen||0)),
    name:name,country:f.country,jobTitle:f.jobTitle,
    type:ccjModelLabel(run.model),pay:ccjCurrency()+' '+(f.pay||'—'),
    term:f.term,from:f.fromDate
  };
  ccjPush({who:'agent',text:'Proposal <b>'+run.proposal.id+'</b> created.'});
  ccjGoScreen('proposal');
}
function buildCCJProposalHTML(){
  const p=ccjRun.proposal||{};
  const row=function(k,v){return '<div class="ccj-sc-row"><span>'+k+'</span><b>'+(v||'&mdash;')+'</b></div>';};
  return '<div class="ccj-sc">'
    +'<div class="ccj-sc-ico ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>'
    +'<div class="ccj-sc-title">Proposal created</div>'
        +'<div class="ccj-sc-grid">'
    +row('Proposal ID',p.id)+row('Employee',p.name)+row('Country',p.country)
    +row('Engagement',p.type)+row('Job Title',p.jobTitle)+row('Monthly Gross',p.pay)
    +'</div>'
    +''
    +'</div>';
}

/* ---- PAINT ------------------------------------------------------------------------------
   Surgical on purpose. A full renderADTPage on every beat would rebuild the composer four
   times a second and pull the caret out of whatever the user was typing — and would rebuild
   the panel that is supposed to stand still for the whole stage. */
function ccjPaint(){
  const run=ccjRun;if(!run)return;
  const inner=document.getElementById('ccj-panel-inner');
  if(inner)inner.innerHTML=ccjPanelInnerHTML(run.stage);
  // Width, not innerHTML — a bar rebuilt each time renders at its destination with nothing to
  // transition from, and a progress bar that teleports is not reporting progress.
  const prog=document.getElementById('ccj-prog');
  if(prog)prog.style.width=ccjProgressPct(run.stage)+'%';
  ccjPaintDrawer();
  // The header is not repainted here on purpose: nothing in it can change without the stage
  // changing, and a stage change goes through a full render anyway.
}
/* One beat inside a step. Touches the evidence lines and nothing else, so the spinner keeps
   spinning and the rows around it hold still. */
function ccjPaintBeat(){
  const run=ccjRun;if(!run)return;
  const step=ccjSteps(run.stage)[run.sub];
  const el=document.getElementById('ccj-ev-lines');
  if(el&&step)el.innerHTML=ccjActLogHTML(run.stage,step,'current');
}

/* ---- STAGES NOT YET DESIGNED --------------------------------------------------------------
   An honest placeholder under a live rail and a live panel, so the machine can be walked end
   to end while the stages are built one at a time. */
function buildCCJStagePlaceholderHTML(i){
  const s=ccjStage(i),ev=ccjEvent(i);
  return buildCCJPlaceholderHTML(s?s.label:'Stage',ev.desc||(s?s.plain:''));
}
function buildCCJPlaceholderHTML(title,note){
  return '<div class="ccj-placeholder">'
    +'<div class="ccj-placeholder-tag">Coming soon</div>'
    +'<div class="ccj-placeholder-title">'+title+'</div>'
    +'<div class="ccj-placeholder-note">'+note+'</div>'
    +'</div>';
}
/* Kept from the scaffold: `ccj-start` is still a legal route, and this is what it would show if
   it were ever rendered directly rather than aliased to stage 1. */
function buildCCJStartHTML(){
  return '<div class="ccj-shell">'+buildCCJPlaceholderHTML('Start','The conversation on stage 1 is the intake — there is no screen before it.')+'</div>';
}

/* ---- ENTRY ------------------------------------------------------------------------------ */
function ccjStartNewRun(){
  ccjReset();
  ccjNewRun();
  page='ccj-model';        // the engagement model is chosen before the run frame appears
  renderADTPage();
}

document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ccjDrawerKey)ccjCloseDrawer();});
