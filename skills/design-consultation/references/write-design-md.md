## Phase 6: Write DESIGN.md & Confirm

Read the complete [DESIGN.md format contract](../../../references/design-md-format.md) and [spec template](../../../assets/design-system-spec-template.md) before preparing the final content. The preserved [legacy example](../assets/design-system-template.md) is only for an explicitly kept legacy shape, not new/fresh/converted files. Only Path A invokes extract, isolated in a fresh non-repository scratch directory as in Phase 5. For Path B, use the **approved HTML preview's CSS values**. No preview or failed extraction: use approved Phase 3 values and disclose the fallback; mark only unverified fonts pending. Retain rationale and **unchanged existing decisions**.

### Confirm before writing

Prepare and show the **complete intended DESIGN.md content**, not just a summary. Identify every token's source (approved mockup extraction, approved HTML CSS, retained existing token or Phase 3 fallback), extraction discrepancies, all pending fonts and what could not be verified. Show decisions and agent-selected defaults together with this preview, plus the exact Phase 0 format choice and any backup/conversion/marker operation.

Show the **exact instruction-file path and guidance diff** you would add/update, or explicitly state "no instruction-file change". DESIGN.md approval and instruction-file approval are **independent**: accepting a direction, approved.json or DESIGN.md never authorizes CLAUDE.md/AGENTS.md. Preserve existing instruction content and avoid duplicate equivalent pointers. Do not create an instruction file unless that exact creation was authorized.

**AskUserQuestion Q-final:**
- A) Approve the exact DESIGN.md content and chosen format operations; separately choose whether to authorize the shown instruction-file diff. In plan mode, approve saving Proposed DESIGN.md in the plan only.
- B) Revise — return to Phase 3, then confirm again.
- C) Start over — return to Phase 1.

Wait. Only explicit approval of the **exact writes** permits them; B/C leave project files untouched. Honor prior explicit approval of these exact contents/actions without re-asking. **Any token, font, direction or product-brief change invalidates approval**: update the proposal, reverify affected fonts/preview and ask Q-final again. A changed brief also makes all old independent and primary proposals stale.

**Plan mode:** Save the complete content and format choice through the host's authorized plan-output mechanism under "## Proposed DESIGN.md" with approved mockup paths/token evidence. Do NOT convert, mark or write the actual DESIGN.md or an instruction file. Repository writes wait for implementation authorization; if no plan-output mechanism is available, provide the content in chat.

### Apply only the approved format choice

Outside plan mode, target root `DESIGN.md`, never a lone prior `design-system.md`.

- **New / fresh / converted / existing spec:** use google-labs-code/design.md format in the template: the five normative YAML groups **colors, typography, rounded, spacing, components** and eight canonical sections **Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts**. Preserve `---` on line 1 and `# gstack: design-md-format=spec` on line 2. Prose explains rationale/use rather than duplicating token values.
- **Convert:** after Q-final, `node "<plugin-root>/scripts/design-md.mjs" convert DESIGN.md --write` creates a non-overwriting `.legacy.bak` before conversion. Inspect the prepared conversion for correct extracted values; retain the title/preamble, every extra section, **Motion** and **Decisions Log**, and unrelated user content. The converter alone is not a complete newly approved system; apply only the approved changes afterward. Refusal leaves the original unchanged; disclose and ask whether to keep its shape or start fresh.
- **Fresh replacement:** preserve the entire prior file in a collision-bumped backup **before** replacing it. Fresh choice in Phase 0 did not authorize early replacement.
- **Keep legacy:** retain its original shape/order and unrelated decisions; only the explicitly selected legacy path uses `node "<plugin-root>/scripts/design-md.mjs" mark legacy-keep DESIGN.md`. Do not convert to make validation report spec.
- **Unknown Update:** retain its own shape and report the reason/limitations; do not silently mark it legacy or convert it.

For all writes use real approved token values, no placeholders. Omit invented components and unverified `fontFamily` values; describe pending roles/weights/proportions in Typography prose. Preserve Motion's approach/easing/durations/authored moment, Decisions Log and other extras. Use the single shared root [spec template](../../../assets/design-system-spec-template.md), which retains the full fixed-source consultation example. This skill's original template stays legacy-only; do not generate a second drifting spec template.

After writing, run the local read-only check:

```bash
node "<plugin-root>/scripts/design-md.mjs" check DESIGN.md
```

Require `DESIGN_MD_FORMAT: spec` for new/fresh/converted/spec files; `legacy` with `DESIGN_MD_MARKER: legacy-keep` for a kept legacy file; or the **disclosed unknown** for a preserved unknown file. Run `tokens DESIGN.md` for spec values and inspect reported reference errors. Never convert a kept file merely to pass. Report helper failures or mismatches rather than claiming successful validation.

### Separately authorized instruction pointer

Only outside plan mode and only when its exact diff was independently approved, append/update the chosen project instruction file (CLAUDE.md in the source workflow; use the project's actual instruction file if explicitly authorized):

```markdown
## Design System
Read DESIGN.md before visual or UI work: it defines the fonts, colors, spacing, and
aesthetic direction. Ask the user before departing from it. When reviewing or QA-ing
UI, flag code that doesn't match DESIGN.md.
```

No shipping, commit/push or cross-skill handoff is implied. Finish with the actual written/plan paths, verification result, remaining pending fonts/token limitations and any instruction change that was explicitly approved.
