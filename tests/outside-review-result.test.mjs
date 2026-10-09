import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { classifyOutsideReview } from '../scripts/lib/outside-review-result.mjs';
import { parseArgs } from '../scripts/outside-review-result.mjs';

const CLI = fileURLToPath(new URL('../scripts/outside-review-result.mjs', import.meta.url));
const CLEAN = 'NO_FINDINGS\nRecommendation: keep the documentation because its examples match the supplied source.';
const HIGH = 'Severity: High\nThe example drops the required argument.\nRecommendation: correct the example because it fails the public contract.';
const classify = (options = {}) => classifyOutsideReview({ text: CLEAN, gate: 'review', exit: 0, ...options });
const event = (status, exitCode, output = '') => JSON.stringify({ type: 'item.completed', item: {
  type: 'command_execution', status, exit_code: exitCode, aggregated_output: output,
} });

for (const [name, options, verdict, reason] of [
  ['completed clean', {}, 'clean'],
  ['completed critical/high findings', { text: HIGH }, 'findings'],
  ['completed medium advisory', { text: HIGH.replace('High', 'Medium') }, 'clean'],
  ['empty response', { text: '' }, 'unavailable', 'empty_response'],
  ['refusal', { text: `I cannot review this repository.\n${CLEAN}` }, 'unavailable', 'review_refused'],
  ['transport failure despite markers', { exit: 1 }, 'unavailable', 'execution_failed'],
  ['timeout', { exit: 124 }, 'unavailable', 'timeout'],
  ['sandbox unavailable', { stderr: 'bwrap: creating new namespace failed' }, 'unavailable', 'sandbox_unavailable'],
  ['all commands failed', { events: event('failed', 1, 'Cannot run the probe') }, 'unavailable', 'commands_failed'],
  ['positive command evidence', { events: `${event('failed', 1)}\n${event('completed', 0)}` }, 'clean'],
  ['missing recommendation', { text: 'NO_FINDINGS' }, 'unavailable', 'missing_markers'],
  ['untagged prose', { text: 'Recommendation: inspect again because the wording may drift.' }, 'unverified', 'untagged_review'],
  ['quota', { exit: 1, stderr: 'ERROR: exceeded your current quota' }, 'unavailable', 'quota_exhausted'],
  ['rate limit', { exit: 1, stderr: 'stream error: HTTP 429 too many requests' }, 'unavailable', 'rate_limited'],
  ['quoted sandbox discussion', { text: `The docs explain bwrap and user namespaces.\n${CLEAN}` }, 'clean'],
  ['benign stderr warning', { stderr: 'could not find bubblewrap on PATH' }, 'clean'],
]) {
  test(`outside completion: ${name}`, () => {
    const result = classify(options);
    assert.equal(result.verdict, verdict);
    assert.equal(result.reason, reason);
    assert.equal(result.execution.state, verdict === 'unavailable' && reason !== 'missing_markers' ? 'unavailable' : 'ran');
  });
}

test('severity is a label, not a descriptive word, and advisory findings remain recorded', () => {
  assert.equal(classify({ text: `No critical findings; this is a high-level description.\n${CLEAN}` }).findings.highest, null);
  assert.equal(classify({ text: HIGH.replace('High', 'Medium') }).findings.highest, 'P2');
  assert.equal(classify({ text: `[P1] Public argument mismatch.\n${CLEAN}` }).findings.highest, 'P1');
});

