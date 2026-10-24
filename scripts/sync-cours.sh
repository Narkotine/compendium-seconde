#!/usr/bin/env bash
# Met à jour cours/ depuis le dépôt de rédaction local ../compendium-seconde (git subtree : historique conservé).
# Usage : npm run sync-cours        (SRC_REPO=/chemin SRC_BRANCH=master pour changer)
set -euo pipefail
cd "$(dirname "$0")/.."
SRC_REPO=${SRC_REPO:-../compendium-seconde}
SRC_BRANCH=${SRC_BRANCH:-master}
[ -z "$(git status --porcelain)" ] || { echo "Arbre de travail non propre : commite d'abord." >&2; exit 1; }
[ -z "$(git -C "$SRC_REPO" status --porcelain)" ] || echo "⚠ $SRC_REPO a des changements non commités : seuls les commits sont repris." >&2
REV=$(git -C "$SRC_REPO" rev-parse --short "$SRC_BRANCH")
git subtree pull -q --prefix=cours "$SRC_REPO" "$SRC_BRANCH" -m "Contenu : cours/ mis à jour depuis compendium-seconde ($REV)"
echo "cours/ à jour (compendium-seconde $REV). Ensuite : npm run build, puis npm run publish:gh."
