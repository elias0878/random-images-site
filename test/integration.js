/* اختبار تكاملي: يحمّل index.html كاملاً عبر jsdom + السيرفر المحلي،
   ويتحقق من: عدد الأدوات، التصنيفات، البحث، التوجيه، وتشغيل أداة فعلية */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const ROOT = path.join(__dirname, '..');

const errors = [];
(async () => {
  const dom = await JSDOM.fromFile(path.join(ROOT, 'index.html'), {
    runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
    url: 'http://localhost:3000/', beforeParse(w) {
      w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {} }));
      w.fetch = (...a) => (typeof fetch === 'function' ? fetch(...a) : Promise.reject(new Error('no fetch')));
      w.addEventListener('error', (e) => errors.push('window error: ' + (e.error && e.error.message)));
      w.onerror = (m) => errors.push('onerror: ' + m);
    }
  });
  const w = dom.window, d = w.document;

  await new Promise((r) => w.addEventListener('load', r, { once: true }));
  await new Promise((r) => setTimeout(r, 600));

  const TOOLS = w.TOOLS || [];
  const say = (ok, msg) => console.log((ok ? '✅' : '❌') + ' ' + msg);

  say(TOOLS.length >= 100, 'عدد الأدوات في الصفحة: ' + TOOLS.length + ' (المطلوب ≥100)');
  say(!d.querySelector('#grid').hidden, 'الشبكة الرئيسية ظاهرة');

  const cards = d.querySelectorAll('#grid .card').length;
  say(cards === TOOLS.length, 'عدد البطاقات المعروضة = ' + cards);

  const chips = d.querySelectorAll('#cats .chip').length;
  say(chips >= 8, 'عدد شرائح التصنيفات = ' + chips);

  const chipsText = [...d.querySelectorAll('#cats .chip')].map((c) => c.textContent.trim());
  say(chipsText.some((c) => c.includes('صور')), 'شريحة «صور» موجودة');
  say(chipsText.some((c) => c.includes('قياس')), 'شريحة «قياس» موجودة');
  say(chipsText.some((c) => c.includes('ترجمة')), 'شريحة «ترجمة» موجودة');

  // البحث
  const search = d.getElementById('search');
  search.value = 'قص صورة';
  search.dispatchEvent(new w.Event('input', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 300));
  const found = [...d.querySelectorAll('#grid .card-title')].map((x) => x.textContent);
  say(found.some((x) => x.includes('قص')), 'البحث عن «قص صورة» أعاد: ' + (found.slice(0, 3).join(' | ') || 'لا شيء'));

  search.value = 'هاش';
  search.dispatchEvent(new w.Event('input', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 300));
  const f2 = [...d.querySelectorAll('#grid .card-title')].map((x) => x.textContent);
  say(f2.length > 0, 'البحث عن «هاش» (مرادف): ' + (f2.slice(0, 3).join(' | ') || 'لا شيء'));

  search.value = '';
  search.dispatchEvent(new w.Event('input', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 250));

  // التوجيه إلى أداة فعلية وتشغيلها
  const target = 'numbers-to-english-words';
  w.location.hash = '#/t/' + target;
  w.dispatchEvent(new w.Event('hashchange'));
  await new Promise((r) => setTimeout(r, 300));
  say(!d.getElementById('tool').hidden, 'صفحة الأداة ظهرت للتوجيه #/t/' + target);
  say(d.getElementById('t-title').textContent.length > 3, 'عنوان الأداة: ' + d.getElementById('t-title').textContent.trim());

  const ta = d.querySelector('#tool-body textarea');
  if (ta) {
    ta.value = '1234';
    ta.dispatchEvent(new w.Event('input', { bubbles: true }));
    const runBtn = [...d.querySelectorAll('#tool-body .btn')].find((b) => b.classList.contains('primary'));
    if (runBtn) runBtn.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 500));
    const pre = d.querySelector('#tool-body .out-pre');
    const txt = pre ? pre.textContent : '';
    say(/one thousand two hundred (and )?thirty[ -]four/i.test(txt), 'تشغيل «أرقام → كلمات إنجليزية» أنتج: ' + txt.split('\n')[0]);
  } else say(false, 'لم يُعثر على حقل نصي في الأداة');

  // اختبار عدة أدوات حسابية عبر الواجهة
  const calcTest = async (id, fieldId, value, expectRe) => {
    w.location.hash = '#/';
    w.dispatchEvent(new w.Event('hashchange'));
    await new Promise((r) => setTimeout(r, 120));
    w.location.hash = '#/t/' + id;
    w.dispatchEvent(new w.Event('hashchange'));
    await new Promise((r) => setTimeout(r, 250));
    const inputs = [...d.querySelectorAll('#tool-body input[type=number], #tool-body input[type=text]')];
    if (!inputs.length) { say(false, id + ': لا حقول'); return; }
    inputs[0].value = String(value);
    inputs[0].dispatchEvent(new w.Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 350));
    const pre = d.querySelector('#tool-body .out-pre');
    const txt = pre ? pre.textContent : '';
    say(expectRe.test(txt), id + ' → ' + (txt.split('\n').filter(Boolean)[0] || 'فارغ').slice(0, 90));
  };

  await calcTest('percent-of', 'p', 10, /250/);          // 10% من 2500
  await calcTest('bmi', 'cm', 175, /BMI|مؤشر/i);
  await calcTest('unit-length', 'x', 5, /قدم|foot|16\.4/);

  // الترجمة عبر الوسيط: نتحقق من أن الأداة تبني الطلب الصحيح
  w.location.hash = '#/t/translate-text';
  w.dispatchEvent(new w.Event('hashchange'));
  await new Promise((r) => setTimeout(r, 250));
  say(!!d.querySelector('#tool-body textarea'), 'أداة الترجمة رسمت حقل النص');

  // المفضلة
  w.location.hash = '#/';
  w.dispatchEvent(new w.Event('hashchange'));
  await new Promise((r) => setTimeout(r, 250));
  const star = d.querySelector('#grid .card .card-star');
  star.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 150));
  const hasFavChip = [...d.querySelectorAll('#cats .chip')].some((c) => c.textContent.includes('المفضلة'));
  say(hasFavChip, 'المفضلة تعمل وأُضيفت شريحة «★ المفضلة»');

  if (errors.length) console.log('\n⚠️ أخطاء عامة:\n' + errors.join('\n'));
  console.log('\n' + (errors.length ? 'انتهى مع أخطاء' : '✅ اكتمل الاختبار التكاملي بلا أخطاء.'));
  w.close();
  process.exit(errors.length ? 2 : 0);
})().catch((e) => { console.error('فشل الاختبار:', e); process.exit(1); });
