// Opens the story behind each product, lets readers step through all five,
// and keeps a listahan of the stories already read.

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

const dialog = document.getElementById('story');
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
const buttons = new Map(
  [...document.querySelectorAll('.product')].map((button) => [button.dataset.story, button])
);

let current = null;
let lastTrigger = null;

// The listahan of read stories survives a reload when storage is allowed.
const read = new Set();
try {
  JSON.parse(sessionStorage.getItem('tingi-read') || '[]').forEach((id) => {
    if (stories[id]) read.add(id);
  });
} catch (error) { /* storage unavailable: start with an empty listahan */ }

function saveRead() {
  try { sessionStorage.setItem('tingi-read', JSON.stringify([...read])); } catch (error) { /* ignore */ }
}

function renderRead(latest) {
  buttons.forEach((button, id) => {
    const isRead = read.has(id);
    button.classList.toggle('is-read', isRead);
    button.querySelector('.read-label').textContent = isRead ? ' (read)' : '';
  });
  readCount.textContent = read.size;
  if (read.size === order.length) {
    greeting.textContent = '“Kumpleto! Balik ka ulit, ha!”';
  } else if (latest) {
    greeting.textContent = '“' + greetings[latest] + '”';
  }
}

function show(id) {
  const story = stories[id];
  current = id;
  fields.title.textContent = story.title;
  fields.lead.textContent = story.lead;
  fields.body.textContent = story.body;
  critique.hidden = !story.critique;
  storyLink.href = 'kwento/' + id + '.html';
  art.replaceChildren(buttons.get(id).querySelector('svg').cloneNode(true));

  const index = order.indexOf(id);
  const before = order[(index + order.length - 1) % order.length];
  const after = order[(index + 1) % order.length];
  prev.textContent = '← ' + stories[before].title;
  prev.dataset.story = before;
  next.textContent = stories[after].title + ' →';
  next.dataset.story = after;

  read.add(id);
  saveRead();
  renderRead(id);
}

buttons.forEach((button, id) => {
  button.addEventListener('click', () => {
    lastTrigger = button;
    show(id);
    dialog.showModal();
  });
});

[prev, next].forEach((step) => {
  step.addEventListener('click', () => {
    show(step.dataset.story);
    lastTrigger = buttons.get(current);
  });
});

// Close when clicking the dimmed area around the story.
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

// Return focus to the product of the story that was last open.
dialog.addEventListener('close', () => {
  if (lastTrigger) lastTrigger.focus();
});

renderRead(null);
