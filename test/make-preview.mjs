/* يبني /home/user/preview.html — الموقع كاملاً في ملف واحد (يعمل بلا سيرفر وبلا إنترنت) */
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
html = html.replace('</body>', '<!-- معاينة مستقلة: كل شيء مضمّن في هذا الملف الواحد -->\n</body>');
const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
// مهم: نستخدم دالة إرجاع لتفادي تفسير $1 و $& و $` داخل الكود المدموج
html = html.replace('<link rel="stylesheet" href="styles.css">', () => '<style>\n' + css + '\n</style>');
const files = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
for (const f of files) {
  const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
  html = html.replace('<script src="' + f + '"></script>', () => '<script>\n/* ==== ' + f + ' ==== */\n' + code + '\n</script>');
}
// ملاحظة: لا نستبدل </body> بعد الدمج (كود الأدوات يحتوي </body> داخله)
const out = '/home/user/preview.html';
fs.writeFileSync(out, html);
console.log('✅ كُتبت المعاينة:', out, (fs.statSync(out).size / 1024).toFixed(0) + ' كيلوبايت');
console.log('   الملفات المضمّنة:', files.join(', '));
