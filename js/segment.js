// Segmentation for the staging page — a browser port of ~/code/graphics/segment/server.py.
// Nano Banana (via OpenRouter) returns a flat-color map plus JSON segments; the map is
// snapped to the palette, cleaned with a 5x5 mode filter, resized to the image, and the
// colorRules are made well-formed and mutually exclusive. Same palette, prompts and rule
// format as the Python tool, so its masks drop straight into a DeepLooking manifest.

// First entry is the default.
const SEG_MODELS = [
  ['google/gemini-3-pro-image', 'Nano Banana Pro'],
  ['google/gemini-nano-banana-2.1', 'Nano Banana 2.1 (often rate-limited)'],
  ['google/gemini-3.1-flash-image', 'Nano Banana 2'],
];
const UPLOAD_MAX = 2048;  // long side of the image sent to the model; the map is resized back

const PALETTE = {
  Red: [255, 0, 0],
  Green: [0, 255, 0],
  Blue: [0, 0, 255],
  Yellow: [255, 255, 0],
  Cyan: [0, 255, 255],
  Magenta: [255, 0, 255],
  White: [255, 255, 255],
  Black: [0, 0, 0],
  // Segments 9-12: a channel may also sit at 128, between the cutoffs.
  Orange: [255, 128, 0],
  Purple: [128, 0, 128],
  Gray: [128, 128, 128],
  Pink: [255, 128, 128],
};
const PAL_NAMES = Object.keys(PALETTE);
const PAL_BY_LOWER = Object.fromEntries(PAL_NAMES.map(n => [n.toLowerCase(), n]));
const PAL_RGB = PAL_NAMES.map(n => PALETTE[n]);
const HIGH = 150, LOW = 100;

const colorList = names => names.map(n => `${n} (${PALETTE[n].join(',')})`).join(', ');

const SEG_PROMPT = `Create a segmentation map of the attached image.

The map:

Same framing and aspect ratio as the original; no cropping or shifting.
3 to 12 segments. Every pixel belongs to exactly one segment.
Each segment is one flat, solid color. No shading, outlines, text, or labels.
Use only these colors, each at most once. Use these eight first:
  ${colorList(PAL_NAMES.slice(0, 8))}.
If more than eight segments are needed, continue with:
  ${colorList(PAL_NAMES.slice(8))}.

Then list each segment as JSON, one object per line:

{ "label": "Sky", "color": "Blue", "rgb": [0, 0, 255],
  "colorRule": { "r_lt": 100, "g_lt": 100, "b_gt": 150 } }

Each colorRule uses r/g/b with _gt or _lt, using 150 as the "high" cutoff
and 100 as the "low" cutoff. A channel at 128 uses both, for example
"r_gt": 100, "r_lt": 150. No pixel color may satisfy more than one rule.`;

// Appended only when the user lists extra objects. It adds segments; it does not
// replace or limit the ones the model would choose anyway.
const INCLUDE_SUFFIX = `

In addition to the segments you would choose anyway, also make each of these
its own segment, even when small:
`;

function buildSegPrompt(include) {
  const items = (include || '').split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
  return items.length ? SEG_PROMPT + INCLUDE_SUFFIX + items.map(i => '- ' + i).join('\n') : SEG_PROMPT;
}

// Used only if the model returns a map but no JSON text.
const LABEL_PROMPT = colors => `The second image is a segmentation map of the first image. It uses only
these flat colors: ${colors}.

List each segment as JSON, one object per line:

{ "label": "Sky", "color": "Blue", "rgb": [0, 0, 255],
  "colorRule": { "r_lt": 100, "g_lt": 100, "b_gt": 150 } }

Each colorRule uses r/g/b with _gt or _lt, using 150 as the "high" cutoff
and 100 as the "low" cutoff. A channel at 128 uses both, for example
"r_gt": 100, "r_lt": 150. No pixel color may satisfy more than one rule.`;

// ------------------------------------------------------------ images ---

