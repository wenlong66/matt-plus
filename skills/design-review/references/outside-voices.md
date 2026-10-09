## Design Outside Voices (parallel)

**Host guard:** Select a genuinely different harness using the shared [image/outside-model association](../../../references/image-tools.md): Codex host → Claude Code; Claude Code host → Codex. The harness identity, not a model overlay, selects the reviewer. Recheck immediately before dispatch; unknown or conflicting host identity stops the outside call. Never invoke the current host through an alias, alternate tool or subagent wrapper and call it external coverage. Tools being installed is not consent; run either voice only within its separately approved scope.

The original automatic Codex command association is replaced by the approved available outside-model/subagent associations in [tool/path mapping](tool-mapping.md). Read that mapping and the shared external-action/image-model adapters before calling either voice. Keep the original domain prompts below; no automatic installation, authentication, network/search flag, or global review-log write.

Disabled/declined is terminal: skip both optional voices without a native replacement. When enabled, a non-ready outside provider retains its failure/repair notice and uses only the native voice, with missing outside coverage recorded. When ready, run both voices independently, overlap if supported, and await both results before synthesis. A failed outside attempt does not launch a second copy of an already-started native voice.

### 1. Outside design voice (approved actual harness association)

```
Review the frontend source code in this repo. Evaluate against these design hard rules:
- Spacing: systematic (design tokens / CSS variables) or magic numbers?
- Typography: expressive purposeful fonts or default stacks?
- Color: CSS variables with defined system, or hardcoded hex scattered?
- Responsive: breakpoints defined? calc(100svh - header) for heroes? Mobile tested?
- A11y: ARIA landmarks, alt text, contrast ratios, 44px touch targets?
- Motion: one authored moment (an entrance or scroll-linked reveal, ease-out from a visible default) plus state transitions only where they carry information, or zero / ornamental only?
- Cards: used only when card IS the interaction? No decorative card grids?

First classify the visitor's win as PERSUADE (marketing), OPERATE (app UI), READ (docs/articles), EXPERIENCE (work/portfolio) or HYBRID per section, then apply the complete matching rules and craft reflexes supplied from design-hard-rules.md. Use the shared full catalog and role-aware fonts, and calibrate against the actual DESIGN.md flat tokens/intentional choices. Do not invent missing rendered evidence from source.

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

Supply the complete approved bounded frontend content, DESIGN.md constraints and hard-rule/catalog context with the prompt, not only paths. Append the completion request: severity-tag every finding (Critical/High/Medium/Low or P0–P3), or state `NO_FINDINGS`, and end with `Recommendation: <action> because <specific reason>`.

Use a 5-minute timeout (`timeout: 300000`). Follow the shared image/outside-model association to capture actual exit, response, provider stderr, supported Codex events and any wrapper's embedded provider failure separately from outer diagnostics. Resolve `<plugin-root>` from the loaded skill and classify the actual evidence:

```sh
node "<plugin-root>/scripts/outside-review-result.mjs" --verdict --exit <actual-provider-exit> --stderr "<provider-stderr-file>" --events "<codex-events-file>" review "<response-text-file>"
```

Omit `--events` only when the interface produces none. Gate exits 0/3 mean completed (3 retains P0/P1 findings); 1/4 or invalid/missing evidence means missing outside coverage, not a clean review. Refusal, timeout, empty output, sandbox/command failure or missing markers cannot fill a scorecard cell. Inspect and redact real diagnostics privately before reporting. Record actual host, provider, source/status, session and modelUsage when supplied; native-only success remains outside unavailable and no primary model is invented for multi-model usage.

### 2. Native design subagent (approved independent in-host association)

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
