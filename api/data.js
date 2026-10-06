/**
 * api/data.js — تمرير استجابات JSON من المصدر (قوائم الصور) عبر نطاق موقعك
 * -------------------------------------------------------------------------
 * نفس سبب api/img.js: لضمان وصول القائمة حتى لو كان المصدر محجوباً على شبكة الزائر.
 * لا يُخزَّن شيء — مجرد تمرير، والكاش المؤقت على شبكة Vercel فقط.
 */

const ALLOWED_HOSTS = new Set([
  'picsum.photos',
  'commons.wikimedia.org',
  'api.openverse.org'
]);

const MAX_BYTES = 3 * 1024 * 1024;

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

  if (target.protocol !== 'https:' || !ALLOWED_HOSTS.has(target.hostname)) {
    res.status(403).json({ error: 'رابط غير مسموح' });
    return;
  }

  try {
    const upstream = await fetch(target.toString(), {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; random-images-site/1.0)',
        'Accept': 'application/json'
      }
    });

    if (!upstream.ok) {
      res.status(502).json({ error: 'المصدر أرجع ' + upstream.status });
      return;
    }

    const text = await upstream.text();
    if (text.length > MAX_BYTES) {
      res.status(413).json({ error: 'الاستجابة كبيرة جداً' });
      return;
    }

    // نتأكد أنها JSON صالحة قبل تمريرها
    JSON.parse(text);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
    res.status(200).send(text);
  } catch (e) {
    res.status(502).json({ error: 'تعذّر جلب القائمة: ' + (e && e.message ? e.message : 'خطأ') });
  }
}
