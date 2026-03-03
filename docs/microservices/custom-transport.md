<!-- 此文件从 content/microservices/custom-transport.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:15:10.134Z -->
<!-- 源文件: content/microservices/custom-transport.md -->

### 自定义传输器

Nest 提供了多种 **传输器**，同时也提供了一个 API，允许开发者构建新的自定义传输策略。
传输器使您可以使用可插拔的通信层和简单的应用级别消息协议连接组件（请阅读完整的 __LINK_79__）。

> info **提示** 使用 Nest 构建微服务并不一定意味着您必须使用 __INLINE_CODE_18__ 包。例如，如果您想与外部服务（例如其他语言编写的微服务）通信，您可能不需要 __INLINE_CODE_19__ 库中的所有功能。
> 实际上，如果您不需要使用 decorator (__INLINE_CODE_20__ 或 __INLINE_CODE_21__)来声明订阅者，可以运行 __LINK_80__，手动维护连接/订阅频道，这将为大多数用例提供更多灵活性。

使用自定义传输器，您可以集成任何消息系统/协议（包括 Google Cloud Pub/Sub、Amazon Kinesis 和其他），或者扩展现有的传输器，添加额外功能（例如 __LINK_81__ 的 MQTT）。

> info **提示** 为了更好地理解 Nest 微服务的工作原理和如何扩展现有的传输器，我们建议阅读 __LINK_82__ 和 __LINK_83__ 文章系列。

#### 创建策略

首先，让我们定义一个表示我们的自定义传输器的类。

```typescript
async function generateSchema() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create([RecipesResolver]);
  console.log(printSchema(schema));
}
```

> warning **警告** 请注意，我们不会在本章中实现一个完整的 Google Cloud Pub/Sub 服务器，因为这需要深入了解传输器特定的技术细节。

在我们的示例中，我们声明了 __INLINE_CODE_22__ 类，并提供了 __INLINE_CODE_23__ 和 __INLINE_CODE_24__ 方法，遵守 __INLINE_CODE_25__ 接口。
此外，我们的类继承自 __INLINE_CODE_26__ 类，从 __INLINE_CODE_27__ 包中导入，提供了一些有用的方法，例如 Nest 运行时注册消息处理程序的方法。