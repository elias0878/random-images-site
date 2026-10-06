/* ============================================================
   api/translate.js — الترجمة على نطاق الموقع
   GET/POST /api/translate?s=auto&t=en&q=النص
   يرجع: { ok:true, text:"...", src:"ar", engine:"..." }
   ثلاث محرّكات بالترتيب مع تحقق صارم من الردود، وكاش في الذاكرة.
   ============================================================ */
const LIMIT = 4800;
const CACHE = new Map();
const RATE = new Map();
const WINDOW = 60 * 1000, MAX_REQ = 60;

function rateLimited(ip) {
  const now = Date.now();
  const rec = RATE.get(ip) || { n: 0, t: now };
  if (now - rec.t > WINDOW) { rec.n = 0; rec.t = now; }
  rec.n++;
  RATE.set(ip, rec);
  if (RATE.size > 5000) RATE.clear();
  return rec.n > MAX_REQ;
}

const LANG = /^[a-z]{2}(-[A-Za-z]{2,4})?$/;

/* تخمين لغة المصدر عند "auto" (للمحرّكات التي لا تدعم الاكتشاف) */
function guessLang(text) {
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  if (/[\u0400-\u04FF]/.test(text)) return 'ru';
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh-CN';
  if (/[\u3040-\u30FF]/.test(text)) return 'ja';
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko';
  if (/[\u0590-\u05FF]/.test(text)) return 'he';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[\u0370-\u03FF]/.test(text)) return 'el';
  if (/\b(der|die|das|und|ist|nicht|ich|ein)\b/i.test(text)) return 'de';
  if (/\b(le|la|les|des|est|vous|pour|avec|bonjour|merci)\b/i.test(text)) return 'fr';
  if (/\b(el|los|las|que|para|con|hola|gracias)\b/i.test(text)) return 'es';
  if (/\b(il|che|per|con|ciao|grazie)\b/i.test(text)) return 'it';
  if (/\b(o|que|para|com|não|obrigado)\b/i.test(text)) return 'pt';
  if (/\b(bir|ve|için|ile|merhaba|teşekkür)\b/i.test(text)) return 'tr';
  return 'en';
}

async function get(url, ms) {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), ms || 9000);
  try {
    const r = await fetch(url, {
      signal: ac.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; QuickToolsBot/1.0)',
        'accept': 'application/json,text/plain,*/*'
      }
    });
    const body = await r.text();
    return { status: r.status, body, ct: r.headers.get('content-type') || '' };
  } finally {
    clearTimeout(id);
  }
}

const looksJson = (r) => /json|javascript|text\/plain/i.test(r.ct) || /^\s*[\[{]/.test(r.body);

/* 1) محرّك Google الكلاسيكي (أفضل نص وأدق اكتشاف) */
async function googleSingle(text, from, to) {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' +
    encodeURIComponent(from) + '&tl=' + encodeURIComponent(to) + '&dt=t&q=' + encodeURIComponent(text);
  const r = await get(url);
  if (r.status !== 200 || !looksJson(r)) throw new Error('blocked_or_' + r.status);
  const j = JSON.parse(r.body);
  if (!j || !Array.isArray(j[0])) throw new Error('bad_shape');
  const out = j[0].map((x) => (x && x[0]) || '').join('');
  if (!out.trim()) throw new Error('empty');
  return { text: out, src: (typeof j[2] === 'string' ? j[2] : from), engine: 'google' };
}

/* 2) محرّك Google البديل (يعمل حين يُحجب الأول) */
async function googleChromeEx(text, from, to) {
  const url = 'https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=' +
    encodeURIComponent(from) + '&tl=' + encodeURIComponent(to) + '&q=' + encodeURIComponent(text);
  const r = await get(url);
  if (r.status !== 200 || !looksJson(r)) throw new Error('blocked_or_' + r.status);
  const j = JSON.parse(r.body);
  let out = '', src = from;
  const walk = (x) => {
    if (typeof x === 'string') { out += x; return; }
    if (Array.isArray(x)) {
      if (typeof x[0] === 'string' && typeof x[1] === 'string' && x[1].length <= 8) { out += x[0]; src = x[1]; return; }
      x.forEach(walk);
    }
  };
  walk(j);
  if (!out.trim()) throw new Error('empty');
  return { text: out, src, engine: 'google-alt' };
}

/* 3) MyMemory (يحتاج لغة مصدر صريحة) */
async function mymemory(text, from, to) {
  let s = from === 'auto' ? guessLang(text) : from;
  if (s === to) s = to === 'ar' ? 'en' : 'ar';
  const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text.slice(0, 480)) +
    '&langpair=' + encodeURIComponent(s + '|' + to);
  const r = await get(url, 12000);
  if (r.status !== 200 || !looksJson(r)) throw new Error('blocked_or_' + r.status);
  const j = JSON.parse(r.body);
  const out = j && j.responseData && j.responseData.translatedText;
  if (!out || /^PLEASE SELECT/i.test(out) || /INVALID/i.test(out)) throw new Error('engine_refused');
  return { text: out, src: s, engine: 'mymemory' };
}

module.exports = async function handler(req, res) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'anon';
  if (rateLimited(ip)) {
    res.status(429).json({ ok: false, error: 'too_many_requests', message: 'طلبات كثيرة جداً — انتظر دقيقة.' });
    return;
  }

  let q, s, t;
  try {
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      q = body.q; s = body.s || 'auto'; t = body.t || 'ar';
    } else {
      const u = new URL(req.url, 'http://x');
      q = u.searchParams.get('q'); s = u.searchParams.get('s') || 'auto'; t = u.searchParams.get('t') || 'ar';
    }
  } catch (e) {
    res.status(400).json({ ok: false, error: 'bad_request', message: 'طلب غير صالح.' });
    return;
  }

  if (!q || !String(q).trim()) {
    res.status(400).json({ ok: false, error: 'missing_query', message: 'لا يوجد نص للترجمة.' });
    return;
  }
  if (String(q).length > LIMIT) {
    res.status(413).json({ ok: false, error: 'too_long', message: 'النص أطول من الحد (' + LIMIT + ' حرف). قسّمه إلى أجزاء.' });
    return;
  }
  if (!LANG.test(t) || !(s === 'auto' || LANG.test(s))) {
    res.status(400).json({ ok: false, error: 'bad_lang', message: 'رمز لغة غير مدعوم.' });
    return;
  }

  const text = String(q);
  const key = s + '>' + t + ':' + text;
  if (CACHE.has(key)) {
    res.setHeader('cache-control', 'public, max-age=86400');
    res.status(200).json({ ok: true, cached: true, ...CACHE.get(key) });
    return;
  }

  const engines = [googleSingle, googleChromeEx, mymemory];
  const errors = [];
  for (const fn of engines) {
    try {
      const out = await fn(text, s, t);
      if (CACHE.size > 3000) CACHE.clear();
      CACHE.set(key, out);
      res.setHeader('cache-control', s === 'auto' ? 'private, max-age=3600' : 'public, max-age=86400');
      res.status(200).json({ ok: true, ...out });
      return;
    } catch (e) {
      errors.push(fn.name + ':' + e.message);
    }
  }

  res.status(502).json({
    ok: false,
    error: 'all_engines_failed',
    message: 'تعذّرت الترجمة من كل المحرّكات. تأكد من الاتصال وأعد المحاولة.',
    detail: errors
  });
};
