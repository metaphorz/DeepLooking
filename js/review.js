// Curator review of a submission ZIP made by stage.html. The ZIP opens in the real viewer,
// in this browser only (nothing is uploaded), with a summary panel, checks, and the
// import_submission.py command that adds it to a gallery. Uses index.html's openViewer.

const reviewPanel = document.getElementById('review-panel');
const reviewFile = document.getElementById('review-file');
let reviewURLs = [];

function loadScript(src) {
  return new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = src; s.onload = ok; s.onerror = () => fail(new Error('Could not load ' + src));
    document.head.appendChild(s);
  });
}

// ZIP reading and checks are only needed here, so load them on first use.
async function loadReviewTools() {
  if (!window.JSZip) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
  if (typeof readSubmissionZip === 'undefined') {
    await loadScript('js/segment.js');
    await loadScript('js/submission.js');
  }
}

document.getElementById('review-link').addEventListener('click', (e) => {
  e.preventDefault();
  reviewFile.click();
});
reviewFile.addEventListener('change', async () => {
  const file = reviewFile.files[0];
  reviewFile.value = '';
  if (!file) return;
  try {
    await startReview(file);
  } catch (e) {
    gallerySubtitle.textContent = 'Could not open ' + file.name + ': ' + e.message;
  }
});

async function startReview(file) {
  await loadReviewTools();
  const sub = await readSubmissionZip(file);
  endReview();
  const urlFor = {};
  for (const p of sub.paths) {
    if (/\.(md|json)$/i.test(p)) continue;
    urlFor[p] = URL.createObjectURL(await sub.blob(p));
    reviewURLs.push(urlFor[p]);
  }
  const files = {
    url: p => urlFor[p] || '',
    text: async p => (sub.has(p) ? sub.text(p) : null)
  };
  if (!sub.manifest.segments) sub.manifest.segments = [];
  await openViewer(sub.manifest, '(submission)', files);
  viewerSubtitle.textContent = 'Reviewing a submission \u2014 ' + (sub.manifest.title || sub.manifest.id);
  renderReview(sub, file.name, await checkSubmission(sub), await readSubmissionTabs(sub));
}

function endReview() {
  reviewURLs.forEach(u => URL.revokeObjectURL(u));
  reviewURLs = [];
  reviewPanel.classList.add('hidden');
  while (reviewPanel.firstChild) reviewPanel.removeChild(reviewPanel.firstChild);
}

function el(tag, text, cls) {
  const e = document.createElement(tag);
  if (text != null) e.textContent = text;
  if (cls) e.className = cls;
  return e;
}

// "Roger Malina and Tina Chen" -> "RogerMalinaAndTinaChen"
const camel = s => s.replace(/[^A-Za-z0-9]+/g, ' ').trim().split(' ').filter(Boolean)
  .map(w => w[0].toUpperCase() + w.slice(1)).join('');

