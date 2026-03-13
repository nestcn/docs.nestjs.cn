<!-- 此文件从 content/migration.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:22:23.729Z -->
<!-- 源文件: content/migration.md -->

### Migration Guide

本文提供了从 NestJS 版本 10 到版本 11 的全面migration指南。要了解 v11 中的新功能，请查看 __LINK_105__。虽然更新中有一些 MinorBreakingChanges，但是它们 unlikely 影响大多数用户。您可以查看完整的变更列表 __LINK_106__。

#### Upgrade packages

虽然您可以手动升级包，但我们建议使用 __LINK_107__以获取更流畅的过程。

#### Express v5

Express v5 在 2024 年正式发布，2025 年稳定版本。NestJS 11 现在将 Express v5 作为默认版本集成到框架中。虽然这次更新对大多数用户来说是无缝的，但请注意 Express v5 引入了一些 BreakingChanges。请查看 __LINK_108__以获取详细指南。

Express v5 的一个最明显的更新是重新定义的路径路由匹配算法。下面是路径字符串与 incoming 请求的匹配方式的变化：

- 通配符 __INLINE_CODE_17__ 必须具有名称，匹配参数的行为：使用 __INLINE_CODE_18__ 或 __INLINE_CODE_19__ 而不是 __INLINE_CODE_20__。 __INLINE_CODE_21__ 是通配符参数的名称，并没有特殊含义。你可以将其命名为任何你喜欢的名称，例如 __INLINE_CODE_22__。
- 可选字符 __INLINE_CODE_23__ 不再支持，使用大括号而不是 __INLINE_CODE_24__。
- 正则表达式字符不支持。
- 一些字符已经被保留，以避免升级时的混淆__INLINE_CODE_25__，使用 __INLINE_CODE_26__ 来转义它们。
- 参数名称现在支持有效的 JavaScript 标识符，也可以像 __INLINE_CODE_27__ 一样使用引号。

需要注意的是，Express v4 中工作的路由可能不再在 Express v5 中工作。例如：

__CODE_BLOCK_0__

为了解决这个问题，你可以更新路由以使用命名通配符：

__CODE_BLOCK_1__

> warning **警告** __INLINE_CODE_28__ 是一个名为通配符，它匹配任何路径不包括根路径。如果你需要匹配根路径(__INLINE_CODE_29__),你可以使用 __INLINE_CODE_30__,将通配符包装在大括号中（可选组）。请注意 __INLINE_CODE_31__ 是通配符参数的名称，并没有特殊含义。你可以将其命名为任何你喜欢的名称，例如 __INLINE_CODE_32__。

类似地，如果你有一个在所有路由上运行的中间件，你可能需要更新路径以使用命名通配符：

__CODE_BLOCK_2__

而是可以更新路径以使用命名通配符：

__CODE_BLOCK_3__

请注意 __INLINE_CODE_33__ 是一个名为通配符，它匹配任何路径包括根路径。外部大括号使路径可选。

#### Query parameters parsing

> info **注意** 这个变化只适用于 Express v5。

在 Express v5 中，查询参数不再使用 __INLINE_CODE_34__ 库来解析，而是使用 __INLINE_CODE_35__ 解析器，这个解析器不支持嵌套对象或数组。

因此，查询字符串像这样：

__CODE_BLOCK_4__

将不再像预期那样解析。要恢复之前的行为，可以配置 Express 使用 __INLINE_CODE_36__ 解析器（Express v4 的默认值）并将 __INLINE_CODE_37__ 选项设置为 __INLINE_CODE_38__：

__CODE_BLOCK_5__

#### Fastify v5

__INLINE_CODE_39__ v11 现在支持 Fastify v5。这次更新对大多数用户来说是无缝的，但 Fastify v5 引入了一些 BreakingChanges，虽然这些变化 unlikely 影响大多数 NestJS 用户。请查看 __LINK_109__以获取详细信息。

> info **提示** Fastify v5 中没有对路径匹配的变化（除了中间件，查看下面的部分），所以你可以继续使用通配符语法，路由定义的通配符（如 __INLINE_CODE_40__）将继续工作。

#### Fastify CORS

默认情况下，只允许 __LINK_110__。如果你需要启用其他方法（例如 __INLINE_CODE_41__, __INLINE_CODE_42__, 或 __INLINE_CODE_43__），你必须在 __INLINE_CODE_44__ 选项中显式定义它们。

__CODE_BLOCK_6__

