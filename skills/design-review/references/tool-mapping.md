# Tool and Path Associations

This adapts missing runtime/resource links only. Follow the shared external-actions, browser-tools and image-tools references linked from SKILL.md; do not duplicate or bypass their authorization/capability checks. Setup calibration and target-mockup updates follow gstack `54efba6dd5a6dc7f04e62106b97079279ed53b41` / `1.91.67.0`; unchanged audit resources retain their earlier source.

## Paths and questions

- `REPORT_DIR` is the user-approved local output directory, not a global project-slug/home path. Create the original screenshots and baseline files there through approved local file operations. The report schema lives in audit-methodology.md Phase 6; no separate report-template asset is required.
- AskUserQuestion is the available host question tool or the same question in chat followed by a wait. Source context/discovery shell examples map to Read/Glob/Grep.
- Resolve the actual user-approved base/head before branch-diff work. The original `git diff main...HEAD` is an example association; replace `main` with the established base. Obtain the existing app URL from the user/project configuration; common-port probing, starting a server and network access require their own approval.
- Baseline-template values are illustrative, not measured results. Replace the date/URL, all 10 category grades and findings with actual observations. Preserve an existing comparison baseline until final regression comparison is complete; write a new local artifact rather than overwriting the only previous evidence.

## Browser operations (semantic labels, not fictional executable commands)

Follow the shared browser adapter: prefer the approved installed `playwright-cli`; if absent, offer installation, then use an available testing method if the user does not install it. The shared adapter contains the checked CLI associations. No gstack browse executable or standalone project browser runner is assumed.

| Original operation | Association |
|---|---|
| Navigation/current URL | Actual supported goto/current-URL observation, rechecking redirects and scope. |
| Interactive/accessibility snapshot | Current supported snapshot/find/DOM inspection; never reuse stale element refs. |
| Annotated snapshot | Supported highlight, annotated screenshot, then hide highlight; preserve a plain baseline too. If unavailable, record annotations `UNVERIFIED`. |
| Responsive capture | Resize and capture the original required viewports: 375 mobile, 768 tablet, 1024 desktop, 1440 wide where audited. Preserve exact viewport/state for retest. |
| CSS/computed style/text/HTML | Reviewed observation-only `playwright-cli eval` function or `playwright-cli run-code` wrapper using `page.evaluate`, or the selected method's supported DOM evaluation; the original expressions in scripts/design-observations.js are browser-context code, not page-provided code or a raw runner script. |
| Clickable-div inspection | Reviewed DOM inspection of roles/attributes/styles through `playwright-cli eval` or the selected method's supported DOM evaluation. Do not invoke handlers to discover clickability. Unsupported discovery is `UNVERIFIED`. |
| Snapshot diff | Capture before/after DOM snapshots through the selected method at the same state and compare actual saved output. If no supported diff, record `UNVERIFIED`; do not promise a native `snapshot -D`. |
| Screenshot/pixel diff | Capture through the selected method and use an already-installed approved local comparator on the saved files; record comparator/settings and actual evidence. Screenshot capture alone is not a pixel diff. Unsupported comparison is `UNVERIFIED`. |
| Console/network | Actual supported console and request metadata observations through the selected method; sanitize under the shared guard. No absent-log claim implies complete coverage. |
| Performance baseline | Reviewed browser performance observations through `playwright-cli eval`, `playwright-cli run-code` or the selected method's supported interface. No fictitious `perf` command; LCP/CLS/loading metrics remain `UNVERIFIED` without actual capture, timing/method and evidence. |

The DOM resource is a browser-context IIFE. Read/review it and embed its unchanged expression as the returned value inside `playwright-cli eval`, or inside a reviewed `playwright-cli run-code` wrapper's `page.evaluate` callback. An available alternative method may use its verified browser-evaluation equivalent; if no method supports it, this DOM observation is `UNVERIFIED`. In the inspected CLI, `eval --filename` saves the **result**, not code-file input. Do not pass the raw DOM resource to `run-code --filename`; that interface expects a reviewed runner function accepting `page`.

Every screenshot must be shown with Read/the available viewer as the original requires. Before/after pairs must have comparable page/state/content, viewport, fonts, device scale and timing. Unsupported browser access prevents a completed live audit; static/source observations remain separate. Read source only for limited design-token capture in Setup calibration, Phase 8 fixes, diff-to-route association and approved outside source audits. Setup calibration is not a source-based audit; Phases 1-6 remain rendered-only, and source never substitutes for the rendered baseline's evidence.

## DESIGN.md read/export association

Resolve `<actual-plugin-root>` from the actually loaded `skills/design-review/SKILL.md`, not the project cwd or an assumed Claude environment variable. Read [shared format/helper guidance](../../../references/design-md-format.md). The bundled Node 18+ helper uses local js-yaml, with no installation or service:

