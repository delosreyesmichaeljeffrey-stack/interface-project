// A story page counts as read on the storefront's listahan too.
const story = document.querySelector('.kwento');
try {
  const read = new Set(JSON.parse(sessionStorage.getItem('tingi-read') || '[]'));
  read.add(story.dataset.story);
  sessionStorage.setItem('tingi-read', JSON.stringify([...read]));
} catch (error) { /* storage unavailable: nothing to remember */ }

// How far down the page you have read, drawn along the listahan's red margin.
const margin = document.createElement('span');
margin.className = 'kwento-progress';
margin.setAttribute('aria-hidden', 'true');
story.append(margin);
let ticking = false;
const measure = () => {
  ticking = false;
  const box = story.getBoundingClientRect();
  const read = (window.innerHeight * 0.6 - box.top) / box.height;
  story.style.setProperty('--read', Math.min(1, Math.max(0, read)).toFixed(3));
};
window.addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(measure); }
}, { passive: true });
window.addEventListener('resize', measure);
measure();
