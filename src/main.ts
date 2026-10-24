import 'katex/dist/katex.min.css';
import '@fontsource/atkinson-hyperlegible-next/latin-400.css';
import '@fontsource/atkinson-hyperlegible-next/latin-700.css';
import '@fontsource/atkinson-hyperlegible-next/latin-400-italic.css';
import './styles.css';
import { settings, lastRead, saveScroll, getScroll, type Theme } from './store';
import { $, esc, norm, ICON } from './ui';
import { initPwa } from './pwa';

interface TocEntry { id: string; lvl: number; num: string; title: string; part: string; html?: string }
interface Chapter {
  slug: string; num: number; title: string; short: string; group: string | null; ready: boolean; intro: string; version: string;
  toc?: TocEntry[]; figures?: number; exercises?: number; demos?: number; readMin?: number;
  parts?: { exos?: string; corriges?: string; fiche?: string };
}
interface Group { id: string; title: string; hue: number; chapters: string[] }
interface Index { version: string; builtAt: string; appName: string; groups: Group[]; chapters: Chapter[] }
interface SearchEntry { c: string; id: string; n: string; t: string; p: string; k: string; x: string }

const app = document.getElementById('app')!;
const base = import.meta.env.BASE_URL;
let INDEX: Index;
const htmlCache = new Map<string, string>();
let searchData: (SearchEntry & { nx: string; nt: string })[] | null = null;
const bySlug = (s: string) => INDEX.chapters.find((c) => c.slug === s);
const numLabel = (c: Chapter) => (c.slug.startsWith('19-') ? 'Fiche' : `Chapitre ${c.num}`);

// ------------------------------------------------------------------ thème
const THEMES: Theme[] = ['auto', 'light', 'dark'];
const THEME_LABEL: Record<Theme, string> = { auto: 'Thème : automatique', light: 'Thème : clair', dark: 'Thème : sombre' };
function applyTheme(t: Theme) {
  const d = document.documentElement;
  d.dataset.theme = t;
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  const meta = document.querySelector<HTMLMetaElement>('meta[name=theme-color]');
  if (meta) meta.content = dark ? '#17161b' : '#f7f6f2';
  document.querySelectorAll<HTMLButtonElement>('.theme-btn').forEach((b) => {
    b.innerHTML = ICON[t === 'light' ? 'sun' : t === 'dark' ? 'moon' : 'auto'];
    b.setAttribute('aria-label', THEME_LABEL[t] + ' (changer)');
    b.title = THEME_LABEL[t];
  });
}
function cycleTheme() {
  const s = settings.get();
  s.theme = THEMES[(THEMES.indexOf(s.theme) + 1) % THEMES.length];
  settings.set(s); applyTheme(s.theme);
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(settings.get().theme));

