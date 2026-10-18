// Import resume text and optional embedded profile images. Everything runs locally.
$('jsonFile').addEventListener('change', async e => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    data = { ...emptyData(), ...parsed };
    data.experience = Array.isArray(data.experience) ? data.experience : [];
    data.projects = Array.isArray(data.projects) ? data.projects : [];
    data.education = Array.isArray(data.education) ? data.education : [];
    renderAll();
    setStatus('Resume data restored from JSON. Review the fields.');
    setTab('profile');
  } catch (err) {
    setStatus('Could not read JSON: ' + err.message);
  }
});

function canvasPhoto(canvas) {
  const maxSide = 900;
  const scale = Math.min(1, maxSide / Math.max(canvas.width, canvas.height));
  const output = document.createElement('canvas');
  output.width = Math.max(1, Math.round(canvas.width * scale));
  output.height = Math.max(1, Math.round(canvas.height * scale));
  output.getContext('2d').drawImage(canvas, 0, 0, output.width, output.height);
  return output.toDataURL('image/jpeg', 0.9);
}
function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      reject(new Error('Choose a valid image file.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Unsupported image.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve(canvasPhoto(canvas));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
function syncPhotoPickerUI(message) {
  const thumb=$('photoPreviewThumb');
  const remove=$('removePhotoBtn');
  if (!thumb || !remove || !$('photoStatus')) return;
  if (data.photo) {
    thumb.innerHTML='<img src="'+data.photo+'" alt="Selected profile photo">';
    remove.disabled=false;
    if (!message) $('photoStatus').textContent='Photo selected and ready for the resume.';
  } else {
    thumb.innerHTML='<span>No photo</span>';
    remove.disabled=true;
    if (!message) $('photoStatus').textContent='No photo selected. Choose a JPG, PNG, or WebP image.';
  }
}
$('photoFile').addEventListener('change', async e => {
  const file=e.target.files&&e.target.files[0];
  if (!file) return;
  $('photoStatus').textContent='Loading '+file.name+'…';
  setStatus('Loading profile photo…');
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
    $('photoStatus').textContent='Unsupported format. Choose JPG, PNG, or WebP.';
    setStatus('Choose a JPG, PNG, or WebP image.');
    e.target.value='';
    return;
  }
  if (file.size>8*1024*1024) {
    $('photoStatus').textContent='Image is too large. Maximum size is 8 MB.';
    setStatus('Choose a profile photo smaller than 8 MB.');
    e.target.value='';
    return;
  }
  try {
    const imageData=await resizePhoto(file);
    if(typeof imageData!=='string'||!imageData.startsWith('data:image/')) throw new Error('Image conversion did not produce an embeddable image.');
    const testImage=new Image();
    await new Promise((resolve,reject)=>{testImage.onload=resolve;testImage.onerror=()=>reject(new Error('The selected image could not be decoded.'));testImage.src=imageData;});
    data.photo=imageData;
    syncPhotoPickerUI('Photo ready · '+file.name);
    renderAll();
    syncPhotoPickerUI('Photo ready · '+file.name);
    $('photoStatus').textContent='Photo ready · '+file.name;
    setStatus('Profile photo added. It is visible in the preview and will be included when you print/save as PDF.');
  } catch(err) {
    $('photoStatus').textContent='Could not load photo: '+err.message;
    setStatus('Could not use that photo: '+err.message);
    console.error('Profile photo selection failed:',err);
  }
});
$('removePhotoBtn').addEventListener('click', () => {
  if (!data.photo) return;
  data.photo='';
  $('photoFile').value='';
  renderAll();
  syncPhotoPickerUI('Photo removed');
  $('photoStatus').textContent='Photo removed. It will no longer appear in the preview or printed PDF.';
  setStatus('Profile photo removed from the resume.');
});
async function extractPdfImage(page, pdfjs) {
  try {
    const ops = await page.getOperatorList();
    const imageOps = new Set([
      pdfjs.OPS.paintImageXObject,
      pdfjs.OPS.paintInlineImageXObject,
      pdfjs.OPS.paintImageMaskXObject
    ]);
    const candidates = [];
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (!imageOps.has(ops.fnArray[i])) continue;
      const id = ops.argsArray[i] && ops.argsArray[i][0];
      if (!id || !page.objs || !page.objs.has(id)) continue;
      let obj = null;
      try {
        obj = await new Promise(resolve => {
          let settled = false;
          const done = value => { if (!settled) { settled = true; resolve(value); } };
          const value = page.objs.get(id, done);
          if (value) done(value);
        });
      } catch (_) {}
      if (obj && obj.width && obj.height && obj.width >= 70 && obj.height >= 70) candidates.push(obj);
    }
    candidates.sort((a, b) => (b.width * b.height) - (a.width * a.height));
    for (const obj of candidates) {
      const canvas = document.createElement('canvas');
      canvas.width = obj.width;
      canvas.height = obj.height;
      const ctx = canvas.getContext('2d');
      if (obj.bitmap) {
        ctx.drawImage(obj.bitmap, 0, 0);
      } else if (obj.data && obj.data.length === obj.width * obj.height * 4) {
        ctx.putImageData(new ImageData(new Uint8ClampedArray(obj.data), obj.width, obj.height), 0, 0);
      } else if (obj.data && obj.data.length === obj.width * obj.height * 3) {
        const rgba = new Uint8ClampedArray(obj.width * obj.height * 4);
        for (let s = 0, d = 0; s < obj.data.length; s += 3, d += 4) {
          rgba[d] = obj.data[s]; rgba[d + 1] = obj.data[s + 1]; rgba[d + 2] = obj.data[s + 2]; rgba[d + 3] = 255;
        }
        ctx.putImageData(new ImageData(rgba, obj.width, obj.height), 0, 0);
      } else {
        continue;
      }
      return canvasPhoto(canvas);
    }
  } catch (err) {
    console.warn('Embedded PDF image extraction was unavailable.', err);
  }
  return '';
}

