<!-- 此文件从 content/faq/http-adapter.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:44:51.766Z -->
<!-- 源文件: content/faq/http-adapter.md -->

### HTTP 适配器

有时，您可能需要访问 Nest 应用程序的 underlying HTTP 服务器，或者从外部访问。

每个原生（平台特定的）HTTP 服务器/库（例如 Express 和 Fastify）实例都被包装在一个 **适配器**中。适配器被注册为一个全局可用的提供者，可以从应用程序上下文中检索，也可以被注入到其他提供者中。

#### 外应用程序上下文策略

从应用程序上下文外部获取 `HttpAdapter` 的引用，请调用 `getHttpAdapter()` 方法。

```typescript
const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();

```

#### 作为 injectable

从应用程序上下文中获取 `HttpAdapterHost` 的引用，请使用与其他现有提供者相同的技术（例如使用构造函数注入）。

```typescript
export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}

```

> info **提示** `HttpAdapterHost` 来自 `@nestjs/core` 包。

`HttpAdapterHost` **不是**实际的 `HttpAdapter`。要获取实际的 `HttpAdapter` 实例，请访问 `httpAdapter` 属性。

```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;

```

`httpAdapter` 是 underlying 框架使用的实际 HTTP 适配器实例。它是 `ExpressAdapter` 或 `FastifyAdapter` 的实例（both 类继承自 `AbstractHttpAdapter`）。

适配器对象 expose several useful 方法来与 HTTP 服务器交互。然而，如果您想直接访问库实例（例如 Express 实例），请调用 `getInstance()` 方法。

```typescript
const instance = httpAdapter.getInstance();

```

#### 监听事件

当服务器开始监听 incoming 请求时，可以订阅 `listen### HTTP 适配器

有时，您可能需要访问 Nest 应用程序的 underlying HTTP 服务器，或者从外部访问。

每个原生（平台特定的）HTTP 服务器/库（例如 Express 和 Fastify）实例都被包装在一个 **适配器**中。适配器被注册为一个全局可用的提供者，可以从应用程序上下文中检索，也可以被注入到其他提供者中。

#### 外应用程序上下文策略

从应用程序上下文外部获取 `HttpAdapter` 的引用，请调用 `getHttpAdapter()` 方法。

```typescript
const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();

```

#### 作为 injectable

从应用程序上下文中获取 `HttpAdapterHost` 的引用，请使用与其他现有提供者相同的技术（例如使用构造函数注入）。

```typescript
export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}

```

> info **提示** `HttpAdapterHost` 来自 `@nestjs/core` 包。

`HttpAdapterHost` **不是**实际的 `HttpAdapter`。要获取实际的 `HttpAdapter` 实例，请访问 `httpAdapter` 属性。

```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;

```

`httpAdapter` 是 underlying 框架使用的实际 HTTP 适配器实例。它是 `ExpressAdapter` 或 `FastifyAdapter` 的实例（both 类继承自 `AbstractHttpAdapter`）。

适配器对象 expose several useful 方法来与 HTTP 服务器交互。然而，如果您想直接访问库实例（例如 Express 实例），请调用 `getInstance()` 方法。

```typescript
const instance = httpAdapter.getInstance();

```

#### 监听事件

当服务器开始监听 incoming 请求时，可以订阅  流，以执行某个操作，示例如下：

```typescript
this.httpAdapterHost.listen$.subscribe(() =>
  console.log('HTTP server is listening'),
);

```

此外，`HttpAdapterHost` 还提供一个 `listening` 布尔属性，指示服务器当前是否处于活动状态并监听：

```typescript
if (this.httpAdapterHost.listening) {
  console.log('HTTP server is listening');
}

```