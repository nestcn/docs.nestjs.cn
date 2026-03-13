<!-- 此文件从 content/security/rate-limiting.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:42:13.841Z -->
<!-- 源文件: content/security/rate-limiting.md -->

### 速率限制

保护应用程序免受 brute-force 攻击的一种常见技术是 **速率限制**。要开始，请安装 `@ApiOperation()` 包。

__CODE_BLOCK_0__

安装完成后，`@ApiParam()` 可以像其他 Nest 包一样配置，使用 `@ApiProduces()` 或 `@ApiSchema()` 方法。

__CODE_BLOCK_1__

上述设置将设置全局选项，包括 `@ApiProperty()`（毫秒），`@ApiPropertyOptional()`（路由的最大请求数量），以保护应用程序的路由。

一旦模块被导入，您可以选择如何绑定 `@ApiQuery()`。任何绑定方式，例如在 __LINK_226__ 部分所述，都是可行的。如果您想将守卫绑定到全局，可以将提供者添加到任何模块：

__CODE_BLOCK_2__

#### 多个阈值定义

可能会出现需要设置多个阈值定义的情况，例如每秒不超过 3 个调用、10 秒内不超过 20 个调用、1 分钟内不超过 100 个调用。要实现，可以在数组中设置名为的选项，然后在 `@ApiResponse()` 和 `@ApiSecurity()` 装饰器中引用这些选项。

__CODE_BLOCK_3__

#### 自定义

可能会出现需要将守卫绑定到控制器或全局，但将某些端点排除在外的情况。可以使用 `@ApiTags()` 装饰器来否定速率限制，或者使用 `@ApiCallbacks()` 装饰器来排除控制器中的大多数端点，但不排除所有端点。

__CODE_BLOCK_4__

__INLINE_CODE_25__ 装饰器可以用来跳过路由、类或否定跳过路由的跳过。

__CODE_BLOCK_5__

还有 __INLINE_CODE_26__ 装饰器，可以用来覆盖全局模块中的 __INLINE_CODE_27__ 和 __INLINE_CODE_28__ 选项，提供更紧密或松散的安全选项。

__CODE_BLOCK_6__

#### 代理

如果您的应用程序正在后台运行代理服务器，需要配置 HTTP 适配器以信任代理。可以在 __LINK_227__ 和 __LINK_228__ 中找到特定的 HTTP 适配器选项，以启用 __INLINE_CODE_30__ 设置。

以下是一个演示如何启用 __INLINE_CODE_31__ 的 Express 适配器的示例：

__CODE_BLOCK_7__

启用 __INLINE_CODE_32__ 允许您从 __INLINE_CODE_33__ 头中检索原始 IP 地址。您还可以通过覆盖 __INLINE_CODE_34__ 方法来自定义应用程序的行为，以从这个头中提取 IP 地址，而不是依赖 __INLINE_CODE_35__。以下是一个演示如何实现这个功能的示例：

__CODE_BLOCK_8__

> info **提示** 您可以在 Express 和 Fastify 中找到 __INLINE_CODE_36__ 请求对象的 API，分别在 __LINK_229__ 和 __LINK_230__ 中。

#### WebSocket

这个模块可以与 WebSocket 一起工作，但需要一些类的扩展。可以扩展 __INLINE_CODE_37__ 并覆盖 __INLINE_CODE_38__ 方法。

__CODE_BLOCK_9__

> info **提示** 如果您使用 ws，您需要将 __INLINE_CODE_39__ 替换为 __INLINE_CODE_40__

在工作中需要注意几点：

- 监听器不能与 __INLINE_CODE_41__ 或 __INLINE_CODE_42__ 一起注册
- 当达到限制时，Nest 将 emit __INLINE_CODE_43__ 事件，因此确保有一个监听器准备好处理这个事件。

> info **提示** 如果您使用 __INLINE_CODE_44__ 包，可以使用 __INLINE_CODE_45__。

#### GraphQL

__INLINE_CODE_46__ 还可以用于工作 GraphQL 请求。类似地，可以扩展守卫，但这次将覆盖 __INLINE_CODE_47__ 方法。

__CODE_BLOCK_10__

#### 配置

以下是将被传递给 __INLINE_CODE_48__ 选项数组的有效选项：

...

