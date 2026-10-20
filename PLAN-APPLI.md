# Proposition d’architecture — appli « Maths Seconde » (non créée)

> Document de planification (20 octobre 2026). Rien n’est créé dans `/workspace/compendium-seconde-app` tant que Nguhma n’a pas validé ce plan et le chapitre pilote.

## 1. Socle (idées recopiées de l’appli collège v0.10, aucun import)

| Brique | Collège (référence) | Seconde |
|---|---|---|
| Contenu | `scripts/build-content.mjs` : Markdown → HTML pré-rendu (KaTeX, encadrés typés, ids stables, corrigés repliés, renvois cliquables, SVG minifiés) | même pipeline recopié ; source `../compendium-seconde` (`COMPENDIUM_SRC`) ; ajout du rendu des blocs `python` (coloration légère, sans exécution) et des encadrés « Démonstration » repliables |
| Métadonnées | `content-meta.json` (groupes, titres courts, générateurs activés) | 6 groupes : Nombres et calculs · Algèbre · Géométrie · Fonctions · Données et hasard · Outils transversaux |
| Coque | Vite + TS, routes par hash, Retour Android, sommaire, recherche plein texte, clair/sombre, 4 tailles de texte | identique ; nom « Maths Seconde » |
| PWA | vite-plugin-pwa, tout pré-caché, « Mise à jour disponible » | `base: '/compendium-seconde/'`, `cacheId: 'compendium-seconde'`, clés `compendium-seconde.settings`, `.last`, `.progress`, `.practice`, `sessionStorage` `compendium-seconde.serie:*` |
| Moteur d’exercices | `engine/` : graine `mulberry32` (base 36 dans l’adresse), rationnels exacts `q.ts`, AST `expr.ts`, validateurs `answers.ts`/`check.ts`, séries, statistiques locales | recopié puis étendu (§ 3) |
| Saisie | clavier unifié ancré en bas (un seul dock), calculatrice avec historique, « Mettre dans la réponse », historique effacé entre exercices, note d’arrondi à 4 décimales | identique ; touches lycée en plus : `∞`, `[ ]`, `∪`, `∅`, `|x|`, `√`, `π`, vecteur `( ; )` |
| Tests | propriétés 2 000 graines × niveau, validateurs, e2e Chrome headless (navigation, entraînement, calculatrice), contrôles `check-dist` | identique dès le premier chapitre équipé |

Principes pédagogiques conservés : on génère **la réponse d’abord** puis l’énoncé ; nombres « propres » (pas de piège de précision, pas de flottant dans une solution) ; message ciblé quand l’erreur est reconnue (« tu as pris 2 pour centre au lieu de −2 ») ; indice puis corrigé **rédigé avec la méthode du cours** (jamais seulement « vérifie avec un nombre ») ; une saisie illisible ne coûte pas d’essai.

## 2. Nouvelles saisies nécessaires en seconde

| Saisie | Usage | Remarques |
|---|---|---|
| **Intervalle** (bornes + crochets à basculer, ou glisser sur la droite) | 01, 05, 09, 11, 12 | accepte `]-inf;3]`, `x<3`, réunion `∪`, `∅`, `{4}` ; erreurs ciblées : crochet en ∞, bornes inversées, crochet inversé |
| **Droite numérique** étendue | 01 | reprise de `numberline.ts` + crochets |
| **Ensemble de solutions** `S = {…}` | 05, 12 | ordre libre, valeurs exactes (fractions, racines) |
| **Coordonnées / vecteur** `(x ; y)` | 07, 08 | colonne ou ligne selon la décision de notation |
| **Repère à toucher** (placer un point, tracer un représentant, une droite par deux points) | 06, 07, 08, 09 | quadrillage aimanté, cibles ≥ 44 px |
| **Tableau de signes / de variations** (cases +/−/0, flèches) | 10, 11, 12 | widget à cases, vérifié case par case (seule la case fausse en rouge) |
| **Tableau croisé à compléter** | 15, 16 | totaux ; fréquences en fraction ou en % |
| **Arbre pondéré à compléter** | 16 | probabilités en fraction ou décimal |
| **Code Python** : prédire l’affichage, compléter un trou, suivre les variables d’une boucle | 18 + algorithmes des autres chapitres | pas d’exécution dans l’appli au départ (Pyodide ≈ 10 Mo hors ligne) ; programmes vérifiés au build |
| **Expression** (forme développée/factorisée) | 04 | égalité testée en arithmétique exacte sur plusieurs valeurs + contrôle de la forme demandée |

