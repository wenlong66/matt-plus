# matt-plus

**面向 Matt Pocock Skills 的七个原版技能移植：UI 设计、文档生成与同步、安全加固及代码简化。**

从 `agent-skills` 和 `gstack` 移植，不沿用旧版 matt-plus 的技能组合。保留原名、原版正文、必要功能与工作流；只适配缺失的工具、资源和路径关联，删除无用的宿主关联。不改写、合并或精简原版领域内容。

本包分发实际技能及其必要资源，运行时不需要安装完整上游插件。与 Matt 的通用需求、规格、TDD、实现和 code review 流程配合使用，不强制安装 Matt，也不把专项技能的原有修复/验证阶段转交给它。

## 七个入口

| 来源 | 技能 | 职责 |
| --- | --- | --- |
| gstack | `/matt-plus:design-consultation` | 理解产品、研究设计方向、提出设计系统、预览与迭代，产出 `DESIGN.md`。 |
| agent-skills | `/matt-plus:frontend-ui-engineering` | 将设计实现为具体 UI，保留组件/状态示例、参考驱动设计、响应式、可访问性与完成检查。 |
| gstack | `/matt-plus:design-review` | 实际页面的设计审计 → 修复 → 原子提交 → 前后复测与回归处理。 |
| gstack | `/matt-plus:document-release` | 基于变更同步已有文档、覆盖地图、图表、CHANGELOG，以及原版可选 TODO、版本和 PR/MR 同步。 |
| gstack | `/matt-plus:document-generate` | 代码考古、概念地图、按需要选择 Diataxis 象限，生成文档并校验实例、链接与事实。 |
| agent-skills | `/matt-plus:security-and-hardening` | 威胁建模、abuse case、安全实现、依赖审计及负向验证。 |
| agent-skills | `/matt-plus:code-simplification` | 保持行为不变，简化代码并提升清晰度。 |

不收录通用功能 QA、全仓安全态势审计或部署技能。文档的 `document-release` 不等于生产部署。

## 独立适配与工具要求

- 所有必要正文、模板、检查表和本地脚本随包分发；来源链接仅用于追溯。
- gstack 模板的必要领域段落在包内展开或关联，宿主的推广、遥测、更新检查和全局记忆/状态关联不迁入。
- 网页测试优先调用已安装的 `playwright-cli`，可用时先加载同名技能并检查实际 help；未安装时使用当前宿主默认浏览器工具。缺失能力标记 `UNVERIFIED`，不自动安装、下载浏览器、导入个人 cookie 或启动服务器。
- 可选 designer/外部模型关联到获授权且可用的工具。缺少 designer 时使用原版允许的 HTML 字体/颜色预览路径，不把静态预览当作实际 UI 验证。
- 必需能力、权限或证据缺失时标记 `UNVERIFIED`，不宣称原版工具已经被完整等价验证。
- 原版的修复、提交、推送、PR/MR 更新和恢复能力仍保留；实际执行需要相应的范围与动作授权。调用技能不是所有副作用的一揽子授权。

资源规则：技能独有的 references、scripts、assets 放在各自技能目录；多个技能共用的资源放在根 references、scripts，不交叉借用其他技能的私有参考。

关联适配说明：[动作授权](references/external-actions.md)、[浏览器](references/browser-tools.md)、[图像与外部模型](references/image-tools.md)、[本地内容检查](references/content-guard.md)、[共用兼容说明](references/compatibility-notes.md)。[上游技能调用清单](integration-plan.md#上游技能调用)区分包内技能、未迁入调用和已展开的必要资源。

## Claude Code

在目标项目中由用户选择加载方式，避免重复加载同一插件：

```bash
claude --plugin-dir /absolute/path/to/matt-plus
```

或通过本地 marketplace：

```text
/plugin marketplace add /absolute/path/to/matt-plus
/plugin install matt-plus@matt-plus
```

上述命令是使用说明，不会在本次适配中自动执行安装。

## Codex

Codex 与 Claude Code 共用唯一的 [skills/](skills/)；[Codex manifest](.codex-plugin/plugin.json) 直接指向 `./skills/`，不复制第二套正文。本仓库现有 Codex marketplace 已关联 matt-plus，可由用户主动选择安装：

```bash
codex plugin list
codex plugin add matt-plus@plugins
```

安装会修改用户配置；本包适配不自动执行。

## 本地验证

Node.js 18+，无需安装 npm 依赖：

```bash
node --test tests/package.test.mjs tests/content-guard.test.mjs tests/design-adaptation.test.mjs
claude plugin validate .claude-plugin/plugin.json --strict
claude plugin validate .claude-plugin/marketplace.json --strict
```

验收只检查原版保真与适配正确性：七技能清单、两端 manifest、源正文差异、包内引用、来源和模板关联。`code-simplification` 保持现有移植内容，不纳入本次修复的正文差异检查。内容检查工具用合成数据验证移植后的脚本接口与错误处理，不验证真实凭据。

回归测试覆盖包结构、内容检查工具和比较板反馈协议；浏览器验证只在隔离合成样例中进行，不等于真实业务页面的完整审查。不做技能有效性、审美提升或模型增益评估，不自动执行外部审查或发布流程。检查范围见 [integration-plan.md](integration-plan.md)。

纯本地 HTML 测试可显式使用专用的隔离、离线浏览器配置，见[浏览器关联说明](references/browser-tools.md#opt-in-local-html-testing)。默认不启用 `file://` 访问，也不修改全局浏览器设置。

## 来源

- [第三方来源、精确快照与适配范围](THIRD_PARTY_NOTICES.md)
- [MIT 许可与原作者版权声明](LICENSE)
