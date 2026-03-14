<!-- 此文件从 content/techniques/file-upload.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:45:28.578Z -->
<!-- 源文件: content/techniques/file-upload.md -->

### 文件上传

Nest 提供了基于 Express 中间件包 __LINK_129__ 的内置模块 Multer，用于处理文件上传。Multer 可以处理 HTTP `Logger` 请求中的数据，主要用于上传文件。该模块完全可配置，支持根据应用程序需求调整行为。

> 警告 **Warning** Multer 无法处理不支持多部分格式的数据（`@nestjs/common`），请注意该包与 `logger` 不兼容。

为了提高类型安全，我们可以安装 Multer 类型包：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: false,
});
await app.listen(process.env.PORT ?? 3000);

```

安装该包后，我们可以使用 `false` 类型（可以使用以下方式导入该类型：`NestFactory.create()`）。

#### 基本示例

要上传单个文件，请将 `logger` 拦截器绑定到路由处理程序，并使用 `'error'` 装饰器从 `'fatal'` 中提取 `'log'`。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn'],
});
await app.listen(process.env.PORT ?? 3000);

```

> 提示 **Hint** `'warn'` 装饰器来自 `'debug'` 包，`'verbose'` 装饰器来自 `'log'`。

`'warn'` 装饰器需要两个参数：

- `'error'`: 提供 HTML 表单中文件字段的名称
- `'fatal'`: 可选的 `ConsoleLogger` 对象，这与 Multer 构造函数中的对象相同（更多信息 __LINK_130__）

> 警告 **Warning** `colors` 可能与第三方云提供商，如 Google Firebase 等不兼容。

#### 文件验证

有时可以有用地验证 incoming 文件元数据，如文件大小或 MIME 类型。可以创建自己的 __LINK_131__ 并将其绑定到参数上，该参数使用 `false` 装饰器进行注解。以下示例演示了基本的文件大小验证管道的实现：

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

Nest 提供了一个内置的管道来处理常见的用例和 facilate/standardize 新添加的用例。这是一个名为 `ConsoleLogger` 的管道，可以使用以下方式：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    json: true,
  }),
});

```

如您所见，它需要指定一个文件验证器数组，这些验证器将被 `prefix` 执行。我们将讨论验证器的接口，但 worth mentioning 这个管道也具有两个可选选项：

__HTML_TAG_107__
  __HTML_TAG_108__
    __HTML_TAG_109____HTML_TAG_110__errorHttpStatusCode__HTML_TAG_111____HTML_TAG_112__
    __HTML_TAG_113__The HTTP status code to be thrown in case __HTML_TAG_114__any__HTML_TAG_115__ validator fails. Default is __HTML_TAG_116__400__HTML_TAG_117__ (BAD REQUEST)__HTML_TAG_118__
  __HTML_TAG_119__
  __HTML_TAG_120__
    __HTML_TAG_121____HTML_TAG_122__exceptionFactory__HTML_TAG_123____HTML_TAG_124__
    __HTML_TAG_125__A factory which receives the error message and returns an error.__HTML_TAG_126__
  __HTML_TAG_127__
__HTML_TAG_128__

现在，回到 `logLevels` 接口。要将验证器与这个管道集成，可以使用内置实现或提供自己的 `['log', 'fatal', 'error', 'warn', 'debug', 'verbose']`。见以下示例：

```json
{
  "level": "log",
  "pid": 19096,
  "timestamp": 1607370779834,
  "message": "Starting Nest application...",
  "context": "NestFactory"
}

