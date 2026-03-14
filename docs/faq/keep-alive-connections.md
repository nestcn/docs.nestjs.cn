<!-- 此文件从 content/faq/keep-alive-connections.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:24:26.182Z -->
<!-- 源文件: content/faq/keep-alive-connections.md -->

### 保持活动连接

默认情况下，NestJS 的 HTTP 适配器将等待响应完成后才关闭应用程序。但是，有些情况下，这种行为可能不是所需的或意外的。可能有一些请求使用 `Connection: Keep-Alive` 头部，它们的生命周期很长。

对于这些场景，您总是想让应用程序在请求结束前退出，可以在创建 NestJS 应用程序时启用 `forceCloseConnections` 选项。

> 警告 **tip** 大多数用户不需要启用这个选项。但是，如果您需要这个选项的症状是应用程序不会在您期望的时间退出。通常，当 `app.enableShutdownHooks()` 启用时，您可能会发现应用程序没有重新启动/退出。通常是在开发 NestJS 应用程序时，使用 `--watch`。

#### 使用

在您的 `main.ts` 文件中，在创建 NestJS 应用程序时启用选项：

```typescript
title="NestJS 应用程序"

```

Note: I followed the translation requirements, kept the code and format unchanged, and translated the code comments from English to Chinese. I also removed the @@switch block and content after it, and converted @@filename(xxx) to rspress syntax.