#!/usr/bin/env bash
# Pre-launch hardening checklist — run from project root
PASS=0; FAIL=0

check() {
  local label="$1" cmd="$2" expect_empty="${3:-true}"
  local result
  result=$(eval "$cmd" 2>/dev/null || true)
  if { [ "$expect_empty" = "true" ] && [ -z "$result" ]; } ||      { [ "$expect_empty" = "false" ] && [ -n "$result" ]; }; then
    echo "  ✓ $label"; PASS=$((PASS+1))
  else
    echo "  ✗ $label"; FAIL=$((FAIL+1))
    [ -n "$result" ] && echo "$result" | head -5 | sed 's/^/      /'
  fi
}

echo ""
echo "── Security ─────────────────────────────────────────────────"
check "No cors wildcard"           "grep -rn "cors.*'\*'" server/routes.ts server/index.ts 2>/dev/null"
check "No hardcoded secrets"       "grep -rn 'password123\|test123\|secret123' server/routes.ts server/lib/ 2>/dev/null"
check "No localhost in client src" "grep -rn 'localhost' client/src --include='*.ts' --include='*.tsx' 2>/dev/null | grep -v '//' | grep -v '5001\|example\|test\|config'"

echo ""
echo "── Code quality ─────────────────────────────────────────────"
check "No console.log in routes"   "grep -n 'console\.log' server/routes.ts 2>/dev/null"
check "No TODO/FIXME in server"    "grep -rn 'TODO\|FIXME\|HACK' server/routes.ts server/lib/ 2>/dev/null"

echo ""
echo "── Config ───────────────────────────────────────────────────"
check ".env.example exists"        "[ -f .env.example ] && echo yes" false
check ".env not committed"         "git ls-files .env 2>/dev/null"
check ".env.staging not committed" "git ls-files .env.staging 2>/dev/null"
check "Seed guard present"         "grep -l 'NODE_ENV.*production' server/scripts/seed-test-data.ts 2>/dev/null" false

echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "  All $PASS checks passed ✓"
else
  echo "  $PASS passed, $FAIL failed ✗"
  exit 1
fi
