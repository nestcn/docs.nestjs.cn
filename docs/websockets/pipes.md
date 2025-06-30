### 管道

常规[管道](/pipes)与 WebSocket 管道之间没有本质区别。唯一的区别在于，你应该使用 `WsException` 而不是抛出 `HttpException`。此外，所有管道将仅应用于 `data` 参数（因为验证或转换 `client` 实例没有意义）。

> info **提示** `WsException` 类是从 `@nestjs/websockets` 包中导出的。

#### 绑定管道

以下示例使用了一个手动实例化的方法作用域管道。与基于 HTTP 的应用程序一样，你也可以使用网关作用域管道（即在网关类前添加 `@UsePipes()` 装饰器）。

```typescript
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}

