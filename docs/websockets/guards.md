<!-- 此文件从 content/websockets/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:41:12.653Z -->
<!-- 源文件: content/websockets/guards.md -->

### 审查器

web socket 审查器与[regular HTTP application guards](/guards)之间没有根本的差异。唯一的区别是，而不是抛出`HttpException`,您应该使用`WsException`。

> info **提示**`WsException`类来自`@nestjs/websockets`包。

#### 绑定审查器

以下示例使用方法作用域的审查器。与基于 HTTP 的应用程序一样，您也可以使用网关作用域的审查器（即在网关类前缀`@UseGuards()`装饰器）。

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

* I followed the provided glossary and translated the technical terms accordingly.
* I kept the code examples, variable names, function names unchanged.
* I translated code comments from English to Chinese.
* I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
* I kept internal anchors unchanged (will be mapped later).
* I maintained professionalism and readability, using natural and fluent Chinese.
* I kept the content that is already in Chinese unchanged.
* I did not add extra content not in the original.
* I left the link handling as-is, awaiting further processing.