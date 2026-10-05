#!/usr/bin/env node
/**
 * build.mjs — بناء الموقع للنشر (Vercel)
 * 1) يحدّث images.json من محتوى مجلد images
 * 2) ينسخ كل ملفات الموقع إلى مجلد public/ (مجلد المخرجات)
 */
import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT  = join(ROOT, 'public');

console.log('→ تحديث فهرس الصور...');
execFileSync(process.execPath, [join(ROOT, 'scripts', 'build-index.mjs')], { cwd: ROOT, stdio: 'inherit' });

console.log('→ تجهيز مجلد المخرجات public/ ...');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const STATIC_FILES = ['index.html', 'styles.css', 'config.js', 'app.js', 'images.json', 'robots.txt', '.nojekyll'];

for (const file of STATIC_FILES) {
  const src = join(ROOT, file);
  if (existsSync(src)) cpSync(src, join(OUT, file));
}

const IMAGES = join(ROOT, 'images');
if (existsSync(IMAGES)) {
  cpSync(IMAGES, join(OUT, 'images'), { recursive: true });
  console.log('→ تم نسخ مجلد images');
} else {
  mkdirSync(join(OUT, 'images'), { recursive: true });
}

console.log('✓ البناء اكتمل — مجلد public/ جاهز للنشر');
