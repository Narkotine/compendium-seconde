// Petit serveur statique pour les tests : dist/ servi sous /compendium-seconde/ (comme GitHub Pages),
// plus une page « voisine » /voisin/ sur la même origine (pour vérifier que le service worker ne la touche pas).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };
export function serve(port = 0) {
  const srv = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname.startsWith('/voisin/')) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end('<!doctype html><title>Voisin</title><h1 id="voisin">Site voisin</h1>'); return; }
    if (!url.pathname.startsWith('/compendium-seconde/')) { res.writeHead(404); res.end('404'); return; }
    let p = path.join(DIST, decodeURIComponent(url.pathname.slice('/compendium-seconde/'.length)));
    if (!p.startsWith(DIST)) { res.writeHead(403); res.end(); return; }
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
    if (!fs.existsSync(p)) { res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }); res.end(fs.readFileSync(path.join(DIST, '404.html'))); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise((ok) => srv.listen(port, '127.0.0.1', () => ok({ srv, origin: `http://127.0.0.1:${srv.address().port}` })));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { origin } = await serve(Number(process.argv[2] || 4175));
  console.log(`dist/ servi sur ${origin}/compendium-seconde/`);
}
