<!-- 此文件从 content/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:20:44.238Z -->
<!-- 源文件: content/exception-filters.md -->

### 异常过滤器

Nest 提供了一个内置的 **异常层**，负责处理应用程序中所有未被处理的异常。當应用程序代码未能处理某个异常时，该层将捕捉该异常，并自动发送一个适合用户的响应。

__HTML_TAG_138__
  __HTML_TAG_139__
__HTML_TAG_140__

出厂情况下，这种操作由一个内置的 **全局异常过滤器** 执行，该过滤器处理类型为 __INLINE_CODE_18__ (及其子类) 的异常。当异常为 **未识别**（既不是 __INLINE_CODE_19__ 也不是 __INLINE_CODE_20__ 的子类）时，内置异常过滤器生成以下默认 JSON 响应：

```bash
$ npm i -g @nestjs/cli
$ nest new project-name

```

> info **提示** 全局异常过滤器部分支持 __INLINE_CODE_21__ 库。基本上，任何包含 __INLINE_CODE_22__ 和 __INLINE_CODE_23__ 属性的异常将被正确地填充并发送回响应（而不是默认的 __INLINE_CODE_24__ 对于未识别的异常）。

#### 抛出标准异常

Nest 提供了一个内置的 __INLINE_CODE_25__ 类，从 __INLINE_CODE_26__ 包中导出。对于典型的 HTTP REST/GraphQL API 应用程序来说，最佳实践是在某些错误条件出现时发送标准 HTTP 响应对象。

例如，在 __INLINE_CODE_27__ 中，我们有一个 __INLINE_CODE_28__ 方法（一个 __INLINE_CODE_29__ 路由处理器）。让我们假设这个路由处理器抛出一个异常。为了演示这个，我们将硬编码如下：

```bash
$ git clone https://github.com/nestjs/typescript-starter.git project
$ cd project
$ npm install
$ npm run start

```

> info **提示** 我们使用了 __INLINE_CODE_30__。这是一個来自 __INLINE_CODE_31__ 包的帮助枚举。

当客户端调用这个端点时，响应如下：

__CODE_BLOCK_2__

__INLINE_CODE_32__ 构造函数接受两个必需参数，用于确定响应：

- __INLINE_CODE_33__ 参数确定 JSON 响应体。它可以是 __INLINE_CODE_34__ 或 __INLINE_CODE_35__，如下所述。
- __INLINE_CODE_36__ 参数确定 __LINK_147__。

默认情况下，JSON 响应体包含两个属性：

- __INLINE_CODE_37__：默认为 __INLINE_CODE_38__ 参数提供的 HTTP 状态码
- __INLINE_CODE_39__：HTTP 错误的简短描述，基于 __INLINE_CODE_40__

要覆盖 JSON 响应体的消息部分，提供一个字符串作为 __INLINE_CODE_41__ 参数。要覆盖整个 JSON 响应体，传递一个对象作为 __INLINE_CODE_42__ 参数。Nest 将序列化对象并将其作为 JSON 响应体返回。

第二个构造函数参数 - __INLINE_CODE_43__ - 应该是一个有效的 HTTP 状态码。最佳实践是使用 __INLINE_CODE_44__ 枚举，从 __INLINE_CODE_45__ 包中导出。

第三个构造函数参数（可选） - __INLINE_CODE_46__ - 可以用来提供错误 __LINK_148__。这个 __INLINE_CODE_47__ 对象不会被序列化到响应对象中，但可以用于日志记录，提供有价值的信息关于抛出的 __INLINE_CODE_48__。

以下是一个覆盖整个响应体并提供错误原因的示例：

__CODE_BLOCK_3__

使用上述情况，这是响应将如何看起来：

__CODE_BLOCK_4__

#### 异常记录

默认情况下，异常过滤器不记录内置异常，如 __INLINE_CODE_49__ (及其子类)。当这些异常被抛出时，它们不会出现在控制台中，因为它们被视为正常应用程序流程的一部分。同样，对于其他内置异常，如 __INLINE_CODE_50__ 和 __INLINE_CODE_51__，也没有记录。

