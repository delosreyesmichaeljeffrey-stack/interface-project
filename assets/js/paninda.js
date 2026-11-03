// Stamps "Nabili na" on the stories already read, like the storefront shelves.
let read = [];
try { read = JSON.parse(sessionStorage.getItem('tingi-read') || '[]'); } catch (error) { /* storage unavailable */ }
document.querySelectorAll('.item').forEach((item) => {
  const isRead = read.includes(item.dataset.story);
  item.classList.toggle('is-read', isRead);
  item.querySelector('.read-label').textContent = isRead ? ' (read)' : '';
});
