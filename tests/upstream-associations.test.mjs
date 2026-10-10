import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const skills = ['design-consultation', 'document-release', 'document-generate', 'test-audit'];
const read = path => readFileSync(join(root, path), 'utf8').replace(/\r\n/g, '\n');
const upstreamCommand = /(?:^|[\s`'"(>])\/(?:office-hours|review|ship|qa(?:-only)?|plan-(?:eng|ceo|design)-review|autoplan|codex|claude-code|gstack-upgrade|retro|context-save|setup-browser-cookies)(?=[\s`'",.;:)]|$)/m;

const markdownFiles = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const file = join(directory, entry.name);
  return entry.isDirectory() ? markdownFiles(file) : file.endsWith('.md') ? [file] : [];
});

test('gstack runtime instructions do not expose unbundled upstream skill commands', () => {
  for (const skill of skills) {
    for (const file of markdownFiles(join(root, 'skills', skill))) {
      const text = readFileSync(file, 'utf8').replace(/https?:\/\/[^\s)>]+/g, '');
      assert.doesNotMatch(text, upstreamCommand, file);
    }
  }
});

test('documentation follow-ups name the existing package skills without making them mandatory', () => {
  const release = read('skills/document-release/SKILL.md');
  const generate = read('skills/document-generate/SKILL.md');
  assert.match(release, /suggest.*\/matt-plus:document-generate/i);
  assert.doesNotMatch(release, /`\/document-generate`/);
  assert.match(generate, /\/matt-plus:document-release/);
  assert.doesNotMatch(generate, /`\/document-release`/);
  assert.match(release, /Do NOT auto-generate missing/);
});

test('shared host associations retain destructive prose confirmation and plan-mode stops', () => {
  const host = read('references/codex-tools.md');
  const runtime = read('skills/test-audit/references/runtime.md');
  assert.match(host, /exact option letter or word/);
  assert.match(host, /"ok".*"sure".*not.*confirmed/);
  assert.match(host, /ambiguous.*re-ask/s);
  assert.match(host, /final message.*STOP and wait/s);
  assert.match(host, /plan-mode restrictions.*take precedence/s);
  assert.match(host, /cannot grant.*read-only.*exception/);
  assert.match(host, /STOP point.*do not exit plan mode/s);
  assert.match(runtime, /shared host boundaries.*codex-tools\.md#question-and-plan-mode-boundaries/);
});
