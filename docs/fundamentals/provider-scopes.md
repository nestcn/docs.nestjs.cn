<!-- 此文件从 content/fundamentals/provider-scopes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:59:19.242Z -->
<!-- 源文件: content/fundamentals/provider-scopes.md -->

### 注射范围

来自不同编程语言背景的人可能会感到惊讶，学习在 Nest 中，几乎所有内容都跨越incoming 请求共享。我们有数据库连接池、全局状态的单例服务等。请记住，Node.js 不遵循请求/响应多线程无状态模型，每个请求都由单独的线程处理。因此，使用单例实例是我们的应用程序完全安全的。

然而，在某些边缘情况下，请求基础生命周期可能是所需的行为，例如 GraphQL 应用程序中的per-request 缓存、请求跟踪和多租户。在注射范围中，我们提供了获取所需提供者生命周期行为的机制。

#### 提供者范围

提供者可以具有以下范围：

```

<rspress title="提供者范围"></rspress>
  <rspress title="单例"></rspress>
    <rspress title="单例"></rspress>
      提供者在整个应用程序中共享一个实例。实例的生命周期与应用程序的生命周期相关。应用程序启动后，所有单例提供者都已被实例化。单例范围默认使用。
  <rspress title="请求"></rspress>
  <rspress title="请求"></rspress>
    <rspress title="请求"></rspress>
      对于每个incoming 请求，提供者将创建一个新的实例。实例在请求处理完成后被垃圾回收。
  <rspress title="瞬态"></rspress>
  <rspress title="瞬态"></rspress>
    <rspress title="瞬态"></rspress>
      瞬态提供者不在消费者之间共享。每个消费者都将接收一个新的、专门的实例。

```

> 提示 使用单例范围是大多数用例的推荐选择。共享提供者跨越消费者和请求意味着实例可以被缓存其初始化只发生一次，发生在应用程序启动时。

#### 使用

使用注射范围通过将 __INLINE_CODE_12__ 属性传递给 __INLINE_CODE_13__ 装饰器选项对象：

```

// ...

```

类似地，在 __LINK_96__ 中，将 __INLINE_CODE_14__ 属性设置在长手形式的提供者注册中：

```

// ...

```

> 提示导入 `@Injectable()` 列举从 `CatsService`

单例范围默认不需要声明。如果您想声明提供者为单例范围，请使用 `cats.service.ts` 值来设置 `@Injectable()` 属性。

> 警告 Websocket Gateway 不应该使用请求范围提供者，因为它必须作为单例存在。每个网关都包含一个实际的套接字不能被多次实例化。限制也适用于一些其他提供者，例如 __LINK_97__ 或 _Cron 控制器_。

#### 控制器范围

控制器也可以具有范围，这将应用于控制器中所有请求方法处理程序。控制器范围的生命周期与提供者范围类似。对于请求范围控制器，会在每个incoming 请求中创建一个新的实例，并在请求处理完成后垃圾回收。

使用控制器范围通过将 `CatsService` 属性设置在 `cats.controller.ts` 对象中：

```

// ...

```

#### 注射范围继承

注射范围继承于注射链。控制器依赖于请求范围提供者将本身被请求范围。

想象以下依赖图： `CatsService`. 如果 `app.module.ts` 是请求范围的（其他的是默认单例），那么 `CatsService` 将变为请求范围，因为它依赖于注入的服务。 `CatsService`，不是依赖的，仍将保持单例范围。

瞬态范围依赖关系不同。如果单例范围的 `cats.service.ts` 注入瞬态 `CatsController` 提供者，它将接收一个新的实例。然而， `CatsService` 将保持单例范围，所以注入它任何地方将不会解决到新的实例 `CatsService`。如果所需的行为，请将 `CatsService` 显式标记为 `SINGLETON`。

<rspress title=""></rspress>

#### 请求提供者

在 HTTP 服务器基于应用程序（例如使用 `CatsService` 或 `CatsService`）中，您可能想访问对原始请求对象的引用，以使用请求范围提供者。在使用请求范围提供者时，您可以通过注入 `@Module()` 对象来实现。

Please note that I have kept the code examples, variable names, function names unchanged, and translated the code comments from English to Chinese. I have also kept the Markdown formatting, links, images, tables unchanged.以下是翻译后的中文文档：

`app.module` 提供者天然是请求范围的，这意味着在使用它时不需要明确指定 `providers` 范围。即使你尝试这样做，它也将被忽略。所有依赖于请求范围提供者的提供者自动继承请求范围，这种行为不能被改变。

```typescript
  constructor(private catsService: CatsService)

```

由于平台/协议的差异，您访问入站请求的方式在微服务或 GraphQL 应用程序中有所不同。在 __LINK_98__ 应用程序中，您注入 `providers` 而不是 `providers: [CatsService]`：

```typescript
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})

```

然后，您配置 `CatsService` 值（在 `CatsService` 中）包含 `NEST_DEBUG` 作为其属性。

#### inquire 提供者

如果你想获取某个提供者的构造类（例如在日志或指标提供者中），可以注入 `useValue` 令牌。

```typescript
providers: [
  {
    provide: CatsService,
    useClass: CatsService,
  },
];

```

