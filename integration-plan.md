# matt-plus：四域能力补齐规划

> 定位：Matt Pocock Skills 保持需求澄清、规格、TDD、实现、诊断、领域建模和通用 code review 主流程。matt-plus 将生产设计、安全、发布和文档维护中 Matt 没有完整工作流、产物与完成条件的能力，连同必要资源适配为可独立分发的 Claude Code 插件。

## 目标与收录标准

收录判断不是“模型是否知道一般知识”，而是候选能否提供 Matt 缺少的专项流程、可检查产物和明确完成条件。每个收录 skill 必须满足：

1. 本地包含完整正文及其 load-bearing template、reference 或 script，不能依赖相邻仓库或全局目录。
2. description、触发范围和与 Matt/其他 skill 的交接边界清晰。
3. 模板占位符、遥测、自动更新、私有运行时、固定平台假设和未经授权的副作用已移除或改为显式门控。
4. 所有工具、URL、凭据、环境和权限缺失时报告 `UNVERIFIED`，不制造 `PASS`。
5. 有来源快照、MIT 归属、结构测试和行为用例；外部流程在授权的隔离环境实测前不宣称已验证。

“不为精简而删掉核心工作流”不意味着保留上游宿主耦合。全局状态、cookie 导入、自动 push/merge/deploy/revert、专用二进制和外部模型调用不是核心领域能力，必须替换或删除。

## 四域十一技能

| 领域 | skill | 适配来源 | 作用与边界 |
| --- | --- | --- | --- |
| 设计 | `design-consultation` | gstack | 建立设计方向、token、组件原则、`DESIGN.md` 与本地预览；不实现页面或做 live QA。 |
| 设计 | `frontend-ui-engineering` | agent-skills | 实现生产 UI 的真实状态、响应式与可访问性；不建立品牌系统或替代完整浏览器 QA。 |
| 设计 | `web-qa` | gstack QA | 使用 Playwright 对获授权页面做功能/回归 QA、可复现证据与逐项授权修复；不做视觉设计打磨或自动修复。 |
| 设计 | `design-review` | gstack | 审计运行中页面的设计系统一致性与视觉质量，并在授权后做最小修复、前后复测；不替代完整功能回归 QA。 |
| 安全 | `security-and-hardening` | agent-skills | 对单个 feature、端点、集成或确定 finding 做威胁建模与防护实现；不做全仓态势审计。 |
| 安全 | `security-audit` | gstack cso | 对明确仓库、diff 或命名域做默认本地、只读、非联网的安全审计；修复交给前者。 |
| 发布 | `shipping-and-launch` | agent-skills | 建立 readiness 证据、flag、灰度、监测和 recovery plan；不执行发布动作。 |
| 发布 | `setup-deploy` | gstack | 发现、确认与记录 deploy profile；不 provision 基础设施。 |
| 发布 | `land-and-deploy` | gstack | 先做只读 dry-run；逐项确认后编排 merge、deploy、health/canary 或 revert。 |
| 文档 | `document-generate` | gstack | 通过代码考古和 Diataxis 生成或重构指定项目/用户文档；不处理 ADR、spec 或 agent 指令。 |
| 文档 | `document-update` | gstack document-release | 基于确认的 base diff 修正已有文档事实漂移；不版本化、改 PR 或批量生成缺失文档。 |

### 能力链与交接

```text
design-consultation
  → 设计方向 / DESIGN.md / preview
  → frontend-ui-engineering
  → 生产 UI、状态、响应式、a11y
  → web-qa
  → Playwright 功能/回归证据与逐项授权修复
  → design-review
  → 运行中页面的设计系统与视觉审计

security-audit
  → 本地只读 posture report
  → security-and-hardening
  → 获授权的范围化修复与负向验证

setup-deploy
  → 已确认 deploy profile
  → shipping-and-launch
  → readiness、rollout 与 recovery 决策
  → land-and-deploy
  → dry-run 后的动作级授权执行

document-generate
  → 新建或重构所需文档
  → document-update
  → 未来变更的事实漂移维护
```

