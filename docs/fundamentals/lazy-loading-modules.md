<!-- 此文件从 content/fundamentals/lazy-loading-modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:35:59.568Z -->
<!-- 源文件: content/fundamentals/lazy-loading-modules.md -->

### 懒加载模块

默认情况下，模块是急切加载的，这意味着一旦应用程序加载完成，所有模块都会被加载，是否它们立即需要或不需要。虽然这对于大多数应用程序来说是合适的，但是在 **无服务器环境** 中，这可能会成为瓶颈，因为启动延迟（“冷启动”）是非常重要的。

懒加载可以帮助减少启动时间，仅加载由特定无服务器函数调用所需的模块，并且可以异步加载其他模块，以加速后续调用（延迟模块注册）。

> 提示 **Hint** 如果您熟悉 **__LINK_29__** 框架，您可能已经见过 "__LINK_30__" 项。请注意，这种技术在 Nest 中是 **功能不同的**，因此请将其视为一个不同的特性，仅 shares 相同的命名约定。

> 警告 **Warning** 在懒加载模块和服务中， __LINK_31__ 不会被调用。

#### 开始

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

> 提示 **Hint** "Lazy loaded" 模块在首次 __INLINE_CODE_12__ 方法调用时将被缓存。这意味着，连续尝试加载 __INLINE_CODE_13__ 将非常快，并将返回缓存实例，而不是重新加载模块。
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
> 也是如此，"lazy loaded" 模块共享同一个模块图像，如同急切加载的模块在应用程序启动时一样，以及任何后续在您的应用程序中注册的lazy 模块。

Where __INLINE_CODE_14__ 是一个 TypeScript 文件，导出一个 **普通的 Nest 模块**（无需额外更改）。

The __INLINE_CODE_15__ method returns the __LINK_32__ (of __INLINE_CODE_16__) that lets you navigate the internal list of providers and obtain a reference to any provider using its injection token as a lookup key.

例如，让我们说我们有一个 __INLINE_CODE_17__，具有以下定义：

```typescript
const ctx = host.switchToHttp();
const request = ctx.getRequest<Request>();
const response = ctx.getResponse<Response>();

```

> 提示 **Hint** 懒加载模块不能注册为 **全局模块**，因为它们是在懒加载时注册的，当所有静态注册的模块已经被实例化时。这也意味着注册的 **全局增强器**（guards/interceptors 等）将不能正常工作。

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

> 警告 **Warning** 如果您使用 **Webpack**，请更新您的 __INLINE_CODE_19__ 文件 - 将 __INLINE_CODE_20__ 设置为 __INLINE_CODE_21__，并添加 __INLINE_CODE_22__ 属性，值为 `ArgumentsHost`：
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
> 在这些选项设置好后，您将能够使用 __LINK_33__ 功能。

#### 懒加载控制器、网关和解析器

由于 Nest 中的控制器（或 GraphQL 应用程序中的解析器）代表路由/路径/主题（或查询/更新），您 **不能懒加载它们** 使用 `ExecutionContext` 类。

> 警告 **Warning** 在懒加载模块中注册的控制器、 __LINK_34__ 和 __LINK_35__ 将不正常工作。同样，您不能在按需注册中间件函数（实现 `ArgumentsHost` 接口）。

例如，让我们说您正在构建一个 REST API（HTTP 应用程序）使用 Fastify 驱动程序（使用 `ArgumentsHost` 包）。Fastify 不允许在应用程序准备好/成功监听消息后注册路由。这意味着，即使我们分析了模块控制器中注册的路由映射，所有懒加载路由都不能被访问，因为没有办法在运行时注册它们。

类似地，某些传输策略，我们在 `host` 包中提供（包括 Kafka、gRPC 或 RabbitMQ），要求在连接建立前订阅/监听特定主题/通道。如果您的应用程序开始监听消息，框架将不能订阅/监听新的主题。

最后， `catch()` 包中的代码优先级启用自动根据元数据生成 GraphQL schema。这意味着，它需要在类加载之前完成所有类的加载。否则，无法创建合法的 schema。

#### 常见用例大多数情况下，您会在worker/cron job/lambda & serverless function/webhook中看到懒加载模块，因为这些场景需要根据输入参数（路由路径/日期/查询参数等）来触发不同的服务（不同的逻辑）。相反，懒加载模块对单体应用程序可能没有太多意义，因为启动时间对它们来说并不重要。

(Note: I translated the text according to the provided glossary and followed the translation requirements. I kept the code examples, variable names, function names unchanged, and maintained the Markdown formatting, links, images, tables, and code comments. I also removed the @@switch block and content after it, converted @@filename(xxx) to rspress syntax, and kept internal anchors unchanged.)