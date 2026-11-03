// Opens the story behind each product on the shelf.

const stories = {
  tingi: {
    kicker: 'Story 01',
    title: 'Tingi',
    lead: 'Buying in small portions to get through one day at a time.',
    body: 'One sachet of shampoo, one cup of rice, one piece of candy. Tingi lets families with a daily budget buy only what they need today.'
  },
  utang: {
    kicker: 'Story 02',
    title: 'Utang',
    lead: 'The listahan: credit built on trust between neighbors.',
    body: 'The tindera writes every debt by hand in a notebook. Paying it back is as much about keeping a relationship as it is about money.'
  },
  tambayan: {
    kicker: 'Story 03',
    title: 'Tambayan',
    lead: 'The store as the neighborhood’s news hub and meeting place.',
    body: 'People stay for a softdrink, a chat, or the latest news. The bench outside the store is where the community talks.'
  },
  signs: {
    kicker: 'Story 04',
    title: 'Signs & labels',
    lead: 'Hand-painted signs and loud packaging as vernacular design.',
    body: 'From painted store names to “Bawal ang utang, bukas pwede,” the sari-sari store is full of everyday Filipino design and humor.'
  },
  sachet: {
    kicker: 'Story 05 · Critique',
    title: 'Sachet economy',
    lead: 'Paying more per gram, and the plastic waste left behind.',
    body: 'Small packs make goods affordable today, but they often cost more per gram than buying in bulk, and every sachet becomes plastic waste.'
  }
};

const dialog = document.getElementById('story');
const fields = {
  kicker: document.getElementById('story-kicker'),
  title: document.getElementById('story-title'),
  lead: document.getElementById('story-lead'),
  body: document.getElementById('story-body')
};
let lastTrigger = null;

document.querySelectorAll('.product').forEach((button) => {
  button.addEventListener('click', () => {
    const story = stories[button.dataset.story];
    if (!story) return;
    Object.keys(fields).forEach((key) => { fields[key].textContent = story[key]; });
    lastTrigger = button;
    dialog.showModal();
  });
});

// Close when clicking the dimmed area around the story.
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

// Return focus to the product that opened the story.
dialog.addEventListener('close', () => {
  if (lastTrigger) lastTrigger.focus();
});
