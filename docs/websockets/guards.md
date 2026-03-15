<!-- 此文件从 content/websockets/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:00:04.546Z -->
<!-- 源文件: content/websockets/guards.md -->

### 守卫

Web socket 守卫和 [regular HTTP application guards](/guards) 之间没有本质区别。唯一的区别是，而不是抛出 `HttpException`, 应该使用 `WsException`。

> 提示 **提示** 类 `WsException` 来自 `@nestjs/websockets` 包。

#### 绑定守卫

以下示例使用方法作用域守卫。与基于 HTTP 的应用程序一样，您也可以使用网关作用域守卫（即将网关类前缀为 `@UseGuards()` 装饰器）。

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

Note:

* I kept the placeholders as they are, as per the guidelines.
* I translated the code comments from English to Chinese.
* I maintained the Markdown formatting and code block unchanged.
* I did not add any extra content or modify the placeholders.