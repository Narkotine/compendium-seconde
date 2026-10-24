#!/usr/bin/env node
/**
 * Tests de bout en bout dans Chrome headless (puppeteer-core).
 *   node scripts/e2e.mjs                       → dist/ servi en local sous /compendium-seconde/ (+ page voisine /voisin/)
 *   node scripts/e2e.mjs https://narkotine.github.io/compendium-seconde/   → site publié (voisin : /compendium-maths/)
 */
import puppeteer from 'puppeteer-core';
import { serve } from './serve-dist.mjs';

const CHROME = process.env.CHROME || '/usr/bin/google-chrome';
let BASE = process.argv[2], srv = null, NEIGHBOURS;
if (!BASE) { const s = await serve(); srv = s.srv; BASE = `${s.origin}/compendium-seconde/`; NEIGHBOURS = [`${s.origin}/voisin/`]; }
else NEIGHBOURS = [new URL('/', BASE).href, new URL('/compendium-maths/', BASE).href];
const SCOPE = BASE;

let fails = 0, n = 0;
const t = (ok, msg, extra = '') => { n++; if (!ok) fails++; console.log(`${ok ? '✓' : '✗'} ${msg}${!ok && extra !== '' ? ' — ' + extra : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-gpu'] });
const ctx = await browser.createBrowserContext();
const p = await ctx.newPage();
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
p.on('requestfailed', (r) => { if (!/favicon/.test(r.url())) errors.push('requête échouée ' + r.url()); });

try {
  console.log(`Site testé : ${BASE}`);
  // 1. Accueil
  await p.goto(BASE, { waitUntil: 'networkidle0' });
  await p.waitForSelector('.cards');
  const home = await p.evaluate(() => ({
    title: document.querySelector('.hero h1')?.textContent,
    groups: [...document.querySelectorAll('.group h2')].map((h) => h.textContent),
    cards: document.querySelectorAll('.card').length,
    prep: document.querySelectorAll('.card--prep').length,
    prepBadges: [...document.querySelectorAll('.card--prep .badge--prep')].every((b) => b.textContent === 'en préparation'),
  }));
  t(home.title === 'Maths Seconde', 'accueil : titre « Maths Seconde »', home.title);
  t(home.groups.join('|') === 'Nombres et calculs|Géométrie|Fonctions|Statistiques et probabilités|Algorithmique et logique|Automatismes', 'accueil : 6 thèmes', home.groups.join('|'));
  t(home.cards === 19 && home.prep === 17 && home.prepBadges, 'accueil : 19 cartes dont 17 « en préparation »', `${home.cards}/${home.prep}`);

  // 2. Chapitre 01
  await p.click('a.card[href="#/ch/01-nombres-reels-intervalles"]');
  await p.waitForSelector('.prose .part');
  await p.waitForFunction(() => [...document.querySelectorAll('.prose img')].every((i) => i.complete), { timeout: 15000 }).catch(() => {});
  const ch = await p.evaluate(async () => {
    const imgs = [...document.querySelectorAll('.prose figure img')];
    await Promise.all(imgs.map((i) => (i.loading = 'eager', i.decode().catch(() => {}))));
    return {
      h1: document.querySelector('.ch-head h1')?.textContent,
      katex: document.querySelectorAll('.prose .katex').length,
      katexErr: document.querySelectorAll('.katex-error').length,
      figs: imgs.length, figsOk: imgs.filter((i) => i.naturalWidth > 0).length,
      demos: document.querySelectorAll('details.demo').length,
      demosClosed: [...document.querySelectorAll('details.demo')].every((d) => !d.open),
      exos: document.querySelectorAll('.exo').length, cors: document.querySelectorAll('details.corrige').length,
      toc: document.querySelectorAll('.toc-mobile .toc-list a').length,
    };
  });
  t(ch.h1 === 'Nombres réels et intervalles', 'chapitre 01 : titre', ch.h1);
  t(ch.katex > 200 && ch.katexErr === 0, `chapitre 01 : ${ch.katex} formules KaTeX, 0 erreur`, `${ch.katex}/${ch.katexErr}`);
  t(ch.figs === 8 && ch.figsOk === 8, `chapitre 01 : 8 figures SVG affichées`, `${ch.figsOk}/${ch.figs}`);
  t(ch.demos === 2 && ch.demosClosed, 'chapitre 01 : 2 démonstrations repliées');
  t(ch.exos === 47 && ch.cors === 47, 'chapitre 01 : 47 exercices et 47 corrigés', `${ch.exos}/${ch.cors}`);
  t(ch.toc > 20, 'chapitre 01 : sommaire', String(ch.toc));
  await p.click('details.demo > summary');
  t(await p.evaluate(() => { const d = document.querySelector('details.demo'); return d.open && d.querySelector('.demo-body').textContent.includes('Supposons'); }), 'démonstration dépliée au clic');
  await p.evaluate(() => document.querySelector('#ex-A1 details.cor-inline > summary').scrollIntoView());
  await p.click('#ex-A1 details.cor-inline > summary');
  t(await p.evaluate(() => document.querySelector('#ex-A1 .cor-inline .cor-body').textContent.includes('notin') || document.querySelector('#ex-A1 .cor-inline .katex') !== null), 'corrigé A1 affiché sous l’énoncé');
  // renvoi interne vers un § (scroll + ouverture)
  await p.evaluate(() => { location.hash = '#/ch/01-nombres-reels-intervalles/cor-B2'; });
  await sleep(300);
  t(await p.evaluate(() => document.getElementById('cor-B2')?.open === true), 'lien direct vers un corrigé : ouvert');

  // 3. Chapitre en préparation
  await p.goto(BASE + '#/ch/13-information-chiffree', { waitUntil: 'networkidle0' });
  await p.waitForSelector('.prep-banner');
  t(await p.evaluate(() => document.querySelector('.ch-head h1').textContent === 'Proportions et évolutions' && document.querySelectorAll('.prose li').length > 3), 'chapitre 13 : page « en préparation » avec le plan');

  // 4. Fiche Automatismes
  await p.goto(BASE + '#/ch/19-fiche-automatismes', { waitUntil: 'networkidle0' });
  await p.waitForSelector('.prose .part');
  t(await p.evaluate(() => document.querySelectorAll('.niveau--1re').length === 11 && document.querySelectorAll('.niveau--2de').length === 40), 'fiche 19 : étiquettes 2de (40) et 1re (11)');

  // 5. Recherche
  await p.goto(BASE + '#/recherche/valeur%20absolue', { waitUntil: 'networkidle0' });
  await p.waitForSelector('.hits li');
  t(await p.evaluate(() => document.querySelectorAll('.hits li').length > 2 && !!document.querySelector('.hits mark')), 'recherche « valeur absolue » : résultats surlignés');
  await p.click('.hits li a');
  await p.waitForSelector('.prose .part');
  t(await p.evaluate(() => location.hash.startsWith('#/ch/')), 'résultat de recherche → chapitre');

  // 6. Thème sombre
  await p.goto(BASE + '#/ch/01-nombres-reels-intervalles', { waitUntil: 'networkidle0' });
  await p.waitForSelector('.theme-btn');
  for (let i = 0; i < 3 && (await p.evaluate(() => document.documentElement.dataset.theme)) !== 'dark'; i++) await p.click('.theme-btn');
  const dark = await p.evaluate(() => ({ theme: document.documentElement.dataset.theme, bg: getComputedStyle(document.body).backgroundColor, figBg: getComputedStyle(document.querySelector('.fig-link')).backgroundColor, stored: localStorage.getItem('compendium-seconde.settings') }));
  t(dark.theme === 'dark' && dark.bg === 'rgb(23, 22, 27)', 'mode sombre : fond sombre', JSON.stringify(dark));
  t(/^rgb\(2[0-9]{2}/.test(dark.figBg), 'mode sombre : figures sur fond clair', dark.figBg);
  t(/"dark"/.test(dark.stored || ''), 'réglage mémorisé sous compendium-seconde.settings');
  await p.reload({ waitUntil: 'networkidle0' });
  t(await p.evaluate(() => document.documentElement.dataset.theme === 'dark'), 'mode sombre conservé après rechargement');
  await p.evaluate(() => localStorage.setItem('compendium-seconde.settings', '{"theme":"auto"}'));

  // 7. Stockage : préfixe
  const keys = await p.evaluate(() => [...Object.keys(localStorage), ...Object.keys(sessionStorage)]);
  t(keys.length > 0 && keys.every((k) => k.startsWith('compendium-seconde.')), 'stockage local : toutes les clés préfixées', keys.join(','));

  // 8. Service worker : portée, caches, voisins
  const sw = await p.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    for (let i = 0; i < 50 && !navigator.serviceWorker.controller; i++) await new Promise((r) => setTimeout(r, 200));
    const regs = await navigator.serviceWorker.getRegistrations();
    return { scope: reg.scope, regs: regs.map((r) => r.scope), caches: await caches.keys() };
  });
  t(sw.scope === SCOPE && sw.regs.every((s) => s === SCOPE), 'service worker : portée = ' + SCOPE, JSON.stringify(sw.regs));
  t(sw.caches.length > 0 && sw.caches.every((k) => k.startsWith('compendium-seconde')), 'caches préfixés compendium-seconde', sw.caches.join(','));
  await sleep(1500);
  for (const NB of NEIGHBOURS) {
    const p2 = await ctx.newPage();
    const resp = await p2.goto(NB, { waitUntil: 'networkidle0' });
    // la page voisine peut avoir son propre service worker : on vérifie que ce n'est jamais le nôtre
    const nb = await p2.evaluate(async () => {
      const ctl = navigator.serviceWorker?.controller?.scriptURL || '';
      const reg = await navigator.serviceWorker?.getRegistration();
      return { ctl, regScope: reg?.scope || '', title: document.title };
    });
    const ours = (u) => u.includes('/compendium-seconde/');
    t(!ours(nb.ctl) && !ours(nb.regScope) && nb.title !== 'Maths Seconde' && (resp?.status() ?? 0) < 400, `site voisin ${NB} : intact, pas notre service worker`, JSON.stringify(nb) + ' ' + resp?.status());
    await p2.close();
  }

  // 9. Hors ligne
  await p.reload({ waitUntil: 'networkidle0' });
  t(await p.evaluate(() => !!navigator.serviceWorker.controller), 'page contrôlée par le service worker');
  await p.setOfflineMode(true);
  const before = errors.length;
  await p.goto(BASE + '#/ch/19-fiche-automatismes', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('.prose .part', { timeout: 10000 }).catch(() => {});
  t(await p.evaluate(() => document.querySelectorAll('.prose .katex').length > 50), 'hors ligne : la fiche 19 s’affiche');
  await p.setOfflineMode(false);
  errors.splice(before); // erreurs réseau attendues hors ligne

  t(errors.length === 0, 'aucune erreur dans la console', errors.slice(0, 5).join(' | '));
} catch (e) {
  t(false, 'exception', String(e && e.stack || e));
} finally {
  await browser.close();
  srv?.close();
}
console.log(`\n${n - fails}/${n} tests e2e OK`);
process.exit(fails ? 1 : 0);
