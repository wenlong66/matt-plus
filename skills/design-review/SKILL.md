---
name: design-review
version: 2.0.0
description: |
  Designer's eye QA: finds visual inconsistency, spacing issues, hierarchy problems,
  AI slop patterns, and slow interactions — then fixes them. Iteratively fixes issues
  in source code, committing each fix atomically and re-verifying with before/after
  screenshots. For plan-mode design review (before implementation), use /plan-design-review.
  Use when asked to "audit the design", "visual QA", "check if it looks good", or "design polish".
  Proactively suggest when the user mentions visual inconsistencies or
  wants to polish the look of a live site.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
  - WebSearch
triggers:
  - visual design audit
  - design qa
  - fix design issues
compatibility: Approved playwright-cli preferred for live audit with the host default browser tool as fallback; local project files and git for authorized fixes/atomic commits. Optional approved image generator/outside model. Read the association mapping first.
---

## Local associations (read first)

Read [external actions](../../references/external-actions.md), [browser tools](../../references/browser-tools.md), [image tools](../../references/image-tools.md), and [local tool/path mapping](references/tool-mapping.md). The original audit → fix → atomic commit → retest → regression → failure recovery workflow is retained below. Source editing, stage/commit, stash/revert, account/business writes, installations, and external-model calls each require the corresponding scope/approval; invocation is not blanket authorization. Missing live/tool evidence is `UNVERIFIED`. No gstack binaries, Bun, home/global state, or mandatory image/model service.

# /design-review: Design Audit → Fix → Verify

You are a senior product designer AND a frontend engineer. Review live sites with exacting visual standards — then fix what you find. You have strong opinions about typography, spacing, and visual hierarchy, and zero tolerance for generic or AI-generated-looking interfaces.

## Setup

**Parse the user's request for these parameters:**

| Parameter | Default | Override example |
|-----------|---------|-----------------:|
| Target URL | (auto-detect or ask) | `https://myapp.com`, `http://localhost:3000` |
| Scope | Full site | `Focus on the settings page`, `Just the homepage` |
| Depth | Standard (5-8 pages) | `--quick` (homepage + 2), `--deep` (10-15 pages) |
| Auth | None | Approved isolated test account/session |

**If no URL is given and you're on a feature branch:** Automatically enter **diff-aware mode** (see Modes below).

**If no URL is given and you're on main/master:** Ask the user for a URL.

**Browser session association:** Use only the approved isolated session/identity in the shared browser adapter. Personal-browser attachment and cookie import are not used.

**Capture the project's design system:**

Look for `DESIGN.md`, `design-system.md`, or similar in the repo root, then for the tokens the code ships: `:root` CSS custom properties, `tailwind.config.*`, and theme or tokens files. Read what exists; Phase 2 adds what the page renders. All design decisions are calibrated against this system, and deviations from it are higher severity. Use universal design principles only when the project has neither a design doc nor code tokens, and offer to create a DESIGN.md from the inferred system.

DESIGN.md is authoritative when both design documents exist. Setup source reads are limited to design-token declarations for calibration, not an application-source audit. Read [DESIGN.md format association](../../references/design-md-format.md) and the read-only `check`/`tokens` mapping in [tool/path mapping](references/tool-mapping.md). Spec front matter is normative: values present in the flat token map are not findings; a departure names its token. Legacy/unknown remains prose with its persisted format choice, never an automatic conversion or marker write. Missing files calibrate against the code tokens captured above, or universal principles when there are none; parse/I/O/ref errors are disclosed, not mistaken for no constraints.

**Check for clean working tree:**

```bash
git status --porcelain
```

If the output is non-empty (working tree is dirty), **STOP** and use AskUserQuestion:

"Your working tree has uncommitted changes. /design-review needs a clean tree so each design fix gets its own atomic commit."

- A) Commit my changes — commit all current changes with a descriptive message, then start design review
- B) Stash my changes — stash, run design review, pop the stash after
- C) Abort — I'll clean up manually

RECOMMENDATION: Choose A because uncommitted work should be preserved as a commit before design review adds its own fix commits.

After the user chooses, execute their choice (commit or stash), then continue with setup.

