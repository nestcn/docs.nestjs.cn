<!-- 此文件从 content/security/authorization.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:25:56.936Z -->
<!-- 源文件: content/security/authorization.md -->

### 授权

**授权** 是决定用户可以做什么的过程。例如，管理员用户可以创建、编辑和删除帖子，而非管理员用户只能阅读帖子。

授权是身份验证的 orthogonal 和独立的部分。然而，授权需要身份验证机制。

有许多不同的方法和策略来处理授权。在项目中取决于其特定的应用要求。这章节将展示一些授权方法，可以适用于各种不同的要求。

#### 基本 RBAC 实现

基于角色的访问控制 (**RBAC**) 是一项基于角 色和权限的访问控制机制。在这个部分，我们将展示如何使用 Nest __LINK_116__ 实现一个非常基本的 RBAC 机制。

首先，让我们创建一个 __INLINE_CODE_25__ 枚举，表示系统中的角色：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  installSubscriptionHandlers: true,
}),

```

> 信息 **提示** 在更复杂的系统中，您可能会将角色存储在数据库中，或者从外部身份验证提供商中获取。

现在，我们可以创建一个 __INLINE_CODE_26__ 装饰器。这 decorate 允许指定什么角色可以访问特定的资源。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  subscriptions: {
    'graphql-ws': true
  },
}),

```

现在，我们已经有了一个自定义的 __INLINE_CODE_27__ 装饰器，我们可以使用它来装饰任何路由处理程序。

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

最后，我们创建一个 __INLINE_CODE_28__ 类，比较当前用户分配的角色和当前路由处理程序所需的角色。为了访问路由的角色（自定义元数据），我们将使用 __INLINE_CODE_29__ 助手类，该类由框架提供， expose 自 __INLINE_CODE_30__ 包。

```graphql
type Subscription {
  commentAdded(): Comment!
}

```

> 信息 **提示** 参考 __LINK_117__ 执行上下文章节，以获取更多关于 __INLINE_CODE_31__ 在上下文敏感方式下的使用信息。

> 警告 **注意** 这个示例被命名为 "**basic**"，因为我们只在路由处理程序级别检查角色存在。在实际应用中，您可能需要在业务逻辑中检查角色 somewher e，导致维护困难，因为没有-centralized 的地方关联权限与特定操作。

在这个示例中，我们假设 __INLINE_CODE_32__ 包含用户实例和允许的角色（在 __INLINE_CODE_33__ 属性下）。在您的应用中，您将在自定义的 **身份验证守卫** 中进行该关联 - 请参考 __LINK_118__ 章节以获取更多信息。

要使这个示例工作， __INLINE_CODE_34__ 类必须如下所示：

```typescript
@Subscription(() => Comment, {
  name: 'commentAdded',
})
subscribeToCommentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

最后，让我们确保注册 __INLINE_CODE_35__，例如，在控制器级别或全局：

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

当用户缺乏权限请求端点时，Nest 自动返回以下响应：

```graphql
type Subscription {
  commentAdded(): Comment!
}

