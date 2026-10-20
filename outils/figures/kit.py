"""Boîte à outils des figures du compendium seconde (écrite pour ce projet, aucun import extérieur).
SVG autonomes : viewBox + width/height, fond blanc, <title>, ni <style> ni id (ils sont inlinés dans une page unique).
Palette identique à celle du compendium collège (cohérence visuelle), voir README § Figures."""
import math, os
INK = '#222'; RED = '#c0392b'; BLUE = '#1f4e79'; MUT = '#666'; GRN = '#2e7d32'
F_OR = '#fdebd0'; F_BL = '#dbe8f5'; F_GR = '#eeeeee'; F_VE = '#e3f1e4'
FONT = 'Arial, Helvetica, sans-serif'

def svg(w, h, title, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
            f'font-family="{FONT}">\n<title>{esc(title)}</title>\n<rect width="{w}" height="{h}" fill="white"/>\n'
            + '\n'.join(body) + '\n</svg>\n')

def n(x): return f'{x:.1f}'.rstrip('0').rstrip('.')
def pts(P): return ' '.join(f'{n(x)},{n(y)}' for x, y in P)
def line(A, B, c=INK, w=2, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    return f'<line x1="{n(A[0])}" y1="{n(A[1])}" x2="{n(B[0])}" y2="{n(B[1])}" stroke="{c}" stroke-width="{w}" stroke-linecap="round"{d}/>'
def polyline(P, c=INK, w=2, fill='none'):
    return f'<polyline points="{pts(P)}" fill="{fill}" stroke="{c}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"/>'
def poly(P, c=INK, fill='none', w=2):
    return f'<polygon points="{pts(P)}" fill="{fill}" stroke="{c}" stroke-width="{w}" stroke-linejoin="round"/>'
def rect(x, y, w, h, c=INK, fill='none', sw=1.5, rx=0):
    return f'<rect x="{n(x)}" y="{n(y)}" width="{n(w)}" height="{n(h)}" rx="{rx}" fill="{fill}" stroke="{c}" stroke-width="{sw}"/>'
def circle(C, r, c=INK, fill='none', w=1.5):
    return f'<circle cx="{n(C[0])}" cy="{n(C[1])}" r="{n(r)}" fill="{fill}" stroke="{c}" stroke-width="{w}"/>'
def dot(P, r=4, c=INK): return circle(P, r, c, c, 1)
def esc(s): return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
def text(x, y, s, size=15, c=INK, anchor='middle', weight='normal', italic=False):
    s = esc(s)
    st = ' font-style="italic"' if italic else ''
    return f'<text x="{n(x)}" y="{n(y)}" font-size="{size}" fill="{c}" text-anchor="{anchor}" font-weight="{weight}"{st}>{s}</text>'
def arrow(A, B, c=INK, w=1.8, head=9):
    dx, dy = B[0]-A[0], B[1]-A[1]; L = math.hypot(dx, dy); u = (dx/L, dy/L); v = (-u[1], u[0])
    base = (B[0]-head*u[0], B[1]-head*u[1])
    return (line(A, base, c, w) + '\n' +
            poly([B, (base[0]+head*0.45*v[0], base[1]+head*0.45*v[1]), (base[0]-head*0.45*v[0], base[1]-head*0.45*v[1])], c, c, 1))
def arc(C, r, a1, a2, c=INK, w=1.6, dash=None):
    """Arc de cercle de centre C, angles en degrés (sens trigonométrique, y vers le haut à l'écran)."""
    p1 = (C[0]+r*math.cos(math.radians(a1)), C[1]-r*math.sin(math.radians(a1)))
    p2 = (C[0]+r*math.cos(math.radians(a2)), C[1]-r*math.sin(math.radians(a2)))
    large = 1 if abs(a2-a1) > 180 else 0; sweep = 0 if a2 > a1 else 1
    d = f' stroke-dasharray="{dash}"' if dash else ''
    return f'<path d="M{n(p1[0])},{n(p1[1])} A{n(r)},{n(r)} 0 {large} {sweep} {n(p2[0])},{n(p2[1])}" fill="none" stroke="{c}" stroke-width="{w}"{d}/>'

class Axis:
    """Droite numérique horizontale : valeurs [v0, v1] sur les pixels [x0, x1], à l'ordonnée y."""
    def __init__(self, v0, v1, x0, x1, y):
        self.v0, self.v1, self.x0, self.x1, self.y = v0, v1, x0, x1, y
    def X(self, v): return self.x0 + (v - self.v0) * (self.x1 - self.x0) / (self.v1 - self.v0)
    def draw(self, step=1, labels=True, lab=None, size=14, minor=None, c=INK, extend=22):
        out = [arrow((self.x0 - extend*0.6, self.y), (self.x1 + extend, self.y), c, 1.8)]
        if minor:
            k = 0
            while self.v0 + k*minor <= self.v1 + 1e-9:
                x = self.X(self.v0 + k*minor); out.append(line((x, self.y-4), (x, self.y+4), MUT, 1)); k += 1
        start = math.ceil(self.v0/step - 1e-9)*step
        k = 0
        while start + k*step <= self.v1 + 1e-9:
            v = start + k*step; x = self.X(v)
            out.append(line((x, self.y-7), (x, self.y+7), c, 1.6))
            if labels:
                s = lab(v) if lab else fmt(v)
                if s: out.append(text(x, self.y+25, s, size, c))
            k += 1
        return out
    def bracket(self, v, side, c=RED, h=11, w=7, sw=2.6):
        """Crochet en v. side='[' ou ']' (sens d'écriture : '[' ouvre vers la droite)."""
        x = self.X(v); y = self.y
        if side == '[':
            P = [(x+w, y-h), (x, y-h), (x, y+h), (x+w, y+h)]
        else:
            P = [(x-w, y-h), (x, y-h), (x, y+h), (x-w, y+h)]
        return polyline(P, c, sw)
    def segment(self, va, vb, c=RED, w=5, y_off=0):
        return line((self.X(va), self.y+y_off), (self.X(vb), self.y+y_off), c, w)

def fmt(v):
    if abs(v - round(v)) < 1e-9:
        s = str(int(round(v)))
    else:
        s = f'{v:.3f}'.rstrip('0').rstrip('.').replace('.', ',')
    return s.replace('-', '−')

def write(dirpath, name, content):
    os.makedirs(dirpath, exist_ok=True)
    with open(os.path.join(dirpath, name), 'w', encoding='utf-8') as f: f.write(content)
    print('écrit', os.path.join(dirpath, name))