## 2 bis. Mode « Rituels » : entraînement à l’épreuve anticipée (validé le 20/10/2026)

Objectif : entretenir les automatismes de seconde **et** préparer la partie 1 de l’épreuve anticipée de mathématiques de première (note de service du 11-9-2026, session 2028 : 6 points sur 20, « questions à réponses courtes », calculatrice interdite). Contenu de référence : `19-fiche-automatismes/` (et `COMPARAISON-PREMIERE.md`).

| Règle | Détail |
|---|---|
| Format | série de **10 questions flash** (réglable 5 / 10 / 20), **réponse courte saisie** : nombre, fraction, expression, intervalle, ensemble de solutions. **Pas de QCM** (comme l’épreuve à partir de 2028) |
| Calculatrice | **masquée** dans tout le mode (ni bouton, ni clavier « calculatrice », ni historique) ; le clavier de saisie reste, sans touche de calcul |
| Chronomètre | affiché, par question (cible indicative 30 à 60 s selon la question) et pour la série ; **pas d’échec au temps** : le temps est noté, la réponse reste acceptée ; option « sans chronomètre » dans les réglages |
| Rubriques | les 7 rubriques officielles de la partie « Automatismes » de 2de : Calcul numérique et algébrique · Proportions et pourcentages · Évolutions et variations · Fonctions et représentations · Géométrie · Statistiques · Probabilités. Série « mélangée » par défaut (le programme demande de ne pas traiter les blocs l’un après l’autre) ou une rubrique choisie |
| Étiquette de niveau | chaque générateur de question porte un champ `niveau` valant `2de` ou `1re` : **[2de]** = libellé de la liste de seconde ; **[1re]** = automatisme de la liste de première déjà préparé en seconde (taux réciproque, évolutions successives, signe d’une forme factorisée de degré 2, coefficient directeur par deux points, $P_A(B)$ et $P_B(A)$…). Filtre « seconde seulement / avec la première » ; un futur ajout d’automatismes de première ne change pas l’architecture |
| Correction | immédiate après chaque réponse : réponse attendue + **réflexe rédigé** en une ou deux phrases (style des corrigés de la fiche), message d’erreur ciblé si l’erreur est reconnue (« $+10\,\%$ puis $-10\,\%$ ne s’annulent pas », « tu as oublié de changer le sens de l’inégalité ») |
| Bilan | score, temps total, réussite par rubrique ; les questions ratées reviennent dans la série suivante (file de révision locale) |
| Stockage | `compendium-seconde.rituels` (historique de séries, réussite par rubrique et niveau) ; rien hors de l’appareil |
| Nombres | générés « propres » et calculables de tête (petits entiers, fractions simples, pourcentages ronds) ; aucun résultat qui exigerait la calculatrice |
| Tests | propriétés sur 2 000 graines par générateur : réponse calculable sans calculatrice (bornes sur les entiers et dénominateurs), unicité de la réponse attendue, analyse de saisie ; e2e : la calculatrice est absente dans le mode, le chronomètre démarre et s’arrête, l’étiquette [1re] filtre bien |

Générateurs (identifiants provisoires) : `rit-calcul` (fractions, puissances, écritures, ordres de grandeur, conversions, développer/factoriser, équations simples, isoler), `rit-proportions`, `rit-evolutions` (dont [1re] : valeur finale/initiale, taux, successives, réciproque), `rit-fonctions` (image/antécédent sur courbe, équation de courbe, affine ; [1re] : coefficient directeur, droite, signe d’un produit, produit nul), `rit-geometrie`, `rit-stats`, `rit-probas` (dont [1re] : tableau croisé, arbre, $P(A \cap B)$ / $P_A(B)$ / $P_B(A)$).

## 3. Extensions du moteur

