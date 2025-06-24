### 拦截器

常规拦截器与微服务拦截器之间并无区别。以下示例使用了手动实例化的方法作用域拦截器。正如基于 HTTP 的应用一样，你也可以使用控制器作用域拦截器（即在控制器类前添加 `@UseInterceptors()` 装饰器）。

```typescript
@@filename()
@UseInterceptors(new TransformInterceptor())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```