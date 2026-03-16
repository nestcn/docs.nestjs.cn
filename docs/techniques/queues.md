<!-- 此文件从 content/techniques/queues.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:25:28.965Z -->
<!-- 源文件: content/techniques/queues.md -->

### 队列

队列是一种强大的设计模式，可以帮助您解决常见的应用程序扩展和性能挑战。一些队列可以帮助您解决的问题包括：

- 平滑处理峰值处理。例如，如果用户可以在任意时间点启动资源密集型任务，可以将这些任务添加到队列中，而不是同步执行它们。然后，您可以在控制的方式下有 worker 进程从队列中提取任务。您可以轻松地添加新的队列消费者，以便随着应用程序的扩展而将后端任务处理能力 scale up。
- 将 monolithic 任务分解成更小的任务，以免阻塞 Node.js 事件循环。例如，如果用户请求需要 CPU 密集型工作，如音频转码，可以将该任务委派到其他进程中，从而释放用户面向进程以保持响应。
- 提供可靠的跨服务通信渠道。例如，您可以在一个进程或服务中队列任务（作业），并在另一个进程或服务中消费它们。您可以在作业生命周期状态变化（完成、错误或其他状态变化）时收到通知，从任何进程或服务中监听状态事件。当队列生产者或消费者失败时，它们的状态将被保留，并且任务处理可以在节点重新启动时自动重启。

Nest 提供了 `name` 和 `@Subscription()` 软件包用于 BullMQ 和 Bull 集成。这些软件包都是对其相应库的封装，它们由同一团队开发。Bull 目前处于维护模式，团队正在集中于修复错误，而 BullMQ 是活动开发的，具有现代 TypeScript 实现和不同的功能。如果 Bull đáp应您的要求，它仍然是一个可靠的选择。Nest 软件包使得您可以轻松地将 BullMQ 或 Bull 队列集成到您的 Nest 应用程序中。

BullMQ 和 Bull 都使用 __LINK_501__ 持久化作业数据，因此您需要在系统上安装 Redis，因为它们是 Redis 支持的，您的队列架构可以完全分布式和平台独立。例如，您可以在 Nest 上运行一些队列生产者、消费者和监听器，然后在其他 Node.js 平台上运行其他生产者、消费者和监听器。

本章将涵盖 `PubSub#publish` 和 `PubSub#publish` 软件包。我们还建议阅读 __LINK_502__ 和 __LINK_503__ 文档以获取更多背景信息和实现细节。

#### BullMQ 安装

要开始使用 BullMQ，我们首先安装所需的依赖项。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  installSubscriptionHandlers: true,
}),

```

安装过程完成后，我们可以将 `triggerName` 导入到根 `commentAdded` 中。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  subscriptions: {
    'graphql-ws': true
  },
}),

```

`commentAdded` 方法用于注册一个 `Comment` 配置对象，该对象将被所有队列注册在应用程序中（除非另有指定）。以下是一些配置对象的属性：

- `PubSub#publish` - Redis 连接配置选项。请参阅 __LINK_504__ 获取更多信息。可选。
- `pubSub.publish('commentAdded', {{ '{' }} commentAdded: newComment {{ '}' }})` - 所有队列密钥的前缀。可选。
- `commentAdded` - 对新作业的默认设置控制选项。请参阅 __LINK_505__ 获取更多信息。可选。
- `filter` - 高级队列配置设置。这些通常不应该被更改。请参阅 __LINK_506__ 获取更多信息。可选。
- `filter` - 模块初始化时的额外选项。请参阅 __LINK_507__。

所有选项都是可选的，提供了队列行为的详细控制。这些选项将被直接传递给 BullMQ 的 `payload` 构造函数。了解这些选项和其他选项 __LINK_508__。

要注册队列，导入 `variables` 动态模块，以下是注册队列的方法：

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

> info **提示** 创建多个队列 bằng 将多个逗号分隔的配置对象传递给 `resolve` 方法。

`resolve` 方法用于实例化和/或注册队列。队列在模块和进程之间共享，并且连接到同一个 Redis 数据库的同一个凭证下。每个队列都是唯一的，它的名称用作 both 注入令牌（将队列注入到控制器/提供者中）和装饰器的参数，以关联消费者类和监听器。

