#!/usr/bin/env bash
# Browser accessibility run against the LOCAL Docker stack (tepup/compose.yaml must be up).
#   bash a11y-e2e/run.sh                      # everything
#   bash a11y-e2e/run.sh tests/pages.spec.ts  # any Playwright args
# Results: a11y-e2e/results/summary.md (+ screenshots, aria snapshots, raw JSON).
set -euo pipefail
export MSYS_NO_PATHCONV=1
cd "$(dirname "$0")"

DB="${DB_CONTAINER:-tepup-local-db-1}"
APP="${APP_CONTAINER:-tepup-local-app-1}"
IMAGE="mcr.microsoft.com/playwright:v1.63.0-noble"   # keep in step with package.json

project="$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' "$DB" 2>/dev/null || true)"
if [[ "$project" != "tepup-local" ]]; then
  echo "The local stack isn't running ($DB). Start it from tepup/: docker compose -p tepup-local up -d" >&2
  exit 1
fi

# Pages to visit, and the local-only custom-block fixture lesson.
docker exec -i "$DB" psql -U postgres -At < collect-urls.sql > urls.json
docker run --rm -v "$(pwd -W 2>/dev/null || pwd)":/work -w /work node:22-alpine node fixtures/custom-block.mjs \
  | docker exec -i "$DB" psql -q -U postgres -v ON_ERROR_STOP=1 >/dev/null

rm -rf results
# node_modules lives in a Docker volume (Linux binaries, nothing written into the repo).
# The browser shares the app container's network, so the site is http://localhost:3000:
# Chromium upgrades plain-http hostnames like "app" to https, but never localhost.
docker run --rm --ipc=host --network "container:$APP" \
  -v "$(pwd -W 2>/dev/null || pwd)":/work -v tepup-a11y-node-modules:/work/node_modules -w /work \
  -e BASE_URL="${BASE_URL:-http://localhost:3000}" -e WORKERS="${WORKERS:-4}" \
  "$IMAGE" sh -c 'npm install --no-audit --no-fund --silent && npx playwright test "$@"; status=$?; node summarize.mjs; exit $status' sh "$@"
