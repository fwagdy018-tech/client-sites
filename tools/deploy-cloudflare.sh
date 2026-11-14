#!/usr/bin/env bash
# Deploy a static site folder to Cloudflare Pages via the direct-upload API.
# Usage: deploy-site.sh <site-folder> <project-name>
# The API token is injected by the session proxy; no env var needed.
set -euo pipefail
DIR=${1:?site folder}; NAME=${2:?project name}
A=${CLOUDFLARE_ACCOUNT_ID:?set CLOUDFLARE_ACCOUNT_ID}
API=https://api.cloudflare.com/client/v4/accounts/$A/pages/projects

# Create the project if it does not exist yet
if ! curl -sSf "$API/$NAME" >/dev/null 2>&1; then
  curl -sS -X POST "$API" -H 'Content-Type: application/json' \
    -d "{\"name\":\"$NAME\",\"production_branch\":\"main\"}" | python3 -c 'import json,sys;r=json.load(sys.stdin);assert r["success"],r["errors"]'
fi

cd "$DIR"
args=(); manifest="{"; sep=""
while IFS= read -r -d '' f; do
  p=${f#./}; h=$(md5sum "$f" | cut -c1-32)
  manifest+="$sep\"/$p\":\"$h\""; sep=","
  args+=(-F "$h=@$f")
done < <(find . -type f ! -path './.git/*' ! -name '.DS_Store' -print0)
manifest+="}"

curl -sS -X POST "$API/$NAME/deployments" -F "manifest=$manifest" -F branch=main "${args[@]}" \
 | python3 -c 'import json,sys;r=json.load(sys.stdin);assert r["success"],r["errors"];print(r["result"]["url"])'
curl -sS "$API/$NAME" | python3 -c 'import json,sys;print("https://"+json.load(sys.stdin)["result"]["subdomain"])'
