#!/usr/bin/env node
/**
 * Maths Seconde : pré-rendu du contenu au build.
 *   cours/NN-slug/cours-et-exercices.md  →  public/content/chapters/NN-slug.html (KaTeX rendu au build)
 *   cours/NN-slug/PLAN.md (chapitre non rédigé) → public/content/chapters/NN-slug.html (page « en préparation »)
 *   public/content/index.json (groupes, chapitres, sommaires), search.json (recherche), figures/<slug>/*.svg
 *   build-report.json (erreurs KaTeX, figures manquantes, avertissements)
 * Source : $COMPENDIUM_SRC, sinon ./cours (copie suivie dans le dépôt, mise à jour par `npm run sync-cours`).
 * Aucun fichier source n'est modifié.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import katex from 'katex';
import { marked } from 'marked';
import { parseHTML } from 'linkedom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.resolve(process.env.COMPENDIUM_SRC || path.join(ROOT, 'cours'));
const OUT = path.join(ROOT, 'public', 'content');
const META = JSON.parse(fs.readFileSync(path.join(ROOT, 'content-meta.json'), 'utf8'));
const report = { src: SRC, katexErrors: [], missingFigures: [], warnings: [], chapters: {} };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[’'`]/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'section';

// ------------------------------------------------------------------ KaTeX
let cur = '';
function renderTex(tex, displayMode) {
  const opts = { displayMode, throwOnError: true, strict: 'ignore', trust: false, output: 'htmlAndMathml' };
  try { return katex.renderToString(tex, opts); }
  catch (e) {
    report.katexErrors.push({ chapter: cur, tex, message: String(e.message || e).slice(0, 200) });
    return katex.renderToString(tex, { ...opts, throwOnError: false });
  }
}

// ------------------------------------------------------------------ Python (coloration légère, sans exécution)
const PY_KW = new Set(['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'range', 'and', 'or', 'not', 'import', 'from', 'as', 'True', 'False', 'None', 'break', 'continue', 'print', 'len', 'int', 'float', 'abs', 'round', 'input', 'is', 'pass', 'lambda']);
function highlightPython(code) {
  const re = /(#.*$)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_]\w*)\b/gm;
  let out = '', last = 0, m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    if (m[1]) out += `<span class="py-com">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="py-str">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="py-num">${m[3]}</span>`;
    else if (PY_KW.has(m[4])) out += `<span class="${/^(print|len|int|float|abs|round|input|range)$/.test(m[4]) ? 'py-fn' : 'py-kw'}">${m[4]}</span>`;
    else out += esc(m[4]);
    last = re.lastIndex;
  }
  return out + esc(code.slice(last));
}
marked.use({
  renderer: {
    code({ text, lang }) {
      const l = (lang || '').trim().toLowerCase();
      const body = l === 'python' || l === 'py' ? highlightPython(text) : esc(text);
      return `<div class="code-wrap"${l ? ` data-lang="${esc(l === 'py' ? 'python' : l)}"` : ''}><pre tabindex="0"><code>${body}</code></pre></div>\n`;
    },
  },
});

/** Protège les formules ($…$, $$…$$, \(…\), \[…\]), convertit le Markdown, restaure le HTML KaTeX. */
function mdToHtml(md) {
  const slots = [];
  const put = (html) => `@@M${slots.push(html) - 1}@@`;
  // les blocs de code ne contiennent pas de formules
  const codes = [];
  let text = md.replace(/^```[\s\S]*?^```/gm, (m) => `@@C${codes.push(m) - 1}@@`);
  text = text.replace(/\\\$/g, '@@DOLLAR@@');
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => put(renderTex(t.trim(), true)));
  text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_, t) => put(renderTex(t.trim(), true)));
  text = text.replace(/\\\(([\s\S]+?)\\\)/g, (_, t) => put(renderTex(t.trim(), false)));
  text = text.replace(/(?<![\\$])\$(?!\$)([^$\n]+?)(?<!\\)\$/g, (_, t) => put(renderTex(t.trim(), false)));
  text = text.replace(/@@DOLLAR@@/g, '&#36;').replace(/@@C(\d+)@@/g, (_, n) => codes[+n]);
  let html = marked.parse(text, { gfm: true, breaks: false });
  html = html.replace(/@@M(\d+)@@/g, (_, n) => slots[+n]);
  html = html.replace(/<p>\s*((?:<span class="katex-display">[\s\S]*?<\/span><\/span><\/span>\s*)+)<\/p>/g, (m, inner) => (/<\/?p>/.test(inner) ? m : inner));
  return html;
}

