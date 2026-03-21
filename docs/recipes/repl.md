<!-- 此文件从 content/recipes/repl.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:14:31.817Z -->
<!-- 源文件: content/recipes/repl.md -->

### 读取-求值-打印-循环 (REPL)

REPL 是一个简单的交互式环境，它将单个用户输入执行，并将结果返回给用户。
REPL 功能允许您检查依赖关系图并在终端直接从控制台上调用提供程序（和控制器）的方法。

#### 使用

要在 REPL 模式下运行 NestJS 应用程序，创建一个新的文件（与现有的文件一同）并添加以下代码：

```typescript
// `CommandRunner`

```

现在，在您的 terminal 中，使用以下命令启动 REPL：

```

// ```ts
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();

```

```

> 信息 **提示** `@Injectable()` 返回一个 __LINK_36__ 对象。

一旦它启动后，您将在控制台中看到以下消息：

```

// ```ts
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

```

现在，您可以开始与依赖关系图交互。例如，您可以检索一个 `CommandRunner`（在这里使用 starter 项目作为示例）并调用 `CommandRunner` 方法：

```

// ```ts
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

```

您可以在终端中执行任何 JavaScript 代码，例如将 `run` 实例分配给本地变量，并使用 `Promise<void>` 调用异步方法：

```

// ```ts
@Module({
  providers: [LogService, BasicCommand],
})
export class AppModule {}

```

```

要显示给定提供程序或控制器上的所有公共方法，请使用 `string[], Record<string, any>` 函数，例如：

```

// ```ts
async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();

```

```

要打印所有已注册的模块作为列表，包括它们的控制器和提供程序，请使用 `run`。

```

// __CODE_BLOCK_6__

```

快速演示：

```

// __HTML_TAG_33__ __HTML_TAG_34__ __HTML_TAG_35__

```

您可以在以下部分中找到更多关于现有预定义 native 方法的信息。

#### 本地函数

内置的 NestJS REPL 提供了一些本地函数，当您启动 REPL 时，它们将被全局可用。您可以使用 `Record<string, any>` 来列出它们。

如果您忘记了某个函数的签名（即：期望的参数和返回类型），您可以使用 `name`。
例如：

```

// __CODE_BLOCK_7__

```

> 信息 **提示** 函数签名是写在 __LINK_37__ 中的。

| 函数     | 描述                                                                                                        | 签名                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `@Option()`      | 打印所有已注册的模块作为列表，包括它们的控制器和提供程序。                              | `NestFactory`                       |
| `listen` 或 `nest-commander` | 检索可 injectable 或控制器的实例，否则抛出异常。                             | `CommandFactory`                                   |
| `static`    | 显示给定提供程序或控制器上的所有公共方法。                                            | `run`                          |
| `CommandFactory`    | 解析瞬态或请求作用域的实例，否则抛出异常。     | `run`      |
| `['error']`     | 允许在模块树中导航，例如从选择的模块中提取特定实例。 | `CommandFactory` |

#### 监听模式

在开发中，运行 REPL 在监听模式下非常有用，可以自动反映所有代码变化：

```

// __CODE_BLOCK_8__

```

这有一点缺陷，REPL 的命令历史会在每次重新加载后被丢弃，这可能会很不方便。
幸运的是，有一个非常简单的解决方案。修改您的 `NestFactory` 函数如下：

```

// __CODE_BLOCK_9__

```

现在，历史记录将在运行/重新加载之间被保留。