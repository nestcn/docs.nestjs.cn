<!-- 此文件从 content/microservices/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:08:31.297Z -->
<!-- 源文件: content/microservices/guards.md -->

### 守卫

microservices 守卫和[regular HTTP application guards](/guards)之间没有本质的差异。
唯一的区别是，您应该使用 `RpcException` 而不是抛出 `HttpException`。

> info **提示** `RpcException` 类来自 `@nestjs/microservices` 包。

#### 绑定守卫

以下示例使用方法作用域守卫。与基于 HTTP 的应用程序一样，您也可以使用控制器作用域守卫（即将控制器类前缀为 `@UseGuards()` 装饰器）。

```typescript
@UseGuards(AuthGuard)
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}

```