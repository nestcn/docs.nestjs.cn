### 日志记录器

Nest 内置了一个基于文本的日志记录器，该记录器在应用程序引导期间以及其他多种情况下（如显示捕获的异常，即系统日志记录）使用。这一功能通过 `@nestjs/common` 包中的 `Logger` 类提供。您可以完全控制日志系统的行为，包括以下任意一项：

- 完全禁用日志记录
- 指定日志的详细级别（例如，显示错误、警告、调试信息等）
- 配置日志消息的格式化方式（原始格式、JSON 格式、彩色格式等）
- 覆盖默认日志记录器的时间戳格式（例如使用 ISO8601 标准作为日期格式）
- 完全覆盖默认日志记录器
- 通过扩展来自定义默认日志记录器
- 利用依赖注入来简化应用程序的构建和测试

您还可以使用内置日志记录器，或创建自定义实现，来记录应用程序级别的事件和消息。

如果您的应用需要与外部日志系统集成、自动基于文件的日志记录或将日志转发到集中式日志服务，可以使用 Node.js 日志库实现完全自定义的日志解决方案。一个流行的选择是 [Pino](https://github.com/pinojs/pino)，它以高性能和灵活性著称。

#### 基础定制

要禁用日志记录，请在作为第二个参数传递给 `NestFactory.create()` 方法的（可选）Nest 应用程序选项对象中，将 `logger` 属性设置为 `false`。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: false,
});
await app.listen(process.env.PORT ?? 3000);
```

要启用特定日志级别，请将 `logger` 属性设置为一个字符串数组，指定要显示的日志级别，如下所示：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn'],
});
await app.listen(process.env.PORT ?? 3000);
```

数组中的值可以是 `'log'`、`'fatal'`、`'error'`、`'warn'`、`'debug'` 和 `'verbose'` 的任意组合。

要禁用彩色输出，请将 `colors` 属性设置为 `false` 的 `ConsoleLogger` 对象作为 `logger` 属性的值传递。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    colors: false,
  }),
});
```

要为每条日志消息配置前缀，请传递带有 `ConsoleLogger` 对象并设置 `prefix` 属性：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    prefix: 'MyApp', // Default is "Nest"
  }),
});
```

以下是表格中列出的所有可用选项：

| 选项            | 描述                                                                                                                                                                                                                                                   | 默认                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| logLevels       | 启用的日志级别。                                                                                                                                                                                                                                       | \['log', 'error', 'warn', 'debug', 'verbose'\] |
| timestamp       | 如果启用，将打印当前日志消息与前一条日志消息之间的时间戳（时间差）。注意：当 json 启用时此选项无效。                                                                                                                                                   | false                                          |
| prefix          | 每条日志消息的前缀。注意：启用 json 时此选项无效。                                                                                                                                                                                                     | Nest                                           |
| json            | 如果启用，将以 JSON 格式打印日志消息。                                                                                                                                                                                                                 | false                                          |
| colors          | 如果启用，将以彩色打印日志消息。默认情况下，若未启用 json 则为 true，否则为 false。                                                                                                                                                                    | true                                           |
| context         | 日志记录器的上下文。                                                                                                                                                                                                                                   | undefined                                      |
| compact         | 若启用，即使对象包含多个属性，日志消息也将以单行形式打印。若设置为数字，只要所有属性符合 breakLength 限制，最多 n 个内部元素会被合并为单行。短数组元素也会被分组显示。                                                                                 | true                                           |
| maxArrayLength  | 指定格式化时包含的 Array、TypedArray、Map、Set、WeakMap 和 WeakSet 元素的最大数量。设为 null 或 Infinity 可显示所有元素。设为 0 或负数则不显示任何元素。当启用 json、禁用颜色且 compact 设为 true 时此设置将被忽略，因为此时会生成可解析的 JSON 输出。 | 100                                            |
| maxStringLength | 指定格式化时包含的最大字符数。设为 null 或 Infinity 可显示全部内容。设为 0 或负数则不显示任何字符。当启用 json、禁用颜色且 compact 设为 true 时此设置将被忽略，因为此时会生成可解析的 JSON 输出。                                                      | 10000                                          |
| sorted          | 若启用，将在格式化对象时对键进行排序。也可指定自定义排序函数。当启用 json、禁用颜色且 compact 设为 true 时此设置将被忽略，因为此时会生成可解析的 JSON 输出。                                                                                           | false                                          |
| depth           | 指定格式化对象时的递归次数。该参数适用于检查大型对象。若要递归至最大调用堆栈大小，可传入 Infinity 或 null。当启用 json、禁用颜色且 compact 设为 true 时此参数将被忽略，因为此时会生成可解析的 JSON 输出。                                              | 5                                              |
| showHidden      | 若设为 true，对象的不可枚举符号和属性将包含在格式化结果中。WeakMap 和 WeakSet 条目以及用户自定义的原型属性也会被包含                                                                                                                                   | false                                          |
| breakLength     | 输入值被分割为多行的长度阈值。设为 Infinity 可将输入格式化为单行（需同时设置"compact"为 true）。当"compact"为 true 时默认值为 Infinity，否则默认为 80。当启用 json、禁用颜色且 compact 设为 true 时此参数将被忽略，因为此时会生成可解析的 JSON 输出。  | Infinity                                       |

