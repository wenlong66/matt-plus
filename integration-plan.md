# 移植范围、资源规则与上游调用

## 收录范围

分发以下七个移植技能，`code-simplification` 保持现有内容，不纳入本次修复范围。不增加通用 QA、部署或另一套计划审查入口。

| 技能 | 来源 | 必要领域资源 |
| --- | --- | --- |
| `design-consultation` | gstack | 提案与一致性规则、字体核验、每轮预览/反馈、DESIGN.md 格式/模板、独立设计提案 |
| `frontend-ui-engineering` | agent-skills | 无障碍检查表 |
| `design-review` | gstack | UX 原则、完整设计目录、审计方法/检查表、硬规则、native 测试 bootstrap、修复前 JS 回归、rendered DOM 观察/条件 detector、可比较 baseline |
| `document-release` | gstack | release-body、递归 audit-scope/caller-owned 候选快照、TODOS 格式、默认独立文档复核、RAW/envelope PR 关联、PR 标题脚本 |
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
- [图像与外部模型](references/image-tools.md)：双向 harness 路由、执行证据、disabled/failure 分支；[completion gate](scripts/outside-review-result.mjs) 仅验证本地实际结果，不派发模型。
- [完整设计目录](references/design-catalog.md)：保留原版规则、字体角色与判断元数据，不随包安装 detector。
- [DESIGN.md 格式](references/design-md-format.md)：[Node helper](scripts/design-md.mjs)、[spec 模板](assets/design-system-spec-template.md) 与随包 YAML parser；只读 check/tokens，convert 默认预览，写入仍需批准。
- [内容检查](references/content-guard.md)：保留旧 39 项规则和旧固定来源，没有随四技能升级 taxonomy。
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
| `design-review` | `/qa` 回归测试程序 | 新源 design-review 仍引用旧 8e.5，但新版 QA 将测试创建移到 8a.5、8e.5 仅记录结果。包内 [regression-tests.md](skills/design-review/references/regression-tests.md) 独立承接完整 JS-only 修复前 red → 修复后 green/记录，保留新测试文件限制，不需要整个 QA 技能。 |
| `design-review` | `/plan-design-review` litmus scorecard | 属于资源引用，必要 scorecard 已展开到 [outside-voices.md](skills/design-review/references/outside-voices.md)，不需要新增技能。 |
| `document-release` | `/ship` | 执行时机、已有 CHANGELOG、TODO 二次清理和标题惯例的来源关联，不要求再次执行 ship；由明确 release range、项目约定和包内标题脚本承接，未迁入。 |
| `document-release` | `/document-generate` | 覆盖缺口的可选后续建议。本包已有 `/matt-plus:document-generate`，不自动生成全部缺失文档。 |
| `document-generate` | `/document-release` | 可选覆盖地图输入，本包已有 `/matt-plus:document-release`；也可以独立运行或接受用户提供的地图。 |
| `document-release` | `review/TODOS-format.md` | 资源引用，不是 `/review` 调用；格式已随包迁入。格式说明中提到的 `/ship`、`/plan-ceo-review` 不构成新增依赖。 |
| `security-and-hardening` | `observability-and-instrumentation` | 可选的 PII/遥测说明性关联，原句保留；不是宿主遥测执行行为，未迁入。 |
| `security-and-hardening` | `debugging-and-error-recovery` | 隐私事故发生时的条件性复盘调用，原句保留，未迁入。能力不可用时，该复盘阶段标记 `UNVERIFIED`，不冒称通用项目流程与原技能相同。 |

`frontend-ui-engineering` 没有显式调用其他上游技能。两个设计技能的自引用不增加依赖。

三个使用 outside review 的 gstack 技能通过当前实际可用 CLI/tool 关联，不需要新增 `/codex` 或 `/claude-code` 技能：按真实宿主双向选择外部 provider，派发前复查、不自调用、不猜替代 provider；disabled/declined 不 fallback，enabled provider failure 才按原技能进行 native 回退。`document-release` 保留默认独立复核及 informational findings 的一次 apply 决策；native 不算 outside coverage，外部内容发送仍需授权。

`document-release` 的 caller-owned 文档审计必须有实际调度身份、调用方所有的候选快照与 freshness 证据；自称 spawned 的 prompt/文件不能开启该模式。Standalone pinned-revision 写入保护不受此模式放宽。候选快照是本次调用的必要证据，不是全局状态或整个 `/ship` 的替代。

`DESIGN_SHOTGUN_LOOP`、`TEST_BOOTSTRAP` 等是源模板宏，不等于调用同名上游技能。必要宏内容已展开或链接到包内资源。公共 preamble 的推广、遥测、自动更新、全局记忆/状态、宿主维护和全技能路由不属于上述技能的领域依赖，未迁入。

## 执行与验证边界

- 已授权的普通文件改动按原流程执行；安装、账号操作、外部模型、提交、推送、PR/MR 更新及恢复使用各自的授权范围。
- 缺少工具、授权或证据时如实记录，不能把静态检查、源代码阅读或预览图当作真实页面验证。
- 提交前的秘密检查扫描确切 index blob，而不是带 diff 前缀的文本；掩码工具不是完整的安全证明。
- 移植检查只验证正文保真、资源闭包、运行关联及插件格式，不评估审美提升或模型增益，不自动运行技能中的安装、浏览器、模型调用或发布工作流。
