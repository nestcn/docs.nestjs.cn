<!-- 此文件从 content/faq/http-adapter.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:08:57.227Z -->
<!-- 源文件: content/faq/http-adapter.md -->

### HTTP 适配器

有时候，您可能想要访问 Nest 应用程序上下文或外部的 underlying HTTP 服务器。

每个本地（平台特定的）HTTP 服务器/库（例如 Express 和 Fastify）实例都被包装在一个 **适配器** 中。适配器被注册为一个全局可用的提供者，可以从应用程序上下文中获取，也可以被注入到其他提供者中。

#### 应用程序上下文外部策略

要从应用程序上下文外部获取 `HttpAdapter` 的引用，请调用 `getHttpAdapter()` 方法。

```typescript
// ```typescript
const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();

```

```

#### 作为 injectable

要从应用程序上下文中获取 `HttpAdapterHost` 的引用，请使用同样的技术来注入其他现有提供者（例如使用构造函数注入）。

```typescript
// ```typescript
export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}

```

```

> 提示 **注意** `HttpAdapterHost` 来自 `@nestjs/core` 包。

`HttpAdapterHost` **不是**实际的 `HttpAdapter`。要获取实际的 `HttpAdapter` 实例，请访问 `httpAdapter` 属性。

```typescript
// ```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;

```

```

`httpAdapter` 是 underlying 框架使用的实际 HTTP 适配器实例。它是 `ExpressAdapter` 或 `FastifyAdapter`（两者都继承自 `AbstractHttpAdapter`）的一个实例。

适配器对象 expose 了多种有用的方法来与 HTTP 服务器交互。然而，如果您想要访问库实例（例如 Express 实例）直接，请调用 `getInstance()` 方法。

```typescript
// ```typescript
const instance = httpAdapter.getInstance();

```

```

#### 监听事件

要在服务器开始监听 incoming 请求时执行操作，可以订阅 `listen### HTTP 适配器

有时候，您可能想要访问 Nest 应用程序上下文或外部的 underlying HTTP 服务器。

每个本地（平台特定的）HTTP 服务器/库（例如 Express 和 Fastify）实例都被包装在一个 **适配器** 中。适配器被注册为一个全局可用的提供者，可以从应用程序上下文中获取，也可以被注入到其他提供者中。

#### 应用程序上下文外部策略

要从应用程序上下文外部获取 `HttpAdapter` 的引用，请调用 `getHttpAdapter()` 方法。

```typescript
// ```typescript
const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();

```

```

#### 作为 injectable

要从应用程序上下文中获取 `HttpAdapterHost` 的引用，请使用同样的技术来注入其他现有提供者（例如使用构造函数注入）。

```typescript
// ```typescript
export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}

```

```

> 提示 **注意** `HttpAdapterHost` 来自 `@nestjs/core` 包。

`HttpAdapterHost` **不是**实际的 `HttpAdapter`。要获取实际的 `HttpAdapter` 实例，请访问 `httpAdapter` 属性。

```typescript
// ```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;

```

```

`httpAdapter` 是 underlying 框架使用的实际 HTTP 适配器实例。它是 `ExpressAdapter` 或 `FastifyAdapter`（两者都继承自 `AbstractHttpAdapter`）的一个实例。

适配器对象 expose 了多种有用的方法来与 HTTP 服务器交互。然而，如果您想要访问库实例（例如 Express 实例）直接，请调用 `getInstance()` 方法。

```typescript
// ```typescript
const instance = httpAdapter.getInstance();

```

```

#### 监听事件

要在服务器开始监听 incoming 请求时执行操作，可以订阅  流，以下是示例：

```typescript
// ```typescript
this.httpAdapterHost.listen$.subscribe(() =>
  console.log('HTTP server is listening'),
);

```

```

此外，`HttpAdapterHost` 还提供了一个 `listening` 布尔属性，指示服务器当前是否处于活动状态和监听状态：

```typescript
// ```typescript
if (this.httpAdapterHost.listening) {
  console.log('HTTP server is listening');
}

```

```