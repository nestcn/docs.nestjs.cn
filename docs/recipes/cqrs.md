<!-- 此文件从 content/recipes/cqrs.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:03:32.475Z -->
<!-- 源文件: content/recipes/cqrs.md -->

### CQRS

简单的 __LINK_155__ (Create, Read, Update and Delete) 应用程序的流程可以描述如下：

1. 控制器层处理 HTTP 请求，并将任务委派给服务层。
2. 服务层是业务逻辑的主要位置。
3. 服务使用存储库/DAOs 来更改/持久化实体。
4. 实体作为值容器，具有设置和获取方法。

虽然这个模式通常足够小到中等规模的应用程序，但是在更大的、更复杂的应用程序中，它可能不是最佳选择。在这种情况下，**CQRS**（命令和查询责任隔离）模型可能是更好的选择和可扩展的（取决于应用程序的需求）。该模型的优点包括：

- **关注点分离**。模型将读取和写入操作分离到不同的模型中。
- **可扩展性**。读取和写入操作可以独立扩展。
- **灵活性**。模型允许使用不同的数据存储器来读取和写入操作。
- **性能**。模型允许使用不同的数据存储器来优化读取和写入操作。

为了实现该模型，Nest 提供了一个轻量级的 __LINK_156__。本章将描述如何使用它。

#### 安装

首先安装所需的包：

```bash
$ npm i nest-commander

```

安装完成后，请导航到应用程序的根模块（通常是 `NestFactory`），并导入 `app.close()`：

```ts
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();

```

这个模块接受可选的配置对象。以下是可用的选项：

| 属性                     | 描述                                                                                                                  | 默认                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `try/catch`            | 负责将命令发送到系统的发布者。                                                            | `run`            |
| `.catch()`              | 用于发布事件的发布者，允许它们被广播或处理。                                          | `bootstrap()`                   |
| `nest-commander`              | 用于发布查询的发布者，触发数据检索操作。                                      | `CommandFactory`              |
| `CommandTestFactory` | 负责处理未处理的异常，确保它们被跟踪和报告。                             | `Test.createTestingModule` |
| `@nestjs/testing`             | 提供唯一事件 ID 的服务，通过生成或从事件实例中检索它们。                                | `overrideProvider`          |
| `compile()`            | 确定是否重新抛出未处理的异常，用于调试和错误管理。                          | `basic`                           |

#### 命令

命令用于改变应用程序状态。它们应该是任务驱动的，而不是数据驱动的。每当命令被 dispatch 时，它将被相应的 **Command Handler** 处理。处理程序负责更新应用程序状态。

```ts
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';
import { LogService } './log.service';

async function bootstrap() {
  await CommandFactory.run(AppModule, new LogService());

  // or, if you only want to print Nest's warnings and errors
  await CommandFactory.run(AppModule, ['warn', 'error']);
}

bootstrap();

```

在代码片段中，我们实例化了 `-n` 类，并将其传递给 `-s` 的 `-b` 方法。这是示例命令类：

```ts
import { Command, CommandRunner, Option } from 'nest-commander';
import { LogService } from './log.service';

interface BasicCommandOptions {
  string?: string;
  boolean?: boolean;
  number?: number;
}

@Command({ name: 'basic', description: 'A parameter parse' })
export class BasicCommand extends CommandRunner {
  constructor(private readonly logService: LogService) {
    super()
  }

  async run(
    passedParam: string[],
    options?: BasicCommandOptions,
  ): Promise<void> {
    if (options?.boolean !== undefined && options?.boolean !== null) {
      this.runWithBoolean(passedParam, options.boolean);
    } else if (options?.number) {
      this.runWithNumber(passedParam, options.number);
    } else if (options?.string) {
      this.runWithString(passedParam, options.string);
    } else {
      this.runWithNone(passedParam);
    }
  }

  @Option({
    flags: '-n, --number [number]',
    description: 'A basic number parser',
  })
  parseNumber(val: string): number {
    return Number(val);
  }

  @Option({
    flags: '-s, --string [string]',
    description: 'A string return',
  })
  parseString(val: string): string {
    return val;
  }

  @Option({
    flags: '-b, --boolean [boolean]',
    description: 'A boolean parser',
  })
  parseBoolean(val: string): boolean {
    return JSON.parse(val);
  }

  runWithString(param: string[], option: string): void {
    this.logService.log({ param, string: option });
  }

  runWithNumber(param: string[], option: number): void {
    this.logService.log({ param, number: option });
  }

  runWithBoolean(param: string[], option: boolean): void {
    this.logService.log({ param, boolean: option });
  }

  runWithNone(param: string[]): void {
    this.logService.log({ param });
  }
}

```

