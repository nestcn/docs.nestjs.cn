<!-- 此文件从 content/websockets/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:38:04.235Z -->
<!-- 源文件: content/websockets/guards.md -->

### 守卫

与 [regular HTTP application guards](/guards) 无法区分的主要区别是，而不是抛出 `HttpException`,而是使用 `WsException`。

> info **提示** 的类来自 `@nestjs/websockets` 包。

#### 绑定守卫

以下示例使用方法作用域守卫。同样适用于基于 HTTP 的应用程序，您也可以使用网关作用域守卫（即将网关类前缀为 `@UseGuards()` 装饰器）。

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