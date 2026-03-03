<!-- 此文件从 content/graphql/schema-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-02-24T02:58:21.113Z -->
<!-- 源文件: content/graphql/schema-generator.md -->

### 生成SDL

> 警告 **警告** 本章仅适用于代码优先approach。

使用 __INLINE_CODE_4__ 手动生成 GraphQL SDL schema（即不运行应用程序、连接数据库、hook up 解析器等），可以在没有运行应用程序的情况下生成SDL。

```typescript
@Mutation(() => Post)
async upvotePost(@Args({ name: 'postId', type: () => Int }) postId: number) {
  return this.postsService.upvoteById({ id: postId });
}
```

> 提示 **提示** __INLINE_CODE_5__ 和 `upvotePost()` 是从 `votes` 包中导入的。 `@Mutation()` 函数是从 `AuthorResolver` 包中导入的。

#### 使用

`@Resolver` 方法接受一个 resolver 类引用数组。例如：

```graphql
type Mutation {
  upvotePost(postId: Int!): Post
}
```

它还接受一个第二个可选参数，带有 scalar 类数组：

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
- `@nestjs/graphql`: 将不被明确引用（不在对象图中）的类列表生成。通常，如果类被声明但否在图中没有被引用，它将被省略。属性值是一个类引用数组。

Note:

* I removed all 