#### JSON 日志记录

JSON 日志记录对于现代应用的可观测性以及与日志管理系统的集成至关重要。要在 NestJS 应用中启用 JSON 日志记录，需将 `ConsoleLogger` 对象的 `json` 属性设置为 `true`，然后在创建应用实例时将这一日志配置作为 `logger` 属性的值传入。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    json: true,
  }),
});
```

此配置会以结构化 JSON 格式输出日志，便于与外部系统（如日志聚合器和云平台）集成。例如 **AWS ECS**（弹性容器服务）等平台原生支持 JSON 日志，可实现以下高级功能：

- **日志过滤** ：根据日志级别、时间戳或自定义元数据等字段快速筛选日志。
- **搜索分析** ：使用查询工具分析和追踪应用行为趋势。

此外，如果您使用 [NestJS Mau](https://mau.nestjs.com)，JSON 日志记录可以简化查看日志的过程，使其以结构化的格式良好组织，这对于调试和性能监控特别有用。

:::info 注意
当 `json` 设置为 `true` 时，`ConsoleLogger` 会自动通过将 `colors` 属性设为 `false` 来禁用文本着色。这确保输出保持为有效的 JSON 格式，不包含格式化痕迹。不过，出于开发目的，您可以通过显式将 `colors` 设为 `true` 来覆盖此行为。这会添加带颜色的 JSON 日志，使本地调试时的日志条目更易读。
:::



启用 JSON 日志记录后，日志输出将如下所示（单行形式）：

```json
{
  "level": "log",
  "pid": 19096,
  "timestamp": 1607370779834,
  "message": "Starting Nest application...",
  "context": "NestFactory"
}
```

您可以在本次 [Pull Request](https://github.com/nestjs/nest/pull/14121) 中查看不同变体。

#### 使用日志记录器进行应用程序日志记录

我们可以结合上述多种技术，在 Nest 系统日志记录和我们自己的应用程序事件/消息日志记录中提供一致的行为和格式。

一个良好的实践是在每个服务中实例化来自 `@nestjs/common` 的 `Logger` 类。我们可以像这样在 `Logger` 构造函数中提供我们的服务名称作为 `context` 参数：

```typescript
import { Logger, Injectable } from '@nestjs/common';

@Injectable()
class MyService {
  private readonly logger = new Logger(MyService.name);

  doSomething() {
    this.logger.log('Doing something...');
  }
}
```

在默认的日志记录器实现中，`context` 会显示在方括号内，如下例中的 `NestFactory`：

```bash
[Nest] 19096   - 12/08/2019, 7:12:59 AM   [NestFactory] Starting Nest application...
```

如果我们通过 `app.useLogger()` 提供自定义日志记录器，它实际上会被 Nest 内部使用。这意味着我们的代码保持与实现无关，同时可以通过调用 `app.useLogger()` 轻松将默认日志记录器替换为自定义版本。

这样一来，如果我们按照前一节的步骤调用 `app.useLogger(app.get(MyLogger))` ，那么从 `MyService` 中调用 `this.logger.log()` 将会实际调用 `MyLogger` 实例中的 `log` 方法。

这应该能满足大多数场景需求。但如果你需要更多自定义功能（比如添加和调用自定义方法），请继续阅读下一节。

#### 带时间戳的日志

要为每条日志消息启用时间戳记录，可在创建日志记录器实例时使用可选的 `timestamp: true` 设置。

```typescript
import { Logger, Injectable } from '@nestjs/common';

