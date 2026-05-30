const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT  = path.join(__dirname);
const PORT  = 3000;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
};

http.createServer((req, res) => {
  const url  = req.url.split('?')[0];
  const file = url === '/' ? 'index.html' : url;
  const fp   = path.join(ROOT, file);
  const ext  = path.extname(fp);

  try {
    const data = fs.readFileSync(fp);
    res.writeHead(200, {
      'Content-Type': TYPES[ext] || 'text/plain',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found: ' + file);
  }
}).listen(PORT, () => {
  console.log('Serving C:\\cafe on http://localhost:' + PORT);
});