// ------------------------------------------------------------------ données
async function getJSON<T>(p: string): Promise<T> {
  const r = await fetch(base + p);
  if (!r.ok) throw new Error(`${p} : ${r.status}`);
  return r.json();
}
async function getChapterHtml(slug: string) {
  if (!htmlCache.has(slug)) {
    const r = await fetch(`${base}content/chapters/${slug}.html`);
    if (!r.ok) throw new Error(`chapitre ${slug} : ${r.status}`);
    // chemins relatifs des figures → base de l'appli
    htmlCache.set(slug, (await r.text()).replace(/(src|href)="content\//g, `$1="${base}content/`));
  }
  return htmlCache.get(slug)!;
}

// ------------------------------------------------------------------ gabarit
function topbar(opts: { back?: boolean; title?: string }) {
  return `<header class="topbar">
    ${opts.back ? `<a class="icon-btn" href="#/" aria-label="Accueil" title="Accueil">${ICON.home}</a>` : ''}
    <div class="topbar-title">${opts.title ? esc(opts.title) : `<span class="brand">Maths <b>Seconde</b></span>`}</div>
    <a class="icon-btn" href="#/recherche" aria-label="Rechercher" title="Rechercher">${ICON.search}</a>
    <button type="button" class="icon-btn theme-btn"></button>
  </header>`;
}
function wire() {
  document.querySelectorAll<HTMLButtonElement>('.theme-btn').forEach((b) => (b.onclick = cycleTheme));
  applyTheme(settings.get().theme);
}

// ------------------------------------------------------------------ accueil
function chapterCard(c: Chapter, hue: number) {
  const status = c.ready
    ? `<span class="badge badge--ok">${c.slug.startsWith('19-') ? 'fiche rédigée' : 'rédigé'}</span>`
    : `<span class="badge badge--prep">en préparation</span>`;
  const facts = c.ready ? [c.exercises ? `${c.exercises} exercices corrigés` : '', c.figures ? `${c.figures} figures` : '', c.readMin ? `≈ ${c.readMin} min` : ''].filter(Boolean).join(' · ') : '';
  return `<li><a class="card${c.ready ? '' : ' card--prep'}" href="#/ch/${c.slug}" style="--hue:${hue}">
    <span class="card-num" aria-hidden="true">${c.slug.startsWith('19-') ? 'A' : c.num}</span>
    <span class="card-body"><span class="card-title">${esc(c.title)}</span>
    <span class="card-meta">${status}${facts ? ` <span class="card-facts">${facts}</span>` : ''}</span></span></a></li>`;
}
function renderHome() {
  document.title = 'Maths Seconde';
  const last = lastRead.get();
  const lastC = last && bySlug(last.slug);
  const ready = INDEX.chapters.filter((c) => c.ready).length;
  app.innerHTML = `${topbar({})}
  <main id="main" class="home">
    <section class="hero">
      <h1>Maths Seconde</h1>
      <p>Le cours de mathématiques de seconde générale et technologique, avec figures, exercices et corrigés détaillés. Fonctionne hors ligne une fois ouvert.</p>
      <p class="hero-small">Programme de seconde de 2026 (BO n° 14 du 2 avril 2026). ${ready} parties rédigées sur ${INDEX.chapters.length} ; les autres sont en préparation.</p>
      <form class="search-form" role="search" action="#/recherche"><label class="sr-only" for="q">Rechercher dans le cours</label>
        <input id="q" type="search" placeholder="Rechercher : intervalle, valeur absolue…" autocomplete="off" enterkeyhint="search"><button class="btn" type="submit">Rechercher</button></form>
    </section>
    ${lastC ? `<a class="resume" href="#/ch/${lastC.slug}"><span class="resume-k">Reprendre la lecture</span><span class="resume-t">${esc(numLabel(lastC))} · ${esc(lastC.title)}</span></a>` : ''}
    ${INDEX.groups.map((g) => `<section class="group" style="--hue:${g.hue}" aria-labelledby="g-${g.id}">
      <h2 id="g-${g.id}">${esc(g.title)}</h2>
      <ul class="cards">${g.chapters.map((s) => bySlug(s)).filter(Boolean).map((c) => chapterCard(c!, g.hue)).join('')}</ul></section>`).join('')}
    <footer class="foot">Maths Seconde v${esc(INDEX.version)} · contenu du ${new Date(INDEX.builtAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</footer>
  </main>`;
  const form = $<HTMLFormElement>('.search-form')!;
  form.onsubmit = (e) => { e.preventDefault(); const q = $<HTMLInputElement>('#q')!.value.trim(); location.hash = `#/recherche/${encodeURIComponent(q)}`; };
  wire();
}

// ------------------------------------------------------------------ chapitre
function tocHtml(c: Chapter) {
  return `<ol class="toc-list">${(c.toc || []).map((t) => `<li class="toc-l${t.lvl} toc-${t.part}"><a href="#/ch/${c.slug}/${t.id}" data-id="${t.id}">${t.num ? `<span class="toc-num">${esc(t.num)}</span> ` : ''}${t.html || esc(t.title)}</a></li>`).join('')}</ol>`;
}
async function renderChapter(slug: string, target: string | null, route: string) {
  const c = bySlug(slug);
  if (!c) return renderNotFound();
  if (app.dataset.view === `ch:${slug}`) { scrollToTarget(target, route); return; }
  const html = await getChapterHtml(slug);
  const order = INDEX.groups.flatMap((g) => g.chapters);
  const i = order.indexOf(slug);
  const prev = bySlug(order[i - 1]), next = bySlug(order[i + 1]);
  const group = INDEX.groups.find((g) => g.id === c.group);
  document.title = `${c.title} · Maths Seconde`;
  const jumps = c.ready ? [['Cours', c.toc?.[0]?.id], ['Exercices', c.parts?.exos], ['Corrigés', c.parts?.corriges], ['Fiche', c.parts?.fiche]].filter(([, id]) => id) : [];
  app.dataset.view = `ch:${slug}`;
  app.innerHTML = `${topbar({ back: true, title: c.short })}
  <div class="chapter-layout${c.ready ? '' : ' chapter-layout--prep'}" style="--hue:${group?.hue ?? 210}">
    ${c.ready ? `<aside class="toc-aside" aria-label="Sommaire du chapitre"><p class="toc-h">Sommaire</p>${tocHtml(c)}</aside>` : ''}
    <main id="main" class="chapter">
      <header class="ch-head">
        <p class="ch-kicker">${esc(group?.title || '')} · ${esc(numLabel(c))}${c.ready ? '' : ' · <span class="badge badge--prep">en préparation</span>'}</p>
        <h1>${esc(c.title)}</h1>
        ${c.intro ? `<p class="ch-intro">${c.intro}</p>` : ''}
        ${jumps.length ? `<nav class="jumps" aria-label="Parties du chapitre">${jumps.map(([l, id]) => `<a class="chip" href="#/ch/${slug}/${id}">${l}</a>`).join('')}
          <details class="toc-mobile"><summary class="chip">${ICON.toc} Sommaire</summary>${tocHtml(c)}</details></nav>` : ''}
      </header>
      <article class="prose">${html}</article>
      <nav class="pager" aria-label="Chapitres voisins">
        ${prev ? `<a class="pager-a" href="#/ch/${prev.slug}"><span>← Précédent</span><b>${esc(prev.short)}</b></a>` : '<span></span>'}
        ${next ? `<a class="pager-a pager-next" href="#/ch/${next.slug}"><span>Suivant →</span><b>${esc(next.short)}</b></a>` : '<span></span>'}
      </nav>
    </main>
  </div>
  <button type="button" class="to-top" aria-label="Revenir en haut" hidden>${ICON.up}</button>`;
  wire();
  if (c.ready) lastRead.set({ slug, title: c.title, at: Date.now() });
  const top = $<HTMLButtonElement>('.to-top')!;
  top.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  // le sommaire mobile se ferme après un choix
  app.querySelectorAll('.toc-mobile a').forEach((a) => a.addEventListener('click', () => $<HTMLDetailsElement>('.toc-mobile')?.removeAttribute('open')));
  // corrigé sous l'énoncé : copié depuis la partie Corrigés à la première ouverture
  app.querySelectorAll<HTMLDetailsElement>('details.cor-inline').forEach((d) => d.addEventListener('toggle', () => {
    const body = d.querySelector('.cor-body')!;
    if (!d.open || body.childElementCount) return;
    const src = document.getElementById(`cor-${d.dataset.cor}`)?.querySelector('.cor-body');
    if (!src) return;
    for (const n of src.childNodes) if (!(n instanceof HTMLElement && n.classList.contains('cor-back'))) body.appendChild(n.cloneNode(true));
    body.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  }));
  observeToc();
  scrollToTarget(target, route);
}
function scrollToTarget(target: string | null, route: string) {
  if (target) {
    const el = document.getElementById(target);
    if (el) {
      for (let p: HTMLElement | null = el; p; p = p.parentElement) if (p.tagName === 'DETAILS') (p as HTMLDetailsElement).open = true;
      if (el.tagName === 'DETAILS') (el as HTMLDetailsElement).open = true;
      requestAnimationFrame(() => { el.scrollIntoView({ block: 'start' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1600); });
      return;
    }
  }
  const y = getScroll(route);
  requestAnimationFrame(() => window.scrollTo(0, y ?? 0));
}
let tocObserver: IntersectionObserver | null = null;
function observeToc() {
  tocObserver?.disconnect();
  const links = new Map<string, HTMLElement[]>();
  app.querySelectorAll<HTMLAnchorElement>('.toc-aside a[data-id]').forEach((a) => links.set(a.dataset.id!, [a]));
  if (!links.size) return;
  tocObserver = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) {
      app.querySelectorAll('.toc-aside a.current').forEach((a) => a.classList.remove('current'));
      const a = links.get(e.target.id)?.[0];
      if (a) { a.classList.add('current'); a.scrollIntoView({ block: 'nearest' }); }
    }
  }, { rootMargin: '0px 0px -75% 0px' });
  app.querySelectorAll('.prose h2[id], .prose h3[id]').forEach((h) => tocObserver!.observe(h));
}

// ------------------------------------------------------------------ recherche
async function renderSearch(q: string) {
  document.title = 'Recherche · Maths Seconde';
  app.dataset.view = 'search';
  app.innerHTML = `${topbar({ back: true, title: 'Recherche' })}
  <main id="main" class="search">
    <form class="search-form" role="search"><label class="sr-only" for="q">Rechercher dans le cours</label>
      <input id="q" type="search" value="${esc(q)}" placeholder="intervalle, racine de 2, arrondi…" autocomplete="off" enterkeyhint="search"><button class="btn" type="submit">Rechercher</button></form>
    <div class="results" aria-live="polite"></div>
  </main>`;
  wire();
  const input = $<HTMLInputElement>('#q')!;
  $<HTMLFormElement>('.search-form')!.onsubmit = (e) => { e.preventDefault(); history.replaceState(null, '', `#/recherche/${encodeURIComponent(input.value.trim())}`); show(input.value); };
  let t = 0;
  input.oninput = () => { clearTimeout(t); t = window.setTimeout(() => { history.replaceState(null, '', `#/recherche/${encodeURIComponent(input.value.trim())}`); show(input.value); }, 150); };
  if (!q) input.focus();
  if (!searchData) searchData = (await getJSON<SearchEntry[]>('content/search.json')).map((e) => ({ ...e, nx: norm(e.x), nt: norm(e.t) }));
  show(q);
}
function snippet(text: string, terms: string[]) {
  const n = norm(text);
  const sameLen = n.length === text.length; // vrai pour le texte latin courant (accents retirés un pour un)
  const i = Math.max(0, n.indexOf(terms[0]));
  const start = Math.max(0, i - 60), end = Math.min(text.length, i + 140);
  const raw = text.slice(start, end), nraw = n.slice(start, end);
  const marks: [number, number][] = [];
  if (sameLen) for (const t of terms) { let k = 0; while ((k = nraw.indexOf(t, k)) >= 0) { marks.push([k, k + t.length]); k += t.length; } }
  marks.sort((x, y) => x[0] - y[0]);
  let out = '', pos = 0;
  for (const [a, b] of marks) { if (a < pos) continue; out += esc(raw.slice(pos, a)) + '<mark>' + esc(raw.slice(a, b)) + '</mark>'; pos = b; }
  out += esc(raw.slice(pos));
  return (start ? '…' : '') + out + (end < text.length ? '…' : '');
}
function show(q: string) {
  const box = $('.results'); if (!box || !searchData) return;
  const terms = norm(q).split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) { box.innerHTML = `<p class="muted">Tape un mot du cours (au moins 2 lettres).</p>`; return; }
  const hits = searchData.map((e) => {
    let score = 0;
    for (const t of terms) { const inT = e.nt.includes(t), inX = e.nx.includes(t); if (!inT && !inX) return null; score += (inT ? 5 : 0) + (inX ? 1 : 0); }
    if (e.k === 'cours') score += 2;
    if (e.k === 'plan') score -= 2;
    return { e, score };
  }).filter(Boolean) as { e: SearchEntry; score: number }[];
  hits.sort((a, b) => b.score - a.score);
  box.innerHTML = hits.length
    ? `<p class="muted">${hits.length} résultat${hits.length > 1 ? 's' : ''}</p><ol class="hits">${hits.slice(0, 60).map(({ e }) => {
      const c = bySlug(e.c)!;
      return `<li><a href="#/ch/${e.c}${e.id ? '/' + e.id : ''}"><span class="hit-ch">${esc(numLabel(c))} · ${esc(c.short)}${e.k === 'plan' ? ' · en préparation' : ''}</span>
        <span class="hit-t">${e.n ? esc(e.n) + ' ' : ''}${esc(e.t)}</span><span class="hit-x">${snippet(e.x, terms)}</span></a></li>`;
    }).join('')}</ol>`
    : `<p class="muted">Aucun résultat pour « ${esc(q)} ».</p>`;
}

function renderNotFound() {
  app.dataset.view = 'nf';
  app.innerHTML = `${topbar({ back: true, title: 'Page introuvable' })}<main id="main" class="home"><h1>Page introuvable</h1><p><a href="#/">Retour à l’accueil</a></p></main>`;
  wire();
}

// ------------------------------------------------------------------ routeur (hash)
let currentRoute = '';
async function route() {
  clearTimeout(st);
  const h = location.hash || '#/';
  if (!h.startsWith('#/')) return; // ancres simples : laissées au navigateur
  const parts = h.slice(2).split('/');
  const key = parts[0] === 'ch' ? `ch/${parts[1]}` : parts[0] || 'home';
  currentRoute = key;
  try {
    if (parts[0] === '' || parts[0] === undefined) { app.dataset.view = 'home'; renderHome(); requestAnimationFrame(() => window.scrollTo(0, getScroll('home') ?? 0)); }
    else if (parts[0] === 'ch' && parts[1]) await renderChapter(parts[1], parts[2] ? decodeURIComponent(parts[2]) : null, key);
    else if (parts[0] === 'recherche') await renderSearch(decodeURIComponent(parts.slice(1).join('/')));
    else renderNotFound();
  } catch (err) {
    console.error(err);
    app.dataset.view = 'err';
    app.innerHTML = `${topbar({ back: true, title: 'Erreur' })}<main id="main" class="home"><h1>Impossible d’afficher cette page</h1><p>${esc(String(err))}</p><p>Vérifie la connexion, puis <a href="#/">reviens à l’accueil</a>.</p></main>`;
    wire();
  }
}
let st = 0;
window.addEventListener('scroll', () => {
  const top = $<HTMLButtonElement>('.to-top');
  if (top) top.hidden = window.scrollY < 800;
  clearTimeout(st); st = window.setTimeout(() => saveScroll(currentRoute, window.scrollY), 120);
}, { passive: true });
window.addEventListener('hashchange', route);

(async () => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  applyTheme(settings.get().theme);
  INDEX = await getJSON<Index>('content/index.json');
  await route();
  initPwa();
})();