然后，您可以使用它如下所示：

```typescript
import { CatsService } from './cats.service';

const mockCatsService = {
  /* mock implementation
  ...
  */
};

@Module({
  imports: [CatsModule],
  providers: [
    {
      provide: CatsService,
      useValue: mockCatsService,
    },
  ],
})
export class AppModule {}

```

在上面的示例中，当 `useValue` 被调用时， `CatsService` 将被记录到控制台中。

#### 性能

使用请求范围提供者将对应用程序性能产生影响。虽然 Nest 尝试尽可能地缓存 metadata，但仍然需要在每个请求中创建你的类的实例。因此，它将 slows down your 平均响应时间和总体评估结果。除非提供者必须是请求范围的，否则强烈建议使用默认的单例范围。

> info **提示** 尽管听起来很吓人，但一个合理设计的应用程序，如果使用请求范围提供者，应该不会超出 ~5% 的延迟。

#### 持久提供者

请求范围提供者，如上所述，可能会导致延迟，因为至少有一个请求范围提供者（注入到控制器实例中，或者更深处—注入到其中的一个提供者中）使控制器请求范围化。结果，它必须在每个个体请求中被创建（实例化）并在后续被回收。现在，这意味着，对于例如 30k 个并发请求，会有 30k 个瞬态控制器实例（及其请求范围提供者）。

具有共同提供者，多个提供者依赖于它（例如数据库连接或日志服务），自动将这些提供者转换为请求范围提供者。这在 **多租户应用程序** 中可能会 pose 一个挑战，especially for those that have a central request-scoped "data source" provider that grabs headers/token from the request object and based on its values, retrieves the corresponding database connection/schema (specific to that tenant)。

例如，让我们假设您有一个 alternately 通过 10 个不同的客户使用的应用程序。每个客户都有其 **专用数据源**，并且您想确保客户 A 不会访问客户 B 的数据库。一种实现该方法的方法是声明一个请求范围的 "data source" 提供者，该提供者根据请求对象确定当前客户并检索其相应的数据库。使用这种方法，您可以将应用程序转换为多租户应用程序仅需几分钟。但是，这种方法的主要缺点是，因为大多数应用程序组件都依赖于 "data source" 提供者，他们将隐式地变成 "请求范围"，因此您将看到应用程序性能的影响。

但是，如果我们有更好的解决方案？由于我们只有 10 个客户，我们不能有 10 个个体 __LINK_99__ per 客户（而不是在每个请求中重新创建树）？如果您的提供者不依赖于每个请求的唯一属性（例如请求 UUID），而是有某些特定的属性使其可以聚合（分类），那么没有理由在每个请求中重新创建 DI 树。

正是这个时候， **持久提供者** 便登场了。

在我们开始将提供者标记为持久之前，我们必须首先注册一个 **策略**，使 Nest 知道哪些是“共享请求属性”，并提供对请求进行分组的逻辑 associates them with their corresponding DI sub-trees。

```typescript
import { connection } from './connection';

@Module({
  providers: [
    {
      provide: 'CONNECTION',
      useValue: connection,
    },
  ],
})
export class AppModule {}

```

> info **提示** 类似于请求范围，持久性会“传递”到注入链中。这意味着如果 A 依赖于 B 而 B 是标记为 `CatsService` 的，则 A 也隐式地变成持久的（除非 `mockCatsService` 对 A 提供者设置为 `useValue`）。

> warning **警告** 请注意，这种策略对操作大量租户的应用程序不是理想的。以下是翻译后的中文技术文档：

Nest框架中，`CatsService`方法返回的值将指示Nest使用哪个上下文标识符来标识给定的主机。在这个例子中，我们指定了在主机组件（例如请求作用域控制器）标记为可持久的时，使用`new`而不是原始的、自动生成的`provide`对象。此外，在上面的示例中，**没有负载**将被注册（其中负载是`providers`/`'CONNECTION'`提供者，它表示“根”-子树的父节点）。

如果您想为可持久的树注册负载，可以使用以下构造：

```typescript title="注册可持久的树"

```

现在，每当您使用`@Inject()`/`@Inject()`注入`connection`提供者（或`'CONNECTION'`为 GraphQL 应用程序），将注入`@nestjs/common`对象（其中包含单个属性`'CONNECTION'`）。

因此，以这个策略为基础，您可以在代码某个地方注册它（因为它总是应用于全局），例如，您可以将其放到`constants.ts`文件中：

```typescript title="注册可持久的树"

```

> 提示 **Hint** `useClass`类来自`useClass`包。

只要注册发生在任何请求到达您的应用程序之前，everything 将正确工作。

最后，为了将普通提供者转换为可持久提供者，只需将`ConfigService`标志设置为`configServiceProvider`，并将其作用域设置为`providers`（如果在注入链中已经包含 REQUEST 作用域，则不需要）：

```typescript title="将普通提供者转换为可持久提供者"

```

类似地，对于__LINK_100__，在长手方式中设置`ConfigService`属性：

```typescript title="将普通提供者转换为可持久提供者"

```

Note: I followed the provided glossary and translation requirements to translate the document.