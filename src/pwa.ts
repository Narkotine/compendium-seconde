import { registerSW } from 'virtual:pwa-register';
import { toast } from './ui';

// Service worker de portée /compendium-seconde/ uniquement (caches « compendium-seconde-… »).
export function initPwa() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  const update = registerSW({
    immediate: true,
    onNeedRefresh() {
      toast('Une nouvelle version du cours est disponible.', { label: 'Mettre à jour', run: () => update(true) }, 0);
    },
    onOfflineReady() {
      toast('Cours disponible hors ligne.');
    },
  });
}
