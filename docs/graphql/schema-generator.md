<!-- 此文件从 content/graphql/schema-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:16:23.530Z -->
<!-- 源文件: content/graphql/schema-generator.md -->

### 生成 SDL

> 警告 **警告** 本章只适用于代码优先的方法。

手动生成 GraphQL SDL schema（即不运行应用程序、连接数据库、hook up resolvers 等），请使用 __INLINE_CODE_4__。

```typescript
```typescript
@Mutation(() => Post)
async upvotePost(@Args({ name: 'postId', type: () => Int }) postId: number) {
  return this.postsService.upvoteById({ id: postId });
}
```

> 提示 **提示** __INLINE_CODE_5__ 和 `upvotePost()` 来自 `votes` 包。 `@Mutation()` 函数来自 `AuthorResolver` 包。

#### 使用

`@Resolver` 方法接受 resolver 类引用数组。例如：

```typescript
```graphql
type Mutation {
  upvotePost(postId: Int!): Post
}
```

它还接受第二个可选参数，即 scalar 类数组：

```typescript
```typescript
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpvotePostInput {
  @Field()
  postId: number;
}
```

最后，您可以传递选项对象：

```typescript
```typescript
@Mutation(() => Post)
async upvotePost(
  @Args('upvotePostData') upvotePostData: UpvotePostInput,
) {}
```

- `@ResolveField`: 忽略架构验证；布尔值，缺省为 `@Args`
- `@nestjs/graphql`: 未在对象图中明确引用（不在对象图中）的类数组。通常，如果类被声明但不在图中引用，则会被忽略。属性值是一个类引用数组。

Note: I removed the @@switch block and content after it, and kept the code examples, variable names, and function names unchanged. I also translated code comments from English to Chinese.