@Injectable()
class MyService {
  private readonly logger = new Logger(MyService.name, { timestamp: true });

  doSomething() {
    this.logger.log('Doing something with timestamp here ->');
  }
}
```

这将产生以下格式的输出：

```bash
[Nest] 19096   - 04/19/2024, 7:12:59 AM   [MyService] Doing something with timestamp here +5ms
```

注意行尾的 `+5ms`。对于每条日志语句，都会计算与上一条消息的时间差并显示在行尾。

#### 自定义实现

您可以通过将 `logger` 属性值设置为符合 `LoggerService` 接口的对象，来提供 Nest 用于系统日志记录的自定义日志记录器实现。例如，可以指示 Nest 使用内置的全局 JavaScript`console` 对象（它实现了 `LoggerService` 接口），如下所示：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: console,
});
await app.listen(process.env.PORT ?? 3000);
```

实现自定义日志记录器非常简单。只需按照如下方式实现 `LoggerService` 接口的每个方法即可。

```typescript
import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class MyLogger implements LoggerService {
  /**
   * Write a 'log' level log.
   */
  log(message: any, ...optionalParams: any[]) {}

  /**
   * Write a 'fatal' level log.
   */
  fatal(message: any, ...optionalParams: any[]) {}

  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]) {}

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]) {}

  /**
   * Write a 'debug' level log.
   */
  debug?(message: any, ...optionalParams: any[]) {}

  /**
   * Write a 'verbose' level log.
   */
  verbose?(message: any, ...optionalParams: any[]) {}
}
```

然后你可以通过 Nest 应用配置对象的 `logger` 属性来提供 `MyLogger` 的实例。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new MyLogger(),
});
await app.listen(process.env.PORT ?? 3000);
```

虽然这种技术很简单，但它没有为 `MyLogger` 类使用依赖注入。这可能会带来一些挑战，特别是在测试方面，并限制 `MyLogger` 的可重用性。要获得更好的解决方案，请参阅下面的[依赖注入](techniques/logger#依赖注入)部分。

#### 扩展内置日志记录器

与其从头开始编写日志记录器，您可以通过扩展内置的 `ConsoleLogger` 类并重写默认实现的部分行为来满足需求。

```typescript
import { ConsoleLogger } from '@nestjs/common';