function texToPlain(tex) {
  return tex.replace(/\\(?:mathrm|text|textbf|mathbf|operatorname|mathbb)\{([^}]*)\}/g, '$1')
    .replace(/\\[dt]?frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2').replace(/\{,\}/g, ',').replace(/\\[,;:! ]/g, ' ')
    .replace(/\\times/g, '×').replace(/\\(?:leqslant|leq|le)\b/g, '≤').replace(/\\(?:geqslant|geq|ge)\b/g, '≥')
    .replace(/\\neq\b/g, '≠').replace(/\\approx\b/g, '≈').replace(/\\sqrt/g, '√').replace(/\\pi\b/g, 'π')
    .replace(/\\in\b/g, '∈').replace(/\\cup\b/g, '∪').replace(/\\cap\b/g, '∩').replace(/\\infty\b/g, '∞')
    .replace(/\\[lr]vert/g, '|').replace(/\\left|\\right/g, '').replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
}
function plainText(node) {
  let out = '';
  const walk = (n) => {
    if (n.nodeType === 3) { out += n.textContent; return; }
    if (n.nodeType !== 1) return;
    const cls = n.getAttribute('class') || '';
    if (/\bkatex\b/.test(cls) && !/katex-display/.test(cls)) {
      const ann = n.querySelector('annotation');
      out += ' ' + texToPlain(ann ? ann.textContent : n.textContent) + ' ';
      return;
    }
    if (/\bkatex-display\b/.test(cls)) { const ann = n.querySelector('annotation'); out += ' ' + texToPlain(ann ? ann.textContent : '') + ' '; return; }
    if (/\b(callout-icon|cor-inline|sr-only)\b/.test(cls) || n.tagName === 'SUMMARY' || n.tagName === 'svg') return;
    for (const c of n.childNodes) walk(c);
    if (/^(P|LI|TD|TH|H2|H3|DIV|BLOCKQUOTE|TR|FIGCAPTION|PRE)$/.test(n.tagName)) out += ' ';
  };
  walk(node);
  return out.replace(/\s+/g, ' ').replace(/ ([,.)])/g, '$1').replace(/\( /g, '(').trim();
}

// ------------------------------------------------------------------ encadrés
const ICONS = {
  prereq: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  def: '<path d="M2 5h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 5h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>',
  prop: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 5-6"/>',
  method: '<circle cx="5" cy="6" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="5" cy="18" r="1.5"/><path d="M10 6h11M10 12h11M10 18h11"/>',
  pitfall: '<path d="M12 3 2 21h20L12 3z"/><path d="M12 10v5M12 18h.01"/>',
  retenir: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  premiere: '<path d="M4 20h16"/><path d="M6 16l4-4 3 3 5-6"/><path d="M15 9h3v3"/>',
  redaction: '<path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
  note: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
};
const icon = (k) => `<svg class="callout-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[k] || ICONS.note}</svg>`;
function calloutKind(label) {
  if (/^Prérequis/i.test(label)) return 'prereq';
  if (/^Définition/i.test(label)) return 'def';
  if (/^(Propriété|Théorème|Réciproque|Formules?|Règles?|Conséquence|Corollaire)/i.test(label)) return 'prop';
  if (/^(Méthode|Réflexe)/i.test(label)) return 'method';
  if (/^Erreur/i.test(label)) return 'pitfall';
  if (/^À retenir/i.test(label)) return 'retenir';
  if (/^Et en première/i.test(label)) return 'premiere';
  return 'note';
}