这些异常都是 __INLINE_CODE_52__ 类的子类，该类来自 __INLINE_CODE_53__ 包。这类帮助区分正常应用程序操作中的异常和其他异常。

如果您想记录这些异常，可以创建一个自定义的异常过滤器。我们将在下一节中解释如何做到。

#### 自定义异常

在许多情况下，您不需要编写自定义异常，可以使用 Nest 的内置 HTTP 异常，正如下一节所述。如果您确实需要创建自定义异常，好的实践是创建自己的 **异常层次结构**，其中您的自定义异常继承自 __INLINE_CODE_54__ 类。这样，Nest 就会识别您的异常，并自动处理错误响应。让我们实现这样一个自定义异常：

__CODE_BLOCK_5__

由于 __INLINE_CODE_55__ 继承自 __INLINE_CODE_56__，它将与内置的异常处理程序一起工作，因此我们可以在 __INLINE_CODE_57__ 方法中使用它。

__CODE_BLOCK_6__

#### 内置 HTTP 异常Here is the translation of the provided English technical documentation to Chinese:

Nest 提供了一组标准的异常类，它们继承自基本的 `__INLINE_CODE_58__`。这些异常类来自 `__INLINE_CODE_59__` 包，并且表示了许多最常见的 HTTP 异常：

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

使用上述异常类，这是响应的样子：

`__CODE_BLOCK_8__`

#### 异常过滤器

虽然基本的异常过滤器可以自动处理许多情况，但是你可能需要对异常层次控制完全。例如，你可能想添加日志记录或使用不同的 JSON 模式，根据一些动态因素。**异常过滤器**旨在实现这种目的。它们允许你控制流程控制和响应的内容，发送回客户端。

让我们创建一个异常过滤器，该过滤器负责捕捉 `__INLINE_CODE_82__` 类型的异常，并实现自定义响应逻辑。为了实现这个，我们需要访问底层平台的 `__INLINE_CODE_83__` 和 `__INLINE_CODE_84__` 对象。我们将访问 `__INLINE_CODE_85__` 对象，以便从中获取原始 `__INLINE_CODE_86__` 并将其包含在日志信息中。我们将使用 `__INLINE_CODE_87__` 对象来直接控制响应的发送，使用 `__INLINE_CODE_88__` 方法。

`__CODE_BLOCK_9__`

> 信息 **提示**所有异常过滤器都应该实现通用 `__INLINE_CODE_89__` 接口。这需要你提供 `__INLINE_CODE_90__` 方法的指定签名。 `__INLINE_CODE_91__` 表示异常的类型。

> 警告 **警告**如果你使用 `__INLINE_CODE_92__`，你可以使用 `__INLINE_CODE_93__` 而不是 `__INLINE_CODE_94__`。不要忘记从 `__INLINE_CODE_95__` 导入正确的类型。

`__INLINE_CODE_96__` 装饰器将元数据绑定到异常过滤器，告诉 Nest，这个特定的过滤器正在寻找 `__INLINE_CODE_97__` 类型的异常，并且什么都不别。`__INLINE_CODE_98__` 装饰器可以接受单个参数或逗号分隔的列表，允许你设置多个异常类型。

#### Arguments host

让我们来看 `__INLINE_CODE_99__` 方法的参数。`__INLINE_CODE_100__` 参数是当前被处理的异常对象。`__INLINE_CODE_101__` 参数是一个 `__INLINE_CODE_102__` 对象。`__INLINE_CODE_103__` 是一个强大的实用工具对象，我们将在 `__LINK_149__` 中更详细了解。在这个代码示例中，我们使用它来获取对 `__INLINE_CODE_104__` 和 `__INLINE_CODE_105__` 对象的引用，这些对象在原始请求处理器（在控制器中，异常的源头）中被传递。在这个代码示例中，我们使用 `__INLINE_CODE_106__` 的一些helper方法来获取所需的 `__INLINE_CODE_107__` 和 `__INLINE_CODE_108__` 对象。了解更多关于 `__INLINE_CODE_109__` 的信息，访问 `__LINK_150__`。

