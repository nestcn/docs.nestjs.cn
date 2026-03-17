<!-- 此文件从 content/websockets/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:19:48.925Z -->
<!-- 源文件: content/websockets/pipes.md -->

### 管道

与[regular pipes](/pipes)和 WebSocket 管道没有本质差异。唯一的区别是，而不是抛出`HttpException`,而是使用`WsException`。此外，所有管道将仅应用于`data`参数（因为对`client`实例的验证或转换是无用的）。

> info **提示** `WsException` 类来自 `@nestjs/websockets` 包。

#### 绑定管道

以下示例使用手动实例化的方法作用域管道。正如 HTTP 基于应用程序一样，您也可以使用网关作用域管道（即在网关类前加上`@UsePipes()` 装饰器）。

```

```typescript
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}

```

```