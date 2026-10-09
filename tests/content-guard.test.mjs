import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { scan, applyRedactions, exitCodeFor, normalizeWithMap, maskPreview,
  DEFAULT_MAX_BYTES, MAX_ALLOWED_BYTES } from "../scripts/lib/redact-engine.mjs";
import { PATTERNS, SOURCE_REVISION, luhnValid, shannonEntropy,
  isPublicIPv4, isPlaceholderSpan } from "../scripts/lib/redact-patterns.mjs";
import { parseArgs, runCli } from "../scripts/content-guard.mjs";

// Manufactured, deterministic local fixtures only. Never contact credential services.
const TOKEN_BODY = "1234567890abcdefghijklmnopqrstuvwxyz";
const AWS = "AKIA1234567890ABCDEF";
const PAT = `ghp_${TOKEN_BODY}`;
const EMAIL = "alice@corp.io";
const ENTROPY = "8Fk2pQ9vXz4wL7mN3rT6yB1cD5eG0hJq";
const JWT = `eyJ${ENTROPY.slice(0, 20)}.eyJ${ENTROPY.slice(4, 24)}.${ENTROPY.slice(8, 28)}`;
const HERE = dirname(fileURLToPath(import.meta.url));
const CLI = fileURLToPath(new URL("../scripts/content-guard.mjs", import.meta.url));
const UPSTREAM = fileURLToPath(new URL("../../gstack/", import.meta.url));
const UPSTREAM_SNAPSHOT = spawnSync("git", ["-C", UPSTREAM, "show", `${SOURCE_REVISION}:lib/redact-patterns.ts`],
  { encoding: "utf8", env: { ...process.env, GIT_NO_LAZY_FETCH: "1", GIT_TERMINAL_PROMPT: "0" } });
const ids = (input, options) => scan(input, options).findings.map((finding) => finding.id);

const POSITIVES = [
  ["aws.access_key", "HIGH", AWS],
  ["aws.secret_key", "HIGH", "aws_secret_access_key = AbCdEfGhIjKlMnOpQrStUvWxYz0123456789AbCd"],
  ["github.pat", "HIGH", PAT],
  ["github.oauth", "HIGH", `gho_${TOKEN_BODY}`],
  ["github.server", "HIGH", `ghs_${TOKEN_BODY}`],
  ["github.fine_grained", "HIGH", `github_pat_${"A".repeat(82)}`],
  ["gitlab.token", "HIGH", `glpat-${"Ab12Cd34Ef56Gh78Ij90"}`],
  ["huggingface.token", "HIGH", "hf_AbCdEfGhIjKlMnOpQrStUvWxYz012345"],
  ["npm.token", "HIGH", `npm_${TOKEN_BODY}`],
  ["digitalocean.token", "HIGH", `dop_v1_${"0123456789abcdef".repeat(4)}`],
  ["gcp.service_account", "HIGH", '{"private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\\nMIIE..."}'],
  ["anthropic.key", "HIGH", "sk-ant-api03-abcdefghij1234567890XYZ"],
  ["openai.key", "HIGH", "sk-proj-Ab12_Cd34-Ef56Gh78Ij90Kl12Mn34Op56Qr78St90Uv"],
  ["sendgrid.key", "HIGH", `SG.${"a".repeat(22)}.${"b".repeat(43)}`],
  ["stripe.secret", "HIGH", `sk_live_${"a".repeat(30)}`],
  ["slack.token", "HIGH", `xoxb-${"1234567890"}-${"abcdefghijklmnop"}`],
  ["slack.webhook", "HIGH", `https://hooks.slack.com/services/T00000000/B11111111/${"a".repeat(24)}`],
  ["discord.webhook", "HIGH", `https://discord.com/api/webhooks/123456789012345678/${"a".repeat(60)}`],
  ["twilio.auth_token", "HIGH", `account AC${"a".repeat(32)} token ${"b".repeat(32)}`],
  ["pem.private_key", "HIGH", "-----BEGIN RSA PRIVATE KEY-----"],
  ["db.url_with_password", "HIGH", "postgres://user:S3cR3tP4ss@db.example.com/app"],
  ["creds.basic_auth_url", "HIGH", "https://user:S3cR3tP4ss@service.example.com/path"],
  ["stripe.publishable", "MEDIUM", `pk_live_${"a".repeat(30)}`],
  ["google.api_key", "MEDIUM", `AIza${"a".repeat(35)}`],
  ["jwt", "MEDIUM", JWT],
  ["env.kv", "MEDIUM", `API_TOKEN=${ENTROPY}`],
  ["auth.bearer", "MEDIUM", `Authorization: Bearer ${ENTROPY}`],
  ["pii.email", "MEDIUM", EMAIL],
  ["pii.phone.e164", "MEDIUM", "+14155550123"],
  ["pii.ssn", "MEDIUM", "123-45-6789"],
  ["pii.cc", "MEDIUM", "4111111111111111"],
  ["pii.ip_public", "MEDIUM", "8.8.8.8"],
  ["pii.wallet", "MEDIUM", `0x${"0123456789abcdef".repeat(2)}01234567`],
  ["internal.hostname", "MEDIUM", "db1.corp"],
  ["internal.url_private", "MEDIUM", "http://localhost:8080/admin/secrets"],
  ["legal.nda_marker", "MEDIUM", "CONFIDENTIAL"],
  ["legal.named_criticism", "MEDIUM", "John Smith is incompetent at this"],
  ["internal.user_path", "LOW", "/Users/bob/secret/config"],
  ["hygiene.todo", "LOW", "TODO(alice) fix later"],
];

