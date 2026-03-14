<!-- 此文件从 content/security/rate-limiting.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:39:16.540Z -->
<!-- 源文件: content/security/rate-limiting.md -->

### 速率限制

为了保护应用程序免受暴力攻击，**速率限制**是一种常见的技术。要开始使用，请安装 __INLINE_CODE_13__ 包。

```typescript
@UseInterceptors(new TransformInterceptor())
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}

```

安装完成后，可以使用 __INLINE_CODE_14__ 配置包，使用 __INLINE_CODE_15__ 或 __INLINE_CODE_16__ 方法。

__CODE_BLOCK_1__

上述将设置全局选项，包括 __INLINE_CODE_17__（超时毫秒）、__INLINE_CODE_18__（在ttl内的最大请求数量），对于保护的路由。

一旦模块被导入，您可以选择绑定 __INLINE_CODE_19__。任何在 __LINK_226__ 部分提到的绑定方式都是可行的。例如，如果您想将守卫绑定到全局，可以将提供器添加到任何模块：

__CODE_BLOCK_2__

#### 多个限制器定义

可能会出现需要设置多个限制器定义的情况，例如每秒不超过3个请求、10秒内不超过20个请求、1分钟内不超过100个请求。要实现此功能，可以在数组中设置带名称的选项，然后在 __INLINE_CODE_20__ 和 __INLINE_CODE_21__ 装饰器中引用这些选项。

__CODE_BLOCK_3__

#### 自定义

可能会出现需要将守卫绑定到控制器或全局，但同时想要禁用速率限制的某些端点的情况。在这种情况下，可以使用 __INLINE_CODE_22__ 装饰器，以免除某个类或单个路由的速率限制。 __INLINE_CODE_23__ 装饰器也可以传入一个字符串键的对象，以便在某些情况下排除大多数控制器，但不是所有路由，并根据每个限制器集进行配置。如果没有传入对象，默认情况下将使用 __INLINE_CODE_24__

__CODE_BLOCK_4__

__INLINE_CODE_25__ 装饰器可以用来跳过某个路由或类，或者否定某个路由在类中被跳过的行为。

__CODE_BLOCK_5__

还有一种 __INLINE_CODE_26__ 装饰器，可以用来覆盖 __INLINE_CODE_27__ 和 __INLINE_CODE_28__ 在全局模块中设置的选项，以提供更严格或更宽松的安全选项。这个装饰器可以应用于类或函数。从版本5开始，这个装饰器可以传入一个对象，其中包含名为 throttle set 的字符串，以及一个对象，其中包含 limit 和 ttl 键的整数值，类似于传递给根模块的选项。如果没有设置名称，可以使用字符串 __INLINE_CODE_29__。您需要配置它如下：

__CODE_BLOCK_6__

#### 代理

如果您的应用程序在代理服务器后运行，需要将 HTTP 适配器配置为信任代理服务器。可以查看特定的 HTTP 适配器选项来启用 __INLINE_CODE_30__ 设置。

以下是一个示例，演示如何为 Express 适配器启用 __INLINE_CODE_31__：

__CODE_BLOCK_7__

启用 __INLINE_CODE_32__ 允许您从 __INLINE_CODE_33__ 头中检索原始 IP 地址。您可以根据需要自定义应用程序的行为，例如覆盖 __INLINE_CODE_34__ 方法，以从头中提取 IP 地址，而不是依赖 __INLINE_CODE_35__。以下是一个示例，演示如何在 Express 和 Fastify 中实现这点：

__CODE_BLOCK_8__

> 信息 **提示** 您可以在 Express 中找到 __INLINE_CODE_36__ 请求对象的 API __LINK_229__，在 Fastify 中找到 __LINK_230__。

#### WebSockets

这个模块可以与 WebSockets 一起工作，但需要类的扩展。可以扩展 __INLINE_CODE_37__ 并重写 __INLINE_CODE_38__ 方法，如下所示：

__CODE_BLOCK_9__

> 信息 **提示** 如果您使用 ws，需要将 __INLINE_CODE_39__ 替换为 __INLINE_CODE_40__

在使用 WebSockets 时需要注意以下几点：

- 守卫不能与 __INLINE_CODE_41__ 或 __INLINE_CODE_42__ 注册
- 当达到限制时，Nest 将发射 __INLINE_CODE_43__ 事件，因此请确保有一个监听器准备好处理这个事件

> 信息 **提示** 如果您使用 __INLINE_CODE_44__ 包，可以使用 __INLINE_CODE_45__ 而不是 __INLINE_CODE_46__

#### GraphQL

__INLINE_CODE_46__ 也可以用来工作于 GraphQL 请求中。同样，守卫可以扩展，但这次将重写 __INLINE_CODE_47__ 方法

__CODE_BLOCK_10__

#### 配置

以下选项是 __INLINE_CODE_48__ 的 options 数组中有效的：

（未翻译的代码块将保持原样）Here is the translation of the English technical documentation to Chinese:

