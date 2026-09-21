---
name: document-update
description: 根据一个明确确认的 base diff 或变更范围，发现公开接口、行为、配置、架构图和跨文档中的事实漂移，并保守更新已有项目文档、输出覆盖与文档债务报告。用户要求更新文档、检查 release 后文档、让 README/API/架构说明匹配改动、做文档漂移审计或审查某分支文档时使用。不要用它批量生成缺失文档、自动改 CHANGELOG/版本/PR/TODO，或修改 CONTEXT.md、ADR、spec 和 agent 指令。
---

# 基于 diff 的文档更新

## 目标

将代码变化映射到读者可见的文档责任，并只更新明确的事实漂移。它不是发布流程，也不假设版本文件、CHANGELOG、托管平台或 feature branch 存在。

审计格式见 [文档健康模板](references/document-health-template.md)。

## 安全和范围

- 确认 base、head、变更范围和允许修改的文档。base 无法可靠检测时询问；不要静默选择 `main`。
- 递归发现相关 docs，不以任意目录深度截断；排除 build/cache/vendor 目录并说明自定义排除。
- 对 README、API、架构、贡献、运行、迁移和用户文档做事实检查。`CHANGELOG` 默认 preserve-only：不重排、删改或润色既有条目，除非用户把它明确加入范围。
- narrative/定位、security claim、文档删除、大规模重写、图表替换、导航，以及 `AGENTS.md`/`CLAUDE.md` 都需要预览和确认。没有确认时只报告建议。
- 不自动 commit、push、改 PR body/title、VERSION 或 TODO；不执行网络、凭据、生产或破坏性文档示例。

## 工作流

### 1. 变更与 public surface

读取确认的 diff、提交（如适用）和工作树状态，确保未提交与新文件不被遗漏。识别新增、重命名、移除或语义变化的：公开 API、CLI、配置、环境变量、路由、权限、行为、架构边界、迁移和用户可见错误。

对每项建立覆盖地图：

| Public surface | 读者 | 应受影响文档 | 当前覆盖 | 行动 |
|---|---|---|---|---|

用 Diataxis 作为缺口分析工具，而不是强制生成四类文档。

### 2. 审计现有文档

递归读取相关 Markdown、文档站源、README、architecture、contributing、API、runbook 和图表。检查：

- 事实、命令、参数、输出、链接和示例是否与当前实现一致；
- 新/删/改 public surface 是否被适当说明；
- 图表、术语、前置条件和跨文档链接是否漂移；
- 读者能否发现更新内容；
- CHANGELOG 是否仅受到范围内、最小且保序的修改。

区分 **factual local edit**、**critical missing coverage**、**reference-only gap**、**subjective/risky edit** 和 **out of scope**。缺失的大段资料交给 `document-generate`，不要在这里无界创建。

### 3. 保守更新与验证

直接修改获授权的 factual local drift；每处修改必须能指向 diff 或当前代码。对需要人类判断的内容先展示建议。验证相对链接、锚点、代码符号、命令和图表来源；没有安全本地验证工具时标 `UNVERIFIED`，不能执行示例来“证明”文档。

### 4. 健康报告

按模板输出 base/head、影响面、改动、未改动原因、critical gap、文档债务、验证状态和后续建议。没有事实漂移时明确 `NO-OP`；不为了产生 diff 重写措辞。

## 验收

- [ ] base 和完整变更范围明确，含未提交/新文件限制。
- [ ] 递归文档发现没有人为浅层遗漏。
- [ ] 每个自动修改是可证实的本地事实修复。
- [ ] CHANGELOG 顺序和现有内容得到保护。
- [ ] 缺失文档被报告或交给 document-generate，而非无界补写。
- [ ] 任何 agent 指令、导航、主观叙事或大重写都经用户确认。
