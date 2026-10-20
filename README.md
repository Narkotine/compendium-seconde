# Compendium de maths — seconde générale et technologique

Cours structurés pour la classe de **seconde** (lycée), dans l’esprit du compendium collège : cours **développés mais compacts**, compréhensibles par un élève de niveau moyen, avec figures SVG, exemples guidés, erreurs fréquentes, exercices progressifs et corrigés détaillés.

- **Projet séparé.** Contenu ici (`/workspace/compendium-seconde`), future appli dans `/workspace/compendium-seconde-app` (**pas encore créée**). Aucun code partagé avec le collège (`compendium-maths`, `compendium-maths-repo`) ni avec le primaire : pas de lien symbolique, pas d’import de leurs dossiers. Les outils de `outils/` sont écrits pour ce projet ou recopiés-adaptés (l’idée, pas le lien).
- **Rien n’est publié.** Ni dépôt distant, ni push, ni déploiement sans le feu vert explicite de Nguhma (voir § 7).

## 1. Programme de référence

**Programme de mathématiques de seconde GT, arrêté du 26 février 2026, BO n° 14 du 2 avril 2026**, en application à la **rentrée 2026** ; il remplace l’annexe de l’arrêté du 17 janvier 2019. Extrait texte conservé dans `sources/programme-2de-2026.txt` (tiré du PDF du BO).

Organisation officielle : quatre parties thématiques (Nombres et calculs, algèbre ; Géométrie ; Fonctions ; Statistiques et probabilités) et trois parties transversales (Vocabulaire ensembliste et logique ; Algorithmique et programmation ; Automatismes). Le programme précise que ce n’est pas un plan de cours, que les connaissances du collège sont réactivées par des problèmes (pas de chapitres de révision), et il liste des **démonstrations** et **exemples d’algorithmes** à traiter, ainsi que des **approfondissements possibles** (facultatifs).

Points du texte 2026 à surveiller (nouveaux ou explicités ; comparaison détaillée avec 2019 à faire si besoin) : probabilités conditionnelles et arbres pondérés, croisement de deux variables qualitatives (fréquences conditionnelles), fonction valeur absolue, tableaux de signes de produits et quotients, équation quotient $A(x)/B(x) = k$, déterminant de deux vecteurs, partie « Automatismes » détaillée.

## 2. Plan des chapitres

Découpage par sujet, numéroté comme au collège. Chaque dossier contient un `PLAN.md` (sections, démonstrations, algorithmes, compléments ★★★) ; `cours-et-exercices.md` et `figures/` sont ajoutés à la rédaction.

| Thème (navigation) | Dossier | Chapitre | Statut |
|---|---|---|---|
| Nombres et calculs | `01-nombres-reels-intervalles/` | Nombres réels et intervalles | **pilote v0.1.1** |
| Nombres et calculs | `02-arithmetique/` | Arithmétique : multiples, diviseurs, parité | plan |
| Nombres et calculs | `03-puissances-racines/` | Puissances, racines carrées, calcul numérique | plan |
| Algèbre | `04-calcul-litteral/` | Calcul littéral et expressions algébriques | plan |
| Algèbre | `05-inegalites-equations-inequations/` | Inégalités, équations et inéquations | plan |
| Géométrie | `06-vecteurs/` | Vecteurs | plan |
| Géométrie | `07-vecteurs-coordonnees/` | Repérage et coordonnées de vecteurs | plan |
| Géométrie | `08-droites-du-plan/` | Droites du plan | plan |
| Fonctions | `09-fonctions-generalites/` | Fonctions : définitions et représentations | plan |
| Fonctions | `10-variations-extremums/` | Variations et extremums | plan |
| Fonctions | `11-fonctions-affines-signes/` | Fonctions affines et tableaux de signes | plan |
| Fonctions | `12-fonctions-de-reference/` | Fonctions de référence | plan |
| Données et hasard | `13-information-chiffree/` | Proportions et évolutions | plan |
| Données et hasard | `14-statistiques-descriptives/` | Statistiques à une variable | plan |
| Données et hasard | `15-tableaux-croises/` | Croisement de deux variables qualitatives | plan |
| Données et hasard | `16-probabilites-conditionnelles/` | Probabilités et probabilités conditionnelles | plan |
| Outils transversaux | `17-ensembles-et-logique/` | Vocabulaire ensembliste et logique | plan |
| Outils transversaux | `18-algorithmique-python/` | Algorithmique et programmation en Python | plan |
| Outils transversaux | `19-fiche-automatismes/` | Fiche Automatismes (rubriques officielles, colonne « encore évalué en 1re », 51 questions flash) | **rédigée v0.1** |

