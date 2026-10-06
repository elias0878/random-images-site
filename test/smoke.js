/* اختبار دخاني: يحمّل المحرّك + كل ملفات الأدوات داخل jsdom ويرسم كل أداة
   التشغيل: node test/smoke.js        (من جذر المشروع)
*/
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const dom = new JSDOM('<!doctype html><html lang="ar" dir="rtl"><body><div id="app"></div></body></html>', { runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window;
w.fetch = () => Promise.resolve({ ok: false, status: 0, statusText: 'offline-test', json: () => Promise.resolve({}), text: () => Promise.resolve('') });
w.URL.createObjectURL = () => 'blob:test';
w.speechSynthesis = undefined;

const load = (rel) => {
  w.eval(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
};

let errors = [];
const toolFiles = fs.readdirSync(path.join(ROOT, 'js/tools')).filter((f) => f.endsWith('.js')).sort();
load('js/ui.js');
for (const f of toolFiles) {
  try { load('js/tools/' + f); } catch (e) { errors.push('تحميل ' + f + ': ' + e.message); }
}

const T = w.TOOLS || [];
const ids = T.map((t) => t.id);
const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
const cats = {};
T.forEach((t) => (cats[t.cat] = (cats[t.cat] || 0) + 1));

let drawn = 0;
for (const tool of T) {
  const root = w.document.createElement('div');
  w.document.body.appendChild(root);
  try { tool.render(root); drawn++; } catch (e) { errors.push('رسم ' + tool.id + ': ' + e.message); }
  root.remove();
}

console.log('ملفات الأدوات : ' + toolFiles.join(', '));
console.log('عدد الأدوات   : ' + T.length);
console.log('التصنيفات     : ' + JSON.stringify(cats));
console.log('مكرر          : ' + (dup.length ? dup.join(', ') : 'لا يوجد ✅'));
console.log('ناقص الحقول   : ' + (T.filter((t) => !t.id || !t.title || !t.desc || !t.cat || !t.icon || typeof t.render !== 'function').map((t) => t.id).join(', ') || 'لا يوجد ✅'));
console.log('نجح رسمها     : ' + drawn + '/' + T.length);
if (errors.length) { console.log('\n❌ الأخطاء:\n' + errors.join('\n')); w.close(); process.exit(1); }
console.log('\n✅ كل الأدوات تُسجَّل وتُرسم بلا أخطاء.');
w.close();
process.exit(0);
