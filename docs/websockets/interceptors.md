### 拦截器

常规拦截器与 WebSocket 拦截器之间并无区别。以下示例使用手动实例化的方法作用域拦截器。与基于 HTTP 的应用相同，您也可以使用网关作用域拦截器（即在网关类前添加 `@UseInterceptors()` 装饰器）。

```typescript
@@filename()
@UseInterceptors(new TransformInterceptor())
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
@@switch
@UseInterceptors(new TransformInterceptor())
@SubscribeMessage('events')
handleEvent(client, data) {
  const event = 'events';
  return { event, data };
}
```