function renderReview(sub, fileName, problems, tabs) {
  const m = sub.manifest, info = sub.submission || {};
  const panel = reviewPanel;
  panel.appendChild(el('h2', 'SUBMISSION REVIEW'));

  const dl = el('dl');
  const row = (k, v) => { if (v) { dl.appendChild(el('dt', k)); dl.appendChild(el('dd', v)); } };
  const g = info.gallery || {};
  row('File', fileName);
  row('Title', m.title);
  row('Contributor', info.contributor || m.credit);
  row('Suggested gallery', g.new ? 'New gallery: ' + g.name + (g.author ? ' \u2014 ' + g.author : '') : (g.name || g.id));
  row('Lens profile', info.profile ? info.profile.name + ' (' + (info.profile.lenses || []).join(', ') + ')' : '');
  row('About the image', info.about);
  row('Created', info.created ? new Date(info.created).toLocaleString() : '');
  row('Models', info.models ? Object.entries(info.models).filter(([, v]) => v).map(([k, v]) => k + ': ' + v).join(' \u00B7 ') : '');
  row('Note to curator', info.notes);
  panel.appendChild(dl);

  // Who wrote what
  panel.appendChild(el('h3', 'Who wrote the tabs'));
  const who = { ai: 'AI', user: 'contributor', 'ai+user': 'AI, edited by contributor' };
  const all = [...Object.entries(tabs.segments).map(([label, ts]) => [label, ts]), ['Whole image', tabs.whole]];
  const counts = {};
  for (const [, ts] of all) for (const t of ts) { const k = who[t.author] || 'unknown'; counts[k] = (counts[k] || 0) + 1; }
  panel.appendChild(el('p', Object.entries(counts).map(([k, n]) => n + ' by ' + k).join(' \u00B7 ') || 'No tabs.'));
  const details = el('details');
  details.appendChild(el('summary', 'Per tab'));
  const ul = el('ul');
  for (const [label, ts] of all) {
    if (!ts.length) continue;
    ul.appendChild(el('li', label + ': ' + ts.map(t => (t.tab || t.lens) + ' (' + (who[t.author] || '?') + ')').join(', ')));
  }
  details.appendChild(ul);
  panel.appendChild(details);

  // Checks
  panel.appendChild(el('h3', 'Checks'));
  const pl = el('ul');
  if (problems.length) problems.forEach(p => pl.appendChild(el('li', p, 'problem')));
  else pl.appendChild(el('li', 'No problems found.', 'ok'));
  panel.appendChild(pl);

  // Add to a gallery
  panel.appendChild(el('h3', 'Add to a gallery'));
  const sel = el('select');
  for (const gal of galleriesList) {
    const o = el('option', gal.name + ' \u2014 ' + gal.author); o.value = gal.id; sel.appendChild(o);
  }
  const newOpt = el('option', 'New gallery\u2026'); newOpt.value = '__new'; sel.appendChild(newOpt);
  sel.value = g.new ? '__new' : (galleriesList.some(x => x.id === g.id) ? g.id : galleriesList[0]?.id);
  const idIn = el('input'); idIn.value = m.id || ''; idIn.size = 18;
  const nameIn = el('input'); nameIn.value = g.new ? g.name || '' : ''; nameIn.placeholder = 'Gallery name';
  const authorIn = el('input'); authorIn.value = g.new ? g.author || '' : ''; authorIn.placeholder = 'Author(s)';
  const folderIn = el('input'); folderIn.placeholder = 'Folder'; folderIn.size = 28;
  const newBox = el('p');
  newBox.append('Name ', nameIn, '  Author ', authorIn, '  Folder ', folderIn);
  const choose = el('p');
  choose.append('Gallery ', sel, '   Image id ', idIn);
  const cmd = el('pre');
  const copy = el('button', 'Copy command', 'back-btn');
  copy.style.marginBottom = '0';
  const q = s => '"' + String(s).replace(/(["\\$`])/g, '\\$1') + '"';
  let folderEdited = false;
  folderIn.addEventListener('input', () => { folderEdited = true; update(); });
  function update() {
    const isNew = sel.value === '__new';
    newBox.style.display = isNew ? '' : 'none';
    if (isNew && !folderEdited) folderIn.value = camel(nameIn.value) + (authorIn.value ? '_' + camel(authorIn.value) : '');
    let c = 'python3 import_submission.py ' + q('~/Downloads/' + fileName).replace('"~/', '~/"');
    c += isNew ? ' --new-gallery ' + q(nameIn.value) + ' --author ' + q(authorIn.value) + ' --gallery ' + q(folderIn.value)
               : ' --gallery ' + q(sel.value);
    if (idIn.value && idIn.value !== m.id) c += ' --id ' + q(idIn.value);
    cmd.textContent = c;
  }
  [sel, idIn, nameIn, authorIn].forEach(x => x.addEventListener('input', update));
  copy.addEventListener('click', () => {
    navigator.clipboard.writeText(cmd.textContent).then(() => { copy.textContent = 'Copied'; setTimeout(() => { copy.textContent = 'Copy command'; }, 1500); });
  });
  update();
  panel.append(choose, newBox, cmd, copy);
  const note = el('p', 'Run it in the deeplooking folder (fix the path if the ZIP is not in Downloads). It checks the ZIP, copies it into galleries/, and updates gallery.json (and galleries.json for a new gallery). Then look it over locally, commit and push. To change anything first, open the ZIP in the staging page with "Open ZIP\u2026" and export it again.', 'muted');
  note.style.marginTop = '8px';
  panel.appendChild(note);
  panel.classList.remove('hidden');
}
