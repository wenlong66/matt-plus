#!/usr/bin/env node
// Node port of pinned gstack-docs-candidate (92cfd07a): local snapshot/compare only.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';

const MAX_GIT_BYTES = 256 * 1024 * 1024;
const USAGE = `usage: docs-candidate.mjs snapshot --out <candidate.json> --audit-id <id> --mode edit|read-only --base <rev> [--select <path>]... [--docs <path>]...
       docs-candidate.mjs compare <candidate.json>`;
const nul = text => text.split('\0').filter(Boolean);
const unique = values => [...new Set(values)].sort();
const sameList = (a, b) => a.length === b.length && a.every((value, i) => value === b[i]);

function git(args) {
  const result = spawnSync('git', args, { encoding: 'utf8',
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_NO_LAZY_FETCH: '1', GIT_TERMINAL_PROMPT: '0' }, maxBuffer: MAX_GIT_BYTES });
  if (result.error || result.status !== 0) throw new Error('local git command failed');
  return result.stdout;
}

function state(base) {
  const head = git(['rev-parse', 'HEAD']).trim();
  return {
    head,
    branch: git(['branch', '--show-current']).trim(),
    index: nul(git(['ls-files', '-s', '-z'])),
    committed: nul(git(['diff', '--name-only', '-z', base, head])),
    staged: nul(git(['diff', '--cached', '--name-only', '-z'])),
    unstaged: nul(git(['diff', '--name-only', '-z'])),
    untracked: nul(git(['ls-files', '-z', '--others', '--exclude-standard'])),
  };
}

function relativeFile(value) {
  if (typeof value !== 'string' || !value || value.includes('\0') || value.includes('\\') ||
      path.posix.isAbsolute(value) || path.win32.isAbsolute(value) ||
      value.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new Error('paths must be repository-relative files without traversal');
  }
  return value;
}

const inside = (root, target) => target === root || target.startsWith(root + path.sep);

function resolvedTarget(target) {
  try {
    fs.lstatSync(target);
    return fs.realpathSync(target);
  } catch (error) {
    if (!['ENOENT', 'ENOTDIR'].includes(error.code)) throw error;
    // A dangling link is not a missing authored file; its boundary is unknown.
    try {
      if (fs.lstatSync(target).isSymbolicLink()) throw new Error('cannot resolve symlink boundary');
    } catch (entryError) {
      if (!['ENOENT', 'ENOTDIR'].includes(entryError.code)) throw entryError;
    }
    const parent = path.dirname(target);
    if (parent === target) throw new Error('cannot resolve filesystem boundary');
    return path.join(resolvedTarget(parent), path.basename(target));
  }
}

