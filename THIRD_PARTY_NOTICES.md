# 第三方来源与关联适配

matt-plus 分发下列内容的独立适配版本，不是上游官方发行版。agent-skills、gstack 主体及本包许可为 MIT，原作者版权见 [LICENSE](LICENSE)；新版设计内容包含 Apache-2.0 派生材料，其归属和完整许可见下文。运行时使用包内资源，不读取相邻源码仓库或上游全局安装。Claude Code 与 Codex 共享同一技能目录。

| 实际来源仓库 | 原作者 | 适用范围与源快照 |
| --- | --- | --- |
| [wenlong66/agent-skills](https://github.com/wenlong66/agent-skills)，源自 Addy Osmani 的 agent-skills | Copyright (c) 2025 Addy Osmani | 三个 agent-skills 技能保持 `14873a11dfc2ac7ed5be19069e0d0828ef7f2fec` |
| [wenlong66/gstack](https://github.com/wenlong66/gstack)，源自 Garry Tan 的 gstack | Copyright (c) 2026 Garry Tan | 四个设计/文档技能与必要关联同步至 `92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4`（1.91.45.0）；共享内容检查保持旧 `e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09`（1.58.5.0） |

## agent-skills

### code-simplification

- 源：[skills/code-simplification/SKILL.md](https://github.com/wenlong66/agent-skills/blob/14873a11dfc2ac7ed5be19069e0d0828ef7f2fec/skills/code-simplification/SKILL.md)。
- 本地：[技能](skills/code-simplification/SKILL.md)。
- 保留现有移植正文；本次仅同步七技能分发清单及来源说明。

### frontend-ui-engineering

- 源：[skills/frontend-ui-engineering/SKILL.md](https://github.com/wenlong66/agent-skills/blob/14873a11dfc2ac7ed5be19069e0d0828ef7f2fec/skills/frontend-ui-engineering/SKILL.md)。
- 本地：[技能](skills/frontend-ui-engineering/SKILL.md)、[无障碍检查表](references/accessibility-checklist.md)。
- 原版名称、description、正文、架构/状态/JSX/乐观更新示例、参考驱动设计和验证要求保留；仅增加独立执行关联说明。

### security-and-hardening

- 源：[skills/security-and-hardening/SKILL.md](https://github.com/wenlong66/agent-skills/blob/14873a11dfc2ac7ed5be19069e0d0828ef7f2fec/skills/security-and-hardening/SKILL.md)、同目录 hardening-patterns 和原版安全检查表。
- 本地：[技能](skills/security-and-hardening/SKILL.md)、[原版 hardening patterns](skills/security-and-hardening/references/hardening-patterns.md)、[安全检查表](references/security-checklist.md)、[共用兼容说明](references/compatibility-notes.md)。
- 保留原版威胁模型、全部控制与例子，以及 observability/debugging 原版关联；未迁入的条件与可选调用见[上游技能调用清单](integration-plan.md#上游技能调用)。原版 grep 示例保持不变；共享掩码工具及提交前确切 index blob 检查的执行关联见[内容检查](references/content-guard.md)，不把它当作原版安全审查的替代。原版例子的适用限制单独说明，不重写正文。

## gstack

### design-consultation

- 源：[design-consultation/SKILL.md.tmpl](https://github.com/wenlong66/gstack/blob/92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4/design-consultation/SKILL.md.tmpl)、[proposal-and-preview section](https://github.com/wenlong66/gstack/blob/92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4/design-consultation/sections/proposal-and-preview.md.tmpl)、原版设计 resolver 中的必要段落。
- 本地：[技能](skills/design-consultation/SKILL.md)、[必要段落与关联资源](skills/design-consultation/references/)、[预览/输出资源](skills/design-consultation/assets/)。
- 保留原版产品理解、提案、预览、方向探索、反馈选择和 `DESIGN.md` 流程；仅将 browser/designer/宿主路径关联替换为本包工具关联。

### design-review

- 源：[design-review/SKILL.md.tmpl](https://github.com/wenlong66/gstack/blob/92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4/design-review/SKILL.md.tmpl)、[design resolver](https://github.com/wenlong66/gstack/blob/92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4/scripts/resolvers/design.ts) 的方法、规则、报告及相关模板。
- 本地：[技能](skills/design-review/SKILL.md)、[必要方法与关联资源](skills/design-review/references/)、[报告资源](skills/design-review/assets/)。
- 保留原版实际设计审计、修复、原子提交、复测、回归和失败处理；[测试 bootstrap](skills/design-review/references/test-framework.md) 随包保留安装/配置、首批真实测试、suite 验证与失败恢复，以及原版授权范围内的 CI/测试文档/提交步骤，来源为[testing resolver](https://github.com/wenlong66/gstack/blob/92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4/scripts/resolvers/testing.ts)。权限、浏览器、比较工具、报告路径与外部模型作为关联适配，不减为只读审计。

### document-release

- 源：[document-release/SKILL.md.tmpl](https://github.com/wenlong66/gstack/blob/92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4/document-release/SKILL.md.tmpl)、release-body/audit-scope sections、doc coverage/health 和原版审查/发布关联。
- 本地：[技能](skills/document-release/SKILL.md)、[必要段落与关联资源](skills/document-release/references/)。
- 保留原名及文档审计/更新、覆盖地图、图表、CHANGELOG、可选 TODO/项目版本、提交/推送/PR-MR 同步；[独立文档复核](skills/document-release/references/cross-model-review.md) 保留[原版文档复核](https://github.com/wenlong66/gstack/blob/92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4/scripts/resolvers/outside-voice-steps.ts#L665-L768)的默认开启、双向宿主路由、禁止自调用、disabled 终止、provider failure 才只读 native 回退，以及 informational findings 的用户 apply 决策。仅适配缺失的 `/ship`、候选快照、平台工具与全局 helper 关联，不迁入整个发布技能。

### document-generate

- 源：[document-generate/SKILL.md.tmpl](https://github.com/wenlong66/gstack/blob/92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4/document-generate/SKILL.md.tmpl)、原版 Diataxis 模板及必要段落。
- 本地：[技能](skills/document-generate/SKILL.md)、[模板与关联资源](skills/document-generate/references/)。
- 保留原版范围、考古、概念地图、按需象限、写作/链接/质量检查和原有提交/发布阶段；不改为短版知识提纲。

### 共享内容检查工具

- 源：[lib/redact-engine.ts](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/lib/redact-engine.ts)、[lib/redact-patterns.ts](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/lib/redact-patterns.ts)、[bin/gstack-redact](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/bin/gstack-redact)。
- 本地：[CLI](scripts/content-guard.mjs)、[engine](scripts/lib/redact-engine.mjs)、[patterns](scripts/lib/redact-patterns.mjs)、[执行关联](references/content-guard.md)。
- 改为 Node.js 18 标准库，不依赖 Bun、上游路径、Git hooks 或全局配置。保留模式分类、位置、规范化与 fail-closed 上限；输出完全掩码，不输出原文/diff，不隐式信任 fence 或加载全局例外。纯 API 的重写结果仍需重新检查，不保证全部内容安全。

### 共享设计与 outside completion 资源

- [完整设计目录](references/design-catalog.md) 分发新快照 [lib/design-catalog.ts](https://github.com/wenlong66/gstack/blob/92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4/lib/design-catalog.ts) 的全部规则、字体角色与判定元数据；不是只有旧十一条 blacklist，也不随包安装 detector engine。
- [DESIGN.md 格式说明](references/design-md-format.md)、[模板](assets/design-system-spec-template.md)、[CLI](scripts/design-md.mjs) 和[纯模块](scripts/lib/design-md.mjs) 来源于新快照 [lib/design-md.ts](https://github.com/wenlong66/gstack/blob/92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4/lib/design-md.ts)、[bin/gstack-design-md.ts](https://github.com/wenlong66/gstack/blob/92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4/bin/gstack-design-md.ts) 与 Phase 6 模板；适配 Node、包内 YAML parser、独立授权、文件保留与错误处理，不依赖 Bun。
- [Outside completion CLI](scripts/outside-review-result.mjs) 和[纯模块](scripts/lib/outside-review-result.mjs) 来源于新快照 [lib/outside-review-result.ts](https://github.com/wenlong66/gstack/blob/92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4/lib/outside-review-result.ts) 中这四个技能所需的 review/structured/proposal gates。保留执行证据与 severity/recommendation 判定；仅适配 Node、边界校验、不可读证据 fail-closed 和不输出原始诊断。没有移入 plan-review 模型档位、全局 config 或 provider wrapper。

## Apache-2.0 派生材料

完整许可证随包分发：[licenses/Apache-2.0.txt](licenses/Apache-2.0.txt)。以下归属保留 gstack NOTICE 中与实际分发内容有关的部分；本包的这些派生文件经过独立技能关联适配，文件内标明修改，未将整个插件改称 Apache-2.0。

### impeccable — Copyright Paul Bakaus — Apache License 2.0

来源：[pbakaus/impeccable](https://github.com/pbakaus/impeccable)。上游设计目录的规则 ID/名字源自 antipatterns registry；Persuade / Operate / Read / Experience 分类、craft-floor（browser surfaces、one authored motion、offset depth、tinted secondary text、heading spacing、use-scene mode）、three-looks calibration 和字体选择程序源自其设计指导，经 gstack 改写。

本包对应派生内容：两个设计技能的相关正文/私有设计 references，以及 [design-catalog.md](references/design-catalog.md)。未分发 impeccable engine、安装器或规则 registry fixture；engine 不可用时不伪造 detector 覆盖。

### DESIGN.md specification — Copyright Google LLC — Apache License 2.0

来源：[google-labs-code/design.md](https://github.com/google-labs-code/design.md)。五组 YAML tokens、八个 canonical sections 与 `{path}` token 引用的格式实现，对应本包 [DESIGN.md 格式资源](references/design-md-format.md)、[纯模块](scripts/lib/design-md.mjs)、[CLI](scripts/design-md.mjs)、[spec 模板](assets/design-system-spec-template.md) 和 design-consultation Phase 6 写入关联。未复制完整规范文本。

## 包内 YAML parser

[js-yaml 4.2.0](https://github.com/nodeca/js-yaml)（MIT）提供完整 YAML 1.2 CORE_SCHEMA 解析，替代上游 `Bun.YAML`。从本地已安装依赖取得官方 ESM bundle，分发于 [scripts/vendor/js-yaml/](scripts/vendor/js-yaml/)，原 bundle、package 元数据及 [MIT 许可/作者声明](scripts/vendor/js-yaml/LICENSE) 未修改。这里只使用包内文件，不在运行时读取该本地源依赖或自动执行安装。

## 未迁入的宿主关联

推广、遥测、自动更新、全局记忆/状态、固定 home 目录和整套上游 bootstrap 不属于独立技能的运行依赖，已移除。必要原版模板宏不留作未展开占位符，领域段落本地分发。

提交、推送、恢复、外部审查与图像能力没有因高权限而删除；通过 [动作授权](references/external-actions.md)、[浏览器](references/browser-tools.md)、[图像/模型](references/image-tools.md) 和 [内容检查](references/content-guard.md) 关联到当前实际可用工具与授权。工具不存在或能力未经执行验证时如实记录，不声称完全等价。
