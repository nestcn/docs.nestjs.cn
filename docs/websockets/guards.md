<!-- 此文件从 content/websockets/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:18:32.935Z -->
<!-- 源文件: content/websockets/guards.md -->

### 守卫

与 Web Sockets 守卫之间没有本质的区别,[regular HTTP application guards](/guards) 是唯一的区别是，在抛出 `HttpException` 时，您应该使用 `WsException`。

> 信息 **提示** `WsException` 类来自 `@nestjs/websockets` 包。

#### 绑定守卫

以下示例使用的是方法作用域守卫。与基于 HTTP 的应用程序一样，您也可以使用网关作用域守卫（即将网关类prefixed 一个 `@UseGuards()` 装饰器）。

```typescript

```typescript
@UseGuards(AuthGuard)
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}

```

```