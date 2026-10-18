// Shared resume state and helpers.
const KEY='resume-studio-v1';
const emptyData=()=>({name:'',headline:'',email:'',phone:'',location:'',links:'',summary:'',skills:'',certifications:'',languages:'',photo:'',experience:[],projects:[],education:[]});
let data=emptyData();
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeLines=s=>String(s||'').split(/\n|•|·/).map(x=>x.trim().replace(/^[-*]\s*/, '')).filter(Boolean);
const dateRange=(a,b)=>[a,b].filter(Boolean).join(' — ');
function setStatus(t){$('parseStatus').textContent=t}
function setTab(tab){document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));document.querySelectorAll('.section').forEach(s=>s.classList.toggle('active',s.id==='tab-'+tab))}
