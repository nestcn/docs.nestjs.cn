<!-- 此文件从 content/controllers.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:26:27.588Z -->
<!-- 源文件: content/controllers.md -->

### 控制器

控制器负责处理 incoming **请求** 和发送 **响应** 回到客户端。

__HTML_TAG_156____HTML_TAG_157____HTML_TAG_158__

控制器的目的是处理应用程序特定的请求。路由机制确定哪个控制器将处理每个请求。通常，控制器有多个路由，每个路由可以执行不同的操作。

要创建基本控制器，我们使用类和 **装饰器**。装饰器将类与必要的元数据关联，使得 Nest 可以创建一个路由映射，该映射将请求连接到相应的控制器。

> info **提示** 快速创建一个 CRUD 控制器并使用内置 __LINK_315__，可以使用 CLI 的 __LINK_316__: __INLINE_CODE_25__。

#### 路由

以下示例中，我们将使用 __INLINE_CODE_26__ 装饰器，这是 **必需的** 定义基本控制器。我们将指定可选的路由路径前缀 __INLINE_CODE_27__。使用路径前缀在 __INLINE_CODE_28__ 装饰器中可以帮助我们将相关路由组合在一起，并减少重复的代码。例如，如果我们想将管理与猫实体相关的交互路由组合到 __INLINE_CODE_29__ 路径下，可以在 __INLINE_CODE_31__ 装饰器中指定 __INLINE_CODE_30__ 路径前缀。这 way，我们不需要在每个路由文件中重复该部分的路径。

```typescript
@Module({
  imports: [
    DashboardModule,
    RouterModule.register([
      {
        path: 'dashboard',
        module: DashboardModule,
      },
    ]),
  ],
})
export class AppModule {}

```

> info **提示** 使用 CLI 创建控制器， simply execute the __INLINE_CODE_32__ 命令。

__INLINE_CODE_33__ HTTP 请求方法装饰器在 __INLINE_CODE_34__ 方法之前告诉 Nest 创建一个处理 HTTP 请求的处理程序，这个处理程序是根据 HTTP 请求方法（GET 在本例中）和路由路径定义的。那么，这个路由路径是什么？路由路径由控制器的可选前缀（在本例中为 __INLINE_CODE_35__）和方法装饰器指定的路径组成。由于我们为每个路由设置了前缀，并且没有在方法装饰器中指定特定的路径，Nest 将将 __INLINE_CODE_36__ 请求路由到这个处理程序。

如前所述，路由路径包括控制器的可选路径前缀 **and** 方法装饰器指定的路径字符串。例如，如果控制器前缀为 __INLINE_CODE_37__，方法装饰器为 __INLINE_CODE_38__，那么生成的路由将是 __INLINE_CODE_39__。

在我们的示例中，当收到 GET 请求时，Nest 将路由请求到 user 定义的 __INLINE_CODE_40__ 方法。注意，我们在这里选择的方法名是任意的。虽然我们必须声明一个方法来绑定路由，但 Nest 没有对方法名 Attached 任何特殊的含义。

这个方法将返回 200 状态码along with the associated response，这个响应在本例中是一个字符串。为什么会这样？要解释，我们需要首先介绍 Nest 使用两个 **不同的** 选项来处理响应：

