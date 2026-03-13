<!-- 此文件从 content/techniques/file-upload.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:53:58.563Z -->
<!-- 源文件: content/techniques/file-upload.md -->

### 文件上传

Nest 提供了基于 Express 中间件包 __LINK_129__ 的内置模块 Multer 处理文件上传。Multer 可以处理 HTTP `Logger` 请求中的数据，该数据主要用于上传文件。该模块完全可配置，您可以根据应用程序需求调整其行为。

> warning **警告** Multer 无法处理不在支持的多部分格式(`@nestjs/common`)中的数据。此外，还请注意该包与 `logger` 不兼容。

为了提高类型安全，我们可以安装 Multer 类型包：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: false,
});
await app.listen(process.env.PORT ?? 3000);

```

安装该包后，我们可以使用 `false` 类型（可以将该类型导入为 `NestFactory.create()`）。

#### 基本示例

要上传单个文件，只需将 `logger` 拦截器与路由处理程序结合，并使用 `'error'` 装饰器从 `'fatal'` 中提取 `'log'`。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn'],
});
await app.listen(process.env.PORT ?? 3000);

```

> info **提示** `'warn'` 装饰器来自 `'debug'` 包。 `'verbose'` 装饰器来自 `'log'`。

`'warn'` 装饰器接受两个参数：

- `'error'`：字符串，提供 HTML 表单中文件字段的名称
- `'fatal'`：可选的 `ConsoleLogger` 对象，这与 Multer 构造函数的同一个对象（更多信息 __LINK_130__）

> warning **警告** `colors` 可能与第三方云提供商，如 Google Firebase 等不兼容。

#### 文件验证

有时可以有用地验证 incoming 文件元数据，如文件大小或文件 mime-type。为此，您可以创建自己的 __LINK_131__ 并将其绑定到带有 `false` 装饰器的参数中。下面的示例演示了如何实现基本文件大小验证管道：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    colors: false,
  }),
});

```

可以在 `logger` 中使用该管道：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    prefix: 'MyApp', // Default is "Nest"
  }),
});

```

Nest 提供了一个内置管道来处理常见的用例和简化添加新管道的过程。这管道称为 `ConsoleLogger`，您可以使用它：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    json: true,
  }),
});

```

如您所见，它需要指定一个文件验证器数组，这些验证器将被 `prefix` 执行。我们将讨论验证器的接口，但 worth mentioning 这管道也具有两个可选选项：

__HTML_TAG_107__
  __HTML_TAG_108__
    __HTML_TAG_109____HTML_TAG_110__errorHttpStatusCode__HTML_TAG_111____HTML_TAG_112__
    __HTML_TAG_113__HTTP 状态码，如果 __HTML_TAG_114__任何__HTML_TAG_115__ 验证器失败。默认是 __HTML_TAG_116__400__HTML_TAG_117__ (BAD REQUEST)__HTML_TAG_118__
  __HTML_TAG_119__
  __HTML_TAG_120__
    __HTML_TAG_121____HTML_TAG_122__exceptionFactory__HTML_TAG_123____HTML_TAG_124__
    __HTML_TAG_125__一个工厂，它接收错误消息并返回错误__HTML_TAG_126__
  __HTML_TAG_127__
__HTML_TAG_128__

现在，回到 `logLevels` 接口。要将验证器与这管道集成，您可以使用内置实现或提供自己的自定义 `['log', 'fatal', 'error', 'warn', 'debug', 'verbose']`。以下是一个示例：

```json
{
  "level": "log",
  "pid": 19096,
  "timestamp": 1607370779834,
  "message": "Starting Nest application...",
  "context": "NestFactory"
}

