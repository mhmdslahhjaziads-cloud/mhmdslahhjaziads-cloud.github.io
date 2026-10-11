import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context = { window: {} };
const path = new URL('../assets/js/ruler-layout.js', import.meta.url);
if (fs.existsSync(path)) vm.runInNewContext(fs.readFileSync(path, 'utf8'), context);
const layout = input => {
  assert.equal(typeof context.window.HegazyRuler?.layout, 'function', 'A common ruler layout must exist');
  return context.window.HegazyRuler.layout(input);
};
const page = { documentHeight: 5000, viewportHeight: 800, railHeight: 600, sectionTops: [0, 650, 1400, 2250, 2900, 3500, 4000, 4500] };
test('Section names stay at their scroll destinations when the page moves', () => {
  const start = layout({ ...page, scrollY: 0 });
  const middle = layout({ ...page, scrollY: 2100 });
  assert.deepEqual(start.positions, middle.positions);
  assert.ok(Math.abs(middle.positions[3] + 10 - (2250 - 240) / 4200 * 600) < 1);
  assert.equal(middle.activeIndex, 3, 'Brands must be the current section here');
});
test('Percentage and visible band agree at the start, middle, and end', () => {
  for (const [scrollY, expected] of [[0, 0], [2100, .5], [4200, 1]]) {
    const value = layout({ ...page, scrollY });
    assert.equal(value.progress, expected);
    assert.ok(value.bandStart <= expected && value.bandStart + value.bandSize >= expected - 1e-9);
    assert.ok(value.bandStart >= 0 && value.bandStart + value.bandSize <= 1 + 1e-9);
  }
  assert.equal(layout({ ...page, scrollY: 4200 }).activeIndex, 7);
});
test('Short desktop heights keep every label in bounds without overlap', () => {
  const value = layout({ ...page, scrollY: 2300, railHeight: 350, sectionTops: [0, 800, 1200, 1600, 3000, 3010, 3020, 4500] });
  assert.ok(value.positions[0] >= 0);
  assert.ok(value.positions.at(-1) + 20 <= 350);
  value.positions.slice(1).forEach((y, i) => assert.ok(y - value.positions[i] >= 28 - 1e-9));
});
test('A page shorter than the screen has finite positions and zero progress', () => {
  const value = layout({ ...page, scrollY: -10, documentHeight: 600 });
  assert.equal(value.progress, 0);
  assert.equal(value.bandStart, 0);
  assert.equal(value.bandSize, 1);
  value.positions.forEach(y => assert.ok(Number.isFinite(y)));
});
