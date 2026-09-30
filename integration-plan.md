# 六个原版技能的关联适配

## 收录范围

从实际 `agent-skills`、`gstack` 源码重新选取，以 Matt Pocock Skills 为通用工程基线，matt-plus 仅作为目的地。

| 方向 | 原名技能 | 来源 |
| --- | --- | --- |
| UI 设计 | `design-consultation` | gstack |
| UI 设计实现 | `frontend-ui-engineering` | agent-skills |
| 实际视觉审查与修复 | `design-review` | gstack |
| 现有文档同步 | `document-release` | gstack |
| 文档生成 | `document-generate` | gstack |
| 安全加固 | `security-and-hardening` | agent-skills |

不增加通用功能 QA、全仓安全态势审计、部署或另一个设计计划审查入口。

## 改动边界

- 保留原名、description、领域正文、教程/例子、必要阶段与输出，不重写、精简或增强原版技能。
- 只适配缺失的资源、路径、运行时、工具和关联技能。必要原版模板段落在包内展开或链接。
- 删除推广、遥测、自动更新、无用全局记忆/状态等宿主关联。
- 独立执行与权限契约放入关联资源；不将原版 audit → fix → verify 改为只读报告，不删除原有提交/发布阶段。
- 上游命令文字不构成执行授权；缺失工具、权限或证据如实标记，不隐式安装。

## 包内资源

Claude Code manifest 精确列出六个目录；Codex manifest 指向同一份 `./skills/`。必要模板、方法和检查表随包分发，不依赖相邻上游仓库或固定 home 安装。

共享关联：[动作权限](references/external-actions.md)、[浏览器](references/browser-tools.md)、[图像/外部模型](references/image-tools.md)、[内容检查工具](references/content-guard.md)。各技能的局部说明处理原版缺失关联，来源和快照见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

旧版未选技能、专属资源、旧扫描器及其测试已清理。行为评估用例已移除，不在本轮范围内。

## 验收范围与状态

**只验证改动是否正确、原版是否保留，不评估技能是否有效。**

| 检查 | 状态 |
| --- | --- |
| agent-skills 两技能与检查表的原版差异 | 已核对，仅关联说明、缺失跨技能关联与掩码工具替换 |
| gstack 必要领域段落与关联替换 | 已核对原版段落/模板；UI 阶段 0–6、1–11 及两种文档流程保留，元数据一致 |
| 六技能清单、两端 manifest、包内引用、模板与来源闭包 | 11 项静态检查通过；本轮共 111 项本地检查通过 |
| 内容检查工具接口、源模式保真、输入边界与掩码输出 | 100 项本地合成测试通过，Node v22.14.0 |
| Claude Code plugin 与本地 marketplace 格式 | 两份 manifest 均通过严格验证 |

已读取本机 `playwright-cli` 0.1.21 help 及 screenshot/eval/run-code/highlight 的实际参数，检查工具关联，不打开浏览器。

没有运行技能效果评估、模型对照、图像生成、真实页面、真实依赖安全扫描、外部账户操作、提交、推送或部署；没有安装任何工具。结构和脚本测试不是这些外部结果的证明。
