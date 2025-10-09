### 变更操作

大多数关于 GraphQL 的讨论都集中在数据获取上，但任何完整的数据平台都需要有修改服务器端数据的方法。在 REST 中，任何请求都可能对服务器产生副作用，但最佳实践建议我们不应在 GET 请求中修改数据。GraphQL 类似——从技术上讲，任何查询都可以实现为导致数据写入的操作。然而，与 REST 一样，建议遵循这样的约定：任何导致写入的操作都应通过变更操作显式发送（了解更多[此处](https://graphql.org/learn/queries/#变更) ）。

官方 [Apollo](https://www.apollographql.com/docs/graphql-tools/generate-schema.html) 文档使用了 `upvotePost()` 变更操作示例。该变更实现了一个增加帖子 `votes` 属性值的方法。要在 Nest 中创建等效的变更操作，我们将使用 `@Mutation()` 装饰器。

#### 代码优先

让我们在前一节使用的 `AuthorResolver` 中添加另一个方法（参见[解析器](/graphql/resolvers) ）。

```typescript
@Mutation(() => Post)
async upvotePost(@Args({ name: 'postId', type: () => Int }) postId: number) {
  return this.postsService.upvoteById({ id: postId });
}
```

:::info 提示
所有装饰器（例如 `@Resolver`、`@ResolveField`、`@Args` 等）均从 `@nestjs/graphql` 包中导出。
:::

这将生成以下 GraphQL 模式定义语言(SDL)部分：

```graphql
type Mutation {
  upvotePost(postId: Int!): Post
}
```

`upvotePost()` 方法接收 `postId`（`Int` 类型）作为参数，并返回更新后的 `Post` 实体。出于在 [解析器](/graphql/resolvers) 章节中解释的原因，我们必须显式设置预期类型。

如果变更操作需要接收对象作为参数，我们可以创建一个 **输入类型** 。输入类型是一种特殊的对象类型，可以作为参数传递（了解更多 [此处](https://graphql.org/learn/schema/#input-types) ）。要声明输入类型，请使用 `@InputType()` 装饰器。

```typescript
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpvotePostInput {
  @Field()
  postId: number;
}
```

:::info 提示
`@InputType()` 装饰器接收一个选项对象作为参数，因此您可以指定输入类型的描述等信息。请注意，由于 TypeScript 元数据反射系统的限制，您必须使用 `@Field` 装饰器手动指定类型，或者使用 [CLI 插件](/graphql/cli-plugin) 。
:::

我们可以在解析器类中使用此类型：

```typescript
@Mutation(() => Post)
async upvotePost(
  @Args('upvotePostData') upvotePostData: UpvotePostInput,
) {}
```

#### 模式优先

让我们扩展上一节中使用的 `AuthorResolver`（参见[解析器](/graphql/resolvers) ）。

```typescript
@Mutation()
async upvotePost(@Args('postId') postId: number) {
  return this.postsService.upvoteById({ id: postId });
}
```

请注意，我们假设业务逻辑已移至 `PostsService`（查询帖子并增加其 `votes` 属性）。`PostsService` 类中的逻辑可以根据需要简单或复杂。这个示例的主要目的是展示解析器如何与其他提供者交互。

最后一步是将我们的变更操作添加到现有的类型定义中。

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post]
}

type Post {
  id: Int!
  title: String
  votes: Int
}

type Query {
  author(id: Int!): Author
}

type Mutation {
  upvotePost(postId: Int!): Post
}
```

《Immersive Translate》 现在可以通过我们应用程序的 GraphQL API 调用 `upvotePost(postId: Int!): Post` 变异操作。
