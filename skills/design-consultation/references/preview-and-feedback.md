## Phase 5: Design System Preview (default ON)

This phase generates visual previews of the proposed design system. Two paths depending on whether the approved image generator is available.

### Path A: AI Mockups (if DESIGN_READY)

Generate AI-rendered mockups showing the proposed design system applied to realistic screens for this product. This is far more powerful than an HTML preview — the user sees what their product could actually look like.

Set `_DESIGN_DIR` to the approved local artifact directory using [the tool/path mapping](tool-mapping.md).

Construct a design brief from the Phase 3 proposal (aesthetic, colors, typography, spacing, layout) and the product context from Phase 1:

```
Operation: variants; count: 3; output directory: _DESIGN_DIR
Brief: Product name: [name]. Product type: [type]. Aesthetic: [direction]. Colors: primary [hex], secondary [hex], neutrals [range]. Typography: display [font], body [font]. Layout: [approach]. Show a realistic [page type] screen with [specific content for this product].
```

Run quality check on each variant:

```
Operation: check; image: _DESIGN_DIR/variant-A.png; brief: the original brief
```

Show each variant inline (Read tool on each PNG) for instant preview.

**Before presenting to the user, self-gate:** For each variant, ask yourself: *"Would
a human designer be embarrassed to put their name on this?"* If yes, discard the
variant and regenerate. This is a hard gate. A mediocre AI mockup is worse than no
mockup. Embarrassment triggers include: purple gradient hero, 3-column SaaS grid,
centered-everything, Inter body text, generic stock-photo vibe, system-ui font,
gradient CTA button, bubble-radius everything. Any of those = reject and regenerate.

Tell the user: "I've generated 3 visual directions applying your design system to a realistic [product type] screen. Pick your favorite in the comparison board at [actual local path or approved URL]. You can also remix elements across variants."

### Comparison Board + Feedback Loop

Create the comparison board using [the static board](../assets/comparison-board.html) and the approved returned images. Place it next to the variants in `_DESIGN_DIR`. Open or serve it only through an approved available mechanism in [the tool/path mapping](tool-mapping.md); no server/daemon is required.

**PRIMARY WAIT: AskUserQuestion with board path/URL**

After the board is available, use AskUserQuestion to wait for the user. Include the
board path/URL so they can click it if they lost the browser tab:

"I've prepared a comparison board with the design variants:
[actual board path/URL] — Rate them, leave comments, remix
elements you like, and click Submit when you're done. Let me know when you've
submitted your feedback (or paste your preferences here). If you clicked
Regenerate or Remix on the board, tell me and I'll generate new variants."

**Do NOT use AskUserQuestion to ask which variant the user prefers.** The comparison
board IS the chooser. AskUserQuestion is just the blocking wait mechanism.

**After the user responds to AskUserQuestion:**

Read the feedback the user supplied from the board:
- `feedback.json` — downloaded when user clicks Submit (final choice)
- `feedback-pending.json` — downloaded when user clicks Regenerate/Remix/More Like This

The feedback JSON has this shape:
```json
{
  "preferred": "A",
  "ratings": { "A": 4, "B": 3, "C": 2 },
  "comments": { "A": "Love the spacing" },
  "overall": "Go with A, bigger CTA",
  "regenerated": false
}
```

**If `feedback.json` found:** The user clicked Submit on the board.
Read `preferred`, `ratings`, `comments`, `overall` from the JSON. Proceed with
the approved variant.

**If `feedback-pending.json` found:** The user clicked Regenerate/Remix on the board.
1. Read `regenerateAction` from the JSON (`"different"`, `"match"`, `"more_like_B"`,
   `"remix"`, or custom text)
2. If `regenerateAction` is `"remix"`, read `remixSpec` (e.g. `{"layout":"A","colors":"B"}`)
3. Generate new variants using the mapped `iterate` or `variants` capability with updated brief
4. Create new board with the returned images
5. Reload the local board in the user's browser (or use the approved runner's supported reload)
6. **AskUserQuestion again** with the same board path/URL to wait for the next round of feedback. Repeat until `feedback.json` appears.

**If `NO_FEEDBACK_FILE`:** The user typed their preferences directly in the
AskUserQuestion response instead of using the board. Use their text response
as the feedback.

