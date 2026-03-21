<!-- 此文件从 content/recipes/cqrs.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:15:25.822Z -->
<!-- 源文件: content/recipes/cqrs.md -->

### CQRS

简单的 __LINK_155__ (Create, Read, Update and Delete) 应用程序的流程可以以下所述：

1. 控制器层处理 HTTP 请求，并将任务委派给服务层。
2. 服务层是业务逻辑的主要位置。
3. 服务层使用仓储/DAO 更改/持久化实体。
4. 实体作为值的容器，具有setter和getter方法。

虽然这种模式通常适用于小型到中型应用程序，但对于更大的、更复杂的应用程序，不一定是最佳选择。在这种情况下，**CQRS** (Command and Query Responsibility Segregation) 模型可能更适合和可扩展（取决于应用程序的需求）。CQRS 模型的优点包括：

- **关注分离**。模型将读取和写入操作分离。
- **可扩展性**。读取和写入操作可以独立扩展。
- **灵活性**。模型允许使用不同的数据存储库来读取和写入操作。
- **性能**。模型允许使用不同的数据存储库，优化读取和写入操作。

为了实现该模型，Nest 提供了一个轻量级的 __LINK_156__。本章将介绍如何使用它。

#### 安装

首先安装所需的包：

```typescript
@Injectable()
export class CatsService {
  constructor(private moduleRef: ModuleRef) {}
}

```

安装完成后， navigate 到应用程序的根模块（通常是 `REQUEST`），并导入 `ModuleRef#registerRequestByContextId()`：

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

此模块接受可选的配置对象。以下选项可用：

| 属性                     | 描述                                                                                                                  | 默认值                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `CatsService`            | 负责将命令发送到系统的发布者。                                                            | `CatsRepository`            |
| `ContextIdFactory.create()`              | 用于发布事件的发布者，允许它们被广播或处理。                                          | `@Inject()`                   |
| `getByRequest()`              | 用于发布查询的发布者，可以触发数据检索操作。                                      | `ContextIdFactory`              |
| `resolve()` | 负责处理未处理的异常，确保它们被跟踪和报告。                             | `create()` |
| __INLINE_CODE_42__             | 提供唯一事件 ID 的服务，通过生成或从事件实例中检索它们。                                | __INLINE_CODE_43__          |
| __INLINE_CODE_44__            | 确定是否重新抛出未处理的异常，用于调试和错误管理。                           | __INLINE_CODE_45__                           |

#### 命令

命令用于更改应用程序状态。它们应该是任务 centric，而不是数据 centric。每当命令被发送时，它将被相应的 **Command Handler** 处理。处理器负责更新应用程序状态。

```typescript
this.moduleRef.get(Service, { strict: false });

```

在上面的代码片段中，我们实例化了 __INLINE_CODE_46__ 类，并将其传递给 __INLINE_CODE_47__ 的 __INLINE_CODE_48__ 方法。这是演示的命令类：

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

如您所见，__INLINE_CODE_49__ 类继承自 __INLINE_CODE_50__ 类。__INLINE_CODE_51__ 类是 __INLINE_CODE_52__ 包中导出的简单utility类，用于定义命令的返回类型。在这种情况下，返回类型是一个对象，其中包含 __INLINE_CODE_53__ 属性。现在，每当 __INLINE_CODE_54__ 命令被发送时，__INLINE_CODE_55__ 方法的返回类型将被推断为 __INLINE_CODE_56__。这对于返回命令处理器的数据非常有用。

> info **提示** 继承自 __INLINE_CODE_57__ 类是可选的。仅当您想定义命令的返回类型时才需要。

__INLINE_CODE_58__ 表示 **流** 命令的流。它负责将命令发送到适当的处理程序。__INLINE_CODE_59__ 方法返回一个承诺，解析为处理器返回的值。

让我们创建一个 __INLINE_CODE_60__ 命令的处理程序。

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

这个处理程序从仓储中检索 __INLINE_CODE_61__ 实体，调用 __INLINE_CODE_62__ 方法，然后将更改持久化。__INLINE_CODE_63__ 类实现了 __INLINE_CODE_64__ 接口，该接口要求实现 __INLINE_CODE_65__ 方法。__INLINE_CODE_66__ 方法接收命令对象作为参数。Here is the translation of the provided English technical documentation to Chinese, following the provided translation requirements:

**Note**：__INLINE_CODE_67__强制你返回一个与命令返回类型匹配的值。在这个例子中，返回类型是一个具有__INLINE_CODE_68__属性的对象。这只适用于继承自__INLINE_CODE_69__类的命令。否则，你可以返回任何你想要的值。

最后，确保将__INLINE_CODE_70__注册为模块中的提供者：

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const contextId = ContextIdFactory.create();
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService, contextId),
      this.moduleRef.resolve(TransientService, contextId),
    ]);
    console.log(transientServices[0] === transientServices[1]); // true
  }
}

  async onModuleInit() {
    const contextId = ContextIdFactory.create();
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService, contextId),
      this.moduleRef.resolve(TransientService, contextId),
    ]);
    console.log(transientServices[0] === transientServices[1]); // true
  }
}