for (const [id, tier, input] of POSITIVES) {
  test(`source taxonomy fixture: ${id} detects at ${tier}, fully masked`, () => {
    const result = scan(input);
    const finding = result.findings.find((item) => item.id === id);
    assert.ok(finding, `Missing ${id}`);
    assert.equal(finding.tier, tier);
    assert.equal(finding.severity, tier);
    assert.equal(finding.repoVisibility, "unknown");
    assert.equal(finding.preview, "<MASKED>");
    assert.equal(finding.line, 1);
    assert.ok(finding.col >= 1);
    assert.equal(Object.hasOwn(finding, "span"), false);
    assert.equal(Object.hasOwn(finding, "body"), false);
    assert.equal(Object.hasOwn(finding, "context"), false);
    assert.equal(JSON.stringify(result).includes(input), false);
  });
}

test("taxonomy fixture coverage, uniqueness and immutability", () => {
  assert.equal(PATTERNS.length, 39);
  assert.deepEqual([...new Set(PATTERNS.map((pattern) => pattern.id))].sort(), POSITIVES.map(([id]) => id).sort());
  assert.ok(Object.isFrozen(PATTERNS));
  for (const pattern of PATTERNS) {
    assert.ok(Object.isFrozen(pattern));
    assert.ok(Object.isFrozen(pattern.regex));
    assert.equal(pattern.regex.lastIndex, 0);
    if (pattern.nearRegex) assert.ok(Object.isFrozen(pattern.nearRegex));
    if (pattern.autoRedactable) assert.ok(pattern.redactToken);
  }
});

