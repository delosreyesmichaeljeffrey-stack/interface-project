// Storefront: lifts the shutter on the first visit, passes each picked product
// out through the store's little window, opens its story, lets readers step
// through all five, and keeps a listahan of the stories already read.

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
    // the five story products hop one after another: these are the ones to pick
    order.forEach((id, index) => {
      buttons.get(id).querySelector('svg').animate(
        [{ translate: '0 0' }, { translate: '0 -16px', offset: 0.4 }, { translate: '0 0' }],
        { duration: 460, delay: 250 + index * 90, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
      );
    });
  }, { once: true });
  // In a hurry? A click lifts it straight away.
  shutter.addEventListener('click', () => {
    root.classList.add('shutter-go');
    shutter.getAnimations().forEach((animation) => { animation.playbackRate = 4; });
  });
}
try { sessionStorage.setItem('tingi-opened', 'yes'); } catch (error) { /* ignore */ }

/* ---------- Depth: the store's layers drift as the pointer moves ---------- */

// Things closer to you move more than things further away: the goods clipped
// to the outside of the grill move most, then the grill, and the back row of
// each shelf moves a little the other way. The CSS reads --px and --py.
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

/* ---------- Quiet background motion ---------- */

// Hanging goods sway, the bulb's light breathes, the cat's tail flicks. The
// CSS only runs these while .is-ambient is set, so they stop when the store is
// scrolled away or the tab is hidden.
const storefront = document.querySelector('.storefront');
if ('IntersectionObserver' in window) {
  let onScreen = false;
  const setAmbient = () => storefront.classList.toggle('is-ambient', onScreen && !document.hidden);
  new IntersectionObserver((entries) => {
    onScreen = entries[0].isIntersecting;
    setAmbient();
  }).observe(storeWindow);
  document.addEventListener('visibilitychange', setAmbient);
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

/* ---------- Buying through the pass-through window ---------- */

const hatchHole = document.querySelector('.hatch-hole');
const hatchSlot = document.querySelector('.hatch-item');
const hatchHand = document.querySelector('.hatch-hand');
const hatchCoin = document.querySelector('.hatch-coin');
const easeOut = 'cubic-bezier(0.22, 1, 0.36, 1)';
let busy = false;
let purchases = 0;

// Only worth playing when the reader can see the window (at least its top half).
function hatchInView() {
  const box = hatchHole.getBoundingClientRect();
  return box.top >= 0 && box.top + box.height / 2 <= window.innerHeight;
}

// A coin goes in, the tindera takes the product off the shelf and hands it
// out onto the ledge. Resolves when the product is sitting in the window.
function passThrough(id) {
  const button = buttons.get(id);
  const drawing = button.querySelector('svg');
  const from = drawing.getBoundingClientRect();
  const to = hatchHole.getBoundingClientRect();
  const pace = purchases++ ? 0.6 : 1; // the first purchase is shown in full; later ones are quicker

  hatchCoin.animate(
    [
      { translate: '-50% 6px', scale: 1, opacity: 0 },
      { translate: '-50% 0', scale: 1, opacity: 1, offset: 0.2 },
      { translate: '-50% -30px', scale: 0.9, opacity: 1, offset: 0.7 },
      { translate: '-50% -52px', scale: 0.6, opacity: 0 }
    ],
    { duration: 400 * pace, easing: 'ease-in-out' }
  );
  hatchHand.animate(
    [
      { translate: '0 0' },
      { translate: '0 14%', offset: 0.35 },
      { translate: '0 -55%', offset: 0.65 },
      { translate: '0 0' }
    ],
    { duration: 560 * pace, easing: 'ease-in-out' }
  );

  // a copy of the drawing flies from the shelf to the window
  const ghost = drawing.cloneNode(true);
  ghost.classList.add('pick-ghost');
  Object.assign(ghost.style, {
    left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px'
  });
  document.body.append(ghost);
  button.classList.add('is-away');

  const size = Math.min(1, (to.width * 0.32) / from.width, (to.height * 0.42) / from.height);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.bottom - 8 - (from.height * size) / 2 - (from.top + from.height / 2);
  return ghost.animate(
    [
      { transform: 'none' },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 26}px) scale(${(1 + size) / 2}) rotate(-6deg)`, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(${size})` }
    ],
    { duration: 400 * pace, delay: 150 * pace, easing: 'cubic-bezier(0.45, 0, 0.25, 1)', fill: 'both' }
  ).finished.then(() => {
    // the drawing now sits in the window; from there it travels into the story
    hatchSlot.dataset.story = id;
    hatchSlot.replaceChildren(drawing.cloneNode(true));
    button.classList.add('is-lifted'); // only the copy in the window may travel into the story
    ghost.remove();
  });
}

