#!/usr/bin/env python3
"""Crée (ou met à jour) le PLAN.md de chaque chapitre à partir de la table ci-dessous. Ne touche jamais à cours-et-exercices.md.
Usage : python3 outils/plans-chapitres.py"""
import os
ROOT = os.path.join(os.path.dirname(__file__), '..')
P = 'Nombres et calculs, algèbre'; G = 'Géométrie'; F = 'Fonctions'; S = 'Statistiques et probabilités'; T = 'Parties transversales'
CH = [
 ('01-nombres-reels-intervalles', 'Nombres réels et intervalles', P,
  ['Ensembles N, Z, D, Q, R ; appartenance, inclusion', 'Rationnels non décimaux (1/3) ; irrationnels (√2, π)', 'Droite numérique ; encadrement décimal à 10⁻ⁿ près ; arrondi, chiffres significatifs', 'Intervalles ; intersection, réunion', 'Valeur absolue = distance ; |x − a| ≤ r'],
  ['1/3 n’est pas décimal', '√2 est irrationnel'], ['Balayage : encadrement de √2 à 10⁻ⁿ près'],
  ['Développement décimal illimité, périodicité (★★★)', 'Critère « dénominateur 2ᵃ5ᵇ » (★★★)', '|x − a| ≥ r (★★★)'],
  'RÉDIGÉ (pilote v0.1) — voir cours-et-exercices.md'),
 ('02-arithmetique', 'Arithmétique : multiples, diviseurs, parité', P,
  ['§ 1 Notations N et Z ; multiple et diviseur (a = kb)', '§ 2 Pairs et impairs (2k, 2k + 1) ; parité d’une somme, d’un produit, d’un carré', '§ 3 Nombres premiers, décomposition (rappel collège en problème)', '§ 4 Fractions irréductibles', '§ 5 Problèmes (partages, engrenages, calendriers)'],
  ['La somme de deux multiples de a est un multiple de a', 'Le carré d’un nombre impair est impair'],
  ['Tester si a est multiple de b', 'Plus grand multiple de a inférieur ou égal à b'], ['PGCD et algorithme d’Euclide (★★★, hors programme)'], 'à rédiger'),
 ('03-puissances-racines', 'Puissances, racines carrées, calcul numérique', P,
  ['§ 1 Puissances entières relatives : règles (rappel + justification)', '§ 2 Racines carrées : définition, √(a²) = |a|, √(ab) = √a √b, √a/√b', '§ 3 Simplifier, rendre un dénominateur rationnel (★★)', '§ 4 Écritures fractionnaires et calculs mixtes', '§ 5 Notation scientifique, ordres de grandeur (automatismes)'],
  ['Pour a, b ≥ 0 : √(ab) = √a √b'], ['Première puissance d’un nombre dépassant un seuil'], ['√(a + b) ≤ √a + √b (★★★)'], 'à rédiger'),
 ('04-calcul-litteral', 'Calcul littéral et expressions algébriques', P,
  ['§ 1 Développer, réduire (rappel par problèmes)', '§ 2 Identités remarquables (deux sens)', '§ 3 Factoriser (facteur commun, identités)', '§ 4 Choisir la forme adaptée (développée, factorisée)', '§ 5 Expressions fractionnaires simples ; valeurs interdites', '§ 6 Isoler une variable (U = RI, d = vt, V = πr²h, ax + by = c)'],
  [], [], ['(a + b + c)² ; (a + b)³ (★★★)', 'Moyennes arithmétique et géométrique (★★★)'], 'à rédiger'),
 ('05-inegalites-equations-inequations', 'Inégalités, équations et inéquations', P,
  ['§ 1 Comparer par différence, par quotient (ratio)', '§ 2 Règles sur les inégalités (somme ; produit par un positif, un négatif)', '§ 3 Équations du premier degré ; ensemble des solutions', '§ 4 Équation produit nul ; x² = a', '§ 5 Équation quotient A(x)/B(x) = k et valeurs interdites', '§ 6 Inéquations du premier degré (solutions en intervalles)', '§ 7 Modéliser un problème par une équation ou une inéquation'],
  [], [], ['Inégalité entre moyennes (★★★)'], 'à rédiger'),
 ('06-vecteurs', 'Vecteurs', G,
  ['§ 1 Translation et vecteur ; égalité, représentants, vecteur nul, opposé', '§ 2 Somme ; relation de Chasles ; règle du parallélogramme', '§ 3 Produit par un réel ; colinéarité', '§ 4 Combinaison de deux vecteurs non colinéaires (u = xi + yj)', '§ 5 Caractérisation vectorielle du milieu', '§ 6 Problèmes (physique : vecteur déplacement, vecteur position)'],
  [], [], ['Barycentre de deux ou trois points (★★★)', 'Isobarycentre et médianes (★★★)'], 'à rédiger'),
 ('07-vecteurs-coordonnees', 'Repérage et coordonnées de vecteurs', G,
  ['§ 1 Repère et base orthonormés ; coordonnées d’un point, d’un vecteur', '§ 2 Coordonnées de AB, d’une somme, de ku', '§ 3 Norme, distance entre deux points', '§ 4 Milieu d’un segment', '§ 5 Déterminant ; critère de colinéarité', '§ 6 Alignement, parallélisme ; problèmes de configuration'],
  ['Colinéarité de deux vecteurs non nuls : déterminant nul ⇔ coordonnées proportionnelles'], ['Alignement de trois points'],
  ['Hauteurs concourantes ; médiatrices et cercle circonscrit (★★★)', 'Aire du triangle ½ab sin C (★★★)'], 'à rédiger'),
 ('08-droites-du-plan', 'Droites du plan', G,
  ['§ 1 Vecteur directeur', '§ 2 Équation cartésienne ax + by + c = 0', '§ 3 Équation réduite y = mx + p ; x = k ; pente', '§ 4 Tracer une droite ; lire pente et vecteur directeur', '§ 5 Droites parallèles ou sécantes ; point d’intersection (systèmes 2 × 2)', '§ 6 Trois points alignés'],
  ['Forme générale d’une équation de droite (avec le déterminant)'], ['Équation de la droite passant par deux points', 'Alignement de trois points'],
  ['Parties du plan définies par des inégalités (★★★)', 'Points équidistants d’un point et de l’axe des abscisses (★★★)'], 'à rédiger'),
 ('09-fonctions-generalites', 'Fonctions : définitions et représentations', F,
  ['§ 1 Fonction, image, antécédent ; notation f(x), u(n)', '§ 2 Ensemble de définition (intervalle, réunion d’intervalles)', '§ 3 Courbe y = f(x) : appartenance, coordonnées', '§ 4 Résoudre graphiquement f(x) = k, f(x) < k, f(x) = g(x), f(x) < g(x)', '§ 5 Modéliser une situation (temps t, géométrie, économie)'],
  [], [], [], 'à rédiger'),
 ('10-variations-extremums', 'Variations et extremums', F,
  ['§ 1 Fonction croissante, décroissante, monotone sur un intervalle', '§ 2 Tableau de variations ↔ courbe', '§ 3 Maximum, minimum sur un intervalle', '§ 4 Comparer f(a) et f(b) grâce aux variations', '§ 5 Problèmes d’optimisation (lecture graphique, outil numérique)'],
  [], ['Approcher un extremum par balayage ou dichotomie', 'Longueur approchée d’une portion de courbe'], [], 'à rédiger'),
 ('11-fonctions-affines-signes', 'Fonctions affines et tableaux de signes', F,
  ['§ 1 f(x) = mx + p : taux d’accroissement m, ordonnée à l’origine p', '§ 2 Variations selon le signe de m (démonstration)', '§ 3 Signe de mx + p ; lien avec la droite', '§ 4 Tableau de signes d’un produit, d’un quotient', '§ 5 Résoudre f(x) > 0, f(x) ≤ 0 pour un produit ou un quotient'],
  ['Variations des fonctions affines'], [], [], 'à rédiger'),
 ('12-fonctions-de-reference', 'Fonctions de référence', F,
  ['§ 1 Fonction carré : courbe, variations, signe, x² = k, x² < k', '§ 2 Fonction inverse : courbe, variations, 1/x = k', '§ 3 Fonction valeur absolue : courbe, signe, variations', '§ 4 Fonctions racine carrée et cube : courbes, f(x) = k', '§ 5 Positions relatives de y = x et y = x² (x ≥ 0)', '§ 6 Comparer f(a) et f(b)'],
  ['Variations des fonctions carré et inverse', 'Position relative de y = x et y = x² pour x ≥ 0'], [], ['Courbes de racine carrée et de carré sur R+ (★★★)'], 'à rédiger'),
 ('13-information-chiffree', 'Proportions et évolutions', S,
  ['§ 1 Proportion ; partie, tout ; pourcentage de pourcentage', '§ 2 Variation absolue, coefficient multiplicateur, taux d’évolution', '§ 3 Évolutions successives (produit des coefficients)', '§ 4 Évolution réciproque (inverse du coefficient)', '§ 5 Proportion ou évolution ? lire les médias'],
  [], [], [], 'à rédiger'),
 ('14-statistiques-descriptives', 'Statistiques à une variable', S,
  ['§ 1 Moyenne (pondérée, linéarité) ; médiane, quartiles (rappels)', '§ 2 Écart type ; écart interquartile ; boîte à moustaches', '§ 3 Effet de l’ajout ou de la suppression d’une valeur', '§ 4 Données en classes : histogramme, polygone des fréquences cumulées, moyenne par les centres, classe médiane et estimation', '§ 5 Comparer deux séries (moyenne/écart type, médiane/écart interquartile)'],
  [], ['Fonction Python renvoyant moyenne, écart type (lecture)'], [], 'à rédiger'),
 ('15-tableaux-croises', 'Croisement de deux variables qualitatives', S,
  ['§ 1 Variables qualitatives nominales, ordinales', '§ 2 Tableau croisé d’effectifs ; totaux', '§ 3 Fréquences marginales et conditionnelles (« parmi… »)', '§ 4 Compléter un tableau ; lire les formulations des médias', '§ 5 Représenter un croisement : diagrammes en barres groupées, empilées à 100 % (lecture et commentaire ; utile aussi en 1re générale)'],
  [], ['Filtrer des individus (ET, OU, NON)', 'Dresser un tableau croisé à partir d’un fichier'], [], 'à rédiger'),
 ('16-probabilites-conditionnelles', 'Probabilités et probabilités conditionnelles', S,
  ['§ 1 Modèle probabiliste : univers, loi, équiprobabilité (hypothèse du modèle) ; P(A) = Card(A)/Card(Ω)', '§ 2 Loi des grands nombres (version vulgarisée), simulation', '§ 3 Probabilité conditionnelle P_A(B) ; lien avec le tableau croisé', '§ 4 Arbres pondérés ; produit le long d’un chemin', '§ 5 Distinguer P_A(B) et P_B(A) ; tests diagnostiques (faux positifs, sensibilité, spécificité)'],
  [], ['Simuler une expérience aléatoire et observer la stabilisation des fréquences'], ['Problème des partis, Pascal et Fermat (culture)'], 'à rédiger'),
 ('17-ensembles-et-logique', 'Vocabulaire ensembliste et logique', T,
  ['§ 1 Ensembles : élément, ∈, sous-ensemble, ⊂, ∅, {…}, Card', '§ 2 Intersection, réunion, complémentaire ; couple, produit cartésien', '§ 3 Propositions ; « et », « ou » ; négation', '§ 4 Implication, réciproque, contraposée, équivalence ; quantificateurs (en mots)', '§ 5 Raisonnements : contre-exemple, disjonction des cas, par l’absurde'],
  [], [], [], 'à rédiger (chapitre de référence ; les notions sont introduites en situation dans les autres chapitres)'),
 ('18-algorithmique-python', 'Algorithmique et programmation en Python', T,
  ['§ 1 Variables et types (entier, flottant, booléen, chaîne) ; affectation', '§ 2 Instruction conditionnelle', '§ 3 Boucle bornée for, boucle non bornée while', '§ 4 Fonctions à un ou plusieurs arguments', '§ 5 Hasard : fonction renvoyant un nombre aléatoire ; simuler, répéter', '§ 6 Lire, compléter, corriger un programme ; nombres de la machine'],
  [], ['Reprend les algorithmes des autres chapitres (renvois)'], [], 'à rédiger (chapitre de référence)'),
 ('19-fiche-automatismes', 'Fiche Automatismes', 'Automatismes (partie transversale)',
  ['§ 0 Mode d’emploi : sans calculatrice, questions flash, étiquettes [2de] / [1re]', '§ 1 Tableau des automatismes de seconde par rubrique officielle (Calcul numérique et algébrique ; Proportions et pourcentages ; Évolutions et variations ; Fonctions et représentations ; Géométrie ; Statistiques ; Probabilités), avec réflexe, exemple express, chapitre et colonne « encore évalué en 1re »', '§ 2 Automatismes ajoutés en première (1re générale et technologique) et chapitre de seconde qui les prépare', '§ 3 Questions flash par rubrique (séries A à G), corrigés rédigés', '§ 4 Pièges à éviter'],
  [], [], [], 'RÉDIGÉE (v0.1) — voir cours-et-exercices.md ; sert de base au mode « Rituels » de l’appli (PLAN-APPLI.md, § 2 bis)'),
]
# Compléments demandés le 20/10/2026 (validation des suggestions 1 à 6 de COMPARAISON-PREMIERE.md).
# 'auto' : lisibilité autonome (réutilisable en première) ; 'prem' : rubrique « Et en première ? » ;
# 'pass' : compléments passerelle ★★★, HORS PROGRAMME DE SECONDE, toujours signalés comme tels dans le cours.
EXTRA = {
 '03-puissances-racines': {'pass': [
   'Seuil sur les puissances (algorithme du programme) relu comme une suite : u(n) = u(0) × qⁿ, premier n tel que u(n) dépasse un seuil (boucle while) — 1re : suites géométriques',
   'Écrire √a = a^(1/2) et constater que les règles des puissances restent vraies (a^(1/2) × a^(1/2) = a) — 1re générale : exposant 1/n, fonctions exponentielles']},
 '05-inegalites-equations-inequations': {'pass': [
   'Résoudre ax² + bx = 0 par x(ax + b) = 0 : c’est ainsi qu’en 1re on trouve l’axe de symétrie d’une parabole en résolvant f(x) = c — 1re : modélisation quadratique',
   'Seuil linéaire : plus petit entier n tel que a + n r ⩾ S (inéquation puis entier suivant) — 1re : suites arithmétiques, problème de seuil']},
 '09-fonctions-generalites': {'pass': [
   'Un phénomène discret noté u(n) (motif en T, épargne de r € par mois) : tableau (n ; u(n)), nuage de points, passage de u(n) à u(n + 1) en ajoutant r — 1re : suites arithmétiques ; notation u(n) avant uₙ, comme le demandent les programmes de 1re']},
 '11-fonctions-affines-signes': {
   'auto': ['Rappels intégrés en tête de section (droite y = mx + p, pente) pour une lecture sans le chapitre 08', 'Vocabulaire de 1re employé dès la seconde : « coefficient directeur », « taux d’accroissement », « signe d’une expression factorisée du second degré »', 'Contextes communs aux programmes de 1re : Celsius–Fahrenheit, offre et demande (point d’équilibre), barème affine'],
   'prem': ['1re générale (maths intégrées à l’enseignement scientifique) : les fonctions affines sont « remobilisées » (« travail succinct ») et mises en parallèle avec les suites arithmétiques', 'Automatismes de 1re (générale et techno) : signe d’une expression du premier degré, d’une expression factorisée du second degré ; tracer une droite, coefficient directeur par deux points', 'Polynômes de degré 2 sous forme a(x − x₁)(x − x₂) : racines et signe par le tableau de signes de ce chapitre (pas de discriminant)', '1re techno : taux de variation et monotonie, puis nombre dérivé (la tangente est une droite y = mx + p)', 'Épreuve anticipée (sans calculatrice) : ces signes et ces droites sont des questions à réponse courte'],
   'pass': ['Parabole y = a(x − x₁)(x − x₂) : racines par produit nul, signe par tableau de signes, allure (sommet au milieu des racines) — 1re : modélisation quadratique', 'Fonction affine par morceaux : barème simplifié, taux marginal et taux moyen — 1re générale : variation linéaire']},
 '12-fonctions-de-reference': {'pass': [
   'Paraboles y = ax² et y = ax² + c obtenues à partir de y = x² (allure, sommet, signe de a) — 1re : associer une parabole à une expression de degré 2',
   'Axe de symétrie de x ↦ ax² + bx + c en résolvant f(x) = c (équation produit nul, chapitre 05) — 1re : « Aucune formule n’est attendue »']},
 '13-information-chiffree': {
   'auto': ['Chapitre lisible seul : rappel proportion / pourcentage / coefficient multiplicateur en tête', 'Notations et formulations des programmes de 1re : « taux d’évolution », « valeur finale, valeur initiale », « taux réciproque », « taux équivalent à plusieurs évolutions »', 'Méthodes rédigées sans calculatrice (calculs exacts, ordres de grandeur) comme à l’épreuve anticipée'],
   'prem': ['Les quatre automatismes « Évolutions et variations » de 1re (générale et techno) sont exactement les capacités de ce chapitre : appliquer un taux, calculer un taux, évolutions successives, évolution réciproque', '1re générale : suites géométriques (évolution relative constante, ×CM à chaque étape) et fonctions exponentielles x ↦ aˣ ; taux d’évolution moyen', '1re techno : suites géométriques comme « modèles discrets d’évolutions relatives constantes »', 'Épreuve anticipée : questions à réponse courte sur les pourcentages, sans calculatrice'],
   'pass': ['Appliquer n fois le même taux : V(n) = V(0) × CMⁿ ; seuil par essais ou par boucle — 1re : suites géométriques', 'Taux d’évolution moyen sur n périodes : CM^(1/n) à la calculatrice — 1re générale', 'Intérêts simples ou composés : + r € par an ou × CM par an (linéaire contre exponentiel) — 1re générale : variation linéaire et exponentielle']},
 '14-statistiques-descriptives': {'pass': [
   'Série à deux variables quantitatives : nuage de points, point moyen (x̄ ; ȳ), droite passant par le point moyen (lien chapitre 08) — 1re générale et techno : ajustement affine',
   'Interpoler, extrapoler avec une droite donnée et discuter la pertinence du modèle — 1re']},
 '15-tableaux-croises': {
   'auto': ['Chapitre lisible seul : rappel effectif, fréquence, proportion en tête', 'Notations de 1re introduites ici en statistique et reprises au chapitre 16 : ensemble A, complémentaire Ā, Card(A), « parmi… » ↔ fréquence conditionnelle', 'Données réelles (Insee, sécurité routière, santé) comme le préconisent les programmes de 1re'],
   'prem': ['1re générale : « Analyse statistique de deux caractères qualitatifs. Tableau croisé d’effectifs » ouvre la partie « Analyse de l’information chiffrée » : ce chapitre en est le socle, à compléter par les diagrammes croisés (§ 5)', 'Automatismes de 1re : probabilités conditionnelles lues dans un tableau croisé d’effectifs', '1re techno (Python) : « Réaliser un tableau croisé de données sur deux critères à partir de données brutes » (algorithme déjà au programme de seconde)', 'En 1re vient ensuite le croisement de deux caractères quantitatifs (nuage de points, ajustement affine)']},
 '16-probabilites-conditionnelles': {
   'auto': ['Chapitre lisible seul : rappel du modèle probabiliste (issues, loi, équiprobabilité) en tête', 'Notations exactes des programmes de 1re : P(A ∩ B), P_A(B), P_B(A), Ā ; arbre pondéré', 'Contextes communs : tests médicaux (faux positifs, faux négatifs), problème des partis, jeux simples ; modèle et réalité bien distingués'],
   'prem': ['Automatismes de 1re (générale et techno) : « Calculer des probabilités conditionnelles […] tableau croisé d’effectifs ou […] arbres pondérés » et « Distinguer P(A ∩ B), P_A(B), P_B(A) » : identiques à ce chapitre', '1re générale (« Phénomènes aléatoires ») et techno : indépendance (P_B(A) = P(A)), répétition d’épreuves de Bernoulli (arbre, n ⩽ 4), simulation', '1re techno : formule des probabilités totales, variables aléatoires et espérance, fluctuation d’échantillonnage', 'Épreuve anticipée : questions à réponse courte sur les arbres et les tableaux, sans calculatrice'],
   'pass': ['Indépendance : comparer P_A(B) et P(B) sur un tableau ou un arbre — 1re', 'Arbre de 2 ou 3 épreuves de Bernoulli identiques et indépendantes — 1re (n ⩽ 4)', 'Somme des probabilités des chemins qui mènent à un même évènement (Monty Hall, test médical) : signalé « hors attendu de seconde » (le programme de 2de l’exclut explicitement) — 1re techno : formule des probabilités totales']},
 '18-algorithmique-python': {'pass': [
   'Listes en lecture : [ ], len, parcours for x in L, somme d’une liste (2de : « Aucune connaissance sur les listes n’est exigée ») — 1re techno : listes',
   'Compteur et accumulateur nommés comme tels ; simuler une épreuve de Bernoulli avec random() < p — 1re techno',
   'Calculer les termes d’une suite définie par récurrence avec une boucle (u ← u × q, u ← u + r) — 1re : suites']},
}

