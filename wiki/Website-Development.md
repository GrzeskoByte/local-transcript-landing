# Website Development

The landing page is a **static site with no build step and no dependencies**.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The whole landing page: markup, the inline SVG icon sprite, the Vercel analytics loaders |
| `styles.css` | Page styles, following `DESIGN.md` |
| `app.js` | Behavior: live GitHub Releases, OS/CPU detection, download panels, release history, download counter, showreel, copy buttons, scroll-spy navigation, download click events |
| `privacy.html`, `legal.html`, `legal.css` | Bilingual (EN/ES) legal pages, see [[Legal Pages]] |
| `assets/` | `logo.svg`, `og-image.jpg`, `showreel.mp4` + `showreel-poster.jpg`, `fonts/` |
| `vercel.json` | Clean URLs, cache headers, security headers |
| `DESIGN.md` | The design system, see [[Design System]] |
| `wiki/` | The source of this wiki, see [[Contributing to the Wiki]] |

## Run it locally

```sh
python3 -m http.server 8765
# open http://127.0.0.1:8765
```

Use a local server rather than opening the file directly (`file://`), so the GitHub Releases fetch works. Any static server will do (`npx serve`, `php -S`, …).

On localhost, `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js` return 404. That's expected; they only exist on Vercel.

## How `app.js` works

```
page load
 ├─ paint loading state (version "Latest", "Checking GitHub…")
 ├─ detect OS (userAgent / platform) and CPU arch
 │    (userAgentData high-entropy hints; WebGL renderer for Intel Macs)
 └─ fetch api.github.com/repos/GrzeskoByte/local-transcript/releases?per_page=100  (8 s timeout)
       ├─ ok   → parseReleases() → state.source = 'live'
       └─ fail → state.source = 'offline' (fallback links to GitHub Releases)
     → renderStatus() renderPlatform() renderHistory() renderCounter()
```

Main functions:

| Function | Role |
| --- | --- |
| `classify(name)` | Maps an asset file name to OS, arch, package kind and label. Ignores `.sig`, `.json`, `.txt`, `.tar.gz`, `.zip`, `.blockmap`. |
| `parseReleases(data)` | Merges the per-platform releases (`v1.2.3-windows`, `-macos`, `-ubuntu`) into one entry per version, sorted newest first by semver. Skips drafts and other tags. |
| `pick(assets, os)` | Chooses the recommended file: preferred package per OS (mac: dmg; win: exe → msi; linux: deb → AppImage → rpm), matching the visitor's arch |
| `latestFor(os)` | Newest stable release that has files for that OS (falls back while a new version is still building) |
| `INSTALL` | Install steps for each package kind |
| `trackDownload` | Sends the Vercel `Download` custom event (see [[Analytics and Download Counts]]) |
| `spy()` | Highlights the rail link for the section in view |

Nothing is stored in cookies, `localStorage` or anywhere else on the visitor's device.

## Deploy

Any static host works: **Vercel** (production, uses `vercel.json`), GitHub Pages, Netlify or Cloudflare Pages. Serve the folder as it is.

`vercel.json`:

- `cleanUrls: true` (so `/privacy` serves `privacy.html`; the footer links depend on it)
- `/assets/*` is cached for a year, `immutable`. **Change an asset's URL (e.g. `?v=3`) when you replace it**, as is done for the showreel.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and `X-Frame-Options: DENY` on every page

On another host, set up clean URLs yourself, or change the footer links to `privacy.html` / `legal.html`.

## Update checklist

- **New app release**: nothing to do. See [[Releases and Downloads]].
- **New showreel**: replace `assets/showreel.mp4` and the poster, and bump `?v=` in `index.html`.
- **New third-party script, cookie, form or storage**: update `privacy.html` first.
- **New design element**: follow [[Design System]].
- **Test** on desktop and on a phone-sized screen. Block `api.github.com` in DevTools to check the offline fallback.
