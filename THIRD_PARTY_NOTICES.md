# 第三方来源与关联适配

matt-plus 分发下列 MIT 内容的独立适配版本，不是上游官方发行版。完整 MIT 许可和原作者版权见 [LICENSE](LICENSE)。运行时使用包内资源，不读取相邻源码仓库或上游全局安装。Claude Code 与 Codex 共享同一技能目录。

| 实际来源仓库 | 原作者 | 本次源快照 |
| --- | --- | --- |
| [wenlong66/agent-skills](https://github.com/wenlong66/agent-skills)，源自 Addy Osmani 的 agent-skills | Copyright (c) 2025 Addy Osmani | `14873a11dfc2ac7ed5be19069e0d0828ef7f2fec` |
| [wenlong66/gstack](https://github.com/wenlong66/gstack)，源自 Garry Tan 的 gstack | Copyright (c) 2026 Garry Tan | `e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09` |

## agent-skills

### frontend-ui-engineering

- 源：[skills/frontend-ui-engineering/SKILL.md](https://github.com/wenlong66/agent-skills/blob/14873a11dfc2ac7ed5be19069e0d0828ef7f2fec/skills/frontend-ui-engineering/SKILL.md)。
- 本地：[技能](skills/frontend-ui-engineering/SKILL.md)、[无障碍检查表](references/accessibility-checklist.md)。
- 原版名称、description、正文、架构/状态/JSX/乐观更新示例、参考驱动设计和验证要求保留；仅增加独立执行关联说明。

### security-and-hardening

- 源：[skills/security-and-hardening/SKILL.md](https://github.com/wenlong66/agent-skills/blob/14873a11dfc2ac7ed5be19069e0d0828ef7f2fec/skills/security-and-hardening/SKILL.md)、同目录 hardening-patterns 和原版安全检查表。
- 本地：[技能](skills/security-and-hardening/SKILL.md)、[原版 hardening patterns](skills/security-and-hardening/references/hardening-patterns.md)、[安全检查表](references/security-checklist.md)、[关联兼容说明](skills/security-and-hardening/references/compatibility-notes.md)。
- 保留原版威胁模型、全部控制与例子。只替换原始值 grep 为共享掩码工具，删除未迁入 observability 技能关联，替换未迁入 debugging 技能关联。原版例子的适用限制单独说明，不重写正文。

## gstack

### design-consultation

- 源：[design-consultation/SKILL.md.tmpl](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/design-consultation/SKILL.md.tmpl)、proposal-and-preview section、原版设计 resolver 中的必要段落。
- 本地：[技能](skills/design-consultation/SKILL.md)、[必要段落与关联资源](skills/design-consultation/references/)、[预览/输出资源](skills/design-consultation/assets/)。
- 保留原版产品理解、提案、预览、方向探索、反馈选择和 `DESIGN.md` 流程；仅将 browser/designer/宿主路径关联替换为本包工具关联。

### design-review

- 源：[design-review/SKILL.md.tmpl](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/design-review/SKILL.md.tmpl)、原版 design resolver 的方法、规则、报告及相关模板。
- 本地：[技能](skills/design-review/SKILL.md)、[必要方法与关联资源](skills/design-review/references/)、[报告资源](skills/design-review/assets/)。
- 保留原版实际设计审计、修复、原子提交、复测、回归和失败处理；权限、浏览器、比较工具、报告路径与外部模型作为关联适配，不减为只读审计。

### document-release

- 源：[document-release/SKILL.md.tmpl](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/document-release/SKILL.md.tmpl)、release-body section、doc coverage/health 和原版审查/发布关联。
- 本地：[技能](skills/document-release/SKILL.md)、[必要段落与关联资源](skills/document-release/references/)。
- 保留原名及文档审计/更新、覆盖地图、图表、CHANGELOG、可选 TODO/VERSION、提交/推送/PR-MR 同步；仅适配缺失的 `/ship`、分支、平台工具和全局 helper 关联。

### document-generate

- 源：[document-generate/SKILL.md.tmpl](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/document-generate/SKILL.md.tmpl)、原版 Diataxis 模板及必要段落。
- 本地：[技能](skills/document-generate/SKILL.md)、[模板与关联资源](skills/document-generate/references/)。
- 保留原版范围、考古、概念地图、按需象限、写作/链接/质量检查和原有提交/发布阶段；不改为短版知识提纲。

### 共享内容检查工具

- 源：[lib/redact-engine.ts](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/lib/redact-engine.ts)、[lib/redact-patterns.ts](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/lib/redact-patterns.ts)、[bin/gstack-redact](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/bin/gstack-redact)。
- 本地：[CLI](scripts/content-guard.mjs)、[engine](scripts/lib/redact-engine.mjs)、[patterns](scripts/lib/redact-patterns.mjs)、[执行关联](references/content-guard.md)。
- 改为 Node.js 18 标准库，不依赖 Bun、上游路径、Git hooks 或全局配置。保留模式分类、位置、规范化与 fail-closed 上限；输出完全掩码，不输出原文/diff，不隐式信任 fence 或加载全局例外。纯 API 的重写结果仍需重新检查，不保证全部内容安全。

## 未迁入的宿主关联

推广、遥测、自动更新、全局记忆/状态、固定 home 目录和整套上游 bootstrap 不属于独立技能的运行依赖，已移除。必要原版模板宏不留作未展开占位符，领域段落本地分发。

提交、推送、恢复、外部审查与图像能力没有因高权限而删除；通过 [动作授权](references/external-actions.md)、[浏览器](references/browser-tools.md)、[图像/模型](references/image-tools.md) 和 [内容检查](references/content-guard.md) 关联到当前实际可用工具与授权。工具不存在或能力未经执行验证时如实记录，不声称完全等价。
