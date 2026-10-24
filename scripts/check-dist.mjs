#!/usr/bin/env node
// Contrôles statiques de dist/ après le build.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const D = path.join(ROOT, 'dist');
let fails = 0, n = 0;
const t = (ok, msg, extra = '') => { n++; if (!ok) fails++; console.log(`${ok ? '✓' : '✗'} ${msg}${!ok && extra ? ' — ' + extra : ''}`); };
const read = (f) => fs.readFileSync(path.join(D, f), 'utf8');
t(fs.existsSync(D), 'dist/ existe');
const html = read('index.html');
t(/src="\/compendium-seconde\/assets\/index-[^"]+\.js"/.test(html), 'index.html : script sous /compendium-seconde/');
const man = JSON.parse(read('manifest.webmanifest'));
t(man.id === '/compendium-seconde/' && man.scope === '/compendium-seconde/' && man.start_url === '/compendium-seconde/', 'manifeste : id, scope, start_url = /compendium-seconde/');
t(man.name === 'Maths Seconde', 'manifeste : nom « Maths Seconde »');
for (const i of man.icons) t(fs.existsSync(path.join(D, i.src)), `icône ${i.src}`);
const sw = read('sw.js');
t(/cacheId|compendium-seconde/.test(sw) && sw.includes('"compendium-seconde"'), 'service worker : cacheId « compendium-seconde »');
t(sw.includes('compendium-seconde\\/'), 'service worker : navigateFallback limité à /compendium-seconde/');
t(fs.existsSync(path.join(D, '.nojekyll')), '.nojekyll présent');
t(/compendium-seconde\//.test(read('404.html')), '404.html redirige vers /compendium-seconde/');
const idx = JSON.parse(read('content/index.json'));
t(idx.chapters.length === 19, '19 entrées au sommaire', String(idx.chapters.length));
t(idx.groups.map((g) => g.title).join('|') === 'Nombres et calculs|Géométrie|Fonctions|Statistiques et probabilités|Algorithmique et logique|Automatismes', '6 thèmes dans l’ordre');
for (const c of idx.chapters) {
  const f = `content/chapters/${c.slug}.html`;
  const ok = fs.existsSync(path.join(D, f));
  t(ok, `${c.ready ? 'rédigé' : 'en préparation'} : ${f}`);
  if (ok && c.ready) {
    const h = read(f);
    t(!/katex-error/.test(h), `  aucune erreur KaTeX (${c.slug})`);
    for (const m of h.matchAll(/src="(content\/figures\/[^"]+)"/g)) if (!fs.existsSync(path.join(D, m[1]))) t(false, `  figure ${m[1]}`);
  }
}
const rep = JSON.parse(fs.readFileSync(path.join(ROOT, 'build-report.json'), 'utf8'));
t(rep.katexErrors.length === 0 && rep.missingFigures.length === 0, 'rapport de build : 0 erreur KaTeX, 0 figure manquante');
// clés de stockage : aucune chaîne localStorage/sessionStorage hors préfixe dans le JS
const js = fs.readdirSync(path.join(D, 'assets')).filter((f) => f.endsWith('.js')).map((f) => read('assets/' + f)).join('\n') + html;
const keys = [...js.matchAll(/(?:local|session)Storage\.(?:getItem|setItem)\(\s*["'`]([^"'`]+)/g)].map((m) => m[1]);
t(keys.every((k) => k.startsWith('compendium-seconde')), 'clés de stockage littérales préfixées', keys.join(','));
t(/compendium-seconde\./.test(js), 'préfixe « compendium-seconde. » présent dans le code');
const pre = [...sw.matchAll(/url:"([^"]+)"/g)].map((m) => m[1]);
t(pre.includes('content/chapters/01-nombres-reels-intervalles.html') && pre.includes('content/search.json'), 'précache : chapitres et recherche inclus (hors ligne)');
console.log(`\n${n - fails}/${n} contrôles OK`);
process.exit(fails ? 1 : 0);
