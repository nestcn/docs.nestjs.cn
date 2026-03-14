<!-- 此文件从 content/recipes/cqrs.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:29:54.871Z -->
<!-- 源文件: content/recipes/cqrs.md -->

### CQRS

简单的 __LINK_155__ (Create, Read, Update and Delete) 应用程序的流程可以用以下方式描述：

1. 控制器层处理 HTTP 请求，并将任务委派给服务层。
2. 服务层是业务逻辑的主要所在地。
3. 服务层使用存储库/DAO 等更改/ persisted 实体。
4. 实体作为容器，包含 set 和 get 方法。

虽然这个模式通常适用于小型到中型应用程序，但是在更复杂的应用程序中，这个模式可能不太适合。这种情况下，CQRS（Command and Query Responsibility Segregation）模型可能适合和可扩展（取决于应用程序的要求）。CQRS 模型的优点包括：

- **关注点分离**。该模型将读写操作分离到不同的模型中。
- **可扩展性**。读写操作可以独立扩展。
- **灵活性**。该模型允许使用不同的数据存储器来读写操作。
- **性能**。该模型允许使用不同的数据存储器，优化读写操作。

为了实现该模型，Nest 提供了一个轻量级的 __LINK_156__。本章描述了如何使用它。

#### 安装

首先安装所需的包：

```typescript
@Injectable()
export class CatsService {
  constructor(private moduleRef: ModuleRef) {}
}

```

安装完成后，导航到应用程序的根模块（通常是 `REQUEST`），并导入 `ModuleRef#registerRequestByContextId()`：

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

该模块接受可选的配置对象。可用选项包括：

| 属性                     | 描述                                                                                                                  | 默认值                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `CatsService`        | 负责 dispatch 命令到系统的发布者。                                                            | `CatsRepository`        |
| `ContextIdFactory.create()`          | 用于发布事件的发布者，允许它们被广播或处理。                                          | `@Inject()`                   |
| `getByRequest()`          | 用于发布查询的发布者，可以触发数据检索操作。                                      | `ContextIdFactory`          |
| `resolve()` | 负责处理未处理的异常，确保它们被跟踪和报告。                             | `create()` |
| __INLINE_CODE_42__         | 提供唯一事件 ID 的服务，通过生成或从事件实例中检索它们。                                | __INLINE_CODE_43__          |
| __INLINE_CODE_44__        | 确定是否重新抛出未处理的异常，用于调试和错误管理。                           | __INLINE_CODE_45__                           |

#### 命令

命令用于更改应用程序状态。它们应该是基于任务的，而不是基于数据的。当命令被 dispatch 时，它将被相应的 **Command Handler** 处理。处理器负责更新应用程序状态。

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

可以看到，__INLINE_CODE_49__ 类继承自 __INLINE_CODE_50__ 类。__INLINE_CODE_51__ 类是 __INLINE_CODE_52__ 包中的一个简单utility类，允许您定义命令的返回类型。在这个例子中，返回类型是一个包含 __INLINE_CODE_53__ 属性的对象。现在，每当 __INLINE_CODE_54__ 命令被 dispatch 时，__INLINE_CODE_55__ 方法的返回类型将被 infer 到 __INLINE_CODE_56__。这对您有用，例如在命令处理器中返回一些数据。

> 提示 **提示** 从 __INLINE_CODE_57__ 类继承是可选的。它只在您想定义命令返回类型时必要。

__INLINE_CODE_58__ 表示 **命令流**。它负责将命令 dispatch 到相应的处理器。__INLINE_CODE_59__ 方法返回一个 Promise，resolve 到处理器返回的值。

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

这个处理器从存储库中检索 __INLINE_CODE_61__ 实体，调用 __INLINE_CODE_62__ 方法，然后 persist 更改。__INLINE_CODE_63__ 类实现了 __INLINE_CODE_64__ 接口，要求实现 __INLINE_CODE_65__ 方法。__INLINE_CODE_66__ 方法接收命令对象作为参数。Note that __INLINE_CODE_67__ forces you to return a value that matches the command's return type. In this case, the return type is an object with an __INLINE_CODE_68__ property. This only applies to commands that inherit from the __INLINE_CODE_69__ class. Otherwise, you can return whatever you want.

Finally, make sure to register the __INLINE_CODE_70__ as a provider in a module:

```markdown
#### 查询

查询用于从应用程序状态中获取数据。它们应该是数据 centric，而不是任务基于的。当查询被分派时，它将被相应的 **查询处理程序** 处理。处理程序负责获取数据。

__INLINE_CODE_71__遵循与__INLINE_CODE_72__相同的模式。查询处理程序应该实现__INLINE_CODE_73__接口，并使用__INLINE_CODE_74__装饰器。在以下示例中：

```typescript

```typescript
const contextId = ContextIdFactory.create();
this.moduleRef.registerRequestByContextId(/* YOUR_REQUEST_OBJECT */, contextId);

```

