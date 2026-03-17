<!-- 此文件从 content/graphql/unions-and-enums.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:25:32.133Z -->
<!-- 源文件: content/graphql/unions-and-enums.md -->

Here is the translation of the English technical documentation to Chinese:

### 联合类型

联合类型与接口类似，但不能指定公共字段。联合类型用于从单个字段返回多种数据类型。

#### 代码优先

为了定义 GraphQL 联合类型，我们需要定义该联合类型由组成的类。根据 Apollo 文档的 __LINK_51__，我们将创建两个类。首先是 __INLINE_CODE_20__：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  installSubscriptionHandlers: true,
}),

```

然后是 __INLINE_CODE_21__：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  subscriptions: {
    'graphql-ws': true
  },
}),

```

现在，我们可以使用 __INLINE_CODE_22__ 函数（来自 __INLINE_CODE_24__ 包）注册该联合类型：

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

> 警告 **Warning** __INLINE_CODE_25__ 属性返回的数组需要 const 确认。如果不加 const 确认，编译时将生成错误的声明文件。

现在，我们可以在查询中引用 __INLINE_CODE_27__：

```graphql
type Subscription {
  commentAdded(): Comment!
}

```

这将生成以下部分 GraphQL schema：

```typescript
@Subscription(() => Comment, {
  name: 'commentAdded',
})
subscribeToCommentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

默认情况下，库将根据 resolver 方法返回的值来提取类型。这意味着在 resolver 方法中返回类实例，而不是 JavaScript 对象字面量是必需的。

要提供自定义的 __INLINE_CODE_29__ 函数，可以将 __INLINE_CODE_30__ 属性传递给 __INLINE_CODE_31__ 函数的选项对象：

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

#### schema 优先

在 schema 优先方法中，简单地创建一个 GraphQL 联合类型的 SDL。

```graphql
type Subscription {
  commentAdded(): Comment!
}

```

然后，可以使用类型生成特性（如 __LINK_52__ 章节所示）生成对应的 TypeScript 定义：

```typescript
@Subscription(() => Comment, {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded(@Args('title') title: string) {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

联合类型需要在 resolver map 中添加额外的 __INLINE_CODE_32__ 字段，以确定该联合类型应该解析为哪种类型。另外，__INLINE_CODE_33__ 类需要在任何模块中注册为提供者。让我们创建一个 __INLINE_CODE_34__ 类并定义 __INLINE_CODE_35__ 方法。

```typescript
@Subscription(() => Comment, {
  resolve: value => value,
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

> 提示 **Hint** 所有装饰器都来自 `subscription` 包。

### 枚举类型

枚举类型是一种特殊的标量，它restricted 到特定的允许值集中（阅读更多 __LINK_53__）。这允许您：

- 验证任何使用该类型的参数是否属于允许值
- 通过类型系统表明该字段将始终属于有限集中的值

#### 代码优先

使用代码优先方法时，定义 GraphQL 枚举类型只是简单地创建 TypeScript 枚举。

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

现在，我们可以使用 `installSubscriptionHandlers` 函数（来自 `installSubscriptionHandlers` 包）注册该枚举类型：

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

现在，我们可以在类型中引用 `installSubscriptionHandlers`：

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

这将生成以下部分 GraphQL schema：

```typescript
@Subscription('commentAdded', {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

要为枚举提供描述，可以将 `subscriptions-transport-ws` 属性传递给 `graphql-ws` 函数。

```typescript
@Subscription('commentAdded', {
  resolve: value => value,
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

要为枚举值提供描述，或者标记某个值为弃用，可以将 `graphql-ws` 属性传递给 `subscriptions-transport-ws` 函数。

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

这将生成以下 GraphQL schema：

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

#### schema 优先

在 schema 优先方法中，简单地创建一个 GraphQL 枚举类型的 SDL。

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

然后，可以使用类型生成特性（如 __LINK_54__ 章节所示）生成对应的 TypeScript 定义：

```typescript
{
  provide: 'PUB_SUB',
  useValue: new PubSub(),
}

```

有时，后端强制在枚举类型中使用不同的值，而在公共 API 中使用不同的值。在这个示例中，API 中包含 `subscriptions-transport-ws`，但是在 resolvers 中我们可能使用 `graphql-ws`（阅读更多 __LINK_55__）。要实现这个，declare 一个 resolver 对象以便枚举 `@Subscription()`：

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

> 提示 **Hint** 所有装饰器都来自 `@nestjs/graphql` 包。

然后，使用这个 resolver 对象和 `PubSub` 属性的 `graphql-subscriptions` 方法，如下所示：

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