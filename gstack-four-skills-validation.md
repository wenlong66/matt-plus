# 历史记录（移除 design-review 前）

本记录描述原四技能快照；当前仅保留其中三个技能，现有分发与验证命令见 README。

# 四个 gstack 技能移植验证

验证日期：2026-10-09。范围仅为 `design-consultation`、`design-review`、`document-release`、`document-generate`，以及它们使用的共享资源；未验证另外三个技能。

结论：四个技能的核心流程与必要资源可在 Codex 中使用，运行时不需要完整 gstack、相邻上游仓库或其全局配置。必须一起分发本包的共享 references、scripts、assets 和许可证；只复制某个 SKILL.md 或单个技能目录不完整。可选图像生成、detector、外部模型和远程发布能力仍受实际工具与访问条件限制，不代表全部 gstack 工具链已等价重现。

| 技能 | 内容与资源 | 验证结论 |
| --- | --- | --- |
| design-consultation | Phase 0–6、完整设计提案、字体规则、预览/反馈/确认、DESIGN.md 格式与模板；比较板脚本和实际图片清单随包分发 | 核心流程与本地 helper 通过；HTML 预览和比较板已用 playwright-cli 执行验证。图像生成与独立提案未调用外部服务。 |
| design-review | Setup、Phases 1–11、完整方法/十类检查/评分、UX 与设计规则、修复/原子提交/复测/失败恢复、回归程序、DOM 观察与 dump、baseline 模板 | 资源与 helper 通过；DOM 脚本已在浏览器执行，dump 只操作克隆。恢复原版修复后 8e.5 回归创建顺序。未对真实业务站点执行审查或修复。 |
| document-release | 覆盖地图、audit-scope、release-body、TODO 格式、独立复核，以及 candidate、tracker envelope、PR body、标题脚本 | 核心资源与脚本通过；覆盖候选 freshness、已提交/暂存/未暂存/新增文件、原始 PR body 保留、标题转换。未执行远程 PR/MR 更新、推送或版本修改。 |
| document-generate | Steps 0–9、代码考古/概念地图、四象限完整写作模板、交叉链接、质量与发布步骤 | 原版 Steps 3–6 模板与固定快照逐字核对通过；共享格式、内容检查与发布依赖可脱离上游运行。未生成或发布真实项目文档。 |

原版基线沿用包内来源声明：多数资源为 `92cfd07a` / `1.91.45.0`；design-review 的设计系统捕获与目标图约束、outside completion 标签解析为 `54efba6d` / `1.91.67.0`。没有升级到其他上游版本。

本次修补：

1. 保留四个技能的版本、触发词和兼容说明，将非标准顶层字段移到 `metadata`，使 Codex 基础技能校验通过。名称、description 与领域内容保留。
2. 补充 [Codex 工具关联](references/codex-tools.md)：映射源工具名、提问、图片查看、实际技能路径，以及 Codex 的 AGENTS.md 指针。无需 Claude 专有环境变量。
3. 所有四个技能的网页测试优先使用已安装的 `playwright-cli`；缺失时提示安装，若用户不安装则使用当前可用的测试方法，仅对无法执行的检查报告 `UNVERIFIED`。不改变原版允许的非浏览器研究或 HTML/图片交付路径。
4. 移除现有移植额外插入的 `8a.6` 修复前测试阶段，恢复 design-review 原版 `8e.5` 的创建、运行、通过提交/失败 defer 顺序。该段正文与 `54efba6d` 一致，仅将 `/qa` 的资源调用映射到包内程序。匹配的完整创建程序来自 `e7b2ef21` 的 QA 8e.5，详见 [来源声明](THIRD_PARTY_NOTICES.md)。未将新版 QA 的不同流程移入设计审查。
5. 修正两处验证测试的 CRLF 处理；为随包 YAML parser 和 Apache 许可证固定 LF，恢复上游校验字节。保留原版脚本逻辑与现有发布保护。
6. 补全 `/impeccable` 可选 handoff 调用清单，新增四技能资源闭包、隔离路径运行与原版段落保真测试。