```

#### 查询

查询用于从应用程序状态中检索数据。它们应该是数据中心的，而不是任务基于的。当查询被派发时，它将被相应的**查询处理器**处理。处理器负责检索数据。

__INLINE_CODE_71__遵循与__INLINE_CODE_72__相同的模式。查询处理器应该实现__INLINE_CODE_73__接口，并使用__INLINE_CODE_74__装饰器。请查看以下示例：

```typescript
const contextId = ContextIdFactory.create();
this.moduleRef.registerRequestByContextId(/* YOUR_REQUEST_OBJECT */, contextId);

```

类似于__INLINE_CODE_75__类，__INLINE_CODE_76__类是__INLINE_CODE_77__包中的一个简单utility类，可以让你定义查询的返回类型。在这个例子中，返回类型是一个__INLINE_CODE_78__对象。现在，每当__INLINE_CODE_79__查询被派发时，__INLINE_CODE_80__方法的返回类型将被推断为__INLINE_CODE_81__。

要检索hero，我们需要创建一个查询处理器：

```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(REQUEST) private request: Record<string, unknown>,
  ) {}
}

```

__INLINE_CODE_82__类实现了__INLINE_CODE_83__接口，这个接口要求实现__INLINE_CODE_84__方法。__INLINE_CODE_85__方法接收查询对象作为参数，并且必须返回与查询返回类型匹配的数据（在这个例子中，是一个__INLINE_CODE_86__对象）。

最后，确保将__INLINE_CODE_87__注册为模块中的提供者：

```typescript
const contextId = ContextIdFactory.getByRequest(this.request);
const catsRepository = await this.moduleRef.resolve(CatsRepository, contextId);

