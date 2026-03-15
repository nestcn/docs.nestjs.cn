<!-- 此文件从 content/controllers.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:47:49.966Z -->
<!-- 源文件: content/controllers.md -->

### 控制器

控制器负责处理 incoming 请求和发送相应的响应给客户端。

__HTML_TAG_156____HTML_TAG_157____HTML_TAG_158__

控制器的目的是处理特定的应用程序请求。路由机制决定了哪个控制器将处理每个请求。控制器通常具有多个路由，每个路由可以执行不同的操作。

要创建基本控制器，我们使用类和装饰器。装饰器将类与必要的元数据关联，这使得Nest能够创建路由映射，该映射将请求连接到相应的控制器。

> info **提示**快速创建一个CRUD控制器，可以使用CLI的 __LINK_315__： __INLINE_CODE_25__。

#### 路由

以下示例中，我们将使用 __INLINE_CODE_26__ 装饰器，该装饰器是必需的，以定义基本控制器。我们将指定可选的路由路径前缀为 __INLINE_CODE_27__。使用路由路径前缀在 __INLINE_CODE_28__ 装饰器中可以将相关路由组合在一起，并减少重复的代码。例如，如果我们想将与猫实体相关的交互路由组合在一起，并将它们放置在 __INLINE_CODE_29__ 路径下，可以在 __INLINE_CODE_31__ 装饰器中指定 __INLINE_CODE_30__ 路径前缀。这 way, we don't need to repeat that portion of the path for each route in the file.

```bash
$ npm i -D @compodoc/compodoc

```

> info **提示**使用CLI创建控制器，只需执行 __INLINE_CODE_32__ 命令。

__INLINE_CODE_33__ HTTP 请求方法装饰器在 __INLINE_CODE_34__ 方法之前，告诉Nest创建一个处理特定端点的处理程序。这端点由HTTP请求方法（GET 在这个情况下）和路由路径定义。因此，这个路由路径是什么？路由路径由控制器的可选前缀和方法装饰器中的路径组合。由于我们为每个路由设置了前缀（ __INLINE_CODE_35__ ），并且没有在方法装饰器中添加任何特定的路径，Nest将将 __INLINE_CODE_36__ 请求映射到这个处理程序。

在我们的示例中，当发送GET 请求到这个端点时，Nest将请求路由到用户定义的 __INLINE_CODE_40__ 方法。注意，我们选择的方法名是任意的。虽然我们必须声明一个方法来绑定路由，但Nest不将任何特别的意义与方法名相关联。

这个方法将返回200状态码，以及关联的响应，这个响应在这个情况下只是一个字符串。为什么会这样？为了解释，我们需要介绍Nest使用两个不同的选项来处理响应：

__HTML_TAG_159__
  __HTML_TAG_160__
    __HTML_TAG_161__Standard (recommended)__HTML_TAG_162__
    __HTML_TAG_163__
      使用这个内置方法，请求处理程序返回 JavaScript 对象或数组时，Nest将自动将其序列化为 JSON。然而，如果返回一个 JavaScript基本类型（例如 __HTML_TAG_166__ 字符串 __HTML_TAG_167__、 __HTML_TAG_168__ 数字 __HTML_TAG_169__、 __HTML_TAG_170__ 布尔值 __HTML_TAG_171__），Nest将发送只是该值，而不尝试序列化它。这使得响应处理简单：只需返回值，Nest就负责处理剩余的部分。
      __HTML_TAG_172__
      __HTML_TAG_173__ 另外，响应的 __HTML_TAG_174__ 状态代码 __HTML_TAG_175__ 始终是200，except for POST 请求，它使用201。我们可以轻松地更改这个行为 bằng添加 __HTML_TAG_176__ @HttpCode(...) __HTML_TAG_177__ 装饰器在处理程序级别（见 __HTML_TAG_178__ 状态代码 __HTML_TAG_179__）。
    __HTML_TAG_180__
  __HTML_TAG_181__
  __HTML_TAG_182__
    __HTML_TAG_183__Library-specific__HTML_TAG_184__
    __HTML_TAG_185__
      我们可以使用库特定的（例如 Express） __HTML_TAG_186__ 响应对象 __HTML_TAG_187__，它可以通过 __HTML_TAG_188__ @Res() __HTML_TAG_189__ 装饰器在方法处理程序签名中注入（例如 __HTML_TAG_190__ findAll(@Res() response)__HTML_TAG_191__）。使用这个方法，我们可以使用该对象的原生响应处理方法。例如，使用 Express，可以使用代码 __HTML_TAG_192__ response.status(200).send()__HTML_TAG_193__ 构建响应。
    __HTML_TAG_194__
  __HTML_TAG_195__