test("optional pinned upstream snapshot parity: all IDs, regexes, tiers, categories and proximity rules", {
  skip: !existsSync(UPSTREAM) && "Source snapshot is optional, never a runtime dependency",
}, () => {
  assert.equal(SOURCE_REVISION, "e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09");
  assert.equal(UPSTREAM_SNAPSHOT.status, 0, "The declared source snapshot must be available locally; never substitute the current upstream worktree");
  const source = UPSTREAM_SNAPSHOT.stdout;
  assert.equal(createHash("sha256").update(source).digest("hex"),
    "2f8f7314ad5ec78e436655b9c294ec2215ed7bd2780b5f5a82d9375f2b705e7b");
  const literal = (block, name) => {
    const text = block.match(new RegExp(`\\b${name}:\\s*(/[^\\r\\n]+),`))?.[1];
    if (!text) return undefined;
    const slash = text.lastIndexOf("/");
    const regex = new RegExp(text.slice(1, slash), text.slice(slash + 1));
    return { source: regex.source, flags: regex.flags };
  };
  const upstream = source.split(/(?=\n\s+id: ")/).slice(1).map((block) => ({
    id: block.match(/id: "([^"]+)"/)[1],
    tier: block.match(/tier: "([^"]+)"/)[1],
    category: block.match(/category: "([^"]+)"/)[1],
    regex: literal(block, "regex"),
    nearRegex: literal(block, "nearRegex"),
    nearWindow: Number(block.match(/nearWindow: (\d+)/)?.[1]) || undefined,
    autoRedactable: /autoRedactable: true/.test(block),
  }));
  const port = PATTERNS.map((pattern) => ({
    id: pattern.id, tier: pattern.tier, category: pattern.category,
    regex: { source: pattern.regex.source, flags: pattern.regex.flags },
    nearRegex: pattern.nearRegex && { source: pattern.nearRegex.source, flags: pattern.nearRegex.flags },
    nearWindow: pattern.nearWindow, autoRedactable: Boolean(pattern.autoRedactable),
  }));
  assert.deepEqual(port, upstream);
});

test("source checksums, entropy and public-IP exclusions", () => {
  assert.equal(luhnValid("4111 1111 1111 1111"), true);
  assert.equal(luhnValid("4111111111111112"), false);
  assert.equal(luhnValid("123"), false);
  assert.ok(shannonEntropy(ENTROPY) >= 3);
  assert.equal(shannonEntropy("aaaaaaaa"), 0);
  assert.equal(shannonEntropy(""), 0);
  assert.equal(isPublicIPv4("8.8.8.8"), true);
  for (const ip of ["10.0.0.1", "192.168.1.1", "127.0.0.1", "172.16.0.1", "169.254.1.1", "100.64.0.1", "224.0.0.1", "300.1.1.1"]) {
    assert.equal(isPublicIPv4(ip), false);
    assert.equal(ids(ip).includes("pii.ip_public"), false);
  }
  assert.equal(ids("123-00-6789").includes("pii.ssn"), false);
  assert.equal(ids("666-12-3456").includes("pii.ssn"), false);
  assert.equal(ids("000-12-3456").includes("pii.ssn"), false);
  assert.equal(ids(`0x${"0".repeat(40)}`).includes("pii.wallet"), false);
});

test("source proximity and negative calibration", () => {
  const awsSecret = "AbCdEfGhIjKlMnOpQrStUvWxYz0123456789AbCd";
  assert.equal(ids(awsSecret).includes("aws.secret_key"), false);
  assert.equal(ids(`aws_secret_access_key ${" ".repeat(101)}${awsSecret}`).includes("aws.secret_key"), false);
  assert.equal(ids("b".repeat(32)).includes("twilio.auth_token"), false);
  assert.equal(ids(`Bearer ${ENTROPY}`).includes("auth.bearer"), false);
  assert.equal(ids("the build is incompetent").includes("legal.named_criticism"), false);
  for (const input of ["API_TOKEN=changeme", "API_KEY=${MY_VAR}", "API_KEY=aaaaaaaaaaaa", "Authorization: Bearer YOUR_TOKEN_HERE_PLACEHOLDER"]) {
    assert.equal(ids(input).includes("env.kv"), false);
    assert.equal(ids(input).includes("auth.bearer"), false);
  }
  for (const input of ["sk--double-dash-typo-not-a-real-key", "sk-learning-rate-schedule-was-tuned-carefully", "sk-short"]) {
    assert.equal(ids(input).includes("openai.key"), false);
  }
  for (const prefix of ["sk-svcacct-", "sk-admin-", "sk-"]) {
    assert.ok(ids(prefix + TOKEN_BODY).includes("openai.key"));
  }
  for (const prefix of ["glptt-", "gldt-"]) assert.ok(ids(prefix + TOKEN_BODY).includes("gitlab.token"));
});

