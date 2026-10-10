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

test('document-generate uses real package entries and keeps release coverage optional', () => {
  const body = read('SKILL.md');
  const runtime = read('references/runtime.md');
  for (const file of ['SKILL.md', 'references/runtime.md', 'references/publishing.md', 'references/writing-quadrants.md']) {
    assert.doesNotMatch(read(file), /(^|[\s`])\/(?:ship|review|plan-ceo-review|document-release|document-generate)\b/m, file);
  }
  assert.match(body, /\/matt-plus:document-generate/);
  assert.match(body, /\/matt-plus:document-release/);
  assert.match(body, /Claude Code[\s\S]*Codex[\s\S]*loaded[\s\S]*name/);
  assert.match(runtime, /\/matt-plus:document-release/);
  assert.match(runtime, /optional source of a coverage map, not a required invocation/);
  assert.match(runtime, /user-provided map works independently/);
});

test('document-generate live-format secrets remain blocked in or outside fences', () => {
  const publishing = read('references/publishing.md');
  assert.match(publishing, /live-format secret blocks wherever it\nappears, fenced or not/);
  assert.match(publishing, /individually reviewed synthetic example/);
  assert.match(publishing, /exact staged content/);
  assert.match(publishing, /--from-file/);
  assert.doesNotMatch(publishing, /fences won't excuse/);
});
