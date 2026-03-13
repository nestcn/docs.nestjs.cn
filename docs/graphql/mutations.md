<!-- 此文件从 content/graphql/mutations.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:47:34.357Z -->
<!-- 源文件: content/graphql/mutations.md -->

### Mutations

GraphQL 的大多数讨论都集中在数据 fetching 上，但任何完整的数据平台都需要一种方式来修改服务器端数据。REST 中，任何请求都可能导致服务器端的 side-effects，但最佳实践建议不要在 GET 请求中修改数据。GraphQL 类似 - 技术上任何查询都可以实现导致数据写入。但是，就像 REST 一样，我们建议遵循惯例，任何修改数据的操作都应该通过明确的 mutation (更多关于 [here](https://graphql.org/learn/queries/#变更) 的信息)。

官方 [Apollo](https://www.apollographql.com/docs/graphql-tools/generate-schema.html) 文档使用了一个 `upvotePost()` mutation 示例。这 mutation 实现了一个方法来增加一个文章的 `votes` 属性值。要在 Nest 中创建一个等价的 mutation，我们将使用 `@Mutation()` 装饰器。

#### 代码优先

让我们在之前的部分中使用的 `AuthorResolver` 中添加另一个方法（见 [resolvers](/graphql/resolvers)）。

```typescript
@Mutation(() => Post)
async upvotePost(@Args({ name: 'postId', type: () => Int }) postId: number) {
  return this.postsService.upvoteById({ id: postId });
}

```

> info **Hint** 所有装饰器（例如 `@Resolver`、`@ResolveField`、`@Args` 等）都来自 `@nestjs/graphql` 包。

这将生成以下部分的 GraphQL schema 在 SDL 中：

```graphql
type Mutation {
  upvotePost(postId: Int!): Post
}

```

`upvotePost()` 方法接受 `postId` (`Int`) 作为参数，并返回一个更新后的 `Post` 实体。根据 [resolvers](/graphql/resolvers) 部分中解释的原因，我们需要明确地设置期望的类型。

如果 mutation 需要接收一个对象作为参数，我们可以创建一个 **输入类型**。输入类型是一个特殊的对象类型，可以作为参数传递（更多关于 [here](https://graphql.org/learn/schema/#input-types) 的信息）。要声明输入类型，使用 `@InputType()` 装饰器。

```typescript
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpvotePostInput {
  @Field()
  postId: number;
}

```

> info **Hint** `@InputType()` 装饰器接受一个选项对象作为参数，因此可以，例如，指定输入类型的描述。由于 TypeScript 的元数据反射系统限制，您必须么使用 `@Field` 装饰器手动指示类型，或者使用 [CLI plugin](/graphql/cli-plugin)。

然后，我们可以在解析器类中使用这个类型：

```typescript
@Mutation(() => Post)
async upvotePost(
  @Args('upvotePostData') upvotePostData: UpvotePostInput,
) {}

```

#### Schema 优先

让我们扩展之前的 `AuthorResolver` (见 [resolvers](/graphql/resolvers)）。

```typescript
@Mutation()
async upvotePost(@Args('postId') postId: number) {
  return this.postsService.upvoteById({ id: postId });
}

```

注意，我们上面假设了业务逻辑已经移到 `PostsService` (查询文章并递增其 `votes` 属性)。逻辑在 `PostsService` 类中可以是简单的还是复杂的。该示例的主要目的是显示解析器如何与其他提供者交互。

最后一步是将我们的 mutation 添加到现有类型定义中。

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

`upvotePost(postId: Int!): Post` mutation 现在可以作为我们的应用程序的 GraphQL API的一部分被调用。