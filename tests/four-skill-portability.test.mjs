import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { load } from '../scripts/vendor/js-yaml/dist/js-yaml.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const skills = ['design-consultation', 'document-release', 'document-generate'];

test('three skill instructions resolve their resources inside the package', () => {
  const files = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? files(file) : file.endsWith('.md') ? [file] : [];
  });
  const pending = skills.flatMap(skill => files(join(root, 'skills', skill)));
  const seen = new Set();
  while (pending.length) {
    const file = pending.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    const text = readFileSync(file, 'utf8').replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*\r?$/gm, '');
    assert.doesNotMatch(text, /\{\{[A-Z][A-Z0-9_:.-]*\}\}|\$GSTACK_[A-Z_]+/);
    for (const match of text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
      const link = match[1];
      if (/^(?:https?:|mailto:|#)/.test(link)) continue;
      const target = resolve(dirname(file), decodeURI(link.split('#')[0]));
      const inside = relative(root, target);
      assert.ok(!isAbsolute(inside) && inside !== '..' && !inside.startsWith(`..${sep}`), link);
      assert.ok(existsSync(target), `${relative(root, file)}: ${link}`);
      if (inside.startsWith(`references${sep}`) && target.endsWith('.md')) pending.push(target);
    }
  }
});

test('three skills retain their discovery text and source metadata in supported frontmatter', () => {
  for (const skill of skills) {
    const body = readFileSync(join(root, 'skills', skill, 'SKILL.md'), 'utf8');
    const front = load(body.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]);
    assert.equal(front.name, skill);
    assert.ok(front.description.length > 0 && front.description.length <= 1024);
    assert.equal(front.metadata.version, '1.0.0');
    assert.ok(front.metadata.triggers.trim());
    for (const key of Object.keys(front)) {
      assert.ok(['name', 'description', 'allowed-tools', 'metadata'].includes(key), key);
    }
  }
});

test('three-skill resources and helpers work after relocation without gstack, npm or another skill', t => {
  const directory = mkdtempSync(join(tmpdir(), 'three skill portability '));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const bundle = join(directory, 'relocated plugin');
  const cwd = join(directory, 'unrelated project');
  mkdirSync(cwd);
  for (const resource of ['scripts', 'references', 'assets', 'licenses']) {
    cpSync(join(root, resource), join(bundle, resource), { recursive: true });
  }
  for (const skill of skills) {
    cpSync(join(root, 'skills', skill), join(bundle, 'skills', skill), { recursive: true });
  }
  assert.equal(existsSync(join(directory, 'gstack')), false);
  assert.equal(existsSync(join(bundle, 'node_modules')), false);
  assert.equal(existsSync(join(bundle, 'skills', 'frontend-ui-engineering')), false);
  const run = (script, args, input) => {
    const result = spawnSync(process.execPath, [join(bundle, script), ...args], {
      cwd, input, encoding: 'utf8', timeout: 10000,
    });
    assert.equal(result.status, 0, result.stderr || result.error?.message);
    return result.stdout;
  };
  assert.match(run('scripts/design-md.mjs', ['check', join(bundle, 'assets/design-system-spec-template.md')]), /DESIGN_MD_FORMAT: spec/);
  const tokens = JSON.parse(run('scripts/design-md.mjs', ['tokens', join(bundle, 'assets/design-system-spec-template.md')]));
  assert.ok(Object.keys(tokens).length);
  const image = join(cwd, 'saved image.png');
  writeFileSync(image, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRzUAAAAASUVORK5CYII=', 'base64'));
  const input = join(cwd, 'board input.json');
  writeFileSync(input, JSON.stringify({ round: 'relocated', images: [image] }));
  const board = JSON.parse(run('skills/design-consultation/scripts/prepare-board.mjs', [input, cwd]));
  assert.ok(existsSync(board.boardPath));
  assert.equal(JSON.parse(readFileSync(board.manifestPath, 'utf8')).length, 1);
  const content = join(cwd, 'checked prose.txt');
  writeFileSync(content, 'A synthetic public documentation example.');
  assert.equal(JSON.parse(run('scripts/content-guard.mjs', ['--from-file', content, '--json'])).findings.length, 0);
  writeFileSync(content, 'NO_FINDINGS\nRecommendation: keep the documentation because it matches the source.\n');
  assert.match(run('scripts/outside-review-result.mjs', ['review', content, '--verdict', '--exit', '0']), /VERDICT: clean/);
  assert.match(run('skills/document-release/scripts/tracker-envelope.mjs', ['--stdin'], 'Synthetic tracker context'), /Synthetic tracker context/);
  assert.match(run('skills/document-release/scripts/docs-candidate.mjs', ['--help']), /snapshot/);
});

test('document-generate distributes the complete pinned upstream quadrant templates unchanged', {
  skip: !existsSync(join(root, '..', 'gstack')) && 'Pinned source is optional, not a runtime dependency',
}, () => {
  const source = spawnSync('git', ['-C', join(root, '..', 'gstack'), 'show',
    '92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4:document-generate/SKILL.md.tmpl'], {
    encoding: 'utf8', env: { ...process.env, GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0' },
  });
  assert.equal(source.status, 0, source.stderr);
  const expected = source.stdout.split('## Step 3:')[1].split('## Step 7:')[0];
  const bundled = readFileSync(join(root, 'skills/document-generate/references/writing-quadrants.md'), 'utf8').replace(/\r\n/g, '\n');
  assert.equal(bundled.trim(), `## Step 3:${expected}`.replace(/\n---\s*$/, '').trim());
});