**BOARD FALLBACK:** If the comparison board cannot be used, show each variant inline using the Read tool (so the user can see them),
then use AskUserQuestion:
"The comparison board is unavailable. I've shown the variants above.
Which do you prefer? Any feedback?"

**After receiving feedback (any path):** Output a clear summary confirming
what was understood:

"Here's what I understood from your feedback:
PREFERRED: Variant [X]
RATINGS: [list]
YOUR NOTES: [comments]
DIRECTION: [overall]

Is this right?"

Use AskUserQuestion to verify before proceeding.

**Save the approved choice:**

Write `_DESIGN_DIR/approved.json` through the approved local file tool:
```json
{
  "approved_variant": "<V>",
  "feedback": "<FB>",
  "date": "<ISO timestamp>",
  "screen": "<SCREEN>",
  "branch": "<actual branch>"
}
```

After the user picks a direction:

- Use the mapped `extract` capability on `_DESIGN_DIR/variant-<CHOSEN>.png` to analyze the approved mockup and extract design tokens (colors, typography, spacing) that will populate DESIGN.md in Phase 6. This grounds the design system in what was actually approved visually, not just what was described in text.
- If the user wants to iterate further: use the mapped `iterate` capability with the user's feedback and output `_DESIGN_DIR/refined.png`.

**Plan mode vs. implementation mode:**
- **If in plan mode:** Add the approved mockup path (the full `$_DESIGN_DIR` path) and extracted tokens to the plan file under an "## Approved Design Direction" section. The design system gets written to DESIGN.md when the plan is implemented.
- **If NOT in plan mode:** Proceed directly to Phase 6 and write DESIGN.md with the extracted tokens.

### Path B: HTML Preview Page (fallback if DESIGN_NOT_AVAILABLE)

Generate a polished HTML preview page and open it in the user's browser. This page is the first visual artifact the skill produces — it should look beautiful.

Set `PREVIEW_FILE` to an approved local HTML path using [the tool/path mapping](tool-mapping.md). Write the preview HTML to `$PREVIEW_FILE`, then open it using the approved host mechanism.

### Preview Page Requirements (Path B only)

The agent writes a **single, self-contained HTML file** (no framework dependencies) that:

1. **Loads proposed fonts** from Google Fonts (or Bunny Fonts) via `<link>` tags
2. **Uses the proposed color palette** throughout — dogfood the design system
3. **Shows the product name** (not "Lorem Ipsum") as the hero heading
4. **Font specimen section:**
   - Each font candidate shown in its proposed role (hero heading, body paragraph, button label, data table row)
   - Side-by-side comparison if multiple candidates for one role
   - Real content that matches the product (e.g., civic tech → government data examples)
5. **Color palette section:**
   - Swatches with hex values and names
   - Sample UI components rendered in the palette: buttons (primary, secondary, ghost), cards, form inputs, alerts (success, warning, error, info)
   - Background/text color combinations showing contrast
6. **Realistic product mockups** — this is what makes the preview page powerful. Based on the project type from Phase 1, render 2-3 realistic page layouts using the full design system:
   - **Dashboard / web app:** sample data table with metrics, sidebar nav, header with user avatar, stat cards
   - **Marketing site:** hero section with real copy, feature highlights, testimonial block, CTA
   - **Settings / admin:** form with labeled inputs, toggle switches, dropdowns, save button
   - **Auth / onboarding:** login form with social buttons, branding, input validation states
   - Use the product name, realistic content for the domain, and the proposed spacing/layout/border-radius. The user should see their product (roughly) before writing any code.
7. **Light/dark mode toggle** using CSS custom properties and a JS toggle button
8. **Clean, professional layout** — the preview page IS a taste signal for the skill
9. **Responsive** — looks good on any screen width

The page should make the user think "oh nice, they thought of this." It's selling the design system by showing what the product could feel like, not just listing hex codes and font names.

Use [the local HTML preview example](../assets/design-preview.html) to supply the originally requested preview functions; replace its sample product/tokens/fonts/layouts with the proposal. Font loading and browser opening are governed by the separate mapping, not implicit permissions.

If opening fails (headless environment), tell the user: *"I wrote the preview to [path] — open it in your browser to see the fonts and colors rendered."*

If the user says skip the preview, go directly to Phase 6.
