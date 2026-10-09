import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const upstream = join(root, '..', 'gstack');
const revision = '54efba6dd5a6dc7f04e62106b97079279ed53b41';
const read = path => readFileSync(join(root, 'skills/test-audit', path), 'utf8').replace(/\r\n/g, '\n');
const skill = read('SKILL.md');
const bar = read('references/test-value-bar.md').trimEnd();
const scopeBlock = text => text.match(/## Step 1: Scope and seeds\n\n```bash\n([\s\S]*?)\n```/)[1];
const source = path => {
  const result = spawnSync('git', ['-C', upstream, 'show', `${revision}:${path}`], {
    encoding: 'utf8', timeout: 10000,
    env: { ...process.env, GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0' },
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.replace(/\r\n/g, '\n');
};

test('test-audit preserves the pinned domain workflow with only declared runtime substitutions', {
  skip: !existsSync(upstream) && 'Pinned source is optional, not a runtime dependency',
}, () => {
  const template = source('test-audit/SKILL.md.tmpl');
  const expected = template.slice(template.indexOf('# /test-audit:'))
    .replace('{{TEST_VALUE_BAR:audit}}', () => bar);
  const actual = skill.slice(skill.indexOf('# /test-audit:'))
    .replace('When runtime session resolution identifies `spawned` or `headless`',
      'When the preamble echoed `SESSION_KIND: spawned` or `headless`')
    .replace(/Read \[the complete test value bar\][\s\S]*?retirement-card requirements\./, () => bar)
    .replace(scopeBlock(skill), () => scopeBlock(template))
    .replace("the project instruction file's `## Testing` command (see runtime associations)",
      'the CLAUDE.md `## Testing` command');
  assert.equal(actual, expected);
  const generated = source('test-audit/SKILL.md');
  assert.equal(bar, generated.match(/\*\*Test value bar\.\*\*[\s\S]*?(?=\n\n## Step 1:)/)[0]);
});

test('session and landing associations retain report-only child runs and interactive approval', () => {
  const runtime = read('references/runtime.md');
  assert.match(runtime, /Spawned and headless sessions[\s\S]*?ask nothing, edit nothing/);
  assert.match(runtime, /never\s+auto-approve/);
  assert.match(runtime, /present the same decision in chat and wait/);
  assert.match(runtime, /never stages\/commits, pushes or creates a PR/);
  assert.doesNotMatch(skill + bar, /\{\{[A-Z_]|\$GSTACK_|~\/\.claude\/skills\/gstack/);
});

test('scope setup runs with independent report and seed directories, including paths with spaces', t => {
  const probe = spawnSync('bash', ['--version'], { encoding: 'utf8', timeout: 10000 });
  if (probe.status !== 0) return t.skip('Installed Bash is optional on this host');
  const directory = mkdtempSync(join(tmpdir(), 'test-audit standalone '));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const project = join(directory, 'target');
  const reports = join(directory, 'report output');
  const seeds = join(directory, 'plan seeds');
  mkdirSync(join(project, 'tests'), { recursive: true });
  mkdirSync(seeds);
  const git = args => {
    const result = spawnSync('git', args, { cwd: project, encoding: 'utf8', timeout: 10000 });
    assert.equal(result.status, 0, result.stderr);
  };
  git(['init', '-b', 'audit-branch']);
  git(['symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/trunk']);
  writeFileSync(join(project, 'tests/owner.test.js'), 'assert.equal(1, 1);\n');
  git(['add', 'tests/owner.test.js']);
  const oldPlan = join(seeds, 'old-audit-branch-eng-review-test-plan-1.md');
  const newPlan = join(seeds, 'new-audit-branch-eng-review-test-plan-2.md');
  writeFileSync(oldPlan, '## Tests to Retire\nold candidate\n');
  writeFileSync(newPlan, '## Tests to Retire\nnew candidate\n');
  utimesSync(oldPlan, 1000, 1000);
  utimesSync(newPlan, 2000, 2000);
  const run = spawnSync('bash', ['--noprofile', '--norc', '-c', scopeBlock(skill)], {
    cwd: project, encoding: 'utf8', timeout: 10000,
    env: { ...process.env, REPORT_DIR: reports.replace(/\\/g, '/'), SEED_PLAN_DIR: seeds.replace(/\\/g, '/') },
  });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /DEFAULT_BRANCH: trunk/);
  assert.match(run.stdout, /TESTFILES:1/);
  assert.match(run.stdout, /SEED_PLAN:.*new-audit-branch-eng-review-test-plan-2\.md/);
  assert.ok(existsSync(reports));
  assert.match(run.stdout, /REPORT:.*report output\/test-audit-\d{8}-\d{6}\.md/);
});
