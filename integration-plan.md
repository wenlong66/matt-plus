# 移植范围、资源规则与上游调用

## 收录范围

分发以下七个移植技能，`code-simplification` 保持现有内容，不纳入本次修复范围。不增加通用 QA、部署或另一套计划审查入口。

| 技能 | 来源 | 必要领域资源 |
| --- | --- | --- |
| `design-consultation` | gstack | 提案与一致性规则、预览/反馈、DESIGN.md 模板、外部设计意见 |
| `frontend-ui-engineering` | agent-skills | 无障碍检查表 |
| `design-review` | gstack | UX 原则、审计方法/检查表、硬规则、测试 bootstrap、回归测试、DOM 观察脚本、baseline 模板 |
| `document-release` | gstack | release-body、TODOS 格式、默认独立文档复核、PR 标题脚本 |
| `document-generate` | gstack | 四象限写作模板、发布关联 |
| `security-and-hardening` | agent-skills | hardening patterns、安全检查表 |
| `code-simplification` | agent-skills | 保持现有移植内容 |

保留原名、领域正文、例子、判断标准、阶段和输出。只适配资源、工具、路径、运行环境与上游关联；不把修复/提交/复测流程改成只读审计。精确源快照与版权见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 资源放置规则

- **技能独有**：放在 `skills/<skill>/references/`；该技能的脚本和输出模板分别放在自己的 `scripts/`、`assets/`。
- **多个技能共用**：放在根 `references/`；共用内容检查脚本及其内部模块放在根 `scripts/`。
- 不复制第二套正文，不从相邻上游仓库、固定 home 目录或宿主全局配置读取运行资源。
- 仅用于重复记录移植过程的局部 port-mapping 已合并到本说明和来源声明，不属于技能运行资源。

共用资源：
- [动作授权](references/external-actions.md)
- [浏览器工具](references/browser-tools.md)：优先 `playwright-cli`，未安装时使用当前宿主默认浏览器工具；实际能力缺失标记 `UNVERIFIED`。
- [图像与外部模型](references/image-tools.md)
- [内容检查](references/content-guard.md)
- [原版例子的兼容说明](references/compatibility-notes.md)：由前端、安全技能及其检查表共用。
- [无障碍检查表](references/accessibility-checklist.md)
- [安全检查表](references/security-checklist.md)

## 上游技能调用

Claude Code 中，包内同名技能的入口为 `/matt-plus:<技能名>`。下面列出原版的领域关联；未迁入的名字不是本插件新增的命令，不自动安装或调用完整上游插件。

| 使用方 | 上游关联 | 性质与本包处置 |
| --- | --- | --- |
| `design-consultation` | `/office-hours` | 可选产品发现前置。使用用户提供的产品发现记录或同目的的产品澄清对话；未迁入，不是必要安装依赖。 |
| `design-consultation`、`design-review` | `/plan-design-review` | 原版现有网站/计划模式转介，正文保留名称并明确未迁入；不是实际设计审查流程的必要前置。不能默认为会修复和提交的 `design-review` 与其等价。 |
| `design-consultation` | `/design-html` | 可选的交付后 HTML/Pretext 建议，随无关推广移除；未迁入，不影响设计系统交付。 |
| `design-review` | `/setup-browser-cookies` | 原版登录态设置关联，改用已授权的隔离测试账号/session；未迁入，不导入个人 cookie。 |
| `design-review` | `/qa` Phase 8e.5 | JS 行为修复后的条件性回归测试程序，已完整随包展开到 [regression-tests.md](skills/design-review/references/regression-tests.md)，不需要整个 QA 技能。 |
| `design-review` | `/plan-design-review` litmus scorecard | 属于资源引用，必要 scorecard 已展开到 [outside-voices.md](skills/design-review/references/outside-voices.md)，不需要新增技能。 |
| `document-release` | `/ship` | 执行时机、已有 CHANGELOG、TODO 二次清理和标题惯例的来源关联，不要求再次执行 ship；由明确 release range、项目约定和包内标题脚本承接，未迁入。 |
| `document-release` | `/document-generate` | 覆盖缺口的可选后续建议。本包已有 `/matt-plus:document-generate`，不自动生成全部缺失文档。 |
| `document-generate` | `/document-release` | 可选覆盖地图输入，本包已有 `/matt-plus:document-release`；也可以独立运行或接受用户提供的地图。 |
| `document-release` | `review/TODOS-format.md` | 资源引用，不是 `/review` 调用；格式已随包迁入。格式说明中提到的 `/ship`、`/plan-ceo-review` 不构成新增依赖。 |
| `security-and-hardening` | `observability-and-instrumentation` | 可选的 PII/遥测说明性关联，原句保留；不是宿主遥测执行行为，未迁入。 |
| `security-and-hardening` | `debugging-and-error-recovery` | 隐私事故发生时的条件性复盘调用，原句保留，未迁入。能力不可用时，该复盘阶段标记 `UNVERIFIED`，不冒称通用项目流程与原技能相同。 |

`frontend-ui-engineering` 没有显式调用其他上游技能。两个设计技能的自引用不增加依赖。

`document-release` 的 `codex exec` / Agent fallback 是工具操作，不是 `/codex` 技能调用：保留默认独立复核、Codex 宿主不自调用、同一 prompt 的只读子代理回退及准确标签；外部调用仍需授权。

`DESIGN_SHOTGUN_LOOP`、`TEST_BOOTSTRAP` 等是源模板宏，不等于调用同名上游技能。必要宏内容已展开或链接到包内资源。公共 preamble 的推广、遥测、自动更新、全局记忆/状态、宿主维护和全技能路由不属于上述技能的领域依赖，未迁入。

## 执行与验证边界

- 已授权的普通文件改动按原流程执行；安装、账号操作、外部模型、提交、推送、PR/MR 更新及恢复使用各自的授权范围。
- 缺少工具、授权或证据时如实记录，不能把静态检查、源代码阅读或预览图当作真实页面验证。
- 提交前的秘密检查扫描确切 index blob，而不是带 diff 前缀的文本；掩码工具不是完整的安全证明。
- 移植检查只验证正文保真、资源闭包、运行关联及插件格式，不评估审美提升或模型增益，不自动运行技能中的安装、浏览器、模型调用或发布工作流。
