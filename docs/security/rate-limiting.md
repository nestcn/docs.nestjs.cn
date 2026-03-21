<!-- 此文件从 content/security/rate-limiting.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:24:52.887Z -->
<!-- 源文件: content/security/rate-limiting.md -->

### 速率限制

防止应用程序受到暴力攻击的一种常见技术是 **速率限制**。要开始使用，需要安装 `@ApiOperation()` 包。

__CODE_BLOCK_0__

安装完成后，可以使用 `@ApiParam()` 配置它，就像其他 Nest 包一样，使用 `@ApiProduces()` 或 `@ApiSchema()` 方法。

__CODE_BLOCK_1__

上述代码将设置全局选项，包括 `@ApiProperty()`（时间到期毫秒）、`@ApiPropertyOptional()`（在ttl内的最大请求数量）和 `@ApiQuery()`（路由守卫）等。

一旦模块被导入，你可以选择如何绑定 `@ApiQuery()`。任何在 __LINK_226__ 部分提到的绑定方法都可以使用。如果你想将守卫绑定到全局，可以将提供者添加到模块中：

__CODE_BLOCK_2__

#### 多个速率限制定义

可能会出现需要设置多个速率限制定义的情况，例如每秒不超过3个请求，10秒内不超过20个请求，1分钟内不超过100个请求。可以在数组中设置名为的选项，然后在 `@ApiResponse()` 和 `@ApiSecurity()` 装饰器中引用这些选项。

__CODE_BLOCK_3__

#### 自定义

可能会出现需要将守卫绑定到控制器或全局，但是需要对某些端点禁用速率限制的情况。可以使用 `@ApiTags()` 装饰器来否决某个类或单个路由的速率限制。`@ApiCallbacks()` 装饰器可以传入一个对象，其中包含字符串键和布尔值，以便在某些情况下对某个控制器的某些路由进行配置。 如果不传入对象，默认情况下将使用 __INLINE_CODE_24__。

__CODE_BLOCK_4__

__INLINE_CODE_25__ 装饰器可以用来跳过某个路由或类，或者否决某个类的跳过。 __CODE_BLOCK_5__

还可以使用 __INLINE_CODE_26__ 装饰器来覆盖 __INLINE_CODE_27__ 和 __INLINE_CODE_28__ 设置，提供更严格或更松的安全选项。这个装饰器可以在类或函数上使用。从版本5开始，这个装饰器可以传入一个对象，其中包含字符串键和对象值，用于指定要覆盖的速率限制设置。如果不传入对象，可以使用字符串 __INLINE_CODE_29__。需要像这样配置：

__CODE_BLOCK_6__

#### 代理

如果您的应用程序在代理服务器后运行，需要配置HTTP适配器以信任代理。可以查看 __LINK_227__ 和 __LINK_228__ 中的特定HTTP适配器选项，以启用 __INLINE_CODE_30__ 设置。

以下是一个演示如何启用 __INLINE_CODE_31__ 的Express适配器的示例：

__CODE_BLOCK_7__

启用 __INLINE_CODE_32__ 可以将原始IP地址从 __INLINE_CODE_33__ 头部中检索。还可以根据需要自定义应用程序的行为，例如覆盖 __INLINE_CODE_34__ 方法，以从这个头部中提取IP地址，而不是使用 __INLINE_CODE_35__。以下是一个演示如何实现这两个适配器的示例：

__CODE_BLOCK_8__

> info **提示** 可以在 __LINK_229__ 中找到 __INLINE_CODE_36__ 请求对象的API，用于Express和Fastify。

#### WebSocket

这个模块可以与WebSockets一起使用，但需要类扩展。可以扩展 __INLINE_CODE_37__ 并覆盖 __INLINE_CODE_38__ 方法，如下所示：

__CODE_BLOCK_9__

> info **提示** 如果您使用ws，可以将 __INLINE_CODE_39__ 替换为 __INLINE_CODE_40__。

在使用WebSockets时需要注意以下几点：

-uard不能注册到 __INLINE_CODE_41__ 或 __INLINE_CODE_42__
-当达到限制时，Nest将 emit __INLINE_CODE_43__ 事件，因此请确保有一个监听器准备好

> info **提示** 如果您使用 __INLINE_CODE_44__ 包，可以使用 __INLINE_CODE_45__。

#### GraphQL

__INLINE_CODE_46__ 也可以用于与GraphQL请求一起使用。类似地，守卫可以被扩展，但这次将 __INLINE_CODE_47__ 方法覆盖。

__CODE_BLOCK_10__

#### 配置

以下是 __INLINE_CODE_48__ 选项对象中的有效选项：

