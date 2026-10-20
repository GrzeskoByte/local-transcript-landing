# Local Transcriber — landing page

Live at **https://transcript.sierock.com** (Vercel).

Static site, no build step, no dependencies: `index.html` + `styles.css` + `app.js` + `assets/`.
App repo: [GrzeskoByte/local-transcript](https://github.com/GrzeskoByte/local-transcript).

## Preview

    python3 -m http.server 8765    # then open http://127.0.0.1:8765

(Use a server rather than file:// so the GitHub Releases fetch works.)

Visual design follows `DESIGN.md` (catalog-era 1996 style, system fonts only).

## Wiki

`wiki/` holds the GitHub wiki: the app's user manual and this site's docs, with
screenshots in `wiki/images/`. `.github/workflows/wiki-sync.yml` publishes it to the
repo's Wiki on every push to `main` that touches `wiki/` (create any first page in the
Wiki tab once so GitHub creates the wiki repo). See `wiki/Contributing-to-the-Wiki.md`.

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

### Download counts

Two sources, because not every download goes through this site:

- **Clicks on this site** — `app.js` sends a Vercel custom event `Download` with
  `file` (asset name, e.g. `LocalTranscriber_1.2.0_macos_arm64.dmg`, or
  `GitHub Releases page` for the fallback links) and `from` (`hero`,
  `recommended`, `file-list`, `release-history`, `footer-cta`, `fallback`,
  `other`). See it under **Analytics → Events** in Vercel. Custom events need a
  Vercel Pro (or Enterprise) plan; on Hobby the call is silently dropped.
- **Every download, from any source** (this site, someone linking GitHub
  directly, the in-app updater) — GitHub's per-file `download_count`, which is
  the complete total:

      curl -s 'https://api.github.com/repos/GrzeskoByte/local-transcript/releases?per_page=100' \
        | jq -r '.[] | .assets[] | "\(.download_count)\t\(.name)"' | sort -rn

  The **Download counter** in the download section shows this live: the sum of
  `download_count` over every installer (`.dmg`, `.exe`, `.msi`, `.AppImage`,
  `.deb`, `.rpm`) of every release. Updater bundles and metadata (`latest.json`,
  `.sig`) are left out, so update checks don't inflate it. It is hidden if
  GitHub can't be reached.

Neither adds cookies or device storage, and both are disclosed in `privacy.html`
§2.2–2.3. The desktop app itself stays telemetry-free.

## Legal pages

`privacy.html` (privacy policy, GDPR/LOPDGDD) and `legal.html` (aviso legal, LSSI-CE
art. 10) are bilingual (English/Spanish) and linked from the footer. Owner name and
contact email appear in both files. If the site starts collecting
anything new (cookies, localStorage, forms, other third-party scripts), update
`privacy.html` first.

## Deploy

Any static host: GitHub Pages, Netlify, Cloudflare Pages — serve the folder as-is.
