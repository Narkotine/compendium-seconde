#!/usr/bin/env python3
"""Recalcule les résultats chiffrés du chapitre 01 (exemples guidés et corrigés). Usage : python3 outils/relecture/check-01.py"""
from fractions import Fraction as F
from decimal import Decimal as D
import math, sympy as sp
ok = 0; bad = []
def chk(label, cond):
    global ok
    if cond: ok += 1
    else: bad.append(label)
def is_dec(q):  # fraction décimale ?
    q = F(q); d = q.denominator
    for p in (2, 5):
        while d % p == 0: d //= p
    return d == 1
def tronc(x, n): return math.floor(x * 10**n) / 10**n
def arr(x, n): return float(D(repr(x)).quantize(D(1).scaleb(-n), rounding='ROUND_HALF_UP'))
def interval_inter(a, b): return (max(a[0], b[0]), min(a[1], b[1]))
# Exemple 1
chk('EG1 a', math.isqrt(49) == 7); chk('EG1 b', F(-12, 3) == -4); chk('EG1 c', F(7, 4) == F(175, 100))
chk('EG1 d', not is_dec(F(2, 3)))
# § 1.2
chk('3/8', F(3, 8) == F(375, 1000)); chk('7/20', F(7, 20) == F(35, 100))
# § 2 : 1/7 période, 0,777... = 7/9
chk('1/7', str(D(1) / D(7))[:14] == '0.142857142857'); chk('7/9', F(7, 9) * 9 == 7)
# § 3 : 1,414²
chk('1.414^2', D('1.414')**2 == D('1.999396'))
# Exemple 2 : ordre
v = [-2.5, -7/4, 2/3, math.sqrt(2), math.pi]; chk('EG2 ordre', v == sorted(v))
# Exemple 3
chk('EG3', D('1.4')**2 == D('1.96') and D('1.5')**2 == D('2.25') and D('1.41')**2 == D('1.9881') and D('1.42')**2 == D('2.0164'))
chk('EG3 zoom', D('1.414')**2 < 2 < D('1.415')**2)
# Python du § 4.2
def enc(k, n):
    pas = 10**(-n); a = 1
    while (a + pas)**2 <= k: a = a + pas
    return round(a, n), round(a + pas, n)
