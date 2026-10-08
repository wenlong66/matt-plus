## Step 2: Per-File Documentation Audit

Read each documentation file and cross-reference it against the diff. Use these generic heuristics
(adapt to whatever project you're in — these are not gstack-specific):

**README.md:**
- Does it describe all features and capabilities visible in the diff?
- Are install/setup instructions consistent with the changes?
- Are examples, demos, and usage descriptions still valid?
- Are troubleshooting steps still accurate?

**ARCHITECTURE.md:**
- Do ASCII diagrams and component descriptions match the current code?
- Are design decisions and "why" explanations still accurate?
- Be conservative — only update things clearly contradicted by the diff. Architecture docs
  describe things unlikely to change frequently.

**CONTRIBUTING.md — New contributor smoke test:**
- Walk through the setup instructions as if you are a brand new contributor.
- Are the listed commands accurate? Would each step succeed?
- Do test tier descriptions match the current test infrastructure?
- Are workflow descriptions (dev setup, operational learnings, etc.) current?
- Flag anything that would fail or confuse a first-time contributor.

**CLAUDE.md / project instructions:**
- Does the project structure section match the actual file tree?
- Are listed commands and scripts accurate?
- Do build/test instructions match what's in package.json (or equivalent)?

**Any other .md files:**
- Read the file, determine its purpose and audience.
- Cross-reference against the diff to check if it contradicts anything the file says.

For each file, classify needed updates as:

- **Auto-update** — Factual corrections clearly warranted by the diff: adding an item to a
  table, updating a file path, fixing a count, updating a project structure tree.
- **Ask user** — Narrative changes, section removal, security model changes, large rewrites
  (more than ~10 lines in one section), ambiguous relevance, adding entirely new sections.

---

## Step 3: Apply Auto-Updates

Make all clear, factual updates directly using the Edit tool.

For each file modified, output a one-line summary describing **what specifically changed** — not
just "Updated README.md" but "README.md: added /new-skill to skills table, updated skill count
from 9 to 10."

**Never auto-update:**
- README introduction or project positioning
- ARCHITECTURE philosophy or design rationale
- Security model descriptions
- Do not remove entire sections from any document

---

## Step 4: Ask About Risky/Questionable Changes

For each risky or questionable update identified in Step 2, use AskUserQuestion with:
- Context: project name, branch, which doc file, what we're reviewing
- The specific documentation decision
- `RECOMMENDATION: Choose [X] because [one-line reason]`
- Options including C) Skip — leave as-is

Apply approved changes immediately after each answer.

---

## Step 5: CHANGELOG Voice Polish

**CRITICAL — NEVER CLOBBER CHANGELOG ENTRIES.**

This step polishes voice. It does NOT rewrite, replace, or regenerate CHANGELOG content.

A real incident occurred where an agent replaced existing CHANGELOG entries when it should have
preserved them. This skill must NEVER do that.

**Rules:**
1. Read the entire CHANGELOG.md first. Understand what is already there.
2. Only modify wording within existing entries. Never delete, reorder, or replace entries.
3. Never regenerate a CHANGELOG entry from scratch. The entry was written by the project's
   release workflow from the actual diff and commit history. It is the source of truth. You
   are polishing prose, not rewriting history.
4. If an entry looks wrong or incomplete, use AskUserQuestion — do NOT silently fix it.
5. Use Edit tool with exact `old_string` matches — never use Write to overwrite CHANGELOG.md.

**If CHANGELOG was not modified in this branch:** skip this step.

**If CHANGELOG was modified in this branch**, review the entry for voice:

- **Sell test (Diataxis rubric):** Score each CHANGELOG entry 0-3:
  - **1 point** — answers "What changed?" (reference: names the feature/fix)
  - **1 point** — answers "Why should I care?" (explanation: user impact, pain removed)
  - **1 point** — answers "How do I use it?" (how-to: command, flag, or link to docs)
  - Entries scoring <2 need a rewrite. Entries scoring 3 are gold.
- Lead with what the user can now **do** — not implementation details.
- "You can now..." not "Refactored the..."
- Flag and rewrite any entry that reads like a commit message.
- Internal/contributor changes belong in a separate "### For contributors" subsection.
- Auto-fix minor voice adjustments. Use AskUserQuestion if a rewrite would alter meaning.

---

## Step 6: Cross-Doc Consistency & Discoverability Check

After auditing each file individually, do a cross-doc consistency pass:

1. Does the README's feature/capability list match what CLAUDE.md (or project instructions) describes?
2. Does ARCHITECTURE's component list match CONTRIBUTING's project structure description?
3. Does CHANGELOG's latest version match the VERSION file?
4. **Discoverability:** Is every documentation file reachable from README.md or CLAUDE.md? If
   ARCHITECTURE.md exists but neither README nor CLAUDE.md links to it, flag it. Every doc
   should be discoverable from one of the two entry-point files.
5. Flag any contradictions between documents. Auto-fix clear factual inconsistencies (e.g., a
   version mismatch). Use AskUserQuestion for narrative contradictions.

---

## Step 7: TODOS.md Cleanup

