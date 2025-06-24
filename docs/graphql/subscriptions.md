### 订阅功能

除了通过查询获取数据和使用变更修改数据外，GraphQL 规范还支持第三种操作类型，称为 `subscription`。GraphQL 订阅是一种将数据从服务器推送到选择监听服务器实时消息的客户端的方式。订阅与查询类似，都需要指定一组返回给客户端的字段，但它不会立即返回单个结果，而是打开一个通道，每当服务器上发生特定事件时，就会向客户端发送结果。

订阅的常见用例包括通知客户端特定事件，例如新对象的创建、字段更新等（更多信息请参阅[此处](https://www.apollographql.com/docs/react/data/subscriptions) ）。

#### 启用 Apollo 驱动器的订阅功能

要启用订阅功能，请将 `installSubscriptionHandlers` 属性设置为 `true`。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  installSubscriptionHandlers: true,
}),
```

> warning **注意** `installSubscriptionHandlers` 配置选项已在最新版 Apollo 服务器中移除，并即将在本包中弃用。默认情况下，`installSubscriptionHandlers` 会回退使用 `subscriptions-transport-ws`( [了解更多](https://github.com/apollographql/subscriptions-transport-ws) )，但我们强烈建议改用 `graphql-ws`( [了解更多](https://github.com/enisdenjo/graphql-ws) )库。

要切换使用 `graphql-ws` 包，请使用以下配置：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  subscriptions: {
    'graphql-ws': true
  },
}),
```

> info **说明** 您也可以同时使用两个包（`subscriptions-transport-ws` 和 `graphql-ws`），例如为了保持向后兼容性。

#### 代码优先

要使用代码优先方式创建订阅，我们使用来自 `@nestjs/graphql` 包的 `@Subscription()` 装饰器，以及来自 `graphql-subscriptions` 包的 `PubSub` 类，后者提供了简单的**发布/订阅 API**。

以下订阅处理器通过调用 `PubSub#asyncIterableIterator` 方法来**订阅**事件。该方法接收单个参数 `triggerName`，对应事件主题名称。

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

> **提示** 所有装饰器都从 `@nestjs/graphql` 包导出，而 `PubSub` 类则从 `graphql-subscriptions` 包导出。

