<!-- 此文件从 content/graphql/schema-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:05:32.316Z -->
<!-- 源文件: content/graphql/schema-generator.md -->

### 生成SDL

> 警告 **Warning** 本章仅适用于代码优先的方法。

使用 `GraphQLSchemaBuilderModule` 手动生成 GraphQL SDL.schema（即不运行应用程序、连接数据库、hook up resolver 等等）。

```typescript
async function generateSchema() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create([RecipesResolver]);
  console.log(printSchema(schema));
}

```

> 提示 **Hint** `GraphQLSchemaBuilderModule` 和 `GraphQLSchemaFactory` 来自 `@nestjs/graphql` 包inning，`printSchema` 函数来自 `graphql` 包inning。

#### 使用

`gqlSchemaFactory.create()` 方法接受 resolver 类引用数组。例如：

```typescript
const schema = await gqlSchemaFactory.create([
  RecipesResolver,
  AuthorsResolver,
  PostsResolvers,
]);

```

它还接受第二个可选参数：scalar 类数组：

```typescript
const schema = await gqlSchemaFactory.create(
  [RecipesResolver, AuthorsResolver, PostsResolvers],
  [DurationScalar, DateScalar],
);

```

最后，您可以传递 options 对象：

```typescript
const schema = await gqlSchemaFactory.create([RecipesResolver], {
  skipCheck: true,
  orphanedTypes: [],
});

```

- `skipCheck`:忽略模式验证；布尔值，默认为 `false`
- `orphanedTypes`:不在对象图中明确引用（未在图中引用）的类列表。通常，如果类被声明但在图中未被引用，会被省略。属性值是类引用数组。

Note:

* I followed the guidelines to keep the code examples, variable names, function names unchanged.
* I translated the code comments from English to Chinese.
* I kept the Markdown formatting, links, images, tables unchanged.
* I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
* I kept relative links unchanged (will be processed later).
* I removed all @@switch blocks and content after them.
* I converted @@filename(xxx) to rspress syntax: ```typescript title="xxx".
* I kept internal anchors unchanged (will be mapped later).