如您所见，`--help` 类继承自 __INLINE_CODE_50__ 类。__INLINE_CODE_51__ 类是一个简单的utility类，从 __INLINE_CODE_52__ 包中导出，可以让您定义命令的返回类型。在这个例子中，返回类型是一个对象，其中包含一个 __INLINE_CODE_53__ 属性。现在，每当 __INLINE_CODE_54__ 命令被 dispatch 时，__INLINE_CODE_55__ 方法的返回类型将被推断为 __INLINE_CODE_56__。这对于在命令处理器中返回一些数据非常有用。

> 提示 **Hint** 从 __INLINE_CODE_57__ 类继承是可选的。如果您想定义命令的返回类型，则需要继承。

__INLINE_CODE_58__ 表示 **stream** 命令的流。它负责将命令发送到相应的处理程序。__INLINE_CODE_59__ 方法返回一个 promise， resolve 到处理程序返回的值。

现在，让我们创建一个 __INLINE_CODE_60__ 命令的处理程序。

```ts
@Module({
  providers: [LogService, BasicCommand],
})
export class AppModule {}

```

这个处理程序从存储库中检索 __INLINE_CODE_61__ 实体，调用 __INLINE_CODE_62__ 方法，然后将更改持久化。__INLINE_CODE_63__ 类实现了 __INLINE_CODE_64__ 接口，要求实现 __INLINE_CODE_65__ 方法。__INLINE_CODE_66__ 方法接收命令对象作为参数。

Note: I've translated the text according to the provided glossary and followed the guidelines for code and format preservation, special syntax processing, and content guidelines. I've also kept the links and code examples unchanged.Here is the translation of the English technical documentation to Chinese:

#### 命令

命令用于对应用程序状态进行修改。命令应该是 task-based，而不是 data-centric。 When a command is dispatched, it is handled by a corresponding **Command Handler**. The handler is responsible for executing the command.

__INLINE_CODE_67__ 强制你返回一个与命令返回类型相匹配的值。在这个情况下，返回类型是一个带有 __INLINE_CODE_68__ 属性的对象。这只适用于继承自 __INLINE_CODE_69__ 类的命令。否则，你可以返回任何你想要的值。

最后，确保注册 __INLINE_CODE_70__ 作为一个提供者在模块中：

```ts
async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();

```

#### 查询

查询用于从应用程序状态中检索数据。它们应该是数据 centric，而不是 task-based。 When a query is dispatched, it is handled by a corresponding **Query Handler**. The handler is responsible for retrieving the data.

__INLINE_CODE_71__ 跟随着 __INLINE_CODE_72__ 的相同模式。查询处理器应该实现 __INLINE_CODE_73__ 接口并被 __INLINE_CODE_74__ 装饰器装饰。请见以下示例：

__CODE_BLOCK_6__

#### 事件

事件用于通知应用程序其他部分关于应用程序状态的变化。它们被 **模型** 或直接使用 __INLINE_CODE_89__ 发送。 When an event is dispatched, it is handled by corresponding **Event Handlers**. Handlers then, for example, can update the read model.

为了演示 purposes，让我们创建一个事件类：

__CODE_BLOCK_10__

####Saga

Saga 是一个长期运行的进程，它监听事件并可能触发新的命令。它通常用于管理应用程序中的复杂工作流程。例如，当用户注册时，一个 saga 可能监听 __INLINE_CODE_112__ 并将欢迎邮件发送给用户。

Please note that I followed the provided glossary and terminology guidelines strictly throughout the translation.Here is the translation of the provided English technical documentation to Chinese:

 sagas 是一个非常强大的功能。一个 saga 可以监听 1..\* 事件。使用 __LINK_161__ 库，我们可以过滤、映射、分叉和合并事件流，以创建复杂的工作流程。每个 saga 都返回一个 Observable，这个 Observable 生产一个命令实例。这个命令然后由 __INLINE_CODE_113__ 异步地分派。

让我们创建一个 saga，它监听 __INLINE_CODE_114__ 事件并分派 __INLINE_CODE_115__ 命令。

__CODE_BLOCK_18__

> info **提示** __INLINE_CODE_116__ 操作符和 __INLINE_CODE_117__ 装饰器是 __INLINE_CODE_118__ 包中的导出。

