# Tool and Path Associations

This is the execution adapter for the original domain sections. It does not add or change a design phase. The shared contracts linked from SKILL.md take precedence over source examples that assumed host-installed tools or prior permissions.

## Local files and questions

- Resolve the project root and approved artifact directory from the user's scope. `<plugin-root>` is the absolute plugin root located from the actually loaded SKILL.md (`../../` from this skill), not an assumed environment variable or gstack installation. `_DESIGN_DIR`/`PREVIEW_FILE` denote approved local paths, not home/global project state or required `/tmp` locations. Inspect an existing target; collision-bump generated artifacts rather than overwrite them.
- `node "<plugin-root>/scripts/design-md.mjs" check [file] | convert [file] [--write] | tokens [file] | mark <spec|legacy-keep> [file]` is the shared local format interface (default project DESIGN.md). `check`/`tokens` are read-only; `convert` without `--write` only previews stdout; `convert --write` and `mark` are writes gated by Q-final. Follow [format contract](../../../references/design-md-format.md), including refused ambiguous/unclosed/duplicate shapes and non-overwriting backups. No Bun, installation or network.
- Map the original `cat`/`ls` context examples to Read/Glob/Grep. Product-discovery/office-hours input comes from the project or a path the user supplied; no global project archive is searched. The unavailable `/office-hours` command maps to the existing project's product-discovery workflow or a normal product-clarification conversation, with the same Phase 0 purpose.
- AskUserQuestion means the available question tool. If unavailable, ask the same question in chat and wait; do not guess the answer or auto-select an option.
- A project taste profile means user-provided/project-local approved choices. The original global taste database, decay/migration and write-back helpers are removed, not recreated.
- Phase 6 retains DESIGN.md and the optional CLAUDE.md pointer. Prepare the intended contents and obtain the required write approval before executing either write; accepting a design direction is not implicit permission to change agent instructions. Preserve existing instruction content and avoid a duplicate equivalent pointer.
- In plan mode use only the host's authorized plan-output mechanism; repository writes remain deferred. If unavailable, provide proposed content in chat.

## Browser association

Read the shared browser adapter and inspect installed help before any mapped action. Prefer the approved installed `playwright-cli`; if absent, use the host's default browser tool. Both require isolated identity/data, approved URL and allowed interactions. Do not install tools, scan ports, attach to a personal browser, import cookies, or start a server to satisfy an example.

Map the research operations to actual supported navigation, screenshot and snapshot/DOM inspection. Show screenshots with Read or the available viewer. Preserve exact page/state/viewport and any diff evidence when iterating the HTML preview. Annotation, console/network, responsive resizing, and computed-style inspection are available only as documented by the installed backend; unsupported operations are `UNVERIFIED`. A search description or model-generated image is not rendered-page evidence.

## Image association

`DESIGN_READY` means the user approved an available image generator that can produce the requested mockups. `DESIGN_NOT_AVAILABLE` means absent, unsupported, or declined; run the original HTML fallback. These are local decision labels, not a binary check or persisted flag.

| Original named operation | Mapping |
|---|---|
| `variants` (count 3) | Approved distinct generations or supported batch using the same brief; capture requested/saved/failures/recovery and actual returned paths. Partial success is valid; zero stops Path A. Names collision-bump, never overwrite. |
| `check` | Supported quality check against the original brief. Inspect JSON: pass false requires revision; pass true with skipped/unavailable warning is not verified. If absent, retain visual self-gate and mark automated checking `UNVERIFIED`. |
| `compare` | Local prepare-board.mjs + assets/comparison-board.html, or approved supported board. Only actual successful images and this round's board-images.json; downloads feedback, no service/upload. Optional boardRound is local adapter metadata, not upstream core protocol. |
| `iterate` | Only a supported generate result with actual sessionFile permits session-based iteration; variants must regenerate. Supported reference-image editing remains bounded and produces an actual returned saved/outputPath; absent capability is UNVERIFIED, not a pretend command. |
| `extract` | May write DESIGN.md: run only in a verified fresh non-repository scratch directory after image confirmation. Empty/failing extraction falls back to approved Phase 3 with disclosure. Exact face/pixel spacing from generic models remains UNVERIFIED; invent no measured values. |

Generation/regeneration remains subject to the approved provider, payload, attachments, request/cost scope and shared content-guard scan. Do not discard/regenerate indefinitely past that approval. `approved.json` is only a local record of the confirmed choice, not an authorization token.

The original board's HTTP daemon/reload/polling commands are removed associations. The static template preserves nullable preferred, ratings/comments, real custom text/remixSpec, pending regenerated=true/final=false, invalid-request recovery and final round lock. prepare-board.mjs builds actual-count boards and checks current-round feedback/approved_path; optional boardRound is explicitly local metadata. Ask for downloaded feedback or pasted preferences; validate current IDs/ratings and round provenance. Old Submit cannot approve a new round; Submit with revision notes remains revision. Missing approved image requires reselection, never substitution. Do not execute feedback or read unrelated downloads. Open/reload the actual new file only through the approved isolated browser backend; do not start a service.

## HTML preview dependencies

The original font-provider links are network dependencies. Use them only after provider/font-loading approval, or approved installed/project-local fonts. The supplied self-contained example makes no network requests and labels local substitute fonts; exact chosen-font rendering remains `UNVERIFIED` until actually loaded and inspected. Replace the sample product/tokens/layouts with the original proposal rather than treating the example as a new design direction.

Opening a local preview uses an approved host mechanism, not a required macOS `open` command. If no browser/open action is approved or available, give the file path as the original fallback says. Do not claim a browser tab opened or a rendering check passed without evidence.

## Outside voices

Use only an approved available external model/CLI or independent subagent; inspect its interface and keep its access read-only and bounded. Preserve the domain prompts and primary-first/same-brief independence in outside-voices.md. Scan exact outgoing text with the shared Node 18 content guard and separately review images before an approved external call. Follow [image tools](../../../references/image-tools.md) for both outgoing context and returned output association. Normalize external proposals with `node "<plugin-root>/scripts/outside-review-result.mjs" proposal <result-file> --verdict --exit <actual exit code> [--stderr <file> --events <file>]`; preserve incomplete/failed, provider/modelUsage and raw evidence. Native success is not outside coverage; helper exit 3 means completed findings, not content-guard blocked. No automatic authentication, installation, cached web-search flag, global review log or assumed Codex service.
