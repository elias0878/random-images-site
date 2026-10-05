/* ============================================================
   صور عشوائية — الملف الوحيد للمنطق
   يجلب قائمة الصور من images.json ثم يعرض صورة عشوائية عند الضغط
   ============================================================ */
(() => {
  'use strict';

  const INDEX_FILE = 'images.json';

  const btn    = document.getElementById('openBtn');
  const btnTxt = document.getElementById('btnText');
  const stage  = document.getElementById('stage');
  const img    = document.getElementById('img');
  const loader = document.getElementById('loader');
  const meta   = document.getElementById('meta');
  const msg    = document.getElementById('msg');

  /** قائمة مسارات الصور */
  let images = [];
  /** آخر رقم ظهر، لتفادي تكرار نفس الصورة مرتين متتاليتين */
  let lastIndex = -1;
  let firstRun = true;
  let busy = false;

  /* ---------- أدوات مساعدة ---------- */

  const setMsg = (text, kind = '') => {
    msg.textContent = text || '';
    msg.className = 'msg' + (kind ? ' ' + kind : '');
  };

  const spinner = (on) => { loader.hidden = !on; };

  /** يستخرج الاسم من المسار */
  const baseName = (path) => {
    const name = decodeURIComponent(path.split('/').pop() || '');
    return name.replace(/\.[^.]+$/, '');
  };

  /* ---------- تحميل القائمة ---------- */

  async function loadIndex() {
    try {
      // بدون كاش حتى تظهر الصور الجديدة فوراً بعد كل تحديث
      const res = await fetch(INDEX_FILE + '?v=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);

      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.images || []);

      images = list.filter((p) => typeof p === 'string' && p.trim());
    } catch (e) {
      images = [];
      console.error('خطأ في قراءة', INDEX_FILE, e);
    }

    if (images.length === 0) {
      setMsg('لا توجد صور في المجلد حتى الآن. أضف صوراً إلى مجلد images ثم أعد المحاولة.', 'err');
      btn.disabled = true;
    } else {
      setMsg('عدد الصور المتاحة: ' + images.length, 'ok');
    }
  }

  /* ---------- اختيار عشوائي ---------- */

  function pickRandomIndex() {
    if (images.length === 1) return 0;
    let i;
    do { i = Math.floor(Math.random() * images.length); } while (i === lastIndex);
    return i;
  }

  /** كسر الكاش الخاص بالصور عند إعادة استخدام نفس الاسم */
  function withVersion(path) {
    const sep = path.includes('?') ? '&' : '?';
    return path + sep + 'v=' + VERSION;
  }

  // نسخة ثابتة خلال عمر الصفحة الواحدة
  const VERSION = Math.floor(Date.now() / 1000);

  /* ---------- عرض صورة ---------- */

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

    const pre = new Image();
    pre.decoding = 'async';

    const done = () => {
      img.src = pre.src;
      img.classList.remove('hide');
      img.alt = baseName(path);
      img.onload = () => {
        spinner(false);
        meta.textContent = `${baseName(path)} — (${i + 1} من ${images.length})`;
        btn.disabled = false;
        btnTxt.textContent = 'صورة أخرى';
        busy = false;
        img.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };
      // في حال فشل العرض (نادر) لا نُجمّد الزر
      setTimeout(() => {
        if (busy) {
          spinner(false);
          btn.disabled = false;
          btnTxt.textContent = 'صورة أخرى';
          busy = false;
        }
      }, 12000);
    };

    const fail = () => {
      spinner(false);
      btn.disabled = false;
      btnTxt.textContent = 'حاول مرة أخرى';
      busy = false;
      setMsg('تعذّر تحميل الصورة: ' + baseName(path), 'err');
      // احذف الصورة المكسورة من القائمة حتى لا تتكرر
      images.splice(i, 1);
      lastIndex = -1;
    };

    pre.onload  = done;
    pre.onerror = fail;
    pre.src = withVersion(path);
  }

  /* ---------- الربط ---------- */

  btn.addEventListener('click', showRandomImage);

  loadIndex().then(() => {
    if (firstRun) {
      firstRun = false;
      // لا نفتح صورة تلقائياً — المستخدم هو من يضغط (حسب الطلب)
    }
  });
})();
