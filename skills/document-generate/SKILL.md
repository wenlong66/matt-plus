---
name: document-generate
description: |
  Generate missing documentation from scratch for a feature, module, or entire project.
  Uses the Diataxis framework (tutorial / how-to / reference / explanation) to produce
  complete, structured documentation. Can be invoked standalone or called by
  document-release when it finds coverage gaps. Use when asked to "write docs",
  "generate documentation", "document this feature", "create a tutorial", or
  "explain this module".
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - AskUserQuestion
metadata:
  version: "1.0.0"
  triggers: |
    write docs for this
    generate documentation
    document this feature
    create a tutorial
    write a how-to
    explain this module
    docs for this project
---

Read [Codex tool associations](../../references/codex-tools.md), `../../references/external-actions.md`, `../../references/content-guard.md` and
`references/runtime.md` before the workflow. These resolve authorization, publication,
project/tool/revision associations without changing the documentation phases below.

# Document Generate: Diataxis Documentation Writer

You are running the `document-generate` workflow. Your job: produce **high-quality,
structured documentation** for features, modules, or an entire project. You research
the code thoroughly before writing a single line of documentation.

In Claude Code, the package entries are `/matt-plus:document-generate` and
`/matt-plus:document-release`; in Codex, use the actually loaded skill's displayed
name per the shared Codex tool associations, not the Claude slash syntax.

This skill can be invoked two ways:
1. **Standalone** — the user points you at a feature, module, or project and says "document this"
2. **From /matt-plus:document-release** — the coverage map identified gaps; you fill them

You follow the **Diataxis framework** — four quadrants of documentation, each serving a
different reader need:
- **Tutorial** — learning-oriented, walks a newcomer through a working example step-by-step
- **How-to** — task-oriented, shows how to accomplish a specific goal (assumes basic familiarity)
- **Reference** — information-oriented, complete and accurate technical description
- **Explanation** — understanding-oriented, explains why things work the way they do

**Philosophy: research the whole, then write the parts.** Like an architect who surveys the
entire site before drawing a single room, you read the full codebase surface before writing
any documentation. This prevents the "documentation that describes half the feature" failure mode.

---

## Step 0: Scope & Intent

1. Determine what to document:
   - **If invoked with a specific target** (feature, module, file, skill): scope is that target
   - **If invoked for an entire project**: scope is the full project
   - **If called from /matt-plus:document-release with gaps**: scope is the specific entities from the coverage map

2. Use AskUserQuestion to confirm scope and ask about documentation target:

   - A) Write documentation inline in existing files (README, ARCHITECTURE, etc.)
   - B) Create standalone documentation files (e.g., `docs/` directory)
   - C) Both — inline summaries in existing files + deep docs in standalone files

   RECOMMENDATION: Choose C because it maximizes both discoverability and depth.

3. Determine the output format:
   - If the project already has a `docs/` directory, follow its conventions
   - If the project uses a doc framework (Nextra, Docusaurus, MkDocs, VitePress), follow its format
   - Otherwise, use plain Markdown files in `docs/`

---

## Step 1: Codebase Archaeology (Research Phase)

The quality of the documentation depends on how well you understand the code, so this
step carries the most weight.

1. **Map the project structure:**

```bash
find . -type f -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./dist/*" -not -path "./build/*" -not -path "./.next/*" | head -200
```

2. **Read the entry points.** Identify and read:
   - README.md, ARCHITECTURE.md, CONTRIBUTING.md, CLAUDE.md / AGENTS.md
   - package.json / Cargo.toml / pyproject.toml / go.mod (understand the project type)
   - Main entry files (index.ts, main.rs, app.py, cmd/main.go)
   - Configuration files and examples

3. **Read the source code for each target entity.** For each feature/module you're documenting:
   - Read the implementation files end-to-end (not just signatures)
   - Read the tests — they reveal intended behavior, edge cases, and usage patterns
   - Read related modules that the target depends on or is depended upon by
   - Read any existing inline comments, especially `// NOTE:`, `// DESIGN:`, `// WHY:`

4. **Build a concept map.** Before writing, produce an internal outline:

```
Target: [feature/module name]
Purpose: [one sentence — what problem does it solve?]
Key concepts: [list the 3-5 concepts a reader must understand]
Public surface: [commands, functions, config options, API endpoints]
Dependencies: [what it needs from other modules]
Dependents: [what relies on it]
Edge cases: [from reading tests and code]
Design decisions: [any non-obvious "why" choices]
```