This is a second pass over the release's TODO tracking. Read the project's local TODO format,
or `TODOS-format.md` (if applicable) for the canonical TODO item format.

If TODOS.md does not exist, skip this step.

1. **Completed items not yet marked:** Cross-reference the diff against open TODO items. If a
   TODO is clearly completed by the changes in this branch, move it to the Completed section
   with `**Completed:** vX.Y.Z.W (YYYY-MM-DD)`. Be conservative — only mark items with clear
   evidence in the diff.

2. **Items needing description updates:** If a TODO references files or components that were
   significantly changed, its description may be stale. Use AskUserQuestion to confirm whether
   the TODO should be updated, completed, or left as-is.

3. **New deferred work:** Check the diff for `TODO`, `FIXME`, `HACK`, and `XXX` comments. For
   each one that represents meaningful deferred work (not a trivial inline note), use
   AskUserQuestion to ask whether it should be captured in TODOS.md.

---

## Step 8: VERSION Bump Question

**CRITICAL — NEVER BUMP VERSION WITHOUT ASKING.**

1. **If VERSION does not exist:** Skip silently.

2. Check if VERSION was already modified on this branch:

```bash
git diff <diff-base> <head> -- VERSION
```

3. **If VERSION was NOT bumped:** Use AskUserQuestion:
   - RECOMMENDATION: Choose C (Skip) because docs-only changes rarely warrant a version bump
   - A) Bump PATCH (X.Y.Z+1) — if doc changes ship alongside code changes
   - B) Bump MINOR (X.Y+1.0) — if this is a significant standalone release
   - C) Skip — no version bump needed

4. **If VERSION was already bumped:** Do NOT skip silently. Instead, check whether the bump
   still covers the full scope of changes on this branch:

   a. Read the CHANGELOG entry for the current VERSION. What features does it describe?
   b. Read the full diff (`git diff <diff-base> <head> --stat` and `git diff <diff-base> <head> --name-only`).
      Are there significant changes (new features, new skills, new commands, major refactors)
      that are NOT mentioned in the CHANGELOG entry for the current version?
   c. **If the CHANGELOG entry covers everything:** Skip — output "VERSION: Already bumped to
      vX.Y.Z, covers all changes."
   d. **If there are significant uncovered changes:** Use AskUserQuestion explaining what the
      current version covers vs what's new, and ask:
      - RECOMMENDATION: Choose A because the new changes warrant their own version
      - A) Bump to next patch (X.Y.Z+1) — give the new changes their own version
      - B) Keep current version — add new changes to the existing CHANGELOG entry
      - C) Skip — leave version as-is, handle later

   The key insight: a VERSION bump set for "feature A" should not silently absorb "feature B"
   if feature B is substantial enough to deserve its own version entry.

---

## Step 9: Commit & Output

**Empty check first:** Run `git status` (never use `-uall`). If no documentation files were
modified by any previous step, output "All documentation is up to date." and exit without
committing.

**Commit:**

1. Stage modified documentation files by name (never `git add -A` or `git add .`).
2. Create a single commit:

Resolve the original commit-message/co-author association through `runtime.md` and the
shared content guard. Save and check the following message with any approved project
attribution, then commit using the same checked file:

```text
docs: update project documentation for vX.Y.Z.W
```

```bash
git commit -F "<checked-commit-message-file>"
```

3. Push to the current branch:

Resolve the approved remote/ref, check the immutable outgoing history as specified in the
shared content guard, and use only the checked source revision:

```bash
git push <approved-remote> <checked-source-sha>:<approved-destination-ref>
```

**PR/MR body update (idempotent, race-safe):**

1. Read the existing PR/MR body into a unique tempfile (use the platform detected in Step 0):

**If GitHub:**
```bash
gh pr view <approved-pr-number> --json body -q .body > "<unique-body-file>"
```

**If GitLab:**
```bash
glab mr view <approved-mr-number> -F json > "<unique-mr-snapshot-file>"
```

Read the snapshot locally and extract its `description` into the recorded unique body file;
this replaces the original parser/runtime association, not the body-read function.

2. If the tempfile already contains a `## Documentation` section, replace that section with the
   updated content. If it does not contain one, append a `## Documentation` section at the end.

