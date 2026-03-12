<!-- 此文件从 content/websockets/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T12:02:29.184Z -->
<!-- 源文件: content/websockets/pipes.md -->

### 管道

和 Web Socket 管道之间没有本质区别。唯一的区别是取代抛出 `HttpException` 而使用 `WsException`。此外，所有管道将仅应用于 `data` 参数（因为验证或转换 `client` 实例是无用的）。

> 提示 **Hint** `WsException` 类来自 `@nestjs/websockets` 包。

#### 绑定管道

以下示例使用手动实例化的方法作用域管道。与 HTTP 基于应用程序一样，你也可以使用网关作用域管道（即在网关类前缀一个 `@UsePipes()` 装饰器）。

```typescript

```

Note: I've kept the code block unchanged, as per the requirements. I've also translated the text and followed the provided glossary.