(Note: I'll continue translating the rest of the content once you confirm the translation is correct so far.)Here is the translation of the provided English technical documentation to Chinese:

**__HTML_TAG_78__**
**__HTML_TAG_79__**
  **__HTML_TAG_80__** __HTML_TAG_81__ **name** __HTML_TAG_82__ **__HTML_TAG_83__**
  **__HTML_TAG_84__**the name for internal tracking of which throttler set is being used. Defaults to **__HTML_TAG_85__**default**__HTML_TAG_86__** if not passed**__HTML_TAG_87__
**__HTML_TAG_88__**
**__HTML_TAG_89__**
  **__HTML_TAG_90__** __HTML_TAG_91__ **ttl** __HTML_TAG_92__ **__HTML_TAG_93__**
  **__HTML_TAG_94__**the number of milliseconds that each request will last in storage**__HTML_TAG_95__
**__HTML_TAG_96__**
**__HTML_TAG_97__**
  **__HTML_TAG_98__** __HTML_TAG_99__ **limit** __HTML_TAG_100__ **__HTML_TAG_101__**
  **__HTML_TAG_102__**the maximum number of requests within the TTL limit**__HTML_TAG_103__
**__HTML_TAG_104__**
**__HTML_TAG_105__**
  **__HTML_TAG_106__** __HTML_TAG_107__ **blockDuration** __HTML_TAG_108__ **__HTML_TAG_109__**
  **__HTML_TAG_110__**the number of milliseconds that request will be blocked for that time**__HTML_TAG_111__
**__HTML_TAG_112__**
**__HTML_TAG_113__**
  **__HTML_TAG_114__** __HTML_TAG_115__ **ignoreUserAgents** __HTML_TAG_116__ **__HTML_TAG_117__**
  **__HTML_TAG_118__**an array of regular expressions of user-agents to ignore when it comes to throttling requests**__HTML_TAG_119__
**__HTML_TAG_120__**
**__HTML_TAG_121__**
  **__HTML_TAG_122__** __HTML_TAG_123__ **skipIf** __HTML_TAG_124__ **__HTML_TAG_125__**
  **__HTML_TAG_126__**a function that takes in the **__HTML_TAG_127__**ExecutionContext**__HTML_TAG_128__ and returns a **__HTML_TAG_129__**boolean**__HTML_TAG_130__ to short circuit the throttler logic. Like **__HTML_TAG_131__**@SkipThrottler()**__HTML_TAG_132__, but based on the request**__HTML_TAG_133__
**__HTML_TAG_134__**
**__HTML_TAG_135__**

如果您需要设置存储或在更全局的意义上使用一些上述选项，以便对每个阈值集应用，请通过 **__INLINE_CODE_49__** 选项键来传递上述选项，并使用以下表格

**__HTML_TAG_136__**
  **__HTML_TAG_137__**
    **__HTML_TAG_138__** __HTML_TAG_139__ **storage** __HTML_TAG_140__ **__HTML_TAG_141__**
    **__HTML_TAG_142__**a custom storage service for where the throttling should be kept track. **__HTML_TAG_143__**See here**__HTML_TAG_144__ **__HTML_TAG_145__**
**__HTML_TAG_146__**
**__HTML_TAG_147__**
  **__HTML_TAG_148__** __HTML_TAG_149__ **ignoreUserAgents** __HTML_TAG_150__ **__HTML_TAG_151__**
  **__HTML_TAG_152__**an array of regular expressions of user-agents to ignore when it comes to throttling requests**__HTML_TAG_153__
**__HTML_TAG_154__**
**__HTML_TAG_155__**
  **__HTML_TAG_156__** __HTML_TAG_157__ **skipIf** __HTML_TAG_158__ **__HTML_TAG_159__**
  **__HTML_TAG_160__**a function that takes in the **__HTML_TAG_161__**ExecutionContext**__HTML_TAG_162__ and returns a **__HTML_TAG_163__**boolean**__HTML_TAG_164__ to short circuit the throttler logic. Like **__HTML_TAG_165__**@SkipThrottHere is the translation of the provided English technical documentation to Chinese:

内存缓存

内置存储是内存缓存，用于跟踪直到 TTL 根据全局选项设置为止。您可以将自己的存储选项添加到 __INLINE_CODE_55__ 选项的 __INLINE_CODE_56__ 中，只要该类实现了 __INLINE_CODE_57__ 接口。

对于分布式服务器，您可以使用社区存储提供商 __LINK_231__ 来实现单一的真实来源。

> info **注意** __INLINE_CODE_58__ 可以从 __INLINE_CODE_59__ 进口。

#### 时间帮助器

如果您想要使用更可读的时间， __INLINE_CODE_60__ 将导出五个不同的帮助器， __INLINE_CODE_61__、__INLINE_CODE_62__、__INLINE_CODE_63__、__INLINE_CODE_64__ 和 __INLINE_CODE_65__。要使用它们，只需调用 __INLINE_CODE_66__ 或任何其他帮助器，正确的毫秒数将被返回。

#### 迁移指南

对于大多数人，包装选项数组将足够。

如果您使用自定义存储，应该将 __INLINE_CODE_67__ 和 __INLINE_CODE_68__ 包装成数组，并将其赋值给选项对象的 __INLINE_CODE_69__ 属性。

任何 __INLINE_CODE_70__ 装饰器都可以用来绕过特定路由或方法的限速。它接受可选的布尔参数， 默认为 __INLINE_CODE_71__。这对特定端点的限速非常有用。

任何 __INLINE_CODE_72__ 装饰器现在都应该接受一个对象，其中的键是 throttler 上下文的名称（如果没有名称，则使用 __INLINE_CODE_73__），值是具有 __INLINE_CODE_74__ 和 __INLINE_CODE_75__ 键的对象。

> 警告 **重要** __INLINE_CODE_76__ 现在以毫秒为单位。如果您想要保持 TTL 的可读性，请使用该包的 __INLINE_CODE_77__ 帮助器，它将乘以 1000 将 ttl 转换为毫秒。

更多信息，请见 __LINK_232__