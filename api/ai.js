/**
 * api/ai.js — توليد صورة بالذكاء الاصطناعي عبر مزوّد بواجهة معلنة
 * ------------------------------------------------------------------
 * المفتاح يُقرأ من متغيّرات البيئة على Vercel (HF_TOKEN) ولا يوضع في الكود
 * ولا يصل إلى المتصفح أبداً.
 * إن لم يكن المفتاح مضبوطاً، تُرجع الدالة رسالة واضحة بدل أن تتعطّل الصفحة.
 *
 * لإضافته: Vercel → Project → Settings → Environment Variables → HF_TOKEN
 */

const MODEL = process.env.AI_MODEL || 'black-forest-labs/FLUX.1-schnell';
const MAX_PROMPT = 380;
const MAX_BYTES = 8 * 1024 * 1024;

export default async function handler(req, res) {
  const token = process.env.HF_TOKEN;

  if (!token) {
    res.status(503).json({
      error: 'لم يُضبط مفتاح التوليد (HF_TOKEN) بعد',
      hint: 'أضف المفتاح في متغيّرات بيئة Vercel ثم اجعل source = "ai" في config.js'
    });
    return;
  }

  const prompt = String((req.query && req.query.prompt) || '').slice(0, MAX_PROMPT).trim();
  if (!prompt) {
    res.status(400).json({ error: 'المعامل prompt مطلوب' });
    return;
  }

  const width = Math.min(Math.max(Number(req.query.width) || 1200, 256), 1536);
  const height = Math.min(Math.max(Number(req.query.height) || 750, 256), 1536);
  const negative = String((req.query.negative) || '').slice(0, 200);
  const seed = String(req.query.seed || Math.floor(Math.random() * 1e9)).slice(0, 20);

  try {
    const upstream = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Accept': 'image/png,image/jpeg'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width,
          height,
          seed: Number(seed),
          negative_prompt: negative || undefined
        }
      })
    });

    if (!upstream.ok) {
      const detail = (await upstream.text()).slice(0, 200);
      res.status(502).json({ error: 'فشل التوليد (HTTP ' + upstream.status + ')', detail });
      return;
    }

    const type = upstream.headers.get('content-type') || '';
    if (!/^image\//i.test(type)) {
      res.status(502).json({ error: 'المزوّد لم يُرجع صورة', detail: type });
      return;
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    if (buf.length > MAX_BYTES) {
      res.status(413).json({ error: 'الصورة المولَّدة كبيرة جداً' });
      return;
    }

    res.setHeader('Content-Type', type);
    res.setHeader('Content-Length', String(buf.length));
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=3600');
    res.setHeader('X-Generated-With', MODEL);
    res.status(200).send(buf);
  } catch (e) {
    res.status(502).json({ error: 'تعذّر التوليد: ' + (e && e.message ? e.message : 'خطأ') });
  }
}
