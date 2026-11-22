// Order slip: checks the fields, then shows a receipt.
// The prototype has no backend, so nothing is sent anywhere.

const form = document.getElementById('slip');
const receipt = document.getElementById('receipt');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const easeOut = 'cubic-bezier(0.16, 1, 0.3, 1)';

// Swaps one paper for the other. With motion on, the slip is torn off the pad
// and the receipt prints out from the top.
function swap(from, to, printing, focusTarget = to) {
  if (reduceMotion.matches || !from.animate) {
    from.hidden = true;
    to.hidden = false;
    focusTarget.focus();
    return;
  }
  // Both papers sit in the same spot (one grid cell), so the page never
  // collapses between them: the new one appears underneath, the old one
  // lifts away on top, and only then is the old one removed.
  to.hidden = false;
  from.classList.add('is-leaving');
  to.animate(
    printing
      ? [{ clipPath: 'inset(0 0 100% 0)', transform: 'translateY(-16px)' }, { clipPath: 'inset(0 0 0 0)', transform: 'none' }]
      : [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
    { duration: printing ? 900 : 360, delay: 120, easing: printing ? 'cubic-bezier(0.3, 0.7, 0.4, 1)' : easeOut, fill: 'backwards' }
  );
  from.animate(
    [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-28px) rotate(-4deg)', opacity: 0 }],
    { duration: 280, easing: 'ease-in', fill: 'forwards' }
  ).finished.then((animation) => {
    // ease the space the old paper took down to the new paper's height,
    // so the page shrinks smoothly instead of jumping
    const wrap = from.parentElement;
    const tall = wrap.offsetHeight;
    wrap.style.minHeight = tall + 'px';
    from.hidden = true;
    from.classList.remove('is-leaving');
    animation.cancel();
    const short = to.offsetHeight;
    wrap.animate([{ minHeight: tall + 'px' }, { minHeight: short + 'px' }], { duration: 520, easing: easeOut })
      .finished.then(() => { wrap.style.minHeight = ''; });
    focusTarget.focus({ preventScroll: true });
  });
}

const fil = () => Boolean(window.Tingi) && window.Tingi.lang === 'fil';
const rules = {
  name: (value) => value.trim() ? '' : (fil() ? 'Pakilagay ang pangalan mo.' : 'Please enter your name.'),
  email: (value) => {
    if (!value.trim()) return fil() ? 'Pakilagay ang email mo, halimbawa: juan@email.com' : 'Please enter your email, for example: juan@email.com';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
      ? ''
      : (fil() ? 'Kulang ang email. Dapat may @ at domain, halimbawa: juan@email.com' : 'That email looks incomplete. It needs an @ and a domain, for example: juan@email.com');
  },
  message: (value) => value.trim() ? '' : (fil() ? 'Ano po ang order mo? Isulat ang mensahe mo.' : 'What would you like to order? Write your message.')
};

function check(field) {
  const input = form.elements[field];
  const message = rules[field](input.value);
  const error = document.getElementById(field + '-error');
  error.textContent = message;
  error.lang = fil() ? 'fil' : 'en';
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  input.closest('.field').classList.toggle('is-ok', !message); // a pencil tick beside the label
  return !message;
}

Object.keys(rules).forEach((field) => {
  const input = form.elements[field];
  input.addEventListener('blur', () => check(field));
  // once a field shows an error, clear it as soon as it is fixed, while typing,
  // so the slip doesn't jump when the reader moves on to the next field
  input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid') === 'true') check(field);
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const invalid = Object.keys(rules).filter((field) => !check(field));
  if (invalid.length) {
    form.elements[invalid[0]].focus();
    // a small shake says "not yet" without moving the errors out of place
    if (!reduceMotion.matches) {
      form.animate(
        [{ transform: 'none' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'none' }],
        { duration: 320, easing: 'ease-out' }
      );
    }
    return;
  }
  document.getElementById('r-name').textContent = form.elements.name.value.trim();
  document.getElementById('r-email').textContent = form.elements.email.value.trim();
  // the chosen type in both languages; the CSS shows the current one
  const chip = form.querySelector('input[name="type"]:checked').nextElementSibling;
  document.getElementById('r-type').replaceChildren(...chip.cloneNode(true).childNodes);
  document.getElementById('r-message').textContent = form.elements.message.value.trim();
  if (window.Tingi) window.Tingi.sound.play('tear');
  swap(form, receipt, true);
});

// errors already on screen follow the language switch
document.addEventListener('tingi:lang', () => {
  Object.keys(rules).forEach((field) => {
    if (form.elements[field].getAttribute('aria-invalid') === 'true') check(field);
  });
});

document.getElementById('new-order').addEventListener('click', () => {
  form.reset();
  form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
  form.querySelectorAll('.is-ok').forEach((field) => field.classList.remove('is-ok'));
  form.querySelectorAll('.error').forEach((error) => { error.textContent = ''; });
  swap(receipt, form, false, form.elements.name);
});
