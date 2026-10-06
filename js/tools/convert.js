/* ============================================================
   tools/convert.js — المحوّلات (18 أداة)
   ============================================================ */
(function () {
  'use strict';
  const t = f.tool;

  /* ---------- مصنع أدوات الوحدات ---------- */
  function unitTool(o) {
    t({
      id: o.id, cat: 'convert', icon: o.icon, title: o.title, desc: o.desc,
      render: function (root) {
        const names = Object.keys(o.units);
        const val = f.inp({ type: 'number', value: o.default || 1, step: 'any' });
        const from = f.select({ options: names.map((n) => [n, n + ' (' + o.units[n] + ')']), value: o.from || names[0] });
        const to = f.select({ options: names.map((n) => [n, n + ' (' + o.units[n] + ')']), value: o.to || names[1] || names[0] });
        const res = f.out({ filename: o.id + '.txt' });
        const run = () => {
          const v = Number(val.value);
          if (!isFinite(v)) { res.set('أدخل رقماً صحيحاً.'); return; }
          const base = v * o.units[from.value];
          const out = base / o.units[to.value];
          const rows = names.map((n) => {
            const x = base / o.units[n];
            return (n === to.value ? '▶ ' : '  ') + n.padEnd(14) + f.num(x, o.dec === undefined ? 6 : o.dec);
          });
          res.set(`${f.num(v, 6)} ${from.value} = ${f.num(out, 6)} ${to.value}\n\n— كل الوحدات —\n` + rows.join('\n'));
        };
        [val, from, to].forEach((x) => x.addEventListener('input', run));
        [from, to].forEach((x) => x.addEventListener('change', run));
        root.append(
          f.grid(f.field('القيمة', val), f.field('من', from), f.field('إلى', to)),
          f.row(f.btn('🔄 اقلب الوحدتين', () => { const a = from.value; from.value = to.value; to.value = a; run(); }, 'ghost')),
          res.el
        );
        run();
      }
    });
  }

  unitTool({
    id: 'unit-length', icon: '📏', title: 'محوّل وحدات الطول', desc: 'متر، كيلومتر، سنتيمتر، ميل، قدم، بوصة…',
    units: { 'مليمتر': 0.001, 'سنتيمتر': 0.01, 'متر': 1, 'كيلومتر': 1000, 'بوصة': 0.0254, 'قدم': 0.3048, 'يارد': 0.9144, 'ميل': 1609.344, 'ميل بحري': 1852, 'فرسخ فلكي': 3.0857e16, 'سنة ضوئية': 9.4607e15 }, from: 'متر', to: 'قدم'
  });
  unitTool({
    id: 'unit-weight', icon: '⚖️', title: 'محوّل وحدات الوزن', desc: 'جرام، كيلو، طن، رطل، أونصة، قيراط…',
    units: { 'ميكروجرام': 1e-9, 'مليجرام': 1e-6, 'جرام': 0.001, 'كيلوجرام': 1, 'طن': 1000, 'أونصة': 0.0283495, 'رطل': 0.453592, 'قيراط': 0.0002, 'حبة قمح': 6.4799e-5 }, from: 'كيلوجرام', to: 'رطل'
  });
  unitTool({
    id: 'unit-area', icon: '🗺️', title: 'محوّل وحدات المساحة', desc: 'متر مربع، دونم، هكتار، فدان، قدم مربع…',
    units: { 'سنتيمتر مربع': 0.0001, 'متر مربع': 1, 'كيلومتر مربع': 1e6, 'هكتار': 10000, 'دونم': 1000, 'فدان (acre)': 4046.86, 'قدم مربع': 0.092903, 'يارد مربع': 0.836127, 'ميل مربع': 2589988 }, from: 'متر مربع', to: 'دونم'
  });
  unitTool({
    id: 'unit-volume', icon: '🧪', title: 'محوّل وحدات الحجم', desc: 'لتر، مليلتر، متر مكعب، جالون، كوب…',
    units: { 'مليلتر': 0.001, 'لتر': 1, 'متر مكعب': 1000, 'سنتيمتر مكعب': 0.001, 'جالون أمريكي': 3.78541, 'جالون بريطاني': 4.54609, 'كوب': 0.236588, 'أونصة سائلة': 0.0295735, 'برميل نفط': 158.987 }, from: 'لتر', to: 'جالون أمريكي'
  });
  unitTool({
    id: 'unit-speed', icon: '🚀', title: 'محوّل وحدات السرعة', desc: 'كم/س، ميل/س، متر/ث، عقدة…',
    units: { 'متر/ثانية': 1, 'كم/ساعة': 0.277778, 'ميل/ساعة': 0.44704, 'عقدة (knot)': 0.514444, 'قدم/ثانية': 0.3048, 'سرعة الصوت (ماخ 1)': 343 }, from: 'كم/ساعة', to: 'ميل/ساعة'
  });
  unitTool({
    id: 'unit-data', icon: '💾', title: 'محوّل وحدات البيانات', desc: 'بايت، كيلوبايت، ميجابايت، جيجابايت، تيرابايت…',
    units: { 'بت': 0.125, 'بايت': 1, 'كيلوبايت': 1024, 'ميجابايت': 1048576, 'جيجابايت': 1073741824, 'تيرابايت': 1099511627776, 'بيتابايت': 1.1259e15 }, from: 'ميجابايت', to: 'جيجابايت', dec: 8
  });
  unitTool({
    id: 'unit-time', icon: '⏳', title: 'محوّل وحدات الوقت', desc: 'ثانية، دقيقة، ساعة، يوم، أسبوع، سنة…',
    units: { 'ملي ثانية': 0.001, 'ثانية': 1, 'دقيقة': 60, 'ساعة': 3600, 'يوم': 86400, 'أسبوع': 604800, 'شهر (30 يوم)': 2592000, 'سنة': 31536000, 'عقد': 315360000 }, from: 'يوم', to: 'ساعة'
  });
  unitTool({
    id: 'unit-pressure', icon: '🎈', title: 'محوّل الضغط', desc: 'باسكال، بار، ضغط جوي، PSI…',
    units: { 'باسكال': 1, 'كيلوباسكال': 1000, 'بار': 100000, 'مليبار': 100, 'ضغط جوي (atm)': 101325, 'PSI': 6894.76, 'ملم زئبق': 133.322 }, from: 'بار', to: 'PSI'
  });
  unitTool({
    id: 'unit-energy', icon: '⚡', title: 'محوّل الطاقة', desc: 'جول، كالوري، كيلوواط/ساعة، إلكترون فولت…',
    units: { 'جول': 1, 'كيلوجول': 1000, 'كالوري': 4.184, 'كيلوكالوري': 4184, 'واط/ساعة': 3600, 'كيلوواط/ساعة': 3600000, 'إلكترون فولت': 1.602e-19 }, from: 'كيلوواط/ساعة', to: 'كيلوجول'
  });
  unitTool({
    id: 'unit-angle', icon: '📐', title: 'محوّل الزوايا', desc: 'درجة، راديان، جراديان، دورة',
    units: { 'درجة': 1, 'راديان': 57.2957795, 'جراديان': 0.9, 'دورة': 360, 'دقيقة قوسية': 1 / 60, 'ثانية قوسية': 1 / 3600, 'ميلّي راديان': 0.0572958 }, from: 'درجة', to: 'راديان'
  });

  /* ---------- درجة الحرارة (تحويل خاص) ---------- */
  t({
    id: 'unit-temperature', cat: 'convert', icon: '🌡️', title: 'محوّل درجة الحرارة', desc: 'مئوية، فهرنهايت، كلفن، رانكين',
    render: function (root) {
      const val = f.inp({ type: 'number', value: 25, step: 'any' });
      const from = f.select({ options: ['مئوية (°C)', 'فهرنهايت (°F)', 'كلفن (K)', 'رانكين (°R)'], value: 'مئوية (°C)' });
      const res = f.out({ filename: 'temp.txt' });
      const toC = (v, u) => u.startsWith('مئوية') ? v : u.startsWith('فهرنهايت') ? (v - 32) * 5 / 9 : u.startsWith('كلفن') ? v - 273.15 : (v - 491.67) * 5 / 9;
      const run = () => {
        const c = toC(Number(val.value), from.value);
        if (!isFinite(c)) { res.set('أدخل رقماً.'); return; }
        res.set([
          'مئوية    : ' + f.num(c, 2) + ' °C',
          'فهرنهايت : ' + f.num(c * 9 / 5 + 32, 2) + ' °F',
          'كلفن     : ' + f.num(c + 273.15, 2) + ' K',
          'رانكين   : ' + f.num((c + 273.15) * 9 / 5, 2) + ' °R',
          '',
          c <= 0 ? '🧊 عند أو تحت درجة تجمّد الماء' : c >= 100 ? '🔥 عند أو فوق درجة غليان الماء' : '💧 بين التجمّد والغليان',
          'إحساس تقريبي: ' + (c < 0 ? 'شديد البرودة' : c < 10 ? 'بارد' : c < 20 ? 'معتدل بارد' : c < 30 ? 'معتدل' : c < 40 ? 'حار' : 'شديد الحرارة')
        ].join('\n'));
      };
      [val, from].forEach((x) => x.addEventListener('input', run));
      from.addEventListener('change', run);
      root.append(f.grid(f.field('القيمة', val), f.field('الوحدة', from)), res.el);
      run();
    }
  });

  /* ---------- المناطق الزمنية ---------- */
  t({
    id: 'timezone-converter', cat: 'convert', icon: '🌍', title: 'محوّل المناطق الزمنية', desc: 'حوّل وقتاً بين أي مدينتين في العالم',
    render: function (root) {
      const zones = ['Asia/Aden', 'Asia/Riyadh', 'Asia/Dubai', 'Asia/Cairo', 'Asia/Baghdad', 'Asia/Amman', 'Asia/Beirut', 'Asia/Kuwait', 'Asia/Qatar', 'Africa/Khartoum', 'Africa/Casablanca', 'Africa/Lagos', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow', 'Europe/Istanbul', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'America/Sao_Paulo', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Jakarta', 'Asia/Kuala_Lumpur', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney', 'Pacific/Auckland', 'UTC'];
      const AR = { 'Asia/Aden': 'صنعاء/عدن', 'Asia/Riyadh': 'الرياض', 'Asia/Dubai': 'دبي', 'Asia/Cairo': 'القاهرة', 'Asia/Baghdad': 'بغداد', 'Asia/Amman': 'عمّان', 'Asia/Beirut': 'بيروت', 'Asia/Kuwait': 'الكويت', 'Asia/Qatar': 'الدوحة', 'Africa/Khartoum': 'الخرطوم', 'Africa/Casablanca': 'الدار البيضاء', 'Africa/Lagos': 'لاغوس', 'Europe/London': 'لندن', 'Europe/Paris': 'باريس', 'Europe/Berlin': 'برلين', 'Europe/Moscow': 'موسكو', 'Europe/Istanbul': 'إستانبول', 'America/New_York': 'نيويورك', 'America/Chicago': 'شيكاغو', 'America/Los_Angeles': 'لوس أنجلوس', 'America/Sao_Paulo': 'ساو باولو', 'Asia/Karachi': 'كراتشي', 'Asia/Kolkata': 'دلهي', 'Asia/Jakarta': 'جاكرتا', 'Asia/Kuala_Lumpur': 'كوالالمبور', 'Asia/Tokyo': 'طوكيو', 'Asia/Shanghai': 'شنغهاي', 'Australia/Sydney': 'سيدني', 'Pacific/Auckland': 'أوكلاند', 'UTC': 'التوقيت العالمي' };
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const localISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const dt = f.inp({ type: 'datetime-local', value: localISO });
      const from = f.select({ options: zones.map((z) => [z, AR[z] || z]), value: 'Asia/Aden' });
      const to = f.select({ options: zones.map((z) => [z, AR[z] || z]), value: 'Europe/London' });
      const res = f.out({ filename: 'timezones.txt' });

      const offsetMin = (date, tz) => {
        const dtf = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const p = dtf.formatToParts(date).reduce((a, x) => (a[x.type] = x.value, a), {});
        return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - date.getTime()) / 60000;
      };
      const zonedToUtc = (local, tz) => {
        const [d, tm] = local.split('T');
        const [y, m, dd] = d.split('-').map(Number);
        const [hh, mm] = (tm || '00:00').split(':').map(Number);
        const guess = Date.UTC(y, m - 1, dd, hh, mm);
        let off = offsetMin(new Date(guess), tz);
        let ts = guess - off * 60000;
        off = offsetMin(new Date(ts), tz);
        return new Date(guess - off * 60000);
      };
      const fmtIn = (date, tz) => new Intl.DateTimeFormat('ar-EG', { timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
      const run = () => {
        try {
          const utc = zonedToUtc(dt.value, from.value);
          const diff = (offsetMin(utc, to.value) - offsetMin(utc, from.value)) / 60;
          const rows = ['Europe/London', 'Asia/Riyadh', 'Asia/Aden', 'America/New_York', 'Asia/Tokyo']
            .filter((z, i, a) => a.indexOf(z) === i)
            .map((z) => '  • ' + (AR[z] || z).padEnd(14) + fmtIn(utc, z));
          res.set([
            'الوقت في المصدر: ' + fmtIn(utc, from.value),
            'الوقت في الهدف : ' + fmtIn(utc, to.value),
            '',
            'الفرق: ' + (diff >= 0 ? '+' : '') + diff + ' ساعة',
            'التوقيت العالمي (UTC): ' + utc.toISOString().replace('T', ' ').slice(0, 16),
            '',
            '— في مدن مختارة —', ...rows
          ].join('\n'));
        } catch (e) { res.set('❌ ' + e.message); }
      };
      [dt, from, to].forEach((x) => x.addEventListener('input', run));
      [from, to].forEach((x) => x.addEventListener('change', run));
      root.append(
        f.grid(f.field('التاريخ والوقت', dt), f.field('من منطقة', from), f.field('إلى منطقة', to)),
        f.row(f.btn('🕐 الآن', () => { const n = new Date(); dt.value = `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}T${pad(n.getHours())}:${pad(n.getMinutes())}`; run(); }, 'ghost')),
        res.el
      );
      run();
    }
  });

  /* ---------- الطابع الزمني ---------- */
  t({
    id: 'unix-timestamp', cat: 'convert', icon: '🕰️', title: 'محوّل الطابع الزمني (Unix)',
    desc: 'يحوّل بين الطابع الزمني والتاريخ في الاتجاهين',
    render: function (root) {
      const tsInp = f.inp({ value: String(Math.floor(Date.now() / 1000)), dir: 'ltr' });
      const dtInp = f.inp({ type: 'datetime-local', value: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) });
      const res = f.out({ filename: 'timestamp.txt' });
      const show = (ms) => {
        const d = new Date(ms);
        if (isNaN(d)) { res.set('❌ قيمة غير صالحة'); return; }
        res.set([
          'التاريخ المحلي : ' + d.toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'medium' }),
          'UTC            : ' + d.toUTCString(),
          'ISO 8601       : ' + d.toISOString(),
          'ثواني          : ' + Math.floor(ms / 1000),
          'ملي ثانية      : ' + ms,
          'اليوم من الأسبوع: ' + d.toLocaleDateString('ar-EG', { weekday: 'long' }),
          'منذ الآن       : ' + rel(d)
        ].join('\n'));
      };
      const rel = (d) => {
        const s = (Date.now() - d.getTime()) / 1000;
        const a = Math.abs(s);
        const txt = a < 60 ? Math.round(a) + ' ثانية' : a < 3600 ? Math.round(a / 60) + ' دقيقة' : a < 86400 ? Math.round(a / 3600) + ' ساعة' : Math.round(a / 86400) + ' يوم';
        return s >= 0 ? 'قبل ' + txt : 'بعد ' + txt;
      };
      root.append(
        f.grid(f.field('الطابع الزمني (ثواني)', tsInp, 'أرقام فقط'), f.field('أو التاريخ', dtInp, 'يظهر الطابع الزمني له')),
        f.row(
          f.btn('ثواني → تاريخ', () => show(Number(tsInp.value) * 1000), 'primary'),
          f.btn('مللي ثانية → تاريخ', () => show(Number(tsInp.value)), 'primary'),
          f.btn('تاريخ → طابع', () => res.set('الطابع الزمني (ثواني): ' + Math.floor(new Date(dtInp.value).getTime() / 1000) + '\n(ملي ثانية): ' + new Date(dtInp.value).getTime()), 'primary'),
          f.btn('الآن', () => { tsInp.value = String(Math.floor(Date.now() / 1000)); show(Date.now()); }, 'ghost')
        ),
        res.el
      );
      show(Date.now());
    }
  });

  /* ---------- ميلادي ↔ هجري ---------- */
  t({
    id: 'hijri-date', cat: 'convert', icon: '🌙', title: 'محوّل التاريخ الهجري والميلادي',
    desc: 'تحويل دقيق بين التقويمين (أم القرى) بالإتجاهين',
    render: function (root) {
      const today = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const gInp = f.inp({ type: 'date', value: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}` });
      const hY = f.inp({ type: 'number', value: '', placeholder: 'السنة الهجرية' });
      const hM = f.inp({ type: 'number', value: '', placeholder: 'الشهر (1-12)' });
      const hD = f.inp({ type: 'number', value: '', placeholder: 'اليوم (1-30)' });
      const res = f.out({ filename: 'hijri.txt' });
      const hijriFmt = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
      const gregFmt = new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
      const parts = (d, cal) => {
        const dtf = new Intl.DateTimeFormat('en-u-ca-' + cal, { year: 'numeric', month: 'numeric', day: 'numeric' });
        const p = dtf.formatToParts(d).reduce((a, x) => (a[x.type] = x.value, a), {});
        return [+p.year, +p.month, +p.day];
      };
      const toHijri = () => {
        const d = new Date(gInp.value + 'T12:00:00');
        if (isNaN(d)) { res.set('❌ تاريخ غير صالح'); return; }
        const [y, m, dd] = parts(d, 'islamic-umalqura');
        const [gy, gm, gd] = [d.getFullYear(), d.getMonth() + 1, d.getDate()];
        res.set([
          '📅 الميلادي : ' + gregFmt.format(d) + '  (' + gy + '/' + gm + '/' + gd + ')',
          '🌙 الهجري  : ' + hijriFmt.format(d) + '  (' + y + '/' + m + '/' + dd + ')',
          '',
          'لتقويم أم القرى — قد يختلف يوماً عن الرؤية المحلية.',
          'الطابع الزمني: ' + Math.floor(d.getTime() / 1000)
        ].join('\n'));
      };
      const toGreg = () => {
        const y = Number(hY.value), m = Number(hM.value), d = Number(hD.value);
        if (!y || !m || !d) { res.set('أدخل السنة والشهر واليوم الهجري.'); return; }
        const target = new Date(Date.UTC(622 + Math.round(y * 0.970224), 0, 1));
        let found = null;
        for (let i = -4200; i <= 7200 && !found; i++) {
          const cand = new Date(Date.UTC(2000, 0, 1) + i * 86400000);
          const [hy, hm, hd] = parts(cand, 'islamic-umalqura');
          if (hy === y && hm === m && hd === d) found = cand;
        }
        if (!found) { res.set('لم يُعثر على التاريخ (تأكد من صحة اليوم والشهر).'); return; }
        const g = new Date(found.getTime() + 12 * 3600000);
        res.set([
          '🌙 الهجري  : ' + y + '/' + m + '/' + d,
          '📅 الميلادي: ' + gregFmt.format(g),
          '   (' + g.getUTCFullYear() + '/' + (g.getUTCMonth() + 1) + '/' + g.getUTCDate() + ')',
          '',
          'لتقويم أم القرى — قد يختلف يوماً عن الرؤية المحلية.'
        ].join('\n'));
      };
      root.append(
        f.field('تاريخ ميلادي', gInp),
        f.row(f.btn('ميلادي → هجري', toHijri, 'primary'), f.btn('اليوم', () => { gInp.value = new Date().toISOString().slice(0, 10); toHijri(); }, 'ghost')),
        f.grid(f.field('سنة هجرية', hY), f.field('شهر', hM), f.field('يوم', hD)),
        f.row(f.btn('هجري → ميلادي', toGreg, 'primary')),
        res.el
      );
      toHijri();
    }
  });

  /* ---------- الأرقام الرومانية ---------- */
  t({
    id: 'roman-numerals', cat: 'convert', icon: '🏺', title: 'محوّل الأرقام الرومانية',
    desc: 'يحوّل الأرقام إلى رومانية والعكس',
    render: function (root) {
      const R = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
      const toRoman = (n) => {
        if (n < 1 || n > 3999) throw new Error('المدى المسموح 1 إلى 3999');
        let out = '';
        R.forEach(([v, s]) => { while (n >= v) { out += s; n -= v; } });
        return out;
      };
      const fromRoman = (s) => {
        const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
        const str = s.toUpperCase().replace(/[^IVXLCDM]/g, '');
        if (!str) throw new Error('لا توجد أرقام رومانية صالحة');
        let total = 0;
        for (let i = 0; i < str.length; i++) {
          const cur = map[str[i]], next = map[str[i + 1]] || 0;
          total += cur < next ? -cur : cur;
        }
        return total;
      };
      const i = f.inp({ value: '2026', dir: 'ltr' });
      const res = f.out({ filename: 'roman.txt', dir: 'ltr' });
      const run = () => {
        const v = i.value.trim().toUpperCase();
        try {
          if (/^[0-9]+$/.test(v)) {
            const n = Number(v);
            res.set(n + ' → ' + toRoman(n) + '\n\nالخطوات: ' + R.filter(([val]) => n >= val).map(([val, s]) => s + '=' + val).slice(0, 12).join(' + '));
          } else if (/^[IVXLCDM]+$/.test(v)) {
            res.set(v + ' → ' + fromRoman(v));
          } else res.set('أدخل رقماً (1-3999) أو رموزاً رومانية (IVXLCDM).');
        } catch (e) { res.set('❌ ' + e.message); }
      };
      i.addEventListener('input', f.debounce(run, 150));
      root.append(
        f.field('القيمة', i),
        f.row(f.btn('أعلى 20 رقماً كعيّنة', () => res.set([1, 4, 5, 9, 10, 14, 40, 44, 50, 90, 100, 400, 500, 900, 1000, 1990, 2024, 2025, 2026, 3999].map((n) => n + ' = ' + toRoman(n)).join('\n')), 'ghost')),
        res.el
      );
      run();
    }
  });

  /* ---------- الكسور والعشرية ---------- */
  t({
    id: 'fraction-decimal', cat: 'convert', icon: '½', title: 'محوّل الكسور والعشرية',
    desc: 'كبسور، عشري، ونسبة مئوية — مع تبسيط الكسر',
    render: function (root) {
      const i = f.inp({ value: '3/8', placeholder: 'مثال: 3/8 أو 0.375 أو 37.5%', dir: 'ltr' });
      const res = f.out({ filename: 'fraction.txt', dir: 'ltr' });
      const gcd = (a, b) => (b ? gcd(b, a % b) : a);
      const run = () => {
        let v = i.value.trim();
        try {
          let num, den = 1;
          if (v.includes('/')) {
            const [a, b] = v.split('/').map((x) => parseFloat(x));
            if (!isFinite(a) || !isFinite(b) || b === 0) throw new Error('كسر غير صالح');
            num = a; den = b;
          } else if (v.endsWith('%')) {
            num = parseFloat(v); den = 100;
          } else {
            const x = parseFloat(v);
            if (!isFinite(x)) throw new Error('قيمة غير صالحة');
            const dec = (String(x).split('.')[1] || '').length;
            num = Math.round(x * Math.pow(10, dec)); den = Math.pow(10, dec);
          }
          const value = num / den;
          const g = Math.abs(gcd(Math.round(num), Math.round(den))) || 1;
          res.set([
            'العشري    : ' + f.num(value, 6),
            'النسبة     : ' + f.num(value * 100, 4) + '%',
            'الكسر المبسّط: ' + (num / g) + '/' + (den / g),
            'الكسر الأصلي : ' + num + '/' + den,
            'النص       : ' + approx(num / den),
            'الجذر التقريبي: ' + f.num(value, 3) + ' ≈ ' + Math.round(value * 64) + '/64'
          ].join('\n'));
        } catch (e) { res.set('❌ ' + e.message); }
      };
      const approx = (x) => {
        const den = 64;
        const n = Math.round(x * den);
        const g = Math.abs(gcd(n, den)) || 1;
        return n / g + '/' + den / g;
      };
      i.addEventListener('input', f.debounce(run, 150));
      root.append(f.field('القيمة', i), res.el);
      run();
    }
  });

  /* ---------- العملات (يحتاج إنترنت) ---------- */
  t({
    id: 'currency-converter', cat: 'convert', icon: '💱', title: 'محوّل العملات',
    desc: 'أسعار صرف حقيقية محدَّثة (يحتاج اتصالاً بالإنترنت)',
    render: function (root) {
      const CUR = { USD: 'دولار أمريكي', SAR: 'ريال سعودي', YER: 'ريال يمني', AED: 'درهم إماراتي', EUR: 'يورو', GBP: 'جنيه إسترليني', EGP: 'جنيه مصري', KWD: 'دينار كويتي', QAR: 'ريال قطري', OMR: 'ريال عماني', BHD: 'دينار بحريني', JOD: 'دينار أردني', TRY: 'ليرة تركية', INR: 'روبية هندية', CNY: 'يوان صيني', JPY: 'ين ياباني', CHF: 'فرنك سويسري', CAD: 'دولار كندي', AUD: 'دولار أسترالي', SDG: 'جنيه سوداني', DZD: 'دينار جزائري', MAD: 'درهم مغربي', IQD: 'دينار عراقي', LBP: 'ليرة لبنانية', SYP: 'ليرة سورية', ETB: 'بير إثيوبي', DJF: 'فرنك جيبوتي', SOS: 'شلن صومالي' };
      const amt = f.inp({ type: 'number', value: 100, step: 'any' });
      const from = f.select({ options: Object.entries(CUR).map(([k, v]) => [k, k + ' — ' + v]), value: 'USD' });
      const to = f.select({ options: Object.entries(CUR).map(([k, v]) => [k, k + ' — ' + v]), value: 'YER' });
      const res = f.out({ filename: 'currency.txt' });
      let cache = null, cacheTime = 0;
      const run = async () => {
        res.set('⏳ جاري جلب أسعار الصرف…');
        try {
          if (!cache || Date.now() - cacheTime > 3600000) {
            const r = await fetch('https://open.er-api.com/v6/latest/USD');
            const j = await r.json();
            if (!j || !j.rates) throw new Error('رد غير متوقع من مزوّد الأسعار');
            cache = j.rates;
            cacheTime = Date.now();
          }
          const a = Number(amt.value) || 0;
          const usd = a / (cache[from.value] || 1);
          const outv = usd * (cache[to.value] || 1);
          const rows = ['USD', 'SAR', 'YER', 'AED', 'EUR', 'EGP'].map((c) => '  ' + c.padEnd(5) + f.num(usd * (cache[c] || 1), 4));
          res.set([
            f.num(a, 2) + ' ' + from.value + '  =  ' + f.num(outv, 2) + ' ' + to.value,
            '',
            'سعر الوحدة: 1 ' + from.value + ' = ' + f.num((cache[to.value] || 1) / (cache[from.value] || 1), 6) + ' ' + to.value,
            'عكسياً    : 1 ' + to.value + ' = ' + f.num((cache[from.value] || 1) / (cache[to.value] || 1), 6) + ' ' + from.value,
            '',
            '— قيمة ' + f.num(a, 2) + ' ' + from.value + ' بعملات أخرى —',
            ...rows,
            '',
            'آخر تحديث للأسعار: ' + (cache.__t || 'غير معروف') + ' · المصدر: open.er-api.com'
          ].join('\n'));
        } catch (e) {
          res.set('❌ تعذّر جلب أسعار الصرف (' + e.message + ').\nتأكد من الاتصال بالإنترنت. هذه الأداة تحتاج شبكة.');
        }
      };
      root.append(
        f.grid(f.field('المبلغ', amt), f.field('من', from), f.field('إلى', to)),
        f.row(f.btn('💱 حوّل', run, 'primary')),
        res.el
      );
      run();
    }
  });

  /* ---------- الترجمة (يحتاج إنترنت) ---------- */
  t({
    id: 'translate-text', cat: 'convert', icon: '🌐', title: 'ترجمة نص',
    desc: 'ترجمة فورية بين أكثر من 30 لغة (يحتاج اتصالاً)',
    render: function (root) {
      const LANGS = [['auto', 'اكتشاف تلقائي'], ['ar', 'العربية'], ['en', 'الإنجليزية'], ['fr', 'الفرنسية'], ['es', 'الإسبانية'], ['de', 'الألمانية'], ['tr', 'التركية'], ['ru', 'الروسية'], ['zh-CN', 'الصينية'], ['ja', 'اليابانية'], ['ko', 'الكورية'], ['hi', 'الهندية'], ['ur', 'الأردية'], ['fa', 'الفارسية'], ['id', 'الإندونيسية'], ['ms', 'الملايوية'], ['it', 'الإيطالية'], ['pt', 'البرتغالية'], ['nl', 'الهولندية'], ['pl', 'البولندية'], ['sv', 'السويدية'], ['he', 'العبرية'], ['th', 'التايلاندية'], ['vi', 'الفيتنامية'], ['bn', 'البنغالية'], ['ta', 'التاميلية'], ['sw', 'السواحيلية'], ['am', 'الأمهرية'], ['so', 'الصومالية'], ['el', 'اليونانية'], ['uk', 'الأوكرانية']];
      const ta = f.area({ rows: 6, placeholder: 'اكتب النص المراد ترجمته…' });
      const from = f.select({ options: LANGS, value: 'auto' });
      const to = f.select({ options: LANGS.filter((l) => l[0] !== 'auto'), value: 'en' });
      const res = f.out({ filename: 'translation.txt' });
      const btn = f.btn('🌐 ترجم', async () => {
        const text = ta.value.trim();
        if (!text) { res.set('اكتب نصاً أولاً.'); return; }
        res.set('⏳ جاري الترجمة…');
        const targets = [
          async () => {
            const r = await fetch('/api/translate?s=' + encodeURIComponent(from.value) + '&t=' + encodeURIComponent(to.value) + '&q=' + encodeURIComponent(text));
            const j = await r.json().catch(() => null);
            if (!r.ok || !j || !j.ok) throw new Error((j && j.message) || ('HTTP ' + r.status));
            return { text: j.text, src: j.src, engine: j.engine };
          },
          async () => {
            // مخمّن لغة المصدر عند الاكتشاف التلقائي (MyMemory لا يدعم auto)
            const guess = (() => {
              if (/[\u0600-\u06FF]/.test(text)) return 'ar';
              if (/[\u0400-\u04FF]/.test(text)) return 'ru';
              if (/[\u4E00-\u9FFF]/.test(text)) return 'zh-CN';
              if (/[\u3040-\u30FF]/.test(text)) return 'ja';
              if (/\b(der|die|das|und|ist|nicht|ich)\b/i.test(text)) return 'de';
              if (/\b(le|la|les|est|vous|merci)\b/i.test(text)) return 'fr';
              if (/\b(el|los|que|para|hola)\b/i.test(text)) return 'es';
              return 'en';
            })();
            let fsrc = from.value === 'auto' ? guess : from.value;
            if (fsrc === to.value) fsrc = to.value === 'ar' ? 'en' : 'ar';
            const u = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text.slice(0, 480)) + '&langpair=' + encodeURIComponent(fsrc + '|' + to.value);
            const r = await fetch(u);
            const j = await r.json();
            const t2 = j && j.responseData && j.responseData.translatedText;
            if (!t2 || /^PLEASE SELECT/i.test(t2)) throw new Error('لا ترجمة');
            return { text: t2, src: fsrc, engine: 'mymemory (مباشر)' };
          }
        ];
        let done = null, errs = [];
        for (const fn of targets) {
          try { done = await fn(); break; } catch (e) { errs.push(e.message); }
        }
        if (done) res.set('✅ الترجمة:\n' + done.text + '\n\n— الأصل —\n' + text + '\n\nاللغة المكتشفة: ' + done.src + '  ·  المصدر: ' + (done.engine || '—'));
        else res.set('❌ تعذّرت الترجمة. تأكد من الاتصال بالإنترنت (هذه الأداة تحتاج شبكة).\n' + (errs.length ? 'التفاصيل: ' + errs.join(' | ') : ''));
      }, 'primary');
      root.append(
        f.grid(f.field('من لغة', from), f.field('إلى لغة', to)),
        f.field('النص', ta),
        f.row(btn, f.btn('🔊 استمع للترجمة', () => {
          const txt = (res.value || '').replace(/^✅ الترجمة:\n/, '').split('\n\n— الأصل —')[0];
          if (!txt) { f.toast('لا يوجد نص لقراءته', 'err'); return; }
          if (!window.speechSynthesis) { f.toast('المتصفح لا يدعم النطق', 'err'); return; }
          const u = new SpeechSynthesisUtterance(txt);
          u.lang = to.value === 'zh-CN' ? 'zh-CN' : to.value;
          speechSynthesis.speak(u);
        }, 'ghost')),
        res.el
      );
    }
  });

  /* ---------- النسبة والتناسب ---------- */
  t({
    id: 'ratio-proportion', cat: 'convert', icon: '⚖️', title: 'محوّل النسب والتناسب',
    desc: 'يبسّط النسب ويحل مسائل التناسب الثلاثية',
    render: f.calcTool({
      fields: [
        { id: 'r1', label: 'البسط 1', type: 'number', value: 16 },
        { id: 'r2', label: 'المقام 1', type: 'number', value: 24 }
      ],
      live: true,
      filename: 'ratio.txt',
      run: (v) => {
        const gcd = (a, b) => (b ? gcd(b, a % b) : a);
        const a = Math.abs(Number(v.r1)) || 0, b = Math.abs(Number(v.r2)) || 1;
        const g = gcd(a, b) || 1;
        const rows = [];
        for (const m of [1, 2, 3, 4, 5, 10, 100]) rows.push(`  ${m} : ${f.num((a / b) * m, 4)}`);
        return [
          'النسبة      : ' + a + ' : ' + b,
          'مبسّطة     : ' + (a / g) + ' : ' + (b / g),
          'ككسر       : ' + (a / g) + '/' + (b / g),
          'كعشري      : ' + f.num(a / b, 6),
          'كنسبة مئوية : ' + f.num((a / b) * 100, 3) + '%',
          '',
          '— جداول التناسب —', ...rows
        ].join('\n');
      }
    })
  });

  /* ---------- فرق التواريخ بالأيام/الأسابيع ---------- */
  t({
    id: 'date-units', cat: 'convert', icon: '🗓️', title: 'التاريخ بوحدات مختلفة',
    desc: 'كم يوماً وأسبوعاً وشهراً وسنةً يمثل تاريخ معيّن',
    render: function (root) {
      const d = f.inp({ type: 'date', value: new Date().toISOString().slice(0, 10) });
      const res = f.out({ filename: 'date-units.txt' });
      const run = () => {
        const dt = new Date(d.value + 'T12:00:00');
        if (isNaN(dt)) { res.set('تاريخ غير صالح'); return; }
        const days = Math.floor((Date.now() - dt.getTime()) / 86400000);
        res.set([
          'التاريخ: ' + dt.toLocaleDateString('ar-EG', { dateStyle: 'full' }),
          '',
          'مضى منذ ذلك التاريخ:',
          '  • ' + f.num(days, 0) + ' يوم',
          '  • ' + f.num(days / 7, 2) + ' أسبوع',
          '  • ' + f.num(days / 30.4375, 2) + ' شهر',
          '  • ' + f.num(days / 365.25, 2) + ' سنة',
          '  • ' + f.num(days * 24, 0) + ' ساعة',
          '  • ' + f.num(days * 1440, 0) + ' دقيقة',
          '',
          'من اليوم حتى ذلك التاريخ:',
          '  • ' + f.num(-days, 0) + ' يوم'
        ].join('\n'));
      };
      d.addEventListener('input', run);
      root.append(f.field('اختر تاريخاً', d), res.el);
      run();
    }
  });
})();
