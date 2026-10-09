import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../skills/design-review/${path}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// These are package prompt/resource contracts, not an executed live design audit.
test('clean-tree setup precedes every audit and the new regression stage precedes repair', () => {
  const skill = read('SKILL.md');
  assert.equal(skill.match(/^name: (.+)$/m)?.[1], 'design-review');
  assert.ok(skill.indexOf('**Check for clean working tree:**') < skill.indexOf('## Phases 1-6'));
  const regressionStage = skill.indexOf('### 8a.6. Regression Test Before Repair');
  assert.ok(regressionStage >= 0);
  assert.ok(regressionStage < skill.indexOf('### 8b. Fix'));
  assert.match(skill, /Never modify existing tests — only create new test files/);
  assert.match(skill, /Never modify CI configuration/);
  assert.match(skill, /Hard cap: 30 fixes/);
  assert.match(skill, /If risk > 20%/);
  assert.match(skill, /Phases 1-6 audit only/);
});

test('all visitor modes, craft reflexes and original rejection/litmus checks are distributed', () => {
  const rules = read('references/design-hard-rules.md');
  for (const mode of ['PERSUADE', 'OPERATE', 'READ', 'EXPERIENCE', 'HYBRID']) assert.ok(rules.includes(`**${mode}**`));
  for (const term of ['65-75ch', 'docs index', 'Never crop', 'offset', 'tinted', 'use scene', 'Book cloth and jackets', '6rem']) assert.ok(rules.includes(term), term);
  assert.match(rules, /Generic SaaS card grid as first impression/);
  assert.match(rules, /Would design feel premium with all decorative shadows removed/);
  assert.match(rules, /design-catalog\.md/);
  assert.doesNotMatch(rules, /2-3 intentional motions minimum/);
});

test('role-aware type and complete catalog augment rather than truncate the original checklist', () => {
  const checklist = read('references/audit-checklist.md');
  assert.match(checklist, /DM Sans, Instrument Sans, IBM Plex Sans/);
  assert.match(checklist, /Banned in any role/);
  assert.match(checklist, /display\/body\/label\/mono/);
  assert.match(checklist, /design-catalog\.md/);
  assert.match(checklist, /11 legacy/);
  assert.match(checklist, /browser surfaces/i);
  assert.match(checklist, /authored motion/);
  assert.match(checklist, /polish.*do not affect grade/i);
  assert.match(checklist, /Performance as Design/);
});

test('spec reading is read-only and export retains the persisted format choice', () => {
  const skill = read('SKILL.md');
  const mapping = read('references/tool-mapping.md');
  assert.match(skill, /design-md-format\.md/);
  assert.match(skill, /design-system-spec-template\.md/);
  assert.match(mapping, /design-md\.mjs/);
  assert.match(mapping, /check.*tokens/s);
  assert.match(mapping, /never.*convert.*mark/i);
  assert.match(mapping, /legacy.*unknown.*prose/is);
  assert.match(mapping, /TOKEN_REF_INVALID/);
});

test('native test evidence prevents a second framework and candidate commands are not probes', () => {
  const framework = read('references/test-framework.md');
  for (const evidence of ['CLAUDE.md', 'TESTING.md', 'manage.py', 'tests.py', '*_test.go', '#[test]', 'pom.xml', 'build.gradle', 'Makefile']) assert.ok(framework.includes(evidence), evidence);
  assert.match(framework, /Other/);
  assert.match(framework, /never.*run.*guess/i);
  assert.match(framework, /Never silently delete a valid red regression/);
  assert.match(framework, /owned changes/);
  assert.match(framework, /unrelated staged/);
});

test('JS-only regressions keep the exact bug procedure and valid red evidence', () => {
  const regression = read('references/regression-tests.md');
  assert.match(regression, /before repair/i);
  assert.match(regression, /JavaScript behavior/);
  assert.match(regression, /Pure CSS/);
  for (const field of ['protects', 'fails_when', 'why_new', 'seam']) assert.ok(regression.includes(field));
  assert.match(regression, /precondition/);
  assert.match(regression, /null input, empty array, boundary value/);
  assert.match(regression, /max number \+ 1/);
  assert.match(regression, /Found by \/design-review/);
  assert.match(regression, /valid red.*uncommitted/s);
  assert.doesNotMatch(regression, /Still failing → delete test/);
  assert.match(regression, /does not create another test/);
  assert.match(regression, /original failing probe and adjacent happy path/);
});

test('baseline schema covers all categories and represents missing detector coverage honestly', () => {
  const baseline = JSON.parse(read('assets/design-baseline-template.json'));
  assert.equal(baseline.schemaVersion, 2);
  assert.equal(Object.keys(baseline.categoryGrades).length, 10);
  assert.equal(baseline.detector.mode, 'none');
  assert.equal(baseline.detector.total, null);
  assert.equal(baseline.detector.targetSet, null);
  const methodology = read('references/audit-methodology.md');
  for (const reason of ['detector modes differ, no delta', 'target set changed, no delta', 'no detector baseline (first scan)', 'engine changed']) assert.ok(methodology.includes(reason), reason);
  assert.match(methodology, /design-baseline\.<runId>\.json/);
  assert.match(methodology, /Goodwill Reservoir/);
});

test('optional detector uses rendered clones, local guarded artifacts and no installation fallback', () => {
  const detector = read('references/detector.md');
  assert.match(detector, /DOM mode never scans source/);
  assert.match(detector, /10 MiB/);
  assert.match(detector, /owner-only/);
  assert.match(detector, /--keep-dom/);
  assert.match(detector, /cross-origin CSS not resolved/);
  assert.match(detector, /one finding per rule/);
  assert.match(detector, /Do not install/);
  const dump = read('scripts/design-dom-dump.js');
  assert.equal(typeof new Script(`(${dump})`).runInNewContext({}, { timeout: 1000 }), 'function');
  assert.match(dump, /cloneNode\(true\)/);
  assert.match(dump, /cssRules/);
  assert.match(dump, /shadow DOM/);
  assert.doesNotMatch(dump, /\b(fetch|XMLHttpRequest|localStorage|sessionStorage)\b/);
});

test('actual returned mockup paths and non-self outside providers retain explicit result gates', () => {
  const skill = read('SKILL.md');
  assert.match(skill, /outputPath/);
  assert.match(skill, /new console errors.*baseline/i);
  const voices = read('references/outside-voices.md');
  assert.match(voices, /Codex host → Claude Code/);
  assert.match(voices, /Claude Code host → Codex/);
  assert.match(voices, /image-tools\.md/);
  assert.match(voices, /missing outside coverage/i);
  assert.match(voices, /Recommendation:/);
  assert.doesNotMatch(voices, /skip this entire outside-voices step/);
});
