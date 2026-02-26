#!/bin/sh
# Test database connection and APIs. Run with API up: ./test-api.sh
BASE="${1:-http://localhost:4000}"

echo "=== 1. Health (DB connection + database name + movie count) ==="
curl -s "$BASE/health" | python3 -m json.tool 2>/dev/null || curl -s "$BASE/health"
echo ""
echo ""

echo "=== 2. Movies list (limit=12, page=1) ==="
RES=$(curl -s "$BASE/movies?limit=12&sort=title&page=1")
echo "$RES" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    data = d.get('data', {})
    if isinstance(data, dict):
        arr = data.get('data', [])
        total = data.get('total', 0)
        pages = data.get('totalPages', 0)
        print(f'  Items returned: {len(arr)}')
        print(f'  Total: {total}')
        print(f'  totalPages: {pages}')
        print(f'  OK: limit=12 works' if len(arr) == 12 else f'  FAIL: expected 12 items, got {len(arr)}')
    else:
        print('  Unexpected shape:', type(data))
except Exception as e:
    print('  Error:', e)
"
echo ""

echo "=== 3. Categories ==="
curl -s "$BASE/categories" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    data = d.get('data', [])
    print(f'  Categories: {len(data)}')
except Exception as e:
    print('  Error:', e)
" 2>/dev/null || echo "  (raw response above)"
echo ""

echo "Done."
