#!/usr/bin/env node
/**
 * Node.js port of gstack/bin/gstack-design-md.ts at
 * 92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4 (MIT).
 * DESIGN.md format derived from Google LLC's Apache-2.0 specification.
 * See ../THIRD_PARTY_NOTICES.md and references/design-md-format.md.
 * Modified: no Bun/runtime dependency; only ENOENT means missing; exclusive
 * backup, atomic replacement, byte-preserving marker writes, strict arguments.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  SENTINEL, parseDesignMd, detectFormat, convertLegacy, renderDesignMd,
  tokensFlat, insertMarker, FORMAT_CHOICES, DesignMdEditRefused,
} from './lib/design-md.mjs';

/** Edit a symlink's target without replacing the link itself. */
function resolveFile(arg) {
  const file = path.resolve(arg ?? 'DESIGN.md');
  try { return fs.realpathSync(file); }
  catch (error) {
    if (error.code === 'ENOENT') return file;
    throw error;
  }
}

function load(file) {
  try {
    const bytes = fs.readFileSync(file);
    const text = bytes.toString('utf8');
    return { bytes, text, doc: parseDesignMd(text) };
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

/** Temp and target share a directory/filesystem; cleanup never hides write errors. */
function atomicWrite(file, data) {
  const temporary = `${file}.tmp-${process.pid}-${randomBytes(8).toString('hex')}`;
  const mode = fs.statSync(file).mode;
  try {
    fs.writeFileSync(temporary, data, { flag: 'wx', mode });
    fs.renameSync(temporary, file);
  } catch (error) {
    try { fs.unlinkSync(temporary); }
    catch (cleanupError) {
      if (cleanupError.code !== 'ENOENT') process.stderr.write(`${SENTINEL.DESIGN_MD_INTERNAL_ERROR}: temporary cleanup failed: ${internalErrorSummary(cleanupError)}\n`);
    }
    throw error;
  }
}

/** Latin-1 is reversible for arbitrary bytes; only ASCII marker bytes change. */
function markBytes(bytes, choice) {
  const hasBom = bytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]));
  const offset = hasBom ? 3 : 0;
  const marked = Buffer.from(insertMarker(bytes.subarray(offset).toString('latin1'), choice), 'latin1');
  return Buffer.concat([bytes.subarray(0, offset), marked]);
}

function internalErrorSummary(error) {
  // Node I/O messages can embed paths, while parser messages can embed content.
  const code = typeof error?.code === 'string' && /^E[A-Z0-9_]+$/.test(error.code) ? `${error.code}: ` : '';
  return `${code}I/O or runtime operation failed; document contents omitted`;
}

function refused(reason) {
  process.stderr.write(`${SENTINEL.DESIGN_MD_CONVERT_REFUSED}: ${reason}\n`);
  return 2;
}

function usage() {
  process.stderr.write(`usage: design-md.mjs check [file] | convert [file] [--write] | tokens [file] | mark <${FORMAT_CHOICES.join('|')}> [file]\n`);
  return 2;
}

export function main(argv = process.argv.slice(2)) {
  const verb = argv[0] ?? '';
  const flags = argv.slice(1).filter(argument => argument.startsWith('--'));
  const positional = argv.slice(1).filter(argument => !argument.startsWith('--'));
  if (!['check', 'convert', 'tokens', 'mark'].includes(verb)) return usage();
  if (flags.some(flag => flag !== '--write' || verb !== 'convert') || flags.length > 1) return usage();
  if (positional.length > (verb === 'mark' ? 2 : 1)) return usage();

  switch (verb) {
    case 'check': {
      const loaded = load(resolveFile(positional[0]));
      const { format, reason } = detectFormat(loaded?.doc ?? null);
      process.stdout.write(`${SENTINEL.DESIGN_MD_FORMAT}: ${format}\n`);
      if (reason) process.stdout.write(`${SENTINEL.DESIGN_MD_REASON}: ${reason}\n`);
      process.stdout.write(`${SENTINEL.DESIGN_MD_MARKER}: ${loaded?.doc.marker ?? 'none'}\n`);
      return 0;
    }
    case 'convert': {
      const file = resolveFile(positional[0]);
      const loaded = load(file);
      const { format, code, reason } = detectFormat(loaded?.doc ?? null);
      if (code === 'ambiguous') return refused(reason);
      if (loaded?.doc.frontmatterError === 'unclosed front matter fence') return refused('unclosed front matter fence; file unchanged');
      if (format !== 'legacy' || !loaded) {
        process.stderr.write(`${SENTINEL.DESIGN_MD_FORMAT}: ${format}${reason ? ` (${reason})` : ''}; convert only accepts a legacy gstack DESIGN.md\n`);
        return 1;
      }
      let output;
      try { output = renderDesignMd(convertLegacy(loaded.doc), { emitFrontmatter: true }); }
      catch (error) {
        if (error instanceof DesignMdEditRefused) return refused(error.message.replace(/^[A-Z_]+: /, ''));
        throw error;
      }
      if (!flags.includes('--write')) {
        process.stdout.write(output);
        return 0;
      }
      const backup = `${file}.legacy.bak`;
      try { fs.copyFileSync(file, backup, fs.constants.COPYFILE_EXCL); }
      catch (error) {
        if (error.code === 'EEXIST') return refused(`backup already exists: ${backup}; file unchanged`);
        throw error;
      }
      atomicWrite(file, output);
      process.stdout.write(`${SENTINEL.DESIGN_MD_FORMAT}: spec\n${SENTINEL.DESIGN_MD_WRITTEN}: ${file}\n${SENTINEL.DESIGN_MD_BACKUP}: ${backup}\n`);
      return 0;
    }
    case 'tokens': {
      const file = resolveFile(positional[0]);
      const loaded = load(file);
      const flat = tokensFlat(loaded?.doc.frontmatter ?? null);
      process.stdout.write(JSON.stringify({ file, format: detectFormat(loaded?.doc ?? null).format, ...flat }, null, 2) + '\n');
      for (const error of flat.errors) process.stderr.write(error + '\n');
      return 0;
    }
    case 'mark': {
      const choice = positional[0];
      if (!FORMAT_CHOICES.includes(choice)) return usage();
      const file = resolveFile(positional[1]);
      const loaded = load(file);
      if (!loaded) {
        process.stdout.write(`${SENTINEL.DESIGN_MD_FORMAT}: missing\n`);
        return 1;
      }
      const { format } = detectFormat(loaded.doc);
      if ((choice === 'spec' && format !== 'spec') || (choice === 'legacy-keep' && format === 'spec'))
        return refused(`mark ${choice} contradicts the file's format (${format}); file unchanged`);
      atomicWrite(file, markBytes(loaded.bytes, choice));
      process.stdout.write(`${SENTINEL.DESIGN_MD_MARKER}: ${choice}\n`);
      return 0;
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = main(); }
  catch (error) {
    process.stderr.write(`${SENTINEL.DESIGN_MD_INTERNAL_ERROR}: ${internalErrorSummary(error)}\n`);
    process.exitCode = 3;
  }
}
