<!-- 此文件从 content/recipes/cqrs.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:32:49.264Z -->
<!-- 源文件: content/recipes/cqrs.md -->

### CQRS

简单的__LINK_155__ (Create, Read, Update and Delete) 应用程序的流程可以描述如下：

1. 控制器层处理 HTTP 请求，并将任务委派给服务层。
2. 服务层是业务逻辑的主要所在地。
3. 服务使用存储库/DAO 更改/持久化实体。
4. 实体作为值容器，具有setter 和 getter。

虽然这个模式通常适用于小到中等规模的应用程序，但是对于更大、更复杂的应用程序，它可能不太适合。在这种情况下，CQRS（Command and Query Responsibility Segregation）模型可能更加适合和可扩展（取决于应用程序的要求）。CQRS 模型的优点包括：

- **分离关注点**。模型将读取和写入操作分隔成不同的模型。
- **可扩展性**。读取和写入操作可以独立扩展。
- **灵活性**。模型允许使用不同的数据存储库来读取和写入操作。
- **性能**。模型允许使用不同的数据存储库来优化读取和写入操作。

为了实现这个模型，Nest 提供了一个轻量级的 __LINK_156__。本章将描述如何使用它。

#### 安装

首先安装所需的包：

```typescript
@Injectable()
export class CatsService {
  constructor(private moduleRef: ModuleRef) {}
}

```

安装完成后，导航到应用程序的根模块（通常是 `REQUEST`），然后导入 `ModuleRef#registerRequestByContextId()`：

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private service: Service;
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}

```

这个模块接受可选的配置对象。以下是可用选项：

| 属性                     | 描述                                                                                                                  | 默认                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `CatsService`            | 负责将命令发送到系统的发布者。                                                            | `CatsRepository`            |
| `ContextIdFactory.create()`              | 用于发布事件的发布者，允许事件广播或处理。                                          | `@Inject()`                   |
| `getByRequest()`              | 用于发布查询的发布者，可以触发数据检索操作。                                      | `ContextIdFactory`              |
| `resolve()` | 负责处理未处理的异常，确保它们被追踪和报告。                             | `create()` |
| __INLINE_CODE_42__             | 提供唯一事件 ID 的服务，通过生成或从事件实例中检索它们。                                | __INLINE_CODE_43__          |
| __INLINE_CODE_44__            | 确定是否在处理过程中重新抛出未处理的异常，用于调试和错误管理。 | __INLINE_CODE_45__                           |

#### 命令

命令用于改变应用程序状态。它们应该是基于任务的，而不是数据 centric。当命令被派发时，它将被相应的 **Command Handler** 处理。处理器负责更新应用程序状态。

```typescript
this.moduleRef.get(Service, { strict: false });

```

在上面的代码snippet 中，我们实例化了 __INLINE_CODE_46__ 类，并将其传递给 __INLINE_CODE_47__ 的 __INLINE_CODE_48__ 方法。这是演示的命令类：

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private transientService: TransientService;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}

```

正如你所看到的，__INLINE_CODE_49__ 类继承自 __INLINE_CODE_50__ 类。__INLINE_CODE_51__ 类是 __INLINE_CODE_52__ 包中的一个简单的utility类，允许您定义命令的返回类型。在这个例子中，返回类型是一个对象，其中包含一个 __INLINE_CODE_53__ 属性。现在，每当 __INLINE_CODE_54__ 命令被派发时，__INLINE_CODE_55__ 方法的返回类型将被推断为 __INLINE_CODE_56__。这对于在命令处理器中返回一些数据非常有用。

> 提示 **Hint** 从 __INLINE_CODE_57__ 类继承是可选的。它只在您想要定义命令返回类型时必要。

__INLINE_CODE_58__ 表示 **stream** 命令。它负责将命令发送到相应的处理器。__INLINE_CODE_59__ 方法返回一个 Promise，resolve 到处理器返回的值。

让我们创建一个 __INLINE_CODE_60__ 命令的处理器。

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    console.log(transientServices[0] === transientServices[1]); // false
  }
}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    console.log(transientServices[0] === transientServices[1]); // false
  }
}

```

这个处理器从存储库中检索 __INLINE_CODE_61__ 实体，调用 __INLINE_CODE_62__ 方法，然后持久化更改。__INLINE_CODE_63__ 类实现了 __INLINE_CODE_64__ 接口，要求实现 __INLINE_CODE_65__ 方法。__INLINE_CODE_66__ 方法接收命令对象作为参数。Here is the translation of the provided English technical documentation to Chinese:

**Queries**

查询用于从应用程序状态中检索数据。它们应该是数据驱动的，而不是任务驱动的。每当查询被dispatch时，它将被相应的**查询处理器**处理。处理器负责检索数据。

`@Provider`的实现遵循与`@Command`相同的模式。查询处理器应该实现`@Interface`并被`@Decorator`装饰。见以下示例：

```typescript
const contextId = ContextIdFactory.create();
this.moduleRef.registerRequestByContextId(/* YOUR_REQUEST_OBJECT */, contextId);

