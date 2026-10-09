// Adapted from gstack/test/design-md.test.ts at
// 92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4; independent Node/temp-fixture tests.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  parseDesignMd, detectFormat, renderDesignMd, upsertSection, convertLegacy,
  tokensFlat, emitYamlBlock, specSkeleton, spliceSection, insertMarker,
  DesignMdEditRefused, CANONICAL_SECTIONS, TOKEN_GROUPS,
} from '../scripts/lib/design-md.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BIN = path.join(ROOT, 'scripts', 'design-md.mjs');
const SPEC = `---
# gstack: design-md-format=spec
name: Heritage
colors:
  primary: "#1A1C1E"
  accent: "#B8422E"
  cta: "{colors.accent}"
typography:
  display:
    fontFamily: Public Sans
    fontSize: 3rem
rounded:
  md: 8px
spacing:
  md: 16px
components:
  button-primary:
    backgroundColor: "{colors.cta}"
    textColor: "{colors.primary}"
---

# Heritage

## Overview

Architectural minimalism.

## Colors

Ink and clay.

## Typography

Public Sans everywhere.

## Motion

One authored moment.

## Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-09-08 | spec format | portable |
`;
// Representative content from the upstream legacy fixture, kept inline so
// tests need neither gstack nor business-project files.
const LEGACY = `# Design System — gstack

Intro paragraph retained.

## Product Context
- **What this is:** Community website for gstack

## Aesthetic Direction
- **Direction:** Industrial/Utilitarian

## Typography
- **Display/Hero:** Satoshi (Black 900 / Bold 700) — distinctive
- **Body:** DM Sans (Regular 400 / Medium 500) — readable
- **UI/Labels:** DM Sans (same as body)
- **Data/Tables:** JetBrains Mono (Regular 400) — tabular
- **Code:** JetBrains Mono

## Color
- **Approach:** Restrained
- **Primary (dark mode):** amber-500 #F59E0B
- **Primary (light mode):** amber-600 #D97706
- **Semantic:** success #22C55E, warning #F59E0B, error #EF4444
- **Dark mode:** Near-black base (#0C0C0C)

## Spacing
- **Scale:** 2xs(2px) xs(4px) md(16px) lg(2rem)

## Layout
- **Border radius:** sm:4px, md:8px, lg:12px, full:9999px

## Motion
- **Approach:** Minimal-functional

## Grain Texture
Materiality that must survive.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-21 | Grain texture | Keep history |
`;

function run(args, cwd) {
  const result = spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: 'utf8', timeout: 30_000 });
  assert.ifError(result.error);
  return { code: result.status, out: result.stdout, err: result.stderr };
}

function fixture(callback) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'matt-plus-design-md-'));
  try { return callback(dir, path.join(dir, 'DESIGN.md')); }
  finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

