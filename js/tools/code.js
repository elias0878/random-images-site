/* ============================================================
   tools/code.js — أدوات البرمجة والبيانات (27 أداة)
   ============================================================ */
(function () {
  'use strict';
  const t = f.tool;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ===== MD5 (تنفيذ كامل) ===== */
  const md5 = (function () {
    function add(x, y) { const l = (x & 0xFFFF) + (y & 0xFFFF); return (((x >> 16) + (y >> 16) + (l >> 16)) << 16) | (l & 0xFFFF); }
    function rol(n, c) { return (n << c) | (n >>> (32 - c)); }
    function cmn(q, a, b, x, s, tt) { return add(rol(add(add(a, q), add(x, tt)), s), b); }
    function ff(a, b, c, d, x, s, tt) { return cmn((b & c) | (~b & d), a, b, x, s, tt); }
    function gg(a, b, c, d, x, s, tt) { return cmn((b & d) | (c & ~d), a, b, x, s, tt); }
    function hh(a, b, c, d, x, s, tt) { return cmn(b ^ c ^ d, a, b, x, s, tt); }
    function ii(a, b, c, d, x, s, tt) { return cmn(c ^ (b | ~d), a, b, x, s, tt); }
    function cycle(x, k) {
      let a = x[0], b = x[1], c = x[2], d = x[3];
      a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586);
      c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330);
      a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426);
      c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983);
      a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417);
      c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162);
      a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101);
      c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329);

      a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632);
      c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302);
      a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083);
      c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848);
      a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690);
      c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501);
      a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784);
      c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734);

      a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463);
      c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556);
      a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353);
      c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640);
      a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222);
      c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189);
      a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835);
      c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651);

      a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415);
      c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055);
      a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606);
      c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799);
      a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744);
      c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649);
      a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379);
      c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551);

      x[0] = add(a, x[0]); x[1] = add(b, x[1]); x[2] = add(c, x[2]); x[3] = add(d, x[3]);
    }
    function bytesToWords(bytes) {
      const w = [];
      for (let i = 0; i < bytes.length * 8; i += 8) w[i >> 5] = (w[i >> 5] || 0) | (bytes[i / 8] << (i % 32));
      return w;
    }
    function wordsToHex(words) {
      let hex = '';
      for (let i = 0; i < words.length * 4; i++) hex += ('0' + ((words[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF).toString(16) + ((words[i >> 2] >> ((i % 4) * 8)) & 0xF).toString(16)).slice(-2);
      return hex;
    }
    return function (str) {
      const bytes = new TextEncoder().encode(str);
      const words = bytesToWords(bytes);
      const len = bytes.length * 8;
      words[len >> 5] = (words[len >> 5] || 0) | (0x80 << (len % 32));
      words[(((len + 64) >>> 9) << 4) + 14] = len;
      const state = [1732584193, -271733879, -1732584194, 271733878];
      for (let i = 0; i < words.length; i += 16) cycle(state, words.slice(i, i + 16));
      return wordsToHex(state);
    };
  })();

  /* ===== Base64 آمن لليونيكود ===== */
  const b64enc = (s) => {
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin);
  };
  const b64dec = (s) => {
    const bin = atob(String(s).replace(/\s+/g, ''));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  };

  /* ===== SHA عبر Web Crypto ===== */
  async function sha(algo, text) {
    const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /* ---------- 1. تنسيق JSON ---------- */
  t({
    id: 'json-format', cat: 'code', icon: '{ }', title: 'تنسيق JSON والتحقق منه',
    desc: 'يرتّب JSON ويصحّح الأخطاء ويوضّح موضع الخطأ',
    render: function (root) {
      const ta = f.area({ rows: 10, placeholder: '{"name":"أحمد","age":30}', dir: 'ltr', value: '' });
      const res = f.out({ filename: 'data.json', dir: 'ltr' });
      const fmt = (indent) => {
        try {
          const o = JSON.parse(ta.value);
          res.set(JSON.stringify(o, null, indent));
        } catch (e) {
          let pos = '';
          const m = /position (\d+)/.exec(e.message);
          if (m) {
            const p = Number(m[1]);
            pos = '\n\nالموضع ' + p + ':\n…' + esc(ta.value.slice(Math.max(0, p - 60), p)) + ' ► ' + esc(ta.value.slice(p, p + 60)) + '…';
          }
          res.set('❌ JSON غير صالح\n' + e.message + pos);
        }
      };
      root.append(
        f.field('نص JSON', ta),
        f.row(
          f.btn('تنسيق (مسافة 2)', () => fmt(2), 'primary'),
          f.btn('تنسيق (Tab)', () => fmt('\t')),
          f.btn('تصغير', () => { try { res.set(JSON.stringify(JSON.parse(ta.value))); } catch (e) { res.set('❌ ' + e.message); } }),
          f.btn('ترتيب المفاتيح', () => {
            try {
              const sort = (o) => Array.isArray(o) ? o.map(sort) : (o && typeof o === 'object'
                ? Object.keys(o).sort().reduce((a, k) => (a[k] = sort(o[k]), a), {}) : o);
              res.set(JSON.stringify(sort(JSON.parse(ta.value)), null, 2));
            } catch (e) { res.set('❌ ' + e.message); }
          }, 'ghost'),
          f.btn('إحصائيات', () => {
            try {
              const o = JSON.parse(ta.value);
              const count = (x) => Array.isArray(x) ? x.length : (x && typeof x === 'object' ? Object.keys(x).length : 1);
              const depth = (x) => 1 + (x && typeof x === 'object' ? Math.max(0, ...Object.values(x).map(depth)) : 0);
              res.set('النوع: ' + (Array.isArray(o) ? 'مصفوفة' : typeof o) + '\nالعناصر في الجذر: ' + count(o) + '\nأقصى عمق: ' + depth(o) + '\nالحجم: ' + f.bytes(new Blob([ta.value]).size));
            } catch (e) { res.set('❌ ' + e.message); }
          }, 'ghost')
        ),
        res.el
      );
    }
  });

  /* ---------- 2. JSON ↔ CSV ---------- */
  t({
    id: 'json-csv', cat: 'code', icon: '📑', title: 'تحويل JSON ↔ CSV',
    desc: 'يحوّل بين صيغتي JSON و CSV في الاتجاهين',
    render: function (root) {
      const ta = f.area({ rows: 10, placeholder: '[{"name":"أحمد","age":30},{"name":"سارة","age":25}]', dir: 'ltr' });
      const res = f.out({ filename: 'out.txt', dir: 'ltr' });
      const toCSV = (arr) => {
        if (!Array.isArray(arr) || !arr.length) throw new Error('يجب أن يكون JSON مصفوفة عناصر');
        const keys = [...new Set(arr.flatMap((o) => Object.keys(o || {})))];
        const cell = (v) => {
          const s = v === null || v === undefined ? '' : (typeof v === 'object' ? JSON.stringify(v) : String(v));
          return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        };
        return [keys.join(','), ...arr.map((o) => keys.map((k) => cell(o[k])).join(','))].join('\n');
      };
      const parseCSV = (text) => {
        const rows = [];
        let row = [], cur = '', q = false;
        for (let i = 0; i < text.length; i++) {
          const c = text[i];
          if (q) {
            if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
            else if (c === '"') q = false;
            else cur += c;
          } else if (c === '"') q = true;
          else if (c === ',' || c === '\t') { row.push(cur); cur = ''; }
          else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
          else if (c !== '\r') cur += c;
        }
        if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
        return rows.filter((r) => r.some((x) => x.trim() !== ''));
      };
      root.append(
        f.field('المحتوى', ta),
        f.row(
          f.btn('JSON → CSV', () => { try { res.set(toCSV(JSON.parse(ta.value))); } catch (e) { res.set('❌ ' + e.message); } }, 'primary'),
          f.btn('CSV → JSON', () => {
            try {
              const rows = parseCSV(ta.value);
              if (rows.length < 2) throw new Error('CSV يحتاج سطراً للعناوين وسطراً للبيانات');
              const head = rows[0];
              const out = rows.slice(1).map((r) => head.reduce((a, h, i) => (a[h || 'col' + i] = r[i] ?? '', a), {}));
              res.set(JSON.stringify(out, null, 2));
            } catch (e) { res.set('❌ ' + e.message); }
          }, 'primary'),
          f.btn('يختلف الفاصل تلقائياً', () => {
            if (ta.value.includes('\t')) res.set('الفاصل الحالي: Tab ✓');
            else if (ta.value.includes(',')) res.set('الفاصل الحالي: فاصلة ✓');
            else res.set('لم يُكتشف فاصل واضح.');
          }, 'ghost')
        ),
        res.el
      );
    }
  });

  /* ---------- 3. Base64 للنص ---------- */
  t({
    id: 'base64-text', cat: 'code', icon: '🔐', title: 'Base64 للنص',
    desc: 'ترميز وفك ترميز النص (يدعم العربية واليونيكود)',
    render: function (root) {
      const ta = f.area({ rows: 9, placeholder: 'النص أو كود Base64…', dir: 'ltr' });
      const res = f.out({ filename: 'base64.txt', dir: 'ltr' });
      const go = (fn) => { try { res.set(fn(ta.value)); } catch (e) { res.set('❌ ' + e.message); } };
      root.append(
        f.field('المحتوى', ta),
        f.row(
          f.btn('ترميز →  Base64', () => go(b64enc), 'primary'),
          f.btn('فك ترميز ← Base64', () => go(b64dec), 'primary'),
          f.btn('ترميز URL-safe', () => go((s) => b64enc(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')), 'ghost'),
          f.btn('فك URL-safe', () => go((s) => { let x = s.trim().replace(/-/g, '+').replace(/_/g, '/'); while (x.length % 4) x += '='; return b64dec(x); }), 'ghost')
        ),
        res.el
      );
    }
  });

  /* ---------- 4. ملف إلى Base64 ---------- */
  t({
    id: 'file-to-base64', cat: 'code', icon: '📤', title: 'ملف → Base64 / Data URL',
    desc: 'يحوّل أي ملف إلى نص Base64 أو رابط بيانات جاهز',
    render: function (root) {
      const res = f.out({ filename: 'base64.txt', dir: 'ltr' });
      const info = f.el('div', { class: 'img-info' });
      const sel = f.fileInput({ label: 'اختر أي ملف (صورة، PDF، صوت…)', icon: '📁' });
      sel.querySelector('input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const buf = await f.readBuffer(file);
        let bin = '';
        new Uint8Array(buf).forEach((b) => (bin += String.fromCharCode(b)));
        const b64 = btoa(bin);
        info.textContent = file.name + ' · ' + f.bytes(file.size) + ' · ' + b64.length.toLocaleString('en-US') + ' حرف Base64';
        res.value = b64;
        res.set = res.set.bind(res);
        const mime = file.type || 'application/octet-stream';
        res.pre.textContent = b64;
        res.value = b64;
        res.el.classList.remove('empty');
      });
      root.append(
        sel,
        info,
        f.row(
          f.btn('انسخ Base64 فقط', () => f.copy(res.value || ''), 'primary'),
          f.btn('انسخ Data URL', () => f.copy('data:' + 'application/octet-stream' + ';base64,' + (res.value || '')))
        ),
        res.el
      );
    }
  });

  /* ---------- 5. Base64 / Data URL إلى ملف ---------- */
  t({
    id: 'base64-to-file', cat: 'code', icon: '📥', title: 'Base64 / Data URL → ملف',
    desc: 'يعيد بناء الملف من نص Base64 ويُنزّله',
    render: function (root) {
      const ta = f.area({ rows: 8, placeholder: 'الصق نص Base64 أو Data URL هنا…', dir: 'ltr' });
      const nameInp = f.inp({ value: 'file', placeholder: 'اسم الملف بلا امتداد' });
      const typeInp = f.select({
        options: [['auto', 'اكتشاف تلقائي'], ['image/png', 'صورة PNG'], ['image/jpeg', 'صورة JPG'], ['application/pdf', 'PDF'], ['application/octet-stream', 'ملف عام']],
        value: 'auto'
      });
      root.append(
        f.field('المحتوى', ta),
        f.grid(f.field('اسم الملف', nameInp), f.field('نوع الملف', typeInp)),
        f.row(f.btn('⬇️ أنشئ ونزّل الملف', () => {
          try {
            let data = ta.value.trim();
            let mime = 'application/octet-stream';
            const m = /^data:([^;]+);base64,(.*)$/s.exec(data);
            if (m) { mime = m[1]; data = m[2]; }
            if (typeInp.value !== 'auto') mime = typeInp.value;
            const bin = atob(data.replace(/\s+/g, ''));
            const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
            const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'application/pdf': 'pdf', 'image/gif': 'gif', 'image/webp': 'webp', 'text/plain': 'txt' }[mime] || 'bin';
            f.download((nameInp.value || 'file') + '.' + ext, new Blob([bytes], { type: mime }), mime);
          } catch (e) { f.toast('نص Base64 غير صالح', 'err'); }
        }, 'primary'))
      );
    }
  });

  /* ---------- 6. ترميز URL ---------- */
  t({
    id: 'url-encode', cat: 'code', icon: '🌐', title: 'ترميز وفك ترميز URL',
    desc: 'encodeURIComponent و decodeURIComponent وتحليل الرابط',
    render: function (root) {
      const ta = f.area({ rows: 7, placeholder: 'https://example.com/بحث?q=مرحبا بالعالم', dir: 'ltr' });
      const res = f.out({ filename: 'url.txt', dir: 'ltr' });
      root.append(
        f.field('النص أو الرابط', ta),
        f.row(
          f.btn('ترميز كامل', () => res.set(encodeURIComponent(ta.value)), 'primary'),
          f.btn('فك الترميز', () => res.set(decodeURIComponent(ta.value)), 'primary'),
          f.btn('ترميز الرابط فقط', () => res.set(encodeURI(ta.value)), 'ghost'),
          f.btn('تحليل الرابط', () => {
            try {
              const u = new URL(ta.value.trim());
              res.set(['البروتوكول: ' + u.protocol, 'الدومين: ' + u.hostname, 'المنفذ: ' + (u.port || 'افتراضي'),
                'المسار: ' + u.pathname, 'الاستعلام: ' + u.search, 'المقطع: ' + u.hash,
                '', 'المعاملات:', ...[...u.searchParams.entries()].map(([k, v]) => '  ' + k + ' = ' + v)].join('\n') || 'لا معاملات');
            } catch (e) { res.set('❌ رابط غير صالح'); }
          }, 'ghost')
        ),
        res.el
      );
    }
  });

  /* ---------- 7. كيانات HTML ---------- */
  t({
    id: 'html-entities', cat: 'code', icon: '🔣', title: 'ترميز HTML وكياناته',
    desc: 'يعالج الرموز &lt; &gt; &amp; ويحوّل الكيانات إلى نص',
    render: function (root) {
      const ta = f.area({ rows: 8, placeholder: '<div class="x">مرحبا &amp; أهلاً</div>', dir: 'ltr' });
      const res = f.out({ filename: 'entities.txt', dir: 'ltr' });
      root.append(
        f.field('المحتوى', ta),
        f.row(
          f.btn('ترميز (escape)', () => res.set(ta.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')), 'primary'),
          f.btn('فك الترميز (unescape)', () => { const d = document.createElement('textarea'); d.innerHTML = ta.value; res.set(d.value); }, 'primary'),
          f.btn('ترميز كل الرموز', () => res.set([...ta.value].map((c) => (/[\p{L}\p{N}\s]|[\u0600-\u06FF]/u.test(c) ? c : '&#' + c.codePointAt(0) + ';')).join('')), 'ghost')
        ),
        res.el
      );
    }
  });

  /* ---------- 8. تجزئة SHA ---------- */
  t({
    id: 'hash-sha', cat: 'code', icon: '#️⃣', title: 'تجزئة SHA (256/384/512/1)',
    desc: 'يحسب بصمة التجزئة الحقيقية للنص',
    render: function (root) {
      const ta = f.area({ rows: 6, placeholder: 'النص المراد تجزئته…', dir: 'ltr' });
      const res = f.out({ filename: 'hash.txt', dir: 'ltr' });
      const go = async (algo) => {
        try {
          if (!crypto.subtle) throw new Error('هذا المتصفح لا يدعم التجزئة الآمنة');
          res.set(await sha(algo, ta.value));
        } catch (e) { res.set('❌ ' + e.message); }
      };
      root.append(
        f.field('النص', ta),
        f.row(
          f.btn('SHA-256', () => go('SHA-256'), 'primary'),
          f.btn('SHA-512', () => go('SHA-512')),
          f.btn('SHA-384', () => go('SHA-384')),
          f.btn('SHA-1', () => go('SHA-1'))
        ),
        f.note('التجزئة تُحسب داخل متصفحك فقط ولا يُرسل النص إلى أي جهة.'),
        res.el
      );
    }
  });

  /* ---------- 9. MD5 ---------- */
  t({
    id: 'hash-md5', cat: 'code', icon: '🔒', title: 'تجزئة MD5',
    desc: 'يحسب بصمة MD5 للنص (تنفيذ كامل داخل المتصفح)',
    render: function (root) {
      const ta = f.area({ rows: 6, placeholder: 'النص…' });
      const res = f.out({ filename: 'md5.txt', dir: 'ltr' });
      const run = () => res.set(ta.value ? md5(ta.value) : '');
      ta.addEventListener('input', f.debounce(run, 120));
      root.append(
        f.field('النص', ta),
        f.row(
          f.btn('UD5 لملف صغير', async () => {
            const sel = document.createElement('input');
            sel.type = 'file';
            sel.onchange = async () => {
              const file = sel.files[0];
              if (!file) return;
              const buf = await f.readBuffer(file);
              let bin = '';
              new Uint8Array(buf).forEach((b) => (bin += String.fromCharCode(b)));
              const r = md5(unescape(encodeURIComponent(bin)));
              res.set(r + '\n\n(' + file.name + ' · ' + md5(bin) + ' للتحقق الثنائي)');
            };
            sel.click();
          }, 'ghost')
        ),
        res.el
      );
      run();
    }
  });

  /* ---------- 10. فك JWT ---------- */
  t({
    id: 'jwt-decode', cat: 'code', icon: '🎫', title: 'فك رمز JWT',
    desc: 'يقرأ رأس ومحتوى رمز JWT وتاريخ انتهائه',
    render: function (root) {
      const ta = f.area({ rows: 6, placeholder: 'eyJhbGciOiJIUzI1NiIs…', dir: 'ltr' });
      const res = f.out({ filename: 'jwt.txt', dir: 'ltr' });
      root.append(
        f.field('الرمز', ta),
        f.row(f.btn('فك الرمز', () => {
          try {
            const [h, p] = ta.value.trim().split('.');
            if (!h || !p) throw new Error('الرمز غير مكتمل');
            const dec = (s) => JSON.parse(b64dec(s.replace(/-/g, '+').replace(/_/g, '/')));
            const head = dec(h), body = dec(p);
            let extra = '';
            if (body.exp) extra += '\nتاريخ الانتهاء: ' + new Date(body.exp * 1000).toLocaleString('ar') + (Date.now() > body.exp * 1000 ? '  ⛔ منتهي' : '  ✅ ساري');
            if (body.iat) extra += '\nتاريخ الإصدار: ' + new Date(body.iat * 1000).toLocaleString('ar');
            res.set('— الرأس —\n' + JSON.stringify(head, null, 2) + '\n\n— المحتوى —\n' + JSON.stringify(body, null, 2) + extra + '\n\n⚠️ لم يتم التحقق من التوقيع.');
          } catch (e) { res.set('❌ ' + e.message); }
        }, 'primary')),
        res.el
      );
    }
  });

  /* ---------- 11. Markdown → HTML ---------- */
  t({
    id: 'markdown-to-html', cat: 'code', icon: '⬇️', title: 'تحويل Markdown إلى HTML',
    desc: 'يحوّل العناوين والقوائم والروابط والجداول إلى HTML',
    render: function (root) {
      const ta = f.area({ rows: 10, placeholder: '# عنوان\n**عريض** و *مائل*\n- عنصر\n[رابط](https://example.com)', dir: 'ltr' });
      const res = f.out({ filename: 'output.html', dir: 'ltr' });
      const md = (src) => {
        const codes = [];
        let s = src.replace(/```([\s\S]*?)```/g, (m, c) => { codes.push(c); return '\u0000CODE' + (codes.length - 1) + '\u0000'; });
        const inline = (x) => esc(x)
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/__([^_]+)__/g, '<strong>$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em>$1</em>')
          .replace(/_([^_]+)_/g, '<em>$1</em>')
          .replace(/~~([^~]+)~~/g, '<del>$1</del>')
          .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">')
          .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
        s = inline(s);
        const lines = s.split('\n');
        const out = [];
        let inList = null, inQuote = false;
        const closeList = () => { if (inList) { out.push('</' + inList + '>'); inList = null; } };
        lines.forEach((line) => {
          const h = /^(#{1,6})\s+(.*)$/.exec(line);
          if (h) { closeList(); out.push(`<h${h[1].length}>${h[2]}</h${h[1].length}>`); return; }
          if (/^\s*([-*_])\s*\1\s*\1[\s\S]*$/.test(line) && line.trim().length >= 3) { closeList(); out.push('<hr>'); return; }
          const ul = /^\s*[-*+]\s+(.*)$/.exec(line);
          const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line);
          if (ul) { if (inList !== 'ul') { closeList(); out.push('<ul>'); inList = 'ul'; } out.push('<li>' + ul[1] + '</li>'); return; }
          if (ol) { if (inList !== 'ol') { closeList(); out.push('<ol>'); inList = 'ol'; } out.push('<li>' + ol[1] + '</li>'); return; }
          if (/^\s*>\s?(.*)$/.test(line)) { closeList(); out.push('<blockquote>' + line.replace(/^\s*>\s?/, '') + '</blockquote>'); return; }
          if (line.trim() === '') { closeList(); return; }
          closeList();
          out.push('<p>' + line + '</p>');
        });
        closeList();
        let final = out.join('\n');
        codes.forEach((c, i) => { final = final.replace('\u0000CODE' + i + '\u0000', '<pre><code>' + esc(c.trim()) + '</code></pre>'); });
        return final;
      };
      root.append(
        f.field('Markdown', ta),
        f.row(f.btn('تحويل', () => res.set(md(ta.value)), 'primary'), f.btn('معاينة', () => {
          const w = window.open('', '_blank');
          if (w) { w.document.write('<html dir="rtl"><meta charset="utf-8"><body style="font-family:system-ui;padding:24px;line-height:1.9">' + md(ta.value) + '</body></html>'); w.document.close(); }
          else f.toast('المتصفح منع فتح النافذة', 'err');
        }, 'ghost')),
        res.el
      );
    }
  });

  /* ---------- 12. مختبر التعابير النمطية ---------- */
  t({
    id: 'regex-tester', cat: 'code', icon: '🧪', title: 'مختبر التعابير النمطية (Regex)',
    desc: 'يختبر النمط على النص ويُظهر النتائج والمجموعات',
    render: function (root) {
      const pat = f.inp({ value: '\\d+', placeholder: 'النمط', dir: 'ltr' });
      const flags = f.inp({ value: 'g', placeholder: 'g i m s u', dir: 'ltr' });
      const ta = f.area({ rows: 8, placeholder: 'النص الذي تريد اختباره…', dir: 'ltr', value: 'الطلب رقم 1024 والتاريخ 2026-10-06 والسعر 99.5' });
      const res = f.out({ filename: 'regex.txt', dir: 'ltr' });
      const run = () => {
        try {
          const re = new RegExp(pat.value, flags.value);
          const text = ta.value;
          const matches = [...text.matchAll(re)];
          if (!matches.length) { res.set('لا توجد نتائج مطابقة.'); return; }
          const html = '<span>' + esc(text).replace(re, (m) => '<mark style="background:#ffd76a;color:#111">' + esc(m) + '</mark>') + '</span>';
          res.set({
            html: html + '\n\n━━━━━━━━━━\n' + matches.slice(0, 100).map((m, i) =>
              `[${i + 1}] "${m[0]}" عند ${m.index}` + (m.length > 1 ? '\n     المجموعات: ' + m.slice(1).map((g, j) => `${j + 1}=${g ?? '—'}`).join(', ') : '')
            ).join('\n') + (matches.length > 100 ? '\n… و' + (matches.length - 100) + ' نتيجة أخرى' : ''),
            text: matches.slice(0, 100).map((m) => m[0]).join('\n')
          });
        } catch (e) { res.set('❌ ' + e.message); }
      };
      [pat, flags, ta].forEach((x) => x.addEventListener('input', f.debounce(run, 200)));
      root.append(
        f.grid(f.field('النمط', pat), f.field('الأعلام', flags)),
        f.field('النص', ta),
        f.row(f.btn('اختبر', run, 'primary')),
        res.el
      );
      run();
    }
  });

  /* ---------- 13. شرح تعبير Cron ---------- */
  t({
    id: 'cron-explain', cat: 'code', icon: '⏰', title: 'شرح تعبير Cron',
    desc: 'يشرح تعبيرات cron ويحسب أوقات التشغيل القادمة',
    render: function (root) {
      const i = f.inp({ value: '*/15 9-17 * * 1-5', dir: 'ltr' });
      const res = f.out({ filename: 'cron.txt', dir: 'auto' });
      const NAME = [
        { n: 'الدقيقة', lo: 0, hi: 59 }, { n: 'الساعة', lo: 0, hi: 23 }, { n: 'اليوم من الشهر', lo: 1, hi: 31 },
        { n: 'الشهر', lo: 1, hi: 12 }, { n: 'يوم الأسبوع', lo: 0, hi: 6 }
      ];
      const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      function parseField(str, idx) {
        const out = new Set();
        str.split(',').forEach((part) => {
          let step = 1;
          let range = part;
          const sl = part.split('/');
          if (sl.length === 2) { range = sl[0]; step = parseInt(sl[1], 10) || 1; }
          let lo, hi;
          if (range === '*' || range === '') { lo = NAME[idx].lo; hi = NAME[idx].hi; }
          else if (range.includes('-')) { const [a, b] = range.split('-'); lo = +a; hi = +b; }
          else { lo = hi = +range; }
          if (isNaN(lo) || isNaN(hi)) throw new Error('قيمة غير مفهومة: ' + part);
          for (let v = lo; v <= hi; v += step) out.add(v);
        });
        return [...out].sort((a, b) => a - b);
      }
      const describe = (field, idx, values) => {
        if (field === '*') return NAME[idx].n + ': كل القيم';
        if (field.includes(',')) return NAME[idx].n + ': ' + values.length + ' قيمة محددة';
        if (field.includes('/')) return NAME[idx].n + ': كل ' + field.split('/')[1] + ' (' + NAME[idx].n + ')';
        if (field.includes('-')) return NAME[idx].n + ': من ' + field.split('-')[0] + ' إلى ' + field.split('-')[1];
        if (idx === 4) return NAME[idx].n + ': ' + DAYS[+field % 7];
        if (idx === 3) return NAME[idx].n + ': ' + (MONTHS[+field - 1] || field);
        return NAME[idx].n + ': ' + field;
      };
      const run = () => {
        const parts = i.value.trim().split(/\s+/);
        if (parts.length !== 5) { res.set('❌ يجب أن يحتوي التعبير على 5 حقول: دقيقة ساعة يوم شهر أسبوع'); return; }
        try {
          const parsed = parts.map((p, idx) => parseField(p, idx));
          const mins = parsed[0], hrs = parsed[1], doms = parsed[2], mons = parsed[3], dows = parsed[4];
          const next = [];
          let d = new Date();
          d.setSeconds(0, 0);
          d.setMinutes(d.getMinutes() + 1);
          for (let guard = 0; guard < 200000 && next.length < 6; guard++) {
            if (mons.includes(d.getMonth() + 1) && doms.includes(d.getDate()) && dows.includes(d.getDay()) && hrs.includes(d.getHours()) && mins.includes(d.getMinutes())) {
              next.push(new Date(d));
              d = new Date(d.getTime() + 60000);
            } else {
              d = new Date(d.getTime() + 60000);
            }
          }
          res.set([
            '📋 التعبير: ' + i.value.trim(),
            '',
            ...parts.map((p, idx) => ' • ' + describe(p, idx, parsed[idx])),
            '',
            'التكرار التقريبي: ' + (mins.length * hrs.length === 1 ? 'مرة واحدة يومياً' : mins.length * hrs.length + ' مرة يومياً'),
            '',
            '⏭️ أوقات التشغيل القادمة:',
            ...(next.length ? next.map((x) => '   ' + x.toLocaleString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })) : ['   تعبير لا ينتج أي وقت خلال السنوات القادمة'])
          ].join('\n'));
        } catch (e) { res.set('❌ ' + e.message); }
      };
      i.addEventListener('input', f.debounce(run, 200));
      root.append(
        f.field('تعبير Cron (5 حقول)', i, 'مثال: 0 9 * * * = كل يوم الساعة 9 صباحاً'),
        f.row(f.btn('أمثلة', () => { i.value = ['* * * * *', '0 9 * * 1-5', '*/15 * * * *', '0 0 1 * *', '30 4 1,15 * 5'.split(' | ')[Math.floor(Math.random() * 5)]][3] || '* * * * *'; run(); }, 'ghost')),
        res.el
      );
      run();
    }
  });

  /* ---------- 14. أنظمة الأعداد ---------- */
  t({
    id: 'number-bases', cat: 'code', icon: '🔢', title: 'تحويل أنظمة الأعداد',
    desc: 'ثنائي، ثماني، عشري، سادس عشري — مع خطوات',
    render: function (root) {
      const val = f.inp({ value: '255', dir: 'ltr' });
      const from = f.select({ options: [['10', 'عشري (10)'], ['2', 'ثنائي (2)'], ['8', 'ثماني (8)'], ['16', 'سادس عشري (16)'], ['36', '36']], value: '10' });
      const res = f.out({ filename: 'bases.txt', dir: 'ltr' });
      const run = () => {
        const n = parseInt(String(val.value).trim(), parseInt(from.value, 10));
        if (isNaN(n)) { res.set('❌ قيمة غير صالحة'); return; }
        res.set([
          'عشري      : ' + n,
          'ثنائي     : ' + n.toString(2),
          'ثماني     : ' + n.toString(8),
          'سادس عشري : ' + n.toString(16).toUpperCase(),
          'قاعدة 36  : ' + n.toString(36).toUpperCase(),
          '',
          'بتات مطلوبة: ' + Math.max(1, n.toString(2).length),
          'رقم عربي   : ' + new Intl.NumberFormat('ar-EG-u-nu-arab').format(n)
        ].join('\n'));
      };
      val.addEventListener('input', f.debounce(run, 150));
      root.append(f.grid(f.field('القيمة', val), f.field('من نظام', from)), f.row(f.btn('حوّل', run, 'primary')), res.el);
      run();
    }
  });

  /* ---------- 15. شفرة مورس ---------- */
  t({
    id: 'morse-code', cat: 'code', icon: '📡', title: 'شفرة مورس',
    desc: 'ترميز وفك ترميز مورس للحروف والأرقام',
    render: function (root) {
      const M = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '/': '-..-.', '@': '.--.-.' };
      const REV = Object.fromEntries(Object.entries(M).map(([k, v]) => [v, k]));
      const ta = f.area({ rows: 6, placeholder: 'SOS أو ... --- ...', dir: 'ltr' });
      const res = f.out({ filename: 'morse.txt', dir: 'ltr' });
      root.append(
        f.field('النص', ta),
        f.row(
          f.btn('ترميز → مورس', () => res.set([...ta.value.toUpperCase()].map((c) => c === ' ' ? '/' : (M[c] || '')).filter(Boolean).join(' ')), 'primary'),
          f.btn('فك ترميز ← مورس', () => res.set(ta.value.trim().split(/\s+/).map((c) => c === '/' ? ' ' : (REV[c] || '?')).join('')), 'primary')
        ),
        res.el
      );
    }
  });

  /* ---------- 16. شفرة قيصر و ROT13 ---------- */
  t({
    id: 'caesar-cipher', cat: 'code', icon: '🏛️', title: 'شفرة قيصر و ROT13',
    desc: 'تشفير وفك تشفير بإزاحة الحروف',
    render: (function () {
      const shiftFn = (s, n) => s.replace(/[a-z]/g, (c) => String.fromCharCode((c.charCodeAt(0) - 97 + n + 26) % 26 + 97))
        .replace(/[A-Z]/g, (c) => String.fromCharCode((c.charCodeAt(0) - 65 + n + 26) % 26 + 65));
      return f.textTool({
        fields: [{ id: 'shift', label: 'الإزاحة', type: 'number', value: 3, min: -25, max: 25 }],
        buttons: [
          { label: 'تشفير', primary: true, run: (s, v) => shiftFn(s, Number(v.shift) || 0) },
          { label: 'فك التشفير', run: (s, v) => shiftFn(s, -(Number(v.shift) || 0)) },
          { label: 'ROT13', run: (s) => shiftFn(s, 13) },
          { label: 'فك كل الإزاحات (25)', run: (s) => { let o = ''; for (let i = 1; i <= 25; i++) o += 'إزاحة ' + i + ': ' + shiftFn(s.slice(0, 90), i) + '\n'; return o; } }
        ]
      });
    })()
  });

  /* ---------- 17. Unicode escape ---------- */
  t({
    id: 'unicode-escape', cat: 'code', icon: '🌏', title: 'ترميز يونيكود',
    desc: 'يحوّل النص إلى \\uXXXX والعكس',
    render: function (root) {
      const ta = f.area({ rows: 7, placeholder: 'مرحبا hello 🙂', dir: 'ltr' });
      const res = f.out({ filename: 'unicode.txt', dir: 'ltr' });
      root.append(
        f.field('النص', ta),
        f.row(
          f.btn('ترميز \\u', () => res.set([...ta.value].map((c) => { const cp = c.codePointAt(0); return cp > 0xFFFF ? '\\u{' + cp.toString(16) + '}' : '\\u' + cp.toString(16).padStart(4, '0'); }).join('')), 'primary'),
          f.btn('ترميز \\x', () => res.set([...ta.value].map((c) => '\\x' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')), 'ghost'),
          f.btn('فك الترميز', () => res.set(ta.value.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})|\\x([0-9a-fA-F]{2})/g, (m, a, b, c) => String.fromCodePoint(parseInt(a || b || c, 16)))), 'primary')
        ),
        res.el
      );
    }
  });

  /* ---------- 18. نص إلى ثنائي ---------- */
  t({
    id: 'text-binary', cat: 'code', icon: '0️⃣', title: 'نص ↔ ثنائي',
    desc: 'يحوّل النص إلى بتات والعكس',
    render: function (root) {
      const ta = f.area({ rows: 7, placeholder: 'مرحبا أو 01101101…', dir: 'ltr' });
      const res = f.out({ filename: 'binary.txt', dir: 'ltr' });
      root.append(
        f.field('المحتوى', ta),
        f.row(
          f.btn('نص → ثنائي (UTF-8)', () => res.set([...new TextEncoder().encode(ta.value)].map((b) => b.toString(2).padStart(8, '0')).join(' ')), 'primary'),
          f.btn('ثنائي → نص', () => {
            try {
              const clean = ta.value.replace(/[^01]/g, '');
              if (clean.length % 8) throw new Error('عدد البتات ليس من مضاعفات 8');
              const bytes = new Uint8Array(clean.match(/.{8}/g).map((b) => parseInt(b, 2)));
              res.set(new TextDecoder().decode(bytes));
            } catch (e) { res.set('❌ ' + e.message); }
          }, 'primary')
        ),
        res.el
      );
    }
  });

  /* ---------- 19. محوّل الألوان ---------- */
  t({
    id: 'color-converter', cat: 'code', icon: '🎨', title: 'محوّل الألوان HEX/RGB/HSL',
    desc: 'يحوّل بين كل صيغ الألوان مع معاينة',
    render: function (root) {
      const val = f.inp({ value: '#4f8cff', dir: 'ltr' });
      const prev = f.el('div', { class: 'color-prev' });
      const res = f.out({ filename: 'color.txt', dir: 'ltr' });
      const hex2rgb = (h) => {
        h = h.replace('#', '').trim();
        if (h.length === 3) h = h.split('').map((c) => c + c).join('');
        if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error('صيغة HEX غير صحيحة');
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
      };
      const rgb2hsl = (r, g, b) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0; const l = (max + min) / 2;
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
          h /= 6;
        }
        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
      };
      const rgb2hsv = (r, g, b) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
        let h = 0;
        if (d) h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
        return [Math.round(h * 60), Math.round(max ? (d / max) * 100 : 0), Math.round(max * 100)];
      };
      const run = () => {
        try {
          const [r, g, b] = hex2rgb(val.value);
          const [h, s, l] = rgb2hsl(r, g, b);
          const [hh, sv, v] = rgb2hsv(r, g, b);
          const toHex = (n) => n.toString(16).padStart(2, '0');
          prev.style.background = `rgb(${r},${g},${b})`;
          prev.textContent = (r * 299 + g * 587 + b * 114) / 1000 > 140 ? 'نص داكن مناسب' : 'نص فاتح مناسب';
          res.set([
            'HEX : #' + toHex(r) + toHex(g) + toHex(b),
            'RGB : rgb(' + r + ', ' + g + ', ' + b + ')',
            'RGBA: rgba(' + r + ', ' + g + ', ' + b + ', 1)',
            'HSL : hsl(' + h + ', ' + s + '%, ' + l + '%)',
            'HSV : hsv(' + hh + ', ' + sv + '%, ' + v + '%)',
            '',
            'القيم المفردة: R=' + r + ' G=' + g + ' B=' + b,
            'السطوع النسبي: ' + (((r * 299 + g * 587 + b * 114) / 1000) / 255 * 100).toFixed(1) + '%'
          ].join('\n'));
        } catch (e) { res.set('❌ ' + e.message); }
      };
      val.addEventListener('input', f.debounce(run, 150));
      const picker = f.el('input', { type: 'color', value: '#4f8cff', class: 'inp color', oninput: (e) => { val.value = e.target.value; run(); } });
      root.append(f.grid(f.field('قيمة اللون', val), f.field('أو اختر من اللوحة', picker)), prev, f.row(f.btn('احسب', run, 'primary')), res.el);
      run();
    }
  });

  /* ---------- 20. فحص تباين الألوان (WCAG) ---------- */
  t({
    id: 'color-contrast', cat: 'code', icon: '🕶️', title: 'فحص تباين الألوان (WCAG)',
    desc: 'يحسب نسبة التباين ويخبرك إن كان النص مقروءاً',
    render: function (root) {
      const c1 = f.el('input', { type: 'color', class: 'inp color', value: '#ffffff' });
      const c2 = f.el('input', { type: 'color', class: 'inp color', value: '#4f8cff' });
      const prev = f.el('div', { class: 'contrast-prev' }, 'نموذج نص للمعاينة — Sample Text 123');
      const res = f.out({ filename: 'contrast.txt' });
      const lum = (hex) => {
        const v = hex.replace('#', '');
        const rgb = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
        const f2 = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
        return 0.2126 * f2[0] + 0.7152 * f2[1] + 0.0722 * f2[2];
      };
      const run = () => {
        const l1 = lum(c1.value), l2 = lum(c2.value);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        prev.style.background = c2.value;
        prev.style.color = c1.value;
        const r = ratio;
        res.set([
          'نسبة التباين: ' + r.toFixed(2) + ':1',
          '',
          'AA نص عادي (4.5):  ' + (r >= 4.5 ? '✅ يجتاز' : '❌ لا يجتاز'),
          'AA نص كبير (3.0):  ' + (r >= 3 ? '✅ يجتاز' : '❌ لا يجتاز'),
          'AAA نص عادي (7.0): ' + (r >= 7 ? '✅ يجتاز' : '❌ لا يجتاز'),
          'AAA نص كبير (4.5): ' + (r >= 4.5 ? '✅ يجتاز' : '❌ لا يجتاز'),
          'مكوّنات الواجهة (3.0): ' + (r >= 3 ? '✅ يجتاز' : '❌ لا يجتاز')
        ].join('\n'));
      };
      [c1, c2].forEach((x) => x.addEventListener('input', run));
      root.append(f.grid(f.field('لون النص', c1), f.field('لون الخلفية', c2)), prev, f.row(f.btn('اقلب', () => { const t = c1.value; c1.value = c2.value; c2.value = t; run(); }, 'ghost')), res.el);
      run();
    }
  });

  /* ---------- 21. مولّد التدرّجات ---------- */
  t({
    id: 'gradient-generator', cat: 'code', icon: '🌈', title: 'مولّد التدرّج اللوني (CSS)',
    desc: 'ينشئ كود CSS لتدرّج لوني مع معاينة فورية',
    render: function (root) {
      const c1 = f.el('input', { type: 'color', class: 'inp color', value: '#4f8cff' });
      const c2 = f.el('input', { type: 'color', class: 'inp color', value: '#8b5cf6' });
      const ang = f.inp({ type: 'number', value: 135, min: 0, max: 360 });
      const type = f.select({ options: [['linear', 'خطي'], ['radial', 'دائري']], value: 'linear' });
      const prev = f.el('div', { class: 'grad-prev' });
      const res = f.out({ filename: 'gradient.css', dir: 'ltr' });
      const run = () => {
        const css = type.value === 'linear'
          ? `background: linear-gradient(${ang.value}deg, ${c1.value} 0%, ${c2.value} 100%);`
          : `background: radial-gradient(circle at 50% 50%, ${c1.value} 0%, ${c2.value} 100%);`;
        prev.style.cssText = css;
        res.set(css);
      };
      [c1, c2, ang, type].forEach((x) => x.addEventListener('input', run));
      [c1, c2, ang, type].forEach((x) => x.addEventListener('change', run));
      root.append(
        f.grid(f.field('اللون الأول', c1), f.field('اللون الثاني', c2), f.field('الزاوية', ang), f.field('النوع', type)),
        prev,
        f.row(f.btn('🎲 ألوان عشوائية', () => {
          const rnd = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
          c1.value = rnd(); c2.value = rnd(); ang.value = Math.floor(Math.random() * 360); run();
        }, 'ghost')),
        res.el
      );
      run();
    }
  });

  /* ---------- 22. تصغير CSS ---------- */
  t({
    id: 'css-minify', cat: 'code', icon: '🗜️', title: 'تصغير CSS',
    desc: 'يزيل التعليقات والمسافات الزائدة من كود CSS',
    render: f.textTool({
      rows: 9,
      buttons: [{
        label: '🗜️ صغّر الكود', primary: true,
        run: (s) => {
          const before = s.length;
          const out = s.replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\s*([{}:;,>~+])\s*/g, '$1')
            .replace(/;}/g, '}')
            .replace(/\s+/g, ' ')
            .trim();
          return out + '\n\n(' + f.bytes(before) + ' → ' + f.bytes(out.length) + ' · التوفير ' + ((1 - out.length / before) * 100).toFixed(1) + '%)';
        }
      }]
    })
  });

  /* ---------- 23. تهريب النصوص للأكواد ---------- */
  t({
    id: 'string-escape', cat: 'code', icon: '🧯', title: 'تهريب النصوص للكود',
    desc: 'يهرّب النص لاستخدامه في JavaScript أو SQL أو JSON',
    render: function (root) {
      const ta = f.area({ rows: 7, placeholder: "نص فيه 'علامات' و \"اقتباسات\" وخلف مائل \\", dir: 'ltr' });
      const res = f.out({ filename: 'escaped.txt', dir: 'ltr' });
      root.append(
        f.field('النص', ta),
        f.row(
          f.btn('JavaScript', () => res.set(JSON.stringify(ta.value)), 'primary'),
          f.btn('SQL', () => res.set(ta.value.replace(/'/g, "''")), 'primary'),
          f.btn('JSON string', () => res.set(JSON.stringify(ta.value))),
          f.btn('Regex', () => res.set(ta.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))),
          f.btn('Shell', () => res.set("'" + ta.value.replace(/'/g, "'\\''") + "'"))
        ),
        res.el
      );
    }
  });

  /* ---------- 24. تنسيق XML ---------- */
  t({
    id: 'xml-format', cat: 'code', icon: '📐', title: 'تنسيق XML',
    desc: 'يرتّب ملفات XML ويصغّرها',
    render: function (root) {
      const ta = f.area({ rows: 9, placeholder: '<root><item id="1">مرحبا</item></root>', dir: 'ltr' });
      const res = f.out({ filename: 'out.xml', dir: 'ltr' });
      const fmt = (xml, indent) => {
        const pad = indent === 'tab' ? '\t' : '  ';
        let level = 0;
        const out = xml.replace(/>\s*</g, '><').replace(/<([^>]+)>/g, (m) => m).split(/(?=<)/g);
        const lines = [];
        out.forEach((chunk) => {
          chunk.split(/(<[^>]+>)/g).filter((x) => x.trim()).forEach((node) => {
            if (/^<\//.test(node)) level = Math.max(0, level - 1);
            lines.push(pad.repeat(level) + node.trim());
            if (/^<[^!?/][^>]*[^/]>$/.test(node) && !/<\/.+>$/.test(node)) level++;
          });
        });
        return lines.join('\n');
      };
      root.append(
        f.field('XML', ta),
        f.row(
          f.btn('تنسيق', () => { try { res.set(fmt(ta.value)); } catch (e) { res.set('❌ ' + e.message); } }, 'primary'),
          f.btn('تصغير', () => res.set(ta.value.replace(/>\s+</g, '><').replace(/<!--[\s\S]*?-->/g, '').trim())),
          f.btn('تحقق بسيط', () => {
            const open = (ta.value.match(/<[^!?/][^>]*[^/]>/g) || []).length;
            const close = (ta.value.match(/<\//g) || []).length;
            res.set(open === close ? '✅ الوسوم متوازنة (' + open + ' وسم)' : `⚠️ غير متوازن: ${open} مفتوح و ${close} مغلق`);
          }, 'ghost')
        ),
        res.el
      );
    }
  });

  /* ---------- 25. تحويل ثواني إلى مدة ---------- */
  t({
    id: 'seconds-to-duration', cat: 'code', icon: '⌛', title: 'ثواني ↔ مدة مقروءة',
    desc: 'يحوّل 3661 ثانية إلى 1 ساعة و1 دقيقة و1 ثانية',
    render: function (root) {
      const i = f.inp({ value: '3661', dir: 'ltr' });
      const res = f.out({ filename: 'duration.txt' });
      const run = () => {
        const total = Math.floor(Number(i.value) || 0);
        const s = total % 60, m = Math.floor(total / 60) % 60, h = Math.floor(total / 3600) % 24, d = Math.floor(total / 86400);
        const parts = [];
        if (d) parts.push(d + ' يوم');
        if (h) parts.push(h + ' ساعة');
        if (m) parts.push(m + ' دقيقة');
        if (s) parts.push(s + ' ثانية');
        res.set([
          'الصيغة المقروءة: ' + (parts.join(' و ') || 'صفر'),
          'HH:MM:SS : ' + [h, m, s].map((x) => String(x).padStart(2, '0')).join(':'),
          'MM:SS    : ' + String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(s).padStart(2, '0'),
          '', 'بالدقائق: ' + f.num(total / 60), 'بالساعات: ' + f.num(total / 3600), 'بالملي ثانية: ' + f.num(total * 1000, 0)
        ].join('\n'));
      };
      i.addEventListener('input', f.debounce(run, 150));
      root.append(f.field('عدد الثواني', i), res.el);
      run();
    }
  });

  /* ---------- 26. مولّد اختصارات ؟ (بصمة الملف النصي) ---------- */
  t({
    id: 'text-stats', cat: 'code', icon: '🔎', title: 'إحصاءات النص التقنية',
    desc: 'أحرف فريدة، ترميز، بايتات، أسطر طويلة',
    render: function (root) {
      const ta = f.area({ rows: 8, placeholder: 'الصق النص…' });
      const res = f.out({ filename: 'stats.txt' });
      const run = () => {
        const s = ta.value;
        const freq = {};
        [...s].forEach((c) => (freq[c] = (freq[c] || 0) + 1));
        const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const lines = s.split('\n');
        res.set([
          'عدد الأحرف: ' + s.length,
          'أحرف فريدة: ' + Object.keys(freq).length,
          'الحجم بالبايت (UTF-8): ' + new TextEncoder().encode(s).length,
          'أطول سطر: ' + Math.max(0, ...lines.map((l) => l.length)) + ' حرفاً',
          'عدد الأسطر: ' + lines.length,
          'تسلسلات عنكبوتية: ' + (s.match(/https?:\/\//g) || []).length,
          '', 'الحروف الأكثر تكراراً:',
          ...top.map(([c, n]) => `  ${JSON.stringify(c).padEnd(6)} ${String(n).padStart(5)}  ${((n / s.length) * 100).toFixed(1)}%`)
        ].join('\n'));
      };
      ta.addEventListener('input', f.debounce(run, 150));
      root.append(f.field('النص', ta), res.el);
      run();
    }
  });

  /* ---------- 27. ألفا: مسافة نصية بسيطة (soundex-like) ---------- */
  t({
    id: 'text-fingerprint', cat: 'code', icon: '🫆', title: 'بصمة النص وتشابهه',
    desc: 'ينشئ بصمة رقمية للنص ويقيس تشابه نصين',
    render: f.dualTextTool({
      aLabel: 'النص الأول', bLabel: 'النص الثاني',
      run: (a, b) => {
        const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();
        const A = norm(a), B = norm(b);
        const gram = (s) => { const g = new Set(); for (let i = 0; i < s.length - 1; i++) g.add(s.slice(i, i + 2)); return g; };
        const GA = gram(A), GB = gram(B);
        const inter = [...GA].filter((x) => GB.has(x)).length;
        const union = new Set([...GA, ...GB]).size || 1;
        const jac = ((inter / union) * 100).toFixed(1);
        const levenshtein = (() => {
          const m = A.length, n = B.length;
          if (!m) return n; if (!n) return m;
          let prev = Array.from({ length: n + 1 }, (_, i) => i);
          for (let i = 1; i <= m; i++) {
            const cur = [i];
            for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
            prev = cur;
          }
          return prev[n];
        })();
        const maxLen = Math.max(A.length, B.length) || 1;
        return [
          'بصمة النص الأول: ' + md5(A).slice(0, 16),
          'بصمة النص الثاني: ' + md5(B).slice(0, 16),
          '',
          'تشابه الجرامات الثنائية: ' + jac + '%',
          'تشابه ليفنشتاين: ' + (((maxLen - levenshtein) / maxLen) * 100).toFixed(1) + '%',
          'مسافة التحرير: ' + levenshtein + ' عملية',
          '',
          A === B ? '✅ النصان متطابقان تماماً' : '⚠️ النصان مختلفان'
        ].join('\n');
      }
    })
  });
})();
