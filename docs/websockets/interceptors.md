<!-- 此文件从 content/websockets/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:24:38.543Z -->
<!-- 源文件: content/websockets/interceptors.md -->

### 拦截器

与 WebSocket 拦截器没有什么不同。下面是一个手动实例化的方法作用域拦截器示例。与基于 HTTP 的应用程序一样，您还可以使用网关作用域拦截器（即将网关类标记为 `@UseInterceptors()` 装饰器）。

```typescript
@UseInterceptors(new TransformInterceptor())
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}

```