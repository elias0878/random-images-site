#!/usr/bin/env node
/**
 * build-index.mjs
 * يقرأ كل الصور داخل مجلد images/ وينشئ ملف images.json
 * يُشغَّل محلياً أو تلقائياً عبر GitHub Actions عند كل رفع صور.
 */
import { readdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT      = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGES_DIR = join(ROOT, 'images');
const OUT_FILE   = join(ROOT, 'images.json');

const EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp', '.svg']);

function walk(dir, prefix = '') {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    const rel  = prefix ? posix.join(prefix, entry.name) : entry.name;

    if (entry.isDirectory()) {
      out.push(...walk(full, rel));
    } else if (EXTS.has(entry.name.toLowerCase().slice(entry.name.lastIndexOf('.')))) {
      out.push({ path: posix.join('images', rel), size: statSync(full).size });
    }
  }
  return out;
}

if (!existsSync(IMAGES_DIR)) {
  console.error('✗ مجلد images غير موجود');
  process.exit(1);
}

const files = walk(IMAGES_DIR).sort((a, b) => a.path.localeCompare(b.path, 'en'));
const images = files.map((f) => f.path);

const payload = {
  generatedAt: new Date().toISOString(),
  count: images.length,
  totalBytes: files.reduce((s, f) => s + f.size, 0),
  images,
};

writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf8');

const mb = (payload.totalBytes / 1048576).toFixed(2);
console.log(`✓ images.json تم إنشاؤه — ${images.length} صورة (${mb} MB)`);
if (images.length === 0) console.log('  تنبيه: مجلد images فارغ.');