chk('python r2', enc(2, 2) == (1.41, 1.42)); chk('python r3 K1', enc(3, 2) == (1.73, 1.74))
chk('0.1+0.2', repr(0.1 + 0.2) == '0.30000000000000004')
# § 4.3
chk('pi tronc/arr', tronc(math.pi, 2) == 3.14 and arr(math.pi, 2) == 3.14)
chk('2/3 tronc/arr', tronc(2/3, 2) == 0.66 and arr(2/3, 2) == 0.67)
# Exemple 4
chk('EG4', f'{23.4/1.27:.8f}' == '18.42519685' and round(23.4/1.27, 1) == 18.4)
# Exemple 5
chk('EG5 sqrt30', 5 < math.sqrt(30) < 6 and round(math.sqrt(30), 2) == 5.48)
# Exemple 6
chk('EG6 inter', interval_inter((-2, 3), (1, 5)) == (1, 3))
chk('EG6 Ic K vide', 3 < 4)
# Exemple 7
chk('EG7 a', abs(2 - (-4.5)) == 6.5); chk('EG7 b', round(2 - math.sqrt(2), 2) == 0.59 and round(math.pi - 1, 2) == 2.14)
# Exemple 8
chk('EG8 a', (-3 - 0.5, -3 + 0.5) == (-3.5, -2.5)); chk('EG8 b', ((2 + 8) / 2, (8 - 2) / 2) == (5, 3))
# Exemple 9
chk('EG9', (D(25) - D('0.2'), D(25) + D('0.2')) == (D('24.8'), D('25.2')) and abs(D('25.25') - 25) == D('0.25'))
# ★★★ |x−1| ≥ 2
chk('aller+loin', (1 - 2, 1 + 2) == (-1, 3))
# A2
chk('A2', F(18, 6) == 3 and F(-21, 7) == -3 and F(9, 4) == F(225, 100) and not is_dec(F(5, 6)) and math.isqrt(36)**2 == 36 and math.isqrt(5)**2 != 5)
# A4
chk('A4', F(3, 8) == F(375, 1000) and F(7, 20) == F(35, 100) and F(13, 25) == F(52, 100) and F(-9, 4) == F(-225, 100))
# B1
chk('B1', F(14, 35) == F(2, 5) and F(18, 24) == F(3, 4) and F(15, 18) == F(5, 6) and not is_dec(F(5, 6)) and F(33, 12) == F(11, 4) and F(11, 4) == F(275, 100))
chk('B1 reste 2', (5 * 10) % 6 == 2 and (2 * 10) % 6 == 2)
# B2
chk('B2', F(1, 3) + F(1, 6) == F(1, 2) and F(2, 3) * F(9, 4) == F(3, 2))
# B4
chk('B4', F(4, 9) == F(4, 9) and str(D(4) / D(9))[:6] == '0.4444')
# B5
chk('B5', (D('1.414213562')**2).quantize(D('1e-9'), rounding='ROUND_HALF_UP') == D('1.999999999'))
# C1
chk('C1', [F(1, 2) * 6, F(-4, 3) * 6, F(5, 6) * 6, F(-3, 2) * 6] == [3, -8, 5, -9])
# C2
c2 = {'r3': math.sqrt(3), '1.7': 1.7, '7/4': 1.75, '-1.8': -1.8, '-r3': -math.sqrt(3), '1.73': 1.73}
chk('C2', sorted(c2, key=c2.get) == ['-1.8', '-r3', '1.7', '1.73', 'r3', '7/4'])
# C3
chk('C3', D('1.7')**2 == D('2.89') and D('1.8')**2 == D('3.24') and D('1.73')**2 == D('2.9929') and D('1.74')**2 == D('3.0276'))
# C4
chk('C4', (tronc(math.sqrt(5), 2), arr(math.sqrt(5), 2)) == (2.23, 2.24) and (tronc(17/6, 2), arr(17/6, 2)) == (2.83, 2.83))
# C6
chk('C6', D('7.35') * D('4.8') == D('35.280'))
# D4
chk('D4 e', 3 < math.sqrt(10) < 4); chk('D4 f', 3.14 < math.pi < 3.15)
# E
chk('E1', interval_inter((-4, 2), (0, 6)) == (0, 2)); chk('E4a', interval_inter((-1, 5), (2, 8)) == (2, 5))
# F
chk('F1', [abs(-7), abs(5 - 9), abs(-2 - 6)] == [7, 4, 8])
chk('F2', [abs(11 - 3), abs(6 - (-4)), abs(-2.5 - (-8)), abs(F(1, 3) - F(-1, 2))] == [8, 10, 5.5, F(5, 6)])
chk('F3', math.pi > 3 and math.sqrt(2) < 1.5 and math.sqrt(10) > 3)
chk('F4', abs(7 - (-2)) == 9 and (-2 + 7) / 2 == 2.5 and (-2 - 5, -2 + 5) == (-7, 3))
# G
chk('G1', [(4 - 1, 4 + 1), (2 - 3, 2 + 3), (-1 - 0.5, -1 + 0.5), (-6, 6)] == [(3, 5), (-1, 5), (-1.5, -0.5), (-6, 6)])
chk('G2', [((1 + 9) / 2, (9 - 1) / 2), ((-6 + 2) / 2, (2 + 6) / 2), (round((-0.3 + 0.7) / 2, 10), round((0.7 + 0.3) / 2, 10))] == [(5, 4), (-2, 4), (0.2, 0.5)])
chk('G3', (26 - 1.5, 26 + 1.5) == (24.5, 27.5) and 24.2 < 24.5)
# H
chk('H4', abs(5 - (-3)) == 8); chk('H5', (-2 - 3, -2 + 3) == (-5, 1) and (2 - 3, 2 + 3) == (-1, 5))
chk('H6', interval_inter((-1, 4), (2, 6)) == (2, 4))
chk('H2', D('0.3333333333') * 3 == D('0.9999999999'))
# J1
chk('J1', (D(120) - D('0.8'), D(120) + D('0.8')) == (D('119.2'), D('120.8')) and (D('119.5') + D('120.3')) / 2 == D('119.9') and (D('120.3') - D('119.5')) / 2 == D('0.4'))
# J2
chk('J2', D('3.16')**2 == D('9.9856') and D('3.17')**2 == D('10.0489') and D('3.165')**2 == D('10.017225') and round(math.sqrt(10), 2) == 3.16)
# J3
chk('J3', D('1.4145')**2 == D('2.00081025') and D('1.4145') < D('1.415') and 1 < math.sqrt(3) < 2)
# K3
def distance(a, b): return a - b if a >= b else b - a
chk('K3', distance(-3, 5) == 8)
# irrationalité : sympy confirme
chk('irrationnels', not sp.sqrt(2).is_rational and not sp.sqrt(5).is_rational and not sp.pi.is_rational)
print(f'{ok} résultats vérifiés, {len(bad)} faux' + (' : ' + ', '.join(bad) if bad else ''))