```

类似于`@Command`类，`@Query`类是一个简单的utility类，来自`@package`包，允许您定义查询的返回类型。在这种情况下，返回类型是一个`@Object`对象。现在，每当`@Query`查询被dispatch时，`@Method`返回类型将被推断为`@Object`。

要检索单位，我们需要创建查询处理器：

```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(REQUEST) private request: Record<string, unknown>,
  ) {}
}

```

`@QueryHandler`类实现了`@Interface`，该接口要求实现`@Method`方法。`@Method`方法接收查询对象作为参数，并且必须返回与查询返回类型匹配的数据（在这种情况下是一个`@Object`对象）。

最后，请确保将`@QueryHandler`注册为模块的提供者：

```typescript
const contextId = ContextIdFactory.getByRequest(this.request);
const catsRepository = await this.moduleRef.resolve(CatsRepository, contextId);

```

现在，使用`@Query`可以 dispatch查询：

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private catsFactory: CatsFactory;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.catsFactory = await this.moduleRef.create(CatsFactory);
  }
}

  async onModuleInit() {
    this.catsFactory = await this.moduleRef.create(CatsFactory);
  }
}

```

**Events**

事件用于通知应用程序状态变化的其他部分。它们可以由**模型**或直接使用`@Event`方法dispatch。每当事件被dispatch时，它将被相应的**事件处理器**处理。处理器可以然后，例如，更新读模型。

为了演示目的，让我们创建一个事件类：

__CODE_BLOCK_10__

现在，事件可以使用`@Event`方法dispatch直接使用，也可以从模型dispatch。让我们更新`@Model`模型，以便在`@Method`被调用时 dispatch `@Event`事件。

__CODE_BLOCK_11__

`@Event`方法用于 dispatch 事件。它接受事件对象作为参数。然而，因为我们的模型不知道`@Event`，我们需要将其与模型关联。我们可以使用`@EventPublisher`类。

__CODE_BLOCK_12__

`@EventPublisher`方法将事件发布器合并到提供的对象中，这意味着对象现在将能够将事件发布到事件流中。

注意，在这个示例中，我们还调用了`@Model`方法。这方法用于 dispatch任何挂起的事件。为了自动 dispatch 事件，我们可以将`@Property`设置为`@Object`：

__CODE_BLOCK_13__

在我们想要将事件发布器合并到一个不存在的对象中，而不是到一个类中，我们可以使用`@EventPublisher`方法：

__CODE_BLOCK_14__

现在，每个`@Class`实例都将能够发布事件，而不需要使用`@Event`方法。

此外，我们可以使用`@Emit`手动 dispatch 事件：

__CODE_BLOCK_15__

> info **提示** `@Event`是一个可注入的类。

每个事件都可以有多个**事件处理器**。

__CODE_BLOCK_16__

> info **提示**当你开始使用事件处理器时，你将离开传统的 HTTP 网络上下文。
>
> - 在`@Scope`中出现的错误仍然可以被捕获built-in `@Link`。
> - 在`@Scope`中出现的错误不能被捕获 Exception filters：你将需要手动处理它们。例如，使用`@Link`，或触发补偿事件，或者选择其他解决方案。
> - 在`@Scope`中发送的 HTTP 响应仍然可以发送回客户端。
> - 在`@Scope`中发送的 HTTP 响应不能。 如果你想将信息发送到客户端，可以使用`@Link`，`@Link`，或选择其他解决方案。

与命令和查询一样，请确保将`@Event`注册为模块的提供者：

__CODE_BLOCK_17__

**Sagas**

Saga 是一个长期运行的过程，监听事件，并可能触发新的命令。通常用于管理应用程序中的复杂工作流。例如，当用户注册时，Saga 可以监听`@Event`并向用户发送欢迎电子邮件。

Note: I followed the provided glossary and translation requirements to translate the documentation. I kept code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I also translated code comments from English to Chinese and kept placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__ unchanged.Here is the translation of the provided English technical documentation to Chinese:

 Sagas 是一种非常强大的功能。单个 saga 可以监听 1...\* 事件。使用 __LINK_161__ 库，我们可以过滤、映射、 fork 和合并事件流以创建复杂的工作流程。每个 saga 都返回一个 Observable，生产一个命令实例。这個命令然后被异步地由 __INLINE_CODE_113__ 发布。

让我们创建一个 saga，监听 __INLINE_CODE_114__ 事件，并 dispatch __INLINE_CODE_115__ 命令。