// ------------------------------------------------------------------ chapitres
const groupOf = {};
META.groups.forEach((g) => g.chapters.forEach((s) => (groupOf[s] = g.id)));
const slugs = fs.readdirSync(SRC).filter((d) => /^\d\d-/.test(d) && fs.statSync(path.join(SRC, d)).isDirectory()).sort();
const numToSlug = Object.fromEntries(slugs.map((s) => [parseInt(s, 10), s]));
for (const s of slugs) if (!groupOf[s]) report.warnings.push(`${s} absent de content-meta.json`);
for (const g of META.groups) for (const s of g.chapters) if (!slugs.includes(s)) report.warnings.push(`content-meta.json : ${s} introuvable dans la source`);

if (!OUT.endsWith(path.join('public', 'content'))) throw new Error('sortie inattendue ' + OUT);
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'chapters'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'figures'), { recursive: true });

const chapters = [];
const search = [];
const href = (s, id) => `#/ch/${s}${id ? '/' + id : ''}`;

function headingIds(art, slug) {
  const used = new Set();
  const uniq = (id) => { let i = id, k = 2; while (used.has(i)) i = `${id}-${k++}`; used.add(i); return i; };
  const toc = []; let part = 'cours'; let h2id = 's';
  for (const h of art.querySelectorAll('h2, h3')) {
    const txt = plainText(h);
    let id, num = '', label = txt, m;
    if (h.tagName === 'H2') {
      if ((m = txt.match(/^(\d+)\.\s+(.*)$/))) { num = m[1]; label = m[2]; id = `s${m[1]}`; } else id = slugify(txt);
      if (/^(Exercices|Questions flash)/i.test(label)) part = 'exos';
      else if (/^Corrigés/i.test(label)) part = 'corriges';
      else if (/^Liens avec/i.test(label)) part = 'liens';
      else if (/^Fiche/i.test(label)) part = 'fiche';
      id = uniq(id); h2id = id;
    } else {
      if ((m = txt.match(/^(\d+)\.(\d+)\.?\s+(.*)$/))) { num = `${m[1]}.${m[2]}`; label = m[3]; id = `s${m[1]}-${m[2]}`; }
      else if ((m = txt.match(/^([A-Z])\.\s+(.*)$/))) { num = m[1]; label = m[2]; id = part === 'corriges' ? `cor-serie-${m[1]}` : `serie-${m[1]}`; }
      else id = `${h2id}-${slugify(txt)}`;
      id = uniq(id);
    }
    h.setAttribute('id', id);
    h.setAttribute('tabindex', '-1');
    if (num && h.firstChild && h.firstChild.nodeType === 3) {
      const t0 = h.firstChild.textContent, mm = t0.match(/^(\s*)(\d+(?:\.\d+)?\.?|[A-Z]\.)\s+/);
      if (mm) { h.firstChild.textContent = t0.slice(mm[0].length); h.insertAdjacentHTML('afterbegin', `<span class="h-num">${mm[2].replace(/\.$/, '')}</span> `); }
    }
    const entry = { id, lvl: h.tagName === 'H2' ? 2 : 3, num, title: label, part };
    if (h.querySelector('.katex')) { const c = h.cloneNode(true); c.querySelector('.h-num')?.remove(); entry.html = c.innerHTML.trim(); }
    toc.push(entry);
  }
  return toc;
}

function wrapSections(document, art, toc) {
  const frag = document.createDocumentFragment(); let sec = null;
  for (const n of [...art.childNodes]) {
    if (n.nodeType === 1 && n.tagName === 'H2') {
      const t = toc.find((x) => x.id === n.id);
      sec = document.createElement('section');
      sec.setAttribute('class', `part part--${t?.part || 'cours'}`);
      sec.setAttribute('data-part', t?.part || 'cours');
      sec.setAttribute('aria-labelledby', n.id);
      frag.appendChild(sec);
    }
    if (sec) sec.appendChild(n); else frag.appendChild(n);
  }
  art.replaceChildren(frag);
}