function setImportProgress(value,label) {
  const wrap=$('importProgressWrap');
  wrap.hidden=false;
  $('importProgress').value=Math.max(0,Math.min(100,value));
  $('importProgressPercent').textContent=Math.round(value)+'%';
  $('importProgressLabel').textContent=label;
}
function finishImportProgress() {
  $('importProgress').value=100;
  $('importProgressPercent').textContent='100%';
  $('importProgressLabel').textContent='Import complete';
  window.setTimeout(()=>{$('importProgressWrap').hidden=true},2200);
}
function pdfItemsToLines(content) {
  const rows=[];
  for(const item of (content.items||[])) {
    if(!item.str || !item.str.trim()) continue;
    const y=Array.isArray(item.transform)?item.transform[5]:0;
    const x=Array.isArray(item.transform)?item.transform[4]:0;
    let row=rows.find(r=>Math.abs(r.y-y)<3);
    if(!row){row={y,items:[]};rows.push(row)}
    row.items.push({x,str:item.str.trim()});
  }
  return rows.sort((a,b)=>b.y-a.y).map(row=>row.items.sort((a,b)=>a.x-b.x).map(i=>i.str).join(' ').replace(/\s+/g,' ').trim()).filter(Boolean).join('\n');
}
$('resumeFile').addEventListener('change', async e => {
  const file=e.target.files&&e.target.files[0];
  if(!file)return;
  const ext=file.name.toLowerCase().split('.').pop();
  if(!['pdf','docx','txt'].includes(ext)){setStatus('Unsupported file. Please choose a PDF, DOCX, or TXT resume.');return}
  $('importSummary').innerHTML='';
  setImportProgress(2,'Starting import…');
  setStatus('Preparing '+file.name+'. Your current fields will be replaced by the newly parsed resume; export a JSON backup first if you want to keep them.');
  const previousPhoto=data.photo;
  try {
    let text='';
    let extractedPhoto='';
    if(ext==='txt'){
      setImportProgress(25,'Reading text file…');
      text=await file.text();
      setImportProgress(65,'Preparing text for parsing…');
    } else if(ext==='pdf') {
      setImportProgress(8,'Loading PDF reader…');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setImportProgress(15,'Opening PDF…');
      const pdf=await window.pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
      for(let p=1;p<=pdf.numPages;p++){
        setImportProgress(15+(p/pdf.numPages)*60,'Reading PDF page '+p+' of '+pdf.numPages+'…');
        const page=await pdf.getPage(p);
        const content=await page.getTextContent();
        text+=pdfItemsToLines(content)+'\n';
        if(!previousPhoto&&!extractedPhoto) extractedPhoto=await extractPdfImage(page,window.pdfjsLib);
      }
    } else {
      setImportProgress(10,'Loading DOCX reader…');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js');
      setImportProgress(25,'Extracting document text…');
      const result=await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});
      text=result.value;
      setImportProgress(70,'Preparing extracted text…');
    }
    if(!text.trim()) throw new Error('No selectable text was found. If this is a scanned/image-only PDF, run OCR on it or paste its text manually.');
    $('rawText').value=text;
    if(!previousPhoto&&extractedPhoto)data.photo=extractedPhoto;
    setImportProgress(82,'Parsing resume sections into editable fields…');
    parseText(true);
    setTab('import');
    const roleCount=(data.experience||[]).length,projectCount=(data.projects||[]).length,educationCount=(data.education||[]).length;
    $('importSummary').innerHTML='<div class="import-summary-title">Resume parsed: '+esc(file.name)+'</div><div class="import-summary-stats"><span>'+roleCount+' experience entries</span><span>'+projectCount+' projects</span><span>'+educationCount+' education entries</span></div><p>'+(data.photo?'A profile image was extracted or retained.':'No profile photo could be extracted automatically; you can add one in Profile.')+' Review the fields carefully because PDF layouts vary.</p><button type="button" class="btn primary" id="reviewImportedBtn">Review parsed fields</button>';
    $('reviewImportedBtn').addEventListener('click',()=>setTab('profile'));
    setImportProgress(100,'Import complete');
    setStatus('Successfully extracted text and populated resume fields from '+file.name+'. Check the preview and review the parsed sections.');
    finishImportProgress();
  } catch(err) {
    $('importProgressWrap').hidden=false;
    $('importProgress').value=0;
    $('importProgressPercent').textContent='!';
    $('importProgressLabel').textContent='Import failed';
    setStatus('Could not import '+file.name+': '+err.message+'. Try a text-based PDF, DOCX, or paste the resume text manually.');
  }
});
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = [...document.scripts].find(script => script.src === src);
    if (existing) {
      if ((src.includes('pdf.min.js') && window.pdfjsLib) || (src.includes('mammoth') && window.mammoth)) return resolve();
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Could not load the document reader library.'));
    document.head.appendChild(script);
  });
}

