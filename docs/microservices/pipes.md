<!-- 此文件从 content/microservices/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:15:10.427Z -->
<!-- 源文件: content/microservices/pipes.md -->

### 管道

与微服务管道之间没有基本区别。唯一的区别是，您应该使用 `RpcException` 而不是抛出 `HttpException`。

> 信息 **提示** `RpcException` 类来自 `@nestjs/microservices` 包。

#### 绑定管道

以下示例使用手动实例化的方法作用域管道。与基于 HTTP 的应用程序一样，您也可以使用控制器作用域管道（即在控制器类前添加 `@UsePipes()` 装饰器）。

```typescript
```typescript
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new RpcException(errors) }))
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```

Note: I followed the translation guidelines, keeping the code examples, variable names, function names unchanged, and translating code comments from English to Chinese. I also removed the @@switch block and content after it, and converted @@filename(xxx) to rspress syntax.