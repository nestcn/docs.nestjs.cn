<!-- 此文件从 content/microservices/custom-transport.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:23:22.967Z -->
<!-- 源文件: content/microservices/custom-transport.md -->

### 自定义传输器

Nest 提供了许多 **传输器**，同时还提供了一个 API，允许开发者构建新的自定义传输策略。

传输器使您可以使用可插拔的通信层和简单的应用程序级别消息协议来连接组件（阅读完整的 __LINK_79__）。

> 信息 **提示** 使用 Nest 创建微服务并不一定意味着您必须使用 __INLINE_CODE_18__ 包。例如，如果您想与外部服务通信（例如其他微服务，使用不同的语言），您可能不需要 __INLINE_CODE_19__ 库中的所有特性。
> 实际上，如果您不需要使用装饰器（__INLINE_CODE_20__ 或 __INLINE_CODE_21__）来 declaratively 定义订阅者，可以运行 __LINK_80__ 并手动维护连接/订阅到通道，以获得更多灵活性。

使用自定义传输器，您可以将任何消息系统/协议（包括 Google Cloud Pub/Sub、Amazon Kinesis 等）或扩展现有的一些，添加额外的特性（例如 __LINK_81__ 对 MQTT）。

> 信息 **提示** 为了更好地理解 Nest 微服务的工作机制和如何扩展现有的传输器，我们建议阅读 __LINK_82__ 和 __LINK_83__ 文章系列。

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

> 警告 **警告** 请注意，我们不会在本章中实现一个完整的 Google Cloud Pub/Sub 服务器，因为这需要深入传输器特定的技术细节。

在我们的示例中，我们声明了 __INLINE_CODE_22__ 类，并提供了 __INLINE_CODE_23__ 和 __INLINE_CODE_24__ 方法，遵守由 __INLINE_CODE_25__ 接口强制执行的约束。
此外，我们的类继承自 __INLINE_CODE_26__ 类，从 __INLINE_CODE_27__ 包中导入，该包提供了一些有用的方法，例如 Nest