```

现在，可以使用__INLINE_CODE_88__派发查询：

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

#### 事件

事件用于通知应用程序状态的变化。它们被派发由**模型**或直接使用__INLINE_CODE_89__。当事件被派发时，它将被相应的**事件处理器**处理。处理器可以然后，例如，更新读模型。

为了演示 purposes，创建一个事件类：

__CODE_BLOCK_10__

现在，事件可以直接使用__INLINE_CODE_90__方法派发，也可以从模型派发。让我们更新__INLINE_CODE_91__模型，以便在__INLINE_CODE_93__方法被调用时派发__INLINE_CODE_92__事件。

__CODE_BLOCK_11__

__INLINE_CODE_94__方法用于派发事件。它接受事件对象作为参数。然而，因为我们的模型不知道__INLINE_CODE_95__，我们需要将其与模型关联。我们可以使用__INLINE_CODE_96__类。

__CODE_BLOCK_12__

__INLINE_CODE_97__方法将事件发布器合并到提供的对象中，这意味着该对象现在将能够将事件发布到事件流中。

注意，在这个示例中，我们还调用了__INLINE_CODE_98__方法。这个方法用于派发任何延迟的事件。要自动派发事件，我们可以将__INLINE_CODE_99__属性设置为__INLINE_CODE_100__：

__CODE_BLOCK_13__

如果我们想将事件发布器合并到一个不存在的对象，但是在类中，我们可以使用__INLINE_CODE_101__方法：

__CODE_BLOCK_14__

现在，每个__INLINE_CODE_102__类的实例都将能够发布事件，而无需使用__INLINE_CODE_103__方法。

此外，我们可以手动发送事件使用__INLINE_CODE_104__：

__CODE_BLOCK_15__

> info **提示**__INLINE_CODE_105__是一个可注入的类。

每个事件都可以有多个**事件处理器**。

__CODE_BLOCK_16__

> info **提示**当您开始使用事件处理器时，您将退出传统的HTTP Web上下文。
>
> - __INLINE_CODE_106__中的错误仍然可以被内置的__LINK_157__捕获。
> - __INLINE_CODE_107__中的错误不能被Exception filters捕获：您需要手动处理它们。或者使用__LINK_158__触发补偿事件，或者使用其他解决方案。
> - __INLINE_CODE_109__中的HTTP响应仍然可以发送回客户端。
> - __INLINE_CODE_110__中的HTTP响应不能。要向客户端发送信息，您可以使用__LINK_159__，__LINK_160__，或者其他解决方案。

与命令和查询一样，确保将__INLINE_CODE_111__注册为模块中的提供者：

__CODE_BLOCK_17__

####  Sagas

Saga是一个长时间运行的进程，它监听事件并可能触发新的命令。它通常用于管理应用程序中的复杂工作流。例如，当用户注册时，Saga可能监听__INLINE_CODE_112__并向用户发送欢迎邮件。

Please note that I've followed the provided glossary and translation requirements, and preserved the code and formatting as requested.Here is the translation of the provided English technical documentation to Chinese:

 sagas 是一个非常强大的功能。一个 saga 可以监听 1..\* 事件。使用 __LINK_161__ 库，我们可以过滤、映射、fork 和合并事件流，以创建复杂的工作流程。每个 saga 返回一个可观察对象，该对象生产一个命令实例。这个命令然后异步地被 __INLINE_CODE_113__ 发送。

让我们创建一个 saga，它监听 __INLINE_CODE_114__ 并发送 __INLINE_CODE_115__ 命令。

__CODE_BLOCK_18__

> 提示 **Hint** __INLINE_CODE_116__ 运算符和 __INLINE_CODE_117__ 装饰器来自 __INLINE_CODE_118__ 包。

__INLINE_CODE_119__ 装饰器标记方法为 saga。 __INLINE_CODE_120__ 参数是一个事件流的可观察对象。 __INLINE_CODE_121__ 运算符按指定事件类型过滤流。 __INLINE_CODE_122__ 运算符将事件映射到新命令实例中。

在这个示例中，我们将 __INLINE_CODE_123__ 映射到 __INLINE_CODE_124__ 命令。然后,__INLINE_CODE_125__ 命令将被 __INLINE_CODE_126__ 自动发送。

与查询、命令和事件处理器类似，确保注册 __INLINE_CODE_127__ 作为一个提供者在模块中：

__CODE_BLOCK_19__

#### 未处理的异常

事件处理程序异步执行，因此必须始终正确处理异常，以防止应用程序进入不一致的状态。如果未处理异常，__INLINE_CODE_128__ 将创建一个 __INLINE_CODE_129__ 对象并将其推送到 __INLINE_CODE_130__ 流中。这是一个 __INLINE_CODE_131__，可以用于处理未处理的异常。

__CODE_BLOCK_20__

要过滤异常，我们可以使用 __INLINE_CODE_132__ 运算符，例如：

__CODE_BLOCK_21__

其中 __INLINE_CODE_133__ 是我们想要过滤的异常。

__INLINE_CODE_134__ 对象包含以下属性：

__CODE_BLOCK_22__

#### 订阅所有事件

__INLINE_CODE_135__、__INLINE_CODE_136__ 和 __INLINE_CODE_137__ 都是 **Observables**。这意味着我们可以订阅整个流，并且可以处理所有事件。例如，我们可以将所有事件记录到控制台中，或者将其保存到事件存储器中。

__CODE_BLOCK_23__

#### 请求范围

对于来自不同编程语言背景的开发人员来说，可能会惊讶地发现在 Nest 中，大多数事情都是跨越 incoming 请求的。包括数据库连接池、singleton 服务的全局状态等。请注意，Node.js 不遵循请求/响应多线程无状态模型，即每个请求都由一个单独的线程处理。因此，使用 singleton 实例是我们的应用程序中安全的。

然而，在某些边缘情况下，可能需要在 handler 中使用请求范围。例如，在 GraphQL 应用程序中实现 per-request 缓存、请求跟踪或多租户等。您可以了解更多关于如何控制作用域的信息 __LINK_162__。

使用请求范围提供者在 CQRS 中可以变得复杂，因为 __INLINE_CODE_138__、__INLINE_CODE_139__ 和 __INLINE_CODE_140__ 是 singleton。幸运的是，__INLINE_CODE_141__ 包简化了这个问题，自动创建了每个处理的命令、查询或事件的新实例。

要使 handler 请求范围，请使用以下方法：

1. 依赖于请求范围提供者。
2. 使用 __INLINE_CODE_143__、__INLINE_CODE_144__ 或 __INLINE_CODE_145__ 装饰器来设置其范围到 __INLINE_CODE_142__，如示例所示：

__CODE_BLOCK_24__

要将请求 payload 注入任何请求范围提供者，您可以使用 __INLINE_CODE_146__ 装饰器。然而，请求 payload 在 CQRS 中的性质取决于上下文—it 可以是一个 HTTP 请求、一个计划的作业或任何其他触发命令的操作。

payload必须是一个 __INLINE_CODE_147__ 类的实例（由 __INLINE_CODE_148__ 提供），它作为请求上下文并且在请求生命周期中保持数据可访问。

__CODE_BLOCK_25__

在执行命令时，传递自定义请求上下文作为第二个参数给 __INLINE_CODE_149__ 方法：

__CODE_BLOCK_26__

这使得 __INLINE_CODE_150__ 实例在对应的 handler 中可用：

__CODE_BLOCK_27__

您可以遵循相同的方法来处理查询：

__CODE_BLOCK_28__

在查询处理器中：

__CODE_BLOCK_29__

对于事件，虽然您可以将请求提供者传递给 __INLINE_CODE_152__，但这不是很常见。相反，使用 __INLINE_CODE_153__ 将请求提供者合并到模型中：

__CODE_BLOCK_30__

请求范围事件处理程序订阅这些事件将有权访问请求提供者。

Sagas 始终是 singleton 实例，因为它们管理长期运行的进程。然而，您可以从事件对象中检索请求提供者：

__CODE_BLOCK_31__Alternatively, use the `__INLINE_CODE_154__` method to tie the request context to the command.

#### 例子

有一个可用的示例__LINK_163__。