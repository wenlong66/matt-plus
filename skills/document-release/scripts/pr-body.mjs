#!/usr/bin/env node
// Local RAW pipeline for the pinned document-release two-artifact body workflow.
// No hosting calls. Never use an ENVELOPED rendering as a RAW input.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BANNER = 'UNTRUSTED TRACKER CONTENT';
const USAGE = `usage: pr-body.mjs extract <snapshot.json> <body|description> <raw-out>
       pr-body.mjs splice <raw-original> <documentation-section> <raw-out>
       pr-body.mjs tripwire <raw-original> <raw-final>
       pr-body.mjs request <raw-body> <request-out.json>`;
const decode = bytes => new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
const read = file => decode(readFileSync(file));
const write = (file, text) => writeFileSync(file, text, { encoding: 'utf8', mode: 0o600, flag: 'wx' });

// Markdown fence state only determines headings; it never changes RAW content.
function h2s(text) {
  return [...text.matchAll(/[^\n]*(?:\n|$)/g)].filter(match => match[0]).reduce((state, match) => {
    const line = match[0].replace(/\r?\n$/, '');
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (state.fence) {
      const closes = marker && marker[1][0] === state.fence[0] &&
        marker[1].length >= state.fence.length && !marker[2].trim();
      return closes ? { ...state, fence: null } : state;
    }
    if (marker) return { ...state, fence: marker[1] };
    const heading = line.match(/^ {0,3}##[\t ]+(.+?)[\t ]*$/);
    if (!heading) return state;
    const title = heading[1].replace(/[\t ]+#+[\t ]*$/, '');
    return { ...state, headings: [...state.headings, { title, start: match.index }] };
  }, { fence: null, headings: [] }).headings;
}

export function spliceDocumentation(original, section) {
  const composed = h2s(section);
  if (composed.length !== 1 || composed[0].start !== 0 || composed[0].title !== 'Documentation') {
    throw new Error('compose exactly one Documentation H2 section');
  }
  const headings = h2s(original);
  const docs = headings.filter(heading => heading.title === 'Documentation');
  if (docs.length > 1) throw new Error('duplicate Documentation H2 sections');
  if (!docs.length) {
    const gap = !original ? '' : original.endsWith('\n\n') ? '' : original.endsWith('\n') ? '\n' : '\n\n';
    return original + gap + section;
  }
  const next = headings.find(heading => heading.start > docs[0].start);
  const suffix = next ? original.slice(next.start) : '';
  const separator = suffix && !section.endsWith('\n') ? '\n' : '';
  return original.slice(0, docs[0].start) + section + separator + suffix;
}

export function bannerCounts(original, final) {
  const count = text => text.split('\n').filter(line => line.includes(BANNER)).length;
  return { original: count(original), final: count(final) };
}

export function assertTripwire(original, final) {
  const counts = bannerCounts(original, final);
  if (counts.final > counts.original) throw new Error('ABORT: envelope banner leaked into outgoing body');
  return counts;
}

function extract(args) {
  if (args.length !== 3 || !['body', 'description'].includes(args[1])) throw new Error(USAGE);
  const snapshot = JSON.parse(read(args[0]));
  if (!snapshot || typeof snapshot[args[1]] !== 'string') throw new Error('snapshot lacks a string body');
  write(args[2], snapshot[args[1]]);
}

function main(command, args) {
  if (command === 'extract') return extract(args);
  if (command === 'splice' && args.length === 3) {
    write(args[2], spliceDocumentation(read(args[0]), read(args[1])));
    return;
  }
  if (command === 'tripwire' && args.length === 2) {
    const counts = assertTripwire(read(args[0]), read(args[1]));
    console.log(`banner tripwire clean (original=${counts.original} final=${counts.final})`);
    return;
  }
  if (command === 'request' && args.length === 2) {
    write(args[1], JSON.stringify({ description: read(args[0]) }) + '\n');
    return;
  }
  throw new Error(USAGE);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv[2], process.argv.slice(3)); }
  catch (error) {
    const expected = error.message.startsWith('usage:') || error.message.startsWith('ABORT:') ||
      error.message.startsWith('compose ') || error.message.startsWith('duplicate ') ||
      error.message.startsWith('snapshot lacks ');
    console.error(expected ? error.message : 'pr-body: input/output failed; no body published');
    process.exitCode = 1;
  }
}
