// Deep Looking Stage: segment -> lenses -> preview & refine -> export ZIP.
// Work in progress is kept in this browser's IndexedDB, so a reload loses nothing.

const $ = id => document.getElementById(id);

// Small DOM builder: h('button', {className: 'x', onclick}, 'text', child...)
function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'style') el.style.cssText = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k in el) el[k] = v;
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
  return el;
}

// ------------------------------------------------------------------ state ---

const S = freshState();
let imageCanvas = null, maskCanvas = null;   // runtime only
let labelIdx = null, mw = 0, mh = 0;         // per-pixel segment index at hover resolution
const HOVER_MAX = 1600;

function freshState() {
  return {
    version: 1, name: '', savedAt: 0,
    imageBlob: null, w: 0, h: 0, include: '',
    seg: null,        // {segments: [{label, dir, color, rgb, colorRule, coverage, tabs}], unlabeled, notes, prompt, text, model, offPalette, seconds, maskBlob, rawBlob}
    profile: { kind: 'lamesh', science: '', art: '', modes: {}, userLenses: [{ name: '', mode: 'ai' }], about: '', level: DEFAULT_LEVEL, whole: true },
    wholeTabs: [],
    generated: false,
    models: { seg: SEG_MODELS[0][0], text: TEXT_MODELS[0][0], image: IMAGE_MODELS[0][0] },
    ex: { title: '', credit: '', gallery: '', newName: '', newAuthor: '', notes: '' },
    sel: { target: 0, tab: 0 },
  };
}

function resetState(next = freshState()) {
  for (const k of Object.keys(S)) delete S[k];
  Object.assign(S, next);
}

// --- IndexedDB persistence ---
const DB = {
  open() {
    return new Promise((ok, fail) => {
      const r = indexedDB.open('deeplooking-stage', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('work');
      r.onsuccess = () => ok(r.result);
      r.onerror = () => fail(r.error);
    });
  },
  async get() {
    const db = await this.open();
    return new Promise(ok => { const r = db.transaction('work').objectStore('work').get('current'); r.onsuccess = () => ok(r.result); r.onerror = () => ok(null); });
  },
  async put(v) {
    const db = await this.open();
    return new Promise(ok => { const t = db.transaction('work', 'readwrite'); t.objectStore('work').put(v, 'current'); t.oncomplete = ok; t.onerror = ok; });
  },
  async clear() {
    const db = await this.open();
    return new Promise(ok => { const t = db.transaction('work', 'readwrite'); t.objectStore('work').delete('current'); t.oncomplete = ok; t.onerror = ok; });
  },
};
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (!S.imageBlob) return;
    S.savedAt = Date.now();
    DB.put(S).catch(() => {});  // structured clone keeps the Blobs
  }, 400);
}

// ------------------------------------------------------------- key / cost ---

function renderKey() {
  const has = !!OpenRouter.key;
  $('keyChip').textContent = has ? 'Key entered' : 'No key';
  $('keyChip').className = 'chip ' + (has ? 'ok' : 'no');
  $('keyBtn').textContent = has ? 'Change key' : 'Enter OpenRouter key';
}
OpenRouter.onSpend = total => { $('spent').hidden = false; $('spent').textContent = `Spent this session: $${total.toFixed(4)}`; };

$('keyBtn').addEventListener('click', () => openKeyDialog());
function openKeyDialog() {
  $('keyInput').value = OpenRouter.key;
  try { $('keyRemember').checked = !!localStorage.getItem(KEY_STORE); } catch (e) { /* storage blocked */ }
  $('keyDialog').showModal();
  $('keyInput').focus();
}
$('keyDialog').addEventListener('close', () => {
  if ($('keyDialog').returnValue === 'save') { OpenRouter.setKey($('keyInput').value, $('keyRemember').checked); renderKey(); }
});
$('forgetBtn').addEventListener('click', () => { OpenRouter.forgetKey(); $('keyInput').value = ''; renderKey(); $('keyDialog').close('cancel'); });
$('signInBtn').addEventListener('click', () => {
  sessionStorage.setItem('deeplooking.remember', $('keyRemember').checked ? '1' : '');
  OpenRouter.startSignIn();
});
function ensureKey() {
  if (OpenRouter.key) return true;
  openKeyDialog();
  return false;
}

// -------------------------------------------------------------- statuses ---

function setStatus(id, msg, isErr = false) {
  $(id).className = 'status' + (isErr ? ' err' : '');
  $(id).textContent = msg;
}
function busy(id, label) {
  const t0 = Date.now();
  const tick = () => {
    $(id).className = 'status';
    $(id).replaceChildren(h('span', { className: 'spinner' }), `${typeof label === 'function' ? label() : label}… ${Math.round((Date.now() - t0) / 1000)}s`);
  };
  tick();
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
}

const urls = new WeakMap();  // Blob -> object URL
const blobURL = b => { if (!urls.has(b)) urls.set(b, URL.createObjectURL(b)); return urls.get(b); };

// --------------------------------------------------------- 1. image input ---

const drop = $('drop');
drop.addEventListener('click', () => $('file').click());
drop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') $('file').click(); });
$('file').addEventListener('change', e => e.target.files[0] && setFile(e.target.files[0]));
['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => {
  const f = [...e.dataTransfer.files].find(f => f.type.startsWith('image/'));
  if (f) setFile(f); else setStatus('segStatus', 'That does not look like an image file.', true);
});
document.addEventListener('paste', e => {
  if (e.target.closest('input, textarea')) return;
  const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'));
  if (item) setFile(new File([item.getAsFile()], 'pasted.png', { type: item.type }));
});

