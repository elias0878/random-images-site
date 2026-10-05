# 🖼️ صور عشوائية — Random Images Site

موقع بسيط جداً: **زر واحد** فقط، وعند الضغط عليه تظهر **صورة عشوائية** من مجلد `images/`.

لا توجد قاعدة بيانات، ولا تسجيل دخول، ولا أي شيء معقّد. الموقع ثابت (Static) وخفيف وسريع.

---

## كيف يعمل؟

```
images/            ← ضع كل صورك هنا (jpg / png / gif / webp / avif / svg)
    ↓
scripts/build-index.mjs   ← يقرأ المجلد وينشئ images.json
    ↓
images.json        ← قائمة كل الصور
    ↓
app.js             ← يختار مساراً عشوائياً ويعرضه عند الضغط على الزر
```

## البنية

| الملف | الوظيفة |
|---|---|
| `index.html` | الصفحة، تحوي زر «فتح الصورة» فقط |
| `styles.css` | التصميم |
| `app.js` | منطق الاختيار العشوائي وعرض الصورة |
| `images/` | **مجلد الصور** — ضع صورك هنا |
| `images.json` | فهرس الصور (يُولَّد تلقائياً — لا تعدّله يدوياً) |
| `scripts/build-index.mjs` | يُنشئ `images.json` من محتوى مجلد `images` |
| `scripts/serve.mjs` | سيرفر محلي للمعاينة |
| `.github/workflows/build-index.yml` | يحدّث `images.json` تلقائياً عند رفع صور جديدة |

## إضافة صور

**الطريقة الأولى — تلقائية (الأسهل):**
1. افتح مجلد `images/` في المستودع على GitHub.
2. `Add file → Upload files` وارفع صورك.
3. `Commit changes` — سيقوم GitHub Actions بتحديث `images.json` تلقائياً.

**الطريقة الثانية — من جهازك:**
```bash
cp ~/my-pictures/* images/
npm run build      # تحديث images.json
git add . && git commit -m "صور جديدة" && git push
```

**الطريقة الثالثة — سكربت جاهز:**
```bash
./scripts/add-images.sh /path/to/folder-or-zip
```

## المعاينة محلياً

```bash
npm run dev
# ثم افتح http://localhost:3000
```

## النشر

الموقع منشور على **Vercel**. أي `push` على فرع `main` ينشر تحديثاً تلقائياً.

---

## ملاحظات

- الصور المتاحة حالياً هي صور تجريبية، استبدلها بصورك.
- الاختيار العشوائي لا يعرض نفس الصورة مرتين متتاليتين.
- الصيغ المدعومة: `jpg, jpeg, png, gif, webp, avif, bmp, svg`
- لا يوجد حد لعدد الصور، لكن يُفضّل أن يكون حجم الصورة الواحدة أقل من 5 ميجابايت حتى يبقى الموقع سريعاً.
