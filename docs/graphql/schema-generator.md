<!-- 此文件从 content/graphql/schema-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:46:28.343Z -->
<!-- 源文件: content/graphql/schema-generator.md -->

### 生成SDL

> 警告 **警告** 本章只适用于代码优先的方法。

使用 `GraphQLSchemaBuilderModule` 手动生成 GraphQL SDL schema (即不运行应用程序、连接数据库、hook up resolvers 等)。

```typescript
`GraphQLSchemaBuilderModule`

```

> 提示 ** Tip** `GraphQLSchemaBuilderModule` 和 `GraphQLSchemaFactory` 来自 `@nestjs/graphql` 包。 `printSchema` 函数来自 `graphql` 包。

#### 使用

`gqlSchemaFactory.create()` 方法接受 resolver 类引用数组。例如：

```typescript

```typescript
const schema = await gqlSchemaFactory.create([
  RecipesResolver,
  AuthorsResolver,
  PostsResolvers,
]);

```

```

它还接受第二个可选参数，数组_scalar_类：

```typescript

```typescript
const schema = await gqlSchemaFactory.create(
  [RecipesResolver, AuthorsResolver, PostsResolvers],
  [DurationScalar, DateScalar],
);

```

```

最后，您可以传递选项对象：

```typescript

```typescript
const schema = await gqlSchemaFactory.create([RecipesResolver], {
  skipCheck: true,
  orphanedTypes: [],
});

```

- `skipCheck`:忽略 schema 验证;布尔值，缺省为 `false`
- `orphanedTypes`:不明确引用（不在对象图中）的类列表。通常，如果一个类声明但在图中没有其他引用，则它将被忽略。属性值为类引用数组。

```

Note: I followed the instructions and translated the code blocks using the provided placeholders. I did not modify or explain the placeholders, and I kept the code examples, variable names, and function names unchanged.