// Storefront: lifts the shutter on the first visit, passes each picked product
// out through the store's little window, opens its story, lets readers step
// through all five, and keeps a listahan of the stories already read.

const order = ['tingi', 'utang', 'tambayan', 'signs', 'sachet'];

const stories = {
  tingi: {
    title: 'Tingi',
    photo: 'Sachets hanging at a sari-sari store counter',
    lead: 'Buying in small portions to get through one day at a time.',
    body: 'One sachet of shampoo, one cup of rice, one piece of candy. Tingi lets families with a daily budget buy only what they need today.'
  },
  utang: {
    title: 'Utang',
    photo: 'A tindera and a customer at a store in Samal, Davao',
    lead: 'The listahan: credit built on trust between neighbors.',
    body: 'The tindera writes every debt by hand in a notebook. Paying it back is as much about keeping a relationship as it is about money.'
  },
  tambayan: {
    title: 'Tambayan',
    photo: 'A row of small stores in Bilar, Bohol',
    lead: 'The store as the neighborhood’s news hub and meeting place.',
    body: 'People stay for a softdrink, a chat, or the latest news. The bench outside the store is where the community talks.'
  },
  signs: {
    title: 'Signs & labels',
    photo: 'A hand-painted sari-sari store sign',
    lead: 'Hand-painted signs and loud packaging as vernacular design.',
    body: 'From painted store names to “Bawal ang utang, bukas pwede,” the sari-sari store is full of everyday Filipino design and humor.'
  },
  sachet: {
    title: 'Sachet economy',
    photo: 'Empty sachets and plastic bags in Bohol',
    critique: true,
    lead: 'Affordable today, plastic waste for a long time after.',
    body: 'Small packs make goods affordable today, but the bigger pack can cost less per unit, and every sachet becomes plastic waste.'
  }
};

// The same five stories in Filipino, shown when the language switch is on FIL.
const storiesFil = {
  tingi: {
    title: 'Tingi',
    photo: 'Mga sachet na nakasabit sa counter ng sari-sari store',
    lead: 'Pagbili nang paunti-unti para mairaos ang isang araw.',
    body: 'Isang sachet ng shampoo, isang tasang bigas, isang pirasong kendi. Sa tingi, nabibili ng pamilyang may arawang budget ang kailangan lang nila ngayong araw.'
  },
  utang: {
    title: 'Utang',
    photo: 'Isang tindera at isang mamimili sa tindahan sa Samal, Davao',
    lead: 'Ang listahan: pautang na nakasalalay sa tiwala ng magkakapitbahay.',
    body: 'Isinusulat ng tindera ang bawat utang sa isang kuwaderno. Ang pagbabayad ay hindi lang tungkol sa pera kundi pati sa pag-iingat ng samahan.'
  },
  tambayan: {
    title: 'Tambayan',
    photo: 'Isang hanay ng maliliit na tindahan sa Bilar, Bohol',
    lead: 'Ang tindahan bilang sentro ng balita at tagpuan ng kapitbahayan.',
    body: 'Tumatambay ang mga tao para sa softdrinks, kwentuhan, o pinakabagong balita. Sa bangko sa labas ng tindahan nag-uusap ang komunidad.'
  },
  signs: {
    title: 'Mga karatula',
    photo: 'Isang karatula ng sari-sari store na pininta sa kamay',
    lead: 'Mga karatulang pininta sa kamay at matitingkad na pakete bilang disenyong bernakular.',
    body: 'Mula sa pinintang pangalan ng tindahan hanggang sa “Bawal ang utang, bukas pwede,” puno ang sari-sari store ng pang-araw-araw na disenyo at biro ng mga Pilipino.'
  },
  sachet: {
    title: 'Ekonomi\u00ADyang sachet', // soft hyphen: the long word may break on phones
    photo: 'Mga gamit nang sachet at plastic bag sa Bohol',
    critique: true,
    lead: 'Abot-kaya ngayon, basurang plastik nang matagal pagkatapos.',
    body: 'Abot-kaya ang maliliit na pakete ngayon, pero minsan mas mura bawat yunit ang mas malaki, at nagiging basurang plastik ang bawat sachet.'
  }
};
const isFil = () => Boolean(window.Tingi) && window.Tingi.lang === 'fil';
const storyOf = (id) => (isFil() ? storiesFil : stories)[id];

const greetings = {
  tingi: 'Isang sachet lang? Sige, tingi lang.',
  utang: 'Ay, nabasa mo na ’yung utang?',
  tambayan: 'Upo ka muna, makipagkwentuhan tayo.',
  signs: 'Napansin mo rin pala ’yung mga karatula.',
  sachet: 'Mura nga, pero saan napupunta ’yung plastic?'
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
// store sounds from site.js; silent unless the visitor turned them on
const play = (name, delay) => { if (window.Tingi) window.Tingi.sound.play(name, delay); };

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
const storyPhoto = document.getElementById('story-photo');
const prev = document.getElementById('story-prev');
const next = document.getElementById('story-next');
const greeting = document.getElementById('greeting');
const readCount = document.getElementById('read-count');
const finale = document.getElementById('finale');
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
  // a newer transition can cut this one short (fast arrow presses): that is fine
  vt.ready.catch(() => {});
  return vt.finished.catch(() => {}).finally(() => {
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
    .then(() => { root.classList.add('shutter-go'); play('shutter'); });
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
    button.querySelector('.read-label').textContent = isRead ? (isFil() ? ' (nabasa na)' : ' (read)') : '';
    tokens.get(id).classList.toggle('is-read', isRead);
  });
  readCount.textContent = read.size;
  // all five read: the receipt under the store stays on show
  if (read.size === order.length && finale.hidden && !fresh.size) finale.hidden = false;
}

