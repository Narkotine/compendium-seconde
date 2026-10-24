#!/usr/bin/env node
// Icônes PNG à partir de public/icons/icon.svg (sharp). À relancer seulement si l'icône change.
import sharp from 'sharp';
import fs from 'node:fs';
const dir = new URL('../public/icons/', import.meta.url).pathname;
const svg = fs.readFileSync(dir + 'icon.svg');
const out = async (name, size, pad = 0) => {
  const inner = Math.round(size * (1 - 2 * pad));
  let img = sharp(svg, { density: 300 }).resize(inner, inner);
  if (pad) img = sharp({ create: { width: size, height: size, channels: 4, background: '#7a3e9d' } }).composite([{ input: await img.png().toBuffer(), gravity: 'center' }]);
  await img.png().toFile(dir + name);
};
await out('icon-192.png', 192); await out('icon-512.png', 512); await out('maskable-512.png', 512, 0.1);
await out('apple-touch-icon.png', 180, 0.06);
fs.copyFileSync(dir + 'icon.svg', dir + 'favicon.svg');
console.log('icônes générées');