```sh
node "<actual-plugin-root>/scripts/design-md.mjs" check "<project-root>/DESIGN.md"
node "<actual-plugin-root>/scripts/design-md.mjs" tokens "<project-root>/DESIGN.md"
```

Read `DESIGN_MD_FORMAT`, `DESIGN_MD_REASON` and `DESIGN_MD_MARKER`. Spec → calibrate on the flat token map; legitimate values are not findings and departures name the token. Legacy or unknown → preserve/read prose, disclose unknown reason and respect persisted format choice. `missing` → calibrate against the code tokens captured in Setup; use universal principles only when there are none. Missing is only genuine ENOENT; I/O failure/exit 3 `DESIGN_MD_INTERNAL_ERROR` is not missing, report and stop this association. `tokens` JSON `errors` and stderr `DESIGN_MD_TOKEN_REF_INVALID` must be read even with exit 0: invalid references are omitted, never invented defaults. Review is read-only: never run `convert` or `mark` automatically, nor redirect a preview into a project file. Read-only check/tokens need no conversion consent; source-fix approval is not document-write permission.

Approved new/fresh exports use [the spec template](../../../assets/design-system-spec-template.md) and full format guidance, with exact observed/approved tokens and pending data disclosed. Existing files keep their chosen format/content; any conversion, marker or instruction edit is a separate explicit document decision, not part of this audit. Validate only the approved export with check/tokens afterward.

## Optional detector and private DOM

Read [the complete detector association](detector.md) before readiness, Phase 3 scanning or Phase 9 cleanup. Its clone-based dump is a function expression, distinct from the observation IIFE above; neither is a raw project runner. Private artifacts, guard limits, actual installed scan interface, target-set hash, failure handling, re-scan and run-owned cleanup are one lifecycle. No gstack probe/install, global cache/config or hypothetical command. Missing detector coverage does not skip manual full-catalog review or allow Phases 1-6 source access.

## Fix/commit/recovery associations

The workflow stays rendered audit → fix → atomic source-fix commit → retest → classification → JS-only regression test creation/run/approved test commit (8e.5, CSS skips) → failure recovery. The original Setup clean-working-tree gate applies before any audit, including audit-only requests; do not move it into the fix loop, delete it, or bypass the original setup checks. An audit-only request stops before scoped source edits, not before setup. An approved fix does not automatically authorize stage/commit or stash/revert.

- Dirty-tree options require exact approved files/hunks and recovery details. Never stage or stash unrelated user work to force a clean tree. If not authorized, stop the workflow before the audit and let the user preserve their work.
- For each approved atomic commit, inspect the index and stage only the finding's approved changes. No unrelated staged work may enter it. Follow the shared working-branch rule and content guard.
- If commit is withheld, keep each finding's scoped change/evidence separate and mark the commit stage deferred. Deferred commit does not waive the original clean-tree gate or other setup prerequisites. Do not invent a SHA or represent an uncommitted change as committed.
- On regression, stop immediately. Execute the original `git revert HEAD` only if that exact fix commit is the actual safe target and recovery was approved. Otherwise request recovery approval; preserve user work and classify truthfully, not `reverted` before recovery happened.
- Regression-test creation/correction/commit is scoped to new test files only. Create and run the JS-behavior regression at 8e.5 after repair and classification, as in the source. Correct a proved fixture/import/test defect once; removal of an invalid newly owned test requires its own scope. Never silently delete a valid red regression: preserve the new test/evidence uncommitted and defer the unresolved bug. No existing-test or CI weakening.
- TODOS.md, DESIGN.md export, and instruction-file changes use their separate file/decision scope. Writing a report does not authorize TODO/source/instruction edits or PR publication.

## Image and outside-model associations

`DESIGN_READY` denotes an approved available generator, not a required binary. Use the source brief for target generation: reuse the captured system verbatim, with the same colors, fonts, radii and spacing scale; change layout or structure only, never introduce a new palette or typeface for a product that already has one. Unsupported/declined tools simply skip the optional target branch. Bind each finding to the actual returned existing `saved`/`outputPath`, not the requested filename; collision-free requested names do not prove a file was saved. `verify` means a supported approved target-vs-actual comparison on those actual paths, with actual result/evidence. A `pass: true` accompanied by skipped/unavailable checking is not verification. If unavailable, mark target comparison `UNVERIFIED` while retaining live retest. Never treat a generated target as proof that the implementation passed.

Outside voices use only approved already-installed tools or available independent subagents. Retain the original prompts/scorecard, inspect the provider interface, bound the input to authorized paths/content, and scan outgoing text with the shared Node 18 guard. Automatic host-Codex launch/cached search flags, authentication, global logging and whole-repo access are removed associations. Missing optional voices are non-blocking and reported honestly.
