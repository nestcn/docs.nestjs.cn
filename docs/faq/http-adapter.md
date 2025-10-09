### HTTP 适配器

有时您可能需要访问底层 HTTP 服务器，无论是在 Nest 应用程序上下文中还是从外部访问。

每个原生（平台特定）的 HTTP 服务器/库实例（如 Express 和 Fastify）都被封装在一个**适配器**中。该适配器被注册为全局可用的提供者，既可以从应用程序上下文中获取，也可以注入到其他提供者中。

#### 应用程序上下文外部策略

要从应用上下文外部获取 `HttpAdapter` 的引用，请调用 `getHttpAdapter()` 方法。

```typescript
const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();
```

#### 作为可注入项

要从应用上下文内部获取 `HttpAdapterHost` 的引用，可使用与其他现有提供者相同的注入技术（例如通过构造函数注入）。

```typescript
export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}
```

:::info 提示
`HttpAdapterHost` 是从 `@nestjs/core` 包导入的。
:::



`HttpAdapterHost` **并非**真正的 `HttpAdapter`。要获取实际的 `HttpAdapter` 实例，只需访问 `httpAdapter` 属性。

```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;
```

`httpAdapter` 是底层框架使用的 HTTP 适配器实际实例，它可能是 `ExpressAdapter` 或 `FastifyAdapter` 的实例（这两个类都继承自 `AbstractHttpAdapter`）。

适配器对象提供了多个与 HTTP 服务器交互的有用方法。但若需直接访问库实例（如 Express 实例），可调用 `getInstance()` 方法。

```typescript
const instance = httpAdapter.getInstance();
```

#### 监听事件

要在服务器开始监听传入请求时执行操作，您可以订阅 `listen$` 流，如下所示：

```typescript
this.httpAdapterHost.listen$.subscribe(() =>
  console.log('HTTP server is listening'),
);
```

此外，`HttpAdapterHost` 提供了一个布尔属性 `listening`，用于指示服务器当前是否处于活动监听状态：

```typescript
if (this.httpAdapterHost.listening) {
  console.log('HTTP server is listening');
}
```
