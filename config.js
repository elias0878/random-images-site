/* ============================================================
   config.js — إعدادات الموقع
   لا يظهر من هذا الملف أي شيء في الواجهة.
   يكفي أن تغيّر قيمة  source  لتغيير مصدر الصور:
       'picsum'    → مجموعة صور كبيرة مباشرة من الإنترنت (الافتراضي)
       'wikimedia' → صور مختارة من ويكيميديا كومنز (مباشرة من الإنترنت)
       'folder'    → الصور الموجودة في مجلد images/ داخل المستودع
   ============================================================ */
window.SITE_CONFIG = {

  /* المصدر الحالي */
  source: 'picsum',

  /* لا تُعرض نفس الصورة مرتين على التوالي */
  avoidRepeat: true,

  /* مدة الاحتفاظ بقائمة الصور في ذاكرة المتصفح (بالساعات) */
  cacheHours: 12,

  /* ---------- المصدر 1: Picsum (صور Unsplash، مسموح ربطها مباشرة) ---------- */
  picsum: {
    pages: 10,            // 10 صفحات × 100 = ~993 صورة
    limitPerPage: 100,
    width: 1600,          // العرض المطلوب للصورة المعروضة
    height: 1000,         // الارتفاع المطلوب
    cacheHours: 12
  },

  /* ---------- المصدر 2: ويكيميديا كومنز (صور مختارة، حرة الاستخدام) ---------- */
  wikimedia: {
    width: 1600,          // عرض الصورة المصغّرة
    limitPerPage: 50,     // الحد الأقصى لكل طلب (يفرضه الـ API)
    roundsPerCategory: 3,  // عدد الطلبات المتتابعة لكل تصنيف (مع مهلة بينها)
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
