// Stamps "Nabili na" on the stories already read, like the storefront shelves.
let read = [];
try { read = JSON.parse(sessionStorage.getItem('tingi-read') || '[]'); } catch (error) { /* storage unavailable */ }
document.querySelectorAll('.item').forEach((item) => {
  const isRead = read.includes(item.dataset.story);
  item.classList.toggle('is-read', isRead);
  item.dataset.read = isRead ? 'yes' : '';
});
const readLabels = () => document.querySelectorAll('.item').forEach((item) => {
  const filNow = window.Tingi && window.Tingi.lang === 'fil';
  item.querySelector('.read-label').textContent = item.dataset.read ? (filNow ? ' (nabasa na)' : ' (read)') : '';
});
readLabels();
document.addEventListener('tingi:lang', readLabels);

/* ---------- Ilista mo: the visitor adds a line to the listahan ---------- */

// The site is static (no server), so entries are kept in this browser only,
// which the form says plainly.
const KEY = 'tingi-ilista';
const MAX_ENTRIES = 12;
const form = document.getElementById('ilista-form');
const list = document.getElementById('ilista-entries');
const text = document.getElementById('ilista-text');
const nameInput = document.getElementById('ilista-name');
const error = document.getElementById('ilista-error');
const left = document.getElementById('ilista-left');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const fil = () => window.Tingi && window.Tingi.lang === 'fil';

let entries = [];
try { entries = JSON.parse(localStorage.getItem(KEY) || '[]').filter((entry) => entry && entry.text); } catch (error) { /* storage unavailable */ }

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch (error) { /* ignore */ }
}

function entryItem(entry, index) {
  const li = document.createElement('li');
  li.className = 'ilista-entry ilista-entry--mine';
  const who = document.createElement('span');
  who.className = 'ilista-who';
  who.textContent = entry.name || (fil() ? 'Ikaw' : 'You');
  const words = document.createElement('span');
  words.textContent = entry.text;
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'ilista-remove';
  remove.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
  remove.setAttribute('aria-label', fil() ? 'Burahin ang linyang ito' : 'Erase this line');
  remove.addEventListener('click', () => {
    entries.splice(index, 1);
    save();
    render();
    text.focus();
  });
  li.append(who, ' ', words, remove);
  return li;
}

function render() {
  list.querySelectorAll('.ilista-entry--mine').forEach((li) => li.remove());
  entries.forEach((entry, index) => list.append(entryItem(entry, index)));
}

function count() {
  left.textContent = text.maxLength - text.value.length;
}

text.addEventListener('input', () => {
  count();
  if (text.value.trim()) error.textContent = '';
  text.removeAttribute('aria-invalid');
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = text.value.trim();
  if (!value) {
    error.textContent = fil() ? 'Isulat muna ang alaala mo.' : 'Write your memory first.';
    text.setAttribute('aria-invalid', 'true');
    text.focus();
    return;
  }
  entries.push({ name: nameInput.value.trim(), text: value });
  if (entries.length > MAX_ENTRIES) entries.shift();
  save();
  render();
  form.reset();
  count();
  if (window.Tingi) window.Tingi.sound.play('page');
  // the new line is written in, like ink on the page
  const added = list.lastElementChild;
  if (added && !reduceMotion.matches) {
    added.animate(
      [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
      { duration: 700, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)' }
    );
  }
});

// "You"/"Ikaw" and the erase labels follow the language switch
document.addEventListener('tingi:lang', () => {
  render();
  if (error.textContent) error.textContent = fil() ? 'Isulat muna ang alaala mo.' : 'Write your memory first.';
});

render();
count();