- `surd.ts` : nombres de la forme $a + b\sqrt{n}$ exacts (chapitres 03, 07 normes, 12).
- `interval.ts` : intervalles, réunions finies, ∩ / ∪, appartenance, analyse d’une saisie et diagnostic des erreurs.
- `vec.ts` : vecteurs, déterminant, colinéarité ; `line.ts` : équations cartésienne/réduite, pente, intersection (rationnels).
- `sign.ts` : tableaux de signes de produits/quotients de facteurs affines ; `variation.ts` : tableaux de variations à partir de fonctions par morceaux générées.
- `stats.ts` (données) : séries à moyenne, médiane, écart type « propres » ; `prob.ts` : tableaux croisés et arbres à effectifs entiers.

## 4. Générateurs envisagés par chapitre (identifiants provisoires)

| Ch. | Types d’exercices | Saisies |
|---|---|---|
| 01 | `classer` (plus petit ensemble), `decimal` (décimal ou non + justification choisie), `encadrer` (par carrés), `arrondir` (arrondi, troncature, chiffres significatifs), `ecrire-intervalle` (inégalité → intervalle), `lire-intervalle` (droite → intervalle), `appartient`, `inter-union`, `distance` (valeur absolue), `centre-rayon` (↔ $\lvert x - a\rvert \leqslant r$), `erreur` | cartes, pavé, intervalle, droite |
| 02 | `multiple`, `diviseurs`, `parite` (raisonnement à étiquettes), `irreductible`, `partage`, `erreur` | pavé, étiquettes à glisser |
| 03 | `puissances`, `racine-simplifier` ($a\sqrt{b}$), `racine-produit`, `denominateur` (★★), `fractions`, `scientifique`, `erreur` | pavé exact (√) |
| 04 | `developper`, `identites`, `factoriser`, `forme-adaptee`, `isoler` (formules de physique), `fraction-algebrique`, `erreur` | expression |
| 05 | `comparer`, `regles-inegalites`, `equation`, `produit-nul`, `carre`, `quotient` (valeur interdite), `inequation` (→ intervalle), `modeliser`, `erreur` | ensemble de solutions, intervalle |
| 06 | `representant` (quadrillage), `chasles`, `colineaires`, `milieu`, `decomposer` ($x\vec{i} + y\vec{j}$), `erreur` | repère à toucher, expression vectorielle |
| 07 | `coord-AB`, `somme-ku`, `norme-distance`, `milieu`, `determinant`, `alignement`, `parallelisme`, `erreur` | coordonnées, pavé exact |
| 08 | `vecteur-directeur`, `equation-deux-points`, `pente-graphique`, `tracer`, `position`, `intersection`, `erreur` | équation, repère |
| 09 | `image-antecedent` (formule, courbe), `definition` (ensemble), `point-courbe`, `resolution-graphique`, `modeliser`, `erreur` | intervalle, pavé |
| 10 | `tableau-variations` (courbe → tableau), `extremum`, `comparer-images`, `optimisation`, `erreur` | tableau de variations |
| 11 | `m-et-p`, `sens-variation`, `signe-affine`, `tableau-signes`, `inequation-produit`, `inequation-quotient`, `erreur` | tableau de signes, intervalle |
| 12 | `carre`, `inverse`, `valeur-absolue`, `racine-cube`, `comparer`, `positions`, `erreur` | intervalle, ensemble |
| 13 | `proportion-de-proportion`, `cm-taux`, `successives`, `reciproque`, `valeur-initiale`, `proportion-ou-evolution`, `erreur` | pavé (%), calculatrice |
| 14 | `moyenne-ponderee`, `linearite`, `ecart-type`, `quartiles`, `classes` (centres, classe médiane), `boite` (lecture), `comparer-series`, `erreur` | pavé, calculatrice |
| 15 | `completer-tableau`, `marginale`, `conditionnelle`, `traduire` (« parmi… »), `erreur` | tableau croisé |
| 16 | `equiprobabilite`, `conditionnelle-tableau`, `arbre`, `chemin`, `inversion` ($P_A(B)$ / $P_B(A)$, tests), `lgn` (simulation lue), `erreur` | arbre, tableau, pavé |
| 17 | `appartenance-inclusion`, `operations-ensembles`, `negation`, `reciproque-contraposee`, `contre-exemple`, `quantificateurs` | cartes, QCM argumenté |
| 18 | `predire`, `completer`, `types`, `trace-boucle`, `corriger` | pavé, tableau de suivi, cartes |
| 19 | mode Rituels (§ 2 bis) : `rit-calcul`, `rit-proportions`, `rit-evolutions`, `rit-fonctions`, `rit-geometrie`, `rit-stats`, `rit-probas` | réponse courte (pavé, expression, intervalle), sans calculatrice |

