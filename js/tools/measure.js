/* ============================================================
   tools/measure.js — قياس المسافات والمساحات (6 أدوات)
   ============================================================ */
(function () {
  'use strict';
  const t = f.tool;

  const R = 6371.0088; // نصف قطر الأرض بالكيلومتر
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;

  function haversine(lat1, lon1, lat2, lon2) {
    const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  }
  function bearing(lat1, lon1, lat2, lon2) {
    const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }
  const compass = (b) => {
    const dirs = ['شمال ⬆️', 'شمال-شرق ↗️', 'شرق ➡️', 'جنوب-شرق ↘️', 'جنوب ⬇️', 'جنوب-غرب ↙️', 'غرب ⬅️', 'شمال-غرب ↖️'];
    return dirs[Math.round(b / 45) % 8] + '  (' + b.toFixed(1) + '°)';
  };
  const fmtDur = (hours) => {
    const h = Math.floor(hours), m = Math.round((hours - h) * 60);
    return h + ' ساعة و' + m + ' دقيقة';
  };

  /* ============ 1) المسافة بين إحداثيتين ============ */
  t({
    id: 'measure-gps', cat: 'measure', icon: '📍', title: 'المسافة بين إحداثيتين GPS',
    desc: 'يحسب المسافة الحقيقية على سطح الأرض (Haversine) والاتجاه والزمن المتوقع',
    render: function (root) {
      const lat1 = f.inp({ value: '15.3694', placeholder: 'خط عرض النقطة 1', dir: 'ltr' });
      const lon1 = f.inp({ value: '44.1910', placeholder: 'خط طول النقطة 1', dir: 'ltr' });
      const lat2 = f.inp({ value: '24.7136', placeholder: 'خط عرض النقطة 2', dir: 'ltr' });
      const lon2 = f.inp({ value: '46.6753', placeholder: 'خط طول النقطة 2', dir: 'ltr' });
      const res = f.out({ filename: 'gps-distance.txt' });
      const run = () => {
        const a = [Number(lat1.value), Number(lon1.value)], b = [Number(lat2.value), Number(lon2.value)];
        if (a.some(isNaN) || b.some(isNaN)) { res.set('أدخل إحداثيات صحيحة (أرقام عشرية).'); return; }
        if (Math.abs(a[0]) > 90 || Math.abs(b[0]) > 90 || Math.abs(a[1]) > 180 || Math.abs(b[1]) > 180) { res.set('الإحداثيات خارج النطاق الصالح.'); return; }
        const d = haversine(a[0], a[1], b[0], b[1]);
        const brg = bearing(a[0], a[1], b[0], b[1]);
        const midLat = (a[0] + b[0]) / 2, midLon = (a[1] + b[1]) / 2;
        res.set([
          '📍 النقطة 1: ' + a[0].toFixed(6) + ', ' + a[1].toFixed(6),
          '📍 النقطة 2: ' + b[0].toFixed(6) + ', ' + b[1].toFixed(6),
          '',
          '📏 المسافة (خط مستقيم على سطح الكرة الأرضية):',
          '   • ' + f.num(d, 4) + ' كم',
          '   • ' + f.num(d * 1000, 0) + ' متر',
          '   • ' + f.num(d * 0.539957, 4) + ' ميل بحري',
          '   • ' + f.num(d * 0.621371, 4) + ' ميل',
          '',
          '🧭 الاتجاه من النقطة 1 إلى 2: ' + compass(brg),
          '🔁 الاتجاه المعاكس: ' + compass(bearing(b[0], b[1], a[0], a[1])),
          '⚖️ نقطة المنتصف: ' + midLat.toFixed(6) + ', ' + midLon.toFixed(6),
          '',
          '⏱️ الزمن المتوقع:',
          '   • مشياً على الأقدام (5 كم/س): ' + fmtDur(d / 5),
          '   • بالسيارة (90 كم/س): ' + fmtDur(d / 90),
          '   • بالطائرة (800 كم/س): ' + fmtDur(d / 800),
          '',
          '💡 المسافة المستقيمة دائماً أقصر من مسافة الطريق الفعلي.',
          '🌐 خريطة: https://www.google.com/maps/dir/?api=1&origin=' + a[0] + ',' + a[1] + '&destination=' + b[0] + ',' + b[1]
        ].join('\n'));
      };
      [lat1, lon1, lat2, lon2].forEach((i) => i.addEventListener('input', f.debounce(run, 200)));
      const parsePaste = (str, a, b) => {
        const m = (str || '').match(/-?\d+(\.\d+)?/g);
        if (m && m.length >= 2) { a.value = m[0]; b.value = m[1]; run(); }
        else f.toast('الصق بصيغة: 15.3694, 44.1910', 'err');
      };
      const goLoc = () => {
        if (!navigator.geolocation) { f.toast('المتصفح لا يدعم تحديد الموقع', 'err'); return; }
        f.toast('⏳ جاري تحديد موقعك… يُطلب إذن المتصفح');
        navigator.geolocation.getCurrentPosition(
          (p) => { lat1.value = p.coords.latitude.toFixed(6); lon1.value = p.coords.longitude.toFixed(6); run(); f.toast('✅ حُدّد موقعك'); },
          (e) => f.toast('تعذّر تحديد الموقع: ' + e.message, 'err'), { timeout: 10000 });
      };
      root.append(
        f.grid(f.field('خط عرض النقطة 1', lat1), f.field('خط طول النقطة 1', lon1), f.field('خط عرض النقطة 2', lat2), f.field('خط طول النقطة 2', lon2)),
        f.row(
          f.btn('📍 النقطة 1 = موقعي الحالي', goLoc, 'ghost'),
          f.btn('📋 الصق "lat, lon" للنقطة 2', async () => {
            try { parsePaste(await navigator.clipboard.readText(), lat2, lon2); }
            catch (e) { f.toast('تعذّر قراءة الحافظة — الصق يدوياً في الحقلين', 'err'); }
          }, 'ghost'),
          f.btn('🔁 اعكس النقطتين', () => { const a = [lat1.value, lon1.value]; lat1.value = lat2.value; lon1.value = lon2.value; lat2.value = a[0]; lon2.value = a[1]; run(); }, 'ghost')
        ),
        res.el
      );
      run();
    }
  });

  /* ============ 2) المسافة بين مدينتين ============ */
  t({
    id: 'measure-cities', cat: 'measure', icon: '🏙️', title: 'المسافة بين مدينتين',
    desc: 'جدول مدن عربية وعالمية مدمج — المسافة والاتجاه والوقت المتوقع بلا إنترنت',
    render: function (root) {
      const C = [
        ['صنعاء', 'اليمن', 15.3694, 44.1910], ['عدن', 'اليمن', 12.7855, 45.0187], ['تعز', 'اليمن', 13.5795, 44.0209],
        ['الحديدة', 'اليمن', 14.7978, 42.9545], ['المكلا', 'اليمن', 14.5363, 49.1261], ['سيئون', 'اليمن', 15.9430, 48.7873],
        ['إب', 'اليمن', 13.9667, 44.1783], ['مأرب', 'اليمن', 15.4622, 45.3253], ['صعدة', 'اليمن', 16.9402, 43.7639],
        ['الرياض', 'السعودية', 24.7136, 46.6753], ['جدة', 'السعودية', 21.4858, 39.1925], ['مكة المكرمة', 'السعودية', 21.3891, 39.8579],
        ['المدينة المنورة', 'السعودية', 24.4686, 39.6142], ['الدمام', 'السعودية', 26.3927, 49.9777], ['أبها', 'السعودية', 18.2465, 42.5117],
        ['جيزان', 'السعودية', 16.8892, 42.5511], ['نجران', 'السعودية', 17.4917, 44.1322],
        ['دبي', 'الإمارات', 25.2048, 55.2708], ['أبوظبي', 'الإمارات', 24.4539, 54.3773], ['الشارقة', 'الإمارات', 25.3463, 55.4209],
        ['الدوحة', 'قطر', 25.2854, 51.5310], ['الكويت', 'الكويت', 29.3759, 47.9774], ['المنامة', 'البحرين', 26.2285, 50.5860],
        ['مسقط', 'عُمان', 23.5880, 58.3829], ['صلالة', 'عُمان', 17.0151, 54.0924],
        ['عمّان', 'الأردن', 31.9454, 35.9284], ['بيروت', 'لبنان', 33.8938, 35.5018], ['دمشق', 'سوريا', 33.5138, 36.2765],
        ['حلب', 'سوريا', 36.2021, 37.1343], ['بغداد', 'العراق', 33.3152, 44.3661], ['البصرة', 'العراق', 30.5081, 47.7835],
        ['القدس', 'فلسطين', 31.7683, 35.2137], ['غزة', 'فلسطين', 31.5017, 34.4668],
        ['القاهرة', 'مصر', 30.0444, 31.2357], ['الإسكندرية', 'مصر', 31.2001, 29.9187], ['أسوان', 'مصر', 24.0889, 32.8998],
        ['الخرطوم', 'السودان', 15.5007, 32.5599], ['بورتسودان', 'السودان', 19.6158, 37.2164],
        ['طرابلس', 'ليبيا', 32.8872, 13.1913], ['بنغازي', 'ليبيا', 32.1194, 20.0868],
        ['تونس', 'تونس', 36.8065, 10.1815], ['الجزائر', 'الجزائر', 36.7538, 3.0588], ['الرباط', 'المغرب', 34.0209, -6.8416],
        ['الدار البيضاء', 'المغرب', 33.5731, -7.5898], ['مراكش', 'المغرب', 31.6295, -7.9811],
        ['نواكشوط', 'موريتانيا', 18.0735, -15.9582], ['مقديشو', 'الصومال', 2.0469, 45.3182], ['جيبوتي', 'جيبوتي', 11.8251, 42.5903],
        ['أسمرة', 'إريتريا', 15.3229, 38.9251], ['أديس أبابا', 'إثيوبيا', 9.0320, 38.7469],
        ['إستانبول', 'تركيا', 41.0082, 28.9784], ['أنقرة', 'تركيا', 39.9334, 32.8597],
        ['طهران', 'إيران', 35.6892, 51.3890], ['كراتشي', 'باكستان', 24.8607, 67.0011], ['إسلام آباد', 'باكستان', 33.6844, 73.0479],
        ['دلهي', 'الهند', 28.6139, 77.2090], ['مومباي', 'الهند', 19.0760, 72.8777], ['دكا', 'بنغلاديش', 23.8103, 90.4125],
        ['كابول', 'أفغانستان', 34.5553, 69.2075], ['طشقند', 'أوزبكستان', 41.2995, 69.2401],
        ['لندن', 'بريطانيا', 51.5074, -0.1278], ['باريس', 'فرنسا', 48.8566, 2.3522], ['برلين', 'ألمانيا', 52.5200, 13.4050],
        ['روما', 'إيطاليا', 41.9028, 12.4964], ['مدريد', 'إسبانيا', 40.4168, -3.7038], ['أمستردام', 'هولندا', 52.3676, 4.9041],
        ['موسكو', 'روسيا', 55.7558, 37.6173], ['كييف', 'أوكرانيا', 50.4501, 30.5234], ['أثينا', 'اليونان', 37.9838, 23.7275],
        ['نيويورك', 'أمريكا', 40.7128, -74.0060], ['واشنطن', 'أمريكا', 38.9072, -77.0369], ['لوس أنجلوس', 'أمريكا', 34.0522, -118.2437],
        ['شيكاغو', 'أمريكا', 41.8781, -87.6298], ['تورونتو', 'كندا', 43.6532, -79.3832],
        ['ساو باولو', 'البرازيل', -23.5505, -46.6333], ['مكسيكو سيتي', 'المكسيك', 19.4326, -99.1332],
        ['بكين', 'الصين', 39.9042, 116.4074], ['شنغهاي', 'الصين', 31.2304, 121.4737], ['هونغ كونغ', 'الصين', 22.3193, 114.1694],
        ['طوكيو', 'اليابان', 35.6762, 139.6503], ['سيول', 'كوريا', 37.5665, 126.9780], ['سنغافورة', 'سنغافورة', 1.3521, 103.8198],
        ['كوالالمبور', 'ماليزيا', 3.1390, 101.6869], ['جاكرتا', 'إندونيسيا', -6.2088, 106.8456], ['بانكوك', 'تايلاند', 13.7563, 100.5018],
        ['مانيلا', 'الفلبين', 14.5995, 120.9842], ['سيدني', 'أستراليا', -33.8688, 151.2093], ['أوكلاند', 'نيوزيلندا', -36.8485, 174.7633],
        ['لاغوس', 'نيجيريا', 6.5244, 3.3792], ['نيروبي', 'كينيا', -1.2921, 36.8219], ['جوهانسبرغ', 'جنوب أفريقيا', -26.2041, 28.0473]
      ].sort((a, b) => a[0].localeCompare(b[0], 'ar'));
      const opts = C.map((c, i) => [String(i), c[0] + ' — ' + c[1]]);
      const i1 = f.select({ options: opts, value: String(C.findIndex((c) => c[0] === 'صنعاء')) });
      const i2 = f.select({ options: opts, value: String(C.findIndex((c) => c[0] === 'الرياض')) });
      const res = f.out({ filename: 'cities-distance.txt' });
      const run = () => {
        const a = C[Number(i1.value)], b = C[Number(i2.value)];
        if (!a || !b) return;
        const d = haversine(a[2], a[3], b[2], b[3]);
        const tz = { 'اليمن': 3, 'السعودية': 3, 'الإمارات': 4, 'قطر': 3, 'الكويت': 3, 'البحرين': 3, 'عُمان': 4, 'الأردن': 3, 'لبنان': 2, 'سوريا': 3, 'العراق': 3, 'فلسطين': 2, 'مصر': 2, 'السودان': 2, 'ليبيا': 2, 'تونس': 1, 'الجزائر': 1, 'المغرب': 1, 'موريتانيا': 0, 'الصومال': 3, 'جيبوتي': 3, 'إريتريا': 3, 'إثيوبيا': 3, 'تركيا': 3, 'إيران': 3.5, 'باكستان': 5, 'الهند': 5.5, 'بنغلاديش': 6, 'أفغانستان': 4.5, 'أوزبكستان': 5, 'بريطانيا': 0, 'فرنسا': 1, 'ألمانيا': 1, 'إيطاليا': 1, 'إسبانيا': 1, 'هولندا': 1, 'روسيا': 3, 'أوكرانيا': 2, 'اليونان': 2, 'أمريكا': -5, 'كندا': -5, 'البرازيل': -3, 'المكسيك': -6, 'الصين': 8, 'اليابان': 9, 'كوريا': 9, 'سنغافورة': 8, 'ماليزيا': 8, 'إندونيسيا': 7, 'تايلاند': 7, 'الفلبين': 8, 'أستراليا': 10, 'نيوزيلندا': 12, 'نيجيريا': 1, 'كينيا': 3, 'جنوب أفريقيا': 2 };
        const z1 = tz[a[1]], z2 = tz[b[1]];
        res.set([
          '🅰️ ' + a[0] + ' (' + a[1] + ')  ' + a[2] + ', ' + a[3],
          '🅱️ ' + b[0] + ' (' + b[1] + ')  ' + b[2] + ', ' + b[3],
          '',
          '📏 المسافة بالخط المستقيم: ' + f.num(d, 1) + ' كم  (' + f.num(d * 0.621371, 1) + ' ميل)',
          '🧭 الاتجاه: ' + compass(bearing(a[2], a[3], b[2], b[3])),
          '',
          '⏱️ الزمن المتوقع (تقريبي):',
          '   • بالطائرة (850 كم/س): ' + fmtDur(d / 850),
          '   • بالسيارة (100 كم/س): ' + fmtDur(d / 100) + ' + توقف',
          '   • بالقطار (120 كم/س): ' + fmtDur(d / 120),
          '',
          '🕐 فرق التوقيت: ' + (z1 !== undefined && z2 !== undefined ? (z2 - z1 === 0 ? 'لا فرق' : (z2 - z1 > 0 ? '+' : '') + (z2 - z1) + ' ساعة') : 'غير متوفر'),
          '',
          '📐 الإحداثيات متوسطة الدقة (مركز المدينة) — مناسبة للتقدير لا للملاحة.',
          '🗺️ خرائط: https://www.google.com/maps/dir/?api=1&origin=' + a[2] + ',' + a[3] + '&destination=' + b[2] + ',' + b[3]
        ].join('\n'));
      };
      [i1, i2].forEach((s) => s.addEventListener('change', run));
      root.append(
        f.grid(f.field('من مدينة', i1), f.field('إلى مدينة', i2)),
        f.row(f.btn('🔁 اعكس', () => { const x = i1.value; i1.value = i2.value; i2.value = x; run(); }, 'ghost'),
          f.btn('🌍 قرّب مدناً', () => { i1.value = '0'; i2.value = '0'; run(); }, 'ghost')),
        res.el,
        f.note('الجدول يحتوي ' + C.length + ' مدينة. المسافة مستقيمة (لا تعتمد مسار الطرق).')
      );
      run();
    }
  });

  /* ============ 3) القياس على الصورة ============ */
  t({
    id: 'measure-image', cat: 'measure', icon: '📐', title: 'قياس المسافات على صورة',
    desc: 'انقر على الصورة لرسم مسار وقياس أطواله بالبكسل ثم تحويلها إلى وحدة حقيقية',
    render: function (root) {
      const S = { img: null, pts: [], cal: 1, unit: 'م' };
      const canvas = f.mkCanvas(400, 200);
      const x = canvas.getContext('2d', { willReadFrequently: true });
      const out1 = f.el('div', { class: 'out-pre', dir: 'ltr' });
      const sel = f.fileInput({ accept: 'image/*', label: 'اختر صورة فيها شيء معروف الطول (باب، كرة، خط مقياس)', icon: '📐' });
      const refLen = f.inp({ type: 'number', value: 0, step: 'any', placeholder: 'مثال: 2' });
      const unit = f.select({ options: ['مم', 'سم', 'م', 'كم', 'بوصة', 'قدم'], value: 'م' });
      const refMode = f.select({ options: [['none', 'بكسل فقط (بلا معايرة)'], ['ref', 'المسار الحالي معلوم الطول'], ['width', 'عرض الصورة كامل معلوم']], value: 'none' });

      const scale = () => {
        if (!S.img) return 1;
        return Math.min(1, 1100 / S.img.naturalWidth, 800 / S.img.naturalHeight);
      };
      const paint = () => {
        if (!x || !S.img) { if (x) { x.fillStyle = '#f6f7f9'; x.fillRect(0, 0, canvas.width, canvas.height); } return; }
        const s = scale();
        canvas.width = Math.round(S.img.naturalWidth * s);
        canvas.height = Math.round(S.img.naturalHeight * s);
        x.drawImage(S.img, 0, 0, canvas.width, canvas.height);
        const pts = S.pts;
        if (pts.length) {
          x.lineWidth = 3;
          x.strokeStyle = '#ff0066';
          x.beginPath();
          pts.forEach((p, i) => (i ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y)));
          x.stroke();
          pts.forEach((p, i) => {
            x.fillStyle = '#ff0066';
            x.beginPath();
            x.arc(p.x, p.y, 5, 0, Math.PI * 2);
            x.fill();
            x.fillStyle = '#fff';
            x.font = 'bold 12px sans-serif';
            x.fillText(String(i + 1), p.x + 8, p.y - 8);
          });
          if (pts.length >= 2) {
            const mid = { x: (pts[pts.length - 2].x + pts[pts.length - 1].x) / 2, y: (pts[pts.length - 2].y + pts[pts.length - 1].y) / 2 };
            const len = Math.hypot(pts[pts.length - 1].x - pts[pts.length - 2].x, pts[pts.length - 1].y - pts[pts.length - 2].y) / scale();
            const filled = f.el ? null : null;
            x.fillStyle = 'rgba(0,0,0,.7)';
            const label = f.num(len, 0) + ' px';
            const w2 = x.measureText(label).width + 10;
            x.fillRect(mid.x - w2 / 2, mid.y - 20, w2, 18);
            x.fillStyle = '#fff';
            x.fillText(label, mid.x - w2 / 2 + 5, mid.y - 6);
          }
        }
        report();
      };
      const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y) / scale();
      const report = () => {
        if (S.pts.length < 2) { out1.textContent = S.img ? 'انقر نقطتين أو أكثر على الصورة…' : 'اختر صورة أولاً.'; return; }
        const px = [];
        let total = 0;
        for (let i = 1; i < S.pts.length; i++) { const d = dist(S.pts[i - 1], S.pts[i]); px.push(d); total += d; }
        let k = 1, unitLabel = 'بكسل';
        if (refMode.value === 'ref' && Number(refLen.value) > 0 && px.length) { k = Number(refLen.value) / px[px.length - 1]; unitLabel = unit.value; }
        else if (refMode.value === 'width' && Number(refLen.value) > 0 && S.img) { k = Number(refLen.value) / S.img.naturalWidth; unitLabel = unit.value; }
        const last = px[px.length - 1];
        const a = S.pts[S.pts.length - 2], b = S.pts[S.pts.length - 1];
        const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        const lines = [
          '— القياس الحالي —',
          'النقاط: ' + S.pts.length,
          'آخر مسافة: ' + f.num(last, 1) + ' بكسل' + (k !== 1 ? '  =  ' + f.num(last * k, 4) + ' ' + unitLabel : ''),
          'المسار الكامل: ' + f.num(total, 1) + ' بكسل' + (k !== 1 ? '  =  ' + f.num(total * k, 4) + ' ' + unitLabel : ''),
          'زاوية آخر قطعة: ' + f.num(ang, 1) + '°',
          '',
          '— تفصيل القطع —',
          ...px.map((d, i) => '  قطعة ' + (i + 1) + ': ' + f.num(d, 1) + ' بكسل' + (k !== 1 ? '  =  ' + f.num(d * k, 4) + ' ' + unitLabel : '')),
          '',
          '— أبعاد الصورة: ' + (S.img ? S.img.naturalWidth + '×' + S.img.naturalHeight + ' بكسل' : '—'),
          k !== 1 ? 'معامل التحويل: 1 بكسل = ' + f.num(k, 6) + ' ' + unitLabel : 'المعايرة: غير مفعّلة (النتيجة بالبكسل)'
        ];
        out1.textContent = lines.join('\n');
        S.result = lines.join('\n');
      };
      const click = (ev) => {
        if (!S.img || !x) return;
        const r = canvas.getBoundingClientRect();
        S.pts.push({ x: (ev.clientX - r.left) * canvas.width / r.width, y: (ev.clientY - r.top) * canvas.height / r.height });
        paint();
      };
      canvas.addEventListener('click', click);
      sel.querySelector('input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        S.img = await f.loadImage(await f.readDataURL(file));
        S.pts = [];
        paint();
        f.toast('انقر على الصورة لبدء القياس');
      });
      [refMode, refLen, unit].forEach((el2) => { el2.addEventListener('change', paint); el2.addEventListener('input', paint); });

      root.append(
        sel,
        f.grid(f.field('طريقة المعايرة', refMode), f.field('الطول الحقيقي المرجعي', refLen), f.field('الوحدة', unit)),
        f.row(
          f.btn('🗑️ مسح النقاط', () => { S.pts = []; paint(); }, 'ghost'),
          f.btn('↩️ تراجع عن آخر نقطة', () => { S.pts.pop(); paint(); }, 'ghost'),
          f.btn('📋 نسخ النتيجة', () => { if (S.result) f.copy(S.result); else f.toast('لا نتيجة بعد', 'err'); }, 'ghost')
        ),
        f.el('div', { class: 'cv-wrap' }, canvas),
        out1,
        f.note('مثال: انقر على طرفي باب، اكتب طوله الحقيقي عند «الطول الحقيقي المرجعي» واختر «المسار الحالي معلوم الطول» — ثم أي مسافة تقيسها لاحقاً ستُحوَّل تلقائياً.')
      );
      paint();
    }
  });

  /* ============ 4) البكسل إلى وحدات الطباعة ============ */
  t({
    id: 'measure-px', cat: 'measure', icon: '🖨️', title: 'البكسل إلى وحدات حقيقية',
    desc: 'حوّل أبعاد البكسل إلى سم وملم وبوصة حسب دقة الطباعة (PPI/DPI)',
    render: f.calcTool({
      live: true, filename: 'px-units.txt',
      fields: [
        { id: 'px', label: 'عدد البكسل', type: 'number', value: 1920 },
        { id: 'ppi', label: 'الدقة (PPI/DPI)', type: 'number', value: 96 },
        { id: 'mode', label: 'الاتجاه', type: 'select', options: [['px2len', 'بكسل → وحدات'], ['len2px', 'وحدات → بكسل']], value: 'px2len' }
      ],
      run: (v) => {
        const px = Number(v.px), ppi = Number(v.ppi);
        if (!px || !ppi) return 'أدخل القيم.';
        const inch = px / ppi;
        const lines = [
          'المعطى: ' + f.num(px, 2) + ' بكسل بجودة ' + f.num(ppi, 0) + ' PPI' + (v.mode === 'len2px' ? ' (مُفسَّر كوحدات)' : ''),
          '',
          '  • ' + f.num(inch * 25.4, 4) + ' ملم',
          '  • ' + f.num(inch * 2.54, 4) + ' سم',
          '  • ' + f.num(inch, 4) + ' بوصة',
          '  • ' + f.num(inch / 12, 4) + ' قدم',
          '  • ' + f.num(inch * 72, 2) + ' بوينت (pt)',
          '  • ' + f.num(inch * 6, 2) + ' بيكا',
          '  • ' + f.num(inch, 4) + ' بوصة',
          '',
          '— دقات شائعة لنفس العدد من البكسل —',
          ...[72, 96, 150, 300, 600].map((d) => '  ' + String(d).padStart(3) + ' PPI → ' + f.num((px / d) * 2.54, 3) + ' سم'),
          '',
          '— مقاسات طباعة شائعة (300 DPI) —',
          ...[['بطاقة هوية/GIF', 300], ['صورة 4×6 بوصة', 1200], ['A4', 2480], ['A3', 3508], ['ملصق 60×90 سم', 7087]].map(([n, p]) => '  ' + n + ': ' + f.num(p, 0) + ' بكسل عرض'),
          '',
          '💡 للطباعة عالية الجودة: 300 PPI. للشاشات: 72-96 PPI.'
        ];
        return lines.join('\n');
      }
    })
  });

  /* ============ 5) مقياس الرسم ============ */
  t({
    id: 'measure-scale', cat: 'measure', icon: '🗺️', title: 'مقياس الرسم والخرائط',
    desc: 'يحسب المسافة الحقيقية من مقياس الخريطة، أو يستنتج المقياس من مسافتين معروفتين',
    render: f.calcTool({
      fields: [
        { id: 'mode', label: 'العملية', type: 'select', options: [['toReal', 'قياس على الخريطة ← مسافة حقيقية'], ['toMap', 'مسافة حقيقية ← قياس على الخريطة'], ['findScale', 'استنتج المقياس من مسافتين']], value: 'toReal' },
        { id: 'map', label: 'القياس على الخريطة (سم)', type: 'number', value: 4.5, step: 'any' },
        { id: 'scale', label: 'المقياس (1 : …)', type: 'number', value: 50000 },
        { id: 'real', label: 'المسافة الحقيقية (كم)', type: 'number', value: 2.25, step: 'any' }
      ],
      live: true, filename: 'scale.txt',
      run: (v) => {
        if (v.mode === 'toReal') {
          const cm = Number(v.map), s = Number(v.scale);
          const m = cm * s / 100;
          return ['قياس على الخريطة: ' + f.num(cm, 3) + ' سم', 'المقياس: 1 : ' + f.num(s, 0), '',
            '📏 المسافة الحقيقية:',
            '  • ' + f.num(m, 3) + ' متر',
            '  • ' + f.num(m / 1000, 4) + ' كم',
            '  • ' + f.num(m / 1609.34, 4) + ' ميل',
            '',
            '1 سم على الخريطة = ' + f.num(s / 100, 1) + ' متر على الأرض',
            'الزمن مشياً (5 كم/س): ' + fmtDur((m / 1000) / 5)]
            .join('\n');
        }
        if (v.mode === 'toMap') {
          const km = Number(v.real), s = Number(v.scale);
          const cm = (km * 1000 * 100) / s;
          return ['المسافة الحقيقية: ' + f.num(km, 3) + ' كم', 'المقياس: 1 : ' + f.num(s, 0), '',
            '📐 القياس على الخريطة: ' + f.num(cm, 3) + ' سم  =  ' + f.num(cm / 2.54, 3) + ' بوصة']
            .join('\n');
        }
        const cm = Number(v.map), km = Number(v.real);
        if (!cm || !km) return 'أدخل القياس على الخريطة والمسافة الحقيقية.';
        const s = (km * 1000 * 100) / cm;
        const s2 = Math.round(s / 100) * 100;
        return ['قياس على الخريطة: ' + f.num(cm, 3) + ' سم', 'المسافة الحقيقية: ' + f.num(km, 3) + ' كم', '',
          '🧮 المقياس التقريبي: 1 : ' + f.num(s, 0),
          '   (مقرّب لمقياس شائع: 1 : ' + f.num(s2, 0) + ')',
          '',
          'أمثلة مقاييس شائعة: 1:10,000 (خرائط تفصيلية) · 1:50,000 (خرائط عسكرية) · 1:250,000 (خرائط إقليمية) · 1:1,000,000 (خرائط دولية)'].join('\n');
      }
    })
  });

  /* ============ 6) زمن السفر والوقود ============ */
  t({
    id: 'measure-travel', cat: 'measure', icon: '🚗', title: 'زمن السفر وتكلفة الوقود',
    desc: 'كم يستغرق الطريق؟ وكم وقوداً وتكلفة يستهلك؟',
    render: f.calcTool({
      fields: [
        { id: 'km', label: 'المسافة (كم)', type: 'number', value: 350, step: 'any' },
        { id: 'speed', label: 'المتوسط السرعة (كم/س)', type: 'number', value: 100, step: 'any' },
        { id: 'stops', label: 'زمن التوقفات (دقيقة)', type: 'number', value: 30 },
        { id: 'cons', label: 'استهلاك الوقود (لتر/100 كم)', type: 'number', value: 8, step: 'any' },
        { id: 'price', label: 'سعر اللتر', type: 'number', value: 2.33, step: 'any' },
        { id: 'people', label: 'عدد الركاب (لتقسيم التكلفة)', type: 'number', value: 3, min: 1 }
      ],
      live: true, filename: 'travel.txt',
      run: (v) => {
        const km = Number(v.km), sp = Number(v.speed), st = Number(v.stops);
        if (!km || !sp) return 'أدخل المسافة والسرعة.';
        const hours = km / sp;
        const total = hours + st / 60;
        const liters = (km / 100) * Number(v.cons);
        const cost = liters * Number(v.price);
        const ppl = Math.max(1, Number(v.people) || 1);
        const fmt = (h) => { const H = Math.floor(h), M = Math.round((h - H) * 60); return (H ? H + ' س ' : '') + M + ' د'; };
        return [
          '🛣️ المسافة: ' + f.num(km, 1) + ' كم',
          '⏱️ زمن القيادة: ' + fmt(hours),
          '☕ التوقفات: ' + f.num(st, 0) + ' دقيقة',
          '🕐 الزمن الكلي: ' + fmt(total) + '  (' + f.num(total, 2) + ' ساعة)',
          '',
          '⛽ الوقود: ' + f.num(liters, 2) + ' لتر',
          '💰 تكلفة الوقود: ' + f.num(cost, 2),
          '👥 نصيب الشخص: ' + f.num(cost / ppl, 2) + '  (' + ppl + ' أشخاص)',
          '',
          '— سيناريوهات سرعة —',
          ...[60, 80, 100, 120, 140].map((s) => '  ' + String(s).padStart(3) + ' كم/س → ' + fmt(km / s + st / 60)),
          '',
          '🚦 متوسط الاستهلاك لكل 100 كم: ' + f.num(Number(v.cons), 2) + ' لتر',
          '📊 تكلفة الكيلومتر الواحد: ' + f.num(cost / km, 3)
        ].join('\n');
      }
    })
  });
})();
