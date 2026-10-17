// Lens profiles and tab generation for the staging page.
// A tab: {lens (dir slug), name (tab label), title, poet, url, keyword, loc, text,
//         author: 'ai' | 'user' | 'ai+user', wikipedia, image: {blob, ext, source} | null}

const TEXT_MODELS = [
  ['anthropic/claude-sonnet-5.5', 'Claude Sonnet 5.5'],
  ['anthropic/claude-haiku-5.5', 'Claude Haiku 5.5 (cheapest)'],
  ['google/gemini-3.8-flash', 'Gemini 3.8 Flash'],
  ['anthropic/claude-opus-5.5', 'Claude Opus 5.5'],
];
const IMAGE_MODELS = [
  ['google/gemini-3-pro-image', 'Nano Banana Pro'],
  ['google/gemini-3.1-flash-image', 'Nano Banana 2'],
  ['openai/gpt-5-image-mini', 'GPT-5 Image Mini'],
];
const DEFAULT_LEVEL = '9th or 10th grade';

// LA MESH, from lamesh.md. Dir names match the LAMESH galleries already published.
const LAMESH = [
  { lens: 'language', name: 'Language', guide: 'Language: linguistics, semiotics, natural languages, formal languages, ancient or forgotten languages, etymology of the names of what is seen.' },
  { lens: 'art', name: 'Art', guide: 'Art: fine art, or art in the classical sense of craft; also the liberal arts.' },
  { lens: 'math', name: 'Mathematics', guide: 'Mathematics: geometry, number, pattern, measurement, symmetry, modeling.' },
  { lens: 'engineering', name: 'Engineering', guide: 'Engineering: how things are designed, built, made to work, or could be.' },
  { lens: 'science', name: 'Science', guide: 'Science: the natural or physical science that best explains what is seen.' },
  { lens: 'history', name: 'History', guide: 'History: how what is seen came to be, and its human past.' },
];

const PROFILES = {
  user: { name: 'User', blurb: 'Name your own lenses, for example Ecology or a "Personal" reflection.' },
  scienceart: { name: 'Science/Art', blurb: 'Two tabs per segment: one science, one art. Choose which kind of each, or let the AI pick the best fit.' },
  lamesh: { name: 'LA MESH', blurb: 'Six tabs per segment: Language, Art, Mathematics, Engineering, Science, History.' },
};

// Lens list for a profile: [{lens, name, guide, author: 'ai'|'user'}]. In every profile a
// lens can be drafted by the AI or written by the student (p.modes[lens] === 'self').
function profileLenses(p) {
  const who = l => ({ ...l, author: p.modes?.[l.lens] === 'self' ? 'user' : 'ai' });
  if (p.kind === 'lamesh') return LAMESH.map(who);
  if (p.kind === 'scienceart') {
    const one = (pref, kind) => pref.trim()
      ? { lens: lensSlug(pref), name: titleCase(pref.trim()), guide: `${titleCase(kind)}: specifically ${pref.trim()}.`, author: 'ai' }
      : { lens: kind, name: titleCase(kind), guide: `${titleCase(kind)}: choose the branch of ${kind} that best fits what is seen here, and make that branch clear in the title.`, author: 'ai' };
    return [one(p.science || '', 'science'), one(p.art || '', 'art')].map(who);
  }
  return (p.userLenses || []).filter(l => l.name.trim())
    .map(l => ({ lens: lensSlug(l.name), name: l.name.trim(), guide: `${l.name.trim()}.`, author: l.mode === 'self' ? 'user' : 'ai' }));
}

// Lens dirs follow the existing galleries: lowercase letters and digits only.
function lensSlug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '') || 'lens'; }
function titleCase(s) { return s.replace(/\b\w/g, c => c.toUpperCase()); }

function blankTab(l) {
  return { lens: l.lens, name: l.name, title: l.author === 'user' ? l.name : '', poet: '', url: '', keyword: '',
           loc: '', text: '', author: l.author, wikipedia: '', image: null };
}

const TAB_SCHEMA = {
  name: 'lens_tabs', strict: true,
  schema: {
    type: 'object', additionalProperties: false, required: ['tabs'],
    properties: { tabs: { type: 'array', items: {
      type: 'object', additionalProperties: false,
      required: ['lens', 'title', 'wikipedia', 'text', 'keyword', 'loc'],
      properties: {
        lens: { type: 'string' }, title: { type: 'string' }, wikipedia: { type: 'string' },
        text: { type: 'string' }, keyword: { type: 'string' }, loc: { type: 'string' },
      },
    } } },
  },
};

function tabPrompt({ target, lenses, about, level, instruction, current }) {
  const where = target.whole
    ? 'the image as a whole'
    : `the segment labelled "${target.label}". In the attached image that segment is shown normally and everything else is dimmed`;
  let p = `You are writing "Deep Looking" lens tabs. Deep Looking applies discipline-specific lenses to an image: each lens is a school or library subject (Dewey Decimal, Library of Congress), and its tab shows how that discipline interprets what is seen.

Write about ${where}.
Audience reading level: ${level || DEFAULT_LEVEL}.
${about ? `About this image, from the person who took or chose it: ${about}\n` : ''}
Write one tab for each lens:
${lenses.map(l => `- ${l.name} — ${l.guide}`).join('\n')}

For each tab:
- lens: the lens name exactly as given above
- title: the specific topic, at most 8 words
- wikipedia: the exact title of an existing English Wikipedia article on that topic
- text: 80 to 140 words of plain text (no markdown) linking what is visible to the discipline; concrete and accurate
- keyword: a word or short phrase that appears verbatim in text, to highlight
- loc: the Library of Congress Classification code for the topic, e.g. QH540, N, PN1010

Return only JSON: {"tabs": [ ... ]}`;
  if (current) {
    p += `\n\nThe current version of this tab is:\n${JSON.stringify(current)}\n\nRevise it. ${instruction ? 'Requested change: ' + instruction : 'Make a fresh, better version.'}`;
  }
  return p;
}

