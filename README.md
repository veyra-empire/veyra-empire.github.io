# veyra-empire/scripts-site

Static GitHub Pages site that serves the VEYRA EMPIRE script archive landing
page (`https://veyra-empire.github.io/scripts-site/`, eventually
`https://scripts.veyra-empire.com/`).

All security-sensitive logic — Discord OAuth, Tiers sheet lookup, GitHub PAT,
script delivery — stays in the Apps Script proxy (`veyra-empire-proxy/`).
This repo holds only the public landing UI.

## Files

- `index.html` — UI shell (loading / sign-in / denied / scripts states)
- `app.js`     — client logic: hash parsing, sessionStorage, fetch the JSON API, sort bar
- `style.css`  — styling, lifted from the original Apps Script `Install.html`
- `.nojekyll`  — opt out of Jekyll processing on Pages

## Architecture (one-liner)

`Pages → fetch(/exec?api=…) → Apps Script JSON → render`. OAuth callback lands
on Apps Script, which redirects back here with `#session=<sid>` in the hash.
The hash is read by `app.js`, stashed in `sessionStorage`, and used to fetch
the scripts list. No cookies, no CORS preflight.

## Setup

1. Create the repo:
   ```
   gh repo create veyra-empire/scripts-site --public \
     --description "VEYRA EMPIRE script archive landing page"
   ```
2. Push these files to `master`.
3. **Edit `app.js`** — replace `PROXY_URL` placeholder with the real Apps
   Script `/exec` URL (find it in the proxy's deployment settings).
4. Repo → Settings → Pages → Source: "Deploy from a branch" → branch `master` /
   root → Save.
5. (Optional) Custom domain: add a `CNAME` DNS record `scripts` →
   `veyra-empire.github.io`, then in Pages settings set custom domain to
   `scripts.veyra-empire.com` and enforce HTTPS. After it's live, update
   `PAGES_BASE_URL` in `veyra-empire-proxy/Code.gs` to match.

## Verification

1. Visit the Pages URL — Sign-in-with-Discord button renders.
2. Click sign in → bounce through Discord → bounce through Apps Script `/exec`
   → land back on the Pages site with the scripts grid populated.
3. DevTools: install-button `href` is `<proxy>/exec/<id>.user.js?s=<id>&session=<sid>`
   — no email/token in the URL.
4. Wait 30+ minutes, reload — `?api=session` returns `{error:"expired"}` and
   the page falls back to the sign-in landing.
