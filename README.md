# Maths Seconde — application (PWA) v0.1

Application web installable et **hors ligne** pour lire le compendium de mathématiques de **seconde**
(programme de 2026, BO n° 14 du 2 avril 2026). En ligne : <https://narkotine.github.io/compendium-seconde/>.

Première version **de lecture** : pas encore d’exercices générés ni de calculatrice (prévus dans `cours/PLAN-APPLI.md`).

- Accueil par thèmes : Nombres et calculs · Géométrie · Fonctions · Statistiques et probabilités · Algorithmique et logique · Automatismes.
- Chapitres rédigés (aujourd’hui : 01 et la fiche Automatismes) : formules KaTeX rendues au build, figures SVG
  (toujours sur fond clair, ouvrables en grand), encadrés typés, **démonstrations repliables**, corrigé repliable
  sous chaque énoncé + partie Corrigés, renvois « chapitre N, § X » cliquables, étiquettes 2de / 1re de la fiche, Python coloré.
- Chapitres seulement planifiés : marqués « en préparation » ; leur page montre le plan lisible par un élève
  (contenu prévu, démonstrations, algorithmes, passerelles, « Et en première ? »), tiré de `PLAN.md`.
- Recherche plein texte hors ligne (sans accents ni majuscules), thème Auto / Clair / Sombre, « Reprendre la lecture »,
  sommaire latéral (≥ 1080 px) ou repliable (mobile), retour à la même position.

## Organisation du dépôt

| Chemin | Rôle |
| --- | --- |
| `cours/` | le contenu (Markdown + figures SVG), importé par **git subtree** depuis le dépôt de rédaction local `/workspace/compendium-seconde` (historique conservé) |
| `content-meta.json` | thèmes, ordre, titres courts |
| `scripts/build-content.mjs` | Markdown → HTML pré-rendu dans `public/content/` (KaTeX, figures, sommaires, recherche) ; rapport `build-report.json` |
| `src/` | l’appli (Vite + TypeScript, sans framework) |
| `scripts/check-dist.mjs` | contrôles statiques de `dist/` |
| `scripts/e2e.mjs` | tests Chrome headless (accueil, chapitre 01, démonstrations, corrigés, recherche, mode sombre, stockage, service worker, hors ligne) |
| `scripts/captures.mjs` | captures PNG → `captures/` |
| `scripts/publish-gh.sh` | publication sur la branche `gh-pages` |

Aucun code partagé avec les autres compendiums (collège, primaire) : idées reprises et réécrites.

## Commandes

```bash
npm install
npm run dev            # contenu + serveur de développement
npm run build          # contenu + TypeScript + build Vite + contrôles de dist/
npm run test:e2e       # tests navigateur sur dist/ (servi en local sous /compendium-seconde/)
node scripts/e2e.mjs https://narkotine.github.io/compendium-seconde/   # mêmes tests sur le site publié
npm run captures       # captures PNG (ou : node scripts/captures.mjs <URL>)
npm run sync-cours     # reprend les commits de /workspace/compendium-seconde dans cours/
npm run publish:gh     # build + tests + commit sur gh-pages (jamais de force-push)
```

`COMPENDIUM_SRC=/workspace/compendium-seconde npm run dev` lit directement le dépôt de rédaction (aperçu avant commit).

## Origine partagée

Le site vit sur `narkotine.github.io`, avec le site de jeux, le collège (`/compendium-maths/`) et le primaire :
- service worker de portée `/compendium-seconde/`, `navigateFallback` limité à ce chemin ;
- caches Workbox `compendium-seconde-…` ;
- clés `localStorage` / `sessionStorage` : `compendium-seconde.settings`, `compendium-seconde.last`, `compendium-seconde.scroll`.
Les tests e2e vérifient ces trois points, et qu’une page voisine de la même origine n’est pas contrôlée.

## Publication

GitHub Pages sert la branche `gh-pages` (racine). Le jeton `gh` n’a pas le scope `workflow` : pas de GitHub Actions,
on publie par `npm run publish:gh` (un commit normal par publication).
