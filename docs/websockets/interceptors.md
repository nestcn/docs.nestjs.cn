<!-- 此文件从 content/websockets/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:53:14.117Z -->
<!-- 源文件: content/websockets/interceptors.md -->

### 拦截器

与[regular interceptors](/interceptors)和Web Socket 拦截器没有区别。以下示例使用了手动实例化的方法作用域拦截器。与基于 HTTP 的应用程序一样，您也可以使用网关作用域拦截器（即在网关类前添加`@UseInterceptors()`装饰器）。

```typescript
@UseInterceptors(new TransformInterceptor())
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}

```