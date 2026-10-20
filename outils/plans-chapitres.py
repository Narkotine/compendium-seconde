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
  ['§ 1 Variables qualitatives nominales, ordinales', '§ 2 Tableau croisé d’effectifs ; totaux', '§ 3 Fréquences marginales et conditionnelles (« parmi… »)', '§ 4 Compléter un tableau ; lire les formulations des médias'],
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
]
for (slug, titre, partie, sections, demos, algos, plus, statut) in CH:
    d = os.path.join(ROOT, slug); os.makedirs(os.path.join(d, 'figures'), exist_ok=True)
    L = [f'# {int(slug[:2])}. {titre} — plan du chapitre', '', f'- Partie du programme : **{partie}** (BO n° 14 du 2 avril 2026).', f'- Statut : **{statut}**.', '- Format : `cours-et-exercices.md` + `figures/*.svg` (convention du README, § 3).', '', '## Sections prévues', '']
    L += [f'- {s}' for s in sections]
    L += ['', '## Démonstrations du programme', ''] + ([f'- {s}' for s in demos] or ['- (aucune imposée)'])
    L += ['', '## Exemples d’algorithme du programme (Python)', ''] + ([f'- {s}' for s in algos] or ['- (aucun imposé)'])
    L += ['', '## Pour aller plus loin (★★★, facultatif)', ''] + ([f'- {s}' for s in plus] or ['- (rien de prévu)'])
    L += ['']
    open(os.path.join(d, 'PLAN.md'), 'w', encoding='utf-8').write('\n'.join(L))
print(len(CH), 'plans écrits')