test('line-ending severity labels preserve blocking, advisory and proposal semantics', () => {
  for (const [text, highest, verdict] of [
    ['1. The guard trusts the payload without a flush check — High.', 'P1', 'findings'],
    ['2. The docs lag the new flag – Medium.', 'P2', 'clean'],
    ['- The retry loop never stops (high)', 'P1', 'findings'],
    ['The required boundary check is absent - Critical;', 'P0', 'findings'],
    ['A spelling correction remains — **Low**.', 'P3', 'clean'],
    ['The argument is dropped (severity: high).', 'P1', 'findings'],
  ]) {
    const response = `${text}\nRecommendation: revise the finding because the supplied source supports it.`;
    for (const gate of ['review', 'structured']) {
      const result = classify({ text: response, gate });
      assert.equal(result.findings.highest, highest);
      assert.equal(result.verdict, verdict);
    }
    const proposal = classify({ text: response, gate: 'proposal' });
    assert.equal(proposal.findings.highest, null);
    assert.equal(proposal.verdict, 'clean');
  }
  for (const text of ['A high-level plan.', 'Highly consistent.', 'This is low-risk.',
    'A medium-term follow-up.', 'There are no critical findings.', 'High availability: kept.',
    'The high number of retries is fine.', 'Lower the limit.', 'Latency stays low.',
    'The cost is high-ish - acceptable.', 'Keep the trade-off low.']) {
    assert.equal(classify({ text: `${text}\n${CLEAN}` }).findings.highest, null);
  }
});

test('proposal and structured gates keep their own completion markers', () => {
  assert.equal(classify({ gate: 'proposal', text: 'Recommendation: an archive-room direction because the audience browses primary records.' }).verdict, 'clean');
  assert.equal(classify({ gate: 'structured', text: 'NO_FINDINGS' }).verdict, 'clean');
  assert.equal(classify({ gate: 'structured', text: 'Severity: Critical\nWrong required field.' }).verdict, 'findings');
  assert.equal(classify({ gate: 'proposal', text: 'A polished design.' }).verdict, 'unavailable');
});

test('classifier validates external evidence types and never mutates input', () => {
  const input = Object.freeze({ text: HIGH, gate: 'review', exit: 0, events: event('completed', 0) });
  const result = classifyOutsideReview(input);
  assert.equal(result.verdict, 'findings');
  assert.deepEqual(input, { text: HIGH, gate: 'review', exit: 0, events: event('completed', 0) });
  for (const options of [{ exit: null }, { exit: -1 }, { exit: 1.2 }, { stderr: {} }, { events: [] }, { gate: 'unknown' }, { text: null }]) {
    assert.throws(() => classify(options), TypeError);
  }
});

test('CLI argument validation rejects duplicate/missing flags and malformed exit statuses', () => {
  assert.equal(parseArgs(['review', 'result.txt', '--verdict', '--exit', '0']).verdictMode, true);
  for (const args of [[], ['review', 'result.txt', '--exit'], ['review', 'result.txt', '--exit', ''],
    ['review', 'result.txt', '--exit', 'NaN'], ['review', 'result.txt', '--exit', '256'],
    ['review', 'result.txt', '--exit', '0', '--exit', '1'], ['review', 'result.txt', '--unknown']]) {
    assert.throws(() => parseArgs(args), TypeError);
  }
});

test('CLI uses actual evidence and never silently ignores an unreadable supplied stderr file', () => {
  const directory = mkdtempSync(join(tmpdir(), 'matt-plus-outside-result-'));
  try {
    const response = join(directory, 'response.txt');
    const stderr = join(directory, 'stderr.txt');
    writeFileSync(response, HIGH);
    writeFileSync(stderr, '');
    const completed = spawnSync(process.execPath, [CLI, '--verdict', '--exit', '0', '--stderr', stderr, 'review', response], { encoding: 'utf8' });
    assert.equal(completed.status, 3);
    assert.match(completed.stdout, /VERDICT: findings\nFINDINGS: P1/);
    const unreadable = spawnSync(process.execPath, [CLI, '--verdict', '--exit', '0', '--stderr', join(directory, 'missing'), 'review', response], { encoding: 'utf8' });
    assert.equal(unreadable.status, 1);
    assert.match(unreadable.stdout, /REASON: evidence_unreadable/);
    const secretMarker = 'synthetic-private-diagnostic-not-for-stdout';
    writeFileSync(stderr, secretMarker);
    const failed = spawnSync(process.execPath, [CLI, '--verdict', '--exit', '1', '--stderr', stderr, 'review', response], { encoding: 'utf8' });
    assert.equal(failed.status, 1);
    assert.equal(`${failed.stdout}${failed.stderr}`.includes(secretMarker), false);
    assert.match(failed.stdout, /REASON: execution_failed/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