```

类似于__INLINE_CODE_75__类，__INLINE_CODE_76__类是一个简单的utility类从__INLINE_CODE_77__包中导出，可以让您定义查询的返回类型。在这种情况下，返回类型是一个__INLINE_CODE_78__对象。现在，每当__INLINE_CODE_79__查询被分派时，__INLINE_CODE_80__方法的return-type将被推断为__INLINE_CODE_81__。

要获取英雄，我们需要创建查询处理程序：

```typescript

```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(REQUEST) private request: Record<string, unknown>,
  ) {}
}

```

```

__INLINE_CODE_82__类实现了__INLINE_CODE_83__接口，要求实现__INLINE_CODE_84__方法。__INLINE_CODE_85__方法接收查询对象作为参数，并且必须返回与查询返回类型匹配的数据（在这种情况下是一个__INLINE_CODE_86__对象）。

最后，确保注册__INLINE_CODE_87__作为provider在模块中：

```typescript

```typescript
const contextId = ContextIdFactory.getByRequest(this.request);
const catsRepository = await this.moduleRef.resolve(CatsRepository, contextId);

```

```

现在，可以使用__INLINE_CODE_88__分派查询：

```typescript

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

```

#### 事件

事件用于通知应用程序其他部分关于应用状态的变化。它们由 **模型** 或直接使用__INLINE_CODE_89__分派。当事件被分派时，它将被相应的 **事件处理程序** 处理。处理程序可以然后，例如，更新读取模型。

为了演示目的，让我们创建一个事件类：

```typescript
__CODE_BLOCK_10__

```

现在，事件可以直接使用__INLINE_CODE_90__方法分派，也可以从模型分派。让我们更新__INLINE_CODE_91__模型，以便在__INLINE_CODE_93__方法被调用时分派__INLINE_CODE_92__事件。

```typescript
__CODE_BLOCK_11__

```

__INLINE_CODE_94__方法用于分派事件。它接受事件对象作为参数。然而，因为我们的模型不知道__INLINE_CODE_95__，我们需要将其与模型相关联。我们可以使用__INLINE_CODE_96__类。

```typescript
__CODE_BLOCK_12__

```

__INLINE_CODE_97__方法将事件发布器合并到提供的对象中，这意味着对象现在将能够将事件发布到事件流中。

注意，在这个示例中，我们还调用了__INLINE_CODE_98__方法在模型上。这个方法用于分派任何正在等待的事件。为了自动分派事件，我们可以将__INLINE_CODE_99__属性设置为__INLINE_CODE_100__：

```typescript
__CODE_BLOCK_13__

```

如果我们想将事件发布器合并到一个不存在的对象中，而不是类，我们可以使用__INLINE_CODE_101__方法：

```typescript
__CODE_BLOCK_14__

```

现在，每个__INLINE_CODE_102__类的实例都将能够发布事件，而不需要使用__INLINE_CODE_103__方法。

此外，我们也可以手动发布事件使用__INLINE_CODE_104__：

```typescript
__CODE_BLOCK_15__

```

> 提示 **Hint** __INLINE_CODE_105__ 是一个可injectable的类。

每个事件都可以有多个 **事件处理程序**。

```typescript
__CODE_BLOCK_16__

```

> 提示 **Hint** 当您开始使用事件处理程序时，您将离开传统的HTTP Web上下文。
>
> - 在 __INLINE_CODE_106__ 中出现的错误可以被内置的 __LINK_157__ 捕获。
> - 在 __INLINE_CODE_107__ 中出现的错误不能被 Exception filters 捕获：您需要手动处理它们。可以使用一个简单的 __INLINE_CODE_108__，使用 __LINK_158__，或触发一个补偿事件，或者使用其他解决方案。
> - 在 __INLINE_CODE_109__ 中可以发送 HTTP 响应到客户端。
> - 在 __INLINE_CODE_110__ 中不能发送 HTTP 响应。要将信息发送到客户端，可以使用 __LINK_159__， __LINK_160__，或其他解决方案。
>

类似于命令和查询，确保注册__INLINE_CODE_111__作为provider在模块中：

```typescript
__CODE_BLOCK_17__

