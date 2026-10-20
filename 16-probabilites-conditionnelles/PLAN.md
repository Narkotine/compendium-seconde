# 16. Probabilités et probabilités conditionnelles — plan du chapitre

- Partie du programme : **Statistiques et probabilités** (BO n° 14 du 2 avril 2026).
- Statut : **à rédiger**.
- Format : `cours-et-exercices.md` + `figures/*.svg` (convention du README, § 3).

## Sections prévues

- § 1 Modèle probabiliste : univers, loi, équiprobabilité (hypothèse du modèle) ; P(A) = Card(A)/Card(Ω)
- § 2 Loi des grands nombres (version vulgarisée), simulation
- § 3 Probabilité conditionnelle P_A(B) ; lien avec le tableau croisé
- § 4 Arbres pondérés ; produit le long d’un chemin
- § 5 Distinguer P_A(B) et P_B(A) ; tests diagnostiques (faux positifs, sensibilité, spécificité)

## Démonstrations du programme

- (aucune imposée)

## Exemples d’algorithme du programme (Python)

- Simuler une expérience aléatoire et observer la stabilisation des fréquences

## Pour aller plus loin (★★★, facultatif)

- Problème des partis, Pascal et Fermat (culture)

## Passerelles vers la première (★★★, facultatif, HORS PROGRAMME DE SECONDE)

> Chaque passerelle est signalée dans le cours par « *Passerelle vers la première (★★★, hors programme de seconde).* », placée après le cœur du chapitre, sans exercice obligatoire (au plus 2 exercices ★★★ dans la série atypique).

- Indépendance : comparer P_A(B) et P(B) sur un tableau ou un arbre — 1re
- Arbre de 2 ou 3 épreuves de Bernoulli identiques et indépendantes — 1re (n ⩽ 4)
- Somme des probabilités des chemins qui mènent à un même évènement (Monty Hall, test médical) : signalé « hors attendu de seconde » (le programme de 2de l’exclut explicitement) — 1re techno : formule des probabilités totales

## Lisibilité autonome (chapitre réutilisable en première)

- Chapitre lisible seul : rappel du modèle probabiliste (issues, loi, équiprobabilité) en tête
- Notations exactes des programmes de 1re : P(A ∩ B), P_A(B), P_B(A), Ā ; arbre pondéré
- Contextes communs : tests médicaux (faux positifs, faux négatifs), problème des partis, jeux simples ; modèle et réalité bien distingués

## Rubrique « Et en première ? » (5 à 8 lignes, dans « Liens avec les autres chapitres »)

- Automatismes de 1re (générale et techno) : « Calculer des probabilités conditionnelles […] tableau croisé d’effectifs ou […] arbres pondérés » et « Distinguer P(A ∩ B), P_A(B), P_B(A) » : identiques à ce chapitre
- 1re générale (« Phénomènes aléatoires ») et techno : indépendance (P_B(A) = P(A)), répétition d’épreuves de Bernoulli (arbre, n ⩽ 4), simulation
- 1re techno : formule des probabilités totales, variables aléatoires et espérance, fluctuation d’échantillonnage
- Épreuve anticipée : questions à réponse courte sur les arbres et les tableaux, sans calculatrice
- Référence : `COMPARAISON-PREMIERE.md` et `sources/` (programmes de 1re du BO n° 14 du 2 avril 2026, note de service du 11-9-2026)
