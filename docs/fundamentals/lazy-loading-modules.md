<!-- 此文件从 content/fundamentals/lazy-loading-modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:12:06.518Z -->
<!-- 源文件: content/fundamentals/lazy-loading-modules.md -->

###_lazy_loading_modules

默认情况下，模块都是急切加载的，这意味着当应用程序加载时，所有模块都会被加载，是否它们当前需要都没有关系。虽然这对于大多数应用程序来说是可以的，但是对于运行在 **serverless环境** 中的应用程序/worker来说，这可能会成为瓶颈，因为启动延迟（“冷启动”）是非常重要的。

懒加载可以帮助减少启动时间 bằng加载只需要的模块，以便在 serverless 函数调用时尽快启动。此外，您还可以在 serverless 函数 “warm” 之后异步加载其他模块，以 further 加速后续调用（延迟模块注册）。

> info **hint** 如果您熟悉 __LINK_29__ 框架，您可能已经见过了 "__LINK_30__" 项。请注意，这个技术在 Nest 中是 **functionally different** 的，因此请将其视为一个完全不同的特性，它只共享类似的命名约定。

> warning **警告** 在懒加载的模块和服务中不会调用 __LINK_31__。

#### Getting started

要按需加载模块，Nest 提供了 __INLINE_CODE_7__ 类，可以像正常方式一样注入到类中：

```typescript
if (host.getType() === 'http') {
  // do something that is only important in the context of regular HTTP requests (REST)
} else if (host.getType() === 'rpc') {
  // do something that is only important in the context of Microservice requests
} else if (host.getType<GqlContextType>() === 'graphql') {
  // do something that is only important in the context of GraphQL requests
}

```

> info **hint** __INLINE_CODE_8__ 类来自 __INLINE_CODE_9__ 包。

Alternatively, you can obtain a reference to the __INLINE_CODE_10__ provider from within your application bootstrap file (__INLINE_CODE_11__), as follows:

```typescript
const [req, res, next] = host.getArgs();

```

With this in place, you can now load any module using the following construction:

```typescript
const request = host.getArgByIndex(0);
const response = host.getArgByIndex(1);

```

> info **hint** "Lazy loaded" 模块在第一次 __INLINE_CODE_12__ 方法调用时被缓存。这意味着每次尝试加载 __INLINE_CODE_13__ 都将非常快，并返回一个缓存实例，而不是重新加载模块。
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
>此外，“lazy loaded” 模块共享同一个模块图表，因为它们已经在应用程序启动时被急切加载了，也包括后续在您的应用程序中注册的 lazy 模块。

Where __INLINE_CODE_14__ 是一个 TypeScript 文件，它导出一个 **正常的 Nest 模块**（无需额外更改）。

The __INLINE_CODE_15__ method returns the __LINK_32__ (of __INLINE_CODE_16__) that lets you navigate the internal list of providers and obtain a reference to any provider using its injection token as a lookup key.

For example, let's say we have a __INLINE_CODE_17__ with the following definition:

```typescript
const ctx = host.switchToHttp();
const request = ctx.getRequest<Request>();
const response = ctx.getResponse<Response>();

```

> info **hint** 懒加载模块不能注册为 **全局模块**，因为它们是按需注册的，在静态注册的模块已经被实例化后。同样，注册 **全局增强器**（guards/interceptors 等） **将不工作**。

With this, we could obtain a reference to the __INLINE_CODE_18__ provider, as follows:

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

> warning **警告** 如果您使用 **Webpack**，请确保更新您的 __INLINE_CODE_19__ 文件 - 设置 __INLINE_CODE_20__ 到 __INLINE_CODE_21__ 并添加 __INLINE_CODE_22__ 属性，其中 `ArgumentsHost` 作为值：
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
> 使用这些选项，您将能够使用 __LINK_33__ 功能。

#### Lazy loading controllers, gateways, and resolvers

由于 Nest 中的控制器（或 GraphQL 应用程序中的解析器）代表了路由/路径/主题（或查询/ mutation）的集合，您 **不能使用 `ExecutionContext` 类来懒加载它们**。

> error **警告** 在懒加载模块中注册的控制器、 __LINK_34__ 和 __LINK_35__ 将不正常工作。同样，您不能在按需注册中注册中间件函数（实现 `ArgumentsHost` 接口）。

例如，如果您正在构建一个 REST API（HTTP 应用程序）使用 Fastify 驱动程序（使用 `ArgumentsHost` 包）。Fastify 不允许在应用程序准备好/成功监听消息后注册路由。这意味着，即使我们分析了模块中的路由映射，懒加载路由都不能访问，因为没有办法在运行时注册它们。

类似地，我们提供的 `host` 包（包括 Kafka、gRPC 或 RabbitMQ）需要在连接建立之前订阅/监听特定主题/通道。您的应用程序开始监听消息后，框架将无法订阅/监听新的主题。

最后， `catch()` 包在代码优先启用时自动生成 GraphQL schema，以便在 metadata 基础上生成 schema。这意味着，它需要在类加载完成之前。否则，它将无法创建合法的 schema。

#### Common use-cases在大多数情况下，您将在 worker/cron job/lambda 函数/无服务器函数/webhook 中看到延迟加载模块，因为这些模块需要根据输入参数（路由路径/日期/查询参数等）触发不同的服务（不同的逻辑）。反之，延迟加载模块对于单体应用程序可能不太有意义，因为启动时间对其影响不大。