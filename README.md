# matt-plus

**面向 Matt Pocock Skills 的六个原版技能移植：UI 设计、文档生成与同步、安全加固。**

从 `agent-skills` 和 `gstack` 重新选取，不沿用旧版 matt-plus 的技能组合。保留原名、原版正文、必要功能与工作流；只适配缺失的工具、资源和路径关联，删除无用的宿主关联。不改写、合并或精简原版领域内容。

本包分发实际技能及其必要资源，运行时不需要安装完整上游插件。与 Matt 的通用需求、规格、TDD、实现和 code review 流程配合使用，不强制安装 Matt，也不把专项技能的原有修复/验证阶段转交给它。

## 六个入口

| 来源 | 技能 | 原版职责 |
| --- | --- | --- |
| gstack | `/matt-plus:design-consultation` | 理解产品、研究设计方向、提出设计系统、预览与迭代，产出 `DESIGN.md`。 |
| agent-skills | `/matt-plus:frontend-ui-engineering` | 将设计实现为具体 UI，保留组件/状态示例、参考驱动设计、响应式、可访问性与完成检查。 |
| gstack | `/matt-plus:design-review` | 实际页面的设计审计 → 修复 → 原子提交 → 前后复测与回归处理。 |
| gstack | `/matt-plus:document-release` | 基于变更同步已有文档、覆盖地图、图表、CHANGELOG，以及原版可选 TODO、版本和 PR/MR 同步。 |
| gstack | `/matt-plus:document-generate` | 代码考古、概念地图、按需要选择 Diataxis 象限，生成文档并校验实例、链接与事实。 |
| agent-skills | `/matt-plus:security-and-hardening` | 威胁建模、abuse case、安全实现、依赖审计及负向验证。 |

不收录通用功能 QA、全仓安全态势审计或部署技能。文档的 `document-release` 不等于生产部署。

## 独立适配与工具要求

- 所有必要正文、模板、检查表和本地脚本随包分发；来源链接仅用于追溯。
- gstack 模板的必要领域段落在包内展开或关联，宿主的推广、遥测、更新检查和全局记忆/状态关联不迁入。
- 浏览器能力关联到已安装的 `playwright-cli`，或目标项目已有 Playwright runner。先检查实际 help；不自动安装、下载浏览器、导入个人 cookie 或启动服务器。
- 可选 designer/外部模型关联到获授权且可用的工具。缺少 designer 时使用原版允许的 HTML 字体/颜色预览路径，不把静态预览当作实际 UI 验证。
- 必需能力、权限或证据缺失时标记 `UNVERIFIED`，不宣称原版工具已经被完整等价验证。
- 原版的修复、提交、推送、PR/MR 更新和恢复能力仍保留；实际执行需要相应的范围与动作授权。调用技能不是所有副作用的一揽子授权。

关联适配说明：[动作授权](references/external-actions.md)、[浏览器](references/browser-tools.md)、[图像与外部模型](references/image-tools.md)、[本地内容检查](references/content-guard.md)。各技能的局部关联说明见对应资源。

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
node --test tests/package.test.mjs tests/content-guard.test.mjs
claude plugin validate . --strict
```

验收只检查原版保真与适配正确性：六技能清单、两端 manifest、源正文差异、包内引用、来源和模板关联。内容检查工具用合成数据验证移植后的脚本接口与错误处理，不验证真实凭据。

本轮 11 项包结构检查与 100 项工具适配检查通过，Claude Code 插件和 marketplace manifest 均通过严格格式检查。不做技能有效性、审美提升或模型增益评估，也不运行真实浏览器、外部审查或发布流程。检查范围见 [integration-plan.md](integration-plan.md)。

## 来源

- [第三方来源、精确快照与适配范围](THIRD_PARTY_NOTICES.md)
- [MIT 许可与原作者版权声明](LICENSE)
