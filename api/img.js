/**
 * api/img.js — تمرير الصور من المصدر إلى المتصفح عبر نطاق موقعك
 * ------------------------------------------------------------------
 * لماذا؟ بعض مزوّدي الإنترنت يحجبون شبكات CDN التي تُقدّم الصور
 * (Fastly مثلاً)، فيصل الموقع لكن لا تصل الصور.
 * الحلّ: الصور تُجلب من المصدر إلى هنا ثم تُسلَّم لمتصفحك من نطاقنا.
 * لا تُخزَّن أي صورة: الملفات تُمرَّر مباشرة، والكاش المؤقت على شبكة Vercel فقط.
 *
 * القيد الأمني: يعمل فقط مع النطاقات المسموح بها أدناه — لا يصلح كوسيط مفتوح.
 */

/** النطاقات المسموح بها (نطاقات المصدر فقط) */
const ALLOWED_HOSTS = new Set([
  // Picsum (صور Unsplash)
  'picsum.photos',
  'fastly.picsum.photos',
  'i.picsum.photos',
  // ويكيميديا كومنز
  'upload.wikimedia.org',
  'commons.wikimedia.org',
  'thumb.wikimedia.org',
  // Openverse (صور برخص مشاع إبداعي)
  'api.openverse.org',
  // Perchance: روابط الصور التي يوفّرها صاحب الموقع بنفسه من معرضه
  'user-uploads.perchance.org'
]);

const MAX_BYTES = 6 * 1024 * 1024;   // حد أقصى لحجم الصورة

export default async function handler(req, res) {
  const raw = req.query && req.query.u;

  if (!raw || typeof raw !== 'string') {
    res.status(400).json({ error: 'المعامل u مطلوب' });
    return;
  }

  let target;
  try {
    target = new URL(raw);
  } catch {
    res.status(400).json({ error: 'رابط غير صالح' });
    return;
  }

  if (target.protocol !== 'https:') {
    res.status(400).json({ error: 'يُسمح بـ https فقط' });
    return;
  }

  if (!ALLOWED_HOSTS.has(target.hostname)) {
    res.status(403).json({ error: 'نطاق غير مسموح: ' + target.hostname });
    return;
  }

  const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; random-images-site/1.0)',
    'Accept': 'image/avif,image/webp,image/jpeg,image/png,image/*;q=0.8'
  };

  const grab = (u) => fetch(u, { redirect: 'follow', headers: HEADERS });

  try {
    let upstream = await grab(target.toString());

    // تراجع تلقائي: بعض المصادر ترفض الطلب مع معاملات الاستعلام
    // (مثال: Openverse ترفض full_size من بعض السيرفرات) — نجرب بلا معاملات.
    if (!upstream.ok && target.search) {
      const bare = new URL(target.toString());
      bare.search = '';
      const alt = await grab(bare.toString());
      if (alt.ok) upstream = alt;
    }

    if (!upstream.ok) {
      res.status(502).json({ error: 'المصدر أرجع ' + upstream.status });
      return;
    }

    const type = upstream.headers.get('content-type') || 'image/jpeg';
    if (!/^image\//i.test(type)) {
      res.status(502).json({ error: 'المحتوى ليس صورة: ' + type });
      return;
    }

    const length = Number(upstream.headers.get('content-length') || 0);
    if (length && length > MAX_BYTES) {
      res.status(413).json({ error: 'حجم الصورة كبير جداً' });
      return;
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    if (buf.length > MAX_BYTES) {
      res.status(413).json({ error: 'حجم الصورة كبير جداً' });
      return;
    }

    res.setHeader('Content-Type', type);
    res.setHeader('Content-Length', String(buf.length));
    // كاش على شبكة Vercel (وليس عند المستخدم) — يقلّل الطلبات ويسرّع العرض
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).send(buf);
  } catch (e) {
    res.status(502).json({ error: 'تعذّر جلب الصورة: ' + (e && e.message ? e.message : 'خطأ') });
  }
}
