import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'hegazy-seo-'));
const files = ['index.html', 'en/index.html', 'robots.txt', 'sitemap.xml'];
fs.copyFileSync(path.join(root, 'index.html'), path.join(fixture, 'index.html'));
const build = () => execFileSync(process.execPath, [path.join(root, 'scripts/build-seo.mjs'), fixture], { stdio: 'pipe' });
try {
  build();
  const first = files.map(file => fs.readFileSync(path.join(fixture, file), 'utf8'));
  build();
  assert.deepEqual(files.map(file => fs.readFileSync(path.join(fixture, file), 'utf8')), first, 'Generation must be idempotent');
  const [arabic, english, robots, sitemap] = first;
  assert.match(english, /<html lang="en" dir="ltr">/);
  assert.match(english, /Welcome! I’m Mohamed Salah Hegazy/);
  assert.match(english, /Connecting advertising/);
  assert.match(english, /href="\.\.\/assets\/cv\.pdf"/);
  assert.match(english, /href="#hp-contact"/);
  assert.doesNotMatch(english, /<base\b/i);
  assert.match(english, />Put your idea into a message<\/h3>/);
  assert.match(english, />Prepare in WhatsApp ↗<\/span>/);
  assert.match(english, />Prepare in email ↗<\/span>/);
  const origin = 'https://mhmdslahhjaziads-cloud.github.io/';
  for (const [html, suffix] of [[arabic, ''], [english, 'en/']]) {
    assert.ok(html.includes(`<link rel="canonical" href="${origin}${suffix}">`));
    for (const [language, route] of [['ar', ''], ['en', 'en/'], ['x-default', '']]) assert.ok(html.includes(`hreflang="${language}" href="${origin}${route}"`));
    assert.equal([...html.matchAll(/property="og:image"/g)].length, 1);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  }
  const ids = new Set([...english.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const [, ref] of english.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    if (ref.startsWith('#')) assert.ok(ids.has(ref.slice(1)), `Missing English fragment: ${ref}`);
    if (ref.startsWith('../assets/')) assert.ok(fs.existsSync(path.join(root, ref.slice(3).split(/[?#]/)[0])), `Missing English asset: ${ref}`);
    assert.ok(!ref.startsWith('assets/'), `Asset must resolve from /en/: ${ref}`);
  }
  const visible = english.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, '');
  assert.doesNotMatch(visible.replaceAll('العربية', ''), /[\u0600-\u06ff]/, 'English visible content must be translated');
  assert.ok(robots.includes(`Sitemap: ${origin}sitemap.xml`));
  assert.equal([...sitemap.matchAll(/<loc>/g)].length, 2);
  assert.equal([...sitemap.matchAll(/hreflang="en"/g)].length, 2);
  const png = fs.readFileSync(path.join(root, 'assets/social-preview.png'));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  console.log('PASS: idempotent metadata, static English translation/contact links, canonical/hreflang, English assets/anchors, sitemap and 1200×630 PNG.');
} finally {
  // The target was created above by mkdtemp, never derived from repository/user input.
  fs.rmSync(fixture, { recursive: true, force: true });
}
