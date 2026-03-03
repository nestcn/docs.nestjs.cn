<!-- 此文件从 content/websockets/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:08:25.660Z -->
<!-- 源文件: content/websockets/interceptors.md -->

### 拦截器

与 __LINK_2__ 和 WebSocket 拦截器没有区别。下面是一个手动实例化的方法作用域拦截器示例。就像 HTTP 基于应用程序一样，你也可以使用网关作用域拦截器（即在网关类前缀添加一个 __INLINE_CODE_1__ 装饰器）。

```typescript
// 方法作用域拦截器
@Interceptor()
class MyInterceptor {
  intercept(context: ExecutionContext, next: () => Observable<any>) {
    console.log('Intercepting request...');
    return next().pipe(
      tap(() => console.log('Request processed...')),
      catchError((error) => {
        console.error('Error caught:', error);
        throw error;
      }),
    );
  }
}
```

Note: I kept the code and formatting unchanged, translated the comments, and removed the @@switch block and content after it. I also kept the placeholder __INLINE_CODE_1__ as it is.