#!/usr/bin/env bash
# Mobile Lighthouse test of every HTML page in a site folder, served locally.
# Usage: tools/speed-test.sh <site-folder>   (pass mark: performance >= 90 on every page)
set -euo pipefail
DIR=$(cd "${1:?site folder}" && pwd); PORT=8799; OUT=$(mktemp -d)
python3 -m http.server $PORT --directory "$DIR" >/dev/null 2>&1 & SRV=$!; trap 'kill $SRV' EXIT; sleep 1
for f in "$DIR"/*.html; do p=$(basename "$f"); [ "$p" = 404.html ] && continue
  CHROME_PATH=/opt/pw-browsers/chromium npx -y lighthouse@12.2.1 "http://localhost:$PORT/$p" --quiet \
    --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo \
    --output=json --output-path="$OUT/$p.json" >/dev/null 2>&1
  python3 - "$OUT/$p.json" "$p" <<'P'
import json,sys;r=json.load(open(sys.argv[1]));c=r['categories'];a=r['audits']
print(sys.argv[2], *[f"{k}={round(v['score']*100)}" for k,v in c.items()],
 "LCP="+a['largest-contentful-paint']['displayValue'], "weight="+a['total-byte-weight']['displayValue'].replace('Total size was ',''))
P
done
