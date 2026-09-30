## Design Outside Voices (parallel)

The original automatic Codex command association is replaced by the approved available outside-model/subagent associations in [tool/path mapping](tool-mapping.md). Read that mapping and the shared external-action/image-model adapters before calling either voice. Keep the original domain prompts below; no automatic installation, authentication, network/search flag, or global review-log write.

### 1. Codex design voice (approved available model association)

```
Review the frontend source code in this repo. Evaluate against these design hard rules:
- Spacing: systematic (design tokens / CSS variables) or magic numbers?
- Typography: expressive purposeful fonts or default stacks?
- Color: CSS variables with defined system, or hardcoded hex scattered?
- Responsive: breakpoints defined? calc(100svh - header) for heroes? Mobile tested?
- A11y: ARIA landmarks, alt text, contrast ratios, 44px touch targets?
- Motion: 2-3 intentional animations, or zero / ornamental only?
- Cards: used only when card IS the interaction? No decorative card grids?

First classify as MARKETING/LANDING PAGE vs APP UI vs HYBRID, then apply matching rules.

LITMUS CHECKS — answer YES/NO:
1. Brand/product unmistakable in first screen?
2. One strong visual anchor present?
3. Page understandable by scanning headlines only?
4. Each section has one job?
5. Are cards actually necessary?
6. Does motion improve hierarchy or atmosphere?
7. Would design feel premium with all decorative shadows removed?

HARD REJECTION — flag if ANY apply:
1. Generic SaaS card grid as first impression
2. Beautiful image with weak brand
3. Strong headline with no clear action
4. Busy imagery behind text
5. Sections repeating same mood statement
6. Carousel with no narrative purpose
7. App UI made of stacked cards instead of layout

Be specific. Reference file:line for every finding.
```

Use a 5-minute timeout (`timeout: 300000`). After the command completes, inspect the actual tool's sanitized error output through its supported interface.

### 2. Claude design subagent (approved independent subagent association)

Dispatch a subagent with this prompt:

```
Review the frontend source code in this repo. You are an independent senior product designer doing a source-code design audit. Focus on CONSISTENCY PATTERNS across files rather than individual violations:
- Are spacing values systematic across the codebase?
- Is there ONE color system or scattered approaches?
- Do responsive breakpoints follow a consistent set?
- Is the accessibility approach consistent or spotty?

For each finding: what's wrong, severity (critical/high/medium), and the file:line.
```

**Error handling (all non-blocking):**
- **Auth failure:** If the actual tool reports authentication/login/unauthorized/API-key failure, report the failed association and let the user resolve authentication; do not log in.
- **Timeout:** Report that the outside model timed out after 5 minutes.
- **Empty response:** Report that the outside model returned no response.
- On any outside-model error: proceed with the independent subagent output only, tagged `[single-model]`.
- If the subagent also fails: "Outside voices unavailable — continuing with primary review."

Present output under the actual participating tool/role's header corresponding to `CODEX SAYS (design source audit):` and `CLAUDE SUBAGENT (design consistency):`; do not claim a provider participated when it did not.

**Synthesis — Litmus scorecard:**

```
DESIGN OUTSIDE VOICES — LITMUS SCORECARD:
═══════════════════════════════════════════════════════════════
  Check                                    Claude  Codex  Consensus
  ─────────────────────────────────────── ─────── ─────── ─────────
  1. Brand unmistakable in first screen?   —       —      —
  2. One strong visual anchor?             —       —      —
  3. Scannable by headlines only?          —       —      —
  4. Each section has one job?             —       —      —
  5. Cards actually necessary?             —       —      —
  6. Motion improves hierarchy?            —       —      —
  7. Premium without decorative shadows?   —       —      —
  ─────────────────────────────────────── ─────── ─────── ─────────
  Hard rejections triggered:               —       —      —
═══════════════════════════════════════════════════════════════
```

Fill in each cell from the actual participating outputs, with column labels mapped to their actual providers. CONFIRMED = both agree. DISAGREE = models differ. NOT SPEC'D = not enough info to evaluate.

Merge findings into the triage with `[codex]` / `[subagent]` / `[cross-model]` tags mapped to the actual sources. The original global log helper is removed; record which optional voices actually ran in the approved local audit output.
