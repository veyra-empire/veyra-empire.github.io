# veyra-empire.github.io

GitHub Pages host for the `veyra-empire` org. Primary content: the VEYRA
EMPIRE script archive landing page at **https://veyra-empire.github.io/scripts/**.

All security-sensitive logic - Discord OAuth, Tiers sheet lookup, GitHub PAT,
script delivery - lives in the Apps Script proxy (`veyra-empire-proxy/`).
This repo holds only the public landing UI.

## Layout

```
/
├── .nojekyll          ← disable Jekyll processing org-wide
├── README.md
└── scripts/           ← https://veyra-empire.github.io/scripts/
    ├── index.html     UI shell (loading / sign-in / denied / scripts states)
    ├── app.js         Client: hash parsing, sessionStorage, fetch the JSON API, sort bar
    └── style.css      Styling (lifted from the original Apps Script Install.html)
```

Future org-wide pages can go elsewhere in the tree - e.g. a root `index.html`
for `https://veyra-empire.github.io/`.

## Architecture (one-liner)

Pages constructs the Discord authorize URL client-side and navigates the
user to Discord. Discord redirects back to Pages with `?code=&state=`.
`app.js` validates the state (stored in `sessionStorage`) and fires a single
JSONP call to `<proxy>/exec?api=oauth-exchange&code=...`; the response
bundles session id + identity + tier + scripts list. Pages stashes it in
`sessionStorage` and renders. No cookies, no CORS, no trips through
`script.google.com` in the browser URL bar.

## Updating

Edit `scripts/app.js`, `scripts/index.html`, or `scripts/style.css`, commit,
push. Pages redeploys within ~30 seconds.

`scripts/app.js` contains a `PROXY_URL` constant pointing at the Apps Script
`/exec` deployment - rotate this if the deployment URL ever changes.

## Adding a Discussion link to a script

Each script card on the archive page can show a "Discussion ->" link
pointing at its Discord forum thread (or any other URL you want members to
see for more info). The data lives in the manifest, not in this repo.

1. Open the manifest on GitHub:
   https://github.com/veyra-empire/scripts/blob/master/manifest.json
2. Click the pencil (Edit) icon.
3. Add a `"threadUrl"` field to the script's entry:
   ```json
   "scripts": {
     "havoc": {
       "path": "havoc/havoc.user.js",
       "name": "Havoc Autobattle",
       "author": "lmv",
       "description": "...",
       "minTier": "tester",
       "threadUrl": "https://discord.com/channels/<guild-id>/<thread-id>"
     }
   }
   ```
4. Commit directly to `master` (e.g. "add thread link for havoc").

Propagation time: up to 10 minutes (the proxy caches the manifest for 10 min).
To apply immediately, run `_clearMembershipCache()` in the Apps Script editor.
Members already signed in see the new link on their next sign-in
(sessionStorage caches their script list until they sign out / tab-close).

No re-deploy of the proxy or this repo is needed - manifest edits are
live data, not code.

Omit `threadUrl` (or leave it empty) to suppress the link on that card.
