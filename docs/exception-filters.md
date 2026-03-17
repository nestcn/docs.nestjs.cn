<!-- 此文件从 content/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:28:41.196Z -->
<!-- 源文件: content/exception-filters.md -->

### 异常过滤器

Nest 提供了一个内置的 **异常层**，负责处理应用程序中所有未被处理的异常。当应用程序代码无法处理异常时，这层会自动发送一个适当的用户友好响应。

__HTML_TAG_138__
  __HTML_TAG_139__
__HTML_TAG_140__

默认情况下，这个动作是由内置的 **全局异常过滤器** 执行的，该过滤器处理类型 __INLINE_CODE_18__ 的异常（及其子类）。当异常未被识别（既不是 __INLINE_CODE_19__ 也不是 __INLINE_CODE_20__ 的子类），内置异常过滤器将生成以下默认 JSON 响应：

```bash
$ npm i -g @nestjs/cli
$ nest new project-name

```

> 信息 **提示** 全局异常过滤器部分支持 __INLINE_CODE_21__ 库。基本上，任何包含 __INLINE_CODE_22__ 和 __INLINE_CODE_23__ 属性的抛出异常将被正确地填充并发送回响应（而不是未识别异常的默认 __INLINE_CODE_24__）。

#### 抛出标准异常

Nest 提供了一个内置的 __INLINE_CODE_25__ 类，来自 __INLINE_CODE_26__ 包。对于典型的 HTTP REST/GraphQL API 应用程序来说，最佳实践是在某些错误条件下发送标准 HTTP 响应对象。

例如，在 __INLINE_CODE_27__ 中，我们有一个 __INLINE_CODE_28__ 方法（一个 __INLINE_CODE_29__ 路由处理器）。让我们假设这个路由处理器抛出一个异常。为了演示这个，我们将硬编码它如下：

```bash
$ git clone https://github.com/nestjs/typescript-starter.git project
$ cd project
$ npm install
$ npm run start

```

> 信息 **提示** 我们在这里使用了 __INLINE_CODE_30__。这是一个来自 __INLINE_CODE_31__ 包的助手枚举。

当客户端调用这个端点时，响应将如下所示：

__CODE_BLOCK_2__

__INLINE_CODE_32__ 构造函数需要两个必需参数，确定响应：

- __INLINE_CODE_33__ 参数确定 JSON 响应体。它可以是一个 __INLINE_CODE_34__ 或 __INLINE_CODE_35__，如以下所述。
- __INLINE_CODE_36__ 参数确定 __LINK_147__。

默认情况下，JSON 响应体包含两个属性：

- __INLINE_CODE_37__: 默认为 __INLINE_CODE_38__ 参数提供的 HTTP 状态码
- __INLINE_CODE_39__: HTTP 错误的简短描述，基于 __INLINE_CODE_40__

要覆盖 JSON 响应体的消息部分，提供一个字符串作为 __INLINE_CODE_41__ 参数。要覆盖整个 JSON 响应体，传递一个对象作为 __INLINE_CODE_42__ 参数。Nest 将序列化对象并将其作为 JSON 响应体返回。

第二个构造函数参数 - __INLINE_CODE_43__ - 应该是一个有效的 HTTP 状态码。最佳实践是使用 __INLINE_CODE_44__ 枚举，来自 __INLINE_CODE_45__。

有一个 **第三** 构造函数参数（可选） - __INLINE_CODE_46__ - 可以用来提供错误 __LINK_148__。这个 __INLINE_CODE_47__ 对象不被序列化到响应对象中，但可以用于日志记录，提供有价值的信息关于引发 __INLINE_CODE_48__ 异常的内部错误。

以下是一个覆盖整个响应体并提供错误原因的示例：

__CODE_BLOCK_3__

使用上述，这是响应将如下所示：

__CODE_BLOCK_4__

#### 异常日志

默认情况下，异常过滤器不记录内置异常，如 __INLINE_CODE_49__（及其子类）。当这些异常被抛出时，它们不会出现在控制台中，因为它们被视为正常应用程序流程的一部分。同样，对于其他内置异常，如 __INLINE_CODE_50__ 和 __INLINE_CODE_51__，也将不记录。

