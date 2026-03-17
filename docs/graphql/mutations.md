<!-- 此文件从 content/graphql/mutations.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:25:29.794Z -->
<!-- 源文件: content/graphql/mutations.md -->

### Mutations

大多数 GraphQL 话题都集中在数据 fetching 上，但是任何完整的数据平台都需要一种方式来修改服务器端数据。REST 中，任何请求都可能导致服务器端的 side-effects，但是最佳实践建议我们 shouldn't 在 GET 请求中修改数据。GraphQL 类似 - 技术上任何查询都可以实现以写入数据的方式，但是像 REST 一样，我们建议遵循惯例，任何导致写入数据的操作都应该通过明确的 mutation 发送（阅读更多关于 [here](https://graphql.org/learn/queries/#变更)）。

官方 [Apollo](https://www.apollographql.com/docs/graphql-tools/generate-schema.html) 文档使用了一个 `upvotePost()` mutation 示例。这个 mutation 实现了一个方法，以增加一个帖子的 `votes` 属性值。要在 Nest 中实现等效的 mutation，我们将使用 `@Mutation()` 装饰器。

#### 代码 first

让我们添加另一个方法到之前章节中使用的 `AuthorResolver` 中（见 [resolvers](/graphql/resolvers)）。

```typescript
@Mutation(() => Post)
async upvotePost(@Args({ name: 'postId', type: () => Int }) postId: number) {
  return this.postsService.upvoteById({ id: postId });
}

```

> 提示 **Hint** 所有装饰器（例如 `@Resolver`、`@ResolveField`、`@Args` 等）都来自 `@nestjs/graphql` 包。

这将生成以下部分 GraphQL schema 在 SDL 中：

```graphql
type Mutation {
  upvotePost(postId: Int!): Post
}

```

`upvotePost()` 方法以 `postId` (`Int`) 作为参数，并返回一个更新后的 `Post` 实体。根据 [resolvers](/graphql/resolvers) 部分所解释的原因，我们需要明确地设置期望的类型。

如果 mutation 需要以对象作为参数，我们可以创建一个 **input type**。输入类型是一个特殊的对象类型，可以作为参数传递（阅读更多关于 [here](https://graphql.org/learn/schema/#input-types)）。要声明输入类型，使用 `@InputType()` 装饰器。

```typescript
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpvotePostInput {
  @Field()
  postId: number;
}

```

> 提示 **Hint** `@InputType()` 装饰器需要一个选项对象作为参数，因此您可以，例如，指定输入类型的描述。注意，由于 TypeScript 的元数据反射系统限制，您必须使用 `@Field` 装饰器手动指示类型，或者使用 [CLI plugin](/graphql/cli-plugin)。

然后，我们可以在 resolver 类中使用这个类型：

```typescript
@Mutation(() => Post)
async upvotePost(
  @Args('upvotePostData') upvotePostData: UpvotePostInput,
) {}

```

#### Schema first

让我们扩展之前章节中使用的 `AuthorResolver`（见 [resolvers](/graphql/resolvers)）。

```typescript
@Mutation()
async upvotePost(@Args('postId') postId: number) {
  return this.postsService.upvoteById({ id: postId });
}

```

注意，我们上面假设了业务逻辑已经移到 `PostsService` 中（查询帖子并增加其 `votes` 属性值）。`PostsService` 类中的逻辑可以简单或复杂到需要。主要的目的这只是为了展示 resolver 如何与其他提供者交互。

最后一步是添加我们的 mutation 到现有的类型定义中。

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