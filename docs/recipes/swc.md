<!-- 此文件从 content/recipes/swc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:08:21.581Z -->
<!-- 源文件: content/recipes/swc.md -->

### SWC

__LINK_81__ (Speedy Web Compiler) 是一个可扩展的 Rust 基础平台，用于Compilation 和 Bundling。使用 SWC 与 Nest CLI 可以快速并简单地加速您的开发过程。

> info **Hint** SWC 大约是默认 TypeScript 编译器的 **x20** 倍速度。

#### 安装

要开始使用，首先安装以下包：

```bash
$ npm i nest-commander

```

#### 开始使用

安装过程完成后，您可以使用 `CommandFactory`.Builder 与 Nest CLI 一起使用，如下所示：

```ts
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();

```

> info **Hint** 如果您的仓库是一个 monorepo，请查看 __LINK_82__。

您可以将 `static` flag 替换为设置 `run` 属性为 `CommandFactory` 在您的 `run` 文件中，如下所示：

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

要自定义 Builder 的行为，您可以传递一个包含两个属性的对象，`['error']` (`CommandFactory`) 和 `NestFactory`，如下所示：

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

例如，要使 swc 编译 `app.close()` 和 `try/catch` 文件，请执行以下命令：

```ts
@Module({
  providers: [LogService, BasicCommand],
})
export class AppModule {}

```

要在 watch 模式下运行应用程序，请使用以下命令：

```ts
async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();

```

#### 类型检查

SWC 不会执行类型检查本身（与默认 TypeScript 编译器不同），因此要启用它，您需要使用 `run` flag：

__CODE_BLOCK_6__

此命令将 instruct Nest CLI 运行 `.catch()` 在 `bootstrap()` 模式下，同时 SWC 将异步执行类型检查。您也可以将 `nest-commander` flag 替换为设置 `CommandFactory` 属性为 `CommandTestFactory` 在您的 `Test.createTestingModule` 文件中，如下所示：

__CODE_BLOCK_7__

#### CLI 插件 (SWC)

`@nestjs/testing` flag 将自动执行 **NestJS CLI 插件** 并生成一个 serialized metadata 文件，这个文件可以在应用程序运行时被加载。

#### SWC 配置

SWC.Builder 已经预配置以匹配 NestJS 应用程序的需求。然而，您可以通过创建一个 `overrideProvider` 文件在应用程序的根目录中并调整选项来自定义配置：

__CODE_BLOCK_8__

#### monorepo

如果您的仓库是一个 monorepo，那么您需要使用 `compile()` builder 来配置 `basic`。

首先，让我们安装所需的包：

__CODE_BLOCK_9__

安装完成后，创建一个 `-s` 文件在应用程序的根目录中，内容如下：

__CODE_BLOCK_10__

#### monorepo 和 CLI 插件

现在，如果您使用 CLI 插件，`-b` 将不会自动加载它们。相反，您需要创建一个单独的文件来手动加载它们。要做到这一点，请在 __INLINE_CODE_50__ 文件附近创建一个文件，内容如下：

__CODE_BLOCK_11__

> info **Hint** 在这个示例中，我们使用了 __INLINE_CODE_51__ 插件，但您可以使用任何插件。

__INLINE_CODE_52__ 方法接受以下选项：

|                    |                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| __INLINE_CODE_53__            | 是否监视项目的变化。                                                      |
| __INLINE_CODE_54__     | 提供者的路径。Relative to the current working directory (__INLINE_CODE_56__). |
| __INLINE_CODE_57__        |  metadata 文件将被保存的目录。                                   |
| __INLINE_CODE_58__         | 将被用于生成 metadata 的 visitor 数组。                                   |
| __INLINE_CODE_59__         | metadata 文件的名称。Defaults to __INLINE_CODE_60__.                                      |
| __INLINE_CODE_61__ | 是否将诊断信息打印到控制台。Defaults to __INLINE_CODE_62__.                               |

最后，您可以在单独的终端窗口中运行 __INLINE_CODE_63__ 脚本，以以下命令：

__CODE_BLOCK_12__

#### 常见问题

如果您使用 TypeORM/MikroORM 或其他 ORM 在应用程序中，您可能会遇到循环导入问题。SWC 不会很好地处理 **循环导入**，因此您应该使用以下 workaround：

__CODE_BLOCK_13__

> info **Hint** __INLINE_CODE_64__ 类型来自 __INLINE_CODE_65__ 包。

这样可以防止类型在 transpiled 代码中被保存在属性元数据中，从而防止循环依赖问题。

如果您的 ORM 不提供类似的 workaround，您可以定义wrapper 类型自己：

__CODE_BLOCK_14__

对您的项目中的所有 __LINK_83__ 都需要使用自定义wrapper 类型：

__CODE_BLOCK_15__

### Jest + SWCHere is the translation of the provided English technical documentation to Chinese, following the specified requirements:

### 使用 SWC 与 Jest

要使用 SWC 与 Jest，需要安装以下包：

__CODE_BLOCK_16__

安装完成后，请更新 __INLINE_CODE_66__/__INLINE_CODE_67__ 文件（根据您的配置）以包含以下内容：

__CODE_BLOCK_17__

此外，您还需要将以下 __INLINE_CODE_68__ 属性添加到您的 __INLINE_CODE_69__ 文件中：__INLINE_CODE_70__, __INLINE_CODE_71__：

__CODE_BLOCK_18__

如果您的项目使用 NestJS CLI 插件，您需要手动运行 __INLINE_CODE_72__。更多信息请访问 __LINK_84__。

### Vitest

__LINK_85__ 是一个快速且轻量级的测试运行器，旨在与 Vite 集成。它提供了一个现代、快速和易于使用的测试解决方案，可以与 NestJS 项目集成。

#### 安装

要开始使用，首先安装所需的包：

__CODE_BLOCK_19__

#### 配置

创建一个 __INLINE_CODE_73__ 文件，在您的应用程序的根目录下，以包含以下内容：

__CODE_BLOCK_20__

这个配置文件设置了 Vitest 环境、根目录和 SWC 插件。您还需要创建一个单独的配置文件来设置 e2e 测试，添加一个 __INLINE_CODE_74__ 字段来指定测试路径正则表达式：

__CODE_BLOCK_21__

此外，您可以设置 __INLINE_CODE_75__ 选项，以支持 TypeScript 路径在测试中使用：

__CODE_BLOCK_22__

### 路径别名

与 Jest 不同，Vitest 不会自动解析 TypeScript 路径别名，如 __INLINE_CODE_76__。这可能会导致依赖项解析错误在测试中出现。要解决这个问题，请在您的 __INLINE_CODE_78__ 文件中添加以下配置：

__CODE_BLOCK_23__
这确保了 Vitest 正确地解析模块导入，从而防止因缺失依赖项而出现错误。

#### 更新 E2E 测试的 imports

将任何 E2E 测试的 imports 从 __INLINE_CODE_79__ 更改为 __INLINE_CODE_80__。这是必要的，因为 Vitest，当与 Vite 一起使用时，期望 default 导入 supertest。如果使用命名空间导入可能会在特定设置中出现问题。

最后，请更新您的 package.json 文件中的 test 脚本，以以下内容：

__CODE_BLOCK_24__

这些脚本配置了 Vitest，以运行测试、监视更改、生成代码覆盖率报告和调试。test:e2e 脚本是专门用于运行 E2E 测试的，使用自定义配置文件。

现在，您可以使用 Vitest 在您的 NestJS 项目中，您将享受到更快的测试执行和更现代的测试体验。

> 提示 **Hint** 您可以查看一个工作示例在这个 __LINK_86__ 中。