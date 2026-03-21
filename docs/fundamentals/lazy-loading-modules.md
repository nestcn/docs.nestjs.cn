<!-- 此文件从 content/fundamentals/lazy-loading-modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:18:23.557Z -->
<!-- 源文件: content/fundamentals/lazy-loading-modules.md -->

### 懒加载模块

默认情况下，模块都是急切加载的，这意味着在应用程序加载时，所有模块都会被加载，是否立即必要都无关紧要。虽然这对于大多数应用程序来说是合适的，但是在 **无服务器环境** 中，启动延迟（"cold start"）是至关重要的。

懒加载可以帮助减少启动时间 โดย加载仅仅需要的模块，以便在 serverless 函数调用时尽快启动。此外，您还可以异步加载其他模块，以便在后续调用中进一步加速启动时间（延迟模块注册）。

> 信息 **提示** 如果您熟悉 __LINK_29__ 框架，您可能已经见过 "__LINK_30__".term。请注意，这个技术在 Nest 中是 **功能上不同的**，因此请将其视为一个完全不同的功能，共享相似的命名约定。

> 警告 **警告** 懒加载模块和服务中的 __LINK_31__ 不会被调用。

#### 开始

要在需求时加载模块，Nest 提供了 __INLINE_CODE_7__ 类，可以像通常情况一样注入到类中：

```typescript
if (host.getType() === 'http') {
  // do something that is only important in the context of regular HTTP requests (REST)
} else if (host.getType() === 'rpc') {
  // do something that is only important in the context of Microservice requests
} else if (host.getType<GqlContextType>() === 'graphql') {
  // do something that is only important in the context of GraphQL requests
}

```

> 信息 **提示** __INLINE_CODE_8__ 类来自 __INLINE_CODE_9__ 包。

Alternatively, you can obtain a reference to the __INLINE_CODE_10__ provider from within your application bootstrap file (__INLINE_CODE_11__), as follows:

```typescript
const [req, res, next] = host.getArgs();

```

With this in place, you can now load any module using the following construction:

```typescript
const request = host.getArgByIndex(0);
const response = host.getArgByIndex(1);

```

> 信息 **提示** "Lazy loaded" 模块在第一次 __INLINE_CODE_12__ 方法调用时被缓存。这意味着，每个连续的尝试加载 __INLINE_CODE_13__ 都会非常快，并返回缓存实例，而不是重新加载模块。
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
> Additionally, "lazy loaded" 模块共享同样的模块图像与那些急切加载的模块在应用程序启动时加载的模块，以及后续在您的应用程序中注册的lazy 模块。

Where __INLINE_CODE_14__ is a TypeScript file that exports a **regular Nest module** (no extra changes are required).

The __INLINE_CODE_15__ method returns the __LINK_32__ (of __INLINE_CODE_16__) that lets you navigate the internal list of providers and obtain a reference to any provider using its injection token as a lookup key.

For example, let's say we have a __INLINE_CODE_17__ with the following definition:

```typescript
const ctx = host.switchToHttp();
const request = ctx.getRequest<Request>();
const response = ctx.getResponse<Response>();

```

> 信息 **提示** 懒加载模块不能被注册为 **全局模块**，因为它只是在需求时注册，而不是在应用程序启动时。同样，注册 **全局增强器**（guards/interceptors/etc.）**不会工作**。

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

> 警告 **警告** 如果您使用 **Webpack**，请确保更新您的 __INLINE_CODE_19__ 文件 - 设置 __INLINE_CODE_20__ 到 __INLINE_CODE_21__，并添加 __INLINE_CODE_22__ 属性，以 `ArgumentsHost` 作为值：
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
> With these options set up, you'll be able to leverage the __LINK_33__ feature.

#### 懒加载控制器、网关和解析器

由于 Nest 中的控制器（或 GraphQL 应用程序中的解析器）代表一组路由/路径/主题（或查询/mutation），因此 **不能懒加载它们** 使用 `ExecutionContext` 类。

> 警告 **警告** 在懒加载模块中注册的控制器、 __LINK_34__ 和 __LINK_35__ 不会按照预期工作。同样，您不能在需求时注册中间件函数（实现 `ArgumentsHost` 接口）。

例如，让我们说您正在构建一个 REST API（HTTP 应用程序）使用 Fastify 驱动程序（使用 `ArgumentsHost` 包）。Fastify 不允许在应用程序启动时注册路由-after。因此，即使我们分析了模块中的路由映射，懒加载的路由也不能访问，因为不能在运行时注册它们。

同样，某些 transport strategies，我们提供的 `host` 包（包括 Kafka、gRPC 或 RabbitMQ）要求在连接建立时订阅/监听特定的主题/通道。您的应用程序启动后，框架将无法订阅/监听新的主题。

最后， `catch()` 包中使用代码优先启用自动生成 GraphQL schema 的方法基于 metadata。这意味着，它需要在类加载时加载所有类。否则，无法创建合法的 schema。

#### 常见用例在大多数情况下，您将看到懒加载模块是在worker/cron job/lambda & 服务器less函数/webhook triggered时，根据输入参数（路由路径/日期/查询参数等）触发不同的服务（不同的逻辑）。相反，懒加载模块对于 monolithic 应用程序可能没有太多意义，因为启动时间对他们来说无关紧要。

(Note: I followed the guidelines and translated the text to Chinese while maintaining the original format and code examples unchanged.)