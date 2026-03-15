<!-- 此文件从 content/faq/http-adapter.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:45:13.529Z -->
<!-- 源文件: content/faq/http-adapter.md -->

### HTTP 传输适配器

有时，您可能想要访问 Nest 应用程序上下文或外部访问 underlying HTTP 服务器。

每个本地（平台特定的）HTTP 服务器/库（例如 Express 和 Fastify）实例都被包装在一个 **适配器** 中。适配器被注册为全局可用的提供者，可以从应用程序上下文中获取，也可以注入到其他提供者中。

#### Outside application context strategy

从应用程序上下文外部获取 `HttpAdapter` 的引用，请调用 `getHttpAdapter()` 方法。

```typescript
const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();

```

#### 作为 injectable

从应用程序上下文中获取 `HttpAdapterHost` 的引用，请使用同样技术来注入其他现有提供者（例如使用构造函数注入）。

```typescript
export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}

```

> info **提示** `HttpAdapterHost` 是从 `@nestjs/core` 包中导入的。

`HttpAdapterHost` 不是一个实际的 `HttpAdapter`。要获取实际的 `HttpAdapter` 实例，只需访问 `httpAdapter` 属性。

```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;

```

`httpAdapter` 是 underlying 框架中使用的实际 HTTP 传输适配器实例。它是一个 `ExpressAdapter` 或 `FastifyAdapter` 实例（两个类都继承自 `AbstractHttpAdapter`）。

适配器对象公开了几个有用的方法来与 HTTP 服务器交互。然而，如果您想要访问库实例（例如 Express 实例），请调用 `getInstance()` 方法。

```typescript
const instance = httpAdapter.getInstance();

```

#### 监听事件

当服务器开始监听 incoming 请求时，可以订阅 `listen### HTTP 传输适配器

有时，您可能想要访问 Nest 应用程序上下文或外部访问 underlying HTTP 服务器。

每个本地（平台特定的）HTTP 服务器/库（例如 Express 和 Fastify）实例都被包装在一个 **适配器** 中。适配器被注册为全局可用的提供者，可以从应用程序上下文中获取，也可以注入到其他提供者中。

#### Outside application context strategy

从应用程序上下文外部获取 `HttpAdapter` 的引用，请调用 `getHttpAdapter()` 方法。

```typescript
const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();

```

#### 作为 injectable

从应用程序上下文中获取 `HttpAdapterHost` 的引用，请使用同样技术来注入其他现有提供者（例如使用构造函数注入）。

```typescript
export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}

```

> info **提示** `HttpAdapterHost` 是从 `@nestjs/core` 包中导入的。

`HttpAdapterHost` 不是一个实际的 `HttpAdapter`。要获取实际的 `HttpAdapter` 实例，只需访问 `httpAdapter` 属性。

```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;

```

`httpAdapter` 是 underlying 框架中使用的实际 HTTP 传输适配器实例。它是一个 `ExpressAdapter` 或 `FastifyAdapter` 实例（两个类都继承自 `AbstractHttpAdapter`）。

适配器对象公开了几个有用的方法来与 HTTP 服务器交互。然而，如果您想要访问库实例（例如 Express 实例），请调用 `getInstance()` 方法。

```typescript
const instance = httpAdapter.getInstance();

```

#### 监听事件

当服务器开始监听 incoming 请求时，可以订阅  流，以下是示例：

```typescript
this.httpAdapterHost.listen$.subscribe(() =>
  console.log('HTTP server is listening'),
);

```

此外，`HttpAdapterHost` 还提供一个 `listening` 布尔属性，指示服务器当前是否处于活动状态和监听中：

```typescript
if (this.httpAdapterHost.listening) {
  console.log('HTTP server is listening');
}

```

Note: I kept the placeholders (e.g., `HttpAdapter`, `getHttpAdapter()`, etc.) exactly as they were in the source text, and translated the rest of the content according to the guidelines provided.