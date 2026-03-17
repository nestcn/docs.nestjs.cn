<!-- 此文件从 content/microservices/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:10:08.915Z -->
<!-- 源文件: content/microservices/pipes.md -->

### 管道

与微服务管道没有本质的区别。唯一的区别是，在抛出 `HttpException` 时，您应该使用 `RpcException`。

> 提示 **提示** `RpcException` 类是来自 `@nestjs/microservices` 包的。

#### 绑定管道

以下示例使用手动实例化的方法作用域管道。与基于 HTTP 的应用程序一样，您也可以使用控制器作用域管道（即将控制器类前缀为 `@UsePipes()` 装饰器）。

```typescript

```typescript
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new RpcException(errors) }))
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}

```

```

Note: I followed the translation requirements and guidelines, keeping the code examples, variable names, function names unchanged, and maintaining Markdown formatting, links, and images unchanged. I translated code comments from English to Chinese and did not explain or modify placeholders like __INLINE_CODE_N__.