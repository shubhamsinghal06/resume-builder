// Client-side validation for profile details and date ranges.
function fieldError(el,message){if(!el)return;el.setAttribute('aria-invalid','true');let note=el.parentElement.querySelector('.validation-message');if(!note){note=document.createElement('div');note.className='validation-message';note.setAttribute('role','alert');el.insertAdjacentElement('afterend',note)}note.textContent=message}
function clearFieldError(el){if(!el)return;el.removeAttribute('aria-invalid');const note=el.parentElement.querySelector('.validation-message');if(note)note.remove()}
function validateResume({focus=false,silent=false}={}){
 const checks=[];
 const name=$('name'),email=$('email'),phone=$('phone'),links=$('links');
 if(!name.value.trim())checks.push([name,'Enter your full name.']);
 if(email.value.trim()&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()))checks.push([email,'Enter a valid email address.']);
 if(phone.value.trim()&&!/^\+?[\d\s().-]{7,24}$/.test(phone.value.trim()))checks.push([phone,'Use 7–24 digits and standard phone characters only.']);
 if(links.value.trim()&&!/^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i.test(links.value.trim().split(/[·,\s]+/)[0]))checks.push([links,'Enter a valid website URL (for multiple links, separate them with spaces).']);
 (data.experience||[]).forEach((item,i)=>{const start=String(item.start||''),end=String(item.end||'');if(start&&end&&!/^present$/i.test(end)&&end<start){const el=document.querySelector('#experienceList [data-index="'+i+'"] [data-key="end"]');checks.push([el,'End date must be on or after the start date.'])}if((start||end||item.description)&&(!item.company.trim()||!item.title.trim())){const card=document.querySelector('#experienceList [data-index="'+i+'"]');if(!item.company.trim())checks.push([card?.querySelector('[data-key="company"]'),'Enter the company name for this role.']);if(!item.title.trim())checks.push([card?.querySelector('[data-key="title"]'),'Enter the job title for this role.'])}});
 (data.education||[]).forEach((item,i)=>{if(item.startDate&&item.endDate&&item.endDate<item.startDate){const el=document.querySelector('#educationList [data-index="'+i+'"] [data-key="endDate"]');checks.push([el,'End date must be on or after the start date.'])}});
 document.querySelectorAll('[data-bind], [data-key], #photoWidth, #photoHeight').forEach(clearFieldError);
 if(!silent) checks.forEach(([el,msg])=>fieldError(el,msg));
 if(checks.length){if(focus&&checks[0][0]){const el=checks[0][0];const tab=el.closest('#tab-profile')?'profile':el.closest('#tab-experience')?'experience':el.closest('#tab-more')?'more':null;if(tab)setTab(tab);el.focus?.({preventScroll:false});el.scrollIntoView?.({behavior:'smooth',block:'center'})}if(!silent)setStatus('Please correct '+checks.length+' validation issue'+(checks.length===1?'':'s')+' before exporting.');return false}
 if(!silent)setStatus('Validation passed.');return true
}
document.querySelectorAll('[data-bind]').forEach(el=>{el.addEventListener('blur',()=>validateResume({silent:false}));el.addEventListener('input',()=>{if(el.getAttribute('aria-invalid')==='true')validateResume({silent:true})})});