test("obvious placeholders are per-span, never per-line or arbitrary example substring", () => {
  for (const span of ["your_api_key", "<REDACTED-EMAIL>", "********", "xxxxxx", "changeme", "test_token", "dummy_key"]) {
    assert.equal(isPlaceholderSpan(span), true);
  }
  assert.equal(isPlaceholderSpan("AKIAIOSFODNN7EXAMPLE"), false);
  assert.equal(isPlaceholderSpan("postgres://user:password@db.example.com"), false);
  assert.ok(ids(`EXAMPLE your_api_key <REDACTED> ${AWS}`).includes("aws.access_key"));
  const containsExample = `ghp_${"a".repeat(15)}EXAMPLE${"b".repeat(14)}`;
  assert.ok(ids(containsExample).includes("github.pat"));
  assert.ok(ids("postgres://user:S3cR3tP4ss@db.example.com/app").includes("db.url_with_password"));
  assert.equal(ids("postgres://user:${DB_PASSWORD}@host/app").includes("db.url_with_password"), false);
  assert.equal(ids("https://user:your_password@host/path").includes("creds.basic_auth_url"), false);
});

test("only explicit exact benign examples suppress live-shaped examples and emails", () => {
  const example = "AKIAIOSFODNN7EXAMPLE";
  const options = Object.freeze({ benignExamples: Object.freeze([example, "user@example.com"]) });
  assert.ok(ids(example).includes("aws.access_key"));
  assert.ok(ids("user@example.com").includes("pii.email"));
  assert.ok(ids("noreply@github.com").includes("pii.email"));
  const result = scan(`${example} user@example.com ${AWS} ${EMAIL}`, options);
  assert.equal(result.counts.HIGH, 1);
  assert.equal(result.counts.MEDIUM, 1);
  assert.ok(ids(AWS, { benignExamples: [AWS.slice(0, 4)] }).includes("aws.access_key"));
  assert.ok(ids("USER@example.com", options).includes("pii.email"));
  assert.deepEqual(options.benignExamples, [example, "user@example.com"]);
});

for (const fence of ["codex-review", "greptile", "eval", "codex", "tool-output", "text"]) {
  test(`untrusted ${fence} fences cannot downgrade live credentials`, () => {
    const result = scan(`\`\`\`${fence}\n${AWS}\nAuthorization: Bearer ${ENTROPY}\n\`\`\``);
    assert.equal(result.counts.HIGH, 1);
    assert.ok(result.counts.MEDIUM >= 1);
    assert.equal(result.counts.WARN, 0);
    assert.equal(exitCodeFor(result), 3);
    assert.equal(result.findings.some((finding) => finding.toolFenceDegraded), false);
    assert.equal(scan(`\`\`\`${fence}\n${AWS}`).counts.HIGH, 1);
  });
}

test("visibility is metadata, never tier promotion or suppression; WARN/LOW do not gate", () => {
  for (const repoVisibility of ["public", "private", "unknown"]) {
    const result = scan(`${EMAIL} pk_live_${"a".repeat(30)}`, { repoVisibility });
    assert.equal(result.counts.HIGH, 0);
    assert.equal(result.counts.MEDIUM, 2);
    assert.equal(exitCodeFor(result), 2);
    assert.ok(result.findings.every((finding) => finding.repoVisibility === repoVisibility));
  }
  assert.equal(exitCodeFor(scan("ordinary publication text")), 0);
  assert.equal(exitCodeFor(scan("TODO(owner)")), 0);
  assert.equal(exitCodeFor({ oversize: false, counts: { HIGH: 0, MEDIUM: 0, LOW: 0, WARN: 1 } }), 0);
});

