<!-- 此文件从 content/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:49:33.661Z -->
<!-- 源文件: content/exception-filters.md -->

### 异常过滤器

Nest 来自一套内置的 **异常层**，负责处理整个应用程序中的所有未处理的异常。当应用程序代码未处理某个异常时，这层将自动发送一个合适的友好响应。

__HTML_TAG_138__
  __HTML_TAG_139__
__HTML_TAG_140__

默认情况下，这个操作由内置的 **全局异常过滤器** 执行，该过滤器处理 __INLINE_CODE_18__ 类型（及其子类）的异常。当异常未被识别（既不是 __INLINE_CODE_19__ 也不是继承自 __INLINE_CODE_20__）时，内置异常过滤器将生成以下默认 JSON 响应：

```bash
$ npm i -g @nestjs/cli
$ nest new project-name

```

> info **提示** 全局异常过滤器部分支持 __INLINE_CODE_21__ 库。基本上，如果抛出的异常包含 __INLINE_CODE_22__ 和 __INLINE_CODE_23__ 属性，它将被正确地填充并发送回响应（而不是默认的 __INLINE_CODE_24__ 对于未识别的异常）。

#### 抛出标准异常

Nest 提供了内置的 __INLINE_CODE_25__ 类，来自 __INLINE_CODE_26__ 包。对于常见的 HTTP REST/GraphQL API 应用程序，最佳实践是在某些错误条件出现时发送标准 HTTP 响应对象。

例如，在 __INLINE_CODE_27__ 中，我们有一个 __INLINE_CODE_28__ 方法（一个 __INLINE_CODE_29__ 路由处理器）。假设这个路由处理器抛出某个异常。为了演示这个，我们将硬编码它如下：

```bash
$ git clone https://github.com/nestjs/typescript-starter.git project
$ cd project
$ npm install
$ npm run start

```

> info **提示** 我们使用了 __INLINE_CODE_30__。这是 __INLINE_CODE_31__ 包中导入的 helper 枚举。

当客户端调用这个端点时，响应如下：

__CODE_BLOCK_2__

__INLINE_CODE_32__ 构造函数需要两个必需参数，确定响应：

- __INLINE_CODE_33__ 参数定义 JSON 响应体。它可以是一个 __INLINE_CODE_34__ 或者 __INLINE_CODE_35__，如下所述。
- __INLINE_CODE_36__ 参数定义 __LINK_147__。

默认情况下，JSON 响应体包含两个属性：

- __INLINE_CODE_37__：默认为 __INLINE_CODE_38__ 参数提供的 HTTP 状态码
- __INLINE_CODE_39__：HTTP 错误的简短描述，基于 __INLINE_CODE_40__

要 Override JSON 响应体的消息部分，提供一个字符串作为 __INLINE_CODE_41__ 参数。要 Override整个 JSON 响应体，传递一个对象作为 __INLINE_CODE_42__ 参数。Nest 将序列化对象并将其作为 JSON 响应体。

第二个构造函数参数 - __INLINE_CODE_43__ - 应该是一个有效的 HTTP 状态码。最佳实践是使用 __INLINE_CODE_44__ 枚举，从 __INLINE_CODE_45__ 导入。

第三个构造函数参数（可选） - __INLINE_CODE_46__ - 可以用来提供一个错误 __LINK_148__。这个 __INLINE_CODE_47__ 对象不会被序列化到响应对象，但可以在日志中提供有价值的信息，关于导致 __INLINE_CODE_48__ 异常的内部错误。

以下是一个 Override整个响应体并提供错误原因的示例：

__CODE_BLOCK_3__

使用上述内容，这是响应将看起来：

__CODE_BLOCK_4__

#### 异常日志

默认情况下，异常过滤器不记录内置异常，例如 __INLINE_CODE_49__（及其子类）。当这些异常被抛出时，它们将不会出现在控制台，因为它们被视为正常应用程序流程的一部分。同样，其他内置异常，如 __INLINE_CODE_50__ 和 __INLINE_CODE_51__，也继承自基本 __INLINE_CODE_52__ 类，从 __INLINE_CODE_53__ 导入。

如果你想要记录这些异常，可以创建一个自定义的异常过滤器。下一节将解释如何做到这一点。

#### 自定义异常