未发现这四个技能会执行 gstack 推广、遥测、自动更新或宿主维护；未引入这些流程。项目自身的业务遥测文档、真实发布步骤和来源/许可证属于功能或归属内容，继续保留。

上游技能调用与处理：

| 调用/关联 | 处理 |
| --- | --- |
| `/office-hours` | 可选产品发现前置，未迁入；使用提供的产品记录或产品澄清对话。 |
| `/plan-design-review` | 现有网站/计划阶段的可选转介，未迁入；设计审查使用的 litmus scorecard 已随包展开。 |
| `/design-html` | 原版可选交付后建议随推广移除，不是设计系统必要依赖。 |
| `/setup-browser-cookies` | 登录态关联适配为授权的隔离测试 session，不迁入个人 cookie 工具。 |
| `/qa` | design-review 使用的回归创建程序已随包展开，不需要移植整个 QA。 |
| `/ship` | 文档发布时机、范围和标题等约定适配为显式项目输入及本地脚本，无需整个 ship。 |
| `/document-release` ↔ `/document-generate` | 两个可选文档后续入口均已在本包。 |
| `review/TODOS-format.md` | 实际资源已迁入，不构成 `/review` 技能依赖。 |
| `/impeccable` 的 polish、normalize、simplify、clarify、adapt、optimize、typeset、colorize、arrange | 可选 detector handoff，未迁入；仅在对应工具实际可用时调用。完整设计规则目录已迁入。 |
| `/codex`、`/claude-code` | 外部复核工具关联，无需移植包装技能；按真实宿主选择独立 provider，禁止自调用。 |

没有需要额外迁入的必选技能；必要领域段落和资源已在包内。完整调用说明见 [integration-plan.md](integration-plan.md#上游技能调用)。

验证记录：

- 四个入口均通过 `skill-creator/scripts/quick_validate.py`（Windows 使用 UTF-8 模式）。Codex manifest 指向唯一的 `./skills/`；当前 [官方技能说明](https://developers.openai.com/plugins/build/skills)与[插件兼容格式说明](https://developers.openai.com/plugins/build/plugins)支持这一布局。
- 10 个相关测试文件：**221 项，220 通过、0 失败、1 项跳过**。跳过项为 Windows 不支持换行文件名；空格/Unicode/NUL 清单路径已实际验证。
- 四技能本地 Markdown 资源引用均解析到包内，无未展开宿主宏。完整设计目录的 86 项原文及元数据、YAML parser 字节哈希与许可证比对通过。
- 将四技能及共享依赖复制到带空格的临时目录，从无上游仓库、无 node_modules、无其他技能的独立项目运行 helper，通过。
- `playwright-cli 0.1.21` + 已安装 Chrome + 本包隔离/离线配置：375/768/1024/1440 四个视口均无横向溢出；主题切换、示例表单反馈、真实已保存图片、反馈下载、无效请求恢复及轮次锁定通过。页面脚本错误 **0**，外部 HTTP(S) 请求 **0**。
- DOM 观察脚本取得实际字体/颜色/标题数据；dump 去除合成表单内容、脚本、事件属性、URL query/fragment，原页面内容保持不变。已查看手机与桌面截图。
- `git diff --check` 通过。没有修改其他技能、用户全局配置或执行提交/推送。

复现本地测试（在本包目录，Node.js 18+；标题分支需要 Bash，Windows 可用 Git Bash）：

```bash
node --test tests/design-consultation-sync.test.mjs tests/design-review-sync.test.mjs tests/document-release-sync.test.mjs tests/document-generate-sync.test.mjs tests/design-adaptation.test.mjs tests/design-md.test.mjs tests/shared-design-source.test.mjs tests/outside-review-result.test.mjs tests/content-guard.test.mjs tests/four-skill-portability.test.mjs
```

条件边界：图像生成/check/extract/verify、detector 引擎、截图像素比较器、跨模型复核、GitHub/GitLab 访问没有随包伪造。缺少工具或证据时按原版适用分支继续、defer 或标记 UNVERIFIED。静态包测试与合成页面测试证明移植结构/接口可运行，不证明真实产品审美效果、完整业务回归或远程发布已经执行。