// File/Blob -> canvas with EXIF orientation applied (what the viewer will display).
async function canvasFromBlob(blob) {
  const bmp = await createImageBitmap(blob, { imageOrientation: 'from-image' });
  const c = document.createElement('canvas');
  c.width = bmp.width; c.height = bmp.height;
  c.getContext('2d').drawImage(bmp, 0, 0);
  bmp.close();
  return c;
}

// Canvas -> JPEG data URL, downscaled to max on the long side.
function canvasDataURL(src, max = UPLOAD_MAX, quality = 0.92) {
  const s = Math.min(1, max / Math.max(src.width, src.height));
  const c = document.createElement('canvas');
  c.width = Math.round(src.width * s); c.height = Math.round(src.height * s);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);  // flatten transparency
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', quality);
}

async function canvasFromURL(url) {
  return canvasFromBlob(await (await fetch(url)).blob());
}

const canvasBlob = (c, type = 'image/png', q) => new Promise(ok => c.toBlob(ok, type, q));

// ------------------------------------------------------ post-processing ---

// Pull every {...} JSON object with a label out of free-form model text.
function parseSegments(text) {
  const segs = [];
  let depth = 0, start = -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}' && depth) {
      depth--;
      if (depth === 0) {
        try {
          const obj = JSON.parse(text.slice(start, i + 1));
          if (obj && typeof obj === 'object' && !Array.isArray(obj) && 'label' in obj) segs.push(obj);
        } catch (e) { /* not JSON; keep scanning */ }
      }
    }
  }
  return segs;
}

// PIL ImageFilter.ModeFilter: most frequent value in a size x size box; values seen
// only once or twice are ignored, and if none occurs more than twice the pixel is kept.
function modeFilter(idx, w, h, size = 5) {
  const out = new Uint8Array(idx.length), r = size >> 1, hist = new Uint16Array(256);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      hist.fill(0, 0, PAL_NAMES.length);
      for (let yy = Math.max(0, y - r); yy <= Math.min(h - 1, y + r); yy++) {
        const row = yy * w;
        for (let xx = Math.max(0, x - r); xx <= Math.min(w - 1, x + r); xx++) hist[idx[row + xx]]++;
      }
      let best = 0, bestCount = 0;
      for (let v = 0; v < PAL_NAMES.length; v++) if (hist[v] > bestCount) { best = v; bestCount = hist[v]; }
      out[y * w + x] = bestCount > 2 ? best : idx[y * w + x];
    }
  }
  return out;
}

// PIL Image.NEAREST resize of an index map. Mirrors Pillow's ImagingScaleAffine, which
// steps the source coordinate by repeated addition; on exact pixel boundaries that
// rounding differs from (x + 0.5) * scale, so it is copied as is to match Python masks.
function resizeNearest(idx, sw, sh, dw, dh) {
  const out = new Uint8Array(dw * dh), xs = new Int32Array(dw);
  const ax = sw / dw, ay = sh / dh;
  let xo = ax * 0.5;
  for (let x = 0; x < dw; x++, xo += ax) xs[x] = Math.min(sw - 1, Math.trunc(xo));
  let yo = ay * 0.5;
  for (let y = 0; y < dh; y++, yo += ay) {
    const sy = Math.min(sh - 1, Math.trunc(yo)) * sw, row = y * dw;
    for (let x = 0; x < dw; x++) out[row + x] = idx[sy + xs[x]];
  }
  return out;
}