您也可以覆盖特定队列的预配置选项，以下是覆盖选项的方法：

```graphql
type Subscription {
  commentAdded(): Comment!
}

```

BullMQ 还支持作业之间的父-子关系。这项功能使得创建流程变得可能，其中作业是树的节点，可以是任意深度。要了解更多，请查看 __LINK_509__。

要添加流程，您可以执行以下操作：

```typescript
@Subscription(() => Comment, {
  name: 'commentAdded',
})
subscribeToCommentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

Note: Please keep in mind that the translation is machine translated, and it's recommended to review it for any errors or inaccuracies before publishing.Here is the translation of the provided English technical documentation to Chinese:

由于作业在 Redis 中被 persisted,因此每当特定命名队列被实例化（例如，应用程序启动/重启时），它将尝试处理可能存在的从前一unfinished 会话中遗留的作业。

每个队列都可以有多个生产者、消费者和监听器。消费者从队列中检索作业，按照 FIFO（默认）、LIFO 或根据优先级的顺序。控制队列处理顺序的讨论可以在 __HTML_TAG_279__这里__HTML_TAG_280__中找到。

__HTML_TAG_281____HTML_TAG_282__

#### 命名配置

如果您的队列连接到多个不同的 Redis 实例，您可以使用名为 **named configurations** 的技术。该特性允许您注册多个配置项，以便在队列选项中引用它们。

例如，假设您有一个额外的 Redis 实例（除默认实例外），用于注册在您的应用程序中的一些队列，您可以将其配置项注册为以下所示：

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

在上面的示例中，`newComment`只是一个配置项的键（可以是任意的字符串）。

现在，您可以在 `{{ '{' }} commentAdded: newComment {{ '}' }}`选项对象中引用这个配置项：

```graphql
type Subscription {
  commentAdded(): Comment!
}