test("zero-width/NFKC/entity normalization keeps exact original locations", () => {
  for (const zeroWidth of ["​", "‌", "‍", "⁠", "﻿"]) {
    assert.ok(ids(`AKIA1234567890${zeroWidth}ABCDEF`).includes("aws.access_key"));
  }
  const original = `Intro\r\n  ＡＫＩＡ1234​567890ABCDEF\nnext`;
  const finding = scan(original).findings.find((item) => item.id === "aws.access_key");
  assert.equal(finding.line, 2);
  assert.equal(finding.col, 3);
  assert.equal(finding.preview, "<MASKED>");
  assert.ok(ids(`&#65;KIA1234567890ABCDEF`).includes("aws.access_key"));
  assert.ok(ids(`&#x41;KIA1234567890ABCDEF`).includes("aws.access_key"));
  assert.ok(ids(`𝐀KIA1234567890ABCDEF`).includes("aws.access_key"));
  assert.ok(ids('Authorization: Bearer &#56;Fk2pQ9vXz4wL7mN3rT6yB1cD5eG0hJq').includes("auth.bearer"));
  assert.ok(ids('&quot;private_key_id&quot;: &quot;abc123&quot;, &quot;private_key&quot;: &quot;-----BEGIN PRIVATE KEY-----').includes("gcp.service_account"));
  const mapped = normalizeWithMap("xy​z &amp; 𝐀 é 각");
  assert.equal(mapped.normalized, "xyz & A é 각");
  assert.equal(mapped.map[2], 3);
  assert.equal(mapped.map.length, mapped.normalized.length + 1);
  assert.equal(mapped.ends.length, mapped.map.length);
  assert.equal(normalizeWithMap("a &lt; b &gt; c &apos;x&#39;").normalized, "a < b > c 'x'");
  assert.equal(normalizeWithMap("&#xD800; &#9999999;").normalized, "&#xD800; &#9999999;");
});

test("sorted deterministic fresh results; caller inputs and cached regex state untouched", () => {
  const input = `${EMAIL}\nAuthorization: Bearer ${JWT}\n${AWS} ${PAT}`;
  const options = Object.freeze({ repoVisibility: "public", benignExamples: Object.freeze([]) });
  const first = scan(input, options);
  const second = scan(input, options);
  assert.deepEqual(first, second);
  assert.notStrictEqual(first, second);
  assert.notStrictEqual(first.findings, second.findings);
  assert.notStrictEqual(first.counts, second.counts);
  assert.notStrictEqual(first.findings[0], second.findings[0]);
  assert.deepEqual(first.findings.filter((finding) => finding.line === 2).map((finding) => finding.id), ["auth.bearer", "jwt"]);
  assert.ok(PATTERNS.every((pattern) => pattern.regex.lastIndex === 0 && (!pattern.nearRegex || pattern.nearRegex.lastIndex === 0)));
  for (const span of ["a", "abc", AWS, EMAIL]) assert.equal(maskPreview(span), "<MASKED>");
});

test("byte cap fails closed before normalization, including UTF-8 bytes", () => {
  const oversized = scan("éé", { maxBytes: 3, repoVisibility: "private" });
  assert.equal(oversized.oversize, true);
  assert.deepEqual(oversized.counts, { HIGH: 1, MEDIUM: 0, LOW: 0, WARN: 0 });
  assert.equal(oversized.findings[0].id, "engine.input_too_large");
  assert.equal(oversized.findings[0].preview, "");
  assert.equal(exitCodeFor(oversized), 3);
  assert.equal(scan("é", { maxBytes: 2 }).oversize, false);
  assert.equal(scan("\0\0", { maxBytes: 1 }).oversize, true);
  assert.equal(scan("a".repeat(DEFAULT_MAX_BYTES + 1)).oversize, true);
});

test("invalid API options and binary text cannot disable the cap or receive clean classification", () => {
  for (const maxBytes of [NaN, Infinity, 0, -1, 1.5, "100", MAX_ALLOWED_BYTES + 1]) {
    assert.throws(() => scan("ok", { maxBytes }), TypeError);
  }
  for (const options of [null, [], { repoVisibility: "PUBLIC" }, { benignExamples: [1] }, { benignExamples: [""] }, { selfEmail: EMAIL }, { allowlist: [AWS] }]) {
    assert.throws(() => scan("ok", options), TypeError);
  }
  for (const input of ["\0", "abc\x01", "\x1B[0m", "\x7F", "\u0080"]) assert.throws(() => scan(input), TypeError);
  assert.throws(() => scan(Buffer.from("ok")), TypeError);
  assert.equal(exitCodeFor(scan("plain\ttext\r\n")), 0);
});