这些异常都继承自基本 __INLINE_CODE_52__ 类，该类来自 __INLINE_CODE_53__ 包。这类帮助区分正常应用程序操作中抛出的异常和其他抛出的异常。

如果您想记录这些异常，可以创建一个自定义的异常过滤器。我们将在下一节中解释如何做到。

#### 自定义异常

在许多情况下，您不需要编写自定义异常，可以使用 Nest 的内置 HTTP 异常，如下一节所述。如果您需要创建自定义异常，最佳实践是创建自己的 **异常层次结构**，其中您的自定义异常继承自基本 __INLINE_CODE_54__ 类。这样，Nest 就会 recognizes 你的异常，并自动处理错误响应。让我们实现这样一个自定义异常：

__CODE_BLOCK_5__

由于 __INLINE_CODE_55__ 扩展了基本 __INLINE_CODE_56__ 类，因此它将与内置的异常处理程序协同工作，我们可以在 __INLINE_CODE_57__ 方法中使用它。

__CODE_BLOCK_6__

#### 内置 HTTP 异常Nest 提供了一组标准的异常，继承自基本的 `__INLINE_CODE_58__`。这些异常来自 `__INLINE_CODE_59__` 包，并且代表了许多最常见的 HTTP 异常：

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

所有内置异常都可以提供错误信息和错误描述，可以使用 `__INLINE_CODE_81__` 参数：

`__CODE_BLOCK_7__`

使用上述代码，这是响应的样子：

`__CODE_BLOCK_8__`

#### 异常过滤器

虽然基本的异常过滤器可以自动处理许多情况，但是你可能想要对异常层进行完全控制。例如，你可能想要添加日志或使用不同的 JSON 模式，根据一些动态因素。**异常过滤器** precisely designed for this purpose。它们让你控制响应的 exact flow 和客户端发送的内容。

让我们创建一个异常过滤器，它负责捕捉 `__INLINE_CODE_82__` 类型的异常，并实现自定义的响应逻辑。为了实现这个，我们需要访问 underlying 平台 `__INLINE_CODE_83__` 和 `__INLINE_CODE_84__` 对象。我们将访问 `__INLINE_CODE_85__` 对象，以便从中获取原始 `__INLINE_CODE_86__` 并将其包含在日志信息中。我们将使用 `__INLINE_CODE_87__` 对象来控制响应，使用 `__INLINE_CODE_88__` 方法。

`__CODE_BLOCK_9__`

> 信息 **提示** 所有异常过滤器都应该实现 generic `__INLINE_CODE_89__` 接口。这个接口要求你提供 `__INLINE_CODE_90__` 方法，使用指定的签名。`__INLINE_CODE_91__` 指示异常的类型。

> 警告 **警告** 如果你使用 `__INLINE_CODE_92__`，你可以使用 `__INLINE_CODE_93__` 而不是 `__INLINE_CODE_94__`。不要忘记从 `__INLINE_CODE_95__` 导入正确的类型。

`__INLINE_CODE_96__` 装饰器将 required 元数据绑定到异常过滤器，告诉 Nest 这个过滤器正在寻找 `__INLINE_CODE_97__` 类型的异常，并且没有其他类型。`__INLINE_CODE_98__` 装饰器可能需要单个参数，也可能需要逗号分隔的列表。这使你可以同时设置多个异常类型。

#### Arguments 主机

让我们来看 `__INLINE_CODE_99__` 方法的参数。`__INLINE_CODE_100__` 参数是当前正在处理的异常对象。`__INLINE_CODE_101__` 参数是一个 `__INLINE_CODE_102__` 对象。`__INLINE_CODE_103__` 是一个强大的utility 对象，我们将在 `__LINK_149__` 中详细介绍。在这个代码示例中，我们使用它来获取对 `__INLINE_CODE_104__` 和 `__INLINE_CODE_105__` 对象的引用，这些对象是在原始请求处理器（在控制器中异常源头）中被传递的。在这个代码示例中，我们使用了 `__INLINE_CODE_106__` 的一些helper 方法来获取所需的 `__INLINE_CODE_107__` 和 `__INLINE_CODE_108__` 对象。了解更多关于 `__INLINE_CODE_109__` 的信息，查看 `__LINK_150__`。