Calculatrice : toujours masquée en mode Rituels (§ 2 bis). Ailleurs, même politique qu’au collège (désactivée quand l’exercice porte sur le calcul lui-même : 01 `encadrer`, 03, 04, 05 `equation`… ; proposée ailleurs).

## 5. Étapes proposées

1. Validation du pilote 01 (style, longueur, figures) et des réponses aux questions ci-dessous.
2. Rédaction des chapitres par vagues (Nombres/Algèbre 02–05 ; Fonctions 09–12 ; Géométrie 06–08 ; Données et hasard 13–16 ; transversaux 17–18), revue par lot.
3. Appli v0.1 : coque + contenu (lecture seule), tests de navigation, clés et caches préfixés.
4. Entraînement : chapitre 01 en pilote (saisie intervalle + droite), puis chapitre par chapitre avec tests de propriétés et e2e.
5. Publication `gh-pages` seulement sur accord explicite.

## 6. Décisions (20 octobre 2026)

Validé par Nguhma : programme 2026 ; suggestions 1 à 6 de `COMPARAISON-PREMIERE.md` (Rituels orientés épreuve anticipée, fiche Automatismes, chapitres 11, 13, 15, 16 réutilisables en première avec « Et en première ? », passerelles ★★★ hors programme, chapitres 17 et 18 à part, exigence de rédaction). Refusé pour l’instant : projet « première ».

Choix par défaut (questions restées ouvertes, modifiables) : intervalles $\left[a\,;b\right]$ ; coordonnées $(x\,;y)$ ; environ 45 exercices écrits par chapitre ; **Python sans exécution** dans l’appli (prédire, compléter, suivre les variables ; programmes vérifiés au build) ; nom provisoire « Maths Seconde » ; démonstrations rédigées en entier dans le cours, **repliables** dans l’appli. Toujours ouverts : renvois vers le compendium collège, découpage en 18 chapitres, longueur du pilote, couleur et icône.

Historique des questions posées le 20/10/2026 :


1. Programme : on suit bien le **programme 2026** (BO n° 14), et non celui de 2019 ?
2. Chapitres 17 (logique) et 18 (Python) en chapitres de référence autonomes, en plus des notions vues en situation ? Ou seulement intégrés aux autres chapitres ?
3. Automatismes : mode « Rituels » dans l’appli (questions flash mêlant collège et seconde), fiche dans le compendium, ou les deux ?
4. Compléments hors programme et « approfondissements possibles » : garder en ★★★ « Pour aller plus loin » comme au collège, ou les supprimer ?
5. Démonstrations du programme : rédigées en entier dans le cours (comme dans le pilote), ou repliables dans l’appli ?
6. Volume d’exercices écrits : 40–50 par chapitre avec corrigés complets (comme au collège et dans le pilote), ou moins (≈ 30) puisque l’appli en génère ?
7. Python : extraits de code dans le cours (oui dans le pilote) ; dans l’appli, exercices sans exécution (prédire, compléter), ou exécution réelle (Pyodide, ≈ 10 Mo hors ligne) ?
8. Notations : intervalles avec point-virgule $[a\,;b]$ (choix du pilote) ou virgule $[a, b]$ (texte du BO) ; coordonnées de vecteurs en colonne ou $(x\,;y)$ ?
9. Prérequis : renvois génériques au collège (« Collège : racine carrée… », choix du pilote) ou renvois précis vers le compendium collège (liens entre projets) ?
10. Ordre et découpage en 18 chapitres : à garder ? (par exemple fusionner 09 et 10, ou 14 et 15)
11. Longueur du pilote : 681 lignes (le collège visait 450–700). Trop long, correct ?
12. Nom de l’appli (« Maths Seconde » ?), couleur, icône.
