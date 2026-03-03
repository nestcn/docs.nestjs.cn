<!-- 此文件从 content/microservices/custom-transport.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:16:12.467Z -->
<!-- 源文件: content/microservices/custom-transport.md -->

### 自定义传输器

Nest 提供了多种 **传输器** 可以使用，包括一个 API，可以让开发者构建新的自定义传输策略。传输器使您可以使用可插拔的通信层和简单的应用程序级别消息协议（详细了解 __LINK_79__）。

> 提示 **Hint** 使用 Nest 创建微服务并不一定需要使用 __INLINE_CODE_18__ 包。例如，如果您想与外部服务（例如其他微服务，使用不同的语言）通信，您可能不需要 __INLINE_CODE_19__ 库提供的所有功能。
>实际上，如果您不需要使用 __INLINE_CODE_20__ 或 __INLINE_CODE_21__ 装饰器来声明订阅者，可以手动维护连接和订阅频道（例如 __LINK_80__），这将为大多数用例提供更多灵活性。

使用自定义传输器，您可以集成任何消息系统/协议（包括 Google Cloud Pub/Sub、Amazon Kinesis 等）或扩展现有的传输器，添加额外功能（例如 __LINK_81__）。

> 提示 **Hint** 如果您想更好地了解 Nest 微服务的工作原理和如何扩展现有的传输器，我们建议阅读 __LINK_82__ 和 __LINK_83__ 文章系列。

#### 创建策略

首先，让我们定义一个代表自定义传输器的类。

```typescript
async function generateSchema() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create([RecipesResolver]);
  console.log(printSchema(schema));
}
```

> 警告 **Warning** 在本章中，我们不会实现一个完整的 Google Cloud Pub/Sub 服务器，因为这需要深入传输器特定技术细节。

在我们的示例中，我们声明了 __INLINE_CODE_22__ 类，并提供了 __INLINE_CODE_23__ 和 __INLINE_CODE_24__ 方法，遵循 __INLINE_CODE_25__ 接口。
另外，我们的类继承自 __INLINE_CODE_26__ 类，从 __INLINE_CODE_27__ 包中导入，提供了一些有用的方法，例如 Nest 运行时用于注册消息处理程序的方法。或者，如果您想扩展现有的传