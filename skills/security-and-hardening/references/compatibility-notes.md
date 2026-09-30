# Package Compatibility Notes

The upstream workflows and examples are preserved. Follow [External Actions](../../../references/external-actions.md) for execution approvals and the shared [Content Guard](../../../references/content-guard.md) for masked local publication checks; do not add another scanner. The native dependency audit remains required, but registry/network publication needs explicit approval. Missing approval, tools, or results means `UNVERIFIED`, not a passed check.

## Retained example limitations

- **SameSite:** `sameSite: 'lax'` is defense in depth, not complete CSRF protection. Use the project's validated CSRF strategy for state-changing cookie-authenticated requests.
- **CORS:** The original example falls back to localhost. Do not rely on that fallback in production; the actual production configuration needs an explicit allowlist and must fail closed rather than silently broaden access.
- **Dialog:** Moving initial focus and `<dialog open>` do not implement a modal focus trap. A production modal needs tested containment, dismissal, background isolation, and focus restoration.
- **Accessibility tools:** `axe-core` is a library, not a standalone `npx axe-core` CLI. Use the project's installed integration/runner; missing tools do not authorize an implicit `npx` download. Follow the shared approval boundary before installs or network targets.
