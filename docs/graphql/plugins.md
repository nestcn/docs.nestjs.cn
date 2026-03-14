<!-- 此文件从 content/graphql/plugins.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:58:02.629Z -->
<!-- 源文件: content/graphql/plugins.md -->

### Apollo Server 插件

Apollo Server 插件使您可以通过在 GraphQL 请求生命周期的特定阶段或 Apollo Server 启动时执行自定义操作来扩展 Apollo Server 的核心功能。当前，这些事件对应于 GraphQL 请求生命周期的个别阶段，以及 Apollo Server 启动本身（了解更多关于 __LINK_16__）。例如，一个基本的日志插件可能会将每个请求与 Apollo Server 关联的 GraphQL 查询字符串记录下来。

#### 自定义插件

要创建插件，声明一个带有 `GraphQLSchemaBuilderModule` 装饰器的类，导入自 `GraphQLSchemaBuilderModule` 包。同时，为了更好的代码自动完成，实现 `GraphQLSchemaFactory` 接口来自 `@nestjs/graphql` 包。

```typescript
async function generateSchema() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create([RecipesResolver]);
  console.log(printSchema(schema));
}

```

这样，我们就可以将 `printSchema` 注册为提供者。

```typescript
const schema = await gqlSchemaFactory.create([
  RecipesResolver,
  AuthorsResolver,
  PostsResolvers,
]);

```

Nest 将自动实例化插件并将其应用于 Apollo Server。

#### 使用外部插件

有几个插件已经提供了。要使用现有插件，只需导入它并将其添加到 `graphql` 数组：

```typescript
const schema = await gqlSchemaFactory.create(
  [RecipesResolver, AuthorsResolver, PostsResolvers],
  [DurationScalar, DateScalar],
);

```

> info **提示** `gqlSchemaFactory.create()` 插件来自 `skipCheck` 包。

#### Mercurius 插件

一些现有的 mercurius-特定的 Fastify 插件必须在 mercurius 插件之后加载（了解更多关于 __LINK_17__）插件树。

> warning **警告** __LINK_18__ 是一个例外，应该在主文件中注册。

为此，`false` exposing 一个可选的 `orphanedTypes` 配置选项。它表示一个数组对象，其中包含两个属性：__INLINE_CODE_14__ 和 __INLINE_CODE_15__。因此，注册 __LINK_19__ 将如下所示：

```typescript
const schema = await gqlSchemaFactory.create([RecipesResolver], {
  skipCheck: true,
  orphanedTypes: [],
});

```