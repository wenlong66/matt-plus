#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const MAX_INPUT_BYTES = 5 * 1024 * 1024;

const RULES = [
  { id: 'openai-api-key', pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/g },
  { id: 'github-token', pattern: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g },
  { id: 'aws-access-key', pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g },
  { id: 'private-key', pattern: /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/g },
  { id: 'generic-secret-assignment', pattern: /\b(?:api[_-]?key|secret|password|token)\s*[:=]\s*["']?([A-Za-z0-9_\-/.+=]{16,})/gi, valueGroup: 1 },
];

function maskedPreview(value) {
  const visible = Math.min(4, value.length);
  return `${value.slice(0, visible)}${'•'.repeat(Math.max(4, Math.min(value.length - visible, 12)))}`;
}

function lineAt(text, index) {
  let line = 1;
  for (let offset = 0; offset < index; offset += 1) {
    if (text.charCodeAt(offset) === 10) line += 1;
  }
  return line;
}

export function scanText(text, label = '<stdin>') {
  if (Buffer.byteLength(text, 'utf8') > MAX_INPUT_BYTES) {
    return { status: 'ERROR', error: 'INPUT_TOO_LARGE', findings: [] };
  }

  const findings = [];
  for (const rule of RULES) {
    rule.pattern.lastIndex = 0;
    for (const match of text.matchAll(rule.pattern)) {
      const value = rule.valueGroup ? match[rule.valueGroup] : match[0];
      findings.push({
        file: label,
        line: lineAt(text, match.index ?? 0),
        rule: rule.id,
        preview: maskedPreview(value),
      });
    }
  }

  const unique = new Map();
  for (const finding of findings) {
    const key = `${finding.file}\u0000${finding.line}\u0000${finding.rule}\u0000${finding.preview}`;
    unique.set(key, finding);
  }

  return {
    status: 'OK',
    findings: [...unique.values()].sort((left, right) =>
      left.file.localeCompare(right.file) || left.line - right.line || left.rule.localeCompare(right.rule) || left.preview.localeCompare(right.preview),
    ),
  };
}

function readInput(argumentsList) {
  const fileIndex = argumentsList.indexOf('--file');
  if (fileIndex >= 0) {
    const path = argumentsList[fileIndex + 1];
    if (!path || argumentsList.length !== 2) throw new Error('USAGE');
    return { label: path, text: readFileSync(path, 'utf8') };
  }
  if (argumentsList.length === 0 || argumentsList[0] === '--stdin') {
    return { label: '<stdin>', text: readFileSync(0, 'utf8') };
  }
  throw new Error('USAGE');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const input = readInput(process.argv.slice(2));
    const report = scanText(input.text, input.label);
    process.stdout.write(`${JSON.stringify(report)}\n`);
    process.exitCode = report.status === 'OK' ? 0 : 2;
  } catch (error) {
    const code = error instanceof Error && error.message === 'USAGE' ? 'USAGE' : 'READ_FAILED';
    process.stdout.write(`${JSON.stringify({ status: 'ERROR', error: code, findings: [] })}\n`);
    process.exitCode = 2;
  }
}
