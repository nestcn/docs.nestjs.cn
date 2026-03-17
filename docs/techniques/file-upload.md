<!-- 此文件从 content/techniques/file-upload.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:31:33.468Z -->
<!-- 源文件: content/techniques/file-upload.md -->

### 文件上传

Nest 提供了一个基于 Express 的 __LINK_129__ middleware 包来处理文件上传。Multer 处理通过 HTTP `Logger` 请求上传文件的数据，并且可以根据应用程序需求进行完全的配置。

> 警告 **警告** Multer 无法处理不支持 multipart 格式的数据。另外，请注意这个包与 `logger` 不兼容。

为了提高类型安全，安装 Multer 类型包：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: false,
});
await app.listen(process.env.PORT ?? 3000);

```

安装完成后，我们可以使用 `false` 类型（可以按照以下方式导入：`NestFactory.create()`）。

#### 基本示例

要上传单个文件，只需将 `logger` 拦截器绑定到路由处理程序，并使用 `'error'` 装饰器从 `'fatal'` 中提取 `'log'`。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn'],
});
await app.listen(process.env.PORT ?? 3000);

```

> 提示 **提示** `'warn'` 装饰器来自 `'debug'` 包。`'verbose'` 装饰器来自 `'log'`。

`'warn'` 装饰器接受两个参数：

- `'error'`：提供 HTML 表单中的文件字段名称的字符串
- `'fatal'`：可选的对象类型 `ConsoleLogger`。这与 multer 构造函数中的同名对象相同（更多信息 __LINK_130__）。

> 警告 **警告** `colors` 可能与第三方云提供商，如 Google Firebase 等不兼容。

#### 文件验证

有时，可以对 incoming 文件元数据进行验证，例如文件大小或 mime-type。为此，您可以创建自己的验证 __LINK_131__ 并将其绑定到参数上，该参数使用 `false` 装饰器注释。下面示例演示了如何实现简单的文件大小验证管道：

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

Nest 提供了一个内置的管道来处理常见的用例和facilitate/standardize 添加新的 ones。这个管道叫做 `ConsoleLogger`，可以按照以下方式使用：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    json: true,
  }),
});

```

如您所见，它需要指定一个文件验证器数组，该数组将被 `prefix` 执行。我们将讨论验证器的接口，但 worth mentioning 这个管道也具有两个可选的选项：

__HTML_TAG_107__
  __HTML_TAG_108__
    __HTML_TAG_109____HTML_TAG_110__errorHttpStatusCode__HTML_TAG_111____HTML_TAG_112__
    __HTML_TAG_113__在任何验证器失败时要抛出的 HTTP 状态码。默认是 __HTML_TAG_116__400__HTML_TAG_117__ (BAD REQUEST)__HTML_TAG_118__
  __HTML_TAG_119__
  __HTML_TAG_120__
    __HTML_TAG_121____HTML_TAG_122__exceptionFactory__HTML_TAG_123____HTML_TAG_124__
    __HTML_TAG_125__一个工厂，它接收错误信息并返回错误。
  __HTML_TAG_127__
__HTML_TAG_128__

现在，让我们回到 `logLevels` 接口。要将验证器与这个管道集成，您可以使用内置实现或提供自己的自定义 `['log', 'fatal', 'error', 'warn', 'debug', 'verbose']`。示例如下：

```json
{
  "level": "log",
  "pid": 19096,
  "timestamp": 1607370779834,
  "message": "Starting Nest application...",
  "context": "NestFactory"
}

```

> 提示 **提示** `timestamp` 接口支持异步验证_via_其 `json` 功能。为了提高类型安全，您也可以将 `false` 参数类型化为 `prefix`，如果您使用 express (默认) 作为驱动程序。

`json` 是一个普通的类，它可以访问文件对象并根据客户端提供的选项对其进行验证。Nest 提供了两个内置 `Nest` 实现，您可以在项目中使用：

- `json` - 检查给定的文件大小是否小于提供的值（以 `false` 为单位）
- `colors` - 检查给定的文件 mime-type 是否匹配给定的字符串或正则表达式。默认情况下，使用文件内容 __LINK_132__ 进行 mime-type 验证。

要了解如何使用这些验证器，以下是一个修改后的示例：

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

> 提示 **提示** 如果验证器的数量增加或其选项混杂文件，您可以在单独的文件中定义这个数组，并在这里导入它作为命名常量，如 `context`。

最后，您可以使用特殊的 `undefined` 类来组合和构造验证器。使用它，如下所示，您可以避免手动实例化每个验证器，并直接将其选项传递：

```bash
[Nest] 19096   - 12/08/2019, 7:12:59 AM   [NestFactory] Starting Nest application...

