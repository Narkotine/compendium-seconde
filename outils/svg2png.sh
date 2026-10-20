#!/usr/bin/env bash
# Convertit un SVG en PNG (×2, fond blanc) avec Chrome headless. Usage : outils/svg2png.sh figure.svg sortie.png [echelle=2]
set -euo pipefail
src=$(realpath "$1"); out=$(realpath -m "$2"); s=${3:-2}
vb=$(grep -o 'viewBox="[^"]*"' "$src" | head -1 | tr -d '"' | cut -d= -f2)
w=$(echo $vb | awk '{print int($3+0.999)}'); h=$(echo $vb | awk '{print int($4+0.999)}')
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
printf '<!doctype html><html><body style="margin:0;background:#fff"><img src="file://%s" style="display:block;width:%spx;height:%spx"></body></html>' "$src" "$w" "$h" > "$tmp/p.html"
google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --allow-file-access-from-files \
  --force-device-scale-factor=$s --window-size=$w,$h --virtual-time-budget=2000 --screenshot="$out" "file://$tmp/p.html" >/dev/null 2>&1
echo "$out (${w}x${h} ×$s)"
