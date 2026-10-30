import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
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

const apiSource = join(root, '..', 'agent-skills');
test('api-and-interface-design preserves the pinned source except its declared association adapter', {
  skip: !existsSync(apiSource) && 'Source checkout is optional, not a runtime dependency',
}, () => {
  const skill = 'api-and-interface-design';
  const destination = join(root, 'skills', skill);
  assert.deepEqual(files(destination), ['SKILL.md']);
  const result = spawnSync('git', ['-C', apiSource, 'show',
    `1f61bbc0749affdf89f3951b9e232b42e984ebd0:skills/${skill}/SKILL.md`], {
    encoding: 'utf8', timeout: 10000,
    env: { ...process.env, GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0' },
  });
  assert.equal(result.status, 0, result.stderr);
  const original = '- **Plan for deprecation at design time.** See `deprecation-and-migration` for how to safely remove things users depend on.';
  const adapted = '- **Plan for deprecation at design time.** Use a deprecation and migration plan to safely remove things users depend on.';
  assert.equal(result.stdout.split(original).length, 2, 'Expected exactly one upstream association');
  assert.deepEqual(readFileSync(join(destination, 'SKILL.md')), Buffer.from(result.stdout.replace(original, adapted)));
});

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