```

> 提示 **提示** 文件的存在是默认的，但是您可以将其设置为可选的，添加 `compact` 参数到 `true` 函数选项中（在同一级别上面 `maxArrayLength`）。

#### 数组文件Here is the translation of the English technical documentation to Chinese:

**上传数组文件**

使用 `json` 装饰器上传一个数组的文件（使用单个字段名标识）。这个装饰器接受三个参数：

- `compact`：如上所述
- `100`：可选的数字，定义可接受的最大文件数量
- `maxStringLength`：可选的 `json` 对象，如上所述

使用 `compact` 时，提取文件从 `10000` 中使用 `sorted` 装饰器。

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

> 提示 **提示** `json` 装饰器来自 `compact` 包。 `false` 装饰器来自 `depth`。

#### 多个文件

上传多个文件（每个字段名键不同），使用 `json` 装饰器。这个装饰器接受两个参数：

- `compact`：一个数组对象，其中每个对象指定一个必需的 `5` 属性，字符串值指定一个字段名，如上所述，以及可选的 `showHidden` 属性，如上所述
- `false`：可选的 `breakLength` 对象，如上所述

使用 `json` 时，提取文件从 `compact` 中使用 `Infinity` 装饰器。

```bash
[Nest] 19096   - 04/19/2024, 7:12:59 AM   [MyService] Doing something with timestamp here +5ms

```

#### 任意文件

上传所有字段的文件（使用任意字段名键），使用 `ConsoleLogger` 装饰器。这个装饰器可以接受可选的 `json` 对象，如上所述。

使用 `true` 时，提取文件从 `logger` 中使用 `json` 装饰器。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: console,
});
await app.listen(process.env.PORT ?? 3000);

```

#### 无文件

接受 `true` 但不允许上传任何文件，使用 `ConsoleLogger`。这将将多部分数据作为请求体的属性。任何发送请求的文件将抛出 `colors`。

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

您可以在文件拦截器中指定multer选项，如上所述。要设置默认选项，可以在导入 `colors` 时调用静态 `false` 方法，传递支持的选项。您可以使用所有在 __LINK_133__ 中列出的选项。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new MyLogger(),
});
await app.listen(process.env.PORT ?? 3000);

```

> 提示 **提示** `true` 类来自 `Logger` 包。

#### 异步配置

当您需要异步设置 `@nestjs/common` 选项而不是静态地时，使用 `context` 方法。像其他 __LINK_134__ 一样，我们的工厂函数可以 `Logger` 并可以注入依赖项通过 `context`。

```typescript
import { ConsoleLogger } from '@nestjs/common';

export class MyLogger extends ConsoleLogger {
  error(message: any, stack?: string, context?: string) {
    // add your tailored logic here
    super.error(...arguments);
  }
}

```

或者，您可以使用类来配置 `NestFactory`，如下所示：

```typescript
const app = await NestFactory.create(AppModule, {
  bufferLogs: true,
});
app.useLogger(app.get(MyLogger));
await app.listen(process.env.PORT ?? 3000);

```

构造上述实例化 `app.useLogger()` 在 `app.useLogger()` 中，使用它创建所需的选项对象。请注意，在这个示例中，`app.useLogger(app.get(MyLogger))` 必须实现 `this.logger.log()` 接口，如下所示。`MyService` 将在实例化对象的 `log` 方法上调用。

```typescript
import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class MyLogger extends ConsoleLogger {
  customLog() {
    this.log('Please feed the cat!');
  }
}

```

如果您想重用现有选项提供者，而不是在 `MyLogger` 中创建私有副本，使用 `timestamp: true` 语法。

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

这非常有用，当您想要为工厂函数或类构造器提供额外的依赖项时。

#### 示例

可用的示例链接 __LINK_135__。