for (slug, titre, partie, sections, demos, algos, plus, statut) in CH:
    d = os.path.join(ROOT, slug); os.makedirs(os.path.join(d, 'figures'), exist_ok=True)
    L = [f'# {int(slug[:2])}. {titre} — plan du chapitre', '', f'- Partie du programme : **{partie}** (BO n° 14 du 2 avril 2026).', f'- Statut : **{statut}**.', '- Format : `cours-et-exercices.md` + `figures/*.svg` (convention du README, § 3).', '', '## Sections prévues', '']
    L += [f'- {s}' for s in sections]
    L += ['', '## Démonstrations du programme', ''] + ([f'- {s}' for s in demos] or ['- (aucune imposée)'])
    L += ['', '## Exemples d’algorithme du programme (Python)', ''] + ([f'- {s}' for s in algos] or ['- (aucun imposé)'])
    L += ['', '## Pour aller plus loin (★★★, facultatif)', ''] + ([f'- {s}' for s in plus] or ['- (rien de prévu)'])
    X = EXTRA.get(slug, {})
    if X.get('pass'):
        L += ['', '## Passerelles vers la première (★★★, facultatif, HORS PROGRAMME DE SECONDE)', '', '> Chaque passerelle est signalée dans le cours par « *Passerelle vers la première (★★★, hors programme de seconde).* », placée après le cœur du chapitre, sans exercice obligatoire (au plus 2 exercices ★★★ dans la série atypique).', '']
        L += [f'- {t}' for t in X['pass']]
    if X.get('auto'):
        L += ['', '## Lisibilité autonome (chapitre réutilisable en première)', '']
        L += [f'- {t}' for t in X['auto']]
    if X.get('prem'):
        L += ['', '## Rubrique « Et en première ? » (5 à 8 lignes, dans « Liens avec les autres chapitres »)', '']
        L += [f'- {t}' for t in X['prem']]
        L += ['- Référence : `COMPARAISON-PREMIERE.md` et `sources/` (programmes de 1re du BO n° 14 du 2 avril 2026, note de service du 11-9-2026)']
    L += ['']
    open(os.path.join(d, 'PLAN.md'), 'w', encoding='utf-8').write('\n'.join(L))
print(len(CH), 'plans écrits')
