// Stockage local. L'origine narkotine.github.io est partagée avec d'autres sites (jeux, collège, primaire) :
// TOUTES les clés commencent par « compendium-seconde. ».
export const PREFIX = 'compendium-seconde.';

export type Theme = 'auto' | 'light' | 'dark';
export interface Settings { theme: Theme }
export interface LastRead { slug: string; title: string; at: number }

function read<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(PREFIX + key); return raw ? { ...fallback, ...JSON.parse(raw) } : fallback; } catch { return fallback; }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* stockage plein ou interdit */ }
}

export const settings = {
  get: (): Settings => read<Settings>('settings', { theme: 'auto' }),
  set: (s: Settings) => write('settings', s),
};
export const lastRead = {
  get: (): LastRead | null => { const v = read<LastRead | { slug: '' }>('last', { slug: '' }); return v.slug ? (v as LastRead) : null; },
  set: (v: LastRead) => write('last', v),
};

// Positions de lecture (session) : retour à la même position après « Retour »
const SKEY = PREFIX + 'scroll';
export function saveScroll(route: string, y: number) {
  try { const m = JSON.parse(sessionStorage.getItem(SKEY) || '{}'); m[route] = Math.round(y); sessionStorage.setItem(SKEY, JSON.stringify(m)); } catch {}
}
export function getScroll(route: string): number | null {
  try { const m = JSON.parse(sessionStorage.getItem(SKEY) || '{}'); return typeof m[route] === 'number' ? m[route] : null; } catch { return null; }
}
