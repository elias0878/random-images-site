/* ============================================================
   ui.js — محرّك الأدوات
   مكتبة صغيرة تبني عليها كل الأدوات: عناصر، حقول، مخرجات، ملفات، صور.
   لا تعتمد على أي مكتبة خارجية.
   ============================================================ */
window.TOOLS = window.TOOLS || [];

window.f = (function () {
  'use strict';

  /* ---------------- عناصر ---------------- */

  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    });
    kids.flat(3).forEach((kid) => {
      if (kid === null || kid === undefined || kid === false || kid === '') return;
      n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    });
    return n;
  }

  const row = (...k) => el('div', { class: 'row' }, ...k);
  const grid = (...k) => el('div', { class: 'grid' }, ...k);
  const note = (txt) => el('p', { class: 'note', text: txt });

  /* ---------------- رسائل ---------------- */

  let toastEl = null;
  function toast(msg, kind) {
    if (!toastEl) {
      toastEl = el('div', { class: 'toast' });
      document.body.append(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.className = 'toast show' + (kind ? ' ' + kind : '');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => (toastEl.className = 'toast'), 2600);
  }

  /* ---------------- نسخ وتنزيل ---------------- */

  async function copy(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const ta = el('textarea', { style: { position: 'fixed', opacity: '0' } });
        ta.value = text;
        document.body.append(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      toast('تم النسخ ✓', 'ok');
      return true;
    } catch (e) {
      toast('تعذّر النسخ', 'err');
      return false;
    }
  }

  function download(name, data, mime) {
    let url;
    if (typeof data === 'string' && data.startsWith('blob:')) url = data;
    else {
      const blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'text/plain;charset=utf-8' });
      url = URL.createObjectURL(blob);
    }
    const a = el('a', { href: url, download: name });
    document.body.append(a);
    a.click();
    a.remove();
    if (typeof data !== 'string' || !data.startsWith('blob:')) setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast('بدأ التنزيل ✓', 'ok');
  }

  /* ---------------- حقول الإدخال ---------------- */

  function field(label, control, hint) {
    return el('label', { class: 'field' },
      el('span', { class: 'flabel', text: label }),
      control,
      hint ? el('span', { class: 'hint', text: hint }) : null);
  }

  function inp(o) {
    o = o || {};
    const i = el('input', {
      class: 'inp',
      type: o.type || 'text',
      value: o.value !== undefined && o.value !== null ? o.value : '',
      placeholder: o.placeholder || '',
      inputmode: o.inputmode || null,
      step: o.step || null,
      min: o.min !== undefined ? o.min : null,
      max: o.max !== undefined ? o.max : null
    });
    return i;
  }

  function area(o) {
    o = o || {};
    return el('textarea', {
      class: 'area',
      rows: o.rows || 7,
      placeholder: o.placeholder || '',
      dir: o.dir || 'auto',
      spellcheck: 'false'
    }, o.value || '');
  }

  function select(o) {
    o = o || {};
    const s = el('select', { class: 'inp' });
    (o.options || []).forEach((op) => {
      const val = Array.isArray(op) ? op[0] : op;
      const lab = Array.isArray(op) ? op[1] : op;
      s.append(el('option', { value: val, selected: String(o.value) === String(val) ? 'selected' : null }, lab));
    });
    return s;
  }

  function check(label, checked) {
    const c = el('input', { type: 'checkbox', checked: checked ? 'checked' : null });
    return { el: el('label', { class: 'check' }, c, el('span', { text: label })), input: c };
  }

  function btn(label, onClick, cls) {
    return el('button', { class: 'btn ' + (cls || ''), type: 'button', onclick: onClick }, label);
  }

  /* ---------------- صندوق المخرجات ---------------- */

  function out(o) {
    o = o || {};
    const pre = el('pre', { class: 'out-pre', dir: o.dir || 'auto' });
    const box = el('div', { class: 'out' }, pre);
    const bar = el('div', { class: 'out-bar' });

    const api = {
      el: box,
      pre,
      set(value) {
        if (value === null || value === undefined) value = '';
        if (typeof value === 'object' && value.html !== undefined) pre.innerHTML = value.html;
        else pre.textContent = String(value);
        api.value = typeof value === 'object' && value.text !== undefined ? value.text : pre.textContent;
        box.classList.remove('empty');
      },
      value: '',
      copy() { copy(api.value); },
      download(name, mime) { download(name || 'result.txt', api.value, mime); }
    };
    if (o.copy !== false) bar.append(btn('📋 نسخ', () => api.copy(), 'ghost'));
    if (o.download !== false) bar.append(btn('⬇️ تنزيل', () => api.download(o.filename), 'ghost'));
    box.append(bar);
    box.classList.add('empty');
    pre.textContent = o.placeholder || 'النتيجة تظهر هنا…';
    return api;
  }

  /* ---------------- ملفات وصور ---------------- */

  function fileInput(o) {
    o = o || {};
    const input = el('input', { type: 'file', class: 'file-inp', accept: o.accept || '*/*', multiple: o.multiple ? 'multiple' : null });
    const label = el('label', { class: 'file-drop' },
      el('span', { class: 'file-ico', text: o.icon || '📁' }),
      el('span', { class: 'file-txt', text: o.label || 'اختر ملفاً أو اسحبه هنا' }),
      input);

    label.addEventListener('dragover', (e) => { e.preventDefault(); label.classList.add('over'); });
    label.addEventListener('dragleave', () => label.classList.remove('over'));
    label.addEventListener('drop', (e) => {
      e.preventDefault();
      label.classList.remove('over');
      if (e.dataTransfer.files.length) {
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
      }
    });
    return label;
  }

  const readText = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error('تعذّر قراءة الملف'));
    r.readAsText(file);
  });

  const readDataURL = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error('تعذّر قراءة الملف'));
    r.readAsDataURL(file);
  });

  const readBuffer = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error('تعذّر قراءة الملف'));
    r.readAsArrayBuffer(file);
  });

  const loadImage = (src) => new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error('تعذّر فتح الصورة'));
    im.crossOrigin = 'anonymous';
    im.src = src;
  });

  function mkCanvas(w, h) {
    const c = el('canvas', { class: 'cv' });
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    return c;
  }

  const canvasBlob = (canvas, type, quality) => new Promise((res) => canvas.toBlob(res, type || 'image/png', quality));

  /* ---------------- أرقام ---------------- */

  const num = (v, dec) => {
    const n = Number(v);
    if (!isFinite(n)) return '—';
    const d = dec === undefined ? 2 : dec;
    return n.toLocaleString('en-US', { maximumFractionDigits: d });
  };
  const bytes = (n) => {
    if (n < 1024) return n + ' بايت';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' كيلوبايت';
    if (n < 1073741824) return (n / 1048576).toFixed(2) + ' ميجابايت';
    return (n / 1073741824).toFixed(2) + ' جيجابايت';
  };
  const debounce = (fn, ms) => {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms || 180); };
  };

  /* ============================================================
     قوالب جاهزة
     ============================================================ */

  /** أداة "نص ← نص": حقل إدخال + أزرار + مخرجات */
  function textTool(o) {
    return function (root) {
      const ta = area({ rows: o.rows || 8, placeholder: o.placeholder || 'الصق النص هنا…', value: o.value || '' });
      const vals = {};
      let fieldsEl = null;

      if (o.fields && o.fields.length) {
        fieldsEl = grid(...o.fields.map((fd) => {
          let ctl;
          if (fd.type === 'select') ctl = select({ options: fd.options, value: fd.value });
          else ctl = inp({ type: fd.type || 'text', value: fd.value, placeholder: fd.placeholder, step: fd.step, min: fd.min, max: fd.max });
          vals[fd.id] = ctl;
          return field(fd.label, ctl, fd.hint);
        }));
      }

      const res = out({ filename: o.filename || 'natija.txt' });
      const bar = row();

      const run = async (b) => {
        try {
          const v = await b.run(ta.value, readVals(vals));
          res.set(v);
        } catch (e) {
          res.set('⚠️ ' + (e && e.message ? e.message : 'خطأ غير متوقع'));
        }
      };

      (o.buttons || [{ label: 'تنفيذ', run: (s) => s, primary: true }]).forEach((b) => {
        bar.append(btn(b.label, () => run(b), b.primary ? 'primary' : ''));
      });

      root.append(fieldsEl, field(o.inputLabel || 'النص', ta), bar, res.el);

      if (o.auto && o.buttons && o.buttons[0]) {
        const b = o.buttons[0];
        ta.addEventListener('input', debounce(() => run(b)));
        if (o.value) run(b);
      }
    };
  }

  /** أداة "نصّان ← نتيجة" */
  function dualTextTool(o) {
    return function (root) {
      const a = area({ rows: o.rows || 8, placeholder: o.aPlaceholder || 'النص الأول…' });
      const b = area({ rows: o.rows || 8, placeholder: o.bPlaceholder || 'النص الثاني…' });
      const res = out({ filename: o.filename });
      const run = () => {
        try { res.set(o.run(a.value, b.value)); }
        catch (e) { res.set('⚠️ ' + e.message); }
      };
      root.append(
        grid(field(o.aLabel || 'الأول', a), field(o.bLabel || 'الثاني', b)),
        row(btn(o.label || 'تنفيذ', run, 'primary'), o.swap ? btn('🔁 تبديل', () => { const t = a.value; a.value = b.value; b.value = t; }, 'ghost') : null),
        res.el
      );
    };
  }

  /** أداة "حقول ← نتيجة" (حاسبات ومحوّلات) */
  function calcTool(o) {
    return function (root) {
      const vals = {};
      const items = (o.fields || []).map((fd) => {
        let ctl;
        if (fd.type === 'select') ctl = select({ options: fd.options, value: fd.value });
        else if (fd.type === 'textarea') ctl = area({ rows: fd.rows || 6, placeholder: fd.placeholder, value: fd.value });
        else ctl = inp({ type: fd.type || 'text', value: fd.value, placeholder: fd.placeholder, step: fd.step, min: fd.min, max: fd.max, inputmode: fd.type === 'number' ? 'decimal' : null });
        vals[fd.id] = ctl;
        return field(fd.label, ctl, fd.hint);
      });

      const res = o.custom || out({ filename: o.filename });
      const run = () => {
        try {
          const r = o.run(readVals(vals), vals);
          if (r === undefined || r === null) return;
          if (res.set) res.set(r);
        } catch (e) { if (res.set) res.set('⚠️ ' + (e.message || 'خطأ')); }
      };

      const bar = row();
      if (!o.live) bar.append(btn(o.label || 'احسب', run, 'primary'));
      if (o.buttons) o.buttons.forEach((b) => bar.append(btn(b.label, () => { try { res.set(b.run(readVals(vals), vals)); } catch (e) { res.set('⚠️ ' + e.message); } }, b.primary ? 'primary' : '')));

      root.append(
        items.length ? grid(...items) : null,
        (o.live || bar.childNodes.length) ? bar : null,
        res.el || res
      );

      if (o.live) {
        root.addEventListener('input', debounce(run, 120));
        run();
      }
      if (o.runOnce) run();
    };
  }

  /** أداة صور: تحميل صورة + تحكم + معالجة على Canvas + مخرجات */
  function imgTool(o) {
    return function (root) {
      let img = null;
      let extraImg = null;
      const canvases = [];

      const vals = {};
      const controlEls = (o.controls || []).map((fd) => {
        let ctl;
        if (fd.type === 'select') ctl = select({ options: fd.options, value: fd.value });
        else if (fd.type === 'color') ctl = el('input', { type: 'color', class: 'inp color', value: fd.value || '#ffffff' });
        else if (fd.type === 'checkbox') { ctl = el('input', { type: 'checkbox', checked: fd.value ? 'checked' : null }); }
        else ctl = inp({ type: fd.type || 'number', value: fd.value, step: fd.step || (fd.type === 'number' ? 1 : null), min: fd.min, max: fd.max, placeholder: fd.placeholder });

        vals[fd.id] = ctl;
        if (fd.type === 'checkbox') return el('label', { class: 'check' }, ctl, el('span', { text: fd.label }));
        return field(fd.label, ctl, fd.hint);
      });

      const view = el('div', { class: 'cv-wrap' });
      const resOut = o.textResult ? out({ filename: o.filename }) : null;
      const info = el('div', { class: 'img-info' });
      const bar = row();

      const applyBtn = btn(o.label || '▶️ تنفيذ', () => run(), 'primary');
      bar.append(applyBtn);

      const fileSel = fileInput({ accept: 'image/*', label: o.fileLabel || 'اختر صورة من جهازك (أو اسحبها هنا)', icon: '🖼️' });
      const fileSel2 = o.two ? fileInput({ accept: 'image/*', label: o.fileLabel2 || 'الصورة الثانية', icon: '🖼️' }) : null;

      fileSel.querySelector('input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          img = await loadImage(await readDataURL(file));
          info.textContent = `📐 ${img.naturalWidth}×${img.naturalHeight} · ${file.name} · ${bytes(file.size)}`;
          if (o.onLoad) o.onLoad({ img, file, vals, info });
          run();
        } catch (err) { toast(err.message, 'err'); }
      });

      if (fileSel2) {
        fileSel2.querySelector('input').addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          try { extraImg = await loadImage(await readDataURL(file)); run(); }
          catch (err) { toast(err.message, 'err'); }
        });
      }

      function readControlValue(fd) {
        const c = vals[fd.id];
        if (fd.type === 'checkbox') return c.checked;
        if (fd.type === 'number' || fd.type === 'range') return c.value === '' ? (fd.value || 0) : Number(c.value);
        return c.value;
      }

      function readControls() {
        const v = {};
        (o.controls || []).forEach((fd) => { v[fd.id] = readControlValue(fd); });
        return v;
      }

      async function run() {
        if (!img) { toast('اختر صورة أولاً', 'err'); return; }
        try {
          const v = readControls();
          const ctxInfo = o.render ? o.render(img, extraImg, v) : null;

          if (o.textResult) {
            const r = await o.textResult(img, extraImg, v, ctxInfo);
            resOut.set(r);
            return;
          }

          // الافتراضي: نتائج على canvas
          const out = await o.draw(img, extraImg, v, mkCanvas, ctxInfo);
          view.replaceChildren(out.canvas || out);
          if (out.after) out.after();
        } catch (e) {
          toast(e.message || 'خطأ في المعالجة', 'err');
        }
      }

      // تشغيل تلقائي عند تغيير القيم
      controlEls.forEach((cEl) => {
        const ctl = cEl.querySelector('input,select,textarea');
        if (ctl) ctl.addEventListener('change', () => run());
      });

      root.append(fileSel, fileSel2, info, controlEls.length ? grid(...controlEls) : null, bar, view, resOut ? resOut.el : null);

      if (o.extra) root.append(o.extra({ vals, canvases, getImg: () => img, run }));
    };
  }

  function readVals(vals) {
    const v = {};
    Object.entries(vals).forEach(([k, ctl]) => {
      if (ctl.type === 'checkbox') v[k] = ctl.checked;
      else if (ctl.type === 'number' || ctl.type === 'range') v[k] = ctl.value === '' ? '' : Number(ctl.value);
      else v[k] = ctl.value;
    });
    return v;
  }

  /* ---------------- تسجيل الأدوات ---------------- */

  function tool(t) {
    window.TOOLS.push(t);
  }

  return {
    el, row, grid, note, field, inp, area, select, check, btn, out, toast, copy, download,
    fileInput, readText, readDataURL, readBuffer, loadImage, mkCanvas, canvasBlob,
    num, bytes, debounce, readVals,
    textTool, dualTextTool, calcTool, imgTool, tool
  };
})();
