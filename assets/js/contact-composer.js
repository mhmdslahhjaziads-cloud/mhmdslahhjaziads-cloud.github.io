/* Draft only: destinations open exclusively after an explicit, valid button click. */
(() => {
  'use strict';
  const composer = document.getElementById('hp-contact-composer');
  if (!composer) return;
  const form = document.getElementById('hp-message-form');
  const kind = document.getElementById('hp-message-kind');
  const project = document.getElementById('hp-message-url');
  const details = document.getElementById('hp-message-details');
  const error = document.getElementById('hp-message-error');
  const counter = document.getElementById('hp-message-count');
  const preview = document.getElementById('hp-message-preview');
  const fields = [kind, project, details];
  const requestTypes = {
    ads: { ar: 'إعلانات', en: 'Advertising' },
    tracking: { ar: 'تتبّع وقياس', en: 'Tracking and measurement' },
    site: { ar: 'موقع أو متجر', en: 'Website or store' }
  };
  const copy = {
    ar: {
      kind: 'اختار نوع الشغل من القائمة.',
      url: 'اكتب لينك صحيح بيبدأ بـ https:// أو http://، أو سيبه فاضي.',
      details: 'اكتب شوية تفاصيل عن اللي محتاجه الأول.',
      length: 'خلّي التفاصيل في حدود ٨٠٠ حرف.',
      placeholder: 'قولي السياق، التحدّي، وإيه اللي حابب توصله.',
      hello: 'أهلًا محمد، جاي من موقعك وحابب نتكلم عن شغل مع بعض.',
      request: 'نوع الشغل: ', project: 'لينك المشروع: ', body: 'التفاصيل:',
      subject: 'نتكلم عن '
    },
    en: {
      kind: 'Choose a request type from the list.',
      url: 'Enter a valid URL starting with https:// or http://, or leave it blank.',
      details: 'Add a few details about what you need first.',
      length: 'Keep the details within 800 characters.',
      placeholder: 'Share the context, challenge and what you want to achieve.',
      hello: 'Hi Mohamed, I found your website and would like to discuss working together.',
      request: 'Request type: ', project: 'Project URL: ', body: 'Details:',
      subject: 'Discuss '
    }
  };
  let activeError = null;
  function language() {
    return document.documentElement.lang === 'en' ? 'en' : 'ar';
  }
  function validate() {
    if (!Object.prototype.hasOwnProperty.call(requestTypes, kind.value)) return { field: kind, key: 'kind' };
    const url = project.value.trim();
    if (url) {
      try {
        const parsed = new URL(url);
        if (!/^https?:\/\/\S+$/i.test(url) || !['https:', 'http:'].includes(parsed.protocol) || !parsed.hostname) {
          return { field: project, key: 'url' };
        }
      } catch { return { field: project, key: 'url' }; }
    }
    if (!details.value.trim()) return { field: details, key: 'details' };
    if (details.value.length > 800) return { field: details, key: 'length' };
    return null;
  }
  function showError(issue, focus = false) {
    activeError = issue;
    fields.forEach(field => field.removeAttribute('aria-invalid'));
    error.textContent = issue ? copy[language()][issue.key] : '';
    error.hidden = !issue;
    if (issue) {
      issue.field.setAttribute('aria-invalid', 'true');
      if (focus) issue.field.focus();
    }
  }
  function localize() {
    const lang = language();
    composer.querySelectorAll('[data-ar][data-en]').forEach(element => {
      element.textContent = element.getAttribute('data-' + lang);
    });
    details.setAttribute('placeholder', copy[lang].placeholder);
    if (activeError) showError(validate());
    renderPreview();
  }
  function messageLines() {
    const lang = language();
    const words = copy[lang];
    const request = requestTypes[kind.value]?.[lang] || '';
    const lines = [words.hello, '', words.request + request];
    if (project.value.trim()) lines.push(words.project + project.value.trim());
    lines.push('', words.body, details.value.trim() || words.placeholder);
    return lines;
  }
  function renderPreview() {
    if (preview) preview.textContent = messageLines().join('\n');
  }
  function update() {
    counter.textContent = details.value.length + ' / 800';
    if (activeError) showError(validate());
    renderPreview();
  }
  function compose(method, event) {
    event.preventDefault();
    const issue = validate();
    showError(issue, true);
    if (issue) return;
    const lang = language();
    const words = copy[lang];
    const request = requestTypes[kind.value][lang];
    const message = messageLines().join('\n');
    if (method === 'whatsapp') {
      window.open('https://wa.me/201558272805?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = 'mailto:mhmdslahhjazi.ads@gmail.com?subject=' + encodeURIComponent(words.subject + request) + '&body=' + encodeURIComponent(message);
    }
    // Never put user-entered content, destination URLs or message bodies in this event.
    document.dispatchEvent(new CustomEvent('hp:contact-composed', {
      bubbles: true,
      detail: { method, request_type: kind.value }
    }));
  }
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  kind.addEventListener('change', () => {
    if (preview && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      preview.animate([{opacity:.5,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}], {duration:220,easing:'cubic-bezier(.16,1,.3,1)'});
    }
  });
  document.getElementById('hp-message-whatsapp').addEventListener('click', event => compose('whatsapp', event));
  document.getElementById('hp-message-email').addEventListener('click', event => compose('email', event));
  new MutationObserver(localize).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  localize();
  update();
  composer.hidden = false;
})();
