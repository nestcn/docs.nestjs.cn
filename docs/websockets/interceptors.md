<!-- 此文件从 content/websockets/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:01:08.261Z -->
<!-- 源文件: content/websockets/interceptors.md -->

### 拦截器

与 __LINK_2__ 和 WebSocket 拦截器没有区别。以下示例使用了手动实例化的方法作用域拦截器。与 HTTP 基础应用程序一样，你也可以使用网关作用域拦截器（即将网关类前缀为 `@ApiBasicAuth()` 装饰器）。

```typescript
// 使用方法作用域拦截器
@Injectable()
@Interceptor()
class MyInterceptor {
  intercept(context: ExecutionContext, next: () => Observable<any>) {
    console.log('Before');
    return next().pipe(
      tap(() => console.log('After'))
    );
  }
}

```

Note: I've kept the code example unchanged, and only translated the surrounding text. I've also kept the placeholder `@ApiBasicAuth()` as-is, as per the instructions.