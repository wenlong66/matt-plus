import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { MAX_INPUT_BYTES, scanText } from '../skills/security-audit/scripts/masked-secret-scan.mjs';

const scannerPath = fileURLToPath(new URL('../skills/security-audit/scripts/masked-secret-scan.mjs', import.meta.url));
const createOpenAiLikeValue = () => `sk-${'a'.repeat(24)}`;
const createGithubLikeValue = () => `ghp_${'z'.repeat(36)}`;

function runScanner(argumentsList, input) {
  return spawnSync(process.execPath, [scannerPath, ...argumentsList], {
    encoding: 'utf8',
    input,
  });
}

test('scanText masks candidates and sorts findings deterministically', () => {
  const openAiLikeValue = createOpenAiLikeValue();
  const githubLikeValue = createGithubLikeValue();
  const report = scanText(`token=${githubLikeValue}\nkey=${openAiLikeValue}`, 'fixture.env');
  const serialized = JSON.stringify(report);

  assert.equal(report.status, 'OK');
  assert.equal(report.findings.length, 3);
  assert.ok(report.findings.every((finding) => finding.preview.includes('•')));
  assert.ok(!serialized.includes(openAiLikeValue));
  assert.ok(!serialized.includes(githubLikeValue));
  assert.deepEqual(
    report.findings.map(({ line, rule }) => ({ line, rule })),
    [
      { line: 1, rule: 'generic-secret-assignment' },
      { line: 1, rule: 'github-token' },
      { line: 2, rule: 'openai-api-key' },
    ],
  );
});

test('scanText collapses duplicate candidates from the same rule and line', () => {
  const githubLikeValue = createGithubLikeValue();
  const report = scanText(`token=${githubLikeValue} token=${githubLikeValue}`, 'duplicate.env');

  assert.deepEqual(
    report.findings.map(({ line, rule }) => ({ line, rule })),
    [
      { line: 1, rule: 'generic-secret-assignment' },
      { line: 1, rule: 'github-token' },
    ],
  );
});

test('scanText recognizes private-key markers without emitting the marker value', () => {
  const privateKeyMarker = `-----BEGIN ${'PRIVATE'} KEY-----`;
  const report = scanText(`header\n${privateKeyMarker}\nbody`, 'key.pem');
  const serialized = JSON.stringify(report);

  assert.deepEqual(report, {
    status: 'OK',
    findings: [{ file: 'key.pem', line: 2, rule: 'private-key', preview: '----••••••••••••' }],
  });
  assert.ok(!serialized.includes(privateKeyMarker));
});

test('oversized input fails closed without findings', () => {
  const report = scanText('x'.repeat(MAX_INPUT_BYTES + 1));
  assert.deepEqual(report, { status: 'ERROR', error: 'INPUT_TOO_LARGE', findings: [] });
});

test('CLI scans stdin without exposing the raw candidate', () => {
  const openAiLikeValue = createOpenAiLikeValue();
  const result = runScanner(['--stdin'], `api_key=${openAiLikeValue}`);
  const report = JSON.parse(result.stdout);

  assert.equal(result.status, 0);
  assert.equal(report.status, 'OK');
  assert.equal(report.findings[0].file, '<stdin>');
  assert.ok(!result.stdout.includes(openAiLikeValue));
});

test('CLI accepts a file path and preserves read failures as generic errors', () => {
  const directory = mkdtempSync(join(tmpdir(), 'matt-plus-secret-scan-'));
  const file = join(directory, 'credentials with spaces.env');
  const githubLikeValue = createGithubLikeValue();
  try {
    writeFileSync(file, `secret=${githubLikeValue}`, 'utf8');
    const result = runScanner(['--file', file]);
    const report = JSON.parse(result.stdout);
    assert.equal(result.status, 0);
    assert.equal(report.findings[0].file, file);
    assert.ok(!result.stdout.includes(githubLikeValue));

    const readFailure = runScanner(['--file', join(directory, 'missing.env')]);
    assert.equal(readFailure.status, 2);
    assert.deepEqual(JSON.parse(readFailure.stdout), { status: 'ERROR', error: 'READ_FAILED', findings: [] });
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});
