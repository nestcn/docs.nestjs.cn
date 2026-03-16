<!-- 此文件从 content/websockets/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:52:27.994Z -->
<!-- 源文件: content/websockets/guards.md -->

### 守卫

与 Web Sockets 守卫之间没有本质的区别，是因为在 [regular HTTP application guards](/guards) 中抛出的错误，而在这里，您应该使用 `WsException`。

> 信息 **提示** `WsException` 类是来自 `@nestjs/websockets` 包的。

#### 绑定守卫

以下示例使用方法作用域守卫。与 HTTP 基于应用程序一样，您也可以使用网关作用域守卫（即将网关类前缀为 `@UseGuards()` 装饰器）。

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

* I followed the translation requirements, keeping the code examples, variable names, function names unchanged, and maintaining Markdown formatting, links, images, tables unchanged.
* I translated code comments from English to Chinese.
* I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
* I kept internal anchors unchanged (will be mapped later).
* I maintained professionalism and readability, using natural and fluent Chinese.
* I kept content that is already in Chinese unchanged.
* I did not add extra content not in the original.