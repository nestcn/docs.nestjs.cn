<!-- 此文件从 content/websockets\interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-02-28T06:24:18.056Z -->
<!-- 源文件: content/websockets\interceptors.md -->

### Interceptors

There is no difference between [regular interceptors](/interceptors) and web sockets interceptors. The following example uses a manually instantiated method-scoped interceptor. Just as with HTTP based applications, you can also use gateway-scoped interceptors (i.e., prefix the gateway class with a `@UseInterceptors()` decorator).

```typescript
@@filename()
@UseInterceptors(new TransformInterceptor())
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```
