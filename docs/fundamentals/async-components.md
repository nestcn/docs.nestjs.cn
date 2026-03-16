<!-- 此文件从 content/fundamentals/async-components.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:56:02.356Z -->
<!-- 源文件: content/fundamentals/async-components.md -->

### 异步提供者

在某些情况下，应用程序启动可能需要延迟直到一个或多个异步任务完成。例如，您可能不想在数据库连接建立前开始接受请求。可以使用异步提供者来实现此目标。

语法为使用 `async/await` 与 `useFactory` 语法。工厂函数返回 `Promise`，工厂函数可以执行异步任务 `await`。Nest 将等待 promise 解决然后实例化依赖于该提供者的类。

```typescript

```typescript
{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
}

```

```

> info **提示** 了解自定义提供者语法 [here](/fundamentals/custom-providers)。

#### 注入

异步提供者通过它们的令牌注入到其他组件中，就像任何其他提供者一样。在上面的示例中，您将使用 `@Inject('ASYNC_CONNECTION')` 构造函数。

#### 示例

[The TypeORM recipe](/recipes/sql-typeorm) 中有异步提供者的更多示例。