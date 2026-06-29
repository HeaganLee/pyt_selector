#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

./gradlew -t classes -x test &
WATCH_PID=$!

cleanup() {
  kill "$WATCH_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

./gradlew bootRun