/** Renvois « chapitre N », « chapitre N, § X », « § X » → liens internes. */
function crossRefs(document, art, slug, tocIdsOf) {
  const RE = /([Cc]hapitres?)\s+(\d{1,2})\b(?:(,\s*)(§\s*)(\d+(?:\.\d+)?))?|(§\s*)(\d+(?:\.\d+)?)/g;
  const resolve = (target, num) => {
    if (!num) return null;
    const id = 's' + num.replace('.', '-'), known = tocIdsOf(target);
    if (!known) return null;
    if (known.has(id)) return id;
    const parent = id.replace(/-\d+$/, '');
    return known.has(parent) ? parent : null;
  };
  const mkA = (target, id, text) => {
    const a = document.createElement('a');
    a.setAttribute('href', href(target, id));
    a.setAttribute('class', target === slug ? 'xref' : 'xref xref--ch');
    a.textContent = text; return a;
  };
  const process = (node) => {
    const s = node.textContent; let m, last = 0; const out = [];
    while ((m = RE.exec(s))) {
      if (m.index > last) out.push(document.createTextNode(s.slice(last, m.index)));
      if (m[1]) {
        const target = numToSlug[+m[2]];
        if (!target || (target === slug && !m[5])) { out.push(document.createTextNode(m[0])); }
        else {
          out.push(mkA(target, null, `${m[1]} ${m[2]}`));
          if (m[5]) { out.push(document.createTextNode(m[3])); out.push(mkA(target, resolve(target, m[5]), m[4] + m[5])); }
        }
      } else {
        const id = resolve(slug, m[7]);
        out.push(id ? mkA(slug, id, m[0]) : document.createTextNode(m[0]));
      }
      last = RE.lastIndex;
    }
    if (!out.length) return;
    if (last < s.length) out.push(document.createTextNode(s.slice(last)));
    node.replaceWith(...out);
  };
  const walk = (el) => {
    for (const n of [...el.childNodes]) {
      if (n.nodeType === 3) { if (/[Cc]hapitre|§/.test(n.textContent)) process(n); continue; }
      if (n.nodeType !== 1) continue;
      if (/^(A|CODE|PRE|H1|H2|H3|SUMMARY|SVG|BUTTON|FIGCAPTION)$/i.test(n.tagName) || /\bkatex\b/.test(n.getAttribute('class') || '')) continue;
      walk(n);
    }
  };
  walk(art);
}

function stripMeta(art, document) {
  art.querySelector('h1')?.remove();
  const bq = art.querySelector(':scope > blockquote');
  let intro = '';
  if (bq && /^Compendium seconde/.test(plainText(bq))) {
    // 2e ligne de l'en-tête (public visé, légende) gardée comme chapeau
    const p = bq.querySelector('p');
    const parts = p ? p.innerHTML.split(/<br\s*\/?>/) : [];
    intro = parts.slice(1).join(' ').trim();
    bq.remove();
  }
  for (const hr of art.querySelectorAll(':scope > hr')) hr.remove();
  const lastP = [...art.querySelectorAll(':scope > p')].pop();
  let version = '';
  if (lastP && /^Version v\d/.test(plainText(lastP))) { version = (plainText(lastP).match(/v\d+(?:\.\d+)+/) || [''])[0]; lastP.remove(); }
  return { intro, version };
}