(please note that some code blocks are missing, and I'll need the original text to complete the translation)Here is the translation of the provided English technical documentation to Chinese:

**__HTML_TAG_78__**
**__HTML_TAG_79__**
  **__HTML_TAG_80__** __HTML_TAG_81__ **name** __HTML_TAG_82__ **__HTML_TAG_83__**
  **__HTML_TAG_84__**是用于内部跟踪哪个限流器集在使用的名称。默认情况下，如果未传递__HTML_TAG_85__ **default** __HTML_TAG_86__，将使用__HTML_TAG_87__。
**__HTML_TAG_88__**
**__HTML_TAG_89__**
  **__HTML_TAG_90__** __HTML_TAG_91__ **ttl** __HTML_TAG_92__ **__HTML_TAG_93__**
  **__HTML_TAG_94__**表示每个请求将在存储中保留的毫秒数__HTML_TAG_95__。
**__HTML_TAG_96__**
**__HTML_TAG_97__**
  **__HTML_TAG_98__** __HTML_TAG_99__ **limit** __HTML_TAG_100__ **__HTML_TAG_101__**
  **__HTML_TAG_102__**表示在 TTL 限制内的最大请求数量__HTML_TAG_103__。
**__HTML_TAG_104__**
**__HTML_TAG_105__**
  **__HTML_TAG_106__** __HTML_TAG_107__ **blockDuration** __HTML_TAG_108__ **__HTML_TAG_109__**
  **__HTML_TAG_110__**表示请求将被阻塞的毫秒数__HTML_TAG_111__。
**__HTML_TAG_112__**
**__HTML_TAG_113__**
  **__HTML_TAG_114__** __HTML_TAG_115__ **ignoreUserAgents** __HTML_TAG_116__ **__HTML_TAG_117__**
  **__HTML_TAG_118__**是忽略请求时的用户代理数组__HTML_TAG_119__。
**__HTML_TAG_120__**
**__HTML_TAG_121__**
  **__HTML_TAG_122__** __HTML_TAG_123__ **skipIf** __HTML_TAG_124__ **__HTML_TAG_125__**
  **__HTML_TAG_126__**是一个函数，它将在__HTML_TAG_127__ **ExecutionContext** __HTML_TAG_128__中返回一个__HTML_TAG_129__ **boolean** __HTML_TAG_130__以短路限流逻辑。类似于__HTML_TAG_131__ **@SkipThrottler()** __HTML_TAG_132__，但基于请求__HTML_TAG_133__。
**__HTML_TAG_134__**
**__HTML_TAG_135__**

如果您需要设置存储或在更高级别使用上述选项，以便对每个限流器集应用，请通过__INLINE_CODE_49__选项键传递上述选项，并使用以下表

**__HTML_TAG_136__**
  **__HTML_TAG_137__**
    **__HTML_TAG_138__** __HTML_TAG_139__ **storage** __HTML_TAG_140__ **__HTML_TAG_141__**
    **__HTML_TAG_142__**是一个自定义存储服务，用于跟踪限流。__HTML_TAG_143__请查看这里__HTML_TAG_144__ **__HTML_TAG_145__**
  **__HTML_TAG_146__**
  **__HTML_TAG_147__**
    **__HTML_TAG_148__** __HTML_TAG_149__ **ignoreUserAgents** __HTML_TAG_150__ **__HTML_TAG_151__**
    **__HTML_TAG_152__**是忽略请求时的用户代理数组__HTML_TAG_153__。
  **__HTML_TAG_154__**
  **__HTML_TAG_155__**
    **__HTML_TAG_156__** __HTML_TAG_157__ **skipIf** __HTML_TAG_158__ **__HTML_TAG_159__**
    **__HTML_TAG_160__**是一个函数，它将在__HTML_TAG_161__ **ExecutionContext** __HTML_TAG_162__中返回一个__HTML_TAG_163__ **boolean** __HTML_TAG_164__以短路限流逻辑。类似于__HTML_TAG_165__ **@SkipThrottler()** __HTML_TAG_166__，但基于请求__HTML_TAG内存缓存是 NestJS 提供的内置存储解决方案，用于跟踪请求直到它们超时的 TTL 设置由全局选项确定。你可以将自己的存储解决方案添加到 __INLINE_CODE_55__ 选项中，前提是该类实现了 __INLINE_CODE_57__ 接口。

对于分布式服务器，您可以使用社区提供的 __LINK_231__ 来拥有单个真实来源。

> info **注意** __INLINE_CODE_58__ 可以从 __INLINE_CODE_59__ 导入。

#### 时间帮助工具

如果您愿意，您可以使用帮助方法来使时间更易读。 __INLINE_CODE_60__ exports five different helpers： __INLINE_CODE_61__、__INLINE_CODE_62__、__INLINE_CODE_63__、__INLINE_CODE_64__ 和 __INLINE_CODE_65__。要使用它们，只需调用 __INLINE_CODE_66__ 或其他帮助方法，它将返回正确的毫秒数。

#### 迁移指南

对于大多数人，包围选项在一个数组中将足够。

如果您使用的是自定义存储解决方案，应该将 __INLINE_CODE_67__ 和 __INLINE_CODE_68__ 包围在一个数组中，并将其分配给 options 对象的 __INLINE_CODE_69__ 属性。

任何 __INLINE_CODE_70__ 装饰器都可以用来绕过特定路由或方法的限制。它接受一个可选的布尔参数， 默认为 __INLINE_CODE_71__。这在某些特定的端点上跳过速率限制时非常有用。

任何 __INLINE_CODE_72__ 装饰器现在都应该接受一个对象，其中字符串键对应于 throttler 上下文的名称（如果没有名称，则为 __INLINE_CODE_73__），值为对象，其中有 __INLINE_CODE_74__ 和 __INLINE_CODE_75__ 键。

> Warning **Important** __INLINE_CODE_76__ 现在以毫秒为单位。如果您想将 TTL 保持为秒，以提高可读性，请使用这个包中的 __INLINE_CODE_77__ 助手，它只是将 TTL 乘以 1000，以将其转换为毫秒。

更多信息，请查看 __LINK_232__。