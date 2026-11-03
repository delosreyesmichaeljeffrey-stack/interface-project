// A story page counts as read on the storefront's listahan too.
const story = document.querySelector('.kwento');
try {
  const read = new Set(JSON.parse(sessionStorage.getItem('tingi-read') || '[]'));
  read.add(story.dataset.story);
  sessionStorage.setItem('tingi-read', JSON.stringify([...read]));
} catch (error) { /* storage unavailable: nothing to remember */ }