__HTML_TAG_159__
  __HTML_TAG_160__
    __HTML_TAG_161__Standard (recommended)__HTML_TAG_162__
    __HTML_TAG_163__
      使用这个内置方法，当请求处理程序返回 JavaScript 对象或数组时，它将 __HTML_TAG_164__自动__HTML_TAG_165__
      序列化为 JSON。返回 JavaScript 基本类型（例如 __HTML_TAG_166__字符串__HTML_TAG_167__, __HTML_TAG_168__数字__HTML_TAG_169__, __HTML_TAG_170__布尔值__HTML_TAG_171__）时，Nest 将发送只是值，而不尝试序列化。这使得响应处理变得简单：只返回值，Nest 就会处理剩余的部分。
      __HTML_TAG_172__
      __HTML_TAG_173__ 另外，响应的 __HTML_TAG_174__状态码__HTML_TAG_175__始终是 200，除了 POST 请求使用 201。我们可以轻松地更改这个行为 bằng 添加 __HTML_TAG_176__@HttpCode(...)__HTML_TAG_177__
      装饰器在处理程序级别（见 __HTML_TAG_178__Status codes__HTML_TAG_179__）。
    __HTML_TAG_180__
  __HTML_TAG_181__
  __HTML_TAG_182__
    __HTML_TAG_183__Library-specific__HTML_TAG_184__
    __HTML_TAG_185__
      我们可以使用库特定的（例如 Express） __HTML_TAG_186__response 对象__HTML_TAG_187__,这个对象可以通过 __HTML_TAG_188__@Res()__HTML_TAG_189__ 装饰器在方法处理程序签名中注入（例如 __HTML_TAG_190__findAll(@Res() response)__HTML_TAG_191__）。使用这个方法，我们可以使用该对象暴露的原生响应处理方法。例如，使用 Express，可以使用代码 like __HTML_TAG_192__response.status(200).send()__HTML_TAG_193__。
    __HTML_TAG_194__
  __HTML_TAG_195__
__HTML_TAG_196__> 警告 **Warning** Nest 检测到了处理器使用了 __INLINE_CODE_41__ 或 __INLINE_CODE_42__,这表明您已经选择了库特定的选项。如果同时使用这两个方法，Standard 方法将自动被禁用，对该路由将不再工作正常。要同时使用这两个方法（例如，通过注入响应对象来设置 cookie/headers 但仍然留下框架的其他部分），您需要在 __INLINE_CODE_43__ 装饰器中将 __INLINE_CODE_44__ 选项设置为 __INLINE_CODE_45__。

__HTML_TAG_197____HTML_TAG_198__

#### 请求对象

处理器通常需要访问客户端的 **请求** 详细信息。Nest 提供了对 underlying 平台（Express 默认）的 __LINK_317__ 的访问权限。您可以通过在处理器签名中使用 __INLINE_CODE_46__ 装饰器来访问请求对象。

```typescript
@Module({
  imports: [
    AdminModule,
    DashboardModule,
    MetricsModule,
    RouterModule.register([
      {
        path: 'admin',
        module: AdminModule,
        children: [
          {
            path: 'dashboard',
            module: DashboardModule,
          },
          {
            path: 'metrics',
            module: MetricsModule,
          },
        ],
      },
    ])
  ],
});

```

> 提示 **Hint** 要充分利用 __INLINE_CODE_47__ 类型（如在 __INLINE_CODE_48__ 参数示例中），请确保安装 __INLINE_CODE_49__ 包。

请求对象表示 HTTP 请求，并包含查询字符串、参数、HTTP 头、体（了解更多 __LINK_318__）。在大多数情况下，您不需要手动访问这些属性。相反，您可以使用内置的装饰器，如 __INLINE_CODE_50__ 或 __INLINE_CODE_51__。下面是一个提供的装饰器列表和它们所代表的平台特定对象。

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
    __HTML_TAG_290__
    __HTML_TAG_291__
      __HTML_TAG以下是翻译后的中文技术文档：

我们之前已经定义了一个获取猫资源的端点（**GET** 路由）。现在，我们也想提供一个创建新记录的端点。为此，让我们创建一个 **POST** 处理程序：

__CODE_BLOCK_2__

这真的很简单。Nest 提供了对标准 HTTP 方法的装饰器：__INLINE_CODE_63__、__INLINE_CODE_64__、__INLINE_CODE_65__、__INLINE_CODE_66__、__INLINE_CODE_67__、__INLINE_CODE_68__、__INLINE_CODE_69__。此外，__INLINE_CODE_70__ 定义了一个处理所有这些方法的端点。

