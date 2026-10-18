// Local keyword-match estimate for a target job description; no resume data is uploaded.
const ATS_STOPWORDS=new Set('a an the and or but if to of in on for with from by as at is are be been being this that these those it its you your we our they their will can should must have has had not do does did about into over under across using use used work role team ability experience skills required preferred including strong good excellent plus'.split(' '));
function atsTokens(text){return [...new Set(String(text||'').toLowerCase().match(/[a-z][a-z+#.-]{1,}/g)||[])].filter(w=>!ATS_STOPWORDS.has(w)&&w.length>2)}
function analyzeJobMatch(){
 const jd=$('jobDescription').value.trim();
 if(!jd){$('atsResults').innerHTML='<p class="small muted">Paste a job description first.</p>';return}
 const resume=[data.headline,data.summary,data.skills,data.certifications,data.languages,...data.experience.flatMap(x=>[x.company,x.title,x.description]),...data.projects.flatMap(x=>[x.title,x.link,x.description]),...data.education.flatMap(x=>[x.school,x.title,x.description])].join(' ').toLowerCase();
 const required=atsTokens(jd),matched=required.filter(w=>resume.includes(w)),missing=required.filter(w=>!resume.includes(w));
 const score=required.length?Math.round(matched.length/required.length*100):0;
 const tags=(arr,cls)=>arr.length?arr.slice(0,45).map(w=>'<span class="ats-keyword '+cls+'">'+esc(w)+'</span>').join(''):'<span class="small muted">None detected.</span>';
 $('atsResults').innerHTML='<div class="ats-score">'+score+'% <span class="small muted">keyword overlap estimate</span></div><p class="small muted">Matched '+matched.length+' of '+required.length+' distinct keywords. Broad keyword matching can miss synonyms and context; this is not an employer ATS score.</p><h4>Keywords found in your resume</h4><div class="ats-keywords">'+tags(matched,'')+'</div><h4>Potentially missing keywords</h4><div class="ats-keywords">'+tags(missing,'missing')+'</div><p class="small muted" style="margin-top:12px">Use missing terms only when they accurately describe your skills or work. Do not add keywords or achievements you cannot support.</p>';
}
$('analyzeJobBtn').addEventListener('click',analyzeJobMatch);
$('clearJobBtn').addEventListener('click',()=>{$('jobDescription').value='';$('atsResults').innerHTML='<p class="small muted">Your keyword match will appear here.</p>'});
