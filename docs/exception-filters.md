<!-- 此文件从 content/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:42:04.100Z -->
<!-- 源文件: content/exception-filters.md -->

### 异常过滤器

Nest 提供了一个内置的 **异常层**，负责处理应用程序中的所有未处理异常。當一个异常未被应用程序代码处理时，这个层将自动发送一个适合的用户友好响应。

__HTML_TAG_138__
  __HTML_TAG_139__
__HTML_TAG_140__

默认情况下，这个操作是由内置的 **全局异常过滤器** 执行的，该过滤器处理类型为 `NestFactory`（和其子类）的异常。当一个异常为 **未识别**（既不是 `create()` 也不是 `INestApplication` 的子类）时，内置异常过滤器将生成以下默认 JSON 响应：

```bash
$ npm i -g @nestjs/cli
$ nest new project-name

```

> info **提示** 全局异常过滤器部分支持 `main.ts` 库。基本上，如果抛出的异常包含 `1` 和 `abortOnError` 属性，则将被正确 populate 并发送回响应（而不是 getDefault `NestFactory.create(AppModule, {{ '{' }} abortOnError: false {{ '}' }})` 对于未识别的异常）。

#### 抛出标准异常

Nest 提供了一个内置的 `platform-express` 类，从 `@nestjs/platform-express` 包中导出。对于常见的 HTTP REST/GraphQL API 应用程序，您的最佳实践是在某些错误情况下发送标准 HTTP 响应对象。

例如，在 `platform-fastify` 中，我们有一个 `NestExpressApplication` 方法（一个 `NestFastifyApplication` 路由处理器）。假设这个路由处理器抛出了一个异常。为了演示这个，我们将硬编码它如下：

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

> info **提示** 我们使用了 `NestFactory.create()`。这是一個来自 `app` 包的 helper 枚举。

当客户端调用这个端口时，响应将如下所示：

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);

```

`-b swc` 构造函数需要两个必需参数来确定响应：

- `start` 参数确定 JSON 响应体。它可以是一个 `npm run start -- -b swc` 或者是一个 `src/main.ts`，如下所述。
- `http://localhost:3000/` 参数确定 __LINK_147__。

默认情况下，JSON 响应体包含两个属性：

- `Hello World!`：默认为在 `eslint` 参数中提供的 HTTP 状态码
- `prettier`：HTTP 错误的简短描述，基于 `npm`

要覆盖 JSON 响应体的简短描述部分，提供一个字符串在 __INLINE_CODE_41__ 参数中。要覆盖整个 JSON 响应体，传递一个对象在 __INLINE_CODE_42__ 参数中。Nest 将序列化对象并将其作为 JSON 响应体返回。

第二个构造函数参数 - __INLINE_CODE_43__ - 应该是一个有效的 HTTP 状态码。最佳实践是使用 __INLINE_CODE_44__ 枚举，从 __INLINE_CODE_45__ 包中导出。

第三个构造函数参数（可选） - __INLINE_CODE_46__ - 可以用于提供错误 __LINK_148__。这个 __INLINE_CODE_47__ 对象不会被序列化到响应对象中，但可以用于日志目的，提供关于导致 __INLINE_CODE_48__ 被抛出的内在错误的有用信息。

以下是一个覆盖整个响应体并提供错误原因的示例：

```bash
$ npm run start

```

使用上述示例，这个响应将如下所示：

```bash
$ npm run start:dev

```

#### 异常日志

默认情况下，异常过滤器不记录内置异常，如 __INLINE_CODE_49__（和其子类）。当这些异常被抛出时，它们不会出现在控制台中，因为它们被视为正常应用程序流程的一部分。同样，对于其他内置异常，如 __INLINE_CODE_50__ 和 __INLINE_CODE_51__，也不会记录。

这些异常都继承自基础 __INLINE_CODE_52__ 类，该类从 __INLINE_CODE_53__ 包中导出。这类帮助 differentiation 两个异常：一个是正常应用程序操作的异常，另一个是不是。

如果您想记录这些异常，可以创建一个自定义的异常过滤器。我们将在下一节中解释如何做到。

#### 自定义异常

