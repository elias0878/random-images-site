# 🖼️ صور عشوائية — Random Images Site

موقع بسيط جداً: **زر واحد** فقط («فتح الصورة»)، وعند الضغط عليه تظهر **صورة عشوائية** من مجلد `images/`.

لا قاعدة بيانات · لا تسجيل دخول · لا إعدادات · موقع ثابت (Static) سريع ومجاني بالكامل.

| | الرابط |
|---|---|
| 🌍 **الموقع المباشر** | https://random-images-site.vercel.app |
| 📦 **المستودع** | https://github.com/elias0878/random-images-site |
| 🖼️ **مجلد الصور** | https://github.com/elias0878/random-images-site/tree/main/images |

---

## كيف يعمل؟

```
images/                     ← ضع كل صورك هنا (jpg / jpeg / png / gif / webp / avif / bmp / svg)
    ↓  (تلقائياً عبر GitHub Actions)
images.json                 ← قائمة كل الصور
    ↓  (تلقائياً عبر Vercel)
app.js                      ← يختار صورة عشوائية ويعرضها عند الضغط على الزر
```

## إضافة صورك — 3 طرق

### 1) من موقع GitHub (الأسهل، بدون أي برامج)
1. افتح مجلد **images**: https://github.com/elias0878/random-images-site/tree/main/images
2. اضغط **Add file → Upload files** واسحب صورك.
3. اضغط **Commit changes**.

هذا كل شيء. بعد ~دقيقة:
- 🤖 GitHub Action يحدّث `images.json` تلقائياً.
- 🚀 Vercel ينشر الموقع من جديد.
- ✅ الصور تظهر فوراً في الموقع.

### 2) من جهازك (Git)
```bash
cp ~/pictures/* images/       # انسخ الصور
npm run build                 # تحديث images.json
git add -A && git commit -m "صور جديدة" && git push
```

### 3) سكربت جاهز (يفكّ الضغط والملفات المضغوطة)
```bash
./scripts/add-images.sh /path/to/folder     # مجلد صور
./scripts/add-images.sh /path/to/photos.zip # أو ملف مضغوط (zip / rar / 7z)
```

---

## البنية

| الملف | الوظيفة |
|---|---|
| `index.html` | الصفحة — زر «فتح الصورة» فقط |
| `styles.css` | التصميم (فاتح/داكن تلقائي حسب المتصفح) |
| `app.js` | منطق الاختيار العشوائي وعرض الصورة |
| `images/` | **مجلد الصور — ضع صورك هنا** |
| `images.json` | فهرس الصور (يُولَّد تلقائياً — لا تعدّله يدوياً) |
| `scripts/build-index.mjs` | ينشئ `images.json` من محتوى مجلد `images` |
| `scripts/build.mjs` | بناء النشر: يجهّز مجلد `public/` لـ Vercel |
| `scripts/serve.mjs` | سيرفر محلي للمعاينة |
| `scripts/add-images.sh` | إضافة صور من مجلد أو ملف مضغوط ورفعها |
| `scripts/optimize-images.py` | (اختياري) تصغير حجم الصور لتسريع الموقع |
| `.github/workflows/build-index.yml` | تحديث `images.json` تلقائياً عند رفع صور |

## المعاينة محلياً

```bash
npm run dev      # ثم افتح http://localhost:3000
```

## تسريع الموقع (اختياري)

إذا كانت صورك كبيرة (كاميرا/جوال)، صغّرها قبل الرفع:
```bash
pip install Pillow
python3 scripts/optimize-images.py --max 1920 --quality 82
npm run build && git add -A && git commit -m "تحسين الصور" && git push
```
النسخ الأصلية تُحفظ في `images_original/` (غير مرفوعة إلى المستودع).

---

## أسئلة شائعة

**هل أحتاج قاعدة بيانات؟**
لا. الموقع ثابت بالكامل، وكل ما يحتاجه هو ملف `images.json` يُولَّد تلقائياً من مجلد الصور. أسرع وأرخص وأبسط.

**هل تُعرض نفس الصورة مرتين متتاليتين؟**
لا، الكود يتجنب تكرار نفس الصورة على التوالي.

**كم صورة أستطيع رفعها؟**
بلا حد عملي. لكن يُفضّل أن تكون الصورة الواحدة أقل من 2 ميجابايت حتى يبقى الموقع سريعاً.

**الصيغ المدعومة**
`jpg, jpeg, png, gif, webp, avif, bmp, svg`

**تغيير التصميم**
عدّل `styles.css` فقط (الألوان في متغيرات `:root` أعلى الملف)، ثم ارفع التغيير.
