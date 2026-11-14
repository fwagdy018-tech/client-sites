# Client websites — workflow

This repo holds the preview websites we build for clients. The owner talks in
Egyptian Arabic; reply in Egyptian Arabic, short and practical.

## Layout
- One folder per client at the repo root (e.g. `houston-car-salon/`), containing the
  final static site (the built `dist`, with `index.html` at the top).
- `tools/` — helper scripts. `index.html` / `robots.txt` at the root are placeholders.
- The repo is PUBLIC (needed for free GitHub Pages). Never commit passwords, API keys
  or private client data.

## Lifecycle of a client site
1. **Build or receive the site** (owner sends a ZIP or asks us to build it).
2. **Speed test before publishing**: `tools/speed-test.sh <folder>` (mobile Lighthouse,
   every page). Pass mark: performance ≥ 90 on every page. If lower, fix first
   (compress images to WebP, lazy-load, drop heavy libraries) and re-test. Report the
   numbers to the owner as a small table.
3. **Preview on GitHub Pages** (free): add the folder, commit, push to `main`. Link:
   `https://fwagdy018-tech.github.io/client-sites/<folder>/`.
   Replace any old Netlify / pages.dev URLs inside the files (canonical, og:, sitemap)
   with this link. Keep asset paths relative (no leading `/`).
4. Owner sends the link to the client.
5. **Client pays → custom domain on Cloudflare**: owner buys the domain on Cloudflare,
   we deploy the folder with `tools/deploy-cloudflare.sh <folder> <project-name>` and
   attach the domain to that Pages project (+ DNS record). Update URLs inside the site
   to the real domain.
6. **Client refuses → remove** the folder from this repo (and the Cloudflare project
   if one exists).
7. **Edits requested by a client**: edit the files in that client's folder, re-run the
   speed test, push. Same link updates in 1–2 minutes.

## Important facts
- `*.pages.dev` does NOT open in Egypt without a VPN. Never send a pages.dev link to
  a client; previews go on GitHub Pages. A custom domain on Cloudflare works fine.
- Netlify credits ran out — don't use Netlify.
- Cloudflare API token is injected by the session proxy for api.cloudflare.com (no env
  var). Set `CLOUDFLARE_ACCOUNT_ID` from the owner (it's in the dashboard URL).
  `wrangler pages deploy` fails here (its upload JWT gets overwritten by the proxy);
  use `tools/deploy-cloudflare.sh`, which uses the direct-upload API.
- From this sandbox the live github.io / pages.dev sites can't be fetched; test files
  locally, and ask the owner to check the live link on mobile data.
- New repos and GitHub Pages settings must be done by the owner (not allowed here).

## Clients
| Client | Folder | Status |
|---|---|---|
| Houston Car Salon | `houston-car-salon/` | Preview live on GitHub Pages; works from Egypt |
| All in the Details Auto Salon (Central Texas, mobile) | `all-in-the-details-auto-salon/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/all-in-the-details-auto-salon/` — rebuild there, then copy `dist/` here. |
| Recharged Mobile Detailing LLC (Amarillo TX, mobile) | `recharged-mobile-detailing/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/recharged-mobile-detailing/`; rebuild there, then copy `dist/` here. Mobile Lighthouse perf 92–99. |
| Khan Auto Detailing | — | Was on Netlify; files on owner's PC, ZIP not sent yet |
| Bridestein (confirm spelling) | — | Was on Netlify; ZIP not sent yet |
