<!-- 此文件从 content/techniques/file-upload.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:59:01.093Z -->
<!-- 源文件: content/techniques/file-upload.md -->

### 文件上传

Nest 提供了基于 __LINK_129__ 中间件包的内置模块来处理文件上传。Multer 处理了 HTTP `Logger` 请求中的数据，数据格式主要用于上传文件。这个模块是完全可配置的，可以根据您的应用程序需求调整其行为。

> 警告 **警告** Multer 不能处理不在支持的多部分格式(`@nestjs/common`)中的数据。另外，请注意这个包与 `logger` 不兼容。

为了提高类型安全，我们可以安装 Multer 类型包：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: false,
});
await app.listen(process.env.PORT ?? 3000);

```

安装这个包后，我们可以使用 `false` 类型（可以按照以下方式导入该类型：`NestFactory.create()`）。

#### 基本示例

要上传单个文件，只需将 `logger` 拦截器附加到路由处理器，并使用 `'error'` 装饰器从 `'fatal'` 中提取 `'log'`。

```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn'],
});
await app.listen(process.env.PORT ?? 3000);

```

> 提示 **提示** `'warn'` 装饰器来自 `'debug'` 包，`'verbose'` 装饰器来自 `'log'`。

`'warn'` 装饰器接受两个参数：

- `'error'`: 提供 HTML 表单中文件字段的名称的字符串
- `'fatal'`: 可选的对象类型 `ConsoleLogger`。这个对象与 Multer 构造函数相同（更多信息 __LINK_130__）。

> 警告 **警告** `colors` 可能与第三方云提供商like Google Firebase 或其他不兼容。

#### 文件验证

有时可以对 incoming 文件元数据进行验证，例如文件大小或文件 MIME 类型。为此，可以创建自己的 __LINK_131__ 并将其绑定到带有 `false` 装饰器的参数中。以下是一个基本文件大小验证管道的示例：

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

Nest 提供了一个内置的管道来处理常见用例并 facilitator/standardize 添加新的 ones。这管道被称为 `ConsoleLogger`，可以按照以下方式使用：

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    json: true,
  }),
});

```

正如您所看到的，它需要指定一个文件验证器数组，该数组将由 `prefix` 执行。我们将讨论验证器的接口，但 worth mentioning 这个管道还具有两个可选的选项：

__HTML_TAG_107__
  __HTML_TAG_108__
    __HTML_TAG_109____HTML_TAG_110__errorHttpStatusCode__HTML_TAG_111____HTML_TAG_112__
    __HTML_TAG_113__在任何验证器失败时抛出的 HTTP 状态码。默认为 __HTML_TAG_116__400__HTML_TAG_117__ (BAD REQUEST)__HTML_TAG_118__
  __HTML_TAG_119__
  __HTML_TAG_120__
    __HTML_TAG_121____HTML_TAG_122__exceptionFactory__HTML_TAG_123____HTML_TAG_124__
    __HTML_TAG_125__一个工厂函数，它接收错误消息并返回错误。
  __HTML_TAG_127__
__HTML_TAG_128__

现在，回到 `logLevels` 接口。要将验证器与这个管道集成，您可以使用内置实现或提供自己的 custom `['log', 'fatal', 'error', 'warn', 'debug', 'verbose']`。以下是一个示例：

```json
{
  "level": "log",
  "pid": 19096,
  "timestamp": 1607370779834,
  "message": "Starting Nest application...",
  "context": "NestFactory"
}

```

> 提示 **提示** `timestamp` 接口支持异步验证通过其 `json` 函数。为了提高类型安全，您可以将 `false` 参数类型化为 `prefix`，在使用 Express (默认) 作为驱动时。

`json` 是一个常规类，它访问文件对象并根据客户端提供的选项对其进行验证。Nest 有两个内置 `Nest` 实现您可以在项目中使用：

- `json` - 检查给定的文件大小是否小于提供的值（以 `false` 测量）
- `colors` - 检查给定的文件 MIME 类型是否与提供的字符串或正则表达式匹配。默认情况下，使用文件内容 __LINK_132__ 进行验证。