在许多情况下，你不需要编写自定义异常，可以使用 Nest 的内置 HTTP 异常，如下一节所述。如果你需要创建自定义异常，最佳实践是创建自己的 **异常层次结构**，其中你的自定义异常继承自基本 __INLINE_CODE_54__ 类。这样，Nest 将识别你的异常，并自动处理错误响应。让我们实现这样一个自定义异常：

__CODE_BLOCK_5__

由于 __INLINE_CODE_55__ 扩展了基本 __INLINE_CODE_56__ 类，它将与内置的异常处理器工作无缝，并且可以在 __INLINE_CODE_57__ 方法中使用。

__CODE_BLOCK_6__

#### 内置 HTTP 异常Here is the translated technical documentation in Chinese:

Nest 提供了一组标准的异常类继承自基本的 __INLINE_CODE_58__。这些异常类来自 __INLINE_CODE_59__ 包，并且代表了许多最常见的 HTTP 异常：

- __INLINE_CODE_60__
- __INLINE_CODE_61__
- __INLINE_CODE_62__
- __INLINE_CODE_63__
- __INLINE_CODE_64__
- __INLINE_CODE_65__
- __INLINE_CODE_66__
- __INLINE_CODE_67__
- __INLINE_CODE_68__
- __INLINE_CODE_69__
- __INLINE_CODE_70__
- __INLINE_CODE_71__
- __INLINE_CODE_72__
- __INLINE_CODE_73__
- __INLINE_CODE_74__
- __INLINE_CODE_75__
- __INLINE_CODE_76__
- __INLINE_CODE_77__
- __INLINE_CODE_78__
- __INLINE_CODE_79__

所有内置的异常类都可以提供错误信息和错误描述使用 __INLINE_CODE_81__ 参数：

__CODE_BLOCK_7__

使用上述信息，这是响应的样子：

__CODE_BLOCK_8__

#### 异常过滤器

虽然基础的异常过滤器可以自动处理许多情况，但是您可能想要对异常层次进行完全控制。例如，您可能想要添加日志或使用不同的 JSON schema，根据一些动态因素。异常过滤器正是为此目的设计的。它们允许您控制精确的控制流和客户端接收的响应内容。

让我们创建一个异常过滤器，它负责捕获 __INLINE_CODE_82__ 类型的异常，并实现自定义响应逻辑。为了实现这个，我们需要访问基本平台 __INLINE_CODE_83__ 和 __INLINE_CODE_84__ 对象。我们将访问 __INLINE_CODE_85__ 对象，以便从中获取原始 __INLINE_CODE_86__ 并将其包含在日志信息中。我们将使用 __INLINE_CODE_87__ 对象来直接控制客户端接收的响应，使用 __INLINE_CODE_88__ 方法。

__CODE_BLOCK_9__

> info **提示** 所有异常过滤器都应该实现泛型 __INLINE_CODE_89__ 接口。这要求您提供 __INLINE_CODE_90__ 方法，具有指定的签名。__INLINE_CODE_91__ 表示异常的类型。

> warning **警告** 如果您使用 __INLINE_CODE_92__，可以使用 __INLINE_CODE_93__ 而不是 __INLINE_CODE_94__。不要忘记从 __INLINE_CODE_95__ 导入正确的类型。

__INLINE_CODE_96__ 装饰器将所需的元数据绑定到异常过滤器，告诉 Nest 这个特定的过滤器正在寻找 __INLINE_CODE_97__ 类型的异常，并且什么都不做。__INLINE_CODE_98__ 装饰器可能需要单个参数，也可能需要逗号分隔的列表。这允许您为多个异常类型同时设置过滤器。

#### Arguments host

让我们查看 __INLINE_CODE_99__ 方法的参数。__INLINE_CODE_100__ 参数是当前被处理的异常对象。__INLINE_CODE_101__ 参数是一个 __INLINE_CODE_102__ 对象。__INLINE_CODE_103__ 是一个强大的实用对象，我们将在 __LINK_149__ 中详细介绍。在这个代码示例中，我们使用它来获取原始请求处理器（在控制器中异常起源处）的 __INLINE_CODE_104__ 和 __INLINE_CODE_105__ 对象。在这个代码示例中，我们使用了 __INLINE_CODE_106__ 的一些 helper 方法来获取所需的 __INLINE_CODE_107__ 和 __INLINE_CODE_108__ 对象。了解更多关于 __INLINE_CODE_109__ 的信息，查看 __LINK_150__。

