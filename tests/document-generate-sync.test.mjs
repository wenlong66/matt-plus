import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (file) => readFileSync(new URL(`../skills/document-generate/${file}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n');

test('document-generate retains all Diataxis stages and the updated archaeology emphasis', () => {
  const body = read('SKILL.md');
  for (let step = 0; step <= 9; step++) {
    assert.match(body, new RegExp(`^## Step ${step}:`, 'm'));
  }
  assert.match(body, /The quality of the documentation depends on how well you understand the code, so this\nstep carries the most weight\./);
  assert.match(read('references/runtime.md'), /92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4/);
  const quadrants = read('references/writing-quadrants.md');
  for (const quadrant of ['Reference', 'Explanation', 'How-To', 'Tutorial']) {
    assert.ok(`${body}\n${quadrants}`.includes(quadrant));
  }
});

test('document-generate live-format secrets remain blocked in or outside fences', () => {
  const publishing = read('references/publishing.md');
  assert.match(publishing, /live-format secret blocks wherever it\nappears, fenced or not/);
  assert.match(publishing, /individually reviewed synthetic example/);
  assert.match(publishing, /exact staged content/);
  assert.match(publishing, /--from-file/);
  assert.doesNotMatch(publishing, /fences won't excuse/);
});
