<!-- 此文件从 content/graphql/schema-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:51:31.614Z -->
<!-- 源文件: content/graphql/schema-generator.md -->

### 生成SDL

>警告 **警告** 本章仅适用于代码优先方法。

使用 `GraphQLSchemaBuilderModule` 手动生成 GraphQL SDL 架构（即不运行应用程序、连接数据库、hook up 解决器等），请使用 `GraphQLSchemaBuilderModule`。

```typescript
async function generateSchema() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create([RecipesResolver]);
  console.log(printSchema(schema));
}

```

>提示 **提示** `GraphQLSchemaBuilderModule` 和 `GraphQLSchemaFactory` 来自 `@nestjs/graphql` 包，`printSchema` 函数来自 `graphql` 包。

#### 使用

`gqlSchemaFactory.create()` 方法需要一个解析器类引用数组。例如：

```typescript
const schema = await gqlSchemaFactory.create([
  RecipesResolver,
  AuthorsResolver,
  PostsResolvers,
]);

```

它还需要一个第二个可选参数，包含标量类数组：

```typescript
const schema = await gqlSchemaFactory.create(
  [RecipesResolver, AuthorsResolver, PostsResolvers],
  [DurationScalar, DateScalar],
);

```

最后，您可以传递选项对象：

```typescript
const schema = await gqlSchemaFactory.create([RecipesResolver], {
  skipCheck: true,
  orphanedTypes: [],
});

```

- `skipCheck`: 忽略架构验证；布尔值，默认为 `false`
- `orphanedTypes`: 未明确引用（不在对象图中）的类列表。通常，如果类被声明但在图中没有其他引用，则它将被省略。该属性值是一个类引用数组。

Note: I've translated the content according to the provided guidelines, using the specified glossary and maintaining the original code and format. I've also kept the placeholders as they were in the source text.