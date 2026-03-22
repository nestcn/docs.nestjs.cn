<!-- 此文件从 content/graphql/subscriptions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T13:42:20.368Z -->
<!-- 源文件: content/graphql/subscriptions.md -->

### 订阅

除了使用查询获取数据和使用变更修改数据外，GraphQL 规范还支持第三种操作类型，称为 `subscription`。GraphQL 订阅是一种将数据从服务器推送到选择监听服务器实时消息的客户端的方式。订阅与查询类似，它们指定要传递给客户端的一组字段，但不是立即返回单个答案，而是打开一个通道，并在服务器上发生特定事件时将结果发送到客户端。

订阅的一个常见用例是通知客户端特定事件，例如创建新对象、更新字段等（在[这里](https://www.apollographql.com/docs/react/data/subscriptions)阅读更多）。

#### 使用 Apollo 驱动启用订阅

要启用订阅，请将 `installSubscriptionHandlers` 属性设置为 `true`。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  installSubscriptionHandlers: true,
}),

```

:::warning 警告
`installSubscriptionHandlers` 配置选项已从最新版本的 Apollo 服务器中删除，并且很快也会在此包中弃用。默认情况下，`installSubscriptionHandlers` 将回退使用 `subscriptions-transport-ws`（[阅读更多](https://github.com/apollographql/subscriptions-transport-ws)），但我们强烈建议改用 `graphql-ws`（[阅读更多](https://github.com/enisdenjo/graphql-ws)）库。
:::

要切换到使用 `graphql-ws` 包，请使用以下配置：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  subscriptions: {
    'graphql-ws': true
  },
}),

```

:::info 提示
你也可以同时使用两个包（`subscriptions-transport-ws` 和 `graphql-ws`），例如为了向后兼容。
:::

#### 代码优先

要使用代码优先方法创建订阅，我们使用 `@Subscription()` 装饰器（从 `@nestjs/graphql` 包导出）和 `graphql-subscriptions` 包中的 `PubSub` 类，它提供了一个简单的**发布/订阅 API**。

以下订阅处理程序通过调用 `PubSub#asyncIterableIterator` 来**订阅**事件。此方法接受一个参数 `triggerName`，对应于事件主题名称。

```typescript
const pubSub = new PubSub();

@Resolver(() => Author)
export class AuthorResolver {
  // ...
  @Subscription(() => Comment)
  commentAdded() {
    return pubSub.asyncIterableIterator('commentAdded');
  }
}

```

:::info 提示
所有装饰器都从 `@nestjs/graphql` 包导出，而 `PubSub` 类从 `graphql-subscriptions` 包导出。
:::

