<!-- 此文件从 content/fundamentals/lazy-loading-modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:57:22.396Z -->
<!-- 源文件: content/fundamentals/lazy-loading-modules.md -->

### 懒加载模块

默认情况下，模块是急切加载的，这意味着在应用程序加载时，即使模块暂时不需要，它们也会被加载。虽然这对大多数应用程序来说是OK的，但是在 **无服务器环境** 中，启动延迟（“冷启动”）是关键的。

懒加载可以帮助减少bootstrap时间，仅加载对特定无服务器函数调用所需的模块。此外，您还可以异步加载其他模块，以加速子sequent调用中的bootstrap时间（延迟模块注册）。

> info **提示** 如果您熟悉 **__LINK_29__** 框架，您可能已经见过 "__LINK_30__" 项。请注意，这种技术在 Nest 中是 **功能不同的**，因此请将其视为一个完全不同的功能，共享相似命名约定。

> warning **警告** 在懒加载模块和服务中，不会调用 __LINK_31__。

#### 获取 Started

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

> info **提示** __INLINE_CODE_8__ 类来自 __INLINE_CODE_9__ 包。

Alternatively, you can obtain a reference to the __INLINE_CODE_10__ provider from within your application bootstrap file (__INLINE_CODE_11__), as follows:

```typescript
const [req, res, next] = host.getArgs();

```

With this in place, you can now load any module using the following construction:

```typescript
const request = host.getArgByIndex(0);
const response = host.getArgByIndex(1);

```

> info **提示** “懒加载”模块在第一次 __INLINE_CODE_12__ 方法调用时被 **缓存**。这意味着，每次尝试加载 __INLINE_CODE_13__ 都将非常快，并将返回一个缓存实例，而不是重新加载模块。

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
> Additionally, "lazy loaded" modules share the same modules graph as those eagerly loaded on the application bootstrap as well as any other lazy modules registered later in your app.

Where __INLINE_CODE_14__ is a TypeScript file that exports a **regular Nest module** (no extra changes are required).

The __INLINE_CODE_15__ method returns the __LINK_32__ (of __INLINE_CODE_16__) that lets you navigate the internal list of providers and obtain a reference to any provider using its injection token as a lookup key.

For example, let's say we have a __INLINE_CODE_17__ with the following definition:

```typescript
const ctx = host.switchToHttp();
const request = ctx.getRequest<Request>();
const response = ctx.getResponse<Response>();

```

> info **提示** 懒加载模块不能注册为 **全局模块**，因为它们是在需要时 lazily 注册的。同样，注册 **全局增强器**（guards/interceptors/etc。） **将不工作**。

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

> warning **警告** 如果您使用 **Webpack**，请更新您的 __INLINE_CODE_19__ 文件 - 将 __INLINE_CODE_20__ 设置为 __INLINE_CODE_21__，并添加 __INLINE_CODE_22__ 属性，值为 `ArgumentsHost`：
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

#### 懒加载控制器、网关和解决方案

由于 Nest 中的控制器（或 GraphQL 应用程序中的解决方案）表示路由/路径/主题（或查询/ mutation），因此 **不能懒加载它们** 使用 `ExecutionContext` 类。

> error **警告** 在懒加载模块内注册的控制器、网关和解决方案将不工作正常。同样，您不能在需求时注册中间件函数（实现 `ArgumentsHost` 接口）。

例如，如果您正在构建一个 REST API（HTTP 应用程序）使用 Fastify 驱动程序（使用 `ArgumentsHost` 包）。Fastify 不允许在应用程序准备好/成功监听消息后注册路由。这意味着，即使我们分析了模块中的路由映射，懒加载路由都将不可访问，因为没有可以在运行时注册它们的方法。

类似地，`host` 包中的某些传输策略（包括 Kafka、gRPC 或 RabbitMQ）要求在连接建立之前订阅/监听特定的主题/通道。应用程序开始监听消息后，框架将无法订阅/监听新的主题。

最后，`catch()` 包中的代码优先级启用自动生成 GraphQL schema，以基于元数据。因此，它需要所有类在前面加载。否则，无法创建合法的schema。

#### 常见用例在大多数情况下，懒加载模块通常出现在 worker/cron job/lambda &  serverless function/webhook 等场景中，这些场景需要根据输入参数（路由路径、日期、查询参数等）来触发不同的服务（不同的逻辑）。相反，对于 monolithic 应用程序来说，懒加载模块可能并不太有意义，因为启动时间对其来说并不是一个问题。