Les « Automatismes » ne forment pas un chapitre de cours : ils ont une **fiche** (`19-fiche-automatismes/`, rubriques officielles, colonne « encore évalué en 1re », questions flash étiquetées [2de] / [1re]) et un mode **« Rituels »** dans l’appli, conçu comme entraînement à l’épreuve anticipée de première (`PLAN-APPLI.md`, § 2 bis). Décision du 20/10/2026.

**Chapitres 17 et 18 gardés à part (décision du 20/10/2026).** Le programme veut que logique et Python soient travaillés en situation dans tous les chapitres : c’est le cas (renvois). Les chapitres 17 et 18 sont en plus des **chapitres de référence** autonomes ; le tronc commun de 1re technologique reprend presque mot pour mot ces deux parties, ils resserviront donc tels quels (`COMPARAISON-PREMIERE.md`, § 3).

**Lien avec la première.** `COMPARAISON-PREMIERE.md` compare ce programme aux programmes de première hors spécialité (BO n° 14 du 2 avril 2026). Conséquences dans les `PLAN.md` : rubrique « Et en première ? » et lisibilité autonome pour les chapitres 11, 13, 15, 16 ; passerelles ★★★ hors programme pour 03, 05, 09, 11, 12, 13, 14, 16, 18. Les PLAN.md sont générés par `outils/plans-chapitres.py` (qui ne touche jamais aux cours).

## 3. Format d’un chapitre (repris du collège)

Fichier unique `NN-slug/cours-et-exercices.md` ; figures dans `NN-slug/figures/*.svg` (aucun sous-dossier). Structure :

```
# Titre
> En-tête (chapitre N, partie du programme, BO ; public visé ; légende ★ / ★★ / ★★★)
## 0. Ce qu’on vise          une phrase + 4–6 « je sais… » + encadré « > **Prérequis.** »
## 1…n. Notions              intuition → encadré Définition/Propriété → figure → exemples guidés
                             (Énoncé, Réflexion, Rédaction en encadré, Contrôle) → Erreur fréquente chiffrée → Méthode
                             Démonstrations du programme dans l’encadré de la propriété (« *Démonstration.* »)
                             Compléments facultatifs : « *Pour aller plus loin (★★★).* »
## n+1. Mini-synthèse        « > **À retenir.** » (≤ 7 puces)
## n+2. Exercices types      séries A, B, C… (★ → ★★), 20–30 exercices
## n+3. Exercices atypiques  trouver l’erreur, raisonner, plusieurs étapes, ouvert / Python (★★ → ★★★), 12–18
## n+4. Corrigés             100 %, un corrigé « (modèle) » par série, méthode montrée (jamais « vérifie avec un nombre » seul)
## n+5. Liens avec les autres chapitres
## n+6. Fiche-synthèse       tableau « Je dois savoir… | Comment | Exemple express | S’entraîner » + « Pièges à éviter »
*Pied de page : version, date, contenu, script de vérification*
```

Encadrés (libellés exacts, stylés par le futur build) : `**Définition.**` / `**Définitions.**`, `**Propriété.**` (et `(admise)`), `**Méthode — …**`, `**Erreur fréquente.**`, `**Astuce.**`, `**À retenir.**`, `**Prérequis.**`, rédaction modèle en encadré simple.

Style : phrases courtes, « on » dans le cours, « je sais » dans les objectifs, pas de tutoiement ; vocabulaire défini avant usage ; chaque règle suivie d’un exemple chiffré ; typographie française (apostrophe ’, « », espace avant `: ; ? !`). Exercices `**A1.**` en début de ligne, corrigés `**A1.**` ou `**A1. (modèle)**` (le vérificateur s’appuie sur ces formes, lettres A à N).

### Conventions KaTeX propres à la seconde

Celles du collège restent valables (`$…$`, `$$…$$`, `{,}` pour la virgule, `\,` pour les milliers et les unités, € hors formule, `\dfrac`, `\leqslant`, pas de `|` dans une formule de tableau). Les notations de lycée sont désormais **autorisées et enseignées** :

