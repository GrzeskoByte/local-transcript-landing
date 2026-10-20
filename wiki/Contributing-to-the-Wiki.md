# Contributing to the Wiki

The source of this wiki lives in the **`wiki/` folder** of the [website repository](https://github.com/GrzeskoByte/local-transcript-landing). That way, changes are reviewed in pull requests like any other change.

```
wiki/
  Home.md                 ← wiki front page
  _Sidebar.md, _Footer.md ← navigation shown on every page
  <Page-Name>.md          ← one file per page ("Page-Name" → [[Page Name]])
  images/                 ← screenshots referenced as images/<file>.png
```

## Publishing

The workflow `.github/workflows/wiki-sync.yml` copies `wiki/` into the GitHub wiki every time `main` changes under `wiki/` (you can also run it by hand from **Actions → Sync wiki**).

**One-time setup:** GitHub creates the wiki repository only after the first page exists. Open the repository's **Wiki** tab, click **Create the first page**, and save anything. The next sync replaces it.

To publish by hand instead:

```sh
git clone https://github.com/GrzeskoByte/local-transcript-landing.wiki.git
rsync -a --delete --exclude .git wiki/ local-transcript-landing.wiki/
cd local-transcript-landing.wiki && git add -A && git commit -m "Update wiki" && git push
```

## Writing pages

- Link to pages with `[[Page Name]]` or `[[Page Name#section]]`.
- Show images with `![alt text](images/file.png)`.
- Keep the user manual true to the **current app**. When app behavior changes, update the page and its screenshot.

## Refreshing screenshots

Website screenshots come from the local preview (`python3 -m http.server 8765`). App screenshots come from the app's browser build (`npm run build && npx vite preview` in the app repository), with sample meetings. Use a 1440×900 window, and 390×844 for phone shots.
