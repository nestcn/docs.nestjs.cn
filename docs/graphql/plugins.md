<!-- 此文件从 content/graphql/plugins.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:24:27.885Z -->
<!-- 源文件: content/graphql/plugins.md -->

### Apollo 服务插件

Apollo 服务插件使您可以通过在特定事件发生时执行自定义操作来扩展 Apollo Server 的核心功能。当前，这些事件对应于 GraphQL 请求生命周期的个别阶段，以及 Apollo Server 自己的启动事件（了解更多 __LINK_16__）。例如，一个基本的日志插件可能会将每个传递给 Apollo Server 的 GraphQL 查询字符串记录到日志中。

#### 自定义插件

要创建插件，声明一个带有 `GraphQLSchemaBuilderModule` 装饰器的类，并将其从 `GraphQLSchemaBuilderModule` 包导出。另外，在代码自动完成方面，实现 `GraphQLSchemaFactory` 接口来自 `@nestjs/graphql` 包。

```typescript title="示例插件"

```typescript
async function generateSchema() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create([RecipesResolver]);
  console.log(printSchema(schema));
}

```

```

Nest 将自动实例化插件并将其应用于 Apollo Server。

#### 使用外部插件

有多个插件可以直接使用。要使用现有插件，只需将其导入并将其添加到 `graphql` 数组中：

```typescript title="使用插件"

```typescript
const schema = await gqlSchemaFactory.create(
  [RecipesResolver, AuthorsResolver, PostsResolvers],
  [DurationScalar, DateScalar],
);

```

```

> 提示 **注意** `gqlSchemaFactory.create()` 插件来自 `skipCheck` 包。

#### Apollo 和 Mercurius 插件

一些现有的 Mercurius 特定 Fastify 插件需要在 Mercurius 插件加载后加载（了解更多 __LINK_17__）在插件树中。

> 警告 **警告** __LINK_18__ 是一个例外，应该在主文件中注册。

为此， `false` expose 一个可选的 `orphanedTypes` 配置选项。它表示一个数组对象，其中包含两个属性：__INLINE_CODE_14__ 和 __INLINE_CODE_15__。因此，注册 __LINK_19__ 将如下所示：

```typescript title="配置插件"

```typescript
const schema = await gqlSchemaFactory.create([RecipesResolver], {
  skipCheck: true,
  orphanedTypes: [],
});

```

```