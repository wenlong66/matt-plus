import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Script } from 'node:vm';
import test from 'node:test';
import { imageLink, prepareBoard, resolveApprovedImage, validateFeedback } from '../skills/design-consultation/scripts/prepare-board.mjs';

const pluginRoot = fileURLToPath(new URL('../', import.meta.url));
const skillRoot = path.join(pluginRoot, 'skills/design-consultation');
const read = file => fs.readFileSync(path.join(skillRoot, file), 'utf8');
const cli = path.join(skillRoot, 'scripts/prepare-board.mjs');
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRzUAAAAASUVORK5CYII=', 'base64');

function fixture(t, count = 3) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'consultation-local-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const images = Array.from({ length: count }, (_, index) => path.join(root, `saved ${index + 1} & original.png`));
  images.forEach(image => fs.writeFileSync(image, png));
  return { root, images };
}

function boardHarness(html, initialValues = {}) {
  let values = { regenerateAction: 'different', ...initialValues };
  let downloads = [];
  let submit;
  let regenerate;
  let pending;
  const controls = [{ disabled: false }, { disabled: false }];
  const status = { textContent: '' };
  const configText = html.match(/<script type="application\/json" id="board-config">([\s\S]*?)<\/script>/)?.[1];
  const form = { addEventListener: (_, handler) => { submit = handler; }, reportValidity: () => true, querySelectorAll: () => controls };
  const request = { addEventListener: (_, handler) => { regenerate = handler; } };
  const document = {
    getElementById: id => ({ 'feedback-form': form, 'request-round': request, status, 'board-config': configText ? { textContent: configText } : undefined })[id],
    createElement: () => ({ click() { downloads = [...downloads, { filename: this.download, feedback: pending }]; } }),
  };
  class FormData { get(key) { return values[key] ?? null; } }
  class Blob { constructor(parts) { this.text = parts.join(''); } }
  const URL = { createObjectURL: blob => { pending = JSON.parse(blob.text); return 'blob:local-test'; }, revokeObjectURL() {} };
  const code = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(code);
  new Script(code).runInNewContext({ document, FormData, Blob, URL, setTimeout() {} }, { timeout: 1000 });
  return {
    submit: () => submit({ preventDefault() {} }),
    regenerate: () => regenerate(),
    values: next => { values = { ...values, ...next }; },
    downloads: () => downloads,
    locked: () => controls.every(control => control.disabled),
  };
}

const finalFeedback = (round, overrides = {}) => ({
  boardRound: round.round, preferred: 'A', ratings: { A: 4 }, comments: { A: '' }, overall: null, regenerated: false, ...overrides,
});

for (const count of [1, 2, 3]) {
  test(`board includes only ${count} actual saved images and preserves ordered upstream manifest shape`, t => {
    const { root, images } = fixture(t, count);
    const input = Object.freeze({ round: 'round-1', images: Object.freeze([...images]) });
    const result = prepareBoard(input, root);
    const manifest = JSON.parse(fs.readFileSync(result.manifestPath, 'utf8'));
    const html = fs.readFileSync(result.boardPath, 'utf8');
    assert.ok(Array.isArray(manifest));
    assert.equal(manifest.length, count);
    assert.deepEqual(manifest.map(image => path.resolve(path.dirname(result.manifestPath), image)), images);
    assert.equal((html.match(/<section class="variant"/g) ?? []).length, count);
    assert.equal((html.match(/class="full-size"/g) ?? []).length, count);
    for (const letter of ['A', 'B', 'C'].slice(count)) {
      assert.ok(!html.includes(`value="${letter}"`));
      assert.ok(!html.includes(`name="rating-${letter}"`));
    }
    assert.match(html, /height:\s*auto/);
    assert.match(html, /saved%20[1-3]%20%26%20original\.png/);
    assert.ok(!html.includes('src="variant-A.png"'));
    assert.deepEqual(input.images, images);
    const page = boardHarness(html, { preferred: 'A', 'rating-A': '5' });
    page.submit();
    const feedback = page.downloads()[0].feedback;
    assert.equal(feedback.boardRound, result.round);
    assert.equal(Object.keys(feedback.ratings).length, count);
    assert.equal(validateFeedback(feedback, result), feedback);
    assert.equal(page.locked(), true);
  });
}

