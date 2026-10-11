import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { test } from 'node:test';

const sourcePath = fileURLToPath(new URL('../assets/js/contact-composer.js', import.meta.url));
const source = existsSync(sourcePath) ? readFileSync(sourcePath, 'utf8') : '';

// Browser boundaries are simulated so these tests never open or send a message.
function fixture(language = 'en') {
  const fields = new Map();
  function element(id, value = '') {
    const handlers = new Map();
    const attrs = new Map();
    const node = { id, value, textContent: '', hidden: false, dataset: {}, focused: false,
      setAttribute: (name, content) => attrs.set(name, String(content)),
      getAttribute: name => attrs.get(name) ?? null,
      removeAttribute: name => attrs.delete(name),
      addEventListener: (name, fn) => handlers.set(name, [...(handlers.get(name) || []), fn]),
      focus() { this.focused = true; },
      fire(name) {
        const event = { target: node, preventDefault() { this.defaultPrevented = true; } };
        for (const handler of handlers.get(name) || []) handler(event);
        return event;
      },
      querySelectorAll: () => []
    };
    fields.set(id, node);
    return node;
  }
  const composer = element('hp-contact-composer');
  composer.hidden = true;
  const form = element('hp-message-form');
  const type = element('hp-message-kind', 'ads');
  const url = element('hp-message-url');
  const details = element('hp-message-details');
  const error = element('hp-message-error');
  const whatsapp = element('hp-message-whatsapp');
  const email = element('hp-message-email');
  const counter = element('hp-message-count');
  const preview = element('hp-message-preview');
  const label = element('fixture-label');
  label.setAttribute('data-ar', 'نوع الشغل');
  label.setAttribute('data-en', 'Request type');
  composer.querySelectorAll = () => [label];
  const root = { lang: language, getAttribute: name => name === 'lang' ? root.lang : null };
  const events = [];
  const opened = [];
  const location = { href: 'https://portfolio.example/' };
  let observer;
  const document = {
    documentElement: root,
    getElementById: id => fields.get(id) || null,
    dispatchEvent: event => events.push(event)
  };
  vm.runInNewContext(source, {
    document, window: { open: (...args) => opened.push(args), location, matchMedia: () => ({matches:true}) }, URL,
    CustomEvent: class { constructor(name, opts) { this.type = name; this.detail = opts.detail; this.bubbles = opts.bubbles === true; } },
    MutationObserver: class { constructor(fn) { observer = fn; } observe() {} }
  });
  return { composer, form, type, url, details, error, whatsapp, email, counter, preview, label, events, opened, location,
    changeLanguage(lang) { root.lang = lang; observer?.(); } };
}

test('composer becomes available with localized labels without a disclosure step', () => {
  const f = fixture();
  assert.equal(f.composer.hidden, false);
  assert.equal(f.label.textContent, 'Request type');
});

test('local message preview matches the prepared draft and updates language without opening a destination', () => {
  const f = fixture();
  f.type.value = 'tracking';
  f.url.value = 'https://shop.example/product?item=1&ref=2';
  f.details.value = 'Review event accuracy & reporting\nمراجعة القياس';
  f.form.fire('input');
  assert.equal(f.opened.length, 0);
  assert.equal(f.events.length, 0);
  assert.match(f.preview.textContent, /Tracking and measurement/);
  assert.ok(f.preview.textContent.endsWith(f.details.value));
  f.whatsapp.fire('click');
  assert.equal(new URL(f.opened[0][0]).searchParams.get('text'), f.preview.textContent);
  f.changeLanguage('ar');
  assert.match(f.preview.textContent, /تتبّع وقياس/);
  assert.equal(f.details.value, 'Review event accuracy & reporting\nمراجعة القياس');
  assert.equal(f.opened.length, 1);
});

