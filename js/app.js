/* ============================================================
   app.js — الراوتر والواجهة الرئيسية
   ============================================================ */
(function () {
  'use strict';
  const TOOLS = window.TOOLS || [];

  const CATS = {
    image: ['🖼️', 'صور'],
    measure: ['📏', 'قياس'],
    translate: ['🌐', 'ترجمة'],
    text: ['✍️', 'نصوص'],
    code: ['💻', 'مبرمجون'],
    convert: ['🔀', 'محوّلات'],
    calc: ['🧮', 'حاسبات'],
    time: ['⏰', 'وقت']
  };
  // أداة الترجمة تصنيفها الأصلي convert — نُظهرها أيضاً في تصنيف «ترجمة»
  const catOf = (t) => t.cat;
  const LABELS = Object.assign({}, CATS);
  const label = (c) => (LABELS[c] ? LABELS[c][0] + ' ' + LABELS[c][1] : c);

  const $ = (s) => document.querySelector(s);
  const grid = $('#grid'), home = $('#home'), toolView = $('#tool'), toolBody = $('#tool-body'), cats = $('#cats');
  let currentCat = 'all';
  let query = '';

  /* ---------- تخزين محلي: المفضلة والمؤخّرة والمظهر ---------- */
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem('qt.' + k)) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('qt.' + k, JSON.stringify(v)); } catch (e) { /* تجاهل */ } }
  };
  let favs = store.get('favs', []);
  const recent = store.get('recent', []);
  const pushRecent = (id) => {
    const i = recent.indexOf(id);
    if (i > -1) recent.splice(i, 1);
    recent.unshift(id);
    store.set('recent', recent.slice(0, 10));
  };

  /* ---------- تطبيع البحث العربي ---------- */
  const norm = (s) => String(s || '')
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')   // تشكيل وتطويل
    .replace(/[أإآا]/g, 'ا').replace(/[ىي]/g, 'ي').replace(/ة/g, 'ه')
    .replace(/[ؤئ]/g, 'ء').replace(/\s+/g, ' ')
    .toLowerCase().trim();

  /* مرادفات بحث: كيف يكتب المستخدم العربي المصطلح التقني */
  const SYN = {
    'hash-sha': 'هاش hash تشفير بصمة تجزئة checksum sha256 sha512 sha1',
    'hash-md5': 'هاش hash تشفير بصمة تجزئة md5 checksum',
    'json-format': 'جيسون جسون json تنسيق كود بيانات',
    'json-csv': 'جسون csv اكسل اكسل شيت جدول',
    'base64-text': 'بيس64 بيز64 قاعدة64 base64 كود',
    'file-to-base64': 'بيس64 بيز64 ملف base64 تحويل',
    'base64-to-file': 'بيس64 بيز64 ملف base64 تحميل',
    'url-encode': 'رابط url يورال انكود encoding percent ترميز',
    'html-entities': 'كيانات html رموز entities ترميز كود',
    'jwt-decode': 'توكن jwt جي دبليو تي تسجيل دخول',
    'markdown-to-html': 'ماركداون markdown تحويل html مستند',
    'regex-tester': 'ريجيكس regex ريجولار تعبير نمطي بحث متقدم',
    'cron-explain': 'كرون cron جدولة مهام توقيت سيرفر',
    'number-bases': 'انظمة اعداد ثنائي عشري سداسي hex bin oct نظام',
    'morse-code': 'مورس مورس كود شفرة تلغراف morse',
    'caesar-cipher': 'قيصر تشفير شفرة سيزار caesar rot13',
    'unicode-escape': 'يونيكود unicode escape كود رموز',
    'text-binary': 'ثنائي باينري binary 0101 بت',
    'color-converter': 'لون الوان hex rgb hsl hsv كود لون محول',
    'color-contrast': 'تباين لون wcag اكسسبيليتي قراءة contrast',
    'gradient-generator': 'تدرج لوني gradient css خلفية',
    'css-minify': 'سي اس اس css تصغير ضغط كود minify',
    'string-escape': 'تهريب نصوص escape سترينج نص برمجي',
    'xml-format': 'xml اكس ام ال تنسيق كود',
    'img-crop': 'قص اقتصاص crop قص صورة جزء',
    'img-resize': 'تكبير تصغير تغيير ابعاد resize ابعاد',
    'img-compress-target': 'ضغط تصغير حجم صورة compress كيلوبايت',
    'img-convert': 'تحويل صيغة convert png jpg webp صيغة',
    'img-exif': 'ايكسف exif بيانات الكاميرا موقع التصوير metadata',
    'img-strip-meta': 'حذف بيانات وصفية exif metadata خصوصية',
    'img-favicon': 'فافيكون favicon ايقونة موقع ايكون',
    'img-palette': 'لوحة الوان palette الوان استخراج مشابه',
    'img-color-pick': 'قطارة لون picker Eyedropper اختيار لون',
    'img-round': 'زوايا دائرية circle دائرة بروفايل صورة شخصية',
    'img-grayscale': 'ابيض واسود رمادي grayscale مونوكروم',
    'img-blur': 'تمويه blur ضبابي غباش خصوصية اخفاء',
    'img-pixelate': 'بكسل pixelate تشويش اخفاء بيانات',
    'measure-gps': 'احداثيات gps خط عرض طول مسافة خرائط تحويل',
    'measure-cities': 'مدن مسافة بين مدينتين كيلومتر طريق',
    'measure-image': 'قياس مسافة صورة رسم طول خط',
    'measure-px': 'بكسل سم بوصة dpi ppi طباعة مقاس',
    'measure-scale': 'مقياس رسم خريطة نسبة 1:50000',
    'measure-travel': 'وقود بنزين سفر رحلة تكلفة طريق زمن',
    'text-case': 'حالة الاحرف كبير صغير uppercase lowercase',
    'text-diff': 'فرق مقارنة نصين diff اختلاف تعديل',
    'remove-tashkeel': 'تشكيل حركات تنوين ازالة فتحة ضمة',
    'extract-emails': 'ايميلات بريد الكتروني استخراج email',
    'extract-links': 'روابط استخراج url لينك links',
    'slugify': 'رابط صديق slug سلاج عنوان seo',
    'word-frequency': 'تكرار الكلمات عدد مرات احصاء',
    'numbers-to-arabic-words': 'ارقام كلمات عربي تحويل كتابة تفقيط',
    'numbers-to-english-words': 'ارقام كلمات انجليزي تحويل writing',
    'lorem-ipsum': 'نص وهمي لوريم عشوائي تعبئة تصميم',
    'palindrome': 'متناظر طردي عكسي كلمة معكوسة',
    'currency-converter': 'عملات صرف ريال دولار تحويل اسعار',
    'translate-text': 'ترجمة انجليزي عربي لغة translate',
    'transliterate': 'نقل صوتي كتابة عربي بحروف لاتينية اسماء',
    'mini-dictionary': 'قاموس معجم كلمة معنى dictionary',
    'speak-text': 'نطق صوت قراءة tts سماع كلام',
    'detect-language': 'كشف لغة تحديد هوية نص',
    'bmi': 'كتلة الجسم وزن طول صحة سمنة bmi',
    'calories-tdee': 'سعرات حرارية دايت رجيم اكل tdee',
    'loan-calc': 'قرض اقساط بنك فائدة شهرية تمويل',
    'interest-calc': 'فائدة مركبة بسيطة استثمار نمو',
    'age-calc': 'عمر مواليد تاريخ ميلاد سن',
    'hijri-date': 'هجري ميلادي تحويل تاريخ ام القرى رمضان',
    'hijri-events': 'رمضان عيد فطر اضحى عرفة مناسبات هجرية',
    'world-clock': 'ساعات عالمية وقت مدن فرق توقيت',
    'stopwatch': 'ساعة ايقاف مؤقت عد seconds laps',
    'countdown-timer': 'مؤقت تنازلي وقت انتهاء تنبيه',
    'pomodoro': 'بومودورو تركيز دراسة عمل جلسات',
    'weekday': 'يوم الاسبوع تاريخ جمعة سبت رقم الاسبوع',
    'eom': ''
  };
  const INDEX = TOOLS.map((t) => ({ t, hay: norm(t.title + ' ' + t.desc + ' ' + t.id + ' ' + t.cat + ' ' + label(catOf(t)) + ' ' + (SYN[t.id] || '')) }));

  /* ---------- بطاقات الأدوات ---------- */
  function card(t) {
    const a = f.el('a', { class: 'card', href: '#/t/' + t.id },
      f.el('span', { class: 'card-ico', text: t.icon || '🧩' }),
      f.el('span', { class: 'card-title', text: t.title }),
      f.el('span', { class: 'card-desc', text: t.desc }),
      f.el('span', { class: 'card-cat', text: label(catOf(t)) }));
    const star = f.el('button', {
      class: 'card-star' + (favs.includes(t.id) ? ' on' : ''), type: 'button',
      title: 'مفضلة', text: favs.includes(t.id) ? '★' : '☆'
    });
    star.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const i = favs.indexOf(t.id);
      if (i > -1) favs.splice(i, 1); else favs.push(t.id);
      store.set('favs', favs);
      star.classList.toggle('on', favs.includes(t.id));
      star.textContent = favs.includes(t.id) ? '★' : '☆';
      f.toast(favs.includes(t.id) ? 'أُضيفت إلى المفضلة ★' : 'أُزيلت من المفضلة');
      paintChips();
    });
    a.append(star);
    return a;
  }

  function paintChips() {
    const counts = { all: TOOLS.length };
    TOOLS.forEach((t) => { const c = catOf(t); counts[c] = (counts[c] || 0) + 1; });
    const list = [['all', '🧰 كل الأدوات']].concat(Object.keys(CATS).filter((c) => counts[c]).map((c) => [c, label(c)]));
    if (favs.length) list.push(['favs', '★ المفضلة']);
    cats.replaceChildren(...list.map(([c, txt]) => {
      const b = f.el('button', { class: 'chip' + (currentCat === c ? ' on' : ''), type: 'button', title: txt },
        txt, ' ', f.el('small', { text: '(' + (c === 'all' ? counts.all : c === 'favs' ? favs.length : counts[c] || 0) + ')' }));
      b.addEventListener('click', () => { currentCat = c; paintChips(); paintGrid(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
      return b;
    }));
  }

  function paintRecent() {
    const box = $('#recent-box'), list = $('#recent-list');
    const ids = recent.filter((id) => TOOLS.some((t) => t.id === id)).slice(0, 8);
    if (!ids.length) { box.hidden = true; return; }
    box.hidden = false;
    list.replaceChildren(...ids.map((id) => {
      const t = TOOLS.find((x) => x.id === id);
      const a = f.el('a', { href: '#/t/' + id, text: (t.icon || '') + ' ' + t.title });
      return f.el('span', {}, a, document.createTextNode(' '));
    }));
  }

  function paintGrid() {
    const q = norm(query);
    let list = INDEX.filter((x) => (currentCat === 'all' || (currentCat === 'favs' ? favs.includes(x.t.id) : catOf(x.t) === currentCat)));
    if (q) {
      const words = q.split(' ').filter(Boolean);
      list = list.map((x) => {
        let score = 0;
        words.forEach((w) => {
          if (norm(x.t.title).includes(w)) score += 10;
          if (norm(x.t.id).includes(w)) score += 6;
          if (norm(x.t.desc).includes(w)) score += 3;
          if (x.hay.includes(w)) score += 1;
        });
        return { x, score };
      }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score).map((r) => r.x);
    }
    const tools = list.map((x) => x.t);
    grid.replaceChildren(...tools.map(card));
    $('#empty').hidden = tools.length > 0;
    $('#hero').hidden = !!q || (currentCat !== 'all');
  }

  /* ---------- التوجيه ---------- */
  function route() {
    const hash = location.hash.replace(/^#\/?/, '');
    const m = hash.match(/^t\/(.+)$/);
    if (m) {
      const t = TOOLS.find((x) => x.id === m[1]);
      if (t) { showTool(t); return; }
      f.toast('الأداة غير موجودة', 'err');
      location.hash = '#/';
      return;
    }
    showHome();
  }

  function showHome() {
    toolView.hidden = true;
    home.hidden = false;
    paintChips();
    paintGrid();
    paintRecent();
    document.title = TOOLS.length + ' أداة عربية تعمل داخل متصفحك — أدوات سريعة';
  }

  function showTool(t) {
    home.hidden = true;
    toolView.hidden = false;
    $('#t-title').textContent = (t.icon || '') + ' ' + t.title;
    $('#t-desc').textContent = t.desc + '  ·  ' + label(catOf(t));
    const fav = $('#fav');
    fav.classList.toggle('on', favs.includes(t.id));
    fav.textContent = favs.includes(t.id) ? '★' : '☆';
    fav.onclick = () => {
      const i = favs.indexOf(t.id);
      if (i > -1) favs.splice(i, 1); else favs.push(t.id);
      store.set('favs', favs);
      fav.classList.toggle('on', favs.includes(t.id));
      fav.textContent = favs.includes(t.id) ? '★' : '☆';
      f.toast(favs.includes(t.id) ? 'أُضيفت إلى المفضلة ★' : 'أُزيلت من المفضلة');
      paintChips();
    };
    $('#link').onclick = () => f.copy(location.href);
    toolBody.replaceChildren();
    const holder = f.el('div');
    toolBody.append(holder);
    try { t.render(holder); }
    catch (e) {
      holder.append(f.el('p', { class: 'note', text: '⚠️ خطأ في تشغيل الأداة: ' + e.message }));
    }
    pushRecent(t.id);
    paintRecent();
    document.title = t.title + ' — أدوات سريعة';
    window.scrollTo({ top: 0 });
  }

  /* ---------- الأحداث ---------- */
  $('#search').addEventListener('input', f.debounce((e) => {
    query = e.target.value;
    if (!toolView.hidden) location.hash = '#/';
    paintGrid();
  }, 140));

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== $('#search')) { e.preventDefault(); $('#search').focus(); }
    if (e.key === 'Escape') {
      if (document.activeElement === $('#search')) { $('#search').value = ''; query = ''; paintGrid(); $('#search').blur(); }
      else if (!toolView.hidden) location.hash = '#/';
    }
  });

  $('#back').addEventListener('click', () => { location.hash = '#/'; });
  $('#brand').addEventListener('click', () => { $('#search').value = ''; query = ''; currentCat = 'all'; });

  const setTheme = (mode) => {
    document.documentElement.dataset.theme = mode;
    store.set('theme', mode);
    $('#theme').textContent = mode === 'dark' ? '☀️' : '🌗';
  };
  $('#theme').addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
  setTheme(store.get('theme', matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  window.addEventListener('hashchange', route);

  /* ---------- الإحصاءات والأرقام في الواجهة ---------- */
  const counts = {};
  TOOLS.forEach((t) => { const c = catOf(t); counts[c] = (counts[c] || 0) + 1; });
  $('#count').textContent = TOOLS.length;
  $('#foot-count').textContent = TOOLS.length;
  $('#brand-sub').textContent = TOOLS.length + ' أداة تعمل في متصفحك';
  const heroP = document.querySelector('#hero p');
  if (heroP) {
    heroP.textContent = 'تعديل الصور (' + (counts.image || 0) + ') والقياس (' + (counts.measure || 0) + ') والترجمة (' + (counts.translate || 0) +
      ') والنصوص (' + (counts.text || 0) + ') والبرمجة (' + (counts.code || 0) + ') والمحوّلات (' + (counts.convert || 0) +
      ') والحاسبات (' + (counts.calc || 0) + ') والوقت (' + (counts.time || 0) + '). اختر أداة أو ابحث أعلاه.';
  }

  route();
  window.QT = { TOOLS, cats: CATS, label, norm, version: '1.0' };
})();
