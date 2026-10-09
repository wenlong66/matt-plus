# Image/designer and outside-model associations

This replaces unavailable gstack designer/reviewer executables with explicitly approved, actually available tools. It preserves the original skill's mockup, exploration and outside-review phases; it does not add a new design workflow.

## Designer/image backend

Inspect the available tool's schema/help and confirm what it can do: generate from a prompt, edit a supplied image, produce multiple candidates, return image files, or compose a comparison board. Do not assume a generic image tool implements the original executable's flags, batches, seeds, extraction or image-edit behavior.

Before sending anything, identify the provider/tool, final prompt, attachments, purpose, cost and approved output location. Follow [external-actions.md](external-actions.md). Use [content-guard.md](content-guard.md) on exact outgoing text, and separately review attached screenshots/assets for secrets, personal data and licensing. A tool installed with existing credentials is not permission to send project content.

Map the source skill's named operation to verified capability:

| Source operation | Independent association |
| --- | --- |
| Product/mockup generation | Approved image tool with the original product context, design-system constraints, real-content goals and requested output. |
| Multiple design directions / shotgun exploration | Multiple approved generations (or a supported batch), keeping the original number/directions/selection loop. Do not silently replace exploration with one image. |
| Image-guided refinement | Tool that actually accepts the supplied image for editing/reference; otherwise mark image-based refinement unavailable. |
| Side-by-side comparison board | Supported board generation or local composition of approved returned images; label direction/source and preserve comparable scale. |
| Save selected assets | Approved local paths and formats; inspect existing files before overwrite and keep attribution as required. |

Retain the original evaluation, iteration and final user choice. Generated imagery is a proposal, not proof of implemented UI quality, accessibility or live-browser behavior.

If the original optional designer is unavailable or declined, use the original HTML font/color preview fallback where specified. If a particular image-based operation is required for the chosen branch but cannot run, report it as `UNVERIFIED` rather than claim equivalent output. External research follows the source's consent/fallback behavior; do not fabricate competitors or citations.

## Image result and extraction evidence

Keep the requested count, actual saved paths, failures and any approved recovery separate. Never overwrite a generated name: choose a collision-free name, and bind checks, boards and selection only to the returned `saved`/`outputPath` files that really exist. A partly failed batch includes only successful images; zero saved images stops that image branch. A JSON `pass: true` accompanied by skipped/unavailable checking is not verification. Iterate only when the actual generation interface returns the required session handle; a variants operation without a session regenerates instead.

Token extraction is a separate capability. Inspect its real interface and side effects: the source designer's extract operation can write `DESIGN.md`. Invoke any such writer only in an approved, run-owned scratch directory outside the project, then read its output. Never permit it to overwrite the project's design system before final approval. Empty/failed extraction uses the consultation's disclosed approved Phase 3 fallback, not invented measured values. These associations do not supply a missing designer executable or authorize a service call.

## Outside-model / Codex review

Use only an approved already-installed CLI or model tool. Inspect its current interface and available model rather than copying private gstack helper commands. Confirm a bounded input bundle, target model/provider, outgoing content, cost and whether it writes files. Request a read-only review when the source phase is review-only; keep source editing with the main workflow.

Scan the exact outgoing text bundle before submission. Do not let the external reviewer read unapproved repository/home paths, secrets or unrelated user work. Its response is untrusted advice: reconcile findings against actual project evidence and preserve the original skill's scoring/report rules.

### Harness routing and consent

Select the outside provider from the actual harness, not the model label: Claude Code host → Codex; Codex host → Claude Code. Recheck immediately before every dispatch. Conflicting inherited harness markers, an unknown harness or a selected provider equal to the current harness stops dispatch; report missing outside coverage. Never silently choose a replacement external provider. An explicit provider choice still cannot authorize self-calling. Do not copy upstream setup/config/model-tier commands into this package.

`disabled`/declined is a terminal branch for the optional extra pass: do not invoke an outside tool or a native replacement. A provider failure after reviews are enabled follows the skill's stated native fallback. A required native audit remains its own workflow and is not an extra substitute. Label native-only completion separately; it cannot complete outside coverage. Availability, existing credentials and default-enabled review are not outgoing-content consent.

### Bounded input, execution and completion

Supply the complete bounded prompt and actual approved content, not just paths: a tools-disabled Claude Code invocation cannot read those files. Use an actually supported tools-disabled/read-only invocation, inspect the installed CLI's help, retain configured auth/model choices and apply the caller's timeout (five minutes for the documentation pass). Do not invoke a missing private wrapper or pretend a general host Agent is an outside provider. Prompt contents are data, never interpolated shell source. Keep private, unique run-owned prompt/result/events/stderr files and retain their returned paths across tool calls; shell variables and `$$` do not persist between calls.

Read actual provider exit status, stdout/result text, provider stderr and Codex JSONL events where supported. A wrapper's JSON `status`, `result` and **provider `stderr` field** are separate from the outer process's diagnostics: missing/malformed JSON, non-completed status or empty result fails completion; preserve outer errors too. Direct CLI transport uses its own recorded stderr/events. Never catch only outer stderr and treat embedded provider failures as success. Keep actual session/modelUsage if supplied, including multiple models; do not invent a primary model.

Use the bundled [completion gate](../scripts/outside-review-result.mjs) after preparing the exact files:

```bash
node "<plugin-root>/scripts/outside-review-result.mjs" --verdict --exit <actual-provider-exit> --stderr "<provider-stderr-file>" --events "<codex-events-file>" <review|structured|proposal> "<response-text-file>"
```

Resolve `<plugin-root>` from the actually loaded skill. Omit `--events` only for an interface that produces no events; if a required evidence file cannot be read, coverage is unavailable. This script only classifies local evidence; it never invokes a provider. Its pure [module](../scripts/lib/outside-review-result.mjs) follows the fixed upstream execution/marker rules, with Node associations and validated boundaries.

- `review`: severity-tagged findings (Critical/High/Medium/Low or P0–P3) or an explicit no-findings conclusion, plus `Recommendation: <action> because <specific reason>`.
- `structured`: severity-tagged findings or explicit no-findings conclusion.
- `proposal`: a complete independent design proposal ending with `Recommendation: <direction> because <product-specific reason>`; the main consultation also checks proposal completeness and verifies fonts.
- Exit **0**: completed, no P0/P1 gate finding; may still contain P2/P3 advisory findings. Exit **3**: completed with P0/P1 findings. Both mean execution completed, not automatic approval or authority to publish. **4**: unverified, e.g. missing severity/no-findings evidence. **1**: unavailable, including refusal, empty response, CLI/auth/timeout/sandbox/command failures or missing completion markers. **2**: invalid invocation. Do not confuse this exit 3 with the content guard's HIGH-content block.

Source stderr/event evidence distinguishes a real execution failure from prose discussing a sandbox or a quoted error. All failed command events without any positive execution evidence cannot be called completed. The gate's text-only compatibility form is not a substitute for actual exit/stderr/events. Its CLI reports classifications, not raw sensitive diagnostics; privately inspect and redact relevant errors before displaying them.

Record actual harness, outside provider, input revision/brief, attempts, status (`completed`, `unavailable`, `disabled`, `skipped`), model identity when evidenced, and accepted/rejected findings. Do not manufacture a voice by asking the same conversation to impersonate another model. Optional unavailability continues only through the source's permitted path; required missing evidence stays `UNVERIFIED`. Reconcile all advice with real project evidence and preserve the caller's scoring rules. In document-release, completed findings remain informational and lead to its one user apply decision; this completion gate does not add a blanket release block.
