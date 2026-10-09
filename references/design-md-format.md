# Shared DESIGN.md format and file helper

This adapter ports the pure `lib/design-md.ts`, `bin/gstack-design-md.ts`, and the design-consultation Phase 6 template from gstack revision `92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4`. The open DESIGN.md format is derived from Google LLC's Apache-2.0 `google-labs-code/design.md` specification. See the plugin's third-party notices and licenses.

## Locate the helper; no runtime installation

Resolve `<plugin-root>` from the actual loaded skill file: for `<plugin-root>/skills/<skill>/SKILL.md`, it is the directory containing `skills`, `scripts`, `references`, and `assets`. Do not assume the current project is the plugin, a gstack installation exists, or a Claude-specific environment variable exists in Codex. A verified `CLAUDE_PLUGIN_ROOT` may supply that same path in Claude Code. Use an absolute path and quote paths with spaces.

Node.js 18+ is sufficient. The helper imports an unchanged, locally bundled js-yaml 4.2.0 ESM parser, with its MIT license, from `scripts/vendor/js-yaml`. No Bun, package installation, network access, model, browser, or server is required. Parsing uses js-yaml's safe YAML 1.2 core schema: block/flow mappings and sequences, quoted scalars, block scalars, anchors and aliases are real YAML, not a hand-written front-matter subset. Executable/custom tags and duplicate mapping keys are rejected. YAML 1.1 merge-key and timestamp extensions are not enabled.

```sh
node "<plugin-root>/scripts/design-md.mjs" check "<project-root>/DESIGN.md"
node "<plugin-root>/scripts/design-md.mjs" tokens "<project-root>/DESIGN.md"
node "<plugin-root>/scripts/design-md.mjs" convert "<project-root>/DESIGN.md"
# Only after explicit approval to replace this exact file:
node "<plugin-root>/scripts/design-md.mjs" convert "<project-root>/DESIGN.md" --write
# Only after explicit approval to persist this exact format choice:
node "<plugin-root>/scripts/design-md.mjs" mark legacy-keep "<project-root>/DESIGN.md"
```

Omitting the file means `DESIGN.md` in the current working directory. `check`, `tokens`, and `convert` without `--write` are read-only. Redirection of preview stdout to a project file is still a write and requires authorization; do not disguise it as a preview. Symlinked DESIGN.md files are resolved to their targets; writes leave the symlink intact.

## Format detection and sentinels

`check` exits 0 and prints `DESIGN_MD_FORMAT: spec|legacy|unknown|missing`, a `DESIGN_MD_REASON: ...` line when the verdict has a reason, and `DESIGN_MD_MARKER: spec|legacy-keep|none`.

- **spec:** a parsed YAML mapping in front matter has `name` or at least one of the five token groups. This is shape detection, not a claim that the design is complete or every token is valid. Name-only front matter is recognized.
- **legacy:** no front matter, with at least two of gstack's legacy headings (`Product Context`, `Aesthetic Direction`, `Color`, `Spacing`, `Decisions Log`). A single heading is insufficient.
- **unknown:** malformed/non-mapping or unclosed front matter, front matter with no recognized groups or name, no recognizable shape, or ambiguous legacy identity headings alongside spec front matter. An unclosed YAML opener is not legacy merely because legacy headings appear later. A clear Markdown title after a leading horizontal rule, without intervening YAML mapping/marker evidence, still retains its Markdown meaning. Preserve the file; report the reason, do not guess or treat it as empty.
- **missing:** only a genuinely absent file (`ENOENT`). Permission failures, directory reads, symlink loops, and other I/O failures are errors, never `missing`.

Markers persist an approved choice; they do not override detection. Spec files open with `---` on line 1 and `# gstack: design-md-format=spec` on line 2. Kept legacy files put `<!-- gstack: design-md-format=legacy-keep -->` on line 1. Keep these compatibility markers even though the tool is a standalone adapter.

`mark` exits 0 after persisting the choice, 1 for a missing file, or 2 with `DESIGN_MD_CONVERT_REFUSED` when the choice contradicts the file's format or arguments are invalid. Its marker splice preserves the BOM, CRLF/LF (including mixed line endings), blank lines, and all other bytes. Marking is a document edit, not a read-only probe. Do not mark an unknown file `legacy-keep` simply to suppress questions.

Any unexpected I/O/runtime failure exits 3 with `DESIGN_MD_INTERNAL_ERROR`. Report it and stop rather than silently treating the document as missing or retrying writes. Diagnostics give safe I/O codes or YAML line/column locations, not raw exception messages that might echo paths, source excerpts, tags, or credentials. Invalid YAML is instead an `unknown` verdict with a reason, not a runtime failure. `DESIGN_MD_EDIT_REFUSED` identifies a refused unsafe text edit.

## Tokens and sections

