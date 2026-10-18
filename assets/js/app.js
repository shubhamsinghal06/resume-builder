// App startup and top-level event wiring.
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
bindProfile();
try{const saved=localStorage.getItem(KEY);if(saved){data={...emptyData(),...JSON.parse(saved)};setStatus('Restored your last locally saved resume.');$('updatedAt').textContent='Loaded local save · '+new Date().toLocaleString()}}catch(e){}
$('builderVersion').textContent='Builder version '+BUILDER_VERSION;
$('builderUpdatedAt').textContent='Last builder update: '+BUILDER_UPDATED_AT;
renderAll();
// Fetch the latest public main-branch commit so footer metadata follows each published repository update.
(async()=>{try{const response=await fetch('https://api.github.com/repos/shubhamsinghal06/resume-builder/commits/main',{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});if(!response.ok)throw new Error('GitHub API unavailable');const commit=await response.json();const sha=String(commit.sha||'').slice(0,7);const rawDate=commit.commit?.committer?.date||commit.commit?.author?.date;if(!sha||!rawDate)throw new Error('Commit metadata missing');const date=new Date(rawDate);const formatted=new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:true}).format(date).replace(/\bam\b/i,'AM').replace(/\bpm\b/i,'PM');$('builderVersion').textContent='Builder v'+BUILDER_VERSION+' · build '+sha; $('builderUpdatedAt').textContent='Latest commit: '+formatted+' IST';document.querySelector('meta[name="builder-version"]').content=BUILDER_VERSION+'+'+sha;}catch(e){$('builderVersion').textContent='Builder version '+BUILDER_VERSION;$('builderUpdatedAt').textContent='Latest commit time unavailable · showing release fallback';}})();
