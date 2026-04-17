#!/usr/bin/env bash
# Generates both backend and frontend audit artifacts under ./audit/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/audit"
mkdir -p "$OUT"

echo "==> Files (source + config; excludes node_modules, .git, .next, target)"
find "$ROOT" -type f \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -not -path '*/.next/*' \
  -not -path '*/target/*' \
  | sort > "$OUT/files.txt"

echo "==> Backend: Spring mappings"
grep -rn "@GetMapping\|@PostMapping\|@PutMapping\|@DeleteMapping\|@RequestMapping" \
  --include="*.java" "$ROOT/backend/src/main/java" \
  | sort > "$OUT/backend-endpoints.txt" || true

echo "==> Backend: @Entity / @Table / @Column"
grep -rn "@Entity\|@Table\|@Column" \
  --include="*.java" "$ROOT/backend/src/main/java" \
  | sort > "$OUT/backend-entities.txt" || true

echo "==> Backend: application.yml snapshot"
cp "$ROOT/backend/src/main/resources/application.yml" "$OUT/backend-application.yml"

echo "==> Frontend: package.json snapshot"
cp "$ROOT/propertyweb/package.json" "$OUT/frontend-package.json"

echo "==> Frontend: API usage in src only (apiFetch, apiDownload, fetch, axios)"
grep -rnE 'apiFetch|apiDownload|axios|\bfetch\(' \
  --include="*.ts" --include="*.tsx" \
  "$ROOT/propertyweb/src" \
  | sort > "$OUT/frontend-api-source.txt" || true

echo "==> Git (last 50 commits, if any)"
( cd "$ROOT" && git log --oneline -50 2>&1 ) > "$OUT/git-log.txt" || echo "(not a git repository)" > "$OUT/git-log.txt"

echo ""
echo "Done. Outputs:"
ls -la "$OUT"
echo ""
echo "Paths: $OUT/"