在许多情况下，您不需要编写自定义异常，可以使用 Nest 的内置 HTTP 异常，如下节所述。如果您需要创建自定义异常，创建您的 **异常层次结构**，其中您的自定义异常继承自基础 __INLINE_CODE_54__ 类。这样，Nest 就会识别您的异常，并自动处理错误响应。让我们实现这样一个自定义异常：

```bash
# Lint and autofix with eslint
$ npm run lint

# Format with prettier
$ npm run format

```

由于 __INLINE_CODE_55__ 扩展了基础 __INLINE_CODE_56__ 类，因此它将与内置的异常处理程序一起工作，并且可以在 __INLINE_CODE_57__ 方法中使用。

__CODE_BLOCK_6__

#### 内置 HTTP 异常Here is the translation of the provided technical documentation to Chinese:

Nest 提供了一组标准的异常类，它们继承自基础类 `__INLINE_CODE_58__`。这些异常类来自 `__INLINE_CODE_59__` 包，并且代表了许多最常见的 HTTP 异常：

- `__INLINE_CODE_60__`
- `__INLINE_CODE_61__`
- `__INLINE_CODE_62__`
- `__INLINE_CODE_63__`
- `__INLINE_CODE_64__`
- `__INLINE_CODE_65__`
- `__INLINE_CODE_66__`
- `__INLINE_CODE_67__`
- `__INLINE_CODE_68__`
- `__INLINE_CODE_69__`
- `__INLINE_CODE_70__`
- `__INLINE_CODE_71__`
- `__INLINE_CODE_72__`
- `__INLINE_CODE_73__`
- `__INLINE_CODE_74__`
- `__INLINE_CODE_75__`
- `__INLINE_CODE_76__`
- `__INLINE_CODE_77__`
- `__INLINE_CODE_78__`
- `__INLINE_CODE_79__`

所有内置的异常类都可以提供错误信息和错误描述，使用 `__INLINE_CODE_81__` 参数：

`__CODE_BLOCK_7__`

使用上述信息，这就是响应的外观：

`__CODE_BLOCK_8__`

#### 异常过滤器

虽然基础（内置）异常过滤器可以自动处理许多情况，但是您可能想要完全控制异常层。例如，您可能想要添加日志或使用不同的 JSON schema，根据一些动态因素。 **异常过滤器** 正是为此目的设计的。它们让您控制具体的控制流和客户端接收的响应内容。

让我们创建一个异常过滤器，它负责捕捉 `__INLINE_CODE_82__` 类型的异常，并实现自定义响应逻辑。为了实现这一点，我们需要访问 underlying 平台 `__INLINE_CODE_83__` 和 `__INLINE_CODE_84__` 对象。我们将访问 `__INLINE_CODE_85__` 对象，以便将原始 `__INLINE_CODE_86__` 包含在日志信息中。我们将使用 `__INLINE_CODE_87__` 对象来控制响应，并使用 `__INLINE_CODE_88__` 方法。

`__CODE_BLOCK_9__`

> 信息 **提示** 所有异常过滤器都应该实现通用的 `__INLINE_CODE_89__` 接口。这要求您提供带有指定签名的 `__INLINE_CODE_90__` 方法。 `__INLINE_CODE_91__` 表示异常的类型。

> 警告 **警告** 如果您使用 `__INLINE_CODE_92__`，可以使用 `__INLINE_CODE_93__` 而不是 `__INLINE_CODE_94__`。不要忘记从 `__INLINE_CODE_95__` 导入正确的类型。

`__INLINE_CODE_96__` 装饰器将所需的元数据绑定到异常过滤器，告诉 Nest 这个特定的过滤器正在寻找 `__INLINE_CODE_97__` 类型的异常，并且什么都不做。 `__INLINE_CODE_98__` 装饰器可能需要一个参数，或者是一个逗号分隔的列表。这让您可以设置多个类型的异常过滤器。

#### Arguments host

让我们来看看 `__INLINE_CODE_99__` 方法的参数。 `__INLINE_CODE_100__` 参数是当前被处理的异常对象。 `__INLINE_CODE_101__` 参数是一个 `__INLINE_CODE_102__` 对象。 `__INLINE_CODE_103__` 是一个强大的实用对象，我们将在 `__LINK_149__` 中详细介绍。在这个代码样本中，我们使用它来获取原始请求处理器（在控制器中）传递的 `__INLINE_CODE_104__` 和 `__INLINE_CODE_105__` 对象。在这个代码样本中，我们使用了 `__INLINE_CODE_106__` 的一些帮助方法来获取所需的 `__INLINE_CODE_107__` 和 `__INLINE_CODE_108__` 对象。了解更多关于 `__INLINE_CODE_109__` 的信息，查看 `__LINK_150__`。

