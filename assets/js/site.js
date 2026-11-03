// Shared by every page: page-to-page transitions (in browsers that support
// them) and arrow-key shortcuts between story pages.
// Loaded in <head> so it is ready before the new page is first shown.

(() => {
  const STEP_KEY = 'tingi-step';

  // When a reader moves to the next or previous story, remember the
  // direction so both pages can slide the same way.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-step]');
    if (!link) return;
    document.documentElement.classList.add('vt-' + link.dataset.step);
    try { sessionStorage.setItem(STEP_KEY, link.dataset.step); } catch (error) { /* ignore */ }
  });

  // The old page is being left (e.g. by the back button): don't keep a stale slide direction.
  window.addEventListener('pageshow', () => {
    document.documentElement.classList.remove('vt-next', 'vt-prev');
  });

  window.addEventListener('pagereveal', (event) => {
    let step = null;
    try {
      step = sessionStorage.getItem(STEP_KEY);
      sessionStorage.removeItem(STEP_KEY);
    } catch (error) { /* ignore */ }
    if (!event.viewTransition || !step) return;
    const root = document.documentElement;
    root.classList.add('vt-' + step);
    event.viewTransition.finished.finally(() => root.classList.remove('vt-' + step));
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
