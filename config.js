/* ============================================================
   config.js — إعدادات الموقع
   لا يظهر من هذا الملف أي شيء في الواجهة.
   يكفي أن تغيّر قيمة  source  لتغيير مصدر الصور:
       'picsum'    → قائمة كبيرة من الصور (نحو 993 صورة)
       'wikimedia' → صور مختارة من ويكيميديا كومنز
       'folder'    → الصور الموجودة في مجلد images/
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
    width: 1200,           // أبعاد الصورة المعروضة (أصغر = أسرع على الشبكات البطيئة)
    height: 750,
    format: 'jpg',         // 'jpg' أو 'webp' (webp أصغر حجماً)
    cacheHours: 12
  },

  /* ---------- المصدر 2: ويكيميديا كومنز ---------- */
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

  /* ---------- المصدر 3: مجلد images/ داخل المستودع ---------- */
  folder: {
    indexFile: 'images.json'
  }
};
