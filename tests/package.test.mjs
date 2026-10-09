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
  'design-review',
  'document-release',
  'document-generate',
  'security-and-hardening',
  'code-simplification',
];
const TEXT_EXTENSIONS = new Set(['.html', '.js', '.json', '.md', '.mjs', '.sh']);
const HOST_MACROS = /\{\{[A-Z][A-Z0-9_:.-]*\}\}/;
const HOST_RUNTIME = /\$B\b|\$GSTACK_[A-Z_]+/;
const HOST_EXECUTABLE = /~\/\.gstack|~\/\.claude\/skills\/gstack|\bbun\s+(?:run|install|exec)\b/;
const readJson = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
const readText = (path) => readFileSync(join(root, path), 'utf8');
const plugin = readJson('.claude-plugin/plugin.json');
const marketplace = readJson('.claude-plugin/marketplace.json');
const codexPlugin = readJson('.codex-plugin/plugin.json');

function packageFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? packageFiles(path) : TEXT_EXTENSIONS.has(path.slice(path.lastIndexOf('.'))) ? [path] : [];
  });
}

function distributableFiles() {
  return [
    ...['README.md', 'integration-plan.md', 'THIRD_PARTY_NOTICES.md'].map((name) => join(root, name)),
    ...['references', 'skills', 'scripts'].flatMap((name) => packageFiles(join(root, name))),
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

function skillResources(name) {
  return packageFiles(join(root, 'skills', name))
    .filter((path) => path.endsWith('.md'))
    .map((path) => readFileSync(path, 'utf8')).join('\n');
}

function withoutCodeExamples(text) {
  return text.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, '');
}

function codeExamples(text) {
  return Array.from(text.matchAll(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm), (match) => match[0]).join('\n');
}

test('marketplace resolves to this plugin with matching metadata', () => {
  assert.equal(plugin.name, 'matt-plus');
  assert.equal(marketplace.plugins.length, 1);
  const entry = marketplace.plugins[0];
  for (const field of ['name', 'version', 'description', 'license']) {
    assert.equal(entry[field], plugin[field], `${field} differs`);
  }
  assert.equal(entry.source, './');
  assert.ok(plugin.author.name);
});

test('Codex plugin shares the canonical skill tree and metadata', () => {
  for (const field of ['name', 'version', 'description', 'author', 'homepage', 'repository', 'license']) {
    assert.deepEqual(codexPlugin[field], plugin[field], `Codex plugin ${field} differs`);
  }
  assert.equal(codexPlugin.skills, './skills/');
  assert.equal(realpathSync(join(root, codexPlugin.skills)), realpathSync(join(root, 'skills')));
});

test('manifest and shipped directories contain exactly the seven skills', () => {
  assert.deepEqual(plugin.skills.map((path) => basename(path)), EXPECTED_SKILLS);
  const shipped = readdirSync(join(root, 'skills'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  assert.deepEqual([...shipped].sort(), [...EXPECTED_SKILLS].sort());
});

test('every declared skill includes its original-name workflow, not a pointer stub', () => {
  for (const skill of plugin.skills) {
    const body = readText(`${skill}/SKILL.md`);
    assert.equal(body.match(/^name:\s*(.+)$/m)?.[1], basename(skill));
    assert.match(body, /^description:\s*\S/m);
    assert.ok(body.split('\n').length > 20, `${skill}: missing workflow`);
    assert.doesNotMatch(body, HOST_MACROS, `${skill}: unexpanded host macro`);
    assert.doesNotMatch(body, HOST_RUNTIME, `${skill}: unresolved runtime handle`);
    assert.doesNotMatch(codeExamples(body), HOST_EXECUTABLE, `${skill}: host executable dependency`);
  }
});

test('original frontend tutorials and security domain controls are retained', () => {
  const frontend = skillResources('frontend-ui-engineering');
  for (const marker of [/Component Architecture/i, /State Management/i, /Optimistic/i, /Reference-Led/i, /Common Rationalizations/i]) {
    assert.match(frontend, marker);
  }
  const security = skillResources('security-and-hardening');
  for (const marker of [/Threat Model First/i, /STRIDE/, /abuse cases/i, /Dependencies and supply chain/i, /Personal data and privacy/i, /LLM output/i]) {
    assert.match(security, marker);
  }
  assert.ok(existsSync(join(root, 'skills/security-and-hardening/references/hardening-patterns.md')));
});

test('design workflows retain proposals, visual evidence, fixes and recovery', () => {
  const consultation = skillResources('design-consultation');
  for (const marker of [/DESIGN\.md/, /preview/i, /Comparison Board \+ Feedback Loop/i, /typography/i, /color/i]) assert.match(consultation, marker);
  const review = skillResources('design-review');
  for (const marker of [/audit/i, /fix/i, /atomic/i, /before/i, /after/i, /regression/i, /revert/i]) assert.match(review, marker);
  assert.ok(existsSync(join(root, 'skills/design-consultation/assets/design-preview.html')));
});

test('both original documentation workflows retain their distinct phases', () => {
  const release = skillResources('document-release');
  for (const marker of [/coverage/i, /diagram/i, /CHANGELOG/, /TODOS\.md/, /VERSION/, /commit/i, /push/i, /(?:PR|MR)/]) assert.match(release, marker);
  const generate = skillResources('document-generate');
  for (const marker of [/archaeology/i, /concept map/i, /Di[aá]taxis/i, /tutorial/i, /how-to/i, /reference/i, /explanation/i, /commit/i]) assert.match(generate, marker);
});

test('all instruction/document Markdown links resolve inside the package', () => {
  for (const file of distributableFiles().filter((path) => path.endsWith('.md'))) {
    const text = withoutCodeExamples(readFileSync(file, 'utf8'));
    for (const match of text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
      const link = match[1].trim();
      if (/^(?:https?:|mailto:|#)/.test(link)) continue;
      assertInsidePackage(file, link);
    }
  }
});

test('skill resources have no unresolved host macro or private runtime association', () => {
  for (const file of packageFiles(join(root, 'skills'))) {
    const text = readFileSync(file, 'utf8');
    assert.doesNotMatch(text, HOST_MACROS, relative(root, file));
    assert.doesNotMatch(text, HOST_RUNTIME, relative(root, file));
    assert.doesNotMatch(codeExamples(text), HOST_EXECUTABLE, relative(root, file));
  }
});

test('shared adapters declare prerequisites, permission gates and exact-byte checking', () => {
  const actions = readText('references/external-actions.md');
  for (const marker of [/approval/i, /unrelated/i, /UNVERIFIED/, /denied/i, /atomic/i]) assert.match(actions, marker);
  const browser = readText('references/browser-tools.md');
  for (const marker of [/playwright-cli/, /help/, /UNVERIFIED/, /pixel.diff/i, /before\/after/i]) assert.match(browser, marker);
  const image = readText('references/image-tools.md');
  for (const marker of [/HTML/, /fallback/i, /approved/i, /UNVERIFIED/]) assert.match(image, marker);
  const guard = readText('references/content-guard.md');
  for (const marker of [/exact final/i, /outgoing commit/i, /subsequently deleted/i, /--from-file/, /semantic/i]) assert.match(guard, marker);
});

test('local HTML browser configuration is opt-in, isolated and offline', () => {
  const config = readJson('assets/browser-local.json');
  assert.equal(config.allowUnrestrictedFileAccess, true);
  assert.equal(config.browser.isolated, true);
  assert.equal(config.browser.launchOptions.headless, true);
  assert.equal(config.browser.contextOptions.offline, true);
  assert.equal(config.browser.userDataDir, undefined);
});

test('each original skill has pinned source attribution and preserved licensing', () => {
  const notices = readText('THIRD_PARTY_NOTICES.md');
  const license = readText('LICENSE');
  assert.match(notices, /14873a11dfc2ac7ed5be19069e0d0828ef7f2fec/);
  assert.match(notices, /e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/);
  assert.match(notices, /92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4/);
  assert.match(notices, /Paul Bakaus/);
  assert.match(notices, /Google LLC/);
  assert.match(readText('licenses/Apache-2.0.txt'), /Version 2\.0, January 2004/);
  assert.match(readText('scripts/vendor/js-yaml/LICENSE'), /Permission is hereby granted/);
  assert.match(license, /MIT License/);
  assert.match(license, /Addy Osmani/);
  assert.match(license, /Garry Tan/);
  for (const name of EXPECTED_SKILLS) {
    assert.ok(notices.includes(`### ${name}`), `${name}: missing attribution`);
  }
  assert.equal(existsSync(join(root, 'evals')), false, 'effectiveness evaluations are outside this adaptation');
});
