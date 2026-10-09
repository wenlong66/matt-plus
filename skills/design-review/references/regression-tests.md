# Local Regression Test Procedure

This preserves the complete design-review regression workflow while applying the upstream QA move from creation-after-fix to creation-before-repair. It is a local procedure, not a call to /qa's 8e.5: that upstream step now only records results. Read this whole reference at 8a.6; return for 8d re-test and 8e.5 record/commit.

## 8a.6. Regression test before repair

Only create tests for JavaScript behavior changes — broken dropdowns, animation failures, conditional rendering, interactive state issues. Pure CSS → skip (caught by rendered design-review reruns). No detected framework and declined/unavailable bootstrap → disclose coverage debt and defer the test, not the live audit. Test creation, execution, correction and commit require their own approved scope. Never modify existing tests or CI; only create new test files. Do not introduce an export, flag, wrapper or injection seam with no production caller just for a test.

**1. Study the project's existing test patterns:**

Read 2-3 test files closest to the fix (same directory, same code type). Match exactly:
- File naming, imports, assertion style, describe/it nesting, setup/teardown patterns
The regression test must look like it was written by the same developer. Use the actual documented/approved native command from [test framework association](test-framework.md), not a guessed runner.

**2. Trace the bug's codepath, then write a regression test:**

Before repair, trace the data flow through the code responsible for the reproduced bug:
- What input/state triggered the bug? (the exact precondition)
- What codepath did it follow? (which branches, which function calls)
- Where did it break? (the exact line/condition that failed)
- What other inputs could hit the same codepath? (edge cases around the fix)

**Test value bar:** Answer what observable behavior/invariant/independent contract the test protects, what credible regression makes it fail, why existing coverage does not already catch it, and whether it needs a production-only-for-testing seam. If existing coverage catches the boundary, cite it instead of duplicating it. Upstream QA may extend a table or fixture; this design-review variant keeps the new-files-only restriction and never edits that existing coverage.

Record one card with the test attribution and in 8e.5:

```text
Value: protects=<observable behavior>; fails_when=<credible regression>; why_new=<coverage gap>; seam=none
```

Each field in the compact record is at most 160 UTF-8 bytes; wrap rather than lose the full explanation in the test header. Unknown upstream card fields do not block; derive a missing card from the reproduced bug.

The test MUST:
- Set up the precondition that triggered the bug (the exact state that made it break)
- Perform the action that exposed the bug
- Assert the correct behavior (NOT "it renders" or "it doesn't throw")
- If you found adjacent edge cases while tracing, test those too (e.g., null input, empty array, boundary value)
- Include full attribution comment in the language's comment syntax:
  ```
  // Regression: FINDING-NNN — {what broke}
  // Found by /design-review on {YYYY-MM-DD}
  // Report: [approved REPORT_DIR]/design-audit-{domain}.md
  ```

Test type decision:
- Console error / JS exception / logic bug → unit or integration test
- Broken form / API failure / data flow bug → integration test with request/response
- Visual bug with JS behavior (broken dropdown, animation) → component test
- Pure CSS → skip (caught by rendered QA reruns)

Generate applicable native unit/integration/component tests. Mock all external dependencies (DB, API, Redis, file system) as the project does; never contact a real service just to get red proof.

Use auto-incrementing names to avoid collisions: check existing `{name}.regression-*.test.{ext}` files, take max number + 1, starting at 1. Never replace an existing file.

**3. Run only the new test file before repair:**

```bash
{detected test command} {new-test-file}
```

Use the project's verified invocation syntax; a file argument is not assumed supported. Prove failure in the assertion encoding the defect, not fixture/import/environment/service failure. A pass before repair is not red proof: report existing coverage or an unproven reproducer, never claim the defect was caught. A healthy passing contract test needs its own approved purpose and is not a reproduced regression.

Correct a proved fixture/test error once, within the new file only. Persistent setup failure stays deferred; removal of an invalid owned test requires explicit recovery scope. Never silently delete a valid red regression, change the assertion to bless broken behavior, or weaken existing tests. Taking >2 min exploration → stop and defer missing coverage; retain any valid red test/evidence already obtained.

## 8d. Re-test after the fix

Re-run the regression, original failing probe and adjacent happy path. Retain the original comparable before/after screenshots and console baseline checks. Classification is verified only with actual supported evidence; missing native/live rechecks remain disclosed, not a fabricated green. An assertion still failing on the reproduced defect is unresolved: follow the original stop/revert/defer gate for this repair and leave valid red regressions/evidence uncommitted. Never discard user changes.

## 8e.5. Regression Test record and commit

This step records results; it does not create another test. Record file, command, attribution, tested boundary, value card and actual before-red/after-green evidence, or why coverage is deferred. No invented command/result.

- Verified fix and passing new regression → stage only its approved new file(s) after inspecting the index; commit: `git commit -m "test(design): regression test for FINDING-NNN — {desc}"`.
- Best-effort, reverted, failed or unavailable verification → keep the test/evidence and report deferred. Never silently delete a valid red regression.
- Test-only commits do not count toward the original design-fix risk heuristic. The fix commits, original re-test/classification, revert rule, >20% stop threshold and 30-fix cap remain unchanged.
