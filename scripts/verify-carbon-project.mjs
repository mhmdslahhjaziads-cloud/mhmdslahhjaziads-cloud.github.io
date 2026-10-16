import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const enHtml = fs.readFileSync(path.join(root, 'en/index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/css/carbon-project.css'), 'utf8');

const section = html.match(/<section class="hp-section hp-carbon-project"[\s\S]*?<\/section>/)?.[0] ?? '';
const enSection = enHtml.match(/<section class="hp-section hp-carbon-project"[\s\S]*?<\/section>/)?.[0] ?? '';
assert.ok(section, 'Carbon project section exists');
const previews = [...section.matchAll(/assets\/projects\/carbon-originals\/([\w-]+\.webp)/gi)].map(match => match[1]);
assert.ok(previews.length >= 6, 'Carbon gallery has mobile and desktop animated previews for three store pages');
for (const preview of new Set(previews)) {
  const file = fs.readFileSync(path.join(root, 'assets/projects/carbon-originals', preview));
  assert.ok([...file.toString('latin1').matchAll(/ANMF/g)].length > 1, `${preview} is animated`);
}
assert.match(css, /\.hp-carbon-window\{[^}]*overflow-x:\s*auto/i, 'Horizontal scroller works at the mobile breakpoint');
assert.match(section, /hp-carbon-tech-wp/, 'Project heading includes a WordPress badge');
assert.match(section, /hp-carbon-tech-codex/, 'Project heading includes a Codex badge');
assert.match(css, /hp-carbon-title\.is-visible \.hp-carbon-tech\{animation:hp-carbon-tech-arrive/i, 'Technology badges animate when the project heading enters view');
assert.match(css, /prefers-reduced-motion:reduce\)[\s\S]*?hp-carbon-title\.is-visible \.hp-carbon-tech\{animation:none/i, 'Badge motion respects reduced-motion preferences');
assert.doesNotMatch(section, /class="hp-carbon-visit"/, 'Project card has no external visit button');
assert.ok(enSection, 'English Carbon project section exists');
assert.match(enSection, /hp-carbon-tech-wp/);
assert.match(enSection, /hp-carbon-tech-codex/);
assert.doesNotMatch(enSection, /class="hp-carbon-visit"/);
assert.equal([...enSection.matchAll(/carbon-originals\/(?:home|bundles|product)-(?:desktop|mobile)\.webp/g)].length, 6, 'English section uses the same responsive animated previews');

console.log('PASS: Carbon project animated WebP gallery, mobile horizontal scroll, and title motion.');
