# Codex tool and instruction-file associations

This maps the four gstack skills' original tool names to capabilities available in Codex. Preserve the source phases, questions, decisions and outputs. Tool names in the original prose and `allowed-tools` are source vocabulary; use the actual exposed tools rather than trying to call nonexistent Claude tools.

| Source name | Codex association |
| --- | --- |
| Bash | Available shell/exec tool. Use the active shell's syntax; Bash examples require an installed Bash, including Git Bash on Windows. |
| Read / Glob / Grep | Available file tools or shell reads, `rg --files` and `rg`. Resolve relative resource paths from the file containing the reference, not the project working directory. |
| Write / Edit | Available file-writing or patch tool, preserving unrelated bytes and the workflow's write decisions. |
| AskUserQuestion | Available question tool when it supports the required question; otherwise ask in chat and wait. Preserve source options and required answers, and honor answers/authorization already provided. |
| WebSearch | Available web-search tool. Preserve the consultation's research choice and source evidence. |
| Read a screenshot/image | Available local image viewer; opening a file or taking a screenshot alone is not visual inspection. |
| Browser navigation / eval / screenshots | Prefer installed `playwright-cli` using [browser-tools.md](browser-tools.md). If absent, offer installation; if the user does not install it, use an available testing method. Unperformed checks are `UNVERIFIED`. |
| Agent / outside model | Actually available authorized independent agent/provider using [image-tools.md](image-tools.md); a prompt claiming to be spawned does not establish dispatch identity. |

For optional design guidance in project instructions, resolve the actual instruction file: `AGENTS.md` in Codex, `CLAUDE.md` in Claude Code, or the project's explicitly selected equivalent. Source references to CLAUDE.md do not require creating a Claude file in Codex. Retain the source's separate decision for instruction-file writes and preserve existing content.

The four entrypoints retain upstream version and trigger text under `metadata` for portability. These values are provenance, not Codex tool registrations or permission grants; `name` and `description` remain the discovery surface. Invoke a loaded skill by its displayed name, such as `$design-consultation`; `/matt-plus:<name>` denotes the Claude plugin entry.

Install/copy the skill together with its referenced package resources. Resolve `<plugin-root>` from the loaded skill's real path (`../../` from its directory). Copying only SKILL.md or one skill directory omits shared scripts/references/assets and is not a complete standalone package. Runtime use requires neither the adjacent gstack checkout nor its global state/configuration.
