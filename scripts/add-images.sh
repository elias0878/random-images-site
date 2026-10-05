#!/usr/bin/env bash
# add-images.sh — إضافة صور دفعة واحدة ثم تحديث الفهرس ورفعها إلى GitHub
# الاستخدام:  ./scripts/add-images.sh /path/to/folder-or-zip
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SRC="${1:-}"
if [ -z "$SRC" ] || [ ! -e "$SRC" ]; then
  echo "الاستخدام: ./scripts/add-images.sh <مجلد أو ملف مضغوط>"
  exit 1
fi

TMP=""
if [ -f "$SRC" ]; then
  case "$SRC" in
    *.zip) TMP="$(mktemp -d)"; echo "← فك الضغط..."; unzip -q -o "$SRC" -d "$TMP" ;;
    *.rar) TMP="$(mktemp -d)"; echo "← فك الضغط..."; unrar x -inul -o+ "$SRC" "$TMP/" ;;
    *.7z)  TMP="$(mktemp -d)"; echo "← فك الضغط..."; 7z x -y -o"$TMP" "$SRC" >/dev/null ;;
    *) echo "✗ صيغة غير مدعومة: $SRC"; exit 1 ;;
  esac
  SRC="$TMP"
fi

echo "← نسخ الصور إلى images/ ..."
before=$(find images -type f | wc -l)
find "$SRC" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.gif' \
  -o -iname '*.webp' -o -iname '*.avif' -o -iname '*.bmp' -o -iname '*.svg' \) \
  -exec cp -n {} images/ \;
after=$(find images -type f | wc -l)
echo "  تمت إضافة $((after - before)) صورة (المجموع: $after)"

[ -n "$TMP" ] && rm -rf "$TMP"

echo "← تحديث الفهرس..."
node scripts/build-index.mjs

echo "← رفع إلى GitHub..."
git add -A
git commit -m "إضافة صور جديدة ($after صورة)" || echo "  لا يوجد تغيير جديد"
git push

echo "✓ انتهى. سيتم التحديث على الموقع خلال دقيقة تقريباً."