#### Fastify middleware registration

NestJS 11 现在使用最新版本的 __LINK_111__ 包来匹配 **middleware paths** 在 __INLINE_CODE_45__。因此，__INLINE_CODE_46__ 语法用于匹配所有路径不再-supported。相反，你应该使用命名通配符。

例如，如果你有一个在所有路由上运行的中间件：

__CODE_BLOCK_7__

你需要更新它以使用命名通配符：

__CODE_BLOCK_8__

其中 __INLINE_CODE_47__ 只是一个任意的命名通配符名称。你可以将其命名为任何你喜欢的名称。

#### Module resolution algorithmStarting with NestJS 11, the module resolution algorithm has been improved to enhance performance and reduce memory usage for most applications. This change does not require any manual intervention, but there are some edge cases where the behavior may differ from previous versions.

In NestJS v10 and earlier, dynamic modules were assigned a unique opaque key generated from the module's dynamic metadata. This key was used to identify the module in the module registry. For example, if you included __INLINE_CODE_48__ in multiple modules, NestJS would deduplicate the modules and treat them as a single module node in the registry. This process is known as node deduplication.

With the release of NestJS v11, we no longer generate predictable hashes for dynamic modules. Instead, object references are now used to determine if one module is equivalent to another. To share the same dynamic module across multiple modules, simply assign it to a variable and import it wherever needed. This new approach provides more flexibility and ensures that dynamic modules are handled more efficiently.

This new algorithm might impact your integration tests if you use a lot of dynamic modules, because without the manually deduplication mentioned above, your TestingModule could have multiple instances of a dependency. This makes it a bit trickier to stub a method, because you'll need to target the correct instance. Your options are to either:

- Deduplicate the dynamic module you'd like to stub
- Use __INLINE_CODE_49__ to find the correct instance
- Stub all instances using __INLINE_CODE_50__
- Or switch your test back to the old algorithm using __INLINE_CODE_51__

#### Reflector type inference

NestJS 11 introduces several improvements to the Reflect class, enhancing its functionality and type inference for metadata values. These updates provide a more intuitive and robust experience when working with metadata.

1. Reflect now returns an object rather than an array containing a single element when there is only one metadata entry, and the value is of type any. This change improves consistency when dealing with object-based metadata.
2. The return type of Reflect's getMetadata method has been updated to any instead of string. This update better reflects the possibility of no metadata being found and ensures proper handling of undefined cases.
3. The transformed type argument of Reflect's getMetadata method is now properly inferred across all methods.

These enhancements improve the overall developer experience by providing better type safety and handling of metadata in NestJS 11.

#### Lifecycle hooks execution order

Termination lifecycle hooks are now executed in the reverse order to their initialization counterparts. That said, hooks like OnInit, OnDestroy, and AfterViewInit are now executed in the reverse order.

Imagine the following scenario:

```typescript title="example"

```

In this case, the OnInit hooks are executed in the following order:

```typescript title="example"

```

While the OnDestroy hooks are executed in the reverse order:

```typescript title="example"

```

> info **Hint** Global modules are treated as a dependency of all other modules. This means that global modules are initialized first and destroyed last.

#### Middleware registration order

In NestJS v11, the behavior of middleware registration has been updated. Previously, the order of middleware registration was determined by the topological sort of the module dependency graph, where the distance from the root module defined the order of middleware registration, regardless of whether the middleware was registered in a global module or a regular module. Global modules were treated like regular modules in this respect, which led to inconsistent behavior, especially when compared to other framework features.

From v11 onwards, middleware registered in global modules is now executed first, regardless of its position in the module dependency graph. This change ensures that global middleware always runs before any middleware from imported modules, maintaining a consistent and predictable order.

#### Cache module

The CacheModule (from the @nestjs/cache package) has been updated to support the latest version of the Redis package. This update brings a few breaking changes, including a migration to the RedisAdapter, which offers a unified interface for key-value storage across multiple backend stores through storage adapters.

The key difference between the previous version and the new version lies in the configuration of external stores. In the previous version, to register a Redis store, you would have likely configured it like this:

```typescript title="example"

```

In the new version, you should use the RedisAdapter to configure the store:

```typescript title="example"

```

