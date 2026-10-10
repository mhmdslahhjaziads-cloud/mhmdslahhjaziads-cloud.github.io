/** Rebuild both search entry points after editing the Arabic source. No dependencies. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(process.argv[2] || fileURLToPath(new URL('../', import.meta.url)));
const origin = 'https://mhmdslahhjaziads-cloud.github.io/';
const image = origin + 'assets/social-preview.png';
const escape = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const decode = value => value.replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function metadata(html, language) {
  const english = language === 'en';
  const url = origin + (english ? 'en/' : '');
  const title = english ? 'Mohamed Salah Hegazy | Performance Marketing & Tracking' : 'محمد صلاح حجازي | Performance Marketing & Tracking';
  const description = english ? 'Mohamed Salah Hegazy — media buyer and tracking specialist for e-commerce. Explore my services, tracking work, tools and experience.' : 'محمد صلاح حجازي — ميديا باير وأخصائي التتبّع والقياس لحسابات التجارة الإلكترونية. تعرّف على خدماتي وأدواتي وشغلي في التراكنج.';
  html = html.replace(/<!-- hp-seo:start -->[\s\S]*?<!-- hp-seo:end -->\n?/g, '');
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escape(title)}</title>`);
  html = html.replace(/<meta\b[^>]*>/gi, tag => /\b(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+)"/i.test(tag) ? '' : tag);
  html = html.replace(/<link\b[^>]*>/gi, tag => /\brel="canonical"/i.test(tag) || (/\brel="alternate"/i.test(tag) && /\bhreflang=/i.test(tag)) ? '' : tag);
  const tags = [
    `<meta name="description" content="${escape(description)}">`,
    `<link rel="canonical" href="${url}">`,
    `<link rel="alternate" hreflang="ar" href="${origin}">`,
    `<link rel="alternate" hreflang="en" href="${origin}en/">`,
    `<link rel="alternate" hreflang="x-default" href="${origin}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${escape(title)}">`,
    `<meta property="og:description" content="${escape(description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:locale" content="${english ? 'en_US' : 'ar_EG'}">`,
    `<meta property="og:locale:alternate" content="${english ? 'ar_EG' : 'en_US'}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:type" content="image/png">`,
    `<meta property="og:image:alt" content="Mohamed Salah Hegazy — Media Buying and Tracking">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escape(title)}">`,
    `<meta name="twitter:description" content="${escape(description)}">`,
    `<meta name="twitter:image" content="${image}">`,
    `<meta name="twitter:image:alt" content="Mohamed Salah Hegazy — Media Buying and Tracking">`
  ].join('\n');
  return html.replace(/<\/head>/i, '<!-- hp-seo:start -->' + tags + '\n<!-- hp-seo:end -->\n</head>');
}

// Locate complete data-en elements, including nested inline markup, without altering attributes.
function translate(html) {
  const stack = [], replacements = [];
  const voids = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const tags = /<!--[\s\S]*?-->|<![^>]*>|<\/?[a-zA-Z][a-zA-Z0-9:-]*(?:"[^"]*"|'[^']*'|[^'">])*>/g;
  for (const match of html.matchAll(tags)) {
    const tag = match[0], name = tag.match(/^<\/?([\w:-]+)/)?.[1]?.toLowerCase();
    if (!name) continue;
    if (tag.startsWith('</')) {
      const index = stack.findLastIndex(entry => entry.name === name);
      if (index < 0) continue;
      const entry = stack[index];
      stack.length = index;
      if (entry.english !== undefined) replacements.push({ start: entry.start, end: match.index, value: entry.english });
    } else if (!voids.has(name) && !tag.endsWith('/>')) {
      stack.push({ name, start: match.index + tag.length, english: tag.match(/\bdata-en="([^"]*)"/)?.[1] });
    }
  }
  const outer = replacements.filter(item => !replacements.some(other => other !== item && other.start <= item.start && other.end >= item.end));
  for (const item of outer.sort((a, b) => b.start - a.start)) html = html.slice(0, item.start) + item.value + html.slice(item.end);
  html = html.replace(/<html\b[^>]*>/, '<html lang="en" dir="ltr">');
  html = html.replace(/(<link rel="preload"[^>]*href="[^"]*)ibm-plex-arabic-arabic-400-site\.woff2/, '$1ibm-plex-arabic-latin-400-site.woff2');
  html = html.replace(/(<div\b[^>]*\bid="hegazy-preview"[^>]*>)/, tag => tag.replace(/dir="rtl"/, 'dir="ltr"').replace(/lang="ar"/, 'lang="en"'));
  html = html.replace(/\b(src|href|poster)="(assets\/[^"<>]*)"/g, '$1="../$2"');
  html = html.replace(/\bsrcset="([^"]*)"/g, (_, value) => 'srcset="'+value.replace(/(^|,\s*)assets\//g,'$1../assets/')+'"');
  const labels = {
    'محمد صلاح حجازي': 'Mohamed Salah Hegazy', 'معاينة موقع محمد صلاح حجازي': 'Mohamed Salah Hegazy portfolio',
    'أقسام الموقع': 'Site sections', 'فتح القائمة': 'Open menu', 'فتح القائمة الجانبية': 'Open side menu',
    'القائمة الجانبية': 'Side menu', 'تبديل المظهر': 'Toggle appearance', 'تغيير المظهر': 'Toggle appearance',
    'البداية': 'Home', 'بعمل إيه': 'What I do', 'أدواتي': 'Toolkit', 'طريقة الشغل': 'Workflow',
    'من شغلي': 'My work', 'الخلفية': 'Background', 'رحلتي': 'Experience', 'نتكلم': 'Contact',
    'تواصل مع محمد': 'Contact Mohamed', 'مؤشر أقسام الموقع': 'Site section progress',
    'نسبة تمرير الصفحة': 'Page scroll progress', 'فرص العمل والأسواق': 'Availability and markets',
    'الرجوع لأعلى الصفحة': 'Back to top', 'Switch language': 'Switch to Arabic'
  };
  html = html.replace(/\b(aria-label|alt)="([^"]*)"/g, (tag, key, value) => labels[value] ? `${key}="${labels[value]}"` : tag);
  html = html.replace(/(<button\b[^>]*\bid="hp-(?:dock-)?language"[^>]*>)[\s\S]*?(<\/button>)/g, '$1العربية ↗$2');
  html = html.replace(/(<small class="hp-route-current">)[\s\S]*?(<\/small>)/, '$101 / Home$2');
  html = html.replace(/(<p class="hp-noscript">)[\s\S]*?(<\/p>)/, '$1Contact links and the CV download are available. Menu and theme controls need JavaScript.$2');
  // Contact intents are useful even before JavaScript initializes.
  html = html.replace(/<a\b(?:"[^"]*"|'[^']*'|[^'">])*>/g, tag => {
    const message = tag.match(/\bdata-message-en="([^"]*)"/)?.[1];
    if (message) tag = tag.replace(/href="https:\/\/wa\.me\/([^?"]+)[^"]*"/, (_, phone) => `href="https://wa.me/${phone}?text=${encodeURIComponent(decode(message))}"`);
    const subject = tag.match(/\bdata-subject-en="([^"]*)"/)?.[1], body = tag.match(/\bdata-body-en="([^"]*)"/)?.[1];
    if (subject && body) tag = tag.replace(/href="mailto:([^?"]+)[^"]*"/, (_, email) => `href="mailto:${email}?subject=${encodeURIComponent(decode(subject))}&amp;body=${encodeURIComponent(decode(body))}"`);
    return tag;
  });
  return html;
}

const sourcePath = path.join(root, 'index.html');
const arabic = metadata(fs.readFileSync(sourcePath, 'utf8'), 'ar');
const english = metadata(translate(arabic), 'en');
fs.mkdirSync(path.join(root, 'en'), { recursive: true });
fs.writeFileSync(sourcePath, arabic);
fs.writeFileSync(path.join(root, 'en/index.html'), english);
fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin}sitemap.xml\n`);
const alternates = `<xhtml:link rel="alternate" hreflang="ar" href="${origin}"/><xhtml:link rel="alternate" hreflang="en" href="${origin}en/"/><xhtml:link rel="alternate" hreflang="x-default" href="${origin}"/>`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n<url><loc>${origin}</loc>${alternates}</url>\n<url><loc>${origin}en/</loc>${alternates}</url>\n</urlset>\n`);
console.log(`Generated metadata, en/index.html, robots.txt and sitemap.xml in ${root}`);
