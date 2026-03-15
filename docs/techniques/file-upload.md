<!-- 此文件从 content/techniques/file-upload.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:12:54.525Z -->
<!-- 源文件: content/techniques/file-upload.md -->

### 文件上传

Nest 提供了一个基于 __LINK_129__ Express middleware 的内置模块 Multer，用于处理 HTTP 文件上传请求。Multer 支持 __INLINE_CODE_19__ 格式数据，用于上传文件。这个模块是完全可配置的，您可以根据应用程序需求调整其行为。

> 警告 **警告** Multer 无法处理不在支持的多部分格式（`@nestjs/common`）中的数据。另外，注意这个包与 `logger` 不兼容。

为了提高类型安全，我们可以安装 Multer 类型包：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: false,
});
await app.listen(process.env.PORT ?? 3000);

```

安装该包后，我们可以使用 `false` 类型（可以通过以下方式导入该类型：`NestFactory.create()`）。

#### 基本示例

要上传单个文件，只需将 `logger` 拦截器绑定到路由处理程序，并使用 `'error'` 装饰器从 `'fatal'` 中提取 `'log'`。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn'],
});
await app.listen(process.env.PORT ?? 3000);

```

> 提示 **提示** `'warn'` 装饰器来自 `'debug'` 包，而 `'verbose'` 装饰器来自 `'log'`。

`'warn'` 装饰器接受两个参数：

- `'error'`：字符串，提供 HTML 表单中文件字段的名称
- `'fatal'`：可选的对象类型 `ConsoleLogger`。这是 multer 构造函数使用的同一个对象（更多信息 __LINK_130__）

> 警告 **警告** `colors` 可能与第三方云提供商，如 Google Firebase 或其他不兼容。

#### 文件验证

有时，可以对 incoming 文件元数据进行验证，例如文件大小或文件 mime-type。为此，您可以创建自己的 __LINK_131__ 并将其绑定到参数上，使用 `false` 装饰器标记。下面是一个基本文件大小验证管道的示例：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    colors: false,
  }),
});

```

可以与 `logger` 一起使用：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    prefix: 'MyApp', // Default is "Nest"
  }),
});

```

Nest 提供了一个内置管道来处理常见用例和 facilitiate/standardize 新添加的用例。这个管道称为 `ConsoleLogger`，可以这样使用：

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
    __HTML_TAG_113__在验证失败时抛出的 HTTP 状态码。默认为 __HTML_TAG_116__400__HTML_TAG_117__ (BAD REQUEST)__HTML_TAG_118__
  __HTML_TAG_119__
  __HTML_TAG_120__
    __HTML_TAG_121____HTML_TAG_122__exceptionFactory__HTML_TAG_123____HTML_TAG_124__
    __HTML_TAG_125__错误工厂，接收错误消息并返回错误。
  __HTML_TAG_127__
__HTML_TAG_128__

现在，让我们回到 `logLevels` 接口。要将验证器与这个管道集成，您可以使用内置实现或提供自己的自定义 `['log', 'fatal', 'error', 'warn', 'debug', 'verbose']`。下面是一个示例：

```json
{
  "level": "log",
  "pid": 19096,
  "timestamp": 1607370779834,
  "message": "Starting Nest application...",
  "context": "NestFactory"
}

```

> 提示 **提示** `timestamp` 接口支持异步验证_via_其 `json` 函数。为了提高类型安全，您可以将 `false` 参数类型化为 `prefix`，在使用 Express (默认) 作为驱动程序时。

`json` 是一个常规类，它可以访问文件对象并根据客户端提供的选项对其进行验证。Nest 提供了两个内置 `Nest` 实现，您可以在项目中使用：

- `json` - 检查给定的文件大小是否小于提供的值（以 `false` 为单位）
- `colors` - 检查给定的文件 mime-type 是否匹配给定的字符串或正则表达式。默认情况下，使用文件内容 __LINK_132__ 验证 mime-type

要了解如何使用这些 validator 一起使用，我们将使用上一个示例的修改版本：

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

