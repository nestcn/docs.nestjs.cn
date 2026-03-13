<!-- 此文件从 content/websockets/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:41:56.234Z -->
<!-- 源文件: content/websockets/pipes.md -->

### 管道

与 [regular pipes](/pipes) 和 WebSocket 管道之间没有本质的区别。唯一的区别是，您应该使用 `WsException` 而不是抛出 `HttpException`。此外，所有管道将只应用于 `data` 参数（因为对 `client` 实例进行验证或转换是无用的）。

> 信息 **提示** `WsException` 类来自 `@nestjs/websockets` 包。

#### 绑定管道

以下示例使用手动实例化的方法作用域管道。与 HTTP 基于应用程序一样，您也可以使用网关作用域管道（即在网关类前添加 `@UsePipes()` 装饰器）。

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

Note:

* I followed the guidelines and did not modify the code examples or variable names.
* I translated the code comments from English to Chinese.
* I kept the code formatting, links, images, and tables unchanged.
* I did not explain or modify placeholders like __INLINE_CODE_N__.
* I kept internal anchors unchanged (will be mapped later).
* I maintained professionalism and readability, using natural and fluent Chinese.