__HTML_TAG_78__
  __HTML_TAG_79__
    __HTML_TAG_80____HTML_TAG_81__name__HTML_TAG_82____HTML_TAG_83__
    提供者的名称用于内部跟踪哪个速率限制器集在使用。默认情况下，如果没有传递__HTML_TAG_85__default__HTML_TAG_86__将使用__HTML_TAG_87__
  __HTML_TAG_88__
  __HTML_TAG_89__
    __HTML_TAG_90____HTML_TAG_91__ttl__HTML_TAG_92____HTML_TAG_93__
    __HTML_TAG_94__每个请求将在存储中保持的毫秒数__HTML_TAG_95__
  __HTML_TAG_96__
  __HTML_TAG_97__
    __HTML_TAG_98____HTML_TAG_99__limit__HTML_TAG_100____HTML_TAG_101__
    __HTML_TAG_102__在 TTL 限制内的最大请求数__HTML_TAG_103__
  __HTML_TAG_104__
  __HTML_TAG_105__
    __HTML_TAG_106____HTML_TAG_107__blockDuration__HTML_TAG_108____HTML_TAG_109__
    __HTML_TAG_110__请求将被阻止的毫秒数__HTML_TAG_111__
  __HTML_TAG_112__
  __HTML_TAG_113__
    __HTML_TAG_114____HTML_TAG_115__ignoreUserAgents__HTML_TAG_116____HTML_TAG_117__
    __HTML_TAG_118__忽略请求的用户代理的数组__HTML_TAG_119__
  __HTML_TAG_120__
  __HTML_TAG_121__
    __HTML_TAG_122____HTML_TAG_123__skipIf__HTML_TAG_124____HTML_TAG_125__
    __HTML_TAG_126__函数，用于在 ExecutionContext 中返回布尔值，以跳过速率限制逻辑。类似于@SkipThrottler()，但基于请求__HTML_TAG_133__
  __HTML_TAG_134__
__HTML_TAG_135__

如果您需要设置存储或在更高级别使用上述选项，请通过__INLINE_CODE_49__选项 key 传递选项，并使用以下表格

__HTML_TAG_136__
  __HTML_TAG_137__
    __HTML_TAG_138____HTML_TAG_139__storage__HTML_TAG_140____HTML_TAG_141__
    __HTML_TAG_142__自定义存储服务，以便跟踪速率限制。__HTML_TAG_143__请参阅这里__HTML_TAG_144____HTML_TAG_145__
  __HTML_TAG_146__
  __HTML_TAG_147__
    __HTML_TAG_148____HTML_TAG_149__ignoreUserAgents__HTML_TAG_150____HTML_TAG_151__
    __HTML_TAG_152__忽略请求的用户代理的数组__HTML_TAG_153__
  __HTML_TAG_154__
  __HTML_TAG_155__
    __HTML_TAG_156____HTML_TAG_157__skipIf__HTML_TAG_158____HTML_TAG_159__
    __HTML_TAG_160__函数，用于在 ExecutionContext 中返回布尔值，以跳过速率限制逻辑。类似于@SkipThrottler()，但基于请求__HTML_TAG_167__
  __HTML_TAG_168__
  __HTML_TAG_169__
    __HTML_TAG_170____HTML_TAG_171__throttlers__HTML_TAG_172____HTML_TAG_173__
    __HTML_TAG_174__速率限制器集的数组，使用上述表格定义__HTML_TAG_175__
  __HTML_TAG_176__
  __HTML_TAG_177__
    __HTML_TAG_178____HTML_TAG_179__errorMessage__HTML_TAG_180____HTML_TAG_181__
    __HTML_TAG_182__字符串或函数，用于在 ExecutionContext 和 ThrottlerLimitDetail 中返回字符串，以override默认速率限制错误消息__HTML_TAG_191__
  __HTML_TAG_192__
  __HTML_TAG_193__
    __HTML_TAG_194____HTML_TAG_195__getTracker__HTML_TAG_196____HTML_TAG_197__
    __HTML_TAG_198__函数，用于在 Request 中返回字符串，以override默认getTracker方法逻辑__HTML_TAG_205__
  __HTML_TAG_206__
  __HTML_TAG_207__
    __HTML_TAG_208内存缓存是一个在内存中存储请求信息的缓存，直到它们超出了由全局选项设置的 TTL。您可以将自己的存储选项添加到 __INLINE_CODE_56__ 的 __INLINE_CODE_55__ 选项，只要该类实现了 __INLINE_CODE_57__ 接口。

对于分布式服务器，您可以使用社区存储提供商 __LINK_231__ 来拥有一个单一的真实来源。

> info **注意** __INLINE_CODE_58__ 可以从 __INLINE_CODE_59__ 导入。

#### 时间帮助

有几个帮助方法可以使 timings 更加可读，如果您prefer 使用它们而不是直接定义。 __INLINE_CODE_60__ 导出五个不同的帮助方法， __INLINE_CODE_61__、__INLINE_CODE_62__、__INLINE_CODE_63__、__INLINE_CODE_64__ 和 __INLINE_CODE_65__。要使用它们，只需调用 __INLINE_CODE_66__ 或任何其他帮助方法，然后将返回正确的毫秒数。

#### 迁移指南

对于大多数人，包装选项数组将足够。

如果您使用自定义存储，应该将 __INLINE_CODE_67__ 和 __INLINE_CODE_68__ 包装在数组中，并将其分配给选项对象的 __INLINE_CODE_69__ 属性。

任何 __INLINE_CODE_70__ 装饰器都可以用来 bypass throttling 的特定路由或方法。它接受可选的布尔参数， 默认为 __INLINE_CODE_71__。这在您想跳过特定端点的速率限制时非常有用。

任何 __INLINE_CODE_72__ 装饰器现在也应该接受一个对象，其中包含字符串键，关联到 throttler 上下文的名称（如果没有名称，使用 __INLINE_CODE_73__），并包含对象的 __INLINE_CODE_74__ 和 __INLINE_CODE_75__ 键。

> 警告 **重要** __INLINE_CODE_76__ 现在以 **毫秒**为单位。 如果您想保持 ttl 的可读性，可以使用该包中的 __INLINE_CODE_77__ 帮助方法，它只是将ttl 乘以 1000，以便在毫秒中。

更多信息请查看 __LINK_232__。