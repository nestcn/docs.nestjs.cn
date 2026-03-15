<!-- 此文件从 content/security/rate-limiting.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:56:19.629Z -->
<!-- 源文件: content/security/rate-limiting.md -->

### 速率限制

保护应用程序免受暴力攻击的一种常见技术是**速率限制**。要开始使用，需要安装 `LazyModule` 包。

__代码块0__

安装完成后，可以使用 `lazy.module.ts` 配置像其他 Nest 包一样，使用 `LazyModuleLoader#load` 或 `LazyModule` 方法。

__代码块1__

上述代码将设置全局选项、时间到期毫秒数和 `LazyService`，并将其应用于应用程序的路由。

一旦模块被导入，您可以选择如何绑定 `tsconfig.json`。任何绑定方式，包括在 __LINK_226__ 部分中提到的方式都是可行的。如果您想要将守卫绑定到全局，可以添加以下提供程序到任何模块：

__代码块2__

#### 多个限流定义

有时可能需要设置多个限流定义，例如每秒不超过 3 个请求、10 秒内不超过 20 个请求和 1 分钟内不超过 100 个请求。要实现这个，可以在数组中设置名称选项，然后在 `compilerOptions.module` 和 `"esnext"` 装饰器中引用这些选项。

__代码块3__

#### 自定义

可能会出现需要将守卫绑定到控制器或全局，但要禁用速率限制的某些端点的情况。您可以使用 `compilerOptions.moduleResolution` 装饰器来 negates the throttler for an entire class or a single route。 `"node"` 装饰器也可以传入一个对象，以便在某些情况下忽略大多数控制器，但不是每个路由。

__代码块4__

`MiddlewareConsumer` 装饰器可以用来跳过某个路由或类或 negates the skipping of a route in a class that is skipped。

__代码块5__

#### 代理

如果您的应用程序运行在代理服务器后，需要配置 HTTP 适配器以信任代理服务器。可以参考特定的 HTTP 适配器选项来启用 __INLINE_CODE_30__ 设置。

以下是一个示例，演示了如何启用 __INLINE_CODE_31__ 的 Express 适配器：

__代码块7__

启用 __INLINE_CODE_32__ 允许您从 __INLINE_CODE_33__ 头中获取原始 IP 地址。您也可以自定义应用程序的行为，通过重写 __INLINE_CODE_34__ 方法来提取 IP 地址，而不是依赖 __INLINE_CODE_35__。

以下是一个示例，演示如何实现这两个步骤：

__代码块8__

> info **提示** 您可以在 Express 中找到 __INLINE_CODE_36__ 请求对象的 API __LINK_229__，在 Fastify 中找到 __LINK_230__。

#### WebSockets

这个模块可以与 WebSockets 进行交互，但需要类的扩展。您可以扩展 __INLINE_CODE_37__ 并重写 __INLINE_CODE_38__ 方法。

__代码块9__

> info **提示** 如果您使用 ws，可以将 __INLINE_CODE_39__ 替换为 __INLINE_CODE_40__

在使用 WebSockets 时需要注意以下几点：

- 守卫不能与 __INLINE_CODE_41__ 或 __INLINE_CODE_42__ 注册
- 当达到限制时，Nest 将 emit  __INLINE_CODE_43__ 事件，因此需要有一名监听器准备好处理这个事件

> info **提示** 如果您使用 __INLINE_CODE_44__ 包，可以使用 __INLINE_CODE_45__。

#### GraphQL

__INLINE_CODE_46__ 也可以用于 GraphQL 请求。类似地，守卫可以被扩展，但这次将重写 __INLINE_CODE_47__ 方法。

__代码块10__

#### 配置

以下选项有效用于 __INLINE_CODE_48__ 的 options 数组：

(待续)Here is the translation of the English technical documentation to Chinese:

&lt;__HTML_TAG_78__&gt;
&lt;__HTML_TAG_79__&gt;
  &lt;__HTML_TAG_80__&gt;__HTML_TAG_81__&lt;/__HTML_TAG_82__&gt;&lt;__HTML_TAG_83__&gt;
  &lt;__HTML_TAG_84__&gt;名称为内部跟踪哪个阻止器集被使用的名称&lt;/__HTML_TAG_85__&gt;&lt;/__HTML_TAG_86__&gt;,&lt;/__HTML_TAG_87__&gt;
&lt;/__HTML_TAG_88__&gt;
&lt;__HTML_TAG_89__&gt;
  &lt;__HTML_TAG_90__&gt;__HTML_TAG_91__ttl&lt;/__HTML_TAG_92__&gt;&lt;/__HTML_TAG_93__&gt;
  &lt;__HTML_TAG_94__&gt;每个请求在存储中保持的毫秒数&lt;/__HTML_TAG_95__&gt;
&lt;/__HTML_TAG_96__&gt;
&lt;__HTML_TAG_97__&gt;
  &lt;__HTML_TAG_98__&gt;__HTML_TAG_99__limit&lt;/__HTML_TAG_100__&gt;&lt;/__HTML_TAG_101__&gt;
  &lt;__HTML_TAG_102__&gt;在 TTL 限制内的最大请求数量&lt;/__HTML_TAG_103__&gt;
