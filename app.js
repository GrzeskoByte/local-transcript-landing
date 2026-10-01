/* Local Transcriber — landing page behavior. No dependencies. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- toast + copy ---------- */
  const toast = $('#toast'); let toastT;
  function say(msg) { toast.textContent = msg; toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('on'), 1800); }
  async function copy(text, btn) {
    try { await navigator.clipboard.writeText(text); } catch {
      const ta = el('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ } ta.remove();
    }
    if (btn) { btn.classList.add('done'); btn.innerHTML = '<svg width="14" height="14"><use href="#i-check"/></svg>'; setTimeout(() => { btn.classList.remove('done'); btn.innerHTML = '<svg width="14" height="14"><use href="#i-copy"/></svg>'; }, 1500); }
    say('Copied to clipboard');
  }
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-copy]'); if (b) copy(b.dataset.copy, b); });

  /* ---------- showreel ---------- */
  const video = $('#reelVideo'), reelBox = $('#reelBox');
  $('#reelPlay').addEventListener('click', () => { video.controls = true; video.play(); reelBox.classList.add('playing'); });
  video.addEventListener('ended', () => { reelBox.classList.remove('playing'); video.controls = false; });

  /* =========================================================
     Downloads — live GitHub Releases, manifest fallback
     ========================================================= */
  const manifest = JSON.parse($('#manifest').textContent);
  const REPO = manifest.repo;
  const OS_META = {
    mac: { name: 'macOS', icon: 'i-apple', req: 'macOS 12 Monterey or later' },
    win: { name: 'Windows', icon: 'i-windows', req: 'Windows 10 or 11 · WebView2 (preinstalled)' },
    linux: { name: 'Linux', icon: 'i-linux', req: 'x86_64 or ARM64 · webkit2gtk-4.1' },
  };

  function classify(name) {
    if (/\.(sig|json|txt|blockmap)$/i.test(name) || /\.tar\.gz$/i.test(name) || /\.zip$/i.test(name)) return null; // updater bundles & metadata
    const arch = /aarch64|arm64/i.test(name) ? 'arm64' : /x64|x86_64|amd64/i.test(name) ? 'x64' : 'universal';
    const archLabel = { arm64: 'ARM64', x64: 'x64', universal: 'Universal' }[arch];
    let os, kind, label, ext;
    if (/\.dmg$/i.test(name)) { os = 'mac'; ext = 'dmg'; kind = 'dmg'; label = arch === 'arm64' ? 'Apple Silicon' : arch === 'x64' ? 'Intel' : 'Universal'; }
    else if (/\.msi$/i.test(name)) { os = 'win'; ext = 'msi'; kind = 'msi'; label = 'MSI package'; }
    else if (/\.exe$/i.test(name)) { os = 'win'; ext = 'exe'; kind = 'exe'; label = 'Installer'; }
    else if (/\.appimage$/i.test(name)) { os = 'linux'; ext = 'AppImage'; kind = 'appimage'; label = 'AppImage · any distro'; }
    else if (/\.deb$/i.test(name)) { os = 'linux'; ext = 'deb'; kind = 'deb'; label = 'Debian · Ubuntu · Mint'; }
    else if (/\.rpm$/i.test(name)) { os = 'linux'; ext = 'rpm'; kind = 'rpm'; label = 'Fedora · RHEL · openSUSE'; }
    else return null;
    return { os, arch, archLabel, kind, label, ext };
  }

  async function loadReleases() {
    try {
      const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 6000);
      const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=30`, { headers: { Accept: 'application/vnd.github+json' }, signal: ctl.signal });
      clearTimeout(to);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = (await res.json()).filter((r) => !r.draft);
      // Each version ships as one GitHub release PER PLATFORM (v1.2.3-windows,
      // v1.2.3-macos, v1.2.3-ubuntu); merge them back into one version here.
      const byVersion = new Map();
      for (const r of data) {
        const m = /^v?(\d+\.\d+\.\d+)(?:-(windows|macos|ubuntu))?$/.exec(r.tag_name);
        if (!m) continue;
        const version = m[1];
        const entry = byVersion.get(version) ?? { version, tag: 'v' + version, date: null, prerelease: false, live: true, notes: [], assets: [] };
        if (!entry.date || r.published_at > entry.date) entry.date = r.published_at;
        entry.prerelease = entry.prerelease || r.prerelease;
        entry.notes.push({ label: { windows: 'Windows', macos: 'macOS', ubuntu: 'Ubuntu' }[m[2]] ?? 'All platforms', url: r.html_url });
        for (const a of r.assets) {
          const c = classify(a.name);
          if (c) entry.assets.push({ name: a.name, size: a.size, url: a.browser_download_url, sha: (a.digest || '').replace(/^sha256:/, ''), downloads: a.download_count, ...c });
        }
        byVersion.set(version, entry);
      }
      const semver = (v) => v.split('.').map(Number);
      const rels = [...byVersion.values()].filter((r) => r.assets.length)
        .sort((a, b) => { const x = semver(a.version), y = semver(b.version); return y[0] - x[0] || y[1] - x[1] || y[2] - x[2]; });
      if (rels.length) return { rels, source: 'live' };
      return { rels: fromManifest(false), source: 'pending' };
    } catch {
      const published = manifest.releases.some((r) => r.published);
      return { rels: fromManifest(published), source: published ? 'offline' : 'pending' };
    }
  }
  function fromManifest(assumePublished) {
    const TAG = { win: 'windows', mac: 'macos', linux: 'ubuntu' };
    return manifest.releases.map((r) => ({
      version: r.version, tag: 'v' + r.version, date: r.date, prerelease: false, live: false, pending: !assumePublished && !r.published,
      notes: Object.entries({ windows: 'Windows', macos: 'macOS', ubuntu: 'Ubuntu' }).map(([t, label]) => ({ label, url: `https://github.com/${REPO}/releases/tag/v${r.version}-${t}` })),
      assets: r.assets.map((name) => ({ name, ...classify(name) })).filter((a) => a.os).map((a) => ({
        ...a, size: null, sha: '', url: `https://github.com/${REPO}/releases/download/v${r.version}-${TAG[a.os]}/${encodeURIComponent(a.name)}`,
      })),
    }));
  }

  // --- platform detection ---
  const ua = navigator.userAgent;
  let userOS = /Mac|iPhone|iPad/.test(navigator.platform || ua) || /Mac OS X/.test(ua) ? 'mac' : /Win/.test(navigator.platform || ua) ? 'win' : /Linux|X11|CrOS/.test(ua) ? 'linux' : 'mac';
  let userArch = /aarch64|arm64/i.test(ua) ? 'arm64' : userOS === 'mac' ? 'arm64' : 'x64';
  if (userOS === 'mac') { try { const gl = document.createElement('canvas').getContext('webgl'); const dbg = gl && gl.getExtension('WEBGL_debug_renderer_info'); const r = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : ''; if (/Intel/i.test(r)) userArch = 'x64'; } catch { /* keep default */ } }
  const archReady = navigator.userAgentData?.getHighEntropyValues?.(['architecture', 'bitness']).then((v) => { if (v.architecture === 'arm') userArch = 'arm64'; else if (v.architecture === 'x86') userArch = 'x64'; }).catch(() => {}) ?? Promise.resolve();

  const fmtSize = (b) => (b == null ? '' : b > 1e6 ? (b / 1048576).toFixed(1) + ' MB' : (b / 1024).toFixed(0) + ' KB');
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '');
  function pick(assets, os) {
    const list = assets.filter((a) => a.os === os);
    const pref = { mac: ['dmg'], win: ['exe', 'msi'], linux: ['deb', 'appimage', 'rpm'] }[os];
    const arch = os === userOS ? userArch : os === 'mac' ? 'arm64' : 'x64';
    for (const k of pref) { const m = list.find((a) => a.kind === k && a.arch === arch) || list.find((a) => a.kind === k && a.arch === 'x64') || list.find((a) => a.kind === k); if (m) return m; }
    return list[0];
  }
  const INSTALL = {
    dmg: (a) => [`Open <b>${esc(a.name)}</b> and drag the app into <b>Applications</b>.`, 'Launch it and click <b>Allow</b> when macOS asks for the microphone.', 'If macOS blocks the first launch: <b>System Settings → Privacy &amp; Security → Open Anyway</b>.'],
    exe: (a) => [`Run <b>${esc(a.name)}</b> — it installs in seconds.`, 'If SmartScreen appears, choose <b>More info → Run anyway</b>.', 'Record your first meeting. Transcription is built in.'],
    msi: (a) => [`Double-click <b>${esc(a.name)}</b> (ideal for managed / Intune deployments).`, { code: `msiexec /i "${a.name}" /qn`, note: 'Silent install for IT.' }],
    appimage: (a) => ['Make it executable and run it — no install needed.', { code: `chmod +x ${a.name} && ./${a.name}` }],
    deb: (a) => [`Double-click <b>${esc(a.name)}</b> and choose <b>Install</b>.`, { code: `sudo apt install ./${a.name}`, note: 'Or from a terminal:' }],
    rpm: (a) => ['Install with dnf:', { code: `sudo dnf install ./${a.name}` }],
  };
  const codeBlock = (c) => `<div class="code">${esc(c)}<button class="copy" data-copy="${esc(c)}" aria-label="Copy command"><svg width="14" height="14"><use href="#i-copy"/></svg></button></div>`;

  let state = { rels: [], source: 'pending', os: userOS, filter: 'all' };

  function renderPlatform() {
    const rel = state.rels[0]; const os = state.os; const meta = OS_META[os];
    $$('.os-tab').forEach((t) => { const on = t.dataset.os === os; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; const you = $('.you', t); if (t.dataset.os === userOS && !you) t.insertAdjacentHTML('beforeend', '<span class="you">you</span>'); });
    const a = pick(rel.assets, os); const pending = rel.pending;
    const steps = a ? (INSTALL[a.kind] || (() => []))(a) : [];
    $('#primaryDl').innerHTML = `
      <div class="os-name"><svg><use href="#${meta.icon}"/></svg><div><h3>${meta.name}</h3><p class="req">${meta.req}</p></div></div>
      ${a ? `<a class="btn btn-lg btn-primary" ${pending ? `href="#build" aria-disabled="false" data-pending="1"` : `href="${a.url}"`}>
          <svg width="20" height="20"><use href="#i-dl"/></svg>${pending ? 'Release in preparation' : `Download ${a.label === 'Installer' ? 'installer' : a.label}`}
          <span class="sub">${esc(a.ext)}${a.size ? ' · ' + fmtSize(a.size) : ''}</span></a>
        <div class="fname">${esc(a.name)}</div>` : '<p class="req">No build for this platform yet.</p>'}
      <ol class="install-steps">${steps.map((s) => `<li><div>${typeof s === 'string' ? s : `${s.note ? `${esc(s.note)}` : ''}${codeBlock(s.code)}`}</div></li>`).join('')}</ol>`;
    const pb = $('#primaryDl [data-pending]'); if (pb) pb.addEventListener('click', (e) => { e.preventDefault(); $('#build').scrollIntoView({ block: 'start' }); });

    const list = rel.assets.filter((x) => x.os === os);
    $('#binTable').innerHTML = `<h4><span>${meta.name} binaries · v${esc(rel.version)}</span><span>${list.length} files</span></h4>` + list.map((x) => `
      <div class="bin">
        <div>
          <div class="nm"><strong>${esc(x.label)}</strong><span class="ext">.${esc(x.ext)}</span><span class="arch">${x.archLabel}</span>${a && x.name === a.name ? '<span class="rec">Recommended</span>' : ''}</div>
          <div class="meta"><span>${esc(x.name)}</span>${x.size ? `<span>${fmtSize(x.size)}</span>` : ''}${x.sha ? `<span class="sha">sha256:${x.sha.slice(0, 12)}… <button class="copy" data-copy="${x.sha}" aria-label="Copy SHA-256"><svg width="12" height="12"><use href="#i-copy"/></svg></button></span>` : ''}</div>
        </div>
        ${pending ? `<span class="btn btn-sm" aria-disabled="true">Soon</span>` : `<a class="btn btn-sm" href="${x.url}" aria-label="Download ${esc(x.name)}"><svg width="15" height="15"><use href="#i-dl"/></svg>Download</a>`}
      </div>`).join('');
    $('#shaCmd').textContent = os === 'win' ? 'certutil -hashfile <file> SHA256' : os === 'mac' ? 'shasum -a 256 <file>' : 'sha256sum <file>';
    $('#backendHint').innerHTML = os === 'mac' ? 'whisper.cpp ships inside the app, GPU-accelerated with Metal. The speech model downloads once, on your first transcription.' : 'whisper.cpp ships inside the app. The speech model downloads once (~550 MB), on your first transcription.';
  }

  const osIcon = (os) => `<span class="plat"><svg><use href="#${OS_META[os].icon}"/></svg>${OS_META[os].name}</span>`;
  function renderHistory() {
    const f = state.filter;
    $('#releases').innerHTML = state.rels.map((r, i) => {
      const assets = r.assets.filter((a) => f === 'all' || a.os === f).sort((a, b) => 'mac win linux'.indexOf(a.os) - 'mac win linux'.indexOf(b.os));
      return `<details class="release" ${i === 0 ? 'open' : ''}>
        <summary><span class="v">v${esc(r.version)}</span>${i === 0 ? '<span class="latest">Latest</span>' : ''}${r.prerelease ? '<span class="pre">Pre-release</span>' : ''}${r.pending ? '<span class="pre">In preparation</span>' : ''}<span class="date">${fmtDate(r.date)}</span><span class="count">${assets.length} binaries</span></summary>
        <table class="matrix"><thead><tr><th>Platform</th><th>Package</th><th>Arch</th><th>File</th><th>Size</th><th></th></tr></thead><tbody>
        ${assets.map((a) => `<tr><td>${osIcon(a.os)}</td><td>${esc(a.label)}</td><td class="s">${a.archLabel}</td><td class="f">${esc(a.name)}</td><td class="s">${fmtSize(a.size) || '—'}</td>
          <td class="a">${r.pending ? '<span class="btn btn-sm" aria-disabled="true">Soon</span>' : `<a class="btn btn-sm" href="${a.url}"><svg width="14" height="14"><use href="#i-dl"/></svg>Get</a>`}</td></tr>`).join('')}
        </tbody></table>
        <div class="rel-notes">Release notes: ${r.notes.map((n) => `<a href="${n.url}" target="_blank" rel="noopener">${n.label} →</a>`).join(' · ')}</div>
      </details>`;
    }).join('');
  }

  function renderStatus() {
    const rel = state.rels[0];
    $('#relVer').textContent = 'v' + rel.version; $('#heroVer').textContent = 'v' + rel.version;
    $('#relDot').classList.toggle('pending', !!rel.pending);
    $('#relDate').textContent = rel.pending ? 'First release in preparation' : rel.date ? `Latest release · ${fmtDate(rel.date)}` : 'Latest release';
    const note = $('#dlNote');
    if (state.source === 'pending') {
      note.hidden = false;
      note.innerHTML = `<svg width="18" height="18"><use href="#i-warn"/></svg><span>The first public build is being prepared. The list below shows the exact binaries each release ships. Until it's live, <a href="#build" id="noteBuild">build from source</a> or <a href="https://github.com/${REPO}/releases" target="_blank" rel="noopener">watch releases on GitHub</a>.</span>`;
      $('#noteBuild').addEventListener('click', (e) => { e.preventDefault(); $('#build').scrollIntoView({ block: 'start' }); });
    } else if (state.source === 'offline') {
      note.hidden = false;
      note.innerHTML = `<svg width="18" height="18"><use href="#i-warn"/></svg><span>Couldn't reach GitHub for live release data — showing the bundled release list. <a href="https://github.com/${REPO}/releases" target="_blank" rel="noopener">Open GitHub Releases</a>.</span>`;
    } else note.hidden = true;
    const a = pick(rel.assets, userOS);
    const label = `Download for ${OS_META[userOS].name}`;
    $('#heroDlText').textContent = rel.pending ? `Get it for ${OS_META[userOS].name}` : label;
    if (a && !rel.pending) { $('#heroDl').href = a.url; $('#finalDl').href = a.url; $('#finalDl').lastChild.textContent = label; }
  }

  $$('.os-tab').forEach((t) => t.addEventListener('click', () => { state.os = t.dataset.os; renderPlatform(); }));
  $('#osTabs').addEventListener('keydown', (e) => {
    const order = ['mac', 'win', 'linux']; const i = order.indexOf(state.os);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { state.os = order[(i + (e.key === 'ArrowRight' ? 1 : 2)) % 3]; renderPlatform(); $(`#tab-${state.os}`).focus(); e.preventDefault(); }
  });
  $$('#platFilter button').forEach((b) => b.addEventListener('click', () => { state.filter = b.dataset.f; $$('#platFilter button').forEach((x) => x.setAttribute('aria-pressed', x === b)); renderHistory(); }));

  // first paint from the manifest, then upgrade with live data
  state.rels = fromManifest(manifest.releases.some((r) => r.published)); state.source = state.rels[0].pending ? 'pending' : 'offline';
  const paint = () => { renderStatus(); renderPlatform(); renderHistory(); };
  paint();
  Promise.all([loadReleases(), archReady]).then(([r]) => { state.rels = r.rels; state.source = r.source; paint(); });
})();
