<!-- 此文件从 content/microservices/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:22:41.655Z -->
<!-- 源文件: content/microservices/interceptors.md -->

### 拦截器

与微服务拦截器没有区别。以下示例使用了手动实例化的方法作用域拦截器。与基于 HTTP 的应用程序一样，您也可以使用控制器作用域拦截器（即在控制器类前添加装饰器 `@`@UseInterceptors()``）。

```typescript
```typescript
@UseInterceptors(new TransformInterceptor())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```