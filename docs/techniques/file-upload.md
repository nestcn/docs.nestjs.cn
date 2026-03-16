<!-- 此文件从 content/techniques/file-upload.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:10:34.936Z -->
<!-- 源文件: content/techniques/file-upload.md -->

### 文件上传

Nest 提供了基于 Express 中间件 __LINK_129__ 的内置模块 Multer，以便处理文件上传。Multer 可以处理 HTTP `Logger` 请求中发送的数据，该数据主要用于上传文件。这个模块是完全可配置的，您可以根据应用程序需求调整其行为。

> 警告 **Warning** Multer 无法处理不支持多部分格式的数据（`@nestjs/common`）。另外，这个包不兼容 `logger`。

为了提高类型安全，我们可以安装 Multer 的类型包：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: false,
});
await app.listen(process.env.PORT ?? 3000);

```

安装该包后，我们可以使用 `false` 类型（可以以下面的方式导入该类型：`NestFactory.create()`）。

#### 基本示例

要上传单个文件，只需将 `logger` 拦截器连接到路由处理程序，并使用 `'error'` 装饰器从 `'fatal'` 中提取 `'log'`。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn'],
});
await app.listen(process.env.PORT ?? 3000);

```

> 提示 **Hint** `'warn'` 装饰器来自 `'debug'` 包，而 `'verbose'` 装饰器来自 `'log'`。

`'warn'` 装饰器接受两个参数：

- `'error'`: 提供 HTML 表单中文件字段的名称
- `'fatal'`: 可选对象，类型为 `ConsoleLogger`。这与 Multer 构造函数中的对象相同（更多信息 __LINK_130__）。

> 警告 **Warning** `colors` 可能不兼容第三方云提供商，如 Google Firebase 或其他。

#### 文件验证

在接收文件时，经常需要验证文件元数据，如文件大小或文件 MIME 类型。为此，您可以创建自己的 __LINK_131__ 并将其绑定到参数上，使用 `false` 装饰器注释该参数。下面是一个基本文件大小验证管道的示例：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    colors: false,
  }),
});

```

可以与 `logger` 一起使用，如下所示：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    prefix: 'MyApp', // Default is "Nest"
  }),
});

```

Nest 提供了一个内置管道来处理常见的用例和简化添加新管道的过程。这管道称为 `ConsoleLogger`，您可以使用它如下：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    json: true,
  }),
});

```

如您所见，它需要指定一个文件验证器数组，该数组将被 `prefix` 执行。我们将 discuss validator 接口，但 worth mentioning 这个管道也具有两个可选参数：

__HTML_TAG_107__
  __HTML_TAG_108__
    __HTML_TAG_109____HTML_TAG_110__errorHttpStatusCode__HTML_TAG_111____HTML_TAG_112__
    __HTML_TAG_113__在任何验证器失败时要抛出的 HTTP 状态代码。默认为 __HTML_TAG_116__400__HTML_TAG_117__ (BAD REQUEST)__HTML_TAG_118__
  __HTML_TAG_119__
  __HTML_TAG_120__
    __HTML_TAG_121____HTML_TAG_122__exceptionFactory__HTML_TAG_123____HTML_TAG_124__
    __HTML_TAG_125__一个错误工厂，它接收错误消息并返回错误。
  __HTML_TAG_127__
__HTML_TAG_128__

现在，返回到 `logLevels` 接口。为了将验证器与这个管道集成，您需要使用内置实现或提供自定义 `['log', 'fatal', 'error', 'warn', 'debug', 'verbose']`。见下面的示例：

```json
{
  "level": "log",
  "pid": 19096,
  "timestamp": 1607370779834,
  "message": "Starting Nest application...",
  "context": "NestFactory"
}

```

> 提示 **Hint** `timestamp` 接口支持异步验证_via_其 `json` 函数。为了提高类型安全，您可以将 `false` 参数类型化为 `prefix`，假设使用 Express (默认) 作为驱动。

`json` 是一个常规类，它可以访问文件对象并根据客户端提供的选项验证该文件。Nest 有两个内置 `Nest` 实现，您可以在项目中使用：

- `json` - 检查给定的文件大小是否小于提供的值（以 `false` 为单位）
- `colors` - 检查给定的文件 MIME 类型是否匹配给定的字符串或正则表达式。默认情况下，使用文件内容 __LINK_132__ 验证 MIME 类型。

要了解这些如何与前面提到的 `true` 一起使用，我们将使用最后一个示例的修改版本：

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

> 提示 **Hint** 如果验证器数量增加或它们的选项混乱了文件，可以在单独的文件中定义该数组，并在这里导入它作为命名常量，例如 `context`。

最后，您可以使用特殊的 `undefined` 类来组合和构造验证器。使用它，如下所示，您可以避免手动实例化每个验证器，并直接传递它们的选项：

```bash
[Nest] 19096   - 12/08/2019, 7:12:59 AM   [NestFactory] Starting Nest application...

