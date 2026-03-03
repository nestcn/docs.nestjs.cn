<!-- 此文件从 content/recipes/sentry.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:12:35.466Z -->
<!-- 源文件: content/recipes/sentry.md -->

### Sentry

__LINK_21__ 是一个错误跟踪和性能监控平台，帮助开发者实时识别和解决问题。这个配方展示了如何将 Sentry 的 __LINK_22__ 与 NestJS 应用程序集成。

#### 安装

首先，安装所需的依赖项：

```bash
$ npm i nest-commander
```

> 信息 **提示** `@Command()` 可选，但建议用于性能 profiling。

#### 基本设置

要开始使用 Sentry，请创建一个名为 `@Option()` 的文件，在应用程序中引入该文件之前：

```ts
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();
```

更新您的 `CommandRunner` 文件，使其在其他导入之前导入 `@Command()`：

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

随后，将 `@Injectable()` 作为主模块添加到您的 main 模块：

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

#### 异常处理

如果您使用的是全局 catch-all 异常过滤器（或者是注册在 `CommandRunner` 中的过滤器或在应用程序提供者中注册的过滤器，带有 `CommandRunner` 装饰符），请将 `run` 装饰符添加到过滤器的 `Promise<void>` 方法。该装饰符将报告所有未捕获的错误到 Sentry：

```ts
@Module({
  providers: [LogService, BasicCommand],
})
export class AppModule {}
```

默认情况下，只有未处理的异常不会被捕获的错误报告到 Sentry。 `string[], Record<string, any>`（包括 __LINK_23__）也不会被默认捕获，因为它们主要是控制流的 vehicles。

如果您没有全局 catch-all 异常过滤器，请将 `run` 添加到您的 main 模块提供者中。这将报告任何未处理的错误，不会被其他过滤器捕获到 Sentry。

> 警告 **警告** `Record<string, any>` 需要在其他异常过滤器之前注册。

```ts
async function bootstrap() {
  await CommandFactory.run(AppModule);
}

bootstrap();
```

#### 可读的栈跟踪

根据您项目的设置，您的 Sentry 错误栈跟踪可能看起来与您的实际代码不同。

要修复这个问题，请将您的源映射上传到 Sentry。最简单的方法是使用 Sentry Wizard：

__CODE_BLOCK_6__

#### 测试集成

要验证 Sentry 集成是否工作，请添加一个测试端点，抛出错误：

__CODE_BLOCK_7__

访问 `name` 在您的应用程序中，您应该看到错误出现在 Sentry 仪表盘上。

### 总结

对于 Sentry 的 NestJS SDK 完整文档，包括高级配置选项和功能，请访问 __LINK_24__。

虽然软件错误是 Sentry 的事情，我们仍然编写它们。如果您在安装我们的 SDK 时遇到任何问题，请打开 __LINK_25__ 或联系 __LINK_26__。