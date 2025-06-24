### Nest Commander

除了[独立应用](/standalone-applications)文档外，还有 [nest-commander](https://jmcdo29.github.io/nest-commander) 包可用于编写命令行应用程序，其结构类似于典型的 Nest 应用。

> info **注意** `nest-commander` 是第三方包，并非由 NestJS 核心团队全面管理。如发现该库的任何问题，请在[对应代码库](https://github.com/jmcdo29/nest-commander/issues/new/choose)中报告

#### 安装

与任何其他包一样，您需要先安装它才能使用。

```bash
$ npm i nest-commander
```

#### 命令文件

`nest-commander` 通过类的 `@Command()` 装饰器和方法上的 `@Option()` 装饰器，可以轻松编写新的命令行应用。每个命令文件都应实现 `CommandRunner` 抽象类，并使用 `@Command()` 装饰器进行修饰。

Nest 将每个命令都视为 `@Injectable()`，因此常规的依赖注入仍会如预期般工作。唯一需要注意的是抽象类 `CommandRunner`，每个命令都应实现它。该抽象类确保所有命令都具有返回 `Promise<void>` 的 `run` 方法，并接收参数 `string[], Record<string, any>`。`run` 方法是启动所有逻辑的地方，它会将未匹配选项标志的参数作为数组传入，以便处理多参数场景。至于选项 `Record<string, any>`，其属性名对应 `@Option()` 装饰器的 `name` 属性，值则来自选项处理器的返回值。如需更好的类型安全，也可以为选项创建接口。

#### 运行命令

类似于在 NestJS 应用中我们可以使用 `NestFactory` 创建服务器并通过 `listen` 运行它，`nest-commander` 包也提供了简洁的 API 来运行你的服务。导入 `CommandFactory` 并使用其 `static` 方法 `run`，传入应用的根模块即可。具体实现可能如下所示：

```ts
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();
```

默认情况下，使用 `CommandFactory` 时 Nest 的日志记录器是禁用的。但可以通过将其作为 `run` 函数的第二个参数来启用。你可以传入自定义的 NestJS 日志记录器，或是需要保留的日志级别数组——如果只想输出 Nest 的错误日志，至少传入 `['error']` 会很有帮助。

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

就这样。`CommandFactory` 会在底层自动为你调用 `NestFactory` 并在必要时执行 `app.close()`，因此你无需担心内存泄漏问题。如需添加错误处理，可以用 `try/catch` 包裹 `run` 命令，或者在 `bootstrap()` 调用后链式添加 `.catch()` 方法。

#### 测试

如果无法轻松测试，编写一个超级强大的命令行脚本又有什么用呢？幸运的是，`nest-commander` 提供了一些实用工具，它们与 NestJS 生态系统完美契合，对任何 Nest 开发者来说都会感到非常熟悉。在测试模式下构建命令时，你可以使用 `CommandTestFactory` 并传入元数据，而不是使用 `CommandFactory`，这与 `@nestjs/testing` 中的 `Test.createTestingModule` 工作方式非常相似。实际上，它在底层就使用了这个包。你仍然可以在调用 `compile()` 之前链式调用 `overrideProvider` 方法，这样就可以在测试中直接替换依赖注入的组件。

#### 整合所有内容

以下类相当于一个 CLI 命令，可以接收子命令 `basic` 或直接调用，支持 `-n`、`-s` 和 `-b`（以及它们的长标志形式），每个选项都有自定义解析器。按照 commander 的惯例，`--help` 标志也同样支持。

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
    super();
  }

  async run(
    passedParam: string[],
    options?: BasicCommandOptions
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

确保命令类已添加到模块中

```ts
@Module({
  providers: [LogService, BasicCommand],
})
export class AppModule {}
```

现在，要在你的 main.ts 中运行 CLI，可以按照以下步骤操作

```ts
async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();
```

就这样，你已经拥有了一个命令行应用程序。

#### 更多信息

访问 [nest-commander 文档站点](https://jmcdo29.github.io/nest-commander)获取更多信息、示例和 API 文档。
