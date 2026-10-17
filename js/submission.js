// Submission ZIPs: written by stage.html, read by stage.html (to keep editing) and by the
// curator's "Review a submission" in index.html. Layout matches an image directory in
// galleries/<Gallery>/, plus submission.json:
//
//   <id>/manifest.json  <id>/<image>  <id>/segmentation_mask.png
//   <id>/<segment>/<lens>/<segment>.md (+ lens image)
//   <id>/wholeimage/<lens>/wholeimage.md (+ lens image)
//   <id>/submission.json   — contributor, suggested gallery, which tabs the AI wrote

const MD_FIELDS = ['title', 'tab', 'poet', 'url', 'image', 'imagesource', 'keyword', 'loc'];

function tabToMarkdown(tab, imageFile) {
  const one = s => String(s ?? '').replace(/\s+/g, ' ').trim();
  const meta = {
    title: one(tab.title) || one(tab.name), tab: one(tab.name), poet: one(tab.poet), url: one(tab.url),
    image: imageFile || '', imagesource: imageFile ? one(tab.image?.source) : '',
    keyword: one(tab.keyword), loc: one(tab.loc),
  };
  // The body starts after the first blank line, so it may contain blank lines of its own.
  return MD_FIELDS.map(k => k + ': ' + meta[k]).join('\n') + '\n\n' + String(tab.text ?? '').trim() + '\n';
}

