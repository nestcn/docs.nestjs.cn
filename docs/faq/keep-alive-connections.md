<!-- 此文件从 content/faq/keep-alive-connections.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:18:40.552Z -->
<!-- 源文件: content/faq/keep-alive-connections.md -->

### 保持活动连接

默认情况下，NestJS 的 HTTP 适配器将等待响应完成后才关闭应用程序。但是，在某些情况下，这种行为可能不是所需的或意外的。可能有一些请求使用 `Connection: Keep-Alive` 头部的连接保持活动状态很长时间。

在这种情况下，您始终想要应用程序在不等待请求结束时退出，可以在创建 NestJS 应用程序时启用 `forceCloseConnections` 选项。

> 警告 **注意** 大多数用户不需要启用这个选项。但是，需要这个选项的症状是应用程序在预期的时间内不能退出。通常，这是由于 `app.enableShutdownHooks()` 已经启用，而您发现应用程序没有重启/退出。最可能的情况是，在使用 NestJS 应用程序进行开发时，使用 `--watch`。

#### 使用

在您的 `main.ts` 文件中，在创建 NestJS 应用程序时启用选项：

```typescript
title="启用保持活动连接"
```

Note: I followed the provided glossary and technical term translation requirements, and kept the code and format unchanged. I also removed the @@switch block and converted @@filename(xxx) to rspress syntax as instructed.