export class MyLogger extends ConsoleLogger {
  error(message: any, stack?: string, context?: string) {
    // add your tailored logic here
    super.error(...arguments);
  }
}
```

您可以在功能模块中使用这种扩展的日志记录器，具体方法如下文[使用日志记录器进行应用程序日志记录](techniques/logger#使用日志记录器进行应用程序日志记录)部分所述。

您可以通过以下两种方式让 Nest 使用您扩展的日志记录器进行系统日志记录：1) 将其实例通过应用程序选项对象的 `logger` 属性传递（如上方[自定义实现](techniques/logger#自定义实现)部分所示）；2) 使用下文[依赖注入](techniques/logger#依赖注入)部分展示的技术。如果这样做，请注意如示例代码所示调用 `super`，将特定的日志方法调用委托给父类（内置类），以确保 Nest 能够依赖其预期的内置功能。

#### 依赖注入

要实现更高级的日志功能，您需要利用依赖注入。例如，您可能希望将 `ConfigService` 注入到日志记录器中以进行自定义配置，然后再将这个自定义日志记录器注入到其他控制器和/或提供程序中。要使自定义日志记录器支持依赖注入，需要创建一个实现 `LoggerService` 的类，并将该类作为提供程序注册到某个模块中。例如，您可以

1.  定义一个 `MyLogger` 类，该类可以扩展内置的 `ConsoleLogger`，也可以完全重写它（如前面章节所示）。请确保实现 `LoggerService` 接口。
2.  创建如下所示的 `LoggerModule`，并从该模块提供 `MyLogger` 服务。

```typescript
import { Module } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}
```

通过这种结构，您现在可以提供自定义日志记录器供其他模块使用。由于您的 `MyLogger` 类是模块的一部分，它可以使用依赖注入（例如注入 `ConfigService`）。还需要一种技术来让 Nest 将此自定义日志记录器用于系统日志记录（例如引导和错误处理）。

由于应用程序实例化（`NestFactory.create()`）发生在任何模块上下文之外，它不会参与初始化的常规依赖注入阶段。因此我们必须确保至少有一个应用模块导入 `LoggerModule`，以触发 Nest 实例化 `MyLogger` 类的单例实例。

随后我们可以通过以下构造指示 Nest 使用相同的 `MyLogger` 单例实例：

```typescript
const app = await NestFactory.create(AppModule, {
  bufferLogs: true,
});
app.useLogger(app.get(MyLogger));
await app.listen(process.env.PORT ?? 3000);
```

:::info 注意
在上面的示例中，我们将 `bufferLogs` 设置为 `true` 以确保所有日志都会被缓冲，直到附加了自定义日志记录器（本例中的 `MyLogger`）且应用程序初始化过程完成或失败。如果初始化过程失败，Nest 将回退到原始的 `ConsoleLogger` 来打印所有报告的错误消息。此外，您可以将 `autoFlushLogs` 设置为 `false`（默认为 `true`）以手动刷新日志（使用 `Logger.flush()` 方法）。
:::


这里我们在 `NestApplication` 实例上使用 `get()` 方法来获取 `MyLogger` 对象的单例实例。这种技术本质上是一种为 Nest "注入"日志记录器实例以供使用的方式。`app.get()` 调用会获取 `MyLogger` 的单例实例，并依赖于该实例首先在另一个模块中被注入，如上所述。

您也可以在功能类中注入这个 `MyLogger` 提供者，从而确保 Nest 系统日志和应用日志记录行为的一致性。更多信息请参阅下方的[使用日志记录器进行应用程序日志记录](techniques/logger#使用日志记录器进行应用程序日志记录)和[注入自定义日志记录器](techniques/logger#注入自定义日志记录器) 。

#### 注入自定义日志记录器

首先，使用如下代码扩展内置日志记录器。我们提供 `scope` 选项作为 `ConsoleLogger` 类的配置元数据，指定一个[瞬时](/fundamentals/provider-scopes)作用域，以确保在每个功能模块中都有唯一的 `MyLogger` 实例。在本示例中，我们没有扩展单个 `ConsoleLogger` 方法（如 `log()`、`warn()` 等），但您可以选择这样做。

```typescript
import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class MyLogger extends ConsoleLogger {
  customLog() {
    this.log('Please feed the cat!');
  }
}
```

接下来，使用如下构造创建一个 `LoggerModule`：

```typescript
import { Module } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}
```

接下来，将 `LoggerModule` 导入您的功能模块中。由于我们扩展了默认的 `Logger`，因此可以方便地使用 `setContext` 方法。这样就能开始使用支持上下文的自定义日志记录器，如下所示：

```typescript
import { Injectable } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  constructor(private myLogger: MyLogger) {
    // Due to transient scope, CatsService has its own unique instance of MyLogger,
    // so setting context here will not affect other instances in other services
    this.myLogger.setContext('CatsService');
  }

  findAll(): Cat[] {
    // You can call all the default methods
    this.myLogger.warn('About to return cats!');
    // And your custom methods
    this.myLogger.customLog();
    return this.cats;
  }
}
```

最后，在您的 `main.ts` 文件中配置 Nest 使用自定义日志记录器实例，如下所示。当然在这个示例中，我们实际上并未自定义日志记录器行为（比如通过扩展 `Logger` 的 `log()`、`warn()` 等方法），所以这一步并非必需。但**如果**您为这些方法添加了自定义逻辑并希望 Nest 使用相同的实现，那么这一步就是必需的。

```typescript
const app = await NestFactory.create(AppModule, {
  bufferLogs: true,
});
app.useLogger(new MyLogger());
await app.listen(process.env.PORT ?? 3000);
```

:::info 提示
除了将 `bufferLogs` 设为 `true` 之外，您还可以通过 `logger: false` 指令临时禁用日志记录器。请注意，如果您向 `NestFactory.create` 传递 `logger: false` 参数，在调用 `useLogger` 之前将不会记录任何日志，因此可能会错过一些重要的初始化错误。如果您不介意部分初始消息会使用默认日志记录器进行记录，可以直接省略 `logger: false` 选项。
:::

#### 使用外部日志记录器

生产环境应用通常有特定的日志记录需求，包括高级过滤、格式化和集中式日志记录。Nest 内置的日志记录器用于监控 Nest 系统行为，在开发阶段也可用于功能模块的基础格式化文本日志记录，但生产环境应用通常会利用专门的日志记录模块如 [Winston](https://github.com/winstonjs/winston)。与任何标准 Node.js 应用一样，您可以在 Nest 中充分利用此类模块。
