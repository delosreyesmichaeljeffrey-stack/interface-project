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
})();