// Tells the CSS where the window is on the story page, so the page can grow
// out of it and shrink back into it.
function setSheetOrigin() {
  const hole = hatchHole.getBoundingClientRect();
  const sheet = dialog.getBoundingClientRect();
  root.style.setProperty('--sheet-ox', hole.left + hole.width / 2 - sheet.left + 'px');
  root.style.setProperty('--sheet-oy', hole.top + hole.height / 2 - sheet.top + 'px');
}

// Opens the story. `fromHatch` makes the page grow out of the window.
function showStory(id, fromHatch) {
  const button = buttons.get(id);
  if (fromHatch) root.classList.add('vt-hatch');
  return transition('vt-open', () => {
    button.classList.add('is-lifted', 'is-away');
    fill(id);
    dialog.showModal();
    if (fromHatch) {
      setSheetOrigin();
      hatchSlot.replaceChildren();
      delete hatchSlot.dataset.story;
    }
  }, id).then(() => {
    root.classList.remove('vt-hatch');
    renderRead();
  });
}

// Picking a product: through the window when it can be seen and motion is
// allowed, otherwise straight from the shelf into the story.
function open(id) {
  if (busy || dialog.open) return;
  lastTrigger = buttons.get(id);
  if (reduceMotion.matches || !document.startViewTransition || !hatchInView()) {
    showStory(id, false);
    return;
  }
  busy = true;
  passThrough(id)
    .then(() => showStory(id, true))
    .finally(() => { busy = false; });
}

// Stepping to another story turns the page, left or right.
function step(id, direction) {
  transition('vt-' + direction, () => {
    buttons.get(current).classList.remove('is-lifted', 'is-away');
    buttons.get(id).classList.add('is-lifted', 'is-away');
    fill(id);
  }).then(renderRead);
  lastTrigger = buttons.get(id);
}

// Closing puts the product back on its shelf.
function close() {
  if (!dialog.open) return;
  const closing = current;
  // The reverse of buying: the page goes back in through the window and the
  // tindera puts the product back, so the drawing travels from her to its
  // shelf (not from the corner of the story page).
  const viaHatch = !reduceMotion.matches && Boolean(document.startViewTransition) && hatchInView();
  if (viaHatch) {
    setSheetOrigin();
    hatchSlot.dataset.story = closing;
    hatchSlot.replaceChildren(buttons.get(closing).querySelector('svg').cloneNode(true));
    delete art.dataset.story; // the copy in the window travels; the one on the page leaves with the page
    root.classList.add('vt-hatch');
    hatchHand.animate(
      [{ translate: '0 0' }, { translate: '0 -55%', offset: 0.4 }, { translate: '0 0' }],
      { duration: 520, easing: 'ease-in-out' }
    );
  }
  transition('vt-close', () => {
    dialog.close();
    hatchSlot.replaceChildren();
    delete hatchSlot.dataset.story;
    buttons.forEach((button) => button.classList.remove('is-lifted', 'is-away'));
  }, closing).then(() => {
    root.classList.remove('vt-hatch');
    celebrate(closing);
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
  if (lastTrigger) lastTrigger.focus();
});

renderRead();
