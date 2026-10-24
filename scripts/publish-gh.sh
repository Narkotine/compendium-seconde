#!/usr/bin/env bash
# Publie dist/ sur la branche gh-pages : https://narkotine.github.io/compendium-seconde/
# Build + contrôles + tests e2e, puis un commit NORMAL ajouté à gh-pages (jamais de force-push).
# Usage : npm run publish:gh          (SKIP_TESTS=1 pour sauter les tests navigateur)
set -euo pipefail
cd "$(dirname "$0")/.."
REMOTE=${REMOTE:-origin}
[ -z "$(git status --porcelain)" ] || { echo "Arbre de travail non propre : commite d'abord les sources." >&2; exit 1; }
npm run build
if [ -z "${SKIP_TESTS:-}" ]; then npm run test:e2e; fi
[ -f dist/.nojekyll ] || { echo "dist/.nojekyll manquant" >&2; exit 1; }
VERSION=$(node -p "require('./package.json').version")
SRC=$(git rev-parse --short HEAD)
TMP=$(mktemp -d)
trap 'git worktree remove --force "$TMP" 2>/dev/null || true; rm -rf "$TMP"; git branch -D "gh-pages-init-$$" >/dev/null 2>&1 || true' EXIT
CRED0=(); command -v gh >/dev/null && CRED0=(-c credential.helper= -c "credential.helper=!$(command -v gh) auth git-credential")
if git "${CRED0[@]}" ls-remote --exit-code --heads "$REMOTE" gh-pages >/dev/null 2>&1; then
  git "${CRED0[@]}" fetch -q "$REMOTE" gh-pages
  git worktree add -q --detach "$TMP" "$REMOTE/gh-pages"
else
  echo "Première publication : création de la branche gh-pages (orpheline)."
  git worktree add -q --detach "$TMP"
  git -C "$TMP" checkout -q --orphan "gh-pages-init-$$"   # branche locale temporaire, poussée vers gh-pages
  git -C "$TMP" rm -rfq . >/dev/null 2>&1 || true
fi
find "$TMP" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -a dist/. "$TMP"/
git -C "$TMP" add -A
if git -C "$TMP" diff --cached --quiet 2>/dev/null && git -C "$TMP" rev-parse -q --verify HEAD >/dev/null; then echo "Rien de neuf à publier."; exit 0; fi
git -C "$TMP" commit -qm "Publication v$VERSION (sources $SRC)"
# identifiants : l'assistant de gh trouvé dans le PATH (le ~/.gitconfig de la box pointe vers un chemin absent)
CRED=(); command -v gh >/dev/null && CRED=(-c credential.helper= -c "credential.helper=!$(command -v gh) auth git-credential")
git "${CRED[@]}" -C "$TMP" push -q "$REMOTE" HEAD:gh-pages
echo "Publié v$VERSION : https://narkotine.github.io/compendium-seconde/ (build Pages en cours, ~1 min)"
