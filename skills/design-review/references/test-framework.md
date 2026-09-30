## Test Framework Association

The original TEST_BOOTSTRAP host helper is replaced by project test discovery and a separately authorized setup handoff. Its relevant discovery/convention text and framework-selection inputs are retained here; unavailable installation scaffolding is not an automatic prerequisite for visual fixes.

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

Choosing a framework is not approval to download packages, create unrelated tests, modify CI/TESTING.md/CLAUDE.md, commit bootstrap changes, or restore manifests via git. Establish that separate setup task's exact scope under the shared external-actions contract. Otherwise defer setup and the unavailable regression-test branch while keeping the original visual audit/fix/retest workflow.