3. The Documentation section should include:

   a. **Doc diff preview** — for each file modified, describe what specifically changed (e.g.,
      "README.md: added /document-release to skills table, updated skill count from 9 to 10").

   b. **Documentation debt** — if the coverage map from Step 1.5 found gaps, append a
      `### Documentation Debt` subsection listing:
      - Critical gaps: new public surface with zero documentation coverage
      - Common gaps: features with reference-only coverage (no how-to or tutorial)
      - Stale diagrams: architecture diagrams with entity names that drifted from the code
      - Each item should include a one-line description of what's missing and which Diataxis
        quadrant would fill it (e.g., "⚠️ `/new-skill` — has reference in AGENTS.md but no
        how-to example in README")

   If there are any documentation debt items, suggest adding a `docs-debt` label to the PR.

4. Redaction scan-at-sink, then write the updated body back. The body is already
   in a temp file; scan THAT file before editing so the bytes scanned are the bytes sent:

Use `../../../references/content-guard.md` and `runtime.md` for the package guard and the
concurrent-body/transport association. Reread and preserve concurrent changes, check the
exact final body, and pass the same checked bytes downstream:

```bash
node "<skill-dir>/../../scripts/content-guard.mjs" --from-file "<checked-body-file>" --repo-visibility <public|private|unknown> --json
```

**If GitHub:**
```bash
gh pr edit <approved-pr-number> --body-file "<checked-body-file>"
```

**If GitLab:**
Use the installed `glab api` supported file-input association from `runtime.md`. Prepare the
request once, check both its exact JSON bytes and decoded `description`, then send that
same checked request file rather than rebuild the body in a heredoc:

```bash
glab api projects/<approved-project-id>/merge_requests/<approved-iid> --method PUT --input "<checked-request-file>"
```

5. Clean up the tempfile using its recorded unique path; remove only this run's temporary files.

6. If `gh pr view` / `glab mr view` fails (no PR/MR exists): skip with message "No PR/MR found — skipping body update."
7. If `gh pr edit` / the `glab` update fails: warn "Could not update PR/MR body — documentation changes are in the
   commit." and continue.

**PR/MR title sync (idempotent, under project convention):**

When the project's PR titles start with `v<VERSION>`, this sub-step fixes a title made stale
by Step 8. Resolve that original title convention through `runtime.md`, not another skill.

1. Read the current VERSION using the installed local file tool. Before helper use, remove
all whitespace as in the original `tr -d '[:space:]'` (space, tab, LF, CR, vertical tab and
form feed), not just leading/trailing whitespace. Record the normalized value locally as
`<recorded-version>`; it must be a single-line numeric scalar matching `^[0-9]+(\.[0-9]+)*$`.
Unsupported syntax follows the question rule in `runtime.md`, before invoking the helper.

If `VERSION` does not exist or is empty after normalization (including whitespace-only
content), skip this sub-step entirely. Do not log raw VERSION/title content or helper
stdout; use hashes or masked diagnostics for evidence.

2. Read the current PR/MR title:

**If GitHub:**
```bash
gh pr view <approved-pr-number> --json title -q .title
```

**If GitLab:**
```bash
glab mr view <approved-mr-number> -F json
```

Read the `title` field and record the current title.

If `CURRENT_TITLE` is empty (no open PR/MR), skip with message "No PR/MR found — skipping title sync."

3. Compute the corrected title using the locally bundled original helper, capturing stdout
as `NEW_TITLE` with the original Bash command-substitution semantics:

```bash
NEW_TITLE=$(bash "<skill-dir>/scripts/pr-title-rewrite.sh" "<recorded-version>" "<recorded-current-title>")
```

Command substitution removes all trailing LF record terminators from helper stdout. If the
host captures stdout directly, perform exactly that removal before recording `NEW_TITLE`
locally and before the exact-byte guard; do not trim other whitespace or normalize title
content. After checking, do not transform the title again.

The helper handles three cases: title already correct (no-op), title has a different `v<X.Y.Z.W>` prefix (replace it), or title has no version prefix (prepend one).

4. If `NEW_TITLE` differs from `CURRENT_TITLE`, update it:

Check the exact final title bytes separately under the shared guard before sending those
same bytes as the supported CLI argument or checked file-input API request. Do not re-render
or strip newlines after checking. Title authorization is separate from body authorization.

**If GitHub:**
```bash
gh pr edit <approved-pr-number> --title "<exact-checked-title>"
```

**If GitLab:**
```bash
glab mr update <approved-mr-number> -t "<exact-checked-title>"
```

5. If the edit command fails: warn "Could not update PR/MR title — documentation changes are still in the commit." and continue. Do not block on title sync failure.

**Structured doc health summary (final output):**

Output a scannable summary showing every documentation file's status:

```
Documentation health:
  README.md       [status] ([details])
  ARCHITECTURE.md [status] ([details])
  CONTRIBUTING.md [status] ([details])
  CHANGELOG.md    [status] ([details])
  TODOS.md        [status] ([details])
  VERSION         [status] ([details])
```

Where status is one of:
- Updated — with description of what changed
- Current — no changes needed
- Voice polished — wording adjusted
- Not bumped — user chose to skip
- Already bumped — version was set by the project's release workflow
- Skipped — file does not exist

If the coverage map from Step 1.5 identified any gaps, append:

```
Documentation coverage:
  [entity]         [reference] [how-to] [tutorial] [explanation]
  /new-skill       ✅          ❌       ❌         ❌
  --new-flag       ✅          ✅       ❌         ❌

Diagram drift:
  ARCHITECTURE.md: "FooProcessor" renamed to "BarProcessor" in code — diagram may be stale
```

If all coverage is complete and no diagrams drifted, output: "Coverage: all shipped features have adequate documentation."

---

Read `cross-model-review.md` for the original independent documentation-review phase and
its installed-tool association. Its separate authorization and UNVERIFIED status rules apply.
