<!-- 此文件从 content/fundamentals/lazy-loading-modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:57:27.868Z -->
<!-- 源文件: content/fundamentals/lazy-loading-modules.md -->

### 懒加载模块

默认情况下，模块是急切加载的，这意味着在应用程序加载时，所有模块都会被加载，是否立即需要都一样。虽然这对于大多数应用程序来说是合适的，但是在 **无服务器环境** 中，启动延迟（“冷启动”）是关键的。

懒加载可以帮助减少启动时间，仅加载特定serverless函数调用所需的模块。另外，您还可以异步加载其他模块，以加速后续调用中的启动时间（延迟模块注册）。

> 提示 **Hint** 如果您熟悉 __LINK_29__ 框架，您可能已经见过 "__LINK_30__" 项。请注意，这个技术在 Nest 中是functionally不同的，因此请将其视为一个完全不同的功能，共享类似的命名约定。

> 警告 **Warning** __LINK_31__ 不会在懒加载模块和服务中被调用。

#### 入门

要按需加载模块，Nest 提供了 __INLINE_CODE_7__ 类，可以像正常情况一样将其注入到类中：

```typescript
if (host.getType() === 'http') {
  // do something that is only important in the context of regular HTTP requests (REST)
} else if (host.getType() === 'rpc') {
  // do something that is only important in the context of Microservice requests
} else if (host.getType<GqlContextType>() === 'graphql') {
  // do something that is only important in the context of GraphQL requests
}

```

> 提示 **Hint** __INLINE_CODE_8__ 类来自 __INLINE_CODE_9__ 包。

Alternatively, you can obtain a reference to the __INLINE_CODE_10__ provider from within your application bootstrap file (__INLINE_CODE_11__), as follows:

```typescript
const [req, res, next] = host.getArgs();

```

With this in place, you can now load any module using the following construction:

```typescript
const request = host.getArgByIndex(0);
const response = host.getArgByIndex(1);

```

> 提示 **Hint** “Lazy loaded” 模块在首次 __INLINE_CODE_12__ 方法调用时被缓存。这意味着，所有后续尝试加载 __INLINE_CODE_13__ 都将非常快，并将返回一个缓存的实例，而不是重新加载模块。
>
> ```typescript
/**
 * Switch context to RPC.
 */
switchToRpc(): RpcArgumentsHost;
/**
 * Switch context to HTTP.
 */
switchToHttp(): HttpArgumentsHost;
/**
 * Switch context to WebSockets.
 */
switchToWs(): WsArgumentsHost;

```

>
> “Lazy loaded” 模块共享与应用程序启动时急切加载的模块图表相同，也可以在您的应用程序中注册其他懒加载模块。

其中 __INLINE_CODE_14__ 是一个 TypeScript 文件，导出一个 **常规 Nest 模块**（无需额外更改）。

__INLINE_CODE_15__ 方法返回 __LINK_32__（__INLINE_CODE_16__），使您可以浏览内部的提供者列表并获取任何提供者的引用，以其注入令牌作为_lookup_key。

例如，让我们说我们有一个 __INLINE_CODE_17__，具有以下定义：

```typescript
const ctx = host.switchToHttp();
const request = ctx.getRequest<Request>();
const response = ctx.getResponse<Response>();

```

> 提示 **Hint** 懒加载模块不能注册为 **全局模块**，因为它们是在 lazyly 注册的，当所有静态注册的模块都已经被实例化时。同样，注册 **全局增强器**（guards/interceptors/etc.）将不起作用。

与此，我们可以获取 __INLINE_CODE_18__ 提供者的引用，如下所示：

```typescript
export interface WsArgumentsHost {
  /**
   * Returns the data object.
   */
  getData<T>(): T;
  /**
   * Returns the client object.
   */
  getClient<T>(): T;
}

```

> 警告 **Warning** 如果您使用 **Webpack**，请确保更新 __INLINE_CODE_19__ 文件 - 设置 __INLINE_CODE_20__ 到 __INLINE_CODE_21__，并添加 __INLINE_CODE_22__ 属性，值为 `ArgumentsHost`：
>
> ```typescript
export interface RpcArgumentsHost {
  /**
   * Returns the data object.
   */
  getData<T>(): T;

  /**
   * Returns the context object.
   */
  getContext<T>(): T;
}

```

>
> 设置这些选项后，您将能够使用 __LINK_33__ 功能。

#### 懒加载控制器、网关和解析器

由于在 Nest 中，控制器（或 GraphQL 应用程序中的解析器）表示路由/路径/主题（或查询/ mutation）的集合，您 **不能懒加载它们** 使用 `ExecutionContext` 类。

> 警告 **Warning** 在懒加载模块中注册的控制器、 __LINK_34__ 和 __LINK_35__ 将不按预期工作。同样，您不能在按需注册中间件函数（实现 `ArgumentsHost` 接口）。

例如，让我们说您正在构建一个 REST API（HTTP 应用程序），使用 Fastify 驱动程序（使用 `ArgumentsHost` 包）。Fastify 不允许在应用程序准备好/成功监听消息时注册路由。这意味着，即使我们分析了模块中的路由映射，懒加载路由都不能访问，因为没有办法在运行时注册它们。

类似地，某些传输策略，我们提供作为 `host` 包的一部分（包括 Kafka、gRPC 或 RabbitMQ），要求在连接建立之前订阅/监听特定的主题/通道。您的应用程序开始监听消息时，框架将无法订阅/监听新主题。

最后， `catch()` 包中启用代码优先级的方法自动在运行时生成 GraphQL schema，基于元数据。这意味着，它需要所有类在加载前被加载。否则，将无法创建有效的 schema。

#### 常见用例在大多数情况下，您会看到懒加载模块在.worker/cron job/lambda & serverless function/webhook中使用。这些模块在不同的服务（不同的逻辑）中根据输入参数（路由路径/日期/查询参数等）进行触发。相比之下，懒加载模块对 monolithic 应用程序来说可能没有太多意义，因为启动时间对它们来说是无关紧要的。