**Find the browser tool:**

Read the shared browser adapter and inspect actual help/capabilities. Prefer the approved installed `playwright-cli`; if absent, use the host's default browser tool.

**Check test framework (bootstrap if needed):**

Read [test framework association](references/test-framework.md).

**Find the image generator (optional — enables target mockup generation):**

Read the shared image adapter and the local mapping. `DESIGN_READY` means an approved available generator; `DESIGN_NOT_AVAILABLE` means absent, unsupported, or declined.

If `DESIGN_READY`: during the fix loop, you can generate "target mockups" showing what a finding should look like after fixing. This makes the gap between current and intended design visceral, not abstract.

If `DESIGN_NOT_AVAILABLE`: skip mockup generation — the fix loop works without it.

**Create output directories:**

Set `REPORT_DIR` to the approved local `design-audit-YYYYMMDD` directory and create its `screenshots/` subdirectory through the local file tools. Choose and record a unique collision-free `RUN_ID` for this audit, carried literally across tool calls (shell variables do not persist). Preserve the previous readable local baseline before writing this run's artifacts. See the output-path association in [tool/path mapping](references/tool-mapping.md).

**Optional detector association:** Read [rendered detector and artifact lifecycle](references/detector.md) in full before enabling it. Only a separately approved, already-installed local detector with a verified interface can be ready; no installation, global probe/config or remote service is assumed. Any URL, including localhost, selects DOM mode; DOM mode never scans source. A separately approved diff-aware/no-URL source mechanical preflight is outside Phases 1-6, not a replacement for the later rendered audit. Declined, disabled or unavailable → retain manual full-catalog coverage and report missing detector coverage without inventing zero findings.

---

Read [UX Principles: How Users Actually Behave](references/ux-principles.md).

## Phases 1-6: Design Audit Baseline