Where RedisAdapter is imported from the @nestjs/cache package. See the [RedisAdapter documentation](https://github.com/nestjs/cache#Redisadapter) to learn more.> warning **警告** 在本次更新中，Keyv 库处理的缓存数据现在结构化为一个对象，其中包含 __INLINE_CODE_71__ 和 __INLINE_CODE_72__ 字段，例如：__INLINE_CODE_73__。虽然 Keyv 自动在访问数据时检索 __INLINE_CODE_74__ 字段，但是请注意这次更改，如果您直接访问缓存数据（例如，除了缓存管理器 API 外）或需要支持使用之前版本的 __INLINE_CODE_75__ 写入的数据。

#### 配置模块

如果您使用来自 __INLINE_CODE_77__ 包的 __INLINE_CODE_76__，请注意在 __INLINE_CODE_78__ 中引入的多个 breaking changes。最重要的是，__INLINE_CODE_79__ 方法读取配置变量的顺序已经更新。新的顺序是：

* 内部配置（config namespaces 和自定义 config 文件）
* 验证环境变量（如果启用了验证并提供了架构）
* __INLINE_CODE_80__ 对象

之前，验证环境变量和 __INLINE_CODE_81__ 对象首先被读取，从而防止它们被内部配置所覆盖。现在，内部配置将始终优先于环境变量。

此外，__INLINE_CODE_82__ 配置选项，之前允许禁用 __INLINE_CODE_83__ 对象的验证，现在已被弃用。相反，使用 __INLINE_CODE_84__ 选项（将其设置为 __INLINE_CODE_85__以禁用预定义环境变量的验证）。预定义环境变量是指在模块导入前设置的 __INLINE_CODE_86__ 变量。例如，如果您使用 __INLINE_CODE_87__ 启动应用程序，则 __INLINE_CODE_88__ 变量被认为是预定义环境变量。然而，通过 __INLINE_CODE_89__ 从文件 __INLINE_CODE_90__ 加载的变量不被视为预定义环境变量。

还引入了一个新的 __INLINE_CODE_91__ 选项。这个选项允许您防止 __INLINE_CODE_92__ 方法访问 __INLINE_CODE_93__ 对象，这可以在您想要限制服务直接读取环境变量时很有用。

#### 终止模块

如果您使用 __INLINE_CODE_94__ 并且已经构建了自己的自定义健康指示器，一种新的 API 在版本 11 中被引入。新的 __INLINE_CODE_95__ 是为了提高自定义健康指示器的可读性和可测试性。

在版本 11 之前，一种健康指示器可能如下所示：

__CODE_BLOCK_14__

从版本 11 开始，我们建议使用新的 __INLINE_CODE_96__ API，这可以简化实现过程。下面是相同的健康指示器现在可以实现的方式：

__CODE_BLOCK_15__

主要变化：

* __INLINE_CODE_97__ 替代了遗留的 __INLINE_CODE_98__ 和 __INLINE_CODE_99__ 类，提供了 healthier 的 API 进行健康检查。
* __INLINE_CODE_100__ 方法允许容易地跟踪状态（__INLINE_CODE_101__ 或 __INLINE_CODE_102__）同时支持在健康检查响应中包含附加元数据。

> info **信息** 请注意 __INLINE_CODE_103__ 和 __INLINE_CODE_104__ 类已经被标记为弃用，并且将在下一个主要版本中被删除。

#### Node.js v16 和 v18 不再支持

从 NestJS 11 开始，Node.js v16 不再支持，因为它于 2023 年 9 月 11 日达到末日（EOL）。同样，Node.js v18 的安全支持将于 2025 年 4 月 30 日结束，所以我们已经将其支持删除。

NestJS 11 现在要求 **Node.js v20 或更高版本**。

为了确保最佳体验，我们强烈建议使用最新的 LTS 版本 Node.js。

#### Mau 官方部署平台

如果您错过了宣布，我们于 2024 年推出了官方部署平台 __LINK_114__。
Mau 是一个完全管理的平台，可以简化 NestJS 应用程序的部署过程。使用 Mau，您可以将应用程序部署到云 (**AWS**; Amazon Web Services) 中，以单个命令为止，管理环境变量，并实时监控应用程序的性能。

Mau 使分配和维护基础设施变得简单、直观，您可以专注于构建应用程序，而不是担心底层基础设施。我们使用 Amazon Web Services 提供您一个强大和可靠的平台，同时抽象了 AWS 的复杂性。我们为您承担所有繁重工作，您可以专注于构建应用程序和增长业务。

__CODE_BLOCK_16__

您可以了解更多关于 Mau 的信息 __LINK_115__。