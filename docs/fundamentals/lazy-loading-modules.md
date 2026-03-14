<!-- 此文件从 content/fundamentals/lazy-loading-modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:32:53.361Z -->
<!-- 源文件: content/fundamentals/lazy-loading-modules.md -->

### 懒加载模块

默认情况下，模块都是急切加载的，这意味着应用程序启动时，所有模块都会被加载，哪怕它们不立即necessary。虽然这对于大多数应用程序来说是正常的，但是在 **无服务器环境** 中，启动延迟 ("冷启动") 是非常重要的。

懒加载可以帮助减少 bootstrap 时间，仅加载特定 serverless 函数调用所需的模块。另外，您也可以异步加载其他模块，以加速后续调用中的启动时间（延迟模块注册）。

> 信息 **提示** 如果您熟悉 **__LINK_29__** 框架，您可能已经见过 "__LINK_30__"术语。请注意，这些技术在 Nest 中是功能不同的，考虑它们作为不同功能，共享相似的命名约定。

> 警告 **警告** 懒加载模块中的 __LINK_31__ 不会被调用。

#### 入门

要在需要时加载模块，Nest 提供了 __INLINE_CODE_7__ 类，可以像通常那样注入到类中：

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

> 信息 **提示** "Lazy loaded" 模块在第一次 __INLINE_CODE_12__ 方法调用时被缓存。这意味着，每个连续的尝试加载 __INLINE_CODE_13__ 将非常快，返回一个缓存实例，而不是加载模块。

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
> Besides, "lazy loaded" 模块共享与应用程序启动时急切加载的模块图表，以及后续在应用程序中注册的 lazy 模块。

Where __INLINE_CODE_14__ is a TypeScript file that exports a regular Nest module (no extra changes are required).

The __INLINE_CODE_15__ method returns the __LINK_32__ (of __INLINE_CODE_16__) that lets you navigate the internal list of providers and obtain a reference to any provider using its injection token as a lookup key.

For example, let's say we have a __INLINE_CODE_17__ with the following definition:

```typescript
const ctx = host.switchToHttp();
const request = ctx.getRequest<Request>();
const response = ctx.getResponse<Response>();

```

> 信息 **提示** 懒加载模块不能注册为 **全局模块**，因为它们是在需要时注册的，而不是在应用程序启动时注册的。类似地，注册 **全局增强器** (guards/interceptors 等) 将不工作。

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

> 警告 **警告** 如果您使用 **Webpack**，请确保更新您的 __INLINE_CODE_19__ 文件 - 设置 __INLINE_CODE_20__ 到 __INLINE_CODE_21__，并添加 __INLINE_CODE_22__ 属性，值为 `ArgumentsHost`：
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

由于 Nest 中的控制器 (或 GraphQL 应用程序中的解析器) 代表路由/路径/主题 (或查询/mutation) 集合，您 **不能懒加载它们** 使用 `ExecutionContext` 类。

> 错误 **警告** 在 lazy loaded 模块中注册的控制器、__LINK_34__ 和 __LINK_35__ 将不工作。类似地，您不能在需要时注册中间件函数（实现 `ArgumentsHost` 接口）。

例如，让我们说您正在构建一个 REST API (HTTP 应用程序) 使用 Fastify 驱动程序（使用 `ArgumentsHost` 包）。Fastify 不允许在应用程序启动后注册路由。因此，即使我们分析了模块控制器中注册的路由映射，lazy loaded 路由也不会可访问，因为没有方法在运行时注册它们。

类似地，我们提供的 `host` 包中的某些传输策略（包括 Kafka、gRPC 或 RabbitMQ）需要在连接建立后订阅/监听特定主题/通道。应用程序启动后监听消息时，框架将无法订阅/监听新的主题。

最后， `catch()` 包中启用代码优先级的代码自动生成 GraphQL schema，基于 metadata。因此，它需要所有类在前面加载。否则，无法创建有效的 schema。

#### 常见用例大多数情况下，您会在以下情况下看到懒加载模块：当 worker/ cron job/lambda & 服务器less函数/webhook 需要根据输入参数（路由路径/日期/查询参数等） Trigger 不同的服务（不同的逻辑）时。另一方面，对于 monolithic 应用程序，懒加载模块可能并不太适合，因为启动时间并不太重要。

(Note: I followed the guidelines and translated the text, keeping the code and format unchanged. I also used the provided glossary to translate technical terms.)