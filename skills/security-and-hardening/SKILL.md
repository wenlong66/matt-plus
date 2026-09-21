---
name: security-and-hardening
description: 为一个明确的 feature、端点、认证授权流程、外部集成、文件上传、敏感数据或已确认安全 finding 进行威胁建模、实现安全控制和负向验证。用户处理不可信输入、登录/权限、webhook、支付、PII、依赖风险、SSRF 或 LLM 工具权限时应使用。不要把它当作全仓安全审计，也不要在没有授权时改变认证、CORS、隐私、CI 或生产策略。
---

# 安全加固

## 目的与边界

安全控制从信任边界和可验证的 abuse case 开始，而不是从框架清单开始。该 skill 处理用户指定的有限变更或审计 finding；全仓、branch-diff 或基础设施 posture 分析使用 `security-audit`。

详细模式见 [安全检查表](../../references/security-checklist.md)。其中的语言、框架和工具示例不是依赖安装指令。

## 授权边界

- 读取当前仓库中与目标相关的代码和配置可用于明确的加固任务。
- 改认证、授权、session、CORS、CSP、限流、敏感数据、第三方集成、上传策略、CI 或安全策略前，先显示拟议变更和影响，再取得确认。
- 安装/更新依赖、运行联网漏洞审计、访问 CI/cloud/secret manager、调用服务、读取 home directory 或验证真实凭据均需单独授权。
- 不记录、显示或验证原始 secret。使用 `security-audit` 的掩码扫描器；发现疑似泄漏时只报告位置、规则和掩码，并建议人工轮换。

## 工作流

### 1. 定义最小威胁模型

先识别：资产、主体、信任边界、入口、数据流、授权决定和外部副作用。对每个边界用 STRIDE 快速检查：伪造、篡改、抵赖、信息泄露、资源耗尽与越权。

输出不超过任务所需的表：

| 边界/资产 | 可滥用方式 | 控制 | 验证 |
|---|---|---|---|
|  |  |  |  |

将具体 abuse case 写成与 Matt `tdd` 可配合的负向测试，而不是另起测试哲学。

### 2. 实现按风险选择的控制

- **输入与输出**：在系统边界用现有 schema 验证器或清晰边界校验；参数化查询；输出按渲染上下文编码；错误不暴露内部细节。
- **认证与授权**：每个受保护操作都验证身份、资源/tenant/role 权限和服务端状态。cookie 会话的非安全方法加入 CSRF 防护；认证和特权变化后 rotation；实现 logout/revocation、无枚举的 reset 流程，及 OAuth/OIDC 的 state、PKCE、nonce/MFA recovery（适用时）。
- **外部 URL 与 webhook**：限制 scheme/host，拒绝私有和保留网络，禁止或重新验证 redirect，验证签名/时效；保留 DNS rebinding 的 TOCTOU 限制并在高风险路径使用受控连接策略。
- **文件与路径**：验证真实内容而非 MIME/扩展名，使用生成文件名和非公开/不可执行存储，限制尺寸、压缩展开和处理时间。删除/移动/覆盖先 resolve symlink，再检查 allowlisted root、最小深度、拥有权证据和竞态条件。
- **CORS、headers 与限流**：生产缺少 origin allowlist 时 fail closed；仅显式开发模式可以使用本地开发 origin。多实例/无服务器限流使用共享或等价的持久计数，不将进程内限流说成全局保护。
- **供应链与隐私**：识别唯一安装边界、lockfile 和 package manager；不自动运行 forced remediation 或许可生命周期脚本。最小化 PII、指定目的和保留期限，设计导出/删除/备份/缓存路径。
- **LLM 功能**：模型输出、RAG 文档、网页和工具参数都不可信；代码执行 allowlist、schema 验证、tenant 隔离、token/rate/loop 上限和逐项 destructive confirmation。

### 3. 验证和交付

运行项目已有的相关测试和静态检查；若允许并可用，使用掩码 scanner 检查变更。对每个 abuse case 报告 `PASS`、`FAIL`、`UNVERIFIED` 或 `N/A`，并说明命令/环境限制。

交付内容：信任边界、采取的控制、负向测试、未修复风险、需人工完成的 credential/平台步骤。不要自动提交；需要配置/账号操作时转交 Matt `wizard` 或请求明确授权。

## 验收

- [ ] 控制对应真实入口和 abuse case，而不是只添加库名。
- [ ] 安全判断覆盖 server-side authorization，不只依赖客户端。
- [ ] secret、PII 和内部错误没有进入输出或日志。
- [ ] 生产 CORS 和敏感默认值 fail closed。
- [ ] 未经授权没有安装、联网、访问账号或修改高影响策略。
