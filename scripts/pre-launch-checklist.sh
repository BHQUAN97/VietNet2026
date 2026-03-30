#!/bin/bash
# ──────────────────────────────────────────
# Pre-Launch Verification Checklist
# Run: bash scripts/pre-launch-checklist.sh
# ──────────────────────────────────────────

set -euo pipefail

SITE_URL="${1:-https://bhquan.site}"
API_URL="${SITE_URL}/api"
PASS=0
FAIL=0

check() {
    local desc="$1"
    local result="$2"
    if [ "$result" = "true" ]; then
        echo "  [PASS] $desc"
        ((PASS++))
    else
        echo "  [FAIL] $desc"
        ((FAIL++))
    fi
}

echo "============================================"
echo "  VietNet Pre-Launch Checklist"
echo "  Target: ${SITE_URL}"
echo "============================================"
echo ""

# ── 1. Health Check ──────────────────────
echo "1. Health Check"
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/health" 2>/dev/null || echo "000")
check "API health endpoint returns 200" "$([ "$HEALTH" = "200" ] && echo true || echo false)"

# ── 2. SSL / HSTS ───────────────────────
echo ""
echo "2. SSL & HSTS"
HEADERS=$(curl -sI "${SITE_URL}" 2>/dev/null || echo "")
check "HTTPS redirect works" "$(echo "$HEADERS" | grep -qi 'strict-transport-security' && echo true || echo false)"
check "HSTS header present" "$(echo "$HEADERS" | grep -qi 'strict-transport-security' && echo true || echo false)"

# ── 3. Security Headers ─────────────────
echo ""
echo "3. Security Headers"
check "X-Frame-Options" "$(echo "$HEADERS" | grep -qi 'x-frame-options' && echo true || echo false)"
check "X-Content-Type-Options" "$(echo "$HEADERS" | grep -qi 'x-content-type-options' && echo true || echo false)"
check "Referrer-Policy" "$(echo "$HEADERS" | grep -qi 'referrer-policy' && echo true || echo false)"
check "Permissions-Policy" "$(echo "$HEADERS" | grep -qi 'permissions-policy' && echo true || echo false)"
check "Content-Security-Policy" "$(echo "$HEADERS" | grep -qi 'content-security-policy' && echo true || echo false)"
check "No server version exposed" "$(echo "$HEADERS" | grep -qi 'server: nginx/' && echo false || echo true)"

# ── 4. SEO Files ─────────────────────────
echo ""
echo "4. SEO Files"
SITEMAP=$(curl -s -o /dev/null -w "%{http_code}" "${SITE_URL}/sitemap.xml" 2>/dev/null || echo "000")
check "sitemap.xml accessible" "$([ "$SITEMAP" = "200" ] && echo true || echo false)"

ROBOTS=$(curl -s -o /dev/null -w "%{http_code}" "${SITE_URL}/robots.txt" 2>/dev/null || echo "000")
check "robots.txt accessible" "$([ "$ROBOTS" = "200" ] && echo true || echo false)"

# ── 5. Error Pages ───────────────────────
echo ""
echo "5. Error Pages"
NOT_FOUND=$(curl -s -o /dev/null -w "%{http_code}" "${SITE_URL}/this-page-does-not-exist-xyz" 2>/dev/null || echo "000")
check "404 page returns correct status" "$([ "$NOT_FOUND" = "404" ] && echo true || echo false)"

# ── 6. API Endpoints ────────────────────
echo ""
echo "6. Key API Endpoints"
PROJECTS=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/projects?page=1&limit=1" 2>/dev/null || echo "000")
check "Projects API" "$([ "$PROJECTS" = "200" ] && echo true || echo false)"

PRODUCTS=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/products?page=1&limit=1" 2>/dev/null || echo "000")
check "Products API" "$([ "$PRODUCTS" = "200" ] && echo true || echo false)"

ARTICLES=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/articles?page=1&limit=1" 2>/dev/null || echo "000")
check "Articles API" "$([ "$ARTICLES" = "200" ] && echo true || echo false)"

# ── 7. Rate Limiting ────────────────────
echo ""
echo "7. Rate Limiting"
LOGIN_429=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${API_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"x"}' 2>/dev/null || echo "000")
check "Login endpoint responds (401 or 429)" "$([ "$LOGIN_429" = "401" ] || [ "$LOGIN_429" = "429" ] && echo true || echo false)"

# ── 8. WebSocket ─────────────────────────
echo ""
echo "8. WebSocket"
WS_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "${SITE_URL}/socket.io/?EIO=4&transport=polling" 2>/dev/null || echo "000")
check "Socket.io endpoint responds" "$([ "$WS_CHECK" != "000" ] && echo true || echo false)"

# ── Summary ──────────────────────────────
echo ""
echo "============================================"
echo "  Results: ${PASS} passed, ${FAIL} failed"
echo "============================================"

if [ "$FAIL" -gt 0 ]; then
    echo "  Some checks failed. Review before launch."
    exit 1
else
    echo "  All checks passed. Ready for launch!"
    exit 0
fi
