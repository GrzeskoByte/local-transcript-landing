/* Local Transcriber — landing page behavior. No dependencies. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- toast + copy ---------- */
  const toast = $('#toast'); let toastT;
  function say(msg) { toast.textContent = msg; toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('on'), 1800); }
  async function copy(text, btn) {
    try { await navigator.clipboard.writeText(text); } catch {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ } ta.remove();
    }
    if (btn) {
      const label = btn.dataset.label || btn.textContent; btn.dataset.label = label;
      btn.classList.add('ok'); btn.textContent = '[x] copied';
      setTimeout(() => { btn.classList.remove('ok'); btn.textContent = label; }, 1600);
    }
    say('Copied to clipboard');
  }
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-copy]'); if (b) copy(b.dataset.copy, b); });

  /* ---------- level meters (decor) ---------- */
  $$('[data-bars]').forEach((box) => {
    const two = box.dataset.bars === '2';
    for (let i = 0; i < 28; i++) {
      const s = document.createElement('span');
      s.style.animationDelay = (two ? ((i * 23 + 5) % 11) / 18 : ((i * 37) % 13) / 20) + 's';
      box.appendChild(s);
    }
  });

  /* ---------- hero halftone: drifting dot blobs that follow the pointer ---------- */
  (function halftone(cv) {
    if (!cv || !cv.getContext) return;
    const host = cv.parentElement, ctx = cv.getContext('2d');
    let seed = 11;
    const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const blobs = Array.from({ length: 6 }, () => ({ x: 0.45 + rnd() * 0.6, y: rnd(), rad: 0.07 + rnd() * 0.1, amp: 0.6 + rnd() * 0.5, ph: rnd() * 6.28, sp: 0.00006 + rnd() * 0.00008, ax: 0.03 + rnd() * 0.05, ay: 0.03 + rnd() * 0.05 }));
    const specks = Array.from({ length: 140 }, () => ({ x: rnd(), y: rnd(), r: 0.5 + rnd() * 1.3, ph: rnd() * 6.28 }));
    let W = 0, H = 0, last = 0, raf = 0, visible = true, color = '#d6336c';
    const ptr = { x: -9999, y: -9999, s: 0 };
    function size() { const r = host.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = Math.round(W * d); cv.height = Math.round(H * d); ctx.setTransform(d, 0, 0, d, 0, 0); draw(reducedMotion() ? 0 : performance.now()); }
    function draw(t) {
      const step = 8, area = Math.sqrt(W * H) || 1;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = color;
      ctx.beginPath();
      const pos = blobs.map((b) => ({ x: (b.x + Math.sin(t * b.sp + b.ph) * b.ax) * W, y: (b.y + Math.cos(t * b.sp * 1.3 + b.ph) * b.ay) * H, k: 1 / Math.pow(b.rad * area * 1.15, 2), a: b.amp }));
      if (ptr.s > 0.01) pos.push({ x: ptr.x, y: ptr.y, k: 1 / Math.pow(Math.min(W, H) * 0.16, 2), a: 1.1 * ptr.s });
      let row = 0;
      for (let y = 0; y < H + step; y += step * 0.87, row++) {
        for (let x = row % 2 ? step / 2 : 0; x < W + step; x += step) {
          let v = 0;
          for (const p of pos) { const dx = x - p.x, dy = y - p.y; v += p.a * Math.exp(-(dx * dx + dy * dy) * p.k); }
          // keep the area behind the headline and copy calm (all of it when the copy spans the width)
          if (x < (W < 700 ? W : 0.42 * W) && y > 0.12 * H) v *= 0.25;
          v -= 0.14;
          if (v <= 0) continue;
          const r = Math.pow(Math.min(1, v), 0.85) * step * 0.56; if (r < 0.45) continue;
          ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 6.2832);
        }
      }
      for (const p of specks) { const sx = p.x * W + Math.sin(t * 0.0002 + p.ph) * 6, sy = p.y * H; ctx.moveTo(sx + p.r, sy); ctx.arc(sx, sy, p.r, 0, 6.2832); }
      ctx.fill();
    }
    function loop(now) {
      raf = 0;
      if (!visible || reducedMotion()) return;
      if (now - last > 33) { last = now; ptr.s *= 0.965; draw(now); }
      raf = requestAnimationFrame(loop);
    }
    const start = () => { if (!raf && visible && !reducedMotion()) raf = requestAnimationFrame(loop); };
    const recolor = () => { color = getComputedStyle(document.documentElement).getPropertyValue('--pink-deep').trim() || '#d6336c'; draw(reducedMotion() ? 0 : performance.now()); };
    host.addEventListener('pointermove', (e) => { const r = host.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.s = Math.min(1, ptr.s + 0.12); });
    if (window.ResizeObserver) new ResizeObserver(size).observe(host); else addEventListener('resize', size);
    if (window.IntersectionObserver) new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }).observe(host);
    document.addEventListener('themechange', recolor);
    size(); recolor(); start();
  })($('#heroHt'));

  /* ---------- tour: the showreel, with phases following playback ---------- */
  const video = $('#reelVideo'), playBtn = $('#reelPlay'), phases = $$('#phases .phase');
  const sceneAt = $('#phases').dataset.at.split(',').map(Number); // phase i runs from sceneAt[i] to sceneAt[i + 1]
  function tourUpdate() {
    const t = video.currentTime || 0, d = video.duration || 15, playing = !video.paused && !video.ended;
    const finished = video.ended || t >= d - 0.05;
    phases.forEach((p, i) => { p.classList.toggle('done', finished || t >= sceneAt[i + 1]); p.classList.toggle('on', !finished && t >= sceneAt[i] && t < sceneAt[i + 1]); });
    $('#tourTime').textContent = '0:' + String(Math.floor(t)).padStart(2, '0');
    $('#tourBar').style.width = Math.min(100, (t / d) * 100) + '%';
    playBtn.textContent = playing ? '❚❚ Pause' : finished ? '↺ Replay' : '▶ Play';
    playBtn.setAttribute('aria-label', playing ? 'Pause the tour' : 'Play the tour');
  }
  const togglePlay = () => { if (video.paused || video.ended) video.play().catch(() => {}); else video.pause(); };
  playBtn.addEventListener('click', togglePlay);
  video.addEventListener('click', togglePlay);
  ['play', 'pause', 'ended', 'timeupdate', 'loadedmetadata'].forEach((ev) => video.addEventListener(ev, tourUpdate));
  // timeupdate fires ~4×/s; smooth the bar while playing
  video.addEventListener('play', function tick() { tourUpdate(); if (!video.paused && !video.ended) requestAnimationFrame(tick); });

  /* =========================================================
     Downloads — always the newest GitHub Release, read live
     ========================================================= */
  const REPO = 'GrzeskoByte/local-transcript';
  const RELEASES_URL = `https://github.com/${REPO}/releases`;
  const OS_META = {
    mac: { name: 'macOS', req: 'macOS 12 Monterey or later' },
    win: { name: 'Windows', req: 'Windows 10 or 11 · WebView2 (preinstalled)' },
    linux: { name: 'Linux', req: 'x86_64 or ARM64 · webkit2gtk-4.1' },
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

  // Each version ships as one GitHub release PER PLATFORM (v1.2.3-windows,
  // v1.2.3-macos, v1.2.3-ubuntu); merge them back into one entry per version,
  // newest first. Other tags (e.g. the `updater` manifest release) are ignored.
  function parseReleases(data) {
    const byVersion = new Map();
    for (const r of data) {
      if (r.draft) continue;
      const m = /^v?(\d+\.\d+\.\d+)(?:-(windows|macos|ubuntu))?$/.exec(r.tag_name);
      if (!m) continue;
      const version = m[1];
      const entry = byVersion.get(version) ?? { version, date: null, prerelease: false, notes: [], assets: [], updates: 0 };
      if (!entry.date || r.published_at > entry.date) entry.date = r.published_at;
      entry.prerelease = entry.prerelease || r.prerelease;
      entry.notes.push({ label: { windows: 'Windows', macos: 'macOS', ubuntu: 'Ubuntu' }[m[2]] ?? 'All platforms', url: r.html_url });
      for (const a of r.assets) {
        const c = classify(a.name);
        if (c) entry.assets.push({ name: a.name, size: a.size, url: a.browser_download_url, downloads: a.download_count || 0, sha: (a.digest || '').replace(/^sha256:/, ''), ...c });
        // macOS in-app updates fetch a separate .app.tar.gz; count it, but don't list it.
        else if (/\.app\.tar\.gz$/i.test(a.name)) entry.updates += a.download_count || 0;
      }
      byVersion.set(version, entry);
    }
    const semver = (v) => v.split('.').map(Number);
    return [...byVersion.values()].filter((r) => r.assets.length)
      .sort((a, b) => { const x = semver(a.version), y = semver(b.version); return y[0] - x[0] || y[1] - x[1] || y[2] - x[2]; });
  }

  async function loadReleases() {
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 8000);
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-cache', signal: ctl.signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return parseReleases(await res.json());
    } finally { clearTimeout(to); }
  }

  // --- platform detection ---
  const ua = navigator.userAgent;
  const isPhone = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  let userOS = /Mac|iPhone|iPad/.test(navigator.platform || ua) || /Mac OS X/.test(ua) ? 'mac' : /Win/.test(navigator.platform || ua) ? 'win' : /Linux|X11|CrOS/.test(ua) && !/Android/.test(ua) ? 'linux' : 'mac';
  let userArch = /aarch64|arm64/i.test(ua) ? 'arm64' : userOS === 'mac' ? 'arm64' : 'x64';
  if (userOS === 'mac' && !isPhone) { try { const gl = document.createElement('canvas').getContext('webgl'); const dbg = gl && gl.getExtension('WEBGL_debug_renderer_info'); const r = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : ''; if (/Intel/i.test(r)) userArch = 'x64'; } catch { /* keep default */ } }
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
    msi: (a) => [`Double-click <b>${esc(a.name)}</b> (ideal for managed / Intune deployments).`, { code: `msiexec /i "${a.name}" /qn`, note: 'Silent install for IT:' }],
    appimage: (a) => ['Make it executable and run it — no install needed.', { code: `chmod +x ${a.name} && ./${a.name}` }],
    deb: (a) => [`Double-click <b>${esc(a.name)}</b> and choose <b>Install</b>.`, { code: `sudo apt install ./${a.name}`, note: 'Or from a terminal:' }],
    rpm: (a) => ['Install with dnf:', { code: `sudo dnf install ./${a.name}` }],
  };
  const cmdBlock = (c) => `<div class="cmd"><code>${esc(c)}</code><button class="btn btn-sm" data-copy="${esc(c)}" aria-label="Copy command">Copy</button></div>`;

  let state = { rels: [], source: 'loading', os: userOS, filter: 'all' };

  // Newest stable release — or, while a new version is still building for some
  // platforms, the newest one that actually has files for this OS.
  const stable = () => state.rels.filter((r) => !r.prerelease);
  const latest = () => stable()[0] || state.rels[0] || null;
  const latestFor = (os) => [...stable(), ...state.rels].find((r) => r.assets.some((a) => a.os === os)) || null;

  function leadText(os, a) {
    const name = OS_META[os].name;
    if (os !== userOS || isPhone) return `Every ${name} build.`;
    if (os === 'mac') return `We think you're on a Mac with ${userArch === 'x64' ? 'an Intel chip' : 'Apple Silicon'}.`;
    if (os === 'win') return `We think you're on Windows${a && a.arch === 'arm64' ? ' on ARM' : ''}. WebView2 is already included.`;
    return 'We think you\'re on Linux. The AppImage updates itself; deb and rpm get a download button.';
  }

  function renderPlatform() {
    const os = state.os; const meta = OS_META[os]; const rel = latestFor(os);
    $$('#osTabs [role=tab]').forEach((t) => {
      const on = t.dataset.os === os; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      if (t.dataset.os === userOS && !isPhone && !$('.you', t)) $('b', t).insertAdjacentHTML('beforeend', '<i class="you">you</i>');
    });
    const steps = $('#installSteps');
    if (!rel) {
      const loading = state.source === 'loading';
      $('#primaryDl').innerHTML = `<span class="txt">${esc(leadText(os))}<small>${loading ? 'Looking up the newest release…' : 'Couldn\'t load the file list right now.'}</small></span>` +
        (loading ? '' : `<a class="go" href="${RELEASES_URL}" target="_blank" rel="noopener">Get it on GitHub Releases →</a>`);
      $('#binTable').innerHTML = `<p class="empty">${loading ? 'Loading…' : `<a href="${RELEASES_URL}" target="_blank" rel="noopener">Open GitHub Releases →</a>`}</p>`;
      steps.hidden = true;
      return;
    }
    const a = pick(rel.assets, os);
    $('#primaryDl').innerHTML = `<span class="txt">${esc(leadText(os, a))}<small>${esc(meta.req)} · v${esc(rel.version)}</small></span>` +
      (a ? `<a class="go" href="${a.url}">↓ Download ${esc(meta.name)} · ${esc(a.label === 'Installer' ? 'installer' : a.label)}<span class="sub">.${esc(a.ext)} · ${esc(a.archLabel)}${a.size ? ' · ' + fmtSize(a.size) : ''}</span></a>` : '<span class="txt">No build for this platform yet.</span>');

    const list = rel.assets.filter((x) => x.os === os);
    $('#binTable').innerHTML = list.map((x) => `
      <div class="file">
        <span><code>${esc(x.name)}</code><small>${esc(x.label)} · ${x.archLabel}${x.size ? ' · ' + fmtSize(x.size) : ''}${a && x.name === a.name ? ' · <span class="rec">recommended</span>' : ''}</small></span>
        <a class="btn btn-sm" href="${x.url}" aria-label="Download ${esc(x.name)}">↓ Download</a>
        ${x.sha ? `<button class="btn btn-sm cp" data-copy="${x.sha}" title="sha256:${x.sha}" aria-label="Copy SHA-256 of ${esc(x.name)}">Copy SHA-256</button>` : '<span></span>'}
      </div>`).join('');

    const s = a ? (INSTALL[a.kind] || (() => []))(a) : [];
    steps.hidden = !s.length;
    steps.innerHTML = `<h3>Install</h3><ol>${s.map((x) => `<li><div>${typeof x === 'string' ? x : `${x.note ? esc(x.note) : ''}${cmdBlock(x.code)}`}</div></li>`).join('')}</ol>`;
    $('#shaCmd').textContent = os === 'win' ? 'certutil -hashfile <file> SHA256' : os === 'mac' ? 'shasum -a 256 <file>' : 'sha256sum <file>';
    $('#backendHint').textContent = os === 'mac' ? 'whisper.cpp ships inside the app, GPU-accelerated with Metal. The speech model downloads once, on your first transcription.' : 'whisper.cpp ships inside the app. The speech model downloads once (~550 MB), on your first transcription.';
  }

  // Public total from GitHub's per-file download_count, summed over every
  // installer of every release plus in-app updates. Windows and the AppImage
  // update by re-downloading the installer itself; macOS uses its .app.tar.gz.
  // Update checks (latest.json) and signatures (.sig) are not counted.
  function renderCounter() {
    const box = $('#dlCounter');
    if (!state.rels.length) { box.hidden = true; return; }
    const total = state.rels.reduce((n, r) => n + r.updates + r.assets.reduce((m, a) => m + a.downloads, 0), 0);
    $('#dlCount').textContent = total.toLocaleString();
    box.hidden = false;
  }

  function renderHistory() {
    const f = state.filter;
    if (!state.rels.length) {
      $('#releases').innerHTML = `<p class="status">${state.source === 'loading' ? 'Loading releases from GitHub…' : `Couldn't reach GitHub right now. <a href="${RELEASES_URL}" target="_blank" rel="noopener">See every release on GitHub →</a>`}</p>`;
      return;
    }
    const top = latest();
    $('#releases').innerHTML = state.rels.map((r) => {
      const assets = r.assets.filter((a) => f === 'all' || a.os === f).sort((a, b) => 'mac win linux'.indexOf(a.os) - 'mac win linux'.indexOf(b.os));
      return `<details class="release" ${r === top ? 'open' : ''}>
        <summary><span class="v">v${esc(r.version)}</span>${r === top ? '<span class="tag h">Latest</span>' : ''}${r.prerelease ? '<span class="tag">Pre-release</span>' : ''}<span class="date">${fmtDate(r.date)}</span><span>${assets.length} binaries</span></summary>
        <div class="matrix-wrap"><table class="matrix"><thead><tr><th>Platform</th><th>Package</th><th>Arch</th><th>File</th><th>Size</th><th><span class="sr-only">Download</span></th></tr></thead><tbody>
        ${assets.map((a) => `<tr><td>${OS_META[a.os].name}</td><td>${esc(a.label)}</td><td>${a.archLabel}</td><td class="f">${esc(a.name)}</td><td>${fmtSize(a.size) || '—'}</td>
          <td><a class="btn btn-sm" href="${a.url}" aria-label="Download ${esc(a.name)}">↓ Get</a></td></tr>`).join('')}
        </tbody></table></div>
        <div class="rel-notes">Release notes: ${r.notes.map((n) => `<a href="${n.url}" target="_blank" rel="noopener">${n.label} →</a>`).join(' · ')}</div>
      </details>`;
    }).join('');
  }

  function renderStatus() {
    const rel = latest(); const note = $('#dlNote');
    $('#relDot').classList.toggle('pending', state.source !== 'live');
    if (rel) {
      $('#relVer').textContent = 'Latest · v' + rel.version; $('#heroVer').textContent = 'v' + rel.version;
      $('#relDate').textContent = (rel.date ? `Released ${fmtDate(rel.date)} · ` : '') + 'read live from GitHub Releases.';
      const prev = stable()[1]; $('#updLine').textContent = prev ? `\nv${prev.version} → v${rel.version}` : '';
    } else {
      $('#relVer').textContent = 'Latest';
      $('#relDate').textContent = state.source === 'loading' ? 'Checking GitHub…' : 'On GitHub Releases';
    }
    if (state.source === 'offline') {
      note.hidden = false;
      note.innerHTML = `<b>[!]</b><span>Couldn't reach GitHub for live release data. <a href="${RELEASES_URL}" target="_blank" rel="noopener">Open GitHub Releases</a> for the newest build.</span>`;
    } else note.hidden = true;
    if (isPhone) return; // keep "Download for free" → #download, where the phone note explains
    const r = latestFor(userOS); const a = r && pick(r.assets, userOS);
    const label = `Download for ${OS_META[userOS].name}`;
    $('#heroDlText').textContent = label; $('#finalDlText').textContent = label;
    const href = a ? a.url : state.source === 'loading' ? '#download' : RELEASES_URL;
    $('#heroDl').href = href; $('#finalDl').href = href;
  }

  // On a phone there is nothing to install here: say so, and offer to send the link on.
  if (isPhone) {
    $('#phoneNote').hidden = false;
    $('#shareLink').addEventListener('click', async () => {
      const url = location.origin + location.pathname + '#download';
      if (navigator.share) { try { await navigator.share({ title: 'Local Transcriber', text: 'Private, on-device meeting transcription — download it on your computer:', url }); return; } catch (e) { if (e.name === 'AbortError') return; } }
      copy(url);
    });
  }

  $$('#osTabs [role=tab]').forEach((t) => t.addEventListener('click', () => { state.os = t.dataset.os; renderPlatform(); }));
  $('#osTabs').addEventListener('keydown', (e) => {
    const order = ['mac', 'win', 'linux']; const i = order.indexOf(state.os);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { state.os = order[(i + (e.key === 'ArrowRight' ? 1 : 2)) % 3]; renderPlatform(); $(`#tab-${state.os}`).focus(); e.preventDefault(); }
  });
  $$('#platFilter button').forEach((b) => b.addEventListener('click', () => { state.filter = b.dataset.f; $$('#platFilter button').forEach((x) => x.setAttribute('aria-pressed', x === b)); renderHistory(); }));

  // Count download clicks as a Vercel Web Analytics custom event (cookieless,
  // same as page views). Only the file name and which button was used are sent —
  // nothing about the visitor. Downloads made outside this site (straight from
  // GitHub, the in-app updater) are counted by GitHub's per-file download_count;
  // see README.md › Analytics.
  const DL_FROM = { heroDl: 'hero', finalDl: 'footer-cta', primaryDl: 'recommended', binTable: 'file-list', releases: 'release-history', dlNote: 'fallback' };
  function trackDownload(e) {
    if (e.type === 'auxclick' && e.button !== 1) return;
    const link = e.target.closest?.('a[href]'); if (!link) return;
    const href = link.href;
    const file = href.includes(`/${REPO}/releases/download/`) ? decodeURIComponent(href.split('/').pop()) : href.startsWith(RELEASES_URL) ? 'GitHub Releases page' : null;
    if (!file) return;
    const box = link.closest(Object.keys(DL_FROM).map((id) => '#' + id).join(','));
    window.va?.('event', { name: 'Download', data: { file, from: box ? DL_FROM[box.id] : 'other' } });
  }
  document.addEventListener('click', trackDownload);
  document.addEventListener('auxclick', trackDownload);

  // Mark the nav link for the section in view.
  const navLinks = $$('.navlinks a[href^="#"]');
  let spyQueued = false, current = null;
  function spy() {
    spyQueued = false;
    const line = innerHeight * 0.3;
    let active = null, best = -Infinity;
    for (const a of navLinks) {
      const target = document.getElementById(a.hash.slice(1)); if (!target) continue;
      const top = target.getBoundingClientRect().top;
      if (top <= line && top > best) { best = top; active = a; }
    }
    if (active === current) return;
    current?.removeAttribute('aria-current');
    current = active;
    active?.setAttribute('aria-current', 'true');
  }
  const queueSpy = () => { if (!spyQueued) { spyQueued = true; requestAnimationFrame(spy); } };
  addEventListener('scroll', queueSpy, { passive: true });
  addEventListener('resize', queueSpy);
  spy();

  // Paint a loading state, then the live list from GitHub. Nothing is stored
  // on the visitor's device (see privacy.html).
  const paint = () => { renderStatus(); renderPlatform(); renderHistory(); renderCounter(); };
  paint();
  Promise.all([loadReleases(), archReady])
    .then(([rels]) => { state.rels = rels; state.source = 'live'; })
    .catch(() => { state.source = 'offline'; })
    .then(paint);
})();