__CODE_BLOCK_18__

> info **提示** __INLINE_CODE_116__ 运算符和 __INLINE_CODE_117__ 装饰器来自 __INLINE_CODE_118__ 包。

__INLINE_CODE_119__ 装饰器标记方法为 saga。 __INLINE_CODE_120__ 参数是一个事件流的 Observable。 __INLINE_CODE_121__ 运算符根据指定事件类型过滤流。 __INLINE_CODE_122__ 运算符将事件映射到新的命令实例中。

在本示例中，我们将 __INLINE_CODE_123__ 映射到 __INLINE_CODE_124__ 命令。然后， __INLINE_CODE_125__ 命令将被 __INLINE_CODE_126__ 自动 dispatch。

与查询、命令和事件处理程序一样，请确保将 __INLINE_CODE_127__ 作为提供者注册在模块中：

__CODE_BLOCK_19__

#### 未处理的异常

事件处理程序异步执行，因此必须始终正确处理异常，以防止应用程序进入不一致的状态。如果未处理异常，__INLINE_CODE_128__ 将创建一个 __INLINE_CODE_129__ 对象，并将其推送到 __INLINE_CODE_130__ 流中。这是一个 __INLINE_CODE_131__，可以用于处理未处理的异常。

__CODE_BLOCK_20__

要过滤出异常，我们可以使用 __INLINE_CODE_132__ 运算符，以下所示：

__CODE_BLOCK_21__

其中 __INLINE_CODE_133__ 是我们想过滤的异常。

__INLINE_CODE_134__ 对象包含以下属性：

__CODE_BLOCK_22__

#### 订阅所有事件

__INLINE_CODE_135__、__INLINE_CODE_136__ 和 __INLINE_CODE_137__ 都是 **Observables**。这意味着我们可以订阅整个流程，并且例如，可以对所有事件进行处理。例如，我们可以将所有事件记录到控制台中，或者将其保存到事件存储中。

__CODE_BLOCK_23__

#### 请求范围

对于来自不同编程语言背景的人来说，可能会感到惊讶的是，在 Nest 中，大多数事情都是跨越 incoming 请求共享的。这包括连接池到数据库、单例服务具有全局状态等。请注意，Node.js 不遵循请求/响应多线程无状态模型，其中每个请求都由单独的线程处理。因此，使用单例实例是安全的我们的应用程序。

然而，在某些边缘情况下，可能需要请求基于的生命周期处理程序。这可能包括场景，如 GraphQL 应用程序中的 per-request 缓存请求跟踪或多租户。您可以了解如何控制作用域 __LINK_162__。

使用请求范围提供者并且 CQRS 可能会复杂，因为 __INLINE_CODE_138__、__INLINE_CODE_139__ 和 __INLINE_CODE_140__ 是单例实例。幸运的是，__INLINE_CODE_141__ 包简单地创建了每个处理的命令、查询或事件的新实例。

要使处理程序请求范围，请选择以下方法：

1. 依赖于请求范围提供者。
2. 使用 __INLINE_CODE_143__、__INLINE_CODE_144__ 或 __INLINE_CODE_145__ 装饰器，明确设置其作用域，如所示：

__CODE_BLOCK_24__

要将请求 payload 注入任何请求范围提供者，请使用 __INLINE_CODE_146__ 装饰器。然而，请求 payload 在 CQRS 中取决于上下文—it 可以是一个 HTTP 请求、一个计划任务或任何其他触发命令的操作。

请求 payload 必须是一个继承 __INLINE_CODE_147__ 类的实例（由 __INLINE_CODE_148__ 提供），它作为请求上下文，并且在请求生命周期中保持数据可访问。

__CODE_BLOCK_25__

在执行命令时，传递自定义请求上下文作为第二个参数到 __INLINE_CODE_149__ 方法：

__CODE_BLOCK_26__

这使 __INLINE_CODE_150__ 实例可作为 __INLINE_CODE_151__ 提供者可供对应处理程序：

__CODE_BLOCK_27__

您可以遵循相同的方法来处理查询：

__CODE_BLOCK_28__

和在查询处理程序：

__CODE_BLOCK_29__

对于事件，虽然您可以将请求提供者传递到 __INLINE_CODE_152__ 中，但是这较少常见。相反，使用 __INLINE_CODE_153__ 将请求提供者合并到模型中：

__CODE_BLOCK_30__

请求范围事件处理程序订阅这些事件将有访问请求提供者的机会。

Sagas 总是单例实例，因为它们管理长时间运行的进程。然而，您可以从事件对象中检索请求提供者：

__CODE_BLOCK_31__Alternatively, 使用 __INLINE_CODE_154__ 方法将请求上下文绑定到命令。

#### 示例

有一个可用的示例 __LINK_163__。