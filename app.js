/* ============================================================
   صور عشوائية — منطق الموقع
   1) يجلب قائمة كبيرة من الصور من المصدر المحدَّد في config.js فقط
   2) عند الضغط على الزر يعرض صورة عشوائية من القائمة
   لا يُخزَّن أي ملف على الاستضافة: الصور تُمرَّر مباشرة من المصدر.
   ============================================================ */
(() => {
  'use strict';

  /* ---------- الإعدادات الافتراضية (تُدمج مع config.js) ---------- */
  const DEFAULTS = {
    source: 'picsum',
    useProxy: true,
    avoidRepeat: true,
    allowEmergencyImage: true,
    picsum: { pages: 10, limitPerPage: 100, width: 1200, height: 750, format: 'jpg', cacheHours: 12 },
    wikimedia: { width: 1200, limitPerPage: 50, roundsPerCategory: 3, cacheHours: 12, categories: [] },
    folder: { indexFile: 'images.json' }
  };

  const CFG = merge(DEFAULTS, window.SITE_CONFIG || {});

  function merge(base, over) {
    const out = Object.assign({}, base);
    for (const k of Object.keys(over || {})) {
      const v = over[k];
      const bothObjects = v && typeof v === 'object' && !Array.isArray(v) &&
                          base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]);
      out[k] = bothObjects ? merge(base[k], v) : v;
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
  let items = [];          // [{ url, credit }]
  let lastIndex = -1;
  let busy = false;
  let ready = false;
  let loadingList = null;

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

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- التمرير عبر نطاقنا (يحلّ حجب شبكات CDN) ---------- */

  /** نطاقات المصادر المسموح بها في التمرير */
  const ALLOWED_HOSTS = [
    'picsum.photos', 'fastly.picsum.photos', 'i.picsum.photos',
    'upload.wikimedia.org', 'commons.wikimedia.org', 'thumb.wikimedia.org'
  ];

  /** يمنع خروج أي طلب إلى نطاق خارج المصادر المسموح بها أو موقعنا */
  function assertAllowed(url) {
    // صور مضمّنة (data:) — تُستخدم في المعاينة المستقلة فقط
    if (/^data:/i.test(url)) return url;
    // مسارات داخلية من نفس الموقع (مجلد الصور المحلي)
    if (!/^https?:/i.test(url)) return url;

    const h = new URL(url).hostname;
    const ours = location.hostname;
    if (h === ours || h.endsWith('.' + ours)) return url;

    if (!ALLOWED_HOSTS.some((a) => h === a || h.endsWith('.' + a))) {
      throw new Error('نطاق غير مسموح من المصدر: ' + h);
    }
    return url;
  }

  /** يمرّر الرابط عبر دالة الخادم إن كان التمرير مُفعّلاً، وإلا يرجعه كما هو */
  function viaProxy(url) {
    assertAllowed(url);
    // لا نمرّر البيانات المضمّنة ولا الملفات المحلية
    if (!CFG.useProxy || /^data:/i.test(url) || !/^https?:/i.test(url)) return url;
    return '/api/img?u=' + encodeURIComponent(url);
  }

  function viaProxyData(url) {
    assertAllowed(url);
    if (!CFG.useProxy || !/^https?:/i.test(url)) return url;
    return '/api/data?u=' + encodeURIComponent(url);
  }

  async function fetchJSON(url, opts) {
    const res = await fetch(url, opts || {});
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    return JSON.parse(text);   // يفشل بوضوح لو رجع نص غير JSON
  }

  /* ---------- ذاكرة مؤقتة في المتصفح (اختيارية) ---------- */
  const CACHE_PREFIX = 'randomImageSite:v2:';

  function readCache(key, hours) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !Array.isArray(obj.items) || !obj.items.length) return null;
      if (Date.now() - obj.t > hours * 3600e3) return null;
      return obj.items;
    } catch { return null; }
  }

  function writeCache(key, list) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), items: list }));
    } catch { /* الذاكرة ممتلئة — نتجاهل */ }
  }

  /* ============================================================
     المصادر — كل مصدر يُرجع: [{ url, credit }]
     ============================================================ */

  const SOURCES = {

    /* ---------- Picsum: نحو 993 صورة ---------- */
    picsum: {
      label: 'Picsum',
      cacheKey: 'picsum',

      size: () => `${CFG.picsum.width}/${CFG.picsum.height}`,

      /** رابط صورة معيّنة بالمعرّف */
      imageUrl(id) {
        const { width, height, format } = CFG.picsum;
        const ext = format === 'webp' ? '.webp' : '';
        return `https://picsum.photos/id/${id}/${width}/${height}${ext}`;
      },

      /** صورة عشوائية فورية من نفس المصدر (احتياطية فقط) */
      emergencyUrl() {
        const { width, height } = CFG.picsum;
        return `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1e6)}`;
      },

      async load() {
        const cached = readCache(this.cacheKey, CFG.picsum.cacheHours);
        if (cached) return cached;

        const list = [];
        const { pages, limitPerPage } = CFG.picsum;

        for (let page = 1; page <= pages; page++) {
          const api = `https://picsum.photos/v2/list?page=${page}&limit=${limitPerPage}`;
          let data;
          try {
            data = await fetchJSON(viaProxyData(api));
          } catch (e) {
            console.warn('توقف جلب الصفحة ' + page + ':', e.message);
            break;
          }
          if (!Array.isArray(data) || !data.length) break;

          for (const it of data) {
            if (!it || !it.id) continue;
            list.push({
              url: this.imageUrl(it.id),
              credit: it.author ? '© ' + it.author + ' · Unsplash' : 'Unsplash'
            });
          }
          await wait(60);   // لطفاً بالمصدر
        }

        if (list.length) writeCache(this.cacheKey, list);
        return list;
      }
    },

    /* ---------- ويكيميديا كومنز ---------- */
    wikimedia: {
      label: 'Wikimedia Commons',
      cacheKey: 'wikimedia',

      async load() {
        const cached = readCache(this.cacheKey, CFG.wikimedia.cacheHours);
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

            let data;
            try {
              data = await fetchJSON(viaProxyData('https://commons.wikimedia.org/w/api.php?' + new URLSearchParams(params).toString()));
            } catch (e) {
              console.warn('تعذّر جلب التصنيف:', cat, e.message);
              break;
            }

            const pages = (data && data.query && data.query.pages) || {};
            for (const p of Object.values(pages)) {
              const info = (p.imageinfo || [])[0];
              if (!info) continue;
              const url = info.thumburl || info.url;
              if (!url) continue;
              if (/\.(svg|pdf|tif|tiff|ogv|webm)$/i.test(url)) continue;
              list.push({
                url,
                credit: (p.title || '').replace(/^File:/, '').replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
              });
            }

            cont = (data && data.continue && data.continue.gcmcontinue) || null;
            round++;
            if (cont && round < roundsPerCategory) await wait(400);
          } while (cont && round < roundsPerCategory);

          await wait(400);
        }

        if (list.length) writeCache(this.cacheKey, list);
        return list;
      }
    },

    /* ---------- المجلد المحلي images/ ---------- */
    folder: {
      label: 'مجلد الصور',
      cacheKey: 'folder',

      async load() {
        const data = await fetchJSON(CFG.folder.indexFile + '?v=' + Math.floor(Date.now() / 3600e3));
        const arr = Array.isArray(data) ? data : (data.images || []);
        const credits = (!Array.isArray(data) && data.credits) || [];
        return arr
          .filter((p) => typeof p === 'string' && p.trim())
          .map((p, i) => ({ url: p, credit: credits[i] || baseName(p) }));
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
        console.error('تعذّر تحميل القائمة من المصدر «' + CFG.source + '»:', e && e.message);
      }

      // صورة احتياطية واحدة من نفس المصدر — الزر لا يتوقف أبداً
      if (!list.length && CFG.allowEmergencyImage && typeof src.emergencyUrl === 'function') {
        list = [{ url: src.emergencyUrl(), credit: src.label, emergency: true }];
      }

      items = list;
      lastIndex = -1;

      if (!items.length) {
        setMsg('تعذّر جلب الصور من المصدر «' + src.label + '». تحقّق من الاتصال ثم أعد المحاولة.', 'err');
        btn.disabled = false;
        btnTxt.textContent = 'إعادة المحاولة';
        return items;
      }

      ready = true;
      setMsg('المصدر: ' + src.label + ' — عدد الصور المتاحة: ' + items.length, 'ok');
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

  /** يحمّل صورة واحدة ويعيدها (أو يرفض) */
  function preload(url) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(url);
      im.onerror = () => reject(new Error('فشل تحميل الصورة'));
      im.src = url;
    });
  }

  async function showRandomImage() {
    if (busy) return;

    // 1) القائمة
    if (!ready || !items.length) {
      const list = await ensureList();
      if (!list.length) {
        // نحاول مرة أخرى في الضغطة التالية
        ready = false;
        return;
      }
    }

    const src = currentSource();

    // 2) الاختيار
    const i = pickIndex();
    let item = items[i];
    lastIndex = i;

    // في الوضع الاحتياطي: نطلب صورة جديدة في كل ضغطة
    if (item.emergency && typeof src.emergencyUrl === 'function') {
      item = { url: src.emergencyUrl(), credit: src.label, emergency: true };
      items[i] = item;
    }

    busy = true;
    btn.disabled = true;
    btnTxt.textContent = 'جاري التحميل...';
    stage.hidden = false;
    spinner(true);
    setMsg('');

    // 3) الجلب والعرض
    try {
      await preload(viaProxy(item.url));
    } catch (e) {
      // محاولة واحدة إضافية قبل الاستسلام
      try { await preload(viaProxy(item.url)); }
      catch {
        spinner(false);
        setMsg('تعذّر تحميل الصورة من المصدر «' + src.label + '». جرّب مرة أخرى.', 'err');
        if (!item.emergency) { items.splice(i, 1); lastIndex = -1; }
        if (items.length) releaseButton('حاول مرة أخرى');
        else { ready = false; releaseButton('إعادة المحاولة'); }
        return;
      }
    }

    img.src = viaProxy(item.url);
    img.alt = item.credit || 'صورة عشوائية';
    img.onload = () => spinner(false);
    spinner(false);

    const pos = item.emergency ? '' : ' — (' + (i + 1) + ' من ' + items.length + ')';
    meta.textContent = (item.credit || '') + pos + ' · المصدر: ' + src.label;
    releaseButton('صورة أخرى');
    img.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ============================================================
     التشغيل
     ============================================================ */

  btn.addEventListener('click', showRandomImage);

  // تحميل القائمة مسبقاً حتى تكون أول ضغطة سريعة
  ensureList();
})();
