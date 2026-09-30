# Runtime Associations

The domain text is ported from `gstack/document-generate/SKILL.md.tmpl` at
`e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09`. Steps 3-6 are moved unchanged into
`writing-quadrants.md`; Step 9 retains its original publication functions in `publishing.md`.
No gstack installation, generator, private runtime or separate skill is required.

Read `../../../references/external-actions.md` and `../../../references/content-guard.md`
from this reference directory. They apply before the original workflow's actions; "proceed"
means proceed within the already approved scope, not permission to perform unapproved actions.
Ordinary factual writing remains automated once its local file scope is approved. Preserve
unrelated user changes and read existing files in full before editing.

## Project, Revisions and Tools

- Use the user's explicit target/audience and the project's approved local source of truth,
  documentation format, verification commands and entry-point conventions. The four-quadrant
  plan is scoped to that target, not an expansion to unrelated features.
- Standalone generation needs no release base or feature branch. Record the source HEAD and
  relevant local changes. When supplied with release gaps, use the explicit base/head and
  comparison method from that coverage map, verifying the revisions locally. If the range
  is missing or ambiguous, ask; do not silently default to a branch or tag.
- `/document-release` is an optional source of a coverage map, not a required invocation or
  runtime dependency. A user-provided map works independently.
- `AskUserQuestion` resolves to the host's question tool; if unavailable, ask in chat and wait
  for the same decision. Use installed local file/search tools for the discovery queries;
  shell examples describe the same queries, not permission to install or bootstrap tools.
- Example/link/smoke-test execution follows the approved command/network scope. A required
  check that cannot run is `UNVERIFIED`, not PASS. Source inspection is not execution evidence.
  Instruction files and navigation changes need their own approved scope.

## Publication Associations

`publishing.md` preserves staging, commit, push and existing-PR documentation maintenance.
The shared contracts resolve these formerly host-bound associations:

- Resolve the package guard as `<skill-dir>/../../scripts/content-guard.mjs` (Node 18+), not a
  home-installed gstack redactor/config helper. Guard the exact staged contents and message.
- Use the approved project commit attribution, if any, rather than a hard-coded model trailer.
- Resolve the approved remote/ref and immutable outgoing tip. Follow the shared history
  preflight on all outgoing commit messages and introduced/changed blobs, including content
  deleted later. Use Git CLI only; do not silently fetch or publish an inferred range.
- Update only the approved existing PR's `## Documentation Generated` section. Preserve
  unrelated/concurrent body content and avoid duplicate sections. An unavailable read/update
  is UNVERIFIED; a verified absent PR is the original no-PR path, not permission to create one.
- Guard the final exact body/title/transport payload immediately before sending, using the
  checked file/same bytes. For an authorized GitHub PR, use its supported body-file input.
  No guard result authorizes an action or certifies all secrets/confidential/legal content.