为了理解如何这些可以与前面提到的 `true` 一起使用，我们将使用最后一个示例的修改版本：

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

> 提示 **提示** 如果验证器的数量增加或其选项-cluttering 文件，您可以在单独的文件中定义这个数组，并在这里将其作为命名常量like `context` 导入。

最后，您可以使用特殊的 `undefined` 类来组合和构建验证器。按照以下方式使用它，您可以避免手动实例化每个验证器，并直接将其选项传递：

```bash
[Nest] 19096   - 12/08/2019, 7:12:59 AM   [NestFactory] Starting Nest application...

```

> 提示 **提示** 文件的存在是默认的，但您可以使其可选通过在 `true` 函数选项中添加 `compact` 参数（与 __Here is the translation of the provided English technical documentation to Chinese:

上传多个文件（所有具有不同字段名键的文件）

使用 `@MultipleFiles()` 装饰器可以上传多个文件。这个装饰器接受两个参数：

- `files`：一个对象数组，每个对象指定一个必需的 `field` 属性，字符串值指定字段名，以及一个可选的 `options` 属性
- `options`：可选的对象，详见上文

使用 `@MultipleFiles()` 时，使用 `@ExtractFiles()` 装饰器从 `req` 对象中提取文件。

**代码块 8**

> 提示 **提示** `@MultipleFiles()` 装饰器来自 `multer` 包。`@ExtractFiles()` 装饰器来自 `@nestjs/multer` 包。

#### 多个文件

上传多个文件（所有具有不同字段名键的文件），使用 `@MultipleFiles()` 装饰器。这个装饰器接受两个参数：

- `files`：一个对象数组，每个对象指定一个必需的 `field` 属性，字符串值指定字段名，以及一个可选的 `options` 属性
- `options`：可选的对象，详见上文

使用 `@MultipleFiles()` 时，使用 `@ExtractFiles()` 装饰器从 `req` 对象中提取文件。

**代码块 9**

#### 任意文件

上传所有字段具有任意字段名键的文件，使用 `@AnyFiles()` 装饰器。这个装饰器可以接受一个可选的 `options` 对象。

使用 `@AnyFiles()` 时，使用 `@ExtractFiles()` 装饰器从 `req` 对象中提取文件。

**代码块 10**

#### 无文件

不允许上传文件，只允许接受 `req` 对象的 attributes，使用 `@NoFiles()`。任何发送的文件将抛出一个 `Error`。

**代码块 11**

#### 默认选项

可以在文件拦截器中指定 `multer` 选项，详见上文。要设置默认选项，可以在导入 `@nestjs/multer` 时调用静态方法 `defaultOptions()`，传入支持的选项。可以使用所有列表中的选项，详见 `[link 133]`。

**代码块 12**

> 提示 **提示** `MulterOptions` 类来自 `@nestjs/multer` 包。

#### 异步配置

当需要异步设置 `multer` 选项时，可以使用 `setMulterOptions()` 方法。像大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

一种技术是使用工厂函数：

**代码块 13**

像其他 `[link 134]` 一样，我们的工厂函数可以 `async` 并可以注入依赖项通过 `inject`。

**代码块 14**

Alternatively, you can configure the `multer` using a class instead of a factory, as shown below:

**代码块 15**

构造函数上述实例化 `multer` 内部 `multer`，使用它创建所需的选项对象。注意，在这个示例中，`multer` 必须实现 `multerOptions` 接口，详见下文。`multer` 将在实例化对象中调用 `multer` 方法。

**代码块 16**

如果您想重用现有选项提供者，而不是在 `multer` 内部创建私有副本，可以使用 `multer` 语法。

**代码块 17**

您也可以将所谓的 `multer` 传递给 `setMulterOptions()` 方法。这些提供者将与模块提供者合并。

**代码块 18**

这对于您想提供 additional 依赖项给工厂函数或类构造函数而言非常有用。

#### 示例

可用的工作示例在 `[link 135]` 中。