// The receipt prints out under the counter the moment the fifth story is read.
function printReceipt() {
  finale.hidden = false;
  if (reduceMotion.matches) return;
  finale.querySelector('.finale-receipt').animate(
    [{ clipPath: 'inset(0 0 100% 0)', transform: 'translateY(-24px)' }, { clipPath: 'inset(0 0 0 0)', transform: 'none' }],
    { duration: 1100, delay: 500, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)', fill: 'backwards' }
  );
  setTimeout(() => {
    const box = finale.getBoundingClientRect();
    if (box.top > window.innerHeight * 0.75) finale.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 900);
}

function celebrate(latest) {
  if (read.size === order.length) {
    say('“Kumpleto! Balik ka ulit, ha!”');
    if (fresh.size) {
      play('ding', 200 + fresh.size * 90);
      if (finale.hidden) printReceipt();
    }
  } else if (latest) {
    say('“' + greetings[latest] + '”');
  }
  if (!reduceMotion.matches && fresh.size) {
    let delay = 0;
    fresh.forEach((id) => {
      buttons.get(id).classList.remove('stamp-pending');
      play('stamp', delay);
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

function write(story) {
  fields.title.textContent = story.title;
  fields.lead.textContent = story.lead;
  fields.body.textContent = story.body;
  critique.hidden = !story.critique;
  // the critique story is printed on greyer paper with a torn red seal
  dialog.classList.toggle('is-critique', Boolean(story.critique));
}

// Every story's page gets the height of the tallest one at this screen width,
// so the buttons below stay put when stepping between stories.
let sizedFor = 0;
function evenOut() {
  if (sizedFor === window.innerWidth || !dialog.open) return;
  sizedFor = window.innerWidth;
  page.style.minHeight = '';
  let tallest = 0;
  order.forEach((id) => {
    write(stories[id]);
    tallest = Math.max(tallest, page.offsetHeight);
    write(storiesFil[id]);
    tallest = Math.max(tallest, page.offsetHeight);
  });
  page.style.minHeight = tallest + 'px';
}

function fill(id) {
  const story = storyOf(id);
  current = id;
  write(story);
  storyLink.href = 'kwento/' + id + '.html';
  storyPhoto.src = 'assets/img/fieldwork/story-' + id + '.jpg';
  storyPhoto.alt = story.photo;
  art.replaceChildren(buttons.get(id).querySelector('svg').cloneNode(true));
  art.dataset.story = id;

  const index = order.indexOf(id);
  const before = order[(index + order.length - 1) % order.length];
  const after = order[(index + 1) % order.length];
  prev.textContent = '← ' + storyOf(before).title;
  prev.dataset.story = before;
  next.textContent = storyOf(after).title + ' →';
  next.dataset.story = after;

  // the tindera answers the story you just picked (seen once you are back at the counter)
  if (read.size + (read.has(id) ? 0 : 1) < order.length) say('“' + greetings[id] + '”');
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
  play('coin');

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
    play('thunk');
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
  play('page');
  return transition('vt-open', () => {
    button.classList.add('is-lifted', 'is-away');
    dialog.showModal();
    evenOut();
    fill(id);
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
  if (reduceMotion.matches || !document.startViewTransition) {
    showStory(id, false);
    return;
  }
  busy = true;
  bringWindowIntoView()
    .then((visible) => (visible ? passThrough(id).then(() => showStory(id, true)) : showStory(id, false)))
    .finally(() => { busy = false; });
}

// On a short screen the pass-through window can be below the fold. Scroll the
// store into view first, so the purchase is always seen. Resolves to whether
// the window can be seen (false only on screens too short to show it at all).
function bringWindowIntoView() {
  if (hatchInView()) return Promise.resolve(true);
  const store = storeWindow.getBoundingClientRect();
  const hole = hatchHole.getBoundingClientRect();
  // show the whole store if it fits, otherwise put the window near the bottom
  const fits = store.height + 40 <= window.innerHeight;
  const by = fits ? store.top - (window.innerHeight - store.height) / 2 : hole.bottom + 24 - window.innerHeight;
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.removeEventListener('scrollend', finish);
      resolve(hatchInView());
    };
    window.addEventListener('scrollend', finish);
    setTimeout(finish, 700); // browsers without scrollend, or nothing left to scroll
    window.scrollBy({ top: by, behavior: 'smooth' });
  });
}

// Stepping to another story turns the page, left or right.
function step(id, direction) {
  play('page');
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
  play('page');
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

// The language switch: rewrite the open story and the "(read)" labels.
document.addEventListener('tingi:lang', () => {
  renderRead();
  if (!dialog.open || !current) return;
  const index = order.indexOf(current);
  write(storyOf(current));
  storyPhoto.alt = storyOf(current).photo;
  prev.textContent = '← ' + storyOf(order[(index + order.length - 1) % order.length]).title;
  next.textContent = storyOf(order[(index + 1) % order.length]).title + ' →';
});

renderRead();
