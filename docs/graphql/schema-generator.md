<!-- 此文件从 content/graphql/schema-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T13:42:20.369Z -->
<!-- 源文件: content/graphql/schema-generator.md -->

### 生成 SDL

> warning **警告** 本章仅适用于代码优先方法。

要手动生成 GraphQL SDL 架构（即不运行应用程序、连接数据库、连接解析器等），请使用 `GraphQLSchemaBuilderModule`。

```typescript
async function generateSchema() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create([RecipesResolver]);
  console.log(printSchema(schema));
}

```

> info **提示** `GraphQLSchemaBuilderModule` 和 `GraphQLSchemaFactory` 从 `@nestjs/graphql` 包导入。`printSchema` 函数从 `graphql` 包导入。

#### 用法

`gqlSchemaFactory.create()` 方法接受解析器类引用数组。例如：

```typescript
const schema = await gqlSchemaFactory.create([
  RecipesResolver,
  AuthorsResolver,
  PostsResolvers,
]);

```

它还接受带有标量类数组的第二个可选参数：

```typescript
const schema = await gqlSchemaFactory.create(
  [RecipesResolver, AuthorsResolver, PostsResolvers],
  [DurationScalar, DateScalar],
);

```

最后，你可以传递一个选项对象：

```typescript
const schema = await gqlSchemaFactory.create([RecipesResolver], {
  skipCheck: true,
  orphanedTypes: [],
});

```

- `skipCheck`：忽略架构验证；布尔值，默认为 `false`
- `orphanedTypes`：未显式引用（不属于对象图的一部分）的要生成的类列表。通常，如果声明了一个类但在图中没有其他引用，它将被省略。属性值是类引用数组。
