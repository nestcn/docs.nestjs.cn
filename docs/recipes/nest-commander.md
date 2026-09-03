<!-- 此文件从 content/recipes/nest-commander.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-09-03T12:10:33.470Z -->
<!-- 源文件: content/recipes/nest-commander.md -->

### Nest Commander

在[standalone application](/standalone-applications)文档的基础上，还有[nest-commander](https://jmcdo29.github.io/nest-commander)包，用于以类似于典型 Nest 应用的结构编写命令行应用程序。

> info **提示** `nest-commander` 是一个第三方包，不由 NestJS 核心团队整体管理。如果发现该库有任何问题，请在[appropriate repository](https://github.com/jmcdo29/nest-commander/issues/new/choose)中报告。

#### 安装

就像其他任何包一样，你需要先安装它才能使用。

```bash
$ npm i nest-commander

```

#### 命令文件

`nest-commander` 通过类的 `@Command()` 装饰器和该类方法的 `@Option()` 装饰器，使得使用 [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) 编写新的命令行应用程序变得容易。每个命令文件都应实现 `CommandRunner` 抽象类，并使用 `@Command()` 装饰器进行装饰。

每个命令都被 Nest 视为一个 `@Injectable()`，因此你正常的依赖注入仍然会按预期工作。唯一需要注意的是抽象类 `CommandRunner`，每个命令都应实现它。`CommandRunner` 抽象类确保所有命令都有一个 `run` 方法，该方法返回一个 `Promise<void>` 并接收参数 `string[], Record<string, any>`。`run` 命令是你启动所有逻辑的地方，它将接收所有未匹配选项标志的参数，并将它们作为数组传入，以防你真的需要处理多个参数。至于选项，`Record<string, any>`，这些属性的名称与 `@Option()` 装饰器给定的 `name` 属性匹配，而它们的值与选项处理程序的返回值匹配。如果你想要更好的类型安全性，你也可以为你的选项创建一个接口。

#### 运行命令

类似于在 NestJS 应用中，我们可以使用 `NestFactory` 为我们创建服务器，并使用 `listen` 运行它，`nest-commander` 包提供了一个简单易用的 API 来运行你的服务器。导入 `CommandFactory` 并使用 `static` 方法 `run`，传入你的应用的根模块。这看起来可能如下所示：

```ts
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module.js';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

await bootstrap();

```

默认情况下，使用 `CommandFactory` 时 Nest 的日志记录器是禁用的。不过，你可以将其作为第二个参数提供给 `run` 函数。你可以提供自定义的 NestJS 日志记录器，或者提供你想要保留的日志级别数组——如果你只想打印 Nest 的错误日志，至少在这里提供 `['error']` 可能会很有用。

```ts
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module.js';
import { LogService } from './log.service.js';

async function bootstrap() {
  await CommandFactory.run(AppModule, new LogService());

  // or, if you only want to print Nest's warnings and errors
  await CommandFactory.run(AppModule, ['warn', 'error']);
}

await bootstrap();

```

就这样。在底层，`CommandFactory` 会负责为你调用 `NestFactory`，并在必要时调用 `app.close()`，所以你不需要担心内存泄漏。如果你需要添加一些错误处理，总有 `try/catch` 包裹着 `run` 命令，或者你可以链式调用一些 `.catch()` 方法到 `bootstrap()` 调用上。

#### 测试

那么，如果你不能轻松测试一个超棒的命令行脚本，那写它有什么用呢，对吧？幸运的是，`nest-commander` 提供了一些你可以使用的工具，它们与 NestJS 生态系统完美契合，任何 Nest 开发者都会感到宾至如归。与其在测试模式下使用 `CommandFactory` 来构建命令，你可以使用 `CommandTestFactory` 并传入你的元数据，这与 `@nestjs/testing` 中的 `Test.createTestingModule` 工作方式非常相似。事实上，它在底层就使用了这个包。你仍然可以在调用 `compile()` 之前链式调用 `overrideProvider` 方法，这样你就可以在测试中替换依赖注入的部分。

#### 整合在一起

下面的类相当于有一个 CLI 命令，可以接收子命令 `basic` 或直接调用，支持 `-n`、`-s` 和 `-b`（以及它们的长标志），并且每个选项都有自定义解析器。按照 commander 的惯例，`--help` 标志也被支持。

```ts
import { Command, CommandRunner, Option } from 'nest-commander';
import { LogService } from './log.service.js';

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

确保命令类被添加到一个模块中：

```ts
@Module({
  providers: [LogService, BasicCommand],
})
export class AppModule {}

```

现在，为了能够在你的 main.ts 中运行 CLI，你可以执行以下操作：

```ts
async function bootstrap() {
  await CommandFactory.run(AppModule);
}

await bootstrap();

```

就这样，你就拥有了一个命令行应用程序。

#### 更多信息

访问 [nest-commander docs site](https://jmcdo29.github.io/nest-commander) 获取更多信息、示例和 API 文档。