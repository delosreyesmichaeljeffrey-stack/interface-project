// Storefront: lifts the shutter on the first visit, opens the story behind
// each product, lets readers step through all five, and keeps a listahan of
// the stories already read.

const order = ['tingi', 'utang', 'tambayan', 'signs', 'sachet'];

const stories = {
  tingi: {
    title: 'Tingi',
    lead: 'Buying in small portions to get through one day at a time.',
    body: 'One sachet of shampoo, one cup of rice, one piece of candy. Tingi lets families with a daily budget buy only what they need today.'
  },
  utang: {
    title: 'Utang',
    lead: 'The listahan: credit built on trust between neighbors.',
    body: 'The tindera writes every debt by hand in a notebook. Paying it back is as much about keeping a relationship as it is about money.'
  },
  tambayan: {
    title: 'Tambayan',
    lead: 'The store as the neighborhood’s news hub and meeting place.',
    body: 'People stay for a softdrink, a chat, or the latest news. The bench outside the store is where the community talks.'
  },
  signs: {
    title: 'Signs & labels',
    lead: 'Hand-painted signs and loud packaging as vernacular design.',
    body: 'From painted store names to “Bawal ang utang, bukas pwede,” the sari-sari store is full of everyday Filipino design and humor.'
  },
  sachet: {
    title: 'Sachet economy',
    critique: true,
    lead: 'Paying more per gram, and the plastic waste left behind.',
    body: 'Small packs make goods affordable today, but they often cost more per gram than buying in bulk, and every sachet becomes plastic waste.'
  }
};

const greetings = {
  tingi: 'Isang sachet lang? Sige, tingi lang.',
  utang: 'Ay, nabasa mo na ’yung utang?',
  tambayan: 'Upo ka muna, makipagkwentuhan tayo.',
  signs: 'Napansin mo rin pala ’yung mga karatula.',
  sachet: 'Mura nga, pero saan napupunta ’yung plastic?'
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;

const dialog = document.getElementById('story');
const page = dialog.querySelector('.story-page');
const art = document.getElementById('story-art');
const fields = {
  title: document.getElementById('story-title'),
  lead: document.getElementById('story-lead'),
  body: document.getElementById('story-body')
};
const critique = document.getElementById('story-critique');
const storyLink = document.getElementById('story-link');
const prev = document.getElementById('story-prev');
const next = document.getElementById('story-next');
const greeting = document.getElementById('greeting');
const readCount = document.getElementById('read-count');
const tokens = new Map(
  [...document.querySelectorAll('.tokens i')].map((token) => [token.dataset.story, token])
);
const buttons = new Map(
  [...document.querySelectorAll('.product')].map((button) => [button.dataset.story, button])
);

let current = null;
let lastTrigger = null;

// Runs a DOM change as a view transition where the browser supports it.
// `kind` names the transition so the CSS can style it (vt-open, vt-step, ...).
function transition(kind, update) {
  if (!document.startViewTransition || reduceMotion.matches) {
    update();
    return Promise.resolve();
  }
  root.classList.add(kind);
  const vt = document.startViewTransition(update);
  return vt.finished.finally(() => root.classList.remove(kind));
}

/* ---------- The shutter: lifted once per visit ---------- */

const windowEl = document.querySelector('.window');
let opened = false;
try { opened = sessionStorage.getItem('tingi-opened') === 'yes'; } catch (error) { /* ignore */ }
if (!opened && !reduceMotion.matches) {
  windowEl.classList.add('is-opening');
  windowEl.querySelector('.shutter').addEventListener('animationend', () => {
    windowEl.classList.remove('is-opening');
  }, { once: true });
}
try { sessionStorage.setItem('tingi-opened', 'yes'); } catch (error) { /* ignore */ }

/* ---------- The listahan of read stories ---------- */

const read = new Set();
try {
  JSON.parse(sessionStorage.getItem('tingi-read') || '[]').forEach((id) => {
    if (stories[id]) read.add(id);
  });
} catch (error) { /* storage unavailable: start with an empty listahan */ }

function saveRead() {
  try { sessionStorage.setItem('tingi-read', JSON.stringify([...read])); } catch (error) { /* ignore */ }
}

function say(text) {
  if (greeting.textContent === text) return;
  greeting.textContent = text;
  if (!reduceMotion.matches) {
    greeting.animate(
      [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
      { duration: 320, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
    );
  }
}

function renderRead(latest) {
  buttons.forEach((button, id) => {
    const isRead = read.has(id);
    button.classList.toggle('is-read', isRead);
    button.querySelector('.read-label').textContent = isRead ? ' (read)' : '';
    tokens.get(id).classList.toggle('is-read', isRead);
  });
  if (readCount.textContent !== String(read.size)) {
    readCount.textContent = read.size;
    if (latest && !reduceMotion.matches) {
      readCount.animate(
        [{ transform: 'scale(1.6)' }, { transform: 'scale(1)' }],
        { duration: 360, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );
    }
  }
  if (read.size === order.length) {
    say('“Kumpleto! Balik ka ulit, ha!”');
  } else if (latest) {
    say('“' + greetings[latest] + '”');
  }
}

/* ---------- The story dialog ---------- */

function fill(id) {
  const story = stories[id];
  current = id;
  fields.title.textContent = story.title;
  fields.lead.textContent = story.lead;
  fields.body.textContent = story.body;
  critique.hidden = !story.critique;
  storyLink.href = 'kwento/' + id + '.html';
  art.replaceChildren(buttons.get(id).querySelector('svg').cloneNode(true));
  art.style.viewTransitionName = 'art-' + id;

  const index = order.indexOf(id);
  const before = order[(index + order.length - 1) % order.length];
  const after = order[(index + 1) % order.length];
  prev.textContent = '← ' + stories[before].title;
  prev.dataset.story = before;
  next.textContent = stories[after].title + ' →';
  next.dataset.story = after;

  read.add(id);
  saveRead();
}

// The product's own drawing travels from the shelf into the story.
function open(id) {
  const button = buttons.get(id);
  lastTrigger = button;
  transition('vt-open', () => {
    button.classList.add('is-lifted');
    fill(id);
    dialog.showModal();
  }).then(() => renderRead(id));
}

// Stepping to another story turns the page, left or right.
function step(id, direction) {
  transition('vt-' + direction, () => {
    buttons.get(current).classList.remove('is-lifted');
    buttons.get(id).classList.add('is-lifted');
    fill(id);
  }).then(() => renderRead(id));
  lastTrigger = buttons.get(id);
}

// Closing puts the product back on its shelf.
function close() {
  if (!dialog.open) return;
  transition('vt-close', () => {
    dialog.close();
    buttons.forEach((button) => button.classList.remove('is-lifted'));
  });
}

buttons.forEach((button, id) => {
  button.addEventListener('click', () => open(id));
});

prev.addEventListener('click', () => step(prev.dataset.story, 'prev'));
next.addEventListener('click', () => step(next.dataset.story, 'next'));

dialog.querySelector('.story-close').addEventListener('click', (event) => {
  event.preventDefault();
  close();
});

// Escape closes with the same motion as the close button.
dialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  close();
});

// Close when clicking the dimmed area around the story.
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) close();
});

// ← and → step through the stories while one is open.
dialog.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === 'ArrowLeft') step(prev.dataset.story, 'prev');
  if (event.key === 'ArrowRight') step(next.dataset.story, 'next');
});

// Return focus to the product of the story that was last open.
dialog.addEventListener('close', () => {
  art.style.viewTransitionName = '';
  if (lastTrigger) lastTrigger.focus();
});

renderRead(null);