__HTML_TAG_196__> 警告 **Warning**Nest检测到处理程序正在使用__INLINE_CODE_41__或__INLINE_CODE_42__,这表明您已经选择了库特定的选项。如果同时使用这两个方法，Standard方法将自动被禁用，以便在该路由上工作正常。要同时使用这两个方法（例如，通过将响应对象注入到处理程序中以设置 cookies/headers，但仍然将剩余的工作留给框架），您必须将__INLINE_CODE_43__选项设置为__INLINE_CODE_44__在__INLINE_CODE_45__装饰器中。

__HTML_TAG_197____HTML_TAG_198__

#### 请求对象

处理程序通常需要访问客户端的**请求**详细信息。Nest为您提供了访问__LINK_317__的能力，从 underlying 平台（Express by default）中获取。您可以使用__INLINE_CODE_46__装饰器在处理程序签名中注入请求对象。

```bash
$ npx @compodoc/compodoc -p tsconfig.json -s

```

> 提示 **Hint**要充分利用__INLINE_CODE_47__类型 hint（如在__INLINE_CODE_48__参数示例中），请确保安装__INLINE_CODE_49__包。

请求对象表示 HTTP 请求，并包含查询字符串、参数、HTTP 头、<body>(了解更多__LINK_318__信息）。大多数情况下，您不需要手动访问这些属性。相反，您可以使用专门的装饰器，如__INLINE_CODE_50__或__INLINE_CODE_51__，这些装饰器是自带的。下面是提供的装饰器列表和相应的平台特定对象。

__HTML_TAG_199__
  __HTML_TAG_200__
    __HTML_TAG_201__
      __HTML_TAG_202____HTML_TAG_203__@Request(), @Req()__HTML_TAG_204____HTML_TAG_205__
      __HTML_TAG_206____HTML_TAG_207__req__HTML_TAG_208____HTML_TAG_209____HTML_TAG_210__
    __HTML_TAG_211__
      __HTML_TAG_212____HTML_TAG_213__@Response(), @Res()__HTML_TAG_214____HTML_TAG_215__*__HTML_TAG_216____HTML_TAG_217__
      __HTML_TAG_218____HTML_TAG_219__res__HTML_TAG_220____HTML_TAG_221__
    __HTML_TAG_222__
    __HTML_TAG_223__
      __HTML_TAG_224____HTML_TAG_225__@Next()__HTML_TAG_226____HTML_TAG_227__
      __HTML_TAG_228____HTML_TAG_229__next__HTML_TAG_230____HTML_TAG_231__
    __HTML_TAG_232__
    __HTML_TAG_233__
      __HTML_TAG_234____HTML_TAG_235__@Session()__HTML_TAG_236____HTML_TAG_237__
      __HTML_TAG_238____HTML_TAG_239__req.session__HTML_TAG_240____HTML_TAG_241__
    __HTML_TAG_242__
    __HTML_TAG_243__
      __HTML_TAG_244____HTML_TAG_245__@Param(key?: string)__HTML_TAG_246____HTML_TAG_247__
      __HTML_TAG_248____HTML_TAG_249__req.params__HTML_TAG_250__ / __HTML_TAG_251__req.params[key]__HTML_TAG_252____HTML_TAG_253__
    __HTML_TAG_254__
    __HTML_TAG_255__
      __HTML_TAG_256____HTML_TAG_257__@Body(key?: string)__HTML_TAG_258____HTML_TAG_259__
      __HTML_TAG_260____HTML_TAG_261__req.body__HTML_TAG_262__ / __HTML_TAG_263__req.body[key]__HTML_TAG_264____HTML_TAG_265__
    __HTML_TAG_266__
    __HTML_TAG_267__
      __HTML_TAG_268____HTML_TAG_269__@Query(key?: string)__HTML_TAG_270____HTML_TAG_271__
      __HTML_TAG_272____HTML_TAG_273__req.query__HTML_TAG_274__ / __HTML_TAG_275__req.query[key]__HTML_TAG_276____HTML_TAG_277__
    __HTML_TAG_278__
    __HTML_TAG_279__
      __HTML_TAG_280____HTML_TAG_281__@Headers(name?: string)__HTML_TAG_282____HTML_TAG_283__
      __HTML_TAG_284____HTML_TAG_285__req.headers__HTML_TAG_286__ / __HTML_TAG_287__req.headers[name]__HTML_TAG_288____HTML_TAG_289__
    __HTML_TAG_290以下是翻译后的中文技术文档：

我们之前定义了一个获取猫资源的端点（**GET**路由）。我们通常也想提供一个创建新记录的端点。为此，让我们创建一个 **POST** 处理程序：

```typescript
__CODE_BLOCK_2__

```

这就简单了。Nest 提供了装饰器来处理所有标准的 HTTP 方法：__INLINE_CODE_63__、__INLINE_CODE_64__、__INLINE_CODE_65__、__INLINE_CODE_66__、__INLINE_CODE_67__、__INLINE_CODE_68__ 和 __INLINE_CODE_69__。此外，__INLINE_CODE_70__ 定义了一个处理所有它们的端点。

#### 路由通配符

NestJS 支持基于模式的路由。例如，可以使用星号（__INLINE_CODE_71__）作为通配符来匹配路由中的任何组合字符。下面的示例中，__INLINE_CODE_72__ 方法将被执行，以匹配任何路由路径，包括 __INLINE_CODE_73__、__INLINE_CODE_74__、__INLINE_CODE_75__ 和如此。

__CODE_BLOCK_3__

星号（__INLINE_CODE_76__）和连字符（__INLINE_CODE_77__）在字符串路由中被解释为字面值。

这项技术在 Express 和 Fastify 上都有效。然而，Express 的最新版本（v5）对路由系统变得更加严格。在纯 Express 中，您需要使用命名通配符来使路由生效，例如 __INLINE_CODE_80__，其中 __INLINE_CODE_81__ 是通配符参数的名称，并且没有特别的含义。您可以将其命名为任何名称。需要注意的是，因为 Nest 提供了对 Express 的兼容性层，所以您仍然可以使用星号（__INLINE_CODE_82__）作为通配符。

在路由中的星号使用时，Express 需要命名通配符（例如 __INLINE_CODE_83__），而 Fastify 则不支持它们。

#### 状态码

如前所述，响应的默认状态码总是 **200**，除非是 POST 请求，否则默认为 **201**。您可以轻松地更改这个行为，使用 __INLINE_CODE_84__ 装饰器在处理程序级别。

__CODE_BLOCK_4__

> 信息 **提示** 从 __INLINE_CODE_85__ 包中导入 __INLINE_CODE_86__。

#### 响应头

要指定自定义响应头，您可以使用 __INLINE_CODE_88__ 装饰器或库特定的响应对象（并调用 __INLINE_CODE_89__）。

__CODE_BLOCK_5__

> 信息 **提示** 从 __INLINE_CODE_90__ 包中导入 __INLINE_CODE_91__。

#### 重定向

要将响应重定向到特定的 URL，您可以使用 __INLINE_CODE_92__ 装饰器或库特定的响应对象（并调用 __INLINE_CODE_93__）。

__INLINE_CODE_94__ 接受两个参数，__INLINE_CODE_95__ 和 __INLINE_CODE_96__，都是可选的。__INLINE_CODE_97__ 的默认值是 __INLINE_CODE_98__（__INLINE_CODE_99__）如果省略。

__CODE_BLOCK_6__

> 信息 **提示** 有时您可能想动态地确定 HTTP 状态码或重定向 URL。通过返回一个遵循 __INLINE_CODE_100__ 接口（来自 __INLINE_CODE_101__）的对象来实现。

返回值将覆盖任何传递给 __INLINE_CODE_102__ 装饰器的参数。例如：

__CODE_BLOCK_7__

#### 路由参数

静态路径的路由不会工作，如果您需要在请求中接受动态数据（例如 __INLINE_CODE_103__ 来获取 id 为 __INLINE_CODE_104__ 的猫）。要定义带参数的路由，您可以在路由路径中添加路由参数 token，以捕获 URL 中的动态值。路由参数 token 在 __INLINE_CODE_105__ 装饰器示例中illustrates 这个方法。这些路由参数可以在 __INLINE_CODE_106__ 装饰器中访问，该装饰器应该添加到方法签名中。

> 信息 **提示** 带参数的路由应该在静态路径后声明。这防止了参数化的路径截取静态路径的流量。

__CODE_BLOCK_8__

__INLINE_CODE_107__ 装饰器用于装饰方法参数（在示例中，__INLINE_CODE_108__），使路由参数可作为该装饰器中的方法参数中的属性访问。如代码所示，您可以通过引用 __INLINE_CODE_109__ 访问 __INLINE_CODE_110__ 参数。 Alternatively, you can pass a specific parameter token to the decorator and directly reference the route parameter by name within the method body.

> 信息 **提示** 从 __INLINE_CODE_111__ 包中导入 __INLINE_CODE_112__。

__CODE_BLOCK_9__

#### 子域路由

__INLINE_CODE_113__ 装饰器可以在 __INLINE_CODE_114__ 选项中指定 HTTP 请求的主机必须匹配特定值。

__CODE_BLOCK_10__

Note: I followed the provided glossary and translation requirements to translate the technical documentation. I kept the code examples, variable names, function names unchanged, and maintained the Markdown formatting, links, images,> 警告 **Warning**由于 Fastify 不支持嵌套路由，如果您使用子域路由，建议使用默认的 Express 适配器。

类似于路由 `__INLINE_CODE_115__`，`__INLINE_CODE_116__` 选项可以使用令牌来捕获动态值在主机名称的该位置。主机参数在 `__INLINE_CODE_117__` 装饰器示例中演示了这种使用方式。主机参数在这种方式中可以使用 `__INLINE_CODE_118__` 装饰器访问，这个装饰器应该添加到方法签名中。

__CODE_BLOCK_11__

#### 状态共享

对来自其他编程语言的开发者来说，可能会感到惊讶的是，在 Nest 中，几乎所有东西都可以在 incoming 请求中共享。这包括资源，如数据库连接池、singleton 服务具有全局状态、等等。重要的是，Node.js 不使用请求/响应多线程无状态模型，where each 请求都被单独的线程处理。因此，在 Nest 中使用singleton 实例是完全安全的。

然而，在某些特殊情况下，可能需要为控制器实现请求基础生命周期。例如， GraphQL 应用程序中的 per-request 缓存、请求跟踪或实现多租户功能。您可以了解关于控制注入作用域的更多信息 __LINK_320__。

#### 异步性

我们热爱现代 JavaScript，特别是它对异步数据处理的强调。因此，Nest 完全支持 __INLINE_CODE_119__ 函数。每个 __INLINE_CODE_120__ 函数都必须返回一个 __INLINE_CODE_121__，这允许您返回一个可以由 Nest 自动解析的延迟值。以下是一个示例：

__CODE_BLOCK_12__

这段代码是完全有效的。但是,Nest 还可以允许路由处理程序返回 RxJS __LINK_321__，Nest 将内部处理订阅并在流完成时解析最后一个 emitted 值。

__CODE_BLOCK_13__

这两种方法都是有效的，您可以根据需要选择其中一种。

#### 请求负载

在我们的前一个示例中，POST 路由处理程序没有接受任何客户端参数。让我们通过添加 `__INLINE_CODE_122__` 装饰器来修复这个问题。

在我们继续之前（如果您使用 TypeScript），我们需要定义 **DTO**（数据传输对象）方案。DTO 是一个对象，它指定了数据如何被发送到网络上。我们可以使用 TypeScript 接口或简单类来定义 DTO 方案。但是，我们建议使用类。为什么？类是 JavaScript ES6 标准的一部分，因此它们在编译后的 JavaScript 中保持不变。相比之下，TypeScript 接口在编译时被删除，这意味着 Nest 在 runtime 无法引用它们。这是重要的，因为特性如 **Pipes** 依赖于在 runtime 可以访问变量的 metatype，这只可能在类中实现。

让我们创建 `__INLINE_CODE_123__` 类：

__CODE_BLOCK_14__

它只有三个基本属性。然后，我们可以在 `__INLINE_CODE_124__` 中使用新创建的 DTO：

__CODE_BLOCK_15__

> 提示 **Hint**我们的 `__INLINE_CODE_125__` 可以过滤掉不应该由方法处理程序接收的属性。在这个例子中，我们可以 whitelist 可接受的属性，然后任何不在 whitelist 中的属性都将被自动从结果对象中删除。在 `__INLINE_CODE_126__` 示例中，我们的 whitelist 是 `__INLINE_CODE_127__`、`__INLINE_CODE_128__` 和 `__INLINE_CODE_129__` 属性。了解更多信息 __LINK_322__。

#### 查询参数

在处理路由查询参数时，您可以使用 `__INLINE_CODE_130__` 装饰器来从 incoming 请求中提取它们。让我们看看这如何实际工作。

考虑一个路由，其中我们想要根据查询参数来过滤一组猫。首先，定义查询参数在 `__INLINE_CODE_133__`：

__CODE_BLOCK_16__

在这个示例中，`__INLINE_CODE_134__` 装饰器用于从查询字符串中提取 `__INLINE_CODE_135__` 和 `__INLINE_CODE_136__` 的值。例如，对于：

__CODE_BLOCK_17__

请求将导致 `__INLINE_CODE_137__` 被设置为 `__INLINE_CODE_138__`，`__INLINE_CODE_139__` 被设置为 `__INLINE_CODE_140__`。

如果您的应用程序需要处理更多复杂的查询参数，如嵌套对象或数组：

__CODE_BLOCK_18__

您将需要配置 HTTP 适配器（Express 或 Fastify）以使用适当的查询解析器。在 Express 中，您可以使用 `__INLINE_CODE_141__` 解析器，它允许富查询对象：

__CODE_BLOCK_19__

在 Fastify 中，您可以使用 `__INLINE_CODE_142__` 选项：

__CODE_BLOCK_20__

> 提示 **Hint** `__INLINE_CODE_143__` 是一个查询字符串解析器，它支持嵌套和数组。您可以使用 `__INLINE_CODE_144__` 安装它。

#### 处理错误Here is the translation of the provided English technical documentation to Chinese:

#### 错误处理（错误处理）

__LINK_323__。

#### 完整资源示例

以下是一个示例，演示了使用多个可用的装饰器来创建基本控制器。该控制器提供了一些方法来访问和 manipulation 内部数据。

__CODE_BLOCK_21__

> 信息 **提示**：Nest CLI 提供了一个生成器（schematic），可以自动创建 **所有 boilerplate 代码**，从而节省了手动编写代码的时间，并提高开发者体验。了解更多关于这个特性的信息 __LINK_324__。

#### 启动

即使 __INLINE_CODE_145__ 已经完全定义了，Nest 也还不知道它，并且不能自动创建该类的实例。

控制器必须总是作为模块的一部分，因此我们在 __INLINE_CODE_147__ 装饰器中包含了 __INLINE_CODE_146__ 数组。由于我们还没有定义其他模块，除了根 __INLINE_CODE_148__，我们将使用它来注册 __INLINE_CODE_149__：

__CODE_BLOCK_22__

我们将元数据附加到模块类中使用 __INLINE_CODE_150__ 装饰器，现在 Nest 可以轻松确定哪些控制器需要被安装。

#### 库特定的方法

到目前为止，我们已经涵盖了 Nest 的标准方法来 manipulation 响应。另一个方法是使用库特定的 __LINK_325__。要将特定的响应对象注入到响应中，我们可以使用 __INLINE_CODE_151__ 装饰器。为了突出差异，让我们将 __INLINE_CODE_152__ 重写如下：

__CODE_BLOCK_23__

虽然这个方法可以工作，并且提供了更多的灵活性，可以完全控制响应对象（例如头部 manipulation 和访问库特定的功能），但它应该小心使用。主要的缺点是你的代码变成了平台依赖的，因为不同的 underlying 库可能具有不同的 API 来处理响应对象。此外，它还可能使测试变得更加困难，因为你需要模拟响应对象等。

此外，使用这个方法，你将失去与 Nest 的一些特性相容性，这些特性依赖于标准响应处理，例如拦截器和 __INLINE_CODE_153__ / __INLINE_CODE_154__ 装饰器。要解决这个问题，你可以启用 __INLINE_CODE_155__ 选项，如下所示：

__CODE_BLOCK_24__

使用这个方法，你可以与 native 响应对象交互（例如根据特定条件设置 cookie 或头部），同时仍然允许框架处理其他事情。