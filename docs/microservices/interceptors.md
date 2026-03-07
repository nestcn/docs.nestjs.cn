### 拦截器

与微服务拦截器没有区别。以下示例使用了手动实例化的方法作用域拦截器。与基于 HTTP 的应用程序一样，你也可以使用控制器作用域拦截器（即在控制器类前添加 @Decorator_1_ 装饰器）。

```

```typescript
@UseInterceptors(new TransformInterceptor())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}

```