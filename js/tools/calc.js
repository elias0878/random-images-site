/* ============================================================
   tools/calc.js — الحاسبات (30 أداة)
   ============================================================ */
(function () {
  'use strict';
  const t = f.tool;
  const N = (v, d) => f.num(v, d === undefined ? 2 : d);
  const money = (v) => f.num(v, 2) + ' ريال';

  /* ---------- 1. نسبة من مبلغ ---------- */
  t({ id: 'percent-of', cat: 'calc', icon: '％', title: 'حساب نسبة من مبلغ', desc: 'كم يساوي 15% من 2500؟',
    render: f.calcTool({
      live: true, filename: 'percent.txt',
      fields: [{ id: 'p', label: 'النسبة %', type: 'number', value: 15 }, { id: 'n', label: 'المبلغ', type: 'number', value: 2500 }],
      run: (v) => {
        const r = (Number(v.n) * Number(v.p)) / 100;
        return [N(v.p, 4) + '% من ' + N(v.n, 2) + ' = ' + N(r, 2),
          '', 'المبلغ بعد الإضافة: ' + N(Number(v.n) + r, 2), 'المبلغ بعد الخصم : ' + N(Number(v.n) - r, 2)].join('\n');
      }
    }) });

  /* ---------- 2. نسبة رقمين ---------- */
  t({ id: 'percent-ratio', cat: 'calc', icon: '➗', title: 'نسبة رقم من رقم', desc: '10 من 250 = 4%',
    render: f.calcTool({
      live: true, filename: 'percent-ratio.txt',
      fields: [{ id: 'a', label: 'الجزء', type: 'number', value: 10 }, { id: 'b', label: 'الكل', type: 'number', value: 250 }],
      run: (v) => {
        const a = Number(v.a), b = Number(v.b);
        if (!b) return 'لا يمكن القسمة على صفر.';
        return [N(a, 4) + ' من ' + N(b, 4) + ' = ' + N((a / b) * 100, 3) + '%',
          '', 'الباقي: ' + N(b - a, 2) + ' (' + N(((b - a) / b) * 100, 2) + '%)'].join('\n');
      }
    }) });

  /* ---------- 3. الزيادة والنقصان ---------- */
  t({ id: 'percent-change', cat: 'calc', icon: '📈', title: 'نسبة التغيّر بين رقمين', desc: 'من 200 إلى 260 = زيادة 30%',
    render: f.calcTool({
      live: true, filename: 'change.txt',
      fields: [{ id: 'a', label: 'القيمة القديمة', type: 'number', value: 200 }, { id: 'b', label: 'القيمة الجديدة', type: 'number', value: 260 }],
      run: (v) => {
        const a = Number(v.a), b = Number(v.b);
        if (!a) return 'القيمة القديمة يجب ألا تكون صفراً.';
        const diff = b - a, pct = (diff / Math.abs(a)) * 100;
        return [
          'التغيّر: ' + N(diff, 2) + (diff >= 0 ? ' (زيادة)' : ' (نقصان)'),
          'النسبة: ' + (pct >= 0 ? '+' : '') + N(pct, 2) + '%',
          '', 'النسبة ككسر: ' + N(b / a, 4) + 'x',
          diff >= 0 ? '📈 ارتفعت القيمة بـ ' + N(pct, 2) + '%' : '📉 انخفضت القيمة بـ ' + N(Math.abs(pct), 2) + '%'
        ].join('\n');
      }
    }) });

  /* ---------- 4. زيادة/خصم نسبة على مبلغ ---------- */
  t({ id: 'add-percent', cat: 'calc', icon: '➕', title: 'إضافة أو خصم نسبة', desc: 'يضيف أو يخصم نسبة من مبلغ مراراً',
    render: f.calcTool({
      live: true, filename: 'add-percent.txt',
      fields: [
        { id: 'n', label: 'المبلغ', type: 'number', value: 1000 },
        { id: 'p', label: 'النسبة %', type: 'number', value: 10 },
        { id: 'mode', label: 'العملية', type: 'select', options: [['add', 'إضافة (+)'], ['sub', 'خصم (−)']], value: 'sub' }
      ],
      run: (v) => {
        const n = Number(v.n), p = Number(v.p), add = v.mode === 'add';
        const one = add ? n * (1 + p / 100) : n * (1 - p / 100);
        const rows = [1, 2, 3, 5, 10].map((k) => '  ' + k + ' مرة' + (k > 1 ? 'ات' : '') + ': ' + N(add ? n * Math.pow(1 + p / 100, k) : n * Math.pow(1 - p / 100, k), 2));
        return [
          'المبلغ الأصلي: ' + N(n, 2),
          (add ? 'بعد إضافة ' : 'بعد خصم ') + N(p, 3) + '%: ' + N(one, 2),
          'الفرق: ' + N(Math.abs(one - n), 2),
          '', '— التكرار —', ...rows,
          '', 'للعودة للأصل: ' + (add ? 'اقسم على ' : 'اقسم على ') + N(add ? 1 + p / 100 : 1 - p / 100, 6)
        ].join('\n');
      }
    }) });

  /* ---------- 5. الخصم ---------- */
  t({ id: 'discount', cat: 'calc', icon: '🏷️', title: 'حاسبة الخصم', desc: 'السعر بعد الخصم ومقدار التوفير',
    render: f.calcTool({
      live: true, filename: 'discount.txt',
      fields: [{ id: 'price', label: 'السعر', type: 'number', value: 450 }, { id: 'disc', label: 'الخصم %', type: 'number', value: 25 }],
      run: (v) => {
        const p = Number(v.price), d = Number(v.disc);
        const save = p * d / 100;
        return [
          'السعر الأصلي : ' + N(p, 2),
          'الخصم        : ' + N(d, 2) + '% (' + N(save, 2) + ')',
          'السعر النهائي: ' + N(p - save, 2),
          '', 'أمثلة سريعة على نفس السعر:',
          ...[5, 10, 15, 20, 30, 50, 70].map((x) => '  خصم ' + x + '% → ' + N(p * (1 - x / 100), 2))
        ].join('\n');
      }
    }) });

  /* ---------- 6. الضريبة ---------- */
  t({ id: 'tax-calc', cat: 'calc', icon: '🧾', title: 'حساب الضريبة', desc: 'إضافة الضريبة أو استخراجها من مبلغ شامل',
    render: f.calcTool({
      live: true, filename: 'tax.txt',
      fields: [
        { id: 'n', label: 'المبلغ', type: 'number', value: 1000 },
        { id: 'r', label: 'نسبة الضريبة %', type: 'number', value: 15 },
        { id: 'mode', label: 'المبلغ', type: 'select', options: [['ex', 'بدون ضريبة (أضفها)'], ['inc', 'شامل الضريبة (استخرجها)']], value: 'ex' }
      ],
      run: (v) => {
        const n = Number(v.n), r = Number(v.r) / 100;
        if (v.mode === 'ex') {
          const tax = n * r;
          return ['المبلغ قبل الضريبة: ' + N(n, 2), 'قيمة الضريبة (' + N(v.r, 2) + '%): ' + N(tax, 2), 'الإجمالي: ' + N(n + tax, 2)].join('\n');
        }
        const base = n / (1 + r);
        return ['الإجمالي (شامل): ' + N(n, 2), 'المبلغ قبل الضريبة: ' + N(base, 2), 'قيمة الضريبة: ' + N(n - base, 2), '', 'نسبة الضريبة من الإجمالي: ' + N(v.r, 2) + '%'].join('\n');
      }
    }) });

  /* ---------- 7. تقسيم الفاتورة ---------- */
  t({ id: 'bill-split', cat: 'calc', icon: '🍽️', title: 'تقسيم الفاتورة', desc: 'نصيب كل شخص مع البخشيش',
    render: f.calcTool({
      live: true, filename: 'bill.txt',
      fields: [
        { id: 'total', label: 'إجمالي الفاتورة', type: 'number', value: 350 },
        { id: 'people', label: 'عدد الأشخاص', type: 'number', value: 5, min: 1 },
        { id: 'tip', label: 'البخشيش %', type: 'number', value: 10 },
        { id: 'tax', label: 'ضريبة %', type: 'number', value: 15 }
      ],
      run: (v) => {
        const total = Number(v.total), p = Math.max(1, Number(v.people) || 1);
        const tax = total * (Number(v.tax) / 100);
        const sub = total + tax;
        const tip = sub * (Number(v.tip) / 100);
        const grand = sub + tip;
        return [
          'الفاتورة        : ' + N(total, 2),
          'الضريبة (' + N(v.tax, 1) + '%) : ' + N(tax, 2),
          'المجموع        : ' + N(sub, 2),
          'البخشيش (' + N(v.tip, 1) + '%): ' + N(tip, 2),
          'الإجمالي النهائي: ' + N(grand, 2),
          '',
          '👥 نصيب كل شخص من ' + p + ': ' + N(grand / p, 2),
          '   (الفردي بلا بخشيش: ' + N(sub / p, 2) + ')'
        ].join('\n');
      }
    }) });

  /* ---------- 8. القرض والأقساط ---------- */
  t({ id: 'loan-calc', cat: 'calc', icon: '🏦', title: 'حاسبة القرض والأقساط', desc: 'القسط الشهري وإجمالي الفوائد',
    render: f.calcTool({
      live: true, filename: 'loan.txt',
      fields: [
        { id: 'amount', label: 'مبلغ القرض', type: 'number', value: 100000 },
        { id: 'rate', label: 'نسبة الفائدة السنوية %', type: 'number', value: 6, step: 'any' },
        { id: 'years', label: 'المدة (سنوات)', type: 'number', value: 5 }
      ],
      run: (v) => {
        const P = Number(v.amount), r = Number(v.rate) / 100 / 12, n = Number(v.years) * 12;
        if (!P || !n) return 'أدخل المبلغ والمدة.';
        const emi = r ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
        const total = emi * n;
        const rows = [];
        let bal = P;
        for (let i = 1; i <= Math.min(n, 60); i++) {
          const int = bal * r;
          const prin = emi - int;
          bal -= prin;
          if (i <= 6 || i % 12 === 0 || i === n) rows.push(`  ${String(i).padStart(3)} │ ${N(emi, 2).padStart(12)} │ ${N(int, 2).padStart(11)} │ ${N(prin, 2).padStart(11)} │ ${N(Math.max(0, bal), 2).padStart(13)}`);
        }
        return [
          'القسط الشهري   : ' + N(emi, 2),
          'عدد الأقساط    : ' + n,
          'الإجمالي المدفوع: ' + N(total, 2),
          'إجمالي الفوائد : ' + N(total - P, 2) + '  (' + N(((total - P) / P) * 100, 1) + '% من القرض)',
          '', '— جدول السداد (مقتطف) —',
          '  #   │    القسط     │   الفائدة  │   الأصل    │   المتبقي',
          ...rows
        ].join('\n');
      }
    }) });

  /* ---------- 9. الفائدة البسيطة والمركبة ---------- */
  t({ id: 'interest-calc', cat: 'calc', icon: '📊', title: 'الفائدة البسيطة والمركبة', desc: 'قارن نمو المبلغ بالطريقتين',
    render: f.calcTool({
      live: true, filename: 'interest.txt',
      fields: [
        { id: 'p', label: 'المبلغ', type: 'number', value: 10000 },
        { id: 'r', label: 'الفائدة السنوية %', type: 'number', value: 8, step: 'any' },
        { id: 'y', label: 'عدد السنوات', type: 'number', value: 10 },
        { id: 'n', label: 'عدد مرات التركيب سنوياً', type: 'select', options: [['1', 'سنوياً'], ['4', 'ربع سنوياً'], ['12', 'شهرياً'], ['365', 'يومياً']], value: '12' }
      ],
      run: (v) => {
        const P = Number(v.p), r = Number(v.r) / 100, y = Number(v.y), n = Number(v.n);
        const simple = P * (1 + r * y);
        const compound = P * Math.pow(1 + r / n, n * y);
        const rows = [];
        for (let i = 0; i <= Math.min(y, 30); i++) rows.push(`  سنة ${String(i).padStart(2)}: بسيطة ${N(P * (1 + r * i), 2).padStart(12)} │ مركبة ${N(P * Math.pow(1 + r / n, n * i), 2).padStart(12)}`);
        return [
          'المبلغ الأصلي: ' + N(P, 2),
          '',
          'الفائدة البسيطة : ' + N(simple, 2) + '  (ربح ' + N(simple - P, 2) + ')',
          'الفائدة المركبة : ' + N(compound, 2) + '  (ربح ' + N(compound - P, 2) + ')',
          'الفرق لصالح المركبة: ' + N(compound - simple, 2),
          'معدل النمو الفعلي (APY): ' + N((Math.pow(1 + r / n, n) - 1) * 100, 3) + '%',
          '', '— السنة بسنة —', ...rows
        ].join('\n');
      }
    }) });

  /* ---------- 10. هدف التوفير ---------- */
  t({ id: 'savings-goal', cat: 'calc', icon: '🎯', title: 'حاسبة هدف التوفير', desc: 'كم توفّر شهرياً للوصول إلى هدفك؟',
    render: f.calcTool({
      live: true, filename: 'savings.txt',
      fields: [
        { id: 'goal', label: 'المبلغ المستهدف', type: 'number', value: 50000 },
        { id: 'have', label: 'المتوفّر حالياً', type: 'number', value: 5000 },
        { id: 'months', label: 'المدة (أشهر)', type: 'number', value: 24 },
        { id: 'rate', label: 'عائد سنوي متوقع % (اختياري)', type: 'number', value: 0, step: 'any' }
      ],
      run: (v) => {
        const goal = Number(v.goal), have = Number(v.have), m = Math.max(1, Number(v.months));
        const r = Number(v.rate) / 100 / 12;
        const need = goal - have;
        const monthly = r ? (need * r) / (Math.pow(1 + r, m) - 1) : need / m;
        return [
          'المطلوب جمعه: ' + N(need, 2),
          'المدة: ' + m + ' شهراً (' + N(m / 12, 1) + ' سنة)',
          '👉 التوفير الشهري المطلوب: ' + N(monthly, 2),
          '   التوفير اليومي المكافئ: ' + N(monthly * 12 / 365, 2),
          Number(v.rate) ? '   (مع عائد ' + N(v.rate, 2) + '% سنوياً)' : '',
          '', 'سيناريوهات بديلة:',
          ...[12, 24, 36, 60].map((mm) => '  خلال ' + mm + ' شهراً → ' + N(r ? (need * r) / (Math.pow(1 + r, mm) - 1) : need / mm, 2) + ' شهرياً')
        ].filter(Boolean).join('\n');
      }
    }) });

  /* ---------- 11. مقارنة سعر الوحدة ---------- */
  t({ id: 'unit-price', cat: 'calc', icon: '🛒', title: 'مقارنة سعر الوحدة', desc: 'أي عرض أفضل: 2 كجم بـ 30 أم 3 كجم بـ 42؟',
    render: function (root) {
      const box = f.el('div', { class: 'grid' });
      const rows = [];
      const res = f.out({ filename: 'unit-price.txt' });
      const addRow = () => {
        const wrap = f.el('div', { class: 'mini-row' });
        const price = f.inp({ type: 'number', placeholder: 'السعر', step: 'any' });
        const qty = f.inp({ type: 'number', placeholder: 'الكمية', step: 'any' });
        const unit = f.inp({ placeholder: 'الوحدة (كجم/لتر/حبة)', value: 'وحدة' });
        const del = f.btn('✕', () => { wrap.remove(); const i = rows.indexOf(o); if (i > -1) rows.splice(i, 1); run(); }, 'ghost');
        const o = { price, qty, unit, wrap };
        rows.push(o);
        wrap.append(price, qty, unit, del);
        box.append(wrap);
        price.addEventListener('input', run); qty.addEventListener('input', run); unit.addEventListener('input', run);
      };
      const run = () => {
        const valid = rows.filter((r) => Number(r.price.value) > 0 && Number(r.qty.value) > 0);
        if (!valid.length) { res.set('أدخل عرضين على الأقل للمقارنة.'); return; }
        const calc = valid.map((r) => ({ ...r, per: Number(r.price.value) / Number(r.qty.value) }));
        calc.sort((a, b) => a.per - b.per);
        res.set(['— الترتيب من الأرخص —',
          ...calc.map((c, i) => `${i === 0 ? '🥇' : i === 1 ? '🥈' : '  '} سعر الوحدة: ${N(c.per, 4)} لكل ${c.unit.value}  (${c.price.value} ÷ ${c.qty.value})`),
          '',
          calc.length > 1 ? '💡 الأفضل: العرض الأول بفرق ' + N(((calc[1].per - calc[0].per) / calc[0].per) * 100, 2) + '% أرخص' : ''].filter(Boolean).join('\n'));
      };
      addRow(); addRow();
      root.append(box, f.row(f.btn('➕ أضف عرضاً', addRow, 'ghost')), res.el);
      run();
    } });

  /* ---------- 12. حساب العمر ---------- */
  t({ id: 'age-calc', cat: 'calc', icon: '🎂', title: 'حاسبة العمر بالتفصيل', desc: 'عمرك بالسنوات والأشهر والأيام والساعات',
    render: function (root) {
      const d = f.inp({ type: 'date', value: '2000-01-01' });
      const res = f.out({ filename: 'age.txt' });
      const run = () => {
        const b = new Date(d.value + 'T00:00:00');
        if (isNaN(b)) { res.set('تاريخ غير صالح'); return; }
        const now = new Date();
        if (b > now) { res.set('التاريخ في المستقبل.'); return; }
        let y = now.getFullYear() - b.getFullYear();
        let m = now.getMonth() - b.getMonth();
        let dd = now.getDate() - b.getDate();
        if (dd < 0) { m--; dd += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
        if (m < 0) { y--; m += 12; }
        const days = Math.floor((now - b) / 86400000);
        const next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
        if (next < now) next.setFullYear(next.getFullYear() + 1);
        const daysLeft = Math.ceil((next - now) / 86400000);
        res.set([
          `🎂 العمر: ${y} سنة و${m} شهراً و${dd} يوماً`,
          '',
          'بالأرقام:',
          '  • ' + f.num(days, 0) + ' يوم',
          '  • ' + f.num(days / 7, 1) + ' أسبوع',
          '  • ' + f.num(days * 24, 0) + ' ساعة',
          '  • ' + f.num(days * 1440, 0) + ' دقيقة',
          '  • ' + f.num(days * 86400, 0) + ' ثانية',
          '  • ' + f.num(days / 30.4375, 1) + ' شهر',
          '',
          '🎈 عيد الميلاد القادم بعد ' + daysLeft + ' يوماً (' + next.toLocaleDateString('ar-EG', { dateStyle: 'full' }) + ')',
          '📅 يوم ميلادك: ' + b.toLocaleDateString('ar-EG', { weekday: 'long' }),
          '💓 نبضات القلب التقديرية (~75/د): ' + f.num(days * 1440 * 75, 0),
          '😴 ساعات النوم التقديرية (8 ساعات): ' + f.num(days * 8, 0) + ' ساعة'
        ].join('\n'));
      };
      d.addEventListener('input', run);
      root.append(f.field('تاريخ الميلاد', d), res.el);
      run();
    } });

  /* ---------- 13. الفرق بين تاريخين ---------- */
  t({ id: 'date-diff', cat: 'calc', icon: '📆', title: 'الفرق بين تاريخين', desc: 'الأيام والأسابيع والأشهر بين تاريخين',
    render: function (root) {
      const a = f.inp({ type: 'date', value: new Date().toISOString().slice(0, 10) });
      const b = f.inp({ type: 'date', value: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10) });
      const opts = f.select({ options: [['days', 'أيام عمل (بدون جمعة/سبت)'], ['alldays', 'كل الأيام']], value: 'alldays' });
      const res = f.out({ filename: 'date-diff.txt' });
      const run = () => {
        const d1 = new Date(a.value + 'T00:00:00'), d2 = new Date(b.value + 'T00:00:00');
        if (isNaN(d1) || isNaN(d2)) { res.set('تاريخ غير صالح'); return; }
        const ms = Math.abs(d2 - d1);
        const days = Math.round(ms / 86400000);
        let work = 0;
        const start = new Date(Math.min(d1, d2));
        for (let i = 0; i < days; i++) {
          const day = new Date(start.getTime() + i * 86400000).getDay();
          if (day !== 5 && day !== 6) work++;
        }
        const chosen = opts.value === 'days' ? work : days;
        res.set([
          'من : ' + d1.toLocaleDateString('ar-EG', { dateStyle: 'full' }),
          'إلى: ' + d2.toLocaleDateString('ar-EG', { dateStyle: 'full' }),
          '',
          'النتيجة: ' + f.num(chosen, 0) + (opts.value === 'days' ? ' يوم عمل' : ' يوم'),
          '',
          '  • ' + f.num(days, 0) + ' يوم إجمالي',
          '  • ' + f.num(work, 0) + ' يوم عمل (بدون الجمعة والسبت)',
          '  • ' + f.num(days / 7, 2) + ' أسبوع',
          '  • ' + f.num(days / 30.4375, 2) + ' شهر',
          '  • ' + f.num(days / 365.25, 2) + ' سنة',
          '  • ' + f.num(days * 24, 0) + ' ساعة',
          '',
          'عدد أيام نهاية الأسبوع: ' + f.num(days - work, 0)
        ].join('\n'));
      };
      [a, b, opts].forEach((x) => x.addEventListener('input', run));
      opts.addEventListener('change', run);
      root.append(f.grid(f.field('من تاريخ', a), f.field('إلى تاريخ', b)), f.field('طريقة العد', opts), res.el);
      run();
    } });

  /* ---------- 14. إضافة أيام لتاريخ ---------- */
  t({ id: 'add-days', cat: 'calc', icon: '➕', title: 'إضافة أو طرح أيام من تاريخ', desc: 'ما التاريخ بعد 45 يوماً؟',
    render: f.calcTool({
      live: true, filename: 'add-days.txt',
      fields: [
        { id: 'd', label: 'التاريخ', type: 'date', value: new Date().toISOString().slice(0, 10) },
        { id: 'n', label: 'عدد الأيام', type: 'number', value: 45 },
        { id: 'sign', label: 'العملية', type: 'select', options: [['+', 'إضافة'], ['-', 'طرح']], value: '+' }
      ],
      run: (v) => {
        const base = new Date(String(v.d) + 'T12:00:00');
        if (isNaN(base)) return 'تاريخ غير صالح';
        const n = Number(v.n) * (v.sign === '-' ? -1 : 1);
        const out = new Date(base.getTime() + n * 86400000);
        const rows = [1, 7, 30, 90, 180, 365].map((k) => '  ' + (v.sign === '-' ? '-' : '+') + k + ' يوم: ' + new Date(base.getTime() + n * 0 + (v.sign === '-' ? -k : k) * 86400000).toLocaleDateString('ar-EG', { dateStyle: 'full' }));
        return [
          'التاريخ الأساسي: ' + base.toLocaleDateString('ar-EG', { dateStyle: 'full' }),
          'النتيجة: ' + out.toLocaleDateString('ar-EG', { dateStyle: 'full' }) + '  (' + out.toISOString().slice(0, 10) + ')',
          'اليوم: ' + out.toLocaleDateString('ar-EG', { weekday: 'long' }),
          '', '— من نفس التاريخ —', ...rows
        ].join('\n');
      }
    }) });

  /* ---------- 15. يوم الأسبوع ---------- */
  t({ id: 'weekday', cat: 'calc', icon: '📅', title: 'يوم الأسبوع ورقم الأسبوع', desc: 'ما يوم هذا التاريخ؟ وكم بقي من السنة؟',
    render: function (root) {
      const d = f.inp({ type: 'date', value: new Date().toISOString().slice(0, 10) });
      const res = f.out({ filename: 'weekday.txt' });
      const run = () => {
        const dt = new Date(d.value + 'T12:00:00');
        if (isNaN(dt)) { res.set('تاريخ غير صالح'); return; }
        const start = new Date(dt.getFullYear(), 0, 1);
        const dayOfYear = Math.floor((dt - start) / 86400000) + 1;
        const week = Math.ceil((dayOfYear + start.getDay()) / 7);
        const quarter = Math.floor(dt.getMonth() / 3) + 1;
        res.set([
          'التاريخ: ' + dt.toLocaleDateString('ar-EG', { dateStyle: 'full' }),
          '',
          'اليوم       : ' + dt.toLocaleDateString('ar-EG', { weekday: 'long' }),
          'يوم السنة   : ' + dayOfYear + ' من 365/366',
          'أسبوع السنة : ' + week,
          'الربع       : Q' + quarter,
          'الشهر       : ' + (dt.getMonth() + 1) + ' من 12',
          'بقي من السنة: ' + (Math.floor((new Date(dt.getFullYear(), 11, 31) - dt) / 86400000)) + ' يوماً',
          '',
          'في نفس التاريخ من سنوات قريبة:',
          ...[1, 2, 3, 5].map((k) => '  ' + (dt.getFullYear() - k) + ': ' + new Date(dt.getFullYear() - k, dt.getMonth(), dt.getDate()).toLocaleDateString('ar-EG', { weekday: 'long' }))
        ].join('\n'));
      };
      d.addEventListener('input', run);
      root.append(f.field('التاريخ', d), res.el);
      run();
    } });

  /* ---------- 16. كتلة الجسم ---------- */
  t({ id: 'bmi', cat: 'calc', icon: '⚕️', title: 'حاسبة كتلة الجسم (BMI)', desc: 'يصنّف وزنك ويحسب الوزن المثالي',
    render: f.calcTool({
      live: true, filename: 'bmi.txt',
      fields: [
        { id: 'cm', label: 'الطول (سم)', type: 'number', value: 175 },
        { id: 'kg', label: 'الوزن (كجم)', type: 'number', value: 78, step: 'any' }
      ],
      run: (v) => {
        const h = Number(v.cm) / 100, w = Number(v.kg);
        if (!h || !w) return 'أدخل الطول والوزن.';
        const bmi = w / (h * h);
        const cat = bmi < 18.5 ? 'نقص في الوزن' : bmi < 25 ? 'وزن طبيعي ✅' : bmi < 30 ? 'زيادة في الوزن' : bmi < 35 ? 'سمنة درجة أولى' : bmi < 40 ? 'سمنة درجة ثانية' : 'سمنة مفرطة';
        const lo = 18.5 * h * h, hi = 24.9 * h * h;
        return [
          'مؤشر كتلة الجسم: ' + f.num(bmi, 1),
          'التصنيف: ' + cat,
          '',
          'الوزن الصحي لطولك: من ' + f.num(lo, 1) + ' إلى ' + f.num(hi, 1) + ' كجم',
          w < lo ? '➡️ تحتاج زيادة ' + f.num(lo - w, 1) + ' كجم' : w > hi ? '➡️ تحتاج خفض ' + f.num(w - hi, 1) + ' كجم' : '➡️ وزنك داخل النطاق الصحي',
          '',
          'الوزن المثالي (تقديري): ' + f.num(22 * h * h, 1) + ' كجم',
          'مساحة سطح الجسم (BSA): ' + f.num(Math.sqrt((h * 100 * w) / 3600), 2) + ' م²'
        ].join('\n');
      }
    }) });

  /* ---------- 17. السعرات الحرارية ---------- */
  t({ id: 'calories-tdee', cat: 'calc', icon: '🍎', title: 'حاسبة السعرات اليومية', desc: 'معدل الأيض والسعرات حسب نشاطك وهدفك',
    render: f.calcTool({
      live: true, filename: 'calories.txt',
      fields: [
        { id: 'sex', label: 'الجنس', type: 'select', options: [['m', 'ذكر'], ['f', 'أنثى']], value: 'm' },
        { id: 'age', label: 'العمر', type: 'number', value: 30 },
        { id: 'cm', label: 'الطول (سم)', type: 'number', value: 175 },
        { id: 'kg', label: 'الوزن (كجم)', type: 'number', value: 78, step: 'any' },
        { id: 'act', label: 'النشاط', type: 'select', options: [['1.2', 'قليل الحركة'], ['1.375', 'نشاط خفيف (1-3 أيام)'], ['1.55', 'نشاط متوسط (3-5 أيام)'], ['1.725', 'نشاط عالٍ (6-7 أيام)'], ['1.9', 'نشاط شديد/عمل بدني']], value: '1.375' }
      ],
      run: (v) => {
        const w = Number(v.kg), h = Number(v.cm), a = Number(v.age);
        if (!w || !h || !a) return 'أكمل البيانات.';
        const bmr = v.sex === 'm' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
        const tdee = bmr * Number(v.act);
        return [
          'معدل الأيض الأساسي (BMR): ' + f.num(bmr, 0) + ' سعرة/يوم',
          'إجمالي السعرات (TDEE)   : ' + f.num(tdee, 0) + ' سعرة/يوم',
          '',
          '— حسب هدفك —',
          '  لخفض الوزن   : ' + f.num(tdee - 500, 0) + ' سعرة (−0.5 كجم/أسبوع)',
          '  خفض بطيء     : ' + f.num(tdee - 250, 0) + ' سعرة (−0.25 كجم/أسبوع)',
          '  الحفاظ على الوزن: ' + f.num(tdee, 0) + ' سعرة',
          '  زيادة الوزن   : ' + f.num(tdee + 300, 0) + ' سعرة',
          '  تضخيم سريع    : ' + f.num(tdee + 600, 0) + ' سعرة',
          '',
          '— توزيع تقريبي للحفاظ على الوزن —',
          '  بروتين: ' + f.num(w * 1.6, 0) + ' جم (' + f.num(w * 1.6 * 4, 0) + ' سعرة)',
          '  دهون  : ' + f.num(w * 0.8, 0) + ' جم (' + f.num(w * 0.8 * 9, 0) + ' سعرة)',
          '  كارب  : ' + f.num((tdee - w * 1.6 * 4 - w * 0.8 * 9) / 4, 0) + ' جم',
          '',
          'الماء الموصى به: ' + f.num(w * 0.033, 1) + ' لتر يومياً'
        ].join('\n');
      }
    }) });

  /* ---------- 18. الإحصاء الوصفي ---------- */
  t({ id: 'statistics', cat: 'calc', icon: '📉', title: 'المتوسط والوسيط والانحراف', desc: 'إحصاءات كاملة لمجموعة أرقام',
    render: function (root) {
      const ta = f.area({ rows: 6, placeholder: 'أدخل الأرقام مفصولة بمسافة أو فاصلة أو سطر\nمثال: 12 15 9 22 30', dir: 'ltr' });
      const res = f.out({ filename: 'stats.txt' });
      const run = () => {
        const nums = (ta.value.match(/-?\d+(\.\d+)?/g) || []).map(Number);
        if (nums.length < 2) { res.set('أدخل رقمين على الأقل.'); return; }
        const sorted = [...nums].sort((a, b) => a - b);
        const n = nums.length;
        const sum = nums.reduce((a, b) => a + b, 0);
        const mean = sum / n;
        const med = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
        const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
        const sd = Math.sqrt(variance);
        const q = (p) => { const idx = (n - 1) * p; const lo = Math.floor(idx); const hi = Math.ceil(idx); return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo); };
        const mode = (() => { const m = {}; nums.forEach((x) => (m[x] = (m[x] || 0) + 1)); const mx = Math.max(...Object.values(m)); const ks = Object.keys(m).filter((k) => m[k] === mx); return mx > 1 ? ks.join(', ') : 'لا يوجد'; })();
        res.set([
          'العدد      : ' + n,
          'المجموع    : ' + f.num(sum, 4),
          'المتوسط    : ' + f.num(mean, 4),
          'الوسيط     : ' + f.num(med, 4),
          'المنوال    : ' + mode,
          'أصغر قيمة  : ' + f.num(sorted[0], 4),
          'أكبر قيمة  : ' + f.num(sorted[n - 1], 4),
          'المدى      : ' + f.num(sorted[n - 1] - sorted[0], 4),
          'التباين    : ' + f.num(variance, 4),
          'الانحراف المعياري: ' + f.num(sd, 4),
          'الخطأ المعياري  : ' + f.num(sd / Math.sqrt(n), 4),
          'معامل الاختلاف : ' + f.num((sd / mean) * 100, 2) + '%',
          '',
          'الربيع الأول (Q1): ' + f.num(q(0.25), 4),
          'الوسيط   (Q2)   : ' + f.num(q(0.5), 4),
          'الربيع الثالث(Q3): ' + f.num(q(0.75), 4),
          'المدى الربيعي   : ' + f.num(q(0.75) - q(0.25), 4),
          '',
          'المجموع المرتّب: ' + sorted.slice(0, 30).join(', ') + (n > 30 ? ' …' : '')
        ].join('\n'));
      };
      ta.addEventListener('input', f.debounce(run, 200));
      root.append(f.field('الأرقام', ta), res.el);
      run();
    } });

  /* ---------- 19. القاسم والمضاعف المشترك ---------- */
  t({ id: 'gcd-lcm', cat: 'calc', icon: '🔗', title: 'القاسم والمضاعف المشترك', desc: 'GCD و LCM لمجموعة أرقام',
    render: function (root) {
      const ta = f.area({ rows: 3, placeholder: '12 18 24', value: '12 18 24', dir: 'ltr' });
      const res = f.out({ filename: 'gcd.txt' });
      const gcd2 = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };
      const run = () => {
        const nums = (ta.value.match(/\d+/g) || []).map(Number);
        if (nums.length < 2) { res.set('أدخل رقمين على الأقل.'); return; }
        const g = nums.reduce((a, b) => gcd2(a, b));
        const l = nums.reduce((a, b) => (a * b) / gcd2(a, b));
        res.set([
          'الأرقام: ' + nums.join(', '),
          'القاسم المشترك الأكبر (GCD): ' + g,
          'المضاعف المشترك الأصغر (LCM): ' + l,
          '',
          'تحليل كل رقم:',
          ...nums.map((n) => '  ' + n + ' = ' + factorStr(n)),
          '',
          'هل الأعداد أولية فيما بينها؟ ' + (g === 1 ? '✅ نعم' : '❌ لا، القاسم المشترك ' + g),
          'الكسور مبسّطة: ' + nums.join(' : ').split(' : ').map((x) => x / g).join(' : ')
        ].join('\n'));
      };
      const factorStr = (n) => {
        const f = [];
        let x = n;
        for (let p = 2; p * p <= x; p++) while (x % p === 0) { f.push(p); x /= p; }
        if (x > 1) f.push(x);
        return f.join(' × ') || String(n);
      };
      ta.addEventListener('input', f.debounce(run, 200));
      root.append(f.field('الأرقام', ta), res.el);
      run();
    } });

  /* ---------- 20. الأعداد الأولية والتحليل ---------- */
  t({ id: 'prime-check', cat: 'calc', icon: '🔢', title: 'فحص الأعداد الأولية والتحليل', desc: 'هل العدد أولي؟ وما عوامله الأولية؟',
    render: function (root) {
      const i = f.inp({ type: 'number', value: 360, dir: 'ltr' });
      const res = f.out({ filename: 'prime.txt' });
      const run = () => {
        const n = Math.floor(Number(i.value));
        if (!isFinite(n) || n < 2) { res.set('أدخل عدداً صحيحاً أكبر من 1.'); return; }
        if (n > 1e12) { res.set('الحد الأقصى 10¹² للحفاظ على السرعة.'); return; }
        const isPrime = (x) => { if (x < 2) return false; if (x % 2 === 0) return x === 2; for (let d = 3; d * d <= x; d += 2) if (x % d === 0) return false; return true; };
        const prime = isPrime(n);
        const factors = [];
        let x = n;
        for (let p = 2; p * p <= x; p++) while (x % p === 0) { factors.push(p); x /= p; }
        if (x > 1) factors.push(x);
        const grouped = {};
        factors.forEach((p) => (grouped[p] = (grouped[p] || 0) + 1));
        const divisors = [];
        for (let d = 1; d * d <= n; d++) if (n % d === 0) { divisors.push(d); if (d !== n / d) divisors.push(n / d); }
        res.set([
          'العدد: ' + n,
          prime ? '✅ عدد أولي' : '❌ ليس أولياً (يقبل القسمة على ' + (factors[0] || 1) + ')',
          '',
          'التحليل الأولي: ' + (Object.entries(grouped).map(([p, c]) => c > 1 ? p + '^' + c : p).join(' × ') || n),
          'عدد القواسم: ' + divisors.length,
          'مجموع القواسم: ' + divisors.reduce((a, b) => a + b, 0),
          'أصغر قاسم أولي: ' + (factors[0] || '—'),
          '',
          'أول 10 قواسم: ' + divisors.sort((a, b) => a - b).slice(0, 10).join(', '),
          '',
          'الأعداد الأولية قبل هذا العدد: ' + (() => { let c = 0; for (let k = 2; k < n && k < 100000; k++) if (isPrime(k)) c++; return c; })() + ' (حتى 100 ألف)',
          'الأعداد الأولية بعده: ' + (() => { for (let k = n + 1; k < n + 1000; k++) if (isPrime(k)) return k; return '—'; })()
        ].join('\n'));
      };
      i.addEventListener('input', f.debounce(run, 250));
      root.append(f.field('العدد', i), res.el);
      run();
    } });

  /* ---------- 21. المعادلة التربيعية ---------- */
  t({ id: 'quadratic', cat: 'calc', icon: '📐', title: 'حل المعادلة التربيعية', desc: 'حل ax² + bx + c = 0 بالجذور والتحليل',
    render: f.calcTool({
      live: true, filename: 'quadratic.txt',
      fields: [
        { id: 'a', label: 'a', type: 'number', value: 1, step: 'any' },
        { id: 'b', label: 'b', type: 'number', value: -3, step: 'any' },
        { id: 'c', label: 'c', type: 'number', value: 2, step: 'any' }
      ],
      run: (v) => {
        const a = Number(v.a), b = Number(v.b), c = Number(v.c);
        if (!a) return 'المعامل a لا يمكن أن يكون صفراً (تصبح معادلة خطية: x = ' + N(-c / b, 4) + ')';
        const D = b * b - 4 * a * c;
        const vx = -b / (2 * a), vy = a * vx * vx + b * vx + c;
        const lines = [
          'المعادلة: ' + a + 'x² ' + (b >= 0 ? '+ ' : '− ') + Math.abs(b) + 'x ' + (c >= 0 ? '+ ' : '− ') + Math.abs(c) + ' = 0',
          'المميّز Δ = b² − 4ac = ' + N(D, 4),
          ''
        ];
        if (D > 0) {
          const r1 = (-b + Math.sqrt(D)) / (2 * a), r2 = (-b - Math.sqrt(D)) / (2 * a);
          lines.push('جذران حقيقيان:', '  x₁ = ' + N(r1, 6), '  x₂ = ' + N(r2, 6),
            '', 'التحليل: ' + N(a, 3) + '(x − ' + N(r1, 4) + ')(x − ' + N(r2, 4) + ')');
        } else if (D === 0) {
          lines.push('جذر مزدوج واحد:', '  x = ' + N(-b / (2 * a), 6), '', 'التحليل: ' + N(a, 3) + '(x − ' + N(vx, 4) + ')²');
        } else {
          const re = -b / (2 * a), im = Math.sqrt(-D) / (2 * a);
          lines.push('لا جذور حقيقية (جذران مركّبان):',
            '  x₁ = ' + N(re, 4) + ' + ' + N(Math.abs(im), 4) + 'i',
            '  x₂ = ' + N(re, 4) + ' − ' + N(Math.abs(im), 4) + 'i');
        }
        lines.push('', 'رأس القطع المكافئ: (' + N(vx, 4) + ', ' + N(vy, 4) + ')',
          'اتجاه الفتح: ' + (a > 0 ? 'أعلى ⬆️ (قيمة صغرى)' : 'أسفل ⬇️ (قيمة عظمى)'));
        return lines.join('\n');
      }
    }) });

  /* ---------- 22. الدائرة ---------- */
  t({ id: 'circle-calc', cat: 'calc', icon: '⭕', title: 'حساب الدائرة', desc: 'المساحة والمحيط والقطر من نصف القطر أو العكس',
    render: f.calcTool({
      live: true, filename: 'circle.txt',
      fields: [{ id: 'r', label: 'نصف القطر', type: 'number', value: 10, step: 'any' },
        { id: 'from', label: 'المعطى', type: 'select', options: [['r', 'نصف القطر'], ['d', 'القطر'], ['c', 'المحيط'], ['a', 'المساحة']], value: 'r' }],
      run: (v) => {
        const x = Number(v.r);
        if (!x) return 'أدخل قيمة.';
        let r;
        if (v.from === 'r') r = x;
        else if (v.from === 'd') r = x / 2;
        else if (v.from === 'c') r = x / (2 * Math.PI);
        else r = Math.sqrt(x / Math.PI);
        return [
          'نصف القطر : ' + N(r, 6),
          'القطر     : ' + N(r * 2, 6),
          'المحيط    : ' + N(2 * Math.PI * r, 6),
          'المساحة   : ' + N(Math.PI * r * r, 6),
          '',
          'مساحة نصف الدائرة: ' + N((Math.PI * r * r) / 2, 6),
          'طول القوس (90°): ' + N((2 * Math.PI * r) / 4, 6),
          'مساحة القطاع (90°): ' + N((Math.PI * r * r) / 4, 6),
          'حجم الكرة بنفس نصف القطر: ' + N((4 / 3) * Math.PI * Math.pow(r, 3), 4),
          '',
          'الدائرة داخل مربع ضلعه ' + N(r * 2, 4) + ' → نسبة المساحة ' + N((Math.PI * r * r) / (4 * r * r) * 100, 2) + '%'
        ].join('\n');
      }
    }) });

  /* ---------- 23. المثلث ---------- */
  t({ id: 'triangle-calc', cat: 'calc', icon: '🔺', title: 'حساب المثلث', desc: 'المساحة والمحيط وإختبار إمكانية تكوين مثلث',
    render: f.calcTool({
      live: true, filename: 'triangle.txt',
      fields: [
        { id: 'a', label: 'الضلع a (أو القاعدة)', type: 'number', value: 6, step: 'any' },
        { id: 'b', label: 'الضلع b (أو الارتفاع)', type: 'number', value: 8, step: 'any' },
        { id: 'c', label: 'الضلع c (اختياري)', type: 'number', value: 10, step: 'any' },
        { id: 'mode', label: 'الطريقة', type: 'select', options: [['base', 'قاعدة × ارتفاع'], ['three', 'ثلاثة أضلاع (هيرون)'], ['right', 'مثلث قائم (ساقان)']], value: 'three' }
      ],
      run: (v) => {
        const a = Number(v.a), b = Number(v.b), c = Number(v.c);
        if (v.mode === 'base') return ['القاعدة: ' + N(a, 3) + ' · الارتفاع: ' + N(b, 3), 'المساحة = (القاعدة × الارتفاع) ÷ 2 = ' + N((a * b) / 2, 4)].join('\n');
        if (v.mode === 'right') {
          const h = Math.hypot(a, b);
          return ['الساقان: ' + N(a, 3) + ' و ' + N(b, 3), 'الوتر = ' + N(h, 4), 'المساحة = ' + N((a * b) / 2, 4), 'المحيط = ' + N(a + b + h, 4), 'الزاوية المقابلة للضلع a = ' + N((Math.atan2(a, b) * 180) / Math.PI, 3) + '°'].join('\n');
        }
        if (!(a + b > c && a + c > b && b + c > a)) return '⚠️ لا يمكن تكوين مثلث بهذه الأضلاع (مجموع أي ضلعين يجب أن يزيد على الثالث).';
        const s = (a + b + c) / 2;
        const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
        const ang = (x, y, z) => (Math.acos((x * x + y * y - z * z) / (2 * x * y)) * 180) / Math.PI;
        const type = a === b && b === c ? 'متساوي الأضلاع' : a === b || b === c || a === c ? 'متساوي الساقين' : 'مختلف الأضلاع';
        return [
          'الأضلاع: ' + a + ' ، ' + b + ' ، ' + c,
          'نوع المثلث: ' + type,
          'المحيط  : ' + N(a + b + c, 4),
          'نصف المحيط: ' + N(s, 4),
          'المساحة : ' + N(area, 4),
          'الارتفاع على a: ' + N((2 * area) / a, 4),
          '',
          'الزوايا: A=' + N(ang(b, c, a), 2) + '°  B=' + N(ang(a, c, b), 2) + '°  C=' + N(ang(a, b, c), 2) + '°',
          'مجموع الزوايا: ' + N(ang(b, c, a) + ang(a, c, b) + ang(a, b, c), 2) + '° (يجب أن يساوي 180)',
          'نصف قطر الدائرة المحيطة: ' + N((a * b * c) / (4 * area), 4),
          'نصف قطر الدائرة الداخلية: ' + N(area / s, 4)
        ].join('\n');
      }
    }) });

  /* ---------- 24. مساحات وأحجام المجسمات ---------- */
  t({ id: 'solids-calc', cat: 'calc', icon: '🧊', title: 'مساحات وأحجام المجسمات', desc: 'المكعب والأسطوانة والكرة والمخروط وغيرها',
    render: f.calcTool({
      fields: [
        { id: 'shape', label: 'المجسم', type: 'select', options: [['cube', 'مكعب'], ['box', 'متوازي مستطيلات'], ['sphere', 'كرة'], ['cylinder', 'أسطوانة'], ['cone', 'مخروط'], ['pyramid', 'هرم رباعي'], ['torus', 'طوق (Torus)']], value: 'cube' },
        { id: 'x', label: 'البُعد 1 (أو نصف القطر)', type: 'number', value: 5, step: 'any' },
        { id: 'y', label: 'البُعد 2 (اختياري)', type: 'number', value: 4, step: 'any' },
        { id: 'z', label: 'البُعد 3 (اختياري)', type: 'number', value: 3, step: 'any' }
      ],
      live: true, filename: 'solids.txt',
      run: (v) => {
        const a = Number(v.x), b = Number(v.y), c = Number(v.z), P = Math.PI;
        const out = [];
        switch (v.shape) {
          case 'cube': out.push(['المكعب بحرف ' + N(a, 3), 'الحجم = a³ = ' + N(a ** 3, 4), 'المساحة الكلية = 6a² = ' + N(6 * a * a, 4), 'القطر الداخلي = a√3 = ' + N(a * Math.sqrt(3), 4), 'المساحة الجانبية = 4a² = ' + N(4 * a * a, 4)]); break;
          case 'box': out.push(['متوازي المستطيلات ' + a + '×' + b + '×' + c, 'الحجم = ' + N(a * b * c, 4), 'المساحة الكلية = 2(ab+bc+ca) = ' + N(2 * (a * b + b * c + c * a), 4), 'القطر = ' + N(Math.sqrt(a * a + b * b + c * c), 4)]); break;
          case 'sphere': out.push(['الكرة بنصف قطر ' + N(a, 3), 'الحجم = 4/3 πr³ = ' + N((4 / 3) * P * a ** 3, 4), 'المساحة = 4πr² = ' + N(4 * P * a * a, 4), 'المحيط الأكبر = ' + N(2 * P * a, 4)]); break;
          case 'cylinder': out.push(['الأسطوانة (r=' + N(a, 3) + ', h=' + N(b, 3) + ')', 'الحجم = πr²h = ' + N(P * a * a * b, 4), 'المساحة الجانبية = 2πrh = ' + N(2 * P * a * b, 4), 'المساحة الكلية = 2πr(r+h) = ' + N(2 * P * a * (a + b), 4)]); break;
          case 'cone': out.push(['المخروط (r=' + N(a, 3) + ', h=' + N(b, 3) + ')', 'الحجم = πr²h/3 = ' + N((P * a * a * b) / 3, 4), 'الارتفاع الجانبي = √(r²+h²) = ' + N(Math.hypot(a, b), 4), 'المساحة الجانبية = πr×l = ' + N(P * a * Math.hypot(a, b), 4), 'المساحة الكلية = ' + N(P * a * (a + Math.hypot(a, b)), 4)]); break;
          case 'pyramid': out.push(['الهرم الرباعي (ضلع=' + N(a, 3) + ', ارتفاع=' + N(b, 3) + ')', 'الحجم = a²h/3 = ' + N((a * a * b) / 3, 4), 'الارتفاع الجانبي = ' + N(Math.hypot(a / 2, b), 4), 'المساحة الكلية = ' + N(a * a + 2 * a * Math.hypot(a / 2, b), 4)]); break;
          case 'torus': out.push(['الطوق (R=' + N(a, 3) + ', r=' + N(b, 3) + ')', 'الحجم = 2π²Rr² = ' + N(2 * P * P * a * b * b, 4), 'المساحة = 4π²Rr = ' + N(4 * P * P * a * b, 4)]); break;
        }
        return out.flat().join('\n');
      }
    }) });

  /* ---------- 25. التوافيق والتباديل ---------- */
  t({ id: 'combinatorics', cat: 'calc', icon: '🎰', title: 'المضروب والتوافيق والتباديل', desc: 'nPr و nCr و n! والاحتمالات',
    render: f.calcTool({
      live: true, filename: 'combinatorics.txt',
      fields: [
        { id: 'n', label: 'n (الكل)', type: 'number', value: 10, min: 0 },
        { id: 'r', label: 'r (المختار)', type: 'number', value: 3, min: 0 }
      ],
      run: (v) => {
        const n = Math.max(0, Math.floor(Number(v.n))), r = Math.max(0, Math.floor(Number(v.r)));
        if (n > 170) return 'الحد الأقصى n=170 (تجاوز حدود الأرقام).';
        const fact = (x) => { let o = 1; for (let i = 2; i <= x; i++) o *= i; return o; };
        const perm = fact(n) / fact(n - r);
        const comb = fact(n) / (fact(r) * fact(n - r));
        return [
          n + '! = ' + f.num(fact(n), 0),
          r + '! = ' + f.num(fact(r), 0),
          '',
          'التباديل P(' + n + ',' + r + ') = ' + f.num(perm, 0) + '  ← الترتيب مهم',
          'التوافيق C(' + n + ',' + r + ') = ' + f.num(comb, 0) + '  ← الترتيب غير مهم',
          '',
          'احتمال تخمين ' + r + ' من ' + n + ' بشكل صحيح مرة واحدة: 1 من ' + f.num(comb, 0),
          'النسبة: ' + f.num((1 / comb) * 100, 6) + '%',
          '',
          'مثال يانصيب: لو كان لديك ' + n + ' رقماً واخترت ' + r + '، فعدد الاحتمالات الممكنة = ' + f.num(comb, 0)
        ].join('\n');
      }
    }) });

  /* ---------- 26. الأس والجذر ---------- */
  t({ id: 'powers-roots', cat: 'calc', icon: '√', title: 'الأسس والجذور', desc: 'القوى والجذور واللوغاريتمات',
    render: f.calcTool({
      live: true, filename: 'powers.txt',
      fields: [{ id: 'x', label: 'العدد', type: 'number', value: 144, step: 'any' }, { id: 'n', label: 'الأُس/الجذر', type: 'number', value: 2, step: 'any' }],
      run: (v) => {
        const x = Number(v.x), n = Number(v.n);
        const lines = ['العدد: ' + N(x, 6) + '   الأُس/الجذر: ' + N(n, 6), ''];
        lines.push('xⁿ        = ' + N(Math.pow(x, n), 8));
        lines.push('x⁻ⁿ       = ' + N(Math.pow(x, -n), 8));
        lines.push('x^(1/n)   = ' + N(Math.pow(x, 1 / n), 8) + '  (الجذر الـ ' + N(n, 3) + ')');
        if (x > 0) { lines.push('√x        = ' + N(Math.sqrt(x), 8)); lines.push('log₁₀(x)  = ' + N(Math.log10(x), 8)); lines.push('ln(x)     = ' + N(Math.log(x), 8)); }
        if (x > 0 && n > 0) lines.push('log_x(n)  = ' + N(Math.log(n) / Math.log(x), 8));
        lines.push('', 'القيمة المطلقة: ' + N(Math.abs(x), 6));
        lines.push('التربيعي     : ' + N(x * x, 6));
        lines.push('المكعب       : ' + N(x ** 3, 6));
        return lines.join('\n');
      }
    }) });

  /* ---------- 27. التقريب والأرقام المعنوية ---------- */
  t({ id: 'rounding', cat: 'calc', icon: '🎯', title: 'التقريب والأرقام المعنوية', desc: 'تقريب لأي منزلة وتحديد الأرقام المعنوية',
    render: f.calcTool({
      live: true, filename: 'rounding.txt',
      fields: [{ id: 'x', label: 'العدد', type: 'number', value: 1234.56789, step: 'any' }, { id: 'd', label: 'عدد المنازل', type: 'number', value: 2, min: 0, max: 10 }],
      run: (v) => {
        const x = Number(v.x), d = Math.max(0, Math.floor(Number(v.d)));
        if (!isFinite(x)) return 'أدخل عدداً.';
        const sig = (n) => { const s = String(Math.abs(n)).replace(/^0+\.?0*/, '').replace('.', '').replace(/^0+/, ''); return s.length || 1; };
        return [
          'العدد: ' + N(x, 10),
          '',
          'تقريب لأقرب ' + d + ' منزلة عشري: ' + N(Number(x.toFixed(d)), 10),
          'تقريب لأقرب عدد صحيح: ' + Math.round(x),
          'تقريب للأسفل (floor): ' + Math.floor(x),
          'تقريب للأعلى (ceil): ' + Math.ceil(x),
          'تقريب نحو الصفر: ' + Math.trunc(x),
          'تقريب لأقرب 10: ' + Math.round(x / 10) * 10,
          'تقريب لأقرب 100: ' + Math.round(x / 100) * 100,
          'تقريب لأقرب 1000: ' + Math.round(x / 1000) * 1000,
          '',
          'الأرقام المعنوية: ' + sig(x),
          'بالصيغة العلمية: ' + x.toExponential(4),
          'بصيغة الأرقام المعنوية (4): ' + Number(x.toPrecision(4)),
          'بأرقام الإحصاء: ' + x.toLocaleString('en-US', { maximumFractionDigits: d })
        ].join('\n');
      }
    }) });

  /* ---------- 28. الأرقام العشوائية ---------- */
  t({ id: 'random-numbers', cat: 'calc', icon: '🎲', title: 'مولّد الأرقام العشوائية', desc: 'أرقام صحيحة أو عشرية مع خيار عدم التكرار',
    render: function (root) {
      const min = f.inp({ type: 'number', value: 1 });
      const max = f.inp({ type: 'number', value: 100 });
      const count = f.inp({ type: 'number', value: 6, min: 1, max: 10000 });
      const unique = f.select({ options: [['1', 'بدون تكرار'], ['0', 'يسمح بالتكرار']], value: '1' });
      const dec = f.select({ options: [['0', 'أرقام صحيحة'], ['1', 'مع منزلة عشرية'], ['2', 'منزلتان'], ['3', 'ثلاث منازل']], value: '0' });
      const sorted = f.select({ options: [['0', 'بترتيب عشوائي'], ['1', 'مرتّبة تصاعدياً']], value: '0' });
      const res = f.out({ filename: 'random.txt' });
      const run = () => {
        const lo = Number(min.value), hi = Number(max.value), n = Math.min(10000, Math.max(1, Number(count.value)));
        const d = Number(dec.value);
        if (hi < lo) { res.set('الحد الأعلى أصغر من الأدنى.'); return; }
        const arr = [];
        if (unique.value === '1' && d === 0) {
          const range = hi - lo + 1;
          if (n > range) { res.set('المدى يحتوي ' + range + ' رقماً فقط، لا يمكن توليد ' + n + ' بدون تكرار.'); return; }
          const pool = new Set();
          while (pool.size < n) pool.add(Math.floor(Math.random() * range) + lo);
          arr.push(...pool);
        } else {
          for (let i = 0; i < n; i++) arr.push(Number(((Math.random() * (hi - lo)) + lo).toFixed(d)));
        }
        if (sorted.value === '1') arr.sort((a, b) => a - b);
        const sum = arr.reduce((a, b) => a + b, 0);
        res.set(arr.join('  ') + '\n\n— إحصاء —\nالعدد: ' + arr.length + '\nالمجموع: ' + N(sum, 4) + '\nالمتوسط: ' + N(sum / arr.length, 4) + '\nالأصغر: ' + Math.min(...arr) + '\nالأكبر: ' + Math.max(...arr));
      };
      root.append(
        f.grid(f.field('من', min), f.field('إلى', max), f.field('العدد', count), f.field('التكرار', unique), f.field('المنازل', dec), f.field('الترتيب', sorted)),
        f.row(f.btn('🎲 ولّد', run, 'primary')),
        res.el
      );
      run();
    } });

  /* ---------- 29. نسبة الأبعاد ---------- */
  t({ id: 'aspect-ratio', cat: 'calc', icon: '🖼️', title: 'حاسبة نسبة الأبعاد', desc: 'يقلّص الأبعاد بنفس النسبة ويبسّطها',
    render: f.calcTool({
      live: true, filename: 'aspect.txt',
      fields: [
        { id: 'w', label: 'العرض', type: 'number', value: 1920 },
        { id: 'h', label: 'الارتفاع', type: 'number', value: 1080 },
        { id: 'nw', label: 'العرض الجديد', type: 'number', value: 1280 }
      ],
      run: (v) => {
        const w = Number(v.w), h = Number(v.h), nw = Number(v.nw);
        if (!w || !h) return 'أدخل العرض والارتفاع.';
        const gcd = (a, b) => (b ? gcd(b, a % b) : a);
        const g = gcd(Math.round(w), Math.round(h)) || 1;
        const nh = Math.round((nw * h) / w);
        return [
          'نسبة الأبعاد: ' + (w / g) + ':' + (h / g) + '  (' + N(w / h, 4) + ')',
          'التصنيف التقريبي: ' + (Math.abs(w / h - 16 / 9) < 0.02 ? '16:9 (شاشات)' : Math.abs(w / h - 4 / 3) < 0.02 ? '4:3 (كلاسيكي)' : Math.abs(w / h - 21 / 9) < 0.05 ? '21:9 (عريض)' : Math.abs(w / h - 1) < 0.02 ? '1:1 (مربع)' : Math.abs(w / h - 9 / 16) < 0.02 ? '9:16 (رأسي)' : 'نسبة مخصصة'),
          '',
          'بتصغير العرض إلى ' + nw + ': الارتفاع = ' + nh,
          'نسبة المساحة الجديدة: ' + N(((nw * nh) / (w * h)) * 100, 2) + '%',
          '',
          '— أبعاد شائعة بنفس النسبة —',
          ...[640, 800, 1024, 1280, 1600, 1920, 2560].map((x) => '  عرض ' + String(x).padStart(4) + ' → ارتفاع ' + Math.round((x * h) / w)),
          '',
          'عدد الميجابكسل: ' + N((w * h) / 1e6, 2) + ' MP'
        ].join('\n');
      }
    }) });

  /* ---------- 30. حساب الوزن المثالي والماء ---------- */
  t({ id: 'ideal-weight', cat: 'calc', icon: '🧍', title: 'الوزن المثالي والماء اليومي', desc: 'بحسب الطول والجنس بعدة معادلات',
    render: f.calcTool({
      live: true, filename: 'ideal.txt',
      fields: [
        { id: 'cm', label: 'الطول (سم)', type: 'number', value: 175 },
        { id: 'sex', label: 'الجنس', type: 'select', options: [['m', 'ذكر'], ['f', 'أنثى']], value: 'm' },
        { id: 'act', label: 'النشاط', type: 'select', options: [['1', 'عادي'], ['2', 'رياضي (تمارين يومية)'], ['3', 'حرارة عالية / عمل بدني']], value: '1' }
      ],
      run: (v) => {
        const cm = Number(v.cm), inch = cm / 2.54;
        const over60 = Math.max(0, inch - 60);
        const devine = (v.sex === 'm' ? 50 : 45.5) + 2.3 * over60;
        const hamwi = (v.sex === 'm' ? 48 : 45.5) + 2.7 * over60;
        const robinson = (v.sex === 'm' ? 52 : 49) + (v.sex === 'm' ? 1.9 : 1.7) * over60;
        const miller = (v.sex === 'm' ? 56.2 : 53.1) + (v.sex === 'm' ? 1.41 : 1.36) * over60;
        const bmi22 = 22 * Math.pow(cm / 100, 2);
        const water = (cm > 0 ? 0 : 0) + 0; // placeholder
        const kg = (devine + hamwi + robinson + miller + bmi22) / 5;
        const liters = kg * 0.033 * Number(v.act);
        return [
          'الطول: ' + cm + ' سم (' + N(inch, 1) + ' بوصة)',
          '',
          '— تقديرات الوزن المثالي —',
          '  معادلة Devine  : ' + N(devine, 1) + ' كجم',
          '  معادلة Hamwi   : ' + N(hamwi, 1) + ' كجم',
          '  معادلة Robinson: ' + N(robinson, 1) + ' كجم',
          '  معادلة Miller  : ' + N(miller, 1) + ' كجم',
          '  مؤشر BMI = 22  : ' + N(bmi22, 1) + ' كجم',
          '  ⭐ متوسط التقديرات: ' + N(kg, 1) + ' كجم',
          '',
          '💧 الماء اليومي الموصى به: ' + N(liters, 1) + ' لتر (~' + N(liters * 4, 0) + ' أكواب)',
          '   (0.033 لتر لكل كجم' + (Number(v.act) > 1 ? ' × عامل النشاط' : '') + ')',
          '',
          'نصيحة: هذه تقديرات إحصائية، الأفضل مراجعة مختص.'
        ].join('\n');
      }
    }) });
})();