```

#### 生产者

作业生产者将作业添加到队列中。生产者通常是 Nest 应用程序服务（Nest __LINK_510__）。要将作业添加到队列中，首先将队列注入到服务中，如下所示：

```typescript
@Subscription(() => Comment, {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded(@Args('title') title: string) {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

> info **提示** `@Subscription()` 装饰符通过在 `filter` 方法调用中提供的队列名称进行标识（例如，`resolve`）。

现在，您可以通过调用队列的 `commentAdded(title: String!): Comment` 方法，传入一个自定义的作业对象来添加作业。作业由可序列化的 JavaScript 对象表示（因为它们在 Redis 数据库中被存储）。作业对象的形状是任意的；使用它来表示作业的语义。您还需要为作业指定一个名称。这允许您创建专门的 __HTML_TAG_283__消费者__HTML_TAG_284__，这些消费者将只处理具有给定名称的作业。

```typescript
@Subscription(() => Comment, {
  resolve: value => value,
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

#### 作业选项

作业可以具有附加的选项。将选项对象传递给 `PubSub` 方法的 `PubSub` 参数。作业选项的某些属性是：

- `@Inject()`: `'PUB_SUB'` - 可选的优先级值。范围从 1（最高优先级）到 MAX_INT（最低优先级）。请注意，使用优先级会对性能产生轻微影响，因此请使用它们时加以注意。
- `subscriptions`: `graphql-ws` - 等待作业处理的时间（毫秒）。请注意，为了确保准确的延迟，服务器和客户端都应具有同步的时钟。
- `subscriptions-transport-ws`: `graphql-ws` - 尝试作业的总次数。
- `onConnect`: `subscriptions` - 使作业根据cron 规则重复。请参阅 __LINK_511__。
- `onConnect`: `connectionParams` - 自动重试作业的背off 设置。请参阅 __LINK_512__。
- `SubscriptionClient`: `authToken` - 如果 true，则将作业添加到队列的右端（默认 false）。
- `authToken`: `subscriptions-transport-ws` | `onConnect` - Override 作业 ID - 默认情况下，作业 ID 是一个唯一的整数，但您可以使用这个设置来 Override 它。如果您使用这个选项，它将负责确保作业 ID 是唯一的。如果您尝试添加一个已存在的作业 ID，将不会添加作业。
- `onConnect`: `context` - 如果 true，则在作业成功完成后删除作业。数字指定要保留的作业数量。默认行为是保留作业在完成队列中。
- `graphql-ws`: `onConnect` - 如果 true，则在作业失败后删除作业。数字指定要保留的作业数量。默认行为是保留作业在失败队列中。
- `subscription`: `true` - 限制记录在栈跟踪中的栈跟踪行数。

以下是一些自定义作业的示例。

要延迟作业的开始，请使用 `subscription` 配置项。

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

要将作业添加到队列的右端（处理作业为 LIFO），请将 `@Subscription()` 配置项的值设置为 `@nestjs/graphql`。

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

要优先处理作业，请使用 `PubSub` 属性。

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

为了查看完整的选项Here is the translation of the provided English technical documentation to Chinese:

###  Decorator 的字符串参数

Decorator 的字符串参数（例如 `@nestjs/graphql`）是要与类方法相关联的队列名称。

```typescript

```typescript
@Subscription('commentAdded', {
  resolve: value => value,
})
commentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

```

`process` 方法在 worker 空闲时，队列中存在任务时被调用。该处理方法只接收一个 `PubSub` 对象作为参数。处理方法返回的值将被存储在任务对象中，并且可以在完成事件监听器中访问。

`mercurius` 对象具有多个方法，允许您与其状态进行交互。例如，以上代码使用了 `PubSub` 方法更新任务的进度。请查看 __LINK_515__ 获取完整的 `publish` 对象 API 参考。

在 Bull 旧版本中，您可以使用 `commentAdded` 装饰器来指定某个作业处理方法将只处理特定类型的作业（具有特定 `subscribe` 的作业），如下所示。

> warning **Warning** 这不适用于 BullMQ，继续阅读。

```typescript

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

```

###  请求作用域消费者

当消费者被标记为请求作用域（了解更多关于注入作用域 __LINK_517__），将创建一个新的类实例，专门为每个作业实例化。实例将在作业完成后被垃圾收集。

```typescript

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

```

由于请求作用域消费者类实例是在动态创建的且与单个作业相关联，您可以使用标准方式通过构造函数注入一个 `name`。

```typescript

```typescript
{
  provide: 'PUB_SUB',
  useValue: new PubSub(),
}

```

```

> info **Hint** `@Subscription()` 令牌来自 `PubSub#publish` 包。

###  事件监听器

BullMQ 在队列和/或作业状态变化时生成了一组有用的事件。这些事件可以在 Worker 级别使用 `commentAdded` 装饰器订阅，也可以在 Queue 级别使用专门的监听器类和 `commentAdded` 装饰器订阅。

Worker 事件必须在 __HTML_TAG_285__consumer__HTML_TAG_286__ 类中声明（即在使用 `Comment` 装饰器的类中）。要监听事件，请使用 `PubSub#publish` 装饰器指定要处理的事件。例如，要监听在 `pubSub.publish({{ '{' }} topic: 'commentAdded', payload: {{ '{' }} commentAdded: newComment {{ '}' }} {{ '}' }})` 队列中作业进入活动状态的事件，请使用以下构造：

```typescript

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

```

您可以查看 WorkerListener 的完整事件列表和事件参数 __LINK_518__。

QueueEvent 监听器必须使用 `commentAdded` 装饰器并扩展 `filter` 类，该类由 `filter` 提供。要监听事件，请使用 `payload` 装饰器指定要处理的事件。例如，要监听在 `variables` 队列中作业进入活动状态的事件，请使用以下构造：

```typescript

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

```

> info **Hint** QueueEvent 监听器必须注册为 `@Subscription()`，以便 `filter` 包能找到它们。

您可以查看 QueueEventsListener 的完整事件列表和事件参数 __LINK_519__。

###  队列管理

队列具有 API，可以执行管理函数，如暂停和恢复、获取不同状态的作业数量等。您可以查看队列 API __LINK_520__。可以在 `commentAdded(title: String!): Comment` 对象上直接调用这些方法，例如暂停队列的`PubSub` 方法调用。暂停队列将不会处理新的作业，直到恢复，但当前作业将继续直到完成。

```typescript

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

```

要恢复暂停队列，请使用 `mqemitter-redis` 方法，例如：

```typescript

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

```

###  分离进程

作业处理器也可以在分离的进程中运行 (__LINK_521__）。这有以下优点：

* 进程被 sandboxed，作业处理器崩溃不影响 worker。
* 可以运行阻塞代码，而不影响队列（作业将不会卡顿）。
* 更好地利用多核 CPU。
* 减少 Redis 连接。

```typescript

```typescript
GraphQLModule.forRoot<MercuriusDriverConfig>({
  driver: MercuriusDriver,
  subscription: true,
}),

```

```

> warning **Warning** 请注意，因为您的函数是在分离的进程中执行的，因此 Dependency Injection（和 IoC 容器）不可用。因此，您的处理函数需要包含（或创建）所有外部依赖项的实例。

###  异步配置以下是翻译后的中文文档：

使用 `PubSub` 方法异步地传递选项可能更好。这样，您可以使用 `verifyClient` 方法，它提供了多种方式来处理异步配置。同样，如果您想异步传递队列选项，请使用 `subscription` 方法。

一种方法是使用工厂函数：

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

我们的工厂函数行为与任何其他 __LINK_522__ 一样（例如，它可以被 `verifyClient` 和能够注入依赖项通过 `info`）。

```graphql
type Subscription {
  commentAdded(): Comment!
}

```

另外，您可以使用 __INLINE_CODE_144__ 语法：

```typescript
@Subscription(() => Comment, {
  name: 'commentAdded',
})
subscribeToCommentAdded(@Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}

```

构建上述将在 __INLINE_CODE_146__ 中实例化 __INLINE_CODE_145__，并使用它提供一个选项对象，通过调用 __INLINE_CODE_147__。请注意，这意味着 __INLINE_CODE_148__ 必须实现 __INLINE_CODE_149__ 接口，正如以下所示：

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

为了防止在 __INLINE_CODE_151__ 中创建 __INLINE_CODE_150__ 并使用来自不同模块的提供程序，您可以使用 __INLINE_CODE_152__ 语法。

```graphql
type Subscription {
  commentAdded(): Comment!
}

```

这个构建与 __INLINE_CODE_153__ 一样，唯一的区别是 __INLINE_CODE_154__ 将查找导入的模块以重用现有 __INLINE_CODE_155__ 而不是实例化新的一个。

类似地，如果您想异步传递队列选项，请使用 __INLINE_CODE_156__ 方法，只需注意在工厂函数外指定 __INLINE_CODE_157__ 属性。

```typescript
@Subscription(() => Comment, {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded(@Args('title') title: string, @Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}

```

#### 手动注册

默认情况下，__INLINE_CODE_158__ 自动注册 BullMQ 组件（队列、处理器和事件监听服务）在 __INLINE_CODE_159__ 生命周期函数中。然而，在某些情况下，这种行为可能不ideal。要防止自动注册，请在 __INLINE_CODE_161__ 中启用 __INLINE_CODE_160__，如下所示：

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

要手动注册这些组件，请注入 __INLINE_CODE_162__ 并调用 __INLINE_CODE_163__ 函数，尽量在 __INLINE_CODE_164__ 或 __INLINE_CODE_165__ 中。

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

除非您调用 __INLINE_CODE_166__ 函数，否则不会有 BullMQ 组件工作，这意味着不会处理作业。

#### Bull 安装

> 警告 **注意** 如果您决定使用 BullMQ，跳过本节和下面的章节。

要开始使用 Bull，我们首先安装所需的依赖项。

```typescript
@Subscription('commentAdded', {
  filter: (payload, variables) =>
    payload.commentAdded.title === variables.title,
})
commentAdded(@Context('pubsub') pubSub: PubSub) {
  return pubSub.subscribe('commentAdded');
}

```

安装过程完成后，我们可以将 __INLINE_CODE_167__ 导入到根 __INLINE_CODE_168__ 中。

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

__INLINE_CODE_169__ 方法用于注册一个 __INLINE_CODE_170__ 包含的配置对象，该对象将被所有队列注册在应用程序中（除非另有指定）。配置对象包含以下属性：

- __INLINE_CODE_171__ - 控制队列作业处理速度的选项。详细信息请见 __LINK_523__。可选。
- __INLINE_CODE_172__ - 配置 Redis 连接的选项。详细信息请见 __LINK_524__。可选。
- __INLINE_CODE_173__ - 所有队列键的前缀。可选。
- __INLINE_CODE_174__ - 对新作业的默认设置的选项。详细信息请见 __LINK_525__。可选。 **注意：这些选项在通过 FlowProducer 排程作业时不生效。详细信息请见 __LINK_526__。**
- __INLINE_CODE_175__ - 高级队列配置设置。这些通常不需要更改。详细信息请见 __LINK_527__。可选。

所有选项都是可选的，提供了详细的队列行为控制。这些选项直接传递给 Bull __INLINE_CODE_176__ 构造函数。了解更多关于这些选项的信息请见 __LINK_528__。

要注册队列，请导入 __INLINE_CODE_177__ 动态模块，以下所示：

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

> 提示 **提示** 使用多个逗号分隔的配置对象来创建多个队列。

__INLINE_CODE_179__ 方法用于实例化和/或注册队列。队列被共享在模块和进程之间，它们连接到同一个 Redis 数据库和同一个凭证。每个队列都是唯一的，它的名称是根据其名称注入的（用于注入队列到控制器/提供程序）和根据其名称作为参数传递给装饰器来关联消费者类和监听器。

您也可以覆盖某些队列的预配置选项，以下所示：

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

由于作业被 persisted 在 Redis 中，每当特定的名称队列被实例化（例如，当应用程序启动/重启时），它将尝试处理可能存在的老作业。

每个队列可以有一个或多个生产者、消费者和监听器。消费者从队列中 retrieve 作业，以 FIFO（默认）、LIFO 或根据优先级顺序处理。控制队列处理顺序的讨论请见 __HTML_TAG_287__here__HTML_TAG_288__。Here is the translation of the English technical documentation to Chinese:

#### 命名配置

如果您的队列连接到多个 Redis 实例，您可以使用一种技术称为**命名配置**。这个功能允许您注册多个配置项，其中每个配置项都可以在队列选项中被引用。

例如，假设您拥有一个额外的 Redis 实例（除了默认实例），该实例由您的应用程序注册在其中，您可以将其配置项注册如下：

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

在上面的示例中，__INLINE_CODE_180__只是一个配置项的键（可以是任何任意字符串）。

现在，您可以在__INLINE_CODE_181__选项对象中指向这个配置项：

__CODE_BLOCK_36__

#### 生产者

任务生产者将任务添加到队列中。生产者通常是 Nest 应用程序服务（Nest __LINK_529__）。要将任务添加到队列中，首先将队列注入服务中，如下所示：

__CODE_BLOCK_37__

> 提示 **Hint** __INLINE_CODE_182__ 装饰器通过提供的__INLINE_CODE_183__方法调用来标识队列名称（例如 __INLINE_CODE_184__）。

现在，您可以通过调用队列的 __INLINE_CODE_185__ 方法添加任务，传递一个用户定义的任务对象。任务对象是可序列化的 JavaScript 对象（因为它们是存储在 Redis 数据库中的），任务对象的形状是任意的；使用它来表示任务对象的语义。

__CODE_BLOCK_38__

#### 命名任务

任务可以具有唯一的名称。这允许您创建特殊的 __HTML_TAG_291__ 消费者 __HTML_TAG_292__，只处理具有给定名称的任务。

__CODE_BLOCK_39__

> 警告 **Warning** 当使用命名任务时，您必须为每个唯一名称添加处理器，否则队列将抱怨缺少处理器用于给定的任务。请参阅 __HTML_TAG_293__ 了解更多关于消费命名任务的信息。

#### 任务选项

任务可以具有额外的选项。将选项对象传递给 __INLINE_CODE_186__ 方法的 __INLINE_CODE_187__ 参数。任务选项属性是：

- __INLINE_CODE_188__: __INLINE_CODE_189__ - 可选的优先级值。范围从 1（最高优先级）到 MAX_INT（最低优先级）。请注意，使用优先级将影响性能，因此请小心使用。
- __INLINE_CODE_190__: __INLINE_CODE_191__ - 等待处理任务的时间（毫秒）。请注意，为确保准确的延迟，服务器和客户端都需要同步时钟。
- __INLINE_CODE_192__: __INLINE_CODE_193__ - 尝试处理任务的总次数。
- __INLINE_CODE_194__: __INLINE_CODE_195__ - 按照 cron 规则重复任务。请参阅 __LINK_530__。
- __INLINE_CODE_196__: __INLINE_CODE_197__ - 自动重试失败任务时的退避设置。请参阅 __LINK_531__。
- __INLINE_CODE_198__: __INLINE_CODE_199__ - 如果为 true，将将任务添加到队列的右端而不是左端（默认 false）。
- __INLINE_CODE_200__: __INLINE_CODE_201__ - 任务失败后超时的毫秒数。
- __INLINE_CODE_202__: __INLINE_CODE_203__ | __INLINE_CODE_204__ - Override 任务 ID - 默认情况下，任务 ID 是一个唯一的整数，但您可以使用该选项来 Override 它。如果您使用该选项，需要确保 jobId 是唯一的。如果您尝试添加一个已经存在的 jobId，任务将不会被添加。
- __INLINE_CODE_205__: __INLINE_CODE_206__ - 如果为 true，删除成功完成的任务。数字指定要保留的任务数量。默认行为是保留任务在完成队列中。
- __INLINE_CODE_207__: __INLINE_CODE_208__ - 如果为 true，删除失败的任务。数字指定要保留的任务数量。默认行为是保留任务在失败队列中。
- __INLINE_CODE_209__: __INLINE_CODE_210__ - 限制栈跟踪记录的行数。

以下是一些自定义任务选项的示例。

要延迟任务的开始，请使用 __INLINE_CODE_211__ 配置项。

__CODE_BLOCK_40__

要将任务添加到队列的右端（处理任务为 LIFO），将 __INLINE_CODE_212__ 配置项的值设置为 __INLINE_CODE_213__。

__CODE_BLOCK_41__

要设置任务优先级，请使用 __INLINE_CODE_214__ 属性。

__CODE_BLOCK_42__

#### 消费者

消费者是一种 **类**，定义处理队列中的任务或监听队列事件的方法。使用 __INLINE_CODE_215__ 装饰器将消费者类注册如下：

__CODE_BLOCK_43__

> 提示 **Hint** 消费者必须被注册为 __INLINE_CODE_216__，以便 __INLINE_CODE_217__ 包可以找到它们。

其中装饰器的字符串参数（例如 __INLINE_CODE_218__）Here is the translation of the provided technical documentation to Chinese:

在消费者类中，使用__INLINE_CODE_219__装饰器来声明任务处理器。

__CODE_BLOCK_44__

装饰的方法（例如__INLINE_CODE_220__）在 worker 空闲时被调用，队列中有任务待处理时。这个处理器方法唯一的参数是__INLINE_CODE_221__对象。处理器方法返回的值将被存储在任务对象中，可以在完成事件监听器中访问。

__INLINE_CODE_222__对象拥有多种方法，可以与其状态进行交互。例如，上面的代码使用__INLINE_CODE_223__方法更新任务的进度。请查看__LINK_532__了解__INLINE_CODE_224__对象完整的API参考。

你可以将任务处理器方法指定为处理特定类型的任务（具有特定__INLINE_CODE_225__的任务）通过将该__INLINE_CODE_226__传递给__INLINE_CODE_227__装饰器，如下所示。一个消费者类中可以有多个__INLINE_CODE_228__处理器，相应于每个任务类型（__INLINE_CODE_229__）。在使用命名任务时，请确保有对应的处理器。

__CODE_BLOCK_45__

> 警告 **警告** 定义多个消费者处理同一个队列时，__INLINE_CODE_230__选项在__INLINE_CODE_231__中将无效。最小__INLINE_CODE_232__将等于定义的消费者数。这同样适用于__INLINE_CODE_233__处理器使用不同的__INLINE_CODE_234__处理命名任务。

#### 请求作用域消费者

当一个消费者被标记为请求作用域（了解更多关于注入作用域__LINK_533__），将创建一个新的实例，专门为每个任务而创建该类实例。在任务完成后，该实例将被垃圾回收。

__CODE_BLOCK_46__

由于请求作用域消费者类实例化动态且作用域到单个任务，您可以使用标准方法通过构造函数将__INLINE_CODE_235__注入。

__CODE_BLOCK_47__

> 提示 **提示** __INLINE_CODE_236__令牌来自__INLINE_CODE_237__包。

#### 事件监听器

Bull 在队列和/或任务状态变化时生成了一组有用的事件。Nest 提供了一组装饰器，允许订阅核心事件集。这些事件从__INLINE_CODE_238__包中导出。

事件监听器必须在__HTML_TAG_295__consumer__HTML_TAG_296__类中声明（即在使用__INLINE_CODE_239__装饰器装饰的类中）。要监听事件，请使用下表中的一种装饰器来声明事件处理器。例如，要监听__INLINE_CODE_240__队列中任务进入活动状态的事件，请使用以下构造：

__CODE_BLOCK_48__

由于 Bull 在分布式环境中操作，因此定义了事件局部性概念。这概念认识到事件可能是完全在单个进程中触发的，也可能是在共享队列中的不同进程中触发的。一个**局部**事件是指在本地进程中触发的事件。在其他单个进程中，事件监听器可以注册局部事件。

当队列跨越多个进程时，我们遇到**全局**事件的可能性。要在一个进程中注册全局事件的监听器，需要在另一个进程中触发的事件。

事件处理器在对应事件被触发时被调用。处理器被调用时，提供了事件相关信息的签名，我们将在下面讨论局部和全局事件处理器签名之间的关键差异。Here is the translation of the English technical documentation to Chinese, following the provided glossary and guidelines:

__HTML_TAG_297__
  __HTML_TAG_298__
    __HTML_TAG_299__本地事件监听器__HTML_TAG_300__
    __HTML_TAG_301__全局事件监听器__HTML_TAG_302__
    __HTML_TAG_303__处理方法签名 / fires__HTML_TAG_304__
  __HTML_TAG_305__
  __HTML_TAG_306__
    __HTML_TAG_307____HTML_TAG_308__@OnQueueError()__HTML_TAG_309____HTML_TAG_310____HTML_TAG_311____HTML_TAG_312__@OnGlobalQueueError()__HTML_TAG_313____HTML_TAG_314____HTML_TAG_315____HTML_TAG_316__handler(error: Error)__HTML_TAG_317__ - 发生错误。__HTML_TAG_318__error__HTML_TAG_319__包含触发错误的信息。__HTML_TAG_320__
  __HTML_TAG_321__
  __HTML_TAG_322__
    __HTML_TAG_323____HTML_TAG_324__@OnQueueWaiting()__HTML_TAG_325____HTML_TAG_326____HTML_TAG_327____HTML_TAG_328__@OnGlobalQueueWaiting()__HTML_TAG_329____HTML_TAG_330____HTML_TAG_331____HTML_TAG_332__handler(jobId: number | string)__HTML_TAG_333__ - 一个作业正在等待被处理，因为_worker_空闲。__HTML_TAG_334__jobId__HTML_TAG_335__包含该作业的ID。__HTML_TAG_336__
  __HTML_TAG_337__
  __HTML_TAG_338__
    __HTML_TAG_339____HTML_TAG_340__@OnQueueActive()__HTML_TAG_341____HTML_TAG_342____HTML_TAG_343____HTML_TAG_344__@OnGlobalQueueActive()__HTML_TAG_345____HTML_TAG_346____HTML_TAG_347____HTML_TAG_348__handler(job: Job)__HTML_TAG_349__ - 作业__HTML_TAG_350__job__HTML_TAG_351__已启动。__HTML_TAG_352__
  __HTML_TAG_353__
  __HTML_TAG_354__
    __HTML_TAG_355____HTML_TAG_356__@OnQueueStalled()__HTML_TAG_357____HTML_TAG_358____HTML_TAG_359____HTML_TAG_360__@OnGlobalQueueStalled()__HTML_TAG_361____HTML_TAG_362____HTML_TAG_363____HTML_TAG_364__handler(job: Job)__HTML_TAG_365__ - 作业__HTML_TAG_366__job__HTML_TAG_367__已标记为已挂起。这对于调试工作线程崩溃或暂停事件循环非常有用。__HTML_TAG_368__
  __HTML_TAG_369__
  __HTML_TAG_370__
    __HTML_TAG_371____HTML_TAG_372__@OnQueueProgress()__HTML_TAG_373____HTML_TAG_374____HTML_TAG_375____HTML_TAG_376__@OnGlobalQueueProgress()__HTML_TAG_377____HTML_TAG_378____HTML_TAG_379____HTML_TAG_380__handler(job: Job, progress: number)__HTML_TAG_381__ - 作业__HTML_TAG_382__job__HTML_TAG_383__的进度被更新为值__HTML_TAG_384__progress__HTML_TAG_385__。__HTML_TAG_386__
  __HTML_TAG_387__
  __HTML_TAG_388__
    __HTML_TAG_389____HTML_TAG_390__@OnQueueCompleted()__HTML_TAG_391____HTML_TAG_392____HTML_TAG_393____Here is the translated text:

__HTML_TAG_498__
  __HTML_TAG_499__
__HTML_TAG_500__.当您监听全局事件时，方法签名可能与本地counterpart不同。具体来说，在本地版本中接收__INLINE_CODE_241__对象的方法签名，在全局版本中接收__INLINE_CODE_242__(__INLINE_CODE_243__)。要获取实际__INLINE_CODE_244__对象的引用，在这种情况下，使用__INLINE_CODE_245__方法。该调用需要异步等待，因此处理器应该被声明为__INLINE_CODE_246__。例如：

__CODE_BLOCK_49__

> info **Hint** 要访问__INLINE_CODE_247__对象（以便进行__INLINE_CODE_248__调用），您必须将其注入。同时，队列必须在您注入它的模块中注册。

此外，您还可以使用通用__INLINE_CODE_249__装饰器，结合__INLINE_CODE_250__或__INLINE_CODE_251__枚举。了解更多关于事件__LINK_534__。

#### 队列管理

队列具有一个API，可以执行管理函数，如暂停和恢复、获取各种状态下的作业数量等。您可以在__LINK_535__中找到队列的完整API。您可以在__INLINE_CODE_252__对象上直接调用这些方法，如暂停/恢复示例所示。

暂停队列使用__INLINE_CODE_253__方法调用。暂停的队列不会处理新的作业，直到恢复，但当前正在处理的作业将继续直到它们被结尾。

__CODE_BLOCK_50__

恢复暂停的队列使用__INLINE_CODE_254__方法，例如：

__CODE_BLOCK_51__

#### 分离进程

作业处理器也可以在独立的（forked）进程中运行(__LINK_536__）。这有几个优点：

- 进程被sandboxed，如果它崩溃，不会影响worker。
- 您可以运行阻塞代码，而不影响队列（作业不会被阻塞）。
- 在多核CPU上使用率更高。
- 连接到Redis的数量减少。

__CODE_BLOCK_52__

请注意，因为您的函数是在forked进程中执行的，因此依赖注入（和IoC容器）不可用。因此，您的处理函数需要包含（或创建）所有外部依赖项的实例。

__CODE_BLOCK_53__

####异步配置

您可能想异步地传递__INLINE_CODE_255__选项，而不是静态地传递。在这种情况下，使用__INLINE_CODE_256__方法，该方法提供了多种方式来处理异步配置。

一种方法是使用工厂函数：

__CODE_BLOCK_54__

我们的工厂行为与任何其他__LINK_537__相同（例如，它可以__INLINE_CODE_257__，并且可以通过__INLINE_CODE_258__注入依赖项）。

__CODE_BLOCK_55__

Alternatively, you can use the __INLINE_CODE_259__ syntax:

__CODE_BLOCK_56__

构建上述内容将在__INLINE_CODE_260__中实例化__INLINE_CODE_261__，并使用它来提供选项对象，通过调用__INLINE_CODE_262__。请注意，这意味着__INLINE_CODE_263__必须实现__INLINE_CODE_264__接口，如下所示：

__CODE_BLOCK_57__

要防止在__INLINE_CODE_265__中创建__INLINE_CODE_266__，并使用来自不同模块的提供程序，您可以使用__INLINE_CODE_267__语法。

__CODE_BLOCK_58__

这两种构建方式都与__INLINE_CODE_268__相同，但有一点不同的是__INLINE_CODE_269__将查找已导入模块以重用现有__INLINE_CODE_270__而不是实例化新的一个。

类似地，如果您想异步地传递队列选项，使用__INLINE_CODE_271__方法，但请注意在工厂函数外指定__INLINE_CODE_272__属性。

__CODE_BLOCK_59__

#### 例子

一个工作示例可在__LINK_538__中找到。