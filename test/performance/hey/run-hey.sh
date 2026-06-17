#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:8003}"
RESULT_DIR="$(cd "$(dirname "$0")" && pwd)/results"

mkdir -p "$RESULT_DIR"

echo "Test hey sur GET /accounts"
hey -n 1000 -c 50 "${BASE_URL}/accounts" | tee "${RESULT_DIR}/get-accounts.txt"

echo
echo "Test hey sur POST /accounts"
hey -n 300 -c 20 -m POST \
  -H "Content-Type: application/json" \
  -d '{"full_name":"SHARIFATOU MALAI","phone_number":"699001122","email":"sharifatou@example.com","initial_balance":1000}' \
  "${BASE_URL}/accounts" | tee "${RESULT_DIR}/post-accounts.txt"
