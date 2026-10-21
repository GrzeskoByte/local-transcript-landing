/* Local Transcriber — shared page behaviour: theme picker, legal-page language
   switch. No dependencies. Nothing is stored on the visitor's device (see
   privacy.html §2.4): the theme lasts for the current page only. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- theme ---------- */
  const DEF = { brand: '#f48ca8', accent: '#ff4e7e' };
  const SWATCHES = {
    brand: [['#f48ca8', 'Pink'], ['#ffd23f', 'Yellow'], ['#9fd3ff', 'Sky'], ['#c9f27c', 'Lime'], ['#c4b0ff', 'Lilac'], ['#ffb38a', 'Peach']],
    accent: [['#ff4e7e', 'Hot pink'], ['#ff6a3d', 'Orange'], ['#2f6bff', 'Blue'], ['#00b37a', 'Green'], ['#a35cff', 'Violet'], ['#ffb000', 'Amber']],
  };
  const theme = { ...DEF };

  // Blend a hex colour toward t (0 = black, 255 = white) by k.
  function mix(hex, t, k) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    let out = '#';
    for (let i = 0; i < 3; i++) { const v = parseInt(h.substr(i * 2, 2), 16); out += Math.round(v + (t - v) * k).toString(16).padStart(2, '0'); }
    return out;
  }

  function apply() {
    const b = theme.brand, def = b === DEF.brand, s = document.documentElement.style;
    s.setProperty('--pink', b);
    s.setProperty('--pink-deep', def ? '#d6336c' : mix(b, 0, 0.38));
    s.setProperty('--pink-wash', def ? '#fff3f6' : mix(b, 255, 0.9));
    s.setProperty('--hot', theme.accent);
    $$('[data-cur]').forEach((c) => { c.textContent = theme[c.dataset.cur]; });
    $$('[data-swatches] .s').forEach((btn) => {
      const on = btn.dataset.c === theme[btn.parentElement.dataset.swatches];
      btn.setAttribute('aria-pressed', on);
    });
    $$('.cust input').forEach((i) => { i.value = theme[i.dataset.k]; });
    document.dispatchEvent(new CustomEvent('themechange'));
  }

  $$('[data-swatches]').forEach((group) => {
    const k = group.dataset.swatches;
    for (const [c, name] of SWATCHES[k]) {
      const btn = document.createElement('button');
      btn.className = 's'; btn.type = 'button'; btn.dataset.c = c; btn.style.background = c;
      btn.setAttribute('aria-label', name); btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', () => { theme[k] = c; apply(); });
      group.appendChild(btn);
    }
    const lab = document.createElement('label');
    lab.className = 'cust';
    lab.innerHTML = `Custom <input type="color" data-k="${k}" aria-label="Custom ${k} colour">`;
    lab.querySelector('input').addEventListener('input', (e) => { theme[k] = e.target.value.toLowerCase(); apply(); });
    group.appendChild(lab);
  });
  $$('[data-theme-reset]').forEach((b) => b.addEventListener('click', () => { Object.assign(theme, DEF); apply(); }));

  const btn = $('#themeBtn'), pop = $('#themePop');
  if (btn && pop) {
    const open = (on) => {
      pop.hidden = !on; btn.setAttribute('aria-expanded', on);
      if (on) pop.querySelector('.s[aria-pressed="true"], .s')?.focus(); else btn.focus();
    };
    btn.addEventListener('click', () => open(pop.hidden));
    $$('[data-theme-close]', pop).forEach((b) => b.addEventListener('click', () => open(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !pop.hidden) open(false); });
    document.addEventListener('click', (e) => { if (!pop.hidden && !pop.contains(e.target) && !btn.contains(e.target)) { pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
  }
  apply();

  /* ---------- legal pages: English / Español ---------- */
  const langBtns = $$('[data-lang]');
  if (langBtns.length) {
    const show = (lang, push) => {
      $$('article[lang]').forEach((a) => { a.hidden = a.lang !== lang; });
      $$('nav[data-toc]').forEach((n) => { n.hidden = n.dataset.toc !== lang; });
      langBtns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.lang === lang));
      if (push) history.replaceState(null, '', '#' + lang);
    };
    langBtns.forEach((b) => b.addEventListener('click', () => show(b.dataset.lang, true)));
    // #es, or a section anchor inside the Spanish article, opens Spanish.
    const fromHash = () => {
      const t = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      const art = t && (t.matches('article[lang]') ? t : t.closest('article[lang]'));
      show(art ? art.lang : (document.documentElement.lang.startsWith('es') ? 'es' : 'en'), false);
      if (t && art && t !== art) t.scrollIntoView();
    };
    addEventListener('hashchange', fromHash);
    fromHash();
  }
})();
