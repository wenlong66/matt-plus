**Test value bar.** Propose or write a test only with all four answers; otherwise extend an existing test or drop it:

1. What observable behavior, invariant or independent contract does it protect?
2. What credible regression makes it fail?
3. Why does existing coverage not already catch that? Prefer adding a row to an existing table-driven test or shared fixture over a near-duplicate.
4. Does it need a production seam (export, flag, wrapper, injection hook) that no production caller needs? If yes, test at the real boundary instead.

A test that breaks under a behavior-preserving refactor asserts implementation: rewrite it at the owning boundary, unless exact output is the declared contract (goldens, prompt bytes, wire formats).

Value card: `Value: protects=<...>; fails_when=<...>; why_new=<...>; seam=none` (seam: `none` or its name); each field at most 160 UTF-8 bytes here (clamp to 157 plus `...`; written JSON keeps full values). Read cards from test header comments when present. A missing upstream card never blocks: derive it; ignore unknown fields.

Example: Value: protects=refundPayment rejects an empty reason; fails_when=the reason guard is removed or inverted; why_new=billing.test.ts covers processPayment only; seam=none
Rejected (covered_elsewhere): "checkout renders"; checkout.e2e.ts:15 covers it, so extend that test.

Regression proof: a regression test must fail at HEAD before any repair, in its own assertion (a pass at HEAD drops the regression label; an import, fixture or env failure is a test defect: correct once or drop). It must pass at base as the control (an assertion failure there marks it invalid; any other failure is "base control unavailable: collection error") and pass after the repair. Record: `Regression proof — fails at HEAD: yes · passes at base: yes | unavailable (<reason>) | manual · passes after fix: yes | pending`.

Low-value catalog (a match fails the gate unless the retention bar names the contract it guards):
- assertion-free coverage probes
- self-comparisons and identity copies
- copied fixtures, inventories or export lists
- exact source, import or string greps that are not a declared contract
- private predicate or call-shape tests duplicated at a real boundary
- duplicate invocations of the same contract
- per-caller replays of a shared helper's tests
- tests whose only purpose is keeping a test-only export, global or wrapper alive
- production code whose only callers are tests

Retention bar: keep a test that independently enforces a public API, protocol, config, migration, storage, security, platform, default, prompt-byte, generated-output (SKILL.md golden), package, release or architecture contract; call order when order is observable; source inspection when it is the cheapest independent guard. Never retire anything reachable from the package entrypoint (`package.json` exports/main, index re-exports). Static or slow is not a reason to delete. Skip a test carrying `gstack:test-value keep reason="<why>"` and list it as suppressed.

Retirement card, complete before any edit: `test`, `detects`, `non_test_callers`, `search_command`, `stronger_proof`, `history`, `unlocks`, `validation`. Caller check for a symbol matching `^[A-Za-z_][A-Za-z0-9_]*$` (otherwise "caller check unavailable: unsupported symbol"): `git grep -n -F -w -e '<symbol>' -- . ':!test/' ':!tests/' ':!spec/' ':!**/__tests__/**' ':!**/*.test.*' ':!**/*.spec.*' ':!**/*_test.*' ':!**/test_*.py'`; record the command, exclusions and hit count. The evidence is grep-only (no re-exports, dynamic dispatch or generated code), so production code is retired only when the repo's typecheck/build or dead-code tool passes with it removed in a scratch worktree.
