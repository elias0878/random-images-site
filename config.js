/* ============================================================
   config.js — إعدادات الموقع
   لا يظهر من هذا الملف أي شيء في الواجهة.
   يكفي أن تغيّر قيمة  source  لتغيير مصدر الصور:
       'picsum'    → قائمة كبيرة من الصور (نحو 993 صورة)
       'openverse' → ملايين الصور برخص حرة (أكبر قائمة متاحة)
       'wikimedia' → صور مختارة من ويكيميديا كومنز
       'folder'    → الصور الموجودة في مجلد images/
       'gallery'   → روابط صور تختارها أنت في gallery.json
       'ai'        → توليد صورة جديدة بالذكاء الاصطناعي (يحتاج مفتاحاً)
   ============================================================ */
window.SITE_CONFIG = {

  /* ---------- المصدر ----------
     الصور تأتي من هذا المصدر فقط، ولا يُخلط معه أي مصدر آخر. */
  source: 'picsum',

  /* ---------- التمرير عبر نطاقنا ----------
     true  = الصور تُمرَّر عبر /api/img (يحلّ مشكلة حجب شبكات CDN عند بعض المزوّدين)
     false = المتصفح يجلب الصور من المصدر مباشرة */
  useProxy: true,

  /* لا تُعرض نفس الصورة مرتين على التوالي */
  avoidRepeat: true,

  /* صورة احتياطية فورية لو تعذّر جلب القائمة (من نفس المصدر) */
  allowEmergencyImage: true,

  /* ---------- المصدر 1: Picsum ---------- */
  picsum: {
    pages: 10,             // 10 صفحات × 100 = 993 صورة
    limitPerPage: 100,
    width: 1200,           // أبعاد الصورة المعروضة
    height: 750,
    format: 'jpg',         // 'jpg' أو 'webp' (webp أصغر حجماً)
    cacheHours: 12
  },

  /* ---------- المصدر 2: Openverse (أكبر قائمة حرة) ----------
     أكثر من 800 مليون صورة برخص مشاع إبداعي من Flickr والمتاحف وأرشيفات عامة.
     الصور المصغّرة تُقدَّم من نطاق Openverse نفسه (سريع وآمن للتمرير). */
  openverse: {
    queries: [            // كل كلمة تُجلب بقائمة صور — أضف ما تشاء
      'landscape', 'nature', 'mountains', 'ocean', 'forest',
      'wildlife', 'flowers', 'architecture', 'city', 'sky'
    ],
    pageSize: 20,         // الحد الأقصى الذي يسمح به الـ API لكل صفحة
    pagesPerQuery: 1,     // 1 = 20 صورة لكل كلمة (احترام حد 20 طلباً في الدقيقة)
    license: '',          // فلترة برخصة: '' (الكل) أو 'cc0' أو 'by' أو 'by-sa'
    useThumbnail: true,   // true = صور مصغّرة سريعة من نطاق Openverse
    cacheHours: 24
  },

  /* ---------- المصدر 3: ويكيميديا كومنز ---------- */
  wikimedia: {
    width: 1200,
    limitPerPage: 50,      // الحد الأقصى لكل طلب (يفرضه الـ API)
    roundsPerCategory: 3,  // عدد الطلبات المتتابعة لكل تصنيف
    cacheHours: 12,
    categories: [
      'Featured pictures of landscapes',
      'Quality images of landscapes',
      'Featured pictures of plants',
      'Quality images of birds',
      'Featured pictures of animals'
    ]
  },

  /* ---------- المصدر 4: مجلد images/ داخل المستودع ---------- */
  folder: {
    indexFile: 'images.json'
  },

  /* ---------- المصدر 5: معرضك الخاص (روابط تختارها أنت) ----------
     ضع روابط صورك في ملف gallery.json ثم اجعل source = 'gallery' */
  gallery: {
    file: 'gallery.json'
  },

  /* ---------- المصدر 5: توليد صور بالذكاء الاصطناعي ----------
     يحتاج مفتاحاً مجانياً من Hugging Face يُضبط في متغيّرات بيئة Vercel باسم HF_TOKEN
     (لا يوضع المفتاح هنا أبداً — يبقى على السيرفر فقط).
     بعد إضافة المفتاح: اجعل source = 'ai'  وسيعمل فوراً. */
  ai: {
    style: '',             // نمط يُضاف لكل وصف، مثال: ', digital art, vivid colors'
    width: 1200,
    height: 750,
    negativePrompt: 'text, watermark, logo, signature, blurry, low quality',
    prompts: [             // قائمة كبيرة من الأوصاف — تُدمج مع الأنماط عشوائياً
      'a serene mountain lake at sunrise',
      'a vast desert with golden sand dunes',
      'a dense green forest with morning mist',
      'a calm ocean with gentle waves at sunset',
      'a snowy mountain peak under a starry sky',
      'a field of colorful wildflowers',
      'a waterfall in a tropical rainforest',
      'a quiet beach with turquoise water',
      'a canyon with layered red rocks',
      'a lavender field stretching to the horizon',
      'a lone tree in a green valley',
      'an old stone bridge over a river',
      'a lighthouse on a rocky coast at dusk',
      'rolling hills covered in green grass',
      'a frozen lake surrounded by pine trees',
      'a hot air balloon over a valley',
      'a wooden cabin in a snowy forest',
      'a river winding through green hills',
      'a coral reef seen from above',
      'a rainy city street at night with reflections',
      'a futuristic city skyline at sunset',
      'a cozy bookstore interior',
      'a traditional old town alley',
      'a university library with tall windows',
      'a farmer market full of fresh produce',
      'a cup of coffee on a wooden table',
      'a bowl of colorful fruit on a table',
      'a bicycle leaning against a wall',
      'a vintage car on a country road',
      'a sailboat on a calm bay',
      'a train crossing a tall bridge',
      'a small airplane above the clouds',
      'a telescope pointed at the night sky',
      'planet earth seen from space',
      'a galaxy with bright colorful stars',
      'the surface of the moon with craters',
      'a rover exploring a red planet',
      'a space station orbiting earth',
      'a comet passing near a blue planet',
      'an abstract pattern of flowing colors',
      'a geometric mosaic of blue and gold',
      'a paper cut art scene of mountains',
      'a watercolor painting of a garden',
      'an oil painting of a stormy sea',
      'a minimal design of circles and lines',
      'a stained glass window pattern',
      'a vintage travel poster of a coast',
      'a fantasy castle on a floating island',
      'a dragon flying over snowy peaks',
      'a magical glowing forest at night',
      'a robot in a field of sunflowers',
      'an underwater city with glowing lights',
      'a steampunk clockwork machine',
      'a floating island with waterfalls',
      'a knight standing on a cliff',
      'a phoenix rising from embers',
      'a spacecraft landing on an alien world',
      'a map of an imaginary continent',
      'an ancient temple in the jungle'
    ]
  }
};