async function setFile(f) {
  if (S.generated && !confirm('Start over with a new image? The current segments and tabs will be replaced.')) return;
  let canvas;
  try { canvas = await canvasFromBlob(f); }
  catch (e) { return setStatus('segStatus', 'Could not read that image (' + f.name + '). Try a JPEG or PNG.', true); }
  // Re-encode with orientation applied; this also drops EXIF metadata such as GPS.
  const blob = await canvasBlob(canvas, 'image/jpeg', 0.95);
  const keep = { models: S.models, profile: S.profile, ex: { ...S.ex, title: '' } };
  resetState({ ...freshState(), ...keep, name: slug(f.name.replace(/\.[^.]+$/, '')).slice(0, 60), imageBlob: blob, w: canvas.width, h: canvas.height });
  imageCanvas = canvas; maskCanvas = null; labelIdx = null;
  $('include').value = '';
  setStatus('segStatus', '');
  renderAll();
  save();
}

function renderDrop() {
  if (!S.imageBlob) {
    $('dropInner').replaceChildren(h('div', { className: 'hint' }, 'Drag & drop an image here, click to choose a file, or paste from the clipboard'));
  } else {
    $('dropInner').replaceChildren(
      h('img', { src: blobURL(S.imageBlob), alt: S.name }),
      h('div', { className: 'name' }, `${S.name} · ${S.w}×${S.h}`),
      h('div', { className: 'hint' }, 'Click or drop to replace'));
  }
  $('segBtn').disabled = !S.imageBlob;
}

// ------------------------------------------------------------ 1. segment ---

for (const [id, name] of SEG_MODELS) $('segModel').add(new Option(name, id));
$('segModel').addEventListener('change', e => { S.models.seg = e.target.value; save(); });
$('include').addEventListener('input', e => { S.include = e.target.value; save(); });

$('segBtn').addEventListener('click', async () => {
  if (!imageCanvas || !ensureKey()) return;
  $('segBtn').disabled = true;
  const stop = busy('segStatus', 'Segmenting with ' + $('segModel').selectedOptions[0].text);
  try {
    const r = await segmentImage(imageCanvas, { model: S.models.seg, include: S.include });
    const old = Object.fromEntries((S.seg?.segments || []).map(s => [s.label.toLowerCase(), s.tabs]));
    S.seg = {
      ...r, mask: undefined, raw: undefined,
      maskBlob: await canvasBlob(r.mask), rawBlob: await canvasBlob(r.raw),
      segments: r.segments.map(s => ({ ...s, dir: slug(s.label), tabs: old[s.label.toLowerCase()] || [] })),
    };
    maskCanvas = r.mask;
    uniquifyDirs();
    S.sel = { target: 0, tab: 0 };
    stop();
    setStatus('segStatus', `Done in ${r.seconds}s.`);
    renderAll();
    save();
  } catch (err) {
    stop();
    setStatus('segStatus', err.message + (err.text ? '\n\nModel said: ' + err.text.slice(0, 400) : ''), true);
  } finally {
    $('segBtn').disabled = false;
  }
});

function uniquifyDirs() {
  const seen = new Set();
  for (const s of S.seg.segments) {
    let d = slug(s.label), n = 2;
    while (seen.has(d) || d === 'wholeimage') d = slug(s.label) + '_' + n++;
    s.dir = d; seen.add(d);
  }
}

async function renderSeg() {
  $('segResults').hidden = !S.seg;
  if (!S.seg) return;
  const maskURL = blobURL(S.seg.maskBlob);
  await Promise.all([
    loadImg($('origImg'), blobURL(S.imageBlob)),
    loadImg($('maskImg'), maskURL),
    loadImg($('overlayImg'), maskURL),
  ]);
  buildLabelIndex();
  $('overlayImg').style.opacity = $('opacity').value / 100;
  renderSegTable();
  $('segNotes').replaceChildren(...S.seg.notes.map(n => h('li', {}, n)));
  $('segMeta').textContent = `${S.seg.model} via OpenRouter · ${S.w}×${S.h}` + (S.seg.seconds ? ` · ${S.seg.seconds}s` : '');
  $('rawText').textContent = S.seg.text || '(no text)';
  $('promptText').textContent = S.seg.prompt || '';
  $('rawBtn').hidden = !S.seg.rawBlob;
}
$('rawBtn').addEventListener('click', () => window.open(blobURL(S.seg.rawBlob), '_blank'));

function loadImg(img, src) {
  return new Promise((ok, fail) => { img.onload = ok; img.onerror = fail; img.src = src; });
}

function renderSegTable() {
  const rows = S.seg.segments.map((s, i) => {
    const input = h('input', { type: 'text', value: s.label, 'aria-label': 'Segment label' });
    input.addEventListener('change', () => renameSegment(i, input));
    const tr = h('tr', { onmouseenter: () => setHot(i), onmouseleave: () => setHot(-1) },
      h('td', {}, h('span', { className: 'sw-cell', style: `background:rgb(${s.rgb})` })),
      h('td', {}, input),
      h('td', {}, s.color),
      h('td', {}, h('code', {}, JSON.stringify(s.colorRule))),
      h('td', { className: 'num' }, ((s.coverage || 0) * 100).toFixed(1) + '%'),
      h('td', {}, h('button', { className: 'small', title: 'Remove this segment (its area becomes unlabeled)', onclick: () => deleteSegment(i) }, 'Remove')));
    tr.dataset.i = i;
    return tr;
  });
  for (const u of S.seg.unlabeled) {
    const input = h('input', { type: 'text', placeholder: 'Unlabeled: type a name to keep it' });
    input.addEventListener('change', () => nameUnlabeled(u, input));
    rows.push(h('tr', {},
      h('td', {}, h('span', { className: 'sw-cell', style: `background:rgb(${u.rgb})` })),
      h('td', {}, input), h('td', {}, u.color), h('td', {}),
      h('td', { className: 'num' }, ((u.coverage || 0) * 100).toFixed(1) + '%'), h('td', {})));
  }
  $('segRows').replaceChildren(...rows);
}