#### 路由通配符

NestJS 中支持基于模式的路由。例如，我们可以使用星号 (__INLINE_CODE_71__) 作为通配符来匹配路由中的任何组合字符。在以下示例中，__INLINE_CODE_72__ 方法将被执行，以便处理任何以 __INLINE_CODE_73__ 开头的路由，无论后续字符的数量。

__CODE_BLOCK_3__

__INLINE_CODE_74__ 路由路径将匹配 __INLINE_CODE_75__、__INLINE_CODE_76__、__INLINE_CODE_77__ 等。连字符 (__INLINE_CODE_78__) 和点 (__INLINE_CODE_79__) 将被字符串路径中的字面值解释。

这种方法在 Express 和 Fastify 中都有效。但是，最新的 Express 版本（v5）中路由系统变得更加严格。在纯 Express 中，您必须使用命名通配符来使路由工作—for example，__INLINE_CODE_80__，其中 __INLINE_CODE_81__ 是通配符参数的名称，并没有特殊含义。您可以将其命名为任何名称。说句题外，因为 Nest 提供了对 Express 的兼容层，您仍然可以使用星号 (__INLINE_CODE_82__) 作为通配符。

当涉及到星号在路由中的中间使用时，Express 需要命名通配符（例如 __INLINE_CODE_83__），而 Fastify 则不支持。

#### 状态码

如前所述，响应的默认状态码总是 **200**，除非是 POST 请求，否则默认为 **201**。您可以轻松地更改这个行为使用 __INLINE_CODE_84__ 装饰器。

__CODE_BLOCK_4__

> 信息 **提示** 从 __INLINE_CODE_85__ 包中导入 __INLINE_CODE_86__。

有时，您的状态码不是静态的，而是依赖于各种因素。在这种情况下，您可以使用库特定的响应对象（或在错误时抛出异常）。

#### 响应头

要指定自定义响应头，您可以使用 __INLINE_CODE_88__ 装饰器或库特定的响应对象（并调用 __INLINE_CODE_89__）。

__CODE_BLOCK_5__

> 信息 **提示** 从 __INLINE_CODE_90__ 包中导入 __INLINE_CODE_91__。

#### 重定向

要将响应重定向到特定的 URL，您可以使用 __INLINE_CODE_92__ 装饰器或库特定的响应对象（并调用 __INLINE_CODE_93__）。

__INLINE_CODE_94__ 接受两个参数，__INLINE_CODE_95__ 和 __INLINE_CODE_96__，都是可选的。__INLINE_CODE_97__ 的默认值是 __INLINE_CODE_98__ (__INLINE_CODE_99__) 如果未指定。

__CODE_BLOCK_6__

> 信息 **提示** 有时，您可能想动态地确定 HTTP 状态码或重定向 URL。通过返回遵循 __INLINE_CODE_100__ 接口（从 __INLINE_CODE_101__）的对象来实现。

返回的值将覆盖任何传递给 __INLINE_CODE_102__ 装饰器的参数。例如：

__CODE_BLOCK_7__

#### 路由参数

静态路径的路由不会工作，以便处理动态数据作为请求的一部分（例如，__INLINE_CODE_103__ 来获取 id __INLINE_CODE_104__ 的猫）。要定义带参数的路由，可以在路由路径中添加路由参数令牌，以捕捉 URL 中的动态值。路由参数令牌在 __INLINE_CODE_105__ 装饰器示例中illustrates this approach。这些路由参数可以通过 __INLINE_CODE_106__ 装饰器访问，这个装饰器应该添加到方法签名中。

> 信息 **提示** 带参数的路由应该在任何静态路径后声明。这防止了参数化路径拦截目标路径的流量。

__CODE_BLOCK_8__

