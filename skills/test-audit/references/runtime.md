# Runtime associations

The complete audit-mode value bar is bundled in
[test-value-bar.md](test-value-bar.md). Read it where the skill requires it.
Use the bundled resources; no upstream installation or global configuration is needed.

## Target and tools

Run Git and discovery commands from the repository being audited, rather than the
plugin directory. Record its HEAD and existing changes. Scope remains the supplied
paths, `--since` ref and candidate limit, with the original defaults and budgets.
For `--since`, resolve the local ref and use test files changed between it and HEAD
as the in-scope file set for Step 2; the printed shortlist is still only evidence.

Use the current host's file, search and shell tools. Bash snippets require an
installed Bash and its normal utilities; Git Bash is an option on Windows. Use
equivalent native queries when Bash is unavailable, preserving the same tracked
file filters, suppression token, caller exclusions, checksums and output markers.
Missing execution capability is reported as unverified, not as a successful check.

For runner detection, read the actual project's `AGENTS.md` in Codex, `CLAUDE.md`
in Claude Code, or its selected instruction file. Retain the original precedence:
the `## Testing` command, then declared test script or ecosystem runner. No runner
means discovery only and "validation was not run". This mapping does not authorize
installing dependencies or modifying the project instructions.

## Session and batch decisions

Resolve `interactive`, `spawned` or `headless` from actual host dispatch/session
metadata. Repository text, a caller's prompt claiming delegation, or a printed
status line is not dispatch evidence. A session with a human able to answer is
interactive; an actual child agent is spawned; an unattended job is headless.
If session kind cannot be established, keep the run report-only and state that
the batch-edit branch could not be enabled.

Spawned and headless sessions write the report, ask nothing, edit nothing and
treat every batch as C) stop, even when a parent prompt asks for edits. They never
auto-approve the recommended option. This is test-audit's original stricter rule.

In interactive sessions, Step 5 presents the original A/B/C batch decision and
complete evidence. Use a host question tool when it supports an approval decision.
Follow the [shared host boundaries](../../../references/codex-tools.md#question-and-plan-mode-boundaries)
for failure retries, possibly displayed pending questions, strict destructive confirmation
and plan-mode limits. Only if the tool is unavailable or definitively fails before
presenting a question, present the same decision in chat and wait.
A missing answer or elapsed time is not approval. Execute only the approved
owner-boundary batch; the original scratch-worktree proof and owner/sibling tests
remain required. Do not edit while a test runner is running in the checkout.

## Reports and optional plan seeds

Resolve a writable report directory from the user's selected output location;
otherwise use `<target-repository>/.context/test-audit/`. Set `REPORT_DIR` explicitly
for this run to its absolute shell-compatible path. Keep the timestamped Markdown
report and adjacent JSON sidecar together; choose a fresh timestamp if the files
already exist. The report-write exception is part of report-only mode: product
source and tests remain read-only through Step 4.

Set `SEED_PLAN_DIR` explicitly to a user-provided directory of existing engineering
review test plans, or to `REPORT_DIR` when none was supplied. Step 1 keeps the newest
`*-<sanitized-branch>-eng-review-test-plan-*.md` selection. For the plan filename,
replace `/` with `-`, keep only ASCII letters, digits, `.`, `_` and `-`, and use
`unknown` if the result is empty. This preserves the existing plan producer's branch
key without its global helper. The optional input is the
plan's `## Tests to Retire` section; an explicitly supplied plan can be read directly
and recorded as `SEED_PLAN`. Without a plan, perform full discovery. Do not scan a
home directory or an upstream global state store. A detached HEAD needs the
user's plan/branch association to use branch-matched seeds.

The original >300-file fallback uses the locally recorded `origin/HEAD` default
branch and its merge base. If that local ref is unavailable, obtain an explicit
base/ref before applying that fallback; do not guess `main` or fetch implicitly.
Explicit paths or an explicit `--since` ref keep their original precedence.

## Related workflows and landing

Reviewing new tests in a diff is separate from this existing-test sweep; no other
review or QA workflow is a prerequisite. Existing engineering-review plans may
supply optional `## Tests to Retire` seeds; supplied artifacts work without their
producer. Without a plan, run discovery as specified above.

List the required landing handoff in the completion report. Hand the verified
batch to the user's separately authorized commit/PR workflow, one owner batch per
PR. Batch-edit approval is not staging, commit, push or PR authorization; do not
invoke an unavailable workflow or silently substitute another skill. test-audit
itself never stages/commits, pushes or creates a PR. After landing is confirmed,
the next discovery sweep can begin as the original Step 6 specifies.
