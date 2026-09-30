/**
 * Pure Node 18 scan-at-publication engine, adapted from gstack at
 * e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09 (MIT). No I/O or trust discovery.
 * Findings contain locations and fixed masks, never matched text or context.
 * Regexes are a guardrail, NOT a complete semantic detector; clean != approved.
 */
import { PATTERNS, PATTERNS_BY_ID, isPlaceholderSpan } from "./redact-patterns.mjs";

export const DEFAULT_MAX_BYTES = 1024 * 1024;
export const MAX_ALLOWED_BYTES = 16 * 1024 * 1024;
const VISIBILITIES = Object.freeze(["public", "private", "unknown"]);
const OPTION_NAMES = Object.freeze(["repoVisibility", "maxBytes", "benignExamples"]);
const ZERO_WIDTH = /[​-‍⁠﻿]/u;
const BINARY_CONTROLS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/u;
const COMBINING_MARK = /^\p{M}$/u;
const HTML_ENTITIES = Object.freeze({
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'",
});

function validateOptions(options) {
  if (!options || typeof options !== "object" || Array.isArray(options) ||
      Object.keys(options).some((name) => !OPTION_NAMES.includes(name))) {
    throw new TypeError("Unsupported scan options");
  }
  const repoVisibility = options.repoVisibility ?? "unknown";
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const benignExamples = options.benignExamples ?? [];
  if (!VISIBILITIES.includes(repoVisibility)) throw new TypeError("Invalid repository visibility");
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > MAX_ALLOWED_BYTES) {
    throw new TypeError(`maxBytes must be an integer from 1 to ${MAX_ALLOWED_BYTES}`);
  }
  if (!Array.isArray(benignExamples) || benignExamples.some((value) =>
    typeof value !== "string" || !value.length || Buffer.byteLength(value, "utf8") > MAX_ALLOWED_BYTES)) {
    throw new TypeError("benignExamples must contain nonempty exact strings within the byte limit");
  }
  return { repoVisibility, maxBytes, benignExamples: [...benignExamples] };
}