function expand(values) {
  const listed = nul(git(['ls-files', '-z', '--cached', '--others', '--exclude-standard']));
  return unique(values.flatMap(value => {
    const rel = relativeFile(value.replace(/^\.\//, '').replace(/\/+$/, ''));
    const under = listed.filter(file => file === rel || file.startsWith(rel + '/'));
    return under.length ? under : [rel];
  }));
}

function hashes(root, values) {
  return Object.fromEntries(values.map(value => {
    const rel = relativeFile(value);
    const target = path.resolve(root, rel);
    if (!inside(root, resolvedTarget(target))) throw new Error('symlink leaves repository');
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) return [rel, null];
    const content = fs.readFileSync(target);
    const hash = createHash('sha1').update(`blob ${content.length}\0`).update(content).digest('hex');
    return [rel, hash];
  }));
}

function flags(args) {
  const known = new Set(['--out', '--audit-id', '--mode', '--base', '--select', '--docs']);
  return args.reduce((record, value, i) => {
    if (i % 2) return record;
    if (!known.has(value) || args[i + 1] === undefined || args[i + 1].startsWith('--')) {
      throw new Error('unknown or incomplete snapshot option');
    }
    return { ...record, [value]: [...(record[value] ?? []), args[i + 1]] };
  }, {});
}

function one(options, name) {
  if (options[name]?.length !== 1 || !options[name][0]) throw new Error(`${name} is required exactly once`);
  return options[name][0];
}

function snapshot(args, root) {
  const options = flags(args);
  const out = path.resolve(one(options, '--out'));
  if (inside(root, resolvedTarget(out))) throw new Error('--out must be outside the repository');
  const mode = one(options, '--mode');
  if (!['edit', 'read-only'].includes(mode)) throw new Error('--mode must be edit or read-only');
  const base = git(['rev-parse', '--verify', one(options, '--base') + '^{commit}']).trim();
  const now = state(base);
  const selected = options['--select']?.length ? expand(options['--select'])
    : unique([...now.committed, ...now.staged, ...now.unstaged, ...now.untracked]);
  const docs = expand(options['--docs'] ?? []);
  const tracked = unique([...selected, ...docs, ...now.staged, ...now.unstaged, ...now.untracked]);
  const record = { schema_version: 1, audit_id: one(options, '--audit-id'), mode, base,
    ...now, selected, docs, hashes: hashes(root, tracked) };
  fs.writeFileSync(out, JSON.stringify(record, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  console.log(`CANDIDATE: ${out}`);
  console.log(`base=${base} head=${now.head} mode=${mode}`);
  console.log(`committed=${now.committed.length} staged=${now.staged.length} unstaged=${now.unstaged.length} untracked=${now.untracked.length} selected=${selected.length} docs=${docs.length} hashed=${tracked.length}`);
}

function validate(record) {
  if (!record || record.schema_version !== 1 || typeof record.audit_id !== 'string' || !record.audit_id ||
      !['edit', 'read-only'].includes(record.mode) || typeof record.branch !== 'string' ||
      typeof record.base !== 'string' || typeof record.head !== 'string' ||
      !/^[a-f0-9]{40,64}$/.test(record.base) || !/^[a-f0-9]{40,64}$/.test(record.head) ||
      !record.hashes || typeof record.hashes !== 'object' || Array.isArray(record.hashes)) {
    throw new Error('invalid schema-1 candidate');
  }
  for (const name of ['index', 'committed', 'staged', 'unstaged', 'untracked', 'selected', 'docs']) {
    if (!Array.isArray(record[name]) || record[name].some(value => typeof value !== 'string') ||
        new Set(record[name]).size !== record[name].length) throw new Error('invalid candidate path/index list');
    if (name !== 'index') record[name].forEach(relativeFile);
  }
  for (const [file, hash] of Object.entries(record.hashes)) {
    relativeFile(file);
    if (hash !== null && (typeof hash !== 'string' || !/^[a-f0-9]{40}$/.test(hash))) {
      throw new Error('invalid candidate content hash');
    }
  }
  const required = unique([...record.selected, ...record.docs, ...record.staged, ...record.unstaged, ...record.untracked]);
  if (required.some(file => !Object.hasOwn(record.hashes, file))) throw new Error('candidate is missing content hashes');
}

function compare(args, root) {
  if (args.length !== 1) throw new Error('compare takes exactly one candidate path');
  const record = JSON.parse(fs.readFileSync(args[0], 'utf8'));
  validate(record);
  const now = state(record.base);
  const current = hashes(root, Object.keys(record.hashes));
  const dirty = value => new Set([...value.staged, ...value.unstaged, ...value.untracked]);
  const before = dirty(record);
  console.log(JSON.stringify({
    audit_id: record.audit_id,
    head_changed: now.head !== record.head,
    index_changed: !sameList(now.index, record.index),
    content_changed: Object.keys(record.hashes).filter(file => current[file] !== record.hashes[file]).sort(),
    newly_dirty: [...dirty(now)].filter(file => !before.has(file) && !Object.hasOwn(record.hashes, file)).sort(),
  }));
}

try {
  const [command, ...args] = process.argv.slice(2);
  if (['--help', '-h'].includes(command) && !args.length) console.log(USAGE);
  else {
    const root = fs.realpathSync(git(['rev-parse', '--show-toplevel']).trim());
    process.chdir(root);
    if (command === 'snapshot') snapshot(args, root);
    else if (command === 'compare') compare(args, root);
    else throw new Error(USAGE);
  }
} catch (error) {
  const reason = error instanceof SyntaxError ? 'invalid candidate JSON' : error.code ? 'local input/output failed' : error.message;
  console.error(`docs-candidate: ${reason}`);
  process.exitCode = 1;
}