function labelTaken(label, except) {
  return S.seg.segments.some((s, j) => j !== except && s.label.toLowerCase() === label.toLowerCase());
}

function renameSegment(i, input) {
  const label = input.value.trim();
  if (!label || labelTaken(label, i)) {
    setStatus('segStatus', label ? `There is already a segment called "${label}".` : 'A segment needs a label.', true);
    input.value = S.seg.segments[i].label;
    return;
  }
  S.seg.segments[i].label = label;
  uniquifyDirs();
  setStatus('segStatus', '');
  renderAfterSegmentEdit(false);  // the table already shows the new label
}

function deleteSegment(i) {
  const s = S.seg.segments[i];
  if (s.tabs.length && !confirm(`Remove "${s.label}" and its ${s.tabs.length} tabs?`)) return;
  S.seg.segments.splice(i, 1);
  S.seg.unlabeled.push({ color: s.color, rgb: s.rgb, coverage: s.coverage });
  S.sel = { target: 0, tab: 0 };
  buildLabelIndex();
  renderAfterSegmentEdit();
}

function nameUnlabeled(u, input) {
  const label = input.value.trim();
  if (!label) return;
  if (labelTaken(label, -1)) { setStatus('segStatus', `There is already a segment called "${label}".`, true); return; }
  const seg = { label, color: u.color, rgb: u.rgb, colorRule: canonicalRule(u.rgb), coverage: u.coverage, tabs: [] };
  // Model-written rules might overlap the new canonical one; if so, use canonical rules throughout.
  if (S.seg.segments.some(s => rulesOverlap(s.colorRule, seg.colorRule))) for (const s of S.seg.segments) s.colorRule = canonicalRule(s.rgb);
  S.seg.segments.push(seg);
  S.seg.unlabeled = S.seg.unlabeled.filter(x => x !== u);
  uniquifyDirs();
  buildLabelIndex();
  renderAfterSegmentEdit();
}

function renderAfterSegmentEdit(table = true) {
  if (table) renderSegTable();
  renderSteps();
  renderEditor();
  renderProblems();
  save();
}

// Same colorRule matching the viewer uses, precomputed per pixel for fast hover.
function buildLabelIndex() {
  const m = $('maskImg');
  if (!m.naturalWidth || !S.seg) return;
  const scale = Math.min(1, HOVER_MAX / Math.max(m.naturalWidth, m.naturalHeight));
  mw = Math.round(m.naturalWidth * scale);
  mh = Math.round(m.naturalHeight * scale);
  const c = h('canvas', { width: mw, height: mh });
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(m, 0, 0, mw, mh);
  const px = ctx.getImageData(0, 0, mw, mh).data;
  const getIndex = (r, g, b) => S.seg.segments.findIndex(s => ruleMatches(s.colorRule, [r, g, b]));
  const cache = new Map();
  labelIdx = new Uint8Array(mw * mh);
  for (let p = 0, i = 0; i < labelIdx.length; i++, p += 4) {
    const key = (px[p] << 16) | (px[p + 1] << 8) | px[p + 2];
    let v = cache.get(key);
    if (v === undefined) { v = getIndex(px[p], px[p + 1], px[p + 2]); v = v < 0 ? 255 : v; cache.set(key, v); }
    labelIdx[i] = v;
  }
  const hl = $('hl'); hl.width = mw; hl.height = mh;
  hl.getContext('2d').clearRect(0, 0, mw, mh);
}

let hot = -1;
function setHot(i) {
  if (i === hot) return;
  hot = i;
  document.querySelectorAll('#segRows tr').forEach(tr => tr.classList.toggle('hot', tr.dataset.i !== undefined && +tr.dataset.i === i));
  const hl = $('hl'), ctx = hl.getContext('2d');
  ctx.clearRect(0, 0, mw, mh);
  if (i < 0 || !labelIdx) return;
  // Dim everything outside the hovered segment.
  const out = ctx.createImageData(mw, mh), d = out.data;
  for (let k = 0, p = 3; k < labelIdx.length; k++, p += 4) if (labelIdx[k] !== i) d[p] = 120;
  ctx.putImageData(out, 0, 0);
}

function segmentAt(img, e) {
  if (!labelIdx) return -1;
  const r = img.getBoundingClientRect();
  const x = Math.floor((e.clientX - r.left) / r.width * mw);
  const y = Math.floor((e.clientY - r.top) / r.height * mh);
  if (x < 0 || y < 0 || x >= mw || y >= mh) return -2;
  const i = labelIdx[y * mw + x];
  return i === 255 ? -1 : i;
}

const tip = $('tip');
$('hoverStage').addEventListener('mousemove', e => {
  const i = segmentAt($('origImg'), e);
  if (i === -2) return hideTip();
  setHot(i);
  tip.style.display = 'flex';
  tip.querySelector('.sw').style.background = i < 0 ? 'transparent' : `rgb(${S.seg.segments[i].rgb})`;
  tip.querySelector('.txt').textContent = i < 0 ? '(unlabeled)' : S.seg.segments[i].label;
  tip.style.left = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8) + 'px';
  tip.style.top = (e.clientY + 16) + 'px';
});
$('hoverStage').addEventListener('mouseleave', hideTip);
function hideTip() { tip.style.display = 'none'; setHot(-1); }
$('opacity').addEventListener('input', e => { $('overlayImg').style.opacity = e.target.value / 100; });

