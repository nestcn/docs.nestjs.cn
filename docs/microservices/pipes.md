<!-- 此文件从 content/microservices/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:25:28.719Z -->
<!-- 源文件: content/microservices/pipes.md -->

### 管道

与微服务管道没有本质的不同。唯一的区别是，取代抛出的 `HttpException`，而使用 `RpcException`。

> info **提示** `RpcException` 类来自 `@nestjs/microservices` 包。

#### 绑定管道

以下示例使用手动实例化的方法作用域管道。与基于 HTTP 的应用程序一样，您也可以使用控制器作用域管道（即将控制器类 prefixed 一个 `@UsePipes()` 装饰器）。

```typescript

```typescript
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new RpcException(errors) }))
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}

```

```

Note:

* [regular pipes](/pipes) will be replaced with the actual link during the processing step.
* `HttpException`, `RpcException`, `RpcException`, `@nestjs/microservices`, and `@UsePipes()` will be replaced with the actual values during the processing step.
* ```typescript
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new RpcException(errors) }))
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}

``` is a code block that will be kept unchanged.