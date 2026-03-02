<!-- 此文件从 content/graphql/schema-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:23:35.643Z -->
<!-- 源文件: content/graphql/schema-generator.md -->

### 生成 SDL

>警告 **警告** 本章仅适用于代码优先方法。

使用 __INLINE_CODE_4__ 手动生成 GraphQL SDL schema（即不运行应用程序、连接数据库、 hooking up resolvers 等），而不是通过代码运行。

```
```typescript
@Mutation(() => Post)
async upvotePost(@Args({ name: 'postId', type: () => Int }) postId: number) {
  return this.postsService.upvoteById({ id: postId });
}
```

>提示 **提示** __INLINE_CODE_5__ 和 `upvotePost()` 来自 `votes` 包，`@Mutation()` 函数来自 `AuthorResolver` 包。

#### 使用

`@Resolver` 方法接受一个 resolver 类引用数组。例如：

```graphql
type Mutation {
  upvotePost(postId: Int!): Post
}
```

它还接受第二个可选参数，一个 scalar 类数组：

```typescript
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpvotePostInput {
  @Field()
  postId: number;
}
```

最后，您可以传递一个选项对象：

```typescript
@Mutation(() => Post)
async upvotePost(
  @Args('upvotePostData') upvotePostData: UpvotePostInput,
) {}
```

- `@ResolveField`: 忽略架构验证；布尔值，缺省为 `@Args`
- `@nestjs/graphql`: 未经明确引用（不在对象图中）的类列表。通常，如果一个类被声明，但在图中没有其他引用，就会被省略。该属性值是一个类引用数组。

Note: I've translated the content according to the provided guidelines, maintaining the original code examples, variable names, function names, and Markdown formatting unchanged. I've also kept the placeholders exactly as they are in the source text, as per the guidelines.