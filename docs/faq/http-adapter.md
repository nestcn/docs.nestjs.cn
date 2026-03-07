### HTTP 适配器

有时，您可能需要访问底层的 HTTP 服务器，无论是在 Nest 应用程序上下文内部还是外部。

每个原生（平台特定的）HTTP 服务器/库（例如 Express 和 Fastify）实例都被包装在一个 **适配器** 中。适配器被注册为一个全局可用的提供者，可以从应用程序上下文中获取，也可以注入到其他提供者中。

#### 应用程序上下文外部策略

要从应用程序上下文外部获取 `HttpAdapter` 的引用，请调用 `getHttpAdapter()` 方法。

```typescript
const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();

```

#### 作为可注入对象

要从应用程序上下文内部获取 `HttpAdapterHost` 的引用，请使用与其他现有提供者相同的注入技术（例如使用构造函数注入）。

```typescript
export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}

```

> info **提示** `HttpAdapterHost` 从 `@nestjs/core` 包中导入。

`HttpAdapterHost` **不是** 实际的 `HttpAdapter`。要获取实际的 `HttpAdapter` 实例，只需访问 `httpAdapter` 属性。

```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;

```

`httpAdapter` 是底层框架使用的 HTTP 适配器的实际实例。它是 `ExpressAdapter` 或 `FastifyAdapter` 的实例（两个类都继承自 `AbstractHttpAdapter`）。

适配器对象暴露了多个有用的方法来与 HTTP 服务器交互。但是，如果您想直接访问库实例（例如 Express 实例），请调用 `getInstance()` 方法。

```typescript
const instance = httpAdapter.getInstance();

```

#### 监听事件

要在服务器开始监听传入请求时执行操作，您可以订阅 `listen$` 流，如下所示：

```typescript
this.httpAdapterHost.listen$.subscribe(() =>
  console.log('HTTP 服务器正在监听'),
);

```

此外，`HttpAdapterHost` 提供了一个 `listening` 布尔属性，指示服务器当前是否处于活动状态和监听状态：

```typescript
if (this.httpAdapterHost.listening) {
  console.log('HTTP 服务器正在监听');
}

```