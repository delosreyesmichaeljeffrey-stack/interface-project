// Order slip: checks the fields, then shows a receipt.
// The prototype has no backend, so nothing is sent anywhere.

const form = document.getElementById('slip');
const receipt = document.getElementById('receipt');

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
  form.elements[field].addEventListener('blur', () => check(field));
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const invalid = Object.keys(rules).filter((field) => !check(field));
  if (invalid.length) {
    form.elements[invalid[0]].focus();
    return;
  }
  document.getElementById('r-name').textContent = form.elements.name.value.trim();
  document.getElementById('r-email').textContent = form.elements.email.value.trim();
  document.getElementById('r-type').textContent = form.elements.type.value;
  document.getElementById('r-message').textContent = form.elements.message.value.trim();
  form.hidden = true;
  receipt.hidden = false;
  receipt.focus();
});

document.getElementById('new-order').addEventListener('click', () => {
  form.reset();
  form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
  receipt.hidden = true;
  form.hidden = false;
  form.elements.name.focus();
});
