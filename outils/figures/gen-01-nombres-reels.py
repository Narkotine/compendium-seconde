#!/usr/bin/env python3
"""Génère les figures du chapitre 01 (nombres réels et intervalles) dans 01-nombres-reels-intervalles/figures/."""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from kit import *

OUT = os.path.join(os.path.dirname(__file__), '..', '..', '01-nombres-reels-intervalles', 'figures')
M = '−'  # signe moins typographique

def bracket_at(ax, v, side, yc, c, h=10, w=6, sw=2.6):
    x = ax.X(v)
    if side == '[': P = [(x+w, yc-h), (x, yc-h), (x, yc+h), (x+w, yc+h)]
    else: P = [(x-w, yc-h), (x, yc-h), (x, yc+h), (x-w, yc+h)]
    return polyline(P, c, sw)

def interval(ax, a, b, left, right, c=RED, yc=None, w=5, h=10):
    """Intervalle de a à b (a=None : −∞, b=None : +∞) ; left/right : '[' ou ']'."""
    yc = ax.y if yc is None else yc
    xa = ax.x0 - 12 if a is None else ax.X(a)
    xb = ax.x1 + 14 if b is None else ax.X(b)
    out = [line((xa, yc), (xb, yc), c, w)]
    if a is not None: out.append(bracket_at(ax, a, left, yc, c, h))
    if b is not None: out.append(bracket_at(ax, b, right, yc, c, h))
    return out

# 1. Ensembles emboîtés -----------------------------------------------------------
def f1():
    W, H = 720, 300
    B = []
    boxes = [  # x, y, w, h, nom, couleur de fond
        (10, 10, 700, 280, 'ℝ  réels', '#f6f6f6'),
        (25, 45, 550, 235, 'ℚ  rationnels', F_BL),
        (40, 80, 410, 190, 'D  décimaux', F_OR),
        (55, 115, 270, 145, 'ℤ  entiers relatifs', F_VE),
        (70, 150, 130, 100, 'ℕ  entiers naturels', 'white'),
    ]
    for (x, y, w, h, nom, fill) in boxes:
        B.append(rect(x, y, w, h, INK, fill, 1.6, 14))
    for (x, y, w, h, nom, fill) in boxes:
        lab = nom.split('  ')
        B.append(text(x + 12, y + 24, lab[0], 19, BLUE, 'start', 'bold'))
        B.append(text(x + 34, y + 23, lab[1], 13, MUT, 'start'))
    # « D » double barre : on ajoute un trait vertical pour évoquer 𝔻 (police sans 𝔻 sur certains téléphones)
    B.append(line((40 + 12 + 3.2, 80 + 10), (40 + 12 + 3.2, 80 + 24), BLUE, 1.2))
    ex = [  # exemples placés dans la bande propre à chaque ensemble
        (262, 165, [M + '1', M + '4', M + '12/3']),
        (387, 150, ['0,25', M + '1,75', '7/4']),
        (512, 130, ['1/3', '2/3', M + '5/7']),
        (642, 110, ['√2', 'π', M + '√3']),
    ]
    for xx, s in [(108, '0'), (135, '3'), (162, '7')]: B.append(text(xx, 212, s, 17, INK))
    for (x, y, L) in ex:
        for i, s in enumerate(L):
            B.append(text(x, y + 30 * i, s, 17, INK))
    return svg(W, H, 'Ensembles de nombres emboîtés : N inclus dans Z, inclus dans D, inclus dans Q, inclus dans R, avec des exemples propres à chaque ensemble : 0, 3, 7 ; −1, −4 ; 0,25, −1,75 ; 1/3, 2/3 ; √2, π', B)

