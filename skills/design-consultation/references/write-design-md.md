## Phase 6: Write DESIGN.md & Confirm

If the mapped `extract` capability was used in Phase 5 (Path A), use the extracted tokens as the primary source for DESIGN.md values — colors, typography, and spacing grounded in the approved mockup rather than text descriptions alone. Merge extracted tokens with the Phase 3 proposal (the proposal provides rationale and context; the extraction provides exact values).

**If in plan mode:** Write the DESIGN.md content into the plan file as a "## Proposed DESIGN.md" section. Do NOT write the actual file — that happens at implementation time.

**If NOT in plan mode:** Write `DESIGN.md` to the repo root with [this structure](../assets/design-system-template.md).

**Update CLAUDE.md** (or create it if it doesn't exist) — append this section:

```markdown
## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.
```

**AskUserQuestion Q-final — show summary and confirm:**

List all decisions. Flag any that used agent defaults without explicit user confirmation (the user should know what they're shipping). Options:
- A) Ship it — write DESIGN.md and CLAUDE.md
- B) I want to change something (specify what)
- C) Start over

The file-write associations and separate authorization for project instruction changes are in [tool/path mapping](tool-mapping.md). In particular, prepare content for confirmation before performing an unapproved write.