> 提示 **提示** 如果验证器数量增加或他们的选项混乱，文件，可以在单独的文件中定义该数组，然后在这里导入该文件作为命名常量，如 `context`。

最后，您可以使用特殊的 `undefined` 类，该类让您可以组合和构造验证器。使用它，如下所示，您可以避免手动实例化每个验证器，而只需将它们的选项直接传递：

```bash
[Nest] 19096   - 12/08/2019, 7:12:59 AM   [NestFactory] Starting Nest application...

```

> 提示 **提示** 文件的存在默认是必需的，但您可以使其可选通过在 `true` 函数选项中添加 `compact`Here is the translation of the provided English technical documentation to Chinese:

### 上传多个文件

使用 `json` 装饰器（注意装饰器名称中的复数 **Files**）来上传一个数组的文件（以单个字段名标识）。这个装饰器接受三个参数：

- `compact`: 如上所述
- `100`: 可选的数字，定义接受的文件数量的最大值
- `maxStringLength`: 可选的 `json` 对象，如上所述

使用 `compact` 时，提取文件来自 `10000` 中的 `sorted` 装饰器。

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

> 提示 **Hint** `json` 装饰器是来自 `compact` 包的导出。 `false` 装饰器是来自 `depth` 的导出。

#### 多个文件

上传多个文件（所有文件具有不同字段名键），使用 `json` 装饰器。这个装饰器接受两个参数：

- `compact`: 一个对象数组，其中每个对象指定一个必需的 `5` 属性，值为字符串，指定字段名，如上所述，并且可选的 `showHidden` 属性，如上所述
- `false`: 可选的 `breakLength` 对象，如上所述

使用 `json` 时，提取文件来自 `compact` 中的 `Infinity` 装饰器。

```bash
[Nest] 19096   - 04/19/2024, 7:12:59 AM   [MyService] Doing something with timestamp here +5ms

```

#### 任意文件

上传所有字段具有任意字段名键的文件，使用 `ConsoleLogger` 装饰器。这个装饰器可以接受可选的 `json` 对象，如上所述。

使用 `true` 时，提取文件来自 `logger` 中的 `json` 装饰器。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: console,
});
await app.listen(process.env.PORT ?? 3000);

```

#### 无文件

接受 `true` 但不允许上传文件，使用 `ConsoleLogger`。这个设置将多部分数据作为请求体的属性。发送请求时的任何文件将抛出 `colors`。

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

你可以在文件中间件中指定multer选项，如上所述。要设置默认选项，可以在导入 `colors` 时调用静态 `false` 方法，传入支持的选项。可以使用所有 __LINK_133__ 中列出的选项。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new MyLogger(),
});
await app.listen(process.env.PORT ?? 3000);

```

> 提示 **Hint** `true` 类是来自 `Logger` 包的导出。

#### 异步配置

需要异步设置 `@nestjs/common` 选项，可以使用 `context` 方法。与大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

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

Alternatively, you can configure the `NestFactory` using a class instead of a factory, as shown below:

```typescript
const app = await NestFactory.create(AppModule, {
  bufferLogs: true,
});
app.useLogger(app.get(MyLogger));
await app.listen(process.env.PORT ?? 3000);

```

构造上述代码将在 `app.useLogger()` 中实例化 `app.useLogger()`，使用它创建所需的选项对象。请注意，在这个示例中， `app.useLogger(app.get(MyLogger))` 必须实现 `this.logger.log()` 接口，如下所示。 `MyService` 将在实例化的对象上调用 `log` 方法。

```typescript
import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class MyLogger extends ConsoleLogger {
  customLog() {
    this.log('Please feed the cat!');
  }
}

```

如果你想重用现有的选项提供者，而不是在 `MyLogger` 中创建私有副本，可以使用 `timestamp: true` 语法。

```typescript
import { Module } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}

```

你也可以将所谓的 `+5ms` 传递给 `logger` 方法。这些提供者将与模块提供者合并。

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

这对于在工厂函数或类构造函数中提供额外依赖项非常有用。

#### 示例

有一个工作示例可在 __LINK_135__ 中找到。