All normative tokens belong in exactly five groups: `colors`, `typography`, `rounded`, `spacing`, `components`. `name` and `description` are metadata. `tokens` returns JSON with `file`, `format`, `tokens`, and `errors`. The five groups flatten to dotted paths (for example `typography.body.fontFamily`); scalar numbers and booleans stringify, and null/array leaves are skipped. Exact `{path}` references resolve across groups to primitives, with a maximum of eight reference hops. Group references, self references, missing targets, reference cycles, and cyclic YAML aliases produce `DESIGN_MD_TOKEN_REF_INVALID` errors in both JSON and stderr; invalid entries are omitted. Exit 0 does not mean `errors` is empty. Read and disclose errors; do not invent fallback values.

The eight canonical prose sections, in order, are:

1. Overview
2. Colors
3. Typography
4. Layout
5. Elevation & Depth
6. Shapes
7. Components
8. Do's and Don'ts

Aliases such as `Brand & Style`, `Layout & Spacing`, and `Elevation` map to canonical headings for spec rendering. Extra sections follow, including `Motion`, `Decisions Log`, and project-specific sections. Headings inside backtick or tilde code fences are not section boundaries. A legacy or unknown document keeps its existing heading order when rendered; never rewrite it to spec order behind the user's back. The pure module exposes parsing, detection, block YAML emission, rendering, section upsert/splice, marker insertion, token flattening, legacy conversion, and spec skeleton helpers; it performs no file I/O and does not mutate input documents.

Use `assets/design-system-spec-template.md` only as a scaffold for an approved new/fresh/converted design. Replace placeholders with approved real values. Omit invented component entries and unverified font families; explain pending font roles in prose. Keep rationale/use in the body without duplicating normative token values.

## Conversion is a proposal until explicitly written

`convert` accepts only detected legacy files. It derives typography roles, hex colors (including semantic colors), spacing scales, and border radii; folds Product Context and Aesthetic Direction into Overview; preserves the title/intro preamble and remaining prose, Motion, Decisions Log, and other extra sections. Typography, Color, Spacing, and Layout prose survive in their corresponding canonical sections. It does not infer missing tokens.

By default conversion prints the proposed complete spec document to stdout only: no project write, marker persistence, backup, or temp file. `--write` creates `<resolved-file>.legacy.bak` with exclusive creation, then replaces the original with a same-directory temporary file and rename. An existing backup is never overwritten: conversion refuses and leaves both files unchanged. Do not delete or rename an old backup without separate permission. On an actual write failure, report the error; a successfully created backup may remain for recovery.

Ambiguous documents, repeated consumed headings, Color/Colors collisions, canonical-section collisions that would drop prose, and unclosed YAML/code fences are refused with `DESIGN_MD_CONVERT_REFUSED`, exit 2, and no document change. Non-legacy input is exit 1. Do not use conversion as a repair for unknown or malformed YAML. A converted render can be parsed and rendered again stably.

## Shared authorization contract

**Review is read-only by default.** Design review may inspect the document and tokens and propose corrections. It must not automatically convert, mark, write DESIGN.md, write agent instructions, or normalize a kept file. A request to fix application UI is not permission to replace the design-system document. Ask separately for any exact document/instruction edits.

**Consultation keeps format decisions pending until the final write approval.** If either DESIGN.md or design-system.md exists, ask Update / Start fresh / Cancel first. DESIGN.md is authoritative when both exist. A lone design-system.md provides context but stays untouched; do not migrate it implicitly. Cancellation ends before probes or writes.

For an Update of unmarked legacy DESIGN.md, ask once whether to convert or keep legacy; retain the answer as a pending decision. A preview and a remembered answer do not authorize `--write` or `mark`. Preserve unknown format and disclose it. New/fresh/converted proposals use spec shape. A kept legacy Update retains its own shape and only persists `legacy-keep` with final authorization. Back up the prior file before an approved fresh replacement, without overwriting an existing backup.

Before writing, show the complete proposed DESIGN.md, each token's source (approved mockup extraction, approved HTML preview CSS, or approved Phase 3 fallback), pending fonts, retained decisions, and every agent-selected default. Show the **exact** proposed CLAUDE.md or other instruction-file guidance separately. Q-final must obtain explicit permission for the document write and, independently, for each instruction-file edit; approval for DESIGN.md alone does not authorize CLAUDE.md/AGENTS.md changes or their creation. When instruction guidance is approved, limit it to the shown guidance, not runtime/configuration changes.

Q-final routes Approve / Revise / Start over. Wait for the answer. Revise and Start over do not touch project files. Prior approval is reusable only for these exact writes and permissions; any later token, font, direction, or product-brief change invalidates it. Update the proposal, reverify affected fonts/preview, and confirm again. Carry the approved format choice and Q-final record through implementation; do not forget them after preview or font checking.

In plan mode, save `## Proposed DESIGN.md` in the authorized plan only; do not write the actual DESIGN.md, backup, marker, or project instruction file. Implementation still honors the exact recorded approval and applicable write permissions. Outside plan mode, perform only the approved writes, then `check` and `tokens`: require spec for new/fresh/converted/spec files, legacy plus `legacy-keep` for the kept-legacy path, or the explicitly disclosed unknown format for preserved unknown files. Never convert a kept document merely to make validation say spec.
