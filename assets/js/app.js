// App startup and top-level event wiring.
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
bindProfile();
try{const saved=localStorage.getItem(KEY);if(saved){data={...emptyData(),...JSON.parse(saved)};setStatus('Restored your last locally saved resume.');$('updatedAt').textContent='Loaded local save · '+new Date().toLocaleString()}}catch(e){}
$('builderVersion').textContent='Builder version '+BUILDER_VERSION;
$('builderUpdatedAt').textContent='Last builder update: '+BUILDER_UPDATED_AT;
renderAll();