# 2. Diagonale du carré et √2 ------------------------------------------------------
def f2():
    W, H = 620, 300
    ax = Axis(-0.5, 2.5, 70, 550, 240)
    B = ax.draw(1, size=15)
    u = ax.X(1) - ax.X(0)
    O = (ax.X(0), ax.y); I = (ax.X(1), ax.y); K = (ax.X(1), ax.y - u); J = (ax.X(0), ax.y - u)
    B.append(poly([O, I, K, J], INK, F_BL, 2))
    B.append(line(O, K, RED, 3))
    r = math.sqrt(2) * u
    B.append(arc(O, r, 45, 0, BLUE, 1.8, '6 4'))
    P = (ax.X(math.sqrt(2)), ax.y)
    B.append(dot(P, 5, RED))
    B.append(text(P[0] + 4, ax.y - 14, '√2', 18, RED, 'start', 'bold'))
    B.append(text(P[0], ax.y + 46, '≈ 1,414', 14, MUT))
    B.append(text((O[0] + K[0]) / 2 - 16, (O[1] + K[1]) / 2 - 8, '√2', 17, RED, 'end', 'bold'))
    B.append(text(I[0] + 12, (I[1] + K[1]) / 2 + 5, '1', 15, INK, 'start'))
    B.append(text((J[0] + K[0]) / 2, J[1] - 10, '1', 15, INK))
    B.append(polyline([(I[0] - 14, I[1]), (I[0] - 14, I[1] - 14), (I[0], I[1] - 14)], INK, 1.4))
    B.append(text(330, 30, 'Pythagore : diagonale² = 1² + 1² = 2', 15, INK, 'start'))
    B.append(text(330, 52, 'donc diagonale = √2', 15, INK, 'start'))
    B.append(text(330, 80, 'Le compas reporte la diagonale', 14, BLUE, 'start'))
    B.append(text(330, 98, 'sur la droite numérique.', 14, BLUE, 'start'))
    return svg(W, H, 'Carré de côté 1 posé sur la droite numérique entre 0 et 1 ; sa diagonale mesure √2 ; un arc de cercle de centre 0 la reporte sur la droite au point d’abscisse √2, environ 1,414', B)

# 3. Placer des réels --------------------------------------------------------------
def f3():
    W, H = 720, 150
    ax = Axis(-3, 4, 50, 660, 95)
    B = []
    for k in range(1, 4):  # quarts entre −2 et −1
        x = ax.X(-2 + k / 4); B.append(line((x, ax.y - 5), (x, ax.y + 5), BLUE, 1.2))
    for k in range(1, 3):  # tiers entre 0 et 1
        x = ax.X(k / 3); B.append(line((x, ax.y - 5), (x, ax.y + 5), BLUE, 1.2))
    B += ax.draw(1, size=15)
    pts_ = [('E', -2.5, M + '2,5'), ('A', -7 / 4, M + '7/4'), ('B', 2 / 3, '2/3'), ('C', math.sqrt(2), '√2'), ('D', math.pi, 'π')]
    for (nm, v, s) in pts_:
        x = ax.X(v)
        B.append(dot((x, ax.y), 5, RED))
        B.append(text(x, ax.y - 34, nm, 16, RED, 'middle', 'bold'))
        B.append(text(x, ax.y - 16, s, 14, INK))
    return svg(W, H, 'Droite numérique de −3 à 4 ; points E(−2,5), A(−7/4) placé avec les quarts entre −2 et −1, B(2/3) placé avec les tiers entre 0 et 1, C(√2) et D(π)', B)

