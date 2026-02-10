### 守卫

WebSocket 守卫与[常规 HTTP 应用守卫](/overview/guards)之间没有根本区别。唯一的差异是应该使用 `WsException` 而不是抛出 `HttpException`。

:::info 提示
`WsException` 类从 `@nestjs/websockets` 包中导出。
:::

#### 绑定守卫

以下示例使用了方法作用域守卫。与基于 HTTP 的应用程序一样，您也可以使用网关作用域守卫（即在网关类前添加 `@UseGuards()` 装饰器）。

```typescript
@UseGuards(AuthGuard)
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```
