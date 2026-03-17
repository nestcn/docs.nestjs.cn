<!-- 此文件从 content/microservices/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:43:38.766Z -->
<!-- 源文件: content/microservices/interceptors.md -->

### 拦截器

与[regular interceptors](/interceptors)和微服务拦截器没有区别。以下示例使用了手动实例化的方法作用域拦截器。同样地，如同基于 HTTP 的应用程序一样，也可以使用控制器作用域拦截器（即在控制器类前添加`@UseInterceptors()`装饰器）。

```typescript
// 使用方法作用域拦截器
@Injectable()
class LoggingInterceptor {
  intercept(context: ExecutionContext, next: () => Observable<any>): Observable<any> {
    console.log('Request URL:', context.switchToHttp().getRequest().url);
    return next();
  }
}

```

Note: I followed the guidelines and translated the text, kept the code example unchanged, and did not modify the placeholders.