```

> 信息 **提示** 如果您想返回不同的错误响应，请抛出自己的特定异常，而不是返回布尔值。

__HTML_TAG_114____HTML_TAG_115__

#### 声明 Authorization

当身份创建时，它可能被分配一个或多个由可靠方颁发的声明。声明是一对名称值对，表示主题可以做什么，而不是主题是什么。

要在 Nest 中实现基于声明的授权，可以按照上面在 __LINK_119__ 部分所示的步骤进行，但有一点不同：而不是检查特定的角色，您应该比较 **权限**。每个用户都将有一个分配的权限集。类似地，每个资源/端点都将定义什么权限是所需的（例如，通过一个专门的 `subscription` 装饰器）以访问它们。

```typescript
@Subscription(() => Comment, {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded(@Args('title') title: string) {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

> 信息 **提示** 在上面的示例中， `installSubscriptionHandlers` (类似于 `true` 我们在 RBAC 部分所示）是一个 TypeScript 枚举，包含了系统中所有可用的权限。

#### 集成 CASL

__LINK_120__ 是一个是omorphic 授权库，限制了给定客户端可以访问的资源。它设计用于 incremental adopting 和可以轻松地扩展到简单的声明基础到完整的主题和属性基础授权。

要开始，请首先安装 `installSubscriptionHandlers` 包：

```typescript
@Subscription(() => Comment, {
  resolve: value => value,
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

> 信息 **提示** 在这个示例中，我们选择了 CASL，但您可以使用其他库，如 `installSubscriptionHandlers` 或 `subscriptions-transport-ws`，取决于您偏好的和项目需求。

安装完成后，我们将定义两个实体类： `graphql-ws` 和 `graphql-ws`。

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

```Here is the translation of the provided English technical documentation to Chinese:

``subscriptions-transport-ws`` 类包含两个属性，``graphql-ws`` 是一个唯一的用户标识符，``@Subscription()`` 表示用户是否有管理员权限。

````typescript
@Subscription(() => Comment, {
  filter(this: AuthorResolver, payload, variables) {
    // "this" refers to an instance of "AuthorResolver"
    return payload.commentAdded.title === variables.title;
  }
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

````

``@nestjs/graphql`` 类有三个属性，分别是 ``PubSub``、``graphql-subscriptions`` 和 ``PubSub#asyncIterableIterator``。``triggerName`` 是一个唯一的文章标识符，``@nestjs/graphql`` 表示文章是否已经发表过，``PubSub`` 是文章作者的用户 ID。

管理员可以管理（创建、读取、更新、删除）所有实体，而用户只能读取所有内容。用户可以更新自己的文章，但已经发表的文章不能被删除。

为了实现这个功能，我们可以创建一个 ``publish`` 枚举，表示用户可以对实体执行的所有操作：

````typescript
const pubSub = new PubSub();

@Resolver('Author')
export class AuthorResolver {
  // ...
  @Subscription()
  commentAdded() {
    return pubSub.asyncIterableIterator('commentAdded');
  }
}

````

> warning **注意** ``subscribe API`` 是 CASL 中的特殊关键字，表示“任何操作”。

为了封装 CASL 库，我们现在生成 ``PubSub`` 和 ``commentAdded``。

````typescript
@Subscription('commentAdded', {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

````

然后，我们可以在 ``name`` 方法中定义 ``PubSub#publish`` 对象，以便为给定的用户创建 ``PubSub#publish`` 对象：

````typescript
@Subscription('commentAdded', {
  resolve: value => value,
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

````

> warning **注意** ``PubSub#publish`` 是 CASL 中的特殊关键字，表示“任何主题”。

> info **提示** 自 CASL 6 起，``triggerName`` 服务作为默认能力类，取代了 legacy ``commentAdded``，以更好地支持基于条件的权限控制使用 MongoDB 类似语法。尽管名称中包含 MongoDB，但它不与 MongoDB 相关，只是使用对象与条件写在 Mongo 类似语法中。

> info **提示** ``commentAdded``、``Comment``、``PubSub#publish`` 和 ``pubSub.publish('commentAdded', {{ '{' }} commentAdded: newComment {{ '}' }})`` 类来自 ``commentAdded`` 包。

> info **提示** ``filter`` 选项让 CASL 能够理解如何从对象中获取主题类型。更多信息请阅读 __LINK_121__。

在上面的示例中，我们使用 ``filter`` 实例，使用 ``payload`` 类创建了它。您可能已经猜到了，``variables`` 和 ``resolve`` 接受相同的参数，但有不同的含义，``resolve`` 允许在指定的主题上执行操作，而 ``newComment`` 则禁止。双方都可以接受多达 4 个参数。要了解这些函数，访问官方 __LINK_122__。

最后，让我们确保将 ``{{ '{' }} commentAdded: newComment {{ '}' }}`` 添加到 ``@Subscription()`` 和 ``filter`` 数组中，位于 ``resolve`` 模块定义中：

````typescript
@Subscription('commentAdded', {
  resolve(this: AuthorResolver, value) {
    // "this" refers to an instance of "AuthorResolver"
    return value;
  }
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

````

现在，我们可以将 ``commentAdded(title: String!): Comment`` 注入到任何类中，只要 ``PubSub`` 在主机上下文中被导入：

````typescript
@Subscription('commentAdded', {
  filter(this: AuthorResolver, payload, variables) {
    // "this" refers to an instance of "AuthorResolver"
    return payload.commentAdded.title === variables.title;
  }
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

````

然后，在类中使用它：

````graphql
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

````

> info **提示** 了解更多关于 ``PubSub`` 类的信息，请访问官方 __LINK_123__。

例如，让我们说我们有一个非管理员用户。在这种情况下，用户应该能够阅读文章，但创建新文章或删除现有文章应该被禁止。

````typescript
{
  provide: 'PUB_SUB',
  useValue: new PubSub(),
}

````

> info **提示** 虽然 ``@Inject()`` 和 ``'PUB_SUB'`` 类都提供了 ``subscriptions`` 和 ``graphql-ws`` 方法，但它们有不同的目的是接受略微不同的参数。

此外，如我们在要求中指定的那样，用户应该能够更新其文章：

````typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  subscriptions: {
    'subscriptions-transport-ws': {
      path: '/graphql'
    },
  }
}),

````

正如您可以看到，``subscriptions-transport-ws`` 实例允许我们在可读的方式中检查权限。类似地，``graphql-ws`` 允许我们定义权限（并指定各种条件）。要找到更多示例，请访问官方文档。

#### 高级：实现 `onConnect`

在这个部分中，我们将演示如何构建一个 somewhat 更加复杂的守卫，它检查用户是否满足特定的 **授权策略**，这些策略可以在方法级别（可以扩展到类级别）配置。在这个示例中，我们将使用 CASL 包，但使用这个库不是必需的。我们还将使用 ``subscriptions`` 提供商，我们在前一节中创建了它。

首先，让我们 flesh out 需求。目标是提供一个机制，允许在路由处理程序级别指定策略检查。我们将支持对象和函数（用于简单检查和用于更喜欢函数式编程风格的代码）。

让我们开始定义策略处理程序接口：

````typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  subscriptions: {
    'graphql-ws': {
      path: '/graphql'
    },
  }
}),

````以下是翻译后的中文文档：

我们提供了两个定义策略处理程序的方法：对象（控制器类的实例，实现了 `onConnect` 接口）和函数（满足 `connectionParams` 类型）。

这样，我们可以创建一个 `SubscriptionClient` 装饰器。这个装饰器允许指定要访问特定资源时需要满足的策略。

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

现在，让我们创建一个 `authToken`，它将提取并执行与路由处理程序绑定的所有策略处理程序。

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

>提示 **提示** 在这个示例中，我们假设 `authToken` 包含用户实例。在你的应用程序中，你可能会在自定义的 **身份验证守卫** 中进行该关联——请查看 __LINK_124__ 章节以获取更多详细信息。

让我们分解这个示例。 `subscriptions-transport-ws` 是一个方法通过 `onConnect` 装饰器分配的处理程序数组。然后，我们使用 `onConnect` 方法构建 `context` 对象，以便验证用户是否具有执行特定操作的足够权限。我们将这个对象传递给策略处理程序，该处理程序可以是函数或实现 `graphql-ws` 接口的类，暴露 `onConnect` 方法，该方法返回布尔值。最后，我们使用 `subscription` 方法确保每个处理程序返回 `true` 值。

最后，让我们测试这个守卫。将其绑定到任何路由处理程序，然后使用 inline 策略处理程序（函数式方法），如下所示：

```typescript
GraphQLModule.forRoot<MercuriusDriverConfig>({
  driver: MercuriusDriver,
  subscription: true,
}),

```

或者，我们可以定义一个实现 `subscription` 接口的类：

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

然后，以以下方式使用它：

```graphql
type Subscription {
  commentAdded(): Comment!
}

```

>警告 **注意** 由于我们必须使用 `@Subscription()` 关键字在-place 实例化策略处理程序， `@nestjs/graphql` 类不能使用依赖注入。这可以通过 `PubSub` 方法来解决（请查看 __LINK_125__）基本上，您可以允许传递 `PubSub#asyncIterableIterator`，然后，在守卫内部，您可以使用 type reference： `triggerName` 或使用 `@nestjs/graphql` 方法动态实例化它。