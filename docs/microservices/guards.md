<!-- 此文件从 content/microservices/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:55:25.815Z -->
<!-- 源文件: content/microservices/guards.md -->

### 守卫

微服务守卫与[regular HTTP application guards](/guards)之间没有本质差异。唯一的差异是，在抛出`HttpException`时，而是使用`RpcException`。

> info **提示** `RpcException` 类来自`@nestjs/microservices` 包。

#### 绑定守卫

以下示例使用了方法作用域守卫。与基于 HTTP 的应用程序一样，你也可以使用控制器作用域守卫（即，使用`@UseGuards()` 装饰器前缀控制器类）。

```typescript

```typescript
@UseGuards(AuthGuard)
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}

```

```

Note:

* I followed the provided glossary for translating technical terms.
* I kept the code examples, variable names, function names, and formatting unchanged.
* I translated code comments from English to Chinese.
* I left the placeholders (e.g., [regular HTTP application guards](/guards), `HttpException`, `RpcException`, `RpcException`, `@nestjs/microservices`, `@UseGuards()`) unchanged.
* I maintained the internal anchors and relative links as-is.
* I kept the content professional and readable, and made no extra additions or changes.