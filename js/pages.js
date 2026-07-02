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
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">'+emp.name+'</span>'+editBtn+'</div>'
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
  const rows=directEmpData.map((e,i)=>'<tr class="de-row'+(deSelectedId===e.id?' lp-row-selected':'')+'" id="de-row-'+e.id+'" style="cursor:pointer" onclick="openDeSidebar('+e.id+')">'
    +'<td style="color:var(--gray);font-size:13px">'+(i+1)+'</td>'
    +'<td style="font-weight:600;color:var(--navy)">'+e.name+'</td>'
    +'<td>'+(e.empId||d)+'</td>'
    +'<td>'+(e.dept||d)+'</td>'
    +'<td>'+(e.branch||d)+'</td>'
    +'<td>'+(e.jobTitle||d)+'</td>'
    +'<td><span class="lp-status-badge '+e.status.toLowerCase()+'">'+e.status+'</span></td>'
    +'<td><button class="lp-action-btn" onclick="event.stopPropagation();openDeSidebar('+e.id+')"><svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg></button></td>'
    +'</tr>').join('');
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
    +'<div class="listing-stat approved"><div class="listing-stat-count">'+approvedCount+'</div><div class="listing-stat-label">Approved</div></div>'
    +'<div class="listing-stat inactive"><div class="listing-stat-count">'+unapprovedCount+'</div><div class="listing-stat-label">Unapproved</div></div>'
    +'<div class="listing-stat pending"><div class="listing-stat-count">'+pendingCount+'</div><div class="listing-stat-label">Pending</div></div>'
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
  const filtered=pmInvoiceStatusFilter?paymentsData.filter(p=>p.invoiceStatus===pmInvoiceStatusFilter):paymentsData;
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
      +'<td><span class="lp-status-badge active" style="background:#dcfce7;color:#16a34a;border:1.5px solid #86efac;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:600">'+p.orderStatus+'</span></td>'
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
    +apCS('pm-f-status',['Unpaid','Pending','Paid','Closed'],pmInvoiceStatusFilter,'Status')
    +'<input type="date" style="height:34px;border:1px solid var(--border);border-radius:20px;padding:0 12px;font-family:inherit;font-size:13px;color:var(--navy);outline:none;background:#fff;cursor:pointer">'
    +'<button class="lp-pill-reset" onclick="resetPmFilters()">Reset</button><button class="lp-pill-search" onclick="applyPmFilters()">Search</button>'
    +'</div></div>'
    +'<div class="listing-stats" style="flex-shrink:0">'
    +'<div class="listing-stat active"><div class="listing-stat-count">'+activeCount+'</div><div class="listing-stat-label">Active</div></div>'
    +'<div class="listing-stat pending"><div class="listing-stat-count">'+pendingCount+'</div><div class="listing-stat-label">Pending</div></div>'
    +'<div class="listing-stat" style="border-color:#bfdbfe"><div class="listing-stat-count" style="color:#2563eb">'+closedCount+'</div><div class="listing-stat-label">Closed</div></div>'
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
function chatStatusBadge(s){const m={active:{bg:'#f0fdf4',c:'#16a34a',b:'#86efac',l:'Active'},waiting_client:{bg:'#fff7ed',c:'#c2410c',b:'#fed7aa',l:'Waiting for Client'},waiting_csm:{bg:'#fef3c7',c:'#d97706',b:'#fde68a',l:'Waiting for CSM'},inactive:{bg:'#f1f5f9',c:'#64748b',b:'#e2e8f0',l:'Inactive'}};const v=m[s]||{bg:'#f1f5f9',c:'#64748b',b:'#e2e8f0',l:s};return'<span style="background:'+v.bg+';color:'+v.c+';border:1.5px solid '+v.b+';border-radius:6px;padding:3px 10px;font-size:11px;font-weight:600;display:inline-block;white-space:nowrap">'+v.l+'</span>';}
function ctPickStatus(contractId,status){document.querySelectorAll('.ct-action-menu').forEach(m=>m.classList.remove('open'));openCtSidebar(contractId,'logs',status);}
function openCtSidebar(id,tab,pendingStatus){
  ctSelectedId=id;ctTab=tab||'basic-details';
  if(pendingStatus)window._ctPendingStatus=pendingStatus;else delete window._ctPendingStatus;
  const sb=document.getElementById('ct-split-sb');if(sb)sb.classList.add('open');
  const inner=document.getElementById('ct-isb-inner');if(inner)inner.innerHTML=renderCtSidebar();
  document.querySelectorAll('.ct-row').forEach(r=>r.classList.toggle('lp-row-selected',r.id==='ct-row-'+id));
}
function closeCtSidebar(){
  ctSelectedId=null;delete window._ctPendingStatus;
  const sb=document.getElementById('ct-split-sb');if(sb)sb.classList.remove('open');
  document.querySelectorAll('.ct-row').forEach(r=>r.classList.remove('lp-row-selected'));
}
function navCtTab(tab){ctTab=tab;const inner=document.getElementById('ct-isb-inner');if(inner){inner.innerHTML=renderCtSidebar();requestAnimationFrame(function(){const nt=document.getElementById('ct-isb-tabs');if(nt){const a=nt.querySelector('.lp-isb-tab.active');if(a)a.scrollIntoView({inline:'start',block:'nearest'});}});}}
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
function renderCtSidebar(){
  const c=contractsData.find(x=>x.id===ctSelectedId);if(!c)return '';
  const tabs=[{id:'basic-details',label:'Basic Details'},{id:'commercial-terms',label:'Commercial Terms'},{id:'compliance',label:'Compliance'},{id:'logs',label:'Logs'},{id:'workflow',label:'Workflow'}];
  const tabBar='<div class="lp-isb-tabbar">'
    +'<button class="lp-isb-nav-btn" onclick="scrollTabRow(\'left\',\'ct-isb-tabs\')" title="Scroll left"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>'
    +'<div class="lp-isb-tabs" id="ct-isb-tabs">'+tabs.map(t=>'<button class="lp-isb-tab'+(ctTab===t.id?' active':'')+'" onclick="navCtTab(\''+t.id+'\')">'+t.label+'</button>').join('')+'</div>'
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
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">'+c.empName+'</span>'+editBtn+'</div>'
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
    const editBtn='<button class="ep-save-btn" style="padding:5px 14px;font-size:12px;display:flex;align-items:center;gap:5px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit</button>';
    const cm=c.commercial;
    const cf=(l,val)=>'<div class="lp-sb-field-card"><div class="lp-sb-field-content"><div class="lp-sb-field-label">'+l+'</div><div class="lp-sb-field-value">'+(val||dv)+'</div></div></div>';
    body='<div class="lp-sb-view-header"><span class="lp-sb-section-title">Commercial Terms</span>'+editBtn+'</div>'
      +'<div class="lp-sb-detail-grid">'
      +cf('Adt Monthly Management Fee',cm.adtFee)+cf('Annual Gross Salary',cm.annualGross)
      +cf('Base Gross Salary',cm.baseGross)+cf('Holiday Bonus Accrued',cm.holidayBonus)
      +cf('Month 13 Accrued',cm.month13)+cf('Monthly Gross Salary Net',cm.monthlyGrossNet)
      +cf('Monthly Invoice Value',cm.monthlyInvoice)+cf('Monthly Salary 12',cm.monthlySalary12)
      +cf('Monthly Salary 1392',cm.monthlySalary1392)+cf('Net Pay',cm.netPay)
      +cf('Social Premiums Amount',cm.socialPremAmt)+cf('Social Premiums Pct',cm.socialPremPct)
      +cf('Total Monthly Gross Salary',cm.totalMonthlyGross)
      +'</div>';
  }else if(ctTab==='compliance'){
    const thS='padding:9px 12px;text-align:left;font-size:11px;font-weight:600;color:var(--navy);background:#f8fafc;border-bottom:1px solid var(--border)';
    const tdS='padding:10px 12px;font-size:13px;color:var(--navy);border-bottom:1px solid #f1f5f9';
    const upIco='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';
    body='<table style="width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:10px;overflow:hidden">'
      +'<thead><tr>'
      +'<th style="'+thS+'">S.NO</th><th style="'+thS+'">Compliance Item</th><th style="'+thS+'">Note</th><th style="'+thS+'">Status</th><th style="'+thS+'">Documents</th><th style="'+thS+'">ACTION</th>'
      +'</tr></thead>'
      +'<tbody>'+c.complianceItems.map((ci,i)=>'<tr>'
        +'<td style="'+tdS+';color:#6b7280">'+(i+1)+'</td>'
        +'<td style="'+tdS+';font-weight:600">'+ci.item+'</td>'
        +'<td style="'+tdS+';font-weight:500">'+ci.note+'</td>'
        +'<td style="'+tdS+'">'+ci.status+'</td>'
        +'<td style="'+tdS+'"><span style="color:var(--navy);font-size:12px;cursor:pointer">Upload your document</span></td>'
        +'<td style="'+tdS+'"><button style="border:none;background:none;cursor:pointer;color:var(--navy);padding:0" title="Upload">'+upIco+'</button></td>'
        +'</tr>').join('')
      +'</tbody></table>';
  }else if(ctTab==='logs'){
    const logs=ctLogsData[c.id]||[];
    const ctLogKey=(s)=>({Submitted:'default','Quotation Approved':'active','Proposal Sent':'active','Proposal Approved':'active','Contract Sent':'active','Contract Approved':'active',Inactive:'inactive'}[s]||'default');
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
    if(pendingStatus==='Contract Approved'){
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
var peoStep=0;
var peoData={};
function peoGoStep(s){peoStep=s;page='contract-peo';renderADTPage();}
function peoNext(){peoStep=Math.min(2,peoStep+1);page='contract-peo';renderADTPage();}
function peoBack(){if(peoStep===0){peoStep=0;page='contract-type-select';renderADTPage();}else{peoStep--;page='contract-peo';renderADTPage();}}
var eorStep=0;
function eorGoStep(s){eorStep=s;page='contract-eor';renderADTPage();}
function aiCaptureCurrentStep(){
  if(!aiAssistedFlow)return;
  const gv=function(id){const el=document.getElementById(id);return el?el.value:undefined;};
  const merge=function(k,v){if(v!==undefined&&v!=='')aiWizardFormData[k]=v;};
  if(eorStep===0){
    merge('fname',gv('peo-fname'));merge('lname',gv('peo-lname'));merge('gender',gv('peo-gender'));
    merge('email',gv('peo-email'));merge('mobile',gv('peo-mobile'));merge('dob',gv('peo-dob'));
    merge('address',gv('peo-address'));merge('country',gv('peo-work-country'));
    const wpEl=document.querySelector('.peo-wp-radio.selected span');
    if(wpEl)aiWizardFormData.workPermit=wpEl.textContent.indexOf('has work permit')!==-1;
  }else if(eorStep===1){
    merge('jobTitle',gv('peo-jobtitle'));merge('skill',gv('peo-skill'));merge('jobDesc',gv('peo-jobdesc'));
    merge('fromDate',gv('peo-from'));merge('toDate',gv('peo-to'));merge('hours',gv('peo-hours'));merge('pay',gv('peo-pay'));
    const termEl=document.querySelector('.peo-radio-term.selected span');
    if(termEl)aiWizardFormData.employmentTerm=termEl.textContent;
    const typeEl=document.querySelector('.peo-radio-emptype.selected span');
    if(typeEl)aiWizardFormData.employeeType=typeEl.textContent;
  }else if(eorStep===2){
    merge('probation',gv('peo-prob'));merge('notice',gv('peo-notice'));
  }
}
function eorNext(){aiCaptureCurrentStep();eorStep=Math.min(2,eorStep+1);if(aiAssistedFlow)aiCtPushStepMessage(eorStep);page='contract-eor';renderADTPage();}
function eorBack(){aiCaptureCurrentStep();if(eorStep===0){eorStep=0;page='contract-type-select';renderADTPage();}else{eorStep--;page='contract-eor';renderADTPage();}}
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
function buildContractFormHTML(type,step,splitMode){
  const tl=type.toLowerCase();
  const countries=['Afghanistan','Australia','Austria','Bangladesh','Belgium','Brazil','Canada','China','Denmark','Egypt','Finland','France','Germany','Ghana','Greece','India','Indonesia','Iran','Iraq','Ireland','Italy','Japan','Jordan','Kenya','Malaysia','Mexico','Morocco','Nepal','Netherlands','New Zealand','Nigeria','Norway','Pakistan','Philippines','Poland','Portugal','Qatar','Romania','Russia','Saudi Arabia','Singapore','South Africa','South Korea','Spain','Sri Lanka','Sweden','Switzerland','Thailand','Turkey','Ukraine','United Arab Emirates','United Kingdom','United States','Vietnam'];
  const countryOpts='<option value="">Select Country</option>'+countries.map(function(c){return '<option value="'+c+'">'+c+'</option>';}).join('');
  const countryOptsSel=function(sel){return '<option value="">Select Country</option>'+countries.map(function(c){return '<option value="'+c+'"'+(c===sel?' selected':'')+'>'+c+'</option>';}).join('');};
  const prefill=aiAssistedFlow?Object.assign({},aiContractPrefill||{},aiWizardFormData||{}):{};
  const steps=['Basic Details','Job Details','Other Details'];

  // Stepper bar
  const stepper='<div style="display:flex;align-items:center;gap:0;margin-bottom:28px;background:#fff;border:1px solid var(--border);border-radius:12px;overflow:hidden;padding:20px 30px">'
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

  if(step===0){
    content=
      // Eligibility card
      '<div class="ep-form-card" style="margin-bottom:16px;padding:0;overflow:visible">'
      +'<div class="ep-form-title" style="padding:18px 24px;margin:0;background:#fafbfc;border-bottom:1px solid var(--border);border-radius:12px 12px 0 0">Eligibility</div>'
      +'<div style="padding:24px">'
      +'<div class="ep-form-grid" style="margin-bottom:20px">'
      +'<div class="ep-form-group"><label class="ep-form-label">Employee Nationality <span class="req">*</span></label>'
      +'<select class="ep-form-select" id="peo-nationality" style="height:42px;padding:0 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;color:var(--navy);font-family:inherit;outline:none;background:#fff;cursor:pointer;box-sizing:border-box;width:100%">'+countryOpts+'</select></div>'
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

  else if(step===1){
    const radioItem=function(grpClass,label,checked){
      return '<label class="peo-radio-'+grpClass+(checked?' selected':'')+'" onclick="peoSelectRadio(\'peo-radio-'+grpClass+'\',this)" style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:10px">'
        +'<div class="peo-radio-outer" style="width:16px;height:16px;border-radius:50%;border:2px solid '+(checked?'var(--orange)':'#d1d5db')+';flex-shrink:0;display:flex;align-items:center;justify-content:center">'
        +'<div class="peo-radio-inner" style="width:7px;height:7px;border-radius:50%;background:'+(checked?'var(--orange)':'transparent')+';transition:.15s"></div>'
        +'</div>'
        +'<span style="font-size:13px;color:var(--navy);font-weight:500">'+label+'</span>'
        +'</label>';
    };
    const today=new Date().toISOString().split('T')[0];
    content=
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

  else if(step===2){
    const thS='padding:10px 14px;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid var(--border);text-align:left';
    const tdS='padding:14px;font-size:13px;color:var(--navy);border-bottom:1px solid #f1f5f9;vertical-align:middle';
    const inputNum=function(val){return '<input type="number" value="'+val+'" min="0" style="width:60px;height:34px;padding:0 8px;border:1px solid var(--border);border-radius:6px;font-size:13px;text-align:center;font-family:inherit;outline:none;color:var(--navy)">';};
    content=
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

  const isLast=step===2;
  const goBack=type==='PEO'?'peoBack()':'eorBack()';
  const goNext=type==='PEO'?'peoNext()':'eorNext()';
  const resetNav=type==='PEO'?'peoStep=0;page=\'contracts\';renderADTPage()':'eorStep=0;page=\'contracts\';renderADTPage()';
  const finalAction=aiAssistedFlow?'aiSubmitAssistedContract(\''+type+'\')':resetNav;
  const footer='<div style="display:flex;align-items:center;justify-content:space-between;margin-top:24px">'
    +'<button class="ep-cancel-btn" style="border-radius:99px;display:inline-flex;align-items:center;gap:6px" onclick="'+goBack+'"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>Back</button>'
    +'<button class="ep-save-btn" style="padding:9px 28px;border-radius:99px" onclick="'+(isLast?finalAction:goNext)+'">'+( isLast?(aiAssistedFlow?'Create Proposal':'Submit Contract'):'Next')+'</button>'
    +'</div>';

  const aiHint=(aiAssistedFlow&&step===0&&!splitMode)?'<div class="info-box tip" style="margin-bottom:16px"><div class="ib-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg></div><div><strong>AI pre-filled this form</strong>Review the details below, then continue through the remaining steps to create the proposal.</div></div>':'';
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
  const icoStyle='width:44px;height:44px;border-radius:12px;background:#fff8f0;border:1px solid #fed7aa;display:flex;align-items:center;justify-content:center;flex-shrink:0';
  const peoBag='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/></svg>';
  const eorBuild='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="1.8"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 21V10h8v11"/><path d="M12 7h.01"/></svg>';
  const card=function(ico,type,title,desc,onclick){
    return '<div style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:28px 30px;display:flex;flex-direction:column;gap:20px;transition:.18s;cursor:default" '
      +'onmouseenter="this.style.boxShadow=\'0 4px 20px rgba(15,23,42,.10)\';this.style.borderColor=\'#fed7aa\'" '
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
      'startNetherlandsContract()')
    +'</div>'
    +'</div>';
}
function buildContractsListingHTML(){
  const d='<span style="color:#9ca3af">--</span>';
  const proposalPending=contractsData.filter(c=>c.status==='Proposal Sent').length;
  const contractPending=contractsData.filter(c=>c.status==='Contract Sent').length;
  const countries=[...new Set(contractsData.map(c=>c.country))];
  const types=[...new Set(contractsData.map(c=>c.type))];
  const dotsIco='<svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg>';
  const rows=contractsData.map(c=>{
    const flowIdx=ctFlow.indexOf(c.status);
    const menuItems=ctFlow.map((step,i)=>{
      const isDone=flowIdx>i;
      const isCurrent=flowIdx===i;
      const cls=isDone?'done':isCurrent?'current':'next';
      const stepCls=isDone?'done':isCurrent?'current':'next';
      const checkIco=isDone?'<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>':(i+1);
      const click=(!isDone&&!isCurrent)?'onclick="ctPickStatus('+c.id+',\''+step+'\')"':'';
      return '<div class="ct-act-item '+cls+'" '+click+'><span class="ct-act-step '+stepCls+'">'+checkIco+'</span>'+step+'</div>';
    }).join('');
    const btnLabel=c.status.length>12?c.status.slice(0,10)+'…':c.status;
    const actionBtn='<div class="ct-action-wrap">'
      +'<button class="ct-action-btn" onclick="toggleCtAction('+c.id+',event)"><span>'+btnLabel+'</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></button>'
      +'<button class="ct-dots-btn" onclick="openCtSidebar('+c.id+',\'basic-details\');event.stopPropagation()">'+dotsIco+'</button>'
      +'<div class="ct-action-menu" id="ctm-'+c.id+'">'+menuItems+'</div>'
      +'</div>';
    return '<tr class="ct-row'+(ctSelectedId===c.id?' lp-row-selected':'')+'" id="ct-row-'+c.id+'" style="cursor:pointer" onclick="openCtSidebar('+c.id+')">'
      +'<td style="color:#6b7280;font-size:13px">'+c.id+'</td>'
      +'<td style="font-weight:600;color:var(--navy)">'+c.contractId+'</td>'
      +'<td><div style="font-weight:600;color:var(--navy)">'+c.empName+'</div><div style="font-size:11px;color:#9ca3af">'+c.empDesig+'</div></td>'
      +'<td>'+c.country+'</td>'
      +'<td>'+c.type+'</td>'
      +'<td>'+d+'</td>'
      +'<td style="font-size:12px;color:#64748b">'+c.date+'</td>'
      +'<td>'+ctStatusBadge(c.status)+'</td>'
      +'<td onclick="event.stopPropagation()">'+actionBtn+'</td>'
      +'</tr>';
  }).join('');
  const sbInner=ctSelectedId?renderCtSidebar():'';
  return '<div class="lp-page">'
    +'<div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:4px">'
    +'<div class="lp-filter-bar" style="flex:1;min-width:0;padding:0">'
    +'<div class="lp-filter-bar-label">Select Filter</div>'
    +'<div class="lp-filter-bar-row">'
    +apCS('ct-f-country',countries,'','All Countries')
    +apCS('ct-f-type',types,'','All Types')
    +apCS('ct-f-status',['Submitted','Quotation Approved','Proposal Sent','Proposal Approved','Contract Sent','Contract Approved','Inactive'],'','All Statuses')
    +'<input class="ct-search-input" placeholder="Search by name, ID..." type="text" style="height:34px;border-radius:20px">'
    +'<button class="lp-pill-reset">Reset</button>'
    +'<button class="lp-pill-search">Search</button>'
    +'</div></div>'
    +'<div class="listing-stats">'
    +'<div class="listing-stat"><div class="listing-stat-count" style="color:#7c3aed">'+proposalPending+'</div><div class="listing-stat-label">Proposal Pending</div></div>'
    +'<div class="listing-stat"><div class="listing-stat-count" style="color:#2563eb">'+contractPending+'</div><div class="listing-stat-label">Contract Pending</div></div>'
    +'</div></div>'
    +'<div class="lp-split-wrap" style="margin-top:14px"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table"><thead><tr>'
    +'<th>S.No</th><th>Contract ID</th><th>Employee Name</th><th>Country</th><th>Type</th><th>Compliance</th><th>Date</th><th>Status</th><th>Action</th>'
    +'</tr></thead><tbody>'+rows+'</tbody></table>'
    +'<div class="lp-pagination">'
    +'<span class="lp-pagination-info">Showing 1–'+contractsData.length+' of '+contractsData.length+' entries</span>'
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
    + '<div class="ts-stat-card"><div class="ts-stat-top"><span class="ts-stat-label">Leaves Taken</span><div class="ts-stat-ico" style="background:#fff7ed"><svg viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div></div><div class="ts-stat-val">0</div><div class="ts-stat-sub">No leaves taken</div><div class="ts-stat-vs neu">+0 days vs last month</div></div>'
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
    +'<div class="listing-stat"><div class="listing-stat-count" style="color:var(--orange)">'+unfilled+'</div><div class="listing-stat-label">Unfilled</div></div>'
    +'<div class="listing-stat"><div class="listing-stat-count" style="color:#0d9488">'+filled+'</div><div class="listing-stat-label">Filled</div></div>'
    +'<div class="listing-stat"><div class="listing-stat-count" style="color:var(--navy)">'+total+'</div><div class="listing-stat-label">Total</div></div>'
    +'</div>'
    +'</div>';

  // Table rows
  let rows='';
  data.forEach(function(emp){
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
      <td style="padding:10px 14px"><span style="background:#f0fdf4;color:#16a34a;border:1.5px solid #86efac;border-radius:6px;padding:2px 10px;font-size:11px;font-weight:600">Generated</span></td>
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
  const hamburger='<svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg>';
  const headers=cols.map(c=>'<th>'+c+'</th>').join('')+'<th>ACTION</th>';
  const tableRows=allRows.map(row=>'<tr class="lp-row'+(csSelectedItem===row[0]?' lp-row-selected':'')+'" onclick="openCsSidebar('+row[0]+')">'
    +row.map((cell,i)=>buildListingCell(cell,cols[i])).join('')
    +'<td><button class="lp-action-btn" title="More actions" onclick="event.stopPropagation();openCsSidebar('+row[0]+')">'+hamburger+'</button></td>'
    +'</tr>').join('');
  const filters=(meta.filters||[]).map((f,i)=>apCS('cs-lst-f'+i,getFilterOptions(f).slice(1),'',f)).join('');
  const sbInner=csSelectedItem?renderCsSidebar():'';
  return '<div class="listing-page">'
    +'<div class="listing-top">'
      +'<div class="lp-filter-bar" style="flex:1;min-width:0"><div class="lp-filter-bar-label">Select Filter</div>'
      +'<div class="lp-filter-bar-row">'+filters+'<button class="lp-pill-reset">Reset</button><button class="lp-pill-search">Search</button></div></div>'
      +'<div class="listing-stats">'
        +'<div class="listing-stat active"><div class="listing-stat-count">'+activeCount+'</div><div class="listing-stat-label">Active</div></div>'
        +'<div class="listing-stat inactive"><div class="listing-stat-count">'+inactiveCount+'</div><div class="listing-stat-label">Inactive</div></div>'
        +'<div class="listing-stat pending"><div class="listing-stat-count">'+pendingCount+'</div><div class="listing-stat-label">Pending</div></div>'
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
      +'<div style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:12px"><div style="flex:1;display:flex;justify-content:flex-end"><div><div style="font-size:11px;font-weight:600;color:var(--navy);margin-bottom:3px;text-align:right">'+t.assignedTo+' <span style="color:#9ca3af;font-weight:400">· Today</span></div><div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px 0 8px 8px;padding:8px 12px;font-size:12.5px;color:#374151;line-height:1.4">Thank you for reaching out. We are looking into this and will respond shortly.</div></div></div><div style="width:28px;height:28px;border-radius:50%;background:#fff7ed;color:#ea580c;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">PP</div></div>'
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

function buildTicketsPageHTML(){
  const dotsIco='<svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg>';
  const countries=[...new Set(ticketsData.map(t=>t.country))];
  const categories=[...new Set(ticketsData.map(t=>t.category))];
  const openCount=ticketsData.filter(t=>t.status==='open').length;
  const inProgressCount=ticketsData.filter(t=>t.status==='in_progress').length;
  const blockedCount=ticketsData.filter(t=>t.status==='blocked').length;
  const rows=ticketsData.map((t,i)=>(
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
  )).join('');
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
    +'<div class="listing-stat"><div class="listing-stat-count" style="color:#2563eb">'+openCount+'</div><div class="listing-stat-label">Open</div></div>'
    +'<div class="listing-stat"><div class="listing-stat-count" style="color:#d97706">'+inProgressCount+'</div><div class="listing-stat-label">In Progress</div></div>'
    +'<div class="listing-stat"><div class="listing-stat-count" style="color:#dc2626">'+blockedCount+'</div><div class="listing-stat-label">Blocked</div></div>'
    +'</div></div>'
    +'<div class="lp-split-wrap" style="margin-top:14px"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table"><thead><tr><th>S.No</th><th>Ticket ID</th><th>Client Name</th><th>Title</th><th>Category</th><th>Created At</th><th>Status</th><th>Action</th></tr></thead>'
    +'<tbody>'+rows+'</tbody></table>'
    +'<div class="lp-pagination"><span class="lp-pagination-info">Showing 1–'+ticketsData.length+' of '+ticketsData.length+' entries</span>'
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

function buildChatsPageHTML(){
  const dotsIco='<svg width="16" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="2" x2="17" y2="2"/><line x1="1" y1="7" x2="17" y2="7"/><line x1="1" y1="12" x2="17" y2="12"/></svg>';
  const assignees=[...new Set(chatsData.map(c=>c.assignedTo))];
  const countries=[...new Set(chatsData.map(c=>c.country))];
  const activeCount=chatsData.filter(c=>c.status==='active').length;
  const waitingCount=chatsData.filter(c=>c.status==='waiting_client'||c.status==='waiting_csm').length;
  const inactiveCount=chatsData.filter(c=>c.status==='inactive').length;
  const rows=chatsData.map((c,i)=>(
    '<tr class="chat-row'+(chatSelectedId===c.id?' lp-row-selected':'')+'" id="chat-row-'+c.id+'" style="cursor:pointer" onclick="openChatSidebar('+c.id+')">'
    +'<td style="color:#6b7280;font-size:13px">'+(i+1)+'</td>'
    +'<td style="font-weight:600;color:var(--navy)">'+c.chatId+'</td>'
    +'<td style="font-weight:600;color:var(--navy)">'+c.clientName+'</td>'
    +'<td style="color:#64748b;font-size:13px">'+c.assignedTo+'</td>'
    +'<td style="font-size:12px;color:#64748b">'+c.lastActivity+'</td>'
    +'<td>'+chatStatusBadge(c.status)+'</td>'
    +'<td onclick="event.stopPropagation()"><button class="lp-action-btn" onclick="openChatSidebar('+c.id+')" title="View Details">'+dotsIco+'</button></td>'
    +'</tr>'
  )).join('');
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
    +'<div class="listing-stat"><div class="listing-stat-count" style="color:#16a34a">'+activeCount+'</div><div class="listing-stat-label">Active</div></div>'
    +'<div class="listing-stat"><div class="listing-stat-count" style="color:#d97706">'+waitingCount+'</div><div class="listing-stat-label">Waiting</div></div>'
    +'<div class="listing-stat"><div class="listing-stat-count" style="color:#64748b">'+inactiveCount+'</div><div class="listing-stat-label">Inactive</div></div>'
    +'</div></div>'
    +'<div class="lp-split-wrap" style="margin-top:14px"><div class="lp-split-main"><div class="lp-table-card" style="border:none;border-radius:0;box-shadow:none">'
    +'<table class="lp-table"><thead><tr><th>S.No</th><th>Chat ID</th><th>Client Name</th><th>Assigned To</th><th>Last Activity</th><th>Status</th><th>Action</th></tr></thead>'
    +'<tbody>'+rows+'</tbody></table>'
    +'<div class="lp-pagination"><span class="lp-pagination-info">Showing 1–'+chatsData.length+' of '+chatsData.length+' entries</span>'
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
function aiStatusPillClass(status){return status==='Active'?'active':status==='Draft'?'draft':'available';}
function aiDrawerRow(label,val){return '<div class="review-row"><div class="rr-label">'+label+'</div><div class="rr-val" style="white-space:normal;font-weight:600">'+val+'</div></div>';}

function viewAIJourney(id){selectedAIJourneyId=id;aiEventDrawerIdx=-1;navigatePage('ai-journey-detail');}
function startAutomateJourney(id){selectedAIJourneyId=id;navigatePage('ai-automate-form');}

function buildAIExecutiveDashboardHTML(){
  const cards=aiJourneys.map(j=>{
    const totalSteps=j.humanSteps+j.aiSteps;
    return '<div class="ai-journey-card">'
      +'<div class="ai-journey-card-top"><div><div class="ai-journey-name">'+j.name+'</div><div class="ai-journey-desc">'+j.desc+'</div></div><span class="status-pill '+aiStatusPillClass(j.status)+'">'+j.status+'</span></div>'
      +'<div class="ai-journey-modules">'+j.modules.map(m=>'<span class="ai-journey-module-tag">'+m+'</span>').join('')+'</div>'
      +'<div class="ai-journey-metrics">'
      +'<div class="ai-journey-metric"><div class="ai-journey-metric-val">'+totalSteps+'</div><div class="ai-journey-metric-label">Total Events</div></div>'
      +'<div class="ai-journey-metric"><div class="ai-journey-metric-val" style="color:var(--orange)">'+j.aiSteps+'</div><div class="ai-journey-metric-label">AI Automated</div></div>'
      +'<div class="ai-journey-metric"><div class="ai-journey-metric-val" style="color:#2563eb">'+j.humanSteps+'</div><div class="ai-journey-metric-label">Human Required</div></div>'
      +'</div>'
      +'<div class="ai-journey-coverage-row"><span>Automation coverage</span><div class="setup-bar" style="flex:1;margin:0"><div class="setup-fill" style="width:'+j.coverage+'%"></div></div><span style="font-weight:600;color:var(--navy)">'+j.coverage+'%</span></div>'
      +'<div class="ai-journey-actions"><button class="btn btn-secondary btn-sm" onclick="viewAIJourney(\''+j.id+'\')">View Journey</button>'+(j.status==='Active'?'<button class="btn btn-primary btn-sm" onclick="viewAIActiveAutomation(\''+j.id+'\')">View Automation</button>':'<button class="btn btn-primary btn-sm" onclick="startAutomateJourney(\''+j.id+'\')">Automate Journey</button>')+'</div>'
      +'</div>';
  }).join('');
  return '<div class="ai-exec-page">'
    +'<p style="font-size:14px;font-weight:600;margin-bottom:4px">AI Executive</p>'
    +'<p style="font-size:12px;color:var(--gray);margin-bottom:20px;max-width:640px">Automate ADT business journeys with governed AI assistance, approvals, and audit tracking.</p>'
    +'<div class="ai-journey-grid">'+cards+'</div>'
    +'</div>';
}

function buildAIResponsibilitySplitHTML(journeyId){
  const events=aiJourneyEvents[journeyId]||[];
  const aiEvents=events.filter(function(e){return e.chips.includes('AI Automated');});
  const humanEvents=events.filter(function(e){return e.chips.includes('Human Required')||e.chips.includes('Approval Required')||e.chips.includes('Client Action');});
  const item=function(e,cls){return '<div class="ai-resp-item"><span class="ai-resp-dot '+cls+'"></span>'+e.name+'</div>';};
  return '<div class="ai-resp-split">'
    +'<div class="ep-form-card ai-resp-card ai-resp-ai">'
    +'<div class="ep-form-title" style="border:none;margin-bottom:6px;padding-bottom:0">AI Will Handle <span class="ai-resp-count">'+aiEvents.length+' of '+events.length+' events</span></div>'
    +aiEvents.map(function(e){return item(e,'ai');}).join('')
    +'</div>'
    +'<div class="ep-form-card ai-resp-card ai-resp-human">'
    +'<div class="ep-form-title" style="border:none;margin-bottom:6px;padding-bottom:0">Human Will Handle <span class="ai-resp-count">'+humanEvents.length+' of '+events.length+' events</span></div>'
    +humanEvents.map(function(e){return item(e,'human');}).join('')
    +'</div>'
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
  const events=aiJourneyEvents[j.id]||[];
  const total=j.humanSteps+j.aiSteps;
  const timeline=events.map((e,i)=>{
    return '<div class="ai-timeline-item">'
      +'<div class="ai-timeline-dot '+aiTimelineDotClass(e.chips)+'">'+(i+1)+'</div>'
      +'<div class="ai-timeline-card" onclick="openAIEventDrawer(\''+j.id+'\','+i+')">'
      +'<div class="ai-timeline-card-head"><span class="ai-timeline-card-title">'+e.name+'</span></div>'
      +'<div class="ai-timeline-card-desc">'+e.desc+'</div>'
      +'<div class="ai-timeline-chips">'+aiChips(e.chips)+'</div>'
      +'</div></div>';
  }).join('');
  const mainContent='<button class="ep-cancel-btn" style="margin-bottom:14px" onclick="navigatePage(\'ai-executive\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="15 18 9 12 15 6"/></svg> All Journeys</button>'
    +'<p style="font-size:16px;font-weight:700;margin-bottom:4px">'+j.name+'</p>'
    +'<p style="font-size:12px;color:var(--gray);margin-bottom:20px;max-width:680px">'+j.desc+'</p>'
    +'<div class="stat-grid" style="margin-bottom:20px">'
    +'<div class="stat-card"><div class="stat-label"><span>Total Events</span></div><div class="stat-val">'+total+'</div></div>'
    +'<div class="stat-card"><div class="stat-label"><span>AI Automated</span></div><div class="stat-val" style="color:var(--orange)">'+j.aiSteps+'</div></div>'
    +'<div class="stat-card"><div class="stat-label"><span>Human Required</span></div><div class="stat-val" style="color:#2563eb">'+j.humanSteps+'</div></div>'
    +'<div class="stat-card"><div class="stat-label"><span>Risk Level</span></div><div class="stat-val" style="font-size:16px">'+j.risk+'</div></div>'
    +'</div>'
    +'<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:20px">'
    +'<div style="font-size:11.5px;color:var(--gray);max-width:520px">Connected Modules: '+j.modules.join(', ')+'<br>Status: '+j.status+' &middot; Last Updated: '+j.updated+'</div>'
    +(j.status==='Active'
      ?'<div style="display:flex;align-items:center;gap:14px"><button class="btn btn-primary" onclick="viewAIActiveAutomation(\''+j.id+'\')">View Active Automation</button><button class="add-link" onclick="startAutomateJourney(\''+j.id+'\')">Edit configuration</button></div>'
      :'<button class="btn btn-primary" onclick="startAutomateJourney(\''+j.id+'\')">Automate This Journey</button>')
    +'</div>'
    +buildAIResponsibilitySplitHTML(j.id)
    +'<div class="ai-timeline">'+timeline+'</div>';
  const sbInner=aiEventDrawerIdx>=0?renderAIEventDrawer():'';
  return '<div class="ai-exec-page ai-journey-detail-page">'
    +'<div class="lp-split-wrap"><div class="lp-split-main" style="border:none;background:transparent;overflow:visible">'+mainContent+'</div>'
    +'<div class="lp-split-sb'+(aiEventDrawerIdx>=0?' open':'')+'" id="ai-event-split-sb"><div class="lp-isb" id="ai-event-isb-inner">'+sbInner+'</div></div>'
    +'</div></div>';
}

function openAIEventDrawer(journeyId,idx){
  selectedAIJourneyId=journeyId;aiEventDrawerIdx=idx;
  const sb=document.getElementById('ai-event-split-sb');if(sb)sb.classList.add('open');
  const inner=document.getElementById('ai-event-isb-inner');if(inner)inner.innerHTML=renderAIEventDrawer();
}
function closeAIEventDrawer(){
  aiEventDrawerIdx=-1;
  const sb=document.getElementById('ai-event-split-sb');if(sb)sb.classList.remove('open');
}
function renderAIEventDrawer(){
  const j=aiJourneys.find(x=>x.id===selectedAIJourneyId);if(!j)return '';
  const e=(aiJourneyEvents[j.id]||[])[aiEventDrawerIdx];if(!e)return '';
  const tabBar='<div class="lp-isb-tabbar"><div class="lp-isb-tabs" style="padding:0 14px;align-items:center;flex:1"><span style="font-size:13px;font-weight:700;color:var(--navy)">'+e.name+'</span></div>'
    +'<div class="lp-isb-right"><button class="lp-isb-close" onclick="closeAIEventDrawer()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div></div>';
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
  return tabBar+'<div class="lp-isb-body">'+body+'</div>';
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

function aiScopeDefaults(e){
  const ai=e.chips.includes('AI Automated');
  const human=e.chips.includes('Human Required')||e.chips.includes('Approval Required');
  return {ai:ai,human:human,autoMove:ai&&!human,exception:human?'task':(e.chips.includes('Exception Possible')?'notify':'stop')};
}

function buildAutomateJourneyFormHTML(){
  const j=aiJourneys.find(x=>x.id===selectedAIJourneyId)||aiJourneys[0];
  const events=aiJourneyEvents[j.id]||[];

  const basicDetails='<div class="ep-form-card">'
    +'<div class="ep-form-title">Basic Details</div>'
    +'<div class="ep-form-grid">'
    +'<div class="ep-form-group"><label class="ep-form-label">Automation Name</label><input class="ep-form-input" id="ai-auto-name" value="'+j.name+' Automation"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Journey Type</label><input class="ep-form-input" value="'+j.name+'" readonly style="background:var(--light);color:var(--gray)"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Entity</label><select class="ep-form-select" id="ai-auto-entity">'+aiEntityOptions.map(o=>'<option>'+o+'</option>').join('')+'</select></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Country</label><select class="ep-form-select" id="ai-auto-country">'+aiCountryOptions.map(o=>'<option>'+o+'</option>').join('')+'</select></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Employment Type</label><select class="ep-form-select" id="ai-auto-emp-type">'+aiEmploymentTypeOptions.map(o=>'<option>'+o+'</option>').join('')+'</select></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Effective From Date</label><input class="ep-form-input" type="date" id="ai-auto-effective"></div>'
    +'<div class="ep-form-group ep-form-full"><label class="ep-form-label">Status</label><div class="segmented" style="max-width:240px"><button type="button" class="seg-btn'+(j.status!=='Active'?' active':'')+'" onclick="selSeg(this)">Draft</button><button type="button" class="seg-btn'+(j.status==='Active'?' active':'')+'" onclick="selSeg(this)">Active</button></div></div>'
    +'</div></div>';

  const triggerCards=aiTriggerOptions.map((t,i)=>
    '<label class="choice-card'+(i===0?' selected':'')+'" onclick="selRadio(this)">'
    +'<input type="radio" name="ai-trigger"'+(i===0?' checked':'')+'>'
    +'<div class="choice-radio"></div>'
    +'<div class="choice-body"><div class="choice-title">'+t.title+'</div><div class="choice-desc">'+t.desc+'</div></div>'
    +'</label>'
  ).join('');
  const triggerBlock='<div class="ep-form-card">'
    +'<div class="ep-form-title">Trigger Configuration</div>'
    +'<div class="choice-grid" id="ai-trigger-grid">'+triggerCards+'</div>'
    +'</div>';

  const scopeRows=events.map((e,i)=>{
    const d=aiScopeDefaults(e);
    return '<div class="ai-scope-row">'
      +'<div class="ai-scope-name"><div class="ai-scope-name-text">'+(i+1)+'. '+e.name+'</div><div class="ai-timeline-chips">'+aiChips(e.chips)+'</div></div>'
      +'<div class="ai-scope-toggle-group"><label class="cs-toggle"><input type="checkbox" id="ai-scope-ai-'+i+'"'+(d.ai?' checked':'')+'><span class="cs-toggle-slider"></span></label><span class="ai-scope-toggle-label">AI Automated</span></div>'
      +'<div class="ai-scope-toggle-group"><label class="cs-toggle"><input type="checkbox" id="ai-scope-human-'+i+'"'+(d.human?' checked':'')+'><span class="cs-toggle-slider"></span></label><span class="ai-scope-toggle-label">Human Approval</span></div>'
      +'<div class="ai-scope-toggle-group"><label class="cs-toggle"><input type="checkbox" id="ai-scope-auto-'+i+'"'+(d.autoMove?' checked':'')+'><span class="cs-toggle-slider"></span></label><span class="ai-scope-toggle-label">Auto Move Next</span></div>'
      +'<div class="ai-scope-exception"><select class="ep-form-select" id="ai-scope-exc-'+i+'">'
      +'<option value="stop"'+(d.exception==='stop'?' selected':'')+'>Stop Journey</option>'
      +'<option value="task"'+(d.exception==='task'?' selected':'')+'>Create Task</option>'
      +'<option value="notify"'+(d.exception==='notify'?' selected':'')+'>Notify Admin</option>'
      +'</select></div>'
      +'</div>';
  }).join('');
  const scopeBlock='<div class="ep-form-card">'
    +'<div class="ep-form-title">Automation Scope <span style="font-weight:500;color:var(--gray);font-size:11.5px">&mdash; toggle what AI can do for each event in this journey</span></div>'
    +'<div class="ai-scope-table">'+scopeRows+'</div>'
    +'</div>';

  const approvalBlock='<div class="ep-form-card">'
    +'<div class="ep-form-title">Approval Rules</div>'
    +'<div class="ep-form-grid">'
    +'<div class="ep-form-group"><label class="ep-form-label">Who approves contract data?</label><select class="ep-form-select" id="ai-appr-contract-data"><option>OpenDHI Admin</option><option>Payroll Admin</option><option>Compliance Officer</option><option>Finance Admin</option></select></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Who approves sending contract?</label><select class="ep-form-select" id="ai-appr-send-contract"><option>OpenDHI Admin</option><option>Sales Manager</option></select></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Who approves document exceptions?</label><select class="ep-form-select" id="ai-appr-doc-exceptions"><option>Compliance Officer</option><option>Onboarding Admin</option></select></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Who confirms Ready for Payroll?</label><select class="ep-form-select" id="ai-appr-ready-payroll"><option>Payroll Admin</option><option>Finance Admin</option></select></div>'
    +'<div class="ep-form-group ep-form-full"><label class="ep-form-label">Approval threshold / risk setting</label><select class="ep-form-select" id="ai-appr-risk-threshold" style="max-width:240px"><option'+(j.risk==='Low'?' selected':'')+'>Low</option><option'+(j.risk==='Medium'?' selected':'')+'>Medium</option><option'+(j.risk==='High'?' selected':'')+'>High</option></select></div>'
    +'</div></div>';

  const validationBlock='<div class="ep-form-card">'
    +'<div class="ep-form-title">Data Validation Rules</div>'
    +aiValidationChecklist.map((v,i)=>'<div class="cs-toggle-row"><span class="cs-toggle-label">'+v+'</span><label class="cs-toggle"><input type="checkbox" id="ai-val-'+i+'" checked><span class="cs-toggle-slider"></span></label></div>').join('')
    +'</div>';

  const modulesBlock='<div class="ep-form-card">'
    +'<div class="ep-form-title">Connected Modules</div>'
    +'<div class="ai-journey-modules">'+j.modules.map(m=>'<span class="ai-journey-module-tag">'+m+'</span>').join('')+'</div>'
    +'</div>';

  const footer='<div style="display:flex;justify-content:flex-end;gap:10px;padding:6px 2px 4px">'
    +'<button class="btn btn-secondary" onclick="cancelAIAutomation()">Cancel</button>'
    +'<button class="btn btn-secondary" onclick="saveAIAutomation(\'draft\')">Save as Draft</button>'
    +'<button class="btn btn-success" onclick="saveAIAutomation(\'active\')">Activate Automation</button>'
    +'</div>';

  return '<div class="ai-exec-page">'
    +'<button class="ep-cancel-btn" style="margin-bottom:14px" onclick="navigatePage(\'ai-journey-detail\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="15 18 9 12 15 6"/></svg> Back to '+j.name+'</button>'
    +'<p style="font-size:16px;font-weight:700;margin-bottom:4px">Automate Journey</p>'
    +'<p style="font-size:12px;color:var(--gray);margin-bottom:20px">Journey selected: <strong style="color:var(--navy)">'+j.name+'</strong></p>'
    +'<div style="display:flex;flex-direction:column;gap:18px">'
    +basicDetails+triggerBlock+scopeBlock+approvalBlock+validationBlock+modulesBlock+footer
    +'</div></div>';
}

function saveAIAutomation(mode){
  const j=aiJourneys.find(x=>x.id===selectedAIJourneyId);if(!j)return;
  const events=aiJourneyEvents[j.id]||[];
  const gv=function(id){const el=document.getElementById(id);return el?el.value:'';};
  const gc=function(id){const el=document.getElementById(id);return !!(el&&el.checked);};
  const scope=events.map((e,i)=>({
    name:e.name,
    aiAutomate:gc('ai-scope-ai-'+i),
    humanApproval:gc('ai-scope-human-'+i),
    autoMoveNext:gc('ai-scope-auto-'+i),
    exceptionHandling:gv('ai-scope-exc-'+i)
  }));
  const triggerEl=document.querySelector('#ai-trigger-grid .choice-card.selected .choice-title');
  aiAutomationConfigs[j.id]={
    name:gv('ai-auto-name'),entity:gv('ai-auto-entity'),country:gv('ai-auto-country'),employmentType:gv('ai-auto-emp-type'),
    effectiveFrom:gv('ai-auto-effective'),trigger:triggerEl?triggerEl.textContent:'',scope:scope,status:mode==='active'?'Active':'Draft'
  };
  j.status=mode==='active'?'Active':'Draft';
  const col=document.getElementById('adt-content');
  if(col)col.innerHTML='<div class="contract-loader"><div class="cl-spinner"></div><div class="cl-title">'+(mode==='active'?'Activating Automation…':'Saving Draft…')+'</div><div class="cl-sub">'+j.name+'</div></div>';
  setTimeout(function(){navigatePage('ai-executive');},1400);
}
function cancelAIAutomation(){navigatePage('ai-journey-detail');}

// -- AI CONTRACT ASSISTANT (Contracts "+" flow, gated on contract-to-payroll journey being Active) --
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
  return '<div class="ep-page" style="max-width:960px;margin:0 auto">'
    +'<button class="ep-back" onclick="page=\'contracts\';renderADTPage()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back to Contracts</button>'
    +'<div style="display:flex;align-items:flex-start;gap:28px;margin-top:20px;flex-wrap:wrap">'
    +'<div style="flex:1 1 340px;min-width:300px">'
    +'<div class="we-icon" style="margin:0 0 14px"><svg width="22" height="22" viewBox="0 0 24 24" fill="var(--orange)" stroke="none"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg></div>'
    +'<div style="font-size:18px;font-weight:700;color:var(--navy);margin-bottom:6px">AI Contract Assistant</div>'
    +'<div style="font-size:12.5px;color:var(--gray);line-height:1.6;margin-bottom:18px">The Contract Generation to Ready for Payroll journey is automated. Tell me who you\'re creating a contract for &mdash; I\'ll check ADT records and pre-fill the form for you.</div>'
    +'<div class="input-row" style="margin:0 0 10px;max-width:420px">'
    +'<input class="input-field" id="ai-ct-prompt" placeholder="e.g. Create an EOR contract for Anika Shah in Netherlands" oninput="aiCtLiveParse()" onkeydown="if(event.key===\'Enter\')aiCtSubmitPrompt()">'
    +'<button class="icon-btn active" onclick="aiCtSubmitPrompt()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>'
    +'</div>'
    +'<button class="add-link" onclick="page=\'contract-type-select\';renderADTPage()">Skip &mdash; create manually</button>'
    +'</div>'
    +'<div style="flex:1 1 420px;min-width:320px" id="ai-ct-result"></div>'
    +'</div></div>';
}
function aiCtSubmitPrompt(){
  const inp=document.getElementById('ai-ct-prompt');if(!inp)return;
  const raw=inp.value;
  const parsed=parseAIContractPrompt(raw);
  aiCtNotFoundOpen=false;
  const res=document.getElementById('ai-ct-result');if(!res)return;
  res.innerHTML='<div class="ep-form-card" style="display:flex;align-items:center;gap:12px"><div class="cl-spinner" style="width:22px;height:22px;border-width:2.5px"></div><span style="font-size:13px;color:var(--navy);font-weight:500">Searching ADT employee records for &ldquo;'+(parsed.name||raw)+'&rdquo;&hellip;</span></div>';
  setTimeout(function(){aiCtShowResult(parsed);},1000);
}
function aiCtShowResult(parsed){
  const res=document.getElementById('ai-ct-result');if(!res)return;
  window._aiCtLastParsed=parsed;
  const emp=findExistingEmployee(parsed.name);
  if(emp){
    aiCtNotFoundOpen=false;
    const initials=emp.name.split(' ').map(function(n){return n[0];}).slice(0,2).join('');
    res.innerHTML='<div class="ep-form-card">'
      +'<div style="font-size:11.5px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:.4px;margin-bottom:12px">&#10003; Match found in ADT</div>'
      +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">'
      +'<div class="user-avatar-sm" style="width:40px;height:40px;font-size:14px">'+initials+'</div>'
      +'<div><div style="font-size:14px;font-weight:700;color:var(--navy)">'+emp.name+'</div><div style="font-size:12px;color:var(--gray)">'+(emp.jobTitle||'—')+' &middot; '+(emp.dept||'—')+'</div></div>'
      +'</div>'
      +'<div class="review-grid">'
      +'<div class="review-row"><div class="rr-label">Country</div><div class="rr-val">'+(emp.country||parsed.country||'India')+'</div></div>'
      +'<div class="review-row"><div class="rr-label">Email</div><div class="rr-val">'+(emp.email||'—')+'</div></div>'
      +'<div class="review-row"><div class="rr-label">Status</div><div class="rr-val">'+(emp.status||'—')+'</div></div>'
      +'<div class="review-row"><div class="rr-label">Employee ID</div><div class="rr-val">'+(emp.empId||'—')+'</div></div>'
      +'</div>'
      +'<div style="display:flex;gap:10px;margin-top:18px">'
      +'<button class="btn btn-primary" onclick="aiCtUseEmployee(\''+emp.empId+'\')">Use this employee &amp; continue</button>'
      +'<button class="btn btn-secondary" onclick="document.getElementById(\'ai-ct-result\').innerHTML=\'\'">Not the right person? Search again</button>'
      +'</div></div>';
  }else{
    aiCtNotFoundOpen=true;
    res.innerHTML=aiCtNotFoundPanel(parsed);
  }
}
function aiCtNotFoundPanel(parsed){
  const countryOpts=['','Netherlands','India','Germany','Spain','United Kingdom','France','Italy'].map(function(c){return '<option'+(c===parsed.country?' selected':'')+'>'+(c||'Select Country')+'</option>';}).join('');
  const empTypeOpts=['','EOR','PEO','Contractor'].map(function(t){return '<option'+(t===parsed.empType?' selected':'')+'>'+(t||'Select Type')+'</option>';}).join('');
  return '<div class="ep-form-card">'
    +'<div style="font-size:11.5px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px">No existing employee found</div>'
    +'<div style="font-size:12px;color:var(--gray);margin-bottom:16px">I couldn\'t find &ldquo;'+(parsed.name||'this person')+'&rdquo; in ADT. Enter their details below &mdash; keep typing in the prompt and I\'ll keep filling in what I can.</div>'
    +'<div class="ep-form-grid" style="margin-bottom:16px">'
    +'<div class="ep-form-group"><label class="ep-form-label">First Name</label><input class="ep-form-input" id="ai-ct-fname" value="'+(parsed.name?parsed.name.split(' ')[0]:'')+'"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Last Name</label><input class="ep-form-input" id="ai-ct-lname" value="'+(parsed.name?parsed.name.split(' ').slice(1).join(' '):'')+'"></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Country</label><select class="ep-form-select" id="ai-ct-country">'+countryOpts+'</select></div>'
    +'<div class="ep-form-group"><label class="ep-form-label">Employment Type</label><select class="ep-form-select" id="ai-ct-emptype">'+empTypeOpts+'</select></div>'
    +'<div class="ep-form-group ep-form-full"><label class="ep-form-label">Job Title</label><input class="ep-form-input" id="ai-ct-jobtitle" placeholder="e.g. Software Engineer"></div>'
    +'</div>'
    +'<button class="btn btn-primary" onclick="aiCtUseManualEntry()">Continue to Contract Form</button>'
    +'</div>';
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
function aiCtUseEmployee(empId){
  const emp=directEmpData.concat(globalEmpData).find(function(e){return String(e.empId)===String(empId);});
  if(!emp)return;
  const parsed=window._aiCtLastParsed||{};
  const parts=emp.name.split(' ');
  aiContractPrefill={fname:parts[0]||'',lname:parts.slice(1).join(' '),email:emp.email||'',country:emp.country||parsed.country||'India',jobTitle:emp.jobTitle||''};
  aiAssistedFlow=true;aiWizardFormData={};aiCreatedContractId=null;
  const promptEl=document.getElementById('ai-ct-prompt');
  aiCtChatMsgs=[
    {role:'user',text:(promptEl&&promptEl.value)||('Create a contract for '+emp.name)},
    {role:'bot',text:'Found <b>'+emp.name+'</b> in ADT &mdash; '+(emp.country||parsed.country||'India')+', '+(emp.jobTitle||'—')+'. I\'ve pre-filled the contract form on the right with their details. Review each step and continue when you\'re ready.'}
  ];
  eorStep=0;page='contract-eor';renderADTPage();
}
function aiCtUseManualEntry(){
  const gv=function(id){const el=document.getElementById(id);return el?el.value:'';};
  const fname=gv('ai-ct-fname'),lname=gv('ai-ct-lname');
  aiContractPrefill={fname:fname,lname:lname,email:'',country:gv('ai-ct-country'),jobTitle:gv('ai-ct-jobtitle')};
  aiAssistedFlow=true;aiWizardFormData={};aiCreatedContractId=null;
  const promptEl=document.getElementById('ai-ct-prompt');
  const fullName=(fname+' '+lname).trim()||'this person';
  aiCtChatMsgs=[
    {role:'user',text:(promptEl&&promptEl.value)||('Create a contract for '+fullName)},
    {role:'bot',text:'I couldn\'t find <b>'+fullName+'</b> in ADT, so I\'ve started a new contract using the details you gave me. Review each step on the right and fill in anything I\'m missing.'}
  ];
  eorStep=0;page='contract-eor';renderADTPage();
}
function buildAIAssistedContractSplitHTML(type){
  const step=type==='PEO'?peoStep:eorStep;
  const formHtml=buildContractFormHTML(type,step,true);
  return '<div class="ai-ct-split">'
    +'<div class="ai-ct-split-chat">'
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
function initAICtChatPanel(){renderChat('ai-ct-chat',aiCtChatMsgs);}
function aiCtChatSend(){
  const inp=document.getElementById('ai-ct-chat-input-field');if(!inp)return;
  const text=inp.value.trim();if(!text)return;
  aiCtChatMsgs.push({role:'user',text:text});
  inp.value='';
  renderChat('ai-ct-chat',aiCtChatMsgs);
  setTimeout(function(){
    aiCtChatMsgs.push({role:'bot',text:'Got it &mdash; I\'ve noted that. Keep filling in the form on the right, and I\'ll keep helping as you go.'});
    renderChat('ai-ct-chat',aiCtChatMsgs);
  },500);
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
    complianceItems:[{item:type+' '+(p.country||'')+' Proposal',note:'Optional',status:'Pending',doc:null}]
  };
  contractsData.push(record);
  ctLogsData[newId]=[{date:now.date,time:now.time,user:'AI Contract Assistant',status:'Submitted',action:'Contract created via AI Contract Assistant for '+fullName+'.'}];
  ctWorkflowData[newId]=[{title:'Contract Created by AI',user:'AI Contract Assistant',date:now.date,time:now.time,description:'AI compiled the proposal and contract data from the conversation for '+fullName+'.'}];
  aiCreatedContractId=newId;
  aiProposalDraft={
    proposalId:genProposalId(),
    name:fullName,
    country:p.country||'—',
    jobTitle:p.jobTitle||'—',
    type:type,
    contractRecordId:newId
  };
  const col=document.getElementById('adt-content');
  if(col)col.innerHTML='<div class="contract-loader"><div class="cl-spinner"></div><div class="cl-title">Creating Proposal&hellip;</div><div class="cl-sub">Compiling contract data into a proposal for '+aiProposalDraft.name+'</div></div>';
  setTimeout(function(){page='ai-proposal-created';renderADTPage();},1400);
}
function buildAIProposalCreatedHTML(){
  const d=aiProposalDraft||{};
  return '<div class="ep-page" style="max-width:640px;margin:40px auto">'
    +'<div class="success-card">'
    +'<div class="success-check" style="width:64px;height:64px;margin-bottom:18px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="26" height="26"><polyline points="20 6 9 17 4 12"/></svg></div>'
    +'<h2 style="font-size:20px;font-weight:700;margin-bottom:6px">Proposal Created</h2>'
    +'<p style="font-size:12.5px;color:var(--gray);margin-bottom:20px;max-width:380px;line-height:1.55">AI compiled the contract details you entered into a proposal, ready to send to the deal manager for approval.</p>'
    +'<div class="review-section" style="text-align:left;width:100%;max-width:420px;margin-bottom:20px">'
    +'<div class="review-grid">'
    +'<div class="review-row"><div class="rr-label">Proposal ID</div><div class="rr-val">'+d.proposalId+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Employee</div><div class="rr-val">'+d.name+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Country</div><div class="rr-val">'+d.country+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Contract Type</div><div class="rr-val">'+d.type+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Job Title</div><div class="rr-val">'+d.jobTitle+'</div></div>'
    +'<div class="review-row"><div class="rr-label">Status</div><div class="rr-val">Draft</div></div>'
    +'</div></div>'
    +'<button class="btn btn-success" onclick="aiSendProposalForApproval()">Send to Deal Manager for Approval</button>'
    +'</div></div>';
}
function aiSendProposalForApproval(){
  const col=document.getElementById('adt-content');
  if(col)col.innerHTML='<div class="contract-loader"><div class="cl-spinner"></div><div class="cl-title">Notifying '+aiDealManager.name+'&hellip;</div><div class="cl-sub">Sending proposal '+((aiProposalDraft&&aiProposalDraft.proposalId)||'')+' for approval</div></div>';
  notifData.unshift({name:'Proposal sent for approval — '+((aiProposalDraft&&aiProposalDraft.name)||''),cid:(aiProposalDraft&&aiProposalDraft.proposalId)||'',time:'Just now',pending:true});
  if(aiCreatedContractId){
    const rec=contractsData.find(function(c){return c.id===aiCreatedContractId;});
    if(rec){
      rec.status='Proposal Sent';
      const now=aiFormatNow();
      (ctLogsData[aiCreatedContractId]=ctLogsData[aiCreatedContractId]||[]).unshift({date:now.date,time:now.time,user:'Pallavi Parate',status:'Proposal Sent',action:'Proposal sent to '+aiDealManager.name+' ('+aiDealManager.role+') for approval.'});
    }
  }
  setTimeout(function(){page='ai-proposal-waiting-approval';renderADTPage();},1400);
}
function buildAIProposalWaitingApprovalHTML(){
  const d=aiProposalDraft||{};
  return '<div class="ep-page" style="max-width:640px;margin:40px auto;text-align:center">'
    +'<div class="ep-form-card" style="padding:40px 32px">'
    +'<div style="width:64px;height:64px;border-radius:50%;background:#fef3c7;display:flex;align-items:center;justify-content:center;margin:0 auto 18px">'
    +'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>'
    +'</div>'
    +'<div class="success-meta" style="background:#fef3c7;color:#b45309;margin:0 auto 14px">&#9203; Pending Approval</div>'
    +'<h2 style="font-size:19px;font-weight:700;margin-bottom:8px">Waiting for Approval</h2>'
    +'<p style="font-size:12.5px;color:var(--gray);line-height:1.6;margin-bottom:20px">We\'ve notified <strong style="color:var(--navy)">'+aiDealManager.name+'</strong> (Deal Manager) to review proposal <strong>'+d.proposalId+'</strong> for <strong>'+d.name+'</strong>. Once approved, this journey will automatically continue to contract generation.</p>'
    +'<div class="ai-timeline" style="text-align:left;max-width:360px;margin:0 auto 24px">'
    +'<div class="ai-timeline-item"><div class="ai-timeline-dot ai">1</div><div class="ai-timeline-card" style="cursor:default"><div class="ai-timeline-card-title">Proposal Created</div><div class="ai-timeline-chips"><span class="ai-chip ai-chip-ai">AI Automated</span></div></div></div>'
    +'<div class="ai-timeline-item"><div class="ai-timeline-dot human">2</div><div class="ai-timeline-card" style="cursor:default"><div class="ai-timeline-card-title">Waiting for '+aiDealManager.name+'\'s Approval</div><div class="ai-timeline-chips"><span class="ai-chip ai-chip-human">Human Required</span><span class="ai-chip ai-chip-approval">Approval Required</span></div></div></div>'
    +'<div class="ai-timeline-item"><div class="ai-timeline-dot system">3</div><div class="ai-timeline-card" style="cursor:default;opacity:.55"><div class="ai-timeline-card-title">Contract Generation (pending)</div><div class="ai-timeline-chips"><span class="ai-chip ai-chip-system">System Action</span></div></div></div>'
    +'</div>'
    +'<div style="display:flex;gap:10px;justify-content:center">'
    +'<button class="btn btn-secondary" onclick="page=\'contracts\';renderADTPage()">Back to Contracts</button>'
    +'<button class="btn btn-success" onclick="aiSimulateApproval()">Simulate: '+aiDealManager.name+' Approves</button>'
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
function aiRunCounts(run){
  const events=aiJourneyEvents['contract-to-payroll']||[];
  let aiCompleted=0,humanPending=0;
  events.forEach(function(e,i){
    const st=aiRunStepStatus(run,i);
    if(st==='done'&&e.chips.includes('AI Automated'))aiCompleted++;
    if(st==='current'||st==='exception')humanPending++;
  });
  return {aiCompleted:aiCompleted,humanPending:humanPending};
}
function aiRunStatusPillClass(status){return status==='Active'?'active':status==='Waiting for Approval'?'pending':status==='Exception'?'inactive':status==='Completed'?'approved':'draft';}
function viewAIActiveAutomation(journeyId){selectedAIJourneyId=journeyId;navigatePage('ai-active-automation');}
function viewAIRun(runId){selectedAIRunId=runId;navigatePage('ai-run-detail');}

function buildAIActiveAutomationHTML(){
  const j=aiJourneys.find(x=>x.id===selectedAIJourneyId)||aiJourneys[0];
  const runs=aiAutomationRuns[j.id]||[];
  const cfg=aiAutomationConfigs[j.id];
  const totalRuns=runs.length;
  const exceptions=runs.filter(function(r){return r.status==='Exception';}).length;
  const successRate=totalRuns?Math.round((runs.filter(function(r){return r.status!=='Exception';}).length/totalRuns)*100):100;
  const rows=runs.map(function(r){
    const events=aiJourneyEvents[j.id]||[];
    const step=events[Math.min(r.currentStepIdx,events.length-1)];
    const counts=aiRunCounts(r);
    return '<tr style="cursor:pointer" onclick="viewAIRun(\''+r.runId+'\')">'
      +'<td style="font-weight:600;color:var(--navy)">'+r.runId+'</td>'
      +'<td>'+r.client+'</td>'
      +'<td>'+r.country+'</td>'
      +'<td>'+r.contractType+'</td>'
      +'<td>'+(r.status==='Completed'?'Ready for Payroll':(step?step.name:'—'))+'</td>'
      +'<td style="color:var(--orange);font-weight:600">'+counts.aiCompleted+'</td>'
      +'<td style="color:#2563eb;font-weight:600">'+counts.humanPending+'</td>'
      +'<td><span class="status-pill '+aiRunStatusPillClass(r.status)+'">'+r.status+'</span></td>'
      +'<td style="color:var(--gray);font-size:12px">'+r.lastActivity+'</td>'
      +'<td onclick="event.stopPropagation()"><button class="btn btn-secondary btn-sm" onclick="viewAIRun(\''+r.runId+'\')">View Run</button></td>'
      +'</tr>';
  }).join('');
  return '<div class="ai-exec-page">'
    +'<button class="ep-cancel-btn" style="margin-bottom:14px" onclick="navigatePage(\'ai-journey-detail\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="15 18 9 12 15 6"/></svg> Back to '+j.name+'</button>'
    +'<p style="font-size:16px;font-weight:700;margin-bottom:4px">'+j.name+' Automation</p>'
    +'<p style="font-size:12px;color:var(--gray);margin-bottom:20px">Live view of every run this automation has triggered, and where each one currently stands.</p>'
    +'<div class="stat-grid" style="margin-bottom:24px">'
    +'<div class="stat-card"><div class="stat-label"><span>Automation Status</span></div><div class="stat-val" style="font-size:16px;color:#16a34a">Active</div></div>'
    +'<div class="stat-card"><div class="stat-label"><span>Trigger</span></div><div class="stat-val" style="font-size:14px">'+(cfg&&cfg.trigger?cfg.trigger:'Trigger when proposal is approved')+'</div></div>'
    +'<div class="stat-card"><div class="stat-label"><span>Entity</span></div><div class="stat-val" style="font-size:14px">'+(cfg&&cfg.entity?cfg.entity:'All ADT Entities')+'</div></div>'
    +'<div class="stat-card"><div class="stat-label"><span>Country</span></div><div class="stat-val" style="font-size:14px">'+(cfg&&cfg.country?cfg.country:'Multiple Countries')+'</div></div>'
    +'<div class="stat-card"><div class="stat-label"><span>Created By</span></div><div class="stat-val" style="font-size:14px">Pallavi Parate</div></div>'
    +'<div class="stat-card"><div class="stat-label"><span>Last Run</span></div><div class="stat-val" style="font-size:14px">'+(runs[0]?runs[0].lastActivity:'—')+'</div></div>'
    +'<div class="stat-card"><div class="stat-label"><span>Total Runs</span></div><div class="stat-val">'+totalRuns+'</div></div>'
    +'<div class="stat-card"><div class="stat-label"><span>Success Rate</span></div><div class="stat-val" style="color:#16a34a">'+successRate+'%</div></div>'
    +'<div class="stat-card"><div class="stat-label"><span>Exceptions Pending</span></div><div class="stat-val" style="color:'+(exceptions?'#dc2626':'var(--navy)')+'">'+exceptions+'</div></div>'
    +'</div>'
    +'<div class="listing-card">'
    +'<table class="listing-table"><thead><tr>'
    +'<th>Run ID</th><th>Client</th><th>Country</th><th>Contract Type</th><th>Current Step</th><th>AI Completed</th><th>Human Pending</th><th>Status</th><th>Last Activity</th><th>Action</th>'
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
      +'<div class="ai-timeline-chips">'+aiChips(e.chips)+'</div>'
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
    actionPanel='<div class="ep-form-card" style="text-align:center;padding:32px 24px">'
      +'<div class="success-check" style="width:52px;height:52px;margin:0 auto 14px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="22" height="22"><polyline points="20 6 9 17 4 12"/></svg></div>'
      +'<div style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:6px">Ready for Payroll</div>'
      +'<div style="font-size:12px;color:var(--gray);line-height:1.5">All 14 events completed. '+run.client+' is confirmed ready for the next payroll cycle.</div>'
      +'</div>';
  }else if(run.status==='Exception'){
    actionPanel='<div class="ep-form-card">'
      +'<div style="font-size:11.5px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">Exception &mdash; Action Required</div>'
      +'<div style="font-size:12.5px;color:var(--navy);line-height:1.6;margin-bottom:18px">'+(run.exceptionNote||'This run is blocked and needs review.')+'</div>'
      +'<button class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:8px" onclick="aiResolveException(\''+run.runId+'\')">Resolve Exception &amp; Continue</button>'
      +'<button class="btn btn-secondary" style="width:100%;justify-content:center" onclick="openAIEventDrawer(\''+j.id+'\','+run.currentStepIdx+')">View Event Details</button>'
      +'</div>';
  }else if(run.status==='Waiting for Approval'){
    const aiSummary='AI has completed '+aiRunCounts(run).aiCompleted+' events for '+run.client+' &mdash; fetching proposal data, validating entity mapping, selecting the '+run.contractType+' contract template, and pre-filling mandatory fields. '+(currentEvent?currentEvent.name+' is required before the journey can continue.':'Review is required before the journey can continue.');
    actionPanel='<div class="ep-form-card">'
      +'<div style="font-size:11.5px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">Current Action Required</div>'
      +'<div style="font-size:13px;font-weight:600;color:var(--navy);margin-bottom:10px">'+(currentEvent?currentEvent.name:'Review pre-filled data')+'</div>'
      +'<div style="font-size:12px;color:var(--gray);line-height:1.6;margin-bottom:18px">'+aiSummary+'</div>'
      +'<button class="btn btn-secondary" style="width:100%;justify-content:center;margin-bottom:8px" onclick="openAIEventDrawer(\''+j.id+'\','+run.currentStepIdx+')">Review Data</button>'
      +'<button class="btn btn-success" style="width:100%;justify-content:center;margin-bottom:8px" onclick="aiApproveRunStep(\''+run.runId+'\')">Approve and Continue</button>'
      +'<button class="btn btn-secondary" style="width:100%;justify-content:center" onclick="aiRejectRunStep(\''+run.runId+'\')">Reject / Send for Correction</button>'
      +'</div>';
  }else{
    actionPanel='<div class="ep-form-card">'
      +'<div style="font-size:11.5px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">In Progress</div>'
      +'<div style="font-size:12.5px;color:var(--gray);line-height:1.6">AI or the client is currently working on <strong style="color:var(--navy)">'+(currentEvent?currentEvent.name:'this step')+'</strong>. No admin action is needed right now &mdash; check back shortly.</div>'
      +'</div>';
  }

  const mainContent='<button class="ep-cancel-btn" style="margin-bottom:14px" onclick="navigatePage(\'ai-active-automation\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="15 18 9 12 15 6"/></svg> Back to Active Automation</button>'
    +'<p style="font-size:16px;font-weight:700;margin-bottom:4px">'+j.name+' &mdash; '+run.client+'</p>'
    +'<p style="font-size:12px;color:var(--gray);margin-bottom:20px">'+run.country+' &middot; '+run.contractType+' &middot; Run ID '+run.runId+' &middot; <span class="status-pill '+aiRunStatusPillClass(run.status)+'">'+run.status+'</span></p>'
    +'<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:20px;align-items:start">'
    +'<div><div class="ai-timeline" style="margin-bottom:20px">'+timeline+'</div>'+backendPanel+'</div>'
    +'<div>'+actionPanel+'</div>'
    +'</div>';
  const sbInner=aiEventDrawerIdx>=0?renderAIEventDrawer():'';
  return '<div class="ai-exec-page" style="max-width:1180px">'
    +'<div class="lp-split-wrap"><div class="lp-split-main" style="border:none;background:transparent;overflow:visible">'+mainContent+'</div>'
    +'<div class="lp-split-sb'+(aiEventDrawerIdx>=0?' open':'')+'" id="ai-event-split-sb"><div class="lp-isb" id="ai-event-isb-inner">'+sbInner+'</div></div>'
    +'</div></div>';
}

function aiAdvanceRunPastAutoSteps(run){
  const events=aiJourneyEvents['contract-to-payroll']||[];
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
function aiApproveRunStep(runId){
  const runs=aiAutomationRuns['contract-to-payroll'];
  const run=runs.find(function(r){return r.runId===runId;});if(!run)return;
  const col=document.getElementById('adt-content');
  if(col)col.innerHTML='<div class="contract-loader"><div class="cl-spinner"></div><div class="cl-title">Continuing Journey&hellip;</div><div class="cl-sub">Applying approval and running the next automated events for '+run.client+'</div></div>';
  setTimeout(function(){aiAdvanceRunPastAutoSteps(run);run.lastActivity='Just now';navigatePage('ai-run-detail');},1600);
}
function aiRejectRunStep(runId){
  const runs=aiAutomationRuns['contract-to-payroll'];
  const run=runs.find(function(r){return r.runId===runId;});if(!run)return;
  const col=document.getElementById('adt-content');
  if(col)col.innerHTML='<div class="contract-loader"><div class="cl-spinner"></div><div class="cl-title">Sending Back for Correction&hellip;</div><div class="cl-sub">'+run.client+'</div></div>';
  setTimeout(function(){run.lastActivity='Just now';navigatePage('ai-run-detail');},1200);
}
function aiResolveException(runId){
  const runs=aiAutomationRuns['contract-to-payroll'];
  const run=runs.find(function(r){return r.runId===runId;});if(!run)return;
  const col=document.getElementById('adt-content');
  if(col)col.innerHTML='<div class="contract-loader"><div class="cl-spinner"></div><div class="cl-title">Re-validating&hellip;</div><div class="cl-sub">Re-checking data for '+run.client+' after correction</div></div>';
  setTimeout(function(){aiAdvanceRunPastAutoSteps(run);run.lastActivity='Just now';navigatePage('ai-run-detail');},1600);
}

function aiSimulateApproval(){
  const col=document.getElementById('adt-content');
  if(col)col.innerHTML='<div class="contract-loader"><div class="cl-spinner"></div><div class="cl-title">Approving Proposal&hellip;</div><div class="cl-sub">'+aiDealManager.name+' is reviewing '+((aiProposalDraft&&aiProposalDraft.proposalId)||'')+'</div></div>';
  setTimeout(function(){
    if(notifData[0]&&notifData[0].pending)notifData[0].pending=false;
    if(aiCreatedContractId){
      const rec=contractsData.find(function(c){return c.id===aiCreatedContractId;});
      if(rec){
        rec.status='Proposal Approved';
        const now=aiFormatNow();
        (ctLogsData[aiCreatedContractId]=ctLogsData[aiCreatedContractId]||[]).unshift({date:now.date,time:now.time,user:aiDealManager.name,status:'Proposal Approved',action:aiDealManager.name+' approved the proposal. Contract generation will continue automatically.'});
        (ctWorkflowData[aiCreatedContractId]=ctWorkflowData[aiCreatedContractId]||[]).unshift({title:'Proposal Approved',user:aiDealManager.name,date:now.date,time:now.time,description:'Deal Manager approved the AI-generated proposal for '+rec.empName+'.'});
      }
    }
    const col2=document.getElementById('adt-content');
    if(col2)col2.innerHTML='<div class="success-card"><div class="success-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div><h2 style="font-size:20px;font-weight:700;margin-bottom:8px">Proposal Approved</h2><p style="font-size:12.5px;color:var(--gray);margin-bottom:24px;max-width:380px;line-height:1.55">'+aiDealManager.name+' approved the proposal. The Contract Generation to Ready for Payroll journey will continue automatically &mdash; contract generation, client signature, onboarding checks, and payroll readiness.</p><button class="btn btn-primary" onclick="navigatePage(\'contracts\')">View in Contracts</button></div>';
  },1500);
}