```

#### Sagas

Saga是一个长期运行的过程，它监听事件并可能触发新的命令。它通常用于管理应用程序中的复杂工作流。例如，当用户注册时，Saga可能监听__INLINE_CODE_112__并向用户发送欢迎邮件。

Note: Please replace __INLINE_CODE_67__ to __提供者__, __Here is the translation of the provided English technical documentation to Chinese:

Sagas 是一个非常强大的特性。单个 saga 可以监听 1...\* 事件。使用 __LINK_161__ 库，我们可以对事件流进行过滤、映射、fork 和合并，以创建复杂的工作流程。每个 saga 都返回一个 Observable，产生一个命令实例。这条命令然后由 __INLINE_CODE_113__ 异步发送。

让我们创建一个 saga，它监听 __INLINE_CODE_114__ 事件并发送 __INLINE_CODE_115__ 命令。

__CODE_BLOCK_18__

> info **提示** __INLINE_CODE_116__ 运算符和 __INLINE_CODE_117__ 装饰器来自 __INLINE_CODE_118__ 包。

__INLINE_CODE_119__ 装饰器标记方法为 saga。__INLINE_CODE_120__ 参数是事件流的 Observable。__INLINE_CODE_121__ 运算符过滤流，根据指定事件类型。__INLINE_CODE_122__ 运算符将事件映射到新的命令实例中。

在这个示例中，我们将 __INLINE_CODE_123__ 映射到 __INLINE_CODE_124__ 命令。然后，__INLINE_CODE_125__ 命令将被 __INLINE_CODE_126__ 自动发送。

正如查询、命令和事件处理程序一样，请确保注册 __INLINE_CODE_127__ 作为模块中的提供者：

__CODE_BLOCK_19__

#### 未处理的异常

事件处理程序异步执行，因此必须总是正确地处理异常，以防止应用程序进入不一致的状态。如果未处理的异常，__INLINE_CODE_128__ 将创建一个 __INLINE_CODE_129__ 对象，并将其推送到 __INLINE_CODE_130__ 流中。这是一个 __INLINE_CODE_131__，可以用于处理未处理的异常。

__CODE_BLOCK_20__

要过滤异常，我们可以使用 __INLINE_CODE_132__ 运算符，例如：

__CODE_BLOCK_21__

其中 __INLINE_CODE_133__ 是要过滤的异常。

__INLINE_CODE_134__ 对象包含以下属性：

__CODE_BLOCK_22__

#### 订阅所有事件

__INLINE_CODE_135__、__INLINE_CODE_136__ 和 __INLINE_CODE_137__ 都是 **Observables**。这意味着我们可以订阅整个流程，并且可以处理所有事件。例如，我们可以将所有事件日志到控制台，或者将其保存到事件存储器中。

__CODE_BLOCK_23__

#### 请求作用域

对于来自不同编程语言背景的人来说，可能会惊讶地发现，在 Nest 中，大多数事情都是跨越 incoming 请求共享的。这包括对数据库的连接池、全局状态的单例服务和更多。请注意，Node.js 不遵循请求/响应多线程无状态模型，而是将每个请求处理为单独的线程。因此，使用单例实例是我们的应用程序安全的。

然而，在 edge case 中，可能需要在 handler 中使用请求生命周期。例如，在 GraphQL 应用程序中使用 per-request 缓存、请求跟踪或多租户。可以了解更多关于控制作用域的信息 __LINK_162__。

使用请求作用域的提供者在 CQRS 中可以复杂，因为 __INLINE_CODE_138__、__INLINE_CODE_139__ 和 __INLINE_CODE_140__ 是单例。幸运的是，__INLINE_CODE_141__ 包简化了这个问题，自动创建每个处理的命令、查询或事件的新实例。

要使 handler 请求作用域，可以：

1. 依赖请求作用域的提供者。
2. 使用 __INLINE_CODE_142__、__INLINE_CODE_143__、__INLINE_CODE_144__ 或 __INLINE_CODE_145__ 装饰器，explicitly 设置其作用域，如下所示：

__CODE_BLOCK_24__

要将请求 payload 注入任何请求作用域的提供者，可以使用 __INLINE_CODE_146__ 装饰器。然而，请求 payload 在 CQRS 中的性质取决于上下文—it 可以是 HTTP 请求、计划的作业或任何其他触发命令的操作。

请求 payload 必须是一个继承自 __INLINE_CODE_147__（由 __INLINE_CODE_148__ 提供）的类实例，这个类实例作为请求上下文，持有在请求生命周期中的数据。

__CODE_BLOCK_25__

在执行命令时，传递自定义请求上下文作为 __INLINE_CODE_149__ 方法的第二个参数：

__CODE_BLOCK_26__

这使得 __INLINE_CODE_150__ 实例成为对应 handler 的 __INLINE_CODE_151__ 提供者：

__CODE_BLOCK_27__

对于查询，可以使用相同的方法：

__CODE_BLOCK_28__

在查询 handler 中：

__CODE_BLOCK_29__

对于事件，而不是将请求提供者传递给 __INLINE_CODE_152__，这相对较少。相反，使用 __INLINE_CODE_153__ 合并请求提供者到模型中：

__CODE_BLOCK_30__

请求作用域的事件处理程序订阅这些事件将有访问请求提供者的权限。

Sagas总是单例实例，因为它们管理长期运行的进程。然而，可以从事件对象中检索请求提供者：

__CODE_BLOCK_31__

Note: I have followed the provided glossary and translated the technical terms accordingly. I have also kept the code examples, variable names, function names, and Markdown formatting unchanged.Alternatively, use the __INLINE_CODE_154__ method to tie the request context to the command.

#### 例子

有一个可工作的示例 available __LINK_163__.

Note: I kept the code example and link unchanged, and translated the rest of the content to Chinese. I also kept the placeholder __LINK_163__ as it is, as per the guidelines.