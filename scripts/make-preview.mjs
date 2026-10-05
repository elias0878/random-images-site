#!/usr/bin/env node
/**
 * make-preview.mjs — ينشئ ملف preview.html مستقل يعمل بلا إنترنت
 * (يضمّن التصميم والكود والصور في ملف واحد) لمعاينة الواجهة فقط.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES = join(ROOT, 'images');
const OUT = join(ROOT, '..', 'preview.html');

const read = (f) => readFileSync(join(ROOT, f), 'utf8');

let html = read('index.html');
const css = read('styles.css');
const js = read('app.js');

// استبدال الموارد الخارجية بمحتوى مضمّن
html = html.replace(/<link rel="stylesheet"[^>]*>/, '');
html = html.replace(/<script src="config\.js"><\/script>/, '');
html = html.replace(/<script src="app\.js"><\/script>/, '');

// جمع صور مجلد images كـ data URI
const files = existsSync(IMAGES)
  ? readdirSync(IMAGES).filter((f) => /\.(jpe?g|png|gif|webp|avif|bmp)$/i.test(f)).sort()
  : [];

const dataUris = files.map((f) => {
  const ext = extname(f).toLowerCase().replace('.', '');
  const mime = ext === 'jpg' ? 'jpeg' : ext;
  return `data:image/${mime};base64,${readFileSync(join(IMAGES, f)).toString('base64')}`;
});

const inline = `
<style>
${css}
</style>
<script>
/* معاينة مستقلة: وضع "مجلد الصور" مع الصور مضمّنة (لا تحتاج إنترنت) */
window.SITE_CONFIG = { source: 'folder' };
(function () {
  const IMGS = ${JSON.stringify(dataUris)};
  window.fetch = function () {
    return Promise.resolve({
      ok: true, status: 200,
      headers: { get: function () { return 'application/json'; } },
      text: function () { return Promise.resolve(JSON.stringify({ count: IMGS.length, images: IMGS })); },
      json: function () { return Promise.resolve({ count: IMGS.length, images: IMGS }); }
    });
  };
})();
</script>
<script>
${js}
</script>
`;

writeFileSync(OUT, html.replace('</body>', inline + '\n</body>'), 'utf8');
console.log(`✓ preview.html (${dataUris.length} صورة مضمّنة) — للمعاينة بلا إنترنت`);
