<!-- 此文件从 content/websockets/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-09-03T10:58:17.966Z -->
<!-- 源文件: content/websockets/pipes.md -->

### 管道

[regular pipes](/pipes) 与 WebSocket 管道之间没有根本区别。唯一的区别是，您应该使用 `WsException` 而不是抛出 `HttpException`。此外，所有管道将仅应用于 `data` 参数（因为验证或转换 `client` 实例是没有用的）。

> info **提示** `WsException` 类从 `@nestjs/websockets` 包中暴露。

#### 绑定管道

以下示例使用手动实例化的方法作用域管道。与基于 HTTP 的应用程序一样，您也可以使用网关作用域管道（即，在网关类前面加上 `@UsePipes()` 装饰器）。

```typescript
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}

```