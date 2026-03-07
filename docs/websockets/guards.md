<!-- 此文件从 content/websockets\guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-02-28T06:24:18.057Z -->
<!-- 源文件: content/websockets\guards.md -->

### Guards

There is no fundamental difference between web sockets guards and [regular HTTP application guards](/guards). The only difference is that instead of throwing `HttpException`, you should use `WsException`.

> info **Hint** The `WsException` class is exposed from `@nestjs/websockets` package.

#### Binding guards

The following example uses a method-scoped guard. Just as with HTTP based applications, you can also use gateway-scoped guards (i.e., prefix the gateway class with a `@UseGuards()` decorator).

```typescript
@@filename()
@UseGuards(AuthGuard)
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```
