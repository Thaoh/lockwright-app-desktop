#!/usr/bin/env bash
# Real check: LOCKWRIGHT_GIT_SHA=deadbeef12 writes that sha into generated-git-sha.json.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/electron/generated-git-sha.json"
trap 'rm -f "$OUT"' EXIT

LOCKWRIGHT_GIT_SHA=deadbeef12 node "$ROOT/scripts/write-git-sha.cjs"
got="$(python3 -c "import json; print(json.load(open('$OUT'))['sha'])")"
test "$got" = "deadbeef12"

echo ok
