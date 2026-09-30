#!/usr/bin/env node
/**
 * Node 18, dependency-free, opt-in scan of exact publication bytes.
 * No hooks, home/config/repo discovery, network, credential validation, body or
 * diff output. This is a guardrail, not a complete semantic detector.
 */
import { open } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { DEFAULT_MAX_BYTES, MAX_ALLOWED_BYTES, scan, oversizedResult, exitCodeFor } from "./lib/redact-engine.mjs";

const READ_CHUNK_BYTES = 64 * 1024;
const USAGE = "Usage: node content-guard.mjs [--from-file PATH] [--json] [--repo-visibility public|private|unknown] [--max-bytes N]";

/** Parse every option before opening a file or consuming stdin. */
export function parseArgs(args) {
  if (!Array.isArray(args) || args.some((arg) => typeof arg !== "string")) {
    throw new TypeError("Invalid arguments");
  }
  const seen = new Set();
  let options = { json: false, repoVisibility: "unknown", maxBytes: DEFAULT_MAX_BYTES };
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (!["--json", "--from-file", "--repo-visibility", "--max-bytes"].includes(flag) || seen.has(flag)) {
      throw new TypeError("Unknown or repeated option");
    }
    seen.add(flag);
    if (flag === "--json") {
      options = { ...options, json: true };
      continue;
    }
    const value = args[index + 1];
    if (!value || value.startsWith("--")) throw new TypeError("Missing option value");
    index += 1;
    if (flag === "--from-file") options = { ...options, fromFile: value };
    if (flag === "--repo-visibility") {
      if (!["public", "private", "unknown"].includes(value)) throw new TypeError("Invalid repository visibility");
      options = { ...options, repoVisibility: value };
    }
    if (flag === "--max-bytes") {
      const maxBytes = Number(value);
      if (!/^\d+$/.test(value) || !Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > MAX_ALLOWED_BYTES) {
        throw new TypeError("Invalid byte limit");
      }
      options = { ...options, maxBytes };
    }
  }
  return options;
}

function decodeInput(chunks, total) {
  return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(Buffer.concat(chunks, total));
}

async function readFileBounded(path, maxBytes) {
  const file = await open(path, "r");
  try {
    const stat = await file.stat();
    if (!stat.isFile()) throw new TypeError("Input must be a regular file");
    if (stat.size > maxBytes) return null;
    const chunks = [];
    let total = 0;
    while (true) {
      // The extra byte detects a growing file without ever buffering its body.
      const buffer = Buffer.alloc(Math.min(READ_CHUNK_BYTES, maxBytes - total + 1));
      const { bytesRead } = await file.read(buffer, 0, buffer.length, null);
      if (bytesRead === 0) return decodeInput(chunks, total);
      total += bytesRead;
      if (total > maxBytes) return null;
      chunks.push(Buffer.from(buffer.subarray(0, bytesRead)));
    }
  } finally {
    await file.close();
  }
}

async function readStdinBounded(stdin, maxBytes) {
  const chunks = [];
  let total = 0;
  for await (const chunk of stdin) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += bytes.length;
    if (total > maxBytes) return null;
    chunks.push(bytes);
  }
  return decodeInput(chunks, total);
}

function humanOutput(result) {
  const header = `content-guard scan — repo ${result.repoVisibility.toUpperCase()}`;
  const rows = result.findings.map((finding) =>
    `  ${finding.severity.padEnd(6)} ${finding.id.padEnd(24)} ${finding.line}:${finding.col} ${finding.preview}`);
  const counts = Object.entries(result.counts).map(([severity, count]) => `${severity}=${count}`).join(" ");
  return [header, ...(rows.length ? rows : ["  (no findings)"]), `  ${counts}`,
    ...(result.oversize ? ["  BLOCKED — input too large to scan safely (fail-closed)"] : [])].join("\n") + "\n";
}

/** Returns 0/2/3 for scans; 1 for invalid arguments, unreadable or invalid UTF-8 input. */
export async function runCli(args, { stdin = process.stdin, stdout = process.stdout, stderr = process.stderr } = {}) {
  let options;
  try {
    options = parseArgs(args);
  } catch {
    // Never echo rejected arguments: filenames/values themselves can be secrets.
    stderr.write(`content-guard: invalid arguments; max-bytes must be 1..${MAX_ALLOWED_BYTES}\n${USAGE}\n`);
    return 1;
  }
  let input;
  try {
    input = options.fromFile === undefined
      ? await readStdinBounded(stdin, options.maxBytes)
      : await readFileBounded(options.fromFile, options.maxBytes);
  } catch {
    // OS errors can contain the complete user-supplied path. Do not forward them.
    stderr.write("content-guard: cannot read input; check the file, permissions, and UTF-8 encoding\n");
    return 1;
  }
  const scanOptions = { repoVisibility: options.repoVisibility, maxBytes: options.maxBytes };
  let result;
  try {
    result = input === null ? oversizedResult(scanOptions) : scan(input, scanOptions);
  } catch {
    stderr.write("content-guard: scan failed; input must be supported text and publication must not proceed\n");
    return 1;
  }
  stdout.write(options.json ? JSON.stringify(result, null, 2) + "\n" : humanOutput(result));
  return exitCodeFor(result);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exitCode = await runCli(process.argv.slice(2));
  } catch {
    process.stderr.write("content-guard: scan failed; publication must not proceed\n");
    process.exitCode = 1;
  }
}
