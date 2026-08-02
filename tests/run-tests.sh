#!/bin/sh

set -u

TESTS_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(dirname -- "$TESTS_DIR")
CI_CD_DIR=${BROWSER_EXTENSION_CI_CD:-"$PROJECT_DIR/../browser-extension-ci-cd"}
RUNNER="$CI_CD_DIR/test-runner/run-tests.sh"

if [ ! -x "$RUNNER" ]; then
  printf '%s\n' '{"passed":false,"status":"infrastructure-error","summary":"Shared browser test runner was not found","failedTests":[],"infrastructureError":"Set BROWSER_EXTENSION_CI_CD to the browser-extension-ci-cd checkout"}'
  exit 2
fi

exec "$RUNNER" "$PROJECT_DIR"