&lt;/__HTML_TAG_104__&gt;
&lt;__HTML_TAG_105__&gt;
  &lt;__HTML_TAG_106__&gt;__HTML_TAG_107__blockDuration&lt;/__HTML_TAG_108__&gt;&lt;/__HTML_TAG_109__&gt;
  &lt;__HTML_TAG_110__&gt;请求将被阻止的毫秒数&lt;/__HTML_TAG_111__&gt;
&lt;/__HTML_TAG_112__&gt;
&lt;__HTML_TAG_113__&gt;
  &lt;__HTML_TAG_114__&gt;__HTML_TAG_115__ignoreUserAgents&lt;/__HTML_TAG_116__&gt;&lt;/__HTML_TAG_117__&gt;
  &lt;__HTML_TAG_118__&gt;忽略请求时的用户代理数组&lt;/__HTML_TAG_119__&gt;
&lt;/__HTML_TAG_120__&gt;
&lt;__HTML_TAG_121__&gt;
  &lt;__HTML_TAG_122__&gt;__HTML_TAG_123__skipIf&lt;/__HTML_TAG_124__&gt;&lt;/__HTML_TAG_125__&gt;
  &lt;__HTML_TAG_126__&gt;一个函数，它将在&lt;/__HTML_TAG_127__&gt;ExecutionContext&lt;/__HTML_TAG_128__&gt;中返回一个&lt;/__HTML_TAG_129__&gt;boolean&lt;/__HTML_TAG_130__&gt;，用于短路阻止器逻辑。像&lt;/__HTML_TAG_131__&gt;@SkipThrottler()&lt;/__HTML_TAG_132__&gt;，但基于请求&lt;/__HTML_TAG_133__&gt;
&lt;/__HTML_TAG_134__&gt;
&lt;__HTML_TAG_135__&gt;

如果您需要设置存储或在每个阻止器集中使用上述选项，可以通过&lt;/__INLINE_CODE_49__&gt;选项键将选项传递给以下表格

&lt;__HTML_TAG_136__&gt;
  &lt;__HTML_TAG_137__&gt;
    &lt;__HTML_TAG_138__&gt;__HTML_TAG_139__storage&lt;/__HTML_TAG_140__&gt;&lt;/__HTML_TAG_141__&gt;
    &lt;__HTML_TAG_142__&gt;自定义存储服务，用于跟踪阻止器&lt;/__HTML_TAG_143__&gt;See here&lt;/__HTML_TAG_144__&gt;&lt;/__HTML_TAG_145__&gt;
  &lt;/__HTML_TAG_146__&gt;
  &lt;__HTML_TAG_147__Here is the translation of the English technical documentation to Chinese, following the provided guidelines:

内存缓存是一个内存缓存，它跟踪直到 TTL 根据全局选项被设置的请求。您可以将自己的存储选项插入到 __INLINE_CODE_55__ 的 __INLINE_CODE_56__ 中，只要该类实现了 __INLINE_CODE_57__ 接口。

对于分布式服务器，您可以使用社区提供的 __LINK_231__ 来拥有一个单一的真实来源。

> 信息 **注意** __INLINE_CODE_58__ 可以从 __INLINE_CODE_59__ 导入。

#### 时间帮助器

有几个帮助器方法可以使 timings 更加可读，如果您更喜欢使用它们，可以直接定义。 __INLINE_CODE_60__ 导出五个不同的帮助器 __INLINE_CODE_61__、__INLINE_CODE_62__、__INLINE_CODE_63__、__INLINE_CODE_64__ 和 __INLINE_CODE_65__。要使用它们，只需调用 __INLINE_CODE_66__ 或其他帮助器，正确的毫秒数将被返回。

#### 迁移指南

对于大多数人，包围选项数组将足够。

如果您使用自定义存储，应该将您的 __INLINE_CODE_67__ 和 __INLINE_CODE_68__ 包围在一个数组中，并将其分配给 options 对象的 __INLINE_CODE_69__ 属性。

任何 __INLINE_CODE_70__ 装饰器都可以用来 bypass throttling 对于特定的路由或方法。这接受一个可选的布尔参数，默认为 __INLINE_CODE_71__。这非常有用，当您想要跳过特定的端点的速率限制。

任何 __INLINE_CODE_72__ 装饰器应该现在接受一个对象，其中 string 键相关于 throttler 上下文的名称（如果没有名称，使用 __INLINE_CODE_73__），值为具有 __INLINE_CODE_74__ 和 __INLINE_CODE_75__ 键的对象。

> 警告 **重要** __INLINE_CODE_76__ 现在以毫秒为单位。如果您想保持 TTL 在秒级别以提高可读性，请使用本包中的 __INLINE_CODE_77__ 帮助器。它只是将 TTL 乘以 1000 来使其以毫秒为单位。

更多信息，请查看 __LINK_232__。