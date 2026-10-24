#!/usr/bin/env python3
"""Recalcule les résultats de la fiche Automatismes (tableaux et questions flash). Usage : python3 outils/relecture/check-19.py"""
from fractions import Fraction as F
import math, sympy as sp
ok = 0; bad = []
def chk(label, cond):
    global ok
    if cond: ok += 1
    else: bad.append(label)
x, a, b = sp.symbols('x a b')
# A
chk('A1', F(5, 7) - F(7, 10) == F(1, 70))
chk('A2', F(2, 3) + F(5, 6) == F(3, 2))
chk('A3', F(3, 4) / F(9, 8) == F(2, 3))
chk('A4', F(2)**5 * F(2)**-3 == 2**2 and F(10)**4 / F(10)**-2 == 10**6)
chk('A5', F(35, 100) == F(7, 20))
chk('A6', round(0.005 * 2000) == 10 and abs(0.0049 * 2030 - 10) < 0.1)
chk('A7', F(72000, 3600) == 20)
chk('A8', sp.expand((x - 3)**2) == x**2 - 6*x + 9)
chk('A9', sp.expand((2*x - 5)*(2*x + 5)) == 4*x**2 - 25)
chk('A10', sp.expand(3*x*(x + 2)) == 3*x**2 + 6*x)
chk('A11', set(sp.solve(x**2 - 49)) == {-7, 7})
chk('A12', sp.solve(5*x - 2 - (2*x + 7)) == [3])
chk('A13', sp.solve(sp.Eq(12/x, 3)) == [4])
chk('A14', sp.solve_univariate_inequality(-2*x + 6 > 0, x, relational=False) == sp.Interval.open(-sp.oo, 3))
chk('A16', sp.expand(-(a - b) + 2*a) == a + b)
chk('tab V', sp.pi * 2**2 * 5 == 20 * sp.pi)
# B
chk('B1', F(3, 10) * 150 == 45); chk('B2', F(18, 24) == F(75, 100)); chk('B3', F(12) / F(4, 10) == 30)
chk('B4', F(6, 10) * F(25, 100) == F(15, 100))
# C
chk('C1', 1 + F(5, 100) == F(105, 100) and 1 - F(12, 100) == F(88, 100))
chk('C2', 80 * F(115, 100) == 92); chk('C3', F(60 - 50, 50) == F(2, 10))
chk('C4', F(11, 10) * F(9, 10) == F(99, 100)); chk('C5', 1 / F(125, 100) == F(8, 10))
chk('C6', F(48) / F(8, 10) == 60)
# D
f = lambda t: 3*t - 2
chk('D1', f(-1) == -5 and f(3) == 7); chk('D2', 2**2 + 1 == 5); chk('D4', F(8 - 2, 3 - 1) == 3)
chk('D5', sp.solve_univariate_inequality((x - 2)*(x + 1) > 0, x, relational=False) == sp.Union(sp.Interval.open(-sp.oo, -1), sp.Interval.open(2, sp.oo))
    and sp.solve_univariate_inequality((x - 2)*(x + 1) < 0, x, relational=False) == sp.Interval.open(-1, 2))
chk('D6', set(sp.solve((2*x - 1)*(x + 4))) == {-4, sp.Rational(1, 2)})
chk('D7', -2*1 + 1 == -1)
# E
chk('E1', math.isqrt(6**2 + 8**2) == 10 and 10**2 == 100); chk('E2', sp.pi * 3**2 == 9*sp.pi)
chk('E3', sp.Rational(1, 3) * sp.pi * 9 * 4 == 12*sp.pi); chk('E4', F(4, 8) == F(1, 2) and abs(math.degrees(math.acos(0.5)) - 60) < 1e-9)
chk('E5', F(2, 5) * 10 == 4); chk('E6', F(-3 + 5, 2) == 1)
# F
s = [8, 12, 15, 9, 11]; chk('F1', F(sum(s), len(s)) == 11)
s = [3, 7, 8, 10, 12, 20]; chk('F2', F(s[2] + s[3], 2) == 9)
s = [2, 4, 5, 7, 8, 9, 11, 12]
def quartile(s, k):  # définition du lycée : plus petite valeur telle qu’au moins k/4 des valeurs lui soient inférieures ou égales
    n = len(s); r = math.ceil(k * n / 4); return sorted(s)[r - 1]
chk('F3', quartile(s, 1) == 4 and quartile(s, 3) == 9)
chk('F4', F(2*10 + 16, 3) == 12); chk('F5', F(25, 100) * 360 == 90); chk('F6', 14 - 10 == 4 and 17 - 6 == 11)
chk('tab boites', 17 - 6 == 11)
# G
chk('G1', 1 - F(35, 100) == F(65, 100)); chk('G2', F(len([k for k in range(1, 7) if k % 3 == 0]), 6) == F(1, 3))
chk('G3', 1 - F(2, 10) - F(5, 10) == F(3, 10) and F(2, 10) + F(3, 10) == F(1, 2))
chk('G4', F(30, 200) == F(3, 20) and F(30, 120) == F(1, 4) and F(30, 50) == F(3, 5))
chk('G5', F(4, 10) * F(5, 10) == F(2, 10)); chk('G6', not (0 <= 1.2 <= 1))
print(f'{ok} résultats justes, {len(bad)} faux' + (' : ' + ', '.join(bad) if bad else ''))