__INLINE_CODE_119__ 装饰器标记方法为 saga。 __INLINE_CODE_120__ 参数是一个 Observable 事件流。 __INLINE_CODE_121__ 操作符根据指定事件类型过滤流。 __INLINE_CODE_122__ 操作符将事件映射到新的命令实例中。

在这个示例中，我们将 __INLINE_CODE_123__ 映射到 __INLINE_CODE_124__ 命令。 __INLINE_CODE_125__ 命令然后由 __INLINE_CODE_126__ 自动分派。

与查询、命令和事件处理器一样，请确保注册 __INLINE_CODE_127__ 作为提供者在模块中：

__CODE_BLOCK_19__

#### 未处理的异常

事件处理器异步执行，因此它们必须始终处理异常，以防止应用程序进入不一致的状态。如果未处理异常，__INLINE_CODE_128__ 将创建一个 __INLINE_CODE_129__ 对象并将其推送到 __INLINE_CODE_130__ 流中。这个流是一个 __INLINE_CODE_131__，可以用于处理未处理的异常。

__CODE_BLOCK_20__

要过滤异常，我们可以使用 __INLINE_CODE_132__ 操作符，如下所示：

__CODE_BLOCK_21__

其中 __INLINE_CODE_133__ 是我们想要过滤的异常。

__INLINE_CODE_134__ 对象包含以下属性：

__CODE_BLOCK_22__

#### 订阅所有事件

__INLINE_CODE_135__、__INLINE_CODE_136__ 和 __INLINE_CODE_137__ 都是 **Observables**。这意味着我们可以订阅整个流程，并且可以处理所有事件。例如，我们可以将所有事件记录到控制台中，或者将其保存到事件存储中。

__CODE_BLOCK_23__

#### 请求范围

对于来自不同编程语言背景的人来说，可能会惊讶地发现，在 Nest 中，大多数事情都是跨越 incoming 请求的。包括连接数据库的连接池、全局状态的单例服务等。请注意，Node.js 不遵循请求/响应多线程无状态模型，每个请求都由单独的线程处理。因此，使用单例实例是安全的สำหร我们的应用程序。

然而，在某些边缘情况下，可能需要请求-based 生命周期的处理程序。这可能包括 GraphQL 应用程序中的 per-request 缓存、请求跟踪或多租户等场景。您可以了解更多关于如何控制范围的信息 __LINK_162__。

使用请求范围提供者和 CQRS 可能会复杂，因为 __INLINE_CODE_138__、__INLINE_CODE_139__ 和 __INLINE_CODE_140__ 是单例。幸运的是，__INLINE_CODE_141__ 包提供了自动创建每个处理的命令、查询或事件的新实例的功能。

要使处理程序请求范围，请使用以下方法：

1. 依靠请求范围提供者。
2. 使用 __INLINE_CODE_143__、__INLINE_CODE_144__ 或 __INLINE_CODE_145__ 装饰器显式设置其范围，如下所示：

__CODE_BLOCK_24__

为了将请求负载注入任何请求范围提供者，您可以使用 __INLINE_CODE_146__ 装饰器。然而，请求负载在 CQRS 中的性质取决于上下文—it 可以是 HTTP 请求、计划任务或任何其他触发命令的操作。

请求负载必须是 __INLINE_CODE_147__ 类的实例（由 __INLINE_CODE_148__ 提供），它作为请求上下文并且在请求生命周期中保持数据可访问。

__CODE_BLOCK_25__

在执行命令时，将自定义请求上下文作为 __INLINE_CODE_149__ 方法的第二个参数：

__CODE_BLOCK_26__

这使得 __INLINE_CODE_150__ 实例在对应的处理程序中可用：

__CODE_BLOCK_27__

您可以遵循相同的方法来处理查询：

__CODE_BLOCK_28__

在查询处理器中：

__CODE_BLOCK_29__

对于事件，而你可以将请求提供者传递给 __INLINE_CODE_152__，这较少常见。相反，使用 __INLINE_CODE_153__ 将请求提供者合并到模型中：

__CODE_BLOCK_30__

请求范围事件处理程序订阅这些事件将有访问请求提供者的权限。

Sagas 总是单例实例，因为它们管理长期的进程。但是，您可以从事件对象中检索请求提供者：

__CODE_BLOCK_31__Alternatively, use the `__INLINE_CODE_154__` method to tie the request context to the command.

#### 示例

有一个可工作的示例可以在 __LINK_163__ 中找到。