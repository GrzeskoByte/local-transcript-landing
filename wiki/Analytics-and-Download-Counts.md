# Analytics and Download Counts

The **desktop app has no telemetry**. The **website** uses two cookieless sources, both described in `privacy.html` §2.2–2.3.

## Vercel Web Analytics and Speed Insights

`index.html` loads `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js`. They only exist on Vercel deployments, after **Analytics** and **Speed Insights** are turned on in the Vercel project. Anywhere else they return a harmless 404.

### Download click events

`app.js` sends a custom event, `Download`, when a visitor clicks a download link:

| Property | Values |
| --- | --- |
| `file` | The asset name (e.g. `LocalTranscriber_1.2.0_macos_arm64.dmg`), or `GitHub Releases page` for fallback links |
| `from` | `hero`, `recommended`, `file-list`, `release-history`, `footer-cta`, `fallback`, `other` |

Find it in Vercel under **Analytics → Events**. Custom events need a Vercel **Pro** (or Enterprise) plan. On Hobby, the call is silently dropped. Middle-clicks are counted too.

## GitHub download counts (complete total)

Not every download goes through the website: people link to GitHub directly, and the in-app updater downloads from GitHub too. GitHub's per-file `download_count` covers them all:

```sh
curl -s 'https://api.github.com/repos/GrzeskoByte/local-transcript/releases?per_page=100' \
  | jq -r '.[] | .assets[] | "\(.download_count)\t\(.name)"' | sort -rn
```

### The download counter on the page

![Download counter](images/landing-download-counter.png)

This adds up `download_count` for every **installer** (`.dmg`, `.exe`, `.msi`, `.AppImage`, `.deb`, `.rpm`) in every release, plus the macOS update bundles (`.app.tar.gz`). So it counts installs **and** in-app updates on every platform: Windows and the AppImage update by re-downloading the installer itself, and macOS downloads the `.app.tar.gz`. GitHub keeps one count per file, so installs and updates can't be told apart. Update checks (`latest.json`) and signatures (`.sig`) are left out. The counter is hidden when GitHub can't be reached.

Neither source sets cookies or stores anything on the visitor's device.
