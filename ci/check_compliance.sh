#!/usr/bin/env bash
# check_compliance.sh — scans app source for banned patterns from CLAUDE.md.
#
# Usage: bash ci/check_compliance.sh <directory>
# Exit:  1 if any ERRORs found, 0 otherwise (warnings don't block CI).

set -uo pipefail

TARGET="${1:-.}"
ERRORS=0
WARNINGS=0

FILE_COUNT=$(find "$TARGET" \
  -type f \( -name "*.ts" -o -name "*.tsx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  ! -path "*/.next/*" \
  ! -path "*/packages/base_api/*" \
  ! -path "*/packages/base_auth/*" \
  ! -path "*/__tests__/*" \
  | wc -l | tr -d ' ')

if [[ "$FILE_COUNT" -eq 0 ]]; then
  echo "No .ts/.tsx files found in $TARGET"
  exit 0
fi

echo "Scanning $FILE_COUNT files in $TARGET ..."
echo ""

# ── Helpers ───────────────────────────────────────────────────────────────────

grep_in_target() {
  grep -rn --include="*.ts" --include="*.tsx" -E "$1" \
    --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.next \
    --exclude-dir=base_api --exclude-dir=base_auth \
    --exclude-dir=__tests__ \
    "$TARGET" 2>/dev/null || true
}

check_error() {
  local pattern="$1"
  local message="$2"
  local matches
  matches=$(grep_in_target "$pattern")
  if [[ -n "$matches" ]]; then
    echo "ERROR: $message"
    echo "$matches" | sed 's/^/  /'
    echo ""
    ERRORS=$((ERRORS + 1))
  fi
}

check_warning() {
  local pattern="$1"
  local message="$2"
  local matches
  matches=$(grep_in_target "$pattern")
  if [[ -n "$matches" ]]; then
    echo "WARNING: $message"
    echo "$matches" | sed 's/^/  /'
    echo ""
    WARNINGS=$((WARNINGS + 1))
  fi
}

# ── ERROR patterns (exit 1 if any) ────────────────────────────────────────────

check_error 'console\.log\(' \
  "console.log() found — use Logger from @web-base/base-monitoring instead"

check_error '\bfetch\(' \
  "Raw fetch() found — use the typed client from @web-base/base-api instead"

check_error '<button[ >]' \
  "<button> found — use BaseButton from @web-base/base-ui instead"

check_error '<input[ >]' \
  "<input> found — use BaseInput from @web-base/base-ui instead"

check_error '<select[ >]' \
  "<select> found — use BaseSelect from @web-base/base-ui instead"

check_error 'new SupabaseClient\(' \
  "new SupabaseClient() found — use createBrowserApiClient / createServerApiClient from @web-base/base-api"

check_error "from '@supabase/supabase-js'" \
  "@supabase/supabase-js imported directly — Supabase must only be used inside base_api and base_auth packages"

# ── WARNING patterns (exit 0, informational) ──────────────────────────────────

check_warning 'className=.*#[0-9a-fA-F]{6}' \
  "Hardcoded hex colour in className — use CSS variable tokens (e.g. var(--color-primary))"

check_warning 'style=\{\{' \
  "Inline style prop found — prefer Tailwind utility classes or CSS variable tokens"

# ── Summary ───────────────────────────────────────────────────────────────────

echo "────────────────────────────────────────"
echo "Compliance summary:"
echo "  Errors:   $ERRORS"
echo "  Warnings: $WARNINGS"
echo "────────────────────────────────────────"

if [[ $ERRORS -gt 0 ]]; then
  echo "FAILED — fix the errors above before merging."
  exit 1
else
  echo "PASSED"
  exit 0
fi