function headings(text) {
  return [...text.matchAll(/^## (.+)$/gm)].map(match => match[1]);
}

function freezeDoc(doc) {
  doc.sections.forEach(Object.freeze);
  Object.freeze(doc.sections);
  return Object.freeze(doc);
}

test('spec/legacy/unknown/missing detection and format markers', () => {
  const doc = parseDesignMd(SPEC);
  assert.equal(doc.marker, 'spec');
  assert.equal(doc.frontmatter.name, 'Heritage');
  assert.match(doc.frontmatterText, /primary: "#1A1C1E"/);
  assert.equal(doc.preamble, '# Heritage');
  assert.deepEqual(detectFormat(doc), { format: 'spec', code: 'spec' });
  assert.deepEqual(detectFormat(parseDesignMd(LEGACY)), { format: 'legacy', code: 'legacy' });
  assert.deepEqual(detectFormat(null), { format: 'missing', code: 'missing' });
  assert.equal(detectFormat(parseDesignMd('## Product Context\n\nx\n')).format, 'unknown');
  assert.equal(detectFormat(parseDesignMd('---\nname: X\n---\n')).format, 'spec');
  assert.equal(detectFormat(parseDesignMd('---\nfoo: 1\n---\n')).code, 'no-token-groups');
  assert.equal(detectFormat(parseDesignMd('# Just prose\n')).code, 'no-shape');
  const marked = parseDesignMd(insertMarker(LEGACY, 'legacy-keep'));
  assert.equal(marked.marker, 'legacy-keep');
  assert.equal(detectFormat(marked).format, 'legacy');
});

test('malformed/nonmapping/tagged/duplicate-key YAML is unknown, not fake spec', () => {
  for (const yaml of ['colors: [unclosed', '[a, b]', 'hello', 'colors: !!js/function "function() {}"', 'name: A\nname: B']) {
    const doc = parseDesignMd(`---\n${yaml}\n---\n\n## Overview\n\nx\n`);
    assert.equal(doc.frontmatter, null, yaml);
    assert.equal(detectFormat(doc).code, 'frontmatter-unparsable', yaml);
    assert.match(detectFormat(doc).reason, /front matter does not parse/);
  }
});

test('full local YAML parser handles block scalars, flow mappings, aliases and escapes', () => {
  const doc = parseDesignMd(`---\nname: "A\\u0020B"\ndescription: >-\n  First line\n  second line\ncolors: {primary: "#abc", accent: "{colors.primary}"}\ntypography: &type\n  body:\n    fontFamily: 'Public Sans'\ncomponents:\n  card: *type\nspacing:\n  md: 16\n  list: [4, 8]\n---\n\n## Overview\n\nx\n`);
  assert.equal(detectFormat(doc).format, 'spec');
  assert.equal(doc.frontmatter.name, 'A B');
  assert.equal(doc.frontmatter.description, 'First line second line');
  assert.equal(doc.frontmatter.components.card.body.fontFamily, 'Public Sans');
  assert.equal(tokensFlat(doc.frontmatter).tokens['colors.accent'], '#abc');
  assert.equal(tokensFlat(doc.frontmatter).tokens['spacing.md'], '16');
  assert.equal(tokensFlat(doc.frontmatter).tokens['spacing.list'], undefined);
});

test('BOM, CRLF, closing fence at EOF, trailing fence spaces and fenced headings parse', () => {
  assert.deepEqual(parseDesignMd('﻿' + SPEC.replace(/\n/g, '\r\n')).frontmatter, parseDesignMd(SPEC).frontmatter);
  assert.equal(parseDesignMd('---\nname: x\n---').frontmatter.name, 'x');
  assert.equal(parseDesignMd('---\nname: x\n---  \n').frontmatter.name, 'x');
  assert.equal(detectFormat(parseDesignMd('---\nname: x\n')).format, 'unknown');
  assert.equal(parseDesignMd('---\nname: x\n').frontmatterError, 'unclosed front matter fence');
  assert.deepEqual(parseDesignMd('## Overview\n\n~~~\n## Fake\n```\nstill fenced\n~~~\n\n## Colors\n\nc\n').sections.map(section => section.heading), ['Overview', 'Colors']);
});

test('ambiguous spec plus legacy identity headings never converts', () => {
  const ambiguous = '---\nname: X\n---\n\n## Product Context\n\np\n\n## Aesthetic Direction\n\na\n';
  assert.equal(detectFormat(parseDesignMd(ambiguous)).code, 'ambiguous');
  assert.throws(() => convertLegacy(parseDesignMd(ambiguous)), DesignMdEditRefused);
  fixture((dir, file) => {
    fs.writeFileSync(file, ambiguous);
    const result = run(['convert', '--write'], dir);
    assert.equal(result.code, 2);
    assert.match(result.err, /DESIGN_MD_CONVERT_REFUSED: ambiguous/);
    assert.equal(fs.readFileSync(file, 'utf8'), ambiguous);
    assert.equal(fs.existsSync(file + '.legacy.bak'), false);
  });
});

test('unclosed YAML opener is unknown and cannot convert despite legacy headings', () => {
  const unclosed = '---\n# comment\nname: private\ncolors: {primary: "#fff"}\n\n## Product Context\n\np\n\n## Aesthetic Direction\n\na\n';
  const doc = parseDesignMd(unclosed);
  assert.equal(detectFormat(doc).format, 'unknown');
  assert.match(detectFormat(doc).reason, /unclosed front matter fence/);
  assert.throws(() => convertLegacy(doc), /unclosed front matter fence/);
  fixture((dir, file) => {
    fs.writeFileSync(file, unclosed);
    const result = run(['convert', '--write'], dir);
    assert.equal(result.code, 2);
    assert.match(result.err, /DESIGN_MD_CONVERT_REFUSED: unclosed front matter fence/);
    assert.equal(fs.readFileSync(file, 'utf8'), unclosed);
    assert.equal(fs.existsSync(file + '.legacy.bak'), false);
  });
  const horizontalRule = '---\n\n# Design\n\n## Product Context\n\np\n\n## Aesthetic Direction\n\na\n';
  assert.equal(detectFormat(parseDesignMd(horizontalRule)).format, 'legacy');
});

test('YAML and I/O diagnostic output does not echo secret source values or paths', () => fixture((dir, file) => {
  const secret = 'SECRET_EXAMPLE_not_a_real_credential';
  fs.writeFileSync(file, `---\nname: X\ncolors: !${secret} anything\n---\n`);
  const check = run(['check'], dir);
  assert.equal(check.code, 0);
  assert.match(check.out, /DESIGN_MD_FORMAT: unknown/);
  assert.match(check.out, /invalid YAML syntax or unsupported tag at line/);
  assert.ok(!check.out.includes(secret));
  assert.ok(!check.err.includes(secret));
  const privatePath = path.join(dir, secret);
  fs.mkdirSync(privatePath);
  const failure = run(['check', privatePath], dir);
  assert.equal(failure.code, 3);
  assert.match(failure.err, /DESIGN_MD_INTERNAL_ERROR: EISDIR:/);
  assert.ok(!failure.err.includes(secret));
}));

test('canonical order, aliases, extra sections and render roundtrip', () => {
  const shuffled = '---\nname: X\n---\n\n## Typography\n\nt\n\n## Elevation\n\ne\n\n## Brand & Style\n\no\n\n## Custom\n\nx\n';
  const rendered = renderDesignMd(parseDesignMd(shuffled));
  assert.deepEqual(headings(rendered), ['Overview', 'Typography', 'Elevation & Depth', 'Custom']);
  assert.equal(renderDesignMd(parseDesignMd(rendered)), rendered);
  assert.deepEqual(headings(renderDesignMd(parseDesignMd(LEGACY))), headings(LEGACY));
  const plain = '## Elevation\n\ne\n\n## Brand & Style\n\no\n';
  assert.deepEqual(headings(renderDesignMd(parseDesignMd(plain))), ['Elevation', 'Brand & Style']);
});

test('section upsert/skeleton returns new documents and leaves input untouched', () => {
  const doc = freezeDoc(parseDesignMd(SPEC));
  const snapshot = JSON.stringify(doc);
  const next = upsertSection(upsertSection(doc, 'Colors', 'Ink only.'), 'Extracted Design Language', 'Approved CSS');
  assert.equal(JSON.stringify(doc), snapshot);
  assert.notEqual(next, doc);
  assert.equal(next.frontmatterText, doc.frontmatterText);
  assert.match(renderDesignMd(next), /## Colors\n\nInk only\./);
  assert.equal(next.sections.at(-1).heading, 'Extracted Design Language');
  const skeleton = specSkeleton('New', { colors: { primary: '#fff' } }, [{ heading: 'Overview', body: 'Approved' }]);
  assert.equal(detectFormat(skeleton).format, 'spec');
  assert.equal(skeleton.marker, 'spec');
});

test('spliceSection changes a section body, respects fences and preserves BOM/CRLF', () => {
  const text = '﻿' + SPEC.replace(/\n/g, '\r\n');
  const out = spliceSection(text, 'Colors', 'Ink only.');
  assert.equal(out, text.replace('## Colors\r\n\r\nInk and clay.\r\n', '## Colors\r\n\r\nInk only.\r\n'));
  const appended = spliceSection(SPEC, 'Extracted Design Language', 'Approved CSS');
  assert.ok(appended.startsWith(SPEC.trimEnd()));
  assert.equal(spliceSection(appended, 'Extracted Design Language', 'Second').split('## Extracted Design Language').length, 2);
  const unclosed = '## A\n\n```md\n## B\n';
  assert.throws(() => spliceSection(unclosed, 'A', 'x'), /DESIGN_MD_EDIT_REFUSED: unclosed/);
});

test('marker splice keeps BOM, mixed EOLs, blank runs, comments and all nonmarker bytes', () => {
  const text = '﻿---\r\nname: X\ncolors: {a: "#fff"}\r\n---  \n\n## Overview\r\n\ntext  \n';
  const expected = text.replace('---\r\n', '---\r\n# gstack: design-md-format=spec\r\n');
  assert.equal(insertMarker(text, 'spec'), expected);
  assert.equal(insertMarker(expected, 'spec'), expected);
  assert.equal(insertMarker(expected, 'legacy-keep'), expected.replace('format=spec', 'format=legacy-keep'));
  const displaced = '---\nname: X\r\n# gstack: design-md-format=spec\r\n\n---\n';
  assert.equal(insertMarker(displaced, 'spec'), '---\n# gstack: design-md-format=spec\nname: X\r\n\n---\n');
  const horizontalRule = '---\n\n# Design\n\n## Product Context\n\np\n\n## Aesthetic Direction\n\na\n';
  assert.equal(insertMarker(horizontalRule, 'legacy-keep'), '<!-- gstack: design-md-format=legacy-keep -->\n' + horizontalRule);
});

test('all five token groups flatten; numeric/bool stringify, nonnormative metadata ignored', () => {
  const flat = tokensFlat(parseDesignMd(SPEC).frontmatter);
  assert.deepEqual(flat.errors, []);
  assert.equal(flat.tokens['colors.cta'], '#B8422E');
  assert.equal(flat.tokens['components.button-primary.backgroundColor'], '#B8422E');
  assert.equal(flat.tokens['components.button-primary.textColor'], '#1A1C1E');
  assert.equal(flat.tokens['typography.display.fontSize'], '3rem');
  assert.equal(flat.tokens['rounded.md'], '8px');
  assert.ok(Object.keys(flat.tokens).every(key => TOKEN_GROUPS.some(group => key.startsWith(group + '.'))));
  assert.deepEqual(tokensFlat({ name: 'No', other: 'No', spacing: { md: 16, enabled: true, null: null, list: [1] } }).tokens, { 'spacing.md': '16', 'spacing.enabled': 'true' });
});

test('invalid references report self/group/dangling/cycles, including chained groups', () => {
  const flat = tokensFlat({ colors: { base: '#111', group: '{colors}', self: '{colors.self}', gone: '{colors.nope}', a: '{colors.b}', b: '{colors.a}', chained: '{colors.group}', prototype: '{toString}' } });
  assert.deepEqual(flat.tokens, { 'colors.base': '#111' });
  assert.equal(flat.errors.length, 7);
  assert.ok(flat.errors.every(error => error.startsWith('DESIGN_MD_TOKEN_REF_INVALID:')));
  assert.match(flat.errors.join('\n'), /self-reference/);
  assert.match(flat.errors.join('\n'), /refers to a group, not a primitive/);
  assert.match(flat.errors.join('\n'), /no such token/);
  assert.match(flat.errors.join('\n'), /reference cycle/);
  const chain = Object.fromEntries([['base', '#000'], ...Array.from({ length: 7 }, (_, index) => [`c${index + 1}`, `{colors.${index ? 'c' + index : 'base'}}`])]);
  assert.equal(tokensFlat({ colors: chain }).tokens['colors.c7'], '#000');
  const doc = parseDesignMd('---\ncolors: &cycle\n  self: *cycle\n---\n');
  assert.match(tokensFlat(doc.frontmatter).errors.join('\n'), /YAML alias cycle/);
});

test('YAML emitter roundtrips quoted scalar edges, scalars arrays and numeric shapes', () => {
  const data = { name: 'X: y', colors: { a: '#fff', b: 'amber #F59E0B', weird: 'yes', empty: '' }, typography: { body: { fontFamily: 'Foo\nBar', fontSize: '0x1F', fontWeight: '.inf', lineHeight: '0o17' } }, spacing: { md: 16 }, list: ['a', 'b'] };
  const emitted = emitYamlBlock(data);
  assert.match(emitted, /colors:\n  a: "#fff"/);
  assert.deepEqual(parseDesignMd(`---\n${emitted}\n---\n`).frontmatter, data);
  assert.throws(() => emitYamlBlock({ components: [{ a: 1 }] }), /array items must be scalars/);
  const bad = '---\ncolors: [unclosed\n---\n';
  assert.ok(renderDesignMd(parseDesignMd(bad), { emitFrontmatter: true }).includes('colors: [unclosed'));
});

test('legacy conversion retains preamble/prose/extras/history and maps each token kind', () => {
  const doc = freezeDoc(parseDesignMd(LEGACY));
  const snapshot = JSON.stringify(doc);
  const out = renderDesignMd(convertLegacy(doc), { emitFrontmatter: true });
  assert.equal(JSON.stringify(doc), snapshot);
  const parsed = parseDesignMd(out);
  assert.equal(detectFormat(parsed).format, 'spec');
  assert.equal(parsed.marker, 'spec');
  assert.equal(parsed.frontmatter.name, 'gstack');
  assert.ok(Object.keys(parsed.frontmatter).every(key => ['name', ...TOKEN_GROUPS].includes(key)));
  assert.deepEqual(headings(out), ['Overview', 'Colors', 'Typography', 'Layout', 'Motion', 'Grain Texture', 'Decisions Log']);
  for (const prose of ['Intro paragraph retained.', 'Industrial/Utilitarian', 'Materiality that must survive.', '| 2026-03-21 | Grain texture | Keep history |', '### Spacing']) assert.ok(out.includes(prose));
  const flat = tokensFlat(parsed.frontmatter);
  assert.deepEqual(flat.errors, []);
  for (const [key, value] of Object.entries({ 'typography.display.fontFamily': 'Satoshi', 'typography.body.fontFamily': 'DM Sans', 'typography.label.fontFamily': 'DM Sans', 'typography.mono.fontFamily': 'JetBrains Mono', 'typography.mono.fontFeature': 'tnum', 'colors.primary-dark-mode': '#F59E0B', 'colors.success': '#22C55E', 'spacing.2xs': '2px', 'spacing.lg': '2rem', 'rounded.full': '9999px' })) assert.equal(flat.tokens[key], value);
  assert.equal(flat.tokens['colors.semantic'], undefined);
  assert.equal(flat.tokens['colors.dark-mode'], undefined);
  assert.equal(renderDesignMd(parsed), out);
  assert.equal(convertLegacy(doc, { name: 'Custom' }).frontmatter.name, 'Custom');
});

test('duplicate consumed headings, Color/Colors collision, canonical collision, unclosed fence refuse conversion', () => {
  const cases = [LEGACY + '\n## Layout\n\nsecond\n', LEGACY + '\n## Colors\n\nsecond\n', LEGACY + '\n## Overview\n\nexisting overview\n', LEGACY + '\n```md\nunclosed\n'];
  for (const text of cases) {
    assert.throws(() => convertLegacy(parseDesignMd(text)), DesignMdEditRefused);
    fixture((dir, file) => {
      fs.writeFileSync(file, text);
      const result = run(['convert', '--write'], dir);
      assert.equal(result.code, 2, result.err);
      assert.match(result.err, /DESIGN_MD_CONVERT_REFUSED/);
      assert.equal(fs.readFileSync(file, 'utf8'), text);
      assert.equal(fs.existsSync(file + '.legacy.bak'), false);
    });
  }
});

test('CLI check returns exact sentinels and unknown reasons, missing is only absent file', () => fixture((dir, file) => {
  assert.deepEqual(run(['check'], dir), { code: 0, out: 'DESIGN_MD_FORMAT: missing\nDESIGN_MD_MARKER: none\n', err: '' });
  fs.writeFileSync(file, SPEC);
  assert.equal(run(['check'], dir).out, 'DESIGN_MD_FORMAT: spec\nDESIGN_MD_MARKER: spec\n');
  fs.writeFileSync(file, LEGACY);
  assert.equal(run(['check'], dir).out, 'DESIGN_MD_FORMAT: legacy\nDESIGN_MD_MARKER: none\n');
  fs.writeFileSync(file, '---\ncolors: [bad\n---\n');
  assert.match(run(['check'], dir).out, /DESIGN_MD_FORMAT: unknown\nDESIGN_MD_REASON: front matter does not parse:/);
  for (const args of [['check', dir], ['tokens', dir], ['convert', dir, '--write'], ['mark', 'legacy-keep', dir]]) {
    const result = run(args, dir);
    assert.equal(result.code, 3);
    assert.match(result.err, /DESIGN_MD_INTERNAL_ERROR:/);
    assert.ok(!result.out.includes('missing'));
  }
}));

test('CLI conversion preview creates nothing; --write backs up exclusively and replaces atomically', () => fixture((dir, file) => {
  fs.writeFileSync(file, LEGACY);
  const preview = run(['convert'], dir);
  assert.equal(preview.code, 0);
  assert.ok(preview.out.startsWith('---\n# gstack: design-md-format=spec\n'));
  assert.equal(fs.readFileSync(file, 'utf8'), LEGACY);
  assert.deepEqual(fs.readdirSync(dir), ['DESIGN.md']);
  const write = run(['convert', '--write'], dir);
  assert.equal(write.code, 0, write.err);
  assert.match(write.out, /DESIGN_MD_WRITTEN:/);
  assert.match(write.out, /DESIGN_MD_BACKUP:/);
  assert.equal(fs.readFileSync(file + '.legacy.bak', 'utf8'), LEGACY);
  assert.equal(fs.readFileSync(file, 'utf8'), preview.out);
  assert.ok(!fs.readdirSync(dir).some(name => name.includes('.tmp-')));
  assert.equal(run(['convert', '--write'], dir).code, 1);
  fs.writeFileSync(file, LEGACY + '\nextra\n');
  const refused = run(['convert', '--write'], dir);
  assert.equal(refused.code, 2);
  assert.match(refused.err, /DESIGN_MD_CONVERT_REFUSED: backup already exists/);
  assert.equal(fs.readFileSync(file, 'utf8'), LEGACY + '\nextra\n');
  assert.equal(fs.readFileSync(file + '.legacy.bak', 'utf8'), LEGACY);
}));

test('CLI tokens returns JSON and invalid-reference stderr without silently fabricating values', () => fixture((dir, file) => {
  assert.deepEqual(JSON.parse(run(['tokens'], dir).out).tokens, {});
  fs.writeFileSync(file, SPEC.replace('"{colors.accent}"', '"{colors}"'));
  const result = run(['tokens'], dir);
  assert.equal(result.code, 0);
  const flat = JSON.parse(result.out);
  assert.equal(flat.format, 'spec');
  assert.equal(flat.tokens['colors.primary'], '#1A1C1E');
  assert.equal(flat.tokens['colors.cta'], undefined);
  assert.match(result.err, /DESIGN_MD_TOKEN_REF_INVALID: \{colors\}/);
  assert.ok(flat.errors.length > 0);
}));

test('CLI mark preserves arbitrary original bytes, BOM and mixed EOLs, and refuses contradictions', () => fixture((dir, file) => {
  const original = Buffer.concat([Buffer.from('﻿' + LEGACY.replace('# Design System — gstack\n', '# Design System — gstack\r\n')), Buffer.from([0xff, 0x00, 0x80])]);
  fs.writeFileSync(file, original);
  assert.equal(run(['mark', 'legacy-keep'], dir).code, 0);
  const expected = Buffer.concat([original.subarray(0, 3), Buffer.from('<!-- gstack: design-md-format=legacy-keep -->\n'), original.subarray(3)]);
  assert.deepEqual(fs.readFileSync(file), expected);
  assert.equal(run(['mark', 'legacy-keep'], dir).code, 0);
  assert.deepEqual(fs.readFileSync(file), expected);
  assert.equal(run(['mark', 'spec'], dir).code, 2);
  assert.deepEqual(fs.readFileSync(file), expected);
  fs.writeFileSync(file, SPEC.replace('# gstack: design-md-format=spec\n', ''));
  assert.equal(run(['mark', 'spec'], dir).code, 0);
  assert.equal(fs.readFileSync(file, 'utf8'), SPEC);
  assert.equal(run(['mark', 'legacy-keep'], dir).code, 2);
  assert.equal(fs.readFileSync(file, 'utf8'), SPEC);
  assert.equal(run(['mark', 'spec', 'absent.md'], dir).code, 1);
}));

test('CLI rejects invalid verbs, choices, flags and surplus paths before writes', () => fixture((dir, file) => {
  fs.writeFileSync(file, LEGACY);
  for (const args of [[], ['wat'], ['mark', 'maybe'], ['check', '--write'], ['convert', '--writ'], ['convert', '--write', '--write'], ['convert', 'DESIGN.md', 'other.md', '--write']]) {
    assert.equal(run(args, dir).code, 2);
    assert.equal(fs.readFileSync(file, 'utf8'), LEGACY);
    assert.deepEqual(fs.readdirSync(dir), ['DESIGN.md']);
  }
}));

test('symlink target is edited and backed up, link stays a link', t => fixture((dir, file) => {
  const target = path.join(dir, 'actual.md');
  fs.writeFileSync(target, LEGACY);
  try { fs.symlinkSync(target, file); }
  catch (error) {
    if (error.code === 'EPERM' || error.code === 'EACCES') { t.skip('Host denies creating symlinks'); return; }
    throw error;
  }
  assert.equal(run(['mark', 'legacy-keep'], dir).code, 0);
  assert.ok(fs.lstatSync(file).isSymbolicLink());
  assert.match(fs.readFileSync(target, 'utf8'), /^<!-- gstack: design-md-format=legacy-keep -->/);
  assert.equal(run(['convert', '--write'], dir).code, 0);
  assert.ok(fs.lstatSync(file).isSymbolicLink());
  assert.ok(fs.existsSync(target + '.legacy.bak'));
  assert.equal(fs.existsSync(file + '.legacy.bak'), false);
}));

test('shipped Phase 6 scaffold is real spec YAML with five groups and eight ordered canonical sections', () => {
  const text = fs.readFileSync(path.join(ROOT, 'assets', 'design-system-spec-template.md'), 'utf8');
  const doc = parseDesignMd(text);
  assert.equal(detectFormat(doc).format, 'spec');
  assert.equal(doc.marker, 'spec');
  assert.ok(TOKEN_GROUPS.every(group => Object.hasOwn(doc.frontmatter, group)));
  assert.deepEqual(headings(text).slice(0, 8), CANONICAL_SECTIONS);
  assert.deepEqual(headings(text).slice(8), ['Motion', 'Decisions Log']);
  assert.deepEqual(tokensFlat(doc.frontmatter).errors, []);
});
