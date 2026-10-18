// Shared resume state and helpers.
const KEY='resume-studio-v1';
const emptyData=()=>({name:'',headline:'',email:'',phone:'',location:'',links:'',summary:'',domainExpertise:'',skills:'',certifications:'',languages:'',photo:'',photoWidth:94,photoHeight:112,photoShape:'rectangle',photoPosition:'left',experience:[],projects:[],education:[]});
let data=emptyData();
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeLines=s=>String(s||'').split(/\n|•|·/).map(x=>x.trim().replace(/^[-*]\s*/, '')).filter(Boolean);
const toMonthInput=value=>{const s=String(value||'').trim();if(/^\d{4}-\d{2}$/.test(s))return s;const m=s.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})$/i);if(m){const months={jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'};return m[2]+'-'+months[m[1].slice(0,3).toLowerCase()]}const y=s.match(/^(19|20)\d{2}$/);return y?s+'-01':''};
const formatMonth=value=>{const s=String(value||'').trim();const m=s.match(/^(\d{4})-(\d{2})$/);if(m)return new Date(Number(m[1]),Number(m[2])-1,1).toLocaleDateString('en-US',{month:'short',year:'numeric'});return s};
const dateRange=(a,b)=>[formatMonth(a),formatMonth(b)].filter(Boolean).join(' — ');
function setStatus(t){$('parseStatus').textContent=t}
function setTab(tab){document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));document.querySelectorAll('.section').forEach(s=>s.classList.toggle('active',s.id==='tab-'+tab))}
