// Shared Deep Looking viewer pieces: lens markdown parsing, colorRule lookup,
// and the tabbed lens popup with its lightbox. Used by index.html and stage.html.

// --- Parse a markdown file with key: value front-matter + body text ---
function parsePoemMarkdown(text) {
  const lines = text.split('\n');
  const meta = {};
  let bodyStart = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') {
      bodyStart = i + 1;
      break;
    }
    const colon = line.indexOf(':');
    if (colon > 0) {
      const key = line.substring(0, colon).trim();
      const val = line.substring(colon + 1).trim();
      meta[key] = val;
    }
  }
  meta.text = lines.slice(bodyStart).join('\n').trim();
  return meta;
}

// --- Build a getLabel function from manifest colorRules ---
function buildGetLabel(segments) {
  return function(r, g, b) {
    for (const seg of segments) {
      const rule = seg.colorRule;
      let match = true;
      if (rule.r_gt !== undefined && !(r > rule.r_gt)) match = false;
      if (rule.r_lt !== undefined && !(r < rule.r_lt)) match = false;
      if (rule.g_gt !== undefined && !(g > rule.g_gt)) match = false;
      if (rule.g_lt !== undefined && !(g < rule.g_lt)) match = false;
      if (rule.b_gt !== undefined && !(b > rule.b_gt)) match = false;
      if (rule.b_lt !== undefined && !(b < rule.b_lt)) match = false;
      if (match) return seg.label;
    }
    return null;
  };
}

// --- Highlight keyword in poem text using DOM (safe, no innerHTML) ---
function setHighlightedText(container, text, keyword) {
  container.textContent = '';
  if (!keyword) {
    container.textContent = text;
    return;
  }
  const regex = new RegExp('(' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  const parts = text.split(regex);
  for (const part of parts) {
    if (regex.test(part)) {
      regex.lastIndex = 0;
      const span = document.createElement('span');
      span.style.color = '#e8913a';
      span.style.fontWeight = '600';
      span.textContent = part;
      container.appendChild(span);
    } else {
      container.appendChild(document.createTextNode(part));
    }
  }
}
// --- Open popups (closeAllPopups removes them, e.g. when leaving a viewer) ---
let openPopups = [];

function closeAllPopups() {
  openPopups.forEach(p => p.remove());
  openPopups = [];
}

// --- Image/video lightbox overlay ---
const lightbox = document.createElement('div');
lightbox.className = 'image-lightbox';
lightbox.style.display = 'none';
const lightboxImg = document.createElement('img');
lightboxImg.alt = '';
const lightboxVideo = document.createElement('video');
lightboxVideo.autoplay = true; lightboxVideo.loop = true; lightboxVideo.muted = true;
lightboxVideo.style.cssText = 'display:none; max-width:90vw; max-height:90vh; border-radius:8px; box-shadow:0 0 40px rgba(0,0,0,0.8);';
lightbox.appendChild(lightboxImg);
lightbox.appendChild(lightboxVideo);
document.body.appendChild(lightbox);

// --- Click or ESC to dismiss lightbox ---
lightbox.addEventListener('click', () => {
  lightbox.style.display = 'none';
  lightboxVideo.src = '';
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.style.display === 'flex') {
    lightbox.style.display = 'none';
    lightboxVideo.src = '';
  }
});

