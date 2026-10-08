# Runtime Associations

The domain text is ported from `gstack/document-release/SKILL.md.tmpl`,
`document-release/sections/release-body.md.tmpl` and the generated documentation-review
section at `e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09`. Only missing host/tool/path/other-skill
associations are adapted. No gstack package, generator, global config/state or private
runtime is required.

Read `../../../references/external-actions.md` and `../../../references/content-guard.md`
from this reference directory. They apply before the original workflow's actions. Original
"auto-update", "never stop" and "always-on" wording operates within already approved file
and action scope, not as implicit authorization. Commits, pushes, external reads, PR/MR
body/title/label changes, VERSION/TODOS, navigation and instruction-file edits retain their
separate approvals. Read files in full and preserve unrelated user work.

## Explicit Project, Base and Head

1. Identify the repository root, checkout and existing changes using local Git. Read the
   project's approved local guidance, documentation locations and release conventions.
2. Resolve an explicit base and head from the user's release scope or an unambiguous local
   project convention. An authorized PR/MR metadata read may provide its target/source
   revisions; a remote URL alone does not authorize a hosting read. If the intended base,
   head or comparison method is missing/ambiguous, ask. Never silently default to `main`,
   `master`, `HEAD~1` or a tag, and never auto-fetch missing objects.
3. Verify each selected revision with `git rev-parse --verify "<revision>^{commit}"` and
   record its SHA. For an actual release interval use a direct base-to-head comparison.
   For a branch's introduced changes, resolve `git merge-base <base-sha> <head-sha>` and
   record that SHA as `<diff-base>`. No merge base is an unavailable range, not a fallback.
4. Record the same pinned `<diff-base>` and `<head>` for every audit/review. A base-branch
   checkout is valid for an explicit merged-release interval; do not require a feature
   branch or another shipping skill. Writing requires checkout HEAD to equal the pinned
   `<head>` and relevant source to match that revision. If either differs, stay read-only:
   inspect the pinned revision and obtain authorization for the correct checkout before
   writing docs; never edit release docs in a different-version workspace. Preserve existing
   user documentation work and recheck HEAD, relevant source and target docs immediately
   before each write. Existing doc/unrelated changes do not require a wholly clean tree.
   Original "this branch" prose refers to this recorded release scope when used post-merge.
5. Derive hosting platform, explicit PR/MR target, doc/verification conventions, TODO format,
   version file/scheme and title convention from local source of truth or authorized reads.
   Apply `v<VERSION>` title sync only when it is the project's convention or explicitly
   approved; the original helper's numeric version syntax must actually fit the project.
   Do not impose gstack's title/version/branch conventions on an unrelated repository.

Use the recorded root and revisions for each tool call; shell variables do not persist
between calls. The original discovery blocks can be resolved through installed file/search
tools. `AskUserQuestion` means the host question tool, or a normal chat question and wait if
that tool is unavailable. Missing required checks are UNVERIFIED, not a passed smoke test.
For webpage, URL-navigation or rendered-result verification, read [Browser Testing](../../../references/browser-tools.md):
prefer installed `playwright-cli`, or the host's default browser tool if the CLI is absent.
Non-browser examples and contributor smoke tests retain their native commands.
Upstream skill associations and local namespaced entries are listed in [Upstream Skill Calls](../../../integration-plan.md#上游技能调用).

## Former Host Associations

- The workflow does not require `/ship`. Existing release entries remain the source of truth;
  neither the old shipping association nor a version decision overrides CHANGELOG protection.
- TODO-format lookup resolves to the project's own format, or local `TODOS-format.md` when
  applicable; no private reference from a different skill is needed.
- Redaction/config resolves to the package's shared guard and approved visibility context,
  never global state or a home-installed executable. Follow the shared exact staged/message,
  outgoing-history and PR/MR body/title/transport checks at the actual sink. Git CLI extracts
  immutable object bytes without printing raw content; never scan just final added lines.
- Commit attribution resolves to the approved project/host convention, if any, not a generated
  hard-coded model trailer. Push resolves to the approved remote/ref and checked source SHA.
- PR/MR reads and mutations use only an approved installed `gh`/`glab` and explicit target.
  Preserve concurrent bodies; a tempfile alone is not a race guarantee. For GitLab, use the
  installed CLI's supported file-input API, constructing and checking the final JSON request
  once along with the decoded body/title bytes. Do not rebuild checked content in a heredoc
  or strip bytes through shell substitution. No supported exact-byte transport is BLOCKED.
- Title rewriting resolves to `../scripts/pr-title-rewrite.sh`, a local copy of the original
  pure helper. It requires Bash, `grep` with `-qE` and `sed` with `-E` (available in Git Bash
  on Windows); invoke it with `bash`, not generic `sh`. Missing prerequisites are UNVERIFIED.
  Normalize VERSION and capture `NEW_TITLE` as specified in `release-body.md` before checking
  final title bytes; send those unchanged. The helper is not authorization to edit a title.
  An unsupported convention requires a question.
- Independent review resolves to `cross-model-review.md` and the shared installed-tool/model
  adapter. Preserve the default-on phase, the Codex-host skip and the labeled read-only Agent
  fallback; authorization or capability missing for both paths is UNVERIFIED, not a clean review.