| Objet | Écriture | Rendu attendu |
|---|---|---|
| Ensembles de nombres | `\mathbb{N}`, `\mathbb{Z}`, `\mathbb{D}`, `\mathbb{Q}`, `\mathbb{R}` | ℕ ℤ 𝔻 ℚ ℝ |
| Intervalles | `\left[a\,;b\right[`, `\left]-\infty\,;b\right]` | toujours `\left…\right` (sinon le « − » après `]` est mal espacé), point-virgule |
| Valeur absolue | `\lvert x - a \rvert` | toujours `\lvert…\rvert` (espacement du « − » et tableaux) |
| Ensemble vide, ∈, ⊂, ∩, ∪ | `\varnothing`, `\in`, `\notin`, `\subset`, `\cap`, `\cup` | |
| Équivalence | `\iff` | |
| Vecteurs (prévu) | `\overrightarrow{AB}`, `\vec{u}` ; coordonnées `\vec{u}\begin{pmatrix}x\\y\end{pmatrix}` | à valider (§ 8) |
| Probabilité conditionnelle (prévu) | `P_A(B)`, `\overline{A}` | |

### Exigence de rédaction (corrigés)

Les corrigés sont **rédigés** : phrases complètes, méthode du cours nommée, statut de chaque étape (« on factorise », « un produit est nul si et seulement si… », « donc »), conclusion qui répond à la question avec l’unité. Pas de suite de calculs sans mots, jamais « vérifie avec un nombre » comme seule justification. Raison supplémentaire : à l’épreuve anticipée de mathématiques de première (note de service du 11-9-2026), la **maîtrise de la langue compte pour 2 points sur 20** (orthographe, syntaxe, capacité à formuler un raisonnement, vocabulaire juste). Chaque chapitre contient au moins une rédaction modèle **sans calculatrice**.

### Rubriques liées à la première

- **« Et en première ? »** (chapitres 11, 13, 15, 16, et le pilote 01) : 5 à 8 lignes à la fin de « Liens avec les autres chapitres », sans exercice, avec ce que deviennent les notions en 1re générale (maths intégrées) et technologique.
- **Passerelles** : paragraphe titré « *Passerelle vers la première (★★★, hors programme de seconde).* », placé après le cœur du chapitre ; au plus 2 exercices ★★★ dans la série atypique. Jamais exigé dans la fiche-synthèse ni dans « À retenir ».
- **Notations de première** employées dès la seconde quand elles existent : $P(A \cap B)$, $P_A(B)$, $\overline{A}$, $u(n)$ avant $u_n$, « coefficient directeur », « taux d’évolution ».

Python : blocs ```` ```python ```` courts, testés (le script de vérification du chapitre exécute ou rejoue les programmes du cours).

## 4. Figures

Générées par script : `outils/figures/gen-NN-*.py`, avec la boîte à outils `outils/figures/kit.py` (écrite pour ce projet : palette, flèches, arcs, droite numérique `Axis`, crochets d’intervalles). Règles : SVG autonome (`viewBox`, `width`/`height` 340–720 px, fond blanc, `font-family` Arial, `<title>`), **ni `<style>` ni `id`**, flèches en `<polygon>`, texte échappé, palette `#222` / `#c0392b` (mis en valeur) / `#1f4e79` (accent) / `#666` / `#2e7d32`, remplissages `#fdebd0`, `#dbe8f5`, `#eeeeee`, `#e3f1e4`. Texte alternatif sans crochets `[ ]`. Figure citée par le texte voisin ; à l’échelle quand des valeurs sont écrites. Rendu vérifié en PNG : `outils/svg2png.sh fig.svg sortie.png [échelle]`.

## 5. Outils et pipeline d’un chapitre

| Outil | Rôle |
|---|---|
| `outils/verifier-chapitre.js` | KaTeX, `$` non appariés, figures présentes et référencées, SVG sans `<style>`/`id`, tableaux, apostrophes, corrigés manquants. `NODE_PATH=/home/box/.local/lib/node_modules node outils/verifier-chapitre.js [NN-slug]` → objectif **OK** |
| `outils/relecture/check-NN.py` | Recalcule tous les résultats des exemples et des corrigés (fractions exactes, `decimal`, sympy) et rejoue les programmes Python |
| `outils/apercu.js` | Aperçu HTML hors ligne (formules pré-rendues, SVG inlinés) → `apercu/NN-slug.html` (relecture seulement, ce n’est pas l’appli) |
| `outils/svg2png.sh` | SVG → PNG (Chrome sans interface) |
| `outils/figures/` | `kit.py` + un générateur par chapitre |
| `outils/plans-chapitres.py` | (Re)génère les `PLAN.md` |
| `outils/captures/` | Captures de relecture (page, figures) |

Pipeline : 1. relire `PLAN.md` et le passage du BO ; 2. rédiger selon § 3 ; 3. générer et **regarder** les figures ; 4. exercices + corrigés 100 % ; 5. `check-NN.py` (0 faux) ; 6. `verifier-chapitre.js` (OK) ; 7. `apercu.js` + capture ; 8. relecture pédagogique ; 9. journal (§ 9). Sauvegarde `*.bak` avant toute réécriture d’un chapitre déjà validé ; jamais de `rm` avec joker.