# 4. Zoom d'encadrement de √2 --------------------------------------------------------
def f4():
    W, H = 720, 330
    rows = [(1, 2, 0.1, 1.4, 1.5, '1,4 ≤ √2 ≤ 1,5', 'amplitude 0,1'),
            (1.4, 1.5, 0.01, 1.41, 1.42, '1,41 ≤ √2 ≤ 1,42', 'amplitude 0,01'),
            (1.41, 1.42, 0.001, 1.414, 1.415, '1,414 ≤ √2 ≤ 1,415', 'amplitude 0,001')]
    B = []
    prev = None
    for i, (a, b, st, lo, hi, lab, amp) in enumerate(rows):
        y = 70 + 105 * i
        ax = Axis(a, b, 60, 540, y)
        def labf(v, a=a, b=b, st=st):
            if abs(v - a) < 1e-9 or abs(v - b) < 1e-9: return fmt(round(v, 3))
            return ''
        B += ax.draw(st, size=14, lab=labf, extend=14)
        B.append(rect(ax.X(lo), y - 12, ax.X(hi) - ax.X(lo), 24, RED, F_OR, 1.4))
        B.append(text(ax.X(lo), y + 25, fmt(round(lo, 3)), 13, RED))
        B.append(text(ax.X(hi), y + 25, fmt(round(hi, 3)), 13, RED))
        xs = ax.X(math.sqrt(2)); B.append(dot((xs, y), 4, RED))
        B.append(text(xs, y - 18, '√2', 14, RED, 'middle', 'bold'))
        B.append(text(560, y - 2, lab, 15, INK, 'start', 'bold'))
        B.append(text(560, y + 18, amp, 13, MUT, 'start'))
        if prev:
            B.append(line(prev[0], (ax.x0, y - 14), MUT, 1, '4 4'))
            B.append(line(prev[1], (ax.x1, y - 14), MUT, 1, '4 4'))
        prev = ((ax.X(lo), y + 12), (ax.X(hi), y + 12))
    return svg(W, H, 'Encadrements successifs de √2 par zoom : entre 1,4 et 1,5, puis entre 1,41 et 1,42, puis entre 1,414 et 1,415 ; à chaque étape l’amplitude est divisée par 10', B)

# 5. Représentations d'intervalles ---------------------------------------------------
def f5():
    W, H = 720, 300
    rows = [(-1, 3, '[', ']', '[' + M + '1 ; 3]', M + '1 ≤ x ≤ 3'),
            (-1, 3, ']', ']', ']' + M + '1 ; 3]', M + '1 < x ≤ 3'),
            (2, None, '[', None, '[2 ; +∞[', 'x ≥ 2'),
            (None, 1, None, '[', ']' + M + '∞ ; 1[', 'x < 1')]
    B = []
    for i, (a, b, l, r, lab, ineq) in enumerate(rows):
        y = 50 + 68 * i
        ax = Axis(-3, 5, 150, 560, y)
        B += ax.draw(1, size=13, extend=16)
        B += interval(ax, a, b, l, r)
        B.append(text(20, y + 6, lab, 17, RED, 'start', 'bold'))
        B.append(text(610, y + 6, ineq, 15, INK, 'start'))
    return svg(W, H, 'Quatre intervalles représentés : [−1 ; 3] (−1 ≤ x ≤ 3) ; ]−1 ; 3] (−1 < x ≤ 3) ; [2 ; +∞[ (x ≥ 2) ; ]−∞ ; 1[ (x < 1). Crochet tourné vers le trait rouge : borne comprise ; tourné vers l’extérieur : borne exclue', B)

# 6. Intersection et réunion ---------------------------------------------------------
def f6():
    W, H = 720, 280
    B = []
    ax = Axis(-3, 6, 150, 600, 70)
    B += ax.draw(1, size=13, extend=16)
    B += interval(ax, -2, 3, '[', ']', BLUE, ax.y - 34, 4, 8)
    B += interval(ax, 1, 5, ']', ']', RED, ax.y - 14, 4, 8)
    for v in (-2, 1, 3, 5): B.append(line((ax.X(v), ax.y - 44), (ax.X(v), ax.y), MUT, 1, '3 3'))
    B.append(text(20, ax.y - 28, 'I = [' + M + '2 ; 3]', 15, BLUE, 'start', 'bold'))
    B.append(text(20, ax.y - 8, 'J = ]1 ; 5]', 15, RED, 'start', 'bold'))
    ax2 = Axis(-3, 6, 150, 600, 150)
    B += ax2.draw(1, size=13, extend=16)
    B += interval(ax2, 1, 3, ']', ']', GRN)
    B.append(text(20, ax2.y + 6, 'I ∩ J = ]1 ; 3]', 15, GRN, 'start', 'bold'))
    B.append(text(625, ax2.y + 6, 'dans I et J', 13, MUT, 'start'))
    ax3 = Axis(-3, 6, 150, 600, 235)
    B += ax3.draw(1, size=13, extend=16)
    B += interval(ax3, -2, 5, '[', ']', GRN)
    B.append(text(20, ax3.y + 6, 'I ∪ J = [' + M + '2 ; 5]', 15, GRN, 'start', 'bold'))
    B.append(text(625, ax3.y + 6, 'dans I ou J', 13, MUT, 'start'))
    return svg(W, H, 'En haut, I = [−2 ; 3] en bleu et J = ]1 ; 5] en rouge sur la même droite. Au milieu, leur intersection ]1 ; 3]. En bas, leur réunion [−2 ; 5]', B)