// The image sent with a segment's tab request: that segment as-is, the rest dimmed.
function focusImage(i) {
  const max = 1024, s = Math.min(1, max / Math.max(S.w, S.h));
  const c = h('canvas', { width: Math.round(S.w * s), height: Math.round(S.h * s) });
  const ctx = c.getContext('2d');
  ctx.drawImage(imageCanvas, 0, 0, c.width, c.height);
  if (i >= 0 && labelIdx) {
    const o = h('canvas', { width: mw, height: mh }), octx = o.getContext('2d');
    const img = octx.createImageData(mw, mh), d = img.data;
    for (let k = 0, p = 0; k < labelIdx.length; k++, p += 4) if (labelIdx[k] !== i) { d[p + 3] = 170; }
    octx.putImageData(img, 0, 0);
    ctx.drawImage(o, 0, 0, c.width, c.height);
  }
  return c.toDataURL('image/jpeg', 0.88);
}

// ------------------------------------------------------------- 2. lenses ---

for (const [kind, p] of Object.entries(PROFILES)) {
  const radio = h('input', { type: 'radio', name: 'profile', value: kind });
  radio.addEventListener('change', () => { S.profile.kind = kind; renderProfile(); save(); });
  $('profiles').append(h('label', { className: 'profile' }, h('b', {}, radio, p.name), h('span', {}, p.blurb)));
}
for (const [id, name] of TEXT_MODELS) $('textModel').add(new Option(name, id));
for (const [id, name] of IMAGE_MODELS) $('imageModel').add(new Option(name, id));
$('textModel').addEventListener('change', e => { S.models.text = e.target.value; save(); });
$('imageModel').addEventListener('change', e => { S.models.image = e.target.value; save(); });
const bindProfile = (id, key, ev = 'input') => $(id).addEventListener(ev, e => {
  S.profile[key] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; save();
});
bindProfile('prefScience', 'science'); bindProfile('prefArt', 'art');
['prefScience', 'prefArt'].forEach(id => $(id).addEventListener('change', () => renderProfile()));
bindProfile('about', 'about'); bindProfile('level', 'level');
bindProfile('wholeOn', 'whole', 'change');
$('addUserLens').addEventListener('click', () => { S.profile.userLenses.push({ name: '', mode: 'ai' }); renderProfile(); });

function renderProfile() {
  const p = S.profile;
  document.querySelectorAll('input[name=profile]').forEach(r => { r.checked = r.value === p.kind; });
  $('pane-scienceart').hidden = p.kind !== 'scienceart';
  $('pane-user').hidden = p.kind !== 'user';
  $('prefScience').value = p.science; $('prefArt').value = p.art;
  $('about').value = p.about; $('level').value = p.level; $('wholeOn').checked = p.whole;
  $('textModel').value = S.models.text; $('imageModel').value = S.models.image; $('segModel').value = S.models.seg;
  // AI-or-me choice for the fixed lenses of LA MESH and Science/Art
  if (!p.modes) p.modes = {};
  $('pane-modes').hidden = p.kind === 'user';
  $('lensModes').replaceChildren(...(p.kind === 'user' ? [] : profileLenses(p).map(l => {
    const mode = h('select', {}, new Option('AI drafts it', 'ai'), new Option("I'll write it", 'self'));
    mode.value = p.modes[l.lens] === 'self' ? 'self' : 'ai';
    mode.addEventListener('change', () => { p.modes[l.lens] = mode.value; save(); });
    return h('div', { className: 'lens-row' }, h('span', { style: 'min-width:140px' }, l.name), mode);
  })));
  $('userLenses').replaceChildren(...p.userLenses.map((l, i) => {
    const name = h('input', { type: 'text', value: l.name, placeholder: 'Lens name, e.g. Ecology or Personal' });
    name.addEventListener('input', () => { l.name = name.value; save(); });
    const mode = h('select', {}, new Option('AI drafts it', 'ai'), new Option("I'll write it", 'self'));
    mode.value = l.mode;
    mode.addEventListener('change', () => { l.mode = mode.value; save(); });
    const del = h('button', { className: 'small', onclick: () => { p.userLenses.splice(i, 1); renderProfile(); save(); } }, 'Remove');
    return h('div', { className: 'lens-row' }, name, mode, del);
  }));
  $('genBtn').textContent = S.generated ? 'REGENERATE ALL TABS' : 'GENERATE TABS';
}

function targets() {
  const t = S.seg.segments.map((s, i) => ({ i, label: s.label, seg: s }));
  if (S.profile.whole) t.push({ i: -1, label: 'Whole image', whole: true });
  return t;
}