test("targeted pure redaction changes only selected free-prose PII, no diff, then rescan", () => {
  const input = `reach ${EMAIL} or +14155550123\nssn 123-45-6789 card 4111111111111111`;
  const selected = Object.freeze(["pii.email", "pii.phone.e164", "pii.ssn", "pii.cc"]);
  const result = applyRedactions(input, selected);
  assert.equal(result.body, "reach <REDACTED-EMAIL> or <REDACTED-PHONE>\nssn <REDACTED-SSN> card <REDACTED-CC>");
  assert.equal(result.redacted.length, 4);
  assert.deepEqual(result.skipped, []);
  assert.equal(Object.hasOwn(result, "diff"), false);
  assert.deepEqual(scan(result.body).findings, []);
  assert.deepEqual(applyRedactions(result.body, selected), { body: result.body, redacted: [], skipped: [] });
  assert.equal(selected.length, 4);
  assert.equal(input.includes(EMAIL), true);
  assert.equal(applyRedactions(`${EMAIL} ${AWS}`, ["pii.email"]).body, `<REDACTED-EMAIL> ${AWS}`);
});

test("redaction uses mapped original spans for Unicode, entities, repeated and capture-prefixed values", () => {
  const unicode = "contact ａｌｉｃｅ＠ｃｏｒｐ．ｉｏ and ali​ce@corp.io";
  assert.equal(applyRedactions(unicode, ["pii.email"]).body, "contact <REDACTED-EMAIL> and <REDACTED-EMAIL>");
  assert.equal(applyRedactions("reach ali&#99;e&#64;corp.io", ["pii.email"]).body, "reach <REDACTED-EMAIL>");
  assert.equal(applyRedactions("a@x.io and a@x.io and b@y.io", ["pii.email"]).body,
    "<REDACTED-EMAIL> and <REDACTED-EMAIL> and <REDACTED-EMAIL>");
});

for (const input of [
  `see [profile](https://x.io/u/${EMAIL})`,
  `{"contact": "please reach ${EMAIL} now"}`,
  `\`\`\`json\n${EMAIL}\n\`\`\``,
  `~~~tool-output\n${EMAIL}\n~~~`,
  `<a href="mailto:${EMAIL}">contact</a>`,
  `postgres://user:${EMAIL}/app`,
]) {
  test("structured or overlapping PII requires manual redaction; skipped findings masked", () => {
    const result = applyRedactions(input, ["pii.email"]);
    assert.equal(result.body, input);
    assert.deepEqual(result.redacted, []);
    assert.ok(result.skipped.some((finding) => finding.id === "pii.email"));
    assert.equal(JSON.stringify(result.skipped).includes(EMAIL), false);
  });
}

test("non-PII/marker-only/oversize redaction is never offered as successful", () => {
  const pem = "-----BEGIN PRIVATE KEY-----\nfixture-body-not-a-key\n-----END PRIVATE KEY-----";
  for (const [input, selected] of [[AWS, ["aws.access_key"]], [pem, ["pem.private_key"]], ["db1.corp", ["internal.hostname"]]]) {
    const result = applyRedactions(input, selected);
    assert.equal(result.body, input);
    assert.deepEqual(result.redacted, []);
    assert.ok(result.skipped.length > 0);
  }
  const oversized = applyRedactions(EMAIL, ["pii.email"], { maxBytes: 1 });
  assert.equal(oversized.skipped[0].id, "engine.input_too_large");
  assert.throws(() => applyRedactions(EMAIL, ["unknown.id"]), TypeError);
  assert.throws(() => applyRedactions(EMAIL, "pii.email"), TypeError);
});

