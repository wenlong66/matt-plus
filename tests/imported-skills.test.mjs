import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const imports = [
  ['security-audit-skill', 'security-audit'],
  ['vercel-skills', 'react-native-skills'],
  ['agent-skills', 'observability-and-instrumentation'],
];

function files(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const relative = join(prefix, entry.name);
    return entry.isDirectory() ? files(join(directory, entry.name), relative) : [relative];
  }).sort();
}

for (const [repository, skill] of imports) {
  const source = join(root, '..', repository, 'skills', skill);
  test(`${skill} preserves every original file byte for byte`, {
    skip: !existsSync(source) && 'Source checkout is optional, not a runtime dependency',
  }, () => {
    const destination = join(root, 'skills', skill);
    const originals = files(source);
    assert.deepEqual(files(destination), originals);
    for (const file of originals) {
      assert.deepEqual(readFileSync(join(destination, file)), readFileSync(join(source, file)), file);
    }
  });
}

test('observability ships its original checklist at the referenced path', () => {
  const skill = join(root, 'skills', 'observability-and-instrumentation');
  const body = readFileSync(join(skill, 'SKILL.md'), 'utf8');
  const reference = body.match(/`(\.\.\/\.\.\/references\/observability-checklist\.md)`/)[1];
  const checklist = readFileSync(join(skill, reference));
  const source = join(root, '..', 'agent-skills', 'references', 'observability-checklist.md');
  if (existsSync(source)) assert.deepEqual(checklist, readFileSync(source));
});

test('removed skills and their private resources are absent', () => {
  for (const skill of ['frontend-ui-engineering', 'design-review', 'security-and-hardening']) {
    assert.equal(existsSync(join(root, 'skills', skill)), false, skill);
  }
});
