# matt-plus

**面向 Matt Pocock Skills 的自包含 Claude Code 扩展：生产设计、安全、发布与文档维护。**

本插件实际分发本地 `SKILL.md`、模板、检查表和脚本；运行时不需要安装完整的 `agent-skills` 或 `gstack`。Matt 仍负责需求澄清、规格、TDD、实现、诊断、领域建模与通用代码审查；matt-plus 只补这四条专项能力链。

## 技能

| 领域 | 入口 | 作用 |
| --- | --- | --- |
| 设计 | `/matt-plus:design-consultation` | 建立或更新有依据的设计方向、token、组件原则、`DESIGN.md` 与本地预览。 |
| 设计 | `/matt-plus:frontend-ui-engineering` | 实现可上线的 UI：真实状态、响应式、键盘和焦点可访问性。 |
| 设计 | `/matt-plus:web-qa` | 使用 Playwright 对已授权页面做功能与回归 QA，交付可复现证据与逐项授权修复建议。 |
| 设计 | `/matt-plus:design-review` | 审计运行中页面的视觉与交互质量；仅在获授权时最小修复并复测。 |
| 安全 | `/matt-plus:security-and-hardening` | 对明确 feature、端点、集成或 finding 做威胁建模、安全实现与负向验证。 |
| 安全 | `/matt-plus:security-audit` | 对指定仓库、diff 或领域进行默认本地、只读、非联网的安全态势审计。 |
| 发布 | `/matt-plus:shipping-and-launch` | 汇总发布就绪证据，制定 flag、灰度、监测与恢复策略。 |
| 发布 | `/matt-plus:setup-deploy` | 发现并经确认记录项目的 deploy profile；不创建基础设施。 |
| 发布 | `/matt-plus:land-and-deploy` | 先生成只读 dry-run；逐项授权后才可编排 merge、deploy、验证或 revert。 |
| 文档 | `/matt-plus:document-generate` | 通过代码考古与 Diataxis 生成或重构指定项目/用户文档。 |
| 文档 | `/matt-plus:document-update` | 依据确认的 base diff 发现并保守修正现有文档的事实漂移。 |

完整能力边界、来源适配和验收状态见 [integration-plan.md](integration-plan.md)。

## 使用本地插件

在目标项目中以 matt-plus 的绝对路径启动 Claude Code：

```bash
claude --plugin-dir /absolute/path/to/matt-plus
```

也可以通过本地 marketplace 安装：

```text
/plugin marketplace add /absolute/path/to/matt-plus
/plugin install matt-plus@matt-plus
```

这是使用说明，不会由本仓库的开发流程自动安装或更新插件。避免同时以临时目录和 marketplace 重复加载同一插件。

## 权限与验证边界

- 缺少工具、凭据、URL、环境、权限或实际执行信号时，技能必须报告 `UNVERIFIED`，不能将推测写成通过。
- 不会自动安装依赖、读取 home directory/全局设置、导入浏览器 cookie、访问外部账户、提交、推送、创建或编辑 PR。
- `security-audit` 默认不联网、不写报告、不做主动请求；网络扫描、全局扫描、保存报告或任何服务测试都需要单独授权。
- `land-and-deploy` 的 merge、staging/production deploy、canary、revert 和生产访问均须针对当前 repo、revision、环境、账户、影响与恢复方式重新确认。调用技能本身不是一揽子授权。
- `web-qa` 优先使用已安装的全局 `playwright-cli`，不可用时才使用项目已有的 Playwright runner；不使用浏览器 MCP、不会自动安装依赖或下载浏览器。若需要执行 `npm install -g @playwright/cli@latest`，会先单独确认全局机器改动。
- 浏览器检查只使用获授权的 URL、测试账户和测试数据；付款、删除、发消息等真实业务写入必须另行明确授权。QA 先报告 finding，每个源码或测试修复均须逐项明确批准并在同条件下复测。

本插件没有声明或验证任何真实浏览器、云平台、CI、生产系统或部署行为；这些结果只能在已授权的隔离环境中取得。

## 验证与开发

无需安装 npm 依赖。Node.js 18+ 用于确定性包检查和脱敏扫描器测试；Claude Code CLI 用于官方插件格式检查：

```bash
node --test tests/package.test.mjs tests/masked-secret-scan.test.mjs
claude plugin validate . --strict
```

[evals/evals.json](evals/evals.json) 为每个技能提供正常触发与权限/缺失条件行为用例。结构测试证明目录、链接、许可、来源和安全约束的闭包，不证明模型产物质量或外部流程已经执行；后者仍需按 [integration-plan.md](integration-plan.md) 中的 with-skill/baseline 评估完成。

## 来源与维护

- [集成规划与当前验证状态](integration-plan.md)
- [第三方来源、快照与适配说明](THIRD_PARTY_NOTICES.md)
- [MIT 许可与版权声明](LICENSE)

matt-plus 维护自己的适配版本，不会自动同步上游。上游更新只在复核许可、资源闭包、权限模型和行为验收后选择性迁入。
