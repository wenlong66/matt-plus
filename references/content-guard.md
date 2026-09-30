# Local content guard and publication preflight

The package ships a Node.js 18+ lexical guard adapted from gstack's redaction engine and pattern taxonomy. It is a shared safety resource, not a seventh security-audit skill. It does not contact providers, validate credentials, install hooks, read global settings or automatically walk a repository.

## CLI

Resolve the script from this installed package, not a fixed home path. `<package-root>` and the example input paths below are substitutions, not literal runtime locations.

```bash
node <package-root>/scripts/content-guard.mjs --from-file <final-payload.txt> --json --repo-visibility unknown
```

Alternatively pipe approved text to stdin without printing it first. Do not place secrets in command arguments, shell history or a displayed diff. Quote paths or pass an argument array; never evaluate a repository-supplied command string.

- Input: stdin by default. `--from-file PATH` selects the file and ignores piped stdin; do not assume the piped material was checked.
- `--json`: structured masked findings; the default text output is masked too.
- `--repo-visibility public|private|unknown`: records context; it does not change a finding's tier or establish publication permission.
- `--max-bytes N`: positive integer from 1 through 16777216; default 1048576 (1 MiB). Oversized input blocks rather than being truncated or scanned incompletely.
- Unknown, duplicate or malformed options and unreadable/unsupported input fail closed. Do not report a clean scan when the scanner failed.

| Exit | Meaning | Next action |
| --- | --- | --- |
| 0 | No HIGH/MEDIUM; LOW/WARN may remain | Review the report and complete semantic/confidentiality review. Not automatic approval. |
| 2 | MEDIUM present | Hold publication; review personal/confidential data and resolve or document an approved false positive. |
| 3 | HIGH present, including oversize | Block publication. Remove/redact the issue or resolve a justified false positive, then rescan the exact final bytes. |
| 1 | Invalid arguments, read/decode/runtime failure | `UNVERIFIED` / blocked. Correct the error and retry only within the approved scope. |

The report contains pattern IDs, category/tier/severity, location, masked preview and counts, never an unmasked matched value. Treat surrounding content as sensitive too: do not display original bodies to explain a finding. Live-looking credentials inside a code/tool fence are not trusted or downgraded.

## Pure API and targeted redaction

The engine lives in [redact-engine.mjs](../scripts/lib/redact-engine.mjs). `scan(input, options)` accepts text and returns a new result. Options include `repoVisibility`, `maxBytes`, and explicitly supplied exact `benignExamples`; no home/author/email allowlist is loaded implicitly. Use such exceptions only for individually reviewed synthetic/public examples, never an arbitrary `example` substring or a live credential.

`applyRedactions(input, findingIds, options)` takes known **pattern IDs**, not individual finding locations; each selected pattern considers all its eligible occurrences. Only `pii.email`, `pii.phone.e164`, `pii.ssn` and `pii.cc` support automatic substitution. Structured, overlapping and non-PII matches are skipped. It returns a rewritten body and masked redacted/skipped findings without a raw diff. The returned body is **not certified safe**: other findings, context or sensitive material may remain. Keep it local, rescan the complete final body, review what changed and obtain the relevant publication approval. Do not log the returned body.

## Check the actual sink

### PR/MR body, title, message or review payload

1. Prepare the complete final payload locally in an approved location. Include appended sections, links, examples and attachments in the review scope.
2. Scan the exact final body and title/message separately; review LOW/WARN and non-lexical confidentiality concerns too.
3. Resolve findings and repeat after every change. Record a hash/revision, not the raw secret.
4. Prefer the checked file or stdin with the platform's supported transport. Use command arguments only for explicitly reviewed nonsensitive text, not an arbitrary body judged safe merely by this scanner. Send exactly the checked bytes; no interpolation, extra footer or rerender after scanning.
5. Check for concurrent PR/MR changes by rereading the remote body/title immediately before updating. If they changed, preserve concurrent work and recheck the new merged payload. A reread alone is not atomic race protection: use a supported conditional/versioned update where available; otherwise disclose the remaining race and do not promise race safety.

Remote reads and uploads still need [action authorization](external-actions.md). A guard pass does not authorize sending repository content to another model.

### Commit and push

Before an approved commit, inspect exact staged files/hunks and commit message, including untracked files being added. Scan the index blob bytes for each staged text file, not the `git diff --cached` rendering: diff prefixes can hide line-anchored assignments. Use `git show ":<approved-staged-text-path>"` from the repository root, with pipeline error checking (Bash/Git Bash: `set -o pipefail`), and repeat for every approved staged text path. A failed extraction is not a clean scan; deleted files have no new index blob, and binary artifacts need separate review. Do not rely on the unstaged diff or print a raw secret-bearing diff.

Before an approved push, resolve the exact remote/ref, outgoing tip and commits not already reachable at the destination. Inspect **all outgoing commit messages and introduced/changed blob contents**, including earlier commits whose files were subsequently deleted. A clean current worktree does not prove a clean outbound history. Extract immutable Git object contents locally without echoing them; run the guard on those exact textual bytes and keep the approved tip/ref unchanged until push. Do not silently fetch or assume a remote tracking ref is current.

Also review outgoing filenames, metadata, non-text artifacts, LFS/submodule references and attachments under the applicable confidentiality policy. This text guard cannot certify binary images/archives or external object stores. If the destination/range or a required artifact check cannot be established, record `UNVERIFIED` and stop publication, rather than scanning a convenient subset and calling the whole push safe.

## Limits

This is pattern detection, not a complete security or privacy assessment. It cannot prove absence of novel/encoded credentials, identify all business-confidential prose, perform legal compliance analysis, verify artifact provenance or establish ownership/permission. Normalization and validators improve detection but are not a security proof. Findings require context; a private repository does not make secrets acceptable to commit.

Never try a suspected token against its provider to establish validity. If a real credential has already reached a remote, treat it as exposed and follow the project's authorized rotation/incident process before any separately approved history cleanup.
