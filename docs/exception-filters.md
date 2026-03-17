<!-- 此文件从 content/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:01:14.723Z -->
<!-- 源文件: content/exception-filters.md -->

### 异常过滤器

Nest 提供了内置的 **异常层**，负责处理整个应用程序中未捕获的所有异常。当应用程序代码无法处理异常时，这层将自动发送适当的用户友好响应。

__HTML_TAG_138__
  __HTML_TAG_139__
__HTML_TAG_140__

默认情况下，这个操作是由内置的 **全局异常过滤器** 执行的，该过滤器处理类型为 __INLINE_CODE_18__（及其子类）的异常。对于未识别的异常（既不是 __INLINE_CODE_19__ 也不是 __INLINE_CODE_20__ 的子类），内置异常过滤器将生成以下默认 JSON 响应：

```bash
$ npm i -g @nestjs/cli
$ nest new project-name

```

> info **提示** 全局异常过滤器部分支持 __INLINE_CODE_21__ 库。基本上，如果抛出的异常包含 __INLINE_CODE_22__ 和 __INLINE_CODE_23__ 属性，它将被正确地填充并作为响应返回（而不是默认的 __INLINE_CODE_24__ 对于未识别的异常）。

#### 抛出标准异常

Nest 提供了内置的 __INLINE_CODE_25__ 类，从 __INLINE_CODE_26__ 包装集中导出。对于常见的 HTTP REST/GraphQL API 应用程序来说，最佳实践是在某些错误条件出现时发送标准 HTTP 响应对象。

例如，在 __INLINE_CODE_27__ 中，我们有一个 __INLINE_CODE_28__ 方法（一个 __INLINE_CODE_29__ 路由处理器）。假设这个路由处理器抛出异常。为了演示这个，我们将硬编码它：

```bash
$ git clone https://github.com/nestjs/typescript-starter.git project
$ cd project
$ npm install
$ npm run start

```

> info **提示** 我们使用了 __INLINE_CODE_30__。这是一种来自 __INLINE_CODE_31__ 包装集中导出的帮助枚举。

当客户端调用这个端点时，响应将如下所示：

__CODE_BLOCK_2__

__INLINE_CODE_32__ 构造函数需要两个必需参数，确定响应：

- __INLINE_CODE_33__ 参数确定 JSON 响应体。它可以是一个 __INLINE_CODE_34__ 或者是一个 __INLINE_CODE_35__，按下述描述。
- __INLINE_CODE_36__ 参数确定 __LINK_147__。

默认情况下，JSON 响应体包含两个属性：

- __INLINE_CODE_37__：默认为 __INLINE_CODE_38__ 参数提供的 HTTP 状态码
- __INLINE_CODE_39__：HTTP 错误的简短描述基于 __INLINE_CODE_40__

要覆盖 JSON 响应体的消息部分，提供一个字符串在 __INLINE_CODE_41__ 参数中。要覆盖整个 JSON 响应体，传递一个对象在 __INLINE_CODE_42__ 参数中。Nest 将序列化对象并将其作为 JSON 响应体返回。

第二个构造函数参数 - __INLINE_CODE_43__ - 应该是一个有效的 HTTP 状态码。最佳实践是使用 __INLINE_CODE_44__ 枚举导入自 __INLINE_CODE_45__。

有一个 **第三** 构造函数参数（可选） - __INLINE_CODE_46__ - 可以用于提供一个错误 __LINK_148__。这个 __INLINE_CODE_47__ 对象不被序列化到响应对象，但可以用于日志记录 purposes，提供关于抛出的 __INLINE_CODE_48__ 的有用信息。

以下是一个覆盖整个响应体和提供错误原因的示例：

__CODE_BLOCK_3__

使用上述示例，这是响应将如下所示：

__CODE_BLOCK_4__

#### 异常日志

默认情况下，异常过滤器不记录内置异常，如 __INLINE_CODE_49__（及其子类）。当这些异常被抛出时，它们不会出现在控制台，因为它们被视为正常应用程序流程的一部分。同样，对于其他内置异常，如 __INLINE_CODE_50__ 和 __INLINE_CODE_51__，也不会记录它们。

这些异常都继承于基础 __INLINE_CODE_52__ 类，该类来自 __INLINE_CODE_53__ 包装集中导出。这类帮助区分异常，它们是应用程序正常操作的一部分还是不是。

