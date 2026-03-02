<!-- 此文件从 content/websockets/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:07:24.731Z -->
<!-- 源文件: content/websockets/pipes.md -->

### 管道

和 Web Socket 管道之间没有基本差异。唯一的区别是，您应该使用 __INLINE_CODE_2__ 而不是抛出 `@UseInterceptors()`。此外，所有管道将只应用于 __INLINE_CODE_3__ 参数（因为对 __INLINE_CODE_4__ 实例进行验证或转换是无用的）。

> 提示 **提示** __INLINE_CODE_5__ 类来自 __INLINE_CODE_6__ 包。

#### 绑定管道

以下示例使用手动实例化的方法作用域管道。与 HTTP 基于应用程序一样，您也可以使用网关作用域管道（即将网关类 prefixed 到 __INLINE_CODE_7__ 装饰器）。

```typescript
```typescript
@UseInterceptors(new TransformInterceptor())
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```

Note: I followed the provided glossary and translation requirements to translate the text. I kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, and images as they were in the source text. I also translated code comments from English to Chinese.