## Step 9: Commit & Output

1. Stage new documentation files by name (never `git add -A` or `git add .`).

**Redaction scan before commit.** Generated docs frequently contain example
credentials; scan the staged doc content and block on a HIGH credential (a
live-format secret in committed docs is a leak). Example configs belong in
` ```example ` fences won't excuse a live-format secret. The original host's
placeholder-filter association now uses the shared guard's individually reviewed synthetic
example handling (e.g. `AKIAIOSFODNN7EXAMPLE`), not an automatic CLI exemption:

Read `../../../references/content-guard.md` and `runtime.md` for the local guard association.
Extract the exact staged content and final commit message locally without displaying raw
material; scan each checked file with the installed package guard:

```bash
node "<skill-dir>/../../scripts/content-guard.mjs" --from-file "<exact-content-file>" --repo-visibility <public|private|unknown> --json
```

Use the shared finding/error handling; do not commit on unresolved findings or an unavailable
required check. A recognized synthetic example is not a general exception for live credentials.

2. Create a commit:

Save the following message with the project's approved attribution, if any, to the checked
commit-message file. This replaces only the host's co-author and heredoc/sink association:

```text
docs: generate [scope] documentation (Diataxis)

[One-line summary of what was documented]

Quadrants: [list which quadrants were produced]
```

```bash
git commit -F "<checked-commit-message-file>"
```

3. Push to the current branch:

Apply the shared outgoing-history preflight to the explicitly approved remote/ref and
immutable source SHA before this original push function:

```bash
git push <approved-remote> <checked-source-sha>:<approved-destination-ref>
```

4. **If a PR exists**, update the PR body with a `## Documentation Generated` section listing
   every new file with its Diataxis quadrant and a one-line description:

```
## Documentation Generated

| File | Quadrant | Description |
|------|----------|-------------|
| docs/tutorial-getting-started.md | Tutorial | Walk-through from install to first working example |
| docs/reference-widget-api.md | Reference | Complete widget API with types, defaults, examples |
| docs/explanation-bayesian-scheduler.md | Explanation | Why the scheduler uses Bayesian inference |
| docs/howto-custom-widgets.md | How-to | Creating and registering custom widgets |
```

Use the shared action/publication contracts to preserve unrelated/concurrent body content,
check the exact final body bytes, and pass the same checked file to the approved existing PR:

```bash
gh pr edit <approved-pr-number> --body-file "<checked-body-file>"
```

5. Output a structured summary:

```
Documentation generated:
  Scope: [what was documented]
  Files: [N] new, [M] updated
  Coverage:
    Tutorials:    [count] ([list])
    How-tos:      [count] ([list])
    Reference:    [count] ([list])
    Explanation:  [count] ([list])
  Quality: [pass/fail on each gate]
```
