# Package Compatibility Notes

The upstream workflows and examples are preserved. Follow [External Actions](external-actions.md) for execution approvals and the shared [Content Guard](content-guard.md) for masked local publication checks; do not add another scanner. The native dependency audit remains required, but registry/network publication needs explicit approval. Missing approval, tools, or results means `UNVERIFIED`, not a passed check.

Upstream cross-skill associations are listed in [Upstream Skill Calls](../integration-plan.md#上游技能调用). `observability-and-instrumentation` is an optional explanatory reference; `debugging-and-error-recovery` is conditional on a privacy incident. Neither is bundled. If the incident-postmortem dependency is unavailable, record that phase as `UNVERIFIED`; do not silently claim a generic project process is the same upstream skill.

## Retained example limitations

- **SameSite:** `sameSite: 'lax'` is defense in depth, not complete CSRF protection. Use the project's validated CSRF strategy for state-changing cookie-authenticated requests.
- **CORS:** The original example falls back to localhost. Do not rely on that fallback in production; the actual production configuration needs an explicit allowlist and must fail closed rather than silently broaden access.
- **Dialog:** Moving initial focus and `<dialog open>` do not implement a modal focus trap. A production modal needs tested containment, dismissal, background isolation, and focus restoration.
- **Browser checks:** Run webpage verification through [Browser Testing](browser-tools.md): prefer `playwright-cli`, or the host's default browser tool if the CLI is absent. For security headers, inspect the relevant request/response metadata (CLI: `requests` and `response-headers`); redact sensitive headers before reporting. The retained DevTools examples specify evidence, not a separate automation backend.
- **Accessibility tools:** `axe-core` is a library, not a standalone `npx axe-core` CLI. If an automated audit is required, use a reviewed, already-installed browser bundle through `playwright-cli run-code` or the default browser tool's verified equivalent in the approved isolated session. Do not download it from npm or a CDN automatically. A browser snapshot alone is not an axe audit or proof of WCAG compliance; preserve manual screen-reader checks.