:::warning 注意
`PubSub` 是一个暴露简单 `publish` 和 `subscribe API` 的类。在[这里](https://www.apollographql.com/docs/graphql-subscriptions/setup.html)阅读更多相关信息。请注意，Apollo 文档警告默认实现不适合生产（在[这里](https://github.com/apollographql/graphql-subscriptions#getting-started-with-your-first-subscription)阅读更多）。生产应用程序应使用由外部存储支持的 `PubSub` 实现（在[这里](https://github.com/apollographql/graphql-subscriptions#pubsub-implementations)阅读更多）。
:::

这将导致在 SDL 中生成 GraphQL 架构的以下部分：

```graphql
type Subscription {
  commentAdded(): Comment!
}

```

请注意，根据定义，订阅返回一个对象，该对象具有单个顶级属性，其键是订阅的名称。此名称要么从订阅处理程序方法的名称继承（即上面的 `commentAdded`），要么通过将带有键 `name` 的选项作为第二个参数传递给 `@Subscription()` 装饰器来显式提供，如下所示。

```typescript
@Subscription(() => Comment, {
  name: 'commentAdded',
})
subscribeToCommentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

此构造生成与前面代码示例相同的 SDL，但允许我们将方法名称与订阅分离。

#### 发布

现在，要发布事件，我们使用 `PubSub#publish` 方法。这通常在变更中使用，以便在对象图的一部分发生更改时触发客户端更新。例如：

```typescript
@Mutation(() => Comment)
async addComment(
  @Args('postId', { type: () => Int }) postId: number,
  @Args('comment', { type: () => Comment }) comment: CommentInput,
) {
  const newComment = this.commentsService.addComment({ id: postId, comment });
  pubSub.publish('commentAdded', { commentAdded: newComment });
  return newComment;
}

```

`PubSub#publish` 方法将 `triggerName`（再次，将其视为事件主题名称）作为第一个参数，将事件负载作为第二个参数。如前所述，根据定义，订阅返回一个值，该值具有形状。再次查看我们 `commentAdded` 订阅生成的 SDL：

```graphql
type Subscription {
  commentAdded(): Comment!
}

```

这告诉我们订阅必须返回一个对象，该对象具有 `commentAdded` 的顶级属性名称，其值是 `Comment` 对象。需要注意的重要一点是，`PubSub#publish` 方法发出的事件负载的形状必须与订阅预期返回的值的形状相对应。因此，在上面的示例中，`pubSub.publish('commentAdded', {{ '{' }} commentAdded: newComment {{ '}' }})` 语句发布具有适当形状负载的 `commentAdded` 事件。如果这些形状不匹配，你的订阅将在 GraphQL 验证阶段失败。

#### 过滤订阅

要过滤掉特定事件，请将 `filter` 属性设置为过滤函数。此函数类似于传递给数组 `filter` 的函数。它接受两个参数：包含事件负载的 `payload`（由事件发布者发送）和接受订阅请求期间传递的任何参数的 `variables`。它返回一个布尔值，确定是否应将此事件发布给客户端监听器。

```typescript
@Subscription(() => Comment, {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded(@Args('title') title: string) {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

#### 变更订阅负载

要变更已发布的事件负载，请将 `resolve` 属性设置为一个函数。该函数接收事件负载（由事件发布者发送）并返回适当的值。

```typescript
@Subscription(() => Comment, {
  resolve: value => value,
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

:::warning 注意
如果你使用 `resolve` 选项，你应该返回未包装的负载（例如，在我们的示例中，直接返回 `newComment` 对象，而不是 `{{ '{' }} commentAdded: newComment {{ '}' }}` 对象）。
:::

如果你需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造。

```typescript
@Subscription(() => Comment, {
  resolve(this: AuthorResolver, value) {
    // "this" 指的是 "AuthorResolver" 的实例
    return value;
  }
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

相同的构造适用于过滤器：

```typescript
@Subscription(() => Comment, {
  filter(this: AuthorResolver, payload, variables) {
    // "this" 指的是 "AuthorResolver" 的实例
    return payload.commentAdded.title === variables.title;
  }
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

#### 架构优先

要在 Nest 中创建等效的订阅，我们将使用 `@Subscription()` 装饰器。

```typescript
const pubSub = new PubSub();

@Resolver('Author')
export class AuthorResolver {
  // ...
  @Subscription()
  commentAdded() {
    return pubSub.asyncIterableIterator('commentAdded');
  }
}

```

要根据上下文和参数过滤掉特定事件，请设置 `filter` 属性。

```typescript
@Subscription('commentAdded', {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

要变更已发布的负载，我们可以使用 `resolve` 函数。

```typescript
@Subscription('commentAdded', {
  resolve: value => value,
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

如果你需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造：

```typescript
@Subscription('commentAdded', {
  resolve(this: AuthorResolver, value) {
    // "this" 指的是 "AuthorResolver" 的实例
    return value;
  }
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

相同的构造适用于过滤器：

```typescript
@Subscription('commentAdded', {
  filter(this: AuthorResolver, payload, variables) {
    // "this" 指的是 "AuthorResolver" 的实例
    return payload.commentAdded.title === variables.title;
  }
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

最后一步是更新类型定义文件。

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

type Comment {
  id: String
  content: String
}

type Subscription {
  commentAdded(title: String!): Comment
}

```

这样，我们就创建了一个 `commentAdded(title: String!): Comment` 订阅。你可以在[这里](https://github.com/nestjs/nest/blob/master/sample/12-graphql-schema-first)找到完整的示例实现。

#### PubSub

我们在上面实例化了一个本地 `PubSub` 实例。首选方法是将 `PubSub` 定义为[提供者](/fundamentals/dependency-injection)并通过构造函数注入它（使用 `@Inject()` 装饰器）。这允许我们在整个应用程序中重用该实例。例如，按如下方式定义提供者，然后在需要的地方注入 `'PUB_SUB'`。

```typescript
{
  provide: 'PUB_SUB',
  useValue: new PubSub(),
}

```

#### 自定义订阅服务器

要自定义订阅服务器（例如，更改路径），请使用 `subscriptions` 选项属性。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  subscriptions: {
    'subscriptions-transport-ws': {
      path: '/graphql'
    },
  }
}),

```

如果你使用 `graphql-ws` 包进行订阅，请将 `subscriptions-transport-ws` 键替换为 `graphql-ws`，如下所示：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  subscriptions: {
    'graphql-ws': {
      path: '/graphql'
    },
  }
}),

```

#### 通过 WebSocket 进行身份验证

检查用户是否已通过身份验证可以在 `subscriptions` 选项中指定的 `onConnect` 回调函数内完成。

`onConnect` 将接收传递给 `SubscriptionClient` 的 `connectionParams` 作为第一个参数（[阅读更多](https://www.apollographql.com/docs/react/data/subscriptions/#5-authenticate-over-websocket-optional)）。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  subscriptions: {
    'subscriptions-transport-ws': {
      onConnect: (connectionParams) => {
        const authToken = connectionParams.authToken;
        if (!isValid(authToken)) {
          throw new Error('Token is not valid');
        }
        // 从令牌中提取用户信息
        const user = parseToken(authToken);
        // 返回用户信息以便稍后将它们添加到上下文中
        return { user };
      },
    }
  },
  context: ({ connection }) => {
    // connection.context 将等于 "onConnect" 回调返回的内容
  },
}),

```

此示例中的 `authToken` 仅在首次建立连接时由客户端发送一次。
使用此连接进行的所有订阅都将具有相同的 `authToken`，因此具有相同的用户信息。

:::warning 注意
`subscriptions-transport-ws` 中存在一个错误，允许连接跳过 `onConnect` 阶段（[阅读更多](https://github.com/apollographql/subscriptions-transport-ws/issues/349)）。你不应该假设在用户开始订阅时调用了 `onConnect`，并且始终检查 `context` 是否已填充。
:::

如果你使用 `graphql-ws` 包，`onConnect` 回调的签名会略有不同：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  subscriptions: {
    'graphql-ws': {
      onConnect: (context: Context<any>) => {
        const { connectionParams, extra } = context;
        // 用户验证将与上面的示例相同
        // 与 graphql-ws 一起使用时，额外的上下文值应存储在 extra 字段中
        extra.user = { user: {} };
      },
    },
  },
  context: ({ extra }) => {
    // 你现在可以通过 extra 字段访问你的额外上下文值
  },
});

```

#### 使用 Mercurius 驱动启用订阅

要启用订阅，请将 `subscription` 属性设置为 `true`。

```typescript
GraphQLModule.forRoot<MercuriusDriverConfig>({
  driver: MercuriusDriver,
  subscription: true,
}),

```

:::info 提示
你也可以传递选项对象来设置自定义发射器、验证传入连接等。在[这里](https://github.com/mercurius-js/mercurius/blob/master/docs/api/options.md#plugin-options)阅读更多（参见 `subscription`）。
:::

#### 代码优先

要使用代码优先方法创建订阅，我们使用 `@Subscription()` 装饰器（从 `@nestjs/graphql` 包导出）和 `mercurius` 包中的 `PubSub` 类，它提供了一个简单的**发布/订阅 API**。

以下订阅处理程序通过调用 `PubSub#asyncIterableIterator` 来**订阅**事件。此方法接受一个参数 `triggerName`，对应于事件主题名称。

```typescript
@Resolver(() => Author)
export class AuthorResolver {
  // ...
  @Subscription(() => Comment)
  commentAdded(@Context('pubsub') pubSub: PubSub) {
    return pubSub.subscribe('commentAdded');
  }
}

```

:::info 提示
上例中使用的所有装饰器都从 `@nestjs/graphql` 包导出，而 `PubSub` 类从 `mercurius` 包导出。
:::

:::warning 注意
`PubSub` 是一个暴露简单 `publish` 和 `subscribe` API 的类。查看[此部分](https://github.com/mercurius-js/mercurius/blob/master/docs/subscriptions.md#subscriptions-with-custom-pubsub)了解如何注册自定义 `PubSub` 类。
:::

这将导致在 SDL 中生成 GraphQL 架构的以下部分：

```graphql
type Subscription {
  commentAdded(): Comment!
}

```

请注意，根据定义，订阅返回一个对象，该对象具有单个顶级属性，其键是订阅的名称。此名称要么从订阅处理程序方法的名称继承（即上面的 `commentAdded`），要么通过将带有键 `name` 的选项作为第二个参数传递给 `@Subscription()` 装饰器来显式提供，如下所示。

```typescript
@Subscription(() => Comment, {
  name: 'commentAdded',
})
subscribeToCommentAdded(@Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}

```

此构造生成与前面代码示例相同的 SDL，但允许我们将方法名称与订阅分离。

#### 发布

现在，要发布事件，我们使用 `PubSub#publish` 方法。这通常在变更中使用，以便在对象图的一部分发生更改时触发客户端更新。例如：

```typescript
@Mutation(() => Comment)
async addComment(
  @Args('postId', { type: () => Int }) postId: number,
  @Args('comment', { type: () => Comment }) comment: CommentInput,
  @Context('pubsub') pubSub: PubSub,
) {
  const newComment = this.commentsService.addComment({ id: postId, comment });
  await pubSub.publish({
    topic: 'commentAdded',
    payload: {
      commentAdded: newComment
    }
  });
  return newComment;
}

```

如前所述，根据定义，订阅返回一个值，该值具有形状。再次查看我们 `commentAdded` 订阅生成的 SDL：

```graphql
type Subscription {
  commentAdded(): Comment!
}

```

这告诉我们订阅必须返回一个对象，该对象具有 `commentAdded` 的顶级属性名称，其值是 `Comment` 对象。需要注意的重要一点是，`PubSub#publish` 方法发出的事件负载的形状必须与订阅预期返回的值的形状相对应。因此，在上面的示例中，`pubSub.publish({{ '{' }} topic: 'commentAdded', payload: {{ '{' }} commentAdded: newComment {{ '}' }} {{ '}' }})` 语句发布具有适当形状负载的 `commentAdded` 事件。如果这些形状不匹配，你的订阅将在 GraphQL 验证阶段失败。

#### 过滤订阅

要过滤掉特定事件，请将 `filter` 属性设置为过滤函数。此函数类似于传递给数组 `filter` 的函数。它接受两个参数：包含事件负载的 `payload`（由事件发布者发送）和接受订阅请求期间传递的任何参数的 `variables`。它返回一个布尔值，确定是否应将此事件发布给客户端监听器。

```typescript
@Subscription(() => Comment, {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded(@Args('title') title: string, @Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}

```

如果你需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造。

```typescript
@Subscription(() => Comment, {
  filter(this: AuthorResolver, payload, variables) {
    // "this" 指的是 "AuthorResolver" 的实例
    return payload.commentAdded.title === variables.title;
  }
})
commentAdded(@Args('title') title: string, @Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}

```

#### 架构优先

要在 Nest 中创建等效的订阅，我们将使用 `@Subscription()` 装饰器。

```typescript
const pubSub = new PubSub();

@Resolver('Author')
export class AuthorResolver {
  // ...
  @Subscription()
  commentAdded(@Context('pubsub') pubSub: PubSub) {
    return pubSub.subscribe('commentAdded');
  }
}

```

要根据上下文和参数过滤掉特定事件，请设置 `filter` 属性。

```typescript
@Subscription('commentAdded', {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded(@Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}

```

如果你需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造：

```typescript
@Subscription('commentAdded', {
  filter(this: AuthorResolver, payload, variables) {
    // "this" 指的是 "AuthorResolver" 的实例
    return payload.commentAdded.title === variables.title;
  }
})
commentAdded(@Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}

```

最后一步是更新类型定义文件。

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

type Comment {
  id: String
  content: String
}

type Subscription {
  commentAdded(title: String!): Comment
}

```

这样，我们就创建了一个 `commentAdded(title: String!): Comment` 订阅。

#### PubSub

在上面的示例中，我们使用了默认的 `PubSub` 发射器（[mqemitter](https://github.com/mcollina/mqemitter)）
首选方法（用于生产）是使用 `mqemitter-redis`。或者，可以提供自定义 `PubSub` 实现（在[这里](https://github.com/mercurius-js/mercurius/blob/master/docs/subscriptions.md)阅读更多）

```typescript
GraphQLModule.forRoot<MercuriusDriverConfig>({
  driver: MercuriusDriver,
  subscription: {
    emitter: require('mqemitter-redis')({
      port: 6579,
      host: '127.0.0.1',
    }),
  },
});

```

#### 通过 WebSocket 进行身份验证

检查用户是否已通过身份验证可以在 `subscription` 选项中指定的 `verifyClient` 回调函数内完成。

`verifyClient` 将接收 `info` 对象作为第一个参数，你可以使用它来检索请求的标头。

```typescript
GraphQLModule.forRoot<MercuriusDriverConfig>({
  driver: MercuriusDriver,
  subscription: {
    verifyClient: (info, next) => {
      const authorization = info.req.headers?.authorization as string;
      if (!authorization?.startsWith('Bearer ')) {
        return next(false);
      }
      next(true);
    },
  }
}),

```