// --- Create a new popup for given lenses at position, appended to container ---
// Each lens: {lens, name?, title, poet, url, image, video, youtube, keyword, text, loc}.
// name (the markdown "tab:" field) overrides the tab label.
function createPopup(lenses, posX, posY, container = document.body) {
  const el = document.createElement('div');
  el.className = 'popup visible pinned';
  el.style.position = 'fixed';
  el.style.zIndex = 100 + openPopups.length;

  // Build inner structure using DOM methods
  const closeBtn = document.createElement('span');
  closeBtn.className = 'popup-close';
  closeBtn.style.display = 'block';
  closeBtn.textContent = '\u00D7';
  const tabs = document.createElement('div');
  tabs.className = 'lens-tabs';
  tabs.style.display = 'flex';
  const titleEl = document.createElement('div');
  titleEl.className = 'poem-title';
  const poetEl = document.createElement('div');
  poetEl.className = 'poem-poet';
  const imgEl = document.createElement('img');
  imgEl.className = 'poem-image';
  imgEl.style.display = 'none';
  const vidEl = document.createElement('video');
  vidEl.className = 'poem-video';
  vidEl.controls = true; vidEl.autoplay = true; vidEl.loop = true; vidEl.muted = true;
  vidEl.style.display = 'none';
  const ytEl = document.createElement('iframe');
  ytEl.className = 'poem-video';
  ytEl.style.display = 'none';
  ytEl.style.border = 'none';
  ytEl.style.width = '100%';
  ytEl.style.aspectRatio = '16/9';
  ytEl.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  ytEl.allowFullscreen = true;
  const textEl = document.createElement('div');
  textEl.className = 'poem-text';
  const locEl = document.createElement('div');
  locEl.style.cssText = 'margin-top:10px;font-size:0.7rem;color:#777;font-style:italic;';

  const contentWrap = document.createElement('div');
  contentWrap.className = 'popup-content';
  contentWrap.appendChild(titleEl);
  contentWrap.appendChild(poetEl);
  contentWrap.appendChild(imgEl);
  contentWrap.appendChild(vidEl);
  contentWrap.appendChild(ytEl);
  contentWrap.appendChild(textEl);
  contentWrap.appendChild(locEl);
  el.appendChild(closeBtn);
  el.appendChild(tabs);
  el.appendChild(contentWrap);

  // Show lens content in this popup
  function showContent(data) {
    titleEl.textContent = '';
    if (data.url) {
      const link = document.createElement('a');
      link.href = data.url; link.target = '_blank'; link.rel = 'noopener';
      link.textContent = data.title || '';
      titleEl.appendChild(link);
    } else {
      titleEl.textContent = data.title || '';
    }
    poetEl.textContent = data.poet || '';
    if (data.youtube) {
      ytEl.src = data.youtube; ytEl.style.display = 'block';
      vidEl.style.display = 'none'; vidEl.src = ''; imgEl.style.display = 'none';
    } else if (data.video) {
      vidEl.src = data.video; vidEl.load(); vidEl.play();
      vidEl.style.display = 'block'; imgEl.style.display = 'none'; ytEl.style.display = 'none'; ytEl.src = '';
    } else if (data.image) {
      imgEl.src = data.image; imgEl.alt = data.title || '';
      imgEl.style.display = 'block'; vidEl.style.display = 'none'; vidEl.src = ''; ytEl.style.display = 'none'; ytEl.src = '';
    } else {
      imgEl.style.display = 'none'; vidEl.style.display = 'none'; vidEl.src = ''; ytEl.style.display = 'none'; ytEl.src = '';
    }
    setHighlightedText(textEl, data.text, data.keyword);
    while (locEl.firstChild) locEl.removeChild(locEl.firstChild);
    const locPages = {
      Q:2, QA:3, QC:5, QE:7, QH:8, QK:9, QL:10, QM:11,
      P:2, PJ:12, PN:19, D:3, G:2, GB:5, L:2, LB:4, N:2, T:2, TA:3
    };
    if (data.loc) {
      locEl.appendChild(document.createTextNode('Library of Congress: '));
      const code = data.loc.split(' ')[0];
      const letter = code.charAt(0).toLowerCase();
      const subclass = code.replace(/[0-9.].*/,'');
      const page = locPages[subclass] || 1;
      const locLink = document.createElement('a');
      locLink.href = 'https://www.loc.gov/aba/cataloging/classification/lcco/lcco_' + letter + '.pdf#page=' + page;
      locLink.target = '_blank';
      locLink.rel = 'noopener';
      locLink.textContent = data.loc;
      locLink.style.cssText = 'color:#c4a35a;text-decoration:none;';
      locLink.addEventListener('mouseenter', () => { locLink.style.textDecoration = 'underline'; });
      locLink.addEventListener('mouseleave', () => { locLink.style.textDecoration = 'none'; });
      locLink.addEventListener('click', (e) => e.stopPropagation());
      locEl.appendChild(locLink);
    }
  }

  // Build tabs
  const lensDisplayNames = { cs: 'Comp Sci', language: 'Language', geology: 'Geology', matsci: 'Material Sci', botany: 'Botany', cinematography: 'Cinema', modeling: 'Modeling', art: 'Art', ancienthistory: 'Ancient History', education: 'Education', math: 'Mathematics', engineering: 'Engineering', science: 'Science', history: 'History', fatima: 'Fatima', sally: 'Sally', paul: 'Paul', arman: 'Arman', roger: 'Roger', abbas: 'Abbas', tina: 'Tina', personalperspective: 'Personal', typography: 'Graphic Design & Typography', marketing: 'Marketing & Branding', arthistory: 'Art History', museumstudies: 'Museum Studies', ecology: 'Ecology', aesthetics: 'Aesthetics', hydrology: 'Hydrology', digitalimaging: 'Digital Imaging', calligraphy: 'Calligraphy', crisis: 'Crisis', memory: 'Memory', personal: 'Personal', anthropology: 'Anthropology', visualarts: 'Visual Arts', mathematics: 'Mathematics', architecture: 'Architecture' };
  lenses.forEach((lensObj, i) => {
    const tab = document.createElement('button');
    tab.className = 'lens-tab' + (i === 0 ? ' active' : '');
    tab.textContent = lensObj.name || lensDisplayNames[lensObj.lens] || lensObj.lens;
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      showContent(lenses[i]);
      tabs.querySelectorAll('.lens-tab').forEach((t, j) => t.classList.toggle('active', j === i));
    });
    tabs.appendChild(tab);
  });

  // Show first lens
  showContent(lenses[0]);

  // Auto-size popup width to fit tabs
  el.style.visibility = 'hidden';
  el.style.width = '9999px';
  document.body.appendChild(el);
  const tabsNaturalWidth = tabs.scrollWidth;
  el.remove();
  el.style.visibility = '';
  const pw = Math.max(320, Math.min(600, tabsNaturalWidth + 34));
  el.style.width = pw + 'px';

  // Position
  let left = posX + 20, top = posY - 20;
  if (left + pw > window.innerWidth - 10) left = posX - pw - 20;
  if (top + 400 > window.innerHeight - 10) top = window.innerHeight - 410;
  if (top < 10) top = 10;
  el.style.left = left + 'px';
  el.style.top = top + 'px';

  // Close button
  closeBtn.addEventListener('click', () => {
    el.remove();
    openPopups = openPopups.filter(p => p !== el);
  });

  // Click image to open lightbox
  imgEl.addEventListener('click', () => {
    if (!imgEl.src || imgEl.style.display === 'none') return;
    lightboxVideo.style.display = 'none'; lightboxVideo.src = '';
    lightboxImg.src = imgEl.src; lightboxImg.alt = imgEl.alt;
    lightboxImg.style.display = 'block';
    lightbox.style.display = 'flex';
  });

  // Click video to open lightbox
  vidEl.addEventListener('click', () => {
    if (!vidEl.src || vidEl.style.display === 'none') return;
    lightboxImg.style.display = 'none';
    lightboxVideo.src = vidEl.src;
    lightboxVideo.currentTime = vidEl.currentTime;
    lightboxVideo.style.display = 'block'; lightboxVideo.play();
    lightbox.style.display = 'flex';
  });

  // Draggable from tab bar or any edge/padding area of the popup
  let dragging = false, dragOffX = 0, dragOffY = 0;
  function startDrag(clientX, clientY) {
    dragging = true;
    dragOffX = clientX - el.getBoundingClientRect().left;
    dragOffY = clientY - el.getBoundingClientRect().top;
    el.classList.add('dragging');
  }
  tabs.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('lens-tab')) return;
    e.preventDefault(); startDrag(e.clientX, e.clientY);
  });
  el.addEventListener('mousedown', (e) => {
    if (e.target === el) { e.preventDefault(); startDrag(e.clientX, e.clientY); }
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    el.style.left = (e.clientX - dragOffX) + 'px';
    el.style.top = (e.clientY - dragOffY) + 'px';
  });
  document.addEventListener('mouseup', () => {
    if (dragging) { dragging = false; el.classList.remove('dragging'); }
  });
  // Touch support for dragging
  tabs.addEventListener('touchstart', (e) => {
    if (e.target.classList.contains('lens-tab')) return;
    e.preventDefault(); const t = e.touches[0]; startDrag(t.clientX, t.clientY);
  }, { passive: false });
  el.addEventListener('touchstart', (e) => {
    if (e.target === el) { e.preventDefault(); const t = e.touches[0]; startDrag(t.clientX, t.clientY); }
  }, { passive: false });
  document.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    e.preventDefault(); const t = e.touches[0];
    el.style.left = (t.clientX - dragOffX) + 'px';
    el.style.top = (t.clientY - dragOffY) + 'px';
  }, { passive: false });
  document.addEventListener('touchend', () => {
    if (dragging) { dragging = false; el.classList.remove('dragging'); }
  });

  // Resize handles on all four corners
  ['nw','ne','sw','se'].forEach(corner => {
    const handle = document.createElement('div');
    handle.className = 'popup-resize ' + corner;
    el.appendChild(handle);
    let resizing = false, startX, startY, startW, startH, startL, startT;
    function startResize(cx, cy) {
      resizing = true;
      el.style.maxHeight = 'none';
      startX = cx; startY = cy;
      const rect = el.getBoundingClientRect();
      startW = rect.width; startH = rect.height;
      startL = rect.left; startT = rect.top;
    }
    function doResize(cx, cy) {
      if (!resizing) return;
      const dx = cx - startX, dy = cy - startY;
      if (corner.includes('e')) el.style.width = Math.max(280, startW + dx) + 'px';
      if (corner.includes('w')) { el.style.width = Math.max(280, startW - dx) + 'px'; el.style.left = (startL + dx) + 'px'; }
      if (corner.includes('s')) el.style.height = (startH + dy) + 'px';
      if (corner.includes('n')) { el.style.height = (startH - dy) + 'px'; el.style.top = (startT + dy) + 'px'; }
    }
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault(); e.stopPropagation();
      startResize(e.clientX, e.clientY);
      const onMove = (ev) => doResize(ev.clientX, ev.clientY);
      const onUp = () => { resizing = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
    handle.addEventListener('touchstart', (e) => {
      e.preventDefault(); e.stopPropagation();
      const t = e.touches[0]; startResize(t.clientX, t.clientY);
      const onMove = (ev) => { ev.preventDefault(); const t2 = ev.touches[0]; doResize(t2.clientX, t2.clientY); };
      const onUp = () => { resizing = false; document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onUp); };
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    }, { passive: false });
  });

  container.appendChild(el);
  openPopups.push(el);
  return el;
}
