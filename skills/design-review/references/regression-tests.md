# Local Regression Test Procedure

The design-review source at `54efba6dd5a6dc7f04e62106b97079279ed53b41` keeps test creation after repair/classification in 8e.5. This bundles the complete matching creation procedure from `qa/SKILL.md.tmpl` at `e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09`; the newer QA record-only step is not a replacement for it. Only finding names, report paths, commit attribution and scoped execution/cleanup associations change. Read this reference in full at 8e.5. Pure CSS skips this branch. Never modify existing tests or CI configuration.

Use the project's verified native test command and invocation syntax. Missing framework or declined testing means deferred coverage, not an invented test result. Browser interactions prefer installed playwright-cli through the shared browser adapter; if absent, offer installation and use an available testing method if the user does not install it.

### 8e.5. Regression Test

Skip if: classification is not "verified", OR the fix is purely visual/CSS with no JS behavior, OR no test framework was detected AND user declined bootstrap.

**1. Study the project's existing test patterns:**

Read 2-3 test files closest to the fix (same directory, same code type). Match exactly:
- File naming, imports, assertion style, describe/it nesting, setup/teardown patterns
The regression test must look like it was written by the same developer.

**2. Trace the bug's codepath, then write a regression test:**

Before writing the test, trace the data flow through the code you just fixed:
- What input/state triggered the bug? (the exact precondition)
- What codepath did it follow? (which branches, which function calls)
- Where did it break? (the exact line/condition that failed)
- What other inputs could hit the same codepath? (edge cases around the fix)

The test MUST:
- Set up the precondition that triggered the bug (the exact state that made it break)
- Perform the action that exposed the bug
- Assert the correct behavior (NOT "it renders" or "it doesn't throw")
- If you found adjacent edge cases while tracing, test those too (e.g., null input, empty array, boundary value)
- Include full attribution comment:
  ```
  // Regression: FINDING-NNN — {what broke}
  // Found by /design-review on {YYYY-MM-DD}
  // Report: [approved REPORT_DIR]/design-audit-{domain}.md
  ```

Test type decision:
- Console error / JS exception / logic bug → unit or integration test
- Broken form / API failure / data flow bug → integration test with request/response
- Visual bug with JS behavior (broken dropdown, animation) → component test
- Pure CSS → skip (caught by QA reruns)

Generate unit tests. Mock all external dependencies (DB, API, Redis, file system).

Use auto-incrementing names to avoid collisions: check existing `{name}.regression-*.test.{ext}` files, take max number + 1.

**3. Run only the new test file:**

```bash
{detected test command} {new-test-file}
```

**4. Evaluate:**
- Passes → commit: `git commit -m "test(design): regression test for FINDING-NNN — {desc}"`
- Fails → fix test once. Still failing → delete only this newly created test under the approved cleanup scope, defer. If cleanup is not authorized, preserve it uncommitted and report deferred cleanup.
- Taking >2 min exploration → skip and defer.

**5. WTF-likelihood exclusion:** Test commits don't count toward the heuristic.