test('blank details block both destinations and focus the required field', () => {
  const f = fixture();
  f.details.value = '   ';
  assert.equal(f.whatsapp.fire('click').defaultPrevented, true);
  f.email.fire('click');
  assert.equal(f.opened.length, 0);
  assert.equal(f.location.href, 'https://portfolio.example/');
  assert.equal(f.events.length, 0);
  assert.equal(f.details.focused, true);
  assert.match(f.error.textContent, /details/i);
});

test('unsafe or malformed project URLs never open a destination', () => {
  for (const value of ['javascript:alert(1)', 'ftp://example.com', 'example.com', 'https://', 'https://exa mple.com']) {
    const f = fixture();
    f.details.value = 'Tracking review';
    f.url.value = value;
    f.whatsapp.fire('click');
    assert.equal(f.opened.length, 0, value);
    assert.equal(f.events.length, 0, value);
    assert.equal(f.url.focused, true, value);
  }
});

test('valid WhatsApp draft preserves project details and emits only safe classifications', () => {
  const f = fixture();
  f.type.value = 'tracking';
  f.url.value = 'https://shop.example/product?item=1&ref=2';
  f.details.value = 'Need a review & help\nهل ممكن نراجع؟';
  f.whatsapp.fire('click');
  assert.equal(f.opened.length, 1);
  const [href, target, features] = f.opened[0];
  const link = new URL(href);
  assert.equal(link.hostname, 'wa.me');
  assert.equal(link.pathname, '/201558272805');
  assert.match(link.searchParams.get('text'), /Tracking/);
  assert.ok(link.searchParams.get('text').includes(f.url.value));
  assert.ok(link.searchParams.get('text').includes(f.details.value));
  assert.equal(target, '_blank');
  assert.equal(features, 'noopener,noreferrer');
  assert.equal(f.events[0].bubbles, true, 'The document event must reach the window analytics listeners');
  assert.equal(f.events[0].type, 'hp:contact-composed');
  assert.equal(JSON.stringify(f.events[0].detail), '{"method":"whatsapp","request_type":"tracking"}');
});

test('email draft safely encodes query characters and an optional blank URL', () => {
  const f = fixture();
  f.type.value = 'site';
  f.details.value = 'Build pages &subject=inject#fragment';
  f.email.fire('click');
  const link = new URL(f.location.href);
  assert.equal(link.protocol, 'mailto:');
  assert.equal(link.pathname, 'mhmdslahhjazi.ads@gmail.com');
  assert.equal(link.searchParams.size, 2);
  assert.ok(link.searchParams.get('body').includes(f.details.value));
  assert.match(link.searchParams.get('subject'), /Website/);
  assert.equal(f.opened.length, 0);
  assert.equal(JSON.stringify(f.events[0].detail), '{"method":"email","request_type":"site"}');
});

test('details length boundary accepts 800 characters and blocks 801', () => {
  for (const [length, count] of [[800, 1], [801, 0]]) {
    const f = fixture();
    f.details.value = 'x'.repeat(length);
    f.whatsapp.fire('click');
    assert.equal(f.opened.length, count);
  }
});

test('language changes update labels, placeholders, errors and future drafts without erasing input', () => {
  const f = fixture();
  f.whatsapp.fire('click');
  f.changeLanguage('ar');
  assert.equal(f.label.textContent, 'نوع الشغل');
  assert.match(f.error.textContent, /تفاصيل/);
  f.details.value = 'متجر جديد';
  f.form.fire('input');
  assert.equal(f.error.textContent, '');
  assert.equal(f.counter.textContent, '9 / 800');
  f.whatsapp.fire('click');
  assert.match(new URL(f.opened[0][0]).searchParams.get('text'), /أهلًا محمد/);
  f.changeLanguage('en');
  assert.equal(f.details.value, 'متجر جديد');
  assert.match(f.details.getAttribute('placeholder'), /context/i);
});

test('unknown request classifications are blocked instead of entering analytics', () => {
  const f = fixture();
  f.type.value = 'private-entered-text';
  f.details.value = 'Review';
  f.whatsapp.fire('click');
  assert.equal(f.opened.length, 0);
  assert.equal(f.events.length, 0);
  assert.equal(f.type.focused, true);
});