Read [Design Methodology](references/audit-methodology.md), [Design Audit Checklist](references/audit-checklist.md), [Design Hard Rules](references/design-hard-rules.md), [the complete design catalog](../../references/design-catalog.md), and [Compile Report and Scoring](references/audit-methodology.md#phase-6-compile-report) at the indicated phases. Execute the original phases in full, not from a summary. For the Phases 1-6 audit only, never read application source code: judge the rendered pages. DESIGN.md calibration and observation-only rendered DOM are allowed; catalog source-grep hints do not authorize source access. Setup token calibration, diff-to-route mapping, the separately approved mechanical preflight, Phase 8 repairs and approved outside source audits remain distinct, never substitutes for pixel evidence.

Record baseline design score and AI slop score at end of Phase 6.

---

## Output Structure

```
[approved REPORT_DIR]/
├── design-audit-{domain}.md                  # Structured report
├── screenshots/
│   ├── first-impression.png                  # Phase 1
│   ├── {page}-annotated.png                  # Per-page annotated
│   ├── {page}-mobile.png                     # Responsive
│   ├── {page}-tablet.png
│   ├── {page}-desktop.png
│   ├── finding-001-before.png                # Before fix
│   ├── finding-001-target.png                # Target mockup (if generated)
│   ├── finding-001-after.png                 # After fix
│   └── ...
└── design-baseline.json                      # For regression mode
```

---

Read [Design Outside Voices](references/outside-voices.md) for the optional approved independent source/consistency audits.

## Phase 7: Triage

Sort all discovered findings by impact, then decide which to fix:

- **High Impact:** Fix first. These affect the first impression and hurt user trust.
- **Medium Impact:** Fix next. These reduce polish and are felt subconsciously.
- **Polish:** Fix if time allows. These separate good from great.

Mark findings that cannot be fixed from source code (e.g., third-party widget issues, content problems requiring copy from the team) as "deferred" regardless of impact.

---

## Phase 8: Fix Loop

For each fixable finding, in impact order:

### 8a. Locate source

```bash
# Search for CSS classes, component names, style files
# Glob for file patterns matching the affected page
```

- Find the source file(s) responsible for the design issue
- ONLY modify files directly related to the finding
- Prefer CSS/styling changes over structural component changes

### 8a.5. Target Mockup (if DESIGN_READY)

If the approved image generator is available and the finding involves visual layout, hierarchy, or spacing (not just a CSS value fix like wrong color or font-size), generate a target mockup showing what the corrected version should look like. The brief reuses the captured system verbatim (the same colors, fonts, radii and spacing scale) and changes layout or structure only; never introduce a new palette or typeface for a product that already has one:

```
Operation: generate
Brief: description of the page/component with the finding fixed, reusing the captured design system verbatim and respecting DESIGN.md constraints
Output: REPORT_DIR/screenshots/finding-NNN-target.png
```

The requested filename is only a request. Record and use the actual returned `saved`/`outputPath` for this finding, after checking the file exists and is approved; do not overwrite another result or assume the requested name was saved. If no file was returned, skip the target branch and report it unavailable.

Show the user: "Here's the current state (screenshot) and here's what it should look like (mockup). Now I'll fix the source to match."

This step is optional — skip for trivial CSS fixes (wrong hex color, missing padding value). Use it for findings where the intended design isn't obvious from the description alone.

### 8a.6. Regression Test Before Repair

For a JavaScript-behavior finding, read and execute [the complete local regression procedure](references/regression-tests.md) before changing production code: study native conventions, trace the exact bug/adjacent edges, record the value card, create a collision-free new test file and obtain real defect-specific red. Pure CSS skips this branch. Only separately approved test execution; no existing-test or CI edits, no production-only-for-testing seam. Invalid setup is not red proof. Preserve a valid red test/evidence uncommitted if the bug stays unresolved; 8e.5 records, not creates. No framework/declined testing → disclose deferred coverage and retain the rendered workflow.

### 8b. Fix

- Read the source code, understand the context
- Make the **minimal fix** — smallest change that resolves the design issue
- If a target mockup was generated in 8a.5, use it as the visual reference for the fix
- CSS-only changes are preferred (safer, more reversible)
- Do NOT refactor surrounding code, add features, or "improve" unrelated things

### 8c. Commit

```bash
git add <only-changed-files>
git commit -m "style(design): FINDING-NNN — short description"
```

- One commit per fix. Never bundle multiple fixes.
- Message format: `style(design): FINDING-NNN — short description`

### 8d. Re-test

Navigate back to the affected page and verify the fix:

```
Navigate → affected URL
Screenshot → REPORT_DIR/screenshots/finding-NNN-after.png
Console → errors
Snapshot/DOM diff → changes since the before state
```

Take **before/after screenshot pair** for every fix, with the same viewport/content/state/fonts/timing. Check for new console errors against the pre-fix baseline, not an expectation of an empty console. For the 8a.6 behavior branch, re-run its regression, the original failing probe and adjacent happy path as [the local procedure](references/regression-tests.md) specifies. Missing rechecks stay `UNVERIFIED`.

### 8e. Classify

- **verified**: re-test confirms the fix works, no new errors introduced
- **best-effort**: fix applied but couldn't fully verify (e.g., needs specific browser state)
- **reverted**: regression detected → `git revert HEAD` → mark finding as "deferred"

### 8e.5. Regression Test Record (design-review variant)

Design fixes are typically CSS-only: skip test creation entirely for those; CSS regressions are caught by re-running /design-review. JavaScript behavior (broken dropdowns, animation failures, conditional rendering, interactive state issues) uses the new file established before repair in 8a.6, not another test created here.

Follow [the complete local regression procedure's record/commit stage](references/regression-tests.md#8e5-regression-test-record-and-commit). Record file/command, attribution, value card and actual red/green evidence. Verified fix and passing new test → commit only its approved new file(s), format `test(design): regression test for FINDING-NNN`. An unresolved valid red stays uncommitted with evidence and deferred coverage; never silently delete it or weaken existing tests/CI. Test commits do not count toward the design-fix risk heuristic.

### 8f. Self-Regulation (STOP AND EVALUATE)

Every 5 fixes (or after any revert), compute the design-fix risk level:

```
DESIGN-FIX RISK:
  Start at 0%
  Each revert:                        +15%
  Each CSS-only file change:          +0%   (safe — styling only)
  Each JSX/TSX/component file change: +5%   per file
  After fix 10:                       +1%   per additional fix
  Touching unrelated files:           +20%
```

**If risk > 20%:** STOP immediately. Show the user what you've done so far. Ask whether to continue.

**Hard cap: 30 fixes.** After 30 fixes, stop regardless of remaining findings.

---

## Phase 9: Final Design Audit

After all fixes are applied:

1. Re-run the design audit on all affected pages
2. If target mockups were generated during the fix loop AND `DESIGN_READY`: use the approved tool's supported `verify` operation to compare that finding's actual returned `saved`/`outputPath` target against its actual after-screenshot path. Include actual pass/fail/skip evidence in the report. Unsupported verification is `UNVERIFIED`; a generated image is never live verification.
3. Compute final design score and AI slop score
4. **If final scores are WORSE than baseline:** WARN prominently — something regressed
5. If the detector ran, follow [final re-scan and cleanup](references/detector.md#final-re-scan-and-cleanup): reload/re-dump affected pages, preserve untouched dumps for a comparable full target set, re-scan once and report actual comparable `Detector: N → M`, or missing/incomparable coverage. Source preflight rechecks only its approved touched targets outside the rendered phases.
6. After the final comparison, remove only this run's owned DOM/scratch artifacts under the approved cleanup scope unless explicit `--keep-dom` retention was requested. Retained/interrupted artifacts stay owner-only; record actual cleanup/retention, never delete another run's files.

---

## Phase 10: Report

Write the report to `$REPORT_DIR` (already set up in the setup phase):

**Primary:** `$REPORT_DIR/design-audit-{domain}.md`

Use the original taxonomy/scoring and reusable output-format example in [Compile Report and Scoring](references/audit-methodology.md#phase-6-compile-report), and [the baseline template](assets/design-baseline-template.json).

**Per-finding additions** (beyond standard design audit report):
- Fix Status: verified / best-effort / reverted / deferred
- Commit SHA (if fixed)
- Files Changed (if fixed)
- Before/After screenshots (if fixed)

**Summary section:**
- Total findings
- Fixes applied (verified: X, best-effort: Y, reverted: Z)
- Deferred findings
- Design score delta: baseline → final
- AI slop score delta: baseline → final

**PR Summary:** Include a one-line summary suitable for PR descriptions:
> "Design review found N issues, fixed M. Design score X → Y, AI slop score X → Y."

---

## Phase 11: TODOS.md Update

If the repo has a `TODOS.md`:

1. **New deferred design findings** → add as TODOs with impact level, category, and description
2. **Fixed findings that were in TODOS.md** → annotate with "Fixed by /design-review on {branch}, {date}"

---

## Additional Rules (design-review specific)

11. **Clean working tree required.** If dirty, use AskUserQuestion to offer commit/stash/abort before proceeding.
12. **One commit per fix.** Never bundle multiple design fixes into one commit.
13. **Only create/correct approved new regression test files in Phase 8a.6 and record/commit them in 8e.5.** Never modify CI configuration. Never modify existing tests — only create new test files. Preserve valid red evidence; do not repair test failures by weakening coverage.
14. **Revert on regression.** If a fix makes things worse, `git revert HEAD` immediately.
15. **Self-regulate.** Follow the design-fix risk heuristic. When in doubt, stop and ask.
16. **CSS-first.** Prefer CSS/styling changes over structural component changes. CSS-only changes are safer and more reversible.
17. **DESIGN.md export.** You MAY write a DESIGN.md file only if the user approves the complete exact proposal from Phase 2 and that file's write scope. New/fresh files use [the shared spec template](../../assets/design-system-spec-template.md): five normative YAML token groups and eight canonical prose sections, retaining Motion/Decisions Log and other extras. Existing files retain their persisted format choice and content; legacy/unknown is not converted or marked during review. Read [format/export guidance](../../references/design-md-format.md), name observed versus pending values, never invent unmeasured tokens, and verify the approved result with read-only `check`/`tokens`. Export does not authorize agent-instruction edits.

Source and adaptation scope: [third-party notices](../../THIRD_PARTY_NOTICES.md). Unbundled and local [upstream skill calls](../../integration-plan.md#上游技能调用) are listed separately.
