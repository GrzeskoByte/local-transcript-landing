/* Local Transcriber — landing page behavior. No dependencies. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const P = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  const eIO = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const noise = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u); };
  const pad = (n) => String(n).padStart(2, '0');
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

  /* ---------- nav ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#menuBtn').addEventListener('click', () => { const open = nav.classList.toggle('open'); $('#menuBtn').setAttribute('aria-expanded', open); });
  $$('#navLinks a').forEach((a) => a.addEventListener('click', () => { nav.classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', 'false'); }));

  /* ---------- hero headline word reveal ---------- */
  (function splitWords(root) {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = el('span', 'w'); w.textContent = part; w.style.animationDelay = (0.15 + i++ * 0.07) + 's'; frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) {
          // gradient spans: apply the gradient per word so background-clip still works
          if (n.classList.contains('grad-text')) { n.classList.remove('grad-text'); n.dataset.grad = '1'; }
          walk(n);
          if (n.dataset.grad) $$('.w', n).forEach((w) => w.classList.add('grad-text'));
        }
      });
    };
    walk(root);
  })($('#heroTitle'));

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.rv').forEach((n) => io.observe(n));

  /* ---------- bento spotlight ---------- */
  $$('.tile').forEach((t) => t.addEventListener('pointermove', (e) => { const r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px'); }));

  /* ---------- tech marquee ---------- */
  const TECH = [['Tauri v2', '#fbbf24'], ['Rust', '#fb923c'], ['React', '#38bdf8'], ['TypeScript', '#60a5fa'], ['whisper.cpp', '#a5b4fc'], ['Parakeet TDT', '#34d399'], ['voxtype', '#f472b6'], ['Ollama', '#e2e8f0'], ['OPFS', '#c084fc'], ['IndexedDB', '#fcd34d'], ['Vulkan', '#f87171'], ['Metal', '#cbd5e1']];
  const mq = $('#marquee');
  [0, 1].forEach((dup) => TECH.forEach(([n, c]) => { const s = el('span', 'tech', `<i style="background:${c};box-shadow:0 0 10px ${c}"></i>${n}`); if (dup) s.setAttribute('aria-hidden', 'true'); mq.appendChild(s); }));

  /* ---------- showreel ---------- */
  const video = $('#reelVideo'), reelBox = $('#reelBox');
  $('#reelPlay').addEventListener('click', () => { video.controls = true; video.play(); reelBox.classList.add('playing'); });
  video.addEventListener('ended', () => { reelBox.classList.remove('playing'); video.controls = false; });

  /* ---------- small decorative visuals ---------- */
  const mkBars = (host, n, f) => { for (let i = 0; i < n; i++) { const b = el('i'); f(b, i); host.appendChild(b); } };
  mkBars($('#eqA'), 9, (b, i) => { b.style.animationDelay = (-i * 0.17) + 's'; b.style.animationDuration = (0.7 + hash(i) * 0.6) + 's'; });
  mkBars($('#eqB'), 9, (b, i) => { b.style.animationDelay = (-i * 0.23) + 's'; b.style.animationDuration = (0.8 + hash(i + 9) * 0.6) + 's'; });
  const waveBar = (seed) => (b, i) => { const on = noise(i * 0.3 + seed) > 0.45; b.style.height = (on ? 20 + 80 * noise(i * 1.7 + seed * 3) : 8) + '%'; };
  mkBars($('#bwMe'), 90, waveBar(1)); mkBars($('#bwOt'), 90, waveBar(40));
  const chunks = $('#chunks');
  for (let i = 1; i <= 12; i++) { const s = el('span'); s.textContent = String(i).padStart(6, '0') + '.webm'; s.style.animationDelay = (i * 0.45) + 's'; chunks.appendChild(s); }
  const cal = $('#miniCal');
  ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d) => { const s = el('span', null, d); s.style.border = '0'; s.style.color = 'var(--faint)'; s.style.aspectRatio = 'auto'; cal.appendChild(s); });
  for (let d = 21; d <= 34; d++) {
    const day = d > 30 ? d - 30 : d; const s = el('span');
    const rec = [22, 24, 28].includes(d), srv = [23, 25, 29, 31].includes(d);
    if (d === 28) s.classList.add('today');
    if (rec) s.classList.add('rec'); if (srv) s.classList.add('srv');
    s.innerHTML = `${day}<i></i>`; if (!rec && !srv) s.querySelector('i').style.background = 'transparent';
    cal.appendChild(s);
  }
  const orbit = $('#orbit');
  ['audio.webm', 'transcript.md', 'whisper.cpp', 'summary', 'segments.json', 'Parakeet'].forEach((t, i, a) => {
    const ang = (i / a.length) * Math.PI * 2, r = 43; // % of vault
    const s = el('span', null, `<b>${t}</b>`); s.style.left = `calc(${Math.cos(ang) * r} * 1% * 4.8)`; s.style.top = `calc(${Math.sin(ang) * r} * 1% * 4.8)`;
    orbit.appendChild(s);
  });
  // position orbit labels relative to the vault size
  const vault = $('.vault');
  const placeOrbit = () => { const R = vault.clientWidth * 0.44; $$('span', orbit).forEach((s, i, a) => { const ang = (i / a.length) * Math.PI * 2; s.style.left = Math.cos(ang) * R + 'px'; s.style.top = Math.sin(ang) * R + 'px'; }); };
  placeOrbit(); addEventListener('resize', placeOrbit);
  // search typing loop
  const q = $('#searchQ'); const words = ['roadmap', 'follow-up', 'GitLab export'];
  let wi = 0, ci = 0, dir = 1;
  if (reduced) q.textContent = 'roadmap';
  else setInterval(() => { const w = words[wi]; ci += dir; if (ci > w.length + 8) dir = -1; if (ci < 0) { dir = 1; ci = 0; wi = (wi + 1) % words.length; } q.textContent = w.slice(0, clamp(ci, 0, w.length)); }, 110);

  /* =========================================================
     Hero product mock — a timeline that replays the real app flow
     ========================================================= */
  const win = $('#win'), scaler = $('#mockScaler'), frame = $('#mockFrame'), main = $('#mockMain');
  function fit() { const s = scaler.clientWidth / 1200; win.style.transform = `scale(${s})`; scaler.style.height = (740 * s) + 'px'; }
  addEventListener('resize', fit); fit();

  // pointer tilt
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    const stage = $('#stage');
    stage.addEventListener('pointermove', (e) => { const r = stage.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; frame.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 5}deg)`; });
    stage.addEventListener('pointerleave', () => { frame.style.transform = ''; });
  }

  const LINES = [
    ['00:00:04', 'me', 'Okay, let’s lock the Q3 roadmap before Friday.'],
    ['00:00:11', 'ot', 'Offline mode is done — recordings survive a crash now.'],
    ['00:00:19', 'me', 'Great. And transcription stays fully on-device?'],
    ['00:00:24', 'ot', 'Yep, whisper.cpp on the GPU. Nothing gets uploaded.'],
    ['00:00:31', 'me', 'Then let’s ship the GitLab export next sprint.'],
    ['00:00:38', 'ot', 'I’ll put a follow-up on the calendar for Thursday.'],
  ];
  const SUM = 'The team agreed to lock the Q3 roadmap by Friday. Crash-safe offline recording is complete, on-device GPU transcription is confirmed, and GitLab export ships next sprint.';
  const KP = ['Q3 roadmap locked by Friday', 'GitLab export → next sprint', 'Follow-up call Thursday 14:00'];
  const tr = $('#tr'); const trRows = LINES.map(([ts, w, t]) => { const li = el('li', null, `<span class="ts">${ts}</span><span class="who ${w}">${w === 'me' ? 'Me' : 'Others'}</span><span class="tx"></span>`); tr.appendChild(li); return { li, tx: $('.tx', li), full: t }; });
  const kp = $('#kp'); const kpRows = KP.map((t) => { const li = el('li', null, `<span class="ck"><svg width="12" height="12"><use href="#i-check"/></svg></span>${esc(t)}`); kp.appendChild(li); return li; });
  const lvMe = [], lvOt = []; mkBars($('#lvMe'), 16, (b) => lvMe.push(b)); mkBars($('#lvOt'), 16, (b) => lvOt.push(b));
  const wMe = [], wOt = [];
  const waveFill = (arr, seed) => (b, i) => { const on = noise(i * 0.35 + seed) > 0.45; b.style.height = (on ? 25 + 75 * noise(i * 1.7 + seed) : 10) + '%'; arr.push(b); };
  mkBars($('#wMe'), 120, waveFill(wMe, 1)); mkBars($('#wOt'), 120, waveFill(wOt, 40));

  const screens = $$('.screen', main), steps = $$('.stage-step'), cursor = $('#cursor');
  const chips = { A: $('#chipA'), B: $('#chipB'), C: $('#chipC') };
  const DUR = [4.4, 3.6, 4.8, 4.8]; const START = DUR.reduce((a, d, i) => (a.push(i ? a[i - 1] + DUR[i - 1] : 0), a), []); const TOTAL = DUR.reduce((a, b) => a + b, 0);
  let current = -1;
  const relPos = (node) => { const m = main.getBoundingClientRect(), r = node.getBoundingClientRect(), s = m.width / main.offsetWidth; return [(r.left - m.left + r.width * 0.55) / s, (r.top - m.top + r.height * 0.6) / s]; };

  function setScene(i) {
    if (i === current) return; current = i;
    screens.forEach((s, j) => s.classList.toggle('on', j === i));
    steps.forEach((s, j) => { s.classList.toggle('active', j === i); s.setAttribute('aria-selected', j === i); });
    $$('.nav-item', win).forEach((n) => n.classList.remove('active'));
    $('#navRec').style.display = i >= 1 ? '' : 'none';
    $(`.nav-item[data-nav="${i === 0 ? 'new' : i === 1 ? 'rec' : 'meet'}"]`, win).classList.add('active');
    chips.A.classList.toggle('on', i === 1); chips.B.classList.toggle('on', i === 2); chips.C.classList.toggle('on', i === 3);
  }

  function render(t) {
    const i = START.findLastIndex((s) => t >= s); const lt = t - START[i];
    setScene(i);
    steps.forEach((s, j) => { $('.bar', s).style.width = (j === i ? (lt / DUR[i]) * 100 : 0) + '%'; });
    const working = i === 2 && lt < 2.2;
    $('#mDot').className = 'model-dot' + (working ? ' working' : ''); $('#mText').textContent = working ? 'Transcribing…' : 'Speech model ready';

    if (i === 0) {
      const title = 'Q3 Roadmap Sync'; $('#titleText').textContent = title.slice(0, Math.floor(title.length * P(lt, 0.5, 1.4)));
      const clickT = 2.0, startT = 3.3; const sel = lt > clickT;
      $('#dualCard').classList.toggle('selected', sel); $('#step2').classList.toggle('done', sel);
      $('#startBtn').classList.toggle('press', Math.abs(lt - startT) < 0.1);
      const p0 = [900, 560], p1 = relPos($('#dualCard')), p2 = relPos($('#startBtn'));
      let x, y;
      if (lt < clickT) { const k = eIO(P(lt, 0.8, clickT)); x = lerp(p0[0], p1[0], k); y = lerp(p0[1], p1[1], k) - Math.sin(k * Math.PI) * 40; }
      else { const k = eIO(P(lt, clickT + 0.2, startT)); x = lerp(p1[0], p2[0], k); y = lerp(p1[1], p2[1], k) - Math.sin(k * Math.PI) * 60; }
      const press = Math.abs(lt - clickT) < 0.08 || Math.abs(lt - startT) < 0.08;
      cursor.style.transition = 'none'; cursor.style.opacity = lt > 0.6 && lt < 4.1 ? 1 : 0;
      cursor.style.transform = `translate(${x}px, ${y}px) scale(${press ? 0.85 : 1})`;
    } else cursor.style.opacity = 0;

    if (i === 1) {
      const secs = Math.floor(eIO(P(lt, 0.2, DUR[1] - 0.3)) * (47 * 60 + 12));
      $('#timer').textContent = `00:${pad(Math.floor(secs / 60))}:${pad(secs % 60)}`;
      $('#chunk').textContent = `Saved to disk · chunk ${String(Math.max(1, Math.floor(secs / 5))).padStart(6, '0')}.webm`;
      const tm = noise(t * 1.3) > 0.4 ? 1 : 0.25, to = noise(t * 1.3 + 20) > 0.45 ? 1 : 0.25;
      lvMe.forEach((b, j) => { b.style.height = (4 + 32 * (1 - Math.abs(j - 7.5) / 8.5) * noise(t * 9 + j * 0.7) * tm) + 'px'; });
      lvOt.forEach((b, j) => { b.style.height = (4 + 32 * (1 - Math.abs(j - 7.5) / 8.5) * noise(t * 9 + j * 0.7 + 50) * to) + 'px'; });
      $('#stopBtn').classList.toggle('press', lt > DUR[1] - 0.25);
    }

    if (i === 2) {
      const prog = eIO(P(lt, 0.2, 2.0)); const done = prog >= 1;
      $('#pct').textContent = Math.round(prog * 100) + '%'; $('#prog').style.width = prog * 100 + '%';
      $('#stageTxt').textContent = prog < 0.08 ? 'Decoding audio…' : prog < 0.97 ? 'Transcribing…' : 'Saving transcript…';
      $('#stPill').className = 'pill ' + (done ? 'pill-completed' : 'pill-processing'); $('#stPill').textContent = done ? 'Completed' : 'Transcribing';
      const cut = Math.floor(prog * 120); wMe.forEach((b, j) => b.classList.toggle('on', j < cut)); wOt.forEach((b, j) => b.classList.toggle('on', j < cut));
      $('#loaderCard').style.display = lt > 2.3 ? 'none' : '';
      trRows.forEach((r, j) => { const st = 0.7 + j * 0.42; r.li.classList.toggle('in', lt > st); r.li.classList.toggle('hot', lt > st && lt < st + 0.9); r.tx.textContent = r.full.slice(0, Math.floor(r.full.length * P(lt, st, st + 0.6))); });
    }

    if (i === 3) {
      const n = Math.floor(SUM.length * eIO(P(lt, 0.3, 2.0)));
      $('#sumText').innerHTML = esc(SUM.slice(0, n)) + (n < SUM.length ? '<span class="caret"></span>' : '');
      kpRows.forEach((li, j) => li.classList.toggle('in', lt > 1.7 + j * 0.25));
      $('#gitBtn').style.borderColor = lt > 3.0 ? '#4f46e5' : ''; $('#gitBtn').classList.toggle('press', Math.abs(lt - 3.0) < 0.1);
    }
  }

  let t0 = performance.now(), offset = 0, visible = true, raf = 0;
  function loop(now) { render(((now - t0) / 1000 + offset) % TOTAL); raf = requestAnimationFrame(loop); }
  steps.forEach((s, j) => s.addEventListener('click', () => { offset = START[j]; t0 = performance.now(); if (reduced) render(START[j] + DUR[j] - 0.01); }));
  if (reduced) { render(START[3] + DUR[3] - 0.01); }
  else {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; cancelAnimationFrame(raf); if (visible) { t0 = performance.now() - ((performance.now() - t0) % (TOTAL * 1000)); raf = requestAnimationFrame(loop); } }).observe(scaler);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else if (visible) raf = requestAnimationFrame(loop); });
  }

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
    dmg: (a) => [`Open <b>${esc(a.name)}</b> and drag the app into <b>Applications</b>.`, 'First launch: right-click the app → <b>Open</b> if macOS asks.', { code: 'brew install whisper-cpp', note: 'Optional — enables Metal-accelerated transcription.' }],
    exe: (a) => [`Run <b>${esc(a.name)}</b> and follow the installer.`, 'If SmartScreen appears, choose <b>More info → Run anyway</b>.', { code: 'setx WHISPER_CLI_PATH C:\\whisper\\whisper-cli.exe', note: 'Optional — point the app at a whisper.cpp build.' }],
    msi: (a) => [`Double-click <b>${esc(a.name)}</b> (ideal for managed / Intune deployments).`, { code: `msiexec /i "${a.name}" /qn`, note: 'Silent install for IT.' }],
    appimage: (a) => ['Make it executable and run it — no install needed.', { code: `chmod +x ${a.name} && ./${a.name}` }, { code: 'sudo voxtype setup gpu --enable', note: 'Optional — GPU transcription via voxtype.' }],
    deb: (a) => ['Install with apt:', { code: `sudo apt install ./${a.name}` }],
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
      <ol class="install-steps">${steps.map((s) => `<li><div>${typeof s === 'string' ? s : `${s.note ? `<span style="color:var(--muted)">${esc(s.note)}</span>` : ''}${codeBlock(s.code)}`}</div></li>`).join('')}</ol>`;
    const pb = $('#primaryDl [data-pending]'); if (pb) pb.addEventListener('click', (e) => { e.preventDefault(); $('.source-grid2').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); });

    const list = rel.assets.filter((x) => x.os === os);
    $('#binTable').innerHTML = `<h4><span>${meta.name} binaries · v${esc(rel.version)}</span><span class="mono" style="letter-spacing:0">${list.length} files</span></h4>` + list.map((x) => `
      <div class="bin">
        <div>
          <div class="nm"><strong>${esc(x.label)}</strong><span class="ext">.${esc(x.ext)}</span><span class="arch">${x.archLabel}</span>${a && x.name === a.name ? '<span class="rec">Recommended</span>' : ''}</div>
          <div class="meta"><span>${esc(x.name)}</span>${x.size ? `<span>${fmtSize(x.size)}</span>` : ''}${x.sha ? `<span class="sha">sha256:${x.sha.slice(0, 12)}… <button class="copy" data-copy="${x.sha}" aria-label="Copy SHA-256"><svg width="12" height="12"><use href="#i-copy"/></svg></button></span>` : ''}</div>
        </div>
        ${pending ? `<span class="btn btn-sm" aria-disabled="true">Soon</span>` : `<a class="btn btn-sm" href="${x.url}" aria-label="Download ${esc(x.name)}"><svg width="15" height="15"><use href="#i-dl"/></svg>Download</a>`}
      </div>`).join('');
    $('#shaCmd').textContent = os === 'win' ? 'certutil -hashfile <file> SHA256' : os === 'mac' ? 'shasum -a 256 <file>' : 'sha256sum <file>';
    $('#backendHint').innerHTML = os === 'mac' ? 'Run <code class="mono">brew install whisper-cpp</code> — Metal acceleration is built in.' : os === 'win' ? 'Grab a whisper.cpp release (CUDA or Vulkan build) and set <code class="mono">WHISPER_CLI_PATH</code>.' : 'Install voxtype (Arch: <code class="mono">voxtype-bin</code>) or any whisper.cpp build with <code class="mono">whisper-cli</code>.';
  }

  const osIcon = (os) => `<span class="plat"><svg><use href="#${OS_META[os].icon}"/></svg>${OS_META[os].name}</span>`;
  function renderHistory() {
    const f = state.filter;
    $('#releases').innerHTML = state.rels.map((r, i) => {
      const assets = r.assets.filter((a) => f === 'all' || a.os === f).sort((a, b) => 'mac win linux'.indexOf(a.os) - 'mac win linux'.indexOf(b.os));
      return `<details class="release" ${i === 0 ? 'open' : ''}>
        <summary><svg class="chev" width="16" height="16"><use href="#i-chev"/></svg><span class="v">v${esc(r.version)}</span>${i === 0 ? '<span class="latest">Latest</span>' : ''}${r.prerelease ? '<span class="pre">Pre-release</span>' : ''}${r.pending ? '<span class="pre">In preparation</span>' : ''}<span class="date">${fmtDate(r.date)}</span><span class="count">${assets.length} binaries</span></summary>
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
      $('#noteBuild').addEventListener('click', (e) => { e.preventDefault(); $('.source-grid2').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); });
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