> warning **注意** `PubSub` 是一个提供简单 `发布` 和 `订阅 API` 的类。了解更多信息请点击 [此处](https://www.apollographql.com/docs/graphql-subscriptions/setup.html) 。请注意 Apollo 文档警告默认实现不适合生产环境（详见 [此处](https://github.com/apollographql/graphql-subscriptions#getting-started-with-your-first-subscription) ）。生产环境应用应使用由外部存储支持的 `PubSub` 实现（详见 [此处](https://github.com/apollographql/graphql-subscriptions#pubsub-implementations) ）。

这将生成以下 GraphQL 模式定义语言(SDL)部分：

```graphql
type Subscription {
  commentAdded(): Comment!
}
```

请注意，订阅根据定义会返回一个对象，该对象具有单个顶级属性，其键是订阅的名称。此名称要么继承自订阅处理方法名称（如上面的 `commentAdded`），要么通过将带有 `name` 键的选项作为第二个参数传递给 `@Subscription()` 装饰器来显式提供，如下所示。

```typescript
@Subscription(() => Comment, {
  name: 'commentAdded',
})
subscribeToCommentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}
```

此结构生成与之前代码示例相同的 SDL，但允许我们将方法名称与订阅解耦。

#### 发布

现在，要发布事件，我们使用 `PubSub#publish` 方法。这通常在变更操作中使用，当对象图的部分发生改变时触发客户端更新。例如：

```typescript
@@filename(posts/posts.resolver)
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

`PubSub#publish` 方法接收 `triggerName`（可理解为事件主题名称）作为第一个参数，事件负载作为第二个参数。如前所述，订阅定义会返回一个具有特定结构的返回值。再看一下我们 `commentAdded` 订阅生成的 SDL：

```graphql
type Subscription {
  commentAdded(): Comment!
}
```

这表明订阅必须返回一个顶层属性名为 `commentAdded` 的对象，其值为 `Comment` 对象。关键点在于：`PubSub#publish` 方法发出的事件负载结构必须与订阅预期的返回值结构相对应。因此在上例中， `pubSub.publish('commentAdded', {{ '{' }} commentAdded: newComment {{ '}' }})` 语句发布了带有正确结构负载的 `commentAdded` 事件。如果结构不匹配，您的订阅将在 GraphQL 验证阶段失败。

#### 过滤订阅内容

要过滤特定事件，请将 `filter` 属性设置为一个过滤函数。该函数类似于传递给数组 `filter` 的函数，它接收两个参数：包含事件负载的 `payload`（由事件发布者发送）和 `variables`（包含订阅请求期间传入的任何参数），并返回一个布尔值以确定是否应向客户端监听器发布此事件。

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

要修改已发布的事件负载，请将 `resolve` 属性设置为一个函数。该函数接收事件负载（由事件发布者发送）并返回适当的值。

```typescript
@Subscription(() => Comment, {
  resolve: value => value,
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}
```

> warning **注意** 如果使用 `resolve` 选项，应当返回未经包装的有效载荷（例如在我们的示例中，直接返回 `newComment` 对象，而非 `{{ '{' }} commentAdded: newComment {{ '}' }}` 对象）。

如需访问注入的提供程序（例如使用外部服务验证数据），请采用以下构造方式。

```typescript
@Subscription(() => Comment, {
  resolve(this: AuthorResolver, value) {
    // "this" refers to an instance of "AuthorResolver"
    return value;
  }
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}
```

同样的构造方式适用于过滤器：

```typescript
@Subscription(() => Comment, {
  filter(this: AuthorResolver, payload, variables) {
    // "this" refers to an instance of "AuthorResolver"
    return payload.commentAdded.title === variables.title;
  }
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}
```

#### 模式优先

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

要根据上下文和参数筛选特定事件，请设置 `filter` 属性。

```typescript
@Subscription('commentAdded', {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}
```

要修改已发布的载荷数据，我们可以使用 `resolve` 函数。

```typescript
@Subscription('commentAdded', {
  resolve: value => value,
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}
```

如需访问注入的提供程序（例如使用外部服务验证数据），请使用以下构造：

```typescript
@Subscription('commentAdded', {
  resolve(this: AuthorResolver, value) {
    // "this" refers to an instance of "AuthorResolver"
    return value;
  }
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}
```

相同的构造也适用于过滤器：

```typescript
@Subscription('commentAdded', {
  filter(this: AuthorResolver, payload, variables) {
    // "this" refers to an instance of "AuthorResolver"
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

至此，我们已经创建了一个 `commentAdded(title: String!): Comment` 订阅。你可以在此处查看完整的示例实现 [here](https://github.com/nestjs/nest/blob/master/sample/12-graphql-schema-first)。

#### PubSub

我们在上面实例化了一个本地 `PubSub` 实例。推荐的做法是将 `PubSub` 定义为 [provider](/fundamentals/custom-providers) 并通过构造函数注入（使用 `@Inject()` 装饰器）。这样我们就可以在整个应用程序中重用该实例。例如，按如下方式定义一个 provider，然后在需要的地方注入 `'PUB_SUB'`。

```typescript
{
  provide: 'PUB_SUB',
  useValue: new PubSub(),
}
```

#### 自定义订阅服务器

要自定义订阅服务器（例如更改路径），请使用 `subscriptions` 选项属性。

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

如果您使用 `graphql-ws` 包进行订阅，请将 `subscriptions-transport-ws` 键替换为 `graphql-ws`，如下所示：

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

检查用户是否已认证可在 `onConnect` 回调函数中完成，该函数可在 `subscriptions` 选项中指定。

`onConnect` 将接收作为第一个参数的 `connectionParams`，该参数被传递给 `SubscriptionClient`（ [了解更多](https://www.apollographql.com/docs/react/data/subscriptions/#5-authenticate-over-websocket-optional) ）。

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
        // extract user information from token
        const user = parseToken(authToken);
        // return user info to add them to the context later
        return { user };
      },
    }
  },
  context: ({ connection }) => {
    // connection.context will be equal to what was returned by the "onConnect" callback
  },
}),
```

本例中的 `authToken` 仅在连接首次建立时由客户端发送一次。使用此连接进行的所有订阅都将具有相同的 `authToken`，因此也具有相同的用户信息。

> warning **注意** `subscriptions-transport-ws` 中存在一个漏洞，允许连接跳过 `onConnect` 阶段（ [了解更多](https://github.com/apollographql/subscriptions-transport-ws/issues/349) ）。不应假设用户开始订阅时已调用 `onConnect`，而应始终检查 `context` 是否已填充。

如果你使用的是 `graphql-ws` 包，`onConnect` 回调函数的签名会略有不同：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  subscriptions: {
    'graphql-ws': {
      onConnect: (context: Context<any>) => {
        const { connectionParams, extra } = context;
        // user validation will remain the same as in the example above
        // when using with graphql-ws, additional context value should be stored in the extra field
        extra.user = { user: {} };
      },
    },
  },
  context: ({ extra }) => {
    // you can now access your additional context value through the extra field
  },
});
```

#### 启用 Mercurius 驱动的订阅功能

要启用订阅功能，请将 `subscription` 属性设置为 `true`。

```typescript
GraphQLModule.forRoot<MercuriusDriverConfig>({
  driver: MercuriusDriver,
  subscription: true,
}),
```

> **提示** 你也可以传递选项对象来设置自定义发射器、验证传入连接等。更多信息请参阅 [此处](https://github.com/mercurius-js/mercurius/blob/master/docs/api/options.md#plugin-options) （参见 `subscription`）。

#### 代码优先

要使用代码优先方式创建订阅，我们使用从 `@nestjs/graphql` 包导出的 `@Subscription()` 装饰器，以及来自 `mercurius` 包的 `PubSub` 类，后者提供了简单的**发布/订阅 API**。

以下订阅处理器通过调用 `PubSub#asyncIterableIterator` 来处理**订阅**事件。该方法接收单个参数 `triggerName`，对应事件主题名称。

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

