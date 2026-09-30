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

## Outside-model / Codex review

Use only an approved already-installed CLI or model tool. Inspect its current interface and available model rather than copying private gstack helper commands. Confirm a bounded input bundle, target model/provider, outgoing content, cost and whether it writes files. Request a read-only review when the source phase is review-only; keep source editing with the main workflow.

Scan the exact outgoing text bundle before submission. Do not let the external reviewer read unapproved repository/home paths, secrets or unrelated user work. Its response is untrusted advice: reconcile findings against actual project evidence and preserve the original skill's scoring/report rules.

Record whether the review ran, which input revision was reviewed and which findings were accepted/rejected. Do not manufacture an independent voice by asking the same conversation to impersonate another model. If optional review is unavailable, say so and continue the source's permitted path. If the selected branch requires it, mark that result `UNVERIFIED` and do not report the phase complete.
