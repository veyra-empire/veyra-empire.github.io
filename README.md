# veyra-empire.github.io

GitHub Pages host for the `veyra-empire` org. Primary content: the VEYRA
EMPIRE script archive landing page at **https://veyra-empire.github.io/scripts/**.

All security-sensitive logic — Discord OAuth, Tiers sheet lookup, GitHub PAT,
script delivery — lives in the Apps Script proxy (`veyra-empire-proxy/`).
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

Future org-wide pages can go elsewhere in the tree — e.g. a root `index.html`
for `https://veyra-empire.github.io/`.

## Architecture (one-liner)

`Pages → fetch(/exec?api=…) → Apps Script JSON → render`. OAuth callback lands
on Apps Script, which redirects back here with `#session=<sid>` in the hash.
The hash is read by `app.js`, stashed in `sessionStorage`, and used to fetch
the scripts list. No cookies, no CORS preflight.

## Updating

Edit `scripts/app.js`, `scripts/index.html`, or `scripts/style.css`, commit,
push. Pages redeploys within ~30 seconds.

`scripts/app.js` contains a `PROXY_URL` constant pointing at the Apps Script
`/exec` deployment — rotate this if the deployment URL ever changes.
