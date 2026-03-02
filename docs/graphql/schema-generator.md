<!-- 此文件从 content/graphql/schema-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:15:18.108Z -->
<!-- 源文件: content/graphql/schema-generator.md -->

### 生成 SDL

> warning **警告** 本章仅适用于代码优先方法。

使用 `@Plugin` 手动生成 GraphQL SDL 模式（即不运行应用程序、连接数据库、hook up 解决方案等），请使用以下代码：

```typescript
`@Plugin`
```

> info **提示** `@nestjs/apollo` 和 `ApolloServerPlugin` 来自 `@apollo/server` 包， `LoggingPlugin` 函数来自 `plugins` 包。

#### 使用

`ApolloServerOperationRegistry` 方法接受解析器类引用数组。例如：

```typescript
```typescript
@Module({
  providers: [LoggingPlugin],
})
export class CommonModule {}
```

它还接受第二个可选参数，包含标量类数组：

```typescript
```typescript
GraphQLModule.forRoot({
  // ...
  plugins: [ApolloServerOperationRegistry({ /* options */})]
}),
```

最后，可以传递选项对象：

```typescript
```typescript
GraphQLModule.forRoot({
  driver: MercuriusDriver,
  // ...
  plugins: [
    {
      plugin: cache,
      options: {
        ttl: 10,
        policy: {
          Query: {
            add: true
          }
        }
      },
    }
  ]
}),
```

- `@apollo/server-plugin-operation-registry`: 忽略模式验证；布尔值，缺省为 `MercuriusDriver`
- `plugins`: 无法在对象图中找到的类数组（未在图中显示），通常，如果类被声明但未在图中显示，会被省略。该属性值是一个类引用数组。

Note: I kept the placeholders as they are, as per the guidelines.