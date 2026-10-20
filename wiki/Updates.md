# Updates

You install Local Transcriber once. After that, new versions install from inside the app.

## How it works

1. The app asks GitHub whether a newer version exists. It does this when you click **Check for updates** in **Settings → App → Updates**, and on every launch if you turn on *Check for updates when the app starts*. It sends nothing about you.
2. When an update is available, a notice appears in the sidebar.
3. Click **Update & restart**. The app downloads the update, **verifies its signature**, installs it and restarts.

Updates never install without your click. **Installing is paused while you're recording or transcribing.**

## Platform notes

| Install type | In-app update |
| --- | --- |
| Windows (`-setup.exe`) | ✅ Updates itself |
| macOS (`.dmg`) | ✅ Updates itself |
| Linux AppImage | ✅ Updates itself |
| Linux `.deb` / `.rpm` | ⬇️ Shows a **Download** button. Install the new package as described in [[Installation#linux]]. |

Versions before **0.1.2** don't have the updater yet. Install a newer version by hand once.

## Manual update

You can always download the newest installer from the website or [GitHub Releases](https://github.com/GrzeskoByte/local-transcript/releases) and install it over the old version. Your meetings and settings are kept.
