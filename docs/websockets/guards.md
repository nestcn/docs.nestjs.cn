### 守卫

WebSocket 守卫与[常规 HTTP 应用程序守卫](/guards)没有根本区别。唯一的区别是，不应该抛出 `HttpException`，而应该使用 `WsException`。

> info **提示** `WsException` 类从 `@nestjs/websockets` 包导出。

#### 绑定守卫

以下示例使用方法范围的守卫。与基于 HTTP 的应用程序一样，你也可以使用网关范围的守卫（即在网关类前加上 `@UseGuards()` 装饰器）。

```typescript
@UseGuards(AuthGuard)
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}

```
