(function(){
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const HEADER_OFFSET = 100;

  // ---------- inertial smooth scrolling (falls back to native smooth scroll) ----------
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: t => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const scrollToY = (target, immediate) => {
    if (lenis) lenis.scrollTo(target, { offset: typeof target === 'number' ? 0 : -HEADER_OFFSET, immediate, lock: !immediate });
    else if (typeof target === 'number') window.scrollTo({ top: target, behavior: immediate ? 'instant' : 'smooth' });
    else window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - HEADER_OFFSET, behavior: immediate ? 'instant' : 'smooth' });
  };

  // ---------- header rule + scroll progress ----------
  const header = document.querySelector('.top');
  const progress = document.querySelector('.progress');
  const onScroll = () => {
    header.classList.toggle('scrolled', scrollY > 8);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- theme toggle with a circular reveal ----------
  const effectiveTheme = () => root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  $('theme-toggle').addEventListener('click', e => {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    const apply = () => { root.dataset.theme = next; try { localStorage.setItem('collapse-theme', next); } catch (err) {} };
    if (!document.startViewTransition || reduced) { apply(); return; }
    const x = e.clientX || innerWidth - 60, y = e.clientY || 40;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add('theme-vt');
    const vt = document.startViewTransition(apply);
    vt.ready.then(() => root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' }));
    vt.finished.finally(() => root.classList.remove('theme-vt'));
  });

  // ---------- nav underline that slides to the hovered or current link ----------
  const nav = document.querySelector('nav.links');
  const navLine = nav.querySelector('.nav-pill');
  const navLinks = $$('[data-link]');
  function placeLine(target) {
    if (!target || target.offsetParent === null) { navLine.style.setProperty('--o', 0); return; }
    const c = nav.getBoundingClientRect(), t = target.getBoundingClientRect();
    navLine.style.setProperty('--x', (t.left - c.left) + 'px');
    navLine.style.setProperty('--w', t.width + 'px');
    navLine.style.setProperty('--o', 1);
  }
  const currentLink = () => nav.querySelector('[aria-current="page"]');
  navLinks.forEach(a => a.addEventListener('mouseenter', () => placeLine(a)));
  nav.addEventListener('mouseleave', () => placeLine(currentLink()));

  // ---------- scroll reveal ----------
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('in'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  $$('[data-reveal]').forEach(el => io.observe(el));

  // ---------- hero headline: word-by-word rise ----------
  (function splitWords(el) {
    let i = 0;
    const wrap = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span'); inner.textContent = part; inner.style.setProperty('--i', i++);
            w.appendChild(inner); frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) wrap(child);
      });
    };
    wrap(el);
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  })($('hero-title'));

  // ---------- router with view transitions ----------
  const pages = $$('[data-page]');
  const TITLES = { home: 'Collapse: Rotector checks for Discord servers', docs: 'Docs · Collapse', team: 'Team · Collapse',
                   support: 'Add Collapse · Collapse', terms: 'Terms of service · Collapse', privacy: 'Privacy policy · Collapse' };
  let current = null;
  function show(hash, animate) {
    const page = hash.split('-')[0];
    const target = pages.some(p => p.dataset.page === page) ? page : 'home';
    const section = hash.includes('-') ? $(hash) : null;

    if (target === current) {           // same page: just glide to the section
      if (section) scrollToY(section); else scrollToY(0);
      return;
    }
    const apply = () => {
      pages.forEach(p => {
        const on = p.dataset.page === target;
        if (on && !p.hidden) return;
        p.hidden = !on;
        if (on) $$('[data-reveal]', p).forEach(el => el.classList.remove('in'));
      });
      root.classList.add('routed');     // from here on the hidden attribute decides what's visible
      current = target;
      navLinks.forEach(a => a.dataset.link === target ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
      if (lenis) lenis.resize();
      scrollToY(0, true);
      document.title = TITLES[target];
    };
    const after = () => {
      requestAnimationFrame(() => placeLine(currentLink()));
      if (section) setTimeout(() => scrollToY(section), 80);
      updateToc();
    };
    if (animate && document.startViewTransition && !reduced) {
      root.classList.add('page-vt');
      const vt = document.startViewTransition(apply);
      vt.finished.finally(() => { root.classList.remove('page-vt'); });
      vt.updateCallbackDone.then(after);
    } else {
      apply();
      if (animate && !reduced) {
        const el = pages.find(p => p.dataset.page === target);
        el.classList.remove('page-enter'); void el.offsetWidth; el.classList.add('page-enter');
      }
      after();
    }
  }
  addEventListener('hashchange', () => show(location.hash.slice(1) || 'home', true));
  // Re-clicking the current link (hash unchanged) still scrolls to it.
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute('href') === location.hash) { e.preventDefault(); show(location.hash.slice(1), true); }
  });
  addEventListener('resize', () => { placeLine(currentLink()); updateToc(); });

  // ---------- docs: scrollspy with a sliding marker ----------
  const toc = $('toc');
  const tocMarker = toc.querySelector('.toc-marker');
  const tocLinks = $$('a', toc);
  let activeId = 'docs-overview';
  function updateToc() {
    tocLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + activeId));
    const on = toc.querySelector('a.on');
    if (!on || on.offsetParent === null) { tocMarker.style.setProperty('--o', 0); return; }
    tocMarker.style.setProperty('--y', on.offsetTop + 'px');
    tocMarker.style.setProperty('--h', on.offsetHeight + 'px');
    tocMarker.style.setProperty('--o', 1);
  }
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) activeId = en.target.id; });
    updateToc();
  }, { rootMargin: '-120px 0px -65% 0px' });
  $$('.doc section[id]').forEach(s => spy.observe(s));

  // ---------- FAQ: animated open/close ----------
  $$('details').forEach(d => {
    const summary = d.querySelector('summary');
    let anim = null;
    summary.addEventListener('click', e => {
      if (reduced) return;
      e.preventDefault();
      if (anim) anim.cancel();
      const start = d.offsetHeight;
      if (d.open) {
        const end = summary.offsetHeight;
        anim = d.animate({ height: [start + 'px', end + 'px'] }, { duration: 400, easing: 'cubic-bezier(.16,1,.3,1)' });
        anim.onfinish = () => { d.open = false; anim = null; if (lenis) lenis.resize(); };
      } else {
        d.open = true;
        const end = d.offsetHeight;
        anim = d.animate({ height: [start + 'px', end + 'px'] }, { duration: 500, easing: 'cubic-bezier(.16,1,.3,1)' });
        anim.onfinish = () => { anim = null; if (lenis) lenis.resize(); };
      }
    });
  });

  // ---------- copy buttons ----------
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', () => {
    const input = $(btn.dataset.copy);
    const done = () => { btn.textContent = 'Copied'; btn.classList.add('copied'); setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1600); };
    const fallback = () => { input.focus(); input.select(); btn.textContent = 'Press Ctrl+C'; };
    try { navigator.clipboard.writeText(input.value).then(done, fallback); } catch (err) { fallback(); }
  }));

  show(location.hash.slice(1) || 'home', false);

  // Fonts change link widths, so measure again once they've loaded.
  if (document.fonts) document.fonts.ready.then(() => { placeLine(currentLink()); updateToc(); });
})();