如果你想记录这些异常，你可以创建自定义异常过滤器。下一节将解释如何做到。

#### 自定义异常

在许多情况下，你不需要编写自定义异常，可以使用 Nest 的内置 HTTP 异常，按下一节描述。如果你需要创建自定义异常，好的实践是创建自己的 **异常继承结构**，其中你的自定义异常继承自基础 __INLINE_CODE_54__ 类。这样，Nest 将识别你的异常，并自动处理错误响应。让我们实现这样一个自定义异常：

__CODE_BLOCK_5__

由于 __INLINE_CODE_55__ 继承自基础 __INLINE_CODE_56__ 类，它将与内置的异常处理器协同工作，因此我们可以在 __INLINE_CODE_57__ 方法中使用它。

__CODE_BLOCK_6__

#### 内置 HTTP 异常Here is the translation of the provided English technical documentation to Chinese:

Nest 提供了一组标准异常，它们继承于基础类 __INLINE_CODE_58__。这些异常来自 __INLINE_CODE_59__ 包，并且代表了许多最常见的 HTTP 异常：

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

所有内置异常都可以提供错误信息和错误描述使用 __INLINE_CODE_81__ 参数：

__CODE_BLOCK_7__

使用上述信息，这是响应将看起来：

__CODE_BLOCK_8__

#### 异常过滤器

虽然基本的（内置）异常过滤器可以自动处理许多情况，但是你可能想要拥有对异常层次的完全控制。例如，你可能想要添加日志记录或根据动态因素使用不同的 JSON 模式。 **异常过滤器** precisely designed for this purpose。它们让你控制精确的控制流和客户端响应的内容。

让我们创建一个异常过滤器，它负责捕捉 __INLINE_CODE_82__ 类型的异常，并且实现自定义响应逻辑。为了实现这个，我们需要访问平台的 __INLINE_CODE_83__ 和 __INLINE_CODE_84__ 对象。我们将访问 __INLINE_CODE_85__ 对象，以便从中获取原始 __INLINE_CODE_86__ 并将其包含在日志信息中。我们将使用 __INLINE_CODE_87__ 对象来控制响应发送的过程，使用 __INLINE_CODE_88__ 方法。

__CODE_BLOCK_9__

> 提示 **Hint** 所有异常过滤器都应该实现泛型 __INLINE_CODE_89__ 接口。这要求你提供 __INLINE_CODE_90__ 方法的签名。 __INLINE_CODE_91__ 表示异常的类型。

> 警告 **Warning** 如果你使用 __INLINE_CODE_92__，那么你可以使用 __INLINE_CODE_93__ 而不是 __INLINE_CODE_94__。不要忘记从 __INLINE_CODE_95__ 导入正确的类型。

__INLINE_CODE_96__ 装饰器将所需的元数据绑定到异常过滤器中，告诉 Nest 这个特定的过滤器正在寻找类型为 __INLINE_CODE_97__ 的异常，并且什么都不做。 __INLINE_CODE_98__ 装饰器可能需要单个参数，也可能需要逗号分隔的列表。这允许你为多种类型的异常设置过滤器。

#### Arguments host

让我们看一下 __INLINE_CODE_99__ 方法的参数。 __INLINE_CODE_100__ 参数是当前正在处理的异常对象。 __INLINE_CODE_101__ 参数是一个 __INLINE_CODE_102__ 对象。 __INLINE_CODE_103__ 是一个强大utility 对象，我们将在 __LINK_149__ 中了解更多关于它。在这个代码示例中，我们使用它来获取对 __INLINE_CODE_104__ 和 __INLINE_CODE_105__ 对象的引用，这些对象是被传递给原始请求处理程序（在控制器中）的地方。在这个代码示例中，我们使用了 __INLINE_CODE_106__ 的帮助方法来获取所需的 __INLINE_CODE_107__ 和 __INLINE_CODE_108__ 对象。了解更多关于 __INLINE_CODE_109__ 的信息，查看 __LINK_150__。

* 这个级别的抽象是因为 __INLINE_CODE_110__ 函数在所有上下文中都可用（例如，我们现在正在使用的 HTTP 服务器上下文，但也在 Microservices 和 WebSockets 中）。在执行上下文章节中，我们将看到如何使用 __INLINE_CODE_111__ 和它的帮助函数来访问适当的 __HTML_TAG_141__ underlying arguments __HTML_TAG_142__ 对于 **任何** 执行上下文。这将允许我们编写通用的异常过滤器，它们可以在所有上下文中操作。