// Liens Markdown vers d'autres fichiers du compendium
function fixLinks(art, slug) {
  for (const a of [...art.querySelectorAll('a[href]')]) {
    const h = a.getAttribute('href');
    if (/^(https?:|mailto:|#\/)/.test(h)) { if (/^https?:/.test(h)) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); } continue; }
    const m = h.match(/(?:^|\/)(\d\d-[a-z0-9-]+)\/(?:cours-et-exercices|PLAN)\.md(?:#.*)?$/);
    if (m && slugs.includes(m[1])) { a.setAttribute('href', href(m[1])); continue; }
    report.warnings.push(`${slug} : lien vers un fichier non publié (${h}), texte conservé`);
    a.replaceWith(...a.childNodes);
  }
}

// ---- passe 1 : HTML + sommaires
const docs = {};
for (const slug of slugs) {
  cur = slug;
  const num = parseInt(slug, 10);
  const coursFile = path.join(SRC, slug, 'cours-et-exercices.md');
  const planFile = path.join(SRC, slug, 'PLAN.md');
  const ready = fs.existsSync(coursFile);
  const cm = META.chapters[slug] || {};
  let title, toc = [], intro = '', version = '', document, art;
  if (ready) {
    ({ document } = parseHTML(`<!doctype html><html lang="fr"><body><article>${mdToHtml(fs.readFileSync(coursFile, 'utf8'))}</article></body></html>`));
    art = document.querySelector('article');
    title = plainText(art.querySelector('h1') || { childNodes: [] }) || slug;
    ({ intro, version } = stripMeta(art, document));
    toc = headingIds(art, slug);
  } else if (fs.existsSync(planFile)) {
    const md = fs.readFileSync(planFile, 'utf8');
    title = (md.match(/^#\s+(?:\d+\.\s+)?(.+?)(?:\s+—\s+plan du chapitre)?\s*$/m) || [, slug])[1];
    ({ document } = parseHTML(`<!doctype html><html lang="fr"><body><article>${mdToHtml(md)}</article></body></html>`));
    art = document.querySelector('article');
    art.querySelector('h1')?.remove();
    // en-tête auteur (Partie, Statut, Format) retiré ; on garde la partie du programme
    const ul = art.querySelector(':scope > ul');
    const partie = ul ? [...ul.children].map(plainText).find((t) => /^Partie du programme/.test(t)) : '';
    ul?.remove();
    // Sections lisibles par un élève ; les notes d'auteur sont retirées
    const KEEP = [[/^Sections prévues/, 'Au programme du chapitre'], [/^Démonstrations/, 'Démonstrations du programme'], [/^Exemples d.algorithme/, 'Algorithmes en Python'],
      [/^Pour aller plus loin/, 'Pour aller plus loin (★★★)'], [/^Passerelles/, 'Passerelles vers la première (★★★, hors programme)'], [/^Rubrique « Et en première/, 'Et en première ?']];
    const out = document.createElement('div');
    let keep = null;
    for (const el of [...art.children]) {
      if (el.tagName === 'H2') { const k = KEEP.find(([re]) => re.test(plainText(el))); keep = k ? k[1] : null; if (keep) { const h = document.createElement('h2'); h.textContent = keep; out.appendChild(h); } continue; }
      if (!keep || el.tagName !== 'UL') continue;
      for (const li of [...el.children]) {
        const t = plainText(li);
        if (/^\(.*\)$/.test(t) || /^Référence/.test(t) || li.querySelector('code')) li.remove();
        else if (keep === 'Au programme du chapitre') li.innerHTML = li.innerHTML.replace(/^\s*§\s*\d+\s*/, '');
      }
      if (el.children.length) out.appendChild(el); else out.lastChild?.tagName === 'H2' && out.lastChild.remove();
    }
    art.replaceChildren(...[...out.childNodes]);
    art.insertAdjacentHTML('afterbegin', `<div class="prep-banner" role="note"><strong>Chapitre en préparation.</strong> Le cours et les exercices ne sont pas encore rédigés : voici ce que contiendra le chapitre.${partie ? ` <span class="prep-partie">${esc(partie.replace(/\s*\(BO[^)]*\)\.?$/, ''))}.</span>` : ''}</div>`);
    // les h2 ne sont pas numérotés : ids simples, pas de sommaire
    for (const h of art.querySelectorAll('h2')) h.setAttribute('id', 'plan-' + slugify(h.textContent));
  } else { report.warnings.push(`${slug} : ni cours ni PLAN.md`); continue; }
  docs[slug] = { document, art, ready, toc };
  chapters.push({ slug, num, title, short: cm.short || title, group: groupOf[slug] || null, ready, intro, version });
}
const tocIdsOf = (s) => (docs[s]?.ready ? new Set(docs[s].toc.map((t) => t.id)) : null);

// ---- passe 2 : figures, démonstrations, encadrés, exercices, tableaux, renvois
for (const slug of Object.keys(docs)) {
  cur = slug;
  const { document, art, ready, toc } = docs[slug];
  const meta = chapters.find((c) => c.slug === slug);
  fixLinks(art, slug);
  if (!ready) {
    crossRefs(document, art, slug, tocIdsOf);
    fs.writeFileSync(path.join(OUT, 'chapters', `${slug}.html`), art.innerHTML);
    search.push({ c: slug, id: '', n: '', t: meta.title, p: 'En préparation', k: 'plan', x: plainText(art) });
    report.chapters[slug] = { ready: false };
    continue;
  }

  // Figures SVG (copiées, légèrement minifiées)
  let figCount = 0;
  for (const img of [...art.querySelectorAll('img')]) {
    const src = img.getAttribute('src') || '', alt = img.getAttribute('alt') || '';
    const srcPath = path.join(SRC, slug, src);
    if (!/^figures\/[^/]+\.svg$/.test(src) || !fs.existsSync(srcPath)) { report.missingFigures.push({ chapter: slug, src }); continue; }
    const svg = fs.readFileSync(srcPath, 'utf8').replace(/<\?xml[^?]*\?>\s*/i, '').replace(/<!DOCTYPE[^>]*>\s*/i, '').replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').trim();
    const name = path.basename(src);
    fs.mkdirSync(path.join(OUT, 'figures', slug), { recursive: true });
    fs.writeFileSync(path.join(OUT, 'figures', slug, name), svg);
    let w = +(svg.match(/<svg[^>]*\swidth="([\d.]+)"/) || [])[1], h = +(svg.match(/<svg[^>]*\sheight="([\d.]+)"/) || [])[1];
    const vb = (svg.match(/viewBox="([^"]+)"/) || [])[1];
    if ((!w || !h) && vb) { const p = vb.split(/[\s,]+/).map(Number); w = p[2]; h = p[3]; }
    const url = `content/figures/${slug}/${name}`;
    const fig = document.createElement('figure');
    fig.setAttribute('class', 'fig');
    fig.innerHTML = `<a class="fig-link" href="${esc(url)}" target="_blank" rel="noopener" aria-label="Ouvrir la figure en grand"><img src="${esc(url)}" alt="${esc(alt)}" width="${Math.round(w)}" height="${Math.round(h)}" loading="lazy" decoding="async"></a>` + (alt ? `<figcaption>${esc(alt)}</figcaption>` : '');
    const p = img.parentNode;
    if (p.tagName === 'P' && plainText(p) === '') p.replaceWith(fig); else img.replaceWith(fig);
    figCount++;
  }

  // Démonstrations repliables : dans un encadré, le paragraphe « *Démonstration…* » et la suite → <details>
  let demos = 0;
  for (const em of [...art.querySelectorAll('blockquote > p > em:first-child')]) {
    const p = em.parentNode;
    if (p.firstChild !== em || !/^Démonstration/.test(em.textContent.trim())) continue;
    const label = em.textContent.trim().replace(/\.\s*$/, '');
    const det = document.createElement('details');
    det.setAttribute('class', 'demo');
    det.innerHTML = `<summary><span class="demo-label">${esc(label)}</span><span class="demo-hint">afficher</span></summary><div class="demo-body"></div>`;
    const body = det.querySelector('.demo-body');
    const after = []; for (let n = p.nextSibling; n; n = n.nextSibling) after.push(n);
    p.replaceWith(det);
    em.remove();
    while (p.firstChild && ((p.firstChild.nodeType === 3 && !p.firstChild.textContent.trim()) || p.firstChild.tagName === 'BR')) p.firstChild.remove();
    if (p.firstChild?.nodeType === 3) p.firstChild.textContent = p.firstChild.textContent.replace(/^\s+/, '');
    body.appendChild(p);
    for (const n of after) body.appendChild(n);
    demos++;
  }

  // Exercices et corrigés : « **A1.** … » jusqu'au prochain énoncé ou titre
  let part = 'cours', curEx = null;
  const exIds = new Set(), cors = {};
  for (const el of [...art.children]) {
    if (el.tagName === 'H2') { part = toc.find((x) => x.id === el.id)?.part || part; curEx = null; continue; }
    if (el.tagName === 'H3') { curEx = null; continue; }
    if (part !== 'exos' && part !== 'corriges') continue;
    const strong = el.tagName === 'P' && el.firstChild === el.firstElementChild && el.firstElementChild?.tagName === 'STRONG' ? el.firstElementChild : null;
    const m = strong && strong.textContent.trim().match(/^([A-Z]\d+)\.\s*(\(modèle\))?$/);
    if (m) {
      const code = m[1];
      if (part === 'exos') {
        curEx = document.createElement('div');
        curEx.setAttribute('class', 'exo'); curEx.setAttribute('id', `ex-${code}`); curEx.setAttribute('data-ex', code);
        strong.setAttribute('class', 'exo-badge'); strong.textContent = code;
        el.replaceWith(curEx); curEx.appendChild(el); exIds.add(code);
      } else {
        curEx = document.createElement('details');
        curEx.setAttribute('class', 'corrige'); curEx.setAttribute('id', `cor-${code}`); curEx.setAttribute('data-ex', code);
        curEx.innerHTML = `<summary><span class="exo-badge">${code}</span><span class="sum-text">Corrigé${m[2] ? ' <span class="modele">rédaction modèle</span>' : ''}</span></summary><div class="cor-body"></div>`;
        el.replaceWith(curEx); strong.remove();
        while (el.firstChild && ((el.firstChild.nodeType === 3 && !el.firstChild.textContent.trim()) || el.firstChild.tagName === 'BR')) el.firstChild.remove();
        if (el.firstChild?.nodeType === 3) el.firstChild.textContent = el.firstChild.textContent.replace(/^\s+/, '');
        if (el.childNodes.length) curEx.querySelector('.cor-body').appendChild(el);
        cors[code] = curEx;
      }
      continue;
    }
    if (curEx && el.tagName !== 'HR') (curEx.tagName === 'DETAILS' ? curEx.querySelector('.cor-body') : curEx).appendChild(el);
  }
  for (const c of exIds) if (!cors[c]) report.warnings.push(`${slug} : exercice ${c} sans corrigé`);
  for (const c of Object.keys(cors)) if (!exIds.has(c)) report.warnings.push(`${slug} : corrigé ${c} sans énoncé`);

  // Étiquettes [2de] / [1re] (fiche Automatismes)
  for (const ex of art.querySelectorAll('div.exo > p:first-child')) {
    ex.innerHTML = ex.innerHTML.replace(/(<\/strong>\s*)\[(2de|1re)\]/, (_, a, n) => `${a}<span class="niveau niveau--${n}" title="${n === '2de' ? 'Automatisme de seconde' : 'Automatisme de première, préparé en seconde'}">${n === '2de' ? '2<sup>de</sup>' : '1<sup>re</sup>'}</span>`);
  }

  // Encadrés
  for (const bq of art.querySelectorAll('blockquote')) {
    const first = bq.firstElementChild;
    const strong = first?.tagName === 'P' && first.firstChild === first.firstElementChild && first.firstElementChild?.tagName === 'STRONG' ? first.firstElementChild : null;
    const kind = strong ? calloutKind(strong.textContent.trim()) : 'redaction'; // encadré sans titre = rédaction modèle
    bq.setAttribute('class', `callout callout--${kind}`);
    bq.insertAdjacentHTML('afterbegin', icon(kind));
    if (strong) strong.setAttribute('class', 'callout-label');
  }

  // Corrigé repliable sous chaque énoncé : coquille vide, remplie à l'ouverture par l'appli (copie de #cor-XX, pas de doublon dans le HTML)
  for (const ex of art.querySelectorAll('div.exo')) {
    const code = ex.getAttribute('data-ex'), cor = cors[code];
    if (!cor) continue;
    ex.insertAdjacentHTML('beforeend', `<details class="cor-inline" data-cor="${code}"><summary>Voir le corrigé</summary><div class="cor-body"></div></details>`);
    cor.querySelector('.cor-body').insertAdjacentHTML('beforeend', `<p class="cor-back"><a href="${href(slug, 'ex-' + code)}">↑ Revoir l’énoncé ${code}</a></p>`);
  }

  // Tableaux : conteneur défilant
  for (const table of [...art.querySelectorAll('table')]) {
    const wrap = document.createElement('div');
    wrap.setAttribute('class', 'table-wrap'); wrap.setAttribute('tabindex', '0'); wrap.setAttribute('role', 'region'); wrap.setAttribute('aria-label', 'Tableau');
    table.replaceWith(wrap); wrap.appendChild(table);
    table.querySelectorAll('thead th').forEach((th) => th.setAttribute('scope', 'col'));
  }

  crossRefs(document, art, slug, tocIdsOf);
  wrapSections(document, art, toc);

  // Recherche : une entrée par h3 (ou h2 sans h3)
  for (const s of art.querySelectorAll('section.part')) {
    const h2 = s.querySelector('h2'); const t2 = toc.find((x) => x.id === h2.id);
    const blocks = []; let b = { id: h2.id, title: t2.title, num: t2.num, nodes: [] };
    for (const n of s.children) {
      if (n.tagName === 'H2') continue;
      if (n.tagName === 'H3') { blocks.push(b); const t3 = toc.find((x) => x.id === n.id); b = { id: n.id, title: t3.title, num: t3.num, nodes: [], parent: t2.title }; continue; }
      b.nodes.push(n);
    }
    blocks.push(b);
    for (const bl of blocks) {
      const text = bl.nodes.map((n) => { const c = n.cloneNode(true); c.querySelectorAll?.('thead, .cor-inline, .cor-back').forEach((e) => e.remove()); return plainText(c); }).join(' ').replace(/\s+/g, ' ').trim();
      if (text || bl.title) search.push({ c: slug, id: bl.id, n: bl.num, t: bl.title, p: bl.parent || '', k: t2.part, x: text });
    }
  }

  const words = plainText(art).split(/\s+/).length;
  const firstOf = (p) => toc.find((t) => t.lvl === 2 && t.part === p)?.id;
  Object.assign(meta, { toc, figures: figCount, exercises: exIds.size, demos, readMin: Math.max(5, Math.round(words / 160 / 5) * 5), parts: { exos: firstOf('exos'), corriges: firstOf('corriges'), fiche: firstOf('fiche') } });
  fs.writeFileSync(path.join(OUT, 'chapters', `${slug}.html`), art.innerHTML);
  report.chapters[slug] = { ready: true, figures: figCount, exercises: exIds.size, corrections: Object.keys(cors).length, demos, toc: toc.length, words };
}

// ------------------------------------------------------------------ sorties
const index = {
  version: JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version,
  builtAt: new Date().toISOString(),
  appName: META.appName,
  groups: META.groups.map(({ id, title, hue, chapters: c }) => ({ id, title, hue, chapters: c.filter((s) => docs[s]) })),
  chapters,
};
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index));
fs.writeFileSync(path.join(OUT, 'search.json'), JSON.stringify(search));
fs.writeFileSync(path.join(ROOT, 'build-report.json'), JSON.stringify(report, null, 2));

const ready = chapters.filter((c) => c.ready);
console.log(`Contenu (${path.relative(ROOT, SRC) || SRC}) : ${chapters.length} chapitres dont ${ready.length} rédigés (${ready.map((c) => c.num).join(', ')}) → public/content`);
console.log(`  figures ${ready.reduce((a, c) => a + c.figures, 0)}, exercices ${ready.reduce((a, c) => a + c.exercises, 0)}, démonstrations ${ready.reduce((a, c) => a + c.demos, 0)}, recherche ${search.length} entrées`);
console.log(`  KaTeX erreurs : ${report.katexErrors.length}, figures manquantes : ${report.missingFigures.length}, avertissements : ${report.warnings.length}`);
for (const w of report.warnings) console.log('  ⚠', w);
for (const e of report.katexErrors) console.log('  ✗ KaTeX', e.chapter, e.tex, e.message);
if (report.katexErrors.length || report.missingFigures.length) { console.error('ÉCHEC : erreurs KaTeX ou figures manquantes'); process.exit(1); }
