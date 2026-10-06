/* سيرفر تطوير محلي بسيط: node test/serve.js  (ثم افتح http://localhost:3000) */
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 3000;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let p = url.pathname;
  if (p === '/') p = '/index.html';

  // محاكاة دوال Vercel محلياً
  if (p === '/api/translate') {
    try {
      const mod = require(path.join(ROOT, 'api/translate.js'));
      let body = '';
      if (req.method === 'POST') for await (const c of req) body += c;
      const fakeReq = { method: req.method, url: req.url, headers: req.headers, body };
      const fakeRes = {
        statusCode: 200, _headers: {},
        status(c) { this.statusCode = c; return this; },
        setHeader(k, v) { this._headers[k] = v; return this; },
        json(o) {
          res.statusCode = this.statusCode;
          res.setHeader('content-type', 'application/json; charset=utf-8');
          Object.entries(this._headers).forEach(([k, v]) => res.setHeader(k, v));
          res.end(JSON.stringify(o));
          return this;
        },
        end(b) { res.statusCode = this.statusCode; res.end(b); return this; }
      };
      await mod(fakeReq, fakeRes);
    } catch (e) { res.statusCode = 500; res.end(JSON.stringify({ ok: false, error: e.message })); }
    return;
  }

  const file = path.join(ROOT, path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
  fs.readFile(file, (err, data) => {
    if (err) { res.statusCode = 404; res.end('غير موجود'); return; }
    res.setHeader('content-type', MIME[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
}).listen(PORT, '0.0.0.0', () => console.log('🟢 http://localhost:' + PORT));
