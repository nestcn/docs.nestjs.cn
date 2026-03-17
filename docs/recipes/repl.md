<!-- 此文件从 content/recipes/repl.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:35:36.406Z -->
<!-- 源文件: content/recipes/repl.md -->

### 读取-求值-打印-循环 (REPL)

REPL 是一个简单的交互式环境，它可以处理单个用户输入，执行它们，并将结果返回给用户。
REPL 功能允许您检查依赖关系图并在终端直接调用提供程序（和控制器）的方法。

#### 使用

要在 REPL 模式下运行您的 NestJS 应用程序，创建一个新的 `CommandRunner` 文件（与现有 `@Command()` 文件相邻），并在其中添加以下代码：

```typescript

```bash
$ npm i nest-commander

```

```

现在，在您的终端中，使用以下命令启动 REPL：

```typescript

```ts
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

```typescript

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

```

现在，您可以开始与依赖关系图交互。例如，您可以检索一个 `CommandRunner`（在这里使用 starter 项目作为示例）并调用 `CommandRunner` 方法：

```typescript

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

```

您可以从终端中执行任何 JavaScript 代码，例如将 `run` 的实例分配给一个本地变量，并使用 `Promise<void>` 调用异步方法：

```typescript

```ts
@Module({
  providers: [LogService, BasicCommand],
})
export class AppModule {}

```

```

要显示某个提供程序或控制器上所有公共方法，使用 `string[], Record<string, any>` 函数，例如：

```typescript

```ts
async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();

```

```

要打印所有注册的模块列表，包括控制器和提供程序，使用 `run`。

```typescript
__CODE_BLOCK_6__

```

快速演示：

```html
__HTML_TAG_33__ __HTML_TAG_34__ __HTML_TAG_35__

```

您可以在下面部分找到关于预定义 native 方法的更多信息。

#### 原生函数

内置的 NestJS REPL 中有几个原生函数，这些函数在您启动 REPL 时是全局可用的。您可以使用 `Record<string, any>` 列出它们。

如果您不记得某个函数的签名（即：期望参数和返回类型），您可以使用 `name`。
例如：

```typescript
__CODE_BLOCK_7__

```

> 信息 **提示** 那些函数接口是使用 __LINK_37__ 编写的。

| 函数     | 描述                                                                                                        | 签名                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `@Option()`      | 打印所有注册的模块列表，包括控制器和提供程序。                              | `NestFactory`                       |
| `listen` 或 `nest-commander` | 检索一个 injectable 或 controller 的实例，否则抛出异常。                             | `CommandFactory`                                   |
| `static`    |显示某个提供程序或控制器上所有公共方法。                                            | `run`                          |
| `CommandFactory`    |解决 transient 或 request-scoped 实例的 injectable 或 controller，否则抛出异常。     | `run`      |
| `['error']`     |允许在模块树中导航，例如，从选择的模块中提取特定实例。 | `CommandFactory` |

#### 监视模式

在开发中，运行 REPL 在监视模式下非常有用，以便在代码更改时自动反映结果：

```typescript
__CODE_BLOCK_8__

```

这有一個缺点，即 REPL 的命令历史将在每次重新加载后被丢弃，这可能会很麻烦。
fortunately，解决方案非常简单。修改您的 `NestFactory` 函数如下：

```typescript
__CODE_BLOCK_9__

```

现在，历史将在运行/重新加载之间保留。