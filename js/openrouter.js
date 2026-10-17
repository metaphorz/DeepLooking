// OpenRouter client for the staging page. The key is whatever the visitor
// entered; it lives only in this browser and is sent only to openrouter.ai.

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const KEY_STORE = 'deeplooking.openrouterKey';

const OpenRouter = {
  key: '',
  spent: 0,            // USD reported by OpenRouter for this session's calls
  onSpend: null,       // callback(totalSpent)

  loadSavedKey() {
    try { this.key = localStorage.getItem(KEY_STORE) || ''; } catch (e) { this.key = ''; }
    return this.key;
  },

  setKey(key, remember) {
    this.key = key.trim();
    try {
      if (remember && this.key) localStorage.setItem(KEY_STORE, this.key);
      else localStorage.removeItem(KEY_STORE);
    } catch (e) { /* storage blocked: key lasts for this page only */ }
  },

  forgetKey() { this.setKey('', false); },

  // --- Sign in with OpenRouter (OAuth PKCE): returns to this page with ?code= ---
  async startSignIn() {
    const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)));
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    sessionStorage.setItem('deeplooking.pkce', verifier);
    const callback = location.origin + location.pathname;
    location.href = 'https://openrouter.ai/auth?callback_url=' + encodeURIComponent(callback) +
      '&code_challenge=' + b64url(new Uint8Array(digest)) + '&code_challenge_method=S256';
  },

  // Call on page load; if we just came back from sign-in, exchange the code for a key.
  async finishSignIn(remember) {
    const code = new URLSearchParams(location.search).get('code');
    const verifier = sessionStorage.getItem('deeplooking.pkce');
    if (!code || !verifier) return false;
    sessionStorage.removeItem('deeplooking.pkce');
    history.replaceState(null, '', location.pathname);
    const r = await fetch('https://openrouter.ai/api/v1/auth/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, code_verifier: verifier, code_challenge_method: 'S256' }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.key) throw new Error('OpenRouter sign-in failed: ' + (data.error?.message || r.status));
    this.setKey(data.key, remember);
    return true;
  },

  // One chat completion. content: array of message parts. Returns {text, images: [dataURL]}.
  async chat({ model, content, wantImage = false, json = null, signal }) {
    if (!this.key) throw new Error('Enter your OpenRouter key first.');
    const body = {
      model,
      messages: [{ role: 'user', content }],
      modalities: wantImage ? ['image', 'text'] : ['text'],
      usage: { include: true },
    };
    if (json) body.response_format = { type: 'json_schema', json_schema: json };

    let r, data;
    for (const delay of [5, 15, 0]) {  // retry transient upstream rate limits / outages
      r = await fetch(OPENROUTER_URL, {
        method: 'POST', signal,
        headers: {
          'Authorization': 'Bearer ' + this.key,
          'Content-Type': 'application/json',
          'HTTP-Referer': location.origin,
          'X-Title': 'Deep Looking Stage',
        },
        body: JSON.stringify(body),
      });
      if (![429, 502, 503].includes(r.status) || !delay) break;
      await new Promise(ok => setTimeout(ok, delay * 1000));
    }
    const raw = await r.text();
    try { data = JSON.parse(raw); }  // OpenRouter pads slow replies with whitespace
    catch (e) { throw new Error('OpenRouter HTTP ' + r.status + ': ' + raw.slice(0, 500)); }
    if (!r.ok || data.error) {
      const err = data.error || {};
      // Some models reject structured output; retry once as plain JSON-in-text.
      if (json && /response_format|json_schema|structured/i.test(err.message || '')) {
        return this.chat({ model, content, wantImage, json: null, signal });
      }
      let msg = 'OpenRouter HTTP ' + r.status + ': ' + (err.message || JSON.stringify(err));
      if (err.metadata?.raw) msg += ' (' + String(err.metadata.raw).slice(0, 300) + ')';
      if (r.status === 401) msg = 'OpenRouter rejected the key. Check it and enter it again.\n\n' + msg;
      if (r.status === 402) msg = 'OpenRouter: insufficient credits on this key.\n\n' + msg;
      throw new Error(msg);
    }
    if (data.usage?.cost) {
      this.spent += data.usage.cost;
      if (this.onSpend) this.onSpend(this.spent);
    }
    const msg = data.choices?.[0]?.message || {};
    let text = msg.content || '';
    if (Array.isArray(text)) text = text.map(p => p.text || '').join('\n');  // content parts
    const images = (msg.images || []).map(im => im.image_url?.url).filter(Boolean);
    return { text, images };
  },
};

function b64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