// Snap the model's map to the palette, clean speckle from anti-aliased edges, and
// resize to the original image size. Returns {mask canvas, coverage {palette index:
// pixel fraction}, offPalette fraction}.
function snapMask(raw, w, h) {
  const rw = raw.width, rh = raw.height;
  const px = raw.getContext('2d').getImageData(0, 0, rw, rh).data;
  let idx = new Uint8Array(rw * rh), off = 0;  // off: pixels far from every palette color
  for (let i = 0, p = 0; i < idx.length; i++, p += 4) {
    let best = 0, bestD = Infinity;
    for (let k = 0; k < PAL_RGB.length; k++) {
      const dr = px[p] - PAL_RGB[k][0], dg = px[p + 1] - PAL_RGB[k][1], db = px[p + 2] - PAL_RGB[k][2];
      const d = dr * dr + dg * dg + db * db;
      if (d < bestD) { bestD = d; best = k; }
    }
    idx[i] = best;
    if (bestD > 80 * 80) off++;
  }
  // Mode filter removes thin bands created where two colors were blended.
  idx = resizeNearest(modeFilter(idx, rw, rh, 5), rw, rh, w, h);
  const counts = new Float64Array(PAL_NAMES.length);
  const mask = document.createElement('canvas');
  mask.width = w; mask.height = h;
  const ctx = mask.getContext('2d');
  const img = ctx.createImageData(w, h), d = img.data;
  for (let i = 0, p = 0; i < idx.length; i++, p += 4) {
    const c = PAL_RGB[idx[i]];
    d[p] = c[0]; d[p + 1] = c[1]; d[p + 2] = c[2]; d[p + 3] = 255;
    counts[idx[i]]++;
  }
  ctx.putImageData(img, 0, 0);
  const coverage = {};
  counts.forEach((c, i) => { if (c > 0) coverage[i] = c / idx.length; });
  return { mask, coverage, offPalette: off / (rw * rh) };
}

// A rule on all three channels; distinct palette colors never overlap.
// 255 -> _gt 150, 0 -> _lt 100, 128 -> _gt 100 and _lt 150.
function canonicalRule(rgb) {
  const rule = {};
  ['r', 'g', 'b'].forEach((c, i) => {
    const v = rgb[i];
    if (v > HIGH) rule[c + '_gt'] = HIGH;
    else if (v < LOW) rule[c + '_lt'] = LOW;
    else { rule[c + '_gt'] = LOW; rule[c + '_lt'] = HIGH; }
  });
  return rule;
}

// Rule -> per-channel inclusive [lo, hi] interval.
function ruleBox(rule) {
  const box = { r: [0, 255], g: [0, 255], b: [0, 255] };
  for (const [k, v] of Object.entries(rule)) {
    const c = k[0], op = k.slice(2);
    if (op === 'gt') box[c][0] = Math.max(box[c][0], Math.trunc(v) + 1);
    else box[c][1] = Math.min(box[c][1], Math.trunc(v) - 1);
  }
  return box;
}

function ruleMatches(rule, rgb) {
  const box = ruleBox(rule);
  return ['r', 'g', 'b'].every((c, i) => box[c][0] <= rgb[i] && rgb[i] <= box[c][1]);
}

function rulesOverlap(a, b) {
  const ba = ruleBox(a), bb = ruleBox(b);
  return ['r', 'g', 'b'].every(c => Math.max(ba[c][0], bb[c][0]) <= Math.min(ba[c][1], bb[c][1]));
}

function validRule(rule) {
  return rule && typeof rule === 'object' && !Array.isArray(rule) && Object.keys(rule).length > 0 &&
    Object.entries(rule).every(([k, v]) => /^[rgb]_(gt|lt)$/.test(k) && typeof v === 'number');
}

