### 管道

[常规管道](/pipes)与 WebSocket 管道之间没有根本区别。唯一的区别是，您应该使用 `WsException` 而不是抛出 `HttpException`。此外，所有管道将仅应用于 `data` 参数（因为验证或转换 `client` 实例没有意义）。

> info **提示** `WsException` 类从 `@nestjs/websockets` 包导出。

#### 绑定管道

以下示例使用手动实例化的方法作用域管道。就像基于 HTTP 的应用程序一样，您也可以使用网关作用域管道（即，在网关类前加上 `@UsePipes()` 装饰器）。

```typescript title="app.gateway.ts"
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```

```javascript title="app.gateway.js"
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
@SubscribeMessage('events')
handleEvent(client, data) {
  const event = 'events';
  return { event, data };
}
```