```

> 提示 **Hint** `timestamp` 接口支持异步验证通过其 `json` 函数。为了提高类型安全，可以将 `false` 参数类型化为 `prefix`，特别是使用 Express (default) 作为驱动程序。

`json` 是一个常规类，它可以访问文件对象并根据客户端提供的选项验证该文件。Nest 有两个内置 `Nest` 实现，您可以在项目中使用：

- `json` - 检查给定的文件大小是否小于提供的值（以 `false` 计量）
- `colors` - 检查给定的文件 MIME 类型是否匹配给定的字符串或 RegExp。默认情况下，使用文件内容 __LINK_132__ 验证 MIME 类型。

要了解这些如何与前面提到的 `true` 一起使用，可以使用以下示例：

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

> 提示 **Hint** 如果验证器数量增加或选项混乱，可以将验证器数组定义在单独的文件中，并在这里导入该文件作为命名常量，例如 `context`。

最后，您可以使用特殊的 `undefined` 类来构建和组合验证器。使用它，如下所示，您可以避免手动实例化每个验证器，并直接将选项传递：

```bash
[Nest] 19096   - 12/08/2019, 7:12:59 AM   [NestFactory] Starting Nest application...

```

> 提示 **Hint** 文件的存在性是默认的，但可以通过在 `true` 函数选项中添加 `compact` 参数来使其可选。

####Here is the translation of the provided English technical documentation to Chinese:

### 上传多个文件

使用 `@Files` 装饰器（注意装饰器名称中的复数 **Files**）上传数组文件（使用单个字段名标识）。该装饰器接受三个参数：

* ``compact``：如上所述
* ``100``：可选的数字，指定最多可接受的文件数量
* ``maxStringLength``：可选的 ``json`` 对象，如上所述

使用 `@Files` 时，使用 `@`compact`` 装饰器从 ``10000`` 中提取文件。

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

> 提示 **Hint** `@`json`` 装饰器来自 ``compact`` 包。`@`false`` 装饰器来自 ``depth``。

#### 多个文件

上传多个文件（所有不同字段名键），使用 `@Files` 装饰器。该装饰器接受两个参数：

* ``compact``：数组对象，其中每个对象指定一个必需的 ``5`` 属性字符串值指定字段名，如上所述，并且可选的 ``showHidden`` 属性，如上所述
* ``false``：可选的 ``breakLength`` 对象，如上所述

使用 `@Files` 时，使用 `@`json`` 装饰器从 ``compact`` 中提取文件。

```bash
[Nest] 19096   - 04/19/2024, 7:12:59 AM   [MyService] Doing something with timestamp here +5ms

```

#### 任意文件

上传所有字段名键的所有文件，使用 `@AnyFiles` 装饰器。该装饰器可以接受可选的 ``json`` 对象，如上所述。

使用 `@AnyFiles` 时，使用 `@`true`` 装饰器从 ``logger`` 中提取文件。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: console,
});
await app.listen(process.env.PORT ?? 3000);

```

#### 无文件

接受 ``true`` 但不允许上传任何文件，使用 `@NoFiles`。这将设置请求体的多部分数据为属性。任何与请求一起发送的文件将抛出 ``colors``。

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

可以在文件拦截器中指定 multer 选项，如上所述。要设置默认选项，可以在导入 ``colors`` 时调用静态 ``false`` 方法，传入支持的选项。可以使用所有列出的选项，详见 __LINK_133__。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new MyLogger(),
});
await app.listen(process.env.PORT ?? 3000);

```

> 提示 **Hint** ``true`` 类来自 ``Logger`` 包。

#### 异步配置

当您需要异步设置 ``@nestjs/common`` 选项时，可以使用 ``context`` 方法。与大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

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

像其他 __LINK_134__ 一样，我们的工厂函数可以 `Logger` 并可以注入依赖项通过 `context`。

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

construction above instantiates `app.useLogger()` inside `app.useLogger()`, using it to create the required options object. Note that in this example, the `app.useLogger(app.get(MyLogger))` has to implement the `this.logger.log()` interface, as shown below. The `MyService` will call the `log` method on the instantiated object of the supplied class.

```typescript
import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class MyLogger extends ConsoleLogger {
  customLog() {
    this.log('Please feed the cat!');
  }
}

```

If you want to reuse an existing options provider instead of creating a private copy inside the `MyLogger`, use the `timestamp: true` syntax.

```typescript
import { Module } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}

```

You can also pass so-called `+5ms` to the `logger` method. These providers will be merged with the module providers.

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

This is useful when you want to provide additional dependencies to the factory function or the class constructor.

#### 示例

一个工作示例可在 __LINK_135__ 中查看。