function decodeEntity(input, offset) {
  const entity = input.slice(offset, offset + 16).match(/^&(?:amp|lt|gt|quot|apos|#\d{1,7}|#x[\da-f]{1,6});/i)?.[0];
  if (!entity) return null;
  const named = HTML_ENTITIES[entity.toLowerCase()];
  if (named) return { text: named, length: entity.length };
  const hex = /^&#x/i.test(entity);
  const codePoint = Number.parseInt(entity.slice(hex ? 3 : 2, -1), hex ? 16 : 10);
  if (codePoint > 0x10FFFF || (codePoint >= 0xD800 && codePoint <= 0xDFFF)) return null;
  return { text: String.fromCodePoint(codePoint), length: entity.length };
}

function* decomposedUnits(input) {
  let offset = 0;
  while (offset < input.length) {
    const original = String.fromCodePoint(input.codePointAt(offset));
    const entity = input[offset] === "&" ? decodeEntity(input, offset) : null;
    const text = entity?.text ?? original;
    const end = offset + (entity?.length ?? original.length);
    for (const char of text) {
      if (ZERO_WIDTH.test(char)) continue;
      for (const decomposed of char.normalize("NFKD")) {
        if (!ZERO_WIDTH.test(decomposed)) yield { char: decomposed, start: offset, end };
      }
    }
    offset = end;
  }
}

function continuesComposition(pending, char) {
  if (COMBINING_MARK.test(char)) return true;
  const previous = pending.codePointAt(pending.length - 1);
  const current = char.codePointAt(0);
  // Canonical Hangul composition is the starter+starter exception to mark runs.
  return (previous >= 0x1100 && previous <= 0x1112 && current >= 0x1161 && current <= 0x1175) ||
    (previous >= 0x1161 && previous <= 0x1175 && current >= 0x11A8 && current <= 0x11C2);
}

/**
 * Entity decode + zero-width removal + full NFKC (NFKD followed by NFC).
 * map/ends address ORIGINAL UTF-16 offsets, including entity/surrogate spans.
 * A normalized expansion/composition maps to the entire originating unit/run;
 * redaction never leaves half an encoded character behind. All arrays are fresh.
 */
export function normalizeWithMap(input) {
  if (typeof input !== "string") throw new TypeError("Input must be a string");
  const pieces = [];
  const map = [];
  const ends = [];
  let pending = "";
  let start = 0;
  let end = 0;
  const flush = () => {
    if (!pending) return;
    const normalized = pending.normalize("NFC");
    pieces.push(normalized);
    for (let index = 0; index < normalized.length; index += 1) {
      map.push(start);
      ends.push(end);
    }
  };
  for (const unit of decomposedUnits(input)) {
    if (pending && continuesComposition(pending, unit.char)) {
      pending += unit.char;
      end = unit.end;
    } else {
      flush();
      pending = unit.char;
      start = unit.start;
      end = unit.end;
    }
  }
  flush();
  map.push(input.length);
  ends.push(input.length);
  return { normalized: pieces.join(""), map, ends };
}

/** Fixed mask: no original prefix, even for short PII or illustrative findings. */
export function maskPreview(span) {
  if (typeof span !== "string") throw new TypeError("Span must be a string");
  return span.length ? "<MASKED>" : "";
}

function lineColAt(lineStarts, offset) {
  let low = 0;
  let high = lineStarts.length;
  while (low + 1 < high) {
    const middle = Math.floor((low + high) / 2);
    if (lineStarts[middle] <= offset) low = middle;
    else high = middle;
  }
  return { line: low + 1, col: offset - lineStarts[low] + 1 };
}

function clonedRegex(regex, flags = "") {
  return new RegExp(regex.source, [...new Set([...regex.flags, ...flags])].join(""));
}

function hasNear(normalized, match, pattern) {
  if (!pattern.nearRegex) return true;
  const window = pattern.nearWindow ?? 100;
  const from = Math.max(0, match.index - window);
  const to = Math.min(normalized.length, match.index + match[0].length + window);
  return clonedRegex(pattern.nearRegex).test(normalized.slice(from, to));
}

function createResult(findings, repoVisibility, oversize = false) {
  const counts = findings.reduce((current, finding) => ({
    ...current, [finding.severity]: current[finding.severity] + 1,
  }), { HIGH: 0, MEDIUM: 0, LOW: 0, WARN: 0 });
  return { findings, counts, repoVisibility, oversize };
}

/** CLI input-boundary helper: block without buffering an oversize body. */
export function oversizedResult(options = {}) {
  const { repoVisibility } = validateOptions(options);
  return createResult([{
    id: "engine.input_too_large", tier: "HIGH", severity: "HIGH", category: "secret",
    description: "Input exceeds the byte cap; publication blocked (fail-closed)",
    line: 1, col: 1, preview: "", autoRedactable: false, repoVisibility,
  }], repoVisibility, true);
}

function matchEntry(match, pattern, context) {
  const { normalized, map, ends, lineStarts, allowed, options } = context;
  const span = match[1] ?? match[0];
  if (isPlaceholderSpan(span) || allowed.has(span) ||
      (pattern.validate && !pattern.validate(span, match)) || !hasNear(normalized, match, pattern)) {
    return [];
  }
  const [normalizedStart, normalizedEnd] = match.indices[1] ?? match.indices[0];
  const start = map[normalizedStart];
  const end = ends[normalizedEnd - 1];
  const finding = {
    id: pattern.id, tier: pattern.tier, severity: pattern.tier, category: pattern.category,
    description: pattern.description, ...lineColAt(lineStarts, start),
    preview: maskPreview(span), autoRedactable: Boolean(pattern.autoRedactable),
    repoVisibility: options.repoVisibility,
  };
  return [{ finding, start, end }];
}

function collect(input, options) {
  if (typeof input !== "string") throw new TypeError("Input must be a string");
  if (Buffer.byteLength(input, "utf8") > options.maxBytes) {
    return { result: oversizedResult(options), entries: [] };
  }
  if (BINARY_CONTROLS.test(input)) throw new TypeError("Binary control characters are unsupported input");
  const { normalized, map, ends } = normalizeWithMap(input);
  const lineStarts = [0, ...Array.from(input.matchAll(/\n/g), (match) => match.index + 1)];
  const allowed = new Set(options.benignExamples.map((example) => normalizeWithMap(example).normalized));
  const context = { normalized, map, ends, lineStarts, allowed, options };
  const all = PATTERNS.flatMap((pattern) =>
    Array.from(normalized.matchAll(clonedRegex(pattern.regex, "gmd")))
      .flatMap((match) => matchEntry(match, pattern, context)));
  const unique = Object.values(Object.fromEntries(all.map((entry) =>
    [`${entry.finding.id}:${entry.start}`, entry])));
  const entries = [...unique].sort((first, second) =>
    first.start - second.start || (first.finding.id < second.finding.id ? -1 : first.finding.id > second.finding.id ? 1 : 0));
  return { result: createResult(entries.map((entry) => entry.finding), options.repoVisibility), entries };
}

/**
 * scan(input, {repoVisibility="unknown", maxBytes=1048576, benignExamples=[]})
 * Explicit examples are exact normalized candidate spans, never substrings.
 * No self-email/public-author allowlist, fence trust, or visibility promotion.
 * WARN remains in the result schema/exit contract; untrusted text cannot earn it.
 */
export function scan(input, options = {}) {
  return collect(input, validateOptions(options)).result;
}

function inStructuralToken(input, start, end) {
  const lineStart = input.lastIndexOf("\n", start - 1) + 1;
  const nextNewline = input.indexOf("\n", end);
  const line = input.slice(lineStart, nextNewline < 0 ? input.length : nextNewline);
  // Conservative: quoted/code/HTML/link lines require manual edits. This also
  // covers nested JSON strings, not just the upstream exact quoted-value case.
  if (/[`"'<>]|\]\(|^\s*[\[{]/.test(line)) return true;
  const markers = Array.from(input.slice(0, lineStart).matchAll(/^\s*(`{3,}|~{3,}).*$/gm), (match) => match[1]);
  const open = markers.reduce((fence, marker) => {
    if (!fence) return marker;
    return marker[0] === fence[0] && marker.length >= fence.length ? null : fence;
  }, null);
  return Boolean(open);
}

/**
 * Targeted PII-only substitutions. Returns {body, redacted, skipped}, NO diff.
 * body may still contain secrets/PII: write locally and rescan the exact file;
 * never blindly publish/log it. Non-PII, overlaps and structured spans are skipped.
 */
export function applyRedactions(input, findingIds, options = {}) {
  if (!Array.isArray(findingIds) || findingIds.some((id) =>
    typeof id !== "string" || !Object.hasOwn(PATTERNS_BY_ID, id))) {
    throw new TypeError("findingIds must contain known pattern IDs");
  }
  const { result, entries } = collect(input, validateOptions(options));
  if (result.oversize) return { body: input, redacted: [], skipped: result.findings };
  const ids = new Set(findingIds);
  const selected = entries.filter((entry) => ids.has(entry.finding.id));
  const safe = selected.filter((entry) => entry.finding.autoRedactable &&
    !inStructuralToken(input, entry.start, entry.end) &&
    !entries.some((other) => other !== entry && other.start < entry.end && entry.start < other.end));
  const body = [...safe].sort((first, second) => second.start - first.start).reduce((text, entry) =>
    text.slice(0, entry.start) + PATTERNS_BY_ID[entry.finding.id].redactToken + text.slice(entry.end), input);
  return {
    body,
    redacted: safe.map((entry) => entry.finding),
    skipped: selected.filter((entry) => !safe.includes(entry)).map((entry) => entry.finding),
  };
}

/** 0: no HIGH/MEDIUM (LOW/WARN may exist); 2: MEDIUM; 3: HIGH/oversize. */
export function exitCodeFor(result) {
  if (result.oversize || result.counts.HIGH > 0) return 3;
  if (result.counts.MEDIUM > 0) return 2;
  return 0;
}
