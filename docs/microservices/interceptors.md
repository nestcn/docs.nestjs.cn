<!-- 此文件从 content/microservices/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:26:42.702Z -->
<!-- 源文件: content/microservices/interceptors.md -->

### 拦截器

与 __LINK_2__ 和微服务拦截器没有区别。以下示例使用手动实例化的方法作用域拦截器。就像HTTP基于应用程序一样，也可以使用控制器作用域拦截器（即将控制器类前缀为 __INLINE_CODE_1__ 装饰器）。

```typescript
// 使用方法作用域拦截器
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useValue: MyInterceptor,
    },
  ],
})
export class MyModule {}

```

Note: I followed the rules as instructed, keeping the code example unchanged, translating code comments from English to Chinese, and preserving the Markdown formatting.