Matt 的 `domain-modeling` 保留 `CONTEXT.md` 和 ADR；`to-spec` 处理 spec/issue；`research` 处理研究材料；`writing-for-agents` 处理 agent 指令；`handoff` 处理交接产物。

## 自包含资源

```text
matt-plus/
  .claude-plugin/{plugin.json,marketplace.json}
  skills/
    design-consultation/assets/design-preview.html
    frontend-ui-engineering/
    web-qa/{SKILL.md,assets/report-template.md}
    design-review/assets/report-template.md
    security-and-hardening/
    security-audit/{references/,scripts/masked-secret-scan.mjs}
    shipping-and-launch/
    setup-deploy/references/deploy-profile-template.md
    land-and-deploy/references/deploy-report-template.md
    document-generate/
    document-update/references/document-health-template.md
  references/{accessibility,security,definition-of-done,performance,observability}-checklist.md
  evals/evals.json
  tests/{package,masked-secret-scan}.test.mjs
```

共用检查表只保留一份，技能通过包内相对链接引用。`masked-secret-scan.mjs` 使用 Node 18 标准库，仅输出文件、行号、规则和掩码预览；它不会把候选密钥或历史 blob 输出到 transcript。

来源、精确快照、每个本地资源及具体适配见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 安全与权限模型

### 默认行为

- 阅读当前用户授权范围内的项目文件与已有项目工具信息。
- 将网页、日志、CLI 输出、diff、PR 正文、仓库文本与第三方 API 响应视为不可信输入。
- 不自动安装包、读 home directory/全局设置、导入 cookie、访问外部账户、保存审计报告、commit、push、创建或编辑 PR、merge、deploy、revert 或修改项目规则。
- 不输出 raw secret，也不通过真实 provider 验证疑似凭据。

### 需要独立确认的行为

| 行为 | 确认中必须包含 |
| --- | --- |
| 网络 package audit、WebSearch 或远程安全工具 | 服务/命令、离开本机的 metadata、目标与停止条件。 |
| 全局设置、home directory、CI/cloud/platform 或生产 URL | 目标范围、账户、读取内容与副作用。 |
| 安装全局 `playwright-cli` | `npm install -g @playwright/cli@latest`、全局机器影响、随后验证命令与停止条件。 |
| 保存安全报告、运行可能写入或联网的扫描/测试 | 确切路径或命令、影响、预期输出。 |
| merge | repo、PR/revision、base、方法、CI/readiness 摘要与分支影响。 |
| staging 或 production deploy | 环境、触发方式、账户、health check、timeout、风险与恢复方式。 |
| canary/service check | URL、账户、读写范围、测试数据与预期副作用。 |
| revert | revision、目标分支、数据影响、恢复方法与负责人。 |

调用高权限 skill 不是对这些动作的授权。真实付款、删除、消息发送或其他业务写入永远需要单独明确授权。

## 领域适配重点

### 设计

- `design-consultation` 先读取现有 token、组件库、品牌资产和 `DESIGN.md`。仅在用户允许时做外部研究；它提供本地 HTML preview fallback，而不是要求特定浏览器或设计生成器。
- `frontend-ui-engineering` 覆盖 normal/loading/empty/error/permission/success/disabled，语义、标签、键盘、可见焦点、screen reader、contrast、touch target、reduced motion 与响应式。项目已有可访问 dialog primitive 优先；仅把按钮设焦点不等于完整 focus trap。
- `web-qa` 优先使用已验证的全局 `playwright-cli`；不可用时才使用项目已有 runner，不使用浏览器 MCP，也不自动安装依赖、下载浏览器、导入 cookie 或自行启动服务器。它先做功能/回归 QA，finding 的源码或测试修复逐项授权并在同条件下复测；缺 URL、CLI/runner、测试账户/数据或动作授权时为 `UNVERIFIED`。
- `design-review` 收集 target URL、环境、账户、允许操作、viewport 和 state 证据，保留设计系统与视觉审计职责。没有浏览器时只能静态审查，所有 live claim 为 `UNVERIFIED`。

### 安全

