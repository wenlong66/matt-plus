import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import test from 'node:test';

const readResource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const board = readResource('skills/design-consultation/assets/comparison-board.html');
const boardScript = board.match(/<script>([\s\S]*?)<\/script>/)?.[1];

// This bounded DOM stub checks the bundled script's feedback contract, not browser rendering.
function createBoard(initialValues = {}) {
  let values = { 'regenerateAction': 'different', ...initialValues };
  let downloads = [];
  let onSubmit;
  let onRegenerate;
  let pendingFeedback;
  const controls = Array.from({ length: 4 }, () => ({ disabled: false }));
  const status = { textContent: '' };
  const form = {
    addEventListener: (type, handler) => { if (type === 'submit') onSubmit = handler; },
    reportValidity: () => !/<input\b[^>]*name="preferred"[^>]*\brequired\b/.test(board) || Boolean(values.preferred),
    querySelectorAll: () => controls,
  };
  const regenerate = {
    addEventListener: (type, handler) => { if (type === 'click') onRegenerate = handler; },
  };
  const document = {
    getElementById: (id) => ({ 'feedback-form': form, 'request-round': regenerate, status })[id],
    createElement: () => ({
      href: '',
      download: '',
      click() { downloads = [...downloads, { filename: this.download, feedback: pendingFeedback }]; },
    }),
  };
  class FormData {
    constructor() { this.values = Object.freeze({ ...values }); }
    get(key) { return this.values[key] ?? null; }
  }
  class Blob {
    constructor(parts) { this.text = parts.join(''); }
  }
  const URL = {
    createObjectURL: (blob) => { pendingFeedback = JSON.parse(blob.text); return 'blob:synthetic-fixture'; },
    revokeObjectURL: () => {},
  };
  assert.ok(boardScript, 'comparison board script is missing');
  new Script(boardScript).runInNewContext({ document, FormData, Blob, URL, setTimeout: () => {} }, { timeout: 1000 });
  return {
    submit: () => onSubmit({ preventDefault() {} }),
    regenerate: () => onRegenerate(),
    setValues: (next) => { values = { ...values, ...next }; },
    downloads: () => downloads,
    isLocked: () => controls.every(control => control.disabled),
  };
}

test('text-only final feedback retains nullable preferred', () => {
  const page = createBoard({ overall: 'Keep the layout and quieter colors.', 'comment-A': 'Readable spacing' });
  page.submit();
  const [{ filename, feedback }] = page.downloads();
  assert.equal(filename, 'feedback.json');
  assert.equal(feedback.preferred, null);
  assert.equal(feedback.regenerated, false);
  assert.equal(feedback.overall, 'Keep the layout and quieter colors.');
  assert.equal(feedback.comments.A, 'Readable spacing');
});

test('final submission locks both actions for the current round', () => {
  const page = createBoard({ preferred: 'A', 'rating-A': '4' });
  page.submit();
  page.submit();
  page.regenerate();
  assert.equal(page.downloads().length, 1);
  assert.equal(page.downloads()[0].feedback.ratings.A, 4);
  assert.equal(page.isLocked(), true);
});

for (const action of ['different', 'match']) {
  test(`${action} regeneration preserves the original pending protocol and round lock`, () => {
    const page = createBoard({ regenerateAction: action });
    page.regenerate();
    page.regenerate();
    page.submit();
    assert.equal(page.downloads().length, 1);
    assert.equal(page.downloads()[0].filename, 'feedback-pending.json');
    assert.equal(page.downloads()[0].feedback.regenerated, true);
    assert.equal(page.downloads()[0].feedback.regenerateAction, action);
    assert.equal(page.isLocked(), true);
  });
}

test('more-like requires a variant without locking an invalid request', () => {
  const page = createBoard({ regenerateAction: 'more_like_selected' });
  page.regenerate();
  assert.equal(page.downloads().length, 0);
  assert.equal(page.isLocked(), false);
  page.setValues({ preferred: 'B' });
  page.regenerate();
  assert.equal(page.downloads()[0].feedback.regenerateAction, 'more_like_B');
  assert.equal(page.downloads()[0].feedback.regenerated, true);
});

test('custom regeneration keeps the actual text and remains recoverable after empty input', () => {
  assert.match(board, /<option value="custom">/);
  assert.match(board, /<textarea name="customAction"/);
  const page = createBoard({ regenerateAction: 'custom', customAction: '  \n ' });
  page.regenerate();
  assert.equal(page.downloads().length, 0);
  assert.equal(page.isLocked(), false);
  page.setValues({ customAction: '  Keep the composition; reduce decoration.  ' });
  page.regenerate();
  assert.equal(page.downloads()[0].feedback.regenerateAction, 'Keep the composition; reduce decoration.');
  assert.equal(page.downloads()[0].feedback.regenerated, true);
});

test('remix serializes its selected source variants without mutating input', () => {
  const input = Object.freeze({ regenerateAction: 'remix', 'remix-layout': 'A', 'remix-colors': 'B', 'remix-typography': 'C' });
  const page = createBoard(input);
  page.regenerate();
  assert.deepEqual(page.downloads()[0].feedback.remixSpec, { layout: 'A', colors: 'B', typography: 'C' });
  assert.equal(page.downloads()[0].feedback.regenerated, true);
  assert.deepEqual(input, { regenerateAction: 'remix', 'remix-layout': 'A', 'remix-colors': 'B', 'remix-typography': 'C' });
});

test('each variant retains a local full-size image link and proportional preview', () => {
  for (const variant of ['A', 'B', 'C']) {
    assert.ok(board.includes(`class="full-size" href="variant-${variant}.png" target="_blank" rel="noopener"`));
  }
  assert.match(board, /img\s*\{[^}]*height:\s*auto/);
});

test('the preview hero uses the example product name', () => {
  const preview = readResource('skills/design-consultation/assets/design-preview.html');
  assert.match(preview, /<h1 id="preview-title">Fieldwork<\/h1>/);
});
