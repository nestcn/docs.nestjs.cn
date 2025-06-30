### 守卫

微服务守卫与[常规 HTTP 应用守卫](/guards)没有本质区别。唯一的不同在于，你应该使用 `RpcException` 而不是抛出 `HttpException`。

> info **注意** `RpcException` 类是从 `@nestjs/microservices` 包中导出的。

#### 绑定守卫

以下示例使用了一个方法作用域的守卫。与基于 HTTP 的应用一样，你也可以使用控制器作用域的守卫（即在控制器类前添加 `@UseGuards()` 装饰器）。

```typescript
@UseGuards(AuthGuard)
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```
