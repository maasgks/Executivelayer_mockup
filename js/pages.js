// -- DASHBOARD: tab bar + per-role tab dispatch --
function buildDashboardTabsHTML(){
  const tabs=dashboardTabsForRole(portalRole);
  if(tabs.length<2)return '';
  if(!tabs.some(t=>t.id===dashboardTab))dashboardTab=tabs[0]?tabs[0].id:'employee';
  return '<div class="dash-tabs">'+tabs.map(function(t){
    return '<button class="dash-tab'+(dashboardTab===t.id?' active':'')+'" onclick="switchDashboardTab(\''+t.id+'\')">'+t.label+'</button>';
  }).join('')+'</div>';
}
function buildDashboardPageHTML(){
  const tabs=dashboardTabsForRole(portalRole);
  if(!tabs.some(t=>t.id===dashboardTab))dashboardTab=tabs[0]?tabs[0].id:'employee';
  const body=dashboardTab==='super-admin'?buildSuperAdminDashboardHTML()
    :dashboardTab==='entity-admin'?buildEntityAdminDashboardHTML()
    :portalRole==='entity-user'?buildPersonaRoleDashboardHTML(dashboardTab)
    :dashboardContentHTML;
  return buildDashboardTabsHTML()+body;
}

function dashStat(label,val,sub,kind){
  const color=kind==='green'?'#16a34a':kind==='red'?'#dc2626':kind==='orange'?'var(--orange)':'var(--navy)';
  return '<div class="stat-card"><div class="stat-label"><span>'+label+'</span></div><div class="stat-val" style="color:'+color+'">'+val+'</div><div class="stat-sub">'+(sub||'')+'</div></div>';
}
// -- Interactive stat card: same hero-tile treatment as Super Admin/Entity Admin dashboards. pageId is optional — omit it when no matching page exists yet, and the card renders without a click action. customClick (raw JS, e.g. to pre-set a filter before navigating) overrides the plain navigatePage(pageId) call when given. --
function dashStatNav(label,val,sub,kind,icon,pageId,customClick,flatVal){
  const colorClass=kind==='green'?'cfg-hero-green':kind==='red'?'cfg-hero-red':kind==='orange'?'cfg-hero-orange':kind==='teal'?'cfg-hero-teal':kind==='violet'?'cfg-hero-violet':'cfg-hero-blue';
  const valColor=flatVal?'var(--navy)':kind==='green'?'#16a34a':kind==='red'?'#dc2626':kind==='orange'?'var(--orange)':kind==='teal'?'#0d9488':kind==='violet'?'#7c3aed':'var(--navy)';
  const click=customClick?' onclick="'+customClick+'"':pageId?' onclick="navigatePage(\''+pageId+'\')"':'';
  const staticClass=(pageId||customClick)?'':' dash-stat-static';
  return '<div class="stat-card ea-hero-stat '+colorClass+staticClass+'"'+click+'><div class="stat-label"><span>'+label+'</span><div class="stat-icon">'+icon+'</div></div><div class="stat-val" style="color:'+valColor+'">'+val+'</div><div class="stat-sub">'+(sub||'')+'</div></div>';
}
function dashAction(title,sub,icon){
  return '<div class="dash-action-card"><div class="dash-action-icon">'+(icon||'')+'</div><div><div class="dash-action-title">'+title+'</div><div class="dash-action-sub">'+sub+'</div></div></div>';
}
function dashTable(title,columns,rows,link){
  return '<div class="listing-card dash-panel"><div class="dash-panel-head"><div>'+title+'</div>'+(link?'<span>'+link+'</span>':'')+'</div><table class="listing-table dash-table"><thead><tr>'+columns.map(function(c){return '<th>'+c+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>';
}
function statusMini(text,type){return '<span class="dash-status '+(type||'pending')+'">'+text+'</span>';}
const dashIcoDoc='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
const dashIcoUser='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
const dashIcoMoney='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
const dashIcoShield='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
const dashIcoCalendar='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
const dashIcoAlert='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
function buildPersonaRoleDashboardHTML(tab){
  const p=getActivePersona();
  if(tab==='hr')return buildHRDashboardHTML();
  if(tab==='manager')return buildReportingManagerDashboardHTML(p);
  if(tab==='finance-approval'||tab==='finance-admin')return buildFinanceApprovalDashboardHTML();
  if(tab==='compliance')return buildComplianceDashboardHTML();
  if(tab==='ops')return buildOpsDashboardHTML();
  if(tab==='ops-approvals')return buildOpsApprovalsDashboardHTML();
  if(tab==='sales'||tab==='sales-approvals')return buildSalesDashboardHTML(p,tab);
  if(tab==='sales-team')return buildSalesTeamDashboardHTML();
  if(tab==='contracts-admin')return buildContractsAdminDashboardHTML();
  if(tab==='it-admin')return buildITAdminDashboardHTML();
  return buildPersonaDashboardHTML();
}
function dashHeader(title,sub){
  return '<div class="dash-ref"><div class="dash-ref-title">'+title+'</div><div class="dash-ref-sub">'+sub+'</div>';
}

// -- MANUAL MODE: live run cards reused on persona dashboards (same visual language as Operations Cockpit) --
function manualRunCardHTML(r,opts){
  opts=opts||{};
  const c=cockpitRunComputed(r);
  const slaClass=r.slaRisk==='High'?'inactive':r.slaRisk==='Medium'?'unapproved':'active';
  const slaPriorityLabel={High:'High Priority',Medium:'Medium Priority',Low:'Low Priority'};
  const progressBar='<div class="cockpit-progress"><span style="width:'+c.progress+'%"></span></div><div class="cockpit-progress-meta"><span>'+c.progress+'% complete</span><span>'+(c.st.name||'Current step')+'</span></div>';
  const actionBtn=opts.actionBtn?opts.actionBtn(r):'';
  const cardClick=opts.cardClick?opts.cardClick(r):("openManualRunPreviewModal('"+r.runId+"')");
  return '<div class="cockpit-run-card" onclick="'+cardClick+'">'
    +'<div class="cockpit-run-head"><div class="cockpit-run-head-main"><div class="cockpit-run-id">'+r.runId+'</div><div class="cockpit-run-entity">'+(r.entity||'Dhi Hyperlocal')+'</div></div><span class="status-pill '+slaClass+'">'+(slaPriorityLabel[r.slaRisk]||r.slaRisk)+'</span></div>'
    +progressBar
    +'<div class="cockpit-run-mini-sub"><span>'+(r.subject||c.j.name||r.journeyId)+'</span>'+actionBtn+'</div>'
    +'</div>';
}
function manualRunListPanelHTML(title,runs,emptyText,opts){
  opts=opts||{};
  const body=runs.length
    ?'<div class="cockpit-run-list">'+runs.map(function(r){return manualRunCardHTML(r,opts);}).join('')+'</div>'
    :'<div class="cockpit-empty-state">'+emptyText+'</div>';
  return '<div class="listing-card dash-panel'+(opts.bare?' cockpit-run-panel':'')+'"><div class="dash-panel-head"><div>'+title+'</div></div>'+body+'</div>';
}
function buildMyCreatedRunsPanelHTML(personaId){
  const runs=manualJourneyRuns.filter(function(r){return r.journeyId==='contract-creation'&&r.createdBy===personaId;});
  // -- Jump straight into the ongoing journey run, not the preview modal — this is "my open deals," so one click should land on the live journey. --
  const cardClick=function(r){return "selectedManualRunId='"+r.runId+"';manualJourneyBackPage=page||'ai-executive';page='manual-journey-run';renderADTPage();";};
  return manualRunListPanelHTML('Open Deals',runs,'No open deals yet — create a contract to start one.',{cardClick:cardClick,bare:true});
}
function buildComplianceLiveQueuePanelHTML(){
  const runs=manualJourneyRuns.filter(function(r){
    if(r.journeyId!=='contract-creation'||r.status==='Completed')return false;
    const st=manualJourneySteps(r.journeyId)[r.currentStepIdx];
    return st&&st.ownerRole==='Compliance Officer';
  });
  const actionBtn=function(r){return '<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openComplianceHubForRun(\''+r.runId+'\')">Mark Complete</button>';};
  return manualRunListPanelHTML('Pending Compliance Checks',runs,'No contract journeys waiting on Compliance.',{actionBtn:actionBtn});
}
function buildHRLiveRunsPanelHTML(){
  const runs=manualJourneyRuns.filter(function(r){return r.journeyId==='contract-creation'&&r.currentStepIdx>=8&&r.status!=='Completed';});
  return manualRunListPanelHTML('Contract Journeys Ready for HR',runs,'No contract journeys have reached HR yet.');
}
// -- MANUAL MODE: "My Tasks" panel of manual-journey runs currently waiting on the active persona, across Contract Creation / Payroll Creation / H2R Lifecycle. Complements (does not replace) any journey-specific Dashboard queue panel, e.g. buildComplianceLiveQueuePanelHTML. --
function myPendingManualRuns(personaId){
  return manualJourneyRuns.filter(function(r){
    if(r.status==='Completed')return false;
    const st=manualJourneySteps(r.journeyId)[r.currentStepIdx];
    return st&&manualStepOwnerPersonaId(st.ownerRole)===personaId;
  });
}
function openMyManualTask(runId){
  const run=getManualRun(runId);if(!run)return;
  const step=manualJourneySteps(run.journeyId)[run.currentStepIdx];
  if(step&&step.modulePage==='compliance'){openComplianceHubForRun(runId);return;}
  const tab=ctTabForManualStep(step);
  if(run.journeyId==='contract-creation'&&run.contractRecordId&&tab&&contractsData.some(function(c){return c.id===run.contractRecordId;})){
    navigatePage('contracts');
    openCtSidebar(run.contractRecordId,tab,null,run.runId);
    return;
  }
  if(step&&step.modulePage==='direct'){
    const emp=directEmpData.find(function(e){return e.onboardingRunId===runId;});
    if(emp){navigatePage('direct');openDeSidebar(emp.id);return;}
  }
  if(step&&step.modulePage==='payroll'){
    const emp=payrollEmpData.find(function(e){return e.readinessRunId===runId;});
    if(emp){navigatePage('payroll');openPrSidebar(emp.id,run.runId);return;}
  }
  selectedManualRunId=runId;manualJourneyBackPage='my-tasks';page='manual-journey-run';renderADTPage();
}
function buildMyPendingManualTasksHTML(){
  const runs=myPendingManualRuns(activePersonaId);
  // -- Blockers/approvals on runs I own get the same exception card + Resolve action Entity Admin uses in Ops Cockpit (no Notify button here — I am the owner, not someone to nudge). Runs with nothing to resolve yet keep the plain progress card. --
  const queueItems=cockpitQueueItems(runs);
  const flagged={};
  queueItems.forEach(function(x){flagged[x.run.runId]=true;});
  const plainRuns=runs.filter(function(r){return !flagged[r.runId];});
  const exceptionsHTML=queueItems.map(function(x){
    return exceptionQueueCardHTML(x,{hideNotify:true,flagNotified:true,hideDeptLink:true,cardClick:"openManualRunPreviewModal('"+x.run.runId+"')"});
  }).join('');
  const actionBtn=function(r){return '<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openMyManualTask(\''+r.runId+'\')">Open</button>';};
  const plainHTML=plainRuns.length?'<div class="cockpit-run-list">'+plainRuns.map(function(r){return manualRunCardHTML(r,{actionBtn:actionBtn});}).join('')+'</div>':'';
  const body=(exceptionsHTML||plainHTML)
    ?(exceptionsHTML?'<div class="cockpit-ex-list" style="margin-bottom:'+(plainHTML?'14px':'0')+'">'+exceptionsHTML+'</div>':'')+plainHTML
    :'<div class="cockpit-empty-state">No manual-journey steps are waiting on you right now.</div>';
  return '<div class="dash-panel cockpit-run-panel"><div class="dash-panel-head"><div>Journeys Waiting On You</div></div>'+body+'</div>';
}
function buildHRDashboardHTML(){
  return dashHeader('HR Dashboard','Overview of your workforce and HR operations.')
    +'<div class="stat-grid dash-stat-grid">'+dashStatNav('Total Employees','148','Across 6 departments',null,dashIcoUser,'direct')+dashStatNav('On Leave Today','12','8% attendance','green',dashIcoCalendar,'all-leaves')+dashStatNav('Birthdays Today','5','Send wishes',null,dashIcoCalendar)+dashStatNav('Pending Requests','8','Review now','orange',dashIcoDoc,'all-leaves')+dashStatNav('Payroll Status','Ready','Current cycle is on track','green',dashIcoMoney,'payroll')+dashStatNav('Payroll Blockers','4','Resolve before payroll run','orange',dashIcoMoney,'payroll')+dashStatNav('Onboarding Pending','7','Employees awaiting setup','orange',dashIcoUser)+dashStatNav('Document Verification Pending','9','Documents awaiting review','orange',dashIcoShield,'compliance')+'</div>'
    +'<div class="dash-actions">'+dashAction('Add Employee','Onboard a new team member',dashIcoUser)+dashAction('Upload Policy','Share company policies',dashIcoDoc)+dashAction('Add Holiday','Create company holidays',dashIcoDoc)+'</div>'
    +'<div class="dash-two-col">'+dashTable('Leave Requests',['Employee','Leave Type','Date','Status'],[['Ramesh Patel','Sick Leave','20 May',statusMini('Pending','pending')],['Priya Sharma','Casual Leave','22 May',statusMini('Approved','approved')],['Aishi Verma','Earned Leave','23-25 May',statusMini('Approved','approved')],['Arjun Desai','Sick Leave','28 May',statusMini('Pending','pending')]],'View all')+dashTable('Holidays',['Date','Holiday','Type'],[['09','Ugadi','Registered'],['14','Telangana Formation Day','Registered'],['18','Good Friday','Relaxed'],['22','Eid-ul-Fitr','Relaxed'],['01','May Day','National']], 'View calendar')+'</div>'
    +dashTable('Birthdays & Anniversaries',['Person','Event','Date','Department'],[['Ramesh Patel','Birthday','18 May','HR'],['Ashirwad Koul','Birthday','16 May','Operations'],['Chishan Sirangi','1 yr anniversary','15 May','Finance'],['Gojendra Singh','Birthday','23 May','Compliance']], 'View more')
    +buildHRLiveRunsPanelHTML()+'</div>';
}
function buildReportingManagerDashboardHTML(p){
  return dashHeader('Team Dashboard','Track your direct reports, approvals, and team performance.')
    +'<div class="stat-grid dash-stat-grid">'+dashStatNav('My Team','12','Direct reports',null,dashIcoUser)+dashStatNav('Present Today','9','75% of team','green',dashIcoCalendar,'all-timesheet')+dashStatNav('Pending Approvals','6','Items waiting for action','orange',dashIcoDoc,'my-tasks')+dashStatNav('On Leave Today','2','Utkarsh, Ashneet',null,dashIcoCalendar,'all-leaves')+'</div>'
    +'<div class="dash-actions">'+dashAction('Approve Leaves','Review pending leave requests',dashIcoDoc)+dashAction('Approve Expenses','Manage expense claim approvals',dashIcoMoney)+'</div>'
    +'<div class="dash-two-col">'+dashTable('Team Leave Requests',['Employee','Leave Type','Duration','Days','Action'],[['Utkarsh Shukla','Casual Leave','15 - 16 May','2',statusMini('Approve','approved')+' '+statusMini('Reject','rejected')],['Ashneet Kaur','Sick Leave','18 May','1',statusMini('Approve','approved')+' '+statusMini('Reject','rejected')],['Sneha Kulkarni','Earned Leave','22 - 23 May','2',statusMini('Approve','approved')+' '+statusMini('Reject','rejected')]],'View all')+dashTable('Pending Expense Claims',['Employee','Amount','Category','Status'],[['Diksha Kumari','Rs 2,400','Travel',statusMini('Pending','pending')],['Pardeep Verga','Rs 850','Office Supplies',statusMini('Pending','pending')],['Deepak Joshi','Rs 5,200','Software',statusMini('Pending','pending')]],'View all')+'</div></div>';
}
function buildSalesTeamDashboardHTML(){
  const queues=dashTable('Proposal Approval Queue',['Proposal','Client','Margin','Action'],[['PRO-5820','Rashi Singh','18%',statusMini('Approve','approved')+' '+statusMini('Reject','rejected')],['PRO-5824','Nora Kim','Deviation',statusMini('Review','pending')],['PRO-5829','Owen Brooks','21%',statusMini('Approve','approved')]],'View all');
  return dashHeader('Sales Team Dashboard','Track deal desk throughput, proposal approvals, and commercial exceptions.')
    +'<div class="stat-grid dash-stat-grid">'+dashStatNav('Team Deals','18','Across Deal Desk',null,dashIcoUser,'contracts')+dashStatNav('Proposals Pending','5','Awaiting manager review','orange',dashIcoDoc,null,'toggleSalesTeamQueuePanel()')+dashStatNav('Client Responses','7','Due this week','orange',dashIcoDoc)+dashStatNav('Margin Exceptions','2','Need approval','red',dashIcoAlert)+'</div>'
    +(salesTeamQueueOpen?queues:'')+'</div>';
}
function buildFinanceApprovalDashboardHTML(){
  return dashHeader('Finance Approval Dashboard','Review payroll calculations, disbursements, invoice payments, and financial controls.')
    +'<div class="stat-grid dash-stat-grid">'+dashStatNav('Payroll Approvals','6','Waiting for sign-off','orange',dashIcoMoney,'payroll')+dashStatNav('Disbursement Authorisations','3','Due today','orange',dashIcoMoney,'payroll')+dashStatNav('Upcoming Payments','Rs 18.4L','Due in next 7 days',null,dashIcoMoney,'payments')+dashStatNav('Payment Compliance','5','Issues flagged','orange',dashIcoShield,'compliance')+dashStatNav('Total Invoiced','Rs 14.3L','This month',null,dashIcoMoney,'payments')+dashStatNav('Pending Invoices','7','Awaiting client payment','orange',dashIcoMoney,'payments')+dashStatNav('Paid Invoices','43','Cleared this cycle','green',dashIcoMoney,'payments')+dashStatNav('Overdue Invoices','2','Past due date','red',dashIcoAlert,'payments')+'</div>'
    +'<div class="dash-actions">'+dashAction('Approve Payroll','Review salary calculations',dashIcoMoney)+dashAction('Authorise Disbursement','Release approved payroll funds',dashIcoMoney)+dashAction('Payment Reports','Trends, summaries, and cycle analytics',dashIcoDoc)+dashAction('Contract Billing','View rates, cycles, and billing status',dashIcoDoc)+'</div>'
    +'<div class="dash-two-col">'+dashTable('Payroll Approval Queue',['Run ID','Employee','Net Pay','Action'],[['RUN-3001','Testemp Antar','Rs 82,400',statusMini('Approve','approved')+' '+statusMini('Reject','rejected')],['RUN-3002','Anika Shah','Rate mismatch',statusMini('Review','pending')],['RUN-4104','Sofia Romano','Final settlement',statusMini('Review','pending')]],'View all')+dashTable('Paid Invoices',['Invoice ID','Entity','Amount','Paid On'],[['INV-2038','Dhi Hyperlocal','Rs 2,75,000','12 May'],['INV-2031','Dhi Hyperlocal','Rs 1,85,000','08 May'],['INV-2027','ADT Singapore Pte.','Rs 3,40,000','02 May']], 'View all paid')+'</div></div>';
}
function buildComplianceDashboardHTML(){
  return dashHeader('Opendhi Compliance Admin Dashboard','Monitor contract compliance, compliance hub items, payment compliance, and assigned support tasks.')
    +'<div class="stat-grid dash-stat-grid">'+dashStatNav('Contract Compliance','18','5 blocking payroll readiness','red',dashIcoDoc,null,'toggleComplianceContractQueuePanel()',true)+dashStatNav('Compliance Hub Items','26','9 require review','blue',dashIcoShield,null,'toggleComplianceHubItemsPanel()',true)+dashStatNav('Assigned Support Items','7','3 high priority','orange',dashIcoDoc,null,'toggleComplianceSupportItemsPanel()',true)+dashStatNav('Payment Compliance','5','5 pending issues','teal',dashIcoShield,'compliance',null,true)+dashStatNav('Payroll Blockers','4','Resolve before payroll run','red',dashIcoMoney,'payroll',null,true)+dashStatNav('Document Verification Pending','9','Documents awaiting review','violet',dashIcoShield,'compliance',null,true)+dashStatNav('Expiring Documents','5','Expiring in next 30 days','orange',dashIcoShield,'compliance',null,true)+'</div>'
    +buildComplianceLiveQueuePanelHTML()
    +(complianceContractQueueOpen||complianceHubItemsOpen?'<div class="dash-two-col">'
      +(complianceContractQueueOpen?dashTable('Contract Compliance Queue',['Employee','Contract Issue','Status','Action'],[['Ramesh Patel','Missing signature',statusMini('Blocking','rejected'),statusMini('Review','draft')],['Priya Sharma','Work permit pending',statusMini('Blocking','rejected'),statusMini('Review','draft')],['Arjun Desai','Clause update required',statusMini('Needs Review','pending'),statusMini('Open','draft')],['Aishi Verma','Contract verified',statusMini('Ready','approved'),statusMini('View','draft')]],'View all'):'')
      +(complianceHubItemsOpen?dashTable('Compliance Hub Items',['Item','Category','Due','Status'],[['Employee KYC review','Documents','Today',statusMini('Pending','pending')],['Local tax registration','Payroll','24 May',statusMini('Blocking','rejected')],['Policy acknowledgment','Policy','26 May',statusMini('Pending','pending')],['Statutory filing check','Entity','31 May',statusMini('Ready','approved')]],'Open hub'):'')
      +'</div>':'')
    +(complianceSupportItemsOpen?dashTable('Assigned Support Items',['Item','Description','Tag'],[['Payroll blocked by missing Tax ID','John Doe payroll readiness is blocked until Tax ID verification is completed.','Payroll Compliance'],['Work permit document pending','Thijs Verbeek has a pending work authorization document for review.','Contract Compliance']], 'View assigned'):'')
    +'</div>';
}
function buildOpsDashboardHTML(){
  return dashHeader('Opendhi Ops Admin Dashboard','Track contract pipeline, active contracts, compliance items, and pending entities across the selected entity.')
    +'<div class="stat-grid dash-stat-grid">'+dashStatNav('Active Contracts','25','Across all entities','green',dashIcoDoc,'contracts')+dashStatNav('Active People','148','Direct + EOR/PEO','green',dashIcoUser)+dashStatNav('Compliance Items','14','3 due soon','orange',dashIcoShield,'compliance')+dashStatNav('Pending Entities','3','Awaiting setup','orange',dashIcoAlert)+dashStatNav('Ready for Payroll','25','Cleared this cycle','green',dashIcoMoney,'payroll')+dashStatNav('Payroll Status','Ready','Current cycle is on track','green',dashIcoMoney,'payroll')+dashStatNav('Payroll Blockers','4','Resolve before payroll run','orange',dashIcoMoney,'payroll')+dashStatNav('Setup Progress','82%','Entity setup completion','green',dashIcoShield)+'</div>'
    +'<div class="listing-card dash-panel"><div class="dash-panel-head"><div>Contract Pipeline</div><span>View all contracts</span></div><div class="stat-grid dash-stat-grid">'+dashStatNav('Proposal Sent','8','Pending client action','orange',dashIcoDoc,'contracts')+dashStatNav('Proposal Approved','5','Client approved','green',dashIcoDoc,'contracts')+dashStatNav('Contract Sent','6','Awaiting countersign','orange',dashIcoDoc,'contracts')+dashStatNav('Contract Approved','3','Signed & approved','green',dashIcoDoc,'contracts')+'</div></div>'
    +'<div class="dash-two-col">'+dashTable('Active Contracts',['Contract','Country','Type','Stage'],[['Netherlands EOR - Anika','Netherlands','EOR',statusMini('Ready for Payroll','approved')],['India Contractor - Rahul','India','Contractor',statusMini('Ready for Payroll','approved')],['UK EOR - Owen','United Kingdom','EOR',statusMini('Contract Sent','pending')],['Germany PEO - Nora','Germany','PEO',statusMini('Proposal Sent','rejected')]],'View all')+dashTable('Compliance Items',['Item','Category','Blocking','Status'],[['Employee KYC Review','Documents','Yes',statusMini('Pending','rejected')],['Work Authorization','Statutory','Yes',statusMini('Evidence Uploaded','pending')],['Tax Registration','Payroll','Yes',statusMini('Pending','rejected')],['Policy Acknowledgement','Policy','No',statusMini('Completed','approved')]],'View all')+'</div></div>';
}
function buildOpsApprovalsDashboardHTML(){
  return dashHeader('Ops Approvals Dashboard','Review signed contracts, discrepancies, readiness gates, and operational exceptions.')
    +'<div class="stat-grid dash-stat-grid">'+dashStatNav('Contract Reviews','3','Waiting for Ops approval','orange',dashIcoDoc,'contracts')+dashStatNav('Discrepancies','1','Needs correction','red',dashIcoAlert,'contracts')+dashStatNav('Ready for HR','5','Approved handoffs','green',dashIcoUser)+dashStatNav('SLA Risk','0','No overdue approvals','green',dashIcoShield)+'</div>'
    +'<div class="dash-actions">'+dashAction('Approve Signed Contract','Verify countersigned contract against approved proposal',dashIcoDoc)+dashAction('Send Back for Correction','Route discrepancy to Legal / Contracts',dashIcoShield)+'</div>'
    +'<div class="dash-two-col">'+dashTable('Signed Contract Approval Queue',['Employee','Country','Contract','Action'],[['Rashi Singh','Netherlands','EOR Contract',statusMini('Approve','approved')+' '+statusMini('Discrepancy','rejected')],['Rajdeep Singh','Netherlands','EOR Contract',statusMini('Review','pending')],['Emma Schmidt','Germany','EOR Contract',statusMini('Approve','approved')]],'View all')+dashTable('Operational Exceptions',['Run','Issue','Owner','Status'],[['RUN-2002','Signed document mismatch','Legal',statusMini('Exception','rejected')],['RUN-2011','Missing onboarding evidence','HR',statusMini('Pending','pending')],['RUN-2017','Payroll readiness blocked','HR',statusMini('Review','pending')]],'View all')+'</div></div>';
}
function toggleOpenDealsPanel(){
  salesOpenDealsOpen=!salesOpenDealsOpen;
  renderADTPage();
}
function buildSalesDashboardHTML(p,tab){
  const isManager=tab==='sales-approvals';
  const openDealsCount=manualJourneyRuns.filter(function(r){return r.journeyId==='contract-creation'&&r.createdBy===p.id;}).length;
  return dashHeader(isManager?'Deal Approvals Dashboard':'Deal Desk Dashboard',isManager?'Review proposal approvals, exceptions, and team deal movement.':'Track owned deals, proposals, client acceptance, and contract creation work.')
    +'<div class="stat-grid dash-stat-grid">'+dashStatNav('Open Deals',String(openDealsCount),'Owned by this role',null,dashIcoDoc,null,'toggleOpenDealsPanel()')+dashStatNav('Proposal Drafts','3','Ready for review','orange',dashIcoDoc)+dashStatNav('Client Responses','5','Awaiting acceptance','orange',dashIcoUser)+dashStatNav('Exceptions','1','Needs attention','red',dashIcoAlert)+'</div>'
    +(isManager||!salesOpenDealsOpen?'':buildMyCreatedRunsPanelHTML(p.id))+'</div>';
}
function buildContractsAdminDashboardHTML(){
  return dashHeader('Contracts Dashboard','Generate contracts, monitor signatures, and resolve legal document exceptions.')
    +'<div class="stat-grid dash-stat-grid">'+dashStatNav('Contracts Sent','6','Awaiting signature','orange',dashIcoDoc,'contracts')+dashStatNav('Signature Pending','4','Client countersign',null,dashIcoDoc,'contracts')+dashStatNav('Bounced Requests','1','Needs resend','red',dashIcoAlert,'contracts')+dashStatNav('Templates Used','3','This week',null,dashIcoDoc,'contract-templates')+'</div>'
    +'<div class="dash-actions">'+dashAction('Generate Contract','Create employment contract from approved proposal',dashIcoDoc)+dashAction('Resend Signature','Retry bounced Docuseal request',dashIcoDoc)+'</div>'
    +dashTable('Contract Queue',['Employee','Country','Document','Status'],[['Anika Shah','Netherlands','EOR Contract',statusMini('Sent','pending')],['Rahul Mehta','India','Contractor Agreement',statusMini('Signed','approved')],['Nora Kim','Germany','PEO Contract',statusMini('Bounced','rejected')]],'View all')+'</div>';
}
function buildITAdminDashboardHTML(){
  return dashHeader('IT Systems Dashboard','Provision access, revoke accounts, and resolve system readiness blockers.')
    +'<div class="stat-grid dash-stat-grid">'+dashStatNav('Access Requests','9','Awaiting provisioning','orange',dashIcoUser)+dashStatNav('Revocations','2','Due today','red',dashIcoAlert)+dashStatNav('Provisioning SLA','96%','Within target','green',dashIcoShield)+dashStatNav('Blocked','1','Needs admin action','orange',dashIcoAlert)+'</div>'
    +'<div class="dash-actions">'+dashAction('Provision Access','Grant systems for new joiners',dashIcoUser)+dashAction('Revoke Access','Complete offboarding checklist',dashIcoShield)+'</div>'
    +dashTable('Systems Queue',['Employee','Request','System','Status'],[['Sofia Romano','New hire access','HRMS + Payroll',statusMini('Pending','pending')],['Lucas Dubois','Offboarding','Email + SSO',statusMini('Due Today','rejected')],['James Wilson','Role change','ERP',statusMini('In Progress','pending')]],'View all')+'</div>';
}

function personaOwnedRunItems(persona){
  const items=[];
  const sourceMap={
    'Deal Manager':'deal-manager',
    'Ops Manager':'ops-manager',
    'Finance Approver':'finance-approver',
    'HR Manager':'hr-manager',
    'AI Onboarding Engine':'hr',
    'AI Payroll Readiness Check':'hr',
    'AI Prompt Parser':'hr',
    'AI Timesheet Sync':'hr',
    'AI Payroll Engine':'hr',
    'AI Payslip Generator':'hr',
    'AI Payroll Archive':'hr',
    'AI Compliance Hub Sync':'compliance-officer',
    'AI + Docuseal':'legal-contracts-manager',
    'AI Contract Assistant':'account-manager'
  };
  Object.keys(aiAutomationRuns).forEach(function(jid){
    const journey=aiJourneys.find(function(j){return j.id===jid;});
    
    const events=aiJourneyEvents[jid]||[];
    (aiAutomationRuns[jid]||[]).forEach(function(run){
      const event=events[Math.min(run.currentStepIdx,events.length-1)];
      const owner=event?(sourceMap[event.source]||''):'';
      const approvalOwner=event&&event.chips&&event.chips.indexOf('Approval Required')>=0;
      const exceptionOwner=run.status==='Exception'&&(owner===persona.id||persona.id==='hr-manager'||persona.id==='finance-approver');
      const waitingOwner=run.status==='Waiting for Approval'&&owner===persona.id&&approvalOwner;
      const directlyNotified=notifiedRunOwners[run.runId]===persona.id&&(run.status==='Exception'||run.status==='Waiting for Approval');
      if(waitingOwner||exceptionOwner||directlyNotified)items.push({run:run,journey:journey,event:event});
    });
  });
  return items;
}
function buildPersonaDashboardHTML(){
  const p=getActivePersona();
  const items=personaOwnedRunItems(p);
  const exceptions=items.filter(function(x){return x.run.status==='Exception';}).length;
  const approvals=items.filter(function(x){return x.run.status==='Waiting for Approval';}).length;
  const kpis=p.kpis.map(function(k,i){
    const val=i===0&&items.length?items.length:k[1];
    return '<div class="stat-card"><div class="stat-label"><span>'+k[0]+'</span></div><div class="stat-val">'+val+'</div><div class="stat-sub">'+(i===0?'Role-scoped queue':'Current tenant view')+'</div></div>';
  }).join('');
  const ownedRows=p.steps.slice(0,8).map(function(s,i){
    const journeyLabel=s.indexOf('J1')===0?'Contract Creation':s.indexOf('J2')===0?'Payroll Creation':s.indexOf('J3')===0?'H2R Lifecycle':'Sub-journey';
    return '<tr><td><div class="cell-primary">'+s+'</div><div class="cell-sub">'+journeyLabel+'</div></td><td>'+p.department+'</td><td><span class="status-pill '+(i%3===0?'pending':i%3===1?'active':'approved')+'">'+(i%3===0?'Pending':i%3===1?'In Progress':'Completed')+'</span></td><td class="cell-sub">'+(i+1)+'h left</td></tr>';
  }).join('');
  const queueRows=items.slice(0,6).map(function(it){
    const action=it.run.status==='Exception'?(it.run.exceptionNote||'Exception needs review'):'Approval required: '+(it.event?it.event.name:'Review');
    return '<tr style="cursor:pointer" onclick="viewAIRunTask(\''+it.run.runId+'\',\''+it.journey.id+'\')"><td><div class="cell-primary">'+it.journey.name+'</div><div class="cell-sub">'+it.run.runId+'</div></td><td>'+it.run.client+'</td><td>'+action+'</td><td><span class="status-pill '+aiRunStatusPillClass(it.run.status)+'">'+it.run.status+'</span></td><td class="cell-sub">'+it.run.lastActivity+'</td></tr>';
  }).join('');
  const queueBody=queueRows||'<tr><td colspan="5" style="padding:28px;text-align:center;color:var(--gray);font-size:12.5px">No role-scoped approvals or exceptions right now.</td></tr>';
  return '<div class="persona-dash">'
    +'<div class="persona-hero">'
      +'<div class="persona-avatar-lg">'+p.initials+'</div>'
      +'<div><div class="persona-role">'+p.label+'</div><div class="persona-name">'+p.name+' &middot; '+p.department+'</div><div class="persona-focus">'+p.focus+'</div></div>'
      +'<div class="persona-mode"><span>AI Mode</span><strong>'+p.owned+' owned steps</strong></div>'
    +'</div>'
    +'<div class="stat-grid" style="margin-bottom:20px">'+kpis+'</div>'
    +'<div class="persona-grid">'
      +'<div class="listing-card"><div class="persona-section-head"><div><div class="setup-title">Action Queue</div><div class="setup-sub">Approvals and exceptions routed to '+p.label+'</div></div><span class="status-pill pending">'+(approvals+exceptions)+' Open</span></div><table class="listing-table ai-run-table"><thead><tr><th>Journey</th><th>Client</th><th>Action Needed</th><th>Status</th><th>Last Activity</th></tr></thead><tbody>'+queueBody+'</tbody></table></div>'
      +'<div class="listing-card"><div class="persona-section-head"><div><div class="setup-title">Owned Workflow Steps</div><div class="setup-sub">From Enterprise Workflow Design section 2</div></div><span class="status-pill active">'+p.journeys.length+' Journeys</span></div><table class="listing-table"><thead><tr><th>Step</th><th>Department</th><th>Status</th><th>SLA</th></tr></thead><tbody>'+ownedRows+'</tbody></table></div>'
    +'</div>'
    +'</div>';
}

// -- ENTITY ADMIN DASHBOARD: pending Requests/Notes rendered as a vertical list of cards, ranked by urgency --
function entityRequestUrgency(r){
  const actionable=r.type==='journey-request-to-admin'||r.type==='manager-notify';
  const t=Date.parse(r.timestamp);
  const ageHrs=isNaN(t)?0:Math.min((Date.now()-t)/3600000,500);
  return (actionable?1000:0)+ageHrs;
}
// dot color is a property of the request itself (urgency), not its position in the stack — so promoting a card to front never changes its color
function eaUrgencyDotClass(r){
  const u=entityRequestUrgency(r);
  if(u>=1000)return 'ea-dot-high';
  if(u>=72)return 'ea-dot-medium';
  return 'ea-dot-low';
}
function eaStackOpen(id,stackKey){
  const el=document.getElementById('ea-stack-card-'+stackKey+'-'+id);
  if(el)el.classList.add('tearing');
  setTimeout(function(){navigatePage('my-tasks');},220);
}
function eaReqPinHTML(stackKey){
  return '';
}
function buildEaRequestStackHTML(stackKey,title,sub,items,cardHTML,emptyText){
  const pin=eaReqPinHTML(stackKey);
  const hostClass='setup-card ea-notice-card'+(pin?' ea-req-pin-host':'');
  if(!items.length)return '';
  const sorted=items.slice().sort(function(a,b){return entityRequestUrgency(b)-entityRequestUrgency(a);});
  const capped=sorted.slice(0,5);
  const extra=sorted.length-capped.length;
  const domIdFor=function(r){return 'ea-stack-card-'+stackKey+'-'+r.id;};
  const cards=capped.map(function(r){
    const dot='<span class="ea-stack-dot '+eaUrgencyDotClass(r)+'"></span>';
    return '<div class="ea-req-card" id="'+domIdFor(r)+'" onclick="eaStackOpen(\''+r.id+'\',\''+stackKey+'\')">'+cardHTML(r,dot)+'</div>';
  }).join('');
  return '<div class="'+hostClass+'">'+pin
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px"><div class="setup-title" style="margin-bottom:0">'+title+'</div><button class="btn btn-secondary btn-sm" onclick="navigatePage(\'my-tasks\')">View All</button></div>'
    +'<div class="setup-sub" style="margin-bottom:16px">'+sub+'</div>'
    +'<div class="ea-req-vlist">'+cards+'</div>'
    +(extra>0?'<div class="ea-stack-more" onclick="navigatePage(\'my-tasks\')">+'+extra+' more in My Tasks</div>':'')
    +'</div>';
}
function openMyTasksFromDashboard(e){
  if(e)e.stopPropagation();
  navigatePage('my-tasks');
}
function eaStackTimeHTML(timestamp){
  const s=String(timestamp||'');
  const idx=s.indexOf(',');
  const date=idx<0?s:s.slice(0,idx).trim();
  const time=idx<0?'':s.slice(idx+1).trim();
  return '<div class="ea-stack-time"><div class="ea-stack-date">'+date+'</div>'+(time?'<div class="ea-stack-clock">'+time+'</div>':'')+'</div>';
}
function eaReqCardHTML(r,dot){
  const label=r.type==='journey-request-to-admin'?'Activate &ldquo;'+r.label+'&rdquo;':r.label;
  return dot
    +'<div class="ea-stack-issue">'+label+'</div>'
    +'<div class="ea-stack-meta"><div class="ea-stack-who">'+requesterAvatarHTML(r.requestedBy)+requesterCaptionHTML(r.requestedBy)+'</div>'+eaStackTimeHTML(r.timestamp)+'</div>';
}
function eaNoteCardHTML(r,dot){
  return dot
    +'<div class="ea-stack-issue">'+r.label+'</div>'
    +'<div class="ea-stack-meta"><div class="ea-stack-who"><div class="ea-req-requester">'+r.requestedBy+'</div></div>'+eaStackTimeHTML(r.timestamp)+'</div>';
}
function buildEntityAdminDashboardHTML(){
  const sysTotal=cfgSystems.filter(s=>s.isDefault).length;
  const sysActive=cfgSystems.filter(s=>s.isDefault&&s.activatedForEntity).length;
  const jyTotal=aiJourneys.length;
  const jyActive=jyTotal;
  const entityScopedRequests=entityRequests.filter(r=>r.clientId==='dhi-hyperlocal'&&r.type!=='manager-notify');
  const sentToSuperAdmin=entityScopedRequests.filter(r=>r.type!=='journey-request-to-admin');
  const pending=sentToSuperAdmin.filter(r=>r.status==='Pending').length;
  const pendingRequests=entityScopedRequests.filter(r=>r.status==='Pending');
  const notifyEntries=entityRequests.filter(r=>r.type==='manager-notify'&&r.clientId==='dhi-hyperlocal');
  const pendingNotes=notifyEntries.filter(r=>r.status==='Pending');
  return `
    <p style="font-size:14px;font-weight:600;margin-bottom:4px">Entity Admin</p>
    <p style="font-size:12px;color:var(--gray);margin-bottom:20px">Your entity's automation overview — systems, journeys, and requests.</p>
    <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px">
      <div class="stat-card ea-hero-stat cfg-hero-blue" onclick="openEntitySystemsModal()"><div class="stat-label"><span>Systems Activated</span><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M8.2 10.8 15.8 7.2M8.2 13.2l7.6 3.6"/></svg></div></div><div class="stat-val">${sysActive} <span style="font-size:14px;color:var(--gray);font-weight:500">of ${sysTotal}</span></div><div class="stat-sub" style="color:var(--gray)">Default systems in use</div></div>
      <div class="stat-card ea-hero-stat cfg-hero-teal" onclick="openEntityJourneysModal()"><div class="stat-label"><span>Journeys Activated</span><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="3" width="6" height="6" rx="1.5"/><rect x="9" y="15" width="6" height="6" rx="1.5"/><path d="M6 9v2a3 3 0 0 0 3 3M18 9v2a3 3 0 0 1-3 3"/></svg></div></div><div class="stat-val">${jyActive} <span style="font-size:14px;color:var(--gray);font-weight:500">of ${jyTotal}</span></div><div class="stat-sub" style="color:var(--gray)">Available in AI Executive</div></div>
      <div class="stat-card ea-hero-stat cfg-hero-yellow"><div class="stat-label"><span>Pending Requests</span><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div></div><div class="stat-val" style="${pending?'color:#b45309':''}">${pending}</div><div class="stat-sub" style="color:var(--gray)">Awaiting Super Admin approval</div></div>
    </div>
    ${buildEaStackColsHTML(pendingRequests,pendingNotes)}
  `;
}
function buildEaStackColsHTML(pendingRequests,pendingNotes){
  const cards=[
    buildEaRequestStackHTML('requests','Your Requests',"Systems and journeys you've asked Super Admin to activate, plus journeys your Entity Users have asked you to activate",pendingRequests,eaReqCardHTML,'No requests yet — activate a system or journey to see status here.'),
    buildEaRequestStackHTML('notes','Notes from Entity User','Approvals your team has flagged for your attention',pendingNotes,eaNoteCardHTML,'No notes yet — your Entity Users will show up here if they escalate an approval.')
  ].filter(Boolean);
  if(!cards.length)return '';
  return '<div class="ea-stack-cols'+(cards.length===1?' ea-stack-cols-solo':'')+'">'+cards.join('')+'</div>';
}
function openEntitySystemsModal(){
  const rows=cfgSystems.filter(s=>s.isDefault).map(function(s){
    const active=!!s.activatedForEntity;
    return `<div class="ea-req-row" style="cursor:pointer" onclick="closeCtModal();viewCfgSystem('${s.id}')"><div><div class="ea-req-label">${s.name}</div><div class="ea-req-time">${s.type} &middot; ${s.method}</div></div><span class="status-pill ${active?'active':'draft'}">${active?'Activated':'Not Activated'}</span></div>`;
  }).join('');
  document.getElementById('ct-modal-overlay').innerHTML=
    '<div class="ct-modal" onclick="event.stopPropagation()">'
    +'<div class="ct-modal-hdr"><span class="ct-modal-title">Systems</span><button class="ct-modal-close" onclick="closeCtModal()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'<div class="setup-sub" style="margin-bottom:14px">Default systems available to activate for your entity</div>'
    +'<div class="ea-req-list">'+rows+'</div>'
    +'</div>';
  document.getElementById('ct-modal-overlay').style.display='flex';
}
function openEntityJourneysModal(){
  const rows=aiJourneys.map(function(j){
    return `<div class="ea-req-row" style="cursor:pointer" onclick="closeCtModal();viewCfgJourney('${j.id}')"><div><div class="ea-req-label">${j.name}</div><div class="ea-req-time">${j.category}</div></div><span class="status-pill active">Activated</span></div>`;
  }).join('');
  document.getElementById('ct-modal-overlay').innerHTML=
    '<div class="ct-modal" onclick="event.stopPropagation()">'
    +'<div class="ct-modal-hdr"><span class="ct-modal-title">Journeys</span><button class="ct-modal-close" onclick="closeCtModal()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'<div class="setup-sub" style="margin-bottom:14px">AI Executive journeys unlocked for your entity</div>'
    +'<div class="ea-req-list">'+rows+'</div>'
    +'</div>';
  document.getElementById('ct-modal-overlay').style.display='flex';
}

// -- SUPER ADMIN DASHBOARD TAB: the Configure > Overview snapshot plus items needing this role's action --
function buildSuperAdminDashboardHTML(){
  const visibleRequests=entityRequests.filter(r=>r.type!=='manager-notify'&&r.type!=='journey-request-to-admin');
  const pendingCount=visibleRequests.filter(r=>r.status==='Pending').length;
  const reqRows=visibleRequests.slice(0,8).map(function(r){
    const actions=r.status==='Pending'
      ?'<div class="sa-req-actions"><button class="sa-req-btn sa-req-approve" onclick="approveEntityRequest(\''+r.id+'\')">Approve</button><button class="sa-req-btn sa-req-reject" onclick="rejectEntityRequest(\''+r.id+'\')">Reject</button></div>'
      :'<span class="status-pill '+statusClass(r.status)+'">'+r.status+'</span>';
    return '<div class="ea-req-row ea-req-row-3col"><div class="ea-req-main"><div class="ea-req-label">'+r.label+'</div><div class="ea-req-time">'+r.requestedBy+'</div></div><div class="ea-req-when">'+eaStackTimeHTML(r.timestamp)+'</div>'+actions+'</div>';
  }).join('');
  const reqBody=visibleRequests.length?reqRows:'<div class="ea-req-empty">No requests yet — entity admins and entity users will appear here once they request something.</div>';
  const activityRows=cfgRecentActivity.map(function(a){
    return '<div class="ea-req-row"><div><div class="ea-req-label">'+a.title+'</div><div class="ea-req-time">'+a.sub+'</div></div><div style="font-size:11.5px;font-weight:500;color:var(--gray);white-space:nowrap;flex-shrink:0">'+a.when+'</div></div>';
  }).join('');
  const activityBody=cfgRecentActivity.length?activityRows:'<div class="ea-req-empty">No recent activity yet.</div>';
  return '<div class="ai-exec-page">'
    +cfgPageHead('Opendhi Super Admin','Full platform oversight — systems, data models, journeys, and agents across every entity.')
    +cfgHeroTilesHTML()
    +'<div class="setup-card" style="margin-top:24px">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><div class="setup-title">Action Required</div>'+(pendingCount?'<span class="status-pill pending">'+pendingCount+' Pending</span>':'')+'</div>'
    +'<div class="setup-sub" style="margin-bottom:14px">Activation requests from Entity Admins and Entity Users awaiting your review</div>'
    +'<div class="ea-req-list">'+reqBody+'</div>'
    +'</div>'
    +'<div class="setup-card" style="margin-top:20px">'
    +'<div class="setup-title" style="margin-bottom:4px">Recent Activity</div>'
    +'<div class="setup-sub" style="margin-bottom:14px">Latest configuration changes across systems, data models, journeys, and agents</div>'
    +'<div class="ea-req-list">'+activityBody+'</div>'
    +'</div></div>';
}

function openDeSidebar(id){
  deSelectedId=id;deTab='basic-details';
  const sb=document.getElementById('de-split-sb');if(sb)sb.classList.add('open');
  const inner=document.getElementById('de-isb-inner');if(inner)inner.innerHTML=renderDeSidebar();
  document.querySelectorAll('.de-row').forEach(r=>r.classList.toggle('lp-row-selected',r.id==='de-row-'+id));
}
function closeDeSidebar(){
  deSelectedId=null;
  const sb=document.getElementById('de-split-sb');if(sb)sb.classList.remove('open');
  document.querySelectorAll('.de-row').forEach(r=>r.classList.remove('lp-row-selected'));
}
function navDeTab(tab){deTab=tab;const inner=document.getElementById('de-isb-inner');if(inner){inner.innerHTML=renderDeSidebar();requestAnimationFrame(function(){const nt=document.getElementById('de-isb-tabs');if(nt){const a=nt.querySelector('.lp-isb-tab.active');if(a)a.scrollIntoView({inline:'start',block:'nearest'});}});}}
function scrollTabRow(dir,id){const el=document.getElementById(id);if(!el)return;const t=el.querySelector('.lp-isb-tab');const w=t?t.offsetWidth*2+32:160;el.scrollBy({left:dir==='right'?w:-w,behavior:'smooth'});}
function resetDeFilters(){deSelectedId=null;renderADTPage();}
function renderDeSidebar(){
  const emp=directEmpData.find(e=>e.id===deSelectedId);if(!emp)return '';
  const tabs=[{id:'basic-details',label:'Basic Details'},{id:'bank-details',label:'Bank Details'},{id:'attachments',label:'Attachments'},{id:'salary-details',label:'Salary Details'},{id:'logs',label:'Logs'},{id:'workflow',label:'Workflow'}];
  const tabBar='<div class="lp-isb-tabbar">'
    +'<button class="lp-isb-nav-btn" onclick="scrollTabRow(\'left\',\'de-isb-tabs\')" title="Scroll left"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<div class="lp-isb-tabs" id="de-isb-tabs">'+tabs.map(t=>'<button class="lp-isb-tab'+(deTab===t.id?' active':'')+'" onclick="navDeTab(\''+t.id+'\')">'+t.label+'</button>').join('')+'</div>'
    +'<button class="lp-isb-nav-btn nav-right" onclick="scrollTabRow(\'right\',\'de-isb-tabs\')" title="Scroll right"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'<div class="lp-isb-right"><button class="lp-isb-close" onclick="closeDeSidebar()" title="Close"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'</div>';
  const d='<span style="color:#9ca3af">--</span>';
  const v=(x)=>x&&x!=='--'?x:d;
  const iP='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const iB='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>';
  const iI='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h.01M10 12h4"/></svg>';
  const iPin='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  const iBag='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>';
  const iCal='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const iDoc='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
  const iPhone='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.2.73.43 1.44.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.9-.87a2 2 0 0 1 2.11-.45c1.37.27 2.08.5 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>';
  const iMail='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  const fc=(ico,label,val)=>'<div class="lp-sb-field-card"><div class="lp-sb-field-icon">'+ico+'</div><div class="lp-sb-field-content"><div class="lp-sb-field-label">'+label+'</div><div class="lp-sb-field-value">'+val+'</div></div></div>';
  let body='';
  if(deTab==='basic-details'){
    const editBtn='<button class="ep-save-btn" style="padding:5px 14px;font-size:12px;display:flex;align-items:center;gap:5px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit</button>';
    body=deOnboardingBannerHTML(emp)
      +'<div class="lp-sb-view-header"><span class="lp-sb-section-title">'+emp.name+'</span>'+editBtn+'</div>'
      +'<div class="lp-sb-detail-grid">'
      +fc(iP,'Name',v(emp.name))+fc(iB,'Department',v(emp.dept))
      +fc(iI,'Employee ID',v(emp.empId))+fc(iPin,'Branch',v(emp.branch))
      +fc(iBag,'Job Title',v(emp.jobTitle))+fc(iCal,'Joining Date',v(emp.joinDate))
      +fc(iDoc,'Description',v(emp.desc))+fc(iPhone,'Contact Number',v(emp.contact))
      +fc(iMail,'Email',v(emp.email))
      +'</div>';
  }else if(deTab==='bank-details'){
    const bankData=[
      {loc:'INDIA',pay:'',bank:'ICICI'},
      {loc:'INDIA',pay:'',bank:''},
      {loc:'',pay:'Bhavesh Shah',bank:''},
      {loc:'IND',pay:'Pritesh S',bank:'HDFC'},
      {loc:'IND',pay:'Samantha K',bank:'SBI'},
      {loc:'IND',pay:'Deepak K',bank:'ICICI'},
      {loc:'Germany',pay:'Deena Davloy',bank:'Deutsche Bank'}
    ];
    const thS='padding:8px 10px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;background:#f8fafc;border-bottom:1px solid var(--border)';
    const tdS='padding:9px 10px;font-size:13px;color:var(--navy);border-bottom:1px solid #f1f5f9';
    const dash='<span style="color:#9ca3af">--</span>';
    body='<div style="display:flex;justify-content:flex-end;margin-bottom:14px">'
      +'<button style="color:var(--orange);background:none;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">+ Add Bank Detail</button>'
      +'</div>'
      +'<table style="width:100%;border-collapse:collapse">'
      +'<thead><tr>'
      +'<th style="'+thS+'">S.no</th>'
      +'<th style="'+thS+'">Location</th>'
      +'<th style="'+thS+'">Pay Name</th>'
      +'<th style="'+thS+'">Pay Bank</th>'
      +'</tr></thead>'
      +'<tbody>'+bankData.map((r,i)=>'<tr>'
        +'<td style="'+tdS+';color:#6b7280">'+(i+1)+'</td>'
        +'<td style="'+tdS+'">'+(r.loc||dash)+'</td>'
        +'<td style="'+tdS+';color:'+(r.pay?'var(--orange)':'#9ca3af')+'">'+(r.pay||'--')+'</td>'
        +'<td style="'+tdS+';color:'+(r.bank?'var(--orange)':'#9ca3af')+'">'+(r.bank||'--')+'</td>'
        +'</tr>').join('')
      +'</tbody></table>';
  }else if(deTab==='attachments'){
    const thS='padding:8px 10px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;background:#f8fafc;border-bottom:1px solid var(--border);text-transform:uppercase;letter-spacing:.4px';
    body='<div style="display:flex;justify-content:flex-end;margin-bottom:14px">'
      +'<button style="color:var(--orange);background:none;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">+ Add Attachment</button>'
      +'</div>'
      +'<table style="width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:8px;overflow:hidden">'
      +'<thead><tr>'
      +'<th style="'+thS+'">SR. NO</th>'
      +'<th style="'+thS+'">File Name</th>'
      +'<th style="'+thS+'">Uploaded By</th>'
      +'<th style="'+thS+'">Type</th>'
      +'<th style="'+thS+'">Source</th>'
      +'<th style="'+thS+'">Action</th>'
      +'</tr></thead>'
      +'<tbody><tr><td colspan="6" style="padding:28px 10px;text-align:center;font-size:13px;color:#9ca3af;font-weight:500">No attachments available</td></tr></tbody>'
      +'</table>';
  }else if(deTab==='salary-details'){
    const thS='padding:7px 9px;font-size:11px;font-weight:600;color:#6b7280;background:#f8fafc;border-bottom:1px solid var(--border);text-transform:uppercase;letter-spacing:.4px;text-align:left';
    body='<div style="margin-bottom:16px">'
        +'<div style="font-size:15px;font-weight:700;color:var(--navy)">Salary Details</div>'
        +'<div style="font-size:12px;color:var(--orange);margin-top:2px">Configure employee payment details</div>'
      +'</div>'
      // 1. Core Details card
      +'<div class="ep-form-card" style="margin-bottom:14px">'
        +'<div class="ep-form-title">Core Details</div>'
        +'<div class="ep-form-grid">'
          +'<div class="ep-form-group"><label class="ep-form-label">Base Salary <span class="req">*</span></label><input class="ep-form-input" type="number" placeholder="Enter base salary"></div>'
          +'<div class="ep-form-group"><label class="ep-form-label">Pay Frequency <span class="req">*</span></label><select class="ep-form-select"><option value="">Select frequency</option><option>Monthly</option><option>Biweekly</option><option>Weekly</option></select></div>'
          +'<div class="ep-form-group"><label class="ep-form-label">Effective Date</label><input class="ep-form-input" type="date"></div>'
          +'<div class="ep-form-group"><label class="ep-form-label">Currency</label><select class="ep-form-select"><option>INR (₹)</option><option>USD ($)</option><option>EUR (€)</option><option>GBP (£)</option></select></div>'
        +'</div>'
      +'</div>'
      // 2. Earnings | Deductions side by side
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">'
        +'<div class="ep-form-card" style="padding:14px">'
          +'<div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:8px">Earnings</div>'
          +'<div style="color:var(--orange);font-size:12px;margin-bottom:4px">Base Salary is not set.</div>'
          +'<div style="color:#9ca3af;font-size:12px">No earnings payheads assigned</div>'
        +'</div>'
        +'<div class="ep-form-card" style="padding:14px">'
          +'<div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:8px">Deductions</div>'
          +'<div style="color:var(--orange);font-size:12px;margin-bottom:4px">Base Salary is not set.</div>'
          +'<div style="color:#9ca3af;font-size:12px">No deduction payheads assigned</div>'
        +'</div>'
      +'</div>'
      // 3. Assign Payheads
      +'<div class="ep-form-card" style="margin-bottom:14px">'
        +'<div class="ep-form-title">Assign Payheads</div>'
        +'<div style="color:#9ca3af;font-size:12px;margin-bottom:10px">No payheads assigned</div>'
        +'<label class="ep-form-label" style="display:block;margin-bottom:6px">Select Additional Payheads</label>'
        +'<div class="ep-emp-search"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Search payheads..."></div>'
      +'</div>'
      // 4. Net Salary
      +'<div class="ep-form-card" style="background:#fffbf5;border-color:#fde68a;padding:16px 22px;margin-bottom:14px">'
        +'<div style="display:flex;justify-content:space-between;align-items:center">'
          +'<span style="font-size:14px;font-weight:700;color:var(--navy)">Net Salary</span>'
          +'<span style="color:var(--orange);font-weight:700;font-size:20px">--</span>'
        +'</div>'
      +'</div>'
      // 5. Salary Schedule history
      +'<div class="ep-form-card" style="margin-bottom:16px">'
        +'<div class="ep-form-title">Salary Schedule</div>'
        +'<table style="width:100%;border-collapse:collapse">'
          +'<thead><tr>'
          +'<th style="'+thS+'">SR. NO</th>'
          +'<th style="'+thS+'">Salary From</th>'
          +'<th style="'+thS+'">Salary To</th>'
          +'<th style="'+thS+'">Amount</th>'
          +'</tr></thead>'
          +'<tbody><tr><td colspan="4" style="padding:22px 8px;text-align:center;font-size:12px;color:#9ca3af">No salary history</td></tr></tbody>'
        +'</table>'
      +'</div>'
      +'<div style="display:flex;justify-content:flex-end;gap:10px">'
        +'<button class="ep-cancel-btn">Cancel</button>'
        +'<button class="ep-save-btn">Save</button>'
      +'</div>';
  }else if(deTab==='logs'){
    const logs=deLogsData[emp.id]||[];
    const deLogKey=(s)=>({Active:'active',Inactive:'inactive'}[s]||'default');
    const personSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const calSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    const clkSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    const chevSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
    const timelineHTML=logs.length
      ?'<div class="lp-logs-timeline">'+logs.map((l,i)=>{
          const sk=deLogKey(l.status);
          return '<div class="lp-log-row">'
            +'<div class="lp-log-avatar-col">'
            +'<div class="lp-log-avatar lp-log-avatar--'+sk+'">'+personSvg+'</div>'
            +(i<logs.length-1?'<div class="lp-log-connector"></div>':'')
            +'</div>'
            +'<div class="lp-log-card">'
            +'<div class="lp-log-status-row"><span class="lp-log-dot lp-log-dot--'+sk+'"></span><span class="lp-log-status-text lp-log-status-text--'+sk+'">'+l.status+'</span></div>'
            +'<div class="lp-log-meta-row">'
            +'<span class="lp-log-meta-item">'+personSvg+'<span>'+l.user+'</span></span>'
            +(l.date?'<span class="lp-log-meta-item">'+calSvg+'<span>'+l.date+'</span></span>':'')
            +(l.time?'<span class="lp-log-meta-item">'+clkSvg+'<span>'+l.time+'</span></span>':'')
            +'</div>'
            +'<div class="lp-log-comment-row"><span class="lp-log-comment-label">Comment:</span>'+l.action+'</div>'
            +'</div>'
            +'</div>';
        }).join('')+'</div>'
      :'<div class="lp-logs-empty">No activity logs yet.</div>';
    const csk=deLogKey(emp.status||'Active');
    const formHTML='<div class="lp-logs-form">'
      +'<div class="lp-logs-form-header"><span class="lp-log-dot lp-log-dot--'+csk+'"></span>'+emp.status+'</div>'
      +'<p class="lp-logs-form-sub">Update employee status and add a comment</p>'
      +'<div class="lp-logs-form-label">Status <span class="lp-logs-form-req">*</span></div>'
      +'<div class="lp-logs-form-sel-wrap"><select class="lp-logs-form-select"><option value="">Select Status</option>'
      +'<option value="Active"'+(emp.status==='Active'?' selected':'')+'>Active</option>'
      +'<option value="Inactive"'+(emp.status==='Inactive'?' selected':'')+'>Inactive</option>'
      +'</select>'+chevSvg+'</div>'
      +'<div class="lp-logs-form-label">Comment <span class="lp-logs-form-req">*</span></div>'
      +'<textarea class="lp-logs-form-textarea" placeholder="Enter comment"></textarea>'
      +'<button class="lp-logs-save-btn">Save</button>'
      +'</div>';
    body='<div class="lp-logs-wrap">'+timelineHTML+formHTML+'</div>';
  }else if(deTab==='workflow'){
    const wf=deWorkflowData[emp.id]||[];
    const wfPersonSvg='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const wfCalSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    body=wf.length
      ?'<div class="lp-wf-wrap">'+wf.map((w,i)=>'<div class="lp-wf-row">'
          +'<div class="lp-wf-dot-col"><div class="lp-wf-dot"></div>'+(i<wf.length-1?'<div class="lp-wf-connector"></div>':'')+'</div>'
          +'<div class="lp-wf-card">'
          +'<div class="lp-wf-title">'+w.title+'</div>'
          +'<div class="lp-wf-meta-row">'
          +'<span class="lp-wf-meta-item">'+wfPersonSvg+'<span>'+w.user+'</span></span>'
          +(w.date?'<span class="lp-wf-meta-item">'+wfCalSvg+'<span>'+w.date+'</span></span>':'')
          +(w.time?'<span class="lp-wf-meta-sep">|</span><span>'+w.time+'</span>':'')
          +'</div>'
          +'<div class="lp-wf-desc"><span class="lp-wf-desc-label">Description:</span><span class="lp-wf-desc-text">'+w.description+'</span></div>'
          +'</div>'
          +'</div>').join('')+'</div>'
      :'<div class="lp-wf-empty">No workflow configured.</div>';
  }
  return tabBar+'<div class="lp-isb-body">'+body+'</div>';
}
function buildDirectListingHTML(){
  const d='<span style="color:#9ca3af">--</span>';
  // -- Employees waiting on HR for onboarding (see ensureDirectEmpForOnboarding) pin to the top with a notification dot, same "needs action" treatment used on the Contracts sidebar tabs. --
  const sortedEmps=directEmpData.slice().sort(function(a,b){
    return (manualLinkedRunForEmployee(a.id)?0:1)-(manualLinkedRunForEmployee(b.id)?0:1);
  });
  const rows=sortedEmps.map((e,i)=>{
    const pendingRun=manualLinkedRunForEmployee(e.id);
    const nameCell=e.name+(pendingRun?'<span class="de-onboard-badge" title="Onboarding pending"></span>':'');
    return '<tr class="de-row'+(deSelectedId===e.id?' lp-row-selected':'')+(pendingRun?' de-row--pending':'')+'" id="de-row-'+e.id+'" style="cursor:pointer" onclick="openDeSidebar('+e.id+')">'
    +'<td style="color:var(--gray);font-size:13px">'+(i+1)+'</td>'
    +'<td style="font-weight:600;color:var(--navy)">'+nameCell+'</td>'
    +'<td>'+(e.empId||d)+'</td>'
    +'<td>'+(e.dept||d)+'</td>'
    +'<td>'+(e.branch||d)+'</td>'
    +'<td>'+(e.jobTitle||d)+'</td>'
    +'<td><span class="lp-status-badge '+e.status.toLowerCase()+'">'+e.status+'</span></td>'
    +'<td><button class="lp-action-btn" onclick="event.stopPropagation();openDeSidebar('+e.id+')"><svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg></button></td>'
    +'</tr>';
  }).join('');
  const sbInner=deSelectedId?renderDeSidebar():'';
  return '<div class="lp-page">'
    +'<div class="lp-filter-bar"><div class="lp-filter-bar-label">Select Filter</div>'
    +'<div class="lp-filter-bar-row">'
    +apCS('de-f-dept',['Engineering','HR','Product','Design','Sales'],'','Department')
    +apCS('de-f-branch',['Hyderabad','Mumbai','Delhi','Punjab','Bangalore'],'','Branch')
    +apCS('de-f-status',['Active','Inactive'],'','Status')
    +'<button class="lp-pill-reset" onclick="resetDeFilters()">Reset</button>'
    +'<button class="lp-pill-search">Search</button>'
    +'</div></div>'
    +'<div class="lp-split-wrap"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table"><thead><tr>'
    +'<th>SR. NO</th><th>NAME</th><th>EMPLOYEE ID</th><th>DEPARTMENT</th><th>BRANCH</th><th>JOB TITLE</th><th>STATUS</th><th>ACTION</th>'
    +'</tr></thead><tbody>'+rows+'</tbody></table>'
    +'</div></div>'
    +'<div class="lp-split-sb'+(deSelectedId?' open':'')+'" id="de-split-sb"><div class="lp-isb" id="de-isb-inner">'+sbInner+'</div></div>'
    +'</div></div>';
}
// -- PAYROLL PAGE (per-employee readiness list + sidebar, same shape as Direct Employee) --
// -- journeyRunId: only passed by launchers that route in from a journey/task surface (dashboard queue, My Tasks, manual run page). Plain row-opens omit it, so the "action needed" tab badge/banner stays off until the user follows an actual pending-work link. --
function openPrSidebar(id,journeyRunId){
  prSelectedId=id;prTab='basic-details';
  prJourneyContextRunId=journeyRunId||null;
  const sb=document.getElementById('pr-split-sb');if(sb)sb.classList.add('open');
  const inner=document.getElementById('pr-isb-inner');if(inner)inner.innerHTML=renderPrSidebar();
  document.querySelectorAll('.pr-row').forEach(r=>r.classList.toggle('lp-row-selected',r.id==='pr-row-'+id));
}
function closePrSidebar(){
  prSelectedId=null;prJourneyContextRunId=null;
  const sb=document.getElementById('pr-split-sb');if(sb)sb.classList.remove('open');
  document.querySelectorAll('.pr-row').forEach(r=>r.classList.remove('lp-row-selected'));
}
function navPrTab(tab){prTab=tab;const inner=document.getElementById('pr-isb-inner');if(inner){inner.innerHTML=renderPrSidebar();requestAnimationFrame(function(){const nt=document.getElementById('pr-isb-tabs');if(nt){const a=nt.querySelector('.lp-isb-tab.active');if(a)a.scrollIntoView({inline:'start',block:'nearest'});}});}}
function resetPrFilters(){prSelectedId=null;renderADTPage();}
function prReadinessBannerHTML(emp){
  const run=manualLinkedRunForPayrollEmp(emp.id);if(!run)return '';
  if(prJourneyContextRunId!==run.runId)return '';
  const steps=manualJourneySteps(run.journeyId);
  const curStep=steps[run.currentStepIdx];
  if(!curStep||curStep.name!=='Payroll Readiness')return '';
  const j=aiJourneys.find(function(x){return x.id===run.journeyId;})||cfgJourneys.find(function(x){return x.id===run.journeyId;})||{};
  const contextLine='<div style="font-size:11.5px;color:var(--gray);margin-bottom:12px">'+(j.name||'Contract Creation Journey')+' &mdash; Step '+(run.currentStepIdx+1)+' of '+steps.length+': <strong style="color:var(--navy)">'+curStep.name+'</strong></div>';
  const isOwner=portalRole!=='entity-user'||activePersonaId===manualStepOwnerPersonaId(curStep.ownerRole);
  const action=isOwner
    ?'<div style="display:flex;justify-content:flex-end"><button class="btn btn-primary btn-sm" onclick="completeManualStep(\''+run.runId+'\')">Mark Payroll Readiness Complete</button></div>'
    :'<div class="manual-waiting-note">Waiting on <strong>'+curStep.ownerRole+'</strong></div>';
  return '<div class="ep-form-card" style="margin-bottom:16px">'+contextLine+action+'</div>';
}
function buildPayrollListingHTML(){
  const d='<span style="color:#9ca3af">--</span>';
  const sortedEmps=payrollEmpData.slice().sort(function(a,b){
    return (manualLinkedRunForPayrollEmp(a.id)?0:1)-(manualLinkedRunForPayrollEmp(b.id)?0:1);
  });
  const rows=sortedEmps.map((e,i)=>{
    const pendingRun=manualLinkedRunForPayrollEmp(e.id);
    const nameCell=e.name+(pendingRun?'<span class="de-onboard-badge" title="Payroll readiness pending"></span>':'');
    return '<tr class="pr-row'+(prSelectedId===e.id?' lp-row-selected':'')+(pendingRun?' de-row--pending':'')+'" id="pr-row-'+e.id+'" style="cursor:pointer" onclick="openPrSidebar('+e.id+')">'
    +'<td style="color:var(--gray);font-size:13px">'+(i+1)+'</td>'
    +'<td style="font-weight:600;color:var(--navy)">'+nameCell+'</td>'
    +'<td>'+(e.empId||d)+'</td>'
    +'<td>'+(e.country||d)+'</td>'
    +'<td>'+(e.payFrequency||d)+'</td>'
    +'<td>'+(e.currency&&e.grossPay?(e.currency+' '+e.grossPay):d)+'</td>'
    +'<td><span class="lp-status-badge '+e.status.toLowerCase()+'">'+e.status+'</span></td>'
    +'<td><button class="lp-action-btn" onclick="event.stopPropagation();openPrSidebar('+e.id+')"><svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg></button></td>'
    +'</tr>';
  }).join('');
  const sbInner=prSelectedId?renderPrSidebar():'';
  return '<div class="lp-page">'
    +'<div class="lp-filter-bar"><div class="lp-filter-bar-label">Select Filter</div>'
    +'<div class="lp-filter-bar-row">'
    +apCS('pr-f-country',['Netherlands','India','Germany','Spain','United Kingdom'],'','Country')
    +apCS('pr-f-status',['Active','Pending','Inactive'],'','Status')
    +'<button class="lp-pill-reset" onclick="resetPrFilters()">Reset</button>'
    +'<button class="lp-pill-search">Search</button>'
    +'</div></div>'
    +'<div class="lp-split-wrap"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table"><thead><tr>'
    +'<th>SR. NO</th><th>NAME</th><th>EMPLOYEE ID</th><th>COUNTRY</th><th>PAY FREQUENCY</th><th>GROSS PAY</th><th>STATUS</th><th>ACTION</th>'
    +'</tr></thead><tbody>'+rows+'</tbody></table>'
    +'</div></div>'
    +'<div class="lp-split-sb'+(prSelectedId?' open':'')+'" id="pr-split-sb"><div class="lp-isb" id="pr-isb-inner">'+sbInner+'</div></div>'
    +'</div></div>';
}
function renderPrSidebar(){
  const emp=payrollEmpData.find(e=>e.id===prSelectedId);if(!emp)return '';
  const tabs=[{id:'basic-details',label:'Basic Details'},{id:'readiness',label:'Payroll Readiness'},{id:'logs',label:'Logs'},{id:'workflow',label:'Workflow'}];
  // -- Same journey-context gate as the Contracts sidebar (ctJourneyContextRunId): only badge the tab when this sidebar was opened by following the run's journey link, not on a plain row-open. --
  const pendingRun=manualLinkedRunForPayrollEmp(emp.id);
  const pendingTab=(pendingRun&&prJourneyContextRunId===pendingRun.runId)?'readiness':null;
  const tabBar='<div class="lp-isb-tabbar">'
    +'<button class="lp-isb-nav-btn" onclick="scrollTabRow(\'left\',\'pr-isb-tabs\')" title="Scroll left"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<div class="lp-isb-tabs" id="pr-isb-tabs">'+tabs.map(t=>'<button class="lp-isb-tab'+(prTab===t.id?' active':'')+(pendingTab===t.id?' lp-isb-tab--pending':'')+'" onclick="navPrTab(\''+t.id+'\')">'+t.label+(pendingTab===t.id?'<span class="lp-isb-tab-badge" title="Action needed"></span>':'')+'</button>').join('')+'</div>'
    +'<button class="lp-isb-nav-btn nav-right" onclick="scrollTabRow(\'right\',\'pr-isb-tabs\')" title="Scroll right"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'<div class="lp-isb-right"><button class="lp-isb-close" onclick="closePrSidebar()" title="Close"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'</div>';
  const d='<span style="color:#9ca3af">--</span>';
  const v=(x)=>x&&x!=='--'?x:d;
  const iP='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const iGlobe='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
  const iBag='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>';
  const iClock='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  const iDollar='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
  const iCheck='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  const fc=(ico,label,val)=>'<div class="lp-sb-field-card"><div class="lp-sb-field-icon">'+ico+'</div><div class="lp-sb-field-content"><div class="lp-sb-field-label">'+label+'</div><div class="lp-sb-field-value">'+val+'</div></div></div>';
  let body='';
  if(prTab==='basic-details'){
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">'+emp.name+'</span></div>'
      +'<div class="lp-sb-detail-grid">'
      +fc(iP,'Name',v(emp.name))+fc(iGlobe,'Country',v(emp.country))
      +fc(iBag,'Job Title',v(emp.jobTitle))+fc(iClock,'Pay Frequency',v(emp.payFrequency))
      +fc(iDollar,'Gross Pay',v(emp.currency&&emp.grossPay!=='—'?(emp.currency+' '+emp.grossPay):null))
      +'</div>';
  }else if(prTab==='readiness'){
    const statusPill=(s)=>'<span class="lp-status-badge '+(s==='Verified'?'active':'pending')+'">'+s+'</span>';
    body=prReadinessBannerHTML(emp)
      +'<div class="lp-sb-view-header"><span class="lp-sb-section-title">Payroll Readiness Checklist</span></div>'
      +'<div class="lp-sb-detail-grid">'
      +fc(iCheck,'Bank Details',statusPill(emp.bankStatus||'Pending'))
      +fc(iCheck,'Tax ID',statusPill(emp.taxIdStatus||'Pending'))
      +fc(iClock,'Pay Frequency Confirmed',statusPill(emp.payFrequency?'Verified':'Pending'))
      +fc(iDollar,'Compensation Mapping',statusPill(emp.grossPay&&emp.grossPay!=='—'?'Verified':'Pending'))
      +'</div>';
  }else if(prTab==='logs'){
    const logs=prLogsData[emp.id]||[];
    const personSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const calSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    const clkSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    body=logs.length
      ?'<div class="lp-logs-timeline">'+logs.map((l,i)=>'<div class="lp-log-row">'
          +'<div class="lp-log-avatar-col"><div class="lp-log-avatar lp-log-avatar--active">'+personSvg+'</div>'+(i<logs.length-1?'<div class="lp-log-connector"></div>':'')+'</div>'
          +'<div class="lp-log-card"><div class="lp-log-status-row"><span class="lp-log-dot lp-log-dot--active"></span><span class="lp-log-status-text lp-log-status-text--active">'+l.status+'</span></div>'
          +'<div class="lp-log-meta-row"><span class="lp-log-meta-item">'+personSvg+'<span>'+l.user+'</span></span>'+(l.date?'<span class="lp-log-meta-item">'+calSvg+'<span>'+l.date+'</span></span>':'')+(l.time?'<span class="lp-log-meta-item">'+clkSvg+'<span>'+l.time+'</span></span>':'')+'</div>'
          +'<div class="lp-log-comment-row"><span class="lp-log-comment-label">Comment:</span>'+l.action+'</div>'
          +'</div></div>').join('')+'</div>'
      :'<div class="lp-logs-empty">No activity logs yet.</div>';
  }else if(prTab==='workflow'){
    const wf=prWorkflowData[emp.id]||[];
    body=wf.length
      ?'<div class="lp-wf-wrap">'+wf.map((w,i)=>'<div class="lp-wf-row"><div class="lp-wf-dot-col"><div class="lp-wf-dot"></div>'+(i<wf.length-1?'<div class="lp-wf-connector"></div>':'')+'</div><div class="lp-wf-card"><div class="lp-wf-title">'+w.title+'</div><div class="lp-wf-meta-row"><span class="lp-wf-meta-item">'+w.user+'</span>'+(w.date?'<span class="lp-wf-meta-item">'+w.date+'</span>':'')+'</div><div class="lp-wf-desc"><span class="lp-wf-desc-label">Description:</span><span class="lp-wf-desc-text">'+w.description+'</span></div></div></div>').join('')+'</div>'
      :'<div class="lp-wf-empty">No workflow configured.</div>';
  }
  return tabBar+'<div class="lp-isb-body">'+body+'</div>';
}
function openGeSidebar(id){
  geSelectedId=id;geTab='basic-details';
  const sb=document.getElementById('ge-split-sb');if(sb)sb.classList.add('open');
  const inner=document.getElementById('ge-isb-inner');if(inner)inner.innerHTML=renderGeSidebar();
  document.querySelectorAll('.ge-row').forEach(r=>r.classList.toggle('lp-row-selected',r.id==='ge-row-'+id));
}
function closeGeSidebar(){
  geSelectedId=null;
  const sb=document.getElementById('ge-split-sb');if(sb)sb.classList.remove('open');
  document.querySelectorAll('.ge-row').forEach(r=>r.classList.remove('lp-row-selected'));
}
function navGeTab(tab){geTab=tab;const inner=document.getElementById('ge-isb-inner');if(inner){inner.innerHTML=renderGeSidebar();requestAnimationFrame(function(){const nt=document.getElementById('ge-isb-tabs');if(nt){const a=nt.querySelector('.lp-isb-tab.active');if(a)a.scrollIntoView({inline:'start',block:'nearest'});}});}}
function renderGeSidebar(){
  const emp=globalEmpData.find(e=>e.id===geSelectedId);if(!emp)return '';
  const tabs=[{id:'basic-details',label:'Basic Details'},{id:'bank-details',label:'Bank Details'},{id:'attachments',label:'Attachments'},{id:'salary-details',label:'Salary Details'},{id:'logs',label:'Logs'},{id:'workflow',label:'Workflow'}];
  const tabBar='<div class="lp-isb-tabbar">'
    +'<button class="lp-isb-nav-btn" onclick="scrollTabRow(\'left\',\'ge-isb-tabs\')" title="Scroll left"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<div class="lp-isb-tabs" id="ge-isb-tabs">'+tabs.map(t=>'<button class="lp-isb-tab'+(geTab===t.id?' active':'')+'" onclick="navGeTab(\''+t.id+'\')">'+t.label+'</button>').join('')+'</div>'
    +'<button class="lp-isb-nav-btn nav-right" onclick="scrollTabRow(\'right\',\'ge-isb-tabs\')" title="Scroll right"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'<div class="lp-isb-right"><button class="lp-isb-close" onclick="closeGeSidebar()" title="Close"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'</div>';
  const d='<span style="color:#9ca3af">--</span>';
  const v=(x)=>x&&x!=='--'?x:d;
  const iP='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const iB='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>';
  const iI='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h.01M10 12h4"/></svg>';
  const iPin='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/></svg>';
  const iGlobe='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
  const iBag='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>';
  const iCal='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const iDoc='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
  const iPhone='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.2.73.43 1.44.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.9-.87a2 2 0 0 1 2.11-.45c1.37.27 2.08.5 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>';
  const iMail='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  const iTag='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>';
  const fc=(ico,label,val)=>'<div class="lp-sb-field-card"><div class="lp-sb-field-icon">'+ico+'</div><div class="lp-sb-field-content"><div class="lp-sb-field-label">'+label+'</div><div class="lp-sb-field-value">'+val+'</div></div></div>';
  let body='';
  if(geTab==='basic-details'){
    const editBtn='<button class="ep-save-btn" style="padding:5px 14px;font-size:12px;display:flex;align-items:center;gap:5px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit</button>';
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">'+emp.name+'</span>'+editBtn+'</div>'
      +'<div class="lp-sb-detail-grid">'
      +fc(iP,'Name',v(emp.name))+fc(iB,'Department',v(emp.dept))
      +fc(iI,'Employee ID',v(emp.empId))+fc(iGlobe,'Country',v(emp.country))
      +fc(iBag,'Job Title',v(emp.jobTitle))+fc(iTag,'Worker Type',v(emp.workerType))
      +fc(iCal,'Joining Date',v(emp.joinDate))+fc(iDoc,'Description',v(emp.desc))
      +fc(iPhone,'Contact Number',v(emp.contact))+fc(iMail,'Email',v(emp.email))
      +'</div>';
  }else if(geTab==='bank-details'){
    const bankData=[
      {loc:'Germany',pay:'Emma Schmidt',bank:'Deutsche Bank'},
      {loc:'Germany',pay:'',bank:''}
    ];
    const thS='padding:8px 10px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;background:#f8fafc;border-bottom:1px solid var(--border)';
    const tdS='padding:9px 10px;font-size:13px;color:var(--navy);border-bottom:1px solid #f1f5f9';
    const dash='<span style="color:#9ca3af">--</span>';
    body='<div style="display:flex;justify-content:flex-end;margin-bottom:14px">'
      +'<button style="color:var(--orange);background:none;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">+ Add Bank Detail</button>'
      +'</div>'
      +'<table style="width:100%;border-collapse:collapse">'
      +'<thead><tr>'
      +'<th style="'+thS+'">S.no</th><th style="'+thS+'">Location</th><th style="'+thS+'">Pay Name</th><th style="'+thS+'">Pay Bank</th>'
      +'</tr></thead>'
      +'<tbody>'+bankData.map((r,i)=>'<tr>'
        +'<td style="'+tdS+';color:#6b7280">'+(i+1)+'</td>'
        +'<td style="'+tdS+'">'+(r.loc||dash)+'</td>'
        +'<td style="'+tdS+';color:'+(r.pay?'var(--orange)':'#9ca3af')+'">'+(r.pay||'--')+'</td>'
        +'<td style="'+tdS+';color:'+(r.bank?'var(--orange)':'#9ca3af')+'">'+(r.bank||'--')+'</td>'
        +'</tr>').join('')
      +'</tbody></table>';
  }else if(geTab==='attachments'){
    const thS='padding:8px 10px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;background:#f8fafc;border-bottom:1px solid var(--border);text-transform:uppercase;letter-spacing:.4px';
    body='<div style="display:flex;justify-content:flex-end;margin-bottom:14px">'
      +'<button style="color:var(--orange);background:none;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">+ Add Attachment</button>'
      +'</div>'
      +'<table style="width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:8px;overflow:hidden">'
      +'<thead><tr>'
      +'<th style="'+thS+'">SR. NO</th><th style="'+thS+'">File Name</th><th style="'+thS+'">Uploaded By</th><th style="'+thS+'">Type</th><th style="'+thS+'">Source</th><th style="'+thS+'">Action</th>'
      +'</tr></thead>'
      +'<tbody><tr><td colspan="6" style="padding:28px 10px;text-align:center;font-size:13px;color:#9ca3af;font-weight:500">No attachments available</td></tr></tbody>'
      +'</table>';
  }else if(geTab==='salary-details'){
    const thS='padding:7px 9px;font-size:11px;font-weight:600;color:#6b7280;background:#f8fafc;border-bottom:1px solid var(--border);text-transform:uppercase;letter-spacing:.4px;text-align:left';
    body='<div style="margin-bottom:16px">'
        +'<div style="font-size:15px;font-weight:700;color:var(--navy)">Salary Details</div>'
        +'<div style="font-size:12px;color:var(--orange);margin-top:2px">Configure employee payment details</div>'
      +'</div>'
      +'<div class="ep-form-card" style="margin-bottom:14px">'
        +'<div class="ep-form-title">Core Details</div>'
        +'<div class="ep-form-grid">'
          +'<div class="ep-form-group"><label class="ep-form-label">Base Salary <span class="req">*</span></label><input class="ep-form-input" type="number" placeholder="Enter base salary"></div>'
          +'<div class="ep-form-group"><label class="ep-form-label">Pay Frequency <span class="req">*</span></label><select class="ep-form-select"><option value="">Select frequency</option><option>Monthly</option><option>Biweekly</option><option>Weekly</option></select></div>'
          +'<div class="ep-form-group"><label class="ep-form-label">Effective Date</label><input class="ep-form-input" type="date"></div>'
          +'<div class="ep-form-group"><label class="ep-form-label">Currency</label><select class="ep-form-select"><option>EUR (€)</option><option>GBP (£)</option><option>INR (₹)</option><option>USD ($)</option></select></div>'
        +'</div>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">'
        +'<div class="ep-form-card" style="padding:14px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:8px">Earnings</div><div style="color:var(--orange);font-size:12px;margin-bottom:4px">Base Salary is not set.</div><div style="color:#9ca3af;font-size:12px">No earnings payheads assigned</div></div>'
        +'<div class="ep-form-card" style="padding:14px"><div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:8px">Deductions</div><div style="color:var(--orange);font-size:12px;margin-bottom:4px">Base Salary is not set.</div><div style="color:#9ca3af;font-size:12px">No deduction payheads assigned</div></div>'
      +'</div>'
      +'<div class="ep-form-card" style="margin-bottom:14px">'
        +'<div class="ep-form-title">Assign Payheads</div>'
        +'<div style="color:#9ca3af;font-size:12px;margin-bottom:10px">No payheads assigned</div>'
        +'<label class="ep-form-label" style="display:block;margin-bottom:6px">Select Additional Payheads</label>'
        +'<div class="ep-emp-search"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Search payheads..."></div>'
      +'</div>'
      +'<div class="ep-form-card" style="background:#fffbf5;border-color:#fde68a;padding:16px 22px;margin-bottom:14px">'
        +'<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:14px;font-weight:700;color:var(--navy)">Net Salary</span><span style="color:var(--orange);font-weight:700;font-size:20px">--</span></div>'
      +'</div>'
      +'<div class="ep-form-card" style="margin-bottom:16px">'
        +'<div class="ep-form-title">Salary Schedule</div>'
        +'<table style="width:100%;border-collapse:collapse"><thead><tr>'
        +'<th style="'+thS+'">SR. NO</th><th style="'+thS+'">Salary From</th><th style="'+thS+'">Salary To</th><th style="'+thS+'">Amount</th>'
        +'</tr></thead><tbody><tr><td colspan="4" style="padding:22px 8px;text-align:center;font-size:12px;color:#9ca3af">No salary history</td></tr></tbody></table>'
      +'</div>'
      +'<div style="display:flex;justify-content:flex-end;gap:10px"><button class="ep-cancel-btn">Cancel</button><button class="ep-save-btn">Save</button></div>';
  }else if(geTab==='logs'){
    const logs=geLogsData[emp.id]||[];
    const geLogKey=(s)=>({Active:'active',Inactive:'inactive'}[s]||'default');
    const personSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const calSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    const clkSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    const chevSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
    const timelineHTML=logs.length
      ?'<div class="lp-logs-timeline">'+logs.map((l,i)=>{
          const sk=geLogKey(l.status);
          return '<div class="lp-log-row">'
            +'<div class="lp-log-avatar-col"><div class="lp-log-avatar lp-log-avatar--'+sk+'">'+personSvg+'</div>'+(i<logs.length-1?'<div class="lp-log-connector"></div>':'')+'</div>'
            +'<div class="lp-log-card">'
            +'<div class="lp-log-status-row"><span class="lp-log-dot lp-log-dot--'+sk+'"></span><span class="lp-log-status-text lp-log-status-text--'+sk+'">'+l.status+'</span></div>'
            +'<div class="lp-log-meta-row"><span class="lp-log-meta-item">'+personSvg+'<span>'+l.user+'</span></span>'+(l.date?'<span class="lp-log-meta-item">'+calSvg+'<span>'+l.date+'</span></span>':'')+(l.time?'<span class="lp-log-meta-item">'+clkSvg+'<span>'+l.time+'</span></span>':'')+'</div>'
            +'<div class="lp-log-comment-row"><span class="lp-log-comment-label">Comment:</span>'+l.action+'</div>'
            +'</div></div>';
        }).join('')+'</div>'
      :'<div class="lp-logs-empty">No activity logs yet.</div>';
    const csk=geLogKey(emp.status||'Active');
    const formHTML='<div class="lp-logs-form">'
      +'<div class="lp-logs-form-header"><span class="lp-log-dot lp-log-dot--'+csk+'"></span>'+emp.status+'</div>'
      +'<p class="lp-logs-form-sub">Update employee status and add a comment</p>'
      +'<div class="lp-logs-form-label">Status <span class="lp-logs-form-req">*</span></div>'
      +'<div class="lp-logs-form-sel-wrap"><select class="lp-logs-form-select"><option value="">Select Status</option>'
      +'<option value="Active"'+(emp.status==='Active'?' selected':'')+'>Active</option>'
      +'<option value="Inactive"'+(emp.status==='Inactive'?' selected':'')+'>Inactive</option>'
      +'</select>'+chevSvg+'</div>'
      +'<div class="lp-logs-form-label">Comment <span class="lp-logs-form-req">*</span></div>'
      +'<textarea class="lp-logs-form-textarea" placeholder="Enter comment"></textarea>'
      +'<button class="lp-logs-save-btn">Save</button></div>';
    body='<div class="lp-logs-wrap">'+timelineHTML+formHTML+'</div>';
  }else if(geTab==='workflow'){
    const wf=geWorkflowData[emp.id]||[];
    const wfPersonSvg='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const wfCalSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    body=wf.length
      ?'<div class="lp-wf-wrap">'+wf.map((w,i)=>'<div class="lp-wf-row">'
          +'<div class="lp-wf-dot-col"><div class="lp-wf-dot"></div>'+(i<wf.length-1?'<div class="lp-wf-connector"></div>':'')+'</div>'
          +'<div class="lp-wf-card"><div class="lp-wf-title">'+w.title+'</div>'
          +'<div class="lp-wf-meta-row"><span class="lp-wf-meta-item">'+wfPersonSvg+'<span>'+w.user+'</span></span>'+(w.date?'<span class="lp-wf-meta-item">'+wfCalSvg+'<span>'+w.date+'</span></span>':'')+(w.time?'<span class="lp-wf-meta-sep">|</span><span>'+w.time+'</span>':'')+'</div>'
          +'<div class="lp-wf-desc"><span class="lp-wf-desc-label">Description:</span><span class="lp-wf-desc-text">'+w.description+'</span></div>'
          +'</div></div>').join('')+'</div>'
      :'<div class="lp-wf-empty">No workflow configured.</div>';
  }
  return tabBar+'<div class="lp-isb-body">'+body+'</div>';
}
function buildGlobalListingHTML(){
  const d='<span style="color:#9ca3af">--</span>';
  const filtered=geStatusFilter?globalEmpData.filter(e=>e.status===geStatusFilter):globalEmpData;
  if(geSelectedId&&!filtered.some(e=>e.id===geSelectedId))geSelectedId=null;
  const rows=filtered.length?filtered.map((e,i)=>'<tr class="ge-row'+(geSelectedId===e.id?' lp-row-selected':'')+'" id="ge-row-'+e.id+'" style="cursor:pointer" onclick="openGeSidebar('+e.id+')">'
    +'<td style="color:var(--gray);font-size:13px">'+(i+1)+'</td>'
    +'<td style="font-weight:600;color:var(--navy)">'+e.name+'</td>'
    +'<td>'+(e.empId||d)+'</td>'
    +'<td>'+(e.dept||d)+'</td>'
    +'<td>'+(e.country||d)+'</td>'
    +'<td>'+(e.jobTitle||d)+'</td>'
    +'<td>'+(e.workerType?'<span class="lp-status-badge active" style="background:#eff6ff;color:#2563eb;border-color:#bfdbfe">'+e.workerType+'</span>':d)+'</td>'
    +'<td><span class="lp-status-badge '+e.status.toLowerCase()+'">'+e.status+'</span></td>'
    +'<td><button class="lp-action-btn" onclick="event.stopPropagation();openGeSidebar('+e.id+')"><svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg></button></td>'
    +'</tr>').join(''):'<tr><td colspan="9" style="padding:24px;text-align:center;color:var(--gray)">No employees match this filter.</td></tr>';
  const sbInner=geSelectedId?renderGeSidebar():'';
  return '<div class="lp-page">'
    +'<div class="lp-filter-bar"><div class="lp-filter-bar-label">Select Filter</div>'
    +'<div class="lp-filter-bar-row">'
    +apCS('ge-f-country',['Germany','France','Italy','United Kingdom','Netherlands'],'','Country')
    +apCS('ge-f-dept',['Engineering','Finance','HR','Operations','Product'],'','Department')
    +apCS('ge-f-type',['EOR','Contractor','PEO'],'','Worker Type')
    +apCS('ge-f-status',['Active','Inactive'],geStatusFilter,'Status')
    +'<button class="lp-pill-reset" onclick="resetGeFilters()">Reset</button>'
    +'<button class="lp-pill-search" onclick="applyGeFilters()">Search</button>'
    +'</div></div>'
    +'<div class="lp-split-wrap"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table"><thead><tr>'
    +'<th>SR. NO</th><th>NAME</th><th>EMPLOYEE ID</th><th>DEPARTMENT</th><th>COUNTRY</th><th>JOB TITLE</th><th>WORKER TYPE</th><th>STATUS</th><th>ACTION</th>'
    +'</tr></thead><tbody>'+rows+'</tbody></table>'
    +'</div></div>'
    +'<div class="lp-split-sb'+(geSelectedId?' open':'')+'" id="ge-split-sb"><div class="lp-isb" id="ge-isb-inner">'+sbInner+'</div></div>'
    +'</div></div>';
}
function applyGeFilters(){
  const status=getCSValue('ge-f-status');
  geStatusFilter=status&&status!=='Status'?status:'';
  geSelectedId=null;
  renderADTPage();
}
function resetGeFilters(){
  geStatusFilter='';
  geSelectedId=null;
  renderADTPage();
}
function openTmSidebar(id){
  tmSelectedId=id;tmTab='basic-details';
  const sb=document.getElementById('tm-split-sb');if(sb)sb.classList.add('open');
  const inner=document.getElementById('tm-isb-inner');if(inner)inner.innerHTML=renderTmSidebar();
  document.querySelectorAll('.tm-row').forEach(r=>r.classList.toggle('lp-row-selected',r.id==='tm-row-'+id));
}
function closeTmSidebar(){
  tmSelectedId=null;
  const sb=document.getElementById('tm-split-sb');if(sb)sb.classList.remove('open');
  document.querySelectorAll('.tm-row').forEach(r=>r.classList.remove('lp-row-selected'));
}
function navTmTab(tab){tmTab=tab;const inner=document.getElementById('tm-isb-inner');if(inner){inner.innerHTML=renderTmSidebar();requestAnimationFrame(function(){const nt=document.getElementById('tm-isb-tabs');if(nt){const a=nt.querySelector('.lp-isb-tab.active');if(a)a.scrollIntoView({inline:'start',block:'nearest'});}});}}
function renderTmSidebar(){
  const team=teamsData.find(t=>t.id===tmSelectedId);if(!team)return '';
  const tabs=[{id:'basic-details',label:'Basic Details'},{id:'team-members',label:'Team Members'},{id:'logs',label:'Logs'},{id:'workflow',label:'Workflow'}];
  const tabBar='<div class="lp-isb-tabbar">'
    +'<button class="lp-isb-nav-btn" onclick="scrollTabRow(\'left\',\'tm-isb-tabs\')" title="Scroll left"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<div class="lp-isb-tabs" id="tm-isb-tabs">'+tabs.map(t=>'<button class="lp-isb-tab'+(tmTab===t.id?' active':'')+'" onclick="navTmTab(\''+t.id+'\')">'+t.label+'</button>').join('')+'</div>'
    +'<button class="lp-isb-nav-btn nav-right" onclick="scrollTabRow(\'right\',\'tm-isb-tabs\')" title="Scroll right"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'<div class="lp-isb-right"><button class="lp-isb-close" onclick="closeTmSidebar()" title="Close"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'</div>';
  const d='<span style="color:#9ca3af">--</span>';
  const v=(x)=>x&&x!=='--'?x:d;
  const iId='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h.01M10 12h4"/></svg>';
  const iTeam='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>';
  const iMail='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  const iUser='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const iCal='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const iCheck='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  const fc=(ico,label,val)=>'<div class="lp-sb-field-card"><div class="lp-sb-field-icon">'+ico+'</div><div class="lp-sb-field-content"><div class="lp-sb-field-label">'+label+'</div><div class="lp-sb-field-value">'+val+'</div></div></div>';
  const statusVal='<span style="color:'+(team.status==='Active'?'var(--orange)':team.status==='Inactive'?'#ef4444':'#f59e0b')+'">'+team.status+'</span>';
  let body='';
  if(tmTab==='basic-details'){
    const editBtn='<button class="ep-save-btn" style="padding:5px 14px;font-size:12px;display:flex;align-items:center;gap:5px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit</button>';
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">'+team.name+'</span>'+editBtn+'</div>'
      +'<div class="lp-sb-detail-grid">'
      +fc(iId,'Team ID',v(team.teamId))+fc(iTeam,'Team Name',v(team.name))
      +fc(iMail,'Team Email',v(team.email))+fc(iUser,'Created By',v(team.createdBy))
      +fc(iCal,'Joining Date',v(team.joinDate))+fc(iCheck,'Status',statusVal)
      +'</div>';
  }else if(tmTab==='team-members'){
    const thS='padding:8px 10px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;background:#f8fafc;border-bottom:1px solid var(--border);text-transform:uppercase;letter-spacing:.4px';
    const tdS='padding:10px 10px;font-size:13px;color:var(--navy);border-bottom:1px solid #f1f5f9';
    const editIco='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    const delIco='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
    body='<div style="display:flex;justify-content:flex-end;margin-bottom:14px">'
      +'<button style="color:var(--orange);background:none;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">+ Add Team Members</button>'
      +'</div>'
      +'<table style="width:100%;border-collapse:collapse">'
      +'<thead><tr>'
      +'<th style="'+thS+'">SR. NO</th><th style="'+thS+'">Name</th><th style="'+thS+'">Role</th><th style="'+thS+'">Designation</th><th style="'+thS+'">Action</th>'
      +'</tr></thead>'
      +'<tbody>'+(team.membersList.length
        ?team.membersList.map((m,i)=>'<tr>'
          +'<td style="'+tdS+';color:#6b7280">'+(i+1)+'</td>'
          +'<td style="'+tdS+';font-weight:600">'+m.name+'</td>'
          +'<td style="'+tdS+';color:var(--orange);font-weight:500">'+m.role+'</td>'
          +'<td style="'+tdS+'">'+(m.desig&&m.desig!=='--'?m.desig:'<span style="color:#9ca3af">--</span>')+'</td>'
          +'<td style="'+tdS+'"><div style="display:flex;gap:10px;align-items:center">'
          +'<button style="border:none;background:none;cursor:pointer;color:#64748b;padding:0" title="Edit">'+editIco+'</button>'
          +'<button style="border:none;background:none;cursor:pointer;color:#ef4444;padding:0" title="Delete">'+delIco+'</button>'
          +'</div></td>'
          +'</tr>').join('')
        :'<tr><td colspan="5" style="padding:28px 10px;text-align:center;font-size:13px;color:#9ca3af">No members assigned</td></tr>')
      +'</tbody></table>';
  }else if(tmTab==='logs'){
    const logs=tmLogsData[team.id]||[];
    const tmLogKey=(s)=>({Active:'active',Inactive:'inactive'}[s]||'default');
    const personSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const calSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    const clkSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    const chevSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
    const timelineHTML=logs.length
      ?'<div class="lp-logs-timeline">'+logs.map((l,i)=>{
          const sk=tmLogKey(l.status);
          return '<div class="lp-log-row">'
            +'<div class="lp-log-avatar-col"><div class="lp-log-avatar lp-log-avatar--'+sk+'">'+personSvg+'</div>'+(i<logs.length-1?'<div class="lp-log-connector"></div>':'')+'</div>'
            +'<div class="lp-log-card">'
            +'<div class="lp-log-status-row"><span class="lp-log-dot lp-log-dot--'+sk+'"></span><span class="lp-log-status-text lp-log-status-text--'+sk+'">'+l.status+'</span></div>'
            +'<div class="lp-log-meta-row"><span class="lp-log-meta-item">'+personSvg+'<span>'+l.user+'</span></span>'+(l.date?'<span class="lp-log-meta-item">'+calSvg+'<span>'+l.date+'</span></span>':'')+(l.time?'<span class="lp-log-meta-item">'+clkSvg+'<span>'+l.time+'</span></span>':'')+'</div>'
            +'<div class="lp-log-comment-row"><span class="lp-log-comment-label">Comment:</span>'+l.action+'</div>'
            +'</div></div>';
        }).join('')+'</div>'
      :'<div class="lp-logs-empty">No activity logs yet.</div>';
    const csk=tmLogKey(team.status||'Active');
    const formHTML='<div class="lp-logs-form">'
      +'<div class="lp-logs-form-header"><span class="lp-log-dot lp-log-dot--'+csk+'"></span>'+team.status+'</div>'
      +'<p class="lp-logs-form-sub">Update team status and add a comment</p>'
      +'<div class="lp-logs-form-label">Status <span class="lp-logs-form-req">*</span></div>'
      +'<div class="lp-logs-form-sel-wrap"><select class="lp-logs-form-select"><option value="">Select Status</option>'
      +'<option value="Active"'+(team.status==='Active'?' selected':'')+'>Active</option>'
      +'<option value="Inactive"'+(team.status==='Inactive'?' selected':'')+'>Inactive</option>'
      +'</select>'+chevSvg+'</div>'
      +'<div class="lp-logs-form-label">Comment <span class="lp-logs-form-req">*</span></div>'
      +'<textarea class="lp-logs-form-textarea" placeholder="Enter comment"></textarea>'
      +'<button class="lp-logs-save-btn">Save</button></div>';
    body='<div class="lp-logs-wrap">'+timelineHTML+formHTML+'</div>';
  }else if(tmTab==='workflow'){
    const wf=tmWorkflowData[team.id]||[];
    const wfPersonSvg='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const wfCalSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    body=wf.length
      ?'<div class="lp-wf-wrap">'+wf.map((w,i)=>'<div class="lp-wf-row">'
          +'<div class="lp-wf-dot-col"><div class="lp-wf-dot"></div>'+(i<wf.length-1?'<div class="lp-wf-connector"></div>':'')+'</div>'
          +'<div class="lp-wf-card"><div class="lp-wf-title">'+w.title+'</div>'
          +'<div class="lp-wf-meta-row"><span class="lp-wf-meta-item">'+wfPersonSvg+'<span>'+w.user+'</span></span>'+(w.date?'<span class="lp-wf-meta-item">'+wfCalSvg+'<span>'+w.date+'</span></span>':'')+(w.time?'<span class="lp-wf-meta-sep">|</span><span>'+w.time+'</span>':'')+'</div>'
          +'<div class="lp-wf-desc"><span class="lp-wf-desc-label">Description:</span><span class="lp-wf-desc-text">'+w.description+'</span></div>'
          +'</div></div>').join('')+'</div>'
      :'<div class="lp-wf-empty">No workflow configured.</div>';
  }
  return tabBar+'<div class="lp-isb-body">'+body+'</div>';
}
function buildTeamsListingHTML(){
  const d='<span style="color:#9ca3af">--</span>';
  const rows=teamsData.map((t,i)=>'<tr class="tm-row'+(tmSelectedId===t.id?' lp-row-selected':'')+'" id="tm-row-'+t.id+'" style="cursor:pointer" onclick="openTmSidebar('+t.id+')">'
    +'<td style="color:var(--gray);font-size:13px">'+(i+1)+'</td>'
    +'<td style="font-weight:600;color:var(--navy)">'+t.name+'</td>'
    +'<td>'+(t.dept||d)+'</td>'
    +'<td>'+(t.country||d)+'</td>'
    +'<td style="font-weight:600;color:var(--navy)">'+t.members+'</td>'
    +'<td><span class="lp-status-badge '+t.status.toLowerCase()+'">'+t.status+'</span></td>'
    +'<td><button class="lp-action-btn" onclick="event.stopPropagation();openTmSidebar('+t.id+')"><svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg></button></td>'
    +'</tr>').join('');
  const sbInner=tmSelectedId?renderTmSidebar():'';
  return '<div class="lp-page">'
    +'<div class="lp-filter-bar"><div class="lp-filter-bar-label">Select Filter</div>'
    +'<div class="lp-filter-bar-row">'
    +apCS('tm-f-team',teamsData.map(t=>t.name),'','Select Team')
    +apCS('tm-f-status',['Active','Inactive','Pending'],'','Status')
    +'<button class="lp-pill-reset">Reset</button>'
    +'<button class="lp-pill-search">Search</button>'
    +'</div></div>'
    +'<div class="lp-split-wrap"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table"><thead><tr>'
    +'<th>SR. NO</th><th>TEAM NAME</th><th>DEPARTMENT</th><th>COUNTRY</th><th>MEMBERS</th><th>STATUS</th><th>ACTION</th>'
    +'</tr></thead><tbody>'+rows+'</tbody></table>'
    +'</div></div>'
    +'<div class="lp-split-sb'+(tmSelectedId?' open':'')+'" id="tm-split-sb"><div class="lp-isb" id="tm-isb-inner">'+sbInner+'</div></div>'
    +'</div></div>';
}
function openAlSidebar(id){
  alSelectedId=id;alTab='basic-details';
  const sb=document.getElementById('al-split-sb');if(sb)sb.classList.add('open');
  const inner=document.getElementById('al-isb-inner');if(inner)inner.innerHTML=renderAlSidebar();
  document.querySelectorAll('.al-row').forEach(r=>r.classList.toggle('lp-row-selected',r.id==='al-row-'+id));
}
function closeAlSidebar(){
  alSelectedId=null;
  const sb=document.getElementById('al-split-sb');if(sb)sb.classList.remove('open');
  document.querySelectorAll('.al-row').forEach(r=>r.classList.remove('lp-row-selected'));
}
function navAlTab(tab){alTab=tab;const inner=document.getElementById('al-isb-inner');if(inner){inner.innerHTML=renderAlSidebar();requestAnimationFrame(function(){const nt=document.getElementById('al-isb-tabs');if(nt){const a=nt.querySelector('.lp-isb-tab.active');if(a)a.scrollIntoView({inline:'start',block:'nearest'});}});}}
function renderAlSidebar(){
  const l=allLeavesData.find(x=>x.id===alSelectedId);if(!l)return '';
  const tabs=[{id:'basic-details',label:'Basic Details'},{id:'logs',label:'Logs'}];
  const tabBar='<div class="lp-isb-tabbar">'
    +'<button class="lp-isb-nav-btn" onclick="scrollTabRow(\'left\',\'al-isb-tabs\')" title="Scroll left"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<div class="lp-isb-tabs" id="al-isb-tabs">'+tabs.map(t=>'<button class="lp-isb-tab'+(alTab===t.id?' active':'')+'" onclick="navAlTab(\''+t.id+'\')">'+t.label+'</button>').join('')+'</div>'
    +'<button class="lp-isb-nav-btn nav-right" onclick="scrollTabRow(\'right\',\'al-isb-tabs\')" title="Scroll right"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'<div class="lp-isb-right"><button class="lp-isb-close" onclick="closeAlSidebar()" title="Close"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'</div>';
  const iUser='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const iTag='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>';
  const iCal='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const iDoc='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
  const iMail='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  const iClock='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  const iCheck='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  const iId='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/></svg>';
  const fc=(ico,label,val)=>'<div class="lp-sb-field-card"><div class="lp-sb-field-icon">'+ico+'</div><div class="lp-sb-field-content"><div class="lp-sb-field-label">'+label+'</div><div class="lp-sb-field-value">'+val+'</div></div></div>';
  const stColor={Approved:'#16a34a',Pending:'#f59e0b',Unapproved:'#ef4444',Rejected:'#ef4444'};
  const subColor={Paid:'#0d9488',paid:'#0d9488',Unpaid:'#64748b',unpaid:'#64748b'};
  let body='';
  if(alTab==='basic-details'){
    const stVal='<span style="color:'+(stColor[l.status]||'#64748b')+';font-weight:700">'+l.status+'</span>';
    const subVal='<span style="color:'+(subColor[l.subStatus]||'#64748b')+';font-weight:700">'+l.subStatus+'</span>';
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">'+l.name+'</span></div>'
      +'<div class="lp-sb-detail-grid">'
      +fc(iId,'Employee ID',l.empId)+fc(iUser,'Name',l.name)
      +fc(iTag,'Leave ID',l.leaveId)+fc(iTag,'Leave Type',l.leaveType)
      +fc(iCal,'Leave From','<span style="color:var(--orange)">'+l.leaveFrom+'</span>')+fc(iCal,'Leave To','<span style="color:var(--orange)">'+l.leaveTo+'</span>')
      +fc(iDoc,'Description',l.description)+fc(iMail,'Email Address','<span style="color:var(--orange)">'+l.email+'</span>')
      +fc(iClock,'Applied on Date',l.appliedDate)+fc(iUser,'Created by',l.createdBy)
      +fc(iCheck,'Status',stVal)+fc(iCheck,'Sub Status',subVal)
      +'</div>';
  }else if(alTab==='logs'){
    const logs=alLogsData[l.id]||[];
    const alLogKey=(s)=>({Approved:'active',Unapproved:'inactive',Rejected:'inactive',Pending:'default'}[s]||'default');
    const personSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const calSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    const clkSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    const timelineHTML=logs.length
      ?'<div class="lp-logs-timeline">'+logs.map((entry,i)=>{
          const sk=alLogKey(entry.status);
          return '<div class="lp-log-row">'
            +'<div class="lp-log-avatar-col"><div class="lp-log-avatar lp-log-avatar--'+sk+'">'+personSvg+'</div>'+(i<logs.length-1?'<div class="lp-log-connector"></div>':'')+'</div>'
            +'<div class="lp-log-card">'
            +'<div class="lp-log-status-row"><span class="lp-log-dot lp-log-dot--'+sk+'"></span><span class="lp-log-status-text lp-log-status-text--'+sk+'">'+entry.status+'</span></div>'
            +'<div class="lp-log-meta-row"><span class="lp-log-meta-item">'+personSvg+'<span>'+entry.user+'</span></span><span class="lp-log-meta-item">'+calSvg+'<span>'+entry.date+'</span></span><span class="lp-log-meta-item">'+clkSvg+'<span>'+entry.time+'</span></span></div>'
            +'<div class="lp-log-comment-row"><span class="lp-log-comment-label">Action:</span>'+entry.action+'</div>'
            +'</div></div>';
        }).join('')+'</div>'
      :'<div class="lp-logs-empty">No activity logs yet.</div>';
    const statusOpsOpts=['Approved','Unapproved','Pending'].map(s=>'<option>'+s+'</option>').join('');
    const actionPanel='<div class="lp-logs-form">'
      +'<div class="lp-logs-form-header"><span style="width:9px;height:9px;border-radius:50%;background:#f59e0b;display:inline-block;flex-shrink:0"></span>Update Status</div>'
      +'<p class="lp-logs-form-sub">Change the leave status and add a note.</p>'
      +'<div class="lp-logs-form-label">Status <span class="lp-logs-form-req">*</span></div>'
      +'<select class="lp-logs-form-textarea" style="height:36px;padding:0 10px;resize:none">'+statusOpsOpts+'</select>'
      +'<div class="lp-logs-form-label" style="margin-top:10px">Comment <span class="lp-logs-form-req">*</span></div>'
      +'<textarea class="lp-logs-form-textarea" placeholder="Add a note..."></textarea>'
      +'<button class="lp-logs-save-btn">Update</button>'
      +'</div>';
    body='<div class="lp-logs-wrap">'+timelineHTML+actionPanel+'</div>';
  }
  return tabBar+'<div class="lp-isb-body">'+body+'</div>';
}
var alDurationType='multiple';
function setAlDurationType(type){
  alDurationType=type;
  const form=document.getElementById('al-add-form');
  if(!form)return;
  const dateRow=document.getElementById('al-add-date-row');
  const fromGroup=document.getElementById('al-add-from-group');
  const toGroup=document.getElementById('al-add-to-group');
  const halfNote=document.getElementById('al-half-note');
  form.querySelectorAll('.al-dur-radio').forEach(function(r){
    r.classList.remove('selected');
    const circle=r.querySelector('.al-radio-circle');
    if(circle){circle.style.background='#fff';circle.style.borderColor='#d1d5db';circle.innerHTML='';}
  });
  const sel=form.querySelector('.al-dur-radio[data-type="'+type+'"]');
  if(sel){
    sel.classList.add('selected');
    const circle=sel.querySelector('.al-radio-circle');
    if(circle){circle.style.background='var(--orange)';circle.style.borderColor='var(--orange)';circle.innerHTML='<span style="width:6px;height:6px;border-radius:50%;background:#fff;display:block"></span>';}
  }
  if(type==='half'){
    if(dateRow)dateRow.style.display='grid';
    if(fromGroup)fromGroup.style.display='';
    if(toGroup)toGroup.style.display='none';
    if(halfNote)halfNote.style.display='';
  }else if(type==='one'){
    if(dateRow)dateRow.style.display='grid';
    if(fromGroup)fromGroup.style.display='';
    if(toGroup)toGroup.style.display='none';
    if(halfNote)halfNote.style.display='none';
  }else{
    if(dateRow)dateRow.style.display='grid';
    if(fromGroup)fromGroup.style.display='';
    if(toGroup)toGroup.style.display='';
    if(halfNote)halfNote.style.display='none';
  }
}
function toggleAlCc(){
  const wrap=document.getElementById('al-cc-wrap');
  if(wrap)wrap.style.display=wrap.style.display==='none'?'':'none';
}
function submitAddLeave(isDraft){
  const empVal=(document.getElementById('al-emp-search')||{}).value||'';
  const typeWrap=document.getElementById('csw-al-type');
  const typeVal=typeWrap?typeWrap.querySelector('.cs-value').textContent.trim():'';
  const fromVal=(document.getElementById('al-from-date')||{}).value||'';
  const emailVal=(document.getElementById('al-email-input')||{}).value||'';
  const descVal=(document.getElementById('al-desc')||{}).value||'';
  if(!isDraft){
    if(!empVal){alert('Please enter an employee name or ID.');return;}
    if(!typeVal||typeVal==='Select'){alert('Please select a leave type.');return;}
    if(!fromVal){alert('Please select a From Date.');return;}
    if(!emailVal){alert('Please enter employee email.');return;}
    if(!descVal){alert('Please enter a description.');return;}
  }
  const toVal=alDurationType==='multiple'?((document.getElementById('al-to-date')||{}).value||fromVal):fromVal;
  const newId=allLeavesData.length?Math.max.apply(null,allLeavesData.map(function(x){return x.id;}))+1:1;
  const leaveIdNum=allLeavesData.length?Math.max.apply(null,allLeavesData.map(function(x){return parseInt(x.leaveId)||0;}))+1:2100;
  const fmtDate=function(d){
    if(!d)return '--';
    var p=d.split('-');
    return p.length===3?p[2]+'-'+p[1]+'-'+p[0]:d;
  };
  const hrMap={'half':'Half Day','one':'Full Day','multiple':'Full Day'};
  allLeavesData.push({
    id:newId,empId:'CLOCLO'+Math.floor(10000+Math.random()*90000),name:empVal||'Unknown',
    leaveId:String(leaveIdNum),leaveType:typeVal||'Casual Leave',
    leaveFrom:fmtDate(fromVal),leaveTo:fmtDate(toVal),
    leaveHours:hrMap[alDurationType]||'Full Day',
    description:descVal,email:emailVal,
    appliedDate:new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+' '+new Date().toLocaleTimeString(),
    createdBy:'Admin',status:isDraft?'Pending':'Pending',subStatus:'Unpaid'
  });
  alDurationType='multiple';
  page='all-leaves';renderADTPage();
}
function buildAddLeaveHTML(){
  const leaveTypes=['Casual Leave','Sick Leave','Earned Leave','Maternity Leave','Paternity Leave','Compensatory Leave'];
  const radioItem=function(type,label,checked){
    return '<label class="al-dur-radio'+(checked?' selected':'')+'" data-type="'+type+'" onclick="setAlDurationType(\''+type+'\')" style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;padding:0;font-size:13px;color:var(--navy);font-weight:500">'
      +'<span class="al-radio-circle" style="width:16px;height:16px;border-radius:50%;border:2px solid '+(checked?'var(--orange)':'#d1d5db')+';display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;transition:.15s;background:'+(checked?'var(--orange)':'#fff')+';">'
      +(checked?'<span style="width:6px;height:6px;border-radius:50%;background:#fff;display:block"></span>':'')
      +'</span>'+label+'</label>';
  };
  return '<div class="ep-page" id="al-add-form">'
    +'<div><button class="ep-back" onclick="page=\'all-leaves\';renderADTPage()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back to All Leaves</button></div>'
    +'<div class="ep-header">'
    +'<div class="ep-title-wrap"><span class="ep-title">Create New Leave</span><span style="font-size:12px;color:var(--gray);margin-left:4px">Add leave details</span></div>'
    +'</div>'
    +'<div class="ep-form-card" style="padding:0;overflow:visible">'

    // Row 1: Employee + Leave Type
    +'<div class="policy-form-section">'
    +'<div class="policy-form-grid">'
    +'<div class="ep-form-group"><label class="ep-form-label">Select Employee <span class="req">*</span></label>'
    +'<div class="ep-emp-search"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
    +'<input id="al-emp-search" type="text" placeholder="Search by name or ID"></div></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Leave Type <span class="req">*</span></label>'
    +apCS('al-type',leaveTypes,'','Select')+'</div>'
    +'</div></div>'

    // Row 2: Duration type radio
    +'<div class="policy-form-section" style="border-top:1px dashed #e5e7eb">'
    +'<div style="display:flex;align-items:center;gap:32px;flex-wrap:wrap">'
    +radioItem('half','Half day',false)
    +radioItem('one','One day',false)
    +radioItem('multiple','Multiple Day',true)
    +'</div>'
    +'<div id="al-half-note" style="display:none;margin-top:10px">'
    +'<label class="ep-form-label" style="margin-bottom:6px">Session</label>'
    +apCS('al-session',['First Half','Second Half'],'','Select Session')
    +'</div>'
    +'</div>'

    // Row 3: From / To dates
    +'<div class="policy-form-section" id="al-add-date-row" style="border-top:1px dashed #e5e7eb">'
    +'<div class="policy-form-grid">'
    +'<div class="ep-form-group" id="al-add-from-group"><label class="ep-form-label">From Date <span class="req">*</span></label>'
    +'<input id="al-from-date" class="ep-form-input" type="date"></div>'
    +'<div class="ep-form-group" id="al-add-to-group"><label class="ep-form-label">To Date <span class="req">*</span></label>'
    +'<input id="al-to-date" class="ep-form-input" type="date"></div>'
    +'</div></div>'

    // Row 4: Email section
    +'<div class="policy-form-section" style="border-top:1px dashed #e5e7eb">'
    +'<div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:12px">Send email to employee</div>'
    +'<div class="ep-form-group" style="margin-bottom:10px">'
    +'<label class="ep-form-label">Employee email ID <span class="req">*</span></label>'
    +'<div style="display:flex;align-items:center;gap:10px">'
    +'<div class="ep-emp-search" style="flex:1;margin-bottom:0"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
    +'<input id="al-email-input" type="email" placeholder="Type email to search"></div>'
    +'<button onclick="toggleAlCc()" style="color:var(--orange);background:none;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0">+ Add cc</button>'
    +'</div></div>'
    +'<div id="al-cc-wrap" style="display:none">'
    +'<div class="ep-form-group"><label class="ep-form-label">CC</label>'
    +'<div class="ep-emp-search"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
    +'<input id="al-cc-input" type="email" placeholder="Add CC email"></div></div>'
    +'</div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Description <span class="req">*</span></label>'
    +'<textarea id="al-desc" class="ep-form-input" rows="4" placeholder="Leave reason" style="resize:vertical;min-height:90px;height:auto;line-height:1.5"></textarea>'
    +'</div>'
    +'</div>'

    // Footer actions
    +'<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-top:1px solid var(--border);background:#fafbfc;border-radius:0 0 12px 12px">'
    +'<button class="ep-cancel-btn" style="border-radius:99px" onclick="submitAddLeave(true)">Draft</button>'
    +'<button class="ep-save-btn" style="border-radius:99px;padding:8px 28px" onclick="submitAddLeave(false)">Create</button>'
    +'</div>'

    +'</div></div>';
}
function buildAllLeavesHTML(){
  const hamburger='<svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg>';
  const stClass={Approved:'approved',Pending:'pending',Unapproved:'inactive',Rejected:'inactive'};
  const filtered=alStatusFilter?allLeavesData.filter(l=>l.status===alStatusFilter):allLeavesData;
  if(alSelectedId&&!filtered.some(l=>l.id===alSelectedId))alSelectedId=null;
  const rows=filtered.length?filtered.map((l,i)=>'<tr class="al-row'+(alSelectedId===l.id?' lp-row-selected':'')+'" id="al-row-'+l.id+'" style="cursor:pointer" onclick="openAlSidebar('+l.id+')">'
    +'<td style="color:#6b7280;font-size:13px">'+(i+1)+'</td>'
    +'<td style="font-weight:600;color:var(--navy)">'+l.leaveId+'</td>'
    +'<td style="font-weight:600;color:var(--navy)">'+l.name+'</td>'
    +'<td>'+l.leaveHours+'</td>'
    +'<td>'+l.leaveFrom+'</td>'
    +'<td>'+l.leaveTo+'</td>'
    +'<td><span class="lp-status-badge '+(stClass[l.status]||'pending')+'">'+l.status+'</span></td>'    +'<td><button class="lp-action-btn" onclick="event.stopPropagation();openAlSidebar('+l.id+')" title="More actions">'+hamburger+'</button></td>'
    +'</tr>').join(''):'<tr><td colspan="8" style="padding:24px;text-align:center;color:var(--gray)">No leave requests match this filter.</td></tr>';
  const approvedCount=allLeavesData.filter(l=>l.status==='Approved').length;
  const unapprovedCount=allLeavesData.filter(l=>l.status==='Unapproved').length;
  const pendingCount=allLeavesData.filter(l=>l.status==='Pending').length;
  const sbInner=alSelectedId?renderAlSidebar():'';
  return '<div class="lp-page">'
    +'<div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:4px">'
    +'<div class="lp-filter-bar" style="flex:1;min-width:0;padding:0"><div class="lp-filter-bar-label">Select Filter</div>'
    +'<div class="lp-filter-bar-row">'
    +apCS('al-f-type',['Casual Leave','Sick Leave','Earned Leave','Maternity Leave','Paternity Leave'],'','Leave Type')
    +apCS('al-f-status',['Approved','Pending','Unapproved'],alStatusFilter,'Status')
    +'<button class="lp-pill-reset" onclick="resetAlFilters()">Reset</button><button class="lp-pill-search" onclick="applyAlFilters()">Search</button>'
    +'</div></div>'
    +'<div class="listing-stats" style="flex-shrink:0">'
    +'<div class="listing-stat approved'+(alStatusFilter==='Approved'?' stat-selected':'')+'" onclick="alToggleStatFilter(\'Approved\')"><div class="listing-stat-count">'+approvedCount+'</div><div class="listing-stat-label">Approved</div></div>'
    +'<div class="listing-stat inactive'+(alStatusFilter==='Unapproved'?' stat-selected':'')+'" onclick="alToggleStatFilter(\'Unapproved\')"><div class="listing-stat-count">'+unapprovedCount+'</div><div class="listing-stat-label">Unapproved</div></div>'
    +'<div class="listing-stat pending'+(alStatusFilter==='Pending'?' stat-selected':'')+'" onclick="alToggleStatFilter(\'Pending\')"><div class="listing-stat-count">'+pendingCount+'</div><div class="listing-stat-label">Pending</div></div>'
    +'</div></div>'
    +'<div class="lp-split-wrap" style="margin-top:14px"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table"><thead><tr>'
    +'<th>S.No</th><th>Key ID</th><th>Full Name</th><th>Leave Hours</th><th>From Date</th><th>To Date</th><th>Status</th><th>Action</th>'
    +'</tr></thead><tbody>'+rows+'</tbody></table>'
    +'<div class="lp-pagination">'
    +'<span class="lp-pagination-info">Showing 1&ndash;'+filtered.length+' of '+allLeavesData.length+' entries</span>'
    +'<div class="lp-pagination-controls">'
    +'<button class="lp-pg-btn lp-pg-arrow" disabled><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<button class="lp-pg-btn active">1</button>'
    +'<button class="lp-pg-btn lp-pg-arrow" disabled><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'</div></div>'
    +'</div></div>'
    +'<div class="lp-split-sb'+(alSelectedId?' open':'')+'" id="al-split-sb"><div class="lp-isb" id="al-isb-inner">'+sbInner+'</div></div>'
    +'</div></div>';
}
function togglePmAction(id,e){
  if(e)e.stopPropagation();
  document.querySelectorAll('.ct-action-menu').forEach(m=>{if(m.id!=='pm-ctm-'+id)m.classList.remove('open');});
  const m=document.getElementById('pm-ctm-'+id);if(!m)return;
  const willOpen=!m.classList.contains('open');
  m.classList.toggle('open');
  if(willOpen&&e){
    const wrap=e.target.closest('.ct-action-wrap');
    const anchor=wrap?wrap.getBoundingClientRect():null;
    if(anchor){
      const menuH=m.offsetHeight;
      const spaceBelow=window.innerHeight-anchor.bottom-8;
      m.style.right=(window.innerWidth-anchor.right)+'px';m.style.left='auto';
      if(spaceBelow>=menuH){m.style.top=(anchor.bottom+5)+'px';m.style.bottom='auto';}
      else{m.style.bottom=(window.innerHeight-anchor.top+5)+'px';m.style.top='auto';}
    }
  }
}
function alToggleStatFilter(v){
  alStatusFilter=alStatusFilter===v?'':v;
  alSelectedId=null;
  renderADTPage();
}
function applyAlFilters(){
  const status=getCSValue('al-f-status');
  alStatusFilter=status&&status!=='Status'?status:'';
  alSelectedId=null;
  renderADTPage();
}
function resetAlFilters(){
  alStatusFilter='';
  alSelectedId=null;
  renderADTPage();
}
function openPmSidebar(id){
  pmSelectedId=id;pmTab='basic-details';
  const sb=document.getElementById('pm-split-sb');if(sb)sb.classList.add('open');
  const inner=document.getElementById('pm-isb-inner');if(inner)inner.innerHTML=renderPmSidebar();
  document.querySelectorAll('.pm-row').forEach(r=>r.classList.toggle('lp-row-selected',r.id==='pm-row-'+id));
}
function closePmSidebar(){
  pmSelectedId=null;
  const sb=document.getElementById('pm-split-sb');if(sb)sb.classList.remove('open');
  document.querySelectorAll('.pm-row').forEach(r=>r.classList.remove('lp-row-selected'));
}
function navPmTab(tab){pmTab=tab;const inner=document.getElementById('pm-isb-inner');if(inner){inner.innerHTML=renderPmSidebar();requestAnimationFrame(function(){const nt=document.getElementById('pm-isb-tabs');if(nt){const a=nt.querySelector('.lp-isb-tab.active');if(a)a.scrollIntoView({inline:'start',block:'nearest'});}});}}
function renderPmSidebar(){
  const p=paymentsData.find(x=>x.id===pmSelectedId);if(!p)return '';
  const tabs=[{id:'basic-details',label:'Basic Details'},{id:'employee',label:'Employee'},{id:'attachments',label:'Attachments'},{id:'invoice',label:'Invoice'},{id:'workflow',label:'Workflow'}];
  const tabBar='<div class="lp-isb-tabbar">'
    +'<button class="lp-isb-nav-btn" onclick="scrollTabRow(\'left\',\'pm-isb-tabs\')" title="Scroll left"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<div class="lp-isb-tabs" id="pm-isb-tabs">'+tabs.map(t=>'<button class="lp-isb-tab'+(pmTab===t.id?' active':'')+'" onclick="navPmTab(\''+t.id+'\')">'+t.label+'</button>').join('')+'</div>'
    +'<button class="lp-isb-nav-btn nav-right" onclick="scrollTabRow(\'right\',\'pm-isb-tabs\')" title="Scroll right"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'<div class="lp-isb-right"><button class="lp-isb-close" onclick="closePmSidebar()" title="Close"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'</div>';
  const iId='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/></svg>';
  const iUser='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const iCal='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const iGlobe='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
  const iTag='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>';
  const iDoc='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
  const iMail='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  const iPhone='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.2.73.43 1.44.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.9-.87a2 2 0 0 1 2.11-.45c1.37.27 2.08.5 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>';
  const iCheck='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  const fc=(ico,label,val)=>'<div class="lp-sb-field-card"><div class="lp-sb-field-icon">'+ico+'</div><div class="lp-sb-field-content"><div class="lp-sb-field-label">'+label+'</div><div class="lp-sb-field-value">'+val+'</div></div></div>';
  const editBtn='<button class="ep-save-btn" style="padding:5px 14px;font-size:12px;display:flex;align-items:center;gap:5px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit</button>';
  let body='';
  if(pmTab==='basic-details'){
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Order #'+p.orderId+'</span>'+editBtn+'</div>'
      +'<div class="lp-sb-detail-grid">'
      +fc(iId,'Key',p.key)+fc(iId,'Deal ID',p.dealId)
      +fc(iDoc,'Entity Name',p.entityName)+fc(iTag,'Added From',p.addedFrom)
      +fc(iCal,'Created Time','<span style="color:var(--orange)">'+p.createdTime+'</span>')+fc(iId,'Course ID',p.courseId)
      +fc(iDoc,'Course Name',p.courseName)+fc(iCal,'Last Updated',p.lastUpdated)
      +fc(iCal,'Start From','<span style="color:var(--orange)">'+p.startFrom+'</span>')+fc(iCal,'End To','<span style="color:var(--orange)">'+p.endTo+'</span>')
      +fc(iGlobe,'Working Country','<strong>'+p.workingCountry+'</strong>')+fc(iTag,'Order Category','<span style="color:var(--orange)">'+p.orderCategory+'</span>')
      +'</div>';
  }else if(pmTab==='employee'){
    const emp=p.emp;
    body='<div class="lp-sb-detail-grid">'
      +fc(iId,'Employee ID',emp.empId)+fc(iUser,'Name',emp.name)
      +fc(iMail,'Email','<span style="color:var(--orange)">'+emp.email+'</span>')+fc(iPhone,'Mobile',emp.mobile)
      +fc(iCheck,'Status',emp.status)+fc(iCal,'Created On','<span style="color:var(--orange)">'+emp.createdOn+'</span>')
      +'</div>';
  }else if(pmTab==='attachments'){
    const thS='padding:9px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--navy);background:#f8fafc;border-bottom:1px solid var(--border)';
    const dlIco='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    body='<div style="display:flex;justify-content:flex-end;padding:4px 0 12px">'
      +'<button style="border:none;background:none;color:var(--orange);font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;font-family:inherit">'+dlIco+' Download All</button>'
      +'</div>'
      +'<table style="width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:10px;overflow:hidden">'
      +'<thead><tr>'
      +'<th style="'+thS+'">SR. NO</th><th style="'+thS+'">FILE NAME</th><th style="'+thS+'">UPLOADED BY</th><th style="'+thS+'">TYPE</th><th style="'+thS+'">SOURCE</th><th style="'+thS+'">ACTION</th>'
      +'</tr></thead>'
      +'<tbody><tr><td colspan="6" style="text-align:center;padding:24px;font-size:13px;color:#9ca3af">No attachments.</td></tr></tbody>'
      +'</table>';
  }else if(pmTab==='invoice'){
    const yrOpts=[2026,2025,2024].map(y=>'<option'+(y===2026?' selected':'')+'>'+y+'</option>').join('');
    body='<div style="display:flex;align-items:center;gap:10px;margin-bottom:18px">'
      +'<span style="font-size:13px;font-weight:600;color:var(--navy)">Select Year :</span>'
      +'<select style="border:1px solid var(--border);border-radius:8px;padding:5px 10px;font-family:inherit;font-size:13px;color:var(--navy);cursor:pointer;outline:none">'+yrOpts+'</select>'
      +'</div>'
      +'<p style="font-size:13px;color:#9ca3af">No receivables found.</p>';
  }else if(pmTab==='workflow'){
    const wf=pmWorkflowData[p.id]||[];
    const wfPersonSvg='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const wfCalSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    body=wf.length
      ?'<div class="lp-wf-wrap">'+wf.map((w,i)=>'<div class="lp-wf-row">'
          +'<div class="lp-wf-dot-col"><div class="lp-wf-dot"></div>'+(i<wf.length-1?'<div class="lp-wf-connector"></div>':'')+'</div>'
          +'<div class="lp-wf-card"><div class="lp-wf-title">'+w.title+'</div>'
          +'<div class="lp-wf-meta-row"><span class="lp-wf-meta-item">'+wfPersonSvg+'<span>'+w.user+'</span></span>'+(w.date?'<span class="lp-wf-meta-item">'+wfCalSvg+'<span>'+w.date+'</span></span>':'')+(w.time?'<span class="lp-wf-meta-sep">|</span><span>'+w.time+'</span>':'')+'</div>'
          +'<div class="lp-wf-desc"><span class="lp-wf-desc-label">Description:</span><span class="lp-wf-desc-text">'+w.description+'</span></div>'
          +'</div></div>').join('')+'</div>'
      :'<div class="lp-wf-empty">No workflow configured.</div>';
  }
  return tabBar+'<div class="lp-isb-body">'+body+'</div>';
}
function buildPaymentsHTML(){
  const dotsIco='<svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg>';
  const chevDn='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';
  const activeCount=paymentsData.filter(p=>p.invoiceStatus==='Paid').length;
  const pendingCount=paymentsData.filter(p=>p.invoiceStatus==='Unpaid'||p.invoiceStatus==='Pending').length;
  const closedCount=paymentsData.filter(p=>p.invoiceStatus==='Closed').length;
  const filtered=pmInvoiceStatusFilter?(pmInvoiceStatusFilter==='__pending_group__'?paymentsData.filter(p=>p.invoiceStatus==='Unpaid'||p.invoiceStatus==='Pending'):paymentsData.filter(p=>p.invoiceStatus===pmInvoiceStatusFilter)):paymentsData;
  if(pmSelectedId&&!filtered.some(p=>p.id===pmSelectedId))pmSelectedId=null;
  const rows=filtered.length?filtered.map((p,i)=>{
    const menuItems=pmInvoiceFlow.map(s=>{
      const isCurrent=p.invoiceStatus===s;
      return '<div class="ct-act-item'+(isCurrent?' current':'')+'" '+(isCurrent?'':'onclick="closePmMenus()"')+'>'
        +'<span class="ct-act-step '+(isCurrent?'current':'next')+'">'+(isCurrent?'<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>':(pmInvoiceFlow.indexOf(s)+1))+'</span>'+s+'</div>';
    }).join('');
    const statusBtn='<div class="ct-action-wrap">'
      +'<button class="ct-action-btn" onclick="togglePmAction('+p.id+',event)"><span>'+p.invoiceStatus+'</span>'+chevDn+'</button>'
      +'<div class="ct-action-menu" id="pm-ctm-'+p.id+'">'+menuItems+'</div>'
      +'</div>';
    return '<tr class="pm-row'+(pmSelectedId===p.id?' lp-row-selected':'')+'" id="pm-row-'+p.id+'" style="cursor:pointer" onclick="openPmSidebar('+p.id+')">'
      +'<td style="color:#6b7280;font-size:13px">'+(i+1)+'</td>'
      +'<td style="font-weight:600;color:var(--navy)">'+p.orderId+'</td>'
      +'<td style="font-weight:600;color:var(--navy)">'+p.name+'</td>'
      +'<td style="color:var(--orange);font-weight:600">'+p.amountDue+'</td>'
      +'<td>'+p.type+'</td>'
      +'<td><span class="lp-status-badge '+(p.orderStatus==='Onboarding'?'pending':'active')+'">'+p.orderStatus+'</span></td>'
      +'<td onclick="event.stopPropagation()">'+statusBtn+'</td>'
      +'<td><button class="lp-action-btn" onclick="event.stopPropagation();openPmSidebar('+p.id+')" title="More actions">'+dotsIco+'</button></td>'
      +'</tr>';
  }).join(''):'<tr><td colspan="8" style="padding:24px;text-align:center;color:var(--gray)">No payments match this filter.</td></tr>';
  const sbInner=pmSelectedId?renderPmSidebar():'';
  return '<div class="lp-page">'
    +'<div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:4px">'
    +'<div class="lp-filter-bar" style="flex:1;min-width:0;padding:0"><div class="lp-filter-bar-label">Select Filter</div>'
    +'<div class="lp-filter-bar-row">'
    +'<input class="ct-search-input" placeholder="Search ID" type="text" style="height:34px;border-radius:20px;min-width:120px;max-width:140px">'
    +apCS('pm-f-country',['Netherlands','Belgium','USA','India','Germany'],'','Country')
    +apCS('pm-f-status',['Unpaid','Pending','Paid','Closed'],pmInvoiceStatusFilter==='__pending_group__'?'':pmInvoiceStatusFilter,'Status')
    +'<input type="date" style="height:34px;border:1px solid var(--border);border-radius:20px;padding:0 12px;font-family:inherit;font-size:13px;color:var(--navy);outline:none;background:#fff;cursor:pointer">'
    +'<button class="lp-pill-reset" onclick="resetPmFilters()">Reset</button><button class="lp-pill-search" onclick="applyPmFilters()">Search</button>'
    +'</div></div>'
    +'<div class="listing-stats" style="flex-shrink:0">'
    +'<div class="listing-stat active'+(pmInvoiceStatusFilter==='Paid'?' stat-selected':'')+'" onclick="pmToggleStatFilter(\'Paid\')"><div class="listing-stat-count">'+activeCount+'</div><div class="listing-stat-label">Active</div></div>'
    +'<div class="listing-stat pending'+(pmInvoiceStatusFilter==='__pending_group__'?' stat-selected':'')+'" onclick="pmToggleStatFilter(\'__pending_group__\')"><div class="listing-stat-count">'+pendingCount+'</div><div class="listing-stat-label">Pending</div></div>'
    +'<div class="listing-stat'+(pmInvoiceStatusFilter==='Closed'?' stat-selected':'')+'" style="border-color:#bfdbfe" onclick="pmToggleStatFilter(\'Closed\')"><div class="listing-stat-count" style="color:#2563eb">'+closedCount+'</div><div class="listing-stat-label">Closed</div></div>'
    +'</div></div>'
    +'<div class="lp-split-wrap" style="margin-top:14px"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table"><thead><tr>'
    +'<th>S. No</th><th>Order ID</th><th>Name</th><th>Amount Due</th><th>Type</th><th>Order Status</th><th>Invoice Status</th><th>Action</th>'
    +'</tr></thead><tbody>'+rows+'</tbody></table>'
    +'<div class="lp-pagination">'
    +'<span class="lp-pagination-info">Showing 1&ndash;'+filtered.length+' of '+paymentsData.length+' entries</span>'
    +'<div class="lp-pagination-controls">'
    +'<button class="lp-pg-btn lp-pg-arrow" disabled><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<button class="lp-pg-btn active">1</button>'
    +'<button class="lp-pg-btn lp-pg-arrow" disabled><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'</div></div>'
    +'</div></div>'
    +'<div class="lp-split-sb'+(pmSelectedId?' open':'')+'" id="pm-split-sb"><div class="lp-isb" id="pm-isb-inner">'+sbInner+'</div></div>'
    +'</div></div>';
}
function closePmMenus(){document.querySelectorAll('.ct-action-menu').forEach(m=>m.classList.remove('open'));}
function ctSlug(s){return(s||'').toLowerCase().replace(/\s+/g,'-');}
function ctStatusBadge(s){return'<span class="ct-sb-badge '+ctSlug(s)+'">'+s+'</span>';}
function ctNextStep(status){const i=ctFlow.indexOf(status);return i>=0&&i<ctFlow.length-1?ctFlow[i+1]:null;}
function toggleCtAction(id,e){
  if(e)e.stopPropagation();
  document.querySelectorAll('.ct-action-menu').forEach(m=>{if(m.id!=='ctm-'+id)m.classList.remove('open');});
  const m=document.getElementById('ctm-'+id);if(!m)return;
  const willOpen=!m.classList.contains('open');
  m.classList.toggle('open');
  if(willOpen&&e){
    const wrap=e.target.closest('.ct-action-wrap');
    const anchor=wrap?wrap.getBoundingClientRect():null;
    if(anchor){
      const menuH=m.offsetHeight;
      const spaceBelow=window.innerHeight-anchor.bottom-8;
      m.style.right=(window.innerWidth-anchor.right)+'px';
      m.style.left='auto';
      if(spaceBelow>=menuH){
        m.style.top=(anchor.bottom+5)+'px';
        m.style.bottom='auto';
      }else{
        m.style.bottom=(window.innerHeight-anchor.top+5)+'px';
        m.style.top='auto';
      }
    }
  }
}
// ── TICKETS SIDEBAR ──
function openTkSidebar(id,tab){tkSelectedId=id;tkTab=tab||'basic-details';const sb=document.getElementById('tk-split-sb');if(sb)sb.classList.add('open');const inner=document.getElementById('tk-isb-inner');if(inner)inner.innerHTML=renderTkSidebar();document.querySelectorAll('.tk-row').forEach(r=>r.classList.toggle('lp-row-selected',r.id==='tk-row-'+id));}
function closeTkSidebar(){tkSelectedId=null;const sb=document.getElementById('tk-split-sb');if(sb)sb.classList.remove('open');document.querySelectorAll('.tk-row').forEach(r=>r.classList.remove('lp-row-selected'));}
function navTkTab(tab){tkTab=tab;const inner=document.getElementById('tk-isb-inner');if(inner){inner.innerHTML=renderTkSidebar();requestAnimationFrame(function(){const nt=document.getElementById('tk-isb-tabs');if(nt){const a=nt.querySelector('.lp-isb-tab.active');if(a)a.scrollIntoView({inline:'start',block:'nearest'});}});}}
function tkStatusBadge(s){const m={open:{bg:'#eff6ff',c:'#2563eb',b:'#bfdbfe',l:'Open'},in_progress:{bg:'#fef3c7',c:'#d97706',b:'#fde68a',l:'In Progress'},blocked:{bg:'#fef2f2',c:'#dc2626',b:'#fecaca',l:'Blocked'},closed:{bg:'#f1f5f9',c:'#64748b',b:'#e2e8f0',l:'Closed'}};const v=m[s]||{bg:'#f1f5f9',c:'#64748b',b:'#e2e8f0',l:s};return'<span style="background:'+v.bg+';color:'+v.c+';border:1.5px solid '+v.b+';border-radius:6px;padding:3px 10px;font-size:11px;font-weight:600;display:inline-block;white-space:nowrap">'+v.l+'</span>';}
// ── CHATS SIDEBAR ──
function openChatSidebar(id,tab){chatSelectedId=id;chatTab=tab||'basic-details';const sb=document.getElementById('chat-split-sb');if(sb)sb.classList.add('open');const inner=document.getElementById('chat-isb-inner');if(inner)inner.innerHTML=renderChatSidebar();document.querySelectorAll('.chat-row').forEach(r=>r.classList.toggle('lp-row-selected',r.id==='chat-row-'+id));}
function closeChatSidebar(){chatSelectedId=null;const sb=document.getElementById('chat-split-sb');if(sb)sb.classList.remove('open');document.querySelectorAll('.chat-row').forEach(r=>r.classList.remove('lp-row-selected'));}
function navChatTab(tab){chatTab=tab;const inner=document.getElementById('chat-isb-inner');if(inner){inner.innerHTML=renderChatSidebar();requestAnimationFrame(function(){const nt=document.getElementById('chat-isb-tabs');if(nt){const a=nt.querySelector('.lp-isb-tab.active');if(a)a.scrollIntoView({inline:'start',block:'nearest'});}});}}
function setChatFilter(f){chatStatusFilter=f;chatSelectedId=null;renderADTPage();}
function chatStatusBadge(s){const m={active:{bg:'#f0fdf4',c:'#16a34a',b:'#86efac',l:'Active'},waiting_client:{bg:'#f1f5f9',c:'#1a1a1a',b:'#d1d5db',l:'Waiting for Client'},waiting_csm:{bg:'#fef3c7',c:'#d97706',b:'#fde68a',l:'Waiting for CSM'},inactive:{bg:'#f1f5f9',c:'#64748b',b:'#e2e8f0',l:'Inactive'}};const v=m[s]||{bg:'#f1f5f9',c:'#64748b',b:'#e2e8f0',l:s};return'<span style="background:'+v.bg+';color:'+v.c+';border:1.5px solid '+v.b+';border-radius:6px;padding:3px 10px;font-size:11px;font-weight:600;display:inline-block;white-space:nowrap">'+v.l+'</span>';}
function ctPickStatus(contractId,status){document.querySelectorAll('.ct-action-menu').forEach(m=>m.classList.remove('open'));openCtSidebar(contractId,'logs',status);}
function ctToggleStatFilter(v){
  ctQuickStatusFilter=ctQuickStatusFilter===v?'':v;
  ctSelectedId=null;
  renderADTPage();
}
// -- journeyRunId: only passed by launchers that route in from a journey/task surface (dashboard queue, My Tasks, manual run page). Plain row-opens omit it, so the "action needed" tab badge/banner stays off until the user follows an actual pending-work link. --
function openCtSidebar(id,tab,pendingStatus,journeyRunId){
  ctSelectedId=id;ctTab=tab||'basic-details';ctCommercialEditMode=false;ctSecondOpinionRejectMode=false;
  ctJourneyContextRunId=journeyRunId||null;
  if(pendingStatus)window._ctPendingStatus=pendingStatus;else delete window._ctPendingStatus;
  const sb=document.getElementById('ct-split-sb');if(sb)sb.classList.add('open');
  const inner=document.getElementById('ct-isb-inner');if(inner)inner.innerHTML=renderCtSidebar();
  document.querySelectorAll('.ct-row').forEach(r=>r.classList.toggle('lp-row-selected',r.id==='ct-row-'+id));
}
function closeCtSidebar(){
  ctSelectedId=null;ctCommercialEditMode=false;ctSecondOpinionRejectMode=false;ctJourneyContextRunId=null;delete window._ctPendingStatus;
  const sb=document.getElementById('ct-split-sb');if(sb)sb.classList.remove('open');
  document.querySelectorAll('.ct-row').forEach(r=>r.classList.remove('lp-row-selected'));
}
function refreshCtSidebar(){
  const inner=document.getElementById('ct-isb-inner');
  if(inner)inner.innerHTML=renderCtSidebar();
}
function navCtTab(tab){ctTab=tab;ctCommercialEditMode=false;ctSecondOpinionRejectMode=false;const inner=document.getElementById('ct-isb-inner');if(inner){inner.innerHTML=renderCtSidebar();requestAnimationFrame(function(){const nt=document.getElementById('ct-isb-tabs');if(nt){const a=nt.querySelector('.lp-isb-tab.active');if(a)a.scrollIntoView({inline:'start',block:'nearest'});}});}}
function saveCtCommercialEdit(){
  const c=contractsData.find(x=>x.id===ctSelectedId);if(!c)return;
  ['adtFee','annualGross','baseGross','holidayBonus','month13','monthlyGrossNet','monthlyInvoice','monthlySalary12','monthlySalary1392','netPay','socialPremAmt','socialPremPct','totalMonthlyGross'].forEach(function(key){
    const el=document.getElementById('ctcm-'+key);
    if(el)c.commercial[key]=el.value;
  });
  ctCommercialEditMode=false;
  refreshCtSidebar();
}
function pmToggleStatFilter(v){
  pmInvoiceStatusFilter=pmInvoiceStatusFilter===v?'':v;
  pmSelectedId=null;
  renderADTPage();
}
function applyPmFilters(){
  const status=getCSValue('pm-f-status');
  pmInvoiceStatusFilter=status&&status!=='Status'?status:'';
  pmSelectedId=null;
  renderADTPage();
}
function resetPmFilters(){
  pmInvoiceStatusFilter='';
  pmSelectedId=null;
  renderADTPage();
}
function openCtModal(id){
  const c=contractsData.find(x=>x.id===id);if(!c)return;
  const g=(l,v)=>'<div class="ct-modal-field"><div class="ct-modal-flabel">'+l+'</div><div class="ct-modal-fval">'+(v||'--')+'</div></div>';
  document.getElementById('ct-modal-overlay').innerHTML=
    '<div class="ct-modal" onclick="event.stopPropagation()">'
    +'<div class="ct-modal-hdr"><span class="ct-modal-title">Contract — '+c.empName+'</span><button class="ct-modal-close" onclick="closeCtModal()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'<div class="ct-modal-grid">'
    +g('Contract ID',c.contractId)+g('Employee',c.empName)
    +g('Country of Operation',c.countryOfOp)+g('Employment Type',c.empType)
    +g('Job Title',c.jobTitle)+g('Employment Duration',c.empDuration)
    +g('Pay Amount',c.currency+' '+c.payAmount)+g('Pay Frequency',c.payFrequency)
    +g('Status',c.status)+g('Date',c.date)
    +'</div>'
    +'<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:14px 16px;margin-bottom:18px;display:flex;align-items:center;gap:10px">'
    +'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
    +'<span style="font-size:13px;font-weight:600;color:#15803d">Contract has been approved and is finalized.</span></div>'
    +'<div style="display:flex;justify-content:flex-end;gap:10px">'
    +'<button class="ep-cancel-btn" onclick="closeCtModal()">Close</button>'
    +'<button class="ep-save-btn">Download Contract</button>'
    +'</div>'
    +'</div>';
  document.getElementById('ct-modal-overlay').style.display='flex';
}
function closeCtModal(){document.getElementById('ct-modal-overlay').style.display='none';}
function ctSecondOpinionReviewPanelHTML(c,req){
  if(ctSecondOpinionRejectMode){
    return '<div class="lp-logs-form">'
      +'<div class="lp-logs-form-header" style="color:#ef4444"><span style="width:9px;height:9px;border-radius:50%;background:#ef4444;display:inline-block;flex-shrink:0"></span>Reject Proposal</div>'
      +'<p class="lp-logs-form-sub">Let '+req.requestedBy+' know why this proposal is being rejected.</p>'
      +'<div class="lp-logs-form-label">Note <span class="lp-logs-form-req">*</span></div>'
      +'<textarea class="lp-logs-form-textarea" id="ct-reject-note-'+c.id+'" placeholder="Add a note explaining the rejection..."></textarea>'
      +'<div style="display:flex;gap:8px">'
      +'<button class="ep-cancel-btn" style="flex:1" onclick="ctRejectSecondOpinionCancel()">Cancel</button>'
      +'<button class="sa-req-btn sa-req-reject" style="flex:1;padding:9px;font-size:13px" onclick="ctRejectSecondOpinionSubmit('+c.id+')">Submit Rejection</button>'
      +'</div></div>';
  }
  return '<div class="lp-logs-form">'
    +'<div class="lp-logs-form-header"><span style="width:9px;height:9px;border-radius:50%;background:#f59e0b;display:inline-block;flex-shrink:0"></span>Second Opinion Requested</div>'
    +'<p class="lp-logs-form-sub">'+req.requestedBy+' flagged this proposal for your review: &ldquo;'+req.note+'&rdquo;</p>'
    +'<div style="display:flex;gap:8px">'
    +'<button class="sa-req-btn sa-req-approve" style="flex:1;padding:9px;font-size:13px" onclick="ctApproveSecondOpinion('+c.id+')">Approve</button>'
    +'<button class="sa-req-btn sa-req-reject" style="flex:1;padding:9px;font-size:13px" onclick="ctRejectSecondOpinionOpen('+c.id+')">Reject</button>'
    +'</div></div>';
}
function ctSecondOpinionResolvedPanelHTML(req){
  const approved=req.status==='Approved';
  return '<div class="lp-logs-form">'
    +'<div class="lp-logs-form-header" style="color:'+(approved?'#16a34a':'#ef4444')+'"><span style="width:9px;height:9px;border-radius:50%;background:'+(approved?'#16a34a':'#ef4444')+';display:inline-block;flex-shrink:0"></span>'+(approved?'Proposal Approved':'Proposal Rejected')+'</div>'
    +'<p class="lp-logs-form-sub">'+(approved?'You approved this proposal after reviewing the margin.':'You rejected this proposal.'+(req.resolutionNote?' Note sent: &ldquo;'+req.resolutionNote+'&rdquo;':''))+'</p>'
    +'</div>';
}
function renderCtSidebar(){
  const c=contractsData.find(x=>x.id===ctSelectedId);if(!c)return '';
  const tabs=[{id:'basic-details',label:'Basic Details'},{id:'commercial-terms',label:'Commercial Terms'},{id:'compliance',label:'Compliance'},{id:'logs',label:'Logs'},{id:'workflow',label:'Workflow'}];
  // -- Badge the tab a linked journey run is currently waiting on — but only when this sidebar was opened by following that run's journey link (dashboard queue, My Tasks, notification). A plain/direct open of the record shows the data with no "action needed" framing; the role dashboard is the source of truth for what's pending. --
  const pendingRun=manualLinkedRunForContract(c.id);
  const journeyActive=pendingRun&&ctJourneyContextRunId===pendingRun.runId;
  const pendingTabId=journeyActive?ctTabForManualStep(manualJourneySteps(pendingRun.journeyId)[pendingRun.currentStepIdx]):null;
  const tabBar='<div class="lp-isb-tabbar">'
    +'<button class="lp-isb-nav-btn" onclick="scrollTabRow(\'left\',\'ct-isb-tabs\')" title="Scroll left"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<div class="lp-isb-tabs" id="ct-isb-tabs">'+tabs.map(t=>'<button class="lp-isb-tab'+(ctTab===t.id?' active':'')+(pendingTabId===t.id?' lp-isb-tab--pending':'')+'" onclick="navCtTab(\''+t.id+'\')">'+t.label+(pendingTabId===t.id?'<span class="lp-isb-tab-badge" title="Action needed"></span>':'')+'</button>').join('')+'</div>'
    +'<button class="lp-isb-nav-btn nav-right" onclick="scrollTabRow(\'right\',\'ct-isb-tabs\')" title="Scroll right"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'<div class="lp-isb-right"><button class="lp-isb-close" onclick="closeCtSidebar()" title="Close"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'</div>';
  const dv='<span style="color:#9ca3af">--</span>';
  const v=(x)=>x&&x!=='--'?x:dv;
  const iGlobe='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
  const iCheck='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  const iUser='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const iMail='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  const iPhone='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.2.73.43 1.44.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.9-.87a2 2 0 0 1 2.11-.45c1.37.27 2.08.5 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>';
  const iCal='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const iBag='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>';
  const iTag='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>';
  const iDoc='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
  const iDollar='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
  const iClock='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  const fc=(ico,label,val)=>'<div class="lp-sb-field-card"><div class="lp-sb-field-icon">'+ico+'</div><div class="lp-sb-field-content"><div class="lp-sb-field-label">'+label+'</div><div class="lp-sb-field-value">'+val+'</div></div></div>';
  let body='';
  if(ctTab==='basic-details'){
    const editBtn='<button class="ep-save-btn" style="padding:5px 14px;font-size:12px;display:flex;align-items:center;gap:5px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit</button>';
    const wpVal=c.workPermit?'Yes':'No';
    body=manualStepBannerHTML(c,'basic-details')
      +'<div class="lp-sb-view-header"><span class="lp-sb-section-title">'+c.empName+'</span>'+editBtn+'</div>'
      +'<div class="lp-sb-detail-grid">'
      +fc(iGlobe,'Nationality',v(c.nationality))+fc(iGlobe,'Country of Operation',v(c.countryOfOp))
      +fc(iCheck,'Work Permit',wpVal)+fc(iUser,'Name',v(c.empName))
      +fc(iUser,'Gender',v(c.gender))+fc(iMail,'Email ID',v(c.email))
      +fc(iPhone,'Contact Number',v(c.contact))+fc(iCal,'Date of Birth',v(c.dob))
      +fc(iBag,'Job Title',v(c.jobTitle))+fc(iTag,'Skill',v(c.skill))
      +fc(iCal,'Employment Duration',v(c.empDuration))+fc(iTag,'Employment Type',v(c.empType))
      +fc(iClock,'Work Schedule',v(c.workSchedule))+fc(iDollar,'Pay Amount',v(c.payAmount))
      +fc(iDollar,'Currency',v(c.currency))+fc(iDoc,'Job Description',v(c.jobDesc))
      +fc(iClock,'Pay Frequency',v(c.payFrequency))
      +'</div>';
  }else if(ctTab==='commercial-terms'){
    const cm=c.commercial;
    if(ctCommercialEditMode){
      const ef=(key,label)=>'<div class="lp-sb-field"><label>'+label+'</label><input class="ep-form-input" id="ctcm-'+key+'" value="'+(cm[key]||'')+'"></div>';
      body=manualStepBannerHTML(c,'commercial-terms')
        +'<div class="lp-sb-view-header"><span class="lp-sb-section-title">Commercial Terms</span></div>'
        +'<div class="lp-sb-edit-form"><div class="lp-sb-edit-section"><div class="lp-sb-form-grid">'
        +ef('adtFee','Adt Monthly Management Fee')+ef('annualGross','Annual Gross Salary')
        +ef('baseGross','Base Gross Salary')+ef('holidayBonus','Holiday Bonus Accrued')
        +ef('month13','Month 13 Accrued')+ef('monthlyGrossNet','Monthly Gross Salary Net')
        +ef('monthlyInvoice','Monthly Invoice Value')+ef('monthlySalary12','Monthly Salary 12')
        +ef('monthlySalary1392','Monthly Salary 1392')+ef('netPay','Net Pay')
        +ef('socialPremAmt','Social Premiums Amount')+ef('socialPremPct','Social Premiums Pct')
        +ef('totalMonthlyGross','Total Monthly Gross Salary')
        +'</div><div class="lp-sb-form-actions">'
        +'<button class="ep-cancel-btn" onclick="ctCommercialEditMode=false;refreshCtSidebar()">Cancel</button>'
        +'<button class="ep-save-btn" onclick="saveCtCommercialEdit()">Save</button>'
        +'</div></div></div>';
    }else{
      const editBtn='<button class="ep-save-btn" style="padding:5px 14px;font-size:12px;display:flex;align-items:center;gap:5px" onclick="ctCommercialEditMode=true;refreshCtSidebar()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit</button>';
      const cf=(l,val)=>'<div class="lp-sb-field-card"><div class="lp-sb-field-content"><div class="lp-sb-field-label">'+l+'</div><div class="lp-sb-field-value">'+(val||dv)+'</div></div></div>';
      body=manualStepBannerHTML(c,'commercial-terms')
        +'<div class="lp-sb-view-header"><span class="lp-sb-section-title">Commercial Terms</span>'+editBtn+'</div>'
        +'<div class="lp-sb-detail-grid">'
        +cf('Adt Monthly Management Fee',cm.adtFee)+cf('Annual Gross Salary',cm.annualGross)
        +cf('Base Gross Salary',cm.baseGross)+cf('Holiday Bonus Accrued',cm.holidayBonus)
        +cf('Month 13 Accrued',cm.month13)+cf('Monthly Gross Salary Net',cm.monthlyGrossNet)
        +cf('Monthly Invoice Value',cm.monthlyInvoice)+cf('Monthly Salary 12',cm.monthlySalary12)
        +cf('Monthly Salary 1392',cm.monthlySalary1392)+cf('Net Pay',cm.netPay)
        +cf('Social Premiums Amount',cm.socialPremAmt)+cf('Social Premiums Pct',cm.socialPremPct)
        +cf('Total Monthly Gross Salary',cm.totalMonthlyGross)
        +'</div>';
    }
  }else if(ctTab==='compliance'){
    const thS='padding:9px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--navy);background:#f8fafc;border-bottom:1px solid var(--border)';
    const tdS='padding:10px 12px;font-size:13px;color:var(--navy);border-bottom:1px solid #f1f5f9';
    const upIco='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';
    const itemsTable='<div class="ep-form-title" style="margin:0 0 10px">Compliance Items</div>'
      +'<table style="width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:10px;overflow:hidden">'
      +'<thead><tr>'
      +'<th style="'+thS+'">S.NO</th><th style="'+thS+'">Compliance Item</th><th style="'+thS+'">Note</th><th style="'+thS+'">Status</th><th style="'+thS+'">Documents</th><th style="'+thS+'">ACTION</th>'
      +'</tr></thead>'
      +'<tbody>'+c.complianceItems.map((ci,i)=>'<tr>'
        +'<td style="'+tdS+';color:#6b7280">'+(i+1)+'</td>'
        +'<td style="'+tdS+';font-weight:600">'+ci.item+'</td>'
        +'<td style="'+tdS+';font-weight:500">'+ci.note+'</td>'
        +'<td style="'+tdS+'">'+ci.status+'</td>'
        +'<td style="'+tdS+'">'+(ci.doc?'<span style="color:#16a34a;font-size:12px;font-weight:600;display:inline-flex;align-items:center;gap:5px"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'+ci.doc+'</span>':'<span style="color:var(--navy);font-size:12px;cursor:pointer" onclick="ctUploadComplianceDoc('+c.id+','+i+')">Upload your document</span>')+'</td>'
        +'<td style="'+tdS+'"><button style="border:none;background:none;cursor:pointer;color:var(--navy);padding:0" title="Upload" onclick="ctUploadComplianceDoc('+c.id+','+i+')">'+upIco+'</button></td>'
        +'</tr>').join('')
      +'</tbody></table>';
    // -- If this contract has a live journey run currently sitting on a compliance-type step, surface the action here instead of the standalone modal, gated to whoever owns that step. --
    const linkedRun=manualJourneyRuns.find(function(r){return r.contractRecordId===c.id&&r.status!=='Completed';});
    let actionSection='';
    if(c.missingCountryConfig){
      const countryOpts='<option value="">Select country</option>'+Object.keys(aiH2rCountryData).map(function(name){return '<option value="'+name+'"'+(c.country===name?' selected':'')+'>'+name+'</option>';}).join('');
      const missingItem=(c.complianceItems||[])[0]||{};
      const checklistDefs=[
        'Confirmed the correct country of operation for '+(c.empName||'the employee'),
        'Attached the missing statutory requirement document for '+(c.country||'this country'),
        'Reviewed the configuration against current Compliance Hub rules'
      ];
      const checklistHTML=checklistDefs.map(function(t){return '<label style="display:flex;gap:8px;align-items:flex-start;font-size:12.5px;color:var(--navy);margin-bottom:8px;cursor:pointer"><input type="checkbox" class="mcc-resolve-check" style="margin-top:2px"> '+t+'</label>';}).join('');
      const docStatusHTML=missingItem.doc
        ?'<span style="color:#16a34a;font-size:12.5px;font-weight:600;display:inline-flex;align-items:center;gap:5px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'+missingItem.doc+' attached</span>'
        :'<span style="color:#7f1d1d;font-size:12.5px">No supporting document attached yet</span>';
      actionSection='<div class="ep-form-card" style="margin-bottom:16px;border-color:#fca5a5;background:#fef2f2">'
        +'<div class="ep-form-title" style="margin-bottom:4px;color:#991b1b;border:none;padding-bottom:0">Missing Country Configuration</div>'
        +'<div style="font-size:12px;color:#7f1d1d;margin-bottom:12px">Compliance Hub could not return statutory requirements for '+(c.country||'this country')+'. Select the country, attach the missing document, and complete the checklist to resolve this exception.</div>'
        +'<div class="ep-form-group"><label class="ep-form-label">Country of Operation</label><select class="ep-form-select" id="ct-country-config-'+c.id+'">'+countryOpts+'</select></div>'
        +'<div style="margin-top:8px;padding:10px 12px;border:1px dashed #fca5a5;border-radius:8px;display:flex;align-items:center;justify-content:space-between;gap:10px;background:#fff">'
        +docStatusHTML
        +'<button type="button" class="btn btn-secondary" style="padding:6px 14px;font-size:12px" onclick="ctUploadComplianceDoc('+c.id+',0)">Upload Missing File</button>'
        +'</div>'
        +'<div style="margin-top:14px"><div style="font-size:11.5px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">Resolution Checklist</div>'
        +checklistHTML
        +'</div>'
        +'<div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="btn btn-primary" onclick="resolveMissingCountryConfig('+c.id+')">Resolve &amp; Save Country Configuration</button></div>'
        +'</div>';
    }else if(linkedRun){
      const linkedSteps=manualJourneySteps(linkedRun.journeyId);
      const curStep=linkedSteps[linkedRun.currentStepIdx];
      if(curStep&&curStep.modulePage==='compliance'){
        const j=aiJourneys.find(function(x){return x.id===linkedRun.journeyId;})||cfgJourneys.find(function(x){return x.id===linkedRun.journeyId;})||{};
        const contextLine='<div style="font-size:11.5px;color:var(--gray);margin-bottom:12px">'+(j.name||'Contract Creation Journey')+' &mdash; Step '+(linkedRun.currentStepIdx+1)+' of '+linkedSteps.length+': <strong style="color:var(--navy)">'+curStep.name+'</strong></div>';
        const isOwner=portalRole!=='entity-user'||activePersonaId===manualStepOwnerPersonaId(curStep.ownerRole);
        if(isOwner){
          actionSection='<div class="ep-form-card" style="margin-bottom:16px">'
            +'<div class="ep-form-title" style="margin-bottom:4px">Compliance Checklist</div>'
            +contextLine
            +complianceActionPanelHTML(linkedRun,curStep)
            +'<div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn btn-primary" onclick="confirmComplianceResolve(\''+linkedRun.runId+'\')">Mark '+curStep.name+' Complete</button></div>'
            +'</div>';
        }else{
          actionSection='<div class="ep-form-card" style="margin-bottom:16px">'
            +'<div class="ep-form-title" style="margin-bottom:4px">Compliance Checklist</div>'
            +contextLine
            +'<div class="manual-waiting-note">Waiting on <strong>'+curStep.ownerRole+'</strong></div>'
            +'</div>';
        }
      }
    }
    body=actionSection+itemsTable;
  }else if(ctTab==='logs'){
    const logs=ctLogsData[c.id]||[];
    const ctLogKey=(s)=>({Submitted:'default','Quotation Approved':'active','Proposal Sent':'active','Proposal Approved':'active','Contract Sent':'active','Contract Signed':'active','Contract Approved':'active',Inactive:'inactive','Second Opinion Requested':'active','Proposal Rejected':'inactive'}[s]||'default');
    const personSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const calSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    const clkSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    const timelineHTML=logs.length
      ?'<div class="lp-logs-timeline">'+logs.map((l,i)=>{
          const sk=ctLogKey(l.status);
          return '<div class="lp-log-row">'
            +'<div class="lp-log-avatar-col"><div class="lp-log-avatar lp-log-avatar--'+sk+'">'+personSvg+'</div>'+(i<logs.length-1?'<div class="lp-log-connector"></div>':'')+'</div>'
            +'<div class="lp-log-card">'
            +'<div class="lp-log-status-row"><span class="lp-log-dot lp-log-dot--'+sk+'"></span><span class="lp-log-status-text lp-log-status-text--'+sk+'">'+l.status+'</span></div>'
            +'<div class="lp-log-meta-row"><span class="lp-log-meta-item">'+personSvg+'<span>'+l.user+'</span></span>'+(l.date?'<span class="lp-log-meta-item">'+calSvg+'<span>'+l.date+'</span></span>':'')+(l.time?'<span class="lp-log-meta-item">'+clkSvg+'<span>'+l.time+'</span></span>':'')+'</div>'
            +'<div class="lp-log-comment-row"><span class="lp-log-comment-label">Action:</span>'+l.action+'</div>'
            +'</div></div>';
        }).join('')+'</div>'
      :'<div class="lp-logs-empty">No activity logs yet.</div>';
    const pendingStatus=window._ctPendingStatus||ctNextStep(c.status);
    let actionPanel='';
    const upIcoLg='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';
    const linkedSecondOpinion=entityRequests.find(function(r){return r.type==='manager-notify'&&r.contractRecordId===c.id;});
    if(linkedSecondOpinion&&linkedSecondOpinion.status==='Pending'){
      actionPanel=ctSecondOpinionReviewPanelHTML(c,linkedSecondOpinion);
    }else if(linkedSecondOpinion&&linkedSecondOpinion.status!=='Pending'){
      actionPanel=ctSecondOpinionResolvedPanelHTML(linkedSecondOpinion);
    }else if(pendingStatus==='Contract Approved'){
      actionPanel='<div class="lp-logs-form">'
        +'<div class="lp-logs-form-header" style="color:#16a34a"><span style="width:9px;height:9px;border-radius:50%;background:#16a34a;display:inline-block;flex-shrink:0"></span>Contract Approved</div>'
        +'<p class="lp-logs-form-sub">Contract has been signed and approved. View the contract details and confirm.</p>'
        +'<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:9px;padding:12px;margin-bottom:12px;display:flex;align-items:center;gap:8px">'
        +'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
        +'<span style="font-size:12px;color:#15803d;font-weight:600">Signed contract document uploaded</span></div>'
        +'<button class="lp-logs-save-btn" style="background:#2563eb" onclick="openCtModal('+c.id+')">View &amp; Verify Contract</button>'
        +'</div>';
    }else if(pendingStatus==='Contract Sent'||c.status==='Contract Sent'){
      actionPanel='<div class="lp-logs-form">'
        +'<div class="lp-logs-form-header"><span style="width:9px;height:9px;border-radius:50%;background:#f59e0b;display:inline-block;flex-shrink:0"></span>Upload Contract Document</div>'
        +'<p class="lp-logs-form-sub">Upload the signed contract file to proceed to approval</p>'
        +'<div class="ct-upload-area" onclick="document.getElementById(\'ct-file-inp-'+c.id+'\').click()">'
        +upIcoLg
        +'<p>Click to upload or drag &amp; drop<br><span style="color:#9ca3af;font-size:11px">PDF, DOC, DOCX (max 10 MB)</span></p></div>'
        +'<input type="file" id="ct-file-inp-'+c.id+'" style="display:none" accept=".pdf,.doc,.docx">'
        +'<button class="lp-logs-save-btn">Upload &amp; Send for Approval</button>'
        +'</div>';
    }else if(pendingStatus){
      const nextLabels={'Quotation Approved':'Approve the quotation to proceed to the proposal stage.','Proposal Sent':'Send the EOR proposal to the employee for review.','Proposal Approved':'Approve the proposal received from the employee.','Contract Sent':'Upload and send the contract document to the employee.'};
      const btnLabels={'Quotation Approved':'Approve Quotation','Proposal Sent':'Send Proposal','Proposal Approved':'Approve Proposal','Contract Sent':'Send Contract'};
      actionPanel='<div class="lp-logs-form">'
        +'<div class="lp-logs-form-header"><span style="width:9px;height:9px;border-radius:50%;background:#f59e0b;display:inline-block;flex-shrink:0"></span>Next: '+pendingStatus+'</div>'
        +'<p class="lp-logs-form-sub">'+(nextLabels[pendingStatus]||'Complete this step to advance the contract.')+'</p>'
        +'<div class="lp-logs-form-label">Comment <span class="lp-logs-form-req">*</span></div>'
        +'<textarea class="lp-logs-form-textarea" placeholder="Add a note for this action..."></textarea>'
        +'<button class="lp-logs-save-btn">'+(btnLabels[pendingStatus]||pendingStatus)+'</button>'
        +'</div>';
    }else{
      actionPanel='<div class="lp-logs-form">'
        +'<div class="lp-logs-form-header" style="color:#16a34a"><span style="width:9px;height:9px;border-radius:50%;background:#16a34a;display:inline-block;flex-shrink:0"></span>'+(c.status==='Inactive'?'Contract Inactive':'Contract Approved')+'</div>'
        +'<p class="lp-logs-form-sub">'+(c.status==='Inactive'?'This contract has been set to Inactive.':'This contract has been fully approved and finalized.')+'</p>'
        +(c.status==='Contract Approved'?'<button class="lp-logs-save-btn" style="background:#2563eb" onclick="openCtModal('+c.id+')">View Contract</button>':'')
        +'</div>';
    }
    body='<div class="lp-logs-wrap">'+timelineHTML+actionPanel+'</div>';
  }else if(ctTab==='workflow'){
    const wf=ctWorkflowData[c.id]||[];
    const wfPersonSvg='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const wfCalSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    body=manualStepBannerHTML(c,'workflow')+(wf.length
      ?'<div class="lp-wf-wrap">'+wf.map((w,i)=>'<div class="lp-wf-row">'
          +'<div class="lp-wf-dot-col"><div class="lp-wf-dot"></div>'+(i<wf.length-1?'<div class="lp-wf-connector"></div>':'')+'</div>'
          +'<div class="lp-wf-card"><div class="lp-wf-title">'+w.title+'</div>'
          +'<div class="lp-wf-meta-row"><span class="lp-wf-meta-item">'+wfPersonSvg+'<span>'+w.user+'</span></span>'+(w.date?'<span class="lp-wf-meta-item">'+wfCalSvg+'<span>'+w.date+'</span></span>':'')+(w.time?'<span class="lp-wf-meta-sep">|</span><span>'+w.time+'</span>':'')+'</div>'
          +'<div class="lp-wf-desc"><span class="lp-wf-desc-label">Description:</span><span class="lp-wf-desc-text">'+w.description+'</span></div>'
          +'</div></div>').join('')+'</div>'
      :'<div class="lp-wf-empty">No workflow configured.</div>');
  }
  return tabBar+'<div class="lp-isb-body">'+body+'</div>';
}
var peoStep=0;
var peoData={};
var manualContractFormData={};
function peoGoStep(s){peoStep=s;page='contract-peo';renderADTPage();}
function peoNext(){aiCaptureCurrentStep();captureManualContractStep();peoStep=Math.min(2,peoStep+1);if(aiAssistedFlow)aiCtPushStepMessage(peoStep);page='contract-peo';renderADTPage();}
function peoBack(){aiCaptureCurrentStep();captureManualContractStep();if(peoStep===0){peoStep=0;page=aiAssistedFlow?'ai-contract-assistant':'contract-type-select';renderADTPage();}else{peoStep--;page='contract-peo';renderADTPage();}}
var eorStep=0;
function eorGoStep(s){eorStep=s;page='contract-eor';renderADTPage();}
function aiCaptureCurrentStep(){
  if(!aiAssistedFlow)return;
  const gv=function(id){const el=document.getElementById(id);return el?el.value:undefined;};
  const merge=function(k,v){if(v!==undefined&&v!=='')aiWizardFormData[k]=v;};
  merge('fname',gv('peo-fname'));merge('lname',gv('peo-lname'));merge('gender',gv('peo-gender'));
  merge('email',gv('peo-email'));merge('mobile',gv('peo-mobile'));merge('dob',gv('peo-dob'));
  merge('address',gv('peo-address'));merge('country',gv('peo-work-country'));merge('nationality',gv('peo-nationality'));
  const wpEl=document.querySelector('.peo-wp-radio.selected span');
  if(wpEl)aiWizardFormData.workPermit=wpEl.textContent.indexOf('has work permit')!==-1;
  merge('jobTitle',gv('peo-jobtitle'));merge('skill',gv('peo-skill'));merge('jobDesc',gv('peo-jobdesc'));
  merge('fromDate',gv('peo-from'));merge('toDate',gv('peo-to'));merge('hours',gv('peo-hours'));merge('pay',gv('peo-pay'));
  const termEl=document.querySelector('.peo-radio-term.selected span');
  if(termEl)aiWizardFormData.employmentTerm=termEl.textContent;
  const typeEl=document.querySelector('.peo-radio-emptype.selected span');
  if(typeEl)aiWizardFormData.employeeType=typeEl.textContent;
  merge('probation',gv('peo-prob'));merge('notice',gv('peo-notice'));
}
function captureManualContractStep(){
  if(aiAssistedFlow)return;
  const gv=function(id){const el=document.getElementById(id);return el?el.value:undefined;};
  const merge=function(k,v){if(v!==undefined&&v!=='')manualContractFormData[k]=v;};
  merge('fname',gv('peo-fname'));merge('lname',gv('peo-lname'));merge('gender',gv('peo-gender'));
  merge('email',gv('peo-email'));merge('mobile',gv('peo-mobile'));merge('dob',gv('peo-dob'));
  merge('address',gv('peo-address'));merge('country',gv('peo-work-country'));merge('nationality',gv('peo-nationality'));
  const wpEl=document.querySelector('.peo-wp-radio.selected span');
  if(wpEl)manualContractFormData.workPermit=wpEl.textContent.indexOf('has work permit')!==-1;
  merge('jobTitle',gv('peo-jobtitle'));merge('skill',gv('peo-skill'));merge('jobDesc',gv('peo-jobdesc'));
  merge('fromDate',gv('peo-from'));merge('toDate',gv('peo-to'));merge('hours',gv('peo-hours'));merge('pay',gv('peo-pay'));
  const termEl=document.querySelector('.peo-radio-term.selected span');
  if(termEl)manualContractFormData.employmentTerm=termEl.textContent;
  const typeEl=document.querySelector('.peo-radio-emptype.selected span');
  if(typeEl)manualContractFormData.employeeType=typeEl.textContent;
  merge('probation',gv('peo-prob'));merge('notice',gv('peo-notice'));
}
function eorNext(){aiCaptureCurrentStep();captureManualContractStep();eorStep=Math.min(2,eorStep+1);if(aiAssistedFlow)aiCtPushStepMessage(eorStep);page='contract-eor';renderADTPage();}
function eorBack(){aiCaptureCurrentStep();captureManualContractStep();if(eorStep===0){eorStep=0;page=aiAssistedFlow?'ai-contract-assistant':'contract-type-select';renderADTPage();}else{eorStep--;page='contract-eor';renderADTPage();}}
function submitManualContractDeal(type){
  captureManualContractStep();
  const d=manualContractFormData;
  const fullName=((d.fname||'')+' '+(d.lname||'')).trim()||'New Employee';
  const creatorId=portalRole==='entity-user'?activePersonaId:'account-manager';
  const creatorPersona=enterprisePersonas.find(function(p){return p.id===creatorId;});
  const creatorLabel=creatorPersona?creatorPersona.label:'Account Manager';
  const run={
    runId:'MAN-'+(manualRunSeq++),journeyId:'contract-creation',subject:fullName,entity:'Dhi Hyperlocal',mode:'Manual',
    currentStepIdx:1,status:'Active',slaRisk:'Low',blockedReason:'None',escalation:'None',startedAt:'Just now',
    manualHours:.8,agentEstimateHours:0,createdBy:creatorId,exceptions:[],
    audit:['Deal & Employee Record completed by '+creatorLabel+' for '+fullName+' ('+type+')']
  };
  manualJourneyRuns.unshift(run);
  const newContractId=contractsData.reduce(function(m,c){return Math.max(m,c.id);},0)+1;
  const now=aiFormatNow();
  const from=d.fromDate||now.date;
  const contractRow={
    id:newContractId,contractId:String(90000+Math.floor(Math.random()*9999)),
    empName:fullName,empDesig:d.jobTitle||'—',country:d.country||'—',type:type,date:now.date+' '+now.time,status:'Submitted',
    nationality:d.nationality||d.country||'India',countryOfOp:d.country||'—',workPermit:d.workPermit===true,
    gender:(d.gender||'').toUpperCase()||'—',email:d.email||'—',contact:d.mobile||'—',dob:d.dob||'—',
    jobTitle:d.jobTitle||'—',skill:d.skill||'—',empDuration:from+(d.toDate?' – '+d.toDate:''),
    empType:type,workSchedule:d.hours||'—',payAmount:d.pay||'—',currency:'INR',jobDesc:d.jobDesc||'—',payFrequency:'Monthly',
    commercial:aiGenCommercial(d.pay),
    complianceItems:[{item:type+' '+(d.country||'')+' Proposal',note:'Optional',status:'Pending',doc:null}],
    manualRunId:run.runId
  };
  contractsData.unshift(contractRow);
  run.contractRecordId=newContractId;
  ctLogsData[newContractId]=[{date:now.date,time:now.time,user:creatorLabel,status:'Submitted',action:'Deal & Employee Record completed manually for '+fullName+' ('+type+').'}];
  ctWorkflowData[newContractId]=[{title:'Deal & Employee Record Completed',user:creatorLabel,date:now.date,time:now.time,description:creatorLabel+' created the deal and employee record for '+fullName+'.'}];
  const firstStep=manualJourneySteps('contract-creation')[run.currentStepIdx];
  const firstOwnerId=firstStep&&manualStepOwnerPersonaId(firstStep.ownerRole);
  if(firstOwnerId)pushRunNotification(run.runId,firstOwnerId,'"'+firstStep.name+'" is waiting on you for '+fullName+'.');
  manualContractFormData={};peoStep=0;eorStep=0;
  selectedManualRunId=run.runId;manualJourneyBackPage='contracts';page='manual-journey-run';
  renderADTPage();
  showAiToast('Journey started',fullName+"'s contract journey ("+run.runId+') is now at '+(firstStep?firstStep.name:'the next step')+'.');
}
function buildEORContractHTML(){return buildContractFormHTML('EOR',eorStep);}
function buildPEOContractHTML(){return buildContractFormHTML('PEO',peoStep);}
function peoSelectRadio(groupClass,clickedEl){
  document.querySelectorAll('.'+groupClass).forEach(function(r){
    r.classList.remove('selected');
    var inner=r.querySelector('.peo-radio-inner');var outer=r.querySelector('.peo-radio-outer');
    if(inner)inner.style.background='transparent';
    if(outer)outer.style.borderColor='#d1d5db';
  });
  clickedEl.classList.add('selected');
  var inner=clickedEl.querySelector('.peo-radio-inner');var outer=clickedEl.querySelector('.peo-radio-outer');
  if(inner)inner.style.background='var(--orange)';
  if(outer)outer.style.borderColor='var(--orange)';
}
function peoSelectWorkPermit(el){
  document.querySelectorAll('.peo-wp-radio').forEach(function(r){
    r.classList.remove('selected');
    var dot=r.querySelector('.peo-radio-inner');
    if(dot){dot.style.background='transparent';}
    var outer=r.querySelector('.peo-radio-outer');
    if(outer){outer.style.borderColor='#d1d5db';}
  });
  el.classList.add('selected');
  var dot=el.querySelector('.peo-radio-inner');
  if(dot){dot.style.background='var(--orange)';}
  var outer=el.querySelector('.peo-radio-outer');
  if(outer){outer.style.borderColor='var(--orange)';}
}
const AI_CT_COUNTRIES=['Afghanistan','Australia','Austria','Bangladesh','Belgium','Brazil','Canada','China','Denmark','Egypt','Finland','France','Germany','Ghana','Greece','India','Indonesia','Iran','Iraq','Ireland','Italy','Japan','Jordan','Kenya','Malaysia','Mexico','Morocco','Nepal','Netherlands','New Zealand','Nigeria','Norway','Pakistan','Philippines','Poland','Portugal','Qatar','Romania','Russia','Saudi Arabia','Singapore','South Africa','South Korea','Spain','Sri Lanka','Sweden','Switzerland','Thailand','Turkey','Ukraine','United Arab Emirates','United Kingdom','United States','Vietnam'];
function buildContractFormHTML(type,step,splitMode){
  const tl=type.toLowerCase();
  const countries=AI_CT_COUNTRIES;
  const countryOpts='<option value="">Select Country</option>'+countries.map(function(c){return '<option value="'+c+'">'+c+'</option>';}).join('');
  const countryOptsSel=function(sel){return '<option value="">Select Country</option>'+countries.map(function(c){return '<option value="'+c+'"'+(c===sel?' selected':'')+'>'+c+'</option>';}).join('');};
  const prefill=aiAssistedFlow?Object.assign({},aiContractPrefill||{},aiWizardFormData||{}):{};
  const isAssistedReview=aiAssistedFlow&&splitMode;
  const includeStep=function(s){return isAssistedReview||step===s;};
  const steps=['Basic Details','Job Details','Other Details'];

  // Stepper bar
  const stepper=isAssistedReview?'':'<div style="display:flex;align-items:center;gap:0;margin-bottom:28px;background:#fff;border:1px solid var(--border);border-radius:12px;overflow:hidden;padding:20px 30px">'
    +steps.map(function(s,i){
      const active=i===step;
      const done=i<step;
      const circleStyle='width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;'
        +(done?'background:var(--orange);color:#fff;':active?'background:transparent;color:var(--orange);border:2px solid var(--orange);':'background:transparent;color:#d1d5db;border:2px solid #d1d5db;');
      const labelColor=active?'var(--orange)':done?'var(--navy)':'#9ca3af';
      const circleContent=done?'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>':(i+1);
      let html='<div style="display:flex;align-items:center;gap:10px;cursor:pointer" onclick="'+(type==='PEO'?'peoGoStep':'eorGoStep')+'('+i+')">'
        +'<div style="'+circleStyle+'">'+circleContent+'</div>'
        +'<span style="font-size:13px;font-weight:600;color:'+labelColor+'">'+s+'</span>'
        +'</div>';
      if(i<steps.length-1){
        html+='<div style="flex:1;height:1px;background:'+(done?'var(--orange)':'#e5e7eb')+';margin:0 20px;min-width:40px"></div>';
      }
      return html;
    }).join('')
    +'</div>';

  let content='';

  if(includeStep(0)){
    content+=
      // Eligibility card
      '<div class="ep-form-card" style="margin-bottom:16px;padding:0;overflow:visible">'
      +'<div class="ep-form-title" style="padding:18px 24px;margin:0;background:#fafbfc;border-bottom:1px solid var(--border);border-radius:12px 12px 0 0">Eligibility</div>'
      +'<div style="padding:24px">'
      +'<div class="ep-form-grid" style="margin-bottom:20px">'
      +'<div class="ep-form-group"><label class="ep-form-label">Employee Nationality <span class="req">*</span></label>'
      +'<select class="ep-form-select" id="peo-nationality" style="height:42px;padding:0 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;color:var(--navy);font-family:inherit;outline:none;background:#fff;cursor:pointer;box-sizing:border-box;width:100%">'+countryOptsSel(prefill.nationality||'')+'</select></div>'
      +'<div class="ep-form-group"><label class="ep-form-label">Country employee will be working from <span class="req">*</span></label>'
      +'<select class="ep-form-select" id="peo-work-country" style="height:42px;padding:0 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;color:var(--navy);font-family:inherit;outline:none;background:#fff;cursor:pointer;box-sizing:border-box;width:100%">'+countryOptsSel(prefill.country||'')+'</select></div>'
      +'</div>'
      +'<div style="font-size:13px;font-weight:600;color:#e07b00;margin-bottom:12px">Work Permit</div>'
      +'<div style="display:flex;flex-direction:column;gap:10px">'
      +(function(){
        const hasPermit=prefill.workPermit===true;
        const wp=function(sel,label){
          return '<label class="peo-wp-radio'+(sel?' selected':'')+'" onclick="peoSelectWorkPermit(this)" style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:0">'
            +'<div class="peo-radio-outer" style="width:16px;height:16px;border-radius:50%;border:2px solid '+(sel?'var(--orange)':'#d1d5db')+';flex-shrink:0;display:flex;align-items:center;justify-content:center">'
            +'<div class="peo-radio-inner" style="width:7px;height:7px;border-radius:50%;background:'+(sel?'var(--orange)':'transparent')+';transition:.15s"></div>'
            +'</div>'
            +'<span style="font-size:13px;color:#e07b00;font-weight:500">'+label+'</span>'
            +'</label>';
        };
        return wp(hasPermit,'Yes, Employee has work permit')+wp(!hasPermit,'Employee would like ADT to assist for work visa');
      })()
      +'</div>'
      +'</div></div>'

      // Employee Information card
      +'<div class="ep-form-card" style="padding:0;overflow:visible">'
      +'<div class="ep-form-title" style="padding:18px 24px;margin:0;background:#fafbfc;border-bottom:1px solid var(--border);border-radius:12px 12px 0 0">Employee Information</div>'
      +'<div style="padding:24px">'
      +'<div class="ep-form-grid" style="margin-bottom:16px">'
      +'<div class="ep-form-group"><label class="ep-form-label">First Name <span class="req">*</span></label>'
      +'<input id="peo-fname" class="ep-form-input" type="text" placeholder="First Name" value="'+(prefill.fname||'')+'"></div>'
      +'<div class="ep-form-group"><label class="ep-form-label">Last Name <span class="req">*</span></label>'
      +'<input id="peo-lname" class="ep-form-input" type="text" placeholder="Last Name" value="'+(prefill.lname||'')+'"></div>'
      +'<div class="ep-form-group"><label class="ep-form-label">Gender</label>'
      +'<select id="peo-gender" class="ep-form-select" style="height:42px;padding:0 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;color:var(--navy);font-family:inherit;outline:none;background:#fff;cursor:pointer;box-sizing:border-box;width:100%">'
      +['','Male','Female','Non-binary','Prefer not to say'].map(function(g){return '<option'+(g===prefill.gender?' selected':'')+'>'+(g||'Select')+'</option>';}).join('')
      +'</select></div>'
      +'<div class="ep-form-group"><label class="ep-form-label">Email <span class="req">*</span></label>'
      +'<input id="peo-email" class="ep-form-input" type="email" placeholder="email@example.com" value="'+(prefill.email||'')+'"></div>'
      +'<div class="ep-form-group"><label class="ep-form-label">Mobile Number <span class="req">*</span></label>'
      +'<div style="display:flex;gap:8px">'
      +'<select style="height:42px;padding:0 10px;border:1px solid var(--border);border-radius:8px;font-size:13px;color:var(--navy);font-family:inherit;outline:none;background:#fff;cursor:pointer;flex-shrink:0;min-width:80px">'
      +'<option>+91</option><option>+1</option><option>+44</option><option>+49</option><option>+31</option><option>+33</option><option>+61</option><option>+971</option>'
      +'</select>'
      +'<input id="peo-mobile" class="ep-form-input" type="tel" placeholder="Mobile Number" style="flex:1" value="'+(prefill.mobile||'')+'"></div></div>'
      +'<div class="ep-form-group"><label class="ep-form-label">Date of Birth <span class="req">*</span></label>'
      +'<input id="peo-dob" class="ep-form-input" type="date" value="'+(prefill.dob||'')+'"></div>'
      +'</div>'
      +'<div class="ep-form-group"><label class="ep-form-label">Address <span class="req">*</span></label>'
      +'<textarea id="peo-address" class="ep-form-input" rows="3" placeholder="Address" style="resize:vertical;min-height:70px;line-height:1.5">'+(prefill.address||'')+'</textarea>'
      +'</div>'
      +'</div></div>';
  }

  if(includeStep(1)){
    const radioItem=function(grpClass,label,checked){
      return '<label class="peo-radio-'+grpClass+(checked?' selected':'')+'" onclick="peoSelectRadio(\'peo-radio-'+grpClass+'\',this)" style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:10px">'
        +'<div class="peo-radio-outer" style="width:16px;height:16px;border-radius:50%;border:2px solid '+(checked?'var(--orange)':'#d1d5db')+';flex-shrink:0;display:flex;align-items:center;justify-content:center">'
        +'<div class="peo-radio-inner" style="width:7px;height:7px;border-radius:50%;background:'+(checked?'var(--orange)':'transparent')+';transition:.15s"></div>'
        +'</div>'
        +'<span style="font-size:13px;color:var(--navy);font-weight:500">'+label+'</span>'
        +'</label>';
    };
    const today=new Date().toISOString().split('T')[0];
    content+=
      '<div class="ep-form-card" style="padding:24px">'
      +'<div style="font-size:15px;font-weight:700;color:var(--navy);margin-bottom:20px">Job Details</div>'

      // Job Title + Primary Skill
      +'<div class="ep-form-grid" style="margin-bottom:16px">'
      +'<div class="ep-form-group"><label class="ep-form-label">Job Title <span class="req">*</span></label>'
      +'<input id="peo-jobtitle" class="ep-form-input" placeholder="e.g. Software Engineer" value="'+(prefill.jobTitle||'')+'"></div>'
      +'<div class="ep-form-group"><label class="ep-form-label">Primary Skill</label>'
      +'<div style="position:relative">'
      +'<input id="peo-skill" class="ep-form-input" placeholder="Search or type a skill..." style="padding-right:36px" value="'+(prefill.skill||'')+'">'
      +'<span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none;color:#9ca3af">'
      +'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>'
      +'</span></div></div>'
      +'</div>'

      // Job Description
      +'<div class="ep-form-group" style="margin-bottom:6px"><label class="ep-form-label">Job Description <span class="req">*</span></label>'
      +'<textarea id="peo-jobdesc" class="ep-form-input" rows="4" placeholder="Enter job description" style="resize:vertical;min-height:90px;line-height:1.5">'+(prefill.jobDesc||'')+'</textarea></div>'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">'
      +'<span style="font-size:11.5px;color:#64748b">Job description will appear on the contract under <em>"Scope of Work / Job Responsibilities"</em></span>'
      +'<span style="font-size:11.5px;color:var(--orange);font-weight:600;flex-shrink:0;margin-left:12px">maximum 100 words</span>'
      +'</div>'

      // Employment Duration
      +'<div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:10px">Employment Duration</div>'
      +'<div style="display:flex;gap:16px;margin-bottom:6px">'
      +'<div style="flex:1"><input id="peo-from" class="ep-form-input" type="date" value="'+(prefill.fromDate||today)+'"></div>'
      +'<div style="flex:1"><input id="peo-to" class="ep-form-input" type="date" value="'+(prefill.toDate||'')+'"></div>'
      +'</div>'
      +'<div style="display:flex;gap:16px;margin-bottom:20px">'
      +'<div style="flex:1;font-size:11.5px;color:#64748b">Start Date <span class="req">*</span></div>'
      +'<div style="flex:1;font-size:11.5px;color:#64748b">End Date <span class="req">*</span></div>'
      +'</div>'

      // Employment Term + Employee Type radios
      +'<div class="ep-form-grid" style="margin-bottom:20px">'
      +'<div>'
      +'<div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:10px">Employment Term <span class="req">*</span></div>'
      +radioItem('term','Permanent',prefill.employmentTerm?prefill.employmentTerm==='Permanent':true)
      +radioItem('term','Fixed Term',prefill.employmentTerm==='Fixed Term')
      +'</div>'
      +'<div>'
      +'<div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:10px">Employee Type <span class="req">*</span></div>'
      +radioItem('emptype','Full Time',prefill.employeeType?prefill.employeeType==='Full Time':true)
      +radioItem('emptype','Part Time',prefill.employeeType==='Part Time')
      +'</div>'
      +'</div>'

      // Work Schedule
      +'<div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:10px">Work Schedule</div>'
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">'
      +'<input id="peo-hours" class="ep-form-input" type="number" value="'+(prefill.hours||20)+'" min="1" style="width:80px;text-align:center">'
      +'<span style="font-size:13px;color:#64748b">Hours</span>'
      +'</div>'

      // Pay Amount
      +'<div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:4px">Pay Amount</div>'
      +'<div style="font-size:12px;color:#64748b;margin-bottom:10px">Enter the salary of employee</div>'
      +'<div style="display:flex;align-items:center;gap:8px">'
      +'<div style="display:flex;align-items:center;border:1px solid var(--border);border-radius:8px;overflow:hidden;flex-shrink:0">'
      +'<span style="padding:0 10px;height:42px;display:flex;align-items:center;background:#f8fafc;border-right:1px solid var(--border);font-size:11px;font-weight:700;color:#374151">IN</span>'
      +'<span style="padding:0 10px;height:42px;display:flex;align-items:center;font-size:12px;font-weight:600;color:var(--navy)">INR</span>'
      +'<input id="peo-pay" type="number" value="'+(prefill.pay||'0.00')+'" step="0.01" style="width:100px;height:42px;border:none;border-left:1px solid var(--border);padding:0 10px;font-size:13px;color:var(--navy);font-family:inherit;outline:none">'
      +'</div>'
      +'<span style="font-size:13px;color:#64748b">per</span>'
      +'<select style="height:42px;padding:0 10px;border:1px solid var(--border);border-radius:8px;font-size:13px;color:var(--navy);font-family:inherit;outline:none;background:#fff;cursor:pointer">'
      +'<option>Monthly</option><option>Bi-weekly</option><option>Weekly</option>'
      +'</select>'
      +'</div>'

      +'</div>';
  }

  if(includeStep(2)){
    const thS='padding:10px 14px;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid var(--border);text-align:left';
    const tdS='padding:14px;font-size:13px;color:var(--navy);border-bottom:1px solid #f1f5f9;vertical-align:middle';
    const inputNum=function(val){return '<input type="number" value="'+val+'" min="0" style="width:60px;height:34px;padding:0 8px;border:1px solid var(--border);border-radius:6px;font-size:13px;text-align:center;font-family:inherit;outline:none;color:var(--navy)">';};
    content+=
      // Leave Entitlement card
      '<div class="ep-form-card" style="margin-bottom:16px;padding:0;overflow:hidden">'
      +'<div style="padding:18px 20px;border-bottom:1px solid var(--border)">'
      +'<div style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:3px">Leave Entitlement</div>'
      +'<div style="font-size:12px;color:var(--orange)">These are the mandatory leaves that employee shall receive</div>'
      +'</div>'
      +'<table style="width:100%;border-collapse:collapse">'
      +'<thead><tr>'
      +'<th style="'+thS+';width:45%">Leave Type</th>'
      +'<th style="'+thS+'">Mandatory</th>'
      +'<th style="'+thS+'">Additional</th>'
      +'<th style="'+thS+'">Total</th>'
      +'</tr></thead>'
      +'<tbody>'
      +'<tr>'
      +'<td style="'+tdS+'">'
      +'<div style="font-weight:600;color:var(--navy)">Annual Leaves</div>'
      +'<div style="font-size:11.5px;color:#3b82f6;margin-top:3px;line-height:1.4">Additional leaves will result in an additional deposit amount.</div>'
      +'</td>'
      +'<td style="'+tdS+';font-weight:600">18 Days</td>'
      +'<td style="'+tdS+'">'+inputNum(0)+'</td>'
      +'<td style="'+tdS+';font-weight:600">18 Days</td>'
      +'</tr>'
      +'<tr>'
      +'<td style="'+tdS+';font-weight:600">Sick Leaves</td>'
      +'<td style="'+tdS+';font-weight:600">12 Days</td>'
      +'<td style="'+tdS+'">'+inputNum(0)+'</td>'
      +'<td style="'+tdS+';font-weight:600">12 Days</td>'
      +'</tr>'
      +'<tr>'
      +'<td style="'+tdS+';font-weight:600;border-bottom:none">Maternity Leaves</td>'
      +'<td style="'+tdS+';font-weight:600;border-bottom:none">36 Weeks</td>'
      +'<td style="'+tdS+';border-bottom:none">'+inputNum(0)+'</td>'
      +'<td style="'+tdS+';font-weight:600;border-bottom:none">36 Weeks</td>'
      +'</tr>'
      +'</tbody></table>'
      +'</div>'

      // Probation Period
      +'<div class="ep-form-card" style="margin-bottom:16px;padding:20px 24px">'
      +'<div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:14px">Probation Period <span class="req">*</span></div>'
      +'<div style="border-top:1px dashed #e5e7eb;padding-top:14px">'
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'
      +'<input id="peo-prob" class="ep-form-input" type="number" value="'+(prefill.probation||3)+'" min="0" style="width:80px;text-align:center">'
      +'<span style="font-size:13px;color:#64748b">months</span>'
      +'</div>'
      +'<div style="font-size:12px;color:#3b82f6;line-height:1.5">You will be invoiced a one time deposit equivalent to the employee\'s Gross Salary of 1 month.</div>'
      +'</div></div>'

      // Notice Period
      +'<div class="ep-form-card" style="padding:20px 24px">'
      +'<div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:14px">Notice Period <span class="req">*</span></div>'
      +'<div style="border-top:1px dashed #e5e7eb;padding-top:14px">'
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'
      +'<input id="peo-notice" class="ep-form-input" type="number" value="'+(prefill.notice||3)+'" min="0" style="width:80px;text-align:center">'
      +'<span style="font-size:13px;color:#64748b">months</span>'
      +'</div>'
      +'<div style="font-size:12px;color:#3b82f6;line-height:1.5">You will be invoiced a one time deposit equivalent to the employee\'s Gross Salary of 1 month.</div>'
      +'</div></div>';
  }

  const isLast=isAssistedReview||step===2;
  const goBack=type==='PEO'?'peoBack()':'eorBack()';
  const goNext=type==='PEO'?'peoNext()':'eorNext()';
  const finalAction=aiAssistedFlow?'aiSubmitAssistedContract(\''+type+'\')':'submitManualContractDeal(\''+type+'\')';
  const footer='<div style="display:flex;align-items:center;justify-content:space-between;margin-top:24px">'
    +'<button class="ep-cancel-btn" style="border-radius:99px;display:inline-flex;align-items:center;gap:6px" onclick="'+goBack+'"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>Back</button>'
    +'<button class="ep-save-btn" style="padding:9px 28px;border-radius:99px" onclick="'+(isLast?finalAction:goNext)+'">'+( isLast?(aiAssistedFlow?'Create Proposal':'Submit Contract'):'Next')+'</button>'
    +'</div>';

  const aiHint=isAssistedReview?('<div style="margin-bottom:16px">'
    +'<div class="info-box tip" style="margin-bottom:10px"><div class="ib-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg></div><div><strong>AI pre-filled every field below</strong>Review the details, edit anything you like, then create the proposal.</div></div>'
    +aiCtCurrentAgentBadge()
    +'</div>'):'';
  const pageStyle=splitMode?'width:100%;padding:26px 30px;box-sizing:border-box':'max-width:820px;margin:0 auto';

  return '<div class="ep-page" style="'+pageStyle+'">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">'
    +'<button class="ep-back" onclick="'+goBack+'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> '+(step===0?'Back to Create Contract':'Back')+'</button>'
    +'<span style="font-size:12px;font-weight:700;color:#64748b;background:#f1f5f9;border:1px solid var(--border);padding:4px 12px;border-radius:6px;letter-spacing:.5px">'+type+'</span>'
    +'</div>'
    +'<div class="ep-header" style="margin-bottom:20px">'
    +'<div class="ep-title-wrap"><span class="ep-title">Create a Contract</span></div>'
    +'</div>'
    +stepper
    +aiHint
    +content
    +footer
    +'</div>';
}
function buildContractTypeSelectHTML(){
  const icoStyle='width:44px;height:44px;border-radius:12px;background:#f1f5f9;border:1px solid #d1d5db;display:flex;align-items:center;justify-content:center;flex-shrink:0';
  const peoBag='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/></svg>';
  const eorBuild='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="1.8"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 21V10h8v11"/><path d="M12 7h.01"/></svg>';
  const card=function(ico,type,title,desc,onclick){
    return '<div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:28px 30px;display:flex;flex-direction:column;gap:20px;transition:.18s;cursor:default" '
      +'onmouseenter="this.style.boxShadow=\'0 4px 20px rgba(15,23,42,.10)\';this.style.borderColor=\'#d1d5db\'" '
      +'onmouseleave="this.style.boxShadow=\'\';this.style.borderColor=\'var(--border)\'">'
      +'<div style="display:flex;align-items:flex-start;gap:18px">'
      +'<div style="'+icoStyle+'">'+ico+'</div>'
      +'<div>'
      +'<div style="font-size:16px;font-weight:700;color:var(--navy);margin-bottom:8px">'+title+'</div>'
      +'<div style="font-size:13px;color:#64748b;line-height:1.6;max-width:520px">'+desc+'</div>'
      +'</div>'
      +'</div>'
      +'<div>'
      +'<button onclick="'+onclick+'" style="padding:9px 22px;border:1.5px solid var(--navy);border-radius:99px;background:#fff;color:var(--navy);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:.15s" '
      +'onmouseenter="this.style.background=\'var(--navy)\';this.style.color=\'#fff\'" '
      +'onmouseleave="this.style.background=\'#fff\';this.style.color=\'var(--navy)\'">'
      +'Create contract for employee</button>'
      +'</div>'
      +'</div>';
  };
  return '<div class="ep-page" style="max-width:780px;margin:0 auto">'
    +'<div><button class="ep-back" onclick="page=\'contracts\';renderADTPage()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back to Contracts</button></div>'
    +'<div class="ep-header">'
    +'<div class="ep-title-wrap"><span class="ep-title">Create Contract</span></div>'
    +'</div>'
    +'<div style="display:flex;flex-direction:column;gap:16px;margin-top:4px">'
    +card(peoBag,'PEO','Professional Employer Organization (PEO)',
      'An arrangement between you and a third party for the management of your employment agreements and associated documentation for businesses in several countries.',
      'peoStep=0;page=\'contract-peo\';renderADTPage()')
    +card(eorBuild,'EOR','Employer of Record (EOR)',
      "An arrangement between you and a third party for the establishment of a legal relationship between a freelancer and a client that covers the terms and conditions of the freelancer's work.",
      'eorStep=0;page=\'contract-eor\';renderADTPage()')
    +'</div>'
    +'</div>';
}
function ctComplianceBadge(c){
  const items=c.complianceItems||[];
  if(!items.length)return '<span style="color:#9ca3af">--</span>';
  const typeMap={Pending:'pending',Approved:'approved',Inactive:'rejected',Blocking:'rejected'};
  const worst=items.some(i=>i.status==='Blocking')?'Blocking':items.some(i=>i.status==='Inactive')?'Inactive':items.some(i=>i.status==='Pending')?'Pending':'Approved';
  return statusMini(worst+(items.length>1?' ('+items.length+')':''),typeMap[worst]||'pending');
}
function buildContractsListingHTML(){
  const proposalPending=contractsData.filter(c=>c.status==='Proposal Sent').length;
  const contractPending=contractsData.filter(c=>c.status==='Contract Sent').length;
  const countries=[...new Set(contractsData.map(c=>c.country))];
  const types=[...new Set(contractsData.map(c=>c.type))];
  const dotsIco='<svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg>';
  const filteredContracts=ctQuickStatusFilter?contractsData.filter(c=>c.status===ctQuickStatusFilter):contractsData;
  const chevIco='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';
  const checkIco='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
  const rows=filteredContracts.map((c,ctIdx)=>{
    const flowIdx=ctFlow.indexOf(c.status);
    const menuItems=ctFlow.map((step,i)=>{
      const isDone=flowIdx>i;
      const isCurrent=flowIdx===i;
      const cls=isDone?'done':isCurrent?'current':'next';
      const ico=isDone?checkIco:(i+1);
      const click=(!isDone&&!isCurrent)?'onclick="ctPickStatus('+c.id+',\''+step+'\')"':'';
      return '<div class="ct-act-item '+cls+'" '+click+'><span class="ct-act-step '+cls+'">'+ico+'</span>'+step+'</div>';
    }).join('');
    const btnLabel=c.status.length>12?c.status.slice(0,10)+'…':c.status;
    // -- Rows created through the persona-gated journey (c.manualRunId) can only progress through that flow, not the free-form status dropdown below, so the button opens a read-only journey-progress menu (no ctPickStatus clicks) instead of letting the step be changed directly. --
    const linkedRun=c.manualRunId?getManualRun(c.manualRunId):null;
    const linkedSteps=linkedRun?manualJourneySteps(linkedRun.journeyId):[];
    const linkedStep=linkedRun?(linkedSteps[linkedRun.currentStepIdx]||{}):null;
    const linkedLabel=linkedRun?(linkedRun.status==='Completed'?'Completed':(linkedStep.name||linkedRun.status)):'';
    const linkedBtnLabel=linkedLabel.length>16?linkedLabel.slice(0,14)+'…':linkedLabel;
    const linkedMenuItems=linkedRun?linkedSteps.map((step,i)=>{
      const isDone=linkedRun.status==='Completed'||linkedRun.currentStepIdx>i;
      const isCurrent=linkedRun.status!=='Completed'&&linkedRun.currentStepIdx===i;
      const cls=isDone?'done':isCurrent?'current':'next';
      const ico=isDone?checkIco:(i+1);
      return '<div class="ct-act-item '+cls+'"><span class="ct-act-step '+cls+'">'+ico+'</span>'+step.name+'</div>';
    }).join(''):'';
    const actionBtn=linkedRun
      ?'<div class="ct-action-wrap">'
        +'<button class="ct-action-btn" title="'+(linkedRun.status==='Completed'?'':(linkedStep.ownerRole||''))+'" onclick="toggleCtAction('+c.id+',event)"><span>'+linkedBtnLabel+'</span>'+chevIco+'</button>'
        +'<button class="ct-dots-btn" onclick="openCtSidebar('+c.id+',\'basic-details\');event.stopPropagation()">'+dotsIco+'</button>'
        +'<div class="ct-action-menu" id="ctm-'+c.id+'">'+linkedMenuItems+'</div>'
        +'</div>'
      :'<div class="ct-action-wrap">'
        +'<button class="ct-action-btn" onclick="toggleCtAction('+c.id+',event)"><span>'+btnLabel+'</span>'+chevIco+'</button>'
        +'<button class="ct-dots-btn" onclick="openCtSidebar('+c.id+',\'basic-details\');event.stopPropagation()">'+dotsIco+'</button>'
        +'<div class="ct-action-menu" id="ctm-'+c.id+'">'+menuItems+'</div>'
        +'</div>';
    return '<tr class="ct-row'+(ctSelectedId===c.id?' lp-row-selected':'')+'" id="ct-row-'+c.id+'" style="cursor:pointer" onclick="openCtSidebar('+c.id+')">'
      +'<td style="color:#6b7280;font-size:13px">'+(ctIdx+1)+'</td>'
      +'<td style="font-weight:600;color:var(--navy)">'+c.contractId+'</td>'
      +'<td><div style="font-weight:600;color:var(--navy)">'+c.empName+'</div><div style="font-size:11px;color:#9ca3af">'+c.empDesig+'</div></td>'
      +'<td>'+c.country+'</td>'
      +'<td>'+c.type+'</td>'
      +'<td>'+ctComplianceBadge(c)+'</td>'
      +'<td style="font-size:12px;color:#64748b">'+c.date+'</td>'
      +'<td>'+ctStatusBadge(c.status)+'</td>'
      +'<td onclick="event.stopPropagation()">'+actionBtn+'</td>'
      +'</tr>';
  }).join('')||'<tr><td colspan="9" style="padding:24px;text-align:center;color:var(--gray)">No contracts match this filter.</td></tr>';
  const sbInner=ctSelectedId?renderCtSidebar():'';
  return '<div class="lp-page">'
    +'<div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:4px">'
    +'<div class="lp-filter-bar" style="flex:1;min-width:0;padding:0">'
    +'<div class="lp-filter-bar-label">Select Filter</div>'
    +'<div class="lp-filter-bar-row">'
    +apCS('ct-f-country',countries,'','All Countries')
    +apCS('ct-f-type',types,'','All Types')
    +apCS('ct-f-status',['Submitted','Quotation Approved','Proposal Sent','Proposal Approved','Contract Sent','Contract Signed','Contract Approved','Inactive'],'','All Statuses')
    +'<input class="ct-search-input" placeholder="Search by name, ID..." type="text" style="height:34px;border-radius:20px">'
    +'<button class="lp-pill-reset">Reset</button>'
    +'<button class="lp-pill-search">Search</button>'
    +'</div></div>'
    +'<div class="listing-stats">'
    +'<div class="listing-stat'+(ctQuickStatusFilter==='Proposal Sent'?' stat-selected':'')+'" onclick="ctToggleStatFilter(\'Proposal Sent\')"><div class="listing-stat-count" style="color:#7c3aed">'+proposalPending+'</div><div class="listing-stat-label">Proposal Pending</div></div>'
    +'<div class="listing-stat'+(ctQuickStatusFilter==='Contract Sent'?' stat-selected':'')+'" onclick="ctToggleStatFilter(\'Contract Sent\')"><div class="listing-stat-count" style="color:#2563eb">'+contractPending+'</div><div class="listing-stat-label">Contract Pending</div></div>'
    +'</div></div>'
    +'<div class="lp-split-wrap" style="margin-top:14px"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table"><thead><tr>'
    +'<th>S.No</th><th>Contract ID</th><th>Employee Name</th><th>Country</th><th>Type</th><th>Compliance</th><th>Date</th><th>Status</th><th style="text-align:right">Action</th>'
    +'</tr></thead><tbody>'+rows+'</tbody></table>'
    +'<div class="lp-pagination">'
    +'<span class="lp-pagination-info">Showing 1–'+filteredContracts.length+' of '+contractsData.length+' entries</span>'
    +'<div class="lp-pagination-controls">'
    +'<button class="lp-pg-btn lp-pg-arrow" disabled><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<button class="lp-pg-btn active">1</button>'
    +'<button class="lp-pg-btn lp-pg-arrow" disabled><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'</div></div>'
    +'</div></div>'
    +'<div class="lp-split-sb'+(ctSelectedId?' open':'')+'" id="ct-split-sb"><div class="lp-isb" id="ct-isb-inner">'+sbInner+'</div></div>'
    +'</div></div>';
}
function buildApplicableEmpSection(){
  const filterTypes=['Department','Designation','Branch'];
  const typeOpts=apCS('ap-filter-type',filterTypes,apFilterType,'Select Type');
  const valueOpts=apFilterType&&filterData[apFilterType]
    ?apCS('ap-filter-value',filterData[apFilterType],apFilterValue,'Select Value')
    :'<div style="height:42px;display:flex;align-items:center;padding:0 14px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;color:#b0b8c4;background:#f8fafc">Select a type first</div>';
  const filtered=getFilteredAvailEmps();
  const sel=[...selectedEmps].map(id=>empPool.find(e=>e.id===id)).filter(Boolean);
  const availHTML=filtered.length?filtered.map(e=>`<button type="button" class="employee-option" onclick="addApEmp('${e.id}')"><div><div class="employee-name">${e.name}</div><div class="employee-key">${e.key}</div></div><span class="employee-add">+</span></button>`).join(''):'<div class="empty-selection">No employees match the filter.</div>';
  const selHTML=sel.length?sel.map(e=>`<div class="lp-sb-emp-item"><div class="lp-sb-emp-avatar">${e.name[0]}</div><span class="lp-sb-emp-name">${e.name} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${e.key}</span><button type="button" class="lp-sb-emp-remove" onclick="removeApEmp('${e.id}')">&times;</button></div>`).join(''):'<div class="empty-selection">No employees added yet.</div>';
  return `<div class="policy-form-section">
    <div class="policy-section-title">Applicable Employees</div>
    <div class="ap-filter-section">
      <div class="ap-filter-row">
        <div class="ap-filter-group"><label class="ep-form-label">Assign By</label>${typeOpts}</div>
        <div class="ap-filter-second"><label class="ep-form-label">Filter Value</label>${valueOpts}</div>
        <button type="button" class="ep-save-btn ap-pill-btn" style="margin-top:18px;height:42px;min-width:80px" onclick="applyApFilter()">Apply</button>
      </div>
    </div>
    <div class="employee-picker">
      <div class="employee-picker-head">
        <span class="employee-picker-title">Employee Selection</span>
        <span class="employee-picker-count" id="ap-sel-count">${sel.length} Selected</span>
      </div>
      <div class="employee-picker-body">
        <div class="employee-list">
          <div class="employee-list-title">Available</div>
          <div id="ep-avail-emp-list">${availHTML}</div>
        </div>
        <div class="employee-selected">
          <div class="employee-list-title">Selected (${sel.length})</div>
          <div class="ep-emp-tags">${selHTML}</div>
        </div>
      </div>
    </div>
  </div>`;
}
function setApFilterType(val){apFilterType=val;apFilterValue='';renderApEmpLists();}
function applyApFilter(){renderApEmpLists();}
function getFilteredAvailEmps(){
  const already=[...selectedEmps];
  if(!apFilterType||!apFilterValue)return empPool.filter(e=>!already.includes(e.id));
  const fieldMap={Department:'dept',Designation:'desig',Branch:'branch'};
  const field=fieldMap[apFilterType];
  return empPool.filter(e=>{
    const ext=empPoolExt[e.id]||{};
    return !already.includes(e.id)&&(!field||(ext[field]||'').toLowerCase()===apFilterValue.toLowerCase());
  });
}
function renderApEmpLists(){
  const sel=[...selectedEmps].map(id=>empPool.find(e=>e.id===id)).filter(Boolean);
  const filtered=getFilteredAvailEmps();
  const avail=document.getElementById('ep-avail-emp-list');
  const selEl=document.querySelector('.employee-selected .ep-emp-tags');
  const countEl=document.getElementById('ap-sel-count');
  if(avail)avail.innerHTML=filtered.length?filtered.map(e=>`<button type="button" class="employee-option" onclick="addApEmp('${e.id}')"><div><div class="employee-name">${e.name}</div><div class="employee-key">${e.key}</div></div><span class="employee-add">+</span></button>`).join(''):'<div class="empty-selection">No employees match.</div>';
  if(selEl)selEl.innerHTML=sel.length?sel.map(e=>`<div class="lp-sb-emp-item"><div class="lp-sb-emp-avatar">${e.name[0]}</div><span class="lp-sb-emp-name">${e.name} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${e.key}</span><button type="button" class="lp-sb-emp-remove" onclick="removeApEmp('${e.id}')">&times;</button></div>`).join(''):'<div class="empty-selection">No employees added yet.</div>';
  if(countEl)countEl.textContent=sel.length+' Selected';
}
function addApEmp(id){selectedEmps.add(id);renderApEmpLists();}
function removeApEmp(id){selectedEmps.delete(id);renderApEmpLists();}
function openEditLeavePolicy(id){leaveEditId=id;page='leave-policy-edit';renderADTPage();}
function cancelAddTeam(){page='teams';renderADTPage();}
function buildAddTeamHTML(){
  const departments=['Engineering','Finance','HR','Legal','Operations','Support','Admin'];
  const roles=['Team Lead','Manager','HR Partner','Member','Approver'];
  const members=empPool.map(e=>e.name+' - '+e.key);
  return '<div class="ep-page team-form-page">'
    +'<div><button class="ep-back" onclick="cancelAddTeam()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg> Back to Team listing</button></div>'
    +'<div class="ep-header">'
    +'<div class="ep-title-wrap" style="flex-direction:column;align-items:flex-start;gap:4px"><span class="ep-title">Create New Team</span><span style="font-size:13px;color:#98a2b3">Add team details to your workforce</span></div>'
    +'</div>'
    +'<div class="ep-form-card team-form-card" style="padding:0;overflow:visible">'
    +'<div class="policy-form-section">'
    +'<div class="policy-section-title">Basic Detail</div>'
    +'<div class="policy-form-grid team-form-row">'
    +'<div class="ep-form-group"><label class="ep-form-label">Team Name <span class="req">*</span></label><input class="ep-form-input" id="team-name" type="text" placeholder="Enter team name"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Team Email ID <span class="req">*</span></label><input class="ep-form-input" id="team-email" type="email" placeholder="Enter email"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Department <span class="req">*</span><span class="team-form-links"><button type="button" class="team-form-link">+ Add Department</button><button type="button" class="team-form-link muted">Refresh</button></span></label>'
    +apCS('team-department',departments,'','Select Department')+'</div>'
    +'</div>'
    +'</div>'
    +'<hr class="team-form-divider">'
    +'<div class="policy-form-section">'
    +'<div class="team-section-head"><div class="policy-section-title">Role Assignment</div><button type="button" class="team-add-members">+ Add Members</button></div>'
    +'<div class="policy-form-grid team-form-row">'
    +'<div class="ep-form-group"><label class="ep-form-label">Member role <span class="team-help-dot">!</span></label>'+apCS('team-role',roles,'','Select')+'</div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Members name <span class="team-form-links"><button type="button" class="team-form-link">+ Add Employee</button><button type="button" class="team-form-link muted">Refresh</button></span></label>'
    +apCS('team-member',members,'','Select')+'</div>'
    +'</div>'
    +'</div>'
    +'</div>'
    +'<div class="team-form-actions"><button class="ep-cancel-btn" onclick="cancelAddTeam()">Cancel</button><button class="ep-save-btn" onclick="submitAddTeam()">Create Team</button></div>'
    +'</div>';
}
function getCSValue(id){const wrap=document.getElementById('csw-'+id);return wrap?wrap.querySelector('.cs-value').textContent.trim():'';}
function submitAddTeam(){
  const name=document.getElementById('team-name');
  const email=document.getElementById('team-email');
  const dept=getCSValue('team-department');
  if(!name||!name.value.trim()){alert('Please enter a Team Name.');name&&name.focus();return;}
  if(!email||!email.value.trim()){alert('Please enter a Team Email ID.');email&&email.focus();return;}
  if(!dept||dept==='Select Department'){alert('Please select a Department.');return;}
  const member=getCSValue('team-member');
  const rows=supportPageMeta.teams.rows;
  rows.push([rows.length+1,name.value.trim(),dept,'India',member&&member!=='Select'?'1':'0','Active']);
  page='teams';renderADTPage();
}
function buildAddLeavePolicyHTML(){
  const leaveTypes=['Casual Leave','Sick Leave','Earned Leave','Maternity Leave','Paternity Leave','Compensatory Leave'];
  return '<div class="ep-page">'
    +'<div><button class="ep-back" onclick="cancelAddPolicy()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back to Leave Policies</button></div>'
    +'<div class="ep-header">'
    +'<div class="ep-title-wrap"><span class="ep-title">Add Leave Policy</span><span style="font-size:12px;color:var(--gray);margin-left:4px">Fill in the details to create a new leave policy</span></div>'
    +'<div class="ep-actions"><button class="ep-cancel-btn" onclick="cancelAddPolicy()">Cancel</button>'
    +'<button class="ep-save-btn" onclick="submitAddLeavePolicy()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:5px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Create Policy</button>'
    +'</div></div>'
    +'<div class="ep-form-card" style="padding:0;overflow:visible">'
    +'<div class="ep-form-title" style="padding:18px 22px;margin:0;background:#fafbfc;border-bottom:1px solid var(--border)">Leave Policy Details</div>'
    +'<div class="policy-form-section">'
    +'<div class="policy-section-title">Basic Information</div>'
    +'<div class="policy-form-grid">'
    +'<div class="ep-form-group"><label class="ep-form-label">Leave Type Name <span class="req">*</span></label>'
    +apCS('ap-type',leaveTypes,'','Select leave type')+'</div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Status <span class="req">*</span></label>'
    +apCS('ap-status',['Active','Inactive'],'Active','Select Status')+'</div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Yearly Count <span class="req">*</span></label>'
    +'<input class="ep-form-input" id="ap-yearly" type="number" placeholder="e.g. 12" min="0"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Monthly Limit <span style="color:var(--gray);font-weight:400;font-size:11px">(optional)</span></label>'
    +'<input class="ep-form-input" id="ap-monthly" type="number" placeholder="e.g. 2" min="0"></div>'
    +'</div></div>'
    +'<div class="policy-form-section">'
    +'<div class="policy-section-title">Rules &amp; Accruals</div>'
    +'<div class="policy-form-grid">'
    +'<div class="ep-form-group"><label class="ep-form-label">Carry Forward Allowed <span class="req">*</span></label>'
    +apCS('ap-carry',['Yes','No'],'No','Select')+'</div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Carry Forward Limit <span style="color:var(--gray);font-weight:400;font-size:11px">(optional)</span></label>'
    +'<input class="ep-form-input" id="ap-cflimit" type="number" placeholder="e.g. 10" min="0"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Applicable During Probation <span class="req">*</span></label>'
    +apCS('ap-probation',['Yes','No'],'No','Select')+'</div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Prorate Allocation</label>'
    +apCS('ap-prorate',['Yes','No'],'No','Select')+'</div>'
    +'</div></div>'
    +buildApplicableEmpSection()
    +'</div></div>';
}
function submitAddLeavePolicy(){
  const typeWrap=document.getElementById('csw-ap-type');
  const typeVal=typeWrap?typeWrap.querySelector('.cs-value').textContent.trim():'';
  const statusWrap=document.getElementById('csw-ap-status');
  const statusVal=statusWrap?statusWrap.querySelector('.cs-value').textContent.trim():'';
  const yearly=document.getElementById('ap-yearly');
  if(!typeVal||typeVal==='Select leave type'){alert('Please select a Leave Type Name.');return;}
  if(!yearly||!yearly.value){alert('Please enter a Yearly Count.');yearly&&yearly.focus();return;}
  if(!statusVal||statusVal==='Select Status'){alert('Please select a Status.');return;}
  const newId=leavePoliciesData.length?Math.max(...leavePoliciesData.map(p=>p.id))+1:1;
  const monthly=document.getElementById('ap-monthly');
  const cflimit=document.getElementById('ap-cflimit');
  const carryWrap=document.getElementById('csw-ap-carry');
  const carryVal=carryWrap?carryWrap.querySelector('.cs-value').textContent.trim():'No';
  const probWrap=document.getElementById('csw-ap-probation');
  const probVal=probWrap?probWrap.querySelector('.cs-value').textContent.trim():'No';
  const proWrap=document.getElementById('csw-ap-prorate');
  const proVal=proWrap?proWrap.querySelector('.cs-value').textContent.trim():'No';
  const filterTypeWrap=document.getElementById('csw-ap-filter-type');
  const filterTypeVal=filterTypeWrap?filterTypeWrap.querySelector('.cs-value').textContent.trim():'';
  const filterValWrap=document.getElementById('csw-ap-filter-value');
  const filterValStr=filterValWrap?filterValWrap.querySelector('.cs-value').textContent.trim():'';
  const employees=[...selectedEmps].map(id=>{const e=empPool.find(x=>x.id===id);return e?e.name:'';}).filter(Boolean);
  leavePoliciesData.push({
    id:newId,type:typeVal,yearly:parseInt(yearly.value)||0,
    monthly:monthly&&monthly.value?parseInt(monthly.value):null,
    carryForward:cflimit&&cflimit.value?parseInt(cflimit.value):null,
    probation:probVal==='Yes',prorate:proVal==='Yes',status:statusVal,
    assignBy:filterTypeVal,assignValue:filterValStr,employees:employees
  });
  selectedEmps=new Set();apFilterType='';apFilterValue='';
  page='leave-policies';renderADTPage();
}
function buildLeavePoliciesHTML(){
  const numVal=(v)=>v!==null&&v!==undefined?'<span style="color:var(--black);font-weight:600">'+v+'</span>':'<span style="color:#9ca3af">-</span>';
  const ynCell=(v)=>'<span style="color:'+(v?'#16a34a':'#374151')+';font-weight:500">'+(v?'Yes':'No')+'</span>';
  const total=leavePoliciesData.length;
  const totalPages=Math.max(1,Math.ceil(total/LP_PAGE_SIZE));
  if(lpCurrentPage>totalPages)lpCurrentPage=totalPages;
  const start=(lpCurrentPage-1)*LP_PAGE_SIZE;
  const pageData=leavePoliciesData.slice(start,start+LP_PAGE_SIZE);
  const rows=pageData.map((p,i)=>'<tr class="lp-row'+(lpSidebarPolicyId===p.id?' lp-row-selected':'')+'" id="lp-row-'+p.id+'" onclick="openLPSidebar('+p.id+')">'
    +'<td style="color:var(--gray);font-size:13px">'+(start+i+1)+'</td>'
    +'<td style="font-weight:600;color:var(--navy)">'+p.type+'</td>'
    +'<td>'+numVal(p.yearly)+'</td>'
    +'<td>'+numVal(p.monthly)+'</td>'
    +'<td>'+numVal(p.carryForward)+'</td>'
    +'<td>'+ynCell(p.probation)+'</td>'
    +'<td>'+ynCell(p.prorate)+'</td>'
    +'<td><span class="lp-status-badge '+p.status.toLowerCase()+'">'+p.status+'</span></td>'
    +'<td><button class="lp-action-btn" title="View Details" onclick="event.stopPropagation();openLPSidebar('+p.id+')">'
    +'<svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg>'
    +'</button></td>'
    +'</tr>').join('');
  const prevArrow='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
  const nextArrow='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
  const pageButtons=Array.from({length:totalPages},(_,i)=>'<button class="lp-pg-btn'+(lpCurrentPage===i+1?' active':'')+'" onclick="lpGoToPage('+(i+1)+')">'+(i+1)+'</button>').join('');
  const pagination='<div class="lp-pagination">'
    +'<span class=”lp-pagination-info”>Showing '+(total===0?0:start+1)+'&ndash;'+Math.min(start+LP_PAGE_SIZE,total)+' of '+total+' entries</span>'
    +'<div class="lp-pagination-controls">'
    +'<button class="lp-pg-btn lp-pg-arrow" onclick="lpGoToPage('+(lpCurrentPage-1)+')" '+(lpCurrentPage===1?'disabled':'')+'>'+prevArrow+'</button>'
    +pageButtons
    +'<button class="lp-pg-btn lp-pg-arrow" onclick="lpGoToPage('+(lpCurrentPage+1)+')" '+(lpCurrentPage===totalPages?'disabled':'')+'>'+nextArrow+'</button>'
    +'</div></div>';
  const sbInner=lpSidebarPolicyId?renderLPSidebar():'';
  return '<div class="lp-page">'
    +'<div class="lp-filter-bar">'
    +'<div class="lp-filter-bar-label">Select Filter</div>'
    +'<div class="lp-filter-bar-row">'
    +apCS('lp-filter-field',['Type Name','Yearly Count','Monthly Limit'],lpFilterField,'Select')
    +apCS('lp-filter-status',['Active','Inactive'],lpFilterStatus,'Status')
    +'<button class="lp-pill-reset" onclick="resetLpFilters()">Reset</button>'
    +'<button class="lp-pill-search">Search</button>'
    +'</div></div>'
    +'<div class="lp-split-wrap">'
    +'<div class="lp-split-main">'
    +'<div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table"><thead><tr>'
    +'<th>SR. NO</th><th>TYPE NAME</th><th>YEARLY COUNT</th><th>MONTHLY LIMIT</th>'
    +'<th>CARRY FORWARD LIMIT</th><th>PROBATION ALLOWED</th><th>PRORATE</th><th>STATUS</th><th>ACTION</th>'
    +'</tr></thead><tbody>'+rows+'</tbody></table>'
    +pagination
    +'</div></div>'
    +'<div class="lp-split-sb'+(lpSidebarPolicyId?' open':'')+'" id="lp-isb">'
    +'<div class="lp-isb" id="lp-isb-inner">'+sbInner+'</div>'
    +'</div>'
    +'</div>'
  +'</div>';
}
function buildEditLeavePolicyHTML(){
  const p=leavePoliciesData.find(function(x){return x.id===leaveEditId;})||leavePoliciesData[0];
  const cfSel=(v)=>'<option'+(v?'':' selected')+'>No</option><option'+(v?' selected':'')+'>Yes</option>';
  const ynSel=(v)=>'<option'+(v?' selected':'')+'>Yes</option><option'+(!v?' selected':'')+'>No</option>';
  const stSel=(v)=>'<option'+(v==='Active'?' selected':'')+'>Active</option><option'+(v==='Inactive'?' selected':'')+'>Inactive</option>';
  return '<div class="ep-page">'
    +'<div>'
      +'<button class="ep-back" onclick="navigatePage(\'leave-policies\')">'
        +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>'
        +' Back to Leave Policies'
      +'</button>'
    +'</div>'
    +'<div class="ep-header">'
      +'<div class="ep-title-wrap"><span class="ep-title">Edit Leave Policy</span></div>'
      +'<div class="ep-actions">'
        +'<button class="ep-cancel-btn" onclick="navigatePage(\'leave-policies\')">Cancel</button>'
        +'<button class="ep-save-btn">Save Changes</button>'
      +'</div>'
    +'</div>'
    +'<div class="ep-summary-card">'
      +'<div class="ep-summary-left">'
        +'<div class="ep-summary-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="1.8" width="22" height="22"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/></svg></div>'
        +'<div>'
          +'<div class="ep-summary-name">Editing Policy: '+p.type+'</div>'
          +'<div class="ep-summary-meta">'
            +'<span>Opened from policy list</span><span class="ep-summary-sep">&#8226;</span>'
            +'<span>Type: '+p.type+'</span><span class="ep-summary-sep">&#8226;</span>'
            +'<span>Status:</span>'
            +'<span class="ep-status-pill"><span class="ep-status-dot"></span>'+p.status+'</span>'
          +'</div>'
        +'</div>'
      +'</div>'
      +'<div class="ep-stats">'
        +'<div class="ep-stat"><div class="ep-stat-label">Yearly Count</div><div class="ep-stat-val">'+p.yearly+'</div></div>'
        +'<div class="ep-stat"><div class="ep-stat-label">During Probation</div><div class="ep-stat-val green">'+(p.probation?'Yes':'No')+'</div></div>'
        +'<div class="ep-stat"><div class="ep-stat-label">Carry Forward Limit</div><div class="ep-stat-val">'+(p.carryForward||'-')+'</div></div>'
        +'<div class="ep-stat"><div class="ep-stat-label">Status</div><div class="ep-stat-val green">'+p.status+'</div></div>'
      +'</div>'
    +'</div>'
    +'<div class="ep-form-card">'
      +'<div class="ep-form-title">Leave Policy Details</div>'
      +'<div class="ep-form-grid">'
        +'<div class="ep-form-group"><label class="ep-form-label">Leave Type Name <span class="req">*</span></label><input class="ep-form-input" type="text" value="'+p.type+'"></div>'
        +'<div class="ep-form-group"><label class="ep-form-label">Carry Forward Allowed <span class="req">*</span></label><select class="ep-form-select">'+cfSel(p.carryForward)+'</select></div>'
        +'<div class="ep-form-group"><label class="ep-form-label">Yearly Count <span class="req">*</span></label><input class="ep-form-input" type="number" value="'+p.yearly+'"></div>'
        +'<div class="ep-form-group"><label class="ep-form-label">Applicable During Probation <span class="req">*</span></label><select class="ep-form-select">'+ynSel(p.probation)+'</select></div>'
        +'<div class="ep-form-group"><label class="ep-form-label">Monthly Limit</label><input class="ep-form-input" type="number" value="'+(p.monthly||'')+'"></div>'
        +'<div class="ep-form-group"><label class="ep-form-label">Carry Forward Limit</label><input class="ep-form-input" type="number" value="'+(p.carryForward||'')+'"></div>'
        +'<div class="ep-form-group"><label class="ep-form-label">Prorate Allocation</label><select class="ep-form-select"><option'+(p.prorate?'':' selected')+'>No</option><option'+(p.prorate?' selected':'')+'>Yes</option></select></div>'
        +'<div class="ep-form-group"><label class="ep-form-label">Status <span class="req">*</span></label><select class="ep-form-select">'+stSel(p.status)+'</select></div>'
        +'<div class="ep-form-group ep-form-full"><label class="ep-form-label">Applicable Employees</label>'
          +'<div class="ep-emp-search"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Search employees..."></div>'
          +'<div class="ep-emp-tags">'
            +(p.employees&&p.employees.length?p.employees.map(name=>{const emp=empPool.find(e=>e.name===name);return '<span class="ep-emp-tag">'+name+(emp?' &mdash; '+emp.key:'')+'<button title="Remove">&times;</button></span>';}).join(''):'<span style="font-size:12px;color:var(--gray);padding:4px">No employees assigned</span>')
          +'</div>'
        +'</div>'
      +'</div>'
    +'</div>'
  +'</div>';
}
// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ LP INLINE SPLIT SIDEBAR ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function openLPSidebar(id){
  lpSidebarPolicyId=id;lpSidebarTab='basic-details';lpSidebarEditMode=false;lpEmpEditMode=false;
  page='leave-policies';renderADTPage();
}
function closeLPSidebar(){
  lpSidebarPolicyId=null;lpSidebarEditMode=false;lpEmpEditMode=false;
  renderADTPage();
}
function renderLPSidebar(){
  const p=leavePoliciesData.find(x=>x.id===lpSidebarPolicyId);
  if(!p)return '<div class="lp-tab-placeholder">Policy not found.</div>';
  const tabs=[{id:'basic-details',label:'Basic Details'},{id:'employees',label:'Employees'},{id:'logs',label:'Logs'},{id:'workflow',label:'Workflow'}];
  const tabBar='<div class="lp-isb-tabbar">'
    +'<button class="lp-isb-nav-btn" onclick="scrollTabRow(\'left\',\'lp-isb-tabs\')" title="Scroll left"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<div class="lp-isb-tabs" id="lp-isb-tabs">'+tabs.map(t=>'<button class="lp-isb-tab'+(lpSidebarTab===t.id?' active':'')+'" onclick="navLPSidebar(\''+t.id+'\')">'+t.label+'</button>').join('')+'</div>'
    +'<button class="lp-isb-nav-btn nav-right" onclick="scrollTabRow(\'right\',\'lp-isb-tabs\')" title="Scroll right"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'<div class="lp-isb-right"><button class="lp-isb-close" onclick="closeLPSidebar()" title="Close"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'</div>';
  let body='';
  if(lpSidebarTab==='basic-details'){
    if(lpSidebarEditMode){
      body='<div class="lp-sb-edit-form"><div class="lp-sb-edit-section"><div class="lp-sb-form-grid">'
        +'<div class="lp-sb-field"><label>Leave Type</label><input class="ep-form-input" id="lpsb-type" value="'+p.type+'"></div>'
        +'<div class="lp-sb-field"><label>Status</label><select class="ep-form-select" id="lpsb-status">'+statusOpts(p.status)+'</select></div>'
        +'<div class="lp-sb-field"><label>Yearly Count</label><input class="ep-form-input" id="lpsb-yearly" type="number" value="'+p.yearly+'"></div>'
        +'<div class="lp-sb-field"><label>Monthly Limit</label><input class="ep-form-input" id="lpsb-monthly" type="number" value="'+(p.monthly||'')+'"></div>'
        +'<div class="lp-sb-field"><label>Carry Forward Limit</label><input class="ep-form-input" id="lpsb-cf" type="number" value="'+(p.carryForward||'')+'"></div>'
        +'<div class="lp-sb-field"><label>During Probation</label><select class="ep-form-select" id="lpsb-prob">'+yn(p.probation)+'</select></div>'
        +'<div class="lp-sb-field"><label>Prorate</label><select class="ep-form-select" id="lpsb-prorate">'+yn(p.prorate)+'</select></div>'
        +'</div><div class="lp-sb-form-actions">'
        +'<button class="ep-cancel-btn" onclick="lpSidebarEditMode=false;refreshLPSidebar()">Cancel</button>'
        +'<button class="ep-save-btn" onclick="saveLPSidebarEdit()">Save</button>'
        +'</div></div></div>';
    }else{
      const dash='<span style="color:#9ca3af;font-size:15px;font-weight:400">ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â</span>';
      const yesVal='<span style="color:#16a34a;font-weight:700">Yes</span>';
      const noVal='<span style="color:#ef4444;font-weight:700">No</span>';
      const ynVal=(v)=>v?yesVal:noVal;
      const nullOrDash=(v)=>(v!==null&&v!==undefined&&v!=='')?v:dash;
      const statusBadge='<span class="lp-status-badge '+p.status.toLowerCase()+'"><span class="lp-status-dot"></span>'+p.status+'</span>';
      // icons
      const iTag='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>';
      const iStatus='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
      const iCal='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
      const iArrow='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>';
      const iCircleNo='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>';
      const iUser='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
      const iPct='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>';
      const iFilter='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>';
      const iLayout='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>';
      const fc=(ico,label,val)=>'<div class="lp-sb-field-card"><div class="lp-sb-field-icon">'+ico+'</div><div class="lp-sb-field-content"><div class="lp-sb-field-label">'+label+'</div><div class="lp-sb-field-value">'+val+'</div></div></div>';
      body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">'+p.type+'</span>'
        +'<button class="ep-save-btn" style="padding:5px 14px;font-size:12px;display:flex;align-items:center;gap:5px" onclick="lpSidebarEditMode=true;refreshLPSidebar()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit</button></div>'
        +'<div class="lp-sb-detail-grid">'
        +fc(iTag,'Leave Type Name',p.type)
        +fc(iStatus,'Status',statusBadge)
        +fc(iCal,'Yearly Count',p.yearly)
        +fc(iCal,'Monthly Limit',nullOrDash(p.monthly))
        +fc(iArrow,'Carry Forward Limit',nullOrDash(p.carryForward))
        +fc(iCircleNo,'Carry Forward Allowed',ynVal(p.carryForward!==null&&p.carryForward!==undefined&&p.carryForward!==0))
        +fc(iUser,'Probation Allowed',ynVal(p.probation))
        +fc(iPct,'Prorate Allocation',ynVal(p.prorate))
        +(p.assignBy?fc(iFilter,'Assign By',p.assignBy):'')
        +(p.assignValue?fc(iLayout,p.assignBy||'Assigned Value',p.assignValue):'')
        +'</div>';
    }
  }else if(lpSidebarTab==='employees'){
    const emps=p.employees||[];
    if(lpEmpEditMode){
      body=lpSidebarEmpSelectorHTML(emps);
    }else{
      body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Employees</span>'
        +'<div style="display:flex;gap:8px;align-items:center"><span class="lp-sb-emp-count">'+emps.length+' assigned</span>'
        +'<button class="ep-save-btn" style="padding:6px 14px;font-size:12px" onclick="lpEmpEditMode=true;refreshLPSidebar()">Manage</button></div></div>'
        +(emps.length?'<div class="lp-sb-emp-list">'+emps.map(function(name){
          var initials=name.split(' ').map(function(w){return w[0];}).join('').toUpperCase().slice(0,2);
          return '<div class="lp-sb-emp-item"><div class="lp-sb-emp-avatar">'+initials+'</div><span class="lp-sb-emp-name">'+name+'</span><button class="lp-sb-emp-remove" onclick="removeLPEmployee(\''+name.replace(/'/g,"\\'")+'\')">&times;</button></div>';
        }).join('')+'</div>':'<div class="lp-sb-empty">No employees assigned yet.</div>');
    }
  }else if(lpSidebarTab==='logs'){
    const logs=lpLogsData[p.id]||[];
    const logStatusKey=(s)=>({Active:'active',Inactive:'inactive'}[s]||'default');
    const personSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const calSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    const clkSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    const chevSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
    const timelineHTML=logs.length
      ?'<div class="lp-logs-timeline">'+logs.map((l,i)=>{
        const sk=logStatusKey(l.status||'Updated');
        return '<div class="lp-log-row">'
          +'<div class="lp-log-avatar-col">'
          +'<div class="lp-log-avatar lp-log-avatar--'+sk+'">'+personSvg+'</div>'
          +(i<logs.length-1?'<div class="lp-log-connector"></div>':'')
          +'</div>'
          +'<div class="lp-log-card">'
          +'<div class="lp-log-status-row"><span class="lp-log-dot lp-log-dot--'+sk+'"></span><span class="lp-log-status-text lp-log-status-text--'+sk+'">'+(l.status||'Updated')+'</span></div>'
          +'<div class="lp-log-meta-row">'
          +'<span class="lp-log-meta-item">'+personSvg+'<span>'+l.user+'</span></span>'
          +(l.date?'<span class="lp-log-meta-item">'+calSvg+'<span>'+l.date+'</span></span>':'')
          +(l.time?'<span class="lp-log-meta-item">'+clkSvg+'<span>'+l.time+'</span></span>':'')
          +'</div>'
          +'<div class="lp-log-comment-row"><span class="lp-log-comment-label">Comment:</span>'+l.action+'</div>'
          +'</div>'
          +'</div>';
      }).join('')+'</div>'
      :'<div class="lp-logs-empty">No activity logs yet.</div>';
    const csk=logStatusKey(p.status||'Active');
    const formHTML='<div class="lp-logs-form">'
      +'<div class="lp-logs-form-header"><span class="lp-log-dot lp-log-dot--'+csk+'"></span>'+(p.status||'Active')+'</div>'
      +'<p class="lp-logs-form-sub">Update policy status and add a comment</p>'
      +'<div class="lp-logs-form-label">Status <span class="lp-logs-form-req">*</span></div>'
      +'<div class="lp-logs-form-sel-wrap">'
      +'<select class="lp-logs-form-select" id="lp-log-status-sel"><option value="">Select Status</option>'
      +'<option value="Active"'+(p.status==='Active'?' selected':'')+'>Active</option>'
      +'<option value="Inactive"'+(p.status==='Inactive'?' selected':'')+'>Inactive</option></select>'
      +chevSvg+'</div>'
      +'<div class="lp-logs-form-label">Comment <span class="lp-logs-form-req">*</span></div>'
      +'<textarea class="lp-logs-form-textarea" id="lp-log-comment-inp" placeholder="Enter comment"></textarea>'
      +'<button class="lp-logs-save-btn" onclick="lpSaveLog('+p.id+')">Save</button>'
      +'</div>';
    body='<div class="lp-logs-wrap">'+timelineHTML+formHTML+'</div>';
  }else if(lpSidebarTab==='workflow'){
    const wf=lpWorkflowData[p.id]||[];
    const wfPersonSvg='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const wfCalSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    body=wf.length
      ?'<div class="lp-wf-wrap">'+wf.map((w,i)=>'<div class="lp-wf-row">'
          +'<div class="lp-wf-dot-col"><div class="lp-wf-dot"></div>'+(i<wf.length-1?'<div class="lp-wf-connector"></div>':'')+'</div>'
          +'<div class="lp-wf-card">'
          +'<div class="lp-wf-title">'+w.title+'</div>'
          +'<div class="lp-wf-meta-row">'
          +'<span class="lp-wf-meta-item">'+wfPersonSvg+'<span>'+w.user+'</span></span>'
          +(w.date?'<span class="lp-wf-meta-item">'+wfCalSvg+'<span>'+w.date+'</span></span>':'')
          +(w.time?'<span class="lp-wf-meta-sep">|</span><span>'+w.time+'</span>':'')
          +'</div>'
          +'<div class="lp-wf-desc"><span class="lp-wf-desc-label">Description:</span><span class="lp-wf-desc-text">'+w.description+'</span></div>'
          +'</div>'
          +'</div>').join('')+'</div>'
      :'<div class="lp-wf-empty">No workflow configured.</div>';
  }
  return tabBar+'<div class="lp-isb-body">'+body+'</div>';
}
function refreshLPSidebar(){
  const inner=document.getElementById('lp-isb-inner');
  if(inner)inner.innerHTML=renderLPSidebar();
}
function navLPSidebar(tabId){
  lpSidebarTab=tabId;lpSidebarEditMode=false;lpEmpEditMode=false;refreshLPSidebar();
}
function saveLPSidebarEdit(){
  const p=leavePoliciesData.find(x=>x.id===lpSidebarPolicyId);if(!p)return;
  const typeEl=document.getElementById('lpsb-type');if(typeEl)p.type=typeEl.value;
  const statusEl=document.getElementById('lpsb-status');if(statusEl)p.status=statusEl.value;
  const yearlyEl=document.getElementById('lpsb-yearly');if(yearlyEl)p.yearly=parseInt(yearlyEl.value)||p.yearly;
  const monthlyEl=document.getElementById('lpsb-monthly');if(monthlyEl)p.monthly=monthlyEl.value?parseInt(monthlyEl.value):null;
  const cfEl=document.getElementById('lpsb-cf');if(cfEl)p.carryForward=cfEl.value?parseInt(cfEl.value):null;
  const probEl=document.getElementById('lpsb-prob');if(probEl)p.probation=probEl.value==='Yes';
  const proEl=document.getElementById('lpsb-prorate');if(proEl)p.prorate=proEl.value==='Yes';
  lpSidebarEditMode=false;refreshLPSidebar();
}
function removeLPEmployee(empName){
  const p=leavePoliciesData.find(x=>x.id===lpSidebarPolicyId);if(!p)return;
  p.employees=(p.employees||[]).filter(n=>n!==empName);refreshLPSidebar();
}
function lpAddEmpToPolicy(empId){
  const p=leavePoliciesData.find(x=>x.id===lpSidebarPolicyId);if(!p)return;
  const emp=empPool.find(e=>e.id===empId);if(!emp)return;
  if(!p.employees)p.employees=[];
  if(!p.employees.includes(emp.name))p.employees.push(emp.name);
  refreshLPSidebar();
}
function lpSaveLog(policyId){
  const sel=document.getElementById('lp-log-status-sel');
  const inp=document.getElementById('lp-log-comment-inp');
  if(!sel||!inp)return;
  const status=sel.value;
  const comment=inp.value.trim();
  if(!status){sel.style.borderColor='#ef4444';setTimeout(()=>{sel.style.borderColor='';},1500);return;}
  if(!comment){inp.style.borderColor='#ef4444';setTimeout(()=>{inp.style.borderColor='';},1500);return;}
  const now=new Date();
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr=now.getDate()+' '+months[now.getMonth()]+' '+now.getFullYear();
  let h=now.getHours(),m=now.getMinutes(),s=now.getSeconds();
  const ampm=h>=12?'PM':'AM';h=h%12||12;
  const timeStr=(h<10?'0'+h:h)+':'+(m<10?'0'+m:m)+':'+(s<10?'0'+s:s)+' '+ampm;
  if(!lpLogsData[policyId])lpLogsData[policyId]=[];
  lpLogsData[policyId].unshift({date:dateStr,time:timeStr,user:'Shaun Test1',status,action:comment});
  const p=leavePoliciesData.find(x=>x.id===policyId);
  if(p&&(status==='Active'||status==='Inactive'))p.status=status;
  refreshLPSidebar();
}
function lpSidebarEmpSelectorHTML(policyEmps){
  const available=empPool.filter(e=>!(policyEmps||[]).includes(e.name));
  const availHTML=available.length?available.map(e=>'<button type="button" class="lp-avail-emp-btn" onclick="lpAddEmpToPolicy(\''+e.id+'\')">'
    +'<div class="lp-ae-info"><div class="lp-ae-name">'+e.name+'</div><div class="lp-ae-key">'+e.key+'</div></div>'
    +'<span class="lp-ae-add">+</span></button>').join(''):'<div class="lp-sb-empty">All employees already added.</div>';
  const selHTML=(policyEmps||[]).length?(policyEmps||[]).map(function(name){
    var initials=name.split(' ').map(function(w){return w[0];}).join('').toUpperCase().slice(0,2);
    return '<div class="lp-sb-emp-item"><div class="lp-sb-emp-avatar">'+initials+'</div><span class="lp-sb-emp-name">'+name+'</span><button class="lp-sb-emp-remove" onclick="removeLPEmployee(\''+name.replace(/'/g,"\\'")+'\')">&times;</button></div>';
  }).join(''):'<div class="lp-sb-empty">No employees added.</div>';
  return '<div class="lp-sb-emp-edit">'
    +'<div class="lp-sb-emp-actions"><button class="ep-cancel-btn" onclick="lpEmpEditMode=false;refreshLPSidebar()">Done</button></div>'
    +'<div class="lp-sb-sel-pane"><div class="lp-sb-sel-pane-title">Available Employees</div><div class="lp-avail-emp-list">'+availHTML+'</div></div>'
    +'<div class="lp-sb-sel-pane"><div class="lp-sb-sel-pane-title">Assigned ('+((policyEmps||[]).length)+')</div><div class="lp-sb-sel-emp-list">'+selHTML+'</div></div>'
    +'</div>';
}

// ── MY TIMESHEET PAGE ──
function buildTsSidebarHTML(dateStr) {
  const att = tsAttendance[dateStr];
  const d = new Date(dateStr + 'T00:00:00');
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const mNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const label = String(d.getDate()).padStart(2,'0') + ' ' + mNames[d.getMonth()] + ' ' + d.getFullYear();
  const ci = att ? att.in : '--';
  const co = att ? att.out : '--';
  const loc = att ? att.loc : '--';
  const hrs = att ? att.hours : '0.00h';
  const src = att ? att.src : '';
  const clkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  const pinSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  const calSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const xSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  return '<div class="ts-sb-head">'
    + '<span class="ts-sb-title">Work Details</span>'
    + '<button class="ts-sb-close" onclick="tsCloseDay()">'+xSvg+'</button>'
    + '</div>'
    + '<div class="ts-sb-inner">'
    + '<div class="ts-sb-date-box">'+calSvg+'<div><div class="ts-sb-date-val">'+label+'</div><div class="ts-sb-date-day">'+dayNames[d.getDay()]+'</div></div></div>'
    + '<div class="ts-sb-section"><div class="ts-sb-sec-title"><div class="ts-sb-dot in"></div>Check In</div>'
    + '<div class="ts-sb-field">'+clkSvg+'<span class="ts-sb-flabel">Time</span><span class="ts-sb-fval">'+ci+'</span></div>'
    + '<div class="ts-sb-field">'+pinSvg+'<span class="ts-sb-flabel">Location</span><span class="ts-sb-fval">'+loc+'</span></div>'
    + '</div>'
    + '<div class="ts-sb-section"><div class="ts-sb-sec-title"><div class="ts-sb-dot out"></div>Check Out</div>'
    + '<div class="ts-sb-field">'+clkSvg+'<span class="ts-sb-flabel">Time</span><span class="ts-sb-fval">'+co+'</span></div>'
    + '<div class="ts-sb-field">'+pinSvg+'<span class="ts-sb-flabel">Location</span><span class="ts-sb-fval">'+loc+'</span></div>'
    + '</div>'
    + '<div class="ts-sb-total"><span class="ts-sb-total-label">Total Hours</span><span class="ts-sb-total-val">'+(hrs==='--'?'0.00h':hrs)+'</span></div>'
    + (src ? '<div class="ts-sb-src">Source: <b>'+src+'</b></div>' : '')
    + '<div class="ts-sb-actions"><button class="ts-sb-submit">Submit for Approval</button></div>'
    + '</div>';
}

function buildMyTimesheetHTML() {
  const y = tsMonth.year, m = tsMonth.month;
  const mNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const mShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mName = mNames[m];
  const firstDay = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const todayStr = '2026-06-24';
  const todayDate = new Date(2026, 5, 24);

  // Mon-based offset for first day (0=Mon ... 6=Sun)
  let startDow = firstDay.getDay();
  const monOff = (startDow === 0) ? 6 : startDow - 1;

  // Stats calc
  const attVals = Object.values(tsAttendance);
  const presentCount = attVals.filter(a => a.status === 'present').length;
  const totalHoursNum = attVals.filter(a => a.status === 'present').reduce((s, a) => s + parseFloat(a.hours), 0);

  // ── Filter bar ──
  const filterBar = '<div class="ts-filter-bar">'
    + '<span class="ts-filter-label">Select Filters</span>'
    + '<button class="ts-date-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>1 '+mShort[m]+' '+y+' – '+daysInMonth+' '+mShort[m]+' '+y+' <svg class="ts-date-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></button>'
    + '<button class="ts-btn-reset">Reset</button>'
    + '<button class="ts-btn-search">Search</button>'
    + '</div>';

  // ── User bar ──
  const userBar = '<div class="ts-user-bar">'
    + '<div class="ts-user-left"><div class="ts-user-av">'+tsEmp.initials+'</div>'
    + '<div><div class="ts-user-name">'+tsEmp.name+'</div><div class="ts-user-role">'+tsEmp.role+'</div></div></div>'
    + '<div class="ts-user-right">'
    + '<button class="ts-refresh-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg></button>'
    + '<button class="ts-month-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'+mName+' '+y+'<svg class="ts-date-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></button>'
    + '</div></div>';

  // ── Stats ──
  const statsHtml = '<div class="ts-stats">'
    + '<div class="ts-stat-card"><div class="ts-stat-top"><span class="ts-stat-label">Total Working Hours</span><div class="ts-stat-ico" style="background:#eff6ff"><svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div></div><div class="ts-stat-val">'+presentCount+'</div><div class="ts-stat-sub">'+mName+' '+y+'</div><div class="ts-stat-vs pos">+'+presentCount+' days vs last month</div></div>'
    + '<div class="ts-stat-card"><div class="ts-stat-top"><span class="ts-stat-label">Leaves Taken</span><div class="ts-stat-ico" style="background:#f1f5f9"><svg viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div></div><div class="ts-stat-val">0</div><div class="ts-stat-sub">No leaves taken</div><div class="ts-stat-vs neu">+0 days vs last month</div></div>'
    + '<div class="ts-stat-card"><div class="ts-stat-top"><span class="ts-stat-label">Total Hours</span><div class="ts-stat-ico" style="background:#f0fdf4"><svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div></div><div class="ts-stat-val">'+totalHoursNum.toFixed(0)+'h</div><div class="ts-stat-sub">8h average/day</div><div class="ts-stat-vs pos">+0% vs last month</div></div>'
    + '<div class="ts-stat-card"><div class="ts-stat-top"><span class="ts-stat-label">Overtime</span><div class="ts-stat-ico" style="background:#faf5ff"><svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div></div><div class="ts-stat-val">0h</div><div class="ts-stat-sub">'+mName+' '+y+'</div><div class="ts-stat-vs neu">+0h vs last month</div></div>'
    + '</div>';

  // ── Calendar ──
  const eyeSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  let calRows = '';
  const totalWeeks = Math.ceil((monOff + daysInMonth) / 7);

  for (let w = 0; w < totalWeeks; w++) {
    calRows += '<div class="ts-cal-row">';
    calRows += '<div class="ts-week-cell"><span class="ts-wk-label">Week '+(w+1)+'</span><input type="checkbox" class="ts-wk-cb"></div>';
    for (let col = 0; col < 7; col++) {
      const dayNum = w * 7 + col + 1 - monOff;
      const isWe = col >= 5;
      if (dayNum < 1 || dayNum > daysInMonth) {
        calRows += '<div class="ts-day-cell ts-empty'+(isWe?' we':'')+'"></div>';
        continue;
      }
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(dayNum).padStart(2, '0');
      const dateStr = y + '-' + mm + '-' + dd;
      const isToday = dateStr === todayStr;
      const isFuture = new Date(y, m, dayNum) > todayDate;
      const att = tsAttendance[dateStr];
      const isSel = tsSelectedDay === dateStr;

      let cellCls = 'ts-day-cell';
      if (isWe) cellCls += ' we';
      if (isToday) cellCls += ' is-today';
      if (isSel) cellCls += ' is-selected';
      if (isFuture) cellCls += ' future';

      const clickH = (!isWe && !isFuture) ? ' onclick="tsOpenDay(\''+dateStr+'\')"' : '';

      let pillHtml = '';
      let hrsHtml = '';
      let viewHtml = '';
      let srcHtml = '';

      if (isWe) {
        pillHtml = '<span class="ts-day-pill we">Weekend</span>';
      } else if (isFuture) {
        pillHtml = '';
      } else if (att) {
        const pillCls = att.status === 'inprog' ? 'inprog' : att.status === 'present' ? 'present' : 'absent';
        const pillLabel = att.status === 'inprog' ? 'In Progress' : att.status === 'present' ? 'Present' : 'Absent';
        pillHtml = '<span class="ts-day-pill '+pillCls+'">'+pillLabel+'</span>';
        if (att.hours !== '--') hrsHtml = '<span class="ts-day-hrs">'+att.hours+'</span>';
        viewHtml = '<span class="ts-day-view-btn">'+eyeSvg+'View</span>';
        srcHtml = '<span class="ts-day-src">'+att.src+'</span>';
      } else {
        pillHtml = '<span class="ts-day-pill absent">Absent</span>';
      }

      calRows += '<div class="'+cellCls+'"'+clickH+'>'
        + '<span class="ts-day-num'+(isToday?' today':'')+'">'+(isToday?'<span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:var(--orange);border-radius:50%;color:#fff;font-size:12px">'+dd+'</span>':dd)+'</span>'
        + pillHtml
        + hrsHtml
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto">'
        + viewHtml + srcHtml
        + '</div>'
        + '</div>';
    }
    calRows += '</div>';
  }

  const calHtml = '<div class="ts-cal-card">'
    + '<div class="ts-cal-head">'
    + '<div class="ts-cal-title">'+mName+' '+y+' <span class="ts-inprog">In Progress</span></div>'
    + '<div class="ts-cal-legend">'
    + '<div class="ts-leg-item"><div class="ts-leg-dot" style="background:#22c55e"></div>Present ('+presentCount+')</div>'
    + '<div class="ts-leg-item"><div class="ts-leg-dot" style="background:#ef4444"></div>Absent</div>'
    + '<div class="ts-leg-item"><div class="ts-leg-dot" style="background:#f59e0b"></div>Leave</div>'
    + '<div class="ts-leg-item"><div class="ts-leg-dot" style="background:#e2e8f0"></div>Weekend</div>'
    + '</div></div>'
    + '<div class="ts-col-hdrs"><div class="ts-col-hdr"></div><div class="ts-col-hdr">MON</div><div class="ts-col-hdr">TUE</div><div class="ts-col-hdr">WED</div><div class="ts-col-hdr">THU</div><div class="ts-col-hdr">FRI</div><div class="ts-col-hdr we">SAT</div><div class="ts-col-hdr we">SUN</div></div>'
    + calRows
    + '</div>';

  // ── Fixed overlay sidebar ──
  const overlayHTML = tsSelectedDay
    ? '<div class="ts-overlay">'
      + '<div class="ts-overlay-bg" onclick="tsCloseDay()"></div>'
      + '<div class="ts-overlay-panel">'+buildTsSidebarHTML(tsSelectedDay)+'</div>'
      + '</div>'
    : '';

  return '<div class="ts-main">'
    + filterBar
    + userBar
    + statsHtml
    + calHtml
    + '<div class="ts-footer"><button class="ts-submit-btn">Submit for Approval</button></div>'
    + '</div>'
    + overlayHTML;
}
// ── ALL TIMESHEET PAGE ──
function atToggleTsFilter(v){
  atTsQuickFilter=v===''?'':(atTsQuickFilter===v?'':v);
  renderADTPage();
}
function buildAllTimesheetHTML(){
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const data=allTsData;
  const unfilled=data.filter(d=>d.tsStatus==='Unfilled').length;
  const filled=data.filter(d=>d.tsStatus==='Filled').length;
  const total=data.length;

  const calIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const listIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>';
  const prevSvg='<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>';
  const nextSvg='<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>';

  // Filter bar
  const filterBar='<div class="at-top">'
    +'<div class="lp-filter-bar" style="flex:1;min-width:0;padding:0">'
    +'<div class="lp-filter-bar-label">Select Filter</div>'
    +'<div class="lp-filter-bar-row">'
    +apCS('at-f-status',['Active','Inactive','All'],'','Status')
    +apCS('at-f-admin',['Admin Name'],'','Admin Name')
    +apCS('at-f-ts',['Unfilled','Filled','All'],'','Timesheet Status')
    +apCS('at-f-month',months,'Jun','Month')
    +'<button class="lp-pill-reset">Reset</button>'
    +'<button class="lp-pill-search">Search</button>'
    +'</div></div>'
    +'<div class="listing-stats">'
    +'<div class="listing-stat'+(atTsQuickFilter==='Unfilled'?' stat-selected':'')+'" onclick="atToggleTsFilter(\'Unfilled\')"><div class="listing-stat-count" style="color:#b45309">'+unfilled+'</div><div class="listing-stat-label">Unfilled</div></div>'
    +'<div class="listing-stat'+(atTsQuickFilter==='Filled'?' stat-selected':'')+'" onclick="atToggleTsFilter(\'Filled\')"><div class="listing-stat-count" style="color:#0d9488">'+filled+'</div><div class="listing-stat-label">Filled</div></div>'
    +'<div class="listing-stat'+(atTsQuickFilter===''?' stat-selected':'')+'" onclick="atToggleTsFilter(\'\')"><div class="listing-stat-count" style="color:var(--navy)">'+total+'</div><div class="listing-stat-label">Total</div></div>'
    +'</div>'
    +'</div>';

  // Table rows
  let rows='';
  const filteredTs=atTsQuickFilter?data.filter(function(d){return d.tsStatus===atTsQuickFilter;}):data;
  filteredTs.forEach(function(emp){
    const empBadge=emp.empStatus==='Active'
      ?'<span class="at-badge-active">Active</span>'
      :'<span class="at-badge-inactive">Inactive</span>';
    const tsBadge=emp.tsStatus==='Filled'
      ?'<span class="at-badge-filled">Filled</span>'
      :'<span class="at-badge-unfilled">Unfilled</span>';
    rows+='<tr class="at-tr">'
      +'<td class="at-td"><span class="at-sno">'+emp.id+'</span></td>'
      +'<td class="at-td"><span class="at-emp-id">'+emp.empId+'</span></td>'
      +'<td class="at-td"><span class="at-emp-name">'+emp.name+'</span></td>'
      +'<td class="at-td">'+emp.country+'</td>'
      +'<td class="at-td">'+empBadge+'</td>'
      +'<td class="at-td">'+tsBadge+'</td>'
      +'<td class="at-td"><div class="at-actions">'
      +'<button class="at-act-btn" title="View Calendar" onclick="atViewCalendar(\''+emp.empId+'\',\''+emp.name+'\',\''+emp.initials+'\',\''+emp.role+'\')">'+calIco+'</button>'
      +'<button class="at-act-btn" title="View Details">'+listIco+'</button>'
      +'</div></td>'
      +'</tr>';
  });

  const table='<div class="at-card">'
    +'<table class="at-table">'
    +'<thead><tr>'
    +'<th class="at-th">S. No</th>'
    +'<th class="at-th">Employee ID</th>'
    +'<th class="at-th">Name</th>'
    +'<th class="at-th">Country</th>'
    +'<th class="at-th">Employee Status</th>'
    +'<th class="at-th">Timesheet Status</th>'
    +'<th class="at-th">Action</th>'
    +'</tr></thead>'
    +'<tbody>'+rows+'</tbody>'
    +'</table>'
    +'<div class="at-pagination">'
    +'<button class="at-pg-arr">'+prevSvg+'</button>'
    +'<button class="at-pg-btn active">1</button>'
    +'<button class="at-pg-arr">'+nextSvg+'</button>'
    +'</div>'
    +'</div>';

  return filterBar+table;
}

// ── AGENT MODE GRADIENT ──
let _amRaf=null,_amRenderer=null,_amResizeFn=null;
function stopAmThreeJS(){
  if(_amRaf){cancelAnimationFrame(_amRaf);_amRaf=null;}
  if(_amResizeFn){window.removeEventListener('resize',_amResizeFn);_amResizeFn=null;}
  if(_amRenderer){try{_amRenderer.dispose();}catch(e){} _amRenderer=null;}
}
function initAmThreeJS(){
  if(!document.getElementById('am-webgl-canvas'))return;
  if(window.THREE){_startAmThreeJS();return;}
  const s=document.createElement('script');
  s.src='https://unpkg.com/three@0.134.0/build/three.min.js';
  s.onload=function(){if(document.getElementById('am-webgl-canvas'))_startAmThreeJS();};
  s.onerror=function(){console.warn('Three.js CDN unavailable');};
  document.head.appendChild(s);
}
function _startAmThreeJS(){
  const canvas=document.getElementById('am-webgl-canvas');
  if(!canvas||!window.THREE)return;
  stopAmThreeJS();
  const w=canvas.offsetWidth||window.innerWidth;
  const h=canvas.offsetHeight||window.innerHeight;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:false,alpha:false});
  renderer.setSize(w,h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.autoClear=false;
  _amRenderer=renderer;
  // Single ortho scene — full-screen soft warm plasma
  const scene=new THREE.Scene();
  const cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const AM_FS=`
uniform vec2 u_res;
uniform float u_t;
float rng(vec2 s){return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453);}
vec3 m3(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 m4(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return m4(((x*34.)+1.)*x);}
vec4 tinv(vec4 r){return 1.7928429-0.8537347*r;}
float sn(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=m3(i);
  vec4 p=perm(perm(perm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n=.142857;vec3 ns=n*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 xs=x_*ns.x+ns.yyyy;vec4 ys=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(xs)-abs(ys);
  vec4 b0=vec4(xs.xy,ys.xy);vec4 b1=vec4(xs.zw,ys.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 nr=tinv(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=nr.x;p1*=nr.y;p2*=nr.z;p3*=nr.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
void main(){
  vec2 r=u_res;vec2 FC=gl_FragCoord.xy;
  vec2 p=(FC*2.-r)/r.y;vec2 lv=vec2(0.);
  lv.x+=abs(.5-dot(p,p))*.35;
  vec2 v=p*(1.-lv.x)/2.8;
  v+=vec2(sn(vec3(p*1.5,u_t*.07))*.4,sn(vec3(p*1.5+8.,u_t*.07))*.28);
  vec4 o=vec4(0.);
  for(float i=0.;i<10.;i++){
    float idx=i+1.;
    v+=cos(v.yx*idx+vec2(0.,idx)+u_t)/idx+3.5;
    o+=(sin(vec4(v.x,v.y,v.y,v.x))+1.)*abs(v.x-v.y)*.09;
  }
  o=o.wxyz*.85+o*.15;
  vec4 ep=exp(p.y*vec4(-.3,-.6,.15,0.));
  float el=exp(-1.2*lv.x);
  vec4 rt=ep*el/max(o,vec4(.001));
  vec4 e2=exp(clamp(2.*rt,-12.,12.));
  o=(e2-1.)/(e2+1.);
  o=clamp(o,0.,1.);
  // Soft warm light palette — very subtle aurora on near-white
  vec3 warm=vec3(1.,.965,.93);
  vec3 cool=vec3(.945,.945,1.);
  vec3 base=vec3(.975,.975,.99);
  vec3 c=mix(base,warm,o.r*.28);
  c=mix(c,cool,o.b*.18);
  c+=vec3(o.r*.012,0.,o.b*.008);
  c=clamp(c,.89,1.);
  gl_FragColor=vec4(c,1.);
}`;
  const mat=new THREE.ShaderMaterial({
    uniforms:{u_res:{value:new THREE.Vector2(w,h)},u_t:{value:0.}},
    vertexShader:'void main(){gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:AM_FS,
    depthWrite:false,depthTest:false
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat));
  _amResizeFn=function(){
    if(!document.getElementById('am-webgl-canvas')){stopAmThreeJS();return;}
    var c2=document.getElementById('am-webgl-canvas');
    var nw=c2.offsetWidth||window.innerWidth,nh=c2.offsetHeight||window.innerHeight;
    renderer.setSize(nw,nh);
    mat.uniforms.u_res.value.set(nw,nh);
  };
  window.addEventListener('resize',_amResizeFn);
  var t=0;
  function animate(){
    if(!document.getElementById('am-webgl-canvas')){stopAmThreeJS();return;}
    _amRaf=requestAnimationFrame(animate);
    t+=.006;
    mat.uniforms.u_t.value=t;
    renderer.clear();
    renderer.render(scene,cam);
  }
  animate();
}

// ── SWITCH ENTITY PAGE ──
let _seRaf=null,_seRenderer=null,_seResizeFn=null;
function stopSeThreeJS(){
  if(_seRaf){cancelAnimationFrame(_seRaf);_seRaf=null;}
  if(_seResizeFn){window.removeEventListener('resize',_seResizeFn);_seResizeFn=null;}
  if(_seRenderer){try{_seRenderer.dispose();}catch(e){}; _seRenderer=null;}
}
function initSeThreeJS(){
  if(!document.getElementById('se-webgl-canvas'))return;
  if(window.THREE){_startSeThreeJS();return;}
  const s=document.createElement('script');
  s.src='https://unpkg.com/three@0.134.0/build/three.min.js';
  s.onload=function(){if(document.getElementById('se-webgl-canvas'))_startSeThreeJS();};
  s.onerror=function(){console.warn('Three.js CDN unavailable');};
  document.head.appendChild(s);
}
function _startSeThreeJS(){
  const canvas=document.getElementById('se-webgl-canvas');
  if(!canvas||!window.THREE)return;
  stopSeThreeJS();
  const w=window.innerWidth,h=window.innerHeight;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
  renderer.setSize(w,h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.autoClear=false;
  _seRenderer=renderer;
  // Background — orthographic full-screen plasma shader (ported from liquid-logo)
  const bgScene=new THREE.Scene();
  const bgCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const PLASMA_FS=`
uniform vec2 u_res;
uniform float u_t;
float rng(vec2 s){return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453);}
vec3 m3(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 m4(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return m4(((x*34.)+1.)*x);}
vec4 tinv(vec4 r){return 1.7928429-0.8537347*r;}
float sn(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=m3(i);
  vec4 p=perm(perm(perm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n=.142857;vec3 ns=n*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 xs=x_*ns.x+ns.yyyy;vec4 ys=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(xs)-abs(ys);
  vec4 b0=vec4(xs.xy,ys.xy);vec4 b1=vec4(xs.zw,ys.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 nr=tinv(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=nr.x;p1*=nr.y;p2*=nr.z;p3*=nr.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
void main(){
  vec2 r=u_res;vec2 FC=gl_FragCoord.xy;
  vec2 p=(FC*2.-r)/r.y;vec2 lv=vec2(0.);
  lv.x+=abs(.5-dot(p,p))*.4;
  vec2 v=p*(1.-lv.x)/2.2;
  v+=vec2(sn(vec3(p*1.8,u_t*.12))*.5,sn(vec3(p*1.8+10.,u_t*.12))*.35);
  vec4 o=vec4(0.);
  for(float i=0.;i<12.;i++){
    float idx=i+1.;
    v+=cos(v.yx*idx+vec2(0.,idx)+u_t)/idx+3.5;
    o+=(sin(vec4(v.x,v.y,v.y,v.x))+1.)*abs(v.x-v.y)*.11;
  }
  o=o.wxyz*.9+o*.1;
  vec4 ep=exp(p.y*vec4(-.4,-.7,.2,0.));
  float el=exp(-1.4*lv.x);
  vec4 rt=ep*el/max(o,vec4(.001));
  vec4 e2=exp(clamp(2.*rt,-15.,15.));
  o=(e2-1.)/(e2+1.);
  float gn=rng(FC/1.5+u_t*.0004)*.05-.025;
  o=clamp(o+gn,0.,1.);
  vec3 c=o.rgb*.38;
  c=mix(c,vec3(c.b*.3,c.g*.2,c.b*.9),.55);
  c+=vec3(.015,.008,.045);
  gl_FragColor=vec4(c,1.);
}`;
  const bgMat=new THREE.ShaderMaterial({
    uniforms:{u_res:{value:new THREE.Vector2(w,h)},u_t:{value:0.}},
    vertexShader:'void main(){gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:PLASMA_FS,
    depthWrite:false,depthTest:false
  });
  bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),bgMat));
  // Foreground — perspective scene with floating wireframe geometric patterns
  const fgScene=new THREE.Scene();
  const fgCam=new THREE.PerspectiveCamera(60,w/h,0.1,100);
  fgCam.position.z=5;
  const objs=[];
  // EdgesGeometry + LineSegments → clean architectural wireframe aesthetic
  const cfgs=[
    {geo:new THREE.IcosahedronGeometry(.75,1),x:-3.2,y:2,z:-.5,c:0xe0e7ff,op:.45,sp:.006},
    {geo:new THREE.TorusKnotGeometry(.55,.17,80,8),x:3.1,y:1.6,z:-.3,c:0xa5b4fc,op:.55,sp:.009},
    {geo:new THREE.IcosahedronGeometry(.5,0),x:-2,y:-2.2,z:.2,c:0xffffff,op:.32,sp:.005},
    {geo:new THREE.TorusGeometry(.52,.17,20,64),x:2.6,y:-1.6,z:-.3,c:0xc7d2fe,op:.42,sp:.008},
    {geo:new THREE.OctahedronGeometry(.6),x:.4,y:2.8,z:-.8,c:0xffffff,op:.38,sp:.007},
  ];
  cfgs.forEach(function(cfg){
    var edges=new THREE.EdgesGeometry(cfg.geo);
    var mat=new THREE.LineBasicMaterial({color:cfg.c,transparent:true,opacity:cfg.op});
    var mesh=new THREE.LineSegments(edges,mat);
    mesh.position.set(cfg.x,cfg.y,cfg.z);
    mesh.userData={sp:cfg.sp,iy:cfg.y};
    fgScene.add(mesh);objs.push(mesh);
  });
  _seResizeFn=function(){
    if(!document.getElementById('se-webgl-canvas')){stopSeThreeJS();return;}
    var nw=window.innerWidth,nh=window.innerHeight;
    fgCam.aspect=nw/nh;fgCam.updateProjectionMatrix();
    renderer.setSize(nw,nh);
    bgMat.uniforms.u_res.value.set(nw,nh);
  };
  window.addEventListener('resize',_seResizeFn);
  var t=0;
  function animate(){
    if(!document.getElementById('se-webgl-canvas')){stopSeThreeJS();return;}
    _seRaf=requestAnimationFrame(animate);
    t+=.012;
    bgMat.uniforms.u_t.value=t;
    objs.forEach(function(obj,i){
      obj.rotation.x+=obj.userData.sp;
      obj.rotation.y+=obj.userData.sp*1.4;
      obj.position.y=obj.userData.iy+Math.sin(t*.45+i*1.1)*.35;
    });
    renderer.clear();
    renderer.render(bgScene,bgCam);
    renderer.clearDepth();
    renderer.render(fgScene,fgCam);
  }
  animate();
}
function selectSwitchEntity(id){
  seSelectedEntity=id;
  document.querySelectorAll('.se-entity-card').forEach(c=>c.classList.toggle('selected',c.dataset.id===id));
}
function proceedSwitchEntity(){
  const e=entitiesData.find(x=>x.id===seSelectedEntity);
  if(!e)return;
  navigatePage('dashboard');
}
function toggleSeDropdown(){
  const panel=document.getElementById('se-dd-panel');
  if(panel)panel.classList.toggle('open');
}
function pickSeEntity(id){
  seSelectedEntity=id;
  const e=entitiesData.find(x=>x.id===id);
  const trigger=document.getElementById('se-dd-trigger');
  if(trigger&&e){
    trigger.innerHTML='<div class="se-dd-sel-initials" style="background:'+
      (e.active?'linear-gradient(135deg,var(--orange),#f97316)':'linear-gradient(135deg,#6366f1,#818cf8)')+'">'+e.initials+'</div>'+
      '<span class="se-dd-sel-name">'+e.name+'</span>'+
      '<svg class="se-dd-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';
  }
  const panel=document.getElementById('se-dd-panel');
  if(panel)panel.classList.remove('open');
}
function buildSwitchEntityHTML(){
  const chevIco='<svg class="se-dd-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>';
  const checkIco='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
  const switchIco='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
  const sel=entitiesData.find(e=>e.id===seSelectedEntity)||entitiesData[0];
  const triggerHTML='<div class="se-dd-sel-initials" style="background:'+(sel.active?'linear-gradient(135deg,var(--orange),#f97316)':'linear-gradient(135deg,#6366f1,#818cf8)')+'">'+sel.initials+'</div><span class="se-dd-sel-name">'+sel.name+'</span>'+chevIco;
  const optionItems=entitiesData.map(e=>`
    <div class="se-dd-option${seSelectedEntity===e.id?' active':''}" onclick="pickSeEntity('${e.id}')">
      <div class="se-dd-opt-initials" style="background:${e.active?'linear-gradient(135deg,var(--orange),#f97316)':'linear-gradient(135deg,#6366f1,#818cf8)'}">${e.initials}</div>
      <div class="se-dd-opt-info">
        <div class="se-dd-opt-name">${e.name} ${e.active?'<span class="se-dd-curr">Current</span>':''}</div>
        <div class="se-dd-opt-sub">${e.entityId} &nbsp;·&nbsp; ${e.type}</div>
      </div>
      ${seSelectedEntity===e.id?'<div class="se-dd-check">'+checkIco+'</div>':''}
    </div>`).join('');
  return `<div class="se-page">
    <div class="se-min-bg"></div>
    <div class="se-center se-min-card">
      <div class="se-icon-wrap">${switchIco}</div>
      <h2 class="se-title">Switch Entity</h2>
      <p class="se-subtitle">Financial transactions will be filtered as per the selected entity.</p>
      <div class="se-dd-wrap">
        <div class="se-dd-trigger" id="se-dd-trigger" onclick="toggleSeDropdown()">${triggerHTML}</div>
        <div class="se-dd-panel" id="se-dd-panel">${optionItems}</div>
      </div>
      <div class="se-btns">
        <button class="se-cancel" onclick="navigatePage('dashboard')">Cancel</button>
        <button class="se-proceed" onclick="proceedSwitchEntity()">Proceed</button>
      </div>
    </div>
  </div>`;
}

// ── MY PROFILE PAGE ──
function setProfTab(tab){profTab=tab;const el=document.getElementById('adt-content');if(el)el.innerHTML=buildMyProfileHTML();}

function buildMyProfileHTML(){
  const iUser='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const iMail='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  const iPhone='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.2.73.43 1.44.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.9-.87a2 2 0 0 1 2.11-.45c1.37.27 2.08.5 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
  const iShield='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
  const iGlobe='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
  const iCal='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const iLock='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  const iEdit='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  const iKey='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>';
  const iBell='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
  const iCheck='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
  const iPaperclip='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>';
  const iUpload='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';
  const iBank='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>';
  const iHash='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>';
  const iDl='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

  const fc=(ico,label,val)=>`<div class="prof-field"><div class="prof-field-icon">${ico}</div><div class="prof-field-body"><div class="prof-field-label">${label}</div><div class="prof-field-val">${val}</div></div></div>`;

  const profTabs=[
    {id:'basic-details',label:'Basic Details'},
    {id:'bank-details',label:'Bank Details'},
    {id:'attachments',label:'Attachments'},
    {id:'salary-slip',label:'Salary Slip'},
    {id:'change-password',label:'Change Password'},
  ];
  const tabBar=`<div class="prof-tab-bar">${profTabs.map(t=>`<button class="prof-tab${profTab===t.id?' active':''}" onclick="setProfTab('${t.id}')">${t.label}</button>`).join('')}</div>`;

  const heroCard=`
    <div class="prof-hero-card">
      <div class="prof-avatar-wrap">
        <div class="prof-avatar">PP</div>
        <div class="prof-avatar-badge">${iCheck}</div>
      </div>
      <div class="prof-hero-info">
        <div class="prof-hero-name">Pallavi Parate</div>
        <div class="prof-hero-role"><span class="prof-role-badge">Admin</span><span class="prof-hero-entity"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Dhi Hyperlocal</span></div>
        <div class="prof-hero-meta">Last login: Today, 9:41 AM &nbsp;·&nbsp; Member since Jan 2024</div>
      </div>
      <button class="ep-save-btn prof-edit-btn">${iEdit} Edit Profile</button>
    </div>`;

  let tabContent='';

  if(profTab==='basic-details'){
    const activities=[
      {action:'Logged in',time:'Today, 9:41 AM'},
      {action:'Updated leave policy — Casual Leave',time:'Yesterday, 3:15 PM'},
      {action:'Added contract for Antar Testemp',time:'Jun 24, 11:02 AM'},
      {action:'Approved payroll for Jun 2026',time:'Jun 22, 9:00 AM'},
      {action:'Created new team — Engineering',time:'Jun 20, 2:30 PM'},
    ];
    const notifRows=[
      {label:'Contract updates',desc:'Notify when a contract status changes',on:true},
      {label:'Payroll processed',desc:'Notify when payroll run is completed',on:true},
      {label:'Leave requests',desc:'Notify on new leave approvals or rejections',on:false},
      {label:'System alerts',desc:'Critical platform and security alerts',on:true},
    ];
    const toggle=(on)=>`<div class="prof-toggle${on?' on':''}"></div>`;
    tabContent=`<div class="prof-body">
      <div class="prof-left">
        <div class="ep-form-card">
          <div class="prof-section-hdr"><span class="policy-section-title">Personal Information</span></div>
          <div class="prof-field-grid">
            ${fc(iUser,'Full Name','Pallavi Parate')}
            ${fc(iMail,'Email Address','pallavi@dhihyperlocal.com')}
            ${fc(iPhone,'Phone Number','+91 98765 43210')}
            ${fc(iGlobe,'Country','India')}
            ${fc(iCal,'Date of Birth','15 Mar 1990')}
            ${fc(iUser,'Gender','Female')}
          </div>
        </div>
        <div class="ep-form-card">
          <div class="prof-section-hdr"><span class="policy-section-title">Work Details</span></div>
          <div class="prof-field-grid">
            ${fc(iShield,'Role','Admin')}
            ${fc(iUser,'Department','Human Resources')}
            ${fc(iGlobe,'Entity','Dhi Hyperlocal')}
            ${fc(iCal,'Joined','01 Jan 2024')}
            ${fc(iUser,'Employee ID','EMP-00211')}
            ${fc(iUser,'Reports To','Rahul Mehta')}
          </div>
        </div>
        <div class="ep-form-card">
          <div class="prof-section-hdr"><span class="policy-section-title">Security</span></div>
          <div class="prof-field-grid">
            ${fc(iLock,'Password','••••••••••  <span style="font-size:11px;color:var(--orange);cursor:pointer;font-weight:600;margin-left:6px">Change</span>')}
            ${fc(iKey,'Two-Factor Auth','<span style="color:#16a34a;font-weight:600;font-size:12px">Enabled</span>')}
            ${fc(iCal,'Last Password Change','15 May 2026')}
            ${fc(iShield,'Active Sessions','<span style="font-size:12px">1 device &nbsp;<span style="color:var(--orange);cursor:pointer;font-weight:600">Manage</span></span>')}
          </div>
        </div>
      </div>
      <div class="prof-right">
        <div class="ep-form-card prof-stats-card">
          <div class="prof-section-hdr"><span class="policy-section-title">Activity Overview</span></div>
          <div class="prof-stats-grid">
            <div class="prof-stat"><div class="prof-stat-num" style="color:var(--orange)">24</div><div class="prof-stat-lbl">Contracts Managed</div></div>
            <div class="prof-stat"><div class="prof-stat-num" style="color:#16a34a">8</div><div class="prof-stat-lbl">Policies Configured</div></div>
            <div class="prof-stat"><div class="prof-stat-num" style="color:#2563eb">142</div><div class="prof-stat-lbl">Actions This Month</div></div>
            <div class="prof-stat"><div class="prof-stat-num" style="color:#7c3aed">3</div><div class="prof-stat-lbl">Teams Managed</div></div>
          </div>
        </div>
        <div class="ep-form-card">
          <div class="prof-section-hdr"><span class="policy-section-title">Notification Preferences</span>${iBell}</div>
          <div class="prof-notif-list">
            ${notifRows.map(n=>`<div class="prof-notif-row"><div><div class="prof-notif-label">${n.label}</div><div class="prof-notif-desc">${n.desc}</div></div>${toggle(n.on)}</div>`).join('')}
          </div>
        </div>
        <div class="ep-form-card">
          <div class="prof-section-hdr"><span class="policy-section-title">Recent Activity</span></div>
          <div class="prof-activity-list">
            ${activities.map((a,i)=>`<div class="prof-activity-row"><div class="prof-activity-dot${i===0?' active':''}"></div><div class="prof-activity-body"><div class="prof-activity-action">${a.action}</div><div class="prof-activity-time">${a.time}</div></div></div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
  }

  else if(profTab==='bank-details'){
    tabContent=`<div class="ep-form-card" style="max-width:680px">
      <div class="prof-section-hdr"><span class="policy-section-title">Bank Account Details</span></div>
      <div class="prof-field-grid">
        ${fc(iGlobe,'Country / Location','India')}
        ${fc(iUser,'Account Holder Name','Pallavi Parate')}
        ${fc(iBank,'Bank Name','ICICI Bank')}
        ${fc(iHash,'Account Number','3456 7890 1234')}
        ${fc(iKey,'IFSC Code','ICIC0001234')}
        ${fc(iShield,'Swift Code','ICICINBB')}
        ${fc(iGlobe,'Currency','INR')}
        ${fc(iMail,'Linked Email','pallavi@dhihyperlocal.com')}
      </div>
    </div>`;
  }

  else if(profTab==='attachments'){
    const docs=['Resume','Relieving Letter','Address Proof','Qualification Proof','Passport Photo','Photo Id Proof','Cancel Cheque','Salary Slip1','Salary Slip2','Salary Slip3','Salary Slip4','Salary Slip5','Salary Slip6','Aadhar Back','Aadhar Front','Last Offer Letter'];
    const docItems=docs.map(d=>`
      <div class="prof-att-item">
        <span class="prof-att-icon">${iPaperclip}</span>
        <span class="prof-att-name">${d}</span>
        <button class="prof-att-upload" title="Upload">${iUpload}</button>
      </div>`).join('');
    tabContent=`<div class="ep-form-card">
      <div class="prof-section-hdr"><span class="policy-section-title">Others (Not Uploaded)</span></div>
      <div class="prof-att-grid">${docItems}</div>
    </div>`;
  }

  else if(profTab==='salary-slip'){
    const months=['June 2026','May 2026','April 2026','March 2026','February 2026','January 2026','December 2025','November 2025','October 2025','September 2025','August 2025','July 2025'];
    const thS='padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:#6b7280;background:#f8fafc;border-bottom:1px solid var(--border);text-transform:uppercase;letter-spacing:.4px';
    const rows=months.map((m,i)=>`<tr style="border-bottom:1px solid var(--border)">
      <td style="padding:10px 14px;font-size:13px;color:#6b7280">${i+1}</td>
      <td style="padding:10px 14px;font-size:13px;font-weight:600;color:var(--navy)">${m}</td>
      <td style="padding:10px 14px;font-size:13px;color:#374151">Pallavi Parate</td>
      <td style="padding:10px 14px;font-size:13px;color:#374151">EMP-00211</td>
      <td style="padding:10px 14px"><span style="background:#f0fdf4;color:#16a34a;border:1.5px solid #86efac;border-radius:20px;padding:2px 10px;font-size:11px;font-weight:600">Generated</span></td>
      <td style="padding:10px 14px"><button style="display:flex;align-items:center;gap:5px;background:none;border:1.5px solid var(--border);border-radius:8px;padding:5px 12px;font-size:12px;font-weight:600;color:var(--navy);cursor:pointer;font-family:inherit">${iDl} Download</button></td>
    </tr>`).join('');
    tabContent=`<div class="ep-form-card">
      <div class="prof-section-hdr"><span class="policy-section-title">Salary Slips</span></div>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr>
          <th style="${thS}">SR</th>
          <th style="${thS}">Month</th>
          <th style="${thS}">Employee</th>
          <th style="${thS}">Employee ID</th>
          <th style="${thS}">Status</th>
          <th style="${thS}">Action</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }

  else if(profTab==='change-password'){
    const inp=(id,label,ph)=>`<div><div style="font-size:12.5px;font-weight:600;color:#374151;margin-bottom:6px">${label}</div><input id="${id}" type="password" placeholder="${ph}" style="width:100%;height:40px;border:1.5px solid var(--border);border-radius:8px;padding:0 14px;font-size:13px;font-family:inherit;outline:none;color:var(--navy);box-sizing:border-box"></div>`;
    tabContent=`<div class="ep-form-card" style="max-width:480px">
      <div class="prof-section-hdr"><span class="policy-section-title">Change Password</span></div>
      <div style="display:flex;flex-direction:column;gap:16px">
        ${inp('cp-current','Current Password','Enter current password')}
        ${inp('cp-new','New Password','Enter new password')}
        ${inp('cp-confirm','Confirm New Password','Re-enter new password')}
        <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;font-size:12.5px;color:#15803d">
          ${iCheck} Password must be at least 8 characters with uppercase, number and special character.
        </div>
        <button style="align-self:flex-start;height:38px;padding:0 28px;background:var(--orange);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">Update Password</button>
      </div>
    </div>`;
  }

  return `<div class="ep-page prof-page">${heroCard}${tabBar}<div class="prof-tab-body">${tabContent}</div></div>`;
}

// ── COMPANY SETTINGS PAGE ──
function buildCompanySettingsHTML(){
  const meta=getPageMeta('settings');
  const allRows=meta.rows||[];
  const cols=meta.columns||[];
  const statusIdx=cols.findIndex(c=>c==='Status'||c==='status');
  const activeCount=statusIdx>=0?allRows.filter(r=>String(r[statusIdx]||'').toLowerCase()==='active').length:0;
  const inactiveCount=statusIdx>=0?allRows.filter(r=>String(r[statusIdx]||'').toLowerCase()==='inactive').length:0;
  const pendingCount=statusIdx>=0?allRows.filter(r=>String(r[statusIdx]||'').toLowerCase()==='pending').length:0;
  const csStatFilter=listStatusFilters['settings']||'';
  const rows=(csStatFilter&&statusIdx>=0)?allRows.filter(r=>String(r[statusIdx]||'').toLowerCase()===csStatFilter.toLowerCase()):allRows;
  const hamburger='<svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg>';
  const headers=cols.map(c=>'<th>'+c+'</th>').join('')+'<th>ACTION</th>';
  const tableRows=rows.length?rows.map(row=>'<tr class="lp-row'+(csSelectedItem===row[0]?' lp-row-selected':'')+'" onclick="openCsSidebar('+row[0]+')">'
    +row.map((cell,i)=>buildListingCell(cell,cols[i])).join('')
    +'<td><button class="lp-action-btn" title="More actions" onclick="event.stopPropagation();openCsSidebar('+row[0]+')">'+hamburger+'</button></td>'
    +'</tr>').join(''):'<tr><td colspan="'+(cols.length+1)+'" style="padding:24px;text-align:center;color:var(--gray)">No records match this filter.</td></tr>';
  const filters=(meta.filters||[]).map((f,i)=>apCS('cs-lst-f'+i,getFilterOptions(f).slice(1),'',f)).join('');
  const sbInner=csSelectedItem?renderCsSidebar():'';
  return '<div class="listing-page">'
    +'<div class="listing-top">'
      +'<div class="lp-filter-bar" style="flex:1;min-width:0"><div class="lp-filter-bar-label">Select Filter</div>'
      +'<div class="lp-filter-bar-row">'+filters+'<button class="lp-pill-reset" onclick="resetListingFilters(\'settings\')">Reset</button><button class="lp-pill-search">Search</button></div></div>'
      +'<div class="listing-stats">'
        +'<div class="listing-stat active'+(csStatFilter==='Active'?' stat-selected':'')+'" onclick="toggleListingStatFilter(\'settings\',\'Active\')"><div class="listing-stat-count">'+activeCount+'</div><div class="listing-stat-label">Active</div></div>'
        +'<div class="listing-stat inactive'+(csStatFilter==='Inactive'?' stat-selected':'')+'" onclick="toggleListingStatFilter(\'settings\',\'Inactive\')"><div class="listing-stat-count">'+inactiveCount+'</div><div class="listing-stat-label">Inactive</div></div>'
        +'<div class="listing-stat pending'+(csStatFilter==='Pending'?' stat-selected':'')+'" onclick="toggleListingStatFilter(\'settings\',\'Pending\')"><div class="listing-stat-count">'+pendingCount+'</div><div class="listing-stat-label">Pending</div></div>'
      +'</div>'
    +'</div>'
    +'<div class="lp-split-wrap">'
      +'<div class="lp-split-main">'
        +'<div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
          +'<table class="lp-table" style="min-width:600px"><thead><tr>'+headers+'</tr></thead><tbody>'+tableRows+'</tbody></table>'
          +'<div class="pagination"><button class="page-btn">&lt;</button><button class="page-btn active">1</button><button class="page-btn">&gt;</button></div>'
        +'</div>'
      +'</div>'
      +'<div class="lp-split-sb'+(csSelectedItem?' open':'')+'" id="cs-isb">'
        +'<div class="lp-isb" id="cs-isb-inner">'+sbInner+'</div>'
      +'</div>'
    +'</div>'
  +'</div>';
}

function renderCsSidebar(){
  const tabs=[
    {id:'basic-details',label:'Basic Details'},
    {id:'attachments',label:'Attachments'},
    {id:'banking-details',label:'Banking Details'},
    {id:'company-structure',label:'Company Structure'},
    {id:'roles-access',label:'Roles & Access'},
    {id:'payroll',label:'Payroll'},
    {id:'leaves',label:'Leaves'},
    {id:'attendance',label:'Attendance'},
    {id:'logs',label:'Logs'},
    {id:'workflow',label:'Workflow'}
  ];
  const tabBar='<div class="lp-isb-tabbar">'
    +'<button class="lp-isb-nav-btn" onclick="scrollTabRow(\'left\',\'cs-isb-tabs\')" title="Scroll left"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<div class="lp-isb-tabs" id="cs-isb-tabs">'+tabs.map(t=>'<button class="lp-isb-tab'+(csTab===t.id?' active':'')+'" onclick="csSetTab(\''+t.id+'\')">'+t.label+'</button>').join('')+'</div>'
    +'<button class="lp-isb-nav-btn nav-right" onclick="scrollTabRow(\'right\',\'cs-isb-tabs\')" title="Scroll right"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'<div class="lp-isb-right"><button class="lp-isb-close" onclick="closeCsSidebar()" title="Close"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'</div>';

  // SVG icons
  const iEnt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
  const iMap='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 6l7-3 8 4 7-3v15l-7 3-8-4-7 3z"/><line x1="8" y1="3" x2="8" y2="21"/><line x1="16" y1="7" x2="16" y2="21"/></svg>';
  const iCity='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>';
  const iGlobe='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
  const iCal='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const iPerson='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const iId='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="7" y1="11" x2="10" y2="11"/><line x1="7" y1="15" x2="10" y2="15"/><path d="M14 11h3m-3 4h3"/></svg>';
  const iImg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
  const iDoc='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
  const iBank='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>';
  const iHash='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>';
  const iKey='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>';
  const iFlash='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
  const iDollar='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
  const iMail='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  const iPhone='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.07 6.07l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.76 16.92z"/></svg>';
  const iPct='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>';
  const iPaperclip='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>';
  const iComment='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  const iClock='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  const iPin='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  const editIcoSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';

  const fc=(icon,label,value)=>'<div class="lp-sb-field-card"><div class="lp-sb-field-icon">'+icon+'</div><div class="lp-sb-field-content"><div class="lp-sb-field-label">'+label+'</div><div class="lp-sb-field-value">'+(value!=null?value:'<span style="color:#9ca3af">-</span>')+'</div></div></div>';
  const fcW=(icon,label,value)=>'<div class="lp-sb-field-card" style="grid-column:span 2"><div class="lp-sb-field-icon">'+icon+'</div><div class="lp-sb-field-content"><div class="lp-sb-field-label">'+label+'</div><div class="lp-sb-field-value">'+(value!=null?value:'<span style="color:#9ca3af">-</span>')+'</div></div></div>';
  const editBtn='<button class="lp-sb-view-edit-btn">'+editIcoSvg+' Edit</button>';
  const dash='<span style="color:#9ca3af">-</span>';

  let body='';

  if(csTab==='basic-details'){
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Entity Details</span>'+editBtn+'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
      +fc(iEnt,'Entity ID','293')+fc(iCity,'Entity Name','Closedhi')
      +fcW(iMap,'Address','Flat No: 41204, Olive Block Indu Fortune Fields, Railway Station, Gardenia, near HITECH city, Phase 13, Kukatpally Housing Board Colony, Kukatpally, Hyderabad, Telangana 500085, India')
      +fc(iCity,'City','Hyderabad')
      +fc(iGlobe,'Country','India')+fc(iCal,'Created Time','12 Apr 2026 | 08:53 PM')
      +fc(iPerson,'Created By','Shaun Test1')+fc(iId,'Employee ID Pre fix','CLD')
      +fc(iImg,'Entity Logo',dash)+fc(iDoc,'Header',dash)
      +fc(iDoc,'Footer',dash)
      +'</div>';
  }
  else if(csTab==='attachments'){
    const thS='padding:8px 10px;text-align:left;font-size:10.5px;font-weight:600;color:#6b7280;background:#f8fafc;border-bottom:1px solid var(--border);text-transform:uppercase;letter-spacing:.4px';
    body='<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button style="color:var(--orange);background:none;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">+ Add Attachment</button></div>'
      +'<table style="width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:8px;overflow:hidden">'
      +'<thead><tr>'
      +'<th style="'+thS+'">SR NO</th><th style="'+thS+'">FILE NAME</th><th style="'+thS+'">UPLOADED BY</th>'
      +'<th style="'+thS+'">TYPE</th><th style="'+thS+'">SOURCE</th><th style="'+thS+'">ACTION</th>'
      +'</tr></thead>'
      +'<tbody><tr><td colspan="6" style="padding:28px;text-align:center;color:#9ca3af;font-size:13px">No Attachments Found.</td></tr></tbody>'
      +'</table>';
  }
  else if(csTab==='banking-details'){
    const dlIco='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Banking Details</span>'+editBtn+'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
      +fc(iGlobe,'Country / Location','India')+fc(iPerson,'Pay Name','Closedhi')
      +fc(iBank,'Pay Bank','ICIC')+fc(iHash,'Account Number','223445565666')
      +fc(iKey,'IFSC Code','ICFHDE123')+fc(iFlash,'Swift Code','ICFHDE123')
      +fc(iDollar,'Currency','INR')+fc(iMail,'Email','shaun.varghese@opendhi.com')
      +fc(iPhone,'Phone Number','9949860707')+fc(iPct,'VAT Number',dash)
      +fc(iPaperclip,'Attachment','Screenshot<br><span style="color:var(--orange);font-size:11.5px;display:flex;align-items:center;gap:4px;margin-top:2px">'+dlIco+' Download</span>')
      +fc(iComment,'Comments',dash)
      +'</div>';
  }
  else if(csTab==='company-structure'){
    const subTabs=['Branch','Departments','Designation','Signatories'];
    const subBar='<div style="display:flex;gap:0;border-bottom:1.5px solid var(--border);margin-bottom:14px">'
      +subTabs.map(t=>{const id=t.toLowerCase();return '<button style="padding:7px 13px;border:none;background:none;font-size:12.5px;font-weight:'+(csStructureTab===id?'600':'500')+';color:'+(csStructureTab===id?'var(--orange)':'var(--gray)')+';cursor:pointer;font-family:inherit;border-bottom:2px solid '+(csStructureTab===id?'var(--orange)':'transparent')+';margin-bottom:-1.5px;transition:.15s" onclick="csSetStructureTab(\''+id+'\')">'+t+'</button>';}).join('')
      +'</div>';
    let sub='';
    if(csStructureTab==='branch'){
      const thS='padding:8px 10px;text-align:left;font-size:10.5px;font-weight:600;color:#6b7280;background:#f8fafc;border-bottom:1px solid var(--border)';
      const tdS='padding:9px 10px;font-size:12.5px;color:var(--navy);border-bottom:1px solid #f1f5f9';
      const editSvg='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
      sub='<div style="display:flex;justify-content:flex-end;margin-bottom:10px"><button style="color:var(--orange);background:none;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">+ Add Branch</button></div>'
        +'<table style="width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:8px;overflow:hidden">'
        +'<thead><tr><th style="'+thS+'">SR NO</th><th style="'+thS+'">Branch Name</th><th style="'+thS+'">Location</th><th style="'+thS+'">Status</th><th style="'+thS+'">ACTION</th></tr></thead>'
        +'<tbody><tr>'
        +'<td style="'+tdS+';color:#f97316;font-weight:600">1</td>'
        +'<td style="'+tdS+';font-weight:500">Hyderabd</td>'
        +'<td style="'+tdS+';font-size:11.5px;color:#6b7280">My Home Bhooja, Dallas Centre Rd, Silpa Gram Craft Village, Hyderabad, Rai Durg, Telangana 500032, India</td>'
        +'<td style="'+tdS+'"><span style="color:#16a34a;font-weight:600;font-size:12.5px">Active</span></td>'
        +'<td style="'+tdS+'"><button style="background:none;border:none;cursor:pointer;color:#9ca3af;padding:3px;line-height:0">'+editSvg+'</button></td>'
        +'</tr></tbody></table>';
    }else{
      sub='<div style="padding:40px;text-align:center;color:#9ca3af;font-size:13px">No records found.</div>';
    }
    body=subBar+sub;
  }
  else if(csTab==='roles-access'){
    const thS='padding:8px 10px;text-align:left;font-size:10.5px;font-weight:600;color:#6b7280;background:#f8fafc;border-bottom:1px solid var(--border)';
    const tdS='padding:9px 10px;font-size:12.5px;color:var(--navy);border-bottom:1px solid #f1f5f9';
    const editSvg='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    const roles=[
      {num:1,role:'Direct Employee',cls:'color:#3b82f6',assignedTo:'Antar Testemp'},
      {num:2,role:'Direct Employee',cls:'color:#3b82f6',assignedTo:'Default Name'},
      {num:3,role:'Direct Employee',cls:'color:#3b82f6',assignedTo:'Shaun J'},
      {num:4,role:'Entity Super Admin',cls:'color:var(--orange)',assignedTo:'Shaun Test1'}
    ];
    body='<div style="display:flex;justify-content:flex-end;margin-bottom:10px"><button style="color:var(--orange);background:none;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">+ Add Role</button></div>'
      +'<table style="width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:8px;overflow:hidden">'
      +'<thead><tr><th style="'+thS+'">SR NO</th><th style="'+thS+'">Role Name</th><th style="'+thS+'">assigned to</th><th style="'+thS+'"></th></tr></thead>'
      +'<tbody>'+roles.map(r=>'<tr>'
        +'<td style="'+tdS+';color:#f97316;font-weight:600">'+r.num+'</td>'
        +'<td style="'+tdS+'"><span style="font-weight:600;'+r.cls+'">'+r.role+'</span></td>'
        +'<td style="'+tdS+'">'+r.assignedTo+'</td>'
        +'<td style="'+tdS+'"><button style="background:none;border:none;cursor:pointer;color:#9ca3af;padding:3px;line-height:0">'+editSvg+'</button></td>'
        +'</tr>').join('')
      +'</tbody></table>';
  }
  else if(csTab==='payroll'){
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Payroll Settings</span>'+editBtn+'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">'
      +fc(iPerson,'Pay Cycle','Monthly')+fc(iCal,'Payroll cut-off Date','31th')
      +fc(iCal,'Payroll Calendar','Mar 31 - Apr 29')+fc(iDollar,'Currency','INR')
      +fcW(iCal,'Payslip Publish Date','5th Of Following Month')
      +'</div>'
      +'<div style="font-size:13px;font-weight:700;color:var(--navy);margin-bottom:10px">Payroll Input Rules</div>'
      +'<div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:4px 14px">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f1f5f9">'
      +'<span style="font-size:13px;color:var(--navy)">Include Approved Expenses in Payroll</span>'
      +'<label class="cs-toggle"><input type="checkbox" checked><span class="cs-toggle-slider"></span></label></div>'
      +'<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0">'
      +'<span style="font-size:13px;color:var(--navy)">Deduct Unpaid Leave Automatically</span>'
      +'<label class="cs-toggle"><input type="checkbox" checked><span class="cs-toggle-slider"></span></label></div>'
      +'</div>';
  }
  else if(csTab==='leaves'){
    const thS='padding:7px 9px;text-align:left;font-size:10.5px;font-weight:600;color:#6b7280;background:#f8fafc;border-bottom:1px solid var(--border)';
    const tdS='padding:8px 9px;font-size:12.5px;color:var(--navy);border-bottom:1px solid #f1f5f9';
    const editSvg='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Leave Settings</span>'+editBtn+'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">'
      +fc(iCal,'Leave Period','14/01/2026 - 14/04/2027')+fc(iDoc,'Allocation Frequency','Yearly')
      +fc(iClock,'Probation Period','1 Months')+fc(iDoc,'LOP Allowed','Yes')
      +'</div>'
      +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'
      +'<span style="font-size:13px;font-weight:700;color:var(--navy)">Leaves List</span>'
      +'<button style="color:var(--orange);background:none;border:none;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit">+ Add Leave Type</button>'
      +'</div>'
      +'<table style="width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:8px;overflow:hidden;font-size:12px">'
      +'<thead><tr><th style="'+thS+'">SR</th><th style="'+thS+'">Type</th><th style="'+thS+'">Yearly</th><th style="'+thS+'">Monthly</th><th style="'+thS+'">CF Limit</th><th style="'+thS+'">Probation</th><th style="'+thS+'">Prorate</th><th style="'+thS+'">Status</th><th style="'+thS+'">Action</th></tr></thead>'
      +'<tbody><tr>'
      +'<td style="'+tdS+';font-weight:600;color:var(--navy)">1</td>'
      +'<td style="'+tdS+';font-weight:600">Casual Leave</td>'
      +'<td style="'+tdS+'">24</td><td style="'+tdS+'">5</td><td style="'+tdS+'">10</td>'
      +'<td style="'+tdS+'"><span style="color:#16a34a;font-weight:600">Yes</span></td>'
      +'<td style="'+tdS+'"><span style="color:#f97316;font-weight:600">No</span></td>'
      +'<td style="'+tdS+'"><span style="color:#16a34a;font-weight:600">Active</span></td>'
      +'<td style="'+tdS+'"><button style="background:none;border:none;cursor:pointer;color:var(--orange);padding:2px;line-height:0">'+editSvg+'</button></td>'
      +'</tr></tbody></table>';
  }
  else if(csTab==='attendance'){
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Attendance Settings</span>'+editBtn+'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
      +fc(iClock,'Attendance Mode','Auto')+fc(iClock,'Daily Work Hours','8 Hours')
      +fc(iClock,'Shift Type','Fixed')+fc(iDoc,'Overtime Allowed','No')
      +fc(iClock,'Late Policy','30 Minutes')+fc(iPin,'Geolocation','Enable')
      +'</div>';
  }
  else if(csTab==='logs'){
    const lsk=(s)=>({Active:'active',Inactive:'inactive'}[s]||'default');
    const pSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const cSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    const tSvg='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    const chevSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
    const timeline='<div class="lp-logs-timeline">'+csLogsData.map((l,i)=>{
      const sk=lsk(l.status||'Active');
      return '<div class="lp-log-row">'
        +'<div class="lp-log-avatar-col"><div class="lp-log-avatar lp-log-avatar--'+sk+'">'+pSvg+'</div>'+(i<csLogsData.length-1?'<div class="lp-log-connector"></div>':'')+'</div>'
        +'<div class="lp-log-card">'
        +'<div class="lp-log-status-row"><span class="lp-log-dot lp-log-dot--'+sk+'"></span><span class="lp-log-status-text lp-log-status-text--'+sk+'">'+(l.status||'Active')+'</span></div>'
        +'<div class="lp-log-meta-row"><span class="lp-log-meta-item">'+pSvg+'<span>'+l.user+'</span></span>'
        +(l.date?'<span class="lp-log-meta-item">'+cSvg+'<span>'+l.date+'</span></span>':'')
        +(l.time?'<span class="lp-log-meta-item">'+tSvg+'<span>'+l.time+'</span></span>':'')
        +'</div>'
        +'<div class="lp-log-comment-row"><span class="lp-log-comment-label">Comment:</span>'+l.action+'</div>'
        +'</div></div>';
    }).join('')+'</div>';
    const form='<div class="lp-logs-form">'
      +'<div class="lp-logs-form-header"><span class="lp-log-dot lp-log-dot--active"></span>Active</div>'
      +'<p class="lp-logs-form-sub">Update entity status and add a comment</p>'
      +'<div class="lp-logs-form-label">Status <span class="lp-logs-form-req">*</span></div>'
      +'<div class="lp-logs-form-sel-wrap"><select class="lp-logs-form-select" id="cs-log-status-sel"><option value="">Select Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select>'+chevSvg+'</div>'
      +'<div class="lp-logs-form-label">Comment <span class="lp-logs-form-req">*</span></div>'
      +'<textarea class="lp-logs-form-textarea" id="cs-log-comment-inp" placeholder="Enter comment"></textarea>'
      +'<button class="lp-logs-save-btn" onclick="csSaveLog()">Save</button>'
      +'</div>';
    body='<div class="lp-logs-wrap">'+timeline+form+'</div>';
  }
  else if(csTab==='workflow'){
    body='<div style="padding:52px;text-align:center;color:#9ca3af">'
      +'<div style="font-size:14px;font-weight:600;color:var(--navy);margin-bottom:8px">No workflow configured.</div>'
      +'<div style="font-size:13px">Workflow steps will appear here once configured.</div>'
      +'</div>';
  }

  return tabBar+'<div class="lp-isb-body">'+body+'</div>';
}

// ── TICKETS PAGE ──
function renderTkSidebar(){
  const t=ticketsData.find(x=>x.id===tkSelectedId);if(!t)return '';
  const tabs=[{id:'basic-details',label:'Basic Details'},{id:'conversation',label:'Conversation'},{id:'attachments',label:'Attachments'},{id:'assignment',label:'Assignment'}];
  const tabBar='<div class="lp-isb-tabbar">'
    +'<button class="lp-isb-nav-btn" onclick="scrollTabRow(\'left\',\'tk-isb-tabs\')" title="Scroll left"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<div class="lp-isb-tabs" id="tk-isb-tabs">'+tabs.map(tb=>'<button class="lp-isb-tab'+(tkTab===tb.id?' active':'')+'" onclick="navTkTab(\''+tb.id+'\')">'+tb.label+'</button>').join('')+'</div>'
    +'<button class="lp-isb-nav-btn nav-right" onclick="scrollTabRow(\'right\',\'tk-isb-tabs\')" title="Scroll right"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'<div class="lp-isb-right"><button class="lp-isb-close" onclick="closeTkSidebar()" title="Close"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'</div>';
  const iUser='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const iMail='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  const iPhone='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41A2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.2.73.43 1.44.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.9.34 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
  const iGlobe='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
  const iTag='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>';
  const iCal='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const iDoc='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
  const fc=(icon,label,value)=>'<div class="lp-sb-field-card"><div class="lp-sb-field-icon">'+icon+'</div><div class="lp-sb-field-content"><div class="lp-sb-field-label">'+label+'</div><div class="lp-sb-field-value">'+(value!=null?value:'<span style="color:#9ca3af">-</span>')+'</div></div></div>';
  const fcW=(icon,label,value)=>'<div class="lp-sb-field-card" style="grid-column:span 2"><div class="lp-sb-field-icon">'+icon+'</div><div class="lp-sb-field-content"><div class="lp-sb-field-label">'+label+'</div><div class="lp-sb-field-value">'+(value!=null?value:'<span style="color:#9ca3af">-</span>')+'</div></div></div>';
  const thS='padding:8px 10px;text-align:left;font-size:10.5px;font-weight:600;color:#6b7280;background:#f8fafc;border-bottom:1px solid var(--border);text-transform:uppercase;letter-spacing:.4px';
  let body='';
  if(tkTab==='basic-details'){
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Client Information</span></div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">'
      +fc(iUser,'Client Name',t.clientName)+fc(iMail,'Email',t.clientEmail)
      +fc(iPhone,'Phone',t.clientPhone)+fc(iGlobe,'Country',t.country)
      +'</div>'
      +'<div class="lp-sb-view-header"><span class="lp-sb-section-title">Ticket Information</span></div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">'
      +fc(iTag,'Ticket ID',t.ticketId)+fc(iTag,'Category',t.category)
      +fc(iCal,'Created At',t.createdAt)+fc(iUser,'Assigned To',t.assignedTo)
      +fc(iTag,'Status',tkStatusBadge(t.status))
      +'</div>'
      +'<div class="lp-sb-view-header"><span class="lp-sb-section-title">Description</span></div>'
      +'<div style="display:grid;grid-template-columns:1fr;gap:10px">'+fcW(iDoc,'Details',t.description)+'</div>';
  }else if(tkTab==='conversation'){
    const initials=t.clientName.split(' ').map(n=>n[0]).join('').slice(0,2);
    body='<div style="display:flex;flex-direction:column;gap:12px">'
      +'<div style="background:#f8fafc;border:1.5px solid var(--border);border-radius:10px;padding:14px 16px">'
      +'<div style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">Trigger Message</div>'
      +'<p style="margin:0;font-size:13px;color:#374151;line-height:1.5">'+t.description+'</p></div>'
      +'<div style="background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:10px;padding:14px 16px">'
      +'<div style="font-size:11px;font-weight:700;color:#0284c7;margin-bottom:8px;display:flex;align-items:center;gap:5px"><svg width="11" height="11" viewBox="0 0 24 24" fill="var(--orange)" stroke="none"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>AI Summary</div>'
      +'<p style="margin:0;font-size:12.5px;color:#374151;line-height:1.5">'+t.clientName+' raised a '+t.category.toLowerCase()+'-related issue ('+t.ticketId+') on '+t.createdAt+'. Assigned to '+t.assignedTo+'. Status: '+tkStatusBadge(t.status)+'.</p></div>'
      +'<div>'
      +'<div style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.4px;margin-bottom:10px">Chat Thread</div>'
      +'<div style="display:flex;gap:8px;margin-bottom:12px"><div style="width:28px;height:28px;border-radius:50%;background:#e0e7ff;color:#4f46e5;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">'+initials+'</div><div style="flex:1"><div style="font-size:11px;font-weight:600;color:var(--navy);margin-bottom:3px">'+t.clientName+' <span style="color:#9ca3af;font-weight:400">· '+t.createdAt+'</span></div><div style="background:#f1f5f9;border-radius:0 8px 8px 8px;padding:8px 12px;font-size:12.5px;color:#374151;line-height:1.4">'+t.description+'</div></div></div>'
      +'<div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:12px"><div style="flex:1;display:flex;justify-content:flex-end"><div><div style="font-size:11px;font-weight:600;color:var(--navy);margin-bottom:3px;text-align:right">'+t.assignedTo+' <span style="color:#9ca3af;font-weight:400">· Today</span></div><div style="background:#f1f5f9;border:1px solid #d1d5db;border-radius:8px 0 8px 8px;padding:8px 12px;font-size:12.5px;color:#374151;line-height:1.4">Thank you for reaching out. We are looking into this and will respond shortly.</div></div></div><div style="width:28px;height:28px;border-radius:50%;background:#f1f5f9;color:#ea580c;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">PP</div></div>'
      +'<div style="display:flex;gap:8px;padding-top:10px;border-top:1px solid var(--border)"><input style="flex:1;height:34px;border:1.5px solid var(--border);border-radius:8px;padding:0 12px;font-size:13px;font-family:inherit;outline:none;color:var(--navy)" placeholder="Type a reply…"><button style="height:34px;padding:0 16px;background:var(--orange);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">Send</button></div>'
      +'</div></div>';
  }else if(tkTab==='attachments'){
    const dIco='<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    const atts=[{no:1,name:'compliance_brief_Q2.pdf',type:'PDF',by:'Pallavi Parate',src:'Manual'},{no:2,name:'contract_template_2026.docx',type:'DOCX',by:'Aman Singh',src:'System'},{no:3,name:'id_proof_client.png',type:'PNG',by:t.clientName,src:'Client'},{no:4,name:'audit_report_jun26.xlsx',type:'XLSX',by:'Rahul Mehta',src:'Manual'}];
    body='<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button style="color:var(--orange);background:none;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">+ Add Attachment</button></div>'
      +'<table style="width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:8px;overflow:hidden">'
      +'<thead><tr><th style="'+thS+'">SR</th><th style="'+thS+'">File Name</th><th style="'+thS+'">Uploaded By</th><th style="'+thS+'">Type</th><th style="'+thS+'">Source</th><th style="'+thS+'">Action</th></tr></thead>'
      +'<tbody>'+atts.map(a=>'<tr style="border-bottom:1px solid var(--border)"><td style="padding:8px 10px;font-size:12px;color:#6b7280">'+a.no+'</td><td style="padding:8px 10px;font-size:12px;font-weight:500;color:var(--navy)">'+a.name+'</td><td style="padding:8px 10px;font-size:12px;color:#374151">'+a.by+'</td><td style="padding:8px 10px;font-size:12px;color:#374151">'+a.type+'</td><td style="padding:8px 10px;font-size:12px;color:#374151">'+a.src+'</td><td style="padding:8px 10px"><button style="background:none;border:none;cursor:pointer;color:var(--orange);font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:3px">'+dIco+' Download</button></td></tr>').join('')
      +'</tbody></table>';
  }else if(tkTab==='assignment'){
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Current Assignment</span></div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">'
      +fc(iUser,'Assigned To',t.assignedTo)+fc(iCal,'Since',t.createdAt)
      +'</div>'
      +'<div class="lp-sb-view-header"><span class="lp-sb-section-title">Reassign Ticket</span></div>'
      +'<div style="display:flex;flex-direction:column;gap:10px">'
      +'<div><div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:5px">Select Agent</div>'
      +'<select style="width:100%;height:38px;border:1.5px solid var(--border);border-radius:8px;padding:0 12px;font-size:13px;font-family:inherit;outline:none;color:var(--navy);background:#fff"><option value="">Choose assignee…</option><option>Pallavi Parate</option><option>Rahul Mehta</option><option>Aman Singh</option><option>Neha Sharma</option><option>Olivia Clark</option></select></div>'
      +'<div><div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:5px">Note (optional)</div><textarea style="width:100%;height:72px;border:1.5px solid var(--border);border-radius:8px;padding:8px 12px;font-size:13px;font-family:inherit;outline:none;color:var(--navy);resize:none;box-sizing:border-box" placeholder="Add a note for the new assignee…"></textarea></div>'
      +'<button style="align-self:flex-start;height:34px;padding:0 20px;background:var(--orange);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">Reassign</button>'
      +'</div>';
  }
  return tabBar+'<div class="lp-isb-body">'+body+'</div>';
}

function tkToggleStatFilter(v){
  tkQuickStatusFilter=tkQuickStatusFilter===v?'':v;
  tkSelectedId=null;
  renderADTPage();
}
function buildTicketsPageHTML(){
  const dotsIco='<svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg>';
  const countries=[...new Set(ticketsData.map(t=>t.country))];
  const categories=[...new Set(ticketsData.map(t=>t.category))];
  const openCount=ticketsData.filter(t=>t.status==='open').length;
  const inProgressCount=ticketsData.filter(t=>t.status==='in_progress').length;
  const blockedCount=ticketsData.filter(t=>t.status==='blocked').length;
  const filteredTickets=tkQuickStatusFilter?ticketsData.filter(t=>t.status===tkQuickStatusFilter):ticketsData;
  const rows=filteredTickets.map((t,i)=>(
    '<tr class="tk-row'+(tkSelectedId===t.id?' lp-row-selected':'')+'" id="tk-row-'+t.id+'" style="cursor:pointer" onclick="openTkSidebar('+t.id+')">'
    +'<td style="color:#6b7280;font-size:13px">'+(i+1)+'</td>'
    +'<td style="font-weight:600;color:var(--navy)">'+t.ticketId+'</td>'
    +'<td style="font-weight:600;color:var(--navy)">'+t.clientName+'</td>'
    +'<td style="color:#64748b;font-size:13px;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+t.title+'</td>'
    +'<td>'+t.category+'</td>'
    +'<td style="font-size:12px;color:#64748b">'+t.createdAt+'</td>'
    +'<td>'+tkStatusBadge(t.status)+'</td>'
    +'<td onclick="event.stopPropagation()"><button class="lp-action-btn" onclick="openTkSidebar('+t.id+')" title="View Details">'+dotsIco+'</button></td>'
    +'</tr>'
  )).join('')||'<tr><td colspan="8" style="padding:24px;text-align:center;color:var(--gray)">No tickets match this filter.</td></tr>';
  const sbInner=tkSelectedId?renderTkSidebar():'';
  return '<div class="lp-page">'
    +'<div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:4px">'
    +'<div class="lp-filter-bar" style="flex:1;min-width:0;padding:0">'
    +'<div class="lp-filter-bar-label">Select Filter</div>'
    +'<div class="lp-filter-bar-row">'
    +apCS('tk-f-country',countries,'','All Countries')
    +apCS('tk-f-category',categories,'','All Categories')
    +apCS('tk-f-status',['open','in_progress','blocked','closed'],'','All Statuses')
    +'<button class="lp-pill-reset">Reset</button>'
    +'<button class="lp-pill-search">Search</button>'
    +'</div></div>'
    +'<div class="listing-stats">'
    +'<div class="listing-stat'+(tkQuickStatusFilter==='open'?' stat-selected':'')+'" onclick="tkToggleStatFilter(\'open\')"><div class="listing-stat-count" style="color:#2563eb">'+openCount+'</div><div class="listing-stat-label">Open</div></div>'
    +'<div class="listing-stat'+(tkQuickStatusFilter==='in_progress'?' stat-selected':'')+'" onclick="tkToggleStatFilter(\'in_progress\')"><div class="listing-stat-count" style="color:#d97706">'+inProgressCount+'</div><div class="listing-stat-label">In Progress</div></div>'
    +'<div class="listing-stat'+(tkQuickStatusFilter==='blocked'?' stat-selected':'')+'" onclick="tkToggleStatFilter(\'blocked\')"><div class="listing-stat-count" style="color:#dc2626">'+blockedCount+'</div><div class="listing-stat-label">Blocked</div></div>'
    +'</div></div>'
    +'<div class="lp-split-wrap" style="margin-top:14px"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table"><thead><tr><th>S.No</th><th>Ticket ID</th><th>Client Name</th><th>Title</th><th>Category</th><th>Created At</th><th>Status</th><th>Action</th></tr></thead>'
    +'<tbody>'+rows+'</tbody></table>'
    +'<div class="lp-pagination"><span class="lp-pagination-info">Showing 1–'+filteredTickets.length+' of '+ticketsData.length+' entries</span>'
    +'<div class="lp-pagination-controls">'
    +'<button class="lp-pg-btn lp-pg-arrow" disabled><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<button class="lp-pg-btn active">1</button>'
    +'<button class="lp-pg-btn lp-pg-arrow" disabled><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'</div></div>'
    +'</div></div>'
    +'<div class="lp-split-sb'+(tkSelectedId?' open':'')+'" id="tk-split-sb"><div class="lp-isb" id="tk-isb-inner">'+sbInner+'</div></div>'
    +'</div></div>';
}

// ── CHATS PAGE ──
function renderChatSidebar(){
  const c=chatsData.find(x=>x.id===chatSelectedId);if(!c)return '';
  const tabs=[{id:'basic-details',label:'Basic Details'},{id:'tickets',label:'Tickets'},{id:'attachments',label:'Attachments'},{id:'assignment',label:'Assignment'},{id:'logs',label:'Logs'},{id:'workflow',label:'Workflow'}];
  const tabBar='<div class="lp-isb-tabbar">'
    +'<button class="lp-isb-nav-btn" onclick="scrollTabRow(\'left\',\'chat-isb-tabs\')" title="Scroll left"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<div class="lp-isb-tabs" id="chat-isb-tabs">'+tabs.map(tb=>'<button class="lp-isb-tab'+(chatTab===tb.id?' active':'')+'" onclick="navChatTab(\''+tb.id+'\')">'+tb.label+'</button>').join('')+'</div>'
    +'<button class="lp-isb-nav-btn nav-right" onclick="scrollTabRow(\'right\',\'chat-isb-tabs\')" title="Scroll right"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'<div class="lp-isb-right"><button class="lp-isb-close" onclick="closeChatSidebar()" title="Close"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'</div>';
  const iUser='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  const iMail='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  const iGlobe='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
  const iTag='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>';
  const iCal='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const iClock='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  const iTicket='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a3 3 0 0 0 0-6V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3z"/></svg>';
  const fc=(icon,label,value)=>'<div class="lp-sb-field-card"><div class="lp-sb-field-icon">'+icon+'</div><div class="lp-sb-field-content"><div class="lp-sb-field-label">'+label+'</div><div class="lp-sb-field-value">'+(value!=null?value:'<span style="color:#9ca3af">-</span>')+'</div></div></div>';
  const thS='padding:8px 10px;text-align:left;font-size:10.5px;font-weight:600;color:#6b7280;background:#f8fafc;border-bottom:1px solid var(--border);text-transform:uppercase;letter-spacing:.4px';
  let body='';
  if(chatTab==='basic-details'){
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Client Information</span></div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">'
      +fc(iUser,'Client Name',c.clientName)+fc(iMail,'Email',c.clientEmail)
      +fc(iGlobe,'Country',c.country)+fc(iTag,'Status',chatStatusBadge(c.status))
      +'</div>'
      +'<div class="lp-sb-view-header"><span class="lp-sb-section-title">Chat Information</span></div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
      +fc(iTag,'Chat ID',c.chatId)+fc(iUser,'Assigned To',c.assignedTo)
      +fc(iCal,'Started At',c.startedAt)+fc(iClock,'Last Activity',c.lastActivity)
      +'</div>';
  }else if(chatTab==='tickets'){
    const linked=c.linkedTickets.map(tid=>ticketsData.find(t=>t.ticketId===tid)).filter(Boolean);
    if(linked.length===0){
      body='<div style="padding:40px;text-align:center;color:#9ca3af"><div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:6px">No linked tickets.</div><div style="font-size:12px">Tickets linked to this chat will appear here.</div></div>';
    }else{
      body='<div style="display:flex;flex-direction:column;gap:10px">'
        +linked.map(t=>'<div style="border:1.5px solid var(--border);border-radius:10px;padding:12px 14px;display:flex;align-items:flex-start;gap:10px"><div style="color:#6b7280;margin-top:1px">'+iTicket+'</div><div style="flex:1"><div style="font-weight:700;color:var(--navy);font-size:13px;margin-bottom:2px">'+t.ticketId+'</div><div style="font-size:12px;color:#64748b;margin-bottom:6px">'+t.title+'</div><div style="display:flex;gap:8px;align-items:center">'+tkStatusBadge(t.status)+'<span style="font-size:11px;color:#9ca3af">'+t.category+' · '+t.createdAt+'</span></div></div></div>').join('')
        +'</div>';
    }
  }else if(chatTab==='attachments'){
    body='<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button style="color:var(--orange);background:none;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">+ Add Attachment</button></div>'
      +'<table style="width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:8px;overflow:hidden">'
      +'<thead><tr><th style="'+thS+'">SR</th><th style="'+thS+'">File Name</th><th style="'+thS+'">Uploaded By</th><th style="'+thS+'">Type</th><th style="'+thS+'">Action</th></tr></thead>'
      +'<tbody><tr><td colspan="5" style="padding:28px;text-align:center;color:#9ca3af;font-size:13px">No attachments found.</td></tr></tbody>'
      +'</table>';
  }else if(chatTab==='assignment'){
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Current Assignment</span></div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">'
      +fc(iUser,'Assigned To',c.assignedTo)+fc(iCal,'Since',c.startedAt)
      +'</div>'
      +'<div class="lp-sb-view-header"><span class="lp-sb-section-title">Reassign Chat</span></div>'
      +'<div style="display:flex;flex-direction:column;gap:10px">'
      +'<div><div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:5px">Select Agent</div>'
      +'<select style="width:100%;height:38px;border:1.5px solid var(--border);border-radius:8px;padding:0 12px;font-size:13px;font-family:inherit;outline:none;color:var(--navy);background:#fff"><option value="">Choose assignee…</option><option>Pallavi Parate</option><option>Rahul Mehta</option><option>Aman Singh</option><option>Neha Sharma</option><option>Olivia Clark</option></select></div>'
      +'<button style="align-self:flex-start;height:34px;padding:0 20px;background:var(--orange);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">Reassign</button>'
      +'</div>';
  }else if(chatTab==='logs'){
    const pSvg='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    const logs=[{user:'Pallavi Parate',date:c.startedAt,status:'Active',action:'Chat initiated with '+c.clientName+'.'},{user:'System',date:'—',status:'Active',action:'Auto-assigned to '+c.assignedTo+'.'}];
    body='<div class="lp-logs-timeline">'+logs.map((l,i)=>'<div class="lp-log-row">'
      +'<div class="lp-log-avatar-col"><div class="lp-log-avatar lp-log-avatar--active">'+pSvg+'</div>'+(i<logs.length-1?'<div class="lp-log-connector"></div>':'')+'</div>'
      +'<div class="lp-log-card"><div class="lp-log-status-row"><span class="lp-log-dot lp-log-dot--active"></span><span class="lp-log-status-text lp-log-status-text--active">'+l.status+'</span></div>'
      +'<div class="lp-log-meta-row"><span class="lp-log-meta-item">'+pSvg+'<span>'+l.user+'</span></span></div>'
      +'<div class="lp-log-comment-row"><span class="lp-log-comment-label">Action:</span>'+l.action+'</div>'
      +'</div></div>').join('')+'</div>';
  }else if(chatTab==='workflow'){
    body='<div style="padding:52px;text-align:center;color:#9ca3af"><div style="font-size:14px;font-weight:600;color:var(--navy);margin-bottom:8px">No workflow configured.</div><div style="font-size:13px">Workflow steps will appear here once configured.</div></div>';
  }
  return tabBar+'<div class="lp-isb-body">'+body+'</div>';
}

function chatToggleStatFilter(v){
  chatQuickStatusFilter=chatQuickStatusFilter===v?'':v;
  chatSelectedId=null;
  renderADTPage();
}
function buildChatsPageHTML(){
  const dotsIco='<svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg>';
  const assignees=[...new Set(chatsData.map(c=>c.assignedTo))];
  const countries=[...new Set(chatsData.map(c=>c.country))];
  const activeCount=chatsData.filter(c=>c.status==='active').length;
  const waitingCount=chatsData.filter(c=>c.status==='waiting_client'||c.status==='waiting_csm').length;
  const inactiveCount=chatsData.filter(c=>c.status==='inactive').length;
  const filteredChats=chatQuickStatusFilter?(chatQuickStatusFilter==='__waiting_group__'?chatsData.filter(c=>c.status==='waiting_client'||c.status==='waiting_csm'):chatsData.filter(c=>c.status===chatQuickStatusFilter)):chatsData;
  const rows=filteredChats.map((c,i)=>(
    '<tr class="chat-row'+(chatSelectedId===c.id?' lp-row-selected':'')+'" id="chat-row-'+c.id+'" style="cursor:pointer" onclick="openChatSidebar('+c.id+')">'
    +'<td style="color:#6b7280;font-size:13px">'+(i+1)+'</td>'
    +'<td style="font-weight:600;color:var(--navy)">'+c.chatId+'</td>'
    +'<td style="font-weight:600;color:var(--navy)">'+c.clientName+'</td>'
    +'<td style="color:#64748b;font-size:13px">'+c.assignedTo+'</td>'
    +'<td style="font-size:12px;color:#64748b">'+c.lastActivity+'</td>'
    +'<td>'+chatStatusBadge(c.status)+'</td>'
    +'<td onclick="event.stopPropagation()"><button class="lp-action-btn" onclick="openChatSidebar('+c.id+')" title="View Details">'+dotsIco+'</button></td>'
    +'</tr>'
  )).join('')||'<tr><td colspan="7" style="padding:24px;text-align:center;color:var(--gray)">No chats match this filter.</td></tr>';
  const sbInner=chatSelectedId?renderChatSidebar():'';
  return '<div class="lp-page">'
    +'<div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:4px">'
    +'<div class="lp-filter-bar" style="flex:1;min-width:0;padding:0">'
    +'<div class="lp-filter-bar-label">Select Filter</div>'
    +'<div class="lp-filter-bar-row">'
    +apCS('chat-f-country',countries,'','All Countries')
    +apCS('chat-f-assignee',assignees,'','All Assignees')
    +apCS('chat-f-status',['active','waiting_client','waiting_csm','inactive'],'','All Statuses')
    +'<button class="lp-pill-reset">Reset</button>'
    +'<button class="lp-pill-search">Search</button>'
    +'</div></div>'
    +'<div class="listing-stats">'
    +'<div class="listing-stat'+(chatQuickStatusFilter==='active'?' stat-selected':'')+'" onclick="chatToggleStatFilter(\'active\')"><div class="listing-stat-count" style="color:#16a34a">'+activeCount+'</div><div class="listing-stat-label">Active</div></div>'
    +'<div class="listing-stat'+(chatQuickStatusFilter==='__waiting_group__'?' stat-selected':'')+'" onclick="chatToggleStatFilter(\'__waiting_group__\')"><div class="listing-stat-count" style="color:#d97706">'+waitingCount+'</div><div class="listing-stat-label">Waiting</div></div>'
    +'<div class="listing-stat'+(chatQuickStatusFilter==='inactive'?' stat-selected':'')+'" onclick="chatToggleStatFilter(\'inactive\')"><div class="listing-stat-count" style="color:#64748b">'+inactiveCount+'</div><div class="listing-stat-label">Inactive</div></div>'
    +'</div></div>'
    +'<div class="lp-split-wrap" style="margin-top:14px"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table"><thead><tr><th>S.No</th><th>Chat ID</th><th>Client Name</th><th>Assigned To</th><th>Last Activity</th><th>Status</th><th>Action</th></tr></thead>'
    +'<tbody>'+rows+'</tbody></table>'
    +'<div class="lp-pagination"><span class="lp-pagination-info">Showing 1–'+filteredChats.length+' of '+chatsData.length+' entries</span>'
    +'<div class="lp-pagination-controls">'
    +'<button class="lp-pg-btn lp-pg-arrow" disabled><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<button class="lp-pg-btn active">1</button>'
    +'<button class="lp-pg-btn lp-pg-arrow" disabled><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'</div></div>'
    +'</div></div>'
    +'<div class="lp-split-sb'+(chatSelectedId?' open':'')+'" id="chat-split-sb"><div class="lp-isb" id="chat-isb-inner">'+sbInner+'</div></div>'
    +'</div></div>';
}

// -- AI EXECUTIVE MODULE --
const aiChipClassMap={'AI Automated':'ai-chip-ai','Human Required':'ai-chip-human','System Action':'ai-chip-system','Client Action':'ai-chip-client','Validation Required':'ai-chip-validation','Approval Required':'ai-chip-approval','Exception Possible':'ai-chip-exception'};
function aiChipClass(label){return aiChipClassMap[label]||'ai-chip-system';}
function aiChips(list){return (list||[]).map(l=>'<span class="ai-chip '+aiChipClass(l)+'">'+l+'</span>').join('');}
function aiPrimaryChipLabel(chips){
  if(!chips||!chips.length)return 'System Action';
  if(chips.includes('AI Automated'))return 'AI Automated';
  if(chips.includes('Human Required'))return 'Human Required';
  if(chips.includes('Approval Required'))return 'Approval Required';
  if(chips.includes('Client Action'))return 'Client Action';
  return chips[0];
}
function aiChipsCompact(chips){
  const primary=aiPrimaryChipLabel(chips);
  const extra=(chips||[]).length-1;
  return '<span class="ai-chip '+aiChipClass(primary)+'">'+primary+'</span>'+(extra>0?'<span class="ai-chip-more">+'+extra+'</span>':'');
}
function aiDrawerRow(label,val){return '<div class="review-row"><div class="rr-label">'+label+'</div><div class="rr-val" style="white-space:normal;font-weight:600">'+val+'</div></div>';}
function aiApproverForSource(source){
  if(source===aiDealManager.role)return aiDealManager.name;
  if(source===aiOpsManager.role)return aiOpsManager.name;
  if(source===aiPayrollManager.role)return aiPayrollManager.name;
  if(source===aiHrManager.role)return aiHrManager.name;
  return source;
}
function aiStepResponsibility(chips){
  const hasAI=(chips||[]).includes('AI Automated');
  const hasHuman=(chips||[]).includes('Human Required')||(chips||[]).includes('Approval Required');
  if(hasAI&&hasHuman)return{label:'AI + Human',cls:'mixed'};
  if(hasHuman)return{label:'Human Intervention Required',cls:'human'};
  return{label:'Agent',cls:'ai'};
}

function viewAIJourney(id,backTo){
  if(!activePersonaCanAccessJourney(id)){
    selectedAIJourneyId=activePersonaJourneyIds()[0]||'contract-creation';
    navigatePage('ai-executive');
    showAiToast('Journey hidden for this role','Only journeys owned by '+portalRoleLabel(portalRole)+' are available here.');
    return;
  }
  selectedAIJourneyId=id;aiEventDrawerIdx=-1;aiJourneyDetailSelectedStage=-1;aiRunStatusFilter='';aiJourneyDetailBackPage=backTo||null;navigatePage('ai-journey-detail');
}
function startAutomateJourney(id){aiAutomateSkipPicker=true;aiAutomateResumeOrStart(id);navigatePage('ai-automate-form');}
function startAutomateJourneyPicker(){selectedAIJourneyId=null;aiAutomateSkipPicker=false;aiAutomateStep=0;aiAutomateFormData={};navigatePage('ai-automate-form');}

// -- AI EXECUTIVE — SUPER ADMIN: client roster listing (no run affordances; view journeys built per client, edit their step config, action pending requests) --
function viewAIClientFromRequest(clientId){
  if(!clientId)return;
  navigatePage('ai-executive');
  openAIClientSidebar(clientId,'requests');
}
function openAIClientSidebar(id,tab){
  aiClientSelectedId=id;aiClientTab=tab||'journeys';
  const sb=document.getElementById('aic-split-sb');if(sb)sb.classList.add('open');
  const inner=document.getElementById('aic-isb-inner');if(inner)inner.innerHTML=renderAIClientSidebar();
  document.querySelectorAll('.aic-client-row').forEach(function(r){r.classList.toggle('lp-row-selected',r.id==='aic-row-'+id);});
}
function closeAIClientSidebar(){
  aiClientSelectedId=null;
  const sb=document.getElementById('aic-split-sb');if(sb)sb.classList.remove('open');
  document.querySelectorAll('.aic-client-row').forEach(function(r){r.classList.remove('lp-row-selected');});
}
function navAIClientTab(tab){
  aiClientTab=tab;
  const inner=document.getElementById('aic-isb-inner');
  if(inner){
    inner.innerHTML=renderAIClientSidebar();
    requestAnimationFrame(function(){const nt=document.getElementById('aic-isb-tabs');if(nt){const a=nt.querySelector('.lp-isb-tab.active');if(a)a.scrollIntoView({inline:'start',block:'nearest'});}});
  }
}
function aiClientScopeModeChoose(el,cjId,i,mode,eventName){
  const seg=el.parentElement;
  const activeBtn=seg.querySelector('.seg-btn.active');
  const currentMode=activeBtn?activeBtn.getAttribute('data-mode'):null;
  if(currentMode===mode)return;
  document.getElementById('ct-modal-overlay').innerHTML=
    '<div class="ct-modal" style="width:min(460px,92vw);text-align:center;padding:34px 32px" onclick="event.stopPropagation()">'
    +'<div style="width:64px;height:64px;border-radius:50%;background:#fef3c7;display:flex;align-items:center;justify-content:center;margin:0 auto 18px"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" shape-rendering="geometricPrecision"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17.02" x2="12.01" y2="17.02"/></svg></div>'
    +'<div style="font-size:17px;font-weight:700;color:var(--navy);margin-bottom:12px">Confirm Change</div>'
    +'<div style="font-size:13.5px;color:var(--gray);line-height:1.65;margin-bottom:26px">Set <strong style="color:var(--navy)">'+eventName+'</strong> to run as <strong style="color:var(--navy)">'+(mode==='ai'?'AI Automated':'Manual')+'</strong> for this client?</div>'
    +'<div style="display:flex;justify-content:center;gap:12px">'
    +'<button class="ep-cancel-btn" onclick="closeCtModal()">Cancel</button>'
    +'<button class="ep-save-btn" onclick="aiClientScopeModeApply(\''+cjId+'\','+i+',\''+mode+'\')">Yes, Confirm</button>'
    +'</div></div>';
  document.getElementById('ct-modal-overlay').style.display='flex';
}
function aiClientScopeModeApply(cjId,i,mode){
  const cj=aiClientJourneys.find(function(x){return x.id===cjId;});if(!cj)return;
  if(!cj.scope)cj.scope=[];
  cj.scope[i]={mode:mode};
  closeCtModal();
  const inner=document.getElementById('aic-isb-inner');if(inner)inner.innerHTML=renderAIClientSidebar();
  showAiToast('Configuration updated','Step set to '+(mode==='ai'?'AI Automated':'Manual')+'.');
}
function openAIClientAddJourneyModal(clientId){
  const c=aiClients.find(function(x){return x.id===clientId;});if(!c)return;
  const builtIds=aiClientJourneys.filter(function(cj){return cj.clientId===clientId;}).map(function(cj){return cj.journeyId;});
  const available=aiJourneys.filter(function(j){return builtIds.indexOf(j.id)===-1;});
  const rows=available.length?available.map(function(j){
    const stepCount=(aiJourneyEvents[j.id]||[]).length;
    return '<div class="ea-req-row" style="cursor:pointer" onclick="addAIClientJourney(\''+clientId+'\',\''+j.id+'\')"><div><div class="ea-req-label">'+j.name+'</div><div class="ea-req-time">'+j.category+' &middot; '+j.modules.length+' modules &middot; '+stepCount+' steps</div></div><span class="status-pill draft">+ Add</span></div>';
  }).join(''):'<div class="ea-req-empty">Every journey in the catalog has already been built for this client.</div>';
  document.getElementById('ct-modal-overlay').innerHTML=
    '<div class="ct-modal" style="width:min(480px,92vw)" onclick="event.stopPropagation()">'
    +'<div class="ct-modal-hdr"><span class="ct-modal-title">Add Journey for '+c.name+'</span><button class="ct-modal-close" onclick="closeCtModal()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'<div style="font-size:12.5px;color:var(--gray);margin-bottom:16px">Choose a journey from the catalog to build out for this client. It starts in Draft with the default AI/human step config, which you can adjust right after.</div>'
    +'<div class="ea-req-list">'+rows+'</div>'
    +'</div>';
  document.getElementById('ct-modal-overlay').style.display='flex';
}
function addAIClientJourney(clientId,journeyId){
  const c=aiClients.find(function(x){return x.id===clientId;});
  const j=aiJourneys.find(function(x){return x.id===journeyId;});
  if(!c||!j)return;
  const builtOn=new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  aiClientJourneys.push({id:'cj-'+(aiClientJourneySeq++),clientId:clientId,journeyId:journeyId,status:'Draft',builtOn:builtOn,scope:[]});
  closeCtModal();
  aiClientSelectedId=clientId;aiClientTab='journeys';
  renderADTPage();
  showAiToast('Journey added','"'+j.name+'" has been added for '+c.name+' as a Draft.');
}
function renderAIClientSidebar(){
  const c=aiClients.find(function(x){return x.id===aiClientSelectedId;});if(!c)return '';
  const journeys=aiClientJourneys.filter(function(cj){return cj.clientId===c.id;});
  const requests=entityRequests.filter(function(r){return r.clientId===c.id&&r.type!=='manager-notify'&&r.type!=='journey-request-to-admin';});
  const pendingCount=requests.filter(function(r){return r.status==='Pending';}).length;
  const tabs=[{id:'journeys',label:'Journeys'},{id:'requests',label:'Requests'+(pendingCount?' ('+pendingCount+')':'')}];
  const tabBar='<div class="lp-isb-tabbar">'
    +'<button class="lp-isb-nav-btn" onclick="scrollTabRow(\'left\',\'aic-isb-tabs\')" title="Scroll left"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<div class="lp-isb-tabs" id="aic-isb-tabs">'+tabs.map(function(t){return '<button class="lp-isb-tab'+(aiClientTab===t.id?' active':'')+'" onclick="navAIClientTab(\''+t.id+'\')">'+t.label+'</button>';}).join('')+'</div>'
    +'<button class="lp-isb-nav-btn nav-right" onclick="scrollTabRow(\'right\',\'aic-isb-tabs\')" title="Scroll right"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'<div class="lp-isb-right"><button class="lp-isb-close" onclick="closeAIClientSidebar()" title="Close"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'</div>';
  const addJourneyBtn=aiClientTab==='journeys'?'<button class="btn btn-primary btn-sm" style="flex-shrink:0" onclick="openAIClientAddJourneyModal(\''+c.id+'\')">+ Add Journey</button>':'';
  const header='<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding-bottom:16px;margin-bottom:16px;border-bottom:1px solid var(--border)">'
    +'<div>'
    +'<div style="font-size:16px;font-weight:700;color:var(--navy)">'+c.name+'</div>'
    +'<div style="font-size:12px;color:var(--gray);margin-top:3px">'+c.country+' &middot; '+c.plan+' Plan &middot; '+c.employees+' employees</div>'
    +'<div style="font-size:12px;color:var(--gray);margin-top:2px">Primary contact: '+c.contactName+' ('+c.contactRole+')</div>'
    +'</div>'
    +addJourneyBtn
    +'</div>';
  let body;
  if(aiClientTab==='requests'){
    const rows=requests.length?requests.map(function(r){
      const actions=r.status==='Pending'
        ?'<div class="sa-req-actions" onclick="event.stopPropagation()"><button class="sa-req-btn sa-req-approve" onclick="approveEntityRequest(\''+r.id+'\')">Approve</button><button class="sa-req-btn sa-req-reject" onclick="rejectEntityRequest(\''+r.id+'\')">Reject</button></div>'
        :'<span class="status-pill '+statusClass(r.status)+'">'+r.status+'</span>';
      return '<div class="ea-req-row" style="align-items:flex-start"><div><div class="ea-req-label">'+r.label+'</div><div class="ea-req-time">'+r.timestamp+' &middot; '+r.requestedBy+'</div>'+(r.note?'<div style="font-size:12px;color:var(--navy);margin-top:4px;line-height:1.5">'+r.note+'</div>':'')+'</div>'+actions+'</div>';
    }).join(''):'<div class="ea-req-empty">No requests from this client yet.</div>';
    body='<div class="ea-req-list">'+rows+'</div>';
  }else{
    const cards=journeys.length?journeys.map(function(cj){
      const j=aiJourneys.find(function(x){return x.id===cj.journeyId;});if(!j)return '';
      const events=aiJourneyEvents[cj.journeyId]||[];
      const rows=events.map(function(e,i){
        const toggleable=e.chips.includes('AI Automated');
        const saved=(cj.scope&&cj.scope[i])?cj.scope[i]:null;
        const mode=saved?saved.mode:(toggleable?'ai':'manual');
        const nameSafe=e.name.replace(/'/g,"\\'");
        if(!toggleable){
          return '<div class="ai-scope-row ai-scope-row-manual">'
            +'<div class="ai-scope-name"><div class="ai-scope-name-text">'+(i+1)+'. '+e.name+'</div><div class="ai-timeline-chips">'+aiChips(e.chips)+'</div></div>'
            +'<div class="ai-scope-manual-badge">Manual step &mdash; requires human action</div>'
            +'</div>';
        }
        return '<div class="ai-scope-row">'
          +'<div class="ai-scope-name"><div class="ai-scope-name-text">'+(i+1)+'. '+e.name+'</div><div class="ai-timeline-chips">'+aiChips(e.chips)+'</div></div>'
          +'<div class="segmented ai-scope-mode-seg" id="aic-scope-mode-'+cj.id+'-'+i+'">'
          +'<button type="button" class="seg-btn'+(mode==='ai'?' active':'')+'" data-mode="ai" onclick="aiClientScopeModeChoose(this,\''+cj.id+'\','+i+',\'ai\',\''+nameSafe+'\')">AI</button>'
          +'<button type="button" class="seg-btn'+(mode==='manual'?' active':'')+'" data-mode="manual" onclick="aiClientScopeModeChoose(this,\''+cj.id+'\','+i+',\'manual\',\''+nameSafe+'\')">Manual</button>'
          +'</div></div>';
      }).join('');
      return '<div class="ep-form-card" style="margin-bottom:14px">'
        +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;gap:10px"><div style="font-size:14px;font-weight:700;color:var(--navy)">'+j.name+'</div><span class="status-pill '+(cj.status==='Active'?'active':'draft')+'">'+cj.status+'</span></div>'
        +'<div style="font-size:11.5px;color:var(--gray);margin-bottom:12px">Built '+cj.builtOn+' &middot; '+events.length+' steps &middot; '+j.category+'</div>'
        +'<div class="ai-scope-table">'+rows+'</div>'
        +'</div>';
    }).join(''):'<div class="ea-req-empty">No journeys have been built for this client yet.</div>';
    body=cards;
  }
  return tabBar+'<div class="lp-isb-body">'+header+body+'</div>';
}
function buildAIClientsListingHTML(){
  const rows=aiClients.map(function(c){
    const journeys=aiClientJourneys.filter(function(cj){return cj.clientId===c.id;});
    const journeyNames=journeys.length?journeys.map(function(cj){
      const j=aiJourneys.find(function(x){return x.id===cj.journeyId;});
      return j?j.name.replace(' Journey',''):cj.journeyId;
    }).join(', '):'No journeys built yet';
    const journeysCell=journeys.length
      ?'<div class="cell-primary">'+journeys.length+' '+(journeys.length===1?'Journey':'Journeys')+'</div><div class="cell-sub">'+journeyNames+'</div>'
      :'<span style="color:#9ca3af">'+journeyNames+'</span>';
    const pending=entityRequests.filter(function(r){return r.clientId===c.id&&r.type!=='manager-notify'&&r.type!=='journey-request-to-admin'&&r.status==='Pending';});
    const reqBadge=pending.length?'<span class="status-pill pending">'+pending.length+' Pending</span>':'<span style="color:#9ca3af;font-size:12px">No requests</span>';
    const lastActivity=(pending[0]&&pending[0].timestamp)||(journeys[0]&&journeys[0].builtOn)||'—';
    const defaultTab=pending.length?'requests':'journeys';
    return '<tr class="aic-client-row'+(aiClientSelectedId===c.id?' lp-row-selected':'')+'" id="aic-row-'+c.id+'" style="cursor:pointer" onclick="openAIClientSidebar(\''+c.id+'\',\''+defaultTab+'\')">'
      +'<td><div class="cell-primary">'+c.name+'</div><div class="cell-sub">'+c.plan+' &middot; '+c.employees+' employees</div></td>'
      +'<td>'+c.country+'</td>'
      +'<td style="font-size:12.5px">'+journeysCell+'</td>'
      +'<td>'+reqBadge+'</td>'
      +'<td class="cell-sub">'+lastActivity+'</td>'
      +'</tr>';
  }).join('');
  const sbInner=aiClientSelectedId?renderAIClientSidebar():'';
  return '<div class="ai-exec-page">'
    +'<p style="font-size:14px;font-weight:600;margin-bottom:4px">AI Executive</p>'
    +'<p style="font-size:12px;color:var(--gray);margin-bottom:20px;max-width:640px">Journeys built for each client, their step-by-step AI/human configuration, and any pending access requests.</p>'
    +'<div class="lp-split-wrap"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table"><thead><tr><th>Client</th><th>Country</th><th>Journeys Built</th><th>Requests</th><th>Last Activity</th></tr></thead><tbody>'
    +(rows||'<tr><td colspan="5" style="padding:24px;text-align:center;color:var(--gray)">No clients yet.</td></tr>')
    +'</tbody></table>'
    +'</div></div>'
    +'<div class="lp-split-sb'+(aiClientSelectedId?' open':'')+'" id="aic-split-sb"><div class="lp-isb" id="aic-isb-inner">'+sbInner+'</div></div>'
    +'</div></div>';
}

function buildAIExecutiveDashboardHTML(){
  const persona=portalRole==='entity-user'?getActivePersona():null;
  const visibleJourneyIds=portalRole==='entity-user'?activePersonaJourneyIds():null;
  const lockedRoadmapJourneys=cfgJourneys.filter(function(j){return j.locked;});
  const allAIJourneys=portalRole==='entity-user'
    ?aiJourneys.filter(function(j){return visibleJourneyIds.indexOf(j.id)>=0;})
    :aiJourneys.concat(lockedRoadmapJourneys);
  const visibleCategories=cfgJourneyCategories.filter(function(c){
    return allAIJourneys.some(function(j){return j.category===c.id;});
  });
  const showCategorySummary=portalRole==='super-admin';
  if(!showCategorySummary)cfgJourneyCategoryFilter='';
  if(cfgJourneyCategoryFilter&&!visibleCategories.some(function(c){return c.id===cfgJourneyCategoryFilter;}))cfgJourneyCategoryFilter='';
  const filteredAIJourneys=cfgJourneyCategoryFilter?allAIJourneys.filter(function(j){return j.category===cfgJourneyCategoryFilter;}):allAIJourneys;
  const activeCat=cfgJourneyCategoryFilter?visibleCategories.find(function(c){return c.id===cfgJourneyCategoryFilter;}):null;
  const catBoxes=showCategorySummary?'<div class="cfg-cat-grid" style="margin-bottom:16px">'
    +visibleCategories.map(function(c){
      const count=allAIJourneys.filter(function(j){return j.category===c.id;}).length;
      return cfgCatBoxHTML(c,count);
    }).join('')
    +'</div>':'';
  const catInfo=showCategorySummary&&activeCat?'<div style="font-size:12.5px;color:var(--gray);margin:2px 0 16px;display:flex;align-items:center;gap:10px">Showing <b style="color:var(--navy)">'+activeCat.name+'</b> journeys only<button class="cfg-cat-clear" onclick="cfgSetJourneyCategoryFilter(\'\')">Clear filter</button></div>':(persona?'<div class="role-scope-note"><span>'+persona.label+'</span> sees '+allAIJourneys.length+' journey'+(allAIJourneys.length===1?'':'s')+' where this role owns work.</div>':'');
  const cards=filteredAIJourneys.length?filteredAIJourneys.map(j=>{
    const isRoadmap=!!j.locked;
    const locked=isRoadmap?true:(portalRole!=='super-admin'&&!entityJourneyActivation[j.id]);
    const lockedTap=locked&&portalRole!=='super-admin';
    const isActive=!locked&&j.status==='Active';
    const cta=isActive?aiJourneyCTA(j):null;
    return '<div class="ai-journey-card ai-journey-card-lg'+(isActive?' ai-journey-card-active':'')+(locked?' ai-journey-card-locked':'')+'"'+(lockedTap?' style="cursor:pointer" onclick="showLockedJourneyToast(\''+j.id+'\',\''+j.name+'\')"':(locked?'':' onclick="viewAIJourney(\''+j.id+'\')"'))+'>'
      +(isActive?'<div class="ai-journey-active-badge"><span class="ai-journey-active-dot"></span>Activated</div>':'')
      +'<div class="ai-journey-card-top">'
      +'<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><div class="ai-journey-name">'+j.name+'</div>'+cfgCategoryBadge(j.category)+(locked?'<span class="ai-journey-lock-badge"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>Locked</span>':'')+'</div>'
      +'</div>'
      +'<div class="ai-journey-desc">'+j.desc+'</div>'
      +(!locked&&j.status==='Draft'
        ?'<div class="ai-journey-draft-banner" onclick="event.stopPropagation();startAutomateJourney(\''+j.id+'\')"><span class="ai-journey-draft-banner-text">Draft pending</span><span class="ai-journey-draft-banner-cta">Continue now to automate your journey &rarr;</span></div>'
        :'')
      +(cta?'<button class="btn btn-primary ai-journey-cta-btn" onclick="event.stopPropagation();'+cta.action+'">'+cta.label+'</button>':'')
      +'</div>';
  }).join(''):'<div class="ai-journey-card" style="text-align:center;color:var(--gray);font-size:12.5px;padding:32px">No journeys are assigned to this role in this category.</div>';
  const pendingCount=myTasksPendingCount();
  return '<div class="ai-exec-page">'
    +'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:20px">'
    +'<div><p style="font-size:14px;font-weight:600;margin-bottom:4px">AI Executive</p><p style="font-size:12px;color:var(--gray);margin:0;max-width:720px">'+(persona?'Journeys routed to '+persona.label+' based on Enterprise Workflow ownership. Manual Mode stays available; Enable Agent uses the existing agentic workflow.':'Select and run the journeys enabled for this entity. Operational monitoring lives in Configure > Operations Cockpit.')+'</p></div>'
    +'<div style="display:flex;gap:8px;flex-shrink:0">'
    +'<button class="btn btn-secondary btn-sm" onclick="navigatePage(\'my-tasks\')">My Tasks'+(pendingCount?' <span class="badge" style="background:var(--orange);color:#fff;margin-left:6px">'+pendingCount+'</span>':'')+'</button>'
    +(portalRole==='entity-admin'?'<button class="btn btn-secondary btn-sm" onclick="navigatePage(\'operations-cockpit\')">Operations Cockpit</button>':'')
    +(portalRole==='super-admin'?'<button class="btn btn-primary btn-sm" onclick="startAutomateJourneyPicker()">+ Create Your Journey</button>':'')
    +'</div>'
    +'</div>'
    +catBoxes
    +catInfo
    +'<div class="ai-journey-grid ai-journey-grid-lg">'+cards+'</div>'
    +'</div>';
}

function buildOperationsCockpitPageHTML(){
  return '<div class="ai-exec-page">'
    +cfgPageHead('Operations Cockpit','Monitor active journey runs, SLA risk, blocked steps, owners, next actions, escalations, audit signals, and manual-to-agent upgrade opportunities.')
    +buildOperationsCockpitHTML()
    +'</div>';
}
function cockpitRunNeedsAttention(r){
  return r.status==='Blocked'||(r.exceptions||[]).some(function(e){return e.status==='Open';})||(r.status==='Waiting Approval'&&r.blockedReason&&r.blockedReason!=='None');
}
function cockpitRunOwnerDepartment(r){
  const steps=manualJourneySteps(r.journeyId);
  const st=steps[r.currentStepIdx]||{};
  const owner=st.ownerRole||r.ownerRole||'Entity Admin';
  return cockpitDeptById(manualStepOwnerDeptId(owner)).name;
}
function cockpitQueueItems(activeRuns){
  const items=[];
  activeRuns.forEach(function(r){
    const openEx=(r.exceptions||[]).filter(function(e){return e.status==='Open';});
    if(openEx.length){
      openEx.forEach(function(e,i){
        items.push({run:r,kind:'exception',idx:i,title:e.type,resolution:e.suggestedResolution});
      });
    }else if(cockpitRunNeedsAttention(r)){
      const c=cockpitRunComputed(r);
      const ownerName=manualStepOwnerName(c.st.ownerRole||r.ownerRole||'Entity Admin');
      items.push({run:r,kind:'approval',idx:-1,title:(r.blockedReason&&r.blockedReason!=='None')?r.blockedReason:'Approval required',resolution:'Waiting on '+ownerName+' to review and approve.'});
    }
  });
  items.sort(function(a,b){
    const rank={High:0,Medium:1,Low:2};
    return (rank[a.run.slaRisk]||3)-(rank[b.run.slaRisk]||3);
  });
  return items;
}
function buildOperationsCockpitHTML(){
  const activeRuns=manualJourneyRuns.filter(function(r){return r.status!=='Completed';}).concat(aiAllPendingRuns().map(function(x){
    const ownerRole=x.run.ownerRole||'Entity Admin';
    return {runId:x.run.runId,journeyId:x.journey.id,subject:x.run.client,entity:'Dhi Hyperlocal',mode:'Agent',currentStepIdx:x.run.currentStepIdx,status:x.run.status,slaRisk:x.run.status==='Exception'?'High':'Medium',blockedReason:x.run.exceptionNote||'Approval required',escalation:x.run.status==='Exception'?'Entity Admin in 2h':'None',manualHours:0,agentEstimateHours:0,contractRecordId:x.run.contractRecordId,exceptions:x.run.status==='Exception'?[{type:'Agent exception',ownerRole:ownerRole,status:'Open',suggestedResolution:x.run.exceptionNote||'Review run detail.'}]:[],audit:['Agentic run tracked from existing automation flow']};
  }));
  const blocked=activeRuns.filter(cockpitRunNeedsAttention).length;
  const openExceptionCount=activeRuns.reduce(function(sum,r){return sum+(r.exceptions||[]).filter(function(e){return e.status==='Open';}).length;},0);

  // --- Active Journey Runs (unchanged) — reached via the "Active Runs" stat card ---
  const rows=activeRuns.slice(0,8).map(function(r,idx){
    const c=cockpitRunComputed(r);
    const slaClass=r.slaRisk==='High'?'inactive':r.slaRisk==='Medium'?'unapproved':'active';
    const progressBar=c.isBlockedRun?('<div class="cockpit-progress cockpit-progress-ex"><span style="width:'+c.progress+'%"></span></div><div class="cockpit-progress-meta"><span>'+c.progress+'% complete</span><span>'+((r.escalation&&r.escalation!=='None')?r.escalation:'No escalation')+'</span></div>'):'';
    const ownerName=manualStepOwnerName(c.st.ownerRole||r.ownerRole||'Entity Admin');
    const stepName=c.st.name||'this step';
    const isNotified=notifiedRunIds.has(r.runId);
    const notifyIcon=isNotified
      ?'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>'
      :'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
    const notifyBtn=isNotified
      ?'<button class="btn btn-secondary btn-sm cockpit-notify-btn notified" disabled>'+notifyIcon+'Notified</button>'
      :'<button class="btn btn-secondary btn-sm cockpit-notify-btn" onclick="event.stopPropagation();notifyRunOwner(\''+r.runId+'\',\''+ownerName+'\',\''+stepName+'\',\''+(c.st.ownerRole||'')+'\')">'+notifyIcon+'Send Notification</button>';
    const slaPriorityLabel={High:'High Priority',Medium:'Medium Priority',Low:'Low Priority'};
    return '<div class="cockpit-run-card" onclick="openCockpitRunSidebar(\''+r.runId+'\')">'
      +'<div class="cockpit-run-head"><div class="cockpit-run-num">'+(idx+1)+'</div><div class="cockpit-run-head-main"><div class="cockpit-run-id">'+r.runId+'</div><div class="cockpit-run-entity">'+(r.entity||'Dhi Hyperlocal')+'</div></div><span class="status-pill '+slaClass+(c.isBlockedRun?' cockpit-pill-ex':'')+'">'+(slaPriorityLabel[r.slaRisk]||r.slaRisk)+'</span></div>'
      +progressBar
      +'<div class="cockpit-run-mini-sub"><span>'+(r.subject||c.j.name||r.journeyId)+'</span>'+notifyBtn+'</div>'
      +'</div>';
  }).join('')||'<div class="cockpit-empty-state">No active runs right now.</div>';
  const activeRunsPanel='<div class="listing-card dash-panel cockpit-run-panel"><div class="dash-panel-head"><div>Active Journey Runs</div><span>Live operator queue</span></div><div class="cockpit-run-list">'+rows+'</div></div>';

  const sidebarRun=cockpitSidebarRunId?activeRuns.find(function(r){return r.runId===cockpitSidebarRunId;}):null;
  const sidebarOverlay=sidebarRun?('<div class="ts-overlay"><div class="ts-overlay-bg" onclick="closeCockpitRunSidebar()"></div><div class="ts-overlay-panel">'+buildCockpitRunSidebarHTML(sidebarRun)+'</div></div>'):'';

  // --- Exception-First Queue — the view reached via the "Exceptions & Blockers" stat card ---
  const allItems=cockpitQueueItems(activeRuns);
  const highRisk=allItems.filter(function(x){return x.run.slaRisk==='High';}).length;
  const runFilters=[
    ['all','All',allItems.length],
    ['manual','Manual',allItems.filter(function(x){return x.run.mode==='Manual';}).length],
    ['agent','Agent & Hybrid',allItems.filter(function(x){return x.run.mode==='Agent'||x.run.mode==='Hybrid';}).length],
    ['high','High Priority',highRisk]
  ];
  const filteredItems=allItems.filter(function(x){
    if(cockpitRunFilter==='manual')return x.run.mode==='Manual';
    if(cockpitRunFilter==='agent')return x.run.mode==='Agent'||x.run.mode==='Hybrid';
    if(cockpitRunFilter==='high')return x.run.slaRisk==='High';
    return true;
  });
  const filterMeta={
    all:{title:'All Open Items',sub:'Exceptions and approvals blocking a journey',note:'Every open exception and pending approval across manual, hybrid, and agentic runs — highest severity first.'},
    manual:{title:'Manual Queue',sub:'Human-owned exceptions and approvals',note:'Open items on manually-run journeys that need direct action from the owning team.'},
    agent:{title:'Agent & Hybrid Queue',sub:'Automation handoffs needing a human',note:'Open items where an agent hit a blocker or approval gate and handed off to a human owner.'},
    high:{title:'High Priority',sub:'Closest to SLA breach or escalation',note:'Only high-risk items, so the owning teams can act before escalation triggers.'}
  }[cockpitRunFilter]||{};
  const filterHeader='<div class="cockpit-filter-context"><div><strong>'+filterMeta.title+'</strong><span>'+filterMeta.note+'</span></div><em>'+filterMeta.sub+'</em></div>';
  const filterBar='<div class="cockpit-filter-bar">'+runFilters.map(function(f){return '<button class="cockpit-filter-chip '+(cockpitRunFilter===f[0]?'active':'')+'" onclick="setCockpitRunFilter(\''+f[0]+'\')">'+f[1]+' <span>'+f[2]+'</span></button>';}).join('')+'</div>';
  const severityGroup=function(label,cls,list){
    if(!list.length)return '';
    return '<div class="cockpit-ex-group"><div class="cockpit-ex-group-head '+cls+'"><span class="cockpit-ex-group-dot"></span>'+label+'<span>'+list.length+'</span></div><div class="cockpit-ex-list">'+list.map(cockpitExceptionCardHTML).join('')+'</div></div>';
  };
  const groupsHTML=filteredItems.length
    ?severityGroup('High Priority','high',filteredItems.filter(function(x){return x.run.slaRisk==='High';}))
      +severityGroup('Medium Priority','medium',filteredItems.filter(function(x){return x.run.slaRisk==='Medium';}))
      +severityGroup('Low Priority','low',filteredItems.filter(function(x){return x.run.slaRisk!=='High'&&x.run.slaRisk!=='Medium';}))
    :('<div class="cockpit-empty-state cockpit-empty-clear"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div><strong>All clear</strong><span>No open exceptions or approvals'+(cockpitRunFilter==='all'?'':' in this filter')+'. Journeys are running smoothly.</span></div></div>');
  const queuePanel='<div class="listing-card dash-panel cockpit-queue-panel"><div class="dash-panel-head"><div>Exception-First Queue</div><span>'+filteredItems.length+' open &middot; ranked by severity</span></div>'+filterHeader+filterBar+groupsHTML+'</div>';

  const departments=activeRuns.reduce(function(list,r){
    if(!cockpitRunNeedsAttention(r))return list;
    const d=cockpitRunOwnerDepartment(r);
    if(list.indexOf(d)<0)list.push(d);
    return list;
  },[]);
  const activeRunsStat='<div class="stat-card cockpit-stat-clickable" onclick="openCockpitRunsView()"><div class="stat-label"><span>Active Runs</span></div><div class="stat-val">'+activeRuns.length+'</div><div class="stat-sub">Manual, agentic, and hybrid</div></div>';
  const deptStat='<div class="stat-card cockpit-stat-clickable" onclick="openCockpitDepartmentOverview()"><div class="stat-label"><span>Departments</span></div><div class="stat-val">'+cockpitDepartmentDirectory.length+'</div><div class="stat-sub">Click to view department ownership</div></div>';
  const exceptionsStat='<div class="stat-card cockpit-stat-clickable" onclick="openCockpitExceptionsView()"><div class="stat-label"><span>Exceptions & Blockers</span></div><div class="stat-val" style="color:#dc2626">'+(openExceptionCount||blocked)+'</div><div class="stat-sub">Open issues needing resolution</div></div>';
  const mainContent=cockpitDepartmentView==='overview'
    ?buildCockpitDepartmentOverviewHTML()
    :cockpitDepartmentView==='detail'
      ?buildCockpitDepartmentDetailHTML()
      :cockpitShowExceptionQueue
        ?queuePanel
        :activeRunsPanel;
  return '<div class="cockpit-wrap">'
    +'<div class="stat-grid dash-stat-grid cockpit-stats stat-grid-3">'+activeRunsStat+deptStat+exceptionsStat+'</div>'
    +mainContent
    +'</div>'
    +sidebarOverlay;
}
// -- Shared "exception/approval needs action" card. Ops Cockpit (Entity Admin, opts default) shows Notify + Resolve for everyone's blockers; My Tasks (opts.hideNotify, the owner's own view) shows just Resolve, since notifying yourself makes no sense, plus a "New" flag when the item arrived via a notify-owner nudge. --
function exceptionQueueCardHTML(x,opts){
  opts=opts||{};
  const r=x.run;
  const sev=r.slaRisk==='High'?'High':r.slaRisk==='Medium'?'Medium':'Low';
  const isManual=String(r.runId).indexOf('MAN-')===0;
  const dept=cockpitRunOwnerDepartment(r);
  const isException=x.kind==='exception';
  const linkedContract=(!isManual&&r.contractRecordId)?contractsData.find(function(cc){return cc.id===r.contractRecordId;}):null;
  const resolveAction=isException
    ?(isManual?'openExceptionResolver(\''+r.runId+'\','+x.idx+')':(linkedContract?"navigatePage('contracts');openCtSidebar("+linkedContract.id+",'compliance')":'openExceptionResolver(\''+r.runId+'\','+x.idx+',\''+r.journeyId+'\')'))
    :'openCockpitRun(\''+r.runId+'\',\''+r.journeyId+'\')';
  const resolveLabel=isException?(isManual?'Resolve':'Review &amp; Resolve'):'Review &amp; Approve';
  const kindTag=isException?'':'<span class="cockpit-ex-kind">Approval</span>';
  const escalationTag=(r.escalation&&r.escalation!=='None')?'<span class="cockpit-ex-escalation">Escalates: '+r.escalation+'</span>':'';
  const c=cockpitRunComputed(r);
  const ownerName=manualStepOwnerName(c.st.ownerRole||r.ownerRole||'Entity Admin');
  const stepName=c.st.name||'this step';
  const isNotified=notifiedRunIds.has(r.runId);
  const notifyIcon=isNotified
    ?'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>'
    :'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
  const notifyBtn=opts.hideNotify?'':(isNotified
    ?'<button class="btn btn-secondary btn-sm cockpit-notify-btn notified" disabled>'+notifyIcon+'Notified</button>'
    :'<button class="btn btn-secondary btn-sm cockpit-notify-btn" onclick="event.stopPropagation();notifyRunOwner(\''+r.runId+'\',\''+ownerName+'\',\''+stepName+'\',\''+(c.st.ownerRole||'')+'\')">'+notifyIcon+'Notify Owner</button>');
  const newFlag=(opts.flagNotified&&isNotified)?'<span class="cockpit-ex-new-flag">New</span>':'';
  const deptEl=opts.hideDeptLink
    ?'<span class="cockpit-ex-dept">'+dept+'</span>'
    :'<span class="cockpit-ex-dept" onclick="event.stopPropagation();openCockpitDepartmentDetail(\''+dept.toLowerCase()+'\')">'+dept+'</span>';
  const cardClick=opts.cardClick||('openCockpitRunSidebar(\''+r.runId+'\')');
  return '<div class="cockpit-ex-card" onclick="'+cardClick+'">'
    +'<div class="cockpit-ex-left"><div><div class="cockpit-ex-title">'+newFlag+x.title+kindTag+'</div><div class="cockpit-ex-meta"><span>'+r.runId+'</span><span>'+r.mode+'</span>'+deptEl+'<span>'+(r.subject||'—')+'</span>'+escalationTag+'</div><div class="cockpit-ex-resolution">'+x.resolution+'</div></div></div>'
    +'<div class="cockpit-ex-actions">'+notifyBtn+'<button class="btn btn-primary btn-sm cockpit-ex-btn" onclick="event.stopPropagation();'+resolveAction+'">'+resolveLabel+'</button></div>'
    +'</div>';
}
function cockpitExceptionCardHTML(x){return exceptionQueueCardHTML(x);}
function cockpitRunComputed(r){
  const j=aiJourneys.find(function(x){return x.id===r.journeyId;})||cfgJourneys.find(function(x){return x.id===r.journeyId;})||{};
  const steps=manualJourneySteps(r.journeyId);
  const st=steps[r.currentStepIdx]||{};
  const openExceptions=(r.exceptions||[]).filter(function(e){return e.status==='Open';});
  const next=openExceptions.length?openExceptions[0].suggestedResolution:(r.status==='Completed'?'Archive run':(st.manualAction||'Review run detail'));
  const total=Math.max(steps.length,1);
  const progress=r.status==='Completed'?100:Math.min(100,Math.round(((r.currentStepIdx||0)+1)/total*100));
  const isBlockedRun=r.status==='Blocked'||openExceptions.length>0||(r.status==='Waiting Approval'&&r.blockedReason&&r.blockedReason!=='None');
  return {j:j,steps:steps,st:st,openExceptions:openExceptions,next:next,progress:progress,isBlockedRun:isBlockedRun};
}
function buildCockpitRunSidebarHTML(r){
  const c=cockpitRunComputed(r);
  const owner=c.st.ownerRole||r.ownerRole||'Entity Admin';
  const slaClass=r.slaRisk==='High'?'inactive':r.slaRisk==='Medium'?'unapproved':'active';
  const blockerText=c.openExceptions.length?c.openExceptions[0].type:(r.blockedReason&&r.blockedReason!=='None'?r.blockedReason:'No blocker');
  const progressBar='<div class="cockpit-progress"><span style="width:'+c.progress+'%"></span></div><div class="cockpit-progress-meta"><span>'+c.progress+'% complete</span><span>'+((r.escalation&&r.escalation!=='None')?r.escalation:'No escalation')+'</span></div>';
  const fieldsData=[['Journey',(c.j&&c.j.name)||r.journeyId],['Employee',r.subject||'—'],['Current step',c.st.name||'Current step'],['Owner',owner],['Mode',r.mode],['Status',r.status]];
  if(c.isBlockedRun)fieldsData.push(['Blocker',blockerText],['Escalation',(r.escalation&&r.escalation!=='None')?r.escalation:'None']);
  const fields=fieldsData.map(function(item){return '<div class="cockpit-sb-field"><span class="cockpit-sb-flabel">'+item[0]+'</span><span class="cockpit-sb-fval">'+item[1]+'</span></div>';}).join('');
  const exIdx=r.exceptions?r.exceptions.findIndex(function(e){return e.status==='Open';}):-1;
  const isManualRun=String(r.runId).indexOf('MAN-')===0;
  const resolveBtn=exIdx<0?'':(isManualRun
    ?'<button class="btn btn-secondary btn-sm" style="width:100%;margin-top:8px" onclick="closeCockpitRunSidebar();openManualExceptionResolver(\''+r.runId+'\','+exIdx+')">Resolve Exception</button>'
    :'<div class="cockpit-sb-hint">Resolve this exception from the full run detail.</div>');
  return '<div class="ts-sb-head"><span class="ts-sb-title">'+r.runId+'</span><button class="ts-sb-close" onclick="closeCockpitRunSidebar()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'<div class="ts-sb-inner">'
    +'<div class="ts-sb-date-box"><div><div class="ts-sb-date-val">'+(r.entity||'Dhi Hyperlocal')+'</div><div class="ts-sb-date-day"><span class="status-pill '+slaClass+'" style="margin-top:4px">'+({High:'High Priority',Medium:'Medium Priority',Low:'Low Priority'}[r.slaRisk]||r.slaRisk)+'</span></div></div></div>'
    +progressBar
    +'<div class="ts-sb-section">'+fields+'</div>'
    +'<div class="ts-sb-section"><div class="ts-sb-sec-title">Next Action</div><p class="cockpit-sb-note">'+c.next+'</p></div>'
    +'<div class="ts-sb-actions"><button class="btn btn-primary btn-sm" style="width:100%" onclick="closeCockpitRunSidebar();openCockpitRun(\''+r.runId+'\',\''+r.journeyId+'\')">Open Full Run</button>'+resolveBtn+'</div>'
    +'</div>';
}
function openCockpitRunSidebar(runId){cockpitSidebarRunId=runId;renderADTPage();}
function closeCockpitRunSidebar(){cockpitSidebarRunId=null;renderADTPage();}
function openCockpitDepartmentOverview(){cockpitDepartmentView='overview';renderADTPage();}
function openCockpitRunsView(){cockpitDepartmentView='';cockpitRunFilter='all';cockpitShowExceptionQueue=false;cockpitSidebarRunId=null;renderADTPage();}
function openCockpitExceptionsView(){cockpitDepartmentView='';cockpitRunFilter='all';cockpitShowExceptionQueue=true;cockpitSidebarRunId=null;renderADTPage();}
function openCockpitDepartmentDetail(id){selectedCockpitDepartmentId=id;cockpitDepartmentView='detail';renderADTPage();}
function closeCockpitDepartmentView(){cockpitDepartmentView='';renderADTPage();}
function cockpitDeptById(id){return cockpitDepartmentDirectory.find(function(d){return d.id===id;})||cockpitDepartmentDirectory[0];}
function cockpitDeptJourneysHTML(member){
  return '<div class="cockpit-member-journeys">'+(member.journeys||[]).map(function(j){return '<span>'+j+'</span>';}).join('')+'</div>';
}
function buildCockpitDepartmentOverviewHTML(){
  const cards=cockpitDepartmentDirectory.map(function(d){
    const people=1+(d.managers||[]).length+(d.associates||[]).length;
    const journeys=[].concat(d.admin.journeys||[],...(d.managers||[]).map(function(a){return a.journeys||[];}),...(d.associates||[]).map(function(a){return a.journeys||[];})).filter(function(v,i,a){return a.indexOf(v)===i;});
    const leadInitials=d.admin.name.split(' ').map(function(p){return p[0];}).join('').slice(0,2).toUpperCase();
    return '<div class="cockpit-dept-card" onclick="openCockpitDepartmentDetail(\''+d.id+'\')">'
      +'<div class="cockpit-dept-top">'
        +'<div class="cockpit-dept-identity"><div><div class="cockpit-dept-name">'+d.name+'</div><div class="cockpit-dept-members">'+people+' member'+(people===1?'':'s')+'</div></div></div>'
        +'<span class="cockpit-dept-journeys-tag">'+journeys.length+' journey'+(journeys.length===1?'':'s')+'</span>'
      +'</div>'
      +'<p class="cockpit-dept-summary">'+d.summary+'</p>'
      +'<div class="cockpit-dept-owner-row"><span class="cockpit-dept-owner-avatar">'+leadInitials+'</span><div class="cockpit-dept-owner-info"><span>Team Lead</span><strong>'+d.admin.name+'</strong></div></div>'
      +'</div>';
  }).join('');
  return '<div class="listing-card dash-panel cockpit-dept-panel"><div class="dash-panel-head"><div>Department Overview</div><span><button class="btn btn-secondary btn-sm" onclick="closeCockpitDepartmentView()">Back to runs</button></span></div><div class="cockpit-dept-grid">'+cards+'</div></div>';
}
function buildCockpitDepartmentDetailHTML(){
  const d=cockpitDeptById(selectedCockpitDepartmentId);
  const memberCard=function(m,kind,idx){
    const removeBtn=kind==='admin'?'':'<button class="cockpit-member-remove" title="Remove access" onclick="event.stopPropagation();openCockpitRemoveMemberConfirm(\''+d.id+'\',\''+kind+'\','+idx+')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
    return '<div class="cockpit-member-card '+kind+'">'
      +'<div class="cockpit-member-avatar">'+m.name.split(' ').map(function(p){return p[0];}).join('').slice(0,2)+'</div>'
      +'<div class="cockpit-member-main"><div class="cockpit-member-name">'+m.name+'</div><div class="cockpit-member-meta">'+m.title+' · '+m.email+'</div>'+cockpitDeptJourneysHTML(m)+'</div>'
      +'<div class="cockpit-member-side"><button class="btn btn-secondary btn-sm cockpit-member-manage-btn" onclick="event.stopPropagation();openCockpitManageMemberModal(\''+d.id+'\',\''+kind+'\','+idx+')">Manage</button>'+removeBtn+'</div>'
      +'</div>';
  };
  const managers=(d.managers||[]).map(function(m,i){return memberCard(m,'manager',i);}).join('');
  const associates=(d.associates||[]).map(function(m,i){return memberCard(m,'associate',i);}).join('');
  return '<div class="listing-card dash-panel cockpit-dept-detail"><div class="dash-panel-head"><div>'+d.name+' Department</div><span><button class="btn btn-secondary btn-sm" onclick="openCockpitDepartmentOverview()">All departments</button></span></div>'
    +'<div class="cockpit-dept-detail-hero"><div><strong>'+d.summary+'</strong><p>Review ownership by department and manage journey assignments for each member.</p></div></div>'
    +'<div class="cockpit-role-block"><div class="cockpit-role-title">'+d.admin.title+'</div>'+memberCard(d.admin,'admin',0)+'</div>'
    +((d.managers||[]).length?'<div class="cockpit-role-block"><div class="cockpit-role-title">Managers</div><div class="cockpit-member-grid">'+managers+'</div></div>':'')
    +'<div class="cockpit-role-block"><div class="cockpit-role-title">Associates</div><div class="cockpit-member-grid">'+associates+'</div></div>'
    +'</div>';
}
function cockpitMemberByKind(d,kind,idx){
  if(kind==='admin')return d.admin;
  const list=kind==='manager'?(d.managers||[]):(d.associates||[]);
  return list[idx];
}
function openCockpitManageMemberModal(deptId,kind,idx){
  const d=cockpitDeptById(deptId);
  const m=cockpitMemberByKind(d,kind,idx);if(!m)return;
  const assigned=m.journeys||[];
  const deptJourneys=[].concat(d.admin.journeys||[],...(d.managers||[]).map(function(a){return a.journeys||[];}),...(d.associates||[]).map(function(a){return a.journeys||[];})).filter(function(v,i,a){return a.indexOf(v)===i;});
  const checks=deptJourneys.map(function(name){return '<label class="cockpit-add-check"><input type="checkbox" value="'+name.replace(/"/g,'&quot;')+'" '+(assigned.indexOf(name)>=0?'checked':'')+'> '+name+'</label>';}).join('');
  const overlay=document.getElementById('ct-modal-overlay');if(!overlay)return;
  overlay.innerHTML='<div class="ct-modal cockpit-add-member-modal" onclick="event.stopPropagation()">'
    +'<div class="ct-modal-hdr"><span class="ct-modal-title">Manage Journeys — '+m.name+'</span><button class="ct-modal-close" onclick="closeCtModal()">×</button></div>'
    +'<div class="cockpit-manage-meta">'+m.title+' · '+m.email+'</div>'
    +'<div class="manual-res-section-title">Available journeys</div><div class="cockpit-add-checks">'+checks+'</div>'
    +'<div class="manual-res-footer"><div>Select the journeys this member should be assigned to.</div><button class="btn btn-secondary" onclick="closeCtModal()">Cancel</button><button class="btn btn-primary" onclick="saveCockpitMemberJourneys(\''+deptId+'\',\''+kind+'\','+idx+')">Save</button></div>'
    +'</div>';
  overlay.style.display='flex';
}
function saveCockpitMemberJourneys(deptId,kind,idx){
  const d=cockpitDeptById(deptId);
  const m=cockpitMemberByKind(d,kind,idx);if(!m)return;
  const journeys=[].slice.call(document.querySelectorAll('.cockpit-add-check input:checked')).map(function(x){return x.value;});
  m.journeys=journeys;
  closeCtModal();
  selectedCockpitDepartmentId=deptId;cockpitDepartmentView='detail';
  renderADTPage();
  if(typeof showAiToast==='function')showAiToast('Journeys updated',m.name+' is now assigned to '+journeys.length+' journey'+(journeys.length===1?'':'s')+'.');
}
function openCockpitRemoveMemberConfirm(deptId,kind,idx){
  const d=cockpitDeptById(deptId);
  const list=kind==='manager'?(d.managers||[]):(d.associates||[]);
  const m=list[idx];if(!m)return;
  const overlay=document.getElementById('ct-modal-overlay');if(!overlay)return;
  overlay.innerHTML='<div class="ct-modal cockpit-remove-modal" onclick="event.stopPropagation()">'
    +'<div class="ct-modal-hdr"><span class="ct-modal-title">Remove Member Access</span><button class="ct-modal-close" onclick="closeCtModal()">×</button></div>'
    +'<div class="cockpit-remove-body">You want to remove <strong>'+m.name+'</strong> access?</div>'
    +'<div class="manual-res-footer"><div></div><button class="btn btn-secondary" onclick="closeCtModal()">Cancel</button><button class="btn btn-primary" onclick="removeCockpitDepartmentMember(\''+deptId+'\',\''+kind+'\','+idx+')">Remove</button></div>'
    +'</div>';
  overlay.style.display='flex';
}
function removeCockpitDepartmentMember(deptId,kind,idx){
  const d=cockpitDeptById(deptId);
  const list=kind==='manager'?(d.managers||[]):(d.associates||[]);
  const m=list[idx];if(!m)return;
  list.splice(idx,1);
  closeCtModal();
  selectedCockpitDepartmentId=deptId;cockpitDepartmentView='detail';
  renderADTPage();
  if(typeof showAiToast==='function')showAiToast('Access removed',m.name+' was removed from '+d.name+'.');
}
function setCockpitRunFilter(filter){
  cockpitRunFilter=filter||'all';
  renderADTPage();
}
function openCockpitRun(runId,journeyId){
  if(String(runId).indexOf('MAN-')===0){selectedManualRunId=runId;manualJourneyBackPage='operations-cockpit';navigatePage('manual-journey-run');return;}
  if(journeyId)selectedAIJourneyId=journeyId;
  viewAIRun(runId);
}
function openExceptionResolver(runId,idx,journeyId){
  if(String(runId).indexOf('MAN-')===0){openManualExceptionResolver(runId,idx);return;}
  openCockpitRun(runId,journeyId);
}
function manualResolutionOptions(ex,run,step){
  const type=(ex&&ex.type)||'Exception';
  if(type==='Missing compliance rule')return [
    {id:'add-rule',title:'Add missing compliance rule',desc:'Use when the statutory rule is valid and should become part of the reusable country compliance setup.',steps:['Open Compliance Hub for the employee country','Add the missing work-permit/statutory rule with effective date','Attach source reference or policy note','Re-run the compliance check and save evidence']},
    {id:'override',title:'Attach override evidence',desc:'Use only when this employee has an approved exception or temporary business override.',steps:['Upload legal/compliance approval note','Capture approver name and validity window','Add reason for bypassing the missing rule','Mark the exception as resolved with audit evidence']}
  ];
  if(type==='Timesheet discrepancy')return [
    {id:'reconcile-timesheet',title:'Reconcile attendance and leave',desc:'Use when payable days, leave days, or holidays do not match before payroll calculation.',steps:['Open Timesheets and Leave records for the pay period','Compare present days, approved leave, holidays, and overtime','Update payable days with correction note','Re-run payroll validation before salary calculation']},
    {id:'manager-confirmation',title:'Request manager confirmation',desc:'Use when attendance cannot be corrected without manager confirmation.',steps:['Send discrepancy summary to Reporting Manager','Capture approval or correction comment','Attach confirmation to payroll run','Recalculate salary after confirmation']}
  ];
  if(type==='Salary mismatch')return [
    {id:'recalculate-salary',title:'Recalculate salary inputs',desc:'Use when gross pay, deductions, statutory rates, or net pay do not align.',steps:['Review payheads and employee compensation setup','Recalculate gross, deductions, statutory rates, and net pay','Compare before/after salary values','Attach calculation note and continue approval']}
  ];
  return [
    {id:'correct-evidence',title:'Correct evidence and revalidate',desc:'Use when the current step needs a manual correction before it can continue.',steps:['Review source data and documents used by this step','Add missing information or correction note','Attach supporting evidence','Re-run validation and resolve the blocker']}
  ];
}
function openManualExceptionResolver(runId,idx){
  const run=getManualRun(runId);if(!run||!run.exceptions[idx])return;
  const ex=run.exceptions[idx];
  const step=manualJourneySteps(run.journeyId)[run.currentStepIdx]||{};
  const overlay=document.getElementById('ct-modal-overlay');if(!overlay)return;
  const options=manualResolutionOptions(ex,run,step);
  const optionCards=options.map(function(o,i){
    return '<label class="manual-res-option '+(i===0?'selected':'')+'" onclick="selectManualResolutionOption(this)">'
      +'<input type="radio" name="manual-resolution-option" value="'+o.id+'" data-title="'+o.title.replace(/"/g,'&quot;')+'" '+(i===0?'checked':'')+'>'
      +'<div><strong>'+o.title+'</strong><span>'+o.desc+'</span><ol>'+o.steps.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ol></div>'
      +'</label>';
  }).join('');
  overlay.innerHTML='<div class="ct-modal manual-res-modal" onclick="event.stopPropagation()">'
    +'<div class="ct-modal-hdr"><span class="ct-modal-title">Resolve Blocker</span><button class="ct-modal-close" onclick="closeCtModal()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'<div class="manual-res-body">'
    +'<div class="manual-res-issue"><div><span>Issue</span><strong>'+ex.type+'</strong><p>'+ex.suggestedResolution+'</p></div><div><span>Owner</span><strong>'+ex.ownerRole+'</strong><p>'+run.runId+' · '+(step.name||'Current step')+'</p></div></div>'
    +'<div class="manual-res-layout"><div><div class="manual-res-section-title">Choose resolution path</div><div class="manual-res-options">'+optionCards+'</div></div>'
    +'<div class="manual-res-confirm"><div class="manual-res-section-title">Completion checklist</div>'
    +'<label><input type="checkbox" class="manual-res-check"> I completed the selected resolution steps.</label>'
    +'<label><input type="checkbox" class="manual-res-check"> I attached or verified supporting evidence.</label>'
    +'<label><input type="checkbox" class="manual-res-check"> I reviewed the audit impact before closing.</label>'
    +'<textarea id="manual-res-note" placeholder="Add resolution note, source reference, or approval comment"></textarea>'
    +'</div></div></div>'
    +'<div class="manual-res-footer"><div>Resolution updates blocker status, run status, and audit trail.</div><button class="btn btn-secondary" onclick="closeCtModal()">Cancel</button><button class="btn btn-primary" onclick="applyManualExceptionResolution(\''+runId+'\','+idx+')">Apply Resolution</button></div>'
    +'</div>';
  overlay.style.display='flex';
}
function selectManualResolutionOption(el){
  const wrap=el.parentElement;if(!wrap)return;
  [].slice.call(wrap.querySelectorAll('.manual-res-option')).forEach(function(x){x.classList.remove('selected');});
  el.classList.add('selected');
  const input=el.querySelector('input');if(input)input.checked=true;
}
function applyManualExceptionResolution(runId,idx){
  const picked=document.querySelector('input[name="manual-resolution-option"]:checked');
  const title=picked?picked.getAttribute('data-title'):'Manual resolution completed';
  const checks=[].slice.call(document.querySelectorAll('.manual-res-check'));
  const checked=checks.filter(function(x){return x.checked;}).length;
  if(checked<checks.length){
    if(typeof showAiToast==='function')showAiToast('Checklist incomplete','Confirm all resolution checks before applying the blocker resolution.');
    return;
  }
  const noteEl=document.getElementById('manual-res-note');
  const note=noteEl?noteEl.value.trim():'';
  resolveManualException(runId,idx,{title:title,note:note,evidenceChecks:checked});
  closeCtModal();
}

// -- MANUAL MODE: jump a non-owning viewer straight to the persona who owns the run's current step, landing on this exact run (not that persona's last-visited page) --
function jumpToStepOwner(runId){
  const run=getManualRun(runId);if(!run)return;
  const step=manualJourneySteps(run.journeyId)[run.currentStepIdx];if(!step)return;
  const personaId=manualStepOwnerPersonaId(step.ownerRole);if(!personaId)return;
  setActivePersona(personaId);
  selectedManualRunId=run.runId;
  page='manual-journey-run';
  renderADTPage();
}
// -- MANUAL MODE: run preview modal, reused from any dashboard (same ct-modal shell + cockpit sidebar field styling) --
function openManualRunPreviewModal(runId){
  const run=getManualRun(runId);if(!run)return;
  const overlay=document.getElementById('ct-modal-overlay');if(!overlay)return;
  const c=cockpitRunComputed(run);
  const slaClass=run.slaRisk==='High'?'inactive':run.slaRisk==='Medium'?'unapproved':'active';
  const progressBar='<div class="cockpit-progress"><span style="width:'+c.progress+'%"></span></div><div class="cockpit-progress-meta"><span>'+c.progress+'% complete</span><span>'+(run.status||'')+'</span></div>';
  const fieldsData=[['Journey',(c.j&&c.j.name)||run.journeyId],['Employee',run.subject||'—'],['Current step',c.st.name||'—'],['Owner',c.st.ownerRole||'—'],['Mode',run.mode],['Status',run.status]];
  const fields=fieldsData.map(function(item){return '<div class="cockpit-sb-field"><span class="cockpit-sb-flabel">'+item[0]+'</span><span class="cockpit-sb-fval">'+item[1]+'</span></div>';}).join('');
  overlay.innerHTML='<div class="ct-modal" onclick="event.stopPropagation()">'
    +'<div class="ct-modal-hdr"><span class="ct-modal-title">'+run.runId+' &middot; <span class="status-pill '+slaClass+'">'+(run.slaRisk||'')+' Priority</span></span><button class="ct-modal-close" onclick="closeCtModal()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +progressBar
    +'<div style="margin-top:10px">'+fields+'</div>'
    +(c.next?'<p class="cockpit-sb-note" style="margin-top:12px">'+c.next+'</p>':'')
    +'<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px"><button class="btn btn-secondary" onclick="closeCtModal()">Close</button><button class="btn btn-primary" onclick="closeCtModal();selectedManualRunId=\''+run.runId+'\';manualJourneyBackPage=page||\'dashboard\';page=\'manual-journey-run\';renderADTPage();">Open Full Run</button></div>'
    +'</div>';
  overlay.style.display='flex';
}

// -- MANUAL MODE: compliance-step completion modal, opened from the Compliance Dashboard/My Tasks live queue and from the run page's "Open Compliance Hub" action. Handles any step that lives on the 'compliance' module (Contract Creation's Compliance Check, H2R's Work Permit Check / Country Compliance Fetch), building its checklist from the step's own manualAction text. --
function complianceChecklistItems(step){
  const raw=(step&&step.manualAction)||'';
  const clean=raw.replace(/^Open Compliance Hub,?\s*/i,'').replace(/\s*in Compliance Hub\.?$/i,'').replace(/\.$/,'').trim();
  if(!clean)return ['Confirm '+((step&&step.name)||'this step').toLowerCase()+' is complete'];
  const verbMatch=/^(check|collect|review|verify|validate)\b/i.exec(clean);
  const pastTense={check:'Checked',collect:'Collected',review:'Reviewed',verify:'Verified',validate:'Validated'}[verbMatch?verbMatch[1].toLowerCase():'check']||'Checked';
  const body=verbMatch?clean.slice(verbMatch[0].length).trim():clean;
  const parts=body.split(/,\s*|\s+and\s+/i).map(function(s){return s.replace(/^and\s+/i,'').trim();}).filter(Boolean);
  return (parts.length?parts:[clean]).map(function(p){return pastTense+' '+p;});
}
// -- Shared checklist+note body reused by both the standalone modal and the Contracts sidebar's Compliance tab, so confirmComplianceResolve() works verbatim in either surface. --
function complianceActionPanelHTML(run,step){
  const checklistItems=complianceChecklistItems(step);
  const checklistHTML=checklistItems.map(function(t){return '<label><input type="checkbox" class="compliance-resolve-check"> '+t+'</label>';}).join('');
  return '<div class="manual-res-issue"><div><span>Employee</span><strong>'+(run.subject||'—')+'</strong><p>'+run.runId+' &middot; '+(step.name||'Compliance Check')+'</p></div><div><span>SLA</span><strong>'+(step.sla||'—')+'</strong><p>'+(step.manualAction||'')+'</p></div></div>'
    +'<div class="manual-res-confirm"><div class="manual-res-section-title">Completion checklist</div>'
    +checklistHTML
    +'<textarea id="compliance-resolve-note" placeholder="Add a compliance note, source reference, or approval comment"></textarea>'
    +'</div>';
}
function openComplianceResolveModal(runId){
  const run=getManualRun(runId);if(!run)return;
  const step=manualJourneySteps(run.journeyId)[run.currentStepIdx]||{};
  const overlay=document.getElementById('ct-modal-overlay');if(!overlay)return;
  overlay.innerHTML='<div class="ct-modal manual-res-modal" onclick="event.stopPropagation()">'
    +'<div class="ct-modal-hdr"><span class="ct-modal-title">Complete '+(step.name||'Compliance Check')+'</span><button class="ct-modal-close" onclick="closeCtModal()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'<div class="manual-res-body">'+complianceActionPanelHTML(run,step)+'</div>'
    +'<div class="manual-res-footer"><div>Marking this complete advances the journey and notifies the next owner.</div><button class="btn btn-secondary" onclick="closeCtModal()">Cancel</button><button class="btn btn-primary" onclick="confirmComplianceResolve(\''+runId+'\')">Mark '+(step.name||'Compliance Check')+' Complete</button></div>'
    +'</div>';
  overlay.style.display='flex';
}
// -- Routes "act on this compliance step" to the real Contracts record when one is linked (Contract Creation), falling back to the standalone modal for journeys with no linked listing yet (H2R). --
function openComplianceHubForRun(runId){
  const run=getManualRun(runId);if(!run)return;
  if(run.journeyId==='contract-creation'&&run.contractRecordId&&contractsData.some(function(c){return c.id===run.contractRecordId;})){
    navigatePage('contracts');
    openCtSidebar(run.contractRecordId,'compliance',null,run.runId);
  }else{
    openComplianceResolveModal(runId);
  }
}
function confirmComplianceResolve(runId){
  const checks=[].slice.call(document.querySelectorAll('.compliance-resolve-check'));
  const checked=checks.filter(function(x){return x.checked;}).length;
  if(checked<checks.length){
    if(typeof showAiToast==='function')showAiToast('Checklist incomplete','Confirm every compliance check before marking this step complete.');
    return;
  }
  const noteEl=document.getElementById('compliance-resolve-note');
  const note=noteEl?noteEl.value.trim():'';
  resolveComplianceStepFromDashboard(runId,note);
  closeCtModal();
}
// -- Simulated document upload for a contract's compliance item: no real backend, just records the chosen file name on the item so the Compliance tab and resolution checks can react to it. --
function ctUploadComplianceDoc(contractId,itemIdx){
  const c=contractsData.find(function(x){return x.id===contractId;});if(!c)return;
  const ci=(c.complianceItems||[])[itemIdx];if(!ci)return;
  const input=document.createElement('input');
  input.type='file';
  input.onchange=function(){
    const file=input.files&&input.files[0];
    if(!file)return;
    ci.doc=file.name;
    if(ci.status==='Missing')ci.status='Uploaded';
    refreshCtSidebar();
    if(typeof showAiToast==='function')showAiToast('Document uploaded',file.name+' attached to '+ci.item+'.');
  };
  input.click();
}
// -- Resolves an "Agent exception" caused by Compliance Hub failing to return country config: fills Country of Operation, clears the compliance item, and closes out the underlying AI run so it drops off the cockpit exception queue. --
function resolveMissingCountryConfig(contractId){
  const c=contractsData.find(function(x){return x.id===contractId;});if(!c)return;
  const sel=document.getElementById('ct-country-config-'+contractId);
  const country=sel?sel.value:'';
  if(!country){if(typeof showAiToast==='function')showAiToast('Select a country','Choose a country before resolving.');return;}
  const item=(c.complianceItems||[]).find(function(ci){return ci.status==='Missing'||ci.status==='Uploaded';});
  if(!item||!item.doc){if(typeof showAiToast==='function')showAiToast('Document required','Upload the missing statutory requirement document before resolving.');return;}
  const checks=[].slice.call(document.querySelectorAll('.mcc-resolve-check'));
  if(checks.length&&checks.some(function(x){return !x.checked;})){
    if(typeof showAiToast==='function')showAiToast('Checklist incomplete','Confirm every item on the resolution checklist before resolving.');
    return;
  }
  c.countryOfOp=country;
  c.missingCountryConfig=false;
  if(item){item.status='Resolved';item.note='Statutory requirements configured for '+country+'.';}
  const now=new Date();
  const dateStr=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
  const timeStr=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0')+':'+String(now.getSeconds()).padStart(2,'0');
  (ctLogsData[contractId]=ctLogsData[contractId]||[]).unshift({date:dateStr,time:timeStr,user:'Compliance Officer',status:'Resolved',action:'Country configuration for '+country+' added; statutory requirements now available.'});
  (ctWorkflowData[contractId]=ctWorkflowData[contractId]||[]).unshift({title:'Country Configuration Resolved',user:'Compliance Officer',date:dateStr,time:timeStr,description:'Missing country configuration resolved for '+country+'.'});
  Object.keys(aiAutomationRuns).forEach(function(jid){
    (aiAutomationRuns[jid]||[]).forEach(function(r){
      if(r.contractRecordId===contractId&&r.status==='Exception'){
        r.status='Active';r.lastActivity='Just now';delete r.exceptionNote;
      }
    });
  });
  refreshCtSidebar();
  if(typeof showAiToast==='function')showAiToast('Country configuration resolved','Statutory requirements for '+country+' have been configured.');
}

function buildAIResponsibilitySplitHTML(journeyId){
  const events=aiJourneyEvents[journeyId]||[];
  const cfgJ=cfgJourneys.find(function(x){return x.id===journeyId;});
  const steps=(cfgJ&&cfgJ.steps&&cfgJ.steps.length===events.length)?cfgJ.steps:null;
  const labeled=events.map(function(e,i){return {name:steps?steps[i].name:e.name,chips:e.chips};});
  const aiEvents=labeled.filter(function(e){return e.chips.includes('AI Automated');});
  const humanEvents=labeled.filter(function(e){return e.chips.includes('Human Required')||e.chips.includes('Approval Required')||e.chips.includes('Client Action');});
  const chip=function(e,cls){return '<span class="ai-resp-chip '+cls+'"><span class="ai-resp-chip-dot"></span>'+e.name+'</span>';};
  const strip=function(label,cls,list){
    return '<div class="ai-resp-strip ai-resp-'+cls+'">'
      +'<div class="ai-resp-strip-label"><b>'+label+'</b><span>'+list.length+' / '+events.length+' events</span></div>'
      +'<div class="ai-resp-chips">'+list.map(function(e){return chip(e,cls);}).join('')+'</div>'
      +'</div>';
  };
  return '<div class="ai-resp-split">'
    +strip('AI Will Handle','ai',aiEvents)
    +strip('Human Will Handle','human',humanEvents)
    +'</div>';
}
function aiTimelineDotClass(chips){
  if(chips.includes('AI Automated'))return 'ai';
  if(chips.includes('Human Required'))return 'human';
  if(chips.includes('Client Action'))return 'client';
  return 'system';
}

function buildAIJourneyDetailHTML(){
  const j=aiJourneys.find(x=>x.id===selectedAIJourneyId)||aiJourneys[0];
  if(!activePersonaCanAccessJourney(j.id)){
    const first=activePersonaJourneyIds()[0];
    selectedAIJourneyId=first||'contract-creation';
    return '<div class="ai-exec-page"><div class="setup-card"><div class="setup-title">Journey unavailable</div><div class="setup-sub">This journey is not available for the current role.</div><button class="btn btn-primary btn-sm" onclick="navigatePage(\'ai-executive\')">Back to AI Executive</button></div></div>';
  }
  const events=aiJourneyEvents[j.id]||[];
  const timeline=events.map((e,i)=>{
    return '<div class="ai-timeline-item">'
      +'<div class="ai-timeline-dot '+aiTimelineDotClass(e.chips)+'">'+(i+1)+'</div>'
      +'<div class="ai-timeline-card" onclick="openAIEventDrawer(\''+j.id+'\','+i+')">'
      +'<div class="ai-timeline-card-head"><span class="ai-timeline-card-title">'+e.name+'</span></div>'
      +'<div class="ai-timeline-card-desc">'+e.desc+'</div>'
      +'<div class="ai-timeline-chips">'+aiChipsCompact(e.chips)+'</div>'
      +'</div></div>';
  }).join('');
  const statusActionHTML=j.status==='Active'
    ?'<button class="btn btn-primary btn-sm" onclick="viewAIActiveAutomation(\''+j.id+'\')">View Active Automation</button>'
    :j.status==='Draft'
      ?'<div class="ai-draft-pending"><span class="ai-draft-pending-text"><span class="ai-draft-pending-dot"></span>Draft pending &mdash; automation setup isn\'t finished yet.</span><button class="btn btn-primary btn-sm" onclick="startAutomateJourney(\''+j.id+'\')">Continue Automating Journey</button></div>'
      :'<button class="btn btn-primary btn-sm" onclick="startAutomateJourney(\''+j.id+'\')">Automate This Journey</button>';
  const backToCfg=aiJourneyDetailBackPage==='cfg-context-journey';
  const backLabel=backToCfg?'Back to Context & Journey':'All Journeys';
  const backAction=backToCfg?"navigatePage('cfg-context-journey')":"navigatePage('ai-executive')";
  const mainContent='<button class="ep-cancel-btn" style="margin-bottom:18px" onclick="'+backAction+'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="15 18 9 12 15 6"/></svg> '+backLabel+'</button>'
    +'<div style="margin-bottom:28px"><p style="font-size:17px;font-weight:700;margin-bottom:6px">'+j.name+'</p><p style="font-size:12.5px;color:var(--gray);margin:0;max-width:680px;line-height:1.6">'+j.desc+'</p></div>'
    +'<div class="ep-form-card" style="margin-bottom:28px;padding:20px 22px">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">'
    +'<div style="font-size:12px;color:var(--gray);line-height:1.8">Connected Modules: <strong style="color:var(--navy);font-weight:600">'+j.modules.join(', ')+'</strong><br>Status: <strong style="color:var(--navy);font-weight:600">'+j.status+'</strong> &middot; Last Updated: '+j.updated+'</div>'
    +(j.status==='Draft'?'':statusActionHTML)
    +'</div>'
    +(j.status==='Draft'?'<div style="margin-top:16px">'+statusActionHTML+'</div>':'')
    +'</div>'
    +buildAIJourneyRunSummaryHTML(j.id)
    +'<div class="review-title" style="margin:32px 0 14px">Journey Timeline</div>'
    +'<div class="ai-timeline">'+timeline+'</div>';
  return '<div class="ai-exec-page ai-journey-detail-page">'+mainContent+'</div>';
}

function aiJourneyRunStageCounts(journeyId){
  const events=aiJourneyEvents[journeyId]||[];
  const runs=aiAutomationRuns[journeyId]||[];
  return events.map(function(e,i){
    const atStage=runs.filter(function(r){return r.status!=='Completed'&&r.currentStepIdx===i;});
    const exceptions=atStage.filter(function(r){return r.status==='Exception';}).length;
    return {total:atStage.length,exceptions:exceptions};
  });
}
function buildAIJourneyRunSummaryHTML(journeyId){
  const runs=aiAutomationRuns[journeyId]||[];
  const events=aiJourneyEvents[journeyId]||[];
  const completed=runs.filter(function(r){return r.status==='Completed';}).length;
  const exceptions=runs.filter(function(r){return r.status==='Exception';}).length;
  const inProgress=runs.length-completed-exceptions;
  const stageCounts=aiJourneyRunStageCounts(journeyId);
  const bar='<div class="aicj-box-row">'+events.map(function(e,i){
    const c=stageCounts[i];
    const hasBadge=c.total>0;
    const isException=c.exceptions>0;
    const badgeCls=isException?'exception':'pending';
    const resp=aiStepResponsibility(e.chips);
    const isHumanStep=resp.cls!=='ai';
    const approverName=aiApproverForSource(e.source);
    const badge=hasBadge
      ?(isHumanStep
        ?(isException
          ?'<div class="aicj-box-badge exception">'+c.exceptions+' '+(c.exceptions===1?'Exception':'Exceptions')+' &mdash; '+approverName+'</div>'
          :'<div class="aicj-box-badge pending">Human Approval Pending &mdash; '+approverName+'</div>')
        :'<div class="aicj-box-badge '+badgeCls+'">'+c.total+' '+(isException?(c.exceptions===1?'Exception':'Exceptions'):'Pending')+'</div>')
      :'<div class="aicj-box-badge none">No runs</div>';
    const selected=aiJourneyDetailSelectedStage===i?' selected':'';
    return '<div class="aicj-box'+(hasBadge?' clickable':'')+selected+'"'+(hasBadge?' onclick="aiJourneyDetailSelectStage('+i+')"':'')+'>'
      +'<div class="aicj-box-num">'+(i+1)+'</div>'
      +'<div class="aicj-box-name">'+e.name+'</div>'
      +'<div class="aicj-box-resp '+resp.cls+'">'+resp.label+'</div>'
      +badge
      +'</div>';
  }).join('')+'</div>';
  const statCard=function(kind,label,val,color,count){
    const selected=aiRunStatusFilter===kind?' style="border-color:'+(color||'var(--orange)')+';background:'+(color||'#1a1a1a')+'0d"':'';
    const clickable=count>0?' clickable-stat':'';
    return '<div class="stat-card'+clickable+'"'+selected+(count>0?' onclick="aiJourneyFilterRunsByStatus(\''+kind+'\')"':'')+'><div class="stat-label"><span>'+label+'</span></div><div class="stat-val" style="color:'+(color||'inherit')+'">'+val+'</div></div>';
  };
  return '<div class="review-title" style="margin-bottom:14px">Journey Runs</div>'
    +'<div class="stat-grid" style="margin-bottom:20px">'
    +statCard('all','Journeys Created',runs.length,null,runs.length)
    +statCard('completed','Completed',completed,'#16a34a',completed)
    +statCard('inprogress','In Progress',inProgress,'#2563eb',inProgress)
    +statCard('exception','Needs Attention',exceptions,exceptions?'#dc2626':'var(--navy)',exceptions)
    +'</div>'
    +'<div class="ep-form-card" style="margin-bottom:16px;padding:18px 22px 20px">'+bar+'</div>'
    +'<div id="aicj-run-drilldown">'+buildAIJourneyRunDrilldownHTML()+'</div>';
}
function buildAIJourneyRunDrilldownHTML(){
  const j=aiJourneys.find(x=>x.id===selectedAIJourneyId)||aiJourneys[0];
  const events=aiJourneyEvents[j.id]||[];
  const allRuns=aiAutomationRuns[j.id]||[];
  let runs,title;
  if(aiRunStatusFilter){
    if(aiRunStatusFilter==='all'){runs=allRuns;title='All journeys';}
    else if(aiRunStatusFilter==='completed'){runs=allRuns.filter(function(r){return r.status==='Completed';});title='Completed journeys';}
    else if(aiRunStatusFilter==='exception'){runs=allRuns.filter(function(r){return r.status==='Exception';});title='Journeys needing attention';}
    else{runs=allRuns.filter(function(r){return r.status!=='Completed'&&r.status!=='Exception';});title='Journeys in progress';}
  }else if(aiJourneyDetailSelectedStage>=0){
    const idx=aiJourneyDetailSelectedStage;
    runs=allRuns.filter(function(r){return r.status!=='Completed'&&r.currentStepIdx===idx;});
    title='Pending at &ldquo;'+((events[idx]||{}).name||'')+'&rdquo;';
  }else{
    return '<div style="font-size:12px;color:var(--gray);padding:4px 2px">Click a stat card above, or a stage in the bar below, to see the journeys behind it.</div>';
  }
  const drilldownHamburger='<svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg>';
  const rows=runs.map(function(r){
    return '<tr style="cursor:pointer" onclick="viewAIRun(\''+r.runId+'\')">'
      +'<td><div class="cell-primary">'+r.client+'</div><div class="cell-sub">'+r.runId+'</div></td>'
      +'<td><div class="cell-primary">'+r.country+'</div><div class="cell-sub">'+r.contractType+'</div></td>'
      +'<td><span class="status-pill '+aiRunStatusPillClass(r.status)+'">'+r.status+'</span></td>'
      +'<td class="cell-sub">'+r.lastActivity+'</td>'
      +'<td onclick="event.stopPropagation()"><button class="btn btn-secondary btn-sm" onclick="viewAIRun(\''+r.runId+'\')">View Run</button><button class="lp-action-btn" style="margin-left:8px" title="More actions" onclick="viewAIRun(\''+r.runId+'\')">'+drilldownHamburger+'</button></td>'
      +'</tr>';
  }).join('');
  return '<div style="font-size:12.5px;font-weight:700;color:var(--navy);margin-bottom:10px">'+title+' &middot; '+runs.length+' '+(runs.length===1?'journey':'journeys')+'</div>'
    +'<div class="listing-card">'
    +'<table class="listing-table ai-run-table"><thead><tr>'
    +'<th>Client</th><th>Country &amp; Type</th><th>Status</th><th>Last Activity</th><th>Action</th>'
    +'</tr></thead><tbody>'+(rows||'<tr><td colspan="5" style="text-align:center;color:var(--gray);padding:20px">No journeys match this filter.</td></tr>')+'</tbody></table>'
    +'</div>';
}
function aiJourneyDetailSelectStage(idx){
  aiJourneyDetailSelectedStage=aiJourneyDetailSelectedStage===idx?-1:idx;
  aiRunStatusFilter='';
  const el=document.getElementById('aicj-run-drilldown');
  if(el)el.innerHTML=buildAIJourneyRunDrilldownHTML();
}
function aiJourneyFilterRunsByStatus(kind){
  const j=aiJourneys.find(x=>x.id===selectedAIJourneyId)||aiJourneys[0];
  const allRuns=aiAutomationRuns[j.id]||[];
  let matches;
  if(kind==='all')matches=allRuns;
  else if(kind==='completed')matches=allRuns.filter(function(r){return r.status==='Completed';});
  else if(kind==='exception')matches=allRuns.filter(function(r){return r.status==='Exception';});
  else matches=allRuns.filter(function(r){return r.status!=='Completed'&&r.status!=='Exception';});
  if(matches.length===1){viewAIRun(matches[0].runId);return;}
  aiJourneyDetailSelectedStage=-1;
  aiRunStatusFilter=aiRunStatusFilter===kind?'':kind;
  renderADTPage();
}

function openAIEventDrawer(journeyId,idx){
  selectedAIJourneyId=journeyId;aiEventDrawerIdx=idx;
  const overlay=document.getElementById('ct-modal-overlay');if(!overlay)return;
  overlay.innerHTML=renderAIEventDrawer();
  overlay.style.display='flex';
}
function closeAIEventDrawer(){
  aiEventDrawerIdx=-1;
  const overlay=document.getElementById('ct-modal-overlay');if(overlay){overlay.style.display='none';overlay.innerHTML='';}
}
function renderAIEventDrawer(){
  const j=aiJourneys.find(x=>x.id===selectedAIJourneyId);if(!j)return '';
  const e=(aiJourneyEvents[j.id]||[])[aiEventDrawerIdx];if(!e)return '';
  const header='<div class="ct-modal-hdr"><span class="ct-modal-title">'+e.name+'</span><button class="ct-modal-close" onclick="closeAIEventDrawer()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>';
  const fieldsRow=e.fields&&e.fields.length?aiDrawerRow('Fields AI will fetch',e.fields.join(', ')):'';
  const body='<div style="margin-bottom:16px">'+aiChips(e.chips)+'</div>'
    +'<div class="review-section"><div class="review-title">Event Description</div><p style="font-size:12.5px;color:var(--navy);line-height:1.6">'+e.desc+'</p></div>'
    +'<div class="review-section"><div class="review-title">Automation Details</div><div class="review-grid" style="grid-template-columns:1fr">'
    +aiDrawerRow('Data Source',e.source)
    +fieldsRow
    +aiDrawerRow('Validation Rules',e.validation)
    +aiDrawerRow('Human intervention required when',e.human)
    +aiDrawerRow('Failure Condition',e.failure)
    +aiDrawerRow('Next Step',e.next)
    +aiDrawerRow('Audit Requirement','Every AI action on this event is logged with timestamp, data source, and outcome for compliance audit.')
    +'</div></div>';
  return '<div class="ct-modal" style="width:min(600px,92vw)" onclick="event.stopPropagation()">'+header+body+'</div>';
}

// ===================== CONFIGURE =====================
// Full parity with the reference OpenDHI configuration console: Overview,
// Systems (list + detail w/ APIs), Data models (list + detail w/ mapping,
// enrichment, rules, test), Context & Journey (list + detail w/ flow +
// agent/governance assignment drawer), Agents. Self-contained — reads
// nothing from the AI Executive module and touches no other page.

function cfgKVRow(label,val){return '<div class="review-row"><div class="rr-label">'+label+'</div><div class="rr-val" style="white-space:normal;font-weight:600">'+val+'</div></div>';}
function cfgPageHead(title,sub){return '<div style="margin-bottom:20px"><p style="font-size:14px;font-weight:600;margin-bottom:4px">'+title+'</p><p style="font-size:12px;color:var(--gray);margin:0;max-width:680px">'+sub+'</p></div>';}
function cfgBackBtn(pg,label){return '<button class="ep-cancel-btn" style="margin-bottom:18px" onclick="navigatePage(\''+pg+'\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="15 18 9 12 15 6"/></svg> '+label+'</button>';}

// -- Configure: Overview --
function cfgHeroTilesHTML(){
  return '<div class="cfg-hero-grid">'+[
    ['cfg-systems','Systems',cfgSystems.length,'Connected sources & APIs','blue','<circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M8.2 10.8 15.8 7.2M8.2 13.2l7.6 3.6"/>'],
    ['cfg-data-foundation','Data models',cfgModels.length,'Fields, mapping & rules','violet','<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v13c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8v-13"/><path d="M4.5 12c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8"/>'],
    ['cfg-context-journey','Journeys',cfgJourneys.length,'Context & orchestration flows','teal','<circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M8 6h6.5a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H8"/>'],
    ['cfg-agents','AI agents',cfgAgents.length,'Autonomous & assisted agents','orange','<rect x="5" y="8" width="14" height="10" rx="3"/><circle cx="9.2" cy="13" r="1.3" fill="currentColor" stroke="none"/><circle cx="14.8" cy="13" r="1.3" fill="currentColor" stroke="none"/><path d="M12 4.2v3.4M9.2 3.4h5.6"/>']
  ].map(function(t){
    return '<div class="cfg-hero-tile cfg-hero-'+t[4]+'" onclick="navigatePage(\''+t[0]+'\')">'
      +'<div class="cfg-hero-toprow"><div class="cfg-hero-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+t[5]+'</svg></div>'
      +'<div class="cfg-hero-val">'+t[2]+'</div></div>'
      +'<div class="cfg-hero-label">'+t[1]+'</div>'
      +'<div class="cfg-hero-sub"><span>'+t[3]+'</span><svg class="cfg-hero-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>'
      +'</div>';
  }).join('')+'</div>';
}
function cfgActivityRowsHTML(){
  return cfgRecentActivity.map(function(a){
    return '<div class="tr" style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 16px;border-bottom:1px solid var(--border)">'
      +'<div><div style="font-size:13.5px;font-weight:500;color:var(--navy)">'+a.title+'</div><div style="font-size:12px;color:var(--gray);margin-top:3px">'+a.sub+'</div></div>'
      +'<div style="font-family:monospace;font-size:11.5px;color:var(--gray);white-space:nowrap">'+a.when+'</div>'
      +'</div>';
  }).join('');
}
function cfgOverviewBodyHTML(){
  return cfgHeroTilesHTML()
    +'<div class="review-title" style="margin-bottom:12px">Recent activity</div>'
    +'<div class="ep-form-card" style="padding:0">'+cfgActivityRowsHTML()+'</div>';
}
function buildCfgOverviewHTML(){
  return '<div class="ai-exec-page">'
    +cfgPageHead('Overview','Configuration for the sandbox — connect systems, define data models, wire journeys, and manage agents.')
    +cfgOverviewBodyHTML()
    +'</div>';
}

// -- Configure: Systems (list + detail, fully configurable) --
function cfgSlug(str){
  const base=String(str).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'system';
  let id=base,n=1;
  while(cfgSystems.some(function(s){return s.id===id;})){n++;id=base+'-'+n;}
  return id;
}
function viewCfgSystem(id){selectedCfgSystemId=id;cfgSystemEditing=false;cfgSystemDraft=null;navigatePage('cfg-system-detail');}
function buildCfgSystemsHTML(){
  cfgSystemEditing=false;cfgSystemDraft=null;
  const total=cfgSystems.length;
  const connected=cfgSystems.filter(function(s){return s.status==='Connected';}).length;
  const allOk=total>0&&connected===total;
  const rows=cfgSystems.length
    ?cfgSystems.map(function(s){
      return '<div class="ep-form-card" style="display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:10px;padding:16px 20px;cursor:pointer" onclick="viewCfgSystem(\''+s.id+'\')">'
        +'<div><div style="font-size:13.5px;font-weight:700;color:var(--navy)">'+s.name+'</div><div style="font-size:11.5px;color:var(--gray);margin-top:3px">'+s.type+' &middot; '+s.method+'</div></div>'
        +'<span class="status-pill '+(s.status==='Connected'?'active':'inactive')+'">'+s.status+'</span>'
        +'</div>';
    }).join('')
    :'<div class="ep-form-card" style="text-align:center;color:var(--gray);font-size:12.5px;padding:32px">No systems yet — add your first one.</div>';
  const banner=allOk
    ?'<div class="review-section" style="display:flex;align-items:center;gap:12px;border-color:#86efac;background:#f0fdf4;margin-bottom:20px">'
      +'<div style="width:34px;height:34px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>'
      +'<div><div style="font-size:13px;font-weight:700;color:#15803d">All systems configured</div><div style="font-size:12px;color:#166534;margin-top:2px">Every system below is connected and ready to use in Data Foundation and Context &amp; Journey.</div></div>'
      +'</div>'
    :'<div class="review-section" style="display:flex;align-items:center;gap:12px;border-color:#fed7aa;background:#fff7ed;margin-bottom:20px">'
      +'<div style="width:34px;height:34px;border-radius:50%;background:#ffedd5;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17.02" x2="12.01" y2="17.02"/></svg></div>'
      +'<div><div style="font-size:13px;font-weight:700;color:#1a1a1a">'+connected+' of '+total+' systems connected</div><div style="font-size:12px;color:#9a3412;margin-top:2px">Test or configure the rest to bring them online.</div></div>'
      +'</div>';
  return '<div class="ai-exec-page">'
    +'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:20px;flex-wrap:wrap">'
    +'<div><p style="font-size:14px;font-weight:600;margin-bottom:4px">Systems</p><p style="font-size:12px;color:var(--gray);margin:0;max-width:600px">The sources ADT connects to — each exposes its own API. Click a system for connection details.</p></div>'
    +'<button class="btn btn-primary btn-sm" style="flex-shrink:0" onclick="navigatePage(\'cfg-system-add\')">+ Custom System</button>'
    +'</div>'
    +banner
    +rows
    +'</div>';
}
function cfgApiDirBadge(dir){
  return dir==='rw'
    ?'<span class="badge" style="background:#f1f5f9;color:var(--navy)">read + write</span>'
    :'<span class="badge" style="background:#eff6ff;color:#2563eb">read</span>';
}
function cfgApiTypeBadge(type){
  return type==='Transformational'
    ?'<span class="badge" style="background:#f5f3ff;color:#7c3aed">Transactional</span>'
    :'<span class="badge" style="background:#f1f5f9;color:#1a1a1a">Transactional</span>';
}
function startCfgSystemEdit(){cfgSystemEditing=true;cfgSystemDraft=null;navigatePage('cfg-system-detail');}
function cancelCfgSystemEdit(){cfgSystemEditing=false;cfgSystemDraft=null;navigatePage('cfg-system-detail');}
function captureCfgSystemDraft(){
  const g=function(id){const el=document.getElementById(id);return el?el.value:'';};
  cfgSystemDraft={name:g('cfg-sys-edit-name'),type:g('cfg-sys-edit-type'),method:g('cfg-sys-edit-method'),endpoint:g('cfg-sys-edit-endpoint'),auth:g('cfg-sys-edit-auth'),apis:g('cfg-sys-edit-apis'),status:g('cfg-sys-edit-status')};
}
function saveCfgSystemEdit(systemId){
  const s=cfgSystems.find(function(x){return x.id===systemId;});if(!s)return;
  const name=document.getElementById('cfg-sys-edit-name');
  if(!name||!name.value.trim()){alert('Please enter a system name.');name&&name.focus();return;}
  s.name=name.value.trim();
  const type=document.getElementById('cfg-sys-edit-type');if(type)s.type=type.value.trim()||s.type;
  const method=document.getElementById('cfg-sys-edit-method');if(method)s.method=method.value.trim()||s.method;
  const endpoint=document.getElementById('cfg-sys-edit-endpoint');if(endpoint)s.endpoint=endpoint.value.trim()||s.endpoint;
  const auth=document.getElementById('cfg-sys-edit-auth');if(auth)s.auth=auth.value.trim()||s.auth;
  const apis=document.getElementById('cfg-sys-edit-apis');if(apis&&apis.value!=='')s.apis=Math.max(0,parseInt(apis.value,10)||0);
  const status=document.getElementById('cfg-sys-edit-status');if(status)s.status=status.value;
  s.lastTestResult=null;
  cfgSystemEditing=false;cfgSystemDraft=null;
  navigatePage('cfg-system-detail');
}
function testCfgSystemConnection(systemId,btnEl){
  const s=cfgSystems.find(function(x){return x.id===systemId;});if(!s)return;
  if(btnEl){
    btnEl.disabled=true;
    btnEl.innerHTML='<span style="display:inline-flex;align-items:center;gap:7px"><span style="width:11px;height:11px;border:2px solid rgba(0,0,0,.15);border-top-color:currentColor;border-radius:50%;display:inline-block;animation:spin .8s linear infinite"></span>Testing connection&hellip;</span>';
  }
  setTimeout(function(){
    const endpointOk=!!(s.endpoint&&s.endpoint.trim()&&s.endpoint.trim()!=='https://'&&/^https?:\/\/.+/.test(s.endpoint.trim()));
    s.lastTested='Just now';
    if(endpointOk){s.status='Connected';s.lastTestResult='ok';}
    else{s.status='Disconnected';s.lastTestResult='fail';}
    navigatePage('cfg-system-detail');
  },1100);
}
function updateCfgApiDir(systemId,idx,dir){
  const s=cfgSystems.find(function(x){return x.id===systemId;});if(!s||!s.apiList[idx])return;
  s.apiList[idx].dir=dir;
}
function updateCfgApiCat(systemId,idx,cat){
  const s=cfgSystems.find(function(x){return x.id===systemId;});if(!s||!s.apiList[idx])return;
  s.apiList[idx].cat=cat;
  s.apiList[idx].sub=(cfgApiSubcats[cat]||['General'])[0];
  navigatePage('cfg-system-detail');
}
function updateCfgApiSub(systemId,idx,sub){
  const s=cfgSystems.find(function(x){return x.id===systemId;});if(!s||!s.apiList[idx])return;
  s.apiList[idx].sub=sub;
}
function updateCfgApiType(systemId,idx,type){
  const s=cfgSystems.find(function(x){return x.id===systemId;});if(!s||!s.apiList[idx])return;
  s.apiList[idx].type=type;
}
function onCfgNewApiCatChange(cat){
  const subSel=document.getElementById('cfg-newapi-sub');if(!subSel)return;
  const opts=cfgApiSubcats[cat]||['General'];
  subSel.innerHTML=opts.map(function(sc){return '<option value="'+sc+'">'+sc+'</option>';}).join('');
}
function addCfgApiRow(systemId){
  const s=cfgSystems.find(function(x){return x.id===systemId;});if(!s)return;
  const nameInp=document.getElementById('cfg-newapi-name');
  const dirSel=document.getElementById('cfg-newapi-dir');
  const catSel=document.getElementById('cfg-newapi-cat');
  const subSel=document.getElementById('cfg-newapi-sub');
  const typeSel=document.getElementById('cfg-newapi-type');
  const name=nameInp?nameInp.value.trim():'';
  if(!name){alert('Please enter an API name.');nameInp&&nameInp.focus();return;}
  captureCfgSystemDraft();
  const cat=catSel?catSel.value:'Others';
  s.apiList.push({name:name,dir:dirSel?dirSel.value:'r',cat:cat,sub:subSel?subSel.value:(cfgApiSubcats[cat]||['General'])[0],type:typeSel?typeSel.value:'Transactional'});
  navigatePage('cfg-system-detail');
}
function removeCfgApiRow(systemId,idx){
  const s=cfgSystems.find(function(x){return x.id===systemId;});if(!s)return;
  captureCfgSystemDraft();
  s.apiList.splice(idx,1);
  navigatePage('cfg-system-detail');
}
function confirmRemoveCfgSystem(systemId){
  const s=cfgSystems.find(function(x){return x.id===systemId;});if(!s)return;
  const overlay=document.getElementById('ct-modal-overlay');if(!overlay)return;
  overlay.innerHTML='<div class="ct-modal" style="width:min(440px,92vw);text-align:center;padding:32px 30px" onclick="event.stopPropagation()">'
    +'<div style="width:56px;height:56px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg></div>'
    +'<div style="font-size:16px;font-weight:700;color:var(--navy);margin-bottom:10px">Remove '+s.name+'?</div>'
    +'<div style="font-size:13px;color:var(--gray);line-height:1.6;margin-bottom:22px">This disconnects the system and removes it from Systems. Models and journeys that reference it may need remapping.</div>'
    +'<div style="display:flex;justify-content:center;gap:10px"><button class="ep-cancel-btn" onclick="closeCtModal()">Cancel</button><button class="ep-save-btn" style="background:#dc2626" onclick="removeCfgSystemConfirmed(\''+s.id+'\')">Remove system</button></div>'
    +'</div>';
  overlay.style.display='flex';
}
function removeCfgSystemConfirmed(systemId){
  const idx=cfgSystems.findIndex(function(x){return x.id===systemId;});
  if(idx>-1)cfgSystems.splice(idx,1);
  closeCtModal();
  selectedCfgSystemId=null;
  navigatePage('cfg-systems');
}
function buildCfgSystemDetailHTML(){
  const s=cfgSystems.find(function(x){return x.id===selectedCfgSystemId;})||cfgSystems[0];
  const editing=cfgSystemEditing;
  const d=editing&&cfgSystemDraft?cfgSystemDraft:s;
  const heading=editing
    ?'<div class="ep-form-group" style="margin-bottom:8px;max-width:360px"><input class="ep-form-input" id="cfg-sys-edit-name" value="'+attrSafe(d.name)+'" style="font-size:16px;font-weight:700"></div>'
    :'<p style="font-size:17px;font-weight:700;margin-bottom:6px">'+s.name+'</p><p style="font-size:12.5px;color:var(--gray);margin:0">'+s.type+' &middot; connected via released APIs</p>';
  const actionBtns=editing?'':'<div style="display:flex;gap:10px;flex-shrink:0"><button class="btn btn-secondary btn-sm" onclick="testCfgSystemConnection(\''+s.id+'\',this)">Test connection</button><button class="btn btn-primary btn-sm" onclick="startCfgSystemEdit()">Edit</button></div>';
  const connectionBlock=editing
    ?'<div class="ep-form-card" style="margin-bottom:24px">'
      +'<div class="ep-form-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:14px 20px">'
      +'<div class="ep-form-group"><label class="ep-form-label">Type</label><input class="ep-form-input" id="cfg-sys-edit-type" value="'+attrSafe(d.type)+'"></div>'
      +'<div class="ep-form-group"><label class="ep-form-label">Method</label><input class="ep-form-input" id="cfg-sys-edit-method" value="'+attrSafe(d.method)+'"></div>'
      +'<div class="ep-form-group" style="grid-column:1 / -1"><label class="ep-form-label">Endpoint</label><input class="ep-form-input" id="cfg-sys-edit-endpoint" value="'+attrSafe(d.endpoint)+'"></div>'
      +'<div class="ep-form-group"><label class="ep-form-label">Authentication</label><input class="ep-form-input" id="cfg-sys-edit-auth" value="'+attrSafe(d.auth)+'"></div>'
      +'<div class="ep-form-group"><label class="ep-form-label">Total released APIs</label><input class="ep-form-input" type="number" min="0" id="cfg-sys-edit-apis" value="'+attrSafe(d.apis)+'"></div>'
      +'<div class="ep-form-group"><label class="ep-form-label">Status</label><select class="ep-form-select" id="cfg-sys-edit-status"><option'+(d.status==='Connected'?' selected':'')+'>Connected</option><option'+(d.status==='Disconnected'?' selected':'')+'>Disconnected</option></select></div>'
      +'</div>'
      +'<div style="display:flex;gap:10px;margin-top:18px"><button class="ep-cancel-btn" onclick="cancelCfgSystemEdit()">Cancel</button><button class="ep-save-btn" onclick="saveCfgSystemEdit(\''+s.id+'\')">Save changes</button></div>'
      +'</div>'
    :'<div class="ep-form-card" style="margin-bottom:24px">'
      +cfgKVRow('Type',s.type)
      +cfgKVRow('Method',s.method)
      +cfgKVRow('Endpoint','<span style="font-family:monospace">'+s.endpoint+'</span>')
      +cfgKVRow('Authentication',s.auth)
      +cfgKVRow('Status','<span class="status-pill '+(s.status==='Connected'?'active':'inactive')+'">'+s.status+'</span>')
      +cfgKVRow('Last tested',s.lastTested+' &middot; '+s.apis+' APIs')
      +(s.lastTestResult==='fail'?'<div style="margin-top:10px;padding:11px 14px;border-radius:9px;background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;font-size:12px;line-height:1.6">Test failed &mdash; the endpoint looks incomplete or unreachable. Update the endpoint (Edit) and test again.</div>':'')
      +(s.lastTestResult==='ok'?'<div style="margin-top:10px;padding:11px 14px;border-radius:9px;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;font-size:12px;line-height:1.6">Connection verified &mdash; the endpoint responded successfully.</div>':'')
      +'</div>';
  const apiCatHeader=function(cat){
    return '<div style="padding:10px 16px;font-size:11.5px;font-weight:700;letter-spacing:.3px;color:var(--navy);background:#eef2f7;border-bottom:1px solid var(--border)">'+cat+'</div>';
  };
  const apiSubHeader=function(sub){
    return '<div style="padding:7px 16px;font-size:10px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:#6b7280;background:#f8fafc;border-bottom:1px solid var(--border)">'+sub+'</div>';
  };
  const apiRows=(s.apiList.length?(function(){
    const grouped={};
    s.apiList.forEach(function(a,i){
      const cat=a.cat||'Others';
      const sub=a.sub||'General';
      grouped[cat]=grouped[cat]||{};
      (grouped[cat][sub]=grouped[cat][sub]||[]).push({a:a,i:i});
    });
    const order=cfgApiCategories.filter(function(c){return grouped[c];});
    Object.keys(grouped).forEach(function(c){if(order.indexOf(c)===-1)order.push(c);});
    return order.map(function(cat){
      const subGroups=grouped[cat];
      const subOrder=(cfgApiSubcats[cat]||[]).filter(function(sc){return subGroups[sc];});
      Object.keys(subGroups).forEach(function(sc){if(subOrder.indexOf(sc)===-1)subOrder.push(sc);});
      const subBlocks=subOrder.map(function(sub){
        const rows=subGroups[sub].map(function(entry){
          const a=entry.a,i=entry.i;
          const nameParts=a.name.split(' · ');
          const apiCode=nameParts[0],apiLabel=nameParts.slice(1).join(' · ');
          const nameHTML='<div style="min-width:0">'
            +(apiLabel?'<div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:3px">'+apiLabel+'</div>':'')
            +'<div style="display:inline-block;font-family:monospace;font-size:10.5px;font-weight:500;color:#64748b;background:#f1f5f9;border-radius:4px;padding:2px 7px;letter-spacing:.2px">'+apiCode+'</div>'
            +'</div>';
          return '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border)">'
            +nameHTML
            +(editing
              ?'<div style="display:flex;align-items:center;gap:8px;flex-shrink:0;flex-wrap:wrap">'
                +'<select class="ep-form-select" style="width:auto;padding:6px 10px" onchange="updateCfgApiCat(\''+s.id+'\','+i+',this.value)">'+cfgApiCategories.map(function(c){return '<option value="'+c+'"'+(c===cat?' selected':'')+'>'+c+'</option>';}).join('')+'</select>'
                +'<select class="ep-form-select" style="width:auto;padding:6px 10px" onchange="updateCfgApiSub(\''+s.id+'\','+i+',this.value)">'+(cfgApiSubcats[cat]||['General']).map(function(sc){return '<option value="'+sc+'"'+(sc===sub?' selected':'')+'>'+sc+'</option>';}).join('')+'</select>'
                +'<select class="ep-form-select" style="width:auto;padding:6px 10px" onchange="updateCfgApiType(\''+s.id+'\','+i+',this.value)">'+cfgApiTypes.map(function(t){return '<option value="'+t+'"'+(t===a.type?' selected':'')+'>'+t+'</option>';}).join('')+'</select>'
                +'<select class="ep-form-select" style="width:auto;padding:6px 10px" onchange="updateCfgApiDir(\''+s.id+'\','+i+',this.value)"><option value="r"'+(a.dir==='r'?' selected':'')+'>read</option><option value="rw"'+(a.dir==='rw'?' selected':'')+'>read + write</option></select>'
                +'<button type="button" class="ep-cancel-btn" style="padding:4px 9px" onclick="removeCfgApiRow(\''+s.id+'\','+i+')">Remove</button></div>'
              :'<div style="display:flex;align-items:center;gap:8px;flex-shrink:0">'+cfgApiTypeBadge(a.type)+cfgApiDirBadge(a.dir)+'</div>')
            +'</div>';
        }).join('');
        return apiSubHeader(sub)+rows;
      }).join('');
      return apiCatHeader(cat)+subBlocks;
    }).join('');
  })():'<div style="padding:16px;font-size:12.5px;color:var(--gray)">No APIs added yet.</div>');
  const addApiForm=editing
    ?'<div style="display:flex;gap:8px;padding:14px 16px;align-items:center;flex-wrap:wrap">'
      +'<input class="ep-form-input" id="cfg-newapi-name" placeholder="API name, e.g. API_PRODUCT_SRV" style="flex:1;min-width:220px">'
      +'<select class="ep-form-select" id="cfg-newapi-cat" style="width:auto" onchange="onCfgNewApiCatChange(this.value)">'+cfgApiCategories.map(function(c){return '<option value="'+c+'">'+c+'</option>';}).join('')+'</select>'
      +'<select class="ep-form-select" id="cfg-newapi-sub" style="width:auto">'+(cfgApiSubcats[cfgApiCategories[0]]||['General']).map(function(sc){return '<option value="'+sc+'">'+sc+'</option>';}).join('')+'</select>'
      +'<select class="ep-form-select" id="cfg-newapi-type" style="width:auto">'+cfgApiTypes.map(function(t){return '<option value="'+t+'">'+t+'</option>';}).join('')+'</select>'
      +'<select class="ep-form-select" id="cfg-newapi-dir" style="width:auto"><option value="r">read</option><option value="rw">read + write</option></select>'
      +'<button type="button" class="btn btn-secondary btn-sm" onclick="addCfgApiRow(\''+s.id+'\')">+ Add API</button>'
      +'</div>'
    :'';
  return '<div class="ai-exec-page">'
    +cfgBackBtn('cfg-systems','Systems')
    +'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:24px;flex-wrap:wrap"><div>'+heading+'</div>'+actionBtns+'</div>'
    +'<div class="review-title" style="margin-bottom:12px">Connection</div>'
    +connectionBlock
    +'<div class="review-title" style="margin-bottom:12px">Available APIs'+(editing?'':' &middot; released')+'</div>'
    +'<div class="ep-form-card" style="padding:0">'+apiRows+addApiForm+'</div>'
    +'</div>';
}
function cancelCfgSystemAdd(){navigatePage('cfg-systems');}
function submitCfgSystemAdd(){
  const name=document.getElementById('cfg-sys-add-name');
  if(!name||!name.value.trim()){alert('Please enter a system name.');name&&name.focus();return;}
  const type=(document.getElementById('cfg-sys-add-type').value||'').trim()||'Custom';
  const method=(document.getElementById('cfg-sys-add-method').value||'').trim()||'REST';
  const endpoint=(document.getElementById('cfg-sys-add-endpoint').value||'').trim()||'https://';
  const auth=(document.getElementById('cfg-sys-add-auth').value||'').trim()||'API Key';
  const id=cfgSlug(name.value.trim());
  cfgSystems.push({id:id,name:name.value.trim(),type:type,method:method,endpoint:endpoint,auth:auth,apis:0,lastTested:'Never',status:'Disconnected',apiList:[]});
  selectedCfgSystemId=id;cfgSystemEditing=false;
  navigatePage('cfg-system-detail');
}
function buildCfgSystemAddHTML(){
  return '<div class="ai-exec-page">'
    +cfgBackBtn('cfg-systems','Systems')
    +'<div style="margin-bottom:20px"><p style="font-size:17px;font-weight:700;margin-bottom:6px">Add Custom System</p><p style="font-size:12.5px;color:var(--gray);margin:0;max-width:560px">Connect a new system so its models and APIs become available to Data Foundation and Context &amp; Journey. You can test the connection and add APIs afterward.</p></div>'
    +'<div class="ep-form-card">'
    +'<div class="ep-form-title">Connection details</div>'
    +'<div class="ep-form-group" style="margin-bottom:14px"><label class="ep-form-label">System name <span class="req">*</span></label><input class="ep-form-input" id="cfg-sys-add-name" placeholder="e.g. Workday, NetSuite, Custom HRIS"></div>'
    +'<div class="ep-form-group" style="margin-bottom:14px"><label class="ep-form-label">Type</label><input class="ep-form-input" id="cfg-sys-add-type" placeholder="e.g. HRIS, ERP, 3rd-party"></div>'
    +'<div class="ep-form-group" style="margin-bottom:14px"><label class="ep-form-label">Method</label><input class="ep-form-input" id="cfg-sys-add-method" placeholder="e.g. REST, SOAP, Web Network"></div>'
    +'<div class="ep-form-group" style="margin-bottom:14px"><label class="ep-form-label">Endpoint</label><input class="ep-form-input" id="cfg-sys-add-endpoint" placeholder="https://"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Authentication</label><input class="ep-form-input" id="cfg-sys-add-auth" placeholder="e.g. OAuth 2.0, API Key"></div>'
    +'</div>'
    +'<div style="display:flex;gap:10px;margin-top:18px"><button class="ep-cancel-btn" onclick="cancelCfgSystemAdd()">Cancel</button><button class="ep-save-btn" onclick="submitCfgSystemAdd()">Add system</button></div>'
    +'</div>';
}

// -- Configure: Data models (list + detail, fully configurable) --
function cfgModelSlug(str){
  const base=String(str).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'model';
  let id=base,n=1;
  while(cfgModels.some(function(m){return m.id===id;})){n++;id=base+'-'+n;}
  return id;
}
function cfgTypeSelect(id,current){
  const opts=['string','decimal','number','boolean','date','object'];
  return '<select class="ep-form-select" style="width:auto" id="'+id+'">'+opts.map(function(o){return '<option'+(o===current?' selected':'')+'>'+o+'</option>';}).join('')+'</select>';
}
function viewCfgModel(id){selectedCfgModelId=id;cfgModelEditing=false;cfgModelDraft=null;navigatePage('cfg-model-detail');}
function buildCfgDataFoundationHTML(){
  cfgModelEditing=false;cfgModelDraft=null;
  const cards=cfgModels.length
    ?cfgModels.map(function(m){
      return '<div class="ai-journey-card" onclick="viewCfgModel(\''+m.id+'\')">'
        +'<div class="ai-journey-card-top"><div class="ai-journey-name">'+m.name+'</div></div>'
        +'<div class="ai-journey-desc">'+m.desc+'</div>'
        +'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px">'
        +'<span class="badge">'+m.mapped.length+' mapped</span>'
        +'<span class="badge" style="color:var(--navy);border-color:#cbd5e1;background:#f1f5f9">'+m.enrichment.length+' enrichment</span>'
        +'<span class="badge">'+m.source+'</span>'
        +'</div></div>';
    }).join('')
    :'<div class="ep-form-card" style="text-align:center;color:var(--gray);font-size:12.5px;padding:32px">No models yet — define your first one.</div>';
  return '<div class="ai-exec-page">'
    +'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:20px;flex-wrap:wrap">'
    +'<div><p style="font-size:14px;font-weight:600;margin-bottom:4px">Data Foundation</p><p style="font-size:12px;color:var(--gray);margin:0;max-width:600px">Your unified objects — mapped from source systems, plus enrichment held in Data Foundation.</p></div>'
    +'<button class="btn btn-primary btn-sm" style="flex-shrink:0" onclick="navigatePage(\'cfg-model-add\')">+ New Model</button>'
    +'</div>'
    +'<div class="ai-journey-grid">'+cards+'</div>'
    +'</div>';
}
function cfgMapRow(unified,source,type){
  return '<div style="display:flex;align-items:center;gap:14px;padding:11px 0;border-bottom:1px dashed var(--border)">'
    +'<div style="flex:1;font-size:13px;font-weight:600;color:var(--navy)">'+unified+'</div>'
    +'<div style="color:#cbd5e1">&larr;</div>'
    +'<div style="flex:1;font-family:monospace;font-size:12px;color:var(--gray)">'+source+'</div>'
    +'<div style="width:60px;text-align:right;font-size:11px;color:#9ca3af">'+type+'</div>'
    +'</div>';
}
function cfgEnrichRow(e){
  return '<div style="display:flex;align-items:center;gap:14px;padding:11px 0;border-bottom:1px dashed rgba(26,26,26,.25)">'
    +'<div style="flex:1;font-size:13px;font-weight:600;color:var(--orange)">'+e.name+'</div>'
    +'<div style="color:#f1c27a">&larr;</div>'
    +'<div style="flex:1;font-size:12px;color:var(--gray)">added in Data Foundation</div>'
    +'<div style="width:60px;text-align:right;font-size:11px;color:#9ca3af">'+e.type+'</div>'
    +'</div>';
}
function cfgSampleValueFor(m,fieldName,type){
  const found=(m.sample||[]).find(function(pair){return pair[0]===fieldName;});
  if(found)return found[1];
  const t=(type||'string').toLowerCase();
  if(t==='decimal'||t==='number')return '42.00';
  if(t==='boolean')return 'true';
  if(t==='date')return '2026-01-01';
  if(t==='object')return '{ ... }';
  return 'Sample value';
}
function startCfgModelEdit(){
  const m=cfgModels.find(function(x){return x.id===selectedCfgModelId;});if(!m)return;
  cfgModelDraft={
    name:m.name,source:m.source,desc:m.desc,
    makerChecker:m.rules.makerChecker,validation:m.rules.validation,
    mapped:m.mapped.map(function(r){return r.slice();}),
    enrichment:m.enrichment.map(function(e){return {name:e.name,type:e.type};})
  };
  cfgModelEditing=true;
  navigatePage('cfg-model-detail');
}
function cancelCfgModelEdit(){cfgModelEditing=false;cfgModelDraft=null;navigatePage('cfg-model-detail');}
function syncCfgModelDraftFromDOM(){
  if(!cfgModelDraft)return;
  const g=function(id){const el=document.getElementById(id);return el?el.value:undefined;};
  const name=g('cfg-model-edit-name');if(name!==undefined)cfgModelDraft.name=name;
  const source=g('cfg-model-edit-source');if(source!==undefined)cfgModelDraft.source=source;
  const desc=g('cfg-model-edit-desc');if(desc!==undefined)cfgModelDraft.desc=desc;
  const mc=document.getElementById('cfg-model-edit-mc');if(mc)cfgModelDraft.makerChecker=mc.checked;
  const val=g('cfg-model-edit-validation');if(val!==undefined)cfgModelDraft.validation=val;
  cfgModelDraft.mapped=cfgModelDraft.mapped.map(function(row,i){
    const u=g('cfg-map-u-'+i),s=g('cfg-map-s-'+i),t=g('cfg-map-t-'+i);
    return [u!==undefined?u:row[0],s!==undefined?s:row[1],t!==undefined?t:row[2]];
  });
  cfgModelDraft.enrichment=cfgModelDraft.enrichment.map(function(e,i){
    const n=g('cfg-enr-n-'+i),t=g('cfg-enr-t-'+i);
    return {name:n!==undefined?n:e.name,type:t!==undefined?t:e.type};
  });
}
function addCfgMappedRow(){syncCfgModelDraftFromDOM();cfgModelDraft.mapped.push(['','','string']);navigatePage('cfg-model-detail');}
function removeCfgMappedRow(idx){syncCfgModelDraftFromDOM();cfgModelDraft.mapped.splice(idx,1);navigatePage('cfg-model-detail');}
function addCfgEnrichRow(){syncCfgModelDraftFromDOM();cfgModelDraft.enrichment.push({name:'',type:'string'});navigatePage('cfg-model-detail');}
function removeCfgEnrichRow(idx){syncCfgModelDraftFromDOM();cfgModelDraft.enrichment.splice(idx,1);navigatePage('cfg-model-detail');}
function saveCfgModelEdit(modelId){
  const m=cfgModels.find(function(x){return x.id===modelId;});if(!m)return;
  const nameEl=document.getElementById('cfg-model-edit-name');
  if(!nameEl||!nameEl.value.trim()){alert('Please enter a model name.');nameEl&&nameEl.focus();return;}
  m.name=nameEl.value.trim();
  const sourceEl=document.getElementById('cfg-model-edit-source');if(sourceEl)m.source=sourceEl.value.trim()||m.source;
  const descEl=document.getElementById('cfg-model-edit-desc');if(descEl)m.desc=descEl.value.trim()||m.desc;
  const mcEl=document.getElementById('cfg-model-edit-mc');m.rules.makerChecker=mcEl?mcEl.checked:m.rules.makerChecker;
  const valEl=document.getElementById('cfg-model-edit-validation');if(valEl)m.rules.validation=valEl.value.trim();
  const mapCount=cfgModelDraft?cfgModelDraft.mapped.length:0;
  const mapped=[];
  for(let i=0;i<mapCount;i++){
    const u=document.getElementById('cfg-map-u-'+i),s=document.getElementById('cfg-map-s-'+i),t=document.getElementById('cfg-map-t-'+i);
    const uname=u?u.value.trim():'';
    if(uname)mapped.push([uname,s?s.value.trim():'',t?t.value:'string']);
  }
  m.mapped=mapped;
  const enrCount=cfgModelDraft?cfgModelDraft.enrichment.length:0;
  const enrichment=[];
  for(let i=0;i<enrCount;i++){
    const n=document.getElementById('cfg-enr-n-'+i),t=document.getElementById('cfg-enr-t-'+i);
    const ename=n?n.value.trim():'';
    if(ename)enrichment.push({name:ename,type:t?t.value:'string'});
  }
  m.enrichment=enrichment;
  cfgModelEditing=false;cfgModelDraft=null;
  navigatePage('cfg-model-detail');
}
function confirmRemoveCfgModel(modelId){
  const m=cfgModels.find(function(x){return x.id===modelId;});if(!m)return;
  const overlay=document.getElementById('ct-modal-overlay');if(!overlay)return;
  overlay.innerHTML='<div class="ct-modal" style="width:min(440px,92vw);text-align:center;padding:32px 30px" onclick="event.stopPropagation()">'
    +'<div style="width:56px;height:56px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg></div>'
    +'<div style="font-size:16px;font-weight:700;color:var(--navy);margin-bottom:10px">Remove '+m.name+'?</div>'
    +'<div style="font-size:13px;color:var(--gray);line-height:1.6;margin-bottom:22px">This removes the model from Data Foundation. Journeys or agents that reference it may need remapping.</div>'
    +'<div style="display:flex;justify-content:center;gap:10px"><button class="ep-cancel-btn" onclick="closeCtModal()">Cancel</button><button class="ep-save-btn" style="background:#dc2626" onclick="removeCfgModelConfirmed(\''+m.id+'\')">Remove model</button></div>'
    +'</div>';
  overlay.style.display='flex';
}
function removeCfgModelConfirmed(modelId){
  const idx=cfgModels.findIndex(function(x){return x.id===modelId;});
  if(idx>-1)cfgModels.splice(idx,1);
  closeCtModal();
  selectedCfgModelId=null;
  navigatePage('cfg-data-foundation');
}
function testCfgModel(modelId,btnEl){
  const m=cfgModels.find(function(x){return x.id===modelId;});if(!m)return;
  if(btnEl){
    btnEl.disabled=true;
    btnEl.innerHTML='<span style="display:inline-flex;align-items:center;gap:7px"><span style="width:11px;height:11px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin .8s linear infinite;opacity:.9"></span>Fetching&hellip;</span>';
  }
  setTimeout(function(){
    cfgModelTested[modelId]=true;
    renderPageContent('adt-content');
  },900);
}
function cancelCfgModelAdd(){navigatePage('cfg-data-foundation');}
function submitCfgModelAdd(){
  const name=document.getElementById('cfg-model-add-name');
  if(!name||!name.value.trim()){alert('Please enter a model name.');name&&name.focus();return;}
  const source=(document.getElementById('cfg-model-add-source').value||'').trim()||'Custom';
  const desc=(document.getElementById('cfg-model-add-desc').value||'').trim()||'Unified object defined in Data Foundation.';
  const id=cfgModelSlug(name.value.trim());
  cfgModels.push({id:id,name:name.value.trim(),source:source,desc:desc,mapped:[],enrichment:[],rules:{makerChecker:false,validation:''},sample:[]});
  selectedCfgModelId=id;cfgModelEditing=false;cfgModelDraft=null;
  navigatePage('cfg-model-detail');
}
function buildCfgModelAddHTML(){
  return '<div class="ai-exec-page">'
    +cfgBackBtn('cfg-data-foundation','Data Foundation')
    +'<div style="margin-bottom:20px"><p style="font-size:17px;font-weight:700;margin-bottom:6px">New Model</p><p style="font-size:12.5px;color:var(--gray);margin:0;max-width:560px">Define a new unified object. You can add field mappings and enrichment fields afterward, from its detail page.</p></div>'
    +'<div class="ep-form-card">'
    +'<div class="ep-form-title">Model details</div>'
    +'<div class="ep-form-group" style="margin-bottom:14px"><label class="ep-form-label">Model name <span class="req">*</span></label><input class="ep-form-input" id="cfg-model-add-name" placeholder="e.g. Purchase Order, Employee, Invoice"></div>'
    +'<div class="ep-form-group" style="margin-bottom:14px"><label class="ep-form-label">Source system(s)</label><input class="ep-form-input" id="cfg-model-add-source" placeholder="e.g. SAP, SAP + Infor"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Description</label><input class="ep-form-input" id="cfg-model-add-desc" placeholder="What this object represents"></div>'
    +'</div>'
    +'<div style="display:flex;gap:10px;margin-top:18px"><button class="ep-cancel-btn" onclick="cancelCfgModelAdd()">Cancel</button><button class="ep-save-btn" onclick="submitCfgModelAdd()">Create model</button></div>'
    +'</div>';
}
function buildCfgModelDetailHTML(){
  const m=cfgModels.find(function(x){return x.id===selectedCfgModelId;})||cfgModels[0];
  const editing=cfgModelEditing;
  const dm=editing&&cfgModelDraft?cfgModelDraft:{name:m.name,source:m.source,desc:m.desc,makerChecker:m.rules.makerChecker,validation:m.rules.validation,mapped:m.mapped,enrichment:m.enrichment};
  const heading=editing
    ?'<div class="ep-form-card" style="margin-bottom:18px">'
      +'<div class="ep-form-title">Model details</div>'
      +'<div class="ep-form-group" style="margin-bottom:14px"><label class="ep-form-label">Model name</label><input class="ep-form-input" id="cfg-model-edit-name" value="'+attrSafe(dm.name)+'"></div>'
      +'<div class="ep-form-group" style="margin-bottom:14px"><label class="ep-form-label">Source system(s)</label><input class="ep-form-input" id="cfg-model-edit-source" value="'+attrSafe(dm.source)+'"></div>'
      +'<div class="ep-form-group"><label class="ep-form-label">Description</label><input class="ep-form-input" id="cfg-model-edit-desc" value="'+attrSafe(dm.desc)+'"></div>'
      +'</div>'
    :'<div style="margin-bottom:24px"><p style="font-size:17px;font-weight:700;margin-bottom:6px">'+m.name+'</p><p style="font-size:12.5px;color:var(--gray);margin:0">Unified object &middot; source: '+m.source+'</p><p style="font-size:12.5px;color:var(--gray);margin-top:4px">'+m.desc+'</p></div>';
  const actionBtns=editing?'':'<div style="display:flex;gap:10px;flex-shrink:0"><button class="btn btn-secondary btn-sm" onclick="startCfgModelEdit()">Edit</button></div>';
  const mapSection=editing
    ?'<div class="ep-form-card" style="margin-bottom:18px">'
      +'<div class="ep-form-title">Field mapping &middot; from '+attrSafe(dm.source)+'</div>'
      +dm.mapped.map(function(f,i){
        return '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px dashed var(--border);flex-wrap:wrap">'
          +'<input class="ep-form-input" style="flex:1;min-width:140px" id="cfg-map-u-'+i+'" value="'+attrSafe(f[0])+'" placeholder="Unified field">'
          +'<input class="ep-form-input" style="flex:1;min-width:140px;font-family:monospace" id="cfg-map-s-'+i+'" value="'+attrSafe(f[1])+'" placeholder="Source field">'
          +cfgTypeSelect('cfg-map-t-'+i,f[2])
          +'<button type="button" class="ep-cancel-btn" style="padding:4px 9px" onclick="removeCfgMappedRow('+i+')">Remove</button>'
          +'</div>';
      }).join('')
      +'<button type="button" class="btn btn-secondary btn-sm" style="margin-top:14px" onclick="addCfgMappedRow()">+ Add mapped field</button>'
      +'</div>'
    :'<div class="ep-form-card" style="margin-bottom:18px">'
      +'<div class="ep-form-title">Field mapping &middot; from '+m.source+'</div>'
      +(m.mapped.length?m.mapped.map(function(f){return cfgMapRow(f[0],f[1],f[2]);}).join(''):'<div style="padding:12px 0;font-size:12.5px;color:var(--gray)">No fields mapped yet.</div>')
      +'</div>';
  const enrichSection=editing
    ?'<div class="ep-form-card" style="margin-bottom:18px;border-color:#f1c27a">'
      +'<div class="ep-form-title" style="color:var(--orange);border-bottom-color:rgba(26,26,26,.25)">Enrichment &middot; extra fields held in Data Foundation</div>'
      +dm.enrichment.map(function(e,i){
        return '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px dashed rgba(26,26,26,.25);flex-wrap:wrap">'
          +'<input class="ep-form-input" style="flex:1;min-width:160px" id="cfg-enr-n-'+i+'" value="'+attrSafe(e.name)+'" placeholder="Enrichment field name">'
          +cfgTypeSelect('cfg-enr-t-'+i,e.type)
          +'<button type="button" class="ep-cancel-btn" style="padding:4px 9px" onclick="removeCfgEnrichRow('+i+')">Remove</button>'
          +'</div>';
      }).join('')
      +'<button type="button" class="btn btn-secondary btn-sm" style="margin-top:14px;border:1px dashed #f1c27a;color:var(--orange);background:transparent" onclick="addCfgEnrichRow()">+ Add enrichment field</button>'
      +'</div>'
    :'<div class="ep-form-card" style="margin-bottom:18px;border-color:#f1c27a">'
      +'<div class="ep-form-title" style="color:var(--orange);border-bottom-color:rgba(26,26,26,.25)">Enrichment &middot; extra fields held in Data Foundation</div>'
      +(m.enrichment.length?m.enrichment.map(function(e){return cfgEnrichRow(e);}).join(''):'<div style="padding:12px 0;font-size:12.5px;color:var(--gray)">No enrichment fields yet.</div>')
      +'</div>';
  const rulesSection=editing
    ?'<div class="ep-form-card" style="margin-bottom:18px">'
      +'<div class="ep-form-title">Rules</div>'
      +'<div style="display:flex;gap:24px;flex-wrap:wrap;align-items:center">'
      +'<div style="display:flex;align-items:center;gap:10px"><label class="cs-toggle"><input type="checkbox" id="cfg-model-edit-mc"'+(dm.makerChecker?' checked':'')+'><span class="cs-toggle-slider"></span></label><span style="font-size:13px;color:var(--navy)">Maker-checker &middot; AI drafts, human approves</span></div>'
      +'<div class="ep-form-group" style="flex:1;min-width:260px"><label class="ep-form-label">Validation rule</label><input class="ep-form-input" id="cfg-model-edit-validation" value="'+attrSafe(dm.validation)+'" placeholder="e.g. Base price must be greater than zero"></div>'
      +'</div></div>'
    :'<div class="ep-form-card" style="margin-bottom:18px">'
      +'<div class="ep-form-title">Rules</div>'
      +'<div style="display:flex;gap:14px;flex-wrap:wrap">'
      +'<div style="flex:1;min-width:220px"><div style="font-size:11px;color:var(--gray);margin-bottom:5px">Maker-checker</div><div style="font-size:13px;font-weight:600;color:'+(m.rules.makerChecker?'#16a34a':'#6b7280')+'">'+(m.rules.makerChecker?'On · AI drafts, human approves':'Off · no review required')+'</div></div>'
      +'<div style="flex:1;min-width:220px"><div style="font-size:11px;color:var(--gray);margin-bottom:5px">Validation</div><div style="font-size:13px;font-weight:600;color:var(--navy)">'+(m.rules.validation||'&mdash;')+'</div></div>'
      +'</div></div>';
  const allFields=m.mapped.map(function(f){return{name:f[0],type:f[2]};}).concat(m.enrichment);
  const sample=cfgModelTested[m.id]
    ?(allFields.length
      ?'<div class="review-section" style="border-color:#93c5fd;background:#eff6ff;margin-top:14px">'
        +'<div class="review-title" style="color:#1d4ed8">Live sample &middot; fetched from '+m.source+' just now</div>'
        +'<div class="review-grid" style="grid-template-columns:1fr">'
        +allFields.map(function(f){return aiDrawerRow(f.name,cfgSampleValueFor(m,f.name,f.type));}).join('')
        +'</div>'
        +'<div style="font-size:11px;color:#1d4ed8;margin-top:10px;display:flex;align-items:center;gap:7px"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Fetched live &middot; not stored, 0 records kept after this view</div>'
        +'</div>'
      :'<div class="review-section" style="margin-top:14px"><div style="font-size:12.5px;color:var(--gray)">No fields mapped yet &mdash; add a field mapping above, then test again.</div></div>')
    :'';
  const removeSection=editing?'':'<div style="margin-top:22px"><button type="button" class="ep-cancel-btn" style="color:#dc2626;border-color:#fca5a5" onclick="confirmRemoveCfgModel(\''+m.id+'\')">Remove model</button></div>';
  const saveCancelBar=editing?'<div style="display:flex;gap:10px;margin-bottom:18px"><button class="ep-cancel-btn" onclick="cancelCfgModelEdit()">Cancel</button><button class="ep-save-btn" onclick="saveCfgModelEdit(\''+m.id+'\')">Save changes</button></div>':'';
  const fetchSampleSection=editing?'':'<div class="ep-form-card">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px">'
    +'<div><div style="font-size:13.5px;font-weight:700;color:var(--navy)">Fetch a sample record</div><div style="font-size:12px;color:var(--gray);margin-top:3px;max-width:480px">Pulls one live record through the mapping above &mdash; to prove the wiring, without storing anything.</div></div>'
    +'<button class="btn btn-primary btn-sm" onclick="testCfgModel(\''+m.id+'\',this)">Run test</button>'
    +'</div>'
    +sample
    +'</div>';
  return '<div class="ai-exec-page">'
    +cfgBackBtn('cfg-data-foundation','Data Foundation')
    +(editing
      ?heading
      :'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px"><div style="flex:1;min-width:0">'+heading+'</div>'+actionBtns+'</div>')
    +mapSection
    +enrichSection
    +rulesSection
    +saveCancelBar
    +fetchSampleSection
    +removeSection
    +'</div>';
}

// -- Configure: Context & Journey (list + detail + agent/governance drawer) --
function viewCfgJourney(id){selectedCfgJourneyId=id;navigatePage('cfg-journey-detail');}
function cfgJourneyStatusPill(status){
  if(status==='Active')return '<span class="status-pill active">Active</span>';
  if(status==='Draft')return '<span class="status-pill draft">Draft</span>';
  return '';
}
const cfgCategoryColors={O2C:'#2563eb',P2P:'#7c3aed',H2R:'#0d9488',F2A:'#d97706'};
function cfgCategoryBadge(catId){
  const c=cfgCategoryColors[catId]||'#6b7280';
  return '<span class="badge" style="background:'+c+'1a;color:'+c+';border:1px solid '+c+'55">'+catId+'</span>';
}
function cfgCatBoxHTML(c,count){
  const col=cfgCategoryColors[c.id];
  const isActive=cfgJourneyCategoryFilter===c.id;
  const locked=portalRole!=='super-admin'&&entityLockedCategories.includes(c.id);
  return '<div class="cfg-cat-box'+(isActive?' active':'')+(locked?' cfg-cat-box-locked':'')+'" style="'+(isActive?'border-color:'+col+';background:'+col+'0d':'')+'" onclick="cfgSetJourneyCategoryFilter(\''+c.id+'\')">'
    +'<div class="cfg-cat-box-top"><span class="cfg-cat-box-id" style="background:'+col+'1a;color:'+col+'">'+c.id+'</span>'+(locked?'<span class="cfg-cat-box-lock"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>Locked</span>':'<span class="cfg-cat-box-count">'+count+' '+(count===1?'journey':'journeys')+'</span>')+'</div>'
    +'<div class="cfg-cat-box-name">'+c.name+'</div>'
    +'<div class="cfg-cat-box-desc">'+c.desc+'</div>'
    +'</div>';
}
function journeyModeBadgeHTML(journeyId){
  const mode=journeyModeLabel(journeyId);
  const cls=mode==='Agent Enabled'?'agent':mode==='Hybrid'?'hybrid':'manual';
  return '<span class="journey-mode-badge '+cls+'">'+mode+'</span>';
}
function enableAgentToggleHTML(journeyId,small){
  const on=isJourneyAgentEnabled(journeyId);
  return '<button class="agent-toggle '+(on?'on':'')+(small?' small':'')+'" onclick="event.stopPropagation();toggleJourneyAgent(\''+journeyId+'\')" title="'+(on?'Disable agent mode':'Enable agent mode')+'"><span class="agent-toggle-track"><span class="agent-toggle-label off-label">Disable</span><span class="agent-toggle-knob"></span><span class="agent-toggle-label on-label">Enable</span></span></button>';
}
function journeyActivationBadgeHTML(journeyId,locked,isRoadmap){
  if(locked)return '<span class="ai-journey-lock-badge"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>Locked</span>';
  if(isRoadmap)return '<span class="status-pill draft">Not Configured</span>';
  if(entityJourneyActivation[journeyId])return '<span class="status-pill active">Available</span>';
  const state=journeyRequestState(journeyId);
  if(state==='awaiting-admin')return '<span class="status-pill pending">Requested</span>';
  return '<span class="status-pill active">Available</span>';
}
function cfgSetJourneyCategoryFilter(cat){
  cfgJourneyCategoryFilter=cfgJourneyCategoryFilter===cat?'':cat;
  renderADTPage();
}
function buildCfgContextJourneyHTML(){
  const filteredJourneys=cfgJourneyCategoryFilter?cfgJourneys.filter(function(j){return j.category===cfgJourneyCategoryFilter;}):cfgJourneys;
  const activeCat=cfgJourneyCategoryFilter?cfgJourneyCategories.find(function(c){return c.id===cfgJourneyCategoryFilter;}):null;
  const catBoxes='<div class="cfg-cat-grid">'
    +cfgJourneyCategories.map(function(c){
      const count=cfgJourneys.filter(function(j){return j.category===c.id;}).length;
      return cfgCatBoxHTML(c,count);
    }).join('')
    +'</div>';
  const catInfo=activeCat?'<div style="font-size:12.5px;color:var(--gray);margin:2px 0 16px;display:flex;align-items:center;gap:10px">Showing <b style="color:var(--navy)">'+activeCat.name+'</b> journeys only<button class="cfg-cat-clear" onclick="cfgSetJourneyCategoryFilter(\'\')">Clear filter</button></div>':'<div style="font-size:12.5px;color:var(--gray);margin:2px 0 16px">Showing all journeys &mdash; click a category above to filter.</div>';
  const cards=filteredJourneys.length?filteredJourneys.map(function(j){
    const isRoadmap=!!j.locked;
    const locked=isRoadmap&&portalRole!=='super-admin';
    const superAdminUnconfigured=isRoadmap&&portalRole==='super-admin';
    const clickAttr=locked?'':(superAdminUnconfigured?' style="cursor:pointer" onclick="openLockedJourneyModal(\''+j.id+'\')"':' onclick="viewCfgJourney(\''+j.id+'\')"');
    return '<div class="ai-journey-card cfg-journey-card'+(locked?' ai-journey-card-locked':'')+'" '+clickAttr+'>'
      +'<div class="cfg-journey-main">'
      +'<div class="cfg-journey-title-row"><div class="ai-journey-name">'+j.name+'</div><div class="cfg-journey-statuses">'+cfgCategoryBadge(j.category)+journeyActivationBadgeHTML(j.id,locked,superAdminUnconfigured)+(!locked&&portalRole!=='super-admin'?journeyModeBadgeHTML(j.id):'')+'</div></div>'
      +'<div class="ai-journey-desc cfg-journey-desc">'+j.desc+'</div>'
      +'<div class="cfg-journey-tags">'+j.tags.map(function(t){return '<span class="badge">'+t+'</span>';}).join('')+'</div>'
      +'</div>'
      +(locked?'':'<span class="cfg-journey-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg></span>')
      +'</div>';
  }).join(''):'<div class="ai-journey-card" style="text-align:center;color:var(--gray);font-size:12.5px;padding:32px">No journeys in this category yet.</div>';
  const showCatFilter=portalRole==='super-admin';
  return '<div class="ai-exec-page">'
    +cfgPageHead('Context & Journey','Pick a predefined business journey to see its steps and assign the agent and governance that runs each one.')
    +(showCatFilter?catBoxes+catInfo:'')
    +'<div style="display:flex;flex-direction:column;gap:16px">'+cards+'</div>'
    +'</div>';
}
function cfgStepTypeTag(type){
  if(type==='eng')return '<span class="badge" style="color:var(--gray)">Engine</span>';
  if(type==='rule')return '<span class="badge" style="color:var(--navy);border-color:#cbd5e1;background:#f1f5f9">'+'Rule</span>';
  return '<span class="badge" style="color:#0d9488;background:#f0fdfa;border-color:#99f6e4">Source</span>';
}
function buildCfgJourneyDetailHTML(){
  const j=cfgJourneys.find(function(x){return x.id===selectedCfgJourneyId;})||cfgJourneys[0];
  const agentOn=isJourneyAgentEnabled(j.id);
  const detailActions=portalRole!=='super-admin'?'<div class="cfg-detail-actions"><div class="cfg-agent-control"><span>Agent</span>'+enableAgentToggleHTML(j.id,true)+'</div></div>':'';
  const timeline=j.steps.map(function(st,i){
    const key=j.id+'__'+i;
    const assign=cfgStepAssignments[key];
    const isHuman=st.type==='rule';
    const manualStep=cfgManualStep(j.id,i);
    const canShowAgent=agentOn&&!isHuman&&manualStep.agentCapable&&!manualStep.approvalRequired;
    const rec=(!assign&&canShowAgent)?cfgRecommendedAgentForStep(st):null;
    const assignBadge=isHuman
      ?'<span class="badge" style="margin-left:6px">Human approval required</span>'
      :!agentOn
        ?''
        :(assign||rec)
          ?'<span class="badge" style="margin-left:6px">Agent: '+(assign?assign.agent:rec.name)+'</span>'
          :'<span class="badge" style="margin-left:6px">No agent assigned yet</span>';
    const agentCapableStep=!isHuman&&manualStep.agentCapable&&!manualStep.approvalRequired;
    const stepMode=agentCapableStep?'<span class="manual-step-mode agent">AI Agent</span>':'<span class="manual-step-mode">Manual</span>';
    const ownerLabel=manualStep.ownerRole||'Owner TBD';
    return '<div class="ai-timeline-item cfg-step-item">'
      +'<div class="ai-timeline-dot cfg-flow-dot">'+(i+1)+'</div>'
      +'<div class="ai-timeline-card cfg-step-card" onclick="openCfgStepDrawer(\''+j.id+'\','+i+')">'
      +'<div class="cfg-step-head"><div class="cfg-step-title-wrap"><div class="ai-timeline-card-title">'+st.name+'</div><div class="ai-timeline-card-desc">'+st.src+'</div></div><span class="cfg-owner-pill">'+ownerLabel+'</span></div>'
      +'<div class="cfg-step-meta"><span>Module: '+(manualStep.modulePage?manualModuleLabel(manualStep.modulePage):'Not mapped')+'</span><span>SLA: '+(manualStep.sla||'TBD')+'</span></div>'
      +'<div class="cfg-step-footer"><div class="ai-timeline-chips">'+cfgStepTypeTag(st.type)+assignBadge+stepMode+'</div></div>'
      +'</div></div>';
  }).join('');
  const emptyStepsNote=(!j.steps.length)?'<div class="cfg-step-empty-note" style="margin-left:44px;padding:14px 16px;border:1.5px dashed var(--border);border-radius:10px;font-size:12.5px;color:var(--gray)">No steps configured yet &mdash; add the first step to start building this journey.</div>':'';
  const addStepBtn=j.locked?'<button class="btn btn-secondary btn-sm" style="margin-top:16px;margin-left:44px;border-style:dashed" onclick="openCfgAddStepModal(\''+j.id+'\')">+ Add step</button>':'';
  const respEvents=aiJourneyEvents[j.id]||[];
  const totalSteps=respEvents.length||j.steps.length;
  const aiStepsCount=respEvents.filter(function(e){return e.chips.includes('AI Automated');}).length;
  const humanStepsCount=respEvents.filter(function(e){return e.chips.includes('Human Required')||e.chips.includes('Approval Required')||e.chips.includes('Client Action');}).length;
  const riskLevel=(aiJourneys.find(function(x){return x.id===j.id;})||{}).risk||'—';
  const statGrid='<div class="stat-grid cfg-detail-stat-grid" style="margin-bottom:16px">'
    +'<div class="stat-card"><div class="stat-label"><span>Total Events</span></div><div class="stat-val">'+totalSteps+'</div></div>'
    +'<div class="stat-card"><div class="stat-label"><span>AI Automated</span></div><div class="stat-val" style="color:var(--orange)">'+aiStepsCount+'</div></div>'
    +'<div class="stat-card"><div class="stat-label"><span>Human Required</span></div><div class="stat-val" style="color:#2563eb">'+humanStepsCount+'</div></div>'
    +'<div class="stat-card"><div class="stat-label"><span>Risk Level</span></div><div class="stat-val" style="font-size:16px">'+riskLevel+'</div></div>'
    +'</div>';
  return '<div class="ai-exec-page ai-journey-detail-page">'
    +cfgBackBtn('cfg-context-journey','Context & Journey')
    +'<div class="cfg-detail-hero"><div><div class="cfg-detail-title-row"><p>'+j.name+'</p>'+journeyActivationBadgeHTML(j.id,!!j.locked&&portalRole!=='super-admin',!!j.locked&&portalRole==='super-admin')+(portalRole!=='super-admin'?journeyModeBadgeHTML(j.id):'')+'</div><div class="cfg-detail-sub">'+j.desc+'</div></div>'+detailActions+'</div>'
    +statGrid
    +'<div class="cfg-resp-caption">Responsibility Split</div>'
    +buildAIResponsibilitySplitHTML(j.id)
    +'<div class="review-title" style="margin:20px 0 10px;font-size:14.5px">Flow &middot; runs top to bottom &middot; click a step to view its assigned agent</div>'
    +'<div class="ai-timeline cfg-flow-timeline">'+timeline+'</div>'
    +emptyStepsNote
    +addStepBtn
    +'</div>';
}
function openCfgAddStepModal(journeyId){
  const j=cfgJourneys.find(function(x){return x.id===journeyId;});if(!j)return;
  const typeOptions='<option value="src">Source &mdash; system/AI performed</option><option value="rule">Human Approval &mdash; needs sign-off</option><option value="eng">Engine &mdash; internal processing</option>';
  const moduleOptions='<option value="">Not mapped</option>'+Object.keys(manualModulePageLabels).map(function(k){return '<option value="'+k+'">'+manualModulePageLabels[k]+'</option>';}).join('');
  document.getElementById('ct-modal-overlay').innerHTML=
    '<div class="ct-modal cas-modal" onclick="event.stopPropagation()">'
    +'<div class="ct-modal-hdr" style="align-items:flex-start;margin-bottom:22px">'
    +'<div><div class="ct-modal-title">Add Step</div><div style="font-size:12.5px;color:var(--gray);margin-top:3px">'+j.name+'</div></div>'
    +'<button class="ct-modal-close" onclick="closeCtModal()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
    +'</div>'
    +'<div class="ep-form-group" style="margin-bottom:18px"><label class="ep-form-label">Step Name <span class="req">*</span></label><input id="cas-name" class="ep-form-input" type="text" placeholder="e.g. Send Proposal"></div>'
    +'<div class="ep-form-grid" style="row-gap:18px">'
    +'<div class="ep-form-group"><label class="ep-form-label">Step Type <span class="req">*</span></label><select id="cas-type" class="ep-form-select">'+typeOptions+'</select></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Performed By <span class="req">*</span></label><input id="cas-src" class="ep-form-input" type="text" placeholder="e.g. AI Contract Assistant"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Owner Role</label><input id="cas-owner" class="ep-form-input" type="text" placeholder="e.g. Compliance Officer"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Module</label><select id="cas-module" class="ep-form-select">'+moduleOptions+'</select></div>'
    +'<div class="ep-form-group" style="grid-column:1/-1"><label class="ep-form-label">SLA</label><input id="cas-sla" class="ep-form-input" type="text" placeholder="e.g. 4h" style="max-width:calc(50% - 9px)"></div>'
    +'</div>'
    +'<div class="cas-modal-footer">'
    +'<button class="ep-cancel-btn" onclick="closeCtModal()">Cancel</button>'
    +'<button class="ep-save-btn" onclick="submitCfgAddStep(\''+journeyId+'\')">Add Step</button>'
    +'</div></div>';
  document.getElementById('ct-modal-overlay').style.display='flex';
  requestAnimationFrame(function(){const el=document.getElementById('cas-name');if(el)el.focus();});
}
function submitCfgAddStep(journeyId){
  const j=cfgJourneys.find(function(x){return x.id===journeyId;});if(!j)return;
  const nameVal=(document.getElementById('cas-name')||{}).value||'';
  const srcVal=(document.getElementById('cas-src')||{}).value||'';
  if(!nameVal.trim()){alert('Please enter a step name.');return;}
  if(!srcVal.trim()){alert('Please enter who performs this step.');return;}
  const typeVal=(document.getElementById('cas-type')||{}).value||'src';
  const ownerVal=(document.getElementById('cas-owner')||{}).value||'';
  const moduleVal=(document.getElementById('cas-module')||{}).value||'';
  const slaVal=(document.getElementById('cas-sla')||{}).value||'';
  j.steps.push({name:nameVal.trim(),src:srcVal.trim(),type:typeVal,ownerRole:ownerVal.trim(),modulePage:moduleVal,sla:slaVal.trim(),agentCapable:typeVal!=='rule',approvalRequired:typeVal==='rule'});
  if(j.locked)j.tags=[j.steps.length+' step'+(j.steps.length===1?'':'s')].concat(j.tags.filter(function(t){return t!=='Roadmap'&&!/^\d+\s+steps?$/.test(t);}));
  closeCtModal();
  renderADTPage();
  showAiToast('Step added','"'+nameVal.trim()+'" was added to '+j.name+'.');
}
let _cfgFlowObserver=null;
let _cfgFlowScrollHandler=null;
function initCfgFlowScroll(){
  if(_cfgFlowObserver){_cfgFlowObserver.disconnect();_cfgFlowObserver=null;}
  const root=document.getElementById('adt-content');
  if(root&&_cfgFlowScrollHandler){root.removeEventListener('scroll',_cfgFlowScrollHandler);_cfgFlowScrollHandler=null;}
  const items=root?Array.prototype.slice.call(root.querySelectorAll('.cfg-flow-timeline .cfg-step-item')):[];
  if(!root||!items.length)return;
  const rootRect=root.getBoundingClientRect();
  const triggerOffset=rootRect.height*0.5;
  const triggerY=rootRect.top+triggerOffset;
  const marginTop=-triggerOffset;
  const marginBottom=-(rootRect.height-triggerOffset-2);
  const lastIdx=items.length-1;
  _cfgFlowObserver=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      const el=entry.target;
      if(entry.isIntersecting){
        el.classList.add('cfg-flow-active');
        el.classList.remove('cfg-flow-reached');
      }else if(entry.boundingClientRect.top<triggerY){
        el.classList.remove('cfg-flow-active');
        el.classList.add('cfg-flow-reached');
      }else{
        el.classList.remove('cfg-flow-active','cfg-flow-reached');
      }
    });
  },{root:root,rootMargin:marginTop+'px 0px '+marginBottom+'px 0px',threshold:0});
  function observeAll(){items.forEach(function(it){_cfgFlowObserver.observe(it);});}
  observeAll();
  items[0].classList.add('cfg-flow-active');
  // Any number of trailing cards can be too short (individually or combined) to ever
  // scroll their way past the mid-viewport trigger line before hitting max scroll — so
  // relying on IntersectionObserver alone can strand several cards un-lit at the bottom.
  // Fix: once truly at the bottom, disconnect the observer (so its async callbacks can't
  // race with / undo this) and force every card's state directly. Reconnect on scroll-up.
  let atBottomLock=false;
  _cfgFlowScrollHandler=function(){
    const atBottom=root.scrollHeight-root.scrollTop-root.clientHeight<4;
    if(atBottom){
      if(!atBottomLock){atBottomLock=true;_cfgFlowObserver.disconnect();}
      items.forEach(function(it,idx){
        if(idx===lastIdx){it.classList.add('cfg-flow-active');it.classList.remove('cfg-flow-reached');}
        else{it.classList.remove('cfg-flow-active');it.classList.add('cfg-flow-reached');}
      });
    }else if(atBottomLock){
      atBottomLock=false;
      observeAll();
    }
  };
  root.addEventListener('scroll',_cfgFlowScrollHandler,{passive:true});
  _cfgFlowScrollHandler();
}
function openCfgStepDrawer(journeyId,idx){
  cfgDrawerJourneyId=journeyId;cfgDrawerStepIdx=idx;
  const overlay=document.getElementById('ct-modal-overlay');if(!overlay)return;
  overlay.innerHTML=renderCfgStepDrawer();
  overlay.style.display='flex';
}
function closeCfgStepDrawer(){
  cfgDrawerJourneyId=null;cfgDrawerStepIdx=-1;
  const overlay=document.getElementById('ct-modal-overlay');if(overlay){overlay.style.display='none';overlay.innerHTML='';}
}
function renderCfgStepDrawer(){
  const j=cfgJourneys.find(function(x){return x.id===cfgDrawerJourneyId;});if(!j)return '';
  const st=j.steps[cfgDrawerStepIdx];if(!st)return '';
  const key=j.id+'__'+cfgDrawerStepIdx;
  const assign=cfgStepAssignments[key]||{};
  const isHuman=st.type==='rule';
  const manualStep=cfgManualStep(j.id,cfgDrawerStepIdx);
  const agentOn=isJourneyAgentEnabled(j.id);
  const canShowAgent=agentOn&&!isHuman&&manualStep.agentCapable&&!manualStep.approvalRequired;
  const rec=(!assign.agent&&canShowAgent)?cfgRecommendedAgentForStep(st):null;
  const displayAgent=assign.agent||(rec?rec.name:'');
  const header='<div class="ct-modal-hdr"><span class="ct-modal-title">'+st.name+'</span><button class="ct-modal-close" onclick="closeCfgStepDrawer()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>';
  const body='<div class="review-section"><div class="review-title">Step Source</div><p style="font-size:12.5px;color:var(--navy);line-height:1.6">'+st.src+'</p></div>'
    +(isHuman
      ?'<div class="review-section" style="border-color:#93c5fd;background:#eff6ff"><div class="review-title" style="color:#1d4ed8">Human approval required</div><p style="font-size:12.5px;color:#1d4ed8;line-height:1.6">This step is governed by a rule and routes to a human for sign-off before the journey continues.</p></div>'
      :!canShowAgent
        ?'<div class="review-section"><div class="review-title">Manual step</div><p style="font-size:12.5px;color:var(--gray);line-height:1.6">'+(agentOn?'No agent is available for this step, so it remains manual.':'Enable Agent at journey level to configure agent-capable steps. Until then, this step stays manual.')+'</p></div>'
      :displayAgent
        ?'<div class="review-section"><div class="review-title">Assigned Agent<button class="btn btn-secondary btn-sm" onclick="viewCfgAgentSkillByName(\''+displayAgent.replace(/'/g,"\\'")+'\')">Rules</button></div>'
          +'<p style="font-size:13px;color:var(--navy);font-weight:600;margin:0">'+displayAgent+'</p>'
          +'</div>'
        :'<div class="review-section"><div class="review-title">No agent assigned</div><p style="font-size:12.5px;color:var(--gray);line-height:1.6">No agent is currently mapped to this step.</p></div>');
  return '<div class="ct-modal" style="width:min(600px,92vw)" onclick="event.stopPropagation()">'+header+body+'</div>';
}
function cfgRecommendedAgentForStep(st){
  if(st.type==='rule')return null;
  return findCfgAgentByName(st.src)||null;
}
// -- Configure: Agents --
function cfgEscapeHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function cfgAgentSlug(name){return String(name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}
function findCfgAgentByName(name){return cfgAgents.find(function(a){return a.name===name;});}
function viewCfgAgentSkillByName(name){
  const idx=cfgAgents.findIndex(function(a){return a.name===name;});
  if(idx===-1)return;
  viewCfgAgentSkill(idx);
}
function viewCfgAgentSkill(idx){
  cfgAgentSkillModalIdx=idx;
  cfgAgentSkillEditing=false;
  const overlay=document.getElementById('ct-modal-overlay');if(!overlay)return;
  overlay.innerHTML=renderCfgAgentSkillModal();
  overlay.style.display='flex';
}
function closeCfgAgentSkillModal(){
  cfgAgentSkillModalIdx=-1;cfgAgentSkillEditing=false;
  const overlay=document.getElementById('ct-modal-overlay');if(overlay){overlay.style.display='none';overlay.innerHTML='';}
}
function refreshCfgAgentSkillModal(){
  const overlay=document.getElementById('ct-modal-overlay');if(!overlay)return;
  overlay.innerHTML=renderCfgAgentSkillModal();
}
function startCfgAgentSkillEdit(){cfgAgentSkillEditing=true;refreshCfgAgentSkillModal();}
function cancelCfgAgentSkillEdit(){cfgAgentSkillEditing=false;refreshCfgAgentSkillModal();}
function saveCfgAgentSkillEdit(){
  const a=cfgAgents[cfgAgentSkillModalIdx];if(!a)return;
  const ta=document.getElementById('cfg-agent-skill-edit');
  if(ta)a.skillMd=ta.value;
  cfgAgentSkillEditing=false;
  refreshCfgAgentSkillModal();
}
function resetCfgAgentSkillToOriginal(){
  const idx=cfgAgentSkillModalIdx;const a=cfgAgents[idx];if(!a)return;
  a.skillMd=cfgAgentsOriginalSkill[idx];
  cfgAgentSkillEditing=false;
  refreshCfgAgentSkillModal();
}
function renderCfgAgentSkillModal(){
  const idx=cfgAgentSkillModalIdx;
  const a=cfgAgents[idx];if(!a)return '';
  const filename=cfgAgentSlug(a.name)+'/skill.md';
  const modified=a.skillMd!==cfgAgentsOriginalSkill[idx];
  const header='<div class="ct-modal-hdr"><span class="ct-modal-title" style="font-family:monospace;font-size:12.5px;display:flex;align-items:center;gap:8px">'+filename
    +(modified?'<span class="badge" style="color:var(--navy);border-color:#cbd5e1;background:#f1f5f9;font-family:var(--body)">modified</span>':'')
    +'</span><button class="ct-modal-close" onclick="closeCfgAgentSkillModal()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>';
  const content=cfgAgentSkillEditing
    ?'<textarea id="cfg-agent-skill-edit" style="width:100%;min-height:360px;font-family:monospace;font-size:12px;line-height:1.7;color:var(--navy);background:var(--light);border:1px solid var(--border);border-radius:10px;padding:18px 20px;resize:vertical;box-sizing:border-box">'+cfgEscapeHtml(a.skillMd)+'</textarea>'
    :'<pre style="white-space:pre-wrap;word-break:break-word;font-family:monospace;font-size:12px;line-height:1.7;color:var(--navy);background:var(--light);border:1px solid var(--border);border-radius:10px;padding:18px 20px;margin:0">'+cfgEscapeHtml(a.skillMd)+'</pre>';
  const actions=cfgAgentSkillEditing
    ?'<div style="display:flex;gap:10px;padding-top:14px;flex-shrink:0"><button class="ep-cancel-btn" onclick="cancelCfgAgentSkillEdit()">Cancel</button><button class="ep-save-btn" onclick="saveCfgAgentSkillEdit()">Save changes</button></div>'
    :'<div style="display:flex;gap:10px;padding-top:14px;flex-shrink:0"><button class="btn btn-primary btn-sm" onclick="startCfgAgentSkillEdit()">Edit</button>'
      +(modified?'<button class="btn btn-secondary btn-sm" onclick="resetCfgAgentSkillToOriginal()">Reset to original</button>':'')
      +'</div>';
  return '<div class="ct-modal" style="width:min(680px,94vw);max-height:82vh;display:flex;flex-direction:column" onclick="event.stopPropagation()">'
    +header
    +'<div style="overflow-y:auto;flex:1;min-height:0">'+content+'</div>'
    +actions
    +'</div>';
}
const agentIconPaths={
  'AI Prompt Parser':'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  'AI Contract Assistant':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  'AI + Docuseal':'<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  'AI Onboarding Engine':'<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 14 2 2 4-4"/>',
  'AI Payroll Readiness Check':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  'AI Timesheet Sync':'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'AI Payroll Engine':'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  'AI Payslip Generator':'<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  'AI Payroll Archive':'<rect x="2" y="4" width="20" height="5" rx="1"/><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><line x1="10" y1="13" x2="14" y2="13"/>',
  'AI Compliance Hub Sync':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  'AI Leave Policy Engine':'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  'AI Offboarding Engine':'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'
};
function agentIconSvg(name){
  const path=agentIconPaths[name]||'<path d="M12 3c.3 3.6 1.4 4.7 5 5-3.6.3-4.7 1.4-5 5-.3-3.6-1.4-4.7-5-5 3.6-.3 4.7-1.4 5-5Z"/>';
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+path+'</svg>';
}
function buildCfgAgentsHTML(){
  const cards=cfgAgents.map(function(a,i){
    const usedInPills=a.usedIn.split(', ').map(function(u){
      return '<span class="badge" style="color:var(--navy);background:#f1f5f9">'+u+'</span>';
    }).join('');
    return '<div class="agent-card">'
      +'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:10px">'
      +'<div style="display:flex;align-items:center;gap:12px;min-width:0">'
      +'<div class="agent-card-icon" style="background:var(--ol)">'+agentIconSvg(a.name)+'</div>'
      +'<div style="min-width:0"><div style="font-size:14.5px;font-weight:700;color:var(--navy)">'+a.name+'</div><div style="font-size:11px;color:var(--gray);margin-top:3px;display:flex;align-items:center;gap:7px"><span>'+a.type+'</span><span class="status-pill active" style="min-width:0;height:auto;padding:1.5px 8px;font-size:9.5px">Active</span></div></div>'
      +'</div>'
      +'<button type="button" class="btn btn-secondary btn-sm" style="flex-shrink:0" onclick="viewCfgAgentSkill('+i+')">Agent Skill</button>'
      +'</div>'
      +'<div style="font-size:12.5px;color:var(--gray);line-height:1.6;margin-bottom:14px">'+a.desc+'</div>'
      +'<div style="display:flex;flex-wrap:wrap;gap:7px;align-items:center">'
      +'<span class="badge" style="color:var(--navy);background:#f1f5f9">'+a.guardrail+'</span>'
      +'<span class="badge" style="color:var(--navy);background:#f1f5f9">'+a.model+'</span>'
      +usedInPills
      +'</div>'
      +'</div>';
  }).join('');
  return '<div class="ai-exec-page">'
    +cfgPageHead('Agents','The agents that read, draft and act — always inside your rules.')
    +cards
    +'</div>';
}

const aiEntityOptions=['ADT Netherlands B.V.','ADT Germany GmbH','ADT India Pvt Ltd','ADT Spain S.L.','ADT UK Ltd'];
const aiCountryOptions=['Netherlands','India','Germany','Spain','United Kingdom'];
const aiEmploymentTypeOptions=['EOR','PEO','Contractor'];
const aiTriggerOptions=[
  {title:'Trigger when proposal is approved',desc:'Automatically starts this journey the moment a proposal reaches Approved status.'},
  {title:'Trigger when contract is created',desc:'Starts this journey as soon as a new contract record is created in ADT.'},
  {title:'Trigger manually',desc:'Admin starts this journey on demand from the journey detail page.'},
  {title:'Trigger on schedule',desc:'Runs automatically on a recurring schedule you define, e.g. daily or weekly.'}
];
const aiValidationChecklist=['Approved proposal required','Active contract template required','Entity mapping required','Client signatory required','Country rules required','Salary/commercial terms required','Payroll data required','Compliance documents required'];
let aiAutomationConfigs={};
let aiAutomateStep=0;
let aiAutomateFormData={};
let aiAutomateSkipPicker=false;
let aiAutomateProgress={};
function aiAutomateVisibleSteps(){return aiAutomateSkipPicker?[1,2,3,4,5,6]:[0,1,2,3,4,5,6];}
function aiAutomateResumeOrStart(journeyId){
  selectedAIJourneyId=journeyId;
  const saved=aiAutomateProgress[journeyId];
  if(saved){aiAutomateStep=saved.step;aiAutomateFormData=Object.assign({},saved.formData);}
  else{aiAutomateStep=1;aiAutomateFormData={};}
}
function aiAutomateSaveProgress(){
  aiAutomateCaptureStep();
  if(!selectedAIJourneyId||aiAutomateStep===0)return;
  aiAutomateProgress[selectedAIJourneyId]={step:aiAutomateStep,formData:Object.assign({},aiAutomateFormData)};
  const j=aiJourneys.find(function(x){return x.id===selectedAIJourneyId;});
  if(j&&j.status!=='Active')j.status='Draft';
}
const aiAutomateSteps=[
  {label:'Select Journey',desc:'Choose which business journey you want to configure AI automation for.'},
  {label:'Basic Details',desc:'Name this automation and set the entity, country, and employment type it applies to.'},
  {label:'Trigger',desc:'Choose what starts this journey automatically.'},
  {label:'Automation Scope',desc:'Decide what AI can handle at each event, and where a human must stay in the loop.'},
  {label:'Approval Rules',desc:'Assign who signs off on the key actions in this journey.'},
  {label:'Data Validation',desc:'Choose which checks must pass before AI is allowed to proceed.'},
  {label:'Review & Activate',desc:'Review your configuration below, then save it as a draft or activate it.'}
];

function aiEventIsToggleable(e){return e.chips.includes('AI Automated');}
function aiScopeDefaults(e){
  const toggleable=aiEventIsToggleable(e);
  return {mode:toggleable?'ai':'manual'};
}
function aiScopeModeChoose(el,i,mode,eventName){
  const seg=el.parentElement;
  const activeBtn=seg.querySelector('.seg-btn.active');
  const currentMode=activeBtn?activeBtn.getAttribute('data-mode'):null;
  if(currentMode===mode)return;
  document.getElementById('ct-modal-overlay').innerHTML=
    '<div class="ct-modal" style="width:min(460px,92vw);text-align:center;padding:34px 32px" onclick="event.stopPropagation()">'
    +'<div style="width:64px;height:64px;border-radius:50%;background:#fef3c7;display:flex;align-items:center;justify-content:center;margin:0 auto 18px"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" shape-rendering="geometricPrecision"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17.02" x2="12.01" y2="17.02"/></svg></div>'
    +'<div style="font-size:17px;font-weight:700;color:var(--navy);margin-bottom:12px">Confirm Change</div>'
    +'<div style="font-size:13.5px;color:var(--gray);line-height:1.65;margin-bottom:26px">Set <strong style="color:var(--navy)">'+eventName+'</strong> to run as <strong style="color:var(--navy)">'+(mode==='ai'?'AI Automated':'Manual')+'</strong>?</div>'
    +'<div style="display:flex;justify-content:center;gap:12px">'
    +'<button class="ep-cancel-btn" onclick="closeCtModal()">Cancel</button>'
    +'<button class="ep-save-btn" onclick="aiScopeModeApply('+i+',\''+mode+'\')">Yes, Confirm</button>'
    +'</div></div>';
  document.getElementById('ct-modal-overlay').style.display='flex';
}
function aiScopeModeApply(i,mode){
  const seg=document.getElementById('ai-scope-mode-'+i);
  if(seg){
    [].slice.call(seg.querySelectorAll('.seg-btn')).forEach(function(b){b.classList.toggle('active',b.getAttribute('data-mode')===mode);});
  }
  closeCtModal();
}

function aiWizardStepperHTML(current){
  const visible=aiAutomateVisibleSteps();
  const posInVisible=visible.indexOf(current);
  return '<div class="ai-wizard-stepper">'
    +visible.map(function(idx,pos){
      const active=pos===posInVisible,done=pos<posInVisible;
      const circleContent=done?'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>':(pos+1);
      let html='<div class="ai-wizard-step'+(active?' active':'')+(done?' done':'')+'" onclick="aiAutomateGoStep('+idx+')">'
        +'<div class="ai-wizard-step-circle">'+circleContent+'</div>'
        +'<span class="ai-wizard-step-label">'+aiAutomateSteps[idx].label+'</span>'
        +'</div>';
      if(pos<visible.length-1)html+='<div class="ai-wizard-step-line'+(done?' done':'')+'"></div>';
      return html;
    }).join('')
    +'</div>';
}
function aiStepHeaderHTML(i){
  return '<div class="ai-wizard-step-header"><div class="ai-wizard-step-title">'+aiAutomateSteps[i].label+'</div><div class="ai-wizard-step-subtitle">'+aiAutomateSteps[i].desc+'</div></div>';
}
function aiOptsHTML(options,current){
  return options.map(function(o){return '<option'+(o===current?' selected':'')+'>'+o+'</option>';}).join('');
}

function aiSelectJourneyCard(el){
  const grid=el.parentElement;
  [].slice.call(grid.querySelectorAll('.ai-journey-pick-card')).forEach(function(c){c.classList.remove('selected');});
  el.classList.add('selected');
}
function aiWizardSelectJourneyHTML(){
  const current=selectedAIJourneyId||aiJourneys[0].id;
  const cards=aiJourneys.map(function(j){
    return '<div class="ai-journey-pick-card'+(j.id===current?' selected':'')+'" onclick="aiSelectJourneyCard(this)" data-journey-id="'+j.id+'">'
      +'<div class="ai-journey-pick-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>'
      +'<div class="ai-journey-pick-icon">'+j.icon+'</div>'
      +'<div class="ai-journey-pick-name">'+j.name+'</div>'
      +'<div class="ai-journey-pick-desc">'+j.desc+'</div>'
      +'<div class="ai-journey-pick-meta">'+j.modules.length+' modules &middot; '+j.coverage+'% automation coverage</div>'
      +'</div>';
  }).join('');
  return '<div class="ai-journey-grid" id="ai-journey-pick-grid">'+cards+'</div>';
}
function aiWizardBasicDetailsHTML(j){
  const d=aiAutomateFormData;
  const name=d.name!==undefined?d.name:(j.name+' Automation');
  const activeStatus=d.statusActive!==undefined?d.statusActive:(j.status==='Active');
  return '<div class="ep-form-card ai-wizard-form-card">'
    +'<div class="ep-form-grid ai-wizard-form-grid">'
    +'<div class="ep-form-group"><label class="ep-form-label">Automation Name</label><input class="ep-form-input" id="ai-auto-name" value="'+name+'"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Journey Type</label><input class="ep-form-input" value="'+j.name+'" readonly style="background:var(--light);color:var(--gray)"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Entity</label><select class="ep-form-select" id="ai-auto-entity">'+aiOptsHTML(aiEntityOptions,d.entity)+'</select></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Country</label><select class="ep-form-select" id="ai-auto-country">'+aiOptsHTML(aiCountryOptions,d.country)+'</select></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Employment Type</label><select class="ep-form-select" id="ai-auto-emp-type">'+aiOptsHTML(aiEmploymentTypeOptions,d.empType)+'</select></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Effective From Date</label><input class="ep-form-input" type="date" id="ai-auto-effective" value="'+(d.effective||'')+'"></div>'
    +'<div class="ep-form-group ep-form-full"><label class="ep-form-label">Status</label><div class="segmented" id="ai-auto-status-seg" style="max-width:240px"><button type="button" class="seg-btn'+(!activeStatus?' active':'')+'" onclick="selSeg(this)">Draft</button><button type="button" class="seg-btn'+(activeStatus?' active':'')+'" onclick="selSeg(this)">Active</button></div></div>'
    +'</div></div>';
}
function aiWizardTriggerHTML(){
  const current=aiAutomateFormData.trigger;
  const triggerCards=aiTriggerOptions.map(function(t,i){
    const isSel=current?t.title===current:i===0;
    return '<label class="choice-card'+(isSel?' selected':'')+'" onclick="selRadio(this)">'
      +'<input type="radio" name="ai-trigger"'+(isSel?' checked':'')+'>'
      +'<div class="choice-radio"></div>'
      +'<div class="choice-body"><div class="choice-title">'+t.title+'</div><div class="choice-desc">'+t.desc+'</div></div>'
      +'</label>';
  }).join('');
  return '<div class="ep-form-card"><div class="choice-grid" id="ai-trigger-grid">'+triggerCards+'</div></div>';
}
function aiWizardScopeHTML(events){
  const saved=aiAutomateFormData.scope;
  const scopeRows=events.map(function(e,i){
    const toggleable=aiEventIsToggleable(e);
    const d=(saved&&saved[i])?saved[i]:aiScopeDefaults(e);
    const mode=d.mode||(toggleable?'ai':'manual');
    const nameSafe=e.name.replace(/'/g,"\\'");
    if(!toggleable){
      return '<div class="ai-scope-row ai-scope-row-manual">'
        +'<div class="ai-scope-name"><div class="ai-scope-name-text">'+(i+1)+'. '+e.name+'</div><div class="ai-timeline-chips">'+aiChips(e.chips)+'</div></div>'
        +'<div class="ai-scope-manual-badge">Manual step &mdash; requires human action</div>'
        +'</div>';
    }
    return '<div class="ai-scope-row">'
      +'<div class="ai-scope-name"><div class="ai-scope-name-text">'+(i+1)+'. '+e.name+'</div><div class="ai-timeline-chips">'+aiChips(e.chips)+'</div></div>'
      +'<div class="segmented ai-scope-mode-seg" id="ai-scope-mode-'+i+'">'
      +'<button type="button" class="seg-btn'+(mode==='ai'?' active':'')+'" data-mode="ai" onclick="aiScopeModeChoose(this,'+i+',\'ai\',\''+nameSafe+'\')">AI</button>'
      +'<button type="button" class="seg-btn'+(mode==='manual'?' active':'')+'" data-mode="manual" onclick="aiScopeModeChoose(this,'+i+',\'manual\',\''+nameSafe+'\')">Manual</button>'
      +'</div>'
      +'</div>';
  }).join('');
  return '<div class="ep-form-card"><div class="ai-scope-table">'+scopeRows+'</div></div>';
}
function aiWizardApprovalsHTML(j){
  const d=aiAutomateFormData.approvals||{};
  return '<div class="ep-form-card">'
    +'<div class="ep-form-grid">'
    +'<div class="ep-form-group"><label class="ep-form-label">Who approves contract data?</label><select class="ep-form-select" id="ai-appr-contract-data">'+aiOptsHTML(['OpenDHI Admin','Payroll Admin','Compliance Officer','Finance Admin'],d.contractData)+'</select></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Who approves sending contract?</label><select class="ep-form-select" id="ai-appr-send-contract">'+aiOptsHTML(['OpenDHI Admin','Sales Manager'],d.sendContract)+'</select></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Who approves document exceptions?</label><select class="ep-form-select" id="ai-appr-doc-exceptions">'+aiOptsHTML(['Compliance Officer','Onboarding Admin'],d.docExceptions)+'</select></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Who confirms Ready for Payroll?</label><select class="ep-form-select" id="ai-appr-ready-payroll">'+aiOptsHTML(['Payroll Admin','Finance Admin'],d.readyPayroll)+'</select></div>'
    +'<div class="ep-form-group ep-form-full"><label class="ep-form-label">Approval threshold / risk setting</label><select class="ep-form-select" id="ai-appr-risk-threshold" style="max-width:240px">'+aiOptsHTML(['Low','Medium','High'],d.riskThreshold||j.risk)+'</select></div>'
    +'</div></div>';
}
function aiWizardValidationHTML(){
  const saved=aiAutomateFormData.validation;
  return '<div class="ep-form-card">'
    +aiValidationChecklist.map(function(v,i){
      const checked=saved?!!saved[i]:true;
      return '<div class="cs-toggle-row"><span class="cs-toggle-label">'+v+'</span><label class="cs-toggle"><input type="checkbox" id="ai-val-'+i+'"'+(checked?' checked':'')+'><span class="cs-toggle-slider"></span></label></div>';
    }).join('')
    +'</div>';
}
function aiWizardReviewHTML(j,events){
  const d=aiAutomateFormData;
  const scope=d.scope||events.map(function(e){return aiScopeDefaults(e);});
  const aiCount=scope.filter(function(s){return s.mode==='ai';}).length;
  const humanCount=scope.filter(function(s){return s.mode==='manual';}).length;
  const approvals=d.approvals||{};
  const validation=d.validation||aiValidationChecklist.map(function(){return true;});
  const validationOnCount=validation.filter(Boolean).length;
  const summaryRows=aiDrawerRow('Automation Name',d.name||(j.name+' Automation'))
    +aiDrawerRow('Journey',j.name)
    +aiDrawerRow('Entity',d.entity||aiEntityOptions[0])
    +aiDrawerRow('Country',d.country||aiCountryOptions[0])
    +aiDrawerRow('Employment Type',d.empType||aiEmploymentTypeOptions[0])
    +aiDrawerRow('Trigger',d.trigger||aiTriggerOptions[0].title)
    +aiDrawerRow('Automation Scope',aiCount+' of '+events.length+' events AI automated, '+humanCount+' need human approval')
    +aiDrawerRow('Approvals',(approvals.contractData||'—')+' &middot; '+(approvals.sendContract||'—')+' &middot; '+(approvals.docExceptions||'—')+' &middot; '+(approvals.readyPayroll||'—'))
    +aiDrawerRow('Data Validation',validationOnCount+' of '+aiValidationChecklist.length+' checks enabled')
    +aiDrawerRow('Connected Modules',j.modules.join(', '));
  return '<div class="ep-form-card"><div class="review-grid" style="grid-template-columns:1fr">'+summaryRows+'</div></div>';
}

function buildAutomateJourneyFormHTML(){
  const j=aiJourneys.find(x=>x.id===selectedAIJourneyId)||aiJourneys[0];
  const events=aiJourneyEvents[j.id]||[];
  const step=aiAutomateStep;
  const stepFns=[
    function(){return aiWizardSelectJourneyHTML();},
    function(){return aiWizardBasicDetailsHTML(j);},
    function(){return aiWizardTriggerHTML();},
    function(){return aiWizardScopeHTML(events);},
    function(){return aiWizardApprovalsHTML(j);},
    function(){return aiWizardValidationHTML();},
    function(){return aiWizardReviewHTML(j,events);}
  ];
  const visible=aiAutomateVisibleSteps();
  const posInVisible=visible.indexOf(step);
  const isFirst=posInVisible===0;
  const isLast=posInVisible===visible.length-1;
  const footer='<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:22px 2px 4px;border-top:1px solid var(--border);margin-top:22px">'
    +'<button class="btn btn-secondary" onclick="'+(isFirst?'cancelAIAutomation()':'aiAutomateBack()')+'">'+(isFirst?'Cancel':'Back')+'</button>'
    +'<div style="display:flex;gap:10px">'
    +(isLast
      ?'<button class="btn btn-secondary" onclick="saveAIAutomation(\'draft\')">Save as Draft</button><button class="btn btn-success" onclick="saveAIAutomation(\'active\')">Activate Automation</button>'
      :'<button class="btn btn-primary" onclick="aiAutomateNext()">Next</button>')
    +'</div></div>';

  return '<div class="ai-exec-page">'
    +'<button class="ep-cancel-btn" style="margin-bottom:14px" onclick="cancelAIAutomation()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="15 18 9 12 15 6"/></svg> '+(aiAutomateSkipPicker?'Back to '+j.name:'All Journeys')+'</button>'
    +'<p style="font-size:17px;font-weight:700;margin-bottom:6px">Create Your Journey</p>'
    +'<p style="font-size:12.5px;color:var(--gray);line-height:1.6;margin-bottom:26px">Configure AI automation for <strong style="color:var(--navy)">'+j.name+'</strong> in a few guided steps.</p>'
    +aiWizardStepperHTML(step)
    +aiStepHeaderHTML(step)
    +'<div class="ai-wizard-step-body">'+stepFns[step]()+'</div>'
    +footer
    +'</div>';
}

function aiAutomateCaptureStep(){
  const gv=function(id){const el=document.getElementById(id);return el?el.value:undefined;};
  const gc=function(id){const el=document.getElementById(id);return el?el.checked:undefined;};
  const j=aiJourneys.find(x=>x.id===selectedAIJourneyId)||aiJourneys[0];
  const events=aiJourneyEvents[j.id]||[];
  if(aiAutomateStep===0){
    const sel=document.querySelector('#ai-journey-pick-grid .ai-journey-pick-card.selected');
    if(sel&&sel.getAttribute('data-journey-id'))selectedAIJourneyId=sel.getAttribute('data-journey-id');
  }else if(aiAutomateStep===1){
    aiAutomateFormData.name=gv('ai-auto-name');
    aiAutomateFormData.entity=gv('ai-auto-entity');
    aiAutomateFormData.country=gv('ai-auto-country');
    aiAutomateFormData.empType=gv('ai-auto-emp-type');
    aiAutomateFormData.effective=gv('ai-auto-effective');
    const seg=document.querySelector('#ai-auto-status-seg .seg-btn.active');
    aiAutomateFormData.statusActive=!!(seg&&seg.textContent==='Active');
  }else if(aiAutomateStep===2){
    const sel=document.querySelector('#ai-trigger-grid .choice-card.selected .choice-title');
    if(sel)aiAutomateFormData.trigger=sel.textContent;
  }else if(aiAutomateStep===3){
    aiAutomateFormData.scope=events.map(function(e,i){
      if(!aiEventIsToggleable(e))return {mode:'manual'};
      const seg=document.getElementById('ai-scope-mode-'+i);
      const activeBtn=seg?seg.querySelector('.seg-btn.active'):null;
      const mode=(activeBtn&&activeBtn.getAttribute('data-mode'))||'ai';
      return {mode:mode};
    });
  }else if(aiAutomateStep===4){
    aiAutomateFormData.approvals={
      contractData:gv('ai-appr-contract-data'),sendContract:gv('ai-appr-send-contract'),
      docExceptions:gv('ai-appr-doc-exceptions'),readyPayroll:gv('ai-appr-ready-payroll'),
      riskThreshold:gv('ai-appr-risk-threshold')
    };
  }else if(aiAutomateStep===5){
    aiAutomateFormData.validation=aiValidationChecklist.map(function(v,i){return !!gc('ai-val-'+i);});
  }
}
function aiAutomateNext(){
  const prevJourneyId=selectedAIJourneyId;
  aiAutomateCaptureStep();
  if(aiAutomateStep===0){
    const pickedId=selectedAIJourneyId||aiJourneys[0].id;
    selectedAIJourneyId=pickedId;
    if(pickedId!==prevJourneyId)aiAutomateResumeOrStart(pickedId);
    else aiAutomateStep=1;
    navigatePage('ai-automate-form');
    return;
  }
  const visible=aiAutomateVisibleSteps();
  const pos=visible.indexOf(aiAutomateStep);
  aiAutomateStep=visible[Math.min(visible.length-1,pos+1)];
  navigatePage('ai-automate-form');
}
function aiAutomateBack(){
  aiAutomateCaptureStep();
  const visible=aiAutomateVisibleSteps();
  const pos=visible.indexOf(aiAutomateStep);
  aiAutomateStep=visible[Math.max(0,pos-1)];
  navigatePage('ai-automate-form');
}
function aiAutomateGoStep(i){aiAutomateCaptureStep();aiAutomateStep=i;navigatePage('ai-automate-form');}

function saveAIAutomation(mode){
  aiAutomateCaptureStep();
  const j=aiJourneys.find(x=>x.id===selectedAIJourneyId);if(!j)return;
  const events=aiJourneyEvents[j.id]||[];
  const d=aiAutomateFormData;
  const scope=(d.scope||events.map(function(e){return aiScopeDefaults(e);})).map(function(s,i){
    return {name:events[i]?events[i].name:'',mode:s.mode};
  });
  aiAutomationConfigs[j.id]={
    name:d.name||(j.name+' Automation'),entity:d.entity||aiEntityOptions[0],country:d.country||aiCountryOptions[0],employmentType:d.empType||aiEmploymentTypeOptions[0],
    effectiveFrom:d.effective||'',trigger:d.trigger||aiTriggerOptions[0].title,scope:scope,status:mode==='active'?'Active':'Draft'
  };
  j.status=mode==='active'?'Active':'Draft';
  if(mode==='active'){delete aiAutomateProgress[j.id];}
  else{aiAutomateProgress[j.id]={step:aiAutomateStep,formData:Object.assign({},d)};}
  aiAutomateStep=0;aiAutomateFormData={};aiAutomateSkipPicker=false;
  aiShowLoader(mode==='active'?'Activating Automation…':'Saving Draft…',j.name,document.getElementById('adt-content'));
  setTimeout(function(){navigatePage('ai-executive');},1400);
}
function cancelAIAutomation(){
  aiAutomateSaveProgress();
  const dest=aiAutomateSkipPicker?'ai-journey-detail':'ai-executive';
  aiAutomateStep=0;aiAutomateFormData={};aiAutomateSkipPicker=false;
  navigatePage(dest);
}

function buildManualJourneyRunHTML(){
  const run=getManualRun(selectedManualRunId);
  if(!run)return '<div class="ai-exec-page"><div class="setup-card">No manual run selected.</div></div>';
  const j=aiJourneys.find(function(x){return x.id===run.journeyId;})||cfgJourneys.find(function(x){return x.id===run.journeyId;})||{};
  const steps=manualJourneySteps(run.journeyId);
  const cur=steps[run.currentStepIdx]||steps[0]||{};
  const saved=Math.max(0,(run.manualHours||0)-(run.agentEstimateHours||0)).toFixed(1);
  const timeline=steps.map(function(st,i){
    const done=run.status==='Completed'||i<run.currentStepIdx;
    const current=i===run.currentStepIdx&&run.status!=='Completed';
    const mode=isStepAgentEnabled(run.journeyId,i)?'Agent':'Manual';
    return '<div class="manual-step-row '+(done?'done':'')+(current?'current':'')+'">'
      +'<div class="manual-step-num">'+(done?'✓':i+1)+'</div>'
      +'<div class="manual-step-body"><div class="manual-step-title">'+st.name+'</div><div class="manual-step-sub">'+st.ownerRole+' · '+manualModuleLabel(st.modulePage)+' · SLA '+st.sla+'</div><div class="manual-step-action">'+st.manualAction+'</div></div>'
      +'<div class="manual-step-mode">'+mode+'</div>'
      +'</div>';
  }).join('');
  const openExceptions=(run.exceptions||[]).map(function(e,i){return {e:e,i:i};}).filter(function(x){return x.e.status==='Open';});
  const hasExceptions=openExceptions.length>0;
  const exceptions=openExceptions.map(function(x){
    const exOwner=portalRole!=='entity-user'||activePersonaId===manualStepOwnerPersonaId(x.e.ownerRole);
    const exAction=exOwner
      ?'<button class="btn btn-secondary btn-sm" onclick="openManualExceptionResolver(\''+run.runId+'\','+x.i+')">Resolve</button>'
      :'<div class="manual-waiting-note">Waiting on <strong>'+x.e.ownerRole+'</strong></div>';
    return '<div class="manual-exception-card"><div><div class="cell-primary">'+x.e.type+'</div><div class="cell-sub">'+x.e.ownerRole+'</div><p>'+x.e.suggestedResolution+'</p></div>'+exAction+'</div>';
  }).join('');
  const progress=run.status==='Completed'?100:Math.min(100,Math.round(((run.currentStepIdx||0)+1)/Math.max(steps.length,1)*100));
  const openExceptionCount=openExceptions.length;
  const stepsCompletedLabel=(run.status==='Completed'?steps.length:(run.currentStepIdx||0))+' of '+steps.length;
  const moduleLabel=manualModuleLabel(cur.modulePage);
  const isOwner=run.status==='Completed'||portalRole!=='entity-user'||activePersonaId===manualStepOwnerPersonaId(cur.ownerRole);
  const curCtTab=ctTabForManualStep(cur);
  const linkedDeEmp=cur.modulePage==='direct'?directEmpData.find(function(e){return e.onboardingRunId===run.runId;}):null;
  const linkedPrEmp=cur.modulePage==='payroll'?payrollEmpData.find(function(e){return e.readinessRunId===run.runId;}):null;
  const openHubAction=cur.modulePage==='compliance'?"openComplianceHubForRun('"+run.runId+"')"
    :(run.contractRecordId&&curCtTab&&contractsData.some(function(c){return c.id===run.contractRecordId;}))?"navigatePage('contracts');openCtSidebar("+run.contractRecordId+",'"+curCtTab+"',null,'"+run.runId+"')"
    :linkedDeEmp?"navigatePage('direct');openDeSidebar("+linkedDeEmp.id+")"
    :linkedPrEmp?"navigatePage('payroll');openPrSidebar("+linkedPrEmp.id+",'"+run.runId+"')"
    :"navigatePage('"+(cur.modulePage||'dashboard')+"')";
  const heroActions=(run.status!=='Completed'&&isOwner)?'<button class="btn btn-primary btn-sm" onclick="completeManualStep(\''+run.runId+'\')">Mark Step Complete</button>':'';
  const currentActions=run.status==='Completed'?''
    :isOwner
      ?'<button class="btn btn-secondary btn-sm btn-glow-green" onclick="'+openHubAction+'">Open '+moduleLabel+'</button><button class="btn btn-secondary btn-sm" onclick="raiseManualException(\''+run.runId+'\')">Raise Exception</button>'
      :'<div class="manual-waiting-note">Waiting on <strong>'+(cur.ownerRole||'the owning role')+'</strong></div><button class="btn btn-secondary btn-sm" onclick="jumpToStepOwner(\''+run.runId+'\')">Switch to '+(cur.ownerRole||'owner')+' &amp; Open</button>';
  return '<div class="ai-exec-page manual-run-page">'
    +'<button class="ep-back" onclick="backFromManualJourneyRun()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back</button>'
    +'<div class="manual-run-hero"><div><div class="manual-run-kicker"><span>'+run.runId+'</span><span>'+run.mode+'</span><span>'+run.status+'</span></div><div class="manual-run-title">'+(j.name||run.journeyId)+'</div><div class="manual-run-sub">'+run.subject+' · '+run.entity+' · Started '+run.startedAt+'</div></div><div class="manual-run-actions">'+heroActions+'</div></div>'
    +'<div class="manual-current-card"><div class="manual-current-head"><div><span class="manual-current-kicker">Current Step</span><div class="manual-current-title">'+cur.name+'</div></div><div class="manual-current-progress"><strong>'+progress+'%</strong><span>'+openExceptionCount+' open blocker'+(openExceptionCount===1?'':'s')+'</span></div></div>'
    +'<p class="manual-current-desc">'+cur.manualAction+'</p>'
    +'<div class="manual-current-foot"><div class="manual-current-meta"><span>'+(cur.ownerRole||'Entity Admin')+'</span><span class="dot">&middot;</span><span>'+moduleLabel+'</span><span class="dot">&middot;</span><span>SLA '+(cur.sla||'—')+'</span></div><div class="manual-current-actions">'+currentActions+'</div></div></div>'
    +'<div class="dash-two-col manual-run-grid'+(hasExceptions?'':' solo')+'"><div class="listing-card dash-panel manual-steps-panel"><div class="dash-panel-head"><div>Journey Steps</div><span>Manual / Agent mode per step</span></div><div class="manual-panel-body">'+timeline+'</div></div>'
    +(hasExceptions?'<div class="manual-run-side"><div class="listing-card dash-panel manual-exceptions-panel"><div class="dash-panel-head"><div>Exceptions</div><span>Exception-first queue</span></div><div class="manual-panel-body">'+exceptions+'</div></div></div>':'')+'</div>'
    +'</div>';
}
// -- Same "linked journey run is on this step" banner the Compliance tab already shows, generalized to any Contracts-sidebar tab that a manual step maps to (see manualStepTabMap), so acting on Basic Details / Commercial Terms / Workflow also advances the linked run. --
function manualStepBannerHTML(c,tabId){
  const linkedRun=manualLinkedRunForContract(c.id);if(!linkedRun)return '';
  if(ctJourneyContextRunId!==linkedRun.runId)return '';
  const linkedSteps=manualJourneySteps(linkedRun.journeyId);
  const curStep=linkedSteps[linkedRun.currentStepIdx];
  if(!curStep||ctTabForManualStep(curStep)!==tabId)return '';
  const j=aiJourneys.find(function(x){return x.id===linkedRun.journeyId;})||cfgJourneys.find(function(x){return x.id===linkedRun.journeyId;})||{};
  const contextLine='<div style="font-size:11.5px;color:var(--gray);margin-bottom:12px">'+(j.name||'Contract Creation Journey')+' &mdash; Step '+(linkedRun.currentStepIdx+1)+' of '+linkedSteps.length+': <strong style="color:var(--navy)">'+curStep.name+'</strong></div>';
  const isOwner=portalRole!=='entity-user'||activePersonaId===manualStepOwnerPersonaId(curStep.ownerRole);
  const action=isOwner
    ?'<div style="display:flex;justify-content:flex-end"><button class="btn btn-primary btn-sm" onclick="completeManualStep(\''+linkedRun.runId+'\')">Mark '+curStep.name+' Complete</button></div>'
    :'<div class="manual-waiting-note">Waiting on <strong>'+curStep.ownerRole+'</strong></div>';
  return '<div class="ep-form-card" style="margin-bottom:16px">'+contextLine+action+'</div>';
}
// -- Same journey-context banner as manualStepBannerHTML, for the Direct Employee sidebar's Onboarding-pending row (see ensureDirectEmpForOnboarding). --
function deOnboardingBannerHTML(emp){
  const run=manualLinkedRunForEmployee(emp.id);if(!run)return '';
  const steps=manualJourneySteps(run.journeyId);
  const curStep=steps[run.currentStepIdx];
  if(!curStep||curStep.name!=='Onboarding')return '';
  const j=aiJourneys.find(function(x){return x.id===run.journeyId;})||cfgJourneys.find(function(x){return x.id===run.journeyId;})||{};
  const contextLine='<div style="font-size:11.5px;color:var(--gray);margin-bottom:12px">'+(j.name||'Contract Creation Journey')+' &mdash; Step '+(run.currentStepIdx+1)+' of '+steps.length+': <strong style="color:var(--navy)">'+curStep.name+'</strong></div>';
  const isOwner=portalRole!=='entity-user'||activePersonaId===manualStepOwnerPersonaId(curStep.ownerRole);
  const action=isOwner
    ?'<div style="display:flex;justify-content:flex-end"><button class="btn btn-primary btn-sm" onclick="completeManualStep(\''+run.runId+'\')">Mark Onboarding Complete</button></div>'
    :'<div class="manual-waiting-note">Waiting on <strong>'+curStep.ownerRole+'</strong></div>';
  return '<div class="ep-form-card" style="margin-bottom:16px">'+contextLine+action+'</div>';
}
function buildJourneySimulationHTML(){
  const j=cfgJourneys.find(function(x){return x.id===selectedSimulationJourneyId;})||cfgJourneys[0];
  const steps=manualJourneySteps(j.id);
  const agentOn=isJourneyAgentEnabled(j.id);
  const approvalCount=steps.filter(function(st){return st.approvalRequired;}).length;
  const agentCapableCount=steps.filter(function(st){return st.agentCapable&&!st.approvalRequired;}).length;
  const agentEnabledCount=steps.filter(function(st,i){return isStepAgentEnabled(j.id,i);}).length;
  const blockers=steps.filter(function(st,i){return isStepAgentEnabled(j.id,i)&&i%4===1;});
  const secondStat=dashStat('Human Approvals',String(approvalCount),'Always manual');
  const thirdStat=agentOn
    ?dashStat('Agent Steps',agentEnabledCount+' of '+agentCapableCount,'Agent-capable steps enabled','green')
    :dashStat('Agent Steps','0 of '+agentCapableCount,'Agent is off','orange');
  const cycleTimeHTML='<div class="dry-run-cycle-card">'
    +'<div class="dry-run-cycle-head"><div><strong>Estimated journey cycle time</strong><span>Planning estimate after all steps are completed one after another.</span></div><span class="journey-mode-badge '+(agentOn?'agent':'manual')+'">'+(agentOn?'Agent mode preview':'Manual baseline')+'</span></div>'
    +'<div class="dry-run-cycle-grid"><div><span>Manual completion</span><strong>30-40 min</strong><p>Owners complete each step manually across modules.</p></div><div><span>With agent mode</span><strong>~10 min</strong><p>'+(agentOn?'Based on enabled agent-capable steps; approvals still stay human.':'Available after enabling agent-capable steps; approvals still stay human.')+'</p></div><div><span>Expected reduction</span><strong>~70%</strong><p>Useful as a business case, not a guaranteed SLA.</p></div></div>'
    +'</div>';
  const thirdFinding=agentOn
    ?'<div class="sim-finding"><span class="sim-finding-icon">3</span><div><div class="sim-finding-title">'+(blockers.length?'Agent blockers found':'Agent readiness clear')+'</div><div class="sim-finding-copy">'+(blockers.length?'Agent mode is blocked by missing integration/data checks on '+blockers.length+' step(s).':'Agent mode has no simulated blockers for this setup.')+'</div></div></div>'
    :'<div class="sim-finding"><span class="sim-finding-icon">3</span><div><div class="sim-finding-title">Agent preview is off</div><div class="sim-finding-copy">Turn on Enable Agent to compare automation time, required integrations, and blockers. Until then, this dry run reflects manual execution only.</div></div></div>';
  const rows=steps.map(function(st,i){
    return '<tr><td>'+(i+1)+'. '+st.name+'</td><td>'+st.ownerRole+'</td><td>'+manualModuleLabel(st.modulePage)+'</td><td>'+(st.approvalRequired?'Human approval':isStepAgentEnabled(j.id,i)?'Agent enabled':'Manual')+'</td><td>'+st.sla+'</td></tr>';
  }).join('');
  return '<div class="ai-exec-page">'
    +'<button class="ep-cancel-btn" style="margin-bottom:18px" onclick="backFromJourneySimulation()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="15 18 9 12 15 6"/></svg> Back</button>'
    +'<div class="manual-run-hero"><div><div class="manual-run-kicker">Journey Dry Run</div><div class="manual-run-title">'+j.name+'</div><div class="manual-run-sub">'+(agentOn?'Validate owners, approvals, blockers, and enabled agent steps before changing operations.':'Agent is currently off. This dry run validates the manual execution path only.')+'</div></div><div class="manual-run-actions"><button class="btn btn-secondary btn-sm" onclick="toggleJourneyAgent(\''+j.id+'\')">'+(agentOn?'Disable Agent':'Enable Agent')+'</button><button class="btn btn-primary btn-sm" onclick="selectedCfgJourneyId=\''+j.id+'\';navigatePage(\'cfg-journey-detail\')">Configure Steps</button></div></div>'
    +'<div class="stat-grid dash-stat-grid">'+dashStat('Execution Steps',String(steps.length),'Owners and modules mapped')+secondStat+thirdStat+dashStat(agentOn?'Config Blockers':'Manual Blockers',String(agentOn?blockers.length:0),agentOn?(blockers.length?'Missing integration/data checks':'Can run now'):'No agent checks applied',agentOn&&blockers.length?'red':'green')+'</div>'
    +cycleTimeHTML
    +'<div class="dash-two-col"><div class="listing-card dash-panel"><div class="dash-panel-head"><div>Execution Path</div><span>Owners, modules, and modes</span></div><table class="listing-table dash-table"><thead><tr><th>Step</th><th>Owner</th><th>Module</th><th>Mode</th><th>SLA</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
    +'<div class="listing-card dash-panel"><div class="dash-panel-head"><div>Dry Run Findings</div><span>'+(agentOn?'Agent-enabled preflight':'Manual preflight')+'</span></div>'
    +'<div class="sim-finding"><span class="sim-finding-icon">1</span><div><div class="sim-finding-title">Manual run available</div><div class="sim-finding-copy">All owners can execute the journey through existing module screens.</div></div></div>'
    +'<div class="sim-finding"><span class="sim-finding-icon">2</span><div><div class="sim-finding-title">Approvals remain human</div><div class="sim-finding-copy">Approval-required steps stay manual even when Enable Agent is on.</div></div></div>'
    +thirdFinding
    +'<div class="roi-card"><div class="roi-card-title">Recommended next action</div><div class="roi-card-copy">'+(agentOn?'Review blockers, then keep agent enabled only for repeatable data-heavy steps.':'Start manually, collect operational evidence, then enable agents for repeated checks and data-heavy steps.')+'</div></div></div></div>'
    +'</div>';
}

// -- AI Executive: live run flows for activated journeys (Create Employee / Run Payroll) --
function aiJourneyCTA(j){
  const mode=journeyModeLabel(j.id);
  // -- Contract Creation's first step *is* capturing the real deal/employee details, so it always opens the real contract form (whatever name gets typed in becomes the run's subject) rather than the generic placeholder-subject manual-run starter used by other journeys. --
  if(j.id==='contract-creation')return {label:'Create Contract',action:"addListingItem('contracts')"};
  if(mode==='Manual Mode'||mode==='Hybrid')return {label:(mode==='Hybrid'?'Start Hybrid Run':'Start Manual Run'),action:"startManualJourneyRun('"+j.id+"')"};
  if(aiRunFlows[j.id])return {label:aiRunFlows[j.id].entryLabel,action:"startAIJourneyRun('"+j.id+"')"};
  return null;
}
function startAIJourneyRun(journeyId){
  if(!activePersonaCanAccessJourney(journeyId)){
    navigatePage('ai-executive');
    showAiToast('Journey hidden for this role','Only journeys owned by '+portalRoleLabel(portalRole)+' are available here.');
    return;
  }
  aiRunFlowJourneyId=journeyId;aiRunFlowStep=-1;aiRunFlowData={};
  if(journeyId==='payroll-creation'){aiPayrollData={};aiPayrollAnimatedStage=-1;}
  if(journeyId==='h2r-lifecycle'){aiH2rData={};aiH2rAnimatedStage=-1;aiH2rOffboardStep=-1;}
  navigatePage('ai-journey-run');
}
function aiRunFlowExit(){
  aiRunFlowJourneyId=null;aiRunFlowStep=-1;aiRunFlowData={};
  navigatePage('ai-executive');
}
function aiRunFlowRestart(){
  aiRunFlowStep=-1;aiRunFlowData={};
  if(aiRunFlowJourneyId==='payroll-creation'){aiPayrollData={};aiPayrollAnimatedStage=-1;}
  if(aiRunFlowJourneyId==='h2r-lifecycle'){aiH2rData={};aiH2rAnimatedStage=-1;aiH2rOffboardStep=-1;}
  navigatePage('ai-journey-run');
}
function parseAIRunPrompt(text){
  const countries=['Netherlands','India','Germany','Spain','United Kingdom','France','Italy'];
  let country='',raw=text||'';
  countries.forEach(function(c){if(new RegExp('\\b'+c+'\\b','i').test(raw)){country=c;raw=raw.replace(new RegExp('\\b'+c+'\\b','i'),'');}});
  const asMatch=raw.match(/\bas\s+(.+)$/i);
  const role=asMatch?asMatch[1].trim():'';
  if(asMatch)raw=raw.slice(0,asMatch.index);
  const name=raw.replace(/\b(create|an|a|for|in|the|please|make|start|new|employee|record|run|payroll|this|month|onboard)\b/gi,'').replace(/[,]/g,' ').replace(/\s+/g,' ').trim();
  return {name:name,country:country,role:role};
}
function findExistingEmployeeByQuery(query){
  const q=String(query||'').toLowerCase().trim();if(!q)return null;
  const all=directEmpData.concat(globalEmpData);
  return all.find(function(e){return String(e.empId||'').toLowerCase()===q;})
    || findExistingEmployee(q);
}
function aiRunFlowSimulate(){
  const inp=document.getElementById('ai-run-prompt');if(!inp)return;
  const flow=aiRunFlows[aiRunFlowJourneyId];if(!flow)return;
  inp.value=(flow.promptPlaceholder||'').replace(/^e\.g\.\s*/i,'');
  aiRunFlowSubmit();
}
function aiRunFlowSubmit(){
  const inp=document.getElementById('ai-run-prompt');if(!inp)return;
  if(aiRunFlowJourneyId==='payroll-creation'){aiPayrollRunSearch(inp.value);return;}
  if(aiRunFlowJourneyId==='h2r-lifecycle'){aiH2rRunCreate(inp.value);return;}
  const parsed=parseAIRunPrompt(inp.value);
  const emp=findExistingEmployee(parsed.name);
  aiRunFlowData={
    name:parsed.name||(emp&&emp.name)||'New Employee',
    country:parsed.country||(emp&&emp.country)||'India',
    role:parsed.role||(emp&&emp.jobTitle)||'',
    employee:emp,
    amount:38000+Math.floor(Math.random()*22000)
  };
  aiRunFlowStep=0;
  navigatePage('ai-journey-run');
  aiRunFlowRunCurrentStep();
}
function aiRunFlowRunCurrentStep(){
  const flow=aiRunFlows[aiRunFlowJourneyId];if(!flow)return;
  const step=flow.steps[aiRunFlowStep];if(!step)return;
  if(aiRunFlowJourneyId==='payroll-creation'&&step.type==='slip')return;
  if(step.type==='ai'||step.type==='auto-skip'){
    setTimeout(function(){
      aiRunFlowStep++;
      navigatePage('ai-journey-run');
      aiRunFlowRunCurrentStep();
    },step.type==='auto-skip'?1400:2200);
  }
}
function aiRunFlowApprove(){
  aiRunFlowStep++;
  if(aiRunFlowJourneyId==='h2r-lifecycle'&&aiRunFlowStep===4){
    if(aiH2rData.runId)aiUpsertRun('h2r-lifecycle',aiH2rData.runId,{currentStepIdx:4,status:'In Progress',lastActivity:'Just now'});
    aiH2rOffboardStep=0;
    navigatePage('ai-journey-run');
    aiH2rRunOffboardStep();
    return;
  }
  if(aiRunFlowJourneyId==='payroll-creation'&&aiPayrollData.runId){
    aiUpsertRun('payroll-creation',aiPayrollData.runId,{currentStepIdx:4,status:'In Progress',lastActivity:'Just now'});
  }
  navigatePage('ai-journey-run');
  aiRunFlowRunCurrentStep();
}
function aiPayrollCreateSlip(){
  aiShowLoader('Creating Salary Slip&hellip;','Saving payroll document for '+(aiPayrollData.name||'employee'));
  setTimeout(function(){
    aiRunFlowStep=5;
    if(aiPayrollData.runId)aiUpsertRun('payroll-creation',aiPayrollData.runId,{currentStepIdx:5,status:'Completed',lastActivity:'Just now'});
    navigatePage('ai-journey-run');
  },1900);
}
function aiRunFlowFinish(){
  aiRunFlowStep++;
  navigatePage('ai-journey-run');
}
function buildAIJourneyRunHTML(){
  const flow=aiRunFlows[aiRunFlowJourneyId];
  const j=aiJourneys.find(x=>x.id===aiRunFlowJourneyId)||aiJourneys[0];
  if(!activePersonaCanAccessJourney(j.id))return '<div class="ai-exec-page"><div class="setup-card"><div class="setup-title">Journey hidden for this role</div><div class="setup-sub">This Entity User role only sees journeys where it owns workflow steps.</div><button class="btn btn-primary btn-sm" onclick="navigatePage(\'ai-executive\')">Back to AI Executive</button></div></div>';
  if(!flow)return '<div class="ai-exec-page">Unknown automation.</div>';
  if(aiRunFlowJourneyId==='payroll-creation')return buildAIPayrollJourneyHTML(flow,j);
  if(aiRunFlowJourneyId==='h2r-lifecycle')return buildAIH2rJourneyHTML(flow,j);
  if(aiRunFlowStep===-1)return buildAIRunPromptHTML(flow,j);
  const cur=aiRunFlowStep;
  const timeline=buildAIRunTimelineHTML(flow,cur);
  let trailing='';
  if(cur<flow.steps.length){
    if(flow.steps[cur].type==='payment')trailing=buildAIRunPaymentPanelHTML(j);
  }else{
    trailing=buildAIRunCompletionPanelHTML(flow,j);
  }
  return '<div class="ep-page" style="max-width:640px;margin:0 auto">'
    +'<button class="ep-back" onclick="aiRunFlowExit()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back to AI Executive</button>'
    +'<div style="font-size:16px;font-weight:700;color:var(--navy);margin:14px 0 2px">'+flow.entryLabel+'</div>'
    +'<div style="font-size:12px;color:var(--gray);margin-bottom:18px">For <strong style="color:var(--navy)">'+aiRunFlowData.name+'</strong>'+(aiRunFlowData.role?' &middot; '+aiRunFlowData.role:'')+(aiRunFlowData.country?' &middot; '+aiRunFlowData.country:'')+'</div>'
    +'<div class="ai-timeline">'+timeline+'</div>'
    +trailing
    +'</div>';
}
function buildAIPayrollJourneyHTML(flow,j){
  if(aiRunFlowStep===-1)return buildAIPayrollPromptHTML(flow,j);
  const stage=Math.max(0,Math.min(aiRunFlowStep,5));
  return '<div class="aicj-wrap">'
    +buildAIJourneyBarHTML('payroll-creation',stage,'payroll')
    +'<div id="aicj-inner">'+buildAIPayrollStageHTML(flow,j)+'</div>'
    +'</div>';
}
function buildAIPayrollPromptHTML(flow,j){
  return '<div class="aicj-wrap">'
    +buildAIJourneyBarHTML('payroll-creation',0,'payroll')
    +'<div id="aicj-inner"><div class="ep-page" style="max-width:1000px;margin:0 auto">'
    +'<button class="ep-back" onclick="aiRunFlowExit()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back to AI Executive</button>'
    +'<div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap;margin-top:20px">'
    +'<div class="ep-form-card" style="flex:1 1 400px;min-width:340px;text-align:center;padding:38px 36px">'
    +'<div class="we-icon">'+j.icon+'</div>'
    +'<div style="font-size:18px;font-weight:700;color:var(--navy);margin-bottom:6px">AI Payroll Assistant</div>'
    +'<div style="font-size:12.5px;color:var(--gray);line-height:1.6;margin:0 auto 22px;max-width:440px">The Payroll Creation journey is automated. Enter the employee name or ID, and I\'ll fetch the employee record before capturing attendance and calculating salary.</div>'
    +'<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:18px">'
    +'<button class="btn btn-secondary" onclick="aiPayrollSimulateExisting()">Simulate: Existing Employee</button>'
    +'<button class="btn btn-secondary" onclick="aiPayrollSimulateById()">Simulate: Employee ID</button>'
    +'</div>'
    +'<div class="input-row" style="margin:0 auto 10px;max-width:440px">'
    +'<input class="input-field" id="ai-run-prompt" placeholder="'+flow.promptPlaceholder+'" onkeydown="if(event.key===\'Enter\')aiRunFlowSubmit()">'
    +'<button class="icon-btn active" onclick="aiRunFlowSubmit()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>'
    +'</div>'
    +'</div><div id="ai-payroll-result" style="flex:1 1 400px;min-width:340px"></div>'
    +'</div>'
    +'</div></div></div>';
}
function aiPayrollSimulateExisting(){
  const inp=document.getElementById('ai-run-prompt');if(inp)inp.value='Run payroll for Anika Shah for June 2026';
  aiPayrollRunSearch(inp?inp.value:'Anika Shah');
}
function aiPayrollSimulateById(){
  const inp=document.getElementById('ai-run-prompt');if(inp)inp.value='Run payroll for EMP001';
  aiPayrollRunSearch(inp?inp.value:'EMP001');
}
function aiPayrollRunSearch(text){
  const parsed=parseAIRunPrompt(text);
  const query=parsed.name||text;
  const res=document.getElementById('ai-payroll-result');if(!res)return;
  res.innerHTML='<div class="ep-form-card" style="display:flex;align-items:center;gap:12px"><div class="cl-spinner" style="width:22px;height:22px;border-width:2.5px"></div><span style="font-size:13px;color:var(--navy);font-weight:500">Searching ADT employee records for &ldquo;'+query+'&rdquo;&hellip;</span></div>';
  setTimeout(function(){
    const emp=findExistingEmployeeByQuery(query);
    if(emp)aiPayrollRenderMatchCard(emp,parsed);
    else res.innerHTML='<div class="ep-form-card"><div style="font-size:11.5px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px">No employee found</div><div style="font-size:12px;color:var(--gray)">Please enter a valid employee name or ID to run payroll.</div></div>';
  },1700);
}
function aiPayrollMockBase(emp){
  const s=parseInt(String(aiCtMockSalary(emp)).replace(/,/g,''),10)||52000;
  return Math.max(38000,s);
}
function aiPayrollBuildData(emp,parsed){
  const base=aiPayrollMockBase(emp);
  const daysPresent=22,leaveDays=2,overtimeHours=6,totalDays=24;
  const attendancePay=Math.round(base*(daysPresent/totalDays));
  const overtime=Math.round((base/176)*overtimeHours*1.25);
  const gross=attendancePay+overtime;
  const pf=Math.round(gross*0.12),pt=200,esi=Math.round(gross*0.0075),tax=Math.round(gross*0.05);
  const deductions=pf+pt+esi+tax;
  return {employee:emp,name:emp.name,empId:emp.empId,country:emp.country||parsed.country||'India',role:emp.jobTitle||parsed.role||'Employee',dept:emp.dept||'—',email:emp.email||'—',period:'June 2026',slipId:'PAY-'+Math.floor(10000+Math.random()*89999),base:base,daysPresent:daysPresent,leaveDays:leaveDays,overtimeHours:overtimeHours,totalDays:totalDays,gross:gross,pf:pf,pt:pt,esi:esi,tax:tax,deductions:deductions,net:gross-deductions,runId:'RUN-'+(liveRunSeq++)};
}
function aiPayrollRenderMatchCard(emp,parsed){
  const res=document.getElementById('ai-payroll-result');if(!res)return;
  const initials=emp.name.split(' ').map(function(n){return n[0];}).slice(0,2).join('');
  res.innerHTML='<div class="ep-form-card">'
    +'<div style="font-size:11.5px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:.4px;margin-bottom:12px">&#10003; Employee fetched from ADT</div>'
    +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">'
    +'<div class="user-avatar-sm" style="width:40px;height:40px;font-size:14px">'+initials+'</div>'
    +'<div><div style="font-size:14px;font-weight:700;color:var(--navy)">'+emp.name+'</div><div style="font-size:12px;color:var(--gray)">'+(emp.jobTitle||'—')+' &middot; '+(emp.dept||'—')+'</div></div>'
    +'</div>'
    +'<div class="review-grid">'
    +'<div class="review-row"><div class="rr-label">Employee ID</div><div class="rr-val">'+(emp.empId||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Country</div><div class="rr-val">'+(emp.country||parsed.country||'India')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Email</div><div class="rr-val">'+(emp.email||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Status</div><div class="rr-val">'+(emp.status||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Pay Period</div><div class="rr-val">June 2026</div></div>'
    +'<div class="review-row"><div class="rr-label">Monthly Salary</div><div class="rr-val">&#8377; '+aiCtMockSalary(emp)+'</div></div>'
    +'</div>'
    +'<div style="display:flex;gap:10px;margin-top:18px">'
    +'<button class="btn btn-primary" onclick="aiPayrollUseEmployee(\''+emp.empId+'\')">Use this employee &amp; continue</button>'
    +'<button class="btn btn-secondary" onclick="document.getElementById(\'ai-payroll-result\').innerHTML=\'\'">Search again</button>'
    +'</div></div>';
}
function aiPayrollUseEmployee(empId){
  const emp=directEmpData.concat(globalEmpData).find(function(e){return String(e.empId)===String(empId);});if(!emp)return;
  const inp=document.getElementById('ai-run-prompt');
  const parsed=parseAIRunPrompt(inp?inp.value:emp.name);
  aiPayrollData=aiPayrollBuildData(emp,parsed);
  aiRunFlowData=Object.assign({},aiPayrollData,{amount:aiPayrollData.net});
  aiRunFlowStep=1;
  aiUpsertRun('payroll-creation',aiPayrollData.runId,{client:aiPayrollData.name,country:aiPayrollData.country,contractType:aiPayrollData.role,currentStepIdx:1,status:'In Progress',lastActivity:'Just now'});
  navigatePage('ai-journey-run');
  aiRunFlowRunCurrentStep();
}
// -- Payroll run: the first 3 steps (Employee Fetch / Attendance Capture / Salary Calculation) render the
// currently-running step's actual computed data (pulled from aiPayrollData) instead of a flat spinner line,
// matching the detail cards shown in the Hire to Retire and Contract Creation journeys. --
function buildAIPayrollStepDetailHTML(idx,d){
  if(idx===0){
    return '<div class="ai-timeline-card-desc" style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span class="cl-spinner" style="width:13px;height:13px;border-width:2px"></span>Fetching employee details&hellip;</div>'
      +'<div class="review-grid" style="grid-template-columns:1fr">'
      +aiDrawerRow('Employee ID',d.empId||'—')
      +aiDrawerRow('Department',d.dept||'—')
      +aiDrawerRow('Country',d.country||'—')
      +aiDrawerRow('Email',d.email||'—')
      +'</div>';
  }
  if(idx===1){
    return '<div class="ai-timeline-card-desc" style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span class="cl-spinner" style="width:13px;height:13px;border-width:2px"></span>Capturing attendance records&hellip;</div>'
      +'<div class="review-grid" style="grid-template-columns:1fr">'
      +aiDrawerRow('Total Payable Days',d.totalDays||0)
      +aiDrawerRow('Days Present',d.daysPresent||0)
      +aiDrawerRow('Leave Days',d.leaveDays||0)
      +aiDrawerRow('Overtime Hours',d.overtimeHours||0)
      +'</div>';
  }
  if(idx===2){
    return '<div class="ai-timeline-card-desc" style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span class="cl-spinner" style="width:13px;height:13px;border-width:2px"></span>Calculating gross and net salary&hellip;</div>'
      +'<div class="review-grid" style="grid-template-columns:1fr">'
      +aiDrawerRow('Gross Salary',aiMoney(d.gross))
      +aiDrawerRow('Provident Fund',aiMoney(d.pf))
      +aiDrawerRow('Professional Tax',aiMoney(d.pt))
      +aiDrawerRow('ESI',aiMoney(d.esi))
      +aiDrawerRow('Income Tax',aiMoney(d.tax))
      +aiDrawerRow('Net Pay',aiMoney(d.net))
      +'</div>';
  }
  return '<div class="ai-timeline-card-desc" style="display:flex;align-items:center;gap:8px"><span class="cl-spinner" style="width:13px;height:13px;border-width:2px"></span>'+(aiRunFlows['payroll-creation'].steps[idx]||{}).running+'</div>';
}
function buildAIPayrollTimelineHTML(flow,cur,d){
  return flow.steps.map(function(step,i){
    let dotClass,body;
    if(i<cur){
      dotClass='run-done';
      body='<div class="ai-timeline-card-desc">'+(step.skipNote||'Completed')+'</div>';
    }else if(i===cur){
      dotClass='run-current';
      body=buildAIPayrollStepDetailHTML(i,d);
    }else{
      dotClass='run-pending';
      body='<div class="ai-timeline-card-desc" style="color:#cbd5e1">Waiting&hellip;</div>';
    }
    return '<div class="ai-timeline-item">'
      +'<div class="ai-timeline-dot '+dotClass+'">'+(i<cur?'&#10003;':(i+1))+'</div>'
      +'<div class="ai-timeline-card" style="cursor:default">'
      +'<div class="ai-timeline-card-head"><span class="ai-timeline-card-title">'+step.label+'</span></div>'
      +body
      +'</div></div>';
  }).join('');
}
function buildAIPayrollStageHTML(flow,j){
  const d=aiPayrollData||{};
  if(aiRunFlowStep===3)return buildAIPayrollApprovalHTML();
  if(aiRunFlowStep===4)return buildAIPayrollSlipHTML();
  if(aiRunFlowStep>=5)return buildAIPayrollCompleteHTML();
  return '<div class="ep-page" style="max-width:640px;margin:0 auto">'
    +'<button class="ep-back" onclick="aiRunFlowExit()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back to AI Executive</button>'
    +'<div style="font-size:16px;font-weight:700;color:var(--navy);margin:14px 0 2px">Run Payroll</div>'
    +'<div style="font-size:12px;color:var(--gray);margin-bottom:18px">For <strong style="color:var(--navy)">'+(d.name||'Employee')+'</strong> &middot; '+(d.period||'June 2026')+'</div>'
    +'<div class="ai-timeline">'+buildAIPayrollTimelineHTML(flow,aiRunFlowStep,d)+'</div>'
    +'</div>';
}
function buildAIPayrollApprovalHTML(){
  const d=aiPayrollData||{};
  if(d.runId)aiUpsertRun('payroll-creation',d.runId,{client:d.name,country:d.country,contractType:d.role,currentStepIdx:3,status:'Waiting for Approval',lastActivity:'Just now'});
  return buildAIWaitingApprovalHTML({
    description:'We\'ve notified <strong style="color:var(--navy)">'+aiPayrollManager.name+'</strong> (Finance Approver) to review the calculated payroll for <strong>'+(d.name||'the employee')+'</strong>. Once approved, this journey will automatically continue to salary slip generation.',
    entityUserDescription:'The calculated payroll for <strong>'+(d.name||'the employee')+'</strong> is ready for your review. Approve it to continue to salary slip generation, or notify your <strong style="color:var(--navy)">Entity Admin</strong> if you\'d like a second opinion.',
    timelineItems:[
      {label:'Attendance Captured',dotClass:'ai',chips:[{cls:'ai-chip-ai',label:'AI Automated'}]},
      {label:'Salary Calculated',dotClass:'ai',chips:[{cls:'ai-chip-ai',label:'AI Automated'}]},
      {label:'Waiting for '+aiPayrollManager.name+'\'s Approval',dotClass:'human',chips:[{cls:'ai-chip-human',label:'Human Required'},{cls:'ai-chip-approval',label:'Approval Required'}]},
      {label:'Salary Slip Template (pending)',dotClass:'system',chips:[{cls:'ai-chip-system',label:'System Action'}],pending:true}
    ],
    onApprove:'aiRunFlowApprove()',
    approveLabel:'Simulate: '+aiPayrollManager.name+' Approves',
    backLabel:'Back to AI Executive',
    backAction:'aiRunFlowExit()',
    approvalPanelHTML:buildAIPayrollApprovalDataHTML(d),
    managerName:aiPayrollManager.name,
    noteContextLabel:'Payroll approval — '+(d.name||'Employee'),
    noteRefId:d.runId||d.slipId||''
  });
}
function aiMoney(v){return '&#8377; '+Math.round(v||0).toLocaleString('en-IN');}
function buildAIPayrollApprovalDataHTML(d){
  return '<div class="adt-doc-page" style="margin:0;max-width:none">'
    +'<div class="adt-doc-header">'
    +'<div><div class="adt-doc-brand">ADT</div><div class="adt-doc-brand-sub">Payroll Services</div></div>'
    +'<div><div class="adt-doc-title">PAYROLL SUMMARY</div><div class="adt-doc-meta">Pay Period '+(d.period||'—')+'</div></div>'
    +'</div>'
    +'<div class="adt-doc-section"><div class="adt-doc-section-title">Employee Details</div><div class="review-grid">'
    +'<div class="review-row"><div class="rr-label">Employee</div><div class="rr-val">'+(d.name||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Employee ID</div><div class="rr-val">'+(d.empId||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Department</div><div class="rr-val">'+(d.dept||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Job Title</div><div class="rr-val">'+(d.role||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Country</div><div class="rr-val">'+(d.country||'—')+'</div></div>'
    +'</div></div>'
    +'<div class="adt-doc-section"><div class="adt-doc-section-title">Attendance Capture</div><div class="review-grid">'
    +'<div class="review-row"><div class="rr-label">Total Payable Days</div><div class="rr-val">'+(d.totalDays||0)+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Days Present</div><div class="rr-val">'+(d.daysPresent||0)+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Leave Days</div><div class="rr-val">'+(d.leaveDays||0)+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Overtime Hours</div><div class="rr-val">'+(d.overtimeHours||0)+'</div></div>'
    +'</div></div>'
    +'<div class="adt-doc-section"><div class="adt-doc-section-title">Salary Breakdown</div><div class="review-grid">'
    +'<div class="review-row"><div class="rr-label">Gross Salary</div><div class="rr-val">'+aiMoney(d.gross)+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Provident Fund</div><div class="rr-val">'+aiMoney(d.pf)+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Professional Tax</div><div class="rr-val">'+aiMoney(d.pt)+'</div></div>'
    +'<div class="review-row"><div class="rr-label">ESI</div><div class="rr-val">'+aiMoney(d.esi)+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Income Tax</div><div class="rr-val">'+aiMoney(d.tax)+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Total Deductions</div><div class="rr-val">'+aiMoney(d.deductions)+'</div></div>'
    +'</div>'
    +'<div class="review-row" style="margin-top:8px;padding-top:12px;border-top:2px solid var(--navy)"><div class="rr-label" style="font-weight:800;color:var(--navy)">Net Pay</div><div class="rr-val" style="font-size:16px;font-weight:800;color:var(--orange)">'+aiMoney(d.net)+'</div></div>'
    +'</div>'
    +'</div>';
}
function buildAIH2rApprovalDataHTML(d){
  const c=d.compliance||{};
  const policies=(d.policies||[]).map(function(p){
    return '<div class="review-row"><div class="rr-label">'+(p.type||'—')+'</div><div class="rr-val">'+(p.yearly||0)+' days/yr &middot; Carry Forward '+(p.carryForward||0)+'</div></div>';
  }).join('')||'<div class="ea-req-empty">No active leave policies matched.</div>';
  return '<div class="adt-doc-page" style="margin:0;max-width:none">'
    +'<div class="adt-doc-header">'
    +'<div><div class="adt-doc-brand">ADT</div><div class="adt-doc-brand-sub">Compliance Hub</div></div>'
    +'<div><div class="adt-doc-title">EMPLOYEE COMPLIANCE RECORD</div><div class="adt-doc-meta">Employee ID '+(d.empId||'—')+'</div></div>'
    +'</div>'
    +'<div class="adt-doc-section"><div class="adt-doc-section-title">Employee Details</div><div class="review-grid">'
    +'<div class="review-row"><div class="rr-label">Employee</div><div class="rr-val">'+(d.name||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Country</div><div class="rr-val">'+(d.country||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Role</div><div class="rr-val">'+(d.role||'—')+'</div></div>'
    +'</div></div>'
    +'<div class="adt-doc-section"><div class="adt-doc-section-title">Country Compliance</div><div class="review-grid" style="grid-template-columns:1fr">'
    +'<div class="review-row"><div class="rr-label">Rate Rules</div><div class="rr-val" style="white-space:normal">'+(c.rateRules||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Statutory Requirements</div><div class="rr-val" style="white-space:normal">'+(c.statutory||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Tax Band</div><div class="rr-val" style="white-space:normal">'+(c.taxBand||'—')+'</div></div>'
    +'</div></div>'
    +'<div class="adt-doc-section"><div class="adt-doc-section-title">Leave Policy Match</div><div class="review-grid" style="grid-template-columns:1fr">'+policies+'</div></div>'
    +'</div>';
}
function buildContractCommercialReviewSectionsHTML(rec){
  rec=rec||{};
  const commercial=rec.commercial||{};
  const items=(rec.complianceItems||[]).map(function(it){
    return '<div class="ea-req-row"><div><div class="ea-req-label">'+(it.item||'—')+'</div><div class="ea-req-time">'+(it.note||'')+'</div></div><span class="status-pill '+statusClass(it.status||'Pending')+'">'+(it.status||'Pending')+'</span></div>';
  }).join('')||'<div class="ea-req-empty">No compliance items on file.</div>';
  return '<div class="review-section"><div class="review-title">Commercial Terms</div><div class="review-grid">'
    +aiDrawerRow('Monthly Gross Pay',rec.payAmount?rec.payAmount+' '+(rec.currency||''):'—')
    +aiDrawerRow('Pay Frequency',rec.payFrequency||'Monthly')
    +aiDrawerRow('ADT Platform Fee',(rec.currency||'')+' '+(commercial.adtFee||'—'))
    +aiDrawerRow('Social Contribution',commercial.socialPremPct?commercial.socialPremPct+'%':'—')
    +'</div></div>'
    +'<div class="review-section"><div class="review-title">Compliance Checklist</div><div class="ea-req-list">'+items+'</div></div>';
}
function buildAIProposalApprovalDataHTML(d,rec){
  rec=rec||{};
  return '<div>'
    +'<div style="margin-bottom:14px"><div style="font-size:14px;font-weight:700">Proposal '+(d.proposalId||'—')+'</div><div style="font-size:11.5px;color:var(--gray);margin-top:2px">Details AI filled in for this proposal — review before approving.</div></div>'
    +'<div class="review-section"><div class="review-title">Parties</div><div class="review-grid">'
    +aiDrawerRow('Employee',d.name||'—')
    +aiDrawerRow('Country',d.country||'—')
    +aiDrawerRow('Contract Type',d.type||'—')
    +aiDrawerRow('Job Title',d.jobTitle||'—')
    +'</div></div>'
    +'<div class="review-section"><div class="review-title">Eligibility &amp; Personal Details</div><div class="review-grid">'
    +aiDrawerRow('Nationality',rec.nationality||'—')
    +aiDrawerRow('Work Permit',rec.workPermit?'Yes':'No')
    +aiDrawerRow('Email',rec.email||'—')
    +aiDrawerRow('Contact',rec.contact||'—')
    +'</div></div>'
    +'<div class="review-section"><div class="review-title">Position &amp; Schedule</div><div class="review-grid">'
    +aiDrawerRow('Employment Duration',rec.empDuration||'—')
    +aiDrawerRow('Work Schedule',rec.workSchedule||'—')
    +'</div>'
    +'<div class="review-grid" style="grid-template-columns:1fr;margin-top:4px">'+aiDrawerRow('Job Description',rec.jobDesc||'—')+'</div>'
    +'</div>'
    +buildContractCommercialReviewSectionsHTML(rec)
    +'</div>';
}
function buildAIPayrollSlipHTML(){
  const d=aiPayrollData||{};const now=aiFormatNow();
  return '<div style="padding:8px 0 24px">'
    +'<div class="adt-doc-page">'
    +'<div class="adt-doc-header">'
    +'<div><div class="adt-doc-brand">ADT</div><div class="adt-doc-brand-sub">Payroll Services</div></div>'
    +'<div><div class="adt-doc-title">SALARY SLIP</div><div class="adt-doc-meta">Slip No. '+(d.slipId||'—')+'<br>Pay Period '+(d.period||'—')+'</div></div>'
    +'</div>'
    +'<div class="adt-doc-section"><div class="adt-doc-section-title">Employee Details</div><div class="review-grid">'
    +'<div class="review-row"><div class="rr-label">Employee</div><div class="rr-val">'+(d.name||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Employee ID</div><div class="rr-val">'+(d.empId||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Department</div><div class="rr-val">'+(d.dept||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Job Title</div><div class="rr-val">'+(d.role||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Country</div><div class="rr-val">'+(d.country||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Issue Date</div><div class="rr-val">'+now.date+'</div></div>'
    +'</div></div>'
    +'<div class="adt-doc-section"><div class="adt-doc-section-title">Attendance Capture</div><div class="review-grid">'
    +'<div class="review-row"><div class="rr-label">Total Payable Days</div><div class="rr-val">'+(d.totalDays||0)+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Days Present</div><div class="rr-val">'+(d.daysPresent||0)+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Leave Days</div><div class="rr-val">'+(d.leaveDays||0)+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Overtime Hours</div><div class="rr-val">'+(d.overtimeHours||0)+'</div></div>'
    +'</div></div>'
    +'<div class="adt-doc-section"><div class="adt-doc-section-title">Salary &amp; Compliance</div><div class="review-grid">'
    +'<div class="review-row"><div class="rr-label">Gross Salary</div><div class="rr-val">'+aiMoney(d.gross)+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Provident Fund</div><div class="rr-val">'+aiMoney(d.pf)+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Professional Tax</div><div class="rr-val">'+aiMoney(d.pt)+'</div></div>'
    +'<div class="review-row"><div class="rr-label">ESI</div><div class="rr-val">'+aiMoney(d.esi)+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Income Tax</div><div class="rr-val">'+aiMoney(d.tax)+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Net Pay</div><div class="rr-val">'+aiMoney(d.net)+'</div></div>'
    +'</div></div>'
    +'<div class="adt-doc-section"><div class="adt-doc-section-title">Approval</div><p class="adt-doc-clause">Payroll calculation approved by '+aiPayrollManager.name+' and generated from attendance, payhead, and compliance inputs.</p></div>'
    +'</div>'
    +'<div style="text-align:center;margin-top:22px"><button class="btn btn-success" onclick="aiPayrollCreateSlip()">Create Salary Slip</button></div>'
    +'</div>';
}
function buildAIPayrollCompleteHTML(){
  const d=aiPayrollData||{};
  return '<div class="ep-page" style="max-width:640px;margin:20px auto 0">'
    +'<div class="success-card">'
    +'<div class="success-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>'
    +'<h2 style="font-size:20px;font-weight:700;margin-bottom:6px">Salary Slip Created</h2>'
    +'<p style="font-size:12.5px;color:var(--gray);margin-bottom:22px;max-width:420px;line-height:1.55">The salary slip for '+(d.name||'the employee')+' has been created and saved for '+(d.period||'the selected pay period')+'.</p>'
    +'<div style="text-align:left;width:100%;max-width:460px">'
    +'<div class="review-section"><div class="review-title">Employee Details</div><div class="review-grid" style="grid-template-columns:1fr">'+aiDrawerRow('Name',d.name||'—')+aiDrawerRow('Employee ID',d.empId||'—')+aiDrawerRow('Country',d.country||'—')+aiDrawerRow('Job Title',d.role||'—')+'</div></div>'
    +'<div class="review-section"><div class="review-title">Salary Slip Details</div><div class="review-grid" style="grid-template-columns:1fr">'+aiDrawerRow('Salary Slip ID',d.slipId||'—')+aiDrawerRow('Pay Period',d.period||'—')+aiDrawerRow('Net Pay',aiMoney(d.net))+aiDrawerRow('Status','Created')+'</div></div>'
    +'</div>'
    +'<div style="display:flex;gap:10px;margin-top:6px">'
    +'<button class="btn btn-secondary" onclick="navigatePage(\'payroll\')">View Payroll</button>'
    +'<button class="btn btn-primary" onclick="aiRunFlowRestart()">Run Another</button>'
    +'</div></div></div>';
}

// -- HIRE TO RETIRE (H2R) JOURNEY: full bespoke run through all 5 stages of aiJourneyEvents['h2r-lifecycle'] --
function buildAIH2rJourneyHTML(flow,j){
  if(aiRunFlowStep===-1)return buildAIH2rPromptHTML(flow,j);
  const stage=Math.max(0,Math.min(aiRunFlowStep,4));
  return '<div class="aicj-wrap">'
    +buildAIJourneyBarHTML('h2r-lifecycle',stage,'h2r')
    +'<div id="aicj-inner">'+buildAIH2rStageHTML(flow,j)+'</div>'
    +'</div>';
}
function buildAIH2rPromptHTML(flow,j){
  return '<div class="aicj-wrap">'
    +buildAIJourneyBarHTML('h2r-lifecycle',0,'h2r')
    +'<div id="aicj-inner"><div class="ep-page" style="max-width:640px;margin:0 auto">'
    +'<button class="ep-back" onclick="aiRunFlowExit()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back to AI Executive</button>'
    +'<div style="margin-top:20px;text-align:center">'
    +'<div class="ai-run-icon-wrap" style="margin-left:auto;margin-right:auto">'+j.icon+'</div>'
    +'<div style="font-size:18px;font-weight:700;color:var(--navy);margin-bottom:6px">AI Hire to Retire Assistant</div>'
    +'<div style="font-size:12.5px;color:var(--gray);line-height:1.6;margin:0 auto 20px;max-width:460px">'+flow.entryDesc+'</div>'
    +'<div style="margin-bottom:14px"><button class="btn btn-secondary" onclick="aiH2rSimulateNew()">Simulate: New Hire</button></div>'
    +'<div class="input-row" style="margin:0 auto;max-width:480px">'
    +'<input class="input-field" id="ai-run-prompt" placeholder="'+flow.promptPlaceholder+'" onkeydown="if(event.key===\'Enter\')aiRunFlowSubmit()">'
    +'<button class="icon-btn active" onclick="aiRunFlowSubmit()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>'
    +'</div>'
    +'<div id="ai-h2r-result" style="margin-top:16px;text-align:left"></div>'
    +'</div>'
    +'</div></div></div>';
}
function aiH2rSimulateNew(){
  const inp=document.getElementById('ai-run-prompt');
  if(inp)inp.value='Create an employee for Rahul Mehta in India as Product Manager';
  aiRunFlowSubmit();
}
function aiH2rBuildData(name,country,role){
  const compliance=aiH2rCountryData[country]||aiH2rCountryData['India'];
  const policies=leavePoliciesData.filter(function(p){return p.status==='Active';}).slice(0,4);
  return {name:name,country:country||'India',role:role||'Employee',empId:'EMP'+Math.floor(1000+Math.random()*8999),compliance:compliance,policies:policies,finalSettlement:Math.floor(20000+Math.random()*40000),runId:'RUN-'+(liveRunSeq++)};
}
function aiH2rRunCreate(text){
  const parsed=parseAIRunPrompt(text);
  const res=document.getElementById('ai-h2r-result');if(!res)return;
  res.innerHTML='<div class="ep-form-card" style="display:flex;align-items:center;gap:12px"><div class="cl-spinner" style="width:22px;height:22px;border-width:2.5px"></div><span style="font-size:13px;color:var(--navy);font-weight:500">Creating employee record for &ldquo;'+(parsed.name||text)+'&rdquo;&hellip;</span></div>';
  setTimeout(function(){
    aiH2rData=aiH2rBuildData(parsed.name||'New Employee',parsed.country,parsed.role);
    aiRunFlowData=Object.assign({},aiH2rData);
    aiRunFlowStep=0;
    aiUpsertRun('h2r-lifecycle',aiH2rData.runId,{client:aiH2rData.name,country:aiH2rData.country,contractType:aiH2rData.role,currentStepIdx:0,status:'In Progress',lastActivity:'Just now'});
    navigatePage('ai-journey-run');
    aiRunFlowRunCurrentStep();
  },1500);
}
function buildAIH2rStageHTML(flow,j){
  const d=aiH2rData||{};
  if(aiRunFlowStep===1)return buildAIH2rComplianceHTML();
  if(aiRunFlowStep===2)return buildAIH2rLeavePolicyHTML();
  if(aiRunFlowStep===3)return buildAIH2rApprovalHTML();
  if(aiRunFlowStep===4)return buildAIH2rOffboardingHTML();
  if(aiRunFlowStep>=5)return buildAIH2rCompleteHTML();
  return '<div class="ep-page" style="max-width:640px;margin:0 auto">'
    +'<button class="ep-back" onclick="aiRunFlowExit()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back to AI Executive</button>'
    +'<div style="font-size:16px;font-weight:700;color:var(--navy);margin:14px 0 2px">Hire to Retire</div>'
    +'<div style="font-size:12px;color:var(--gray);margin-bottom:18px">For <strong style="color:var(--navy)">'+(d.name||'Employee')+'</strong>'+(d.role?' &middot; '+d.role:'')+(d.country?' &middot; '+d.country:'')+'</div>'
    +'<div class="ai-timeline">'+buildAIRunTimelineHTML(flow,aiRunFlowStep)+'</div>'
    +'</div>';
}
function buildAIH2rComplianceHTML(){
  const d=aiH2rData||{};const c=d.compliance||{};
  return '<div class="ep-page" style="max-width:640px;margin:0 auto">'
    +'<button class="ep-back" onclick="aiRunFlowExit()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back to AI Executive</button>'
    +'<div style="font-size:16px;font-weight:700;color:var(--navy);margin:14px 0 2px">Hire to Retire</div>'
    +'<div style="font-size:12px;color:var(--gray);margin-bottom:18px">For <strong style="color:var(--navy)">'+(d.name||'Employee')+'</strong> &middot; '+(d.country||'')+'</div>'
    +'<div class="ep-form-card">'
    +'<div style="font-size:11.5px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:.4px;margin-bottom:12px;display:flex;align-items:center;gap:8px"><span class="cl-spinner" style="width:13px;height:13px;border-width:2px"></span>Fetching from Compliance Hub&hellip;</div>'
    +'<div class="review-grid" style="grid-template-columns:1fr">'
    +aiDrawerRow('Country Rate Rules',c.rateRules||'—')
    +aiDrawerRow('Statutory Requirements',c.statutory||'—')
    +aiDrawerRow('Tax Bands',c.taxBand||'—')
    +'</div></div>'
    +'</div>';
}
function buildAIH2rLeavePolicyHTML(){
  const d=aiH2rData||{};const policies=d.policies||[];
  const rows=policies.length?policies.map(function(p){
    return '<div class="ea-req-row"><div><div class="ea-req-label">'+p.type+'</div><div class="ea-req-time">'+p.yearly+' days/year'+(p.carryForward?' &middot; '+p.carryForward+' carry forward':'')+'</div></div><span class="status-pill active">Active</span></div>';
  }).join(''):'<div class="ea-req-empty">No active leave policy configured.</div>';
  return '<div class="ep-page" style="max-width:640px;margin:0 auto">'
    +'<button class="ep-back" onclick="aiRunFlowExit()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back to AI Executive</button>'
    +'<div style="font-size:16px;font-weight:700;color:var(--navy);margin:14px 0 2px">Hire to Retire</div>'
    +'<div style="font-size:12px;color:var(--gray);margin-bottom:18px">For <strong style="color:var(--navy)">'+(d.name||'Employee')+'</strong> &middot; '+(d.country||'')+'</div>'
    +'<div class="ep-form-card">'
    +'<div style="font-size:11.5px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:.4px;margin-bottom:12px;display:flex;align-items:center;gap:8px"><span class="cl-spinner" style="width:13px;height:13px;border-width:2px"></span>Matching applicable leave policy&hellip;</div>'
    +'<div class="ea-req-list">'+rows+'</div>'
    +'</div></div>';
}
function buildAIH2rApprovalHTML(){
  const d=aiH2rData||{};
  if(d.runId)aiUpsertRun('h2r-lifecycle',d.runId,{client:d.name,country:d.country,contractType:d.role,currentStepIdx:3,status:'Waiting for Approval',lastActivity:'Just now'});
  return buildAIWaitingApprovalHTML({
    description:'A policy deviation was detected while setting up <strong>'+(d.name||'the employee')+'</strong>. We\'ve notified <strong style="color:var(--navy)">'+aiHrManager.name+'</strong> (HR Manager) to review and approve before finalizing the setup.',
    entityUserDescription:'A policy deviation was detected while setting up <strong>'+(d.name||'the employee')+'</strong>. Review the compliance and leave policy details and approve to finalize the setup, or notify your <strong style="color:var(--navy)">Entity Admin</strong> if you\'d like a second opinion.',
    timelineItems:[
      {label:'Country Compliance Fetched',dotClass:'ai',chips:[{cls:'ai-chip-ai',label:'AI Automated'}]},
      {label:'Leave Policy Matched',dotClass:'ai',chips:[{cls:'ai-chip-ai',label:'AI Automated'}]},
      {label:'Waiting for '+aiHrManager.name+'\'s Approval',dotClass:'human',chips:[{cls:'ai-chip-human',label:'Human Required'},{cls:'ai-chip-approval',label:'Approval Required'}]},
      {label:'Offboarding Checklist (pending)',dotClass:'system',chips:[{cls:'ai-chip-system',label:'System Action'}],pending:true}
    ],
    onApprove:'aiRunFlowApprove()',
    approveLabel:'Simulate: '+aiHrManager.name+' Approves',
    backLabel:'Back to AI Executive',
    backAction:'aiRunFlowExit()',
    approvalPanelHTML:buildAIH2rApprovalDataHTML(d),
    managerName:aiHrManager.name,
    noteContextLabel:'H2R approval — '+(d.name||'Employee'),
    noteRefId:d.runId||''
  });
}
function aiH2rRunOffboardStep(){
  const step=aiH2rOffboardSteps[aiH2rOffboardStep];
  if(!step){
    aiRunFlowStep=5;
    if(aiH2rData.runId)aiUpsertRun('h2r-lifecycle',aiH2rData.runId,{currentStepIdx:4,status:'Completed',lastActivity:'Just now'});
    navigatePage('ai-journey-run');
    return;
  }
  setTimeout(function(){
    aiH2rOffboardStep++;
    navigatePage('ai-journey-run');
    aiH2rRunOffboardStep();
  },1500);
}
function buildAIH2rOffboardingHTML(){
  const d=aiH2rData||{};
  return '<div class="ep-page" style="max-width:640px;margin:0 auto">'
    +'<div style="font-size:16px;font-weight:700;color:var(--navy);margin:14px 0 2px">Hire to Retire</div>'
    +'<div style="font-size:12px;color:var(--gray);margin-bottom:18px">Running offboarding checklist for <strong style="color:var(--navy)">'+(d.name||'Employee')+'</strong></div>'
    +'<div class="ai-timeline">'+buildAIRunTimelineHTML({steps:aiH2rOffboardSteps},aiH2rOffboardStep)+'</div>'
    +'</div>';
}
function buildAIH2rCompleteHTML(){
  const d=aiH2rData||{};
  return '<div class="ep-page" style="max-width:640px;margin:20px auto 0">'
    +'<div class="success-card">'
    +'<div class="success-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>'
    +'<h2 style="font-size:20px;font-weight:700;margin-bottom:6px">Hire to Retire Journey Complete</h2>'
    +'<p style="font-size:12.5px;color:var(--gray);margin-bottom:22px;max-width:440px;line-height:1.55">'+(d.name||'The employee')+'\'s full lifecycle — hiring, compliance, leave policy, and offboarding — has been processed end-to-end.</p>'
    +'<div style="text-align:left;width:100%;max-width:460px">'
    +'<div class="review-section"><div class="review-title">Employee Details</div><div class="review-grid" style="grid-template-columns:1fr">'+aiDrawerRow('Name',d.name||'—')+aiDrawerRow('Employee ID',d.empId||'—')+aiDrawerRow('Country',d.country||'—')+aiDrawerRow('Job Title',d.role||'—')+'</div></div>'
    +'<div class="review-section"><div class="review-title">Offboarding Summary</div><div class="review-grid" style="grid-template-columns:1fr">'+aiDrawerRow('Access Revocation','Completed')+aiDrawerRow('Final Settlement',aiMoney(d.finalSettlement))+aiDrawerRow('Exit Compliance Checks','Completed')+'</div></div>'
    +'</div>'
    +'<div style="display:flex;gap:10px;margin-top:6px">'
    +'<button class="btn btn-secondary" onclick="navigatePage(\'direct\')">View Employees</button>'
    +'<button class="btn btn-primary" onclick="aiRunFlowRestart()">Run Another</button>'
    +'</div></div></div>';
}

function buildAIRunPromptHTML(flow,j){
  return '<div class="ep-page" style="max-width:560px;margin:30px auto 0">'
    +'<button class="ep-back" onclick="aiRunFlowExit()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back to AI Executive</button>'
    +'<div style="margin-top:22px">'
    +'<div class="ai-run-icon-wrap">'+j.icon+'</div>'
    +'<div style="font-size:18px;font-weight:700;color:var(--navy);margin-bottom:6px">'+flow.entryLabel+'</div>'
    +'<div style="font-size:12.5px;color:var(--gray);line-height:1.6;margin-bottom:18px">'+flow.entryDesc+'</div>'
    +'<div style="margin-bottom:14px"><button class="btn btn-secondary" onclick="aiRunFlowSimulate()">Simulate Journey</button></div>'
    +'<div class="input-row" style="margin:0;max-width:480px">'
    +'<input class="input-field" id="ai-run-prompt" placeholder="'+flow.promptPlaceholder+'" onkeydown="if(event.key===\'Enter\')aiRunFlowSubmit()">'
    +'<button class="icon-btn active" onclick="aiRunFlowSubmit()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>'
    +'</div>'
    +'</div></div>';
}
function buildAIRunTimelineHTML(flow,cur){
  return flow.steps.map(function(step,i){
    let dotClass,body;
    if(i<cur){
      dotClass='run-done';
      body='<div class="ai-timeline-card-desc">'+(step.skipNote||'Completed')+'</div>';
    }else if(i===cur){
      dotClass='run-current';
      if(step.type==='manual'){
        body='<div class="ai-timeline-card-desc">'+step.running+'</div><button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="aiRunFlowApprove()">Approve &amp; Continue</button>';
      }else if(step.type==='payment'){
        body='<div class="ai-timeline-card-desc">'+step.running+'</div>';
      }else{
        body='<div class="ai-timeline-card-desc" style="display:flex;align-items:center;gap:8px"><span class="cl-spinner" style="width:13px;height:13px;border-width:2px"></span>'+step.running+'</div>';
      }
    }else{
      dotClass='run-pending';
      body='<div class="ai-timeline-card-desc" style="color:#cbd5e1">Waiting&hellip;</div>';
    }
    return '<div class="ai-timeline-item">'
      +'<div class="ai-timeline-dot '+dotClass+'">'+(i<cur?'&#10003;':(i+1))+'</div>'
      +'<div class="ai-timeline-card" style="cursor:default">'
      +'<div class="ai-timeline-card-head"><span class="ai-timeline-card-title">'+step.label+'</span></div>'
      +body
      +'</div></div>';
  }).join('');
}
function buildAIRunPaymentPanelHTML(j){
  const amt=aiRunFlowData.amount||42000;
  const masked='•••• •••• •••• '+(4000+Math.floor(Math.random()*999));
  return '<div class="ai-run-payment-panel">'
    +'<div class="ai-run-card">'
    +'<div class="ai-run-card-top"><span class="ai-run-card-bank">RBL BANK</span><div class="ai-run-card-chip"></div></div>'
    +'<div class="ai-run-card-number">'+masked+'</div>'
    +'<div class="ai-run-card-bottom"><div><div class="ai-run-card-label">Card Holder</div><div class="ai-run-card-name">'+aiRunFlowData.name.toUpperCase()+'</div></div><div class="ai-run-card-visa">VISA</div></div>'
    +'</div>'
    +'<div style="font-size:12px;color:var(--gray);margin-bottom:6px">Disbursing salary to</div>'
    +'<div style="font-size:24px;font-weight:800;color:var(--navy);margin-bottom:18px">&#8377;'+amt.toLocaleString('en-IN')+'</div>'
    +'<button class="btn btn-success" onclick="aiRunFlowFinish()">Confirm Payment</button>'
    +'</div>';
}
function buildAIRunCompletionPanelHTML(flow,j){
  const isPayment=aiRunFlowJourneyId==='payroll-creation';
  const title=isPayment?'Payment Successful':'Employee Onboarded';
  const sub=isPayment
    ?'&#8377;'+(aiRunFlowData.amount||0).toLocaleString('en-IN')+' has been paid to '+aiRunFlowData.name+'.'
    :aiRunFlowData.name+' has been created and set up for '+(aiRunFlowData.country||'their country')+'.';
  return '<div class="ep-form-card" style="text-align:center;padding:32px 24px;margin-top:20px">'
    +'<div class="success-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>'
    +'<div style="font-size:15px;font-weight:700;color:var(--navy);margin-bottom:6px">'+title+'</div>'
    +'<div style="font-size:12.5px;color:var(--gray);line-height:1.6;margin-bottom:20px">'+sub+'</div>'
    +'<div style="display:flex;justify-content:center;gap:10px">'
    +'<button class="btn btn-secondary" onclick="aiRunFlowExit()">Back to AI Executive</button>'
    +'<button class="btn btn-primary" onclick="aiRunFlowRestart()">'+(isPayment?'Run Another':'Create Another')+'</button>'
    +'</div></div>';
}

// -- AGENT MODE: chat-driven journey run — typed prompt ("create a contract for X for Y") plays out the
// Contract Creation journey (aiJourneyEvents['contract-creation']) live in the form-col, narrated in the chat. --
function parseAgentContractPrompt(text){
  const m=/create\s+(?:a\s+)?contract\s+for\s+([a-z][a-z .'-]*?)\s+(?:for|in)\s+([a-z][a-z .'-]+?)[.?!]*$/i.exec(String(text||'').trim());
  if(!m)return null;
  const name=m[1].trim().split(/\s+/).map(function(w){return w.charAt(0).toUpperCase()+w.slice(1).toLowerCase();}).join(' ');
  const countryAliases={usa:'United States',us:'United States','united states':'United States','united states of america':'United States',uk:'United Kingdom','united kingdom':'United Kingdom',uae:'UAE'};
  const rawCountry=m[2].trim();
  const country=countryAliases[rawCountry.toLowerCase()]||rawCountry.split(/\s+/).map(function(w){return w.charAt(0).toUpperCase()+w.slice(1).toLowerCase();}).join(' ');
  return {name:name,country:country};
}
const AGENT_RUN_SETUP_ACTIVITIES={
  init:['Spinning up the Contractor Agent workspace&hellip;','Loading journey definitions&hellip;'],
  lookup:['Querying the Employee Directory&hellip;','Cross-referencing Keka HRMS &amp; SAP S/4HANA&hellip;'],
  found:['Matching employee profile&hellip;','Verifying identity confidence score&hellip;'],
  doc:['Reading the uploaded file&hellip;','Extracting structured fields&hellip;'],
  fetch:['Calling the Compliance Hub API&hellip;','Mapping statutory requirements for the country&hellip;'],
  agent:['Scoring available agents against this journey&hellip;','Comparing Contractor Agent vs Payroll Agent&hellip;']
};
const AGENT_RUN_JOURNEY_ACTIVITIES={
  0:['Creating the deal record&hellip;','Generating an Employee ID&hellip;'],
  1:['Drafting commercial terms&hellip;','Running the compliance checklist&hellip;'],
  3:['Generating the contract document&hellip;','Pushing to Docuseal for signature&hellip;'],
  5:['Running the onboarding checklist&hellip;','Provisioning system access&hellip;'],
  6:['Validating bank &amp; tax details&hellip;','Mapping compensation to payroll structure&hellip;']
};
function agentRunBuildSetupSteps(name,attachment){
  const steps=[
    {key:'init',label:'Setting up the agent'},
    {key:'lookup',label:'Checking for '+name+' in your system'},
    {key:'found',label:'Found the employee in Keka'}
  ];
  if(attachment)steps.push({key:'doc',label:'Checking the document you shared'});
  steps.push({key:'fetch',label:'Fetching the details'});
  steps.push({key:'agent',label:'Checking for the right agent for this role'});
  return steps;
}
function agentRunStart(name,country,attachment){
  const journeySteps=aiJourneyEvents['contract-creation']||[];
  const setupSteps=agentRunBuildSetupSteps(name,attachment);
  agentRunData={
    name:name,country:country,attachment:attachment,
    empId:'EMP-'+(4000+Math.floor(Math.random()*5999)),
    contractId:'CTR-'+(100000+Math.floor(Math.random()*899999)),
    setupSteps:setupSteps,setupIdx:0,setupState:setupSteps.map(function(){return 'pending';}),
    journeySteps:journeySteps,journeyIdx:0,journeyState:journeySteps.map(function(){return 'pending';}),
    fieldGroups:[],approvals:{},phase:'setup',selectedAgentLabel:null,activity:null,createdContractRowId:null,
    lastFilled:null,setupExpanded:false
  };
  const chatCol=document.getElementById('agent-chat-col');if(chatCol)chatCol.style.flex='0 0 380px';
  const col=document.getElementById('form-col');if(col)col.style.display='flex';
  renderAgentRunPanel();
  setTimeout(agentRunSetupStep,500);
}
// -- Ticks through a short list of "what I'm doing right now" phrases before a step resolves, so progress reads
// as granular work rather than one flat spinner. Re-renders the panel on every tick. --
function agentRunTickActivities(d,activities,onDone){
  if(!activities||!activities.length){onDone();return;}
  let i=0;
  const tick=function(){
    if(agentRunData!==d)return;
    d.activity=activities[i];
    renderAgentRunPanel();
    i++;
    if(i<activities.length){setTimeout(tick,750);}
    else{setTimeout(function(){if(agentRunData!==d)return;d.activity=null;onDone();},750);}
  };
  tick();
}
// -- Reveals a step's captured fields one at a time (~400ms apart). Each tick names the field being written in
// the activity line and flashes it in the contract preview, so the document visibly fills in field by field. --
function agentRunRevealFields(d,title,fields,onDone){
  const keys=Object.keys(fields);
  const group={title:title,fields:{}};
  d.fieldGroups.push(group);
  let i=0;
  const tick=function(){
    if(agentRunData!==d)return;
    if(i>=keys.length){d.lastFilled=null;d.activity=null;renderAgentRunPanel();onDone();return;}
    const k=keys[i];
    group.fields[k]=fields[k];
    d.lastFilled=k;
    d.activity='Capturing <b>'+k+'</b>&hellip;';
    renderAgentRunPanel();
    i++;
    setTimeout(tick,420);
  };
  tick();
}
function agentRunToggleSetup(){
  const d=agentRunData;if(!d)return;
  d.setupExpanded=!d.setupExpanded;
  renderAgentRunPanel();
}
function agentRunSetupStep(){
  const d=agentRunData;if(!d)return;
  if(d.setupIdx>=d.setupSteps.length){d.phase='journey';d.activity=null;renderAgentRunPanel();setTimeout(agentRunJourneyStep,500);return;}
  const step=d.setupSteps[d.setupIdx];
  d.setupState[d.setupIdx]='active';
  renderAgentRunPanel();
  showTyping('agent-chat');
  agentRunTickActivities(d,AGENT_RUN_SETUP_ACTIVITIES[step.key],function(){
    hideTyping();
    d.setupState[d.setupIdx]='done';
    let meta='',chatText=step.label+'.';
    if(step.key==='init')meta='Contractor Agent workspace ready.';
    else if(step.key==='lookup')meta='Searched Employee Directory, Keka HRMS and SAP S/4HANA.';
    else if(step.key==='found'){meta=d.name+' &middot; ID '+d.empId+' &middot; match confidence 98%';chatText='Found the employee in <b>Keka</b> &mdash; '+d.name+' (ID '+d.empId+').';}
    else if(step.key==='doc')meta='&ldquo;'+(d.attachment?d.attachment.name:'document')+'&rdquo; parsed &middot; 4 fields extracted.';
    else if(step.key==='fetch')meta='Compliance requirements for '+d.country+' retrieved from Compliance Hub.';
    else if(step.key==='agent'){d.selectedAgentLabel='Contractor Agent';meta='agent-eval';chatText='Checked available agents and picked the <b>Contractor Agent</b> for this job.';}
    step.meta=meta;
    agentMsgs.push({role:'bot',text:chatText});
    renderChat('agent-chat',agentMsgs);
    renderAgentRunPanel();
    d.setupIdx++;
    setTimeout(agentRunSetupStep,500);
  });
}
function agentRunMockFields(d,idx){
  const email=d.name.toLowerCase().replace(/[^a-z ]/g,'').trim().replace(/\s+/g,'.')+'@dhihyperlocal-mock.com';
  const table={
    0:{'Employee Name':d.name,'Employee ID':d.empId,'Country':d.country,'Client':'Dhi Hyperlocal','Contract Type':d.country==='India'?'PEO':'EOR'},
    1:{'Billing Rate':'$9,500 / mo','Pay Rate':'$7,600 / mo','Margin %':'20%','Compliance Checklist':'6 / 6 verified'},
    3:{'Contract Number':d.contractId,'Signatory Email':email,'Docuseal Status':'Sent &mdash; awaiting signature'},
    5:{'Onboarding Checklist':'5 / 5 complete','Document Status':'Verified','Compliance Status':'Cleared'},
    6:{'Bank Details':'On file (&bull;&bull;&bull;&bull;4821)','Compensation Mapping':'Mapped to '+d.country+' payroll structure','Tax Info':'Complete'}
  };
  return table[idx]||{};
}
function agentRunNarration(ev){
  const map={
    'Deal Created (Employee Created)':'Deal and employee record created.',
    'Proposal Sent':'Commercial proposal drafted and compliance checklist completed.',
    'Contract Sent':'Contract generated and sent for signature via Docuseal.',
    'Onboarding':'Onboarding checklist completed &mdash; documents and access provisioned.',
    'Ready for Payroll':'All payroll-required fields validated. Ready for the next payroll cycle.'
  };
  return '<b>'+ev.name+'</b> &mdash; '+(map[ev.name]||'completed.');
}
function agentRunJourneyStep(){
  const d=agentRunData;if(!d)return;
  if(d.journeyIdx>=d.journeySteps.length){agentRunFinish();return;}
  const ev=d.journeySteps[d.journeyIdx];
  const isApproval=(ev.chips||[]).indexOf('Human Required')>=0;
  d.journeyState[d.journeyIdx]='active';
  renderAgentRunPanel();
  if(isApproval){
    agentMsgs.push({role:'bot',text:'&#9208; This step needs approval before I can continue &mdash; <b>'+ev.name+'</b>. Here\'s everything gathered so far.'});
    renderChat('agent-chat',agentMsgs);
    return;
  }
  showTyping('agent-chat');
  const idx=d.journeyIdx;
  agentRunTickActivities(d,AGENT_RUN_JOURNEY_ACTIVITIES[idx],function(){
    agentRunRevealFields(d,ev.name,agentRunMockFields(d,idx),function(){
      hideTyping();
      d.journeyState[idx]='done';
      agentMsgs.push({role:'bot',text:agentRunNarration(ev)});
      renderChat('agent-chat',agentMsgs);
      renderAgentRunPanel();
      d.journeyIdx++;
      setTimeout(agentRunJourneyStep,600);
    });
  });
}
function agentRunAssignApprover(selectEl){
  const d=agentRunData;if(!d||!selectEl||!selectEl.value)return;
  d.approvals[d.journeyIdx]={personaId:selectEl.value,status:'assigned'};
  renderAgentRunPanel();
}
function agentRunSimulateApproval(){
  const d=agentRunData;if(!d)return;
  const idx=d.journeyIdx;const appr=d.approvals[idx];if(!appr)return;
  const persona=enterprisePersonas.find(function(p){return p.id===appr.personaId;});
  const ev=d.journeySteps[idx];
  appr.status='approved';
  agentMsgs.push({role:'bot',text:'&#9989; <b>'+(persona?persona.name:'Approver')+'</b> approved &ldquo;'+ev.name+'&rdquo;. Continuing the journey&hellip;'});
  renderChat('agent-chat',agentMsgs);
  agentRunRevealFields(d,ev.name,{'Approver Name':persona?persona.name:'Approver','Approval Timestamp':'Just now'},function(){
    d.journeyState[idx]='done';
    d.journeyIdx++;
    renderAgentRunPanel();
    setTimeout(agentRunJourneyStep,600);
  });
}
function agentRunFlatFields(d){
  const out={};
  d.fieldGroups.forEach(function(g){Object.assign(out,g.fields);});
  return out;
}
function agentRunNowString(){
  const now=new Date();
  const pad=function(n){return n<10?'0'+n:''+n;};
  return now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate())+' '+pad(now.getHours())+':'+pad(now.getMinutes())+':'+pad(now.getSeconds());
}
function agentRunBuildContractRow(d){
  const f=agentRunFlatFields(d);
  const maxId=contractsData.reduce(function(m,c){return Math.max(m,c.id);},0);
  return {
    id:maxId+1,
    contractId:(f['Contract Number']||d.contractId).replace(/^CTR-/,''),
    empName:d.name,empDesig:'Contractor',
    country:d.country,type:f['Contract Type']||'EOR',
    date:agentRunNowString(),status:'Ready for Payroll',
    nationality:d.country,countryOfOp:d.country,workPermit:true,gender:'—',
    email:f['Signatory Email']||'',contact:'—',dob:'—',
    jobTitle:'Contractor',skill:'—',empDuration:'—',empType:f['Contract Type']||'EOR',
    workSchedule:'40',payAmount:(f['Pay Rate']||'').replace(/[^0-9.]/g,'')||'0',currency:'USD',
    jobDesc:'Created via Agent Mode',payFrequency:'Monthly',
    commercial:{adtFee:'0',annualGross:'0',baseGross:'0',holidayBonus:'0',month13:'0',monthlyGrossNet:'0',monthlyInvoice:'0',monthlySalary12:'0',monthlySalary1392:'0',netPay:'0',socialPremAmt:'0',socialPremPct:'0',totalMonthlyGross:'0'},
    complianceItems:[{item:'Contract Creation Journey',note:'Completed via Agent Mode',status:'Approved',doc:null}]
  };
}
function agentRunFinish(){
  const d=agentRunData;if(!d)return;
  d.phase='done';
  const row=agentRunBuildContractRow(d);
  contractsData.unshift(row);
  d.createdContractRowId=row.id;
  agentMsgs.push({role:'bot',text:'&#127881; Contract created successfully for <b>'+d.name+'</b> ('+d.country+'). Contract ID: <b>'+row.contractId+'</b>. It\'s now live at the top of your Contracts list.'});
  renderChat('agent-chat',agentMsgs);
  renderAgentRunPanel();
}
function agentRunGoToContracts(){
  closeAgent();
  navigatePage('contracts');
}
function agentRunAwaitingApproval(d){
  const idx=d.journeyIdx;
  return d.phase==='journey'&&d.journeySteps[idx]&&(d.journeySteps[idx].chips||[]).indexOf('Human Required')>=0&&d.journeyState[idx]!=='done';
}
function agentRunActivityHTML(d){
  return '<div class="agrun-activity"><span class="agrun-activity-dot"></span>'+(d.activity||'Working&hellip;')+'</div>';
}
function agentRunAgentEvalHTML(){
  return '<div class="agrun-agent-eval">'
    +'<div class="agrun-agent-eval-row selected">'
    +'<span class="user-avatar-sm" style="width:26px;height:26px;font-size:9px;flex-shrink:0">CA</span>'
    +'<div class="agrun-agent-eval-info"><div class="agrun-agent-eval-name">Contractor Agent</div><div class="agrun-agent-eval-desc">Contracts, onboarding &amp; compliance</div></div>'
    +'<span class="agrun-agent-eval-badge">&#10003; Best match</span>'
    +'</div>'
    +'<div class="agrun-agent-eval-row skipped">'
    +'<span class="user-avatar-sm" style="width:26px;height:26px;font-size:9px;flex-shrink:0;background:#eef1f5;color:#94a3b8">PA</span>'
    +'<div class="agrun-agent-eval-info"><div class="agrun-agent-eval-name">Payroll Agent</div><div class="agrun-agent-eval-desc">Salary, deductions &amp; payslips</div></div>'
    +'<span class="agrun-agent-eval-badge muted">Not needed here</span>'
    +'</div>'
    +'</div>';
}
function agentRunSetupRowHTML(d,step,state){
  const dotCls=state==='done'?'run-done':(state==='active'?'run-current':'run-pending');
  const dotContent=state==='done'?'&#10003;':(state==='active'?'<span class="cl-spinner" style="width:13px;height:13px;border-width:2px"></span>':'&middot;');
  let body;
  if(state==='done'){
    body=step.key==='agent'?agentRunAgentEvalHTML():('<div class="ai-timeline-card-desc">'+(step.meta||'Completed')+'</div>');
  }else if(state==='active'){
    body=agentRunActivityHTML(d);
  }else{
    body='<div class="ai-timeline-card-desc" style="color:#cbd5e1">Waiting&hellip;</div>';
  }
  return '<div class="ai-timeline-item"'+(state==='active'?' id="agrun-active"':'')+'>'
    +'<div class="ai-timeline-dot '+dotCls+'">'+dotContent+'</div>'
    +'<div class="ai-timeline-card" style="cursor:default">'
    +'<div class="ai-timeline-card-head"><span class="ai-timeline-card-title">'+step.label+'</span></div>'
    +body
    +'</div></div>';
}
// -- Collapsed one-line summary of the preparation phase once the journey itself is running, so the
// journey steps get the visual focus. Click to expand the full preparation trail. --
function agentRunSetupBlockHTML(d){
  const rows=d.setupSteps.map(function(s,i){return agentRunSetupRowHTML(d,s,d.setupState[i]);}).join('');
  if(d.phase==='setup')return rows;
  if(d.setupExpanded){
    return rows
      +'<button class="agrun-linkbtn" onclick="agentRunToggleSetup()">Hide preparation steps &#9650;</button>';
  }
  return '<div class="ai-timeline-item">'
    +'<div class="ai-timeline-dot run-done">&#10003;</div>'
    +'<div class="ai-timeline-card agrun-setup-summary" onclick="agentRunToggleSetup()">'
    +'<div class="ai-timeline-card-head"><span class="ai-timeline-card-title">Preparation complete</span><span class="agrun-linktext">Show '+d.setupSteps.length+' steps &#9660;</span></div>'
    +'<div class="ai-timeline-card-desc">'+d.name+' matched in Keka &middot; compliance for '+d.country+' fetched &middot; Contractor Agent selected</div>'
    +'</div></div>';
}
// -- Compact key-value chips of what a step has captured so far; rendered inside the step card as fields land. --
function agentRunKvRowHTML(d,group){
  const keys=Object.keys(group.fields);
  if(!keys.length)return '';
  return '<div class="agrun-kv-row">'+keys.map(function(k){
    return '<div class="agrun-kv'+(d.lastFilled===k?' just-filled':'')+'"><span>'+k+'</span><b>'+group.fields[k]+'</b></div>';
  }).join('')+'</div>';
}
function agentRunApprovalWidgetHTML(d,ev,i){
  const appr=d.approvals[i];
  const candidates=enterprisePersonas.filter(function(p){return (p.function||'').indexOf('Approver')>=0;});
  if(appr){
    const persona=enterprisePersonas.find(function(p){return p.id===appr.personaId;});
    return '<div class="ai-timeline-card-desc">'+ev.desc+'</div>'
      +'<div class="agrun-approver-assigned">'
      +'<span class="user-avatar-sm" style="width:26px;height:26px;font-size:10px">'+(persona?persona.initials:'?')+'</span>'
      +'<div><div class="agrun-approver-name">'+(persona?persona.name:'Approver')+'</div><div class="agrun-approver-role">'+(persona?persona.label:'')+'</div></div>'
      +'</div>'
      +'<button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="agentRunSimulateApproval()">Simulate approval as '+(persona?persona.name.split(' ')[0]:'approver')+'</button>';
  }
  const options='<option value="">Select an approver&hellip;</option>'+candidates.map(function(p){return '<option value="'+p.id+'">'+p.name+' &middot; '+p.label+'</option>';}).join('');
  return '<div class="ai-timeline-card-desc">'+ev.desc+'</div>'
    +'<div class="agrun-noconfig">&#9888; No approver is configured for this step yet.</div>'
    +'<select class="form-input" id="agrun-approver-select-'+i+'" style="margin:8px 0">'+options+'</select>'
    +'<button class="btn btn-secondary btn-sm" onclick="agentRunAssignApprover(document.getElementById(\'agrun-approver-select-'+i+'\'))">Assign approver &amp; continue</button>';
}
function agentRunJourneyRowHTML(d,ev,i){
  const state=d.journeyState[i];
  const isApproval=(ev.chips||[]).indexOf('Human Required')>=0;
  const appr=d.approvals[i];
  const dotCls=state==='done'?'run-done':(state==='active'?'run-current':'run-pending');
  const dotContent=state==='done'?'&#10003;':(i+1);
  const group=d.fieldGroups.find(function(g){return g.title===ev.name;});
  const kv=group?agentRunKvRowHTML(d,group):'';
  let body;
  if(state==='done'){
    body=kv+'<div class="ai-timeline-chips" style="margin-top:'+(kv?'10':'0')+'px">'+aiChipsCompact(ev.chips)+aiAgentBadgeHTML(ev.source)+'</div>';
  }else if(state==='active'){
    // Approval widget until approved; once approved (fields still revealing), show the live capture instead.
    body=(isApproval&&!(appr&&appr.status==='approved'))
      ?agentRunApprovalWidgetHTML(d,ev,i)
      :(agentRunActivityHTML(d)+kv);
  }else{
    body='<div class="ai-timeline-card-desc" style="color:#cbd5e1">Waiting&hellip;</div>';
  }
  return '<div class="ai-timeline-item"'+(state==='active'?' id="agrun-active"':'')+'>'
    +'<div class="ai-timeline-dot '+dotCls+'">'+dotContent+'</div>'
    +'<div class="ai-timeline-card" style="cursor:default">'
    +'<div class="ai-timeline-card-head"><span class="ai-timeline-card-title">'+ev.name+'</span></div>'
    +body
    +'</div></div>';
}
// -- Contract document preview: a real-looking template that fills in live as journey steps complete. --
function agentRunDocFieldHTML(fields,label,key){
  const v=fields[key];
  const flash=agentRunData&&agentRunData.lastFilled===key?' just-filled':'';
  return '<div class="agrun-doc-field'+(v===undefined?' pending':flash)+'"><label>'+label+'</label><div>'+(v!==undefined?v:'&mdash;')+'</div></div>';
}
function buildAgentRunDocHTML(d){
  const f=agentRunFlatFields(d);
  const contractSentDone=d.journeyState[3]==='done';
  const contractApprovedDone=d.journeyState[4]==='done';
  const stamp=contractApprovedDone?{cls:'signed',label:'Signed'}:contractSentDone?{cls:'sent',label:'Sent for Signature'}:{cls:'draft',label:'Draft'};
  const empLine=contractApprovedDone?(d.name+' &middot; signed'):(contractSentDone?'Sent &mdash; awaiting signature':'Pending');
  return '<div class="agrun-doc">'
    +'<div class="agrun-doc-stamp '+stamp.cls+'">'+stamp.label+'</div>'
    +'<div class="agrun-doc-head"><div class="agrun-doc-brand"><img src="assets/Opendhilogo.png" alt="" onerror="this.style.display=\'none\'"><span>OpenDhi</span></div><div class="agrun-doc-num">'+(f['Contract Number']||d.contractId)+'</div></div>'
    +'<div class="agrun-doc-title">Employment Contract</div>'
    +'<div class="agrun-doc-sub">'+d.name+' &middot; '+d.country+'</div>'
    +'<div class="agrun-doc-divider"></div>'
    +'<div class="agrun-doc-grid">'
    +agentRunDocFieldHTML(f,'Employee','Employee Name')
    +agentRunDocFieldHTML(f,'Employee ID','Employee ID')
    +agentRunDocFieldHTML(f,'Country','Country')
    +agentRunDocFieldHTML(f,'Contract Type','Contract Type')
    +agentRunDocFieldHTML(f,'Client','Client')
    +agentRunDocFieldHTML(f,'Signatory Email','Signatory Email')
    +'</div>'
    +'<div class="agrun-doc-section"><div class="agrun-doc-section-title">Compensation</div><div class="agrun-doc-grid">'
    +agentRunDocFieldHTML(f,'Billing Rate','Billing Rate')
    +agentRunDocFieldHTML(f,'Pay Rate','Pay Rate')
    +'</div></div>'
    +'<div class="agrun-doc-section"><div class="agrun-doc-section-title">Signatures</div><div class="agrun-doc-sig-row">'
    +'<div class="agrun-doc-sig"><span>Employer</span><div class="agrun-doc-sig-line">Dhi Hyperlocal</div></div>'
    +'<div class="agrun-doc-sig"><span>Employee</span><div class="agrun-doc-sig-line">'+empLine+'</div></div>'
    +'</div></div>'
    +'</div>';
}
function agentRunProgressHTML(d){
  const total=d.setupSteps.length+d.journeySteps.length;
  const doneCount=d.setupState.filter(function(s){return s==='done';}).length+d.journeyState.filter(function(s){return s==='done';}).length;
  const pct=Math.round(doneCount/total*100);
  return '<div class="agrun-progress-track"><div class="agrun-progress-fill" style="width:'+pct+'%"></div></div>';
}
function agentRunStatsHTML(d){
  const ai=d.journeySteps.filter(function(e){return (e.chips||[]).indexOf('AI Automated')>=0;}).length;
  const human=d.journeySteps.length-ai;
  const fields=Object.keys(agentRunFlatFields(d)).length;
  return '<div class="agrun-stats">'
    +'<div class="agrun-stat"><b>'+ai+'</b><span>steps automated</span></div>'
    +'<div class="agrun-stat"><b>'+human+'</b><span>human approvals</span></div>'
    +'<div class="agrun-stat"><b>'+fields+'</b><span>fields captured</span></div>'
    +'</div>';
}
function buildAgentRunPanelHTML(){
  const d=agentRunData;if(!d)return '';
  const awaiting=agentRunAwaitingApproval(d);
  const statusLabel=d.phase==='done'?'Completed':(awaiting?'Awaiting Approval':'In Progress');
  const statusCls=d.phase==='done'?'approved':(awaiting?'unapproved':'pending');
  const setupBlock=agentRunSetupBlockHTML(d);
  const journeyRows=d.journeySteps.map(function(ev,i){return agentRunJourneyRowHTML(d,ev,i);}).join('');
  const journeyLabel='<div class="agrun-phase-label">Journey &middot; Contract Creation</div>';
  const cta=d.phase==='done'
    ?'<div class="agrun-success-banner">&#127881; Contract <b>'+(agentRunFlatFields(d)['Contract Number']||d.contractId)+'</b> created successfully for <b>'+d.name+'</b> ('+d.country+').'
      +'<button class="btn btn-primary btn-sm" style="margin-left:auto" onclick="agentRunGoToContracts()">View in Contracts <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" style="margin-left:4px;vertical-align:-2px"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>'
      +'</div>'
      +agentRunStatsHTML(d)
    :'';
  const fillingBadge=d.lastFilled?'<span class="agrun-live-badge"><span class="agrun-activity-dot"></span>Filling&hellip;</span>':'';
  return '<div class="agrun-wrap">'
    +'<div class="agrun-header">'
    +'<div><div class="agrun-title">Contract Creation Journey</div><div class="agrun-sub">'+d.name+' &middot; '+d.country+(d.selectedAgentLabel?' &middot; Running as <b>'+d.selectedAgentLabel+'</b>':'')+'</div></div>'
    +'<span class="status-pill '+statusCls+'">'+statusLabel+'</span>'
    +'</div>'
    +agentRunProgressHTML(d)
    +cta
    +'<div class="agrun-body">'
    +'<div class="agrun-timeline-col">'
    +'<div class="agrun-phase-label">Preparation</div>'
    +'<div class="ai-timeline" style="margin-bottom:18px">'+setupBlock+'</div>'
    +journeyLabel
    +'<div class="ai-timeline">'+journeyRows+'</div>'
    +'</div>'
    +'<div class="agrun-details-col">'
    +'<div class="review-title" style="margin-bottom:12px;display:flex;align-items:center;gap:10px">Contract Preview'+fillingBadge+'</div>'
    +buildAgentRunDocHTML(d)
    +'</div>'
    +'</div>'
    +'</div>';
}
function renderAgentRunPanel(){
  const col=document.getElementById('form-col');if(!col||!agentRunData)return;
  col.style.display='flex';
  col.innerHTML=buildAgentRunPanelHTML();
  // Keep the step the agent is working on in view as the timeline grows.
  const act=document.getElementById('agrun-active');
  if(act&&typeof act.scrollIntoView==='function')act.scrollIntoView({block:'nearest'});
}

// -- AI CONTRACT ASSISTANT (Contracts "+" flow, gated on the contract-creation journey being Active) --
// -- Contract Creation Journey: persistent animated step bar (bound to aiJourneyEvents['contract-creation']) --
function aiCtJourneyStage(){
  if(page==='ai-contract-assistant')return 0;
  if(page==='ai-employee-created')return 0;
  if((page==='contract-type-select'||page==='contract-eor'||page==='contract-peo')&&aiAssistedFlow)return 1;
  if(page==='ai-proposal-created')return 1;
  if(page==='ai-proposal-waiting-approval')return 2;
  if(page==='ai-contract-document')return 3;
  if(page==='ai-contract-awaiting-signature')return 4;
  if(page==='ai-onboarding-run')return 6;
  if(page==='ai-journey-complete')return 7;
  return -1;
}
function isAIContractWizardPage(pg){
  return pg==='ai-contract-assistant'||pg==='ai-employee-created'||pg==='contract-type-select'||pg==='contract-eor'||pg==='contract-peo'||pg==='ai-proposal-created'||pg==='ai-proposal-waiting-approval'||pg==='ai-contract-document'||pg==='ai-contract-awaiting-signature'||pg==='ai-onboarding-run'||pg==='ai-journey-complete';
}
function aiCjShortLabel(name){return (name||'').replace(/\s*\([^)]*\)/g,'').trim();}
function aiAgentBadgeHTML(sourceName){
  const agent=findCfgAgentByName(sourceName);
  if(!agent)return '';
  return '<span class="aicj-agent-badge" onclick="viewCfgAgentSkillByName(\''+agent.name.replace(/'/g,"\\'")+'\')">&#10024; Handled by '+agent.name+'</span>';
}
function aiCtCurrentAgentBadge(){
  const events=aiJourneyEvents['contract-creation']||[];
  const current=events[aiCtJourneyStage()];
  return aiAgentBadgeHTML(current&&current.source);
}
function buildAIJourneyBarHTML(journeyId,stage,animationKey){
  const events=aiJourneyEvents[journeyId]||[];
  const prev=animationKey==='payroll'?aiPayrollAnimatedStage:animationKey==='h2r'?aiH2rAnimatedStage:aiCtAnimatedStage;
  const animateThisRender=stage>prev;
  if(animationKey==='payroll'){if(animateThisRender)aiPayrollAnimatedStage=stage;}
  else if(animationKey==='h2r'){if(animateThisRender)aiH2rAnimatedStage=stage;}
  else if(animateThisRender){aiCtAnimatedStage=stage;}
  const current=events[stage];
  const label=current?(
    '<div class="aicj-label">'
    +'<span class="aicj-label-step">Step '+(stage+1)+' of '+events.length+'</span>'
    +'<span class="aicj-label-name">'+current.name+'</span>'
    +aiChipsCompact(current.chips)
    +aiAgentBadgeHTML(current.source)
    +'</div>'
  ):'';
  return label+'<div class="aicj-bar">'+events.map(function(e,i){
    const state=i<stage?'done':i===stage?'current':'pending';
    let html='<div class="aicj-step">'
      +'<div class="aicj-dot '+state+'"></div>'
      +'<div class="aicj-step-label '+state+'">'+aiCjShortLabel(e.name)+'</div>'
      +'</div>';
    if(i<events.length-1){
      const filled=i<stage;
      const grow=filled&&i===stage-1&&animateThisRender;
      html+='<div class="aicj-line'+(filled?' filled':'')+(grow?' grow':'')+'"><div class="aicj-line-fill"></div></div>';
    }
    return html;
  }).join('')+'</div>';
}
function buildAIContractJourneyBarHTML(stage){return buildAIJourneyBarHTML('contract-creation',stage,'contract');}
function aiCtLoaderTarget(){return document.getElementById('aicj-inner')||document.getElementById('adt-content');}
function aiScrollContentToTop(){
  const el=document.getElementById('adt-content');
  if(!el||el.scrollTop===0)return;
  el.scrollTo({top:0,behavior:'smooth'});
}
function aiShowLoader(title,sub,targetEl){
  const el=targetEl||aiCtLoaderTarget();
  if(!el)return;
  el.innerHTML='<div class="contract-loader"><div class="cl-spinner"></div><div class="cl-title">'+title+'</div><div class="cl-sub">'+sub+'</div></div>';
  aiScrollContentToTop();
}
function parseAIContractPrompt(text){
  const countries=['Netherlands','India','Germany','Spain','United Kingdom','France','Italy'];
  const empTypes=['EOR','PEO','Contractor'];
  let country='',empType='',name=text||'';
  countries.forEach(function(c){if(new RegExp('\\b'+c+'\\b','i').test(name)){country=c;name=name.replace(new RegExp('\\b'+c+'\\b','i'),'');}});
  empTypes.forEach(function(t){if(new RegExp('\\b'+t+'\\b','i').test(name)){empType=t;name=name.replace(new RegExp('\\b'+t+'\\b','i'),'');}});
  name=name.replace(/\b(create|contract|for|an|a|in|the|please|make|start|new|with|of)\b/gi,'').replace(/[,]/g,' ').replace(/\s+/g,' ').trim();
  return {name:name,country:country,empType:empType};
}
function findExistingEmployee(name){
  if(!name)return null;
  const q=name.toLowerCase().trim();if(!q)return null;
  const all=directEmpData.concat(globalEmpData);
  return all.find(function(e){return e.name.toLowerCase()===q;})
    || all.find(function(e){return e.name.toLowerCase().indexOf(q)!==-1||q.indexOf(e.name.toLowerCase())!==-1;})
    || null;
}
function buildAIContractAssistantHTML(){
  return '<div class="ep-page" style="max-width:1040px;margin:0 auto">'
    +'<button class="ep-back" onclick="page=\'ai-executive\';renderADTPage()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back to AI Executive</button>'
    +'<div class="ai-ct-assist-split">'
    +'<div class="ai-ct-assist-left">'
    +'<div class="ep-form-card" style="text-align:center;padding:32px 30px">'
    +'<div class="we-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="var(--orange)" stroke="none"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg></div>'
    +'<div style="font-size:18px;font-weight:700;color:var(--navy);margin-bottom:6px">AI Contract Assistant</div>'
    +'<div style="font-size:12.5px;color:var(--gray);line-height:1.6;margin:0 auto 22px">The Contract Creation journey is automated. Tell me who you\'re creating a contract for &mdash; I\'ll check ADT records and pre-fill the form for you.</div>'
    +'<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:18px">'
    +'<button class="btn btn-secondary" onclick="aiCtSimulateExisting()">Simulate: Existing Employee</button>'
    +'<button class="btn btn-secondary" onclick="aiCtSimulateNew()">Simulate: New Employee</button>'
    +'</div>'
    +'<div class="input-row" style="margin:0 auto 10px">'
    +'<input class="input-field" id="ai-ct-prompt" placeholder="e.g. Create an EOR contract for Anika Shah in Netherlands" oninput="aiCtLiveParse()" onkeydown="if(event.key===\'Enter\')aiCtSubmitPrompt()">'
    +'<button class="icon-btn active" onclick="aiCtSubmitPrompt()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>'
    +'</div>'
    +'<button class="add-link" onclick="page=\'contract-type-select\';renderADTPage()">Skip &mdash; create manually</button>'
    +'</div>'
    +'</div>'
    +'<div class="ai-ct-assist-right" id="ai-ct-result">'
    +'<div class="ai-ct-assist-idle"><div class="ai-ct-assist-idle-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div><div class="ai-ct-assist-idle-title">Employee lookup will appear here</div><div class="ai-ct-assist-idle-text">Run a simulation or enter a prompt on the left &mdash; matching ADT records or a new-hire form will show up in this panel.</div></div>'
    +'</div>'
    +'</div>'
    +'</div>';
}
function aiCtRunSearch(parsed,label){
  aiCtNotFoundOpen=false;
  const res=document.getElementById('ai-ct-result');if(!res)return;
  res.innerHTML='<div class="ep-form-card">'
    +'<div style="font-size:11.5px;font-weight:700;color:var(--gray);text-transform:uppercase;letter-spacing:.4px;margin-bottom:14px">Searching ADT employee records for &ldquo;'+label+'&rdquo;&hellip;</div>'
    +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">'
    +'<div class="skel-avatar"></div>'
    +'<div style="flex:1"><div class="skel-line" style="width:45%;margin-bottom:8px"></div><div class="skel-line" style="width:65%"></div></div>'
    +'</div>'
    +'<div class="review-grid">'
    +'<div class="skel-line" style="width:70%"></div>'
    +'<div class="skel-line" style="width:50%"></div>'
    +'<div class="skel-line" style="width:65%"></div>'
    +'<div class="skel-line" style="width:55%"></div>'
    +'</div>'
    +'</div>';
  setTimeout(function(){aiCtShowResult(parsed);},1700);
}
function aiCtSubmitPrompt(){
  const inp=document.getElementById('ai-ct-prompt');if(!inp)return;
  const raw=inp.value;
  const parsed=parseAIContractPrompt(raw);
  aiCtRunSearch(parsed,parsed.name||raw);
}
function aiCtSimulateExisting(){
  const inp=document.getElementById('ai-ct-prompt');
  if(inp)inp.value='Create an EOR contract for Anika Shah in Mumbai';
  aiCtRunSearch({name:'Anika Shah',country:'',empType:'EOR'},'Anika Shah');
}
function aiCtSimulateNew(){
  const inp=document.getElementById('ai-ct-prompt');
  if(inp)inp.value='Create a contract for Rohan Verma';
  aiCtRunSearch({name:'Rohan Verma',country:'Germany',empType:'EOR',jobTitle:'Operations Analyst'},'Rohan Verma');
}
function aiCtShowResult(parsed){
  const res=document.getElementById('ai-ct-result');if(!res)return;
  window._aiCtLastParsed=parsed;
  const emp=findExistingEmployee(parsed.name);
  if(emp){
    aiCtNotFoundOpen=false;
    res.innerHTML='<div class="ep-form-card" style="display:flex;align-items:center;gap:10px"><div style="width:22px;height:22px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div><span style="font-size:13px;font-weight:700;color:#16a34a">Found the employee</span></div>';
    setTimeout(function(){aiCtRenderMatchCard(emp,parsed);},1000);
  }else{
    aiCtNotFoundOpen=true;
    res.innerHTML=aiCtNotFoundPanel(parsed);
  }
}
function aiCtMockSalary(emp){
  let seed=0;
  (emp.empId||emp.name||'x').split('').forEach(function(ch){seed+=ch.charCodeAt(0);});
  return (45000+(seed%40)*1000).toLocaleString('en-IN');
}
function aiCtRenderMatchCard(emp,parsed){
  const res=document.getElementById('ai-ct-result');if(!res)return;
  const initials=emp.name.split(' ').map(function(n){return n[0];}).slice(0,2).join('');
  res.innerHTML='<div class="ep-form-card">'
    +'<div style="font-size:11.5px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:.4px;margin-bottom:12px">&#10003; Match found in ADT</div>'
    +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">'
    +'<div class="user-avatar-sm" style="width:40px;height:40px;font-size:14px">'+initials+'</div>'
    +'<div><div style="font-size:14px;font-weight:700;color:var(--navy)">'+emp.name+'</div><div style="font-size:12px;color:var(--gray)">'+(emp.jobTitle||'—')+' &middot; '+(emp.dept||'—')+'</div></div>'
    +'</div>'
    +'<div class="review-grid">'
    +'<div class="review-row"><div class="rr-label">Country</div><div class="rr-val">'+(emp.country||parsed.country||'India')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Employee ID</div><div class="rr-val">'+(emp.empId||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Email</div><div class="rr-val">'+(emp.email||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Status</div><div class="rr-val">'+(emp.status||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Monthly Salary</div><div class="rr-val">'+aiCtMockSalary(emp)+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Department</div><div class="rr-val">'+(emp.dept||'—')+'</div></div>'
    +'</div>'
    +'<div style="display:flex;gap:10px;margin-top:18px">'
    +'<button class="btn btn-primary" onclick="aiCtUseEmployee(\''+emp.empId+'\')">Use this employee &amp; continue</button>'
    +'<button class="btn btn-secondary" onclick="document.getElementById(\'ai-ct-result\').innerHTML=\'\'">Not the right person? Search again</button>'
    +'</div></div>';
}
function aiCtNotFoundPanel(parsed){
  const nameParts=(parsed.name||'').trim().split(' ');
  const fname=nameParts[0]||'',lname=nameParts.slice(1).join(' ')||'';
  const country=parsed.country||'',empType=parsed.empType||'',jobTitle=parsed.jobTitle||'';
  const countryOpts=['','Netherlands','India','Germany','Spain','United Kingdom','France','Italy'].map(function(c){return '<option value="'+c+'"'+(c===country?' selected':'')+'>'+(c||'Select Country')+'</option>';}).join('');
  const empTypeOpts=['','EOR','PEO','Contractor'].map(function(t){return '<option value="'+t+'"'+(t===empType?' selected':'')+'>'+(t||'Select Type')+'</option>';}).join('');
  return '<div class="ep-form-card">'
    +'<div style="font-size:11.5px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px">No existing employee found</div>'
    +'<div style="font-size:12px;color:var(--gray);margin-bottom:14px">I couldn\'t find &ldquo;'+(parsed.name||'this person')+'&rdquo; in ADT. I\'ve pre-filled their details below from the request &mdash; review and continue, or let AI fill the form in for you.</div>'
    +'<button type="button" class="btn btn-secondary" id="ai-ct-autofill-btn" style="margin-bottom:16px" onclick="aiCtSimulateFill()">&#10024; Simulate Auto-Fill</button>'
    +'<div class="ep-form-grid" style="margin-bottom:16px">'
    +'<div class="ep-form-group"><label class="ep-form-label">First Name</label><input class="ep-form-input" id="ai-ct-fname" value="'+fname+'"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Last Name</label><input class="ep-form-input" id="ai-ct-lname" value="'+lname+'"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Country</label><select class="ep-form-select" id="ai-ct-country">'+countryOpts+'</select></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Employment Type</label><select class="ep-form-select" id="ai-ct-emptype">'+empTypeOpts+'</select></div>'
    +'<div class="ep-form-group ep-form-full"><label class="ep-form-label">Job Title</label><input class="ep-form-input" id="ai-ct-jobtitle" placeholder="e.g. Software Engineer" value="'+jobTitle+'"></div>'
    +'</div>'
    +'<button class="btn btn-primary" onclick="aiCtUseManualEntry()">Continue to Contract Form</button>'
    +'</div>';
}
function aiCtSimulateFill(){
  const btn=document.getElementById('ai-ct-autofill-btn');
  if(btn){btn.disabled=true;btn.textContent='AI is filling in the details…';}
  const parsed=window._aiCtLastParsed||{};
  const nameParts=(parsed.name||'Rohan Verma').split(' ');
  const fills=[
    {id:'ai-ct-fname',value:nameParts[0]||'Rohan'},
    {id:'ai-ct-lname',value:nameParts.slice(1).join(' ')||'Verma'},
    {id:'ai-ct-country',value:parsed.country||'Germany'},
    {id:'ai-ct-emptype',value:parsed.empType||'EOR'},
    {id:'ai-ct-jobtitle',value:parsed.jobTitle||'Operations Analyst'}
  ];
  let i=0;
  function next(){
    if(i>=fills.length){
      if(btn)btn.textContent='✓ Details Filled';
      setTimeout(function(){aiCtUseManualEntry();},700);
      return;
    }
    const f=fills[i];
    const el=document.getElementById(f.id);
    if(el){
      el.value=f.value;
      el.classList.add('ai-ct-field-fill');
      setTimeout(function(){el.classList.remove('ai-ct-field-fill');},400);
    }
    i++;
    setTimeout(next,500);
  }
  next();
}
function aiCtLiveParse(){
  if(!aiCtNotFoundOpen)return;
  const inp=document.getElementById('ai-ct-prompt');if(!inp)return;
  const parsed=parseAIContractPrompt(inp.value);
  const fn=document.getElementById('ai-ct-fname'),ln=document.getElementById('ai-ct-lname'),co=document.getElementById('ai-ct-country'),et=document.getElementById('ai-ct-emptype');
  if(fn&&parsed.name)fn.value=parsed.name.split(' ')[0];
  if(ln&&parsed.name)ln.value=parsed.name.split(' ').slice(1).join(' ');
  if(co&&parsed.country)co.value=parsed.country;
  if(et&&parsed.empType)et.value=parsed.empType;
}

// ── AI Contract Assistant: chat-driven slot filling ──
// Flat list of fields the assisted contract form can be missing. Ordered to match the
// top-to-bottom layout of the (single-page) assisted form, since the chat asks about
// whichever one is empty next.
const AI_CT_FIELDS=[
  {key:'nationality',id:'peo-nationality',label:'Employee Nationality',type:'select',options:AI_CT_COUNTRIES,question:"What is the employee's nationality?"},
  {key:'country',id:'peo-work-country',label:'Country employee will be working from',type:'select',options:AI_CT_COUNTRIES,question:'Which country will the employee be working from?'},
  {key:'fname',id:'peo-fname',label:'First Name',type:'text',question:"What's the employee's first name?"},
  {key:'lname',id:'peo-lname',label:'Last Name',type:'text',question:"And their last name?"},
  {key:'email',id:'peo-email',label:'Email',type:'email',question:"What's their email address?"},
  {key:'mobile',id:'peo-mobile',label:'Mobile Number',type:'tel',question:"What's a good mobile number for them?"},
  {key:'dob',id:'peo-dob',label:'Date of Birth',type:'date',question:"What's their date of birth? (e.g. 1995-04-12)"},
  {key:'address',id:'peo-address',label:'Address',type:'text',question:"What's their residential address?"},
  {key:'jobTitle',id:'peo-jobtitle',label:'Job Title',type:'text',question:"What's the employee's job title?"},
  {key:'jobDesc',id:'peo-jobdesc',label:'Job Description',type:'text',question:'Can you give a short job description or scope of work?'},
  {key:'toDate',id:'peo-to',label:'Contract End Date',type:'date',question:"What's the contract end date? (e.g. 2027-04-12)"},
  {key:'pay',id:'peo-pay',label:'Pay Amount',type:'number',question:"What's the monthly pay amount (in the local currency)?"}
];
function aiCtFieldMissing(field){
  const el=document.getElementById(field.id);
  const v=(el?el.value:'').toString().trim();
  if(field.type==='number')return !v||parseFloat(v)===0||isNaN(parseFloat(v));
  return !v;
}
function aiCtMissingFields(){return AI_CT_FIELDS.filter(aiCtFieldMissing);}
function aiCtMatchOption(text,options){
  const q=text.toLowerCase().trim();
  return options.find(function(o){return o.toLowerCase()===q;})
    ||options.find(function(o){return o.toLowerCase().indexOf(q)!==-1||q.indexOf(o.toLowerCase())!==-1;})
    ||null;
}
function aiCtNormalizeDate(text){
  const t=text.trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(t))return t;
  const p2=function(n){return String(n).padStart(2,'0');};
  const m=t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if(m)return m[3]+'-'+p2(m[2])+'-'+p2(m[1]);
  const d=new Date(t);
  if(!isNaN(d.getTime()))return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
  return null;
}
function aiCtAskNextField(){
  const next=aiCtMissingFields()[0];
  if(next){
    aiCtPendingField=next;
    aiCtChatMsgs.push({role:'bot',text:next.question});
  }else{
    aiCtPendingField=null;
    aiCtChatMsgs.push({role:'bot',text:'All the required details are filled in on the right. Review the form and click the button at the bottom when you\'re ready.'});
  }
  renderChat('ai-ct-chat',aiCtChatMsgs);
}
function aiCtStartQuestionFlow(){
  if(!aiAssistedFlow||aiCtQuestionsStarted)return;
  aiCtQuestionsStarted=true;
  showTyping('ai-ct-chat');
  setTimeout(function(){hideTyping();aiCtAskNextField();},900);
}
function aiCtApplyFieldAnswer(field,text){
  let value=text.trim();
  if(field.type==='select'){
    const matched=aiCtMatchOption(value,field.options);
    if(!matched){
      showTyping('ai-ct-chat');
      setTimeout(function(){hideTyping();aiCtChatMsgs.push({role:'bot',text:'I couldn\'t match &ldquo;'+value+'&rdquo; to a country &mdash; could you spell out the full country name?'});renderChat('ai-ct-chat',aiCtChatMsgs);},500);
      return;
    }
    value=matched;
  }else if(field.type==='date'){
    const norm=aiCtNormalizeDate(value);
    if(!norm){
      showTyping('ai-ct-chat');
      setTimeout(function(){hideTyping();aiCtChatMsgs.push({role:'bot',text:'Sorry, I didn\'t catch that date &mdash; try a format like YYYY-MM-DD.'});renderChat('ai-ct-chat',aiCtChatMsgs);},500);
      return;
    }
    value=norm;
  }else if(field.type==='number'){
    const num=parseFloat(value.replace(/[^0-9.]/g,''));
    if(!num){
      showTyping('ai-ct-chat');
      setTimeout(function(){hideTyping();aiCtChatMsgs.push({role:'bot',text:'Could you share that as a number, e.g. 55000?'});renderChat('ai-ct-chat',aiCtChatMsgs);},500);
      return;
    }
    value=String(num);
  }
  aiWizardFormData[field.key]=value;
  const el=document.getElementById(field.id);
  if(el){el.value=value;el.classList.add('ai-ct-field-fill');setTimeout(function(){el.classList.remove('ai-ct-field-fill');},600);}
  aiCtPendingField=null;
  showTyping('ai-ct-chat');
  setTimeout(function(){
    hideTyping();
    aiCtChatMsgs.push({role:'bot',text:'Got it &mdash; set <b>'+field.label+'</b> to &ldquo;'+value+'&rdquo;.'});
    renderChat('ai-ct-chat',aiCtChatMsgs);
    setTimeout(aiCtAskNextField,450);
  },500);
}
function aiCtRouteToContractType(empType){
  if(empType==='PEO'){peoStep=0;page='contract-peo';}
  else if(empType==='EOR'){eorStep=0;page='contract-eor';}
  else{page='contract-type-select';}
  renderADTPage();
}
function aiCtUseEmployee(empId){
  const emp=directEmpData.concat(globalEmpData).find(function(e){return String(e.empId)===String(empId);});
  if(!emp)return;
  const parsed=window._aiCtLastParsed||{};
  const parts=emp.name.split(' ');
  aiContractPrefill={fname:parts[0]||'',lname:parts.slice(1).join(' '),email:emp.email||'',country:emp.country||parsed.country||'India',jobTitle:emp.jobTitle||'',pay:aiCtMockSalary(emp).replace(/,/g,'')};
  aiAssistedFlow=true;aiWizardFormData={};aiCreatedContractId=null;aiCtQuestionsStarted=false;aiCtPendingField=null;
  aiCtJourneyEmployee=emp;aiCtPendingEmpType=parsed.empType||'';aiCtJourneyIsSimulated=false;
  const promptEl=document.getElementById('ai-ct-prompt');
  aiCtChatMsgs=[
    {role:'user',text:(promptEl&&promptEl.value)||('Create a contract for '+emp.name)},
    {role:'bot',text:'Found <b>'+emp.name+'</b> in ADT &mdash; '+(emp.country||parsed.country||'India')+', '+(emp.jobTitle||'—')+'. I\'ve pre-filled the contract form on the right with their details. Review each step and continue when you\'re ready.'}
  ];
  aiCtRouteToContractType(aiCtPendingEmpType);
}
function aiCtUseManualEntry(){
  const gv=function(id){const el=document.getElementById(id);return el?el.value:'';};
  const fname=gv('ai-ct-fname'),lname=gv('ai-ct-lname'),country=gv('ai-ct-country'),empType=gv('ai-ct-emptype'),jobTitle=gv('ai-ct-jobtitle');
  const fullName=(fname+' '+lname).trim()||'New Employee';
  const isGlobal=!!country;
  const arr=isGlobal?globalEmpData:directEmpData;
  const newId=arr.reduce(function(m,e){return Math.max(m,e.id);},0)+1;
  const empId=(isGlobal?'GEP':'EMP')+String(newId).padStart(3,'0');
  const now=aiFormatNow();
  const rec=Object.assign({id:newId,name:fullName,empId:empId,dept:'—',jobTitle:jobTitle||'—',joinDate:now.date,desc:'Created via AI Contract Assistant',contact:'—',email:'—',status:'Active'},
    isGlobal?{country:country,workerType:empType||'EOR'}:{branch:'—'});
  arr.push(rec);
  aiCtJourneyEmployee=rec;aiCtPendingEmpType=empType||'';aiCtJourneyIsSimulated=true;
  aiContractPrefill={fname:fname,lname:lname,email:'',country:country,jobTitle:jobTitle};
  aiAssistedFlow=true;aiWizardFormData={};aiCreatedContractId=null;aiCtQuestionsStarted=false;aiCtPendingField=null;
  const promptEl=document.getElementById('ai-ct-prompt');
  aiCtChatMsgs=[
    {role:'user',text:(promptEl&&promptEl.value)||('Create a contract for '+fullName)},
    {role:'bot',text:'I couldn\'t find <b>'+fullName+'</b> in ADT, so I created a new employee record ('+empId+') and started a new contract using the details you gave me.'}
  ];
  page='ai-employee-created';renderADTPage();
}
function aiCtContinueAfterEmployeeCreated(){
  aiCtRouteToContractType(aiCtPendingEmpType);
}
function buildAIEmployeeCreatedHTML(){
  const rec=aiCtJourneyEmployee||{};
  return '<div class="ep-page" style="max-width:680px;margin:20px auto 0">'
    +'<div class="success-card">'
    +'<div class="success-check" style="width:64px;height:64px;margin-bottom:18px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="26" height="26"><polyline points="20 6 9 17 4 12"/></svg></div>'
    +'<h2 style="font-size:20px;font-weight:700;margin-bottom:6px">Employee Created</h2>'
    +'<p style="font-size:12.5px;color:var(--gray);margin-bottom:20px;max-width:380px;line-height:1.55">AI created a new ADT employee record. You can now continue to build the contract proposal for them.</p>'
    +'<div class="review-section" style="text-align:left;width:100%;max-width:380px;margin-bottom:20px">'
    +'<div class="review-grid">'
    +'<div class="review-row"><div class="rr-label">Name</div><div class="rr-val">'+(rec.name||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Employee ID</div><div class="rr-val">'+(rec.empId||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Country</div><div class="rr-val">'+(rec.country||'India')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Job Title</div><div class="rr-val">'+(rec.jobTitle||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Status</div><div class="rr-val">'+(rec.status||'Active')+'</div></div>'
    +'</div></div>'
    +'<button class="btn btn-success" onclick="aiCtContinueAfterEmployeeCreated()">Continue to Contract Details</button>'
    +'</div></div>';
}
function buildAIAssistedContractSplitHTML(type){
  const step=type==='PEO'?peoStep:eorStep;
  const formHtml=buildContractFormHTML(type,step,true);
  return '<div class="ai-ct-split">'
    +'<div class="ai-ct-split-chat">'
    +'<div class="ai-ct-upload-bar">'
    +'<button type="button" class="ai-ct-upload-btn" onclick="aiCtTriggerDocUpload()" title="Upload an offer letter, ID, or filled-in form &mdash; AI will extract the details and fill the form">'
    +'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'
    +'<span>Upload document to auto-fill</span>'
    +'</button>'
    +'</div>'
    +'<div class="chat-area" id="ai-ct-chat"></div>'
    +'<div class="input-area"><div class="input-row">'
    +'<input class="input-field" id="ai-ct-chat-input-field" placeholder="Ask AI or add more details..." onkeydown="if(event.key===\'Enter\')aiCtChatSend()">'
    +'<button class="icon-btn active" onclick="aiCtChatSend()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>'
    +'</div></div>'
    +'</div>'
    +'<div class="form-col" style="flex:1;background:#f8f9fb">'
    +'<div class="form-panel" style="margin:14px">'+formHtml+'</div>'
    +'</div>'
    +'</div>';
}
function initAICtChatPanel(){renderChat('ai-ct-chat',aiCtChatMsgs);aiCtStartQuestionFlow();}
function aiCtChatSend(){
  const inp=document.getElementById('ai-ct-chat-input-field');if(!inp)return;
  const text=inp.value.trim();if(!text)return;
  aiCtChatMsgs.push({role:'user',text:text});
  inp.value='';
  renderChat('ai-ct-chat',aiCtChatMsgs);
  if(aiCtPendingField){aiCtApplyFieldAnswer(aiCtPendingField,text);return;}
  setTimeout(function(){
    aiCtChatMsgs.push({role:'bot',text:'Got it &mdash; I\'ve noted that. Keep filling in the form on the right, and I\'ll keep helping as you go.'});
    renderChat('ai-ct-chat',aiCtChatMsgs);
  },500);
}
// ── AI Contract Assistant: upload-to-autofill ──
// Simulates parsing an uploaded document (offer letter, ID, filled-in form). Instead of a
// single summary, the chat replays each required field's question immediately followed by
// the answer pulled from the document (mirroring the manual Q&A flow), filling the matching
// form field in step with each answer. Optional/already-defaulted fields are filled silently
// at the end. Matches the sample document in sample-docs/.
function aiCtTriggerDocUpload(){
  const inp=document.getElementById('ai-ct-upload-input');
  if(!inp)return;
  inp.value='';
  inp.click();
}
function aiCtDocFieldValues(){
  const p=aiContractPrefill||{};
  return {
    nationality:'India',
    country:p.country||'Germany',
    fname:p.fname||'Rohan',
    lname:p.lname||'Verma',
    email:p.email||'rohan.verma@personalmail.com',
    mobile:'+91 98765 43210',
    dob:'1994-03-18',
    address:'221B Residency Road, Bengaluru, India',
    jobTitle:p.jobTitle||'Operations Analyst',
    jobDesc:'Owns cross-border vendor coordination and operational reporting.',
    toDate:'2027-04-12',
    pay:'55000'
  };
}
// Optional fields (no chat question defined, already have form defaults) that the sample
// document also covers — filled quietly once the Q&A flow finishes.
function aiCtDocSilentFieldValues(){
  return {'peo-gender':'Male','peo-skill':'Vendor & Operations Management','peo-from':'2026-08-01'};
}
function aiCtHandleDocUpload(e){
  const file=e.target.files&&e.target.files[0];
  if(!file)return;
  const fname=file.name;
  aiCtPendingField=null;
  aiCtChatMsgs.push({role:'user',text:'Please use this document to fill in the contract details.',attachment:{name:fname,isImage:false}});
  renderChat('ai-ct-chat',aiCtChatMsgs);
  showTyping('ai-ct-chat');
  setTimeout(function(){
    hideTyping();
    aiCtChatMsgs.push({role:'bot',text:'Reading <b>'+fname+'</b>&hellip; I\'ll go through each field and pull the answer straight from the document.'});
    renderChat('ai-ct-chat',aiCtChatMsgs);
    setTimeout(function(){aiCtRunDocQAFlow(fname,aiCtDocFieldValues());},700);
  },500);
}
function aiCtRunDocQAFlow(fname,values){
  const queue=AI_CT_FIELDS.filter(aiCtFieldMissing).filter(function(f){return values[f.key]!==undefined;});
  let i=0;
  function step(){
    if(i>=queue.length){aiCtFinishDocUpload();return;}
    const field=queue[i];
    const val=values[field.key];
    aiCtChatMsgs.push({role:'bot',text:field.question});
    renderChat('ai-ct-chat',aiCtChatMsgs);
    showTyping('ai-ct-chat');
    setTimeout(function(){
      hideTyping();
      aiCtChatMsgs.push({role:'bot',text:'&#128196; Found in <b>'+fname+'</b>: &ldquo;'+val+'&rdquo; &mdash; set <b>'+field.label+'</b>.'});
      renderChat('ai-ct-chat',aiCtChatMsgs);
      aiWizardFormData[field.key]=val;
      const el=document.getElementById(field.id);
      if(el){el.value=val;el.classList.add('ai-ct-field-fill');setTimeout(function(){el.classList.remove('ai-ct-field-fill');},600);}
      i++;
      setTimeout(step,550);
    },550);
  }
  step();
}
function aiCtFinishDocUpload(){
  const extras=aiCtDocSilentFieldValues();
  Object.keys(extras).forEach(function(id){
    const el=document.getElementById(id);
    if(el&&!el.value){el.value=extras[id];el.classList.add('ai-ct-field-fill');setTimeout(function(){el.classList.remove('ai-ct-field-fill');},600);}
  });
  const remaining=aiCtMissingFields();
  if(remaining.length){
    aiCtChatMsgs.push({role:'bot',text:'A few details weren\'t in the document, so I\'ll ask about those now.'});
    renderChat('ai-ct-chat',aiCtChatMsgs);
    setTimeout(aiCtAskNextField,500);
  }else{
    aiCtChatMsgs.push({role:'bot',text:'All the required details are filled in on the right from the document. Review the form and click the button at the bottom when you\'re ready.'});
    renderChat('ai-ct-chat',aiCtChatMsgs);
  }
}
function aiCtPushStepMessage(step){
  const msgs={1:'Now let\'s confirm the job details &mdash; title, schedule, and pay.',2:'Almost done &mdash; just leave entitlement, probation, and notice period left.'};
  if(msgs[step])aiCtChatMsgs.push({role:'bot',text:msgs[step]});
}
function genProposalId(){return 'PRO-'+Math.floor(1000+Math.random()*9000);}
function aiFormatNow(){
  const d=new Date();const p2=function(n){return String(n).padStart(2,'0');};
  return {date:d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()),time:p2(d.getHours())+':'+p2(d.getMinutes())+':'+p2(d.getSeconds())};
}
function aiGenCommercial(payAmount){
  const p=parseFloat(payAmount)||50000;
  const s=function(mult){return (p*mult/1000000).toFixed(2);};
  return {adtFee:'549',annualGross:s(12),baseGross:s(1),holidayBonus:s(0.08),month13:s(1),monthlyGrossNet:s(0.7),monthlyInvoice:s(1.2),monthlySalary12:s(0.9),monthlySalary1392:s(1),netPay:s(1.3),socialPremAmt:s(0.26),socialPremPct:'26.02',totalMonthlyGross:s(1)};
}
function aiSubmitAssistedContract(type){
  // Capture whatever is on the final step, then merge with everything gathered across earlier steps
  // (the wizard re-renders each step from scratch, so aiWizardFormData is the accumulated source of truth).
  aiCaptureCurrentStep();
  const p=Object.assign({},aiContractPrefill||{},aiWizardFormData||{});
  const fullName=((p.fname||'')+' '+(p.lname||'')).trim()||'New Employee';
  const now=aiFormatNow();
  const newId=contractsData.reduce(function(m,c){return Math.max(m,c.id);},0)+1;
  const contractId=String(90000+Math.floor(Math.random()*9999));
  const from=p.fromDate||now.date;
  const record={
    id:newId,contractId:contractId,empName:fullName,empDesig:p.jobTitle||'—',country:p.country||'—',type:type,date:now.date+' '+now.time,status:'Submitted',
    nationality:p.country||'India',countryOfOp:p.country||'—',workPermit:p.workPermit===true,gender:(p.gender||'').toUpperCase()||'—',
    email:p.email||'—',contact:p.mobile||'—',dob:p.dob||'—',jobTitle:p.jobTitle||'—',skill:p.skill||'—',
    empDuration:from+(p.toDate?' – '+p.toDate:''),empType:type,workSchedule:p.hours||'—',payAmount:p.pay||'—',currency:'INR',
    jobDesc:p.jobDesc||'—',payFrequency:'Monthly',
    commercial:aiGenCommercial(p.pay),
    complianceItems:[{item:type+' '+(p.country||'')+' Proposal',note:'Optional',status:'Pending',doc:null}],
    simulated:aiCtJourneyIsSimulated
  };
  contractsData.unshift(record);
  ctLogsData[newId]=[{date:now.date,time:now.time,user:'AI Contract Assistant',status:'Submitted',action:'Contract created via AI Contract Assistant for '+fullName+'.'}];
  ctWorkflowData[newId]=[{title:'Contract Created by AI',user:'AI Contract Assistant',date:now.date,time:now.time,description:'AI compiled the proposal and contract data from the conversation for '+fullName+'.'}];
  aiCreatedContractId=newId;
  // -- Agent-Mode contract creation used to only touch contractsData/aiAutomationRuns, so it never showed up as an "Open Deal" (that panel reads manualJourneyRuns). Log a run here too so both paths stay in sync. --
  const dealCreatorId=portalRole==='entity-user'?activePersonaId:'account-manager';
  const dealCreatorPersona=enterprisePersonas.find(function(pn){return pn.id===dealCreatorId;});
  const dealCreatorLabel=dealCreatorPersona?dealCreatorPersona.label:'Account Manager';
  const dealRun={
    runId:'MAN-'+(manualRunSeq++),journeyId:'contract-creation',subject:fullName,entity:'Dhi Hyperlocal',mode:'Agent Enabled',
    currentStepIdx:1,status:'Active',slaRisk:'Low',blockedReason:'None',escalation:'None',startedAt:'Just now',
    manualHours:0,agentEstimateHours:.8,createdBy:dealCreatorId,contractRecordId:newId,exceptions:[],
    audit:['Deal & Employee Record completed via AI Contract Assistant by '+dealCreatorLabel+' for '+fullName+' ('+type+')']
  };
  manualJourneyRuns.unshift(dealRun);
  record.manualRunId=dealRun.runId;
  aiProposalDraft={
    proposalId:genProposalId(),
    name:fullName,
    country:p.country||'—',
    jobTitle:p.jobTitle||'—',
    type:type,
    contractRecordId:newId,
    runId:'RUN-'+(liveRunSeq++)
  };
  aiUpsertRun('contract-creation',aiProposalDraft.runId,{client:aiProposalDraft.name,country:aiProposalDraft.country,contractType:aiProposalDraft.type,currentStepIdx:1,status:'In Progress',lastActivity:'Just now'});
  aiShowLoader('Creating Proposal&hellip;','Compiling contract data into a proposal for '+aiProposalDraft.name);
  setTimeout(function(){page='ai-proposal-created';renderADTPage();},2000);
}
let _aiAutoAdvanceTimer=null;
function aiScheduleAutoAdvance(expectedPage,fn,delay){
  if(_aiAutoAdvanceTimer)clearTimeout(_aiAutoAdvanceTimer);
  _aiAutoAdvanceTimer=setTimeout(function(){_aiAutoAdvanceTimer=null;if(page===expectedPage)fn();},delay||1800);
}
let _runNotifyTimer=null;
function notifyRunOwner(runId,ownerName,stepName,ownerRole){
  notifiedRunIds.add(runId);
  const ownerPersonaId=ownerRole?manualStepOwnerPersonaId(ownerRole):null;
  if(ownerPersonaId){
    notifiedRunOwners[runId]=ownerPersonaId;
    pushRunNotification(runId,ownerPersonaId,'"'+stepName+'" needs your attention — nudged by an admin.');
  }
  const overlay=document.getElementById('run-notify-overlay');const desc=document.getElementById('run-notify-desc');
  if(overlay&&desc){
    desc.textContent='Sent notification to '+ownerName+' — owner of '+stepName+'.';
    overlay.classList.remove('hidden');
    clearTimeout(_runNotifyTimer);
    _runNotifyTimer=setTimeout(closeRunNotifyModal,2600);
  }
  renderADTPage();
}
function closeRunNotifyModal(){
  const overlay=document.getElementById('run-notify-overlay');if(overlay)overlay.classList.add('hidden');
  clearTimeout(_runNotifyTimer);
}
function showAiToast(title,sub){
  const stack=document.getElementById('ai-toast-stack');if(!stack)return;
  const el=document.createElement('div');
  el.className='ai-toast';
  el.innerHTML='<div class="ai-toast-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>'
    +'<div><div class="ai-toast-title">'+title+'</div>'+(sub?'<div class="ai-toast-sub">'+sub+'</div>':'')+'</div>';
  stack.appendChild(el);
  setTimeout(function(){
    el.classList.add('ai-toast-out');
    setTimeout(function(){el.remove();},250);
  },3200);
}
function closeLockedToast(btn){
  const el=btn.closest('.locked-toast');if(!el)return;
  el.classList.add('locked-toast-out');
  setTimeout(function(){el.remove();},200);
}
function removeLockedToastsForJourney(journeyId){
  const stack=document.getElementById('locked-toast-stack');if(!stack)return;
  stack.querySelectorAll('.locked-toast[data-journey-id="'+journeyId+'"]').forEach(function(el){
    el.classList.add('locked-toast-out');
    setTimeout(function(){el.remove();},200);
  });
}
function clearAllLockedToasts(){
  const stack=document.getElementById('locked-toast-stack');if(!stack)return;
  stack.querySelectorAll('.locked-toast').forEach(function(el){
    el.classList.add('locked-toast-out');
    setTimeout(function(){el.remove();},200);
  });
}
function showLockedJourneyToast(journeyId,journeyName){
  const stack=document.getElementById('locked-toast-stack');if(!stack)return;
  const el=document.createElement('div');
  el.className='locked-toast';
  el.dataset.journeyId=journeyId;
  el.innerHTML='<div class="locked-toast-avatar">J</div>'
    +'<div class="locked-toast-body"><div class="locked-toast-row1"><div class="locked-toast-text">Please contact Admin to activate this journey</div><div class="locked-toast-time">Just now</div></div>'
    +'<div class="locked-toast-row2"><span class="locked-toast-journey">'+journeyName+'</span><span class="locked-toast-pending">Locked</span><button class="locked-toast-contact-btn" onclick="event.stopPropagation();openLockedJourneyModal(\''+journeyId+'\')">Contact</button></div></div>'
    +'<button class="locked-toast-close" onclick="event.stopPropagation();closeLockedToast(this)" title="Dismiss"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
  el.addEventListener('click',function(){openLockedJourneyModal(journeyId);});
  stack.appendChild(el);
}
function journeyRequestState(journeyId){
  if(entityRequests.some(function(r){return r.refId===journeyId&&r.type==='journey-request-to-admin'&&r.status==='Pending';}))return 'awaiting-admin';
  return 'none';
}
function openLockedJourneyModal(journeyId){
  const j=cfgJourneys.find(function(x){return x.id===journeyId;});if(!j)return;
  const overlay=document.getElementById('lj-modal-overlay');const body=document.getElementById('lj-modal-body');
  if(!overlay||!body)return;
  clearAllLockedToasts();
  const state=journeyRequestState(j.id);
  const lockIcon='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  const gearIcon='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
  let cta,icon,badge;
  if(portalRole==='super-admin'){
    icon=gearIcon;
    badge='<span class="status-pill draft">Not Configured</span>';
    cta='<button class="btn btn-primary lj-modal-cta" onclick="closeLockedJourneyModal();viewCfgJourney(\''+j.id+'\')">Configure this Journey</button><div class="lj-modal-note">Define steps, owners, and automation to bring this journey online.</div>';
  }else{
    icon=lockIcon;
    badge='<span class="ai-journey-lock-badge">'+lockIcon+'Locked</span>';
    if(portalRole==='entity-user'){
      if(state==='awaiting-admin')cta='<button class="btn btn-secondary lj-modal-cta" disabled style="opacity:.6;cursor:default">Request Sent to Entity Admin</button><div class="lj-modal-note">Your Entity Admin has been notified and will review this request.</div>';
      else cta='<button class="btn btn-primary lj-modal-cta" onclick="requestJourneyFromEntityAdmin(\''+j.id+'\')">Notify Entity Admin</button><div class="lj-modal-note">Your Entity Admin will see this request in their tasks.</div>';
    }else{
      if(state==='awaiting-admin')cta='<button class="btn btn-secondary lj-modal-cta" disabled style="opacity:.6;cursor:default">Pending in My Tasks</button><div class="lj-modal-note">An Entity User has already requested this — review and approve it in My Tasks.</div>';
      else cta='<button class="btn btn-primary lj-modal-cta" onclick="activateJourneyAsAdmin(\''+j.id+'\')">Activate Journey</button><div class="lj-modal-note">You can activate this journey directly for your entity.</div>';
    }
  }
  body.innerHTML='<div class="lj-modal-icon">'+icon+'</div>'
    +'<div class="lj-modal-title">'+j.name+'</div>'
    +'<div class="lj-modal-badges">'+cfgCategoryBadge(j.category)+badge+'</div>'
    +'<div class="lj-modal-desc">'+j.desc+'</div>'
    +cta;
  overlay.classList.remove('hidden');
}
function closeLockedJourneyModal(){
  const overlay=document.getElementById('lj-modal-overlay');if(overlay)overlay.classList.add('hidden');
}
function requestJourneyFromEntityAdmin(journeyId){
  const j=cfgJourneys.find(function(x){return x.id===journeyId;});if(!j)return;
  createEntityRequest('journey-request-to-admin',j.id,j.name,'Requested from AI Executive — review and activate.');
  closeLockedJourneyModal();
  removeLockedToastsForJourney(journeyId);
  showAiToast('Request sent to Entity Admin','Your Entity Admin will review this request.');
}
let notifyMgrCtx=null;
function openNotifyManagerModal(managerName,contextLabel,refId){
  notifyMgrCtx={managerName:managerName,contextLabel:contextLabel,refId:refId};
  const overlay=document.getElementById('notify-mgr-overlay');const body=document.getElementById('notify-mgr-body');
  if(!overlay||!body)return;
  body.innerHTML='<div class="lj-modal-title">Notify Entity Admin</div>'
    +'<div class="lj-modal-desc">Let your Entity Admin know why you\'d like a second opinion on this approval.</div>'
    +'<textarea id="notify-mgr-note" class="ep-form-input" style="height:100px;width:100%;resize:vertical;margin-bottom:16px;font-family:inherit" placeholder="Add a note for your Entity Admin..."></textarea>'
    +'<div style="display:flex;gap:10px;justify-content:center">'
    +'<button class="btn btn-secondary" onclick="closeNotifyManagerModal()">Cancel</button>'
    +'<button class="btn btn-primary" onclick="submitNotifyManager()">Send Notification</button>'
    +'</div>';
  overlay.classList.remove('hidden');
}
function closeNotifyManagerModal(){
  const overlay=document.getElementById('notify-mgr-overlay');if(overlay)overlay.classList.add('hidden');
  notifyMgrCtx=null;
}
function submitNotifyManager(){
  if(!notifyMgrCtx)return;
  const inp=document.getElementById('notify-mgr-note');
  const note=(inp&&inp.value.trim())||'No additional note provided.';
  createEntityRequest('manager-notify',notifyMgrCtx.refId,notifyMgrCtx.contextLabel,note);
  closeNotifyManagerModal();
  showAiToast('Notification sent','Your Entity Admin has been notified about this approval.');
}
function buildAIProposalCreatedHTML(){
  const d=aiProposalDraft||{};
  return '<div class="ep-page" style="max-width:680px;margin:40px auto">'
    +'<div class="success-card">'
    +'<div class="success-check" style="width:64px;height:64px;margin-bottom:18px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="26" height="26"><polyline points="20 6 9 17 4 12"/></svg></div>'
    +'<h2 style="font-size:20px;font-weight:700;margin-bottom:6px">Proposal Created</h2>'
    +'<p style="font-size:12.5px;color:var(--gray);margin-bottom:12px;max-width:380px;line-height:1.55">AI compiled the contract details you entered into a proposal, ready to send to the deal manager for approval.</p>'
    +'<div style="margin-bottom:20px">'+aiCtCurrentAgentBadge()+'</div>'
    +'<div class="review-section" style="text-align:left;width:100%;max-width:420px;margin-bottom:20px">'
    +'<div class="review-grid">'
    +'<div class="review-row"><div class="rr-label">Proposal ID</div><div class="rr-val">'+d.proposalId+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Employee</div><div class="rr-val">'+d.name+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Country</div><div class="rr-val">'+d.country+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Contract Type</div><div class="rr-val">'+d.type+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Job Title</div><div class="rr-val">'+d.jobTitle+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Status</div><div class="rr-val">Draft</div></div>'
    +'</div></div>'
    +'<div style="font-size:11.5px;color:var(--gray)">Automatically sending to the Deal Manager for approval<span class="ai-ellipsis"><span>.</span><span>.</span><span>.</span></span></div>'
    +'</div></div>';
}
function aiSendProposalForApproval(){
  const notifyName=portalRole==='entity-user'?'Entity Admin':aiDealManager.name;
  aiShowLoader('Notifying '+notifyName+'&hellip;','Sending proposal '+((aiProposalDraft&&aiProposalDraft.proposalId)||'')+' for approval');
  notifData.unshift({name:'Proposal sent for approval — '+((aiProposalDraft&&aiProposalDraft.name)||''),cid:(aiProposalDraft&&aiProposalDraft.proposalId)||'',time:'Just now',pending:true});
  showAiToast('Proposal sent to '+notifyName,((aiProposalDraft&&aiProposalDraft.name)||'')+' — '+((aiProposalDraft&&aiProposalDraft.proposalId)||''));
  if(aiCreatedContractId){
    const rec=contractsData.find(function(c){return c.id===aiCreatedContractId;});
    if(rec){
      rec.status='Proposal Sent';
      const now=aiFormatNow();
      (ctLogsData[aiCreatedContractId]=ctLogsData[aiCreatedContractId]||[]).unshift({date:now.date,time:now.time,user:'Pallavi Parate',status:'Proposal Sent',action:'Proposal sent to '+aiDealManager.name+' ('+aiDealManager.role+') for approval.'});
    }
  }
  setTimeout(function(){page='ai-proposal-waiting-approval';renderADTPage();},2000);
}
function buildAIWaitingApprovalHTML(opts){
  const backLabel=opts.backLabel||'Back to AI Executive';
  const backAction=opts.backAction||"page='ai-executive';renderADTPage()";
  const showDataPanel=portalRole==='entity-user'&&!!opts.approvalPanelHTML;
  const sidePanelHTML=showDataPanel?opts.approvalPanelHTML:opts.sidePanelHTML;
  const showSidePanel=!!sidePanelHTML;
  const actionButtons=showDataPanel
    ?'<button class="btn btn-secondary" onclick="openNotifyManagerModal(\''+(opts.managerName||'')+'\',\''+(opts.noteContextLabel||'')+'\',\''+(opts.noteRefId||'')+'\')">Notify Entity Admin</button><button class="action-btn action-approve" onclick="'+opts.onApprove+'">Approve</button>'
    :'<button class="action-btn action-approve" onclick="'+opts.onApprove+'">'+opts.approveLabel+'</button>';
  const card='<div class="ep-form-card" style="padding:40px 32px">'
    +'<div style="width:64px;height:64px;border-radius:50%;background:#fef3c7;display:flex;align-items:center;justify-content:center;margin:0 auto 18px">'
    +'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>'
    +'</div>'
    +'<div class="success-meta" style="background:#fef3c7;color:#b45309;margin:0 auto 14px">&#9203; Pending Approval</div>'
    +'<h2 style="font-size:19px;font-weight:700;margin-bottom:8px">Waiting for Approval</h2>'
    +'<p style="font-size:12.5px;color:var(--gray);line-height:1.6;margin-bottom:20px">'+(showDataPanel&&opts.entityUserDescription?opts.entityUserDescription:opts.description)+'</p>'
    +'<div class="ai-timeline" style="text-align:left;max-width:360px;margin:0 auto 24px">'
    +opts.timelineItems.map(function(it,i){
      const chips=it.chips.map(function(c){return '<span class="ai-chip '+c.cls+'">'+c.label+'</span>';}).join('');
      const label=(showDataPanel&&it.dotClass==='human')?'Waiting for Your Approval':it.label;
      return '<div class="ai-timeline-item"><div class="ai-timeline-dot '+it.dotClass+'">'+(i+1)+'</div><div class="ai-timeline-card" style="cursor:default'+(it.pending?';opacity:.55':'')+'"><div class="ai-timeline-card-title">'+label+'</div><div class="ai-timeline-chips">'+chips+'</div></div></div>';
    }).join('')
    +'</div>'
    +'<div style="display:flex;gap:10px;justify-content:center">'
    +'<button class="btn btn-secondary" onclick="'+backAction+'">'+backLabel+'</button>'
    +actionButtons
    +'</div>'
    +'</div>';
  if(!showSidePanel){
    return '<div class="ep-page" style="max-width:680px;margin:20px auto 0;text-align:center">'+card+'</div>';
  }
  return '<div class="ep-page" style="max-width:1040px;margin:20px auto 0">'
    +'<div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap">'
    +'<div style="flex:1 1 420px;text-align:center">'+card+'</div>'
    +'<div style="flex:1 1 420px">'+sidePanelHTML+'</div>'
    +'</div></div>';
}
function buildAIProposalWaitingApprovalHTML(){
  const d=aiProposalDraft||{};
  const rec=contractsData.find(function(c){return c.id===d.contractRecordId;})||{};
  if(d.runId)aiUpsertRun('contract-creation',d.runId,{client:d.name,country:d.country,contractType:d.type,currentStepIdx:2,status:'Waiting for Approval',lastActivity:'Just now'});
  return buildAIWaitingApprovalHTML({
    description:'We\'ve notified <strong style="color:var(--navy)">'+aiDealManager.name+'</strong> (Deal Manager) to review proposal <strong>'+d.proposalId+'</strong> for <strong>'+d.name+'</strong>. Once approved, this journey will automatically continue to contract generation.',
    entityUserDescription:'Proposal <strong>'+d.proposalId+'</strong> for <strong>'+d.name+'</strong> is ready for your review. Approve it to continue to contract generation, or notify your <strong style="color:var(--navy)">Entity Admin</strong> if you\'d like a second opinion.',
    timelineItems:[
      {label:'Proposal Created',dotClass:'ai',chips:[{cls:'ai-chip-ai',label:'AI Automated'}]},
      {label:'Waiting for '+aiDealManager.name+'\'s Approval',dotClass:'human',chips:[{cls:'ai-chip-human',label:'Human Required'},{cls:'ai-chip-approval',label:'Approval Required'}]},
      {label:'Contract Generation (pending)',dotClass:'system',chips:[{cls:'ai-chip-system',label:'System Action'}],pending:true}
    ],
    onApprove:'aiSimulateApproval()',
    approveLabel:'Simulate: '+aiDealManager.name+' Approves',
    approvalPanelHTML:buildAIProposalApprovalDataHTML(d,rec),
    managerName:aiDealManager.name,
    noteContextLabel:'Proposal approval — '+(d.name||'Employee'),
    noteRefId:d.proposalId||''
  });
}
function buildAIContractAwaitingSignatureHTML(){
  const rec=contractsData.find(function(c){return c.id===aiCreatedContractId;})||{};
  const pd=aiProposalDraft||{};
  const empName=rec.empName||pd.name||'the employee';
  if(pd.runId)aiUpsertRun('contract-creation',pd.runId,{client:pd.name,country:pd.country,contractType:pd.type,currentStepIdx:4,status:'Waiting for Approval',lastActivity:'Just now'});
  const docPanel=buildAIContractDocCardHTML(rec,pd);
  return buildAIWaitingApprovalHTML({
    backLabel:'Back to AI Executive',
    backAction:"page='ai-executive';renderADTPage()",
    description:'Contract <strong>'+(rec.contractId||'')+'</strong> has been countersigned by <strong style="color:var(--navy)">'+empName+'</strong> via Docuseal. We\'ve notified <strong style="color:var(--navy)">'+aiOpsManager.name+'</strong> (Ops Manager) to review the signed contract. Once approved, this journey will automatically continue to onboarding.',
    entityUserDescription:'The signed contract <strong>'+(rec.contractId||'')+'</strong> for <strong>'+empName+'</strong> is ready for your review. Approve it to continue to onboarding, or notify your <strong style="color:var(--navy)">Entity Admin</strong> if you\'d like a second opinion.',
    timelineItems:[
      {label:'Contract Generated',dotClass:'ai',chips:[{cls:'ai-chip-ai',label:'AI Automated'}]},
      {label:'Signature Received',dotClass:'client',chips:[{cls:'ai-chip-client',label:'Client Action'}]},
      {label:'Waiting for '+aiOpsManager.name+'\'s Approval',dotClass:'human',chips:[{cls:'ai-chip-human',label:'Human Required'},{cls:'ai-chip-approval',label:'Approval Required'}]},
      {label:'Onboarding (pending)',dotClass:'system',chips:[{cls:'ai-chip-system',label:'System Action'}],pending:true}
    ],
    onApprove:'aiSimulateContractApproval()',
    approveLabel:'Approve',
    approvalPanelHTML:docPanel,
    sidePanelHTML:docPanel,
    managerName:aiOpsManager.name,
    noteContextLabel:'Contract approval — '+empName,
    noteRefId:rec.contractId||''
  });
}
function aiSimulateContractApproval(){
  aiShowLoader('Approving Contract&hellip;',aiOpsManager.name+' is reviewing the signed contract');
  setTimeout(function(){
    if(notifData[0]&&notifData[0].pending)notifData[0].pending=false;
    if(aiCreatedContractId){
      const rec=contractsData.find(function(c){return c.id===aiCreatedContractId;});
      if(rec){
        rec.status='Contract Approved';
        const now=aiFormatNow();
        (ctLogsData[aiCreatedContractId]=ctLogsData[aiCreatedContractId]||[]).unshift({date:now.date,time:now.time,user:aiOpsManager.name,status:'Contract Approved',action:aiOpsManager.name+' approved the signed contract.'});
        (ctWorkflowData[aiCreatedContractId]=ctWorkflowData[aiCreatedContractId]||[]).unshift({title:'Contract Approved',user:aiOpsManager.name,date:now.date,time:now.time,description:'Ops Manager approved the contract for '+rec.empName+'.'});
        showAiToast(aiOpsManager.name+' approved the contract',rec.empName?'Onboarding for '+rec.empName+' is starting':'Onboarding is starting');
      }
    }
    if(aiProposalDraft&&aiProposalDraft.runId)aiUpsertRun('contract-creation',aiProposalDraft.runId,{currentStepIdx:6,status:'In Progress',lastActivity:'Just now'});
    page='ai-onboarding-run';renderADTPage();aiCtStartOnboarding();
  },2000);
}
let aiContractEditMode=false;
function aiContractDocActionBarHTML(){
  if(aiContractEditMode){
    return '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;padding:10px 16px;background:#f1f5f9;border:1px solid #d1d5db;border-radius:10px">'
      +'<div style="font-size:12.5px;font-weight:600;color:#1a1a1a">Editing contract &mdash; make your changes below, then save.</div>'
      +'<button class="btn btn-success btn-sm" onclick="aiContractDocSave()">Save</button>'
      +'</div>';
  }
  return '<div style="display:flex;justify-content:flex-end;gap:10px;margin-bottom:14px">'
    +'<button class="btn btn-secondary btn-sm" onclick="aiContractDocEdit()">Edit</button>'
    +'<button class="action-btn action-approve btn-sm" onclick="aiContractDocApprove()">Approve</button>'
    +'</div>';
}
function aiContractDocEdit(){
  aiContractEditMode=true;
  const body=document.getElementById('ai-contract-doc-body');
  if(body){body.setAttribute('contenteditable','true');body.classList.add('adt-doc-editing');}
  const bar=document.getElementById('ai-contract-doc-actionbar');
  if(bar)bar.innerHTML=aiContractDocActionBarHTML();
}
function aiContractDocSave(){
  aiContractEditMode=false;
  const body=document.getElementById('ai-contract-doc-body');
  if(body){body.removeAttribute('contenteditable');body.classList.remove('adt-doc-editing');}
  const bar=document.getElementById('ai-contract-doc-actionbar');
  if(bar)bar.innerHTML=aiContractDocActionBarHTML();
  showAiToast('Contract updated','Your edits have been saved to the draft contract');
}
function aiContractDocApprove(){
  aiContractEditMode=false;
  aiSendContractForApproval();
}
function buildAIContractDocCardHTML(rec,d,opts){
  rec=rec||{};d=d||{};opts=opts||{};
  const now=aiFormatNow();
  const entity='ADT '+(rec.country||d.country||'Netherlands')+(rec.type==='PEO'?' PEO Services B.V.':' EOR Services B.V.');
  const signed=!!(rec.signedAt||['Contract Signed','Contract Approved','Onboarding','Ready for Payroll'].indexOf(rec.status)>-1);
  const sigLabel=signed?('Signed'+(rec.signedAt?' &middot; '+rec.signedAt:'')):'Pending';
  return '<div class="adt-doc-page'+(opts.editing?' adt-doc-editing':'')+'"'+(opts.id?' id="'+opts.id+'"':'')+(opts.editing?' contenteditable="true"':'')+' style="position:relative">'
    +(signed?'<div style="position:absolute;top:20px;right:20px;display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;background:#f0fdf4;border:1px solid #86efac;color:#15803d;font-size:11px;font-weight:700;letter-spacing:.3px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>VERIFIED</div>':'')
    +'<div class="adt-doc-header">'
    +'<div><div class="adt-doc-brand">ADT</div><div class="adt-doc-brand-sub">Global Employment Platform</div></div>'
    +'<div><div class="adt-doc-title">EMPLOYMENT AGREEMENT</div><div class="adt-doc-meta">Contract No. '+(rec.contractId||'—')+'<br>Issued '+now.date+'</div></div>'
    +'</div>'
    +'<div class="adt-doc-section">'
    +'<div class="adt-doc-section-title">Parties</div>'
    +'<div class="review-grid">'
    +'<div class="review-row"><div class="rr-label">Employer</div><div class="rr-val">'+entity+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Employee</div><div class="rr-val">'+(rec.empName||d.name||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Country of Employment</div><div class="rr-val">'+(rec.country||d.country||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Contract Type</div><div class="rr-val">'+(rec.type||d.type||'—')+'</div></div>'
    +'</div></div>'
    +'<div class="adt-doc-section">'
    +'<div class="adt-doc-section-title">Position &amp; Compensation</div>'
    +'<div class="review-grid">'
    +'<div class="review-row"><div class="rr-label">Job Title</div><div class="rr-val">'+(rec.jobTitle||d.jobTitle||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Employment Term</div><div class="rr-val">'+(rec.empDuration||'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Monthly Gross Pay</div><div class="rr-val">'+(rec.payAmount?rec.payAmount+' '+(rec.currency||''):'—')+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Pay Frequency</div><div class="rr-val">'+(rec.payFrequency||'Monthly')+'</div></div>'
    +'</div></div>'
    +'<div class="adt-doc-section">'
    +'<div class="adt-doc-section-title">Terms</div>'
    +'<p class="adt-doc-clause">This Employment Agreement ("Agreement") is entered into between '+entity+' ("Employer") and '+(rec.empName||d.name||'the Employee')+' ("Employee"), effective as of the date of countersignature below.</p>'
    +'<p class="adt-doc-clause">The Employee shall perform the duties of '+(rec.jobTitle||d.jobTitle||'the assigned role')+' in accordance with local labor law and the Employer\'s policies, and shall be compensated as set out above, payable in arrears on a '+(rec.payFrequency||'Monthly').toLowerCase()+' basis.</p>'
    +'<p class="adt-doc-clause">This Agreement is governed by the employment laws of '+(rec.country||d.country||'the country of employment')+'. Either party may terminate this Agreement in accordance with the statutory notice period applicable in that jurisdiction.</p>'
    +'</div>'
    +'<div class="adt-doc-sig-row">'
    +'<div class="adt-doc-sig-block">For and on behalf of '+entity+'<div class="adt-doc-sig-label">Authorized Signatory &middot; '+now.date+'</div></div>'
    +'<div class="adt-doc-sig-block">'+(signed?'<div style="font-family:\'Segoe Script\',\'Brush Script MT\',\'Lucida Handwriting\',cursive;font-size:26px;line-height:1;color:#1e3a5f;margin:-10px 0 4px;transform:rotate(-2deg);transform-origin:left bottom">'+(rec.empName||d.name||'Employee')+'</div>':'')+(rec.empName||d.name||'Employee')+'<div class="adt-doc-sig-label">Employee Signature &middot; '+sigLabel+'</div></div>'
    +'</div>'
    +'</div>';
}
function buildAIContractDocumentHTML(){
  const rec=contractsData.find(function(c){return c.id===aiCreatedContractId;})||{};
  const d=aiProposalDraft||{};
  return '<div style="padding:8px 0 24px">'
    +'<div id="ai-contract-doc-actionbar">'+aiContractDocActionBarHTML()+'</div>'
    +buildAIContractDocCardHTML(rec,d,{editing:aiContractEditMode,id:'ai-contract-doc-body'})
    +'</div>';
}
function aiSendContractForApproval(){
  const empName=(aiProposalDraft&&aiProposalDraft.name)||'the employee';
  aiShowLoader('Sending for Signature&hellip;','Generating the contract and routing it to '+empName+' for countersignature via Docuseal');
  if(aiCreatedContractId){
    const rec=contractsData.find(function(c){return c.id===aiCreatedContractId;});
    if(rec){
      const now=aiFormatNow();
      rec.status='Contract Sent';
      (ctLogsData[aiCreatedContractId]=ctLogsData[aiCreatedContractId]||[]).unshift({date:now.date,time:now.time,user:'AI Contract Assistant',status:'Contract Sent',action:'Contract generated and sent to '+empName+' for countersignature via Docuseal.'});
    }
  }
  setTimeout(function(){
    aiShowLoader('Awaiting Client Signature&hellip;','Simulating '+empName+' opening the Docuseal link, reviewing the contract, and countersigning it&hellip;');
    setTimeout(function(){
      if(aiCreatedContractId){
        const rec=contractsData.find(function(c){return c.id===aiCreatedContractId;});
        if(rec){
          const now=aiFormatNow();
          rec.status='Contract Signed';
          rec.signedAt=now.date+' '+now.time;
          (ctLogsData[aiCreatedContractId]=ctLogsData[aiCreatedContractId]||[]).unshift({date:now.date,time:now.time,user:empName,status:'Contract Signed',action:empName+' countersigned via Docuseal.'});
          (ctWorkflowData[aiCreatedContractId]=ctWorkflowData[aiCreatedContractId]||[]).unshift({title:'Signature Received',user:empName,date:now.date,time:now.time,description:empName+' countersigned the contract. Routing to '+aiOpsManager.name+' for final approval.'});
        }
      }
      notifData.unshift({name:'Contract signed — pending approval for '+empName,cid:aiCreatedContractId||'',time:'Just now',pending:true});
      showAiToast('Contract countersigned',empName+' has signed — routing to '+aiOpsManager.name+' for approval');
      page='ai-contract-awaiting-signature';renderADTPage();
    },2200);
  },1500);
}
let aiCtOnboardingStep=-1;
const aiCtOnboardingSteps=[
  {label:'Documents',running:'Collecting onboarding documents…',type:'ai'},
  {label:'Compliance Checks',running:'Running compliance checks…',type:'ai'},
  {label:'System Access Provisioning',running:'Provisioning system access…',type:'ai'}
];
function aiCtStartOnboarding(){
  aiCtOnboardingStep=0;
  if(aiCreatedContractId){
    const rec=contractsData.find(function(c){return c.id===aiCreatedContractId;});
    if(rec)rec.status='Onboarding';
  }
  aiCtRunOnboardingStep();
}
function aiCtRunOnboardingStep(){
  const step=aiCtOnboardingSteps[aiCtOnboardingStep];
  if(!step){
    if(aiCreatedContractId){
      const rec=contractsData.find(function(c){return c.id===aiCreatedContractId;});
      if(rec)rec.status='Ready for Payroll';
    }
    if(aiProposalDraft&&aiProposalDraft.runId)aiUpsertRun('contract-creation',aiProposalDraft.runId,{currentStepIdx:7,status:'Completed',lastActivity:'Just now'});
    page='ai-journey-complete';renderADTPage();
    return;
  }
  setTimeout(function(){
    aiCtOnboardingStep++;
    navigatePage('ai-onboarding-run');
    aiCtRunOnboardingStep();
  },3200);
}
// -- Contract Creation onboarding: same 3-step timeline as before, but the currently-running step now
// renders a detail card (documents checklist / country compliance rules / systems provisioned) instead of
// a flat spinner line, matching the Hire to Retire journey's Compliance Checks / Leave Policy steps. --
function aiCtOnboardingStepDetailHTML(idx,rec){
  if(idx===0){
    const docs=[
      {label:'Government ID Proof',note:'Passport, national ID, or driver\'s license'},
      {label:'Proof of Address',note:'Utility bill or bank statement, last 3 months'},
      {label:'Educational Certificates',note:'Highest qualification certificate'},
      {label:'Bank Account Details',note:'For payroll disbursement'},
      {label:'Signed Employment Contract',note:'Countersigned agreement copy'}
    ];
    const rows=docs.map(function(d){return '<div class="ea-req-row"><div><div class="ea-req-label">'+d.label+'</div><div class="ea-req-time">'+d.note+'</div></div><span style="display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:#b45309"><span class="cl-spinner" style="width:12px;height:12px;border-width:2px"></span>Verifying</span></div>';}).join('');
    return '<div class="ai-timeline-card-desc" style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span class="cl-spinner" style="width:13px;height:13px;border-width:2px"></span>Collecting onboarding documents&hellip;</div>'
      +'<div class="ea-req-list">'+rows+'</div>';
  }
  if(idx===1){
    const compliance=aiH2rCountryData[rec.country]||aiH2rCountryData['India'];
    return '<div class="ai-timeline-card-desc" style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span class="cl-spinner" style="width:13px;height:13px;border-width:2px"></span>Fetching from Compliance Hub&hellip;</div>'
      +'<div class="review-grid" style="grid-template-columns:1fr">'
      +aiDrawerRow('Country Rate Rules',compliance.rateRules)
      +aiDrawerRow('Statutory Requirements',compliance.statutory)
      +aiDrawerRow('Tax Bands',compliance.taxBand)
      +'</div>';
  }
  const systems=[
    {label:'Email & Workspace',note:'Google Workspace account created'},
    {label:'HRMS Access',note:'Provisioned in Keka'},
    {label:'Payroll System',note:'Mapped to ADT Payroll'},
    {label:'Collaboration Tools',note:'Slack invite sent'}
  ];
  const rows=systems.map(function(s){return '<div class="ea-req-row"><div><div class="ea-req-label">'+s.label+'</div><div class="ea-req-time">'+s.note+'</div></div><span class="status-pill active">Granted</span></div>';}).join('');
  return '<div class="ai-timeline-card-desc" style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span class="cl-spinner" style="width:13px;height:13px;border-width:2px"></span>Provisioning system access&hellip;</div>'
    +'<div class="ea-req-list">'+rows+'</div>';
}
function buildAICtOnboardingTimelineHTML(){
  const rec=contractsData.find(function(c){return c.id===aiCreatedContractId;})||{};
  return aiCtOnboardingSteps.map(function(step,i){
    let dotClass,body;
    if(i<aiCtOnboardingStep){
      dotClass='run-done';
      body='<div class="ai-timeline-card-desc">Completed</div>';
    }else if(i===aiCtOnboardingStep){
      dotClass='run-current';
      body=aiCtOnboardingStepDetailHTML(i,rec);
    }else{
      dotClass='run-pending';
      body='<div class="ai-timeline-card-desc" style="color:#cbd5e1">Waiting&hellip;</div>';
    }
    return '<div class="ai-timeline-item">'
      +'<div class="ai-timeline-dot '+dotClass+'">'+(i<aiCtOnboardingStep?'&#10003;':(i+1))+'</div>'
      +'<div class="ai-timeline-card" style="cursor:default">'
      +'<div class="ai-timeline-card-head"><span class="ai-timeline-card-title">'+step.label+'</span></div>'
      +body
      +'</div></div>';
  }).join('');
}
function buildAIOnboardingRunHTML(){
  return '<div class="ep-page" style="max-width:680px;margin:0 auto">'
    +'<div class="ai-timeline">'+buildAICtOnboardingTimelineHTML()+'</div>'
    +'</div>';
}
function buildAIJourneyCompleteHTML(){
  const rec=contractsData.find(function(c){return c.id===aiCreatedContractId;})||{};
  const emp=aiCtJourneyEmployee||{};
  const empRows=aiDrawerRow('Name',emp.name||rec.empName||'—')
    +aiDrawerRow('Employee ID',emp.empId||'—')
    +aiDrawerRow('Country',emp.country||rec.country||'—')
    +aiDrawerRow('Job Title',emp.jobTitle||rec.jobTitle||'—')
    +aiDrawerRow('Status',emp.status||'Active');
  const contractRows=aiDrawerRow('Contract No.',rec.contractId||'—')
    +aiDrawerRow('Contract Type',rec.type||'—')
    +aiDrawerRow('Proposal ID',(aiProposalDraft&&aiProposalDraft.proposalId)||'—')
    +aiDrawerRow('Monthly Pay',rec.payAmount?rec.payAmount+' '+(rec.currency||''):'—')
    +aiDrawerRow('Status',rec.status||'Ready for Payroll');
  return '<div class="ep-page" style="max-width:680px;margin:20px auto 0">'
    +'<div class="success-card">'
    +'<div class="success-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>'
    +'<h2 style="font-size:20px;font-weight:700;margin-bottom:6px">Contract Creation Journey Complete</h2>'
    +'<p style="font-size:12.5px;color:var(--gray);margin-bottom:22px;max-width:420px;line-height:1.55">'+(emp.name||rec.empName||'The employee')+' has been onboarded and is ready for payroll. Here\'s a summary of everything AI put together.</p>'
    +'<div style="text-align:left;width:100%;max-width:460px">'
    +'<div class="review-section"><div class="review-title">Employee Details</div><div class="review-grid" style="grid-template-columns:1fr">'+empRows+'</div></div>'
    +'<div class="review-section"><div class="review-title">Contract Details</div><div class="review-grid" style="grid-template-columns:1fr">'+contractRows+'</div></div>'
    +'</div>'
    +'<div style="display:flex;gap:10px;margin-top:6px">'
    +'<button class="btn btn-secondary" onclick="navigatePage(\'contracts\')">View in Contracts</button>'
    +'<button class="btn btn-primary" onclick="addListingItem(\'contracts\')">Start Another</button>'
    +'</div>'
    +'</div></div>';
}
// -- ACTIVE AUTOMATION / RUN DETAIL --
function aiRunStepStatus(run,idx){
  if(run.status==='Completed')return 'done';
  if(idx<run.currentStepIdx)return 'done';
  if(idx===run.currentStepIdx)return run.status==='Exception'?'exception':'current';
  return 'pending';
}
function aiRunCounts(run,journeyId){
  const events=aiJourneyEvents[journeyId||selectedAIJourneyId]||[];
  let aiCompleted=0,humanPending=0;
  events.forEach(function(e,i){
    const st=aiRunStepStatus(run,i);
    if(st==='done'&&e.chips.includes('AI Automated'))aiCompleted++;
    if(st==='current'||st==='exception')humanPending++;
  });
  return {aiCompleted:aiCompleted,humanPending:humanPending};
}
function aiRunStatusPillClass(status){return status==='Active'?'active':status==='Waiting for Approval'?'pending':status==='Exception'?'inactive':status==='Completed'?'approved':'draft';}
function viewAIActiveAutomation(journeyId){
  if(!activePersonaCanAccessJourney(journeyId)){
    navigatePage('ai-executive');
    showAiToast('Journey hidden for this role','Only journeys owned by '+portalRoleLabel(portalRole)+' are available here.');
    return;
  }
  selectedAIJourneyId=journeyId;navigatePage('ai-active-automation');
}
function viewAIRun(runId){selectedAIRunId=runId;aiRunDetailBackTo=page;navigatePage('ai-run-detail');}
function viewAIRunTask(runId,journeyId){navigatePage('my-tasks');openMyTaskAction(runId,journeyId);}

// -- Cross-journey pending-task tracking: live-run flows (H2R/Payroll/Contract) upsert into aiAutomationRuns here --
function aiUpsertRun(journeyId,runId,patch){
  const runs=aiAutomationRuns[journeyId]=aiAutomationRuns[journeyId]||[];
  let run=runs.find(function(r){return r.runId===runId;});
  if(!run){run={runId:runId};runs.unshift(run);}
  Object.assign(run,patch);
  return run;
}
function findAiRunJourneyId(runId){
  return Object.keys(aiAutomationRuns).find(function(jid){return (aiAutomationRuns[jid]||[]).some(function(r){return r.runId===runId;});})||null;
}
// -- Dispatch a notification-bell click to wherever that run actually lives: MAN- runs get the manual preview modal, agent/hybrid RUN- runs open My Tasks with the task panel already selected (previously a dead click — getManualRun only knows about MAN- runs). --
function openNotifiedRun(runId){
  if(String(runId).indexOf('MAN-')===0){openManualRunPreviewModal(runId);return;}
  const journeyId=findAiRunJourneyId(runId);if(!journeyId)return;
  navigatePage('my-tasks');
  openMyTaskAction(runId,journeyId);
}
function aiAllPendingRuns(){
  if(portalRole==='entity-user'){
    return personaOwnedRunItems(getActivePersona()).map(function(it){return {run:it.run,journey:it.journey};});
  }
  const out=[];
  Object.keys(aiAutomationRuns).forEach(function(jid){
    const j=aiJourneys.find(function(x){return x.id===jid;});if(!j)return;
    (aiAutomationRuns[jid]||[]).forEach(function(r){
      if(r.status==='Waiting for Approval'||r.status==='Exception')out.push({run:r,journey:j});
    });
  });
  out.sort(function(a,b){return (a.run.status==='Exception'?0:1)-(b.run.status==='Exception'?0:1);});
  return out;
}
function entityAccessRequestsPending(){
  return entityRequests.filter(function(r){return r.type!=='manager-notify'&&r.type!=='journey-request-to-admin'&&r.status==='Pending';});
}
function managerNotifyPending(){
  return entityRequests.filter(function(r){return r.type==='manager-notify'&&r.status==='Pending'&&r.clientId==='dhi-hyperlocal';});
}
function journeyRequestsToAdminPending(){
  return entityRequests.filter(function(r){return r.type==='journey-request-to-admin'&&r.status==='Pending'&&r.clientId==='dhi-hyperlocal';});
}
function myTasksPendingCount(){
  if(portalRole==='super-admin')return entityAccessRequestsPending().length;
  if(portalRole==='entity-admin')return managerNotifyPending().length+journeyRequestsToAdminPending().length;
  return aiAllPendingRuns().length+myPendingManualRuns(activePersonaId).length;
}
// -- Renders the requester's avatar, so it's clear at a glance who sent a request --
function requesterAvatarHTML(requestedBy){
  const p=requesterProfile(requestedBy);
  return '<span class="user-avatar-sm req-avatar" style="width:32px;height:32px;font-size:12px;flex-shrink:0" title="'+p.name+(p.role?' · '+p.role:'')+'">'+p.initials+'</span>';
}
function requesterCaptionHTML(requestedBy){
  const p=requesterProfile(requestedBy);
  return '<div class="ea-req-requester">'+p.name+(p.role?' <span class="req-by-role">('+p.role+')</span>':'')+'</div>';
}
function buildEntityAdminMyTasksHTML(){
  const journeyReqs=entityRequests.filter(function(r){return r.type==='journey-request-to-admin'&&r.clientId==='dhi-hyperlocal';});
  const journeyRows=journeyReqs.map(function(r){
    const isPending=r.status==='Pending';
    const actions=isPending
      ?'<div class="sa-req-actions"><button class="sa-req-btn sa-req-approve" onclick="approveJourneyRequestAsAdmin(\''+r.id+'\')">Approve</button><button class="sa-req-btn sa-req-reject" onclick="declineJourneyRequest(\''+r.id+'\')">Decline</button></div>'
      :'<span class="status-pill '+statusClass(r.status)+'">'+r.status+'</span>';
    return '<div class="ea-task-row"><div class="ea-task-who">'+requesterAvatarHTML(r.requestedBy)+requesterCaptionHTML(r.requestedBy)+'</div><div class="ea-task-what"><div class="ea-task-label">Activate &ldquo;'+r.label+'&rdquo;</div></div><div class="ea-task-when">'+r.timestamp+'</div><div class="ea-task-actions">'+actions+'</div></div>';
  }).join('');
  const journeyCard=journeyReqs.length?'<div class="setup-card" style="margin-bottom:16px"><div class="setup-title">Journey Requests</div><div class="setup-sub" style="margin-bottom:14px">Your Entity User is asking to unlock these &mdash; approve to activate immediately, or decline.</div><div class="ea-req-list">'+journeyRows+'</div></div>':'';
  const sentReqs=entityRequests.filter(function(r){return r.clientId==='dhi-hyperlocal'&&r.type!=='manager-notify'&&r.type!=='journey-request-to-admin';});
  const sentRows=sentReqs.map(function(r){
    return '<div class="ea-task-row"><div class="ea-task-who">'+requesterAvatarHTML(r.requestedBy)+requesterCaptionHTML(r.requestedBy)+'</div><div class="ea-task-what"><div class="ea-task-label">'+r.label+'</div></div><div class="ea-task-when">'+r.timestamp+'</div><div class="ea-task-actions"><span class="status-pill '+statusClass(r.status)+'">'+r.status+'</span></div></div>';
  }).join('');
  const sentBody=sentReqs.length?sentRows:'<div class="ea-req-empty">No requests yet &mdash; activate a system or journey to see status here.</div>';
  const notes=entityRequests.filter(function(r){return r.type==='manager-notify'&&r.clientId==='dhi-hyperlocal';});
  const noteRows=notes.map(function(r){
    const isPending=r.status==='Pending';
    const actions=isPending
      ?'<button class="sa-req-btn sa-req-approve" onclick="resolveManagerNotify(\''+r.id+'\')">Review in Contract</button>'
      :'<span class="status-pill '+(r.status==='Rejected'?'rejected':'approved')+'">'+(r.status==='Rejected'?'Rejected':'Reviewed')+'</span>';
    return '<div class="ea-task-row"><div class="ea-task-who">'+requesterAvatarHTML(r.requestedBy)+requesterCaptionHTML(r.requestedBy)+'</div><div class="ea-task-what"><div class="ea-task-label">'+r.label+'</div>'+(r.note?'<div class="ea-task-note" style="color:var(--navy)">'+r.note+'</div>':'')+'</div><div class="ea-task-when">'+r.timestamp+'</div><div class="ea-task-actions">'+actions+'</div></div>';
  }).join('');
  const noteBody=notes.length?noteRows:'<div class="ea-req-empty">No notes yet &mdash; if your Entity User flags an approval for a second opinion, it\'ll show up here.</div>';
  return '<div class="ai-exec-page">'
    +'<p style="font-size:14px;font-weight:600;margin-bottom:4px">My Tasks</p>'
    +'<p style="font-size:12px;color:var(--gray);margin-bottom:20px">Journey requests to review and approve, requests you\'ve sent to Super Admin, plus approvals your Entity User has flagged for a second opinion.</p>'
    +journeyCard
    +'<div class="setup-card" style="margin-bottom:16px"><div class="setup-title">Your Requests to Super Admin</div><div class="setup-sub" style="margin-bottom:14px">Systems and journeys you\'ve asked Super Admin to activate for your entity.</div><div class="ea-req-list">'+sentBody+'</div></div>'
    +'<div class="setup-card"><div class="setup-title">Notes from Entity User</div><div class="setup-sub" style="margin-bottom:14px">Approvals flagged for your review &mdash; day-to-day journey approvals stay with whoever is running them.</div><div class="ea-req-list">'+noteBody+'</div></div>'
    +'</div>';
}
function buildSuperAdminMyTasksHTML(){
  const pending=entityAccessRequestsPending();
  if(mtReqSelectedId&&!pending.some(function(r){return r.id===mtReqSelectedId;}))mtReqSelectedId=null;
  const rows=pending.map(function(r){
    return '<div class="ea-task-row" id="mt-req-row-'+r.id+'"'+(mtReqSelectedId===r.id?' style="background:#f1f5f9"':'')+'><div class="ea-task-who">'+requesterAvatarHTML(r.requestedBy)+requesterCaptionHTML(r.requestedBy)+'</div><div class="ea-task-what"><div class="ea-task-label">'+r.label+'</div><div class="ea-task-note">'+r.entity+'</div></div><div class="ea-task-when">'+r.timestamp+'</div>'
      +'<div class="ea-task-actions sa-req-actions"><button class="sa-req-btn sa-req-approve" onclick="openMyTaskDetail(\''+r.id+'\')">Approve</button><button class="sa-req-btn sa-req-reject" onclick="rejectEntityRequest(\''+r.id+'\')">Reject</button></div></div>';
  }).join('');
  const body=pending.length?rows:'<div class="ea-req-empty">No pending requests right now &mdash; requests to enable a system, agent, or journey will show up here.</div>';
  const sbInner=mtReqSelectedId?renderMyTaskDetailPanel(mtReqSelectedId):'';
  return '<div class="ai-exec-page">'
    +'<p style="font-size:14px;font-weight:600;margin-bottom:4px">My Tasks</p>'
    +'<p style="font-size:12px;color:var(--gray);margin-bottom:20px">Requests from Entity Admins and Entity Users to enable a system, agent, or journey &mdash; waiting on your approval.</p>'
    +'<div class="lp-split-wrap"><div class="lp-split-main"><div class="setup-card" style="border:none;border-radius:0;box-shadow:none"><div class="ea-req-list">'+body+'</div></div></div>'
    +'<div class="lp-split-sb'+(mtReqSelectedId?' open':'')+'" id="mt-req-sb"><div class="lp-isb" id="mt-req-sb-inner">'+sbInner+'</div></div>'
    +'</div></div>';
}
// -- SUPER ADMIN: My Tasks — read-only snapshot of a client's built journeys, for context before approving a new request --
function renderClientJourneysContextHTML(clientId){
  const journeys=aiClientJourneys.filter(function(cj){return cj.clientId===clientId;});
  if(!journeys.length)return '<div class="ea-req-empty">No journeys have been built for this client yet.</div>';
  return journeys.map(function(cj){
    const j=aiJourneys.find(function(x){return x.id===cj.journeyId;});if(!j)return '';
    const events=aiJourneyEvents[cj.journeyId]||[];
    const rows=events.map(function(e,i){
      return '<div class="ai-scope-row ai-scope-row-manual"><div class="ai-scope-name"><div class="ai-scope-name-text">'+(i+1)+'. '+e.name+'</div><div class="ai-timeline-chips">'+aiChips(e.chips)+'</div></div></div>';
    }).join('');
    return '<div class="ep-form-card" style="margin-bottom:14px">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;gap:10px"><div style="font-size:14px;font-weight:700;color:var(--navy)">'+j.name+'</div><span class="status-pill '+(cj.status==='Active'?'active':'draft')+'">'+cj.status+'</span></div>'
      +'<div style="font-size:11.5px;color:var(--gray);margin-bottom:12px">Built '+cj.builtOn+' &middot; '+events.length+' steps &middot; '+j.category+'</div>'
      +'<div class="ai-scope-table">'+rows+'</div>'
      +'</div>';
  }).join('');
}
// -- SUPER ADMIN: My Tasks — slide-in detail panel for a single access request, tabbed like the AI Executive client sidebar --
function renderMyTaskDetailPanel(reqId){
  const r=entityRequests.find(function(x){return x.id===reqId;});
  if(!r)return '';
  const c=aiClients.find(function(x){return x.id===r.clientId;});
  const tabs=[{id:'journeys',label:'Journeys'},{id:'request',label:'Request (1)'}];
  const tabBar='<div class="lp-isb-tabbar">'
    +'<button class="lp-isb-nav-btn" onclick="scrollTabRow(\'left\',\'mt-isb-tabs\')" title="Scroll left"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<div class="lp-isb-tabs" id="mt-isb-tabs">'+tabs.map(function(t){return '<button class="lp-isb-tab'+(mtReqTab===t.id?' active':'')+'" onclick="mtReqNavTab(\''+t.id+'\')">'+t.label+'</button>';}).join('')+'</div>'
    +'<button class="lp-isb-nav-btn nav-right" onclick="scrollTabRow(\'right\',\'mt-isb-tabs\')" title="Scroll right"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>'
    +'<div class="lp-isb-right"><button class="lp-isb-close" onclick="closeMyTaskDetail()" title="Close"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'</div>';
  const header='<div style="padding-bottom:14px;margin-bottom:16px;border-bottom:1px solid var(--border)">'
    +'<div style="font-size:16px;font-weight:700;color:var(--navy)">'+(c?c.name:r.entity)+'</div>'
    +(c?'<div style="font-size:12px;color:var(--gray);margin-top:3px">'+c.country+' &middot; '+c.plan+' Plan &middot; '+c.employees+' employees</div>':'')
    +'</div>';
  let body;
  if(mtReqTab==='journeys'){
    body=renderClientJourneysContextHTML(r.clientId);
  }else{
    const infoCard='<div class="ep-form-card">'
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">'+requesterAvatarHTML(r.requestedBy)+'<div>'+requesterCaptionHTML(r.requestedBy)+'<div style="font-size:11.5px;color:var(--gray);margin-top:2px">'+r.timestamp+'</div></div></div>'
      +'<div class="review-grid" style="grid-template-columns:1fr">'
      +'<div class="review-row"><div class="rr-label">Request</div><div class="rr-val" style="white-space:normal">'+r.label+'</div></div>'
      +'<div class="review-row"><div class="rr-label">Entity</div><div class="rr-val" style="white-space:normal">'+r.entity+'</div></div>'
      +(r.note?'<div class="review-row"><div class="rr-label">Note</div><div class="rr-val" style="white-space:normal;font-weight:500">'+r.note+'</div></div>':'')
      +'</div></div>';
    const actionPanel='<div class="ep-form-card" style="margin-top:14px">'
      +'<div style="font-size:11.5px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">Current Action Required</div>'
      +'<div style="font-size:12px;color:var(--gray);line-height:1.6;margin-bottom:18px">Approving activates this immediately for '+r.entity+'. Reject if it needs more information first.</div>'
      +'<button class="action-btn action-approve" style="width:100%;margin-bottom:8px" onclick="approveEntityRequest(\''+r.id+'\');closeMyTaskDetail()">Approve</button>'
      +'<button class="action-btn action-reject" style="width:100%" onclick="rejectEntityRequest(\''+r.id+'\');closeMyTaskDetail()">Reject</button>'
      +'</div>';
    body=infoCard+actionPanel;
  }
  return tabBar+'<div class="lp-isb-body">'+header+body+'</div>';
}
function mtReqNavTab(tab){
  mtReqTab=tab;
  const inner=document.getElementById('mt-req-sb-inner');
  if(inner)inner.innerHTML=renderMyTaskDetailPanel(mtReqSelectedId);
}
function openMyTaskDetail(reqId){
  mtReqSelectedId=reqId;
  mtReqTab='journeys';
  const sb=document.getElementById('mt-req-sb');if(sb)sb.classList.add('open');
  const inner=document.getElementById('mt-req-sb-inner');if(inner)inner.innerHTML=renderMyTaskDetailPanel(reqId);
  document.querySelectorAll('.ea-task-row').forEach(function(row){row.style.background=row.id==='mt-req-row-'+reqId?'#f1f5f9':'';});
}
function closeMyTaskDetail(){
  mtReqSelectedId=null;
  const sb=document.getElementById('mt-req-sb');if(sb)sb.classList.remove('open');
  document.querySelectorAll('.ea-task-row').forEach(function(row){row.style.background='';});
}
function buildMyTasksPageHTML(){
  if(portalRole==='super-admin')return buildSuperAdminMyTasksHTML();
  if(portalRole==='entity-admin')return buildEntityAdminMyTasksHTML();
  const items=aiAllPendingRuns();
  if(mtTaskSelectedRunId&&!items.some(function(it){return it.run.runId===mtTaskSelectedRunId;}))mtTaskSelectedRunId=null;
  const mtDotsIco='<svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg>';
  const rows=items.map(function(it){
    const r=it.run,j=it.journey;
    const events=aiJourneyEvents[j.id]||[];
    const step=events[Math.min(r.currentStepIdx,events.length-1)];
    const isException=r.status==='Exception';
    const actionText=isException?(r.exceptionNote||'This run is blocked and needs review.'):('Waiting on: '+(step?step.name:'Review'));
    const sub=r.client+(r.country?' &middot; '+r.country:'')+(r.contractType?' &middot; '+r.contractType:'');
    return '<div class="cockpit-run-card mt-run-row'+(mtTaskSelectedRunId===r.runId?' mt-card-selected':'')+'" id="mt-run-row-'+r.runId+'" onclick="openMyTaskAction(\''+r.runId+'\',\''+j.id+'\')">'
      +'<div class="cockpit-run-head"><div class="cockpit-run-head-main"><div class="cockpit-run-id">'+j.name+'</div><div class="cockpit-run-entity">'+sub+'</div></div><span class="status-pill '+aiRunStatusPillClass(r.status)+'">'+r.status+'</span></div>'
      +'<div class="cockpit-run-mini-sub"><span>'+actionText+'</span></div>'
      +'<div class="cockpit-run-mini-sub" style="margin-top:8px"><span class="cell-sub">'+r.runId+' &middot; '+r.lastActivity+'</span><button class="lp-action-btn" onclick="event.stopPropagation();openMyTaskAction(\''+r.runId+'\',\''+j.id+'\')" title="Open task">'+mtDotsIco+'</button></div>'
      +'</div>';
  }).join('');
  const body=items.length
    ?'<div class="cockpit-run-list">'+rows+'</div>'
    :'<div style="text-align:center;color:var(--gray);font-size:12.5px;padding:40px">No pending tasks right now &mdash; journeys you run will show up here if they need your approval or attention.</div>';
  const sbInner=mtTaskSelectedRunId?renderMyTaskActionPanel(mtTaskSelectedRunId,items.find(function(it){return it.run.runId===mtTaskSelectedRunId;}).journey.id):'';
  return '<div class="ai-exec-page">'
    +'<p style="font-size:14px;font-weight:600;margin-bottom:4px">My Tasks</p>'
    +'<p style="font-size:12px;color:var(--gray);margin-bottom:20px">Every journey run across Contract Creation, Payroll, and Hire to Retire that is waiting on your approval or needs attention.</p>'
    +'<div style="margin-bottom:20px">'+buildMyPendingManualTasksHTML()+'</div>'
    +'<div class="lp-split-wrap"><div class="lp-split-main" style="background:transparent;border:none">'+body+'</div>'
    +'<div class="lp-split-sb'+(mtTaskSelectedRunId?' open':'')+'" id="mt-task-sb"><div class="lp-isb" id="mt-task-sb-inner">'+sbInner+'</div></div>'
    +'</div>'
    +'</div>';
}
// -- ENTITY USER: My Tasks — slide-in task panel for a single run, sectioned into Action Needed / Journey Steps / Backend Activity --
function renderMyTaskActionPanel(runId,journeyId){
  const j=aiJourneys.find(function(x){return x.id===journeyId;});
  if(!j)return '';
  const runs=aiAutomationRuns[journeyId]||[];
  const run=runs.find(function(r){return r.runId===runId;});
  if(!run)return '';
  const events=aiJourneyEvents[journeyId]||[];
  const topbar='<div class="lp-isb-tabbar"><div style="flex:1;display:flex;align-items:center;padding:0 16px;font-size:13px;font-weight:600;color:var(--navy)">Task Details</div>'
    +'<div class="lp-isb-right"><button class="lp-isb-close" onclick="closeMyTaskAction()" title="Close"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'</div>';
  const summary='<div style="padding-bottom:14px;margin-bottom:16px;border-bottom:1px solid var(--border)">'
    +'<div style="font-size:16px;font-weight:700;color:var(--navy)">'+j.name+' &mdash; '+run.client+'</div>'
    +'<div style="font-size:12px;color:var(--gray);margin-top:3px">'+(run.country||'')+(run.contractType?' &middot; '+run.contractType:'')+' &middot; Run ID '+run.runId+'</div>'
    +'<div style="margin-top:8px"><span class="status-pill '+aiRunStatusPillClass(run.status)+'">'+run.status+'</span></div>'
    +'</div>';

  const currentEvent=events[Math.min(run.currentStepIdx,events.length-1)];
  const nextEvent=events[run.currentStepIdx+1];
  const laterEvent=events[run.currentStepIdx+2];
  let actionBody;
  if(run.status==='Exception'){
    actionBody='<div style="font-size:12.5px;color:var(--navy);line-height:1.6;margin-bottom:18px">'+(run.exceptionNote||'This run is blocked and needs review.')+'</div>'
      +'<button class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:8px" onclick="mtResolveException(\''+run.runId+'\',\''+journeyId+'\')">Resolve Exception &amp; Continue</button>'
      +'<button class="btn btn-secondary" style="width:100%;justify-content:center" onclick="openAIEventDrawer(\''+journeyId+'\','+run.currentStepIdx+')">View Event Details</button>';
  }else if(run.status==='Waiting for Approval'){
    const aiSummary='AI has completed '+aiRunCounts(run,journeyId).aiCompleted+' events for '+run.client+' as part of the '+j.name+'. '+(currentEvent?currentEvent.name+' is required before the journey can continue.':'Review is required before the journey can continue.');
    actionBody='<div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:10px">'+(currentEvent?currentEvent.name:'Review pre-filled data')+'</div>'
      +'<div style="font-size:12px;color:var(--gray);line-height:1.6;margin-bottom:18px">'+aiSummary+'</div>'
      +'<button class="btn btn-secondary" style="width:100%;justify-content:center;margin-bottom:8px" onclick="openAIEventDrawer(\''+journeyId+'\','+run.currentStepIdx+')">Review Data</button>'
      +'<button class="action-btn action-approve" style="width:100%;margin-bottom:8px" onclick="mtApproveRunStep(\''+run.runId+'\',\''+journeyId+'\')">Approve and Continue</button>'
      +'<button class="action-btn action-reject" style="width:100%" onclick="mtRejectRunStep(\''+run.runId+'\',\''+journeyId+'\')">Reject / Send for Correction</button>';
  }else if(run.status==='Completed'){
    actionBody='<div style="font-size:12.5px;color:var(--gray);line-height:1.6">All '+events.length+' events completed. '+run.client+' &mdash; '+j.name+' finished successfully.</div>';
  }else{
    actionBody='<div style="font-size:12.5px;color:var(--gray);line-height:1.6">AI or the client is currently working on <strong style="color:var(--navy)">'+(currentEvent?currentEvent.name:'this step')+'</strong>. No action is needed right now &mdash; check back shortly.</div>';
  }
  const actionSection='<div class="ep-form-card" style="margin-bottom:14px">'
    +'<div class="ep-form-title">Action Needed</div>'+actionBody
    +'</div>';

  const timeline=events.map(function(e,i){
    const st=aiRunStepStatus(run,i);
    const icon=st==='done'?'&#10003;':st==='current'?'&#8987;':st==='exception'?'!':'&#9675;';
    return '<div class="ai-timeline-item">'
      +'<div class="ai-timeline-dot run-'+st+'">'+icon+'</div>'
      +'<div class="ai-timeline-card" onclick="openAIEventDrawer(\''+journeyId+'\','+i+')">'
      +'<div class="ai-timeline-card-head"><span class="ai-timeline-card-title">'+(i+1)+'. '+e.name+'</span></div>'
      +(st==='exception'?'<div class="ai-timeline-card-desc" style="color:#dc2626">'+(run.exceptionNote||'This step needs attention.')+'</div>':'<div class="ai-timeline-card-desc">'+e.desc+'</div>')
      +'<div class="ai-timeline-chips">'+aiChipsCompact(e.chips)+'</div>'
      +'</div></div>';
  }).join('');
  const stepsSection='<div class="ep-form-card" style="margin-bottom:14px"><div class="ep-form-title">Journey Steps</div><div class="ai-timeline" style="margin-top:14px">'+timeline+'</div></div>';

  const backendRow=function(label,ev,isCurrent){
    if(!ev)return '';
    const st=aiBackendStatusFor(ev,isCurrent,run.status);
    return '<div class="review-row"><div class="rr-label">'+label+'</div><div class="rr-val" style="display:flex;align-items:center;gap:8px;white-space:normal"><span>'+ev.source+'</span><span class="ai-chip '+aiBackendChipClass(st)+'">'+st+'</span></div></div>';
  };
  const backendSection='<div class="ep-form-card">'
    +'<div class="ep-form-title">Backend Activity</div>'
    +'<div class="review-grid" style="grid-template-columns:1fr">'
    +backendRow('Current',currentEvent,true)
    +backendRow('Next',nextEvent,false)
    +backendRow('Later',laterEvent,false)
    +'</div></div>';

  return topbar+'<div class="lp-isb-body">'+summary+actionSection+stepsSection+backendSection+'</div>';
}
function mtTaskRefresh(runId,journeyId){
  navigatePage('my-tasks');
  const stillPending=aiAllPendingRuns().some(function(it){return it.run.runId===runId;});
  if(stillPending)openMyTaskAction(runId,journeyId);
}
function mtApproveRunStep(runId,journeyId){
  const runs=aiAutomationRuns[journeyId]||[];
  const run=runs.find(function(r){return r.runId===runId;});if(!run)return;
  aiShowLoader('Continuing Journey&hellip;','Applying approval and running the next automated events for '+run.client,document.getElementById('mt-task-sb-inner'));
  setTimeout(function(){aiAdvanceRunPastAutoSteps(run,journeyId);run.lastActivity='Just now';mtTaskRefresh(runId,journeyId);},2000);
}
function mtRejectRunStep(runId,journeyId){
  const runs=aiAutomationRuns[journeyId]||[];
  const run=runs.find(function(r){return r.runId===runId;});if(!run)return;
  aiShowLoader('Sending Back for Correction&hellip;',run.client,document.getElementById('mt-task-sb-inner'));
  setTimeout(function(){run.lastActivity='Just now';mtTaskRefresh(runId,journeyId);},1700);
}
function mtResolveException(runId,journeyId){
  const runs=aiAutomationRuns[journeyId]||[];
  const run=runs.find(function(r){return r.runId===runId;});if(!run)return;
  aiShowLoader('Re-validating&hellip;','Re-checking data for '+run.client+' after correction',document.getElementById('mt-task-sb-inner'));
  setTimeout(function(){aiAdvanceRunPastAutoSteps(run,journeyId);run.lastActivity='Just now';mtTaskRefresh(runId,journeyId);},2000);
}
function openMyTaskAction(runId,journeyId){
  // -- Runs tied to a real contract record (e.g. RUN-4002/Lucas Dubois) resolve in the actual Workforce Operations record, not the standalone slide-in panel — route there the same way openComplianceHubForRun() does for Contract Creation runs. --
  const runs=aiAutomationRuns[journeyId]||[];
  const run=runs.find(function(r){return r.runId===runId;});
  if(run&&run.contractRecordId&&contractsData.some(function(c){return c.id===run.contractRecordId;})){
    navigatePage('contracts');
    openCtSidebar(run.contractRecordId,'compliance');
    return;
  }
  mtTaskSelectedRunId=runId;
  const sb=document.getElementById('mt-task-sb');if(sb)sb.classList.add('open');
  const inner=document.getElementById('mt-task-sb-inner');if(inner)inner.innerHTML=renderMyTaskActionPanel(runId,journeyId);
  document.querySelectorAll('.mt-run-row').forEach(function(row){row.classList.toggle('mt-card-selected',row.id==='mt-run-row-'+runId);});
}
function closeMyTaskAction(){
  mtTaskSelectedRunId=null;
  const sb=document.getElementById('mt-task-sb');if(sb)sb.classList.remove('open');
  document.querySelectorAll('.mt-run-row').forEach(function(row){row.classList.remove('mt-card-selected');});
}

function buildAIActiveAutomationHTML(){
  const j=aiJourneys.find(x=>x.id===selectedAIJourneyId)||aiJourneys[0];
  if(!activePersonaCanAccessJourney(j.id))return '<div class="ai-exec-page"><div class="setup-card"><div class="setup-title">Journey hidden for this role</div><div class="setup-sub">This Entity User role only sees journeys where it owns workflow steps.</div><button class="btn btn-primary btn-sm" onclick="navigatePage(\'ai-executive\')">Back to AI Executive</button></div></div>';
  const runs=aiAutomationRuns[j.id]||[];
  const cfg=aiAutomationConfigs[j.id];
  const totalRuns=runs.length;
  const exceptions=runs.filter(function(r){return r.status==='Exception';}).length;
  const successRate=totalRuns?Math.round((runs.filter(function(r){return r.status!=='Exception';}).length/totalRuns)*100):100;
  const rows=runs.map(function(r){
    const events=aiJourneyEvents[j.id]||[];
    const step=events[Math.min(r.currentStepIdx,events.length-1)];
    const counts=aiRunCounts(r,j.id);
    const lastStepName=events.length?events[events.length-1].name:'Completed';
    return '<tr style="cursor:pointer" onclick="viewAIRun(\''+r.runId+'\')">'
      +'<td><div class="cell-primary">'+r.client+'</div><div class="cell-sub">'+r.runId+'</div></td>'
      +'<td><div class="cell-primary">'+r.country+'</div><div class="cell-sub">'+r.contractType+'</div></td>'
      +'<td>'+(r.status==='Completed'?'Ready for Payroll':(step?step.name:'—'))+'</td>'
      +'<td><div class="ai-run-progress"><span class="ai-run-progress-ai">'+counts.aiCompleted+' AI</span><span class="ai-run-progress-human">'+counts.humanPending+' pending</span></div></td>'
      +'<td><span class="status-pill '+aiRunStatusPillClass(r.status)+'">'+r.status+'</span></td>'
      +'<td class="cell-sub">'+r.lastActivity+'</td>'
      +'<td onclick="event.stopPropagation()"><button class="btn btn-secondary btn-sm" onclick="viewAIRun(\''+r.runId+'\')">View Run</button></td>'
      +'</tr>';
  }).join('');
  return '<div class="ai-exec-page">'
    +'<button class="ep-cancel-btn" style="margin-bottom:14px" onclick="navigatePage(\'ai-journey-detail\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="15 18 9 12 15 6"/></svg> Back to '+j.name+'</button>'
    +'<p style="font-size:16px;font-weight:700;margin-bottom:4px">'+j.name+' Automation</p>'
    +'<p style="font-size:12px;color:var(--gray);margin-bottom:14px">Live view of every run this automation has triggered, and where each one currently stands.</p>'
    +'<div class="ai-run-meta">'
    +'<div class="ai-run-meta-item"><span class="ai-run-meta-label">Trigger</span><span class="ai-run-meta-val">'+(cfg&&cfg.trigger?cfg.trigger:'Trigger when proposal is approved')+'</span></div>'
    +'<div class="ai-run-meta-item"><span class="ai-run-meta-label">Entity</span><span class="ai-run-meta-val">'+(cfg&&cfg.entity?cfg.entity:'All ADT Entities')+'</span></div>'
    +'<div class="ai-run-meta-item"><span class="ai-run-meta-label">Country</span><span class="ai-run-meta-val">'+(cfg&&cfg.country?cfg.country:'Multiple Countries')+'</span></div>'
    +'<div class="ai-run-meta-item"><span class="ai-run-meta-label">Created by</span><span class="ai-run-meta-val">Pallavi Parate</span></div>'
    +'</div>'
    +'<div class="stat-grid" style="margin-bottom:20px">'
    +'<div class="stat-card"><div class="stat-label"><span>Automation Status</span></div><div class="stat-val" style="font-size:16px;color:#16a34a">Active</div></div>'
    +'<div class="stat-card"><div class="stat-label"><span>Total Runs</span></div><div class="stat-val">'+totalRuns+'</div></div>'
    +'<div class="stat-card"><div class="stat-label"><span>Success Rate</span></div><div class="stat-val" style="color:#16a34a">'+successRate+'%</div></div>'
    +'<div class="stat-card"><div class="stat-label"><span>Exceptions Pending</span></div><div class="stat-val" style="color:'+(exceptions?'#dc2626':'var(--navy)')+'">'+exceptions+'</div></div>'
    +'</div>'
    +'<div class="listing-card">'
    +'<table class="listing-table ai-run-table"><thead><tr>'
    +'<th>Client</th><th>Country &amp; Type</th><th>Current Step</th><th>Progress</th><th>Status</th><th>Last Activity</th><th>Action</th>'
    +'</tr></thead><tbody>'+rows+'</tbody></table>'
    +'</div></div>';
}

function aiBackendChipClass(status){
  const map={Fetching:'ai-chip-ai',Validating:'ai-chip-validation','Waiting for Human Approval':'ai-chip-human',Completed:'ai-chip-completed',Failed:'ai-chip-approval',Queued:'ai-chip-queued'};
  return map[status]||'ai-chip-queued';
}
function aiBackendStatusFor(event,isCurrent,runStatus){
  if(!isCurrent)return 'Queued';
  if(runStatus==='Exception')return 'Failed';
  if(event.chips.includes('Human Required')||event.chips.includes('Approval Required'))return 'Waiting for Human Approval';
  if(/valida/i.test(event.name))return 'Validating';
  return 'Fetching';
}
function buildAIRunDetailHTML(){
  const j=aiJourneys.find(x=>x.id===selectedAIJourneyId)||aiJourneys[0];
  const runs=aiAutomationRuns[j.id]||[];
  const run=runs.find(function(r){return r.runId===selectedAIRunId;})||runs[0];
  const events=aiJourneyEvents[j.id]||[];
  const timeline=events.map(function(e,i){
    const st=aiRunStepStatus(run,i);
    const icon=st==='done'?'&#10003;':st==='current'?'&#8987;':st==='exception'?'&#9888;':'&#9675;';
    return '<div class="ai-timeline-item">'
      +'<div class="ai-timeline-dot run-'+st+'">'+icon+'</div>'
      +'<div class="ai-timeline-card" style="cursor:pointer" onclick="openAIEventDrawer(\''+j.id+'\','+i+')">'
      +'<div class="ai-timeline-card-head"><span class="ai-timeline-card-title">'+e.name+'</span></div>'
      +(st==='exception'?'<div class="ai-timeline-card-desc" style="color:#dc2626">'+(run.exceptionNote||'This step needs attention.')+'</div>':'<div class="ai-timeline-card-desc">'+e.desc+'</div>')
      +'<div class="ai-timeline-chips">'+aiChipsCompact(e.chips)+'</div>'
      +'</div></div>';
  }).join('');

  const currentEvent=events[Math.min(run.currentStepIdx,events.length-1)];
  const nextEvent=events[run.currentStepIdx+1];
  const laterEvent=events[run.currentStepIdx+2];
  const backendRow=function(label,ev,isCurrent){
    if(!ev)return '';
    const st=aiBackendStatusFor(ev,isCurrent,run.status);
    return '<div class="review-row"><div class="rr-label">'+label+'</div><div class="rr-val" style="display:flex;align-items:center;gap:8px;white-space:normal"><span>'+ev.source+'</span><span class="ai-chip '+aiBackendChipClass(st)+'">'+st+'</span></div></div>';
  };
  const backendPanel='<div class="ep-form-card">'
    +'<div class="ep-form-title">Backend Activity</div>'
    +'<div class="review-grid" style="grid-template-columns:1fr">'
    +backendRow('Current',currentEvent,true)
    +backendRow('Next',nextEvent,false)
    +backendRow('Later',laterEvent,false)
    +'</div></div>';

  let actionPanel;
  if(run.status==='Completed'){
    const lastStepName=events.length?events[events.length-1].name:'Completed';
    actionPanel='<div class="ep-form-card" style="text-align:center;padding:32px 24px">'
      +'<div class="success-check" style="width:52px;height:52px;margin:0 auto 14px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="22" height="22"><polyline points="20 6 9 17 4 12"/></svg></div>'
      +'<div style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:6px">'+lastStepName+'</div>'
      +'<div style="font-size:12px;color:var(--gray);line-height:1.5">All '+events.length+' events completed. '+run.client+' &mdash; '+j.name+' finished successfully.</div>'
      +'</div>';
  }else if(run.status==='Exception'){
    actionPanel='<div class="ep-form-card">'
      +'<div style="font-size:11.5px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">Exception &mdash; Action Required</div>'
      +'<div style="font-size:12.5px;color:var(--navy);line-height:1.6;margin-bottom:18px">'+(run.exceptionNote||'This run is blocked and needs review.')+'</div>'
      +'<button class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:8px" onclick="aiResolveException(\''+run.runId+'\',\''+j.id+'\')">Resolve Exception &amp; Continue</button>'
      +'<button class="btn btn-secondary" style="width:100%;justify-content:center" onclick="openAIEventDrawer(\''+j.id+'\','+run.currentStepIdx+')">View Event Details</button>'
      +'</div>';
  }else if(run.status==='Waiting for Approval'){
    const aiSummary='AI has completed '+aiRunCounts(run,j.id).aiCompleted+' events for '+run.client+' as part of the '+j.name+'. '+(currentEvent?currentEvent.name+' is required before the journey can continue.':'Review is required before the journey can continue.');
    actionPanel='<div class="ep-form-card">'
      +'<div style="font-size:11.5px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">Current Action Required</div>'
      +'<div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:10px">'+(currentEvent?currentEvent.name:'Review pre-filled data')+'</div>'
      +'<div style="font-size:12px;color:var(--gray);line-height:1.6;margin-bottom:18px">'+aiSummary+'</div>'
      +'<button class="btn btn-secondary" style="width:100%;justify-content:center;margin-bottom:8px" onclick="openAIEventDrawer(\''+j.id+'\','+run.currentStepIdx+')">Review Data</button>'
      +'<button class="action-btn action-approve" style="width:100%;margin-bottom:8px" onclick="aiApproveRunStep(\''+run.runId+'\',\''+j.id+'\')">Approve and Continue</button>'
      +'<button class="action-btn action-reject" style="width:100%" onclick="aiRejectRunStep(\''+run.runId+'\',\''+j.id+'\')">Reject / Send for Correction</button>'
      +'</div>';
  }else{
    actionPanel='<div class="ep-form-card">'
      +'<div style="font-size:11.5px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">In Progress</div>'
      +'<div style="font-size:12.5px;color:var(--gray);line-height:1.6">AI or the client is currently working on <strong style="color:var(--navy)">'+(currentEvent?currentEvent.name:'this step')+'</strong>. No admin action is needed right now &mdash; check back shortly.</div>'
      +'</div>';
  }

  let backLabel,backAction;
  if(aiRunDetailBackTo==='my-tasks'){backLabel='Back to My Tasks';backAction="navigatePage('my-tasks')";}
  else if(aiRunDetailBackTo==='operations-cockpit'){backLabel='Back to Operations Cockpit';backAction="navigatePage('operations-cockpit')";}
  else if(aiRunDetailBackTo==='ai-active-automation'){backLabel='Back to '+j.name+' Automation';backAction="navigatePage('ai-active-automation')";}
  else{backLabel='Back to '+j.name;backAction="viewAIJourney('"+j.id+"'"+(aiJourneyDetailBackPage?",'"+aiJourneyDetailBackPage+"'":'')+")";}
  const mainContent='<button class="ep-cancel-btn" style="margin-bottom:14px" onclick="'+backAction+'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="15 18 9 12 15 6"/></svg> '+backLabel+'</button>'
    +'<p style="font-size:16px;font-weight:700;margin-bottom:4px">'+j.name+' &mdash; '+run.client+'</p>'
    +'<p style="font-size:12px;color:var(--gray);margin-bottom:20px">'+run.country+' &middot; '+run.contractType+' &middot; Run ID '+run.runId+' &middot; <span class="status-pill '+aiRunStatusPillClass(run.status)+'">'+run.status+'</span></p>'
    +'<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:20px;align-items:start">'
    +'<div><div class="ai-timeline" style="margin-bottom:20px">'+timeline+'</div>'+backendPanel+'</div>'
    +'<div>'+actionPanel+'</div>'
    +'</div>';
  return '<div class="ai-exec-page" style="max-width:1180px">'+mainContent+'</div>';
}

function aiAdvanceRunPastAutoSteps(run,journeyId){
  const events=aiJourneyEvents[journeyId||selectedAIJourneyId]||[];
  run.currentStepIdx++;
  while(run.currentStepIdx<events.length){
    const ev=events[run.currentStepIdx];
    const humanGate=ev.chips.includes('Human Required')||ev.chips.includes('Approval Required');
    if(humanGate)break;
    run.currentStepIdx++;
  }
  if(run.currentStepIdx>=events.length){run.status='Completed';run.currentStepIdx=events.length-1;}
  else{run.status='Waiting for Approval';}
}
function aiApproveRunStep(runId,journeyId){
  const runs=aiAutomationRuns[journeyId||selectedAIJourneyId]||[];
  const run=runs.find(function(r){return r.runId===runId;});if(!run)return;
  aiShowLoader('Continuing Journey&hellip;','Applying approval and running the next automated events for '+run.client,document.getElementById('adt-content'));
  setTimeout(function(){aiAdvanceRunPastAutoSteps(run,journeyId);run.lastActivity='Just now';navigatePage('ai-run-detail');},2000);
}
function aiRejectRunStep(runId,journeyId){
  const runs=aiAutomationRuns[journeyId||selectedAIJourneyId]||[];
  const run=runs.find(function(r){return r.runId===runId;});if(!run)return;
  aiShowLoader('Sending Back for Correction&hellip;',run.client,document.getElementById('adt-content'));
  setTimeout(function(){run.lastActivity='Just now';navigatePage('ai-run-detail');},1700);
}
function aiResolveException(runId,journeyId){
  const runs=aiAutomationRuns[journeyId||selectedAIJourneyId]||[];
  const run=runs.find(function(r){return r.runId===runId;});if(!run)return;
  aiShowLoader('Re-validating&hellip;','Re-checking data for '+run.client+' after correction',document.getElementById('adt-content'));
  setTimeout(function(){aiAdvanceRunPastAutoSteps(run,journeyId);run.lastActivity='Just now';navigatePage('ai-run-detail');},2000);
}

function aiSimulateApproval(){
  aiShowLoader('Approving Proposal&hellip;',aiDealManager.name+' is reviewing '+((aiProposalDraft&&aiProposalDraft.proposalId)||''));
  setTimeout(function(){
    if(notifData[0]&&notifData[0].pending)notifData[0].pending=false;
    if(aiCreatedContractId){
      const rec=contractsData.find(function(c){return c.id===aiCreatedContractId;});
      if(rec){
        rec.status='Proposal Approved';
        const now=aiFormatNow();
        (ctLogsData[aiCreatedContractId]=ctLogsData[aiCreatedContractId]||[]).unshift({date:now.date,time:now.time,user:aiDealManager.name,status:'Proposal Approved',action:aiDealManager.name+' approved the proposal. Contract generation will continue automatically.'});
        (ctWorkflowData[aiCreatedContractId]=ctWorkflowData[aiCreatedContractId]||[]).unshift({title:'Proposal Approved',user:aiDealManager.name,date:now.date,time:now.time,description:'Deal Manager approved the AI-generated proposal for '+rec.empName+'.'});
        showAiToast(aiDealManager.name+' approved the proposal','Generating the contract now');
      }
    }
    if(aiProposalDraft&&aiProposalDraft.runId)aiUpsertRun('contract-creation',aiProposalDraft.runId,{currentStepIdx:3,status:'In Progress',lastActivity:'Just now'});
    aiContractEditMode=false;
    page='ai-contract-document';renderADTPage();
  },2000);
}
