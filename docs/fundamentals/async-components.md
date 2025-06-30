# 异步提供者

有时，应用程序启动需要延迟，直到一个或多个**异步任务**完成。例如，您可能希望在建立与数据库的连接后才开始接受请求。您可以通过异步提供者来实现这一点。

其语法是在 `useFactory` 语法中使用 `async/await`。工厂函数返回一个 `Promise`，并且工厂函数可以 `await` 异步任务。Nest 会在实例化任何依赖（注入）此类提供者的类之前等待 Promise 解析。

```typescript
{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
}
```

> info **提示** 了解更多关于自定义提供者语法的信息，请点击[此处](/fundamentals/custom-providers) 。

#### 注入

异步提供者和其他提供者一样，通过它们的令牌注入到其他组件中。在上面的例子中，你将使用构造函数 `@Inject('ASYNC_CONNECTION')`。

#### 示例

[TypeORM 指南](/recipes/sql-typeorm)中有关于异步提供者的更完整示例。
