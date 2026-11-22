// Shared by every page: page-to-page transitions (in browsers that support
// them) and arrow-key shortcuts between story pages.
// Loaded in <head> so it is ready before the new page is first shown.

(() => {
  const STEP_KEY = 'tingi-step';
  const LANG_KEY = 'tingi-lang';
  const SOUND_KEY = 'tingi-sound';
  const root = document.documentElement;

  /* ---------- Language: English or Filipino ---------- */

  // Pages carry both languages: elements marked .t-en and .t-fil, and the CSS
  // shows one set. It is set here, before the page is drawn, so the other
  // language never flashes. Scripts with their own text listen for 'tingi:lang'.
  let lang = 'en';
  try { if (localStorage.getItem(LANG_KEY) === 'fil') lang = 'fil'; } catch (error) { /* ignore */ }
  const applyLang = () => {
    root.dataset.lang = lang;
    root.lang = lang === 'fil' ? 'fil' : 'en';
  };
  applyLang();
  // Text nobody sees on screen (alt text, button labels, the tab title, the
  // page description) is swapped here: data-fil-alt, data-fil-aria-label,
  // data-fil-content, and data-fil on <title>.
  const ATTRS = ['alt', 'aria-label', 'content', 'placeholder'];
  const applyAttrs = () => {
    ATTRS.forEach((attr) => {
      const key = 'fil' + attr.replace(/(^|-)([a-z])/g, (m, dash, c) => c.toUpperCase());
      const keep = 'en' + key.slice(3);
      document.querySelectorAll('[data-fil-' + attr + ']').forEach((el) => {
        if (!(keep in el.dataset)) el.dataset[keep] = el.getAttribute(attr) || '';
        el.setAttribute(attr, lang === 'fil' ? el.dataset[key] : el.dataset[keep]);
      });
    });
    const title = document.querySelector('title[data-fil]');
    if (title) {
      if (!title.dataset.en) title.dataset.en = title.textContent;
      document.title = lang === 'fil' ? title.dataset.fil : title.dataset.en;
    }
  };
  if (lang === 'fil') {
    // the head is parsed by now, so the title and description can change at once
    applyAttrs();
    document.addEventListener('DOMContentLoaded', applyAttrs);
  }
  const setLang = (next) => {
    if (next === lang) return;
    lang = next;
    applyLang();
    applyAttrs();
    try { localStorage.setItem(LANG_KEY, lang); } catch (error) { /* ignore */ }
    document.dispatchEvent(new CustomEvent('tingi:lang', { detail: lang }));
  };

  /* ---------- Store sounds (off until the visitor turns them on) ---------- */

  // Made in the browser with Web Audio, so there are no sound files to load.
  const sound = (() => {
    let on = false;
    try { on = localStorage.getItem(SOUND_KEY) === 'on'; } catch (error) { /* ignore */ }
    let ctx = null;
    let out = null;
    const start = () => {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) {
        ctx = new AC();
        out = ctx.createGain();
        out.gain.value = 0.55;
        out.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    };
    // a tone that fades out (optionally gliding to `to` Hz)
    const tone = (t, freq, dur, { type = 'sine', gain = 0.2, to } = {}) => {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.exponentialRampToValueAtTime(gain, t + 0.005);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(amp).connect(out);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    };
    // a burst of filtered noise: paper, wood, metal
    const noise = (t, dur, { type = 'lowpass', freq = 1000, to, q = 0.8, gain = 0.2, attack = 0.004 } = {}) => {
      const length = Math.max(1, Math.round(ctx.sampleRate * dur));
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = type;
      filter.Q.value = q;
      filter.frequency.setValueAtTime(freq, t);
      if (to) filter.frequency.exponentialRampToValueAtTime(to, t + dur);
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.exponentialRampToValueAtTime(gain, t + attack);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(filter).connect(amp).connect(out);
      src.start(t);
      return amp;
    };
    const sounds = {
      // a piso on the counter: two bright rings
      coin(t) {
        tone(t, 2093, 0.32, { gain: 0.16 });
        tone(t, 3136, 0.22, { gain: 0.07, type: 'triangle' });
        tone(t + 0.09, 2637, 0.4, { gain: 0.12 });
        tone(t + 0.09, 3951, 0.25, { gain: 0.05, type: 'triangle' });
      },
      // a product set down on the wooden ledge
      thunk(t) {
        tone(t, 160, 0.14, { gain: 0.35, to: 70 });
        noise(t, 0.05, { freq: 700, gain: 0.12 });
      },
      // a page of the listahan turning
      page(t) {
        noise(t, 0.26, { type: 'bandpass', freq: 900, to: 3200, q: 0.6, gain: 0.09, attack: 0.06 });
      },
      // the rubber stamp: Nabili na
      stamp(t) {
        tone(t, 110, 0.16, { gain: 0.4, to: 55 });
        noise(t, 0.05, { freq: 1500, gain: 0.18 });
      },
      // the roll-up shutter rattling open
      shutter(t) {
        const amp = noise(t, 1.25, { type: 'bandpass', freq: 1600, to: 900, q: 0.7, gain: 0.11, attack: 0.08 });
        const lfo = ctx.createOscillator();
        const depth = ctx.createGain();
        lfo.type = 'square';
        lfo.frequency.value = 22;
        depth.gain.value = 0.05;
        lfo.connect(depth).connect(amp.gain);
        lfo.start(t);
        lfo.stop(t + 1.25);
        tone(t + 1.1, 95, 0.2, { gain: 0.25, to: 60 });
      },
      // all five stories read: a small bell
      ding(t) {
        tone(t, 1319, 1.1, { gain: 0.13 });
        tone(t, 2637, 0.6, { gain: 0.04 });
        tone(t + 0.16, 1976, 1.3, { gain: 0.11 });
      },
      // the order slip tearing off
      tear(t) {
        noise(t, 0.35, { type: 'highpass', freq: 2500, to: 5000, gain: 0.08, attack: 0.02 });
      }
    };
    return {
      get on() { return on; },
      set(value) {
        on = value;
        try { localStorage.setItem(SOUND_KEY, on ? 'on' : 'off'); } catch (error) { /* ignore */ }
        document.dispatchEvent(new CustomEvent('tingi:sound', { detail: on }));
        if (on) this.play('coin');
      },
      play(name, delay = 0) {
        if (!on || !sounds[name]) return;
        if (!start()) return;
        try { sounds[name](ctx.currentTime + 0.01 + delay / 1000); } catch (error) { /* ignore */ }
      }
    };
  })();

  // Shared with the page scripts (main.js, pabili.js, the Ilista mo notebook).
  window.Tingi = {
    sound,
    get lang() { return lang; },
    setLang
  };

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
    // not while a pop-up is open (an enlarged photo, the phone menu's own keys)
    if (document.querySelector('dialog[open]')) return;
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
    const label = () => button.setAttribute('aria-label', lang === 'fil' ? 'Menu ng mga pahina' : 'Menu');
    label();
    document.addEventListener('tingi:lang', label);
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
    const t = (en, fil) => (lang === 'fil' ? fil : en);
    viewer.innerHTML =
      '<figure class="viewer-photo"><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="story-close viewer-close">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></button>';
    document.body.append(viewer);
    const big = viewer.querySelector('img');
    const caption = viewer.querySelector('figcaption');
    let source = null;

    // The photo itself travels between its frame and the viewer.
    const move = (update) => {
      if (!document.startViewTransition || reduce.matches) { update(); return; }
      root.classList.add('vt-photo');
      document.startViewTransition(update).finished.catch(() => {}).finally(() => root.classList.remove('vt-photo'));
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
        // the caption without its credit line (it may hold both languages)
        const line = document.createElement('span');
        line.className = 'viewer-caption';
        if (text.lang) line.lang = text.lang;
        const copy = text.cloneNode(true);
        copy.querySelectorAll('.photo-credit').forEach((node) => node.remove());
        line.append(...copy.childNodes);
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
      // (its label follows the language switch; see labelPhotos below)
      img.addEventListener('click', () => open(img));
      img.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(img); }
      });
    });
    const labelPhotos = () => {
      viewer.setAttribute('aria-label', t('Photo', 'Litrato'));
      viewer.querySelector('.viewer-close').setAttribute('aria-label', t('Close photo', 'Isara ang litrato'));
      photos.forEach((img) => img.setAttribute('aria-label', t('Enlarge photo: ', 'Palakihin ang litrato: ') + img.alt));
    };
    labelPhotos();
    // alt text is swapped by the language switch first, then the labels follow
    document.addEventListener('tingi:lang', labelPhotos);
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

  // The language switch and the sound button sit in the header on every page.
  const setupTools = () => {
    const header = document.querySelector('.site-nav');
    if (!header || header.querySelector('.nav-tools')) return;
    const tools = document.createElement('div');
    tools.className = 'nav-tools';
    tools.innerHTML =
      '<div class="lang-switch" role="group" aria-label="Wika / Language">' +
        '<button type="button" data-lang="fil" lang="fil">FIL</button>' +
        '<button type="button" data-lang="en" lang="en">ENG</button>' +
      '</div>' +
      '<button type="button" class="sound-toggle">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/>' +
        '<path class="sound-waves" d="M16 9c1.3 1.6 1.3 4.4 0 6M18.5 6.5c2.8 3 2.8 8 0 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
        '<path class="sound-off" d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
        '<span class="sound-label"></span>' +
      '</button>';
    const nav = header.querySelector('nav');
    header.insertBefore(tools, nav);

    const langButtons = tools.querySelectorAll('[data-lang]');
    const soundButton = tools.querySelector('.sound-toggle');
    const soundLabel = tools.querySelector('.sound-label');
    const render = () => {
      langButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.lang === lang)));
      soundButton.setAttribute('aria-pressed', String(sound.on));
      soundButton.classList.toggle('is-on', sound.on);
      const word = lang === 'fil' ? 'Tunog' : 'Sound';
      soundLabel.textContent = word;
      langButtons.forEach((button) => {
        const fil = button.dataset.lang === 'fil';
        button.setAttribute('aria-label', lang === 'fil' ? (fil ? 'Filipino' : 'Ingles') : (fil ? 'Filipino' : 'English'));
      });
      soundButton.removeAttribute('aria-label');
      soundButton.title = lang === 'fil' ? 'Mga tunog ng tindahan' : 'Store sounds';
    };
    langButtons.forEach((button) => button.addEventListener('click', () => setLang(button.dataset.lang)));
    soundButton.addEventListener('click', () => sound.set(!sound.on));
    document.addEventListener('tingi:lang', render);
    document.addEventListener('tingi:sound', render);
    render();
  };

  // Figures count up from zero the first time they scroll into view. The real
  // value is already in the HTML, so without this script (or with reduced
  // motion) it simply shows the number.
  const setupCounters = () => {
    const counts = document.querySelectorAll('.count[data-to]');
    if (!counts.length || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const run = (el) => {
      const to = parseFloat(el.dataset.to);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const start = performance.now();
      const duration = 1200;
      const frame = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (to * eased).toFixed(decimals);
        if (t < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    const seen = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        seen.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counts.forEach((el) => {
      // screen readers get the real figure at once; the counting copy is hidden from them
      const real = document.createElement('span');
      real.className = 'visually-hidden';
      real.textContent = el.textContent;
      el.before(real);
      el.setAttribute('aria-hidden', 'true');
      el.textContent = (0).toFixed(parseInt(el.dataset.decimals || '0', 10));
      seen.observe(el);
    });
  };

  const ready = () => { setupTools(); setupMenu(); setupPhotos(); setupReveal(); setupCounters(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
