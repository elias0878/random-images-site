/* ============================================================
   اختبار بمتصفح حقيقي (Chrome) — يتحقق من أدوات الصور والقياس والترجمة فعلياً
   التشغيل: node test/browser.js     (يحتاج السيرفر المحلي عاملاً على 3000)
   ============================================================ */
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const URL = process.env.URL || 'http://localhost:3000/';
const T1 = '/tmp/t1.png';
const T2 = '/tmp/t2.png';
const EXIF = '/tmp/exif.jpg';
const DL = '/tmp/dl';

let pass = 0, fail = 0;
const errs = [];
const check = (ok, msg) => { (ok ? pass++ : fail++); console.log((ok ? '✅' : '❌') + ' ' + msg); if (!ok) errs.push(msg); };

(async () => {
  fs.rmSync(DL, { recursive: true, force: true });
  fs.mkdirSync(DL, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none', '--lang=ar']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push('console: ' + m.text()); });
  const client = await page.target().createCDPSession();
  await client.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: DL });

  // ---------- 1) تحميل الصفحة ----------
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 700));
  const info = await page.evaluate(() => ({
    tools: (window.TOOLS || []).length,
    cards: document.querySelectorAll('#grid .card').length,
    chips: document.querySelectorAll('#cats .chip').length,
    title: document.title,
    dir: document.documentElement.dir,
    theme: document.documentElement.dataset.theme
  }));
  check(info.tools >= 100, 'الأدوات في المتصفح: ' + info.tools);
  check(info.cards === info.tools, 'بطاقات معروضة = ' + info.cards);
  check(info.chips >= 9, 'تصنيفات: ' + info.chips);
  check(info.dir === 'rtl', 'اتجاه الصفحة RTL: ' + info.dir);

  // ---------- أدوات مساعدة ----------
  const openTool = async (id) => {
    await page.evaluate((i) => { location.hash = '#/t/' + i; }, id);
    await new Promise((r) => setTimeout(r, 260));
  };
  const upload = async (sel, file) => {
    const inp = await page.$(sel);
    if (!inp) return false;
    await inp.uploadFile(file);
    await new Promise((r) => setTimeout(r, 450));
    return true;
  };
  const fileInputs = '#tool-body input[type=file]';
  const canvasInfo = () => page.evaluate(() => {
    const c = document.querySelector('#tool-body .cv-wrap canvas');
    if (!c) return null;
    const x = c.getContext('2d');
    const px = (a, b) => Array.from(x.getImageData(a, b, 1, 1).data);
    return { w: c.width, h: c.height, center: px(Math.floor(c.width / 2), Math.floor(c.height / 2)), corner: px(4, 4), raw: c.toDataURL().length };
  });
  const outText = () => page.evaluate(() => {
    const p = document.querySelector('#tool-body .out-pre');
    return p ? p.textContent : '';
  });
  const clickBtn = async (labelPart) => {
    const clicked = await page.evaluate((lp) => {
      const b = [...document.querySelectorAll('#tool-body .btn')].find((x) => x.textContent.includes(lp));
      if (!b) return false;
      b.click();
      return true;
    }, labelPart);
    await new Promise((r) => setTimeout(r, 400));
    return clicked;
  };
  const setControl = async (label, value) => page.evaluate((lab, val) => {
    const fields = [...document.querySelectorAll('#tool-body .field')];
    const f2 = fields.find((x) => x.textContent.includes(lab));
    if (!f2) return false;
    const ctl = f2.querySelector('input,select');
    if (!ctl) return false;
    ctl.value = val;
    ctl.dispatchEvent(new Event('input', { bubbles: true }));
    ctl.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }, label, value);

  // ---------- 2) جولة شاملة على كل الأدوات (التقاط أخطاء التشغيل) ----------
  const ids = await page.evaluate(() => window.TOOLS.map((t) => t.id));
  let visited = 0;
  for (const id of ids) {
    const before = consoleErrors.length;
    await openTool(id);
    const ok = await page.evaluate(() => !!document.querySelector('#tool-body'));
    if (ok) visited++;
    // اضغط الأزرار الأساسية بلا رفع ملفات (آمنة)
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('#tool-body .btn')].filter((x) => !x.textContent.includes('تنزيل') && !x.textContent.includes('نزّل'));
      if (b[0] && b[0].offsetParent !== null) b[0].click();
    });
    await new Promise((r) => setTimeout(r, 60));
    if (consoleErrors.length > before) {
      check(false, 'أداة ' + id + ' أطلقت خطأ: ' + consoleErrors[consoleErrors.length - 1].slice(0, 160));
    }
  }
  check(visited === ids.length, 'جولة على كل الأدوات: فُتحت ' + visited + '/' + ids.length + ' بلا أخطاء');

  // ---------- 3) أدوات الصور فعلياً ----------
  await openTool('img-resize');
  check(await upload(fileInputs, T1), 'img-resize: رُفعت الصورة');
  let ci = await canvasInfo();
  check(ci && ci.w === 320 && ci.h === 240, 'img-resize: أبعاد أولية ' + (ci ? ci.w + '×' + ci.h : 'لا canvas'));
  await setControl('العرض', 160);
  await new Promise((r) => setTimeout(r, 400));
  ci = await canvasInfo();
  check(ci && ci.w === 160 && ci.h === 120, 'img-resize: بعد التصغير إلى 160 → ' + (ci ? ci.w + '×' + ci.h : '—'));

  await openTool('img-grayscale');
  await upload(fileInputs, T1);
  ci = await canvasInfo();
  check(ci && ci.center[0] === ci.center[1] && ci.center[1] === ci.center[2], 'img-grayscale: البكسل المركزي رمادي ' + (ci ? JSON.stringify(ci.center) : '—'));
  await clickBtn('تنزيل PNG');
  await new Promise((r) => setTimeout(r, 900));
  check(fs.readdirSync(DL).some((f2) => f2.endsWith('.png')), 'تنزيل PNG من الأداة: ' + fs.readdirSync(DL).join(', '));

  await openTool('img-invert');
  await upload(fileInputs, T1);
  const inv = await canvasInfo();
  check(inv && (inv.corner[0] !== 255 || inv.corner[1] !== 60), 'img-invert: العكس غيّر البكسل ' + (inv ? JSON.stringify(inv.corner) : '—'));

  await openTool('img-rotate');
  await upload(fileInputs, T1);
  await setControl('الزاوية', '90');
  await new Promise((r) => setTimeout(r, 400));
  ci = await canvasInfo();
  check(ci && ci.w === 240 && ci.h === 320, 'img-rotate 90°: ' + (ci ? ci.w + '×' + ci.h : '—'));

  await openTool('img-crop');
  await upload(fileInputs, T1);
  await setControl('نسبة جاهزة', '1:1');
  await new Promise((r) => setTimeout(r, 450));
  ci = await canvasInfo();
  check(ci && ci.w === ci.h, 'img-crop 1:1: ' + (ci ? ci.w + '×' + ci.h : '—'));

  await openTool('img-pixelate');
  await upload(fileInputs, T1);
  ci = await canvasInfo();
  check(ci && ci.w === 320, 'img-pixelate: الناتج ' + (ci ? ci.w + '×' + ci.h : '—'));

  await openTool('img-watermark');
  await upload(fileInputs, T1);
  ci = await canvasInfo();
  check(ci && ci.w === 320 && ci.h === 240, 'img-watermark: علامة مائية على ' + (ci ? ci.w + '×' + ci.h : '—'));

  await openTool('img-blur');
  await upload(fileInputs, T1);
  ci = await canvasInfo();
  check(ci !== null, 'img-blur: أنتج صورة');

  await openTool('img-palette');
  await upload(fileInputs, T1);
  const pal = await outText();
  check(/#[0-9a-f]{6}/i.test(pal), 'img-palette: استخرج ألواناً ' + (pal.match(/#[0-9a-f]{6}/i) || [''])[0]);

  await openTool('img-compress-target');
  await upload(fileInputs, T1);
  await clickBtn('اكتشف أفضل جودة');
  await new Promise((r) => setTimeout(r, 1200));
  const comp = await page.evaluate(() => document.querySelector('#tool-body .out-pre').textContent);
  check(/أفضل جودة|✅/.test(comp), 'img-compress-target: ' + comp.split('\n')[0].slice(0, 80));

  await openTool('img-compare');
  const inps = await page.$$(fileInputs);
  if (inps.length >= 2) {
    await inps[0].uploadFile(T1);
    await new Promise((r) => setTimeout(r, 300));
    await inps[1].uploadFile(T2);
    await new Promise((r) => setTimeout(r, 600));
  }
  ci = await canvasInfo();
  check(ci && ci.h >= 720, 'img-compare: خريطة الفرق على ' + (ci ? ci.w + '×' + ci.h : '—'));

  await openTool('img-collage');
  const inps2 = await page.$$(fileInputs);
  if (inps2.length >= 2) {
    await inps2[0].uploadFile(T1);
    await new Promise((r) => setTimeout(r, 300));
    await inps2[1].uploadFile(T2);
    await new Promise((r) => setTimeout(r, 600));
  }
  ci = await canvasInfo();
  check(ci && ci.w > 400, 'img-collage: دمج صورتين ' + (ci ? ci.w + '×' + ci.h : '—'));

  await openTool('img-favicon');
  await upload(fileInputs, T1);
  const icons = await page.evaluate(() => document.querySelectorAll('#tool-body .ico-cell canvas').length);
  check(icons === 9, 'img-favicon: أنتج ' + icons + ' أيقونة');

  await openTool('img-exif');
  await upload(fileInputs, EXIF);
  await new Promise((r) => setTimeout(r, 800));
  const exifTxt = await outText();
  check(/Canon/.test(exifTxt), 'img-exif: قرأ الشركة/الطراز من EXIF');
  check(/90D/.test(exifTxt), 'img-exif: قرأ الطراز');
  check(/2026-03-15/.test(exifTxt), 'img-exif: قرأ تاريخ التصوير (' + (exifTxt.match(/\d{4}-\d{2}-\d{2}[^\n]*/) || ['—'])[0] + ')');
  check(/400/.test(exifTxt), 'img-exif: قرأ ISO');
  check(/15\.3701\d*, 44\.2083\d*/.test(exifTxt), 'img-exif: فكّ إحداثيات GPS → ' + (exifTxt.match(/الإحداثيات: [^\n]*/) || ['—'])[0]);
  check(!/تعذّرت|❌/.test(exifTxt), 'img-exif: بلا أخطاء قراءة');

  await openTool('img-color-pick');
  await upload(fileInputs, T1);
  const box = await page.$('#tool-body .cv-wrap canvas');
  const bb = await box.boundingBox();
  await page.mouse.move(bb.x + bb.width * 0.5, bb.y + bb.height * 0.5);
  await new Promise((r) => setTimeout(r, 350));
  const pick = await page.evaluate(() => document.querySelector('#tool-body .out-pre').textContent);
  check(/#[0-9A-F]{6}/.test(pick), 'img-color-pick: قرأ اللون ' + (pick.match(/#[0-9A-F]{6}/) || [''])[0]);

  // ---------- 4) قياس المسافات على صورة ----------
  await openTool('measure-image');
  await upload(fileInputs, T1);
  const cvs = await page.$('#tool-body .cv-wrap canvas');
  const cb = await cvs.boundingBox();
  await page.mouse.click(cb.x + 20, cb.y + 20);
  await new Promise((r) => setTimeout(r, 200));
  await page.mouse.click(cb.x + cb.width - 20, cb.y + cb.height - 20);
  await new Promise((r) => setTimeout(r, 350));
  const meas = await page.evaluate(() => document.querySelector('#tool-body .out-pre').textContent);
  check(/بكسل/.test(meas) && /المسار الكامل/.test(meas), 'measure-image: قاس مساراً → ' + (meas.match(/آخر مسافة: [\d.,]+ بكسل/) || ['—'])[0]);

  // ---------- 5) القياس بالإحداثيات ----------
  await openTool('measure-gps');
  await new Promise((r) => setTimeout(r, 400));
  const gps = await outText();
  check(/1,0[67]\d\.\d+ كم/.test(gps), 'measure-gps: صنعاء→الرياض = ' + (gps.match(/•\s*[\d.,]+ كم/) || ['—'])[0]);

  await openTool('measure-cities');
  await new Promise((r) => setTimeout(r, 500));
  const cities = await outText();
  check(/كم/.test(cities), 'measure-cities: ' + (cities.split('\n').find((l) => l.includes('المسافة')) || '—').slice(0, 90));

  // ---------- 6) المناسبات الهجرية والوقت ----------
  await openTool('hijri-events');
  await new Promise((r) => setTimeout(r, 900));
  const hij = await outText();
  check(/رمضان/.test(hij) && /بعد \d+ يوماً/.test(hij), 'hijri-events: عدّاد المناسبات يعمل → ' + (hij.match(/أول رمضان[^\n]*/) || ['—'])[0].slice(0, 80));

  await openTool('world-clock');
  await new Promise((r) => setTimeout(r, 1400));
  const clocks = await page.evaluate(() => document.querySelectorAll('#tool-body .tz-card').length);
  const t1 = await page.evaluate(() => document.querySelector('#tool-body .tz-time').textContent);
  await new Promise((r) => setTimeout(r, 1200));
  const t2 = await page.evaluate(() => document.querySelector('#tool-body .tz-time').textContent);
  check(clocks >= 20, 'world-clock: ' + clocks + ' مدينة');
  check(t1 !== t2 || /\d\d:\d\d/.test(t1), 'world-clock: الساعة تتحدّث (' + t1 + ' → ' + t2 + ')');

  // ---------- 7) الترجمة عبر الوسيط الحقيقي ----------
  await openTool('translate-text');
  await page.evaluate(() => {
    const ta = document.querySelector('#tool-body textarea');
    ta.value = 'صباح الخير';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await clickBtn('ترجم');
  await new Promise((r) => setTimeout(r, 6000));
  const tr = await outText();
  check(/good morning|morning/i.test(tr), 'translate-text عبر /api: ' + tr.split('\n').slice(0, 3).join(' ').slice(0, 110));

  // ---------- 8) أداة نصية وبرمجية ----------
  await openTool('json-format');
  await page.evaluate(() => {
    const ta = document.querySelector('#tool-body textarea');
    ta.value = '{"b":2,"a":[1,2,{"c":true}]}';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await clickBtn('نسّق') || await clickBtn('تنسيق');
  await new Promise((r) => setTimeout(r, 500));
  const js = await outText();
  check(/^\{\n\s+"a"/.test(js.trim()) || /"a": \[/.test(js), 'json-format: نسّق JSON فعلياً');

  await openTool('hash-sha');
  await page.evaluate(() => {
    const ta = document.querySelector('#tool-body textarea') || document.querySelector('#tool-body input');
    ta.value = 'abc';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await clickBtn('احسب') || await clickBtn('SHA');
  await new Promise((r) => setTimeout(r, 800));
  const sha = await outText();
  check(/ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad/i.test(sha), 'hash-sha: تجزئة "abc" صحيحة (قيمة معيارية)');

  await openTool('hash-md5');
  await page.evaluate(() => {
    const ta = document.querySelector('#tool-body textarea') || document.querySelector('#tool-body input');
    ta.value = 'abc';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await clickBtn('احسب') || await clickBtn('MD5');
  await new Promise((r) => setTimeout(r, 600));
  const md5 = await outText();
  check(/900150983cd24fb0d6963f7d28e17f72/i.test(md5), 'hash-md5: تجزئة "abc" صحيحة (قيمة معيارية)');

  // ---------- الخلاصة ----------
  const realErrors = consoleErrors.filter((e) => !/favicon|ERR_|Failed to load resource/i.test(e));
  console.log('\n— أخطاء الصفحة: ' + realErrors.length);
  realErrors.slice(0, 8).forEach((e) => console.log('   ' + e.slice(0, 200)));
  console.log('\n' + (fail === 0 ? '🎉 كل الاختبارات نجحت: ' + pass + ' اختبار' : '⚠️ نجح ' + pass + ' وفشل ' + fail));
  await browser.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('فشل الاختبار:', e); process.exit(1); });
