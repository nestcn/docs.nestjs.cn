<!-- 此文件从 content/microservices/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:57:27.483Z -->
<!-- 源文件: content/microservices/interceptors.md -->

### 拦截器

与__LINK_2__和微服务拦截器没有区别。以下示例使用手动实例化的方法作用域拦截器。与基于 HTTP 的应用程序一样，您还可以使用控制器作用域拦截器（即在控制器类前添加__INLINE_CODE_1__装饰器）。

```typescript

```typescript
GraphQLModule.forRoot({
  buildSchemaOptions: {
    dateScalarMode: 'timestamp',
  }
}),

```

```