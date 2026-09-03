<!-- 此文件从 content/graphql/mutations.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-09-03T11:02:07.777Z -->
<!-- 源文件: content/graphql/mutations.md -->

### 变更

大多数关于 GraphQL 的讨论都集中在数据获取上，但任何完整的数据平台也需要一种修改服务端数据的方式。在 REST 中，任何请求都可能在服务端产生副作用，但最佳实践建议我们不应在 GET 请求中修改数据。GraphQL 也是如此 - 从技术上讲，任何查询都可以实现为写入数据。然而，与 REST 一样，建议遵循这样的约定：任何导致写入的操作都应通过变更显式发送（了解更多 [here](https://graphql.org/learn/queries/#变更)）。

官方 [Apollo](https://www.apollographql.com/docs/graphql-tools/generate-schema.html) 文档使用了一个 `upvotePost()` 变更示例。该变更实现了一个方法来增加文章的 `votes` 属性值。要在 Nest 中创建等效的变更，我们将使用 `@Mutation()` 装饰器。

#### 代码优先

让我们在上一节使用的 `AuthorResolver` 中添加另一个方法（参见 [resolvers](/graphql/resolvers)）。

```typescript
@Mutation(() => Post)
async upvotePost(@Args({ name: 'postId', type: () => Int }) postId: number) {
  return this.postsService.upvoteById({ id: postId });
}

```

> info **提示** 所有装饰器（例如 `@Resolver`、`@ResolveField`、`@Args` 等）都从 `@nestjs/graphql` 包中导出。

这将生成以下 SDL 格式的 GraphQL 模式部分：

```graphql
type Mutation {
  upvotePost(postId: Int!): Post
}

```

`upvotePost()` 方法接受 `postId`（`Int`）作为参数，并返回更新后的 `Post` 实体。由于 [resolvers](/graphql/resolvers) 部分中解释的原因，我们必须显式设置预期的类型。

如果变更需要将对象作为参数，我们可以创建一个**输入类型**。输入类型是一种特殊的对象类型，可以作为参数传入（了解更多 [here](https://graphql.org/learn/schema/#input-types)）。要声明输入类型，请使用 `@InputType()` 装饰器。

```typescript
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpvotePostInput {
  @Field()
  postId: number;
}

```

> info **提示** `@InputType()` 装饰器接受一个选项对象作为参数，因此您可以例如指定输入类型的描述。请注意，由于 TypeScript 元数据反射系统的限制，您必须使用 `@Field` 装饰器手动指定类型，或使用 [CLI plugin](/graphql/cli-plugin)。

然后我们可以在解析器类中使用此类型：

```typescript
@Mutation(() => Post)
async upvotePost(
  @Args('upvotePostData') upvotePostData: UpvotePostInput,
) {}

```

#### 模式优先

让我们扩展上一节使用的 `AuthorResolver`（参见 [resolvers](/graphql/resolvers)）。

```typescript
@Mutation()
async upvotePost(@Args('postId') postId: number) {
  return this.postsService.upvoteById({ id: postId });
}

```

请注意，我们在上面假设业务逻辑已移至 `PostsService`（查询文章并增加其 `votes` 属性）。`PostsService` 类内部的逻辑可以根据需要简单或复杂。此示例的主要目的是展示解析器如何与其他提供者交互。

最后一步是将我们的变更添加到现有的类型定义中。

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

`upvotePost(postId: Int!): Post` 变更现在可以作为我们应用程序 GraphQL API 的一部分被调用。