## Test Framework Association

The original TEST_BOOTSTRAP domain workflow is retained below; only host-global discovery/opt-out state and execution associations are adapted. Setup, installation, project tests, CI/instruction-file changes, recovery and commits remain subject to the shared external-actions contract. The browser portion follows the shared adapter: `playwright-cli` preferred, host default browser tool if absent, not a separate project browser runner. Deferred setup is not an automatic prerequisite for visual fixes.

**Detect existing test framework and project runtime:**

Use Read/Glob/Grep to inspect runtime manifests (`Gemfile`, `package.json`, `requirements.txt`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `composer.json`, `mix.exs`), project test scripts, config files (`jest.config.*`, `vitest.config.*`, `playwright.config.*`, `.rspec`, `pytest.ini`, `phpunit.xml`) and test directories (`test/`, `tests/`, `spec/`, `__tests__/`, `cypress/`, `e2e/`). Do not install or execute a manifest script before inspecting its actual behavior and approval.

**If test framework detected** (config files or test directories found):
Print "Test framework detected: {name} ({N} existing tests). Skipping bootstrap."
Read 2-3 existing test files to learn conventions (naming, imports, assertion style, setup patterns).
Store conventions as prose context for use in Phase 8e.5. **Skip the rest of bootstrap.**

**If NO runtime detected** (no config files found): Use AskUserQuestion:
"I couldn't detect your project's language. What runtime are you using?"
Options: A) Node.js/TypeScript B) Ruby/Rails C) Python D) Go E) Rust F) PHP G) Elixir H) This project doesn't need tests.

If the user declines testing, continue without tests; no global/host opt-out marker is needed. Mark the affected regression-test branch deferred.

**If runtime detected but no test framework — bootstrap selection:**

The original optional research queries are `"[runtime] best test framework 2025 2026"` and `"[framework A] vs [framework B] comparison"`; use them only with approved search. If WebSearch is unavailable, use this built-in knowledge table:

| Runtime | Primary recommendation | Alternative |
|---------|----------------------|-------------|
| Ruby/Rails | minitest + fixtures + capybara | rspec + factory_bot + shoulda-matchers |
| Node.js | vitest + @testing-library | jest + @testing-library |
| Next.js | vitest + @testing-library/react + playwright | jest + cypress |
| Python | pytest + pytest-cov | unittest |
| Go | stdlib testing + testify | stdlib only |
| Rust | cargo test (built-in) + mockall | — |
| PHP | phpunit + mockery | pest |
| Elixir | ExUnit (built-in) + ex_machina | — |

Use AskUserQuestion:
"I detected this is a [Runtime/Framework] project with no test framework. I researched current best practices. Here are the options:
A) [Primary] — [rationale]. Includes: [packages]. Supports: unit, integration, smoke, e2e
B) [Alternative] — [rationale]. Includes: [packages]
C) Skip — don't set up testing right now
RECOMMENDATION: Choose A because [reason based on project context]"

The research clause is conditional on actual approved research. If multiple runtimes detected (monorepo) → ask which runtime to set up first, with option to do both sequentially.

Choosing a framework is not blanket approval to download packages, change project tests, modify CI/TESTING.md/CLAUDE.md, commit bootstrap changes, or restore manifests via git. Establish the setup's exact scope under the shared external-actions contract, then execute the approved steps below. Otherwise defer setup and the unavailable regression-test branch while keeping the original visual audit/fix/retest workflow.

The framework table retains upstream recommendations. Browser/E2E entries such as Playwright, Cypress and Capybara are source context, not alternate web-testing backends or automatic package-install requests. Webpage checks use the shared [browser adapter](../../../references/browser-tools.md): prefer `playwright-cli`, falling back to the host's default browser tool if absent. Keep applicable native unit/integration tests and existing framework discovery.

### B4. Install and configure

1. Install the chosen packages (npm/bun/gem/pip/etc.)
2. Create minimal config file
3. Create directory structure (test/, spec/, etc.)
4. Create one example test matching the project's code to verify setup works

If package installation fails → debug once. If still failing → revert the bootstrap's manifest/lockfile changes using the approved recovery method for the runtime. Warn user and continue without tests. Do not restore whole pre-existing files or discard unrelated user work.

### B4.5. First real tests

Generate 3-5 real tests for existing code:

1. **Find recently changed files:** `git log --since=30.days --name-only --format="" | sort | uniq -c | sort -rn | head -10`
2. **Prioritize by risk:** Error handlers > business logic with conditionals > API endpoints > pure functions
3. **For each file:** Write one test that tests real behavior with meaningful assertions. Never `expect(x).toBeDefined()` — test what the code DOES.
4. Run each test. Passes → keep. Fails → fix once. Still fails → delete the newly created test and record the failed/deferred check under the shared status contract.
5. Generate at least 1 test, cap at 5.

Never import secrets, API keys, or credentials in test files. Use environment variables or test fixtures.

### B5. Verify

```bash
# Run the full test suite to confirm everything works
{detected test command}
```

If tests fail → debug once. If still failing → revert all bootstrap changes within the approved recovery scope and warn user.

### B5.5. CI/CD pipeline

Inspect `.github/`, `.gitlab-ci.yml`, `.circleci/` and `bitrise.yml` to detect the actual CI provider.

The upstream bootstrap includes CI setup, while design-review's additional rules forbid CI changes during visual fixes. Keep this setup stage outside the visual-fix loop; defer it unless a separate CI setup scope is explicitly approved.

If `.github/` exists (or no CI is detected and the user approves the original GitHub Actions default), create `.github/workflows/test.yml` with:
- `runs-on: ubuntu-latest`
- Appropriate setup action for the runtime (setup-node, setup-ruby, setup-python, etc.)
- The same test command verified in B5
- Trigger: push + pull_request

If non-GitHub CI detected → skip CI generation with note: "Detected {provider} — CI pipeline generation supports GitHub Actions only. Add test step to your existing pipeline manually."

### B6. Create TESTING.md

First check: If TESTING.md already exists → read it and update/append rather than overwriting. Never destroy existing content.

Write TESTING.md with:
- Philosophy: "100% test coverage is the key to great vibe coding. Tests let you move fast, trust your instincts, and ship with confidence — without them, vibe coding is just yolo coding. With tests, it's a superpower."
- Framework name and version
- How to run tests (the verified command from B5)
- Test layers: Unit tests (what, where, when), Integration tests, Smoke tests, E2E tests
- Conventions: file naming, assertion style, setup/teardown patterns

### B7. Update CLAUDE.md

First check: If CLAUDE.md already has a `## Testing` section → skip. Don't duplicate.

Append a `## Testing` section:
- Run command and test directory
- Reference to TESTING.md
- Test expectations:
  - 100% test coverage is the goal — tests make vibe coding safe
  - When writing new functions, write a corresponding test
  - When fixing a bug, write a regression test
  - When adding error handling, write a test that triggers the error
  - When adding a conditional (if/else, switch), write tests for BOTH paths
  - Never commit code that makes existing tests fail

### B8. Commit

```bash
git status --porcelain
```

Only commit if there are changes and commit scope is approved. Stage only this bootstrap's approved files (config, test directory, TESTING.md, CLAUDE.md, .github/workflows/test.yml if created):
`git commit -m "chore: bootstrap test framework ({framework name})"`