function invoke(args = [], input = "") {
  return spawnSync(process.execPath, [CLI, ...args], { input, encoding: "utf8", timeout: 10000 });
}

function capture() {
  let out = "";
  let err = "";
  return { stdout: { write: (text) => { out += text; } }, stderr: { write: (text) => { err += text; } },
    output: () => ({ out, err }) };
}

test("CLI stdin JSON and human modes emit masked locations only and correct tiers", () => {
  const raw = `${AWS}\n${EMAIL}\nAuthorization: Bearer ${ENTROPY}`;
  for (const args of [[], ["--json"], ["--json", "--repo-visibility", "public"]]) {
    const result = invoke(args, raw);
    assert.equal(result.status, 3);
    assert.equal(result.stderr, "");
    for (const secret of [AWS, EMAIL, ENTROPY]) assert.equal((result.stdout + result.stderr).includes(secret), false);
    assert.ok(result.stdout.includes("<MASKED>"));
    if (args.includes("--json")) {
      const output = JSON.parse(result.stdout);
      assert.equal(output.counts.HIGH, 1);
      assert.equal(output.findings[0].line, 1);
      assert.equal(output.findings[0].col, 1);
      assert.equal(output.repoVisibility, args.includes("public") ? "public" : "unknown");
      assert.equal(Object.hasOwn(output, "body"), false);
    }
  }
  assert.equal(invoke(["--json"], EMAIL).status, 2);
  const bom = invoke(["--json"], `﻿${AWS}`);
  assert.equal(bom.status, 3);
  assert.equal(JSON.parse(bom.stdout).findings[0].col, 2);
  assert.equal(invoke(["--json"], "TODO(owner)").status, 0);
  assert.equal(invoke(["--json"], "").status, 0);
});

const BAD_ARGS = [
  ["--wat"], ["install-prepush-hook"], ["uninstall-prepush-hook"], ["--allowlist", "file"],
  ["--self-email", EMAIL], ["--repo-public-emails", "file"], ["--auto-redact", "pii.email"],
  ["--json=true"], ["--json", "--json"], ["--json", AWS], ["--from-file"],
  ["--from-file", "--json"], ["--from-file", ""], ["--from-file", "x", "--from-file", "y"],
  ["--repo-visibility"], ["--repo-visibility", "PUBLIC"], ["--repo-visibility", AWS],
  ["--max-bytes"], ["--max-bytes", "0"], ["--max-bytes", "-1"], ["--max-bytes", "1.2"],
  ["--max-bytes", "NaN"], ["--max-bytes", "Infinity"], ["--max-bytes", "12abc"],
  ["--max-bytes", "1e3"], ["--max-bytes", " 10"], ["--max-bytes", "0x10"],
  ["--max-bytes", String(MAX_ALLOWED_BYTES + 1)], ["--max-bytes", "9".repeat(100)],
];
for (const args of BAD_ARGS) {
  test(`invalid CLI arguments are rejected without echoes: ${args[0]} (${args.length})`, () => {
    assert.throws(() => parseArgs(args), TypeError);
    const result = invoke(args, `${AWS} ${EMAIL}`);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.ok(result.stderr.includes("invalid arguments"));
    assert.equal(result.stderr.includes(AWS), false);
    assert.equal(result.stderr.includes(EMAIL), false);
  });
}

test("invalid options are checked before consuming stdin or opening a path", async () => {
  const output = capture();
  let reads = 0;
  const stdin = { [Symbol.asyncIterator]() { reads += 1; throw new Error(`must not read ${AWS}`); } };
  const code = await runCli(["--from-file", AWS, "--invalid"], { stdin, ...output });
  assert.equal(code, 1);
  assert.equal(reads, 0);
  assert.equal(output.output().out, "");
  assert.ok(output.output().err.includes("invalid arguments"));
  assert.equal(output.output().err.includes(AWS), false);
  assert.deepEqual(parseArgs(["--max-bytes", "1", "--repo-visibility", "private", "--json"]),
    { json: true, repoVisibility: "private", maxBytes: 1 });
  assert.equal(parseArgs(["--max-bytes", String(MAX_ALLOWED_BYTES)]).maxBytes, MAX_ALLOWED_BYTES);
});