5. Output: "Researched N files, identified K public surface items, M concepts, and J design decisions."

---

## Step 2: Diataxis Partitioning

For each target entity, decide which Diataxis quadrants to produce. Not every entity needs all four.

**Decision matrix:**

| Entity type | Tutorial? | How-to? | Reference? | Explanation? |
|---|---|---|---|---|
| New feature a user interacts with | ✅ | ✅ | ✅ | Maybe |
| CLI command or flag | Maybe | ✅ | ✅ | No |
| Internal module/architecture | No | No | ✅ | ✅ |
| Config option | No | ✅ | ✅ | No |
| Design pattern / philosophy | No | No | No | ✅ |
| API endpoint | Maybe | ✅ | ✅ | No |
| Workflow (multi-step process) | ✅ | ✅ | No | Maybe |

Output the partition plan:

```
Documentation plan:
  [entity]              [tutorial] [how-to] [reference] [explanation]
  Widget system         ✅ new     ✅ new   ✅ new      ✅ new
  --verbose flag        ❌        ✅ new   ✅ inline   ❌
  Bayesian scheduler    ❌        ❌       ✅ new      ✅ new
```

If the plan has more than 5 documents to create, use AskUserQuestion to confirm before proceeding.
For smaller scopes, proceed directly.

---

## Step 3: Write Reference Documentation First

Read the full Step 3 in `references/writing-quadrants.md` before doing this step.

## Step 4: Write Explanation Documentation

Read the full Step 4 in `references/writing-quadrants.md` before doing this step.

## Step 5: Write How-To Guides

Read the full Step 5 in `references/writing-quadrants.md` before doing this step.

## Step 6: Write Tutorials

Read the full Step 6 in `references/writing-quadrants.md` before doing this step.

---

## Step 7: Cross-Document Linking & Discoverability

After writing all documents:

1. **Add cross-links between quadrants.** Every reference doc should link to its how-to.
   Every how-to should link to its reference. Tutorials should link to both.

2. **Update entry-point files.** Add references to new docs in:
   - README.md — add to documentation section or table of contents
   - CLAUDE.md / AGENTS.md — add to project structure if relevant
   - Any existing docs index or sidebar config

3. **Verify discoverability.** Every new document must be reachable within 2 clicks from
   README.md. If a docs framework is in use, add to the sidebar/nav config.

4. **Check for broken links.** Grep for any `](` references that point to files that don't exist.

---

## Step 8: Quality Self-Review

Before committing, review each document against these criteria:

**Accuracy gate:**
- [ ] Every code example compiles / runs / passes if copy-pasted
- [ ] Every API description matches the actual code signature
- [ ] Every command shown produces the output described
- [ ] No stale references to renamed/removed entities

**Completeness gate:**
- [ ] Reference docs cover 100% of public surface
- [ ] How-tos cover the top 3 tasks a user would attempt
- [ ] Tutorials get to a working result in ≤3 steps
- [ ] Explanation docs name trade-offs, not just choices

**Voice gate:**
- [ ] Written for a smart person who hasn't seen the code
- [ ] No jargon without brief inline gloss on first use
- [ ] Active voice, concrete nouns, short sentences
- [ ] "You can now..." not "The system provides..."

Fix any failures before proceeding.

---

## Step 9: Commit & Output

Read the full Step 9 in `references/publishing.md` before doing this step. Its commit,
push and existing-PR update functions remain subject to the shared action/publication contracts.

---

## Important Rules

- **Research before writing.** Step 1 is not optional. Read the code, read the tests, read the
  existing docs. Insufficient research produces surface-level documentation.
- **Accuracy is non-negotiable.** Every code example must work. Every API description must match
  the actual code. If you're unsure about a detail, read the source again — do not guess.
- **Diataxis quadrants serve different readers.** Do not mix tutorial content into reference docs
  or reference content into how-tos. Each quadrant has a specific reader in a specific mode.
- **Time to first result in tutorials.** If a reader can't see something working by step 3,
  restructure the tutorial.
- **Cross-link everything.** Isolated docs are undiscoverable docs.
- **Voice: friendly, concrete, user-forward.** Write like you're explaining to a smart person
  who hasn't seen the code. Never corporate, never academic.
- **Completeness over minimalism.** AI makes comprehensive documentation cheap. Don't write
  "minimal viable docs" — write complete docs. Boil the ocean.
