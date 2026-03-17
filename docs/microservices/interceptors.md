<!-- 此文件从 content/microservices/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:10:52.646Z -->
<!-- 源文件: content/microservices/interceptors.md -->

### 拦截器

与 [regular interceptors](/interceptors) 和微服务拦截器没有区别。以下示例使用了手动实例化的方法作用域拦截器。与基于 HTTP 的应用程序一样，你也可以使用控制器作用域拦截器（即将控制器类加上一个 `@UseInterceptors()` 装饰器）。

```typescript

```typescript
@UseInterceptors(new TransformInterceptor())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}

```

```