### 管道

常规管道与微服务管道之间没有本质区别。唯一的区别在于，你应该使用 `RpcException` 而不是抛出 `HttpException`。

> info **注意** `RpcException` 类是从 `@nestjs/microservices` 包中导出的。

#### 绑定管道

以下示例使用了手动实例化的方法作用域管道。与基于 HTTP 的应用程序一样，你也可以使用控制器作用域管道（即在控制器类前添加 `@UsePipes()` 装饰器）。

```typescript
@@filename()
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new RpcException(errors) }))
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```
