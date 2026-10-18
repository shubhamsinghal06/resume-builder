// Local save, JSON export, and reset actions.
function saveLocal(){try{localStorage.setItem(KEY,JSON.stringify(data));$('updatedAt').textContent='Saved locally · '+new Date().toLocaleString();setStatus('Resume data saved in this browser.')}catch(e){setStatus('Could not save locally: '+e.message)}}
function download(name,content,type){const blob=new Blob([content],{type:type||'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
function exportData(){download('resume-data.json',JSON.stringify(data,null,2),'application/json')}
async function printResume(){if(!validateResume({focus:true}))return;const imgs=[...$('resumePreview').querySelectorAll('img')];try{await Promise.all(imgs.map(img=>img.decode?img.decode():new Promise((resolve,reject)=>{if(img.complete&&img.naturalWidth)return resolve();img.onload=resolve;img.onerror=reject})));}catch(e){setStatus('The profile photo could not be prepared for printing. Re-upload it and try again.');return}window.print()}
function add(kind,entry){data[kind].push(entry);renderAll()}
$('addExperience').addEventListener('click',()=>add('experience',{company:'',title:'',location:'',start:'',end:'Present',description:''}));
$('addProject').addEventListener('click',()=>add('projects',{title:'',link:'',description:''}));
$('addEducation').addEventListener('click',()=>add('education',{school:'',title:'',startDate:'',endDate:'',dates:'',description:''}));
$('saveBtn').addEventListener('click',saveLocal);$('exportJsonBtn').addEventListener('click',exportData);$('printBtn').addEventListener('click',printResume);$('printBtn2').addEventListener('click',printResume);$('previewTop').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
$('resetBtn').addEventListener('click',()=>{if(confirm('Reset all resume fields? Export your data first if you need a backup.')){data=emptyData();renderAll();saveLocal();setTab('profile')}});
$('clearImportBtn').addEventListener('click',()=>{$('rawText').value='';setStatus('Import text cleared.')});