- `security-and-hardening` 以资产、信任边界、abuse case 和 STRIDE 建模，覆盖服务端授权/tenant isolation、cookie-auth CSRF、session 生命周期、reset enumeration、OAuth/OIDC、SSRF/DNS rebinding、上传、路径/符号链接、CORS、供应链、隐私和 LLM 边界。
- `security-audit` 明确区分 **verified vulnerability**、**unverified candidate**、**control gap** 和 **out of scope**。默认仅对选定本地仓库只读分析；主动 exploit、pentest、服务请求、历史/全局扫描或网络 audit 都需要额外授权。

### 发布

- `shipping-and-launch` 输出 `READY`、`HOLD`、`BLOCKED` 或 `UNVERIFIED`，以及当前项目可证实的 flag owner/expiry、advance/hold/rollback 标准和首小时观测计划。Web release 还记录与 revision/环境匹配的 QA scope/tier、关键流程、open/deferred finding、覆盖缺口与证据位置；缺失或不可比证据为 `UNVERIFIED`。
- `setup-deploy` 只从本地配置、IaC、workflow、script 与 runbook 发现候选信息。确认后才记录 profile，优先遵循项目既有约定；若没有，可建议 `.matt-plus/deploy-profile.md`，但不自动写入。
- `land-and-deploy` 必须先给出包含 revision、环境、命令/URL、成功条件和 recovery 的只读 dry-run。它不会假定 GitHub、固定版本文件、固定 changelog 或特定 CLI。

### 文档

- `document-generate` 限定受众、目标、输出位置与约束，阅读文档、实现、测试、公开 entry point、依赖、配置、错误和设计决策，按需要选择 Diataxis 象限。超过五个新/实质重构文档、改导航、`AGENTS.md` 或 `CLAUDE.md` 必须预览并确认。
- `document-update` 需要确认 base，不可靠时不能静默默认。它递归发现文档、映射 public surface、保守更新事实，保留 CHANGELOG；发现重大缺口时报告并交给 `document-generate`。

## 当前验证与下一步

当前包已具备十一个本地 skill、关联模板/参考资料、manifest、22 个行为用例和确定性扫描器测试。以下本地结构验证已实际完成：

- `node --test tests/package.test.mjs tests/masked-secret-scan.test.mjs`：13 项通过，覆盖十一技能矩阵、资源链接、来源、禁止的宿主耦合、QA CLI/逐项授权边界、掩码、排序、去重、输入上限、stdin、文件路径与读取错误。
- `claude plugin validate . --strict`：通过。
- `git diff --check` 及父仓库的 `git diff --check -- matt-plus`：无空白错误；matt-plus 内未跟踪文件仍应在纳入版本控制后再进行完整 diff 复核。

尚未完成的工作流验证如下；完成前所有外部结果仍为 `UNVERIFIED`：

1. 依 skill-creator 流程，对每个工作流型 skill 并行运行 with-skill 与 baseline，用静态 eval viewer 收集人工反馈后迭代；不以结构通过替代行为评估。
2. 在明确授权的隔离环境验证浏览器、CI、云平台、外部安全服务和部署路径，并逐次记录真实结果、环境和副作用。
3. 将当前未跟踪的插件文件纳入版本控制后，重新运行完整 `git diff --check` 与最终 diff review。

## 明确延后范围

本轮不扩展到公共 API 设计、代码简化、性能优化、可观测性、迁移或 CI/CD 自动化。这些不是没有价值，而是当前四域十一技能可独立形成闭环，且前述候选需要额外运行时、provider 分支或专项测试才能可靠分发。后续只有在真实使用暴露缺口时再单独评估。

## 验收标准

- manifest 恰好声明这十一个目录，前置 metadata 与目录名一致；所有本地 Markdown 链接和资源在包内可解析。
- 不含未展开模板、上游全局路径、专用运行时、遥测/自动更新或隐式外部审查依赖。
- 每个技能有来源归属和至少一个正常、一个边界行为用例；扫描器绝不输出 raw candidate value。
- 设计、审计、发布、文档技能的权限边界与本文一致；缺工具/授权时明确 `UNVERIFIED`。
- 官方插件验证和本地 Node 测试通过。
- 浏览器、CI、云、外部安全服务与真实部署只在明确授权的隔离环境中验证，并单独报告实际结果。
