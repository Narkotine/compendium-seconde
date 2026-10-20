#!/usr/bin/env node
/**
 * Vérifications automatiques d’un ou plusieurs chapitres du compendium SECONDE (recopié et adapté du compendium collège ; aucun lien entre les projets).
 * Usage :  NODE_PATH=/home/box/.local/lib/node_modules node outils/verifier-chapitre.js [11-pythagore ...]
 *          (sans argument : tous les chapitres)
 * Contrôles : KaTeX ($...$ et $$...$$), $ non appariés, figures référencées présentes,
 *             SVG sans <style> ni id (ils sont inlinés dans une page unique), pas de sous-dossier
 *             dans figures/ (le build copie fichier par fichier), tableaux sans ligne d'en-tête,
 *             « | » dans une formule à l'intérieur d'un tableau, apostrophes droites, corrigés manquants.
 */
const fs = require('fs'), path = require('path');
let katex = null;
try { katex = require('katex'); } catch (e) { console.warn('katex introuvable : définir NODE_PATH (contrôle KaTeX ignoré)'); }
const ROOT = path.resolve(__dirname, '..');
const chapters = process.argv.slice(2).length ? process.argv.slice(2)
  : fs.readdirSync(ROOT).filter(d => /^\d\d-/.test(d)).sort();

let total = 0;
for (const ch of chapters) {
  const dir = path.join(ROOT, ch), file = path.join(dir, 'cours-et-exercices.md');
  const md = fs.readFileSync(file, 'utf8'); const lines = md.split('\n');
  const issues = []; const warn = (m) => issues.push(m);
  // KaTeX (on capture les avertissements de métrique, ex. « € » dans une formule)
  let nf = 0, euro = 0;
  const cw = console.warn; console.warn = () => {};
  if (katex) {
    const noCode = md.replace(/```[\s\S]*?```/g, '');
    noCode.replace(/\$\$([\s\S]+?)\$\$/g, (m, t) => { nf++; try { katex.renderToString(t, { displayMode: true, throwOnError: true, strict: 'ignore' }); } catch (e) { warn('KaTeX (display) : ' + t.trim().slice(0, 60)); } return ''; });
    noCode.replace(/\$\$[\s\S]+?\$\$/g, '').split('\n').forEach((l, i) => {
      l.replace(/\$([^$\n]+?)\$/g, (m, t) => { nf++; try { katex.renderToString(t, { throwOnError: true, strict: 'ignore' }); } catch (e) { warn(`KaTeX inline : ${t.slice(0, 50)}`); } return ''; });
      if (l.replace(/\$([^$\n]+?)\$/g, '').includes('$')) warn('$ non apparié : ' + l.slice(0, 70));
      l.replace(/\$([^$\n]+?)\$/g, (m, t) => { if (t.includes('€')) euro++; return ''; });
    });
  }
  console.warn = cw;
  if (euro) warn(`${euro} formule(s) contenant « € » (convention : € hors formule, ex. $19{,}60$ €)`);
  // Figures
  const refs = [...md.matchAll(/!\[([^\]]*)\]\((figures\/[^)]+)\)/g)];
  for (const r of refs) {
    if (!fs.existsSync(path.join(dir, r[2]))) warn('Figure manquante : ' + r[2]);
    if (!r[1].trim()) warn('Figure sans texte alternatif : ' + r[2]);
  }
  const figDir = path.join(dir, 'figures'); let nsvg = 0;
  if (fs.existsSync(figDir)) for (const f of fs.readdirSync(figDir)) {
    const p = path.join(figDir, f);
    if (fs.statSync(p).isDirectory()) { warn('Sous-dossier dans figures/ (casse le build) : ' + f); continue; }
    if (!f.endsWith('.svg')) continue; nsvg++;
    const s = fs.readFileSync(p, 'utf8');
    if (/<style/i.test(s)) warn(`SVG ${f} : <style> (fuit dans toute la page)`);
    const ids = [...s.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]).filter(id => !id.startsWith(ch.slice(0, 2) + '-'));
    if (ids.length) warn(`SVG ${f} : id non préfixé (${ids.slice(0, 3).join(', ')})`);
    if (!/<title>/.test(s)) warn(`SVG ${f} : pas de <title>`);
    if (!refs.some(r => r[2] === 'figures/' + f)) warn(`SVG ${f} : jamais référencé dans le .md`);
  }
  // Tableaux
  lines.forEach((l, i) => {
    if (/^\|.*\|\s*$/.test(l) && !/^\|.*\|\s*$/.test(lines[i - 1] || '')) {
      if (!/^\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) warn(`L${i + 1} : tableau sans ligne d’en-tête (non rendu)`);
    }
    if (/^\|/.test(l)) {
      const math = [...l.matchAll(/\$([^$]+)\$/g)].map(m => m[1]).filter(t => t.includes('|') && !t.includes('\\|'));
      if (math.length) warn(`L${i + 1} : « | » dans une formule de tableau (casse les colonnes)`);
    }
  });
  const straight = (md.replace(/```[\s\S]*?```/g, '').replace(/\$[^$]*\$/g, '').match(/[A-Za-zÀ-ÿ]'[A-Za-zÀ-ÿ]/g) || []).length;
  if (straight) warn(`${straight} apostrophe(s) droite(s) ' (convention : ’)`);
  // Corrigés
  const m = md.search(/^## .*Corrig/m);
  if (m < 0) warn('Pas de section Corrigés');
  else {
    const ex = [...md.slice(0, m).matchAll(/^\*\*([A-N]\d+)\.\*\*/gm)].map(x => x[1]);
    const co = new Set([...md.slice(m).matchAll(/^\*\*([A-N]\d+)\.(?:\s*\(modèle\))?\*\*/gm)].map(x => x[1]));
    const miss = ex.filter(e => !co.has(e));
    if (miss.length) warn(`Corrigés manquants (${miss.length}/${ex.length}) : ${miss.join(' ')}`);
  }
  total += issues.length;
  console.log(`\n== ${ch} — ${lines.length} lignes, ${nf} formules, ${nsvg} SVG, ${refs.length} figures référencées : ${issues.length ? issues.length + ' point(s)' : 'OK'}`);
  issues.forEach(x => console.log('  - ' + x));
}
console.log(`\nTotal : ${total} point(s) à traiter.`);
process.exitCode = 0;
