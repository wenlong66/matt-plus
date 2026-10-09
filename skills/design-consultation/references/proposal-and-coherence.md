## Phase 3: The Complete Proposal

Read this section in full, then apply its design/font rules → draft independently → offer outside voices → synthesize for Q2. Preview and writes require their later approvals. This is the soul of the skill: propose EVERYTHING as one coherent package.

### Calibration and font-selection procedure (before drafting Q2)

Read the full [design catalog](../../../references/design-catalog.md), including its role-scoped fonts and all non-polish slop entries; do not substitute the old abbreviated blacklist.

**Calibration: the three looks.** Avoid predictable compositions: cream/serif/terracotta; near-black/neon/glowing edges; or broadsheet hairlines/italic serif/tiny tracked mono. Use one only when the brief specifically calls for it. Otherwise choose a direction grounded in these users, rather than the category stereotype or its obvious opposite. For example, a book product can draw color from jackets and cloth instead of defaulting to cream and serif.

**Choosing faces: a procedure, not a menu.**
1. Name the audience's world (publication, notation, identity or object they read) and visitor mode per surface: **Persuade** (marketing), **Operate** (tasks), **Read** (long content), **Experience** (immersive). Match its tone.
2. Shortlist **three faces per display/body/label/mono role**; a face may serve multiple roles, but justify the assignments.
3. Apply the role exclusions in the shared catalog. Never an overused display face; the explicit body/UI exceptions only apply to Operate or Read. Banned faces stay banned in all roles unless the user specifically requests one by name.
4. Check each proposed family's **official Google Fonts/Fontshare listing**, via approved search/browser access, for exact name, required weights, license and loading URL. For a local face inspect its actual files and license. Omit faces you cannot verify. A catalog's historic verification date is not in-session verification.
5. Specify the verified loading source and strategy (self-hosting/CDN, weights, subsets and fallback). Inspect actual loading before claiming the preview rendered a face; an image's guessed font identity is not verification.

**Font-verification fallback:** Skipping competitive research does not waive font verification. Offline, check local files/licenses. Otherwise describe roles/weights/proportions; mark font selection as **pending verification** in DESIGN.md. Continue palette/layout; defer the preview until fonts can be verified, or honor a user skip. Invent no face or URL; omit unverified `fontFamily` tokens.

### Independent proposals, then synthesis

Draft your own direction from the complete Phase 1 product brief: fill Q2's aesthetic, palette, role-specific type, layout, spacing, motion and **two deliberate risks** before dispatching either voice. Keep that draft out of both prompts; send the same brief, not your answer. Read [outside voices](outside-voices.md) and ask for opt-in only now.

Compare completed proposals: explain agreements, differences and adopted ideas with attribution. Verify newly suggested fonts with the same procedure before adoption. Tie the recommendation to the memorable-thing answer. Do not count agreement as a vote or invent a missing proposal. Q2 names completed, unavailable, unverified or declined voices and presents the recommendation. Preserve actual statuses, provider/modelUsage (including multiple models), and limitations even if only the native voice succeeded.

**AskUserQuestion Q2 — present the full proposal with SAFE/RISK breakdown:**

```
Based on [product context] and [research findings / my design knowledge]:

AESTHETIC: [direction] — [one-line rationale]
DECORATION: [level] — [why this pairs with the aesthetic]
LAYOUT: [approach] — [why this fits the product type]
COLOR: [approach] + proposed palette (hex values) — [rationale]
TYPOGRAPHY: [display, body, label, mono assignments; a face may serve multiple roles] — [why these fonts]
SPACING: [base unit + density] — [rationale]
MOTION: [approach] — [rationale]

This system is coherent because [explain how choices reinforce each other].

INDEPENDENT INPUT: [completed/unavailable/unverified/skipped voices; agreements, differences, ideas adopted and product-specific reasons — omit comparisons if none completed]

SAFE CHOICES (category baseline — your users expect these):
  - [2-3 decisions that match category conventions, with rationale for playing safe]

RISKS (where your product gets its own face):
  - [2-3 deliberate departures from convention]
  - For each risk: what it is, why it works, what you gain, what it costs

The safe choices keep you literate in your category. The risks are where
your product becomes memorable. Which risks appeal to you? Want to see
different ones? Or adjust anything else?
```

The SAFE/RISK breakdown is critical. Design coherence is table stakes — every product in a category can be coherent and still look identical. The real question is: where do you take creative risks? The agent should always propose at least 2 risks, each with a clear rationale for why the risk is worth taking and what the user gives up. Risks might include: an unexpected typeface for the category, a bold accent color nobody else uses, tighter or looser spacing than the norm, a layout approach that breaks from convention, motion choices that add personality.

