---
name: shipping-and-launch
description: 为生产发布建立并审查就绪证据、feature flag、分阶段 rollout、可观测性、错误预算和 recovery strategy。用户准备上线、发布高风险变更、开放 beta、制定灰度/回滚方案或询问“上线前还缺什么”时使用。它不执行 merge、部署、调流量、回滚或修改 CI；这些操作需单独授权并交给 setup-deploy 或 land-and-deploy。
---

# 发布准备与上线

## 目的

发布不是“代码可以合并”的同义词。此 skill 将现有测试、审查、浏览器 QA、安全、性能、无障碍、迁移、文档和运行信号整理成可审计的 readiness decision，并在执行前定义什么时候 advance、hold 或 rollback。

读取 [Definition of Done](../../references/definition-of-done.md)、[安全](../../references/security-checklist.md)、[性能](../../references/performance-checklist.md)、[无障碍](../../references/accessibility-checklist.md) 和 [可观测性](../../references/observability-checklist.md)，但只应用与项目和 release scope 相关的检查。

## 不可替代的边界

- 先确定 release、环境、用户影响、数据变更、依赖、既有 CI、既有监控及 release owner；不假设所有项目都是 Web 服务或有 feature flag。
- 检查结果是证据，不是自动批准。缺命令、环境、凭据、观察期或权限时是 `UNVERIFIED`，不是绿灯。
- 不自动运行未知命令、安装 scanner、访问 production、修改 flag、通知团队、merge、deploy 或 rollback。那些动作需要当时的明确授权。
- Telemetry 的 user ID、email、session token 或其他个人数据必须遵循项目的最小化与 allowlist 规则；不能为方便监控而扩大收集。

## 工作流

### 1. 建立 release 画像

报告变更类型（功能、风险修复、schema、基础设施、文档）、影响面、部署单元、目标环境、owner、可用 observability 和恢复边界。对数据库和异步工作写 recovery strategy：兼容 schema、暂停点、备份/restore、roll-forward 或演练过的 down path；不要发明通用 rollback 命令。

### 2. 收集 readiness 证据

按项目实际配置收集，逐项标记：

| 维度 | 证据/命令 | 状态 | 风险或缺口 |
|---|---|---|---|
| Build、tests、review |  |  |  |
| Security、依赖、权限 |  |  |  |
| Performance、容量 |  |  |  |
| Accessibility、关键任务 |  |  |  |
| Browser QA、关键流程 | revision、环境、scope/tier、`playwright-cli`/runner、证据位置 |  |  |
| Migration、恢复 |  |  |  |
| Logs、metrics、trace、alert/runbook |  |  |  |
| Docs、support、owner |  |  |  |

没有适用项用 `N/A` 并说明原因。Browser QA 证据必须与当前 revision、环境和关键流程匹配，并列出 open/deferred finding、覆盖缺口和证据位置；缺失、过期或不可比时为 `UNVERIFIED`。必要时将尚未满足的高风险项标为 blocker，而不是通过降低门槛获得绿灯。

### 3. 设计 rollout

对可隔离功能，定义 flag 的 owner、目标、expiry、on/off 测试和清理日期。定义阶段（例如 staging、内部、少量、扩大、全部）、每阶段观察窗口及比较的基线。阈值必须来自项目 SLO、容量数据或用户确认的暂定预算；“错误翻倍”“延迟增加 50%”只能作讨论起点，不能假装适用于所有系统。

对每个阶段写出：

| 阶段 | 允许进入条件 | 观察信号 | Advance | Hold | Rollback/mitigation |
|---|---|---|---|---|---|

错误预算耗尽、数据完整性、安全事件或没有可恢复路径时，默认 hold。

### 4. 第一小时与恢复

列出发布后负责人的健康检查、错误/延迟/业务信号、关键用户流程、日志可读性与通知路径。确认 flag disable、版本回退或恢复策略的实际负责人和预估恢复时间；未演练只能标“准备度声明”，不能标“已验证”。

### 5. 交付 decision

输出 `READY`、`HOLD`、`BLOCKED` 或 `UNVERIFIED`，列出 blockers、风险接受者、授权前提与下一步。需要记录或执行当前项目 deploy profile 时用 `setup-deploy`；需要执行已批准发布时用 `land-and-deploy`。

## 验收

- [ ] 每个绿色结论有真实证据，不是 checklist 勾选。
- [ ] rollout 有可观测信号、owner、阶段和明确的 hold/rollback 行为。
- [ ] 恢复策略覆盖数据与外部副作用，不虚构 universal down migration。
- [ ] 没有直接执行部署、流量/flag 变更或外部通知。