function parseTabsJSON(text) {
  const t = text.replace(/```(?:json)?/g, '');
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error('The model did not return JSON.');
  const obj = JSON.parse(t.slice(a, b + 1));
  if (!Array.isArray(obj.tabs)) throw new Error('The model returned JSON without "tabs".');
  return obj.tabs;
}

// Generate AI tabs for one target. focusURL: image with the segment highlighted.
// Returns tabs in lens order; 'user' lenses come back blank for the person to write.
async function generateTabs({ target, lenses, about, level, model, focusURL, signal }) {
  const ai = lenses.filter(l => l.author === 'ai');
  const byName = {};
  if (ai.length) {
    const { text } = await OpenRouter.chat({
      model, signal, json: TAB_SCHEMA,
      content: [{ type: 'text', text: tabPrompt({ target, lenses: ai, about, level }) },
                { type: 'image_url', image_url: { url: focusURL } }],
    });
    for (const t of parseTabsJSON(text)) byName[String(t.lens).trim().toLowerCase()] = t;
  }
  const tabs = [];
  for (const l of lenses) {
    const tab = blankTab(l);
    const g = byName[l.name.toLowerCase()];
    if (l.author === 'ai' && g) Object.assign(tab, cleanGenerated(g));
    tabs.push(tab);
  }
  await Promise.all(tabs.filter(t => t.wikipedia).map(t => attachWikipedia(t, signal).catch(() => {})));
  return tabs;
}

// Regenerate one tab with an optional instruction.
async function reviseTab({ target, tab, about, level, model, focusURL, instruction, signal }) {
  const lens = { lens: tab.lens, name: tab.name, guide: `${tab.name}.` };
  const current = tab.text || tab.title ? { title: tab.title, text: tab.text, wikipedia: tab.wikipedia } : null;
  const { text } = await OpenRouter.chat({
    model, signal, json: TAB_SCHEMA,
    content: [{ type: 'text', text: tabPrompt({ target, lenses: [lens], about, level, instruction, current }) },
              { type: 'image_url', image_url: { url: focusURL } }],
  });
  const g = parseTabsJSON(text)[0];
  if (!g) throw new Error('The model returned no tab.');
  const out = { ...tab, ...cleanGenerated(g), author: 'ai' };
  if (out.wikipedia !== tab.wikipedia || !out.image) {
    out.url = '';
    if (!tab.image || tab.image.source?.includes('wikimedia')) out.image = null;
    await attachWikipedia(out, signal).catch(() => {});
  }
  return out;
}

function cleanGenerated(g) {
  const one = s => String(s ?? '').replace(/\s+/g, ' ').trim();
  const text = String(g.text ?? '').trim();
  let keyword = one(g.keyword);
  if (keyword && !text.toLowerCase().includes(keyword.toLowerCase())) keyword = '';
  return { title: one(g.title), wikipedia: one(g.wikipedia), text, keyword, loc: one(g.loc) };
}

// ------------------------------------------------------------ Wikipedia ---

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

async function wikiPage(params, signal) {
  const q = new URLSearchParams({ action: 'query', format: 'json', origin: '*', redirects: '1', ...params });
  const r = await fetch(WIKI_API + '?' + q, { signal });
  const data = await r.json();
  return Object.values(data.query?.pages || {})[0];
}

// Resolve tab.wikipedia to a real article: set tab.url (the title link) and, unless the tab
// already has an image, a freely licensed lead image from Wikimedia Commons.
async function attachWikipedia(tab, signal) {
  const props = { prop: 'pageimages|info', inprop: 'url', piprop: 'thumbnail|name', pithumbsize: '800' };
  let page = await wikiPage({ titles: tab.wikipedia, ...props }, signal);
  if (!page || 'missing' in page || 'invalid' in page) {
    page = await wikiPage({ generator: 'search', gsrsearch: tab.wikipedia || tab.title, gsrlimit: '1', ...props }, signal);
  }
  if (!page || 'missing' in page || !page.fullurl) return;
  tab.wikipedia = page.title;
  tab.url = page.fullurl;
  if (!tab.image) tab.image = await commonsImage(page, signal);
}

// Only Commons images: English-Wikipedia-local files are often non-free (fair use).
async function commonsImage(page, signal) {
  const src = page.thumbnail?.source;
  if (!src || !src.includes('/wikipedia/commons/')) return null;
  const blob = await (await fetch(src, { signal })).blob();
  const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/gif' ? 'gif' : blob.type === 'image/webp' ? 'webp' : 'jpg';
  return { blob, ext, source: 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(page.pageimage || '') };
}

async function findWikimediaImage(tab, signal) {
  const t = { ...tab, image: null };
  await attachWikipedia(t, signal);
  return t.image;
}

// ------------------------------------------------------- generated image ---

async function generateTabImage({ tab, model, level, signal }) {
  const prompt = `Create one clear, educational illustration for a "${tab.name}" lens about "${tab.title}". ` +
    `It should help a ${level || DEFAULT_LEVEL} student understand this: ${tab.text.slice(0, 600)}\n` +
    'Use a clean style. Avoid text in the image unless a diagram needs short labels.';
  const { images } = await OpenRouter.chat({ model, signal, wantImage: true, content: [{ type: 'text', text: prompt }] });
  if (!images.length) throw new Error('The image model returned no image.');
  const blob = await (await fetch(images[images.length - 1])).blob();
  return { blob, ext: blob.type === 'image/jpeg' ? 'jpg' : 'png', source: 'generated: ' + model };
}
