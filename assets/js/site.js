// Shared by every page: page-to-page transitions (in browsers that support
// them) and arrow-key shortcuts between story pages.
// Loaded in <head> so it is ready before the new page is first shown.

(() => {
  const STEP_KEY = 'tingi-step';
  const root = document.documentElement;

  // The story a page is about, from its address (kwento/<story>.html).
  const storyOf = (url) => {
    if (!url) return null;
    const match = new URL(url, location.href).pathname.match(/\/kwento\/([a-z]+)\.html$/);
    return match ? match[1] : null;
  };
  const isStep = () => root.classList.contains('vt-next') || root.classList.contains('vt-prev');

  // When a reader moves to the next or previous story, remember the
  // direction so both pages can slide the same way.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-step]');
    if (!link) return;
    document.documentElement.classList.add('vt-' + link.dataset.step);
    try { sessionStorage.setItem(STEP_KEY, link.dataset.step); } catch (error) { /* ignore */ }
  });

  // Leaving this page: only the drawing of the story being opened (or left)
  // travels to the next page; everything else fades with the page.
  window.addEventListener('pageswap', (event) => {
    if (!event.viewTransition) return;
    // a scrolled page's nav is off-screen: let it fade instead of dropping in
    if (window.scrollY > 40) root.dataset.vtScrolled = '';
    if (isStep()) return;
    const to = event.activation && event.activation.entry && event.activation.entry.url;
    const id = storyOf(to) || storyOf(location.href);
    if (id) root.dataset.vtArt = id;
  });

  // Coming back to this page from the back/forward cache: clear old transition state.
  window.addEventListener('pageshow', () => {
    root.classList.remove('vt-next', 'vt-prev');
    delete root.dataset.vtArt;
    delete root.dataset.vtScrolled;
  });

  window.addEventListener('pagereveal', (event) => {
    let step = null;
    try {
      step = sessionStorage.getItem(STEP_KEY);
      sessionStorage.removeItem(STEP_KEY);
    } catch (error) { /* ignore */ }
    if (!event.viewTransition) return;
    if (step) {
      root.classList.add('vt-' + step);
    } else {
      const from = window.navigation && navigation.activation && navigation.activation.from;
      const id = storyOf(location.href) || storyOf(from && from.url);
      if (id) root.dataset.vtArt = id;
    }
    event.viewTransition.finished.finally(() => {
      root.classList.remove('vt-next', 'vt-prev');
      delete root.dataset.vtArt;
    });
  });

  // ← and → move between story pages.
  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const step = { ArrowLeft: 'prev', ArrowRight: 'next' }[event.key];
    if (!step) return;
    const link = document.querySelector('.kwento-nav a[data-step="' + step + '"]');
    if (link) link.click();
  });
  // Phones: the nav folds into a burger button. The button is added here so
  // all pages share it; without JS the normal nav stays visible.
  const setupMenu = () => {
    const header = document.querySelector('.site-nav');
    const nav = header && header.querySelector('nav');
    if (!nav || header.querySelector('.nav-toggle')) return;
    root.classList.add('nav-js');
    nav.id = nav.id || 'site-menu';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nav-toggle';
    button.setAttribute('aria-controls', nav.id);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Menu');
    button.innerHTML = '<span class="nav-toggle-bars" aria-hidden="true"></span>';
    header.insertBefore(button, nav);
    const setOpen = (open) => {
      header.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
    };
    button.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
    nav.addEventListener('click', (event) => { if (event.target.closest('a')) setOpen(false); });
    document.addEventListener('click', (event) => { if (!header.contains(event.target)) setOpen(false); });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && header.classList.contains('is-open')) { setOpen(false); button.focus(); }
    });
    // a page restored from the back button should not come back with the menu open
    window.addEventListener('pageshow', () => setOpen(false));
  };
  // Photos open in a larger view. The viewer is built here so every page shares it.
  const setupPhotos = () => {
    const photos = document.querySelectorAll('.photo-slot.has-photo img');
    if (!photos.length || !window.HTMLDialogElement) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const viewer = document.createElement('dialog');
    viewer.className = 'viewer';
    viewer.setAttribute('aria-label', 'Photo');
    viewer.innerHTML =
      '<figure class="viewer-photo"><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="story-close viewer-close" aria-label="Close photo">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></button>';
    document.body.append(viewer);
    const big = viewer.querySelector('img');
    const caption = viewer.querySelector('figcaption');
    let source = null;

    // The photo itself travels between its frame and the viewer.
    const move = (update) => {
      if (!document.startViewTransition || reduce.matches) { update(); return; }
      root.classList.add('vt-photo');
      document.startViewTransition(update).finished.finally(() => root.classList.remove('vt-photo'));
    };
    const open = (img) => {
      source = img;
      const frame = img.closest('.photo');
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      big.width = img.naturalWidth || 1200;
      big.height = img.naturalHeight || 900;
      const text = frame.querySelector('.photo-caption');
      const credit = frame.querySelector('.photo-credit');
      caption.replaceChildren();
      if (text) {
        const line = document.createElement('span');
        line.className = 'viewer-caption';
        if (text.lang) line.lang = text.lang;
        line.textContent = [...text.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent).join('').trim();
        caption.append(line);
      }
      if (credit) caption.append(credit.cloneNode(true));
      img.classList.add('is-zooming');
      move(() => {
        img.classList.remove('is-zooming');
        img.classList.add('is-zoomed');
        viewer.showModal();
      });
    };
    const close = () => {
      if (!viewer.open) return;
      const img = source;
      move(() => {
        viewer.close();
        if (img) { img.classList.remove('is-zoomed'); img.classList.add('is-zooming'); }
      });
      // the name is only needed while the photo travels back
      setTimeout(() => { if (img) img.classList.remove('is-zooming'); }, 600);
    };

    photos.forEach((img) => {
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Enlarge photo: ' + img.alt);
      img.addEventListener('click', () => open(img));
      img.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(img); }
      });
    });
    viewer.querySelector('.viewer-close').addEventListener('click', close);
    viewer.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
    viewer.addEventListener('click', (event) => { if (event.target === viewer) close(); });
    viewer.addEventListener('close', () => { if (source) source.focus({ preventScroll: true }); });
  };

  // Things below the first screen arrive once, as they scroll into view:
  // photos are taped up, price-board rows are chalked in, the quote is written.
  // Nothing is hidden unless this script runs and motion is allowed.
  const setupReveal = () => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const items = document.querySelectorAll('.photo-wall .photo, .photo--story, .kwento-quote, .price-row, .kwento-sources');
    if (!items.length) return;
    const seen = new IntersectionObserver((entries) => {
      let order = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty('--reveal-delay', order++ * 90 + 'ms');
        entry.target.classList.add('is-in');
        seen.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach((item) => {
      // what is already on screen stays as it is
      if (item.getBoundingClientRect().top < window.innerHeight * 0.92) return;
      item.classList.add('reveal');
      seen.observe(item);
    });
  };

  const ready = () => { setupMenu(); setupPhotos(); setupReveal(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
