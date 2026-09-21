# 安全审计阶段

## 1. 架构与攻击面

识别技术栈、入口、认证/授权、数据流、外部集成、后台任务、文件处理、CI、容器、IaC 和部署边界。stack detection 只调整优先级，不排除嵌套组件或其他语言。

## 2. Secrets 与历史

检查工作树、受控 diff 和获授权的提交范围。所有文本先经本 skill 的 masked scanner；任何原始匹配、历史 blob 或 credential 都不得出现在输出。疑似泄漏的处理顺序是限制暴露、人工 revoke/rotate、评估历史和审计 provider—not secret validation。

## 3. Supply chain 与 CI/IaC

确认 lockfile、安装根、依赖脚本、provenance、workflow trigger、token 权限、untrusted PR code、container 用户、secret exposure 和 deploy boundary。没有可达性或上下文时写 control gap，不直接给最高 severity。

## 4. 应用与 AI 边界

追踪输入到数据库、shell、HTML、文件系统、URL fetch、权限决定和模型/工具调用。验证签名、session、tenant、schema、encoding、rate/resource bound 和允许列表。主动请求只在单独授权的测试环境进行。

## 5. 可信度与报告

每项 finding 都需要具体攻击路径。记录替代防御和无法验证的原因。用 evidence 而不是“默认安全”的框架假设定级；一个 verified pattern 触发全仓 variant search。将 verified vulnerability、unverified candidate、control gap 和 out-of-scope 分开。
