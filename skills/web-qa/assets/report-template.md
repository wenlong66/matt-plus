# Playwright QA 报告

## 测试合同

| 项目 | 值 | 状态 |
| --- | --- | --- |
| 目标 URL / 允许 origin |  |  |
| 环境 / revision |  |  |
| base / diff 意图 |  |  |
| 模式 / tier |  |  |
| 执行能力 | `playwright-cli` / 项目 runner / `UNVERIFIED` |  |
| 测试账号、角色与测试数据 |  |  |
| 允许动作 / 禁止业务写入 |  |  |
| 视口与 timeout |  |  |
| 证据交付位置 |  |  |

## 执行摘要

- Verdict: `PASS` / `FAIL` / `PARTIAL` / `UNVERIFIED`
- 测试开始与结束：
- 实际执行命令或交互能力：
- 未覆盖范围及原因：
- 敏感信息处理：已脱敏 / 不适用

## 覆盖与证据清单

| 页面或流程 | 前置条件 | 视口 | 覆盖的状态/动作 | 结果 | 证据 |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  | `PASS` / `FAIL` / `UNVERIFIED` |  |

记录已检查的导航、表单、loading/empty/error/permission/success/disabled、键盘/focus、console/network/dialog 和响应式条件。未测试项必须保留在表内并说明原因。

## Finding 汇总

| ID | 严重度 | 类别 | 状态 | 受影响范围 |
| --- | --- | --- | --- | --- |
|  | critical / high / medium / low | functional / UX / content / accessibility / console / network / visual baseline | `OPEN` / `DEFERRED` / `FIXED AND VERIFIED` / `BEST-EFFORT` / `REGRESSED` / `UNVERIFIED` |  |

## Finding 详情

### QA-001 — 标题

- 严重度与类别：
- 影响用户：
- URL、viewport、状态与前置条件：
- 期望：
- 实际：
- 复现步骤：
  1. 
  2. 
  3. 
- 重试结果：可复现 / 未确认 / 未执行
- 证据：截图、脱敏 console/network/dialog、可见页面状态
- 相关代码线索（若已阅读）：
- 状态：

### 单项修复授权

- Root-cause confidence：high / medium / low / unknown
- 最小拟改文件与变化：
- 现有检查与可能副作用：
- Regression-test seam：可用 / 不适用 / `UNVERIFIED`，原因：
- 用户对 QA-001 的修复批准：未请求 / 已批准 / 拒绝
- 修改后同条件复测：`PASS` / `FAIL` / `UNVERIFIED`
- Before/after 证据：

复制此小节以记录每个 finding；不得将多个 finding 视作同一授权。

## Baseline 与健康度

| 分类 | 覆盖范围 | 结果 | baseline 可比性 |
| --- | --- | --- | --- |
| links/navigation |  |  |  |
| functional |  |  |  |
| UX / content |  |  |  |
| accessibility |  |  |  |
| visual baseline |  |  |  |
| console / network |  |  |  |
| performance signal |  |  |  |

- 聚合 health score：数值 / `UNVERIFIED`
- 资格说明：只有范围、环境、revision、tier 与适用分类完整可比时才给出数值或趋势。

## 发布交接

- 可供 `shipping-and-launch` 使用的版本匹配证据：
- Open / deferred finding：
- Blocker：
- 缺口与 `UNVERIFIED` 项：
- 本报告不证明的环境或流程：