function parseText(replaceExisting=false) {
  const text = $('rawText').value.trim();
  if (!text) { setStatus('Upload a resume or paste its text first.'); return; }
  if(replaceExisting){const old=data;data={...emptyData(),photo:old.photo||'',photoWidth:old.photoWidth||94,photoHeight:old.photoHeight||112,photoShape:old.photoShape||'rectangle',photoPosition:old.photoPosition||'left'}}
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const joined = lines.join('\n');
  const email = (joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0] || '';
  const phone = (joined.match(/(?:\+?\d[\d ()-]{7,}\d)/) || [])[0] || '';
  const urls = joined.match(/(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com\/[^\s]+|github\.com\/[^\s]+|[\w.-]+\.[a-z]{2,}\/[^\s]*)/ig) || [];
  let name = '';
  for (const line of lines.slice(0, 8)) {
    if (line.length < 55 && !/@|https?:|linkedin|github|resume|curriculum vitae/i.test(line) &&
      /^[A-Za-z][A-Za-z .'-]+$/.test(line) && line.split(/\s+/).length >= 2) { name = line; break; }
  }
  const headingIndex = labels => lines.findIndex(line => new RegExp('^\\s*(' + labels + ')\\s*[:|]?\\s*$', 'i').test(line));
  function sectionText(labels) {
    const start = headingIndex(labels);
    if (start < 0) return '';
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
      if (/^(experience|work experience|professional experience|employment|education|academic|skills|technical skills|projects|certifications|summary|profile|objective|awards|languages)\s*[:|]?$/i.test(lines[i])) { end = i; break; }
    }
    return lines.slice(start + 1, end).join('\n');
  }
  if (name && (!data.name||replaceExisting)) data.name = name;
  if (email && (!data.email||replaceExisting)) data.email = email;
  if (phone && (!data.phone||replaceExisting)) data.phone = phone;
  if (urls.length && (!data.links||replaceExisting)) data.links = urls.join(' · ');
  const summary = sectionText('professional summary|summary|profile|objective');
  if (summary && (!data.summary||replaceExisting)) data.summary = summary;
  const skills = sectionText('technical skills|skills|core competencies');
  if (skills && (!data.skills||replaceExisting)) data.skills = skills.replace(/\n/g, ', ');
  const exp = sectionText('professional experience|work experience|experience|employment');
  if (exp && (!data.experience.length||replaceExisting)) {
    const chunks = exp.split(/\n(?=[^\n]{0,90}(?:\||\s[-–—]\s|\b(?:20\d\d|19\d\d)\b))/).filter(Boolean);
    data.experience = chunks.map(chunk => {
      const roleLines = chunk.split('\n').filter(Boolean);
      const first = roleLines.shift() || '';
      const date = (first.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s?\d{4}\s*(?:-|–|—|to)\s*(?:Present|Current|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s?\d{4})/i) || [])[0] || '';
      const parts = first.split(/\s[|—–-]\s/);
      const range = date.split(/-|–|—|to/i);
      return { title: parts[0] || first, company: parts[1] || '', location: '', start: (range[0] || '').trim(), end: /present|current/i.test(date) ? 'Present' : (range[1] || '').trim(), description: roleLines.join('\n') };
    }).filter(item => item.title);
  }
  const projects = sectionText('projects|selected projects|projects & contributions');
  if (projects && (!data.projects.length||replaceExisting)) data.projects = [{ title: 'Review imported project details', link: '', description: projects }];
  const education = sectionText('education|academic background|qualifications');
  if (education && (!data.education.length||replaceExisting)) data.education = [{ school: education.split('\n')[0] || '', title: '', dates: '', startDate: '', endDate: '', description: education.split('\n').slice(1).join('\n') }];
  setStatus('Parsing complete. Please verify every field; automatic parsing can miss columns, dates, and bullet groupings.');
  renderAll();
  if(!replaceExisting)setTab('profile');
}
$('parseBtn').addEventListener('click', parseText);
