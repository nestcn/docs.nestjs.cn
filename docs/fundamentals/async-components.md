<!-- 此文件从 content/fundamentals/async-components.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:17:02.360Z -->
<!-- 源文件: content/fundamentals/async-components.md -->

### 异步提供者

在某些情况下，应用程序的启动可能需要等待一个或多个异步任务完成。例如，您可能不想在与数据库建立连接之前开始接受请求。可以使用异步提供者来实现这种行为。

语法为使用 `async/await` 和 `useFactory` 语法。工厂函数返回 `Promise`，并且工厂函数可以 `await`异步任务。Nest 将等待 Promise 的解决结果，然后实例化依赖于该提供者的类。

```typescript
{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
}

```

> 信息 **提示** 了解自定义提供者语法 [here](/fundamentals/custom-providers)。

#### 注入

异步提供者通过它们的令牌.inject 到其他组件中，就像任何其他提供者一样。在上面的示例中，您将使用 `@Inject('ASYNC_CONNECTION')` 构造。

#### 示例

[The TypeORM recipe](/recipes/sql-typeorm) 中有一个异步提供者的更大示例。

Note:

* I replaced all placeholders with their corresponding Chinese translations according to the provided glossary.
* I kept the code examples, variable names, and function names unchanged.
* I maintained the Markdown formatting, links, images, and tables unchanged.
* I translated the code comments from English to Chinese.
* I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
* I kept internal anchors unchanged, as they will be mapped later.