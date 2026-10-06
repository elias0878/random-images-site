/* ============================================================
   tools/time.js — الوقت والتاريخ (8 أدوات)
   ============================================================ */
(function () {
  'use strict';
  const t = f.tool;
  const pad = (n) => String(n).padStart(2, '0');
  const hms = (ms) => {
    const s = Math.floor(ms / 1000);
    return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor((s % 3600) / 60)) + ':' + pad(s % 60);
  };
  const beep = (times) => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ac = new Ctx();
      let i = 0;
      const n = times || 3;
      const play = () => {
        if (i >= n) { ac.close(); return; }
        const o = ac.createOscillator(), g = ac.createGain();
        o.frequency.value = 880;
        o.type = 'sine';
        g.gain.setValueAtTime(0.001, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.3, ac.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.28);
        o.connect(g).connect(ac.destination);
        o.start();
        o.stop(ac.currentTime + 0.3);
        i++;
        setTimeout(play, 450);
      };
      play();
    } catch (e) { /* الصوت اختياري */ }
  };

  /* ============ 1) ساعة الإيقاف ============ */
  t({
    id: 'stopwatch', cat: 'time', icon: '⏱️', title: 'ساعة إيقاف مع لفّات',
    desc: 'قياس المدد بدقة مع تسجيل اللفّات والفرق بين كل لفّة',
    render: function (root) {
      let t0 = 0, elapsed = 0, timer = null;
      const laps = [];
      const disp = f.el('div', { class: 'big-time', dir: 'ltr', text: '00:00:00.00' });
      const list = f.el('div', { class: 'out-pre', dir: 'ltr' });
      const paint = () => {
        const ms = elapsed + (timer ? Date.now() - t0 : 0);
        disp.textContent = pad(Math.floor(ms / 3600000)) + ':' + pad(Math.floor(ms / 60000) % 60) + ':' + pad(Math.floor(ms / 1000) % 60) + '.' + String(ms % 1000).padStart(3, '0').slice(0, 2);
      };
      const start = () => {
        if (timer) return;
        t0 = Date.now();
        timer = setInterval(paint, 40);
        paint();
      };
      const stop = () => {
        if (!timer) return;
        elapsed += Date.now() - t0;
        clearInterval(timer);
        timer = null;
        paint();
      };
      const lap = () => {
        const ms = elapsed + (timer ? Date.now() - t0 : 0);
        laps.push(ms);
        const prev = laps.length > 1 ? laps[laps.length - 2] : 0;
        list.textContent = laps.map((l, i) => `لفّة ${String(i + 1).padStart(2)}: ${hms(l)}.${String(l % 1000).padStart(3, '0').slice(0, 2)}   (+${hms(l - prev > 0 ? (laps[i] - (laps[i - 1] || 0)) : 0).slice(3)}.${String((laps[i] - (laps[i - 1] || 0)) % 1000).padStart(3, '0').slice(0, 2)})`).reverse().join('\n');
      };
      const reset = () => {
        stop(); elapsed = 0; laps.length = 0; list.textContent = ''; paint();
      };
      paint();
      root.append(disp,
        f.row(
          f.btn('▶️ ابدأ', () => { start(); f.toast('بدأ العد'); }, 'primary'),
          f.btn('⏸️ إيقاف مؤقت', stop),
          f.btn('🏁 لفّة', lap, 'ghost'),
          f.btn('🔄 تصفير', reset, 'ghost')),
        list,
        f.note('يعمل بدقة أعشار الثانية. يمكنك الاستمرار بعد الإيقاف المؤقت.'));
    }
  });

  /* ============ 2) مؤقّت تنازلي ============ */
  t({
    id: 'countdown-timer', cat: 'time', icon: '⏳', title: 'مؤقّت تنازلي',
    desc: 'عدّاد تنازلي مع تنبيه صوتي وإشعار عند انتهاء الوقت',
    render: function (root) {
      const hInp = f.inp({ type: 'number', value: 0, min: 0, max: 99 });
      const mInp = f.inp({ type: 'number', value: 5, min: 0, max: 59 });
      const sInp = f.inp({ type: 'number', value: 0, min: 0, max: 59 });
      const label = f.inp({ placeholder: 'اسم المؤقّت (مثال: الشاي)', value: '' });
      const disp = f.el('div', { class: 'big-time', dir: 'ltr', text: '00:05:00' });
      const bar = f.el('div', { class: 'bar' }, f.el('div', { class: 'bar-in', style: { width: '100%' } }));
      const warn = f.select({ options: [['none', 'بلا تنبيه'], ['beep', 'تنبيه صوتي'], ['beep+notif', 'صوت + إشعار سطح المكتب']], value: 'beep' });
      let timer = null, endAt = 0, total = 0;
      const setDisp = () => {
        const left = Math.max(0, endAt - Date.now());
        disp.textContent = pad(Math.floor(left / 3600000)) + ':' + pad(Math.floor(left / 60000) % 60) + ':' + pad(Math.floor(left / 1000) % 60);
        if (total) bar.querySelector('.bar-in').style.width = Math.max(0, (left / total) * 100) + '%';
        if (endAt && left <= 0) finish();
      };
      const finish = () => {
        clearInterval(timer);
        timer = null;
        disp.textContent = '00:00:00';
        disp.style.color = '#e5484d';
        document.title = '⏰ انتهى الوقت!';
        if (warn.value !== 'none') beep(4);
        if (warn.value === 'beep+notif' && window.Notification) {
          if (Notification.permission === 'granted') new Notification('⏰ ' + (label.value || 'انتهى الوقت'));
          else Notification.requestPermission().then((p) => { if (p === 'granted') new Notification('⏰ ' + (label.value || 'انتهى الوقت')); });
        }
        f.toast('⏰ انتهى الوقت: ' + (label.value || 'المؤقّت'), 'ok');
      };
      const start = () => {
        const secs = Number(hInp.value || 0) * 3600 + Number(mInp.value || 0) * 60 + Number(sInp.value || 0);
        if (secs <= 0) { f.toast('حدّد وقتاً أكبر من صفر', 'err'); return; }
        total = secs * 1000;
        endAt = Date.now() + total;
        disp.style.color = '';
        clearInterval(timer);
        timer = setInterval(setDisp, 100);
        setDisp();
        f.toast('بدأ العد التنازلي');
      };
      const pause = () => { if (timer) { clearInterval(timer); timer = null; total = Math.max(1, endAt - Date.now()); f.toast('إيقاف مؤقت'); } };
      const resume = () => { if (!timer && total) { endAt = Date.now() + (endAt - Date.now() > 0 ? endAt - Date.now() : total); timer = setInterval(setDisp, 100); } };
      const reset = () => { clearInterval(timer); timer = null; endAt = 0; disp.style.color = ''; document.title = 'أدوات سريعة'; setDisp(); };

      root.append(
        f.grid(f.field('ساعات', hInp), f.field('دقائق', mInp), f.field('ثواني', sInp)),
        f.field('تسمية', label),
        f.el('div', { class: 'presets' },
          ...[['1 دقيقة', 0, 1, 0], ['5 دقائق', 0, 5, 0], ['10 دقائق', 0, 10, 0], ['25 دقيقة (بومودورو)', 0, 25, 0], ['30 دقيقة', 0, 30, 0], ['ساعة', 1, 0, 0]].map(([n, h, m, s]) =>
            f.btn(n, () => { hInp.value = h; mInp.value = m; sInp.value = s; start(); }, 'ghost'))),
        f.field('التنبيه', warn),
        disp, bar,
        f.row(f.btn('▶️ ابدأ', start, 'primary'), f.btn('⏸️ إيقاف', pause), f.btn('↩️ استئناف', resume), f.btn('🔄 تصفير', reset, 'ghost'))
      );
      setDisp();
    }
  });

  /* ============ 3) بومودورو ============ */
  t({
    id: 'pomodoro', cat: 'time', icon: '🍅', title: 'مؤقّت بومودورو للتركيز',
    desc: 'دورات عمل وراحة تلقائية مع عدّاد جلسات وتعليمات للانتقال',
    render: function (root) {
      const work = f.inp({ type: 'number', value: 25, min: 1, max: 120 });
      const brk = f.inp({ type: 'number', value: 5, min: 1, max: 60 });
      const longBrk = f.inp({ type: 'number', value: 15, min: 1, max: 90 });
      const disp = f.el('div', { class: 'big-time', dir: 'ltr', text: '25:00' });
      const phase = f.el('div', { class: 'phase', text: 'جاهز للبدء' });
      const stats = f.el('div', { class: 'out-pre', dir: 'rtl', text: 'الجلسات المكتملة: 0' });
      const bar = f.el('div', { class: 'bar' }, f.el('div', { class: 'bar-in', style: { width: '0%' } }));
      let timer = null, endAt = 0, total = 0, isWork = true, done = 0, running = false;
      const paint = () => {
        const left = Math.max(0, endAt - Date.now());
        disp.textContent = pad(Math.floor(left / 60000)) + ':' + pad(Math.floor((left % 60000) / 1000));
        if (total) bar.querySelector('.bar-in').style.width = (100 - (left / total) * 100) + '%';
      };
      const nextPhase = () => {
        clearInterval(timer);
        timer = null;
        beep(3);
        if (isWork) {
          done++;
          stats.textContent = `الجلسات المكتملة: ${done}\nالراحات القصيرة: ${Math.floor(done / 4)}`;
          isWork = false;
          const mins = done % 4 === 0 ? Number(longBrk.value) : Number(brk.value);
          f.toast('✅ انتهت جلسة العمل — خذ راحة ' + mins + ' دقيقة', 'ok');
          startPhase(mins * 60, false);
        } else {
          isWork = true;
          f.toast('💪 انتهت الراحة — ابدأ جلسة عمل', 'ok');
          startPhase(Number(work.value) * 60, true);
        }
      };
      const startPhase = (secs, work_) => {
        total = secs * 1000;
        endAt = Date.now() + total;
        phase.textContent = work_ ? '🎯 وقت العمل' : '☕ وقت الراحة';
        disp.style.color = work_ ? '' : '#3aa76d';
        timer = setInterval(() => {
          paint();
          if (Date.now() >= endAt) nextPhase();
        }, 200);
        running = true;
        paint();
      };
      const start = () => { isWork = true; startPhase(Number(work.value) * 60, true); };
      const stop = () => { clearInterval(timer); timer = null; running = false; phase.textContent = 'متوقف مؤقتاً'; };
      const reset = () => { stop(); done = 0; isWork = true; total = 0; stats.textContent = 'الجلسات المكتملة: 0'; disp.textContent = pad(Number(work.value)) + ':00'; disp.style.color = ''; phase.textContent = 'جاهز للبدء'; bar.querySelector('.bar-in').style.width = '0%'; };
      root.append(
        f.grid(f.field('مدة العمل (دقيقة)', work), f.field('راحة قصيرة', brk), f.field('راحة طويلة (كل 4)', longBrk)),
        disp, phase, bar,
        f.row(f.btn('▶️ ابدأ', start, 'primary'), f.btn('⏸️ إيقاف', stop), f.btn('🔄 تصفير', reset, 'ghost')),
        stats,
        f.note('كل 4 جلسات عمل تأخذ راحة طويلة تلقائياً. اترك التبويب مفتوحاً — المؤقّت يعمل في الخلفية.')
      );
      reset();
      void running;
    }
  });

  /* ============ 4) ساعات العالم ============ */
  t({
    id: 'world-clock', cat: 'time', icon: '🌍', title: 'ساعات المدن الحيّة',
    desc: 'الوقت الآن في 20 مدينة مع فرق التوقيت وليل/نهار',
    render: function (root) {
      const ZONES = [
        ['Asia/Aden', 'صنعاء', 'اليمن'], ['Asia/Riyadh', 'الرياض', 'السعودية'], ['Asia/Dubai', 'دبي', 'الإمارات'],
        ['Asia/Qatar', 'الدوحة', 'قطر'], ['Asia/Kuwait', 'الكويت', 'الكويت'], ['Asia/Muscat', 'مسقط', 'عُمان'],
        ['Asia/Baghdad', 'بغداد', 'العراق'], ['Asia/Amman', 'عمّان', 'الأردن'], ['Asia/Beirut', 'بيروت', 'لبنان'],
        ['Asia/Damascus', 'دمشق', 'سوريا'], ['Asia/Gaza', 'غزة', 'فلسطين'], ['Africa/Cairo', 'القاهرة', 'مصر'],
        ['Africa/Khartoum', 'الخرطوم', 'السودان'], ['Africa/Casablanca', 'الدار البيضاء', 'المغرب'],
        ['Europe/Istanbul', 'إستانبول', 'تركيا'], ['Europe/London', 'لندن', 'بريطانيا'], ['Europe/Paris', 'باريس', 'فرنسا'],
        ['Europe/Moscow', 'موسكو', 'روسيا'], ['America/New_York', 'نيويورك', 'أمريكا'], ['Asia/Tokyo', 'طوكيو', 'اليابان'],
        ['Asia/Karachi', 'كراتشي', 'باكستان'], ['Asia/Kolkata', 'دلهي', 'الهند'], ['Asia/Jakarta', 'جاكرتا', 'إندونيسيا'],
        ['Australia/Sydney', 'سيدني', 'أستراليا']
      ];
      const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const grid = f.el('div', { class: 'tz-grid' });
      const dateLine = f.el('div', { class: 'note' });
      const tick = () => {
        const now = new Date();
        dateLine.textContent = '🕐 الآن: ' + new Intl.DateTimeFormat('ar-EG', { dateStyle: 'full', timeStyle: 'medium' }).format(now) + '  ·  منطقتك: ' + local;
        grid.replaceChildren(...ZONES.map(([tz, city, country]) => {
          let time = '—', hour = 0, isDay = true, diff = 0;
          try {
            time = new Intl.DateTimeFormat('ar-EG', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(now);
            hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', hour12: false }).format(now));
            const off = (d, z) => {
              const p = new Intl.DateTimeFormat('en-US', { timeZone: z, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(d).reduce((a, x) => (a[x.type] = x.value, a), {});
              return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute) - d.getTime();
            };
            diff = Math.round((off(now, tz) - off(now, local)) / 3600000);
            isDay = hour >= 6 && hour < 18;
          } catch (e) { /* منطقة غير مدعومة */ }
          return f.el('div', { class: 'tz-card', title: country },
            f.el('div', { class: 'tz-city', text: (isDay ? '☀️ ' : '🌙 ') + city }),
            f.el('div', { class: 'tz-time', dir: 'ltr', text: time }),
            f.el('div', { class: 'hint', text: (diff === 0 ? 'نفس توقيتك' : (diff > 0 ? '+' : '') + diff + ' ساعة') + ' · ' + country }));
        }));
      };
      tick();
      const iv = setInterval(tick, 1000);
      root.append(dateLine, grid, f.note('التحديث كل ثانية حسب توقيت منطقتك. تصحيح التوقيت الصيفي تلقائي حسب قواعد كل دولة.' ));
      window.addEventListener('beforeunload', () => clearInterval(iv));
    }
  });

  /* ============ 5) جمع وطرح المدد ============ */
  t({
    id: 'duration-math', cat: 'time', icon: '🧮', title: 'جمع وطرح المدد الزمنية',
    desc: 'اجمع قائمة أوقات (ساعات:دقائق) واحصل على المجموع والمتوسط — مناسب لتقارير العمل',
    render: function (root) {
      const ta = f.area({ rows: 8, value: '8:30\n7:45\n9:15\n8:00\n6:20', dir: 'ltr', placeholder: 'سطر لكل مدة، مثال:\n8:30\n7:45\n90  (دقائق فقط)\n2:15:30 (س:د:ث)' });
      const mode = f.select({ options: [['col', 'مجموع عمودي (+ كل السطور)'], ['rate', 'مجموع × أجر الساعة'], ['avg', 'المتوسط فقط']], value: 'col' });
      const rate = f.inp({ type: 'number', value: 0, step: 'any', placeholder: 'أجر الساعة (اختياري)' });
      const res = f.out({ filename: 'durations.txt' });
      const run = () => {
        const lines = ta.value.split('\n').map((s) => s.trim()).filter(Boolean);
        const secs = [];
        const bad = [];
        lines.forEach((ln) => {
          const parts = ln.split(':').map((p) => p.trim());
          let s = 0, ok = true;
          if (parts.length === 1) { const n = Number(parts[0]); if (isFinite(n)) s = n * 60; else ok = false; }
          else if (parts.length === 2) { const [h, m] = parts.map(Number); if (isFinite(h) && isFinite(m)) s = h * 3600 + m * 60; else ok = false; }
          else if (parts.length === 3) { const [h, m, ss] = parts.map(Number); if (isFinite(h) && isFinite(m) && isFinite(ss)) s = h * 3600 + m * 60 + ss; else ok = false; }
          else ok = false;
          if (ok) secs.push(s); else bad.push(ln);
        });
        if (!secs.length) { res.set('لا توجد مدد صحيحة. اكتب هكذا: 8:30'); return; }
        const total = secs.reduce((a, b) => a + b, 0);
        const hh = Math.floor(total / 3600), mm = Math.floor((total % 3600) / 60), ss = total % 60;
        const lines2 = [
          'عدد المدد: ' + secs.length,
          '⏱️ المجموع: ' + hh + ':' + pad(mm) + ':' + pad(ss),
          '   بالعربي: ' + hh + ' ساعة و' + mm + ' دقيقة' + (ss ? ' و' + ss + ' ثانية' : ''),
          '   بالدقائق: ' + f.num(total / 60, 2) + ' دقيقة',
          '   بالساعات: ' + f.num(total / 3600, 4) + ' ساعة',
          '   بالأيام: ' + f.num(total / 86400, 4),
          '',
          'المتوسط: ' + f.num(total / secs.length / 60, 2) + ' دقيقة (' + f.num(total / secs.length / 3600, 3) + ' ساعة)',
          'الأطول: ' + f.num(Math.max(...secs) / 60, 2) + ' دقيقة',
          'الأقصر: ' + f.num(Math.min(...secs) / 60, 2) + ' دقيقة'
        ];
        if (Number(rate.value) > 0) {
          const wage = (total / 3600) * Number(rate.value);
          lines2.push('', '💰 الأجر: ' + f.num(wage, 2) + '  (' + f.num(total / 3600, 4) + ' ساعة × ' + f.num(rate.value, 2) + ')');
          lines2.push('   أجر الدقيقة: ' + f.num(Number(rate.value) / 60, 4));
        }
        if (mode.value === 'avg') lines2.splice(1, 7, '⏱️ المتوسط: ' + f.num(total / secs.length / 3600, 4) + ' ساعة لكل مدة');
        if (bad.length) lines2.push('', '⚠️ سطور لم تُقرأ: ' + bad.join(' | '));
        res.set(lines2.join('\n'));
      };
      ta.addEventListener('input', f.debounce(run, 250));
      [mode, rate].forEach((el2) => el2.addEventListener('input', run));
      root.append(f.field('المدد (سطر لكل مدة)', ta), f.grid(f.field('العملية', mode), f.field('أجر الساعة', rate)), res.el);
      run();
    }
  });

  /* ============ 6) ساعات العمل والراتب ============ */
  t({
    id: 'work-hours', cat: 'time', icon: '💼', title: 'حاسبة ساعات العمل والراتب',
    desc: 'من وقت الحضور والانصراف إلى صافي ساعات العمل والأجر مع الإضافي',
    render: f.calcTool({
      fields: [
        { id: 'in', label: 'وقت الحضور', type: 'time', value: '08:00' },
        { id: 'out', label: 'وقت الانصراف', type: 'time', value: '17:00' },
        { id: 'brk', label: 'الراحة (دقيقة)', type: 'number', value: 60 },
        { id: 'wage', label: 'أجر الساعة', type: 'number', value: 0, step: 'any' },
        { id: 'standard', label: 'ساعات العمل الرسمية', type: 'number', value: 8, step: 'any' },
        { id: 'ot', label: 'معامل الأجر الإضافي', type: 'number', value: 1.5, step: 'any' },
        { id: 'days', label: 'عدد أيام العمل شهرياً', type: 'number', value: 26 }
      ],
      live: true, filename: 'work-hours.txt',
      run: (v) => {
        const [ih, im] = String(v.in).split(':').map(Number);
        const [oh, om] = String(v.out).split(':').map(Number);
        if ([ih, im, oh, om].some((n) => isNaN(n))) return 'أدخل وقت الحضور والانصراف.';
        let mins = (oh * 60 + om) - (ih * 60 + im);
        let overnight = false;
        if (mins < 0) { mins += 1440; overnight = true; }
        const gross = mins / 60;
        const net = Math.max(0, gross - Number(v.brk) / 60);
        const std = Number(v.standard) || 8;
        const otH = Math.max(0, net - std);
        const wage = Number(v.wage) || 0;
        const otRate = Number(v.ot) || 1.5;
        const pay = (net > otH ? Math.min(net, std) : net) * wage + otH * wage * otRate;
        const rows = [
          'وقت الحضور: ' + v.in + '  ·  الانصراف: ' + v.out + (overnight ? '  (الانصراف في اليوم التالي 🌙)' : ''),
          'المدة بين الوقتين: ' + f.num(gross, 2) + ' ساعة (' + Math.floor(gross) + ':' + pad(Math.round((gross % 1) * 60)) + ')',
          'بعد خصم الراحة (' + v.brk + ' دقيقة): ' + f.num(net, 2) + ' ساعة',
          '   بالعربي: ' + Math.floor(net) + ' ساعة و' + Math.round((net % 1) * 60) + ' دقيقة',
          '   بالدقائق: ' + f.num(net * 60, 0) + ' دقيقة',
          '',
          'ساعات إضافية: ' + f.num(otH, 2) + ' ساعة (فوق ' + std + ' ساعات)'
        ];
        if (wage > 0) {
          rows.push('',
            '💰 أجر اليوم: ' + f.num(pay, 2),
            '   الأساسي: ' + f.num(Math.min(net, std) * wage, 2),
            '   الإضافي: ' + f.num(otH * wage * otRate, 2) + '  (×' + otRate + ')',
            '   أجر الساعة الفعلي: ' + f.num(pay / Math.max(0.01, net), 2),
            '',
            '📅 تقدير شهري (' + v.days + ' يوم عمل): ' + f.num(pay * Number(v.days), 2),
            '   أجر دقيقة واحدة: ' + f.num(wage / 60, 4));
        }
        rows.push('', '— جرّب أوقاتاً أخرى —',
          ...[['07:00', '15:00'], ['08:00', '16:00'], ['09:00', '18:00']].map(([a, b]) => {
            const m2 = ((Number(b.split(':')[0]) * 60 + Number(b.split(':')[1])) - (Number(a.split(':')[0]) * 60 + Number(a.split(':')[1])) + 1440) % 1440;
            return '  ' + a + ' → ' + b + ' = ' + f.num(m2 / 60 - Number(v.brk) / 60, 2) + ' ساعة صافية';
          }));
        return rows.join('\n');
      }
    })
  });

  /* ============ 7) المناسبات الهجرية والعد التنازلي ============ */
  t({
    id: 'hijri-events', cat: 'time', icon: '🕌', title: 'عدّاد المناسبات الهجرية',
    desc: 'العدّ التنازلي لرمضان وعيد الفطر والأضحى وعاشوراء ورأس السنة الهجرية (تقويم أم القرى)',
    render: function (root) {
      const res = f.out({ filename: 'hijri-events.txt' });
      const list = f.el('div', { class: 'tz-grid' });
      const EVENTS = [
        { m: 1, d: 1, name: 'رأس السنة الهجرية', icon: '🌙' },
        { m: 1, d: 10, name: 'عاشوراء', icon: '🕯️' },
        { m: 3, d: 12, name: 'المولد النبوي', icon: '🕌' },
        { m: 7, d: 27, name: 'الإسراء والمعراج', icon: '✨' },
        { m: 9, d: 1, name: 'أول رمضان', icon: '🌙' },
        { m: 9, d: 27, name: 'ليلة القدر (المتوقعة)', icon: '🌌' },
        { m: 10, d: 1, name: 'عيد الفطر', icon: '🎉' },
        { m: 12, d: 10, name: 'عيد الأضحى', icon: '🐑' },
        { m: 12, d: 9, name: 'يوم عرفة', icon: '⛰️' }
      ];
      const parts = (date) => {
        const p = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(date).reduce((a, x) => (a[x.type] = x.value, a), {});
        return { y: +p.year, m: +p.month, d: +p.day };
      };
      const gregFmt = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'full' });
      const hijriFmt = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { dateStyle: 'long' });
      const findDate = (hy, hm, hd) => {
        let lo = new Date(Date.UTC(hy - 580, 0, 1)).getTime();
        let hi = new Date(Date.UTC(hy - 578, 0, 1)).getTime();
        // بحث بالتنصيف على أطول مدى ممكن (سهل ومضمون)
        lo = new Date(Date.UTC(2000, 0, 1)).getTime();
        hi = new Date(Date.UTC(2100, 0, 1)).getTime();
        for (let i = 0; i < 60; i++) {
          const mid = Math.floor((lo + hi) / 2);
          const p = parts(new Date(mid));
          const key = p.y * 10000 + p.m * 100 + p.d;
          const want = hy * 10000 + hm * 100 + hd;
          if (key < want) lo = mid; else hi = mid;
        }
        const cand = new Date(hi);
        const p = parts(cand);
        if (p.y === hy && p.m === hm && p.d === hd) return cand;
        for (let k = -3; k <= 3; k++) {
          const c2 = new Date(hi + k * 86400000);
          const p2 = parts(c2);
          if (p2.y === hy && p2.m === hm && p2.d === hd) return c2;
        }
        return null;
      };
      const build = () => {
        const now = new Date();
        const today = parts(now);
        const rows = [];
        EVENTS.forEach((ev) => {
          let hy = today.y;
          let dt = findDate(hy, ev.m, ev.d);
          if (!dt || dt.getTime() < now.getTime() - 86400000) { hy = today.y + 1; dt = findDate(hy, ev.m, ev.d); }
          if (!dt) return;
          const days = Math.ceil((dt.getTime() - now.getTime()) / 86400000);
          rows.push({ ...ev, dt, days, hy });
        });
        rows.sort((a, b) => a.days - b.days);
        res.set([
          '📅 اليوم: ' + gregFmt.format(now) + '  =  ' + hijriFmt.format(now),
          '',
          'أقرب المناسبات (بتقويم أم القرى، قد يختلف يوماً حسب الرؤية):',
          '',
          ...rows.map((r) => `${r.icon} ${r.name.padEnd(24)} ${gregFmt.format(r.dt)}  —  بعد ${r.days} يوماً`),
          '',
          'ملاحظة: التواريخ مبنية على حساب تقويم أم القرى الفلكي، والرؤية الشرعية قد تُقدّم أو تؤخّر يوماً.'
        ].join('\n'));
        list.replaceChildren(...rows.slice(0, 6).map((r) => f.el('div', { class: 'tz-card' },
          f.el('div', { class: 'tz-city', text: r.icon + ' ' + r.name }),
          f.el('div', { class: 'tz-time', dir: 'ltr', text: String(r.days) }),
          f.el('div', { class: 'hint', text: 'يوم · ' + r.hy + 'هـ' }))));
      };
      build();
      root.append(list, f.row(f.btn('🔄 حدّث', () => { build(); f.toast('تم التحديث'); }, 'primary'), f.btn('📋 انسخ القائمة', () => f.copy(res.value), 'ghost')), res.el,
        f.note('الحساب داخل المتصفح عبر تقويم أم القرى المدمج في النظام — بلا إنترنت.'));
    }
  });

  /* ============ 8) تحويل صيغ الوقت ============ */
  t({
    id: 'time-format', cat: 'time', icon: '🕐', title: 'تحويل وقراءة صيغ الوقت',
    desc: 'تحويل بين 12 و24 ساعة، النطق العربي، والأجزاء العشرية للساعة',
    render: function (root) {
      const inp = f.inp({ type: 'time', value: '14:35' });
      const res = f.out({ filename: 'time-format.txt' });
      const AR_HOURS = ['الثانية عشرة', 'الواحدة', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة', 'الحادية عشرة'];
      const run = () => {
        const [h, m] = String(inp.value || '').split(':').map(Number);
        if (isNaN(h) || isNaN(m)) { res.set('أدخل وقتاً صحيحاً.'); return; }
        const h12 = h % 12 === 0 ? 12 : h % 12;
        const period = h < 12 ? 'صباحاً' : h < 17 ? 'ظهراً' : h < 20 ? 'مساءً' : 'ليلاً';
        const dec = h + m / 60;
        res.set([
          '⏰ الصيغة 24 ساعة : ' + pad(h) + ':' + pad(m) + (m === 0 ? '  (' + pad(h) + ':00)' : ''),
          '🕐 الصيغة 12 ساعة: ' + h12 + ':' + pad(m) + (h < 12 ? ' ص' : ' م') + '  —  ' + h12 + ':' + pad(m) + ' ' + (h < 12 ? 'AM' : 'PM'),
          '🗣️ بالعربية      : الساعة ' + AR_HOURS[h12 % 12] + ' و' + (m === 0 ? 'تماماً' : m + ' دقيقة') + ' ' + period,
          '',
          'بالساعات العشرية: ' + f.num(dec, 4) + ' ساعة',
          'بالدقائق من منتصف الليل: ' + (h * 60 + m) + ' دقيقة',
          'بالثواني من منتصف الليل: ' + (h * 3600 + m * 60),
          'بقي حتى منتصف الليل: ' + f.num((1440 - (h * 60 + m)) / 60, 2) + ' ساعة',
          '',
          'الفرق عن الآن: ' + (() => {
            const now = new Date();
            const diff = (h * 60 + m) - (now.getHours() * 60 + now.getMinutes());
            const abs = Math.abs(diff);
            return (diff >= 0 ? 'بعد ' : 'قبل ') + Math.floor(abs / 60) + ' ساعة و' + (abs % 60) + ' دقيقة';
          })(),
          '',
          '— تحويلات سريعة —',
          '  12 ساعة ص = 00:00  ·  12 ساعة م = 12:00',
          '  1 م = 13:00  ·  6 م = 18:00  ·  11:59 م = 23:59',
          '',
          'محوّلات معروفة: ISO للنظام = ' + pad(h) + ':' + pad(m) + ':00  ·  مدة الساعات القياسية = ' + f.num(dec, 2) + 'h'
        ].join('\n'));
      };
      inp.addEventListener('input', run);
      root.append(f.field('الوقت', inp), f.row(f.btn('🕐 الآن', () => { const n = new Date(); inp.value = pad(n.getHours()) + ':' + pad(n.getMinutes()); run(); }, 'ghost')), res.el);
      run();
    }
  });
})();
