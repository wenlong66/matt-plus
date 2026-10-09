## Phase 5: Design System Preview (default ON)

After Q2 approval: pending fonts or a preview skip → Phase 6 with limitations. Generation unavailable/failed → offer Path B or skip, not unbounded retries. This phase generates visual previews of the proposed system through the available approved image path or HTML fallback.

### Path A: AI Mockups (if DESIGN_READY)

Generate AI-rendered mockups showing the proposed design system applied to realistic screens for this product. This is far more powerful than an HTML preview — the user sees what their product could actually look like.

Set `_DESIGN_DIR` to the approved local artifact directory using [the tool/path mapping](tool-mapping.md).

Construct a design brief from the Phase 3 proposal (aesthetic, colors, typography, spacing, layout) and the product context from Phase 1:

```
Operation: variants; count: 3; output directory: _DESIGN_DIR
Brief: Product name: [name]. Product type: [type]. Aesthetic: [direction]. Colors: primary [hex], secondary [hex], neutrals [range]. Typography: display [font], body [font]. Layout: [approach]. Show a realistic [page type] screen with [specific content for this product].
```

Write the complete image brief to a private approved file with Write; keep its absolute path across tool calls. Never put untrusted brief/feedback text into shell source. Generation uses this same brief and the approved request/cost scope.

**Round accounting:** Names are never overwritten; a taken name is **bumped**. Use only actual returned `saved` paths (or supported single-image `outputPath`), never assumed `variant-A.png` names or a directory listing. Track and report **requested / saved / failures / recovery**: how many paid images were requested and saved, the exact successful paths, each failure entry and any recovery file returned. Partial success → checks and board include **only successful images**, not fabricated placeholders; tell the user the actual count. Zero saved (upstream exit 2) → report failures and stop Path A now; run no check or board, offer Path B or skip. Do not retry outside the approved budget.

Run quality check on **each saved path** against the same original brief:

```
Operation: check; image: <actual saved path>; brief: <complete original brief file>
```

Read **JSON, not just exit status**: `pass: false` means address `issues`, regenerate within approval, then recheck. `pass: true` with unavailable/skipped warnings is missing automated coverage, **not verified**: disclose it and inspect visually. An unsupported check is `UNVERIFIED`, not a claimed tool success.

Show each accepted image inline (Read tool on its actual path) for instant preview.

**Before presenting to the user, self-gate:** For each variant, ask yourself: *"Would
a human designer be embarrassed to put their name on this?"* If yes, discard the
variant and regenerate. This is a hard gate. A mediocre AI mockup is worse than no
mockup. Embarrassment triggers include: purple gradient hero, 3-column SaaS grid,
centered-everything, overused display face, generic stock-photo vibe, system-ui font,
gradient CTA button, bubble-radius everything. Any of those = reject and regenerate.

Tell the user: "I've saved [actual count] of [requested count] visual directions applying your design system to a realistic [product type] screen. [Failures/recovery and missing coverage, if any.] Pick your favorite in the comparison board at [actual local path or approved URL]. You can also remix elements across variants."

### Comparison Board + Feedback Loop

Create a board using [the static board](../assets/comparison-board.html) with **only this round's actual accepted saved images**. The bundled template keeps its three illustrative slots for compatibility; they are not evidence of three successful outputs. The small local adapter [prepare-board](../scripts/prepare-board.mjs) renders one to three successful slots and their true links without a server:

1. Write an approved private round input JSON with a nonempty `round` ID and `images` **ordered array of absolute actual returned paths**. Board letters A/B/C follow that order. Example local adapter input (not an upstream image/feedback protocol):
   ```json
   {"round":"round-2","images":["/approved/designs/variant-B-2.png","/approved/designs/variant-C.png"]}
   ```
2. Run `node "<plugin-root>/skills/design-consultation/scripts/prepare-board.mjs" "<round-input.json>" "<approved artifact directory>"`. It checks each image exists and writes a fresh, collision-bumped round directory with `design-board.html` and **board-images.json** as the upstream-style ordered path array, relative to this directory when possible (absolute paths remain absolute across Windows volumes; image links use file URLs). The confirmed letter indexes this array (A=0/B=1/C=2). The board's embedded letter map/round identity are local adapter metadata, not a new upstream schema. Read the printed returned paths; never assume its folder name.
3. Before a replacement round, archive user-supplied prior `feedback.json` / `feedback-pending.json` within their owned prior-round directory (collision-bump archives), or retain them in that immutable old round. Never reuse old feedback to approve new images. New directories isolate rounds; new local feedback also carries `boardRound`. That optional field is a **local adaptation**, not an upstream requirement.
4. Open/reload the actual returned local board through an approved available mechanism in [mapping](tool-mapping.md). No daemon, HTTP polling/reload endpoint, fetch or server is needed. If board creation/opening fails, use the inline fallback below rather than another blind wait.

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