// Map each segment onto the palette, drop duplicates, and make sure the color rules are
// well-formed and mutually exclusive. Returns {segments, unlabeled colors, notes}.
function normalizeSegments(segs, coverage) {
  const notes = [], out = [], used = new Set();
  for (const s of segs) {
    let name = PAL_BY_LOWER[String(s.color ?? '').trim().toLowerCase().replace('grey', 'gray')] || '';
    if (!name) {
      const rgb = s.rgb;
      if (Array.isArray(rgb) && rgb.length === 3) {
        let best = 0, bestD = Infinity;
        PAL_RGB.forEach((c, i) => {
          const d = (c[0] - rgb[0]) ** 2 + (c[1] - rgb[1]) ** 2 + (c[2] - rgb[2]) ** 2;
          if (d < bestD) { bestD = d; best = i; }
        });
        name = PAL_NAMES[best];
      } else {
        notes.push(`Skipped segment '${s.label}' with unknown color.`);
        continue;
      }
    }
    if (used.has(name)) {
      notes.push(`Skipped duplicate use of ${name} ('${s.label}').`);
      continue;
    }
    used.add(name);
    out.push({ label: String(s.label ?? name).trim(), color: name, rgb: [...PALETTE[name]], colorRule: s.colorRule });
  }

  // Colors the map uses that no segment claims still need rules to check against.
  const unlabeled = Object.keys(coverage).map(Number).map(i => PAL_NAMES[i]).filter(n => !used.has(n));
  if (unlabeled.length) notes.push('Colors in the map with no label: ' + unlabeled.join(', ') + '.');
  for (const s of out) {
    if (!(PAL_NAMES.indexOf(s.color) in coverage)) notes.push(`'${s.label}' (${s.color}) does not appear in the map.`);
  }

  const others = unlabeled.map(n => canonicalRule(PALETTE[n]));
  let ok = out.every(s => validRule(s.colorRule) && ruleMatches(s.colorRule, s.rgb));
  if (ok) {
    const rules = out.map(s => s.colorRule).concat(others);
    outer: for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) if (rulesOverlap(rules[i], rules[j])) { ok = false; break outer; }
    }
  }
  if (!ok) {
    notes.push('Model color rules were missing, overlapping, or did not match their ' +
      'own color; replaced with 3-channel rules (150 high / 100 low, 128 between).');
    for (const s of out) s.colorRule = canonicalRule(s.rgb);
  }
  return { segments: out, unlabeled, notes };
}

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'segment';
}

// ---------------------------------------------------------------- run ---

// image: canvas of the oriented original. Returns everything the Segment page shows.
async function segmentImage(image, { model, include, signal }) {
  const prompt = buildSegPrompt(include);
  const t0 = performance.now();
  const upload = canvasDataURL(image);
  const r1 = await OpenRouter.chat({
    model, signal, wantImage: true,
    content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: upload } }],
  });
  let text = r1.text;
  if (!r1.images.length) {
    const e = new Error('The model returned no image. Try again or switch models.');
    e.text = text;
    throw e;
  }
  const raw = await canvasFromURL(r1.images[r1.images.length - 1]);
  const { mask, coverage, offPalette } = snapMask(raw, image.width, image.height);
  let segs = parseSegments(text);
  if (!segs.length) {
    // Map came back without JSON; ask for the labels separately.
    const colors = Object.keys(coverage).map(i => `${PAL_NAMES[i]} (${PAL_RGB[i].join(', ')})`).join(', ');
    const r2 = await OpenRouter.chat({
      model, signal,
      content: [
        { type: 'text', text: LABEL_PROMPT(colors) },
        { type: 'image_url', image_url: { url: upload } },
        { type: 'image_url', image_url: { url: mask.toDataURL('image/png') } },
      ],
    });
    text = (text + '\n\n--- label follow-up ---\n' + r2.text).trim();
    segs = parseSegments(r2.text);
  }
  const norm = normalizeSegments(segs, coverage);
  if (offPalette > 0.03) {
    norm.notes.unshift(`About ${Math.round(offPalette * 100)}% of the model's map is not flat palette color ` +
      '(parts were left unsegmented, like the original photo). Those pixels were ' +
      'snapped to the nearest color and will be noisy. Compare with the raw ' +
      'model map, and try SEGMENT again or switch models.');
  }
  if (!norm.segments.length) norm.notes.push('No labelled segments could be parsed from the model response.');
  for (const s of norm.segments) s.coverage = coverage[PAL_NAMES.indexOf(s.color)] || 0;
  return {
    segments: norm.segments,
    unlabeled: norm.unlabeled.map(n => ({ color: n, rgb: [...PALETTE[n]], coverage: coverage[PAL_NAMES.indexOf(n)] })),
    notes: norm.notes,
    mask, raw, prompt, text, model, offPalette,
    seconds: Math.round((performance.now() - t0) / 100) / 10,
  };
}
