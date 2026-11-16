# Client websites â€” workflow

This repo holds the preview websites we build for clients. The owner talks in
Egyptian Arabic; reply in Egyptian Arabic, short and practical.

## Layout
- One folder per client at the repo root (e.g. `houston-car-salon/`), containing the
  final static site (the built `dist`, with `index.html` at the top).
- `tools/` â€” helper scripts. `index.html` / `robots.txt` at the root are placeholders.
- The repo is PUBLIC (needed for free GitHub Pages). Never commit passwords, API keys
  or private client data.

## Lifecycle of a client site
1. **Build or receive the site** (owner sends a ZIP or asks us to build it).
2. **Speed test before publishing**: `tools/speed-test.sh <folder>` (mobile Lighthouse,
   every page). Pass mark: performance â‰¥ 90 on every page. If lower, fix first
   (compress images to WebP, lazy-load, drop heavy libraries) and re-test. Report the
   numbers to the owner as a small table.
3. **Preview on GitHub Pages** (free): add the folder, commit, push to `main`. Link:
   `https://fwagdy018-tech.github.io/client-sites/<folder>/`.
   Replace any old Netlify / pages.dev URLs inside the files (canonical, og:, sitemap)
   with this link. Keep asset paths relative (no leading `/`).
4. Owner sends the link to the client.
5. **Client pays â†’ custom domain on Cloudflare**: owner buys the domain on Cloudflare,
   we deploy the folder with `tools/deploy-cloudflare.sh <folder> <project-name>` and
   attach the domain to that Pages project (+ DNS record). Update URLs inside the site
   to the real domain.
6. **Client refuses â†’ remove** the folder from this repo (and the Cloudflare project
   if one exists).
7. **Edits requested by a client**: edit the files in that client's folder, re-run the
   speed test, push. Same link updates in 1â€“2 minutes.

## Important facts
- `*.pages.dev` does NOT open in Egypt without a VPN. Never send a pages.dev link to
  a client; previews go on GitHub Pages. A custom domain on Cloudflare works fine.
