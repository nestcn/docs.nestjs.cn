<!-- 此文件从 content/fundamentals/lazy-loading-modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:39:24.702Z -->
<!-- 源文件: content/fundamentals/lazy-loading-modules.md -->

### 懒加载模块

默认情况下，模块是急切加载的，这意味着在应用程序启动时，所有模块都会被加载，是否它们立即必要或不。这对于大多数应用程序来说是足够的，但是对于在 **无服务器环境** 中运行的应用程序来说，这可能会成为一个瓶颈，因为启动延迟（“cold start”）是 crucial。

懒加载可以帮助减少启动时间，仅加载需要的模块，以便在 serverless 函数调用时加载。同时，您还可以异步加载其他模块，以便在服务器函数“暖”时加速启动时间（延迟模块注册）。

> 提示 **Tip** 如果您熟悉 __LINK_29__ 框架，您可能已经见过 __LINK_30__ 项。请注意，这个技术在 Nest 中具有不同的功能，因此请将其视为一个完全不同的特性，共享相似的命名约定。

> 警告 **Warning** 懒加载模块和服务中的 __LINK_31__ 将不会被调用。

#### 入门

要在需要时加载模块，Nest 提供了 __INLINE_CODE_7__ 类，可以像正常情况一样将其注入到类中：

```typescript
if (host.getType() === 'http') {
  // do something that is only important in the context of regular HTTP requests (REST)
} else if (host.getType() === 'rpc') {
  // do something that is only important in the context of Microservice requests
} else if (host.getType<GqlContextType>() === 'graphql') {
  // do something that is only important in the context of GraphQL requests
}

```

> 提示 **Tip** __INLINE_CODE_8__ 类来自 __INLINE_CODE_9__ 包。

或者，您可以在应用程序 bootstrap 文件 (__INLINE_CODE_11__) 中获取 __INLINE_CODE_10__ 提供者的引用，以下是方法：

```typescript
const [req, res, next] = host.getArgs();

```

现在，您可以使用以下构造来加载任何模块：

```typescript
const request = host.getArgByIndex(0);
const response = host.getArgByIndex(1);

```

> 提示 **Tip** “懒加载”模块在第一次 __INLINE_CODE_12__ 方法调用时被缓存。这意味着，任何后续的尝试加载 __INLINE_CODE_13__ 将非常快，并且将返回一个缓存的实例，而不是重新加载模块。
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
> “懒加载”模块共享与应用程序启动时急切加载的模块图表，以及后续在应用程序中注册的任何 lazy 模块。

其中 __INLINE_CODE_14__ 是一个 TypeScript 文件，导出一个 **常规 Nest 模块**（无需额外更改）。

__INLINE_CODE_15__ 方法返回 __LINK_32__（__INLINE_CODE_16__），这允许您浏览内部提供者列表并获取任何提供者的引用，使用其注入令牌作为查找键。

例如，让我们假设我们有一个 __INLINE_CODE_17__，具有以下定义：

```typescript
const ctx = host.switchToHttp();
const request = ctx.getRequest<Request>();
const response = ctx.getResponse<Response>();

```

> 提示 **Tip** 懒加载模块不能注册为 **全局模块**，因为它们是懒加载的，只有在静态注册的模块已经被实例化时才会被注册。类似地，注册的 **全局增强器**（守卫/拦截器等）也不会工作。

这样，我们可以获取 __INLINE_CODE_18__ 提供者的引用，以下是方法：

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

> 警告 **Warning** 如果您使用 **Webpack**，请更新 __INLINE_CODE_19__ 文件 - 将 __INLINE_CODE_20__ 设置为 __INLINE_CODE_21__，并添加 __INLINE_CODE_22__ 属性，值为 `ArgumentsHost`：
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
> 在设置这些选项时，您将能够使用 __LINK_33__ 功能。

#### 懒加载控制器、网关和解析器

由于 Nest 中的控制器（或 GraphQL 应用程序中的解析器）代表了路由/路径/主题（或查询/ mutation），因此 **不能懒加载它们** 使用 `ExecutionContext` 类。

> 警告 **Warning** 在懒加载模块中注册的控制器、 __LINK_34__ 和 __LINK_35__ 将无法正常工作。类似地，您不能在需要时注册中间件函数（实现 `ArgumentsHost` 接口）。

例如，让我们假设您正在构建一个 REST API（HTTP 应用程序），使用 Fastify 驱动程序（使用 `ArgumentsHost` 包）。Fastify 不允许在应用程序准备好/成功监听消息时注册路由。这意味着，即使我们分析了模块中的路由映射，懒加载的路由都不可访问，因为没有办法在运行时注册它们。

类似地，某些传输策略，我们提供的一部分 `host` 包（包括 Kafka、gRPC 或 RabbitMQ），要求在连接建立之前订阅/监听特定主题/频道。您的应用程序启动后，它将无法订阅/监听新的主题。

最后， `catch()` 包使用代码优先级Enabled 自动生成 GraphQL 架构，基于元数据。这意味着，它需要在类加载之前加载所有类。否则，它将无法创建有效的架构。

#### 常见用例通常情况下，您最常会在以下情况下看到懒加载模块：当您的worker/cron作业/lambda函数/无服务器函数/webhook需要基于输入参数（路由路径/日期/查询参数等）触发不同的服务（不同的逻辑）时。反之，懒加载模块对于单体应用程序可能不太合适，因为启动时间并不太关重要。

Note: I followed the translation requirements and kept the code and format unchanged.