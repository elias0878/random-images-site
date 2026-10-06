/* ============================================================
   tools/text.js — أدوات النصوص (26 أداة)
   ============================================================ */
(function () {
  'use strict';
  const t = f.tool;

  /* ---------- دوال مساعدة ---------- */

  const splitWords = (s) => (s.match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu) || []);
  const AR_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
  const cleanLines = (s) => s.split(/\r?\n/);

  const AR_ONES = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const AR_TENS = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const AR_HUND = ['', 'مئة', 'مئتان', 'ثلاثمئة', 'أربعمئة', 'خمسمئة', 'ستمئة', 'سبعمئة', 'ثمانمئة', 'تسعمئة'];

  function arUnder100(n) {
    if (n < 10) return AR_ONES[n];
    if (n === 10) return 'عشرة';
    if (n === 11) return 'أحد عشر';
    if (n === 12) return 'اثنا عشر';
    if (n < 20) return AR_ONES[n - 10] + ' عشر';
    const t10 = Math.floor(n / 10), o = n % 10;
    return o ? AR_ONES[o] + ' و' + AR_TENS[t10] : AR_TENS[t10];
  }
  function arUnder1000(n) {
    const h = Math.floor(n / 100), r = n % 100;
    const parts = [];
    if (h) parts.push(AR_HUND[h]);
    if (r) parts.push(arUnder100(r));
    return parts.join(' و');
  }
  function arGroup(n, one, two, many) {
    if (n === 1) return one;
    if (n === 2) return two;
    if (n >= 3 && n <= 10) return arUnder1000(n) + ' ' + many;
    return arUnder1000(n) + ' ' + one;
  }
  function arabicWords(n) {
    n = Math.floor(Math.abs(Number(n)));
    if (!isFinite(n)) return '—';
    if (n === 0) return 'صفر';
    const parts = [];
    const b = Math.floor(n / 1e9), m = Math.floor((n % 1e9) / 1e6), k = Math.floor((n % 1e6) / 1000), u = n % 1000;
    if (b) parts.push(arGroup(b, 'مليار', 'ملياران', 'مليارات'));
    if (m) parts.push(arGroup(m, 'مليون', 'مليونان', 'ملايين'));
    if (k) parts.push(arGroup(k, 'ألف', 'ألفان', 'آلاف'));
    if (u) parts.push(arUnder1000(u));
    return parts.join(' و');
  }

  const EN_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function enUnder1000(n) {
    const out = [];
    const h = Math.floor(n / 100), r = n % 100;
    if (h) out.push(EN_ONES[h] + ' hundred');
    if (r < 20 && r > 0) out.push(EN_ONES[r]);
    else if (r >= 20) out.push(EN_TENS[Math.floor(r / 10)] + (r % 10 ? '-' + EN_ONES[r % 10] : ''));
    return out.join(' and ');
  }
  function englishWords(n) {
    n = Math.floor(Math.abs(Number(n)));
    if (!isFinite(n)) return '—';
    if (n === 0) return 'zero';
    const units = [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand'], [1, '']];
    const parts = [];
    units.forEach(([val, name]) => {
      const q = Math.floor(n / val);
      if (q) {
        parts.push(enUnder1000(q) + (name ? ' ' + name : ''));
        n -= q * val;
      }
    });
    return parts.join(' ');
  }

  /* ---------- 1. عدّ الكلمات والأحرف ---------- */
  t({
    id: 'count-words', cat: 'text', icon: '🔢', title: 'عدّ الكلمات والأحرف',
    desc: 'عدد الكلمات والأحرف والمسافات لحظياً',
    render: function (root) {
      const ta = f.area({ rows: 8, placeholder: 'اكتب أو الصق النص…' });
      const box = f.el('div', { class: 'stats' });
      const update = () => {
        const s = ta.value;
        const words = splitWords(s);
        const chars = s.length;
        const charsNoSpace = s.replace(/\s/g, '').length;
        const lines = s ? cleanLines(s).length : 0;
        box.replaceChildren(
          stat('الكلمات', f.num(words.length, 0)),
          stat('الأحرف', f.num(chars, 0)),
          stat('أحرف بلا مسافات', f.num(charsNoSpace, 0)),
          stat('الأسطر', f.num(lines, 0)),
          stat('المسافات', f.num((s.match(/\s/g) || []).length, 0)),
          stat('أرقام', f.num((s.match(/[0-9\u0660-\u0669]/g) || []).length, 0))
        );
      };
      ta.addEventListener('input', f.debounce(update, 100));
      root.append(f.field('النص', ta), box);
      update();
    }
  });
  const stat = (label, value) => f.el('div', { class: 'stat' }, f.el('b', { text: value }), f.el('span', { text: label }));

  /* ---------- 2. الجمل والفقرات ---------- */
  t({
    id: 'count-sentences', cat: 'text', icon: '📄', title: 'عدّ الجمل والفقرات',
    desc: 'يعدّ الجمل والفقرات وأطول جملة',
    render: function (root) {
      const ta = f.area({ rows: 8, placeholder: 'الصق النص…' });
      const res = f.out({ filename: 'sentences.txt' });
      const run = () => {
        const s = ta.value.trim();
        if (!s) { res.set('لا يوجد نص.'); return; }
        const sentences = s.split(/[.!?؟\u06D4]+|\n{2,}/).map((x) => x.trim()).filter((x) => x.length > 1);
        const paragraphs = s.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
        let longest = '';
        sentences.forEach((x) => { if (splitWords(x).length > splitWords(longest).length) longest = x; });
        res.set([
          'عدد الجمل: ' + sentences.length,
          'عدد الفقرات: ' + paragraphs.length,
          'متوسط الكلمات في الجملة: ' + f.num(sentences.length ? splitWords(s).length / sentences.length : 0, 1),
          'متوسط الجمل في الفقرة: ' + f.num(paragraphs.length ? sentences.length / paragraphs.length : 0, 1),
          '',
          'أطول جملة (' + splitWords(longest).length + ' كلمة):',
          longest.slice(0, 400)
        ].join('\n'));
      };
      ta.addEventListener('input', f.debounce(run, 150));
      root.append(f.field('النص', ta), res.el);
      run();
    }
  });

  /* ---------- 3. وقت القراءة ---------- */
  t({
    id: 'reading-time', cat: 'text', icon: '⏱️', title: 'وقت القراءة والإلقاء',
    desc: 'يقدّر مدة القراءة الصامتة والقراءة بصوت مسموع',
    render: function (root) {
      const ta = f.area({ rows: 8, placeholder: 'الصق النص…' });
      const box = f.el('div', { class: 'stats' });
      const update = () => {
        const w = splitWords(ta.value).length;
        const mins = (rate) => {
          const m = Math.floor(w / rate);
          const s = Math.round(((w / rate) - m) * 60);
          return (m ? m + ' د ' : '') + s + ' ث';
        };
        box.replaceChildren(
          stat('الكلمات', f.num(w, 0)),
          stat('قراءة صامتة (200 ك/د)', mins(200)),
          stat('قراءة متأنية (130 ك/د)', mins(130)),
          stat('إلقاء (100 ك/د)', mins(100))
        );
      };
      ta.addEventListener('input', f.debounce(update, 100));
      root.append(f.field('النص', ta), box);
      update();
    }
  });

  /* ---------- 4. حالة الأحرف ---------- */
  t({
    id: 'text-case', cat: 'text', icon: '🔠', title: 'تحويل حالة الأحرف',
    desc: 'كبير، صغير، أول كل كلمة، جملة، تبديل',
    render: function (root) {
      const ta = f.area({ rows: 8, placeholder: 'النص…' });
      const res = f.out({ filename: 'case.txt' });
      const modes = {
        'كبير (UPPER)': (s) => s.toUpperCase(),
        'صغير (lower)': (s) => s.toLowerCase(),
        'أول كل كلمة (Title)': (s) => s.replace(/\p{L}+/gu, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()),
        'أول الجملة (Sentence)': (s) => s.toLowerCase().replace(/(^\s*\p{L}|[.!?؟]\s*\p{L})/gu, (m) => m.toUpperCase()),
        'تبديل الأحرف (tOGGLE)': (s) => s.replace(/\p{L}/gu, (c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())),
        'حروف كبيرة متبادلة (aLtErNaTiNg)': (s) => { let i = 0; return s.replace(/\p{L}/gu, (c) => (i++ % 2 ? c.toUpperCase() : c.toLowerCase())); }
      };
      const bar = f.row(...Object.entries(modes).map(([label, fn]) => f.btn(label, () => res.set(fn(ta.value)), 'ghost')));
      root.append(f.field('النص', ta), bar, res.el);
    }
  });

  /* ---------- 5. عكس النص ---------- */
  t({
    id: 'reverse-text', cat: 'text', icon: '🔁', title: 'عكس النص',
    desc: 'يعكس ترتيب الأحرف أو الكلمات أو الأسطر',
    render: f.textTool({
      filename: 'reversed.txt',
      buttons: [
        { label: 'عكس الأحرف', run: (s) => [...s].reverse().join(''), primary: true },
        { label: 'عكس الكلمات', run: (s) => s.split(/\s+/).reverse().join(' ') },
        { label: 'عكس الأسطر', run: (s) => cleanLines(s).reverse().join('\n') },
        { label: 'عكس كل سطر', run: (s) => cleanLines(s).map((l) => [...l].reverse().join('')).join('\n') }
      ]
    })
  });

  /* ---------- 6. إزالة المسافات الزائدة ---------- */
  t({
    id: 'clean-spaces', cat: 'text', icon: '🧹', title: 'تنظيف المسافات',
    desc: 'يزيل المسافات والأسطر الفارغة الزائدة',
    render: f.textTool({
      auto: true,
      filename: 'clean.txt',
      buttons: [{
        label: 'تنظيف', primary: true, run: (s) => s
          .replace(/[ \t]+/g, ' ')
          .replace(/ *\n */g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim()
      }]
    })
  });

  /* ---------- 7. الأسطر المكررة ---------- */
  t({
    id: 'remove-duplicate-lines', cat: 'text', icon: '🧾', title: 'حذف الأسطر المكررة',
    desc: 'يحذف الأسطر المتكررة مع خيار تجاهل حالة الأحرف',
    render: f.textTool({
      fields: [{ id: 'ci', label: '؟ تجاهل حالة الأحرف', type: 'select', options: [['1', 'نعم'], ['0', 'لا']], value: '1' }],
      buttons: [{
        label: 'احذف المكرر', primary: true,
        run: (s, v) => {
          const seen = new Set();
          const out = [];
          cleanLines(s).forEach((l) => {
            const key = v.ci === '1' ? l.trim().toLowerCase() : l.trim();
            if (key === '') { out.push(l); return; }
            if (!seen.has(key)) { seen.add(key); out.push(l); }
          });
          return out.join('\n');
        }
      }]
    })
  });

  /* ---------- 8. ترتيب الأسطر ---------- */
  t({
    id: 'sort-lines', cat: 'text', icon: '🔤', title: 'ترتيب الأسطر',
    desc: 'أبجدي، عكسي، حسب الطول، أو حسب الرقم',
    render: f.textTool({
      buttons: [
        { label: 'أبجدي (أ→ي)', run: (s) => cleanLines(s).sort((a, b) => a.localeCompare(b, 'ar')).join('\n'), primary: true },
        { label: 'أبجدي عكسي', run: (s) => cleanLines(s).sort((a, b) => b.localeCompare(a, 'ar')).join('\n') },
        { label: 'حسب الطول', run: (s) => cleanLines(s).sort((a, b) => a.length - b.length).join('\n') },
        { label: 'حسب القيمة الرقمية', run: (s) => cleanLines(s).sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0)).join('\n') },
        { label: 'عكس الترتيب', run: (s) => cleanLines(s).reverse().join('\n') },
        { label: 'إزالة الفراغات', run: (s) => cleanLines(s).map((l) => l.trim()).filter(Boolean).join('\n') }
      ]
    })
  });

  /* ---------- 9. خلط الأسطر ---------- */
  t({
    id: 'shuffle-lines', cat: 'text', icon: '🎲', title: 'خلط الأسطر عشوائياً',
    desc: 'يخلط ترتيب الأسطر أو الكلمات',
    render: f.textTool({
      buttons: [
        {
          label: '🎲 اخلط الأسطر', primary: true, run: (s) => {
            const a = cleanLines(s);
            for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
            return a.join('\n');
          }
        },
        {
          label: '🎲 اخلط الكلمات', run: (s) => {
            const a = s.split(/(\s+)/);
            for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
            return a.join('');
          }
        }
      ]
    })
  });

  /* ---------- 10. ترقيم الأسطر ---------- */
  t({
    id: 'number-lines', cat: 'text', icon: '1️⃣', title: 'ترقيم الأسطر',
    desc: 'يضيف أرقاماً أو نقاطاً أو علامات في بداية كل سطر',
    render: f.textTool({
      fields: [
        { id: 'style', label: 'الشكل', type: 'select', options: [['1.', '1. 2. 3.'], ['1)', '1) 2) 3)'], ['-', '- - -'], ['•', '• • •'], ['(1)', '(1) (2) (3)'], ['arabic', 'عربي: أولاً، ثانياً']], value: '1.' },
        { id: 'start', label: 'ابدأ من', type: 'number', value: 1 },
        { id: 'skip', label: '؟ تجاهل الأسطر الفارغة', type: 'select', options: [['1', 'نعم'], ['0', 'لا']], value: '1' }
      ],
      buttons: [{
        label: 'رقّم', primary: true,
        run: (s, v) => {
          let n = Number(v.start) || 1;
          const ord = ['أولاً', 'ثانياً', 'ثالثاً', 'رابعاً', 'خامساً', 'سادساً', 'سابعاً', 'ثامناً', 'تاسعاً', 'عاشراً'];
          return cleanLines(s).map((l) => {
            if (v.skip === '1' && !l.trim()) return l;
            let mark;
            if (v.style === 'arabic') mark = ord[n - 1] || ('(' + n + ')');
            else if (v.style === '(1)') mark = '(' + n + ')';
            else if (v.style === '1)') mark = n + ')';
            else if (v.style === '-') mark = '-';
            else if (v.style === '•') mark = '•';
            else mark = n + '.';
            n++;
            return mark + ' ' + l;
          }).join('\n');
        }
      }]
    })
  });

  /* ---------- 11. إزالة علامات الترقيم ---------- */
  t({
    id: 'remove-punctuation', cat: 'text', icon: '✂️', title: 'إزالة علامات الترقيم',
    desc: 'يحذف الرموز ويُبقي الحروف والأرقام',
    render: f.textTool({
      auto: true,
      buttons: [{ label: 'إزالة', primary: true, run: (s) => s.replace(/[^\p{L}\p{N}\s]/gu, '').replace(/[ \t]{2,}/g, ' ') }]
    })
  });

  /* ---------- 12. إزالة التشكيل العربي ---------- */
  t({
    id: 'remove-tashkeel', cat: 'text', icon: '🅰️', title: 'إزالة التشكيل العربي',
    desc: 'يحذف الحركات والتطويل من النص العربي',
    render: f.textTool({
      auto: true,
      buttons: [{ label: 'أزل التشكيل', primary: true, run: (s) => s.replace(AR_DIACRITICS, '') }]
    })
  });

  /* ---------- 13. إزالة وسوم HTML ---------- */
  t({
    id: 'strip-html', cat: 'text', icon: '🏷️', title: 'تحويل HTML إلى نص',
    desc: 'يحذف الوسوم ويحوّل الكيانات إلى نص مقروء',
    render: f.textTool({
      fields: [{ id: 'keepNl', label: '؟ حوّل الوسوم الفاصلة إلى أسطر', type: 'select', options: [['1', 'نعم'], ['0', 'لا']], value: '1' }],
      buttons: [{
        label: 'تحويل', primary: true,
        run: (s, v) => {
          let x = s.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
          if (v.keepNl === '1') x = x.replace(/<\/(p|div|h[1-6]|li|tr|br)>/gi, '\n').replace(/<br\s*\/?>/gi, '\n');
          x = x.replace(/<[^>]+>/g, '');
          const d = document.createElement('textarea');
          d.innerHTML = x;
          return d.value.replace(/\n{3,}/g, '\n\n').trim();
        }
      }]
    })
  });

  /* ---------- 14. استخراج البريد الإلكتروني ---------- */
  t({
    id: 'extract-emails', cat: 'text', icon: '📧', title: 'استخراج الإيميلات',
    desc: 'يسحب كل عناوين البريد الإلكتروني من نص كبير',
    render: f.textTool({
      buttons: [{
        label: 'استخرج', primary: true,
        run: (s) => {
          const m = s.match(/[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/gu) || [];
          const uniq = [...new Set(m.map((x) => x.toLowerCase()))];
          return uniq.length ? uniq.join('\n') + '\n\n(' + uniq.length + ' عنوان)' : 'لم يُعثر على عناوين بريد.';
        }
      }]
    })
  });

  /* ---------- 15. استخراج الروابط ---------- */
  t({
    id: 'extract-links', cat: 'text', icon: '🔗', title: 'استخراج الروابط',
    desc: 'يسحب كل الروابط من النص أو الكود',
    render: f.textTool({
      buttons: [{
        label: 'استخرج', primary: true,
        run: (s) => {
          const m = s.match(/https?:\/\/[^\s"'<>\\)\]]+/gi) || [];
          const uniq = [...new Set(m)];
          return uniq.length ? uniq.join('\n') + '\n\n(' + uniq.length + ' رابط)' : 'لم يُعثر على روابط.';
        }
      }, {
        label: 'استخرج الدومينات فقط', run: (s) => {
          const m = s.match(/https?:\/\/([^\s"'<>\\)\]]+)/gi) || [];
          const d = [...new Set(m.map((u) => { try { return new URL(u).hostname; } catch { return ''; } }).filter(Boolean))];
          return d.join('\n') || 'لا شيء';
        }
      }]
    })
  });

  /* ---------- 16. إزالة الرموز التعبيرية ---------- */
  t({
    id: 'remove-emoji', cat: 'text', icon: '🙂', title: 'إزالة الرموز التعبيرية',
    desc: 'يحذف الإيموجي من النص',
    render: f.textTool({
      auto: true,
      buttons: [{
        label: 'أزل الإيموجي', primary: true,
        run: (s) => s.replace(/[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{200D}]/gu, '').replace(/[ \t]{2,}/g, ' ')
      }]
    })
  });

  /* ---------- 17. رابط لطيف (Slug) ---------- */
  t({
    id: 'slugify', cat: 'text', icon: '🔤', title: 'تحويل نص إلى رابط (Slug)',
    desc: 'ينشئ رابطاً لطيفاً من العنوان العربي أو الإنجليزي',
    render: f.textTool({
      fields: [{ id: 'sep', label: 'الفاصل', type: 'select', options: [['-', 'شرطة -'], ['_', 'شرطة سفلية _'], ['', 'بلا فاصل']], value: '-' }],
      buttons: [{
        label: 'أنشئ الرابط', primary: true,
        run: (s, v) => s.trim().toLowerCase()
          .replace(/[\u064B-\u065F\u0670]/g, '')
          .replace(/[^\p{L}\p{N}]+/gu, v.sep)
          .replace(new RegExp('\\' + (v.sep || '') + '{2,}', 'g'), v.sep)
          .replace(new RegExp('^\\' + (v.sep || '') + '|\\' + (v.sep || '') + '$', 'g'), '')
      }]
    })
  });

  /* ---------- 18. تكرار الكلمات ---------- */
  t({
    id: 'word-frequency', cat: 'text', icon: '📊', title: 'تكرار الكلمات',
    desc: 'يحصي أكثر الكلمات تكراراً في النص',
    render: f.textTool({
      fields: [{ id: 'top', label: 'أعلى عدد', type: 'number', value: 25, min: 1, max: 200 }],
      buttons: [
        {
          label: 'احسب', primary: true,
          run: (s, v) => {
            const words = splitWords(s.toLowerCase());
            const map = new Map();
            words.forEach((w) => map.set(w, (map.get(w) || 0) + 1));
            const arr = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, v.top || 25);
            const max = arr.length ? arr[0][1] : 1;
            return arr.map(([w, c]) => `${String(c).padStart(5)} │ ${w}` + '  ' + '█'.repeat(Math.round((c / max) * 20))).join('\n')
              + `\n\nإجمالي الكلمات: ${words.length} · كلمات فريدة: ${map.size}`;
          }
        },
        { label: 'بلا كلمات شائعة', run: (s) => {
            const stop = new Set(['في', 'من', 'على', 'إلى', 'عن', 'أن', 'إن', 'هذا', 'هذه', 'التي', 'الذي', 'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'is', 'it', 'that', 'for', 'on', 'with']);
            const words = splitWords(s.toLowerCase()).filter((w) => !stop.has(w) && w.length > 2);
            const map = new Map();
            words.forEach((w) => map.set(w, (map.get(w) || 0) + 1));
            return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([w, c]) => `${String(c).padStart(5)} │ ${w}`).join('\n');
          }
        }
      ]
    })
  });

  /* ---------- 19. مقارنة نصين ---------- */
  t({
    id: 'text-diff', cat: 'text', icon: '⚖️', title: 'مقارنة نصين',
    desc: 'يظهر الفرق بين نصين سطراً بسطر مع الإحصائيات',
    render: f.dualTextTool({
      aLabel: 'النص الأصلي', bLabel: 'النص الجديد',
      run: (a, b) => {
        const A = cleanLines(a), B = cleanLines(b);
        if (A.length > 800 || B.length > 800) return 'الحد الأقصى 800 سطر لكل نص.';
        const n = A.length, m = B.length;
        const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
        for (let i = n - 1; i >= 0; i--)
          for (let j = m - 1; j >= 0; j--)
            dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
        let i = 0, j = 0;
        const lines = [];
        let add = 0, del = 0, same = 0;
        while (i < n && j < m) {
          if (A[i] === B[j]) { lines.push('   ' + A[i]); same++; i++; j++; }
          else if (dp[i + 1][j] >= dp[i][j + 1]) { lines.push('−  ' + A[i]); del++; i++; }
          else { lines.push('+  ' + B[j]); add++; j++; }
        }
        while (i < n) { lines.push('−  ' + A[i++]); del++; }
        while (j < m) { lines.push('+  ' + B[j++]); add++; }
        return `مضاف: ${add} · محذوف: ${del} · متطابق: ${same}\n\n${lines.join('\n')}`;
      }
    })
  });

  /* ---------- 20. تقسيم النص ---------- */
  t({
    id: 'split-text', cat: 'text', icon: '🧩', title: 'تقسيم النص',
    desc: 'يقسّم النص بفاصل أو إلى أجزاء متساوية أو بقياس محدد',
    render: f.textTool({
      fields: [
        { id: 'mode', label: 'الطريقة', type: 'select', options: [['sep', 'بفاصل'], ['chunks', 'إلى أجزاء متساوية'], ['size', 'بعدد أحرف محدد']], value: 'sep' },
        { id: 'val', label: 'الفاصل / العدد', type: 'text', placeholder: 'مثال: , أو 3 أو 500', value: ',' }
      ],
      buttons: [{
        label: 'قسّم', primary: true,
        run: (s, v) => {
          if (v.mode === 'sep') {
            const sep = String(v.val || ',').replace(/\\n/g, '\n');
            return s.split(sep).map((x, i) => `[${i + 1}] ${x.trim()}`).join('\n');
          }
          const k = Math.max(1, parseInt(v.val, 10) || 3);
          if (v.mode === 'chunks') {
            const size = Math.ceil(s.length / k);
            const out = [];
            for (let i = 0; i < s.length; i += size) out.push(`--- الجزء ${out.length + 1} ---\n${s.slice(i, i + size)}`);
            return out.join('\n\n');
          }
          const out = [];
          for (let i = 0; i < s.length; i += k) out.push(`--- ${i / k + 1} ---\n${s.slice(i, i + k)}`);
          return out.join('\n\n');
        }
      }]
    })
  });

  /* ---------- 21. دمج الأسطر ---------- */
  t({
    id: 'join-lines', cat: 'text', icon: '🧷', title: 'دمج الأسطر في فقرة',
    desc: 'يحوّل الأسطر المتعددة إلى فقرة واحدة بالفاصل الذي تختاره',
    render: f.textTool({
      fields: [{ id: 'sep', label: 'الفاصل بين الأسطر', type: 'text', value: ' ' }],
      buttons: [{
        label: 'ادمج', primary: true,
        run: (s, v) => cleanLines(s).map((l) => l.trim()).filter(Boolean).join(v.sep === '\\n' ? '\n' : String(v.sep))
      }, {
        label: 'ادمج كل 3 أسطر', run: (s) => {
          const ls = cleanLines(s).map((l) => l.trim()).filter(Boolean);
          const out = [];
          for (let i = 0; i < ls.length; i += 3) out.push(ls.slice(i, i + 3).join(' '));
          return out.join('\n\n');
        }
      }]
    })
  });

  /* ---------- 22. أرقام إلى كلمات (عربي) ---------- */
  t({
    id: 'numbers-to-arabic-words', cat: 'text', icon: '🔤', title: 'أرقام → كلمات عربية',
    desc: 'يحوّل الأرقام إلى نص مكتوب بالعربية',
    render: f.textTool({
      buttons: [{
        label: 'حوّل كل الأرقام', primary: true,
        run: (s) => s.replace(/[0-9\u0660-\u0669]+/g, (m) => arabicWords(m.replace(/[\u0660-\u0669]/g, (d) => d.charCodeAt(0) - 0x0660)))
      }]
    })
  });

  /* ---------- 23. أرقام إلى كلمات (إنجليزي) ---------- */
  t({
    id: 'numbers-to-english-words', cat: 'text', icon: '🔡', title: 'أرقام → كلمات إنجليزية',
    desc: 'يحوّل الأرقام إلى نص مكتوب بالإنجليزية',
    render: f.textTool({
      buttons: [{ label: 'حوّل كل الأرقام', primary: true, run: (s) => s.replace(/\d+/g, (m) => englishWords(m)) }]
    })
  });

  /* ---------- 24. نص تجريبي ---------- */
  t({
    id: 'lorem-ipsum', cat: 'text', icon: '📝', title: 'نص تجريبي (Lorem عربي/إنجليزي)',
    desc: 'يولّد فقرات نصية للتصميم والتجربة',
    render: f.calcTool({
      fields: [
        { id: 'lang', label: 'اللغة', type: 'select', options: [['ar', 'عربي'], ['en', 'إنجليزي']], value: 'ar' },
        { id: 'type', label: 'النوع', type: 'select', options: [['p', 'فقرات'], ['s', 'جمل'], ['w', 'كلمات']], value: 'p' },
        { id: 'count', label: 'العدد', type: 'number', value: 3, min: 1, max: 50 }
      ],
      live: true,
      filename: 'lorem.txt',
      run: (v) => {
        const AR = 'في عالم اليوم المتغيّر بسرعة أصبحت المعرفة رقماً يُقاس به التقدّم والابتكار ولذلك فإن بناء أدوات بسيطة وسريعة يمنح الإنسان قدرة أكبر على الإنجاز مع الحفاظ على الوقت والجهد وكل خطوة صغيرة نحو التنظيم تفتح أبواباً كثيرة أمام الإبداع'.split(' ');
        const EN = 'the quick brown fox jumps over a lazy dog while modern tools help people work faster and smarter every single day with simple ideas and clear steps'.split(' ');
        const src = v.lang === 'ar' ? AR : EN;
        const n = Math.max(1, Math.min(50, Number(v.count) || 3));
        const capSent = (s) => (v.lang === 'en' ? s[0].toUpperCase() + s.slice(1) : s);
        const sentence = () => {
          const len = 8 + Math.floor(Math.random() * 10);
          const w = [];
          for (let i = 0; i < len; i++) w.push(src[Math.floor(Math.random() * src.length)]);
          return capSent(w.join(' ')) + (v.lang === 'ar' ? '.' : '.');
        };
        if (v.type === 'w') {
          const w = [];
          for (let i = 0; i < n; i++) w.push(src[Math.floor(Math.random() * src.length)]);
          return w.join(' ');
        }
        if (v.type === 's') return Array.from({ length: n }, sentence).join(' ');
        const paras = [];
        for (let i = 0; i < n; i++) {
          const sents = 3 + Math.floor(Math.random() * 3);
          paras.push(Array.from({ length: sents }, sentence).join(' '));
        }
        return paras.join('\n\n');
      }
    })
  });

  /* ---------- 25. فحص التناظر ---------- */
  t({
    id: 'palindrome', cat: 'text', icon: '🪞', title: 'فحص النص المتناظر',
    desc: 'يتحقق إن كان النص يُقرأ من الجهتين بنفس الشكل',
    render: f.textTool({
      auto: true,
      buttons: [{
        label: 'افحص', primary: true,
        run: (s) => {
          const clean = s.toLowerCase().replace(/[\s\u064B-\u065F\p{P}\p{S}]/gu, '');
          const rev = [...clean].reverse().join('');
          return clean
            ? (clean === rev ? '✅ نعم، النص متناظر (' + clean.length + ' حرفاً)' : '❌ لا، ليس متناظراً.\nالمقلوب: ' + rev.slice(0, 200))
            : 'اكتب نصاً للفحص.';
        }
      }]
    })
  });

  /* ---------- 26. نص إلى قائمة ---------- */
  t({
    id: 'text-to-list', cat: 'text', icon: '📋', title: 'تحويل النص إلى قائمة',
    desc: 'يحوّل الفقرات أو الفواصل إلى قائمة جاهزة (Markdown/HTML/JSON)',
    render: f.textTool({
      fields: [{ id: 'sep', label: 'الفصل بواسطة', type: 'select', options: [['nl', 'سطر جديد'], [',', 'فاصلة'], [';', 'فاصلة منقوطة'], ['|', 'شرطة عمودية']], value: 'nl' }],
      buttons: [
        { label: 'Markdown (- )', run: (s, v) => itemsOf(s, v.sep).map((x) => '- ' + x).join('\n'), primary: true },
        { label: 'مرقّمة (1.)', run: (s, v) => itemsOf(s, v.sep).map((x, i) => `${i + 1}. ${x}`).join('\n') },
        { label: 'HTML <ul>', run: (s, v) => '<ul>\n' + itemsOf(s, v.sep).map((x) => '  <li>' + esc(x) + '</li>').join('\n') + '\n</ul>' },
        { label: 'JSON', run: (s, v) => JSON.stringify(itemsOf(s, v.sep), null, 2) },
        { label: 'CSV', run: (s, v) => itemsOf(s, v.sep).map((x) => '"' + String(x).replace(/"/g, '""') + '"').join('\n') }
      ]
    })
  });

  const itemsOf = (s, sep) => {
    const parts = sep === 'nl' ? cleanLines(s) : s.split(sep);
    return parts.map((x) => x.trim()).filter(Boolean);
  };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
})();
