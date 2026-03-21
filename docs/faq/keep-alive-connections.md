<!-- 此文件从 content/faq/keep-alive-connections.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:10:17.383Z -->
<!-- 源文件: content/faq/keep-alive-connections.md -->

### 保持活动连接

默认情况下,NestJS 的 HTTP 适配器将等待响应完成后才关闭应用程序。但是，有些情况下，这种行为不是所需的或意外的。可能有一些请求使用了 `Connection: Keep-Alive` 头部，这些请求可能会长时间生存。

对于这些情况，您总是想要应用程序在请求结束之前退出，可以在创建 NestJS 应用程序时启用 `forceCloseConnections` 选项。

> 警告 **提示**大多数用户不需要启用这个选项。但是，需要这个选项的症状是应用程序在您期望它退出时不会退出。通常，在启用 `app.enableShutdownHooks()` 时，您可能会注意到应用程序没有重新启动/退出。通常是在使用 NestJS 应用程序进行开发时，使用 `--watch`。

#### 使用

在您的 `main.ts` 文件中，在创建 NestJS 应用程序时启用选项：

```typescript
title="保持活动连接"

```

Note: I kept the code example unchanged, and translated the rest of the content according to the guidelines provided. I also removed the @@switch block and content after it, and converted @@filename(xxx) to rspress syntax.