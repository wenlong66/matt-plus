import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const REVISION = '92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4';
const sourceRoot = fileURLToPath(new URL('../../gstack/', import.meta.url));
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const snapshot = (path) => {
  const result = spawnSync('git', ['-C', sourceRoot, 'show', `${REVISION}:${path}`], {
    encoding: 'utf8', env: { ...process.env, GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0' },
  });
  assert.equal(result.status, 0, 'Fixed source must be available locally; no mutable worktree fallback');
  return result.stdout;
};

test('shared catalog distributes all fixed-source prose and prioritization without shortening', {
  skip: !existsSync(sourceRoot) && 'Source snapshot is optional, never a runtime dependency',
}, () => {
  const source = snapshot('lib/design-catalog.ts');
  const display = source.match(/const OVERUSED_DISPLAY = (\[[\s\S]*?\]);/)[1];
  const literal = source.match(/export const DESIGN_SLOP_CATALOG: DesignSlopEntry\[\] = (\[[\s\S]*?\n\]);/)[1];
  const entries = runInNewContext(`const OVERUSED_DISPLAY = ${display}; (${literal})`, {}, { timeout: 1000 });
  const catalog = read('references/design-catalog.md');
  assert.equal(entries.length, 86);
  assert.equal(new Set(entries.map((entry) => entry.id)).size, 86);
  assert.equal((catalog.match(/^### /gm) ?? []).length, entries.length);
  for (const entry of entries) {
    const block = catalog.split(`### ${entry.id}: ${entry.name}\n`)[1]?.split('\n### ')[0];
    assert.ok(block, `Missing ${entry.id}`);
    assert.ok(block.includes(entry.prose), `${entry.id}: domain prose changed`);
    for (const key of ['category', 'kind', 'confidence', 'tier', 'impact', 'source']) {
      assert.ok(block.includes(`\`${entry[key]}\``), `${entry.id}: ${key} missing`);
    }
    if (entry.heuristic) assert.ok(block.includes(entry.heuristic), `${entry.id}: heuristic missing`);
    if (entry.impeccableId) assert.ok(block.includes(`Detector ID: \`${entry.impeccableId}\``));
  }
});

test('Apache license is an unmodified copy of the pinned source license', {
  skip: !existsSync(sourceRoot) && 'Source snapshot is optional, never a runtime dependency',
}, () => {
  assert.equal(read('licenses/Apache-2.0.txt'), snapshot('licenses/Apache-2.0.txt'));
});

test('bundled parser and its license retain verified original bytes and version', () => {
  for (const [path, expected] of [
    ['dist/js-yaml.mjs', '5b4536e72a2203aa6f159630caeefde35a95d8f95620f5a1d3c48efe3a0e76fa'],
    ['LICENSE', 'a07bc24468b9654ce76a547d47a2db282d07733b715db4c73a98bd63961f9550'],
    ['package.json', 'a60d092d63c8108375c203870ad8dc50af32bc373d45816ecee98eacc389bbba'],
  ]) {
    const bytes = readFileSync(new URL(`../scripts/vendor/js-yaml/${path}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected);
  }
  const metadata = JSON.parse(read('scripts/vendor/js-yaml/package.json'));
  assert.equal(metadata.version, '4.2.0');
  assert.equal(metadata.license, 'MIT');
});