* 这种抽象的原因是 `__INLINE_CODE_110__` 函数在所有上下文（例如，我们正在工作的 HTTP 服务器上下文，但也适用于微服务和 WebSocket），使用 `__INLINE_CODE_111__` 和它的帮助函数，可以访问适当的 `HTML_TAG_141` underlying arguments `HTML_TAG_142` 对象，以便在任何上下文中写入通用的异常过滤器。

`HTML_TAG_143____HTML_TAG_144__`

#### 绑定过滤器

让我们将我们的 `__INLINE_CODE_112__` 绑定到 `__INLINE_CODE_113__` 的 `__INLINE_CODE_114__` 方法。

`__CODE_BLOCK_10__`

> 信息 **提示** `__INLINE_CODE_115__` 装饰器来自 `__INLINE_CODE_116__` 包。

我们在这里使用了 `__INLINE_CODE_117__` 装饰器。类似于 `__INLINE_CODE_118__` 装饰器，它可以接受单个过滤器实例，或者一个逗号分隔的列表。在这里，我们创建了 `__INLINE_CODE_以下是根据规则翻译的中文文档：

在上面的示例中，__INLINE_CODE_120__仅应用于单个__INLINE_CODE_121__路由处理器，使其方法作用域。异常过滤器可以在不同的级别上作用：控制器/解决方案/网关的方法作用域、控制器作用域或全局作用域。

例如，要将过滤器设置为控制器作用域，可以执行以下操作：

__CODE_BLOCK_12__

这段代码将设置__INLINE_CODE_122__为控制器中的每个路由处理器。

要创建全局作用域的过滤器，可以执行以下操作：

__CODE_BLOCK_13__

> warning **注意** __INLINE_CODE_124__方法不设置网关或混合应用程序的过滤器。

全局过滤器对整个应用程序有效，对每个控制器和每个路由处理器都有效。在依赖注入中，注册于非模块外的全局过滤器（如示例中的__INLINE_CODE_125__）不能注入依赖项。为了解决这个问题，可以在模块中注册全局过滤器，使用以下构造：

__CODE_BLOCK_14__

> info **提示** 在使用该方法时注入依赖项时，注意该过滤器实际上是全局的。选择在哪个模块中定义该过滤器（如示例中的__INLINE_CODE_126__）。也可以使用__INLINE_CODE_127__来处理自定义提供商注册。了解更多__LINK_151__。

可以添加多个过滤器，以便在 providers 数组中添加每个过滤器。

#### 捕获一切

要捕获**所有**未捕获的异常（不管异常类型），请将__INLINE_CODE_128__装饰器的参数列表留空，例如__INLINE_CODE_129__。

以下是一个使用__LINK_152__来传递响应/platform-agnostic 代码的示例：

__CODE_BLOCK_15__

> warning **注意** 组合捕获一切的异常过滤器和绑定到特定类型的过滤器时，“Catch anything”过滤器应该首先声明，以便正确地处理绑定的类型。

#### 继承

通常，您将创建完全自定义的异常过滤器，以满足您的应用程序需求。然而，在某些情况下，您可能想要简单地继承内置的默认**全局异常过滤器**，并在必要时 override行为基于某些因素。

要将异常处理委托给基础过滤器，您需要扩展__INLINE_CODE_132__并调用继承的__INLINE_CODE_133__方法。

__CODE_BLOCK_16__

> warning **注意** 方法作用域和控制器作用域的过滤器不能使用__INLINE_CODE_135__实例化。相反，让框架自动实例化它们。

全局过滤器**可以**继承基础过滤器。这可以通过两种方法完成。

第一个方法是在实例化自定义全局过滤器时注入__INLINE_CODE_136__引用：

__CODE_BLOCK_17__

第二个方法是使用__INLINE_CODE_137__ token__HTML_TAG_145__，如以下代码所示__HTML_TAG_146__。