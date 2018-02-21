## 异步组件

有时, 应用程序启动必须延迟, 直到某些异步任务完成, 例如, 建立与数据库的连接。这就是为什么 Nest 提供了创建异步组件的方法。

要创建异步组件, 我们使用的是 useFactory。工厂必须返回 Promise 或只是被标记为一个 async 功能。


```typescript
{
  provide: 'AsyncDbConnection',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
},
```

?> 阅读更多关于自定义组件的[信息](/4.5/dependencyinjection)

这些异步组件可能只是由 token (在本例中为 AsyncDbConnection 令牌) 注入其他组件。当异步组件将被解析(resolved)时，每个依赖于异步组件的组件都将被实例化。

以上示例用于演示目的。如果你正在寻找更详细的，请看[这里](/4.5/sqltypeorm)。