## 6. Future application (`/workspace/compendium-seconde-app`, non créée)

Proposition détaillée : `PLAN-APPLI.md`. Principes : PWA Vite + TypeScript hors ligne, contenu pré-rendu au build, navigation par thèmes, clair/sombre, exercices générés depuis une graine, tests de propriétés (2 000 graines par générateur et niveau) et tests de bout en bout dans Chrome sans interface. Idées techniques **recopiées** depuis l’appli collège, jamais importées.

## 7. Déploiement prévu (à ne faire qu’avec l’accord de Nguhma)

- Dépôt **`Narkotine/compendium-seconde`** sur GitHub, publication **GitHub Pages par la branche `gh-pages`** (script de publication local, comme `publish:gh` du collège : commit normal, jamais de force-push). Pas de GitHub Actions : le jeton `gh` n’a pas le scope `workflow`.
- URL attendue : `https://narkotine.github.io/compendium-seconde/` → Vite `base: '/compendium-seconde/'`.
- **Origine partagée** `narkotine.github.io` avec `compendium-maths` et `compendium-primaire` : toutes les clés `localStorage` / `sessionStorage` préfixées **`compendium-seconde.`**, `cacheId` Workbox **`compendium-seconde`** (caches `compendium-seconde-*`), portée du service worker limitée à `/compendium-seconde/`, aucune suppression de caches qui ne portent pas ce préfixe.
- Aujourd’hui : aucun dépôt distant, aucun push, aucune publication.

## 8. Décisions

**Validé par Nguhma (20/10/2026)** : programme 2026 ; suggestions 1 à 6 de `COMPARAISON-PREMIERE.md` (Rituels orientés épreuve anticipée, fiche Automatismes, chapitres 11/13/15/16 réutilisables en première, passerelles ★★★ hors programme, chapitres 17 et 18 à part, exigence de rédaction). **Refusé pour l’instant** : projet « première ».

**Choix par défaut** (questions restées sans réponse ; modifiables à tout moment) :

| Question | Choix par défaut |
|---|---|
| Notation des intervalles | $\left[a\,;b\right]$ (point-virgule) |
| Coordonnées | $(x\,;y)$ |
| Volume d’exercices écrits | environ 45 par chapitre, 100 % corrigés |
| Python dans l’appli | sans exécution : prédire, compléter, suivre les variables (programmes vérifiés au build) |
| Nom de l’appli | « Maths Seconde » (provisoire) |
| Démonstrations | rédigées en entier dans le cours, repliables dans l’appli |

Encore ouverts : validation du style et de la longueur du pilote, renvois vers le compendium collège, découpage en 18 chapitres, couleur et icône.

## 9. Journal

| Date | Chapitre | Version | Fait |
|---|---|---|---|
| 20/10/2026 | — | — | Étude du compendium collège (contenu, build, appli) et du primaire ; programme 2026 récupéré (BO n° 14) ; plan en 18 chapitres ; squelette (dossiers, `PLAN.md`), outils (`kit.py`, vérificateur, aperçu, `svg2png.sh`) |
| 20/10/2026 | 01 Nombres réels et intervalles | v0.1 (pilote) | Rédigé au standard collège v0.3 : 9 exemples guidés, 2 démonstrations du programme, algorithme de balayage en Python, 8 SVG (`gen-01-nombres-reels.py`), 47 exercices (30 types + 17 atypiques), 100 % corrigés ; `check-01.py` : 59 résultats, 0 faux ; `verifier-chapitre.js` : OK ; aperçu sans erreur KaTeX |
| 20/10/2026 | — | — | Comparaison avec les programmes de 1re hors spécialité (`COMPARAISON-PREMIERE.md`, textes dans `sources/`) |
| 20/10/2026 | 19 Fiche Automatismes, 01, plans | v0.1 ; 01 v0.1.1 | Suggestions 1 à 6 intégrées : fiche Automatismes rédigée (30 automatismes, 51 questions flash, `check-19.py` 0 faux) ; mode Rituels (`PLAN-APPLI.md` § 2 bis) ; `plans-chapitres.py` : passerelles ★★★ (03, 05, 09, 11, 12, 13, 14, 16, 18), « Et en première ? » et lisibilité autonome (11, 13, 15, 16), § 5 diagrammes croisés (15) ; pilote 01 : « Et en première ? » au § 11 ; choix par défaut notés (§ 8) |
