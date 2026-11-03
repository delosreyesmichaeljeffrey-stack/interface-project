// Order slip: checks the fields, then shows a receipt.
// The prototype has no backend, so nothing is sent anywhere.

const form = document.getElementById('slip');
const receipt = document.getElementById('receipt');

const rules = {
  name: (value) => value.trim() ? '' : 'Pakilagay ang pangalan mo.',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Pakilagay ang valid na email.',
  message: (value) => value.trim() ? '' : 'Ano po ang order mo?'
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
  document.getElementById('r-type').textContent = form.elements.type.value;
  form.hidden = true;
  receipt.hidden = false;
  receipt.focus();
});

document.getElementById('new-order').addEventListener('click', () => {
  form.reset();
  receipt.hidden = true;
  form.hidden = false;
  form.elements.name.focus();
});
