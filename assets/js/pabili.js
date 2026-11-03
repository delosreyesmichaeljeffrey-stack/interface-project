// Order slip: checks the fields, then shows a receipt.
// The prototype has no backend, so nothing is sent anywhere.

const form = document.getElementById('slip');
const receipt = document.getElementById('receipt');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const easeOut = 'cubic-bezier(0.16, 1, 0.3, 1)';

// Swaps one paper for the other. With motion on, the slip is torn off the pad
// and the receipt prints out from the top.
function swap(from, to, printing, focusTarget = to) {
  const show = () => {
    from.hidden = true;
    to.hidden = false;
    focusTarget.focus();
  };
  if (reduceMotion.matches || !from.animate) {
    show();
    return;
  }
  from.animate(
    [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-28px) rotate(-4deg)', opacity: 0 }],
    { duration: 260, easing: 'ease-in' }
  ).finished.then(() => {
    show();
    to.animate(
      printing
        ? [{ clipPath: 'inset(0 0 100% 0)', transform: 'translateY(-16px)' }, { clipPath: 'inset(0 0 0 0)', transform: 'none' }]
        : [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
      { duration: printing ? 900 : 360, easing: printing ? 'cubic-bezier(0.3, 0.7, 0.4, 1)' : easeOut }
    );
  });
}

const rules = {
  name: (value) => value.trim() ? '' : 'Pakilagay ang pangalan mo.',
  email: (value) => {
    if (!value.trim()) return 'Pakilagay ang email mo, halimbawa: juan@email.com';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
      ? ''
      : 'Kulang ang email. Dapat may @ at domain, halimbawa: juan@email.com';
  },
  message: (value) => value.trim() ? '' : 'Ano po ang order mo? Isulat ang mensahe mo.'
};

function check(field) {
  const input = form.elements[field];
  const message = rules[field](input.value);
  document.getElementById(field + '-error').textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
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
  document.getElementById('r-type').textContent = form.elements.type.value;
  document.getElementById('r-message').textContent = form.elements.message.value.trim();
  swap(form, receipt, true);
});

document.getElementById('new-order').addEventListener('click', () => {
  form.reset();
  form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
  swap(receipt, form, false, form.elements.name);
});
