#!/usr/bin/env node
// Captures PNG (Chrome headless) de l'accueil et du chapitre 01 → captures/
//   node scripts/captures.mjs [URL]   (défaut : dist/ servi en local)
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import { serve } from './serve-dist.mjs';
const OUT = new URL('../captures/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });
let BASE = process.argv[2], srv = null;
if (!BASE) { const s = await serve(); srv = s.srv; BASE = `${s.origin}/compendium-seconde/`; }
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const shots = [
  { name: 'accueil-mobile-clair', hash: '', theme: 'light', w: 390, h: 844, full: true },
  { name: 'accueil-mobile-sombre', hash: '', theme: 'dark', w: 390, h: 844 },
  { name: 'accueil-ordinateur', hash: '', theme: 'light', w: 1280, h: 900 },
  { name: 'chapitre-01-mobile-clair', hash: '#/ch/01-nombres-reels-intervalles', theme: 'light', w: 390, h: 844 },
  { name: 'chapitre-01-mobile-sombre-figure', hash: '#/ch/01-nombres-reels-intervalles/s1-1', theme: 'dark', w: 390, h: 844, scroll: 500 },
  { name: 'chapitre-01-demonstration-sombre', hash: '#/ch/01-nombres-reels-intervalles/s3-2', theme: 'dark', w: 390, h: 844, openDemo: true },
  { name: 'chapitre-01-ordinateur', hash: '#/ch/01-nombres-reels-intervalles/s5-1', theme: 'light', w: 1280, h: 900 },
  { name: 'chapitre-01-ordinateur-sombre', hash: '#/ch/01-nombres-reels-intervalles/s6-2', theme: 'dark', w: 1280, h: 900 },
];
for (const s of shots) {
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 2 });
  await p.evaluateOnNewDocument((theme) => localStorage.setItem('compendium-seconde.settings', JSON.stringify({ theme })), s.theme);
  await p.goto(BASE + s.hash, { waitUntil: 'networkidle0' });
  await p.waitForSelector(s.hash ? '.prose .part' : '.cards');
  await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => (i.loading = 'eager', i.decode().catch(() => {})))); });
  await p.addStyleTag({ content: '#toasts{display:none!important}' });
  if (s.openDemo) await p.evaluate(() => { const d = document.querySelectorAll('details.demo')[1]; d.open = true; d.closest('blockquote').scrollIntoView(); window.scrollBy(0, -70); });
  if (s.scroll) await p.evaluate((y) => window.scrollBy(0, y), s.scroll);
  await new Promise((r) => setTimeout(r, 400));
  await p.screenshot({ path: `${OUT}${s.name}.png`, fullPage: !!s.full });
  console.log('capture', `captures/${s.name}.png`);
  await ctx.close();
}
await browser.close();
srv?.close();
