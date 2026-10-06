/* ============================================================
   tools/lang.js — الترجمة واللغة (6 أدوات)
   ============================================================ */
(function () {
  'use strict';
  const t = f.tool;

  /* ============ 1) النقل الصوتي (عربي ↔ لاتيني) ============ */
  t({
    id: 'transliterate', cat: 'translate', icon: '🔤', title: 'النقل الصوتي عربي ↔ لاتيني',
    desc: 'كتابة الأسماء العربية بحروف لاتينية والعكس — يعمل بلا إنترنت',
    render: function (root) {
      const ta = f.area({ rows: 5, value: 'محمد بن سلمان\nعبدالله الصالح', dir: 'auto' });
      const dir = f.select({ options: [['a2l', 'عربي → لاتيني'], ['l2a', 'لاتيني → عربي']], value: 'a2l' });
      const sys = f.select({ options: [['simple', 'نظام مبسّط (للوثائق والهويات)'], ['iso', 'نظام ISO/ALA-LC العلمي'], ['fr', 'نطق فرنسي']], value: 'simple' });
      const res = f.out({ filename: 'transliteration.txt', dir: 'ltr' });
      const MAP_SIMPLE = { 'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ة': 'a', 'ء': "'", 'ئ': "'", 'ؤ': "'", 'ﻻ': 'la' };
      const MAP_ISO = Object.assign({}, MAP_SIMPLE, { 'ا': 'ā', 'أ': 'ʾa', 'إ': 'ʾi', 'آ': 'ʾā', 'ث': 'th', 'ح': 'ḥ', 'خ': 'kh', 'ذ': 'dh', 'ش': 'sh', 'ص': 'ṣ', 'ض': 'ḍ', 'ط': 'ṭ', 'ظ': 'ẓ', 'ع': 'ʿ', 'غ': 'gh', 'ق': 'q', 'ه': 'h', 'ة': 'a', 'ى': 'ā' });
      const MAP_FR = Object.assign({}, MAP_SIMPLE, { 'و': 'ou', 'ي': 'i', 'ث': 'th', 'خ': 'kh', 'ش': 'ch', 'ج': 'dj', 'ق': 'k', 'ح': 'h', 'ع': 'a', 'ة': 'a', 'ه': 'e' });
      const LAT2AR = [['kh', 'خ'], ['sh', 'ش'], ['th', 'ث'], ['dh', 'ذ'], ['gh', 'غ'], ['aa', 'ا'], ['ee', 'ي'], ['oo', 'و'], ['ou', 'و'], ['ch', 'ش'], ['dj', 'ج'], ['ph', 'ف'], ['aa', 'ا'], ['a', 'ا'], ['b', 'ب'], ['c', 'ك'], ['d', 'د'], ['e', 'ي'], ['f', 'ف'], ['g', 'ج'], ['h', 'ه'], ['i', 'ي'], ['j', 'ج'], ['k', 'ك'], ['l', 'ل'], ['m', 'م'], ['n', 'ن'], ['o', 'و'], ['p', 'ب'], ['q', 'ق'], ['r', 'ر'], ['s', 'س'], ['t', 'ت'], ['u', 'و'], ['v', 'ف'], ['w', 'و'], ['x', 'كس'], ['y', 'ي'], ['z', 'ز'], ["'", 'ء']];
      const a2l = (s) => s.split('').map((ch) => {
        if (ch === 'ّ') return '';
        if ('\u064B\u064C\u064D\u064E\u064F\u0650\u0652'.includes(ch)) return '';
        if (ch === ' ' || ch === '\n') return ch;
        const map = sys.value === 'iso' ? MAP_ISO : sys.value === 'fr' ? MAP_FR : MAP_SIMPLE;
        return map[ch] !== undefined ? map[ch] : ch;
      }).join('').replace(/aa+/g, 'a').replace(/\s+/g, ' ');
      const l2a = (s) => {
        let out = '', i = 0;
        const low = s.toLowerCase();
        while (i < low.length) {
          let matched = false;
          for (const [lat, ar] of LAT2AR) {
            if (low.startsWith(lat, i)) { out += ar; i += lat.length; matched = true; break; }
          }
          if (!matched) { out += /[a-z]/.test(low[i]) ? '' : s[i]; i++; }
        }
        return out;
      };
      const cap = (s) => s.replace(/(^|\s)([a-z])/g, (m, a, b) => a + b.toUpperCase());
      const run = () => {
        const lines = ta.value.split('\n').filter((l) => l.trim());
        if (!lines.length) { res.set('اكتب نصاً أولاً.'); return; }
        const rows = lines.map((ln) => {
          const outv = dir.value === 'a2l' ? cap(a2l(ln)) : l2a(ln);
          return ln + '\n   → ' + outv;
        });
        res.set('— النتيجة —\n\n' + rows.join('\n\n') +
          '\n\n— للنسخ مباشرة —\n' + lines.map((ln) => (dir.value === 'a2l' ? cap(a2l(ln)) : l2a(ln))).join('\n') +
          '\n\nملاحظة: النقل الصوتي تقريب للأصوات لا ترجمة، وقد تختلف كتابة بعض الأسماء حسب البلد.');
      };
      ta.addEventListener('input', f.debounce(run, 250));
      dir.addEventListener('change', run);
      sys.addEventListener('change', run);
      root.append(f.grid(f.field('الاتجاه', dir), f.field('النظام', sys)), f.field('النص', ta), res.el);
      run();
    }
  });

  /* ============ 2) قاموس عربي ↔ إنجليزي مصغّر ============ */
  t({
    id: 'mini-dictionary', cat: 'translate', icon: '📖', title: 'قاموس عربي-إنجليزي مصغّر',
    desc: 'قاموس مدمج يعمل بلا إنترنت — بحث بالعربية أو الإنجليزية مع أمثلة',
    render: function (root) {
      const D = [
        ['كتاب', 'book'], ['قلم', 'pen'], ['بيت', 'house'], ['باب', 'door'], ['نافذة', 'window'], ['مدرسة', 'school'],
        ['جامعة', 'university'], ['طالب', 'student'], ['معلّم', 'teacher'], ['درس', 'lesson'], ['امتحان', 'exam'],
        ['سؤال', 'question'], ['جواب', 'answer'], ['كلمة', 'word'], ['جملة', 'sentence'], ['لغة', 'language'],
        ['ترجمة', 'translation'], ['معنى', 'meaning'], ['مثال', 'example'], ['صفحة', 'page'], ['ملف', 'file'],
        ['صورة', 'image'], ['لون', 'color'], ['حجم', 'size'], ['خط', 'line'], ['شكل', 'shape'], ['رقم', 'number'],
        ['حساب', 'account / calculation'], ['مبلغ', 'amount'], ['نسبة', 'percentage'], ['سعر', 'price'],
        ['خصم', 'discount'], ['ضريبة', 'tax'], ['راتب', 'salary'], ['قرض', 'loan'], ['فائدة', 'interest'],
        ['ربح', 'profit'], ['خسارة', 'loss'], ['سوق', 'market'], ['متجر', 'store'], ['عميل', 'customer'],
        ['فاتورة', 'invoice'], ['دفع', 'payment'], ['نقد', 'cash'], ['بطاقة', 'card'], ['بنك', 'bank'],
        ['ماء', 'water'], ['طعام', 'food'], ['خبز', 'bread'], ['حليب', 'milk'], ['لحم', 'meat'], ['دجاج', 'chicken'],
        ['أرز', 'rice'], ['شاي', 'tea'], ['قهوة', 'coffee'], ['سكر', 'sugar'], ['ملح', 'salt'], ['زيت', 'oil'],
        ['تفاح', 'apple'], ['موز', 'banana'], ['برتقال', 'orange'], ['عنب', 'grapes'], ['تمر', 'dates'], ['ليمون', 'lemon'],
        ['أب', 'father'], ['أم', 'mother'], ['ابن', 'son'], ['ابنة', 'daughter'], ['أخ', 'brother'], ['أخت', 'sister'],
        ['جد', 'grandfather'], ['جدة', 'grandmother'], ['زوج', 'husband'], ['زوجة', 'wife'], ['طفل', 'child'],
        ['صديق', 'friend'], ['جار', 'neighbor'], ['رجل', 'man'], ['امرأة', 'woman'], ['ولد', 'boy'], ['بنت', 'girl'],
        ['رأس', 'head'], ['عين', 'eye'], ['يد', 'hand'], ['قدم', 'foot'], ['قلب', 'heart'], ['دم', 'blood'],
        ['مريض', 'sick'], ['دواء', 'medicine'], ['طبيب', 'doctor'], ['مستشفى', 'hospital'], ['صحة', 'health'],
        ['سيارة', 'car'], ['طائرة', 'airplane'], ['قطار', 'train'], ['سفينة', 'ship'], ['دراجة', 'bicycle'],
        ['طريق', 'road'], ['شارع', 'street'], ['مدينة', 'city'], ['قرية', 'village'], ['بلد', 'country'],
        ['خريطة', 'map'], ['مسافة', 'distance'], ['سفر', 'travel'], ['مطار', 'airport'], ['ميناء', 'port'],
        ['وقت', 'time'], ['ساعة', 'hour / clock'], ['دقيقة', 'minute'], ['ثانية', 'second'], ['يوم', 'day'],
        ['أسبوع', 'week'], ['شهر', 'month'], ['سنة', 'year'], ['اليوم', 'today'], ['غداً', 'tomorrow'],
        ['أمس', 'yesterday'], ['صباح', 'morning'], ['ظهر', 'noon'], ['مساء', 'evening'], ['ليل', 'night'],
        ['شمس', 'sun'], ['قمر', 'moon'], ['نجم', 'star'], ['سماء', 'sky'], ['أرض', 'earth'], ['بحر', 'sea'],
        ['نهر', 'river'], ['جبل', 'mountain'], ['مطر', 'rain'], ['ريح', 'wind'], ['ثلج', 'snow'], ['حرارة', 'temperature'],
        ['صغير', 'small'], ['كبير', 'big'], ['طويل', 'long / tall'], ['قصير', 'short'], ['جديد', 'new'], ['قديم', 'old'],
        ['سريع', 'fast'], ['بطيء', 'slow'], ['سهل', 'easy'], ['صعب', 'difficult'], ['جميل', 'beautiful'], ['قبيح', 'ugly'],
        ['قوي', 'strong'], ['ضعيف', 'weak'], ['نظيف', 'clean'], ['متسخ', 'dirty'], ['حار', 'hot'], ['بارد', 'cold'],
        ['مفتوح', 'open'], ['مغلق', 'closed'], ['مهم', 'important'], ['ممكن', 'possible'], ['صحيح', 'correct'], ['خطأ', 'wrong'],
        ['يعمل', 'work'], ['يدرس', 'study'], ['يكتب', 'write'], ['يقرأ', 'read'], ['يتكلم', 'speak'], ['يسمع', 'hear'],
        ['يرى', 'see'], ['يذهب', 'go'], ['يأتي', 'come'], ['يأكل', 'eat'], ['يشرب', 'drink'], ['ينام', 'sleep'],
        ['يشتري', 'buy'], ['يبيع', 'sell'], ['يعطي', 'give'], ['يأخذ', 'take'], ['يفتح', 'open'], ['يغلق', 'close'],
        ['يساعد', 'help'], ['يسأل', 'ask'], ['يجيب', 'answer'], ['يفكر', 'think'], ['يفهم', 'understand'], ['يعرف', 'know'],
        ['أنا', 'I'], ['أنت', 'you'], ['هو', 'he'], ['هي', 'she'], ['نحن', 'we'], ['هم', 'they'],
        ['نعم', 'yes'], ['لا', 'no'], ['ربما', 'maybe'], ['شكراً', 'thank you'], ['عفواً', 'you are welcome'], ['مرحباً', 'hello'],
        ['وداعاً', 'goodbye'], ['من فضلك', 'please'], ['آسف', 'sorry'], ['أهلاً وسهلاً', 'welcome'], ['صباح الخير', 'good morning'], ['تصبح على خير', 'good night'],
        ['كم؟', 'how much?'], ['أين؟', 'where?'], ['متى؟', 'when?'], ['لماذا؟', 'why?'], ['كيف؟', 'how?'], ['من؟', 'who?'],
        ['واحد', 'one'], ['اثنان', 'two'], ['ثلاثة', 'three'], ['أربعة', 'four'], ['خمسة', 'five'], ['ستة', 'six'],
        ['سبعة', 'seven'], ['ثمانية', 'eight'], ['تسعة', 'nine'], ['عشرة', 'ten'], ['مئة', 'hundred'], ['ألف', 'thousand'],
        ['أحمر', 'red'], ['أزرق', 'blue'], ['أخضر', 'green'], ['أصفر', 'yellow'], ['أسود', 'black'], ['أبيض', 'white'],
        ['عمل', 'work / job'], ['مشروع', 'project'], ['شركة', 'company'], ['مدير', 'manager'], ['موظف', 'employee'], ['اجتماع', 'meeting'],
        ['تقرير', 'report'], ['خطة', 'plan'], ['هدف', 'goal'], ['نتيجة', 'result'], ['مشكلة', 'problem'], ['حل', 'solution'],
        ['جوال', 'mobile phone'], ['حاسوب', 'computer'], ['شاشة', 'screen'], ['برنامج', 'program'], ['تطبيق', 'application'], ['شبكة', 'network'],
        ['إنترنت', 'internet'], ['موقع', 'website'], ['رابط', 'link'], ['بريد', 'mail'], ['كلمة المرور', 'password'], ['حساب مستخدم', 'user account'],
        ['أمان', 'security'], ['خصوصية', 'privacy'], ['نسخة احتياطية', 'backup'], ['تحديث', 'update'], ['تنزيل', 'download'], ['رفع', 'upload'],
        ['ملاحظة', 'note'], ['تذكير', 'reminder'], ['مهمة', 'task'], ['قائمة', 'list'], ['جدول', 'table / schedule'], ['تقرير مالي', 'financial report']
      ];
      const q = f.inp({ placeholder: 'اكتب كلمة بالعربية أو الإنجليزية…', dir: 'auto' });
      const res = f.out({ filename: 'dictionary.txt' });
      const view = f.el('div', { class: 'out-pre' });
      const norm2 = (s) => s.replace(/[\u064B-\u0652]/g, '').replace(/[أإآا]/g, 'ا').replace(/[ىي]/g, 'ي').replace(/ة/g, 'ه').trim().toLowerCase();
      const run = () => {
        const s = norm2(q.value);
        if (!s) { view.textContent = 'اكتب كلمة… (' + D.length + ' مدخل في القاموس المدمج)'; res.set(''); return; }
        const exact = [], part = [];
        D.forEach(([ar, en]) => {
          const na = norm2(ar), ne = en.toLowerCase();
          if (na === s || ne === s || ne.split(' / ').includes(s)) exact.push([ar, en]);
          else if (na.includes(s) || ne.includes(s)) part.push([ar, en]);
        });
        view.textContent = [
          exact.length ? '— نتائج مطابقة —\n' + exact.map(([a, e]) => '  ' + a.padEnd(18) + ' = ' + e).join('\n') : '',
          part.length ? '\n— نتائج مشابهة —\n' + part.slice(0, 20).map(([a, e]) => '  ' + a.padEnd(18) + ' = ' + e).join('\n') : '',
          !exact.length && !part.length ? 'لا توجد نتائج.\nجرّب كلمة مفردة، أو استخدم أداة «ترجمة نص» للأداء الكامل.' : ''
        ].filter(Boolean).join('\n');
        res.set('\n'.concat('القاموس المدمج: ' + D.length + ' مدخل عربي-إنجليزي\nالبحث: ' + q.value + '\n\n' + (view.textContent)));
      };
      q.addEventListener('input', f.debounce(run, 160));
      root.append(f.field('ابحث في القاموس', q),
        f.row(f.btn('📚 اعرض كل الكلمات', () => {
          view.textContent = D.map(([a, e]) => '  ' + a.padEnd(18) + ' = ' + e).join('\n');
          res.set('كل مدخلات القاموس (' + D.length + '):\n\n' + view.textContent);
        }, 'ghost')),
        view, res.el,
        f.note('قاموس مصغّر مدمج للكلمات الشائعة (يعمل بلا إنترنت). للترجمة الكاملة استخدم أداة «ترجمة نص».'));
      run();
    }
  });

  /* ============ 3) ترجمة دفعة أسطر ============ */
  t({
    id: 'translate-batch', cat: 'translate', icon: '📑', title: 'ترجمة عدة أسطر دفعة واحدة',
    desc: 'يترجم كل سطر على حدة ويحافظ على الترتيب — للترجمات الطويلة والقوائم',
    render: function (root) {
      const LANGS = [['ar', 'العربية'], ['en', 'الإنجليزية'], ['fr', 'الفرنسية'], ['es', 'الإسبانية'], ['de', 'الألمانية'], ['tr', 'التركية'], ['ru', 'الروسية'], ['zh-CN', 'الصينية'], ['ja', 'اليابانية'], ['ur', 'الأردية'], ['fa', 'الفارسية'], ['hi', 'الهندية'], ['id', 'الإندونيسية'], ['nl', 'الهولندية'], ['pt', 'البرتغالية'], ['it', 'الإيطالية'], ['sv', 'السويدية'], ['ko', 'الكورية']];
      const ta = f.area({ rows: 8, placeholder: 'سطر لكل عبارة…\nمثال:\nصباح الخير\nكيف حالك؟\nشكراً جزيلاً', value: '' });
      const from = f.select({ options: [['auto', 'اكتشاف تلقائي']].concat(LANGS), value: 'auto' });
      const to = f.select({ options: LANGS, value: 'en' });
      const res = f.out({ filename: 'batch-translation.txt' });
      const status = f.el('div', { class: 'note' });
      const run = async () => {
        const lines = ta.value.split('\n').map((l) => l.trim()).filter(Boolean);
        if (!lines.length) { res.set('اكتب أسطراً أولاً.'); return; }
        if (lines.length > 60) { res.set('الحد 60 سطراً في المرة.'); return; }
        status.textContent = '⏳ جاري الترجمة… 0/' + lines.length;
        const outs = [];
        let done = 0;
        for (const ln of lines) {
          let tr = '⚠️ تعذّرت';
          try {
            const r = await fetch('/api/translate?s=' + from.value + '&t=' + to.value + '&q=' + encodeURIComponent(ln));
            const j = await r.json();
            if (j && j.ok) tr = j.text;
          } catch (e) { /* يبقى التعذّر */ }
          outs.push(ln + '\n   → ' + tr);
          done++;
          status.textContent = '⏳ جاري الترجمة… ' + done + '/' + lines.length;
        }
        status.textContent = '✅ تمت ترجمة ' + lines.length + ' سطراً.';
        res.set(outs.join('\n\n') + '\n\n— النسخة المرتّبة للنسخ —\n' + outs.map((o) => o.split('\n')[1].replace('   → ', '')).join('\n'));
      };
      root.append(
        f.grid(f.field('من', from), f.field('إلى', to)),
        f.field('الأسطر', ta),
        f.row(f.btn('📑 ابدأ الترجمة', run, 'primary'),
          f.btn('🗑️ امسح', () => { ta.value = ''; res.set(''); }, 'ghost')),
        status, res.el,
        f.note('كل سطر يُترجم منفصلاً ⇒ لا تختلط الأسطر. يحتاج اتصالاً بالإنترنت.'));
    }
  });

  /* ============ 4) النطق الصوتي ============ */
  t({
    id: 'speak-text', cat: 'translate', icon: '🔊', title: 'نطق النص بصوت المتصفح',
    desc: 'يقرأ أي نص عربي أو أجنبي بصوت واضح مع تحكم السرعة والنبرة واختيار الصوت',
    render: function (root) {
      const ta = f.area({ rows: 5, value: 'مرحباً بك في أدوات سريعة. كل الأدوات تعمل داخل متصفحك.', dir: 'auto' });
      const voiceSel = f.select({ options: [['', 'اختر صوتاً…']], value: '' });
      const rate = f.inp({ type: 'number', value: 1, min: 0.5, max: 2, step: 0.1 });
      const pitch = f.inp({ type: 'number', value: 1, min: 0, max: 2, step: 0.1 });
      const volume = f.inp({ type: 'number', value: 1, min: 0, max: 1, step: 0.1 });
      const status = f.el('div', { class: 'note' });
      let voices = [];
      const supported = !!window.speechSynthesis;
      const loadVoices = () => {
        if (!supported) return;
        voices = speechSynthesis.getVoices() || [];
        if (!voices.length) return;
        voiceSel.replaceChildren(...[['', 'تلقائي (حسب اللغة)']].concat(voices.map((v, i) => [String(i), v.name + ' — ' + v.lang])).map(([v, l]) => f.el('option', { value: v }, l)));
        status.textContent = 'الأصوات المتاحة على جهازك: ' + voices.length;
      };
      if (supported) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
      else status.textContent = '⚠️ متصفحك لا يدعم النطق الصوتي.';
      const speak = () => {
        if (!supported) { f.toast('المتصفح لا يدعم النطق', 'err'); return; }
        const txt = ta.value.trim();
        if (!txt) { f.toast('اكتب نصاً أولاً', 'err'); return; }
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(txt);
        if (voiceSel.value) u.voice = voices[Number(voiceSel.value)];
        u.rate = Number(rate.value) || 1;
        u.pitch = Number(pitch.value) || 1;
        u.volume = Number(volume.value) || 1;
        u.onstart = () => { status.textContent = '🔊 جاري النطق…'; };
        u.onend = () => { status.textContent = '✅ انتهى النطق'; };
        u.onerror = (e) => { status.textContent = '⚠️ تعذّر النطق: ' + (e.error || ''); };
        speechSynthesis.speak(u);
      };
      root.append(
        f.field('النص المراد نطقه', ta),
        f.grid(f.field('الصوت', voiceSel), f.field('السرعة', rate), f.field('النبرة', pitch), f.field('الصوت العالي', volume)),
        f.row(
          f.btn('🔊 انطق', speak, 'primary'),
          f.btn('⏸️ إيقاف مؤقت', () => { if (supported) speechSynthesis.pause(); }, ''),
          f.btn('▶️ استئناف', () => { if (supported) speechSynthesis.resume(); }, ''),
          f.btn('⏹️ إيقاف', () => { if (supported) { speechSynthesis.cancel(); status.textContent = 'أُوقف النطق'; } }, 'ghost')),
        status,
        f.note('يستخدم محرّك النطق المدمج في نظامك — متاح على أندرويد وويندوز وماك وآيفون بتفاوت في الأصوات.'));
    }
  });

  /* ============ 5) كشف لغة النص ============ */
  t({
    id: 'detect-language', cat: 'translate', icon: '🔎', title: 'كشف لغة النص',
    desc: 'يتعرّف على لغة النص محلياً بالحروف والكلمات الشائعة (بلا إنترنت)',
    render: function (root) {
      const ta = f.area({ rows: 6, value: 'السلام عليكم ورحمة الله وبركاته، كيف حالكم اليوم؟', dir: 'auto' });
      const res = f.out({ filename: 'language-detect.txt' });
      const SCRIPTS = [
        ['Arabic', 'العربية', /[\u0600-\u06FF]/g], ['Cyrillic', 'الروسية/السلاڤية', /[\u0400-\u04FF]/g],
        ['Greek', 'اليونانية', /[\u0370-\u03FF]/g], ['Hebrew', 'العبرية', /[\u0590-\u05FF]/g],
        ['Devanagari', 'الهندية/السنسكريتية', /[\u0900-\u097F]/g], ['Han', 'الصينية', /[\u4E00-\u9FFF]/g],
        ['Hiragana/Katakana', 'اليابانية', /[\u3040-\u30FF]/g], ['Hangul', 'الكورية', /[\uAC00-\uD7AF]/g],
        ['Thai', 'التايلاندية', /[\u0E00-\u0E7F]/g], ['Bengali', 'البنغالية', /[\u0980-\u09FF]/g],
        ['Ethiopic', 'الأمهرية', /[\u1200-\u137F]/g], ['Latin', 'لاتينية', /[a-zA-Z]/g]
      ];
      const WORDS = {
        en: ['the', 'and', 'you', 'are', 'is', 'this', 'that', 'with', 'have', 'not', 'for', 'from', 'was', 'they', 'what', 'hello', 'thank'],
        fr: ['le', 'la', 'les', 'des', 'est', 'vous', 'nous', 'pour', 'avec', 'pas', 'dans', 'une', 'que', 'bonjour', 'merci'],
        es: ['el', 'la', 'los', 'las', 'que', 'para', 'con', 'una', 'no', 'está', 'hola', 'gracias', 'por', 'como'],
        de: ['der', 'die', 'das', 'und', 'ist', 'nicht', 'mit', 'für', 'ein', 'eine', 'sie', 'wir', 'hallo', 'danke', 'ich'],
        it: ['il', 'la', 'che', 'per', 'con', 'non', 'una', 'sono', 'ciao', 'grazie', 'come', 'questo'],
        pt: ['o', 'a', 'que', 'para', 'com', 'não', 'uma', 'você', 'olá', 'obrigado', 'como', 'está'],
        nl: ['de', 'het', 'een', 'niet', 'met', 'voor', 'van', 'dat', 'hallo', 'dank', 'ik', 'hoe'],
        tr: ['bir', 've', 'için', 'ile', 'değil', 'bu', 'olarak', 'merhaba', 'teşekkür', 'nasıl'],
        id: ['yang', 'dan', 'untuk', 'dengan', 'tidak', 'ini', 'itu', 'apa', 'terima', 'kasih', 'selamat'],
        sw: ['na', 'ya', 'kwa', 'hii', 'wewe', 'asante', 'habari', 'kama', 'lakini']
      };
      const run = () => {
        const text = ta.value;
        if (!text.trim()) { res.set('أدخل نصاً لتحليله.'); return; }
        const letters = (text.match(/[a-zA-Z\u0600-\u06FF\u0400-\u04FF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/g) || []).length || 1;
        const scores = SCRIPTS.map(([id, name, re]) => ({ id, name, n: (text.match(re) || []).length })).filter((s) => s.n > 0).sort((a, b) => b.n - a.n);
        const lines = ['— تحليل الحروف —', ...scores.map((s) => '  ' + s.name.padEnd(22) + ' ' + s.n + ' حرف  (' + ((s.n / letters) * 100).toFixed(1) + '%)')];
        const top = scores[0];
        if (top && top.id === 'Latin') {
          const toks = text.toLowerCase().match(/[a-zà-ÿ]+/gi) || [];
          const rank = Object.entries(WORDS).map(([lang, list]) => {
            let hit = 0;
            toks.forEach((w) => { if (list.includes(w.toLowerCase())) hit++; });
            return { lang, hit, score: toks.length ? (hit / toks.length) * 100 : 0 };
          }).sort((a, b) => b.hit - a.hit);
          const NAMES = { en: 'الإنجليزية', fr: 'الفرنسية', es: 'الإسبانية', de: 'الألمانية', it: 'الإيطالية', pt: 'البرتغالية', nl: 'الهولندية', tr: 'التركية', id: 'الإندونيسية', sw: 'السواحيلية' };
          lines.push('', '— ترجيح اللغة اللاتينية (بكلمات شائعة) —');
          rank.slice(0, 4).forEach((r) => lines.push('  ' + (NAMES[r.lang] || r.lang).padEnd(14) + ' ' + r.hit + ' كلمة مطابقة  (' + f.num(r.score, 1) + '%)'));
          const best = rank[0];
          lines.unshift('🎯 اللغة المرجّحة: ' + (NAMES[best.lang] || best.lang) + (best.hit ? '  (ثقة ' + (best.score > 25 ? 'عالية' : best.score > 10 ? 'متوسطة' : 'منخفضة') + ')' : '  (ثقة منخفضة — نص قصير)'));
        } else if (top) {
          const extra = { Arabic: '🧭 قد تكون عربية فصحى أو لهجة محلية', Cyrillic: '🧭 روسية أو أوكرانية أو بلغارية', Han: '🧭 صينية (مبسّطة أو تقليدية)', };
          lines.unshift('🎯 اللغة المرجّحة: ' + top.name + '  (ثقة ' + (top.n / letters > 0.5 ? 'عالية' : 'متوسطة') + ')');
          if (extra[top.id]) lines.push('', extra[top.id]);
          if (top.id === 'Arabic') {
            const dialect = [['وش', 'خليجية/يمنية'], ['شنو', 'خليجية/عراقية'], ['إيه', 'مصرية'], ['شو', 'شامية'], ['كي', 'مغاربية'], ['دابا', 'مغربية'], ['برشا', 'تونسية'], ['يلا', 'عامية'], ['حالياً', 'فصحى']];
            const found = dialect.filter(([w]) => text.includes(w)).map(([w, d]) => w + ' ← ' + d);
            if (found.length) lines.push('', '— دلائل اللهجة —', ...found.map((f2) => '  ' + f2));
          }
        }
        lines.push('', '— أرقام ولغات أخرى —',
          '  أرقام عربية-هندية (٠١٢): ' + (/[\u0660-\u0669]/.test(text) ? 'موجودة' : 'لا'),
          '  أرقام لاتينية: ' + (/[0-9]/.test(text) ? 'موجودة' : 'لا'),
          '  رموز إيموجي: ' + ((text.match(/\p{Extended_Pictographic}/gu) || []).length),
          '  عدد الكلمات: ' + (text.trim().split(/\s+/).length),
          '  عدد الحروف: ' + letters);
        res.set(lines.join('\n'));
      };
      ta.addEventListener('input', f.debounce(run, 250));
      root.append(f.field('النص', ta), res.el, f.note('كشف تقريبي محلي بلا إنترنت — للنصوص القصيرة قد يكون غير دقيق.'));
      run();
    }
  });

  /* ============ 6) ترجمة عكسية (تأكيد) ============ */
  t({
    id: 'translate-roundtrip', cat: 'translate', icon: '♻️', title: 'ترجمة ذهاب وعودة (تحقق)',
    desc: 'يترجم النص ثم يعيده للغة الأصلية ليكشف أخطاء الترجمة والفرق في المعنى',
    render: function (root) {
      const LANGS = [['ar', 'العربية'], ['en', 'الإنجليزية'], ['fr', 'الفرنسية'], ['es', 'الإسبانية'], ['de', 'الألمانية'], ['tr', 'التركية'], ['ru', 'الروسية'], ['zh-CN', 'الصينية'], ['ja', 'اليابانية'], ['hi', 'الهندية'], ['ur', 'الأردية'], ['fa', 'الفارسية'], ['id', 'الإندونيسية'], ['it', 'الإيطالية'], ['pt', 'البرتغالية'], ['ko', 'الكورية']];
      const ta = f.area({ rows: 5, placeholder: 'اكتب النص الأصلي…', value: '' });
      const src = f.select({ options: LANGS, value: 'ar' });
      const mid = f.select({ options: LANGS, value: 'en' });
      const res = f.out({ filename: 'roundtrip.txt' });
      const go = async () => {
        const text = ta.value.trim();
        if (!text) { res.set('اكتب نصاً أولاً.'); return; }
        res.set('⏳ جاري الترجمة ذهاباً وعودة…');
        const tr = async (s, tt, q) => {
          const r = await fetch('/api/translate?s=' + s + '&t=' + tt + '&q=' + encodeURIComponent(q));
          const j = await r.json();
          if (!j || !j.ok) throw new Error((j && j.message) || 'فشل');
          return j.text;
        };
        try {
          const a = await tr(src.value, mid.value, text);
          const b = await tr(mid.value, src.value, a);
          const wordsA = text.trim().split(/\s+/), wordsB = b.trim().split(/\s+/);
          const setA = new Set(wordsA.map((w) => w.replace(/[^\p{L}\p{N}]/gu, '')));
          const setB = new Set(wordsB.map((w) => w.replace(/[^\p{L}\p{N}]/gu, '')));
          const inter = [...setA].filter((w) => w && setB.has(w)).length;
          const sim = Math.round((inter / Math.max(1, new Set([...setA, ...setB].filter(Boolean)).size)) * 100);
          res.set([
            '📄 الأصل (' + src.value + '):', '   ' + text, '',
            '➡️ بعد الترجمة (' + mid.value + '):', '   ' + a, '',
            '♻️ بعد العودة (' + src.value + '):', '   ' + b, '',
            '— تحليل —',
            'تشابه المفردات الأصل ↔ العودة: ' + sim + '%',
            sim > 70 ? '✅ الترجمة وفية للمعنى إلى حد كبير.' : sim > 40 ? '⚠️ اختلاف ملحوظ — راجع المصطلحات المهمة.' : '❌ اختلاف كبير — النص قد يكون اصطلاحياً أو الترجمة غير دقيقة.',
            '',
            'الفروق:',
            '  عدد كلمات الأصل: ' + wordsA.length + '  ·  بعد العودة: ' + wordsB.length
          ].join('\n'));
        } catch (e) {
          res.set('❌ تعذّرت الترجمة: ' + e.message + '\nتحتاج الأداة اتصالاً بالإنترنت.');
        }
      };
      root.append(
        f.grid(f.field('لغة النص', src), f.field('لغة وسيطة', mid)),
        f.field('النص', ta),
        f.row(f.btn('♻️ ترجم ذهاباً وعودة', go, 'primary')),
        res.el,
        f.note('مفيدة لتقييم جودة الترجمة وللأسماء والمصطلحات الحساسة (التواريخ، العقود، الأسماء الطبية).'));
    }
  });
})();