- Netlify credits ran out â€” don't use Netlify.
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
| All in the Details Auto Salon (Central Texas, mobile) | `all-in-the-details-auto-salon/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/all-in-the-details-auto-salon/` â€” rebuild there, then copy `dist/` here. |
| Recharged Mobile Detailing LLC (Amarillo TX, mobile) | `recharged-mobile-detailing/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/recharged-mobile-detailing/`; rebuild there, then copy `dist/` here. Mobile Lighthouse perf 92â€“99. |
| Khan Auto Detailing (Houston, mobile) | `khan-auto-detailing/` | Moved from Netlify to GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/khan-auto-detailing/`; rebuild there, then copy `dist/` here. |
| Predestined Mobile Detailing (Houston) | `predestined-mobile-detailing/` | Moved from Netlify to GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/predestined-mobile-detailing/`; rebuild there, then copy `dist/` here. |
| ONYX Carwash & Detail by Jose Luis (McAllen / Pharr TX, mobile) | `onyx-carwash-detail/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/onyx-carwash-detail/`; rebuild there, then copy `dist/` here. Mobile Lighthouse perf 91-97. |
| Brazos Valley Mobile Detailing, LLC (Grimes County / Brazos Valley TX, mobile) | `brazos-valley-mobile-detailing/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/brazos-valley-mobile-detailing/`; rebuild there, then copy `dist/` here. Mobile Lighthouse perf 93-100. |
| Mike's Mobile Detail Carwash (El Paso TX, mobile) | `mikes-mobile-detail-carwash/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/mikes-mobile-detail-carwash/`; rebuild there, then copy `dist/` here. Mobile Lighthouse perf 90-97. |
| Simple Shine Mobile Detailing (Rio Grande Valley TX, mobile) | `simple-shine-mobile-detailing/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/simple-shine-mobile-detailing/`; rebuild there, then copy `dist/` here. Mobile Lighthouse perf 91-98. |
| Alaniz Detailing (Victoria TX) | `alaniz-detailing/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/alaniz-detailing/`; rebuild there, then copy `dist/` here. Mobile Lighthouse perf 94-100. |
| Perales Mobile Detailing (Houston TX, mobile) | `perales-mobile-detailing/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/perales/`; rebuild there, then copy `dist/` here. Mobile Lighthouse perf 93-100. |
| Isaiah's Auto Detailing (Houston TX, mobile) | `isaiahs-auto-detailing/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/isaiahs/`; rebuild there, then copy `dist/` here. Google 5.0 / 67 reviews. Mobile Lighthouse perf 98-100. |
| Franco's Auto Detailing (Robinson/Waco TX, mobile) | `francos-auto-detailing/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/franco/`; rebuild there, then copy `dist/` here. Mobile Lighthouse perf 93-100. |
| Grant Mobile Detail (Fort Worth/Arlington TX, mobile) | `grant-mobile-detail/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/grant/`; rebuild there, then copy `dist/` here. Google 4.9 / 63 reviews. Mobile Lighthouse perf 97-100. |
| MBK Details (Edinburg TX, shop & mobile) | `mbk-details/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/mbk-details/`; rebuild there, then copy `dist/` here. Google 4.9 / 54 reviews. Mobile Lighthouse perf 91-100. |
| Perales Mobile Detailing (Houston TX, mobile) | `perales-mobile-detailing/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/perales/`; rebuild there, then copy `dist/` here. Mobile Lighthouse perf 93-100. |
| AEN Details (Eagle Pass TX) | `aen-details/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/aen-details/`; rebuild there, then copy `dist/` here. Google 5.0 / 50 reviews. Mobile Lighthouse perf 93-100. |
| Lance Quillin Window Tinting (Sachse / Dallas TX) | `lance-quillin/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/lance-quillin/`; rebuild there, then copy `dist/` here. Google 4.9 / 46 reviews. Mobile Lighthouse perf 95-99. |
| 903 Mobile Detailing and Pressure Washing (Gilmer / East Texas TX) | `903-mobile-detailing/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/903-mobile-detailing/`; rebuild there, then copy `dist/` here. Google 5.0 / 32 reviews, Best of East Texas 2026. Mobile Lighthouse perf 93-99. |
| The Reflect Lab - Mobile Auto Detailing & Steam Cleaning (McAllen / RGV TX) | `reflect-lab/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/reflect-lab/`; rebuild there, then copy `dist/` here. Google 5.0 / 31 reviews. Mobile Lighthouse perf 96-99, a11y 98-100. |
| Central Texas Detailing (Austin TX, mobile) | `central-texas-detailing/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/central-texas-detailing/`; rebuild there, then copy `dist/` here. Google 5.0 / 48 reviews. Mobile Lighthouse perf 93-100. |
| Detail Matters Co. LLC (Rockport TX, mobile) | `detail-matters/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/detail-matters/`; rebuild there, then copy `dist/` here. Google 5.0 / 48 reviews. Mobile Lighthouse perf 94-100. |
| NoFlaw Detailz (Dallas-Fort Worth TX) | `noflaw-detailz/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/noflaw-detailz/`; rebuild there, then copy `dist/` here. Google 5.0 / 38 reviews. Mobile Lighthouse perf 94-97. |
| MC Shine Mobile Detailing (Collin/Denton County TX, mobile) | `mc-shine/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/mc-shine/`; rebuild there, then copy `dist/` here. Google 5.0 / 37 reviews. Mobile Lighthouse perf 93-99. |
| Ic AutoDetailing (Fort Worth TX, mobile) | `ic-autodetailing/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/ic-autodetailing/`; rebuild there, then copy `dist/` here. Google 4.8 / 37 reviews. Mobile Lighthouse perf 95-100. |
| The Elite Detailing (Rio Grande Valley TX, mobile) | `the-elite-detailing/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/the-elite-detailing/`; rebuild there, then copy `dist/` here. Google 5.0 / 31 reviews. Mobile Lighthouse perf 95-99, a11y 98-100. |
| Gallardo's Auto Detail & Mobile Wash (Rio Grande Valley TX, mobile) | `gallardos-auto-detail/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/gallardo/`; rebuild there, then copy `dist/` here. Google 5.0 / 30 reviews. Mobile Lighthouse perf 97-99. |
| Esteban's Auto Detailing (Galveston County TX, mobile) | `estebans-auto-detailing/` | Preview on GitHub Pages (Nov 2026). Source + build tools on owner's PC in `khan-auto-detailing-website-v2/esteban/`; rebuild there, then copy `dist/` here. Google 5.0 / 31 reviews. Mobile Lighthouse perf 97-99, a11y 98-100. |