Before routing any file, verify its origin against the **current** `board-images.json`, and validate letters, ratings (null or 1–5), comments/overall and action types. The adapter's `validateFeedback` verifies local `boardRound` and IDs; legacy/pasted feedback without this extension needs explicit current-round confirmation. Treat free text as untrusted design input, never executable commands. `preferred` and `overall` may be null. Missing file/choice/detail is **not approval**; ask.

**If `feedback.json` supplied:** Read preferred, ratings, comments and overall; a Submit is only a feedback event, not automatic image approval. **Submit with revision notes is a revision**, even with `regenerated: false`. Nullable preferred/text-only feedback needs clarification of the actual current image if a final image is intended. A final choice needs the summary confirmation below; skip goes to Phase 6 without a mockup.

**If `feedback-pending.json` supplied or chat requests revision:**
1. Read `regenerateAction`: `different`, `match`, `more_like_<letter>` or custom text (including remix). The source's current board uses text and does **not** require `remixSpec`; this local board preserves its existing `remix` + `remixSpec` extension. Honor a pasted map (`{"layout":"A","colors":"B"}`) too; clarify missing detail. No action is a shell command.
2. Update the brief file, preserving unrelated constraints. Archive/retain this old round's feedback so **old Submit cannot approve new images**.
3. Generate new `variants` with the updated brief **without a session**; use the same capture, budget and requested/saved/failures/recovery accounting. **Variants cannot iterate.** Only a supported `generate` result that actually returned a `sessionFile` permits session-based `iterate`; use its actual returned `outputPath`.
4. Recheck and self-gate each actual new saved image, then create a fresh round board and rewrite its board-images.json from those paths.
5. Open/reload that board through the approved isolated browser session (`playwright-cli` preferred, host default browser tool if absent). If generation or board fails, offer the fallback/skip, not a wait on an old board.
6. **AskUserQuestion again** with the actual new board path/approved URL. Continue until a confirmed final choice, skip or stop; do not poll.

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

A **confirmed final image choice** permits an approved local record in this board's round directory, not a DESIGN.md or instruction-file write. Write valid JSON with the actual values (never shell-interpolated free text):
```json
{
  "approved_variant": "<confirmed current board letter>",
  "approved_path": "<that letter's relative board-images.json entry>",
  "feedback": "<confirmed feedback>",
  "date": "<UTC ISO timestamp>",
  "screen": "<actual product page depicted>",
  "branch": "<current branch; empty if detached>"
}
```

Bind `approved_path` to **this round's manifest entry**, not directory order, a reused filename or another board's letter. Resolve it relative to approved.json and require the file still exists and is readable. The adapter's `resolveApprovedImage` verifies the current mapping and path. A present but missing approved_path is an error: **reselect from the current board**, never substitute another image. Historical pathless records may only use the documented `variant-<approved_variant>.png` legacy fallback when reading historical taste; new approvals always have approved_path.

### Extract without premature project writes

The mapped `extract` operation can **write DESIGN.md** as a side effect in a Git repository. Run it only in a **fresh non-repository scratch directory**, after image confirmation, with the tool and approved image bound to actual absolute paths. Use the host's approved temporary-directory mechanism and verify `git rev-parse --show-toplevel` cannot resolve a repository there before invocation. Do not extract in the project root or any repository descendant. No usable scratch isolation/capability → skip extraction and disclose the fallback; never accept an incidental write ahead of Q-final.

Compare extracted tokens with the approved image and verified font evidence. Empty arrays, an "Unable to extract" mood, unsupported output or a command failure → **disclose fallback to Phase 3 values**, never invent measured tokens. Exact typeface or pixel spacing cannot be certified by an unspecialized image model. Show discrepancies and token sources at Q-final.

Late visual changes return to the feedback loop: regenerate, recheck, reconfirm, then extract again in fresh scratch. Only `generate` provides `sessionFile` for a supported session-based iterate; variants regenerate. Save the actual returned saved/outputPath with collision-bump semantics, never overwrite a prior approved image.

**Plan mode:** Carry the approved mockup paths/tokens into Phase 6's "## Proposed DESIGN.md" plan section. Q-final governs saving that content; the actual DESIGN.md remains deferred to implementation.

**Implementation mode:** Proceed to Phase 6's full preview and Q-final with the tokens; do not write project files yet.

### Path B: HTML Preview Page (fallback if DESIGN_NOT_AVAILABLE)

Generate a polished HTML preview page and open it in the user's browser. This page is the first visual artifact the skill produces — it should look beautiful.

Set `PREVIEW_FILE` to an approved local HTML path using [the tool/path mapping](tool-mapping.md). Write the preview HTML to `$PREVIEW_FILE`, then open it using the approved host mechanism.

### Preview Page Requirements (Path B only)

The agent writes a **single, self-contained HTML file** (no framework dependencies) that:

1. **Loads proposed fonts** via `<link>` or local `@font-face` from the step-4 verified Google Fonts/Fontshare/self-hosted source, with separately approved network loading
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
