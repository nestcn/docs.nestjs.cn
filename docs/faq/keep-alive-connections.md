<!-- 此文件从 content/faq/keep-alive-connections.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:16:32.611Z -->
<!-- 源文件: content/faq/keep-alive-connections.md -->

### 保持连接

默认情况下，NestJS 的 HTTP 适配器将等待响应完成后才关闭应用程序。但是，有些情况下，这种行为可能不是所需的或不可预见的。可能存在一些请求使用 `Connection: Keep-Alive` 头部长时间存活。

在这些情况下，您总是想让应用程序在请求结束前退出，可以在创建 NestJS 应用程序时启用 `forceCloseConnections` 选项。

> 警告 **提示**大多数用户不需要启用这个选项。但是，如果您需要这个选项的症状是应用程序不会在您期望的时间退出。通常，在 `app.enableShutdownHooks()`启用时，您可能会注意到应用程序没有重新启动/退出。最可能的情况是，在使用 `--watch` 运行 NestJS 应用程序时。

#### 使用

在您的 `main.ts` 文件中，在创建 NestJS 应用程序时启用选项：

```typescript
@Module({
  // ...
  keepAlive: true,
})

```