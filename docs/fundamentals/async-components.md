<!-- 此文件从 content/fundamentals/async-components.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:37:55.754Z -->
<!-- 源文件: content/fundamentals/async-components.md -->

### 异步提供者

在某些情况下，应用程序的启动可能需要延迟，直到一个或多个异步任务完成。例如，您可能不想在与数据库建立连接之前开始接受请求。可以使用异步提供者来实现这点。

语法为使用 `async/await` 与 `useFactory` 语法。工厂返回 `Promise`，工厂函数可以 `await` 异步任务。Nest 将等待 promise 解决前实例化依赖于该提供者的类。

```typescript
{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
}

```

> 提示 **Hint** 了解更多关于自定义提供者语法的信息 [here](/fundamentals/custom-providers)。

#### 注入

异步提供者通过其 token 与其他组件注入，如任何其他提供者。例如，在上面的示例中，您将使用 construct `@Inject('ASYNC_CONNECTION')`。

#### 示例

[The TypeORM recipe](/recipes/sql-typeorm) 中有一个异步提供者的更详细示例。