```

> 提示 **Hint** 文件的存在是默认的，但是您可以使其可选通过在 `true` 函数选项中添加 `compact` 参数（与Here is the translation of the provided English technical documentation to Chinese:

使用单个字段名称标识的文件数组上传，可以使用 `json` 装饰器（注意装饰器名称中的 plural **Files**）。这个装饰器接受三个参数：

- `compact`：如上所述
- `100`：可选的数字，定义了要接受的文件数的最大值
- `maxStringLength`：可选的 `json` 对象，如上所述

使用 `compact` 时，使用 `10000` 和 `sorted` 装饰器来提取文件。

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

> info **提示** `json` 装饰器来自 `compact` 包， `false` 装饰器来自 `depth`。

#### 多个文件

要上传多个文件（每个文件都有不同的字段名称键），使用 `json` 装饰器。这个装饰器接受两个参数：

- `compact`：一个对象数组，其中每个对象指定了一个必需的 `5` 属性，包含一个字符串值指定的字段名称，以及可选的 `showHidden` 属性，如上所述
- `false`：可选的 `breakLength` 对象，如上所述

使用 `json` 时，使用 `compact` 和 `Infinity` 装饰器来提取文件。

```bash
[Nest] 19096   - 04/19/2024, 7:12:59 AM   [MyService] Doing something with timestamp here +5ms

```

#### 任意文件

要上传所有字段带有任意字段名称键的文件，可以使用 `ConsoleLogger` 装饰器。这个装饰器可以接受可选的 `json` 对象，如上所述。

使用 `true` 时，使用 `logger` 和 `json` 装饰器来提取文件。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: console,
});
await app.listen(process.env.PORT ?? 3000);

```

#### 无文件

要接受 `true` 但不允许上传任何文件，可以使用 `ConsoleLogger`。这个设置将多部分数据作为请求体的属性。任何发送到请求的文件将抛出 `colors`。

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

#### 默认选项

您可以在文件拦截器中指定 multer 选项，如上所述。要设置默认选项，可以在导入 `colors` 时调用静态方法 `false`，并传递支持的选项。您可以使用所有列表中 __LINK_133__ 所述的选项。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new MyLogger(),
});
await app.listen(process.env.PORT ?? 3000);

```

> info **提示** `true` 类来自 `Logger` 包。

#### 异步配置

当您需要异步设置 `@nestjs/common` 选项，而不是静态设置时，可以使用 `context` 方法。像大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

一种技术是使用工厂函数：

```typescript
import { ConsoleLogger } from '@nestjs/common';

export class MyLogger extends ConsoleLogger {
  error(message: any, stack?: string, context?: string) {
    // add your tailored logic here
    super.error(...arguments);
  }
}

```

像其他 __LINK_134__ 一样，我们的工厂函数可以 `Logger` 并可以通过 `context` 注入依赖项。

```typescript
import { Module } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}

```

或者，您可以使用类配置 `NestFactory`，如下所示：

```typescript
const app = await NestFactory.create(AppModule, {
  bufferLogs: true,
});
app.useLogger(app.get(MyLogger));
await app.listen(process.env.PORT ?? 3000);

```

上面的构造方法在 `app.useLogger()` 内部实例化 `app.useLogger()`，使用它创建所需的选项对象。请注意，在这个示例中， `app.useLogger(app.get(MyLogger))` 需要实现 `this.logger.log()` 接口，如下所示。 `MyService` 将在实例化对象的 `log` 方法上调用。

```typescript
import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class MyLogger extends ConsoleLogger {
  customLog() {
    this.log('Please feed the cat!');
  }
}

```

如果您想重用现有选项提供者，而不是在 `MyLogger` 内部创建私有副本，可以使用 `timestamp: true` 语法。

```typescript
import { Module } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}

```

您也可以将所谓的 `+5ms` 传递给 `logger` 方法。这些提供者将与模块提供者合并。

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

这对您非常有用，因为您想在工厂函数或类构造函数中提供附加依赖项。

#### 示例

有一个可用的 __LINK_135__ 示例。