*原因是 __INLINE_CODE_110__ 函数在所有上下文中都可用（例如现在的 HTTP 服务器上下文，但也包括微服务和 WebSocket）。在执行上下文章节中，我们将看到如何使用 __INLINE_CODE_111__ 和它的 helper 函数来访问适当的 __HTML_TAG_141__ underlying arguments__HTML_TAG_142__，以便在任何上下文中编写通用的异常过滤器。

__HTML_TAG_143____HTML_TAG_144__

#### 绑定过滤器

让我们将我们的 __INLINE_CODE_112__ 绑定到 __INLINE_CODE_113__ 的 __INLINE_CODE_114__ 方法。

__CODE_BLOCK_10__

> info **提示** __INLINE_CODE_115__ 装饰器来自 __INLINE_CODE_116__ 包。

我们使用了 __INLINE_CODE_117__ 装饰器。在这里，我们创建了 __INLINE_CODE_119__ 的实例。或者，您可以传递类（而不是实例），让框架负责实例化，并启用 **依赖注入**。

__CODE_BLOCK_11__

> info **提示** Prefer applying filters by using classes instead of instances when possible. It reduces **memory usage** since Nest can easily reuse instances of the same class across your entire module.Here is the translated text:

在上面的示例中，__INLINE_CODE_120__仅应用于单个__INLINE_CODE_121__路由处理程序，使其方法作用域。异常过滤器可以在不同的级别上作用：控制器/解决方案/网关的方法作用域、控制器作用域或全局作用域。

例如，要将过滤器设置为控制器作用域，可以按照以下步骤进行：

__CODE_BLOCK_12__

这个构造设置了__INLINE_CODE_122__对每个定义在__INLINE_CODE_123__中的路由处理程序。

要创建全局作用域的过滤器，可以按照以下步骤进行：

__CODE_BLOCK_13__

>警告 **Warning** 方法__INLINE_CODE_124__不对网关或混合应用程序设置过滤器。

全局作用域的过滤器在整个应用程序中使用，对于每个控制器和每个路由处理程序。从依赖注入的角度来看，全局过滤器注册于任何模块外（如在上面的示例中）不能注入依赖项，因为这是在任何模块的上下文外进行的。为了解决这个问题，可以在任何模块中注册全局过滤器，使用以下构造：

__CODE_BLOCK_14__

>提示 **Hint** 使用这种方法在过滤器中执行依赖项注入时，请注意，无论是在哪个模块中执行这构造，该过滤器实际上是全局的。应该在哪个模块中执行？选择定义过滤器（如在上面的示例中）的模块。也可以学习更多关于自定义提供者注册的方法__LINK_151__。

可以添加多个过滤器使用这种技术，只需将每个添加到提供者数组中。

#### 捕捉所有

为了捕捉**所有**未处理的异常（不管异常类型），请将__INLINE_CODE_128__装饰器的参数列表留空，例如__INLINE_CODE_129__。

下面是一个平台无关的代码，它使用__LINK_152__来传递响应，并且不使用平台特定的对象(__INLINE_CODE_130__和__INLINE_CODE_131__)直接：

__CODE_BLOCK_15__

>警告 **Warning** 组合一个捕捉所有的异常过滤器与一个绑定到特定类型的过滤器时，“Catch anything”过滤器应该在前，以便正确地处理绑定类型。

#### 继承

通常，您将创建完全自定义的异常过滤器，以满足应用程序要求。然而，有些情况下，您可能想要简单地继承内置的默认**全局异常过滤器**，并在某些因素下Override行为。

为了将异常处理委托给基础过滤器，请扩展__INLINE_CODE_132__并调用继承的__INLINE_CODE_133__方法。

__CODE_BLOCK_16__

>警告 **Warning** 方法作用域和控制器作用域的过滤器，继承自__INLINE_CODE_134__不应该使用__INLINE_CODE_135__实例化。相反，让框架自动实例化它们。

全局过滤器**可以**继承基础过滤器。这可以通过以下两种方法之一实现。

第一个方法是在自定义全局过滤器中注入__INLINE_CODE_136__引用：

__CODE_BLOCK_17__

第二个方法使用__INLINE_CODE_137__令牌__HTML_TAG_145__，如下所示__HTML_TAG_146__。