# 7. Valeur absolue et distance ------------------------------------------------------
def f7():
    W, H = 720, 210
    ax = Axis(-4, 6, 80, 640, 100)
    B = ax.draw(1, size=14)
    def span(va, vb, y, c, lab):
        xa, xb = ax.X(va), ax.X(vb)
        out = [line((xa, ax.y), (xa, y), c, 1, '3 3'), line((xb, ax.y), (xb, y), c, 1, '3 3')]
        out.append(arrow(((xa + xb) / 2, y), (xb, y), c, 2)); out.append(arrow(((xa + xb) / 2, y), (xa, y), c, 2))
        out.append(text((xa + xb) / 2, y - 9 if y < ax.y else y + 21, lab, 15, c, 'middle', 'bold'))
        return out
    B += span(-3, 0, 52, BLUE, '|' + M + '3| = 3')
    B += span(-2, 5, 160, RED, 'distance entre ' + M + '2 et 5 : |5 − (' + M + '2)| = 7')
    for v, c in [(-3, BLUE), (0, BLUE), (-2, RED), (5, RED)]:
        B.append(dot((ax.X(v), ax.y), 4.5, c))
    return svg(W, H, 'Sur la droite numérique, |−3| = 3 est la distance entre −3 et 0 ; la distance entre −2 et 5 vaut |5 − (−2)| = 7', B)

# 8. Intervalle de centre a et de rayon r -------------------------------------------
def f8():
    W, H = 640, 190
    ax = Axis(-2, 4, 60, 560, 110)
    B = ax.draw(1, size=14)
    B += interval(ax, -1, 3, '[', ']', RED)
    C = (ax.X(1), ax.y); B.append(dot(C, 5, BLUE))
    B.append(text(C[0], ax.y + 46, 'centre 1', 14, BLUE, 'middle', 'bold'))
    y = 70
    B.append(line(C, (C[0], y), BLUE, 1, '3 3'))
    B.append(arrow((C[0], y), (ax.X(-1), y), BLUE, 2)); B.append(arrow((C[0], y), (ax.X(3), y), BLUE, 2))
    B.append(text((C[0] + ax.X(-1)) / 2, y - 9, 'r = 2', 14, BLUE, 'middle', 'bold'))
    B.append(text((C[0] + ax.X(3)) / 2, y - 9, 'r = 2', 14, BLUE, 'middle', 'bold'))
    B.append(text(W / 2, 28, '|x − 1| ≤ 2  ⟺  x ∈ [' + M + '1 ; 3]', 17, RED, 'middle', 'bold'))
    return svg(W, H, 'Les réels x dont la distance à 1 est au plus 2 forment l’intervalle [−1 ; 3], de centre 1 et de rayon 2 : |x − 1| ≤ 2 équivaut à x dans [−1 ; 3]', B)

for name, fn in [('ensembles-emboites.svg', f1), ('diagonale-racine-2.svg', f2), ('droite-placer-reels.svg', f3),
                 ('encadrement-zoom.svg', f4), ('intervalles-representations.svg', f5), ('intersection-reunion.svg', f6),
                 ('distance-valeur-absolue.svg', f7), ('intervalle-centre-rayon.svg', f8)]:
    write(OUT, name, fn())