$('genBtn').addEventListener('click', async () => {
  if (!S.seg?.segments.length) return;
  const lenses = profileLenses(S.profile);
  if (!lenses.length) return setStatus('genStatus', 'Add at least one lens with a name.', true);
  if (lenses.some(l => !l.lens)) return setStatus('genStatus', 'Every lens needs a name.', true);
  const dup = lenses.find((l, i) => lenses.findIndex(o => o.lens === l.lens) !== i);
  if (dup) return setStatus('genStatus', `Two lenses have the same name ("${dup.name}").`, true);
  if (lenses.some(l => l.author === 'ai') && !ensureKey()) return;
  if (S.generated && !confirm('Replace all existing tabs with new ones? Your edits will be lost.')) return;

  const list = targets();
  let done = 0;
  const errors = [];
  $('genBtn').disabled = true;
  const stop = busy('genStatus', () => `Writing tabs: ${done} of ${list.length} done`);
  if (!S.profile.whole) S.wholeTabs = [];
  await pool(list, 3, async t => {
    try {
      const tabs = await generateTabs({
        target: t, lenses, about: S.profile.about, level: S.profile.level, model: S.models.text,
        focusURL: t.whole ? canvasDataURL(imageCanvas, 1024, 0.88) : focusImage(t.i),
      });
      if (t.whole) S.wholeTabs = tabs; else t.seg.tabs = tabs;
    } catch (e) {
      errors.push(`${t.label}: ${e.message}`);
    }
    done++;
    S.generated = true;
    renderSteps(); renderEditor(); save();
  });
  stop();
  $('genBtn').disabled = false;
  if (errors.length) setStatus('genStatus', 'Some tabs could not be written; select them below and use "Regenerate":\n' + errors.join('\n'), true);
  else setStatus('genStatus', 'Done. Preview and refine the tabs below.');
  renderProfile();
  renderProblems();
  $('step3').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

async function pool(items, n, fn) {
  const queue = [...items];
  await Promise.all(Array.from({ length: Math.min(n, queue.length) }, async () => {
    while (queue.length) await fn(queue.shift());
  }));
}

// ---------------------------------------------------- 3. preview & refine ---

const pvTooltip = h('div', { className: 'segment-tooltip', style: 'display:none' });
document.body.append(pvTooltip);

// Tabs as the viewer's popup expects them.
const popupLenses = tabs => tabs.map(t => ({
  lens: t.lens, name: t.name, title: t.title || t.name, poet: t.poet || (t.author === 'user' ? S.ex.credit : ''),
  url: t.url, image: t.image?.blob ? blobURL(t.image.blob) : '', keyword: t.keyword,
  text: t.text || '(not written yet)', loc: t.loc,
}));

$('pvImg').addEventListener('mousemove', e => {
  const i = segmentAt($('pvImg'), e);
  const seg = S.seg?.segments[i];
  if (i >= 0 && seg.tabs.length) {
    pvTooltip.textContent = seg.label;
    pvTooltip.style.left = (e.clientX + 14) + 'px';
    pvTooltip.style.top = (e.clientY + 14) + 'px';
    pvTooltip.style.display = 'block';
  } else pvTooltip.style.display = 'none';
});
$('pvImg').addEventListener('mouseleave', () => { pvTooltip.style.display = 'none'; });
$('pvImg').addEventListener('click', e => {
  const i = segmentAt($('pvImg'), e);
  const seg = S.seg?.segments[i];
  if (i < 0 || !seg) return;
  selectTarget(i);
  if (seg.tabs.length) createPopup(popupLenses(seg.tabs), e.clientX, e.clientY);
});
$('pvWhole').addEventListener('click', e => {
  e.stopPropagation();
  selectTarget('whole');
  const r = $('pvWhole').getBoundingClientRect();
  if (S.wholeTabs.length) createPopup(popupLenses(S.wholeTabs), r.left - 310, r.bottom + 8);
});

function selectTarget(t) { S.sel = { target: t, tab: 0 }; renderEditor(); }
function currentTarget() {
  if (S.sel.target === 'whole') return { whole: true, label: 'Whole image', tabs: S.wholeTabs, i: -1 };
  const seg = S.seg?.segments[S.sel.target] || S.seg?.segments[0];
  if (!seg) return null;
  return { label: seg.label, tabs: seg.tabs, i: S.seg.segments.indexOf(seg), seg };
}
function setTargetTabs(t, tabs) { if (t.whole) S.wholeTabs = tabs; else t.seg.tabs = tabs; }

function renderPreview() {
  if (!S.imageBlob) return;
  if ($('pvImg').src !== blobURL(S.imageBlob)) $('pvImg').src = blobURL(S.imageBlob);
  $('pvWhole').style.display = S.wholeTabs.length ? 'flex' : 'none';
}

function renderEditor() {
  renderPreview();
  const t = currentTarget();
  if (!t) return;
  const tgt = S.seg.segments.map((s, i) => h('button', {
    className: 'small' + (S.sel.target === i ? ' on' : ''), onclick: () => selectTarget(i),
  }, s.label, s.tabs.length ? '' : ' (no tabs)'));
  if (S.profile.whole || S.wholeTabs.length) tgt.push(h('button', { className: 'small' + (t.whole ? ' on' : ''), onclick: () => selectTarget('whole') }, 'Whole image'));
  $('targets').replaceChildren(...tgt);

  renderChips(t);

  const tab = t.tabs[Math.min(S.sel.tab, t.tabs.length - 1)];
  if (!tab) {
    $('tabEditor').replaceChildren(h('p', { className: 'meta' }, S.generated ? 'No tabs here yet. Add a lens above.' : 'Generate tabs in step 2, or add a lens above.'));
    return;
  }
  $('tabEditor').replaceChildren(tabForm(t, tab));
}

function renderChips(t = currentTarget()) {
  const chips = t.tabs.map((tab, j) => h('button', {
    className: 'small' + (S.sel.tab === j ? ' on' : ''), onclick: () => { S.sel.tab = j; renderEditor(); },
  }, tab.name, !tab.text ? h('span', { className: 'badge empty' }, 'empty') : h('span', { className: 'badge' }, tab.author === 'user' ? 'you' : 'AI')));
  const newName = h('input', { type: 'text', placeholder: 'New lens', style: 'width:140px;padding:3px 8px' });
  const newMode = h('select', { style: 'padding:3px 6px' }, new Option('AI drafts it', 'ai'), new Option("I'll write it", 'self'));
  chips.push(newName, newMode, h('button', { className: 'small', onclick: () => addLens(t, newName.value, newMode.value) }, '+ Add lens'));
  $('tabchips').replaceChildren(...chips);
}

function tabForm(t, tab) {
  const field = (label, key, opts = {}) => {
    const input = opts.area ? h('textarea', { rows: 8 }) : h('input', { type: 'text', placeholder: opts.ph || '' });
    input.value = tab[key] || '';
    input.addEventListener('input', () => {
      tab[key] = input.value;
      if (['title', 'text'].includes(key) && tab.author === 'ai') tab.author = 'ai+user';
      if (key === 'text') { renderProblems(); renderChips(t); }
      save();
    });
    return h('label', { className: 'field' + (opts.grow ? ' grow' : '') }, label, input);
  };
  const nameInput = h('input', { type: 'text', value: tab.name });
  nameInput.addEventListener('change', () => {
    const name = nameInput.value.trim(), lens = lensSlug(name);
    if (!name || t.tabs.some(o => o !== tab && o.lens === lens)) { nameInput.value = tab.name; return; }
    tab.name = name; tab.lens = lens; save(); renderEditor();
  });
  const who = { ai: 'Written by AI', user: 'Written by you', 'ai+user': 'AI draft, edited by you' }[tab.author] || '';

  // Image
  const imgStatus = h('div', { className: 'status' });
  const run = async (label, fn) => {
    const stop = (() => { imgStatus.replaceChildren(h('span', { className: 'spinner' }), label + '…'); return () => {}; })();
    try { await fn(); stop(); save(); renderEditor(); }
    catch (e) { imgStatus.className = 'status err'; imgStatus.textContent = e.message; }
  };
  const upload = h('input', { type: 'file', accept: 'image/*', hidden: true });
  upload.addEventListener('change', () => {
    const f = upload.files[0];
    if (!f) return;
    const ext = (f.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    tab.image = { blob: f, ext, source: 'uploaded: ' + f.name };
    save(); renderEditor();
  });
  const imgbox = h('div', { className: 'imgbox' },
    tab.image?.blob ? h('img', { src: blobURL(tab.image.blob), alt: '' }) : h('div', { className: 'noimg' }, 'No image'),
    h('div', {},
      h('div', { className: 'btns' },
        h('button', { className: 'small', title: 'Lead image of the linked Wikipedia article (Wikimedia Commons)', onclick: () => run('Looking on Wikimedia', async () => {
          const img = await findWikimediaImage(tab);
          if (!img) throw new Error('No freely licensed Wikimedia image for this article. Try Generate or Upload.');
          tab.image = img;
        }) }, 'Wikimedia'),
        h('button', { className: 'small', onclick: () => ensureKey() && run('Generating image', async () => {
          tab.image = await generateTabImage({ tab, model: S.models.image, level: S.profile.level });
        }) }, 'Generate'),
        h('button', { className: 'small', onclick: () => upload.click() }, 'Upload'),
        tab.image ? h('button', { className: 'small', onclick: () => { tab.image = null; save(); renderEditor(); } }, 'Remove') : null,
        upload),
      tab.image?.source ? h('div', { className: 'src' }, tab.image.source) : null,
      imgStatus));

  // Revise
  const instr = h('input', { type: 'text', placeholder: tab.text ? 'Ask for a change, e.g. "focus on tidal flow"' : 'Optional: what should this tab be about?' });
  const revStatus = h('div', { className: 'status' });
  const revise = h('button', { className: 'small', onclick: async () => {
    if (!ensureKey()) return;
    revise.disabled = true;
    const stop = busy(revStatus.id = 'rev' + Date.now(), tab.text ? 'Rewriting' : 'Drafting');
    try {
      const out = await reviseTab({
        target: t, tab, about: S.profile.about, level: S.profile.level, model: S.models.text,
        focusURL: t.whole ? canvasDataURL(imageCanvas, 1024, 0.88) : focusImage(t.i), instruction: instr.value.trim(),
      });
      stop();
      t.tabs[t.tabs.indexOf(tab)] = out;
      save(); renderEditor(); renderProblems();
    } catch (e) {
      stop(); revStatus.className = 'status err'; revStatus.textContent = e.message; revise.disabled = false;
    }
  } }, tab.text ? 'Regenerate' : 'Draft with AI');

  const del = h('button', { className: 'small', onclick: () => {
    if (!confirm(`Delete the "${tab.name}" tab?`)) return;
    setTargetTabs(t, t.tabs.filter(o => o !== tab));
    S.sel.tab = 0; save(); renderEditor(); renderProblems();
  } }, 'Delete tab');

  return h('div', {},
    h('div', { className: 'who' }, `${t.label} · ${tab.name} · ${who}`),
    h('div', { className: 'row' },
      h('label', { className: 'field' }, 'Tab name', nameInput),
      field('Title', 'title')),
    h('div', { className: 'row' },
      field('Link (title opens it)', 'url', { ph: 'https://…' }),
      field('Byline', 'poet', { ph: tab.author === 'user' ? 'Defaults to your name' : 'Author, poet, artist…' })),
    imgbox,
    field('Text', 'text', { area: true }),
    h('div', { className: 'row' },
      field('Highlight word', 'keyword'),
      field('Library of Congress class', 'loc', { ph: 'e.g. QH540' })),
    h('div', { className: 'revise' }, instr, revise, del),
    revStatus);
}

async function addLens(t, name, mode) {
  name = name.trim();
  if (!name) return;
  const l = { lens: lensSlug(name), name, guide: name + '.', author: mode === 'self' ? 'user' : 'ai' };
  if (t.tabs.some(o => o.lens === l.lens)) return;
  if (l.author === 'ai' && !ensureKey()) return;
  const tabs = l.author === 'ai'
    ? await generateTabs({ target: t, lenses: [l], about: S.profile.about, level: S.profile.level, model: S.models.text,
                           focusURL: t.whole ? canvasDataURL(imageCanvas, 1024, 0.88) : focusImage(t.i) })
        .catch(e => { alert(e.message); return null; })
    : [blankTab(l)];
  if (!tabs) return;
  setTargetTabs(t, [...t.tabs, ...tabs]);
  S.sel.tab = t.tabs.length;  // the new tab (t.tabs is the old array)
  S.generated = true;
  save(); renderEditor(); renderProblems(); renderSteps();
}

// ------------------------------------------------------------- 4. export ---

let galleries = [];
fetch('galleries.json').then(r => r.json()).then(g => { galleries = g; renderExport(); }).catch(() => renderExport());

const bindEx = (id, key) => $(id).addEventListener('input', e => { S.ex[key] = e.target.value; renderProblems(); save(); });
bindEx('exTitle', 'title'); bindEx('exCredit', 'credit'); bindEx('exNewName', 'newName');
bindEx('exNewAuthor', 'newAuthor'); bindEx('exNotes', 'notes');
$('exGallery').addEventListener('change', e => { S.ex.gallery = e.target.value; renderExport(); renderProblems(); save(); });

function renderExport() {
  const sel = $('exGallery');
  sel.replaceChildren(new Option('Choose…', ''), ...galleries.map(g => new Option(`${g.name} (${g.author})`, g.id)), new Option('New gallery…', '__new'));
  sel.value = S.ex.gallery;
  $('newGalleryName').hidden = $('newGalleryAuthor').hidden = S.ex.gallery !== '__new';
  $('exTitle').value = S.ex.title; $('exCredit').value = S.ex.credit;
  $('exNewName').value = S.ex.newName; $('exNewAuthor').value = S.ex.newAuthor; $('exNotes').value = S.ex.notes;
}

// Folder name in the gallery: from the title's first words, else the file name.
function imageId() {
  const fromTitle = slug(S.ex.title.split(/[,(—]/)[0]).split('_').slice(0, 4).join('_');
  return (S.ex.title.trim() ? fromTitle : S.name) || 'image';
}

function problems() {
  const p = [];
  if (!S.seg?.segments.length) return ['Segment the image first.'];
  if (!S.ex.title.trim()) p.push('Add a title.');
  if (!S.ex.credit.trim()) p.push('Add your name.');
  if (!S.ex.gallery) p.push('Choose a gallery to suggest (or "New gallery…").');
  if (S.ex.gallery === '__new' && !S.ex.newName.trim()) p.push('Name the new gallery.');
  const all = [...S.seg.segments.map(s => [s.label, s.tabs]), ['Whole image', S.wholeTabs]];
  if (!all.some(([, tabs]) => tabs.length)) p.push('There are no tabs yet.');
  for (const [label, tabs] of all) for (const t of tabs) if (!t.text.trim()) p.push(`${label} / ${t.name} has no text yet.`);
  const bare = S.seg.segments.filter(s => !s.tabs.length).map(s => s.label);
  if (bare.length) p.push(`No tabs (visitors can't open these): ${bare.join(', ')}. That's fine if intended.`);
  return p;
}

function renderProblems() {
  const p = problems();
  $('problems').replaceChildren(...(p.length ? p.map(x => h('li', {}, x)) : [h('li', { className: 'ok' }, 'Ready to export.')]));
}

$('exportBtn').addEventListener('click', async () => {
  const p = problems().filter(x => !x.startsWith('No tabs ('));
  if (p.length && !confirm('Export anyway?\n\n' + p.join('\n'))) return;
  const stop = busy('exStatus', 'Building ZIP');
  try {
    const byline = t => ({ ...t, poet: t.poet || (t.author === 'user' ? S.ex.credit.trim() : '') });
    const id = imageId();
    const lenses = profileLenses(S.profile);
    const blob = await buildSubmissionZip({
      id, title: S.ex.title.trim(), credit: S.ex.credit.trim(),
      imageBlob: S.imageBlob, maskBlob: S.seg.maskBlob,
      segments: S.seg.segments.map(s => ({ ...s, tabs: s.tabs.map(byline) })),
      wholeTabs: S.wholeTabs.map(byline),
      submission: {
        tool: 'Deep Looking Stage', format: 1, created: new Date().toISOString(),
        contributor: S.ex.credit.trim(),
        gallery: S.ex.gallery === '__new' ? { new: true, name: S.ex.newName.trim(), author: S.ex.newAuthor.trim() || S.ex.credit.trim() }
                                          : { id: S.ex.gallery, name: galleries.find(g => g.id === S.ex.gallery)?.name || '' },
        notes: S.ex.notes.trim(),
        profile: { kind: S.profile.kind, name: PROFILES[S.profile.kind].name, lenses: lenses.map(l => l.name),
                   science: S.profile.science || undefined, art: S.profile.art || undefined },
        about: S.profile.about, level: S.profile.level,
        models: { segmentation: S.seg.model, text: S.models.text, image: S.models.image },
      },
    });
    stop();
    const a = h('a', { href: URL.createObjectURL(blob), download: `${id}-deeplooking.zip` });
    document.body.append(a); a.click(); a.remove();
    setStatus('exStatus', `Saved ${id}-deeplooking.zip (${(blob.size / 1e6).toFixed(1)} MB). Send it to the gallery curator.`);
  } catch (e) {
    stop(); setStatus('exStatus', e.message, true);
  }
});

// ----------------------------------------------- open a ZIP to keep editing ---

$('openZipBtn').addEventListener('click', () => $('zipFile').click());
$('zipFile').addEventListener('change', async e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  if (S.generated && !confirm('Replace the current work with this ZIP?')) return;
  try { await loadZip(f); }
  catch (err) { setStatus('segStatus', 'Could not open that ZIP: ' + err.message, true); }
});

async function loadZip(f) {
  const sub = await readSubmissionZip(f);
  const m = sub.manifest, info = sub.submission || {};
  const imageBlob = await sub.blob(m.image);
  imageCanvas = await canvasFromBlob(imageBlob);
  const maskBlob = await sub.blob(m.mask);
  maskCanvas = await canvasFromBlob(maskBlob);
  const tabsOf = async (found) => Promise.all(found.map(async t => ({
    lens: t.lens, name: t.tab || lensDisplayNames[t.lens] || t.lens, title: t.title || '', poet: t.poet || '', url: t.url || '',
    keyword: t.keyword || '', loc: t.loc || '', text: t.text || '', author: t.author || 'user', wikipedia: '',
    image: t.image && sub.has(`${t.dir}/${t.image}`)
      ? { blob: await sub.blob(`${t.dir}/${t.image}`), ext: t.image.split('.').pop(), source: t.imagesource || '' } : null,
  })));
  const found = await readSubmissionTabs(sub);

  // Palette colors present in the mask, to recover color names and unlabeled areas.
  const px = maskCanvas.getContext('2d').getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
  const counts = new Map();
  for (let p = 0; p < px.length; p += 4 * 7) { const k = px[p] + ',' + px[p + 1] + ',' + px[p + 2]; counts.set(k, (counts.get(k) || 0) + 1); }
  const total = px.length / (4 * 7);
  const present = PAL_NAMES.filter(n => (counts.get(PALETTE[n].join(',')) || 0) / total > 0.0005);
  const segments = [];
  for (const s of m.segments || []) {
    const color = PAL_NAMES.find(n => ruleMatches(s.colorRule, PALETTE[n])) || 'Gray';
    segments.push({ label: s.label, dir: s.dir, color, rgb: [...PALETTE[color]], colorRule: s.colorRule,
                    coverage: (counts.get(PALETTE[color].join(',')) || 0) / total, tabs: await tabsOf(found.segments[s.label] || []) });
  }
  const claimed = new Set(segments.map(s => s.color));
  const kind = info.profile?.kind in PROFILES ? info.profile.kind : 'user';
  resetState({
    ...freshState(),
    name: m.id, imageBlob, w: imageCanvas.width, h: imageCanvas.height,
    seg: {
      segments, notes: [`Opened from ${f.name}.`], prompt: '', text: '', model: info.models?.segmentation || '', offPalette: 0,
      unlabeled: present.filter(n => !claimed.has(n)).map(n => ({ color: n, rgb: [...PALETTE[n]], coverage: (counts.get(PALETTE[n].join(',')) || 0) / total })),
      maskBlob, rawBlob: null,
    },
    wholeTabs: await tabsOf(found.whole),
    generated: true,
    profile: { ...freshState().profile, kind, modes: {}, science: info.profile?.science || '', art: info.profile?.art || '',
               about: info.about || '', level: info.level || DEFAULT_LEVEL, whole: (m.imageLenses || []).length > 0 },
    ex: { title: m.title || '', credit: m.credit || info.contributor || '',
          gallery: info.gallery?.new ? '__new' : (info.gallery?.id || ''), newName: info.gallery?.new ? info.gallery.name : '',
          newAuthor: info.gallery?.new ? info.gallery.author : '', notes: info.notes || '' },
  });
  if (info.models?.text) S.models.text = info.models.text;
  if (info.models?.image) S.models.image = info.models.image;
  setStatus('segStatus', `Opened ${f.name}.`);
  await renderAll();
  save();
}

// ------------------------------------------------------------- rendering ---

function renderSteps() {
  const hasSeg = !!S.seg?.segments.length;
  $('step2').classList.toggle('locked', !hasSeg);
  const hasTabs = hasSeg && (S.generated || S.seg.segments.some(s => s.tabs.length));
  $('step3').classList.toggle('locked', !hasTabs);
  $('step4').classList.toggle('locked', !hasTabs);
}

async function renderAll() {
  renderDrop();
  $('include').value = S.include;
  renderProfile();
  renderExport();
  renderSteps();
  closeAllPopups();
  await renderSeg();
  renderEditor();
  renderProblems();
}

// ------------------------------------------------------------------ start ---

(async function start() {
  OpenRouter.loadSavedKey();
  try {
    if (await OpenRouter.finishSignIn(sessionStorage.getItem('deeplooking.remember') === '1')) setStatus('segStatus', 'Signed in with OpenRouter.');
  } catch (e) { setStatus('segStatus', e.message, true); }
  renderKey();
  await renderAll();

  const saved = await DB.get().catch(() => null);
  if (saved?.imageBlob) {
    $('resume').hidden = false;
    $('resumeText').textContent = `You have unfinished work on "${saved.ex?.title || saved.name}" from ${new Date(saved.savedAt).toLocaleString()}.`;
    $('resumeBtn').onclick = async () => {
      resetState({ ...freshState(), ...saved });
      imageCanvas = await canvasFromBlob(S.imageBlob);
      maskCanvas = S.seg?.maskBlob ? await canvasFromBlob(S.seg.maskBlob) : null;
      $('resume').hidden = true;
      await renderAll();
    };
    $('discardBtn').onclick = async () => { await DB.clear(); $('resume').hidden = true; };
  }
})();
