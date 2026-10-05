#!/usr/bin/env python3
"""
optimize-images.py — (اختياري) تصغير حجم الصور في مجلد images/
يقلّل الأبعاد إلى 1920 بكسل ويضغط الملف، مع نسخة احتياطية للأصلية.

الاستخدام:
    python3 scripts/optimize-images.py                 # تصغير إلى 1920px، جودة 82
    python3 scripts/optimize-images.py --max 1280 --quality 78
    python3 scripts/optimize-images.py --to-webp       # تحويل إلى WebP (أصغر حجماً)

يتطلب مكتبة Pillow:  pip install Pillow
"""
import argparse
import os
import shutil
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("✗ مكتبة Pillow غير مثبّتة. نفّذ:  pip install Pillow")

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
IMAGES = os.path.join(ROOT, "images")
BACKUP = os.path.join(ROOT, "images_original")
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif"}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--max", type=int, default=1920, help="أقصى بُعد بالبكسل (افتراضي 1920)")
    ap.add_argument("--quality", type=int, default=82, help="جودة الضغط 1-100 (افتراضي 82)")
    ap.add_argument("--to-webp", action="store_true", help="تحويل الصور إلى WebP")
    ap.add_argument("--no-backup", action="store_true", help="بلا نسخة احتياطية")
    args = ap.parse_args()

    if not os.path.isdir(IMAGES):
        sys.exit("✗ مجلد images غير موجود")

    os.makedirs(BACKUP, exist_ok=True)
    total_before = total_after = 0
    changed = 0

    for name in sorted(os.listdir(IMAGES)):
        src = os.path.join(IMAGES, name)
        if not os.path.isfile(src):
            continue
        ext = os.path.splitext(name)[1].lower()
        if ext not in EXTS:
            continue

        size_before = os.path.getsize(src)
        total_before += size_before

        try:
            im = Image.open(src)
            im.load()
        except Exception as e:  # ملف تالف
            print(f"  ! تخطي {name}: {e}")
            total_after += size_before
            continue

        if im.mode in ("RGBA", "P") and ext in {".jpg", ".jpeg", ".webp"}:
            im = im.convert("RGB")

        im.thumbnail((args.max, args.max), Image.LANCZOS)

        if args.to_webp:
            out = os.path.join(IMAGES, os.path.splitext(name)[0] + ".webp")
        else:
            out = src

        if not args.no_backup and not args.to_webp:
            shutil.copy2(src, os.path.join(BACKUP, name))

        if out.lower().endswith((".jpg", ".jpeg")):
            im.save(out, "JPEG", quality=args.quality, optimize=True, progressive=True)
        elif out.lower().endswith(".png"):
            im.save(out, "PNG", optimize=True)
        else:
            im.save(out, "WEBP", quality=args.quality, method=5)

        if args.to_webp and out != src:
            os.remove(src)

        size_after = os.path.getsize(out)
        total_after += size_after
        changed += 1
        print(f"  ✓ {name}: {size_before/1024:.0f}KB → {size_after/1024:.0f}KB")

    if changed:
        print(f"\n✓ تم تحسين {changed} صورة — "
              f"{total_before/1048576:.1f}MB → {total_after/1048576:.1f}MB")
        if not args.no_backup:
            print(f"  النسخ الأصلية في: images_original/")
        print("\n← الآن نفّذ:  npm run build && git add -A && git commit -m \"تحسين الصور\" && git push")
    else:
        print("لا توجد صور لتحسينها.")


if __name__ == "__main__":
    main()
