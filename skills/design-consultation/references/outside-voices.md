# Optional Outside Design Voices

Load only when the user approves independent design-direction proposals. Follow the shared external-actions contract linked from SKILL.md, including the local content-guard scan before sending material outside the session. Confirm which installed external model/tool or available subagent may run, the exact product context it may receive, network/search permissions, and request budget. Tool availability is not consent. Do not install, authenticate, enable web search, or send the whole repository by default.

Use the host's question tool or chat:
> "Want outside design voices? An approved available external model proposes a complete design direction; an independent design subagent proposes a bolder alternative."
>
> A) Yes — run approved outside design voices.
> B) No — proceed without.

If the user chooses B, skip this step and continue. If approved tools are already available, inspect their help/interface and launch the permitted independent voices in parallel. Keep any source access read-only and scoped. The following are domain prompts, not shell commands.

## Voice 1: Complete design direction

```
Given this product context, propose a complete design direction:
- Visual thesis: one sentence describing mood, material, and energy
- Typography: specific font names (not defaults — no Inter/Roboto/Arial/system) + hex colors
- Color system: CSS variables for background, surface, primary text, muted text, accent
- Layout: composition-first, not component-first. First viewport as poster, not document
- Differentiation: 2 deliberate departures from category norms
- Anti-slop: no purple gradients, no 3-column icon grids, no centered everything, no decorative blobs

Be opinionated. Be specific. Do not hedge. This is YOUR design direction — own it.
```

Supply the confirmed Phase 1 product context, memorable thing, relevant research evidence, and constraints alongside this prompt. Do not expect the outside tool to recover them from session/global state.

## Voice 2: Independent bold direction

```
Given this product context, propose a design direction that would SURPRISE.
What would the cool indie studio do that the enterprise UI team wouldn't?
- Propose an aesthetic direction, typography stack (specific font names), color palette (hex values)
- 2 deliberate departures from category norms
- What emotional reaction should the user have in the first 3 seconds?

Be bold. Be specific. No hedging.
```

## Error handling (all non-blocking)

- **Authentication failure:** Report which tool failed and that authentication needs the user's attention. Do not log in or inspect credentials.
- **Timeout:** Use a five-minute bound for an approved external call; report that it timed out.
- **Empty response:** Report that the outside voice returned no response.
- On one voice's error: proceed with the other output only, tagged `[single-model]`.
- If both voices fail or are unavailable: "Outside voices unavailable — continuing with primary review."

Present each output under its actual provider/role header, e.g., `EXTERNAL MODEL (design direction)` and `INDEPENDENT SUBAGENT (design direction)`. Never claim Codex or a second model participated if it did not.

## Synthesis

The primary designer references both proposals in Phase 3. Present:
- Areas of agreement between all participating voices.
- Genuine divergences as creative alternatives for the user to choose from.
- "The outside voice and I agree on X. It suggested Y where I'm proposing Z — here's why..."

Record the actual participating sources and limitations in the local proposal/decisions log. No global review log, telemetry, or external memory write.
