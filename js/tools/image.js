/* ============================================================
   tools/image.js — أدوات الصور (32 أداة)
   كل المعالجة داخل المتصفح على Canvas: لا رفع ولا تخزين.
   ============================================================ */
(function () {
  'use strict';
  const t = f.tool;

  /* ---------- مساعد: شريط التنزيل وحجم الملف ---------- */
  function dlBar(getCanvas, base) {
    const blob = async (type, q) => {
      const c = getCanvas();
      if (!c) { f.toast('نفّذ العملية على صورة أولاً', 'err'); return null; }
      return await f.canvasBlob(c, type, q);
    };
    return f.row(
      f.btn('⬇️ تنزيل PNG', async () => { const b = await blob('image/png'); if (b) f.download(base + '.png', b); }, 'primary'),
      f.btn('⬇️ تنزيل JPG', async () => { const b = await blob('image/jpeg', 0.92); if (b) f.download(base + '.jpg', b); }, 'primary'),
      f.btn('📊 قارن الأحجام', async () => {
        const p = await blob('image/png'); if (!p) return;
        const j = await blob('image/jpeg', 0.9);
        const w = await blob('image/webp', 0.9);
        f.toast('PNG ' + f.bytes(p.size) + ' · JPG ' + f.bytes(j.size) + (w ? ' · WebP ' + f.bytes(w.size) : ''));
      }, 'ghost')
    );
  }

  /* ---------- مساعد: تسجيل أداة صورة ---------- */
  function reg(o) {
    const S = {};
    const drawFn = o.apply
      ? (img, img2, v, mkCanvas) => {
        const c = mkCanvas(img.naturalWidth, img.naturalHeight);
        const x = c.getContext('2d', { willReadFrequently: true });
        if (o.pre) o.pre(x, img, img2, v, c);
        else x.drawImage(img, 0, 0);
        const d = x.getImageData(0, 0, c.width, c.height);
        o.apply(d.data, c.width, c.height, v, x, d);
        x.putImageData(d, 0, 0);
        return { canvas: c };
      }
      : o.draw;

    t({
      id: o.id, cat: 'image', icon: o.icon, title: o.title, desc: o.desc,
      render: f.imgTool({
        controls: o.controls, two: o.two, label: o.label, filename: o.id + '.png',
        textResult: o.textResult, render: o.render, onLoad: o.onLoad,
        draw: (img, img2, v, mkCanvas, ctx) => {
          const r = drawFn(img, img2, v, mkCanvas, ctx);
          S.c = r && r.canvas ? r.canvas : r;
          return r;
        },
        extra: (h) => f.el('div', { class: 'ex' },
          o.note ? f.note(o.note) : null,
          o.extra ? o.extra(h, S) : null,
          o.textResult || o.noDownload ? null : dlBar(() => S.c, o.id))
      })
    });
  }

  const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

  /* ============================================================
     1) الأبعاد والهندسة
     ============================================================ */

  reg({
    id: 'img-resize', icon: '📐', title: 'تغيير أبعاد الصورة', label: '↔️ غيّر الأبعاد',
    desc: 'تصغير أو تكبير الصورة بالبكسل أو بنسبة مئوية مع الحفاظ على التناسب',
    controls: [
      { id: 'w', label: 'العرض (بكسل)', type: 'number', value: 800, min: 1, max: 8000 },
      { id: 'h', label: 'الارتفاع (بكسل)', type: 'number', value: 600, min: 1, max: 8000 },
      { id: 'keep', label: 'الحفاظ على التناسب', type: 'select', options: [['1', 'نعم — يعدّل الآخر تلقائياً'], ['0', 'لا — أبعاد حرة (تشويه)']], value: '1' },
      { id: 'pct', label: 'أو بنسبة % (0 = تجاهل)', type: 'number', value: 0, min: 0, max: 400 }
    ],
    onLoad: ({ img, vals }) => {
      vals.w.value = img.naturalWidth;
      vals.h.value = img.naturalHeight;
    },
    draw: (img, im2, v, mkCanvas) => {
      let W = Math.max(1, Math.round(Number(v.w) || img.naturalWidth));
      let H = Math.max(1, Math.round(Number(v.h) || img.naturalHeight));
      if (Number(v.pct) > 0) {
        W = Math.max(1, Math.round(img.naturalWidth * Number(v.pct) / 100));
        H = Math.max(1, Math.round(img.naturalHeight * Number(v.pct) / 100));
      } else if (v.keep === '1' && img.naturalWidth) {
        const r = img.naturalHeight / img.naturalWidth;
        H = Math.max(1, Math.round(W * r));
      }
      const c = mkCanvas(W, H);
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = true;
      x.imageSmoothingQuality = 'high';
      x.drawImage(img, 0, 0, W, H);
      return { canvas: c, after: () => f.toast('الأبعاد الجديدة: ' + W + '×' + H) };
    },
    note: 'التكبير يزيد البكسل لكنه لا يخلق تفاصيل جديدة — التصغير عادة أفضل جودة.'
  });

  reg({
    id: 'img-crop', icon: '✂️', title: 'قص الصورة', label: '✂️ اقصص',
    desc: 'اقتطاع جزء محدد من الصورة بإحداثيات دقيقة أو نِسب جاهزة',
    controls: [
      { id: 'preset', label: 'نسبة جاهزة', type: 'select', options: [['free', 'حر'], ['1:1', 'مربع 1:1'], ['16:9', 'عريض 16:9'], ['9:16', 'رأسي 9:16'], ['4:3', '4:3'], ['3:4', '3:4'], ['2:3', '2:3'], ['3:2', '3:2']], value: 'free' },
      { id: 'x', label: 'من X', type: 'number', value: 0, min: 0 },
      { id: 'y', label: 'من Y', type: 'number', value: 0, min: 0 },
      { id: 'w', label: 'العرض', type: 'number', value: 400, min: 1 },
      { id: 'h', label: 'الارتفاع', type: 'number', value: 400, min: 1 },
      { id: 'center', label: 'توسيط القص', type: 'select', options: [['0', 'من الإحداثيات'], ['1', 'من المنتصف']], value: '0' }
    ],
    onLoad: ({ img, vals }) => {
      vals.w.value = img.naturalWidth;
      vals.h.value = img.naturalHeight;
      vals.x.max = img.naturalWidth - 1;
      vals.y.max = img.naturalHeight - 1;
    },
    draw: (img, im2, v, mkCanvas) => {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      let W = Math.min(iw, Math.max(1, Math.round(Number(v.w) || iw)));
      let H = Math.min(ih, Math.max(1, Math.round(Number(v.h) || ih)));
      if (v.preset !== 'free') {
        const [a, b] = v.preset.split(':').map(Number);
        H = Math.round(W * b / a);
        if (H > ih) { H = ih; W = Math.round(H * a / b); }
      }
      let X = v.center === '1' ? Math.round((iw - W) / 2) : Math.round(Number(v.x) || 0);
      let Y = v.center === '1' ? Math.round((ih - H) / 2) : Math.round(Number(v.y) || 0);
      X = Math.max(0, Math.min(X, iw - W));
      Y = Math.max(0, Math.min(Y, ih - H));
      const c = mkCanvas(W, H);
      c.getContext('2d').drawImage(img, X, Y, W, H, 0, 0, W, H);
      return { canvas: c, after: () => f.toast(`قص: ${W}×${H} من (${X}, ${Y})`) };
    },
    note: 'حدود القص مقيّدة بأبعاد الصورة تلقائياً.'
  });

  reg({
    id: 'img-rotate', icon: '🔄', title: 'تدوير الصورة', label: '🔄 دوّر',
    desc: 'تدوير بزوايا جاهزة أو أي زاوية مع خلفية شفافة أو ملوّنة',
    controls: [
      { id: 'angle', label: 'الزاوية', type: 'select', options: [['90', '90° يمين'], ['-90', '90° يسار'], ['180', '180°'], ['270', '270°'], ['custom', 'زاوية مخصصة']], value: '90' },
      { id: 'custom', label: 'الزاوية المخصصة (درجة)', type: 'number', value: 45, min: -360, max: 360 },
      { id: 'bg', label: 'لون الخلفية', type: 'color', value: '#ffffff' }
    ],
    draw: (img, im2, v, mkCanvas) => {
      const deg = v.angle === 'custom' ? Number(v.custom) : Number(v.angle);
      const rad = (deg * Math.PI) / 180;
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
      const W = Math.round(iw * cos + ih * sin);
      const H = Math.round(iw * sin + ih * cos);
      const c = mkCanvas(W, H);
      const x = c.getContext('2d');
      x.fillStyle = v.bg;
      x.fillRect(0, 0, W, H);
      x.translate(W / 2, H / 2);
      x.rotate(rad);
      x.drawImage(img, -iw / 2, -ih / 2);
      return { canvas: c, after: () => f.toast('دُوّرت بـ ' + deg + '°') };
    },
    note: 'اختر خلفية شفافة؟ PNG يحفظ الشفافية تلقائياً عند التنزيل.'
  });

  reg({
    id: 'img-flip', icon: '🪞', title: 'قلب الصورة (مرآة)', label: '🪞 اقلب',
    desc: 'مرآة أفقية أو رأسية أو كلتاهما',
    controls: [
      { id: 'dir', label: 'الاتجاه', type: 'select', options: [['h', 'مرآة أفقية ↔'], ['v', 'مرآة رأسية ↕'], ['hv', 'الاثنان معاً (دوران 180°)']], value: 'h' }
    ],
    draw: (img, im2, v, mkCanvas) => {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const c = mkCanvas(iw, ih);
      const x = c.getContext('2d');
      x.translate(v.dir === 'h' || v.dir === 'hv' ? iw : 0, v.dir === 'v' || v.dir === 'hv' ? ih : 0);
      x.scale(v.dir === 'h' || v.dir === 'hv' ? -1 : 1, v.dir === 'v' || v.dir === 'hv' ? -1 : 1);
      x.drawImage(img, 0, 0);
      return { canvas: c };
    }
  });

  reg({
    id: 'img-frame', icon: '🖼️', title: 'إضافة إطار للصورة', label: '🖼️ أضف الإطار',
    desc: 'إطار بلون وسماكة وحدود داخلية + ظل اختياري',
    controls: [
      { id: 'size', label: 'سماكة الإطار (بكسل)', type: 'number', value: 24, min: 1, max: 400 },
      { id: 'color', label: 'لون الإطار', type: 'color', value: '#1f6feb' },
      { id: 'inner', label: 'خط داخلي (0 = بلا)', type: 'number', value: 4, min: 0, max: 60 },
      { id: 'innerColor', label: 'لون الخط الداخلي', type: 'color', value: '#ffffff' },
      { id: 'shadow', label: 'إضافة ظل خارجي', type: 'select', options: [['0', 'لا'], ['1', 'نعم']], value: '0' }
    ],
    draw: (img, im2, v, mkCanvas) => {
      const p = Number(v.size), inn = Number(v.inner), sh = v.shadow === '1' ? 30 : 0;
      const W = img.naturalWidth + p * 2 + sh * 2, H = img.naturalHeight + p * 2 + sh * 2;
      const c = mkCanvas(W, H);
      const x = c.getContext('2d');
      x.fillStyle = v.color;
      x.fillRect(0, 0, W, H);
      if (sh) {
        x.shadowColor = 'rgba(0,0,0,.35)';
        x.shadowBlur = sh;
        x.fillStyle = '#fff';
        x.fillRect(p, p, img.naturalWidth, img.naturalHeight);
        x.shadowBlur = 0;
      }
      x.drawImage(img, p, p);
      if (inn) {
        x.strokeStyle = v.innerColor;
        x.lineWidth = inn;
        x.strokeRect(p + inn / 2, p + inn / 2, img.naturalWidth - inn, img.naturalHeight - inn);
      }
      return { canvas: c };
    }
  });

  reg({
    id: 'img-round', icon: '⭕', title: 'زوايا دائرية أو شكل دائري', label: '⭕ طبّق',
    desc: 'قص الزوايا بزوايا منحنية أو اجعل الصورة دائرة كاملة (PNG بشفافية)',
    controls: [
      { id: 'radius', label: 'نصف قطر الزوايا (بكسل)', type: 'number', value: 48, min: 0, max: 2000 },
      { id: 'circle', label: 'شكل دائري كامل', type: 'select', options: [['0', 'لا — زوايا مستديرة'], ['1', 'نعم — دائرة']], value: '0' },
      { id: 'max', label: 'أقصى بُعد للصورة الناتجة', type: 'number', value: 512, min: 16, max: 4000 }
    ],
    draw: (img, im2, v, mkCanvas) => {
      const max = Number(v.max) || 512;
      const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const W = Math.round(img.naturalWidth * scale), H = Math.round(img.naturalHeight * scale);
      const c = mkCanvas(W, H);
      const x = c.getContext('2d');
      x.clearRect(0, 0, W, H);
      const r = v.circle === '1' ? Math.min(W, H) / 2 : Math.max(0, Number(v.radius) * scale);
      x.beginPath();
      if (v.circle === '1') x.arc(W / 2, H / 2, Math.min(W, H) / 2, 0, Math.PI * 2);
      else {
        x.moveTo(r, 0);
        x.arcTo(W, 0, W, H, r); x.arcTo(W, H, 0, H, r);
        x.arcTo(0, H, 0, 0, r); x.arcTo(0, 0, W, 0, r);
      }
      x.closePath();
      x.clip();
      x.drawImage(img, 0, 0, W, H);
      return { canvas: c };
    },
    note: 'النتيجة شفافة من الخارج — نزّلها PNG للحفاظ على الشفافية.'
  });

  /* ============================================================
     2) الألوان والتحسين
     ============================================================ */

  reg({
    id: 'img-grayscale', icon: '⬛', title: 'تحويل إلى رمادي', label: '⬛ طبّق',
    desc: 'إزالة الألوان بتدرج رمادي مع تحكم بشدة التأثير',
    controls: [{ id: 'amount', label: 'الشدة %', type: 'number', value: 100, min: 0, max: 100 }],
    apply: (d, w, h, v) => {
      const a = Number(v.amount) / 100;
      for (let i = 0; i < d.length; i += 4) {
        const g = lum(d[i], d[i + 1], d[i + 2]);
        d[i] += (g - d[i]) * a;
        d[i + 1] += (g - d[i + 1]) * a;
        d[i + 2] += (g - d[i + 2]) * a;
      }
    }
  });

  reg({
    id: 'img-invert', icon: '🔃', title: 'عكس الألوان (نيجاتيف)', label: '🔃 اعكس',
    desc: 'يحوّل الألوان إلى عكسها الكامل',
    controls: [{ id: 'amount', label: 'الشدة %', type: 'number', value: 100, min: 0, max: 100 }],
    apply: (d, w, h, v) => {
      const a = Number(v.amount) / 100;
      for (let i = 0; i < d.length; i += 4) {
        d[i] += (255 - d[i] - d[i]) * a;
        d[i + 1] += (255 - d[i + 1] - d[i + 1]) * a;
        d[i + 2] += (255 - d[i + 2] - d[i + 2]) * a;
      }
    }
  });

  reg({
    id: 'img-brightness', icon: '🔆', title: 'تعديل السطوع', label: '🔆 طبّق',
    desc: 'زيادة أو تقليل الإضاءة العامة للصورة',
    controls: [{ id: 'b', label: 'السطوع (-100 إلى 100)', type: 'number', value: 20, min: -100, max: 100 }],
    apply: (d, w, h, v) => {
      const b = Number(v.b) * 2.55;
      for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, d[i + k] + b));
    }
  });

  reg({
    id: 'img-contrast', icon: '◐', title: 'تعديل التباين', label: '◐ طبّق',
    desc: 'يجعل الصورة أكثر حِدّة أو أكثر تلاشياً',
    controls: [{ id: 'c', label: 'التباين %', type: 'number', value: 30, min: -100, max: 300 }],
    apply: (d, w, h, v) => {
      const f2 = (100 + Number(v.c)) / 100;
      for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, (d[i + k] - 128) * f2 + 128));
    }
  });

  reg({
    id: 'img-hue', icon: '🌈', title: 'تشبّع الألوان وتغيير الدرجة', label: '🌈 طبّق',
    desc: 'تحكّم في تشبّع الألوان ودرجتها (Hue) وسطوعها',
    controls: [
      { id: 'sat', label: 'التشبّع %', type: 'number', value: 130, min: 0, max: 400 },
      { id: 'hue', label: 'إزاحة الدرجة (درجة)', type: 'number', value: 0, min: -180, max: 180 },
      { id: 'br', label: 'السطوع %', type: 'number', value: 100, min: 0, max: 300 }
    ],
    pre: (x, img, im2, v, c) => { x.filter = `saturate(${Number(v.sat)}%) hue-rotate(${Number(v.hue)}deg) brightness(${Number(v.br)}%)`; x.drawImage(img, 0, 0); x.filter = 'none'; },
    apply: () => {}
  });

  reg({
    id: 'img-sepia', icon: '📜', title: 'تأثير سيبيا القديم', label: '📜 طبّق',
    desc: 'تأثير الصور القديمة البنية الدافئة',
    controls: [{ id: 'amount', label: 'الشدة %', type: 'number', value: 80, min: 0, max: 100 }],
    apply: (d, w, h, v) => {
      const a = Number(v.amount) / 100;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const nr = 0.393 * r + 0.769 * g + 0.189 * b;
        const ng = 0.349 * r + 0.686 * g + 0.168 * b;
        const nb = 0.272 * r + 0.534 * g + 0.131 * b;
        d[i] += (Math.min(255, nr) - r) * a;
        d[i + 1] += (Math.min(255, ng) - g) * a;
        d[i + 2] += (Math.min(255, nb) - b) * a;
      }
    }
  });

  reg({
    id: 'img-posterize', icon: '🎨', title: 'تأثير الملصق (Posterize)', label: '🎨 طبّق',
    desc: 'تقليل عدد مستويات الألوان لمظهر فني مسطّح',
    controls: [{ id: 'levels', label: 'عدد المستويات لكل قناة', type: 'number', value: 5, min: 2, max: 64 }],
    apply: (d, w, h, v) => {
      const L = Math.max(2, Number(v.levels)) - 1;
      for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) d[i + k] = Math.round(Math.round((d[i + k] / 255) * L) / L * 255);
    }
  });

  reg({
    id: 'img-threshold', icon: '⚫', title: 'أبيض وأسود حاد (Threshold)', label: '⚫ طبّق',
    desc: 'يحوّل الصورة إلى لونين فقط حسب حدّ الإضاءة (مناسب للمسح الضوئي)',
    controls: [
      { id: 't', label: 'حدّ الإضاءة (0-255)', type: 'number', value: 128, min: 0, max: 255 },
      { id: 'fg', label: 'لون العنصر', type: 'color', value: '#000000' },
      { id: 'bg', label: 'لون الخلفية', type: 'color', value: '#ffffff' }
    ],
    apply: (d, w, h, v, x) => {
      const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
      const F = hex(v.fg), B = hex(v.bg), T = Number(v.t);
      for (let i = 0; i < d.length; i += 4) {
        const g = lum(d[i], d[i + 1], d[i + 2]);
        const col = g > T ? B : F;
        d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2];
      }
    }
  });

  reg({
    id: 'img-blur', icon: '💧', title: 'تمويه الصورة', label: '💧 موّه',
    desc: 'تمويه غاوسي بقوة قابلة للتعديل — يخفي التفاصيل أو الخصوصية',
    controls: [{ id: 'px', label: 'قوة التمويه (بكسل)', type: 'number', value: 8, min: 0, max: 100 },
      { id: 'region', label: 'المنطقة', type: 'select', options: [['all', 'الصورة كاملة'], ['center', 'الوسط فقط (لإخفاء وجوه/بيانات)']], value: 'all' },
      { id: 'cw', label: 'عرض منطقة الوسط %', type: 'number', value: 50, min: 5, max: 100 },
      { id: 'ch', label: 'ارتفاع منطقة الوسط %', type: 'number', value: 50, min: 5, max: 100 }],
    draw: (img, im2, v, mkCanvas) => {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const c = mkCanvas(iw, ih);
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0);
      const px = Number(v.px);
      if (v.region === 'all') {
        x.clearRect(0, 0, iw, ih);
        x.filter = 'blur(' + px + 'px)';
        x.drawImage(img, 0, 0);
        x.filter = 'none';
      } else {
        const w2 = iw * Number(v.cw) / 100, h2 = ih * Number(v.ch) / 100;
        const X = (iw - w2) / 2, Y = (ih - h2) / 2;
        x.save();
        x.beginPath();
        x.rect(X, Y, w2, h2);
        x.clip();
        x.filter = 'blur(' + px + 'px)';
        x.drawImage(img, -X, -Y);
        x.filter = 'none';
        x.restore();
        x.strokeStyle = 'rgba(255,255,255,.6)';
        x.lineWidth = 2;
        x.strokeRect(X + 1, Y + 1, w2 - 2, h2 - 2);
      }
      return { canvas: c };
    }
  });

  reg({
    id: 'img-sharpen', icon: '🔪', title: 'زيادة الحِدّة', label: '🔪 زد الحدة',
    desc: 'تحسين وضوح التفاصيل بخوارزمية التفاف 3×3',
    controls: [{ id: 'amount', label: 'القوة %', type: 'number', value: 80, min: 0, max: 300 }],
    apply: (d, w, h, v) => {
      const a = Number(v.amount) / 100;
      const k = [0, -a, 0, -a, 1 + 4 * a, -a, 0, -a, 0];
      convolve(d, w, h, k);
    }
  });

  reg({
    id: 'img-edges', icon: '🧭', title: 'كشف الحدود (Sobel)', label: '🧭 اكتشف',
    desc: 'يبرز الخطوط والحواف — مفيد للرسم والتحليل',
    controls: [{ id: 'th', label: 'حدّ الإظهار', type: 'number', value: 60, min: 0, max: 255 },
      { id: 'color', label: 'الوضع', type: 'select', options: [['gray', 'تدرج رمادي'], ['white', 'أبيض على أسود'], ['orig', 'احتفظ بالألوان']], value: 'gray' }],
    apply: (d, w, h, v) => {
      const src = new Uint8ClampedArray(d);
      const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1], gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          let s1 = 0, s2 = 0;
          for (let ky = -1; ky <= 1; ky++) for (let kx = -1; kx <= 1; kx++) {
            const i = ((y + ky) * w + (x + kx)) * 4;
            const g = lum(src[i], src[i + 1], src[i + 2]);
            const ki = (ky + 1) * 3 + (kx + 1);
            s1 += g * gx[ki]; s2 += g * gy[ki];
          }
          let m = Math.sqrt(s1 * s1 + s2 * s2);
          m = m > Number(v.th) ? Math.min(255, m) : 0;
          const o = (y * w + x) * 4;
          if (v.color === 'orig') { d[o] = Math.min(255, src[o] + m); d[o + 1] = Math.min(255, src[o + 1] + m); d[o + 2] = Math.min(255, src[o + 2] + m); }
          else if (v.color === 'white') { d[o] = d[o + 1] = d[o + 2] = m > 0 ? 255 : 0; }
          else { d[o] = d[o + 1] = d[o + 2] = m; }
        }
      }
    }
  });

  reg({
    id: 'img-emboss', icon: '🗿', title: 'تأثير النقش البارز', label: '🗿 طبّق',
    desc: 'يحوّل الصورة إلى نقش بارز بلون رمادي',
    controls: [{ id: 'strength', label: 'القوة', type: 'number', value: 1, min: 0.2, max: 3, step: 0.1 }],
    apply: (d, w, h, v) => {
      const s = Number(v.strength);
      const k = [-2 * s, -1 * s, 0, -1 * s, 1, 1 * s, 0, 1 * s, 2 * s];
      convolve(d, w, h, k, true);
    }
  });

  reg({
    id: 'img-noise', icon: '📺', title: 'إضافة تشويش أو تنظيفه', label: '📺 طبّق',
    desc: 'يضيف ضجيجاً سينمائياً أو ينعّم الصورة من التشويش',
    controls: [
      { id: 'mode', label: 'الوضع', type: 'select', options: [['add', 'إضافة تشويش'], ['clean', 'تنعيم/إزالة التشويش']], value: 'add' },
      { id: 'amount', label: 'القوة %', type: 'number', value: 25, min: 1, max: 100 }
    ],
    apply: (d, w, h, v) => {
      const a = Number(v.amount);
      if (v.mode === 'add') {
        for (let i = 0; i < d.length; i += 4) {
          const n = (Math.random() - 0.5) * (a * 2.55);
          for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, d[i + k] + n));
        }
      } else {
        const w2 = Math.min(0.125, (0.02 + (a / 100) * 0.10) / 1);
        convolve(d, w, h, [w2, w2, w2, w2, 1 - 8 * w2, w2, w2, w2, w2]);
      }
    }
  });

  reg({
    id: 'img-pixelate', icon: '🟪', title: 'بكسل آرت / إخفاء البيانات', label: '🟪 طبّق',
    desc: 'تقسيم الصورة إلى مربعات كبيرة — مناسب لإخفاء المعلومات الحساسة',
    controls: [
      { id: 'size', label: 'حجم المربع (بكسل)', type: 'number', value: 16, min: 2, max: 120 },
      { id: 'region', label: 'المنطقة', type: 'select', options: [['all', 'كل الصورة'], ['center', 'منطقة الوسط']], value: 'all' }
    ],
    apply: (d, w, h, v) => {
      const s = Math.max(2, Math.round(Number(v.size)));
      let x0 = 0, y0 = 0, x1 = w, y1 = h;
      if (v.region === 'center') { x0 = Math.floor(w * 0.25); x1 = Math.ceil(w * 0.75); y0 = Math.floor(h * 0.25); y1 = Math.ceil(h * 0.75); }
      for (let y = y0; y < y1; y += s) {
        for (let x = x0; x < x1; x += s) {
          let r = 0, g = 0, b = 0, c = 0;
          for (let yy = y; yy < Math.min(y + s, y1); yy++) for (let xx = x; xx < Math.min(x + s, x1); xx++) {
            const i = (yy * w + xx) * 4;
            r += d[i]; g += d[i + 1]; b += d[i + 2]; c++;
          }
          r /= c; g /= c; b /= c;
          for (let yy = y; yy < Math.min(y + s, y1); yy++) for (let xx = x; xx < Math.min(x + s, x1); xx++) {
            const i = (yy * w + xx) * 4;
            d[i] = r; d[i + 1] = g; d[i + 2] = b;
          }
        }
      }
    }
  });

  reg({
    id: 'img-vignette', icon: '🌑', title: 'إضافة إطار معتم (Vignette)', label: '🌑 طبّق',
    desc: 'تعتيم الحواف لتسليط الضوء على الوسط',
    controls: [
      { id: 'strength', label: 'القوة %', type: 'number', value: 60, min: 0, max: 100 },
      { id: 'shape', label: 'الشكل', type: 'select', options: [['ellipse', 'بيضاوي'], ['rect', 'مستطيل']], value: 'ellipse' }
    ],
    draw: (img, im2, v, mkCanvas) => {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const c = mkCanvas(iw, ih);
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0);
      const s = Number(v.strength) / 100;
      const g = v.shape === 'ellipse'
        ? x.createRadialGradient(iw / 2, ih / 2, Math.min(iw, ih) * 0.25, iw / 2, ih / 2, Math.max(iw, ih) * 0.72)
        : x.createRadialGradient(iw / 2, ih / 2, Math.min(iw, ih) * 0.35, iw / 2, ih / 2, Math.max(iw, ih) * 0.8);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,' + s + ')');
      x.fillStyle = g;
      x.fillRect(0, 0, iw, ih);
      return { canvas: c };
    }
  });

  /* ---------- التفاف 3×3 ---------- */
  function convolve(d, w, h, k, gray) {
    const src = new Uint8ClampedArray(d);
    const get = (x, y, ch) => src[((Math.min(h - 1, Math.max(0, y)) * w) + Math.min(w - 1, Math.max(0, x))) * 4 + ch];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 4;
        let r = 0, g = 0, b = 0;
        for (let ky = -1; ky <= 1; ky++) for (let kx = -1; kx <= 1; kx++) {
          const kv = k[(ky + 1) * 3 + (kx + 1)];
          if (!kv) continue;
          r += get(x + kx, y + ky, 0) * kv;
          g += get(x + kx, y + ky, 1) * kv;
          b += get(x + kx, y + ky, 2) * kv;
        }
        if (gray) { const m = (r + g + b) / 3 + 128; d[o] = d[o + 1] = d[o + 2] = m; }
        else { d[o] = r; d[o + 1] = g; d[o + 2] = b; }
      }
    }
  }

  /* ============================================================
     3) إضافة نصوص وعلامات
     ============================================================ */

  reg({
    id: 'img-watermark', icon: '💧', title: 'علامة مائية نصية', label: '💧 أضف العلامة',
    desc: 'نص متكرر بشفافية على الصورة لحماية الحقوق',
    controls: [
      { id: 'text', label: 'النص', type: 'text', value: '© اسمي 2026' },
      { id: 'size', label: 'حجم الخط', type: 'number', value: 28, min: 8, max: 300 },
      { id: 'color', label: 'اللون', type: 'color', value: '#ffffff' },
      { id: 'opacity', label: 'الشفافية %', type: 'number', value: 35, min: 5, max: 100 },
      { id: 'angle', label: 'ميل النص (درجة)', type: 'number', value: -30, min: -90, max: 90 },
      { id: 'mode', label: 'التوزيع', type: 'select', options: [['tile', 'متكرر على كل الصورة'], ['once', 'مرة واحدة'], ['corner', 'في الزاوية']], value: 'tile' },
      { id: 'shadow', label: 'ظل خلف النص', type: 'select', options: [['1', 'نعم'], ['0', 'لا']], value: '1' }
    ],
    draw: (img, im2, v, mkCanvas) => {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const c = mkCanvas(iw, ih);
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0);
      x.globalAlpha = Number(v.opacity) / 100;
      x.fillStyle = v.color;
      x.font = 'bold ' + Number(v.size) + 'px system-ui, sans-serif';
      x.textBaseline = 'middle';
      x.textAlign = 'center';
      const txt = v.text || '©';
      if (v.shadow === '1') { x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = Math.max(2, Number(v.size) / 6); }
      if (v.mode === 'tile') {
        const rad = (Number(v.angle) * Math.PI) / 180;
        x.save();
        x.translate(iw / 2, ih / 2);
        x.rotate(rad);
        const stepX = x.measureText(txt).width + Number(v.size) * 4;
        const stepY = Number(v.size) * 4;
        for (let y = -ih; y < ih; y += stepY) for (let xx = -iw; xx < iw; xx += stepX) x.fillText(txt, xx, y);
        x.restore();
      } else if (v.mode === 'once') {
        x.save();
        x.translate(iw / 2, ih / 2);
        x.rotate((Number(v.angle) * Math.PI) / 180);
        x.fillText(txt, 0, 0);
        x.restore();
      } else {
        x.textAlign = 'right';
        x.fillText(txt, iw - Number(v.size), ih - Number(v.size));
      }
      return { canvas: c };
    }
  });

  reg({
    id: 'img-meme', icon: '😂', title: 'كتابة نص على الصورة (ميم)', label: '😂 أضف النص',
    desc: 'نص أعلى وأسفل الصورة بخط سميك مع حدود — كما في الميمات',
    controls: [
      { id: 'top', label: 'النص الأعلى', type: 'text', value: 'عندما تنجح الأداة' },
      { id: 'bottom', label: 'النص الأسفل', type: 'text', value: 'من أول محاولة' },
      { id: 'size', label: 'حجم الخط % من العرض', type: 'number', value: 8, min: 2, max: 25 },
      { id: 'color', label: 'لون الخط', type: 'color', value: '#ffffff' },
      { id: 'outline', label: 'لون الحدود', type: 'color', value: '#000000' },
      { id: 'position', label: 'الموضع', type: 'select', options: [['both', 'أعلى وأسفل'], ['top', 'أعلى فقط'], ['bottom', 'أسفل فقط']], value: 'both' }
    ],
    draw: (img, im2, v, mkCanvas) => {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const c = mkCanvas(iw, ih);
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0);
      const fs = Math.max(12, iw * Number(v.size) / 100);
      x.font = '900 ' + fs + 'px "Segoe UI", Tahoma, sans-serif';
      x.textAlign = 'center';
      x.lineJoin = 'round';
      x.lineWidth = Math.max(3, fs / 7);
      x.strokeStyle = v.outline;
      x.fillStyle = v.color;
      const draw = (txt, y) => {
        if (!txt) return;
        const words = txt.split(/\s+/);
        const lines = [];
        let line = '';
        words.forEach((wd) => {
          const test = line ? line + ' ' + wd : wd;
          if (x.measureText(test).width > iw * 0.92 && line) { lines.push(line); line = wd; }
          else line = test;
        });
        if (line) lines.push(line);
        lines.slice(0, 4).forEach((ln, i) => {
          const yy = y + i * fs * 1.15;
          x.strokeText(ln, iw / 2, yy);
          x.fillText(ln, iw / 2, yy);
        });
      };
      x.textBaseline = 'top';
      if (v.position !== 'bottom') draw(v.top, fs * 0.35);
      x.textBaseline = 'bottom';
      if (v.position !== 'top') draw(v.bottom, ih - fs * 0.35);
      return { canvas: c };
    }
  });

  /* ============================================================
     4) التصدير والحجم والصيغة
     ============================================================ */

  reg({
    id: 'img-convert', icon: '🔀', title: 'تحويل صيغة الصورة', label: '🔀 حوّل الصيغة',
    desc: 'تحويل بين PNG وJPG وWebP مع جودة قابلة للاختيار وحجم الملف الناتج',
    controls: [
      { id: 'format', label: 'الصيغة', type: 'select', options: [['image/jpeg', 'JPG'], ['image/png', 'PNG'], ['image/webp', 'WebP']], value: 'image/jpeg' },
      { id: 'quality', label: 'الجودة % (لغير PNG)', type: 'number', value: 85, min: 10, max: 100 },
      { id: 'bg', label: 'خلفية بيضاء عند JPG', type: 'select', options: [['1', 'نعم (تفادي الشفافية السوداء)'], ['0', 'لا']], value: '1' },
      { id: 'maxw', label: 'أقصى عرض (0 = الأصلي)', type: 'number', value: 1600, min: 0, max: 10000 }
    ],
    draw: (img, im2, v, mkCanvas) => {
      let iw = img.naturalWidth, ih = img.naturalHeight;
      const mw = Number(v.maxw);
      if (mw && iw > mw) { ih = Math.round(ih * mw / iw); iw = mw; }
      const c = mkCanvas(iw, ih);
      const x = c.getContext('2d');
      if (v.format === 'image/jpeg' && v.bg === '1') { x.fillStyle = '#fff'; x.fillRect(0, 0, iw, ih); }
      x.drawImage(img, 0, 0, iw, ih);
      return { canvas: c };
    },
    extra: (h, S) => {
      const info = f.el('div', { class: 'out-pre', dir: 'ltr' });
      const run = async () => {
        const c = S.c;
        if (!c) { f.toast('انتظر تحميل الصورة', 'err'); return; }
        const rows = [];
        for (const f2 of ['image/jpeg', 'image/png', 'image/webp']) {
          const b = await f.canvasBlob(c, f2, 0.85);
          if (b) rows.push(f2.split('/')[1].toUpperCase().padEnd(5) + '  ' + f.bytes(b.size));
        }
        info.textContent = 'حجم الصورة الناتجة بجودة 85%:\n' + rows.join('\n');
      };
      const btn = f.btn('📏 احسب حجم كل صيغة', run, 'ghost');
      return f.el('div', {}, btn, info);
    }
  });

  reg({
    id: 'img-compress-target', icon: '📉', title: 'ضغط الصورة إلى حجم محدد', label: '📉 اضغط',
    desc: 'يبحث عن أفضل جودة تُنزل حجم الملف تحت الحد المطلوب (كيلوبايت)',
    controls: [
      { id: 'target', label: 'الحجم المستهدف (كيلوبايت)', type: 'number', value: 200, min: 10, max: 10000 },
      { id: 'fmt', label: 'الصيغة', type: 'select', options: [['image/jpeg', 'JPG'], ['image/webp', 'WebP']], value: 'image/jpeg' },
      { id: 'maxw', label: 'أقصى عرض', type: 'number', value: 1920, min: 100, max: 6000 }
    ],
    draw: (img, im2, v, mkCanvas) => {
      let iw = img.naturalWidth, ih = img.naturalHeight;
      const mw = Number(v.maxw);
      if (iw > mw) { ih = Math.round(ih * mw / iw); iw = mw; }
      const c = mkCanvas(iw, ih);
      const x = c.getContext('2d');
      x.fillStyle = '#fff';
      x.fillRect(0, 0, iw, ih);
      x.drawImage(img, 0, 0, iw, ih);
      return { canvas: c };
    },
    extra: (h, S) => {
      const info = f.el('div', { class: 'out-pre', dir: 'ltr' });
      const go = async (vals2) => {
        const c = S.c;
        if (!c) { f.toast('انتظر تحميل الصورة', 'err'); return; }
        const fmt = (vals2 && vals2.fmt ? vals2.fmt.value : 'image/jpeg');
        const target = Math.max(5, Number(vals2 && vals2.target ? vals2.target.value : 200));
        info.textContent = '⏳ جاري البحث عن أفضل جودة…';
        let lo = 0.05, hi = 0.95, best = null;
        for (let i = 0; i < 8; i++) {
          const q = (lo + hi) / 2;
          const b = await f.canvasBlob(c, fmt, q);
          if (b.size <= target * 1024) { best = { q, b }; lo = q; } else hi = q;
        }
        if (!best) { best = { q: 0.05, b: await f.canvasBlob(c, fmt, 0.05) }; }
        S.best = best;
        info.textContent = '✅ أفضل جودة: ' + Math.round(best.q * 100) + '%  →  ' + f.bytes(best.b.size) + '\n(الهدف ' + target + ' كيلوبايت · ' + c.width + '×' + c.height + ')';
      };
      const w = f.el('div', {},
        f.row(
          f.btn('⬇️ اضغط ونزّل', async () => { await go(h.vals); if (S.best) f.download('compressed.' + (S.best.b.type === 'image/webp' ? 'webp' : 'jpg'), S.best.b); }, 'primary'),
          f.btn('🔍 اكتشف أفضل جودة فقط', () => go(h.vals), 'ghost')
        ), info);
      return w;
    }
  });

  reg({
    id: 'img-strip-meta', icon: '🕵️', title: 'إزالة البيانات الوصفية (EXIF)', label: '🕵️ نظّف',
    desc: 'يحذف بيانات الكاميرا والموقع وكل ما تخزّنه الصورة من معلومات (إعادة ترميز نظيفة)',
    controls: [{ id: 'jpg', label: 'الإخراج', type: 'select', options: [['png', 'PNG نظيف تماماً'], ['jpg', 'JPG نظيف (إعادة ترميز)']], value: 'jpg' }],
    draw: (img, im2, v, mkCanvas) => {
      const c = mkCanvas(img.naturalWidth, img.naturalHeight);
      const x = c.getContext('2d');
      x.fillStyle = '#fff';
      x.fillRect(0, 0, c.width, c.height);
      x.drawImage(img, 0, 0);
      return { canvas: c, after: () => f.toast('تم إعادة الترميز — لا بيانات وصفية أو EXIF في الملف الناتج') };
    },
    note: 'التنزيل من هنا ينشئ ملفاً جديداً بلا أي بيانات وصفية — الطريقة الأمثل لإخفاء موقع التصوير وطراز الكاميرا.'
  });

  /* --- قراءة بيانات EXIF (تحليل بنية JPEG الحقيقية) --- */
  t({
    id: 'img-exif', cat: 'image', icon: '📷', title: 'قراءة بيانات EXIF من صورة',
    desc: 'يستخرج بيانات الكاميرا والتاريخ والإعدادات والموقع من ملف JPG — داخل المتصفح بلا رفع',
    render: function (root) {
      const res = f.out({ filename: 'exif.txt' });
      const thumbs = f.el('div', { class: 'cv-wrap' });
      const sel = f.fileInput({ accept: 'image/jpeg,image/*', label: 'اختر ملف JPG لقراءة بياناته', icon: '📷' });

      const TYPE_SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8 };
      const TAGS = {
        0x010F: 'الشركة المصنّعة', 0x0110: 'طراز الكاميرا', 0x0112: 'الاتجاه', 0x011A: 'الدقة الأفقية',
        0x011B: 'الدقة الرأسية', 0x0128: 'وحدة الدقة', 0x0131: 'البرنامج', 0x0132: 'تاريخ التعديل',
        0x013B: 'الفنان', 0x8298: 'حقوق النشر', 0x8769: 'IFD EXIF', 0x8825: 'IFD الموقع',
        0x829A: 'زمن التعريض', 0x829D: 'فتحة العدسة F', 0x8822: 'برنامج التعريض', 0x8827: 'حساسية ISO',
        0x9003: 'تاريخ التصوير', 0x9004: 'تاريخ الرقمنة', 0x9201: 'سرعة الغالق APEX', 0x9202: 'فتحة APEX',
        0x9204: 'تعويض التعريض', 0x9205: 'أقصى فتحة', 0x9207: 'نمط القياس', 0x9209: 'الفلاش',
        0x920A: 'البعد البؤري (مم)', 0x927C: 'بيانات المُصنّع', 0x9286: 'تعليق المستخدم', 0xA002: 'عرض البكسل',
        0xA003: 'ارتفاع البكسل', 0xA402: 'وضع التعريض', 0xA403: 'توازن البياض', 0xA406: 'نمط التصوير',
        0xA430: 'مالك الكاميرا', 0xA431: 'الرقم التسلسلي للجسم', 0xA432: 'البعد البؤري', 0xA434: 'طراز العدسة'
      };
      const GPS_TAGS = { 1: 'جهة خط العرض', 2: 'خط العرض', 3: 'جهة خط الطول', 4: 'خط الطول', 5: 'الارتفاع', 6: 'وحدة الارتفاع', 7: 'توقيت UTC' };
      const ORIENT = { 1: 'عادية', 2: 'معكوسة أفقياً', 3: 'دوران 180°', 4: 'معكوسة رأسياً', 5: 'معكوسة ومدوّرة 90°', 6: 'مدوّرة 90° يمين', 7: 'معكوسة ومدوّرة 90° يسار', 8: 'مدوّرة 90° يسار' };

      function parse(buf) {
        const dv = new DataView(buf);
        if (dv.byteLength < 4 || dv.getUint16(0) !== 0xFFD8) return { err: 'الملف ليس JPEG (EXIF يوجد عادة في JPG).' };
        let off = 2, app1 = -1;
        const segments = [];
        while (off + 4 <= dv.byteLength) {
          const marker = dv.getUint16(off);
          if ((marker & 0xFF00) !== 0xFF00) break;
          const size = dv.getUint16(off + 2);
          const name = marker === 0xFFE0 ? 'APP0/JFIF' : marker === 0xFFE1 ? 'APP1' : marker === 0xFFE2 ? 'APP2' : marker >= 0xFFE0 && marker <= 0xFFEF ? 'APP' + (marker - 0xFFE0) : marker === 0xFFDB ? 'DQT' : marker === 0xFFC0 ? 'SOF0' : marker === 0xFFDA ? 'SOS' : 'MARKER';
          segments.push({ name, size });
          if (marker === 0xFFE1) {
            const t4 = String.fromCharCode(dv.getUint8(off + 4), dv.getUint8(off + 5), dv.getUint8(off + 6), dv.getUint8(off + 7));
            if (t4 === 'Exif') { app1 = off + 10; break; }
          }
          if (marker === 0xFFDA) break;
          off += 2 + size;
        }
        if (app1 < 0) return { err: 'لا توجد بيانات EXIF في هذا الملف.', segments };
        const little = dv.getUint16(app1) === 0x4949;
        const base = app1;
        if (dv.getUint16(app1 + 2, little) !== 42) return { err: 'ترويسة TIFF غير صالحة.', segments };

        const get16 = (o) => dv.getUint16(o, little);
        const get32 = (o) => dv.getUint32(o, little);

        function readValue(entOff, type, count) {
          const size = (TYPE_SIZE[type] || 1) * count;
          const valOff = entOff + 8;
          const dataOff = size <= 4 ? valOff : base + get32(valOff);
          if (dataOff + size > dv.byteLength) return null;
          const out = [];
          if (type === 2) {
            let str = '';
            for (let i = 0; i < count; i++) {
              const ch = dv.getUint8(dataOff + i);
              if (ch === 0) break;
              str += String.fromCharCode(ch);
            }
            return str.trim();
          }
          for (let i = 0; i < count; i++) {
            switch (type) {
              case 1: case 7: out.push(dv.getUint8(dataOff + i)); break;
              case 3: out.push(get16(dataOff + i * 2)); break;
              case 4: out.push(get32(dataOff + i * 4)); break;
              case 6: out.push(dv.getInt8(dataOff + i)); break;
              case 8: out.push(dv.getInt16(dataOff + i * 2, little)); break;
              case 9: out.push(dv.getInt32(dataOff + i * 4, little)); break;
              case 5: case 10: {
                const num = type === 5 ? get32(dataOff + i * 8) : dv.getInt32(dataOff + i * 8, little);
                const den = type === 5 ? get32(dataOff + i * 8 + 4) : dv.getInt32(dataOff + i * 8 + 4, little);
                out.push(den === 0 ? 0 : num / den);
                break;
              }
              case 11: out.push(dv.getFloat32(dataOff + i * 4, little)); break;
              case 12: out.push(dv.getFloat64(dataOff + i * 8, little)); break;
              default: out.push('?');
            }
          }
          return out;
        }

        const found = {};
        const gps = {};
        function readIFD(ifdOff, map, target, depth) {
          if (!ifdOff || ifdOff + 2 > dv.byteLength || depth > 3) return;
          const n = get16(ifdOff);
          for (let i = 0; i < n; i++) {
            const ent = ifdOff + 2 + i * 12;
            if (ent + 12 > dv.byteLength) break;
            const tag = get16(ent);
            const type = get16(ent + 2);
            const count = get32(ent + 4);
            const label = map[tag];
            if (tag === 0x8769 && depth === 0) { readIFD(base + get32(ent + 8), TAGS, found, depth + 1); continue; }
            if (tag === 0x8825 && depth === 0) { readIFD(base + get32(ent + 8), GPS_TAGS, gps, depth + 1); continue; }
            if (!label) continue;
            const v = readValue(ent, type, count);
            if (v === null) continue;
            target[label] = Array.isArray(v) && v.length === 1 ? v[0] : v;
          }
        }
        readIFD(base + get32(app1 + 4), TAGS, found, 0);
        return { found, gps, segments, little };
      }

      const dms = (arr) => {
        if (!Array.isArray(arr) || arr.length < 3) return null;
        return arr[0] + arr[1] / 60 + arr[2] / 3600;
      };
      const fmtDate = (s) => String(s).replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');

      sel.querySelector('input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          const buf = await f.readBuffer(file);
          const r = parse(buf);
          const lines = ['📄 ' + file.name + '  (' + f.bytes(file.size) + ')', ''];
          if (r.err) {
            lines.push('⚠️ ' + r.err);
            res.set(lines.join('\n'));
            return;
          }
          const f2 = r.found;
          const row = (k, val, suffix) => { if (val !== undefined && val !== '' && val !== null) lines.push('  ' + k.padEnd(0) + ': ' + val + (suffix || '')); };
          lines.push('— معلومات الكاميرا —');
          row('الشركة المصنّعة', f2['الشركة المصنّعة']);
          row('طراز الكاميرا', f2['طراز الكاميرا']);
          row('العدسة', f2['طراز العدسة']);
          row('الرقم التسلسلي', f2['الرقم التسلسلي للجسم']);
          lines.push('', '— إعدادات التصوير —');
          row('تاريخ التصوير', f2['تاريخ التصوير'] ? fmtDate(f2['تاريخ التصوير']) : undefined);
          row('زمن التعريض', f2['زمن التعريض'] !== undefined ? (f2['زمن التعريض'] < 1 ? '1/' + Math.round(1 / f2['زمن التعريض']) + ' ثانية' : f2['زمن التعريض'] + ' ثانية') : undefined);
          row('فتحة العدسة', f2['فتحة العدسة F'] !== undefined ? 'f/' + Number(f2['فتحة العدسة F']).toFixed(1) : undefined);
          row('حساسية ISO', f2['حساسية ISO']);
          row('البعد البؤري', f2['البعد البؤري (مم)'] !== undefined ? f2['البعد البؤري (مم)'] + ' مم' : undefined);
          row('الفلاش', f2['الفلاش'] !== undefined ? (f2['الفلاش'] & 1 ? 'اشتعل ✅' : 'لم يعمل') : undefined);
          row('الأبعاد', f2['عرض البكسل'] ? f2['عرض البكسل'] + '×' + f2['ارتفاع البكسل'] : undefined);
          row('الاتجاه', f2['الاتجاه'] !== undefined ? (ORIENT[f2['الاتجاه']] || f2['الاتجاه']) : undefined);
          row('البرنامج', f2['البرنامج']);
          row('تعليق المستخدم', f2['تعليق المستخدم']);

          const lat = dms(r.gps['خط العرض']), lon = dms(r.gps['خط الطول']);
          if (lat !== null && lon !== null) {
            const la = r.gps['جهة خط العرض'] === 'S' ? -lat : lat;
            const lo = r.gps['جهة خط الطول'] === 'W' ? -lon : lon;
            lines.push('', '— الموقع الجغرافي 📍 (بيانات حساسة!) —');
            lines.push('  الإحداثيات: ' + la.toFixed(6) + ', ' + lo.toFixed(6));
            if (r.gps['الارتفاع'] !== undefined) lines.push('  الارتفاع: ' + Number(r.gps['الارتفاع']).toFixed(1) + ' م');
            lines.push('  الخريطة: https://www.google.com/maps?q=' + la.toFixed(6) + ',' + lo.toFixed(6));
            lines.push('', '⚠️ هذه الصورة تحتوي موقع التصوير — استخدم أداة «إزالة البيانات الوصفية» قبل نشرها.');
          } else {
            lines.push('', '— الموقع الجغرافي —', '  لا توجد بيانات موقع في هذا الملف.');
          }
          const meta = Object.keys(r.gps).length + Object.keys(f2).length;
          lines.push('', '— بنية الملف —', '  عدد حقول البيانات المقروءة: ' + meta,
            '  ترتيب البايتات: ' + (r.little ? 'Little-endian (Intel)' : 'Big-endian (Motorola)'));
          res.set(lines.join('\n'));
          const im = await f.loadImage(await f.readDataURL(file));
          const c = f.mkCanvas(Math.min(400, im.naturalWidth), Math.min(400, im.naturalWidth) * im.naturalHeight / im.naturalWidth);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          thumbs.replaceChildren(c);
        } catch (err) {
          res.set('❌ تعذّرت القراءة: ' + err.message);
        }
      });

      root.append(sel, thumbs, res.el,
        f.note('كل التحليل يجري داخل متصفحك — الملف لا يُرفع إلى أي جهة.'));
    }
  });

  /* ============================================================
     5) أدوات مقارنة ولوحة ألوان وتجميع
     ============================================================ */

  reg({
    id: 'img-palette', icon: '🎏', title: 'استخراج لوحة الألوان', label: '🎏 استخرج الألوان',
    desc: 'يحلّل الصورة ويعطي أكثر 10 ألوان شيوعاً بأكواد HEX وRGB',
    textResult: (img) => {
      const W = 160, H = Math.max(1, Math.round(W * img.naturalHeight / img.naturalWidth));
      const c = f.mkCanvas(W, H);
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0, W, H);
      const d = x.getImageData(0, 0, W, H).data;
      const bins = {};
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 128) continue;
        const k = ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4);
        if (!bins[k]) bins[k] = { n: 0, r: 0, g: 0, b: 0 };
        const bin = bins[k];
        bin.n++; bin.r += d[i]; bin.g += d[i + 1]; bin.b += d[i + 2];
      }
      const list = Object.values(bins).filter((b) => b.n > 2).sort((a, b) => b.n - a.n).slice(0, 10);
      const total = list.reduce((a, b) => a + b.n, 0) || 1;
      const hex = (b) => '#' + [b.r / b.n, b.g / b.n, b.b / b.n].map((x2) => Math.round(x2).toString(16).padStart(2, '0')).join('');
      return [
        'أكثر الألوان شيوعاً في الصورة:',
        '',
        ...list.map((b, i) => `${String(i + 1).padStart(2)}. ${hex(b)}   rgb(${Math.round(b.r / b.n)}, ${Math.round(b.g / b.n)}, ${Math.round(b.b / b.n)})   ${((b.n / total) * 100).toFixed(1)}%`),
        '',
        '# الألوان للنسخ المباشر:',
        list.map(hex).join(' '),
        '',
        'CSS:',
        'background: linear-gradient(90deg, ' + list.map(hex).join(', ') + ');'
      ].join('\n');
    },
    noDownload: false,
    controls: []
  });

  reg({
    id: 'img-compare', icon: '🆚', title: 'مقارنة صورتين وتشابههما', two: true, label: '🆚 قارن',
    desc: 'يقيس نسبة التشابه بين صورتين ويعرض الفرق بصرياً',
    controls: [{ id: 'th', label: 'حدّ اعتبار البكسل مختلفاً', type: 'number', value: 30, min: 1, max: 255 }],
    draw: (img, img2, v, mkCanvas) => {
      if (!img2) throw new Error('ارفع الصورة الثانية للمقارنة');
      const W = Math.min(600, img.naturalWidth), H = Math.round(W * img.naturalHeight / img.naturalWidth);
      const a = mkCanvas(W, H), b = mkCanvas(W, H), o = mkCanvas(W, H);
      const ax = a.getContext('2d', { willReadFrequently: true });
      const bx = b.getContext('2d', { willReadFrequently: true });
      ax.drawImage(img, 0, 0, W, H);
      bx.drawImage(img2, 0, 0, W, H);
      const da = ax.getImageData(0, 0, W, H), db = bx.getImageData(0, 0, W, H);
      const dp = o.getContext('2d').createImageData(W, H);
      const th = Number(v.th);
      let same = 0, off = 0;
      for (let i = 0; i < da.data.length; i += 4) {
        const d1 = Math.abs(da.data[i] - db.data[i]) + Math.abs(da.data[i + 1] - db.data[i + 1]) + Math.abs(da.data[i + 2] - db.data[i + 2]);
        if (d1 <= th) { same++; dp.data[i] = dp.data[i + 1] = dp.data[i + 2] = 255; }
        else { off++; dp.data[i] = 255; dp.data[i + 1] = 40; dp.data[i + 2] = 60; }
        dp.data[i + 3] = 255;
      }
      o.getContext('2d').putImageData(dp, 0, 0);
      const strip = mkCanvas(W, H * 3 + 20);
      const sx = strip.getContext('2d');
      sx.fillStyle = '#fff';
      sx.fillRect(0, 0, W, H * 3 + 20);
      sx.drawImage(a, 0, 0);
      sx.drawImage(b, 0, H + 10);
      sx.drawImage(o, 0, H * 2 + 20);
      const rows = [
        `نسبة التشابه: ${((same / (same + off)) * 100).toFixed(2)}%`,
        `بكسلات مختلفة: ${f.num(off, 0)} من ${f.num(same + off, 0)}`,
        '',
        'الترتيب: الصورة الأولى ← الثانية ← خريطة الفرق (الأحمر = مختلف)'
      ];
      return { canvas: strip, after: () => f.toast(rows[0] + ' · ' + rows[1]) };
    }
  });

  reg({
    id: 'img-collage', icon: '🧩', title: 'دمج صورتين (تجميعة)', two: true, label: '🧩 ادمج',
    desc: 'يجمع صورتين جانباً إلى جنب أو فوق بعضهما أو في شبكة',
    controls: [
      { id: 'mode', label: 'الطريقة', type: 'select', options: [['h', 'جنباً إلى جنب أفقي'], ['v', 'فوق بعضهما'], ['grid', 'شبكة 2×2 (بتكرار)'], ['overlay', 'فوق بعضهما مع شفافية']], value: 'h' },
      { id: 'gap', label: 'المسافة بينهما (بكسل)', type: 'number', value: 8, min: 0, max: 200 },
      { id: 'bg', label: 'لون الخلفية', type: 'color', value: '#ffffff' },
      { id: 'opacity', label: 'شفافية الصورة الثانية % (للتراكب)', type: 'number', value: 50, min: 1, max: 100 },
      { id: 'max', label: 'أقصى بُعد للناتج', type: 'number', value: 1600, min: 200, max: 4000 }
    ],
    draw: (img, img2, v, mkCanvas) => {
      if (!img2) throw new Error('ارفع الصورة الثانية للدمج');
      const gap = Number(v.gap), max = Number(v.max);
      const scale = (im, w) => ({ w: Math.round(w), h: Math.round(im.naturalHeight * (w / im.naturalWidth)) });
      let W, H, a, b, sw, sh;
      if (v.mode === 'h') {
        const half = (max - gap) / 2;
        a = scale(img, half); b = scale(img2, half);
        W = a.w + gap + b.w; H = Math.max(a.h, b.h);
        sw = half; sh = H;
      } else if (v.mode === 'v') {
        const half = (max - gap) / 2;
        a = scale(img, half); b = scale(img2, half);
        W = Math.max(a.w, b.w); H = a.h + gap + b.h;
      } else if (v.mode === 'grid') {
        const half = (max - gap) / 2;
        a = scale(img, half); b = scale(img2, half);
        W = half * 2 + gap; H = Math.max(a.h, b.h) * 2 + gap;
      } else {
        a = scale(img, max); W = a.w; H = a.h;
      }
      const c = mkCanvas(W, H);
      const x = c.getContext('2d');
      x.fillStyle = v.bg;
      x.fillRect(0, 0, W, H);
      if (v.mode === 'h') {
        x.drawImage(img, 0, (H - a.h) / 2, a.w, a.h);
        x.drawImage(img2, a.w + gap, (H - b.h) / 2, b.w, b.h);
      } else if (v.mode === 'v') {
        x.drawImage(img, (W - a.w) / 2, 0, a.w, a.h);
        x.drawImage(img2, (W - b.w) / 2, a.h + gap, b.w, b.h);
      } else if (v.mode === 'grid') {
        x.drawImage(img, 0, 0, a.w, a.h);
        x.drawImage(img2, a.w + gap, 0, b.w, b.h);
        x.drawImage(img2, 0, a.h + gap, b.w, b.h);
        x.drawImage(img, b.w + gap, a.h + gap, a.w, a.h);
      } else {
        x.drawImage(img, 0, 0, W, H);
        x.globalAlpha = Number(v.opacity) / 100;
        x.drawImage(img2, 0, 0, W, H);
        x.globalAlpha = 1;
      }
      return { canvas: c, after: () => f.toast('الناتج: ' + W + '×' + H) };
    }
  });

  /* ============================================================
     6) أدوات تفاعلية مستقلة
     ============================================================ */

  /* --- منتقي الألوان من الصورة --- */
  t({
    id: 'img-color-pick', cat: 'image', icon: '💉', title: 'منتقي لون من الصورة',
    desc: 'مرّر المؤشر أو المس على الصورة لقراءة لون أي بكسل مع تكبير دقيق',
    render: function (root) {
      const state = { img: null, zoom: 8 };
      const view = f.el('div', { class: 'cv-wrap' });
      const info = f.el('div', { class: 'out-pre', dir: 'ltr', text: '—' });
      const sel = f.fileInput({ accept: 'image/*', label: 'اختر صورة ثم مرّر المؤشر عليها', icon: '💉' });
      const zoomInp = f.inp({ type: 'number', value: 8, min: 2, max: 20, step: 2 });
      const canvas = f.mkCanvas(300, 150);
      const x = canvas.getContext('2d', { willReadFrequently: true });
      let picked = [];

      const paint = () => {
        if (!x) return;
        x.clearRect(0, 0, canvas.width, canvas.height);
        if (state.img) {
          const scale = Math.min(1, 900 / state.img.naturalWidth);
          canvas.width = Math.round(state.img.naturalWidth * scale);
          canvas.height = Math.round(state.img.naturalHeight * scale);
          x.drawImage(state.img, 0, 0, canvas.width, canvas.height);
        }
      };
      const read = async (ev) => {
        if (!state.img || !x) return;
        const r = canvas.getBoundingClientRect();
        const cx = Math.round(((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) * canvas.width / r.width);
        const cy = Math.round(((ev.touches ? ev.touches[0].clientY : ev.clientY) - r.top) * canvas.height / r.height);
        if (cx < 0 || cy < 0 || cx >= canvas.width || cy >= canvas.height) return;
        const d = x.getImageData(cx, cy, 1, 1).data;
        const hex = '#' + [d[0], d[1], d[2]].map((n) => n.toString(16).padStart(2, '0')).join('');
        const z = Number(zoomInp.value) || 8;
        // معاينة التكبير مع البكسل المختار
        const zc = f.mkCanvas(z * 2 + 1, z * 2 + 1);
        const zx = zc.getContext('2d');
        zx.imageSmoothingEnabled = false;
        const sx = Math.max(0, cx - 1), sy = Math.max(0, cy - 1);
        zx.drawImage(canvas, sx, sy, 3, 3, 0, 0, zc.width, zc.height);
        zx.strokeStyle = '#ff0055';
        zx.lineWidth = 2;
        zx.strokeRect(z, z, z, z);
        const prev = f.el('img', { src: zc.toDataURL(), class: 'zoom-prev' });
        info.replaceChildren(
          f.el('div', { class: 'pick-row' },
            f.el('span', { class: 'swatch', style: { background: hex } }),
            f.el('b', { text: hex.toUpperCase() }),
            f.el('span', { text: `rgb(${d[0]}, ${d[1]}, ${d[2]})  ·  rgba(${d[0]}, ${d[1]}, ${d[2]}, ${(d[3] / 255).toFixed(2)})` }),
            f.el('span', { text: `HSL: ${rgbToHsl(d[0], d[1], d[2])}` }),
            f.el('span', { text: `الموضع: ${cx} × ${cy}` })),
          prev
        );
        if (ev.type === 'click' || ev.type === 'touchstart') {
          picked.unshift(hex.toUpperCase());
          picked = picked.slice(0, 12);
          f.copy(hex.toUpperCase());
        }
        paint();
        x.strokeStyle = '#000';
        x.lineWidth = 2;
        x.strokeRect(cx - 3, cy - 3, 6, 6);
        x.strokeStyle = '#fff';
        x.lineWidth = 1;
        x.strokeRect(cx - 4, cy - 4, 8, 8);
        if (picked.length) {
          const bar = f.mkCanvas(canvas.width, 26);
          const bx = bar.getContext('2d');
          picked.forEach((c, i) => { bx.fillStyle = c; bx.fillRect(i * 30, 0, 28, 26); });
          x.drawImage(bar, 0, 0);
        }
      };
      const rgbToHsl = (r, g, b) => {
        r /= 255; g /= 255; b /= 255;
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        let h = 0, s = 0; const l = (mx + mn) / 2;
        if (mx !== mn) {
          const dd = mx - mn;
          s = l > 0.5 ? dd / (2 - mx - mn) : dd / (mx + mn);
          h = mx === r ? (g - b) / dd + (g < b ? 6 : 0) : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4;
          h *= 60;
        }
        return Math.round(h) + '°, ' + Math.round(s * 100) + '%, ' + Math.round(l * 100) + '%';
      };
      ['mousemove', 'click', 'touchmove', 'touchstart'].forEach((ev) => canvas.addEventListener(ev, read));
      sel.querySelector('input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        state.img = await f.loadImage(await f.readDataURL(file));
        paint();
        f.toast('الصورة جاهزة — مرّر المؤشر عليها');
      });
      zoomInp.addEventListener('change', () => {});
      view.append(canvas);
      root.append(sel, view, f.row(f.field('تكبير المعاينة', zoomInp)), info,
        f.note('انقر على أي بكسل لنسخ كود اللون مباشرة، وستُبنى شريط ألوان مختارة أسفل الصورة.'));
      paint();
    }
  });

  /* --- مولد أيقونات الموقع (Favicon) --- */
  t({
    id: 'img-favicon', cat: 'image', icon: '⭐', title: 'مولّد أيقونات الموقع (Favicon)',
    desc: 'ينتج كل مقاسات الأيقونات المطلوبة للمواقع والتطبيقات مع كود HTML جاهز',
    render: function (root) {
      const SIZES = [16, 32, 48, 64, 96, 128, 180, 192, 512];
      const state = { img: null };
      const gallery = f.el('div', { class: 'ico-gallery' });
      const code = f.out({ filename: 'favicon-code.txt', dir: 'ltr' });
      const shape = f.select({ options: [['square', 'مربع'], ['round', 'زوايا دائرية'], ['circle', 'دائرة']], value: 'square' });
      const radius = f.inp({ type: 'number', value: 25, min: 0, max: 50 });
      const sel = f.fileInput({ accept: 'image/*', label: 'اختر صورة الشعار (PNG مربّع أفضل)', icon: '⭐' });

      const build = (size) => {
        const c = f.mkCanvas(size, size);
        const x = c.getContext('2d');
        const s = Math.min(size / state.img.naturalWidth, size / state.img.naturalHeight);
        const w = state.img.naturalWidth * s, h = state.img.naturalHeight * s;
        if (shape.value === 'circle' || shape.value === 'round') {
          const r = shape.value === 'circle' ? size / 2 : size * Number(radius.value) / 100;
          x.beginPath();
          if (shape.value === 'circle') x.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          else {
            x.moveTo(r, 0);
            x.arcTo(size, 0, size, size, r); x.arcTo(size, size, 0, size, r);
            x.arcTo(0, size, 0, 0, r); x.arcTo(0, 0, size, 0, r);
          }
          x.closePath();
          x.clip();
        }
        x.drawImage(state.img, (size - w) / 2, (size - h) / 2, w, h);
        return c;
      };
      const render2 = () => {
        gallery.replaceChildren();
        if (!state.img) return;
        SIZES.forEach((s) => {
          const c = build(s);
          const cell = f.el('div', { class: 'ico-cell' },
            c,
            f.el('div', { class: 'hint', text: s + '×' + s }));
          cell.append(f.btn('⬇️', async () => f.download('icon-' + s + 'x' + s + '.png', await f.canvasBlob(c, 'image/png')), 'ghost'));
          gallery.append(cell);
        });
        code.set([
          '<link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png">',
          '<link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png">',
          '<link rel="apple-touch-icon" sizes="180x180" href="/icon-180x180.png">',
          '<link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png">',
          '<link rel="shortcut icon" href="/icon-32x32.png">'
        ].join('\n'));
      };
      sel.querySelector('input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        state.img = await f.loadImage(await f.readDataURL(file));
        render2();
      });
      [shape, radius].forEach((el2) => { el2.addEventListener('input', render2); el2.addEventListener('change', render2); });
      root.append(sel, f.grid(f.field('الشكل', shape), f.field('نسبة الاستدارة %', radius)),
        f.row(f.btn('⬇️ نزّل كل الأيقونات', async () => {
          if (!state.img) { f.toast('اختر صورة أولاً', 'err'); return; }
          for (const s of SIZES) {
            const b = await f.canvasBlob(build(s), 'image/png');
            f.download('icon-' + s + 'x' + s + '.png', b);
            await new Promise((r) => setTimeout(r, 400));
          }
        }, 'primary')),
        gallery, code.el);
    }
  });
})();
