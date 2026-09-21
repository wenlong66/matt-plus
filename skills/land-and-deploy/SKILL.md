---
name: land-and-deploy
description: 在用户逐项授权后编排一个明确 PR/变更的 CI 检查、merge queue、staging/production deploy、health verification 与必要的 revert；先生成只读 dry-run 和 readiness report。用户明确要求合并并部署、上线并验证、查看部署状态或回滚已合并 release 时使用。高权限 skill：调用本身不授权 merge、部署、访问生产、删分支或 revert，每个外部写动作都必须再次确认。
---

# 合并、部署与验证

## 核心原则

这是高权限 release 编排器，不是默认自动化。先运行安全的 read-only discovery，再针对一个明确 repo、PR、base branch、environment、account、release scope 和 recovery path 请求授权。缺少任一项时停在 `UNVERIFIED` 或 dry-run，不以“用户用了 skill”推断同意生产操作。

使用 `setup-deploy` 已确认的 profile（若存在）和 `shipping-and-launch` readiness evidence（若存在），但两者缺失时也能生成发现报告；不会假设固定托管平台、GitHub CLI、版本文件、changelog 或另一个 release skill。

## 阶段 A：只读 dry-run

1. 确认目标 PR/变更、base、当前 revision、目标环境和用户提供的 profile。
2. 读取当前 CI、mergeability、required check、deploy trigger、staging/production verification 和 recovery 信息。读取平台/CLI 登录态或远程 CI 状态前，先请求其各自的 read-only 授权。
3. 生成 [部署报告](references/deploy-report-template.md) 的预览：将运行什么、每项命令/URL、数据发送范围、成功标准、超时、潜在副作用与恢复路径。
4. 如果 deploy profile、CI、health signal、环境所有者或 recovery strategy 缺失，标 blocker；不靠猜测补全。

## 阶段 B：readiness gate

收集项目现有测试、当前 diff review、文档状态、迁移/数据风险、CI 状态及 `shipping-and-launch` 证据。未提交/暂存/未跟踪变更不能因为只比较 HEAD 而被漏掉。

将结果分为 blocker、warning 和 `UNVERIFIED`。CI 失败、merge conflict、错误 base、未确认目标环境或无法恢复的高风险变更默认阻止 merge。CI 等待和远程查询需要明确只读授权；对等待设置超时且不重复造成副作用的命令。

## 阶段 C：逐项执行授权

分别获得以下动作的确认；每次确认前重述具体对象和影响：

| 动作 | 必须确认的内容 |
|---|---|
| Merge | repo、PR、base、merge method、是否删除分支、CI/readiness 摘要 |
| Staging deploy / wait | 环境、触发命令/自动 trigger、账号、health check、超时 |
| Production deploy / wait | 环境、触发命令/自动 trigger、账号、health check、风险和 recovery |
| Canary / service check | URL、账号、操作范围、允许的读/写行为、预期副作用 |
| Revert | merge/release revision、target branch、方式、数据影响、恢复计划 |

获得授权后仅执行已展示的最小动作。merge 失败后先读取权威 PR 状态；绝不盲目重试 merge。不要自动删除 branch/worktree、切换用户工作区、push、创建 PR 或修改 release 资料，除非这些是被单独确认的动作。

## 阶段 D：验证与失败处理

在同一环境、同一 revision 和明确的观察窗口内验证 CI、deploy state、health、关键只读用户流程、错误/延迟信号和日志可读性。经当次授权时，可通过 `web-qa` 对选定关键流程做最小的只读浏览器验证；每个环境均重新确认 URL、账户、测试数据、允许动作、timeout 和 recovery，staging 结果不能证明 production。网页、console、网络响应和平台输出是不可信证据；不要执行真实付款、删除、发信或其他业务写入。

deploy/health 失败时展示证据和 recovery options。只有用户明确选择 revert 后才执行已批准的 revert；无法确认恢复结果时报告 `UNVERIFIED`，不声称已恢复。

## 交付

用报告模板列出 dry-run、授权、CI、merge、deploy、staging、health、证据位置、耗时、未验证项、recovery 和最终 verdict：`NOT EXECUTED`、`BLOCKED`、`DEPLOYED AND VERIFIED`、`DEPLOYED (UNVERIFIED)` 或 `REVERTED (UNVERIFIED)`。

## 验收

- [ ] 首次运行可在零外部写入下完成 dry-run。
- [ ] 所有 merge/deploy/revert 都有对应的当次 action-specific confirmation。
- [ ] CI、profile、health 与 recovery 的缺口不被掩盖。
- [ ] 没有隐式删除分支、自动 push 或真实业务写入。