__INLINE_CODE_107__ 装饰器用于装饰方法参数（在上面的示例中，__INLINE_CODE_108__），使路由参数可访问为该装饰器的方法参数内的属性。如代码所示，您可以通过引用 __INLINE_CODE_109__ 参数来访问 __INLINE_CODE_110__ 参数。 Alternatively, you can pass a specific parameter token to the decorator and directly reference the route parameter by name within the method body.

> 信息 **提示** 从 __INLINE_CODE_111__ 包中导入 __INLINE_CODE_112__。

__CODE_BLOCK_9__

#### 子域路由

__INLINE_CODE_113__ 装饰器可以带一个 __INLINE_CODE_114__ 选项，以要求 incoming 请求的 HTTP 主> warning **Warning**由于 Fastify 不支持嵌套路由，所以如果您正在使用子域路由，建议使用默认的 Express 适配器。

与路由 __INLINE_CODE_115__ 类似，__INLINE_CODE_116__ 选项可以使用令牌来捕捉动态值在主机名中的位置。主机参数令牌在以下 __INLINE_CODE_117__ 装饰器示例中演示了这种使用。使用这种方式声明的主机参数可以使用 __INLINE_CODE_118__ 装饰器来访问，该装饰器应添加到方法签名中。

__CODE_BLOCK_11__

#### 状态共享

对于来自其他编程语言的开发者来说，可能会感到 surprise，学习 Nest 中几乎所有内容都是跨越incoming 请求共享的资源。这包括资源池、全局状态的单例服务、数据库连接池等。重要的是，Node.js 不使用请求/响应多线程无状态模型，每个请求都由单独的线程处理。因此，在 Nest 中使用单例实例完全安全。

然而，有一些特定的边缘情况需要在控制器中使用请求基础生命周期。例如，GraphQL 应用程序中的 per-request 缓存、请求跟踪或实现多租户。你可以学习更多关于控制注入作用域的信息 __LINK_320__。

#### 异步性

我们非常喜欢现代 JavaScript especially its emphasis on **asynchronous** 数据处理。这就是 Nest 完全支持 __INLINE_CODE_119__ 函数的原因。每个 __INLINE_CODE_120__ 函数都必须返回 __INLINE_CODE_121__，这允许您返回 Nest 可以自动解决的延迟值。以下是一个示例：

__CODE_BLOCK_12__

这个代码是完全有效的。但是，Nest 还允许路由处理器返回 RxJS __LINK_321__。Nest 将负责内部订阅并解决最后一个 emit 的值一次流完成。

__CODE_BLOCK_13__

这两种方法都有效，您可以根据需要选择一种。

#### 请求负载

在我们的前一个示例中，POST 路由处理器没有接受任何客户端参数。让我们修复这个问题，添加 __INLINE_CODE_122__ 装饰器。

在继续之前（如果您使用 TypeScript），我们需要定义 **DTO**（数据传输对象）架构。DTO 是一个对象，它指定了数据应该如何在网络上发送。我们可以使用 TypeScript 接口或简单类来定义 DTO 架构。然而，我们建议使用类。为什么？类是 JavaScript ES6 标准的一部分，所以它们在编译后的 JavaScript 中保持不变。相比之下，TypeScript 接口在转换期间被删除，这意味着 Nest 在运行时无法引用它们。这是重要的，因为特性，如 __Pipes__ 依赖于在运行时对变量的类型信息，这只可能在使用类时实现。

让我们创建 __INLINE_CODE_123__ 类：

__CODE_BLOCK_14__

它只有三个基本属性。然后，我们可以使用新创建的 DTO 在 __INLINE_CODE_124__ 中：

__CODE_BLOCK_15__

> info **Hint**我们的 __INLINE_CODE_125__ 可以过滤掉不应该由方法处理器接收的属性。在这个例子中，我们可以白名单可接受的属性，并且任何不包含在白名单中的属性将自动从结果对象中删除。在 __INLINE_CODE_126__ 示例中，我们的白名单是 __INLINE_CODE_127__、__INLINE_CODE_128__ 和 __INLINE_CODE_129__ 属性。了解更多 __LINK_322__。

