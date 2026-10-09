// Adapted from gstack lib/outside-review-result.ts at 54efba6dd5a6dc7f04e62106b97079279ed53b41 (MIT).
// Node-only completion evidence; provider transport, consent and invocation belong to callers.
export const GATES = Object.freeze(['review', 'structured', 'proposal']);
export const VERDICT_EXIT = Object.freeze({ clean: 0, findings: 3, unverified: 4, unavailable: 1 });
const REFUSAL = /\b(?:(?:I (?:cannot|can't|won't|will not|am unable to)|I'm unable to)\s+(?:review|analy[sz]e|evaluate|assess|inspect|access|complete|perform|provide|assist|help|proceed)|unable to (?:review|analy[sz]e)|I must (?:decline|refuse))\b/i;
const SANDBOX_FAILURE = /^\s*bwrap: \S.*$|^.*\bbubblewrap is unavailable\b.*$|^.*\blandlock\b.{0,60}\b(?:fail\w*|error|not supported|unsupported)\b.*$|^.*\bseccomp\b.{0,60}\b(?:fail\w*|error)\b.*$|^.*\buser namespaces?\b.{0,80}\b(?:not (?:allowed|permitted|supported)|denied|disabled)\b.*$/im;
const EXECUTION_FAILURE_PHRASE = /\b(?:commands? (?:could not|couldn't|cannot|can't) (?:be )?run|(?:could not|couldn't|was unable to|am unable to|unable to) (?:run (?:any )?(?:shell )?commands|execute (?:any )?commands|inspect the diff|read the diff|access the diff)|the diff could not be (?:read|inspected|accessed)|every (?:shell )?(?:command|invocation) failed)\b/i;
const CODEX_ERROR_LINE = /^\s*(?:\[[^\]]*\]\s*)?(?:ERROR:|stream error)/;
const QUOTA_FAILURE = /usage limit|insufficient_quota|exceeded your current quota|quota exceeded/i;
const RATE_LIMIT_FAILURE = /rate.?limit|too many requests|(?:^|[^0-9])429(?:[^0-9]|$)/i;
const TRANSCRIPT_SUCCESS = /^\s*succeeded in \d+(?:\.\d+)?m?s:?\s*$/m;
const SEVERITY_WORDS = Object.freeze({ critical: 'P0', high: 'P1', medium: 'P2', low: 'P3' });
const WORD = '(critical|high|medium|low)';
const SEVERITY_LABELS = Object.freeze([
  new RegExp(`\\b(?:severity|priority)\\b[\\t ]*[:=][\\t ]*(?:\\*\\*|__|\\[|\`)*${WORD}\\b`, 'gim'),
  new RegExp(`^[\\t ]*(?:>[\\t ]*)?(?:#{1,6}[\\t ]+|[-+*][\\t ]+|\\(?\\d{1,3}[.)][\\t ]+)?(?:\\*\\*|__)?\\[?${WORD}\\]?(?:\\*\\*|__)?[\\t ]*(?::|—|–|-[\\t ]|\\]|\\(|\\*\\*[\\t ]*(?:—|–|-[\\t ]))`, 'gim'),
  new RegExp(`(?:\\*\\*|__)\\[?${WORD}\\]?:?(?:\\*\\*|__)`, 'gi'),
  new RegExp(`\\|[\\t ]*(?:\\*\\*)?${WORD}(?:\\*\\*)?[\\t ]*(?=\\|)`, 'gi'),
  new RegExp(`[\\t ](?:—|–|-)[\\t ]+(?:\\*\\*|__)?${WORD}(?:\\*\\*|__)?[\\t ]*[.;]?[\\t ]*$`, 'gim'),
  new RegExp(`\\((?:severity:[\\t ]*)?${WORD}\\)[\\t ]*[.;]?[\\t ]*$`, 'gim'),
]);
const NO_FINDINGS = /\bNO_FINDINGS\b|\bno (?:actionable |significant |new |concrete )?(?:bugs?|issues?|findings?|problems?)\b|\b(?:did not|didn't|cannot|can't|could not|couldn't) (?:find|identify) any (?:actionable |new |concrete )?(?:bugs|issues|findings|problems)\b/i;

function codexErrorLines(stderr) {
  return stderr.split(/\r?\n/).reduce((block, line) => CODEX_ERROR_LINE.test(line)
    ? [...block, line.trim()] : line.trim() ? [] : block, []);
}

function commandEvidence(events) {
  return events.split(/\r?\n/).reduce((evidence, line) => {
    if (!line.trim().startsWith('{')) return evidence;
    let event;
    try { event = JSON.parse(line); } catch { return evidence; }
    const item = event?.item;
    if (event?.type !== 'item.completed' || item?.type !== 'command_execution') return evidence;
    const succeeded = item.status === 'completed' && item.exit_code === 0;
    return {
      attempted: evidence.attempted + 1,
      succeeded: evidence.succeeded + Number(succeeded),
      failedOutput: succeeded ? evidence.failedOutput
        : `${evidence.failedOutput}${typeof item.aggregated_output === 'string' ? item.aggregated_output : ''}\n`,
    };
  }, { attempted: 0, succeeded: 0, failedOutput: '' });
}

function execution(input) {
  const stderr = input.stderr ?? '';
  const exit = input.exit ?? 0;
  const sandbox = (output) => output.match(SANDBOX_FAILURE)?.[0].trim().slice(0, 240);
  if (exit !== 0) {
    const detail = sandbox(stderr);
    if (detail) return { state: 'unavailable', reason: 'sandbox_unavailable', detail };
    const errors = exit !== 124 ? codexErrorLines(stderr) : [];
    const quota = errors.find((line) => QUOTA_FAILURE.test(line));
    if (quota) return { state: 'unavailable', reason: 'quota_exhausted', detail: quota.slice(0, 240) };
    const rateLimit = errors.find((line) => RATE_LIMIT_FAILURE.test(line));
    if (rateLimit) return { state: 'unavailable', reason: 'rate_limited', detail: rateLimit.slice(0, 240) };
    const head = stderr.split(/\r?\n/).map((line) => line.trim()).find(Boolean)?.slice(0, 240);
    return { state: 'unavailable', reason: exit === 124 ? 'timeout' : 'execution_failed', detail: head ? `exit ${exit}: ${head}` : `exit ${exit}` };
  }
  const commands = commandEvidence(input.events ?? '');
  const executed = commands.succeeded > 0 || TRANSCRIPT_SUCCESS.test(stderr);
  if (!executed) {
    const detail = sandbox(stderr) ?? sandbox(commands.failedOutput);
    if (detail) return { state: 'unavailable', reason: 'sandbox_unavailable', detail };
    if (commands.attempted > 0) return { state: 'unavailable', reason: 'commands_failed', detail: `all ${commands.attempted} commands failed` };
  }
  if (!input.text.trim()) return { state: 'unavailable', reason: 'empty_response' };
  const phrase = executed ? undefined : input.text.match(EXECUTION_FAILURE_PHRASE)?.[0];
  if (phrase) return { state: 'unavailable', reason: 'commands_failed', detail: `the review says "${phrase}"` };
  if (REFUSAL.test(input.text)) return { state: 'unavailable', reason: 'review_refused' };
  return { state: 'ran' };
}

function validateInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)
      || typeof input.text !== 'string' || !GATES.includes(input.gate)) {
    throw new TypeError('Expected review text and a supported completion gate');
  }
  for (const key of ['stderr', 'events']) {
    if (input[key] !== undefined && typeof input[key] !== 'string') throw new TypeError(`${key} must be text`);
  }
  if (input.exit !== undefined && (!Number.isInteger(input.exit) || input.exit < 0 || input.exit > 255)) {
    throw new TypeError('exit must be an integer provider status from 0 to 255');
  }
}

export function classifyOutsideReview(input) {
  validateInput(input);
  const plain = input.text.split(/\r?\n/).map((line) => line
    .replace(/^[\t ]*(?:#{1,6}[\t ]+|[-+*][\t ]+)?/, '').replace(/[*_`]/g, '')).join('\n');
  const levels = [
    ...[...plain.matchAll(/\[(P[0-3])\]|^(P[0-3]):/gm)].map((match) => match[1] ?? match[2]),
    ...(input.gate === 'proposal' ? [] : SEVERITY_LABELS.flatMap((regex) =>
      [...input.text.matchAll(new RegExp(regex.source, regex.flags))].map((match) => SEVERITY_WORDS[match[1].toLowerCase()]))),
  ];
  const findings = { highest: [...levels].sort()[0] ?? null };
  const ran = execution(input);
  if (ran.state === 'unavailable') return { execution: ran, findings, verdict: 'unavailable', reason: ran.reason, detail: ran.detail };
  const result = (verdict, reason, detail) => ({ execution: ran, findings, verdict,
    ...(reason ? { reason } : {}), ...(detail ? { detail } : {}) });
  if ((input.gate === 'review' || input.gate === 'proposal')
      && !/^Recommendation:[\t ]*[^\r\n]+\bbecause\b[\t ]*\S[^\r\n]+$/im.test(plain)) {
    return result('unavailable', 'missing_markers', 'missing review completion recommendation');
  }
  if (input.gate !== 'proposal' && !findings.highest && !NO_FINDINGS.test(input.text)) {
    return result('unverified', 'untagged_review', 'missing severity or explicit no-findings conclusion');
  }
  return result(findings.highest === 'P0' || findings.highest === 'P1' ? 'findings' : 'clean');
}

export function validateOutsideReview(text, gate) {
  const checked = classifyOutsideReview({ text, gate });
  if (checked.verdict === 'unavailable' || checked.verdict === 'unverified') {
    return { completed: false, reason: checked.detail ?? checked.reason };
  }
  return { completed: true, ...(gate === 'structured' ? { gate: checked.verdict === 'findings' ? 'fail' : 'pass' } : {}) };
}
