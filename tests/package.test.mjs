import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const rootRealPath = realpathSync(root);
const EXPECTED_SKILLS = [
  'design-consultation',
  'frontend-ui-engineering',
  'web-qa',
  'design-review',
  'security-and-hardening',
  'security-audit',
  'shipping-and-launch',
  'setup-deploy',
  'land-and-deploy',
  'document-generate',
  'document-update',
];
const TEXT_EXTENSIONS = new Set(['.html', '.json', '.md', '.mjs']);
const readJson = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
const plugin = readJson('.claude-plugin/plugin.json');
const marketplace = readJson('.claude-plugin/marketplace.json');

function packageFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? packageFiles(path) : TEXT_EXTENSIONS.has(path.slice(path.lastIndexOf('.'))) ? [path] : [];
  });
}

function distributableFiles() {
  return [
    ...['README.md', 'integration-plan.md', 'THIRD_PARTY_NOTICES.md'].map((name) => join(root, name)),
    ...packageFiles(join(root, 'references')),
    ...packageFiles(join(root, 'skills')),
  ];
}

function assertInsidePackage(file, link) {
  const targetPath = link.split('#', 1)[0];
  assert.ok(!isAbsolute(targetPath), `${relative(root, file)}: absolute local link ${link}`);
  const target = resolve(dirname(file), decodeURI(targetPath));
  assert.ok(existsSync(target), `${relative(root, file)}: missing ${link}`);
  const localPath = relative(rootRealPath, realpathSync(target));
  assert.ok(localPath !== '..' && !localPath.startsWith(`..${sep}`) && !isAbsolute(localPath), `${relative(root, file)}: external dependency ${link}`);
}

test('marketplace resolves to this plugin with matching metadata', () => {
  assert.equal(plugin.name, 'matt-plus');
  assert.equal(marketplace.plugins.length, 1);
  const entry = marketplace.plugins[0];
  assert.equal(entry.name, plugin.name);
  assert.equal(entry.version, plugin.version);
  assert.equal(entry.source, './');
  assert.ok(plugin.author.name);
});

test('manifest declares exactly the four-domain skill matrix', () => {
  assert.deepEqual(plugin.skills.map((path) => basename(path)), EXPECTED_SKILLS);
  const shipped = readdirSync(join(root, 'skills'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(shipped, [...EXPECTED_SKILLS].sort());
});

test('every declared skill contains a self-contained local body', () => {
  for (const skill of plugin.skills) {
    const body = readFileSync(join(root, skill, 'SKILL.md'), 'utf8');
    assert.equal(body.match(/^name:\s*(.+)$/m)?.[1], basename(skill));
    assert.match(body, /^description:\s*\S/m);
    assert.ok(body.split('\n').length > 20, `${skill}: missing the actual workflow`);
    assert.doesNotMatch(body, /\{\{[^}]+\}\}|~\/\.gstack|~\/\.claude\/skills\/gstack|\$B\b|\bBun\b/);
  }
});

test('web-qa requires a CLI, evidence, and finding-level repair approval', () => {
  const body = readFileSync(join(root, 'skills', 'web-qa', 'SKILL.md'), 'utf8');
  assert.match(body, /\bplaywright-cli\b/i);
  assert.match(body, /\bUNVERIFIED\b/);
  assert.match(body, /每个 finding 的源码或测试修改都要单独获得用户批准/);
  assert.match(body, /只有用户.*明确同意后，才能执行 `npm install -g @playwright\/cli@latest`/);
  assert.match(body, /导入个人 cookie/);
  assert.match(body, /不要.*启动任意开发服务器/);
  assert.match(body, /不要使用 `attach`.*`state-load`.*`playwright-cli install`/);
  assert.doesNotMatch(body, /\bMCP\b|~\/\.gstack|\$B\b|\bBun\b/);
});

test('all distributable Markdown links resolve within the package', () => {
  for (const file of distributableFiles().filter((path) => path.endsWith('.md'))) {
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
      const link = match[1].trim();
      if (/^(?:https?:|mailto:|#)/.test(link)) continue;
      assertInsidePackage(file, link);
    }
  }
});

test('package excludes rejected drafts and upstream runtime coupling', () => {
  const text = distributableFiles().map((file) => readFileSync(file, 'utf8')).join('\n');
  assert.doesNotMatch(text, /qa-only|constraint-driven-development/);
  assert.doesNotMatch(text, /\{\{[^}]+\}\}|~\/\.gstack|~\/\.claude\/skills\/gstack|\$B\b|\bBun\b/);
  assert.doesNotMatch(text, /gstack\s+(?:telemetry|updater)|(?:telemetry|updater)\s+gstack/i);
});

test('each shipped skill has source attribution and positive plus boundary evals', () => {
  const evals = readJson('evals/evals.json');
  const notices = readFileSync(join(root, 'THIRD_PARTY_NOTICES.md'), 'utf8');
  assert.ok(existsSync(join(root, 'LICENSE')));
  assert.ok(Array.isArray(evals.evals));
  for (const name of EXPECTED_SKILLS) {
    const cases = evals.evals.filter((entry) => entry.skill_name === name);
    assert.equal(cases.length, 2, `${name}: expected positive and boundary cases`);
    assert.ok(cases.some((entry) => entry.kind === 'positive'), `${name}: missing positive case`);
    assert.ok(cases.some((entry) => entry.kind === 'boundary'), `${name}: missing boundary case`);
    for (const entry of cases) {
      assert.ok(entry.id && entry.prompt && entry.expected_output, `${name}: incomplete eval case`);
    }
    assert.ok(notices.includes(`### ${name}`), `${name}: no attribution`);
  }
});
