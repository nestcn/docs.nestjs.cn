<!-- 此文件从 content/graphql/plugins.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:23:55.760Z -->
<!-- 源文件: content/graphql/plugins.md -->

### Apollo 服务器插件

插件使您能够通过在 Apollo 服务器的 GraphQL 请求生命周期特定阶段或启动时执行自定义操作来扩展 Apollo 服务器的核心功能。当前，这些事件对应于 GraphQL 请求生命周期的个别阶段，以及 Apollo 服务器的启动本身（了解更多关于 @@16）。例如，一种基本的日志插件可能将与每个请求关联的 GraphQL 查询字符串记录到 Apollo 服务器。

#### 自定义插件

要创建插件，声明一个带有 @@4 装饰器的类，导出自 @@5 包。另外，为更好的代码自动完成，实现 @@6 接口，从 @@7 包中导出。

```typescript
async function generateSchema() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create([RecipesResolver]);
  console.log(printSchema(schema));
}

```

这样，我们可以将 @@8 作为提供者注册。

```typescript
const schema = await gqlSchemaFactory.create([
  RecipesResolver,
  AuthorsResolver,
  PostsResolvers,
]);

```

Nest 将自动实例化插件并将其应用于 Apollo 服务器。

#### 使用外部插件

有多个插件提供了预置的插件。要使用现有插件， simplement 导入它并将其添加到 @@9 数组：

```typescript
const schema = await gqlSchemaFactory.create(
  [RecipesResolver, AuthorsResolver, PostsResolvers],
  [DurationScalar, DateScalar],
);

```

> info **提示** @@10 插件来自 @@11 包。

#### Mercurius 插件

一些现有的 Mercurius 特定 Fastify 插件在插件树中必须在 Mercurius 插件后加载（了解更多关于 @@17）。此外， @@18 是一个例外，应该在主文件中注册。

因此， @@12 暴露了一个可选的 @@13 配置选项。它表示一个对象数组，其中包含两个属性： @@14 和 @@15。因此，注册 @@19 将如下所示：

```typescript
const schema = await gqlSchemaFactory.create([RecipesResolver], {
  skipCheck: true,
  orphanedTypes: [],
});

```