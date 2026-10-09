# Optional Outside Design Voices

**Host guard:** Determine the actual host identity before dispatch. Use an approved genuinely outside provider and/or independent native subagent; never invoke the current CLI as its own outside voice, including through an alias or wrapper. If the only mapped outside tool is Codex on a Codex host, skip that external voice (unavailable), not the independently available native proposal. Unknown host identity requires confirmation. Native-only success never becomes external coverage.

Load only when the user approves independent design-direction proposals. Follow the shared external-actions contract linked from SKILL.md, including the local content-guard scan before sending material outside the session. Confirm which installed external model/tool or available subagent may run, the exact product context it may receive, network/search permissions, and request budget. Tool availability is not consent. Do not install, authenticate, enable web search, or send the whole repository by default.

Use the host's question tool or chat:
> "Want outside design voices? An approved available external model proposes a complete design direction; an independent design subagent proposes a bolder alternative."
>
> A) Yes — run approved outside design voices.
> B) No — proceed without.

Before asking, complete your own Phase 3 direction from the unified product brief (aesthetic, palette, display/body/label/mono, layout, spacing, motion and at least two risks). If the user chooses B, retain one declined/skipped result with source `none` and continue to Q2 with your draft.

If accepted, prepare a private local brief in the approved artifact scope using Write, never interpolating free text into shell source. Both voices receive its **complete identical contents**: product/users, type/use scene, constraints, memorable thing, taste summary and Phase 2 evidence/URLs or declined/unavailable status. Neither inherits session context. Give a native agent the actual absolute brief path and read-only access; include the full brief in the external payload. **Do not disclose the primary draft or either voice's answer to the other.** Inspect approved interfaces and recheck availability/authorization at the actual dispatch; run permitted voices in parallel if supported and await both results, including failures, before synthesis. Keep source access read-only and scoped. The following are domain prompts, not shell commands.

## Voice 1: Complete design direction

```
Given this product context, propose a complete design direction:
- Visual thesis: one sentence describing mood, material, and energy
- Typography: specific font names with display/body/UI roles (no Inter/Roboto/Arial/system defaults); the parent verifies font availability before adoption
- Color system: CSS variables for background, surface, primary text, muted text, accent
- Layout: composition-first, not component-first. First viewport as poster, not document
- Differentiation: 2 deliberate departures from category norms
- Anti-slop: no AI color palettes, 3-column feature grids, centered everything, decorative blobs, nested cards, kicker above heading, icon tile stacks or dark glows

Be opinionated. Be specific. Do not hedge. This is YOUR design direction — own it.
End with Recommendation: <direction> because <product-specific reason>.
```

Supply the confirmed Phase 1 product context, memorable thing, relevant research evidence, and constraints alongside this prompt. Do not expect the outside tool to recover them from session/global state.

## Voice 2: Independent bold direction

```
Given this product context, propose a design direction that would SURPRISE.
What would the cool indie studio do that the enterprise UI team wouldn't?
- Propose an aesthetic direction, typography stack (specific font names), color palette (hex values)
- 2 deliberate departures from category norms
- What emotional reaction should the user have in the first 3 seconds?

Do not fall back on these defaults: a cream ground with a high-contrast serif and terracotta accent; near-black with one neon accent and glowing edges; broadsheet hairlines with an italic display serif and tiny tracked mono labels; italic accent words inside headlines; numbered 01 / 02 / 03 section labels; pill-shaped buttons; AI color palettes, 3-column feature grids, centered everything, decorative blobs, nested cards, kicker above heading, icon tile stacks or dark glows. If your first idea is one of these, name it and choose again.

Be bold and specific.
```

## Error handling (all non-blocking)

- **Authentication failure:** Report which tool failed and that authentication needs the user's attention. Do not log in or inspect credentials.
- **Timeout:** Use a five-minute bound for an approved external call; report that it timed out.
- **Empty response:** Report that the outside voice returned no response.
- On one voice's error: retain that unavailable/unverified result and the repair notice; proceed with the other output only, identified as the **only completed independent proposal**.
- If both voices fail or are unavailable: "Outside voices unavailable — continuing to Q2 with my draft direction."

Normalize approved external outputs with the shared result adapter described in [image tools](../../../references/image-tools.md) / [mapping](tool-mapping.md): `node "<plugin-root>/scripts/outside-review-result.mjs" proposal <result-file> --verdict --exit <actual process exit code> [--stderr <file> --events <file>]`. Read its result and exit semantics: 0 completed clean, 3 completed findings, 4 unverified, 1 unavailable, 2 usage. They are not content-guard exit meanings. Supply `--verdict` and the real `--exit` for transport-aware status; the historical text-only form checks markers but cannot establish transport completion. A zero CLI exit or nonempty prose alone is not completed coverage; validate the supported completion markers. Exit 0 may still contain P2/P3 advisory notes; preserve them instead of claiming no concerns. Retain raw outputs, stderr, actual provider, status and reported `modelUsage`, including multiple models; unknown identity remains unknown. Do not reinterpret creative disagreement as findings unless there are unresolved product constraints.

Present **only completed** proposals under actual provider/role headers, e.g., `EXTERNAL MODEL (design direction)` and `INDEPENDENT SUBAGENT (design direction)`. Never claim Codex, another model or an external call participated if it did not. Keep accepted-run records for **both** voices even if one fails; if declined keep the single skipped record. External coverage remains unavailable in a native-only success. These are local session/artifact records, not a recreated global review log.

## Synthesis

Retain every completed proposal (two, one or none) with its real source/status; do not choose a direction in this handoff. After both results, delete only the private dispatch brief you created, not user artifacts. The primary designer compares completed proposals with its earlier draft for Q2. Verify any newly suggested font before adoption. Present:
- Areas of agreement between all participating voices.
- Genuine divergences as creative alternatives for the user to choose from.
- "The outside voice and I agree on X. It suggested Y where I'm proposing Z — here's why..."

Record actual participating sources, statuses and limitations in the local proposal/decisions log. Agreement is not a vote. If the product brief changes, **all old proposals are stale**; offer fresh independent voices and never claim they reviewed the changed context. No global review log, telemetry or external memory write.
