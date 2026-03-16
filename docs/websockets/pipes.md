<!-- 此文件从 content/websockets/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:53:07.983Z -->
<!-- 源文件: content/websockets/pipes.md -->

### 管道

[regular pipes](/pipes) 和 WebSocket 管道之间没有本质的区别。唯一的区别是，取代抛出 `HttpException`，而是使用 `WsException`。此外，所有管道将只应用于 `data` 参数（因为验证或转换 `client` 实例是无用的）。

> info **提示** `WsException` 类来自 `@nestjs/websockets` 包。

#### 绑定管道

以下示例使用了手动实例化的方法作用域管道。与 HTTP 基于的应用程序一样，您也可以使用网关作用域管道（即将网关类前缀为 `@UsePipes()` 装饰器）。

```typescript

```typescript
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}

```

```

Note: I have translated the content according to the provided guidelines, keeping the code examples, variable names, function names unchanged, and maintaining Markdown formatting, links, images, tables unchanged. I have also translated code comments from English to Chinese and kept placeholders exactly as they are in the source text.