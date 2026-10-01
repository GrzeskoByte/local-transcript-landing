# Local Transcriber — landing page

Static site, no build step, no dependencies: `index.html` + `styles.css` + `app.js` + `assets/`.
App repo: [GrzeskoByte/local-transcript](https://github.com/GrzeskoByte/local-transcript).

## Preview

    python3 -m http.server 8765    # then open http://127.0.0.1:8765

(Use a server rather than file:// so the GitHub Releases fetch works.)

Visual design follows `DESIGN.md` (catalog-era 1996 style, system fonts only).

## Downloads / binaries

The download section reads the app repo's **GitHub Releases** live
(`api.github.com/repos/GrzeskoByte/local-transcript/releases`). Each version is
published as one release per platform by the app's `release.yml` workflow:

| Release tag | Files |
| --- | --- |
| `v<ver>-windows` | `LocalTranscriber_<ver>_windows_{x64,arm64}-setup.exe`, `_windows_x64.msi` |
| `v<ver>-macos` | `LocalTranscriber_<ver>_macos_{arm64,x64}.dmg` |
| `v<ver>-ubuntu` | `LocalTranscriber_<ver>_linux_{amd64,arm64}.{deb,AppImage,rpm}` |

The page merges them back into one entry per version, recommends the right file
for the visitor's OS/arch, and shows sizes and SHA-256 digests. Draft releases are
not visible to the API, so the page shows "in preparation" until they are published.

If the API is unreachable it falls back to the inline `<script id="manifest">` in
`index.html` (same file names). Set `"published": true` there once a version is live.

## Deploy

Any static host: GitHub Pages, Netlify, Cloudflare Pages — serve the folder as-is.
