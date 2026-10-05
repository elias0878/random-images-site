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
const ONLINE_SAMPLES = Number(process.env.PREVIEW_SAMPLES || 10);

const read = (f) => readFileSync(join(ROOT, f), 'utf8');

/* جلب صور حقيقية من المصدر المحدَّد في config.js لتضمينها في المعاينة */
async function fetchOnlineSamples(n) {
  try {
    const src = read('config.js').match(/source:\s*'([^']+)'/)?.[1];
    if (src !== 'picsum') return null;

    const page = 1 + Math.floor(Math.random() * 5);
    const r = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=100`);
    if (!r.ok) return null;
    const list = await r.json();

    const picks = [];
    const used = new Set();
    while (picks.length < n && used.size < list.length) {
      const i = Math.floor(Math.random() * list.length);
      if (used.has(i)) continue;
      used.add(i);
      picks.push(list[i]);
    }

    const out = [];
    for (const p of picks) {
      const res = await fetch(`https://picsum.photos/id/${p.id}/1000/625`);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      out.push({
        uri: `data:image/jpeg;base64,${buf.toString('base64')}`,
        credit: p.author ? '© ' + p.author + ' · Unsplash' : 'Unsplash'
      });
    }
    return out.length ? out : null;
  } catch (e) {
    return null;
  }
}

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

// جمع صور: من المصدر المباشر إن أمكن، وإلا من مجلد images
let dataUris = [];
let credits = [];

const online = await fetchOnlineSamples(ONLINE_SAMPLES);
if (online) {
  dataUris = online.map((o) => o.uri);
  credits = online.map((o) => o.credit);
  console.log(`  (تم تنزيل ${online.length} صورة حقيقية من Picsum لتضمينها في المعاينة)`);
} else if (files.length) {
  dataUris = files.map((f) => {
    const ext = extname(f).toLowerCase().replace('.', '');
    const mime = ext === 'jpg' ? 'jpeg' : ext;
    return `data:image/${mime};base64,${readFileSync(join(IMAGES, f)).toString('base64')}`;
  });
  credits = files.map((f) => f.replace(/\.[^.]+$/, ''));
} else {
  console.error('✗ لا توجد صور للمعاينة');
  process.exit(1);
}

const inline = `
<style>
${css}
</style>
<script>
/* ============================================================
   معاينة مستقلة تعمل بلا إنترنت:
   نفس تصميم الموقع ونفس الكود، لكن الصور مضمّنة في الملف
   بدل جلبها من الإنترنت (لأن المعاينة داخل إطار بلا شبكة).
   الموقع الحقيقي: https://random-images-site.vercel.app
   ============================================================ */
window.SITE_CONFIG = { source: 'folder' };
(function () {
  const IMGS = ${JSON.stringify(dataUris)};
  const CREDITS = ${JSON.stringify(credits)};
  window.fetch = function () {
    const payload = { count: IMGS.length, images: IMGS, credits: CREDITS };
    return Promise.resolve({
      ok: true, status: 200,
      headers: { get: function () { return 'application/json'; } },
      text: function () { return Promise.resolve(JSON.stringify(payload)); },
      json: function () { return Promise.resolve(payload); }
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
