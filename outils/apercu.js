#!/usr/bin/env node
/**
 * Aperçu HTML hors ligne d'un ou plusieurs chapitres du compendium seconde (relecture uniquement, pas l'appli).
 * Usage : NODE_PATH=/home/box/.local/lib/node_modules node outils/apercu.js [01-slug ...]  → apercu/<slug>.html
 * Idée reprise du build collège (formules pré-rendues, SVG inlinés, KaTeX local), code écrit pour ce projet.
 */
const fs = require('fs'), path = require('path');
const katex = require('katex'); const { marked } = require('marked');
const ROOT = path.resolve(__dirname, '..'); const OUT = path.join(ROOT, 'apercu');
const kdir = path.dirname(require.resolve('katex/package.json'));
fs.mkdirSync(path.join(OUT, 'fonts'), { recursive: true });
fs.copyFileSync(path.join(kdir, 'dist/katex.min.css'), path.join(OUT, 'katex.min.css'));
for (const f of fs.readdirSync(path.join(kdir, 'dist/fonts'))) fs.copyFileSync(path.join(kdir, 'dist/fonts', f), path.join(OUT, 'fonts', f));
const chapters = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(ROOT).filter(d => /^\d\d-/.test(d) && fs.existsSync(path.join(ROOT, d, 'cours-et-exercices.md'))).sort();
const CSS = `body{font-family:Arial,Helvetica,sans-serif;max-width:860px;margin:0 auto;padding:16px 20px;line-height:1.55;color:#222}
blockquote{margin:12px 0;padding:8px 14px;border-left:4px solid #1f4e79;background:#f3f7fb}
table{border-collapse:collapse;margin:10px 0}td,th{border:1px solid #bbb;padding:4px 8px}
pre{background:#f5f5f5;padding:10px;overflow:auto}code{font-size:.92em}.fig svg{max-width:100%;height:auto}
.katex-base:has(.mfrac){margin:3px 0}h2{border-bottom:2px solid #1f4e79;padding-bottom:3px;margin-top:2em}`;
for (const ch of chapters) {
  let md = fs.readFileSync(path.join(ROOT, ch, 'cours-et-exercices.md'), 'utf8');
  const store = []; const keep = (h) => `@@K${store.push(h) - 1}@@`;
  md = md.replace(/```[\s\S]*?```/g, (m) => keep(marked.parse(m)));
  md = md.replace(/\$\$([\s\S]+?)\$\$/g, (m, t) => keep(katex.renderToString(t, { displayMode: true, throwOnError: false, strict: 'ignore' })));
  md = md.replace(/\$([^$\n]+?)\$/g, (m, t) => keep(katex.renderToString(t, { throwOnError: false, strict: 'ignore' })));
  md = md.replace(/!\[([^\]]*)\]\((figures\/[^)]+\.svg)\)/g, (m, alt, src) => keep(`<div class="fig" role="img" aria-label="${alt.replace(/"/g, '&quot;')}">${fs.readFileSync(path.join(ROOT, ch, src), 'utf8')}</div>`));
  let html = marked.parse(md);
  for (let i = 0; i < 3; i++) html = html.replace(/@@K(\d+)@@/g, (m, k) => store[+k]);
  const errs = (html.match(/katex-error/g) || []).length;
  fs.writeFileSync(path.join(OUT, ch + '.html'), `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${ch}</title><link rel="stylesheet" href="katex.min.css"><style>${CSS}</style></head><body>${html}</body></html>`);
  console.log(`${ch} → apercu/${ch}.html (${errs} erreur(s) KaTeX)`);
}