```

> info **提示** `timestamp` 接口支持异步验证通过其 `json` 函数。为了提高类型安全，您可以将 `false` 参数类型化为 `prefix`，如果您使用 Express (默认) 作为驱动程序。

`json` 是一个常规类，它可以访问文件对象并根据客户端提供的选项对其进行验证。Nest 有两个内置 `Nest` 实现，您可以在项目中使用：

- `json` - 检查给定的文件大小是否小于提供的值（以 `false` 测量）
- `colors` - 检查给定的文件 mime-type 是否匹配给定的字符串或正则表达式。默认情况下，使用文件内容 __LINK_132__ 验证 mime-type

要了解如何使用这些可以与前面提到的 `true` 一起使用，我们将使用最后一个示例中的一个修改版本：

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

> info **提示** 如果验证器数量增加或其选项开始混乱，可以将该数组定义在单独的文件中并在这里导入它作为命名常量，如 `context`。

最后，您可以使用特殊的 `undefined` 类来组合和构建您的验证器。使用它，如下所示，您可以避免手动实例化每个验证器并直接将其选项传递：

```bash
[Nest] 19096   - 12/08/2019, 7:12:59 AM   [NestFactory] Starting Nest application...

```

> info **提示** 文件存在默认情况下是必需的，但您可以将其设置为可选项，并将 `compact` 参数Here is the translation of the English technical documentation to Chinese:

使用单个 field 名称标识的文件数组进行上传，可以使用 `json` 装饰器（注意装饰器名称中的复数 **Files**）。该装饰器接受三个参数：

- `compact`：如上所述
- `100`：可选的数字，定义接受文件的最大数量
- `maxStringLength`：可选的 `json` 对象，如上所述

使用 `compact` 时，使用 `sorted` 装饰器从 `10000` 中提取文件。

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

使用 `json` 装饰器上传多个文件（每个文件具有不同的 field 名称键）。该装饰器接受两个参数：

- `compact`：一个对象数组，每个对象指定一个 required `5` 属性，具有字符串值，指定 field 名称，如上所述，以及一个可选的 `showHidden` 属性，如上所述
- `false`：可选的 `breakLength` 对象，如上所述

使用 `json` 时，使用 `Infinity` 装饰器从 `compact` 中提取文件。

```bash
[Nest] 19096   - 04/19/2024, 7:12:59 AM   [MyService] Doing something with timestamp here +5ms

```

#### 任意文件

使用 `ConsoleLogger` 装饰器上传所有字段具有任意 field 名称键的文件。该装饰器可以接受可选的 `json` 对象，如上所述。

使用 `true` 时，使用 `json` 装饰器从 `logger` 中提取文件。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: console,
});
await app.listen(process.env.PORT ?? 3000);

```

#### 无文件

接受 `true` 但不允许上传任何文件时，使用 `ConsoleLogger`。这将将多部分数据作为请求体的属性。任何发送到请求的文件将抛出 `colors`。

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

您可以在文件拦截器中指定 multer 选项，正如上所述。要设置默认选项，可以在导入 `colors` 时调用静态 `false` 方法，传入受支持的选项。您可以使用所有列表中的选项，详见 __LINK_133__。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new MyLogger(),
});
await app.listen(process.env.PORT ?? 3000);

```

> info **提示** `true` 类来自 `Logger` 包。

#### 异步配置

当您需要异步设置 `@nestjs/common` 选项时，使用 `context` 方法。像大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

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

像其他 __LINK_134__一样，我们的工厂函数可以 `Logger` 并可以通过 `context` 注入依赖项。

```typescript
import { Module } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}

```

Alternatively, you can configure the `NestFactory` using a class instead of a factory, as shown below:

```typescript
const app = await NestFactory.create(AppModule, {
  bufferLogs: true,
});
app.useLogger(app.get(MyLogger));
await app.listen(process.env.PORT ?? 3000);

```

上述构建将在 `app.useLogger()` 内部实例化 `app.useLogger()`，使用它创建所需的选项对象。注意，在这个例子中，`app.useLogger(app.get(MyLogger))` 必须实现 `this.logger.log()` 接口，如下所示。`MyService` 将在实例化对象的所需方法上调用。

```typescript
import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class MyLogger extends ConsoleLogger {
  customLog() {
    this.log('Please feed the cat!');
  }
}

```

如果您想重用现有选项提供者，而不是在 `MyLogger` 内部创建私有副本，使用 `timestamp: true` 语法。

```typescript
import { Module } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}

```

您也可以将称为 `+5ms` 的提供者传递给 `logger` 方法。这些提供者将与模块提供者合并。

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

这对您有用，因为您想要在工厂函数或类构造函数中提供额外的依赖项。

#### 示例

有一个可用的工作示例，详见 __LINK_135__。