*原因是 `__INLINE_CODE_110__` 函数在所有上下文中都可用（例如，当前的 HTTP 服务器上下文，但也包括 Microservices 和 WebSockets）。在执行上下文章节中，我们将了解如何使用 `__INLINE_CODE_111__` 和它的helper函数来访问任何上下文的适当 `__HTML_TAG_141__` underlying arguments `__HTML_TAG_142__`。这样，我们可以编写通用的异常过滤器，它们可以在所有上下文中操作。

`__HTML_TAG_143____HTML_TAG_144__`

#### 绑定过滤器

让我们将我们的新 `__INLINE_CODE_112__` 绑定到 `__INLINE_CODE_113__` 的 `__INLINE_CODE_114__` 方法中。

`__CODE_BLOCK_10__`

> 信息 **提示** `__INLINE_CODE_115__` 装饰器来自 `__INLINE_CODE_116__` 包。

我们使用 `__INLINE_CODE_117__` 装饰器在这里。类似于 `以下是翻译后的中文文档：

在上述示例中，__INLINE_CODE_120__仅应用于单个__INLINE_CODE_121__路由处理器，使其方法作用域。异常过滤器可以在不同的级别上作用：控制器/解析器/网关的方法作用域、控制器作用域或全局作用域。

例如，要将过滤器设置为控制器作用域，可以按照以下方式操作：

__CODE_BLOCK_12__

这段代码将为__INLINE_CODE_123__中的每个路由处理器设置__INLINE_CODE_122__。

要创建全局作用域的过滤器，可以按照以下方式操作：

__CODE_BLOCK_13__

> warning **警告** __INLINE_CODE_124__方法不为网关或混合应用程序设置过滤器。

全局作用域的过滤器将在整个应用程序中使用，适用于每个控制器和每个路由处理器。在依赖注入中，注册从外部模块（如示例中的__INLINE_CODE_125__）以外的全局过滤器不能注入依赖项，因为这是在任何模块的上下文外完成的。为了解决这个问题，可以在任何模块中注册全局过滤器，使用以下构造：

__CODE_BLOCK_14__

> info **提示** 使用这种方法在过滤器中执行依赖项注入时，请注意，无论在哪个模块中使用这个构造，过滤器实际上是全局的。在哪里应该这样做？选择在过滤器(__INLINE_CODE_126__在示例中）定义的模块。也可以使用__INLINE_CODE_127__来处理自定义提供者注册。了解更多__LINK_151__。

可以添加尽多的过滤器，以便简单地将其添加到提供者数组中。

#### 捕捉一切

要捕捉**每个**未处理的异常（无论异常类型），留下__INLINE_CODE_128__装饰器的参数列表为空，例如__INLINE_CODE_129__。

在以下示例中，我们有一个平台无关的代码，因为它使用__LINK_152__来传递响应，并且没有使用平台特定的对象(__INLINE_CODE_130__和__INLINE_CODE_131__)直接：

__CODE_BLOCK_15__

> warning **警告** 组合一个捕捉一切的异常过滤器和一个绑定到特定类型的过滤器时，“Catch anything”过滤器应该声明在前，以便正确地处理绑定类型。

#### 继承

通常，您将创建完全自定义的异常过滤器，以满足应用程序的需求。然而，有些情况下，您可能想简单地继承内置的默认**全局异常过滤器**，并在根据某些因素Override行为。

要委派异常处理到基类过滤器，您需要扩展__INLINE_CODE_132__并调用继承的__INLINE_CODE_133__方法。

__CODE_BLOCK_16__

> warning **警告** 方法作用域和控制器作用域的过滤器扩展__INLINE_CODE_134__时，不应该使用__INLINE_CODE_135__。相反，让框架自动实例化它们。

全局过滤器**可以**扩展基类过滤器。这可以通过两种方法之一完成。

第一种方法是，在实例化自定义全局过滤器时注入__INLINE_CODE_136__引用：

__CODE_BLOCK_17__

第二种方法是使用__INLINE_CODE_137__令牌__HTML_TAG_145__，如以下示例所示__HTML_TAG_146__。