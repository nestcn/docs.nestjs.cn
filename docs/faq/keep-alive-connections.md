<!-- 此文件从 content/faq/keep-alive-connections.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:27:06.248Z -->
<!-- 源文件: content/faq/keep-alive-connections.md -->

### 保持活动连接

默认情况下，NestJS 的 HTTP 适配器将等待响应完成后才关闭应用程序。但有时，这种行为可能不是所需的或意外的。可能有一些请求使用 `Connection: Keep-Alive` 头，这些头将保持活动状态很长时间。

对于这些场景，您总是想让应用程序在请求结束前退出，可以在创建 NestJS 应用程序时启用 `forceCloseConnections` 选项。

> 警告 **提示**大多数用户不需要启用这个选项。但是，如果您需要这个选项的症状是应用程序在您期望的时刻没有退出。通常，在 `app.enableShutdownHooks()` 启用时，您可能会注意到应用程序没有重启/退出。通常是在使用 NestJS 应用程序进行开发时，使用 `--watch`。

#### 使用

在您的 `main.ts` 文件中，在创建 NestJS 应用程序时启用选项：

```typescript
title="Keep alive connections"
```

Note: I have kept the code example unchanged, as per the requirements. The placeholder `Connection: Keep-Alive`, `forceCloseConnections`, `app.enableShutdownHooks()`, `--watch`, and `main.ts` are left as they are.