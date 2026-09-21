# 第三方来源与适配说明

matt-plus 收录以下 MIT 许可内容的适配版本，不是 `agent-skills` 或 `gstack` 的官方发行版。完整 MIT 文字及原作者版权声明保留在 [LICENSE](LICENSE)。所有技能正文、模板、检查表和脚本均随插件分发，运行时不读取来源仓库或其全局目录。

| 来源 | 作者与许可证 | 本次读取快照 |
| --- | --- | --- |
| [wenlong66/agent-skills](https://github.com/wenlong66/agent-skills) source snapshot | Copyright (c) 2025 Addy Osmani，MIT | `bcc8e883faf135c5b48a3c25bcbb5b610123405b` |
| [garrytan/gstack](https://github.com/garrytan/gstack) | Copyright (c) 2026 Garry Tan，MIT | `e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09` |

## Addy Osmani / agent-skills

### frontend-ui-engineering

- 上游：[skills/frontend-ui-engineering/SKILL.md](https://github.com/wenlong66/agent-skills/blob/bcc8e883faf135c5b48a3c25bcbb5b610123405b/skills/frontend-ui-engineering/SKILL.md)。
- 本地：[技能正文](skills/frontend-ui-engineering/SKILL.md)、[无障碍检查表](references/accessibility-checklist.md)。
- 保留生产 UI、状态、响应式、语义、键盘/焦点和可访问性验收。
- 适配为技术栈无关流程；React/Tailwind 仅作示例，不要求安装；不把焦点初始定位误称为完整 dialog focus trap。

### security-and-hardening

- 上游：[skills/security-and-hardening/SKILL.md](https://github.com/wenlong66/agent-skills/blob/bcc8e883faf135c5b48a3c25bcbb5b610123405b/skills/security-and-hardening/SKILL.md)。
- 本地：[技能正文](skills/security-and-hardening/SKILL.md)、[安全检查表](references/security-checklist.md)。
- 保留 threat model、信任边界、认证授权、SSRF、供应链、隐私和 LLM 安全。
- 补充 cookie-auth CSRF、session rotation/revocation、OAuth/OIDC 防护、tenant isolation、文件与破坏性路径安全；生产 CORS 配置缺失时 fail closed；不输出原始 secret。

### shipping-and-launch

- 上游：[skills/shipping-and-launch/SKILL.md](https://github.com/wenlong66/agent-skills/blob/bcc8e883faf135c5b48a3c25bcbb5b610123405b/skills/shipping-and-launch/SKILL.md)。
- 本地：[技能正文](skills/shipping-and-launch/SKILL.md)、[完成定义](references/definition-of-done.md)、[性能检查表](references/performance-checklist.md)、[可观测性检查表](references/observability-checklist.md)，以及上述安全与无障碍检查表。
- 保留证据化 readiness、feature flag、阶段性 rollout、监测和 recovery strategy。
- 移除自动执行语义；数值只作为项目可确认的 baseline，不作为通用保证；不把数据库恢复简化成虚构的通用命令。

## Garry Tan / gstack

### design-consultation

- 上游：[design-consultation/SKILL.md.tmpl](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/design-consultation/SKILL.md.tmpl) 及 proposal/preview section。
- 本地：[技能正文](skills/design-consultation/SKILL.md)、[本地预览骨架](skills/design-consultation/assets/design-preview.html)。
- 保留产品理解、SAFE/RISK 取舍、设计系统提案、`DESIGN.md` 和预览路径。
- 用无依赖本地 HTML fallback 替代设计生成器与全局运行时；外部研究和修改项目规则/生产 CSS 均保留确认门。

### design-review

- 上游：[design-review/SKILL.md.tmpl](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/design-review/SKILL.md.tmpl)。
- 本地：[技能正文](skills/design-review/SKILL.md)、[报告模板](skills/design-review/assets/report-template.md)。
- 保留页面/viewport/state 覆盖、finding 结构、最小修复和前后复测。
- 删除 clean-tree、stash、自动 commit/revert、固定修复配额、全局报告状态及浏览器二进制依赖；浏览器缺失时只给静态结论并标记 `UNVERIFIED`。

### web-qa

- 上游：[qa/SKILL.md.tmpl](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/qa/SKILL.md.tmpl)、[generateQAMethodology](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/scripts/resolvers/utility.ts)、[issue taxonomy](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/qa/references/issue-taxonomy.md) 和 [QA report template](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/qa/templates/qa-report-template.md)。
- 本地：[技能正文](skills/web-qa/SKILL.md)、[报告模板](skills/web-qa/assets/report-template.md)。
- 保留 diff-aware 范围选择、分层覆盖、可复现证据、finding 分类、重试、baseline 限制、修复后复测与发布交接结构。
- 改为优先使用本机已验证的 `playwright-cli`，无可用 CLI 时才使用项目已有 runner；移除全局 browser/runtime/state、cookie 导入、依赖/bootstrap、任意 server 启动、固定报告目录，以及自动修复、stash、commit、push、PR、TODO 或 revert。每项修复都要单独批准。

### security-audit

- 上游：[cso/SKILL.md.tmpl](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/cso/SKILL.md.tmpl) 及 audit phases section。
- 本地：[技能正文](skills/security-audit/SKILL.md)、[审计阶段](skills/security-audit/references/audit-phases.md)、[报告 schema](skills/security-audit/references/report-schema.md)、[脱敏扫描器](skills/security-audit/scripts/masked-secret-scan.mjs)。
- 保留攻击面、供应链、CI/CD/IaC、集成、AI/skill supply chain、OWASP、STRIDE 和置信度报告。
- 默认限定为选定仓库的本地只读、非联网审计，不自动保存报告或主动探测；区分 verified vulnerabilities、control gaps、unverified candidates 与 out-of-scope。扫描器只输出规则、文件、行号和掩码预览。

### setup-deploy

- 上游：[setup-deploy/SKILL.md.tmpl](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/setup-deploy/SKILL.md.tmpl)。
- 本地：[技能正文](skills/setup-deploy/SKILL.md)、[deploy profile 模板](skills/setup-deploy/references/deploy-profile-template.md)。
- 保留平台/项目信号发现、URL 与 health/status 确认、可审查 deploy profile。
- 明确这是 discovery，不会 provision 云资源、DNS、TLS 或 secrets；访问 CLI 登录态、环境 URL 或自定义命令需要单独授权。

### land-and-deploy

- 上游：[land-and-deploy/SKILL.md.tmpl](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/land-and-deploy/SKILL.md.tmpl)。
- 本地：[技能正文](skills/land-and-deploy/SKILL.md)、[deploy report 模板](skills/land-and-deploy/references/deploy-report-template.md)。
- 保留 dry-run、readiness、CI/merge queue、staging-first、health/canary、failure/revert 和报告流程。
- 去除全局状态、固定版本/变更日志约定与自动分支删除；merge、每个环境 deploy、canary 和 revert 分别需要动作级确认。

### document-generate

- 上游：[document-generate/SKILL.md.tmpl](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/document-generate/SKILL.md.tmpl)。
- 本地：[技能正文](skills/document-generate/SKILL.md)。
- 保留代码考古、概念图、Diataxis 分区、交叉链接和准确性验证。
- 限定到用户指定目标；修改导航、agent 指令或超过五个新建/大幅重构文档时需先预览并确认；不自动提交、推送或编辑 PR。

### document-update

- 上游：[document-release/SKILL.md.tmpl](https://github.com/wenlong66/gstack/blob/e7b2ef21e20e6f359ccdc1cf0394dacbe339ad09/document-release/SKILL.md.tmpl) 及 release body section。
- 本地：[技能正文](skills/document-update/SKILL.md)、[文档健康模板](skills/document-update/references/document-health-template.md)。
- 保留确认 base、diff/public-surface coverage map、递归文档发现、factual drift、diagram drift、CHANGELOG 保护与文档债务报告。
- 改名以避免暗示 release 执行；不能可靠确认 base 时停止询问；大范围缺文档交给 document-generate，叙事性或高风险改动需要确认。

## 未迁入的宿主行为

所有 gstack 适配均有意未包含模板占位符、全局目录/状态、遥测、自动更新、外部模型审查、专用二进制、cookie 导入，以及未经当前动作授权的提交、推送、PR 修改、merge、deploy、revert 或生产业务写入。这些是宿主耦合或高权限行为，不属于本插件的默认运行时。

## 后续维护

插件不自动同步上游。升级时应复核相应上游源文件、许可与快照，只迁入当前仍有价值且能保持资源闭包、授权边界与行为验收的变更；随后重新运行包检查、脚本测试和行为评估。来源链接只用于追溯，不是执行依赖。
