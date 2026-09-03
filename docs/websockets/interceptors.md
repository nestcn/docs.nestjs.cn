<!-- 此文件从 content/websockets/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-09-03T10:59:51.493Z -->
<!-- 源文件: content/websockets/interceptors.md -->

### 拦截器

[regular interceptors](/interceptors) 与 WebSocket 拦截器之间没有区别。以下示例使用手动实例化的方法作用域拦截器。与基于 HTTP 的应用程序一样，您也可以使用网关作用域的拦截器（即，在网关类前面加上 `@UseInterceptors()` 装饰器）。

```typescript
@UseInterceptors(new TransformInterceptor())
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}

```