* 由于 `__INLINE_CODE_110__` 函数在所有上下文中都可用（例如，我们现在工作的 HTTP 服务器上下文，但也包括微服务和 WebSocket），在执行上下文章节中，我们将看到如何访问适当的 `__HTML_TAG_141__` underlying arguments `__HTML_TAG_142__`，以便在任何上下文中写出通用的异常过滤器。

`__HTML_TAG_143____HTML_TAG_144__`

#### 绑定过滤器

让我们将我们的 `__INLINE_CODE_112__` 关联到 `__INLINE_CODE_113__` 的 `__INLINE_CODE_114__` 方法。

`__CODE_BLOCK_10__`

> 信息 **提示** `__INLINE_CODE_115__` 装饰器来自 `__INLINE_CODE_116__` 包。

我们使用了 `__INLINE_CODE_117__` 装饰器。类似于 `__INLINE_CODE_118__` 装饰器，它可以接受单个过滤器实例，也可以接受逗号分隔的过滤器实例。这里，我们创建了 `__INLINE_CODE_119__` 的实例。以下是翻译后的中文文档：

在上面的示例中，__INLINE_CODE_120__ 只对单个 __INLINE_CODE_121__ 路由处理器生效，使其方法作用域。异常过滤器可以在不同的级别上设置：控制器/解析器/网关的方法作用域、控制器作用域或全局作用域。

例如，要将过滤器设置为控制器作用域，可以按照以下方式操作：

__CODE_BLOCK_12__

这段代码将为 __INLINE_CODE_123__ 内的每个路由处理器设置 __INLINE_CODE_122__。

要创建全局作用域的过滤器，可以按照以下方式操作：

__CODE_BLOCK_13__

> warning **警告** The __INLINE_CODE_124__ 方法不设置网关或混合应用程序的过滤器。

全局过滤器在整个应用程序中使用，对于每个控制器和每个路由处理器都有效。在依赖注入中，来自外部模块（如示例中的 __INLINE_CODE_125__）注册的全局过滤器不能注入依赖项，因为这是在任何模块的上下文外完成的。要解决这个问题，可以在任何模块中注册全局过滤器，使用以下构造：

__CODE_BLOCK_14__

> info **提示** 使用该方法在过滤器中进行依赖项注入时，注意该过滤器实际上是全局的。应该在哪个模块中做这件事？选择定义过滤器（如示例中的 __INLINE_CODE_126__）的模块。 __INLINE_CODE_127__ 除此之外，还有其他方法来处理自定义提供者注册。了解更多 __LINK_151__。

可以添加任意多个过滤器使用该技术，只需将每个过滤器添加到 providers 数组中。

#### 捕获一切

要捕获 **所有** 未处理的异常（无论异常类型），留下 __INLINE_CODE_128__ 装饰器的参数列表为空，例如 __INLINE_CODE_129__。

在以下示例中，我们有一个平台无关的代码，因为它使用 __LINK_152__ 发送响应，并且不使用平台特定的对象（ __INLINE_CODE_130__ 和 __INLINE_CODE_131__）直接：

__CODE_BLOCK_15__

> warning **警告** 在组合捕获一切的异常过滤器和绑定到特定类型的过滤器时，“Catch anything”过滤器应该在前面，以便正确地处理绑定类型。

#### 继承

通常，您将创建完全自定义的异常过滤器，以满足应用程序的需求。然而，在某些情况下，您可能想要简单地扩展默认的 **全局异常过滤器**，并根据某些因素override行为。

要委派异常处理到基过滤器，您需要扩展 __INLINE_CODE_132__ 并调用继承的 __INLINE_CODE_133__ 方法。

__CODE_BLOCK_16__

> warning **警告** 方法作用域和控制器作用域的过滤器，扩展 __INLINE_CODE_134__ 应该不使用 __INLINE_CODE_135__。相反，让框架自动实例化它们。

全局过滤器 **可以** 扩展基过滤器。这可以通过以下两种方法完成。

第一个方法是将 __INLINE_CODE_136__ 引用注入到自定义全局过滤器中：

__CODE_BLOCK_17__

第二个方法是使用 __INLINE_CODE_137__ 令牌 __HTML_TAG_145__，示例如下__HTML_TAG_146__。