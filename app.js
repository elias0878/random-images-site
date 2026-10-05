/* ============================================================
   صور عشوائية — منطق الموقع
   1) يقرأ images.json (قائمة الصور الموجودة في مجلد images/)
   2) عند الضغط على الزر يعرض صورة عشوائية
   لا قاعدة بيانات، لا تسجيل دخول، لا شيء معقّد.
   ============================================================ */
(() => {
  'use strict';

  const INDEX_FILE = 'images.json';
  /** نسخة ثابتة خلال عمر الصفحة، لكسر كاش الصور عند تحديثها بنفس الاسم */
  const VERSION = Math.floor(Date.now() / 1000);

  const btn    = document.getElementById('openBtn');
  const btnTxt = document.getElementById('btnText');
  const stage  = document.getElementById('stage');
  const img    = document.getElementById('img');
  const loader = document.getElementById('loader');
  const meta   = document.getElementById('meta');
  const msg    = document.getElementById('msg');

  let images = [];      // قائمة مسارات الصور
  let lastIndex = -1;   // آخر صورة ظهرت (لتفادي التكرار المتتالي)
  let busy = false;

  /* ---------- أدوات مساعدة ---------- */

  const setMsg = (text, kind = '') => {
    msg.textContent = text || '';
    msg.className = 'msg' + (kind ? ' ' + kind : '');
  };

  const spinner = (on) => {
    loader.hidden = !on;
    loader.style.display = on ? 'grid' : 'none';   // تأكيد إضافي (احتياط)
  };

  const baseName = (path) =>
    decodeURIComponent((path.split('/').pop() || '')).replace(/\.[^.]+$/, '');

  const resetButton = (label) => {
    busy = false;
    btn.disabled = false;
    btnTxt.textContent = label;
  };

  /* ---------- 1) تحميل قائمة الصور ---------- */

  async function loadIndex() {
    try {
      // cache: no-store حتى تظهر الصور الجديدة فوراً بعد كل تحديث
      const res = await fetch(INDEX_FILE + '?v=' + VERSION, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);

      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.images || []);

      images = list.filter((p) => typeof p === 'string' && p.trim());
    } catch (e) {
      images = [];
      console.error('تعذّر قراءة ' + INDEX_FILE, e);
    }

    if (images.length === 0) {
      setMsg('لا توجد صور في المجلد حتى الآن.', 'err');
      btn.disabled = true;
      btnTxt.textContent = 'لا توجد صور';
    } else {
      setMsg('عدد الصور المتاحة: ' + images.length, 'ok');
    }
  }

  /* ---------- 2) اختيار صورة عشوائية ---------- */

  function pickRandomIndex() {
    if (images.length <= 1) return 0;
    let i;
    do {
      i = Math.floor(Math.random() * images.length);
    } while (i === lastIndex);
    return i;
  }

  const withVersion = (path) =>
    path.startsWith('data:')
      ? path
      : path + (path.includes('?') ? '&' : '?') + 'v=' + VERSION;

  /* ---------- 3) العرض ---------- */

  function showRandomImage() {
    if (busy || images.length === 0) return;

    const i = pickRandomIndex();
    const path = images[i];
    lastIndex = i;

    busy = true;
    btn.disabled = true;
    btnTxt.textContent = 'جاري التحميل...';
    stage.hidden = false;
    spinner(true);
    setMsg('');

    // نحمّل الصورة أولاً (preload) ثم نعرضها — بلا شاشة بيضاء
    const pre = new Image();

    pre.onload = () => {
      img.src = pre.src;
      img.alt = baseName(path);
      // نُخفي دائرة الانتظار فور ظهور الصورة (وأيضاً عند اكتمال رسمها فعلياً)
      img.onload = () => spinner(false);
      spinner(false);
      meta.textContent = baseName(path) + ' — (' + (i + 1) + ' من ' + images.length + ')';
      resetButton('صورة أخرى');
      img.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    pre.onerror = () => {
      spinner(false);
      setMsg('تعذّر تحميل الصورة: ' + baseName(path), 'err');
      images.splice(i, 1);   // احذف الصورة المكسورة حتى لا تتكرر
      lastIndex = -1;
      resetButton(images.length ? 'حاول مرة أخرى' : 'لا توجد صور');
      if (!images.length) btn.disabled = true;
    };

    pre.src = withVersion(path);
  }

  /* ---------- التشغيل ---------- */

  btn.addEventListener('click', showRandomImage);
  loadIndex();
})();