__HTML_TAG_143____HTML_TAG_144__

#### 绑定过滤器

让我们将我们的新的 __INLINE_CODE_112__ 绑定到 __INLINE_CODE_113__ 的 __INLINE_CODE_114__ 方法。

__CODE_BLOCK_10__

> 提示 **Hint** __INLINE_CODE_115__ 装饰器来自 __INLINE_CODE_116__ 包。

我们这里使用了 __INLINE_CODE_117__ 装饰器。类似于 __INLINE_CODE_118__ 装饰器，它可以接受单个过滤器实例，也可以接受逗号分隔的过滤器实例列表。在这里，我们在 place 创建了 __INLINE_CODE_119__ 的实例。或者，你可能会将类（而不是实例）传递给框架，并让框架负责实例化，以便实现 **依赖注入**。

__CODE_BLOCK_11__

> 提示 **Hint** 尽量使用类来应用过滤器，而不是实例。这可以减少 **内存使用Here is the translation of the provided English technical documentation to Chinese:

在示例中，__INLINE_CODE_120__仅应用于单个__INLINE_CODE_121__路由处理器，使其方法作用域。异常过滤器可以在不同的级别上作用：控制器/解析器/网关方法作用域、控制器作用域或全局作用域。

例如，要将过滤器设置为控制器作用域，可以按照以下方式进行：

__CODE_BLOCK_12__

这段代码将为__INLINE_CODE_123__中的每个路由处理器设置__INLINE_CODE_122__。

要创建全局作用域的过滤器，可以按照以下方式进行：

__CODE_BLOCK_13__

> 警告 **Warning** __INLINE_CODE_124__方法不为网关或混合应用程序设置过滤器。

全局过滤器适用于整个应用程序，对于每个控制器和每个路由处理器都有效。在依赖注入中，注册于外部模块（使用__INLINE_CODE_125__示例）而不能注入依赖项，因为这是在模块上下文外进行的。要解决这个问题，可以在任何模块中直接注册全局过滤器使用以下构造：

__CODE_BLOCK_14__

> 提示 **Hint** 使用这个方法对过滤器进行依赖注入时，请注意，无论是在哪个模块中使用了这个构造，过滤器实际上是全局的。选择在过滤器(__INLINE_CODE_126__示例)定义的模块中进行这个构造。另外,__INLINE_CODE_127__并不是唯一的自定义提供者注册方法。了解更多__LINK_151__。

可以添加多个过滤器使用这个技术；只需将每个过滤器添加到providers数组中。

#### 捕捉一切

为了捕捉**所有**未处理的异常（不论异常类型），留下__INLINE_CODE_128__装饰器的参数列表为空，例如__INLINE_CODE_129__。

在以下示例中，我们有一个平台无关的代码，因为它使用__LINK_152__来传递响应，并且没有直接使用平台特定的对象(__INLINE_CODE_130__和__INLINE_CODE_131__)：

__CODE_BLOCK_15__

> 警告 **Warning** 将“Catch anything”过滤器与绑定到特定类型的过滤器结合使用时，应该将“Catch anything”过滤器声明在前，以便正确地处理绑定类型。

#### 继承

通常，您将创建完全自定义的异常过滤器，以满足应用程序要求。然而，在某些情况下，您可能想要简单地继承默认的**全局异常过滤器**，并根据某些因素进行 Overrides。

要委托异常处理到基过滤器，您需要扩展__INLINE_CODE_132__并调用继承的__INLINE_CODE_133__方法。

__CODE_BLOCK_16__

> 警告 **Warning** 方法作用域和控制器作用域的过滤器扩展__INLINE_CODE_134__时，不应该使用__INLINE_CODE_135__来实例化它们。相反，让框架自动实例化它们。

全局过滤器**可以**扩展基过滤器。这可以通过两种方式之一实现。

第一种方法是在实例化自定义全局过滤器时注入__INLINE_CODE_136__引用：

__CODE_BLOCK_17__

第二种方法是使用__INLINE_CODE_137__token __HTML_TAG_145__，如下所示__HTML_TAG_146__。