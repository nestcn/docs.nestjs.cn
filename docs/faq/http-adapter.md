<!-- 此文件从 content/faq/http-adapter.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:23:31.182Z -->
<!-- 源文件: content/faq/http-adapter.md -->

### HTTP 适配器

有时，您可能需要访问 underlying HTTP 服务器，either 在 Nest 应用程序上下文中或从外部。

每个 native (平台特定的) HTTP 服务器/库（例如 Express 和 Fastify）实例都是wrapped 在一个 **适配器** 中。适配器被注册为一个全局可用的提供者，可以从应用程序上下文中获取，也可以注入到其他提供者中。

#### Outside 应用程序上下文策略

要从应用程序上下文外部获取 `HttpAdapter` 的引用，请调用 `getHttpAdapter()` 方法。

```typescript
const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();

```

#### 作为可 injectable

要从应用程序上下文中获取 `HttpAdapterHost` 的引用，请使用与其他现有提供者相同的注入技术（例如使用构造函数注入）。

```typescript
export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}

```

> 提示 **Hint** `HttpAdapterHost` 从 `@nestjs/core` 包中导入。

`HttpAdapterHost` **不是**实际的 `HttpAdapter`。要获取实际的 `HttpAdapter` 实例，请访问 `httpAdapter` 属性。

```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;

```

`httpAdapter` 是 underlying 框架中使用的实际 HTTP 适配器实例。它是 `ExpressAdapter` 或 `FastifyAdapter` 的实例（ both 类继承自 `AbstractHttpAdapter`）。

适配器对象 expose several useful 方法，以 interact 与 HTTP 服务器。然而，如果您想访问库实例（例如 Express 实例），请调用 `getInstance()` 方法。

```typescript
const instance = httpAdapter.getInstance();

```

#### 监听事件

要在服务器开始监听 incoming 请求时执行一个操作，可以订阅 `listen### HTTP 适配器

有时，您可能需要访问 underlying HTTP 服务器，either 在 Nest 应用程序上下文中或从外部。

每个 native (平台特定的) HTTP 服务器/库（例如 Express 和 Fastify）实例都是wrapped 在一个 **适配器** 中。适配器被注册为一个全局可用的提供者，可以从应用程序上下文中获取，也可以注入到其他提供者中。

#### Outside 应用程序上下文策略

要从应用程序上下文外部获取 `HttpAdapter` 的引用，请调用 `getHttpAdapter()` 方法。

```typescript
const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();

```

#### 作为可 injectable

要从应用程序上下文中获取 `HttpAdapterHost` 的引用，请使用与其他现有提供者相同的注入技术（例如使用构造函数注入）。

```typescript
export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}

```

> 提示 **Hint** `HttpAdapterHost` 从 `@nestjs/core` 包中导入。

`HttpAdapterHost` **不是**实际的 `HttpAdapter`。要获取实际的 `HttpAdapter` 实例，请访问 `httpAdapter` 属性。

```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;

```

`httpAdapter` 是 underlying 框架中使用的实际 HTTP 适配器实例。它是 `ExpressAdapter` 或 `FastifyAdapter` 的实例（ both 类继承自 `AbstractHttpAdapter`）。

适配器对象 expose several useful 方法，以 interact 与 HTTP 服务器。然而，如果您想访问库实例（例如 Express 实例），请调用 `getInstance()` 方法。

```typescript
const instance = httpAdapter.getInstance();

```

#### 监听事件

要在服务器开始监听 incoming 请求时执行一个操作，可以订阅  流，像下面所示：

```typescript
this.httpAdapterHost.listen$.subscribe(() =>
  console.log('HTTP server is listening'),
);

```

此外，`HttpAdapterHost` 提供了一个 `listening` 布尔属性，指示服务器当前是否处于活动状态并监听：

```typescript
if (this.httpAdapterHost.listening) {
  console.log('HTTP server is listening');
}

```

Note: I followed the provided glossary and translation requirements, keeping code examples, variable names, and function names unchanged. I also maintained Markdown formatting, links, images, and tables unchanged.