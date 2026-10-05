/* ============================================================
   صور عشوائية — منطق الموقع
   يجلب قائمة كبيرة من الصور من الإنترنت (أو من مجلد الصور)،
   ثم يعرض صورة عشوائية عند الضغط على الزر.
   لا يُخزَّن أي شيء على الاستضافة: الصور تُعرض مباشرة من مصدرها.
   ============================================================ */
(() => {
  'use strict';

  /* ---------- الإعدادات الافتراضية (تُدمج مع config.js) ---------- */
  const DEFAULTS = {
    source: 'picsum',
    avoidRepeat: true,
    cacheHours: 12,
    picsum: { pages: 10, limitPerPage: 100, width: 1600, height: 1000, cacheHours: 12 },
    wikimedia: { width: 1600, limitPerPage: 50, roundsPerCategory: 3, cacheHours: 12, categories: [] },
    folder: { indexFile: 'images.json' }
  };

  const CFG = merge(DEFAULTS, window.SITE_CONFIG || {});

  function merge(base, over) {
    const out = Object.assign({}, base);
    for (const k of Object.keys(over || {})) {
      const v = over[k];
      out[k] = (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]))
        ? merge(base[k], v)
        : v;
    }
    return out;
  }

  /* ---------- عناصر الصفحة ---------- */
  const btn    = document.getElementById('openBtn');
  const btnTxt = document.getElementById('btnText');
  const stage  = document.getElementById('stage');
  const img    = document.getElementById('img');
  const loader = document.getElementById('loader');
  const meta   = document.getElementById('meta');
  const msg    = document.getElementById('msg');

  /* ---------- الحالة ---------- */
  let items = [];        // [{ url, credit }]
  let lastIndex = -1;
  let busy = false;
  let ready = false;
  let loadingList = null;   // وعدٌ واحد لتحميل القائمة (لمنع التكرار)

  /* ---------- أدوات ---------- */

  const setMsg = (text, kind = '') => {
    msg.textContent = text || '';
    msg.className = 'msg' + (kind ? ' ' + kind : '');
  };

  const spinner = (on) => {
    loader.hidden = !on;
    loader.style.display = on ? 'grid' : 'none';
  };

  const baseName = (path) =>
    decodeURIComponent((String(path).split('/').pop() || '')).replace(/\.[^.]+$/, '');

  const releaseButton = (label) => {
    busy = false;
    btn.disabled = false;
    btnTxt.textContent = label;
  };

  /* ---------- ذاكرة مؤقتة في المتصفح (اختيارية تماماً) ---------- */
  const CACHE_PREFIX = 'randomImageSite:v1:';

  function readCache(key, hours) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !Array.isArray(obj.items)) return null;
      if (Date.now() - obj.t > hours * 3600e3) return null;
      return obj.items;
    } catch (e) { return null; }
  }

  function writeCache(key, list) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), items: list }));
    } catch (e) { /* الذاكرة ممتلئة أو غير متاحة — نتجاهل */ }
  }

  const json = (url) => fetch(url, { cache: 'no-store' }).then(async (r) => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const ct = r.headers.get('content-type') || '';
    const text = await r.text();
    // بعض الواجهات تُرجع نصاً عادياً عند تجاوز الحد (رسالة تحذير) بدل JSON
    if (!/json/i.test(ct) && !/^\s*[[{]/.test(text)) throw new Error('استجابة غير صالحة');
    return JSON.parse(text);
  });

  /** تأخير بسيط بين الطلبات — احتراماً لحدود المواقع المجانية */
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ============================================================
     المصادر
     كل مصدر يُرجع مصفوفة: [{ url, credit }]
     ============================================================ */

  const SOURCES = {

    /* --- Picsum: ~993 صورة من Unsplash، مسموح ربطها مباشرة --- */
    picsum: {
      label: 'Picsum',
      liveUrl() {   // صور عشوائية فورية بلا حاجة للقائمة (خطة بديلة)
        return `https://picsum.photos/${CFG.picsum.width}/${CFG.picsum.height}?random=${Math.floor(Math.random() * 1e6)}`;
      },
      async load() {
        const key = 'picsum';
        const cached = readCache(key, CFG.picsum.cacheHours);
        if (cached) return cached;

        const list = [];
        const { width, height, pages, limitPerPage } = CFG.picsum;

        for (let page = 1; page <= pages; page++) {
          let data;
          try {
            data = await json(`https://picsum.photos/v2/list?page=${page}&limit=${limitPerPage}`);
          } catch (e) { break; }
          if (!Array.isArray(data) || data.length === 0) break;

          for (const it of data) {
            if (!it || !it.id) continue;
            list.push({
              url: `https://picsum.photos/id/${it.id}/${width}/${height}`,
              credit: it.author ? '© ' + it.author + ' · Unsplash' : 'Unsplash'
            });
          }
        }

        if (list.length) writeCache(key, list);
        return list;
      }
    },

    /* --- ويكيميديا كومنز: آلاف الصور المختارة، حرة الاستخدام --- */
    wikimedia: {
      label: 'Wikimedia Commons',
      async load() {
        const key = 'wikimedia';
        const cached = readCache(key, CFG.wikimedia.cacheHours);
        if (cached) return cached;

        const list = [];
        const { width, limitPerPage, categories, roundsPerCategory } = CFG.wikimedia;

        for (const cat of categories) {
          let cont = null;
          let round = 0;

          do {
            const params = {
              action: 'query',
              generator: 'categorymembers',
              gcmtitle: 'Category:' + cat,
              gcmtype: 'file',
              gcmlimit: String(limitPerPage),
              prop: 'imageinfo',
              iiprop: 'url',
              iiurlwidth: String(width),
              format: 'json',
              origin: '*'
            };
            if (cont) params.gcmcontinue = cont;

            const api = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams(params).toString();

            let data;
            try { data = await json(api); } catch (e) { break; }

            const pages = (data && data.query && data.query.pages) || {};
            for (const p of Object.values(pages)) {
              const info = (p.imageinfo || [])[0];
              if (!info) continue;
              const url = info.thumburl || info.url;
              if (!url) continue;
              // نتجاهل الملفات غير الرسومية (svg/pdf...) التي لا تُعرض جيداً
              if (/\.(svg|pdf|tif|tiff|ogv|webm)$/i.test(url)) continue;
              list.push({ url, credit: (p.title || '').replace(/^File:/, '').replace(/\.(jpg|jpeg|png|gif|webp)$/i, '') });
            }

            cont = (data && data.continue && data.continue.gcmcontinue) || null;
            round++;

            // مهلة قصيرة بين الطلبات حتى لا نحجب من الموقع
            if (cont && round < roundsPerCategory) await wait(400);
          } while (cont && round < roundsPerCategory);

          await wait(400);
        }

        if (list.length) writeCache(key, list);
        return list;
      }
    },

    /* --- المجلد المحلي images/ (عبر images.json) --- */
    folder: {
      label: 'مجلد الصور',
      async load() {
        const data = await json(CFG.folder.indexFile + '?v=' + Math.floor(Date.now() / 1000));
        const arr = Array.isArray(data) ? data : (data.images || []);
        return arr.filter((p) => typeof p === 'string' && p.trim())
                  .map((p) => ({ url: p, credit: baseName(p) }));
      }
    }
  };

  const currentSource = () => SOURCES[CFG.source] || SOURCES.folder;

  /* ============================================================
     تحميل القائمة
     ============================================================ */

  async function ensureList() {
    if (ready && items.length) return items;
    if (loadingList) return loadingList;

    const src = currentSource();

    loadingList = (async () => {
      let list = [];
      try {
        list = await src.load();
      } catch (e) {
        console.error('تعذّر تحميل قائمة الصور من المصدر:', CFG.source, e);
        list = [];
      }

      // خطة بديلة: صور عشوائية فورية بلا قائمة (متاحة في Picsum)
      if (!list.length && typeof src.liveUrl === 'function') {
        list = [{ url: src.liveUrl(), credit: src.label, live: true }];
      }

      items = list;
      lastIndex = -1;

      if (!items.length) {
        setMsg('تعذّر جلب الصور من المصدر الآن. تحقّق من الاتصال أو جرّب لاحقاً.', 'err');
        btn.disabled = true;
        btnTxt.textContent = 'لا توجد صور';
        return items;
      }

      ready = true;
      setMsg('عدد الصور المتاحة: ' + items.length, 'ok');
      return items;
    })();

    try { return await loadingList; }
    finally { loadingList = null; }
  }

  /* ============================================================
     الاختيار والعرض
     ============================================================ */

  function pickIndex() {
    if (items.length <= 1) return 0;
    if (!CFG.avoidRepeat) return Math.floor(Math.random() * items.length);
    let i;
    do { i = Math.floor(Math.random() * items.length); } while (i === lastIndex);
    return i;
  }

  const withVersion = (url) =>
    (url.startsWith('data:') || url.includes('?random='))
      ? url
      : url + (url.includes('?') ? '&' : '?') + 'v=' + Math.floor(Date.now() / 3600e3);

  async function showRandomImage() {
    if (busy) return;

    // 1) القائمة
    if (!ready) {
      const list = await ensureList();
      if (!list.length) return;
    }

    // 2) الاختيار
    const src = currentSource();
    const i = pickIndex();
    let item = items[i];
    lastIndex = i;

    // في الوضع "المباشر بلا قائمة" نطلب صورة جديدة في كل ضغطة
    if (item.live && typeof src.liveUrl === 'function') {
      item = { url: src.liveUrl(), credit: src.label, live: true };
      items[0] = item;
    }

    busy = true;
    btn.disabled = true;
    btnTxt.textContent = 'جاري التحميل...';
    stage.hidden = false;
    spinner(true);
    setMsg('');

    // 3) الجلب المباشر من المصدر (بدون تخزين) ثم العرض
    await new Promise((resolve) => {
      const pre = new Image();

      pre.onload = () => {
        img.src = pre.src;
        img.alt = item.credit || 'صورة عشوائية';
        spinner(false);
        const pos = item.live ? '' : ' — (' + (i + 1) + ' من ' + items.length + ')';
        meta.textContent = (item.credit || '') + pos + (item.live ? '' : ' · ' + src.label);
        releaseButton('صورة أخرى');
        img.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        resolve();
      };

      pre.onerror = () => {
        spinner(false);
        setMsg('تعذّر تحميل هذه الصورة، جرّب مرة أخرى.', 'err');
        // نتجاهل الصورة المكسورة مؤقتاً حتى لا تتكرر
        if (!item.live) { items.splice(i, 1); lastIndex = -1; }
        releaseButton(items.length ? 'حاول مرة أخرى' : 'لا توجد صور');
        resolve();
      };

      pre.src = withVersion(item.url);
    });
  }

  /* ============================================================
     التشغيل
     ============================================================ */

  btn.addEventListener('click', showRandomImage);

  // تحميل القائمة مسبقاً في الخلفية حتى تكون أول ضغطة سريعة
  ensureList().then(() => {
    if (items.length) btnTxt.textContent = 'فتح الصورة';
  });
})();