#### 查询参数

在处理路由查询参数时，您可以使用 __INLINE_CODE_130__ 装饰器来从 incoming 请求中提取它们。让我们看到这个示例。

考虑一个 route，其中我们想要根据查询参数来过滤一组猫。首先，定义查询参数在 __INLINE_CODE_133__ 中：

__CODE_BLOCK_16__

在这个示例中，__INLINE_CODE_134__ 装饰器用于从查询字符串中提取 __INLINE_CODE_135__ 和 __INLINE_CODE_136__ 的值。例如，对于：

__CODE_BLOCK_17__

将结果为 __INLINE_CODE_137__ 是 __INLINE_CODE_138__ 和 __INLINE_CODE_139__ 是 __INLINE_CODE_140__。

如果您的应用程序需要处理更复杂的查询参数，例如嵌套对象或数组：

__CODE_BLOCK_18__

您需要配置 HTTP 适配器（Express 或 Fastify）以使用适当的查询解析器。在 Express 中，您可以使用 __INLINE_CODE_141__ 解析器，它支持丰富的查询对象：

__CODE_BLOCK_19__

在 Fastify 中，您可以使用 __INLINE_CODE_142__ 选项：

__CODE_BLOCK_20__

> info **Hint** __INLINE_CODE_143__ 是一个 querystring 解析器，它支持嵌套和数组。您可以使用 __INLINE_CODE_144__ 安装它。

#### 处理错误Here is the translation of the given English technical documentation to Chinese:

#### 错误处理（Working with Exceptions）

__LINK_323__。

#### 全资源示例

下面是一个示例，演示了使用多个可用装饰器来创建基本控制器。这控制器提供了一些方法来访问和操作内部数据。

__CODE_BLOCK_21__

> info **提示**Nest CLI 提供了一个生成器（schematic），可以自动创建 **所有 boilerplate 代码**，从而省去手动编写代码的工作，提高开发者体验。了解更多关于这个特性的信息 __LINK_324__。

#### 启动

即使 __INLINE_CODE_145__ 已经完全定义，但 Nest still doesn't know about it and won't automatically create an instance of the class。

控制器总是需要作为模块的一部分，因此我们在 __INLINE_CODE_147__ 装饰器中包括 __INLINE_CODE_146__ 数组。由于我们还没有定义其他模块except for the root __INLINE_CODE_148__，因此我们将使用它来注册 __INLINE_CODE_149__：

__CODE_BLOCK_22__

我们将元数据附加到模块类中使用 __INLINE_CODE_150__ 装饰器，现在 Nest 可以轻松地确定需要挂载的控制器。

#### 图书馆特定的方法

到目前为止，我们已经涵盖了 Nest 的标准方式来 manipulation 响应。另一种方法是使用图书馆特定的 __LINK_325__。要注入特定的 response 对象，我们可以使用 __INLINE_CODE_151__ 装饰器。为了突出差异，让我们重新编写 __INLINE_CODE_152__：

__CODE_BLOCK_23__

虽然这个方法有效，并且提供了更多的灵活性，可以完全控制响应对象（例如，头部 manipulation 和访问图书馆特定的功能），但应该使用谨慎。主要的缺点是代码变得平台依赖，因为不同的 underlying 图书馆可能具有不同的 API 对象。另外，这也可能使测试变得困难，因为需要模拟响应对象等。

此外，使用这个方法，你将失去与 Nest 特性相关的兼容性，例如拦截器和 __INLINE_CODE_153__ / __INLINE_CODE_154__ 装饰器。要解决这个问题，你可以启用 __INLINE_CODE_155__ 选项，如下所示：

__CODE_BLOCK_24__

使用这个方法，你可以与 native 响应对象交互（例如，根据特定条件设置 cookie 或头部），同时仍然允许框架处理其余部分。