test('image links retain escaped real absolute/cross-volume paths instead of fake relative URLs', t => {
  const { images } = fixture(t, 1);
  assert.equal(imageLink(images[0]), pathToFileURL(images[0]).href);
  assert.match(imageLink(images[0]), /^file:\/\//);
  assert.equal(imageLink(path.join('..', 'image & choice.png')), '../image%20%26%20choice.png');
  if (process.platform === 'win32') {
    assert.equal(imageLink('D:\\saved images\\real output.png'), 'file:///D:/saved%20images/real%20output.png');
  }
});

test('round collisions bump output directories and preserve old boards, feedback and source images', t => {
  const { root, images } = fixture(t, 2);
  const first = prepareBoard({ round: 'same', images }, root);
  const oldHtml = fs.readFileSync(first.boardPath, 'utf8');
  const oldFeedback = path.join(path.dirname(first.boardPath), 'feedback.json');
  fs.writeFileSync(oldFeedback, JSON.stringify(finalFeedback(first)));
  const second = prepareBoard({ round: 'same', images: [...images].reverse() }, root);
  assert.notEqual(first.round, second.round);
  assert.notEqual(first.boardPath, second.boardPath);
  assert.equal(fs.readFileSync(first.boardPath, 'utf8'), oldHtml);
  assert.equal(fs.readFileSync(oldFeedback, 'utf8'), JSON.stringify(finalFeedback(first)));
  images.forEach(image => assert.deepEqual(fs.readFileSync(image), png));
  assert.throws(() => validateFeedback(finalFeedback(first), second), /stale/);
});

test('zero images, missing files, duplicate paths and invalid IDs create no board', t => {
  const { root, images } = fixture(t, 1);
  const before = fs.readdirSync(root);
  for (const input of [
    { round: 'zero', images: [] },
    { round: 'missing', images: [path.join(root, 'absent.png')] },
    { round: 'duplicate', images: [images[0], images[0]] },
    { round: '../escape', images },
    { round: 'relative', images: ['relative.png'] },
    { round: 'directory', images: [root] },
    { round: 'not-array', images: { A: images[0] } },
  ]) assert.throws(() => prepareBoard(input, root));
  assert.deepEqual(fs.readdirSync(root), before);
});

test('CLI prints real successful board paths and rejects failures without writing a board', t => {
  const { root, images } = fixture(t, 2);
  const input = path.join(root, 'input.json');
  fs.writeFileSync(input, JSON.stringify({ round: 'cli', images }));
  const successful = spawnSync(process.execPath, [cli, input, root], { encoding: 'utf8' });
  assert.equal(successful.status, 0, successful.stderr);
  const result = JSON.parse(successful.stdout);
  assert.ok(fs.existsSync(result.boardPath));
  assert.ok(fs.existsSync(result.manifestPath));
  fs.writeFileSync(input, JSON.stringify({ round: 'empty', images: [] }));
  const failure = spawnSync(process.execPath, [cli, input, root], { encoding: 'utf8' });
  assert.equal(failure.status, 1);
  assert.match(failure.stderr, /Board unavailable/);
  assert.equal(failure.stdout, '');
  assert.ok(!fs.existsSync(path.join(root, 'board-empty')));
});

test('board CLI does not echo malformed JSON, invalid values or failed private paths', t => {
  const { root } = fixture(t, 1);
  const marker = 'synthetic-private-input-not-for-diagnostics';
  const input = path.join(root, 'input.json');
  for (const bytes of [`{\"${marker}\": broken}`, JSON.stringify({ round: 'invalid', images: [marker] })]) {
    fs.writeFileSync(input, bytes);
    const result = spawnSync(process.execPath, [cli, input, root], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.ok(!`${result.stdout}${result.stderr}`.includes(marker));
  }
  const missing = spawnSync(process.execPath, [cli, path.join(root, marker), root], { encoding: 'utf8' });
  assert.equal(missing.status, 1);
  assert.ok(!`${missing.stdout}${missing.stderr}`.includes(marker));
});

test('actual-count board retains custom/remix text, pending state, recovery and round lock', t => {
  const { root, images } = fixture(t, 2);
  const round = prepareBoard({ round: 'feedback', images }, root);
  const html = fs.readFileSync(round.boardPath, 'utf8');
  const page = boardHarness(html, { regenerateAction: 'custom', customAction: ' ' });
  page.regenerate();
  assert.equal(page.downloads().length, 0);
  assert.equal(page.locked(), false);
  page.values({ customAction: 'Keep A; quieter hierarchy.' });
  page.regenerate();
  const [{ filename, feedback }] = page.downloads();
  assert.equal(filename, 'feedback-pending.json');
  assert.equal(feedback.regenerateAction, 'Keep A; quieter hierarchy.');
  assert.equal(feedback.regenerated, true);
  assert.equal(feedback.preferred, null);
  assert.equal(validateFeedback(feedback, round), feedback);
  page.submit();
  page.regenerate();
  assert.equal(page.downloads().length, 1);
  const remix = boardHarness(html, { regenerateAction: 'remix', 'remix-layout': 'A', 'remix-colors': 'B', 'remix-typography': 'A' });
  remix.regenerate();
  assert.deepEqual(remix.downloads()[0].feedback.remixSpec, { layout: 'A', colors: 'B', typography: 'A' });
  assert.equal(validateFeedback(remix.downloads()[0].feedback, round), remix.downloads()[0].feedback);
});

test('feedback is bound to current round and validates every referenced source and rating', t => {
  const { root, images } = fixture(t, 2);
  const round = prepareBoard({ round: 'validate', images }, root);
  for (const feedback of [
    finalFeedback(round, { boardRound: undefined }),
    finalFeedback(round, { boardRound: 'old-round' }),
    finalFeedback(round, { preferred: 'C' }),
    finalFeedback(round, { ratings: { C: 4 } }),
    finalFeedback(round, { ratings: { A: 6 } }),
    finalFeedback(round, { ratings: { A: 2.5 } }),
    finalFeedback(round, { comments: { A: 42 } }),
    finalFeedback(round, { regenerated: 'true' }),
    finalFeedback(round, { regenerated: true, regenerateAction: 'more_like_C' }),
    finalFeedback(round, { regenerated: true, regenerateAction: 'remix', remixSpec: { colors: 'C' } }),
    finalFeedback(round, { regenerated: true, regenerateAction: 'remix', remixSpec: {} }),
  ]) assert.throws(() => validateFeedback(feedback, round));
  const revision = Object.freeze(finalFeedback(round, { overall: 'Go with A, but increase CTA size.' }));
  assert.equal(validateFeedback(revision, round), revision, 'validation does not reinterpret revision notes as approval');
});

test('approved path binds to this manifest, and a missing image never substitutes another one', t => {
  const { root, images } = fixture(t, 2);
  const round = prepareBoard({ round: 'approval', images }, root);
  const directory = path.dirname(round.manifestPath);
  const record = Object.freeze({ approved_variant: 'B', approved_path: round.images[1] });
  assert.equal(resolveApprovedImage(record, directory, round.images), images[1]);
  assert.throws(() => resolveApprovedImage({ ...record, approved_path: round.images[0] }, directory, round.images), /does not match/);
  assert.throws(() => resolveApprovedImage({ approved_variant: 'B' }, directory, round.images), /reselect/);
  fs.unlinkSync(images[1]);
  assert.throws(() => resolveApprovedImage(record, directory, round.images), /missing.*reselect/);
  assert.ok(fs.existsSync(images[0]));
});

test('Phase 0 routes cancellation before product/tool probes and records format until Q-final', () => {
  const skill = read('SKILL.md');
  assert.ok(skill.indexOf('**Cancel:** STOP') < skill.indexOf('**Gather product context'));
  assert.ok(skill.indexOf('**Cancel:** STOP') < skill.indexOf('**Find the browser tool'));
  for (const fragment of ['DESIGN.md is authoritative', 'design-system.md supplies prior context but stays untouched', 'All conversion, marker and design writes wait for Q-final', 'Update-only format gate', 'legacy', 'unknown', 'missing', 'PRODUCT.md']) assert.ok(skill.includes(fragment), fragment);
  assert.match(skill, /Q1 — one brief that confirms context AND decides research/);
  assert.match(skill, /never in Q1's call/);
  assert.match(skill, /current year/);
  assert.ok(!skill.includes('best websites 2025'));
});

test('consultation keeps discovery context and user-designated review referrals without unbundled skill calls', () => {
  const skill = read('SKILL.md');
  const mapping = read('references/tool-mapping.md');
  for (const file of ['SKILL.md', 'references/tool-mapping.md', 'references/proposal-and-coherence.md', 'references/outside-voices.md', 'references/preview-and-feedback.md', 'references/write-design-md.md']) {
    assert.doesNotMatch(read(file), /(?:^|[\s`])\/(?:office-hours|plan-design-review|design-review)(?=[\s`.,;!?]|$)/m, file);
  }
  assert.match(skill, /For existing sites, use the user's chosen visual-review capability to infer/);
  assert.match(skill, /For existing plans, use their chosen design-plan review capability/);
  assert.match(skill, /instead of a new-product design consultation/);
  assert.match(skill, /## Phase 0: Pre-checks\r?\n\r?\n\*\*Check for existing DESIGN.md:\*\*/);
  for (const fragment of ['prior product-discovery material', 'user-provided product-discovery artifact path', 'preserve prior product decisions', 'confirm or clarify missing facts within Q1']) assert.ok(skill.includes(fragment), fragment);
  for (const path of ['.context/*office-hours*', '.context/attachments/*office-hours*']) assert.ok(!skill.includes(path), `Legacy discovery path remains: ${path}`);
  assert.match(mapping, /No separate product-discovery skill is required or implied/);
});

test('proposal retains all ten fixed-source aesthetic examples and full font/risk/independence method', () => {
  const proposal = read('references/proposal-and-coherence.md');
  for (const direction of ['Brutally Minimal', 'Maximalist Chaos', 'Retro-Futuristic', 'Luxury/Refined', 'Playful/Toy-like', 'Editorial/Magazine', 'Brutalist/Raw', 'Art Deco', 'Organic/Natural', 'Industrial/Utilitarian']) assert.match(proposal, new RegExp(`^- ${direction.replace('/', '\\/')} —`, 'm'));
  for (const fragment of ['cream/serif/terracotta', 'near-black/neon/glowing edges', 'broadsheet hairlines/italic serif/tiny tracked mono', 'three faces per display/body/label/mono role', 'Persuade', 'Operate', 'Read', 'Experience', 'required weights, license and loading URL', 'pending verification', 'Restrained', 'Committed', 'Full palette', 'Drenched', 'SAFE CHOICES', 'RISKS', 'what you gain, what it costs', 'at least 2 risks', 'all old proposals stale', 'Light vs dark is not one of the dials']) assert.ok(proposal.includes(fragment), fragment);
  const outside = read('references/outside-voices.md');
  for (const fragment of ['complete your own Phase 3 direction', 'complete identical contents', 'Do not disclose the primary draft', '--verdict --exit', 'both', 'Native-only success', 'modelUsage', 'Recommendation: <direction> because']) assert.ok(outside.includes(fragment), fragment);
});

test('preview accounting, scratch isolation and Q-final approval constraints remain explicit', () => {
  const preview = read('references/preview-and-feedback.md');
  for (const fragment of ['requested / saved / failures / recovery', 'only successful images', 'Zero saved', 'JSON, not just exit status', 'not verified', 'board-images.json', 'ordered path array', 'old Submit cannot approve new images', 'Submit with revision notes is a revision', 'Variants cannot iterate', 'sessionFile', 'outputPath', 'fresh non-repository scratch directory', 'reselect from the current board', 'fallback to Phase 3 values']) assert.ok(preview.includes(fragment), fragment);
  const final = read('references/write-design-md.md');
  for (const fragment of ['complete intended DESIGN.md content', 'every token', 'exact instruction-file path', 'independent', 'Any token, font, direction or product-brief change invalidates approval', 'colors, typography, rounded, spacing, components', 'Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do\'s and Don\'ts', 'Motion', 'Decisions Log', 'legacy-keep']) assert.ok(final.includes(fragment), fragment);
  assert.match(final, /\.\.\/\.\.\/\.\.\/assets\/design-system-spec-template\.md/);
  assert.match(read('assets/design-system-template.md'), /^# Design System/);
  assert.ok(!read('assets/design-system-template.md').includes('design-md-format=spec'));
});

test('all consultation package-local Markdown links resolve, and adapters add no external execution', () => {
  for (const file of ['SKILL.md', 'references/tool-mapping.md', 'references/proposal-and-coherence.md', 'references/outside-voices.md', 'references/preview-and-feedback.md', 'references/write-design-md.md']) {
    const text = read(file);
    for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (/^(https?:|#)/.test(target)) continue;
      assert.ok(fs.existsSync(path.resolve(skillRoot, path.dirname(file), target.split('#')[0])), `${file} → ${target}`);
    }
  }
  const helper = read('scripts/prepare-board.mjs');
  assert.ok(!/\b(fetch|spawn|exec|http|https|listen)\s*\(/.test(helper));
  assert.match(helper, /flag: 'wx'/);
});
