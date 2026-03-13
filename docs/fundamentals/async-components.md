<!-- 此文件从 content/fundamentals/async-components.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:34:25.888Z -->
<!-- 源文件: content/fundamentals/async-components.md -->

### 异步提供者

在某些情况下，应用程序的启动可能需要等待一个或多个异步任务完成。例如，你可能不想在与数据库建立连接之前开始接受请求。可以使用异步提供者来实现这个目标。

语法为使用 `async/await` 与 `useFactory` 语法。工厂函数返回 `Promise`，并且工厂函数可以 `await` 异步任务。Nest 将在实例化依赖于该提供者的类之前等待 promise 的-resolution。

```typescript
{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
}

```

> 提示 **Hint** 了解自定义提供者语法 [here](/fundamentals/custom-providers)。

#### 注入

异步提供者可以像任何其他提供者一样通过 token 注入到其他组件中。在上面的示例中，你将使用 `@Inject('ASYNC_CONNECTION')` 构造函数。

#### 示例

[The TypeORM recipe](/recipes/sql-typeorm) 中有一个异步提供者的更为详细的示例。