**Options:** A) Looks great — proceed to Phase 5 if fonts are verified. B) Adjust [section] — Phase 4, then Q2 again. C) Different risks — revise the proposal, then Q2 again. D) Start over — draft another direction using the same confirmed brief. E) Skip the preview — proceed to Phase 6's Q-final, not straight to writing.

Revisions recheck fonts and coherence. If the product brief changes, label **all old proposals stale** (primary and independent), invalidate prior approvals, and offer fresh independent voices; do not claim they reviewed new context.

### Your Design Knowledge (use to inform proposals — do NOT display as tables)

**Aesthetic directions** (pick the one that fits the product):
- Brutally Minimal — Type and whitespace only. No decoration. Modernist.
- Maximalist Chaos — Dense, layered, pattern-heavy. Y2K meets contemporary.
- Retro-Futuristic — Vintage tech nostalgia. Phosphor palette, bitmap type, warm monospace for data (no glow halos, no grid-paper backgrounds).
- Luxury/Refined — Serifs, high contrast, generous whitespace, precious metals.
- Playful/Toy-like — Rounded, springy (no overshoot), bold primaries. Approachable and fun.
- Editorial/Magazine — Strong typographic hierarchy, asymmetric grids, pull quotes.
- Brutalist/Raw — Exposed structure, one utilitarian grotesk, visible grid, no polish (a system stack only when the user asks for it by name).
- Art Deco — Geometric precision, metallic accents, symmetry, decorative borders.
- Organic/Natural — Earth tones, rounded forms, hand-drawn texture, grain.
- Industrial/Utilitarian — Function-first, data-dense, monospace accents, muted palette.

**Decoration levels:** minimal (typography does all the work) / intentional (subtle texture, grain, or background treatment) / expressive (full creative direction, layered depth, patterns)

**Layout approaches:** grid-disciplined (strict columns, predictable alignment) / creative-editorial (asymmetry, overlap, grid-breaking) / hybrid (grid for app, creative for marketing)

**Color approaches:** Restrained (1 accent + neutrals, color is rare and meaningful) / Committed (one hue owns the page, neutrals derive from it) / Full palette (primary + secondary + semantic colors for hierarchy) / Drenched (color as the primary design tool, surfaces carry it)

**Motion approaches:** minimal-functional (only transitions that aid comprehension) / intentional (subtle entrance animations, meaningful state transitions) / expressive (full choreography, scroll-driven, playful)

**Role-scoped font lists:** Use the complete overused-display, banned-all-roles, body/UI exception, mono and freely available lists in [design catalog](../../../references/design-catalog.md). Fine as body/UI on an Operate or Read surface when the proposal says so: DM Sans, Instrument Sans, IBM Plex Sans. Mono for data/code: JetBrains Mono, IBM Plex Mono, Fira Code. Re-verify every proposed face in-session, including catalog suggestions. A long list of "good" fonts is how the last convergence happened. User asks for a listed face by name: comply, state the tradeoff once.

**Anti-convergence directive:** VARY aesthetic, faces and palette across project generations; justify repetition. **Light vs dark is not one of the dials:** fix it to the use scene (who, where, lighting) until that scene changes. Unjustified convergence is slop.

**AI slop anti-patterns:** Read and apply all non-polish slop bullets in the full shared catalog before proposing or previewing, including palette, composition, type, surface, states, copy, motion and imagery. No detector or impeccable skill invocation is implied. The catalog is design guidance, not evidence of a rendered or automated check.

### Coherence Validation

When the user overrides one section, check if the rest still coheres. Flag mismatches with a gentle nudge — never block:

- Brutalist/Minimal aesthetic + expressive motion → "Heads up: brutalist aesthetics usually pair with minimal motion. Your combo is unusual — which is fine if intentional. Want me to suggest motion that fits, or keep it?"
- Drenched color + restrained decoration → "Bold palette with minimal decoration can work, but the colors will carry a lot of weight. Want me to suggest decoration that supports the palette?"
- Creative-editorial layout + data-heavy product → "Editorial layouts are gorgeous but can fight data density. Want me to show how a hybrid approach keeps both?"
- Always accept the user's final choice. Never refuse to proceed.

## Phase 4: Drill-downs (only if user requests adjustments)

When the user wants to change a specific section, go deep on that section:

- **Fonts:** Present 3-5 verified candidates with roles and rationale, explain what each evokes, offer the preview page
- **Colors:** Present 2-3 palette options with hex values, explain the color theory reasoning
- **Aesthetic:** Walk through which directions fit their product and why
- **Layout/Spacing/Motion:** Present the approaches with concrete tradeoffs for their product type

Each drill-down is one focused AskUserQuestion. After the user decides, carry the adjustment into the full Q2 proposal, re-check affected fonts and coherence, then ask Q2 again before previewing.
