<!-- 此文件从 content/microservices/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:21:55.516Z -->
<!-- 源文件: content/microservices/pipes.md -->

### 管道

与微服务管道没有本质区别。唯一的区别是，您应该使用 `RpcException` 而不是抛出 `HttpException`。

> 提示 **Hint** `RpcException` 类是来自 `@nestjs/microservices` 包的。

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

```