// s: {id, imageBlob, maskBlob, segments: [{label, dir, colorRule, tabs}], wholeTabs,
//     title, credit, submission (object written as submission.json)}
async function buildSubmissionZip(s) {
  const zip = new JSZip();
  const root = zip.folder(s.id);
  const imageName = s.id + '.jpg';
  root.file(imageName, s.imageBlob);
  root.file('segmentation_mask.png', s.maskBlob);
  const authorship = {};

  async function addTab(dir, mdName, tab) {
    const folder = root.folder(dir + '/' + tab.lens);
    let imageFile = '';
    if (tab.image?.blob) {
      imageFile = tab.lens + '.' + (tab.image.ext || 'jpg');
      folder.file(imageFile, tab.image.blob);
    }
    folder.file(mdName + '.md', tabToMarkdown(tab, imageFile));
    authorship[dir + '/' + tab.lens] = tab.author;
  }

  for (const seg of s.segments) for (const tab of seg.tabs) await addTab(seg.dir, seg.dir, tab);
  for (const tab of s.wholeTabs) await addTab('wholeimage', 'wholeimage', tab);

  const manifest = {
    id: s.id,
    title: s.title || s.id,
    credit: s.credit || undefined,
    image: imageName,
    mask: 'segmentation_mask.png',
    imageLenses: s.wholeTabs.length ? s.wholeTabs.map(t => t.lens) : undefined,
    segments: s.segments.map(seg => ({ label: seg.label, dir: seg.dir, lenses: seg.tabs.map(t => t.lens), colorRule: seg.colorRule })),
  };
  root.file('manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  root.file('submission.json', JSON.stringify({ ...s.submission, authorship }, null, 2) + '\n');
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

// Read a submission ZIP (File/Blob). Returns {root, manifest, submission, has(path),
// text(path), blob(path), paths} with paths relative to the image directory.
async function readSubmissionZip(file) {
  const zip = await JSZip.loadAsync(file);
  const names = Object.keys(zip.files).filter(n => !zip.files[n].dir && !n.startsWith('__MACOSX/'));
  const manifestPath = names.filter(n => /(^|\/)manifest\.json$/.test(n)).sort((a, b) => a.length - b.length)[0];
  if (!manifestPath) throw new Error('This ZIP has no manifest.json, so it is not a Deep Looking submission.');
  const prefix = manifestPath.slice(0, -'manifest.json'.length);
  const rel = names.filter(n => n.startsWith(prefix)).map(n => n.slice(prefix.length));
  const entry = p => zip.file(prefix + p);
  const sub = {
    root: prefix.replace(/\/$/, ''),
    paths: rel,
    has: p => !!entry(p),
    text: p => entry(p).async('string'),
    blob: async p => {
      const b = await entry(p).async('blob');
      return new Blob([b], { type: mimeFor(p) });
    },
  };
  sub.manifest = JSON.parse(await sub.text('manifest.json'));
  sub.submission = sub.has('submission.json') ? JSON.parse(await sub.text('submission.json')) : null;
  return sub;
}

function mimeFor(p) {
  const ext = p.split('.').pop().toLowerCase();
  return { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
           mp4: 'video/mp4', md: 'text/markdown', json: 'application/json' }[ext] || 'application/octet-stream';
}

// Lens tabs of a submission as {segments: {label: [tab]}, whole: [tab]}, with the
// markdown parsed by the viewer's own parser. Image paths stay relative.
async function readSubmissionTabs(sub) {
  const m = sub.manifest, out = { segments: {}, whole: [] };
  const read = async (dir, mdName, lens) => {
    const path = `${dir}/${lens}/${mdName}.md`;
    if (!sub.has(path)) return null;
    const meta = parsePoemMarkdown(await sub.text(path));
    return { lens, path, dir: `${dir}/${lens}`, ...meta, author: sub.submission?.authorship?.[`${dir}/${lens}`] || '' };
  };
  for (const seg of m.segments || []) {
    out.segments[seg.label] = [];
    for (const lens of seg.lenses || []) {
      const t = await read(seg.dir, seg.dir, lens);
      if (t) out.segments[seg.label].push(t);
    }
  }
  for (const lens of m.imageLenses || []) {
    const t = await read('wholeimage', 'wholeimage', lens);
    if (t) out.whole.push(t);
  }
  return out;
}

// Problems a curator should know about before accepting. Returns [string].
async function checkSubmission(sub) {
  const m = sub.manifest, problems = [];
  for (const k of ['id', 'title', 'image', 'mask']) if (!m[k]) problems.push(`manifest.json has no "${k}".`);
  if (m.id && !/^[a-z0-9_-]+$/.test(m.id)) problems.push(`Image id "${m.id}" should be lowercase letters, digits, - or _.`);
  let size = null;
  for (const k of ['image', 'mask']) {
    if (m[k] && !sub.has(m[k])) { problems.push(`Missing ${k} file ${m[k]}.`); continue; }
    if (!m[k]) continue;
    try {
      const bmp = await createImageBitmap(await sub.blob(m[k]));
      const here = bmp.width + '×' + bmp.height;
      if (size && size !== here && m.segments?.length) problems.push(`Mask is ${here} but the image is ${size}; hover will be misaligned.`);
      size = size || here;
      bmp.close();
    } catch (e) { problems.push(`Could not read ${m[k]} as an image.`); }
  }
  const labels = new Set(), dirs = new Set();
  (m.segments || []).forEach((seg, i) => {
    if (labels.has(seg.label)) problems.push(`Two segments are labelled "${seg.label}".`);
    if (dirs.has(seg.dir)) problems.push(`Two segments use the folder "${seg.dir}".`);
    labels.add(seg.label); dirs.add(seg.dir);
    if (!validRule(seg.colorRule)) problems.push(`"${seg.label}" has no valid colorRule.`);
    (m.segments || []).slice(i + 1).forEach(o => {
      if (validRule(seg.colorRule) && validRule(o.colorRule) && rulesOverlap(seg.colorRule, o.colorRule))
        problems.push(`colorRules of "${seg.label}" and "${o.label}" overlap.`);
    });
  });
  const tabs = await readSubmissionTabs(sub);
  const check = (where, lenses, found) => {
    for (const lens of lenses || []) {
      const t = found.find(x => x.lens === lens);
      if (!t) { problems.push(`${where} / ${lens}: markdown file missing.`); continue; }
      if (!t.title) problems.push(`${where} / ${lens}: no title.`);
      if (!t.text) problems.push(`${where} / ${lens}: no text.`);
      if (t.image && !sub.has(`${t.dir}/${t.image}`)) problems.push(`${where} / ${lens}: image ${t.image} missing.`);
    }
  };
  for (const seg of m.segments || []) check(seg.label, seg.lenses, tabs.segments[seg.label] || []);
  check('Whole image', m.imageLenses, tabs.whole);
  if (!sub.submission) problems.push('No submission.json (contributor and suggested gallery unknown).');
  return problems;
}
