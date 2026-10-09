#!/usr/bin/env node
// Adapted from gstack lib/outside-review-result.ts at 92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4 (MIT).
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { GATES, VERDICT_EXIT, classifyOutsideReview, validateOutsideReview } from './lib/outside-review-result.mjs';

const USAGE = 'Usage: outside-review-result.mjs [--verdict] [--stderr file] [--exit code] [--events file] [--label name] <review|structured|proposal> <response-file>';
const FLAGS = Object.freeze(['--stderr', '--exit', '--events', '--label']);

export function parseArgs(args) {
  const parsed = args.reduce((state, arg, index) => {
    if (state.valueIndexes.includes(index)) return state;
    if (arg === '--verdict') return { ...state, verdictMode: true };
    if (FLAGS.includes(arg)) {
      if (index + 1 >= args.length || args[index + 1].startsWith('--') || Object.hasOwn(state.flags, arg)) throw new TypeError(USAGE);
      return { ...state, flags: { ...state.flags, [arg]: args[index + 1] },
        valueIndexes: [...state.valueIndexes, index + 1], verdictMode: state.verdictMode || arg !== '--label' };
    }
    if (arg.startsWith('--')) throw new TypeError(USAGE);
    return { ...state, positional: [...state.positional, arg] };
  }, { flags: {}, positional: [], valueIndexes: [], verdictMode: false });
  const [gate, file] = parsed.positional;
  const rawExit = parsed.flags['--exit'];
  const exit = rawExit === undefined ? 0 : Number(rawExit);
  if (parsed.positional.length !== 2 || !GATES.includes(gate) || !file
      || (rawExit !== undefined && !/^\d+$/.test(rawExit)) || !Number.isInteger(exit) || exit > 255) throw new TypeError(USAGE);
  return { gate, file, flags: parsed.flags, exit, verdictMode: parsed.verdictMode };
}

export function runCli(args, io = { stdout: process.stdout, stderr: process.stderr }) {
  let options;
  try { options = parseArgs(args); } catch { io.stderr.write(`${USAGE}\n`); return 2; }
  let text, stderr, events;
  try {
    text = readFileSync(options.file, 'utf8');
    stderr = options.flags['--stderr'] ? readFileSync(options.flags['--stderr'], 'utf8') : '';
    events = options.flags['--events'] ? readFileSync(options.flags['--events'], 'utf8') : '';
  } catch {
    if (options.verdictMode) io.stdout.write('VERDICT: unavailable\nFINDINGS: none\nREASON: evidence_unreadable\n');
    io.stderr.write('Outside review unavailable: evidence file cannot be read; missing coverage.\n');
    return 1;
  }
  if (!options.verdictMode) {
    const result = validateOutsideReview(text, options.gate);
    if (!result.completed) io.stderr.write('Outside review unavailable: invalid completion evidence; missing coverage.\n');
    return result.completed ? 0 : 1;
  }
  const result = classifyOutsideReview({ text, gate: options.gate, exit: options.exit, stderr, events });
  io.stdout.write(`VERDICT: ${result.verdict}\nFINDINGS: ${result.findings.highest ?? 'none'}\n`);
  if (result.reason) {
    io.stdout.write(`REASON: ${result.reason}\n`);
    // Raw stderr/detail can contain project content or credentials; callers keep private evidence files.
    io.stderr.write(`Outside review unavailable: ${result.reason}; missing coverage.\n`);
  }
  return VERDICT_EXIT[result.verdict];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = runCli(process.argv.slice(2));
}
