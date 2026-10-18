// Render a compact, two-column resume based on the current resume model.
function section(title,content){if(!content)return '';return '<section class="resume-section"><h3>'+title+'</h3>'+content+'</section>'}
function bulletBlock(s){const lines=safeLines(s);return lines.length?'<ul>'+lines.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':''}
function renderPreviewOnly(){
 const contact=[data.email,data.phone,data.location,data.links].filter(Boolean).map(esc).join('<span>•</span>');
 let html='<header class="resume-header">'+(data.photo?'<img class="resume-photo" src="'+data.photo+'" alt="Profile photo">':'')+'<div class="resume-header-main"><h1 class="resume-name">'+esc(data.name||'Your Name')+'</h1><div class="resume-role">'+esc(data.headline||'Professional Headline')+'</div><div class="contact">'+(contact||'<span class="empty">Email · phone · location · links</span>')+'</div></div></header>';
 html+=section('Professional Summary',data.summary?'<div class="resume-summary">'+esc(data.summary)+'</div>':'');
 const skills=safeLines((data.skills||'').replace(/,/g,'\n'));
 const expertise=safeLines((data.domainExpertise||'').replace(/,/g,'\n'));
 const education=(data.education||[]).map(x=>'<div class="resume-entry"><div class="entry-heading"><strong>'+esc(x.title||'Degree')+'</strong><span class="entry-date">'+esc(x.dates||'')+'</span></div><div class="entry-sub">'+esc(x.school||'')+'</div>'+bulletBlock(x.description)+'</div>').join('');
 const certifications=bulletBlock(data.certifications);
 const ex=(data.experience||[]).map(x=>'<div class="resume-entry"><div class="entry-heading"><strong>'+esc(x.title||'Role')+(x.company?' · '+esc(x.company):'')+'</strong><span class="entry-date">'+esc(dateRange(x.start,x.end))+'</span></div>'+(x.location?'<div class="entry-sub">'+esc(x.location)+'</div>':'')+bulletBlock(x.description)+'</div>').join('');
 const projects=(data.projects||[]).map(x=>'<div class="resume-entry"><div class="entry-heading"><strong>'+esc(x.title||'Project')+'</strong><span class="entry-date">'+esc(x.link||'')+'</span></div>'+bulletBlock(x.description)+'</div>').join('');
 html+='<div class="resume-columns"><aside class="resume-left">'+section('Domain Expertise',expertise.length?'<div class="skill-line">'+expertise.map(esc).join(' · ')+'</div>':'')+section('Technical Skills',skills.length?'<div class="skill-line">'+skills.map(esc).join(' · ')+'</div>':'')+section('Education',education)+section('Certifications & Awards',certifications)+section('Languages',data.languages?'<div>'+esc(data.languages)+'</div>':'')+'</aside><div class="resume-right">'+section('Professional Experience',ex||'<div class="empty">Add your employment history.</div>')+section('Projects & SDKs',projects)+'</div></div>';
 $('resumePreview').innerHTML=html;updateCounts()
}
function updateCounts(){$('experienceCount').textContent=(data.experience||[]).length+' experience'+((data.experience||[]).length===1?'':'s')}
function renderAll(){document.querySelectorAll('[data-bind]').forEach(el=>el.value=data[el.dataset.bind]||'');renderCollections();renderPreviewOnly();$('photoStatus').textContent=data.photo?'Photo selected':'No photo selected'}
