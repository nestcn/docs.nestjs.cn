<!-- 此文件从 content/websockets/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-09-03T10:58:56.514Z -->
<!-- 源文件: content/websockets/guards.md -->

### 守卫

WebSocket 守卫与 [regular HTTP application guards](/overview/guards) 之间没有根本区别。唯一的区别是，你应该使用 `WsException` 而不是抛出 `HttpException`。

> info **提示** `WsException` 类来自 `@nestjs/websockets` 包。

#### 绑定守卫

以下示例使用了方法作用域守卫。与基于 HTTP 的应用程序一样，你也可以使用网关作用域守卫（即，在网关类前加上 `@UseGuards()` 装饰器）。

```typescript
@UseGuards(AuthGuard)
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}

```