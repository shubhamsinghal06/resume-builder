// Render a compact, two-column resume based on the current resume model.
function section(title,content){if(!content)return '';return '<section class="resume-section"><h3>'+title+'</h3>'+content+'</section>'}
function bulletBlock(s){const lines=safeLines(s);return lines.length?'<ul>'+lines.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':''}
function renderPreviewOnly(){
 const contact=[data.email,data.phone,data.location,data.links].filter(Boolean).map(esc).join('<span>•</span>');
 const photoStyle='width:'+Math.min(240,Math.max(40,Number(data.photoWidth)||94))+'px;height:'+Math.min(280,Math.max(40,Number(data.photoHeight)||112))+'px';
 const photoClass=data.photoShape==='circle'?'resume-photo photo-circle':'resume-photo';
 let html='<header class="resume-header photo-'+esc(data.photoPosition||'left')+'">'+(data.photo?'<img class="'+photoClass+'" style="'+photoStyle+'" src="'+data.photo+'" alt="Profile photo">':'')+'<div class="resume-header-main"><h1 class="resume-name">'+esc(data.name||'Your Name')+'</h1><div class="resume-role">'+esc(data.headline||'Professional Headline')+'</div><div class="contact">'+(contact||'<span class="empty">Email · phone · location · links</span>')+'</div></div></header>';
 html+=section('Professional Summary',data.summary?'<div class="resume-summary">'+esc(data.summary)+'</div>':'');
 const skills=safeLines((data.skills||'').replace(/,/g,'\n'));
 const expertise=safeLines((data.domainExpertise||'').replace(/,/g,'\n'));
 const education=(data.education||[]).map(x=>'<div class="resume-entry"><div class="entry-heading"><strong>'+esc(x.title||'Degree')+'</strong><span class="entry-date">'+esc(dateRange(x.startDate||x.dates||'',x.endDate||''))+'</span></div><div class="entry-sub">'+esc(x.school||'')+'</div>'+bulletBlock(x.description)+'</div>').join('');
 const certifications=bulletBlock(data.certifications);
 const ex=(data.experience||[]).map(x=>'<div class="resume-entry"><div class="entry-heading"><strong>'+esc(x.title||'Role')+(x.company?' · '+esc(x.company):'')+'</strong><span class="entry-date">'+esc(dateRange(x.start,x.end))+'</span></div>'+(x.location?'<div class="entry-sub">'+esc(x.location)+'</div>':'')+bulletBlock(x.description)+'</div>').join('');
 const projects=(data.projects||[]).map(x=>'<div class="resume-entry"><div class="entry-heading"><strong>'+esc(x.title||'Project')+'</strong><span class="entry-date">'+esc(x.link||'')+'</span></div>'+bulletBlock(x.description)+'</div>').join('');
 html+='<div class="resume-columns"><aside class="resume-left">'+section('Domain Expertise',expertise.length?'<div class="skill-line">'+expertise.map(esc).join(' · ')+'</div>':'')+section('Technical Skills',skills.length?'<div class="skill-line">'+skills.map(esc).join(' · ')+'</div>':'')+section('Education',education)+section('Certifications & Awards',certifications)+section('Languages',data.languages?'<div>'+esc(data.languages)+'</div>':'')+'</aside><div class="resume-right">'+section('Professional Experience',ex||'<div class="empty">Add your employment history.</div>')+section('Projects & SDKs',projects)+'</div></div>';
 $('resumePreview').innerHTML=html;updateCounts()
}
function updateCounts(){
 const roles=data.experience||[];
 const months={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
 function monthIndex(value,isEnd){
  const s=String(value||'').trim().toLowerCase();if(!s)return null;
  if(/present|current|now/.test(s))return new Date().getFullYear()*12+new Date().getMonth();
  const ym=s.match(/^(19|20)\d{2}-(\d{2})$/);if(ym)return Number(s.slice(0,4))*12+Number(ym[2])-1;
  const y=(s.match(/(?:19|20)\d{2}/)||[])[0];if(!y)return null;
  const m=(s.match(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/)||[])[0];
  return Number(y)*12+(m?months[m]:isEnd?11:0);
 }
 const intervals=roles.map(r=>{const start=monthIndex(r.start,false),end=monthIndex(r.end,true);return start===null?null:[start,Math.max(start,end===null?start:end)]}).filter(Boolean).sort((a,b)=>a[0]-b[0]);
 let total=0,start=null,end=null;
 for(const range of intervals){if(start===null){[start,end]=range}else if(range[0]<=end+1){end=Math.max(end,range[1])}else{total+=end-start+1;[start,end]=range}}
 if(start!==null)total+=end-start+1;
 const years=Math.floor(total/12),monthsLeft=total%12;
 const tenure=total>=12?(years+'+ yrs'):total>0?(monthsLeft+' mos'):'';
 $('experienceCount').textContent=roles.length+' role'+(roles.length===1?'':'s')+(tenure?' · '+tenure:'')
}
function renderAll(){data.education=(data.education||[]).map(item=>{if(!item.startDate&&!item.endDate&&item.dates){const parts=String(item.dates).split(/\s*(?:–|—|\bto\b|-)\s*/i);return {...item,startDate:toMonthInput(parts[0]),endDate:toMonthInput(parts[1])}}return item});document.querySelectorAll('[data-bind]').forEach(el=>el.value=data[el.dataset.bind]||'');renderCollections();renderPreviewOnly();document.querySelectorAll('[data-photo-setting]').forEach(el=>el.value=data[el.dataset.photoSetting]??({photoWidth:94,photoHeight:112,photoShape:'rectangle',photoPosition:'left'}[el.dataset.photoSetting]));$('photoStatus').textContent=data.photo?'Photo selected':'No photo selected'}
