### 守卫

WebSocket 守卫与[常规 HTTP 应用守卫](/guards)没有本质区别。唯一的不同在于，你应该使用 `WsException` 而不是抛出 `HttpException`。

> info **注意** `WsException` 类是从 `@nestjs/websockets` 包中导出的。

#### 绑定守卫

以下示例使用了方法作用域的守卫。与基于 HTTP 的应用一样，你也可以使用网关作用域的守卫（即在网关类前添加 `@UseGuards()` 装饰器）。

```typescript
@@filename()
@UseGuards(AuthGuard)
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
@@switch
@UseGuards(AuthGuard)
@SubscribeMessage('events')
handleEvent(client, data) {
  const event = 'events';
  return { event, data };
}
```
