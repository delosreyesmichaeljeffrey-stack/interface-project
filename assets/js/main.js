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
    lead: 'Affordable today, plastic waste for a long time after.',
    body: 'Small packs make goods affordable today, but the bigger pack can cost less per unit, and every sachet becomes plastic waste.'
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

// Runs a change inside the story dialog as a view transition where the
// browser supports it. `kind` (vt-open, vt-close, vt-next, vt-prev) lets the
// CSS style it; `artId` names the one product drawing allowed to travel.
function transition(kind, update, artId) {
  if (!document.startViewTransition || reduceMotion.matches) {
    update();
    return Promise.resolve();
  }
  root.classList.add('vt-dialog', kind);
  if (artId) root.dataset.vtArt = artId;
  const vt = document.startViewTransition(update);
  return vt.finished.finally(() => {
    root.classList.remove('vt-dialog', kind);
    delete root.dataset.vtArt;
  });
}

/* ---------- The shutter: lifted once per visit ---------- */

// index.html's inline <head> script adds .shutter-run before the first paint,
// so the open shelves never flash. Lift it once the sign's fonts are ready.
const shutter = document.querySelector('.shutter');
if (root.classList.contains('shutter-run')) {
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 800))])
    .then(() => root.classList.add('shutter-go'));
  shutter.addEventListener('animationend', () => {
    root.classList.remove('shutter-run', 'shutter-go');
  }, { once: true });
  // In a hurry? A click lifts it straight away.
  shutter.addEventListener('click', () => {
    root.classList.add('shutter-go');
    shutter.getAnimations().forEach((animation) => { animation.playbackRate = 4; });
  });
}
try { sessionStorage.setItem('tingi-opened', 'yes'); } catch (error) { /* ignore */ }

/* ---------- Depth: the grill drifts a little as the pointer moves ---------- */

// Things closer to you move more than things further away. The rehas (front)
// moves most, the shelves (behind it) a little the other way.
const storeWindow = document.querySelector('.window');
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let frame = 0;
  let x = 0;
  let y = 0;
  const apply = () => {
    frame = 0;
    storeWindow.style.setProperty('--px', x.toFixed(3));
    storeWindow.style.setProperty('--py', y.toFixed(3));
  };
  storeWindow.addEventListener('pointermove', (event) => {
    if (reduceMotion.matches) return;
    const box = storeWindow.getBoundingClientRect();
    x = ((event.clientX - box.left) / box.width - 0.5) * 2;
    y = ((event.clientY - box.top) / box.height - 0.5) * 2;
    if (!frame) frame = requestAnimationFrame(apply);
  });
  storeWindow.addEventListener('pointerleave', () => {
    x = 0;
    y = 0;
    if (!frame) frame = requestAnimationFrame(apply);
  });
}

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

// Stories read since the dialog last closed: their stamp, sachet and the
// count are celebrated once the reader is back at the shelf to see them.
const fresh = new Set();
const pop = { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' };

function renderRead() {
  buttons.forEach((button, id) => {
    const isRead = read.has(id);
    button.classList.toggle('is-read', isRead);
    // a freshly read story keeps its stamp hidden until the reader is back at the shelf
    button.classList.toggle('stamp-pending', fresh.has(id) && !reduceMotion.matches);
    button.querySelector('.read-label').textContent = isRead ? ' (read)' : '';
    tokens.get(id).classList.toggle('is-read', isRead);
  });
  readCount.textContent = read.size;
}

function celebrate(latest) {
  if (read.size === order.length) {
    say('“Kumpleto! Balik ka ulit, ha!”');
  } else if (latest) {
    say('“' + greetings[latest] + '”');
  }
  if (!reduceMotion.matches && fresh.size) {
    let delay = 0;
    fresh.forEach((id) => {
      buttons.get(id).classList.remove('stamp-pending');
      buttons.get(id).querySelector('.stamp').animate(
        [{ scale: 1.9, opacity: 0 }, { scale: 1, opacity: 1 }], { ...pop, delay, fill: 'backwards' }
      );
      tokens.get(id).animate([{ scale: 1.6 }, { scale: 1 }], { ...pop, delay: delay + 120 });
      delay += 90;
    });
    readCount.animate([{ scale: 1.7 }, { scale: 1 }], { ...pop, delay: 160 });
  }
  buttons.forEach((button) => button.classList.remove('stamp-pending'));
  fresh.clear();
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
  art.dataset.story = id;

  const index = order.indexOf(id);
  const before = order[(index + order.length - 1) % order.length];
  const after = order[(index + 1) % order.length];
  prev.textContent = '← ' + stories[before].title;
  prev.dataset.story = before;
  next.textContent = stories[after].title + ' →';
  next.dataset.story = after;

  if (!read.has(id)) fresh.add(id);
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
  }, id).then(renderRead);
}

// Stepping to another story turns the page, left or right.
function step(id, direction) {
  transition('vt-' + direction, () => {
    buttons.get(current).classList.remove('is-lifted');
    buttons.get(id).classList.add('is-lifted');
    fill(id);
  }).then(renderRead);
  lastTrigger = buttons.get(id);
}

// Closing puts the product back on its shelf.
function close() {
  if (!dialog.open) return;
  const closing = current;
  transition('vt-close', () => {
    dialog.close();
    buttons.forEach((button) => button.classList.remove('is-lifted'));
  }, closing).then(() => celebrate(closing));
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
  if (lastTrigger) lastTrigger.focus();
});

renderRead();
