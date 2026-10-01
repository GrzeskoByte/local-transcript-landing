# Local Transcriber — landing page

Static site, no build step, no dependencies: `index.html` + `styles.css` + `app.js` + `assets/`.
App repo: [GrzeskoByte/local-transcript](https://github.com/GrzeskoByte/local-transcript).

## Preview

    python3 -m http.server 8765    # then open http://127.0.0.1:8765

(Use a server rather than file:// so the self-hosted fonts load.)

## Downloads / binaries

The download section reads the app repo's **GitHub Releases** live
(`api.github.com/repos/GrzeskoByte/local-transcript/releases`). Each version is
published as one release per platform by the app's `release.yml` workflow:

| Release tag | Files |
| --- | --- |
| `v<ver>-windows` | `LocalTranscriber_<ver>_windows_{x64,arm64}-setup.exe`, `_windows_x64.msi` |
| `v<ver>-macos` | `LocalTranscriber_<ver>_macos_{arm64,x64}.dmg` |
| `v<ver>-ubuntu` | `LocalTranscriber_<ver>_linux_{amd64,arm64}.{deb,AppImage,rpm}` |

The page merges them back into one entry per version and always shows the newest
one: the version number, hero button and file list all come from the API on every
visit, so publishing a release updates the site with no change here. Other tags
(the app's `updater` release that holds `latest.json`) and non-installer files
(`.sig`, `SHA256SUMS.txt`) are ignored. While a new version is still building for
some platforms, each platform falls back to its newest release that has files.
Draft releases are not visible to the API, so they don't show up until published.

If GitHub is unreachable or rate-limited (60 unauthenticated requests/hour per
IP), the buttons link to GitHub Releases instead. Nothing is stored on the
visitor's device — see `privacy.html`.

## Analytics

`index.html` loads Vercel Web Analytics and Speed Insights from
`/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js`. Both scripts
exist only on Vercel deployments, and only after **Analytics** and
**Speed Insights** are enabled in the Vercel project; elsewhere (local preview,
other hosts) they 404 harmlessly.

## Legal pages

`privacy.html` (privacy policy, GDPR/LOPDGDD) and `legal.html` (aviso legal, LSSI-CE
art. 10) are bilingual (English/Spanish) and linked from the footer. The owner's
details are the highlighted `[FULL NAME]`, `[NIF/NIE]`, `[POSTAL ADDRESS]` and
`[CONTACT EMAIL]` placeholders in both files. If the site starts collecting
anything new (cookies, localStorage, forms, other third-party scripts), update
`privacy.html` first.

## Deploy

Any static host: GitHub Pages, Netlify, Cloudflare Pages — serve the folder as-is.