> info **注意** 上例中使用的所有装饰器都从 `@nestjs/graphql` 包导出，而 `PubSub` 类则从 `mercurius` 包导出。

> warning **注意** `PubSub` 是一个暴露简单 `publish` 和 `subscribe` API 的类。查看[本节](https://github.com/mercurius-js/mercurius/blob/master/docs/subscriptions.md#subscriptions-with-custom-pubsub)了解如何注册自定义 `PubSub` 类。

这将生成以下 GraphQL 模式定义语言(SDL)部分：

```graphql
type Subscription {
  commentAdded(): Comment!
}
```

请注意，订阅（subscription）按其定义会返回一个对象，该对象包含一个顶级属性，其键名即为订阅名称。此名称要么继承自订阅处理方法本身的名称（如上例中的 `commentAdded`），要么通过向 `@Subscription()` 装饰器传入第二个参数——包含 `name` 键的选项来显式指定，如下所示。

```typescript
@Subscription(() => Comment, {
  name: 'commentAdded',
})
subscribeToCommentAdded(@Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}
```

这种结构生成的 SDL 与之前代码示例相同，但允许我们将方法名与订阅解耦。

#### 发布事件

现在，要发布事件，我们使用 `PubSub#publish` 方法。这通常用于在对象图的某部分发生变更时，通过某个 mutation 触发客户端更新。例如：

```typescript
@@filename(posts/posts.resolver)
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

如前所述，订阅操作按其定义会返回一个值，且该值具有特定结构。让我们再次查看为 `commentAdded` 订阅生成的 SDL：

```graphql
type Subscription {
  commentAdded(): Comment!
}
```

这表明订阅必须返回一个顶级属性名为 `commentAdded` 的对象，其值为 `Comment` 对象。关键点在于：`PubSub#publish` 方法发出的事件负载结构必须与订阅期望返回值的结构相对应。因此在上例中， `pubSub.publish({{ '{' }} topic: 'commentAdded', payload: {{ '{' }} commentAdded: newComment {{ '}' }} {{ '}' }})` 语句发布的 `commentAdded` 事件带有正确结构的负载。若结构不匹配，订阅将在 GraphQL 验证阶段失败。

#### 订阅过滤

要过滤特定事件，请将 `filter` 属性设置为一个过滤函数。该函数类似于传递给数组 `filter` 的函数，它接收两个参数：包含事件负载的 `payload`（由事件发布者发送）和包含订阅请求期间传入参数的 `variables`，并返回一个布尔值决定是否应向客户端监听器发布该事件。

```typescript
@Subscription(() => Comment, {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded(@Args('title') title: string, @Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}
```

如需访问注入的提供程序（例如使用外部服务验证数据），请使用以下构造方式。

```typescript
@Subscription(() => Comment, {
  filter(this: AuthorResolver, payload, variables) {
    // "this" refers to an instance of "AuthorResolver"
    return payload.commentAdded.title === variables.title;
  }
})
commentAdded(@Args('title') title: string, @Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}
```

#### 模式优先

要在 Nest 中创建等效订阅，我们将使用 `@Subscription()` 装饰器。

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

要根据上下文和参数过滤特定事件，请设置 `filter` 属性。

```typescript
@Subscription('commentAdded', {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded(@Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}
```

如需访问注入的提供程序（例如使用外部服务验证数据），请使用以下结构：

```typescript
@Subscription('commentAdded', {
  filter(this: AuthorResolver, payload, variables) {
    // "this" refers to an instance of "AuthorResolver"
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

至此，我们已经创建了一个 `commentAdded(title: String!): Comment` 订阅。

#### PubSub

在上述示例中，我们使用了默认的 `PubSub` 发射器([mqemitter](https://github.com/mcollina/mqemitter))。推荐的生产环境做法是使用 `mqemitter-redis`。或者，也可以提供自定义的 `PubSub` 实现（了解更多[请点击此处](https://github.com/mercurius-js/mercurius/blob/master/docs/subscriptions.md) ）

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

#### WebSocket 身份验证

检查用户是否已认证，可以在 `subscription` 选项中指定的 `verifyClient` 回调函数内完成。

`verifyClient` 函数会接收 `info` 对象作为第一个参数，您可以通过该对象获取请求头信息。

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