test("CLI explicit files, missing paths, directory failures and UTF-8/binary rejection", (context) => {
  // Fixture files stay under this test directory, never inspect the user's home.
  const directory = mkdtempSync(join(HERE, ".content-guard-fixtures-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const file = join(directory, "publication.txt");
  writeFileSync(file, `${AWS}\n${EMAIL}`);
  const result = invoke(["--from-file", file, "--json"], "unscanned ignored stdin");
  assert.equal(result.status, 3);
  assert.equal(result.stderr, "");
  assert.equal(result.stdout.includes(AWS), false);
  assert.equal(JSON.parse(result.stdout).counts.MEDIUM, 1);
  const missing = invoke(["--from-file", join(directory, `${PAT}.txt`), "--json"]);
  assert.equal(missing.status, 1);
  assert.equal(missing.stdout, "");
  assert.equal(missing.stderr.includes(PAT), false);
  assert.equal(missing.stderr.includes(directory), false);
  assert.equal(invoke(["--from-file", directory]).status, 1);
  for (const bytes of [Buffer.from([0xFF, 0xFE]), Buffer.from("abc\0def")]) {
    writeFileSync(file, bytes);
    const unsupported = invoke(["--from-file", file, "--json"]);
    assert.equal(unsupported.status, 1);
    assert.equal(unsupported.stdout, "");
    assert.equal(invoke(["--json"], bytes).status, 1);
  }
});

test("CLI file and stdin caps fail closed with masked-only synthetic HIGH", (context) => {
  const directory = mkdtempSync(join(HERE, ".content-guard-fixtures-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const file = join(directory, "publication.txt");
  writeFileSync(file, `${AWS} ${EMAIL}`);
  for (const result of [invoke(["--from-file", file, "--json", "--max-bytes", "1"]),
    invoke(["--json", "--max-bytes", "1"], `${AWS} ${EMAIL}`)]) {
    assert.equal(result.status, 3);
    const output = JSON.parse(result.stdout);
    assert.equal(output.oversize, true);
    assert.equal(output.findings[0].id, "engine.input_too_large");
    assert.equal(output.findings[0].preview, "");
    assert.equal((result.stdout + result.stderr).includes(AWS), false);
    assert.equal((result.stdout + result.stderr).includes(EMAIL), false);
  }
  assert.equal(invoke(["--json", "--max-bytes", "2"], "é").status, 0);
  assert.equal(invoke(["--json", "--max-bytes", "1"], "é").status, 3);
});

test("stdin split UTF-8 and read failures remain deterministic and content-free", async () => {
  const output = capture();
  const bytes = Buffer.from("é");
  const code = await runCli(["--json", "--max-bytes", "2"], {
    stdin: Readable.from([bytes.subarray(0, 1), bytes.subarray(1)]), ...output,
  });
  assert.equal(code, 0);
  assert.equal(JSON.parse(output.output().out).oversize, false);
  const failed = capture();
  const stdin = { async *[Symbol.asyncIterator]() { throw new Error(`read failed ${AWS} ${EMAIL}`); } };
  assert.equal(await runCli(["--json"], { stdin, ...failed }), 1);
  assert.equal(failed.output().out, "");
  assert.equal(failed.output().err.includes(AWS), false);
  assert.equal(failed.output().err.includes(EMAIL), false);
});

test("CLI has no body/diff, allowlist or implicit runtime-host integrations", () => {
  const source = readFileSync(CLI, "utf8");
  assert.equal(source.includes("applyRedactions"), false);
  assert.equal(/from ["'](?:node:)?(?:child_process|os|https?|net)["']/.test(source), false);
  assert.equal(/homedir\(|process\.env|\.git|git config|hooksPath|fetch\(/.test(source), false);
  assert.equal(invoke(["--auto-redact", "pii.email"], `${AWS} ${EMAIL}`).stdout, "");
});
