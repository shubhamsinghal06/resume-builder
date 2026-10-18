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
$('photoFile').addEventListener('change', async e => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    setStatus('Choose a JPG, PNG, or WebP photo.');
    e.target.value = '';
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    setStatus('Choose an image smaller than 8 MB.');
    e.target.value = '';
    return;
  }
  try {
    data.photo = await resizePhoto(file);
    renderAll();
    $('photoStatus').textContent = 'Photo ready · ' + file.name;
    setStatus('Profile photo added. It is embedded in the preview and PDF print output.');
  } catch (err) {
    setStatus('Could not use that photo: ' + err.message);
  }
});
$('removePhotoBtn').addEventListener('click', () => {
  data.photo = '';
  $('photoFile').value = '';
  renderAll();
  $('photoStatus').textContent = 'No photo selected';
  setStatus('Profile photo removed.');
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

$('resumeFile').addEventListener('change', async e => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  setStatus('Reading ' + file.name + '…');
  try {
    let text = '';
    let extractedPhoto = '';
    const ext = file.name.toLowerCase().split('.').pop();
    if (ext === 'txt') {
      text = await file.text();
    } else if (ext === 'pdf') {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
        if (!data.photo && !extractedPhoto) extractedPhoto = await extractPdfImage(page, window.pdfjsLib);
      }
    } else if (ext === 'docx') {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js');
      const result = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      text = result.value;
    } else {
      throw new Error('Please choose a PDF, DOCX, or TXT file.');
    }
    if (!data.photo && extractedPhoto) data.photo = extractedPhoto;
    $('rawText').value = text;
    renderAll();
    setStatus('Text extracted from ' + file.name + '. ' + (data.photo ? 'A profile image is available; check the preview.' : 'No extractable profile photo was found; add one manually in Profile.') + ' Choose “Parse text into fields”, then review every section.');
    setTab('import');
  } catch (err) {
    setStatus('Import failed: ' + err.message + '. You can still paste text into the box below.');
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

function parseText() {
  const text = $('rawText').value.trim();
  if (!text) { setStatus('Upload a resume or paste its text first.'); return; }
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
  if (name && !data.name) data.name = name;
  if (email && !data.email) data.email = email;
  if (phone && !data.phone) data.phone = phone;
  if (urls.length && !data.links) data.links = urls.join(' · ');
  const summary = sectionText('professional summary|summary|profile|objective');
  if (summary && !data.summary) data.summary = summary;
  const skills = sectionText('technical skills|skills|core competencies');
  if (skills && !data.skills) data.skills = skills.replace(/\n/g, ', ');
  const exp = sectionText('professional experience|work experience|experience|employment');
  if (exp && !data.experience.length) {
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
  if (projects && !data.projects.length) data.projects = [{ title: 'Review imported project details', link: '', description: projects }];
  const education = sectionText('education|academic background|qualifications');
  if (education && !data.education.length) data.education = [{ school: education.split('\n')[0] || '', title: '', dates: '', startDate: '', endDate: '', description: education.split('\n').slice(1).join('\n') }];
  setStatus('Parsing complete. Please verify every field; automatic parsing can miss columns, dates, and bullet groupings.');
  renderAll();
  setTab('profile');
}
$('parseBtn').addEventListener('click', parseText);
