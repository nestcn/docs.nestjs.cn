<!-- 此文件从 content/graphql/mutations.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:52:54.300Z -->
<!-- 源文件: content/graphql/mutations.md -->

### Mutations

大多数关于 GraphQL 的讨论都集中在数据 fetching 上，但是任何完整的数据平台都需要一种方式来修改服务器端数据。就像 REST 一样，在 GraphQL 中任何查询都可以实现将数据写入，但是就像 REST 一样，我们建议观察惯例，任何导致数据写入的操作都应该被明确地通过 mutation 来发送（了解更多关于 __LINK_26__）。

官方 __LINK_27__ 文档中使用了 __INLINE_CODE_6__ mutation 示例。这一mutation 实现了一个方法来增加帖子的 __INLINE_CODE_7__ 属性值。为了在 Nest 中创建一个等效的 mutation，我们将使用 __INLINE_CODE_8__ 装饰器。

#### 代码优先

让我们在之前章节中使用的 __INLINE_CODE_9__ 中添加另一个方法（见 __LINK_28__）。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  installSubscriptionHandlers: true,
}),

```

> 提示 **Hint** 所有装饰器（例如 __INLINE_CODE_10__、__INLINE_CODE_11__、__INLINE_CODE_12__ 等）都是从 __INLINE_CODE_13__ 包中导出。

这将生成以下部分 GraphQL schema 在 SDL 中：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  subscriptions: {
    'graphql-ws': true
  },
}),

```

__INLINE_CODE_14__ 方法接受 __INLINE_CODE_15__ (__INLINE_CODE_16__) 作为参数，并返回一个更新的 __INLINE_CODE_17__ 实体。由于 __LINK_29__ 部分中解释的原因，我们需要明确地设置期望的类型。

如果 mutation 需要以对象作为参数，我们可以创建一个 **输入类型**。输入类型是一个特殊的对象类型，可以作为参数传递（了解更多关于 __LINK_30__）。要声明输入类型，使用 __INLINE_CODE_18__ 装饰器。

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

> 提示 **Hint** __INLINE_CODE_19__ 装饰器接受一个选项对象作为参数，因此您可以，例如，指定输入类型的描述。请注意，出于 TypeScript 的元数据反射系统限制，您必须使用 __INLINE_CODE_20__ 装饰器手动指示类型，或者使用 __LINK_31__。

然后，我们可以在解析器类中使用这个类型：

```graphql
type Subscription {
  commentAdded(): Comment!
}

```

#### Schema 优先

让我们扩展之前章节中使用的 __INLINE_CODE_21__（见 __LINK_32__）。

```typescript
@Subscription(() => Comment, {
  name: 'commentAdded',
})
subscribeToCommentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

请注意，我们假设了业务逻辑已经被移到 __INLINE_CODE_22__ 中（查询帖子并增加其 __INLINE_CODE_23__ 属性值）。__INLINE_CODE_24__ 类中的逻辑可以简单或复杂到任何程度。示例的主要目的是展示解析器如何与其他提供商交互。

最后一步是将我们的 mutation 添加到现有的类型定义中。

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

__INLINE_CODE_25__ mutation 现在可以作为我们的应用程序的 GraphQL API 的一部分被调用。